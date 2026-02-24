<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <div class="header-action start">
          <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        </div>
        <h1 class="brutal-title">图片批量<span>.重命名()</span></h1>
        <div class="header-action end">
          <button class="brutal-btn clear-btn" @click="clearAll">清空工作区</button>
        </div>
      </header>

      <div class="brutal-grid">
        <!-- Left Pane: Controls -->
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span>重命名.参数池</span>
            <div class="pane-actions">
              <span class="file-stats">[{{ files.length }}] Nodes | {{ totalSize }}</span>
            </div>
          </div>

          <div class="control-panel-content">
            <div
              class="brutal-upload-area"
              :class="{ 'is-dragover': isDragOver }"
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
                style="display: none"
                @change="handleFileSelect"
              />
              <div class="upload-placeholder">
                <span class="upload-icon">⬇️</span>
                <p>点击或拖拽上传多层图片实例</p>
              </div>
            </div>

            <div class="brutal-form-group channel-group group-pink">
              <h4>📋 命名生成序列规则</h4>

              <div class="input-row mt-3">
                <label>前缀特征词</label>
                <input
                  v-model="config.prefix"
                  type="text"
                  placeholder="留空即继承源映射"
                  class="brutal-input text-box"
                />
              </div>

              <div class="input-row mt-3">
                <label>拓展标识符</label>
                <div class="brutal-select-wrapper">
                  <select v-model="config.extension" class="brutal-select text-box">
                    <option value="">(继承源标识)</option>
                    <option value="jpg">.JPG</option>
                    <option value="png">.PNG</option>
                    <option value="gif">.GIF</option>
                    <option value="webp">.WEBP</option>
                    <option value="bmp">.BMP</option>
                  </select>
                </div>
              </div>

              <div class="checkbox-options mt-3">
                <label class="brutal-checkbox-label">
                  <input v-model="config.keepOriginal" type="checkbox" class="brutal-checkbox" />
                  附加源实例特征
                </label>
                <label class="brutal-checkbox-label mt-2">
                  <input v-model="config.addNumbers" type="checkbox" class="brutal-checkbox" />
                  挂载自增序列标号
                </label>
                <label class="brutal-checkbox-label mt-2">
                  <input v-model="config.addTimestamp" type="checkbox" class="brutal-checkbox" />
                  注入绝对时间戳
                </label>
              </div>
            </div>

            <button
              class="brutal-btn brutal-btn-block action-btn"
              :disabled="isDownloading || files.length === 0"
              @click="downloadAll"
            >
              {{ isDownloading ? `打包装配中... [ ${downloadProgress}% ]` : '批量分发序列' }}
            </button>
          </div>
        </div>

        <!-- Right Pane: Preview -->
        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">节点矩阵.预览器</span>
          </div>

          <div class="preview-container">
            <div v-if="files.length === 0" class="empty-state">
              <span>等待目标块装载...</span>
            </div>

            <div v-else class="preview-scroll">
              <div class="brutal-card-grid">
                <div v-for="(file, index) in processedFiles" :key="index" class="brutal-image-card">
                  <div class="card-thumb">
                    <img :src="file.previewUrl" loading="lazy" />
                    <button class="brutal-btn remove-btn" @click="removeFile(index)">❌</button>
                  </div>

                  <div class="card-info">
                    <div class="source-name" :title="file.originalName">
                      {{ file.originalName }}
                    </div>
                    <div class="meta-separator">👇</div>
                    <div class="edit-zone">
                      <input
                        type="text"
                        class="brutal-input sm-input"
                        :value="file.customBase"
                        :placeholder="file.generatedBase"
                        @input="e => updateCustomBase(index, (e.target as HTMLInputElement).value)"
                      />
                      <span class="suffix-label">{{ file.previewSuffix }}</span>
                    </div>
                    <button class="brutal-btn small-btn w-full mt-2" @click="downloadSingle(file)">
                      提取样本
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Global Status Bar -->
      <div
        class="brutal-status"
        :class="files.length > 0 ? (isDownloading ? 'warn' : 'success') : 'info'"
      >
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-if="files.length > 0 && !isDownloading">
              <span v-for="i in 10" :key="i"
                >工作区已加载 : 队列容纳了 {{ files.length }} 个待命对象 // 资源占用
                {{ totalSize }} // &nbsp;</span
              >
            </span>
            <span v-else-if="isDownloading">
              <span v-for="i in 10" :key="i"
                >执行输出 : 提取队列中... 流式阻塞进程推进 {{ downloadProgress }}% // &nbsp;</span
              >
            </span>
            <span v-else>
              <span v-for="i in 10" :key="i"
                >主控台就绪 : 监控线程空闲，可承接光栅矩阵输入动作 // &nbsp;</span
              >
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { useFileHandler } from '@/composables';

  const router = useRouter();

  const isDownloading = ref(false);
  const downloadProgress = ref(0);
  interface ProcessedFile {
    file: File;
    previewUrl: string;
    originalName: string;
    size: number;
    customBase: string | null;
  }

  interface FullProcessedFile extends ProcessedFile {
    generatedBase: string;
    previewSuffix: string;
    newName: string;
  }

  const files = ref<ProcessedFile[]>([]);

  const { fileInput, isDragOver, triggerFileInput, dragOver, dragLeave, formatSize } =
    useFileHandler({
      accept: 'image/*',
      readMode: 'none'
    });

  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target && target.files) {
      const inputFiles = Array.from(target.files);
      addFiles(inputFiles);
      target.value = '';
    }
  };

  const handleFileDrop = (event: DragEvent) => {
    dragLeave();
    if (event.dataTransfer && event.dataTransfer.files) {
      const droppedFiles = Array.from(event.dataTransfer.files);
      addFiles(droppedFiles);
    }
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

  function generateBase(file: File) {
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

  function generateParts(item: ProcessedFile, index: number) {
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
      ext = item.originalName.split('.').pop()?.toLowerCase() || '';
    }
    suffix += `.${ext}`;

    return { base, suffix };
  }

  async function addFiles(newFiles: File[]) {
    const validFiles = newFiles.filter(f => f.type.startsWith('image/'));

    if (validFiles.length === 0) {
      ElMessage.error('请选择有效的图片区块');
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

    ElMessage.success(`挂载 ${validFiles.length} 个虚拟节点完成`);
  }

  function generateThumbnail(file: File): Promise<string> {
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
          if (ctx) ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            blob => {
              if (blob) resolve(URL.createObjectURL(blob));
            },
            'image/jpeg',
            0.8
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  function removeFile(index: number) {
    const file = files.value[index];
    if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
    files.value.splice(index, 1);
  }

  function updateCustomBase(index: number, value: string) {
    files.value[index].customBase = value || null;
  }

  function clearAll() {
    files.value.forEach(f => URL.revokeObjectURL(f.previewUrl));
    files.value = [];
    config.prefix = '';
  }

  function downloadSingle(processedFile: FullProcessedFile) {
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
            ElMessage.success(`指令完成: ${total} 组序列重组完成`);
          }, 500);
        }
      }, index * 200); // Stagger downloads slightly
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
    max-width: 1600px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }

  .brutal-header {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    margin-bottom: 2rem;
  }

  .header-action.start {
    display: flex;
    justify-content: flex-start;
  }

  .header-action.end {
    display: flex;
    justify-content: flex-end;
  }

  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.5rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #ff4b4b;
  }

  .brutal-title span {
    color: #ff4b4b;
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

  .brutal-btn-block {
    display: block;
    width: 100%;
    margin-top: 1rem;
    text-align: center;
    font-size: 1.25rem;
    background: #00e572;
    color: #111;
    padding: 1rem;
  }

  .brutal-btn.small-btn {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
  }

  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }

  .brutal-btn.small-btn:hover {
    box-shadow: 7px 7px 0px #111;
  }

  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-btn:disabled,
  .brutal-btn[disabled] {
    background: #e0e0e0;
    color: #888;
    border-color: #888;
    box-shadow: none;
    cursor: not-allowed;
    transform: none;
  }

  .brutal-btn.clear-btn {
    background: #ff4b4b;
    color: #fff;
  }

  .w-full {
    width: 100%;
  }
  .mt-2 {
    margin-top: 0.5rem;
  }
  .mt-3 {
    margin-top: 1rem;
  }
  .mt-4 {
    margin-top: 1.5rem;
  }

  .brutal-grid {
    display: grid;
    grid-template-columns: 420px 1fr;
    gap: 3rem;
    margin-bottom: 3rem;
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
    color: #fff;
  }
  .text-white {
    color: #fff;
  }

  .pane-actions {
    display: flex;
    gap: 0.75rem;
  }

  .file-stats {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.9rem;
    background: #111;
    color: #fff;
    padding: 0.35rem 0.75rem;
  }

  .control-panel-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    flex: 1;
    background: #fdfdfd;
  }

  .brutal-upload-area {
    border: 4px dashed #111;
    background: #fff;
    padding: 2.5rem 1rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .brutal-upload-area:hover,
  .brutal-upload-area.is-dragover {
    background: #ffd900;
    border-style: solid;
  }

  .upload-icon {
    font-size: 3rem;
    display: block;
    margin-bottom: 1rem;
  }

  .upload-placeholder p {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    margin: 0 0 0.5rem 0;
  }

  .channel-group {
    background: #fdfae5;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    padding: 1.25rem;
  }

  .channel-group h4 {
    margin: 0 0 1rem 0;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
  }

  .group-pink h4 {
    color: #ff6bc9;
    text-shadow: 1px 1px 0px #111;
  }

  .input-row {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .input-row label {
    font-weight: 800;
    font-size: 0.95rem;
  }

  .brutal-input {
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-size: 1rem;
    padding: 0.5rem 0.75rem;
    border: 3px solid #111;
    background: #fff;
    box-shadow: 3px 3px 0px #111;
    outline: none;
    transition: all 0.1s;
    width: 100%;
    box-sizing: border-box;
  }

  .brutal-input:focus {
    box-shadow: 5px 5px 0px #111;
    transform: translate(-2px, -2px);
  }

  .brutal-select-wrapper {
    position: relative;
    width: 100%;
  }

  .brutal-select {
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    appearance: none;
    -webkit-appearance: none;
    width: 100%;
    font-size: 1rem;
    padding: 0.5rem 0.75rem;
    border: 3px solid #111;
    background: #fff;
    box-shadow: 3px 3px 0px #111;
    outline: none;
    cursor: pointer;
    font-weight: 600;
    box-sizing: border-box;
  }

  .brutal-select-wrapper::after {
    content: '▼';
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    font-size: 0.8rem;
    color: #111;
  }

  .brutal-checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 0.95rem;
  }

  .brutal-checkbox {
    appearance: none;
    -webkit-appearance: none;
    width: 24px;
    height: 24px;
    border: 3px solid #111;
    background: #fff;
    box-shadow: 2px 2px 0px #111;
    cursor: pointer;
    position: relative;
    margin: 0;
    flex-shrink: 0;
  }

  .brutal-checkbox:checked {
    background: #00e572;
  }

  .brutal-checkbox:checked::after {
    content: '';
    position: absolute;
    left: 6px;
    top: 2px;
    width: 6px;
    height: 12px;
    border: solid #111;
    border-width: 0 3px 3px 0;
    transform: rotate(45deg);
  }

  .checkbox-options {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .preview-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #f8fafc;
    background-image:
      linear-gradient(#e5e5e5 1px, transparent 1px),
      linear-gradient(90deg, #e5e5e5 1px, transparent 1px);
    background-size: 20px 20px;
    position: relative;
    height: calc(100vh - 350px); /* rough estimation for scrolling inner area */
    min-height: 500px;
    overflow: hidden;
  }

  .preview-scroll {
    overflow-y: auto;
    padding: 1.5rem;
    height: 100%;
  }

  .empty-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    color: #777;
    font-style: italic;
    font-weight: bold;
    height: 100%;
  }

  .brutal-card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1.5rem;
  }

  .brutal-image-card {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 6px 6px 0px #111;
    display: flex;
    flex-direction: column;
    transition: transform 0.2s;
  }

  .brutal-image-card:hover {
    transform: translate(-2px, -2px);
    box-shadow: 8px 8px 0px #111;
  }

  .card-thumb {
    height: 160px;
    border-bottom: 4px solid #111;
    position: relative;
    background: #eee;
    overflow: hidden;
  }

  .card-thumb img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: repeating-conic-gradient(#e0e0e0 0% 25%, transparent 0% 50%) 50% / 10px 10px;
    background-color: white;
  }

  .remove-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 36px;
    height: 36px;
    padding: 0;
    line-height: 36px;
    text-align: center;
    border: 3px solid #111;
    background: #ff4b4b;
    color: white;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    z-index: 2;
  }

  .card-info {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .source-name {
    font-size: 0.85rem;
    color: #666;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-weight: bold;
  }

  .meta-separator {
    font-size: 1.2rem;
    text-align: center;
    opacity: 0.8;
  }

  .edit-zone {
    display: flex;
    align-items: center;
    background: #fdfae5;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #111;
    overflow: hidden;
  }

  .sm-input {
    flex: 1;
    border: none;
    box-shadow: none;
    font-size: 0.9rem;
    padding: 0.4rem;
    border-right: 3px solid #111;
    min-width: 0;
  }

  .sm-input:focus {
    transform: none;
    box-shadow: none;
    background: #fff;
  }

  .suffix-label {
    padding: 0.4em 0.5em;
    font-size: 0.8rem;
    background: #111;
    color: #fff;
    font-weight: bold;
    flex-shrink: 0;
  }

  .brutal-status {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    padding: 1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.5rem;
    overflow: hidden;
    position: relative;
    text-transform: uppercase;
  }

  .brutal-status.info {
    background: #fff;
  }
  .brutal-status.success {
    background: #00e572;
    color: #111;
  }
  .brutal-status.warn {
    background: #ffd900;
    color: #111;
  }

  .marquee-wrapper {
    width: 100%;
    overflow: hidden;
  }

  .marquee-content {
    display: inline-block;
    white-space: nowrap;
    animation: marquee 20s linear infinite;
  }

  @keyframes marquee {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  @media (max-width: 1024px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .brutal-header {
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }
  }

  /* --- Dark Mode Overrides --- */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .pane-actions button,
  [data-theme='dark'] .brutal-status,
  [data-theme='dark'] .brutal-status.info {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-upload-area {
    box-shadow: 6px 6px 0px #eee;
  }

  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane:hover {
    box-shadow: 16px 16px 0px #eee;
  }

  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
    color: #111;
  }

  [data-theme='dark'] .brutal-upload-area {
    background: #1a1a1a;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-upload-area:hover,
  [data-theme='dark'] .brutal-upload-area.is-dragover {
    background: #b28f00;
    color: #fff;
  }

  [data-theme='dark'] .channel-group {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .group-pink h4 {
    color: #ff9ecf;
    text-shadow: 1px 1px 0px #eee;
  }

  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .brutal-select,
  [data-theme='dark'] .brutal-checkbox {
    background: #111;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
    color: #eee;
  }

  [data-theme='dark'] .brutal-checkbox:checked {
    background: #00994c;
  }
  [data-theme='dark'] .brutal-checkbox:checked::after {
    border-color: #eee;
  }

  [data-theme='dark'] .brutal-select-wrapper::after {
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn-block {
    background: #00994c;
    color: #fff;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-btn-block:disabled {
    background: #333;
    color: #888;
    border-color: #888;
  }
  [data-theme='dark'] .action-btn {
    box-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .preview-container {
    background: #222;
    background-image:
      linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px);
  }

  [data-theme='dark'] .brutal-image-card {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-image-card:hover {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .card-thumb {
    border-bottom-color: #eee;
    background: #222;
  }
  [data-theme='dark'] .card-thumb img {
    background-color: #222;
    background-image: repeating-conic-gradient(#333 0% 25%, transparent 0% 50%);
  }

  [data-theme='dark'] .remove-btn {
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }

  [data-theme='dark'] .edit-zone {
    background: #111;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .sm-input {
    background: #111;
    color: #eee;
    border-right-color: #eee;
  }
  [data-theme='dark'] .suffix-label {
    background: #eee;
    color: #111;
  }

  [data-theme='dark'] .brutal-status {
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn.clear-btn {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .brutal-status.success {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .brutal-status.warn {
    background: #b28f00;
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
</style>
