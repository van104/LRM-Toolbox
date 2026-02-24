<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <div class="header-action start">
          <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        </div>
        <h1 class="brutal-title">像素拼合<span>.熔炉()</span></h1>
        <div class="header-action end">
          <button
            class="brutal-btn action-btn mr-2"
            :disabled="!images.length"
            @click="downloadResult"
          >
            熔铸输出
          </button>
          <button class="brutal-btn clear-btn" :disabled="!images.length" @click="clearAll">
            排空熔炉
          </button>
        </div>
      </header>

      <div class="brutal-grid">
        <!-- 左侧: Preview & Image List -->
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span>融合沙盒.观察窗</span>
            <div class="pane-actions">
              <button @click="triggerUpload">+ 投入介质</button>
            </div>
          </div>

          <div class="control-panel-content">
            <input
              ref="fileInput"
              type="file"
              multiple
              style="display: none"
              accept="image/*"
              @change="handleFileSelect"
            />

            <div v-if="!images.length" class="brutal-upload-area" @click="triggerUpload">
              <div class="upload-placeholder">
                <span class="upload-icon">🧩</span>
                <p>点击灌注多张像素碎片</p>
                <small>(支持长轴/宽轴/网格阵列重组)</small>
              </div>
            </div>

            <div v-else class="preview-area">
              <div ref="stageContainer" class="brutal-canvas-container brutal-shadow">
                <canvas ref="resultCanvas"></canvas>
              </div>

              <!-- Draggable Image List -->
              <div class="feed-belt mt-4">
                <h4 class="feed-title">进料传送带: (可拖拽干预排序)</h4>
                <div class="image-list">
                  <div
                    v-for="(img, idx) in images"
                    :key="img.id"
                    class="image-item brutal-shadow"
                    :class="{ 'is-dragging': dragSourceIdx === idx }"
                    draggable="true"
                    @dragstart="handleDragStart(idx)"
                    @dragover.prevent
                    @dragenter.prevent="handleDragEnter(idx)"
                    @dragend="handleDragEnd"
                  >
                    <img :src="img.preview" />
                    <div class="item-overlay">
                      <span class="item-idx">{{ idx + 1 }}</span>
                      <button class="del-btn" @click.stop="removeImage(idx)">✕</button>
                    </div>
                  </div>
                  <div class="add-more brutal-shadow" @click="triggerUpload">+</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧: Controls -->
        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">力场约束.控制台</span>
          </div>

          <div class="settings-content">
            <!-- Mode -->
            <div class="brutal-form-group channel-group bg-cyan">
              <label class="brutal-label">引力坍缩方向 (Mode)</label>
              <div class="mode-buttons mt-1">
                <button
                  class="mode-btn"
                  :class="{ active: config.mode === 'vertical' }"
                  @click="
                    config.mode = 'vertical';
                    debouncedRender();
                  "
                >
                  纵向沉积
                </button>
                <button
                  class="mode-btn"
                  :class="{ active: config.mode === 'horizontal' }"
                  @click="
                    config.mode = 'horizontal';
                    debouncedRender();
                  "
                >
                  横向扩张
                </button>
                <button
                  class="mode-btn"
                  :class="{ active: config.mode === 'grid' }"
                  @click="
                    config.mode = 'grid';
                    debouncedRender();
                  "
                >
                  矩阵网格
                </button>
              </div>
            </div>

            <!-- Grid Specific -->
            <div v-if="config.mode === 'grid'" class="brutal-form-group mt-4">
              <label class="brutal-label">网格横向切割数 (Columns)</label>
              <div class="slider-group mt-1">
                <input
                  v-model.number="config.gridColumns"
                  type="range"
                  class="brutal-slider"
                  min="1"
                  max="10"
                  @input="debouncedRender"
                />
                <span class="slider-value">[ {{ config.gridColumns }} ]</span>
              </div>
            </div>

            <!-- Spacing & Layout -->
            <div class="brutal-form-group mt-4">
              <label class="brutal-label">外部绝缘层 (Padding: {{ config.padding }}px)</label>
              <input
                v-model.number="config.padding"
                type="range"
                class="brutal-slider mt-1"
                min="0"
                max="200"
                @input="debouncedRender"
              />
            </div>

            <div class="brutal-form-group mt-4">
              <label class="brutal-label">单元排斥力 (Spacing: {{ config.spacing }}px)</label>
              <input
                v-model.number="config.spacing"
                type="range"
                class="brutal-slider mt-1"
                min="0"
                max="200"
                @input="debouncedRender"
              />
            </div>

            <div class="brutal-form-group mt-4">
              <label class="brutal-label">圆角腐蚀力 (Radius: {{ config.borderRadius }}px)</label>
              <input
                v-model.number="config.borderRadius"
                type="range"
                class="brutal-slider mt-1"
                min="0"
                max="100"
                @input="debouncedRender"
              />
            </div>

            <!-- Theme & Sizes -->
            <div class="brutal-form-group channel-group group-pink mt-4">
              <label class="brutal-label">基础暗物质带 (Bg Color)</label>
              <input
                v-model="config.backgroundColor"
                type="color"
                class="brutal-color-picker mt-1"
                @input="debouncedRender"
              />

              <label class="brutal-label mt-4">横向强压像素 (Width)</label>
              <input
                v-model.number="config.outputWidth"
                type="number"
                class="brutal-input mt-1"
                min="200"
                max="8000"
                step="100"
                @change="debouncedRender"
              />

              <label class="brutal-label mt-4">非对称填充协议 (Align)</label>
              <select v-model="config.align" class="brutal-input mt-1" @change="debouncedRender">
                <option value="fill">暴力拉伸填充 (Fill)</option>
                <option value="center">引力中心对齐 (Center)</option>
                <option value="start">零点坐标对齐 (Start)</option>
              </select>

              <label class="brutal-label mt-4">导出代号 (Filename)</label>
              <input
                v-model="config.filename"
                type="text"
                class="brutal-input mt-1"
                placeholder="collage"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 全局状态栏 -->
      <div class="brutal-status" :class="statusClass">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span>
              <span v-for="i in 10" :key="i">{{ statusText }} // &nbsp;</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const images = ref<
    Array<{ id: number; name: string; preview: string; img: HTMLImageElement | null }>
  >([]);
  const resultCanvas = ref<HTMLCanvasElement | null>(null);
  const stageContainer = ref<HTMLElement | null>(null);
  const fileInput = ref<HTMLInputElement | null>(null);

  const triggerUpload = () => {
    if (fileInput.value) fileInput.value.click();
  };

  const handleUpload = (files: File[]) => {
    if (!files.length) return;
    const newImages = files.map((file, idx) => ({
      id: Date.now() + idx,
      name: file.name,
      preview: URL.createObjectURL(file),
      img: null
    }));
    images.value = [...images.value, ...newImages];
    loadImages();
  };

  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      handleUpload(Array.from(target.files));
    }
    target.value = '';
  };

  const config = reactive({
    mode: 'vertical',
    gridColumns: 2,
    padding: 20,
    spacing: 15,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    align: 'fill',
    outputWidth: 1200,
    filename: ''
  });

  const dragSourceIdx = ref<number | null>(null);

  const handleDragStart = (idx: number) => {
    dragSourceIdx.value = idx;
  };

  const handleDragEnter = (targetIdx: number) => {
    if (dragSourceIdx.value === null || dragSourceIdx.value === targetIdx) return;
    const list = [...images.value];
    const item = list.splice(dragSourceIdx.value, 1)[0];
    list.splice(targetIdx, 0, item);
    images.value = list;
    dragSourceIdx.value = targetIdx;
  };

  const handleDragEnd = () => {
    dragSourceIdx.value = null;
    debouncedRender();
  };

  const loadImages = () => {
    let loadedCount = 0;
    images.value.forEach(item => {
      if (item.img) {
        loadedCount++;
        if (loadedCount === images.value.length) render();
        return;
      }
      const img = new Image();
      img.onload = () => {
        item.img = img;
        loadedCount++;
        if (loadedCount === images.value.length) render();
      };
      img.src = item.preview;
    });
  };

  const removeImage = (idx: number) => {
    URL.revokeObjectURL(images.value[idx].preview);
    images.value.splice(idx, 1);
    debouncedRender();
  };

  const clearAll = () => {
    images.value.forEach(img => URL.revokeObjectURL(img.preview));
    images.value = [];
  };

  let renderTimer: ReturnType<typeof setTimeout> | null = null;
  const debouncedRender = () => {
    if (renderTimer) clearTimeout(renderTimer);
    renderTimer = setTimeout(render, 50);
  };

  const render = () => {
    if (!images.value.length || !resultCanvas.value) return;
    const canvas = resultCanvas.value;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const layout = calculateLayout();
    canvas.width = layout.totalWidth;
    canvas.height = layout.totalHeight;

    const container = stageContainer.value;
    if (container) {
      const scale = Math.min(
        container.clientWidth / layout.totalWidth,
        800 / layout.totalHeight,
        1
      );
      canvas.style.width = `${layout.totalWidth * scale}px`;
      canvas.style.height = `${layout.totalHeight * scale}px`;
    }

    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    layout.items.forEach((item, idx) => {
      const imgData = images.value[idx].img;
      if (!imgData) return;

      ctx.save();
      if (config.borderRadius > 0) {
        const r = Math.min(config.borderRadius, item.width / 2, item.height / 2);
        ctx.beginPath();
        ctx.moveTo(item.x + r, item.y);
        ctx.lineTo(item.x + item.width - r, item.y);
        ctx.quadraticCurveTo(item.x + item.width, item.y, item.x + item.width, item.y + r);
        ctx.lineTo(item.x + item.width, item.y + item.height - r);
        ctx.quadraticCurveTo(
          item.x + item.width,
          item.y + item.height,
          item.x + item.width - r,
          item.y + item.height
        );
        ctx.lineTo(item.x + r, item.y + item.height);
        ctx.quadraticCurveTo(item.x, item.y + item.height, item.x, item.y + item.height - r);
        ctx.lineTo(item.x, item.y + r);
        ctx.quadraticCurveTo(item.x, item.y, item.x + r, item.y);
        ctx.closePath();
        ctx.clip();
      }

      if (config.align === 'fill') {
        ctx.drawImage(imgData, item.x, item.y, item.width, item.height);
      } else {
        const imgRatio = imgData.width / imgData.height;
        const boxRatio = item.width / item.height;
        let dw, dh, dx, dy;

        if (imgRatio > boxRatio) {
          dw = item.width;
          dh = item.width / imgRatio;
        } else {
          dh = item.height;
          dw = item.height * imgRatio;
        }

        if (config.align === 'center') {
          dx = item.x + (item.width - dw) / 2;
          dy = item.y + (item.height - dh) / 2;
        } else {
          dx = item.x;
          dy = item.y;
        }
        ctx.drawImage(imgData, dx, dy, dw, dh);
      }
      ctx.restore();
    });
  };

  const calculateLayout = () => {
    const count = images.value.length;
    const p = config.padding;
    const s = config.spacing;
    const outW = config.outputWidth;

    let totalWidth = outW;
    let totalHeight = 0;
    const items: Array<{ x: number; y: number; width: number; height: number }> = [];

    if (config.mode === 'vertical') {
      const drawW = outW - p * 2;
      let currentY = p;
      images.value.forEach(item => {
        if (!item.img) return;
        const img = item.img;
        const drawH = drawW / (img.width / img.height);
        items.push({ x: p, y: currentY, width: drawW, height: drawH });
        currentY += drawH + s;
      });
      totalHeight = currentY - s + p;
    } else if (config.mode === 'horizontal') {
      const totalRatio = images.value.reduce(
        (acc, cur) => (cur.img ? acc + cur.img.width / cur.img.height : acc),
        0
      );
      const targetH = (outW - p * 2 - (count - 1) * s) / (totalRatio || 1);

      let currentX = p;
      images.value.forEach(item => {
        if (!item.img) return;
        const img = item.img;
        const drawW = targetH * (img.width / img.height);
        items.push({ x: currentX, y: p, width: drawW, height: targetH });
        currentX += drawW + s;
      });
      totalWidth = currentX - s + p;
      totalHeight = targetH + p * 2;
    } else if (config.mode === 'grid') {
      const cols = config.gridColumns;
      const rows = Math.ceil(count / cols);
      const drawW = (outW - p * 2 - (cols - 1) * s) / cols;
      const targetH = drawW;

      for (let i = 0; i < count; i++) {
        const r = Math.floor(i / cols);
        const c = i % cols;
        items.push({
          x: p + c * (drawW + s),
          y: p + r * (targetH + s),
          width: drawW,
          height: targetH
        });
      }
      totalHeight = p + rows * targetH + (rows - 1) * s + p;
    }

    return { totalWidth, totalHeight, items };
  };

  const downloadResult = () => {
    if (!resultCanvas.value) return;
    const link = document.createElement('a');
    const fileName = config.filename.trim() || `lrm_collage_matrix_${Date.now()}`;
    link.download = `${fileName}.png`;
    link.href = resultCanvas.value.toDataURL('image/png');
    link.click();
  };

  onMounted(() => {
    window.addEventListener('resize', debouncedRender);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', debouncedRender);
    images.value.forEach(img => URL.revokeObjectURL(img.preview));
  });

  const statusClass = computed(() => {
    if (images.value.length > 0) return 'success';
    return 'info';
  });

  const statusText = computed(() => {
    if (images.value.length > 0)
      return `共鸣完成 : 已桥接 ${images.value.length} 个像素介质，引擎持续热绘制中...`;
    return '引擎静默 : 等待投喂碎片...';
  });
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

  .brutal-wrapper {
    background-color: #fdfae5;
    background-image:
      linear-gradient(#e5e5e5 2px, transparent 2px),
      linear-gradient(90deg, #e5e5e5 2px, transparent 2px);
    background-size: 40px 40px;
    background-position: -2px -2px;
    min-height: 100vh;
    padding: 2rem;
    box-sizing: border-box;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    color: #111;
  }

  .brutal-container {
    max-width: 1600px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }

  .brutal-header {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    margin-bottom: 2rem;
  }
  .header-action.start {
    display: flex;
    justify-content: flex-start;
  }
  .header-action.end {
    display: flex;
    justify-content: flex-end;
  }

  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.5rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #ff4b4b;
  }
  .brutal-title span {
    color: #ff4b4b;
    text-shadow: 4px 4px 0px #111;
    letter-spacing: 0;
  }

  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }
  .brutal-btn-block {
    display: block;
    width: 100%;
    text-align: center;
  }
  .brutal-btn:hover:not(:disabled) {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }
  .brutal-btn:active:not(:disabled) {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }
  .brutal-btn:disabled {
    background: #e0e0e0;
    color: #888;
    border-color: #888;
    box-shadow: 2px 2px 0px #888;
    cursor: not-allowed;
    transform: none;
  }
  .brutal-btn.clear-btn {
    background: #ff4b4b;
    color: #fff;
  }
  .brutal-btn.action-btn {
    background: #00e572;
    color: #111;
  }

  .mr-2 {
    margin-right: 1rem;
  }
  .mt-1 {
    margin-top: 0.25rem;
  }
  .mt-4 {
    margin-top: 1.5rem;
  }

  .brutal-grid {
    display: grid;
    grid-template-columns: 1fr 450px;
    gap: 3rem;
    margin-bottom: 3rem;
  }

  .brutal-pane {
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
    transition: transform 0.2s;
  }
  .brutal-pane:hover {
    transform: translate(-4px, -4px);
    box-shadow: 16px 16px 0px #111;
  }

  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.25rem;
    letter-spacing: 1px;
  }
  .bg-yellow {
    background: #ffd900;
  }
  .bg-blue {
    background: #4b7bff;
  }
  .bg-cyan {
    background: #2dfdff;
  }
  .bg-pink {
    background: #ff9ecf;
  }
  .text-white {
    color: #fff;
    text-shadow: 1px 1px 0 #111;
  }

  .pane-actions button {
    background: #fff;
    color: #111;
    border: 3px solid #111;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 0.9rem;
    padding: 0.35rem 0.75rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
  }
  .pane-actions button:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }

  .control-panel-content,
  .settings-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    flex: 1;
    background: #fdfdfd;
  }
  .settings-content {
    background: #f8fafc;
    background-image:
      linear-gradient(#e5e5e5 1px, transparent 1px),
      linear-gradient(90deg, #e5e5e5 1px, transparent 1px);
    background-size: 20px 20px;
  }

  .brutal-upload-area {
    border: 4px dashed #111;
    background: #fff;
    padding: 2.5rem 1rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    min-height: 400px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .brutal-upload-area:hover {
    background: #ffd900;
    border-style: solid;
  }
  .upload-icon {
    font-size: 4rem;
    display: block;
    margin-bottom: 1rem;
  }
  .upload-placeholder p {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.25rem;
    margin: 0 0 0.5rem 0;
  }
  .upload-placeholder small {
    font-weight: bold;
    color: #666;
  }

  .preview-area {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .brutal-canvas-container {
    flex: 1;
    border: 4px solid #111;
    background: repeating-conic-gradient(#e0e0e0 0% 25%, white 0% 50%) 50% / 20px 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;
    min-height: 400px;
    padding: 2rem;
  }

  canvas {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    background: transparent;
  }

  .feed-title {
    margin: 0 0 0.5rem 0;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: bold;
  }
  .feed-belt {
    padding-top: 1rem;
    border-top: 4px solid #111;
  }
  .image-list {
    display: flex;
    gap: 1rem;
    overflow-x: auto;
    padding: 0.5rem;
  }
  .image-item {
    width: 80px;
    height: 80px;
    border: 3px solid #111;
    background: #fff;
    flex-shrink: 0;
    position: relative;
    cursor: grab;
    transition: transform 0.1s;
  }
  .image-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .image-item.is-dragging {
    opacity: 0.5;
    border-color: #ff4b4b;
    background: #ffebeb;
  }
  .item-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    opacity: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: opacity 0.2s;
  }
  .image-item:hover .item-overlay {
    opacity: 1;
  }
  .item-idx {
    color: #fff;
    font-weight: bold;
    background: #111;
    width: 20px;
    height: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.8rem;
  }
  .del-btn {
    align-self: flex-end;
    background: #ff4b4b;
    border: 2px solid #111;
    color: #fff;
    cursor: pointer;
    width: 24px;
    height: 24px;
    font-weight: bold;
    margin: 2px;
  }
  .add-more {
    width: 80px;
    height: 80px;
    border: 3px dashed #111;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: bold;
    color: #111;
    cursor: pointer;
    background: #fff;
    flex-shrink: 0;
  }
  .add-more:hover {
    background: #ffd900;
    border-style: solid;
    transform: translate(-2px, -2px);
  }

  .mode-buttons {
    display: flex;
    gap: 0.5rem;
  }
  .mode-btn {
    flex: 1;
    background: #fff;
    border: 3px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: bold;
    padding: 0.5rem;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
  }
  .mode-btn:hover {
    background: #eee;
  }
  .mode-btn.active {
    background: #111;
    color: white;
    box-shadow: inset 2px 2px 0px #000;
    transform: translate(2px, 2px);
  }

  .brutal-shadow {
    box-shadow: 8px 8px 0px #111;
  }
  .channel-group {
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    padding: 1.25rem;
  }
  .channel-group.group-pink {
    background: #fdfae5;
  }

  .brutal-label {
    display: block;
    margin-bottom: 0.75rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    color: #111;
  }
  .brutal-input {
    width: 100%;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-size: 1rem;
    padding: 0.75rem;
    border: 3px solid #111;
    border-radius: 0;
    box-shadow: 4px 4px 0px #111;
    outline: none;
    transition: all 0.1s;
    background: #fff;
    box-sizing: border-box;
  }
  .brutal-input:focus {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .brutal-color-picker {
    width: 100%;
    height: 50px;
    border: 3px solid #111;
    padding: 0;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
  }
  .brutal-color-picker::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  .brutal-color-picker::-webkit-color-swatch {
    border: none;
  }

  .slider-group {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .brutal-slider {
    flex: 1;
    -webkit-appearance: none;
    appearance: none;
    height: 12px;
    background: #111;
    outline: none;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #111;
    margin: 10px 0;
  }
  .brutal-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    background: #ffd900;
    border: 3px solid #111;
    cursor: pointer;
  }
  .slider-value {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    min-width: 60px;
  }

  .brutal-status {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    padding: 1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.5rem;
    overflow: hidden;
    position: relative;
    text-transform: uppercase;
  }
  .brutal-status.info {
    background: #fff;
  }
  .brutal-status.success {
    background: #00e572;
    color: #111;
  }

  .marquee-wrapper {
    width: 100%;
    overflow: hidden;
  }
  .marquee-content {
    display: inline-block;
    white-space: nowrap;
    animation: marquee 20s linear infinite;
  }
  @keyframes marquee {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .pane-actions button,
  [data-theme='dark'] .brutal-status,
  [data-theme='dark'] .brutal-status.info,
  [data-theme='dark'] .brutal-input {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane:hover {
    box-shadow: 16px 16px 0px #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
    color: #111;
  }
  [data-theme='dark'] .brutal-upload-area {
    background: #1a1a1a;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-upload-area:hover,
  [data-theme='dark'] .brutal-upload-area.is-dragover {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .channel-group {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .channel-group.group-pink,
  [data-theme='dark'] .settings-content {
    background: #222;
  }
  [data-theme='dark'] .settings-content {
    background-image:
      linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px);
  }
  [data-theme='dark'] .brutal-btn.clear-btn {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .brutal-btn.action-btn {
    background: #00994c;
    color: #fff;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-status.success {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-cyan {
    background: #1a5e5f;
    color: #fff;
  }
  [data-theme='dark'] .mode-btn {
    background: #1a1a1a;
    color: #eee;
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .mode-btn.active {
    background: #eee;
    color: #111;
    box-shadow: inset 2px 2px 0px #111;
  }
</style>
