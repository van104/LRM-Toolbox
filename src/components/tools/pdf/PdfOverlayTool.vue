<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">PDF<span>.水印叠加()</span></h1>
      </header>

      <div class="brutal-grid" style="grid-template-columns: 1fr">
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span class="text-black">1. 载入材料</span>
          </div>

          <div
            class="materials-area"
            style="
              padding: 2rem;
              display: flex;
              gap: 2rem;
              justify-content: center;
              flex-wrap: wrap;
            "
          >
            <div
              class="brutal-upload-box"
              :class="{ 'is-active': basePdf }"
              @click="triggerBaseUpload"
            >
              <h5>[ 原对象 :: 底层 ]</h5>
              <div v-if="!basePdf"><p>选择基础 PDF 作为承载体</p></div>
              <div v-else>
                <strong>{{ basePdf.name }}</strong>
                <div style="margin-top: 1rem">
                  <button
                    class="brutal-action-btn"
                    style="padding: 0.2rem 1rem"
                    @click.stop="clearBase"
                  >
                    移除
                  </button>
                </div>
              </div>
            </div>

            <div
              class="plus-sign"
              style="font-size: 3rem; font-family: monospace; font-weight: 800; align-self: center"
            >
              +
            </div>

            <div
              class="brutal-upload-box"
              :class="{ 'is-active': overlayPdf }"
              @click="triggerOverlayUpload"
            >
              <h5>[ 图层素材 :: 水印/印章 ]</h5>
              <div v-if="!overlayPdf"><p>选择水印/印章单页 PDF</p></div>
              <div v-else>
                <strong>{{ overlayPdf.name }}</strong>
                <div style="margin-top: 1rem">
                  <button
                    class="brutal-action-btn"
                    style="padding: 0.2rem 1rem"
                    @click.stop="clearOverlay"
                  >
                    移除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="basePdf && overlayPdf" class="brutal-pane">
          <div class="pane-header bg-black">
            <span class="text-white">2. 叠加参数配置</span>
          </div>

          <div class="settings-area" style="padding: 2rem">
            <div class="settings-grid">
              <div class="param-box">
                <div class="setting-item">
                  <label>合成模式</label>
                  <div class="radio-wrap">
                    <label
                      ><input v-model="overlayMode" type="radio" value="foreground" /> [前景模式]
                      在基础页面的上方</label
                    >
                    <label
                      ><input v-model="overlayMode" type="radio" value="background" /> [背景模式]
                      在基础页面的下方模拟</label
                    >
                  </div>
                </div>
              </div>

              <div class="param-box">
                <div class="setting-item">
                  <label>作用域分析</label>
                  <div class="radio-wrap">
                    <label><input v-model="applyScope" type="radio" value="all" /> 全页注入</label>
                    <label
                      ><input v-model="applyScope" type="radio" value="first" /> 限制首屏</label
                    >
                    <label
                      ><input v-model="applyScope" type="radio" value="custom" /> 精确命中</label
                    >
                  </div>
                  <input
                    v-if="applyScope === 'custom'"
                    v-model="customPages"
                    type="text"
                    class="brutal-input"
                    style="margin-top: 1rem"
                    placeholder="输入页码规范 (例如: 1,3,5-10)"
                  />
                </div>
              </div>

              <div class="param-box">
                <div class="setting-item">
                  <label>不透明度混淆 :: {{ opacity }}%</label>
                  <input
                    v-model.number="opacity"
                    type="range"
                    class="brutal-slider"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>

            <button
              class="brutal-action-btn action-btn primary large"
              style="margin-top: 2rem"
              :disabled="processing"
              @click="mergeOverlay"
            >
              {{ processing ? 'COMPUTING FRAME...' : 'COMMIT.合成并输出' }}
            </button>
          </div>
        </div>
      </div>

      <input ref="baseFileInput" type="file" hidden accept=".pdf" @change="handleBaseSelect" />
      <input
        ref="overlayFileInput"
        type="file"
        hidden
        accept=".pdf"
        @change="handleOverlaySelect"
      />
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { PDFDocument } from 'pdf-lib';
  import { useFileHandler } from '@/composables';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const {
    fileInput: baseFileInput,
    triggerFileInput: triggerBaseUploadRaw,
    handleFileSelect: handleBaseSelect
  } = useFileHandler({
    accept: '.pdf',
    readMode: 'none',
    onSuccess: result => {
      basePdf.value = result.file;
      loadBasePdf(result.file);
    }
  });

  const {
    fileInput: overlayFileInput,
    triggerFileInput: triggerOverlayUploadRaw,
    handleFileSelect: handleOverlaySelect
  } = useFileHandler({
    accept: '.pdf',
    readMode: 'none',
    onSuccess: result => {
      overlayPdf.value = result.file;
      loadOverlayPdf(result.file);
    }
  });
  const basePdf = ref(null);
  const overlayPdf = ref(null);
  const basePdfBytes = ref(null);
  const overlayPdfBytes = ref(null);
  const processing = ref(false);

  const overlayMode = ref('foreground');
  const applyScope = ref('all');
  const customPages = ref('');
  const opacity = ref(100);

  const triggerBaseUpload = () => {
    if (!basePdf.value) triggerBaseUploadRaw();
  };

  const triggerOverlayUpload = () => {
    if (!overlayPdf.value) triggerOverlayUploadRaw();
  };

  const loadBasePdf = async file => {
    basePdfBytes.value = new Uint8Array(await file.arrayBuffer());
  };

  const loadOverlayPdf = async file => {
    overlayPdfBytes.value = new Uint8Array(await file.arrayBuffer());
  };

  const clearBase = () => {
    basePdf.value = null;
    basePdfBytes.value = null;
  };

  const clearOverlay = () => {
    overlayPdf.value = null;
    overlayPdfBytes.value = null;
  };

  const parsePageRange = (rangeStr, totalPages) => {
    const pages = new Set();
    const parts = rangeStr.split(',').map(p => p.trim());

    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim()));
        for (let i = start; i <= end && i <= totalPages; i++) {
          if (i >= 1) pages.add(i);
        }
      } else {
        const num = parseInt(part);
        if (num >= 1 && num <= totalPages) pages.add(num);
      }
    }

    return Array.from(pages).sort((a, b) => a - b);
  };

  const mergeOverlay = async () => {
    if (!basePdfBytes.value || !overlayPdfBytes.value) return;

    processing.value = true;
    try {
      const basePdfDoc = await PDFDocument.load(basePdfBytes.value);
      const overlayPdfDoc = await PDFDocument.load(overlayPdfBytes.value);

      const basePages = basePdfDoc.getPages();
      const overlayPages = overlayPdfDoc.getPages();

      if (overlayPages.length === 0) {
        throw new Error('叠加 PDF 没有页面');
      }

      let targetPages;
      if (applyScope.value === 'all') {
        targetPages = basePages.map((_, i) => i + 1);
      } else if (applyScope.value === 'first') {
        targetPages = [1];
      } else {
        targetPages = parsePageRange(customPages.value, basePages.length);
      }

      const [embeddedOverlay] = await basePdfDoc.embedPdf(overlayPdfDoc, [0]);

      for (const pageNum of targetPages) {
        const page = basePages[pageNum - 1];
        if (!page) continue;

        const { width, height } = page.getSize();
        // const overlayDims = embeddedOverlay.scale(1); // Unused

        // Calculate center position (unused but kept for reference)
        // const x = (width - overlayDims.width) / 2;
        // const y = (height - overlayDims.height) / 2;

        if (overlayMode.value === 'background') {
          page.drawPage(embeddedOverlay, {
            x: 0,
            y: 0,
            width: width,
            height: height,
            opacity: opacity.value / 100
          });
        } else {
          page.drawPage(embeddedOverlay, {
            x: 0,
            y: 0,
            width: width,
            height: height,
            opacity: opacity.value / 100
          });
        }
      }

      const modifiedBytes = await basePdfDoc.save();
      const blob = new Blob([modifiedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `overlay_${basePdf.value.name}`;
      a.click();
      URL.revokeObjectURL(url);

      ElMessage.success('叠加完成');
    } catch (e) {
      console.error(e);
      ElMessage.error('叠加失败: ' + e.message);
    } finally {
      processing.value = false;
    }
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
  .text-white {
    color: #fff;
  }
  .text-black {
    color: #111;
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

  /* Upload */
  .brutal-upload-box {
    flex: 1;
    min-width: 280px;
    max-width: 400px;
    min-height: 200px;
    border: 4px dashed #111;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    background: #fdfae5;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .brutal-upload-box:hover {
    background: #ffeba0;
    transform: scale(1.02);
  }
  .brutal-upload-box.is-active {
    background: #fff;
    border: 4px solid #111;
    cursor: default;
    box-shadow: 8px 8px 0px #111;
    transform: scale(1);
  }
  .brutal-upload-box h5 {
    font-family: 'Syne', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
    margin-bottom: 1rem;
  }
  .brutal-upload-box strong {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1.2rem;
    background: #fff;
    border: 2px solid #111;
    padding: 0.2rem 0.5rem;
    word-break: break-all;
  }

  /* 控制栏 */
  .settings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }
  .param-box {
    border: 4px solid #111;
    padding: 1.5rem;
    background: #fafafa;
  }

  .radio-wrap {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    font-family: 'IBM Plex Mono', monospace;
  }
  .radio-wrap label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-weight: bold;
    margin-bottom: 0;
    font-family: 'Noto Sans SC', sans-serif;
  }

  .setting-item label {
    display: block;
    font-weight: bold;
    margin-bottom: 0.5rem;
    font-family: 'IBM Plex Mono', monospace;
  }
  .brutal-input {
    width: 100%;
    font-family: 'IBM Plex Mono', monospace;
    padding: 0.75rem;
    font-size: 1rem;
    border: 3px solid #111;
    background: #fff;
    box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.1);
    font-weight: bold;
    box-sizing: border-box;
    transition: all 0.2s;
  }
  .brutal-input:focus {
    outline: none;
    box-shadow: 6px 6px 0px #4b7bff;
    border-color: #4b7bff;
  }

  .brutal-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 12px;
    background: #fff;
    border: 2px solid #111;
    outline: none;
  }
  .brutal-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    background: #ff4b4b;
    border: 3px solid #111;
    cursor: pointer;
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
  [data-theme='dark'] .param-box,
  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .brutal-upload-box {
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
  [data-theme='dark'] .brutal-input {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:hover:not(:disabled),
  [data-theme='dark'] .brutal-action-btn:hover:not(:disabled) {
    box-shadow: 9px 9px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:active:not(:disabled),
  [data-theme='dark'] .brutal-action-btn:active:not(:disabled) {
    box-shadow: 0px 0px 0px #eee;
  }
  [data-theme='dark'] .brutal-input:focus {
    box-shadow: 6px 6px 0px #4b7bff;
    border-color: #4b7bff;
  }

  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .brutal-upload-box.is-active {
    box-shadow: 8px 8px 0px #eee;
    background: #222;
  }
  [data-theme='dark'] .brutal-upload-box.is-active strong {
    background: #1a1a1a;
    border-color: #eee;
  }

  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .bg-yellow {
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

  [data-theme='dark'] .brutal-slider {
    background: #333;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-slider::-webkit-slider-thumb {
    border-color: #eee;
  }
</style>
