<template>
    <div class="pinyin-tool">
        <nav class="nav-bar">
            <button class="nav-back" @click="$router.back()">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>拼音查询器</h1>
                <span class="nav-subtitle">Pinyin Converter</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="tool-layout glass-card">
                
                <section class="input-section">
                    <div class="section-header">
                        <label>输入汉字</label>
                        <button class="clear-btn" @click="inputText = ''">清空</button>
                    </div>
                    <textarea v-model="inputText" placeholder="请输入需要转换的汉字内容..." class="text-input"></textarea>
                </section>

                
                <section class="options-bar">
                    <div class="option-group">
                        <span class="opt-label">声调格式</span>
                        <div class="radio-group">
                            <label><input v-model="toneType" type="radio" value="symbol"> 符号 (ā)</label>
                            <label><input v-model="toneType" type="radio" value="num"> 数字 (a1)</label>
                            <label><input v-model="toneType" type="radio" value="none"> 无声调 (a)</label>
                        </div>
                    </div>

                    <div class="option-group">
                        <span class="opt-label">展示模式</span>
                        <div class="radio-group">
                            <label><input v-model="viewMode" type="radio" value="text"> 纯文本</label>
                            <label><input v-model="viewMode" type="radio" value="ruby"> 对照模式</label>
                        </div>
                    </div>
                </section>

                
                <section class="result-section">
                    <div class="section-header">
                        <label>转换结果</label>
                        <button class="copy-btn" @click="copyResult">复制结果</button>
                    </div>

                    
                    <div v-if="viewMode === 'text'" class="result-box">
                        <div class="result-text">{{ pinyinResult }}</div>
                    </div>

                    
                    <div v-else class="result-box ruby-box">
                        <div v-if="pinyinResultArray.length" class="ruby-content">
                            <template v-for="(item, idx) in pinyinResultArray" :key="idx">
                                <ruby v-if="item.isChinese">
                                    {{ item.char }}<rt>{{ item.py }}</rt>
                                </ruby>
                                <span v-else>{{ item.char }}</span>
                            </template>
                        </div>
                        <div v-else class="empty-hint">请输入文本查看对照结果</div>
                    </div>
                </section>
            </div>
        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - 拼音查询器
        </footer>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Back } from '@element-plus/icons-vue'
import { pinyin } from 'pinyin-pro'
import { ElMessage } from 'element-plus'
import useClipboard from 'vue-clipboard3'

const { toClipboard } = useClipboard()

const inputText = ref('')
const toneType = ref('symbol') 
const viewMode = ref('text') 


const pinyinResult = computed(() => {
    if (!inputText.value) return ''
    return pinyin(inputText.value, {
        toneType: toneType.value,
        type: 'string',
        nonZh: 'consecutive' 
    })
})


const pinyinResultArray = computed(() => {
    if (!inputText.value) return []
    
    
    
    
    const chars = Array.from(inputText.value)
    return chars.map(char => {
        
        if (/[\u4e00-\u9fa5]/.test(char)) {
            const py = pinyin(char, {
                toneType: toneType.value
            })
            return { char, py, isChinese: true }
        } else {
            return { char, isChinese: false }
        }
    })
})

const copyResult = async () => {
    if (!pinyinResult.value) {
        ElMessage.warning('没有可复制的内容')
        return
    }
    try {
        await toClipboard(pinyinResult.value)
        ElMessage.success('已复制拼音结果')
    } catch (e) {
        ElMessage.error('复制失败')
    }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

.pinyin-tool {
    --bg: #faf9f7;
    --card: #ffffff;
    --border: #e8e6e3;
    --text: #1a1a1a;
    --text-2: #6b6b6b;
    --accent: #059669;
    

    font-family: 'Noto Sans SC', sans-serif;
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
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

.nav-back,
.nav-spacer {
    width: 80px;
}

.nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: var(--text-2);
    cursor: pointer;
    font-size: 0.9rem;
    padding: 0.5rem 0;
}

.nav-center h1 {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.25rem;
    font-weight: 600;
}

.nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-2);
    text-transform: uppercase;
    display: block;
    text-align: center;
}

.main-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
}

.glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.tool-layout {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
}

.section-header label {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--text);
}

.clear-btn,
.copy-btn {
    font-size: 0.85rem;
    padding: 4px 12px;
    border: 1px solid var(--border);
    background: var(--bg);
    border-radius: 6px;
    cursor: pointer;
    color: var(--text-2);
    transition: all 0.2s;
}

.clear-btn:hover {
    color: #ef4444;
    border-color: #ef4444;
}

.copy-btn:hover {
    color: var(--accent);
    border-color: var(--accent);
}

.text-input {
    width: 100%;
    min-height: 120px;
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 1rem;
    line-height: 1.6;
    resize: vertical;
    outline: none;
    background: #fdfdfd;
}

.text-input:focus {
    border-color: var(--accent);
}

.options-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    padding: 1rem;
    background: #fdfdfd;
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 8px;
}

.option-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.opt-label {
    font-size: 0.8rem;
    color: var(--text-2);
}

.radio-group {
    display: flex;
    gap: 1rem;
    font-size: 0.9rem;
}

.radio-group label {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
}

.result-box {
    min-height: 120px;
    padding: 1rem;
    border: 1px dashed var(--border);
    border-radius: 8px;
    background: #fdfdfd;
    font-size: 1rem;
    line-height: 1.6;
    word-break: break-all;
    white-space: pre-wrap;
    color: var(--text);
}

.ruby-content {
    line-height: 2.2;
    
}

ruby {
    margin: 0 1px;
}

rt {
    color: var(--text-2);
    font-size: 0.75em;
    user-select: none;
    
}

.empty-hint {
    color: #ccc;
    text-align: center;
    margin-top: 2rem;
}

.footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-2);
    font-size: 0.85rem;
    border-top: 1px solid var(--border);
    margin-top: 2rem;
}
</style>
