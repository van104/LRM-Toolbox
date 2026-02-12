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
        <h1 class="tool-title">PDF 损坏修复</h1>
        <span class="tool-subtitle">PDF Repair</span>
      </div>
      <div class="header-right"></div>
    </header>

    <main class="tool-content">
      <div class="layout-container">
        <div class="workbench glass-card">
          <div v-if="!pdfFile" class="upload-placeholder" @click="triggerUpload">
            <el-icon class="upload-icon">
              <FirstAidKit />
            </el-icon>
            <h3>选择损坏的 PDF 文件</h3>
            <p class="hint">尝试修复无法正常打开的 PDF</p>
          </div>

          <div v-else class="workspace">
            <div class="file-info">
              <el-icon>
                <Document />
              </el-icon>
              <span>{{ pdfFile.name }} ({{ formatSize(pdfFile.size) }})</span>
              <el-button text type="danger" @click="clearFile">移除</el-button>
            </div>

            <div class="repair-status glass-card">
              <div class="status-header">
                <el-icon :class="statusClass">
                  <component :is="statusIcon" />
                </el-icon>
                <h3>{{ statusTitle }}</h3>
              </div>
              <p class="status-message">{{ statusMessage }}</p>

              <div v-if="repairLog.length > 0" class="repair-log">
                <p class="log-title">修复日志：</p>
                <div class="log-content">
                  <div
                    v-for="(log, idx) in repairLog"
                    :key="idx"
                    class="log-item"
                    :class="log.type"
                  >
                    <el-icon>
                      <component :is="getLogIcon(log.type)" />
                    </el-icon>
                    <span>{{ log.message }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="action-buttons">
              <el-button
                v-if="status === 'ready'"
                type="primary"
                size="large"
                :loading="processing"
                @click="startRepair"
              >
                <el-icon>
                  <FirstAidKit />
                </el-icon>
                开始修复
              </el-button>

              <el-button
                v-if="status === 'success'"
                type="success"
                size="large"
                @click="downloadRepaired"
              >
                <el-icon>
                  <Download />
                </el-icon>
                下载修复后的 PDF
              </el-button>

              <el-button
                v-if="status === 'failed'"
                type="warning"
                size="large"
                @click="retryRepair"
              >
                重试修复
              </el-button>
            </div>
          </div>

          <input ref="fileInput" type="file" hidden accept=".pdf" @change="handleFileSelect" />
        </div>

        <div class="info-card glass-card">
          <h4>关于 PDF 修复</h4>
          <p>此工具尝试通过以下方式修复损坏的 PDF：</p>
          <ul>
            <li>重建 PDF 对象索引 (xref)</li>
            <li>修复页面引用错误</li>
            <li>清理无效的对象引用</li>
            <li>重新序列化文档结构</li>
          </ul>
          <el-alert type="info" :closable="false">
            <p style="margin: 0; font-size: 0.85rem">
              注意：严重损坏的 PDF 可能无法完全修复。建议修复后检查文档内容完整性。
            </p>
          </el-alert>
        </div>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - PDF 损坏修复</footer>
  </div>
</template>

<script setup>
  import { ref, computed, shallowRef } from 'vue';
  import { useRouter } from 'vue-router';
  import { ArrowLeft, FirstAidKit, Document, Download } from '@element-plus/icons-vue';
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

  const statusClass = computed(() => ({
    'status-ready': status.value === 'ready',
    'status-repairing': status.value === 'repairing',
    'status-success': status.value === 'success',
    'status-failed': status.value === 'failed'
  }));

  const statusIcon = computed(() => {
    switch (status.value) {
      case 'ready':
        return 'FirstAidKit';
      case 'repairing':
        return 'Loading';
      case 'success':
        return 'Check';
      case 'failed':
        return 'Close';
      default:
        return 'FirstAidKit';
    }
  });

  const statusTitle = computed(() => {
    switch (status.value) {
      case 'ready':
        return '准备修复';
      case 'repairing':
        return '正在修复...';
      case 'success':
        return '修复成功';
      case 'failed':
        return '修复失败';
      default:
        return '准备修复';
    }
  });

  const statusMessage = computed(() => {
    switch (status.value) {
      case 'ready':
        return '点击下方按钮开始尝试修复此 PDF 文件';
      case 'repairing':
        return '正在分析和修复文件结构，请稍候...';
      case 'success':
        return 'PDF 已成功修复！您可以下载修复后的文件。';
      case 'failed':
        return '无法修复此 PDF 文件，可能损坏过于严重。';
      default:
        return '';
    }
  });

  const getLogIcon = type => {
    switch (type) {
      case 'success':
        return 'Check';
      case 'error':
        return 'Close';
      case 'warning':
        return 'Warning';
      default:
        return 'Loading';
    }
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
    width: 100px;
    display: flex;
    align-items: center;
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
    justify-content: center;
  }

  .layout-container {
    width: 100%;
    max-width: 700px;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .workbench {
    padding: 2rem;
    border-radius: 16px;
  }

  .upload-placeholder {
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
    height: 250px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    color: #64748b;
  }

  .upload-placeholder:hover {
    border-color: #10b981;
    background: #ecfdf5;
    color: #10b981;
  }

  .upload-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .hint {
    font-size: 0.85rem;
    margin-top: 0.5rem;
    opacity: 0.7;
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #f1f5f9;
    padding: 0.75rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
  }

  .file-info .el-icon {
    font-size: 1.5rem;
    color: #10b981;
  }

  .file-info span {
    flex: 1;
    font-weight: 500;
  }

  .repair-status {
    padding: 1.5rem;
    border-radius: 12px;
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .status-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .status-header .el-icon {
    font-size: 2rem;
  }

  .status-header h3 {
    margin: 0;
    font-size: 1.25rem;
  }

  .status-message {
    color: #64748b;
    margin: 0;
  }

  .status-ready .el-icon {
    color: #3b82f6;
  }

  .status-repairing .el-icon {
    color: #f59e0b;
    animation: spin 1s linear infinite;
  }

  .status-success .el-icon {
    color: #10b981;
  }

  .status-failed .el-icon {
    color: #ef4444;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  .repair-log {
    margin-top: 1.5rem;
    text-align: left;
  }

  .log-title {
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  .log-content {
    max-height: 200px;
    overflow-y: auto;
    background: #f8fafc;
    border-radius: 8px;
    padding: 0.75rem;
  }

  .log-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    padding: 0.25rem 0;
  }

  .log-item.success {
    color: #10b981;
  }

  .log-item.error {
    color: #ef4444;
  }

  .log-item.warning {
    color: #f59e0b;
  }

  .log-item.info {
    color: #64748b;
  }

  .action-buttons {
    display: flex;
    justify-content: center;
  }

  .action-buttons .el-button {
    min-width: 200px;
  }

  .info-card {
    padding: 1.5rem;
    border-radius: 12px;
  }

  .info-card h4 {
    margin: 0 0 0.75rem;
    font-size: 1rem;
  }

  .info-card p {
    margin: 0 0 0.5rem;
    font-size: 0.9rem;
    color: #64748b;
  }

  .info-card ul {
    margin: 0 0 1rem;
    padding-left: 1.25rem;
    font-size: 0.9rem;
    color: #64748b;
  }

  .info-card li {
    margin-bottom: 0.25rem;
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
