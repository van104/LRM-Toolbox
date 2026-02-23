<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">文案分行<span>整理()</span></h1>
        <div class="badge">✂️ Line Breaker</div>
      </header>

      <main class="brutal-main">
        <div class="layout-grid">
          <!-- Settings Pane -->
          <section class="brutal-pane side-pane">
            <div class="pane-header bg-yellow">
              <span class="panel-title">1. 排版设置 (SETTINGS)</span>
            </div>
            <div class="settings-content">
              <div class="control-group">
                <label class="group-label">单行最大字数: {{ maxLength }}</label>
                <div class="range-wrapper">
                  <input
                    v-model.number="maxLength"
                    type="range"
                    min="10"
                    max="50"
                    step="1"
                    class="brutal-slider"
                  />
                  <span class="range-val">{{ maxLength }}</span>
                </div>
              </div>

              <div class="divider-h"></div>

              <div class="control-group">
                <label class="group-label">分行模式</label>
                <div class="radio-buttons">
                  <label class="radio-label">
                    <input v-model="mode" type="radio" value="smart" />
                    <span class="radio-box">
                      <b>智能语义</b>
                      <small>按标点符号分行</small>
                    </span>
                  </label>
                  <label class="radio-label">
                    <input v-model="mode" type="radio" value="fixed" />
                    <span class="radio-box">
                      <b>固定字数</b>
                      <small>强制字数截断</small>
                    </span>
                  </label>
                </div>
              </div>

              <div class="divider-h"></div>

              <div class="control-group">
                <label class="group-label">附加选项</label>
                <div class="checkboxes">
                  <label class="checkbox-label">
                    <input v-model="removeEmptyLines" type="checkbox" /> 去除原空行
                  </label>
                  <label class="checkbox-label">
                    <input v-model="addSpaceBetween" type="checkbox" /> 段落之间增加空行
                  </label>
                  <label class="checkbox-label">
                    <input v-model="centerMode" type="checkbox" /> 预览强制居中
                  </label>
                </div>
              </div>
            </div>
          </section>

          <!-- Working Area -->
          <div class="work-area">
            <!-- Input pane -->
            <section class="brutal-pane">
              <div class="pane-header bg-pink text-white">
                <span class="panel-title">2. 输入文本 (INPUT)</span>
                <div class="panel-actions">
                  <button class="brutal-btn icon-btn" @click="clearInput">🗑️ 清空</button>
                  <span class="count-badge">{{ inputText.length }} 字</span>
                </div>
              </div>
              <div class="editor-wrapper">
                <textarea
                  v-model="inputText"
                  class="code-editor"
                  placeholder="在此粘贴长文本、歌词或营销文案..."
                  spellcheck="false"
                ></textarea>
              </div>
            </section>

            <!-- Output pane -->
            <section class="brutal-pane">
              <div class="pane-header bg-blue text-white">
                <span class="panel-title">3. 预览结果 (OUTPUT)</span>
                <div class="panel-actions">
                  <span class="count-badge">{{ resultLines.length }} 行</span>
                  <button class="brutal-btn icon-btn execute-btn" @click="handleCopy">
                    📋 复制
                  </button>
                </div>
              </div>
              <div class="result-area" :class="{ centered: centerMode }">
                <div v-if="resultText" class="preview-content">{{ resultText }}</div>
                <div v-else class="empty-state">
                  <span class="empty-icon">📏</span>
                  <p>排版后结果将在此预览</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { useCopy } from '@/composables/useCopy';

  const { copyToClipboard } = useCopy();
  const inputText = ref('');
  const maxLength = ref(18);
  const mode = ref('smart');
  const removeEmptyLines = ref(true);
  const addSpaceBetween = ref(false);
  const centerMode = ref(false);

  const resultLines = computed(() => {
    if (!inputText.value) return [];

    let text = inputText.value;

    if (removeEmptyLines.value) {
      text = text.replace(/^\s*[\r\n]/gm, '');
    }

    let lines = [];

    if (mode.value === 'fixed') {
      const paragraphs = text.split('\n');

      paragraphs.forEach(p => {
        if (!p.trim()) return;
        for (let i = 0; i < p.length; i += maxLength.value) {
          lines.push(p.slice(i, i + maxLength.value));
        }
        if (addSpaceBetween.value) lines.push('');
      });
    } else {
      const paragraphs = text.split('\n');

      paragraphs.forEach(p => {
        p = p.trim();
        if (!p) return;

        const segments = p.split(/([，。！？；;,.!?])/).filter(s => s.trim());

        let currentLine = '';

        for (let i = 0; i < segments.length; i++) {
          const seg = segments[i];

          if (/^[，。！？；;,.!?]$/.test(seg)) {
            currentLine += seg;

            lines.push(currentLine);
            currentLine = '';
            continue;
          }

          if ((currentLine + seg).length > maxLength.value) {
            if (currentLine) {
              lines.push(currentLine);
              currentLine = '';
            }

            if (seg.length > maxLength.value) {
              for (let k = 0; k < seg.length; k += maxLength.value) {
                const chunk = seg.slice(k, k + maxLength.value);
                if (k + maxLength.value >= seg.length) {
                  currentLine = chunk;
                } else {
                  lines.push(chunk);
                }
              }
            } else {
              currentLine = seg;
            }
          } else {
            currentLine += seg;
          }
        }

        if (currentLine) lines.push(currentLine);
        if (addSpaceBetween.value) lines.push('');
      });
    }

    if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();

    return lines;
  });

  const resultText = computed(() => resultLines.value.join('\n'));

  const handleCopy = () => {
    if (!resultText.value) return;
    copyToClipboard(resultText.value, { success: '已复制到剪贴板' });
  };

  const clearInput = () => {
    inputText.value = '';
  };
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
    display: grid;
    grid-template-columns: 340px 1fr;
    gap: 2rem;
    align-items: stretch;
    min-height: 600px;
  }

  @media (max-width: 900px) {
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
    overflow: hidden;
  }

  .side-pane {
    background: #fdfae5;
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
    align-items: center;
  }

  .icon-btn {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
    font-family: 'Noto Sans SC', sans-serif;
    box-shadow: 2px 2px 0px #111;
  }

  .icon-btn:hover {
    box-shadow: 3px 3px 0px #111;
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

  .count-badge {
    background: #111;
    color: #ffd900;
    padding: 0.2rem 0.6rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.9rem;
    font-weight: bold;
    border: 2px solid #fff;
  }

  .work-area {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .editor-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .code-editor {
    flex: 1;
    width: 100%;
    min-height: 200px;
    border: none;
    padding: 1.5rem;
    resize: none;
    outline: none;
    font-family: 'IBM Plex Mono', 'Consolas', monospace;
    font-size: 1.1rem;
    line-height: 1.6;
    background: transparent;
    color: #111;
    box-sizing: border-box;
  }

  .result-area {
    flex: 1;
    padding: 1.5rem;
    background: #fdfdfd;
    overflow-y: auto;
    min-height: 250px;
  }

  .result-area.centered {
    text-align: center;
  }

  .preview-content {
    white-space: pre-wrap;
    font-size: 1.1rem;
    line-height: 2;
    font-weight: 600;
    font-family: 'Noto Sans SC', sans-serif;
  }

  .empty-state {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #cbd5e1;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  /* Settings Panel Styles */
  .settings-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .group-label {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1.1rem;
    color: #111;
    margin-bottom: 0.8rem;
    display: block;
  }

  .divider-h {
    height: 3px;
    background: #111;
    width: 100%;
  }

  .range-wrapper {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .brutal-slider {
    flex: 1;
    -webkit-appearance: none;
    height: 10px;
    background: #111;
    outline: none;
  }

  .brutal-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 30px;
    background: #ff4b4b;
    border: 3px solid #111;
    cursor: pointer;
  }

  .range-val {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 900;
    font-size: 1.2rem;
    background: #111;
    color: #ffd900;
    padding: 0.2rem 0.8rem;
  }

  .radio-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .radio-label {
    cursor: pointer;
    user-select: none;
  }

  .radio-label input {
    display: none;
  }

  .radio-box {
    display: flex;
    flex-direction: column;
    padding: 0.8rem;
    background: #fff;
    border: 3px solid #111;
    color: #111;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
  }

  .radio-box b {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1.1rem;
  }

  .radio-box small {
    font-family: 'Noto Sans SC', sans-serif;
    font-size: 0.85rem;
    color: #555;
    margin-top: 0.2rem;
  }

  .radio-label input:checked + .radio-box {
    background: #111;
    color: #fff;
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0px #ff4b4b;
  }

  .radio-label input:checked + .radio-box small {
    color: #ccc;
  }

  .checkboxes {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .checkbox-label {
    font-size: 1rem;
    font-weight: 800;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .checkbox-label input[type='checkbox'] {
    appearance: none;
    background-color: #fff;
    width: 24px;
    height: 24px;
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
    font-size: 16px;
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
  [data-theme='dark'] .side-pane {
    background: #222;
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
  [data-theme='dark'] .result-area {
    background: #1a1a1a;
  }
  [data-theme='dark'] .group-label {
    color: #eee;
  }
  [data-theme='dark'] .divider-h {
    background: #eee;
  }
  [data-theme='dark'] .brutal-slider {
    background: #eee;
  }
  [data-theme='dark'] .brutal-slider::-webkit-slider-thumb {
    border-color: #eee;
  }
  [data-theme='dark'] .radio-box {
    background: #1a1a1a;
    color: #eee;
    border-color: #eee;
  }
  [data-theme='dark'] .radio-box small {
    color: #aaa;
  }
  [data-theme='dark'] .radio-label input:checked + .radio-box {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .radio-label input:checked + .radio-box small {
    color: #333;
  }
  [data-theme='dark'] .checkbox-label {
    color: #eee;
  }
  [data-theme='dark'] .checkbox-label input[type='checkbox'] {
    border-color: #eee;
    background-color: #1a1a1a;
  }
  [data-theme='dark'] .checkbox-label input[type='checkbox']:checked {
    background-color: #eee;
  }
  [data-theme='dark'] .checkbox-label input[type='checkbox']:checked::after {
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
  [data-theme='dark'] .execute-btn,
  [data-theme='dark'] .text-white .execute-btn {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .execute-btn:hover:not(:disabled),
  [data-theme='dark'] .text-white .execute-btn:hover:not(:disabled) {
    background: #ffd900;
  }
  [data-theme='dark'] .count-badge {
    border-color: #111;
  }
</style>
