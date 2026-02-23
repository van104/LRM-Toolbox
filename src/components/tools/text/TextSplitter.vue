<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goHome">← 返回</button>
        <h1 class="brutal-title">文本<span>拆分与拼接()</span></h1>
        <div class="badge">✂️ Text Splitter</div>
      </header>

      <main class="brutal-main">
        <div class="layout-grid">
          <!-- 1. 输入 -->
          <section class="brutal-pane">
            <div class="pane-header bg-yellow">
              <span class="panel-title">1. 源文本 (INPUT)</span>
              <div class="panel-actions">
                <span v-if="inputText" class="stats-info"
                  >{{ inputText.length }} 字符 | {{ inputLines }} 行</span
                >
                <button class="brutal-btn icon-btn" title="示例" @click="fillDemoData">
                  ✨ 示例
                </button>
                <button class="brutal-btn icon-btn" title="粘贴" @click="pasteText">📋 粘贴</button>
                <button class="brutal-btn icon-btn" title="清空" @click="clearInput">
                  🗑️ 清空
                </button>
              </div>
            </div>
            <div class="editor-wrapper">
              <textarea
                v-model="inputText"
                class="code-editor"
                placeholder="在此输入需要处理的文本..."
                spellcheck="false"
              ></textarea>
            </div>
          </section>

          <!-- 2. 工具面板 -->
          <section class="brutal-pane">
            <div class="pane-header bg-pink text-white">
              <span class="panel-title">2. 操作面板 (OPERATE)</span>
            </div>
            <div class="mode-tabs">
              <button
                :class="['tab-btn', { active: currentTab === 'split' }]"
                @click="currentTab = 'split'"
              >
                🔪 拆分
              </button>
              <button
                :class="['tab-btn', { active: currentTab === 'join' }]"
                @click="currentTab = 'join'"
              >
                🔗 拼接
              </button>
              <button
                :class="['tab-btn', { active: currentTab === 'csv' }]"
                @click="currentTab = 'csv'"
              >
                📊 表格/列
              </button>
            </div>
            <div class="tools-scroll-area">
              <div v-if="currentTab === 'split'" class="tool-group">
                <div class="control-row">
                  <label>分隔符:</label>
                  <select v-model="splitOptions.separatorType" class="brutal-input">
                    <option value="newline">换行符 (\n)</option>
                    <option value="comma">逗号 (,)</option>
                    <option value="space">空格 ( )</option>
                    <option value="tab">制表符 (\t)</option>
                    <option value="custom">自定义</option>
                  </select>
                </div>
                <div v-if="splitOptions.separatorType === 'custom'" class="control-row">
                  <input
                    v-model="splitOptions.customSeparator"
                    placeholder="输入分隔符"
                    class="brutal-input"
                  />
                </div>

                <div class="divider"></div>

                <div class="control-row">
                  <label>固定长度拆分 (字符数):</label>
                  <input
                    v-model.number="splitOptions.length"
                    type="number"
                    min="1"
                    class="brutal-input"
                    placeholder="10"
                  />
                </div>

                <div class="action-buttons">
                  <button class="brutal-btn execute-btn" @click="doSplit('separator')">
                    按分隔符拆分
                  </button>
                  <button class="brutal-btn small-btn" @click="doSplit('length')">
                    按长度拆分
                  </button>
                </div>
              </div>

              <div v-if="currentTab === 'join'" class="tool-group">
                <div class="control-row">
                  <label>连接符 (支持 \n, \t):</label>
                  <input
                    v-model="joinOptions.connector"
                    class="brutal-input"
                    placeholder="默认为无"
                  />
                </div>
                <div class="control-row">
                  <label>前缀 (Prefix):</label>
                  <input v-model="joinOptions.prefix" class="brutal-input" />
                </div>
                <div class="control-row">
                  <label>后缀 (Suffix):</label>
                  <input v-model="joinOptions.suffix" class="brutal-input" />
                </div>

                <div class="control-row checkbox-row">
                  <label class="checkbox-label">
                    <input v-model="joinOptions.removeEmpty" type="checkbox" /> 去除空行
                  </label>
                  <label class="checkbox-label">
                    <input v-model="joinOptions.unique" type="checkbox" /> 去重
                  </label>
                </div>

                <div class="action-buttons">
                  <button class="brutal-btn execute-btn" @click="doJoin">执行拼接</button>
                  <button class="brutal-btn small-btn" @click="doToJson">转为 JSON 数组</button>
                </div>
              </div>

              <div v-if="currentTab === 'csv'" class="tool-group">
                <div class="control-row">
                  <label>输入分隔符:</label>
                  <select v-model="csvOptions.separator" class="brutal-input">
                    <option value=",">逗号 (,)</option>
                    <option value="\t">制表符 (\t)</option>
                    <option value=" ">空格 ( )</option>
                    <option value="|">竖线 (|)</option>
                  </select>
                </div>
                <div class="control-row">
                  <label>提取列 (索引):</label>
                  <input
                    v-model.number="csvOptions.colIndex"
                    type="number"
                    min="1"
                    class="brutal-input"
                    placeholder="1 代表第一列"
                  />
                </div>

                <div class="action-buttons">
                  <button class="brutal-btn execute-btn" @click="doExtractColumn">
                    提取列数据
                  </button>
                  <button class="brutal-btn small-btn" @click="doFormatList('md')">
                    转 Markdown 列表
                  </button>
                  <button class="brutal-btn small-btn" @click="doFormatList('html')">
                    转 HTML 列表
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- 3. 输出 -->
          <section class="brutal-pane">
            <div class="pane-header bg-blue text-white">
              <span class="panel-title">3. 处理结果 (RESULT)</span>
              <div class="panel-actions">
                <span v-if="outputText" class="stats-info"
                  >{{ outputText.length }} 字符 | {{ outputLines }} 行</span
                >
                <button class="brutal-btn icon-btn" title="复制" @click="copyResult">
                  📋 复制
                </button>
                <button class="brutal-btn icon-btn" title="清空" @click="clearOutput">
                  🗑️ 清空
                </button>
              </div>
            </div>
            <div class="editor-wrapper">
              <textarea
                v-model="outputText"
                class="code-editor result-editor"
                readonly
                placeholder="结果将显示在这里..."
              ></textarea>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useCopy } from '@/composables/useCopy';
  import { ElMessage } from 'element-plus';

  const router = useRouter();
  const { copyToClipboard } = useCopy();
  const inputText = ref('');
  const outputText = ref('');

  const currentTab = ref('split');

  const inputLines = computed(() => (inputText.value ? inputText.value.split('\n').length : 0));
  const outputLines = computed(() => (outputText.value ? outputText.value.split('\n').length : 0));

  const splitOptions = reactive({
    separatorType: 'newline',
    customSeparator: '|',
    length: 10
  });

  const joinOptions = reactive({
    connector: ',',
    prefix: '',
    suffix: '',
    removeEmpty: true,
    unique: false
  });

  const csvOptions = reactive({
    separator: ',',
    colIndex: 1
  });

  function doSplit(mode) {
    if (!inputText.value) return ElMessage.warning('请先输入文本');
    let result = [];

    if (mode === 'separator') {
      let sep = '\n';
      switch (splitOptions.separatorType) {
        case 'newline':
          sep = '\n';
          break;
        case 'comma':
          sep = ',';
          break;
        case 'space':
          sep = ' ';
          break;
        case 'tab':
          sep = '\t';
          break;
        case 'custom':
          sep = splitOptions.customSeparator;
          break;
      }

      if (splitOptions.separatorType === 'custom') {
        sep = sep.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
      }

      result = inputText.value.split(sep);
    } else if (mode === 'length') {
      const len = splitOptions.length || 10;
      const regex = new RegExp(`.{1,${len}}`, 'g');
      const text = inputText.value.replace(/\n/g, '');
      const matches = text.match(regex);
      result = matches || [];
    }

    outputText.value = result.join('\n');
    ElMessage.success(`拆分完成，共 ${result.length} 项`);
  }

  function doJoin() {
    if (!inputText.value) return ElMessage.warning('请先输入文本');

    let lines = inputText.value.split('\n');

    if (joinOptions.removeEmpty) {
      lines = lines.filter(l => l.trim());
    }
    if (joinOptions.unique) {
      lines = [...new Set(lines)];
    }

    if (joinOptions.prefix || joinOptions.suffix) {
      lines = lines.map(l => `${joinOptions.prefix}${l}${joinOptions.suffix}`);
    }

    let conn = joinOptions.connector;
    conn = conn.replace(/\\n/g, '\n').replace(/\\t/g, '\t');

    outputText.value = lines.join(conn);
    ElMessage.success('拼接完成');
  }

  function doToJson() {
    if (!inputText.value) return ElMessage.warning('请先输入文本');
    let lines = inputText.value.split('\n').filter(l => l.trim());
    outputText.value = JSON.stringify(lines, null, 2);
    ElMessage.success('JSON 转换完成');
  }

  function doExtractColumn() {
    if (!inputText.value) return ElMessage.warning('请先输入文本');

    const lines = inputText.value.split('\n');
    const sep = csvOptions.separator.replace(/\\t/g, '\t');
    const colIdx = (csvOptions.colIndex || 1) - 1;

    const result = [];
    lines.forEach(line => {
      if (!line.trim()) return;
      const parts = line.split(sep);
      if (parts[colIdx] !== undefined) {
        result.push(parts[colIdx]);
      }
    });

    outputText.value = result.join('\n');
    ElMessage.success(`提取完成，共 ${result.length} 行`);
  }

  function doFormatList(type) {
    if (!inputText.value) return ElMessage.warning('请先输入文本');
    let lines = inputText.value.split('\n').filter(l => l.trim());

    if (type === 'md') {
      outputText.value = lines.map(l => `- ${l}`).join('\n');
    } else if (type === 'html') {
      outputText.value = '<ul>\n' + lines.map(l => `  <li>${l}</li>`).join('\n') + '\n</ul>';
    }
    ElMessage.success('列表转换完成');
  }

  function fillDemoData() {
    if (currentTab.value === 'split') {
      inputText.value = `Apple,Banana,Cherry,Date,Elderberry`;
      splitOptions.separatorType = 'comma';
    } else if (currentTab.value === 'join') {
      inputText.value = `Apple\nBanana\nCherry`;
      joinOptions.connector = ', ';
      joinOptions.prefix = '"';
      joinOptions.suffix = '"';
    } else if (currentTab.value === 'csv') {
      inputText.value = `ID,Name,Age\n1,Alice,25\n2,Bob,30\n3,Charlie,28`;
      csvOptions.colIndex = 2;
    }
    ElMessage.success('已加载当前模式的示例数据');
  }

  async function pasteText() {
    try {
      const text = await navigator.clipboard.readText();
      inputText.value = text;
    } catch {
      ElMessage.error('无法读取剪贴板');
    }
  }

  function clearInput() {
    inputText.value = '';
    outputText.value = '';
  }

  function clearOutput() {
    outputText.value = '';
  }

  function copyResult() {
    copyToClipboard(outputText.value, { success: '已复制结果' });
  }

  function goHome() {
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
    grid-template-columns: 1fr 380px 1fr;
    gap: 2rem;
    align-items: stretch;
    height: calc(100vh - 180px);
    min-height: 600px;
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
    align-items: center;
    gap: 0.5rem;
  }

  .stats-info {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.8rem;
    font-weight: 700;
    background: #fff;
    color: #111;
    border: 2px solid #111;
    padding: 2px 6px;
  }
  .text-white .stats-info {
    background: #111;
    color: #fff;
    border: 2px solid #fff;
  }

  .icon-btn {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
    font-family: 'Noto Sans SC', sans-serif;
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
    font-size: 0.95rem;
    line-height: 1.5;
    background: transparent;
    color: #111;
    box-sizing: border-box;
  }

  .result-editor {
    background: #fdfdfd;
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
    font-weight: 800;
    background: transparent;
    border: none;
    border-right: 3px solid #111;
    color: #111;
    cursor: pointer;
    transition: all 0.1s;
  }
  .tab-btn:last-child {
    border-right: none;
  }
  .tab-btn.active {
    background: #111;
    color: #ff7be5;
  }

  .tools-scroll-area {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    background: #fdfae5;
  }

  .tool-group {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }

  .control-row {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .control-row label {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    color: #111;
  }

  .brutal-input {
    background: #fff;
    color: #111;
    border: 3px solid #111;
    padding: 0.4rem 0.6rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    outline: none;
    font-size: 0.9rem;
    box-shadow: 3px 3px 0px #111;
  }
  .brutal-input:focus {
    box-shadow: 4px 4px 0px #ff4b4b;
  }

  .divider {
    height: 3px;
    background: #111;
    margin: 0.5rem 0;
  }

  .checkbox-row {
    flex-direction: row;
    gap: 1.5rem;
  }
  .checkbox-label {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
    font-weight: 800;
  }
  .checkbox-label input[type='checkbox'] {
    appearance: none;
    background-color: #fff;
    width: 20px;
    height: 20px;
    border: 2px solid #111;
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

  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    margin-top: 1rem;
  }

  .small-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
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
  [data-theme='dark'] .result-editor {
    background: #222;
  }
  [data-theme='dark'] .mode-tabs {
    background: #1a1a1a;
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .tab-btn {
    color: #eee;
    border-right-color: #eee;
  }
  [data-theme='dark'] .tab-btn.active {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .tools-scroll-area {
    background: #111;
  }
  [data-theme='dark'] .control-row label {
    color: #eee;
  }
  [data-theme='dark'] .brutal-input {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .divider {
    background: #eee;
  }
  [data-theme='dark'] .checkbox-label {
    color: #eee;
  }
  [data-theme='dark'] .checkbox-label input[type='checkbox'] {
    background-color: #222;
    border-color: #eee;
  }
  [data-theme='dark'] .checkbox-label input[type='checkbox']:checked {
    background-color: #eee;
  }
  [data-theme='dark'] .checkbox-label input[type='checkbox']:checked::after {
    color: #111;
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
  [data-theme='dark'] .stats-info {
    background: #222;
    color: #eee;
    border-color: #eee;
  }
</style>
