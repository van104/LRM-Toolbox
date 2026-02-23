<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">关键词<span>提取()</span></h1>
        <div class="badge">🔑 Keyword Extractor</div>
      </header>

      <main class="brutal-main">
        <div class="layout-grid">
          <!-- Input pane -->
          <section class="brutal-pane">
            <div class="pane-header bg-yellow">
              <span class="panel-title">1. 输入长文本 (INPUT)</span>
            </div>
            <div class="editor-wrapper">
              <textarea
                v-model="inputText"
                class="code-editor"
                placeholder="在此粘贴文章或长文本内容，自动提取高频核心词..."
                spellcheck="false"
              ></textarea>
            </div>
          </section>

          <!-- Middle action -->
          <div class="switch-area">
            <button class="brutal-btn min-btn bg-pink text-white" @click="extract">
              ⚡ 开始提取
            </button>
          </div>

          <!-- Output pane -->
          <section class="brutal-pane">
            <div class="pane-header bg-blue text-white">
              <span class="panel-title">2. 提取结果 (OUTPUT)</span>
              <div v-if="keywords.length" class="panel-actions">
                <span class="count-badge">Top {{ keywords.length }}</span>
              </div>
            </div>
            <div class="result-area">
              <div v-if="keywords.length" class="tags-cloud">
                <div v-for="(kw, i) in keywords" :key="i" class="brutal-tag">
                  <span class="word">{{ kw.word }}</span>
                  <span class="count">{{ kw.count }}</span>
                </div>
              </div>
              <div v-else class="empty-state">
                <span class="empty-icon">🌱</span>
                <p>提取结果将在此处显示</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';

  const inputText = ref('');
  const keywords = ref([]);

  const stopWords = new Set([
    '的',
    '了',
    '和',
    '是',
    '在',
    '我',
    '有',
    '就',
    '不',
    '人',
    '都',
    '一',
    '一个',
    '上',
    '也',
    '很',
    '到',
    '说',
    '要',
    '去',
    '你',
    '会',
    '着',
    '没有',
    '看',
    '好',
    '自己',
    '这',
    '那',
    '它',
    '我们',
    '你们',
    '他们',
    '如果你',
    '但是',
    '因为',
    '所以',
    '如果',
    '为了',
    '虽然',
    '而且',
    '或者',
    '还是',
    '以及',
    '即使',
    '既然',
    '只要',
    '然而',
    '因此',
    '通过',
    '随着',
    '对于',
    '关于',
    '能够',
    '可以',
    '需要',
    '觉得',
    '感觉',
    '可能',
    '其实',
    '比如',
    '例如',
    '一般',
    '通常',
    '特别',
    '非常',
    '比较',
    '目前',
    '正在',
    '已经',
    '开始',
    '所有',
    '一切',
    '部分',
    '些',
    '个',
    '次',
    '种',
    '号',
    '年',
    '月',
    '日',
    '天',
    '点',
    '分',
    '秒'
  ]);

  const extract = () => {
    if (!inputText.value) return;

    let words = [];

    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      const segmenter = new Intl.Segmenter('zh', { granularity: 'word' });
      const segments = segmenter.segment(inputText.value);
      for (const seg of segments) {
        if (seg.isWordLike) words.push(seg.segment);
      }
    } else {
      words = inputText.value.split(/[^\u4e00-\u9fa5a-zA-Z0-9]+/);
    }

    const counter = {};
    words.forEach(w => {
      if (w.length > 1 && !stopWords.has(w) && !/^\d+$/.test(w)) {
        counter[w] = (counter[w] || 0) + 1;
      }
    });

    const sorted = Object.entries(counter)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({ word, count }));

    keywords.value = sorted;
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
    max-width: 1200px;
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
    .switch-area {
      transform: none !important;
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

  .count-badge {
    background: #111;
    color: #ffd900;
    padding: 0.2rem 0.6rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.9rem;
    border: 2px solid #fff;
    border-radius: 4px;
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
    padding: 1.5rem;
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

  .tags-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .brutal-tag {
    display: flex;
    align-items: center;
    background: #111;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #ff4b4b;
    transition: transform 0.1s;
    padding: 0;
  }

  .brutal-tag:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #ffd900;
  }

  .brutal-tag .word {
    padding: 0.5rem 0.8rem;
    color: #fff;
    font-weight: 700;
    font-size: 1.1rem;
  }

  .brutal-tag .count {
    background: #ff4b4b;
    padding: 0.5rem 0.6rem;
    color: #111;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: bold;
    border-left: 3px solid #111;
  }

  .brutal-tag:hover .count {
    background: #ffd900;
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
  [data-theme='dark'] .brutal-tag {
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
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
  [data-theme='dark'] .brutal-tag .count {
    background: #eee;
    color: #111;
    border-left-color: #eee;
  }
</style>
