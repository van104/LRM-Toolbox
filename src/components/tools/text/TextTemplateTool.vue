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
            <h1 class="tool-title">文本模板引擎</h1>
            <div class="header-right"></div>
        </header>

        <div class="tool-content">
            <div class="layout-container">

                
                <section class="panel template-panel">
                    <div class="panel-header">
                        <span class="panel-title">1. 模板编辑</span>
                        <el-popover placement="bottom" title="变量提示" :width="200" trigger="hover">
                            <template #reference>
                                <el-icon class="info-icon">
                                    <InfoFilled />
                                </el-icon>
                            </template>
                            <p class="help-text">使用 <code>{{ '{' }}{{ '{' }}key{{ '}' }}{{ '}' }}</code>
                                作为占位符。<br>自动从数据中提取变量。</p>
                        </el-popover>
                    </div>
                    <div class="editor-wrapper">
                        <textarea
v-model="templateText" class="code-editor" placeholder="你好 {{name}}，你的验证码是 {{code}}。"
                            spellcheck="false"></textarea>
                    </div>
                    <div v-if="variables.length" class="variable-list">
                        <span v-for="v in variables" :key="v" class="var-tag" @click="insertVar(v)">{{ v }}</span>
                    </div>
                </section>

                
                <section class="panel data-panel">
                    <div class="panel-header">
                        <span class="panel-title">2. 数据源</span>
                        <div class="mode-switch">
                            <button
:class="{ active: curDataMode === 'json' }"
                                @click="curDataMode = 'json'">JSON</button>
                            <button :class="{ active: curDataMode === 'csv' }" @click="curDataMode = 'csv'">CSV</button>
                        </div>
                    </div>
                    <div class="editor-wrapper">
                        <textarea
v-model="dataInput" class="code-editor" :placeholder="dataPlaceholder"
                            spellcheck="false"></textarea>
                    </div>
                    <div class="panel-footer">
                        <div class="data-status">
                            <span v-if="parsedData.length > 0" class="success">✅ 已解析 {{ parsedData.length }} 条数据</span>
                            <span v-else class="error">⚠️ {{ parseError || '等待输入...' }}</span>
                        </div>
                        <el-button size="small" @click="fillDemo">填充示例</el-button>
                    </div>
                </section>

                
                <section class="panel result-panel">
                    <div class="panel-header">
                        <span class="panel-title">3. 生成结果</span>
                        <div class="actions">
                            <el-select v-model="separator" size="small" style="width: 100px">
                                <el-option label="换行符" value="\n" />
                                <el-option label="逗号" value="," />
                                <el-option label="分号" value=";" />
                                <el-option label="自定义" value="custom" />
                            </el-select>
                            <el-input
v-if="separator === 'custom'" v-model="customSeparator" size="small"
                                style="width: 60px" placeholder="符号" />
                            <el-button type="primary" size="small" @click="generate">生成</el-button>
                        </div>
                    </div>
                    <div class="editor-wrapper">
                        <textarea
v-model="resultText" class="code-editor result-editor" readonly
                            placeholder="生成结果显示在此..."></textarea>
                    </div>
                    <div class="panel-footer">
                        <span v-if="resultText" class="count-info">{{ resultText.length }} chars</span>
                        <el-button size="small" :disabled="!resultText" @click="copyResult">复制结果</el-button>
                    </div>
                </section>

            </div>

            
            <div class="help-section">
                <h3><el-icon>
                        <QuestionFilled />
                    </el-icon> 使用指南</h3>
                <div class="help-grid">
                    <div class="help-card">
                        <h4>1. 编写模板</h4>
                        <p>使用 <code>{{ '{' }}{{ '{' }}变量名{{ '}' }}{{ '}' }}</code> 作为占位符。</p>
                        <div class="example">
                            示例：<br>
                            你好 <strong>{{ '{' }}{{ '{' }}name{{ '}' }}{{ '}' }}</strong>，验证码是 <strong>{{ '{' }}{{ '{'
                                }}code{{ '}'
                                }}{{ '}' }}</strong>
                        </div>
                    </div>
                    <div class="help-card">
                        <h4>2. 准备数据</h4>
                        <p>支持 <strong>JSON</strong> (对象数组) 或 <strong>CSV</strong> (首行为表头)。</p>
                        <div class="example">
                            JSON:<br>
                            <code>[{"name": "张三", "code": 123}]</code>
                        </div>
                    </div>
                    <div class="help-card">
                        <h4>3. 批量生成</h4>
                        <p>系统将遍历数据，逐条替换模板变量。</p>
                        <div class="example">
                            支持自定义连接符（如换行、逗号）将结果拼接在一起。
                        </div>
                    </div>
                </div>
            </div>

        </div>
        <footer class="footer">
            © 2026 LRM工具箱 - 文本模板引擎
        </footer>
    </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, InfoFilled, QuestionFilled } from '@element-plus/icons-vue'

const router = useRouter()
const templateText = ref('')
const dataInput = ref('')
const curDataMode = ref('json')
const resultText = ref('')
const separator = ref('\n')
const customSeparator = ref('---')


const variables = computed(() => {
    const regex = /\{\{\s*([a-zA-Z0-9_$]+)\s*\}\}/g
    const vars = new Set()
    let match
    while ((match = regex.exec(templateText.value)) !== null) {
        vars.add(match[1])
    }
    return Array.from(vars)
})

function insertVar(v) {
    templateText.value += `{{${v}}}`
}


const parsedData = ref([])
const parseError = ref('')

const dataPlaceholder = computed(() => {
    if (curDataMode.value === 'json') return `[\n  {"name": "Alice", "code": 1234},\n  {"name": "Bob", "code": 5678}\n]`
    return `name,code\nAlice,1234\nBob,5678`
})

watch([dataInput, curDataMode], () => {
    parseData()
})

function parseData() {
    parsedData.value = []
    parseError.value = ''

    if (!dataInput.value.trim()) return

    try {
        if (curDataMode.value === 'json') {
            const data = JSON.parse(dataInput.value)
            if (!Array.isArray(data)) throw new Error('JSON必须是数组格式 (Array)')
            parsedData.value = data
        } else {
            
            const lines = dataInput.value.split('\n').filter(l => l.trim())
            if (lines.length < 2) throw new Error('CSV至少需要表头和一行数据')

            const headers = lines[0].split(',').map(h => h.trim())
            const list = []

            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(',') 
                if (cols.length !== headers.length) continue 

                const obj = {}
                headers.forEach((h, idx) => {
                    obj[h] = cols[idx] ? cols[idx].trim() : ''
                })
                list.push(obj)
            }
            parsedData.value = list
        }
    } catch (e) {
        parseError.value = e.message
    }
}

function generate() {
    if (parsedData.value.length === 0) return ElMessage.warning('请先提供有效数据')
    if (!templateText.value) return ElMessage.warning('请填写模板')

    const sep = separator.value === 'custom' ? customSeparator.value :
        separator.value === '\\n' ? '\n' : separator.value

    const list = parsedData.value.map(item => {
        return templateText.value.replace(/\{\{\s*([a-zA-Z0-9_$]+)\s*\}\}/g, (_, key) => {
            return item[key] !== undefined ? item[key] : `{{${key}}}`
        })
    })

    resultText.value = list.join(sep)
    ElMessage.success(`生成 ${list.length} 条数据`)
}

function fillDemo() {
    templateText.value = `尊敬的 {{name}}：\n您好！您的账户余额为 {{balance}} 元，请及时处理。\n日期：{{date}}`

    if (curDataMode.value === 'json') {
        dataInput.value = `[\n  {"name": "张三", "balance": 500, "date": "2026-01-01"},\n  {"name": "李四", "balance": 120, "date": "2026-01-02"}\n]`
    } else {
        dataInput.value = `name,balance,date\n张三,500,2026-01-01\n李四,120,2026-01-02`
    }
}

function copyResult() {
    if (!resultText.value) return
    navigator.clipboard.writeText(resultText.value).then(() => ElMessage.success('已复制'))
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
    justify-content: space-between;
    align-items: center;
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
    max-width: 1400px;
    width: 100%;
    margin: 0 auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
}

.layout-container {
    display: flex;
    gap: 1rem;
    height: calc(100vh - 180px);
    min-height: 500px;
}

.panel {
    flex: 1;
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.panel-header {
    background: #f8fafc;
    padding: 0.8rem 1rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.panel-title {
    font-weight: 600;
    color: #1e293b;
    font-size: 0.95rem;
}

.help-text {
    font-size: 0.8rem;
    line-height: 1.4;
    color: #64748b;
}

.mode-switch button {
    border: none;
    background: transparent;
    padding: 2px 8px;
    cursor: pointer;
    font-size: 0.8rem;
    border-radius: 4px;
    color: #64748b;
}

.mode-switch button.active {
    background: #e2e8f0;
    color: #0f172a;
    font-weight: 600;
}

.editor-wrapper {
    flex: 1;
    position: relative;
    background: #fff;
}

.code-editor {
    width: 100%;
    height: 100%;
    border: none;
    padding: 1rem;
    resize: none;
    outline: none;
    font-family: 'Consolas', monospace;
    font-size: 0.9rem;
    line-height: 1.5;
    color: #334155;
    background: transparent;
}

.result-editor {
    background: #fdfdfd;
}

.variable-list {
    padding: 0.5rem 1rem;
    background: #f1f5f9;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    min-height: 40px;
}

.var-tag {
    background: #fff;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 0.75rem;
    cursor: pointer;
    color: #475569;
}

.var-tag:hover {
    border-color: #3b82f6;
    color: #3b82f6;
}

.panel-footer {
    padding: 0.8rem 1rem;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f8fafc;
}

.data-status {
    font-size: 0.75rem;
}

.success {
    color: #10b981;
}

.error {
    color: #ef4444;
}

.count-info {
    font-size: 0.75rem;
    color: #94a3b8;
}


@media (prefers-color-scheme: dark) {
    .tool-page {
        background: #111827;
    }

    .tool-header,
    .footer {
        background: #1f2937;
        border-color: #374151;
        color: #f3f4f6;
    }

    .tool-title {
        color: #f3f4f6;
    }

    .panel {
        background: #1f2937;
        border-color: #374151;
    }

    .panel-header,
    .panel-footer,
    .variable-list {
        background: #374151;
        border-color: #4b5563;
    }

    .panel-title {
        color: #f3f4f6;
    }

    .code-editor {
        color: #e2e8f0;
        background: #1f2937;
    }

    .result-editor {
        background: #111827;
    }

    .mode-switch button.active {
        background: #4b5563;
        color: white;
    }

    .var-tag {
        background: #374151;
        border-color: #4b5563;
        color: #cbd5e1;
    }
}


@media (max-width: 900px) {
    .layout-container {
        flex-direction: column;
        height: auto;
    }

    .panel {
        min-height: 300px;
    }
}


.help-section {
    margin-top: 2rem;
    background: #fff;
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid rgba(0, 0, 0, 0.08);
}

.help-section h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #334155;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.help-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.help-card h4 {
    font-weight: 600;
    color: #475569;
    margin-bottom: 0.5rem;
    font-size: 0.95rem;
}

.help-card p {
    font-size: 0.85rem;
    color: #64748b;
    line-height: 1.5;
    margin-bottom: 0.5rem;
}

.help-card .example {
    background: #f8fafc;
    padding: 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    color: #334155;
    border: 1px solid #e2e8f0;
    font-family: monospace;
}

.help-card code {
    background: #f1f5f9;
    padding: 2px 4px;
    border-radius: 3px;
    color: #e11d48;
}

@media (prefers-color-scheme: dark) {
    .help-section {
        background: #1f2937;
        border-color: #374151;
    }

    .help-section h3 {
        color: #f3f4f6;
    }

    .help-card h4 {
        color: #e2e8f0;
    }

    .help-card p {
        color: #94a3b8;
    }

    .help-card .example {
        background: #374151;
        border-color: #4b5563;
        color: #cbd5e1;
    }

    .help-card code {
        background: #4b5563;
        color: #fca5a5;
    }
}

.footer {
    text-align: center;
    padding: 1rem 0;
    color: var(--text-secondary, #64748b);
    font-size: 0.85rem;
}
</style>
