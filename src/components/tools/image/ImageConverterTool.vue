<template>
  <div class="image-converter-tool">
    <div class="nav-header">
      <button class="back-btn" @click="goBack">
        <el-icon>
          <Back />
        </el-icon>
        <span>返回</span>
      </button>
    </div>

    <div class="tool-header">
      <h1 class="font-display">图片格式转换</h1>
      <p class="summary">批量图片格式转换，支持 PNG, JPG, WEBP 互转</p>
    </div>

    <div class="tool-content">
      <div class="upload-section glass-card">
        <div
          class="upload-area"
          :class="{ 'is-dragover': isDragOver }"
          @click="triggerFileInput"
          @dragover.prevent="dragOver"
          @dragleave.prevent="dragLeave"
          @drop.prevent="handleFileDrop"
        >
          <el-icon class="upload-icon">
            <UploadFilled />
          </el-icon>
          <div class="upload-text">
            <h3>拖拽图片到这里</h3>
            <p>或 <span class="browse-btn">点击选择文件</span></p>
          </div>
          <input
            ref="fileInput"
            type="file"
            multiple
            accept="image/*"
            class="hidden-input"
            @change="handleFileSelect"
          />
        </div>
      </div>

      <div v-if="fileList.length > 0" class="controls-section glass-card">
        <div class="settings-group">
          <div class="setting-item">
            <label>目标格式</label>
            <select v-model="targetFormat" class="select-input">
              <option value="image/png">PNG</option>
              <option value="image/jpeg">JPG</option>
              <option value="image/webp">WEBP</option>
            </select>
          </div>

          <div v-if="targetFormat !== 'image/png'" class="setting-item">
            <label
              >质量 <span class="quality-val">({{ Math.round(quality * 100) }}%)</span></label
            >
            <input
              v-model.number="quality"
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              class="range-input"
            />
          </div>
        </div>

        <div class="action-buttons">
          <button class="btn-primary" :disabled="isConverting" @click="startConversion">
            <el-icon v-if="isConverting">
              <Loading />
            </el-icon>
            <el-icon v-else>
              <Refresh />
            </el-icon>
            {{ isConverting ? '转换中...' : '开始转换' }}
          </button>
          <button class="btn-secondary" :disabled="isConverting" @click="clearAll">清空列表</button>
        </div>
      </div>

      <div v-if="fileList.length > 0" class="file-list">
        <div v-for="(file, index) in fileList" :key="index" class="file-item glass-card">
          <div class="file-info">
            <div class="file-icon">
              <el-icon>
                <Picture />
              </el-icon>
            </div>
            <div class="file-details">
              <span class="file-name">{{ file.file.name }}</span>
              <span class="file-size">{{ formatSize(file.file.size) }}</span>
            </div>
          </div>

          <div class="conversion-status">
            <span v-if="file.status === 'pending'" class="status-pending">等待转换</span>
            <span v-if="file.status === 'processing'" class="status-processing">处理中...</span>
            <div v-if="file.status === 'done'" class="status-done">
              <span class="new-size">{{ formatSize(file.resultBlob.size) }}</span>
              <button class="btn-download-sm" @click="downloadFile(file)">
                <el-icon>
                  <Download />
                </el-icon>
              </button>
            </div>
            <span v-if="file.status === 'error'" class="status-error">失败</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { Back, UploadFilled, Picture, Refresh, Loading, Download } from '@element-plus/icons-vue';
  import { useFileHandler } from '@/composables';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const fileList = ref([]);
  const targetFormat = ref('image/png');
  const quality = ref(0.9);
  const isConverting = ref(false);

  const { fileInput, isDragOver, triggerFileInput, dragOver, dragLeave, formatSize } =
    useFileHandler({
      accept: 'image/*',
      readMode: 'none'
    });

  const handleFileSelect = event => {
    const inputFiles = Array.from(event.target.files);
    addFiles(inputFiles);
    event.target.value = '';
  };

  const handleFileDrop = event => {
    dragLeave();
    const droppedFiles = Array.from(event.dataTransfer.files).filter(f =>
      f.type.startsWith('image/')
    );
    addFiles(droppedFiles);
  };

  const addFiles = files => {
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.startsWith('image/')) {
        fileList.value.push({
          file: files[i],
          status: 'pending',
          resultUrl: null,
          resultBlob: null
        });
      }
    }
  };

  const clearAll = () => {
    fileList.value.forEach(f => {
      if (f.resultUrl) URL.revokeObjectURL(f.resultUrl);
    });
    fileList.value = [];
  };

  const getExtension = mimeType => {
    switch (mimeType) {
      case 'image/png':
        return 'png';
      case 'image/jpeg':
        return 'jpg';
      case 'image/webp':
        return 'webp';
      default:
        return 'img';
    }
  };

  const convertFile = fileItem => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');

          if (targetFormat.value === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          ctx.drawImage(img, 0, 0);

          canvas.toBlob(
            blob => {
              if (blob) {
                fileItem.resultBlob = blob;
                fileItem.resultUrl = URL.createObjectURL(blob);
                fileItem.status = 'done';
                resolve();
              } else {
                fileItem.status = 'error';
                reject(new Error('Conversion failed'));
              }
            },
            targetFormat.value,
            quality.value
          );
        };
        img.onerror = () => {
          fileItem.status = 'error';
          reject(new Error('Image load failed'));
        };
        img.src = e.target.result;
      };
      reader.onerror = () => {
        fileItem.status = 'error';
        reject(new Error('File read failed'));
      };
      reader.readAsDataURL(fileItem.file);
    });
  };

  const startConversion = async () => {
    if (isConverting.value) return;
    isConverting.value = true;

    const pendingFiles = fileList.value.filter(f => f.status !== 'done');

    for (const file of pendingFiles) {
      file.status = 'processing';
      try {
        await convertFile(file);
      } catch (e) {
        console.error(e);
      }
    }

    isConverting.value = false;
  };

  const downloadFile = fileItem => {
    if (!fileItem.resultUrl) return;
    const ext = getExtension(targetFormat.value);

    const originalName =
      fileItem.file.name.substring(0, fileItem.file.name.lastIndexOf('.')) || fileItem.file.name;
    const fileName = `${originalName}.${ext}`;

    const link = document.createElement('a');
    link.href = fileItem.resultUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
</script>

<style scoped>
  .image-converter-tool {
    max-width: 1000px;
    margin: 0 auto;
    padding: 40px 20px;
  }

  .nav-header {
    margin-bottom: 20px;
  }

  .back-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 1rem;
    padding: 8px 16px;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .back-btn:hover {
    background: rgba(0, 0, 0, 0.05);
    color: var(--text-primary);
  }

  .tool-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .tool-header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 16px;
    background: var(--accent-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .summary {
    color: var(--text-secondary);
    font-size: 1.1rem;
  }

  .upload-section {
    margin-bottom: 30px;
  }

  .upload-area {
    border: 2px dashed var(--border-color);
    border-radius: 16px;
    padding: 40px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    background: rgba(255, 255, 255, 0.5);
  }

  .upload-area:hover {
    border-color: var(--accent-purple);
    background: rgba(255, 255, 255, 0.8);
  }

  .upload-icon {
    font-size: 48px;
    color: var(--text-muted);
    margin-bottom: 16px;
  }

  .upload-text h3 {
    font-size: 1.1rem;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .browse-btn {
    color: var(--accent-purple);
    font-weight: 600;
    cursor: pointer;
  }

  .hidden-input {
    display: none;
  }

  .controls-section {
    padding: 20px;
    margin-bottom: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
    background: white;
    border-radius: 16px;
  }

  .settings-group {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
  }

  .setting-item {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .setting-item label {
    font-weight: 500;
    color: var(--text-primary);
  }

  .select-input {
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-secondary);
  }

  .range-input {
    padding: 0;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-secondary);
    height: 38px;
    cursor: pointer;
    width: 150px;
  }

  .quality-val {
    display: inline-block;
    width: 50px;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .action-buttons {
    display: flex;
    gap: 12px;
  }

  .btn-primary,
  .btn-secondary {
    padding: 10px 20px;
    border-radius: 8px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
  }

  .btn-primary {
    background: var(--accent-gradient);
    color: white;
  }

  .btn-primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .btn-secondary {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }

  .file-list {
    display: grid;
    gap: 16px;
  }

  .file-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background: white;
    border-radius: 12px;
    border: 1px solid var(--border-color);
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .file-icon {
    width: 40px;
    height: 40px;
    background: var(--bg-secondary);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    font-size: 20px;
  }

  .file-details {
    display: flex;
    flex-direction: column;
  }

  .file-name {
    font-weight: 500;
    color: var(--text-primary);
  }

  .file-size {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .conversion-status {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .status-pending {
    color: var(--text-muted);
  }

  .status-processing {
    color: var(--accent-purple);
    font-weight: 500;
  }

  .status-done {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .status-error {
    color: #ef4444;
  }

  .new-size {
    font-size: 0.9rem;
    color: #10b981;
    font-weight: 500;
  }

  .btn-download-sm {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: none;
    background: #eff6ff;
    color: var(--accent-purple);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .btn-download-sm:hover {
    background: var(--accent-purple);
    color: white;
  }
</style>
