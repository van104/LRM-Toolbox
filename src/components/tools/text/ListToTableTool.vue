<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">列表转<span>表格()</span></h1>
        <div class="badge">📝 List to Table</div>
      </header>

      <main class="brutal-main">
        <div class="layout-grid">
          <!-- 输入区 -->
          <section class="brutal-pane">
            <div class="pane-header bg-yellow">
              <span class="panel-title">1. 输入列表 (INPUT)</span>
            </div>

            <div class="controls-bar">
              <select v-model="separator" class="brutal-input">
                <option value="auto">自动检测分隔符</option>
                <option value="\t">制表符 (Tab)</option>
                <option value=",">逗号 (,)</option>
                <option value=" ">空格 (Space)</option>
                <option value="|">竖线 (|)</option>
              </select>
              <label class="checkbox-label">
                <input v-model="firstRowHeader" type="checkbox" /> 第一行为表头
              </label>
            </div>

            <div class="editor-wrapper">
              <textarea
                v-model="inputText"
                class="code-editor"
                placeholder="粘贴文本在这里...\n姓名, 年龄, 职业\n张三, 25, 程序员\n李四, 30, 设计师"
                spellcheck="false"
              ></textarea>
            </div>
          </section>

          <!-- 输出区 -->
          <section class="brutal-pane">
            <div class="pane-header bg-pink text-white">
              <span class="panel-title">2. 输出结果 (OUTPUT)</span>
              <div class="panel-actions">
                <button class="brutal-btn icon-btn execute-btn" @click="copyResult">
                  📋 复制代码
                </button>
              </div>
            </div>

            <div class="mode-tabs">
              <button
                :class="['tab-btn', { active: activeTab === 'md' }]"
                @click="activeTab = 'md'"
              >
                Markdown
              </button>
              <button
                :class="['tab-btn', { active: activeTab === 'html' }]"
                @click="activeTab = 'html'"
              >
                HTML
              </button>
            </div>

            <div class="editor-wrapper" style="border-bottom: 3px solid #111">
              <textarea
                ref="resultRef"
                readonly
                :value="resultText"
                class="code-editor result-editor"
              ></textarea>
            </div>

            <div
              class="pane-header bg-blue text-white"
              style="border-bottom: none; border-top: 3px solid #111"
            >
              <span class="panel-title">💡 效果预览 (PREVIEW)</span>
            </div>

            <div class="preview-area">
              <!-- eslint-disable vue/no-v-html -->
              <div
                v-if="activeTab === 'html'"
                class="preview-box markdown-body"
                v-html="sanitizedResult"
              ></div>
              <!-- eslint-enable vue/no-v-html -->
              <div v-else class="preview-box">
                <pre class="brutal-pre">{{ resultText }}</pre>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import DOMPurify from 'dompurify';
  import { useCopy } from '@/composables/useCopy';

  const inputText = ref('');
  const separator = ref('auto');
  const firstRowHeader = ref(true);
  const activeTab = ref('md');
  const { copyToClipboard } = useCopy();

  const parsedData = computed(() => {
    if (!inputText.value.trim()) return [];

    let sep = separator.value;
    const lines = inputText.value.trim().split('\n');

    if (sep === 'auto' && lines.length > 0) {
      const first = lines[0];
      if (first.includes('\t')) sep = '\t';
      else if (first.includes(',')) sep = ',';
      else if (first.includes('|')) sep = '|';
      else sep = ' ';
    }

    return lines
      .map(line => {
        return line
          .split(sep)
          .map(c => c.trim())
          .filter(c => c !== '');
      })
      .filter(row => row.length > 0);
  });

  // HTML 实体转义，防止 XSS
  const escapeHtml = str => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const resultText = computed(() => {
    const data = parsedData.value;
    if (data.length === 0) return '';

    let header = [];
    let body = data;

    if (firstRowHeader.value) {
      header = data[0];
      body = data.slice(1);
    } else {
      const maxCols = Math.max(...data.map(r => r.length));
      header = Array.from({ length: maxCols }, (_, i) => `Col ${i + 1}`);
    }

    if (activeTab.value === 'md') {
      const renderRow = row => `| ${row.join(' | ')} |`;
      const divider = `| ${header.map(() => '---').join(' | ')} |`;
      return [renderRow(header), divider, ...body.map(renderRow)].join('\n');
    } else {
      let html = '<table class="brutal-preview-table">\n';
      html += '  <thead>\n    <tr>\n';
      header.forEach(h => (html += `      <th>${escapeHtml(h)}</th>\n`));
      html += '    </tr>\n  </thead>\n';
      html += '  <tbody>\n';
      body.forEach(row => {
        html += '    <tr>\n';
        row.forEach(c => (html += `      <td>${escapeHtml(c)}</td>\n`));
        html += '    </tr>\n';
      });
      html += '  </tbody>\n</table>';
      return html;
    }
  });

  // 对 v-html 渲染的内容进行 DOMPurify 消毒
  const sanitizedResult = computed(() => DOMPurify.sanitize(resultText.value));

  const copyResult = async () => {
    copyToClipboard(resultText.value, { success: '已复制代码到剪贴板' });
  };
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Syne:wght@700;800;900&family=Noto+Sans+SC:wght@400;700;900&display=swap');

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
    text-shadow: 4px 4px 0px #ff4b4b;
  }

  .brutal-title span {
    color: #ff4b4b;
    text-shadow: 4px 4px 0px #111;
    letter-spacing: 0;
  }

  .brutal-btn {
    background: #fff;
    color: #111;
    border: 3px solid #111;
    padding: 0.6rem 1.2rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }

  .brutal-btn:hover:not(:disabled) {
    transform: translate(-3px, -3px);
    box-shadow: 7px 7px 0px #111;
  }

  .brutal-btn:active:not(:disabled) {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }

  .badge {
    background: #111;
    color: #ff4b4b;
    padding: 0.5rem 1.2rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    border: 3px solid #ff4b4b;
    box-shadow: 4px 4px 0px #ff4b4b;
  }

  .brutal-main {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .layout-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    align-items: stretch;
    min-height: 600px;
    height: calc(100vh - 180px);
  }

  @media (max-width: 1024px) {
    .layout-grid {
      grid-template-columns: 1fr;
      height: auto;
    }
  }

  .brutal-pane {
    border: 3px solid #111;
    background: #fff;
    box-shadow: 6px 6px 0px #111;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .pane-header {
    padding: 1rem;
    border-bottom: 3px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1.1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .bg-yellow {
    background: #ffd900;
  }
  .bg-pink {
    background: #ff7be5;
  }
  .bg-blue {
    background: #0ea5e9;
  }
  .text-white {
    color: #fff;
  }

  .panel-actions {
    display: flex;
    gap: 0.5rem;
  }

  .icon-btn {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
    font-family: 'Noto Sans SC', sans-serif;
  }

  .execute-btn,
  .text-white .execute-btn {
    background: #fff;
    color: #111;
  }

  .execute-btn:hover:not(:disabled),
  .text-white .execute-btn:hover:not(:disabled) {
    background: #ffd900;
    color: #111;
  }

  .controls-bar {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-bottom: 3px solid #111;
    background: #fdfae5;
  }

  .brutal-input {
    background: #fff;
    color: #111;
    border: 3px solid #111;
    padding: 0.4rem 0.6rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 0.9rem;
    font-weight: 800;
    outline: none;
    box-shadow: 3px 3px 0px #111;
  }

  .brutal-input:focus {
    box-shadow: 4px 4px 0px #ff4b4b;
  }

  .checkbox-label {
    font-size: 0.9rem;
    font-weight: 800;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .checkbox-label input[type='checkbox'] {
    appearance: none;
    background-color: #fff;
    width: 20px;
    height: 20px;
    border: 3px solid #111;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .checkbox-label input[type='checkbox']:checked {
    background-color: #111;
  }

  .checkbox-label input[type='checkbox']:checked::after {
    content: '✖';
    color: #ffd900;
    font-size: 14px;
  }

  .mode-tabs {
    display: flex;
    border-bottom: 3px solid #111;
    background: #fdfae5;
  }

  .tab-btn {
    flex: 1;
    padding: 0.8rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1rem;
    font-weight: 800;
    background: transparent;
    border: none;
    border-right: 3px solid #111;
    color: #111;
    cursor: pointer;
    transition: all 0.1s;
    text-transform: uppercase;
  }

  .tab-btn:last-child {
    border-right: none;
  }

  .tab-btn.active {
    background: #111;
    color: #ff7be5;
  }

  .editor-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .code-editor {
    flex: 1;
    width: 100%;
    min-height: 200px;
    border: none;
    padding: 1rem;
    resize: none;
    outline: none;
    font-family: 'IBM Plex Mono', 'Consolas', monospace;
    font-size: 1rem;
    line-height: 1.6;
    background: transparent;
    color: #111;
    box-sizing: border-box;
  }

  .result-editor {
    background: #fdfdfd;
  }

  .preview-area {
    flex: 1;
    overflow-y: auto;
    background: #fff;
  }

  .preview-box {
    padding: 1rem;
  }

  .brutal-pre {
    margin: 0;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.95rem;
    line-height: 1.5;
    white-space: pre-wrap;
    background: #111;
    color: #0ea5e9;
    padding: 1rem;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #ff7be5;
  }

  :deep(.brutal-preview-table) {
    width: 100%;
    border-collapse: collapse;
    border: 3px solid #111;
  }

  :deep(.brutal-preview-table th),
  :deep(.brutal-preview-table td) {
    border: 2px solid #111;
    padding: 0.8rem;
    text-align: left;
    font-family: 'IBM Plex Mono', monospace;
  }

  :deep(.brutal-preview-table th) {
    background: #ffd900;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
  }

  /* Dark theme */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .brutal-pane {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
    border-top-color: #eee !important;
  }
  [data-theme='dark'] .controls-bar {
    background: #222;
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .mode-tabs {
    border-bottom-color: #eee;
    background: #222;
  }
  [data-theme='dark'] .tab-btn {
    border-right-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .tab-btn.active {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .brutal-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .badge {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .code-editor {
    color: #eee;
  }
  [data-theme='dark'] .result-editor {
    background: #222;
  }
  [data-theme='dark'] .preview-area {
    background: #1a1a1a;
  }
  [data-theme='dark'] .brutal-input {
    background: #222;
    color: #eee;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .checkbox-label {
    color: #eee;
  }
  [data-theme='dark'] .checkbox-label input[type='checkbox'] {
    border-color: #eee;
    background-color: #222;
  }
  [data-theme='dark'] .checkbox-label input[type='checkbox']:checked {
    background-color: #eee;
  }
  [data-theme='dark'] .checkbox-label input[type='checkbox']:checked::after {
    color: #111;
  }
  [data-theme='dark'] .brutal-pre {
    background: #000;
    border-color: #eee;
    box-shadow: 4px 4px 0px #9d174d;
  }
  [data-theme='dark'] :deep(.brutal-preview-table) {
    border-color: #eee;
  }
  [data-theme='dark'] :deep(.brutal-preview-table th),
  [data-theme='dark'] :deep(.brutal-preview-table td) {
    border-color: #eee;
  }
  [data-theme='dark'] :deep(.brutal-preview-table th) {
    background: #111;
    color: #eee;
  }
  [data-theme='dark'] .editor-wrapper {
    border-bottom-color: #eee !important;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-pink {
    background: #9d174d;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #075985;
    color: #fff;
  }
  [data-theme='dark'] .execute-btn,
  [data-theme='dark'] .text-white .execute-btn {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .execute-btn:hover:not(:disabled),
  [data-theme='dark'] .text-white .execute-btn:hover:not(:disabled) {
    background: #ffd900;
  }
</style>
