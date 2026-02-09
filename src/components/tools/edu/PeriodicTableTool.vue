<template>
    <div class="periodic-table-tool">
        <nav class="nav-bar">
            <button @click="$router.back()" class="nav-back">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>化学元素周期表</h1>
                <span class="nav-subtitle">Interactive Periodic Table</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">

            <div class="controls-section glass-card">
                <div class="table-legend">
                    <div v-for="(cat, name) in categories" :key="name" class="legend-item"
                        :class="{ 'legend-active': hoverCategory === name }" @mouseenter="hoverCategory = name"
                        @mouseleave="hoverCategory = null">
                        <span class="color-box"
                            :style="{ background: cat.color, boxShadow: `0 0 10px ${cat.color}44` }"></span>
                        <span class="legend-name">{{ cat.label }}</span>
                    </div>
                </div>
            </div>


            <div class="table-container glass-card">
                <div class="periodic-grid">
                    <div v-for="el in elements" :key="el.number" class="element-cell"
                        :class="[el.category, { 'dimmed': hoverCategory && el.category !== hoverCategory }]"
                        :style="getCellStyle(el)" @click="showDetail(el)">
                        <div class="cell-inner">
                            <span class="el-num">{{ el.number }}</span>
                            <span class="el-symbol">{{ el.symbol }}</span>
                            <span class="el-name">{{ el.name }}</span>
                            <span class="el-weight">{{ el.weight }}</span>
                        </div>
                        <div class="cell-glow" :style="{ background: categories[el.category]?.color }"></div>
                    </div>
                </div>
            </div>


            <el-dialog v-model="dialogVisible" :title="`元素详情: ${selectedElement?.name}`" width="460px" center
                class="element-dialog" destroy-on-close>
                <div class="el-detail" v-if="selectedElement">
                    <div class="detail-hero" :class="selectedElement.category"
                        :style="{ background: `linear-gradient(135deg, ${categories[selectedElement.category].color}22, ${categories[selectedElement.category].color}44)` }">
                        <div class="hero-symbol-wrap">
                            <span class="big-symbol">{{ selectedElement.symbol }}</span>
                            <span class="big-num">{{ selectedElement.number }}</span>
                        </div>
                        <div class="hero-bg-text">{{ selectedElement.symbol }}</div>
                    </div>

                    <div class="detail-info-grid">
                        <div class="info-item">
                            <label>分类</label>
                            <span class="info-val" :style="{ color: categories[selectedElement.category].color }">
                                {{ categories[selectedElement.category].label }}
                            </span>
                        </div>
                        <div class="info-item">
                            <label>原子量</label>
                            <span class="info-val">{{ selectedElement.weight }}</span>
                        </div>
                        <div class="info-item full">
                            <label>电子排布</label>
                            <span class="info-val mono">{{ selectedElement.config }}</span>
                        </div>
                        <div class="info-item full history">
                            <label>发现与应用</label>
                            <p>{{ selectedElement.history || '该元素的发现历史极具传奇色彩，在现代工业与科研中有着举足轻重的地位。' }}</p>
                        </div>
                    </div>
                </div>
            </el-dialog>
        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - 探索微观世界的奥秘
        </footer>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { Back } from '@element-plus/icons-vue'
import { elements } from '@/data/periodicTableData'

const dialogVisible = ref(false)
const selectedElement = ref(null)
const hoverCategory = ref(null)

const categories = {
    'alkali': { label: '碱金属', color: '#ef4444' },
    'alkaline': { label: '碱土金属', color: '#f97316' },
    'transition': { label: '过渡金属', color: '#f59e0b' },
    'post-transition': { label: '贫金属', color: '#10b981' },
    'metalloid': { label: '类金属', color: '#06b6d4' },
    'nonmetal': { label: '非金属', color: '#3b82f6' },
    'noble': { label: '稀有气体', color: '#8b5cf6' },
    'lanthanide': { label: '镧系元素', color: '#d946ef' },
    'actinide': { label: '锕系元素', color: '#ec4899' }
}

const getCellStyle = (el) => ({
    gridRow: el.row,
    gridColumn: el.col,
    borderColor: `${categories[el.category]?.color}66`
})

const showDetail = (el) => {
    selectedElement.value = el
    dialogVisible.value = true
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=JetBrains+Mono&display=swap');

.periodic-table-tool {
    --bg: #020617;
    --card: rgba(15, 23, 42, 0.6);
    --border: rgba(255, 255, 255, 0.08);
    --text: #f8fafc;
    --text-2: #94a3b8;

    font-family: 'Outfit', sans-serif;
    min-height: 100vh;
    background: var(--bg);
    background-image:
        radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.05) 1px, transparent 0);
    background-size: 40px 40px;
    color: var(--text);
}

.nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 2rem;
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
}

.nav-back,
.nav-spacer {
    width: 100px;
}

.nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid var(--border);
    color: var(--text-2);
    cursor: pointer;
    font-size: 0.85rem;
    padding: 0.6rem 1.2rem;
    border-radius: 50px;
    transition: all 0.3s;
}

.nav-back:hover {
    color: #fff;
    border-color: rgba(255, 255, 255, 0.3);
    background: rgba(30, 41, 59, 0.8);
}

.nav-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.nav-center h1 {
    font-size: 1.5rem;
    font-weight: 800;
    margin: 0;
    letter-spacing: 1px;
}

.nav-subtitle {
    font-size: 0.75rem;
    color: var(--text-2);
    text-transform: uppercase;
    letter-spacing: 0.2em;
    margin-top: 4px;
}

.main-content {
    max-width: 1500px;
    margin: 0 auto;
    padding: 2.5rem 1.5rem;
}

.glass-card {
    background: var(--card);
    backdrop-filter: blur(16px);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
}

.table-legend {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
    justify-content: center;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    transition: all 0.3s;
    padding: 0.5rem 1rem;
    border-radius: 12px;
    border: 1px solid transparent;
}

.legend-item:hover,
.legend-active {
    background: rgba(255, 255, 255, 0.05);
    border-color: var(--border);
    transform: translateY(-2px);
}

.color-box {
    width: 18px;
    height: 18px;
    border-radius: 5px;
}

.legend-name {
    font-size: 0.9rem;
    color: var(--text-2);
    font-weight: 500;
}

.table-container {
    overflow-x: auto;
    padding: 2.5rem;
    background: rgba(15, 23, 42, 0.4);
}

.periodic-grid {
    display: grid;
    grid-template-columns: repeat(18, 1fr);
    grid-template-rows: repeat(7, 1fr);
    gap: 8px;
    min-width: 1100px;
}

.element-cell {
    aspect-ratio: 0.9;
    border-radius: 12px;
    position: relative;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    border: 1px solid transparent;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.02);
}

.cell-inner {
    position: relative;
    z-index: 2;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4px;
}

.cell-glow {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.05;
    transition: opacity 0.3s;
}

.element-cell:hover {
    transform: scale(1.15) translateY(-5px);
    z-index: 10;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    background: rgba(255, 255, 255, 0.08);
}

.element-cell:hover .cell-glow {
    opacity: 0.2;
}

.element-cell.dimmed {
    opacity: 0.15;
    filter: grayscale(0.8);
}

.el-num {
    position: absolute;
    top: 6px;
    left: 8px;
    font-size: 0.75rem;
    font-weight: 800;
    opacity: 0.6;
}

.el-symbol {
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: -1px;
}

.el-name {
    font-size: 0.75rem;
    font-weight: 600;
    margin-top: 2px;
}

.el-weight {
    font-size: 0.6rem;
    opacity: 0.4;
    margin-top: 2px;
}

:deep(.element-dialog) {
    background: #0f172a;
    border-radius: 28px;
    border: 1px solid var(--border);
}

:deep(.el-dialog__title) {
    color: #fff;
    font-weight: 800;
}

.el-detail {
    padding: 1rem 0;
}

.detail-hero {
    height: 160px;
    border-radius: 20px;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

.hero-symbol-wrap {
    position: relative;
    z-index: 2;
    text-align: center;
}

.big-symbol {
    font-size: 5rem;
    font-weight: 800;
    filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.2));
}

.big-num {
    position: absolute;
    top: -10px;
    left: -20px;
    font-size: 1.6rem;
    font-weight: 800;
    opacity: 0.3;
}

.hero-bg-text {
    position: absolute;
    font-size: 12rem;
    font-weight: 900;
    opacity: 0.03;
    bottom: -40px;
    right: -20px;
}

.detail-info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 16px;
    border: 1px solid var(--border);
}

.info-item.full {
    grid-column: span 2;
}

.info-item label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-2);
    text-transform: uppercase;
}

.info-val {
    font-size: 1.1rem;
    font-weight: 700;
}

.info-val.mono {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.95rem;
}

.history p {
    font-size: 0.9rem;
    line-height: 1.7;
    color: var(--text-2);
    margin: 0;
}

.footer {
    text-align: center;
    padding: 4rem;
    color: var(--text-2);
    font-size: 0.85rem;
    letter-spacing: 2px;
}

@media (max-width: 600px) {
    .table-container {
        padding: 1rem;
    }
}
</style>
