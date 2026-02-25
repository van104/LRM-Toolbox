<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">公共<span>.服务()</span></h1>
        <div style="width: 120px"></div>
      </header>

      <main class="main-content">
        <div class="brutal-pane search-pane">
          <div class="pane-header bg-yellow">
            <span>🔍 搜索服务名称 (如：社保、违章)</span>
          </div>
          <div class="pane-body">
            <input v-model="searchQuery" type="text" placeholder="..." class="brutal-input full" />
          </div>
        </div>

        <div class="services-content">
          <div v-for="category in filteredServices" :key="category.name" class="category-section">
            <div class="category-header">
              <span class="category-icon-bg">
                <component :is="Icons[category.icon]" class="brutal-svg-icon" />
              </span>
              <h2 class="category-name">{{ category.name }}</h2>
            </div>

            <div class="services-grid">
              <button
                v-for="service in category.items"
                :key="service.title"
                class="service-card"
                @click="openService(service)"
              >
                <div
                  class="service-icon-wrap"
                  :style="{ backgroundColor: getBrutalColor(service.color) }"
                >
                  <component :is="Icons[service.icon]" class="service-svg-icon" />
                </div>
                <div class="service-info">
                  <span class="service-title">{{ service.title }}</span>
                  <span class="service-desc">{{ service.desc }}</span>
                </div>
                <div class="service-arrow">↗</div>
              </button>
            </div>
          </div>

          <div v-if="filteredServices.length === 0" class="brutal-pane empty-state">
            <h2>空空如也</h2>
            <p>没有找到匹配的服务</p>
          </div>
        </div>
      </main>

      <div class="brutal-status">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i">© 2026 LRM工具箱 - 常用公共服务合集 // &nbsp;</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch, onMounted } from 'vue';
  import * as Icons from '@element-plus/icons-vue';
  import { searchServices } from '@/data/public_services';

  const searchQuery = ref('');
  const filteredServices = ref([]);

  const performSearch = async () => {
    filteredServices.value = await searchServices(searchQuery.value);
  };

  watch(searchQuery, () => {
    performSearch();
  });

  onMounted(() => {
    performSearch();
  });

  const openService = service => {
    window.open(service.url, '_blank');
  };

  // Convert default hex colors into Neobrutalism palette logic
  // Just mapping existing hex from DB to rough brutal palette if applicable,
  // or return them directly as they might just be hex. Let's provide a fun hash color mapping for fallback.
  const getBrutalColor = colorStr => {
    // If it's a known rough palette or just returning exactly what's there but we can wrap it
    return colorStr || '#4b7bff';
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
    background-position: -2px -2px;
    min-height: 100vh;
    padding: 2rem;
    box-sizing: border-box;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    color: #111;
  }
  .brutal-container {
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #4b7bff;
  }
  .brutal-title span {
    color: #4b7bff;
    text-shadow: 4px 4px 0px #111;
    letter-spacing: 0;
  }

  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
    color: #111;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-pane {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    transition: transform 0.2s;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
  }
  .pane-body {
    padding: 1.5rem;
  }

  .bg-yellow {
    background: #ffd900;
    color: #111;
  }

  .brutal-input {
    border: 4px solid #111;
    padding: 1rem 1.25rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 700;
    font-size: 1.2rem;
    background: #fff;
    box-shadow: 6px 6px 0px #111;
    outline: none;
    transition: all 0.2s;
  }
  .brutal-input:focus {
    transform: translate(-2px, -2px);
    box-shadow: 8px 8px 0px #111;
    background: #fdfae5;
  }
  .brutal-input.full {
    width: 100%;
    box-sizing: border-box;
  }

  .services-content {
    display: flex;
    flex-direction: column;
    gap: 3rem;
    margin-top: 1rem;
  }
  .category-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .category-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 4px solid #111;
    margin-bottom: 0.5rem;
  }
  .category-icon-bg {
    background: #111;
    color: #fff;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
  }
  .brutal-svg-icon {
    width: 24px;
    height: 24px;
  }
  .category-name {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 2rem;
    font-weight: 800;
    margin: 0;
    color: #111;
  }

  .services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
  }

  .service-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 6px 6px 0px #111;
    cursor: pointer;
    transition: all 0.15s;
    text-align: left;
  }
  .service-card:hover {
    transform: translate(-4px, -4px);
    box-shadow: 10px 10px 0px #111;
    background: #fdfae5;
  }
  .service-card:active {
    transform: translate(2px, 2px);
    box-shadow: 4px 4px 0px #111;
  }

  .service-icon-wrap {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #111;
    color: #fff;
    flex-shrink: 0;
  }
  .service-svg-icon {
    width: 28px;
    height: 28px;
  }

  .service-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    overflow: hidden;
  }
  .service-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    color: #111;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .service-desc {
    font-size: 0.85rem;
    color: #555;
    font-weight: 600;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .service-arrow {
    font-size: 1.5rem;
    font-weight: 900;
    color: #111;
    opacity: 0;
    padding-left: 0.5rem;
    transition: all 0.2s;
  }
  .service-card:hover .service-arrow {
    opacity: 1;
    transform: translate(4px, -4px);
    color: #4b7bff;
  }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
  }
  .empty-state h2 {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    margin: 0 0 0.5rem;
  }
  .empty-state p {
    color: #555;
    font-weight: 600;
    margin: 0;
  }

  .brutal-status {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    padding: 1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.2rem;
    overflow: hidden;
    text-transform: uppercase;
    margin-top: 2rem;
  }
  .marquee-wrapper {
    width: 100%;
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
    .brutal-header {
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }
    .brutal-title {
      font-size: 2rem;
    }
    .services-grid {
      grid-template-columns: 1fr;
    }
  }

  /* Dark Mode */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-status,
  [data-theme='dark'] .service-card {
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
  [data-theme='dark'] .brutal-pane {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .pane-header,
  [data-theme='dark'] .category-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .brutal-input {
    background: #222;
    border-color: #eee;
    box-shadow: 6px 6px 0px #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-input:focus {
    background: #1a1a1a;
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #111;
  }

  [data-theme='dark'] .category-name {
    color: #eee;
  }
  [data-theme='dark'] .category-icon-bg {
    background: #222;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .service-card {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .service-card:hover {
    box-shadow: 10px 10px 0px #eee;
    background: #222;
  }
  [data-theme='dark'] .service-card:active {
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .service-title {
    color: #eee;
  }
  [data-theme='dark'] .service-desc {
    color: #aaa;
  }
  [data-theme='dark'] .service-arrow {
    color: #eee;
  }
  [data-theme='dark'] .service-card:hover .service-arrow {
    color: #89b4f8;
  }
  [data-theme='dark'] .service-icon-wrap {
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }

  [data-theme='dark'] .empty-state p {
    color: #aaa;
  }
  [data-theme='dark'] .brutal-status {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
</style>
