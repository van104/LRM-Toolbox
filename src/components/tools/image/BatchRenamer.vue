<template>
  <div class="batch-renamer">
    <nav class="nav-bar">
      <button class="nav-back" @click="goBack">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        返回
      </button>
      <div class="nav-center">
        <h1>图片重命名</h1>
        <span class="nav-subtitle">Batch Image Renamer</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <section class="upload-section">
        <div
          class="upload-card"
          :class="{ dragover: isDragOver }"
          @click="triggerFileInput"
          @dragover.prevent="dragOver"
          @dragleave.prevent="dragLeave"
          @drop.prevent="handleFileDrop"
        >
          <input
            ref="fileInput"
            type="file"
            multiple
            accept="image/*"
            hidden
            @change="handleFileSelect"
          />
          <div class="upload-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>
          <h3>点击或拖拽上传图片</h3>
          <p class="upload-hint">支持 JPG, PNG, GIF, WebP, BMP 等格式</p>
        </div>
      </section>

      <div v-if="files.length > 0" class="workspace">
        <section class="settings-card">
          <div class="card-header">
            <h3>重命名设置</h3>
            <div class="stats-badge">
              <span>{{ files.length }} 个文件</span>
              <span class="separator">|</span>
              <span>{{ totalSize }}</span>
            </div>
          </div>

          <div class="settings-grid">
            <div class="form-group">
              <label>新文件名前缀</label>
              <input
                v-model="config.prefix"
                type="text"
                placeholder="留空使用原文件名"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>目标格式</label>
              <select v-model="config.extension" class="form-select">
                <option value="">保持原格式</option>
                <option value="jpg">JPG</option>
                <option value="png">PNG</option>
                <option value="gif">GIF</option>
                <option value="webp">WebP</option>
                <option value="bmp">BMP</option>
              </select>
            </div>
          </div>

          <div class="options-row">
            <label class="checkbox-label">
              <input v-model="config.keepOriginal" type="checkbox" />
              <span class="check-box"></span>
              保留原文件名
            </label>
            <label class="checkbox-label">
              <input v-model="config.addNumbers" type="checkbox" />
              <span class="check-box"></span>
              添加序号
            </label>
            <label class="checkbox-label">
              <input v-model="config.addTimestamp" type="checkbox" />
              <span class="check-box"></span>
              添加时间戳
            </label>
          </div>
        </section>

        <section class="preview-section">
          <div class="section-header">
            <h3>预览与处理</h3>
            <div class="section-actions">
              <button class="btn text-danger" @click="clearAll">清空列表</button>
              <button class="btn primary" :disabled="isDownloading" @click="downloadAll">
                <svg
                  v-if="isDownloading"
                  class="spinner"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                <svg
                  v-else
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                {{ isDownloading ? `下载中 ${downloadProgress}%` : '批量下载' }}
              </button>
            </div>
          </div>

          <div class="preview-grid">
            <div v-for="(file, index) in processedFiles" :key="index" class="preview-item">
              <div class="preview-thumb">
                <img :src="file.previewUrl" loading="lazy" />
                <button class="remove-btn" title="移除" @click="removeFile(index)">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div class="preview-info">
                <div class="file-meta">
                  <span class="original-name" :title="file.originalName">{{
                    file.originalName
                  }}</span>
                  <span class="arrow">→</span>
                </div>

                <div class="name-edit-container">
                  <input
                    type="text"
                    class="name-input"
                    :value="file.customBase"
                    :placeholder="file.generatedBase"
                    @input="e => updateCustomBase(index, e.target.value)"
                  />
                  <span class="name-suffix">{{ file.previewSuffix }}</span>
                </div>
                <button class="btn-icon" title="下载此文件" @click="downloadSingle(file)">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section class="intro-section">
        <h2>功能说明</h2>
        <div class="features-list">
          <div class="feature-item">
            <div class="icon">🚀</div>
            <div>
              <h4>批量处理</h4>
              <p>一次性重命名数百张图片，支持自动添加序号。</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="icon">🖼️</div>
            <div>
              <h4>格式生成</h4>
              <p>
                不仅仅是重命名，更改后缀名可方便识别（注意：实际格式转换需要转换工具，本工具主要用于文件整理）。
              </p>
            </div>
          </div>
          <div class="feature-item">
            <div class="icon">🔒</div>
            <div>
              <h4>本地安全</h4>
              <p>所有操作均在浏览器本地完成，图片不会上传到服务器。</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 图片重命名</footer>
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { useFileHandler } from '@/composables';

  const router = useRouter();

  const isDownloading = ref(false);
  const downloadProgress = ref(0);
  const files = ref([]);

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
    const droppedFiles = Array.from(event.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const config = reactive({
    prefix: '',
    extension: '',
    keepOriginal: false,
    addNumbers: true,
    addTimestamp: false
  });

  const processedFiles = computed(() => {
    return files.value.map((item, index) => {
      const { base, suffix } = generateParts(item, index);
      return {
        ...item,
        generatedBase: generateBase(item.file),
        previewSuffix: suffix,
        newName: (item.customBase || base) + suffix
      };
    });
  });

  const totalSize = computed(() => {
    const bytes = files.value.reduce((sum, item) => sum + item.size, 0);
    return formatSize(bytes);
  });

  function generateBase(file) {
    let baseName = config.prefix.trim();
    const originalNameWithExt = file.name;
    const originalName =
      originalNameWithExt.substring(0, originalNameWithExt.lastIndexOf('.')) || originalNameWithExt;

    if (!baseName) {
      baseName = originalName;
    }

    if (config.keepOriginal && config.prefix.trim()) {
      baseName = `${baseName}_${originalName}`;
    }

    return baseName;
  }

  function generateParts(item, index) {
    let base = generateBase(item.file);

    let suffix = '';

    if (config.addNumbers) {
      suffix += `_${String(index + 1).padStart(3, '0')}`;
    }

    if (config.addTimestamp) {
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:-]/g, '')
        .replace('T', '_');
      suffix += `_${timestamp}`;
    }

    let ext = config.extension;
    if (!ext) {
      ext = item.originalName.split('.').pop().toLowerCase();
    }
    suffix += `.${ext}`;

    return { base, suffix };
  }

  async function addFiles(newFiles) {
    const validFiles = newFiles.filter(f => f.type.startsWith('image/'));

    if (validFiles.length === 0) {
      ElMessage.error('请选择有效的图片文件');
      return;
    }

    if (files.value.length === 0 && !config.prefix && validFiles.length > 0) {
      const first = validFiles[0].name;
      const nameNoExt = first.substring(0, first.lastIndexOf('.')) || first;
      config.prefix = nameNoExt;
    }

    for (const file of validFiles) {
      const previewUrl = await generateThumbnail(file);
      files.value.push({
        file,
        previewUrl,
        originalName: file.name,
        size: file.size,
        customBase: null
      });
    }

    ElMessage.success(`已添加 ${validFiles.length} 个文件`);
  }

  function generateThumbnail(file) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const maxSize = 150;
          let { width, height } = img;

          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(blob => resolve(URL.createObjectURL(blob)), 'image/jpeg', 0.8);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function removeFile(index) {
    const file = files.value[index];
    if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
    files.value.splice(index, 1);
  }

  function updateCustomBase(index, value) {
    files.value[index].customBase = value || null;
  }

  function clearAll() {
    files.value.forEach(f => URL.revokeObjectURL(f.previewUrl));
    files.value = [];
    config.prefix = '';
    ElMessage.info('已清空列表');
  }

  function downloadSingle(processedFile) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(processedFile.file);
    link.download = processedFile.newName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  function downloadAll() {
    if (files.value.length === 0) return;

    isDownloading.value = true;
    downloadProgress.value = 0;
    const total = processedFiles.value.length;
    let count = 0;

    processedFiles.value.forEach((item, index) => {
      setTimeout(() => {
        downloadSingle(item);
        count++;
        downloadProgress.value = Math.round((count / total) * 100);

        if (count === total) {
          setTimeout(() => {
            isDownloading.value = false;
            ElMessage.success(`成功下载 ${total} 个文件`);
          }, 500);
        }
      }, index * 200);
    });
  }

  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  onUnmounted(() => {
    files.value.forEach(f => URL.revokeObjectURL(f.previewUrl));
  });
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

  .batch-renamer {
    --bg: #f8fafc;
    --card: #ffffff;
    --border: #e2e8f0;
    --text: #1e293b;
    --text-secondary: #64748b;
    --primary: #2563eb;
    --primary-hover: #1d4ed8;
    --danger: #ef4444;
    --success: #10b981;
    --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', sans-serif;
    display: flex;
    flex-direction: column;
  }

  .nav-bar {
    background: var(--card);
    border-bottom: 1px solid var(--border);
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    flex-shrink: 0;
  }

  .nav-back {
    background: none;
    border: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .nav-back:hover {
    background: #f1f5f9;
    color: var(--primary);
  }

  .nav-center h1 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
  }

  .nav-subtitle {
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .main-content {
    flex: 1;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 2rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .upload-card {
    background: var(--card);
    border: 2px dashed var(--border);
    border-radius: 12px;
    padding: 3rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
  }

  .upload-card:hover,
  .upload-card.dragover {
    border-color: var(--primary);
    background: #eff6ff;
  }

  .upload-icon {
    color: var(--text-secondary);
    margin-bottom: 1rem;
    display: flex;
    justify-content: center;
  }

  .upload-card h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
  }

  .upload-hint {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin: 0;
  }

  .settings-card {
    background: var(--card);
    border-radius: 12px;
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
    padding: 1.5rem;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    align-items: center;
  }

  .card-header h3 {
    margin: 0;
    font-size: 1.1rem;
  }

  .stats-badge {
    background: #f1f5f9;
    padding: 0.25rem 0.75rem;
    border-radius: 99px;
    font-size: 0.85rem;
    color: var(--text-secondary);
    display: flex;
    gap: 0.5rem;
  }

  .separator {
    opacity: 0.3;
  }

  .settings-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-group label {
    font-size: 0.9rem;
    font-weight: 500;
  }

  .form-input,
  .form-select {
    padding: 0.6rem 1rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 0.95rem;
  }

  .form-input:focus,
  .form-select:focus {
    outline: 2px solid var(--primary);
    outline-offset: -1px;
    border-color: var(--primary);
  }

  .options-row {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    user-select: none;
    font-size: 0.95rem;
  }

  .checkbox-label input {
    display: none;
  }

  .check-box {
    width: 18px;
    height: 18px;
    border: 2px solid var(--border);
    border-radius: 4px;
    position: relative;
    display: inline-block;
    transition: all 0.2s;
  }

  .checkbox-label input:checked + .check-box {
    background: var(--primary);
    border-color: var(--primary);
  }

  .checkbox-label input:checked + .check-box::after {
    content: '';
    position: absolute;
    left: 5px;
    top: 1px;
    width: 4px;
    height: 9px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  .preview-section {
    background: var(--card);
    border-radius: 12px;
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
    padding: 1.5rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .section-header h3 {
    margin: 0;
    font-size: 1.1rem;
  }

  .section-actions {
    display: flex;
    gap: 1rem;
  }

  .btn {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    border: none;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .btn.primary {
    background: var(--primary);
    color: white;
  }

  .btn.primary:hover:not(:disabled) {
    background: var(--primary-hover);
  }

  .btn.primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .btn.text-danger {
    background: none;
    color: var(--danger);
    padding: 0.5rem;
  }

  .btn.text-danger:hover {
    background: #fef2f2;
  }

  .preview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .preview-item {
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
    position: relative;
    transition: all 0.2s;
  }

  .preview-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .preview-thumb {
    height: 140px;
    background: #f1f5f9;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .preview-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .remove-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all 0.2s;
  }

  .preview-item:hover .remove-btn {
    opacity: 1;
  }

  .remove-btn:hover {
    background: var(--danger);
  }

  .preview-info {
    padding: 0.8rem;
    background: white;
    font-size: 0.85rem;
  }

  .file-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-secondary);
    margin-bottom: 0.4rem;
  }

  .original-name {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 120px;
  }

  .new-name {
    font-weight: 600;
    color: var(--text);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin-bottom: 0.5rem;
  }

  .name-edit-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    width: 100%;
  }

  .name-input {
    flex: 1;
    min-width: 0;
    padding: 0.3rem 0.5rem;
    border: 1px solid var(--border);
    border-radius: 4px;
    font-size: 0.85rem;
    font-family: inherit;
  }

  .name-suffix {
    font-size: 0.85rem;
    color: var(--text-secondary);
    white-space: nowrap;
    font-family: 'JetBrains Mono', monospace;
  }

  .name-input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
  }

  .btn-icon {
    background: none;
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 4px;
    width: 100%;
    cursor: pointer;
    color: var(--text-secondary);
  }

  .btn-icon:hover {
    background: #f8fafc;
    color: var(--primary);
    border-color: var(--primary);
  }

  .intro-section {
    margin-top: 2rem;
    border-top: 1px solid var(--border);
    padding-top: 2rem;
  }

  .intro-section h2 {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
  }

  .features-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .feature-item {
    display: flex;
    gap: 1rem;
  }

  .feature-item .icon {
    font-size: 1.5rem;
    background: #f1f5f9;
    width: 48px;
    height: 48px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .feature-item h4 {
    margin: 0 0 0.25rem 0;
    font-size: 0.95rem;
  }

  .feature-item p {
    margin: 0;
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 640px) {
    .settings-grid {
      grid-template-columns: 1fr;
    }

    .options-row {
      gap: 1rem;
    }

    .preview-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  .footer {
    text-align: center;
    padding: 3rem 0;
    color: var(--text-secondary, #64748b);
    font-size: 0.85rem;
  }
</style>
