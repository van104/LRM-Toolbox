<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="goBack">
          <el-icon>
            <ArrowLeft />
          </el-icon>
          <span>返回</span>
        </el-button>
      </div>
      <h1 class="tool-title">文本对比</h1>
      <div class="header-right">
        <el-button text @click="clearAll">
          <el-icon>
            <Delete />
          </el-icon>
          <span>清空</span>
        </el-button>
      </div>
    </header>

    <div class="tool-content">
      <div class="control-bar">
        <el-radio-group v-model="diffMode" @change="handleModeChange">
          <el-radio-button label="lines">行对比</el-radio-button>
          <el-radio-button label="chars">字符对比</el-radio-button>
          <el-radio-button label="words">单词对比</el-radio-button>
        </el-radio-group>

        <div class="divider"></div>

        <el-radio-group v-model="viewMode" :disabled="diffMode !== 'lines'">
          <el-radio-button label="unified">统一视图</el-radio-button>
          <el-radio-button label="split">左右分栏</el-radio-button>
        </el-radio-group>

        <div class="divider"></div>

        <el-checkbox v-model="ignoreCase" label="忽略大小写" border />
        <el-checkbox
          v-if="diffMode === 'lines'"
          v-model="ignoreWhitespace"
          label="忽略空格"
          border
        />
      </div>

      <div class="input-area">
        <div class="input-column">
          <div class="column-header">
            <span>原始文本 (Original)</span>
            <el-button link type="primary" size="small" @click="pasteToOriginal">粘贴</el-button>
          </div>
          <textarea
            v-model="originalText"
            class="code-editor"
            placeholder="在此输入原始文本..."
            spellcheck="false"
          ></textarea>
        </div>

        <div class="input-column">
          <div class="column-header">
            <span>修改后文本 (Modified)</span>
            <el-button link type="primary" size="small" @click="pasteToModified">粘贴</el-button>
          </div>
          <textarea
            v-model="modifiedText"
            class="code-editor"
            placeholder="在此输入修改后的文本..."
            spellcheck="false"
          ></textarea>
        </div>
      </div>

      <div v-if="originalText || modifiedText" class="result-area">
        <div class="result-header">
          <span>对比结果</span>
          <div class="legend">
            <span class="legend-item added">新增</span>
            <span class="legend-item removed">删除</span>
          </div>
        </div>

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
    </div>

    <footer class="footer">© 2026 LRM工具箱 - 文本对比</footer>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { ArrowLeft, Delete } from '@element-plus/icons-vue';
  import * as Diff from 'diff';

  const router = useRouter();

  const diffMode = ref('lines');
  const viewMode = ref('split');
  const ignoreCase = ref(false);
  const ignoreWhitespace = ref(false);
  const originalText = ref('');
  const modifiedText = ref('');

  function handleModeChange(val) {
    if (val !== 'lines') {
      // Logic for non-line modes if needed in future
    }
  }

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
  .tool-page {
    min-height: 100vh;
    background: #f0f4f8;
    display: flex;
    flex-direction: column;
  }

  .tool-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background: #ffffff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  .tool-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
  }

  .header-left,
  .header-right {
    width: 100px;
  }

  .tool-content {
    flex: 1;
    width: 100%;
    max-width: 1600px;

    margin: 0 auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .control-bar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    background: #ffffff;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.08);
  }

  .divider {
    width: 1px;
    height: 24px;
    background: #e2e8f0;
    margin: 0 0.5rem;
  }

  .input-area {
    display: flex;
    gap: 1rem;
    height: 200px;

    min-height: 150px;
  }

  .input-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #ffffff;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }

  .column-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    background: #f8fafc;
    font-size: 0.825rem;
    font-weight: 600;
    color: #64748b;
  }

  .code-editor {
    flex: 1;
    padding: 0.75rem;
    border: none;
    resize: none;
    font-family: 'Consolas', monospace;
    font-size: 0.875rem;
    line-height: 1.5;
    color: #1e293b;
    outline: none;
    background: transparent;
  }

  .result-area {
    flex: 1;

    background: #ffffff;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 400px;
  }

  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    background: #f8fafc;
    font-weight: 600;
    color: #1e293b;
  }

  .legend {
    display: flex;
    gap: 1rem;
    font-size: 0.75rem;
  }

  .legend-item {
    display: flex;
    align-items: center;
  }

  .legend-item::before {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 2px;
    margin-right: 4px;
  }

  .legend-item.added::before {
    background: #dcfce7;
    border: 1px solid #bbf7d0;
  }

  .legend-item.removed::before {
    background: #fee2e2;
    border: 1px solid #fecaca;
  }

  .diff-viewer-lines {
    flex: 1;
    overflow: auto;
    font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
    font-size: 13px;
    line-height: 20px;
  }

  .diff-row {
    display: flex;
    width: 100%;
  }

  .diff-row:hover {
    background-color: #f8fafc;
  }

  .diff-cell {
    display: flex;
    overflow: hidden;
  }

  .line-num {
    width: 40px;
    text-align: right;
    padding-right: 8px;
    color: #94a3b8;
    background-color: #f8fafc;
    border-right: 1px solid #e2e8f0;
    user-select: none;
    flex-shrink: 0;
  }

  .line-code {
    padding-left: 8px;
    white-space: pre;

    flex: 1;
    overflow-x: hidden;
  }

  .line-code pre {
    margin: 0;
    font-family: inherit;
  }

  .split .diff-cell {
    width: 50%;
  }

  .split .left-cell {
    border-right: 1px solid #e2e8f0;
  }

  .left-cell.removed {
    background-color: #fee2e2;
  }

  .left-cell.removed .line-code {
    background-color: #ffebe9;
    color: #b91c1c;
  }

  .left-cell.removed .line-num {
    background-color: #fca5a5;
    color: #7f1d1d;
    opacity: 0.5;
  }

  .right-cell.added {
    background-color: #dcfce7;
    color: #15803d;
  }

  .right-cell.added .line-code {
    background-color: #e6ffec;
    color: #108539;
  }

  .right-cell.added .line-num {
    background-color: #86efac;
    color: #14532d;
    opacity: 0.5;
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
    opacity: 0.3;
  }

  .diff-viewer-simple {
    padding: 1rem;
    font-family: 'Consolas', monospace;
    font-size: 0.875rem;
    line-height: 1.6;
    white-space: pre-wrap;
    background: #ffffff;
  }

  .diff-part {
    display: inline;
    border-radius: 4px;
  }

  .diff-part.added {
    background-color: #e6ffec;
    color: #108539;
    border: 1px solid #bceac5;
  }

  .diff-part.removed {
    background-color: #ffebe9;
    color: #c9252d;
    text-decoration: line-through;
    border: 1px solid #f9d0ce;
  }

  .diff-part.unchanged {
    color: #64748b;
    opacity: 0.8;
  }

  .no-diff {
    padding: 2rem;
    text-align: center;
    color: #94a3b8;
  }

  [data-theme='dark'] .tool-page {
    background: var(--bg-primary);
  }

  [data-theme='dark'] .tool-header {
    background: var(--bg-secondary);
    border-color: var(--border-color);
  }

  [data-theme='dark'] .tool-title {
    color: var(--text-primary);
  }

  [data-theme='dark'] .control-bar,
  [data-theme='dark'] .input-column,
  [data-theme='dark'] .result-area {
    background: var(--bg-secondary);
    border-color: var(--border-color);
  }

  [data-theme='dark'] .column-header,
  [data-theme='dark'] .result-header {
    background: var(--bg-glass);
    color: var(--text-secondary);
  }

  [data-theme='dark'] .code-editor {
    color: var(--text-primary);
  }

  [data-theme='dark'] .diff-viewer-lines,
  [data-theme='dark'] .diff-viewer-simple {
    background: var(--bg-secondary);
  }

  [data-theme='dark'] .diff-row:hover {
    background-color: rgba(255, 255, 255, 0.02);
  }

  [data-theme='dark'] .line-num {
    background-color: var(--bg-secondary);
    border-color: var(--border-color);
    color: #64748b;
  }

  [data-theme='dark'] .left-cell.removed {
    background-color: rgba(60, 20, 20, 0.5);
  }

  [data-theme='dark'] .left-cell.removed .line-code {
    background-color: rgba(127, 29, 29, 0.1);
    color: #f87171;
  }

  [data-theme='dark'] .left-cell.removed .line-num {
    background-color: rgba(127, 29, 29, 0.2);
  }

  [data-theme='dark'] .right-cell.added {
    background-color: rgba(20, 60, 30, 0.5);
  }

  [data-theme='dark'] .right-cell.added .line-code {
    background-color: rgba(6, 95, 70, 0.1);
    color: #4ade80;
  }

  [data-theme='dark'] .right-cell.added .line-num {
    background-color: rgba(6, 95, 70, 0.2);
  }

  [data-theme='dark'] .diff-cell.empty {
    background-image:
      linear-gradient(45deg, #1e293b 25%, transparent 25%, transparent 75%, #1e293b 75%, #1e293b),
      linear-gradient(45deg, #1e293b 25%, transparent 25%, transparent 75%, #1e293b 75%, #1e293b);
    opacity: 0.2;
  }

  [data-theme='dark'] .split .left-cell {
    border-color: var(--border-color);
  }

  .footer {
    text-align: center;
    padding: 3rem 0;
    color: var(--text-secondary, #64748b);
    font-size: 0.85rem;
  }
</style>
