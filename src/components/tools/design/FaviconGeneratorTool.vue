<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">Favicon<span>.生成器()</span></h1>
        <button class="brutal-btn clear-btn" :disabled="!sourceImage" @click="generateAll">
          生成并下载
        </button>
      </header>

      <div class="brutal-grid">
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span>原始图片.UPLOAD</span>
            <div class="pane-actions">
              <button v-if="sourceImage" @click="clearSource">移除</button>
            </div>
          </div>
          <div class="pane-content upload-section">
            <div
              v-if="!sourceImage"
              class="upload-placeholder"
              :class="{ dragover: isDragOver }"
              @click="triggerUpload"
              @dragover.prevent="isDragOver = true"
              @dragleave.prevent="isDragOver = false"
              @drop.prevent="onDrop"
            >
              <div class="upload-icon">↑</div>
              <h3>点击或拖拽上传原始图片</h3>
              <p>推荐 512×512 像素正方形图片</p>
              <input ref="fileInput" type="file" hidden accept="image/*" @change="onFileSelect" />
            </div>
            <div v-else class="source-preview">
              <img :src="sourceImage" alt="Source" />
              <div class="source-info" style="margin-top: 1rem">
                尺寸: {{ sourceInfo.width }}×{{ sourceInfo.height }}
              </div>
            </div>
          </div>
        </div>

        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">预览效果.PREVIEW</span>
          </div>
          <div class="pane-content preview-section">
            <div class="preview-grid flex-row mt-2">
              <div v-for="size in previewSizes" :key="size" class="preview-item">
                <div
                  class="preview-box"
                  :style="{ width: Math.min(size, 64) + 'px', height: Math.min(size, 64) + 'px' }"
                >
                  <canvas
                    :ref="el => (canvasRefs[size] = el)"
                    :width="Math.min(size, 64)"
                    :height="Math.min(size, 64)"
                  ></canvas>
                </div>
                <span>{{ size }}×{{ size }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="brutal-toolbar" style="margin-top: 0">
        <div class="tools-left">
          <span>输出尺寸:</span>
          <div class="checkbox-group">
            <label v-for="s in allSizes" :key="s" class="brutal-checkbox">
              <input v-model="selectedSizes" type="checkbox" :value="s" />
              <span>{{ s }}×{{ s }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, computed, watch, nextTick } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { useFileHandler } from '@/composables/useFileHandler';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const { isDragOver, fileInput, onFileSelect, onDrop, triggerUpload } = useFileHandler({
    accept: 'image/*',
    readMode: 'dataURL',
    onSuccess: ({ data }) => {
      if (!data) return;
      const content = data;
      const img = new Image();
      img.onload = () => {
        sourceInfo.width = img.width;
        sourceInfo.height = img.height;
        sourceImage.value = content;
        nextTick(renderPreviews);
      };
      img.src = content;
    }
  });

  const sourceImage = ref('');
  const sourceInfo = reactive({ width: 0, height: 0 });
  const canvasRefs = reactive({});
  const allSizes = [16, 32, 48, 64, 128, 180, 192, 512];
  const selectedSizes = ref([16, 32, 180, 192]);

  const previewSizes = computed(() => {
    return [...selectedSizes.value].sort((a, b) => a - b);
  });

  const clearSource = () => {
    sourceImage.value = '';
    sourceInfo.width = 0;
    sourceInfo.height = 0;
  };

  const renderPreviews = () => {
    if (!sourceImage.value) return;
    const img = new Image();
    img.onload = () => {
      for (const size of selectedSizes.value) {
        const displaySize = Math.min(size, 64);
        const c = canvasRefs[size];
        if (c) {
          const ctx = c.getContext('2d');
          ctx.clearRect(0, 0, displaySize, displaySize);
          ctx.drawImage(img, 0, 0, displaySize, displaySize);
        }
      }
    };
    img.src = sourceImage.value;
  };

  watch(sourceImage, () => {
    if (sourceImage.value) nextTick(renderPreviews);
  });

  watch(
    selectedSizes,
    () => {
      if (sourceImage.value) nextTick(renderPreviews);
    },
    { deep: true }
  );

  const generateAll = async () => {
    if (!sourceImage.value) return;
    const img = new Image();
    await new Promise(r => {
      img.onload = r;
      img.src = sourceImage.value;
    });
    for (const size of selectedSizes.value) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      canvas.getContext('2d').drawImage(img, 0, 0, size, size);
      const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = size === 180 ? 'apple-touch-icon.png' : `favicon-${size}x${size}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    }
    ElMessage.success('生成完成');
  };
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
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

  .brutal-btn:hover:not(:disabled) {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }

  .brutal-btn:active:not(:disabled) {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-btn:disabled {
    background: #eee;
    color: #aaa;
    border-color: #aaa;
    box-shadow: 0px 0px 0px #aaa;
    cursor: not-allowed;
    transform: none;
  }

  .brutal-btn.clear-btn:not(:disabled) {
    background: #00e572;
    color: #111;
  }

  .brutal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
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

  .pane-actions button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }

  .pane-actions button:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }

  .pane-content {
    padding: 1.5rem;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .upload-section {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 280px;
  }

  .upload-placeholder {
    text-align: center;
    padding: 2rem;
    cursor: pointer;
    border: 4px dashed #111;
    background: #fff;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .upload-placeholder:hover,
  .upload-placeholder.dragover {
    background: #fdfae5;
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .upload-icon {
    font-size: 3rem;
    font-weight: 900;
    color: #111;
    margin-bottom: 1rem;
  }

  .upload-placeholder h3 {
    margin: 0 0 0.5rem;
    color: #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.5rem;
  }

  .upload-placeholder p {
    margin: 0;
    color: #111;
    font-weight: 600;
  }

  .source-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    width: 100%;
  }

  .source-preview img {
    max-width: 200px;
    max-height: 200px;
    border: 4px solid #111;
    box-shadow: 6px 6px 0px #111;
    background: #fff;
  }

  .source-info {
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
  }

  .preview-section {
    display: flex;
    flex-direction: column;
  }

  .preview-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    align-items: flex-end;
  }

  .preview-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
  }

  .preview-box {
    background: #fff;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .preview-box canvas {
    image-rendering: pixelated;
  }

  .brutal-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    border: 4px solid #111;
    padding: 1.5rem;
    margin-bottom: 2.5rem;
    box-shadow: 8px 8px 0px #111;
  }

  .tools-left {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    font-weight: 800;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.2rem;
  }

  .checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .brutal-checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
  }

  .brutal-checkbox input[type='checkbox'] {
    appearance: none;
    -webkit-appearance: none;
    width: 24px;
    height: 24px;
    border: 3px solid #111;
    background: #fff;
    box-shadow: 2px 2px 0px #111;
    cursor: pointer;
    position: relative;
    outline: none;
  }

  .brutal-checkbox input[type='checkbox']:checked {
    background: #ffd900;
  }

  .brutal-checkbox input[type='checkbox']:checked::after {
    content: '✖';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 16px;
    font-weight: bold;
    color: #111;
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
  [data-theme='dark'] .brutal-toolbar,
  [data-theme='dark'] .pane-actions button,
  [data-theme='dark'] .upload-placeholder,
  [data-theme='dark'] .source-preview img,
  [data-theme='dark'] .preview-box,
  [data-theme='dark'] .brutal-checkbox input[type='checkbox'] {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:hover:not(:disabled) {
    box-shadow: 9px 9px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:active:not(:disabled) {
    box-shadow: 0px 0px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:disabled {
    background: #333;
    color: #888;
    border-color: #888;
    box-shadow: 0px 0px 0px #888;
  }
  [data-theme='dark'] .brutal-btn.clear-btn:not(:disabled) {
    background: #00994c;
    color: #fff;
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
  [data-theme='dark'] .pane-actions button:hover {
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .pane-actions button:active {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .brutal-toolbar {
    box-shadow: 8px 8px 0px #eee;
  }

  [data-theme='dark'] .upload-placeholder:hover,
  [data-theme='dark'] .upload-placeholder.dragover {
    background: #2a2a2a;
    box-shadow: 6px 6px 0px #eee;
  }

  [data-theme='dark'] .upload-icon,
  [data-theme='dark'] .upload-placeholder h3,
  [data-theme='dark'] .upload-placeholder p {
    color: #eee;
  }

  [data-theme='dark'] .source-preview img,
  [data-theme='dark'] .preview-box {
    box-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .brutal-checkbox input[type='checkbox'] {
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .brutal-checkbox input[type='checkbox']:checked {
    background: #b28f00;
  }
  [data-theme='dark'] .brutal-checkbox input[type='checkbox']:checked::after {
    color: #fff;
  }

  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
    color: #111;
  }

  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
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
    .tools-left {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
