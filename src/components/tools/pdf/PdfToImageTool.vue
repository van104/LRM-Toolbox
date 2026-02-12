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
        <h1 class="tool-title">PDF 转图片</h1>
        <span class="tool-subtitle">PDF to Image Converter</span>
      </div>
      <div class="header-right">
        <el-button-group>
          <el-button type="danger" :disabled="!pages.length" @click="clearAll">
            <el-icon>
              <Delete />
            </el-icon>
            清空
          </el-button>
          <el-button type="primary" :disabled="!pages.length" @click="downloadAll">
            <el-icon>
              <Download />
            </el-icon>
            批量下载
          </el-button>
        </el-button-group>
      </div>
    </header>

    <main class="tool-content">
      <div class="layout-container">
        <div class="workbench glass-card">
          <div
            v-if="!pdfFile"
            class="upload-placeholder"
            @click="triggerUpload"
            @dragover.prevent="dragOver"
            @dragleave.prevent="dragLeave"
            @drop.prevent="handleFileDrop"
          >
            <div class="upload-icon">
              <el-icon>
                <Document />
              </el-icon>
            </div>
            <h3>点击或拖拽上传 PDF 文件</h3>
            <p>文件将在本地处理，不会上传到服务器</p>
            <input
              ref="fileInput"
              type="file"
              hidden
              accept=".pdf,application/pdf"
              @change="handleFileSelect"
            />
          </div>

          <div v-else class="preview-stage">
            <div class="file-info">
              <el-icon class="file-icon">
                <Document />
              </el-icon>
              <div class="file-details">
                <span class="file-name">{{ pdfFile.name }}</span>
                <span class="file-meta"
                  >{{ formatFileSize(pdfFile.size) }} · {{ pages.length }} 页</span
                >
              </div>
              <el-button type="primary" text @click="triggerUpload">
                <el-icon>
                  <RefreshRight />
                </el-icon>
                重新选择
              </el-button>
              <input
                ref="fileInput"
                type="file"
                hidden
                accept=".pdf,application/pdf"
                @change="handleFileSelect"
              />
            </div>

            <div v-if="loading" class="loading-state">
              <el-progress type="circle" :percentage="loadingProgress" :width="120" />
              <p>正在解析 PDF 文件...</p>
            </div>

            <div v-else class="pages-grid">
              <div
                v-for="(page, index) in pages"
                :key="index"
                class="page-item"
                :class="{ selected: selectedPages.includes(index) }"
                @click="toggleSelect(index)"
              >
                <div class="page-preview">
                  <img :src="page.dataUrl" :alt="`第 ${index + 1} 页`" />
                </div>
                <div class="page-info">
                  <el-checkbox
                    :model-value="selectedPages.includes(index)"
                    @click.stop
                    @change="toggleSelect(index)"
                  />
                  <span class="page-number">第 {{ index + 1 }} 页</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="settings-panel glass-card">
          <h3 class="panel-title">导出设置</h3>

          <div class="settings-group">
            <div class="label">输出格式</div>
            <el-radio-group v-model="config.format" class="format-group">
              <el-radio-button value="png">PNG</el-radio-button>
              <el-radio-button value="jpeg">JPG</el-radio-button>
              <el-radio-button value="webp">WebP</el-radio-button>
            </el-radio-group>
          </div>

          <div v-if="config.format !== 'png'" class="settings-group">
            <div class="label">输出质量 ({{ config.quality }}%)</div>
            <el-slider v-model="config.quality" :min="10" :max="100" :step="5" />
          </div>

          <div class="settings-group">
            <div class="label">缩放比例 ({{ config.scale }}x)</div>
            <el-slider v-model="config.scale" :min="0.5" :max="4" :step="0.5" />
          </div>

          <el-divider />

          <div class="settings-group">
            <div class="label">页面选择</div>
            <div class="select-actions">
              <el-button size="small" @click="selectAll">全选</el-button>
              <el-button size="small" @click="selectNone">取消全选</el-button>
            </div>
            <div v-if="pages.length" class="selected-count">
              已选择 {{ selectedPages.length }} / {{ pages.length }} 页
            </div>
          </div>

          <el-divider />

          <div class="action-buttons">
            <el-button
              type="primary"
              size="large"
              :disabled="!selectedPages.length"
              style="width: 100%"
              @click="downloadSelected"
            >
              <el-icon>
                <Download />
              </el-icon>
              下载选中页面
            </el-button>
          </div>

          <div class="tips-section">
            <h4>使用提示</h4>
            <ul>
              <li>支持多页 PDF 文件</li>
              <li>点击页面可切换选中状态</li>
              <li>提高缩放比例可获得更高分辨率</li>
              <li>PNG 格式支持透明背景</li>
            </ul>
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - PDF 转图片</footer>
  </div>
</template>

<script setup>
  import { ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage, ElLoading } from 'element-plus';
  import { ArrowLeft, Delete, Download, Document, RefreshRight } from '@element-plus/icons-vue';
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
      onSuccess: result => {
        processFile(result.file);
      }
    });

  const pdfFile = ref(null);
  const pages = ref([]);
  const selectedPages = ref([]);
  const loading = ref(false);
  const loadingProgress = ref(0);

  const config = reactive({
    format: 'png',
    quality: 90,
    scale: 2
  });

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
        const ctx = canvas.getContext('2d');

        await page.render({
          canvasContext: ctx,
          viewport: viewport
        }).promise;

        const dataUrl = canvas.toDataURL('image/png');
        pages.value.push({
          pageNumber: i,
          dataUrl,
          width: viewport.width,
          height: viewport.height
        });

        selectedPages.value.push(i - 1);
        loadingProgress.value = Math.round((i / totalPages) * 100);
      }

      ElMessage.success(`成功解析 ${totalPages} 页`);
    } catch (error) {
      console.error('PDF 解析失败:', error);
      ElMessage.error('PDF 文件解析失败，请检查文件是否损坏');
      pdfFile.value = null;
    } finally {
      loading.value = false;
    }
  };

  const toggleSelect = index => {
    const idx = selectedPages.value.indexOf(index);
    if (idx > -1) {
      selectedPages.value.splice(idx, 1);
    } else {
      selectedPages.value.push(index);
    }
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

    const loading = ElLoading.service({ text: '正在导出图片...', background: 'rgba(0,0,0,0.7)' });

    try {
      for (const index of selectedPages.value.sort((a, b) => a - b)) {
        const page = pages.value[index];
        await downloadPage(page, index + 1);
        await new Promise(r => setTimeout(r, 200));
      }
      ElMessage.success('下载完成');
    } catch (error) {
      ElMessage.error('下载失败');
      console.error(error);
    } finally {
      loading.close();
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
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const mimeType = `image/${config.format}`;
    const quality = config.format === 'png' ? undefined : config.quality / 100;
    const dataUrl = canvas.toDataURL(mimeType, quality);

    const link = document.createElement('a');
    link.href = dataUrl;
    const baseName = pdfFile.value.name.replace(/\.pdf$/i, '');
    link.download = `${baseName}_page${pageNum}.${config.format}`;
    link.click();
  };

  const clearAll = () => {
    pdfFile.value = null;
    pages.value = [];
    selectedPages.value = [];
  };
</script>

<style scoped>
  .tool-page {
    min-height: 100vh;
    background: #f1f5f9;
    display: flex;
    flex-direction: column;
  }

  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #ffffff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-center {
    text-align: center;
  }

  .tool-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }

  .tool-subtitle {
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
  }

  .tool-content {
    flex: 1;
    padding: 1.5rem;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  .layout-container {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 1.5rem;
    min-height: calc(100vh - 200px);
  }

  .workbench {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #f8fafc;
  }

  .upload-placeholder {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
    margin: 2rem;
    cursor: pointer;
    transition: all 0.3s;
    background: rgba(255, 255, 255, 0.5);
  }

  .upload-placeholder:hover {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  .upload-icon {
    font-size: 4rem;
    color: #ef4444;
    margin-bottom: 1rem;
  }

  .preview-stage {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    overflow: hidden;
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #fff;
    border-radius: 12px;
    margin-bottom: 1rem;
    border: 1px solid #e2e8f0;
  }

  .file-icon {
    font-size: 2rem;
    color: #ef4444;
  }

  .file-details {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .file-name {
    font-weight: 600;
    color: #1e293b;
  }

  .file-meta {
    font-size: 0.85rem;
    color: #64748b;
  }

  .loading-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  .loading-state p {
    color: #64748b;
  }

  .pages-grid {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
    overflow-y: auto;
    padding: 0.5rem;
  }

  .page-item {
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .page-item:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .page-item.selected {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  .page-preview {
    aspect-ratio: 210/297;
    overflow: hidden;
    background: #f1f5f9;
  }

  .page-preview img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .page-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background: #f8fafc;
    font-size: 0.85rem;
  }

  .page-number {
    color: #64748b;
  }

  .settings-panel {
    padding: 1.5rem;
    overflow-y: auto;
    background: #fff;
  }

  .panel-title {
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 1.5rem;
  }

  .settings-group {
    margin-bottom: 1.25rem;
  }

  .label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #475569;
    margin-bottom: 0.5rem;
  }

  .format-group {
    width: 100%;
  }

  .format-group :deep(.el-radio-button) {
    flex: 1;
  }

  .format-group :deep(.el-radio-button__inner) {
    width: 100%;
  }

  .select-actions {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .selected-count {
    font-size: 0.85rem;
    color: #64748b;
    text-align: center;
  }

  .action-buttons {
    margin-top: 1rem;
  }

  .tips-section {
    margin-top: 2rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 8px;
  }

  .tips-section h4 {
    font-size: 0.9rem;
    margin: 0 0 0.75rem;
    color: #475569;
  }

  .tips-section ul {
    margin: 0;
    padding-left: 1.25rem;
    font-size: 0.8rem;
    color: #64748b;
    line-height: 1.8;
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  @media (max-width: 992px) {
    .layout-container {
      grid-template-columns: 1fr;
    }
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }
</style>
