<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <div class="header-action start">
          <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        </div>
        <h1 class="brutal-title">色散效果<span>.模拟()</span></h1>
        <div class="header-action end">
          <button class="brutal-btn clear-btn" @click="resetFilters">重置参数</button>
        </div>
      </header>

      <div class="brutal-grid">
        <!-- Left Pane: Controls -->
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span>色彩分离.控制台</span>
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
                <p>点击或拖拽上传需要处理的图片</p>
              </div>
              <div v-else class="preview-thumbnail">
                <img :src="imageUrl" alt="Preview" />
                <button class="brutal-btn small-btn" @click.stop="triggerUpload">更换图片</button>
              </div>
            </div>

            <!-- Red Channel -->
            <div class="brutal-form-group channel-group group-red">
              <h4>🔴 红色通道偏移 (Red)</h4>
              <div class="slider-row">
                <label>X : {{ redX }}</label>
                <input
                  v-model.number="redX"
                  type="range"
                  min="-50"
                  max="50"
                  class="brutal-slider thumb-red"
                />
              </div>
              <div class="slider-row">
                <label>Y : {{ redY }}</label>
                <input
                  v-model.number="redY"
                  type="range"
                  min="-50"
                  max="50"
                  class="brutal-slider thumb-red"
                />
              </div>
            </div>

            <!-- Green Channel -->
            <div class="brutal-form-group channel-group group-green">
              <h4>🟢 绿色通道偏移 (Green)</h4>
              <div class="slider-row">
                <label>X : {{ greenX }}</label>
                <input
                  v-model.number="greenX"
                  type="range"
                  min="-50"
                  max="50"
                  class="brutal-slider thumb-green"
                />
              </div>
              <div class="slider-row">
                <label>Y : {{ greenY }}</label>
                <input
                  v-model.number="greenY"
                  type="range"
                  min="-50"
                  max="50"
                  class="brutal-slider thumb-green"
                />
              </div>
            </div>

            <!-- Blue Channel -->
            <div class="brutal-form-group channel-group group-blue">
              <h4>🔵 蓝色通道偏移 (Blue)</h4>
              <div class="slider-row">
                <label>X : {{ blueX }}</label>
                <input
                  v-model.number="blueX"
                  type="range"
                  min="-50"
                  max="50"
                  class="brutal-slider thumb-blue"
                />
              </div>
              <div class="slider-row">
                <label>Y : {{ blueY }}</label>
                <input
                  v-model.number="blueY"
                  type="range"
                  min="-50"
                  max="50"
                  class="brutal-slider thumb-blue"
                />
              </div>
            </div>

            <div class="brutal-form-group checkbox-group" style="margin-top: 10px">
              <label class="brutal-checkbox-label">
                <input v-model="keepBounds" type="checkbox" class="brutal-checkbox" />
                保持图像边缘 (不扩张溢出)
              </label>
            </div>
          </div>
        </div>

        <!-- Right Pane: Preview -->
        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">效果渲染.视野</span>
          </div>

          <div class="preview-container">
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
              <span v-for="i in 10" :key="i">图像已加载 : 色散重组系统持续运算中 // &nbsp;</span>
            </span>
            <span v-else>
              <span v-for="i in 10" :key="i"
                >系统待命中 : 等待图像载入以投射红绿蓝光谱偏移 // &nbsp;</span
              >
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';

  const router = useRouter();

  const fileInput = ref<HTMLInputElement | null>(null);
  const canvasRef = ref<HTMLCanvasElement | null>(null);
  const imageUrl = ref('');
  const imageObj = ref<HTMLImageElement | null>(null);

  // Offsets
  const redX = ref(5);
  const redY = ref(0);
  const greenX = ref(0);
  const greenY = ref(0);
  const blueX = ref(-5);
  const blueY = ref(0);
  const keepBounds = ref(true);

  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const resetFilters = () => {
    redX.value = 5;
    redY.value = 0;
    greenX.value = 0;
    greenY.value = 0;
    blueX.value = -5;
    blueY.value = 0;
    keepBounds.value = true;
  };

  const triggerUpload = () => fileInput.value?.click();

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
        applyEffect();
      };
      img.src = imageUrl.value;
    };
    reader.readAsDataURL(file);
  };

  const applyEffect = () => {
    if (!canvasRef.value || !imageObj.value) return;

    const canvas = canvasRef.value;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageObj.value;

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);

    const width = canvas.width;
    const height = canvas.height;

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const newImageData = ctx.createImageData(width, height);
    const newData = newImageData.data;

    const rX = redX.value;
    const rY = redY.value;
    const gX = greenX.value;
    const gY = greenY.value;
    const bX = blueX.value;
    const bY = blueY.value;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;

        const srcRx = x - rX;
        const srcRy = y - rY;

        const srcGx = x - gX;
        const srcGy = y - gY;

        const srcBx = x - bX;
        const srcBy = y - bY;

        if (srcRx >= 0 && srcRx < width && srcRy >= 0 && srcRy < height) {
          const srcIndex = (srcRy * width + srcRx) * 4;
          newData[index] = data[srcIndex];
        } else {
          newData[index] = 0;
        }

        if (srcGx >= 0 && srcGx < width && srcGy >= 0 && srcGy < height) {
          const srcIndex = (srcGy * width + srcGx) * 4;
          newData[index + 1] = data[srcIndex + 1];
        } else {
          newData[index + 1] = 0;
        }

        if (srcBx >= 0 && srcBx < width && srcBy >= 0 && srcBy < height) {
          const srcIndex = (srcBy * width + srcBx) * 4;
          newData[index + 2] = data[srcIndex + 2];
        } else {
          newData[index + 2] = 0;
        }

        if (keepBounds.value) {
          newData[index + 3] = data[index + 3];
        } else {
          let a = 0;
          if (srcRx >= 0 && srcRx < width && srcRy >= 0 && srcRy < height)
            a = Math.max(a, data[(srcRy * width + srcRx) * 4 + 3]);
          if (srcGx >= 0 && srcGx < width && srcGy >= 0 && srcGy < height)
            a = Math.max(a, data[(srcGy * width + srcGx) * 4 + 3]);
          if (srcBx >= 0 && srcBx < width && srcBy >= 0 && srcBy < height)
            a = Math.max(a, data[(srcBy * width + srcBx) * 4 + 3]);
          newData[index + 3] = a;
        }
      }
    }

    ctx.putImageData(newImageData, 0, 0);
  };

  const downloadImage = () => {
    if (!canvasRef.value) return;
    const link = document.createElement('a');
    link.download = 'aberration-effect.png';
    link.href = canvasRef.value.toDataURL('image/png');
    link.click();
  };

  watch([redX, redY, greenX, greenY, blueX, blueY, keepBounds], () => {
    if (imageObj.value) {
      requestAnimationFrame(applyEffect);
    }
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
    max-height: 200px;
    border: 4px solid #111;
    box-shadow: 6px 6px 0px #111;
    margin-bottom: 1rem;
    display: block;
    margin: 0 auto 1.5rem auto;
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

  .group-red h4 {
    color: #ff4b4b;
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

  .slider-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.75rem;
  }

  .slider-row label {
    font-weight: 800;
    width: 60px;
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

  .thumb-red::-webkit-slider-thumb {
    background: #ff4b4b;
  }
  .thumb-green::-webkit-slider-thumb {
    background: #00e572;
  }
  .thumb-blue::-webkit-slider-thumb {
    background: #4b7bff;
  }

  .checkbox-group {
    margin-top: 0.5rem;
  }

  .brutal-checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace !important;
    font-weight: 600 !important;
    text-transform: none !important;
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

  .preview-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0;
    position: relative;
    background: #f8fafc;
    background-image:
      linear-gradient(#eee 1px, transparent 1px), linear-gradient(90deg, #eee 1px, transparent 1px);
    background-size: 20px 20px;
  }

  .empty-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    color: #888;
    font-style: italic;
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
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    background: #fff;
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
  .brutal-status.error {
    background: #ff4b4b;
    color: white;
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

  [data-theme='dark'] .brutal-btn {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn.small-btn {
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 9px 9px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn.small-btn:hover {
    box-shadow: 7px 7px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane:hover {
    box-shadow: 16px 16px 0px #eee;
  }

  [data-theme='dark'] .pane-actions button {
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .pane-actions button:hover:not(:disabled) {
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .pane-actions button:active:not(:disabled) {
    box-shadow: 0px 0px 0px #eee;
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
  [data-theme='dark'] .group-red h4 {
    color: #ff9fb2;
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

  [data-theme='dark'] .brutal-slider {
    background: #111;
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .brutal-slider::-webkit-slider-thumb {
    border-color: #eee;
  }
  [data-theme='dark'] .thumb-red::-webkit-slider-thumb {
    background: #b25465;
  }
  [data-theme='dark'] .thumb-green::-webkit-slider-thumb {
    background: #3c9165;
  }
  [data-theme='dark'] .thumb-blue::-webkit-slider-thumb {
    background: #405d9e;
  }

  [data-theme='dark'] .brutal-checkbox {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
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
    background-image:
      linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px);
  }

  [data-theme='dark'] .canvas-wrapper canvas {
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
  }

  [data-theme='dark'] .brutal-status {
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
  }

  [data-theme='dark'] .brutal-btn.clear-btn {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .brutal-status.error {
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
