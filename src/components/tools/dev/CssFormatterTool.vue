<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">CSS<span>.格式化()</span></h1>
        <button class="brutal-btn clear-btn" @click="clearAll">清空</button>
      </header>

      <div class="brutal-pane form-pane">
        <div class="pane-header bg-yellow">
          <span>CSS_CODE_EDITOR</span>
          <div class="header-actions">
            <span class="label">缩进:</span>
            <select v-model="indentSize" class="brutal-select small-select">
              <option :value="2">2 空格</option>
              <option :value="4">4 空格</option>
              <option value="tab">Tab</option>
            </select>
          </div>
        </div>

        <div class="pane-body">
          <textarea
            v-model="cssContent"
            class="brutal-editor css-textarea"
            placeholder="[在此粘贴你需要格式化或压缩的 CSS 代码]"
            spellcheck="false"
          ></textarea>

          <div class="action-buttons mt-4">
            <button class="brutal-action-btn primary large-btn flex-1" @click="formatCss">
              ✨ 格式化 (Beautify)
            </button>
            <button class="brutal-action-btn primary bg-pink large-btn flex-1" @click="compressCss">
              🗜️ 压缩 (Minify)
            </button>
            <button class="brutal-action-btn large-btn" @click="copyResult">📋 复制</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import jsBeautify from 'js-beautify';
  import { useCopy } from '@/composables/useCopy';

  const cssBeautify = jsBeautify.css;

  const router = useRouter();
  const { copyToClipboard } = useCopy();

  const cssContent = ref('');
  const indentSize = ref(2);

  function formatCss() {
    if (!cssContent.value) {
      ElMessage.warning('警告: 找不到代码！');
      return;
    }

    try {
      const options = {
        indent_size: typeof indentSize.value === 'number' ? indentSize.value : 1,
        indent_char: typeof indentSize.value === 'number' ? ' ' : '\t',
        selector_separator_newline: true,
        end_with_newline: true,
        newline_between_rules: true
      };

      cssContent.value = cssBeautify(cssContent.value, options);
      ElMessage.success('格式化重组完毕');
    } catch (err) {
      console.error(err);
      ElMessage.error('糟糕，格式化失败');
    }
  }

  function compressCss() {
    if (!cssContent.value) {
      ElMessage.warning('警告: 找不到代码！');
      return;
    }

    try {
      let compressed = cssContent.value.replace(/\/\*[\s\S]*?\*\//g, '');

      compressed = compressed
        .replace(/\s+/g, ' ')
        .replace(/\s*([{}:;,])\s*/g, '$1')
        .replace(/;\}/g, '}')
        .trim();

      cssContent.value = compressed;
      ElMessage.success('极强压缩完成');
    } catch {
      ElMessage.error('糟糕，压缩失败');
    }
  }

  async function copyResult() {
    if (!cssContent.value) {
      ElMessage.warning('没有可复制的内容');
      return;
    }
    await copyToClipboard(cssContent.value, {
      success: '已复制代码至剪贴板'
    });
  }

  function goBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }

  function clearAll() {
    cssContent.value = '';
    ElMessage.success('画板已清空');
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
    max-width: 1200px;
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
  .bg-pink {
    background: #ff7be5 !important;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
  }

  .label {
    font-weight: bold;
  }

  .brutal-select {
    appearance: none;
    background: #fff;
    border: 3px solid #111;
    padding: 0.3rem 0.8rem;
    font-family: inherit;
    font-weight: bold;
    color: #111;
    box-shadow: 3px 3px 0px #111;
    cursor: pointer;
    outline: none;
  }

  .pane-body {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .css-textarea {
    width: 100%;
    min-height: 50vh;
    resize: vertical;
    padding: 1.5rem;
    font-size: 1.1rem;
    line-height: 1.5;
  }

  .brutal-editor {
    border: 4px solid #111;
    font-family: 'IBM Plex Mono', monospace;
    background: #fdfae5;
    color: #111;
    box-shadow: 6px 6px 0px #111;
    outline: none;
    font-weight: 600;
  }

  .brutal-editor:focus {
    background: #fff;
  }

  .action-buttons {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  .brutal-action-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.6rem 2rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
    text-transform: uppercase;
  }

  .brutal-action-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }

  .brutal-action-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-action-btn.primary {
    background: #00e572;
  }

  .large-btn {
    padding: 1.2rem;
    font-size: 1.2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
  }

  .flex-1 {
    flex: 1;
  }

  @media (max-width: 768px) {
    .brutal-title {
      font-size: 2.2rem;
    }
    .action-buttons {
      flex-direction: column;
    }
    .pane-header {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }
  }

  /* Dark Mode Overrides */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-editor,
  [data-theme='dark'] .brutal-select {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-editor {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 9px 9px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .brutal-action-btn {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:hover {
    box-shadow: 9px 9px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
    color: #111;
  }

  [data-theme='dark'] .brutal-action-btn.primary {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .brutal-btn.clear-btn {
    background: #cc3c3c;
    color: #fff;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .brutal-action-btn.bg-pink {
    background: #cc62b6 !important;
    color: #fff;
  }

  [data-theme='dark'] .brutal-select {
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .brutal-editor:focus {
    background: #222;
  }
</style>
