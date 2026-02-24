<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">PDF<span>.去色处理()</span></h1>
        <button class="brutal-btn clear-btn" :disabled="!pdfFile" @click="clearFile">
          清空内存
        </button>
      </header>

      <div class="brutal-grid">
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span class="text-black">1. 载入原始图层</span>
          </div>

          <div v-if="!pdfFile" class="brutal-upload-area" @click="triggerUpload">
            <div class="upload-text">
              <h3>[ 放入色彩模块 ]</h3>
              <p>彩色渲染数据 -> 二值/单通道转换</p>
            </div>
          </div>
          <div v-else class="file-loaded-info">
            <div class="status-badge success">DATA RECEIVED</div>
            <p class="filename">{{ pdfFile.name }} ({{ totalPages }} P)</p>
            <div style="margin-top: 1rem">
              <button class="brutal-action-btn" @click="clearFile">销毁对象</button>
            </div>
          </div>
          <input ref="fileInput" type="file" hidden accept=".pdf" @change="handleFileSelect" />

          <div v-if="pdfFile" class="param-area">
            <div
              class="pane-header bg-black"
              style="margin: 0 0 1.5rem 0; border-bottom: 4px solid #111"
            >
              <span class="text-white">2. 模式切换</span>
            </div>

            <div style="padding: 0 1.5rem 1.5rem">
              <div class="options-section param-box">
                <div class="option-item">
                  <div class="radio-wrap">
                    <label
                      ><input v-model="mode" type="radio" value="grayscale" /> [灰度渲染]
                      单通道模拟</label
                    >
                    <label
                      ><input v-model="mode" type="radio" value="blackwhite" /> [纯粹黑白]
                      二值化剥离</label
                    >
                  </div>
                </div>

                <div v-if="mode === 'blackwhite'" class="option-item" style="margin-top: 1rem">
                  <label
                    class="font-mono"
                    style="font-weight: bold; display: block; margin-bottom: 0.5rem"
                    >[ T 阈值范围 ] :: {{ threshold }}</label
                  >
                  <input
                    v-model.number="threshold"
                    type="range"
                    class="brutal-slider"
                    min="0"
                    max="255"
                    @change="updatePreview"
                  />
                </div>
              </div>

              <div v-if="processing" class="progress-section" style="margin-bottom: 1.5rem">
                <p style="font-family: monospace; font-weight: bold; margin-bottom: 0.5rem">
                  RUNTIME EXECUTING...
                </p>
                <div class="brutal-progress-bar">
                  <div
                    class="fill"
                    :style="{ width: (currentPage / totalPages) * 100 + '%' }"
                  ></div>
                </div>
                <p
                  style="
                    text-align: right;
                    font-family: monospace;
                    font-weight: bold;
                    margin-top: 0.5rem;
                  "
                >
                  {{ currentPage }}/{{ totalPages }}
                </p>
              </div>

              <button
                class="brutal-action-btn action-btn primary large"
                :disabled="processing"
                @click="convertToGrayscale"
              >
                {{ processing ? 'COMPUTING...' : 'COMMIT.转换并输出' }}
              </button>
            </div>
          </div>
        </div>

        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">图形学比对视图</span>
          </div>

          <div v-if="pdfFile" class="preview-section">
            <div class="preview-box">
              <div class="preview-label">/ / INPUT VIEWPORT</div>
              <div class="canvas-wrap brutal-canvas">
                <canvas ref="originalCanvas"></canvas>
              </div>
            </div>

            <div
              class="preview-arrow font-mono"
              style="font-weight: bold; font-size: 1.5rem; letter-spacing: -2px"
            >
              ===&gt;
            </div>

            <div class="preview-box">
              <div class="preview-label">/ / OUTPUT PREVIEW</div>
              <div class="canvas-wrap brutal-canvas bg-gray">
                <canvas ref="grayscaleCanvas"></canvas>
              </div>
            </div>
          </div>

          <div v-else class="empty-state warn">
            <p>// 视图渲染失败</p>
            <p>等待目标输入，请先装载材料</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, shallowRef, watch, nextTick } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import pdfjsLib from '@/utils/pdf';
  import { PDFDocument } from 'pdf-lib';
  import { useFileHandler } from '@/composables';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const { fileInput, triggerFileInput, handleFileSelect } = useFileHandler({
    accept: '.pdf',
    readMode: 'none',
    onSuccess: result => {
      loadPdf(result.file);
    }
  });
  const pdfFile = ref(null);
  const pdfBytes = ref(null);
  const pdfDocProxy = shallowRef(null);
  const totalPages = ref(0);
  const currentPage = ref(0);
  const processing = ref(false);

  const originalCanvas = ref(null);
  const grayscaleCanvas = ref(null);

  const mode = ref('grayscale');
  const threshold = ref(128);

  const triggerUpload = () => triggerFileInput();

  const clearFile = () => {
    pdfFile.value = null;
    pdfBytes.value = null;
    pdfDocProxy.value = null;
    totalPages.value = 0;
  };

  const loadPdf = async file => {
    try {
      pdfFile.value = file;
      const buffer = await file.arrayBuffer();
      pdfBytes.value = new Uint8Array(buffer);

      const loadingTask = pdfjsLib.getDocument(pdfBytes.value.slice());
      pdfDocProxy.value = await loadingTask.promise;
      totalPages.value = pdfDocProxy.value.numPages;

      nextTick(() => renderPreview());
    } catch (e) {
      console.error(e);
      ElMessage.error('加载 PDF 失败');
    }
  };

  const renderPreview = async () => {
    if (!pdfDocProxy.value || !originalCanvas.value) return;

    const page = await pdfDocProxy.value.getPage(1);
    const viewport = page.getViewport({ scale: 0.5 });

    originalCanvas.value.width = viewport.width;
    originalCanvas.value.height = viewport.height;
    await page.render({
      canvasContext: originalCanvas.value.getContext('2d'),
      viewport
    }).promise;

    updatePreview();
  };

  const updatePreview = () => {
    if (!originalCanvas.value || !grayscaleCanvas.value) return;

    const origCtx = originalCanvas.value.getContext('2d');
    const grayCtx = grayscaleCanvas.value.getContext('2d');

    grayscaleCanvas.value.width = originalCanvas.value.width;
    grayscaleCanvas.value.height = originalCanvas.value.height;

    const imageData = origCtx.getImageData(
      0,
      0,
      originalCanvas.value.width,
      originalCanvas.value.height
    );
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

      if (mode.value === 'blackwhite') {
        const bw = gray > threshold.value ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = bw;
      } else {
        data[i] = data[i + 1] = data[i + 2] = gray;
      }
    }

    grayCtx.putImageData(imageData, 0, 0);
  };

  watch(mode, updatePreview);

  const convertToGrayscale = async () => {
    if (!pdfDocProxy.value) return;

    processing.value = true;
    currentPage.value = 0;

    try {
      const newPdf = await PDFDocument.create();
      const scale = 2;

      for (let pageNum = 1; pageNum <= totalPages.value; pageNum++) {
        currentPage.value = pageNum;

        const page = await pdfDocProxy.value.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        await page.render({ canvasContext: ctx, viewport }).promise;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

          if (mode.value === 'blackwhite') {
            const bw = gray > threshold.value ? 255 : 0;
            data[i] = data[i + 1] = data[i + 2] = bw;
          } else {
            data[i] = data[i + 1] = data[i + 2] = gray;
          }
        }

        ctx.putImageData(imageData, 0, 0);

        const jpegData = canvas.toDataURL('image/jpeg', 0.92);
        const jpegBytes = await fetch(jpegData).then(r => r.arrayBuffer());
        const jpgImage = await newPdf.embedJpg(jpegBytes);

        const origViewport = page.getViewport({ scale: 1 });
        const newPage = newPdf.addPage([origViewport.width, origViewport.height]);
        newPage.drawImage(jpgImage, {
          x: 0,
          y: 0,
          width: origViewport.width,
          height: origViewport.height
        });
      }

      const pdfBytesOut = await newPdf.save();
      const blob = new Blob([pdfBytesOut], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grayscale_${pdfFile.value.name}`;
      a.click();
      URL.revokeObjectURL(url);

      ElMessage.success('转换成功');
    } catch (e) {
      console.error(e);
      ElMessage.error('转换失败: ' + e.message);
    } finally {
      processing.value = false;
    }
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
    max-width: 1400px;
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

    flex: 1;
    text-align: center;
  }

  .brutal-title span {
    color: #4b7bff;
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
    background: #ccc;
    cursor: not-allowed;
    opacity: 0.7;
  }
  .brutal-btn.clear-btn {
    background: #ff4b4b;
    color: #fff;
  }

  .brutal-grid {
    display: grid;
    grid-template-columns: 450px 1fr;
    gap: 2.5rem;
    margin-bottom: 2rem;
  }

  .brutal-pane {
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
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
  .bg-black {
    background: #111;
  }
  .text-white {
    color: #fff;
  }
  .text-black {
    color: #111;
  }
  .font-mono {
    font-family: 'IBM Plex Mono', monospace;
  }

  .brutal-upload-area {
    min-height: 250px;
    margin: 2rem;
    border: 4px dashed #111;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    background: #fdfae5;
    cursor: pointer;
    transition: all 0.2s;
  }
  .brutal-upload-area:hover {
    background: #ffeba0;
    transform: scale(1.02);
  }

  .upload-text h3 {
    font-family: 'Syne', sans-serif;
    font-size: 1.3rem;
    font-weight: 800;
    margin-bottom: 1rem;
  }
  .upload-text p {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.95rem;
    color: #555;
    padding: 0 1rem;
  }

  .file-loaded-info {
    min-height: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem;
    background: #fdfae5;
  }
  .status-badge {
    background: #111;
    color: #fff;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: bold;
    padding: 0.2rem 1rem;
    margin-bottom: 1rem;
    letter-spacing: 2px;
  }
  .status-badge.success {
    background: #00e572;
    color: #111;
  }

  .file-loaded-info .filename {
    font-weight: bold;
    font-size: 1.2rem;
    background: #fff;
    border: 3px solid #111;
    padding: 0.5rem 1rem;
    box-shadow: 4px 4px 0px #111;
    margin-bottom: 0.5rem;
    word-break: break-all;
  }

  .brutal-action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.6rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
    text-transform: uppercase;
    margin: 0;
    width: 100%;
  }
  .brutal-action-btn:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }
  .brutal-action-btn:active:not(:disabled) {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px #111;
  }
  .brutal-action-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
    box-shadow: 4px 4px 0px #666;
    border-color: #666;
  }
  .brutal-action-btn.primary {
    background: #ffd900;
  }
  .brutal-action-btn.large {
    padding: 1.25rem 3rem;
    font-size: 1.25rem;
    letter-spacing: 1px;
  }

  /* 控制栏 */
  .param-area {
    flex: 1;
    border-top: 4px solid #111;
    background: #fff;
    display: flex;
    flex-direction: column;
  }
  .param-box {
    border: 3px solid #111;
    padding: 1.5rem;
    margin-bottom: 2rem;
    background: #fafafa;
  }

  .radio-wrap {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    font-family: 'IBM Plex Mono', monospace;
  }
  .radio-wrap label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-weight: bold;
    margin-bottom: 0;
    font-family: 'Noto Sans SC', sans-serif;
  }

  .brutal-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 12px;
    background: #fff;
    border: 2px solid #111;
    outline: none;
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

  .progress-section {
    border: 3px solid #111;
    background: #fff;
    box-shadow: 4px 4px 0px #111;
  }
  .brutal-progress-bar {
    width: 100%;
    height: 20px;
    border: 3px solid #111;
    background: #eee;
    box-sizing: border-box;
  }
  .brutal-progress-bar .fill {
    height: 100%;
    background: #00e572;
    transition: width 0.3s;
    border-right: 3px solid #111;
  }

  /* 预览和沙盒 */
  .preview-section {
    padding: 4rem 2rem;
    display: flex;
    align-items: center;
    flex: 1;
    flex-direction: row;
    justify-content: space-around;
    background: #fafafa;
    background-image: radial-gradient(#e2e8f0 2px, transparent 2px);
    background-size: 20px 20px;
  }

  .preview-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  .preview-label {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: bold;
    font-size: 1.1rem;
    background: #111;
    color: #fff;
    padding: 0.2rem 1rem;
  }

  .canvas-wrap {
    position: relative;
    display: inline-block;
    padding: 10px;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
  }
  .canvas-wrap canvas {
    max-width: 250px;
    display: block;
    border: 2px solid #111;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 1;
    min-height: 400px;
    font-family: 'IBM Plex Mono', monospace;
  }
  .empty-state p {
    margin: 0.5rem 0;
    color: #555;
  }
  .empty-state.warn p {
    font-weight: bold;
    color: #cc0000;
  }

  @media (max-width: 1024px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .brutal-title {
      font-size: 2.5rem;
    }
    .preview-section {
      flex-direction: column;
      gap: 2rem;
    }
    .preview-arrow {
      transform: rotate(90deg);
    }
  }

  /* --- Dark Mode Overrides --- */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .param-area,
  [data-theme='dark'] .param-box,
  [data-theme='dark'] .preview-section {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }

  [data-theme='dark'] .pane-header {
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .progress-section {
    box-shadow: 6px 6px 0px #eee;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-btn:hover:not(:disabled),
  [data-theme='dark'] .brutal-action-btn:hover:not(:disabled) {
    box-shadow: 9px 9px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:active:not(:disabled),
  [data-theme='dark'] .brutal-action-btn:active:not(:disabled) {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0px #eee;
  }

  [data-theme='dark'] .brutal-upload-area {
    background: #222;
    border-color: #eee;
  }
  [data-theme='dark'] .file-loaded-info {
    background: #222;
  }
  [data-theme='dark'] .file-loaded-info .filename {
    background: #1a1a1a;
    color: #eee;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-action-btn.primary {
    background: #b28f00;
    color: #fff;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-btn.clear-btn,
  [data-theme='dark'] .bg-danger {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .status-badge.success {
    background: #00994c;
    color: #fff;
  }

  [data-theme='dark'] .preview-label {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .canvas-wrap {
    background: #333;
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .canvas-wrap canvas {
    border-color: #eee;
  }

  [data-theme='dark'] .brutal-slider {
    background: #333;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-slider::-webkit-slider-thumb {
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-progress-bar {
    background: #333;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-progress-bar .fill {
    border-color: #eee;
  }
</style>
