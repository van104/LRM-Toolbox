<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">PDF<span>.拆分合并()</span></h1>
      </header>

      <div class="brutal-toolbar">
        <div class="tools-left">
          <button
            class="brutal-action-btn"
            :class="{ primary: activeTab === 'split' }"
            @click="activeTab = 'split'"
          >
            ✂ 拆分 PDF
          </button>
          <button
            class="brutal-action-btn"
            :class="{ primary: activeTab === 'merge' }"
            @click="activeTab = 'merge'"
          >
            🔗 合并 PDF
          </button>
        </div>
      </div>

      <!-- SPLIT TAB -->
      <div v-if="activeTab === 'split'" class="brutal-pane">
        <div class="pane-header bg-yellow"><span>拆分 PDF</span></div>
        <div class="pane-body">
          <div
            v-if="!splitFile"
            class="brutal-upload-area"
            @click="triggerSplitUpload"
            @dragover.prevent
            @drop.prevent="handleSplitDrop"
          >
            <div class="upload-text">
              <h3>[ 上传需要拆分的 PDF ]</h3>
              <p>选择要提取的页面范围</p>
            </div>
            <input
              ref="splitFileInput"
              type="file"
              hidden
              accept=".pdf"
              @change="handleSplitSelect"
            />
          </div>
          <div v-else>
            <div class="file-badge">
              <strong>{{ splitFile.name }}</strong> <span>({{ splitPageCount }} 页)</span>
              <button
                class="brutal-action-btn"
                style="padding: 0.2rem 0.8rem; font-size: 0.85rem; margin-left: auto"
                @click="triggerSplitUpload"
              >
                重新选择
              </button>
              <input
                ref="splitFileInput"
                type="file"
                hidden
                accept=".pdf"
                @change="handleSplitSelect"
              />
            </div>
            <div class="param-box">
              <div class="form-item">
                <label>提取方式</label>
                <div class="radio-wrap">
                  <label><input v-model="splitMode" type="radio" value="range" /> 页面范围</label>
                  <label><input v-model="splitMode" type="radio" value="single" /> 逐页拆分</label>
                </div>
              </div>
              <div v-if="splitMode === 'range'" class="form-item">
                <label>页面范围 (如: 1-3,5,7-9)</label>
                <input v-model="splitRange" class="brutal-input" placeholder="1-3,5,7-9" />
              </div>
            </div>
            <button
              class="brutal-action-btn primary large"
              :disabled="splitLoading"
              @click="executeSplit"
            >
              {{
                splitLoading
                  ? 'SPLITTING...'
                  : splitMode === 'single'
                    ? 'COMMIT.逐页拆分'
                    : 'COMMIT.提取选定页'
              }}
            </button>
          </div>
        </div>
      </div>

      <!-- MERGE TAB -->
      <div v-if="activeTab === 'merge'" class="brutal-pane">
        <div class="pane-header bg-blue"><span class="text-white">合并 PDF</span></div>
        <div class="pane-body">
          <div
            v-if="!mergeFiles.length"
            class="brutal-upload-area"
            @click="triggerMergeUpload"
            @dragover.prevent
            @drop.prevent="handleMergeDrop"
          >
            <div class="upload-text">
              <h3>[ 上传多个 PDF 文件 ]</h3>
              <p>文件将按顺序合并为一个 PDF</p>
            </div>
            <input
              ref="mergeFileInput"
              type="file"
              multiple
              hidden
              accept=".pdf"
              @change="handleMergeSelect"
            />
          </div>
          <div v-else>
            <div class="merge-toolbar">
              <button class="brutal-action-btn" @click="triggerMergeUpload">+ 添加更多</button>
              <input
                ref="mergeFileInput"
                type="file"
                multiple
                hidden
                accept=".pdf"
                @change="handleMergeSelect"
              />
              <button
                class="brutal-action-btn"
                style="background: #ff4b4b; color: #fff"
                @click="clearMergeFiles"
              >
                清空
              </button>
            </div>
            <div class="merge-list">
              <div v-for="(f, i) in mergeFiles" :key="f.id" class="merge-item">
                <span class="merge-index">{{ i + 1 }}</span>
                <span class="merge-name">{{ f.name }}</span>
                <button class="merge-remove" @click="removeMergeFile(i)">✕</button>
              </div>
            </div>
            <button
              class="brutal-action-btn primary large"
              :disabled="mergeLoading || mergeFiles.length < 2"
              @click="executeMerge"
            >
              {{ mergeLoading ? 'MERGING...' : `COMMIT.合并 ${mergeFiles.length} 个 PDF` }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { PDFDocument } from 'pdf-lib';
  import { useFileHandler } from '@/composables';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };
  const activeTab = ref('split');
  const splitFile = ref(null);
  const splitPdfDoc = ref(null);
  const splitPageCount = ref(0);
  const splitMode = ref('range');
  const splitRange = ref('');
  const splitLoading = ref(false);
  const {
    fileInput: splitFileInput,
    triggerFileInput: triggerSplitUpload,
    handleFileSelect: handleSplitSelect,
    handleFileDrop: handleSplitDrop
  } = useFileHandler({ accept: '.pdf', readMode: 'none', onSuccess: r => loadSplitFile(r.file) });
  const mergeFiles = ref([]);
  const mergeLoading = ref(false);
  let mergeId = 0;
  const {
    fileInput: mergeFileInput,
    triggerFileInput: triggerMergeUpload,
    handleFileSelect: handleMergeSelect,
    handleFileDrop: handleMergeDrop
  } = useFileHandler({
    accept: '.pdf',
    readMode: 'none',
    multiple: true,
    onSuccess: r => addMergeFiles([r.file])
  });

  const loadSplitFile = async file => {
    splitFile.value = file;
    const bytes = await file.arrayBuffer();
    splitPdfDoc.value = await PDFDocument.load(bytes);
    splitPageCount.value = splitPdfDoc.value.getPageCount();
    splitRange.value = `1-${splitPageCount.value}`;
  };
  const parseRange = (rangeStr, max) => {
    const pages = new Set();
    rangeStr.split(',').forEach(part => {
      part = part.trim();
      if (part.includes('-')) {
        const [s, e] = part.split('-').map(Number);
        for (let i = Math.max(1, s); i <= Math.min(max, e); i++) pages.add(i);
      } else {
        const n = parseInt(part);
        if (n >= 1 && n <= max) pages.add(n);
      }
    });
    return Array.from(pages).sort((a, b) => a - b);
  };
  const executeSplit = async () => {
    if (!splitPdfDoc.value) return;
    splitLoading.value = true;
    try {
      if (splitMode.value === 'single') {
        for (let i = 0; i < splitPageCount.value; i++) {
          const np = await PDFDocument.create();
          const [p] = await np.copyPages(splitPdfDoc.value, [i]);
          np.addPage(p);
          const bytes = await np.save();
          downloadBlob(
            new Blob([bytes], { type: 'application/pdf' }),
            `${splitFile.value.name.replace('.pdf', '')}_page${i + 1}.pdf`
          );
          await new Promise(r => setTimeout(r, 200));
        }
        ElMessage.success(`已拆分为 ${splitPageCount.value} 个文件`);
      } else {
        const pages = parseRange(splitRange.value, splitPageCount.value);
        if (!pages.length) {
          ElMessage.warning('请输入有效的页面范围');
          return;
        }
        const np = await PDFDocument.create();
        const cp = await np.copyPages(
          splitPdfDoc.value,
          pages.map(p => p - 1)
        );
        cp.forEach(p => np.addPage(p));
        const bytes = await np.save();
        downloadBlob(
          new Blob([bytes], { type: 'application/pdf' }),
          `${splitFile.value.name.replace('.pdf', '')}_extracted.pdf`
        );
        ElMessage.success('提取完成');
      }
    } catch (e) {
      console.error(e);
      ElMessage.error('拆分失败');
    } finally {
      splitLoading.value = false;
    }
  };
  const addMergeFiles = files =>
    files.forEach(f => mergeFiles.value.push({ id: ++mergeId, file: f, name: f.name }));
  const removeMergeFile = i => mergeFiles.value.splice(i, 1);
  const clearMergeFiles = () => {
    mergeFiles.value = [];
  };
  const executeMerge = async () => {
    if (mergeFiles.value.length < 2) {
      ElMessage.warning('至少需要2个PDF');
      return;
    }
    mergeLoading.value = true;
    try {
      const merged = await PDFDocument.create();
      for (const f of mergeFiles.value) {
        const bytes = await f.file.arrayBuffer();
        const doc = await PDFDocument.load(bytes);
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach(p => merged.addPage(p));
      }
      const bytes = await merged.save();
      downloadBlob(new Blob([bytes], { type: 'application/pdf' }), 'merged.pdf');
      ElMessage.success('合并完成');
    } catch (e) {
      console.error(e);
      ElMessage.error('合并失败');
    } finally {
      mergeLoading.value = false;
    }
  };
  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
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
    max-width: 900px;
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
    color: #ff4b4b;
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
  .brutal-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    border: 4px solid #111;
    padding: 1.5rem;
    margin-bottom: 2.5rem;
    box-shadow: 8px 8px 0 #111;
  }
  .tools-left {
    display: flex;
    gap: 1.5rem;
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
  .brutal-upload-area {
    min-height: 280px;
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
  .param-box {
    border: 4px dashed #111;
    padding: 1.5rem;
    background: #fafafa;
    margin-bottom: 2rem;
  }
  .form-item {
    margin-bottom: 1.5rem;
  }
  .form-item:last-child {
    margin-bottom: 0;
  }
  .form-item label {
    display: block;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  .radio-wrap {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .radio-wrap label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-weight: bold;
    font-family: 'Noto Sans SC', sans-serif;
  }
  .brutal-input {
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
    border: 3px solid #111;
    background: #fff;
    box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.1);
    font-weight: bold;
    box-sizing: border-box;
    font-family: 'IBM Plex Mono', monospace;
  }
  .brutal-input:focus {
    outline: none;
    box-shadow: 6px 6px 0 #4b7bff;
    border-color: #4b7bff;
  }
  .merge-toolbar {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  .merge-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 300px;
    overflow-y: auto;
    margin-bottom: 2rem;
  }
  .merge-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    border: 3px solid #111;
    padding: 0.75rem 1rem;
    background: #fafafa;
  }
  .merge-index {
    background: #ffd900;
    border: 2px solid #111;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 0.9rem;
    box-shadow: 2px 2px 0 #111;
  }
  .merge-name {
    flex: 1;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .merge-remove {
    width: 28px;
    height: 28px;
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
    transition: all 0.1s;
  }
  .merge-remove:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0 #111;
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
      gap: 1rem;
      align-items: flex-start;
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
  [data-theme='dark'] .brutal-toolbar,
  [data-theme='dark'] .brutal-upload-area,
  [data-theme='dark'] .file-badge,
  [data-theme='dark'] .param-box,
  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .merge-item {
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
  [data-theme='dark'] .brutal-toolbar {
    box-shadow: 8px 8px 0 #eee;
  }
  [data-theme='dark'] .brutal-action-btn {
    box-shadow: 4px 4px 0 #eee;
  }
  [data-theme='dark'] .brutal-action-btn:hover:not(:disabled) {
    box-shadow: 6px 6px 0 #eee;
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
  [data-theme='dark'] .file-badge {
    box-shadow: 4px 4px 0 #eee;
  }
  [data-theme='dark'] .merge-index {
    border-color: #eee;
    box-shadow: 2px 2px 0 #eee;
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .merge-remove {
    border-color: #eee;
    box-shadow: 2px 2px 0 #eee;
  }
</style>
