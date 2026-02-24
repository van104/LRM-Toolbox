<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">WEB<span>.转PDF()</span></h1>
      </header>

      <div class="brutal-pane">
        <div class="pane-header bg-yellow"><span>网页转 PDF 转换器</span></div>
        <div class="pane-body">
          <div class="tab-switch">
            <button
              class="brutal-action-btn"
              :class="{ primary: activeTab === 'url' }"
              @click="activeTab = 'url'"
            >
              🔗 网页链接 (演示)
            </button>
            <button
              class="brutal-action-btn"
              :class="{ primary: activeTab === 'html' }"
              @click="activeTab = 'html'"
            >
              📝 HTML 代码 (真实)
            </button>
          </div>

          <div v-if="activeTab === 'url'">
            <div class="info-box warn">
              <strong>⚠️ 纯前端限制</strong>
              <p>
                由于浏览器同源策略 (CORS)
                限制，纯前端无法直接抓取任意外部网页。此功能仅为演示，建议使用 HTML 代码转换。
              </p>
            </div>
            <div class="form-item">
              <label>网页地址</label>
              <input
                v-model="url"
                class="brutal-input"
                placeholder="https://example.com"
                @keyup.enter="startConversion"
              />
            </div>
          </div>

          <div v-else>
            <div class="form-item">
              <label>HTML 代码</label>
              <textarea
                v-model="htmlContent"
                class="brutal-textarea"
                rows="8"
                placeholder="输入或粘贴 HTML 代码..."
              ></textarea>
            </div>
          </div>

          <div class="param-box">
            <div class="params-row">
              <div class="form-item">
                <label>纸张</label>
                <select v-model="paperSize" class="brutal-select">
                  <option value="a4">A4</option>
                  <option value="letter">Letter</option>
                  <option value="legal">Legal</option>
                </select>
              </div>
              <div class="form-item">
                <label>方向</label>
                <select v-model="orientation" class="brutal-select">
                  <option value="portrait">纵向</option>
                  <option value="landscape">横向</option>
                </select>
              </div>
              <div class="form-item">
                <label>选项</label>
                <div class="radio-wrap">
                  <label><input v-model="background" type="checkbox" /> 包含背景</label>
                </div>
              </div>
            </div>
          </div>

          <button
            class="brutal-action-btn primary large"
            :disabled="isConverting || (activeTab === 'url' ? !isValidUrl : !htmlContent)"
            @click="startConversion"
          >
            {{ isConverting ? 'CONVERTING...' : 'COMMIT.开始转换' }}
          </button>

          <!-- Status -->
          <div v-if="conversionStatus === 'converting'" class="status-box">
            <p>⏳ {{ statusText }}</p>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progress + '%' }"></div>
            </div>
          </div>

          <div v-else-if="conversionStatus === 'completed'" class="success-box">
            <h3>✅ 转换成功</h3>
            <p>您的网页已成功转换为 PDF</p>
            <div class="result-badge">
              <strong>{{ fileName }}</strong>
              <span>{{ paperSize }} · {{ orientation === 'portrait' ? '纵向' : '横向' }}</span>
            </div>
            <div class="success-actions">
              <button class="brutal-action-btn primary" @click="downloadFile">⬇ 下载文件</button>
              <button class="brutal-action-btn" @click="reset">转换其他</button>
            </div>
          </div>
        </div>
      </div>

      <div class="features-row">
        <div class="feature-card">
          <h4>🖥️ 原样保留</h4>
          <p>精确保留网页排版、字体和图片</p>
        </div>
        <div class="feature-card">
          <h4>⚙️ 自定义设置</h4>
          <p>支持调整纸张大小和方向</p>
        </div>
        <div class="feature-card">
          <h4>🔒 安全隐私</h4>
          <p>所有转换在本地完成</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { ElMessage } from 'element-plus';
  import html2canvas from 'html2canvas';
  import jsPDF from 'jspdf';

  const activeTab = ref('url');
  const url = ref('');
  const htmlContent = ref(
    '<h1 style="text-align:center;color:#333">我的 PDF 文档</h1><p>这是一段示例文本。</p><hr/><p>支持 HTML 标签和内联样式。</p>'
  );
  const paperSize = ref('a4');
  const orientation = ref('portrait');
  const background = ref(true);
  const isConverting = ref(false);
  const conversionStatus = ref<'idle' | 'converting' | 'completed'>('idle');
  const progress = ref(0);
  const statusText = ref('正在分析...');
  const fileName = ref('');
  const pdfBlob = ref<Blob | null>(null);
  const isValidUrl = computed(() => {
    if (!url.value) return false;
    try {
      new URL(url.value);
      return true;
    } catch {
      return false;
    }
  });

  const startConversion = async () => {
    if (activeTab.value === 'url') {
      if (!isValidUrl.value) return;
      isConverting.value = true;
      conversionStatus.value = 'converting';
      progress.value = 0;
      try {
        const urlObj = new URL(url.value);
        const domain = urlObj.hostname.replace('www.', '');
        const path = urlObj.pathname === '/' ? 'home' : urlObj.pathname.replace(/\//g, '-');
        fileName.value = `${domain}${path}-${new Date().toISOString().slice(0, 10)}.pdf`;
      } catch {
        fileName.value = 'web-convert.pdf';
      }
      const steps = [
        { pct: 20, text: '正在加载资源...' },
        { pct: 45, text: '渲染页面布局...' },
        { pct: 70, text: '生成 PDF 文档...' },
        { pct: 90, text: '正在优化...' },
        { pct: 100, text: '完成!' }
      ];
      let cs = 0;
      const timer = setInterval(() => {
        if (cs >= steps.length) {
          clearInterval(timer);
          isConverting.value = false;
          conversionStatus.value = 'completed';
          pdfBlob.value = new Blob([`Mock PDF for ${url.value}`], { type: 'application/pdf' });
          ElMessage.success('转换成功');
          return;
        }
        progress.value = steps[cs].pct;
        statusText.value = steps[cs].text;
        cs++;
      }, 800);
    } else {
      if (!htmlContent.value) {
        ElMessage.warning('请输入 HTML 内容');
        return;
      }
      isConverting.value = true;
      conversionStatus.value = 'converting';
      progress.value = 10;
      statusText.value = '正在渲染 HTML...';
      fileName.value = `html-export-${new Date().toISOString().slice(0, 10)}.pdf`;
      try {
        const container = document.createElement('div');
        container.innerHTML = htmlContent.value;
        container.style.width = '794px';
        container.style.padding = '40px';
        container.style.background = 'white';
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '0';
        document.body.appendChild(container);
        progress.value = 30;
        const canvas = await html2canvas(container, { scale: 2, useCORS: true, logging: false });
        progress.value = 60;
        statusText.value = '生成 PDF...';
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: orientation.value as 'p' | 'portrait' | 'l' | 'landscape',
          unit: 'mm',
          format: paperSize.value
        });
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, (imgProps.height * pdfWidth) / imgProps.width);
        progress.value = 90;
        pdfBlob.value = pdf.output('blob');
        document.body.removeChild(container);
        progress.value = 100;
        isConverting.value = false;
        conversionStatus.value = 'completed';
        ElMessage.success('转换成功');
      } catch (error) {
        console.error(error);
        isConverting.value = false;
        conversionStatus.value = 'idle';
        ElMessage.error('转换失败');
      }
    }
  };
  const downloadFile = () => {
    if (!pdfBlob.value) return;
    const downloadUrl = URL.createObjectURL(pdfBlob.value);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName.value;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  };
  const reset = () => {
    url.value = '';
    conversionStatus.value = 'idle';
    progress.value = 0;
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
    color: #ff4b4b;
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
    margin-bottom: 2.5rem;
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
  .brutal-action-btn.large {
    padding: 1.25rem 3rem;
    font-size: 1.25rem;
    letter-spacing: 1px;
    width: 100%;
  }
  .info-box {
    border: 4px solid #111;
    padding: 1rem 1.5rem;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
  }
  .info-box.warn {
    background: #fff8e0;
  }
  .info-box strong {
    display: block;
    margin-bottom: 0.5rem;
    font-family: 'Syne', sans-serif;
    font-size: 1.05rem;
  }
  .info-box p {
    margin: 0;
  }
  .form-item {
    margin-bottom: 1.5rem;
  }
  .form-item label {
    display: block;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  .brutal-input {
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
    border: 3px solid #111;
    background: #fff;
    font-weight: bold;
    box-sizing: border-box;
    font-family: 'IBM Plex Mono', monospace;
  }
  .brutal-input:focus {
    outline: none;
    box-shadow: 6px 6px 0 #4b7bff;
    border-color: #4b7bff;
  }
  .brutal-textarea {
    width: 100%;
    border: 3px solid #111;
    padding: 1rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.9rem;
    line-height: 1.6;
    resize: none;
    background: #fff;
    box-sizing: border-box;
  }
  .brutal-textarea:focus {
    outline: none;
    box-shadow: 4px 4px 0 #4b7bff;
    border-color: #4b7bff;
  }
  .param-box {
    border: 4px dashed #111;
    padding: 1.5rem;
    background: #fafafa;
    margin-bottom: 2rem;
  }
  .params-row {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
    align-items: flex-end;
  }
  .params-row .form-item {
    margin-bottom: 0;
    flex: 1;
    min-width: 120px;
  }
  .brutal-select {
    width: 100%;
    padding: 0.6rem;
    font-size: 0.95rem;
    border: 3px solid #111;
    background: #fff;
    font-weight: bold;
    box-sizing: border-box;
    cursor: pointer;
    font-family: 'IBM Plex Mono', monospace;
  }
  .radio-wrap {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .radio-wrap label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-weight: bold;
    font-family: 'Noto Sans SC', sans-serif;
  }
  .status-box {
    text-align: center;
    padding: 2rem;
    border: 4px solid #111;
    margin-top: 2rem;
    background: #fafafa;
  }
  .status-box p {
    font-weight: 800;
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }
  .progress-bar {
    height: 16px;
    border: 3px solid #111;
    background: #fff;
  }
  .progress-fill {
    height: 100%;
    background: #ffd900;
    transition: width 0.3s;
  }
  .success-box {
    text-align: center;
    padding: 2rem;
    border: 4px solid #111;
    margin-top: 2rem;
    background: #e8ffe8;
  }
  .success-box h3 {
    font-family: 'Syne', sans-serif;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
  .success-box p {
    color: #555;
    margin-bottom: 1.5rem;
  }
  .result-badge {
    border: 3px solid #111;
    padding: 0.75rem 1rem;
    display: inline-block;
    margin-bottom: 1.5rem;
    background: #fff;
    box-shadow: 4px 4px 0 #111;
    font-family: 'IBM Plex Mono', monospace;
    word-break: break-all;
  }
  .result-badge strong {
    display: block;
    font-size: 1rem;
  }
  .result-badge span {
    font-size: 0.85rem;
    color: #666;
  }
  .success-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }
  .features-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
  .feature-card {
    border: 4px solid #111;
    padding: 1.5rem;
    background: #fff;
    text-align: center;
    box-shadow: 6px 6px 0 #111;
    transition: all 0.1s;
  }
  .feature-card:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0 #111;
  }
  .feature-card h4 {
    font-family: 'Syne', sans-serif;
    font-size: 1.1rem;
    margin: 0 0 0.5rem;
  }
  .feature-card p {
    font-size: 0.85rem;
    color: #555;
    margin: 0;
    line-height: 1.6;
  }
  @media (max-width: 768px) {
    .features-row {
      grid-template-columns: 1fr;
    }
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
  [data-theme='dark'] .feature-card,
  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .brutal-textarea,
  [data-theme='dark'] .brutal-select,
  [data-theme='dark'] .param-box,
  [data-theme='dark'] .result-badge {
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
  [data-theme='dark'] .info-box.warn {
    background: #2a2a1a;
    border-color: #eee;
  }
  [data-theme='dark'] .status-box {
    background: #222;
    border-color: #eee;
  }
  [data-theme='dark'] .success-box {
    background: #1a2a1a;
    border-color: #eee;
  }
  [data-theme='dark'] .feature-card {
    box-shadow: 6px 6px 0 #eee;
  }
  [data-theme='dark'] .feature-card:hover {
    box-shadow: 9px 9px 0 #eee;
  }
  [data-theme='dark'] .progress-bar {
    border-color: #eee;
    background: #333;
  }
  [data-theme='dark'] .result-badge {
    box-shadow: 4px 4px 0 #eee;
  }
</style>
