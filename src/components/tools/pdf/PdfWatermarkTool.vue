<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">PDF<span>.水印工具()</span></h1>
        <button
          v-if="pdfFile"
          class="brutal-action-btn primary"
          :disabled="processing"
          @click="applyWatermark"
        >
          {{ processing ? 'APPLYING...' : 'COMMIT.添加水印' }}
        </button>
      </header>

      <div class="brutal-grid">
        <!-- Preview -->
        <div class="brutal-pane">
          <div class="pane-header bg-yellow"><span>PDF 预览</span></div>
          <div class="pane-body">
            <div
              v-if="!pdfFile"
              class="brutal-upload-area"
              @click="triggerUpload"
              @dragover.prevent
              @drop.prevent="handleFileDrop"
            >
              <div class="upload-text">
                <h3>[ 上传 PDF 文件 ]</h3>
                <p>添加文字或图片水印</p>
              </div>
              <input ref="fileInput" type="file" hidden accept=".pdf" @change="handleFileSelect" />
            </div>
            <div v-else>
              <div class="file-badge">
                <strong>{{ pdfFile.name }}</strong> <span>({{ pageCount }} 页)</span>
                <button
                  class="brutal-action-btn"
                  style="padding: 0.2rem 0.8rem; font-size: 0.85rem; margin-left: auto"
                  @click="triggerUpload"
                >
                  重新选择
                </button>
                <input
                  ref="fileInput"
                  type="file"
                  hidden
                  accept=".pdf"
                  @change="handleFileSelect"
                />
              </div>
              <div class="canvas-wrap">
                <canvas ref="previewCanvas"></canvas>
                <div class="page-nav">
                  <button :disabled="currentPage <= 1" @click="currentPage--">◀</button>
                  <span>{{ currentPage }} / {{ pageCount }}</span>
                  <button :disabled="currentPage >= pageCount" @click="currentPage++">▶</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Settings -->
        <div class="brutal-pane settings-pane">
          <div class="pane-header bg-black"><span class="text-white">水印设置</span></div>
          <div class="pane-body">
            <div class="tab-switch">
              <button
                class="brutal-action-btn"
                :class="{ primary: watermarkType === 'text' }"
                @click="watermarkType = 'text'"
              >
                文字水印
              </button>
              <button
                class="brutal-action-btn"
                :class="{ primary: watermarkType === 'image' }"
                @click="watermarkType = 'image'"
              >
                图片水印
              </button>
            </div>

            <div v-if="watermarkType === 'text'">
              <div class="form-item">
                <label>水印文字</label
                ><input
                  v-model="config.text"
                  class="brutal-input"
                  placeholder="请输入水印文字"
                  @input="renderPreview"
                />
              </div>
              <div class="form-item">
                <label>字体大小 ({{ config.fontSize }})</label
                ><input
                  v-model.number="config.fontSize"
                  type="range"
                  class="brutal-range"
                  min="10"
                  max="100"
                  @input="renderPreview"
                />
              </div>
              <div class="form-item">
                <label>文字颜色</label
                ><input
                  v-model="config.color"
                  type="color"
                  class="brutal-color"
                  @input="renderPreview"
                />
              </div>
            </div>
            <div v-else>
              <div class="form-item">
                <label>水印图片</label>
                <div class="logo-upload" @click="triggerLogoUpload">
                  <img v-if="config.logoUrl" :src="config.logoUrl" class="logo-preview" />
                  <span v-else>[ 选择图片 ]</span>
                  <input
                    ref="logoFileInput"
                    type="file"
                    hidden
                    accept="image/*"
                    @change="handleLogoSelect"
                  />
                </div>
              </div>
              <div class="form-item">
                <label>图片缩放 ({{ config.logoScale }}%)</label
                ><input
                  v-model.number="config.logoScale"
                  type="range"
                  class="brutal-range"
                  min="5"
                  max="100"
                  @input="renderPreview"
                />
              </div>
            </div>

            <div class="divider"></div>

            <div class="form-item">
              <label>水印模式</label>
              <div class="format-btns">
                <button
                  class="brutal-action-btn"
                  :class="{ primary: config.mode === 'single' }"
                  @click="
                    config.mode = 'single';
                    renderPreview();
                  "
                >
                  单位置
                </button>
                <button
                  class="brutal-action-btn"
                  :class="{ primary: config.mode === 'tile' }"
                  @click="
                    config.mode = 'tile';
                    renderPreview();
                  "
                >
                  平铺
                </button>
              </div>
            </div>

            <div v-if="config.mode === 'single'" class="form-item">
              <label>位置</label>
              <div class="position-grid">
                <div
                  v-for="p in positions"
                  :key="p"
                  class="pos-dot"
                  :class="{ active: config.position === p }"
                  @click="
                    config.position = p;
                    renderPreview();
                  "
                ></div>
              </div>
            </div>

            <div class="form-item">
              <label>透明度 ({{ config.opacity }})</label
              ><input
                v-model.number="config.opacity"
                type="range"
                class="brutal-range"
                min="0.1"
                max="1"
                step="0.1"
                @input="renderPreview"
              />
            </div>
            <div class="form-item">
              <label>旋转角度 ({{ config.rotate }}°)</label
              ><input
                v-model.number="config.rotate"
                type="range"
                class="brutal-range"
                min="-180"
                max="180"
                @input="renderPreview"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage, ElLoading } from 'element-plus';
  import pdfjsLib from '@/utils/pdf';
  import { PDFDocument } from 'pdf-lib';
  import { useFileHandler } from '@/composables';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };
  const previewCanvas = ref(null);
  const pdfFile = ref(null);
  const pdfDoc = ref(null);
  const pageCount = ref(0);
  const currentPage = ref(1);
  const processing = ref(false);
  const watermarkType = ref('text');

  const { fileInput, triggerFileInput, handleFileSelect, handleFileDrop } = useFileHandler({
    accept: '.pdf',
    readMode: 'none',
    onSuccess: r => loadPdf(r.file)
  });
  const {
    fileInput: logoFileInput,
    triggerFileInput: triggerLogoUpload,
    handleFileSelect: handleLogoSelect
  } = useFileHandler({
    accept: 'image/*',
    readMode: 'dataURL',
    onSuccess: r => {
      config.logoUrl = r.data;
      const img = new Image();
      img.onload = () => {
        config.logoImg = img;
        debouncedRender();
      };
      img.src = config.logoUrl;
    }
  });

  const positions = ['tl', 'tc', 'tr', 'ml', 'center', 'mr', 'bl', 'bc', 'br'];
  const config = reactive({
    text: 'LRM工具箱',
    fontSize: 40,
    color: '#808080',
    logoUrl: '',
    logoImg: null,
    logoScale: 30,
    mode: 'tile',
    position: 'center',
    opacity: 0.3,
    rotate: -30
  });
  const triggerUpload = () => triggerFileInput();
  const pdfBytes = ref(null);
  let isRendering = false;
  let currentRenderTask = null;
  let renderTimeout = null;
  let renderPreview;
  const debouncedRender = () => {
    if (renderTimeout) clearTimeout(renderTimeout);
    renderTimeout = setTimeout(() => renderPreview(), 100);
  };

  const loadPdf = async file => {
    pdfFile.value = file;
    pdfBytes.value = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: pdfBytes.value.slice(0) });
    pdfDoc.value = await loadingTask.promise;
    pageCount.value = pdfDoc.value.numPages;
    currentPage.value = 1;
    debouncedRender();
  };

  renderPreview = async () => {
    if (!pdfBytes.value || !previewCanvas.value) return;
    if (isRendering) return;
    isRendering = true;
    try {
      if (currentRenderTask) {
        currentRenderTask.cancel();
        currentRenderTask = null;
      }
      const loadingTask = pdfjsLib.getDocument({ data: pdfBytes.value.slice(0) });
      const doc = await loadingTask.promise;
      const page = await doc.getPage(currentPage.value);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = previewCanvas.value;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      currentRenderTask = page.render({ canvasContext: ctx, viewport });
      await currentRenderTask.promise;
      currentRenderTask = null;
      drawWatermarkPreview(ctx, canvas.width, canvas.height);
    } catch (e) {
      if (e.name !== 'RenderingCancelledException') console.error('Preview error:', e);
    } finally {
      isRendering = false;
    }
  };

  watch(currentPage, debouncedRender);
  watch(watermarkType, debouncedRender);

  const drawWatermarkPreview = (ctx, w, h) => {
    ctx.save();
    ctx.globalAlpha = config.opacity;
    if (watermarkType.value === 'text') {
      ctx.font = `${config.fontSize}px sans-serif`;
      ctx.fillStyle = config.color;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
    }
    if (config.mode === 'tile') {
      const ww =
        watermarkType.value === 'text'
          ? ctx.measureText(config.text).width
          : (config.logoImg?.width || 100) * (config.logoScale / 100);
      const wh =
        watermarkType.value === 'text'
          ? config.fontSize
          : (config.logoImg?.height || 100) * (config.logoScale / 100);
      const stepX = ww + 80,
        stepY = wh + 80;
      for (let y = -h; y < h * 2; y += stepY) {
        for (let x = -w; x < w * 2; x += stepX) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate((config.rotate * Math.PI) / 180);
          if (watermarkType.value === 'text') ctx.fillText(config.text, 0, 0);
          else if (config.logoImg) ctx.drawImage(config.logoImg, -ww / 2, -wh / 2, ww, wh);
          ctx.restore();
        }
      }
    } else {
      let x = w / 2,
        y = h / 2;
      const p = config.position;
      if (p.includes('l')) x = 50;
      if (p.includes('r')) x = w - 50;
      if (p.includes('t')) y = 50;
      if (p.includes('b')) y = h - 50;
      ctx.translate(x, y);
      ctx.rotate((config.rotate * Math.PI) / 180);
      if (watermarkType.value === 'text') ctx.fillText(config.text, 0, 0);
      else if (config.logoImg) {
        const ww = config.logoImg.width * (config.logoScale / 100);
        const wh = config.logoImg.height * (config.logoScale / 100);
        ctx.drawImage(config.logoImg, -ww / 2, -wh / 2, ww, wh);
      }
    }
    ctx.restore();
  };

  const createTextWatermarkImage = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = `${config.fontSize}px sans-serif`;
    const metrics = ctx.measureText(config.text);
    const tw = metrics.width,
      th = config.fontSize * 1.2;
    const rad = Math.abs((config.rotate * Math.PI) / 180);
    const rw = Math.ceil(tw * Math.cos(rad) + th * Math.sin(rad)) + 20;
    const rh = Math.ceil(tw * Math.sin(rad) + th * Math.cos(rad)) + 20;
    canvas.width = rw;
    canvas.height = rh;
    ctx.clearRect(0, 0, rw, rh);
    ctx.translate(rw / 2, rh / 2);
    ctx.rotate((config.rotate * Math.PI) / 180);
    ctx.font = `${config.fontSize}px sans-serif`;
    ctx.fillStyle = config.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.text, 0, 0);
    return canvas.toDataURL('image/png');
  };

  const applyWatermark = async () => {
    if (!pdfBytes.value) return;
    processing.value = true;
    const loading = ElLoading.service({ text: '正在添加水印...', background: 'rgba(0,0,0,0.7)' });
    try {
      const doc = await PDFDocument.load(pdfBytes.value.slice(0));
      const pages = doc.getPages();
      let watermarkImg, imgW, imgH;
      if (watermarkType.value === 'text') {
        const textImgDataUrl = createTextWatermarkImage();
        const textImgBytes = await fetch(textImgDataUrl).then(r => r.arrayBuffer());
        watermarkImg = await doc.embedPng(textImgBytes);
        imgW = watermarkImg.width;
        imgH = watermarkImg.height;
      } else if (config.logoImg && config.logoUrl) {
        const imgBytes = await fetch(config.logoUrl).then(res => res.arrayBuffer());
        try {
          watermarkImg = await doc.embedPng(imgBytes);
        } catch {
          watermarkImg = await doc.embedJpg(imgBytes);
        }
        imgW = watermarkImg.width * (config.logoScale / 100);
        imgH = watermarkImg.height * (config.logoScale / 100);
      }
      if (!watermarkImg) throw new Error('无法创建水印');
      for (const page of pages) {
        const { width, height } = page.getSize();
        if (config.mode === 'tile') {
          const stepX = imgW + 60,
            stepY = imgH + 60;
          for (let y = 0; y < height; y += stepY)
            for (let x = 0; x < width; x += stepX)
              page.drawImage(watermarkImg, {
                x,
                y,
                width: imgW,
                height: imgH,
                opacity: config.opacity
              });
        } else {
          let x = (width - imgW) / 2,
            y = (height - imgH) / 2;
          const p = config.position;
          if (p.includes('l')) x = 30;
          if (p.includes('r')) x = width - imgW - 30;
          if (p.includes('t')) y = height - imgH - 30;
          if (p.includes('b')) y = 30;
          page.drawImage(watermarkImg, {
            x,
            y,
            width: imgW,
            height: imgH,
            opacity: config.opacity
          });
        }
      }
      const savedBytes = await doc.save();
      const blob = new Blob([savedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `watermarked_${pdfFile.value?.name || 'document.pdf'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      ElMessage.success('水印添加成功');
    } catch (e) {
      console.error(e);
      ElMessage.error('添加水印失败: ' + e.message);
    } finally {
      processing.value = false;
      loading.close();
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
    flex-wrap: wrap;
    gap: 1rem;
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
    text-shadow: 4px 4px 0 #111;
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
    box-shadow: 6px 6px 0 #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }
  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0 #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0 0 0 #111;
  }
  .brutal-grid {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 2.5rem;
    margin-bottom: 2rem;
  }
  .brutal-pane {
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0 #111;
  }
  .pane-header {
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
  .bg-black {
    background: #111;
  }
  .text-white {
    color: #fff;
  }
  .pane-body {
    padding: 2rem;
    flex: 1;
  }
  .brutal-upload-area {
    min-height: 350px;
    border: 4px dashed #111;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    background: #fdfae5;
    cursor: pointer;
    transition: all 0.2s;
  }
  .brutal-upload-area:hover {
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
    font-size: 0.95rem;
    color: #555;
  }
  .file-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #fff;
    border: 3px solid #111;
    padding: 0.75rem 1rem;
    box-shadow: 4px 4px 0 #111;
    margin-bottom: 1.5rem;
    word-break: break-all;
    flex-wrap: wrap;
    font-family: 'IBM Plex Mono', monospace;
  }
  .file-badge strong {
    font-size: 1rem;
  }
  .file-badge span {
    color: #666;
  }
  .canvas-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #eee;
    border: 3px solid #111;
    padding: 1rem;
    overflow: hidden;
  }
  .canvas-wrap canvas {
    max-width: 100%;
    max-height: 500px;
    box-shadow: 4px 4px 0 #111;
    border: 2px solid #111;
  }
  .page-nav {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
  }
  .page-nav button {
    background: #fff;
    border: 3px solid #111;
    font-weight: 800;
    padding: 0.4rem 0.75rem;
    cursor: pointer;
    box-shadow: 3px 3px 0 #111;
    transition: all 0.1s;
    font-size: 1rem;
  }
  .page-nav button:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0 #111;
  }
  .page-nav button:disabled {
    background: #eee;
    color: #aaa;
    border-color: #aaa;
    box-shadow: 2px 2px 0 #aaa;
    cursor: not-allowed;
  }
  .tab-switch {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  .brutal-action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.6rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 4px 4px 0 #111;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
    text-transform: uppercase;
  }
  .brutal-action-btn.primary {
    background: #ffd900;
  }
  .brutal-action-btn:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #111;
  }
  .brutal-action-btn:active:not(:disabled) {
    transform: translate(4px, 4px);
    box-shadow: 0 0 0 #111;
  }
  .brutal-action-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
    box-shadow: 4px 4px 0 #666;
    border-color: #666;
  }
  .form-item {
    margin-bottom: 1.25rem;
  }
  .form-item label {
    display: block;
    font-weight: bold;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }
  .brutal-input {
    width: 100%;
    padding: 0.6rem;
    font-size: 0.95rem;
    border: 3px solid #111;
    background: #fff;
    font-weight: bold;
    box-sizing: border-box;
    font-family: 'IBM Plex Mono', monospace;
  }
  .brutal-input:focus {
    outline: none;
    box-shadow: 4px 4px 0 #4b7bff;
    border-color: #4b7bff;
  }
  .brutal-range {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 10px;
    background: #fff;
    border: 2px solid #111;
    outline: none;
  }
  .brutal-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: #ffd900;
    border: 3px solid #111;
    cursor: pointer;
  }
  .brutal-color {
    width: 48px;
    height: 36px;
    border: 3px solid #111;
    padding: 0;
    cursor: pointer;
    background: none;
  }
  .logo-upload {
    height: 80px;
    border: 3px dashed #111;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    overflow: hidden;
    background: #fafafa;
    font-weight: 800;
    font-family: 'Syne', sans-serif;
  }
  .logo-preview {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  .format-btns {
    display: flex;
    gap: 0.5rem;
  }
  .format-btns .brutal-action-btn {
    flex: 1;
    text-align: center;
    padding: 0.4rem;
  }
  .position-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    width: 100px;
    margin: 0 auto;
  }
  .pos-dot {
    aspect-ratio: 1;
    background: #e2e8f0;
    border: 2px solid #111;
    cursor: pointer;
    transition: all 0.2s;
  }
  .pos-dot:hover {
    background: #ffd900;
  }
  .pos-dot.active {
    background: #4b7bff;
    transform: scale(1.15);
  }
  .divider {
    border-top: 3px dashed #111;
    margin: 1.25rem 0;
  }
  @media (max-width: 992px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .brutal-title {
      font-size: 2.5rem;
    }
  }
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-upload-area,
  [data-theme='dark'] .file-badge,
  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .brutal-range,
  [data-theme='dark'] .logo-upload,
  [data-theme='dark'] .page-nav button {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn {
    box-shadow: 6px 6px 0 #eee;
  }
  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 9px 9px 0 #eee;
  }
  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0 #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0 #eee;
  }
  [data-theme='dark'] .brutal-action-btn {
    box-shadow: 4px 4px 0 #eee;
  }
  [data-theme='dark'] .brutal-action-btn:hover:not(:disabled) {
    box-shadow: 6px 6px 0 #eee;
  }
  [data-theme='dark'] .brutal-action-btn.primary {
    background: #b28f00;
    color: #fff;
    border-color: #eee;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .pane-body {
    background: #1a1a1a;
  }
  [data-theme='dark'] .file-badge {
    box-shadow: 4px 4px 0 #eee;
  }
  [data-theme='dark'] .canvas-wrap {
    background: #333;
    border-color: #eee;
  }
  [data-theme='dark'] .canvas-wrap canvas {
    box-shadow: 4px 4px 0 #eee;
    border-color: #eee;
  }
  [data-theme='dark'] .page-nav button {
    box-shadow: 3px 3px 0 #eee;
  }
  [data-theme='dark'] .pos-dot {
    background: #333;
    border-color: #eee;
  }
  [data-theme='dark'] .pos-dot:hover {
    background: #b28f00;
  }
  [data-theme='dark'] .pos-dot.active {
    background: #4b7bff;
  }
  [data-theme='dark'] .divider {
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-range::-webkit-slider-thumb {
    background: #b28f00;
    border-color: #eee;
  }
</style>
