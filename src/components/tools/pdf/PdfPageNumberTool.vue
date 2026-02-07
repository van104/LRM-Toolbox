<template>
    <div class="tool-page">
        <header class="tool-header">
            <div class="header-left">
                <el-button text @click="goBack"><el-icon>
                        <ArrowLeft />
                    </el-icon><span>返回</span></el-button>
            </div>
            <div class="header-center">
                <h1 class="tool-title">PDF 添加页码</h1>
                <span class="tool-subtitle">PDF Page Numbering</span>
            </div>
            <div class="header-right">
                <el-button type="primary" :disabled="!pdfFile" @click="savePdf" :loading="processing">
                    <el-icon>
                        <Download />
                    </el-icon> 保存并下载
                </el-button>
            </div>
        </header>

        <main class="tool-content">
            <div class="layout-container">
                <div class="workbench glass-card">
                    <div v-if="!pdfFile" class="upload-placeholder" @click="triggerUpload" @dragover.prevent
                        @drop.prevent="handleDrop">
                        <el-icon class="upload-icon">
                            <Document />
                        </el-icon>
                        <h3>上传 PDF 文件</h3>
                        <p>添加自定义页码、页眉或页脚</p>
                        <input type="file" ref="fileRef" hidden accept=".pdf" @change="handleUpload" />
                    </div>

                    <div v-else class="preview-area">
                        <div class="toolbar">
                            <span class="file-name">{{ pdfFile.name }} ({{ pageCount }} 页)</span>
                            <el-button link type="primary" @click="clearFile">更换文件</el-button>
                        </div>
                        <div class="canvas-wrapper">
                            <canvas ref="previewCanvas"></canvas>
                            
                            <div class="page-number-overlay" :style="overlayStyle">
                                {{ previewText }}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="settings-panel glass-card" v-if="pdfFile">
                    <h3>页码设置</h3>

                    <div class="form-item">
                        <span class="label">位置</span>
                        <div class="position-grid">
                            <div v-for="pos in positions" :key="pos.value" class="pos-box"
                                :class="{ active: config.position === pos.value }" @click="config.position = pos.value">
                                <span class="dot"></span>
                            </div>
                        </div>
                        <div class="pos-label">{{ getPositionLabel(config.position) }}</div>
                    </div>

                    <div class="form-item">
                        <span class="label">格式</span>
                        <el-select v-model="config.format">
                            <el-option label="1" value="n" />
                            <el-option label="1 / N" value="n_of_total" />
                            <el-option label="Page 1" value="page_n" />
                            <el-option label="Page 1 of N" value="page_n_of_total" />
                            <el-option label="- 1 -" value="dash_n_dash" />
                        </el-select>
                    </div>

                    <div class="form-row">
                        <div class="form-item">
                            <span class="label">起始页码</span>
                            <el-input-number v-model="config.startNumber" :min="1" />
                        </div>
                        <div class="form-item">
                            <span class="label">开始页面</span>
                            <el-input-number v-model="config.startPage" :min="1" :max="pageCount > 0 ? pageCount : 1" />
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-item">
                            <span class="label">字体大小</span>
                            <el-slider v-model="config.fontSize" :min="8" :max="72" />
                        </div>
                    </div>

                    <div class="form-item">
                        <span class="label">边距调整 (Margin)</span>
                        <el-slider v-model="config.margin" :min="0" :max="100" />
                    </div>
                </div>
            </div>
        </main>
        <footer class="footer">© 2026 LRM工具箱 - PDF 页码工具</footer>
    </div>
</template>

<script setup>
import { ref, shallowRef, reactive, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Document, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import pdfjsLib from '@/utils/pdf'

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'



const router = useRouter()
const goBack = () => router.back()

const fileRef = ref(null)
const pdfFile = ref(null)
const pageCount = ref(0)
const previewCanvas = ref(null)
const pdfDocProxy = shallowRef(null)  
const processing = ref(false)

const config = reactive({
    position: 'bottom-center', 
    format: 'n',
    startNumber: 1,
    startPage: 1,
    fontSize: 12,
    margin: 20
})

const positions = [
    { value: 'top-left' }, { value: 'top-center' }, { value: 'top-right' },
    { value: 'bottom-left' }, { value: 'bottom-center' }, { value: 'bottom-right' }
]

const getPositionLabel = (val) => {
    const map = {
        'top-left': '左上角', 'top-center': '顶部居中', 'top-right': '右上角',
        'bottom-left': '左下角', 'bottom-center': '底部居中', 'bottom-right': '右下角'
    }
    return map[val]
}

const previewText = computed(() => {
    let text = ''
    const n = config.startNumber
    const total = pageCount.value || 10

    switch (config.format) {
        case 'n': text = `${n}`; break;
        case 'n_of_total': text = `${n} / ${total}`; break;
        case 'page_n': text = `Page ${n}`; break;
        case 'page_n_of_total': text = `Page ${n} of ${total}`; break;
        case 'dash_n_dash': text = `- ${n} -`; break;
    }
    return text
})


const overlayStyle = computed(() => {
    const margin = `${config.margin}px`
    const style = {
        fontSize: `${config.fontSize}px`, 
        fontFamily: 'Helvetica, sans-serif',
        position: 'absolute',
        color: '#000'
    }

    const [v, h] = config.position.split('-')

    if (v === 'top') style.top = margin
    else style.bottom = margin

    if (h === 'left') style.left = margin
    else if (h === 'right') style.right = margin
    else {
        style.left = '50%'
        style.transform = 'translateX(-50%)'
    }

    return style
})

const triggerUpload = () => fileRef.value?.click()

const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (file) await loadPdf(file)
}

const handleDrop = async (e) => {
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'application/pdf') await loadPdf(file)
}

const clearFile = () => {
    pdfFile.value = null
    pageCount.value = 0
    pdfDocProxy.value = null
}

const loadPdf = async (file) => {
    try {
        pdfFile.value = file
        const buffer = await file.arrayBuffer()
        const loadingTask = pdfjsLib.getDocument(new Uint8Array(buffer))
        pdfDocProxy.value = await loadingTask.promise
        pageCount.value = pdfDocProxy.value.numPages
        nextTick(() => renderPreviewPage())
    } catch (e) {
        ElMessage.error('无法加载文件')
    }
}

const renderPreviewPage = async () => {
    if (!pdfDocProxy.value || !previewCanvas.value) return
    const page = await pdfDocProxy.value.getPage(1)
    const viewport = page.getViewport({ scale: 0.8 }) 

    previewCanvas.value.width = viewport.width
    previewCanvas.value.height = viewport.height

    await page.render({
        canvasContext: previewCanvas.value.getContext('2d'),
        viewport
    }).promise
}

const savePdf = async () => {
    if (!pdfFile.value) return
    processing.value = true

    try {
        const arrayBuffer = await pdfFile.value.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
        const pages = pdfDoc.getPages()

        const total = pageCount.value

        pages.forEach((page, idx) => {
            const pageNum = idx + 1
            if (pageNum < config.startPage) return

            const displayNum = config.startNumber + (pageNum - config.startPage)
            let text = ''
            switch (config.format) {
                case 'n': text = `${displayNum}`; break;
                case 'n_of_total': text = `${displayNum} / ${total}`; break;
                case 'page_n': text = `Page ${displayNum}`; break;
                case 'page_n_of_total': text = `Page ${displayNum} of ${total}`; break;
                case 'dash_n_dash': text = `- ${displayNum} -`; break;
            }

            const textSize = font.widthOfTextAtSize(text, config.fontSize)
            const { width, height } = page.getSize()

            let x = 0
            let y = 0
            const margin = config.margin

            const [v, h] = config.position.split('-')

            if (v === 'top') y = height - margin - config.fontSize
            else y = margin

            if (h === 'left') x = margin
            else if (h === 'right') x = width - margin - textSize
            else x = (width - textSize) / 2

            page.drawText(text, {
                x, y,
                size: config.fontSize,
                font,
                color: rgb(0, 0, 0)
            })
        })

        const pdfBytes = await pdfDoc.save()
        const blob = new Blob([pdfBytes], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `numbered_${pdfFile.value.name}`
        a.click()
        URL.revokeObjectURL(url)
        ElMessage.success('处理完成')

    } catch (e) {
        console.error(e)
        ElMessage.error('处理失败: ' + e.message)
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
    padding: 2rem;
    width: 100%;
    display: flex;
    justify-content: center;
}

.layout-container {
    display: flex;
    gap: 2rem;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    align-items: flex-start;
}

.workbench {
    flex: 1;
    background: #fff;
    padding: 2rem;
    border-radius: 16px;
    min-height: 500px;
    display: flex;
    flex-direction: column;
}

.settings-panel {
    width: 320px;
    padding: 1.5rem;
    background: #fff;
    border-radius: 16px;
}

.upload-placeholder {
    flex: 1;
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #64748b;
}

.upload-placeholder:hover {
    border-color: #3b82f6;
    background: #eff6ff;
}

.upload-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
}

.preview-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 100%;
}

.toolbar {
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding-bottom: 1rem;
    border-bottom: 1px solid #f1f5f9;
}

.canvas-wrapper {
    position: relative;
    border: 1px solid #e2e8f0;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.canvas-wrapper canvas {
    display: block;
    max-width: 100%;
    height: auto;
}

.page-number-overlay {
    pointer-events: none;
    white-space: nowrap;
    user-select: none;
}

.settings-panel h3 {
    margin: 0 0 1.5rem;
    font-size: 1.1rem;
}

.form-item {
    margin-bottom: 1.5rem;
}

.form-item .label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: #64748b;
}

.form-row {
    display: flex;
    gap: 1rem;
}

.form-row .form-item {
    flex: 1;
}

.position-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    width: 120px;
    height: 160px;
    background: #f1f5f9;
    padding: 8px;
    border-radius: 8px;
    margin-bottom: 0.5rem;
}

.pos-box {
    border-radius: 4px;
    border: 1px solid #cbd5e1;
    background: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.pos-box:hover {
    border-color: #3b82f6;
}

.pos-box.active {
    background: #3b82f6;
    border-color: #3b82f6;
}

.pos-box .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #cbd5e1;
}

.pos-box.active .dot {
    background: #fff;
}

.pos-label {
    font-size: 0.85rem;
    color: #3b82f6;
    font-weight: 500;
    height: 1.2em;
}

.glass-card {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
}
</style>
