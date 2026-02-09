<template>
    <div class="tool-page">
        <header class="tool-header">
            <div class="header-left">
                <el-button text @click="goBack"><el-icon>
                        <ArrowLeft />
                    </el-icon><span>返回</span></el-button>
            </div>
            <div class="header-center">
                <h1 class="tool-title">Favicon 生成器</h1>
                <span class="tool-subtitle">Favicon Generator</span>
            </div>
            <div class="header-right">
                <el-button type="primary" :disabled="!sourceImage" @click="generateAll">
                    <el-icon>
                        <Download />
                    </el-icon> 生成并下载
                </el-button>
            </div>
        </header>

        <main class="tool-content">
            <div class="layout-container">
                <div class="upload-section glass-card">
                    <div
v-if="!sourceImage" class="upload-placeholder" @click="triggerUpload" @dragover.prevent
                        @drop.prevent="handleDrop">
                        <div class="upload-icon"><el-icon>
                                <UploadFilled />
                            </el-icon></div>
                        <h3>上传原始图片</h3>
                        <p>推荐 512×512 像素正方形图片</p>
                        <input ref="fileRef" type="file" hidden accept="image/*" @change="handleUpload" />
                    </div>
                    <div v-else class="source-preview">
                        <img :src="sourceImage" alt="Source" />
                        <div class="source-info">{{ sourceInfo.width }}×{{ sourceInfo.height }}</div>
                        <el-button text type="danger" @click="clearSource">移除</el-button>
                    </div>
                </div>

                <div class="preview-section glass-card">
                    <h3>预览效果</h3>
                    <div class="preview-grid">
                        <div v-for="size in [16, 32, 48, 64]" :key="size" class="preview-item">
                            <div class="preview-box" :style="{ width: size + 'px', height: size + 'px' }">
                                <canvas :ref="el => canvasRefs[size] = el" :width="size" :height="size"></canvas>
                            </div>
                            <span>{{ size }}×{{ size }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="output-section glass-card">
                <h3>输出尺寸</h3>
                <el-checkbox-group v-model="selectedSizes">
                    <el-checkbox v-for="s in allSizes" :key="s" :label="s">{{ s }}×{{ s }}</el-checkbox>
                </el-checkbox-group>
            </div>
        </main>
        <footer class="footer">© 2026 LRM工具箱 - Favicon 生成器</footer>
    </div>
</template>

<script setup>
import { ref, reactive, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, UploadFilled, Download } from '@element-plus/icons-vue'

const router = useRouter()
const goBack = () => router.back()
const fileRef = ref(null)
const sourceImage = ref('')
const sourceInfo = reactive({ width: 0, height: 0 })
const canvasRefs = reactive({})
const allSizes = [16, 32, 48, 64, 128, 180, 192, 512]
const selectedSizes = ref([16, 32, 180, 192])

const triggerUpload = () => fileRef.value?.click()
const handleDrop = (e) => { const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) processFile(f) }
const handleUpload = (e) => { if (e.target.files[0]) processFile(e.target.files[0]); e.target.value = '' }

const processFile = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
        const img = new Image()
        img.onload = () => { sourceInfo.width = img.width; sourceInfo.height = img.height; sourceImage.value = e.target.result; nextTick(renderPreviews) }
        img.src = e.target.result
    }
    reader.readAsDataURL(file)
}

const clearSource = () => { sourceImage.value = ''; sourceInfo.width = 0; sourceInfo.height = 0 }

const renderPreviews = () => {
    if (!sourceImage.value) return
    const img = new Image()
    img.onload = () => { for (const size of [16, 32, 48, 64]) { const c = canvasRefs[size]; if (c) { const ctx = c.getContext('2d'); ctx.clearRect(0, 0, size, size); ctx.drawImage(img, 0, 0, size, size) } } }
    img.src = sourceImage.value
}

watch(sourceImage, () => { if (sourceImage.value) nextTick(renderPreviews) })

const generateAll = async () => {
    if (!sourceImage.value) return
    const img = new Image()
    await new Promise(r => { img.onload = r; img.src = sourceImage.value })
    for (const size of selectedSizes.value) {
        const canvas = document.createElement('canvas'); canvas.width = size; canvas.height = size
        canvas.getContext('2d').drawImage(img, 0, 0, size, size)
        const blob = await new Promise(r => canvas.toBlob(r, 'image/png'))
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
        a.download = size === 180 ? 'apple-touch-icon.png' : `favicon-${size}x${size}.png`
        a.click(); URL.revokeObjectURL(a.href)
    }
    ElMessage.success('生成完成')
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
    flex: 1;
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
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
}

.layout-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
}

.upload-section {
    min-height: 280px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.upload-placeholder {
    text-align: center;
    padding: 2rem;
    cursor: pointer;
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
    margin: 1rem;
    flex: 1;
    transition: all 0.3s;
}

.upload-placeholder:hover {
    border-color: #3b82f6;
    background: #eff6ff;
}

.upload-icon {
    font-size: 3rem;
    color: #3b82f6;
    margin-bottom: 1rem;
}

.upload-placeholder h3 {
    margin: 0 0 0.5rem;
    color: #1e293b;
}

.upload-placeholder p {
    margin: 0;
    color: #64748b;
    font-size: 0.9rem;
}

.source-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    gap: 1rem;
}

.source-preview img {
    max-width: 180px;
    max-height: 180px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.source-info {
    font-size: 0.85rem;
    color: #64748b;
}

.preview-section {
    padding: 1.5rem;
}

.preview-section h3 {
    margin: 0 0 1.5rem;
    font-size: 1rem;
    color: #1e293b;
}

.preview-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    align-items: flex-end;
}

.preview-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.preview-box {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.preview-box canvas {
    image-rendering: pixelated;
}

.preview-item span {
    font-size: 0.75rem;
    color: #64748b;
}

.output-section {
    padding: 1.5rem;
}

.output-section h3 {
    margin: 0 0 1rem;
    font-size: 1rem;
    color: #1e293b;
}

.glass-card {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

@media (max-width: 768px) {
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
