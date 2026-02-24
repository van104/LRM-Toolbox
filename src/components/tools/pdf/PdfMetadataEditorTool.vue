<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">PDF<span>.元数据()</span></h1>
        <button class="brutal-btn clear-btn" :disabled="!pdfFile" @click="clearFile">
          清空内存
        </button>
      </header>

      <div class="brutal-grid">
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span class="text-black">1. 载入原始图层</span>
          </div>

          <div v-if="!pdfFile" class="brutal-upload-area" @click="triggerUpload">
            <div class="upload-text">
              <h3>[ 放入文档材料 ]</h3>
              <p>提取标题/作者/主题等属性信息</p>
            </div>
          </div>
          <div v-else class="file-loaded-info">
            <div class="status-badge success">DATA RECEIVED</div>
            <p class="filename">{{ pdfFile.name }}</p>
            <div style="margin-top: 1rem">
              <button class="brutal-action-btn" @click="clearFile">销毁对象</button>
            </div>
          </div>
          <input ref="fileInput" type="file" hidden accept=".pdf" @change="handleFileSelect" />

          <div v-if="pdfFile" style="padding: 1.5rem">
            <div class="original-info param-box">
              <h4
                style="
                  margin: 0 0 0.75rem;
                  font-family: monospace;
                  font-size: 1.1rem;
                  border-bottom: 2px solid #111;
                  padding-bottom: 0.5rem;
                "
              >
                / / 原始元数据
              </h4>
              <div class="info-grid">
                <div v-for="(value, key) in originalMetadata" :key="key" class="info-item">
                  <span class="info-label">[{{ key }}]</span>
                  <span class="info-value">{{ value || 'N/A' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="brutal-pane">
          <div class="pane-header bg-black">
            <span class="text-white">2. 编辑数据</span>
          </div>

          <div v-if="pdfFile" class="param-area" style="padding: 1.5rem">
            <div class="metadata-form">
              <div class="form-item">
                <label>标题 (Title)</label>
                <input
                  v-model="metadata.title"
                  type="text"
                  class="brutal-input"
                  placeholder="文档标题"
                />
              </div>
              <div class="form-item">
                <label>作者 (Author)</label>
                <input
                  v-model="metadata.author"
                  type="text"
                  class="brutal-input"
                  placeholder="文档作者"
                />
              </div>
              <div class="form-item">
                <label>主题 (Subject)</label>
                <input
                  v-model="metadata.subject"
                  type="text"
                  class="brutal-input"
                  placeholder="文档主题"
                />
              </div>
              <div class="form-item">
                <label>关键词 (Keywords)</label>
                <input
                  v-model="metadata.keywords"
                  type="text"
                  class="brutal-input"
                  placeholder="用逗号分隔的关键词"
                />
              </div>
              <div class="form-item">
                <label>创建者 (Creator)</label>
                <input
                  v-model="metadata.creator"
                  type="text"
                  class="brutal-input"
                  placeholder="创建此文档的程序"
                />
              </div>
              <div class="form-item">
                <label>生成器 (Producer)</label>
                <input
                  v-model="metadata.producer"
                  type="text"
                  class="brutal-input"
                  placeholder="生成此 PDF 的程序"
                />
              </div>

              <div class="form-row">
                <div class="form-item">
                  <label>创建日期</label>
                  <input
                    v-model="metadata.creationDateStr"
                    type="datetime-local"
                    class="brutal-input"
                  />
                </div>
                <div class="form-item">
                  <label>修改日期</label>
                  <input
                    v-model="metadata.modificationDateStr"
                    type="datetime-local"
                    class="brutal-input"
                  />
                </div>
              </div>
            </div>

            <button
              class="brutal-action-btn action-btn primary large"
              :disabled="processing"
              @click="saveMetadata"
            >
              {{ processing ? 'EXECUTING...' : 'COMMIT.保存并下载' }}
            </button>
          </div>

          <div v-else class="empty-state warn">
            <p>// 视图渲染失败</p>
            <p>等待目标输入，请先装载材料</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { PDFDocument } from 'pdf-lib';
  import { useFileHandler } from '@/composables';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const { fileInput, triggerFileInput, handleFileSelect } = useFileHandler({
    accept: '.pdf',
    readMode: 'none',
    onSuccess: result => {
      loadPdf(result.file);
    }
  });

  const pdfFile = ref(null);
  const pdfBytes = ref(null);
  const processing = ref(false);

  const metadata = reactive({
    title: '',
    author: '',
    subject: '',
    keywords: '',
    creator: '',
    producer: '',
    creationDateStr: '',
    modificationDateStr: ''
  });

  const originalMetadata = ref({});

  const triggerUpload = () => triggerFileInput();

  const clearFile = () => {
    pdfFile.value = null;
    pdfBytes.value = null;
    Object.keys(metadata).forEach(key => (metadata[key] = ''));
    originalMetadata.value = {};
  };

  const formatDateForInput = date => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const loadPdf = async file => {
    try {
      pdfFile.value = file;
      const buffer = await file.arrayBuffer();
      pdfBytes.value = new Uint8Array(buffer);

      const pdfDoc = await PDFDocument.load(pdfBytes.value);

      metadata.title = pdfDoc.getTitle() || '';
      metadata.author = pdfDoc.getAuthor() || '';
      metadata.subject = pdfDoc.getSubject() || '';
      metadata.keywords = (pdfDoc.getKeywords() || []).join(', ');
      metadata.creator = pdfDoc.getCreator() || '';
      metadata.producer = pdfDoc.getProducer() || '';
      metadata.creationDateStr = formatDateForInput(pdfDoc.getCreationDate());
      metadata.modificationDateStr = formatDateForInput(pdfDoc.getModificationDate());

      originalMetadata.value = {
        标题: pdfDoc.getTitle(),
        作者: pdfDoc.getAuthor(),
        主题: pdfDoc.getSubject(),
        关键词: (pdfDoc.getKeywords() || []).join(', '),
        创建者: pdfDoc.getCreator(),
        生成器: pdfDoc.getProducer(),
        创建日期: pdfDoc.getCreationDate()?.toLocaleString(),
        修改日期: pdfDoc.getModificationDate()?.toLocaleString()
      };
    } catch (e) {
      console.error(e);
      ElMessage.error('加载 PDF 失败');
    }
  };

  const saveMetadata = async () => {
    if (!pdfBytes.value) return;

    processing.value = true;
    try {
      const pdfDoc = await PDFDocument.load(pdfBytes.value);

      if (metadata.title) pdfDoc.setTitle(metadata.title);
      if (metadata.author) pdfDoc.setAuthor(metadata.author);
      if (metadata.subject) pdfDoc.setSubject(metadata.subject);

      const newKw = metadata.keywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k);
      if (newKw.length) {
        pdfDoc.setKeywords(newKw);
      } else {
        pdfDoc.setKeywords([]);
      }

      if (metadata.creator) pdfDoc.setCreator(metadata.creator);
      if (metadata.producer) pdfDoc.setProducer(metadata.producer);
      if (metadata.creationDateStr) pdfDoc.setCreationDate(new Date(metadata.creationDateStr));
      if (metadata.modificationDateStr)
        pdfDoc.setModificationDate(new Date(metadata.modificationDateStr));

      const modifiedBytes = await pdfDoc.save();
      const blob = new Blob([modifiedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `metadata_${pdfFile.value.name}`;
      a.click();
      URL.revokeObjectURL(url);

      ElMessage.success('元数据保存成功');
    } catch (e) {
      console.error(e);
      ElMessage.error('保存失败: ' + e.message);
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
    grid-template-columns: 350px 1fr;
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
  .font-mono {
    font-family: 'IBM Plex Mono', monospace;
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
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.95rem;
    color: #555;
    padding: 0 1rem;
  }

  .file-loaded-info {
    min-height: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem;
    background: #fdfae5;
  }
  .status-badge {
    background: #111;
    color: #fff;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: bold;
    padding: 0.2rem 1rem;
    margin-bottom: 1rem;
    letter-spacing: 2px;
  }
  .status-badge.success {
    background: #00e572;
    color: #111;
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

  /* 控制栏 */
  .param-area {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .param-box {
    border: 4px dashed #111;
    padding: 1.5rem;
    background: #fafafa;
  }

  .metadata-form {
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .form-item label {
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
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  .info-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }
  .info-label {
    font-weight: bold;
    min-width: 80px;
  }
  .info-value {
    color: #555;
    word-break: break-all;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 1;
    min-height: 400px;
    font-family: 'IBM Plex Mono', monospace;
  }
  .empty-state p {
    margin: 0.5rem 0;
    color: #555;
  }
  .empty-state.warn p {
    font-weight: bold;
    color: #cc0000;
  }

  @media (max-width: 1024px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .brutal-title {
      font-size: 2.5rem;
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
  [data-theme='dark'] .param-box,
  [data-theme='dark'] .brutal-input {
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
  [data-theme='dark'] .status-badge.success {
    background: #00994c;
    color: #fff;
  }

  [data-theme='dark'] .info-value {
    color: #ccc;
  }
</style>
