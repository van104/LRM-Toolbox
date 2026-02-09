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
      <h1 class="tool-title">MD5 哈希生成</h1>
      <div class="header-right">
        <el-button text @click="clearAll">
          <el-icon>
            <Delete />
          </el-icon>
          <span>清空</span>
        </el-button>
      </div>
    </header>

    
    <div class="toolbar">
      <el-radio-group v-model="activeTab" class="custom-tabs">
        <el-radio-button label="text">文本模式</el-radio-button>
        <el-radio-button label="file">文件模式</el-radio-button>
      </el-radio-group>
    </div>

    
    <div v-show="activeTab === 'text'" class="content-container">
      <div class="input-section">
        <div class="section-header">
          <span class="label">输入文本</span>
          <el-button link type="primary" @click="pasteFromClipboard">
            <el-icon>
              <DocumentCopy />
            </el-icon> 粘贴
          </el-button>
        </div>
        <el-input
v-model="inputText" type="textarea" :rows="6" placeholder="在此输入要计算 MD5 的文本..." resize="none"
          @input="calculateTextMd5" />
      </div>

      <div class="arrow-divider">
        <el-icon>
          <ArrowDown />
        </el-icon>
      </div>

      <div class="result-section">
        <div class="section-header">
          <span class="label">MD5 结果 (32位)</span>
        </div>
        <div class="result-box">
          <div class="hash-value">{{ textMd5 || '等待输入...' }}</div>
          <el-button
v-if="textMd5" type="primary" icon="CopyDocument" class="copy-btn"
            @click="copyToClipboard(textMd5)">
            复制
          </el-button>
        </div>
        <div v-if="textMd5" class="sub-result">
          <div class="sub-item">
            <span class="sub-label">16位:</span>
            <span class="sub-value">{{ textMd5.substring(8, 24) }}</span>
            <el-button link icon="CopyDocument" size="small" @click="copyToClipboard(textMd5.substring(8, 24))" />
          </div>
          <div class="sub-item">
            <span class="sub-label">大写:</span>
            <span class="sub-value">{{ textMd5.toUpperCase() }}</span>
            <el-button link icon="CopyDocument" size="small" @click="copyToClipboard(textMd5.toUpperCase())" />
          </div>
        </div>
      </div>
    </div>

    
    <div v-show="activeTab === 'file'" class="content-container">
      <div class="upload-section">
        <el-upload
class="file-uploader" drag action="#" :auto-upload="false" :show-file-list="false"
          :on-change="handleFileChange">
          <el-icon class="el-icon--upload">
            <UploadFilled />
          </el-icon>
          <div class="el-upload__text">
            拖拽文件到此处或 <em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持任意类型文件，大文件将分片计算
            </div>
          </template>
        </el-upload>
      </div>

      <div v-if="fileInfo.name" class="file-info-card">
        <div class="file-details">
          <div class="file-name">
            <el-icon>
              <Document />
            </el-icon>
            {{ fileInfo.name }}
          </div>
          <div class="file-meta">
            大小: {{ formatSize(fileInfo.size) }}
          </div>
        </div>

        <div v-if="calculating" class="progress-bar">
          <el-progress :percentage="progress" :status="progress === 100 ? 'success' : ''" :format="formatProgress" />
          <div class="status-text">正在计算...</div>
        </div>

        <div v-else-if="fileMd5" class="result-section">
          <div class="section-header">
            <span class="label">文件 MD5</span>
          </div>
          <div class="result-box highlight">
            <div class="hash-value">{{ fileMd5 }}</div>
            <el-button type="primary" icon="CopyDocument" class="copy-btn" @click="copyToClipboard(fileMd5)">
              复制
            </el-button>
          </div>
          <div class="sub-result">
            <div class="sub-item">
              <span class="sub-label">大写:</span>
              <span class="sub-value">{{ fileMd5.toUpperCase() }}</span>
              <el-button link icon="CopyDocument" size="small" @click="copyToClipboard(fileMd5.toUpperCase())" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <footer class="footer">
      © 2026 LRM工具箱 - MD5 哈希生成
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft, Delete, DocumentCopy, CopyDocument,
  ArrowDown, UploadFilled, Document
} from '@element-plus/icons-vue'
import SparkMD5 from 'spark-md5'

const router = useRouter()


const activeTab = ref('text')
const inputText = ref('')
const textMd5 = ref('')

const fileInfo = ref({ name: '', size: 0 })
const fileMd5 = ref('')
const calculating = ref(false)
const progress = ref(0)


function calculateTextMd5() {
  if (!inputText.value) {
    textMd5.value = ''
    return
  }
  textMd5.value = SparkMD5.hash(inputText.value)
}


function handleFileChange(file) {
  const rawFile = file.raw
  fileInfo.value = {
    name: rawFile.name,
    size: rawFile.size
  }
  fileMd5.value = ''
  progress.value = 0
  calculating.value = true

  const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice
  const chunkSize = 2 * 1024 * 1024 
  const chunks = Math.ceil(rawFile.size / chunkSize)
  let currentChunk = 0
  const spark = new SparkMD5.ArrayBuffer()
  const fileReader = new FileReader()

  fileReader.onload = function (e) {
    spark.append(e.target.result)
    currentChunk++

    progress.value = Math.floor((currentChunk / chunks) * 100)

    if (currentChunk < chunks) {
      loadNext()
    } else {
      fileMd5.value = spark.end()
      calculating.value = false
      ElMessage.success('计算完成')
    }
  }

  fileReader.onerror = function () {
    ElMessage.error('文件读取失败')
    calculating.value = false
  }

  function loadNext() {
    const start = currentChunk * chunkSize
    const end = ((start + chunkSize) >= rawFile.size) ? rawFile.size : start + chunkSize
    fileReader.readAsArrayBuffer(blobSlice.call(rawFile, start, end))
  }

  loadNext()
}


function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

function clearAll() {
  inputText.value = ''
  textMd5.value = ''
  fileInfo.value = { name: '', size: 0 }
  fileMd5.value = ''
  progress.value = 0
  calculating.value = false
}

async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText()
    inputText.value = text
    calculateTextMd5()
    ElMessage.success('已粘贴')
  } catch (e) {
    ElMessage.error('无法读取剪贴板')
  }
}

async function copyToClipboard(text) {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatProgress(percentage) {
  return percentage === 100 ? '完成' : `${percentage}%`
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

.header-right {
  text-align: right;
}

.toolbar {
  padding: 1rem 1.5rem;
  background: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: center;
}

.content-container {
  flex: 1;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}


.input-section,
.result-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
}

.arrow-divider {
  display: flex;
  justify-content: center;
  color: #94a3b8;
}

.result-box {
  background: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.result-box.highlight {
  background: rgba(6, 182, 212, 0.05);
  border-color: rgba(6, 182, 212, 0.2);
}

.hash-value {
  font-family: monospace;
  font-size: 1.125rem;
  color: #1e293b;
  word-break: break-all;
  flex: 1;
}

.sub-result {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sub-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.sub-label {
  color: #64748b;
  width: 40px;
}

.sub-value {
  font-family: monospace;
  color: #475569;
}


.upload-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
}

.file-info-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.file-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.file-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #1e293b;
}

.file-meta {
  color: #64748b;
  font-size: 0.875rem;
}

.progress-bar {
  padding: 1rem 0;
}

.status-text {
  text-align: center;
  margin-top: 0.5rem;
  color: #64748b;
  font-size: 0.875rem;
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

[data-theme="dark"] .input-section,
[data-theme="dark"] .result-section,
[data-theme="dark"] .upload-section,
[data-theme="dark"] .file-info-card {
  background: var(--bg-secondary);
  border-color: var(--border-color);
}

[data-theme="dark"] .result-box {
  background: var(--bg-glass);
  border-color: var(--border-color);
}

[data-theme="dark"] .hash-value,
[data-theme="dark"] .file-name {
  color: var(--text-primary);
}

[data-theme="dark"] .sub-value {
  color: var(--text-secondary);
}


.footer {
  text-align: center;
  padding: 3rem 0;
  color: var(--text-secondary, #64748b);
  font-size: 0.85rem;
}
</style>
