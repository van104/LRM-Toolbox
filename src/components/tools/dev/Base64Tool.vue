<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">BASE64<span>.编解码()</span></h1>
        <button class="brutal-btn clear-btn" @click="clearAll">清空工作区</button>
      </header>

      <div class="brutal-tabs">
        <button
          class="brutal-tab-btn"
          :class="{ active: activeTab === 'text' }"
          @click="activeTab = 'text'"
        >
          文本模式
        </button>
        <button
          class="brutal-tab-btn"
          :class="{ active: activeTab === 'image' }"
          @click="activeTab = 'image'"
        >
          图片模式
        </button>
      </div>

      <!-- TEXT MODE -->
      <div v-if="activeTab === 'text'" class="brutal-workspace text-workspace">
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span>原始文本.TXT</span>
            <button class="brutal-small-btn" @click="pasteFromClipboard">粘贴</button>
          </div>
          <div class="textarea-wrapper">
            <textarea
              v-model="inputText"
              class="brutal-editor"
              placeholder="在这里输入需要变身的文本..."
              spellcheck="false"
              @input="handleTextInput"
            ></textarea>
          </div>
        </div>

        <div class="brutal-actions center-actions">
          <button class="brutal-action-btn primary" @click="encodeText">编码 →</button>
          <button class="brutal-action-btn bg-pink text-white" @click="decodeText">← 解码</button>
        </div>

        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">BASE64_载荷.B64</span>
            <button class="brutal-small-btn" @click="copyToClipboard(outputText)">复制</button>
          </div>
          <div class="textarea-wrapper">
            <textarea
              v-model="outputText"
              class="brutal-editor output-editor"
              placeholder="Base64 结果输出位..."
              @input="handleBase64Input"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- IMAGE MODE -->
      <div v-else class="brutal-workspace image-workspace">
        <div class="upload-section">
          <el-upload
            class="brutal-uploader"
            drag
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange"
            accept="image/*"
          >
            <div class="brutal-drag-area">
              <h2 class="drag-title">拖拽图片投掷到此处</h2>
              <p class="drag-sub">或者 <span>点击浏览本地磁盘</span></p>
            </div>
          </el-upload>
        </div>

        <div v-if="imgBase64" class="result-section">
          <div class="brutal-pane">
            <div class="pane-header bg-yellow">
              <span>图片解析报告_</span>
              <span class="size-badge">SIZE: {{ imgSize }}</span>
            </div>
            <div class="preview-area">
              <img :src="imgBase64" alt="预览" />
            </div>

            <div class="pane-header bg-blue img-code-header">
              <span class="text-white">BASE64_代码流</span>
              <div class="pane-actions">
                <button class="brutal-small-btn" @click="copyImgTag">&lt;IMG&gt;</button>
                <button class="brutal-small-btn" @click="copyToClipboard(imgBase64)">复制码</button>
                <button class="brutal-small-btn primary" @click="downloadBase64Image">下载</button>
              </div>
            </div>
            <div class="textarea-wrapper code-box">
              <textarea readonly class="brutal-editor output-editor" :value="imgBase64"></textarea>
            </div>
          </div>
        </div>
      </div>

      <div class="brutal-status" :class="statusType">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i">{{ statusMessage }} // &nbsp;</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useCopy, useFileHandler } from '@/composables';

  const router = useRouter();

  const activeTab = ref('text');
  const inputText = ref('');
  const outputText = ref('');
  const imgBase64 = ref('');
  const imgSize = ref('');

  const statusMessage = ref('系统待命中');
  const statusType = ref('info');

  const { copyToClipboard: copy } = useCopy();
  const { validateFile, formatSize } = useFileHandler({
    accept: 'image/*',
    maxSize: 5 * 1024 * 1024 // 5MB limit
  });

  function goBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }

  function showStatus(message, type) {
    statusMessage.value = message;
    statusType.value = type;
  }

  function clearAll() {
    inputText.value = '';
    outputText.value = '';
    imgBase64.value = '';
    imgSize.value = '';
    showStatus('工作区已清理完毕', 'info');
  }

  function encodeText() {
    if (!inputText.value) return showStatus('错误: 取出内容为空', 'error');
    try {
      outputText.value = btoa(unescape(encodeURIComponent(inputText.value)));
      showStatus('编码操作成功 : 核心算法通过', 'success');
    } catch {
      showStatus('编码发生致命错误', 'error');
    }
  }

  function decodeText() {
    if (!outputText.value) return showStatus('错误: 取出内容为空', 'error');
    try {
      inputText.value = decodeURIComponent(escape(atob(outputText.value)));
      showStatus('解码操作成功 : 数据已返还', 'success');
    } catch {
      showStatus('解码拒绝 : 损坏的 BASE64 字符串', 'error');
    }
  }

  function handleTextInput() {
    if (!inputText.value) {
      outputText.value = '';
      showStatus('系统待命中', 'info');
    }
  }

  function handleBase64Input() {
    if (!outputText.value) {
      inputText.value = '';
      showStatus('系统待命中', 'info');
    }
  }

  async function handleFileChange(file) {
    const rawFile = file.raw;
    if (!validateFile(rawFile)) return showStatus('上传拒绝 : 无效的文件类型', 'error');

    try {
      const result = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(rawFile);
      });
      imgBase64.value = result;
      imgSize.value = formatSize(rawFile.size);
      showStatus('图像转换完毕 : BASE64流已注入', 'success');
    } catch (error) {
      console.error('File read error:', error);
      showStatus('文件读取遇到内部错误', 'error');
    }
  }

  function copyToClipboard(textToCopy) {
    copy(textToCopy, { success: '已安全复制到物理外存剪贴板' });
    showStatus('复制动作执行完毕', 'success');
  }

  function copyImgTag() {
    if (!imgBase64.value) return;
    const tag = `<img src="${imgBase64.value}" alt="base64-image" />`;
    copyToClipboard(tag);
    showStatus('HTML IMG 标签已加入剪贴板', 'success');
  }

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      inputText.value = text;
      showStatus('发现外接剪贴板输入并接入成功', 'success');
    } catch {
      showStatus('安全拦截 : 拒绝访问主机剪贴板', 'error');
    }
  }

  function downloadBase64Image() {
    if (!imgBase64.value) return showStatus('错误: 无可供下载的资源', 'error');
    const a = document.createElement('a');
    a.href = imgBase64.value;
    a.download = 'decoded-image.png';
    a.click();
    showStatus('请求已发起 : 下载通道启动', 'success');
  }
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

  .brutal-tabs {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 2.5rem;
    justify-content: center;
  }
  .brutal-tab-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 3rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.35rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 5px 5px 0px #111;
    transition: all 0.1s;
  }
  .brutal-tab-btn.active {
    background: #ffd900;
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }
  .brutal-tab-btn:not(.active):hover {
    transform: translate(-2px, -2px);
    box-shadow: 7px 7px 0px #111;
  }

  .brutal-workspace {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    min-height: 500px;
    margin-bottom: 3rem;
  }

  .text-workspace {
    flex-direction: row;
  }

  .image-workspace {
    flex-direction: column;
    max-width: 1000px;
    margin: 0 auto;
    margin-bottom: 3rem;
    width: 100%;
  }

  .brutal-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
    transition: transform 0.2s;
    min-height: 400px;
  }
  .brutal-pane:hover {
    transform: translate(-4px, -4px);
    box-shadow: 16px 16px 0px #111;
  }

  .center-actions {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2rem;
  }

  .brutal-action-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 1rem 2rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1.25rem;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
    text-transform: uppercase;
    min-width: 160px;
  }
  .brutal-action-btn.primary {
    background: #00e572;
  }
  .brutal-action-btn.bg-pink {
    background: #ff4b4b;
    color: white;
  }

  .brutal-action-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 8px 8px 0px #111;
  }
  .brutal-action-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
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
  .img-code-header {
    border-top: 4px solid #111;
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

  .size-badge {
    background: #111;
    color: #fff;
    padding: 0.2rem 0.8rem;
    font-size: 1rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    box-shadow: 3px 3px 0px #ff4b4b;
  }

  .brutal-small-btn {
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
  .brutal-small-btn.primary {
    background: #00e572;
  }
  .brutal-small-btn.bg-pink {
    background: #ff4b4b;
    color: #fff;
  }
  .brutal-small-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }
  .brutal-small-btn:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }
  .pane-actions {
    display: flex;
    gap: 0.5rem;
  }

  .textarea-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .brutal-editor {
    flex: 1;
    width: 100%;
    border: none;
    padding: 1.5rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-size: 1.05rem;
    line-height: 1.6;
    resize: none;
    outline: none;
    background: transparent;
    color: #111;
  }
  .brutal-editor::placeholder {
    color: #888;
    font-style: italic;
  }
  .output-editor {
    background: #f8fafc;
    word-break: break-all;
  }

  /* Image section specific */
  :deep(.brutal-uploader .el-upload-dragger) {
    background: #fff;
    border: 4px dashed #111;
    border-radius: 0;
    box-shadow: 8px 8px 0px #111;
    padding: 4rem 2rem;
    transition: all 0.2s;
  }
  :deep(.brutal-uploader .el-upload-dragger:hover) {
    border-color: #ff4b4b;
    transform: translate(-3px, -3px);
    box-shadow: 11px 11px 0px #ff4b4b;
    border-style: solid;
  }

  .brutal-drag-area {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    color: #111;
  }
  .drag-title {
    font-size: 2.5rem;
    font-weight: 900;
    margin-bottom: 1rem;
  }
  .drag-sub {
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-size: 1.25rem;
    font-weight: 600;
  }
  .drag-sub span {
    color: #4b7bff;
    text-decoration: underline;
    text-decoration-thickness: 4px;
  }

  .preview-area {
    padding: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background: repeating-linear-gradient(45deg, #f0f0f0, #f0f0f0 10px, #fff 10px, #fff 20px);
    border-bottom: 4px solid #111;
  }

  .preview-area img {
    max-width: 100%;
    max-height: 300px;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
  }

  .code-box {
    background: #f8fafc;
    min-height: 200px;
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
    .text-workspace {
      flex-direction: column;
    }
    .center-actions {
      flex-direction: row;
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
  [data-theme='dark'] .brutal-tab-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .brutal-small-btn,
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

  [data-theme='dark'] .brutal-tab-btn {
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .brutal-tab-btn:not(.active):hover {
    box-shadow: 7px 7px 0px #eee;
  }
  [data-theme='dark'] .brutal-tab-btn.active {
    background: #b28f00;
    box-shadow: 0 0 0 #eee;
    color: #fff;
  }

  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane:hover {
    box-shadow: 16px 16px 0px #eee;
  }

  [data-theme='dark'] .brutal-action-btn {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:hover {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:active {
    box-shadow: 0 0 0 #eee;
  }

  [data-theme='dark'] .brutal-small-btn {
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .brutal-small-btn:hover {
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .brutal-small-btn:active {
    box-shadow: 0 0 0 #eee;
  }

  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
    color: #111;
  }
  [data-theme='dark'] .img-code-header {
    border-top-color: #eee;
  }

  [data-theme='dark'] .brutal-editor {
    color: #eee;
  }
  [data-theme='dark'] .output-editor {
    background: #222;
  }
  [data-theme='dark'] .brutal-status {
    box-shadow: 8px 8px 0px #eee;
  }

  [data-theme='dark'] .brutal-action-btn.primary,
  [data-theme='dark'] .brutal-small-btn.primary,
  [data-theme='dark'] .brutal-status.success {
    background: #00994c;
    color: #fff;
  }

  [data-theme='dark'] .brutal-btn.clear-btn,
  [data-theme='dark'] .brutal-action-btn.bg-pink,
  [data-theme='dark'] .brutal-small-btn.bg-pink,
  [data-theme='dark'] .brutal-status.error {
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

  [data-theme='dark'] .size-badge {
    background: #eee;
    color: #111;
    box-shadow: 3px 3px 0px #cc0000;
  }

  [data-theme='dark'] .brutal-uploader .el-upload-dragger {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-uploader .el-upload-dragger:hover {
    border-color: #ff4b4b;
    box-shadow: 11px 11px 0px #ff4b4b;
  }
  [data-theme='dark'] .brutal-drag-area {
    color: #eee;
  }
  [data-theme='dark'] .preview-area {
    background: repeating-linear-gradient(45deg, #1a1a1a, #1a1a1a 10px, #222 10px, #222 20px);
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .preview-area img {
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .code-box {
    background: #222;
  }
</style>
