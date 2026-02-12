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
        <h1 class="tool-title">PDF 文本提取</h1>
        <span class="tool-subtitle">PDF Text Extractor</span>
      </div>
      <div class="header-right"></div>
    </header>

    <main class="tool-content">
      <div class="layout-container">
        <div class="workbench glass-card">
          <div v-if="!pdfFile" class="upload-placeholder" @click="triggerUpload">
            <el-icon class="upload-icon">
              <DocumentCopy />
            </el-icon>
            <h3>选择 PDF 提取文本</h3>
            <p class="hint">快速提取 PDF 中的纯文本内容</p>
          </div>

          <div v-else class="workspace">
            <div class="file-info">
              <el-icon>
                <Document />
              </el-icon>
              <span>{{ pdfFile.name }} ({{ totalPages }} 页)</span>
              <el-button text type="danger" @click="clearFile">移除</el-button>
            </div>

            <div v-if="extracting" class="extracting-state">
              <el-icon class="is-loading">
                <Loading />
              </el-icon>
              <p>正在提取文本... ({{ currentPage }}/{{ totalPages }})</p>
              <el-progress :percentage="Math.round((currentPage / totalPages) * 100)" />
            </div>

            <div v-else-if="extractedText" class="results">
              <div class="results-header">
                <div class="stats">
                  <el-tag>{{ wordCount }} 字</el-tag>
                  <el-tag type="info">{{ lineCount }} 行</el-tag>
                </div>
                <div class="actions">
                  <el-button @click="copyText"
                    ><el-icon>
                      <CopyDocument />
                    </el-icon>
                    复制</el-button
                  >
                  <el-button type="primary" @click="downloadText"
                    ><el-icon>
                      <Download />
                    </el-icon>
                    下载 TXT</el-button
                  >
                </div>
              </div>

              <div class="text-preview">
                <el-input
                  v-model="extractedText"
                  type="textarea"
                  :rows="15"
                  readonly
                  class="text-area"
                />
              </div>
            </div>

            <el-button
              v-if="!extracting && !extractedText"
              type="primary"
              size="large"
              class="action-btn"
              @click="extractText"
            >
              提取文本
            </el-button>
          </div>

          <input ref="fileInput" type="file" hidden accept=".pdf" @change="handleFileSelect" />
        </div>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - PDF 文本提取</footer>
  </div>
</template>

<script setup>
  import { ref, shallowRef, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import {
    ArrowLeft,
    DocumentCopy,
    Document,
    Download,
    Loading,
    CopyDocument
  } from '@element-plus/icons-vue';
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
    onSuccess: result => {
      pdfFile.value = result.file;
      loadPdf(result.file);
    }
  });
  const pdfFile = ref(null);
  const pdfDocProxy = shallowRef(null);
  const totalPages = ref(0);
  const currentPage = ref(0);
  const extracting = ref(false);
  const extractedText = ref('');

  const wordCount = computed(() => {
    return extractedText.value.replace(/\s/g, '').length;
  });

  const lineCount = computed(() => {
    return extractedText.value.split('\n').filter(l => l.trim()).length;
  });

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
            if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
              pageText += '\n';
            }
            pageText += item.str;
            lastY = item.transform[5];
          }
        }

        if (pageText.trim()) {
          fullText += `--- 第 ${pageNum} 页 ---\n\n${pageText.trim()}\n\n`;
        }
      }

      extractedText.value = fullText.trim() || '未能提取到文本内容。PDF 可能是扫描件或图片格式。';

      if (fullText.trim()) {
        ElMessage.success('文本提取成功');
      } else {
        ElMessage.warning('未找到可提取的文本');
      }
    } catch (e) {
      console.error(e);
      ElMessage.error('提取失败: ' + e.message);
    } finally {
      extracting.value = false;
    }
  };

  const copyText = () => {
    copyToClipboard(extractedText.value, {
      success: '已复制到剪贴板',
      error: '复制失败'
    });
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
    max-width: 800px;
  }

  .workbench {
    padding: 2rem;
    border-radius: 16px;
    min-height: 400px;
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

  .extracting-state {
    text-align: center;
    padding: 3rem;
    color: #64748b;
  }

  .extracting-state .el-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
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

  .actions {
    display: flex;
    gap: 0.5rem;
  }

  .text-preview {
    background: #f8fafc;
    border-radius: 8px;
    overflow: hidden;
  }

  .text-area :deep(.el-textarea__inner) {
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 0.9rem;
    line-height: 1.6;
    resize: none;
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
