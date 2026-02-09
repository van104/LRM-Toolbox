<template>
    <div class="tool-page">
        <header class="tool-header">
            <div class="header-left">
                <el-button text @click="goBack"><el-icon>
                        <ArrowLeft />
                    </el-icon><span>返回</span></el-button>
            </div>
            <div class="header-center">
                <h1 class="tool-title">PDF 灰度化</h1>
                <span class="tool-subtitle">PDF to Grayscale</span>
            </div>
            <div class="header-right"></div>
        </header>

        <main class="tool-content">
            <div class="layout-container">
                <div class="workbench glass-card">
                    <div v-if="!pdfFile" class="upload-placeholder" @click="triggerUpload">
                        <el-icon class="upload-icon">
                            <Moon />
                        </el-icon>
                        <h3>选择 PDF 转换为灰度</h3>
                        <p class="hint">将彩色 PDF 转为黑白/灰度，节省打印耗材</p>
                    </div>

                    <div v-else class="workspace">
                        <div class="file-info">
                            <el-icon>
                                <Document />
                            </el-icon>
                            <span>{{ pdfFile.name }} ({{ totalPages }} 页)</span>
                            <el-button text type="danger" @click="clearFile">移除</el-button>
                        </div>

                        <div class="preview-section">
                            <div class="preview-box">
                                <div class="preview-label">原始</div>
                                <canvas ref="originalCanvas"></canvas>
                            </div>
                            <el-icon class="arrow-icon">
                                <Right />
                            </el-icon>
                            <div class="preview-box">
                                <div class="preview-label">灰度预览</div>
                                <canvas ref="grayscaleCanvas"></canvas>
                            </div>
                        </div>

                        <div class="options-section">
                            <div class="option-item">
                                <span class="label">转换模式</span>
                                <el-radio-group v-model="mode">
                                    <el-radio-button value="grayscale">灰度</el-radio-button>
                                    <el-radio-button value="blackwhite">纯黑白</el-radio-button>
                                </el-radio-group>
                            </div>
                            <div v-if="mode === 'blackwhite'" class="option-item">
                                <span class="label">阈值 ({{ threshold }})</span>
                                <el-slider v-model="threshold" :min="0" :max="255" @change="updatePreview" />
                            </div>
                        </div>

                        <div v-if="processing" class="progress-section">
                            <el-progress :percentage="Math.round(currentPage / totalPages * 100)" />
                            <span class="progress-text">处理中... {{ currentPage }}/{{ totalPages }}</span>
                        </div>

                        <el-button
type="primary" size="large" class="action-btn" :loading="processing"
                            @click="convertToGrayscale">
                            转换并下载
                        </el-button>
                    </div>

                    <input ref="fileRef" type="file" hidden accept=".pdf" @change="handleUpload" />
                </div>
            </div>
        </main>
        <footer class="footer">© 2026 LRM工具箱 - PDF 灰度化</footer>
    </div>
</template>

<script setup>
import { ref, shallowRef, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Moon, Document, Right } from '@element-plus/icons-vue'
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
const currentPage = ref(0)
const processing = ref(false)

const originalCanvas = ref(null)
const grayscaleCanvas = ref(null)

const mode = ref('grayscale')
const threshold = ref(128)

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
}

const loadPdf = async (file) => {
    try {
        pdfFile.value = file
        const buffer = await file.arrayBuffer()
        pdfBytes.value = new Uint8Array(buffer)

        const loadingTask = pdfjsLib.getDocument(pdfBytes.value.slice())
        pdfDocProxy.value = await loadingTask.promise
        totalPages.value = pdfDocProxy.value.numPages

        nextTick(() => renderPreview())
    } catch (e) {
        console.error(e)
        ElMessage.error('加载 PDF 失败')
    }
}

const renderPreview = async () => {
    if (!pdfDocProxy.value || !originalCanvas.value) return

    const page = await pdfDocProxy.value.getPage(1)
    const viewport = page.getViewport({ scale: 0.5 })

    
    originalCanvas.value.width = viewport.width
    originalCanvas.value.height = viewport.height
    await page.render({
        canvasContext: originalCanvas.value.getContext('2d'),
        viewport
    }).promise

    updatePreview()
}

const updatePreview = () => {
    if (!originalCanvas.value || !grayscaleCanvas.value) return

    const origCtx = originalCanvas.value.getContext('2d')
    const grayCtx = grayscaleCanvas.value.getContext('2d')

    grayscaleCanvas.value.width = originalCanvas.value.width
    grayscaleCanvas.value.height = originalCanvas.value.height

    const imageData = origCtx.getImageData(0, 0, originalCanvas.value.width, originalCanvas.value.height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]

        if (mode.value === 'blackwhite') {
            const bw = gray > threshold.value ? 255 : 0
            data[i] = data[i + 1] = data[i + 2] = bw
        } else {
            data[i] = data[i + 1] = data[i + 2] = gray
        }
    }

    grayCtx.putImageData(imageData, 0, 0)
}

watch(mode, updatePreview)

const convertToGrayscale = async () => {
    if (!pdfDocProxy.value) return

    processing.value = true
    currentPage.value = 0

    try {
        const newPdf = await PDFDocument.create()
        const scale = 2 

        for (let pageNum = 1; pageNum <= totalPages.value; pageNum++) {
            currentPage.value = pageNum

            const page = await pdfDocProxy.value.getPage(pageNum)
            const viewport = page.getViewport({ scale })

            const canvas = document.createElement('canvas')
            canvas.width = viewport.width
            canvas.height = viewport.height
            const ctx = canvas.getContext('2d')

            await page.render({ canvasContext: ctx, viewport }).promise

            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const data = imageData.data

            for (let i = 0; i < data.length; i += 4) {
                const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]

                if (mode.value === 'blackwhite') {
                    const bw = gray > threshold.value ? 255 : 0
                    data[i] = data[i + 1] = data[i + 2] = bw
                } else {
                    data[i] = data[i + 1] = data[i + 2] = gray
                }
            }

            ctx.putImageData(imageData, 0, 0)

            
            const jpegData = canvas.toDataURL('image/jpeg', 0.92)
            const jpegBytes = await fetch(jpegData).then(r => r.arrayBuffer())
            const jpgImage = await newPdf.embedJpg(jpegBytes)

            const origViewport = page.getViewport({ scale: 1 })
            const newPage = newPdf.addPage([origViewport.width, origViewport.height])
            newPage.drawImage(jpgImage, {
                x: 0, y: 0,
                width: origViewport.width,
                height: origViewport.height
            })
        }

        const pdfBytesOut = await newPdf.save()
        const blob = new Blob([pdfBytesOut], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `grayscale_${pdfFile.value.name}`
        a.click()
        URL.revokeObjectURL(url)

        ElMessage.success('转换成功')
    } catch (e) {
        console.error(e)
        ElMessage.error('转换失败: ' + e.message)
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
    max-width: 700px;
}

.workbench {
    padding: 2rem;
    border-radius: 16px;
    min-height: 400px;
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

.preview-section {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.preview-box {
    text-align: center;
}

.preview-label {
    font-size: 0.85rem;
    font-weight: 500;
    color: #64748b;
    margin-bottom: 0.5rem;
}

.preview-box canvas {
    max-width: 200px;
    max-height: 280px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    background: #fff;
}

.arrow-icon {
    font-size: 1.5rem;
    color: #94a3b8;
}

.options-section {
    margin-bottom: 1.5rem;
}

.option-item {
    margin-bottom: 1rem;
}

.option-item .label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    font-weight: 500;
    color: #334155;
}

.progress-section {
    text-align: center;
    margin-bottom: 1rem;
}

.progress-text {
    font-size: 0.85rem;
    color: #64748b;
    margin-top: 0.5rem;
    display: block;
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
