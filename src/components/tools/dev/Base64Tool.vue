<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="goBack">
          <el-icon>
            <ArrowLeft />
          </el-icon>
          <span>返回</span>
        </el-button>
      </div>
      <h1 class="tool-title">Base64 编解码</h1>
      <div class="header-right">
        <el-button text @click="clearAll">
          <el-icon>
            <Delete />
          </el-icon>
          <span>清空</span>
        </el-button>
      </div>
    </header>

    <div class="toolbar">
      <el-radio-group v-model="activeTab" class="custom-tabs">
        <el-radio-button label="text">文本模式</el-radio-button>
        <el-radio-button label="image">图片模式</el-radio-button>
      </el-radio-group>
    </div>

    <div v-if="activeTab === 'text'" class="editor-container">
      <div class="editor-panel">
        <div class="panel-header">
          <span class="panel-title">明文输入的</span>
          <div class="panel-actions">
            <el-button text size="small" @click="pasteFromClipboard">
              <el-icon>
                <DocumentCopy />
              </el-icon>
              粘贴
            </el-button>
          </div>
        </div>
        <textarea
          v-model="inputText"
          class="code-editor"
          placeholder="在此输入要编码的文本..."
          spellcheck="false"
          @input="handleTextInput"
        ></textarea>
      </div>

      <div class="action-buttons">
        <el-button type="primary" class="action-btn" @click="encodeText">
          <span class="btn-text">编码</span>
          <el-icon>
            <ArrowRight />
          </el-icon>
        </el-button>
        <el-button class="action-btn" @click="decodeText">
          <el-icon>
            <ArrowLeft />
          </el-icon>
          <span class="btn-text">解码</span>
        </el-button>
      </div>

      <div class="editor-panel">
        <div class="panel-header">
          <span class="panel-title">Base64 结果</span>
          <div class="panel-actions">
            <el-button text size="small" @click="copyToClipboard(outputText)">
              <el-icon>
                <CopyDocument />
              </el-icon>
              复制
            </el-button>
          </div>
        </div>
        <textarea
          v-model="outputText"
          class="code-editor output"
          placeholder="Base64 编码结果..."
          @input="handleBase64Input"
        ></textarea>
      </div>
    </div>

    <div v-else class="image-mode-container">
      <div class="upload-section">
        <el-upload
          class="image-uploader"
          drag
          action="#"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleFileChange"
          accept="image/*"
        >
          <el-icon class="el-icon--upload">
            <UploadFilled />
          </el-icon>
          <div class="el-upload__text">拖拽图片到此处或 <em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">支持 JPG, PNG, GIF, SVG 等常见图片格式</div>
          </template>
        </el-upload>
      </div>

      <div v-if="imgBase64" class="result-section">
        <div class="result-info">
          <span>图片大小: {{ imgSize }}</span>
          <div class="preview-box">
            <img :src="imgBase64" alt="预览" class="img-preview" />
          </div>
        </div>

        <div class="code-box">
          <div class="box-header">
            <span>Base64 编码</span>
            <div class="box-actions">
              <el-button link type="primary" @click="copyToClipboard(imgBase64)"
                >复制完整编码</el-button
              >
              <el-button link type="primary" @click="copyImgTag">复制 HTML 标签</el-button>
              <el-button link type="primary" @click="downloadBase64Image">下载图片</el-button>
            </div>
          </div>
          <textarea readonly class="code-viewer" :value="imgBase64"></textarea>
        </div>
      </div>
    </div>

    <footer class="footer">© 2026 LRM工具箱 - Base64 编解码</footer>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import {
    ArrowLeft,
    ArrowRight,
    Delete,
    DocumentCopy,
    CopyDocument,
    UploadFilled
  } from '@element-plus/icons-vue';

  const router = useRouter();

  const activeTab = ref('text');
  const inputText = ref('');
  const outputText = ref('');
  const imgBase64 = ref('');
  const imgSize = ref('');

  function goBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }

  function clearAll() {
    inputText.value = '';
    outputText.value = '';
    imgBase64.value = '';
    imgSize.value = '';
  }

  function encodeText() {
    if (!inputText.value) return;
    try {
      outputText.value = btoa(unescape(encodeURIComponent(inputText.value)));
      ElMessage.success('编码成功');
    } catch {
      ElMessage.error('编码失败');
    }
  }

  function decodeText() {
    if (!outputText.value) return;
    try {
      inputText.value = decodeURIComponent(escape(atob(outputText.value)));
      ElMessage.success('解码成功');
    } catch {
      ElMessage.error('无效的 Base64 字符串');
    }
  }

  function handleTextInput() {
    if (!inputText.value) {
      outputText.value = '';
    }
  }

  function handleBase64Input() {
    if (!outputText.value) {
      inputText.value = '';
    }
  }

  function handleFileChange(file) {
    const reader = new FileReader();
    reader.onload = e => {
      imgBase64.value = e.target.result;
      imgSize.value = formatSize(file.raw.size);
      ElMessage.success('图片转换成功');
    };
    reader.readAsDataURL(file.raw);
  }

  function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async function copyToClipboard(text) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      ElMessage.success('已复制到剪贴板');
    } catch {
      ElMessage.error('复制失败');
    }
  }

  function copyImgTag() {
    if (!imgBase64.value) return;
    const tag = `<img src="${imgBase64.value}" alt="base64-image" />`;
    copyToClipboard(tag);
  }

  function pasteFromClipboard() {
    navigator.clipboard
      .readText()
      .then(text => {
        inputText.value = text;
      })
      .catch(() => {
        ElMessage.error('无法读取剪贴板');
      });
  }

  function downloadBase64Image() {
    if (!imgBase64.value) return;
    const a = document.createElement('a');
    a.href = imgBase64.value;
    a.download = 'decoded-image.png';
    a.click();
  }
</script>

<style scoped>
  .tool-page {
    min-height: 100vh;
    background: #f0f4f8;
    display: flex;
    flex-direction: column;
  }

  .tool-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background: #ffffff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  .tool-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
  }

  .header-left,
  .header-right {
    width: 100px;
  }

  .header-right {
    text-align: right;
  }

  .toolbar {
    padding: 1rem 1.5rem;
    background: #ffffff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    display: flex;
    justify-content: center;
  }

  .editor-container {
    flex: 1;
    display: flex;
    padding: 1.5rem;
    gap: 1.5rem;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  .editor-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    overflow: hidden;
    height: 600px;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    background: #f8fafc;
  }

  .panel-title {
    font-size: 0.875rem;
    font-weight: 500;
    color: #1e293b;
  }

  .code-editor {
    flex: 1;
    padding: 1rem;
    border: none;
    resize: none;
    font-family: monospace;
    font-size: 0.875rem;
    line-height: 1.6;
    color: #1e293b;
    outline: none;
  }

  .code-editor.output {
    background: #f8fafc;
  }

  .action-buttons {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1rem;
  }

  .action-btn {
    display: flex;
    flex-direction: column;
    height: auto;
    padding: 0.75rem 1rem;
    gap: 0.25rem;
  }

  .btn-text {
    font-size: 0.75rem;
  }

  .image-mode-container {
    flex: 1;
    padding: 1.5rem;
    max-width: 1000px;
    margin: 0 auto;
    width: 100%;
  }

  .upload-section {
    background: #ffffff;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .result-section {
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }

  .result-info {
    display: flex;
    gap: 2rem;
    padding: 1.5rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  .preview-box {
    width: 200px;
    height: 200px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: repeating-conic-gradient(#f1f5f9 0% 25%, white 0% 50%) 50% / 20px 20px;
  }

  .img-preview {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .code-box {
    padding: 1.5rem;
  }

  .box-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  .code-viewer {
    width: 100%;
    height: 200px;
    padding: 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    resize: none;
    font-family: monospace;
    font-size: 0.875rem;
    background: #f8fafc;
  }

  @media (max-width: 768px) {
    .editor-container {
      flex-direction: column;
      height: auto;
    }

    .editor-panel {
      height: 300px;
    }

    .action-buttons {
      flex-direction: row;
    }

    .result-info {
      flex-direction: column;
      align-items: center;
    }
  }

  .footer {
    text-align: center;
    padding: 3rem 0;
    color: var(--text-secondary, #64748b);
    font-size: 0.85rem;
  }
</style>
