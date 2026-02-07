<template>
    <div class="tool-page">
        <header class="tool-header">
            <div class="header-left">
                <el-button text @click="goBack"><el-icon>
                        <ArrowLeft />
                    </el-icon><span>返回</span></el-button>
            </div>
            <div class="header-center">
                <h1 class="tool-title">PDF 水印</h1>
                <span class="tool-subtitle">PDF Watermark Tool</span>
            </div>
            <div class="header-right">
                <el-button type="primary" :disabled="!pdfFile" @click="applyWatermark" :loading="processing">
                    <el-icon>
                        <Download />
                    </el-icon> 添加水印并下载
                </el-button>
            </div>
        </header>

        <main class="tool-content">
            <div class="layout-container">
                <div class="workbench glass-card">
                    <div v-if="!pdfFile" class="upload-placeholder" @click="triggerUpload" @dragover.prevent
                        @drop.prevent="handleDrop">
                        <div class="upload-icon"><el-icon>
                                <Document />
                            </el-icon></div>
                        <h3>上传 PDF 文件</h3>
                        <p>添加文字或图片水印</p>
                        <input type="file" ref="fileRef" hidden accept=".pdf" @change="handleUpload" />
                    </div>
                    <div v-else class="preview-area">
                        <div class="file-info-bar">
                            <el-icon class="pdf-icon">
                                <Document />
                            </el-icon>
                            <div class="file-details">
                                <span class="file-name">{{ pdfFile.name }}</span>
                                <span class="file-meta">{{ pageCount }} 页</span>
                            </div>
                            <el-button text type="primary" @click="triggerUpload">重新选择</el-button>
                            <input type="file" ref="fileRef" hidden accept=".pdf" @change="handleUpload" />
                        </div>
                        <div class="preview-canvas-wrap">
                            <canvas ref="previewCanvas"></canvas>
                            <div class="page-nav">
                                <el-button :disabled="currentPage <= 1" @click="currentPage--" circle><el-icon>
                                        <ArrowLeft />
                                    </el-icon></el-button>
                                <span>{{ currentPage }} / {{ pageCount }}</span>
                                <el-button :disabled="currentPage >= pageCount" @click="currentPage++" circle><el-icon>
                                        <ArrowRight />
                                    </el-icon></el-button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="settings-panel glass-card">
                    <h3 class="panel-title">水印设置</h3>
                    <el-tabs v-model="watermarkType">
                        <el-tab-pane label="文字水印" name="text">
                            <div class="settings-group">
                                <div class="label">水印文字</div>
                                <el-input v-model="config.text" placeholder="请输入水印文字" @input="renderPreview" />
                            </div>
                            <div class="settings-group">
                                <div class="label">字体大小 ({{ config.fontSize }})</div>
                                <el-slider v-model="config.fontSize" :min="10" :max="100" @input="renderPreview" />
                            </div>
                            <div class="settings-group">
                                <div class="label">文字颜色</div>
                                <el-color-picker v-model="config.color" show-alpha @change="renderPreview" />
                            </div>
                        </el-tab-pane>
                        <el-tab-pane label="图片水印" name="image">
                            <div class="settings-group">
                                <div class="label">水印图片</div>
                                <div class="logo-upload" @click="triggerLogoUpload">
                                    <img v-if="config.logoUrl" :src="config.logoUrl" class="logo-preview" />
                                    <div v-else class="logo-placeholder"><el-icon>
                                            <Plus />
                                        </el-icon><span>选择图片</span></div>
                                    <input type="file" ref="logoRef" hidden accept="image/*"
                                        @change="handleLogoUpload" />
                                </div>
                            </div>
                            <div class="settings-group">
                                <div class="label">图片缩放 ({{ config.logoScale }}%)</div>
                                <el-slider v-model="config.logoScale" :min="5" :max="100" @input="renderPreview" />
                            </div>
                        </el-tab-pane>
                    </el-tabs>

                    <el-divider />
                    <div class="settings-group">
                        <div class="label">水印模式</div>
                        <el-radio-group v-model="config.mode" @change="renderPreview">
                            <el-radio-button value="single">单位置</el-radio-button>
                            <el-radio-button value="tile">平铺</el-radio-button>
                        </el-radio-group>
                    </div>
                    <div v-if="config.mode === 'single'" class="settings-group">
                        <div class="label">位置</div>
                        <div class="position-grid">
                            <div v-for="p in positions" :key="p" class="pos-dot"
                                :class="{ active: config.position === p }"
                                @click="config.position = p; renderPreview()"></div>
                        </div>
                    </div>
                    <div class="settings-group">
                        <div class="label">透明度 ({{ config.opacity }})</div>
                        <el-slider v-model="config.opacity" :min="0.1" :max="1" :step="0.1" @input="renderPreview" />
                    </div>
                    <div class="settings-group">
                        <div class="label">旋转角度 ({{ config.rotate }}°)</div>
                        <el-slider v-model="config.rotate" :min="-180" :max="180" @input="renderPreview" />
                    </div>

                    <div class="tips-section">
                        <h4>提示</h4>
                        <ul>
                            <li>预览仅供参考</li>
                            <li>本地处理，隐私安全</li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
        <footer class="footer">© 2026 LRM工具箱 - PDF 水印</footer>
    </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElLoading } from 'element-plus'
import { ArrowLeft, ArrowRight, Document, Download, Plus } from '@element-plus/icons-vue'
import pdfjsLib from '@/utils/pdf'
import { PDFDocument, rgb, degrees } from 'pdf-lib'



const router = useRouter()
const goBack = () => router.back()

const fileRef = ref(null)
const logoRef = ref(null)
const previewCanvas = ref(null)
const pdfFile = ref(null)
const pdfDoc = ref(null)
const pageCount = ref(0)
const currentPage = ref(1)
const processing = ref(false)
const watermarkType = ref('text')

const positions = ['tl', 'tc', 'tr', 'ml', 'center', 'mr', 'bl', 'bc', 'br']

const config = reactive({
    text: 'LRM工具箱',
    fontSize: 40,
    color: 'rgba(128, 128, 128, 0.5)',
    logoUrl: '',
    logoImg: null,
    logoScale: 30,
    mode: 'tile',
    position: 'center',
    opacity: 0.3,
    rotate: -30
})

const triggerUpload = () => fileRef.value?.click()
const triggerLogoUpload = () => logoRef.value?.click()
const handleDrop = (e) => { const f = e.dataTransfer.files[0]; if (f?.type === 'application/pdf') loadPdf(f) }
const handleUpload = (e) => { const f = e.target.files[0]; if (f) loadPdf(f); e.target.value = '' }


const pdfBytes = ref(null)


let isRendering = false
let currentRenderTask = null
let renderTimeout = null


let renderPreview

const debouncedRender = () => {
    if (renderTimeout) clearTimeout(renderTimeout)
    renderTimeout = setTimeout(() => renderPreview(), 100)
}

const loadPdf = async (file) => {
    pdfFile.value = file
    pdfBytes.value = await file.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument({ data: pdfBytes.value.slice(0) })
    pdfDoc.value = await loadingTask.promise
    pageCount.value = pdfDoc.value.numPages
    currentPage.value = 1
    debouncedRender()
}

const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    config.logoUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { config.logoImg = img; debouncedRender() }
    img.src = config.logoUrl
}

renderPreview = async () => {
    if (!pdfBytes.value || !previewCanvas.value) return
    if (isRendering) return  

    isRendering = true
    try {
        
        if (currentRenderTask) {
            currentRenderTask.cancel()
            currentRenderTask = null
        }

        const loadingTask = pdfjsLib.getDocument({ data: pdfBytes.value.slice(0) })
        const doc = await loadingTask.promise
        const page = await doc.getPage(currentPage.value)
        const viewport = page.getViewport({ scale: 1.5 })
        const canvas = previewCanvas.value
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')

        currentRenderTask = page.render({ canvasContext: ctx, viewport })
        await currentRenderTask.promise
        currentRenderTask = null

        drawWatermarkPreview(ctx, canvas.width, canvas.height)
    } catch (e) {
        if (e.name !== 'RenderingCancelledException') {
            console.error('Preview error:', e)
        }
    } finally {
        isRendering = false
    }
}

watch(currentPage, debouncedRender)
watch(watermarkType, debouncedRender)

const drawWatermarkPreview = (ctx, w, h) => {
    ctx.save()
    ctx.globalAlpha = config.opacity
    if (watermarkType.value === 'text') {
        ctx.font = `${config.fontSize}px sans-serif`
        ctx.fillStyle = config.color
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'center'
    }
    if (config.mode === 'tile') {
        const ww = watermarkType.value === 'text' ? ctx.measureText(config.text).width : (config.logoImg?.width || 100) * (config.logoScale / 100)
        const wh = watermarkType.value === 'text' ? config.fontSize : (config.logoImg?.height || 100) * (config.logoScale / 100)
        const stepX = ww + 80, stepY = wh + 80
        for (let y = -h; y < h * 2; y += stepY) {
            for (let x = -w; x < w * 2; x += stepX) {
                ctx.save()
                ctx.translate(x, y)
                ctx.rotate((config.rotate * Math.PI) / 180)
                if (watermarkType.value === 'text') ctx.fillText(config.text, 0, 0)
                else if (config.logoImg) ctx.drawImage(config.logoImg, -ww / 2, -wh / 2, ww, wh)
                ctx.restore()
            }
        }
    } else {
        let x = w / 2, y = h / 2
        const p = config.position
        if (p.includes('l')) x = 50
        if (p.includes('r')) x = w - 50
        if (p.includes('t')) y = 50
        if (p.includes('b')) y = h - 50
        ctx.translate(x, y)
        ctx.rotate((config.rotate * Math.PI) / 180)
        if (watermarkType.value === 'text') ctx.fillText(config.text, 0, 0)
        else if (config.logoImg) {
            const ww = config.logoImg.width * (config.logoScale / 100)
            const wh = config.logoImg.height * (config.logoScale / 100)
            ctx.drawImage(config.logoImg, -ww / 2, -wh / 2, ww, wh)
        }
    }
    ctx.restore()
}


const createTextWatermarkImage = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx.font = `${config.fontSize}px sans-serif`
    const metrics = ctx.measureText(config.text)
    const textWidth = metrics.width
    const textHeight = config.fontSize * 1.2

    
    const rad = Math.abs(config.rotate * Math.PI / 180)
    const rotatedWidth = Math.ceil(textWidth * Math.cos(rad) + textHeight * Math.sin(rad)) + 20
    const rotatedHeight = Math.ceil(textWidth * Math.sin(rad) + textHeight * Math.cos(rad)) + 20

    canvas.width = rotatedWidth
    canvas.height = rotatedHeight

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate(config.rotate * Math.PI / 180)
    ctx.font = `${config.fontSize}px sans-serif`
    ctx.fillStyle = config.color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(config.text, 0, 0)

    return canvas.toDataURL('image/png')
}

const applyWatermark = async () => {
    if (!pdfBytes.value) return
    processing.value = true
    const loading = ElLoading.service({ text: '正在添加水印...', background: 'rgba(0,0,0,0.7)' })
    try {
        const doc = await PDFDocument.load(pdfBytes.value.slice(0))
        const pages = doc.getPages()

        
        let watermarkImg
        let imgW, imgH

        if (watermarkType.value === 'text') {
            
            const textImgDataUrl = createTextWatermarkImage()
            const textImgBytes = await fetch(textImgDataUrl).then(r => r.arrayBuffer())
            watermarkImg = await doc.embedPng(textImgBytes)
            imgW = watermarkImg.width
            imgH = watermarkImg.height
        } else if (config.logoImg && config.logoUrl) {
            
            const imgBytes = await fetch(config.logoUrl).then(res => res.arrayBuffer())
            try {
                watermarkImg = await doc.embedPng(imgBytes)
            } catch {
                watermarkImg = await doc.embedJpg(imgBytes)
            }
            imgW = watermarkImg.width * (config.logoScale / 100)
            imgH = watermarkImg.height * (config.logoScale / 100)
        }

        if (!watermarkImg) {
            throw new Error('无法创建水印')
        }

        for (const page of pages) {
            const { width, height } = page.getSize()

            if (config.mode === 'tile') {
                const stepX = imgW + 60
                const stepY = imgH + 60
                for (let y = 0; y < height; y += stepY) {
                    for (let x = 0; x < width; x += stepX) {
                        page.drawImage(watermarkImg, {
                            x, y,
                            width: imgW,
                            height: imgH,
                            opacity: config.opacity
                        })
                    }
                }
            } else {
                let x = (width - imgW) / 2
                let y = (height - imgH) / 2
                const p = config.position
                if (p.includes('l')) x = 30
                if (p.includes('r')) x = width - imgW - 30
                if (p.includes('t')) y = height - imgH - 30
                if (p.includes('b')) y = 30
                page.drawImage(watermarkImg, {
                    x, y,
                    width: imgW,
                    height: imgH,
                    opacity: config.opacity
                })
            }
        }

        const savedBytes = await doc.save()
        const blob = new Blob([savedBytes], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `watermarked_${pdfFile.value?.name || 'document.pdf'}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        ElMessage.success('水印添加成功')
    } catch (e) {
        console.error(e)
        ElMessage.error('添加水印失败: ' + e.message)
    }
    finally { processing.value = false; loading.close() }
}
</script>

<style scoped>
.tool-page {
    min-height: 100vh;
    background: #f1f5f9;
    display: flex;
    flex-direction: column;
}

.tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 100;
}

.header-center {
    text-align: center;
}

.tool-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
}

.tool-subtitle {
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
}

.tool-content {
    flex: 1;
    padding: 1.5rem;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
}

.layout-container {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 1.5rem;
    min-height: calc(100vh - 200px);
}

.workbench {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #f8fafc;
    padding: 1rem;
}

.upload-placeholder {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
    min-height: 400px;
}

.upload-placeholder:hover {
    border-color: #3b82f6;
    background: #eff6ff;
}

.upload-icon {
    font-size: 4rem;
    color: #ef4444;
    margin-bottom: 1rem;
}

.preview-area {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.file-info-bar {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #fff;
    border-radius: 12px;
    margin-bottom: 1rem;
}

.pdf-icon {
    font-size: 2rem;
    color: #ef4444;
}

.file-details {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.file-name {
    font-weight: 600;
    color: #1e293b;
}

.file-meta {
    font-size: 0.85rem;
    color: #64748b;
}

.preview-canvas-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
    overflow: hidden;
}

.preview-canvas-wrap canvas {
    max-width: 100%;
    max-height: 500px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.page-nav {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
}

.settings-panel {
    padding: 1.5rem;
    overflow-y: auto;
    background: #fff;
}

.panel-title {
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 1rem;
}

.settings-group {
    margin-bottom: 1.25rem;
}

.label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #475569;
    margin-bottom: 0.5rem;
}

.logo-upload {
    height: 80px;
    border: 1px dashed #cbd5e1;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    overflow: hidden;
    background: #f8fafc;
}

.logo-preview {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

.logo-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #94a3b8;
    font-size: 0.8rem;
}

.position-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    width: 100px;
    margin: 0 auto;
}

.pos-dot {
    aspect-ratio: 1;
    background: #e2e8f0;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
}

.pos-dot:hover {
    background: #cbd5e1;
}

.pos-dot.active {
    background: #3b82f6;
    transform: scale(1.1);
}

.tips-section {
    margin-top: 2rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 8px;
}

.tips-section h4 {
    font-size: 0.9rem;
    margin: 0 0 0.5rem;
    color: #475569;
}

.tips-section ul {
    margin: 0;
    padding-left: 1.25rem;
    font-size: 0.8rem;
    color: #64748b;
    line-height: 1.8;
}

.glass-card {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

@media (max-width: 992px) {
    .layout-container {
        grid-template-columns: 1fr;
    }
}

.footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
}
</style>
