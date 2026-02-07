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
      <h1 class="tool-title">Markdown 预览</h1>
      <div class="header-right">
        <el-button text @click="clearAll">
          <el-icon>
            <Delete />
          </el-icon>
          <span>清空</span>
        </el-button>
        <el-button type="primary" size="small" @click="downloadHtml">
          导出 HTML
        </el-button>
      </div>
    </header>

    <div class="tool-content">
      <div class="editor-layout">
        
        <div class="editor-pane">
          <div class="pane-header">
            <span>Markdown 编辑</span>
            <el-button link type="primary" size="small" @click="pasteContent">粘贴</el-button>
          </div>
          <textarea v-model="markdownInput" class="markdown-editor" placeholder="在此输入 Markdown 内容..." spellcheck="false"
            @scroll="syncScroll" ref="editorRef"></textarea>
        </div>

        
        <div class="preview-pane">
          <div class="pane-header">
            <span>实时预览</span>
          </div>
          <div class="markdown-body" v-html="renderedHtml" ref="previewRef"></div>
        </div>
      </div>
    </div>

    <footer class="footer">
      © 2026 LRM工具箱 - Markdown 预览
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Delete } from '@element-plus/icons-vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const router = useRouter()


const markdownInput = ref('# Hello Markdown\n\n开始输入你的内容...')
const editorRef = ref(null)
const previewRef = ref(null)


const renderedHtml = computed(() => {
  const rawHtml = marked.parse(markdownInput.value || '', {
    breaks: true, 
    gfm: true 
  })
  return DOMPurify.sanitize(rawHtml)
})


function syncScroll(e) {
  
  if (!previewRef.value) return
  const textarea = e.target
  const percentage = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight)
  const preview = previewRef.value
  preview.scrollTop = percentage * (preview.scrollHeight - preview.clientHeight)
}


function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

function clearAll() {
  markdownInput.value = ''
}

async function pasteContent() {
  try {
    const text = await navigator.clipboard.readText()
    markdownInput.value = text
  } catch (e) {
    ElMessage.error('无法读取剪贴板')
  }
}

function downloadHtml() {
  const blob = new Blob([renderedHtml.value], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `preview-${Date.now()}.html`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('已导出 HTML')
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
  display: flex;
  align-items: center;
  gap: 1rem;
}

.tool-content {
  flex: 1;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.editor-layout {
  display: flex;
  flex: 1;
  gap: 1.5rem;
  height: calc(100vh - 120px);
  
}


.editor-pane,
.preview-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.pane-header {
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  font-weight: 600;
  color: #64748b;
  font-size: 0.875rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}


.markdown-editor {
  flex: 1;
  padding: 1rem;
  border: none;
  resize: none;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 15px;
  line-height: 1.6;
  color: #1e293b;
  outline: none;
  background: transparent;
}


.markdown-body {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  line-height: 1.6;
  color: #24292e;
}


.markdown-body :deep(h1),
.markdown-body :deep(h2) {
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

.markdown-body :deep(h1) {
  font-size: 2em;
  margin-bottom: 16px;
  font-weight: 600;
}

.markdown-body :deep(h2) {
  font-size: 1.5em;
  margin-bottom: 16px;
  font-weight: 600;
}

.markdown-body :deep(h3) {
  font-size: 1.25em;
  margin-bottom: 16px;
  font-weight: 600;
}

.markdown-body :deep(p) {
  margin-bottom: 16px;
}

.markdown-body :deep(code) {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(27, 31, 35, 0.05);
  border-radius: 3px;
  font-family: 'SFMono-Regular', Consolas, "Liberation Mono", Menlo, monospace;
}

.markdown-body :deep(pre) {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa;
  border-radius: 3px;
  margin-bottom: 16px;
}

.markdown-body :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.markdown-body :deep(blockquote) {
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
  margin: 0 0 16px 0;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 2em;
  margin-bottom: 16px;
}

.markdown-body :deep(img) {
  max-width: 100%;
  box-sizing: content-box;
  background-color: #fff;
}

.markdown-body :deep(table) {
  border-spacing: 0;
  border-collapse: collapse;
  margin-bottom: 16px;
  width: 100%;
}

.markdown-body :deep(table th),
.markdown-body :deep(table td) {
  padding: 6px 13px;
  border: 1px solid #dfe2e5;
}

.markdown-body :deep(table tr:nth-child(2n)) {
  background-color: #f6f8fa;
}


@media (max-width: 800px) {
  .editor-layout {
    flex-direction: column;
    height: auto;
  }

  .editor-pane,
  .preview-pane {
    height: 50vh;
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

[data-theme="dark"] .editor-pane,
[data-theme="dark"] .preview-pane {
  background: var(--bg-secondary);
  border-color: var(--border-color);
}

[data-theme="dark"] .pane-header {
  background: var(--bg-glass);
  color: var(--text-secondary);
  border-color: rgba(255, 255, 255, 0.05);
}

[data-theme="dark"] .markdown-editor {
  color: var(--text-primary);
}


[data-theme="dark"] .markdown-body {
  color: #c9d1d9;
}

[data-theme="dark"] .markdown-body :deep(h1),
[data-theme="dark"] .markdown-body :deep(h2) {
  border-color: #30363d;
}

[data-theme="dark"] .markdown-body :deep(code) {
  background-color: rgba(110, 118, 129, 0.4);
}

[data-theme="dark"] .markdown-body :deep(pre) {
  background-color: #161b22;
}

[data-theme="dark"] .markdown-body :deep(blockquote) {
  color: #8b949e;
  border-color: #30363d;
}

[data-theme="dark"] .markdown-body :deep(table th),
[data-theme="dark"] .markdown-body :deep(table td) {
  border-color: #30363d;
}

[data-theme="dark"] .markdown-body :deep(table tr:nth-child(2n)) {
  background-color: #161b22;
}


.footer {
  text-align: center;
  padding: 3rem 0;
  color: var(--text-secondary, #64748b);
  font-size: 0.85rem;
}
</style>
