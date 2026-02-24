<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">PDF<span>.垃圾数据清洗与降级()</span></h1>
        <button class="brutal-btn clear-btn" :disabled="!pdfFile" @click="clearFile">
          初始化环境
        </button>
      </header>

      <div class="brutal-grid">
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span class="text-black">基础输入源</span>
          </div>

          <div
            v-if="!pdfFile"
            class="brutal-upload-area"
            @click="triggerUpload"
            @dragover.prevent="dragOver"
            @dragleave.prevent="dragLeave"
            @drop.prevent="handleFileDrop"
          >
            <div class="upload-text">
              <h3>[ 连接 PDF 源数据 ]</h3>
              <p>支持去除内部冗余节点及深度光栅化降级</p>
            </div>
            <input ref="fileInput" type="file" hidden accept=".pdf" @change="handleFileSelect" />
          </div>

          <div v-else class="file-loaded-info">
            <h3 class="filename">{{ pdfFile.name }}</h3>
            <p class="filesize">原始分配位: {{ formatSize(pdfFile.size) }}</p>
            <div style="margin-top: 1.5rem">
              <button class="brutal-action-btn" @click="clearFile">断开源文件</button>
            </div>
          </div>
        </div>

        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">清洗 / 降级参数设定</span>
          </div>

          <div class="settings-section" :class="{ 'disabled-overlay': !pdfFile }">
            <div class="settings-group">
              <div class="mode-selection">
                <button
                  class="brutal-select-btn"
                  :class="{ active: mode === 'lossless' }"
                  @click="mode = 'lossless'"
                >
                  [A] 无损优化机制<br /><small>重建结构 / 移除元数据</small>
                </button>
                <button
                  class="brutal-select-btn"
                  :class="{ active: mode === 'lossy' }"
                  @click="mode = 'lossy'"
                >
                  [B] 破坏性光栅化<br /><small>转储图片 / 极小化</small>
                </button>
              </div>
            </div>

            <div v-if="mode === 'lossy'" class="lossy-settings param-box">
              <div class="setting-item">
                <label>抽样质量 ({{ quality }}%)</label>
                <input
                  v-model="quality"
                  type="range"
                  min="10"
                  max="90"
                  step="10"
                  class="brutal-range-slider"
                />
              </div>

              <div class="setting-item" style="margin-top: 1rem">
                <label>图像栅格化标尺</label>
                <select v-model="scale" class="brutal-select">
                  <option :value="1">标清解析度 (Scale=1.0)</option>
                  <option :value="2">高清解析度 (Scale=2.0)</option>
                </select>
              </div>

              <div class="mock-warning-box">
                // WARN:
                破坏性降级将执行底层页面截图，<strong>销毁所有可提取文本块特征</strong>。请谨慎执行覆盖写入。
              </div>
            </div>

            <div class="action-area">
              <div v-if="processing" class="progress-box">
                <p class="blink-text">>> 正在执行清洗管线... ({{ progress }}%)</p>
                <div class="brutal-progress-bar">
                  <div class="fill bg-yellow" :style="{ width: progress + '%' }"></div>
                </div>
              </div>
              <button
                v-else
                class="brutal-action-btn primary large compress-btn"
                :disabled="!pdfFile"
                @click="startCompression"
              >
                EXECUTE_WORKFLOW: 启动转化并输出
              </button>
            </div>

            <div v-if="resultSize && !processing" class="result-box">
              <div class="result-info bg-success">
                <p>
                  <strong>[ 转化成功 ] 输出量纲: {{ formatSize(resultSize) }}</strong>
                </p>
                <p>
                  相对输入缩减了:
                  <span class="bg-black text-white px-1">{{
                    compressionRatio > 0 ? compressionRatio + '%' : '未缩减'
                  }}</span>
                </p>
              </div>
              <button class="brutal-action-btn large" @click="downloadResult">
                保存输出件 [.PDF]
              </button>
            </div>
          </div>
          <canvas ref="canvasRef" style="display: none"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import pdfjsLib from '@/utils/pdf';
  import { PDFDocument } from 'pdf-lib';
  import { useFileHandler } from '@/composables';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const {
    fileInput,
    triggerFileInput,
    handleFileSelect,
    handleFileDrop,
    dragOver,
    dragLeave,
    formatSize
  } = useFileHandler({
    accept: '.pdf',
    readMode: 'none',
    onSuccess: result => {
      pdfFile.value = result.file;
      resultBlob.value = null;
      resultSize.value = 0;
    }
  });

  const pdfFile = ref(null);
  const mode = ref('lossless');
  const quality = ref(60);
  const scale = ref(2);
  const processing = ref(false);
  const progress = ref(0);
  const resultBlob = ref(null);
  const resultSize = ref(0);
  const canvasRef = ref(null);

  const triggerUpload = () => triggerFileInput();

  const clearFile = () => {
    pdfFile.value = null;
    resultBlob.value = null;
    resultSize.value = 0;
  };

  const compressionRatio = computed(() => {
    if (!pdfFile.value || !resultSize.value) return 0;
    const ratio = ((pdfFile.value.size - resultSize.value) / pdfFile.value.size) * 100;
    return ratio.toFixed(1);
  });

  const startCompression = async () => {
    if (!pdfFile.value) return;
    processing.value = true;
    progress.value = 0;
    resultBlob.value = null;
    resultSize.value = 0;

    try {
      const buffer = await pdfFile.value.arrayBuffer();

      if (mode.value === 'lossless') {
        await compressLossless(buffer);
      } else {
        await compressLossy(buffer);
      }
    } catch (e) {
      console.error(e);
      ElMessage.error('压缩失败: ' + e.message);
      processing.value = false;
    }
  };

  const compressLossless = async buffer => {
    const pdfDoc = await PDFDocument.load(buffer);
    const compressedBytes = await pdfDoc.save();

    resultBlob.value = new Blob([compressedBytes], { type: 'application/pdf' });
    resultSize.value = resultBlob.value.size;
    progress.value = 100;
    processing.value = false;
    ElMessage.success('优化完成');
  };

  const compressLossy = async buffer => {
    const loadingTask = pdfjsLib.getDocument(new Uint8Array(buffer));
    const pdfDocProxy = await loadingTask.promise;
    const numPages = pdfDocProxy.numPages;

    const newPdfDoc = await PDFDocument.create();

    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDocProxy.getPage(i);
      const viewport = page.getViewport({ scale: scale.value });

      const canvas = canvasRef.value;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');

      await page.render({ canvasContext: ctx, viewport }).promise;

      const imgDataUrl = canvas.toDataURL('image/jpeg', quality.value / 100);
      const imgBytes = await fetch(imgDataUrl).then(res => res.arrayBuffer());

      const jpgImage = await newPdfDoc.embedJpg(imgBytes);

      const pageDims = page.getViewport({ scale: 1 });

      const newPage = newPdfDoc.addPage([pageDims.width, pageDims.height]);
      newPage.drawImage(jpgImage, {
        x: 0,
        y: 0,
        width: pageDims.width,
        height: pageDims.height
      });

      progress.value = Math.round((i / numPages) * 100);
    }

    const pdfBytes = await newPdfDoc.save();
    resultBlob.value = new Blob([pdfBytes], { type: 'application/pdf' });
    resultSize.value = resultBlob.value.size;
    processing.value = false;
    ElMessage.success('压缩完成');
  };

  const downloadResult = () => {
    if (!resultBlob.value) return;
    const url = URL.createObjectURL(resultBlob.value);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed_${pdfFile.value.name}`;
    a.click();
    URL.revokeObjectURL(url);
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
    max-width: 1400px;
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

    flex: 1;
    text-align: center;
  }

  .brutal-title span {
    color: #4b7bff;
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
  .brutal-btn:hover:not(:disabled) {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }
  .brutal-btn:active:not(:disabled) {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }
  .brutal-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
    opacity: 0.7;
  }
  .brutal-btn.clear-btn {
    background: #ff4b4b;
    color: #fff;
  }

  .brutal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2.5rem;
    margin-bottom: 2rem;
  }

  .brutal-pane {
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
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
  .bg-black {
    background: #111;
  }
  .bg-success {
    background: #00e572;
  }
  .text-white {
    color: #fff;
  }
  .text-black {
    color: #111;
  }
  .px-1 {
    padding: 0 0.25rem;
  }

  .brutal-upload-area {
    min-height: 250px;
    margin: 2rem;
    border: 4px dashed #111;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    background: #fdfae5;
    cursor: pointer;
    transition: all 0.2s;
  }
  .brutal-upload-area:hover,
  .brutal-upload-area.is-dragover {
    background: #ffeba0;
    transform: scale(1.02);
  }

  .upload-text h3 {
    font-family: 'Syne', sans-serif;
    font-size: 1.3rem;
    font-weight: 800;
    margin-bottom: 1rem;
  }
  .upload-text p {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.95rem;
    color: #555;
  }

  .file-loaded-info {
    min-height: 250px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem;
    background: #fdfae5;
  }
  .file-loaded-info .filename {
    font-weight: bold;
    font-size: 1.2rem;
    background: #fff;
    border: 3px solid #111;
    padding: 0.5rem 1rem;
    box-shadow: 4px 4px 0px #111;
    margin-bottom: 0.5rem;
    word-break: break-all;
  }
  .file-loaded-info .file-size {
    font-family: 'IBM Plex Mono', monospace;
    color: #444;
    font-weight: bold;
  }

  /* 设置区块 */
  .settings-section {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    flex: 1;
    transition: opacity 0.3s;
  }
  .disabled-overlay {
    opacity: 0.5;
    pointer-events: none;
    filter: grayscale(100%);
  }

  .mode-selection {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 2rem;
  }
  .brutal-select-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 1rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    transition: transform 0.1s;
  }
  .brutal-select-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }
  .brutal-select-btn small {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: normal;
    font-size: 0.8rem;
  }
  .brutal-select-btn.active {
    background: #111;
    color: #fff;
  }

  .param-box {
    border: 3px solid #111;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .setting-item label {
    display: block;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  .brutal-range-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 12px;
    background: #fff;
    border: 2px solid #111;
    outline: none;
  }
  .brutal-range-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    background: #ff4b4b;
    border: 3px solid #111;
    cursor: pointer;
  }

  .brutal-select {
    width: 100%;
    font-family: 'IBM Plex Mono', monospace;
    padding: 0.5rem;
    border: 3px solid #111;
    font-weight: bold;
    background: #fff;
  }

  .mock-warning-box {
    margin-top: 1.5rem;
    border: 3px dashed #111;
    padding: 1rem;
    color: #666;
    font-size: 0.9rem;
    background: #fafafa;
  }

  .action-area {
    text-align: center;
    margin-top: auto;
  }

  .brutal-action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.6rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
    text-transform: uppercase;
    margin: 0;
    width: 100%;
  }
  .brutal-action-btn:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }
  .brutal-action-btn:active:not(:disabled) {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px #111;
  }
  .brutal-action-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
    box-shadow: 4px 4px 0px #666;
    border-color: #666;
  }
  .brutal-action-btn.primary {
    background: #ffd900;
  }
  .brutal-action-btn.large {
    padding: 1.25rem 3rem;
    font-size: 1.25rem;
    letter-spacing: 1px;
  }

  .progress-box {
    border: 3px solid #111;
    padding: 1rem;
    background: #fafafa;
  }
  .progress-box p {
    margin: 0 0 0.5rem 0;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: bold;
  }
  .brutal-progress-bar {
    width: 100%;
    height: 20px;
    border: 3px solid #111;
    background: #fff;
  }
  .brutal-progress-bar .fill {
    height: 100%;
    transition: width 0.3s;
  }

  .result-box {
    margin-top: 2rem;
  }
  .result-info {
    border: 3px solid #111;
    padding: 1rem;
    margin-bottom: 1rem;
    font-family: 'IBM Plex Mono', monospace;
  }
  .result-info p {
    margin: 0.25rem 0;
  }

  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }
  .blink-text {
    animation: blink 1.5s infinite;
  }

  @media (max-width: 1024px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .brutal-title {
      font-size: 2.5rem;
    }
    .mode-selection {
      grid-template-columns: 1fr;
    }
  }

  /* --- Dark Mode Overrides --- */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .brutal-select-btn,
  [data-theme='dark'] .param-box,
  [data-theme='dark'] .progress-box,
  [data-theme='dark'] .result-info {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }

  [data-theme='dark'] .pane-header {
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .brutal-select-btn {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:hover:not(:disabled),
  [data-theme='dark'] .brutal-action-btn:hover:not(:disabled),
  [data-theme='dark'] .brutal-select-btn:hover {
    box-shadow: 9px 9px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:active:not(:disabled),
  [data-theme='dark'] .brutal-action-btn:active:not(:disabled) {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0px #eee;
  }

  [data-theme='dark'] .brutal-upload-area {
    background: #222;
    border-color: #eee;
  }
  [data-theme='dark'] .file-loaded-info {
    background: #222;
  }
  [data-theme='dark'] .file-loaded-info .filename {
    background: #1a1a1a;
    color: #eee;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .bg-yellow,
  [data-theme='dark'] .brutal-select-btn.active {
    background: #b28f00;
    color: #fff;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-action-btn.primary {
    background: #b28f00;
    color: #fff;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-btn.clear-btn,
  [data-theme='dark'] .bg-danger {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .bg-success,
  [data-theme='dark'] .result-info.bg-success {
    background: #00994c;
    color: #fff;
  }

  [data-theme='dark'] .brutal-range-slider {
    background: #333;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-range-slider::-webkit-slider-thumb {
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-select {
    background: #333;
    color: #eee;
    border-color: #eee;
  }
  [data-theme='dark'] .mock-warning-box {
    background: #1a1a1a;
    border-color: #eee;
    color: #bbb;
  }
  [data-theme='dark'] .brutal-progress-bar {
    background: #333;
    border-color: #eee;
  }
</style>
