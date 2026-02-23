<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goHome">← 返回</button>
        <h1 class="brutal-title">文本<span>清洗()</span></h1>
        <div class="badge">🧹 Text Cleaner</div>
      </header>

      <main class="brutal-main">
        <div class="layout-grid">
          <!-- 1. 输入 -->
          <section class="brutal-pane">
            <div class="pane-header bg-yellow">
              <span class="panel-title">1. 输入文本 (INPUT)</span>
              <div class="panel-actions">
                <span v-if="inputText" class="stats-info"
                  >{{ inputText.length }} 字符 | {{ inputLines }} 行</span
                >
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
                placeholder="在此输入或粘贴需要处理的文本..."
                spellcheck="false"
              ></textarea>
            </div>
          </section>

          <!-- 2. 工具选择 -->
          <section class="brutal-pane">
            <div class="pane-header bg-pink text-white">
              <span class="panel-title">2. 动作 (ACTIONS)</span>
              <div class="panel-actions">
                <button
                  class="brutal-btn icon-btn execute-btn"
                  style="border-color: #fff"
                  :disabled="selectedFunctions.length === 0"
                  @click="executeSelected"
                >
                  🚀 执行 ({{ selectedFunctions.length }})
                </button>
                <button
                  class="brutal-btn icon-btn"
                  style="border-color: #fff"
                  :disabled="selectedFunctions.length === 0"
                  @click="clearSelection"
                >
                  ✖ 清除
                </button>
              </div>
            </div>
            <div class="tools-scroll-area">
              <div class="tool-group">
                <div class="group-title">基础清洗</div>
                <div class="group-content">
                  <button
                    class="tool-btn"
                    :class="{ active: isSelected('removeEmptyLines') }"
                    @click="toggleFunction('removeEmptyLines')"
                  >
                    删除空行
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: isSelected('trimLines') }"
                    @click="toggleFunction('trimLines')"
                  >
                    删除行首尾空格
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: isSelected('removeAllSpaces') }"
                    @click="toggleFunction('removeAllSpaces')"
                  >
                    删除所有空格
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: isSelected('mergeSpaces') }"
                    @click="toggleFunction('mergeSpaces')"
                  >
                    多空格转单空格
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: isSelected('removeDuplicates') }"
                    @click="toggleFunction('removeDuplicates')"
                  >
                    按行去重
                  </button>
                </div>
              </div>

              <div class="tool-group">
                <div class="group-title">排序与反转</div>
                <div class="group-content">
                  <button
                    class="tool-btn"
                    :class="{ active: isSelected('sortLinesAsc') }"
                    @click="toggleFunction('sortLinesAsc')"
                  >
                    按行升序 A-Z
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: isSelected('sortLinesDesc') }"
                    @click="toggleFunction('sortLinesDesc')"
                  >
                    按行降序 Z-A
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: isSelected('shuffleLines') }"
                    @click="toggleFunction('shuffleLines')"
                  >
                    按行打乱
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: isSelected('reverseLines') }"
                    @click="toggleFunction('reverseLines')"
                  >
                    整行反转
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: isSelected('reverseText') }"
                    @click="toggleFunction('reverseText')"
                  >
                    全文倒序
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: isSelected('reverseEachLine') }"
                    @click="toggleFunction('reverseEachLine')"
                  >
                    逐行文本反转
                  </button>
                </div>
              </div>

              <div class="tool-group">
                <div class="group-title">格式转换</div>
                <div class="group-content">
                  <button
                    class="tool-btn"
                    :class="{ active: isSelected('toUpperCase') }"
                    @click="toggleFunction('toUpperCase')"
                  >
                    全大写
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: isSelected('toLowerCase') }"
                    @click="toggleFunction('toLowerCase')"
                  >
                    全小写
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: isSelected('capitalizeLines') }"
                    @click="toggleFunction('capitalizeLines')"
                  >
                    首字母大写
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: isSelected('toHalfWidth') }"
                    @click="toggleFunction('toHalfWidth')"
                  >
                    全角转半角
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: isSelected('toFullWidth') }"
                    @click="toggleFunction('toFullWidth')"
                  >
                    半角转全角
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: isSelected('normalizePunctuation') }"
                    @click="toggleFunction('normalizePunctuation')"
                  >
                    中英文标点规整
                  </button>
                </div>
              </div>

              <div class="tool-group">
                <div class="group-title">排版</div>
                <div class="group-content">
                  <button
                    class="tool-btn"
                    :class="{ active: isSelected('addSequence') }"
                    @click="toggleFunction('addSequence')"
                  >
                    添加行号 (1.)
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: isSelected('addIndent') }"
                    @click="toggleFunction('addIndent')"
                  >
                    添加缩进 (2格)
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: isSelected('removeIndent') }"
                    @click="toggleFunction('removeIndent')"
                  >
                    删除缩进
                  </button>
                  <button
                    class="tool-btn"
                    :class="{ active: isSelected('jsonOneLine') }"
                    @click="toggleFunction('jsonOneLine')"
                  >
                    JSON 转单行
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- 3. 输出 -->
          <section class="brutal-pane">
            <div class="pane-header bg-blue text-white">
              <span class="panel-title">3. 输出文本 (OUTPUT)</span>
              <div class="panel-actions">
                <span v-if="outputText" class="stats-info"
                  >{{ outputText.length }} 字符 | {{ outputLines }} 行</span
                >
                <button class="brutal-btn icon-btn" title="复制结果" @click="copyResult">
                  📋 复制
                </button>
              </div>
            </div>
            <div class="editor-wrapper">
              <textarea
                v-model="outputText"
                class="code-editor result-editor"
                readonly
                placeholder="处理结果将显示在这里..."
              ></textarea>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useCopy } from '@/composables/useCopy';
  import { ElMessage } from 'element-plus';

  const router = useRouter();
  const { copyToClipboard } = useCopy();
  const inputText = ref('');
  const outputText = ref('');
  const selectedFunctions = ref([]);

  function toggleFunction(type) {
    const index = selectedFunctions.value.indexOf(type);
    if (index === -1) {
      selectedFunctions.value.push(type);
    } else {
      selectedFunctions.value.splice(index, 1);
    }
  }

  function isSelected(type) {
    return selectedFunctions.value.includes(type);
  }

  function clearSelection() {
    selectedFunctions.value = [];
  }

  function executeSelected() {
    if (!inputText.value) {
      ElMessage.warning('请输入文本');
      return;
    }
    if (selectedFunctions.value.length === 0) {
      ElMessage.warning('请选择至少一个功能');
      return;
    }

    let text = inputText.value;

    for (const type of selectedFunctions.value) {
      text = processText(text, type);
    }

    outputText.value = text;
    ElMessage.success(`已执行 ${selectedFunctions.value.length} 个功能`);
  }

  const inputLines = computed(() => (inputText.value ? inputText.value.split('\n').length : 0));
  const outputLines = computed(() => (outputText.value ? outputText.value.split('\n').length : 0));

  function processText(text, type) {
    let lines = text.split('\n');
    let result = text;

    switch (type) {
      case 'removeEmptyLines':
        result = lines.filter(line => line.trim() !== '').join('\n');
        break;
      case 'trimLines':
        result = lines.map(line => line.trim()).join('\n');
        break;
      case 'removeAllSpaces':
        result = text.replace(/\s+/g, '');
        break;
      case 'mergeSpaces':
        result = text.replace(/ +/g, ' ');
        break;
      case 'removeDuplicates':
        result = [...new Set(lines)].join('\n');
        break;

      case 'sortLinesAsc':
        result = [...lines].sort().join('\n');
        break;
      case 'sortLinesDesc':
        result = [...lines].sort().reverse().join('\n');
        break;
      case 'shuffleLines':
        result = [...lines].sort(() => Math.random() - 0.5).join('\n');
        break;
      case 'reverseLines':
        result = [...lines].reverse().join('\n');
        break;
      case 'reverseText':
        result = text.split('').reverse().join('');
        break;
      case 'reverseEachLine':
        result = lines.map(line => line.split('').reverse().join('')).join('\n');
        break;

      case 'toUpperCase':
        result = text.toUpperCase();
        break;
      case 'toLowerCase':
        result = text.toLowerCase();
        break;
      case 'capitalizeLines':
        result = lines.map(line => line.charAt(0).toUpperCase() + line.slice(1)).join('\n');
        break;
      case 'toHalfWidth':
        result = text
          .replace(/[\uff01-\uff5e]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
          .replace(/\u3000/g, ' ');
        break;
      case 'toFullWidth':
        result = text
          .replace(/[!-~]/g, c => String.fromCharCode(c.charCodeAt(0) + 0xfee0))
          .replace(/ /g, '\u3000');
        break;
      case 'normalizePunctuation':
        result = text
          .replace(/,/g, '，')
          .replace(/\./g, '。')
          .replace(/\?/g, '？')
          .replace(/!/g, '！')
          .replace(/，，+/g, '，')
          .replace(/。。+/g, '。');
        break;

      case 'addSequence':
        result = lines.map((line, i) => `${i + 1}. ${line}`).join('\n');
        break;
      case 'addIndent':
        result = lines.map(line => `  ${line}`).join('\n');
        break;
      case 'removeIndent':
        result = lines.map(line => line.replace(/^\s+/, '')).join('\n');
        break;
      case 'jsonOneLine':
        try {
          result = JSON.stringify(JSON.parse(text));
        } catch {
          ElMessage.error('无效的 JSON 格式');
        }
        break;
    }

    return result;
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
  .text-white .execute-btn {
    background: #fff;
    color: #111;
  }
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
    font-size: 0.95rem;
    line-height: 1.5;
    background: transparent;
    color: #111;
    box-sizing: border-box;
  }

  .result-editor {
    background: #fdfdfd;
  }

  .tools-scroll-area {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    background: #fdfae5;
  }

  .tool-group {
    margin-bottom: 1.5rem;
  }

  .group-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.2rem;
    font-weight: 900;
    color: #111;
    border-bottom: 3px solid #111;
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
    text-transform: uppercase;
  }

  .group-content {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
  }

  .tool-btn {
    background: #fff;
    border: 2px solid #111;
    padding: 0.6rem 0.5rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', sans-serif;
    font-size: 0.85rem;
    font-weight: 800;
    color: #111;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.1s;
    text-align: center;
  }
  .tool-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
  }
  .tool-btn:active {
    transform: translate(2px, 2px);
    box-shadow: 0 0 0 transparent;
  }

  .tool-btn.active {
    background: #111;
    color: #ff7be5;
    transform: translate(2px, 2px);
    box-shadow: 0 0 0 transparent;
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
  [data-theme='dark'] .tools-scroll-area {
    background: #111;
  }
  [data-theme='dark'] .group-title {
    color: #eee;
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .tool-btn {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .tool-btn.active {
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
