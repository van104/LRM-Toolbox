<template>
  <div class="brutal-wrapper">
    <div class="brutal-container" style="max-width: 1600px">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">Markdown<span>预览()</span></h1>
        <div class="badge">📝 Markdown Tool</div>
      </header>

      <main class="brutal-main">
        <div class="layout-grid">
          <!-- 编辑区 -->
          <section class="brutal-pane">
            <div class="pane-header bg-yellow">
              <span class="panel-title">Markdown 编辑 (EDITOR)</span>
              <div class="panel-actions">
                <button class="brutal-btn icon-btn" @click="clearAll">🗑️ 清空</button>
                <button class="brutal-btn icon-btn" @click="pasteContent">📋 粘贴</button>
              </div>
            </div>
            <div class="editor-wrapper">
              <textarea
                ref="editorRef"
                v-model="markdownInput"
                class="code-editor"
                placeholder="在此输入 Markdown 内容..."
                spellcheck="false"
                @scroll="syncScroll"
              ></textarea>
            </div>
          </section>

          <!-- 预览区 -->
          <section class="brutal-pane">
            <div class="pane-header bg-blue text-white">
              <span class="panel-title">实时预览 (PREVIEW)</span>
              <div class="panel-actions">
                <button class="brutal-btn icon-btn execute-btn" @click="downloadHtml">
                  📤 导出 HTML
                </button>
              </div>
            </div>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div ref="previewRef" class="preview-wrapper markdown-body" v-html="renderedHtml"></div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { marked } from 'marked';
  import DOMPurify from 'dompurify';

  const router = useRouter();

  const markdownInput = ref('# Hello Markdown\n\n开始输入你的内容...');
  const editorRef = ref(null);
  const previewRef = ref(null);

  const renderedHtml = computed(() => {
    const rawHtml = marked.parse(markdownInput.value || '', {
      breaks: true,
      gfm: true
    });
    return DOMPurify.sanitize(rawHtml);
  });

  function syncScroll(e) {
    if (!previewRef.value) return;
    const textarea = e.target;
    const percentage = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);
    const preview = previewRef.value;
    preview.scrollTop = percentage * (preview.scrollHeight - preview.clientHeight);
  }

  function goBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }

  function clearAll() {
    markdownInput.value = '';
  }

  async function pasteContent() {
    try {
      const text = await navigator.clipboard.readText();
      markdownInput.value = text;
    } catch {
      ElMessage.error('无法读取剪贴板');
    }
  }

  function downloadHtml() {
    const blob = new Blob([renderedHtml.value], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `preview-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    ElMessage.success('已导出 HTML');
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

  .layout-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
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
    font-size: 1rem;
    line-height: 1.6;
    background: transparent;
    color: #111;
    box-sizing: border-box;
  }

  .preview-wrapper {
    flex: 1;
    overflow-y: auto;
    padding: 2rem;
    background: #fdfdfd;
  }

  .execute-btn {
    background: #fff;
    color: #111;
  }
  .text-white .execute-btn:hover:not(:disabled) {
    background: #ffd900;
    color: #111;
  }

  /* Markdown Body Styles */
  .markdown-body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    line-height: 1.6;
    color: #111;
  }
  .markdown-body :deep(h1),
  .markdown-body :deep(h2),
  .markdown-body :deep(h3),
  .markdown-body :deep(h4),
  .markdown-body :deep(h5),
  .markdown-body :deep(h6) {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    line-height: 1.25;
  }
  .markdown-body :deep(h1),
  .markdown-body :deep(h2) {
    border-bottom: 3px solid #111;
    padding-bottom: 0.3em;
  }
  .markdown-body :deep(h1) {
    font-size: 2em;
  }
  .markdown-body :deep(h2) {
    font-size: 1.5em;
  }
  .markdown-body :deep(h3) {
    font-size: 1.25em;
  }

  .markdown-body :deep(p) {
    margin-bottom: 16px;
  }
  .markdown-body :deep(a) {
    color: #0ea5e9;
    text-decoration: none;
    font-weight: 600;
  }
  .markdown-body :deep(a:hover) {
    text-decoration: underline;
  }
  .markdown-body :deep(code) {
    padding: 0.2em 0.4em;
    margin: 0;
    font-size: 85%;
    background-color: #ffd900;
    border: 2px solid #111;
    border-radius: 0;
    font-family: 'IBM Plex Mono', monospace;
    color: #111;
    font-weight: 600;
  }
  .markdown-body :deep(pre) {
    padding: 16px;
    overflow: auto;
    font-size: 85%;
    line-height: 1.45;
    background-color: #111;
    color: #eee;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #ff7be5;
    border-radius: 0;
    margin-bottom: 16px;
  }
  .markdown-body :deep(pre code) {
    background-color: transparent;
    border: none;
    color: #eee;
    padding: 0;
    font-weight: normal;
  }
  .markdown-body :deep(blockquote) {
    padding: 0 1em;
    color: #111;
    border-left: 6px solid #111;
    background: #fdfae5;
    margin: 0 0 16px 0;
    font-weight: 600;
    font-style: italic;
  }
  .markdown-body :deep(ul),
  .markdown-body :deep(ol) {
    padding-left: 2em;
    margin-bottom: 16px;
  }
  .markdown-body :deep(li + li) {
    margin-top: 0.25em;
  }
  .markdown-body :deep(img) {
    max-width: 100%;
    box-sizing: content-box;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
  }
  .markdown-body :deep(table) {
    border-spacing: 0;
    border-collapse: collapse;
    margin-bottom: 16px;
    width: 100%;
    border: 3px solid #111;
  }
  .markdown-body :deep(table th),
  .markdown-body :deep(table td) {
    padding: 6px 13px;
    border: 2px solid #111;
  }
  .markdown-body :deep(table th) {
    font-weight: 800;
    background-color: #fdfae5;
  }
  .markdown-body :deep(hr) {
    height: 3px;
    background-color: #111;
    border: none;
    margin: 24px 0;
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
  [data-theme='dark'] .preview-wrapper {
    background: #222;
  }
  [data-theme='dark'] .execute-btn {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .execute-btn:hover:not(:disabled) {
    background: #ffd900;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #075985;
    color: #fff;
  }

  [data-theme='dark'] .markdown-body {
    color: #eee;
  }
  [data-theme='dark'] .markdown-body :deep(h1),
  [data-theme='dark'] .markdown-body :deep(h2) {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .markdown-body :deep(a) {
    color: #38bdf8;
  }
  [data-theme='dark'] .markdown-body :deep(code) {
    background-color: #b28f00;
    border-color: #eee;
    color: #111;
  }
  [data-theme='dark'] .markdown-body :deep(pre) {
    background-color: #111;
    border-color: #eee;
    box-shadow: 4px 4px 0px #9d174d;
  }
  [data-theme='dark'] .markdown-body :deep(blockquote) {
    border-left-color: #eee;
    background: #111;
    color: #ccc;
  }
  [data-theme='dark'] .markdown-body :deep(img) {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .markdown-body :deep(table) {
    border-color: #eee;
  }
  [data-theme='dark'] .markdown-body :deep(table th),
  [data-theme='dark'] .markdown-body :deep(table td) {
    border-color: #eee;
  }
  [data-theme='dark'] .markdown-body :deep(table th) {
    background-color: #111;
  }
  [data-theme='dark'] .markdown-body :deep(hr) {
    background-color: #eee;
  }
</style>
