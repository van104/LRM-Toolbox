<template>
  <div class="batch-replacer">
    <nav class="nav-bar">
      <button class="nav-back" @click="goHome">
        <el-icon>
          <ArrowLeft />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>批量替换工具</h1>
        <span class="nav-subtitle">Batch Replacer & Cleaner</span>
      </div>
      <div class="nav-spacer">
        <button class="nav-back help-btn" title="使用说明" @click="showHelp = true">
          <el-icon>
            <QuestionFilled />
          </el-icon>
        </button>
      </div>
    </nav>

    <main class="main-content">
      <div class="replacer-layout">
        <section class="panel input-panel">
          <div class="panel-header">
            <span class="panel-title">源文本</span>
            <div class="panel-actions">
              <span v-if="inputText" class="stats-info"
                >{{ inputText.length }} 字符 | {{ inputLines }} 行</span
              >
              <button class="icon-btn" title="示例数据" @click="fillDemoData">
                <span style="font-size: 13px; font-weight: bold">Demo</span>
              </button>
              <button class="icon-btn" title="粘贴" @click="pasteText">
                <el-icon>
                  <CopyDocument />
                </el-icon>
              </button>
              <button class="icon-btn" title="清空" @click="clearInput">
                <el-icon>
                  <Delete />
                </el-icon>
              </button>
            </div>
          </div>
          <div class="editor-wrapper">
            <textarea
              v-model="inputText"
              class="text-editor"
              placeholder="在此输入需要处理的文本..."
              spellcheck="false"
            ></textarea>
          </div>
        </section>

        <section class="tools-panel">
          <div class="tabs-header">
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

          <div class="tools-content">
            <div v-if="currentTab === 'simple'" class="tool-group">
              <div class="control-row">
                <label>查找内容:</label>
                <input v-model="simpleOptions.find" class="text-input" placeholder="输入查找内容" />
              </div>
              <div class="control-row">
                <label>替换为:</label>
                <input
                  v-model="simpleOptions.replace"
                  class="text-input"
                  placeholder="输入替换内容"
                />
              </div>

              <div class="control-row checkbox-row">
                <label title="使用正则表达式">
                  <input v-model="simpleOptions.useRegex" type="checkbox" /> 正则 (Regex)
                </label>
                <label title="忽略大小写">
                  <input v-model="simpleOptions.ignoreCase" type="checkbox" /> 忽略大小写
                </label>
              </div>

              <button class="action-btn primary" @click="doSimpleReplace">执行替换</button>
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
                <label> <input v-model="batchOptions.useRegex" type="checkbox" /> 启用正则 </label>
              </div>

              <button class="action-btn primary" @click="doBatchReplace">执行批量替换</button>
            </div>

            <div v-if="currentTab === 'line'" class="tool-group">
              <div class="sub-group">
                <label class="group-label">修饰 (前后缀)</label>
                <div class="control-row">
                  <input
                    v-model="lineOptions.prefix"
                    class="text-input"
                    placeholder="前缀 (Prefix)"
                  />
                  <input
                    v-model="lineOptions.suffix"
                    class="text-input"
                    placeholder="后缀 (Suffix)"
                  />
                </div>
                <button class="action-btn small" @click="doLineModify">添加前后缀</button>
              </div>

              <div class="divider"></div>

              <div class="sub-group">
                <label class="group-label">过滤 (Filter)</label>
                <div class="control-row">
                  <input v-model="lineOptions.filterText" class="text-input" placeholder="关键词" />
                </div>
                <div class="flex-row">
                  <button class="action-btn small" @click="doLineFilter('keep')">保留包含行</button>
                  <button class="action-btn small" @click="doLineFilter('remove')">
                    删除包含行
                  </button>
                </div>
                <button class="action-btn small" @click="doLineFilter('empty')">删除空行</button>
              </div>

              <div class="divider"></div>

              <div class="sub-group">
                <label class="group-label">补全 (Padding)</label>
                <div class="flex-row">
                  <input
                    v-model.number="lineOptions.padLength"
                    type="number"
                    class="text-input small"
                    placeholder="长度"
                  />
                  <input
                    v-model="lineOptions.padChar"
                    class="text-input small"
                    placeholder="字符"
                    maxlength="1"
                  />
                </div>
                <div class="flex-row">
                  <button class="action-btn small" @click="doPadding('start')">
                    前补全 (Start)
                  </button>
                  <button class="action-btn small" @click="doPadding('end')">后补全 (End)</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="panel output-panel">
          <div class="panel-header">
            <span class="panel-title">处理结果</span>
            <div class="panel-actions">
              <span v-if="outputText" class="stats-info"
                >{{ outputText.length }} 字符 | {{ outputLines }} 行</span
              >
              <button class="icon-btn" title="复制结果" @click="copyResult">
                <el-icon>
                  <CopyDocument />
                </el-icon>
              </button>
              <button class="icon-btn" title="清空" @click="clearOutput">
                <el-icon>
                  <Delete />
                </el-icon>
              </button>
            </div>
          </div>
          <div class="editor-wrapper">
            <textarea
              v-model="outputText"
              class="text-editor result-editor"
              readonly
              placeholder="结果将显示在这里..."
            ></textarea>
          </div>
        </section>
      </div>

      <Transition name="toast">
        <div v-if="toast.show" class="toast">{{ toast.message }}</div>
      </Transition>

      <Transition name="fade">
        <div v-if="showHelp" class="modal-overlay" @click="showHelp = false">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>使用说明</h3>
              <button class="close-btn" @click="showHelp = false">×</button>
            </div>
            <div class="modal-body">
              <div class="help-section">
                <h4>🔍 普通替换</h4>
                <p>• 支持普通文本查找替换。</p>
                <p>• 勾选 <b>正则</b> 可使用正则表达式 (例如 <code>\d+</code> 匹配数字)。</p>
              </div>
              <div class="help-section">
                <h4>📝 批量替换</h4>
                <p>• <b>规则格式</b>：支持两种格式。</p>
                <p>1. CSV格式：<code>旧词,新词</code></p>
                <p>2. 箭头格式：<code>旧词->新词</code></p>
                <p>• 适合批量修改变量名、敏感词替换等场景。</p>
              </div>
              <div class="help-section">
                <h4>🛠️ 行处理</h4>
                <p>• <b>修饰</b>：给每一行加上统一的前缀或后缀。</p>
                <p>• <b>过滤</b>：根据关键词保留或删除特定行。</p>
                <p>• <b>补全</b>：将每行文本用指定字符补齐到固定长度。</p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 批量替换工具</footer>
  </div>
</template>

<script setup>
  import { ref, reactive, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { ArrowLeft, Delete, CopyDocument, QuestionFilled } from '@element-plus/icons-vue';

  const router = useRouter();
  const inputText = ref('');
  const outputText = ref('');
  const toast = reactive({ show: false, message: '' });
  const currentTab = ref('simple');
  const showHelp = ref(false);

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
    if (!inputText.value) return showToast('请先输入文本');
    if (!simpleOptions.find) return showToast('请输入查找内容');

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
      showToast('替换完成');
    } catch (e) {
      showToast('正则错误: ' + e.message);
    }
  }

  function doBatchReplace() {
    if (!inputText.value) return showToast('请先输入文本');
    if (!batchOptions.rules) return showToast('请先定义替换规则');

    let text = inputText.value;
    const lines = batchOptions.rules.split('\n');

    // let count = 0; // Unused variable
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
        // count++; // Unused variable
      } catch {
        console.error('Batch rule error', line);
      }
    }

    outputText.value = text;
    showToast(`批量执行完成`);
  }

  function doLineModify() {
    if (!inputText.value) return showToast('请先输入文本');
    const lines = inputText.value.split('\n');
    outputText.value = lines
      .map(line => `${lineOptions.prefix}${line}${lineOptions.suffix}`)
      .join('\n');
    showToast('前后缀添加完成');
  }

  function doLineFilter(mode) {
    if (!inputText.value) return showToast('请先输入文本');
    const lines = inputText.value.split('\n');
    let result = [];

    if (mode === 'empty') {
      result = lines.filter(l => l.trim());
    } else {
      if (!lineOptions.filterText) return showToast('请输入过滤关键词');
      if (mode === 'keep') {
        result = lines.filter(l => l.includes(lineOptions.filterText));
      } else if (mode === 'remove') {
        result = lines.filter(l => !l.includes(lineOptions.filterText));
      }
    }

    outputText.value = result.join('\n');
    showToast(`过滤完成，剩余 ${result.length} 行`);
  }

  function doPadding(mode) {
    if (!inputText.value) return showToast('请先输入文本');
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
    showToast('补全完成');
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
    showToast('已加载示例数据');
  }

  async function pasteText() {
    try {
      const text = await navigator.clipboard.readText();
      inputText.value = text;
    } catch {
      showToast('无法读取剪贴板');
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
    if (!outputText.value) return;
    navigator.clipboard.writeText(outputText.value).then(() => {
      showToast('已复制结果');
    });
  }

  function showToast(msg) {
    toast.message = msg;
    toast.show = true;
    setTimeout(() => (toast.show = false), 2000);
  }

  function goHome() {
    if (window.history.length > 1) router.back();
    else router.push('/');
  }
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600&display=swap');

  .batch-replacer {
    --bg: #f5f7fa;
    --card: #ffffff;
    --border: #e5e7eb;
    --text: #1f2937;
    --text-secondary: #6b7280;
    --accent: #f59e0b;

    --accent-light: #fffbeb;

    font-family: 'Noto Sans SC', sans-serif;
    background: var(--bg);
    height: 100vh;
    color: var(--text);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background: var(--card);
    border-bottom: 1px solid var(--border);
  }

  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 0.9rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .nav-back:hover {
    background: var(--accent-light);
    color: var(--accent);
  }

  .nav-center h1 {
    font-size: 1.25rem;
    font-weight: 600;
    text-align: center;
  }

  .nav-subtitle {
    display: block;
    font-size: 0.7rem;
    color: var(--text-secondary);
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .nav-spacer {
    width: 60px;
    display: flex;
    justify-content: flex-end;
  }

  .main-content {
    flex: 1;
    max-width: 1400px;
    width: 100%;
    margin: 0 auto;
    padding: 1rem 1.5rem;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .replacer-layout {
    display: flex;
    gap: 1.5rem;
    flex: 1;
    height: auto;
    min-height: 0;
  }

  .panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .tools-panel {
    flex: 0.6;

    min-width: 320px;
    max-width: 450px;
    display: flex;
    flex-direction: column;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
  }

  .panel-header {
    background: #f9fafb;
    padding: 0.8rem 1rem;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .panel-title {
    font-weight: 600;
    color: var(--text);
  }

  .panel-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .icon-btn {
    background: transparent;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: var(--text-secondary);
    border-radius: 4px;
  }

  .icon-btn:hover {
    background: var(--accent-light);
    color: var(--accent);
  }

  .editor-wrapper {
    flex: 1;
    position: relative;
  }

  .text-editor {
    width: 100%;
    height: 100%;
    border: none;
    padding: 1rem;
    resize: none;
    background: transparent;
    color: var(--text);
    outline: none;
    line-height: 1.6;
  }

  .rule-editor-wrapper {
    flex: 1;
    min-height: 150px;
    border: 1px solid var(--border);
    border-radius: 6px;
    margin-bottom: 0.5rem;
    background: #f9fafb;
  }

  .rule-editor {
    width: 100%;
    height: 100%;
    border: none;
    padding: 0.8rem;
    resize: none;
    background: transparent;
    outline: none;
    font-family: monospace;
    font-size: 0.9rem;
  }

  .result-editor {
    background: #fdfdfd;
  }

  .tabs-header {
    display: flex;
    background: #f9fafb;
    border-bottom: 1px solid var(--border);
  }

  .tab-btn {
    flex: 1;
    padding: 0.8rem 0.2rem;
    border: none;
    background: transparent;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    font-weight: 500;
    color: var(--text-secondary);
    font-size: 0.85rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tab-btn.active {
    color: var(--accent);
    border-bottom-color: var(--accent);
    background: white;
  }

  .tools-content {
    flex: 1;
    padding: 1.5rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .tool-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 100%;
  }

  .control-row {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .control-row.checkbox-row {
    flex-direction: row;
    gap: 1.5rem;
    margin-top: 0.5rem;
  }

  .control-row label {
    font-size: 0.85rem;
    color: var(--text-secondary);
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .text-input {
    padding: 0.6rem;
    border: 1px solid var(--border);
    border-radius: 6px;
    outline: none;
  }

  .text-input:focus {
    border-color: var(--accent);
  }

  .text-input.small {
    width: 80px;
  }

  .action-btn {
    padding: 0.7rem;
    border: 1px solid var(--border);
    background: white;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .action-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
  }

  .action-btn.primary {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
  }

  .action-btn.primary:hover {
    background: #d97706;

    border-color: #d97706;
  }

  .action-btn.small {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }

  .sub-group {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .group-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
  }

  .divider {
    height: 1px;
    background: var(--border);
    margin: 0.5rem 0;
  }

  .flex-row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .hint {
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .stats-info,
  .toast {
    font-size: 0.75rem;
    background: #f3f4f6;
    padding: 2px 6px;
    border-radius: 4px;
    color: var(--text-secondary);
  }

  .toast {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 100px;
    z-index: 1000;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 200;
    backdrop-filter: blur(2px);
  }

  .modal-content {
    background: var(--card);
    width: 90%;
    max-width: 500px;
    border-radius: 12px;
    padding: 0;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  .modal-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .help-section h4 {
    color: var(--accent);
    margin-bottom: 0.5rem;
  }

  .help-section p {
    font-size: 0.85rem;
    line-height: 1.5;
    color: var(--text-secondary);
  }

  .close-btn {
    border: none;
    background: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-secondary);
  }

  .footer {
    text-align: center;
    padding: 1rem 0;
    color: var(--text-secondary);
    font-size: 0.85rem;
    flex-shrink: 0;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #111827;
      --card: #1f2937;
      --border: #374151;
      --text: #f9fafb;
      --text-secondary: #9ca3af;
      --accent: #fbbf24;
      --accent-light: rgba(251, 191, 36, 0.1);
    }

    .panel-header,
    .tabs-header,
    .modal-header,
    .rule-editor-wrapper {
      background: #1f2937;
    }

    .result-editor {
      background: #1f2937;
    }

    .text-input,
    .action-btn {
      background: #374151;
      border-color: #4b5563;
      color: white;
    }

    .action-btn.primary {
      background: var(--accent);
      color: #1f2937;
    }

    .tab-btn.active {
      background: #374151;
    }

    .rule-editor {
      background: #374151;
      color: white;
    }
  }
</style>
