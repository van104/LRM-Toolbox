<template>
    <div class="tool-page">
        <header class="tool-header">
            <div class="header-left">
                <el-button text @click="goBack"><el-icon>
                        <ArrowLeft />
                    </el-icon><span>返回</span></el-button>
            </div>
            <div class="header-center">
                <h1 class="tool-title">PDF 电子签名</h1>
                <span class="tool-subtitle">PDF Signature</span>
            </div>
            <div class="header-right"></div>
        </header>

        <main class="tool-content">
            <div class="layout-container">
                <div class="workbench glass-card">
                    <div v-if="!pdfFile" class="upload-placeholder" @click="triggerUpload">
                        <el-icon class="upload-icon">
                            <EditPen />
                        </el-icon>
                        <h3>选择 PDF 添加签名</h3>
                        <p class="hint">手写绘制或上传签名图片</p>
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
                                    <el-button :disabled="currentPage >= totalPages"
                                        @click="currentPage++">下一页</el-button>
                                </div>
                                <div class="pdf-preview" ref="previewContainer" @click="handlePreviewClick">
                                    <canvas ref="pdfCanvas"></canvas>
                                    <div v-if="signaturePosition" class="signature-overlay"
                                        :style="{ left: signaturePosition.x + 'px', top: signaturePosition.y + 'px' }">
                                        <img :src="signatureDataUrl" alt="签名" />
                                        <el-button class="remove-btn" type="danger" size="small" circle
                                            @click.stop="removeSignature">
                                            <el-icon>
                                                <Close />
                                            </el-icon>
                                        </el-button>
                                    </div>
                                </div>
                            </div>

                            
                            <div class="signature-panel glass-card">
                                <h4>签名区域</h4>
                                <el-tabs v-model="signatureTab">
                                    <el-tab-pane label="手写绘制" name="draw">
                                        <div class="draw-area">
                                            <canvas ref="drawCanvas" @mousedown="startDraw" @mousemove="draw"
                                                @mouseup="endDraw" @mouseleave="endDraw" @touchstart="startDrawTouch"
                                                @touchmove="drawTouch" @touchend="endDraw"></canvas>
                                            <div class="draw-actions">
                                                <el-button size="small" @click="clearDraw">清除</el-button>
                                                <el-button size="small" type="primary"
                                                    @click="confirmDraw">确认签名</el-button>
                                            </div>
                                        </div>
                                    </el-tab-pane>
                                    <el-tab-pane label="上传图片" name="upload">
                                        <div class="upload-area" @click="triggerSignatureUpload">
                                            <el-icon>
                                                <Upload />
                                            </el-icon>
                                            <span>点击上传签名图片</span>
                                            <input type="file" ref="signatureFileRef" hidden accept="image/*"
                                                @change="handleSignatureUpload" />
                                        </div>
                                    </el-tab-pane>
                                </el-tabs>

                                <div v-if="signatureDataUrl" class="signature-preview">
                                    <p>当前签名：</p>
                                    <img :src="signatureDataUrl" alt="签名预览" />
                                    <p class="hint">点击左侧 PDF 预览图放置签名</p>
                                </div>
                            </div>
                        </div>

                        <el-button type="primary" size="large" class="action-btn" :loading="processing"
                            :disabled="!signaturePosition || !signatureDataUrl" @click="applySignature">
                            应用签名并下载
                        </el-button>
                    </div>

                    <input type="file" ref="fileRef" hidden accept=".pdf" @change="handleUpload" />
                </div>
            </div>
        </main>
        <footer class="footer">© 2026 LRM工具箱 - PDF 电子签名</footer>
    </div>
</template>

<script setup>
import { ref, shallowRef, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, EditPen, Document, Upload, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import pdfjsLib from '@/utils/pdf'
import { PDFDocument } from 'pdf-lib'



const router = useRouter()
const goBack = () => router.back()

const fileRef = ref(null)
const signatureFileRef = ref(null)
const pdfFile = ref(null)
const pdfBytes = ref(null)
const pdfDocProxy = shallowRef(null)
const totalPages = ref(0)
const currentPage = ref(1)
const processing = ref(false)

const pdfCanvas = ref(null)
const drawCanvas = ref(null)
const previewContainer = ref(null)

const signatureTab = ref('draw')
const signatureDataUrl = ref('')
const signaturePosition = ref(null)

let isDrawing = false
let drawCtx = null
let canvasScale = 1

const triggerUpload = () => fileRef.value?.click()
const triggerSignatureUpload = () => signatureFileRef.value?.click()

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
    signaturePosition.value = null
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

watch(currentPage, () => {
    signaturePosition.value = null
    renderPage()
})


const initDrawCanvas = () => {
    if (drawCanvas.value && !drawCtx) {
        drawCanvas.value.width = 300
        drawCanvas.value.height = 150
        drawCtx = drawCanvas.value.getContext('2d')
        drawCtx.strokeStyle = '#1e293b'
        drawCtx.lineWidth = 2
        drawCtx.lineCap = 'round'
    }
}


watch(drawCanvas, (newVal) => {
    if (newVal) {
        nextTick(initDrawCanvas)
    }
})


watch(pdfFile, (newVal) => {
    if (newVal) {
        nextTick(() => {
            setTimeout(initDrawCanvas, 100)
        })
    }
})

const startDraw = (e) => {
    initDrawCanvas() 
    if (!drawCtx) return
    isDrawing = true
    drawCtx.beginPath()
    drawCtx.moveTo(e.offsetX, e.offsetY)
}

const draw = (e) => {
    if (!isDrawing || !drawCtx) return
    drawCtx.lineTo(e.offsetX, e.offsetY)
    drawCtx.stroke()
}

const endDraw = () => {
    isDrawing = false
}

const startDrawTouch = (e) => {
    initDrawCanvas()
    if (!drawCtx || !drawCanvas.value) return
    e.preventDefault()
    const touch = e.touches[0]
    const rect = drawCanvas.value.getBoundingClientRect()
    isDrawing = true
    drawCtx.beginPath()
    drawCtx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top)
}

const drawTouch = (e) => {
    if (!isDrawing || !drawCtx || !drawCanvas.value) return
    e.preventDefault()
    const touch = e.touches[0]
    const rect = drawCanvas.value.getBoundingClientRect()
    drawCtx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top)
    drawCtx.stroke()
}

const clearDraw = () => {
    if (!drawCtx || !drawCanvas.value) return
    drawCtx.clearRect(0, 0, drawCanvas.value.width, drawCanvas.value.height)
    signatureDataUrl.value = ''
}

const confirmDraw = () => {
    if (!drawCanvas.value) return
    signatureDataUrl.value = drawCanvas.value.toDataURL('image/png')
    ElMessage.success('签名已确认，请在 PDF 上点击放置位置')
}

const handleSignatureUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
        signatureDataUrl.value = evt.target.result
        ElMessage.success('签名图片已加载，请在 PDF 上点击放置位置')
    }
    reader.readAsDataURL(file)
}

const handlePreviewClick = (e) => {
    if (!signatureDataUrl.value) {
        ElMessage.warning('请先创建或上传签名')
        return
    }

    const rect = pdfCanvas.value.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    signaturePosition.value = { x, y, page: currentPage.value }
}

const removeSignature = () => {
    signaturePosition.value = null
}

const applySignature = async () => {
    if (!pdfBytes.value || !signatureDataUrl.value || !signaturePosition.value) return

    processing.value = true
    try {
        const pdfDoc = await PDFDocument.load(pdfBytes.value)
        const pngImageBytes = await fetch(signatureDataUrl.value).then(res => res.arrayBuffer())
        const pngImage = await pdfDoc.embedPng(pngImageBytes)

        const page = pdfDoc.getPages()[signaturePosition.value.page - 1]
        const { width, height } = page.getSize()

        
        const sigWidth = 100
        const sigHeight = 50
        const pdfX = (signaturePosition.value.x / canvasScale)
        const pdfY = height - (signaturePosition.value.y / canvasScale) - sigHeight

        page.drawImage(pngImage, {
            x: pdfX,
            y: pdfY,
            width: sigWidth,
            height: sigHeight
        })

        const modifiedPdfBytes = await pdfDoc.save()
        const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `signed_${pdfFile.value.name}`
        a.click()
        URL.revokeObjectURL(url)

        ElMessage.success('签名应用成功')
    } catch (e) {
        console.error(e)
        ElMessage.error('应用签名失败: ' + e.message)
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
    max-width: 1100px;
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
    min-height: 400px;
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
    cursor: crosshair;
}

.pdf-preview canvas {
    max-width: 100%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.signature-overlay {
    position: absolute;
    border: 2px dashed #3b82f6;
    padding: 4px;
    background: rgba(255, 255, 255, 0.9);
    cursor: move;
}

.signature-overlay img {
    max-width: 100px;
    max-height: 50px;
    display: block;
}

.remove-btn {
    position: absolute;
    top: -10px;
    right: -10px;
}

.signature-panel {
    flex: 1;
    padding: 1rem;
    min-width: 320px;
}

.signature-panel h4 {
    margin: 0 0 1rem;
    font-size: 1rem;
}

.draw-area {
    text-align: center;
}

.draw-area canvas {
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    background: #fff;
    touch-action: none;
}

.draw-actions {
    margin-top: 0.75rem;
    display: flex;
    gap: 0.5rem;
    justify-content: center;
}

.upload-area {
    border: 2px dashed #cbd5e1;
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    color: #64748b;
    transition: all 0.3s;
}

.upload-area:hover {
    border-color: #3b82f6;
    color: #3b82f6;
}

.upload-area .el-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
}

.signature-preview {
    margin-top: 1rem;
    text-align: center;
    padding: 1rem;
    background: #f1f5f9;
    border-radius: 8px;
}

.signature-preview img {
    max-width: 150px;
    max-height: 60px;
    border: 1px solid #e2e8f0;
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
