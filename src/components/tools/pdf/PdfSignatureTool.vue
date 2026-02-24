<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">PDF<span>.电子签名()</span></h1>
      </header>

      <div v-if="!pdfFile" class="brutal-pane">
        <div class="pane-header bg-yellow"><span>1. 载入 PDF</span></div>
        <div class="brutal-upload-area" @click="triggerUpload">
          <div class="upload-text">
            <h3>[ 选择 PDF 添加签名 ]</h3>
            <p>手写绘制或上传签名图片</p>
          </div>
        </div>
      </div>

      <div v-else>
        <div class="file-badge">
          <strong>{{ pdfFile.name }}</strong> <span>({{ totalPages }} 页)</span>
          <button
            class="brutal-action-btn"
            style="padding: 0.2rem 0.8rem; font-size: 0.85rem; margin-left: auto"
            @click="clearFile"
          >
            移除
          </button>
        </div>

        <div class="brutal-grid">
          <!-- Preview -->
          <div class="brutal-pane">
            <div class="pane-header bg-blue">
              <span class="text-white">PDF 预览</span>
              <div class="pane-actions">
                <button :disabled="currentPage <= 1" @click="currentPage--">上一页</button>
                <span style="color: #fff; font-size: 0.9rem"
                  >{{ currentPage }}/{{ totalPages }}</span
                >
                <button :disabled="currentPage >= totalPages" @click="currentPage++">下一页</button>
              </div>
            </div>
            <div ref="previewContainer" class="preview-area" @click="handlePreviewClick">
              <canvas ref="pdfCanvas"></canvas>
              <div
                v-if="signaturePosition"
                class="sig-overlay"
                :style="{ left: signaturePosition.x + 'px', top: signaturePosition.y + 'px' }"
              >
                <img :src="signatureDataUrl" alt="sig" />
                <button class="sig-remove" @click.stop="removeSignature">✕</button>
              </div>
            </div>
          </div>

          <!-- Signature Panel -->
          <div class="brutal-pane">
            <div class="pane-header bg-yellow"><span>签名区域</span></div>
            <div class="pane-body">
              <div class="tab-switch">
                <button
                  class="brutal-action-btn"
                  :class="{ primary: signatureTab === 'draw' }"
                  @click="signatureTab = 'draw'"
                >
                  手写绘制
                </button>
                <button
                  class="brutal-action-btn"
                  :class="{ primary: signatureTab === 'upload' }"
                  @click="signatureTab = 'upload'"
                >
                  上传图片
                </button>
              </div>

              <div v-if="signatureTab === 'draw'" class="draw-section">
                <canvas
                  ref="drawCanvas"
                  class="draw-canvas"
                  @mousedown="startDraw"
                  @mousemove="draw"
                  @mouseup="endDraw"
                  @mouseleave="endDraw"
                  @touchstart="startDrawTouch"
                  @touchmove="drawTouch"
                  @touchend="endDraw"
                ></canvas>
                <div class="draw-actions">
                  <button class="brutal-action-btn" @click="clearDraw">清除</button>
                  <button class="brutal-action-btn primary" @click="confirmDraw">确认签名</button>
                </div>
              </div>

              <div
                v-if="signatureTab === 'upload'"
                class="upload-sig-area"
                @click="triggerSignatureUpload"
              >
                <p>[ 点击上传签名图片 ]</p>
                <input
                  ref="signatureFileInput"
                  type="file"
                  hidden
                  accept="image/*"
                  @change="handleSignatureSelect"
                />
              </div>

              <div v-if="signatureDataUrl" class="sig-preview-box">
                <p>当前签名：</p>
                <img :src="signatureDataUrl" alt="签名预览" />
                <p class="hint">点击左侧 PDF 预览图放置签名</p>
              </div>
            </div>
          </div>
        </div>

        <button
          class="brutal-action-btn primary large"
          :disabled="!signaturePosition || !signatureDataUrl || processing"
          @click="applySignature"
        >
          {{ processing ? 'SIGNING...' : 'COMMIT.应用签名并下载' }}
        </button>
      </div>

      <input ref="fileInput" type="file" hidden accept=".pdf" @change="handleFileSelect" />
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
    onSuccess: r => {
      pdfFile.value = r.file;
      loadPdf(r.file);
    }
  });
  const {
    fileInput: signatureFileInput,
    triggerFileInput: triggerSignatureUpload,
    handleFileSelect: handleSignatureSelect
  } = useFileHandler({
    accept: 'image/*',
    readMode: 'dataURL',
    onSuccess: r => {
      signatureDataUrl.value = r.data;
      ElMessage.success('签名图片已加载');
    }
  });

  const pdfBytes = ref(null);
  const pdfDocProxy = shallowRef(null);
  const totalPages = ref(0);
  const currentPage = ref(1);
  const processing = ref(false);
  const pdfCanvas = ref(null);
  const drawCanvas = ref(null);
  const previewContainer = ref(null);
  const signatureTab = ref('draw');
  const signatureDataUrl = ref('');
  const signaturePosition = ref(null);
  let isDrawing = false;
  let drawCtx = null;
  let canvasScale = 1;
  const triggerUpload = () => triggerFileInput();
  const pdfFile = ref(null);

  const clearFile = () => {
    pdfFile.value = null;
    pdfBytes.value = null;
    pdfDocProxy.value = null;
    totalPages.value = 0;
    currentPage.value = 1;
    signaturePosition.value = null;
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
    const container = previewContainer.value;
    const maxWidth = container.clientWidth - 20;
    const maxHeight = 500;
    canvasScale = Math.min(maxWidth / viewport.width, maxHeight / viewport.height);
    const sv = page.getViewport({ scale: canvasScale });
    pdfCanvas.value.width = sv.width;
    pdfCanvas.value.height = sv.height;
    await page.render({ canvasContext: pdfCanvas.value.getContext('2d'), viewport: sv }).promise;
  };

  watch(currentPage, () => {
    signaturePosition.value = null;
    renderPage();
  });

  const initDrawCanvas = () => {
    if (drawCanvas.value && !drawCtx) {
      drawCanvas.value.width = 300;
      drawCanvas.value.height = 150;
      drawCtx = drawCanvas.value.getContext('2d');
      drawCtx.strokeStyle = '#1e293b';
      drawCtx.lineWidth = 2;
      drawCtx.lineCap = 'round';
    }
  };

  watch(drawCanvas, v => {
    if (v) nextTick(initDrawCanvas);
  });
  watch(pdfFile, v => {
    if (v) nextTick(() => setTimeout(initDrawCanvas, 100));
  });

  const startDraw = e => {
    initDrawCanvas();
    if (!drawCtx) return;
    isDrawing = true;
    drawCtx.beginPath();
    drawCtx.moveTo(e.offsetX, e.offsetY);
  };
  const draw = e => {
    if (!isDrawing || !drawCtx) return;
    drawCtx.lineTo(e.offsetX, e.offsetY);
    drawCtx.stroke();
  };
  const endDraw = () => {
    isDrawing = false;
  };
  const startDrawTouch = e => {
    initDrawCanvas();
    if (!drawCtx || !drawCanvas.value) return;
    e.preventDefault();
    const t = e.touches[0];
    const r = drawCanvas.value.getBoundingClientRect();
    isDrawing = true;
    drawCtx.beginPath();
    drawCtx.moveTo(t.clientX - r.left, t.clientY - r.top);
  };
  const drawTouch = e => {
    if (!isDrawing || !drawCtx || !drawCanvas.value) return;
    e.preventDefault();
    const t = e.touches[0];
    const r = drawCanvas.value.getBoundingClientRect();
    drawCtx.lineTo(t.clientX - r.left, t.clientY - r.top);
    drawCtx.stroke();
  };
  const clearDraw = () => {
    if (!drawCtx || !drawCanvas.value) return;
    drawCtx.clearRect(0, 0, drawCanvas.value.width, drawCanvas.value.height);
    signatureDataUrl.value = '';
  };
  const confirmDraw = () => {
    if (!drawCanvas.value) return;
    signatureDataUrl.value = drawCanvas.value.toDataURL('image/png');
    ElMessage.success('签名已确认');
  };
  const handlePreviewClick = e => {
    if (!signatureDataUrl.value) {
      ElMessage.warning('请先创建或上传签名');
      return;
    }
    const rect = pdfCanvas.value.getBoundingClientRect();
    signaturePosition.value = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      page: currentPage.value
    };
  };
  const removeSignature = () => {
    signaturePosition.value = null;
  };

  const applySignature = async () => {
    if (!pdfBytes.value || !signatureDataUrl.value || !signaturePosition.value) return;
    processing.value = true;
    try {
      const pdfDoc = await PDFDocument.load(pdfBytes.value);
      const pngImageBytes = await fetch(signatureDataUrl.value).then(res => res.arrayBuffer());
      const pngImage = await pdfDoc.embedPng(pngImageBytes);
      const page = pdfDoc.getPages()[signaturePosition.value.page - 1];
      const { height } = page.getSize();
      const sigWidth = 100;
      const sigHeight = 50;
      const pdfX = signaturePosition.value.x / canvasScale;
      const pdfY = height - signaturePosition.value.y / canvasScale - sigHeight;
      page.drawImage(pngImage, { x: pdfX, y: pdfY, width: sigWidth, height: sigHeight });
      const mb = await pdfDoc.save();
      const blob = new Blob([mb], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `signed_${pdfFile.value.name}`;
      a.click();
      URL.revokeObjectURL(url);
      ElMessage.success('签名应用成功');
    } catch (e) {
      console.error(e);
      ElMessage.error('应用签名失败: ' + e.message);
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
    text-shadow: 4px 4px 0 #111;
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
    box-shadow: 6px 6px 0 #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }
  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0 #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0 0 0 #111;
  }
  .brutal-pane {
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0 #111;
    margin-bottom: 2rem;
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
  .pane-body {
    padding: 2rem;
  }
  .pane-actions {
    display: flex;
    gap: 0.75rem;
  }
  .pane-actions button {
    background: #fff;
    color: #111;
    border: 3px solid #111;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    font-size: 0.9rem;
    padding: 0.35rem 0.75rem;
    cursor: pointer;
    box-shadow: 3px 3px 0 #111;
    transition: all 0.1s;
  }
  .pane-actions button:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0 #111;
  }
  .pane-actions button:active:not(:disabled) {
    transform: translate(3px, 3px);
    box-shadow: 0 0 0 #111;
  }
  .pane-actions button:disabled {
    background: #eee;
    color: #aaa;
    border-color: #aaa;
    box-shadow: 2px 2px 0 #aaa;
    cursor: not-allowed;
  }
  .brutal-upload-area {
    min-height: 300px;
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
    font-size: 0.95rem;
    color: #555;
  }
  .file-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #fff;
    border: 3px solid #111;
    padding: 0.75rem 1rem;
    box-shadow: 4px 4px 0 #111;
    margin-bottom: 2rem;
    word-break: break-all;
    flex-wrap: wrap;
    font-family: 'IBM Plex Mono', monospace;
  }
  .file-badge strong {
    font-size: 1.1rem;
  }
  .file-badge span {
    color: #666;
  }
  .brutal-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2.5rem;
    margin-bottom: 2rem;
  }
  .brutal-action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.6rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 4px 4px 0 #111;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
    text-transform: uppercase;
  }
  .brutal-action-btn.primary {
    background: #ffd900;
  }
  .brutal-action-btn:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #111;
  }
  .brutal-action-btn:active:not(:disabled) {
    transform: translate(4px, 4px);
    box-shadow: 0 0 0 #111;
  }
  .brutal-action-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
    box-shadow: 4px 4px 0 #666;
    border-color: #666;
  }
  .brutal-action-btn.large {
    padding: 1.25rem 3rem;
    font-size: 1.25rem;
    letter-spacing: 1px;
    width: 100%;
    margin-bottom: 2rem;
  }
  .preview-area {
    background: #eee;
    padding: 10px;
    position: relative;
    overflow: hidden;
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: crosshair;
  }
  .preview-area canvas {
    max-width: 100%;
    box-shadow: 4px 4px 0 #111;
    border: 2px solid #111;
  }
  .sig-overlay {
    position: absolute;
    border: 3px dashed #4b7bff;
    padding: 4px;
    background: rgba(255, 255, 255, 0.9);
    cursor: move;
  }
  .sig-overlay img {
    max-width: 100px;
    max-height: 50px;
    display: block;
  }
  .sig-remove {
    position: absolute;
    top: -12px;
    right: -12px;
    width: 24px;
    height: 24px;
    border: 3px solid #111;
    background: #ff4b4b;
    color: #fff;
    font-weight: 800;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    box-shadow: 2px 2px 0 #111;
  }
  .tab-switch {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  .draw-section {
    text-align: center;
  }
  .draw-canvas {
    border: 3px solid #111;
    background: #fff;
    touch-action: none;
    display: block;
    margin: 0 auto;
  }
  .draw-actions {
    margin-top: 0.75rem;
    display: flex;
    gap: 0.75rem;
    justify-content: center;
  }
  .upload-sig-area {
    border: 4px dashed #111;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    background: #fdfae5;
    transition: all 0.2s;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
  }
  .upload-sig-area:hover {
    background: #ffeba0;
  }
  .sig-preview-box {
    margin-top: 1.5rem;
    text-align: center;
    padding: 1rem;
    background: #fafafa;
    border: 3px solid #111;
  }
  .sig-preview-box img {
    max-width: 150px;
    max-height: 60px;
    border: 2px solid #111;
  }
  .hint {
    font-size: 0.85rem;
    color: #555;
    margin-top: 0.5rem;
  }
  @media (max-width: 1024px) {
    .brutal-title {
      font-size: 2.5rem;
    }
    .brutal-header {
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }
    .brutal-grid {
      grid-template-columns: 1fr;
    }
  }
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-upload-area,
  [data-theme='dark'] .file-badge,
  [data-theme='dark'] .upload-sig-area,
  [data-theme='dark'] .sig-preview-box,
  [data-theme='dark'] .pane-actions button,
  [data-theme='dark'] .draw-canvas {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn {
    box-shadow: 6px 6px 0 #eee;
  }
  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 9px 9px 0 #eee;
  }
  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0 #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0 #eee;
  }
  [data-theme='dark'] .brutal-action-btn {
    box-shadow: 4px 4px 0 #eee;
  }
  [data-theme='dark'] .brutal-action-btn:hover:not(:disabled) {
    box-shadow: 6px 6px 0 #eee;
  }
  [data-theme='dark'] .brutal-action-btn.primary {
    background: #b28f00;
    color: #fff;
    border-color: #eee;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .pane-body {
    background: #1a1a1a;
  }
  [data-theme='dark'] .preview-area {
    background: #333;
  }
  [data-theme='dark'] .preview-area canvas {
    box-shadow: 4px 4px 0 #eee;
    border-color: #eee;
  }
  [data-theme='dark'] .file-badge {
    box-shadow: 4px 4px 0 #eee;
  }
  [data-theme='dark'] .pane-actions button {
    box-shadow: 3px 3px 0 #eee;
  }
  [data-theme='dark'] .pane-actions button:hover:not(:disabled) {
    box-shadow: 5px 5px 0 #eee;
  }
  [data-theme='dark'] .sig-remove {
    border-color: #eee;
    box-shadow: 2px 2px 0 #eee;
  }
</style>
