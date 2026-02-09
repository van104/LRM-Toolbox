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
      <h1 class="tool-title">二维码工具</h1>
      <div class="header-right">
        
      </div>
    </header>

    <div class="tool-content">
      
      <div class="tabs-header">
        <button :class="['tab-btn', { active: currentTab === 'generate' }]" @click="currentTab = 'generate'">📤
          生成二维码</button>
        <button :class="['tab-btn', { active: currentTab === 'scan' }]" @click="currentTab = 'scan'">📥 解析二维码</button>
      </div>

      
      <div v-if="currentTab === 'generate'" class="layout-container">
        
        <aside class="settings-panel">
          <div class="input-group">
            <div class="label">内容输入</div>
            <el-input
v-model="generate.content" type="textarea" :rows="5" placeholder="输入文本或网址..." resize="none"
              @input="debouncedGenerate" />
          </div>

          <div class="settings-group">
            <div class="group-title">样式设置</div>

            <div class="setting-item">
              <span class="label">纠错等级</span>
              <el-radio-group v-model="generate.options.errorCorrectionLevel" size="small" @change="generateQRCode">
                <el-radio-button label="L">低 (7%)</el-radio-button>
                <el-radio-button label="M">中 (15%)</el-radio-button>
                <el-radio-button label="Q">高 (25%)</el-radio-button>
                <el-radio-button label="H">极高 (30%)</el-radio-button>
              </el-radio-group>
            </div>

            <div class="setting-item">
              <span class="label">尺寸 (px)</span>
              <el-slider
v-model="generate.options.width" :min="100" :max="1000" :step="10" show-input
                @change="generateQRCode" />
            </div>

            <div class="setting-item">
              <span class="label">边距</span>
              <el-input-number
v-model="generate.options.margin" :min="0" :max="10" size="small"
                @change="generateQRCode" />
            </div>

            <div class="color-settings">
              <div class="color-item">
                <span class="label">前景色</span>
                <el-color-picker v-model="generate.options.color.dark" size="default" @change="generateQRCode" />
              </div>
              <div class="color-item">
                <span class="label">背景色</span>
                <el-color-picker
v-model="generate.options.color.light" size="default" show-alpha
                  @change="generateQRCode" />
              </div>
            </div>
          </div>
        </aside>

        
        <main class="preview-panel">
          <div class="preview-card">
            <div class="qr-container">
              <img v-if="generate.qrUrl" :src="generate.qrUrl" alt="QR Code" class="qr-image" />
              <div v-else class="placeholder">
                <el-icon :size="48" color="#94a3b8">
                  <Postcard />
                </el-icon>
                <span>输入内容生成二维码</span>
              </div>
            </div>

            <div class="action-buttons">
              <el-button type="primary" size="large" :disabled="!generate.qrUrl" @click="downloadQRCode">
                <el-icon>
                  <Download />
                </el-icon>
                下载图片
              </el-button>
            </div>
          </div>
        </main>
      </div>

      
      <div v-if="currentTab === 'scan'" class="layout-container vertical">
        
        <div
class="upload-area" @dragover.prevent @drop.prevent="handleDrop" @paste="handlePaste"
          @click="triggerUpload">
          <input ref="fileInput" type="file" accept="image/*" class="hidden-input" @change="handleFileChange" />
          <div v-if="scan.imageUrl" class="preview-wrapper">
            <img :src="scan.imageUrl" class="scan-preview" />
            <div class="overlay-hint">点击或粘贴更换图片</div>
          </div>
          <div v-else class="upload-placeholder">
            <el-icon :size="64" class="upload-icon">
              <Picture />
            </el-icon>
            <p>点击上传、拖入图片 或 <code>Ctrl+V</code> 粘贴</p>
          </div>
        </div>

        
        <div class="scan-result-panel">
          <div class="panel-header">
            <span class="panel-title">解析结果</span>
            <div class="panel-actions">
              <el-button size="small" :disabled="!scan.result" @click="copyScanResult">复制</el-button>
              <el-button size="small" type="danger" plain :disabled="!scan.result" @click="clearScan">清空</el-button>
            </div>
          </div>
          <textarea v-model="scan.result" class="scan-textarea" readonly placeholder="解析结果将显示在这里..."></textarea>
        </div>
      </div>

    </div>

    <footer class="footer">
      © 2026 LRM工具箱 - 二维码工具
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Delete, Download, Postcard, Picture } from '@element-plus/icons-vue'
import QRCode from 'qrcode'
import jsQR from 'jsqr'
import tinycolor from 'tinycolor2'

const router = useRouter()
const currentTab = ref('generate')


const generate = reactive({
  content: '',
  qrUrl: '',
  options: {
    errorCorrectionLevel: 'M',
    width: 300,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  }
})

let timeout = null
function debouncedGenerate() {
  if (timeout) clearTimeout(timeout)
  timeout = setTimeout(() => generateQRCode(), 300)
}

async function generateQRCode() {
  if (!generate.content) {
    generate.qrUrl = ''
    return
  }
  try {
    const opts = {
      errorCorrectionLevel: generate.options.errorCorrectionLevel,
      width: generate.options.width,
      margin: generate.options.margin,
      color: {
        dark: tinycolor(generate.options.color.dark).toHexString(),
        light: tinycolor(generate.options.color.light || '#ffffff').toHex8String()
      }
    }
    generate.qrUrl = await QRCode.toDataURL(generate.content, opts)
  } catch (err) {
    console.error(err)
    ElMessage.error('生成失败')
  }
}

function downloadQRCode() {
  if (!generate.qrUrl) return
  const link = document.createElement('a')
  link.href = generate.qrUrl
  link.download = `qrcode-${Date.now()}.png`
  link.click()
  ElMessage.success('开始下载')
}


const scan = reactive({
  imageUrl: '',
  result: ''
})
const fileInput = ref(null)

function triggerUpload() {
  fileInput.value.click()
}

function handleFileChange(e) {
  const file = e.target.files[0]
  if (file) processImage(file)
}

function handleDrop(e) {
  const file = e.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) processImage(file)
}

function handlePaste(e) {
  
  
  
  
  
  
  const items = e.clipboardData.items
  for (const item of items) {
    if (item.type.indexOf('image') !== -1) {
      const file = item.getAsFile()
      processImage(file)
      break
    }
  }
}






function processImage(file) {
  const url = URL.createObjectURL(file)
  scan.imageUrl = url

  
  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    const imageData = ctx.getImageData(0, 0, img.width, img.height)

    const code = jsQR(imageData.data, img.width, img.height)
    if (code) {
      scan.result = code.data
      ElMessage.success('解析成功')
    } else {
      scan.result = ''
      ElMessage.warning('未能识别二维码')
    }
  }
  img.src = url
}

function clearScan() {
  scan.imageUrl = ''
  scan.result = ''
  if (fileInput.value) fileInput.value.value = ''
}

function copyScanResult() {
  if (!scan.result) return
  navigator.clipboard.writeText(scan.result).then(() => ElMessage.success('已复制'))
}



function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/')
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

.tool-content {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}


.tabs-header {
  display: flex;
  background: #ffffff;
  border-radius: 12px;
  padding: 0.5rem;
  gap: 0.5rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
  width: fit-content;
  margin: 0 auto;
}

.tab-btn {
  padding: 0.6rem 2rem;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  color: #64748b;
  transition: all 0.2s;
}

.tab-btn.active {
  background: #e2e8f0;
  color: #0f172a;
}


.layout-container {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.layout-container.vertical {
  flex-direction: column;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}


.settings-panel {
  width: 400px;
  background: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
}

.group-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.color-settings {
  display: flex;
  gap: 2rem;
}

.color-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}


.preview-panel {
  flex: 1;
  display: flex;
  justify-content: center;
}

.preview-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  min-width: 360px;
}

.qr-container {
  width: 320px;
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  background: #f8fafc;
  overflow: hidden;
}

.qr-image {
  max-width: 100%;
  max-height: 100%;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #94a3b8;
  font-size: 0.875rem;
}

.action-buttons {
  width: 100%;
}

.action-buttons .el-button {
  width: 100%;
}


.upload-area {
  width: 100%;
  height: 240px;
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
  background: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.upload-area:hover {
  border-color: #94a3b8;
  background: #f8fafc;
}

.hidden-input {
  display: none;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #64748b;
}

.preview-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000;
}

.scan-preview {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.overlay-hint {
  position: absolute;
  bottom: 1rem;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  pointer-events: none;
}

.scan-result-panel {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  padding: 0.8rem 1.5rem;
  background: #f8fafc;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-title {
  font-weight: 600;
  color: #1e293b;
}

.scan-textarea {
  width: 100%;
  min-height: 150px;
  border: none;
  padding: 1.5rem;
  resize: vertical;
  outline: none;
  font-size: 1rem;
  color: #334155;
  background: transparent;
}



@media (max-width: 800px) {
  .layout-container {
    flex-direction: column;
  }

  .settings-panel {
    width: 100%;
  }

  .preview-panel {
    width: 100%;
  }

  .preview-card {
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

[data-theme="dark"] .settings-panel,
[data-theme="dark"] .preview-card,
[data-theme="dark"] .scan-result-panel {
  background: var(--bg-secondary);
  border-color: var(--border-color);
}

[data-theme="dark"] .qr-container {
  background: #f8fafc;
}

[data-theme="dark"] .group-title,
[data-theme="dark"] .panel-title {
  color: var(--text-primary);
  border-color: var(--border-color);
}

[data-theme="dark"] .tabs-header {
  background: var(--bg-secondary);
  border-color: var(--border-color);
}

[data-theme="dark"] .tab-btn.active {
  background: #374151;
  color: white;
}

[data-theme="dark"] .tab-btn {
  color: #9ca3af;
}

[data-theme="dark"] .upload-area {
  background: var(--bg-secondary);
  border-color: var(--border-color);
}

[data-theme="dark"] .scan-textarea {
  color: var(--text-primary);
}

[data-theme="dark"] .panel-header {
  background: #1f2937;
}



.footer {
  text-align: center;
  padding: 1rem 0;
  color: var(--text-secondary, #64748b);
  font-size: 0.85rem;
}
</style>
