<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="goBack">
          <el-icon>
            <ArrowLeft />
          </el-icon>
          <span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">图片拼接工具</h1>
        <span class="tool-subtitle">Image Joiner & Collage Tool</span>
      </div>
      <div class="header-right">
        <el-button-group>
          <el-button type="danger" :disabled="!images.length" @click="clearAll">
            <el-icon>
              <Delete />
            </el-icon>
            清空
          </el-button>
          <el-button type="primary" :disabled="!images.length" @click="downloadResult">
            <el-icon>
              <Download />
            </el-icon>
            导出拼图
          </el-button>
        </el-button-group>
      </div>
    </header>

    <main class="tool-content">
      <div class="layout-container">
        <div class="workbench glass-card">
          <div v-if="!images.length" class="upload-placeholder" @click="triggerUpload">
            <div class="upload-icon">
              <el-icon>
                <PictureFilled />
              </el-icon>
            </div>
            <h3>点击或拖拽上传多张图片</h3>
            <p>支持横向、纵向及网格智能拼接，所有处理均在本地进行，不上传服务器</p>
            <input
              ref="fileRef"
              type="file"
              multiple
              hidden
              accept="image/*"
              @change="handleUpload"
            />
          </div>

          <div v-else class="joiner-stage">
            <div class="stage-toolbar">
              <div class="info-badge">已导入 {{ images.length }} 张图片</div>
              <p class="hint">所有处理均在本地进行，不会上传服务器</p>
            </div>

            <div class="preview-scroll">
              <div ref="stageContainer" class="canvas-container">
                <canvas ref="resultCanvas"></canvas>
              </div>
            </div>

            <div class="image-list">
              <div
                v-for="(img, idx) in images"
                :key="img.id"
                class="image-item shadow-sm"
                :class="{ dragging: dragSourceIdx === idx }"
                draggable="true"
                @dragstart="handleDragStart(idx)"
                @dragover.prevent
                @dragenter.prevent="handleDragEnter(idx)"
                @dragend="handleDragEnd"
              >
                <img :src="img.preview" />
                <div class="item-overlay">
                  <span class="idx">{{ idx + 1 }}</span>
                  <el-button circle size="small" type="danger" @click="removeImage(idx)">
                    <el-icon>
                      <Close />
                    </el-icon>
                  </el-button>
                </div>
              </div>
              <div class="add-more" @click="triggerUpload">
                <el-icon>
                  <Plus />
                </el-icon>
              </div>
            </div>
            <p class="hint mt-2">提示：按住图片图标可拖拽排序，点击右下角删除。当前按顺序排列。</p>
          </div>
        </div>

        <div class="settings-panel glass-card">
          <div class="panel-section">
            <h3 class="section-title">排列方式</h3>
            <el-radio-group v-model="config.mode" class="mode-selector" @change="debouncedRender">
              <el-radio-button value="vertical">
                <div class="mode-btn-content">
                  <el-icon>
                    <Sort />
                  </el-icon>
                  纵向拼接
                </div>
              </el-radio-button>
              <el-radio-button value="horizontal">
                <div class="mode-btn-content">
                  <el-icon>
                    <Right />
                  </el-icon>
                  横向拼接
                </div>
              </el-radio-button>
              <el-radio-button value="grid">
                <div class="mode-btn-content">
                  <el-icon>
                    <Grid />
                  </el-icon>
                  网格拼接
                </div>
              </el-radio-button>
            </el-radio-group>
          </div>

          <div v-if="config.mode === 'grid'" class="settings-group">
            <div class="label">每行图片数 ({{ config.gridColumns }})</div>
            <el-slider v-model="config.gridColumns" :min="1" :max="10" @input="debouncedRender" />
          </div>

          <el-divider />

          <div class="panel-section">
            <h3 class="section-title">间距与边框</h3>
            <div class="settings-group">
              <div class="label">外边距 ({{ config.padding }}px)</div>
              <el-slider v-model="config.padding" :min="0" :max="100" @input="debouncedRender" />
            </div>
            <div class="settings-group">
              <div class="label">图片间距 ({{ config.spacing }}px)</div>
              <el-slider v-model="config.spacing" :min="0" :max="100" @input="debouncedRender" />
            </div>
            <div class="settings-group">
              <div class="label">圆角大小 ({{ config.borderRadius }}px)</div>
              <el-slider
                v-model="config.borderRadius"
                :min="0"
                :max="100"
                @input="debouncedRender"
              />
            </div>
          </div>

          <el-divider />

          <div class="panel-section">
            <h3 class="section-title">背景与输出</h3>
            <div class="settings-group mb-4">
              <div class="label">背景颜色</div>
              <el-color-picker
                v-model="config.backgroundColor"
                show-alpha
                @change="debouncedRender"
              />
            </div>

            <div class="settings-group">
              <div class="label">对齐模式 (当尺寸不一时)</div>
              <el-select v-model="config.align" class="full-width" @change="debouncedRender">
                <el-option label="缩放填满 (等高/等宽)" value="fill" />
                <el-option label="居中对齐" value="center" />
                <el-option label="顶部/左侧对齐" value="start" />
              </el-select>
            </div>

            <div class="settings-group mt-4">
              <div class="label">输出宽度 ({{ config.outputWidth }}px)</div>
              <el-input-number
                v-model="config.outputWidth"
                :min="200"
                :max="8000"
                :step="100"
                class="full-width"
                @change="debouncedRender"
              />
              <p class="hint mt-1">高度将根据比例自动计算</p>
            </div>

            <div class="settings-group">
              <div class="label">导出文件名</div>
              <el-input v-model="config.filename" placeholder="collage" clearable>
                <template #append>.png</template>
              </el-input>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 图片拼接工具</footer>
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import {
    ArrowLeft,
    Delete,
    Download,
    PictureFilled,
    Plus,
    Sort,
    Right,
    Grid,
    Close
  } from '@element-plus/icons-vue';

  const router = useRouter();
  const goBack = () => router.back();

  const images = ref([]);
  const fileRef = ref(null);
  const resultCanvas = ref(null);
  const stageContainer = ref(null);

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

  const triggerUpload = () => fileRef.value?.click();

  const handleUpload = e => {
    const files = Array.from(e.target.files);
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

  const dragSourceIdx = ref(null);

  const handleDragStart = idx => {
    dragSourceIdx.value = idx;
  };

  const handleDragEnter = targetIdx => {
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

  const removeImage = idx => {
    URL.revokeObjectURL(images.value[idx].preview);
    images.value.splice(idx, 1);
    debouncedRender();
  };

  const clearAll = () => {
    images.value.forEach(img => URL.revokeObjectURL(img.preview));
    images.value = [];
  };

  let renderTimer = null;
  const debouncedRender = () => {
    if (renderTimer) clearTimeout(renderTimer);
    renderTimer = setTimeout(render, 50);
  };

  const render = () => {
    if (!images.value.length || !resultCanvas.value) return;
    const canvas = resultCanvas.value;
    const ctx = canvas.getContext('2d');

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
    let items = [];

    if (config.mode === 'vertical') {
      const drawW = outW - p * 2;
      let currentY = p;
      images.value.forEach(item => {
        const img = item.img;
        const drawH = drawW / (img.width / img.height);
        items.push({ x: p, y: currentY, width: drawW, height: drawH });
        currentY += drawH + s;
      });
      totalHeight = currentY - s + p;
    } else if (config.mode === 'horizontal') {
      const targetH =
        (outW - p * 2 - (count - 1) * s) /
        images.value.reduce((acc, cur) => acc + cur.img.width / cur.img.height, 0);

      let currentX = p;
      images.value.forEach(item => {
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
    const fileName = config.filename.trim() || `collage_${Date.now()}`;
    link.download = `${fileName}.png`;
    link.href = resultCanvas.value.toDataURL('image/png');
    link.click();
    ElMessage.success('导出成功');
  };

  onMounted(() => {
    window.addEventListener('resize', render);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', render);
    images.value.forEach(img => URL.revokeObjectURL(img.preview));
  });
</script>

<style scoped>
  .tool-page {
    min-height: 100vh;
    background: #f1f5f9;
    display: flex;
    flex-direction: column;
  }

  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #ffffff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-center {
    text-align: center;
  }

  .tool-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }

  .tool-subtitle {
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
  }

  .tool-content {
    flex: 1;
    padding: 1.5rem;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  .layout-container {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 1.5rem;
  }

  .workbench {
    display: flex;
    flex-direction: column;
    min-height: 600px;
    background: #f8fafc;
    overflow: hidden;
  }

  .upload-placeholder {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
    margin: 2rem;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.5);
  }

  .upload-icon {
    font-size: 4rem;
    color: #94a3b8;
    margin-bottom: 1rem;
  }

  .joiner-stage {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    height: 100%;
  }

  .stage-toolbar {
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .info-badge {
    background: #3b82f6;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .hint {
    font-size: 0.8rem;
    color: #64748b;
    margin: 0;
  }

  .mb-2 {
    margin-bottom: 0.5rem;
  }

  .mt-2 {
    margin-top: 0.5rem;
  }

  .preview-scroll {
    flex: 1;
    background: #e2e8f0;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    min-height: 400px;
    overflow: auto;
    background-image:
      linear-gradient(45deg, #f1f5f9 25%, transparent 25%),
      linear-gradient(-45deg, #f1f5f9 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #f1f5f9 75%),
      linear-gradient(-45deg, transparent 75%, #f1f5f9 75%);
    background-size: 20px 20px;
    background-position:
      0 0,
      0 10px,
      10px -10px,
      -10px 0px;
  }

  .canvas-container {
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  }

  .image-list {
    display: flex;
    gap: 0.75rem;
    padding: 1rem 0;
    overflow-x: auto;
    margin-top: 1rem;
  }

  .image-item {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
    flex-shrink: 0;
    border: 2px solid white;
  }

  .image-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .item-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    opacity: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 4px;
    transition: opacity 0.2s;
  }

  .image-item:hover .item-overlay {
    opacity: 1;
  }

  .image-item.dragging {
    opacity: 0.5;
    transform: scale(0.9);
    border: 2px dashed #3b82f6;
  }

  .idx {
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    background: rgba(0, 0, 0, 0.5);
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
  }

  .add-more {
    width: 80px;
    height: 80px;
    border: 2px dashed #cbd5e1;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #94a3b8;
    flex-shrink: 0;
  }

  .add-more:hover {
    border-color: #3b82f6;
    color: #3b82f6;
  }

  .settings-panel {
    padding: 1.5rem;
    background: #fff;
  }

  .panel-section {
    margin-bottom: 1.5rem;
  }

  .section-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 1rem;
  }

  .settings-group {
    margin-bottom: 1.25rem;
  }

  .label {
    font-size: 0.85rem;
    font-weight: 500;
    color: #64748b;
    margin-bottom: 0.5rem;
  }

  .mode-selector {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }

  .mode-selector :deep(.el-radio-button) {
    width: 100%;
  }

  .mode-selector :deep(.el-radio-button__inner) {
    width: 100%;
    padding: 10px 4px;
  }

  .mode-btn-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    font-size: 0.75rem;
  }

  .full-width {
    width: 100%;
  }

  .mt-1 {
    margin-top: 4px;
  }

  .mt-4 {
    margin-top: 1rem;
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 16px;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }

  @media (max-width: 992px) {
    .layout-container {
      grid-template-columns: 1fr;
    }
  }
</style>
