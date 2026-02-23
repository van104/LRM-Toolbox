<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">文本<span>模板()</span></h1>
        <div class="badge">📝 Text Template</div>
      </header>

      <main class="brutal-main">
        <div class="layout-grid">
          <!-- 1. 模板编辑 -->
          <section class="brutal-pane">
            <div class="pane-header bg-yellow">
              <span class="panel-title">1. 模板编辑 (TEMPLATE)</span>
              <div
                class="header-action"
                title="使用 {{'{'}}{{'{'}}key{{'}'}}{{'}'}} 作为占位符，自动从数据中提取变量"
              >
                ℹ️ 提示
              </div>
            </div>
            <div class="editor-wrapper">
              <textarea
                v-model="templateText"
                class="code-editor"
                placeholder="你好 {{'{'}}{{'{'}}name{{'}'}}{{'}'}}，你的验证码是 {{'{'}}{{'{'}}code{{'}'}}{{'}'}}。"
                spellcheck="false"
              ></textarea>
            </div>
            <div v-if="variables.length" class="variable-list">
              <span v-for="v in variables" :key="v" class="var-tag" @click="insertVar(v)">{{
                v
              }}</span>
            </div>
          </section>

          <!-- 2. 数据源 -->
          <section class="brutal-pane">
            <div class="pane-header bg-pink text-white">
              <span class="panel-title">2. 数据源 (DATA)</span>
              <div class="mode-switch">
                <button
                  class="mode-btn"
                  :class="{ active: curDataMode === 'json' }"
                  @click="curDataMode = 'json'"
                >
                  JSON
                </button>
                <button
                  class="mode-btn"
                  :class="{ active: curDataMode === 'csv' }"
                  @click="curDataMode = 'csv'"
                >
                  CSV
                </button>
              </div>
            </div>
            <div class="editor-wrapper">
              <textarea
                v-model="dataInput"
                class="code-editor"
                :placeholder="dataPlaceholder"
                spellcheck="false"
              ></textarea>
            </div>
            <div class="pane-footer flex-between">
              <div class="data-status">
                <span v-if="parsedData.length > 0" class="success"
                  >✅ 已解析 {{ parsedData.length }} 条</span
                >
                <span v-else class="error">⚠️ {{ parseError || '等待输入...' }}</span>
              </div>
              <button class="brutal-btn small-btn" @click="fillDemo">示例</button>
            </div>
          </section>

          <!-- 3. 生成结果 -->
          <section class="brutal-pane">
            <div class="pane-header bg-blue text-white">
              <span class="panel-title">3. 结果 (RESULT)</span>
              <div class="actions">
                <select v-model="separator" class="brutal-input small-input">
                  <option value="\n">换行符</option>
                  <option value=",">逗号</option>
                  <option value=";">分号</option>
                  <option value="custom">自定义</option>
                </select>
                <input
                  v-if="separator === 'custom'"
                  v-model="customSeparator"
                  class="brutal-input small-input"
                  style="width: 60px"
                  placeholder="符号"
                />
                <button class="brutal-btn execute-btn" @click="generate">生成</button>
              </div>
            </div>
            <div class="editor-wrapper">
              <textarea
                v-model="resultText"
                class="code-editor result-editor"
                readonly
                placeholder="生成结果显示在此..."
              ></textarea>
            </div>
            <div class="pane-footer flex-between">
              <span v-if="resultText" class="count-info">{{ resultText.length }} chars</span>
              <span v-else class="count-info">0 chars</span>
              <button class="brutal-btn small-btn" :disabled="!resultText" @click="copyResult">
                复制
              </button>
            </div>
          </section>
        </div>

        <div class="brutal-pane help-section">
          <div class="pane-header bg-green text-white">
            <span class="panel-title">💡 使用指南 (GUIDE)</span>
          </div>
          <div class="pane-body help-grid">
            <div class="help-card">
              <h4>01. 编写模板</h4>
              <p>
                使用 <code>{{ '{' }}{{ '{' }}变量名{{ '}' }}{{ '}' }}</code> 作为占位符。
              </p>
              <div class="example">
                示例：<br />
                你好 <strong>{{ '{' }}{{ '{' }}name{{ '}' }}{{ '}' }}</strong
                >，验证码是 <strong>{{ '{' }}{{ '{' }}code{{ '}' }}{{ '}' }}</strong>
              </div>
            </div>
            <div class="help-card">
              <h4>02. 准备数据</h4>
              <p>支持 <strong>JSON</strong> (对象数组) 或 <strong>CSV</strong> (首行为表头)。</p>
              <div class="example">
                JSON:<br />
                <code>[{"name": "张三", "code": 123}]</code>
              </div>
            </div>
            <div class="help-card">
              <h4>03. 批量生成</h4>
              <p>系统将遍历数据，逐条替换模板变量。</p>
              <div class="example">支持自定义连接符（如换行、逗号）将结果拼接在一起。</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { useCopy } from '@/composables/useCopy';
  import { ElMessage } from 'element-plus';

  const router = useRouter();
  const { copyToClipboard } = useCopy();
  const templateText = ref('');
  const dataInput = ref('');
  const curDataMode = ref('json');
  const resultText = ref('');
  const separator = ref('\n');
  const customSeparator = ref('---');

  const variables = computed(() => {
    const regex = /\{\{\s*([a-zA-Z0-9_$]+)\s*\}\}/g;
    const vars = new Set();
    let match;
    while ((match = regex.exec(templateText.value)) !== null) {
      vars.add(match[1]);
    }
    return Array.from(vars);
  });

  function insertVar(v) {
    templateText.value += `{{${v}}}`;
  }

  const parsedData = ref([]);
  const parseError = ref('');

  const dataPlaceholder = computed(() => {
    if (curDataMode.value === 'json')
      return `[\n  {"name": "Alice", "code": 1234},\n  {"name": "Bob", "code": 5678}\n]`;
    return `name,code\nAlice,1234\nBob,5678`;
  });

  watch([dataInput, curDataMode], () => {
    parseData();
  });

  function parseData() {
    parsedData.value = [];
    parseError.value = '';

    if (!dataInput.value.trim()) return;

    try {
      if (curDataMode.value === 'json') {
        const data = JSON.parse(dataInput.value);
        if (!Array.isArray(data)) throw new Error('JSON必须是数组格式 (Array)');
        parsedData.value = data;
      } else {
        const lines = dataInput.value.split('\n').filter(l => l.trim());
        if (lines.length < 2) throw new Error('CSV至少需要表头和一行数据');

        const headers = lines[0].split(',').map(h => h.trim());
        const list = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',');
          if (cols.length !== headers.length) continue;

          const obj = {};
          headers.forEach((h, idx) => {
            obj[h] = cols[idx] ? cols[idx].trim() : '';
          });
          list.push(obj);
        }
        parsedData.value = list;
      }
    } catch (e) {
      parseError.value = e.message;
    }
  }

  function generate() {
    if (parsedData.value.length === 0) return ElMessage.warning('请先提供有效数据');
    if (!templateText.value) return ElMessage.warning('请填写模板');

    const sep =
      separator.value === 'custom'
        ? customSeparator.value
        : separator.value === '\n'
          ? '\n'
          : separator.value;

    const list = parsedData.value.map(item => {
      return templateText.value.replace(/\{\{\s*([a-zA-Z0-9_$]+)\s*\}\}/g, (_, key) => {
        return item[key] !== undefined ? item[key] : `{{${key}}}`;
      });
    });

    resultText.value = list.join(sep);
    ElMessage.success(`生成 ${list.length} 条数据`);
  }

  function fillDemo() {
    templateText.value = `尊敬的 {{name}}：\n您好！您的账户余额为 {{balance}} 元，请及时处理。\n日期：{{date}}`;

    if (curDataMode.value === 'json') {
      dataInput.value = `[\n  {"name": "张三", "balance": 500, "date": "2026-01-01"},\n  {"name": "李四", "balance": 120, "date": "2026-01-02"}\n]`;
    } else {
      dataInput.value = `name,balance,date\n张三,500,2026-01-01\n李四,120,2026-01-02`;
    }
  }

  function copyResult() {
    copyToClipboard(resultText.value, { success: '已复制' });
  }

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push('/');
  }
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
  .brutal-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .brutal-input {
    background: #fff;
    color: #111;
    border: 3px solid #111;
    padding: 0.4rem 0.8rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    outline: none;
    box-shadow: 3px 3px 0px #111;
  }
  .brutal-input:focus {
    box-shadow: 5px 5px 0px #ff4b4b;
  }

  .text-white .execute-btn {
    background: #fff;
    color: #111;
  }
  .text-white .execute-btn:hover:not(:disabled) {
    background: #ffd900;
    color: #111;
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
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    align-items: stretch;
  }

  @media (max-width: 1024px) {
    .layout-grid {
      grid-template-columns: 1fr;
    }
  }

  .brutal-pane {
    border: 3px solid #111;
    background: #fff;
    box-shadow: 6px 6px 0px #111;
    display: flex;
    flex-direction: column;
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
  .bg-green {
    background: #10b981;
  }
  .text-white {
    color: #fff;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .pane-footer {
    padding: 0.8rem 1rem;
    border-top: 3px solid #111;
    background: #fdfae5;
    font-weight: 700;
    font-size: 0.9rem;
  }
  .flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .editor-wrapper {
    flex: 1;
    min-height: 250px;
    display: flex;
    flex-direction: column;
  }

  .code-editor {
    flex: 1;
    width: 100%;
    border: none;
    padding: 1rem;
    resize: vertical;
    outline: none;
    font-family: 'IBM Plex Mono', 'Consolas', monospace;
    font-size: 0.95rem;
    line-height: 1.5;
    background: transparent;
    color: #111;
    box-sizing: border-box;
  }

  .result-editor {
    background: #f4f4f4;
  }

  .variable-list {
    border-top: 3px dashed #111;
    padding: 0.8rem;
    background: #fdfae5;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .var-tag {
    background: #111;
    color: #ffd900;
    border: 2px solid #111;
    padding: 0.2rem 0.6rem;
    font-weight: 800;
    font-size: 0.85rem;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
  }
  .var-tag:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
  }

  .mode-switch {
    display: flex;
    border: 2px solid #111;
    box-shadow: 3px 3px 0px #111;
    background: #fff;
  }
  .mode-btn {
    border: none;
    background: transparent;
    padding: 0.3rem 0.8rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    cursor: pointer;
    color: #111;
  }
  .mode-btn.active {
    background: #111;
    color: #ff7be5;
  }

  .small-btn {
    padding: 0.3rem 0.8rem;
    font-size: 0.85rem;
  }
  .small-input {
    padding: 0.3rem 0.5rem;
    font-size: 0.85rem;
  }

  .success {
    color: #10b981;
  }
  .error {
    color: #ef4444;
  }

  /* Help section */
  .pane-body {
    padding: 1.5rem;
  }
  .help-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
  @media (max-width: 1024px) {
    .help-grid {
      grid-template-columns: 1fr;
    }
  }
  .help-card {
    border: 3px solid #111;
    padding: 1rem;
    box-shadow: 4px 4px 0px #111;
    background: #fff;
  }
  .help-card h4 {
    font-family: 'Syne', sans-serif;
    font-size: 1.2rem;
    font-weight: 900;
    margin: 0 0 0.5rem 0;
    color: #111;
    border-bottom: 2px dashed #111;
    padding-bottom: 0.5rem;
  }
  .help-card p {
    font-weight: 600;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
  .help-card code {
    background: #111;
    color: #0ea5e9;
    padding: 2px 6px;
    font-weight: bold;
  }
  .example {
    background: #fdfae5;
    padding: 0.8rem;
    border: 2px solid #111;
    font-size: 0.85rem;
    font-weight: 600;
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
  [data-theme='dark'] .pane-footer {
    border-top-color: #eee;
    background: #222;
  }
  [data-theme='dark'] .brutal-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-input {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 3px 3px 0px #eee;
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
  [data-theme='dark'] .variable-list,
  [data-theme='dark'] .example {
    background: #222;
    border-color: #eee;
  }
  [data-theme='dark'] .var-tag {
    box-shadow: 2px 2px 0px #eee;
    border-color: #eee;
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
  [data-theme='dark'] .bg-green {
    background: #065f46;
    color: #fff;
  }
  [data-theme='dark'] .mode-switch {
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
    background: #222;
  }
  [data-theme='dark'] .mode-btn {
    color: #eee;
  }
  [data-theme='dark'] .mode-btn.active {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .help-card {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .help-card h4 {
    border-bottom-color: #eee;
    color: #eee;
  }
</style>
