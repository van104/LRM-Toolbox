<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">PDF附件<span>.解析与提取()</span></h1>
        <button class="brutal-btn clear-btn" :disabled="!pdfFile" @click="clearFile">
          清空内存
        </button>
      </header>

      <div class="brutal-grid">
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span class="text-black">输入源.附随文件检测</span>
          </div>

          <div v-if="!pdfFile" class="upload-wrapper" @click="triggerUpload">
            <input ref="fileInput" type="file" hidden accept=".pdf" @change="handleFileSelect" />
            <div class="brutal-upload-area">
              <div class="upload-text">
                <h3>[ 唤醒检测协议 / 投喂 PDF ]</h3>
                <p>扫描并提取 PDF 内部嵌入的文件附件</p>
                <p>支持深度遍历元数据节点</p>
              </div>
            </div>
            <div class="brutal-status-panel">
              <h4>// 系统状态: 待机中</h4>
              <p>等待源文件载入以执行解析管道...</p>
            </div>
          </div>

          <div v-else class="upload-wrapper current-file-wrapper">
            <input ref="fileInput" type="file" hidden accept=".pdf" @change="handleFileSelect" />
            <div class="file-loaded-info">
              <h3>// SOURCE LOADED</h3>
              <p class="filename">{{ pdfFile.name }}</p>
              <div class="action-row">
                <button class="brutal-action-btn primary" @click="triggerUpload">重新挂载源</button>
              </div>
            </div>

            <div v-if="analyzing" class="brutal-status-panel process-panel">
              <h4>// 引擎协程运行中</h4>
              <p class="blink-text">› 正在遍历内部字节流...</p>
              <p>› 寻址 Attachment 字典树...</p>
            </div>
            <div v-else class="brutal-status-panel success-panel">
              <h4>// 扫描结束</h4>
              <p>
                › 检测到
                <strong style="font-size: 1.1rem">{{ attachments.length }}</strong> 处文件绑定标记。
              </p>
            </div>
          </div>
        </div>

        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">分离输出.提取沙盒</span>
          </div>

          <div v-if="analyzing" class="empty-report">
            <p>// 等待数据解包...</p>
          </div>
          <div v-else-if="attachments.length > 0" class="brutal-report">
            <div class="report-overview">
              <div>
                <h3>发现 {{ attachments.length }} 个附件</h3>
              </div>
              <button class="brutal-action-btn large" @click="downloadAll">下载全部[ZIP]</button>
            </div>

            <div class="attachments-container">
              <div v-for="(file, idx) in attachments" :key="idx" class="brutal-attachment-item">
                <div class="att-info">
                  <span class="att-index">[{{ idx.toString().padStart(2, '0') }}]</span>
                  <div class="att-details">
                    <span class="att-name">{{ file.filename }}</span>
                    <span class="att-size">{{ formatSize(file.content.length) }}</span>
                  </div>
                </div>
                <button class="brutal-action-btn" @click="downloadFile(file)">抓取 .FILE</button>
              </div>
            </div>
          </div>

          <div v-else-if="pdfFile" class="empty-report warn">
            <p>// 警告：节点无数据</p>
            <p>未在当前文档中发现任何附件。</p>
          </div>
          <div v-else class="empty-report">
            <p>// 暂无任务...</p>
            <p>需先在左侧投喂原始 PDF 文件。</p>
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
  import pdfjsLib from '@/utils/pdf';
  import JSZip from 'jszip';
  import { saveAs } from 'file-saver';
  import { useFileHandler } from '@/composables';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const { fileInput, triggerFileInput, handleFileSelect, formatSize } = useFileHandler({
    accept: '.pdf',
    readMode: 'none',
    onSuccess: result => {
      pdfFile.value = result.file;
      attachments.value = [];
      scanAttachments(result.file);
    }
  });

  const pdfFile = ref(null);
  const analyzing = ref(false);
  const attachments = ref([]);

  const triggerUpload = () => triggerFileInput();

  const clearFile = () => {
    pdfFile.value = null;
    attachments.value = [];
    if (fileInput.value) fileInput.value.value = '';
  };

  const scanAttachments = async file => {
    analyzing.value = true;
    try {
      const buffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument(buffer);
      const pdfDoc = await loadingTask.promise;

      const files = await pdfDoc.getAttachments();

      if (files) {
        attachments.value = Object.keys(files).map(filename => ({
          filename: filename,
          content: files[filename].content
        }));
      } else {
        attachments.value = [];
      }
    } catch (e) {
      console.error(e);
      ElMessage.error({ message: '读取附件失败: ' + e.message, grouping: true });
    } finally {
      analyzing.value = false;
    }
  };

  const downloadFile = file => {
    const blob = new Blob([file.content]);
    saveAs(blob, file.filename);
  };

  const downloadAll = async () => {
    if (attachments.value.length === 0) return;

    if (attachments.value.length === 1) {
      downloadFile(attachments.value[0]);
      return;
    }

    const zip = new JSZip();
    const folder = zip.folder('attachments');

    attachments.value.forEach(file => {
      folder.file(file.filename, file.content);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `attachments_${pdfFile.value.name.replace('.pdf', '')}.zip`);
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
    color: #666;
    border-color: #666;
    box-shadow: 6px 6px 0px #666;
    cursor: not-allowed;
  }

  .brutal-btn.clear-btn {
    background: #ff4b4b;
    color: #fff;
  }

  .brutal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2.5rem;
    margin-bottom: 2rem;
    min-height: 60vh;
  }

  .brutal-pane {
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
    transition: transform 0.2s;
  }

  .brutal-pane:hover {
    transform: translate(-4px, -4px);
    box-shadow: 16px 16px 0px #111;
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
  .text-white {
    color: #fff;
  }
  .text-black {
    color: #111;
  }

  .upload-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #fff;
    overflow: hidden;
  }

  .brutal-upload-area {
    flex: 1;
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
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.5rem;
    font-weight: 800;
    margin: 0 0 1rem 0;
  }
  .upload-text p {
    font-family: 'IBM Plex Mono', monospace;
    color: #666;
    margin: 0;
  }

  .brutal-status-panel {
    background: #f1f5f9;
    padding: 1.25rem;
    border-top: 4px solid #111;
    margin-top: auto;
  }
  .brutal-status-panel h4 {
    margin: 0 0 0.75rem 0;
    font-weight: 800;
    color: #111;
  }
  .brutal-status-panel p {
    margin: 0 0 0.5rem 0;
    font-size: 0.85rem;
    color: #444;
  }

  .process-panel {
    background: #ffd900;
  }
  .process-panel p {
    color: #111;
    font-weight: bold;
  }

  .success-panel {
    background: #00e572;
  }
  .success-panel p {
    color: #111;
    font-weight: bold;
  }

  .current-file-wrapper {
    background: #fdfae5;
  }
  .file-loaded-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
  }
  .file-loaded-info h3 {
    margin: 0 0 1rem 0;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
  }
  .file-loaded-info .filename {
    background: #111;
    color: #fff;
    padding: 0.5rem 1rem;
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 2rem;
    border: 2px solid #111;
    box-shadow: 4px 4px 0px #111;
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
  }

  .brutal-action-btn:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .brutal-action-btn:active:not(:disabled) {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px #111;
  }
  .brutal-action-btn.primary {
    background: #ffd900;
  }
  .brutal-action-btn.large {
    padding: 0.8rem 2rem;
    font-size: 1.25rem;
    background: #00e572;
  }

  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }
  .blink-text {
    animation: blink 1.5s infinite;
  }

  /* 抽屉/报告区域 */
  .empty-report {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: #fdfae5;
    color: #111;
    font-style: italic;
    font-weight: bold;
    padding: 2rem;
    text-align: center;
  }
  .empty-report.warn {
    background: #ff4b4b;
    color: #fff;
  }

  .brutal-report {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    flex: 1;
    overflow: hidden;
  }

  .report-overview {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 4px solid #111;
    padding-bottom: 1rem;
  }

  .report-overview h3 {
    margin: 0;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.5rem;
    font-weight: 800;
  }

  .attachments-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
    padding-right: 0.5rem;
  }

  /* 自定义滚动条 */
  .attachments-container::-webkit-scrollbar {
    width: 12px;
  }
  .attachments-container::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-left: 3px solid #111;
  }
  .attachments-container::-webkit-scrollbar-thumb {
    background: #111;
  }

  .brutal-attachment-item {
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    background: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
  }

  .att-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    overflow: hidden;
  }

  .att-index {
    background: #111;
    color: #fff;
    font-weight: bold;
    padding: 0.25rem 0.5rem;
    font-size: 0.9rem;
  }

  .att-details {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .att-name {
    font-weight: bold;
    font-size: 1.1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .att-size {
    font-size: 0.85rem;
    color: #666;
    font-family: 'IBM Plex Mono', monospace;
  }

  @media (max-width: 1024px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .brutal-title {
      font-size: 2.5rem;
    }
    .report-overview {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }
    .brutal-attachment-item {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
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
  [data-theme='dark'] .upload-wrapper,
  [data-theme='dark'] .brutal-attachment-item,
  [data-theme='dark'] .file-loaded-info {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }

  [data-theme='dark'] .pane-header,
  [data-theme='dark'] .report-overview {
    border-color: #eee;
  }

  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .file-loaded-info .filename {
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
  [data-theme='dark'] .brutal-pane:hover {
    box-shadow: 16px 16px 0px #eee;
  }

  [data-theme='dark'] .brutal-upload-area {
    background: #222;
    border-color: #eee;
  }
  [data-theme='dark'] .empty-report,
  [data-theme='dark'] .current-file-wrapper {
    background: #222;
    color: #eee;
  }

  [data-theme='dark'] .brutal-status-panel {
    background: #1a1a1a;
    border-top-color: #eee;
  }
  [data-theme='dark'] .brutal-status-panel h4 {
    color: #eee;
  }
  [data-theme='dark'] .brutal-status-panel p {
    color: #aaa;
  }

  [data-theme='dark'] .bg-yellow,
  [data-theme='dark'] .process-panel {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .brutal-btn.clear-btn,
  [data-theme='dark'] .empty-report.warn {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .text-black,
  [data-theme='dark'] .process-panel p {
    color: #fff;
  }
  [data-theme='dark'] .brutal-action-btn.primary {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .brutal-action-btn.large,
  [data-theme='dark'] .success-panel {
    background: #00994c;
    color: #fff;
  }

  [data-theme='dark'] .att-size {
    color: #aaa;
  }
  [data-theme='dark'] .attachments-container::-webkit-scrollbar-track {
    background: #1a1a1a;
    border-left-color: #eee;
  }
  [data-theme='dark'] .attachments-container::-webkit-scrollbar-thumb {
    background: #eee;
  }
</style>
