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
            <h1 class="tool-title">随机数据生成器</h1>
            <div class="header-right"></div>
        </header>

        <div class="tool-content">
            <div class="layout-container">
                
                <aside class="config-panel">
                    <div class="tabs-header">
                        <button
:class="['tab-btn', { active: currentTab === 'basic' }]"
                            @click="currentTab = 'basic'">🧱 基础数据</button>
                        <button :class="['tab-btn', { active: currentTab === 'text' }]" @click="currentTab = 'text'">📄
                            文本文章</button>
                        <button
:class="['tab-btn', { active: currentTab === 'persona' }]"
                            @click="currentTab = 'persona'">👤 个人信息</button>
                        <button :class="['tab-btn', { active: currentTab === 'mock' }]" @click="currentTab = 'mock'">🔧
                            JSON 模拟</button>
                    </div>

                    <div class="tab-content">
                        
                        <div v-if="currentTab === 'basic'" class="config-group">
                            <div class="config-item">
                                <span class="label">UUID / GUID</span>
                                <div class="flex-row">
                                    <el-input-number
v-model="basic.uuidCount" :min="1" :max="100" size="small"
                                        label="数量" />
                                    <el-button type="primary" size="small" @click="genUUID">生成</el-button>
                                </div>
                            </div>
                            <div class="divider"></div>
                            <div class="config-item">
                                <span class="label">随机字符串</span>
                                <div class="flex-column">
                                    <div class="flex-row">
                                        <el-checkbox v-model="basic.strLower">a-z</el-checkbox>
                                        <el-checkbox v-model="basic.strUpper">A-Z</el-checkbox>
                                        <el-checkbox v-model="basic.strNum">0-9</el-checkbox>
                                        <el-checkbox v-model="basic.strSymbol">!@#</el-checkbox>
                                    </div>
                                    <div class="flex-row">
                                        <el-input-number
v-model="basic.strLen" :min="1" :max="128" size="small"
                                            placeholder="长度" />
                                        <el-button type="primary" size="small" @click="genString">生成</el-button>
                                    </div>
                                </div>
                            </div>
                            <div class="divider"></div>
                            <div class="config-item">
                                <span class="label">随机数字</span>
                                <div class="flex-row">
                                    <el-input-number v-model="basic.numMin" size="small" placeholder="Min" />
                                    <span class="separator">-</span>
                                    <el-input-number v-model="basic.numMax" size="small" placeholder="Max" />
                                    <el-button type="primary" size="small" @click="genNumber">生成</el-button>
                                </div>
                            </div>
                            <div class="divider"></div>
                            <div class="config-item">
                                <span class="label">随机颜色</span>
                                <div class="flex-row">
                                    <el-button size="small" @click="genColor('hex')">Hex</el-button>
                                    <el-button size="small" @click="genColor('rgb')">RGB</el-button>
                                    <el-button size="small" @click="genColor('hsl')">HSL</el-button>
                                </div>
                            </div>
                        </div>

                        
                        <div v-if="currentTab === 'text'" class="config-group">
                            <div class="config-item">
                                <span class="label">语言</span>
                                <el-radio-group v-model="textOpt.lang" size="small">
                                    <el-radio-button label="zh">中文</el-radio-button>
                                    <el-radio-button label="en">English</el-radio-button>
                                </el-radio-group>
                            </div>
                            <div class="config-item">
                                <span class="label">单位</span>
                                <el-radio-group v-model="textOpt.unit" size="small">
                                    <el-radio-button label="word">词/字</el-radio-button>
                                    <el-radio-button label="sentence">句子</el-radio-button>
                                    <el-radio-button label="paragraph">段落</el-radio-button>
                                </el-radio-group>
                            </div>
                            <div class="config-item">
                                <span class="label">数量</span>
                                <el-slider v-model="textOpt.count" :min="1" :max="50" show-input />
                            </div>
                            <div class="config-item">
                                <el-button type="primary" class="full-btn" @click="genText">生成文本</el-button>
                            </div>
                        </div>

                        
                        <div v-if="currentTab === 'persona'" class="config-group">
                            <div class="config-item">
                                <span class="label">生成数量</span>
                                <el-input-number v-model="persona.count" :min="1" :max="100" />
                            </div>
                            <div class="config-item">
                                <span class="label">包含字段</span>
                                <div class="checkbox-grid">
                                    <el-checkbox v-model="persona.fields.name" label="姓名" />
                                    <el-checkbox v-model="persona.fields.id" label="身份证" />
                                    <el-checkbox v-model="persona.fields.mobile" label="手机号" />
                                    <el-checkbox v-model="persona.fields.email" label="邮箱" />
                                    <el-checkbox v-model="persona.fields.address" label="地址" />
                                    <el-checkbox v-model="persona.fields.ip" label="IP" />
                                    <el-checkbox v-model="persona.fields.date" label="日期" />
                                </div>
                            </div>
                            <div class="config-item">
                                <el-button type="primary" class="full-btn" @click="genPersona">生成列表</el-button>
                            </div>
                        </div>

                        
                        <div v-if="currentTab === 'mock'" class="config-group">
                            <div class="config-item">
                                <span class="label">Mock.js 模板</span>
                                <span class="desc">输入 Mock 模板对象</span>
                                <div class="editor-wrapper">
                                    <textarea
v-model="mockTemplate" class="code-editor" spellcheck="false"
                                        placeholder="{'list|5': [{'id|+1': 1, 'name': '@cname'}]}"></textarea>
                                </div>
                            </div>
                            <div class="config-item">
                                <el-button type="primary" class="full-btn" @click="genMock">执行 Mock</el-button>
                                <el-button text size="small" @click="fillMockDemo">加载示例模板</el-button>
                            </div>
                        </div>

                    </div>
                </aside>

                
                <main class="result-panel">
                    <div class="panel-header">
                        <span class="panel-title">生成结果</span>
                        <div class="actions">
                            <span v-if="resultText" class="count-info">{{ resultText.length }} chars</span>
                            <el-button size="small" :disabled="!resultText" @click="copyResult">
                                <el-icon>
                                    <CopyDocument />
                                </el-icon> 复制
                            </el-button>
                            <el-button
size="small" type="danger" plain :disabled="!resultText"
                                @click="resultText = ''">
                                <el-icon>
                                    <Delete />
                                </el-icon> 清空
                            </el-button>
                        </div>
                    </div>
                    <div class="result-wrapper">
                        <textarea
v-model="resultText" readonly class="result-editor"
                            placeholder="结果将显示在这里..."></textarea>
                    </div>
                </main>
            </div>

            
            <div class="help-section">
                <h3><el-icon>
                        <QuestionFilled />
                    </el-icon> 使用指南</h3>
                <div class="help-grid">
                    <div class="help-card">
                        <h4>1. 基础数据</h4>
                        <p>生成 UUID、随机字符串、数字或颜色。</p>
                        <div class="example">
                            UUID: <code>a1b2-c3d4...</code><br>
                            Hex: <code>#ff0055</code>
                        </div>
                    </div>
                    <div class="help-card">
                        <h4>2. 个人信息</h4>
                        <p>生成包含姓名、身份证、手机号等的虚拟画像。</p>
                        <div class="example">
                            支持 JSON 导出，由 <code>Mock.js</code> 驱动。
                        </div>
                    </div>
                    <div class="help-card">
                        <h4>3. JSON 模拟</h4>
                        <p>使用 Mock 模板语法自定义复杂数据结构。</p>
                        <div class="example">
                            <code>"list|5": [{"id|+1": 1}]</code><br>
                            生成 5 条 id 递增的数据。
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <footer class="footer">
            © 2026 LRM工具箱 - 随机数据生成器
        </footer>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, CopyDocument, Delete, QuestionFilled } from '@element-plus/icons-vue'
import Mock from 'mockjs'

const router = useRouter()
const currentTab = ref('basic')
const resultText = ref('')


const basic = reactive({
    uuidCount: 5,
    strLower: true,
    strUpper: true,
    strNum: true,
    strSymbol: false,
    strLen: 16,
    numMin: 0,
    numMax: 100
})

function genUUID() {
    const arr = []
    for (let i = 0; i < basic.uuidCount; i++) {
        arr.push(Mock.Random.guid())
    }
    resultText.value = arr.join('\n')
}

function genString() {
    let pool = ''
    if (basic.strLower) pool += 'abcdefghijklmnopqrstuvwxyz'
    if (basic.strUpper) pool += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (basic.strNum) pool += '0123456789'
    if (basic.strSymbol) pool += '!@#$%^&*()_+-=[]{}|;:,.<>?'

    if (!pool) return ElMessage.warning('请选择至少一种字符类型')

    
    
    
    

    let res = ''
    for (let i = 0; i < basic.strLen; i++) {
        res += pool.charAt(Math.floor(Math.random() * pool.length))
    }
    resultText.value = res
}

function genNumber() {
    
    
    
    const arr = []
    for (let i = 0; i < 10; i++) {
        arr.push(Mock.Random.integer(basic.numMin, basic.numMax))
    }
    resultText.value = arr.join('\n')
}

function genColor(type) {
    const arr = []
    for (let i = 0; i < 5; i++) {
        if (type === 'hex') arr.push(Mock.Random.hex())
        if (type === 'rgb') arr.push(Mock.Random.rgb())
        if (type === 'hsl') arr.push(Mock.Random.hsl())
    }
    resultText.value = arr.join('\n')
}


const textOpt = reactive({
    lang: 'zh',
    unit: 'paragraph',
    count: 3
})

function genText() {
    const arr = []
    const { lang, unit, count } = textOpt

    for (let i = 0; i < count; i++) {
        if (lang === 'zh') {
            if (unit === 'word') arr.push(Mock.Random.cword(2, 5))
            else if (unit === 'sentence') arr.push(Mock.Random.csentence(5, 15))
            else arr.push(Mock.Random.cparagraph(3, 7))
        } else {
            if (unit === 'word') arr.push(Mock.Random.word(3, 10))
            else if (unit === 'sentence') arr.push(Mock.Random.sentence(5, 10))
            else arr.push(Mock.Random.paragraph(3, 5))
        }
    }

    resultText.value = arr.join('\n\n')
}


const persona = reactive({
    count: 10,
    fields: {
        name: true,
        id: true,
        mobile: true,
        email: false,
        address: false,
        ip: false,
        date: false
    }
})

function genPersona() {
    const tpl = {}
    if (persona.fields.name) tpl['name'] = '@cname'
    if (persona.fields.id) tpl['id'] = '@id'
    if (persona.fields.mobile) tpl['mobile'] = /1\d{10}/ 
    if (persona.fields.email) tpl['email'] = '@email'
    if (persona.fields.address) tpl['address'] = '@county(true) @ctitle(3,5)号' 
    if (persona.fields.ip) tpl['ip'] = '@ip'
    if (persona.fields.date) tpl['date'] = '@date("yyyy-MM-dd")'

    
    if (Object.keys(tpl).length === 0) return ElMessage.warning('请选择至少一个字段')

    
    const data = Mock.mock({
        [`list|${persona.count}`]: [tpl]
    })

    
    resultText.value = JSON.stringify(data.list, null, 2)
}


const mockTemplate = ref(`{
  "list|5": [{
    "id|+1": 1,
    "name": "@cname",
    "age|18-60": 1,
    "city": "@city",
    "email": "@email"
  }]
}`)

function genMock() {
    try {
        
        
        
        
        
        
        
        

        
        

        const func = new Function(`return ${mockTemplate.value}`)
        const tpl = func()
        const data = Mock.mock(tpl)
        resultText.value = JSON.stringify(data, null, 2)
    } catch (e) {
        ElMessage.error('模板格式错误: ' + e.message)
    }
}

function fillMockDemo() {
    mockTemplate.value = `{
  "status": 0,
  "msg": "success",
  "data": {
    "list|5-10": [{
      "id|+1": 1001,
      "title": "@ctitle(5, 10)",
      "author": "@cname",
      "views|100-5000": 1,
      "public": "@boolean"
    }]
  }
}`
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
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
}

.layout-container {
    display: flex;
    gap: 1.5rem;
    height: calc(100vh - 200px);
    
    min-height: 500px;
}


.config-panel {
    width: 380px;
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.tabs-header {
    display: flex;
    background: #f8fafc;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.tab-btn {
    flex: 1;
    padding: 0.8rem 0;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 0.85rem;
    color: #64748b;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
}

.tab-btn:hover {
    background: #f1f5f9;
}

.tab-btn.active {
    background: #ffffff;
    color: #3b82f6;
    
    border-bottom-color: #3b82f6;
    font-weight: 600;
}

.tab-content {
    flex: 1;
    padding: 1.5rem;
    overflow-y: auto;
}

.config-group {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.config-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #475569;
}

.desc {
    font-size: 0.75rem;
    color: #94a3b8;
}

.divider {
    height: 1px;
    background: #e2e8f0;
    margin: 0.5rem 0;
}

.flex-row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
}

.flex-column {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.full-btn {
    width: 100%;
}

.separator {
    color: #94a3b8;
}

.checkbox-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
}

.editor-wrapper {
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: #f8fafc;
    height: 200px;
}

.code-editor {
    width: 100%;
    height: 100%;
    border: none;
    background: transparent;
    padding: 0.8rem;
    resize: none;
    outline: none;
    font-family: monospace;
    font-size: 0.85rem;
    color: #334155;
    line-height: 1.5;
}


.result-panel {
    flex: 1;
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 1.2rem;
    background: #f8fafc;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.panel-title {
    font-weight: 600;
    color: #1e293b;
}

.actions {
    display: flex;
    gap: 0.8rem;
    align-items: center;
}

.count-info {
    font-size: 0.75rem;
    color: #94a3b8;
}

.result-wrapper {
    flex: 1;
    position: relative;
}

.result-editor {
    width: 100%;
    height: 100%;
    border: none;
    padding: 1.2rem;
    resize: none;
    outline: none;
    font-family: monospace;
    font-size: 0.95rem;
    color: #1e293b;
    line-height: 1.6;
    background: transparent;
}


.footer {
    text-align: center;
    padding: 1rem 0;
    color: var(--text-secondary, #64748b);
    font-size: 0.85rem;
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

    .config-panel,
    .result-panel {
        background: #1f2937;
        border-color: #374151;
    }

    .tabs-header,
    .panel-header {
        background: #374151;
        border-color: #4b5563;
    }

    .tab-btn {
        color: #9ca3af;
    }

    .tab-btn:hover {
        background: #4b5563;
    }

    .tab-btn.active {
        background: #1f2937;
        color: #60a5fa;
        border-bottom-color: #60a5fa;
    }

    .label {
        color: #cbd5e1;
    }

    .divider {
        background: #4b5563;
    }

    .editor-wrapper {
        background: #111827;
        border-color: #4b5563;
    }

    .code-editor,
    .result-editor {
        color: #e2e8f0;
    }

    .count-info {
        color: #6b7280;
    }
}


@media (max-width: 800px) {
    .layout-container {
        flex-direction: column;
        height: auto;
    }

    .config-panel,
    .result-panel {
        width: 100%;
    }

    .config-panel {
        min-height: auto;
    }

    .result-panel {
        min-height: 400px;
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
</style>
