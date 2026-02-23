<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header brutal-pane bg-yellow">
        <div class="header-left">
          <button class="brutal-btn brutal-action-btn bg-pink" @click="goBack">
            <el-icon><ArrowLeft /></el-icon>返回
          </button>
        </div>
        <h1 class="brutal-title">MD5 哈希生成</h1>
        <div class="header-right">
          <button class="brutal-btn brutal-action-btn bg-pink" @click="clearAll">
            <el-icon><Delete /></el-icon>清空
          </button>
        </div>
      </header>

      <div class="brutal-toolbar brutal-pane">
        <div class="brutal-tabs">
          <button
            class="brutal-btn"
            :class="{ 'bg-blue': activeTab === 'text' }"
            @click="activeTab = 'text'"
          >
            文本模式
          </button>
          <button
            class="brutal-btn"
            :class="{ 'bg-blue': activeTab === 'file' }"
            @click="activeTab = 'file'"
          >
            文件模式
          </button>
        </div>
      </div>

      <div v-show="activeTab === 'text'" class="brutal-pane bg-white content-pane">
        <div class="input-section">
          <div class="section-header">
            <span class="brutal-label">输入文本</span>
            <button class="brutal-btn brutal-action-btn bg-green" @click="pasteFromClipboard">
              <el-icon><DocumentCopy /></el-icon> 粘贴
            </button>
          </div>
          <textarea
            v-model="inputText"
            class="brutal-editor"
            rows="6"
            placeholder="在此输入要计算 MD5 的文本..."
            @input="calculateTextMd5"
          ></textarea>
        </div>

        <div class="arrow-divider">↓</div>

        <div class="result-section">
          <div class="section-header">
            <span class="brutal-label">MD5 结果 (32位)</span>
          </div>
          <div class="result-box brutal-select" :class="{ 'has-result': textMd5 }">
            <div class="hash-value">{{ textMd5 || '等待输入...' }}</div>
            <button
              v-if="textMd5"
              class="brutal-btn brutal-action-btn bg-blue"
              @click="copyToClipboard(textMd5)"
            >
              复制
            </button>
          </div>
          <div v-if="textMd5" class="sub-result">
            <div class="sub-item">
              <span class="sub-label">16位:</span>
              <span class="sub-value">{{ textMd5.substring(8, 24) }}</span>
              <button
                class="brutal-action-btn copy-mini-btn"
                @click="copyToClipboard(textMd5.substring(8, 24))"
              >
                复制
              </button>
            </div>
            <div class="sub-item">
              <span class="sub-label">大写:</span>
              <span class="sub-value">{{ textMd5.toUpperCase() }}</span>
              <button
                class="brutal-action-btn copy-mini-btn"
                @click="copyToClipboard(textMd5.toUpperCase())"
              >
                复制
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-show="activeTab === 'file'" class="brutal-pane bg-white content-pane">
        <div class="upload-section">
          <el-upload
            class="brutal-uploader"
            drag
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange"
          >
            <el-icon class="upload-icon"><UploadFilled /></el-icon>
            <div class="upload-text">拖拽文件到此处或 <em>点击上传</em></div>
            <template #tip>
              <div class="upload-tip">支持任意类型文件，大文件将分片计算</div>
            </template>
          </el-upload>
        </div>

        <div v-if="fileInfo.name" class="brutal-pane bg-white mt-4 file-info-card">
          <div class="file-details">
            <div class="file-name">
              <el-icon><Document /></el-icon> {{ fileInfo.name }}
            </div>
            <div class="file-meta">大小: {{ formatSize(fileInfo.size) }}</div>
          </div>

          <div v-if="calculating" class="progress-bar-container">
            <el-progress
              :percentage="progress"
              :status="progress === 100 ? 'success' : ''"
              :format="formatProgress"
            />
            <div class="status-text">正在计算...</div>
          </div>

          <div v-else-if="fileMd5" class="result-section mt-4">
            <div class="section-header">
              <span class="brutal-label">文件 MD5</span>
            </div>
            <div class="result-box brutal-select has-result">
              <div class="hash-value">{{ fileMd5 }}</div>
              <button
                class="brutal-btn brutal-action-btn bg-blue"
                @click="copyToClipboard(fileMd5)"
              >
                复制
              </button>
            </div>
            <div class="sub-result">
              <div class="sub-item">
                <span class="sub-label">大写:</span>
                <span class="sub-value">{{ fileMd5.toUpperCase() }}</span>
                <button
                  class="brutal-action-btn copy-mini-btn"
                  @click="copyToClipboard(fileMd5.toUpperCase())"
                >
                  复制
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer class="footer">© 2026 LRM工具箱 - MD5 哈希生成</footer>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { ArrowLeft, Delete, Document, DocumentCopy, UploadFilled } from '@element-plus/icons-vue';
  import SparkMD5 from 'spark-md5';
  import { useCopy, useFileHandler } from '@/composables';

  const router = useRouter();

  const activeTab = ref('text');
  const inputText = ref('');
  const textMd5 = ref('');

  const fileInfo = ref({ name: '', size: 0 });
  const fileMd5 = ref('');
  const calculating = ref(false);
  const progress = ref(0);

  function calculateTextMd5() {
    if (!inputText.value) {
      textMd5.value = '';
      return;
    }
    textMd5.value = SparkMD5.hash(inputText.value);
  }

  function handleFileChange(file) {
    const rawFile = file.raw;
    fileInfo.value = {
      name: rawFile.name,
      size: rawFile.size
    };
    fileMd5.value = '';
    progress.value = 0;
    calculating.value = true;

    const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
    const chunkSize = 2 * 1024 * 1024;
    const chunks = Math.ceil(rawFile.size / chunkSize);
    let currentChunk = 0;
    const spark = new SparkMD5.ArrayBuffer();
    const fileReader = new FileReader();

    fileReader.onload = function (e) {
      spark.append(e.target.result);
      currentChunk++;

      progress.value = Math.floor((currentChunk / chunks) * 100);

      if (currentChunk < chunks) {
        loadNext();
      } else {
        fileMd5.value = spark.end();
        calculating.value = false;
        ElMessage.success('计算完成');
      }
    };

    fileReader.onerror = function () {
      ElMessage.error('文件读取失败');
      calculating.value = false;
    };

    function loadNext() {
      const start = currentChunk * chunkSize;
      const end = start + chunkSize >= rawFile.size ? rawFile.size : start + chunkSize;
      fileReader.readAsArrayBuffer(blobSlice.call(rawFile, start, end));
    }

    loadNext();
  }

  function goBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }

  function clearAll() {
    inputText.value = '';
    textMd5.value = '';
    fileInfo.value = { name: '', size: 0 };
    fileMd5.value = '';
    progress.value = 0;
    calculating.value = false;
  }

  const { copyToClipboard } = useCopy();
  const { formatSize } = useFileHandler();

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      inputText.value = text;
      calculateTextMd5();
      ElMessage.success('已粘贴');
    } catch {
      ElMessage.error('无法读取剪贴板');
    }
  }

  function formatProgress(percentage) {
    return percentage === 100 ? '完成' : `${percentage}%`;
  }
</script>

<style scoped>
  /* 核心设计元素与变量定义 */
  .brutal-wrapper {
    min-height: 100vh;
    background: repeating-linear-gradient(45deg, #fdfae5, #fdfae5 20px, #fffceb 20px, #fffceb 40px);
    padding: 2rem 1rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    color: #111;
  }

  .brutal-container {
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .brutal-pane {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    border-radius: 0;
    padding: 1.5rem;
  }

  .bg-yellow {
    background-color: #ffd900 !important;
  }
  .bg-blue {
    background-color: #4b7bff !important;
    color: white !important;
  }
  .bg-green {
    background-color: #00e572 !important;
  }
  .bg-pink {
    background-color: #ff4b4b !important;
    color: white !important;
  }
  .bg-white {
    background-color: #fff !important;
  }

  /* Header */
  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
  }

  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-weight: 900;
    font-size: 1.8rem;
    margin: 0;
    text-align: center;
    letter-spacing: 1px;
    -webkit-text-stroke: 1px #111;
    color: #fff;
    text-shadow: 3px 3px 0 #111;
  }

  .brutal-toolbar {
    padding: 1rem;
    text-align: center;
  }

  .brutal-tabs {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }

  /* 按钮 - 标准化交互动画 */
  .brutal-btn {
    font-family: 'Syne', 'Noto Sans SC', 'PingFang SC', sans-serif;
    font-weight: 800;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    background: #fff;
    padding: 0.5rem 1.5rem;
    cursor: pointer;
    transition: all 0.15s ease-out;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 1rem;
    border-radius: 0;
    color: #111;
  }

  .brutal-action-btn {
    padding: 0.3rem 1rem;
    font-size: 0.9rem;
  }

  .copy-mini-btn {
    padding: 0.2rem 0.5rem;
    font-size: 0.8rem;
    background: #fdfae5;
    border: 2px solid #111;
    box-shadow: 2px 2px 0px #111;
    cursor: pointer;
    transition: all 0.15s;
  }

  .copy-mini-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 4px 4px 0px #111;
  }
  .copy-mini-btn:active {
    transform: translate(2px, 2px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 7px 7px 0px #111;
  }

  .brutal-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px #111;
  }

  /* 输入框 / 编辑器 */
  .brutal-editor {
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    width: 100%;
    border: 3px solid #111;
    box-shadow: inset 4px 4px 0px rgba(0, 0, 0, 0.05);
    padding: 1rem;
    font-size: 1rem;
    resize: vertical;
    background: #fafafa;
    border-radius: 0;
    outline: none;
    box-sizing: border-box;
    transition: all 0.2s;
    color: #111;
  }

  .brutal-editor:focus {
    background: #fff;
    border-color: #4b7bff;
    box-shadow: inset 4px 4px 0px rgba(75, 123, 255, 0.1);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .brutal-label {
    font-weight: 800;
    font-size: 1.1rem;
    border-bottom: 3px solid #111;
    padding-bottom: 0.2rem;
    display: inline-block;
    color: #111;
  }

  .arrow-divider {
    text-align: center;
    font-size: 2rem;
    font-weight: 900;
    color: #111;
    margin: 1rem 0;
    text-shadow: 2px 2px 0px #ff4b4b;
  }

  .result-box {
    border: 3px solid #111;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #eee;
    box-shadow: inset 3px 3px 0px rgba(0, 0, 0, 0.1);
  }

  .result-box.has-result {
    background: #e6ffed;
  }

  .hash-value {
    font-size: 1.2rem;
    word-break: break-all;
    font-weight: 600;
    margin-right: 1rem;
    color: #111;
  }

  .sub-result {
    margin-top: 1rem;
    background: #fafafa;
    border: 2px solid #111;
    padding: 1rem;
  }

  .sub-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
    color: #111;
  }

  .sub-item:last-child {
    margin-bottom: 0;
  }

  .sub-label {
    font-weight: 700;
    min-width: 50px;
  }

  .sub-value {
    flex: 1;
    word-break: break-all;
  }

  .mt-4 {
    margin-top: 1.5rem;
  }

  /* 上传模块覆盖 */
  :deep(.brutal-uploader .el-upload-dragger) {
    background: #fafafa;
    border: 3px dashed #111;
    box-shadow: 4px 4px 0px #111;
    border-radius: 0;
    padding: 3rem;
    transition: all 0.2s;
  }

  :deep(.brutal-uploader .el-upload-dragger:hover) {
    transform: translate(-3px, -3px);
    box-shadow: 7px 7px 0px #111;
    border-color: #4b7bff;
    background: #f0f4ff;
  }

  .upload-icon {
    font-size: 3rem;
    color: #111;
    margin-bottom: 1rem;
  }

  .upload-text {
    font-weight: 700;
    font-size: 1.1rem;
    color: #111;
  }

  .upload-tip {
    margin-top: 1rem;
    font-weight: 600;
    color: #666;
  }

  .file-details {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #111;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
    color: #111;
  }

  .file-name {
    font-weight: 800;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .progress-bar-container {
    border: 3px solid #111;
    padding: 1rem;
    background: #fff;
    box-shadow: 4px 4px 0px #111;
  }

  :deep(.el-progress-bar__outer) {
    border: 2px solid #111;
    background: #eee !important;
    border-radius: 0 !important;
  }

  :deep(.el-progress-bar__inner) {
    background: #00e572 !important;
    border-radius: 0 !important;
  }

  .footer {
    text-align: center;
    padding: 2rem 0;
    font-weight: 700;
    border-top: 3px solid #111;
    margin-top: 2rem;
    color: #111;
  }

  /* Dark Mode 适配 */
  [data-theme='dark'] .brutal-wrapper {
    background: repeating-linear-gradient(45deg, #111, #111 20px, #1a1a1a 20px, #1a1a1a 40px);
    color: #eee;
  }

  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .sub-result,
  [data-theme='dark'] .progress-bar-container {
    background: #1a1a1a !important;
    border-color: #eee;
    color: #eee;
  }

  [data-theme='dark'] .brutal-pane {
    box-shadow: 8px 8px 0px #eee;
  }

  [data-theme='dark'] .brutal-btn {
    box-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 7px 7px 0px #eee;
  }

  [data-theme='dark'] .brutal-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .copy-mini-btn {
    background: #111;
    border-color: #eee;
    color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }

  [data-theme='dark'] .copy-mini-btn:hover {
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .copy-mini-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .bg-yellow {
    background-color: #b28f00 !important;
  }
  [data-theme='dark'] .bg-blue {
    background-color: #2a4eb2 !important;
    color: #eee !important;
  }
  [data-theme='dark'] .bg-green {
    background-color: #00994c !important;
  }
  [data-theme='dark'] .bg-pink {
    background-color: #cc0000 !important;
    color: white !important;
  }
  [data-theme='dark'] .bg-white {
    background-color: #1a1a1a !important;
    color: #eee !important;
  }

  [data-theme='dark'] .brutal-editor {
    background: #111;
    border-color: #eee;
    color: #eee;
  }

  [data-theme='dark'] .result-box {
    background: #111;
    border-color: #eee;
  }

  [data-theme='dark'] .result-box.has-result {
    background: #004d26;
  }

  [data-theme='dark'] .hash-value,
  [data-theme='dark'] .sub-item,
  [data-theme='dark'] .file-details {
    color: #eee;
  }

  [data-theme='dark'] .brutal-title {
    -webkit-text-stroke: 1px #eee;
    text-shadow: 3px 3px 0 #eee;
  }

  [data-theme='dark'] .arrow-divider {
    color: #eee;
    text-shadow: 2px 2px 0px #cc0000;
  }

  [data-theme='dark'] .brutal-label,
  [data-theme='dark'] .footer {
    border-color: #eee;
    color: #eee;
  }

  :deep([data-theme='dark'] .brutal-uploader .el-upload-dragger) {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }

  :deep([data-theme='dark'] .brutal-uploader .el-upload-dragger:hover) {
    box-shadow: 7px 7px 0px #eee;
    border-color: #2a4eb2;
    background: #111;
  }

  [data-theme='dark'] .upload-icon,
  [data-theme='dark'] .upload-text,
  [data-theme='dark'] .upload-tip {
    color: #eee;
  }

  :deep([data-theme='dark'] .el-progress-bar__outer) {
    border-color: #eee;
    background: #111 !important;
  }

  :deep([data-theme='dark'] .el-progress-bar__inner) {
    background: #00994c !important;
  }
</style>
