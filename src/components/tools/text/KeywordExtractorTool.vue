<template>
    <div class="keyword-tool">
        <nav class="nav-bar">
            <button class="nav-back" @click="$router.back()">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>标题关键词提取</h1>
                <span class="nav-subtitle">Keyword Extractor</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="tool-card glass-card">
                <div class="input-section">
                    <label>输入长文本/文章</label>
                    <textarea v-model="inputText" placeholder="粘贴文章内容，自动提取高频核心词..." rows="8"></textarea>
                </div>

                <div class="output-section">
                    <button class="extract-btn" @click="extract">开始提取</button>

                    <div v-if="keywords.length" class="result-area">
                        <label>提取结果 (Top {{ keywords.length }})</label>
                        <div class="tags-cloud">
                            <span v-for="(kw, i) in keywords" :key="i" class="tag">
                                {{ kw.word }} <small>({{ kw.count }})</small>
                            </span>
                        </div>
                    </div>
                </div>
            </div>


        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - 标题关键词提取
        </footer>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { Back, InfoFilled } from '@element-plus/icons-vue'

const inputText = ref('')
const keywords = ref([])

const stopWords = new Set([
    '的', '了', '和', '是', '在', '我', '有', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这', '那', '它', '我们', '你们', '他们', '如果你', '但是', '因为', '所以', '如果', '为了', '虽然', '而且', '或者', '还是', '以及', '即使', '既然', '只要', '然而', '因此', '通过', '随着', '对于', '关于', '能够', '可以', '需要', '觉得', '感觉', '可能', '其实', '比如', '例如', '一般', '通常', '特别', '非常', '比较', '目前', '正在', '已经', '开始', '所有', '一切', '部分', '些', '个', '次', '种', '号', '年', '月', '日', '天', '点', '分', '秒'
])

const extract = () => {
    if (!inputText.value) return

    let words = []

    
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
        const segmenter = new Intl.Segmenter('zh', { granularity: 'word' })
        const segments = segmenter.segment(inputText.value)
        for (const seg of segments) {
            if (seg.isWordLike) words.push(seg.segment)
        }
    } else {
        
        words = inputText.value.split(/[^\u4e00-\u9fa5a-zA-Z0-9]+/)
    }

    const counter = {}
    words.forEach(w => {
        if (w.length > 1 && !stopWords.has(w) && !/^\d+$/.test(w)) {
            counter[w] = (counter[w] || 0) + 1
        }
    })

    const sorted = Object.entries(counter)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([word, count]) => ({ word, count }))

    keywords.value = sorted
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

.keyword-tool {
    --bg: #faf9f7;
    --card: #ffffff;
    --border: #e8e6e3;
    --text: #1a1a1a;
    --text-2: #6b6b6b;
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
    font-size: 0.9rem;
}

.nav-center h1 {
    font-family: 'Noto Serif SC', serif;
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
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.input-section textarea {
    width: 100%;
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 12px;
    font-size: 1rem;
    outline: none;
    margin-top: 0.5rem;
    resize: vertical;
}

.input-section textarea:focus {
    border-color: var(--accent);
}

.extract-btn {
    width: 100%;
    padding: 0.8rem;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    margin-top: 1rem;
    transition: opacity 0.2s;
}

.extract-btn:hover {
    opacity: 0.9;
}

.result-area {
    margin-top: 2rem;
}

.tags-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
    margin-top: 0.8rem;
}

.tag {
    background: #ecfdf5;
    color: #065f46;
    padding: 0.4rem 0.8rem;
    border-radius: 100px;
    font-size: 0.95rem;
    border: 1px solid #a7f3d0;
}

.tag small {
    opacity: 0.7;
    font-size: 0.75rem;
    margin-left: 4px;
}



.footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-2);
    border-top: 1px solid var(--border);
    margin-top: 2rem;
    font-size: 0.85rem;
}
</style>
