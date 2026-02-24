<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">PDF<span>.物理裁切()</span></h1>
        <button class="brutal-btn clear-btn" :disabled="!pdfFile" @click="clearFile">
          重置画布
        </button>
      </header>

      <div class="brutal-grid">
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span class="text-black">1. 载入目标源</span>
          </div>

          <div v-if="!pdfFile" class="brutal-upload-area" @click="triggerUpload">
            <div class="upload-text">
              <h3>[ 导入投喂材料 ]</h3>
              <p>可视化框选去除白边和水印等不需要的区域</p>
            </div>
          </div>
          <div v-else class="file-loaded-info">
            <div class="status-badge success">FILE MOUNTED</div>
            <p class="filename">{{ pdfFile.name }} ({{ totalPages }} P)</p>
            <div style="margin-top: 1rem">
              <button class="brutal-action-btn" @click="clearFile">卸载对象</button>
            </div>
          </div>
          <input ref="fileInput" type="file" hidden accept=".pdf" @change="handleFileSelect" />

          <div v-if="pdfFile" class="settings-panel param-area">
            <div
              class="pane-header bg-black"
              style="margin: 0 0 1.5rem 0; border-bottom: 4px solid #111"
            >
              <span class="text-white">2. 控制参数</span>
            </div>

            <div class="controls-content" style="padding: 0 1.5rem 1.5rem">
              <div class="crop-inputs">
                <div class="input-group">
                  <label>左极点 (pt)</label>
                  <input
                    v-model.number="cropMargins.left"
                    type="number"
                    min="0"
                    max="300"
                    class="brutal-input"
                  />
                </div>
                <div class="input-group">
                  <label>右极点 (pt)</label>
                  <input
                    v-model.number="cropMargins.right"
                    type="number"
                    min="0"
                    max="300"
                    class="brutal-input"
                  />
                </div>
                <div class="input-group">
                  <label>天顶距 (pt)</label>
                  <input
                    v-model.number="cropMargins.top"
                    type="number"
                    min="0"
                    max="300"
                    class="brutal-input"
                  />
                </div>
                <div class="input-group">
                  <label>地心距 (pt)</label>
                  <input
                    v-model.number="cropMargins.bottom"
                    type="number"
                    min="0"
                    max="300"
                    class="brutal-input"
                  />
                </div>
              </div>

              <div class="apply-scope param-box">
                <label>// 作用域覆盖层级</label>
                <div class="radio-wrap">
                  <label
                    ><input v-model="applyScope" type="radio" value="current" /> 仅单页穿透</label
                  >
                  <label><input v-model="applyScope" type="radio" value="all" /> 全局递归</label>
                </div>
              </div>

              <button
                class="brutal-action-btn action-btn primary large"
                style="margin-top: 2rem"
                :disabled="processing"
                @click="applyCrop"
              >
                {{ processing ? 'EXECUTING...' : 'COMMIT.裁切并提取' }}
              </button>
            </div>
          </div>
        </div>

        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">实时渲染沙盒</span>
          </div>

          <div v-if="pdfFile" class="preview-section">
            <div class="page-nav">
              <button
                class="brutal-btn nav-btn"
                :disabled="currentPage <= 1"
                @click="currentPage--"
              >
                &lt; PREV
              </button>
              <span class="page-indicator">[{{ currentPage }} / {{ totalPages }}]</span>
              <button
                class="brutal-btn nav-btn"
                :disabled="currentPage >= totalPages"
                @click="currentPage++"
              >
                NEXT &gt;
              </button>
            </div>

            <div ref="previewContainer" class="pdf-preview-box">
              <div ref="canvasWrapper" class="canvas-wrapper">
                <canvas ref="pdfCanvas"></canvas>

                <div
                  v-if="showCropIndicators"
                  class="crop-border crop-left"
                  :style="{ width: cropBox.left + 'px' }"
                ></div>
                <div
                  v-if="showCropIndicators"
                  class="crop-border crop-right"
                  :style="{ width: cropBox.right + 'px' }"
                ></div>
                <div
                  v-if="showCropIndicators"
                  class="crop-border crop-top"
                  :style="{ height: cropBox.top + 'px' }"
                ></div>
                <div
                  v-if="showCropIndicators"
                  class="crop-border crop-bottom"
                  :style="{ height: cropBox.bottom + 'px' }"
                ></div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state warn">
            <p>// 渲染引擎异常</p>
            <p>缺源材料输入，无法生成坐标轴</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, shallowRef, computed, watch, nextTick } from 'vue';
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
      pdfFile.value = result.file;
      loadPdf(result.file);
    }
  });
  const pdfFile = ref(null);
  const pdfBytes = ref(null);
  const pdfDocProxy = shallowRef(null);
  const totalPages = ref(0);
  const currentPage = ref(1);
  const processing = ref(false);

  const pdfCanvas = ref(null);
  const previewContainer = ref(null);
  const canvasWrapper = ref(null);

  const cropMargins = reactive({ left: 0, right: 0, top: 0, bottom: 0 });
  const applyScope = ref('all');
  const pageSize = reactive({ width: 0, height: 0 });
  let canvasScale = 1;

  const cropBox = computed(() => {
    if (pageSize.width === 0) return { left: 0, right: 0, top: 0, bottom: 0 };
    return {
      left: cropMargins.left * canvasScale,
      top: cropMargins.top * canvasScale,
      right: cropMargins.right * canvasScale,
      bottom: cropMargins.bottom * canvasScale
    };
  });

  const showCropIndicators = computed(() => {
    return (
      pdfFile.value &&
      (cropMargins.left > 0 ||
        cropMargins.right > 0 ||
        cropMargins.top > 0 ||
        cropMargins.bottom > 0)
    );
  });

  const triggerUpload = () => triggerFileInput();

  const clearFile = () => {
    pdfFile.value = null;
    pdfBytes.value = null;
    pdfDocProxy.value = null;
    totalPages.value = 0;
    currentPage.value = 1;
    resetCrop();
  };

  const resetCrop = () => {
    cropMargins.left = 0;
    cropMargins.right = 0;
    cropMargins.top = 0;
    cropMargins.bottom = 0;
  };

  const loadPdf = async file => {
    try {
      pdfFile.value = file;
      const buffer = await file.arrayBuffer();
      pdfBytes.value = new Uint8Array(buffer);

      const loadingTask = pdfjsLib.getDocument(pdfBytes.value.slice());
      pdfDocProxy.value = await loadingTask.promise;
      totalPages.value = pdfDocProxy.value.numPages;

      nextTick(() => renderPage());
    } catch (e) {
      console.error(e);
      ElMessage.error('加载 PDF 失败');
    }
  };

  const renderPage = async () => {
    if (!pdfDocProxy.value || !pdfCanvas.value) return;

    const page = await pdfDocProxy.value.getPage(currentPage.value);
    const viewport = page.getViewport({ scale: 1 });

    pageSize.width = viewport.width;
    pageSize.height = viewport.height;

    const container = previewContainer.value;
    const maxWidth = container.clientWidth - 20;
    const maxHeight = 500;
    canvasScale = Math.min(maxWidth / viewport.width, maxHeight / viewport.height);

    const scaledViewport = page.getViewport({ scale: canvasScale });
    pdfCanvas.value.width = scaledViewport.width;
    pdfCanvas.value.height = scaledViewport.height;

    await page.render({
      canvasContext: pdfCanvas.value.getContext('2d'),
      viewport: scaledViewport
    }).promise;
  };

  watch(currentPage, renderPage);

  const applyCrop = async () => {
    if (!pdfBytes.value) return;

    processing.value = true;
    try {
      const pdfDoc = await PDFDocument.load(pdfBytes.value);
      const pages = pdfDoc.getPages();

      const pagesToCrop = applyScope.value === 'all' ? pages : [pages[currentPage.value - 1]];

      for (const page of pagesToCrop) {
        const { width, height } = page.getSize();

        page.setCropBox(
          cropMargins.left,
          cropMargins.bottom,
          width - cropMargins.left - cropMargins.right,
          height - cropMargins.top - cropMargins.bottom
        );
      }

      const modifiedBytes = await pdfDoc.save();
      const blob = new Blob([modifiedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cropped_${pdfFile.value.name}`;
      a.click();
      URL.revokeObjectURL(url);

      ElMessage.success('裁剪成功');
    } catch (e) {
      console.error(e);
      ElMessage.error('裁剪失败: ' + e.message);
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
    grid-template-columns: 400px 1fr;
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
    padding: 1rem;
  }

  .crop-inputs {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  .input-group label {
    display: block;
    font-weight: bold;
    margin-bottom: 0.5rem;
    font-family: 'IBM Plex Mono', monospace;
  }
  .brutal-input {
    width: 100%;
    font-family: 'IBM Plex Mono', monospace;
    padding: 0.75rem;
    font-size: 1.1rem;
    border: 3px solid #111;
    background: #fff;
    box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.1);
    font-weight: bold;
    box-sizing: border-box;
  }

  .apply-scope label {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: bold;
    display: block;
    margin-bottom: 0.5rem;
  }
  .radio-wrap {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-family: 'IBM Plex Mono', monospace;
  }
  .radio-wrap label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-weight: normal;
    margin-bottom: 0;
    font-family: 'Noto Sans SC', sans-serif;
  }

  /* 预览和沙盒 */
  .preview-section {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
  }

  .page-nav {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
    width: 100%;
  }
  .nav-btn {
    font-size: 1rem;
    padding: 0.5rem 1rem;
  }
  .page-indicator {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: bold;
    font-size: 1.2rem;
  }

  .pdf-preview-box {
    background: #e2e8f0;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    padding: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    box-sizing: border-box;
    position: relative;
    background-image: radial-gradient(#ccc 2px, transparent 2px);
    background-size: 20px 20px;
    min-height: 50vh;
    overflow: auto;
  }

  .canvas-wrapper {
    position: relative;
    display: inline-block;
    box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.2);
    border: 2px solid #111;
  }
  .canvas-wrapper canvas {
    display: block;
  }

  .crop-border {
    position: absolute;
    background: rgba(0, 0, 0, 0.4);
    pointer-events: none;
    z-index: 2;
    transition: all 0.1s;
  }
  .crop-border.crop-left {
    left: 0;
    top: 0;
    bottom: 0;
    border-right: 3px dashed #ff4b4b;
  }
  .crop-border.crop-right {
    right: 0;
    top: 0;
    bottom: 0;
    border-left: 3px dashed #ff4b4b;
  }
  .crop-border.crop-top {
    left: 0;
    right: 0;
    top: 0;
    border-bottom: 3px dashed #ff4b4b;
  }
  .crop-border.crop-bottom {
    left: 0;
    right: 0;
    bottom: 0;
    border-top: 3px dashed #ff4b4b;
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
  [data-theme='dark'] .brutal-input {
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
  [data-theme='dark'] .brutal-input {
    box-shadow: 6px 6px 0px #eee;
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

  [data-theme='dark'] .pdf-preview-box {
    background-color: #333;
    background-image: radial-gradient(#555 2px, transparent 2px);
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .canvas-wrapper {
    border-color: #eee;
    box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.8);
  }

  [data-theme='dark'] .crop-border.crop-left,
  [data-theme='dark'] .crop-border.crop-right,
  [data-theme='dark'] .crop-border.crop-top,
  [data-theme='dark'] .crop-border.crop-bottom {
    border-color: #ff8080;
  }
</style>
