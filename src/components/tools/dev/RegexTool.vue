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
      <h1 class="tool-title">正则表达式测试</h1>
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
      
      <div class="regex-input-section">
        <div class="regex-wrapper">
          <span class="slash">/</span>
          <input v-model="regexPattern" type="text" class="regex-field" placeholder="在此输入正则表达式" spellcheck="false" />
          <span class="slash">/</span>
          <input v-model="regexFlags" type="text" class="flags-field" placeholder="gims" spellcheck="false" />
        </div>

        
        <el-dropdown trigger="click" @command="handleTemplateSelect">
          <el-button>
            {{ currentTemplateName }} <el-icon class="el-icon--right">
              <ArrowDown />
            </el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="temp in templates" :key="temp.name" :command="temp">
                {{ temp.name }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      
      <div v-if="regexError" class="error-message">
        <el-icon>
          <Warning />
        </el-icon> {{ regexError }}
      </div>

      
      <div class="test-area">
        <div class="area-header">
          <span class="label">测试文本</span>
          <div v-if="matchCount > 0" class="stats">
            找到 {{ matchCount }} 个匹配
          </div>
        </div>

        <div class="editor-container">
          
          <div class="highlight-layer" aria-hidden="true" v-html="highlightedContent"></div>

          
          <textarea
ref="textareaRef" v-model="testText" class="input-layer" placeholder="在此输入待测试文本..."
            spellcheck="false" @scroll="syncScroll"></textarea>
        </div>
      </div>

      
      <div v-if="matchGroups.length > 0" class="matches-list">
        <div class="list-header">匹配详情</div>
        <el-collapse>
          <el-collapse-item
v-for="(match, index) in matchGroups.slice(0, 50)" :key="index"
            :title="`Match ${index + 1}: ${match[0]}`">
            <div v-if="match.length > 1" class="group-detail">
              <div v-for="(group, gIndex) in match.slice(1)" :key="gIndex" class="group-item">
                <span class="group-label">Group {{ gIndex + 1 }}:</span>
                <span class="group-value">{{ group }}</span>
              </div>
            </div>
            <div v-else class="no-groups">无捕获组</div>
            <div class="match-index">Index: {{ match.index }}</div>
          </el-collapse-item>
        </el-collapse>
        <div v-if="matchGroups.length > 50" class="more-matches">
          仅显示前 50 个匹配项...
        </div>
      </div>
    </div>

    <footer class="footer">
      © 2026 LRM工具箱 - 正则表达式测试
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Delete, ArrowDown, Warning } from '@element-plus/icons-vue'

const router = useRouter()


const regexPattern = ref('')
const regexFlags = ref('g')
const testText = ref('')
const regexError = ref('')

const textareaRef = ref(null)
const currentTemplateName = ref('常用模板')


const templates = [
  { name: 'Email 邮箱', pattern: '[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}', flags: 'g' },
  { name: '手机号 (中国)', pattern: '1[3-9]\\d{9}', flags: 'g' },
  { name: '身份证 (18位)', pattern: '[1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]', flags: 'g' },
  { name: 'URL 网址', pattern: 'https?://(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)', flags: 'g' },
  { name: '日期 (YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}', flags: 'g' },
  { name: 'IPv4 地址', pattern: '((25[0-5]|(2[0-4]|1\\d|[1-9]|)\\d)\\.?\\b){4}', flags: 'g' },
  { name: '中文字符', pattern: '[\\u4e00-\\u9fa5]', flags: 'g' }
]

function handleTemplateSelect(temp) {
  regexPattern.value = temp.pattern
  regexFlags.value = temp.flags
  currentTemplateName.value = temp.name
}


const computedRegex = computed(() => {
  if (!regexPattern.value) return null
  try {
    regexError.value = ''
    return new RegExp(regexPattern.value, regexFlags.value)
  } catch (e) {
    regexError.value = e.message
    return null
  }
})


const matchGroups = computed(() => {
  if (!computedRegex.value || !testText.value) return []

  
  if (regexPattern.value === '' || regexPattern.value === '(?:)') return []

  const matches = []
  
  const regex = new RegExp(regexPattern.value, regexFlags.value.includes('g') ? regexFlags.value : regexFlags.value + 'g')

  let match
  
  let count = 0
  while ((match = regex.exec(testText.value)) !== null && count < 1000) {
    
    
    matches.push(match)

    
    if (match.index === regex.lastIndex) {
      regex.lastIndex++
    }
    count++
  }
  return matches
})

const matchCount = computed(() => matchGroups.value.length)


const highlightedContent = computed(() => {
  if (!testText.value) return ''
  
  const escapeHtml = (unsafe) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  if (!computedRegex.value) return escapeHtml(testText.value) + '<br>' // 添加br确保空行显示

  try {
    let html = ''
    let lastIndex = 0
    const text = testText.value

    // 使用 matchGroups 防止二次正则执行不一致
    for (const match of matchGroups.value) {
      // 添加普通文本
      html += escapeHtml(text.slice(lastIndex, match.index))

      // 添加高亮文本
      const matchedStr = match[0]
      html += `<span class="highlight-match">${escapeHtml(matchedStr)}</span>`

      lastIndex = match.index + matchedStr.length
    }

    
    html += escapeHtml(text.slice(lastIndex))

    
    if (html.endsWith('\n')) {
      html += '<br>'
    }

    return html
  } catch (e) {
    return escapeHtml(testText.value)
  }
})


function syncScroll(e) {
  const scrollTop = e.target.scrollTop
  const scrollLeft = e.target.scrollLeft
  const highlightLayer = e.target.previousElementSibling
  if (highlightLayer) {
    highlightLayer.scrollTop = scrollTop
    highlightLayer.scrollLeft = scrollLeft
  }
}




function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

function clearAll() {
  regexPattern.value = ''
  testText.value = ''
  regexFlags.value = 'g'
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
  gap: 1.5rem;
}


.regex-input-section {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.regex-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1px solid #dcdfe6;
  
  border-radius: 4px;
  padding: 0 1rem;
  transition: all 0.2s;
  height: 40px;
}

.regex-wrapper:focus-within {
  border-color: #409eff;
  box-shadow: 0 0 0 1px #409eff;
}

.slash {
  color: #909399;
  font-family: monospace;
  font-weight: bold;
  font-size: 1.2rem;
  user-select: none;
}

.regex-field {
  flex: 1;
  border: none;
  outline: none;
  font-family: 'Consolas', monospace;
  font-size: 1.1rem;
  color: #2c3e50;
  margin: 0 0.5rem;
}

.flags-field {
  width: 60px;
  border: none;
  border-left: 1px solid #dcdfe6;
  outline: none;
  font-family: 'Consolas', monospace;
  font-size: 1rem;
  color: #909399;
  
  padding-left: 0.5rem;
  background: transparent;
}

.error-message {
  color: #f56c6c;
  background: #fef0f0;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}


.test-area {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-height: 300px;
}

.area-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.stats {
  color: #409eff;
}

.editor-container {
  position: relative;
  flex: 1;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  background: #ffffff;
  overflow: hidden;
  font-family: 'Consolas', monospace;
  font-size: 16px;
  line-height: 1.5;
}

.highlight-layer,
.input-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 1rem;
  margin: 0;
  border: none;
  outline: none;
  box-sizing: border-box;
  overflow: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.highlight-layer {
  color: transparent;
  z-index: 1;
  pointer-events: none;
  
}


.highlight-layer :deep(.highlight-match) {
  background-color: #d1edff;
  border-radius: 2px;
  box-shadow: 0 0 0 1px #a4d8ff;
  color: transparent;
  
}



.input-layer {
  z-index: 2;
  color: #1e293b;
  background: transparent;
  resize: none;
}


.matches-list {
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  padding: 1rem;
}

.list-header {
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  color: #1e293b;
}

.group-detail {
  padding-left: 1rem;
  margin-bottom: 0.5rem;
}

.group-item {
  font-size: 0.875rem;
  color: #606266;
}

.group-label {
  font-weight: 500;
  margin-right: 0.5rem;
}

.group-value {
  font-family: monospace;
  color: #1e293b;
  background: #f2f3f5;
  padding: 0 4px;
  border-radius: 2px;
}

.match-index {
  font-size: 0.75rem;
  color: #909399;
}

.more-matches {
  text-align: center;
  color: #909399;
  font-size: 0.875rem;
  margin-top: 0.5rem;
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

[data-theme="dark"] .regex-wrapper {
  background: var(--bg-secondary);
  border-color: var(--border-color);
}

[data-theme="dark"] .regex-field,
[data-theme="dark"] .flags-field {
  color: var(--text-primary);
}

[data-theme="dark"] .editor-container {
  background: var(--bg-secondary);
  border-color: var(--border-color);
}

[data-theme="dark"] .input-layer {
  color: var(--text-primary);
}

[data-theme="dark"] .highlight-layer :deep(.highlight-match) {
  background-color: rgba(64, 158, 255, 0.3);
  box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.5);
}

[data-theme="dark"] .matches-list {
  background: var(--bg-secondary);
  border-color: var(--border-color);
}

[data-theme="dark"] .list-header {
  color: var(--text-primary);
}

[data-theme="dark"] .group-value {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}


.footer {
  text-align: center;
  padding: 3rem 0;
  color: var(--text-secondary, #64748b);
  font-size: 0.85rem;
}
</style>
