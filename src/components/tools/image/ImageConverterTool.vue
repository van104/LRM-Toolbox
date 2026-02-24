<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <div class="header-action start">
          <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        </div>
        <h1 class="brutal-title">格式互换<span>.阵列()</span></h1>
        <div class="header-action end">
          <button
            class="brutal-btn clear-btn"
            :disabled="isConverting || fileList.length === 0"
            @click="clearAll"
          >
            肃清队列
          </button>
        </div>
      </header>

      <div class="brutal-grid">
        <!-- 左侧: Upload & File List -->
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span>突变阵列.队列库</span>
            <div class="pane-actions">
              <button :disabled="isConverting" @click="triggerUpload">+ 注入位流</button>
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
              <input
                ref="fileInput"
                type="file"
                multiple
                accept="image/*"
                style="display: none"
                @change="handleFileSelect"
              />
              <div class="upload-placeholder">
                <span class="upload-icon">↘️</span>
                <p>点击或拖拽投入大批量像素矩阵</p>
                <small>(支持高并发读取与批量协议转换)</small>
              </div>
            </div>

            <div v-else class="preview-area">
              <input
                ref="fileInput"
                type="file"
                multiple
                accept="image/*"
                style="display: none"
                @change="handleFileSelect"
              />

              <div class="brutal-list">
                <div
                  v-for="(file, index) in fileList"
                  :key="index"
                  class="brutal-list-item brutal-shadow"
                >
                  <div class="item-info">
                    <div class="item-icon">📦</div>
                    <div class="item-details">
                      <span class="item-name">{{ file.file.name }}</span>
                      <span class="item-size">原生载荷: {{ formatSize(file.file.size) }}</span>
                    </div>
                  </div>
                  <div class="item-status">
                    <span v-if="file.status === 'pending'" class="badge bg-yellow text-black"
                      >等待编译</span
                    >
                    <span v-if="file.status === 'processing'" class="badge bg-blue text-white blink"
                      >重组中...</span
                    >
                    <div v-if="file.status === 'done'" class="done-actions">
                      <span class="badge bg-green text-black"
                        >生成: {{ formatSize(file.resultBlob?.size || 0) }}</span
                      >
                      <button class="brutal-btn small-btn extract-btn" @click="downloadFile(file)">
                        提取
                      </button>
                    </div>
                    <span v-if="file.status === 'error'" class="badge bg-red text-white"
                      >堆栈崩溃</span
                    >
                  </div>
                </div>
              </div>
            </div>

            <div class="brutal-form-group channel-group group-pink mt-4" style="margin-top: auto">
              <h4>🎯 运行原理备忘录</h4>
              <p style="font-size: 0.95rem; line-height: 1.5; font-weight: 500">
                本模块核心基于 HTML5 Canvas API
                做底层格式转换渲染。全部运算流程均锁定在浏览器虚拟内存中进行，无需上传服务器。<br />
                PNG格式强制保护原生Alpha透明度且无降级压缩；而
                JPEG格式无法承载透明图层，其背景将被暴力覆盖为纯白防穿透色。
              </p>
            </div>
          </div>
        </div>

        <!-- 右侧: Controls -->
        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">全局变换.控制台</span>
          </div>

          <div class="settings-content">
            <div class="brutal-form-group channel-group bg-cyan">
              <label class="brutal-label">终态封装协议 (Target Dto)</label>
              <select v-model="targetFormat" class="brutal-input">
                <option value="image/png">PNG [透明原色保护]</option>
                <option value="image/jpeg">JPEG [绝对体积压缩]</option>
                <option value="image/webp">WEBP [兼顾质量流媒体]</option>
              </select>
            </div>

            <div v-if="targetFormat !== 'image/png'" class="brutal-form-group mt-4">
              <label class="brutal-label">全局位流剥离比例 (Quality):</label>
              <div class="slider-group mt-1">
                <input
                  v-model.number="quality"
                  type="range"
                  class="brutal-slider"
                  min="0.1"
                  max="1"
                  step="0.1"
                />
                <span class="slider-value">[ {{ Math.round(quality * 100) }}% ]</span>
              </div>
            </div>

            <button
              class="brutal-btn brutal-btn-block action-btn mt-4"
              :disabled="fileList.length === 0 || isConverting"
              @click="startConversion"
            >
              {{ isConverting ? '中央引擎满载撕裂中...' : '启动列队无差别转换' }}
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
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useFileHandler } from '@/composables';

  interface FileItem {
    file: File;
    status: 'pending' | 'processing' | 'done' | 'error';
    resultUrl: string | null;
    resultBlob: Blob | null;
  }

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const fileList = ref<FileItem[]>([]);
  const targetFormat = ref('image/png');
  const quality = ref(0.9);
  const isConverting = ref(false);

  const statusClass = computed(() => {
    if (isConverting.value) return 'warn';
    if (fileList.value.some(f => f.status === 'done')) return 'success';
    return 'info';
  });

  const statusText = computed(() => {
    if (isConverting.value)
      return '线程全开 : 正在暴力剥离原图像素并重新封装管道，请勿断开页面连接...';
    if (fileList.value.some(f => f.status === 'done'))
      return '指令下达完毕 : 所属阵列已经发生突变，随时可以提取封装体';
    if (fileList.value.length > 0)
      return '高位待发 : 所有载荷已加载在缓冲池中，随时等待向下层引擎施压';
    return '内核循环中 : 数据线无负荷，处于低功耗模式待命';
  });

  const { fileInput, isDragOver, triggerFileInput, dragOver, dragLeave, formatSize } =
    useFileHandler({
      accept: 'image/*',
      readMode: 'none'
    });

  const triggerUpload = () => {
    if (fileInput.value) {
      fileInput.value.click();
    } else {
      triggerFileInput();
    }
  };

  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      const inputFiles = Array.from(target.files);
      addFiles(inputFiles);
    }
    target.value = '';
  };

  const handleFileDrop = (event: DragEvent) => {
    dragLeave();
    if (event.dataTransfer && event.dataTransfer.files) {
      const droppedFiles = Array.from(event.dataTransfer.files).filter(f =>
        f.type.startsWith('image/')
      );
      addFiles(droppedFiles);
    }
  };

  const addFiles = (files: File[]) => {
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
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  };

  const getExtension = (mimeType: string) => {
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

  const convertFile = (fileItem: FileItem): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas Failed'));

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
        img.src = e.target?.result as string;
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

  const downloadFile = (fileItem: FileItem) => {
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
    font-size: 1.25rem;
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

  .brutal-btn.action-btn {
    background: #00e572;
    padding: 1.25rem;
    border-color: #111;
  }

  .mt-1 {
    margin-top: 0.25rem;
  }
  .mt-4 {
    margin-top: 1.5rem;
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
  .bg-green {
    background: #00e572;
  }
  .bg-red {
    background: #ff4b4b;
  }
  .text-white {
    color: #fff;
  }
  .text-black {
    color: #111;
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
  .pane-actions button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
    height: 400px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .brutal-upload-area:hover,
  .brutal-upload-area.is-dragover {
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

  .preview-area {
    display: flex;
    flex-direction: column;
    max-height: 600px;
  }

  .brutal-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
    padding: 0.5rem;
    max-height: 500px;
  }

  .brutal-list-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: #fff;
    border: 3px solid #111;
  }

  .item-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .item-icon {
    font-size: 2rem;
  }
  .item-details {
    display: flex;
    flex-direction: column;
  }
  .item-name {
    font-weight: 700;
    font-size: 1.1rem;
  }
  .item-size {
    font-size: 0.85rem;
    font-weight: 600;
    color: #666;
  }

  .item-status {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .badge {
    padding: 0.4rem 0.8rem;
    border: 2px solid #111;
    font-weight: 800;
    font-size: 0.9rem;
    box-shadow: 2px 2px 0px #111;
  }

  .done-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .extract-btn {
    border-width: 2px;
    box-shadow: 2px 2px 0px #111;
    background: #2dfdff;
    color: #111;
  }
  .extract-btn:hover:not(:disabled) {
    box-shadow: 4px 4px 0px #111;
  }

  .blink {
    animation: blinker 1s linear infinite;
  }
  @keyframes blinker {
    50% {
      opacity: 0.5;
    }
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

  .brutal-label {
    display: block;
    margin-bottom: 0.75rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    color: #111;
  }
  .brutal-input {
    width: 100%;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-size: 1rem;
    padding: 0.75rem;
    border: 3px solid #111;
    border-radius: 0;
    box-shadow: 4px 4px 0px #111;
    outline: none;
    transition: all 0.1s;
    background: #fff;
    box-sizing: border-box;
  }
  .brutal-input:focus {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
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
    box-shadow: 3px 3px 0px #111;
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
  .slider-value {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    min-width: 60px;
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
  [data-theme='dark'] .group-pink h4 {
    color: #ff9ecf;
    text-shadow: 1px 1px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn.clear-btn {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .brutal-btn.action-btn {
    background: #00994c;
    color: #fff;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-btn.action-btn:disabled {
    background: #333;
    color: #888;
    border-color: #888;
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
  [data-theme='dark'] .brutal-list-item {
    background: #222;
    border-color: #eee;
  }
  [data-theme='dark'] .item-size {
    color: #aaa;
  }
  [data-theme='dark'] .badge {
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .brutal-shadow {
    box-shadow: 6px 6px 0px #eee;
  }
</style>
