<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <div class="header-action start">
          <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        </div>
        <h1 class="brutal-title">像素水印<span>.烙印()</span></h1>
        <div class="header-action end">
          <button
            class="brutal-btn action-btn mr-2"
            :disabled="images.length === 0"
            @click="downloadAll"
          >
            批量烫印导出
          </button>
          <button class="brutal-btn clear-btn" :disabled="images.length === 0" @click="clearAll">
            清空工作台
          </button>
        </div>
      </header>

      <div class="brutal-grid">
        <!-- 左侧: Upload / Preview -->
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span>烙印车间.主视窗</span>
            <div class="pane-actions">
              <button @click="triggerFileInput">+ 批量投片</button>
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

            <div v-if="images.length === 0" class="brutal-upload-area" @click="triggerFileInput">
              <div class="upload-placeholder">
                <span class="upload-icon">©️</span>
                <p>点击或拖拽放入待印图层</p>
                <small>(支持批量处理 · 纯前端渲染保护隐私)</small>
              </div>
            </div>

            <div v-else class="preview-area">
              <div ref="stageContainer" class="canvas-container brutal-shadow">
                <canvas ref="previewCanvas"></canvas>
              </div>

              <!-- Pagination -->
              <div class="pagination-bar brutal-shadow mt-4 bg-pink">
                <button class="page-btn" :disabled="currentIndex === 0" @click="currentIndex--">
                  ← 区块回溯
                </button>
                <div class="page-info">
                  <span class="page-num">{{ currentIndex + 1 }}</span> /
                  <span class="total-num">{{ images.length }}</span>
                  <div class="current-name mt-1" :title="images[currentIndex]?.name">
                    {{ images[currentIndex]?.name }}
                  </div>
                </div>
                <button
                  class="page-btn"
                  :disabled="currentIndex === images.length - 1"
                  @click="currentIndex++"
                >
                  推进区块 →
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧: Controls -->
        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">压印约束.刻录机</span>
          </div>

          <div class="settings-content">
            <!-- 模式切换 -->
            <div class="mode-tabs brutal-shadow mb-4">
              <button
                :class="['mode-tab', activeType === 'text' ? 'active' : '']"
                @click="
                  activeType = 'text';
                  debouncedRender();
                "
              >
                字模刻录 (Text)
              </button>
              <button
                :class="['mode-tab', activeType === 'image' ? 'active' : '']"
                @click="
                  activeType = 'image';
                  debouncedRender();
                "
              >
                图腾覆盖 (Image)
              </button>
            </div>

            <!-- 文本水印设置 -->
            <div v-if="activeType === 'text'" class="brutal-form-group channel-group bg-cyan">
              <label class="brutal-label">水印铭文 (Text)</label>
              <input
                v-model="config.text"
                type="text"
                class="brutal-input mt-1"
                placeholder="宣告主权..."
                @input="debouncedRender"
              />

              <div class="slider-group mt-4">
                <label class="brutal-label">字号膨胀 [ {{ config.fontSize }}px ]</label>
                <input
                  v-model.number="config.fontSize"
                  type="range"
                  class="brutal-slider mt-1"
                  min="10"
                  max="500"
                  @input="debouncedRender"
                />
              </div>

              <div class="mt-4 flex gap-4">
                <div class="flex-1">
                  <label class="brutal-label">核心漆色 (Color)</label>
                  <input
                    v-model="config.color"
                    type="color"
                    class="brutal-input color-picker mt-1"
                    @input="debouncedRender"
                  />
                </div>
              </div>

              <div class="mt-4 checkbox-wrapper">
                <label class="brutal-checkbox-label">
                  <input
                    v-model="config.stroke"
                    type="checkbox"
                    class="brutal-checkbox"
                    @change="debouncedRender"
                  />
                  开启装甲描边 (Stroke)
                </label>
                <input
                  v-if="config.stroke"
                  v-model="config.strokeColor"
                  type="color"
                  class="brutal-input color-picker mt-2"
                  @input="debouncedRender"
                />
              </div>
            </div>

            <!-- 图形水印设置 -->
            <div v-if="activeType === 'image'" class="brutal-form-group channel-group bg-cyan">
              <label class="brutal-label">图腾底片 (Logo)</label>
              <div class="logo-uploader brutal-shadow mt-1" @click="triggerLogoUpload">
                <img v-if="config.logoUrl" :src="config.logoUrl" />
                <div v-else class="logo-placeholder">+ 嵌入图像介质</div>
                <input
                  ref="logoFileInput"
                  type="file"
                  style="display: none"
                  accept="image/*"
                  @change="handleLogoSelect"
                />
              </div>

              <div class="slider-group mt-4">
                <label class="brutal-label">图腾延展率 [ {{ config.logoScale }}% ]</label>
                <input
                  v-model.number="config.logoScale"
                  type="range"
                  class="brutal-slider mt-1"
                  min="1"
                  max="200"
                  @input="debouncedRender"
                />
              </div>
            </div>

            <!-- 通用设置 -->
            <div class="brutal-form-group channel-group group-pink mt-4">
              <label class="brutal-label">覆写矩阵架构 (Density)</label>
              <div class="mode-tabs mt-1">
                <button
                  :class="['mode-tab', config.mode === 'single' ? 'active' : '']"
                  @click="
                    config.mode = 'single';
                    debouncedRender();
                  "
                >
                  单核定位
                </button>
                <button
                  :class="['mode-tab', config.mode === 'tile' ? 'active' : '']"
                  @click="
                    config.mode = 'tile';
                    debouncedRender();
                  "
                >
                  全域阵列平铺
                </button>
              </div>

              <!-- 单核定位 -->
              <div v-if="config.mode === 'single'" class="mt-4">
                <label class="brutal-label">九宫格跃迁点 (Position)</label>
                <div class="position-grid mt-1">
                  <div
                    v-for="p in positions"
                    :key="p.key"
                    class="pos-dot"
                    :class="{ active: config.position === p.key }"
                    @click="
                      config.position = p.key;
                      debouncedRender();
                    "
                  ></div>
                </div>

                <div class="flex gap-4 mt-4">
                  <div class="flex-1">
                    <label class="brutal-label">水平偏差 X</label>
                    <input
                      v-model.number="config.offsetX"
                      type="number"
                      class="brutal-input mt-1"
                      @change="debouncedRender"
                    />
                  </div>
                  <div class="flex-1">
                    <label class="brutal-label">垂直偏差 Y</label>
                    <input
                      v-model.number="config.offsetY"
                      type="number"
                      class="brutal-input mt-1"
                      @change="debouncedRender"
                    />
                  </div>
                </div>
              </div>

              <!-- 平铺阵列 -->
              <div v-if="config.mode === 'tile'" class="mt-4 flex gap-4">
                <div class="flex-1">
                  <label class="brutal-label">矩阵间距 X</label>
                  <input
                    v-model.number="config.spacingX"
                    type="number"
                    class="brutal-input mt-1"
                    min="0"
                    @change="debouncedRender"
                  />
                </div>
                <div class="flex-1">
                  <label class="brutal-label">矩阵间距 Y</label>
                  <input
                    v-model.number="config.spacingY"
                    type="number"
                    class="brutal-input mt-1"
                    min="0"
                    @change="debouncedRender"
                  />
                </div>
              </div>

              <div class="mt-4 slider-group">
                <label class="brutal-label">光学隐身度 [ {{ config.opacity }} ]</label>
                <input
                  v-model.number="config.opacity"
                  type="range"
                  class="brutal-slider mt-1"
                  min="0"
                  max="1"
                  step="0.1"
                  @input="debouncedRender"
                />
              </div>

              <div class="mt-4 slider-group">
                <label class="brutal-label">扭曲角 [ {{ config.rotate }}° ]</label>
                <input
                  v-model.number="config.rotate"
                  type="range"
                  class="brutal-slider mt-1"
                  min="-180"
                  max="180"
                  @input="debouncedRender"
                />
              </div>
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
  import { ref, reactive, watch, onMounted, onUnmounted, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { useFileHandler } from '@/composables';

  interface ImgData {
    file: File;
    name: string;
    url: string;
    img: HTMLImageElement | null;
  }

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const images = ref<ImgData[]>([]);
  const currentIndex = ref(0);
  const activeType = ref<'text' | 'image'>('text');
  const previewCanvas = ref<HTMLCanvasElement | null>(null);
  const stageContainer = ref<HTMLDivElement | null>(null);

  const { fileInput, triggerFileInput } = useFileHandler({
    accept: 'image/*',
    readMode: 'none'
  });

  const {
    fileInput: logoFileInput,
    triggerFileInput: triggerLogoUpload,
    handleFileSelect: handleLogoSelectBase
  } = useFileHandler({
    accept: 'image/*',
    readMode: 'dataURL',
    onSuccess: result => {
      config.logoUrl = result.data as string;
      const img = new Image();
      img.onload = () => {
        config.logoImg = img;
        debouncedRender();
      };
      img.src = config.logoUrl;
    }
  });

  // Wrap to maintain correct event propagation & type flow
  const handleLogoSelect = (e: Event) => {
    handleLogoSelectBase(e);
    if (logoFileInput.value) logoFileInput.value.value = '';
  };

  const handleUpload = (files: File[]) => {
    if (!files.length) return;
    const newImages = files.map(file => ({
      file,
      name: file.name,
      url: URL.createObjectURL(file),
      img: null
    }));
    images.value = [...images.value, ...newImages];
    loadCurrentImage();
  };

  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files) handleUpload(Array.from(target.files));
    target.value = '';
  };

  const config = reactive({
    text: 'LRM 工具箱',
    fontSize: 80,
    color: '#ffffff',
    stroke: false,
    strokeColor: '#000000',

    logoUrl: '',
    logoImg: null as HTMLImageElement | null,
    logoScale: 100,

    mode: 'tile' as 'single' | 'tile',
    position: 'center',
    opacity: 0.5,
    rotate: -30,
    offsetX: 0,
    offsetY: 0,
    spacingX: 100,
    spacingY: 100
  });

  const positions = [
    { key: 'tl', label: '左上' },
    { key: 'tc', label: '中上' },
    { key: 'tr', label: '右上' },
    { key: 'ml', label: '左中' },
    { key: 'center', label: '中间' },
    { key: 'mr', label: '右中' },
    { key: 'bl', label: '左下' },
    { key: 'bc', label: '中下' },
    { key: 'br', label: '右下' }
  ];

  const loadCurrentImage = () => {
    if (!images.value.length) return;
    const current = images.value[currentIndex.value];
    if (current.img) {
      render();
      return;
    }

    const img = new Image();
    img.onload = () => {
      current.img = img;
      render();
    };
    img.src = current.url;
  };

  watch(currentIndex, loadCurrentImage);

  let renderTimer: ReturnType<typeof setTimeout> | null = null;
  const debouncedRender = () => {
    if (renderTimer) clearTimeout(renderTimer);
    renderTimer = setTimeout(render, 50);
  };

  const render = () => {
    const current = images.value[currentIndex.value];
    if (!current || !current.img || !previewCanvas.value) return;

    const canvas = previewCanvas.value;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { img } = current;

    canvas.width = img.width;
    canvas.height = img.height;

    const container = stageContainer.value;
    if (!container || !img.width || !img.height) return;

    canvas.style.width = '';
    canvas.style.height = '';

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    drawWatermark(ctx, canvas.width, canvas.height);
  };

  const drawWatermark = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.save();
    ctx.globalAlpha = config.opacity;

    if (activeType.value === 'text') {
      ctx.font = `bold ${config.fontSize}px 'Syne', 'Noto Sans SC', sans-serif`;
      // Convert standard hex to rgba for opacity if needed,
      // but ctx.globalAlpha already handles it
      ctx.fillStyle = config.color;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      if (config.stroke) {
        ctx.strokeStyle = config.strokeColor;
        ctx.lineWidth = Math.max(2, config.fontSize / 15);
      }
    }

    if (config.mode === 'tile') {
      renderTile(ctx, w, h);
    } else {
      renderSingle(ctx, w, h);
    }

    ctx.restore();
  };

  const renderSingle = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    let x = 0,
      y = 0;
    const pos = config.position;
    const padding = 40;

    let ww = 0,
      wh = 0;
    if (activeType.value === 'text') {
      const metrics = ctx.measureText(config.text);
      ww = metrics.width;
      wh = config.fontSize;
    } else if (config.logoImg) {
      ww = config.logoImg.width * (config.logoScale / 100);
      wh = config.logoImg.height * (config.logoScale / 100);
    }

    if (pos.includes('l')) x = padding + ww / 2;
    else if (pos.includes('r')) x = w - padding - ww / 2;
    else x = w / 2;

    if (pos.includes('t')) y = padding + wh / 2;
    else if (pos.includes('b')) y = h - padding - wh / 2;
    else y = h / 2;

    x += config.offsetX;
    y += config.offsetY;

    ctx.translate(x, y);
    ctx.rotate((config.rotate * Math.PI) / 180);

    if (activeType.value === 'text') {
      if (config.stroke) ctx.strokeText(config.text, 0, 0);
      ctx.fillText(config.text, 0, 0);
    } else if (config.logoImg) {
      ctx.drawImage(config.logoImg, -ww / 2, -wh / 2, ww, wh);
    }
  };

  const renderTile = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    let ww = 0,
      wh = 0;
    if (activeType.value === 'text') {
      ww = ctx.measureText(config.text).width;
      wh = config.fontSize;
    } else if (config.logoImg) {
      ww = config.logoImg.width * (config.logoScale / 100);
      wh = config.logoImg.height * (config.logoScale / 100);
    }

    const stepX = Math.max(ww + config.spacingX, 40);
    const stepY = Math.max(wh + config.spacingY, 40);

    // Extrapolate bounding area to ensure covered when rotated
    const dim = Math.max(w, h) * 2;

    for (let y = -dim; y < dim; y += stepY) {
      for (let x = -dim; x < dim; x += stepX) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((config.rotate * Math.PI) / 180);
        if (activeType.value === 'text') {
          if (config.stroke) ctx.strokeText(config.text, 0, 0);
          ctx.fillText(config.text, 0, 0);
        } else if (config.logoImg) {
          ctx.drawImage(config.logoImg, -ww / 2, -wh / 2, ww, wh);
        }
        ctx.restore();
      }
    }
  };

  const clearAll = () => {
    images.value.forEach(img => URL.revokeObjectURL(img.url));
    images.value = [];
    currentIndex.value = 0;
  };

  const downloadAll = async () => {
    if (images.value.length === 0) return;

    try {
      for (const imgData of images.value) {
        if (!imgData.img) continue;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = imgData.img.width;
        tempCanvas.height = imgData.img.height;
        const tctx = tempCanvas.getContext('2d');
        if (!tctx) continue;

        tctx.drawImage(imgData.img, 0, 0);
        drawWatermark(tctx, tempCanvas.width, tempCanvas.height);

        const blob = await new Promise<Blob | null>(resolve =>
          tempCanvas.toBlob(resolve, 'image/png')
        );
        if (!blob) continue;

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `branded_${imgData.name}`;
        a.click();
        URL.revokeObjectURL(url);

        await new Promise(r => setTimeout(r, 200));
      }
    } catch (err) {
      console.error(err);
      ElMessage.error('导出列队崩溃');
    }
  };

  onMounted(() => {
    window.addEventListener('resize', debouncedRender);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', debouncedRender);
    images.value.forEach(img => URL.revokeObjectURL(img.url));
    if (config.logoUrl) URL.revokeObjectURL(config.logoUrl);
  });

  const statusClass = computed(() => {
    if (images.value.length > 0) return 'success';
    return 'info';
  });

  const statusText = computed(() => {
    if (images.value.length > 0)
      return `涂装准备就绪 : 内存栈已加载 ${images.value.length} 个阵列对象，请调整刻录机参数...`;
    return '系统静思域 : 等待投放裸模图层物...';
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
  .action-btn {
    background: #00e572;
    color: #111;
  }

  .mr-2 {
    margin-right: 1rem;
  }
  .mt-1 {
    margin-top: 0.25rem;
  }
  .mt-2 {
    margin-top: 0.5rem;
  }
  .mt-4 {
    margin-top: 1.5rem;
  }
  .mb-4 {
    margin-bottom: 1.5rem;
  }
  .flex {
    display: flex;
  }
  .flex-1 {
    flex: 1;
  }
  .gap-4 {
    gap: 1rem;
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
  .canvas-container {
    flex: 1;
    border: 4px solid #111;
    background: repeating-conic-gradient(#e0e0e0 0% 25%, white 0% 50%) 50% / 20px 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    min-height: 400px;
    max-height: 60vh;
  }
  canvas {
    background: transparent;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .pagination-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border: 4px solid #111;
  }
  .page-btn {
    background: #fff;
    border: 3px solid #111;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    padding: 0.5rem 1rem;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
  }
  .page-btn:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 4px 4px 0px #111;
  }
  .page-btn:disabled {
    opacity: 0.5;
    background: #eee;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
  .page-info {
    text-align: center;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: bold;
  }
  .page-num {
    font-size: 1.5rem;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
  }
  .current-name {
    font-size: 0.85rem;
    color: #111;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mode-tabs {
    display: flex;
    border: 4px solid #111;
    background: #fff;
  }
  .mode-tab {
    flex: 1;
    padding: 1rem;
    border: none;
    background: transparent;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    cursor: pointer;
    border-right: 4px solid #111;
    transition: 0.1s;
  }
  .mode-tab:last-child {
    border-right: none;
  }
  .mode-tab:hover {
    background: #eee;
  }
  .mode-tab.active {
    background: #111;
    color: white;
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
    font-size: 1rem;
    color: #111;
  }
  .brutal-input {
    width: 100%;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-size: 1rem;
    padding: 0.75rem;
    border: 3px solid #111;
    border-radius: 0;
    box-shadow: 3px 3px 0px #111;
    outline: none;
    transition: all 0.1s;
    background: #fff;
    box-sizing: border-box;
  }
  .brutal-input:focus {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }
  .color-picker {
    height: 50px;
    padding: 0;
    cursor: pointer;
  }
  .color-picker::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  .color-picker::-webkit-color-swatch {
    border: none;
  }

  .slider-group {
    width: 100%;
    display: flex;
    flex-direction: column;
  }
  .brutal-slider {
    width: 100%;
    -webkit-appearance: none;
    appearance: none;
    height: 12px;
    background: #111;
    outline: none;
    border: 3px solid #111;
    box-shadow: 2px 2px 0px #111;
    margin: 5px 0;
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

  .checkbox-wrapper {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
  }
  .brutal-checkbox {
    width: 24px;
    height: 24px;
    border: 3px solid #111;
    margin-right: 0.5rem;
    accent-color: #ff4b4b;
    cursor: pointer;
  }
  .brutal-checkbox-label {
    font-weight: 800;
    font-family: 'Syne', sans-serif;
    cursor: pointer;
    display: flex;
    align-items: center;
  }

  .logo-uploader {
    height: 120px;
    border: 4px dashed #111;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: 0.2s;
    overflow: hidden;
  }
  .logo-uploader:hover {
    background: #ffd900;
    border-style: solid;
  }
  .logo-uploader img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  .logo-placeholder {
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    font-size: 1.25rem;
  }

  .position-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    width: 150px;
    margin: 0 auto;
  }
  .pos-dot {
    aspect-ratio: 1;
    border: 3px solid #111;
    background: #fff;
    cursor: pointer;
    transition: 0.1s;
    box-shadow: 2px 2px 0px #111;
  }
  .pos-dot:hover {
    background: #ffd900;
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
  }
  .pos-dot.active {
    background: #111;
    transform: translate(2px, 2px);
    box-shadow: 0px 0px 0px #111;
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
  .brutal-status.warn {
    background: #ffd900;
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
  [data-theme='dark'] .brutal-upload-area:hover {
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
  [data-theme='dark'] .action-btn {
    background: #00994c;
    color: #fff;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-status.success {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .brutal-status.warn {
    background: #b28f00;
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
  [data-theme='dark'] .bg-pink {
    background: #993366;
    color: #fff;
  }
  [data-theme='dark'] .brutal-shadow {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .pagination-bar {
    border-color: #eee;
  }
  [data-theme='dark'] .page-btn {
    background: #333;
    color: #eee;
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .page-btn:hover:not(:disabled) {
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .current-name {
    color: #eee;
  }
  [data-theme='dark'] .mode-tabs {
    border-color: #eee;
    background: #333;
  }
  [data-theme='dark'] .mode-tab {
    border-right-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .mode-tab:hover {
    background: #444;
  }
  [data-theme='dark'] .mode-tab.active {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .logo-uploader {
    background: #333;
    border-color: #eee;
  }
  [data-theme='dark'] .logo-uploader:hover {
    background: #b28f00;
  }
  [data-theme='dark'] .pos-dot {
    background: #333;
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .pos-dot:hover {
    background: #b28f00;
  }
  [data-theme='dark'] .pos-dot.active {
    background: #eee;
    box-shadow: 0px 0px 0px #eee;
  }
  [data-theme='dark'] .canvas-container {
    border-color: #eee;
    background: #333;
  }
</style>
