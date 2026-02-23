<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">Markdown表格<span>转换()</span></h1>
        <div class="badge">📊 MD Table Converter</div>
      </header>

      <main class="brutal-main">
        <div class="layout-grid">
          <!-- Input pane -->
          <section class="brutal-pane">
            <div class="pane-header bg-yellow">
              <span class="panel-title">1. Markdown输入 (INPUT)</span>
              <div class="panel-actions">
                <button class="brutal-btn icon-btn" @click="pasteText">📋 粘贴</button>
              </div>
            </div>
            <div class="editor-wrapper">
              <textarea
                v-model="inputText"
                class="code-editor"
                placeholder="| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |"
                spellcheck="false"
              ></textarea>
            </div>
          </section>

          <!-- Middle Switch -->
          <div class="switch-area">
            <button class="brutal-btn min-btn bg-pink text-white" @click="convertToHtml">
              ⚡ 解析转换
            </button>
          </div>

          <!-- Output pane -->
          <section class="brutal-pane">
            <div class="pane-header bg-blue text-white">
              <span class="panel-title">2. HTML输出 (OUTPUT)</span>
              <div class="panel-actions">
                <div class="mode-toggle">
                  <button
                    class="toggle-btn"
                    :class="{ active: viewMode === 'preview' }"
                    @click="viewMode = 'preview'"
                  >
                    预览
                  </button>
                  <button
                    class="toggle-btn"
                    :class="{ active: viewMode === 'code' }"
                    @click="viewMode = 'code'"
                  >
                    代码
                  </button>
                </div>
                <button
                  class="brutal-btn icon-btn text-white execute-btn"
                  :disabled="!htmlOutput"
                  @click="copyHtml"
                >
                  📋 复制
                </button>
              </div>
            </div>

            <div class="result-area">
              <div v-if="!htmlOutput" class="empty-state">
                <span class="empty-icon">📝</span>
                <p>请输入有效的 Markdown 表格</p>
              </div>

              <template v-else>
                <!-- eslint-disable vue/no-v-html -->
                <div
                  v-if="viewMode === 'preview'"
                  class="preview-content"
                  v-html="sanitizedHtml"
                ></div>
                <!-- eslint-enable vue/no-v-html -->
                <div v-else class="editor-wrapper" style="height: 100%">
                  <textarea
                    v-model="htmlOutput"
                    class="code-editor result-editor"
                    readonly
                    spellcheck="false"
                  ></textarea>
                </div>
              </template>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { useCopy } from '@/composables/useCopy';
  import { ElMessage } from 'element-plus';
  import { marked } from 'marked';
  import DOMPurify from 'dompurify';

  const inputText = ref('');
  const htmlOutput = ref('');
  const sanitizedHtml = ref('');
  const viewMode = ref('preview');
  const { copyToClipboard } = useCopy();

  const pasteText = async () => {
    try {
      const text = await navigator.clipboard.readText();
      inputText.value = text;
      convertToHtml();
    } catch {
      ElMessage.error('无法访问剪贴板，请手动粘贴');
    }
  };

  const convertToHtml = async () => {
    if (!inputText.value.trim()) {
      htmlOutput.value = '';
      sanitizedHtml.value = '';
      return;
    }

    try {
      const html = await marked.parse(inputText.value);
      htmlOutput.value = html;
      sanitizedHtml.value = DOMPurify.sanitize(html);
      ElMessage.success('✨ 转换成功');
    } catch (e) {
      console.error(e);
      htmlOutput.value = '转换出错';
    }
  };

  watch(inputText, () => {
    convertToHtml();
  });

  const copyHtml = () => {
    if (!htmlOutput.value) return;
    copyToClipboard(htmlOutput.value, { success: 'HTML代码已复制' });
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

  .brutal-btn:disabled {
    background: #e2e8f0;
    color: #94a3b8;
    border-color: #cbd5e1;
    box-shadow: none;
    transform: none;
    cursor: not-allowed;
  }

  .min-btn {
    padding: 0.8rem 1.6rem;
    font-size: 1.1rem;
    box-shadow: 6px 6px 0px #111;
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

  .icon-btn {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
    font-family: 'Noto Sans SC', sans-serif;
    box-shadow: 2px 2px 0px #111;
  }

  .icon-btn:hover:not(:disabled) {
    box-shadow: 3px 3px 0px #111;
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
    grid-template-columns: 1fr auto 1fr;
    gap: 2rem;
    align-items: stretch;
    height: calc(100vh - 180px);
    min-height: 500px;
  }

  @media (max-width: 900px) {
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
  .text-white.icon-btn {
    color: #111;
    border-color: #111;
  }

  .panel-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .mode-toggle {
    display: flex;
    background: #111;
    padding: 3px;
    gap: 3px;
    border: 2px solid #fff;
  }

  .toggle-btn {
    background: #111;
    color: #fff;
    border: none;
    padding: 0.3rem 0.8rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.1s;
  }

  .toggle-btn.active {
    background: #ffd900;
    color: #111;
  }

  .switch-area {
    display: flex;
    align-items: center;
    justify-content: center;
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
    background: #fdfdfd;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .empty-state {
    flex: 1;
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

  .preview-content {
    padding: 1.5rem;
    font-family: 'Noto Sans SC', sans-serif;
    color: #111;
    overflow-x: auto;
  }

  /* Table styling within preview */
  .preview-content :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 2rem;
    background: #fff;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
  }

  .preview-content :deep(th),
  .preview-content :deep(td) {
    padding: 0.8rem 1rem;
    border: 2px solid #111;
    text-align: left;
  }

  .preview-content :deep(th) {
    background: #fdfae5;
    font-weight: 800;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    text-transform: uppercase;
  }

  .preview-content :deep(tbody tr:nth-child(even)) {
    background: #f8fafc;
  }

  .preview-content :deep(tbody tr:hover) {
    background: #f1f5f9;
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
  [data-theme='dark'] .brutal-btn:disabled {
    background: #333;
    color: #888;
    border-color: #555;
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
  [data-theme='dark'] .mode-toggle {
    border-color: #eee;
    background: #eee;
  }
  [data-theme='dark'] .toggle-btn {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .toggle-btn.active {
    background: #ffd900;
  }
  [data-theme='dark'] .preview-content :deep(table) {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
    background: #1a1a1a;
  }
  [data-theme='dark'] .preview-content :deep(th),
  [data-theme='dark'] .preview-content :deep(td) {
    border-color: #eee;
  }
  [data-theme='dark'] .preview-content :deep(th) {
    background: #222;
  }
  [data-theme='dark'] .preview-content :deep(tbody tr:nth-child(even)) {
    background: #222;
  }
  [data-theme='dark'] .preview-content :deep(tbody tr:hover) {
    background: #333;
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
</style>
