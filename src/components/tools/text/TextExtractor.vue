<template>
    <div class="text-extractor">
        
        <nav class="nav-bar">
            <button @click="goHome" class="nav-back">
                <el-icon>
                    <ArrowLeft />
                </el-icon>
                返回
            </button>
            <div class="nav-center">
                <h1>文本提取器</h1>
                <span class="nav-subtitle">Text Extractor</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        
        <main class="main-content">
            <div class="extractor-layout">
                
                <section class="panel input-panel">
                    <div class="panel-header">
                        <span class="panel-title">源文本</span>
                        <div class="panel-actions">
                            <span class="stats-info" v-if="inputText">{{ inputText.length }} 字符 | {{ inputLines }}
                                行</span>
                            <button class="icon-btn" @click="fillDemoData" title="生成示例数据">
                                <span style="font-size: 14px; font-weight: bold;">示例数据</span>
                            </button>
                            <button class="icon-btn" @click="pasteText" title="粘贴">
                                <el-icon>
                                    <CopyDocument />
                                </el-icon>
                            </button>
                            <button class="icon-btn" @click="clearInput" title="清空">
                                <el-icon>
                                    <Delete />
                                </el-icon>
                            </button>
                        </div>
                    </div>
                    <div class="editor-wrapper">
                        <textarea v-model="inputText" class="text-editor" placeholder="在此输入或粘贴包含目标信息的文本..."
                            spellcheck="false"></textarea>
                    </div>
                </section>

                
                <section class="tools-panel">
                    <div class="panel-header" style="justify-content: center;">
                        <span class="panel-title">提取工具</span>
                    </div>

                    <div class="tools-scroll-area">
                        
                        <div class="options-bar">
                            <label class="checkbox-label">
                                <input type="checkbox" v-model="options.append"> 追加模式
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" v-model="options.unique"> 去重
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" v-model="options.sort"> 排序
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" v-model="options.trim"> 去空字符
                            </label>
                        </div>

                        
                        <div class="tool-group">
                            <div class="group-title">常用信息提取</div>
                            <div class="group-content">
                                <button class="tool-btn" @click="extract('email')">📧 邮箱</button>
                                <button class="tool-btn" @click="extract('url')">🔗 网址 URL</button>
                                <button class="tool-btn" @click="extract('phone')">📱 手机号</button>
                                <button class="tool-btn" @click="extract('ipv4')">🌐 IPv4</button>
                                <button class="tool-btn" @click="extract('idcard')">💳 身份证号</button>
                                <button class="tool-btn" @click="extract('date')">📅 日期</button>
                                <button class="tool-btn" @click="extract('time')">🕒 时间</button>
                                <button class="tool-btn" @click="extract('mac')">🖥️ MAC 地址</button>
                                <button class="tool-btn" @click="extract('color')">🎨 Hex 颜色</button>
                                <button class="tool-btn" @click="extract('plate')">🚗 车牌号</button>
                                <button class="tool-btn" @click="extract('passport')">🛂 护照号</button>
                                <button class="tool-btn" @click="extract('uuid')">🆔 UUID</button>
                                <button class="tool-btn" @click="extract('md5')">🔐 MD5</button>
                                <button class="tool-btn" @click="extract('magnet')">🧲 磁力链</button>
                                <button class="tool-btn" @click="extract('postcode')">📮 邮政编码</button>
                            </div>
                        </div>

                        
                        <div class="tool-group">
                            <div class="group-title">特定字符提取</div>
                            <div class="group-content">
                                <button class="tool-btn" @click="extract('number')">🔢 所有数字</button>
                                <button class="tool-btn" @click="extract('chinese')">🀄 所有中文</button>
                                <button class="tool-btn" @click="extract('english')">🔤 所有英文</button>
                                <button class="tool-btn" @click="extract('letter')">📝 英文单词</button>
                            </div>
                        </div>

                        
                        <div class="tool-group">
                            <div class="group-title">正则提取</div>
                            <div class="custom-input-group">
                                <input type="text" v-model="customRegex" placeholder="/\d+/" class="custom-input">
                                <button class="action-btn small-btn" @click="extract('customRegex')">提取</button>
                            </div>
                        </div>

                        
                        <div class="tool-group">
                            <div class="group-title">按行筛选</div>
                            <div class="custom-input-group mb-2">
                                <input type="text" v-model="includeKeyword" placeholder="包含关键词..." class="custom-input">
                                <button class="action-btn small-btn" @click="filterLines('include')">保留</button>
                            </div>
                            <div class="custom-input-group">
                                <input type="text" v-model="excludeKeyword" placeholder="不含关键词..." class="custom-input">
                                <button class="action-btn small-btn" @click="filterLines('exclude')">剔除</button>
                            </div>
                        </div>

                        
                        <div class="tool-group">
                            <div class="group-title">关键词统计</div>
                            <div class="custom-input-group">
                                <input type="text" v-model="countKeyword" placeholder="输入关键词..." class="custom-input">
                                <button class="action-btn small-btn" @click="countOccurrences">统计</button>
                            </div>
                        </div>

                    </div>
                </section>

                
                <section class="panel output-panel">
                    <div class="panel-header">
                        <span class="panel-title">提取结果</span>
                        <div class="panel-actions">
                            <span class="stats-info" v-if="matchCount > 0">{{ matchCount }} 项</span>
                            <button class="icon-btn" @click="copyResult" title="复制结果">
                                <el-icon>
                                    <CopyDocument />
                                </el-icon>
                            </button>
                            <button class="icon-btn" @click="clearOutput" title="清空结果">
                                <el-icon>
                                    <Delete />
                                </el-icon>
                            </button>
                        </div>
                    </div>
                    <div class="editor-wrapper">
                        <textarea v-model="outputText" class="text-editor result-editor" readonly
                            placeholder="提取结果列表..."></textarea>
                    </div>
                </section>
            </div>

            
            <Transition name="toast">
                <div v-if="toast.show" class="toast">{{ toast.message }}</div>
            </Transition>
        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - 文本提取器
        </footer>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Delete, CopyDocument } from '@element-plus/icons-vue'

const router = useRouter()
const inputText = ref('')
const outputText = ref('')
const toast = reactive({ show: false, message: '' })


const customRegex = ref('')
const includeKeyword = ref('')
const excludeKeyword = ref('')
const countKeyword = ref('')
const matchCount = ref(0)

const options = reactive({
    append: false,
    unique: true,
    sort: false,
    trim: true
})

const inputLines = computed(() => inputText.value ? inputText.value.split('\n').length : 0)


const patterns = {
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    url: /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/[^\s]+)/g,
    phone: /(?<!\d)(?:\+?86)?1[3-9]\d{9}(?!\d)/g,
    ipv4: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
    idcard: /\b\d{17}[\dXx]\b|\b\d{15}\b/g,
    date: /\d{4}[-/年]\d{1,2}[-/月]\d{1,2}/g,
    time: /\b([01]?[0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?\b/g,
    number: /-?\d+(?:\.\d+)?/g,
    chinese: /[\u4e00-\u9fa5]+/g,
    english: /[a-zA-Z]+/g,
    letter: /\b[a-zA-Z]+\b/g,
    mac: /[0-9A-Fa-f]{2}(?:[:-][0-9A-Fa-f]{2}){5}/g,
    color: /#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g,
    plate: /[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼][A-Z][A-Z0-9]{5,6}/g,
    passport: /(?:G|E)\d{8}/g,
    uuid: /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g,
    md5: /\b[a-fA-F0-9]{32}\b/g,
    magnet: /magnet:\?xt=urn:btih:[a-zA-Z0-9]{32,40}/g,
    postcode: /\b[1-9]\d{5}\b/g
}

function extract(type) {
    if (!inputText.value) {
        showToast('请先输入源文本')
        return
    }

    let regex = null

    if (type === 'customRegex') {
        if (!customRegex.value) {
            showToast('请输入正则表达式')
            return
        }
        try {
            
            const match = customRegex.value.match(new RegExp('^/(.*?)/([gimy]*)$'));
            if (match) {
                regex = new RegExp(match[1], match[2] || 'g');
            } else {
                regex = new RegExp(customRegex.value, 'g');
            }
        } catch (e) {
            showToast('正则表达式格式错误')
            return
        }
    } else {
        regex = patterns[type]
    }

    if (!regex) return

    let results = inputText.value.match(regex) || []

    const labels = {
        email: '邮箱', url: '网址', phone: '手机号', ipv4: 'IPv4', idcard: '身份证',
        date: '日期', time: '时间', number: '数字', chinese: '中文', english: '英文', letter: '单词',
        mac: 'MAC地址', color: 'Hex颜色', plate: '车牌号', passport: '护照号',
        uuid: 'UUID', md5: 'MD5', magnet: '磁力链接', postcode: '邮政编码',
        customRegex: '正则匹配'
    }
    const label = labels[type] || '提取结果'

    processResults(results, label)
}

function filterLines(mode) {
    if (!inputText.value) {
        showToast('请先输入源文本')
        return
    }

    const lines = inputText.value.split('\n')
    let results = []

    if (mode === 'include') {
        if (!includeKeyword.value) { showToast('请输入包含关键词'); return }
        results = lines.filter(line => line.includes(includeKeyword.value))
    } else if (mode === 'exclude') {
        if (!excludeKeyword.value) { showToast('请输入排除关键词'); return }
        results = lines.filter(line => !line.includes(excludeKeyword.value))
    }

    processResults(results, mode === 'include' ? `包含 "${includeKeyword.value}" 的行` : `不含 "${excludeKeyword.value}" 的行`)
}

function countOccurrences() {
    if (!inputText.value || !countKeyword.value) {
        showToast('请输入文本和关键词')
        return
    }

    
    
    const keyword = countKeyword.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(keyword, 'g');
    const matches = inputText.value.match(regex);
    const count = matches ? matches.length : 0;

    outputText.value = `关键词: "${countKeyword.value}"\n出现次数: ${count}`
    matchCount.value = count
    showToast(`找到 ${count} 个匹配`)
}

function processResults(rawResults, title = '结果') {
    let results = [...rawResults]

    if (options.trim) {
        results = results.map(s => s.trim()).filter(s => s)
    }

    if (options.unique) {
        results = [...new Set(results)]
    }

    if (options.sort) {
        results.sort()
    }

    const resultText = results.join('\n')

    if (options.append && outputText.value) {
        if (results.length > 0) {
            outputText.value += `\n\n--- ${title} (${results.length}) ---\n` + resultText
            matchCount.value += results.length
        } else {
            outputText.value += `\n\n--- ${title} (0) ---\n`
        }
    } else {
        outputText.value = resultText
        matchCount.value = results.length
    }

    if (results.length === 0) {
        showToast('未找到匹配内容')
    } else {
        showToast(`提取到 ${results.length} 条结果`)
    }
}



function fillDemoData() {
    inputText.value = `文本提取器测试数据：

1. 联系方式：
- 邮箱: support@example.com 和 john.doe123@work.net
- 手机: 13800138000 (CN), 15912345678

2. 链接与网络：
- 官网: https://www.example.com/home
- API接口: http://api.test-server.org/v1/data?q=test
- IP地址: 192.168.1.1, 8.8.8.8

3. 证件与日期：
- 身份证: 110101199003078888, 31010120000101123X
- 日期: 2024-05-01, 2024/10/01
- 时间: 09:30:00, 18:45

4. 混合内容：
这里包含一段中文文本以及 English translation。
混合数字：价格 99.9 元，数量 -5，编号 #9527。

5. 扩展信息：
- MAC地址: 00:0c:29:1a:2b:3c, A1-B2-C3-D4-E5-F6
- 颜色代码: #FFFFFF, #ff0000, #369
- 车牌号: 京A88888, 粤B12345, 沪AD12345
- 护照: E12345678, G87654321
- UUID: 550e8400-e29b-41d4-a716-446655440000
- MD5: e10adc3949ba59abbe56e057f20f883e
- 磁力链: magnet:?xt=urn:btih:5b3267325e1d4583d2c8038f220f883e
- 邮编: 100080 (北京), 200001 (上海)
`
    showToast('已加载演示数据')
}

async function pasteText() {
    try {
        const text = await navigator.clipboard.readText()
        inputText.value = text
    } catch (e) {
        showToast('无法读取剪贴板')
    }
}

function clearInput() {
    inputText.value = ''
    outputText.value = ''
    matchCount.value = 0
}

function clearOutput() {
    outputText.value = ''
    matchCount.value = 0
}

function copyResult() {
    if (!outputText.value) return
    navigator.clipboard.writeText(outputText.value).then(() => {
        showToast('已复制结果')
    })
}

function showToast(msg) {
    toast.message = msg
    toast.show = true
    setTimeout(() => toast.show = false, 2000)
}

function goHome() {
    if (window.history.length > 1) router.back()
    else router.push('/')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600&display=swap');

.text-extractor {
    --bg: #f5f7fa;
    --card: #ffffff;
    --border: #e5e7eb;
    --text: #1f2937;
    --text-secondary: #6b7280;
    --accent: #3b82f6;
    --accent-light: #eff6ff;

    font-family: 'Noto Sans SC', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    color: var(--text);
    display: flex;
    flex-direction: column;
}


.nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background: var(--card);
    border-bottom: 1px solid var(--border);
}

.nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 0.9rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s;
}

.nav-back:hover {
    background: var(--accent-light);
    color: var(--accent);
}

.nav-center h1 {
    font-size: 1.25rem;
    font-weight: 600;
    text-align: center;
}

.nav-subtitle {
    display: block;
    font-size: 0.7rem;
    color: var(--text-secondary);
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.nav-spacer {
    width: 60px;
}


.main-content {
    flex: 1;
    max-width: 1400px;
    width: 100%;
    margin: 0 auto;
    padding: 1.5rem;
}

.extractor-layout {
    display: flex;
    gap: 1.5rem;
    height: calc(100vh - 120px);
}


.panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.input-panel {
    flex: 1;
}

.output-panel {
    flex: 1;
}

.tools-panel {
    flex: 0.6;
    min-width: 320px;
    max-width: 450px;
    display: flex;
    flex-direction: column;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
}

.tools-scroll-area {
    padding: 1rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    height: 100%;
}

.panel-header {
    padding: 0.8rem 1rem;
    border-bottom: 1px solid var(--border);
    background: #f9fafb;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.panel-title {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--text);
}

.panel-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.stats-info {
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-right: 0.5rem;
    background: #f3f4f6;
    padding: 2px 6px;
    border-radius: 4px;
}

.icon-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    color: var(--text-secondary);
    transition: all 0.2s;
}

.icon-btn:hover {
    color: var(--accent);
    background: var(--accent-light);
}

.editor-wrapper {
    flex: 1;
    position: relative;
}

.text-editor {
    width: 100%;
    height: 100%;
    border: none;
    resize: none;
    padding: 1rem;
    font-family: inherit;
    font-size: 0.95rem;
    line-height: 1.6;
    outline: none;
    color: var(--text);
    background: transparent;
}

.result-editor {
    background: #fdfdfd;
}


.group-title {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
    text-transform: uppercase;
}

.group-content {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
}

.tool-btn {
    background: var(--card);
    border: 1px solid var(--border);
    padding: 0.5rem;
    border-radius: 6px;
    font-size: 0.85rem;
    color: var(--text);
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
    display: flex;
    align-items: center;
}

.tool-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-light);
}

.tool-btn:active {
    transform: translateY(1px);
}


.options-bar {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    background: #f3f4f6;
    padding: 0.75rem;
    border-radius: 8px;
}

.checkbox-label {
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    cursor: pointer;
    color: var(--text);
}


.custom-input-group {
    display: flex;
    gap: 0.5rem;
}

.custom-input {
    flex: 1;
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 0.4rem 0.6rem;
    font-size: 0.85rem;
    background: var(--card);
    color: var(--text);
    outline: none;
}

.custom-input:focus {
    border-color: var(--accent);
}

.small-btn {
    padding: 0.4rem 0.8rem;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.85rem;
    cursor: pointer;
    white-space: nowrap;
}

.small-btn:hover {
    background: #2563eb;
}

.mb-2 {
    margin-bottom: 0.5rem;
}


@media (max-width: 1024px) {
    .extractor-layout {
        flex-direction: column;
        height: auto;
    }

    .panel {
        height: 300px;
    }

    .tools-panel {
        max-width: none;
        height: auto;
        min-height: auto;
    }
}


.toast {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 100px;
    font-size: 0.85rem;
    z-index: 1000;
}

.toast-enter-active,
.toast-leave-active {
    transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
}


@media (prefers-color-scheme: dark) {
    :root {
        --bg: #111827;
        --card: #1f2937;
        --border: #374151;
        --text: #f9fafb;
        --text-secondary: #9ca3af;
        --accent: #60a5fa;
        --accent-light: rgba(59, 130, 246, 0.1);
    }

    .panel-header {
        background: #1f2937;
        border-bottom-color: #374151;
    }

    .result-editor {
        background: #1f2937;
    }

    .stats-info,
    .options-bar {
        background: #374151;
        color: #d1d5db;
    }

    .custom-input {
        background: #111827;
        border-color: #374151;
    }
}


.footer {
    text-align: center;
    padding: 3rem 0;
    color: var(--text-secondary, #64748b);
    font-size: 0.85rem;
}
</style>
