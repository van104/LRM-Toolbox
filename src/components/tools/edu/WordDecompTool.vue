<template>
    <div class="word-decomp-tool">
        <nav class="nav-bar">
            <button class="nav-back" @click="$router.back()">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>拆字组词工具</h1>
                <span class="nav-subtitle">Chinese Word Decomposition</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="tool-card glass-card">
                <div class="input-section">
                    <label>输入单个汉字</label>
                    <div class="search-box">
                        <input v-model="inputText" maxlength="1" placeholder="请输入汉字，如：春" @input="searchWord" />
                    </div>
                </div>

                <div v-if="result" class="result-display animate-fade-in">
                    <div class="char-hero">
                        <div class="big-char">{{ inputText }}</div>
                        <div class="pinyin">{{ result.pinyin }}</div>
                    </div>

                    <div class="info-grid">
                        <div class="info-item">
                            <span class="label">偏旁部首</span>
                            <span class="value">{{ result.radical }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">文字结构</span>
                            <span class="value">{{ result.structure }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">笔画总数</span>
                            <span class="value">{{ result.strokes }}</span>
                        </div>
                    </div>

                    <div class="words-section">
                        <h3>常用组词</h3>
                        <div class="words-grid">
                            <span v-for="word in result.words" :key="word" class="word-card">{{ word }}</span>
                        </div>
                    </div>
                </div>

                <div v-else-if="inputText" class="empty-state">
                    正在查找或未收录此字...
                </div>
            </div>


        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - 拆字组词工具
        </footer>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Back, InfoFilled } from '@element-plus/icons-vue'

const inputText = ref('')
const result = ref(null)

const mockData = {
    '春': { pinyin: 'chūn', radical: '日', structure: '上下结构', strokes: 9, words: ['春天', '新春', '回春', '青春', '春色', '春晖'] },
    '花': { pinyin: 'huā', radical: '艹', structure: '上下结构', strokes: 7, words: ['花朵', '鲜花', '采花', '烟花', '红花', '开花'] },
    '学': { pinyin: 'xué', radical: '子', structure: '上下结构', strokes: 8, words: ['学习', '学校', '学生', '学术', '学者', '学问'] }
}

const searchWord = () => {
    if (!inputText.value) {
        result.value = null
        return
    }
    const char = inputText.value.trim()
    result.value = mockData[char] || {
        pinyin: '?', radical: '?', structure: '未知', strokes: '?', words: ['暂无相关词组']
    }
}
</script>

<style scoped>
.word-decomp-tool {
    --bg: #f8fafc;
    --card: #ffffff;
    --border: #e2e8f0;
    --text: #1e293b;
    --text-2: #64748b;
    --accent: #10b981;
    

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
}

.nav-center {
    text-align: center;
    flex: 1;
}

.nav-center h1 {
    font-size: 1.1rem;
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
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 2.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.input-section {
    margin-bottom: 2rem;
    text-align: center;
}

.input-section label {
    display: block;
    margin-bottom: 1rem;
    color: var(--text-2);
}

.search-box input {
    width: 200px;
    height: 120px;
    text-align: center;
    font-size: 4rem;
    border: 3px solid var(--border);
    border-radius: 24px;
    outline: none;
    transition: all 0.2s;
}

.search-box input::placeholder {
    font-size: 1.1rem;
}

.search-box input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.1);
}

.char-hero {
    text-align: center;
    margin-bottom: 2rem;
}

.big-char {
    font-size: 5rem;
    font-family: "KaiTi", "STKaiti", serif;
    color: var(--text);
    font-weight: bold;
}

.pinyin {
    font-size: 1.5rem;
    color: var(--accent);
    font-weight: 500;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 2.5rem;
}

.info-item {
    background: #f1f5f9;
    padding: 1.2rem;
    border-radius: 16px;
    text-align: center;
}

.info-item .label {
    display: block;
    font-size: 0.8rem;
    color: var(--text-2);
    margin-bottom: 0.4rem;
}

.info-item .value {
    font-size: 1.1rem;
    font-weight: 600;
}

.words-section h3 {
    font-size: 1rem;
    margin-bottom: 1.2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.words-section h3::before {
    content: '';
    width: 4px;
    height: 18px;
    background: var(--accent);
    border-radius: 2px;
}

.words-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.8rem;
}

.word-card {
    background: white;
    border: 1px solid var(--border);
    padding: 0.6rem 1rem;
    border-radius: 10px;
    text-align: center;
    transition: all 0.2s;
    cursor: default;
}

.word-card:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: #ecfdf5;
}



.footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-2);
    font-size: 0.85rem;
}

.animate-fade-in {
    animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        scale: 0.95;
    }

    to {
        opacity: 1;
        scale: 1;
    }
}
</style>
