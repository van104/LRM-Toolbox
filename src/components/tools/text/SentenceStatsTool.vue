<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">句子长度<span>统计器()</span></h1>
        <div class="badge">📊 Sentence Stats</div>
      </header>

      <main class="brutal-main">
        <div class="layout-grid">
          <!-- Input pane -->
          <section class="brutal-pane">
            <div class="pane-header bg-yellow">
              <span class="panel-title">1. 输入文章段落 (INPUT)</span>
            </div>
            <div class="editor-wrapper">
              <textarea
                v-model="inputText"
                class="code-editor"
                placeholder="在此粘贴文章内容 (自动识别句号、问号、感叹号)..."
                spellcheck="false"
              ></textarea>
            </div>

            <div v-if="stats" class="stats-panel bg-yellow">
              <div class="stat-box">
                <span class="stat-label">总字数</span>
                <span class="stat-val text-blue">{{ stats.totalChars }}</span>
              </div>
              <div class="stat-box">
                <span class="stat-label">句子总数</span>
                <span class="stat-val text-pink">{{ stats.sentenceCount }}</span>
              </div>
              <div class="stat-box">
                <span class="stat-label">平均句长</span>
                <span class="stat-val text-dark">{{ stats.avgLength }}</span>
              </div>
            </div>
          </section>

          <!-- Middle action -->
          <div class="switch-area">
            <div class="brutal-btn min-btn bg-pink text-white" style="cursor: default">
              📏 分析结果
            </div>
          </div>

          <!-- Output pane -->
          <section class="brutal-pane">
            <div class="pane-header bg-blue text-white">
              <span class="panel-title">2. 长度分布 (DISTRIBUTION)</span>
              <div v-if="stats" class="panel-actions">
                <span class="count-badge">共 {{ stats.sentenceCount }} 句</span>
              </div>
            </div>
            <div class="result-area">
              <div v-if="stats" class="sentences-list">
                <div
                  v-for="(sentence, index) in stats.sentences"
                  :key="index"
                  class="sentence-item"
                >
                  <div class="sentence-header">
                    <span class="index">No.{{ index + 1 }}</span>
                    <span :class="['len-tag', getLengthClass(sentence.length)]"
                      >{{ sentence.length }} 字</span
                    >
                  </div>
                  <div class="sentence-text">{{ sentence.text }}</div>
                </div>
              </div>
              <div v-else class="empty-state">
                <span class="empty-icon">📝</span>
                <p>输入文本后自动显示统计数据</p>
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

  const inputText = ref('');

  const stats = computed(() => {
    if (!inputText.value.trim()) return null;

    const reg = /[^。！？!?]+[。！？!?]?/g;
    const matches = inputText.value.match(reg) || [];

    const sentences = matches
      .map(s => {
        const text = s.trim();
        return {
          text,
          length: text.length
        };
      })
      .filter(s => s.length > 0);

    if (sentences.length === 0) return null;

    const totalChars = sentences.reduce((acc, curr) => acc + curr.length, 0);

    return {
      sentences,
      totalChars,
      sentenceCount: sentences.length,
      avgLength: (totalChars / sentences.length).toFixed(1)
    };
  });

  const getLengthClass = len => {
    if (len <= 15) return 'short';
    if (len > 35) return 'long';
    return 'medium';
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
  .text-blue {
    color: #0ea5e9;
  }
  .text-pink {
    color: #ff7be5;
  }
  .text-dark {
    color: #111;
  }

  .count-badge {
    background: #111;
    color: #ffd900;
    padding: 0.2rem 0.6rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.9rem;
    border: 2px solid #fff;
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
    min-height: 200px;
    border: none;
    padding: 1.5rem;
    resize: none;
    outline: none;
    font-family: 'Noto Sans SC', sans-serif;
    font-size: 1.1rem;
    line-height: 1.8;
    background: transparent;
    color: #111;
    box-sizing: border-box;
  }

  .stats-panel {
    border-top: 3px solid #111;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }

  .stat-box {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-right: 3px solid #111;
  }

  .stat-box:last-child {
    border-right: none;
  }

  .stat-label {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
  }

  .stat-val {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 2rem;
    font-weight: 900;
    line-height: 1;
    text-shadow: 2px 2px 0px #111;
  }
  .stat-val.text-dark {
    color: #111;
    text-shadow: 2px 2px 0px #fff;
  }

  .result-area {
    flex: 1;
    background: #fdfdfd;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .sentences-list {
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    gap: 1.5rem;
  }

  .sentence-item {
    background: #fff;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    display: flex;
    flex-direction: column;
  }

  .sentence-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    border-bottom: 3px solid #111;
    background: #fdfae5;
  }

  .index {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 0.9rem;
  }

  .len-tag {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 0.8rem;
    font-weight: 900;
    padding: 0.2rem 0.6rem;
    border: 2px solid #111;
    text-transform: uppercase;
  }

  .len-tag.short {
    background: #4ade80;
    color: #111;
  }
  .len-tag.medium {
    background: #ffd900;
    color: #111;
  }
  .len-tag.long {
    background: #ff4b4b;
    color: #fff;
  }

  .sentence-text {
    padding: 1rem;
    font-size: 1rem;
    line-height: 1.6;
    font-weight: 600;
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
    border-top-color: #eee !important;
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
  [data-theme='dark'] .stats-panel {
    border-top-color: #eee;
  }
  [data-theme='dark'] .stat-box {
    border-right-color: #eee;
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
  [data-theme='dark'] .stat-val.text-dark {
    color: #fff;
    text-shadow: 2px 2px 0px #111;
  }
  [data-theme='dark'] .sentence-item {
    background: #222;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .sentence-header {
    background: #1a1a1a;
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .len-tag {
    border-color: #111;
  }
  [data-theme='dark'] .len-tag.short {
    background: #15803d;
    color: #eee;
    border-color: #eee;
  }
  [data-theme='dark'] .len-tag.medium {
    background: #b28f00;
    color: #eee;
    border-color: #eee;
  }
  [data-theme='dark'] .len-tag.long {
    background: #991b1b;
    color: #eee;
    border-color: #eee;
  }
</style>
