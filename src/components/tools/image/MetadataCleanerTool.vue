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
        <h1 class="tool-title">图片隐私清理</h1>
        <span class="tool-subtitle">Image Metadata Cleaner</span>
      </div>
      <div class="header-right">
        <!-- 占位 -->
      </div>
    </header>

    <main class="tool-content">
      <div class="metadata-cleaner-tool">
        <div class="upload-section glass" @dragover.prevent @drop.prevent="handleDrop">
          <div class="upload-area" @click="triggerUpload">
            <input
              ref="fileInput"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              class="hidden"
              @change="handleFileChange"
            />
            <el-icon :size="48" class="upload-icon"><UploadFilled /></el-icon>
            <h3>点击或拖拽上传图片</h3>
            <p class="sub-text">支持 JPG, PNG, WebP 格式，完全本地处理</p>
          </div>
        </div>

        <div v-if="files.length > 0" class="file-list-section glass">
          <div class="section-header">
            <h3>文件列表 ({{ files.length }})</h3>
            <div class="actions">
              <el-button @click="clearList">清空列表</el-button>
              <el-button type="primary" :loading="processing" @click="startCleaning">
                一键清理并下载
              </el-button>
            </div>
          </div>

          <div class="file-list">
            <div v-for="(file, index) in files" :key="index" class="file-item">
              <div class="file-info">
                <el-icon><Picture /></el-icon>
                <span class="file-name" :title="file.original.name">{{ file.original.name }}</span>
                <span class="file-size">{{ formatSize(file.original.size) }}</span>
              </div>
              <div class="file-status">
                <el-tag v-if="file.status === 'pending'" type="info">待处理</el-tag>
                <el-tag v-else-if="file.status === 'success'" type="success">已清理</el-tag>
                <el-tag v-else-if="file.status === 'error'" type="danger">失败</el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - 图片隐私清理</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { UploadFilled, Picture, ArrowLeft } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';
  import JSZip from 'jszip';
  import { saveAs } from 'file-saver';

  interface FileItem {
    original: File;
    status: 'pending' | 'success' | 'error';
    cleanedBlob?: Blob;
  }

  const fileInput = ref<HTMLInputElement | null>(null);
  const files = ref<FileItem[]>([]);
  const processing = ref(false);

  const triggerUpload = () => fileInput.value?.click();

  const handleFileChange = (e: Event) => {
    const fileList = (e.target as HTMLInputElement).files;
    if (fileList) addFiles(Array.from(fileList));
  };

  const handleDrop = (e: DragEvent) => {
    const fileList = e.dataTransfer?.files;
    if (fileList) addFiles(Array.from(fileList));
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      ElMessage.warning('请上传图片文件');
      return;
    }

    files.value.push(
      ...validFiles.map(f => ({
        original: f,
        status: 'pending' as const
      }))
    );
  };

  const clearList = () => {
    files.value = [];
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const cleanMetadata = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context failed'));
          return;
        }
        ctx.drawImage(img, 0, 0);

        // Exporting to blob strips metadata
        canvas.toBlob(
          blob => {
            if (blob) resolve(blob);
            else reject(new Error('Blob creation failed'));
          },
          file.type,
          0.95
        ); // High quality
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Image load failed'));
      };

      img.src = url;
    });
  };

  const startCleaning = async () => {
    if (files.value.length === 0) return;
    processing.value = true;

    try {
      const zip = new JSZip();
      let successCount = 0;

      for (const item of files.value) {
        if (item.status === 'success') {
          // Already processed
          if (item.cleanedBlob) {
            zip.file(`cleaned_${item.original.name}`, item.cleanedBlob);
            successCount++;
          }
          continue;
        }

        try {
          const blob = await cleanMetadata(item.original);
          item.cleanedBlob = blob;
          item.status = 'success';
          zip.file(`cleaned_${item.original.name}`, blob);
          successCount++;
        } catch (e) {
          console.error(e);
          item.status = 'error';
        }
      }

      if (successCount > 0) {
        if (successCount === 1 && files.value.length === 1) {
          // Single file download
          const item = files.value[0];
          if (item.cleanedBlob) {
            saveAs(item.cleanedBlob, `cleaned_${item.original.name}`);
          }
        } else {
          // Zip download
          const content = await zip.generateAsync({ type: 'blob' });
          saveAs(content, 'cleaned_images.zip');
        }
        ElMessage.success(`成功处理 ${successCount} 张图片`);
      } else {
        ElMessage.warning('没有图片被成功处理');
      }
    } catch (e) {
      ElMessage.error('处理过程中发生错误');
      console.error(e);
    } finally {
      processing.value = false;
    }
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
    max-width: 1280px;
    margin: 0 auto;
    width: 100%;
  }

  .metadata-cleaner-tool {
    max-width: 800px;
    margin: 0 auto;
  }

  .upload-section {
    padding: 40px;
    text-align: center;
    border-radius: 12px;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
  }

  .upload-area {
    border: 2px dashed var(--border-color);
    border-radius: 12px;
    padding: 40px;
    cursor: pointer;
    transition: all 0.3s;
  }

  .upload-area:hover {
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

  .file-list-section {
    padding: 20px;
    border-radius: 12px;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }

  .file-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 400px;
    overflow-y: auto;
  }

  .file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    background: var(--bg-tertiary);
    border-radius: 6px;
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 10px;
    overflow: hidden;
  }

  .file-name {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
  }

  .file-size {
    color: var(--text-secondary);
    font-size: 12px;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }
</style>
