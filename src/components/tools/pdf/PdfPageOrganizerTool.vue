<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="goBack">
          <el-icon>
            <ArrowLeft />
          </el-icon>
          <span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">PDF 页面组织</h1>
        <span class="tool-subtitle">PDF Page Organizer</span>
      </div>
      <div class="header-right">
        <el-button
          type="primary"
          :disabled="!pdfFile || pages.length === 0"
          :loading="processing"
          @click="savePdf"
        >
          <el-icon>
            <Download />
          </el-icon>
          保存
        </el-button>
      </div>
    </header>

    <main class="tool-content">
      <div
        v-if="!pdfFile"
        class="upload-container glass-card"
        @click="triggerUpload"
        @dragover.prevent
        @drop.prevent="handleFileDrop"
      >
        <el-icon class="upload-icon">
          <Grid />
        </el-icon>
        <h3>上传 PDF 文件</h3>
        <p class="hint">拖拽页面重新排序，右键删除页面</p>
        <input ref="fileInput" type="file" hidden accept=".pdf" @change="handleFileSelect" />
      </div>

      <div v-else class="workspace">
        <div class="toolbar glass-card">
          <div class="tool-group">
            <el-button @click="addBlankPage"
              ><el-icon>
                <Plus />
              </el-icon>
              插入空白页</el-button
            >
            <el-button @click="selectAll">全选</el-button>
            <el-button type="danger" :disabled="selectedPages.length === 0" @click="deleteSelected">
              <el-icon>
                <Delete />
              </el-icon>
              删除选中 ({{ selectedPages.length }})
            </el-button>
          </div>
          <div class="tool-group">
            <el-button text @click="clearFile">更换文件</el-button>
          </div>
        </div>

        <div ref="gridRef" class="pages-grid">
          <div
            v-for="(page, index) in pages"
            :key="page.id"
            class="page-card glass-card"
            :class="{ selected: selectedPages.includes(page.id), blank: page.isBlank }"
            draggable="true"
            @dragstart="onDragStart($event, index)"
            @dragover.prevent="onDragOver($event, index)"
            @drop="onDrop($event, index)"
            @dragend="onDragEnd"
            @click="toggleSelect(page.id, $event)"
          >
            <div class="page-preview">
              <canvas v-if="!page.isBlank" :ref="el => setCanvasRef(el, page.id)"></canvas>
              <div v-else class="blank-page">
                <el-icon>
                  <Document />
                </el-icon>
                <span>空白页</span>
              </div>
              <div v-if="!page.rendered && !page.isBlank" class="loading-mask">
                <el-icon class="is-loading">
                  <Loading />
                </el-icon>
              </div>
            </div>
            <div class="page-footer">
              <span class="page-num">{{ index + 1 }}</span>
              <el-checkbox
                :model-value="selectedPages.includes(page.id)"
                @click.stop
                @change="toggleSelect(page.id)"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - PDF 页面组织</footer>
  </div>
</template>

<script setup>
  import { ref, shallowRef, nextTick } from 'vue';
  import { useRouter } from 'vue-router';
  import {
    ArrowLeft,
    Grid,
    Download,
    Plus,
    Delete,
    Document,
    Loading
  } from '@element-plus/icons-vue';
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
  .tool-page {
    min-height: 100vh;
    background: #f8fafc;
    display: flex;
    flex-direction: column;
    color: #1e293b;
  }

  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .header-left,
  .header-right {
    min-width: 120px;
    display: flex;
    align-items: center;
  }

  .header-right {
    justify-content: flex-end;
  }

  .header-center {
    flex: 1;
    text-align: center;
  }

  .tool-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
  }

  .tool-subtitle {
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
  }

  .tool-content {
    flex: 1;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .upload-container {
    width: 100%;
    max-width: 600px;
    height: 300px;
    border: 2px dashed #cbd5e1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    border-radius: 16px;
  }

  .upload-container:hover {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  .upload-icon {
    font-size: 4rem;
    color: #94a3b8;
    margin-bottom: 1rem;
  }

  .hint {
    color: #94a3b8;
    font-size: 0.9rem;
  }

  .workspace {
    width: 100%;
    max-width: 1400px;
  }

  .toolbar {
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    border-radius: 12px;
  }

  .tool-group {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .pages-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1.5rem;
  }

  .page-card {
    padding: 0.75rem;
    cursor: grab;
    transition: all 0.2s;
    border-radius: 12px;
    user-select: none;
  }

  .page-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }

  .page-card.selected {
    border: 2px solid #3b82f6;
    background: #eff6ff;
  }

  .page-card.blank {
    border: 2px dashed #cbd5e1;
  }

  .page-preview {
    aspect-ratio: 0.7;
    background: #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 4px;
    position: relative;
  }

  .page-preview canvas {
    max-width: 100%;
    max-height: 100%;
  }

  .blank-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    color: #94a3b8;
  }

  .blank-page .el-icon {
    font-size: 2rem;
  }

  .loading-mask {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.8);
  }

  .page-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.5rem;
  }

  .page-num {
    font-size: 0.85rem;
    font-weight: 600;
    color: #475569;
  }

  .glass-card {
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.05);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }
</style>
