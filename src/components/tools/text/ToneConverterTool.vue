<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">语气句式<span>转换()</span></h1>
        <div class="badge">🎭 Tone Converter</div>
      </header>

      <main class="brutal-main">
        <div class="layout-grid">
          <!-- Input pane -->
          <section class="brutal-pane">
            <div class="pane-header bg-yellow">
              <span class="panel-title">1. 输入句子 (INPUT)</span>
            </div>
            <div class="editor-wrapper">
              <textarea
                v-model="inputText"
                class="code-editor"
                placeholder="在此输入需要转换语气的内容...例如：我想请假一天。"
                spellcheck="false"
              ></textarea>
            </div>
          </section>

          <!-- Middle Switch -->
          <div class="switch-area">
            <div class="brutal-controls">
              <div class="control-label">选择目标语气</div>
              <div class="modes-grid">
                <button
                  class="brutal-btn mode-btn"
                  :class="{ 'active-mode': mode === 'question' }"
                  @click="mode = 'question'"
                >
                  <span class="icon">❓</span> <br />疑问
                </button>
                <button
                  class="brutal-btn mode-btn"
                  :class="{ 'active-mode': mode === 'polite' }"
                  @click="mode = 'polite'"
                >
                  <span class="icon">🌸</span> <br />委婉
                </button>
                <button
                  class="brutal-btn mode-btn"
                  :class="{ 'active-mode': mode === 'formal' }"
                  @click="mode = 'formal'"
                >
                  <span class="icon">👔</span> <br />正式
                </button>
                <button
                  class="brutal-btn mode-btn"
                  :class="{ 'active-mode': mode === 'customer' }"
                  @click="mode = 'customer'"
                >
                  <span class="icon">🎧</span> <br />客服
                </button>
              </div>
            </div>
          </div>

          <!-- Output pane -->
          <section class="brutal-pane">
            <div class="pane-header bg-blue text-white">
              <span class="panel-title">2. 转换结果 (OUTPUT)</span>
              <div class="panel-actions">
                <button class="brutal-btn icon-btn execute-btn text-dark" @click="copy">
                  📋 复制
                </button>
              </div>
            </div>

            <div class="result-area">
              <div v-if="inputText.trim()" class="result-content">
                {{ resultText }}
              </div>
              <div v-else class="empty-state">
                <span class="empty-icon">📝</span>
                <p>请输入文字后在此处查看结果</p>
              </div>
            </div>
          </section>
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
  const mode = ref('polite');

  const resultText = computed(() => {
    let text = inputText.value.trim();
    if (!text) return '...';

    const lastChar = text.slice(-1);
    const hasPunctuation = ['。', '！', '.', '!'].includes(lastChar);
    let cleanText = hasPunctuation ? text.slice(0, -1) : text;

    if (mode.value === 'question') {
      return cleanText + '吗？';
    }

    if (mode.value === 'polite') {
      cleanText = cleanText.replace(/我要/g, '我想').replace(/不行/g, '可能不太方便');
      return cleanText + '行吗？';
    }

    if (mode.value === 'formal') {
      const map = {
        说: '表示',
        觉得: '认为',
        看看: '查阅',
        大约: '约',
        需要: '需',
        买: '采购',
        卖: '销售',
        钱: '资金',
        能不能: '是否可以',
        对不对: '是否正确',
        哪里: '何处',
        时候: '时',
        因为: '由于'
      };
      Object.keys(map).forEach(key => {
        cleanText = cleanText.replace(new RegExp(key, 'g'), map[key]);
      });
      return cleanText + '。';
    }

    if (mode.value === 'customer') {
      return '亲，' + cleanText + '呢~ 感谢您的理解与支持！';
    }

    return text;
  });

  const copy = () => {
    if (!resultText.value || !inputText.value.trim()) return;
    copyToClipboard(resultText.value, { success: '已复制到剪贴板' });
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
    max-width: 1300px;
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
    .modes-grid {
      grid-template-columns: repeat(4, 1fr) !important;
    }
  }

  @media (max-width: 600px) {
    .modes-grid {
      grid-template-columns: repeat(2, 1fr) !important;
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
    background: #fdfae5;
  }

  .brutal-controls {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .control-label {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1.1rem;
    text-align: center;
    color: #111;
    text-transform: uppercase;
  }

  .modes-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .mode-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem;
    min-width: 100px;
    height: 100px;
    font-size: 1.1rem;
    background: #fff;
    box-shadow: 4px 4px 0px #111;
  }

  .mode-btn .icon {
    font-size: 2rem;
  }

  .mode-btn.active-mode {
    background: #111;
    color: #fff;
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0px #ff4b4b;
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
    font-size: 1.5rem;
    line-height: 1.8;
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
    font-size: 1.5rem;
    line-height: 1.8;
    font-weight: 600;
    color: #111;
    padding: 2rem;
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
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
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
    color: #eee;
  }
  [data-theme='dark'] .result-area {
    background: #1a1a1a;
  }
  [data-theme='dark'] .result-content {
    color: #eee;
  }
  [data-theme='dark'] .mode-btn.active-mode {
    background: #eee;
    color: #111;
    box-shadow: 2px 2px 0px #ff4b4b;
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
  [data-theme='dark'] .switch-area {
    background: #222;
  }
  [data-theme='dark'] .control-label {
    color: #eee;
  }
</style>
