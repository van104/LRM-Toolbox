<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">字符串<span>.转义()</span></h1>
        <button
          class="brutal-btn clear-btn"
          @click="
            inputText = '';
            outputText = '';
          "
        >
          清空
        </button>
      </header>

      <div class="brutal-grid main-grid">
        <!-- 输入区 -->
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span>INPUT.RAW_STRING</span>
          </div>
          <div class="pane-body">
            <textarea
              v-model="inputText"
              class="brutal-editor code-textarea"
              placeholder="[在此粘贴需要处理的原始文本]"
              spellcheck="false"
            ></textarea>
          </div>
        </div>

        <!-- 操控面板 -->
        <div class="brutal-pane control-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">MODE.CONFIG</span>
          </div>
          <div class="pane-body control-body">
            <div class="control-group">
              <label class="control-label">// 语言模式</label>
              <select v-model="mode" class="brutal-select">
                <option value="java">Java / C# / C++</option>
                <option value="js">JavaScript / JSON</option>
                <option value="html">HTML Entities</option>
                <option value="xml">XML</option>
                <option value="sql">SQL (Single Quote)</option>
                <option value="url">URL Encode</option>
                <option value="csv">CSV</option>
              </select>
            </div>

            <div class="info-badge">
              <span v-if="mode === 'java'">处理双引号、反斜杠、换行符等。</span>
              <span v-else-if="mode === 'js'">标准 JSON 字符串转义。</span>
              <span v-else-if="mode === 'html'">将 &lt; &gt; &amp; " ' 转换为实体。</span>
              <span v-else-if="mode === 'xml'">XML 仅支持 &lt; &gt; &amp; " '。</span>
              <span v-else-if="mode === 'sql'">将单引号转义为双单引号。</span>
              <span v-else-if="mode === 'url'">将非 ASCII 字符转换为百分号编码。</span>
              <span v-else-if="mode === 'csv'">CSV 字段含特殊字符时会加引号。</span>
            </div>

            <div class="action-buttons">
              <button class="brutal-action-btn primary large-btn" @click="doEscape">转义 →</button>
              <button class="brutal-action-btn large-btn" @click="doUnescape">← 反转义</button>
            </div>
          </div>
        </div>

        <!-- 输出区 -->
        <div class="brutal-pane">
          <div class="pane-header bg-green">
            <span>OUTPUT.RESULT</span>
            <button
              class="brutal-action-btn small copy-btn-inline"
              :disabled="!outputText"
              @click="copyResult"
            >
              复制
            </button>
          </div>
          <div class="pane-body">
            <textarea
              v-model="outputText"
              class="brutal-editor code-textarea result-editor"
              readonly
              placeholder="[处理结果将在此显示]"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- 使用指南 -->
      <div class="brutal-pane help-pane">
        <div class="pane-header bg-yellow">
          <span>// 使用指南</span>
        </div>
        <div class="pane-body help-grid">
          <div class="help-card">
            <h4>1. 代码转义 (Java/JS)</h4>
            <p>将特殊字符转换为字符串字面量安全格式。</p>
            <div class="example">
              <code>"Hello"</code> → <code>\"Hello\"</code><br />
              <code>Line1\nLine2</code> → <code>Line1\\nLine2</code>
            </div>
          </div>
          <div class="help-card">
            <h4>2. 网页转义 (HTML/XML)</h4>
            <p>将预留字符转换为实体 (Entities)，防止 XSS 或解析错误。</p>
            <div class="example"><code>&lt;div&gt;</code> → <code>&amp;lt;div&amp;gt;</code></div>
          </div>
          <div class="help-card">
            <h4>3. 数据库转义 (SQL)</h4>
            <p>处理单引号，防止 SQL 注入或语法错误。</p>
            <div class="example"><code>O'Neil</code> → <code>O''Neil</code></div>
          </div>
          <div class="help-card">
            <h4>4. URL 编码</h4>
            <p>将非 ASCII 字符转换为百分号编码。</p>
            <div class="example"><code>测试</code> → <code>%E6%B5%8B%E8%AF%95</code></div>
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
  import { useCopy } from '@/composables/useCopy';

  const router = useRouter();
  const { copyToClipboard } = useCopy();

  const inputText = ref('');
  const outputText = ref('');
  const mode = ref('java');

  function doEscape() {
    if (!inputText.value) {
      ElMessage.warning('输入区为空，无法转义');
      return;
    }
    try {
      outputText.value = escapeLogic(inputText.value, mode.value);
      ElMessage.success('转义完成');
    } catch (e) {
      ElMessage.error('转义失败: ' + e.message);
    }
  }

  function doUnescape() {
    if (!inputText.value) {
      ElMessage.warning('输入区为空，无法反转义');
      return;
    }
    try {
      outputText.value = unescapeLogic(inputText.value, mode.value);
      ElMessage.success('反转义完成');
    } catch (e) {
      ElMessage.error('反转义失败: ' + e.message);
    }
  }

  function escapeLogic(str, type) {
    switch (type) {
      case 'java':
      case 'js':
        return JSON.stringify(str).slice(1, -1);
      case 'html':
        return str
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      case 'xml':
        return str
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');
      case 'sql':
        return str.replace(/'/g, "''");
      case 'url':
        return encodeURIComponent(str);
      case 'csv':
        if (/[",\n]/.test(str)) {
          return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
      default:
        return str;
    }
  }

  function unescapeLogic(str, type) {
    switch (type) {
      case 'java':
      case 'js':
        return JSON.parse('"' + str.replace(/"/g, '\\"') + '"');
      case 'html': {
        const doc = new DOMParser().parseFromString(str, 'text/html');
        return doc.documentElement.textContent;
      }
      case 'xml': {
        const docXml = new DOMParser().parseFromString('<root>' + str + '</root>', 'text/xml');
        return docXml.documentElement.textContent;
      }
      case 'sql':
        return str.replace(/''/g, "'");
      case 'url':
        return decodeURIComponent(str);
      case 'csv':
        if (str.startsWith('"') && str.endsWith('"')) {
          return str.slice(1, -1).replace(/""/g, '"');
        }
        return str;
      default:
        return str;
    }
  }

  function copyResult() {
    if (!outputText.value) return;
    copyToClipboard(outputText.value, { success: '已复制结果至剪贴板' });
  }

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push('/');
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
    gap: 3rem;
  }

  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
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

  .main-grid {
    display: grid !important;
    grid-template-columns: 1fr auto 1fr;
    gap: 2rem;
    align-items: start;
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
  .bg-green {
    background: #00e572;
  }
  .text-white {
    color: #fff;
  }

  .pane-body {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .code-textarea {
    width: 100%;
    min-height: 40vh;
    resize: vertical;
    padding: 1.5rem;
    font-size: 1rem;
    line-height: 1.6;
  }

  .brutal-editor {
    border: 4px solid #111;
    font-family: 'IBM Plex Mono', monospace;
    background: #fdfae5;
    color: #111;
    box-shadow: 6px 6px 0px #111;
    outline: none;
    font-weight: 600;
    box-sizing: border-box;
  }

  .brutal-editor:focus {
    background: #fff;
  }

  .result-editor {
    background: #eaffed;
    cursor: default;
  }

  .control-pane {
    min-width: 240px;
  }

  .control-body {
    gap: 2rem;
  }

  .control-label {
    display: block;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }

  .control-group {
    display: flex;
    flex-direction: column;
  }

  .brutal-select {
    appearance: none;
    background: #fff;
    border: 3px solid #111;
    padding: 0.6rem 1rem;
    font-family: 'IBM Plex Mono', inherit;
    font-weight: bold;
    font-size: 1rem;
    color: #111;
    box-shadow: 4px 4px 0px #111;
    cursor: pointer;
    outline: none;
    transition: all 0.1s;
  }

  .brutal-select:focus {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .info-badge {
    background: #fdfae5;
    border: 3px solid #111;
    padding: 0.75rem 1rem;
    font-size: 0.95rem;
    font-weight: 600;
    box-shadow: 4px 4px 0px #111;
    line-height: 1.5;
  }

  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .brutal-action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.6rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
    text-transform: uppercase;
    text-align: center;
  }

  .brutal-action-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .brutal-action-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-action-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    box-shadow: 4px 4px 0px #111;
  }

  .brutal-action-btn.primary {
    background: #00e572;
  }
  .brutal-action-btn.small {
    padding: 0.2rem 0.8rem;
    font-size: 0.9rem;
    border-width: 2px;
    box-shadow: 2px 2px 0px #111;
  }

  .copy-btn-inline {
    background: #111;
    color: #ffd900;
    border-color: #111;
    box-shadow: 2px 2px 0px #555;
  }

  .copy-btn-inline:hover {
    background: #333;
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0px #555;
  }

  .large-btn {
    padding: 1rem;
    font-size: 1.1rem;
  }

  /* Help Section */
  .help-pane .help-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 2rem;
  }

  .help-card h4 {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
    margin: 0 0 0.5rem 0;
    border-bottom: 3px solid #111;
    padding-bottom: 0.5rem;
  }

  .help-card p {
    font-size: 0.9rem;
    margin: 0 0 0.75rem 0;
    line-height: 1.5;
    color: #333;
  }

  .help-card .example {
    background: #fdfae5;
    border: 3px solid #111;
    padding: 0.75rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.9rem;
    box-shadow: 4px 4px 0px #111;
    overflow-wrap: break-word;
  }

  .help-card code {
    background: #111;
    color: #ffd900;
    padding: 2px 5px;
    font-weight: bold;
  }

  @media (max-width: 900px) {
    .main-grid {
      grid-template-columns: 1fr !important;
    }

    .brutal-title {
      font-size: 2.2rem;
    }
    .action-buttons {
      flex-direction: row;
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
  [data-theme='dark'] .brutal-select,
  [data-theme='dark'] .info-badge {
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

  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane:hover {
    box-shadow: 16px 16px 0px #eee;
  }

  [data-theme='dark'] .brutal-action-btn {
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:hover {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .brutal-action-btn.primary {
    background: #00994c;
    color: #fff;
  }

  [data-theme='dark'] .brutal-select {
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-select:focus {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-editor {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-editor:focus {
    background: #222;
  }

  [data-theme='dark'] .result-editor {
    background: #0a2a14;
  }

  [data-theme='dark'] .info-badge {
    box-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .help-card .example {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
    background: #222;
  }
  [data-theme='dark'] .help-card p {
    color: #aaa;
  }

  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
    color: #111;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .bg-green {
    background: #00994c;
    color: #fff;
  }

  [data-theme='dark'] .brutal-btn.clear-btn {
    background: #cc3c3c;
    color: #fff;
  }

  [data-theme='dark'] .copy-btn-inline {
    background: #ffd900;
    color: #111;
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
</style>
