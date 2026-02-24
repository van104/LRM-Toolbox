<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">原型<span>.UI设计()</span></h1>
        <div style="width: 100px"></div>
      </header>

      <div class="brutal-toolbar">
        <div class="tools-left">
          <span class="toolbar-text">专业的界面设计、交互原型制作及团队协作工具</span>
        </div>
        <div class="tools-right">
          <span>资源: {{ tools.length }}</span>
        </div>
      </div>

      <div class="assets-grid">
        <div v-for="tool in tools" :key="tool.name" class="brutal-pane lib-card">
          <div class="pane-header" :class="tool.bgClass">
            <span :class="tool.textClass">{{ tool.name }}</span>
            <div class="pane-actions">
              <button @click="openUrl(tool.url)">访问 ↑</button>
            </div>
          </div>
          <div class="pane-content">
            <p class="lib-desc">{{ tool.description }}</p>
            <div class="lib-tags">
              <span v-for="tag in tool.tags" :key="tag" class="brutal-tag">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { useRouter } from 'vue-router';

  const router = useRouter();
  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push('/');
  }

  const tools = [
    {
      name: 'Figma',
      description: '业界领先的协作式界面设计工具，支持实时多人协作，功能强大且生态丰富。',
      url: 'https://www.figma.com/',
      tags: ['协作', 'UI/UX', 'Web', '原型'],
      bgClass: 'bg-pink',
      textClass: 'text-white'
    },
    {
      name: 'Sketch',
      description: '主要面向 Mac 用户的专业数字设计工具包，拥有庞大的插件生态系统。',
      url: 'https://www.sketch.com/',
      tags: ['Mac', 'UI设计', '经典'],
      bgClass: 'bg-yellow',
      textClass: 'text-black'
    },
    {
      name: 'Adobe XD',
      description: 'Adobe 推出的一站式 UX/UI 设计与原型制作平台，与其他 Adobe 软件无缝集成。',
      url: 'https://helpx.adobe.com/xd/get-started.html',
      tags: ['Adobe', '交互', '原型'],
      bgClass: 'bg-blue',
      textClass: 'text-white'
    },
    {
      name: 'Pixso',
      description: '新一代国产协作设计工具，打通产品、设计、研发工作流，性能卓越。',
      url: 'https://pixso.cn/',
      tags: ['协作', '国产', '实时'],
      bgClass: 'bg-green',
      textClass: 'text-black'
    },
    {
      name: '即时设计 (JSDesign)',
      description: '专业级 UI 设计工具，支持导入 Figma 文件，拥有丰富的本土化资源库。',
      url: 'https://js.design/',
      tags: ['云端', '免费', '资源丰富'],
      bgClass: 'bg-yellow',
      textClass: 'text-black'
    }
  ];

  function openUrl(url) {
    window.open(url, '_blank');
  }
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
  }
  .toolbar-text {
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 1.2rem;
  }
  .tools-right {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.2rem;
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
  }
  .pane-actions button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }
  .pane-actions button:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
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
  [data-theme='dark'] .brutal-tag {
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
  [data-theme='dark'] .pane-actions button:hover {
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .pane-actions button:active {
    box-shadow: 0px 0px 0px #eee;
  }
  [data-theme='dark'] .brutal-tag {
    box-shadow: 2px 2px 0px #eee;
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
