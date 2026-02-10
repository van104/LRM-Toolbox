<template>
  <div class="periodic-table-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>化学元素周期表</h1>
        <span class="nav-subtitle">Periodic Table of Elements</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="table-legend glass-card">
        <div
          v-for="(cat, name) in categories"
          :key="name"
          class="legend-item"
          @mouseenter="hoverCategory = name"
          @mouseleave="hoverCategory = null"
        >
          <span class="color-box" :style="{ background: cat.color }"></span>
          <span class="legend-name">{{ cat.label }}</span>
        </div>
      </div>

      <div class="table-container glass-card">
        <div class="periodic-grid">
          <div
            v-for="el in elements"
            :key="el.number"
            class="element-cell"
            :class="[el.category, { dimmed: hoverCategory && el.category !== hoverCategory }]"
            :style="getCellStyle(el)"
            @click="showDetail(el)"
          >
            <span class="el-num">{{ el.number }}</span>
            <span class="el-symbol">{{ el.symbol }}</span>
            <span class="el-name">{{ el.name }}</span>
            <span class="el-weight">{{ el.weight }}</span>
          </div>
        </div>
      </div>

      <el-dialog
        v-model="dialogVisible"
        :title="`${selectedElement?.name} (${selectedElement?.symbol})`"
        width="400px"
        center
      >
        <div v-if="selectedElement" class="el-detail">
          <div class="detail-hero" :class="selectedElement.category">
            <span class="big-symbol">{{ selectedElement.symbol }}</span>
            <span class="big-num">{{ selectedElement.number }}</span>
          </div>
          <div class="detail-info">
            <div class="info-row">
              <span>分类</span> <b>{{ categories[selectedElement.category].label }}</b>
            </div>
            <div class="info-row">
              <span>原子量</span> <b>{{ selectedElement.weight }}</b>
            </div>
            <div class="info-row">
              <span>电子排布</span> <b>{{ selectedElement.config }}</b>
            </div>
            <div class="info-row">
              <span>发现史</span>
              <p>{{ selectedElement.history || '暂无详细记载。' }}</p>
            </div>
          </div>
        </div>
      </el-dialog>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 交互式周期表</footer>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { Back } from '@element-plus/icons-vue';
  import { loadPeriodicElements } from '@/data/periodic_table';

  const dialogVisible = ref(false);
  const selectedElement = ref(null);
  const hoverCategory = ref(null);
  const elements = ref([]);

  const categories = {
    alkali: { label: '碱金属', color: '#ff8d8d' },
    alkaline: { label: '碱土金属', color: '#ffb98d' },
    transition: { label: '过渡金属', color: '#ffe48d' },
    'post-transition': { label: '贫金属', color: '#dfff8d' },
    metalloid: { label: '类金属', color: '#8dff8d' },
    nonmetal: { label: '非金属', color: '#8dffff' },
    noble: { label: '稀有气体', color: '#8db9ff' },
    lanthanide: { label: '镧系元素', color: '#b98dff' },
    actinide: { label: '锕系元素', color: '#ff8dff' }
  };

  const getCellStyle = el => ({
    gridRow: el.row,
    gridColumn: el.col
  });

  const showDetail = el => {
    selectedElement.value = el;
    dialogVisible.value = true;
  };

  onMounted(async () => {
    elements.value = await loadPeriodicElements();
  });
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap');

  .periodic-table-tool {
    --bg: #0f172a;
    --card: rgba(30, 41, 59, 0.7);
    --border: rgba(148, 163, 184, 0.1);
    --text: #f1f5f9;
    --text-2: #94a3b8;

    font-family: 'Outfit', sans-serif;
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
    background: #1e293b;
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
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .nav-center h1 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
  }

  .nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-2);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-top: 2px;
  }

  .main-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }

  .glass-card {
    background: var(--card);
    backdrop-filter: blur(12px);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .table-legend {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .color-box {
    width: 20px;
    height: 20px;
    border-radius: 4px;
  }

  .legend-name {
    font-size: 0.85rem;
    color: var(--text-2);
  }

  .table-container {
    overflow-x: auto;
    padding: 2rem;
  }

  .periodic-grid {
    display: grid;
    grid-template-columns: repeat(18, 1fr);
    grid-template-rows: repeat(7, 1fr);
    gap: 4px;
    min-width: 1000px;
  }

  .element-cell {
    aspect-ratio: 1;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .element-cell:hover {
    transform: scale(1.1);
    z-index: 10;
    border-color: #fff;
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
  }

  .element-cell.dimmed {
    opacity: 0.2;
  }

  .el-num {
    position: absolute;
    top: 2px;
    left: 4px;
    font-size: 0.7rem;
    font-weight: 800;
  }

  .el-symbol {
    font-size: 1.2rem;
    font-weight: 800;
    display: block;
  }

  .el-name {
    font-size: 0.7rem;
    font-weight: 600;
  }

  .el-weight {
    font-size: 0.5rem;
    opacity: 0.6;
  }

  .alkali {
    background: #ff4d4d22;
    border-color: #ff4d4d;
    color: #ff8d8d;
  }

  .alkaline {
    background: #ff9d4d22;
    border-color: #ff9d4d;
    color: #ffb98d;
  }

  .transition {
    background: #ffd74d22;
    border-color: #ffd74d;
    color: #ffe48d;
  }

  .post-transition {
    background: #c8ff4d22;
    border-color: #c8ff4d;
    color: #dfff8d;
  }

  .metalloid {
    background: #4dff4d22;
    border-color: #4dff4d;
    color: #8dff8d;
  }

  .nonmetal {
    background: #4dffff22;
    border-color: #4dffff;
    color: #8dffff;
  }

  .noble {
    background: #4d9dff22;
    border-color: #4d9dff;
    color: #8db9ff;
  }

  :deep(.el-dialog) {
    background: #1e293b;
    color: #fff;
    border-radius: 20px;
    border: 1px solid #334155;
  }

  :deep(.el-dialog__title) {
    color: #fff;
    font-weight: 800;
  }

  .el-detail {
    padding: 1rem 0;
  }

  .detail-hero {
    height: 120px;
    border-radius: 12px;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .big-symbol {
    font-size: 4rem;
    font-weight: 800;
  }

  .big-num {
    position: absolute;
    top: 10px;
    left: 15px;
    font-size: 1.25rem;
    font-weight: 800;
    opacity: 0.5;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
    border-bottom: 1px solid #334155;
    padding-bottom: 0.5rem;
  }

  .info-row span {
    color: var(--text-2);
    font-size: 0.9rem;
  }

  .info-row p {
    margin-top: 0.5rem;
    font-size: 0.85rem;
    line-height: 1.6;
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
