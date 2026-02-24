<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">PDF<span>.转EPUB()</span></h1>
      </header>

      <div class="brutal-pane">
        <div class="pane-header bg-yellow"><span>PDF 转电子书</span></div>
        <div class="pane-body">
          <div
            v-if="!file"
            class="brutal-upload-area"
            @click="triggerUpload"
            @dragover.prevent="dragOver"
            @dragleave.prevent="dragLeave"
            @drop.prevent="handleDrop"
          >
            <div class="upload-text">
              <h3>[ 点击或拖拽上传 PDF ]</h3>
              <p>支持自动识别章节、重排版面，适合电子书阅读</p>
            </div>
            <input
              ref="fileInput"
              type="file"
              accept=".pdf"
              class="hidden"
              @change="handleFileSelect"
            />
          </div>

          <div v-else-if="!converted">
            <div class="file-badge">
              <strong>{{ file.name }}</strong> <span>({{ formatSize(file.size) }})</span>
              <button
                class="brutal-action-btn primary"
                style="padding: 0.4rem 1rem; font-size: 0.9rem; margin-left: auto"
                :disabled="converting"
                @click="startConversion"
              >
                {{ converting ? '转换中...' : '开始转换' }}
              </button>
            </div>

            <div class="param-box">
              <div class="form-item">
                <label>标题识别</label>
                <div class="radio-wrap">
                  <label
                    ><input v-model="settings.detectTitles" type="checkbox" />
                    自动检测章节标题</label
                  >
                </div>
              </div>
              <div class="form-item">
                <label>排版优化</label>
                <div class="radio-wrap">
                  <label
                    ><input v-model="settings.removeHeaders" type="checkbox" /> 移除页眉页脚</label
                  >
                  <label
                    ><input v-model="settings.mergeParagraphs" type="checkbox" />
                    合并断行段落</label
                  >
                </div>
              </div>
              <div class="form-item">
                <label>封面设置</label>
                <div class="radio-wrap">
                  <label
                    ><input v-model="settings.coverType" type="radio" value="first" />
                    使用第一页</label
                  >
                  <label
                    ><input v-model="settings.coverType" type="radio" value="none" /> 无封面</label
                  >
                </div>
              </div>
            </div>
          </div>

          <div v-else class="success-box">
            <h3>✅ 转换成功</h3>
            <p>您的 EPUB 电子书已准备就绪</p>
            <div class="success-actions">
              <button class="brutal-action-btn primary" @click="downloadEpub">⬇ 下载 EPUB</button>
              <button class="brutal-action-btn" @click="reset">转换其他文件</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useFileHandler } from '@/composables/useFileHandler';
  import { ElMessage } from 'element-plus';

  const file = ref<File | null>(null);
  const converting = ref(false);
  const converted = ref(false);
  const settings = ref({
    detectTitles: true,
    removeHeaders: true,
    mergeParagraphs: true,
    coverType: 'first'
  });
  const {
    fileInput,
    formatSize,
    triggerUpload,
    handleFileSelect,
    handleFileDrop: handleDrop,
    dragOver,
    dragLeave
  } = useFileHandler({
    accept: '.pdf',
    readMode: 'none',
    onSuccess: ({ file: f }) => {
      file.value = f;
      converted.value = false;
    }
  });
  const startConversion = () => {
    if (!file.value) return;
    converting.value = true;
    setTimeout(() => {
      converting.value = false;
      converted.value = true;
      ElMessage.success('转换完成');
    }, 2000);
  };
  const downloadEpub = () => {
    if (!file.value) return;
    const link = document.createElement('a');
    link.download = file.value.name.replace('.pdf', '.epub');
    link.href = URL.createObjectURL(
      new Blob(['Mock EPUB Content'], { type: 'application/epub+zip' })
    );
    link.click();
  };
  const reset = () => {
    file.value = null;
    converted.value = false;
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
    margin-bottom: 2rem;
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
    min-height: 280px;
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
  .hidden {
    display: none;
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
    font-family: 'IBM Plex Mono', monospace;
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
  .success-box {
    text-align: center;
    padding: 3rem;
    border: 4px solid #111;
    background: #e8ffe8;
  }
  .success-box h3 {
    font-family: 'Syne', sans-serif;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
  .success-box p {
    color: #555;
    margin-bottom: 2rem;
  }
  .success-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
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
  [data-theme='dark'] .param-box {
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
  [data-theme='dark'] .success-box {
    background: #1a2a1a;
    border-color: #eee;
  }
</style>
