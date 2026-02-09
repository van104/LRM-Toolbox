<template>
    <div class="tool-page">
        <header class="tool-header">
            <div class="header-left">
                <el-button text @click="goBack"><el-icon>
                        <ArrowLeft />
                    </el-icon><span>返回</span></el-button>
            </div>
            <div class="header-center">
                <h1 class="tool-title">PDF 页面裁剪</h1>
                <span class="tool-subtitle">PDF Crop</span>
            </div>
            <div class="header-right"></div>
        </header>

        <main class="tool-content">
            <div class="layout-container">
                <div class="workbench glass-card">
                    <div v-if="!pdfFile" class="upload-placeholder" @click="triggerUpload">
                        <el-icon class="upload-icon">
                            <Crop />
                        </el-icon>
                        <h3>选择 PDF 裁剪页面</h3>
                        <p class="hint">可视化框选裁剪区域，去除多余白边</p>
                    </div>

                    <div v-else class="workspace">
                        <div class="file-info">
                            <el-icon>
                                <Document />
                            </el-icon>
                            <span>{{ pdfFile.name }} ({{ totalPages }} 页)</span>
                            <el-button text type="danger" @click="clearFile">移除</el-button>
                        </div>

                        <div class="main-area">
                            <div class="preview-section">
                                <div class="page-nav">
                                    <el-button :disabled="currentPage <= 1" @click="currentPage--">上一页</el-button>
                                    <span>{{ currentPage }} / {{ totalPages }}</span>
                                    <el-button
:disabled="currentPage >= totalPages"
                                        @click="currentPage++">下一页</el-button>
                                </div>

                                <div ref="previewContainer" class="pdf-preview">
                                    <div ref="canvasWrapper" class="canvas-wrapper">
                                        <canvas ref="pdfCanvas"></canvas>
                                        
                                        <div
v-if="showCropIndicators" class="crop-border crop-left"
                                            :style="{ width: cropBox.left + 'px' }"></div>
                                        <div
v-if="showCropIndicators" class="crop-border crop-right"
                                            :style="{ width: cropBox.right + 'px' }"></div>
                                        <div
v-if="showCropIndicators" class="crop-border crop-top"
                                            :style="{ height: cropBox.top + 'px' }"></div>
                                        <div
v-if="showCropIndicators" class="crop-border crop-bottom"
                                            :style="{ height: cropBox.bottom + 'px' }"></div>
                                    </div>
                                </div>
                            </div>

                            <div class="settings-panel glass-card">
                                <h4>裁剪设置</h4>

                                <div class="crop-inputs">
                                    <div class="input-group">
                                        <label>左边距 (pt)</label>
                                        <el-input-number v-model="cropMargins.left" :min="0" :max="300" size="small" />
                                    </div>
                                    <div class="input-group">
                                        <label>右边距 (pt)</label>
                                        <el-input-number v-model="cropMargins.right" :min="0" :max="300" size="small" />
                                    </div>
                                    <div class="input-group">
                                        <label>上边距 (pt)</label>
                                        <el-input-number v-model="cropMargins.top" :min="0" :max="300" size="small" />
                                    </div>
                                    <div class="input-group">
                                        <label>下边距 (pt)</label>
                                        <el-input-number
v-model="cropMargins.bottom" :min="0" :max="300"
                                            size="small" />
                                    </div>
                                </div>

                                <div class="apply-scope">
                                    <label>应用范围</label>
                                    <el-radio-group v-model="applyScope">
                                        <el-radio value="current">仅当前页</el-radio>
                                        <el-radio value="all">所有页面</el-radio>
                                    </el-radio-group>
                                </div>

                                <el-button style="margin-top: 1rem;" @click="resetCrop">重置裁剪</el-button>
                            </div>
                        </div>

                        <el-button
type="primary" size="large" class="action-btn" :loading="processing"
                            @click="applyCrop">
                            裁剪并下载
                        </el-button>
                    </div>

                    <input ref="fileRef" type="file" hidden accept=".pdf" @change="handleUpload" />
                </div>
            </div>
        </main>
        <footer class="footer">© 2026 LRM工具箱 - PDF 页面裁剪</footer>
    </div>
</template>

<script setup>
import { ref, reactive, shallowRef, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Crop, Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import pdfjsLib from '@/utils/pdf'

import { PDFDocument } from 'pdf-lib'



const router = useRouter()
const goBack = () => router.back()

const fileRef = ref(null)
const pdfFile = ref(null)
const pdfBytes = ref(null)
const pdfDocProxy = shallowRef(null)
const totalPages = ref(0)
const currentPage = ref(1)
const processing = ref(false)

const pdfCanvas = ref(null)
const previewContainer = ref(null)
const canvasWrapper = ref(null)

const cropMargins = reactive({ left: 0, right: 0, top: 0, bottom: 0 })
const applyScope = ref('all')
const pageSize = reactive({ width: 0, height: 0 })
let canvasScale = 1

const cropBox = computed(() => {
    if (pageSize.width === 0) return { left: 0, right: 0, top: 0, bottom: 0 }
    return {
        left: cropMargins.left * canvasScale,
        top: cropMargins.top * canvasScale,
        right: cropMargins.right * canvasScale,
        bottom: cropMargins.bottom * canvasScale
    }
})

const showCropIndicators = computed(() => {
    return pdfFile.value && (cropMargins.left > 0 || cropMargins.right > 0 || cropMargins.top > 0 || cropMargins.bottom > 0)
})

const triggerUpload = () => fileRef.value?.click()

const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (file) await loadPdf(file)
}

const clearFile = () => {
    pdfFile.value = null
    pdfBytes.value = null
    pdfDocProxy.value = null
    totalPages.value = 0
    currentPage.value = 1
    resetCrop()
}

const resetCrop = () => {
    cropMargins.left = 0
    cropMargins.right = 0
    cropMargins.top = 0
    cropMargins.bottom = 0
}

const loadPdf = async (file) => {
    try {
        pdfFile.value = file
        const buffer = await file.arrayBuffer()
        pdfBytes.value = new Uint8Array(buffer)

        const loadingTask = pdfjsLib.getDocument(pdfBytes.value.slice())
        pdfDocProxy.value = await loadingTask.promise
        totalPages.value = pdfDocProxy.value.numPages

        nextTick(() => renderPage())
    } catch (e) {
        console.error(e)
        ElMessage.error('加载 PDF 失败')
    }
}

const renderPage = async () => {
    if (!pdfDocProxy.value || !pdfCanvas.value) return

    const page = await pdfDocProxy.value.getPage(currentPage.value)
    const viewport = page.getViewport({ scale: 1 })

    pageSize.width = viewport.width
    pageSize.height = viewport.height

    
    const container = previewContainer.value
    const maxWidth = container.clientWidth - 20
    const maxHeight = 500
    canvasScale = Math.min(maxWidth / viewport.width, maxHeight / viewport.height)

    const scaledViewport = page.getViewport({ scale: canvasScale })
    pdfCanvas.value.width = scaledViewport.width
    pdfCanvas.value.height = scaledViewport.height

    await page.render({
        canvasContext: pdfCanvas.value.getContext('2d'),
        viewport: scaledViewport
    }).promise
}

watch(currentPage, renderPage)

const applyCrop = async () => {
    if (!pdfBytes.value) return

    processing.value = true
    try {
        const pdfDoc = await PDFDocument.load(pdfBytes.value)
        const pages = pdfDoc.getPages()

        const pagesToCrop = applyScope.value === 'all' ? pages : [pages[currentPage.value - 1]]

        for (const page of pagesToCrop) {
            const { width, height } = page.getSize()

            
            page.setCropBox(
                cropMargins.left,
                cropMargins.bottom,
                width - cropMargins.left - cropMargins.right,
                height - cropMargins.top - cropMargins.bottom
            )
        }

        const modifiedBytes = await pdfDoc.save()
        const blob = new Blob([modifiedBytes], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `cropped_${pdfFile.value.name}`
        a.click()
        URL.revokeObjectURL(url)

        ElMessage.success('裁剪成功')
    } catch (e) {
        console.error(e)
        ElMessage.error('裁剪失败: ' + e.message)
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
    max-width: 1000px;
}

.workbench {
    padding: 2rem;
    border-radius: 16px;
    min-height: 500px;
}

.upload-placeholder {
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
    height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    color: #64748b;
}

.upload-placeholder:hover {
    border-color: #3b82f6;
    background: #eff6ff;
    color: #3b82f6;
}

.upload-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
}

.hint {
    font-size: 0.85rem;
    margin-top: 0.5rem;
    opacity: 0.7;
}

.file-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #f1f5f9;
    padding: 0.75rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
}

.file-info .el-icon {
    font-size: 1.5rem;
    color: #3b82f6;
}

.file-info span {
    flex: 1;
    font-weight: 500;
}

.main-area {
    display: flex;
    gap: 1.5rem;
}

.preview-section {
    flex: 2;
}

.page-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.pdf-preview {
    background: #e2e8f0;
    border-radius: 8px;
    padding: 10px;
    position: relative;
    overflow: hidden;
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.canvas-wrapper {
    position: relative;
    display: inline-block;
}

.canvas-wrapper canvas {
    display: block;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}


.crop-border {
    position: absolute;
    background: rgba(239, 68, 68, 0.3);
    pointer-events: none;
    z-index: 2;
}

.crop-border.crop-left {
    left: 0;
    top: 0;
    bottom: 0;
    border-right: 2px dashed #ef4444;
}

.crop-border.crop-right {
    right: 0;
    top: 0;
    bottom: 0;
    border-left: 2px dashed #ef4444;
}

.crop-border.crop-top {
    left: 0;
    right: 0;
    top: 0;
    border-bottom: 2px dashed #ef4444;
}

.crop-border.crop-bottom {
    left: 0;
    right: 0;
    bottom: 0;
    border-top: 2px dashed #ef4444;
}

.settings-panel {
    flex: 1;
    padding: 1rem;
    min-width: 250px;
    border-radius: 12px;
}

.settings-panel h4 {
    margin: 0 0 1rem;
    font-size: 1rem;
}

.crop-inputs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
}

.input-group {
    margin-bottom: 0.25rem;
}

.input-group label {
    display: block;
    font-size: 0.8rem;
    color: #64748b;
    margin-bottom: 0.25rem;
}

.apply-scope {
    margin-top: 1rem;
}

.apply-scope label {
    display: block;
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

.action-btn {
    width: 100%;
    margin-top: 1.5rem;
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
