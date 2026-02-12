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
        <h1 class="tool-title">PDF 页面调整</h1>
        <span class="tool-subtitle">PDF Scale / Resizer</span>
      </div>
      <div class="header-right"></div>
    </header>

    <main class="tool-content">
      <div class="layout-container">
        <div class="workbench glass-card">
          <div v-if="!pdfFile" class="upload-placeholder" @click="triggerUpload">
            <el-icon class="upload-icon">
              <FullScreen />
            </el-icon>
            <h3>选择 PDF 文件</h3>
            <p class="hint">调整页面尺寸（如 A4、A3、Letter）</p>
          </div>

          <div v-else class="workspace">
            <div class="file-info">
              <el-icon>
                <Document />
              </el-icon>
              <span>{{ pdfFile.name }} ({{ pageCount }} 页)</span>
              <el-button text type="danger" @click="clearFile">移除</el-button>
            </div>

            <div class="settings-panel glass-card">
              <h4>调整设置</h4>

              <div class="setting-item">
                <label>目标尺寸</label>
                <el-select v-model="targetSize" style="width: 100%">
                  <el-option label="A4 (210 x 297 mm)" value="A4" />
                  <el-option label="A3 (297 x 420 mm)" value="A3" />
                  <el-option label="A5 (148 x 210 mm)" value="A5" />
                  <el-option label="Letter (8.5 x 11 in)" value="Letter" />
                  <el-option label="Legal (8.5 x 14 in)" value="Legal" />
                </el-select>
              </div>

              <div class="setting-item">
                <label>方向</label>
                <el-radio-group v-model="orientation">
                  <el-radio value="portrait">纵向</el-radio>
                  <el-radio value="landscape">横向</el-radio>
                </el-radio-group>
              </div>

              <div class="setting-item">
                <label>内容缩放模式</label>
                <el-radio-group v-model="fitMode">
                  <el-radio value="fit">适应页面 (保持比例)</el-radio>
                  <el-radio value="fill">填充页面 (可能变形)</el-radio>
                </el-radio-group>
              </div>
            </div>

            <el-button
              type="primary"
              size="large"
              class="action-btn"
              :loading="processing"
              @click="processPdf"
            >
              开始调整并下载
            </el-button>
          </div>

          <input ref="fileInput" type="file" hidden accept=".pdf" @change="handleFileSelect" />
        </div>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - PDF 页面调整</footer>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { ArrowLeft, FullScreen, Document } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';
  import { PDFDocument, PageSizes } from 'pdf-lib';
  import { useFileHandler } from '@/composables';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const { fileInput, triggerFileInput, handleFileSelect } = useFileHandler({
    accept: '.pdf',
    readMode: 'none',
    onSuccess: result => {
      loadPdf(result.file);
    }
  });

  const pdfFile = ref(null);
  const pdfBytes = ref(null);
  const pageCount = ref(0);
  const processing = ref(false);

  const targetSize = ref('A4');
  const orientation = ref('portrait');
  const fitMode = ref('fit');

  const sizes = {
    A4: PageSizes.A4,
    A3: PageSizes.A3,
    A5: [419.53, 595.28],
    Letter: PageSizes.Letter,
    Legal: [612.0, 1008.0]
  };

  const triggerUpload = () => triggerFileInput();

  const loadPdf = async file => {
    try {
      pdfFile.value = file;
      const buffer = await file.arrayBuffer();
      pdfBytes.value = new Uint8Array(buffer);

      const pdfDoc = await PDFDocument.load(pdfBytes.value);
      pageCount.value = pdfDoc.getPageCount();
    } catch (error) {
      ElMessage.error('无法读取 PDF 文件');
      console.error(error);
    }
  };

  const clearFile = () => {
    pdfFile.value = null;
    pdfBytes.value = null;
    pageCount.value = 0;
  };

  const processPdf = async () => {
    if (!pdfBytes.value) return;

    processing.value = true;
    try {
      const srcDoc = await PDFDocument.load(pdfBytes.value);
      const newDoc = await PDFDocument.create();

      let [width, height] = sizes[targetSize.value];
      if (orientation.value === 'landscape') {
        [width, height] = [height, width];
      }

      const pages = srcDoc.getPages();
      const embeddedPages = await newDoc.embedPages(pages);

      for (let i = 0; i < pages.length; i++) {
        const embeddedPage = embeddedPages[i];
        const newPage = newDoc.addPage([width, height]);

        const { width: srcWidth, height: srcHeight } = embeddedPage;

        let drawWidth = width;
        let drawHeight = height;
        let x = 0;
        let y = 0;

        if (fitMode.value === 'fit') {
          const scale = Math.min(width / srcWidth, height / srcHeight);
          drawWidth = srcWidth * scale;
          drawHeight = srcHeight * scale;

          x = (width - drawWidth) / 2;
          y = (height - drawHeight) / 2;
        }

        newPage.drawPage(embeddedPage, {
          x,
          y,
          width: drawWidth,
          height: drawHeight
        });
      }

      const modifiedBytes = await newDoc.save();
      const blob = new Blob([modifiedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resized_${pdfFile.value.name}`;
      a.click();
      URL.revokeObjectURL(url);

      ElMessage.success('调整完成');
    } catch (e) {
      console.error(e);
      ElMessage.error('调整失败: ' + e.message);
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

  .settings-panel {
    padding: 1.5rem;
    border-radius: 12px;
    margin-bottom: 1.5rem;
  }

  .settings-panel h4 {
    margin: 0 0 1rem;
    font-size: 1rem;
  }

  .setting-item {
    margin-bottom: 1.5rem;
  }

  .setting-item label {
    display: block;
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  .action-btn {
    width: 100%;
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
