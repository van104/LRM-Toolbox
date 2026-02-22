<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">中英文排版美化</h1>
        <span class="tool-subtitle">Copywriting Guide</span>
      </div>
      <div class="header-right">
        <!-- Placeholder -->
      </div>
    </header>

    <main class="tool-content">
      <div class="main-container">
        <div class="grid-layout">
          <div class="input-section">
            <div class="section-header">
              <h3>原始文本</h3>
              <el-button link type="primary" @click="pasteText">粘贴</el-button>
            </div>
            <el-input
              v-model="inputText"
              type="textarea"
              :rows="15"
              placeholder="请输入或粘贴混乱排版的文本..."
              resize="none"
            />
          </div>

          <div class="control-section">
            <el-button type="primary" circle size="large" @click="processText">
              <el-icon><Right /></el-icon>
            </el-button>
          </div>

          <div class="output-section">
            <div class="section-header">
              <h3>美化结果</h3>
              <el-button link type="primary" :disabled="!outputText" @click="copyResult"
                >复制</el-button
              >
            </div>
            <el-input
              v-model="outputText"
              type="textarea"
              :rows="15"
              readonly
              resize="none"
              placeholder="结果将显示在这里..."
            />
          </div>
        </div>

        <div class="options-bar mt-4">
          <el-checkbox v-model="addSpaces" label="中英文间添加空格" />
          <el-checkbox v-model="fixPunctuation" label="修正全角/半角标点" />
          <el-checkbox v-model="trimLines" label="去除首尾空格" />
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 中英文排版美化</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { ArrowLeft, Right } from '@element-plus/icons-vue';
  import { useCopy } from '@/composables/useCopy';
  import { ElMessage } from 'element-plus';

  const inputText = ref('');
  const outputText = ref('');
  const addSpaces = ref(true);
  const fixPunctuation = ref(true);
  const trimLines = ref(true);

  const { copyToClipboard } = useCopy();

  const pasteText = async () => {
    try {
      const text = await navigator.clipboard.readText();
      inputText.value = text;
    } catch {
      ElMessage.error('无法访问剪贴板');
    }
  };

  const processText = () => {
    if (!inputText.value) return;

    let text = inputText.value;

    if (trimLines.value) {
      text = text
        .split('\n')
        .map(line => line.trim())
        .join('\n');
    }

    if (addSpaces.value) {
      // Add space between Chinese and English/Number
      text = text.replace(/([\u4e00-\u9fa5])([a-zA-Z0-9])/g, '$1 $2');
      text = text.replace(/([a-zA-Z0-9])([\u4e00-\u9fa5])/g, '$1 $2');
    }

    if (fixPunctuation.value) {
      // Convert common half-width punctuation to full-width in Chinese context
      // This is a simplified heuristic
      text = text
        .replace(/,/g, '，')
        .replace(/\?/g, '？')
        .replace(/!/g, '！')
        .replace(/:/g, '：')
        .replace(/;/g, '；')
        .replace(/\(/g, '（')
        .replace(/\)/g, '）');

      // Fix: Space after full-width punctuation is usually not needed
      text = text.replace(/([，。？！：；（）])\s+/g, '$1');
    }

    outputText.value = text;
    ElMessage.success('排版美化完成');
  };

  const copyResult = () => {
    copyToClipboard(outputText.value);
  };
</script>

<style scoped>
  .tool-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: var(--el-bg-color-page);
  }

  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-left,
  .header-right {
    width: 140px;
  }

  .header-center {
    text-align: center;
    flex: 1;
  }

  .tool-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }

  .tool-subtitle {
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
  }

  .tool-content {
    flex: 1;
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    width: 100%;
    box-sizing: border-box;
  }

  .main-container {
    background: #fff;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .grid-layout {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .input-section,
  .output-section {
    flex: 1;
  }

  .control-section {
    display: flex;
    justify-content: center;
    padding: 0 1rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .section-header h3 {
    font-size: 1rem;
    color: var(--el-text-color-primary);
    margin: 0;
  }

  .mt-4 {
    margin-top: 1rem;
  }

  .options-bar {
    display: flex;
    gap: 1.5rem;
    justify-content: center;
    padding-top: 1rem;
    border-top: 1px solid var(--el-border-color-light);
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }

  @media (max-width: 768px) {
    .grid-layout {
      flex-direction: column;
    }

    .control-section {
      transform: rotate(90deg);
      padding: 1rem 0;
    }
  }
</style>
