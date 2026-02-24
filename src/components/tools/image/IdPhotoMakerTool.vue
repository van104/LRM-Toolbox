<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <div class="header-action start">
          <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        </div>
        <h1 class="brutal-title">证件照<span>.重铸()</span></h1>
        <div class="header-action end">
          <button class="brutal-btn clear-btn" :disabled="!imageUrl" @click="clearAll">
            清空工作台
          </button>
        </div>
      </header>

      <div class="brutal-grid">
        <!-- Left Pane: Info & Content Workspace -->
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span>图像矩阵.裁剪操作区</span>
            <div class="pane-actions">
              <button :disabled="!imageUrl" @click="triggerUpload">更换基底</button>
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
                accept="image/*"
                style="display: none"
                @change="handleFileSelect"
              />
              <div class="upload-placeholder">
                <span class="upload-icon">📸</span>
                <p>点击或拖拽上传以锚定操作矩阵</p>
                <small>(请上传背景简单、光线均匀的正面半身像)</small>
              </div>
            </div>

            <div v-else class="editor-area">
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleFileSelect"
              />
              <div class="canvas-container brutal-canvas-box">
                <div
                  ref="previewBoxRef"
                  class="photo-preview-box brutal-shadow"
                  :style="{
                    width: previewWidth + 'px',
                    height: previewHeight + 'px',
                    backgroundColor: bgColor,
                    cursor: isDragging ? 'grabbing' : 'grab'
                  }"
                  @wheel.prevent="handleZoom"
                  @mousedown="startDrag"
                >
                  <img
                    v-if="imgNaturalW > 0"
                    :src="imageUrl"
                    alt="User"
                    draggable="false"
                    class="preview-image"
                    :style="{
                      width: imgDisplayW + 'px',
                      height: imgDisplayH + 'px',
                      left: imgLeft + 'px',
                      top: imgTop + 'px'
                    }"
                  />
                  <!-- Guide lines -->
                  <div class="guides">
                    <div class="guide-h" style="top: 30%"></div>
                    <div class="guide-v" style="left: 50%"></div>
                  </div>
                </div>
              </div>

              <div class="editor-tips mt-3">
                <span class="tip-badge">⚠ 触控指南</span>
                <span class="tip-text">使用滚轮缩放，左键拖曳重设视区位置。</span>
              </div>
            </div>

            <div class="brutal-form-group channel-group group-pink mt-4">
              <h4>🎯 技术备忘录</h4>
              <p style="font-size: 0.95rem; line-height: 1.5; font-weight: 500">
                建议组合使用智能去背景插件获得更纯净的轮廓。<br />
                在重设参数时请留意红色预警准星十字。<br />
                所有的导出图像均强制进行物理 300DPI 分发渲染。
              </p>
            </div>
          </div>
        </div>

        <!-- Right Pane: Controls & Settings -->
        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">配置选项.控制台</span>
          </div>

          <div class="settings-content">
            <div class="brutal-form-group">
              <label class="brutal-label">通用模版规格 (📐)</label>
              <select v-model="selectedSizeKey" class="brutal-input">
                <option v-for="(s, k) in sizes" :key="k" :value="k">{{ s.name }}</option>
              </select>
              <div v-if="currentSize" class="tool-note">
                输出参数: {{ currentSize.w_mm }}x{{ currentSize.h_mm }} mm /
                {{ currentSize.w_px }}x{{ currentSize.h_px }} px (300dpi)
              </div>
            </div>

            <div class="brutal-form-group mt-4">
              <label class="brutal-label">底色覆盖色值 (🎨)</label>
              <div class="color-presets">
                <div
                  v-for="color in bgColors"
                  :key="color.value"
                  class="brutal-color-swatch brutal-shadow-sm"
                  :style="{ backgroundColor: color.value }"
                  :class="{ active: bgColor === color.value }"
                  :title="color.label"
                  @click="bgColor = color.value"
                ></div>
                <input
                  v-model="bgColor"
                  type="color"
                  class="brutal-color-picker brutal-shadow-sm"
                  title="自定义色块"
                />
              </div>
            </div>

            <div class="brutal-form-group mt-4">
              <label class="brutal-label">当前投影比例 (🔎)</label>
              <div class="slider-group">
                <input
                  v-model.number="zoom"
                  type="range"
                  class="brutal-slider"
                  min="0.1"
                  max="3"
                  step="0.01"
                />
                <span class="slider-value">[ {{ zoom.toFixed(2) }}x ]</span>
              </div>
            </div>

            <div class="sidebar-actions mt-4">
              <button class="brutal-btn small-btn full-width" @click="resetTransform">
                重置变换矩阵
              </button>
            </div>

            <button
              class="brutal-btn brutal-btn-block action-btn mt-4"
              :disabled="!imageUrl"
              @click="downloadPhoto"
            >
              导出装帧图像成品
            </button>
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

    <!-- Hidden Canvas -->
    <canvas ref="exportCanvas" style="display: none"></canvas>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { useFileHandler } from '@/composables';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const imageUrl = ref('');
  const bgColor = ref('#4b7bff');
  const zoom = ref(1);
  const dragOffset = ref({ x: 0, y: 0 });
  const isDragging = ref(false);
  const startPos = ref({ x: 0, y: 0 });
  const exportCanvas = ref<HTMLCanvasElement | null>(null);
  const imgNaturalW = ref(0);
  const imgNaturalH = ref(0);

  type SizeKey = '1inch' | '2inch' | 'small1' | 'large1' | 'passport' | 'visa_us';
  const sizes: Record<
    SizeKey,
    { name: string; w_mm: number; h_mm: number; w_px: number; h_px: number }
  > = {
    '1inch': { name: '一寸 (25*35mm)', w_mm: 25, h_mm: 35, w_px: 295, h_px: 413 },
    '2inch': { name: '二寸 (35*49mm)', w_mm: 35, h_mm: 49, w_px: 413, h_px: 579 },
    small1: { name: '小一寸 (22*32mm)', w_mm: 22, h_mm: 32, w_px: 260, h_px: 378 },
    large1: { name: '大一寸 (33*48mm)', w_mm: 33, h_mm: 48, w_px: 390, h_px: 567 },
    passport: { name: '护照 (33*48mm)', w_mm: 33, h_mm: 48, w_px: 390, h_px: 567 },
    visa_us: { name: '美国签证 (51*51mm)', w_mm: 51, h_mm: 51, w_px: 600, h_px: 600 }
  };

  const bgColors = [
    { label: '白色', value: '#FFFFFF' },
    { label: '红色', value: '#ff4b4b' },
    { label: '蓝色', value: '#4b7bff' },
    { label: '灰色', value: '#CCCCCC' }
  ];

  const selectedSizeKey = ref<SizeKey>('1inch');
  const currentSize = computed(() => sizes[selectedSizeKey.value]);

  const statusClass = computed(() => {
    if (isDragging.value) return 'warn';
    if (imageUrl.value) return 'success';
    return 'info';
  });

  const statusText = computed(() => {
    if (isDragging.value) return '警告: 重生信标已离线，坐标系发生强行偏移介入...';
    if (imageUrl.value) return '主引擎已锁定目标帧 : 修改底色及比例系数后即可触发热压编译';
    return '系统等待接入 : 指向性模块离线，等待目标图像传入缓冲区';
  });

  const previewScale = 8;
  const previewWidth = computed(() => currentSize.value.w_mm * previewScale);
  const previewHeight = computed(() => currentSize.value.h_mm * previewScale);

  // Image display dimensions and position (explicit pixel math, shared by preview & export)
  const imgDisplayW = computed(() => imgNaturalW.value * zoom.value);
  const imgDisplayH = computed(() => imgNaturalH.value * zoom.value);
  const imgLeft = computed(() => (previewWidth.value - imgDisplayW.value) / 2 + dragOffset.value.x);
  const imgTop = computed(() => (previewHeight.value - imgDisplayH.value) / 2 + dragOffset.value.y);

  const loadImageDimensions = (url: string) => {
    const img = new Image();
    img.onload = () => {
      imgNaturalW.value = img.width;
      imgNaturalH.value = img.height;
      // Auto-fit: make image cover the preview box
      const fitZoom = Math.max(previewWidth.value / img.width, previewHeight.value / img.height);
      zoom.value = fitZoom;
      dragOffset.value = { x: 0, y: 0 };
    };
    img.src = url;
  };

  const { fileInput, isDragOver, triggerFileInput, dragOver, dragLeave } = useFileHandler({
    accept: 'image/*',
    readMode: 'dataURL',
    onSuccess: result => {
      imageUrl.value = result.data as string;
      loadImageDimensions(result.data as string);
    }
  });

  const triggerUpload = () => {
    if (fileInput.value) {
      fileInput.value.click();
    } else {
      triggerFileInput();
    }
  };

  const clearAll = () => {
    imageUrl.value = '';
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  };

  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      const reader = new FileReader();
      reader.onload = e => {
        const url = e.target?.result as string;
        imageUrl.value = url;
        loadImageDimensions(url);
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
          const url = e.target?.result as string;
          imageUrl.value = url;
          loadImageDimensions(url);
        };
        reader.readAsDataURL(file);
      } else {
        ElMessage.warning('装填取消: 指纹库未命中允许装载的位图阵列');
      }
    }
  };

  const resetTransform = () => {
    if (imgNaturalW.value > 0 && imgNaturalH.value > 0) {
      zoom.value = Math.max(
        previewWidth.value / imgNaturalW.value,
        previewHeight.value / imgNaturalH.value
      );
    } else {
      zoom.value = 1;
    }
    dragOffset.value = { x: 0, y: 0 };
  };

  const startDrag = (e: MouseEvent) => {
    isDragging.value = true;
    startPos.value = { x: e.clientX - dragOffset.value.x, y: e.clientY - dragOffset.value.y };

    const handleMouseMove = (me: MouseEvent) => {
      if (!isDragging.value) return;
      dragOffset.value = {
        x: me.clientX - startPos.value.x,
        y: me.clientY - startPos.value.y
      };
    };

    const handleMouseUp = () => {
      isDragging.value = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleZoom = (e: WheelEvent) => {
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    zoom.value = Math.max(0.1, Math.min(3, zoom.value + delta));
  };

  const downloadPhoto = () => {
    if (!imageUrl.value || !exportCanvas.value || imgNaturalW.value === 0) return;

    const canvas = exportCanvas.value;
    const ctx = canvas.getContext('2d');
    if (!ctx) return ElMessage.error('图形处理器崩溃');

    const size = currentSize.value;
    canvas.width = size.w_px;
    canvas.height = size.h_px;

    ctx.fillStyle = bgColor.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.onload = () => {
      // Use the EXACT SAME math as the preview computed properties:
      // imgLeft, imgTop, imgDisplayW, imgDisplayH are in preview CSS pixels.
      // Scale them to export canvas pixels.
      const sx = size.w_px / previewWidth.value;
      const sy = size.h_px / previewHeight.value;

      const drawX = imgLeft.value * sx;
      const drawY = imgTop.value * sy;
      const drawW = imgDisplayW.value * sx;
      const drawH = imgDisplayH.value * sy;

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.download = `identity_photo_${selectedSizeKey.value}_output.jpg`;
      link.click();
      ElMessage.success('最终序列处理完毕并抛出硬盘流');
    };
    img.src = imageUrl.value;
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

  .brutal-btn.small-btn {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #111;
  }

  .full-width {
    width: 100%;
  }

  .brutal-btn:hover:not(:disabled) {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }

  .brutal-btn.small-btn:hover:not(:disabled) {
    box-shadow: 6px 6px 0px #111;
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
    border: 4px solid #111;
  }

  .mt-1 {
    margin-top: 0.25rem;
  }
  .mt-3 {
    margin-top: 1rem;
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

  .editor-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
  }

  .brutal-canvas-box {
    background: repeating-conic-gradient(#e0e0e0 0% 25%, transparent 0% 50%) 50% / 20px 20px;
    background-color: white;
    border: 4px solid #111;
    box-shadow:
      inset 0px 0px 0px 2px #fff,
      8px 8px 0px #111;
    padding: 40px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    box-sizing: border-box;
  }

  .photo-preview-box {
    position: relative;
    overflow: hidden;
    outline: 4px solid #111;
    box-shadow: 4px 4px 0px #111;
    transition: background-color 0.2s;
  }

  .preview-image {
    position: absolute;
    user-select: none;
    pointer-events: none;
  }

  .guides {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
  }

  .guide-h {
    position: absolute;
    left: 0;
    right: 0;
    border-top: 2px dashed #ff4b4b;
    opacity: 0.8;
  }

  .guide-v {
    position: absolute;
    top: 0;
    bottom: 0;
    border-left: 2px dashed #ff4b4b;
    opacity: 0.8;
  }

  .editor-tips {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    width: 100%;
    padding: 1rem;
    border: 3px solid #111;
    background: #fff;
    box-shadow: 4px 4px 0px #111;
  }

  .tip-badge {
    background: #111;
    color: #fff;
    padding: 0.25rem 0.5rem;
    font-weight: bold;
    font-size: 0.8rem;
  }

  .tip-text {
    font-weight: 600;
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

  /* Input Replacements */
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
  }

  .brutal-input:focus {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .tool-note {
    margin-top: 0.75rem;
    font-size: 0.85rem;
    color: #666;
    font-weight: bold;
    font-style: italic;
    border-left: 3px solid #ffd900;
    padding-left: 0.5rem;
  }

  .color-presets {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .brutal-color-swatch {
    width: 40px;
    height: 40px;
    border: 3px solid #111;
    cursor: pointer;
    transition: all 0.1s;
  }

  .brutal-color-picker {
    width: 60px;
    height: 60px;
    padding: 0;
    border: 3px solid #111;
    cursor: pointer;
    background: none;
    transition: all 0.1s;
  }

  .brutal-color-picker::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  .brutal-color-picker::-webkit-color-swatch {
    border: none;
  }

  .brutal-shadow-sm {
    box-shadow: 4px 4px 0px #111;
  }

  .brutal-color-swatch:hover,
  .brutal-color-swatch.active,
  .brutal-color-picker:hover {
    transform: translate(-3px, -3px);
    box-shadow: 7px 7px 0px #111;
  }

  .slider-group {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .brutal-slider {
    flex: 1;
    -webkit-appearance: none;
    appearance: none;
    height: 16px;
    background: #fff;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #111;
    outline: none;
  }

  .brutal-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 36px;
    background: #4b7bff;
    border: 3px solid #111;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }

  .brutal-slider::-moz-range-thumb {
    width: 24px;
    height: 36px;
    background: #4b7bff;
    border: 3px solid #111;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
  }

  .brutal-slider::-webkit-slider-thumb:active {
    background: #ffd900;
  }

  .slider-value {
    font-weight: bold;
    min-width: 80px;
    text-align: right;
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
    background: #ff4b4b;
    color: #fff;
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
  [data-theme='dark'] .pane-actions button,
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

  [data-theme='dark'] .brutal-canvas-box {
    background: #222;
    border-color: #eee;
    box-shadow:
      inset 0px 0px 0px 2px #555,
      8px 8px 0px #eee;
  }
  [data-theme='dark'] .photo-preview-box {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .editor-tips {
    background: #222;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
    color: #eee;
  }
  [data-theme='dark'] .tip-badge {
    background: #eee;
    color: #111;
  }

  [data-theme='dark'] .channel-group {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .channel-group.group-pink {
    background: #1a1a1a;
  }
  [data-theme='dark'] .group-pink h4 {
    color: #ff9ecf;
    text-shadow: 1px 1px 0px #eee;
  }

  [data-theme='dark'] .settings-content {
    background: #222;
    background-image:
      linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px);
  }

  [data-theme='dark'] .brutal-input {
    background: #111;
    border-color: #eee;
    color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-input:focus {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .tool-note {
    color: #aaa;
  }

  [data-theme='dark'] .brutal-color-swatch,
  [data-theme='dark'] .brutal-color-picker {
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-shadow-sm {
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-color-swatch:hover,
  [data-theme='dark'] .brutal-color-swatch.active,
  [data-theme='dark'] .brutal-color-picker:hover {
    box-shadow: 7px 7px 0px #eee;
  }

  [data-theme='dark'] .brutal-slider {
    background: #222;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .brutal-slider::-webkit-slider-thumb {
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .brutal-slider::-moz-range-thumb {
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }

  [data-theme='dark'] .brutal-status {
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
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
    background: #cc0000;
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
