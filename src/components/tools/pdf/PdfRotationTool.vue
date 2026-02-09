<template>
    <div class="tool-page">
        <header class="tool-header">
            <div class="header-left">
                <el-button text @click="goBack"><el-icon>
                        <ArrowLeft />
                    </el-icon><span>返回</span></el-button>
            </div>
            <div class="header-center">
                <h1 class="tool-title">PDF 页面旋转</h1>
                <span class="tool-subtitle">PDF Page Rotation</span>
            </div>
            <div class="header-right">
                <el-button type="primary" :disabled="!pdfFile" :loading="processing" @click="saveRotation">
                    <el-icon>
                        <Download />
                    </el-icon> 保存并下载
                </el-button>
            </div>
        </header>

        <main class="tool-content">
            <div
v-if="!pdfFile" class="upload-container glass-card" @click="triggerUpload" @dragover.prevent
                @drop.prevent="handleDrop">
                <el-icon class="upload-icon">
                    <RefreshRight />
                </el-icon>
                <h3>上传 PDF 文件</h3>
                <p>支持 90° / 180° 旋转任意页面</p>
                <input ref="fileRef" type="file" hidden accept=".pdf" @change="handleUpload" />
            </div>

            <div v-else class="workspace">
                <div class="toolbar glass-card">
                    <div class="tool-group">
                        <span class="label">全部页面：</span>
                        <el-button @click="rotateAll(-90)"><el-icon>
                                <RefreshLeft />
                            </el-icon> 左转 90°</el-button>
                        <el-button @click="rotateAll(90)"><el-icon>
                                <RefreshRight />
                            </el-icon> 右转 90°</el-button>
                        <el-button @click="rotateAll(180)"><el-icon>
                                <Refresh />
                            </el-icon> 180°</el-button>
                    </div>
                    <div class="tool-group right">
                        <el-button type="danger" text @click="resetAll">重置所有</el-button>
                        <el-button text @click="clearFile">更换文件</el-button>
                    </div>
                </div>

                <div class="pages-grid">
                    <div v-for="(page, index) in pages" :key="index" class="page-card glass-card">
                        <div class="page-preview" :style="{ transform: `rotate(${page.rotation}deg)` }">
                            <canvas :ref="el => setCanvasRef(el, index)"></canvas>
                            <div v-if="!page.rendered" class="loading-mask"><el-icon class="is-loading">
                                    <Loading />
                                </el-icon></div>
                        </div>
                        <div class="page-footer">
                            <span class="page-num">第 {{ index + 1 }} 页</span>
                            <div class="page-actions">
                                <el-button size="small" circle @click="rotatePage(index, -90)"><el-icon>
                                        <RefreshLeft />
                                    </el-icon></el-button>
                                <el-button size="small" circle @click="rotatePage(index, 90)"><el-icon>
                                        <RefreshRight />
                                    </el-icon></el-button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
        <footer class="footer">© 2026 LRM工具箱 - PDF 页面旋转</footer>
    </div>
</template>

<script setup>
import { ref, shallowRef, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, RefreshRight, RefreshLeft, Refresh, Download, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import pdfjsLib from '@/utils/pdf'
import { PDFDocument, degrees } from 'pdf-lib'




const router = useRouter()
const goBack = () => router.back()

const fileRef = ref(null)
const pdfFile = ref(null)
const pdfDocProxy = shallowRef(null)  
const pages = ref([]) 
const processing = ref(false)
const canvasRefs = []

const setCanvasRef = (el, index) => {
    if (el) canvasRefs[index] = el
}

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
    pages.value = []
    pdfDocProxy.value = null
}

const loadPdf = async (file) => {
    try {
        pdfFile.value = file
        const buffer = await file.arrayBuffer()
        const loadingTask = pdfjsLib.getDocument(new Uint8Array(buffer))
        pdfDocProxy.value = await loadingTask.promise

        
        pages.value = Array.from({ length: pdfDocProxy.value.numPages }, () => ({
            rotation: 0,
            rendered: false
        }))

        nextTick(() => renderThumbnails())
    } catch (e) {
        console.error(e)
        ElMessage.error('无法加载 PDF 文件')
    }
}

const renderThumbnails = async () => {
    if (!pdfDocProxy.value) return

    
    
    const limit = Math.min(pages.value.length, 50)

    for (let i = 1; i <= limit; i++) {
        if (pages.value[i - 1].rendered) continue

        try {
            const page = await pdfDocProxy.value.getPage(i)
            const canvas = canvasRefs[i - 1]
            if (!canvas) continue

            const viewport = page.getViewport({ scale: 0.3 }) 
            canvas.height = viewport.height
            canvas.width = viewport.width

            const ctx = canvas.getContext('2d')
            await page.render({ canvasContext: ctx, viewport: viewport }).promise
            pages.value[i - 1].rendered = true
        } catch (e) {
            console.error(`Error rendering page ${i}`, e)
        }
    }
}

const rotatePage = (index, angle) => {
    pages.value[index].rotation = (pages.value[index].rotation + angle) % 360
}

const rotateAll = (angle) => {
    pages.value.forEach(p => p.rotation = (p.rotation + angle) % 360)
}

const resetAll = () => {
    pages.value.forEach(p => p.rotation = 0)
}

const saveRotation = async () => {
    if (!pdfFile.value) return
    processing.value = true

    try {
        const arrayBuffer = await pdfFile.value.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        const pdfPages = pdfDoc.getPages()

        pages.value.forEach((p, i) => {
            if (p.rotation !== 0 && pdfPages[i]) {
                const currentRotation = pdfPages[i].getRotation().angle
                pdfPages[i].setRotation(degrees(currentRotation + p.rotation))
            }
        })

        const pdfBytes = await pdfDoc.save()
        const blob = new Blob([pdfBytes], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `rotated_${pdfFile.value.name}`
        a.click()
        URL.revokeObjectURL(url)
        ElMessage.success('保存成功')
    } catch (e) {
        console.error(e)
        ElMessage.error('保存失败: ' + e.message)
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
    flex-direction: column;
    align-items: center;
}

.upload-container {
    width: 100%;
    max-width: 600px;
    height: 300px;
    border: 2px dashed #cbd5e1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    margin-top: 2rem;
}

.upload-container:hover {
    border-color: #3b82f6;
    background: #eff6ff;
}

.upload-icon {
    font-size: 4rem;
    color: #94a3b8;
    margin-bottom: 1rem;
}

.workspace {
    width: 100%;
    max-width: 1200px;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.toolbar {
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
}

.tool-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.tool-group.right {
    margin-left: auto;
}

.label {
    font-size: 0.9rem;
    font-weight: 500;
    color: #334155;
}

.pages-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.5rem;
}

.page-card {
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    transition: all 0.2s;
}

.page-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.page-preview {
    aspect-ratio: 0.7;
    background: #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 4px;
    position: relative;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-preview canvas {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

.loading-mask {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.8);
}

.page-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.page-num {
    font-size: 0.85rem;
    font-weight: 600;
    color: #475569;
}

.glass-card {
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
}
</style>
