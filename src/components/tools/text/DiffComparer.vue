<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goHome">← 返回</button>
        <h1 class="brutal-title">差异<span>比较()</span></h1>
        <div class="badge">⚖️ Diff Comparer</div>
      </header>

      <main class="brutal-main">
        <!-- 控制栏 -->
        <section class="brutal-pane control-pane">
          <div class="pane-header bg-pink text-white">
            <span class="panel-title">1. 控制面板 (CONTROLS)</span>
            <div class="panel-actions">
              <button class="brutal-btn icon-btn" @click="handleClear">🗑️ 清空</button>
            </div>
          </div>
          <div class="control-content">
            <div class="primary-actions">
              <button class="brutal-btn execute-btn" @click="handleCompare">⚖️ 比较差异</button>
              <button class="brutal-btn small-btn" @click="handleSwap">🔄 交换文本</button>
            </div>

            <div class="divider-v"></div>

            <div class="control-group">
              <label class="group-label">比较模式</label>
              <div class="radio-group">
                <label class="radio-label">
                  <input v-model="compareMode" type="radio" value="line" />
                  <span class="radio-box">按行</span>
                </label>
                <label class="radio-label">
                  <input v-model="compareMode" type="radio" value="word" />
                  <span class="radio-box">按词</span>
                </label>
                <label class="radio-label">
                  <input v-model="compareMode" type="radio" value="character" />
                  <span class="radio-box">按字符</span>
                </label>
              </div>
            </div>

            <div class="divider-v"></div>

            <div class="control-group options-group">
              <label class="checkbox-label">
                <input v-model="ignoreWhitespace" type="checkbox" /> 忽略空白
              </label>
              <label class="checkbox-label">
                <input v-model="ignoreCase" type="checkbox" /> 忽略大小写
              </label>
            </div>
          </div>
        </section>

        <!-- 输入区域 -->
        <div class="diff-input-grid">
          <section class="brutal-pane">
            <div class="pane-header bg-yellow">
              <span class="panel-title">原始文本 (ORIGINAL)</span>
              <div class="panel-actions">
                <label class="brutal-btn icon-btn" title="上传文件" style="cursor: pointer">
                  <input
                    type="file"
                    hidden
                    accept=".txt,.js,.css,.html,.json,.md"
                    @change="e => handleFileUpload(e, 'original')"
                  />
                  📁 上传
                </label>
                <button class="brutal-btn icon-btn" @click="loadSample('original')">✨ 示例</button>
              </div>
            </div>
            <textarea
              v-model="originalText"
              class="code-editor"
              placeholder="输入原始内容..."
              spellcheck="false"
            ></textarea>
          </section>

          <section class="brutal-pane">
            <div class="pane-header bg-yellow">
              <span class="panel-title">修改后文本 (MODIFIED)</span>
              <div class="panel-actions">
                <label class="brutal-btn icon-btn" title="上传文件" style="cursor: pointer">
                  <input
                    type="file"
                    hidden
                    accept=".txt,.js,.css,.html,.json,.md"
                    @change="e => handleFileUpload(e, 'modified')"
                  />
                  📁 上传
                </label>
                <button class="brutal-btn icon-btn" @click="loadSample('modified')">✨ 示例</button>
              </div>
            </div>
            <textarea
              v-model="modifiedText"
              class="code-editor"
              placeholder="输入修改后内容..."
              spellcheck="false"
            ></textarea>
          </section>
        </div>

        <!-- 结果区域 -->
        <section v-if="diffResult" class="brutal-pane result-pane">
          <div class="pane-header bg-blue text-white">
            <span class="panel-title">2. 对比结果 (RESULT)</span>
            <div class="panel-actions">
              <button class="brutal-btn icon-btn" @click="toggleSideBySide">
                {{ isSideBySide ? '合并视图' : '并排视图' }}
              </button>
              <button class="brutal-btn icon-btn" @click="copyResult">📋 复制</button>
            </div>
          </div>

          <div class="stats-bar">
            <div class="stat-item added"><span class="dot"></span>新增: {{ stats.added }}</div>
            <div class="stat-item removed"><span class="dot"></span>删除: {{ stats.removed }}</div>
            <div class="stat-item modified">
              <span class="dot"></span>修改: {{ stats.modified }}
            </div>
            <div class="stat-item unchanged">
              <span class="dot"></span>未变: {{ stats.unchanged }}
            </div>
          </div>

          <div class="result-content">
            <div v-if="isSideBySide && compareMode === 'line'" class="diff-view side-by-side">
              <div class="side-panel">
                <div class="panel-label">原始</div>
                <div class="diff-content">
                  <div
                    v-for="(line, idx) in sideBySideData.original"
                    :key="'orig-' + idx"
                    class="diff-line"
                    :class="line.type"
                  >
                    <span class="line-num">{{ idx + 1 }}</span>
                    <span class="line-text">{{ line.content }}</span>
                  </div>
                </div>
              </div>
              <div class="side-panel right-panel">
                <div class="panel-label">修改后</div>
                <div class="diff-content">
                  <div
                    v-for="(line, idx) in sideBySideData.modified"
                    :key="'mod-' + idx"
                    class="diff-line"
                    :class="line.type"
                  >
                    <span class="line-num">{{ idx + 1 }}</span>
                    <span class="line-text">{{ line.content }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="diff-view unified">
              <div
                v-for="(item, idx) in diffResult"
                :key="idx"
                class="diff-item"
                :class="item.type"
              >
                <span v-if="item.content === '\n'" class="newline-mark">↵</span>
                <span v-else>{{ item.content }}</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, computed, nextTick } from 'vue';
  import { useCopy } from '@/composables/useCopy';
  import { ElMessage } from 'element-plus';

  const originalText = ref('');
  const modifiedText = ref('');
  const compareMode = ref('line');
  const ignoreWhitespace = ref(false);
  const ignoreCase = ref(false);
  const isSideBySide = ref(false);
  const diffResult = ref(null);
  const stats = reactive({ added: 0, removed: 0, modified: 0, unchanged: 0 });
  const { copyToClipboard } = useCopy();

  function longestCommonSubsequence(a, b) {
    const m = a.length;
    const n = b.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    const lcs = [];
    let i = m,
      j = n;
    while (i > 0 && j > 0) {
      if (a[i - 1] === b[j - 1]) {
        lcs.unshift(a[i - 1]);
        i--;
        j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }
    return lcs;
  }

  function preprocess(text) {
    let res = text;
    if (ignoreWhitespace.value) res = res.replace(/\s+/g, '');
    if (ignoreCase.value) res = res.toLowerCase();
    return res;
  }

  function preprocessItem(item) {
    return preprocess(item);
  }

  function handleCompare() {
    if (!originalText.value && !modifiedText.value) {
      ElMessage.error('请输入需要比较的文本');
      return;
    }

    stats.added = 0;
    stats.removed = 0;
    stats.modified = 0;
    stats.unchanged = 0;

    let arrA = [],
      arrB = [];

    if (compareMode.value === 'line') {
      arrA = originalText.value.split('\n');
      arrB = modifiedText.value.split('\n');
    } else if (compareMode.value === 'word') {
      arrA = originalText.value.split(/(\s+|[.,;!?()[\]{}'"`])/).filter(x => x);
      arrB = modifiedText.value.split(/(\s+|[.,;!?()[\]{}'"`])/).filter(x => x);
    } else {
      arrA = originalText.value.split('');
      arrB = modifiedText.value.split('');
    }

    const compareA = arrA.map(preprocessItem);
    const compareB = arrB.map(preprocessItem);

    const lcs = longestCommonSubsequence(compareA, compareB);

    const result = [];
    let i = 0,
      j = 0;
    let lcsIdx = 0;

    while (i < arrA.length || j < arrB.length) {
      if (lcsIdx >= lcs.length) {
        while (i < arrA.length) {
          result.push({ type: 'removed', content: arrA[i] });
          stats.removed++;
          i++;
        }
        while (j < arrB.length) {
          result.push({ type: 'added', content: arrB[j] });
          stats.added++;
          j++;
        }
        break;
      }

      const currentLCS = lcs[lcsIdx];
      const itemA = arrA[i];
      const itemB = arrB[j];

      const processedA = i < arrA.length ? preprocessItem(itemA) : null;
      const processedB = j < arrB.length ? preprocessItem(itemB) : null;

      if (processedA === currentLCS && processedB === currentLCS) {
        result.push({ type: 'unchanged', content: itemA });
        stats.unchanged++;
        i++;
        j++;
        lcsIdx++;
      } else if (processedB === currentLCS) {
        result.push({ type: 'removed', content: itemA });
        stats.removed++;
        i++;
      } else if (processedA === currentLCS) {
        result.push({ type: 'added', content: itemB });
        stats.added++;
        j++;
      } else {
        if (i < arrA.length) {
          result.push({ type: 'removed', content: itemA });
          stats.removed++;
          i++;
        }
        if (j < arrB.length) {
          result.push({ type: 'added', content: itemB });
          stats.added++;
          j++;
        }
      }
    }

    diffResult.value = result;

    nextTick(() => {
      const container = document.querySelector('.diff-view');
      if (container) {
        const firstDiff = container.querySelector('.added, .removed, .modified');
        if (firstDiff) {
          firstDiff.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  }

  const sideBySideData = computed(() => {
    if (compareMode.value !== 'line' || !diffResult.value) {
      return { original: [], modified: [] };
    }

    const original = [];
    const modified = [];

    diffResult.value.forEach(item => {
      if (item.type === 'unchanged') {
        original.push(item);
        modified.push(item);
      } else if (item.type === 'removed') {
        original.push(item);
        modified.push({ type: 'empty', content: '' });
      } else if (item.type === 'added') {
        original.push({ type: 'empty', content: '' });
        modified.push(item);
      }
    });

    return { original, modified };
  });

  function handleClear() {
    originalText.value = '';
    modifiedText.value = '';
    diffResult.value = null;
  }

  function handleSwap() {
    const temp = originalText.value;
    originalText.value = modifiedText.value;
    modifiedText.value = temp;
    if (diffResult.value) handleCompare();
  }

  function handleFileUpload(event, target) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      if (target === 'original') originalText.value = e.target.result;
      else modifiedText.value = e.target.result;
      ElMessage.success('文件加载成功');
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  function loadSample(target) {
    if (target === 'original') {
      originalText.value = `这是原始文本示例。\n这是第二行内容。\n这是第三行，包含一些关键字。\n第四行内容。\n最后一行。`;
    } else {
      modifiedText.value = `这是修改后的文本示例。\n这是第二行内容，有一些变化。\n这是第三行，包含一些不同的关键字。\n新增的一行内容。\n最后一行，有变化。`;
    }
  }

  function toggleSideBySide() {
    isSideBySide.value = !isSideBySide.value;
  }

  function copyResult() {
    if (!diffResult.value) return;
    const text = diffResult.value
      .map(d => {
        const prefix = d.type === 'added' ? '+ ' : d.type === 'removed' ? '- ' : '  ';
        return prefix + d.content;
      })
      .join(compareMode.value === 'line' ? '\n' : '');

    copyToClipboard(text, { success: '结果已复制' });
  }

  function goHome() {
    if (window.history.length > 1) window.history.back();
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
    gap: 0.5rem;
  }

  .icon-btn {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
    font-family: 'Noto Sans SC', sans-serif;
  }

  .control-content {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    padding: 1.5rem;
    gap: 2rem;
    background: #fdfae5;
  }

  .primary-actions {
    display: flex;
    gap: 1rem;
  }
  .execute-btn {
    background: #fff;
    color: #111;
  }
  .execute-btn:hover:not(:disabled) {
    background: #ffd900;
    color: #111;
  }
  .small-btn {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }

  .control-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .options-group {
    flex-direction: row;
    gap: 1.5rem;
    align-items: center;
    height: 100%;
  }

  .group-label {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    color: #111;
    text-transform: uppercase;
  }

  .radio-group {
    display: flex;
    background: #111;
    padding: 4px;
    gap: 4px;
  }

  .radio-label {
    cursor: pointer;
  }
  .radio-label input {
    display: none;
  }
  .radio-box {
    display: block;
    padding: 0.4rem 0.8rem;
    background: #111;
    color: #fff;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.9rem;
    border: 2px solid transparent;
    transition: all 0.1s;
  }
  .radio-label input:checked + .radio-box {
    background: #ffd900;
    color: #111;
    border-color: #111;
  }

  .checkbox-label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    cursor: pointer;
    font-size: 0.95rem;
  }
  .checkbox-label input[type='checkbox'] {
    appearance: none;
    background-color: #fff;
    width: 20px;
    height: 20px;
    border: 3px solid #111;
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

  .divider-v {
    width: 3px;
    height: 50px;
    background: #111;
  }

  .diff-input-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    height: 350px;
  }

  @media (max-width: 900px) {
    .diff-input-grid {
      grid-template-columns: 1fr;
      height: auto;
    }
    .diff-input-grid .brutal-pane {
      height: 250px;
    }
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
    line-height: 1.6;
    background: #fdfdfd;
    color: #111;
    box-sizing: border-box;
  }

  .result-pane {
    min-height: 400px;
  }

  .stats-bar {
    display: flex;
    gap: 1.5rem;
    padding: 0.8rem 1rem;
    background: #111;
    color: #fff;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    border-bottom: 3px solid #111;
  }
  .stat-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .dot {
    width: 10px;
    height: 10px;
    border: 2px solid #fff;
  }
  .stat-item.added .dot {
    background: #4ade80;
  }
  .stat-item.removed .dot {
    background: #f87171;
  }
  .stat-item.modified .dot {
    background: #facc15;
  }
  .stat-item.unchanged .dot {
    background: #9ca3af;
  }

  .result-content {
    flex: 1;
    background: #fff;
    display: flex;
    flex-direction: column;
  }

  .diff-view.unified {
    padding: 1.5rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1rem;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
  }

  .diff-item {
    display: inline;
    border-radius: 2px;
  }
  .diff-item.added {
    background-color: #86efac;
    color: #14532d;
    font-weight: 700;
    padding: 0 2px;
    border: 1px solid #16a34a;
  }
  .diff-item.removed {
    background-color: #fca5a5;
    color: #7f1d1d;
    font-weight: 700;
    text-decoration: line-through;
    padding: 0 2px;
    border: 1px solid #dc2626;
  }
  .diff-item.unchanged {
    color: #333;
  }

  .side-by-side {
    display: flex;
    flex: 1;
  }
  .side-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .right-panel {
    border-left: 3px solid #111;
  }
  .panel-label {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    padding: 0.5rem;
    background: #fdfae5;
    border-bottom: 3px solid #111;
    text-align: center;
  }

  .diff-content {
    overflow-y: auto;
    font-family: 'IBM Plex Mono', 'Consolas', monospace;
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .diff-line {
    display: flex;
    width: 100%;
    border-bottom: 2px dashed rgba(0, 0, 0, 0.1);
  }
  .diff-line:hover {
    background-color: #fcfcfc;
  }

  .line-num {
    width: 45px;
    text-align: right;
    padding: 4px 8px;
    color: #111;
    font-weight: 700;
    background-color: #fdfae5;
    border-right: 2px solid #111;
    user-select: none;
    flex-shrink: 0;
  }

  .line-text {
    padding: 4px 12px;
    white-space: pre-wrap;
    word-break: break-all;
    flex: 1;
    color: #111;
  }

  .diff-line.removed {
    background-color: #ffe4e6;
  }
  .diff-line.removed .line-num {
    background-color: #fecdd3;
    color: #be123c;
  }
  .diff-line.removed .line-text {
    color: #be123c;
    font-weight: 600;
  }

  .diff-line.added {
    background-color: #dcfce7;
  }
  .diff-line.added .line-num {
    background-color: #bbf7d0;
    color: #15803d;
  }
  .diff-line.added .line-text {
    color: #15803d;
    font-weight: 600;
  }

  .diff-line.empty {
    background-color: #f1f5f9;
    background-image:
      linear-gradient(45deg, #e2e8f0 25%, transparent 25%, transparent 75%, #e2e8f0 75%, #e2e8f0),
      linear-gradient(45deg, #e2e8f0 25%, transparent 25%, transparent 75%, #e2e8f0 75%, #e2e8f0);
    background-size: 10px 10px;
    background-position:
      0 0,
      5px 5px;
    opacity: 0.5;
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
    background: #222;
    color: #eee;
  }
  [data-theme='dark'] .control-content {
    background: #111;
  }
  [data-theme='dark'] .radio-group {
    background: #eee;
  }
  [data-theme='dark'] .radio-box {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .radio-label input:checked + .radio-box {
    background: #ffd900;
    color: #111;
  }
  [data-theme='dark'] .divider-v {
    background: #eee;
  }
  [data-theme='dark'] .group-label {
    color: #eee;
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
  [data-theme='dark'] .stats-bar {
    background: #222;
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .result-content {
    background: #1a1a1a;
  }
  [data-theme='dark'] .diff-line {
    border-bottom-color: #333;
  }
  [data-theme='dark'] .diff-line:hover {
    background-color: #222;
  }
  [data-theme='dark'] .right-panel {
    border-left-color: #eee;
  }
  [data-theme='dark'] .panel-label {
    background: #222;
    border-bottom-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .line-num {
    background-color: #222;
    color: #eee;
    border-right-color: #eee;
  }
  [data-theme='dark'] .line-text {
    color: #eee;
  }
  [data-theme='dark'] .diff-line.removed {
    background-color: rgba(220, 38, 38, 0.2);
  }
  [data-theme='dark'] .diff-line.removed .line-num {
    background-color: rgba(220, 38, 38, 0.3);
    color: #fca5a5;
  }
  [data-theme='dark'] .diff-line.removed .line-text {
    color: #fca5a5;
  }
  [data-theme='dark'] .diff-line.added {
    background-color: rgba(22, 163, 74, 0.2);
  }
  [data-theme='dark'] .diff-line.added .line-num {
    background-color: rgba(22, 163, 74, 0.3);
    color: #86efac;
  }
  [data-theme='dark'] .diff-line.added .line-text {
    color: #86efac;
  }
  [data-theme='dark'] .diff-line.empty {
    background-color: #111;
    background-image:
      linear-gradient(45deg, #222 25%, transparent 25%, transparent 75%, #222 75%, #222),
      linear-gradient(45deg, #222 25%, transparent 25%, transparent 75%, #222 75%, #222);
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
  [data-theme='dark'] .execute-btn {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .execute-btn:hover:not(:disabled) {
    background: #ffd900;
  }
</style>
