<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">URL Slug<span>生成器()</span></h1>
        <div class="badge">🔗 Slug Generator</div>
      </header>

      <main class="brutal-main">
        <div class="layout-grid">
          <!-- Settings Pane -->
          <section class="brutal-pane side-pane">
            <div class="pane-header bg-yellow">
              <span class="panel-title">1. 配置设置 (SETTINGS)</span>
            </div>
            <div class="settings-content">
              <div class="control-group">
                <label class="group-label">连接符</label>
                <div class="radio-buttons compact-radio-group">
                  <label class="radio-label">
                    <input
                      v-model="config.separator"
                      type="radio"
                      value="-"
                      @change="generateSlug"
                    />
                    <span class="radio-box"><b>- (连字符)</b></span>
                  </label>
                  <label class="radio-label">
                    <input
                      v-model="config.separator"
                      type="radio"
                      value="_"
                      @change="generateSlug"
                    />
                    <span class="radio-box"><b>_ (下划线)</b></span>
                  </label>
                  <label class="radio-label">
                    <input
                      v-model="config.separator"
                      type="radio"
                      value="."
                      @change="generateSlug"
                    />
                    <span class="radio-box"><b>. (点)</b></span>
                  </label>
                </div>
              </div>

              <div class="divider-h"></div>

              <div class="control-group">
                <label class="group-label">字母大/小写</label>
                <div class="radio-buttons compact-radio-group">
                  <label class="radio-label">
                    <input
                      v-model="config.case"
                      type="radio"
                      value="lower"
                      @change="generateSlug"
                    />
                    <span class="radio-box"><b>全小写</b></span>
                  </label>
                  <label class="radio-label">
                    <input
                      v-model="config.case"
                      type="radio"
                      value="upper"
                      @change="generateSlug"
                    />
                    <span class="radio-box"><b>全大写</b></span>
                  </label>
                  <label class="radio-label">
                    <input
                      v-model="config.case"
                      type="radio"
                      value="original"
                      @change="generateSlug"
                    />
                    <span class="radio-box"><b>保持原样</b></span>
                  </label>
                </div>
              </div>

              <div class="divider-h"></div>

              <div class="control-group">
                <label class="group-label">附加选项</label>
                <label class="checkbox-label">
                  <input v-model="config.chineseToPinyin" type="checkbox" @change="generateSlug" />
                  智能中文转拼音
                </label>
              </div>
            </div>
          </section>

          <!-- Working Area -->
          <div class="work-area">
            <!-- Input pane -->
            <section class="brutal-pane">
              <div class="pane-header bg-pink text-white">
                <span class="panel-title">2. 输入原始文本 (INPUT)</span>
                <div class="panel-actions">
                  <button
                    class="brutal-btn icon-btn"
                    @click="
                      inputText = '';
                      generateSlug();
                    "
                  >
                    🗑️ 清空
                  </button>
                </div>
              </div>
              <div class="editor-wrapper">
                <textarea
                  v-model="inputText"
                  class="code-editor"
                  placeholder="在此输入需要转换的文章标题、文件名等，支持中英文混排..."
                  spellcheck="false"
                  @input="generateSlug"
                ></textarea>
              </div>
            </section>

            <!-- Middle indicator -->
            <div class="switch-area">
              <button class="brutal-btn min-btn bg-yellow text-dark" style="cursor: default">
                ⬇️ 生成结果
              </button>
            </div>

            <!-- Output pane -->
            <section class="brutal-pane">
              <div class="pane-header bg-blue text-white">
                <span class="panel-title">3. Slug生成结果 (OUTPUT)</span>
                <div class="panel-actions">
                  <button class="brutal-btn icon-btn execute-btn text-dark" @click="copyResult">
                    📋 复制
                  </button>
                </div>
              </div>

              <div class="result-area">
                <div v-if="slugResult" class="slug-preview">
                  <div class="slug-text">{{ slugResult }}</div>
                </div>
                <div v-else class="empty-state">
                  <span class="empty-icon">🔗</span>
                  <p>等待输入文本生成 Slug...</p>
                </div>

                <div v-if="slugResult" class="url-demo-box mt-4">
                  <div class="demo-label">示例 URL 预览：</div>
                  <div class="demo-url">
                    <span class="url-base">https://example.com/blog/</span
                    ><span class="url-slug">{{ slugResult }}</span>
                  </div>
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
  import { ref, reactive, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { pinyin } from 'pinyin-pro';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const inputText = ref('');
  const slugResult = ref('');

  const config = reactive({
    separator: '-',
    case: 'lower',
    chineseToPinyin: true
  });

  const generateSlug = () => {
    if (!inputText.value.trim()) {
      slugResult.value = '';
      return;
    }

    let text = inputText.value.trim();

    if (config.chineseToPinyin) {
      // 使用 pinyin-pro 处理中文字符
      text = pinyin(text, {
        toneType: 'none',
        type: 'string',
        nonZh: 'consecutive'
      });
    }

    // 移除非字母数字和空格外的字符
    text = text.replace(/[^\w\s-]/gi, '');

    // 将空格和多个连接符替换为单个连接符
    const sep = config.separator;
    text = text.replace(/[\s\-_.]+/g, sep);

    // 处理大小写
    if (config.case === 'lower') {
      text = text.toLowerCase();
    } else if (config.case === 'upper') {
      text = text.toUpperCase();
    }

    // 去掉首尾的连接符
    const escapedSep = sep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const reStart = new RegExp('^' + escapedSep + '+');
    const reEnd = new RegExp(escapedSep + '+$');
    text = text.replace(reStart, '').replace(reEnd, '');

    slugResult.value = text;
  };

  const copyResult = () => {
    if (!slugResult.value) return;
    navigator.clipboard.writeText(slugResult.value).then(() => {
      ElMessage.success('🚀 Slug 已复制到剪贴板');
    });
  };

  onMounted(() => {
    inputText.value = '2026年我的第一个前端项目';
    generateSlug();
  });
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

  .min-btn {
    padding: 0.8rem 1.6rem;
    font-size: 1.1rem;
    box-shadow: 6px 6px 0px #111;
  }

  .min-btn:hover:not(:disabled) {
    box-shadow: 6px 6px 0px #111;
    transform: none;
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
    min-height: 500px;
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
  .text-dark.execute-btn {
    background: #fff;
    color: #111;
  }

  .execute-btn:hover:not(:disabled),
  .text-dark.execute-btn:hover:not(:disabled) {
    background: #ffd900;
    color: #111;
  }

  .work-area {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
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
    min-height: 150px;
    border: none;
    padding: 1.5rem;
    resize: none;
    outline: none;
    font-family: 'Noto Sans SC', sans-serif;
    font-size: 1.15rem;
    line-height: 1.8;
    background: transparent;
    color: #111;
    box-sizing: border-box;
  }

  .result-area {
    flex: 1;
    padding: 1.5rem;
    background: #fdfdfd;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .slug-preview {
    padding: 2rem;
    background: #fff;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    word-break: break-all;
    text-align: center;
  }

  .slug-text {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1.5rem;
    font-weight: 700;
    color: #ff4b4b;
    text-shadow: 1px 1px 0px #111;
    line-height: 1.5;
  }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #cbd5e1;
    padding: 2rem;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .url-demo-box {
    margin-top: 2rem;
    padding: 1.5rem;
    background: #111;
    color: #fff;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #ffd900;
  }

  .demo-label {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1rem;
    color: #aaa;
    margin-bottom: 0.5rem;
    font-weight: bold;
    text-transform: uppercase;
  }

  .demo-url {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1.15rem;
    word-break: break-all;
    line-height: 1.6;
  }

  .url-base {
    color: #888;
  }

  .url-slug {
    color: #4ade80;
    font-weight: bold;
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

  .radio-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .compact-radio-group {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
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
    min-width: 80px;
  }

  .compact-radio-group .radio-box {
    padding: 0.6rem 1rem;
    text-align: center;
  }

  .radio-box b {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1rem;
  }

  .radio-label input:checked + .radio-box {
    background: #111;
    color: #fff;
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0px #ff4b4b;
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
  [data-theme='dark'] .result-area {
    background: #1a1a1a;
  }
  [data-theme='dark'] .group-label {
    color: #eee;
  }
  [data-theme='dark'] .divider-h {
    background: #eee;
  }
  [data-theme='dark'] .radio-box {
    background: #1a1a1a;
    color: #eee;
    border-color: #eee;
  }
  [data-theme='dark'] .radio-label input:checked + .radio-box {
    background: #eee;
    color: #111;
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
  [data-theme='dark'] .slug-preview {
    background: #222;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .url-demo-box {
    background: #222;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
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
  [data-theme='dark'] .text-dark.execute-btn {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .execute-btn:hover:not(:disabled),
  [data-theme='dark'] .text-dark.execute-btn:hover:not(:disabled) {
    background: #ffd900;
  }
</style>
