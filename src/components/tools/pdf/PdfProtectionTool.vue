<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">PDF<span>.密码防护()</span></h1>
        <button v-if="pdfFile" class="brutal-btn clear-btn" @click="clearFile">清除文件</button>
      </header>

      <div class="brutal-toolbar">
        <div class="tools-left">
          <button
            class="brutal-action-btn"
            :class="{ primary: activeTab === 'encrypt' }"
            @click="activeTab = 'encrypt'"
          >
            🔒 加密保护
          </button>
          <button
            class="brutal-action-btn"
            :class="{ primary: activeTab === 'decrypt' }"
            @click="activeTab = 'decrypt'"
          >
            🔓 移除密码
          </button>
        </div>
      </div>

      <div class="brutal-grid" style="grid-template-columns: 1fr">
        <div class="brutal-pane">
          <div class="pane-header" :class="activeTab === 'encrypt' ? 'bg-yellow' : 'bg-blue'">
            <span :class="activeTab === 'encrypt' ? 'text-black' : 'text-white'">{{
              activeTab === 'encrypt' ? '加密保护模式' : '密码移除模式'
            }}</span>
          </div>

          <div class="pane-body">
            <!-- Upload Area -->
            <div v-if="!pdfFile" class="brutal-upload-area" @click="triggerUpload">
              <div class="upload-text">
                <h3>
                  [
                  {{ activeTab === 'encrypt' ? '选择 PDF 进行加密' : '选择 PDF 移除密码' }}
                  ]
                </h3>
                <p>
                  {{
                    activeTab === 'encrypt'
                      ? '支持设置打开密码和权限密码'
                      : '输入正确的密码后可移除保护'
                  }}
                </p>
              </div>
            </div>

            <!-- File loaded -->
            <div v-else>
              <div class="file-badge">
                <strong>{{ pdfFile.name }}</strong>
                <span>({{ (pdfFile.size / 1024 / 1024).toFixed(2) }} MB)</span>
              </div>

              <!-- Encrypt Tab -->
              <div v-if="activeTab === 'encrypt'" class="form-section">
                <div class="param-box">
                  <div class="form-item">
                    <label>打开密码 (User Password) <span class="tag-required">必填</span></label>
                    <input
                      v-model="encryptConfig.userPassword"
                      type="password"
                      class="brutal-input"
                      placeholder="设置文件打开密码"
                    />
                  </div>
                  <div class="form-item">
                    <label>权限密码 (Owner Password)</label>
                    <input
                      v-model="encryptConfig.ownerPassword"
                      type="password"
                      class="brutal-input"
                      placeholder="可选，用于限制编辑/打印权限"
                    />
                  </div>
                </div>

                <div class="info-box">
                  <strong>🔒 安全说明</strong>
                  <ul>
                    <li><b>本地处理</b>：文件仅在您的浏览器中处理，不会上传到服务器</li>
                    <li><b>加密算法</b>：使用 RC4 128-bit 加密（PDF 标准）</li>
                    <li><b>密码建议</b>：建议使用 8 位以上包含字母和数字的强密码</li>
                  </ul>
                </div>

                <button
                  class="brutal-action-btn primary large"
                  :disabled="!encryptConfig.userPassword || processing"
                  @click="handleEncrypt"
                >
                  {{ processing ? 'ENCRYPTING...' : 'COMMIT.加密并下载' }}
                </button>
              </div>

              <!-- Decrypt Tab -->
              <div v-if="activeTab === 'decrypt'" class="form-section">
                <div class="param-box">
                  <div class="form-item">
                    <label>当前密码</label>
                    <input
                      v-model="decryptPassword"
                      type="password"
                      class="brutal-input"
                      placeholder="输入当前打开密码以解锁"
                    />
                  </div>
                </div>

                <div class="info-box warn">
                  <strong>⚠️ 注意事项</strong>
                  <ul>
                    <li>移除密码后，PDF 中的<b>文本将转为图片</b></li>
                    <li>仅在您拥有合法访问权限时使用此功能</li>
                    <li>处理完全在本地进行，密码不会被记录</li>
                  </ul>
                </div>

                <button
                  class="brutal-action-btn primary large"
                  :disabled="processing"
                  @click="handleDecrypt"
                >
                  {{ processing ? 'DECRYPTING...' : 'COMMIT.移除密码并下载' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <input ref="fileInput" type="file" hidden accept=".pdf" @change="handleFileSelect" />
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { PDFDocument } from 'pdf-lib';
  import { encryptPDF } from '@pdfsmaller/pdf-encrypt-lite';
  import { ElMessage } from 'element-plus';
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
      if (result.file.type !== 'application/pdf') {
        return ElMessage.error('请上传 PDF 文件');
      }
      pdfFile.value = result.file;
      loadPdf(result.file);
    }
  });

  const activeTab = ref('encrypt');
  const pdfFile = ref(null);
  const pdfBytes = ref(null);
  const processing = ref(false);

  const encryptConfig = reactive({
    userPassword: '',
    ownerPassword: ''
  });

  const decryptPassword = ref('');

  const triggerUpload = () => triggerFileInput();
  const clearFile = () => {
    pdfFile.value = null;
    pdfBytes.value = null;
    decryptPassword.value = '';
    encryptConfig.userPassword = '';
    encryptConfig.ownerPassword = '';
  };

  const loadPdf = async file => {
    const buffer = await file.arrayBuffer();
    pdfBytes.value = new Uint8Array(buffer);
  };

  const handleEncrypt = async () => {
    if (!encryptConfig.userPassword) {
      return ElMessage.warning('请设置打开密码');
    }

    processing.value = true;
    try {
      const encryptedBytes = await encryptPDF(
        pdfBytes.value,
        encryptConfig.userPassword,
        encryptConfig.ownerPassword || encryptConfig.userPassword
      );

      downloadFile(encryptedBytes, `encrypted_${pdfFile.value.name}`);
      ElMessage.success('加密成功！打开此 PDF 需要输入密码。');
    } catch (e) {
      console.error(e);
      ElMessage.error('加密失败: ' + e.message);
    } finally {
      processing.value = false;
    }
  };

  const handleDecrypt = async () => {
    if (!decryptPassword.value) return ElMessage.warning('请输入当前密码');

    processing.value = true;
    try {
      const pdfjsLib = (await import('@/utils/pdf')).default;

      const loadingTask = pdfjsLib.getDocument({
        data: pdfBytes.value,
        password: decryptPassword.value
      });

      const pdfDocProxy = await loadingTask.promise;

      const newPdfDoc = await PDFDocument.create();
      const numPages = pdfDocProxy.numPages;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDocProxy.getPage(i);
        const viewport = page.getViewport({ scale: 2 });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;

        const imgDataUrl = canvas.toDataURL('image/jpeg', 0.92);
        const imgBytes = await fetch(imgDataUrl).then(r => r.arrayBuffer());
        const jpgImage = await newPdfDoc.embedJpg(imgBytes);

        const origViewport = page.getViewport({ scale: 1 });
        const newPage = newPdfDoc.addPage([origViewport.width, origViewport.height]);
        newPage.drawImage(jpgImage, {
          x: 0,
          y: 0,
          width: origViewport.width,
          height: origViewport.height
        });
      }

      const unlockedBytes = await newPdfDoc.save();
      downloadFile(unlockedBytes, `unlocked_${pdfFile.value.name}`);
      ElMessage.success('密码移除成功！(注意：文本已转为图片)');
    } catch (e) {
      console.error(e);
      if (e.name === 'PasswordException' || (e.message && e.message.includes('password'))) {
        ElMessage.error('密码错误，请重试');
      } else {
        ElMessage.error('解锁失败: ' + e.message);
      }
    } finally {
      processing.value = false;
    }
  };

  const downloadFile = (data, filename) => {
    const blob = new Blob([data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
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

  .brutal-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    border: 4px solid #111;
    padding: 1.5rem;
    margin-bottom: 2.5rem;
    box-shadow: 8px 8px 0px #111;
  }
  .tools-left {
    display: flex;
    gap: 1.5rem;
  }

  .brutal-action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.6rem 2rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
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
  .brutal-action-btn.large {
    padding: 1.25rem 3rem;
    font-size: 1.25rem;
    letter-spacing: 1px;
    width: 100%;
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
    transition: transform 0.2s;
  }
  .brutal-pane:hover {
    transform: translate(-4px, -4px);
    box-shadow: 16px 16px 0px #111;
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
  .text-white {
    color: #fff;
  }
  .text-black {
    color: #111;
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
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.95rem;
    color: #555;
  }

  .file-badge {
    background: #fff;
    border: 3px solid #111;
    padding: 0.75rem 1.5rem;
    box-shadow: 4px 4px 0px #111;
    margin-bottom: 2rem;
    font-family: 'IBM Plex Mono', monospace;
    word-break: break-all;
  }
  .file-badge strong {
    font-size: 1.1rem;
  }
  .file-badge span {
    color: #666;
    margin-left: 0.5rem;
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  .param-box {
    border: 4px dashed #111;
    padding: 1.5rem;
    background: #fafafa;
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
    font-family: 'IBM Plex Mono', monospace;
  }
  .tag-required {
    background: #ff4b4b;
    color: #fff;
    font-size: 0.75rem;
    padding: 0.1rem 0.4rem;
    border: 2px solid #111;
    font-family: 'Syne', sans-serif;
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

  .info-box {
    border: 4px solid #111;
    padding: 1.5rem;
    background: #e8ffe8;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.9rem;
  }
  .info-box.warn {
    background: #fff8e0;
  }
  .info-box strong {
    font-family: 'Syne', sans-serif;
    font-size: 1.1rem;
    display: block;
    margin-bottom: 0.75rem;
  }
  .info-box ul {
    margin: 0;
    padding-left: 1.2rem;
    line-height: 1.8;
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
    .brutal-toolbar {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
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
  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-toolbar,
  [data-theme='dark'] .brutal-upload-area,
  [data-theme='dark'] .param-box,
  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .file-badge {
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
  [data-theme='dark'] .brutal-toolbar {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn {
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:hover:not(:disabled) {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:active:not(:disabled) {
    box-shadow: 0px 0px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane:hover {
    box-shadow: 16px 16px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-input:focus {
    box-shadow: 6px 6px 0px #4b7bff;
    border-color: #4b7bff;
  }
  [data-theme='dark'] .brutal-action-btn.primary {
    background: #b28f00;
    color: #fff;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-btn.clear-btn {
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
  [data-theme='dark'] .pane-body {
    background: #1a1a1a;
  }
  [data-theme='dark'] .info-box {
    background: #1a2a1a;
    border-color: #eee;
  }
  [data-theme='dark'] .info-box.warn {
    background: #2a2a1a;
  }
  [data-theme='dark'] .file-badge {
    box-shadow: 4px 4px 0px #eee;
  }
</style>
