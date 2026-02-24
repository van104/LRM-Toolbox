<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">PDF<span>.页面管理()</span></h1>
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
            <p>载入后可执行排序、删除、插入页等自由操作</p>
          </div>
          <input ref="fileInput" type="file" hidden accept=".pdf" @change="handleFileSelect" />
        </div>
      </div>

      <div v-else class="brutal-pane">
        <div class="pane-header bg-blue">
          <span class="text-white">2. 序列操作空间</span>
        </div>
        <div class="workspace-area" style="padding: 2rem; background: #fafafa">
          <div
            class="toolbar"
            style="
              margin-bottom: 2rem;
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 4px solid #111;
              padding-bottom: 1.5rem;
              flex-wrap: wrap;
              gap: 1rem;
            "
          >
            <div class="left-tools" style="display: flex; gap: 1rem; flex-wrap: wrap">
              <button class="brutal-action-btn" style="padding: 0.5rem 1rem" @click="addBlankPage">
                + 插入空白页
              </button>
              <button class="brutal-action-btn" style="padding: 0.5rem 1rem" @click="selectAll">
                全选/反转
              </button>
              <button
                class="brutal-action-btn"
                style="padding: 0.5rem 1rem; background: #ff4b4b; color: #fff"
                :disabled="selectedPages.length === 0"
                @click="deleteSelected"
              >
                删除选中 ({{ selectedPages.length }})
              </button>
            </div>

            <div class="right-tools">
              <button
                class="brutal-action-btn primary large"
                style="padding: 0.8rem 2rem"
                :disabled="pages.length === 0 || processing"
                @click="savePdf"
              >
                {{ processing ? 'COMPUTING...' : 'COMMIT.保存输出' }}
              </button>
            </div>
          </div>

          <div ref="gridRef" class="brutal-pages-grid">
            <div
              v-for="(page, index) in pages"
              :key="page.id"
              class="page-card"
              :class="{ 'is-selected': selectedPages.includes(page.id), 'is-blank': page.isBlank }"
              draggable="true"
              @dragstart="onDragStart($event, index)"
              @dragover.prevent="onDragOver($event, index)"
              @drop="onDrop($event, index)"
              @dragend="onDragEnd"
              @click="toggleSelect(page.id, $event)"
            >
              <div class="page-num">{{ index + 1 }}</div>
              <div class="page-preview">
                <canvas v-if="!page.isBlank" :ref="el => setCanvasRef(el, page.id)"></canvas>
                <div v-else class="blank-indicator">[ 空白隔离页 ]</div>
                <div v-if="!page.rendered && !page.isBlank" class="loading-indicator">
                  LOADING...
                </div>
              </div>
              <div class="page-footer">
                <label class="brutal-checkbox-wrap" @click.stop>
                  <input
                    type="checkbox"
                    :checked="selectedPages.includes(page.id)"
                    @change="toggleSelect(page.id)"
                  />
                  <span class="checkmark"></span>
                </label>
              </div>
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

  import { PDFDocument } from 'pdf-lib';
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
  const pdfLibDoc = shallowRef(null);
  const pages = ref([]);
  const selectedPages = ref([]);
  const processing = ref(false);
  const canvasRefs = {};
  const dragIndex = ref(-1);

  let pageIdCounter = 0;

  const setCanvasRef = (el, id) => {
    if (el) canvasRefs[id] = el;
  };

  const triggerUpload = () => triggerFileInput();

  const clearFile = () => {
    pdfFile.value = null;
    pdfDocProxy.value = null;
    pdfLibDoc.value = null;
    pages.value = [];
    selectedPages.value = [];
  };

  const loadPdf = async file => {
    try {
      pdfFile.value = file;
      const buffer = await file.arrayBuffer();
      const bufferCopy = buffer.slice(0);

      const loadingTask = pdfjsLib.getDocument(new Uint8Array(bufferCopy));
      pdfDocProxy.value = await loadingTask.promise;

      pdfLibDoc.value = await PDFDocument.load(buffer);

      pages.value = Array.from({ length: pdfDocProxy.value.numPages }, (_, i) => ({
        id: ++pageIdCounter,
        originalIndex: i,
        isBlank: false,
        rendered: false
      }));

      nextTick(() => renderThumbnails());
    } catch (e) {
      console.error(e);
      ElMessage.error('加载 PDF 失败');
    }
  };

  const renderThumbnails = async () => {
    for (const page of pages.value) {
      if (page.isBlank || page.rendered) continue;

      try {
        const pdfPage = await pdfDocProxy.value.getPage(page.originalIndex + 1);
        const canvas = canvasRefs[page.id];
        if (!canvas) continue;

        const viewport = pdfPage.getViewport({ scale: 0.3 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await pdfPage.render({
          canvasContext: canvas.getContext('2d'),
          viewport
        }).promise;

        page.rendered = true;
      } catch (e) {
        console.error(`Error rendering page ${page.originalIndex + 1}`, e);
      }
    }
  };

  const toggleSelect = (id, event) => {
    if (event?.shiftKey && selectedPages.value.length > 0) {
      const lastSelected = selectedPages.value[selectedPages.value.length - 1];
      const lastIndex = pages.value.findIndex(p => p.id === lastSelected);
      const currentIndex = pages.value.findIndex(p => p.id === id);
      const [start, end] = [Math.min(lastIndex, currentIndex), Math.max(lastIndex, currentIndex)];
      for (let i = start; i <= end; i++) {
        if (!selectedPages.value.includes(pages.value[i].id)) {
          selectedPages.value.push(pages.value[i].id);
        }
      }
    } else {
      const index = selectedPages.value.indexOf(id);
      if (index > -1) {
        selectedPages.value.splice(index, 1);
      } else {
        selectedPages.value.push(id);
      }
    }
  };

  const selectAll = () => {
    if (selectedPages.value.length === pages.value.length) {
      selectedPages.value = [];
    } else {
      selectedPages.value = pages.value.map(p => p.id);
    }
  };

  const deleteSelected = () => {
    pages.value = pages.value.filter(p => !selectedPages.value.includes(p.id));
    selectedPages.value = [];
  };

  const addBlankPage = () => {
    pages.value.push({
      id: ++pageIdCounter,
      originalIndex: -1,
      isBlank: true,
      rendered: true
    });
  };

  const onDragStart = (e, index) => {
    dragIndex.value = index;
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = e => {
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (e, toIndex) => {
    const fromIndex = dragIndex.value;
    if (fromIndex === -1 || fromIndex === toIndex) return;

    const [moved] = pages.value.splice(fromIndex, 1);
    pages.value.splice(toIndex, 0, moved);
  };

  const onDragEnd = () => {
    dragIndex.value = -1;
  };

  const savePdf = async () => {
    if (pages.value.length === 0) return ElMessage.warning('没有页面可以保存');

    processing.value = true;
    try {
      const newPdf = await PDFDocument.create();

      for (const page of pages.value) {
        if (page.isBlank) {
          const [width, height] = pdfLibDoc.value
            ? [
                pdfLibDoc.value.getPages()[0]?.getWidth() || 595,
                pdfLibDoc.value.getPages()[0]?.getHeight() || 842
              ]
            : [595, 842];
          newPdf.addPage([width, height]);
        } else {
          const [copiedPage] = await newPdf.copyPages(pdfLibDoc.value, [page.originalIndex]);
          newPdf.addPage(copiedPage);
        }
      }

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `organized_${pdfFile.value.name}`;
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
    color: #333 !important;
  }
  .brutal-action-btn.primary {
    background: #ffd900;
    color: #111;
  }
  .brutal-action-btn.large {
    padding: 1.25rem 3rem;
    font-size: 1.25rem;
    letter-spacing: 1px;
  }

  /* Workspace */
  .brutal-pages-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.5rem;
  }
  .page-card {
    border: 4px solid #111;
    background: #fff;
    cursor: grab;
    transition: all 0.1s;
    position: relative;
    box-shadow: 6px 6px 0px rgba(0, 0, 0, 0.1);
  }
  .page-card:hover {
    transform: translate(-2px, -2px);
    box-shadow: 8px 8px 0px #111;
  }
  .page-card.is-selected {
    border-color: #4b7bff;
    box-shadow: 6px 6px 0px #4b7bff;
  }
  .page-card.is-blank {
    border: 4px dashed #111;
    background: #fdfae5;
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
  }
  .page-preview canvas {
    max-width: 100%;
    max-height: 100%;
    display: block;
  }

  .blank-indicator {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: bold;
    color: #666;
    font-size: 0.9rem;
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
    justify-content: center;
    align-items: center;
    padding: 0.75rem;
    background: #fdfae5;
  }

  /* brutal checkbox */
  .brutal-checkbox-wrap {
    display: block;
    position: relative;
    cursor: pointer;
    user-select: none;
    width: 28px;
    height: 28px;
  }
  .brutal-checkbox-wrap input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }
  .checkmark {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background-color: #fff;
    border: 3px solid #111;
    box-sizing: border-box;
  }
  .brutal-checkbox-wrap:hover input ~ .checkmark {
    background-color: #eee;
  }
  .brutal-checkbox-wrap input:checked ~ .checkmark {
    background-color: #4b7bff;
  }
  .checkmark:after {
    content: '';
    position: absolute;
    display: none;
  }
  .brutal-checkbox-wrap input:checked ~ .checkmark:after {
    display: block;
  }
  .brutal-checkbox-wrap .checkmark:after {
    left: 6px;
    top: 1px;
    width: 6px;
    height: 12px;
    border: solid white;
    border-width: 0 4px 4px 0;
    transform: rotate(45deg);
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
  [data-theme='dark'] .brutal-action-btn {
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

  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
    border-color: #eee;
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

  [data-theme='dark'] .workspace-area {
    background: #222 !important;
    border-top: 4px solid #eee;
  }
  [data-theme='dark'] .toolbar {
    border-bottom-color: #eee !important;
  }

  [data-theme='dark'] .page-card {
    border-color: #eee;
    background: #1a1a1a;
  }
  [data-theme='dark'] .page-card.is-blank {
    background: #222;
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
  [data-theme='dark'] .checkmark {
    border-color: #eee;
    background-color: #222;
  }
  [data-theme='dark'] .brutal-checkbox-wrap:hover input ~ .checkmark {
    background-color: #333;
  }
</style>
