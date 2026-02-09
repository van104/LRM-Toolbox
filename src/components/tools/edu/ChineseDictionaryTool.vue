<template>
    <div class="chinese-dictionary-tool">
        <nav class="nav-bar">
            <button class="nav-back" @click="$router.back()">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>成语助手</h1>
                <span class="nav-subtitle">Idioms Assistant</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <el-tabs v-model="activeTab" class="custom-tabs">
                
                <el-tab-pane label="成语接龙" name="solitaire">
                    <div class="solitaire-area glass-card">
                        <div class="game-status">
                            <span class="score">连击: {{ combo }}</span>
                            <el-button type="warning" link @click="resetGame">重置游戏</el-button>
                        </div>

                        <div class="chain-display">
                            <div
v-for="(word, idx) in chain" :key="idx"
                                class="chain-node animate__animated animate__fadeInUp">
                                <span class="idiom-text">{{ word }}</span>
                                <el-icon v-if="idx < chain.length - 1" class="arrow">
                                    <Right />
                                </el-icon>
                            </div>
                            <div v-if="chain.length === 0" class="empty-chain">请输入成语开始挑战！</div>
                        </div>

                        <div class="input-area">
                            <el-input
v-model="userInput" placeholder="输入成语进行接龙..." size="large"
                                clearable @keyup.enter="handleIdiomSubmit">
                                <template #append>
                                    <el-button type="primary" @click="handleIdiomSubmit">提交</el-button>
                                </template>
                            </el-input>
                            <p class="hint">规则：下一个成语的首字需与上一个成语的尾字相同（同音亦可）。</p>
                        </div>
                    </div>
                </el-tab-pane>

                
                <el-tab-pane label="词义查询" name="lookup">
                    <div class="lookup-area glass-card">
                        <div class="search-box">
                            <el-input
v-model="query" placeholder="输入成语..." clearable
                                @keyup.enter="lookupWord" @clear="result = null">
                                <template #append>
                                    <el-button :icon="Search" @click="lookupWord" />
                                </template>
                            </el-input>
                        </div>

                        <div v-if="result" class="search-result animate__animated animate__fadeIn">
                            <div class="result-header">
                                <el-button :icon="Back" link @click="result = null; query = ''">返回推荐</el-button>
                            </div>
                            <h2 class="word-name">{{ result.name }} <small v-if="result.pinyin">[{{ result.pinyin
                                    }}]</small></h2>

                            <div class="result-section">
                                <h4>释义</h4>
                                <p>{{ result.meaning }}</p>
                            </div>

                            <div v-if="result.synonyms || result.antonyms" class="result-grid">
                                <div v-if="result.synonyms" class="grid-item">
                                    <h4>近义词</h4>
                                    <div class="tag-list">
                                        <el-tag v-for="w in result.synonyms" :key="w" class="mr-2">{{ w }}</el-tag>
                                    </div>
                                </div>
                                <div v-if="result.antonyms" class="grid-item">
                                    <h4>反义词</h4>
                                    <div class="tag-list">
                                        <el-tag v-for="w in result.antonyms" :key="w" type="danger" class="mr-2">{{ w
                                            }}</el-tag>
                                    </div>
                                </div>
                            </div>

                            <div v-if="result.example" class="result-section">
                                <h4>例句</h4>
                                <blockquote class="example-quote">{{ result.example }}</blockquote>
                            </div>
                        </div>

                        
                        <div v-else-if="!query" class="recommendations">
                            <div class="rec-header">
                                <span class="rec-title">每日推荐 · 随机学习</span>
                                <el-button type="primary" link @click="refreshRandomIdioms">
                                    <el-icon class="mr-1">
                                        <Refresh />
                                    </el-icon> 换一批
                                </el-button>
                            </div>
                            <div class="rec-grid">
                                <div
v-for="item in randomIdioms" :key="item.name" class="rec-card"
                                    @click="selectIdiom(item)">
                                    <span class="rec-name">{{ item.name }}</span>
                                    <span class="rec-pinyin">{{ item.pinyin }}</span>
                                </div>
                            </div>
                        </div>

                        <el-empty v-else description="词库中暂未收录该词条" />
                    </div>
                </el-tab-pane>
                <el-tab-pane label="全库浏览" name="browse">
                    <div class="browse-area glass-card">
                        <RecycleScroller
                            class="dictionary-scroller"
                            :items="dictionary"
                            :item-size="60"
                            key-field="name"
                        >
                            <template #default="{ item }">
                                <div class="dict-item" @click="selectIdiomAndSwitch(item)">
                                    <span class="dict-name">{{ item.name }}</span>
                                    <span class="dict-pinyin">{{ item.pinyin }}</span>
                                </div>
                            </template>
                        </RecycleScroller>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - 成语助手
        </footer>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Back, Search, Right, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { dictionary } from '@/data/dictionaryData'

const activeTab = ref('solitaire')


const chain = ref([])
const userInput = ref('')
const combo = ref(0)

const handleIdiomSubmit = () => {
    const val = userInput.value.trim()
    if (!val) return
    if (val.length < 4) {
        ElMessage.warning('请输入标准的四字成语')
        return
    }

    if (chain.value.length > 0) {
        const last = chain.value[chain.value.length - 1]
        const lastChar = last.slice(-1)
        const firstChar = val.charAt(0)

        
        if (lastChar !== firstChar) {
            ElMessage.error(`接龙失败！需以 "${lastChar}" 开头`)
            return
        }
    }

    if (chain.value.includes(val)) {
        ElMessage.warning('成语重复啦，换一个吧！')
        return
    }

    chain.value.push(val)
    combo.value++
    userInput.value = ''
    ElMessage.success('接龙成功！')
}

const resetGame = () => {
    chain.value = []
    combo.value = 0
}


const query = ref('')
const result = ref(null)

const lookupWord = () => {
    if (!query.value) {
        result.value = null
        return
    }
    const found = dictionary.find(d => d.name === query.value || d.name.includes(query.value))
    if (found) {
        result.value = found
    } else {
        ElMessage.info('词库中暂未收录该词条。')
        result.value = null
    }
}


const randomIdioms = ref([])

const refreshRandomIdioms = () => {
    
    const shuffled = [...dictionary].sort(() => 0.5 - Math.random())
    randomIdioms.value = shuffled.slice(0, 6)
}

const selectIdiom = (item) => {
    query.value = item.name
    result.value = item
}

const selectIdiomAndSwitch = (item) => {
    selectIdiom(item)
    activeTab.value = 'lookup'
}

onMounted(() => {
    refreshRandomIdioms()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@600&family=Noto+Sans+SC:wght@400;500;600&display=swap');

.chinese-dictionary-tool {
    --bg: #f5f7fa;
    --card: #ffffff;
    --border: #e4e7ed;
    --text: #303133;
    --text-2: #909399;
    --primary: #409eff;

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

.dictionary-scroller {
    height: 600px;
}

.dict-item {
    height: 60px;
    display: flex;
    align-items: center;
    padding: 0 1.5rem;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    transition: background 0.2s;
}

.dict-item:hover {
    background: #f0f9eb;
}

.dict-name {
    font-weight: bold;
    font-size: 1.1rem;
    margin-right: 1rem;
}

.dict-pinyin {
    color: var(--text-2);
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

.nav-center {
    flex: 1;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.nav-center h1 {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
    line-height: 1.2;
}

.nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-2);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.main-content {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
}

.glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}


.game-status {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.score {
    font-size: 1.1rem;
    font-weight: 700;
    color: #e6a23c;
}

.chain-display {
    min-height: 200px;
    background: #f8fafc;
    border-radius: 12px;
    padding: 2rem;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    margin-bottom: 2rem;
    border: 1px dashed var(--border);
}

.chain-node {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.idiom-text {
    background: #fff;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    font-weight: 500;
    border: 1px solid var(--border);
}

.empty-chain {
    color: var(--text-2);
    text-align: center;
    width: 100%;
    font-style: italic;
}

.input-area {
    max-width: 500px;
    margin: 0 auto;
}

.hint {
    font-size: 0.8rem;
    color: var(--text-2);
    margin-top: 1rem;
    text-align: center;
}


.search-box {
    margin-bottom: 2rem;
}

.word-name {
    font-family: 'Noto Serif SC', serif;
    font-size: 2.2rem;
    margin-bottom: 1.5rem;
    color: #1a1a1a;
}

.word-name small {
    font-size: 1rem;
    color: var(--text-2);
    font-family: sans-serif;
}

.result-header {
    margin-bottom: 1rem;
}

.result-section {
    margin-bottom: 2rem;
}

.result-section h4,
.grid-item h4 {
    font-size: 0.9rem;
    color: var(--text-2);
    margin-bottom: 0.75rem;
    text-transform: uppercase;
    border-left: 3px solid var(--primary);
    padding-left: 8px;
}

.result-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
}

.example-quote {
    font-style: italic;
    color: #444;
    border-left: 4px solid #eee;
    padding-left: 1rem;
    margin: 0;
}

.mr-2 {
    margin-right: 0.5rem;
}

.footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-2);
    font-size: 0.85rem;
    border-top: 1px solid var(--border);
    margin-top: 2rem;
}


.recommendations {
    margin-top: 1rem;
    animation: fadeIn 0.5s ease;
}

.rec-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding: 0 4px;
}

.rec-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text);
    border-left: 3px solid var(--primary);
    padding-left: 10px;
}

.rec-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1.25rem;
}

.rec-card {
    background: #f8fafc;
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.25rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.rec-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
    background: #fff;
    border-color: var(--primary);
}

.rec-name {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text);
}

.rec-pinyin {
    font-size: 0.85rem;
    color: var(--text-2);
}

.mr-1 {
    margin-right: 0.25rem;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 600px) {
    .rec-grid {
        grid-template-columns: 1fr;
    }
}
</style>
