<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">文本<span>对比()</span></h1>
        <div class="badge">🔍 Text Diff</div>
      </header>

      <main class="brutal-main">
        <!-- 控制栏 -->
        <section class="brutal-pane control-pane">
          <div class="pane-header bg-pink text-white">
            <span class="panel-title">1. 控制面板 (CONTROLS)</span>
            <div class="panel-actions">
              <button class="brutal-btn icon-btn" @click="clearAll">🗑️ 清空</button>
            </div>
          </div>
          <div class="control-content">
            <div class="control-group">
              <label class="group-label">对比模式</label>
              <div class="radio-group">
                <label class="radio-label">
                  <input v-model="diffMode" type="radio" value="lines" />
                  <span class="radio-box">行对比</span>
                </label>
                <label class="radio-label">
                  <input v-model="diffMode" type="radio" value="chars" />
                  <span class="radio-box">字符对比</span>
                </label>
                <label class="radio-label">
                  <input v-model="diffMode" type="radio" value="words" />
                  <span class="radio-box">单词对比</span>
                </label>
              </div>
            </div>

            <div class="divider-v"></div>

            <div class="control-group">
              <label class="group-label">视图模式</label>
              <div class="radio-group" :class="{ disabled: diffMode !== 'lines' }">
                <label class="radio-label">
                  <input
                    v-model="viewMode"
                    type="radio"
                    value="unified"
                    :disabled="diffMode !== 'lines'"
                  />
                  <span class="radio-box">统一视图</span>
                </label>
                <label class="radio-label">
                  <input
                    v-model="viewMode"
                    type="radio"
                    value="split"
                    :disabled="diffMode !== 'lines'"
                  />
                  <span class="radio-box">左右分栏</span>
                </label>
              </div>
            </div>

            <div class="divider-v"></div>

            <div class="control-group options-group">
              <label class="checkbox-label">
                <input v-model="ignoreCase" type="checkbox" /> 忽略大小写
              </label>
              <label v-if="diffMode === 'lines'" class="checkbox-label">
                <input v-model="ignoreWhitespace" type="checkbox" /> 忽略空格
              </label>
            </div>
          </div>
        </section>

        <!-- 输入区域 -->
        <div class="diff-input-grid">
          <section class="brutal-pane">
            <div class="pane-header bg-yellow">
              <span class="panel-title">原始文本 (ORIGINAL)</span>
              <button class="brutal-btn icon-btn" @click="pasteToOriginal">📋 粘贴</button>
            </div>
            <textarea
              v-model="originalText"
              class="code-editor"
              placeholder="在此输入原始文本..."
              spellcheck="false"
            ></textarea>
          </section>

          <section class="brutal-pane">
            <div class="pane-header bg-yellow">
              <span class="panel-title">修改后文本 (MODIFIED)</span>
              <button class="brutal-btn icon-btn" @click="pasteToModified">📋 粘贴</button>
            </div>
            <textarea
              v-model="modifiedText"
              class="code-editor"
              placeholder="在此输入修改后的文本..."
              spellcheck="false"
            ></textarea>
          </section>
        </div>

        <!-- 结果区域 -->
        <section v-if="originalText || modifiedText" class="brutal-pane result-pane">
          <div class="pane-header bg-blue text-white">
            <span class="panel-title">2. 对比结果 (RESULT)</span>
            <div class="legend">
              <span class="legend-item added">新增内容</span>
              <span class="legend-item removed">删除内容</span>
            </div>
          </div>

          <div class="result-content">
            <div v-if="diffMode === 'lines'" class="diff-viewer-lines" :class="viewMode">
              <div v-if="diffRows.length === 0" class="no-diff">
                <template v-if="originalText === modifiedText">无差异 (文本完全一致)</template>
                <template v-else>无差异 (忽略规则后一致)</template>
              </div>

              <div
                v-for="(row, index) in diffRows"
                :key="index"
                class="diff-row"
                :class="{ 'has-diff': row.hasDiff }"
              >
                <div class="diff-cell left-cell" :class="row.left.type">
                  <div class="line-num">{{ row.left.lineNum }}</div>
                  <div class="line-code">
                    <pre>{{ row.left.content }}</pre>
                  </div>
                </div>

                <div class="diff-cell right-cell" :class="row.right.type">
                  <div class="line-num">{{ row.right.lineNum }}</div>
                  <div class="line-code">
                    <pre>{{ row.right.content }}</pre>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="diff-viewer-simple">
              <div v-if="simpleDiffResult.length === 0" class="no-diff">无差异</div>
              <template v-else>
                <span
                  v-for="(part, index) in simpleDiffResult"
                  :key="index"
                  class="diff-part"
                  :class="{
                    added: part.added,
                    removed: part.removed,
                    unchanged: !part.added && !part.removed
                  }"
                  >{{ part.value }}</span
                >
              </template>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import * as Diff from 'diff';

  const router = useRouter();

  const diffMode = ref('lines');
  const viewMode = ref('split');
  const ignoreCase = ref(false);
  const ignoreWhitespace = ref(false);
  const originalText = ref('');
  const modifiedText = ref('');

  const simpleDiffResult = computed(() => {
    if (!originalText.value && !modifiedText.value) return [];
    const options = { ignoreCase: ignoreCase.value };

    if (diffMode.value === 'words') {
      return Diff.diffWords(originalText.value, modifiedText.value, options);
    } else {
      return Diff.diffChars(originalText.value, modifiedText.value, options);
    }
  });

  const diffRows = computed(() => {
    if (diffMode.value !== 'lines' || (!originalText.value && !modifiedText.value)) return [];

    const options = {
      ignoreCase: ignoreCase.value,
      ignoreWhitespace: ignoreWhitespace.value,
      newlineIsToken: false
    };

    const diffs = Diff.diffLines(originalText.value, modifiedText.value, options);

    const rows = [];
    let leftLine = 1;
    let rightLine = 1;

    let removedBuffer = [];

    for (let i = 0; i < diffs.length; i++) {
      const part = diffs[i];

      const lines = part.value.split('\n');
      if (lines.length > 0 && lines[lines.length - 1] === '') {
        lines.pop();
      }
      if (lines.length === 0) continue;

      if (part.added) {
        let startIdx = 0;

        while (startIdx < lines.length && removedBuffer.length > 0) {
          const removedLine = removedBuffer.shift();
          rows.push({
            hasDiff: true,
            left: { lineNum: removedLine.num, content: removedLine.content, type: 'removed' },
            right: { lineNum: rightLine++, content: lines[startIdx], type: 'added' }
          });
          startIdx++;
        }

        for (let k = startIdx; k < lines.length; k++) {
          rows.push({
            hasDiff: true,
            left: { lineNum: '', content: '', type: 'empty' },
            right: { lineNum: rightLine++, content: lines[k], type: 'added' }
          });
        }
      } else if (part.removed) {
        lines.forEach(line => {
          removedBuffer.push({ num: leftLine++, content: line });
        });
      } else {
        while (removedBuffer.length > 0) {
          const removedLine = removedBuffer.shift();
          rows.push({
            hasDiff: true,
            left: { lineNum: removedLine.num, content: removedLine.content, type: 'removed' },
            right: { lineNum: '', content: '', type: 'empty' }
          });
        }

        lines.forEach(line => {
          rows.push({
            hasDiff: false,
            left: { lineNum: leftLine++, content: line, type: 'unchanged' },
            right: { lineNum: rightLine++, content: line, type: 'unchanged' }
          });
        });
      }
    }

    while (removedBuffer.length > 0) {
      const removedLine = removedBuffer.shift();
      rows.push({
        hasDiff: true,
        left: { lineNum: removedLine.num, content: removedLine.content, type: 'removed' },
        right: { lineNum: '', content: '', type: 'empty' }
      });
    }

    return rows;
  });

  function goBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }

  function clearAll() {
    originalText.value = '';
    modifiedText.value = '';
  }

  async function pasteToOriginal() {
    try {
      const text = await navigator.clipboard.readText();
      originalText.value = text;
    } catch {
      ElMessage.error('无法读取剪贴板');
    }
  }

  async function pasteToModified() {
    try {
      const text = await navigator.clipboard.readText();
      modifiedText.value = text;
    } catch {
      ElMessage.error('无法读取剪贴板');
    }
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
  .radio-group.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .radio-label {
    cursor: pointer;
  }
  .radio-label input {
    display: none;
  }
  .radio-box {
    display: block;
    padding: 0.5rem 1rem;
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
    height: 60px;
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

  .legend {
    display: flex;
    gap: 1.5rem;
  }
  .legend-item {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .legend-item::before {
    content: '';
    width: 14px;
    height: 14px;
    border: 2px solid #111;
  }
  .legend-item.added::before {
    background: #4ade80;
  }
  .legend-item.removed::before {
    background: #f87171;
  }

  .result-content {
    flex: 1;
    background: #fff;
    display: flex;
    flex-direction: column;
  }

  .no-diff {
    padding: 2rem;
    text-align: center;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', sans-serif;
    font-size: 1.2rem;
    font-weight: 800;
    color: #999;
  }

  .diff-viewer-lines {
    flex: 1;
    overflow: auto;
    font-family: 'IBM Plex Mono', 'Consolas', monospace;
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .diff-row {
    display: flex;
    width: 100%;
    border-bottom: 2px dashed rgba(0, 0, 0, 0.1);
  }
  .diff-row:last-child {
    border-bottom: none;
  }
  .diff-row:hover {
    background-color: #fcfcfc;
  }

  .diff-cell {
    display: flex;
    overflow: hidden;
    position: relative;
  }
  .split .diff-cell {
    width: 50%;
  }
  .split .left-cell {
    border-right: 3px solid #111;
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

  .line-code {
    padding: 4px 12px;
    white-space: pre-wrap;
    word-break: break-all;
    flex: 1;
    color: #111;
  }
  .line-code pre {
    margin: 0;
    font-family: inherit;
  }

  .left-cell.removed {
    background-color: #ffe4e6;
  }
  .left-cell.removed .line-num {
    background-color: #fecdd3;
    color: #be123c;
  }
  .left-cell.removed .line-code {
    color: #be123c;
    font-weight: 600;
  }

  .right-cell.added {
    background-color: #dcfce7;
  }
  .right-cell.added .line-num {
    background-color: #bbf7d0;
    color: #15803d;
  }
  .right-cell.added .line-code {
    color: #15803d;
    font-weight: 600;
  }

  .diff-cell.empty {
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

  .diff-viewer-simple {
    padding: 1.5rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1rem;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
  }

  .diff-part {
    display: inline;
    border-radius: 2px;
  }
  .diff-part.added {
    background-color: #86efac;
    color: #14532d;
    font-weight: 700;
    padding: 0 2px;
    border: 1px solid #16a34a;
  }
  .diff-part.removed {
    background-color: #fca5a5;
    color: #7f1d1d;
    font-weight: 700;
    text-decoration: line-through;
    padding: 0 2px;
    border: 1px solid #dc2626;
  }
  .diff-part.unchanged {
    color: #333;
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
  [data-theme='dark'] .legend-item::before {
    border-color: #eee;
  }
  [data-theme='dark'] .result-content {
    background: #1a1a1a;
  }
  [data-theme='dark'] .diff-row {
    border-bottom-color: #333;
  }
  [data-theme='dark'] .diff-row:hover {
    background-color: #222;
  }
  [data-theme='dark'] .split .left-cell {
    border-right-color: #eee;
  }
  [data-theme='dark'] .line-num {
    background-color: #222;
    color: #eee;
    border-right-color: #eee;
  }
  [data-theme='dark'] .line-code {
    color: #eee;
  }
  [data-theme='dark'] .left-cell.removed {
    background-color: rgba(220, 38, 38, 0.2);
  }
  [data-theme='dark'] .left-cell.removed .line-num {
    background-color: rgba(220, 38, 38, 0.3);
    color: #fca5a5;
  }
  [data-theme='dark'] .left-cell.removed .line-code {
    color: #fca5a5;
  }
  [data-theme='dark'] .right-cell.added {
    background-color: rgba(22, 163, 74, 0.2);
  }
  [data-theme='dark'] .right-cell.added .line-num {
    background-color: rgba(22, 163, 74, 0.3);
    color: #86efac;
  }
  [data-theme='dark'] .right-cell.added .line-code {
    color: #86efac;
  }
  [data-theme='dark'] .diff-cell.empty {
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
</style>
