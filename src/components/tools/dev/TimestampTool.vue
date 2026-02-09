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
      <h1 class="tool-title">时间戳转换</h1>
      <div class="header-right">
        <el-button text @click="getCurrentTime">
          <el-icon>
            <Refresh />
          </el-icon>
          <span>刷新</span>
        </el-button>
      </div>
    </header>

    <div class="tool-content">
      
      <section class="current-time-card">
        <div class="card-label">当前时间</div>
        <div class="time-display">{{ nowStr }}</div>
        <div class="timestamp-display">
          <span>Unix 时间戳 (秒):</span>
          <span class="highlight">{{ nowUnix }}</span>
          <el-button link type="primary" size="small" @click="copyToClipboard(nowUnix)">复制</el-button>
        </div>
        <div class="timestamp-display">
          <span>Unix 时间戳 (毫秒):</span>
          <span class="highlight">{{ nowUnixMs }}</span>
          <el-button link type="primary" size="small" @click="copyToClipboard(nowUnixMs)">复制</el-button>
        </div>
      </section>

      
      <section class="converter-section">
        <h2 class="section-title">
          <el-icon>
            <Timer />
          </el-icon>
          时间戳 转 日期
        </h2>
        <div class="converter-box">
          <div class="input-group">
            <el-input v-model="tsInput" placeholder="输入 Unix 时间戳 (秒或毫秒)" clearable @input="convertTsToDate">
              <template #append>
                <el-select v-model="tsUnit" style="width: 80px">
                  <el-option label="秒" value="s" />
                  <el-option label="毫秒" value="ms" />
                </el-select>
              </template>
            </el-input>
          </div>
          <div class="arrow-divider">
            <el-icon>
              <ArrowDown />
            </el-icon>
          </div>
          <div class="result-group">
            <div class="result-item">
              <span class="label">北京时间:</span>
              <span class="value">{{ tsToDateResult }}</span>
              <el-button v-if="tsToDateResult" link icon="CopyDocument" @click="copyToClipboard(tsToDateResult)" />
            </div>
            <div class="result-item">
              <span class="label">ISO 8601:</span>
              <span class="value">{{ tsToIsoResult }}</span>
              <el-button v-if="tsToIsoResult" link icon="CopyDocument" @click="copyToClipboard(tsToIsoResult)" />
            </div>
          </div>
        </div>
      </section>

      
      <section class="converter-section">
        <h2 class="section-title">
          <el-icon>
            <Calendar />
          </el-icon>
          日期 转 时间戳
        </h2>
        <div class="converter-box">
          <div class="input-group">
            <el-date-picker
v-model="dateInput" type="datetime" placeholder="选择日期时间" style="width: 100%"
              @change="convertDateToTs" />
          </div>
          <div class="arrow-divider">
            <el-icon>
              <ArrowDown />
            </el-icon>
          </div>
          <div class="result-group">
            <div class="result-item">
              <span class="label">Unix (秒):</span>
              <span class="value">{{ dateToTsResult }}</span>
              <el-button v-if="dateToTsResult" link icon="CopyDocument" @click="copyToClipboard(dateToTsResult)" />
            </div>
            <div class="result-item">
              <span class="label">Unix (毫秒):</span>
              <span class="value">{{ dateToTsMsResult }}</span>
              <el-button v-if="dateToTsMsResult" link icon="CopyDocument" @click="copyToClipboard(dateToTsMsResult)" />
            </div>
          </div>
        </div>
      </section>
    </div>

    <footer class="footer">
      © 2026 LRM工具箱 - 时间戳转换
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft, Refresh, Timer, Calendar,
  ArrowDown, CopyDocument
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const router = useRouter()


const nowStr = ref('')
const nowUnix = ref(0)
const nowUnixMs = ref(0)
let timer = null

function updateTime() {
  const now = dayjs()
  nowStr.value = now.format('YYYY-MM-DD HH:mm:ss')
  nowUnix.value = now.unix()
  nowUnixMs.value = now.valueOf()
}

function getCurrentTime() {
  updateTime()
}


const tsInput = ref('')
const tsUnit = ref('s')
const tsToDateResult = ref('')
const tsToIsoResult = ref('')

function convertTsToDate() {
  if (!tsInput.value) {
    tsToDateResult.value = ''
    tsToIsoResult.value = ''
    return
  }

  const ts = parseInt(tsInput.value)
  if (isNaN(ts)) {
    tsToDateResult.value = '无效的时间戳'
    return
  }

  let date
  if (tsUnit.value === 's') {
    date = dayjs.unix(ts)
  } else {
    date = dayjs(ts)
  }

  if (!date.isValid()) {
    tsToDateResult.value = '无效的时间戳'
    return
  }

  tsToDateResult.value = date.format('YYYY-MM-DD HH:mm:ss')
  tsToIsoResult.value = date.toISOString()
}


const dateInput = ref(null)
const dateToTsResult = ref('')
const dateToTsMsResult = ref('')

function convertDateToTs() {
  if (!dateInput.value) {
    dateToTsResult.value = ''
    dateToTsMsResult.value = ''
    return
  }

  const date = dayjs(dateInput.value)
  dateToTsResult.value = date.unix()
  dateToTsMsResult.value = date.valueOf()
}


function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

async function copyToClipboard(text) {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text.toString())
    ElMessage.success('复制成功')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)

  
  tsInput.value = dayjs().unix().toString()
  convertTsToDate()
  dateInput.value = new Date()
  convertDateToTs()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
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

.tool-content {
  flex: 1;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.current-time-card {
  background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
  border-radius: 16px;
  padding: 2rem;
  color: white;
  text-align: center;
  box-shadow: 0 10px 30px rgba(6, 182, 212, 0.2);
}

.card-label {
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
}

.time-display {
  font-size: 2.5rem;
  font-weight: 700;
  font-family: 'Orbitron', monospace;
  margin-bottom: 1.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.timestamp-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
}

.timestamp-display .highlight {
  font-family: monospace;
  font-size: 1rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.1rem 0.5rem;
  border-radius: 4px;
}

.converter-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
}

.converter-box {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.arrow-divider {
  display: flex;
  justify-content: center;
  color: #94a3b8;
}

.result-group {
  background: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.result-item .label {
  color: #64748b;
  font-size: 0.875rem;
  width: 80px;
}

.result-item .value {
  flex: 1;
  font-family: monospace;
  color: #1e293b;
  font-weight: 500;
  word-break: break-all;
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

[data-theme="dark"] .token-input :deep(.el-textarea__inner) {
  background: var(--bg-input);
  border-color: var(--border-color);
  color: var(--text-primary);
}

[data-theme="dark"] .converter-section {
  background: var(--bg-secondary);
  border-color: var(--border-color);
}

[data-theme="dark"] .section-title,
[data-theme="dark"] .result-item .value {
  color: var(--text-primary);
}

[data-theme="dark"] .result-group {
  background: var(--bg-glass);
}


.footer {
  text-align: center;
  padding: 3rem 0;
  color: var(--text-secondary, #64748b);
  font-size: 0.85rem;
}
</style>
