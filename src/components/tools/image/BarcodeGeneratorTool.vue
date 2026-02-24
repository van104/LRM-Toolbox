<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">条形码<span>.生成()</span></h1>
        <button class="brutal-btn clear-btn" @click="clearContent">清空内容</button>
      </header>

      <div class="brutal-grid">
        <!-- Left Pane: Controls -->
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span>控制台.设定</span>
            <div class="pane-actions">
              <button :disabled="!isValid" @click="downloadBarcode">下载图片</button>
            </div>
          </div>

          <div class="control-panel-content">
            <div class="brutal-form-group">
              <label>条码内容</label>
              <textarea
                v-model="barcodeValue"
                class="brutal-editor"
                placeholder="请输入条形码内容..."
                rows="2"
              ></textarea>
            </div>

            <div class="brutal-form-group">
              <label>格式</label>
              <select v-model="barcodeFormat" class="brutal-select">
                <option value="CODE128">CODE128 (Auto)</option>
                <option value="EAN13">EAN-13</option>
                <option value="UPC">UPC</option>
                <option value="EAN8">EAN-8</option>
                <option value="EAN5">EAN-5</option>
                <option value="EAN2">EAN-2</option>
                <option value="CODE39">CODE39</option>
                <option value="ITF14">ITF-14</option>
                <option value="MSI">MSI</option>
                <option value="pharmacode">Pharmacode</option>
              </select>
            </div>

            <div class="brutal-settings-grid">
              <div class="brutal-form-group">
                <label>宽度 (Width)</label>
                <input
                  v-model.number="barcodeWidth"
                  type="number"
                  min="1"
                  max="4"
                  step="0.5"
                  class="brutal-input"
                />
              </div>
              <div class="brutal-form-group">
                <label>高度 (Height)</label>
                <input
                  v-model.number="barcodeHeight"
                  type="number"
                  min="10"
                  max="150"
                  step="5"
                  class="brutal-input"
                />
              </div>
              <div class="brutal-form-group">
                <label>条码颜色</label>
                <input v-model="lineColor" type="color" class="brutal-input color-input" />
              </div>
              <div class="brutal-form-group">
                <label>背景颜色</label>
                <input v-model="background" type="color" class="brutal-input color-input" />
              </div>
            </div>

            <div class="brutal-form-group checkbox-group">
              <label class="brutal-checkbox-label">
                <input v-model="displayValue" type="checkbox" class="brutal-checkbox" />
                显示文本内容
              </label>
            </div>
          </div>
        </div>

        <!-- Right Pane: Preview -->
        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">实时预览.输出</span>
          </div>

          <div class="preview-container">
            <div ref="barcodeContainer" class="barcode-wrapper">
              <svg ref="barcodeSvg"></svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Global Status Bar -->
      <div class="brutal-status" :class="isValid ? 'success' : 'error'">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-if="isValid">
              <span v-for="i in 10" :key="i">条码生成成功 : 系统正常运行 // &nbsp;</span>
            </span>
            <span v-else>
              <span v-for="i in 10" :key="i">该内容不符合选定格式的要求或为空 // &nbsp;</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import JsBarcode from 'jsbarcode';

  const router = useRouter();

  const barcodeValue = ref('1234567890');
  const barcodeFormat = ref('CODE128');
  const barcodeWidth = ref(2);
  const barcodeHeight = ref(100);
  const displayValue = ref(true);
  const lineColor = ref('#000000');
  const background = ref('#ffffff');
  const isValid = ref(true);

  const barcodeSvg = ref(null);

  const generateBarcode = () => {
    if (!barcodeValue.value) {
      isValid.value = false;
      if (barcodeSvg.value) barcodeSvg.value.innerHTML = '';
      return;
    }

    try {
      JsBarcode(barcodeSvg.value, barcodeValue.value, {
        format: barcodeFormat.value,
        lineColor: lineColor.value,
        background: background.value,
        width: barcodeWidth.value,
        height: barcodeHeight.value,
        displayValue: displayValue.value,
        margin: 10,
        valid: valid => {
          isValid.value = valid;
        }
      });
    } catch (e) {
      console.warn('Barcode generation failed:', e);
      isValid.value = false;
      if (barcodeSvg.value) barcodeSvg.value.innerHTML = '';
    }
  };

  watch(
    [barcodeValue, barcodeFormat, barcodeWidth, barcodeHeight, displayValue, lineColor, background],
    () => {
      generateBarcode();
    }
  );

  onMounted(() => {
    generateBarcode();
  });

  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const clearContent = () => {
    barcodeValue.value = '';
    generateBarcode();
  };

  const downloadBarcode = () => {
    if (!barcodeSvg.value || !isValid.value) return;

    const svgData = new XMLSerializer().serializeToString(barcodeSvg.value);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = background.value;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `barcode-${barcodeValue.value || 'download'}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
    };
    img.src = url;
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
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

  .brutal-btn.clear-btn {
    background: #ff4b4b;
    color: #fff;
  }

  .brutal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    margin-bottom: 3rem;
    min-height: 550px;
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
    transition: all 0.1s;
  }

  .pane-actions button:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }

  .pane-actions button:active:not(:disabled) {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }

  .pane-actions button:disabled {
    background: #eee;
    color: #aaa;
    border-color: #aaa;
    box-shadow: 2px 2px 0px #aaa;
    cursor: not-allowed;
    transform: none;
  }

  .control-panel-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    flex: 1;
    background: #fdfdfd;
  }

  .brutal-form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .brutal-form-group label {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    text-transform: uppercase;
  }

  .brutal-editor,
  .brutal-input,
  .brutal-select {
    width: 100%;
    border: 3px solid #111;
    padding: 0.75rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-size: 1rem;
    background: #fff;
    color: #111;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
    outline: none;
    box-sizing: border-box;
  }

  .brutal-editor::placeholder {
    color: #888;
    font-style: italic;
  }

  .brutal-editor:focus,
  .brutal-input:focus,
  .brutal-select:focus {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .brutal-editor {
    resize: vertical;
    min-height: 80px;
  }

  .brutal-select {
    cursor: pointer;
    background: #f8f8f8;
  }

  .brutal-settings-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .color-input {
    padding: 0;
    height: 48px;
    cursor: pointer;
  }

  .color-input::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  .color-input::-webkit-color-swatch {
    border: none;
  }

  .checkbox-group {
    margin-top: 0.5rem;
  }

  .brutal-checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace !important;
    font-weight: 600 !important;
    text-transform: none !important;
  }

  .brutal-checkbox {
    appearance: none;
    width: 24px;
    height: 24px;
    border: 3px solid #111;
    background: #fff;
    box-shadow: 2px 2px 0px #111;
    cursor: pointer;
    position: relative;
    margin: 0;
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

  .preview-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0;
    position: relative;
    background: #f8fafc;
  }

  .barcode-wrapper {
    flex: 1;
    display: flex;
    padding: 2rem;
    min-height: 300px;
    overflow: auto;
  }

  .barcode-wrapper svg {
    margin: auto;
    display: block;
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
  .brutal-status.error {
    background: #ff4b4b;
    color: white;
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
    .brutal-title {
      font-size: 2.5rem;
    }
    .brutal-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
      min-height: auto;
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

  [data-theme='dark'] .brutal-btn {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 9px 9px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane:hover {
    box-shadow: 16px 16px 0px #eee;
  }

  [data-theme='dark'] .pane-actions button {
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .pane-actions button:hover:not(:disabled) {
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .pane-actions button:active:not(:disabled) {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
    color: #111;
  }

  [data-theme='dark'] .brutal-editor,
  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .brutal-select {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .brutal-editor:focus,
  [data-theme='dark'] .brutal-input:focus,
  [data-theme='dark'] .brutal-select:focus {
    box-shadow: 6px 6px 0px #eee;
  }

  [data-theme='dark'] .brutal-checkbox {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }

  [data-theme='dark'] .brutal-checkbox:checked {
    background: #00994c;
  }

  [data-theme='dark'] .brutal-checkbox:checked::after {
    border-color: #eee;
  }

  [data-theme='dark'] .control-panel-content {
    background: #111;
  }

  [data-theme='dark'] .preview-container {
    background: #222;
  }

  [data-theme='dark'] .brutal-status {
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
  }

  [data-theme='dark'] .brutal-btn.clear-btn {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .brutal-status.error {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .brutal-status.success {
    background: #00994c;
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
