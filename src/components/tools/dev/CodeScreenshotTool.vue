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
        <h1 class="tool-title">代码截图美化</h1>
        <span class="tool-subtitle">Code Screenshot beautifier</span>
      </div>
      <div class="header-right">
        <el-button :loading="exporting" type="primary" @click="exportImage">
          <el-icon><Download /></el-icon> 导出图片
        </el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="tool-layout">
        <!-- 左侧配置 -->
        <div class="tool-sidebar">
          <div class="panel glass-card">
            <h2 class="panel-title">
              <el-icon><Setting /></el-icon> 外观设置
            </h2>

            <div class="config-item">
              <label class="section-label">主题风格</label>
              <el-select v-model="theme" class="w-full">
                <el-option v-for="t in themes" :key="t.id" :label="t.name" :value="t.id" />
              </el-select>
            </div>

            <div class="config-item">
              <label class="section-label">背景颜色</label>
              <div class="bg-presets">
                <button
                  v-for="bg in bgPresets"
                  :key="bg"
                  class="bg-dot"
                  :style="{ background: bg }"
                  :class="{ active: bgColor === bg }"
                  @click="bgColor = bg"
                ></button>
                <el-color-picker v-model="bgColor" show-alpha size="small" />
              </div>
            </div>

            <div class="config-item">
              <div class="label-row">
                <label class="section-label">内边距 (Padding)</label>
                <span class="value-display">{{ padding }}px</span>
              </div>
              <el-slider v-model="padding" :min="10" :max="100" />
            </div>

            <div class="config-item">
              <label class="section-label">窗口控件</label>
              <div class="option-row">
                <span>显示关闭/最小化按钮</span>
                <el-switch v-model="showDots" />
              </div>
            </div>

            <div class="config-item">
              <label class="section-label">阴影强度</label>
              <el-slider v-model="shadowIntensity" :min="0" :max="1" :step="0.1" />
            </div>
          </div>

          <div class="panel glass-card mt-6">
            <h2 class="panel-title">
              <el-icon><EditPen /></el-icon> 内容编辑
            </h2>
            <div class="config-item">
              <label class="section-label">编程语言</label>
              <el-select v-model="language" class="w-full">
                <el-option v-for="l in languages" :key="l" :label="l" :value="l" />
              </el-select>
            </div>
            <el-input
              v-model="codeText"
              type="textarea"
              :rows="12"
              placeholder="在此粘贴代码..."
              class="code-input-area"
            />
          </div>
        </div>

        <!-- 右侧预览 -->
        <div class="tool-main">
          <div class="preview-stage">
            <div
              ref="captureRef"
              class="screenshot-canvas"
              :style="{
                background: bgColor,
                padding: `${padding}px`
              }"
            >
              <div
                class="code-window"
                :class="theme"
                :style="{
                  boxShadow: `0 20px 50px rgba(0,0,0, ${shadowIntensity * 0.3})`
                }"
              >
                <!-- 窗口头部 -->
                <div class="window-header">
                  <div v-if="showDots" class="window-dots">
                    <span class="dot red"></span>
                    <span class="dot yellow"></span>
                    <span class="dot green"></span>
                  </div>
                  <div class="window-title">
                    <el-input
                      v-model="fileName"
                      variant="plain"
                      placeholder="index.js"
                      class="title-input"
                    />
                  </div>
                  <div class="window-spacer"></div>
                </div>

                <!-- 代码区域 -->
                <div class="window-body">
                  <pre :class="`language-${language.toLowerCase()}`">
                    <!-- eslint-disable-next-line vue/no-v-html -->
                    <code v-html="highlightedCode"></code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - 代码截图美化</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { ArrowLeft, Download, Setting, EditPen } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';
  import html2canvas from 'html2canvas';

  const exporting = ref(false);
  const captureRef = ref<HTMLElement | null>(null);

  const theme = ref('dracula');
  const themes = [
    { id: 'dracula', name: 'Dracula (暗色)' },
    { id: 'one-light', name: 'One Light (亮色)' },
    { id: 'monokai', name: 'Monokai' },
    { id: 'night-owl', name: 'Night Owl' }
  ];

  const bgColor = ref('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
  const bgPresets = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    '#2d3436',
    '#f8fafc'
  ];

  const padding = ref(50);
  const showDots = ref(true);
  const shadowIntensity = ref(0.6);
  const fileName = ref('Untitled-1.js');
  const language = ref('JavaScript');
  const languages = ['JavaScript', 'TypeScript', 'HTML', 'CSS', 'Python', 'Go', 'JSON', 'Markdown'];

  const initialCode = `function helloWorld() {
  console.log("Hello, LRM Toolbox!");
  
  const features = [
    "High Resolution",
    "Multiple Themes",
    "Custom Backgrounds"
  ];
  
  return features.length;
}`;

  const codeText = ref(initialCode);

  const languageTemplates: Record<string, string> = {
    JavaScript: `function helloWorld() {
  console.log("Hello, LRM Toolbox!");
  const status = "success";
  return status;
}`,
    TypeScript: `interface User {
  id: number;
  name: string;
}

const getUser = (id: number): User => {
  return { id, name: "LRM User" };
};`,
    HTML: `<!DOCTYPE html>
<html>
  <head>
    <title>LRM Toolbox</title>
  </head>
  <body>
    <h1>Hello World</h1>
  </body>
</html>`,
    CSS: `.tool-card {
  background: glass;
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}`,
    Python: `def hello_world():
    message = "Hello, LRM Toolbox!"
    print(message)
    return True`,
    Go:
      `package main

` +
      `import "fmt"

func main() {
    fmt.Println("Hello, LRM Toolbox!")
}`,
    JSON: `{
  "name": "lrm-toolbox",
  "version": "1.0.0",
  "private": true
}`,
    Markdown: `# LRM Toolbox
Efficient and convenient developer tools collection.
- High Resolution
- Multiple Themes`
  };

  // 简单的语法高亮实现 (仅演示效果，实际开发中建议集成 PrismJS)
  const highlightedCode = computed(() => {
    let code = codeText.value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // 基础高亮逻辑
    const keywords =
      /\b(function|const|let|var|return|if|else|for|while|import|export|from|class|extends|new|true|false|def|package|import|func|interface|type)\b/g;
    const strings = /(['"`])(.*?)\1/g;
    const comments = /\/\/.*/g;
    const numbers = /\b\d+\b/g;

    code = code.replace(keywords, '<span class="token-keyword">$1</span>');
    code = code.replace(strings, '<span class="token-string">$1$2$1</span>');
    code = code.replace(numbers, '<span class="token-number">$1</span>');
    code = code.replace(comments, '<span class="token-comment">$0</span>');

    return code;
  });

  const exportImage = async () => {
    if (!captureRef.value) return;

    exporting.value = true;
    try {
      const canvas = await html2canvas(captureRef.value, {
        scale: 2, // 高清导出
        useCORS: true,
        backgroundColor: null,
        logging: false
      });

      const link = document.createElement('a');
      link.download = `code-snippet-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      ElMessage.success('导出成功');
    } catch (err) {
      console.error(err);
      ElMessage.error('导出失败，请重试');
    } finally {
      exporting.value = false;
    }
  };

  // 监听语言变化，切换对应的初始代码模版
  watch(language, newLang => {
    if (languageTemplates[newLang]) {
      codeText.value = languageTemplates[newLang];

      // 自动更新文件名后缀
      const extMap: Record<string, string> = {
        JavaScript: 'js',
        TypeScript: 'ts',
        HTML: 'html',
        CSS: 'css',
        Python: 'py',
        Go: 'go',
        JSON: 'json',
        Markdown: 'md'
      };
      const currentFileName = fileName.value.split('.')[0] || 'index';
      fileName.value = `${currentFileName}.${extMap[newLang] || 'txt'}`;
    }
  });

  // 监听内容变化和主题变化，确保预览同步
  watch([codeText, theme], () => {
    // 基础同步
  });
</script>

<style scoped>
  /* 基础 Token 配色 (Dracula 风格) */
  .dracula :deep(.token-keyword) {
    color: #ff79c6;
  }
  .dracula :deep(.token-string) {
    color: #f1fa8c;
  }
  .dracula :deep(.token-comment) {
    color: #6272a4;
    font-style: italic;
  }
  .dracula :deep(.token-number) {
    color: #bd93f9;
  }

  /* One Light 风格 */
  .one-light :deep(.token-keyword) {
    color: #a626a4;
  }
  .one-light :deep(.token-string) {
    color: #50a14f;
  }
  .one-light :deep(.token-comment) {
    color: #a0a1a7;
    font-style: italic;
  }
  .one-light :deep(.token-number) {
    color: #986801;
  }

  /* Monokai 风格 */
  .monokai :deep(.token-keyword) {
    color: #f92672;
  }
  .monokai :deep(.token-string) {
    color: #e6db74;
  }
  .monokai :deep(.token-comment) {
    color: #75715e;
    font-style: italic;
  }
  .monokai :deep(.token-number) {
    color: #ae81ff;
  }

  /* Night Owl 风格 */
  .night-owl :deep(.token-keyword) {
    color: #c792ea;
  }
  .night-owl :deep(.token-string) {
    color: #ecc48d;
  }
  .night-owl :deep(.token-comment) {
    color: #637777;
    font-style: italic;
  }
  .night-owl :deep(.token-number) {
    color: #f78c6c;
  }

  .tool-page {
    min-height: 100vh;
    background: #f1f5f9;
    display: flex;
    flex-direction: column;
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

  .header-right {
    display: flex;
    justify-content: flex-end;
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
    padding: 1.5rem;
    max-width: 1280px;
    margin: 0 auto;
    width: 100%;
  }

  .tool-layout {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  @media (min-width: 1024px) {
    .tool-layout {
      display: grid;
      grid-template-columns: 340px 1fr;
      gap: 1.5rem;
      align-items: start;
    }
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    padding: 24px;
  }

  .panel-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .config-item {
    margin-bottom: 20px;
  }

  .section-label {
    display: block;
    font-size: 0.8rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 8px;
  }

  .bg-presets {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
  }

  .bg-dot {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid white;
    cursor: pointer;
    box-shadow: 0 0 0 1px #e2e8f0;
    padding: 0;
  }

  .bg-dot.active {
    box-shadow: 0 0 0 2px var(--el-color-primary);
  }

  .option-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9rem;
    color: #475569;
  }

  .label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .value-display {
    font-size: 0.85rem;
    font-family: monospace;
    color: var(--el-color-primary);
  }

  .code-input-area :deep(.el-textarea__inner) {
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 0.85rem;
    background: #f8fafc;
    border-color: #e2e8f0;
  }

  /* 预览舞台 */
  .preview-stage {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 2rem;
    min-height: 600px;
  }

  .screenshot-canvas {
    transition: all 0.3s ease;
    border-radius: 4px;
    height: auto;
    min-width: 400px;
    max-width: 100%;
  }

  .code-window {
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: box-shadow 0.3s ease;
  }

  .window-header {
    height: 44px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 16px;
  }

  .window-dots {
    display: flex;
    gap: 8px;
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  .dot.red {
    background: #ff5f56;
  }
  .dot.yellow {
    background: #ffbd2e;
  }
  .dot.green {
    background: #27c93f;
  }

  .window-title {
    flex: 1;
    text-align: center;
  }

  .title-input :deep(.el-input__wrapper) {
    background: transparent !important;
    box-shadow: none !important;
    text-align: center;
  }

  .title-input :deep(.el-input__inner) {
    text-align: center;
    font-size: 0.85rem;
    opacity: 0.6;
  }

  .window-body {
    padding: 1.5rem;
    font-family: 'Fira Code', 'Consolas', monospace;
    font-size: 1rem;
    line-height: 1.6;
  }

  .window-body pre {
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  /* 主题实现 */
  .dracula {
    background: #282a36;
  }
  .dracula .window-header {
    background: #343746;
  }
  .dracula .window-body {
    color: #f8f8f2;
  }
  .dracula .title-input :deep(.el-input__inner) {
    color: #f8f8f2;
  }

  .one-light {
    background: #fafafa;
    border: 1px solid #e0e0e0;
  }
  .one-light .window-header {
    background: #f0f0f0;
    border-bottom: 1px solid #e0e0e0;
  }
  .one-light .window-body {
    color: #383a42;
  }
  .one-light .title-input :deep(.el-input__inner) {
    color: #383a42;
  }

  .monokai {
    background: #272822;
  }
  .monokai .window-header {
    background: #383933;
  }
  .monokai .window-body {
    color: #f8f8f2;
  }
  .monokai .title-input :deep(.el-input__inner) {
    color: #f8f8f2;
  }

  .night-owl {
    background: #011627;
  }
  .night-owl .window-header {
    background: #0b2942;
  }
  .night-owl .window-body {
    color: #d6deeb;
  }
  .night-owl .title-input :deep(.el-input__inner) {
    color: #d6deeb;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }

  .mt-6 {
    margin-top: 1.5rem;
  }
  .w-full {
    width: 100%;
  }
</style>
