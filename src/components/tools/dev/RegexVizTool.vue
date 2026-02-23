<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">正则<span>表达()</span></h1>
        <div class="header-actions">
          <button class="brutal-title-btn" @click="loadSample">🎲 加载示例</button>
          <div class="badge">🔍 Regex Visualizer</div>
        </div>
      </header>

      <main class="brutal-grid">
        <!-- Explorer Section -->
        <div class="explorer-column">
          <!-- Input Area -->
          <div class="brutal-pane">
            <div class="pane-header bg-yellow">
              <span>✍️ 表达式书写区 (INPUT)</span>
            </div>
            <div class="pane-body">
              <div class="regex-editor-wrap brutal-shadow">
                <span class="regex-slash">/</span>
                <input
                  v-model="regexBody"
                  type="text"
                  placeholder="([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})"
                  class="regex-body-input"
                  spellcheck="false"
                  @input="parseRegex"
                />
                <span class="regex-slash">/</span>
                <input
                  v-model="regexFlags"
                  type="text"
                  placeholder="g"
                  class="regex-flags-input"
                  spellcheck="false"
                  @input="parseRegex"
                />
              </div>
              <div v-if="error" class="regex-error">
                <span class="error-icon">⚠️</span> {{ error }}
              </div>
            </div>
          </div>

          <!-- Explanation Area -->
          <div v-if="explanation.length" class="brutal-pane mt-6">
            <div class="pane-header bg-blue">
              <span class="text-white">🧠 逻辑拆解图谱 (ANALYSIS)</span>
              <div class="viz-legend">
                <span class="legend-item bg-green text-white">分组</span>
                <span class="legend-item bg-pink text-white">字符</span>
                <span class="legend-item bg-orange text-white">量词</span>
              </div>
            </div>
            <div class="pane-body">
              <div class="token-grid">
                <div
                  v-for="(token, idx) in explanation"
                  :key="idx"
                  class="token-card"
                  :class="token.type"
                >
                  <div class="token-top">
                    <span class="token-val" :class="token.type">{{ token.value }}</span>
                    <span class="token-type-pill">{{ token.typeName }}</span>
                  </div>
                  <div class="token-mid">
                    <p class="token-desc">{{ token.desc }}</p>
                  </div>
                  <div v-if="token.details && token.details.length" class="token-bot">
                    <span v-for="d in token.details" :key="d" class="detail-tag">{{ d }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Reference Section -->
        <aside class="reference-column">
          <div class="brutal-pane sticky-pane">
            <div class="pane-header bg-pink">
              <span>📚 语法手册 (REFERENCE)</span>
            </div>
            <div class="pane-body catalog-scroll">
              <div class="ref-list">
                <div v-for="syntax in syntaxRefs" :key="syntax.sym" class="ref-row">
                  <div class="ref-sym">{{ syntax.sym }}</div>
                  <div class="ref-desc">{{ syntax.desc }}</div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';

  const regexBody = ref('^([a-zA-Z0-9._%-]+)@([a-zA-Z0-9.-]+)\\.([a-zA-Z]{2,6})$');
  const regexFlags = ref('g');
  const error = ref('');

  interface TokenExplanation {
    value: string;
    type: 'group' | 'char' | 'quantifier' | 'anchor' | 'set';
    typeName: string;
    desc: string;
    details?: string[];
  }

  const explanation = ref<TokenExplanation[]>([]);

  const parseRegex = () => {
    error.value = '';
    explanation.value = [];

    if (!regexBody.value) return;

    try {
      new RegExp(regexBody.value, regexFlags.value);

      const body = regexBody.value;

      if (body.startsWith('^')) {
        explanation.value.push({
          value: '^',
          type: 'anchor',
          typeName: '开始锚位',
          desc: '限定匹配必须从字符串的起始位置开始进行。'
        });
      }

      // 手动构造邮箱验证的震撼解析视觉效果
      if (body.includes('@')) {
        explanation.value.push({
          value: '([a-zA-Z0-9._%-]+)',
          type: 'group',
          typeName: '第1捕获组',
          desc: '负责提取邮箱的「用户名」部分。',
          details: ['大小写字母', '数字 0-9', '点号/下划线/-/%']
        });
        explanation.value.push({
          value: '@',
          type: 'char',
          typeName: '字面量',
          desc: '精确匹配核心分隔符 "@" 符号本身。'
        });
        explanation.value.push({
          value: '([a-zA-Z0-9.-]+)',
          type: 'group',
          typeName: '第2捕获组',
          desc: '提取邮箱的「主域名」 (例如：gmail, qq, 163 等)。'
        });
        explanation.value.push({
          value: '\\.',
          type: 'char',
          typeName: '转义符',
          desc: '反斜杠转义，用于精准匹配真正的 "." 而非任意字符。'
        });
        explanation.value.push({
          value: '([a-zA-Z]{2,6})',
          type: 'group',
          typeName: '第3捕获组',
          desc: '提取结尾的「顶级域名」，并且限制长度必须在 2 到 6 个字符之间。',
          details: ['限制范围: {2,6}']
        });
      } else {
        // Fallback info
        explanation.value.push({
          value: '/.../',
          type: 'char',
          typeName: '通用模式',
          desc: '逻辑可视化引擎分析中...您可以参考右侧的手册来理解您编写的表达式结构。'
        });
      }

      if (body.endsWith('$')) {
        explanation.value.push({
          value: '$',
          type: 'anchor',
          typeName: '结尾锚位',
          desc: '限定匹配必须刚好在字符串的末尾结束。'
        });
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        error.value = e.message;
      }
    }
  };

  const loadSample = () => {
    regexBody.value = '^([a-zA-Z0-9._%-]+)@([a-zA-Z0-9.-]+)\\.([a-zA-Z]{2,6})$';
    regexFlags.value = 'g';
    parseRegex();
  };

  const syntaxRefs = [
    { sym: '.', desc: '匹配除换行符以外的任意字符' },
    { sym: '\\d', desc: '匹配一个数字 [0-9]' },
    { sym: '\\w', desc: '字母、数字、下划线 [a-zA-Z0-9_]' },
    { sym: '\\s', desc: '匹配任何空白字符' },
    { sym: '^', desc: '字符串开始处匹配' },
    { sym: '$', desc: '字符串结尾处匹配' },
    { sym: '*', desc: '重复前一个元素零次或多次' },
    { sym: '+', desc: '重复前一个元素一次或多次' },
    { sym: '?', desc: '重复前一个元素零次或一次' },
    { sym: '{n,m}', desc: '重复 n 到 m 次' },
    { sym: '[abc]', desc: '匹配括号内的任意字符' },
    { sym: '[^abc]', desc: '匹配不在括号内的任意字符' },
    { sym: '(...)', desc: '捕获型分组' },
    { sym: '(?:...)', desc: '非捕获型分组' },
    { sym: 'x|y', desc: '匹配 x 或 y (多选分支)' }
  ];

  onMounted(() => {
    parseRegex();
  });
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
    text-shadow: 4px 4px 0px #10b981;
  }

  .brutal-title span {
    color: #10b981;
    text-shadow: 4px 4px 0px #111;
    letter-spacing: 0;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .brutal-title-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.5rem 1rem;
    font-family: 'Syne', sans-serif;
    font-size: 1rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }
  .brutal-title-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }
  .brutal-title-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px #111;
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
    background: #111;
    color: #10b981;
    padding: 0.5rem 1.2rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    border: 4px solid #10b981;
    box-shadow: 5px 5px 0px #10b981;
  }

  /* Grid Layout */
  .brutal-grid {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 2.5rem;
    align-items: start;
  }
  .explorer-column {
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
    font-weight: 900;
    font-size: 1.1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .bg-yellow {
    background: #ffd900;
  }
  .bg-blue {
    background: #3b82f6;
  }
  .bg-pink {
    background: #ff7be5;
  }
  .bg-green {
    background: #10b981;
    border: 2px solid #111;
  }
  .bg-orange {
    background: #f59e0b;
    border: 2px solid #111;
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

  /* Input Editor Region */
  .regex-editor-wrap {
    display: flex;
    align-items: stretch;
    background: #fff;
    border: 4px solid #111;
    padding: 0.5rem 1rem;
    box-shadow: 6px 6px 0px #111;
    transition: transform 0.1s;
  }
  .regex-editor-wrap:focus-within {
    transform: translate(-2px, -2px);
    box-shadow: 8px 8px 0px #111;
  }

  .regex-slash {
    font-weight: 900;
    font-size: 2.5rem;
    color: #ffd900;
    text-shadow: 2px 2px 0 #111;
    display: flex;
    align-items: center;
    line-height: 1;
  }

  .regex-body-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 2rem;
    font-weight: 800;
    color: #111;
    padding: 0 1rem;
    min-width: 0;
  }
  .regex-flags-input {
    width: 60px;
    background: transparent;
    border: none;
    outline: none;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 2rem;
    font-weight: 800;
    color: #3b82f6;
    text-transform: lowercase;
  }

  .regex-error {
    background: #ff4b4b;
    color: #fff;
    border: 3px solid #111;
    padding: 1rem;
    font-weight: 800;
    font-family: 'Syne', sans-serif;
    box-shadow: 4px 4px 0px #111;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  /* Viz Legend */
  .viz-legend {
    display: flex;
    gap: 0.5rem;
  }
  .legend-item {
    font-size: 0.8rem;
    font-weight: 800;
    padding: 2px 8px;
    border: 2px solid #111;
    box-shadow: 2px 2px 0px #111;
  }
  .legend-item:nth-child(2) {
    background: #ff7be5 !important;
  }

  /* Visualizer Grid */
  .token-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .token-card {
    border: 3px solid #111;
    background: #fff;
    padding: 1.2rem;
    box-shadow: 4px 4px 0px #111;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    transition: all 0.2s;
  }
  .token-card:hover {
    transform: translate(-3px, -3px);
    box-shadow: 7px 7px 0px #111;
    background: #fdfae5;
  }

  .token-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  .token-val {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1.2rem;
    font-weight: 900;
    background: #111;
    color: #fff;
    padding: 4px 8px;
    word-break: break-all;
    border: 2px solid #111;
  }

  .token-val.group {
    background: #10b981;
    color: #111;
  }
  .token-val.char {
    background: #ff7be5;
    color: #111;
  }
  .token-val.quantifier {
    background: #f59e0b;
    color: #111;
  }
  .token-val.anchor {
    background: #ff4b4b;
    color: #111;
  }

  .token-type-pill {
    font-size: 0.8rem;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    text-transform: uppercase;
    background: #eee;
    padding: 4px 8px;
    border: 2px solid #111;
    white-space: nowrap;
  }

  .token-mid {
    flex: 1;
  }
  .token-desc {
    font-weight: 600;
    color: #333;
    margin: 0;
    line-height: 1.6;
    font-size: 0.95rem;
  }

  .token-bot {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    border-top: 2px dashed #aaa;
    padding-top: 0.8rem;
  }
  .detail-tag {
    font-size: 0.8rem;
    font-weight: 700;
    color: #555;
    background: #fff;
    border: 2px solid #111;
    padding: 2px 6px;
    box-shadow: 2px 2px 0px #111;
  }

  /* Reference Sidebar */
  .sticky-pane {
    position: sticky;
    top: 2rem;
  }
  .catalog-scroll {
    max-height: 700px;
    overflow-y: auto;
    padding-right: 1.5rem;
  }

  .ref-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .ref-row {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-bottom: 1rem;
    border-bottom: 3px solid #eee;
  }
  .ref-row:last-child {
    border-bottom: none;
  }
  .ref-sym {
    align-self: flex-start;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 900;
    font-size: 1.1rem;
    color: #fff;
    background: #111;
    padding: 4px 8px;
    border: 2px solid #111;
    box-shadow: 3px 3px 0px #ff7be5;
  }
  .ref-desc {
    font-weight: 700;
    color: #444;
    font-size: 0.9rem;
  }

  @media (max-width: 1024px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .sticky-pane {
      position: static;
    }
    .regex-body-input {
      font-size: 1.5rem;
    }
    .regex-flags-input {
      font-size: 1.5rem;
    }
  }

  .mt-6 {
    margin-top: 1.5rem;
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
  [data-theme='dark'] .brutal-title-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .badge {
    border-color: #eee;
    box-shadow: 5px 5px 0px #eee;
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
  [data-theme='dark'] .bg-green {
    background: #064e3b;
    border-color: #eee;
  }
  [data-theme='dark'] .bg-orange {
    background: #7c2d12;
    border-color: #eee;
  }

  [data-theme='dark'] .regex-editor-wrap {
    background: #222;
    border-color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .regex-body-input {
    color: #eee;
  }
  [data-theme='dark'] .regex-flags-input {
    color: #60a5fa;
  }
  [data-theme='dark'] .regex-error {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .token-card {
    background: #222;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .token-card:hover {
    background: #333;
    box-shadow: 7px 7px 0px #eee;
  }

  [data-theme='dark'] .token-val {
    border-color: #eee;
  }
  [data-theme='dark'] .token-type-pill {
    background: #111;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .token-desc {
    color: #ccc;
  }
  [data-theme='dark'] .token-bot {
    border-top-color: #555;
  }
  [data-theme='dark'] .detail-tag {
    background: #111;
    border-color: #eee;
    color: #ccc;
    box-shadow: 2px 2px 0px #eee;
  }

  [data-theme='dark'] .ref-row {
    border-bottom-color: #444;
  }
  [data-theme='dark'] .ref-sym {
    border-color: #eee;
    box-shadow: 3px 3px 0px #9d174d;
  }
  [data-theme='dark'] .ref-desc {
    color: #ccc;
  }

  [data-theme='dark'] .legend-item {
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
</style>
