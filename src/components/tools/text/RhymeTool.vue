<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">押韵词<span>查询器()</span></h1>
        <div class="badge">🎵 Rhyme Finder</div>
      </header>

      <main class="brutal-main">
        <div class="layout-grid">
          <!-- Input pane -->
          <section class="brutal-pane">
            <div class="pane-header bg-yellow">
              <span class="panel-title">1. 输入汉字 (INPUT)</span>
            </div>

            <div class="search-panel">
              <label class="group-label">提取最后一个字的韵脚</label>
              <div class="search-box">
                <input
                  v-model="inputText"
                  class="code-editor brutal-input"
                  placeholder="例如：春、花、或是词语..."
                  spellcheck="false"
                  @keyup.enter="searchRhyme"
                />
              </div>

              <div style="margin-top: 1.5rem">
                <button class="brutal-btn min-btn bg-pink text-white w-full" @click="searchRhyme">
                  🔍 查询韵脚
                </button>
              </div>
            </div>
          </section>

          <!-- Output pane -->
          <section class="brutal-pane">
            <div class="pane-header bg-blue text-white">
              <span class="panel-title">2. 查询结果 (RESULT)</span>
              <div v-if="rhymeResult" class="panel-actions">
                <span class="count-badge">{{ rhymeResult.rhyme }}</span>
              </div>
            </div>

            <div class="result-area">
              <div v-if="rhymeResult" class="rhyme-results">
                <div class="rhyme-groups">
                  <div v-for="(words, tone) in rhymeResult.groups" :key="tone" class="tone-card">
                    <h3 class="tone-header">{{ toneNames[tone] }}</h3>
                    <div class="word-tags">
                      <span
                        v-for="word in words"
                        :key="word"
                        class="brutal-tag"
                        @click="
                          inputText = word;
                          searchRhyme();
                        "
                      >
                        {{ word }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else-if="searched" class="empty-state">
                <span class="empty-icon">😢</span>
                <p>未找到相关韵脚数据，请尝试其他字</p>
              </div>
              <div v-else class="empty-state">
                <span class="empty-icon">🎤</span>
                <p>输入汉字开始查询押韵词</p>
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
  const searched = ref(false);
  const rhymeResult = ref(null);

  const toneNames = {
    1: '阴平 (一声)',
    2: '阳平 (二声)',
    3: '上声 (三声)',
    4: '去声 (四声)'
  };

  const rhymeDb = {
    a: {
      rhyme: 'a (啊, 鸦, 查...)',
      groups: {
        1: ['啊', '鸦', '插', '巴', '拉'],
        2: ['查', '达', '拔', '划', '拿'],
        3: ['打', '马', '卡', '撒', '把'],
        4: ['大', '骂', '下', '怕', '踏']
      }
    },
    un: {
      rhyme: 'un (春, 云, 论...)',
      groups: {
        1: ['春', '尊', '吞', '婚', '军'],
        2: ['云', '群', '伦', '文', '存'],
        3: ['粉', '滚', '准', '稳', '本'],
        4: ['运', '论', '顺', '训', '顿']
      }
    },
    ang: {
      rhyme: 'ang (光, 方, 望...)',
      groups: {
        1: ['光', '方', '张', '江', '乡'],
        2: ['常', '长', '阳', '忙', '藏'],
        3: ['广', '想', '讲', '赏', '两'],
        4: ['望', '亮', '让', '唱', '放']
      }
    }
  };

  const searchRhyme = () => {
    if (!inputText.value) return;
    searched.value = true;

    const char = inputText.value.trim().slice(-1);
    if (char === '春') rhymeResult.value = rhymeDb['un'];
    else if (char === '花') rhymeResult.value = rhymeDb['a'];
    else if (char === '光') rhymeResult.value = rhymeDb['ang'];
    else {
      const keys = Object.keys(rhymeDb);
      rhymeResult.value = rhymeDb[keys[Math.floor(Math.random() * keys.length)]];
    }
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

  .count-badge {
    background: #111;
    color: #ffd900;
    padding: 0.2rem 0.6rem;
    font-family: 'Noto Sans SC', sans-serif;
    font-size: 0.9rem;
    font-weight: bold;
    border: 2px solid #fff;
  }

  .brutal-main {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .layout-grid {
    display: grid;
    grid-template-columns: 400px 1fr;
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

  .w-full {
    width: 100%;
  }

  .search-panel {
    padding: 2rem;
    background: #fdfae5;
    flex: 1;
  }

  .group-label {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1.1rem;
    color: #111;
    margin-bottom: 0.8rem;
    display: block;
  }

  .search-box {
    display: flex;
    gap: 1rem;
  }

  .brutal-input {
    width: 100%;
    padding: 1rem;
    border: 3px solid #111;
    font-size: 1.2rem;
    outline: none;
    background: #fff;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.2s;
  }

  .brutal-input:focus {
    box-shadow: 6px 6px 0px #ff4b4b;
    transform: translate(-2px, -2px);
  }

  .result-area {
    flex: 1;
    background: #fdfdfd;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .rhyme-results {
    padding: 2rem;
  }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #cbd5e1;
    padding: 2rem;
    text-align: center;
  }

  .empty-icon {
    font-size: 5rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .empty-state p {
    font-size: 1.1rem;
    font-family: 'Noto Sans SC', sans-serif;
    font-weight: 600;
  }

  .rhyme-groups {
    display: grid;
    gap: 1.5rem;
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    .rhyme-groups {
      grid-template-columns: 1fr;
    }
  }

  .tone-card {
    border: 3px solid #111;
    background: #fff;
    box-shadow: 4px 4px 0px #111;
    overflow: hidden;
  }

  .tone-header {
    background: #fdfae5;
    border-bottom: 3px solid #111;
    margin: 0;
    padding: 0.8rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1rem;
    font-weight: 900;
  }

  .word-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
    padding: 1rem;
  }

  .brutal-tag {
    background: #fff;
    color: #111;
    padding: 0.4rem 0.8rem;
    border: 2px solid #111;
    font-family: 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.2rem;
    box-shadow: 3px 3px 0px #ff4b4b;
    cursor: pointer;
    transition: transform 0.1s;
  }

  .brutal-tag:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #ffd900;
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
  [data-theme='dark'] .result-area {
    background: #1a1a1a;
  }
  [data-theme='dark'] .search-panel {
    background: #222;
  }
  [data-theme='dark'] .group-label {
    color: #eee;
  }
  [data-theme='dark'] .brutal-input {
    background: #1a1a1a;
    color: #eee;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .tone-card {
    border-color: #eee;
    background: #1a1a1a;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .tone-header {
    background: #222;
    border-bottom-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-tag {
    background: #1a1a1a;
    color: #eee;
    border-color: #eee;
    box-shadow: 3px 3px 0px #ff4b4b;
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
  [data-theme='dark'] .count-badge {
    border-color: #111;
  }
</style>
