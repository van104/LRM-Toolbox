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
      <h1 class="tool-title">ASCII 艺术生成器</h1>
      <div class="header-right"></div>
    </header>

    <div class="tool-content">
      <div class="tabs-header">
        <button
          :class="['tab-btn', { active: currentTab === 'text' }]"
          @click="currentTab = 'text'"
        >
          🔤 文字 Banner
        </button>
        <button
          :class="['tab-btn', { active: currentTab === 'image' }]"
          @click="currentTab = 'image'"
        >
          🖼️ 图片字符画
        </button>
      </div>

      <div class="layout-container">
        <aside class="config-panel">
          <div v-if="currentTab === 'text'" class="config-group">
            <div class="input-group">
              <div class="label">输入文本</div>
              <el-input
                v-model="textConfig.input"
                type="textarea"
                :rows="3"
                placeholder="Type something..."
                @input="genTextBanner"
              />
            </div>

            <div class="config-item">
              <div class="label">字体选择</div>
              <el-select
                v-model="textConfig.font"
                placeholder="Select Font"
                @change="genTextBanner"
              >
                <el-option v-for="font in fontList" :key="font" :label="font" :value="font" />
              </el-select>
            </div>

            <div class="config-item">
              <div class="label">布局模式</div>
              <el-radio-group
                v-model="textConfig.horizontalLayout"
                size="small"
                @change="genTextBanner"
              >
                <el-radio-button label="default">默认</el-radio-button>
                <el-radio-button label="full">全宽</el-radio-button>
                <el-radio-button label="fitted">紧凑</el-radio-button>
              </el-radio-group>
            </div>
          </div>

          <div v-if="currentTab === 'image'" class="config-group">
            <div class="config-item">
              <div class="label">字符集 (Dark -> Light)</div>
              <el-select v-model="imgConfig.charset" @change="genImageAscii">
                <el-option label="标准 (Standard)" value="@%#*+=-:. " />
                <el-option
                  label="复杂 (Complex)"
                  value="$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,\^`'. "
                />
                <el-option label="简单 (Simple)" value="#+-. " />
                <el-option label="数字 (Binary)" value="10" />
              </el-select>
            </div>

            <div class="config-item">
              <div class="label">输出宽度 ({{ imgConfig.width }} chars)</div>
              <el-slider v-model="imgConfig.width" :min="20" :max="200" @change="genImageAscii" />
            </div>

            <div class="config-item">
              <el-checkbox v-model="imgConfig.inverted" @change="genImageAscii"
                >反色 (Inverted)</el-checkbox
              >
            </div>

            <div class="config-item">
              <el-button type="primary" class="full-btn" @click="triggerUpload">选择图片</el-button>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden-input"
                @change="handleFileChange"
              />
            </div>
          </div>
        </aside>

        <main class="result-panel">
          <div class="panel-header">
            <span class="panel-title">预览结果</span>
            <div class="actions">
              <el-button size="small" :disabled="!resultText" @click="copyResult">
                <el-icon>
                  <CopyDocument />
                </el-icon>
                复制
              </el-button>
            </div>
          </div>
          <div class="result-wrapper" :class="{ 'image-mode': currentTab === 'image' }">
            <pre class="ascii-output" :style="outputStyle">{{ resultText }}</pre>

            <div v-if="!resultText" class="placeholder-text">预览将在这里显示...</div>
          </div>
        </main>
      </div>

      <div class="help-section">
        <h3>
          <el-icon>
            <QuestionFilled />
          </el-icon>
          使用指南
        </h3>
        <div class="help-grid">
          <div class="help-card">
            <h4>1. 文字 Banner</h4>
            <p>将普通文本转换为大型 ASCII 艺术字/标题。</p>
            <div class="example">
              选择 <strong>Font</strong> 调整风格，支持 Ghost/3-D 等多种字体。
            </div>
          </div>
          <div class="help-card">
            <h4>2. 图片转字符画</h4>
            <p>上传图片自动转换为字符阵列。</p>
            <div class="example">
              <strong>宽度</strong>：控制输出精细度；<br />
              <strong>字符集</strong>：控制明暗对比效果。
            </div>
          </div>
          <div class="help-card">
            <h4>3. 复制结果</h4>
            <p>点击右上角复制按钮，将结果粘贴到代码注释或文档中。</p>
          </div>
        </div>
      </div>
    </div>
    <footer class="footer">© 2026 LRM工具箱 - ASCII 艺术生成</footer>
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { ArrowLeft, CopyDocument, QuestionFilled } from '@element-plus/icons-vue';
  import figlet from 'figlet';

  import standard from 'figlet/importable-fonts/Standard.js';
  import ghost from 'figlet/importable-fonts/Ghost.js';
  import graffiti from 'figlet/importable-fonts/Graffiti.js';
  import slant from 'figlet/importable-fonts/Slant.js';
  import threeD from 'figlet/importable-fonts/3-D.js';

  figlet.parseFont('Standard', standard);
  figlet.parseFont('Ghost', ghost);
  figlet.parseFont('Graffiti', graffiti);
  figlet.parseFont('Slant', slant);
  figlet.parseFont('3-D', threeD);

  const router = useRouter();
  const currentTab = ref('text');
  const resultText = ref('');

  const fontList = ['Standard', 'Ghost', 'Graffiti', 'Slant', '3-D'];
  const textConfig = reactive({
    input: 'Hello',
    font: 'Standard',
    horizontalLayout: 'default'
  });

  function genTextBanner() {
    if (!textConfig.input) {
      resultText.value = '';
      return;
    }

    figlet.text(
      textConfig.input,
      {
        font: textConfig.font,
        horizontalLayout: textConfig.horizontalLayout,
        verticalLayout: 'default',
        width: 80,
        whitespaceBreak: true
      },
      function (err, data) {
        if (err) {
          console.error('Something went wrong...', err);
          console.dir(err);
          return;
        }
        resultText.value = data;
      }
    );
  }

  onMounted(() => {
    genTextBanner();
  });

  const imgConfig = reactive({
    width: 80,
    charset: '@%#*+=-:. ',
    inverted: false,
    uploadedImage: null
  });
  const fileInput = ref(null);

  function triggerUpload() {
    fileInput.value.click();
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) processImageFile(file);
  }

  function processImageFile(file) {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      imgConfig.uploadedImage = img;
      genImageAscii();
    };
    img.src = url;
  }

  function genImageAscii() {
    if (!imgConfig.uploadedImage) return;
    const img = imgConfig.uploadedImage;
    const width = imgConfig.width;

    const height = Math.floor((img.height / img.width) * width * 0.5);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    let asciiParams = imgConfig.charset;
    if (imgConfig.inverted) asciiParams = asciiParams.split('').reverse().join('');

    let res = '';
    for (let h = 0; h < height; h++) {
      for (let w = 0; w < width; w++) {
        const idx = (h * width + w) * 4;
        const r = pixels[idx];
        const g = pixels[idx + 1];
        const b = pixels[idx + 2];
        const a = pixels[idx + 3];

        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

        const charIdx = Math.floor((brightness / 255) * (asciiParams.length - 1));

        if (a < 50) res += ' ';
        else res += asciiParams[charIdx];
      }
      res += '\n';
    }
    resultText.value = res;
  }

  const outputStyle = computed(() => {
    if (currentTab.value === 'image') {
      return {
        fontSize: '8px',
        lineHeight: '8px',
        letterSpacing: '0px'
      };
    }
    return {
      fontSize: '12px',
      lineHeight: '1.2'
    };
  });

  function copyResult() {
    if (!resultText.value) return;
    navigator.clipboard.writeText(resultText.value).then(() => ElMessage.success('已复制'));
  }

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push('/');
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
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #ffffff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  .tool-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
  }

  .tool-content {
    flex: 1;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .tabs-header {
    display: flex;
    background: #ffffff;
    border-radius: 12px;
    padding: 0.5rem;
    gap: 0.5rem;
    border: 1px solid rgba(0, 0, 0, 0.05);
    width: fit-content;
    margin: 0 auto;
  }

  .tab-btn {
    padding: 0.6rem 2rem;
    border: none;
    background: transparent;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    color: #64748b;
    transition: all 0.2s;
  }

  .tab-btn.active {
    background: #e2e8f0;
    color: #0f172a;
  }

  .layout-container {
    display: flex;
    gap: 1.5rem;
    height: 600px;
    min-height: 500px;
  }

  .config-panel {
    width: 350px;
    background: #ffffff;
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
  }

  .config-group {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .config-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
  }

  .label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #64748b;
  }

  .hidden-input {
    display: none;
  }

  .full-btn {
    width: 100%;
  }

  .result-panel {
    flex: 1;
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .panel-header {
    padding: 0.8rem 1.2rem;
    background: #f8fafc;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .panel-title {
    font-weight: 600;
    color: #1e293b;
  }

  .result-wrapper {
    flex: 1;
    padding: 1.5rem;
    overflow: auto;
    background: #1e1e1e;

    color: #00ff00;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .ascii-output {
    font-family: 'Courier New', monospace;
    white-space: pre;
    text-align: left;
    margin: 0;
  }

  .placeholder-text {
    color: #555;
  }

  @media (prefers-color-scheme: dark) {
    .tool-page {
      background: #111827;
    }

    .tool-header,
    .footer {
      background: #1f2937;
      border-color: #374151;
      color: #f3f4f6;
    }

    .tool-title {
      color: #f3f4f6;
    }

    .config-panel,
    .result-panel {
      background: #1f2937;
      border-color: #374151;
    }

    .tabs-header {
      background: #374151;
      border-color: #4b5563;
    }

    .tab-btn.active {
      background: #1f2937;
      color: white;
    }

    .tab-btn {
      color: #9ca3af;
    }

    .panel-header {
      background: #374151;
      border-color: #4b5563;
    }

    .label {
      color: #cbd5e1;
    }

    .panel-title {
      color: white;
    }
  }

  @media (max-width: 800px) {
    .layout-container {
      flex-direction: column;
      height: auto;
    }

    .config-panel {
      width: 100%;
    }

    .result-panel {
      min-height: 400px;
    }
  }

  .help-section {
    margin-top: 2rem;
    background: #fff;
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid rgba(0, 0, 0, 0.08);
  }

  .help-section h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #334155;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .help-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .help-card h4 {
    font-weight: 600;
    color: #475569;
    margin-bottom: 0.5rem;
    font-size: 0.95rem;
  }

  .help-card p {
    font-size: 0.85rem;
    color: #64748b;
    line-height: 1.5;
    margin-bottom: 0.5rem;
  }

  .help-card .example {
    background: #f8fafc;
    padding: 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    color: #334155;
    border: 1px solid #e2e8f0;
    font-family: monospace;
  }

  @media (prefers-color-scheme: dark) {
    .help-section {
      background: #1f2937;
      border-color: #374151;
    }

    .help-section h3 {
      color: #f3f4f6;
    }

    .help-card h4 {
      color: #e2e8f0;
    }

    .help-card p {
      color: #94a3b8;
    }

    .help-card .example {
      background: #374151;
      border-color: #4b5563;
      color: #cbd5e1;
    }
  }

  .footer {
    text-align: center;
    padding: 1rem 0;
    color: var(--text-secondary, #64748b);
    font-size: 0.85rem;
  }
</style>
