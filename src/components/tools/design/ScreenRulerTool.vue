<template>
  <div class="screen-ruler-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>屏幕尺寸测量器</h1>
        <span class="nav-subtitle">Screen Pixel Ruler</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div ref="workspaceRef" class="ruler-workspace">
        <div class="control-panel glass-card">
          <div class="panel-row">
            <span class="info">当前视口: {{ vpWidth }} x {{ vpHeight }} px</span>
            <div class="actions">
              <button class="action-btn" @click="addRuler('h')">
                <el-icon>
                  <DCaret />
                </el-icon>
                添加水平标尺
              </button>
              <button class="action-btn" @click="addRuler('v')">
                <el-icon class="rotate-90">
                  <DCaret />
                </el-icon>
                添加垂直标尺
              </button>
              <button class="action-btn danger" @click="clearRulers">清空</button>
            </div>
          </div>
          <div class="tips">拖动标尺测量，双击标尺旋转</div>
        </div>

        <div class="rulers-container">
          <div
            v-for="ruler in rulers"
            :key="ruler.id"
            class="ruler"
            :class="[ruler.type, { dragging: ruler.isDragging }]"
            :style="getRulerStyle(ruler)"
            @mousedown.stop="startDrag($event, ruler)"
            @dblclick.stop="fileRuler(ruler)"
          >
            <div class="ruler-line"></div>
            <div class="ruler-label">
              {{ ruler.pos }}px
              <span class="del-btn" @mousedown.stop="removeRuler(ruler.id)">×</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 屏幕尺寸测量器</footer>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { Back, DCaret } from '@element-plus/icons-vue';

  const vpWidth = ref(0);
  const vpHeight = ref(0);
  const rulers = ref([]);
  const workspaceRef = ref(null);

  let nextId = 1;
  let draggedRuler = null;

  const updateViewport = () => {
    vpWidth.value = window.innerWidth;
    vpHeight.value = window.innerHeight;
  };

  onMounted(() => {
    updateViewport();
    window.addEventListener('resize', updateViewport);
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', endDrag);

    addRuler('h', 200);
    addRuler('v', 200);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateViewport);
    window.removeEventListener('mousemove', onDrag);
    window.removeEventListener('mouseup', endDrag);
  });

  const addRuler = (type, pos = null) => {
    const center = type === 'h' ? window.innerHeight / 2 : window.innerWidth / 2;
    rulers.value.push({
      id: nextId++,
      type: type,
      pos: Math.round(pos !== null ? pos : center),
      isDragging: false
    });
  };

  const removeRuler = id => {
    rulers.value = rulers.value.filter(r => r.id !== id);
  };

  const clearRulers = () => {
    rulers.value = [];
  };

  const fileRuler = ruler => {
    ruler.type = ruler.type === 'h' ? 'v' : 'h';
  };

  const getRulerStyle = ruler => {
    if (ruler.type === 'h') {
      return { top: `${ruler.pos}px`, left: 0, right: 0, height: '1px' };
    } else {
      return { left: `${ruler.pos}px`, top: 0, bottom: 0, width: '1px' };
    }
  };

  const startDrag = (e, ruler) => {
    e.preventDefault();
    draggedRuler = ruler;
    ruler.isDragging = true;
  };

  const onDrag = e => {
    if (!draggedRuler) return;
    e.preventDefault();

    if (draggedRuler.type === 'h') {
      draggedRuler.pos = e.clientY;
    } else {
      draggedRuler.pos = e.clientX;
    }
  };

  const endDrag = () => {
    if (draggedRuler) {
      draggedRuler.isDragging = false;
      draggedRuler = null;
    }
  };
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

  .screen-ruler-tool {
    --bg: #faf9f7;
    --card: #ffffff;
    --border: #e8e6e3;
    --text: #1a1a1a;
    --text-2: #6b6b6b;
    --accent: #ef4444;

    font-family: 'Noto Sans SC', sans-serif;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg);
    color: var(--text);
    overflow: hidden;
  }

  .nav-bar {
    position: relative;
    z-index: 200;

    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background: var(--card);
    border-bottom: 1px solid var(--border);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
    flex: 1;
    position: relative;
    overflow: hidden;

    cursor: crosshair;
  }

  .ruler-workspace {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .control-panel {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    min-width: 300px;
  }

  .panel-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }

  .info {
    font-size: 0.85rem;
    font-family: monospace;
    color: var(--text-2);
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }

  .action-btn {
    padding: 4px 8px;
    border: 1px solid var(--border);
    background: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .action-btn:hover {
    background: #f9f9f9;
  }

  .action-btn.danger {
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.3);
  }

  .tips {
    font-size: 0.75rem;
    color: var(--text-2);
    text-align: center;
  }

  .ruler {
    position: absolute;
    background-color: var(--accent);

    pointer-events: auto;
  }

  .ruler.h {
    height: 1px;
    cursor: ns-resize;
    border-top: 1px solid var(--accent);

    padding: 4px 0;

    background: transparent;

    margin-top: -4px;
  }

  .ruler.h .ruler-line {
    position: absolute;
    top: 4px;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--accent);
  }

  .ruler.v {
    width: 1px;
    cursor: ew-resize;
    padding: 0 4px;
    margin-left: -4px;
  }

  .ruler.v .ruler-line {
    position: absolute;
    left: 4px;
    top: 0;
    bottom: 0;
    width: 1px;
    background: var(--accent);
  }

  .ruler-label {
    position: absolute;
    background: var(--accent);
    color: white;
    font-size: 0.75rem;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    pointer-events: none;

    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
  }

  .ruler.h .ruler-label {
    left: 10px;
    top: -20px;
    pointer-events: auto;
  }

  .ruler.v .ruler-label {
    top: 10px;
    left: 10px;
    pointer-events: auto;
  }

  .del-btn {
    cursor: pointer;
    font-weight: bold;
    padding: 0 2px;
  }

  .del-btn:hover {
    color: #ffd;
  }

  .rotate-90 {
    transform: rotate(90deg);
  }

  .footer {
    position: relative;
    z-index: 200;
    text-align: center;
    padding: 1rem;
    color: var(--text-2);
    font-size: 0.85rem;
    border-top: 1px solid var(--border);
    background: var(--card);
  }
</style>
