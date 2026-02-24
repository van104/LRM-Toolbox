<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">图标<span>.库()</span></h1>
        <div style="width: 100px"></div>
      </header>

      <div class="brutal-toolbar">
        <div class="tools-left">
          <input
            v-model="searchKeyword"
            type="text"
            class="brutal-input"
            placeholder="输入关键词（如 'user', 'setting'）..."
            @keyup.enter="handleGlobalSearch"
          />
        </div>
        <div class="tools-right">
          <button v-if="searchKeyword" class="brutal-action-btn" @click="searchKeyword = ''">
            清空
          </button>
          <span>资源: {{ libraries.length }}</span>
        </div>
      </div>

      <div class="assets-grid">
        <div v-for="lib in libraries" :key="lib.name" class="brutal-pane lib-card">
          <div class="pane-header" :class="lib.bgClass">
            <span :class="lib.textClass">{{ lib.name }}</span>
            <div class="pane-actions">
              <button @click="openUrl(lib.url)">访问 ↑</button>
              <button :disabled="!searchKeyword" @click="searchInLibrary(lib)">搜索</button>
            </div>
          </div>
          <div class="pane-content">
            <p class="lib-desc">{{ lib.description }}</p>
            <div class="lib-tags">
              <span v-for="tag in lib.tags" :key="tag" class="brutal-tag">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push('/');
  }

  const searchKeyword = ref('');

  const libraries = [
    {
      name: 'Iconfont',
      description:
        '阿里巴巴矢量图标库，国内功能最强大、图标内容最丰富的矢量图标平台。支持 SVG、Font、PNG 等格式下载。',
      url: 'https://www.iconfont.cn/',
      searchUrl: 'https://www.iconfont.cn/search/index?searchType=icon&q={query}',
      tags: ['中文', 'SVG', 'WebFont'],
      bgClass: 'bg-pink',
      textClass: 'text-white'
    },
    {
      name: 'Font Awesome',
      description:
        '全球最流行的图标库，提供海量图标，基于 CSS 和 Less。拥有庞大的社区支持和丰富的应用场景。',
      url: 'https://fontawesome.com/',
      searchUrl: 'https://fontawesome.com/search?q={query}&o=r',
      tags: ['流行', 'CSS', 'Toolkit'],
      bgClass: 'bg-blue',
      textClass: 'text-white'
    },
    {
      name: 'Feather Icons',
      description:
        '简洁、精美的开源图标集。强调简洁、一致性和可读性，非常适合现代简洁风格的 UI 设计。',
      url: 'https://feathericons.com/',
      searchUrl: 'https://feathericons.com/?query={query}',
      tags: ['开源', '简洁', '轻量'],
      bgClass: 'bg-yellow',
      textClass: 'text-black'
    },
    {
      name: 'Remix Icon',
      description: '一套专门为设计师和开发者打造的开源中立风格的系统符号，精心绘制，风格统一。',
      url: 'https://remixicon.com/',
      searchUrl: 'https://remixicon.com/?q={query}',
      tags: ['开源', '中立', '系统'],
      bgClass: 'bg-green',
      textClass: 'text-black'
    },
    {
      name: 'Material Symbols',
      description:
        'Google 推出的最新图标系统，支持可变字体（Variable Font），可调整粗细、填充、字重等属性。',
      url: 'https://fonts.google.com/icons',
      searchUrl: 'https://fonts.google.com/icons?selected=Material+Symbols+Outlined&query={query}',
      tags: ['Google', '可变', '系统'],
      bgClass: 'bg-blue',
      textClass: 'text-white'
    },
    {
      name: 'Phosphor Icons',
      description: '灵活的图标库，提供多种风格（细、常规、粗、填充等），完美适配各种设计需求。',
      url: 'https://phosphoricons.com/',
      searchUrl: 'https://phosphoricons.com/?q={query}',
      tags: ['多风格', '灵活', 'React/Vue'],
      bgClass: 'bg-yellow',
      textClass: 'text-black'
    }
  ];

  function openUrl(url) {
    window.open(url, '_blank');
  }

  function searchInLibrary(lib) {
    if (!lib.searchUrl) {
      openUrl(lib.url);
      return;
    }
    const url = lib.searchUrl.replace('{query}', encodeURIComponent(searchKeyword.value));
    window.open(url, '_blank');
  }

  function handleGlobalSearch() {}
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

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
    max-width: 1600px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }
  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.5rem;
    font-weight: 800;
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
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }
  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    border: 4px solid #111;
    padding: 1.5rem;
    margin-bottom: 2.5rem;
    box-shadow: 8px 8px 0px #111;
    gap: 1.5rem;
    overflow: hidden;
  }
  .tools-left {
    display: flex;
    gap: 1.5rem;
    flex: 1;
    min-width: 0;
  }
  .tools-right {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-weight: 800;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.1rem;
    flex-shrink: 0;
    white-space: nowrap;
  }

  .brutal-input {
    flex: 1;
    border: 3px solid #111;
    padding: 0.6rem 1rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 1.1rem;
    background: #fff;
    outline: none;
    box-shadow: 3px 3px 0px #111;
  }
  .brutal-input:focus {
    box-shadow: 5px 5px 0px #111;
    transform: translate(-1px, -1px);
  }

  .brutal-action-btn {
    background: #ff4b4b;
    color: #fff;
    border: 3px solid #111;
    padding: 0.6rem 2rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
  }
  .brutal-action-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }
  .brutal-action-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px #111;
  }

  .assets-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 3rem;
    margin-bottom: 3rem;
    min-height: 500px;
  }

  .brutal-pane {
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
    transition: transform 0.2s;
  }
  .brutal-pane:hover {
    transform: translate(-4px, -4px);
    box-shadow: 16px 16px 0px #111;
  }

  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.3rem;
    letter-spacing: 1px;
    gap: 0.75rem;
  }
  .pane-actions {
    display: flex;
    gap: 0.75rem;
    flex-shrink: 0;
  }
  .pane-actions button {
    background: #fff;
    color: #111;
    border: 3px solid #111;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 0.9rem;
    padding: 0.35rem 0.75rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
    white-space: nowrap;
  }
  .pane-actions button:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }
  .pane-actions button:active:not(:disabled) {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }
  .pane-actions button:disabled {
    background: #eee;
    color: #aaa;
    border-color: #aaa;
    box-shadow: 2px 2px 0px #aaa;
    cursor: not-allowed;
  }

  .pane-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  .lib-desc {
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-size: 1.1rem;
    line-height: 1.6;
    margin-top: 0;
    margin-bottom: 1.5rem;
    flex: 1;
    color: #111;
  }
  .lib-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  .brutal-tag {
    background: #fff;
    border: 2px solid #111;
    padding: 0.25rem 0.75rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 0.9rem;
    box-shadow: 2px 2px 0px #111;
  }

  .bg-yellow {
    background: #ffd900;
  }
  .bg-blue {
    background: #4b7bff;
    color: #fff;
  }
  .bg-green {
    background: #00e572;
  }
  .bg-pink {
    background: #ff4b4b;
    color: #fff;
  }
  .text-white {
    color: #fff;
  }
  .text-black {
    color: #111;
  }

  @media (max-width: 1024px) {
    .brutal-title {
      font-size: 2.5rem;
    }
    .assets-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
    .brutal-toolbar {
      flex-direction: column;
      gap: 1.5rem;
      align-items: flex-start;
    }
    .brutal-header {
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }
  }

  /* --- Dark Mode --- */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-toolbar,
  [data-theme='dark'] .pane-actions button,
  [data-theme='dark'] .brutal-tag,
  [data-theme='dark'] .brutal-input {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 9px 9px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }
  [data-theme='dark'] .brutal-toolbar {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane:hover {
    box-shadow: 16px 16px 0px #eee;
  }
  [data-theme='dark'] .pane-actions button {
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .pane-actions button:hover:not(:disabled) {
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .pane-actions button:active:not(:disabled) {
    box-shadow: 0px 0px 0px #eee;
  }
  [data-theme='dark'] .brutal-tag {
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .brutal-input {
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .brutal-input:focus {
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn {
    background: #cc0000;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
    color: #fff;
  }
  [data-theme='dark'] .brutal-action-btn:hover {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
    color: #111;
  }
  [data-theme='dark'] .lib-desc {
    color: #eee;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-green {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .bg-pink {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .text-white,
  [data-theme='dark'] .text-black {
    color: #fff;
  }
</style>
