<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">代码<span>截图()</span></h1>
        <div class="badge">📸 Code Beautifier</div>
      </header>

      <main class="brutal-grid">
        <!-- Configuration Sidebar -->
        <aside class="config-sidebar">
          <!-- Appearance -->
          <div class="brutal-pane">
            <div class="pane-header bg-yellow">
              <span>🎨 外观设置 (THEME)</span>
            </div>
            <div class="pane-body">
              <div class="config-group">
                <label class="brutal-label">主题风格</label>
                <select v-model="theme" class="brutal-select w-full">
                  <option v-for="t in themes" :key="t.id" :value="t.id">{{ t.name }}</option>
                </select>
              </div>

              <div class="config-group">
                <label class="brutal-label">背景画板 (Background)</label>
                <div class="bg-presets">
                  <button
                    v-for="(bg, idx) in bgPresets"
                    :key="idx"
                    class="bg-dot"
                    :style="{ background: bg }"
                    :class="{ active: bgColor === bg }"
                    @click="bgColor = bg"
                  ></button>
                  <label class="custom-color-btn" title="自定义纯色">
                    <input v-model="bgColor" type="color" class="color-picker-hidden" />
                    +
                  </label>
                </div>
              </div>

              <div class="config-group">
                <div class="slider-header">
                  <label class="brutal-label">内边距 (Padding)</label>
                  <span class="slider-val">{{ padding }}px</span>
                </div>
                <input
                  v-model.number="padding"
                  type="range"
                  min="10"
                  max="100"
                  class="brutal-range"
                />
              </div>

              <div class="config-group">
                <div class="slider-header">
                  <label class="brutal-label">阴影强度 (Shadow)</label>
                  <span class="slider-val">{{ shadowIntensity }}</span>
                </div>
                <input
                  v-model.number="shadowIntensity"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  class="brutal-range"
                />
              </div>

              <div class="config-group">
                <label class="brutal-switch-row">
                  <span class="brutal-label mb-0">显示关闭/最小化按钮</span>
                  <label class="brutal-switch">
                    <input v-model="showDots" type="checkbox" />
                    <span class="slider"></span>
                  </label>
                </label>
              </div>
            </div>
          </div>

          <!-- Content Editor -->
          <div class="brutal-pane mt-6">
            <div class="pane-header bg-blue">
              <span class="text-white">✍️ 内容编辑 (EDITOR)</span>
            </div>
            <div class="pane-body">
              <div class="config-group">
                <label class="brutal-label">编程语言</label>
                <select v-model="language" class="brutal-select w-full">
                  <option v-for="l in languages" :key="l" :value="l">{{ l }}</option>
                </select>
              </div>
              <textarea
                v-model="codeText"
                class="brutal-editor code-input-area"
                placeholder="在此粘贴代码..."
                spellcheck="false"
              ></textarea>
            </div>
          </div>
        </aside>

        <!-- Preview Stage -->
        <div class="preview-main">
          <div class="brutal-pane preview-sticky-pane">
            <div class="pane-header bg-pink">
              <span class="text-white">👁️ 预览舞台 (STAGE)</span>
              <button
                class="brutal-action-btn small-btn"
                :disabled="exporting"
                @click="exportImage"
              >
                <span v-if="exporting">⚪ 导出中...</span>
                <span v-else>💾 导出图片</span>
              </button>
            </div>

            <div class="preview-stage-wrap">
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
                    boxShadow: `10px 10px 0px rgba(0,0,0, ${shadowIntensity}), 0 20px 50px rgba(0,0,0, ${shadowIntensity * 0.4})`
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
                      <input
                        v-model="fileName"
                        type="text"
                        placeholder="index.js"
                        class="title-input-plain"
                      />
                    </div>
                    <div v-if="showDots" class="window-spacer"></div>
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
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { ElMessage } from 'element-plus';
  import html2canvas from 'html2canvas';

  const exporting = ref(false);
  const captureRef = ref<HTMLElement | null>(null);

  const theme = ref('dracula');
  const themes = [
    { id: 'dracula', name: '🧛 Dracula (暗色)' },
    { id: 'one-light', name: '☀️ One Light (亮色)' },
    { id: 'monokai', name: '🎨 Monokai' },
    { id: 'night-owl', name: '🦉 Night Owl' }
  ];

  const bgColor = ref('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
  const bgPresets = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    '#2d3436',
    '#f8fafc',
    '#ffd900'
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
    Go: `package main

import "fmt"

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
      ElMessage.success('成功保存精美截图！');
    } catch (err) {
      console.error(err);
      ElMessage.error('导出失败，请重试');
    } finally {
      exporting.value = false;
    }
  };

  watch(language, newLang => {
    if (languageTemplates[newLang]) {
      codeText.value = languageTemplates[newLang];

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
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Syne:wght@700;800;900&family=Noto+Sans+SC:wght@400;700;900&display=swap');

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

  /* Neobrutalism Global */
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
    gap: 2rem;
  }

  /* Header */
  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.5rem;
    font-weight: 900;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #ff7be5;
  }
  .brutal-title span {
    color: #ff7be5;
    text-shadow: 4px 4px 0px #111;
    letter-spacing: 0;
  }

  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.1rem;
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
    opacity: 0.6;
    cursor: wait;
  }

  .badge {
    background: #111;
    color: #ff7be5;
    padding: 0.5rem 1.2rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    border: 4px solid #ff7be5;
    box-shadow: 5px 5px 0px #ff7be5;
  }

  /* Main Grid */
  .brutal-grid {
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: 2.5rem;
    align-items: start;
  }

  .config-sidebar {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .brutal-pane {
    border: 4px solid #111;
    background: #fff;
    box-shadow: 10px 10px 0px #111;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .pane-header {
    padding: 1rem 1.2rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .bg-yellow {
    background: #ffd900;
  }
  .bg-blue {
    background: #0ea5e9;
  }
  .bg-pink {
    background: #ff7be5;
  }
  .text-white {
    color: #fff;
  }

  .pane-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* Controls */
  .config-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .brutal-label {
    font-weight: 800;
    font-size: 0.95rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .mb-0 {
    margin-bottom: 0;
  }
  .w-full {
    width: 100%;
    box-sizing: border-box;
  }

  .brutal-select {
    appearance: none;
    border: 3px solid #111;
    padding: 0.6rem 1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    background: #fdfae5;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    outline: none;
    transition: all 0.1s;
  }
  .brutal-select:focus {
    background: #fff;
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  /* Range */
  .slider-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .slider-val {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 800;
    color: #ff4b4b;
    background: #111;
    padding: 2px 6px;
  }

  .brutal-range {
    -webkit-appearance: none;
    width: 100%;
    height: 10px;
    background: #e0e0e0;
    border: 2px solid #111;
    outline: none;
  }
  .brutal-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 22px;
    height: 22px;
    background: #0ea5e9;
    border: 3px solid #111;
    cursor: pointer;
    border-radius: 0;
  }

  /* Colors */
  .bg-presets {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .bg-dot {
    width: 30px;
    height: 30px;
    border: 3px solid #111;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
  }
  .bg-dot.active {
    box-shadow: 0 0 0 transparent;
    transform: translate(2px, 2px);
  }
  .custom-color-btn {
    width: 30px;
    height: 30px;
    border: 3px dashed #111;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    background: #fff;
    position: relative;
  }
  .color-picker-hidden {
    opacity: 0;
    position: absolute;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  /* Switch */
  .brutal-switch-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
  }
  .brutal-switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 30px;
  }
  .brutal-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #fff;
    border: 3px solid #111;
    transition: 0.2s;
    box-shadow: 3px 3px 0px #111;
  }
  .slider:before {
    position: absolute;
    content: '';
    height: 18px;
    width: 18px;
    left: 4px;
    bottom: 3px;
    background-color: #111;
    transition: 0.2s;
  }
  input:checked + .slider {
    background-color: #10b981;
  }
  input:checked + .slider:before {
    transform: translateX(28px);
    background-color: #fff;
  }

  /* Code Area */
  .code-input-area {
    width: 100%;
    min-height: 250px;
    border: 4px solid #111;
    padding: 1rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.9rem;
    background: #111;
    color: #fff;
    resize: vertical;
    outline: none;
    box-shadow: inset 0 0 10px #000;
    box-sizing: border-box;
  }
  .code-input-area:focus {
    border-color: #0ea5e9;
  }
  .mt-6 {
    margin-top: 2rem;
  }

  .small-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.3rem 0.8rem;
    font-weight: 800;
    font-family: 'Syne', sans-serif;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    text-transform: uppercase;
  }
  .small-btn:hover:not(:disabled) {
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0px #111;
    background: #fffbee;
  }
  .small-btn:disabled {
    opacity: 0.7;
  }

  /* Canvas Stage */
  .preview-sticky-pane {
    position: sticky;
    top: 2rem;
  }
  .preview-stage-wrap {
    background: #fdfae5;
    background-image:
      linear-gradient(45deg, #ccc 25%, transparent 25%),
      linear-gradient(-45deg, #ccc 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #ccc 75%),
      linear-gradient(-45deg, transparent 75%, #ccc 75%);
    background-size: 20px 20px;
    background-position:
      0 0,
      0 10px,
      10px -10px,
      -10px 0px;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 500px;
    padding: 2rem;
    overflow: auto;
    border-top: 4px solid #111;
  }

  .screenshot-canvas {
    transition: all 0.3s ease;
    height: auto;
    min-width: 400px;
    max-width: 100%;
  }

  .code-window {
    border: 3px solid #111;
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
    border-bottom: 3px solid #111;
  }

  .window-dots {
    display: flex;
    gap: 8px;
    width: 60px;
  }
  .dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid #111;
  }
  .dot.red {
    background: #ff4b4b;
  }
  .dot.yellow {
    background: #ffd900;
  }
  .dot.green {
    background: #10b981;
  }

  .window-title {
    flex: 1;
    text-align: center;
  }
  .title-input-plain {
    background: transparent;
    border: none;
    text-align: center;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 0.95rem;
    outline: none;
    width: 100%;
    opacity: 0.9;
  }

  .window-spacer {
    width: 60px;
  }

  .window-body {
    padding: 1.5rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1.05rem;
    line-height: 1.6;
    overflow: hidden;
  }
  .window-body pre {
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  /* Theme Implementations */
  .dracula {
    background: #282a36;
  }
  .dracula .window-header {
    background: #ff7be5;
    border-bottom-color: #111;
  }
  .dracula .window-body {
    color: #f8f8f2;
  }
  .dracula .title-input-plain {
    color: #111;
  }

  .one-light {
    background: #fafafa;
  }
  .one-light .window-header {
    background: #ffd900;
    border-bottom-color: #111;
  }
  .one-light .window-body {
    color: #383a42;
  }
  .one-light .title-input-plain {
    color: #111;
  }

  .monokai {
    background: #272822;
  }
  .monokai .window-header {
    background: #0ea5e9;
    border-bottom-color: #111;
  }
  .monokai .window-body {
    color: #f8f8f2;
  }
  .monokai .title-input-plain {
    color: #111;
  }

  .night-owl {
    background: #011627;
  }
  .night-owl .window-header {
    background: #10b981;
    border-bottom-color: #111;
  }
  .night-owl .window-body {
    color: #d6deeb;
  }
  .night-owl .title-input-plain {
    color: #111;
  }

  @media (max-width: 1024px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .preview-sticky-pane {
      position: static;
    }
  }

  /* Dark Mode */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }

  [data-theme='dark'] .brutal-pane {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 10px 10px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .brutal-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .badge {
    border-color: #eee;
    box-shadow: 5px 5px 0px #eee;
  }

  [data-theme='dark'] .brutal-label {
    color: #eee;
  }
  [data-theme='dark'] .brutal-select {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .slider-val {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .brutal-range {
    border-color: #eee;
    background: #333;
  }
  [data-theme='dark'] .brutal-range::-webkit-slider-thumb {
    border-color: #eee;
  }

  [data-theme='dark'] .slider {
    background: #222;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .slider:before {
    background-color: #eee;
  }

  [data-theme='dark'] .code-input-area {
    border-color: #eee;
  }

  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #075985;
    color: #fff;
  }
  [data-theme='dark'] .bg-pink {
    background: #9d174d;
    color: #fff;
  }

  [data-theme='dark'] .preview-stage-wrap {
    background-color: #222;
    border-top-color: #eee;
  }
</style>
