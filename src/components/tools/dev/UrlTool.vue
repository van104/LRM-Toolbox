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
      <h1 class="tool-title">URL 编解码</h1>
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
      <div class="input-section">
        <div class="section-title">URL 输入</div>
        <textarea v-model="inputUrl" class="url-input" placeholder="请输入需要处理的 URL..." spellcheck="false"></textarea>

        <div class="actions">
          <el-button-group>
            <el-button type="primary" @click="doEncode">编码 (Encode)</el-button>
            <el-button type="success" @click="doDecode">解码 (Decode)</el-button>
          </el-button-group>
          <el-button @click="copyInput">复制结果</el-button>
        </div>
      </div>

      <div v-if="parsedParams.length > 0" class="params-section">
        <div class="section-title">参数解析 (Query Params)</div>
        <div class="params-table-container">
          <table class="params-table">
            <thead>
              <tr>
                <th>Key (参数名)</th>
                <th>Value (参数值)</th>
                <th width="80">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(param, index) in parsedParams" :key="index">
                <td>
                  <input v-model="param.key" class="table-input" @input="updateUrlFromParams" />
                </td>
                <td>
                  <input v-model="param.value" class="table-input" @input="updateUrlFromParams" />
                </td>
                <td class="action-cell">
                  <el-button link type="danger" size="small" @click="removeParam(index)">
                    <el-icon>
                      <Delete />
                    </el-icon>
                  </el-button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="add-param-row">
            <el-button link type="primary" @click="addParam">
              <el-icon>
                <Plus />
              </el-icon> 添加参数
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <footer class="footer">
      © 2026 LRM工具箱 - URL 编解码
    </footer>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Delete, Plus } from '@element-plus/icons-vue'
import useClipboard from 'vue-clipboard3'

const router = useRouter()
const { toClipboard } = useClipboard()

const inputUrl = ref('')
const parsedParams = ref([])






watch(inputUrl, (newVal) => {
  
  if (isUpdatingFromParams) return
  parseParams(newVal)
})

let isUpdatingFromParams = false

function parseParams(url) {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `http://example.com/${url}`)
    const params = []
    urlObj.searchParams.forEach((value, key) => {
      params.push({ key, value })
    })
    parsedParams.value = params
  } catch (e) {
    
    if (url.includes('?')) {
      const queryString = url.split('?')[1]
      const params = new URLSearchParams(queryString)
      const list = []
      params.forEach((value, key) => {
        list.push({ key, value })
      })
      parsedParams.value = list
    } else {
      parsedParams.value = []
    }
  }
}

function updateUrlFromParams() {
  isUpdatingFromParams = true
  try {
    
    let baseUrl = inputUrl.value.split('?')[0]

    
    const searchParams = new URLSearchParams()
    parsedParams.value.forEach(p => {
      if (p.key) searchParams.append(p.key, p.value)
    })
    const queryString = searchParams.toString()

    if (queryString) {
      inputUrl.value = `${baseUrl}?${queryString}`
    } else {
      inputUrl.value = baseUrl
    }
  } finally {
    
    setTimeout(() => {
      isUpdatingFromParams = false
    }, 0)
  }
}

function doEncode() {
  try {
    inputUrl.value = encodeURIComponent(inputUrl.value)
  } catch (e) {
    ElMessage.error('编码失败')
  }
}

function doDecode() {
  try {
    inputUrl.value = decodeURIComponent(inputUrl.value)
    
  } catch (e) {
    ElMessage.error('解码失败')
  }
}

async function copyInput() {
  try {
    await toClipboard(inputUrl.value)
    ElMessage.success('已复制')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}

function removeParam(index) {
  parsedParams.value.splice(index, 1)
  updateUrlFromParams()
}

function addParam() {
  parsedParams.value.push({ key: '', value: '' })
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

function clearAll() {
  inputUrl.value = ''
  parsedParams.value = []
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
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.input-section,
.params-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #64748b;
}

.url-input {
  width: 100%;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-family: 'Consolas', monospace;
  font-size: 1rem;
  line-height: 1.6;
  min-height: 120px;
  resize: vertical;
  color: #1e293b;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.url-input:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.actions {
  display: flex;
  justify-content: space-between;
}


.params-table-container {
  overflow-x: auto;
}

.params-table {
  width: 100%;
  border-collapse: collapse;
}

.params-table th {
  text-align: left;
  padding: 0.75rem;
  font-size: 0.875rem;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}

.params-table td {
  padding: 0.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.table-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid transparent;
  border-radius: 4px;
  font-family: 'Consolas', monospace;
  font-size: 0.875rem;
  color: #1e293b;
  background: #f8fafc;
  transition: all 0.2s;
}

.table-input:focus {
  background: #ffffff;
  border-color: #409eff;
  outline: none;
}

.action-cell {
  text-align: center;
}

.add-param-row {
  margin-top: 1rem;
  text-align: center;
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
[data-theme="dark"] .params-section {
  background: var(--bg-secondary);
  border-color: var(--border-color);
}

[data-theme="dark"] .url-input {
  background: var(--bg-primary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

[data-theme="dark"] .table-input {
  background: var(--bg-primary);
  color: var(--text-primary);
}

[data-theme="dark"] .table-input:focus {
  border-color: #409eff;
  background: var(--bg-secondary);
}

[data-theme="dark"] .params-table th,
[data-theme="dark"] .params-table td {
  border-color: var(--border-color);
}


.footer {
  text-align: center;
  padding: 3rem 0;
  color: var(--text-secondary, #64748b);
  font-size: 0.85rem;
}
</style>
