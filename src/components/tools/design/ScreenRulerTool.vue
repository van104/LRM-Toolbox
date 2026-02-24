<template>
  <div class="brutal-wrapper ruler-mode">
    <div ref="workspaceRef" class="ruler-workspace">
      <div class="control-panel">
        <div class="panel-top">
          <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
          <h1 class="panel-title">屏幕<span>.标尺()</span></h1>
          <span class="viewport-info">{{ vpWidth }} × {{ vpHeight }} px</span>
        </div>
        <div class="panel-actions">
          <button class="action-btn" @click="addRuler('h')">═ 水平标尺</button>
          <button class="action-btn" @click="addRuler('v')">║ 垂直标尺</button>
          <button class="action-btn danger" @click="clearRulers">清空</button>
        </div>
        <div class="panel-tips">拖动标尺测量，双击标尺旋转</div>
      </div>

      <div class="rulers-container">
        <div
          v-for="ruler in rulers"
          :key="ruler.id"
          class="ruler"
          :class="[ruler.type, { dragging: ruler.isDragging }]"
          :style="getRulerStyle(ruler)"
          @mousedown.stop="startDrag($event, ruler)"
          @dblclick.stop="flipRuler(ruler)"
        >
          <div class="ruler-line"></div>
          <div class="ruler-label">
            {{ ruler.pos }}px
            <span class="del-btn" @mousedown.stop="removeRuler(ruler.id)">×</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push('/');
  }

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
      type,
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
  const flipRuler = ruler => {
    ruler.type = ruler.type === 'h' ? 'v' : 'h';
  };

  const getRulerStyle = ruler => {
    if (ruler.type === 'h') return { top: `${ruler.pos}px`, left: 0, right: 0, height: '1px' };
    else return { left: `${ruler.pos}px`, top: 0, bottom: 0, width: '1px' };
  };

  const startDrag = (e, ruler) => {
    e.preventDefault();
    draggedRuler = ruler;
    ruler.isDragging = true;
  };
  const onDrag = e => {
    if (!draggedRuler) return;
    e.preventDefault();
    draggedRuler.pos = draggedRuler.type === 'h' ? e.clientY : e.clientX;
  };
  const endDrag = () => {
    if (draggedRuler) {
      draggedRuler.isDragging = false;
      draggedRuler = null;
    }
  };
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

  .brutal-wrapper.ruler-mode {
    background-color: #fdfae5;
    background-image:
      linear-gradient(#e5e5e5 2px, transparent 2px),
      linear-gradient(90deg, #e5e5e5 2px, transparent 2px);
    background-size: 40px 40px;
    background-position: -2px -2px;
    height: 100vh;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    color: #111;
    overflow: hidden;
  }

  .ruler-workspace {
    width: 100%;
    height: 100%;
    position: relative;
    cursor: crosshair;
  }

  .control-panel {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    padding: 1rem 1.5rem;
    min-width: 480px;
  }
  .panel-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    gap: 1rem;
  }
  .panel-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.5rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -1px;
    white-space: nowrap;
  }
  .panel-title span {
    color: #ff4b4b;
  }
  .viewport-info {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    font-size: 0.85rem;
    background: #111;
    color: #ffd900;
    padding: 0.2rem 0.6rem;
    border: 2px solid #111;
    white-space: nowrap;
  }

  .brutal-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.4rem 0.8rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 0.9rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .brutal-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }
  .brutal-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px #111;
  }

  .panel-actions {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  .action-btn {
    flex: 1;
    padding: 0.4rem 0.6rem;
    border: 3px solid #111;
    background: #fff;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 0.8rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
    white-space: nowrap;
  }
  .action-btn:hover {
    background: #ffd900;
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0px #111;
  }
  .action-btn.danger {
    background: #ff4b4b;
    color: #fff;
  }

  .panel-tips {
    font-size: 0.75rem;
    text-align: center;
    color: #666;
    font-weight: 600;
  }

  .ruler {
    position: absolute;
    pointer-events: auto;
  }
  .ruler.h {
    height: 1px;
    cursor: ns-resize;
    border-top: 2px solid #ff4b4b;
    padding: 4px 0;
    background: transparent;
    margin-top: -4px;
  }
  .ruler.h .ruler-line {
    position: absolute;
    top: 4px;
    left: 0;
    right: 0;
    height: 2px;
    background: #ff4b4b;
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
    width: 2px;
    background: #ff4b4b;
  }

  .ruler-label {
    position: absolute;
    background: #ff4b4b;
    color: #fff;
    font-size: 0.8rem;
    padding: 2px 8px;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    pointer-events: none;
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    border: 2px solid #111;
    box-shadow: 2px 2px 0px #111;
  }
  .ruler.h .ruler-label {
    left: 10px;
    top: -24px;
    pointer-events: auto;
  }
  .ruler.v .ruler-label {
    top: 10px;
    left: 10px;
    pointer-events: auto;
  }
  .del-btn {
    cursor: pointer;
    font-weight: 800;
    padding: 0 2px;
  }
  .del-btn:hover {
    color: #ffd900;
  }

  /* --- Dark Mode --- */
  [data-theme='dark'] .brutal-wrapper.ruler-mode {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .control-panel {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .action-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn {
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .action-btn:hover {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .viewport-info {
    background: #eee;
    color: #111;
    border-color: #eee;
  }
  [data-theme='dark'] .ruler-label {
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
</style>
