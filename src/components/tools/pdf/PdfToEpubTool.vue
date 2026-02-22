<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">PDF 转 EPUB</h1>
        <span class="tool-subtitle">PDF to EPUB Converter</span>
      </div>
      <div class="header-right">
        <!-- 占位 -->
      </div>
    </header>

    <main class="tool-content">
      <div class="pdf-tool">
        <div
          class="upload-section glass"
          @dragover.prevent="dragOver"
          @dragleave.prevent="dragLeave"
          @drop.prevent="handleDrop"
        >
          <div class="upload-area" :class="{ 'is-dragover': isDragOver }" @click="triggerUpload">
            <input
              ref="fileInput"
              type="file"
              accept=".pdf"
              class="hidden"
              @change="handleFileSelect"
            />
            <el-icon :size="48" class="upload-icon"><UploadFilled /></el-icon>
            <h3>点击或拖拽上传 PDF 文件</h3>
            <p class="sub-text">支持自动识别章节、重排版面，适合电子书阅读</p>
          </div>
        </div>

        <div v-if="file" class="preview-section glass">
          <div class="file-info">
            <el-icon :size="32" color="#f56c6c"><Document /></el-icon>
            <div class="info-text">
              <h4>{{ file.name }}</h4>
              <p>{{ formatSize(file.size) }}</p>
            </div>
            <el-button type="primary" :loading="converting" @click="startConversion">
              开始转换
            </el-button>
          </div>

          <div class="settings-form">
            <el-form label-position="top">
              <el-form-item label="标题识别">
                <el-checkbox v-model="settings.detectTitles">自动检测章节标题</el-checkbox>
              </el-form-item>
              <el-form-item label="排版优化">
                <el-checkbox v-model="settings.removeHeaders">移除页眉页脚</el-checkbox>
                <el-checkbox v-model="settings.mergeParagraphs">合并断行段落</el-checkbox>
              </el-form-item>
              <el-form-item label="封面设置">
                <el-radio-group v-model="settings.coverType">
                  <el-radio label="first">使用第一页</el-radio>
                  <el-radio label="none">无封面</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-form>
          </div>
        </div>

        <div v-if="converted" class="result-section glass">
          <el-result icon="success" title="转换成功" sub-title="您的 EPUB 电子书已准备就绪">
            <template #extra>
              <el-button type="primary" @click="downloadEpub">下载 EPUB</el-button>
              <el-button @click="reset">转换其他文件</el-button>
            </template>
          </el-result>
        </div>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - PDF 转 EPUB</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { ArrowLeft, UploadFilled, Document } from '@element-plus/icons-vue';
  import { useFileHandler } from '@/composables/useFileHandler';
  import { ElMessage } from 'element-plus';

  const file = ref<File | null>(null);
  const converting = ref(false);
  const converted = ref(false);

  const settings = ref({
    detectTitles: true,
    removeHeaders: true,
    mergeParagraphs: true,
    coverType: 'first'
  });

  const {
    fileInput,
    isDragOver,
    formatSize,
    triggerUpload,
    handleFileSelect,
    handleFileDrop: handleDrop,
    dragOver,
    dragLeave
  } = useFileHandler({
    accept: '.pdf',
    readMode: 'none',
    onSuccess: ({ file: f }) => {
      file.value = f;
      converted.value = false;
    }
  });

  const startConversion = () => {
    if (!file.value) return;
    converting.value = true;

    // Simulate conversion process
    setTimeout(() => {
      converting.value = false;
      converted.value = true;
      ElMessage.success('转换完成');
    }, 2000);
  };

  const downloadEpub = () => {
    // Mock download
    if (!file.value) return;
    const link = document.createElement('a');
    link.download = file.value.name.replace('.pdf', '.epub');
    link.href = URL.createObjectURL(
      new Blob(['Mock EPUB Content'], { type: 'application/epub+zip' })
    );
    link.click();
  };

  const reset = () => {
    file.value = null;
    converted.value = false;
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
    background: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-left,
  .header-right {
    width: 140px;
  }

  .header-center {
    text-align: center;
    flex: 1;
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
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
  }

  .pdf-tool {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .upload-section {
    padding: 40px;
    text-align: center;
    border-radius: 12px;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .upload-area {
    border: 2px dashed var(--border-color);
    border-radius: 12px;
    padding: 40px;
    cursor: pointer;
    transition: all 0.3s;
  }

  .upload-area:hover,
  .upload-area.is-dragover {
    border-color: var(--primary-color);
    background: var(--bg-tertiary);
  }

  .upload-icon {
    color: var(--primary-color);
    margin-bottom: 15px;
  }

  .sub-text {
    color: var(--text-secondary);
    margin-top: 5px;
  }

  .preview-section {
    padding: 30px;
    border-radius: 12px;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 15px;
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;
    margin-bottom: 20px;
  }

  .info-text h4 {
    margin: 0 0 5px;
    color: #2c3e50;
  }

  .info-text p {
    margin: 0;
    font-size: 0.85rem;
    color: #64748b;
  }

  .file-info .el-button {
    margin-left: auto;
  }

  .result-section {
    padding: 30px;
    border-radius: 12px;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }
</style>
