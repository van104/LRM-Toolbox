<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <div class="header-action start">
          <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        </div>
        <h1 class="brutal-title">量纲矩阵调整<span>.游标()</span></h1>
        <div class="header-action end">
          <button class="brutal-btn clear-btn" :disabled="fileList.length === 0" @click="clearAll">
            排空池
          </button>
        </div>
      </header>

      <div class="brutal-grid">
        <!-- 左侧: Upload & File List -->
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span>吞吐序列.反应堆</span>
            <div class="pane-actions">
              <button @click="triggerUpload">投放目标</button>
            </div>
          </div>

          <div class="control-panel-content">
            <div
              v-if="fileList.length === 0"
              class="brutal-upload-area"
              :class="{ 'is-dragover': isDragOver }"
              @click="triggerUpload"
              @dragover.prevent="dragOver"
              @dragleave.prevent="dragLeave"
              @drop.prevent="handleFileDrop"
            >
              <div class="upload-placeholder">
                <span class="upload-icon">📏</span>
                <p>点击或拖拽投入超负荷矩阵</p>
                <small>(将在本地强行压榨修改像素尺寸量纲)</small>
              </div>
              <input
                ref="fileInput"
                type="file"
                multiple
                accept="image/*"
                style="display: none"
                @change="handleFileSelect"
              />
            </div>

            <div v-else class="file-list-area flex-1">
              <input
                ref="fileInput"
                type="file"
                multiple
                accept="image/*"
                style="display: none"
                @change="handleFileSelect"
              />
              <div class="list-wrapper">
                <div v-for="(file, index) in fileList" :key="index" class="file-item brutal-shadow">
                  <div
                    class="file-thumb"
                    :style="{ backgroundImage: file.thumbUrl ? `url(${file.thumbUrl})` : '' }"
                  ></div>
                  <div class="file-info-text">
                    <span class="file-name" :title="file.file.name">{{ file.file.name }}</span>
                    <div class="size-info mt-1">
                      <span class="badge old">{{ file.width }}x{{ file.height }}</span>
                      <span class="arrow">>></span>
                      <span class="badge new"
                        >{{ getTargetDims(file).width }}x{{ getTargetDims(file).height }}</span
                      >
                    </div>
                  </div>

                  <div class="file-actions">
                    <div v-if="file.status === 'done'" class="result-info">
                      <span class="size-diff">{{ formatSize(file.resultBlob?.size || 0) }}</span>
                      <button class="btn-icon" title="预览" @click="previewFile(file)">👁️</button>
                      <button class="btn-icon primary" title="下载" @click="downloadFile(file)">
                        ↓
                      </button>
                    </div>
                    <span v-else-if="file.status === 'error'" class="status-error">[ 崩溃 ]</span>
                    <span v-else-if="file.status === 'processing'" class="status-pending"
                      >[ 处理中... ]</span
                    >
                    <span v-else class="status-pending">[ 待命 ]</span>
                  </div>
                </div>
              </div>

              <!-- 添加更多 -->
              <div class="add-more mt-4 brutal-shadow" @click="triggerUpload">
                + 继续倒注图形矩阵...
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧: Controls -->
        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">缩写调谐.面板</span>
          </div>

          <div class="settings-content">
            <div class="brutal-form-group channel-group bg-pink">
              <label class="brutal-label">引爆方向 (Mode)</label>
              <div class="mode-tabs mt-1">
                <button
                  :class="['mode-tab', resizeMode === 'percentage' ? 'active' : '']"
                  @click="resizeMode = 'percentage'"
                >
                  比率坍缩 (Percentage)
                </button>
                <button
                  :class="['mode-tab', resizeMode === 'fixed' ? 'active' : '']"
                  @click="resizeMode = 'fixed'"
                >
                  物理定格 (Fixed)
                </button>
              </div>
            </div>

            <div v-if="resizeMode === 'percentage'" class="brutal-form-group mt-4">
              <label class="brutal-label">压榨比率 [ {{ percentage }}% ]</label>
              <div class="slider-group mt-1">
                <input
                  v-model.number="percentage"
                  type="range"
                  class="brutal-slider"
                  min="1"
                  max="200"
                  step="1"
                />
              </div>
            </div>

            <div
              v-if="resizeMode === 'fixed'"
              class="brutal-form-group channel-group group-pink mt-4"
            >
              <label class="brutal-label">X轴 物理像素量级 (Width: px)</label>
              <input
                v-model.number="fixedWidth"
                type="number"
                class="brutal-input mt-1"
                min="1"
                @input="handleWidthChange"
              />

              <label class="brutal-label mt-4">Y轴 物理像素量级 (Height: px)</label>
              <input
                v-model.number="fixedHeight"
                type="number"
                class="brutal-input mt-1"
                min="1"
                @input="handleHeightChange"
              />

              <div class="checkbox-wrapper mt-4">
                <label class="brutal-checkbox-label">
                  <input v-model="lockAspectRatio" type="checkbox" class="brutal-checkbox" />
                  开启绝对防扭曲屏障 (锁定宽高比)
                </label>
              </div>
            </div>

            <div class="brutal-form-group mt-4">
              <label class="brutal-label">品质降解阈值 [ {{ Math.round(quality * 100) }}% ]</label>
              <div class="slider-group mt-1">
                <input
                  v-model.number="quality"
                  type="range"
                  class="brutal-slider"
                  min="0.1"
                  max="1"
                  step="0.05"
                />
              </div>
            </div>

            <button
              class="brutal-btn brutal-btn-block action-btn mt-4"
              :disabled="fileList.length === 0 || isProcessing"
              @click="startProcessing"
            >
              {{ isProcessing ? '量纲碾压中...' : '启动降维打击！' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 全局状态栏 -->
      <div class="brutal-status" :class="statusClass">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span>
              <span v-for="i in 10" :key="i">{{ statusText }} // &nbsp;</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Brutal Modal for Preview -->
    <div v-if="showPreview" class="brutal-modal-overlay" @click.self="showPreview = false">
      <div class="brutal-modal brutal-shadow">
        <div class="modal-header bg-yellow">
          <span>量纲对比窗内窥</span>
          <button class="close-btn" @click="showPreview = false">X</button>
        </div>
        <div v-if="previewItem" class="modal-body">
          <div class="preview-box brutal-shadow">
            <h4 class="bg-pink">[原生] {{ formatSize(previewItem.file.size) }}</h4>
            <div class="img-container">
              <img :src="previewItem.thumbUrl || ''" />
            </div>
          </div>
          <div class="preview-box brutal-shadow">
            <h4 class="bg-cyan">[制成] {{ formatSize(previewItem.resultBlob?.size || 0) }}</h4>
            <div class="img-container">
              <img :src="previewItem.resultUrl || ''" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useFileHandler } from '@/composables';

  interface FileItem {
    file: File;
    status: 'pending' | 'processing' | 'done' | 'error';
    width: number;
    height: number;
    thumbUrl: string | null;
    resultUrl: string | null;
    resultBlob: Blob | null;
  }

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const fileList = ref<FileItem[]>([]);
  const resizeMode = ref<'percentage' | 'fixed'>('percentage');
  const percentage = ref(50);
  const fixedWidth = ref(800);
  const fixedHeight = ref(600);
  const lockAspectRatio = ref(true);
  const quality = ref(0.9);
  const isProcessing = ref(false);

  const showPreview = ref(false);
  const previewItem = ref<FileItem | null>(null);

  const { fileInput, isDragOver, triggerFileInput, dragOver, dragLeave, formatSize } =
    useFileHandler({
      accept: 'image/*',
      readMode: 'none'
    });

  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      addFiles(Array.from(target.files));
      target.value = '';
    }
  };

  const handleFileDrop = (event: DragEvent) => {
    dragLeave();
    if (event.dataTransfer?.files) {
      const droppedFiles = Array.from(event.dataTransfer.files).filter(f =>
        f.type.startsWith('image/')
      );
      addFiles(droppedFiles);
    }
  };

  const triggerUpload = () => {
    if (fileInput.value) fileInput.value.click();
    else triggerFileInput();
  };

  const addFiles = (files: File[]) => {
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.startsWith('image/')) {
        const file = files[i];
        const item: FileItem = {
          file: file,
          status: 'pending',
          width: 0,
          height: 0,
          thumbUrl: null,
          resultUrl: null,
          resultBlob: null
        };

        const reader = new FileReader();
        reader.onload = e => {
          item.thumbUrl = e.target?.result as string;
          const img = new Image();
          img.onload = () => {
            item.width = img.width;
            item.height = img.height;

            if (fileList.value.length === 1 && fixedWidth.value === 800) {
              fixedWidth.value = img.width;
              fixedHeight.value = img.height;
            }
          };
          img.src = item.thumbUrl;
        };
        reader.readAsDataURL(file);

        fileList.value.push(item);
      }
    }
  };

  const clearAll = () => {
    fileList.value.forEach(f => {
      if (f.resultUrl) URL.revokeObjectURL(f.resultUrl);
    });
    fileList.value = [];
  };

  const getTargetDims = (file: FileItem) => {
    if (!file.width) return { width: 0, height: 0 };

    if (resizeMode.value === 'percentage') {
      const scale = percentage.value / 100;
      return {
        width: Math.round(file.width * scale),
        height: Math.round(file.height * scale)
      };
    } else {
      if (lockAspectRatio.value && fixedWidth.value) {
        const ratio = file.height / file.width;
        return {
          width: fixedWidth.value,
          height: Math.round(fixedWidth.value * ratio)
        };
      }
      return {
        width: fixedWidth.value,
        height: fixedHeight.value
      };
    }
  };

  const handleWidthChange = () => {
    if (lockAspectRatio.value && fileList.value.length > 0 && fileList.value[0].width) {
      const ratio = fileList.value[0].height / fileList.value[0].width;
      fixedHeight.value = Math.round(fixedWidth.value * ratio);
    }
  };

  const handleHeightChange = () => {
    if (lockAspectRatio.value && fileList.value.length > 0 && fileList.value[0].height) {
      const ratio = fileList.value[0].width / fileList.value[0].height;
      fixedWidth.value = Math.round(fixedHeight.value * ratio);
    }
  };

  const processFile = (item: FileItem) => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const dims = getTargetDims(item);
        const canvas = document.createElement('canvas');
        canvas.width = dims.width;
        canvas.height = dims.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          item.status = 'error';
          reject();
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(img, 0, 0, dims.width, dims.height);

        canvas.toBlob(
          blob => {
            if (blob) {
              if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
              item.resultBlob = blob;
              item.resultUrl = URL.createObjectURL(blob);
              item.status = 'done';
              resolve();
            } else {
              item.status = 'error';
              reject();
            }
          },
          item.file.type,
          quality.value
        );
      };
      img.onerror = () => {
        item.status = 'error';
        reject();
      };
      if (item.thumbUrl) img.src = item.thumbUrl;
    });
  };

  const startProcessing = async () => {
    if (isProcessing.value) return;
    isProcessing.value = true;

    for (const item of fileList.value) {
      item.status = 'processing';
      try {
        await processFile(item);
      } catch (e) {
        console.error(e);
      }
    }

    isProcessing.value = false;
  };

  const previewFile = (item: FileItem) => {
    previewItem.value = item;
    showPreview.value = true;
  };

  const downloadFile = (item: FileItem) => {
    if (!item.resultUrl) return;
    const link = document.createElement('a');
    link.href = item.resultUrl;

    const nameParts = item.file.name.split('.');
    const ext = nameParts.pop();
    const name = nameParts.join('.');
    const dims = getTargetDims(item);
    link.download = `${name}-${dims.width}x${dims.height}.${ext}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusClass = computed(() => {
    if (isProcessing.value) return 'warn';
    if (fileList.value.some(f => f.status === 'done')) return 'success';
    return 'info';
  });

  const statusText = computed(() => {
    if (isProcessing.value) return '警告: 压榨引擎全速运行中，正在扭曲空间量纲...';
    if (fileList.value.some(f => f.status === 'done')) return '任务达成 : 已碾压生成目标尺寸图像！';
    if (fileList.value.length > 0) return '流水线排队就位 : 等候释放指令触发...';
    return '系统静思域 : 等待投喂膨胀的图像区块';
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
    text-align: center;
  }
  .brutal-btn:hover:not(:disabled) {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }
  .brutal-btn:active:not(:disabled) {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }
  .brutal-btn:disabled {
    background: #e0e0e0;
    color: #888;
    border-color: #888;
    box-shadow: 2px 2px 0px #888;
    cursor: not-allowed;
    transform: none;
  }
  .brutal-btn.clear-btn {
    background: #ff4b4b;
    color: #fff;
  }

  .action-btn {
    background: #00e572;
    color: #111;
    padding: 1rem;
  }

  .mt-1 {
    margin-top: 0.25rem;
  }
  .mt-4 {
    margin-top: 1.5rem;
  }
  .flex-1 {
    flex: 1;
  }

  .brutal-grid {
    display: grid;
    grid-template-columns: 1fr 450px;
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
  }
  .bg-cyan {
    background: #2dfdff;
  }
  .bg-pink {
    background: #ff9ecf;
  }
  .text-white {
    color: #fff;
    text-shadow: 1px 1px 0 #111;
  }

  .pane-actions button {
    background: #fff;
    color: #111;
    border: 3px solid #111;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 0.9rem;
    padding: 0.35rem 0.75rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
  }
  .pane-actions button:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }

  .control-panel-content,
  .settings-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    flex: 1;
    background: #fdfdfd;
  }
  .settings-content {
    background: #f8fafc;
    background-image:
      linear-gradient(#e5e5e5 1px, transparent 1px),
      linear-gradient(90deg, #e5e5e5 1px, transparent 1px);
    background-size: 20px 20px;
  }

  .brutal-upload-area {
    border: 4px dashed #111;
    background: #fff;
    padding: 2.5rem 1rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    min-height: 400px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .brutal-upload-area:hover {
    background: #ffd900;
    border-style: solid;
  }
  .upload-icon {
    font-size: 4rem;
    display: block;
    margin-bottom: 1rem;
  }
  .upload-placeholder p {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.25rem;
    margin: 0 0 0.5rem 0;
  }
  .upload-placeholder small {
    font-weight: bold;
    color: #666;
  }

  .file-list-area {
    display: flex;
    flex-direction: column;
  }
  .list-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-height: 500px;
    overflow-y: auto;
    padding: 0.5rem;
  }
  .file-item {
    display: grid;
    grid-template-columns: 60px 1fr auto;
    gap: 1rem;
    padding: 0.75rem;
    background: #fff;
    border: 3px solid #111;
    align-items: center;
  }
  .file-thumb {
    width: 60px;
    height: 60px;
    background-color: #eee;
    background-size: cover;
    background-position: center;
    border: 2px solid #111;
  }
  .file-info-text {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .file-name {
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: 'Syne', sans-serif;
  }
  .size-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    font-weight: bold;
  }
  .badge {
    border: 2px solid #111;
    padding: 2px 4px;
  }
  .badge.old {
    background: #eee;
  }
  .badge.new {
    background: #2dfdff;
  }
  .arrow {
    font-family: monospace;
    font-weight: bold;
  }

  .file-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .result-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .size-diff {
    font-weight: bold;
    margin-right: 0.5rem;
  }
  .btn-icon {
    width: 36px;
    height: 36px;
    border: 3px solid #111;
    background: #fff;
    cursor: pointer;
    font-size: 1.1rem;
    box-shadow: 2px 2px 0px #111;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .btn-icon:hover {
    background: #eee;
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
  }
  .btn-icon.primary {
    background: #ffd900;
    font-weight: bold;
  }
  .status-error {
    color: #ff4b4b;
    font-weight: bold;
  }
  .status-pending {
    color: #666;
    font-weight: bold;
  }

  .add-more {
    border: 3px dashed #111;
    padding: 1.5rem;
    text-align: center;
    font-weight: 900;
    font-size: 1.1rem;
    cursor: pointer;
    background: #fff;
  }
  .add-more:hover {
    background: #ffd900;
    border-style: solid;
  }

  .mode-tabs {
    display: flex;
    gap: 0.5rem;
  }
  .mode-tab {
    flex: 1;
    padding: 0.75rem;
    border: 3px solid #111;
    background: #fff;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.95rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: 0.1s;
  }
  .mode-tab:hover {
    background: #eee;
  }
  .mode-tab.active {
    background: #111;
    color: white;
    transform: translate(3px, 3px);
    box-shadow: inset 2px 2px 0px #000;
  }

  .brutal-shadow {
    box-shadow: 6px 6px 0px #111;
  }
  .channel-group {
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    padding: 1.25rem;
  }
  .channel-group.group-pink {
    background: #fdfae5;
  }

  .brutal-label {
    display: block;
    margin-bottom: 0.75rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    color: #111;
  }
  .brutal-input {
    width: 100%;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-size: 1.1rem;
    padding: 0.5rem;
    border: 3px solid #111;
    border-radius: 0;
    box-shadow: 3px 3px 0px #111;
    outline: none;
    transition: all 0.1s;
    background: #fff;
    box-sizing: border-box;
  }
  .brutal-input:focus {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }

  .slider-group {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .brutal-slider {
    flex: 1;
    -webkit-appearance: none;
    appearance: none;
    height: 12px;
    background: #111;
    outline: none;
    border: 3px solid #111;
    box-shadow: 2px 2px 0px #111;
    margin: 10px 0;
  }
  .brutal-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    background: #ffd900;
    border: 3px solid #111;
    cursor: pointer;
  }

  .checkbox-wrapper {
    display: flex;
    align-items: center;
  }
  .brutal-checkbox {
    width: 20px;
    height: 20px;
    border: 3px solid #111;
    margin-right: 0.5rem;
    accent-color: #ff4b4b;
    cursor: pointer;
  }
  .brutal-checkbox-label {
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
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

  .brutal-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 2rem;
  }
  .brutal-modal {
    width: 1000px;
    max-width: 100%;
    max-height: 90vh;
    background: #fff;
    border: 5px solid #111;
    display: flex;
    flex-direction: column;
  }
  .modal-header {
    display: flex;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    border-bottom: 5px solid #111;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    font-size: 1.5rem;
  }
  .close-btn {
    background: #ff4b4b;
    color: #fff;
    border: 3px solid #111;
    font-weight: 900;
    padding: 0.25rem 0.75rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
  }
  .close-btn:hover {
    background: #111;
    color: #fff;
  }
  .modal-body {
    padding: 2rem;
    display: flex;
    gap: 2rem;
    overflow: auto;
    background: repeating-conic-gradient(#e0e0e0 0% 25%, white 0% 50%) 50% / 20px 20px;
    flex-wrap: wrap;
  }
  .preview-box {
    flex: 1;
    min-width: 300px;
    border: 4px solid #111;
    background: #fff;
    display: flex;
    flex-direction: column;
  }
  .preview-box h4 {
    margin: 0;
    padding: 1rem;
    border-bottom: 4px solid #111;
    text-align: center;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: bold;
    border-top: 0;
  }
  .img-container {
    flex: 1;
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .img-container img {
    max-width: 100%;
    max-height: 50vh;
    object-fit: contain;
  }

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
  [data-theme='dark'] .brutal-status.info,
  [data-theme='dark'] .brutal-input {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
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
  [data-theme='dark'] .channel-group.group-pink,
  [data-theme='dark'] .settings-content {
    background: #222;
  }
  [data-theme='dark'] .settings-content {
    background-image:
      linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px);
  }
  [data-theme='dark'] .brutal-btn.clear-btn {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .action-btn {
    background: #00994c;
    color: #fff;
    border-color: #eee;
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
  [data-theme='dark'] .bg-cyan {
    background: #1a5e5f;
    color: #fff;
  }
  [data-theme='dark'] .bg-pink {
    background: #993366;
    color: #fff;
  }
  [data-theme='dark'] .file-item,
  [data-theme='dark'] .add-more,
  [data-theme='dark'] .mode-tab,
  [data-theme='dark'] .brutal-modal,
  [data-theme='dark'] .preview-box {
    background: #333;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .add-more:hover {
    background: #b28f00;
  }
  [data-theme='dark'] .mode-tab.active {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .file-thumb,
  [data-theme='dark'] .badge {
    border-color: #eee;
  }
  [data-theme='dark'] .badge.old {
    background: #444;
    color: #aaa;
  }
  [data-theme='dark'] .badge.new {
    background: #1a5e5f;
    color: #fff;
  }
  [data-theme='dark'] .btn-icon {
    background: #444;
    border-color: #eee;
    color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .btn-icon:hover {
    background: #666;
  }
  [data-theme='dark'] .btn-icon.primary {
    background: #b28f00;
  }
  [data-theme='dark'] .brutal-shadow {
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .modal-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .preview-box h4 {
    border-bottom-color: #eee;
    color: #111;
  }
  [data-theme='dark'] .close-btn {
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .brutal-modal {
    border-color: #eee;
  }
  [data-theme='dark'] .modal-body {
    background: #1a1a1a;
  }
</style>
