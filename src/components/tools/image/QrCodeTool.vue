<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <div class="header-action start">
          <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        </div>
        <h1 class="brutal-title">信号矩阵<span>.二维码()</span></h1>
        <div class="header-action end"></div>
      </header>

      <!-- Tab 切换 -->
      <div class="mode-tabs">
        <button
          :class="['mode-tab', currentTab === 'generate' ? 'active' : '']"
          @click="currentTab = 'generate'"
        >
          📤 信号编码 (生成)
        </button>
        <button
          :class="['mode-tab', currentTab === 'scan' ? 'active' : '']"
          @click="currentTab = 'scan'"
        >
          📥 信号解码 (解析)
        </button>
      </div>

      <!-- 生成模式 -->
      <div v-if="currentTab === 'generate'" class="brutal-grid">
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span>数据注入.控制台</span>
          </div>
          <div class="control-panel-content">
            <div class="brutal-form-group">
              <label class="brutal-label">载荷内容 (Payload)</label>
              <textarea
                v-model="generate.content"
                class="brutal-textarea mt-1"
                rows="4"
                placeholder="输入文本或网址..."
                @input="debouncedGenerate"
              ></textarea>
            </div>

            <div class="brutal-form-group channel-group mt-4">
              <h4>纠错屏障等级</h4>
              <div class="ecl-grid mt-1">
                <button
                  v-for="level in eclLevels"
                  :key="level.value"
                  :class="[
                    'ecl-btn',
                    generate.options.errorCorrectionLevel === level.value ? 'active' : ''
                  ]"
                  @click="
                    generate.options.errorCorrectionLevel = level.value;
                    generateQRCode();
                  "
                >
                  {{ level.label }}
                </button>
              </div>
            </div>

            <div class="brutal-form-group channel-group group-pink mt-4">
              <h4>物理尺寸 [ {{ generate.options.width }}px ]</h4>
              <input
                v-model.number="generate.options.width"
                type="range"
                class="brutal-slider mt-1"
                min="100"
                max="1000"
                step="10"
                @input="generateQRCode"
              />

              <h4 class="mt-4">边距量级 [ {{ generate.options.margin }} ]</h4>
              <input
                v-model.number="generate.options.margin"
                type="range"
                class="brutal-slider mt-1"
                min="0"
                max="10"
                @input="generateQRCode"
              />
            </div>

            <div class="brutal-form-group channel-group mt-4">
              <h4>漆色系统</h4>
              <div class="color-row mt-1">
                <div class="color-item">
                  <span class="brutal-label">前景色</span>
                  <input
                    v-model="generate.options.color.dark"
                    type="color"
                    class="brutal-input color-picker"
                    @input="generateQRCode"
                  />
                </div>
                <div class="color-item">
                  <span class="brutal-label">背景色</span>
                  <input
                    v-model="generate.options.color.light"
                    type="color"
                    class="brutal-input color-picker"
                    @input="generateQRCode"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">出射信号.预览</span>
          </div>
          <div class="preview-content">
            <div class="qr-display brutal-shadow">
              <img v-if="generate.qrUrl" :src="generate.qrUrl" alt="QR Code" class="qr-image" />
              <div v-else class="qr-placeholder">
                <span class="placeholder-icon">📡</span>
                <p>输入载荷生成矩阵信号</p>
              </div>
            </div>
            <button
              class="brutal-btn brutal-btn-block action-btn mt-4"
              :disabled="!generate.qrUrl"
              @click="downloadQRCode"
            >
              导出二维码图像
            </button>
          </div>
        </div>
      </div>

      <!-- 解析模式 -->
      <div v-if="currentTab === 'scan'" class="brutal-grid scan-grid">
        <div class="brutal-pane">
          <div class="pane-header bg-pink">
            <span>信号捕获.探针</span>
          </div>
          <div class="control-panel-content">
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleFileSelect"
            />
            <div class="brutal-upload-area" @click="triggerFileInput" @paste="handlePaste">
              <div v-if="scan.imageUrl" class="scan-img-wrapper">
                <img :src="scan.imageUrl" class="scan-preview-img" />
                <div class="scan-overlay-hint">点击或粘贴更换图片</div>
              </div>
              <div v-else class="upload-placeholder">
                <span class="upload-icon">🔍</span>
                <p>点击上传 / 拖入图片 / Ctrl+V 粘贴</p>
                <small>(本地解析，数据不会上传)</small>
              </div>
            </div>
          </div>
        </div>

        <div class="brutal-pane">
          <div class="pane-header bg-green">
            <span>解码结果.输出带</span>
            <div class="pane-actions">
              <button :disabled="!scan.result" @click="copyScanResult">复制</button>
              <button :disabled="!scan.result" @click="clearScan">清空</button>
            </div>
          </div>
          <div class="control-panel-content">
            <textarea
              v-model="scan.result"
              class="brutal-textarea result-area"
              readonly
              placeholder="解析结果将显示在这里..."
            ></textarea>
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

<script setup>
  import { ref, reactive, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import QRCode from 'qrcode';
  import jsQR from 'jsqr';
  import tinycolor from 'tinycolor2';
  import { useCopy, useFileHandler } from '@/composables';

  const { copyToClipboard } = useCopy();
  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const currentTab = ref('generate');

  const generate = reactive({
    content: '',
    qrUrl: '',
    options: {
      errorCorrectionLevel: 'M',
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    }
  });

  const eclLevels = [
    { value: 'L', label: '低 (7%)' },
    { value: 'M', label: '中 (15%)' },
    { value: 'Q', label: '高 (25%)' },
    { value: 'H', label: '极 (30%)' }
  ];

  let timeout = null;
  function debouncedGenerate() {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => generateQRCode(), 300);
  }

  async function generateQRCode() {
    if (!generate.content) {
      generate.qrUrl = '';
      return;
    }
    try {
      const opts = {
        errorCorrectionLevel: generate.options.errorCorrectionLevel,
        width: generate.options.width,
        margin: generate.options.margin,
        color: {
          dark: tinycolor(generate.options.color.dark).toHexString(),
          light: tinycolor(generate.options.color.light || '#ffffff').toHex8String()
        }
      };
      generate.qrUrl = await QRCode.toDataURL(generate.content, opts);
    } catch (err) {
      console.error(err);
      ElMessage.error('生成失败');
    }
  }

  function downloadQRCode() {
    if (!generate.qrUrl) return;
    const link = document.createElement('a');
    link.href = generate.qrUrl;
    link.download = `qrcode-${Date.now()}.png`;
    link.click();
  }

  const scan = reactive({
    imageUrl: '',
    result: ''
  });

  const { fileInput, triggerFileInput } = useFileHandler({
    accept: 'image/*',
    readMode: 'none'
  });

  const handleFileSelect = event => {
    const file = event.target.files[0];
    if (file) processImage(file);
    event.target.value = '';
  };

  function handlePaste(e) {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        processImage(file);
        break;
      }
    }
  }

  function processImage(file) {
    const url = URL.createObjectURL(file);
    scan.imageUrl = url;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);

      const code = jsQR(imageData.data, img.width, img.height);
      if (code) {
        scan.result = code.data;
        ElMessage.success('解析成功');
      } else {
        scan.result = '';
        ElMessage.warning('未能识别二维码');
      }
    };
    img.src = url;
  }

  function clearScan() {
    scan.imageUrl = '';
    scan.result = '';
  }

  function copyScanResult() {
    if (!scan.result) return;
    copyToClipboard(scan.result, { success: '已复制' });
  }

  const statusClass = computed(() => {
    if (currentTab.value === 'generate' && generate.qrUrl) return 'success';
    if (currentTab.value === 'scan' && scan.result) return 'success';
    return 'info';
  });

  const statusText = computed(() => {
    if (currentTab.value === 'generate') {
      if (generate.qrUrl) return '编码完成 : 矩阵信号图谱已就绪等待下载!';
      return '编码引擎待命 : 请注入载荷数据...';
    }
    if (scan.result) return '解码完成 : 已成功捕获隐藏在信号矩阵中的数据!';
    return '解码探针扫描中 : 请投入二维码图片...';
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
  }
  .action-btn {
    background: #00e572;
    color: #111;
  }

  .mt-1 {
    margin-top: 0.25rem;
  }
  .mt-4 {
    margin-top: 1.5rem;
  }
  .mb-4 {
    margin-bottom: 1.5rem;
  }

  .mode-tabs {
    display: flex;
    border: 4px solid #111;
    background: #fff;
    box-shadow: 8px 8px 0px #111;
  }
  .mode-tab {
    flex: 1;
    padding: 1rem;
    border: none;
    background: transparent;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.15rem;
    cursor: pointer;
    border-right: 4px solid #111;
    transition: 0.1s;
  }
  .mode-tab:last-child {
    border-right: none;
  }
  .mode-tab:hover {
    background: #eee;
  }
  .mode-tab.active {
    background: #111;
    color: white;
  }

  .brutal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
  }
  .scan-grid {
    grid-template-columns: 1fr 1fr;
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
  .bg-pink {
    background: #ff9ecf;
  }
  .bg-green {
    background: #00e572;
  }
  .text-white {
    color: #fff;
    text-shadow: 1px 1px 0 #111;
  }

  .pane-actions {
    display: flex;
    gap: 0.5rem;
  }
  .pane-actions button {
    background: #fff;
    color: #111;
    border: 3px solid #111;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    font-size: 0.85rem;
    padding: 0.3rem 0.6rem;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
  }
  .pane-actions button:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 4px 4px 0px #111;
  }
  .pane-actions button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .control-panel-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  .preview-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    flex: 1;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
    background-image:
      linear-gradient(#e5e5e5 1px, transparent 1px),
      linear-gradient(90deg, #e5e5e5 1px, transparent 1px);
    background-size: 20px 20px;
  }

  .brutal-label {
    display: block;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.95rem;
    color: #111;
    margin-bottom: 0.5rem;
  }
  .brutal-textarea {
    width: 100%;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.95rem;
    padding: 0.75rem;
    border: 3px solid #111;
    border-radius: 0;
    box-shadow: 3px 3px 0px #111;
    outline: none;
    resize: vertical;
    background: #fff;
    box-sizing: border-box;
  }
  .brutal-textarea:focus {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }
  .result-area {
    flex: 1;
    min-height: 300px;
  }

  .channel-group {
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    padding: 1.25rem;
    background: #fdfdfd;
  }
  .channel-group.group-pink {
    background: #fff0f5;
  }
  .channel-group h4 {
    margin: 0;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1rem;
    font-weight: 800;
  }

  .ecl-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
  }
  .ecl-btn {
    padding: 0.5rem;
    border: 3px solid #111;
    background: #fff;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 0.8rem;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    transition: 0.1s;
    text-align: center;
  }
  .ecl-btn:hover {
    background: #eee;
  }
  .ecl-btn.active {
    background: #111;
    color: #fff;
    transform: translate(2px, 2px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-slider {
    width: 100%;
    -webkit-appearance: none;
    appearance: none;
    height: 12px;
    background: #111;
    border: 3px solid #111;
    box-shadow: 2px 2px 0px #111;
    margin: 5px 0;
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

  .color-row {
    display: flex;
    gap: 2rem;
  }
  .color-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .brutal-input.color-picker {
    width: 50px;
    height: 40px;
    padding: 0;
    border: 3px solid #111;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
  }
  .brutal-input.color-picker::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  .brutal-input.color-picker::-webkit-color-swatch {
    border: none;
  }

  .qr-display {
    width: 320px;
    height: 320px;
    border: 4px solid #111;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .qr-image {
    max-width: 100%;
    max-height: 100%;
  }
  .qr-placeholder {
    text-align: center;
  }
  .placeholder-icon {
    font-size: 4rem;
    display: block;
    margin-bottom: 1rem;
  }
  .qr-placeholder p {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
  }

  .brutal-upload-area {
    border: 4px dashed #111;
    background: #fff;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    min-height: 300px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 1;
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
    font-size: 1.1rem;
    margin: 0 0 0.5rem 0;
  }
  .upload-placeholder small {
    font-weight: bold;
    color: #666;
  }

  .scan-img-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .scan-preview-img {
    max-width: 100%;
    max-height: 300px;
    object-fit: contain;
  }
  .scan-overlay-hint {
    position: absolute;
    bottom: 0;
    background: #111;
    color: #fff;
    padding: 0.5rem 1rem;
    font-weight: 800;
    font-size: 0.85rem;
  }

  .brutal-shadow {
    box-shadow: 8px 8px 0px #111;
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
    text-transform: uppercase;
  }
  .brutal-status.info {
    background: #fff;
  }
  .brutal-status.success {
    background: #00e572;
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
  [data-theme='dark'] .brutal-textarea,
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
  [data-theme='dark'] .channel-group {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .channel-group.group-pink {
    background: #2a1a20;
  }
  [data-theme='dark'] .preview-content {
    background: #222;
    background-image:
      linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px);
  }
  [data-theme='dark'] .mode-tabs {
    border-color: #eee;
    background: #333;
  }
  [data-theme='dark'] .mode-tab {
    border-right-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .mode-tab:hover {
    background: #444;
  }
  [data-theme='dark'] .mode-tab.active {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .ecl-btn {
    background: #333;
    border-color: #eee;
    color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .ecl-btn.active {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .qr-display {
    border-color: #eee;
    background: #fff;
  }
  [data-theme='dark'] .brutal-upload-area {
    background: #1a1a1a;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-upload-area:hover {
    background: #b28f00;
  }
  [data-theme='dark'] .brutal-shadow {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-status.success {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .action-btn {
    background: #00994c;
    color: #fff;
    border-color: #eee;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
  }
  [data-theme='dark'] .bg-pink {
    background: #993366;
  }
  [data-theme='dark'] .bg-green {
    background: #00994c;
  }
  [data-theme='dark'] .brutal-input.color-picker {
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .brutal-slider {
    background: #eee;
    border-color: #eee;
  }
  [data-theme='dark'] .scan-overlay-hint {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .brutal-btn.clear-btn {
    background: #cc0000;
  }
</style>
