<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">PDF<span>.尺寸变换()</span></h1>
      </header>
      <div class="brutal-pane">
        <div class="pane-header bg-yellow"><span>页面尺寸调整</span></div>
        <div class="pane-body">
          <div v-if="!pdfFile" class="brutal-upload-area" @click="triggerUpload">
            <div class="upload-text">
              <h3>[ 选择 PDF 文件 ]</h3>
              <p>调整页面尺寸（如 A4、A3、Letter）</p>
            </div>
          </div>
          <div v-else>
            <div class="file-badge">
              <strong>{{ pdfFile.name }}</strong> <span>({{ pageCount }} 页)</span>
              <button
                class="brutal-action-btn"
                style="padding: 0.2rem 0.8rem; font-size: 0.85rem; margin-left: auto"
                @click="clearFile"
              >
                移除
              </button>
            </div>
            <div class="param-box">
              <div class="form-item">
                <label>目标尺寸</label>
                <select v-model="targetSize" class="brutal-select">
                  <option value="A4">A4 (210×297mm)</option>
                  <option value="A3">A3 (297×420mm)</option>
                  <option value="A5">A5 (148×210mm)</option>
                  <option value="Letter">Letter (8.5×11in)</option>
                  <option value="Legal">Legal (8.5×14in)</option>
                </select>
              </div>
              <div class="form-item">
                <label>方向</label>
                <div class="radio-wrap">
                  <label><input v-model="orientation" type="radio" value="portrait" /> 纵向</label>
                  <label><input v-model="orientation" type="radio" value="landscape" /> 横向</label>
                </div>
              </div>
              <div class="form-item">
                <label>缩放模式</label>
                <div class="radio-wrap">
                  <label><input v-model="fitMode" type="radio" value="fit" /> 适应(保持比例)</label>
                  <label
                    ><input v-model="fitMode" type="radio" value="fill" /> 填充(可能变形)</label
                  >
                </div>
              </div>
            </div>
            <button
              class="brutal-action-btn primary large"
              :disabled="processing"
              @click="processPdf"
            >
              {{ processing ? 'SCALING...' : 'COMMIT.调整并下载' }}
            </button>
          </div>
        </div>
      </div>
      <input ref="fileInput" type="file" hidden accept=".pdf" @change="handleFileSelect" />
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { PDFDocument, PageSizes } from 'pdf-lib';
  import { useFileHandler } from '@/composables';
  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };
  const { fileInput, triggerFileInput, handleFileSelect } = useFileHandler({
    accept: '.pdf',
    readMode: 'none',
    onSuccess: r => loadPdf(r.file)
  });
  const pdfFile = ref(null),
    pdfBytes = ref(null),
    pageCount = ref(0),
    processing = ref(false);
  const targetSize = ref('A4'),
    orientation = ref('portrait'),
    fitMode = ref('fit');
  const sizes = {
    A4: PageSizes.A4,
    A3: PageSizes.A3,
    A5: [419.53, 595.28],
    Letter: PageSizes.Letter,
    Legal: [612.0, 1008.0]
  };
  const triggerUpload = () => triggerFileInput();
  const loadPdf = async file => {
    try {
      pdfFile.value = file;
      const buf = await file.arrayBuffer();
      pdfBytes.value = new Uint8Array(buf);
      const doc = await PDFDocument.load(pdfBytes.value);
      pageCount.value = doc.getPageCount();
    } catch (e) {
      ElMessage.error('无法读取 PDF');
      console.error(e);
    }
  };
  const clearFile = () => {
    pdfFile.value = null;
    pdfBytes.value = null;
    pageCount.value = 0;
  };
  const processPdf = async () => {
    if (!pdfBytes.value) return;
    processing.value = true;
    try {
      const srcDoc = await PDFDocument.load(pdfBytes.value);
      const newDoc = await PDFDocument.create();
      let [w, h] = sizes[targetSize.value];
      if (orientation.value === 'landscape') [w, h] = [h, w];
      const pages = srcDoc.getPages();
      const emb = await newDoc.embedPages(pages);
      for (let i = 0; i < pages.length; i++) {
        const ep = emb[i];
        const np = newDoc.addPage([w, h]);
        const { width: sw, height: sh } = ep;
        let dw = w,
          dh = h,
          x = 0,
          y = 0;
        if (fitMode.value === 'fit') {
          const s = Math.min(w / sw, h / sh);
          dw = sw * s;
          dh = sh * s;
          x = (w - dw) / 2;
          y = (h - dh) / 2;
        }
        np.drawPage(ep, { x, y, width: dw, height: dh });
      }
      const mb = await newDoc.save();
      const blob = new Blob([mb], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resized_${pdfFile.value.name}`;
      a.click();
      URL.revokeObjectURL(url);
      ElMessage.success('调整完成');
    } catch (e) {
      console.error(e);
      ElMessage.error('调整失败: ' + e.message);
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
    min-height: 100vh;
    padding: 2rem;
    box-sizing: border-box;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    color: #111;
  }
  .brutal-container {
    max-width: 900px;
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
  .brutal-pane {
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0 #111;
    transition: transform 0.2s;
    margin-bottom: 2rem;
  }
  .brutal-pane:hover {
    transform: translate(-4px, -4px);
    box-shadow: 16px 16px 0 #111;
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
  .pane-body {
    padding: 2rem;
  }
  .brutal-upload-area {
    min-height: 300px;
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
    margin-bottom: 2rem;
    word-break: break-all;
    flex-wrap: wrap;
  }
  .file-badge strong {
    font-size: 1.1rem;
  }
  .file-badge span {
    color: #666;
  }
  .param-box {
    border: 4px dashed #111;
    padding: 1.5rem;
    background: #fafafa;
    margin-bottom: 2rem;
  }
  .form-item {
    margin-bottom: 1.5rem;
  }
  .form-item:last-child {
    margin-bottom: 0;
  }
  .form-item label {
    display: block;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  .brutal-select {
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
    border: 3px solid #111;
    background: #fff;
    box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.1);
    font-weight: bold;
    box-sizing: border-box;
    cursor: pointer;
    font-family: 'IBM Plex Mono', monospace;
  }
  .brutal-select:focus {
    outline: none;
    box-shadow: 6px 6px 0 #4b7bff;
    border-color: #4b7bff;
  }
  .radio-wrap {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .radio-wrap label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-weight: bold;
    font-family: 'Noto Sans SC', sans-serif;
  }
  .brutal-action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.6rem 2rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
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
  .brutal-action-btn.large {
    padding: 1.25rem 3rem;
    font-size: 1.25rem;
    letter-spacing: 1px;
    width: 100%;
  }
  @media (max-width: 1024px) {
    .brutal-title {
      font-size: 2.5rem;
    }
    .brutal-header {
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
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
  [data-theme='dark'] .param-box,
  [data-theme='dark'] .brutal-select {
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
  [data-theme='dark'] .brutal-pane:hover {
    box-shadow: 16px 16px 0 #eee;
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
  [data-theme='dark'] .brutal-select:focus {
    box-shadow: 6px 6px 0 #4b7bff;
    border-color: #4b7bff;
  }
</style>
