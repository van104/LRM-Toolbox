<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">PDF<span>.页码生成()</span></h1>
        <button v-if="pdfFile" class="brutal-btn clear-btn" @click="clearFile">清除文件</button>
      </header>

      <div class="brutal-grid">
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span class="text-black">1. 预览区</span>
          </div>

          <div
            v-if="!pdfFile"
            class="brutal-upload-area"
            @click="triggerUpload"
            @dragover.prevent="dragOver"
            @dragleave.prevent="dragLeave"
            @drop.prevent="handleFileDrop"
          >
            <div class="upload-text">
              <h3>[ 选择输入 PDF ]</h3>
              <p>添加自定义页码、页眉或页脚</p>
            </div>
            <input ref="fileInput" type="file" hidden accept=".pdf" @change="handleFileSelect" />
          </div>

          <div v-else class="preview-area" style="padding: 2rem; background: #fafafa">
            <div
              class="toolbar"
              style="
                margin-bottom: 1rem;
                border-bottom: 3px solid #111;
                padding-bottom: 0.5rem;
                font-family: monospace;
                font-weight: bold;
              "
            >
              <span class="file-name">当前载入: {{ pdfFile.name }} (共 {{ pageCount }} 页)</span>
            </div>
            <div class="canvas-wrapper">
              <canvas ref="previewCanvas"></canvas>
              <div class="page-number-overlay" :style="overlayStyle">
                {{ previewText }}
              </div>
            </div>
          </div>
        </div>

        <div class="brutal-pane">
          <div class="pane-header bg-black">
            <span class="text-white">2. 设置与处理</span>
          </div>

          <div v-if="pdfFile" class="settings-panel param-area" style="padding: 1.5rem">
            <div class="param-box">
              <div class="form-item">
                <label>定位锚点 (Position)</label>
                <div style="display: flex; align-items: center; gap: 1.5rem; margin-top: 0.5rem">
                  <div class="brutal-pos-grid">
                    <div
                      v-for="pos in positions"
                      :key="pos.value"
                      class="pos-box"
                      :class="{ 'is-active': config.position === pos.value }"
                      @click="config.position = pos.value"
                    >
                      <span class="dot"></span>
                    </div>
                  </div>
                  <strong style="font-family: monospace; font-size: 1.1rem">{{
                    getPositionLabel(config.position)
                  }}</strong>
                </div>
              </div>
            </div>

            <div class="param-box">
              <div class="form-item">
                <label>排版格式 (Format)</label>
                <select v-model="config.format" class="brutal-select">
                  <option value="n">1</option>
                  <option value="n_of_total">1 / N</option>
                  <option value="page_n">Page 1</option>
                  <option value="page_n_of_total">Page 1 of N</option>
                  <option value="dash_n_dash">- 1 -</option>
                </select>
              </div>
            </div>

            <div class="param-box">
              <div class="form-row">
                <div class="form-item">
                  <label>起始页码</label>
                  <input
                    v-model.number="config.startNumber"
                    type="number"
                    class="brutal-input"
                    min="1"
                  />
                </div>
                <div class="form-item">
                  <label>开始页面</label>
                  <input
                    v-model.number="config.startPage"
                    type="number"
                    class="brutal-input"
                    min="1"
                    :max="pageCount > 0 ? pageCount : 1"
                  />
                </div>
              </div>
            </div>

            <div class="param-box">
              <div class="form-item">
                <label>字体粗细度 :: {{ config.fontSize }}px</label>
                <input
                  v-model.number="config.fontSize"
                  type="range"
                  class="brutal-slider"
                  min="8"
                  max="72"
                />
              </div>
              <div class="form-item" style="margin-top: 1rem">
                <label>安全边距 (Margin) :: {{ config.margin }}px</label>
                <input
                  v-model.number="config.margin"
                  type="range"
                  class="brutal-slider"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <button
              class="brutal-action-btn action-btn primary large"
              style="margin-top: 2rem"
              :disabled="processing"
              @click="savePdf"
            >
              {{ processing ? 'COMPUTING...' : 'COMMIT.保存并下载' }}
            </button>
          </div>
          <div v-else class="empty-state warn">
            <p>// 等待数据流灌入</p>
            <p>请在左侧区域注入 PDF 数据材料</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, shallowRef, reactive, computed, nextTick } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import pdfjsLib from '@/utils/pdf';

  import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
  import { useFileHandler } from '@/composables';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const { fileInput, triggerFileInput, handleFileSelect, handleFileDrop, dragOver, dragLeave } =
    useFileHandler({
      accept: '.pdf',
      readMode: 'none',
      onSuccess: result => {
        pdfFile.value = result.file;
        loadPdf(result.file);
      }
    });

  const pdfFile = ref(null);
  const pageCount = ref(0);
  const previewCanvas = ref(null);
  const pdfDocProxy = shallowRef(null);
  const processing = ref(false);

  const config = reactive({
    position: 'bottom-center',
    format: 'n',
    startNumber: 1,
    startPage: 1,
    fontSize: 12,
    margin: 20
  });

  const positions = [
    { value: 'top-left' },
    { value: 'top-center' },
    { value: 'top-right' },
    { value: 'bottom-left' },
    { value: 'bottom-center' },
    { value: 'bottom-right' }
  ];

  const getPositionLabel = val => {
    const map = {
      'top-left': '左上角',
      'top-center': '顶部居中',
      'top-right': '右上角',
      'bottom-left': '左下角',
      'bottom-center': '底部居中',
      'bottom-right': '右下角'
    };
    return map[val];
  };

  const previewText = computed(() => {
    let text = '';
    const n = config.startNumber;
    const total = pageCount.value || 10;

    switch (config.format) {
      case 'n':
        text = `${n}`;
        break;
      case 'n_of_total':
        text = `${n} / ${total}`;
        break;
      case 'page_n':
        text = `Page ${n}`;
        break;
      case 'page_n_of_total':
        text = `Page ${n} of ${total}`;
        break;
      case 'dash_n_dash':
        text = `- ${n} -`;
        break;
    }
    return text;
  });

  const overlayStyle = computed(() => {
    const margin = `${config.margin}px`;
    const style = {
      fontSize: `${config.fontSize}px`,
      fontFamily: 'Helvetica, sans-serif',
      position: 'absolute',
      color: '#000'
    };

    const [v, h] = config.position.split('-');

    if (v === 'top') style.top = margin;
    else style.bottom = margin;

    if (h === 'left') style.left = margin;
    else if (h === 'right') style.right = margin;
    else {
      style.left = '50%';
      style.transform = 'translateX(-50%)';
    }

    return style;
  });

  const triggerUpload = () => triggerFileInput();

  const clearFile = () => {
    pdfFile.value = null;
    pageCount.value = 0;
    pdfDocProxy.value = null;
  };

  const loadPdf = async file => {
    try {
      pdfFile.value = file;
      const buffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument(new Uint8Array(buffer));
      pdfDocProxy.value = await loadingTask.promise;
      pageCount.value = pdfDocProxy.value.numPages;
      nextTick(() => renderPreviewPage());
    } catch {
      ElMessage.error('无法加载文件');
    }
  };

  const renderPreviewPage = async () => {
    if (!pdfDocProxy.value || !previewCanvas.value) return;
    const page = await pdfDocProxy.value.getPage(1);
    const viewport = page.getViewport({ scale: 0.8 });

    previewCanvas.value.width = viewport.width;
    previewCanvas.value.height = viewport.height;

    await page.render({
      canvasContext: previewCanvas.value.getContext('2d'),
      viewport
    }).promise;
  };

  const savePdf = async () => {
    if (!pdfFile.value) return;
    processing.value = true;

    try {
      const arrayBuffer = await pdfFile.value.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();

      const total = pageCount.value;

      pages.forEach((page, idx) => {
        const pageNum = idx + 1;
        if (pageNum < config.startPage) return;

        const displayNum = config.startNumber + (pageNum - config.startPage);
        let text = '';
        switch (config.format) {
          case 'n':
            text = `${displayNum}`;
            break;
          case 'n_of_total':
            text = `${displayNum} / ${total}`;
            break;
          case 'page_n':
            text = `Page ${displayNum}`;
            break;
          case 'page_n_of_total':
            text = `Page ${displayNum} of ${total}`;
            break;
          case 'dash_n_dash':
            text = `- ${displayNum} -`;
            break;
        }

        const textSize = font.widthOfTextAtSize(text, config.fontSize);
        const { width, height } = page.getSize();

        let x = 0;
        let y = 0;
        const margin = config.margin;

        const [v, h] = config.position.split('-');

        if (v === 'top') y = height - margin - config.fontSize;
        else y = margin;

        if (h === 'left') x = margin;
        else if (h === 'right') x = width - margin - textSize;
        else x = (width - textSize) / 2;

        page.drawText(text, {
          x,
          y,
          size: config.fontSize,
          font,
          color: rgb(0, 0, 0)
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `numbered_${pdfFile.value.name}`;
      a.click();
      URL.revokeObjectURL(url);
      ElMessage.success('处理完成');
    } catch (e) {
      console.error(e);
      ElMessage.error('处理失败: ' + e.message);
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
    grid-template-columns: 1fr 400px;
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
    min-height: 400px;
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
  .brutal-upload-area:hover,
  .brutal-upload-area.is-dragover {
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

  .canvas-wrapper {
    position: relative;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    background: #fff;
    display: inline-block;
  }
  .canvas-wrapper canvas {
    display: block;
    max-width: 100%;
    height: auto;
  }
  .page-number-overlay {
    pointer-events: none;
    white-space: nowrap;
    user-select: none;
    text-shadow:
      1px 1px 0px #fff,
      -1px -1px 0px #fff,
      1px -1px 0px #fff,
      -1px 1px 0px #fff;
    font-weight: bold;
    color: red !important;
  }

  /* 参数设置区 */
  .param-area {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .param-box {
    border: 4px dashed #111;
    padding: 1.5rem;
    background: #fafafa;
    margin-bottom: 1.5rem;
  }
  .form-item label {
    display: block;
    font-weight: bold;
    margin-bottom: 0.5rem;
    font-family: 'IBM Plex Mono', monospace;
  }

  .brutal-input {
    width: 100%;
    font-family: 'IBM Plex Mono', monospace;
    padding: 0.75rem;
    font-size: 1rem;
    border: 3px solid #111;
    background: #fff;
    box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.1);
    font-weight: bold;
    box-sizing: border-box;
    transition: all 0.2s;
  }
  .brutal-input:focus {
    outline: none;
    box-shadow: 6px 6px 0px #4b7bff;
    border-color: #4b7bff;
  }

  .brutal-select {
    width: 100%;
    font-family: 'IBM Plex Mono', monospace;
    padding: 0.75rem;
    font-size: 1rem;
    border: 3px solid #111;
    background: #fff;
    box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.1);
    font-weight: bold;
    box-sizing: border-box;
    transition: all 0.2s;
    cursor: pointer;
  }
  .brutal-select:focus {
    box-shadow: 6px 6px 0px #4b7bff;
    border-color: #4b7bff;
    outline: none;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .brutal-pos-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    width: 140px;
    height: 140px;
    background: #fff;
    padding: 10px;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
  }
  .pos-box {
    border: 2px solid #111;
    background: #fdfae5;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.1s;
  }
  .pos-box:hover {
    background: #ffeba0;
    transform: scale(1.05);
  }
  .pos-box.is-active {
    background: #111;
    border-color: #111;
    box-shadow: inset 0 0 0 2px #fff;
  }
  .pos-box .dot {
    display: none;
  }
  .pos-box.is-active .dot {
    display: block;
    width: 8px;
    height: 8px;
    background: #fff;
    border-radius: 0;
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
    background: #ff4b4b;
    border: 3px solid #111;
    cursor: pointer;
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
  [data-theme='dark'] .param-box,
  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .brutal-select,
  [data-theme='dark'] .brutal-upload-area {
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
  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .brutal-select {
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
  [data-theme='dark'] .brutal-input:focus,
  [data-theme='dark'] .brutal-select:focus {
    box-shadow: 6px 6px 0px #4b7bff;
    border-color: #4b7bff;
  }

  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .canvas-wrapper {
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
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

  [data-theme='dark'] .brutal-slider {
    background: #333;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-slider::-webkit-slider-thumb {
    border-color: #eee;
  }

  [data-theme='dark'] .brutal-pos-grid {
    background: #222;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .pos-box {
    background: #1a1a1a;
    border-color: #555;
  }
  [data-theme='dark'] .pos-box.is-active {
    background: #eee;
    border-color: #eee;
    box-shadow: inset 0 0 0 2px #111;
  }
  [data-theme='dark'] .pos-box.is-active .dot {
    background: #111;
  }
  [data-theme='dark'] .preview-area {
    background: #222 !important;
  }
</style>
