<template>
    <div class="tool-page">
        <header class="tool-header">
            <div class="header-left">
                <el-button text @click="goBack"><el-icon>
                        <ArrowLeft />
                    </el-icon><span>返回</span></el-button>
            </div>
            <div class="header-center">
                <h1 class="tool-title">GIF 制作工具</h1>
                <span class="tool-subtitle">GIF Maker</span>
            </div>
            <div class="header-right">
                <el-button
type="primary" :disabled="images.length < 2 || generating" :loading="generating"
                    @click="generateGif">
                    <el-icon>
                        <VideoPlay />
                    </el-icon> {{ generating ? '生成中...' : '生成 GIF' }}
                </el-button>
            </div>
        </header>

        <main class="tool-content">
            <div class="layout-container">
                <div class="workspace glass-card">
                    <div class="toolbar">
                        <el-button type="primary" @click="triggerUpload">
                            <el-icon>
                                <Plus />
                            </el-icon> 添加图片
                        </el-button>
                        <el-button :disabled="!images.length" @click="clearAll">
                            <el-icon>
                                <Delete />
                            </el-icon> 清空
                        </el-button>
                        <span v-if="images.length" class="count-badge">共 {{ images.length }} 帧</span>
                        <input ref="fileRef" type="file" multiple hidden accept="image/*" @change="handleUpload" />
                    </div>

                    <div
v-if="images.length === 0" class="empty-state" @click="triggerUpload" @dragover.prevent
                        @drop.prevent="handleDrop">
                        <el-icon class="empty-icon">
                            <Picture />
                        </el-icon>
                        <p>点击或拖拽上传多张图片</p>
                        <p class="sub">支持 JPG, PNG, WebP</p>
                    </div>

                    <draggable v-else v-model="images" item-key="id" class="images-grid" ghost-class="ghost">
                        <template #item="{ element: img, index }">
                            <div class="image-card">
                                <div class="card-preview">
                                    <img :src="img.url" />
                                    <div class="frame-index">{{ index + 1 }}</div>
                                </div>
                                <div class="card-actions">
                                    <el-button size="small" circle type="danger" @click="removeImage(index)"><el-icon>
                                            <Delete />
                                        </el-icon></el-button>
                                </div>
                            </div>
                        </template>
                    </draggable>
                </div>

                <div class="sidebar glass-card">
                    <h3>设置</h3>
                    <div class="settings-form">
                        <div class="form-item">
                            <div class="label">尺寸 (像素)</div>
                            <div class="input-group">
                                <el-input-number v-model="settings.width" :min="50" :max="1920" placeholder="宽" />
                                <span class="x">×</span>
                                <el-input-number v-model="settings.height" :min="50" :max="1920" placeholder="高" />
                            </div>
                        </div>

                        <div class="form-item">
                            <div class="label">帧间隔 (毫秒)</div>
                            <el-slider v-model="settings.delay" :min="50" :max="2000" :step="50" show-input />
                            <div class="hint">数值越小速度越快</div>
                        </div>

                        <div class="form-item">
                            <div class="label">质量 (1-10)</div>
                            <el-slider v-model="settings.quality" :min="1" :max="20" show-input />
                            <div class="hint">1 为最高质量，但生成较慢</div>
                        </div>

                        <el-divider />

                        <div v-if="resultGif" class="preview-result">
                            <h4>生成结果</h4>
                            <div class="result-img-wrapper">
                                <img :src="resultGif" alt="Generated GIF" />
                            </div>
                            <div class="result-info">
                                <span>{{ resultSize }}</span>
                            </div>
                            <el-button type="success" class="download-btn" @click="downloadGif">
                                <el-icon>
                                    <Download />
                                </el-icon> 下载 GIF
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
        <footer class="footer">© 2026 LRM工具箱 - GIF 制作工具</footer>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Plus, Delete, Picture, VideoPlay, Download } from '@element-plus/icons-vue'
import draggable from 'vuedraggable'

const router = useRouter()
const goBack = () => router.back()

const fileRef = ref(null)
const images = ref([])
const generating = ref(false)
const resultGif = ref(null)
const resultSize = ref('')
let imageId = 0

const settings = reactive({
    width: 500,
    height: 500,
    delay: 500,
    quality: 10
})

const triggerUpload = () => fileRef.value?.click()
const handleDrop = (e) => { const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')); addImages(files) }
const handleUpload = (e) => { addImages(Array.from(e.target.files)); e.target.value = '' }

const addImages = (files) => {
    files.forEach(f => {
        const url = URL.createObjectURL(f)
        const img = new Image()
        img.onload = () => {
            
            if (images.value.length === 0) {
                settings.width = img.width
                settings.height = img.height
            }
            images.value.push({ id: ++imageId, file: f, url, w: img.width, h: img.height })
        }
        img.src = url
    })
}

const removeImage = (index) => {
    URL.revokeObjectURL(images.value[index].url)
    images.value.splice(index, 1)
}

const clearAll = () => {
    images.value.forEach(i => URL.revokeObjectURL(i.url))
    images.value = []
    resultGif.value = null
}

const generateGif = async () => {
    if (!window.GIF) return ElMessage.error('GIF 库加载失败，请检查网络')

    generating.value = true
    try {
        const gif = new window.GIF({
            workers: 2,
            quality: settings.quality,
            width: settings.width,
            height: settings.height,
            workerScript: '/lib/gif.worker.js' 
        })

        
        for (const item of images.value) {
            const img = new Image()
            await new Promise(resolve => {
                img.onload = resolve
                img.src = item.url
            })

            
            const canvas = document.createElement('canvas')
            canvas.width = settings.width
            canvas.height = settings.height
            const ctx = canvas.getContext('2d')

            
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, settings.width, settings.height)

            
            const scale = Math.min(settings.width / img.width, settings.height / img.height)
            const w = img.width * scale
            const h = img.height * scale
            const x = (settings.width - w) / 2
            const y = (settings.height - h) / 2

            ctx.drawImage(img, x, y, w, h)

            gif.addFrame(canvas, { delay: settings.delay })
        }

        gif.on('finished', (blob) => {
            resultGif.value = URL.createObjectURL(blob)
            resultSize.value = (blob.size / 1024).toFixed(2) + ' KB'
            generating.value = false
            ElMessage.success('GIF 生成成功')
        })

        gif.render()

    } catch (e) {
        console.error(e)
        ElMessage.error('生成失败: ' + e.message)
        generating.value = false
    }
}

const downloadGif = () => {
    const a = document.createElement('a')
    a.href = resultGif.value
    a.download = 'animation.gif'
    a.click()
}

onMounted(() => {
    if (!window.GIF) {
        const script = document.createElement('script')
        script.src = '/lib/gif.js' 
        document.head.appendChild(script)
    }
})
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
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
}

.layout-container {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 1.5rem;
}

.workspace {
    padding: 1.5rem;
    min-height: 500px;
    display: flex;
    flex-direction: column;
}

.toolbar {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.count-badge {
    font-size: 0.85rem;
    color: #64748b;
    margin-left: auto;
}

.empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px dashed #e2e8f0;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
    color: #94a3b8;
}

.empty-state:hover {
    border-color: #3b82f6;
    background: #eff6ff;
    color: #3b82f6;
}

.empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
}

.empty-state p {
    margin: 0 0 0.5rem;
    font-size: 1rem;
}

.empty-state .sub {
    font-size: 0.85rem;
    opacity: 0.8;
}

.images-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 1rem;
}

.image-card {
    background: #f8fafc;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    transition: all 0.2s;
    position: relative;
}

.image-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.card-preview {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    position: relative;
}

.card-preview img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

.frame-index {
    position: absolute;
    top: 4px;
    left: 4px;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
}

.card-actions {
    padding: 0.5rem;
    display: flex;
    justify-content: flex-end;
    border-top: 1px solid #f1f5f9;
}

.ghost {
    opacity: 0.5;
    border: 2px dashed #3b82f6;
}

.sidebar {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
}

.sidebar h3 {
    margin: 0 0 1.5rem;
    font-size: 1rem;
    color: #1e293b;
}

.settings-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-item .label {
    font-size: 0.85rem;
    color: #64748b;
    margin-bottom: 0.5rem;
}

.input-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.input-group .x {
    color: #64748b;
}

.hint {
    font-size: 0.75rem;
    color: #94a3b8;
    margin-top: 0.25rem;
}

.preview-result {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
}

.preview-result h4 {
    margin: 0;
    font-size: 0.95rem;
    color: #1e293b;
    align-self: flex-start;
}

.result-img-wrapper {
    max-width: 100%;
    max-height: 300px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
}

.result-img-wrapper img {
    max-width: 100%;
    display: block;
}

.result-info {
    font-size: 0.85rem;
    color: #64748b;
}

.download-btn {
    width: 100%;
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
