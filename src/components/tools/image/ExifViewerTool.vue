<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <div class="header-action start">
          <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        </div>
        <h1 class="brutal-title">EXIF信息<span>.查杀()</span></h1>
        <div class="header-action end">
          <button
            v-show="exifData && Object.keys(exifData).length > 0"
            class="brutal-btn clear-btn"
            @click="removeExif"
          >
            擦除隐私信息
          </button>
        </div>
      </header>

      <div class="brutal-grid">
        <!-- Left Pane: Info & Preview -->
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span>图像矩阵.注入区</span>
            <div class="pane-actions">
              <button :disabled="!imageUrl" @click="triggerUpload">更换载荷</button>
            </div>
          </div>

          <div class="control-panel-content">
            <div
              v-if="!imageUrl"
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
                accept="image/jpeg,image/tiff"
                style="display: none"
                @change="handleFileSelect"
              />
              <div class="upload-placeholder">
                <span class="upload-icon">⬇️</span>
                <p>点击或拖拽上传图片以暴露元数据</p>
                <small>(当前支持 JPG / JPEG / TIFF)</small>
              </div>
            </div>

            <div v-else class="preview-thumbnail">
              <input
                ref="fileInput"
                type="file"
                accept="image/jpeg,image/tiff"
                style="display: none"
                @change="handleFileSelect"
              />
              <img :src="imageUrl" alt="Preview" />
            </div>

            <div class="brutal-form-group channel-group group-pink mt-4">
              <h4>🎯 说明与功能</h4>
              <p style="font-size: 0.95rem; line-height: 1.5; font-weight: 500">
                ▶ 图像一旦摄取，硬件参数即刻附着于 EXIF 块。<br />
                ▶
                本工具对所上传资源执行深层剥离，可完整窥探设备指纹、地理定位及拍摄时间等高度敏感之元数据。<br />
                ▶ 点击顶部按钮可重组像素阵列，输出纯净的脱敏拷贝。
              </p>
            </div>
          </div>
        </div>

        <!-- Right Pane: EXIF Data -->
        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">元数据.转储栈</span>
          </div>

          <div class="preview-container">
            <div v-if="loading" class="empty-state">
              <span>解析核心转储中... (Loading)</span>
            </div>
            <div v-else-if="exifData && Object.keys(exifData).length > 0" class="exif-list">
              <div v-for="(value, key) in exifData" :key="key" class="exif-item">
                <span class="exif-key">{{ key }}</span>
                <span class="exif-value">{{ value }}</span>
              </div>
            </div>
            <div v-else-if="imageUrl" class="empty-state">
              <span>[!] 未发现任何可用追踪的签名 (No EXIF Data)</span>
            </div>
            <div v-else class="empty-state">
              <span>通道待命中... (Awaiting Input)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Global Status Bar -->
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
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { useFileHandler } from '@/composables';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const imageUrl = ref('');
  const exifData = ref<Record<string, string | number> | null>(null);
  const loading = ref(false);

  const statusClass = computed(() => {
    if (loading.value) return 'warn';
    if (exifData.value && Object.keys(exifData.value).length > 0) return 'success';
    if (imageUrl.value) return 'info';
    return 'info';
  });

  const statusText = computed(() => {
    if (loading.value) return '系统执行深度诊断 : 解析内核正在解压数据块';
    if (exifData.value && Object.keys(exifData.value).length > 0)
      return '高亮警报 : 已侦测到暴露的硬件踪迹与元数据池，随时可执行抹除指令';
    if (imageUrl.value) return '结果输出 : 该序列已清洗，不存在可识别的隐藏标头';
    return '主控台休眠 : 引流节点尚未接触物理媒介';
  });

  const { fileInput, isDragOver, triggerFileInput, dragOver, dragLeave } = useFileHandler({
    accept: 'image/jpeg,image/tiff',
    readMode: 'dataURL',
    onSuccess: result => {
      imageUrl.value = result.data as string;
      readExif(result.file);
    }
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
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      const reader = new FileReader();
      reader.onload = e => {
        imageUrl.value = e.target?.result as string;
        readExif(file);
      };
      reader.readAsDataURL(file);
      target.value = '';
    }
  };

  const handleFileDrop = (event: DragEvent) => {
    dragLeave();
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (file.type === 'image/jpeg' || file.type === 'image/tiff') {
        const reader = new FileReader();
        reader.onload = e => {
          imageUrl.value = e.target?.result as string;
          readExif(file);
        };
        reader.readAsDataURL(file);
      } else {
        ElMessage.warning('目标结构拒绝：仅接受 JPG/TIFF 制式流');
      }
    }
  };

  interface ExifMeta {
    numerator?: number;
    denominator?: number;
    [key: string]: unknown;
  }

  interface EXIFStatic {
    getData(img: File | HTMLImageElement, callback: (this: unknown) => void): boolean;
    getAllTags(img: unknown): Record<string, ExifMeta | string | number | unknown[]>;
  }

  interface GlobalWithEXIF extends Window {
    EXIF?: EXIFStatic;
  }

  const readExif = (file: File) => {
    const globalWin = window as unknown as GlobalWithEXIF;
    if (!globalWin.EXIF) return;

    loading.value = true;
    exifData.value = null;

    globalWin.EXIF.getData(file, function (this: unknown) {
      if (!globalWin.EXIF) return;
      const allMetaData = globalWin.EXIF.getAllTags(this);
      if (allMetaData && Object.keys(allMetaData).length > 0) {
        const formattedData: Record<string, string | number> = {};
        const keyMap: Record<string, string> = {
          Make: '制造厂商',
          Model: '设备型号',
          DateTime: '拍摄时间',
          ExposureTime: '曝光时间',
          FNumber: '光圈值',
          ISOSpeedRatings: 'ISO',
          FocalLength: '焦距',
          GPSLatitude: 'GPS 纬度',
          GPSLongitude: 'GPS 经度',
          Software: '处理软件'
        };

        for (const [key, value] of Object.entries(allMetaData)) {
          if (typeof value === 'object' && value !== null && 'numerator' in value) {
            const meta = value as ExifMeta;
            formattedData[keyMap[key] || key] = (meta.numerator || 0) / (meta.denominator || 1);
          } else if (Array.isArray(value)) {
            formattedData[keyMap[key] || key] = value.join(', ');
          } else {
            formattedData[keyMap[key] || key] = String(value);
          }
        }
        exifData.value = formattedData;
      } else {
        exifData.value = {};
      }
      loading.value = false;
    });
  };

  const removeExif = () => {
    if (!imageUrl.value) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        blob => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `cleansed-${Date.now()}.jpg`;
          a.click();
          URL.revokeObjectURL(url);
          ElMessage.success('已剥离全量 EXIF 轨道痕迹并重新装填为纯静止图像');
        },
        'image/jpeg',
        0.95
      );
    };
    img.src = imageUrl.value;
  };

  onMounted(() => {
    const globalWin = window as unknown as GlobalWithEXIF;
    if (!globalWin.EXIF) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/exif-js/2.3.0/exif.min.js';
      document.head.appendChild(script);
    }
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

  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }

  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-btn:disabled {
    background: #eee;
    color: #aaa;
    border-color: #aaa;
    box-shadow: 2px 2px 0px #aaa;
    cursor: not-allowed;
    transform: none;
  }

  .brutal-btn.clear-btn {
    background: #ff4b4b;
    color: #fff;
  }

  .brutal-grid {
    display: grid;
    grid-template-columns: 450px 1fr;
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

  .control-panel-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
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
    height: 300px;
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
  .upload-placeholder small {
    font-weight: bold;
    color: #666;
  }

  .preview-thumbnail {
    display: flex;
    justify-content: center;
    align-items: center;
    border: 4px solid #111;
    box-shadow: 6px 6px 0px #111;
    height: 300px;
    background: #eee;
    overflow: hidden;
  }

  .preview-thumbnail img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
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
  .mt-4 {
    margin-top: 1.5rem;
  }

  .preview-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #f8fafc;
    background-image:
      linear-gradient(45deg, #e5e5e5 25%, transparent 25%),
      linear-gradient(135deg, #e5e5e5 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #e5e5e5 75%),
      linear-gradient(135deg, transparent 75%, #e5e5e5 75%);
    background-size: 20px 20px;
    background-color: white;
    position: relative;
    padding: 1.5rem;
    min-height: 480px;
    overflow: auto;
  }

  .empty-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    color: #444;
    font-style: italic;
    font-weight: bold;
  }

  .exif-list {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .exif-item {
    display: flex;
    border: 3px solid #111;
    background: #fff;
    box-shadow: 3px 3px 0px #111;
    font-size: 0.95rem;
  }

  .exif-key {
    background: #ffd900;
    padding: 0.75rem 1rem;
    font-weight: 800;
    border-right: 3px solid #111;
    min-width: 120px;
    flex-shrink: 0;
  }

  .exif-value {
    padding: 0.75rem 1rem;
    font-weight: 600;
    word-break: break-all;
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
    background: #ff4b4b;
    color: #fff;
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

  [data-theme='dark'] .preview-thumbnail {
    background: #222;
    border-color: #eee;
    box-shadow: 6px 6px 0px #eee;
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

  [data-theme='dark'] .preview-container {
    background: #222;
    background-image:
      linear-gradient(45deg, #333 25%, transparent 25%),
      linear-gradient(135deg, #333 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #333 75%),
      linear-gradient(135deg, transparent 75%, #333 75%);
  }

  [data-theme='dark'] .exif-item {
    background: #111;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
    color: #eee;
  }
  [data-theme='dark'] .exif-key {
    background: #b28f00;
    border-right-color: #eee;
    color: #fff;
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
    background: #cc0000;
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
