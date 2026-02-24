<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">PDF<span>.文本提取()</span></h1>
      </header>

      <div class="brutal-pane">
        <div class="pane-header bg-yellow"><span>文本提取器</span></div>
        <div class="pane-body">
          <div v-if="!pdfFile" class="brutal-upload-area" @click="triggerUpload">
            <div class="upload-text">
              <h3>[ 选择 PDF 提取文本 ]</h3>
              <p>快速提取 PDF 中的纯文本内容</p>
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

            <div v-if="extracting" class="extracting-box">
              <p>⏳ 正在提取文本... ({{ currentPage }}/{{ totalPages }})</p>
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: Math.round((currentPage / totalPages) * 100) + '%' }"
                ></div>
              </div>
            </div>

            <div v-else-if="extractedText" class="results-section">
              <div class="results-header">
                <div class="stats">
                  <span class="stat-tag">{{ wordCount }} 字</span>
                  <span class="stat-tag alt">{{ lineCount }} 行</span>
                </div>
                <div class="actions">
                  <button class="brutal-action-btn" @click="copyText">📋 复制</button>
                  <button class="brutal-action-btn primary" @click="downloadText">
                    ⬇ 下载 TXT
                  </button>
                </div>
              </div>
              <textarea
                v-model="extractedText"
                class="brutal-textarea"
                readonly
                rows="15"
              ></textarea>
            </div>

            <button
              v-if="!extracting && !extractedText"
              class="brutal-action-btn primary large"
              @click="extractText"
            >
              COMMIT.提取文本
            </button>
          </div>
        </div>
      </div>

      <input ref="fileInput" type="file" hidden accept=".pdf" @change="handleFileSelect" />
    </div>
  </div>
</template>

<script setup>
  import { ref, shallowRef, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import pdfjsLib from '@/utils/pdf';
  import { useCopy, useFileHandler } from '@/composables';

  const { copyToClipboard } = useCopy();
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
  const pdfFile = ref(null);
  const pdfDocProxy = shallowRef(null);
  const totalPages = ref(0);
  const currentPage = ref(0);
  const extracting = ref(false);
  const extractedText = ref('');
  const wordCount = computed(() => extractedText.value.replace(/\s/g, '').length);
  const lineCount = computed(() => extractedText.value.split('\n').filter(l => l.trim()).length);
  const triggerUpload = () => triggerFileInput();
  const clearFile = () => {
    pdfFile.value = null;
    pdfDocProxy.value = null;
    totalPages.value = 0;
    extractedText.value = '';
  };
  const loadPdf = async file => {
    try {
      pdfFile.value = file;
      const buffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument(new Uint8Array(buffer));
      pdfDocProxy.value = await loadingTask.promise;
      totalPages.value = pdfDocProxy.value.numPages;
      extractedText.value = '';
    } catch (e) {
      console.error(e);
      ElMessage.error('加载 PDF 失败');
    }
  };
  const extractText = async () => {
    if (!pdfDocProxy.value) return;
    extracting.value = true;
    currentPage.value = 0;
    try {
      let fullText = '';
      for (let pageNum = 1; pageNum <= totalPages.value; pageNum++) {
        currentPage.value = pageNum;
        const page = await pdfDocProxy.value.getPage(pageNum);
        const textContent = await page.getTextContent();
        let pageText = '';
        let lastY = null;
        for (const item of textContent.items) {
          if (item.str) {
            if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) pageText += '\n';
            pageText += item.str;
            lastY = item.transform[5];
          }
        }
        if (pageText.trim()) fullText += `--- 第 ${pageNum} 页 ---\n\n${pageText.trim()}\n\n`;
      }
      extractedText.value = fullText.trim() || '未能提取到文本内容。PDF 可能是扫描件或图片格式。';
      if (fullText.trim()) ElMessage.success('文本提取成功');
      else ElMessage.warning('未找到可提取的文本');
    } catch (e) {
      console.error(e);
      ElMessage.error('提取失败: ' + e.message);
    } finally {
      extracting.value = false;
    }
  };
  const copyText = () => {
    copyToClipboard(extractedText.value, { success: '已复制到剪贴板', error: '复制失败' });
  };
  const downloadText = () => {
    const blob = new Blob([extractedText.value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pdfFile.value.name.replace('.pdf', '')}_text.txt`;
    a.click();
    URL.revokeObjectURL(url);
    ElMessage.success('下载成功');
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
  .extracting-box {
    text-align: center;
    padding: 2rem;
    border: 4px solid #111;
    margin-bottom: 2rem;
    background: #fafafa;
  }
  .extracting-box p {
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
  .results-section {
    margin-bottom: 2rem;
  }
  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .stats {
    display: flex;
    gap: 0.5rem;
  }
  .stat-tag {
    background: #ffd900;
    border: 2px solid #111;
    padding: 0.25rem 0.75rem;
    font-weight: 800;
    font-size: 0.85rem;
  }
  .stat-tag.alt {
    background: #4b7bff;
    color: #fff;
  }
  .actions {
    display: flex;
    gap: 0.5rem;
  }
  .brutal-textarea {
    width: 100%;
    border: 4px solid #111;
    padding: 1rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.9rem;
    line-height: 1.6;
    resize: none;
    background: #fff;
    box-sizing: border-box;
    box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.1);
  }
  .brutal-textarea:focus {
    outline: none;
    box-shadow: 6px 6px 0 #4b7bff;
    border-color: #4b7bff;
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
  [data-theme='dark'] .brutal-textarea,
  [data-theme='dark'] .extracting-box {
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
  [data-theme='dark'] .brutal-textarea {
    box-shadow: 6px 6px 0 rgba(238, 238, 238, 0.1);
  }
  [data-theme='dark'] .stat-tag {
    border-color: #eee;
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .stat-tag.alt {
    background: #2a4eb2;
  }
  [data-theme='dark'] .progress-bar {
    border-color: #eee;
    background: #333;
  }
</style>
