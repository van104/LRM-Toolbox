<template>
    <div class="tool-page">
        <header class="tool-header">
            <div class="header-left">
                <el-button text @click="goBack"><el-icon>
                        <ArrowLeft />
                    </el-icon><span>返回</span></el-button>
            </div>
            <div class="header-center">
                <h1 class="tool-title">PDF 压缩</h1>
                <span class="tool-subtitle">PDF Compression</span>
            </div>
            <div class="header-right"></div>
        </header>

        <main class="tool-content">
            <div class="layout-container center-layout">
                <div class="workbench glass-card">
                    <div
v-if="!pdfFile" class="upload-placeholder" @click="triggerUpload" @dragover.prevent
                        @drop.prevent="handleDrop">
                        <el-icon class="upload-icon">
                            <Files />
                        </el-icon>
                        <h3>上传 PDF 文件</h3>
                        <p>支持无损优化和强力压缩</p>
                        <input ref="fileRef" type="file" hidden accept=".pdf" @change="handleUpload" />
                    </div>

                    <div v-else class="workspace">
                        <div class="file-info-bar">
                            <div class="info-left">
                                <el-icon class="file-icon">
                                    <Document />
                                </el-icon>
                                <div>
                                    <div class="filename">{{ pdfFile.name }}</div>
                                    <div class="filesize">原始大小: {{ formatSize(pdfFile.size) }}</div>
                                </div>
                            </div>
                            <el-button link type="danger" @click="clearFile">移除</el-button>
                        </div>

                        <div class="settings-section">
                            <div class="mode-selection">
                                <div
class="mode-card" :class="{ active: mode === 'lossless' }"
                                    @click="mode = 'lossless'">
                                    <div class="mode-icon">
                                        <check />
                                    </div>
                                    <div class="mode-title">无损优化</div>
                                    <div class="mode-desc">重建文件结构，移除冗余数据。画质不变。</div>
                                </div>
                                <div class="mode-card" :class="{ active: mode === 'lossy' }" @click="mode = 'lossy'">
                                    <div class="mode-icon">
                                        <check />
                                    </div>
                                    <div class="mode-title">强力压缩</div>
                                    <div class="mode-desc">将页面转为图片重制。适合扫描件。</div>
                                </div>
                            </div>

                            <div v-if="mode === 'lossy'" class="lossy-settings">
                                <div class="setting-item">
                                    <span class="label">图片质量 ({{ quality }}%)</span>
                                    <el-slider v-model="quality" :min="10" :max="90" :step="10" />
                                </div>
                                <div class="setting-item">
                                    <span class="label">清晰度 (DPI 缩放)</span>
                                    <el-radio-group v-model="scale">
                                        <el-radio-button :value="1">标准 (72 DPI)</el-radio-button>
                                        <el-radio-button :value="2">高清 (144 DPI)</el-radio-button>
                                    </el-radio-group>
                                </div>
                                <el-alert title="注意：强力压缩会移除文本的可选性（变为图片）" type="warning" show-icon :closable="false" />
                            </div>
                        </div>

                        <div class="action-area">
                            <el-progress
v-if="processing" :percentage="progress"
                                :status="progress === 100 ? 'success' : ''" />
                            <el-button
v-else type="primary" size="large" class="compress-btn"
                                @click="startCompression">
                                开始压缩
                            </el-button>
                        </div>

                        <div v-if="resultSize" class="result-box">
                            <div class="result-info">
                                <span>压缩后: <strong>{{ formatSize(resultSize) }}</strong></span>
                                <el-tag :type="compressionRatio > 0 ? 'success' : 'info'">
                                    {{ compressionRatio > 0 ? `减小 ${compressionRatio}%` : '未减小' }}
                                </el-tag>
                            </div>
                            <el-button type="success" @click="downloadResult">下载文件</el-button>
                        </div>
                    </div>
                    <canvas ref="canvasRef" style="display: none;"></canvas>
                </div>
            </div>
        </main>
        <footer class="footer">© 2026 LRM工具箱 - PDF 压缩工具</footer>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Files, Document, Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import pdfjsLib from '@/utils/pdf'

import { PDFDocument } from 'pdf-lib'



const router = useRouter()
const goBack = () => router.back()

const fileRef = ref(null)
const pdfFile = ref(null)
const mode = ref('lossless') 
const quality = ref(60)
const scale = ref(2)
const processing = ref(false)
const progress = ref(0)
const resultBlob = ref(null)
const resultSize = ref(0)
const canvasRef = ref(null)

const triggerUpload = () => fileRef.value?.click()

const handleUpload = (e) => {
    const file = e.target.files[0]
    if (file && file.type === 'application/pdf') {
        pdfFile.value = file
        resultBlob.value = null
        resultSize.value = 0
    } else {
        ElMessage.error('请上传 PDF 文件')
    }
}

const handleDrop = (e) => {
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'application/pdf') {
        pdfFile.value = file
        resultBlob.value = null
        resultSize.value = 0
    }
}

const clearFile = () => {
    pdfFile.value = null
    resultBlob.value = null
}

const formatSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const compressionRatio = computed(() => {
    if (!pdfFile.value || !resultSize.value) return 0
    const ratio = ((pdfFile.value.size - resultSize.value) / pdfFile.value.size) * 100
    return ratio.toFixed(1)
})

const startCompression = async () => {
    if (!pdfFile.value) return
    processing.value = true
    progress.value = 0
    resultBlob.value = null
    resultSize.value = 0

    try {
        const buffer = await pdfFile.value.arrayBuffer()

        if (mode.value === 'lossless') {
            await compressLossless(buffer)
        } else {
            await compressLossy(buffer)
        }

    } catch (e) {
        console.error(e)
        ElMessage.error('压缩失败: ' + e.message)
        processing.value = false
    }
}

const compressLossless = async (buffer) => {
    
    const pdfDoc = await PDFDocument.load(buffer)
    const compressedBytes = await pdfDoc.save() 

    resultBlob.value = new Blob([compressedBytes], { type: 'application/pdf' })
    resultSize.value = resultBlob.value.size
    progress.value = 100
    processing.value = false
    ElMessage.success('优化完成')
}

const compressLossy = async (buffer) => {
    const loadingTask = pdfjsLib.getDocument(new Uint8Array(buffer))
    const pdfDocProxy = await loadingTask.promise
    const numPages = pdfDocProxy.numPages

    const newPdfDoc = await PDFDocument.create()

    for (let i = 1; i <= numPages; i++) {
        const page = await pdfDocProxy.getPage(i)
        const viewport = page.getViewport({ scale: scale.value })

        const canvas = canvasRef.value
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')

        await page.render({ canvasContext: ctx, viewport }).promise

        const imgDataUrl = canvas.toDataURL('image/jpeg', quality.value / 100)
        const imgBytes = await fetch(imgDataUrl).then(res => res.arrayBuffer())

        const jpgImage = await newPdfDoc.embedJpg(imgBytes)
        
        
        const pageDims = page.getViewport({ scale: 1 })

        const newPage = newPdfDoc.addPage([pageDims.width, pageDims.height])
        newPage.drawImage(jpgImage, {
            x: 0,
            y: 0,
            width: pageDims.width,
            height: pageDims.height,
        })

        progress.value = Math.round((i / numPages) * 100)
    }

    const pdfBytes = await newPdfDoc.save()
    resultBlob.value = new Blob([pdfBytes], { type: 'application/pdf' })
    resultSize.value = resultBlob.value.size
    processing.value = false
    ElMessage.success('压缩完成')
}

const downloadResult = () => {
    if (!resultBlob.value) return
    const url = URL.createObjectURL(resultBlob.value)
    const a = document.createElement('a')
    a.href = url
    a.download = `compressed_${pdfFile.value.name}`
    a.click()
    URL.revokeObjectURL(url)
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
    width: 100%;
    max-width: 600px;
}

.workbench {
    background: #fff;
    padding: 2rem;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
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
    color: #64748b;
    transition: all 0.3s;
}

.upload-placeholder:hover {
    border-color: #3b82f6;
    background: #eff6ff;
}

.upload-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
}

.file-info-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f1f5f9;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 2rem;
}

.info-left {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.file-icon {
    font-size: 2rem;
    color: #3b82f6;
}

.filename {
    font-weight: 500;
    font-size: 0.95rem;
}

.filesize {
    font-size: 0.8rem;
    color: #64748b;
}

.mode-selection {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.mode-card {
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
}

.mode-card:hover {
    border-color: #94a3b8;
}

.mode-card.active {
    border-color: #3b82f6;
    background: #eff6ff;
}

.mode-icon {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    color: #3b82f6;
    opacity: 0;
    transform: scale(0.5);
    transition: all 0.2s;
}

.mode-card.active .mode-icon {
    opacity: 1;
    transform: scale(1);
}

.mode-title {
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.mode-desc {
    font-size: 0.8rem;
    color: #64748b;
}

.lossy-settings {
    background: #fff7ed;
    border: 1px solid #fed7aa;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.setting-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.label {
    font-size: 0.85rem;
    font-weight: 500;
    color: #ea580c;
}

.action-area {
    margin-top: 1rem;
}

.compress-btn {
    width: 100%;
}

.result-box {
    margin-top: 2rem;
    border-top: 1px solid #e2e8f0;
    padding-top: 1.5rem;
    text-align: center;
    animation: fadeIn 0.5s;
}

.result-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 1rem;
    font-size: 1.1rem;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.glass-card {
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
}
</style>
