<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <div class="header-action start">
          <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        </div>
        <h1 class="brutal-title">色彩剥离<span>.探针()</span></h1>
        <div class="header-action end">
          <button class="brutal-btn clear-btn" :disabled="!imageUrl" @click="clearAll">
            回收探针
          </button>
        </div>
      </header>

      <div class="brutal-grid">
        <!-- 左侧: Upload / Preview -->
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span>观测介质.扫描台</span>
            <div class="pane-actions">
              <button :disabled="!imageUrl" @click="triggerUpload">更替实体</button>
            </div>
          </div>

          <div class="control-panel-content flex-col">
            <input
              ref="fileInput"
              type="file"
              style="display: none"
              accept="image/*"
              @change="handleFileSelect"
            />

            <div
              v-if="!imageUrl"
              class="brutal-upload-area"
              :class="{ 'is-dragover': isDragOver }"
              @click="triggerUpload"
              @dragover.prevent="dragOver"
              @dragleave.prevent="dragLeave"
              @drop.prevent="handleFileDrop"
            >
              <div class="upload-placeholder">
                <span class="upload-icon">👁️</span>
                <p>点击或拖拽投入视觉图层</p>
                <small>(算法将自动刺探其最深层色彩基盘)</small>
              </div>
            </div>

            <div v-else class="preview-area flex-1">
              <div class="image-wrapper brutal-shadow mt-2">
                <img
                  ref="imgRef"
                  :src="imageUrl"
                  alt="Original"
                  crossorigin="anonymous"
                  @load="extractColors"
                />
              </div>

              <div class="brutal-form-group channel-group group-pink mt-4">
                <h4>🎯 探针工作组备忘</h4>
                <p style="font-size: 0.95rem; line-height: 1.5; font-weight: 500">
                  内置 ColorThief 探测器将在当前进程内解析目标像素构成，并抓取出 8
                  种最具代表性的视觉波长 (Hex/RGB)。 可直接点击右侧提取的色彩块存入本地内存。
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧: Color Palette -->
        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">深层色谱.解析器</span>
          </div>

          <div class="settings-content">
            <div v-if="!imageUrl" class="empty-state mt-4">
              <div class="channel-group bg-cyan">等待目标介质输入...</div>
            </div>

            <div v-else-if="loading" class="empty-state mt-4">
              <div class="channel-group bg-yellow">
                <div class="blink">探针正在下潜并读取色素块...</div>
              </div>
            </div>

            <div v-else-if="palette.length > 0" class="palette-container mt-2">
              <div class="color-grid">
                <div
                  v-for="(color, index) in palette"
                  :key="index"
                  class="color-card brutal-shadow"
                  :style="{ backgroundColor: `rgb(${color.join(',')})` }"
                  @click="copyColor(color)"
                >
                  <div class="color-overlay" :class="{ 'is-dark': isDark(color) }">
                    <span class="hex-value">{{ rgbToHex(color) }}</span>
                    <span class="rgb-value">RGB({{ color.join(',') }})</span>
                  </div>
                  <div class="copy-hint" :class="{ 'is-dark': isDark(color) }">COPY</div>
                </div>
              </div>

              <div class="actions mt-4">
                <button class="brutal-btn brutal-btn-block action-btn" @click="downloadPalette">
                  ↓ 下载色库架构特征 (JSON)
                </button>
              </div>
            </div>
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
    <component
      :is="'script'"
      src="https://cdnjs.cloudflare.com/ajax/libs/color-thief/2.3.0/color-thief.min.js"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { useCopy, useFileHandler } from '@/composables';

  interface ColorThiefInstance {
    getPalette(sourceImage: HTMLImageElement, colorCount?: number, quality?: number): number[][];
  }

  declare global {
    interface Window {
      ColorThief: { new (): ColorThiefInstance } | undefined;
    }
  }

  const { copyToClipboard } = useCopy();
  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const imgRef = ref<HTMLImageElement | null>(null);
  const imageUrl = ref('');
  const palette = ref<number[][]>([]);
  const loading = ref(false);

  const { fileInput, isDragOver, triggerFileInput, dragOver, dragLeave } = useFileHandler({
    accept: 'image/*',
    readMode: 'dataURL',
    onSuccess: result => {
      imageUrl.value = result.data as string;
      palette.value = [];
    }
  });

  const triggerUpload = () => {
    if (fileInput.value) fileInput.value.click();
    else triggerFileInput();
  };

  const clearAll = () => {
    imageUrl.value = '';
    palette.value = [];
    if (fileInput.value) fileInput.value.value = '';
  };

  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      const reader = new FileReader();
      reader.onload = e => {
        imageUrl.value = e.target?.result as string;
        palette.value = [];
      };
      reader.readAsDataURL(file);
      target.value = '';
    }
  };

  const handleFileDrop = (event: DragEvent) => {
    dragLeave();
    if (event.dataTransfer && event.dataTransfer.files) {
      const file = event.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = e => {
          imageUrl.value = e.target?.result as string;
          palette.value = [];
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const colorDistance = (c1: number[], c2: number[]) => {
    return Math.sqrt((c1[0] - c2[0]) ** 2 + (c1[1] - c2[1]) ** 2 + (c1[2] - c2[2]) ** 2);
  };

  const deduplicateColors = (colors: number[][], threshold = 30): number[][] => {
    const unique: number[][] = [];
    for (const color of colors) {
      const isDuplicate = unique.some(u => colorDistance(u, color) < threshold);
      if (!isDuplicate) {
        unique.push(color);
      }
    }
    return unique;
  };

  const extractColors = () => {
    if (!imgRef.value || !window.ColorThief) return;
    if (!imgRef.value.complete) return;

    loading.value = true;
    try {
      const colorThief = new window.ColorThief();
      const result = colorThief.getPalette(imgRef.value, 8);
      palette.value = deduplicateColors(result);
    } catch (error) {
      console.error('Color extraction failed:', error);
      ElMessage.warning('色彩探针下潜失败，请尝试更替图形');
    } finally {
      loading.value = false;
    }
  };

  const rgbToHex = (rgb: number[]) => {
    return (
      '#' +
      rgb
        .map(x => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        })
        .join('')
        .toUpperCase()
    );
  };

  const isDark = (rgb: number[]) => {
    const yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
    return yiq < 128; // <128 stands for dark colors
  };

  const copyColor = (rgb: number[]) => {
    const hex = rgbToHex(rgb);
    copyToClipboard(hex, { success: `已录入色块波长 ${hex}` });
  };

  const downloadPalette = () => {
    const data = palette.value.map(rgb => ({
      rgb: `rgb(${rgb.join(', ')})`,
      hex: rgbToHex(rgb)
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lrm_palette_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  onMounted(() => {
    if (!window.ColorThief) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/color-thief/2.3.0/color-thief.min.js';
      script.onload = () => {
        if (imageUrl.value) extractColors();
      };
      document.head.appendChild(script);
    }
  });

  const statusClass = computed(() => {
    if (loading.value) return 'warn';
    if (palette.value.length > 0) return 'success';
    return 'info';
  });

  const statusText = computed(() => {
    if (loading.value) return '高危操作: 探针正在深入介质图层读取基底色彩能量...';
    if (palette.value.length > 0) return '抓取成功 : 核心色谱阵列已锚定，单击图块建立通道...';
    return '系统静思域 : 等待投入首张目标画布';
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
  .mt-2 {
    margin-top: 0.5rem;
  }
  .mt-4 {
    margin-top: 1.5rem;
  }
  .flex-col {
    display: flex;
    flex-direction: column;
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

  .image-wrapper {
    width: 100%;
    min-height: 250px;
    border: 4px solid #111;
    background: repeating-conic-gradient(#e0e0e0 0% 25%, white 0% 50%) 50% / 20px 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .image-wrapper img {
    max-width: 100%;
    max-height: 50vh;
    object-fit: contain;
  }

  .empty-state {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.2rem;
  }
  .blink {
    animation: blinker 1s linear infinite;
  }
  @keyframes blinker {
    50% {
      opacity: 0;
    }
  }

  .color-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .color-card {
    aspect-ratio: 1;
    border: 4px solid #111;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    position: relative;
    cursor: pointer;
    transition: transform 0.1s;
  }
  .color-card:hover {
    transform: translate(-3px, -3px);
    box-shadow: 10px 10px 0px #111;
  }
  .color-card:active {
    transform: translate(3px, 3px);
    box-shadow: 2px 2px 0px #111;
  }

  .color-overlay {
    background: rgba(255, 255, 255, 0.9);
    padding: 0.5rem;
    border-top: 3px solid #111;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: bold;
    display: flex;
    flex-direction: column;
  }
  .color-overlay.is-dark {
    background: rgba(17, 17, 17, 0.9);
    color: #fff;
    border-top-color: #eee;
  }
  .hex-value {
    font-size: 1.2rem;
  }
  .rgb-value {
    font-size: 0.75rem;
    opacity: 0.7;
  }

  .copy-hint {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.7);
    font-family: 'Syne', sans-serif;
    font-size: 1.5rem;
    font-weight: 900;
    opacity: 0;
    transition: opacity 0.2s;
  }
  .copy-hint.is-dark {
    background: rgba(17, 17, 17, 0.7);
    color: #fff;
  }
  .color-card:hover .copy-hint {
    opacity: 1;
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
  [data-theme='dark'] .brutal-status.info {
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
  [data-theme='dark'] .image-wrapper {
    border-color: #eee;
    background: #333;
  }
  [data-theme='dark'] .brutal-shadow {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .color-card {
    border-color: #eee;
  }
  [data-theme='dark'] .color-overlay {
    border-color: #eee;
  }
</style>
