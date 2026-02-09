<template>
    <div class="name-stroke-tool">
        <nav class="nav-bar">
            <button class="nav-back" @click="$router.back()">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>名字笔画计算</h1>
                <span class="nav-subtitle">Name Stroke Calculator</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="tool-card glass-card">
                <div class="input-section">
                    <input
v-model="nameInput" type="text" placeholder="请输入中文姓名" class="name-input" maxlength="10"
                        @input="calculate" />
                </div>

                <div v-if="results.length > 0" class="result-section">
                    <div class="chars-grid">
                        <div v-for="(char, index) in results" :key="index" class="char-card">
                            <div class="char-pinyin">{{ char.pinyin }}</div>
                            <div class="char-display">{{ char.char }}</div>
                            <div class="stroke-count">
                                <span class="num">{{ char.stroke }}</span> 画
                            </div>
                        </div>
                    </div>

                    <div class="total-summary">
                        <div class="summary-item">
                            <span class="label">总笔画数</span>
                            <span class="value">{{ totalStrokes }}</span>
                        </div>
                        <div class="summary-item">
                            <span class="label">字数</span>
                            <span class="value">{{ results.length }}</span>
                        </div>
                    </div>
                </div>

                <div v-else class="empty-state">
                    请输入姓名开始计算
                </div>
            </div>

            <div class="tips-card">
                <el-icon>
                    <InfoFilled />
                </el-icon>
                <div class="tip-content">
                    <p>说明：笔画计算基于通用规范汉字表。如有繁体字需求，请输入繁体字。</p>
                </div>
            </div>
        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - 名字笔画计算器
        </footer>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Back, InfoFilled } from '@element-plus/icons-vue'
import cnchar from 'cnchar'

const nameInput = ref('')
const results = ref([])

const totalStrokes = computed(() => {
    return results.value.reduce((acc, curr) => acc + curr.stroke, 0)
})

const calculate = () => {
    const text = nameInput.value.trim()
    if (!text) {
        results.value = []
        return
    }

    const chars = text.split('')
    results.value = chars.map(char => {
        
        if (/^[\u4e00-\u9fa5]+$/.test(char)) {
            return {
                char: char,
                stroke: cnchar.stroke(char),
                pinyin: cnchar.spell(char, 'tone') 
            }
        } else {
            return {
                char: char,
                stroke: 0,
                pinyin: ''
            }
        }
    })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

.name-stroke-tool {
    --bg: #faf9f7;
    --card: #ffffff;
    --border: #e8e6e3;
    --text: #1a1a1a;
    --text-2: #6b6b6b;
    --accent: #d946ef;
    

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
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.input-section {
    margin-bottom: 2rem;
    text-align: center;
}

.name-input {
    width: 100%;
    font-size: 2rem;
    text-align: center;
    padding: 1rem;
    border: 2px solid var(--border);
    border-radius: 12px;
    outline: none;
    font-family: 'Noto Serif SC', serif;
    transition: all 0.3s;
}

.name-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 4px rgba(217, 70, 239, 0.1);
}

.chars-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.char-card {
    background: #fdfdfd;
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1rem;
    width: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    transition: transform 0.2s;
}

.char-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.char-display {
    font-size: 2.5rem;
    font-family: 'Noto Serif SC', serif;
    font-weight: 600;
    color: var(--text);
    line-height: 1;
}

.char-pinyin {
    font-size: 0.9rem;
    color: var(--text-2);
    font-weight: 500;
}

.stroke-count {
    font-size: 0.9rem;
    color: var(--text-2);
}

.stroke-count .num {
    color: var(--accent);
    font-weight: 700;
    font-size: 1.1rem;
}

.total-summary {
    display: flex;
    justify-content: center;
    gap: 3rem;
    padding-top: 2rem;
    border-top: 1px dashed var(--border);
}

.summary-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.summary-item .label {
    font-size: 0.9rem;
    color: var(--text-2);
}

.summary-item .value {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text);
}

.empty-state {
    text-align: center;
    color: var(--text-2);
    padding: 2rem;
}

.tips-card {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: rgba(217, 70, 239, 0.05);
    color: #a21caf;
    border-radius: 8px;
    font-size: 0.85rem;
    line-height: 1.5;
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
