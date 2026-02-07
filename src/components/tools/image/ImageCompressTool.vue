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
      <h1 class="tool-title">图片压缩</h1>
      <div class="header-right">
        <el-button text @click="clearAll">
          <el-icon>
            <Delete />
          </el-icon>
          <span>清空</span>
        </el-button>
      </div>
    </header>

    <div class="tool-content">
      
      <div v-if="!originalImage" class="upload-container">
        <el-upload class="image-uploader" drag action="#" :auto-upload="false" :show-file-list="false"
          :on-change="handleFileChange" accept="image/*">
          <el-icon class="el-icon--upload">
            <UploadFilled />
          </el-icon>
          <div class="el-upload__text">
            拖拽图片到此处或 <em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持 JPG, PNG, WebP 等常见格式，浏览器本地压缩，保护隐私
            </div>
          </template>
        </el-upload>
      </div>

      
      <div v-else class="workspace">
        
        <aside class="settings-panel">
          <h3 class="panel-title">压缩设置</h3>

          <div class="setting-item">
            <div class="setting-label">
              <span>压缩质量</span>
              <span class="value">{{ Math.round(options.quality * 100) }}%</span>
            </div>
            <el-slider v-model="options.quality" :min="0.1" :max="1" :step="0.01"
              :format-tooltip="val => Math.round(val * 100) + '%'" @change="compressImage" />
          </div>

          <div class="setting-item">
            <div class="setting-label">最大尺寸 (px)</div>
            <div class="size-inputs">
              <el-input v-model.number="options.maxWidthOrHeight" placeholder="自动" type="number"
                @change="compressImage">
                <template #prepend>宽/高</template>
              </el-input>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-label">输出格式</div>
            <el-select v-model="options.fileType" @change="compressImage">
              <el-option label="保持原样" value="" />
              <el-option label="JPEG" value="image/jpeg" />
              <el-option label="PNG" value="image/png" />
              <el-option label="WebP" value="image/webp" />
            </el-select>
          </div>

          <div class="actions">
            <el-button type="primary" size="large" @click="downloadImage" :disabled="!compressedImage"
              class="full-width">
              <el-icon>
                <Download />
              </el-icon>
              下载压缩图
            </el-button>
            <el-button size="large" @click="clearAll" class="full-width">
              重新上传
            </el-button>
          </div>
        </aside>

        
        <main class="preview-area">
          
          <div class="preview-card original">
            <div class="card-header">
              <span class="badge">原图</span>
              <span class="file-size">{{ originalSizeStr }}</span>
            </div>
            <div class="image-wrapper">
              <img :src="originalInfo.url" alt="Original" />
            </div>
            <div class="file-info">{{ originalInfo.name }}</div>
          </div>

          
          <div class="process-arrow">
            <el-icon :size="32" :class="{ 'is-loading': compressing }">
              <Right v-if="!compressing" />
              <Loading v-else />
            </el-icon>
            <span v-if="compressing">压缩中...</span>
            <span v-else class="reduction-rate" :class="{ 'good': reductionRate > 0 }">
              -{{ reductionRate }}%
            </span>
          </div>

          
          <div class="preview-card result">
            <div class="card-header">
              <span class="badge success">压缩后</span>
              <span class="file-size">{{ compressedSizeStr }}</span>
            </div>
            <div class="image-wrapper">
              <img v-if="compressedInfo.url" :src="compressedInfo.url" alt="Compressed" />
              <div v-else class="placeholder">
                <el-icon class="is-loading">
                  <Loading />
                </el-icon>
              </div>
            </div>
            <div class="file-info">
              {{ compressedInfo.name || '等待处理...' }}
            </div>
          </div>
        </main>
      </div>
    </div>

    <footer class="footer">
      © 2026 LRM工具箱 - 图片压缩
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft, Delete, UploadFilled, Download,
  Right, Loading
} from '@element-plus/icons-vue'
import imageCompression from 'browser-image-compression'

const router = useRouter()


const originalImage = ref(null)
const compressedImage = ref(null)
const compressing = ref(false)

const originalInfo = ref({ name: '', size: 0, url: '' })
const compressedInfo = ref({ name: '', size: 0, url: '' })


const options = ref({
  maxSizeMB: 1, 
  maxWidthOrHeight: 1920,
  quality: 0.8,
  useWebWorker: true,
  fileType: '' 
})


const originalSizeStr = computed(() => formatSize(originalInfo.value.size))
const compressedSizeStr = computed(() => formatSize(compressedInfo.value.size))

const reductionRate = computed(() => {
  if (!originalInfo.value.size || !compressedInfo.value.size) return 0
  const rate = ((originalInfo.value.size - compressedInfo.value.size) / originalInfo.value.size) * 100
  return rate.toFixed(1)
})


function handleFileChange(file) {
  const rawFile = file.raw
  if (!rawFile) return

  
  if (!rawFile.type.startsWith('image/')) {
    ElMessage.error('请上传图片文件')
    return
  }

  originalImage.value = rawFile
  originalInfo.value = {
    name: rawFile.name,
    size: rawFile.size,
    url: URL.createObjectURL(rawFile)
  }

  
  compressImage()
}


async function compressImage() {
  if (!originalImage.value) return

  compressing.value = true

  try {
    const config = {
      ...options.value,
      
      maxWidthOrHeight: options.value.maxWidthOrHeight || undefined,
      
      
      maxSizeMB: 50 
    }

    
    if (options.value.fileType) {
      config.fileType = options.value.fileType
    }

    const compressedFile = await imageCompression(originalImage.value, config)

    compressedImage.value = compressedFile
    compressedInfo.value = {
      name: compressedFile.name,
      size: compressedFile.size,
      url: URL.createObjectURL(compressedFile)
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('压缩失败: ' + error.message)
  } finally {
    compressing.value = false
  }
}


function downloadImage() {
  if (!compressedImage.value) return

  const link = document.createElement('a')
  link.href = compressedInfo.value.url
  link.download = compressedInfo.value.name
  link.click()
  ElMessage.success('开始下载')
}


function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

function clearAll() {
  
  if (originalInfo.value.url) URL.revokeObjectURL(originalInfo.value.url)
  if (compressedInfo.value.url) URL.revokeObjectURL(compressedInfo.value.url)

  originalImage.value = null
  compressedImage.value = null
  originalInfo.value = { name: '', size: 0, url: '' }
  compressedInfo.value = { name: '', size: 0, url: '' }
  options.value.quality = 0.8
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.tool-page {
  min-height: 100vh;
  background: #f0f4f8;
  display: flex;
  flex-direction: column;
}

.tool-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.tool-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.header-left,
.header-right {
  width: 100px;
}

.tool-content {
  flex: 1;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
}


.upload-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-radius: 16px;
  min-height: 400px;
}

.image-uploader :deep(.el-upload-dragger) {
  width: 500px;
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #e2e8f0;
  border-radius: 16px;
  transition: all 0.3s;
}

.image-uploader :deep(.el-upload-dragger:hover) {
  border-color: var(--accent-cyan);
  background: rgba(6, 182, 212, 0.05);
}

.el-icon--upload {
  font-size: 64px;
  color: #94a3b8;
  margin-bottom: 1rem;
}


.workspace {
  display: flex;
  gap: 2rem;
  height: calc(100vh - 150px);
}


.settings-panel {
  width: 320px;
  background: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: fit-content;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.panel-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.full-width {
  width: 100%;
}

.actions {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}


.preview-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: #ffffff;
  border-radius: 16px;
  padding: 2rem;
  overflow: hidden;
}

.preview-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 45%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.badge {
  padding: 0.25rem 0.75rem;
  background: #f1f5f9;
  border-radius: 99px;
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.badge.success {
  background: #dcfce7;
  color: #166534;
}

.file-size {
  font-family: monospace;
  font-weight: 600;
  color: #1e293b;
}

.image-wrapper {
  flex: 1;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: repeating-conic-gradient(#f1f5f9 0% 25%, white 0% 50%) 50% / 20px 20px;
  position: relative;
}

.image-wrapper img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.file-info {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}


.process-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #94a3b8;
  font-size: 0.875rem;
}

.reduction-rate {
  font-weight: 700;
}

.reduction-rate.good {
  color: #10b981;
}


@media (max-width: 1024px) {
  .workspace {
    flex-direction: column;
    height: auto;
  }

  .settings-panel {
    width: 100%;
  }
}


[data-theme="dark"] .tool-page {
  background: var(--bg-primary);
}

[data-theme="dark"] .tool-header {
  background: var(--bg-secondary);
  border-color: var(--border-color);
}

[data-theme="dark"] .tool-title {
  color: var(--text-primary);
}

[data-theme="dark"] .upload-container,
[data-theme="dark"] .settings-panel,
[data-theme="dark"] .preview-area {
  background: var(--bg-secondary);
}

[data-theme="dark"] .image-uploader :deep(.el-upload-dragger) {
  background: transparent;
  border-color: var(--border-color);
}


.footer {
  text-align: center;
  padding: 3rem 0;
  color: var(--text-secondary, #64748b);
  font-size: 0.85rem;
}
</style>
