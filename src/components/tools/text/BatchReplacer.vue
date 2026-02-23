<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goHome">← 返回</button>
        <h1 class="brutal-title">批量<span>替换()</span></h1>
        <div class="badge">🔄 Batch Replacer</div>
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
                :class="['tab-btn', { active: currentTab === 'simple' }]"
                @click="currentTab = 'simple'"
              >
                🔍 普通替换
              </button>
              <button
                :class="['tab-btn', { active: currentTab === 'batch' }]"
                @click="currentTab = 'batch'"
              >
                📝 批量替换
              </button>
              <button
                :class="['tab-btn', { active: currentTab === 'line' }]"
                @click="currentTab = 'line'"
              >
                🛠️ 行处理
              </button>
            </div>

            <div class="tools-scroll-area">
              <div v-if="currentTab === 'simple'" class="tool-group">
                <div class="control-row">
                  <label>查找内容:</label>
                  <input
                    v-model="simpleOptions.find"
                    class="brutal-input"
                    placeholder="输入查找内容"
                  />
                </div>
                <div class="control-row">
                  <label>替换为:</label>
                  <input
                    v-model="simpleOptions.replace"
                    class="brutal-input"
                    placeholder="输入替换内容"
                  />
                </div>

                <div class="control-row checkbox-row">
                  <label class="checkbox-label" title="使用正则表达式">
                    <input v-model="simpleOptions.useRegex" type="checkbox" /> 正则 (Regex)
                  </label>
                  <label class="checkbox-label" title="忽略大小写">
                    <input v-model="simpleOptions.ignoreCase" type="checkbox" /> 忽略大小写
                  </label>
                </div>

                <div class="action-buttons">
                  <button class="brutal-btn execute-btn" @click="doSimpleReplace">执行替换</button>
                </div>
              </div>

              <div v-if="currentTab === 'batch'" class="tool-group">
                <div class="control-row" style="flex: 1; display: flex; flex-direction: column">
                  <label>替换规则 (一行一条):</label>
                  <div class="rule-editor-wrapper">
                    <textarea
                      v-model="batchOptions.rules"
                      class="rule-editor"
                      placeholder="格式支持：&#10;旧词,新词&#10;旧词->新词"
                      spellcheck="false"
                    ></textarea>
                  </div>
                  <span class="hint">支持 CSV 格式 (A,B) 或箭头格式 (A->B)</span>
                </div>

                <div class="control-row checkbox-row">
                  <label class="checkbox-label">
                    <input v-model="batchOptions.useRegex" type="checkbox" /> 启用正则
                  </label>
                </div>

                <div class="action-buttons">
                  <button class="brutal-btn execute-btn" @click="doBatchReplace">
                    执行批量替换
                  </button>
                </div>
              </div>

              <div v-if="currentTab === 'line'" class="tool-group">
                <div class="sub-group">
                  <label class="group-label">修饰 (前后缀)</label>
                  <div class="control-row">
                    <input
                      v-model="lineOptions.prefix"
                      class="brutal-input"
                      placeholder="前缀 (Prefix)"
                    />
                    <input
                      v-model="lineOptions.suffix"
                      class="brutal-input"
                      placeholder="后缀 (Suffix)"
                    />
                  </div>
                  <button class="brutal-btn small-btn mt-2" @click="doLineModify">
                    添加前后缀
                  </button>
                </div>

                <div class="divider"></div>

                <div class="sub-group">
                  <label class="group-label">过滤 (Filter)</label>
                  <div class="control-row">
                    <input
                      v-model="lineOptions.filterText"
                      class="brutal-input"
                      placeholder="关键词"
                    />
                  </div>
                  <div class="flex-row mt-2">
                    <button class="brutal-btn small-btn" @click="doLineFilter('keep')">
                      保留包含行
                    </button>
                    <button class="brutal-btn small-btn" @click="doLineFilter('remove')">
                      删除包含行
                    </button>
                  </div>
                  <button class="brutal-btn small-btn mt-2" @click="doLineFilter('empty')">
                    删除空行
                  </button>
                </div>

                <div class="divider"></div>

                <div class="sub-group">
                  <label class="group-label">补全 (Padding)</label>
                  <div class="flex-row">
                    <input
                      v-model.number="lineOptions.padLength"
                      type="number"
                      class="brutal-input small"
                      placeholder="长度"
                    />
                    <input
                      v-model="lineOptions.padChar"
                      class="brutal-input small"
                      placeholder="字符"
                      maxlength="1"
                    />
                  </div>
                  <div class="flex-row mt-2">
                    <button class="brutal-btn small-btn" @click="doPadding('start')">
                      前补全 (Start)
                    </button>
                    <button class="brutal-btn small-btn" @click="doPadding('end')">
                      后补全 (End)
                    </button>
                  </div>
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

  const currentTab = ref('simple');

  const inputLines = computed(() => (inputText.value ? inputText.value.split('\n').length : 0));
  const outputLines = computed(() => (outputText.value ? outputText.value.split('\n').length : 0));

  const simpleOptions = reactive({
    find: '',
    replace: '',
    useRegex: false,
    ignoreCase: false
  });

  const batchOptions = reactive({
    rules: '',
    useRegex: false
  });

  const lineOptions = reactive({
    prefix: '',
    suffix: '',
    filterText: '',
    padLength: 10,
    padChar: ' '
  });

  function doSimpleReplace() {
    if (!inputText.value) return ElMessage.warning('请先输入文本');
    if (!simpleOptions.find) return ElMessage.warning('请输入查找内容');

    let text = inputText.value;
    try {
      if (simpleOptions.useRegex) {
        const flags = 'g' + (simpleOptions.ignoreCase ? 'i' : '');
        const regex = new RegExp(simpleOptions.find, flags);
        text = text.replace(regex, simpleOptions.replace);
      } else {
        if (simpleOptions.ignoreCase) {
          const flags = 'gi';
          const escapedFind = simpleOptions.find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(escapedFind, flags);
          text = text.replace(regex, simpleOptions.replace);
        } else {
          text = text.split(simpleOptions.find).join(simpleOptions.replace);
        }
      }
      outputText.value = text;
      ElMessage.success('替换完成');
    } catch (e) {
      ElMessage.error('正则错误: ' + e.message);
    }
  }

  function doBatchReplace() {
    if (!inputText.value) return ElMessage.warning('请先输入文本');
    if (!batchOptions.rules) return ElMessage.warning('请先定义替换规则');

    let text = inputText.value;
    const lines = batchOptions.rules.split('\n');

    for (const line of lines) {
      if (!line.trim()) continue;

      let find = '';
      let replace = '';

      if (line.includes('->')) {
        const parts = line.split('->');
        find = parts[0];
        replace = parts.slice(1).join('->');
      } else if (line.includes(',')) {
        const parts = line.split(',');
        find = parts[0];
        replace = parts.slice(1).join(',');
      } else {
        continue;
      }

      if (!find) continue;

      try {
        if (batchOptions.useRegex) {
          const regex = new RegExp(find, 'g');
          text = text.replace(regex, replace);
        } else {
          text = text.split(find).join(replace);
        }
      } catch {
        console.error('Batch rule error', line);
      }
    }

    outputText.value = text;
    ElMessage.success(`批量执行完成`);
  }

  function doLineModify() {
    if (!inputText.value) return ElMessage.warning('请先输入文本');
    const lines = inputText.value.split('\n');
    outputText.value = lines
      .map(line => `${lineOptions.prefix}${line}${lineOptions.suffix}`)
      .join('\n');
    ElMessage.success('前后缀添加完成');
  }

  function doLineFilter(mode) {
    if (!inputText.value) return ElMessage.warning('请先输入文本');
    const lines = inputText.value.split('\n');
    let result = [];

    if (mode === 'empty') {
      result = lines.filter(l => l.trim());
    } else {
      if (!lineOptions.filterText) return ElMessage.warning('请输入过滤关键词');
      if (mode === 'keep') {
        result = lines.filter(l => l.includes(lineOptions.filterText));
      } else if (mode === 'remove') {
        result = lines.filter(l => !l.includes(lineOptions.filterText));
      }
    }

    outputText.value = result.join('\n');
    ElMessage.success(`过滤完成，剩余 ${result.length} 行`);
  }

  function doPadding(mode) {
    if (!inputText.value) return ElMessage.warning('请先输入文本');
    const len = lineOptions.padLength || 10;
    const char = lineOptions.padChar || ' ';
    const lines = inputText.value.split('\n');

    outputText.value = lines
      .map(line => {
        if (mode === 'start') return line.padStart(len, char);
        if (mode === 'end') return line.padEnd(len, char);
        return line;
      })
      .join('\n');
    ElMessage.success('补全完成');
  }

  function fillDemoData() {
    if (currentTab.value === 'simple') {
      inputText.value = `Hello World\nHello Vue\nHello JavaScript`;
      simpleOptions.find = 'Hello';
      simpleOptions.replace = 'Hi';
    } else if (currentTab.value === 'batch') {
      inputText.value = `apple pie\nbanana split\ncherry tart`;
      batchOptions.rules = `apple,red apple\nbanana,yellow banana\ncherry->dark cherry`;
    } else if (currentTab.value === 'line') {
      inputText.value = `Item 1\nItem 2\nError: 404\nItem 3\nError: 500`;
      lineOptions.prefix = '[LOG] ';
      lineOptions.filterText = 'Error';
    }
    ElMessage.success('已加载示例数据');
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

  .rule-editor-wrapper {
    flex: 1;
    min-height: 150px;
    border: 2px solid #111;
    margin-bottom: 0.5rem;
    background: #fff;
    box-shadow: 2px 2px 0px #111;
    display: flex;
    flex-direction: column;
  }
  .rule-editor {
    flex: 1;
    width: 100%;
    border: none;
    padding: 0.8rem;
    resize: none;
    outline: none;
    background: transparent;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.9rem;
    color: #111;
  }
  .hint {
    font-family: 'Noto Sans SC', sans-serif;
    font-size: 0.8rem;
    font-weight: 600;
    background: #fff;
    color: #111;
    border: 2px dashed #111;
    padding: 0.4rem;
    text-align: center;
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
    padding: 0.8rem 0.2rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 0.9rem;
    font-weight: 800;
    background: transparent;
    border: none;
    border-right: 3px solid #111;
    color: #111;
    cursor: pointer;
    transition: all 0.1s;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
    height: 100%;
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
    font-size: 0.9rem;
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

  .brutal-input {
    background: #fff;
    color: #111;
    border: 3px solid #111;
    padding: 0.5rem 0.6rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    outline: none;
    font-size: 0.9rem;
    box-shadow: 2px 2px 0px #111;
  }
  .brutal-input:focus {
    box-shadow: 3px 3px 0px #ff4b4b;
  }
  .brutal-input.small {
    width: 80px;
    flex: none;
  }

  .flex-row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .mt-2 {
    margin-top: 0.5rem;
  }

  .sub-group {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .group-label {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1rem;
    font-weight: 900;
    color: #111;
    text-transform: uppercase;
    background: #111;
    color: #fff;
    padding: 0.4rem;
    display: inline-block;
    align-self: flex-start;
  }

  .divider {
    height: 3px;
    background: #111;
    margin: 0.5rem 0;
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
    box-shadow: 2px 2px 0px #111;
  }
  .small-btn:hover:not(:disabled) {
    box-shadow: 4px 4px 0px #111;
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
  [data-theme='dark'] .code-editor,
  [data-theme='dark'] .rule-editor {
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
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .divider {
    background: #eee;
  }
  [data-theme='dark'] .hint {
    background: #222;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .rule-editor-wrapper {
    background: #222;
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
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
  [data-theme='dark'] .execute-btn {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .execute-btn:hover:not(:disabled) {
    background: #ffd900;
  }
  [data-theme='dark'] .group-label {
    background: #eee;
    color: #111;
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
