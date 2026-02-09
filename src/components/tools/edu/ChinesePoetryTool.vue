<template>
    <div class="chinese-poetry-tool">
        <nav class="nav-bar">
            <button class="nav-back" @click="$router.back()">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>诗词检索与赏析</h1>
                <span class="nav-subtitle">Chinese Poetry & Appreciation</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <header class="search-section glass-card">
                <div class="search-bar">
                    <el-input v-model="searchQuery" placeholder="搜索题目、作者、诗句..." clearable @keyup.enter="handleSearch">
                        <template #prefix>
                            <el-icon>
                                <Search />
                            </el-icon>
                        </template>
                        <template #append>
                            <el-button @click="handleSearch">搜索</el-button>
                        </template>
                    </el-input>
                </div>
                <div class="filter-tags">
                    <el-tag
v-for="tag in filterTags" :key="tag" :type="currentTag === tag ? 'primary' : 'info'"
                        class="clickable-tag" @click="setTag(tag)">
                        {{ tag }}
                    </el-tag>
                </div>
            </header>

            <div class="content-layout">
                
                <section class="poetry-list">
                    <DynamicScroller
                        :items="filteredPoems"
                        :min-item-size="120"
                        key-field="id"
                        class="scroller"
                    >
                        <template #default="{ item, index, active }">
                            <DynamicScrollerItem
                                :item="item"
                                :active="active"
                                :size-dependencies="[item.content]"
                                :data-index="index"
                            >
                                <div
                                    class="poem-item glass-card"
                                    :class="{ active: selectedPoem?.id === item.id }"
                                    style="margin-bottom: 1rem;"
                                    @click="selectPoem(item)"
                                >
                                    <h3 class="poem-title">{{ item.title }}</h3>
                                    <div class="poem-meta">
                                        <span class="dynasty">[{{ item.dynasty }}]</span>
                                        <span class="author">{{ item.author }}</span>
                                    </div>
                                    <p class="poem-snippet">{{ item.content[0] }}...</p>
                                </div>
                            </DynamicScrollerItem>
                        </template>
                    </DynamicScroller>
                </section>

                
                <section v-if="selectedPoem" class="poetry-detail glass-card">
                    <div class="detail-header">
                        <h2>{{ selectedPoem.title }}</h2>
                        <div class="detail-meta">
                            <span>{{ selectedPoem.dynasty }} · {{ selectedPoem.author }}</span>
                        </div>
                    </div>

                    <div class="poem-full-content" :class="{ 'vertical-text': isVertical }">
                        <p v-for="(line, idx) in selectedPoem.content" :key="idx">{{ line }}</p>
                    </div>

                    <el-divider>赏析与名句</el-divider>

                    <div class="appreciation-box">
                        <p>{{ selectedPoem.appreciation || '暂无详细赏析。' }}</p>
                    </div>

                    <div class="action-footer">
                        <el-button type="primary" plain @click="isVertical = !isVertical">切换布局</el-button>
                        <el-button type="success" @click="generateCard">生成名句卡片</el-button>
                    </div>
                </section>
                <div v-else class="empty-detail glass-card">
                    <el-empty description="选择一首诗词开始赏析" />
                </div>
            </div>
        </main>

        
        <el-dialog v-model="showCard" title="名句卡片生成器" width="800px" center class="card-dialog">
            <div class="card-generator-layout">
                
                <div class="selection-side">
                    <h4>选择名句 (可多选)</h4>
                    <el-scrollbar max-height="400px">
                        <div class="line-selector">
                            <el-checkbox-group v-model="cardForm.selectedLines">
                                <el-checkbox
v-for="(line, idx) in selectedPoem?.content" :key="idx" :label="line"
                                    class="line-checkbox">
                                    {{ line }}
                                </el-checkbox>
                            </el-checkbox-group>
                        </div>
                    </el-scrollbar>

                    <el-divider>卡片装饰</el-divider>
                    <div class="decoration-selector">
                        <el-checkbox v-model="cardForm.showWatermark">显示水印页脚</el-checkbox>
                        <el-checkbox v-model="cardForm.showSeal">显示艺术印章</el-checkbox>
                    </div>
                </div>

                
                <div class="preview-side">
                    <div class="card-outer-wrap">
                        <div id="poetry-card" class="poem-card-preview" :style="{ background: cardBg }">
                            <div class="card-inner">
                                <div class="card-body">
                                    <div
class="card-quote"
                                        :class="{ 'long-text': cardForm.selectedLines.join('').length > 15 }">
                                        <div v-for="(l, i) in cardForm.selectedLines" :key="i" class="quote-line-group">
                                            <div
v-for="(segment, si) in formatLineSegments(l)" :key="si"
                                                class="quote-segment">
                                                {{ segment }}
                                            </div>
                                        </div>
                                        <div v-if="cardForm.selectedLines.length === 0" class="placeholder-text">
                                            请在左侧选择诗句</div>
                                    </div>
                                    <div class="card-info">
                                        <div class="card-title">《{{ selectedPoem?.title }}》</div>
                                        <div class="card-author">{{ selectedPoem?.dynasty }} · {{ selectedPoem?.author
                                        }}</div>
                                    </div>
                                </div>
                                <div v-if="cardForm.showWatermark || cardForm.showSeal" class="card-footer">
                                    <div v-if="cardForm.showWatermark" class="footer-left">LRM工具箱 · 诗词赏析</div>
                                    <div v-if="cardForm.showSeal" class="footer-seal">赏析</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <template #footer>
                <div class="card-styles">
                    <span
v-for="c in bgOptions" :key="c" :style="{ background: c }" class="color-dot"
                        :class="{ active: cardBg === c }" @click="cardBg = c"></span>
                </div>
                <div class="dialog-footer-btns">
                    <el-button type="primary" size="large" @click="downloadCard">下载卡片</el-button>
                </div>
            </template>
        </el-dialog>

        <footer class="footer">
            © 2026 LRM工具箱 - 诗词检索赏析
        </footer>
    </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { Back, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { poems } from '@/data/poetryData' 

const searchQuery = ref('')
const currentTag = ref('全部')
const selectedPoem = ref(null)
const isVertical = ref(false)
const showCard = ref(false)
const cardBg = ref('linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)')

const cardForm = reactive({
    selectedLines: [],
    showWatermark: true,
    showSeal: true
})

const filterTags = ['全部', '唐诗', '宋词', '元曲', '送别', '思乡', '爱国', '咏物'] 

const filteredPoems = computed(() => {
    return poems.filter(p => {
        const matchesSearch = p.title.includes(searchQuery.value) || p.author.includes(searchQuery.value) || p.content.some(l => l.includes(searchQuery.value))
        const matchesTag = currentTag.value === '全部' || p.tags.includes(currentTag.value)
        return matchesSearch && matchesTag
    })
})

const selectPoem = (poem) => {
    selectedPoem.value = poem
}

const handleSearch = () => {
    if (filteredPoems.value.length === 1) {
        selectedPoem.value = filteredPoems.value[0]
    }
}

const setTag = (tag) => {
    currentTag.value = tag
}

const generateCard = () => {
    
    cardForm.selectedLines = [selectedPoem.value.content[0]]
    showCard.value = true
}

const bgOptions = [
    'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)',
    'linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)',
    'linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%)',
    '#ffffff',
    '#f5f5f5'
]

const downloadCard = () => {
    ElMessage.success('已模拟生成下载任务（在实际环境中可使用 html2canvas）')
    showCard.value = false
}


const formatLineSegments = (line) => {
    if (!line) return []
    
    const segments = line.replace(/([，。？！；、])/g, '$1\n').split('\n').filter(s => s.trim())
    if (segments.length === 0) return [line]

    
    segments[0] = '“' + segments[0]
    segments[segments.length - 1] = segments[segments.length - 1] + '”'
    return segments
}


selectedPoem.value = poems[0]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

.chinese-poetry-tool {
    --bg: #fdfaf7;
    --card: #ffffff;
    --border: #e8e4e0;
    --text: #2c2c2c;
    --text-2: #6d6d6d;
    --primary: #8b5e3c;
    

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

.nav-center {
    text-align: center;
}

.nav-center h1 {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
}

.nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-2);
    text-transform: uppercase;
}


.main-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
}

.search-section {
    margin-bottom: 2rem;
    padding: 1.5rem;
}

.search-bar {
    max-width: 600px;
    margin: 0 auto 1rem;
}

.filter-tags {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    flex-wrap: wrap;
}

.clickable-tag {
    cursor: pointer;
    transition: all 0.2s;
}

.clickable-tag:hover {
    transform: scale(1.05);
}

.content-layout {
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: 2rem;
}


.poetry-list {
    display: flex;
    flex-direction: column;
    height: 700px; /* Changed from max-height to fixed height for scroller */
    padding-right: 0.5rem;
}

.scroller {
    height: 100%;
}

.poem-item {
    padding: 1.25rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.poem-item:hover {
    transform: translateX(5px);
    border-color: var(--primary);
}

.poem-item.active {
    border-left: 5px solid var(--primary);
    background: #fdf8f5;
}

.poem-title {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    font-family: 'Noto Serif SC', serif;
}

.poem-meta {
    font-size: 0.85rem;
    color: var(--text-2);
    margin-bottom: 0.75rem;
}

.poem-snippet {
    font-size: 0.9rem;
    color: var(--text-2);
    font-style: italic;
}


.poetry-detail {
    padding: 3rem;
    position: sticky;
    top: 120px;
    text-align: center;
}

.detail-header h2 {
    font-family: 'Noto Serif SC', serif;
    font-size: 2rem;
    margin-bottom: 1rem;
}

.detail-meta {
    color: var(--text-2);
    margin-bottom: 2.5rem;
}

.poem-full-content {
    font-size: 1.25rem;
    line-height: 2;
    margin-bottom: 3rem;
    font-family: 'Noto Serif SC', serif;
    transition: all 0.3s;
}


.vertical-text {
    writing-mode: vertical-rl;
    text-orientation: upright;
    margin: 0 auto 3rem;
    display: inline-block;
    text-align: left;
}

.vertical-text p {
    text-indent: 1em;
    letter-spacing: 0.2em;
}

.appreciation-box {
    text-align: left;
    background: #faf8f5;
    padding: 1.5rem;
    border-radius: 12px;
    font-size: 0.95rem;
    line-height: 1.7;
    color: #4a4a4a;
}

.action-footer {
    margin-top: 2rem;
    display: flex;
    gap: 1rem;
    justify-content: center;
}


.card-generator-layout {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 2rem;
    align-items: start;
}

.selection-side {
    padding: 1rem;
    background: #fcfcfc;
    border-radius: 8px;
    border: 1px solid #eee;
}

.selection-side h4 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    color: #666;
}

.line-selector {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.line-checkbox {
    margin-bottom: 0.5rem;
    display: block;
    white-space: normal;
    height: auto;
    padding: 8px 0;
    line-height: 1.4;
}

.decoration-selector {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}


.card-outer-wrap {
    padding: 1.5rem;
    background: #f0f2f5;
    border-radius: 12px;
    display: flex;
    justify-content: center;
}

.poem-card-preview {
    width: 360px;
    height: 460px;
    border-radius: 12px;
    padding: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.card-inner {
    background: #ffffff;
    width: 100%;
    height: 100%;
    border-radius: 6px;
    padding: 2.2rem 1.8rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05);
    position: relative;
    overflow: hidden;
}

.card-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.card-quote {
    font-size: 1.6rem;
    font-family: 'Noto Serif SC', serif;
    line-height: 1.6;
    color: #1a1a1a;
    font-weight: 600;
    text-align: center;
    margin-bottom: 2.5rem;
    transition: all 0.3s;
    width: 100%;
}

.quote-line-group {
    margin-bottom: 1.5rem;
}

.quote-segment {
    margin-bottom: 0.5rem;
    word-break: keep-all;
    white-space: nowrap;
}

.card-quote.long-text {
    font-size: 1.3rem;
    line-height: 1.4;
}

.card-quote.long-text .quote-segment {
    margin-bottom: 0.3rem;
}

.placeholder-text {
    color: #ccc;
    font-size: 1rem;
    font-style: italic;
}

.card-info {
    text-align: right;
    margin-top: 0;
}

.card-title {
    font-weight: 700;
    font-size: 0.9rem;
    color: #333;
    margin-bottom: 0.4rem;
}

.card-author {
    font-size: 0.75rem;
    color: #666;
}

.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    border-top: 1px solid #f0f0f0;
    padding-top: 0.8rem;
}

.footer-left {
    font-size: 0.65rem;
    color: #bbb;
}

.footer-seal {
    width: 28px;
    height: 28px;
    border: 1.5px solid #d32f2f;
    color: #d32f2f;
    font-size: 0.6rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    border-radius: 4px;
    transform: rotate(-15deg);
    opacity: 0.8;
}

.card-styles {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 1.5rem;
}

.color-dot {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.color-dot:hover {
    transform: scale(1.1);
}

.color-dot.active {
    border-color: #409eff;
    transform: scale(1.1);
}

.dialog-footer-btns {
    display: flex;
    justify-content: center;
}

.dialog-footer-btns .el-button {
    padding-left: 3rem;
    padding-right: 3rem;
}

.footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-2);
    font-size: 0.85rem;
    border-top: 1px solid var(--border);
    margin-top: 2rem;
}

@media (max-width: 900px) {
    .content-layout {
        grid-template-columns: 1fr;
    }

    .poetry-detail {
        position: static;
        padding: 1.5rem;
    }
}
</style>
