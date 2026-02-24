<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">PDF<span>.旋转引擎()</span></h1>
        <button v-if="pdfFile" class="brutal-btn clear-btn" @click="clearFile">清除文件</button>
      </header>

      <div v-if="!pdfFile" class="brutal-pane">
        <div class="pane-header bg-yellow">
          <span class="text-black">1. 载入 PDF</span>
        </div>
        <div
          class="brutal-upload-area"
          @click="triggerUpload"
          @dragover.prevent
          @drop.prevent="handleFileDrop"
        >
          <div class="upload-text">
            <h3>[ 拖拽或选择文件 ]</h3>
            <p>支持 90° / 180° 旋转任意页面</p>
          </div>
          <input ref="fileInput" type="file" hidden accept=".pdf" @change="handleFileSelect" />
        </div>
      </div>

      <div v-else>
        <div class="brutal-toolbar">
          <div class="tools-left">
            <span class="toolbar-label">全部页面：</span>
            <button class="brutal-action-btn" @click="rotateAll(-90)">↺ 左转90°</button>
            <button class="brutal-action-btn" @click="rotateAll(90)">↻ 右转90°</button>
            <button class="brutal-action-btn" @click="rotateAll(180)">↕ 180°</button>
          </div>
          <div class="tools-right">
            <button class="brutal-action-btn" @click="resetAll">重置所有</button>
            <button class="brutal-action-btn primary" :disabled="processing" @click="saveRotation">
              {{ processing ? 'COMPUTING...' : 'COMMIT.保存下载' }}
            </button>
          </div>
        </div>

        <div class="brutal-pages-grid">
          <div v-for="(page, index) in pages" :key="index" class="page-card">
            <div class="page-num">{{ index + 1 }}</div>
            <div class="page-preview" :style="{ transform: `rotate(${page.rotation}deg)` }">
              <canvas :ref="el => setCanvasRef(el, index)"></canvas>
              <div v-if="!page.rendered" class="loading-indicator">LOADING...</div>
            </div>
            <div class="page-footer">
              <button class="rotate-btn" @click="rotatePage(index, -90)">↺</button>
              <span class="rotation-label">{{ page.rotation }}°</span>
              <button class="rotate-btn" @click="rotatePage(index, 90)">↻</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, shallowRef, nextTick } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import pdfjsLib from '@/utils/pdf';
  import { PDFDocument, degrees } from 'pdf-lib';
  import { useFileHandler } from '@/composables';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const { fileInput, triggerFileInput, handleFileSelect, handleFileDrop } = useFileHandler({
    accept: '.pdf',
    readMode: 'none',
    onSuccess: result => {
      loadPdf(result.file);
    }
  });
  const pdfFile = ref(null);
  const pdfDocProxy = shallowRef(null);
  const pages = ref([]);
  const processing = ref(false);
  const canvasRefs = [];

  const setCanvasRef = (el, index) => {
    if (el) canvasRefs[index] = el;
  };

  const triggerUpload = () => triggerFileInput();

  const clearFile = () => {
    pdfFile.value = null;
    pages.value = [];
    pdfDocProxy.value = null;
  };

  const loadPdf = async file => {
    try {
      pdfFile.value = file;
      const buffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument(new Uint8Array(buffer));
      pdfDocProxy.value = await loadingTask.promise;

      pages.value = Array.from({ length: pdfDocProxy.value.numPages }, () => ({
        rotation: 0,
        rendered: false
      }));

      nextTick(() => renderThumbnails());
    } catch (e) {
      console.error(e);
      ElMessage.error('无法加载 PDF 文件');
    }
  };

  const renderThumbnails = async () => {
    if (!pdfDocProxy.value) return;

    const limit = Math.min(pages.value.length, 50);

    for (let i = 1; i <= limit; i++) {
      if (pages.value[i - 1].rendered) continue;

      try {
        const page = await pdfDocProxy.value.getPage(i);
        const canvas = canvasRefs[i - 1];
        if (!canvas) continue;

        const viewport = page.getViewport({ scale: 0.3 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport: viewport }).promise;
        pages.value[i - 1].rendered = true;
      } catch (e) {
        console.error(`Error rendering page ${i}`, e);
      }
    }
  };

  const rotatePage = (index, angle) => {
    pages.value[index].rotation = (pages.value[index].rotation + angle) % 360;
  };

  const rotateAll = angle => {
    pages.value.forEach(p => (p.rotation = (p.rotation + angle) % 360));
  };

  const resetAll = () => {
    pages.value.forEach(p => (p.rotation = 0));
  };

  const saveRotation = async () => {
    if (!pdfFile.value) return;
    processing.value = true;

    try {
      const arrayBuffer = await pdfFile.value.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pdfPages = pdfDoc.getPages();

      pages.value.forEach((p, i) => {
        if (p.rotation !== 0 && pdfPages[i]) {
          const currentRotation = pdfPages[i].getRotation().angle;
          pdfPages[i].setRotation(degrees(currentRotation + p.rotation));
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rotated_${pdfFile.value.name}`;
      a.click();
      URL.revokeObjectURL(url);
      ElMessage.success('保存成功');
    } catch (e) {
      console.error(e);
      ElMessage.error('保存失败: ' + e.message);
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
  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }
  .brutal-btn.clear-btn {
    background: #ff4b4b;
    color: #fff;
  }

  .brutal-pane {
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
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
  .text-black {
    color: #111;
  }

  .brutal-upload-area {
    min-height: 350px;
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
    flex-wrap: wrap;
    gap: 1rem;
  }
  .tools-left,
  .tools-right {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
  }
  .toolbar-label {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
  }

  .brutal-action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.6rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
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

  .brutal-pages-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.5rem;
  }
  .page-card {
    border: 4px solid #111;
    background: #fff;
    position: relative;
    box-shadow: 6px 6px 0px rgba(0, 0, 0, 0.1);
    transition: all 0.1s;
  }
  .page-card:hover {
    transform: translate(-2px, -2px);
    box-shadow: 8px 8px 0px #111;
  }
  .page-num {
    position: absolute;
    top: -12px;
    left: -12px;
    background: #ffd900;
    border: 3px solid #111;
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 800;
    font-family: 'IBM Plex Mono', monospace;
    z-index: 10;
    box-shadow: 2px 2px 0px #111;
    font-size: 1.1rem;
    color: #111;
  }

  .page-preview {
    aspect-ratio: 1 / 1.414;
    background: #eee;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
    border-bottom: 4px solid #111;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .page-preview canvas {
    max-width: 100%;
    max-height: 100%;
    display: block;
    object-fit: contain;
  }
  .loading-indicator {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: bold;
    color: #111;
    background: rgba(255, 255, 255, 0.8);
    padding: 0.5rem;
    position: absolute;
    border: 2px solid #111;
  }

  .page-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0.75rem;
    background: #fdfae5;
  }
  .rotation-label {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 800;
    font-size: 1rem;
  }
  .rotate-btn {
    width: 36px;
    height: 36px;
    border: 3px solid #111;
    background: #fff;
    font-size: 1.2rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.1s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .rotate-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
    background: #ffd900;
  }
  .rotate-btn:active {
    transform: translate(2px, 2px);
    box-shadow: 0px 0px 0px #111;
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
    .brutal-toolbar {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  /* --- Dark Mode --- */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-toolbar,
  [data-theme='dark'] .brutal-upload-area,
  [data-theme='dark'] .page-card,
  [data-theme='dark'] .rotate-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 9px 9px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }
  [data-theme='dark'] .brutal-toolbar {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn {
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:hover:not(:disabled) {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:active:not(:disabled) {
    box-shadow: 0px 0px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn.primary {
    background: #b28f00;
    color: #fff;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-btn.clear-btn {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .page-preview {
    border-bottom-color: #eee;
    background: #333;
  }
  [data-theme='dark'] .page-footer {
    background: #111;
  }
  [data-theme='dark'] .page-num {
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .rotate-btn {
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .rotate-btn:hover {
    background: #b28f00;
    box-shadow: 3px 3px 0px #eee;
    color: #fff;
  }
</style>
