<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">文案<span>美化润色()</span></h1>
        <div class="badge">✨ Text Polisher</div>
      </header>

      <main class="brutal-main">
        <div class="layout-grid">
          <!-- Input Area -->
          <section class="brutal-pane">
            <div class="pane-header bg-yellow">
              <span class="panel-title">1. 原始文案 (INPUT)</span>
            </div>
            <div class="editor-wrapper">
              <textarea
                v-model="inputText"
                class="code-editor"
                placeholder="请输入需要润色的文案..."
                spellcheck="false"
              ></textarea>
            </div>
          </section>

          <!-- Middle Switch & Settings -->
          <div class="switch-area">
            <div class="brutal-controls">
              <div class="control-group">
                <div class="control-label">选择风格</div>
                <div class="radio-buttons">
                  <label class="radio-label">
                    <input v-model="style" type="radio" value="business" />
                    <span class="radio-box">💼 商务专业</span>
                  </label>
                  <label class="radio-label">
                    <input v-model="style" type="radio" value="humor" />
                    <span class="radio-box">😄 幽默风趣</span>
                  </label>
                  <label class="radio-label">
                    <input v-model="style" type="radio" value="literary" />
                    <span class="radio-box">🌸 文艺清新</span>
                  </label>
                  <label class="radio-label">
                    <input v-model="style" type="radio" value="simple" />
                    <span class="radio-box">📄 简洁明了</span>
                  </label>
                </div>
              </div>

              <button
                class="brutal-btn action-btn bg-pink text-white mt-4"
                :disabled="isPolishing"
                @click="polishText"
              >
                <span v-if="isPolishing">⏳ 处理中...</span>
                <span v-else>🪄 开始润色</span>
              </button>
            </div>
          </div>

          <!-- Output Area -->
          <section class="brutal-pane">
            <div class="pane-header bg-blue text-white">
              <span class="panel-title">2. 润色结果 (OUTPUT)</span>
              <div class="panel-actions">
                <button class="brutal-btn icon-btn execute-btn text-dark" @click="copyResult">
                  📋 复制
                </button>
              </div>
            </div>

            <div class="result-area">
              <div v-if="!outputText" class="empty-state">
                <span class="empty-icon">📝</span>
                <p>点击"开始润色"后在此处查看结果<br /><small>(注:当前为本地模拟结果)</small></p>
              </div>
              <div v-else class="result-content">
                {{ outputText }}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useCopy } from '@/composables/useCopy';
  import { ElMessage } from 'element-plus';

  const inputText = ref('');
  const outputText = ref('');
  const style = ref('business');
  const isPolishing = ref(false);
  const { copyToClipboard } = useCopy();

  const polishText = () => {
    if (!inputText.value.trim()) {
      ElMessage.warning('请输入文案');
      return;
    }

    isPolishing.value = true;
    outputText.value = '';

    // Simulate API call
    setTimeout(() => {
      const text = inputText.value.trim();
      let polished = '';

      // Mock logic: Apply simple transformations based on style
      switch (style.value) {
        case 'business':
          polished = `尊敬的合作伙伴：\n\n关于您提到的事项，我们经过深入研讨，认为：\n${text}\n\n期待与您达成共识，共创双赢局面。\n\n顺颂商祺。`;
          break;
        case 'humor':
          polished = `哎呀，听说大家对这个感兴趣：\n${text}\n\n是不是觉得很有意思？哈哈，我也这么觉得！如果不服，来打我呀~ (开玩笑的)`;
          break;
        case 'literary':
          polished = `时光荏苒，岁月静好。\n${text}\n\n愿所有的美好都如期而至，愿所有的幸运都不期而遇。`;
          break;
        case 'simple':
          polished = `简而言之：\n${text}\n\n以上。`;
          break;
        default:
          polished = text;
      }

      outputText.value = polished;
      isPolishing.value = false;
      ElMessage.success('润色完成 (模拟数据)');
    }, 1000);
  };

  const copyResult = () => {
    if (!outputText.value) return;
    copyToClipboard(outputText.value, { success: '已复制到剪贴板' });
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
    cursor: not-allowed;
    opacity: 0.7;
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0px #111;
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

  .mt-4 {
    margin-top: 1.5rem;
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

  @media (max-width: 1000px) {
    .layout-grid {
      grid-template-columns: 1fr;
      height: auto;
    }

    .radio-buttons {
      display: grid !important;
      grid-template-columns: 1fr 1fr;
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

  .switch-area {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .brutal-controls {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    width: 200px;
  }

  @media (max-width: 1000px) {
    .brutal-controls {
      width: 100%;
    }
  }

  .control-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .control-label {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1.1rem;
    color: #111;
    text-transform: uppercase;
    text-align: center;
    border-bottom: 3px solid #111;
    padding-bottom: 0.5rem;
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
    display: block;
    padding: 0.8rem;
    background: #fff;
    border: 3px solid #111;
    color: #111;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1rem;
    text-align: center;
  }

  .radio-label input:checked + .radio-box {
    background: #111;
    color: #fff;
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0px #ff4b4b;
  }

  .action-btn {
    padding: 1rem;
    font-size: 1.1rem;
    box-shadow: 6px 6px 0px #111;
  }

  .action-btn:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 8px 8px 0px #111;
  }

  .editor-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .code-editor {
    flex: 1;
    width: 100%;
    min-height: 250px;
    border: none;
    padding: 1.5rem;
    resize: none;
    outline: none;
    font-family: 'Noto Sans SC', sans-serif;
    font-size: 1.25rem;
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

  .result-content {
    font-family: 'Noto Sans SC', sans-serif;
    font-size: 1.25rem;
    line-height: 1.8;
    color: #111;
    padding: 1.5rem;
    word-break: break-word;
    white-space: pre-wrap;
  }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #cbd5e1;
    text-align: center;
    padding: 2rem;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .empty-state small {
    font-size: 0.8rem;
    color: #94a3b8;
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
  [data-theme='dark'] .control-label {
    color: #eee;
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .radio-box {
    background: #1a1a1a;
    color: #eee;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .radio-label input:checked + .radio-box {
    background: #eee;
    color: #111;
    box-shadow: 2px 2px 0px #ff4b4b;
  }
  [data-theme='dark'] .code-editor {
    color: #eee;
  }
  [data-theme='dark'] .result-area {
    background: #1a1a1a;
  }
  [data-theme='dark'] .result-content {
    color: #eee;
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
  [data-theme='dark'] .action-btn {
    background: #9d174d !important;
    color: #fff !important;
  }
</style>
