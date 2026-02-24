<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <div class="header-action start">
          <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        </div>
        <h1 class="brutal-title">图片圆角<span>.裁切()</span></h1>
        <div class="header-action end">
          <button class="brutal-btn clear-btn" @click="resetFilters">重置参数</button>
        </div>
      </header>

      <div class="brutal-grid">
        <!-- Left Pane: Controls -->
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span>几何切角.控制台</span>
            <div class="pane-actions">
              <button :disabled="!imageUrl" @click="downloadImage">保存图片</button>
            </div>
          </div>

          <div class="control-panel-content">
            <div
              class="brutal-upload-area"
              @click="triggerUpload"
              @drop.prevent="handleDrop"
              @dragover.prevent
            >
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleFileChange"
              />
              <div v-if="!imageUrl" class="upload-placeholder">
                <span class="upload-icon">⬆️</span>
                <p>点击或拖拽上传需要裁切的图片</p>
              </div>
              <div v-else class="preview-thumbnail">
                <img :src="imageUrl" alt="Preview" />
                <button class="brutal-btn small-btn" @click.stop="triggerUpload">更换图片</button>
              </div>
            </div>

            <!-- Radius -->
            <div class="brutal-form-group channel-group group-pink">
              <h4>🔻 基础圆角 (Radius)</h4>
              <div class="slider-row">
                <label>半径 : {{ borderRadius }}px</label>
                <input
                  v-model.number="borderRadius"
                  type="range"
                  :min="0"
                  :max="maxRadius"
                  class="brutal-slider thumb-pink"
                />
              </div>
            </div>

            <!-- Border -->
            <div class="brutal-form-group channel-group group-green">
              <div class="flex-between">
                <h4>🔲 描边特效 (Border)</h4>
                <label class="switch-label">
                  <input v-model="enableBorder" type="checkbox" class="brutal-checkbox" />
                  <span>启用描边</span>
                </label>
              </div>

              <div v-if="enableBorder" class="toggled-controls mt-3">
                <div class="slider-row">
                  <label>宽度 : {{ borderWidth }}px</label>
                  <input
                    v-model.number="borderWidth"
                    type="range"
                    :min="0"
                    :max="50"
                    class="brutal-slider thumb-green"
                  />
                </div>
                <div class="control-row-color mt-3">
                  <label class="font-bold">描边颜色 :</label>
                  <input v-model="borderColor" type="color" class="brutal-color-picker" />
                </div>
              </div>
            </div>

            <!-- Shadow -->
            <div class="brutal-form-group channel-group group-blue">
              <div class="flex-between">
                <h4>🌑 阴影特效 (Shadow)</h4>
                <label class="switch-label">
                  <input v-model="enableShadow" type="checkbox" class="brutal-checkbox" />
                  <span>启用阴影</span>
                </label>
              </div>

              <div v-if="enableShadow" class="toggled-controls mt-3">
                <div class="slider-row">
                  <label>模糊 : {{ shadowBlur }}</label>
                  <input
                    v-model.number="shadowBlur"
                    type="range"
                    :min="0"
                    :max="100"
                    class="brutal-slider thumb-blue"
                  />
                </div>
                <!-- Native shadow does not strictly need spread in basic canvas but handled roughly via padding -->
                <div class="slider-row">
                  <label>扩散 : {{ shadowSpread }}</label>
                  <input
                    v-model.number="shadowSpread"
                    type="range"
                    :min="-20"
                    :max="50"
                    class="brutal-slider thumb-blue"
                  />
                </div>
                <div class="slider-row">
                  <label>偏移X: {{ shadowX }}</label>
                  <input
                    v-model.number="shadowX"
                    type="range"
                    :min="-50"
                    :max="50"
                    class="brutal-slider thumb-blue"
                  />
                </div>
                <div class="slider-row">
                  <label>偏移Y: {{ shadowY }}</label>
                  <input
                    v-model.number="shadowY"
                    type="range"
                    :min="-50"
                    :max="50"
                    class="brutal-slider thumb-blue"
                  />
                </div>
                <div class="control-row-color mt-3">
                  <label class="font-bold">阴影颜色 :</label>
                  <input v-model="shadowColor" type="color" class="brutal-color-picker" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Pane: Preview -->
        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">透明背景.渲染层</span>
          </div>

          <div class="preview-container checkerboard">
            <div v-show="!imageUrl" class="empty-state">
              <span>等待灌入图像数据...</span>
            </div>
            <div v-show="imageUrl" class="canvas-wrapper">
              <canvas ref="canvasRef"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Global Status Bar -->
      <div class="brutal-status" :class="imageUrl ? 'success' : 'info'">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-if="imageUrl">
              <span v-for="i in 10" :key="i"
                >图像已激活 : 像素级裁切系统与边缘平滑正在实时工作 // &nbsp;</span
              >
            </span>
            <span v-else>
              <span v-for="i in 10" :key="i"
                >系统空闲中 : 期待注入光栅图像以执行圆角裁切算法 // &nbsp;</span
              >
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';

  const router = useRouter();

  const fileInput = ref<HTMLInputElement | null>(null);
  const canvasRef = ref<HTMLCanvasElement | null>(null);
  const imageUrl = ref('');
  const imageObj = ref<HTMLImageElement | null>(null);

  // Settings
  const borderRadius = ref(20);
  const maxRadius = ref(200);

  const enableBorder = ref(false);
  const borderWidth = ref(0);
  const borderColor = ref('#111111');

  const enableShadow = ref(false);
  const shadowBlur = ref(0);
  const shadowSpread = ref(0);
  const shadowX = ref(6);
  const shadowY = ref(6);
  const shadowColor = ref('#111111');

  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const resetFilters = () => {
    borderRadius.value = 20;
    enableBorder.value = false;
    borderWidth.value = 0;
    borderColor.value = '#111111';
    enableShadow.value = false;
    shadowBlur.value = 0;
    shadowSpread.value = 0;
    shadowX.value = 6;
    shadowY.value = 6;
    shadowColor.value = '#111111';
  };

  const triggerUpload = () => {
    fileInput.value?.click();
  };

  const handleFileChange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: DragEvent) => {
    const file = e.dataTransfer?.files[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      ElMessage.error('请上传图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      imageUrl.value = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        imageObj.value = img;
        maxRadius.value = Math.min(img.width, img.height) / 2;
        drawCanvas();
      };
      img.src = imageUrl.value;
    };
    reader.readAsDataURL(file);
  };

  const drawCanvas = () => {
    if (!canvasRef.value || !imageObj.value) return;

    const canvas = canvasRef.value;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageObj.value;

    const shadowPadding = enableShadow.value
      ? Math.max(
          Math.abs(shadowX.value) + shadowBlur.value + Math.abs(shadowSpread.value),
          Math.abs(shadowY.value) + shadowBlur.value + Math.abs(shadowSpread.value)
        ) + 20
      : 0;
    const borderPadding = enableBorder.value ? borderWidth.value : 0;
    const totalPadding = Math.max(shadowPadding, borderPadding);

    canvas.width = img.width + totalPadding * 2;
    canvas.height = img.height + totalPadding * 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const x = totalPadding;
    const y = totalPadding;
    const w = img.width;
    const h = img.height;
    const r = Math.min(borderRadius.value, w / 2, h / 2);

    ctx.save();

    if (enableShadow.value) {
      ctx.shadowColor = shadowColor.value;
      ctx.shadowBlur = shadowBlur.value;
      ctx.shadowOffsetX = shadowX.value;
      ctx.shadowOffsetY = shadowY.value;

      ctx.fillStyle = 'white';
      roundRect(ctx, x, y, w, h, r);
      ctx.fill();
    }

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.beginPath();
    roundRect(ctx, x, y, w, h, r);
    ctx.clip();

    ctx.drawImage(img, x, y, w, h);

    ctx.restore();

    if (enableBorder.value && borderWidth.value > 0) {
      ctx.save();
      ctx.beginPath();
      roundRect(ctx, x, y, w, h, r);
      ctx.lineWidth = borderWidth.value * 2; // the stroke is centered, doubling prevents it from being halved visually, though clipping may cut outer
      ctx.strokeStyle = borderColor.value;
      ctx.stroke();
      ctx.restore();
    }
  };

  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  const downloadImage = () => {
    if (!canvasRef.value) return;
    const link = document.createElement('a');
    link.download = `corner-clipped-${Date.now()}.png`;
    link.href = canvasRef.value.toDataURL('image/png');
    link.click();
  };

  watch(
    [
      borderRadius,
      enableBorder,
      borderWidth,
      borderColor,
      enableShadow,
      shadowBlur,
      shadowX,
      shadowY,
      shadowColor,
      shadowSpread
    ],
    () => {
      drawCanvas();
    }
  );

  onMounted(() => {
    // Init
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

  .brutal-btn.small-btn {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
  }

  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }

  .brutal-btn.small-btn:hover {
    box-shadow: 7px 7px 0px #111;
  }

  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-btn.clear-btn {
    background: #ff4b4b;
    color: #fff;
  }

  .brutal-grid {
    display: grid;
    grid-template-columns: 400px 1fr;
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
    color: #fff;
  }
  .text-white {
    color: #fff;
  }

  .pane-actions {
    display: flex;
    gap: 0.75rem;
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
    transition: all 0.1s;
  }

  .pane-actions button:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }

  .pane-actions button:active:not(:disabled) {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }

  .pane-actions button:disabled {
    background: #eee;
    color: #aaa;
    border-color: #aaa;
    box-shadow: 2px 2px 0px #aaa;
    cursor: not-allowed;
    transform: none;
  }

  .control-panel-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    flex: 1;
    background: #fdfdfd;
  }

  .brutal-upload-area {
    border: 4px dashed #111;
    background: #fff;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
  }

  .brutal-upload-area:hover {
    background: #ffd900;
    border-style: solid;
  }

  .upload-icon {
    font-size: 3rem;
    display: block;
    margin-bottom: 1rem;
  }

  .upload-placeholder p {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    margin: 0;
  }

  .preview-thumbnail img {
    max-width: 100%;
    max-height: 180px;
    border: 4px solid #111;
    box-shadow: 6px 6px 0px #111;
    margin-bottom: 1rem;
    display: block;
    margin-left: auto;
    margin-right: auto;
  }

  .channel-group {
    background: #fdfae5;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    padding: 1rem;
  }

  .channel-group h4 {
    margin: 0 0 1rem 0;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
  }

  .group-pink h4 {
    color: #ff6bc9;
    text-shadow: 1px 1px 0px #111;
  }
  .group-green h4 {
    color: #00e572;
    text-shadow: 1px 1px 0px #111;
  }
  .group-blue h4 {
    color: #4b7bff;
    text-shadow: 1px 1px 0px #111;
  }

  .flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .slider-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.75rem;
  }

  .slider-row label {
    font-weight: 800;
    min-width: 80px;
  }

  .control-row-color {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .mt-3 {
    margin-top: 0.75rem;
  }

  .font-bold {
    font-weight: 800;
  }

  .brutal-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 16px;
    background: #fff;
    border: 2px solid #111;
    box-shadow: 2px 2px 0px #111;
    outline: none;
    border-radius: 0;
  }

  .brutal-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 24px;
    border: 2px solid #111;
    cursor: pointer;
  }

  .thumb-pink::-webkit-slider-thumb {
    background: #ff6bc9;
  }
  .thumb-green::-webkit-slider-thumb {
    background: #00e572;
  }
  .thumb-blue::-webkit-slider-thumb {
    background: #4b7bff;
  }

  .switch-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
  }

  .brutal-checkbox {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border: 3px solid #111;
    background: #fff;
    box-shadow: 2px 2px 0px #111;
    cursor: pointer;
    position: relative;
    margin: 0;
  }

  .brutal-checkbox:checked {
    background: #00e572;
  }

  .brutal-checkbox:checked::after {
    content: '';
    position: absolute;
    left: 6px;
    top: 2px;
    width: 6px;
    height: 12px;
    border: solid #111;
    border-width: 0 3px 3px 0;
    transform: rotate(45deg);
  }

  .brutal-color-picker {
    -webkit-appearance: none;
    appearance: none;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #111;
    width: 48px;
    height: 32px;
    padding: 0;
    background: #fff;
    cursor: pointer;
  }

  .brutal-color-picker::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  .brutal-color-picker::-webkit-color-swatch {
    border: none;
  }

  .preview-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0;
    position: relative;
    background: #f8fafc;
  }

  .checkerboard {
    background-image:
      linear-gradient(45deg, #ccc 25%, transparent 25%),
      linear-gradient(135deg, #ccc 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #ccc 75%),
      linear-gradient(135deg, transparent 75%, #ccc 75%);
    background-size: 20px 20px;
    background-position:
      0 0,
      10px 0,
      10px -10px,
      0px 10px;
    background-color: white;
  }

  .empty-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    color: #111;
    font-style: italic;
    font-weight: 600;
  }

  .canvas-wrapper {
    flex: 1;
    display: flex;
    padding: 2rem;
    min-height: 480px;
    overflow: auto;
  }

  .canvas-wrapper canvas {
    margin: auto;
    display: block;
    max-width: 100%;
    /* No solid border here so the image shadow can be seen properly */
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

  @media (max-width: 1024px) {
    .brutal-title {
      font-size: 2.5rem;
    }
    .brutal-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
    .brutal-header {
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }
  }

  /* --- Dark Mode Overrides --- */
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
  [data-theme='dark'] .brutal-status.info {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .pane-actions button,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-upload-area {
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
  [data-theme='dark'] .group-pink h4 {
    color: #ff9ecf;
    text-shadow: 1px 1px 0px #eee;
  }
  [data-theme='dark'] .group-green h4 {
    color: #81e6b3;
    text-shadow: 1px 1px 0px #eee;
  }
  [data-theme='dark'] .group-blue h4 {
    color: #89b4f8;
    text-shadow: 1px 1px 0px #eee;
  }

  [data-theme='dark'] .brutal-slider,
  [data-theme='dark'] .brutal-checkbox,
  [data-theme='dark'] .brutal-color-picker {
    background: #111;
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .brutal-slider::-webkit-slider-thumb {
    border-color: #eee;
  }

  [data-theme='dark'] .thumb-pink::-webkit-slider-thumb {
    background: #b2538f;
  }
  [data-theme='dark'] .thumb-green::-webkit-slider-thumb {
    background: #3c9165;
  }
  [data-theme='dark'] .thumb-blue::-webkit-slider-thumb {
    background: #405d9e;
  }

  [data-theme='dark'] .brutal-checkbox:checked {
    background: #00994c;
  }
  [data-theme='dark'] .brutal-checkbox:checked::after {
    border-color: #eee;
  }

  [data-theme='dark'] .control-panel-content {
    background: #111;
  }

  [data-theme='dark'] .preview-container {
    background: #222;
  }
  [data-theme='dark'] .checkerboard {
    background-image:
      linear-gradient(45deg, #333 25%, transparent 25%),
      linear-gradient(135deg, #333 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #333 75%),
      linear-gradient(135deg, transparent 75%, #333 75%);
    background-color: #222;
  }

  [data-theme='dark'] .brutal-status {
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn.clear-btn {
    background: #cc0000;
    color: #fff;
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
</style>
