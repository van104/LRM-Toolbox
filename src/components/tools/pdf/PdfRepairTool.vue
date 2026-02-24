<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">PDF<span>.损坏修复()</span></h1>
        <button v-if="pdfFile" class="brutal-btn clear-btn" @click="clearFile">清除文件</button>
      </header>

      <div class="brutal-grid" style="grid-template-columns: 1fr">
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span class="text-black">1. 载入损坏的 PDF</span>
          </div>

          <div class="pane-body">
            <div v-if="!pdfFile" class="brutal-upload-area" @click="triggerUpload">
              <div class="upload-text">
                <h3>[ 选择损坏的 PDF 文件 ]</h3>
                <p>尝试修复无法正常打开的 PDF</p>
              </div>
            </div>

            <div v-else>
              <div class="file-badge">
                <strong>{{ pdfFile.name }}</strong>
                <span>({{ formatSize(pdfFile.size) }})</span>
              </div>

              <div class="repair-status-box" :class="'status-' + status">
                <div class="status-header-text">
                  <span class="status-icon">{{ statusEmoji }}</span>
                  <h3>{{ statusTitle }}</h3>
                </div>
                <p class="status-msg">{{ statusMessage }}</p>

                <div v-if="repairLog.length > 0" class="repair-log">
                  <p class="log-title">// 修复日志：</p>
                  <div class="log-content">
                    <div
                      v-for="(log, idx) in repairLog"
                      :key="idx"
                      class="log-item"
                      :class="log.type"
                    >
                      <span class="log-prefix">{{ getLogPrefix(log.type) }}</span>
                      <span>{{ log.message }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="action-buttons">
                <button
                  v-if="status === 'ready'"
                  class="brutal-action-btn primary large"
                  :disabled="processing"
                  @click="startRepair"
                >
                  {{ processing ? 'REPAIRING...' : 'COMMIT.开始修复' }}
                </button>

                <button
                  v-if="status === 'success'"
                  class="brutal-action-btn primary large"
                  @click="downloadRepaired"
                >
                  DOWNLOAD.下载修复后的 PDF
                </button>

                <button
                  v-if="status === 'failed'"
                  class="brutal-action-btn large"
                  @click="retryRepair"
                >
                  RETRY.重试修复
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="brutal-pane">
          <div class="pane-header bg-black">
            <span class="text-white">README :: 关于 PDF 修复</span>
          </div>
          <div class="pane-body info-section">
            <p>此工具尝试通过以下方式修复损坏的 PDF：</p>
            <ul>
              <li>重建 PDF 对象索引 (xref)</li>
              <li>修复页面引用错误</li>
              <li>清理无效的对象引用</li>
              <li>重新序列化文档结构</li>
            </ul>
            <div class="info-box warn">
              <strong>⚠️ 注意</strong>
              <p>严重损坏的 PDF 可能无法完全修复。建议修复后检查文档内容完整性。</p>
            </div>
          </div>
        </div>
      </div>

      <input ref="fileInput" type="file" hidden accept=".pdf" @change="handleFileSelect" />
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, shallowRef } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { PDFDocument } from 'pdf-lib';
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
      loadPdf(result.file);
    }
  });
  const pdfFile = ref(null);
  const pdfBytes = ref(null);
  const repairedBytes = shallowRef(null);
  const processing = ref(false);
  const status = ref('ready');
  const repairLog = ref([]);

  const statusEmoji = computed(() => {
    const map = { ready: '🔧', repairing: '⏳', success: '✅', failed: '❌' };
    return map[status.value] || '🔧';
  });

  const statusTitle = computed(() => {
    const map = {
      ready: '准备修复',
      repairing: '正在修复...',
      success: '修复成功',
      failed: '修复失败'
    };
    return map[status.value] || '准备修复';
  });

  const statusMessage = computed(() => {
    const map = {
      ready: '点击下方按钮开始尝试修复此 PDF 文件',
      repairing: '正在分析和修复文件结构，请稍候...',
      success: 'PDF 已成功修复！您可以下载修复后的文件。',
      failed: '无法修复此 PDF 文件，可能损坏过于严重。'
    };
    return map[status.value] || '';
  });

  const getLogPrefix = type => {
    const map = { success: '[OK]', error: '[ERR]', warning: '[WARN]', info: '[INFO]' };
    return map[type] || '[LOG]';
  };

  const triggerUpload = () => triggerFileInput();

  const loadPdf = async file => {
    pdfBytes.value = new Uint8Array(await file.arrayBuffer());
    status.value = 'ready';
    repairLog.value = [];
    repairedBytes.value = null;
  };

  const clearFile = () => {
    pdfFile.value = null;
    pdfBytes.value = null;
    repairedBytes.value = null;
    status.value = 'ready';
    repairLog.value = [];
  };

  const addLog = (type, message) => {
    repairLog.value.push({ type, message });
  };

  const startRepair = async () => {
    if (!pdfBytes.value) return;

    processing.value = true;
    status.value = 'repairing';
    repairLog.value = [];

    try {
      addLog('info', '开始分析 PDF 文件结构...');

      let pdfDoc;
      try {
        pdfDoc = await PDFDocument.load(pdfBytes.value, {
          ignoreEncryption: true,
          updateMetadata: false
        });
        addLog('success', 'PDF 基本结构可读');
      } catch {
        addLog('warning', '标准加载失败，尝试宽松模式...');

        try {
          pdfDoc = await PDFDocument.load(pdfBytes.value, {
            ignoreEncryption: true,
            throwOnInvalidObject: false
          });
          addLog('success', '宽松模式加载成功');
        } catch (e2) {
          throw new Error('无法解析 PDF 结构: ' + e2.message);
        }
      }

      const pageCount = pdfDoc.getPageCount();
      addLog('success', `检测到 ${pageCount} 页`);

      addLog('info', '创建新的 PDF 文档...');
      const newPdfDoc = await PDFDocument.create();

      addLog('info', '复制页面内容...');
      let copiedPages = 0;

      try {
        const pagesToCopy = await newPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
        for (const page of pagesToCopy) {
          newPdfDoc.addPage(page);
          copiedPages++;
        }
        addLog('success', `成功复制 ${copiedPages} 页`);
      } catch {
        addLog('warning', '批量复制失败，尝试逐页复制...');

        for (let i = 0; i < pageCount; i++) {
          try {
            const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
            newPdfDoc.addPage(copiedPage);
            copiedPages++;
          } catch {
            addLog('warning', `第 ${i + 1} 页复制失败，跳过`);
          }
        }
        addLog('success', `成功恢复 ${copiedPages}/${pageCount} 页`);
      }

      if (copiedPages === 0) {
        throw new Error('没有可恢复的页面');
      }

      try {
        const title = pdfDoc.getTitle();
        const author = pdfDoc.getAuthor();
        if (title) newPdfDoc.setTitle(title);
        if (author) newPdfDoc.setAuthor(author);
        addLog('success', '元数据已恢复');
      } catch {
        addLog('warning', '元数据恢复失败');
      }

      addLog('info', '保存修复后的文档...');
      repairedBytes.value = await newPdfDoc.save();

      addLog('success', '修复完成！');
      status.value = 'success';
      ElMessage.success('PDF 修复成功');
    } catch (e) {
      console.error(e);
      addLog('error', e.message);
      status.value = 'failed';
      ElMessage.error('修复失败: ' + e.message);
    } finally {
      processing.value = false;
    }
  };

  const retryRepair = () => {
    status.value = 'ready';
    repairLog.value = [];
    repairedBytes.value = null;
  };

  const downloadRepaired = () => {
    if (!repairedBytes.value) return;

    const blob = new Blob([repairedBytes.value], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `repaired_${pdfFile.value.name}`;
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
    color: #00e572;
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

  .brutal-grid {
    display: grid;
    gap: 2.5rem;
    margin-bottom: 2rem;
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
  .bg-black {
    background: #111;
  }
  .text-white {
    color: #fff;
  }
  .text-black {
    color: #111;
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
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.95rem;
    color: #555;
  }

  .file-badge {
    background: #fff;
    border: 3px solid #111;
    padding: 0.75rem 1.5rem;
    box-shadow: 4px 4px 0px #111;
    margin-bottom: 2rem;
    font-family: 'IBM Plex Mono', monospace;
    word-break: break-all;
  }

  .brutal-action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.6rem 2rem;
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
  .brutal-action-btn.primary {
    background: #00e572;
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
  .brutal-action-btn.large {
    padding: 1.25rem 3rem;
    font-size: 1.25rem;
    letter-spacing: 1px;
    width: 100%;
  }

  /* Repair Status */
  .repair-status-box {
    border: 4px solid #111;
    padding: 2rem;
    margin-bottom: 2rem;
    background: #fafafa;
    text-align: center;
  }
  .repair-status-box.status-ready {
    border-left: 8px solid #4b7bff;
  }
  .repair-status-box.status-repairing {
    border-left: 8px solid #ffd900;
  }
  .repair-status-box.status-success {
    border-left: 8px solid #00e572;
  }
  .repair-status-box.status-failed {
    border-left: 8px solid #ff4b4b;
  }
  .status-header-text {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }
  .status-icon {
    font-size: 2rem;
  }
  .status-header-text h3 {
    margin: 0;
    font-family: 'Syne', sans-serif;
    font-size: 1.4rem;
    font-weight: 800;
  }
  .status-msg {
    color: #555;
    margin: 0;
    font-size: 0.95rem;
  }

  .repair-log {
    margin-top: 1.5rem;
    text-align: left;
  }
  .log-title {
    font-weight: bold;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }
  .log-content {
    max-height: 250px;
    overflow-y: auto;
    background: #fff;
    border: 3px solid #111;
    padding: 1rem;
    font-size: 0.85rem;
  }
  .log-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0;
  }
  .log-prefix {
    font-weight: 800;
    min-width: 60px;
  }
  .log-item.success {
    color: #00994c;
  }
  .log-item.error {
    color: #cc0000;
  }
  .log-item.warning {
    color: #b28f00;
  }
  .log-item.info {
    color: #555;
  }

  .action-buttons {
    display: flex;
    justify-content: center;
  }

  .info-section {
    font-size: 0.95rem;
  }
  .info-section p {
    margin: 0 0 0.75rem;
  }
  .info-section ul {
    margin: 0 0 1.5rem;
    padding-left: 1.25rem;
    line-height: 2;
  }

  .info-box {
    border: 4px solid #111;
    padding: 1rem 1.5rem;
    background: #e8ffe8;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.9rem;
  }
  .info-box.warn {
    background: #fff8e0;
  }
  .info-box strong {
    display: block;
    margin-bottom: 0.5rem;
    font-family: 'Syne', sans-serif;
    font-size: 1.05rem;
  }
  .info-box p {
    margin: 0;
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
  [data-theme='dark'] .brutal-upload-area,
  [data-theme='dark'] .file-badge,
  [data-theme='dark'] .brutal-input {
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
  [data-theme='dark'] .brutal-pane:hover {
    box-shadow: 16px 16px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn.primary {
    background: #00994c;
    color: #fff;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-btn.clear-btn {
    background: #cc0000;
    color: #fff;
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
  [data-theme='dark'] .repair-status-box {
    background: #222;
    border-color: #eee;
  }
  [data-theme='dark'] .log-content {
    background: #1a1a1a;
    border-color: #eee;
  }
  [data-theme='dark'] .info-box {
    background: #1a2a1a;
    border-color: #eee;
  }
  [data-theme='dark'] .info-box.warn {
    background: #2a2a1a;
  }
  [data-theme='dark'] .file-badge {
    box-shadow: 4px 4px 0px #eee;
  }
</style>
