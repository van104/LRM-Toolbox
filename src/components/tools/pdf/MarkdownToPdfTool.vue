<template>
    <div class="tool-page">
        <header class="tool-header">
            <div class="header-left">
                <el-button text @click="goBack"><el-icon>
                        <ArrowLeft />
                    </el-icon><span>返回</span></el-button>
            </div>
            <div class="header-center">
                <h1 class="tool-title">Markdown 转 PDF</h1>
                <span class="tool-subtitle">Markdown to PDF</span>
            </div>
            <div class="header-right"></div>
        </header>

        <main class="tool-content">
            <div class="layout-container">
                <div class="workbench glass-card">
                    <div class="editor-section">
                        <div class="editor-header">
                            <el-radio-group v-model="inputMode" size="small">
                                <el-radio-button value="markdown">Markdown</el-radio-button>
                                <el-radio-button value="html">HTML</el-radio-button>
                            </el-radio-group>
                            <el-button size="small" @click="insertSample">插入示例</el-button>
                        </div>

                        <div class="editor-body">
                            <div class="input-panel">
                                <textarea v-model="inputContent" :placeholder="inputPlaceholder"></textarea>
                            </div>
                            <div class="preview-panel">
                                <div class="preview-header">预览</div>
                                <div ref="previewRef" class="preview-content" v-html="renderedHtml"></div>
                            </div>
                        </div>
                    </div>

                    <div class="settings-section">
                        <div class="setting-item">
                            <label>页面大小</label>
                            <el-select v-model="pageSize" style="width: 120px;">
                                <el-option label="A4" value="a4" />
                                <el-option label="Letter" value="letter" />
                                <el-option label="A3" value="a3" />
                            </el-select>
                        </div>
                        <div class="setting-item">
                            <label>页边距</label>
                            <el-select v-model="margins" style="width: 120px;">
                                <el-option label="正常" value="normal" />
                                <el-option label="窄" value="narrow" />
                                <el-option label="宽" value="wide" />
                            </el-select>
                        </div>
                    </div>

                    <el-button
type="primary" size="large" class="action-btn" :loading="processing"
                        :disabled="!inputContent.trim()" @click="generatePdf">
                        <el-icon>
                            <Download />
                        </el-icon>
                        生成 PDF
                    </el-button>
                </div>
            </div>
        </main>
        <footer class="footer">© 2026 LRM工具箱 - Markdown 转 PDF</footer>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { marked } from 'marked'

const router = useRouter()
const goBack = () => router.back()

const inputMode = ref('markdown')
const inputContent = ref('')
const pageSize = ref('a4')
const margins = ref('normal')
const processing = ref(false)
const previewRef = ref(null)

const inputPlaceholder = computed(() => {
    return inputMode.value === 'markdown'
        ? '在此输入 Markdown 内容...\n\n# 标题\n\n正文内容...'
        : '在此输入 HTML 内容...\n\n<h1>标题</h1>\n<p>正文内容...</p>'
})

const renderedHtml = computed(() => {
    if (!inputContent.value.trim()) return '<p style="color: #94a3b8;">预览内容将显示在这里</p>'

    if (inputMode.value === 'markdown') {
        return marked(inputContent.value)
    } else {
        return inputContent.value
    }
})

const sampleMarkdown = `# 文档标题

## 简介

这是一个使用 Markdown 编写的示例文档。

## 功能列表

- 支持 **粗体** 和 *斜体* 文本
- 支持 \`行内代码\`
- 支持有序和无序列表

## 代码示例

\`\`\`javascript
function hello() {
    console.log("Hello, World!");
}
\`\`\`

## 表格

| 姓名 | 年龄 | 职业 |
|------|------|------|
| 张三 | 25 | 工程师 |
| 李四 | 30 | 设计师 |

## 引用

> 这是一段引用文本。
> 可以包含多行内容。

---

*文档结束*
`

const sampleHtml = `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; line-height: 1.6; }
        h1 { color: #1e40af; border-bottom: 2px solid #3b82f6; }
        .highlight { background: #fef3c7; padding: 0.5rem; }
    </style>
</head>
<body>
    <h1>文档标题</h1>
    <p>这是一个 HTML 示例文档。</p>
    <p class="highlight">高亮文本</p>
    <ul>
        <li>列表项 1</li>
        <li>列表项 2</li>
    </ul>
</body>
</html>`

const insertSample = () => {
    inputContent.value = inputMode.value === 'markdown' ? sampleMarkdown : sampleHtml
}

watch(inputMode, () => {
    inputContent.value = ''
})

const generatePdf = async () => {
    if (!inputContent.value.trim()) return

    processing.value = true
    try {
        
        const htmlContent = renderedHtml.value

        
        const printWindow = window.open('', '_blank')
        if (!printWindow) {
            throw new Error('无法打开打印窗口，请检查弹窗拦截设置')
        }

        
        const pageSizes = {
            a4: { width: '210mm', height: '297mm' },
            letter: { width: '8.5in', height: '11in' },
            a3: { width: '297mm', height: '420mm' }
        }

        const marginValues = {
            normal: '20mm',
            narrow: '10mm',
            wide: '30mm'
        }

        const size = pageSizes[pageSize.value]
        const margin = marginValues[margins.value]

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>PDF 导出</title>
                <style>
                    @page {
                        size: ${size.width} ${size.height};
                        margin: ${margin};
                    }
                    
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        line-height: 1.6;
                        color: #1e293b;
                        max-width: 100%;
                        padding: 0;
                        margin: 0;
                    }
                    
                    h1 { font-size: 2em; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5em; }
                    h2 { font-size: 1.5em; margin-top: 1.5em; }
                    h3 { font-size: 1.25em; }
                    
                    pre {
                        background: #f1f5f9;
                        padding: 1em;
                        border-radius: 8px;
                        overflow-x: auto;
                    }
                    
                    code {
                        background: #f1f5f9;
                        padding: 0.2em 0.4em;
                        border-radius: 4px;
                        font-size: 0.9em;
                    }
                    
                    pre code {
                        background: none;
                        padding: 0;
                    }
                    
                    blockquote {
                        border-left: 4px solid #3b82f6;
                        margin: 1em 0;
                        padding-left: 1em;
                        color: #64748b;
                    }
                    
                    table {
                        border-collapse: collapse;
                        width: 100%;
                        margin: 1em 0;
                    }
                    
                    th, td {
                        border: 1px solid #e2e8f0;
                        padding: 0.5em 1em;
                        text-align: left;
                    }
                    
                    th {
                        background: #f8fafc;
                        font-weight: 600;
                    }
                    
                    img {
                        max-width: 100%;
                    }
                    
                    hr {
                        border: none;
                        border-top: 1px solid #e2e8f0;
                        margin: 2em 0;
                    }
                </style>
            </head>
            <body>
                ${htmlContent}
            </body>
            </html>
        `)

        printWindow.document.close()

        
        setTimeout(() => {
            printWindow.print()
            
            setTimeout(() => {
                printWindow.close()
            }, 1000)
        }, 500)

        ElMessage.success('请在打印对话框中选择"另存为 PDF"')
    } catch (e) {
        console.error(e)
        ElMessage.error('生成失败: ' + e.message)
    } finally {
        processing.value = false
    }
}
</script>

<style scoped>
.tool-page {
    min-height: 100vh;
    background: #f8fafc;
    display: flex;
    flex-direction: column;
    color: #1e293b;
}

.tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.header-left,
.header-right {
    width: 100px;
    display: flex;
    align-items: center;
}

.header-center {
    flex: 1;
    text-align: center;
}

.tool-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
}

.tool-subtitle {
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
}

.tool-content {
    flex: 1;
    padding: 2rem;
    display: flex;
    justify-content: center;
}

.layout-container {
    width: 100%;
    max-width: 1200px;
}

.workbench {
    padding: 1.5rem;
    border-radius: 16px;
}

.editor-section {
    margin-bottom: 1.5rem;
}

.editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.editor-body {
    display: flex;
    gap: 1rem;
    height: 400px;
}

.input-panel {
    flex: 1;
}

.input-panel textarea {
    width: 100%;
    height: 100%;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
    font-family: 'Fira Code', monospace;
    font-size: 0.9rem;
    resize: none;
    outline: none;
}

.input-panel textarea:focus {
    border-color: #3b82f6;
}

.preview-panel {
    flex: 1;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.preview-header {
    padding: 0.5rem 1rem;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    font-size: 0.85rem;
    font-weight: 500;
    color: #64748b;
}

.preview-content {
    flex: 1;
    padding: 1rem;
    overflow-y: auto;
    font-size: 0.9rem;
    line-height: 1.6;
}

.preview-content :deep(h1) {
    font-size: 1.5em;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 0.3em;
}

.preview-content :deep(h2) {
    font-size: 1.25em;
}

.preview-content :deep(pre) {
    background: #f1f5f9;
    padding: 0.75rem;
    border-radius: 6px;
    overflow-x: auto;
}

.preview-content :deep(code) {
    background: #f1f5f9;
    padding: 0.1em 0.3em;
    border-radius: 3px;
    font-size: 0.85em;
}

.preview-content :deep(blockquote) {
    border-left: 3px solid #3b82f6;
    margin: 0.5em 0;
    padding-left: 0.75em;
    color: #64748b;
}

.preview-content :deep(table) {
    border-collapse: collapse;
    width: 100%;
}

.preview-content :deep(th),
.preview-content :deep(td) {
    border: 1px solid #e2e8f0;
    padding: 0.4em 0.6em;
    text-align: left;
}

.preview-content :deep(th) {
    background: #f8fafc;
}

.settings-section {
    display: flex;
    gap: 2rem;
    justify-content: center;
    margin-bottom: 1.5rem;
}

.setting-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.setting-item label {
    font-size: 0.9rem;
    font-weight: 500;
}

.action-btn {
    width: 100%;
}

.glass-card {
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.05);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
}
</style>
