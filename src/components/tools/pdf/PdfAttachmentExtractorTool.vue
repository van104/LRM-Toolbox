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
        <h1 class="tool-title">PDF 附件提取</h1>
        <span class="tool-subtitle">PDF Attachment Extractor</span>
      </div>
      <div class="header-right"></div>
    </header>

    <main class="tool-content">
      <div class="layout-container">
        <div class="workbench glass-card">
          <div v-if="!pdfFile" class="upload-placeholder" @click="triggerUpload">
            <el-icon class="upload-icon">
              <Paperclip />
            </el-icon>
            <h3>选择带附件的 PDF</h3>
            <p class="hint">提取 PDF 内部嵌入的文件附件</p>
          </div>

          <div v-else class="workspace">
            <div class="file-info">
              <el-icon>
                <Document />
              </el-icon>
              <span>{{ pdfFile.name }}</span>
              <el-button text type="danger" @click="clearFile">移除</el-button>
            </div>

            <div v-if="analyzing" class="status-box">
              <el-icon class="is-loading">
                <Loading />
              </el-icon>
              <p>正在扫描附件...</p>
            </div>

            <div v-else-if="attachments.length > 0" class="attachment-list-container glass-card">
              <div class="list-header">
                <h3>发现 {{ attachments.length }} 个附件</h3>
                <el-button type="primary" size="small" @click="downloadAll">下载全部</el-button>
              </div>
              <div class="attachment-list">
                <div v-for="(file, idx) in attachments" :key="idx" class="attachment-item">
                  <div class="att-info">
                    <el-icon>
                      <Paperclip />
                    </el-icon>
                    <span class="att-name">{{ file.filename }}</span>
                    <span class="att-size">{{ formatSize(file.content.length) }}</span>
                  </div>
                  <el-button circle size="small" @click="downloadFile(file)">
                    <el-icon>
                      <Download />
                    </el-icon>
                  </el-button>
                </div>
              </div>
            </div>

            <div v-else class="status-box empty">
              <el-icon>
                <Warning />
              </el-icon>
              <p>未在文档中发现附件</p>
              <el-button type="primary" text @click="clearFile">尝试其他文件</el-button>
            </div>
          </div>

          <input ref="fileInput" type="file" hidden accept=".pdf" @change="handleFileSelect" />
        </div>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - PDF 附件提取</footer>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import {
    ArrowLeft,
    Paperclip,
    Document,
    Download,
    Loading,
    Warning
  } from '@element-plus/icons-vue';
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
      ElMessage.error('读取附件失败: ' + e.message);
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
    max-width: 600px;
  }

  .workbench {
    padding: 2rem;
    border-radius: 16px;
  }

  .upload-placeholder {
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
    height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    color: #64748b;
  }

  .upload-placeholder:hover {
    border-color: #3b82f6;
    background: #eff6ff;
    color: #3b82f6;
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
    color: #3b82f6;
  }

  .file-info span {
    flex: 1;
    font-weight: 500;
  }

  .status-box {
    text-align: center;
    padding: 3rem 1rem;
    color: #64748b;
  }

  .status-box .el-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .status-box.empty .el-icon {
    color: #f59e0b;
  }

  .attachment-list-container {
    padding: 1.5rem;
    border-radius: 12px;
  }

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .list-header h3 {
    margin: 0;
    font-size: 1rem;
  }

  .attachment-list {
    max-height: 300px;
    overflow-y: auto;
  }

  .attachment-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem;
    background: #f8fafc;
    border-radius: 8px;
    margin-bottom: 0.5rem;
    border: 1px solid #e2e8f0;
  }

  .att-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    overflow: hidden;
  }

  .att-info .el-icon {
    color: #64748b;
  }

  .att-name {
    font-weight: 500;
    font-size: 0.9rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .att-size {
    font-size: 0.75rem;
    color: #94a3b8;
    background: #edf2f7;
    padding: 2px 6px;
    border-radius: 4px;
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
