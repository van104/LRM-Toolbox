<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">变量命名<span>转换()</span></h1>
        <div class="badge">🔄 Variable Converter</div>
      </header>

      <main class="brutal-main">
        <div class="layout-grid">
          <!-- 1. 输入区 -->
          <section class="brutal-pane">
            <div class="pane-header bg-yellow">
              <span class="panel-title">1. 输入变量名 (INPUT)</span>
              <div class="panel-actions">
                <button
                  class="brutal-btn icon-btn"
                  @click="
                    inputText = '';
                    convert();
                  "
                >
                  🗑️ 清空
                </button>
              </div>
            </div>
            <div class="editor-wrapper">
              <textarea
                v-model="inputText"
                class="code-editor"
                placeholder="输入任意格式的变量名，如: my_variable_name, myVariableName..."
                spellcheck="false"
                @input="convert"
              ></textarea>
            </div>
          </section>

          <!-- 2. 转换结果区 -->
          <section class="brutal-pane" style="flex: 2">
            <div class="pane-header bg-pink text-white">
              <span class="panel-title">2. 转换结果 (RESULTS)</span>
              <div class="panel-actions">
                <button class="brutal-btn icon-btn execute-btn" @click="copyAll">
                  📋 全部复制
                </button>
              </div>
            </div>
            <div class="tools-scroll-area">
              <div class="result-grid">
                <div
                  v-for="res in results"
                  :key="res.label"
                  class="result-card"
                  :class="{ 'has-val': res.value }"
                >
                  <div class="card-header bg-blue text-white">
                    <span class="type-label">{{ res.label }}</span>
                  </div>
                  <div class="card-body">
                    <div v-if="res.value" class="converted-val">{{ res.value }}</div>
                    <div v-else class="placeholder">-</div>
                  </div>
                  <div class="card-footer">
                    <code>{{ res.example }}</code>
                    <button
                      v-if="res.value"
                      class="brutal-btn copy-btn"
                      @click="copyText(res.value)"
                    >
                      复制
                    </button>
                  </div>
                </div>
              </div>

              <div class="tips-section mt-2">
                <h3 class="tips-title bg-yellow">💡 格式说明</h3>
                <div class="format-list">
                  <div class="format-item">
                    <b>Camel Case (小驼峰)</b>
                    <span>通常用于 JavaScript/TypeScript 中的变量和函数命名。</span>
                  </div>
                  <div class="format-item">
                    <b>Pascal Case (大驼峰)</b>
                    <span>通常用于 类名、Vue 组件名 或 React 组件名。</span>
                  </div>
                  <div class="format-item">
                    <b>Snake Case (蛇形)</b>
                    <span>通常用于 Python 变量、数据库字段名。</span>
                  </div>
                  <div class="format-item">
                    <b>Kebab Case (短横线)</b>
                    <span>通常用于 CSS 类名、URL 路径、Vue 模板中的组件标签。</span>
                  </div>
                  <div class="format-item">
                    <b>Constant Case (常量)</b>
                    <span>通常用于 全局常量、配置项命名。</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const inputText = ref('');
  const results = ref([
    { label: 'Camel Case', value: '', example: 'myVariableName', type: 'camel' },
    { label: 'Pascal Case', value: '', example: 'MyVariableName', type: 'pascal' },
    { label: 'Snake Case', value: '', example: 'my_variable_name', type: 'snake' },
    { label: 'Kebab Case', value: '', example: 'my-variable-name', type: 'kebab' },
    { label: 'Constant Case', value: '', example: 'MY_VARIABLE_NAME', type: 'constant' },
    { label: 'Dot Case', value: '', example: 'my.variable.name', type: 'dot' }
  ]);

  const convert = () => {
    if (!inputText.value.trim()) {
      results.value.forEach(r => (r.value = ''));
      return;
    }

    let words = [];
    const text = inputText.value.trim();

    if (text.includes('_')) {
      words = text.split('_');
    } else if (text.includes('-')) {
      words = text.split('-');
    } else if (text.includes('.')) {
      words = text.split('.');
    } else {
      words = text
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .split(/\s+/);
    }

    words = words.map(w => w.toLowerCase()).filter(w => w.length > 0);

    if (words.length === 0) return;

    results.value.forEach(res => {
      switch (res.type) {
        case 'camel':
          res.value =
            words[0] +
            words
              .slice(1)
              .map(w => w.charAt(0).toUpperCase() + w.slice(1))
              .join('');
          break;
        case 'pascal':
          res.value = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
          break;
        case 'snake':
          res.value = words.join('_');
          break;
        case 'kebab':
          res.value = words.join('-');
          break;
        case 'constant':
          res.value = words.join('_').toUpperCase();
          break;
        case 'dot':
          res.value = words.join('.');
          break;
      }
    });
  };

  const copyText = text => {
    navigator.clipboard.writeText(text).then(() => {
      ElMessage.success('已复制');
    });
  };

  const copyAll = () => {
    const all = results.value
      .filter(r => r.value)
      .map(r => `${r.label}: ${r.value}`)
      .join('\n');
    if (!all) return;
    navigator.clipboard.writeText(all).then(() => {
      ElMessage.success('全部结果已复制');
    });
  };

  onMounted(() => {
    inputText.value = 'user_login_count';
    convert();
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
    display: flex;
    gap: 2rem;
    align-items: stretch;
    min-height: 600px;
    height: calc(100vh - 180px);
  }

  @media (max-width: 1024px) {
    .layout-grid {
      flex-direction: column;
      height: auto;
    }
  }

  .brutal-pane {
    flex: 1;
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

  .editor-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .code-editor {
    flex: 1;
    width: 100%;
    border: none;
    padding: 1rem;
    resize: none;
    outline: none;
    font-family: 'IBM Plex Mono', 'Consolas', monospace;
    font-size: 1.1rem;
    line-height: 1.5;
    background: transparent;
    color: #111;
    box-sizing: border-box;
  }

  .tools-scroll-area {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    background: #fdfae5;
  }

  .result-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  @media (max-width: 600px) {
    .result-grid {
      grid-template-columns: 1fr;
    }
  }

  .result-card {
    background: #fff;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    display: flex;
    flex-direction: column;
  }

  .result-card.has-val {
    border-color: #111;
  }

  .card-header {
    padding: 0.5rem 1rem;
    border-bottom: 3px solid #111;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
  }

  .card-body {
    flex: 1;
    padding: 1rem;
    display: flex;
    align-items: center;
  }

  .converted-val {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1.2rem;
    font-weight: 700;
    word-break: break-all;
    color: #ff4b4b;
  }

  .placeholder {
    color: #999;
  }

  .card-footer {
    padding: 0.5rem 1rem;
    border-top: 3px solid #111;
    background: #fdfae5;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-footer code {
    font-size: 0.8rem;
    color: #666;
  }

  .copy-btn {
    padding: 0.2rem 0.5rem;
    font-size: 0.8rem;
    border-width: 2px;
    box-shadow: 2px 2px 0px #111;
  }

  .copy-btn:hover {
    box-shadow: 3px 3px 0px #111;
  }

  .mt-2 {
    margin-top: 2rem;
  }

  .tips-section {
    border: 3px solid #111;
    background: #fff;
    box-shadow: 6px 6px 0px #111;
  }

  .tips-title {
    margin: 0;
    padding: 0.8rem 1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1rem;
    font-weight: 900;
    border-bottom: 3px solid #111;
  }

  .format-list {
    padding: 1rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }

  .format-item {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .format-item b {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 0.95rem;
  }

  .format-item span {
    font-family: 'Noto Sans SC', sans-serif;
    font-size: 0.85rem;
    color: #444;
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
  [data-theme='dark'] .tools-scroll-area {
    background: #111;
  }
  [data-theme='dark'] .result-card {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .card-header,
  [data-theme='dark'] .card-footer {
    border-color: #eee;
  }
  [data-theme='dark'] .card-footer {
    background: #222;
  }
  [data-theme='dark'] .converted-val {
    color: #ff4b4b;
  }
  [data-theme='dark'] .card-footer code {
    color: #aaa;
  }
  [data-theme='dark'] .tips-section {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .tips-title {
    border-bottom-color: #eee;
    color: #111;
  }
  [data-theme='dark'] .format-item span {
    color: #ccc;
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
  [data-theme='dark'] .copy-btn {
    box-shadow: 2px 2px 0px #eee;
  }
</style>
