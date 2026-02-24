<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">字体<span>.资源()</span></h1>
        <div style="width: 100px"></div>
      </header>

      <div class="brutal-toolbar">
        <div class="tools-left">
          <input
            v-model="searchKeyword"
            type="text"
            class="brutal-input"
            placeholder="输入字体名称关键词..."
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
              <button :disabled="!searchKeyword || !lib.searchUrl" @click="searchInLibrary(lib)">
                搜索
              </button>
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
      name: 'Google Fonts',
      description:
        '全球最大的开源字体库，提供大量免费可商用的 WebFont，无需下载即可在网页中直接引用。',
      url: 'https://fonts.google.com/',
      searchUrl: 'https://fonts.google.com/?query={query}',
      tags: ['开源', 'WebFont', '免费商用'],
      bgClass: 'bg-blue',
      textClass: 'text-white'
    },
    {
      name: '字由 (HelloFont)',
      description:
        '设计师必备的字体管理工具，聚合全球海量字体，支持一键激活到设计软件，无需安装字体文件。',
      url: 'https://www.hellofont.cn/',
      searchUrl: 'https://www.hellofont.cn/search?content={query}',
      tags: ['客户端', '管理', '云字体'],
      bgClass: 'bg-yellow',
      textClass: 'text-black'
    },
    {
      name: '100font',
      description: '专门收集整理免费商用字体的导航网站，清晰标注授权范围，致力于让设计师用字无忧。',
      url: 'https://www.100font.com/',
      searchUrl: 'https://www.100font.com/?s={query}',
      tags: ['免费商用', '打包下载', '中文'],
      bgClass: 'bg-green',
      textClass: 'text-black'
    },
    {
      name: 'Adobe Fonts (Typekit)',
      description:
        'Adobe 官方字体服务，订阅 Creative Cloud 即可商用海量高品质字体，无缝集成 Adobe 全家桶。',
      url: 'https://fonts.adobe.com/',
      searchUrl: 'https://fonts.adobe.com/search?q={query}',
      tags: ['Adobe', '高品质', '商用'],
      bgClass: 'bg-pink',
      textClass: 'text-white'
    },
    {
      name: '猫啃网 (Maoken)',
      description: '知名的免费商用字体收集站，更新及时，提供详尽的授权说明和字体预览。',
      url: 'https://www.maoken.com/',
      searchUrl: 'https://www.maoken.com/?s={query}',
      tags: ['免费', '中文', '资讯'],
      bgClass: 'bg-yellow',
      textClass: 'text-black'
    },
    {
      name: 'Font Squirrel',
      description:
        '精选的高质量免费商用字体库，提供 Webfont Generator 工具，可将本地字体转换为 Web 格式。',
      url: 'https://www.fontsquirrel.com/',
      searchUrl: 'https://www.fontsquirrel.com/fonts/list/find_fonts?q={query}',
      tags: ['英文', '转换工具', '商用'],
      bgClass: 'bg-blue',
      textClass: 'text-white'
    }
  ];

  function openUrl(url) {
    window.open(url, '_blank');
  }

  function searchInLibrary(lib) {
    if (!lib.searchUrl) return;
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
