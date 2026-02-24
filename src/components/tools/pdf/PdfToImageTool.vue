<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">PDF<span>.转图片()</span></h1>
        <div class="header-actions">
          <template v-if="pages.length">
            <button
              class="brutal-action-btn"
              style="background: #ff4b4b; color: #fff"
              @click="clearAll"
            >
              清空
            </button>
            <button class="brutal-action-btn primary" @click="downloadAll">批量下载</button>
          </template>
        </div>
      </header>

      <div class="brutal-grid">
        <!-- Main Area -->
        <div class="brutal-pane">
          <div class="pane-header bg-yellow"><span>PDF 预览</span></div>
          <div class="pane-body">
            <div
              v-if="!pdfFile"
              class="brutal-upload-area"
              @click="triggerUpload"
              @dragover.prevent="dragOver"
              @dragleave.prevent="dragLeave"
              @drop.prevent="handleFileDrop"
            >
              <div class="upload-text">
                <h3>[ 点击或拖拽上传 PDF ]</h3>
                <p>文件将在本地处理，不会上传到服务器</p>
              </div>
              <input
                ref="fileInput"
                type="file"
                hidden
                accept=".pdf,application/pdf"
                @change="handleFileSelect"
              />
            </div>

            <div v-else>
              <div class="file-badge">
                <strong>{{ pdfFile.name }}</strong>
                <span>({{ formatFileSize(pdfFile.size) }} · {{ pages.length }} 页)</span>
                <button
                  class="brutal-action-btn"
                  style="padding: 0.2rem 0.8rem; font-size: 0.85rem; margin-left: auto"
                  @click="triggerUpload"
                >
                  重新选择
                </button>
                <input
                  ref="fileInput"
                  type="file"
                  hidden
                  accept=".pdf,application/pdf"
                  @change="handleFileSelect"
                />
              </div>

              <div v-if="loading" class="loading-box">
                <p>⏳ 正在解析... {{ loadingProgress }}%</p>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: loadingProgress + '%' }"></div>
                </div>
              </div>

              <div v-else class="pages-grid">
                <div
                  v-for="(page, index) in pages"
                  :key="index"
                  class="page-card"
                  :class="{ selected: selectedPages.includes(index) }"
                  @click="toggleSelect(index)"
                >
                  <div class="card-preview">
                    <img :src="page.dataUrl" :alt="`第 ${index + 1} 页`" />
                  </div>
                  <div class="card-footer">
                    <input
                      type="checkbox"
                      :checked="selectedPages.includes(index)"
                      @click.stop
                      @change="toggleSelect(index)"
                    />
                    <span>第 {{ index + 1 }} 页</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Settings -->
        <div class="brutal-pane settings-pane">
          <div class="pane-header bg-black"><span class="text-white">导出设置</span></div>
          <div class="pane-body">
            <div class="form-item">
              <label>输出格式</label>
              <div class="format-btns">
                <button
                  v-for="fmt in ['png', 'jpeg', 'webp']"
                  :key="fmt"
                  class="brutal-action-btn"
                  :class="{ primary: config.format === fmt }"
                  @click="config.format = fmt"
                >
                  {{ fmt.toUpperCase() }}
                </button>
              </div>
            </div>
            <div v-if="config.format !== 'png'" class="form-item">
              <label>输出质量 ({{ config.quality }}%)</label>
              <input
                v-model.number="config.quality"
                type="range"
                class="brutal-range"
                min="10"
                max="100"
                step="5"
              />
            </div>
            <div class="form-item">
              <label>缩放比例 ({{ config.scale }}x)</label>
              <input
                v-model.number="config.scale"
                type="range"
                class="brutal-range"
                min="0.5"
                max="4"
                step="0.5"
              />
            </div>

            <div class="divider"></div>

            <div class="form-item">
              <label>页面选择</label>
              <div class="select-actions">
                <button
                  class="brutal-action-btn"
                  style="font-size: 0.85rem; padding: 0.3rem 1rem"
                  @click="selectAll"
                >
                  全选
                </button>
                <button
                  class="brutal-action-btn"
                  style="font-size: 0.85rem; padding: 0.3rem 1rem"
                  @click="selectNone"
                >
                  取消
                </button>
              </div>
              <p v-if="pages.length" class="select-count">
                已选 {{ selectedPages.length }} / {{ pages.length }} 页
              </p>
            </div>

            <div class="divider"></div>

            <button
              class="brutal-action-btn primary large"
              :disabled="!selectedPages.length"
              @click="downloadSelected"
            >
              COMMIT.下载选中页面
            </button>

            <div class="info-box">
              <strong>// 使用提示</strong>
              <ul>
                <li>支持多页 PDF 文件</li>
                <li>点击页面切换选中状态</li>
                <li>提高缩放比例获得更高分辨率</li>
                <li>PNG 格式支持透明背景</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage, ElLoading } from 'element-plus';
  import pdfjsLib from '@/utils/pdf';
  import { useFileHandler } from '@/composables';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };
  const { fileInput, triggerFileInput, handleFileSelect, handleFileDrop, dragOver, dragLeave } =
    useFileHandler({
      accept: '.pdf,application/pdf',
      readMode: 'none',
      onSuccess: r => processFile(r.file)
    });
  const pdfFile = ref(null);
  const pages = ref([]);
  const selectedPages = ref([]);
  const loading = ref(false);
  const loadingProgress = ref(0);
  const config = reactive({ format: 'png', quality: 90, scale: 2 });
  const triggerUpload = () => triggerFileInput();

  const processFile = async file => {
    pdfFile.value = file;
    pages.value = [];
    selectedPages.value = [];
    loading.value = true;
    loadingProgress.value = 0;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: config.scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        pages.value.push({
          pageNumber: i,
          dataUrl: canvas.toDataURL('image/png'),
          width: viewport.width,
          height: viewport.height
        });
        selectedPages.value.push(i - 1);
        loadingProgress.value = Math.round((i / totalPages) * 100);
      }
      ElMessage.success(`成功解析 ${totalPages} 页`);
    } catch (error) {
      console.error('PDF 解析失败:', error);
      ElMessage.error('PDF 解析失败');
      pdfFile.value = null;
    } finally {
      loading.value = false;
    }
  };
  const toggleSelect = index => {
    const idx = selectedPages.value.indexOf(index);
    if (idx > -1) selectedPages.value.splice(idx, 1);
    else selectedPages.value.push(index);
  };
  const selectAll = () => {
    selectedPages.value = pages.value.map((_, i) => i);
  };
  const selectNone = () => {
    selectedPages.value = [];
  };
  const formatFileSize = bytes => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  const downloadSelected = async () => {
    if (!selectedPages.value.length) return;
    const ld = ElLoading.service({ text: '正在导出...', background: 'rgba(0,0,0,0.7)' });
    try {
      for (const index of selectedPages.value.sort((a, b) => a - b)) {
        await downloadPage(pages.value[index], index + 1);
        await new Promise(r => setTimeout(r, 200));
      }
      ElMessage.success('下载完成');
    } catch (e) {
      ElMessage.error('下载失败');
      console.error(e);
    } finally {
      ld.close();
    }
  };
  const downloadAll = () => {
    selectAll();
    downloadSelected();
  };
  const downloadPage = async (page, pageNum) => {
    const img = new Image();
    img.src = page.dataUrl;
    await new Promise(resolve => {
      img.onload = resolve;
    });
    const canvas = document.createElement('canvas');
    canvas.width = page.width;
    canvas.height = page.height;
    canvas.getContext('2d').drawImage(img, 0, 0);
    const mimeType = `image/${config.format}`;
    const quality = config.format === 'png' ? undefined : config.quality / 100;
    const link = document.createElement('a');
    link.href = canvas.toDataURL(mimeType, quality);
    link.download = `${pdfFile.value.name.replace(/\.pdf$/i, '')}_page${pageNum}.${config.format}`;
    link.click();
  };
  const clearAll = () => {
    pdfFile.value = null;
    pages.value = [];
    selectedPages.value = [];
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
    flex-wrap: wrap;
    gap: 1rem;
  }
  .header-actions {
    display: flex;
    gap: 1rem;
  }
  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.5rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0 #4b7bff;
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
  .brutal-grid {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 2.5rem;
    margin-bottom: 2rem;
    overflow: hidden;
  }
  .brutal-pane {
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0 #111;
    overflow: hidden;
    min-width: 0;
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
  .bg-black {
    background: #111;
  }
  .text-white {
    color: #fff;
  }
  .pane-body {
    padding: 1.25rem;
    flex: 1;
    overflow: hidden;
    box-sizing: border-box;
  }
  .brutal-upload-area {
    min-height: 350px;
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
  .loading-box {
    text-align: center;
    padding: 2rem;
    border: 4px solid #111;
    background: #fafafa;
  }
  .loading-box p {
    font-weight: 800;
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }
  .progress-bar {
    height: 16px;
    border: 3px solid #111;
    background: #fff;
  }
  .progress-fill {
    height: 100%;
    background: #ffd900;
    transition: width 0.3s;
  }
  .pages-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
    max-height: 60vh;
    overflow-y: auto;
  }
  .page-card {
    border: 4px solid #111;
    background: #fff;
    cursor: pointer;
    transition: all 0.1s;
    box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.1);
  }
  .page-card:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #111;
  }
  .page-card.selected {
    border-color: #4b7bff;
    box-shadow: 6px 6px 0 #4b7bff;
  }
  .card-preview {
    aspect-ratio: 210/297;
    overflow: hidden;
    background: #eee;
    border-bottom: 3px solid #111;
  }
  .card-preview img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .card-footer {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background: #fdfae5;
    font-weight: 600;
    font-size: 0.85rem;
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
    padding: 1rem 1rem;
    font-size: 1.1rem;
    letter-spacing: 1px;
    width: 100%;
    box-sizing: border-box;
  }
  .form-item {
    margin-bottom: 1.5rem;
  }
  .form-item label {
    display: block;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  .format-btns {
    display: flex;
    gap: 0.4rem;
  }
  .format-btns .brutal-action-btn {
    flex: 1;
    text-align: center;
    padding: 0.4rem 0.25rem;
    font-size: 0.85rem;
    box-shadow: 3px 3px 0 #111;
    border-width: 2px;
  }
  .format-btns .brutal-action-btn:hover:not(:disabled) {
    box-shadow: 4px 4px 0 #111;
  }
  .brutal-range {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 12px;
    background: #fff;
    border: 2px solid #111;
    outline: none;
  }
  .brutal-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    background: #ffd900;
    border: 3px solid #111;
    cursor: pointer;
  }
  .select-actions {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  .select-count {
    font-size: 0.85rem;
    color: #555;
    text-align: center;
  }
  .divider {
    border-top: 3px dashed #111;
    margin: 1.5rem 0;
  }
  .info-box {
    border: 4px solid #111;
    padding: 1rem;
    margin-top: 1.5rem;
    background: #fafafa;
    font-size: 0.85rem;
  }
  .info-box strong {
    display: block;
    margin-bottom: 0.5rem;
    font-family: 'Syne', sans-serif;
  }
  .info-box ul {
    margin: 0;
    padding-left: 1.2rem;
    line-height: 1.8;
  }
  @media (max-width: 992px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .brutal-title {
      font-size: 2.5rem;
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
  [data-theme='dark'] .page-card,
  [data-theme='dark'] .info-box,
  [data-theme='dark'] .loading-box,
  [data-theme='dark'] .brutal-range {
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
  [data-theme='dark'] .page-card {
    box-shadow: 4px 4px 0 rgba(238, 238, 238, 0.1);
  }
  [data-theme='dark'] .page-card.selected {
    border-color: #4b7bff;
    box-shadow: 6px 6px 0 #4b7bff;
  }
  [data-theme='dark'] .card-preview {
    border-bottom-color: #eee;
    background: #333;
  }
  [data-theme='dark'] .card-footer {
    background: #111;
  }
  [data-theme='dark'] .divider {
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-range::-webkit-slider-thumb {
    background: #b28f00;
    border-color: #eee;
  }
  [data-theme='dark'] .progress-bar {
    border-color: #eee;
    background: #333;
  }
</style>
