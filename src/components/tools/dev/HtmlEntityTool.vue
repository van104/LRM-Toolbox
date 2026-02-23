<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <!-- Header -->
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">HTML<span>.实体转义()</span></h1>
        <div class="badge">＆ Entity Escape</div>
      </header>

      <!-- 主编辑区 -->
      <div class="brutal-grid">
        <!-- 左：原始 HTML 输入 -->
        <div class="brutal-pane">
          <div class="pane-header bg-orange">
            <span>📝 原始 HTML (Raw)</span>
            <button class="tiny-btn" @click="htmlRaw = ''">✕ 清空</button>
          </div>
          <textarea
            v-model="htmlRaw"
            class="pane-textarea"
            placeholder='输入 HTML 代码，如：&#10;&lt;div class="hello"&gt;Hello &amp; Welcome&lt;/div&gt;'
            spellcheck="false"
          ></textarea>
          <div class="pane-footer">
            <span class="char-count">{{ htmlRaw.length }} 字符</span>
            <button class="action-btn escape-btn" @click="doHtmlEscape">转义 Escape →→</button>
          </div>
        </div>

        <!-- 中：快捷操作列 -->
        <div class="mid-col">
          <div class="mid-label">// 操作</div>
          <button class="op-btn encode" @click="doHtmlEscape">→→<br />转义</button>
          <button class="op-btn decode" @click="doHtmlUnescape">←←<br />还原</button>
          <button class="op-btn swap" @click="swapContent">⇅<br />互换</button>
          <button class="op-btn clear" @click="clearAll">✕<br />清空全部</button>
          <div class="mid-label">// 示例</div>
          <button
            v-for="ex in examples"
            :key="ex.label"
            class="example-btn"
            @click="
              htmlRaw = ex.value;
              doHtmlEscape();
            "
          >
            {{ ex.label }}
          </button>
        </div>

        <!-- 右：转义结果输出 -->
        <div class="brutal-pane">
          <div class="pane-header bg-green">
            <span>✅ Escaped Output (实体)</span>
            <button class="tiny-btn" @click="htmlEscaped = ''">✕ 清空</button>
          </div>
          <textarea
            v-model="htmlEscaped"
            class="pane-textarea"
            placeholder="输出实体代码，如：&#10;&amp;lt;div class=&amp;quot;hello&amp;quot;&amp;gt;Hello &amp;amp; Welcome&amp;lt;/div&amp;gt;"
            spellcheck="false"
          ></textarea>
          <div class="pane-footer">
            <span class="char-count">{{ htmlEscaped.length }} 字符</span>
            <button class="action-btn copy-btn" @click="copy(htmlEscaped)">📋 复制结果</button>
          </div>
        </div>
      </div>

      <!-- 实体对照表 -->
      <div class="brutal-pane entity-ref">
        <div class="pane-header bg-yellow">
          <span>📊 常用 HTML 实体对照表</span>
          <span class="ref-hint">点击行载入左侧</span>
        </div>
        <div class="table-wrap">
          <table class="entity-table">
            <thead>
              <tr>
                <th>字符</th>
                <th>实体名称</th>
                <th>实体编号</th>
                <th>描述</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="e in commonEntities" :key="e.char" class="entity-row">
                <td class="char-cell">{{ e.char }}</td>
                <td>
                  <code class="entity-code named">{{ e.name }}</code>
                </td>
                <td>
                  <code class="entity-code num">{{ e.num }}</code>
                </td>
                <td class="desc-cell">{{ e.desc }}</td>
                <td>
                  <button class="use-btn" @click="loadEntity(e.char)">载入 ↑</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { useCopy } from '@/composables/useCopy';

  const { copyToClipboard } = useCopy();

  const htmlRaw = ref('<div class="hello">Hello & Welcome</div>');
  const htmlEscaped = ref('');

  const escapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const unescapeMap = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': '\u00A0'
  };

  const doHtmlEscape = () => {
    htmlEscaped.value = htmlRaw.value.replace(/[&<>"']/g, m => escapeMap[m]);
  };

  const doHtmlUnescape = () => {
    htmlRaw.value = htmlEscaped.value.replace(/&(amp|lt|gt|quot|#39|nbsp);/g, m => unescapeMap[m]);
  };

  const swapContent = () => {
    const tmp = htmlRaw.value;
    htmlRaw.value = htmlEscaped.value;
    htmlEscaped.value = tmp;
  };

  const clearAll = () => {
    htmlRaw.value = '';
    htmlEscaped.value = '';
  };

  const copy = text => {
    if (text) copyToClipboard(text, { success: '✔ 已复制到剪贴板' });
  };

  const loadEntity = char => {
    htmlRaw.value = char;
    doHtmlEscape();
  };

  const scriptTag = '<' + 'script' + '>' + 'alert("XSS")' + '<' + '/script' + '>';
  const examples = [
    { label: '<div>', value: '<div class="hello">Hello & Welcome</div>' },
    { label: 'SQL', value: "SELECT * FROM users WHERE name='张三' AND age > 18" },
    { label: '<script>', value: scriptTag },
    { label: '引号', value: 'He said "I\'m fine" & left.' }
  ];

  const commonEntities = [
    { char: '<', name: '&lt;', num: '&#60;', desc: '小于号' },
    { char: '>', name: '&gt;', num: '&#62;', desc: '大于号' },
    { char: '&', name: '&amp;', num: '&#38;', desc: '和号 Ampersand' },
    { char: '"', name: '&quot;', num: '&#34;', desc: '双引号' },
    { char: "'", name: '&apos;', num: '&#39;', desc: '单引号 (HTML5)' },
    { char: ' ', name: '&nbsp;', num: '&#160;', desc: '不换行空格 Non-breaking space' },
    { char: '©', name: '&copy;', num: '&#169;', desc: '版权符号 Copyright' },
    { char: '®', name: '&reg;', num: '&#174;', desc: '注册商标 Registered' },
    { char: '™', name: '&trade;', num: '&#8482;', desc: '商标 Trademark' },
    { char: '€', name: '&euro;', num: '&#8364;', desc: '欧元 Euro' },
    { char: '¥', name: '&yen;', num: '&#165;', desc: '日元/人民币 Yen' },
    { char: '—', name: '&mdash;', num: '&#8212;', desc: '破折号 Em dash' },
    { char: '…', name: '&hellip;', num: '&#8230;', desc: '省略号 Ellipsis' },
    { char: '×', name: '&times;', num: '&#215;', desc: '乘号 Multiplication' },
    { char: '÷', name: '&divide;', num: '&#247;', desc: '除号 Division' },
    { char: '±', name: '&plusmn;', num: '&#177;', desc: '正负号 Plus-minus' },
    { char: '→', name: '&rarr;', num: '&#8594;', desc: '右箭头 Rightward arrow' },
    { char: '←', name: '&larr;', num: '&#8592;', desc: '左箭头 Leftward arrow' },
    { char: '♠', name: '&spades;', num: '&#9824;', desc: '黑桃 Spade' },
    { char: '♥', name: '&hearts;', num: '&#9829;', desc: '红心 Heart' }
  ];
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
    text-shadow: 4px 4px 0px #ea580c;
  }

  .brutal-title span {
    color: #ea580c;
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

  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }

  .badge {
    background: #ea580c;
    color: #fff;
    padding: 0.5rem 1.2rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    border: 4px solid #111;
    box-shadow: 5px 5px 0px #111;
  }

  /* Grid */
  .brutal-grid {
    display: grid;
    grid-template-columns: 1fr 120px 1fr;
    gap: 0;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
    background: #fff;
  }

  .brutal-pane {
    display: flex;
    flex-direction: column;
    border: 4px solid #111;
  }

  .brutal-grid > .brutal-pane:first-child {
    border-right: 4px solid #111;
  }
  .brutal-grid > .brutal-pane:last-child {
    border-left: 4px solid #111;
  }

  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 1.25rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    letter-spacing: 0.5px;
    flex-shrink: 0;
  }

  .bg-orange {
    background: #ff7c2e;
    color: #fff;
  }
  .bg-green {
    background: #00e572;
    color: #111;
  }
  .bg-yellow {
    background: #ffd900;
    color: #111;
  }

  .pane-textarea {
    flex: 1;
    border: none;
    padding: 1.25rem;
    font-family: 'IBM Plex Mono', 'Courier New', monospace;
    font-size: 0.95rem;
    font-weight: 600;
    color: #111;
    background: #fdfae5;
    resize: none;
    outline: none;
    min-height: 280px;
    line-height: 1.6;
  }

  .pane-textarea:focus {
    background: #fff;
  }

  .pane-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1.25rem;
    border-top: 3px solid #e0e0e0;
    background: #fff;
    flex-shrink: 0;
  }

  .char-count {
    font-size: 0.85rem;
    color: #888;
    font-weight: 700;
  }

  .action-btn {
    border: 3px solid #111;
    padding: 0.5rem 1.2rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.95rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }

  .action-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0px #111;
  }
  .action-btn:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }
  .escape-btn {
    background: #ff7c2e;
    color: #fff;
  }
  .copy-btn {
    background: #00e572;
    color: #111;
  }

  .tiny-btn {
    border: 2px solid rgba(0, 0, 0, 0.3);
    background: rgba(0, 0, 0, 0.1);
    padding: 0.2rem 0.6rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.1s;
    color: inherit;
  }

  .tiny-btn:hover {
    background: rgba(0, 0, 0, 0.2);
  }

  /* Middle column */
  .mid-col {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
    padding: 1rem 0.5rem;
    background: #f5f5f0;
    border-left: 0;
    border-right: 0;
  }

  .mid-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.75rem;
    font-weight: 700;
    color: #888;
    text-align: center;
    margin-top: 0.5rem;
    margin-bottom: 0.25rem;
  }

  .op-btn {
    border: 3px solid #111;
    background: #fff;
    width: 100%;
    padding: 0.5rem 0;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.75rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
    text-align: center;
    line-height: 1.4;
  }

  .op-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0px #111;
  }
  .op-btn:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }
  .op-btn.encode {
    background: #ff7c2e;
    color: #fff;
  }
  .op-btn.decode {
    background: #4b7bff;
    color: #fff;
  }
  .op-btn.swap {
    background: #7c3aed;
    color: #fff;
  }
  .op-btn.clear {
    background: #ff4b4b;
    color: #fff;
  }

  .example-btn {
    border: 2px solid #111;
    background: #fdfae5;
    width: 100%;
    padding: 0.35rem 0.25rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 0.75rem;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.1s;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .example-btn:hover {
    background: #fff;
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
  }

  /* Entity table */
  .entity-ref {
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
    background: #fff;
  }

  .table-wrap {
    overflow-x: auto;
    max-height: 400px;
    overflow-y: auto;
  }

  .entity-table {
    width: 100%;
    border-collapse: collapse;
  }

  .entity-table thead th {
    position: sticky;
    top: 0;
    background: #fdfae5;
    padding: 0.75rem 1rem;
    border-bottom: 3px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-align: left;
  }

  .entity-row {
    border-bottom: 2px solid #eee;
  }
  .entity-row:hover {
    background: #fdfae5;
  }

  .entity-table td {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }

  .char-cell {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1.5rem;
    font-weight: 900;
    color: #ea580c;
    text-align: center;
    width: 60px;
  }

  .entity-code {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 0.9rem;
    padding: 0.2rem 0.5rem;
  }

  .entity-code.named {
    background: #ffedd5;
    color: #c2410c;
  }
  .entity-code.num {
    background: #e0f2fe;
    color: #0369a1;
  }

  .desc-cell {
    color: #555;
  }

  .ref-hint {
    font-size: 0.8rem;
    font-weight: 600;
    color: #555;
    font-family: 'IBM Plex Mono', monospace;
  }

  .use-btn {
    border: 2px solid #111;
    background: #ffd900;
    padding: 0.2rem 0.6rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 0.8rem;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.1s;
    white-space: nowrap;
  }

  .use-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
  }
  .use-btn:active {
    transform: translate(2px, 2px);
    box-shadow: 0px 0px 0px #111;
  }

  @media (max-width: 800px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .mid-col {
      flex-direction: row;
      flex-wrap: wrap;
      gap: 0.5rem;
      padding: 0.75rem;
    }
    .op-btn {
      width: auto;
      min-width: 60px;
    }
    .brutal-title {
      font-size: 2rem;
    }
  }

  /* Dark Mode */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 9px 9px 0px #eee;
  }

  [data-theme='dark'] .brutal-grid {
    border-color: #eee;
    box-shadow: 12px 12px 0px #eee;
    background: #1a1a1a;
  }
  [data-theme='dark'] .brutal-pane {
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-grid > .brutal-pane:first-child {
    border-right-color: #eee;
  }
  [data-theme='dark'] .brutal-grid > .brutal-pane:last-child {
    border-left-color: #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .bg-orange {
    background: #c2410c;
  }
  [data-theme='dark'] .bg-green {
    background: #007a3d;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }

  [data-theme='dark'] .pane-textarea {
    background: #1a1a1a;
    color: #eee;
  }
  [data-theme='dark'] .pane-textarea:focus {
    background: #222;
  }
  [data-theme='dark'] .pane-footer {
    background: #1a1a1a;
    border-top-color: #333;
  }

  [data-theme='dark'] .action-btn {
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .action-btn:hover {
    box-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .mid-col {
    background: #222;
  }
  [data-theme='dark'] .op-btn {
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
    background: #1a1a1a;
    color: #eee;
  }
  [data-theme='dark'] .op-btn.encode {
    background: #c2410c;
  }
  [data-theme='dark'] .op-btn.decode {
    background: #2a4eb2;
  }
  [data-theme='dark'] .op-btn.swap {
    background: #5b21b6;
  }
  [data-theme='dark'] .op-btn.clear {
    background: #991b1b;
  }
  [data-theme='dark'] .example-btn {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .example-btn:hover {
    background: #2a2a2a;
  }

  [data-theme='dark'] .entity-ref {
    border-color: #eee;
    box-shadow: 12px 12px 0px #eee;
    background: #1a1a1a;
  }
  [data-theme='dark'] .entity-table thead th {
    background: #222;
    border-bottom-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .entity-row {
    border-bottom-color: #333;
  }
  [data-theme='dark'] .entity-row:hover {
    background: #222;
  }
  [data-theme='dark'] .entity-code.named {
    background: #4a1a00;
    color: #fb923c;
  }
  [data-theme='dark'] .entity-code.num {
    background: #0a1a2a;
    color: #38bdf8;
  }
  [data-theme='dark'] .desc-cell {
    color: #aaa;
  }
  [data-theme='dark'] .use-btn {
    background: #b28f00;
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
    color: #fff;
  }
  [data-theme='dark'] .char-count {
    color: #666;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
</style>
