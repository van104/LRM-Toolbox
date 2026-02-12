<template>
  <div class="pixel-art-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="goBack">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>像素画编辑器</h1>
        <span class="nav-subtitle">Pixel Art Editor</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="layout-grid">
        <div class="toolbar-section glass-card">
          <div class="tool-group">
            <label>画布大小</label>
            <select v-model="gridSize" @change="resetGrid">
              <option :value="8">8 x 8</option>
              <option :value="16">16 x 16</option>
              <option :value="32">32 x 32</option>
              <option :value="64">64 x 64</option>
            </select>
          </div>

          <div class="tool-group">
            <label>当前颜色</label>
            <div class="color-preview" :style="{ backgroundColor: activeColor }"></div>
            <input v-model="activeColor" type="color" class="color-picker-input" />
          </div>

          <div class="tool-group">
            <label>调色盘</label>
            <div class="palette-grid">
              <div
                v-for="c in palette"
                :key="c"
                class="palette-color"
                :class="{ active: activeColor === c }"
                :style="{ backgroundColor: c }"
                @click="activeColor = c"
              ></div>
            </div>
          </div>

          <div class="tool-group">
            <label>辅助功能</label>
            <div class="checkbox-row">
              <input id="show-grid" v-model="showGrid" type="checkbox" />
              <label for="show-grid">显示网格</label>
            </div>
          </div>

          <div class="actions">
            <el-button @click="resetGrid">清空预览</el-button>
            <el-button type="primary" @click="exportPNG">导出 PNG</el-button>
          </div>
        </div>

        <div class="canvas-section glass-card" @contextmenu.prevent>
          <div
            class="grid-container"
            :style="gridStyle"
            @mousedown="handleMouseDown"
            @mousemove="handleMouseMove"
            @mouseup="handleMouseUp"
            @mouseleave="handleMouseUp"
          >
            <div
              v-for="(cell, idx) in grid"
              :key="idx"
              class="grid-cell"
              :style="{
                backgroundColor: cell || 'transparent',
                border: showGrid ? '1px solid #eee' : 'none'
              }"
              @mousedown="paintCell(idx)"
              @mouseover="handleCellHover(idx)"
            ></div>
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 像素画编辑器</footer>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { Back } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';

  const router = useRouter();

  const gridSize = ref(16);
  const grid = ref([]);
  const activeColor = ref('#000000');
  const showGrid = ref(true);
  const isDrawing = ref(false);
  const palette = [
    '#000000',
    '#FFFFFF',
    '#FF0000',
    '#00FF00',
    '#0000FF',
    '#FFFF00',
    '#00FFFF',
    '#FF00FF',
    '#C0C0C0',
    '#808080',
    '#800000',
    '#808000',
    '#008000',
    '#800080',
    '#008080',
    '#000080',
    '#FFA500',
    '#A52A2A',
    '#DEB887',
    '#5F9EA0',
    '#7FFF00',
    '#D2691E',
    '#FF7F50',
    '#6495ED'
  ];

  const gridStyle = computed(() => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${gridSize.value}, 1fr)`,
    gridTemplateRows: `repeat(${gridSize.value}, 1fr)`,
    width: 'min(80vh, 600px)',
    aspectRatio: '1',
    backgroundColor: '#fff',
    boxShadow: '0 0 20px rgba(0,0,0,0.1)',
    cursor: 'crosshair',
    userSelect: 'none'
  }));

  const resetGrid = () => {
    grid.value = Array(gridSize.value * gridSize.value).fill('');
  };

  const paintCell = (idx, isEraser = false) => {
    grid.value[idx] = isEraser ? '' : activeColor.value;
  };

  const handleMouseDown = () => {
    isDrawing.value = true;
  };

  const handleMouseMove = () => {};

  const handleMouseUp = () => {
    isDrawing.value = false;
  };

  const handleCellHover = idx => {
    if (isDrawing.value) {
      paintCell(idx);
    }
  };

  const exportPNG = () => {
    const canvas = document.createElement('canvas');
    const size = gridSize.value;
    const scale = 32;
    canvas.width = size * scale;
    canvas.height = size * scale;
    const ctx = canvas.getContext('2d');

    grid.value.forEach((color, idx) => {
      if (color) {
        const x = (idx % size) * scale;
        const y = Math.floor(idx / size) * scale;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, scale, scale);
      }
    });

    const link = document.createElement('a');
    link.download = `pixel_art_${size}x${size}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    ElMessage.success('导出成功 (支持红色背景透明)');
  };

  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  onMounted(() => {
    resetGrid();
  });
</script>

<style scoped>
  .pixel-art-tool {
    --bg: #f5f7fa;
    --card: #ffffff;
    --border: #eef2f7;
    --primary: #409eff;
    min-height: 100vh;
    background: var(--bg);
  }

  .nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    height: 60px;
    background: var(--card);
    border-bottom: 1px solid var(--border);
  }

  .nav-back,
  .nav-spacer {
    width: 100px;
  }

  .nav-back {
    border: none;
    background: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    color: #666;
    font-size: 0.95rem;
  }

  .nav-center {
    flex: 1;
    text-align: center;
  }

  .nav-center h1 {
    font-size: 1.15rem;
    margin: 0;
    color: #1e293b;
    line-height: 1.2;
  }

  .nav-subtitle {
    font-size: 0.7rem;
    color: #94a3b8;
    text-transform: uppercase;
    display: block;
    text-align: center;
    margin-top: 1px;
  }

  .main-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }

  .layout-grid {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 2rem;
  }

  .glass-card {
    background: var(--card);
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid var(--border);
  }

  .tool-group {
    margin-bottom: 2rem;
  }

  .tool-group label {
    display: block;
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 0.8rem;
    font-weight: 500;
  }

  .tool-group select {
    width: 100%;
    padding: 0.6rem;
    border: 1px solid var(--border);
    border-radius: 8px;
  }

  .color-preview {
    width: 100%;
    height: 40px;
    border-radius: 8px;
    border: 1px solid var(--border);
    margin-bottom: 0.5rem;
  }

  .color-picker-input {
    width: 100%;
    height: 32px;
    border: none;
    padding: 0;
    cursor: pointer;
    background: transparent;
  }

  .palette-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 4px;
  }

  .palette-color {
    aspect-ratio: 1;
    border-radius: 4px;
    cursor: pointer;
    border: 1px solid rgba(0, 0, 0, 0.1);
    transition: transform 0.1s;
  }

  .palette-color:hover {
    transform: scale(1.1);
    z-index: 1;
  }

  .palette-color.active {
    box-shadow:
      0 0 0 2px #fff,
      0 0 0 4px var(--primary);
  }

  .checkbox-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 2rem;
  }

  .clear-btn {
    padding: 0.8rem;
    border: 1px solid var(--border);
    background: #fff;
    border-radius: 8px;
    cursor: pointer;
  }

  .export-btn {
    padding: 0.8rem;
    background: var(--primary);
    color: #fff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
  }

  .canvas-section {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 600px;
    overflow: hidden;
    position: relative;
  }

  .grid-container {
    background-image:
      linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
      linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
      linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
    background-size: 20px 20px;
    background-position:
      0 0,
      0 10px,
      10px -10px,
      -10px 0px;
  }

  .grid-cell {
    width: 100%;
    height: 100%;
    transition: background-color 0.05s;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #999;
    font-size: 0.8rem;
  }

  @media (max-width: 800px) {
    .layout-grid {
      grid-template-columns: 1fr;
    }

    .canvas-section {
      min-height: auto;
    }
  }
</style>
