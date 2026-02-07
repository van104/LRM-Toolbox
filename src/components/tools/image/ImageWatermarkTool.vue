<template>
    <div class="tool-page">
        
        <header class="tool-header">
            <div class="header-left">
                <el-button text @click="goBack">
                    <el-icon>
                        <ArrowLeft />
                    </el-icon>
                    <span>返回</span>
                </el-button>
            </div>
            <div class="header-center">
                <h1 class="tool-title">图片水印添加</h1>
                <span class="tool-subtitle">Batch Image Watermark Tool</span>
            </div>
            <div class="header-right">
                <el-button-group>
                    <el-button type="danger" :disabled="!images.length" @click="clearAll">
                        <el-icon>
                            <Delete />
                        </el-icon> 清空
                    </el-button>
                    <el-button type="primary" :disabled="!images.length" @click="downloadAll">
                        <el-icon>
                            <Download />
                        </el-icon> 批量下载
                    </el-button>
                </el-button-group>
            </div>
        </header>

        <main class="tool-content">
            <div class="layout-container">
                
                <div class="workbench glass-card">
                    <div v-if="!images.length" class="upload-placeholder" @click="triggerUpload">
                        <div class="upload-icon">
                            <el-icon>
                                <PictureFilled />
                            </el-icon>
                        </div>
                        <h3>点击或拖拽上传图片</h3>
                        <p>支持多选，所有处理均在本地进行，不上传服务器</p>
                        <input type="file" ref="fileRef" multiple hidden accept="image/*" @change="handleUpload" />
                    </div>

                    <div v-else class="preview-stage">
                        <div class="canvas-container" ref="stageContainer">
                            <canvas ref="previewCanvas"></canvas>
                        </div>
                        <div class="stage-footer">
                            <div class="pagination">
                                <el-button circle :disabled="currentIndex === 0" @click="currentIndex--">
                                    <el-icon>
                                        <ArrowLeft />
                                    </el-icon>
                                </el-button>
                                <span class="page-info">{{ currentIndex + 1 }} / {{ images.length }}</span>
                                <el-button circle :disabled="currentIndex === images.length - 1"
                                    @click="currentIndex++">
                                    <el-icon>
                                        <ArrowRight />
                                    </el-icon>
                                </el-button>
                            </div>
                            <div class="current-name">{{ images[currentIndex]?.name }}</div>
                        </div>
                    </div>
                </div>

                
                <div class="settings-panel glass-card">
                    <el-tabs v-model="activeType" class="watermark-tabs">
                        <el-tab-pane label="文字水印" name="text">
                            <div class="settings-group">
                                <div class="label">水印文字</div>
                                <el-input v-model="config.text" placeholder="输入水印文字..." @input="debouncedRender" />
                            </div>

                            <div class="settings-row">
                                <div class="settings-item half">
                                    <div class="label">字体大小</div>
                                    <el-input-number v-model="config.fontSize" :min="10" :max="500"
                                        @change="debouncedRender" />
                                </div>
                                <div class="settings-item half">
                                    <div class="label">文字颜色</div>
                                    <el-color-picker v-model="config.color" show-alpha @change="debouncedRender" />
                                </div>
                            </div>

                            <div class="settings-group">
                                <div class="label">描边设置</div>
                                <div class="flex items-center gap-2">
                                    <el-switch v-model="config.stroke" @change="debouncedRender" />
                                    <el-color-picker v-if="config.stroke" v-model="config.strokeColor" size="small"
                                        @change="debouncedRender" />
                                </div>
                            </div>
                        </el-tab-pane>

                        <el-tab-pane label="图片水印" name="image">
                            <div class="settings-group">
                                <div class="label">水印图片</div>
                                <div class="logo-uploader" @click="triggerLogoUpload">
                                    <img v-if="config.logoUrl" :src="config.logoUrl" class="logo-preview" />
                                    <div v-else class="logo-placeholder">
                                        <el-icon>
                                            <Plus />
                                        </el-icon>
                                        <span>选择图片</span>
                                    </div>
                                    <input type="file" ref="logoRef" hidden accept="image/*"
                                        @change="handleLogoUpload" />
                                </div>
                            </div>
                            <div class="settings-group">
                                <div class="label">缩放比例 ({{ config.logoScale }}%)</div>
                                <el-slider v-model="config.logoScale" :min="1" :max="200" @input="debouncedRender" />
                            </div>
                        </el-tab-pane>
                    </el-tabs>

                    <el-divider />

                    
                    <div class="shared-settings">
                        <div class="settings-group">
                            <div class="label">水印密度</div>
                            <el-radio-group v-model="config.mode" @change="debouncedRender" class="mode-group">
                                <el-radio-button value="single">单位置</el-radio-button>
                                <el-radio-button value="tile">全屏平铺</el-radio-button>
                            </el-radio-group>
                        </div>

                        <div v-if="config.mode === 'single'" class="settings-group">
                            <div class="label">位置设定</div>
                            <div class="position-grid">
                                <div v-for="p in positions" :key="p.key" class="pos-dot"
                                    :class="{ active: config.position === p.key }"
                                    @click="config.position = p.key; debouncedRender()" :title="p.label"></div>
                            </div>
                        </div>

                        <div v-if="config.mode === 'tile'" class="settings-row">
                            <div class="settings-item half">
                                <div class="label">水平间距</div>
                                <el-input-number v-model="config.spacingX" :min="0" :max="1000"
                                    @change="debouncedRender" />
                            </div>
                            <div class="settings-item half">
                                <div class="label">垂直间距</div>
                                <el-input-number v-model="config.spacingY" :min="0" :max="1000"
                                    @change="debouncedRender" />
                            </div>
                        </div>

                        <div class="settings-row">
                            <div class="settings-item half">
                                <div class="label">透明度 ({{ config.opacity }})</div>
                                <el-slider v-model="config.opacity" :min="0" :max="1" :step="0.1"
                                    @input="debouncedRender" />
                            </div>
                            <div class="settings-item half">
                                <div class="label">旋转角度 ({{ config.rotate }}°)</div>
                                <el-slider v-model="config.rotate" :min="-180" :max="180" @input="debouncedRender" />
                            </div>
                        </div>

                        <div v-if="config.mode === 'single'" class="settings-row">
                            <div class="settings-item half">
                                <div class="label">水平偏移</div>
                                <el-input-number v-model="config.offsetX" @change="debouncedRender" />
                            </div>
                            <div class="settings-item half">
                                <div class="label">垂直偏移</div>
                                <el-input-number v-model="config.offsetY" @change="debouncedRender" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        
        <footer class="footer">
            © 2026 LRM工具箱 - 图片水印添加
        </footer>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElLoading } from 'element-plus'
import {
    ArrowLeft, ArrowRight, Delete, Download,
    PictureFilled, Plus, Setting
} from '@element-plus/icons-vue'

const router = useRouter()
const goBack = () => router.back()


const images = ref([])
const currentIndex = ref(0)
const activeType = ref('text') 
const fileRef = ref(null)
const logoRef = ref(null)
const previewCanvas = ref(null)
const stageContainer = ref(null)

const config = reactive({
    text: 'LRM工具箱 - 水印预览',
    fontSize: 40,
    color: 'rgba(255, 255, 255, 0.5)',
    stroke: false,
    strokeColor: 'rgba(0, 0, 0, 0.5)',

    logoUrl: '',
    logoImg: null,
    logoScale: 100,

    mode: 'single', 
    position: 'center', 
    opacity: 0.5,
    rotate: -30,
    offsetX: 0,
    offsetY: 0,
    spacingX: 100,
    spacingY: 100
})

const positions = [
    { key: 'tl', label: '左上' }, { key: 'tc', label: '中上' }, { key: 'tr', label: '右上' },
    { key: 'ml', label: '左中' }, { key: 'center', label: '中间' }, { key: 'mr', label: '右中' },
    { key: 'bl', label: '左下' }, { key: 'bc', label: '中下' }, { key: 'br', label: '右下' }
]



const triggerUpload = () => fileRef.value?.click()
const triggerLogoUpload = () => logoRef.value?.click()

const handleUpload = (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    const newImages = files.map(file => ({
        file,
        name: file.name,
        url: URL.createObjectURL(file),
        img: null 
    }))

    images.value = [...images.value, ...newImages]
    loadCurrentImage()
}

const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    config.logoUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
        config.logoImg = img
        debouncedRender()
    }
    img.src = config.logoUrl
}

const loadCurrentImage = () => {
    if (!images.value.length) return
    const current = images.value[currentIndex.value]
    if (current.img) {
        render()
        return
    }

    const img = new Image()
    img.onload = () => {
        current.img = img
        render()
    }
    img.src = current.url
}

watch(currentIndex, loadCurrentImage)

let renderTimer = null
const debouncedRender = () => {
    if (renderTimer) clearTimeout(renderTimer)
    renderTimer = setTimeout(render, 50)
}

const render = () => {
    const current = images.value[currentIndex.value]
    if (!current || !current.img || !previewCanvas.value) return

    const canvas = previewCanvas.value
    const ctx = canvas.getContext('2d')
    const { img } = current

    
    canvas.width = img.width
    canvas.height = img.height

    
    const container = stageContainer.value
    if (!container || !img.width || !img.height) return
    const scale = Math.min(container.clientWidth / img.width, container.clientHeight / img.height, 1)
    canvas.style.width = `${img.width * scale}px`
    canvas.style.height = `${img.height * scale}px`

    
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0)

    
    drawWatermark(ctx, canvas.width, canvas.height)
}

const drawWatermark = (ctx, w, h) => {
    ctx.save()
    ctx.globalAlpha = config.opacity

    if (activeType.value === 'text') {
        ctx.font = `${config.fontSize}px sans-serif`
        ctx.fillStyle = config.color
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'center'
        if (config.stroke) {
            ctx.strokeStyle = config.strokeColor
            ctx.lineWidth = 2
        }
    }

    if (config.mode === 'tile') {
        renderTile(ctx, w, h)
    } else {
        renderSingle(ctx, w, h)
    }

    ctx.restore()
}

const renderSingle = (ctx, w, h) => {
    let x, y
    const pos = config.position
    const padding = 20

    
    let ww = 0, wh = 0
    if (activeType.value === 'text') {
        const metrics = ctx.measureText(config.text)
        ww = metrics.width
        wh = config.fontSize
    } else if (config.logoImg) {
        ww = config.logoImg.width * (config.logoScale / 100)
        wh = config.logoImg.height * (config.logoScale / 100)
    }

    
    if (pos.includes('l')) x = padding + ww / 2
    else if (pos.includes('r')) x = w - padding - ww / 2
    else x = w / 2

    if (pos.includes('t')) y = padding + wh / 2
    else if (pos.includes('b')) y = h - padding - wh / 2
    else y = h / 2

    
    x += config.offsetX
    y += config.offsetY

    
    ctx.translate(x, y)
    ctx.rotate((config.rotate * Math.PI) / 180)

    if (activeType.value === 'text') {
        if (config.stroke) ctx.strokeText(config.text, 0, 0)
        ctx.fillText(config.text, 0, 0)
    } else if (config.logoImg) {
        ctx.drawImage(config.logoImg, -ww / 2, -wh / 2, ww, wh)
    }
}

const renderTile = (ctx, w, h) => {
    let ww = 0, wh = 0
    if (activeType.value === 'text') {
        ww = ctx.measureText(config.text).width
        wh = config.fontSize
    } else if (config.logoImg) {
        ww = config.logoImg.width * (config.logoScale / 100)
        wh = config.logoImg.height * (config.logoScale / 100)
    }

    const stepX = Math.max(ww + config.spacingX, 20)
    const stepY = Math.max(wh + config.spacingY, 20)

    
    for (let y = -h; y < h * 2; y += stepY) {
        for (let x = -w; x < w * 2; x += stepX) {
            ctx.save()
            ctx.translate(x, y)
            ctx.rotate((config.rotate * Math.PI) / 180)
            if (activeType.value === 'text') {
                if (config.stroke) ctx.strokeText(config.text, 0, 0)
                ctx.fillText(config.text, 0, 0)
            } else if (config.logoImg) {
                ctx.drawImage(config.logoImg, -ww / 2, -wh / 2, ww, wh)
            }
            ctx.restore()
        }
    }
}

const clearAll = () => {
    images.value.forEach(img => URL.revokeObjectURL(img.url))
    images.value = []
    currentIndex.value = 0
}

const downloadAll = async () => {
    const loading = ElLoading.service({ text: '正在处理并下载...', background: 'rgba(0,0,0,0.7)' })
    try {
        for (const imgData of images.value) {
            if (!imgData.img) continue

            const tempCanvas = document.createElement('canvas')
            tempCanvas.width = imgData.img.width
            tempCanvas.height = imgData.img.height
            const tctx = tempCanvas.getContext('2d')

            tctx.drawImage(imgData.img, 0, 0)
            drawWatermark(tctx, tempCanvas.width, tempCanvas.height)

            const blob = await new Promise(resolve => tempCanvas.toBlob(resolve, 'image/png'))
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `watermark_${imgData.name}`
            a.click()
            URL.revokeObjectURL(url)
            
            await new Promise(r => setTimeout(r, 200))
        }
        ElMessage.success('批量下载已启动')
    } catch (err) {
        ElMessage.error('下载过程中出错')
        console.error(err)
    } finally {
        loading.close()
    }
}

onMounted(() => {
    window.addEventListener('resize', render)
})

onUnmounted(() => {
    window.removeEventListener('resize', render)
    images.value.forEach(img => URL.revokeObjectURL(img.url))
    if (config.logoUrl) URL.revokeObjectURL(config.logoUrl)
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
    background: #ffffff;
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
    height: calc(100vh - 200px);
    min-height: 600px;
}


.workbench {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    background: #f8fafc;
}

.upload-placeholder {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
    margin: 2rem;
    cursor: pointer;
    transition: all 0.3s;
    background: rgba(255, 255, 255, 0.5);
}

.upload-placeholder:hover {
    border-color: #3b82f6;
    background: #eff6ff;
}

.upload-icon {
    font-size: 4rem;
    color: #94a3b8;
    margin-bottom: 1rem;
}

.preview-stage {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1rem;
}

.canvas-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background-image: linear-gradient(45deg, #e5e7eb 25%, transparent 25%),
        linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #e5e7eb 75%),
        linear-gradient(-45deg, transparent 75%, #e5e7eb 75%);
    background-size: 20px 20px;
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
    border-radius: 8px;
}

.stage-footer {
    padding: 1rem 0 0.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.pagination {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.page-info {
    font-weight: 500;
    font-family: monospace;
}

.current-name {
    font-size: 0.85rem;
    color: #64748b;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}


.settings-panel {
    padding: 1.5rem;
    overflow-y: auto;
    background: #fff;
}

.settings-group {
    margin-bottom: 1.25rem;
}

.settings-row {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.25rem;
}

.settings-item.half {
    flex: 1;
}

.label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #475569;
    margin-bottom: 0.5rem;
}

.flex {
    display: flex;
}

.items-center {
    align-items: center;
}

.gap-2 {
    gap: 0.5rem;
}

.mode-group :deep(.el-radio-button__inner) {
    width: 100%;
}

.mode-group {
    width: 100%;
}


.position-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    width: 120px;
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


.logo-uploader {
    height: 100px;
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


.glass-card {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

@media (max-width: 992px) {
    .layout-container {
        grid-template-columns: 1fr;
        height: auto;
    }
}

.footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
}
</style>
