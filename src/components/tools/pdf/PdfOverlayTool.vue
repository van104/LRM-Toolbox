<template>
    <div class="tool-page">
        <header class="tool-header">
            <div class="header-left">
                <el-button text @click="goBack"><el-icon>
                        <ArrowLeft />
                    </el-icon><span>返回</span></el-button>
            </div>
            <div class="header-center">
                <h1 class="tool-title">PDF 叠加覆盖</h1>
                <span class="tool-subtitle">PDF Overlay</span>
            </div>
            <div class="header-right"></div>
        </header>

        <main class="tool-content">
            <div class="layout-container">
                <div class="workbench glass-card">
                    <div class="upload-section">
                        <div class="upload-box" :class="{ active: basePdf }" @click="triggerBaseUpload">
                            <el-icon class="upload-icon">
                                <Document />
                            </el-icon>
                            <h4>{{ basePdf ? basePdf.name : '选择基础 PDF' }}</h4>
                            <p class="hint">作为底层文档</p>
                            <el-button v-if="basePdf" text type="danger" @click.stop="clearBase">移除</el-button>
                        </div>

                        <div class="overlay-arrow">
                            <el-icon>
                                <Plus />
                            </el-icon>
                        </div>

                        <div class="upload-box" :class="{ active: overlayPdf }" @click="triggerOverlayUpload">
                            <el-icon class="upload-icon">
                                <CopyDocument />
                            </el-icon>
                            <h4>{{ overlayPdf ? overlayPdf.name : '选择叠加 PDF' }}</h4>
                            <p class="hint">作为水印/印章图层</p>
                            <el-button v-if="overlayPdf" text type="danger" @click.stop="clearOverlay">移除</el-button>
                        </div>
                    </div>

                    <div v-if="basePdf && overlayPdf" class="settings-section glass-card">
                        <h4>叠加设置</h4>

                        <div class="settings-grid">
                            <div class="setting-item">
                                <label>叠加模式</label>
                                <el-radio-group v-model="overlayMode">
                                    <el-radio value="foreground">前景 (在上层)</el-radio>
                                    <el-radio value="background">背景 (在下层)</el-radio>
                                </el-radio-group>
                            </div>

                            <div class="setting-item">
                                <label>应用范围</label>
                                <el-radio-group v-model="applyScope">
                                    <el-radio value="all">所有页面</el-radio>
                                    <el-radio value="first">仅第一页</el-radio>
                                    <el-radio value="custom">自定义</el-radio>
                                </el-radio-group>
                            </div>

                            <div v-if="applyScope === 'custom'" class="setting-item">
                                <label>页码范围 (如: 1,3,5-10)</label>
                                <el-input v-model="customPages" placeholder="1,3,5-10" />
                            </div>

                            <div class="setting-item">
                                <label>透明度</label>
                                <el-slider v-model="opacity" :min="10" :max="100"
                                    :format-tooltip="(val) => val + '%'" />
                            </div>
                        </div>
                    </div>

                    <el-button v-if="basePdf && overlayPdf" type="primary" size="large" class="action-btn"
                        :loading="processing" @click="mergeOverlay">
                        合并并下载
                    </el-button>

                    <input type="file" ref="baseFileRef" hidden accept=".pdf" @change="handleBaseUpload" />
                    <input type="file" ref="overlayFileRef" hidden accept=".pdf" @change="handleOverlayUpload" />
                </div>
            </div>
        </main>
        <footer class="footer">© 2026 LRM工具箱 - PDF 叠加覆盖</footer>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Document, CopyDocument, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { PDFDocument } from 'pdf-lib'

const router = useRouter()
const goBack = () => router.back()

const baseFileRef = ref(null)
const overlayFileRef = ref(null)
const basePdf = ref(null)
const overlayPdf = ref(null)
const basePdfBytes = ref(null)
const overlayPdfBytes = ref(null)
const processing = ref(false)

const overlayMode = ref('foreground')
const applyScope = ref('all')
const customPages = ref('')
const opacity = ref(100)

const triggerBaseUpload = () => {
    if (!basePdf.value) baseFileRef.value?.click()
}

const triggerOverlayUpload = () => {
    if (!overlayPdf.value) overlayFileRef.value?.click()
}

const handleBaseUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
        basePdf.value = file
        basePdfBytes.value = new Uint8Array(await file.arrayBuffer())
    }
}

const handleOverlayUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
        overlayPdf.value = file
        overlayPdfBytes.value = new Uint8Array(await file.arrayBuffer())
    }
}

const clearBase = () => {
    basePdf.value = null
    basePdfBytes.value = null
}

const clearOverlay = () => {
    overlayPdf.value = null
    overlayPdfBytes.value = null
}

const parsePageRange = (rangeStr, totalPages) => {
    const pages = new Set()
    const parts = rangeStr.split(',').map(p => p.trim())

    for (const part of parts) {
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(n => parseInt(n.trim()))
            for (let i = start; i <= end && i <= totalPages; i++) {
                if (i >= 1) pages.add(i)
            }
        } else {
            const num = parseInt(part)
            if (num >= 1 && num <= totalPages) pages.add(num)
        }
    }

    return Array.from(pages).sort((a, b) => a - b)
}

const mergeOverlay = async () => {
    if (!basePdfBytes.value || !overlayPdfBytes.value) return

    processing.value = true
    try {
        const basePdfDoc = await PDFDocument.load(basePdfBytes.value)
        const overlayPdfDoc = await PDFDocument.load(overlayPdfBytes.value)

        const basePages = basePdfDoc.getPages()
        const overlayPages = overlayPdfDoc.getPages()

        if (overlayPages.length === 0) {
            throw new Error('叠加 PDF 没有页面')
        }

        
        let targetPages
        if (applyScope.value === 'all') {
            targetPages = basePages.map((_, i) => i + 1)
        } else if (applyScope.value === 'first') {
            targetPages = [1]
        } else {
            targetPages = parsePageRange(customPages.value, basePages.length)
        }

        
        const [embeddedOverlay] = await basePdfDoc.embedPdf(overlayPdfDoc, [0])

        for (const pageNum of targetPages) {
            const page = basePages[pageNum - 1]
            if (!page) continue

            const { width, height } = page.getSize()
            const overlayDims = embeddedOverlay.scale(1)

            
            const x = (width - overlayDims.width) / 2
            const y = (height - overlayDims.height) / 2

            if (overlayMode.value === 'background') {
                
                
                
                page.drawPage(embeddedOverlay, {
                    x: 0,
                    y: 0,
                    width: width,
                    height: height,
                    opacity: opacity.value / 100
                })
            } else {
                
                page.drawPage(embeddedOverlay, {
                    x: 0,
                    y: 0,
                    width: width,
                    height: height,
                    opacity: opacity.value / 100
                })
            }
        }

        const modifiedBytes = await basePdfDoc.save()
        const blob = new Blob([modifiedBytes], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `overlay_${basePdf.value.name}`
        a.click()
        URL.revokeObjectURL(url)

        ElMessage.success('叠加完成')
    } catch (e) {
        console.error(e)
        ElMessage.error('叠加失败: ' + e.message)
    } finally {
        processing.value = false
    }
}
</script>

<style scoped>
.tool-page {
    min-height: 100vh;
    background: #f8fafc;
    display: flex;
    flex-direction: column;
    color: #1e293b;
}

.tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.header-left,
.header-right {
    width: 100px;
    display: flex;
    align-items: center;
}

.header-center {
    flex: 1;
    text-align: center;
}

.tool-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
}

.tool-subtitle {
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
}

.tool-content {
    flex: 1;
    padding: 2rem;
    display: flex;
    justify-content: center;
}

.layout-container {
    width: 100%;
    max-width: 800px;
}

.workbench {
    padding: 2rem;
    border-radius: 16px;
}

.upload-section {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    justify-content: center;
    margin-bottom: 2rem;
}

.upload-box {
    flex: 1;
    max-width: 280px;
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
    padding: 2rem 1.5rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
}

.upload-box:hover {
    border-color: #3b82f6;
    background: #eff6ff;
}

.upload-box.active {
    border-color: #10b981;
    background: #ecfdf5;
    cursor: default;
}

.upload-box h4 {
    margin: 0.5rem 0 0.25rem;
    font-size: 0.95rem;
    word-break: break-all;
}

.upload-icon {
    font-size: 2.5rem;
    color: #64748b;
}

.upload-box.active .upload-icon {
    color: #10b981;
}

.hint {
    font-size: 0.8rem;
    color: #94a3b8;
    margin: 0;
}

.overlay-arrow {
    font-size: 1.5rem;
    color: #64748b;
}

.settings-section {
    padding: 1.5rem;
    border-radius: 12px;
    margin-bottom: 1.5rem;
}

.settings-section h4 {
    margin: 0 0 1rem;
    font-size: 1rem;
}

.settings-grid {
    display: grid;
    gap: 1rem;
}

.setting-item label {
    display: block;
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
}

.action-btn {
    width: 100%;
}

.glass-card {
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.05);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
}
</style>
