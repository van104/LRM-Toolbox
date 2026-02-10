<template>
  <div class="text-splitter">
    <nav class="nav-bar">
      <button class="nav-back" @click="goHome">
        <el-icon>
          <ArrowLeft />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>文本拆分与拼接</h1>
        <span class="nav-subtitle">Text Splitter & Joiner</span>
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
      <div class="splitter-layout">
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

          <div class="tools-content">
            <div v-if="currentTab === 'split'" class="tool-group">
              <div class="control-row">
                <label>分隔符:</label>
                <select v-model="splitOptions.separatorType" class="select-input">
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
                  class="text-input"
                />
              </div>

              <div class="divider"></div>

              <div class="control-row">
                <label>固定长度拆分:</label>
                <input
                  v-model.number="splitOptions.length"
                  type="number"
                  min="1"
                  class="text-input"
                  placeholder="字符数"
                />
              </div>

              <div class="action-buttons">
                <button class="action-btn primary" @click="doSplit('separator')">
                  按分隔符拆分
                </button>
                <button class="action-btn" @click="doSplit('length')">按长度拆分</button>
              </div>
            </div>

            <div v-if="currentTab === 'join'" class="tool-group">
              <div class="control-row">
                <label>连接符:</label>
                <input v-model="joinOptions.connector" class="text-input" placeholder="默认为无" />
                <span class="hint">(支持 \n, \t)</span>
              </div>
              <div class="control-row">
                <label>前缀 (Prefix):</label>
                <input v-model="joinOptions.prefix" class="text-input" />
              </div>
              <div class="control-row">
                <label>后缀 (Suffix):</label>
                <input v-model="joinOptions.suffix" class="text-input" />
              </div>

              <div class="control-row checkbox-row">
                <label>
                  <input v-model="joinOptions.removeEmpty" type="checkbox" /> 去除空行
                </label>
                <label> <input v-model="joinOptions.unique" type="checkbox" /> 去重 </label>
              </div>

              <div class="action-buttons">
                <button class="action-btn primary" @click="doJoin">执行拼接</button>
                <button class="action-btn" @click="doToJson">转为 JSON 数组</button>
              </div>
            </div>

            <div v-if="currentTab === 'csv'" class="tool-group">
              <div class="control-row">
                <label>输入分隔符:</label>
                <select v-model="csvOptions.separator" class="select-input">
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
                  class="text-input"
                  placeholder="1 代表第一列"
                />
              </div>

              <div class="action-buttons">
                <button class="action-btn primary" @click="doExtractColumn">提取列数据</button>
                <button class="action-btn" @click="doFormatList('md')">转 Markdown 列表</button>
                <button class="action-btn" @click="doFormatList('html')">转 HTML 列表</button>
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
                <h4>🔪 拆分模式</h4>
                <p>• <b>按分隔符</b>：支持换行、逗号、空格或自定义字符拆分。</p>
                <p>• <b>按长度</b>：将连续文本每 N 个字符切割为一行。</p>
              </div>
              <div class="help-section">
                <h4>🔗 拼接模式</h4>
                <p>• <b>连接符</b>：将多行文本合并时使用的分隔符（支持 <code>\n</code> 换行）。</p>
                <p>• <b>前后缀</b>：为每一行添加统一的开头（Prefix）或结尾（Suffix）。</p>
                <p>• <b>转JSON</b>：直接将多行文本转换为 JSON 字符串数组。</p>
              </div>
              <div class="help-section">
                <h4>📊 表格/列模式</h4>
                <p>• 适用于处理 CSV、Excel 复制的数据。</p>
                <p>• <b>提取列</b>：输入列索引（1代表第一列），提取指定列的所有数据。</p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 文本拆分与拼接</footer>
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
  const currentTab = ref('split');
  const showHelp = ref(false);

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
    if (!inputText.value) return showToast('请先输入文本');
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
    showToast(`拆分完成，共 ${result.length} 项`);
  }

  function doJoin() {
    if (!inputText.value) return showToast('请先输入文本');

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
    showToast('拼接完成');
  }

  function doToJson() {
    if (!inputText.value) return showToast('请先输入文本');
    let lines = inputText.value.split('\n').filter(l => l.trim());
    outputText.value = JSON.stringify(lines, null, 2);
    showToast('JSON 转换完成');
  }

  function doExtractColumn() {
    if (!inputText.value) return showToast('请先输入文本');

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
    showToast(`提取完成，共 ${result.length} 行`);
  }

  function doFormatList(type) {
    if (!inputText.value) return showToast('请先输入文本');
    let lines = inputText.value.split('\n').filter(l => l.trim());

    if (type === 'md') {
      outputText.value = lines.map(l => `- ${l}`).join('\n');
    } else if (type === 'html') {
      outputText.value = '<ul>\n' + lines.map(l => `  <li>${l}</li>`).join('\n') + '\n</ul>';
    }
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
      inputText.value = `ID,Name,Age
1,Alice,25
2,Bob,30
3,Charlie,28`;
      csvOptions.colIndex = 2;
    }
    showToast('已加载当前模式的示例数据');
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

  .text-splitter {
    --bg: #f5f7fa;
    --card: #ffffff;
    --border: #e5e7eb;
    --text: #1f2937;
    --text-secondary: #6b7280;
    --accent: #8b5cf6;

    --accent-light: #f5f3ff;

    font-family: 'Noto Sans SC', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    color: var(--text);
    display: flex;
    flex-direction: column;
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
  }

  .main-content {
    flex: 1;
    max-width: 1400px;
    width: 100%;
    margin: 0 auto;
    padding: 1.5rem;
  }

  .splitter-layout {
    display: flex;
    gap: 1.5rem;
    height: calc(100vh - 120px);
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
    flex: 0.5;
    min-width: 300px;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
  }

  .panel-header {
    padding: 0.8rem 1rem;
    border-bottom: 1px solid var(--border);
    background: #f9fafb;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .panel-title {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--text);
  }

  .panel-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .stats-info {
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-right: 0.5rem;
    background: #f3f4f6;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .icon-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    color: var(--text-secondary);
    transition: all 0.2s;
  }

  .icon-btn:hover {
    color: var(--accent);
    background: var(--accent-light);
  }

  .editor-wrapper {
    flex: 1;
    position: relative;
  }

  .text-editor {
    width: 100%;
    height: 100%;
    border: none;
    resize: none;
    padding: 1rem;
    font-family: inherit;
    font-size: 0.95rem;
    line-height: 1.6;
    outline: none;
    color: var(--text);
    background: transparent;
  }

  .result-editor {
    background: #fdfdfd;
  }

  .tabs-header {
    display: flex;
    border-bottom: 1px solid var(--border);
    background: #f9fafb;
  }

  .tab-btn {
    flex: 1;
    padding: 0.8rem;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-secondary);
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
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
  }

  .tool-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .control-row {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .control-row.checkbox-row {
    flex-direction: row;
    gap: 1.5rem;
    margin-top: 0.5rem;
  }

  .control-row label {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .text-input,
  .select-input {
    padding: 0.6rem;
    border: 1px solid var(--border);
    border-radius: 6px;
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.2s;
  }

  .text-input:focus,
  .select-input:focus {
    border-color: var(--accent);
  }

  .hint {
    font-size: 0.75rem;
    color: #9ca3af;
    font-weight: normal;
  }

  .divider {
    height: 1px;
    background: var(--border);
    margin: 1rem 0;
  }

  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    margin-top: 1rem;
  }

  .action-btn {
    padding: 0.7rem;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: white;
    font-size: 0.9rem;
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
    background: #7c3aed;

    border-color: #7c3aed;
  }

  @media (max-width: 1024px) {
    .splitter-layout {
      flex-direction: column;
      height: auto;
    }

    .panel {
      height: 300px;
    }

    .tools-panel {
      max-width: none;
      height: auto;
    }
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
    font-size: 0.85rem;
    z-index: 1000;
  }

  .toast-enter-active,
  .toast-leave-active {
    transition: all 0.3s ease;
  }

  .toast-enter-from,
  .toast-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
    backdrop-filter: blur(2px);
  }

  .modal-content {
    background: var(--card);
    width: 90%;
    max-width: 500px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    border: 1px solid var(--border);
    animation: modalPop 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
  }

  .modal-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-header h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-secondary);
    line-height: 1;
  }

  .modal-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .help-section h4 {
    margin: 0 0 0.5rem 0;
    font-size: 0.95rem;
    color: var(--accent);
  }

  .help-section p {
    margin: 0.3rem 0;
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  @keyframes modalPop {
    from {
      transform: scale(0.9);
      opacity: 0;
    }

    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  .nav-spacer {
    width: 60px;
    display: flex;
    justify-content: flex-end;
  }

  .help-btn {
    font-size: 1.1rem;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #111827;
      --card: #1f2937;
      --border: #374151;
      --text: #f9fafb;
      --text-secondary: #9ca3af;
      --accent: #a78bfa;
      --accent-light: rgba(167, 139, 250, 0.1);
    }

    .panel-header,
    .tabs-header {
      background: #1f2937;
      border-bottom-color: #374151;
    }

    .tab-btn.active {
      background: #374151;
    }

    .result-editor {
      background: #1f2937;
    }

    .stats-info {
      background: #374151;
      color: #d1d5db;
    }

    .text-input,
    .select-input {
      background: #374151;
      border-color: #4b5563;
      color: white;
    }

    .action-btn {
      background: #374151;
      border-color: #4b5563;
      color: white;
    }

    .action-btn.primary {
      background: var(--accent);
      border-color: var(--accent);
      color: #1f2937;
    }
  }

  .footer {
    text-align: center;
    padding: 3rem 0;
    color: var(--text-secondary, #64748b);
    font-size: 0.85rem;
  }
</style>
