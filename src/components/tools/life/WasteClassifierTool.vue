<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">垃圾<span>.分类()</span></h1>
        <div style="width: 100px"></div>
      </header>

      <main class="main-content">
        <div class="brutal-pane search-section">
          <div class="pane-header bg-yellow">
            <span>🔍 搜索垃圾名称</span>
          </div>
          <div class="pane-body">
            <div class="search-input-wrap">
              <input
                v-model="searchQuery"
                type="text"
                class="brutal-input"
                placeholder="搜索如：电池、剩菜、纸箱..."
                @input="handleSearch"
              />
              <button v-if="searchQuery" class="clear-btn" @click="clearSearch">✖</button>
            </div>

            <div v-if="searchResult.length > 0" class="search-results">
              <div
                v-for="item in searchResult"
                :key="item.name"
                class="result-item"
                @click="showDetail(item)"
              >
                <span class="item-name">{{ item.name }}</span>
                <span class="brutal-tag" :class="getCategoryClass(item.category)">
                  {{ item.category }}
                </span>
              </div>
            </div>
            <div v-else-if="searchQuery" class="no-result">未找到相关结果，试试换个词？ 🧐</div>
          </div>
        </div>

        <div class="categories-grid">
          <div
            v-for="cat in categories"
            :key="cat.name"
            class="brutal-pane category-card"
            :class="'cat-' + cat.en.toLowerCase().replace(/[' ]/g, '')"
          >
            <div class="cat-header">
              <div class="cat-icon">{{ getCatEmoji(cat.name) }}</div>
              <div class="cat-title-wrap">
                <h2 class="cat-name">{{ cat.name }}</h2>
                <span class="cat-en">{{ cat.en }}</span>
              </div>
            </div>
            <div class="pane-body">
              <p class="cat-desc">{{ cat.desc }}</p>
              <div class="requirements">
                <div class="req-title">📌 投放要求:</div>
                <ul class="brutal-list">
                  <li v-for="(req, i) in cat.requirements" :key="i">{{ req }}</li>
                </ul>
              </div>
              <div class="examples">
                <span v-for="ex in cat.examples" :key="ex" class="brutal-tag example-tag">{{
                  ex
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="brutal-pane exp-section">
          <div class="pane-header bg-dark text-white pt-1 pb-1">
            <span>🧪 实验性功能 (开发中)</span>
          </div>
          <div class="pane-body exp-body">
            <button class="brutal-btn exp-btn" disabled>📸 拍照识别</button>
            <button class="brutal-btn exp-btn" disabled>🎙️ 语音查询</button>
            <p class="exp-tip">提示：识别功能涉及 AI 接口调用，目前处于内部测试阶段。</p>
          </div>
        </div>
      </main>

      <div class="brutal-status">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i">© 2026 LRM工具箱 - 垃圾分类助手 // &nbsp;</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { wasteCategories, searchWaste, getCategoryTagType } from '@/data/waste';

  const searchQuery = ref('');
  const searchResult = ref([]);
  const categories = wasteCategories;

  const handleSearch = async () => {
    if (!searchQuery.value) {
      searchResult.value = [];
      return;
    }
    searchResult.value = await searchWaste(searchQuery.value);
  };

  const clearSearch = () => {
    searchQuery.value = '';
    searchResult.value = [];
  };

  const getCategoryClass = cat => {
    const type = getCategoryTagType(cat);
    if (type === 'success') return 'bg-green text-dark';
    if (type === 'danger') return 'bg-red text-white';
    if (type === 'warning') return 'bg-yellow text-dark';
    if (type === 'info') return 'bg-blue text-white';
    return '';
  };

  const getCatEmoji = name => {
    if (name === '可回收物') return '♻️';
    if (name === '厨余垃圾' || name === '湿垃圾') return '🍲';
    if (name === '有害垃圾') return '☣️';
    return '🗑️';
  };

  const showDetail = item => {
    console.log('显示详情:', item);
    // 预留弹窗或展示逻辑
  };
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

  .brutal-wrapper {
    background-color: #fdfae5;
    background-image:
      linear-gradient(#e5e5e5 2px, transparent 2px),
      linear-gradient(90deg, #e5e5e5 2px, transparent 2px);
    background-size: 40px 40px;
    min-height: 100vh;
    padding: 2rem;
    box-sizing: border-box;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    color: #111;
  }
  .brutal-container {
    max-width: 1000px;
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
    font-size: 3rem;
    font-weight: 800;
    margin: 0;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #00e572;
  }
  .brutal-title span {
    color: #00e572;
    text-shadow: 4px 4px 0px #111;
  }
  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition: all 0.1s;
    color: #111;
  }
  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0 0 0 #111;
  }
  .brutal-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: 6px 6px 0px #111 !important;
    color: #888;
  }
  .brutal-pane {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin-bottom: 2rem;
  }
  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
  }
  .pane-body {
    padding: 1.5rem;
  }
  .bg-yellow {
    background: #ffd900;
  }
  .bg-green {
    background: #00e572;
  }
  .bg-red {
    background: #ff4b4b;
  }
  .bg-blue {
    background: #4b7bff;
  }
  .bg-dark {
    background: #111;
  }
  .text-white {
    color: #fff;
  }
  .text-dark {
    color: #111;
  }
  .pt-1 {
    padding-top: 0.5rem;
  }
  .pb-1 {
    padding-bottom: 0.5rem;
  }

  .search-input-wrap {
    position: relative;
    display: flex;
    margin-bottom: 1.5rem;
  }
  .brutal-input {
    width: 100%;
    border: 4px solid #111;
    padding: 1rem 3rem 1rem 1rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 1.1rem;
    box-shadow: 4px 4px 0px #111;
    outline: none;
    transition: all 0.2s;
  }
  .brutal-input:focus {
    background: #fdfae5;
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }
  .clear-btn {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: #111;
    color: white;
    border: none;
    width: 30px;
    height: 30px;
    cursor: pointer;
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .clear-btn:hover {
    background: #ff4b4b;
  }

  .search-results {
    border: 4px solid #111;
    max-height: 250px;
    overflow-y: auto;
    background: #fff;
    box-shadow: 4px 4px 0px #111;
  }
  .result-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 3px solid #111;
    cursor: pointer;
    font-weight: 700;
    transition: background 0.1s;
  }
  .result-item:last-child {
    border-bottom: none;
  }
  .result-item:hover {
    background: #ffd900;
  }
  .no-result {
    font-weight: 700;
    color: #111;
    text-align: center;
    padding: 2rem;
    border: 4px dashed #111;
    background: #eee;
  }

  .brutal-tag {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 0.85rem;
    padding: 0.25rem 0.5rem;
    border: 2px solid #111;
    background: #fff;
    color: #111;
    box-shadow: 2px 2px 0px #111;
  }
  .example-tag {
    background: #fdfae5;
    display: inline-block;
  }

  .categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
  }
  .category-card {
    margin-bottom: 0;
    box-shadow: 6px 6px 0px #111;
    transition: all 0.2s;
  }
  .category-card:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }

  .cat-header {
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 4px solid #111;
    background: #111;
    color: #fff;
  }
  .cat-icon {
    font-size: 2.5rem;
    line-height: 1;
    text-shadow: 2px 2px 0px #000;
  }
  .cat-title-wrap {
    display: flex;
    flex-direction: column;
  }
  .cat-name {
    margin: 0;
    font-family: 'Syne', sans-serif;
    font-size: 1.5rem;
    font-weight: 900;
    letter-spacing: 1px;
  }
  .cat-en {
    font-size: 0.8rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    opacity: 0.8;
  }

  .cat-desc {
    font-weight: 600;
    font-size: 0.95rem;
    line-height: 1.5;
    margin-top: 0;
    margin-bottom: 1.25rem;
  }
  .req-title {
    font-weight: 800;
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }
  .brutal-list {
    list-style: none;
    padding-left: 1rem;
    margin-bottom: 1.5rem;
  }
  .brutal-list li {
    font-weight: 600;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    position: relative;
  }
  .brutal-list li::before {
    content: '👉';
    position: absolute;
    left: -1.2rem;
    top: 0;
  }
  .examples {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  /* Specially coloring headers based on category type (heuristic) */
  .cat-recyclablewaste .cat-header {
    background: #4b7bff;
  }
  .cat-householdfoodwaste .cat-header {
    background: #00e572;
    color: #111;
  }
  .cat-householdfoodwaste .cat-icon {
    text-shadow: 2px 2px 0px #fff;
  }
  .cat-householdfoodwaste .cat-name {
    color: #111;
    text-shadow: none;
  }
  .cat-hazardouswaste .cat-header {
    background: #ff4b4b;
  }
  .cat-residualwaste .cat-header {
    background: #444;
  }

  .exp-body {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    align-items: center;
  }
  .exp-btn {
    font-size: 1rem;
    padding: 0.5rem 1rem;
  }
  .exp-tip {
    width: 100%;
    font-weight: 600;
    color: #555;
    margin: 0;
    margin-top: 0.5rem;
    font-size: 0.9rem;
  }

  .brutal-status {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    padding: 1rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.2rem;
    overflow: hidden;
  }
  .marquee-wrapper {
    overflow: hidden;
  }
  .marquee-content {
    display: inline-block;
    white-space: nowrap;
    animation: marquee 20s linear infinite;
  }
  @keyframes marquee {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  @media (max-width: 768px) {
    .brutal-title {
      font-size: 2rem;
    }
    .categories-grid {
      grid-template-columns: 1fr;
    }
  }

  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-status {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn {
    box-shadow: 6px 6px 0px #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 9px 9px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:active {
    box-shadow: 0 0 0 #eee;
  }
  [data-theme='dark'] .brutal-btn:disabled {
    box-shadow: 6px 6px 0px #444 !important;
    border-color: #666;
    color: #666;
  }
  [data-theme='dark'] .brutal-pane {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
  }
  [data-theme='dark'] .bg-green {
    background: #00994c;
  }
  [data-theme='dark'] .bg-red {
    background: #cc0000;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
  }
  [data-theme='dark'] .bg-dark {
    background: #333;
  }
  [data-theme='dark'] .brutal-input {
    background: #222;
    border-color: #eee;
    box-shadow: 6px 6px 0px #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-input:focus {
    background: #333;
  }
  [data-theme='dark'] .search-results {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
    background: #222;
  }
  [data-theme='dark'] .result-item {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .result-item:hover {
    background: #b28f00;
  }
  [data-theme='dark'] .no-result {
    background: #333;
    border-color: #eee;
    color: #ccc;
  }
  [data-theme='dark'] .brutal-tag {
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
    background: #222;
    color: #eee;
  }
  [data-theme='dark'] .example-tag {
    background: #333;
  }
  [data-theme='dark'] .category-card {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .category-card:hover {
    box-shadow: 9px 9px 0px #eee;
  }
  [data-theme='dark'] .cat-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .clear-btn {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .clear-btn:hover {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .brutal-status {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .exp-tip {
    color: #aaa;
  }
</style>
