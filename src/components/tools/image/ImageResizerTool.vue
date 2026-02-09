<template>
    <div class="image-resizer-tool">
        
        <div class="nav-header">
            <button class="back-btn" @click="$router.back()">
                <el-icon>
                    <Back />
                </el-icon>
                <span>返回</span>
            </button>
        </div>

        
        <div class="tool-header">
            <h1 class="font-display">图片尺寸调整</h1>
            <p class="summary">按比例或固定尺寸批量调整图片大小，支持实时预览</p>
        </div>

        <div class="tool-content">
            
            <div class="upload-section glass-card" @dragover.prevent @drop.prevent="handleDrop">
                <div class="upload-area">
                    <el-icon class="upload-icon">
                        <UploadFilled />
                    </el-icon>
                    <div class="upload-text">
                        <h3>拖拽图片到这里</h3>
                        <p>或 <span class="browse-btn" @click="triggerFileInput">点击选择文件</span></p>
                    </div>
                    <input
ref="fileInput" type="file" multiple accept="image/*" class="hidden-input"
                        @change="handleFileSelect">
                </div>
            </div>

            
            <div v-if="fileList.length > 0" class="controls-section glass-card">
                <div class="settings-grid">
                    
                    <div class="setting-item full-width">
                        <label>缩放模式</label>
                        <div class="mode-tabs">
                            <button
:class="['mode-tab', resizeMode === 'percentage' ? 'active' : '']"
                                @click="resizeMode = 'percentage'">
                                按百分比
                            </button>
                            <button
:class="['mode-tab', resizeMode === 'fixed' ? 'active' : '']"
                                @click="resizeMode = 'fixed'">
                                固定尺寸
                            </button>
                        </div>
                    </div>

                    
                    <div v-if="resizeMode === 'percentage'" class="setting-item full-width">
                        <label>缩放比例 <span class="percentage-val">({{ percentage }}%)</span></label>
                        <div class="slider-container">
                            <input
v-model.number="percentage" type="range" min="1" max="200" step="1"
                                class="range-input">
                        </div>
                    </div>

                    
                    <div v-if="resizeMode === 'fixed'" class="setting-item">
                        <label>宽度 (px)</label>
                        <input v-model.number="fixedWidth" type="number" class="number-input" min="1" @input="handleWidthChange">
                    </div>
                    <div v-if="resizeMode === 'fixed'" class="setting-item">
                        <label>高度 (px)</label>
                        <input v-model.number="fixedHeight" type="number" class="number-input" min="1" @input="handleHeightChange">
                    </div>
                    <div v-if="resizeMode === 'fixed'" class="setting-item checkbox-item">
                        <label class="checkbox-label">
                            <input v-model="lockAspectRatio" type="checkbox">
                            锁定纵横比
                        </label>
                    </div>

                    
                    <div class="setting-item full-width">
                        <label>输出质量 ({{ Math.round(quality * 100) }}%)</label>
                        <input v-model.number="quality" type="range" min="0.1" max="1" step="0.05" class="range-input">
                    </div>
                </div>

                <div class="action-buttons">
                    <button class="btn-primary" :disabled="isProcessing" @click="startProcessing">
                        <el-icon v-if="isProcessing"><Loading /></el-icon>
                        <el-icon v-else><Check /></el-icon>
                        {{ isProcessing ? '处理中...' : '开始处理' }}
                    </button>
                    <button class="btn-secondary" :disabled="isProcessing" @click="clearAll">清空列表</button>
                </div>
            </div>

            
            <div v-if="fileList.length > 0" class="file-list">
                <div v-for="(file, index) in fileList" :key="index" class="file-item glass-card">
                    <div class="file-left">
                        <div v-if="file.thumbUrl" class="file-thumb" :style="{ backgroundImage: `url(${file.thumbUrl})` }">
                        </div>
                        <div class="file-info-text">
                            <span class="file-name" :title="file.file.name">{{ file.file.name }}</span>
                            <div class="size-info">
                                <span class="badge old">{{ file.width }}x{{ file.height }}</span>
                                <el-icon><Right /></el-icon>
                                <span class="badge new">{{ getTargetDims(file).width }}x{{ getTargetDims(file).height }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="file-actions">
                         <div v-if="file.status === 'done'" class="result-info">
                            <span class="size-diff">{{ formatSize(file.resultBlob.size) }}</span>
                            <button class="btn-icon" title="对比预览" @click="previewFile(file)">
                                <el-icon><View /></el-icon>
                            </button>
                            <button class="btn-icon primary" title="下载" @click="downloadFile(file)">
                                <el-icon><Download /></el-icon>
                            </button>
                        </div>
                        <span v-else-if="file.status === 'error'" class="status-error">失败</span>
                        <span v-else class="status-pending">{{ file.status === 'processing' ? '处理中...' : '等待处理' }}</span>
                    </div>
                </div>
            </div>
        </div>

        
        <div v-if="showPreview" class="modal-overlay" @click.self="showPreview = false">
            <div class="modal-content glass-card">
                <div class="modal-header">
                    <h3>效果预览</h3>
                    <button class="close-btn" @click="showPreview = false"><el-icon><Close /></el-icon></button>
                </div>
                <div v-if="previewItem" class="preview-body">
                    <div class="preview-box">
                        <h4>原图 ({{ formatSize(previewItem.file.size) }})</h4>
                        <img :src="previewItem.thumbUrl" class="preview-img">
                    </div>
                    <div class="preview-box">
                        <h4>处理后 ({{ formatSize(previewItem.resultBlob.size) }})</h4>
                        <img :src="previewItem.resultUrl" class="preview-img">
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Back, UploadFilled, Check, Loading, Right, Download, View, Close, ScaleToOriginal } from '@element-plus/icons-vue'

const fileInput = ref(null)
const fileList = ref([])
const resizeMode = ref('percentage') 
const percentage = ref(50)
const fixedWidth = ref(800)
const fixedHeight = ref(600)
const lockAspectRatio = ref(true)
const quality = ref(0.9)
const isProcessing = ref(false)


const showPreview = ref(false)
const previewItem = ref(null)

const triggerFileInput = () => {
    fileInput.value.click()
}

const handleFileSelect = (event) => {
    addFiles(event.target.files)
    event.target.value = ''
}

const handleDrop = (event) => {
    addFiles(event.dataTransfer.files)
}

const addFiles = (files) => {
    for (let i = 0; i < files.length; i++) {
        if (files[i].type.startsWith('image/')) {
            const file = files[i]
            const item = {
                file: file,
                status: 'pending',
                width: 0,
                height: 0,
                thumbUrl: null,
                resultUrl: null,
                resultBlob: null
            }
            
            
            const reader = new FileReader()
            reader.onload = (e) => {
                item.thumbUrl = e.target.result
                const img = new Image()
                img.onload = () => {
                    item.width = img.width
                    item.height = img.height
                    
                    
                    if (fileList.value.length === 1 && fixedWidth.value === 800) { 
                        fixedWidth.value = img.width
                        fixedHeight.value = img.height
                    }
                }
                img.src = e.target.result
            }
            reader.readAsDataURL(file)
            
            fileList.value.push(item)
        }
    }
}

const clearAll = () => {
    fileList.value.forEach(f => {
        if (f.resultUrl) URL.revokeObjectURL(f.resultUrl)
    })
    fileList.value = []
}


const getTargetDims = (file) => {
    if (!file.width) return { width: 0, height: 0 }
    
    if (resizeMode.value === 'percentage') {
        const scale = percentage.value / 100
        return {
            width: Math.round(file.width * scale),
            height: Math.round(file.height * scale)
        }
    } else {
        
        
        
        
        
        
        
        
        
        
        
        
        if (lockAspectRatio.value && fixedWidth.value) {
            const ratio = file.height / file.width
            return {
                width: fixedWidth.value,
                height: Math.round(fixedWidth.value * ratio)
            }
        }
        
        return {
            width: fixedWidth.value,
            height: fixedHeight.value
        }
    }
}


const handleWidthChange = () => {
    if (lockAspectRatio.value && fileList.value.length > 0 && fileList.value[0].width) {
        
        const ratio = fileList.value[0].height / fileList.value[0].width
        fixedHeight.value = Math.round(fixedWidth.value * ratio)
    }
}

const handleHeightChange = () => {
    if (lockAspectRatio.value && fileList.value.length > 0 && fileList.value[0].height) {
        const ratio = fileList.value[0].width / fileList.value[0].height
        fixedWidth.value = Math.round(fixedHeight.value * ratio)
    }
}

const processFile = (item) => {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
            const dims = getTargetDims(item)
            const canvas = document.createElement('canvas')
            canvas.width = dims.width
            canvas.height = dims.height
            const ctx = canvas.getContext('2d')
            
            
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = 'high'
            
            ctx.drawImage(img, 0, 0, dims.width, dims.height)
            
            canvas.toBlob((blob) => {
                if (blob) {
                    if (item.resultUrl) URL.revokeObjectURL(item.resultUrl)
                    item.resultBlob = blob
                    item.resultUrl = URL.createObjectURL(blob)
                    item.status = 'done'
                    resolve()
                } else {
                    item.status = 'error'
                    reject()
                }
            }, item.file.type, quality.value)
        }
        img.onerror = () => {
            item.status = 'error'
            reject()
        }
        img.src = item.thumbUrl
    })
}

const startProcessing = async () => {
    if (isProcessing.value) return
    isProcessing.value = true
    
    
    
    
    
    for (const item of fileList.value) {
        item.status = 'processing'
        try {
            await processFile(item)
        } catch (e) {
            console.error(e)
        }
    }
    
    isProcessing.value = false
}

const formatSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const previewFile = (item) => {
    previewItem.value = item
    showPreview.value = true
}

const downloadFile = (item) => {
    if (!item.resultUrl) return
    const link = document.createElement('a')
    link.href = item.resultUrl
    
    
    const nameParts = item.file.name.split('.')
    const ext = nameParts.pop()
    const name = nameParts.join('.')
    const dims = getTargetDims(item)
    link.download = `${name}-${dims.width}x${dims.height}.${ext}`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}
</script>

<style scoped>
.image-resizer-tool {
    max-width: 1000px;
    margin: 0 auto;
    padding: 40px 20px;
}

.nav-header {
    margin-bottom: 20px;
}

.back-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 1rem;
    padding: 8px 16px;
    border-radius: 8px;
    transition: all 0.2s;
}

.back-btn:hover {
    background: rgba(0, 0, 0, 0.05);
    color: var(--text-primary);
}

.tool-header {
    text-align: center;
    margin-bottom: 40px;
}

.tool-header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 16px;
    background: var(--accent-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.summary {
    color: var(--text-secondary);
    font-size: 1.1rem;
}

.upload-section {
    margin-bottom: 30px;
}

.upload-area {
    border: 2px dashed var(--border-color);
    border-radius: 16px;
    padding: 40px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    background: rgba(255, 255, 255, 0.5);
}

.upload-area:hover {
    border-color: var(--accent-purple);
    background: rgba(255, 255, 255, 0.8);
}

.upload-icon {
    font-size: 48px;
    color: var(--text-muted);
    margin-bottom: 16px;
}

.upload-text h3 {
    font-size: 1.1rem;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.browse-btn {
    color: var(--accent-purple);
    font-weight: 600;
    cursor: pointer;
}

.hidden-input {
    display: none;
}


.controls-section {
    padding: 24px;
    margin-bottom: 30px;
    background: white;
    border-radius: 16px;
}

.settings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 24px;
    margin-bottom: 24px;
}

.full-width {
    grid-column: 1 / -1;
}

.setting-item label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: var(--text-primary);
    font-size: 0.95rem;
}

.mode-tabs {
    display: flex;
    gap: 4px;
    background: var(--bg-secondary);
    padding: 4px;
    border-radius: 10px;
    width: fit-content;
}

.mode-tab {
    padding: 8px 16px;
    border: none;
    background: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    color: var(--text-secondary);
    transition: all 0.2s;
}

.mode-tab.active {
    background: white;
    color: var(--accent-purple);
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.number-input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 1rem;
}

.range-input {
    width: 100%;
    height: 6px;
    background: var(--border-color);
    border-radius: 3px;
    -webkit-appearance: none;
    padding: 0;
    cursor: pointer;
}

.range-input::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    background: var(--accent-purple);
    border-radius: 50%;
    cursor: pointer;
}

.percentage-val {
    display: inline-block;
    width: 50px;
    text-align: right;
    font-variant-numeric: tabular-nums;
}

.checkbox-item {
    display: flex;
    align-items: flex-end;
    padding-bottom: 10px;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
}

.action-buttons {
    display: flex;
    gap: 12px;
    padding-top: 20px;
    border-top: 1px solid var(--border-color);
}

.btn-primary, .btn-secondary {
    padding: 10px 24px;
    border-radius: 10px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
    font-size: 1rem;
}

.btn-primary {
    background: var(--accent-gradient);
    color: white;
}

.btn-primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.btn-secondary {
    background: var(--bg-secondary);
    color: var(--text-primary);
}


.file-list {
    display: grid;
    gap: 16px;
}

.file-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background: white;
    border-radius: 12px;
    border: 1px solid var(--border-color);
    transition: all 0.2s;
}

.file-left {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
    min-width: 0; 
}

.file-thumb {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    background-size: cover;
    background-position: center;
    background-color: var(--bg-secondary);
}

.file-info-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
}

.file-name {
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.size-info {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-secondary);
    font-size: 0.85rem;
}

.badge {
    background: var(--bg-secondary);
    padding: 2px 6px;
    border-radius: 4px;
}

.badge.new {
    background: #e0f2fe;
    color: #0284c7;
}

.file-actions {
    display: flex;
    align-items: center;
    gap: 16px;
}

.result-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.size-diff {
    font-weight: 500;
    color: var(--text-primary);
}

.btn-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background: white;
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.btn-icon:hover {
    border-color: var(--accent-purple);
    color: var(--accent-purple);
}

.btn-icon.primary {
    background: var(--bg-secondary);
    border: none;
    color: var(--text-primary);
}

.btn-icon.primary:hover {
    background: var(--accent-purple);
    color: white;
}


.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
}

.modal-content {
    width: 90%;
    max-width: 1000px;
    height: 80vh;
    background: white;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.modal-header {
    padding: 20px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h3 {
    margin: 0;
    font-size: 1.2rem;
}

.close-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.25rem;
    padding: 4px;
    color: var(--text-secondary);
}

.preview-body {
    flex: 1;
    display: flex;
    padding: 20px;
    gap: 20px;
    overflow: hidden;
}

.preview-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
}

.preview-box h4 {
    text-align: center;
    color: var(--text-secondary);
}

.preview-img {
    flex: 1;
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: url('data:image/svg+xml;utf8,<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="10" height="10" fill="%23f0f0f0"/><rect x="10" y="10" width="10" height="10" fill="%23f0f0f0"/></svg>');
    border: 1px solid var(--border-color);
    border-radius: 8px;
}
</style>
