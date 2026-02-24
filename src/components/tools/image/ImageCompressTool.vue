<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <div class="header-action start">
          <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        </div>
        <h1 class="brutal-title">极限压榨<span>.引擎()</span></h1>
        <div class="header-action end">
          <button class="brutal-btn clear-btn" :disabled="!originalImage" @click="clearAll">
            截断工作流
          </button>
        </div>
      </header>

      <div class="brutal-grid">
        <!-- Left Pane: Preview -->
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span>源生载荷.监控室</span>
            <div class="pane-actions">
              <button :disabled="!originalImage" @click="triggerUpload">更替实体</button>
            </div>
          </div>

          <div class="control-panel-content">
            <div
              v-if="!originalImage"
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
                accept="image/*"
                style="display: none"
                @change="handleFileSelect"
              />
              <div class="upload-placeholder">
                <span class="upload-icon">↘️</span>
                <p>点击或拖放灌注目标图像序列</p>
                <small>(完全本地安全域处理，拒绝云端通讯)</small>
              </div>
            </div>

            <div v-else class="preview-area">
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleFileSelect"
              />
              <div class="compare-container">
                <!-- Original -->
                <div class="img-box original-box">
                  <div class="img-badge bg-cyan">原始载荷: {{ originalSizeStr }}</div>
                  <div class="image-wrapper brutal-shadow"><img :src="originalInfo.url" /></div>
                </div>

                <div class="process-divider">
                  <span v-if="compressing" class="loading-text">强压中...</span>
                  <span
                    v-else
                    class="rate-badge"
                    :class="Number(reductionRate) > 0 ? 'bg-green' : 'bg-red'"
                  >
                    体积锐减: -{{ reductionRate }}%
                  </span>
                </div>

                <!-- Compressed -->
                <div class="img-box compressed-box">
                  <div class="img-badge" :class="compressing ? 'bg-yellow' : 'bg-pink'">
                    脱水制品: {{ compressedSizeStr }}
                  </div>
                  <div class="image-wrapper brutal-shadow">
                    <img v-if="compressedInfo.url" :src="compressedInfo.url" />
                    <div v-else class="loading-state">执行中...</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="brutal-form-group channel-group group-pink mt-4">
              <h4>🎯 技术备忘录</h4>
              <p style="font-size: 0.95rem; line-height: 1.5; font-weight: 500">
                本组件使用 Browser-Image-Compression 进行全速像素粉碎。<br />
                调整右侧质量滑块与最大封顶尺寸可以达到极限脱水效果。<br />
                生成的图像始终驻留您的本地终端，隐私性拉满。
              </p>
            </div>
          </div>
        </div>

        <!-- Right Pane: Controls -->
        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">重铸选项.控制台</span>
          </div>

          <div class="settings-content">
            <div class="brutal-form-group channel-group bg-cyan">
              <label class="brutal-label">压榨级别 (Quality):</label>
              <div class="slider-group">
                <input
                  v-model.number="options.quality"
                  type="range"
                  class="brutal-slider mt-1"
                  min="0.1"
                  max="1"
                  step="0.01"
                  @change="compressImage"
                />
                <span class="slider-value">[ {{ Math.round(options.quality * 100) }}% ]</span>
              </div>
            </div>

            <div class="brutal-form-group mt-4">
              <label class="brutal-label">最高封顶分辨率 (px)</label>
              <input
                v-model.number="options.maxWidthOrHeight"
                type="number"
                class="brutal-input"
                placeholder="置空则维持原生尺寸"
                @change="compressImage"
              />
            </div>

            <div class="brutal-form-group mt-4">
              <label class="brutal-label">输出封装协议 (Format)</label>
              <select v-model="options.fileType" class="brutal-input" @change="compressImage">
                <option value="">跟随原相不干涉</option>
                <option value="image/jpeg">JPEG (体积破坏极化)</option>
                <option value="image/png">PNG (透明图层保护)</option>
                <option value="image/webp">WEBP (极客次世代流)</option>
              </select>
            </div>

            <button
              class="brutal-btn brutal-btn-block action-btn mt-4"
              :disabled="!compressedImage || compressing"
              @click="downloadImage"
            >
              抛出最终脱水成品
            </button>
          </div>
        </div>
      </div>

      <!-- Global Status -->
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
  import { ElMessage } from 'element-plus';
  import imageCompression from 'browser-image-compression';
  import { useFileHandler } from '@/composables';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const originalImage = ref<File | null>(null);
  const compressedImage = ref<File | null>(null);
  const compressing = ref(false);

  const originalInfo = ref({ name: '', size: 0, url: '' });
  const compressedInfo = ref({ name: '', size: 0, url: '' });

  const options = ref({
    maxSizeMB: 50,
    maxWidthOrHeight: 1920,
    quality: 0.8,
    useWebWorker: true,
    fileType: ''
  });

  const {
    fileInput,
    isDragOver,
    triggerFileInput,
    handleFileDrop,
    dragOver,
    dragLeave,
    formatSize
  } = useFileHandler({
    accept: 'image/*',
    readMode: 'none',
    onSuccess: result => {
      handleFile(result.file);
    }
  });

  const originalSizeStr = computed(() => {
    return originalInfo.value.size ? formatSize(originalInfo.value.size) : '0 B';
  });

  const compressedSizeStr = computed(() => {
    if (compressing.value) return '计算中';
    return compressedInfo.value.size ? formatSize(compressedInfo.value.size) : '0 B';
  });

  const reductionRate = computed(() => {
    if (!originalInfo.value.size || !compressedInfo.value.size) return 0;
    const rate =
      ((originalInfo.value.size - compressedInfo.value.size) / originalInfo.value.size) * 100;
    return rate.toFixed(1);
  });

  const statusClass = computed(() => {
    if (compressing.value) return 'warn';
    if (compressedImage.value) return 'success';
    return 'info';
  });

  const statusText = computed(() => {
    if (compressing.value) return '超频指令下发中 : 正在暴力抹除多余像素块...';
    if (compressedImage.value)
      return `执行完毕 : 成功削减了 ${reductionRate.value}% 的脂肪体积，等待系统盘卸载`;
    return '内核休眠期 : 准备就绪，请求上游注入图像位流库';
  });

  const triggerUpload = () => {
    if (fileInput.value) {
      fileInput.value.click();
    } else {
      triggerFileInput();
    }
  };

  const clearAll = () => {
    if (originalInfo.value.url) URL.revokeObjectURL(originalInfo.value.url);
    if (compressedInfo.value.url) URL.revokeObjectURL(compressedInfo.value.url);

    originalImage.value = null;
    compressedImage.value = null;
    originalInfo.value = { name: '', size: 0, url: '' };
    compressedInfo.value = { name: '', size: 0, url: '' };
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  };

  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      handleFile(file);
      target.value = '';
    }
  };

  function handleFile(file: File) {
    originalImage.value = file;
    originalInfo.value = {
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file)
    };
    compressImage();
  }

  async function compressImage() {
    if (!originalImage.value) return;

    compressing.value = true;
    try {
      const config: Record<string, unknown> = {
        maxSizeMB: options.value.maxSizeMB,
        maxWidthOrHeight: options.value.maxWidthOrHeight || undefined,
        quality: options.value.quality,
        useWebWorker: options.value.useWebWorker
      };

      if (options.value.fileType) {
        config.fileType = options.value.fileType;
      }

      const compressedFile = await imageCompression(originalImage.value, config);

      compressedImage.value = compressedFile;

      if (compressedInfo.value.url) {
        URL.revokeObjectURL(compressedInfo.value.url);
      }

      compressedInfo.value = {
        name: compressedFile.name,
        size: compressedFile.size,
        url: URL.createObjectURL(compressedFile)
      };
    } catch (error) {
      console.error(error);
      ElMessage.error('矩阵压榨进程破甲: ' + (error as Error).message);
    } finally {
      compressing.value = false;
    }
  }

  function downloadImage() {
    if (!compressedImage.value) return;
    const link = document.createElement('a');
    link.href = compressedInfo.value.url;
    link.download = compressedInfo.value.name;
    link.click();
  }
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
    color: #111;
  }
  .bg-red {
    background: #ff4b4b;
    color: #fff;
  }
  .text-white {
    color: #fff;
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
  }

  .compare-container {
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.5rem;
    background: #fdfae5;
    border: 4px solid #111;
  }

  .img-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 0;
  }

  .img-badge {
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    padding: 0.5rem 1rem;
    font-weight: bold;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    margin-bottom: 1rem;
    z-index: 2;
  }

  .image-wrapper {
    flex: 1;
    width: 100%;
    border: 4px solid #111;
    background: repeating-conic-gradient(#e0e0e0 0% 25%, white 0% 50%) 50% / 20px 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    min-height: 250px;
  }

  .image-wrapper img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .loading-state,
  .loading-text {
    font-weight: 800;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    animation: flash 1s infinite alternate;
  }

  @keyframes flash {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0.5;
    }
  }

  .process-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 1rem;
  }

  .rate-badge {
    border: 3px solid #111;
    padding: 0.75rem 1rem;
    font-weight: 900;
    font-size: 1.1rem;
    box-shadow: 4px 4px 0px #111;
    transform: rotate(-5deg);
  }

  .brutal-shadow {
    box-shadow: 8px 8px 0px #111;
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
  [data-theme='dark'] .compare-container {
    background: #222;
    border-color: #eee;
  }
  [data-theme='dark'] .img-badge {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
    color: #111;
  }
  [data-theme='dark'] .image-wrapper {
    border-color: #eee;
    background: #333;
  }
  [data-theme='dark'] .brutal-shadow {
    box-shadow: 8px 8px 0px #eee;
  }
</style>
