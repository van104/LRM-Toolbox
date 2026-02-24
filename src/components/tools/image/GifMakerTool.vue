<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <div class="header-action start">
          <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        </div>
        <h1 class="brutal-title">动态图像<span>.制造(GIF)</span></h1>
        <div class="header-action end">
          <button class="brutal-btn clear-btn" :disabled="!images.length" @click="clearAll">
            清空工作台
          </button>
        </div>
      </header>

      <div class="brutal-grid">
        <!-- Left Pane: Frames Workspace -->
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span>逐帧动画.矩阵</span>
            <div class="pane-actions">
              <span class="file-stats">总帧数: {{ images.length }} 帧</span>
              <button @click="triggerUpload">注入样本</button>
            </div>
          </div>

          <div class="control-panel-content">
            <div
              v-if="images.length === 0"
              class="brutal-upload-area"
              :class="{ 'is-dragover': isDragOver }"
              @click="triggerUpload"
              @dragover.prevent="dragOver"
              @dragleave.prevent="dragLeave"
              @drop.prevent="handleFileDrop"
            >
              <input
                ref="fileInput"
                type="file"
                multiple
                accept="image/*"
                style="display: none"
                @change="handleFileSelect"
              />
              <div class="upload-placeholder">
                <span class="upload-icon">⬇️</span>
                <p>点击或拖拽上传多层图像以作为动画帧</p>
                <small>(支持 JPG / PNG / WEBP)</small>
              </div>
            </div>

            <div v-else class="preview-scroll">
              <input
                ref="fileInput"
                type="file"
                multiple
                accept="image/*"
                style="display: none"
                @change="handleFileSelect"
              />
              <draggable
                v-model="images"
                item-key="id"
                class="brutal-card-grid"
                ghost-class="ghost"
              >
                <template #item="{ element: img, index }">
                  <div class="brutal-image-card">
                    <div class="card-thumb">
                      <img :src="img.url" />
                      <div class="frame-index">{{ index + 1 }}</div>
                      <button class="brutal-btn remove-btn" @click="removeImage(index)">❌</button>
                    </div>
                  </div>
                </template>
              </draggable>

              <div
                class="brutal-upload-area inline-upload mt-4"
                :class="{ 'is-dragover': isDragOver }"
                @click="triggerUpload"
                @dragover.prevent="dragOver"
                @dragleave.prevent="dragLeave"
                @drop.prevent="handleFileDrop"
              >
                <span class="upload-icon-small">➕</span> 追加帧序列...
              </div>
            </div>
          </div>
        </div>

        <!-- Right Pane: Controls & Preview -->
        <div class="brutal-pane">
          <div class="pane-header bg-pink">
            <span>编译选项.控制台</span>
          </div>

          <div class="settings-content">
            <div class="brutal-form-group channel-group group-pink">
              <h4>📐 几何与时钟配置</h4>

              <div class="slider-row mt-3">
                <label>画布宽度 : {{ settings.width }}px</label>
                <input
                  v-model.number="settings.width"
                  type="range"
                  :min="50"
                  :max="1920"
                  class="brutal-slider thumb-pink"
                />
              </div>

              <div class="slider-row mt-3">
                <label>画布高度 : {{ settings.height }}px</label>
                <input
                  v-model.number="settings.height"
                  type="range"
                  :min="50"
                  :max="1920"
                  class="brutal-slider thumb-pink"
                />
              </div>

              <div class="slider-row mt-3">
                <label>帧间隔 : {{ settings.delay }}ms</label>
                <input
                  v-model.number="settings.delay"
                  type="range"
                  :min="50"
                  :max="2000"
                  :step="50"
                  class="brutal-slider thumb-pink"
                />
              </div>

              <div class="slider-row mt-3">
                <label>采样质量 : {{ settings.quality }}</label>
                <input
                  v-model.number="settings.quality"
                  type="range"
                  :min="1"
                  :max="20"
                  class="brutal-slider thumb-pink"
                />
                <div class="hint-text mt-1">(越低体积越大)</div>
              </div>
            </div>

            <button
              class="brutal-btn brutal-btn-block action-btn mt-4"
              :class="{ 'is-loading': generating }"
              :disabled="images.length < 2 || generating"
              @click="generateGif"
            >
              {{ generating ? '执行流式编译中...' : '编译渲染为 GIF' }}
            </button>

            <!-- Result Box -->
            <div v-if="resultGif" class="result-box mt-4">
              <h4 class="result-title">🎯 编译完成: {{ resultSize }}</h4>
              <div class="result-img-wrapper">
                <img :src="resultGif" alt="Generated GIF" />
              </div>
              <button class="brutal-btn small-btn brutal-btn-block mt-3" @click="downloadGif">
                提取 GIF 制品
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Global Status Bar -->
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
  import { ref, reactive, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import draggable from 'vuedraggable';
  import { useFileHandler } from '@/composables';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const { fileInput, isDragOver, triggerFileInput, dragOver, dragLeave } = useFileHandler({
    accept: 'image/*',
    readMode: 'none'
  });

  const triggerUpload = () => {
    if (fileInput.value) {
      fileInput.value.click();
    } else {
      triggerFileInput();
    }
  };

  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const inputFiles = Array.from(target.files);
      addImages(inputFiles);
      target.value = '';
    }
  };

  const handleFileDrop = (event: DragEvent) => {
    dragLeave();
    if (event.dataTransfer && event.dataTransfer.files) {
      const droppedFiles = Array.from(event.dataTransfer.files).filter(f =>
        f.type.startsWith('image/')
      );
      if (droppedFiles.length > 0) {
        addImages(droppedFiles);
      }
    }
  };

  interface ImageFrame {
    id: number;
    file: File;
    url: string;
    w: number;
    h: number;
  }

  const images = ref<ImageFrame[]>([]);
  const generating = ref(false);
  const resultGif = ref<string | null>(null);
  const resultSize = ref('');
  let imageId = 0;

  const settings = reactive({
    width: 500,
    height: 500,
    delay: 500,
    quality: 10
  });

  const statusClass = computed(() => {
    if (generating.value) return 'warn';
    if (resultGif.value) return 'success';
    if (images.value.length > 0) return 'info';
    return 'info';
  });

  const statusText = computed(() => {
    if (generating.value) return '底层算力调用中 : Web Worker 正在聚合多帧光栅矩阵并编码为 GIF';
    if (resultGif.value) return '执行结束 : 流式媒体块已成功产出，等待外部提取指令';
    if (images.value.length > 0)
      return `缓冲池状态 : 当前已缓存 ${images.value.length} 个独立片段，随时准备编译`;
    return '系统休眠 : 等待第一张目标帧进入流管线';
  });

  const addImages = (files: File[]) => {
    files.forEach(f => {
      const url = URL.createObjectURL(f);
      const img = new Image();
      img.onload = () => {
        if (images.value.length === 0) {
          settings.width = img.width;
          settings.height = img.height;
        }
        images.value.push({ id: ++imageId, file: f, url, w: img.width, h: img.height });
      };
      img.src = url;
    });
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(images.value[index].url);
    images.value.splice(index, 1);
  };

  const clearAll = () => {
    images.value.forEach(i => URL.revokeObjectURL(i.url));
    images.value = [];
    resultGif.value = null;
  };

  interface GIFOptions {
    workers: number;
    quality: number;
    width: number;
    height: number;
    workerScript: string;
  }

  interface GIFEngine {
    addFrame(canvas: HTMLCanvasElement, options: { delay: number }): void;
    on(event: string, callback: (blob: Blob) => void): void;
    render(): void;
  }

  interface GlobalWithGIF extends Window {
    GIF?: new (opts: GIFOptions) => GIFEngine;
  }

  const generateGif = async () => {
    const globalWin = window as unknown as GlobalWithGIF;
    if (!globalWin.GIF) return ElMessage.error('动态图像编译库缺失，请检查网络链接');

    generating.value = true;
    try {
      const gif = new globalWin.GIF({
        workers: 2,
        quality: settings.quality,
        width: settings.width,
        height: settings.height,
        workerScript: '/lib/gif.worker.js'
      });

      for (const item of images.value) {
        const img = new Image();
        await new Promise(resolve => {
          img.onload = resolve;
          img.src = item.url;
        });

        const canvas = document.createElement('canvas');
        canvas.width = settings.width;
        canvas.height = settings.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, settings.width, settings.height);

          const scale = Math.min(settings.width / img.width, settings.height / img.height);
          const w = img.width * scale;
          const h = img.height * scale;
          const x = (settings.width - w) / 2;
          const y = (settings.height - h) / 2;

          ctx.drawImage(img, x, y, w, h);
        }

        gif.addFrame(canvas, { delay: settings.delay });
      }

      gif.on('finished', (blob: Blob) => {
        resultGif.value = URL.createObjectURL(blob);
        resultSize.value = (blob.size / 1024).toFixed(2) + ' KB';
        generating.value = false;
        ElMessage.success('GIF 引擎编译完毕');
      });

      gif.render();
    } catch (e: unknown) {
      console.error(e);
      const errorMsg = e instanceof Error ? e.message : '未知错误';
      ElMessage.error('渲染链异常崩溃: ' + errorMsg);
      generating.value = false;
    }
  };

  const downloadGif = () => {
    if (!resultGif.value) return;
    const a = document.createElement('a');
    a.href = resultGif.value;
    a.download = `animation-${Date.now()}.gif`;
    a.click();
  };

  onMounted(() => {
    const globalWin = window as unknown as GlobalWithGIF;
    if (!globalWin.GIF) {
      const script = document.createElement('script');
      script.src = '/lib/gif.js';
      document.head.appendChild(script);
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

  .brutal-btn-block {
    display: block;
    width: 100%;
    text-align: center;
    font-size: 1.25rem;
  }

  .brutal-btn.small-btn {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #111;
  }

  .brutal-btn:hover:not(:disabled) {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }

  .brutal-btn.small-btn:hover:not(:disabled) {
    box-shadow: 6px 6px 0px #111;
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
    padding: 1.25rem;
  }

  .mt-1 {
    margin-top: 0.25rem;
  }
  .mt-3 {
    margin-top: 1rem;
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
  .bg-pink {
    background: #ff6bc9;
  }
  .text-white {
    color: #fff;
  }

  .pane-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .file-stats {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.9rem;
    background: #111;
    color: #fff;
    padding: 0.35rem 0.75rem;
    font-weight: 600;
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

  .control-panel-content {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    flex: 1;
    background: #fdfdfd;
  }

  .brutal-upload-area {
    border: 4px dashed #111;
    background: #fff;
    padding: 2.5rem 1rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 400px;
  }

  .brutal-upload-area:hover,
  .brutal-upload-area.is-dragover {
    background: #ffd900;
    border-style: solid;
  }

  .brutal-upload-area.inline-upload {
    min-height: auto;
    padding: 1.5rem;
    flex-direction: row;
    gap: 10px;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
  }

  .upload-icon {
    font-size: 3rem;
    display: block;
    margin-bottom: 1rem;
  }

  .upload-icon-small {
    font-size: 1.5rem;
  }

  .upload-placeholder p {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    margin: 0 0 0.5rem 0;
  }
  .upload-placeholder small {
    font-weight: bold;
    color: #666;
  }

  .preview-scroll {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .brutal-card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.5rem;
  }

  .brutal-image-card {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 6px 6px 0px #111;
    display: flex;
    flex-direction: column;
    transition: transform 0.2s;
  }

  .brutal-image-card:hover {
    transform: translate(-2px, -2px);
    box-shadow: 8px 8px 0px #111;
  }

  .card-thumb {
    height: 180px;
    position: relative;
    background: #eee;
    overflow: hidden;
  }

  .card-thumb img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: repeating-conic-gradient(#e0e0e0 0% 25%, transparent 0% 50%) 50% / 10px 10px;
    background-color: white;
  }

  .frame-index {
    position: absolute;
    top: 0;
    left: 0;
    background: #111;
    color: #fff;
    font-weight: 800;
    padding: 0.25rem 0.75rem;
    border-right: 4px solid #111;
    border-bottom: 4px solid #111;
  }

  .remove-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 36px;
    height: 36px;
    padding: 0;
    line-height: 36px;
    text-align: center;
    border: 3px solid #111;
    background: #ff4b4b;
    color: white;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    z-index: 2;
  }

  .ghost {
    opacity: 0.5;
    transform: scale(0.95);
    background: #ffd900;
  }

  .settings-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    background: #fdfdfd;
    flex: 1;
  }

  .channel-group {
    background: #fdfae5;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    padding: 1.25rem;
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

  .slider-row {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .slider-row label {
    font-weight: 800;
    font-size: 0.95rem;
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

  .hint-text {
    font-size: 0.8rem;
    font-weight: 600;
    color: #666;
  }

  .result-box {
    border: 4px solid #111;
    background: #fff;
    padding: 1rem;
    box-shadow: 6px 6px 0px #111;
  }

  .result-title {
    margin: 0 0 1rem 0;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
  }

  .result-img-wrapper {
    background: #eee;
    padding: 1rem;
    border: 3px solid #111;
    display: flex;
    justify-content: center;
    background: repeating-conic-gradient(#e0e0e0 0% 25%, transparent 0% 50%) 50% / 10px 10px;
  }

  .result-img-wrapper img {
    max-width: 100%;
    border: 2px solid #111;
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

  @media (max-width: 1024px) {
    .brutal-grid {
      grid-template-columns: 1fr;
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
  [data-theme='dark'] .brutal-upload-area:hover,
  [data-theme='dark'] .brutal-upload-area.is-dragover {
    background: #b28f00;
    color: #fff;
  }

  [data-theme='dark'] .brutal-image-card,
  [data-theme='dark'] .result-box {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }

  [data-theme='dark'] .brutal-image-card:hover {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .card-thumb,
  [data-theme='dark'] .result-img-wrapper {
    border-color: #eee;
    background: #222;
  }
  [data-theme='dark'] .card-thumb img,
  [data-theme='dark'] .result-img-wrapper img {
    background-color: #222;
    background-image: repeating-conic-gradient(#333 0% 25%, transparent 0% 50%);
    border-color: #eee;
  }

  [data-theme='dark'] .frame-index {
    background: #eee;
    color: #111;
    border-color: #eee;
  }
  [data-theme='dark'] .remove-btn {
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
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

  [data-theme='dark'] .brutal-slider {
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

  [data-theme='dark'] .brutal-status {
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
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
  [data-theme='dark'] .brutal-btn.action-btn:disabled {
    background: #333;
    color: #888;
    border-color: #888;
  }
  [data-theme='dark'] .brutal-status.success {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .brutal-status.warn {
    background: #b28f00;
    color: #fff;
  }

  [data-theme='dark'] .file-stats {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .bg-pink {
    background: #b2538f;
    color: #fff;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
</style>
