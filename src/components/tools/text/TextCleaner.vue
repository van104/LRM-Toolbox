<template>
    <div class="text-cleaner">
        
        <nav class="nav-bar">
            <button class="nav-back" @click="goHome">
                <el-icon>
                    <ArrowLeft />
                </el-icon>
                返回
            </button>
            <div class="nav-center">
                <h1>文本清洗</h1>
                <span class="nav-subtitle">Text Cleaner</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        
        <main class="main-content">
            <div class="cleaner-layout">
                
                <section class="panel input-panel">
                    <div class="panel-header">
                        <span class="panel-title">输入文本</span>
                        <div class="panel-actions">
                            <span v-if="inputText" class="stats-info">{{ inputText.length }} 字符 | {{ inputLines }}
                                行</span>
                            <button class="icon-btn" title="粘贴" @click="pasteText">
                                <el-icon>
                                    <CopyDocument />
                                </el-icon>
                            </button>
                            <button class="icon-btn" title="清空" @click="clearInput">
                                <el-icon>
                                    <Delete />
                                </el-icon>
                            </button>
                        </div>
                    </div>
                    <div class="editor-wrapper">
                        <textarea
v-model="inputText" class="text-editor" placeholder="在此输入或粘贴需要处理的文本..."
                            spellcheck="false"></textarea>
                    </div>
                </section>

                
                <section class="tools-panel">
                    
                    <div class="action-bar">
                        <button
class="action-btn execute-btn" :disabled="selectedFunctions.length === 0"
                            @click="executeSelected">
                            <el-icon>
                                <Check />
                            </el-icon>
                            执行 ({{ selectedFunctions.length }})
                        </button>
                        <button
class="action-btn clear-btn" :disabled="selectedFunctions.length === 0"
                            @click="clearSelection">
                            <el-icon>
                                <Close />
                            </el-icon>
                            清除选择
                        </button>
                    </div>

                    <div class="tool-group">
                        <div class="group-title">基础清洗</div>
                        <div class="group-content">
                            <button
class="tool-btn" :class="{ active: isSelected('removeEmptyLines') }"
                                @click="toggleFunction('removeEmptyLines')">删除空行</button>
                            <button
class="tool-btn" :class="{ active: isSelected('trimLines') }"
                                @click="toggleFunction('trimLines')">删除行首尾空格</button>
                            <button
class="tool-btn" :class="{ active: isSelected('removeAllSpaces') }"
                                @click="toggleFunction('removeAllSpaces')">删除所有空格</button>
                            <button
class="tool-btn" :class="{ active: isSelected('mergeSpaces') }"
                                @click="toggleFunction('mergeSpaces')">多空格转单空格</button>
                            <button
class="tool-btn" :class="{ active: isSelected('removeDuplicates') }"
                                @click="toggleFunction('removeDuplicates')">按行去重</button>
                        </div>
                    </div>

                    <div class="tool-group">
                        <div class="group-title">排序与反转</div>
                        <div class="group-content">
                            <button
class="tool-btn" :class="{ active: isSelected('sortLinesAsc') }"
                                @click="toggleFunction('sortLinesAsc')">按行升序 A-Z</button>
                            <button
class="tool-btn" :class="{ active: isSelected('sortLinesDesc') }"
                                @click="toggleFunction('sortLinesDesc')">按行降序 Z-A</button>
                            <button
class="tool-btn" :class="{ active: isSelected('shuffleLines') }"
                                @click="toggleFunction('shuffleLines')">按行打乱</button>
                            <button
class="tool-btn" :class="{ active: isSelected('reverseLines') }"
                                @click="toggleFunction('reverseLines')">整行反转</button>
                            <button
class="tool-btn" :class="{ active: isSelected('reverseText') }"
                                @click="toggleFunction('reverseText')">全文倒序</button>
                            <button
class="tool-btn" :class="{ active: isSelected('reverseEachLine') }"
                                @click="toggleFunction('reverseEachLine')">逐行文本反转</button>
                        </div>
                    </div>

                    <div class="tool-group">
                        <div class="group-title">格式转换</div>
                        <div class="group-content">
                            <button
class="tool-btn" :class="{ active: isSelected('toUpperCase') }"
                                @click="toggleFunction('toUpperCase')">全大写</button>
                            <button
class="tool-btn" :class="{ active: isSelected('toLowerCase') }"
                                @click="toggleFunction('toLowerCase')">全小写</button>
                            <button
class="tool-btn" :class="{ active: isSelected('capitalizeLines') }"
                                @click="toggleFunction('capitalizeLines')">首字母大写</button>
                            <button
class="tool-btn" :class="{ active: isSelected('toHalfWidth') }"
                                @click="toggleFunction('toHalfWidth')">全角转半角</button>
                            <button
class="tool-btn" :class="{ active: isSelected('toFullWidth') }"
                                @click="toggleFunction('toFullWidth')">半角转全角</button>
                            <button
class="tool-btn" :class="{ active: isSelected('normalizePunctuation') }"
                                @click="toggleFunction('normalizePunctuation')">中英文标点规整</button>
                        </div>
                    </div>

                    <div class="tool-group">
                        <div class="group-title">排版</div>
                        <div class="group-content">
                            <button
class="tool-btn" :class="{ active: isSelected('addSequence') }"
                                @click="toggleFunction('addSequence')">添加行号 (1.)</button>
                            <button
class="tool-btn" :class="{ active: isSelected('addIndent') }"
                                @click="toggleFunction('addIndent')">添加缩进 (2格)</button>
                            <button
class="tool-btn" :class="{ active: isSelected('removeIndent') }"
                                @click="toggleFunction('removeIndent')">删除缩进</button>
                            <button
class="tool-btn" :class="{ active: isSelected('jsonOneLine') }"
                                @click="toggleFunction('jsonOneLine')">JSON 转单行</button>
                        </div>
                    </div>

                </section>

                
                <section class="panel output-panel">
                    <div class="panel-header">
                        <span class="panel-title">处理结果</span>
                        <div class="panel-actions">
                            <span v-if="outputText" class="stats-info">{{ outputText.length }} 字符 | {{ outputLines }}
                                行</span>
                            <button class="icon-btn" title="复制结果" @click="copyResult">
                                <el-icon>
                                    <CopyDocument />
                                </el-icon>
                            </button>
                        </div>
                    </div>
                    <div class="editor-wrapper">
                        <textarea
v-model="outputText" class="text-editor result-editor" readonly
                            placeholder="处理结果将显示在这里..."></textarea>
                    </div>
                </section>
            </div>

            
            <Transition name="toast">
                <div v-if="toast.show" class="toast">{{ toast.message }}</div>
            </Transition>
        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - 文本清理
        </footer>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Delete, CopyDocument, Check, Close } from '@element-plus/icons-vue'

const router = useRouter()
const inputText = ref('')
const outputText = ref('')
const toast = reactive({ show: false, message: '' })
const selectedFunctions = ref([])


function toggleFunction(type) {
    const index = selectedFunctions.value.indexOf(type)
    if (index === -1) {
        selectedFunctions.value.push(type)
    } else {
        selectedFunctions.value.splice(index, 1)
    }
}


function isSelected(type) {
    return selectedFunctions.value.includes(type)
}


function clearSelection() {
    selectedFunctions.value = []
}


function executeSelected() {
    if (!inputText.value) {
        showToast('请输入文本')
        return
    }
    if (selectedFunctions.value.length === 0) {
        showToast('请选择至少一个功能')
        return
    }

    let text = inputText.value

    
    for (const type of selectedFunctions.value) {
        text = processText(text, type)
    }

    outputText.value = text
    showToast(`已执行 ${selectedFunctions.value.length} 个功能`)
}

const inputLines = computed(() => inputText.value ? inputText.value.split('\n').length : 0)
const outputLines = computed(() => outputText.value ? outputText.value.split('\n').length : 0)


function processText(text, type) {
    let lines = text.split('\n')
    let result = text

    switch (type) {
        
        case 'removeEmptyLines':
            result = lines.filter(line => line.trim() !== '').join('\n')
            break
        case 'trimLines':
            result = lines.map(line => line.trim()).join('\n')
            break
        case 'removeAllSpaces':
            result = text.replace(/\s+/g, '')
            break
        case 'mergeSpaces':
            result = text.replace(/ +/g, ' ')
            break
        case 'removeDuplicates':
            result = [...new Set(lines)].join('\n')
            break

        
        case 'sortLinesAsc':
            result = [...lines].sort().join('\n')
            break
        case 'sortLinesDesc':
            result = [...lines].sort().reverse().join('\n')
            break
        case 'shuffleLines':
            result = [...lines].sort(() => Math.random() - 0.5).join('\n')
            break
        case 'reverseLines': 
            result = [...lines].reverse().join('\n')
            break
        case 'reverseText': 
            result = text.split('').reverse().join('')
            break
        case 'reverseEachLine': 
            result = lines.map(line => line.split('').reverse().join('')).join('\n')
            break

        
        case 'toUpperCase':
            result = text.toUpperCase()
            break
        case 'toLowerCase':
            result = text.toLowerCase()
            break
        case 'capitalizeLines':
            result = lines.map(line => line.charAt(0).toUpperCase() + line.slice(1)).join('\n')
            break
        case 'toHalfWidth':
            result = text.replace(/[\uff01-\uff5e]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).replace(/\u3000/g, ' ')
            break
        case 'toFullWidth':
            result = text.replace(/[!-~]/g, c => String.fromCharCode(c.charCodeAt(0) + 0xfee0)).replace(/ /g, '\u3000')
            break
        case 'normalizePunctuation':
            
            result = text
                .replace(/,/g, '，').replace(/\./g, '。').replace(/\?/g, '？').replace(/!/g, '！') 
                .replace(/，，+/g, '，').replace(/。。+/g, '。')
            break

        
        case 'addSequence':
            result = lines.map((line, i) => `${i + 1}. ${line}`).join('\n')
            break
        case 'addIndent':
            result = lines.map(line => `  ${line}`).join('\n')
            break
        case 'removeIndent':
            result = lines.map(line => line.replace(/^\s+/, '')).join('\n')
            break
        case 'jsonOneLine':
            try {
                result = JSON.stringify(JSON.parse(text))
            } catch (e) {
                showToast('无效的 JSON 格式')
            }
            break
    }

    return result
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

.text-cleaner {
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

.cleaner-layout {
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
    flex: 1.2;
}

.output-panel {
    flex: 1.2;
}

.tools-panel {
    flex: 0.8;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    overflow-y: auto;
    min-width: 260px;
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
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
    text-transform: uppercase;
}

.group-content {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 0.5rem;
}

.tool-btn {
    background: var(--card);
    border: 1px solid var(--border);
    padding: 0.6rem 0.5rem;
    border-radius: 6px;
    font-size: 0.85rem;
    color: var(--text);
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
}

.tool-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-light);
}

.tool-btn:active {
    transform: translateY(1px);
}


.tool-btn.active {
    border-color: var(--accent);
    color: white;
    background: var(--accent);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.tool-btn.active:hover {
    background: #2563eb;
    border-color: #2563eb;
    color: white;
}


.action-bar {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 8px;
    margin-bottom: 0.5rem;
    position: sticky;
    top: 0;
    z-index: 10;
}

.action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 0.6rem 1rem;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid var(--border);
}

.execute-btn {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
}

.execute-btn:hover:not(:disabled) {
    background: #2563eb;
    border-color: #2563eb;
}

.clear-btn {
    background: var(--card);
    color: var(--text-secondary);
}

.clear-btn:hover:not(:disabled) {
    background: #fee2e2;
    color: #dc2626;
    border-color: #fca5a5;
}

.action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}


@media (max-width: 1024px) {
    .cleaner-layout {
        flex-direction: column;
        height: auto;
    }

    .panel {
        height: 300px;
    }

    .tools-panel {
        max-height: none;
        overflow-y: visible;
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

    .stats-info {
        background: #374151;
        color: #d1d5db;
    }
}


.footer {
    text-align: center;
    padding: 3rem 0;
    color: var(--text-secondary, #64748b);
    font-size: 0.85rem;
}
</style>
