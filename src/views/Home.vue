<template>
  <div class="brutal-home-page">
    <AppHeader
      class="brutal-app-header-override"
      :active-category="activeCategory"
      :show-search="false"
      @category-change="handleCategoryChange"
      @search="handleSearch"
    />

    <main class="main-content">
      <section class="brutal-hero">
        <div class="hero-decorative-box deco-1"></div>
        <div class="hero-decorative-box deco-2"></div>
        <h1 class="brutal-hero-title">
          <span>{{ t('app.title') }}</span>
        </h1>
        <p class="brutal-hero-subtitle">{{ t('home.subtitle') }}</p>

        <div class="hero-search-wrapper">
          <div class="brutal-search-container">
            <el-icon class="search-icon"><Search /></el-icon>
            <input
              v-model="searchKeyword"
              :placeholder="t('home.searchPlaceholder', { count: allTools.length })"
              class="brutal-search-input"
              @input="handleSearch($event.target.value)"
            />
            <div class="search-shortcut">
              <span class="cmd-key">CTRL</span> + <span class="cmd-key">K</span>
            </div>
          </div>

          <div v-if="isDev" class="test-bench-entry">
            <button class="brutal-btn-primary" @click="router.push('/test-bench')">
              进入开发测试台 (SANDBOX)
            </button>
          </div>
        </div>
      </section>

      <!-- Recommended Tools Section -->
      <div
        v-if="activeCategory === 'all' && !searchKeyword && recommendedTools.length > 0"
        class="brutal-content-wrapper"
        style="padding-bottom: 0"
      >
        <div class="brutal-section-header">
          <h2 class="brutal-section-title bg-title-pink">
            <el-icon><StarFilled /></el-icon>
            随机推荐
          </h2>
          <div class="bg-title-shadow"></div>
        </div>

        <section class="tools-grid-wrapper">
          <div class="tools-grid">
            <ToolCard
              v-for="tool in recommendedTools"
              :key="'rec-' + tool.id"
              :tool="tool"
              :is-favorite="userStore.isFavorite(tool.id)"
              @click="handleToolClick"
              @view-detail="openToolModal"
              @toggle-favorite="handleToggleFavorite"
            />
          </div>
        </section>
      </div>

      <div class="brutal-content-wrapper">
        <div v-if="!searchKeyword" class="brutal-section-header">
          <h2 class="brutal-section-title bg-title">
            <el-icon>
              <component :is="iconMap[currentCategoryInfo?.icon] || Grid" />
            </el-icon>
            {{ t('category.' + (currentCategoryInfo?.id || 'all')) }}
          </h2>
          <div class="bg-title-shadow"></div>
        </div>

        <section v-if="loading" class="tools-grid">
          <SkeletonCard v-for="i in 6" :key="i" />
        </section>

        <section v-else class="tools-grid-wrapper">
          <div class="tools-grid">
            <ToolCard
              v-for="tool in visibleTools"
              :key="tool.id"
              :tool="tool"
              :is-favorite="userStore.isFavorite(tool.id)"
              @click="handleToolClick"
              @view-detail="openToolModal"
              @toggle-favorite="handleToggleFavorite"
            />
          </div>
          <div v-if="hasMoreTools && !isShowAll" class="show-more-wrapper">
            <button class="brutal-btn-secondary" @click="handleShowAll">
              {{ t('home.viewAll', { count: filteredTools.length }) }}
              <el-icon class="icon-right"><ArrowDown /></el-icon>
            </button>
          </div>
        </section>

        <div v-if="!loading && filteredTools.length === 0" class="brutal-empty-state">
          <div class="empty-icon-box">
            <el-icon :size="48"><Search /></el-icon>
          </div>
          <p class="empty-text">{{ t('home.noResults') }}</p>
        </div>
      </div>
    </main>

    <AppFooter />

    <ToolModal :visible="modalVisible" :tool="selectedTool" @close="modalVisible = false" />

    <!-- Floating Action Navigation (Up & Down) -->
    <div class="brutal-floating-actions" :class="{ 'is-visible': showFloatNav }">
      <button class="brutal-action-btn brutal-btn-up" title="返回顶部" @click="scrollToTop">
        <el-icon><ArrowUp /></el-icon>
      </button>
      <button class="brutal-action-btn brutal-btn-down" title="到达底部" @click="scrollToBottom">
        <el-icon><ArrowDown /></el-icon>
      </button>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useI18n } from 'vue-i18n';

  defineOptions({ name: 'Home' });

  import {
    Search,
    Grid,
    ArrowDown,
    ArrowUp,
    Monitor,
    Document,
    Picture,
    Brush,
    Wallet,
    Service,
    Coffee,
    Notebook,
    IceTea,
    StarFilled
  } from '@element-plus/icons-vue';
  import AppHeader from '@/components/layout/AppHeader.vue';
  import AppFooter from '@/components/layout/AppFooter.vue';
  import ToolCard from '@/components/tools/ToolCard.vue';
  import ToolModal from '@/components/tools/ToolModal.vue';
  import SkeletonCard from '@/components/common/SkeletonCard.vue';
  import { loadToolsByCategory, searchToolsAsync, loadAllTools } from '@/data/tools';
  import { useUserStore } from '@/stores/user';
  import { categories } from '@/data/tools';

  const router = useRouter();
  const route = useRoute();
  const userStore = useUserStore();
  const { t } = useI18n();

  const isDev = import.meta.env.DEV;
  const activeCategory = ref(route.query.category || 'all');
  const searchKeyword = ref('');
  const modalVisible = ref(false);
  const selectedTool = ref({});
  const loading = ref(true);

  const allTools = ref([]);
  const displayedTools = ref([]);
  const recommendedTools = ref([]);

  const getExpandedCategories = () => {
    try {
      return JSON.parse(sessionStorage.getItem('lrm-expanded-categories') || '[]');
    } catch {
      return [];
    }
  };
  const expandedCategories = ref(getExpandedCategories());

  const isShowAll = computed({
    get: () => expandedCategories.value.includes(activeCategory.value) || !!searchKeyword.value,
    set: val => {
      if (val && !expandedCategories.value.includes(activeCategory.value)) {
        expandedCategories.value.push(activeCategory.value);
        sessionStorage.setItem('lrm-expanded-categories', JSON.stringify(expandedCategories.value));
      }
    }
  });

  const DISPLAY_LIMIT = 12;

  const iconMap = {
    Grid,
    Monitor,
    Document,
    Picture,
    Brush,
    Wallet,
    Service,
    Coffee,
    Notebook,
    IceTea
  };

  const currentCategoryInfo = computed(() => {
    return categories.find(c => c.id === activeCategory.value);
  });

  onMounted(async () => {
    await fetchTools(activeCategory.value);
    loading.value = false;
    loadAllTools().then(res => {
      allTools.value = res;

      // Select recommended tools
      const perCategory = 2; // get at least 2 random hot tools per category
      let recommendedList = [];
      categories.forEach(cat => {
        const catTools = res.filter(t => t.category === cat.id);
        const shuffled = [...catTools].sort(() => 0.5 - Math.random());
        recommendedList.push(...shuffled.slice(0, perCategory));
      });
      // Final shuffle to randomize across categories, take exactly top 6
      recommendedTools.value = recommendedList.sort(() => 0.5 - Math.random()).slice(0, 6);
    });
  });

  const filteredTools = computed(() => displayedTools.value);
  const visibleTools = computed(() => {
    if (isShowAll.value) return filteredTools.value;
    return filteredTools.value.slice(0, DISPLAY_LIMIT);
  });
  const hasMoreTools = computed(() => filteredTools.value.length > DISPLAY_LIMIT);

  async function fetchTools(category, keyword = '') {
    loading.value = true;
    if (keyword) {
      displayedTools.value = await searchToolsAsync(keyword);
    } else {
      displayedTools.value = await loadToolsByCategory(category);
    }
    loading.value = false;
  }

  watch(
    () => route.query.category,
    async newCategory => {
      const cat = newCategory || 'all';
      activeCategory.value = cat;
      if (!searchKeyword.value) {
        await fetchTools(cat);
      }
    }
  );

  async function handleCategoryChange(categoryId) {
    activeCategory.value = categoryId;
    searchKeyword.value = '';
    await fetchTools(categoryId);
    router.replace({
      query: {
        ...route.query,
        category: categoryId === 'all' ? undefined : categoryId
      }
    });
  }

  async function handleSearch(keyword) {
    searchKeyword.value = keyword;
    if (keyword) {
      activeCategory.value = 'all';
      await fetchTools('all', keyword);
    } else {
      await fetchTools(activeCategory.value);
    }
  }

  function openToolModal(tool) {
    selectedTool.value = tool;
    modalVisible.value = true;
  }

  function handleToggleFavorite(toolId) {
    userStore.toggleFavorite(toolId);
  }

  function handleToolClick(tool) {
    if (tool.route) {
      userStore.addToHistory(tool);
      if (tool.isLocal === false || tool.route.startsWith('http')) {
        window.open(tool.route, '_blank');
      } else {
        router.push(tool.route);
      }
    } else {
      openToolModal(tool);
    }
  }

  function handleShowAll() {
    isShowAll.value = true;
  }

  // Float Nav Logic
  const showFloatNav = ref(false);

  const handleScroll = () => {
    // Show buttons if scrolled down a bit (e.g. 200px)
    showFloatNav.value = window.scrollY > 200;
  };

  onMounted(() => {
    window.addEventListener('scroll', handleScroll);
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

  .brutal-home-page {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: #fdfae5;
    background-image:
      linear-gradient(#e5e5e5 2px, transparent 2px),
      linear-gradient(90deg, #e5e5e5 2px, transparent 2px);
    background-size: 40px 40px;
    background-position: -2px -2px;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    color: #111;
    overflow-x: hidden;
    padding-top: var(--header-height);
  }

  .main-content {
    position: relative;
    z-index: 1;
    flex: 1;
  }

  .brutal-hero {
    position: relative;
    text-align: center;
    padding: 5rem 2rem 4rem;
    margin-bottom: 2rem;
    border-bottom: 4px solid #111;
    background: #fff;
    box-shadow: 0px 8px 0px #111;
    overflow: hidden;
  }

  .hero-decorative-box {
    position: absolute;
    border: 4px solid #111;
    background: #ffd900;
    box-shadow: 6px 6px 0px #111;
    z-index: 0;
  }

  .deco-1 {
    width: 60px;
    height: 60px;
    top: 20%;
    left: 10%;
    transform: rotate(-15deg);
    background: #00e572;
  }

  .deco-2 {
    width: 80px;
    height: 80px;
    bottom: 30%;
    right: 12%;
    transform: rotate(25deg);
    background: #ff4b4b;
  }

  .brutal-hero-title {
    font-family: 'Syne', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Heiti SC', sans-serif;
    font-size: 5rem;
    font-weight: 900;
    margin: 0 0 2rem 0;
    color: #111;
    text-transform: uppercase;
    letter-spacing: -2px;
    line-height: 1.1;
    position: relative;
    display: inline-block;
    -webkit-text-stroke: 1px #111;
  }

  .brutal-hero-title span {
    text-shadow:
      6px 6px 0px #ff4b4b,
      10px 10px 0px #111;
    display: inline-block;
    transition: transform 0.2s;
  }

  .brutal-hero-title span:hover {
    transform: translateY(-5px) rotate(-2deg);
  }

  .brutal-hero-subtitle {
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-size: 1.35rem;
    font-weight: 600;
    color: #111;
    margin-bottom: 3rem;
    position: relative;
    z-index: 2;
    background: #ffd900;
    display: inline-block;
    padding: 0.5rem 1rem;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
  }

  .hero-search-wrapper {
    max-width: 800px;
    margin: 0 auto;
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .brutal-search-container {
    display: flex;
    align-items: center;
    width: 100%;
    border: 4px solid #111;
    background: #fff;
    box-shadow: 8px 8px 0px #111;
    transition: all 0.2s;
    height: 70px;
  }

  .brutal-search-container:focus-within {
    transform: translate(-4px, -4px);
    box-shadow: 12px 12px 0px #111;
  }

  .search-icon {
    font-size: 1.8rem;
    margin-left: 1.5rem;
    color: #4b7bff;
    font-weight: 800;
  }

  .brutal-search-input {
    flex: 1;
    height: 100%;
    border: none;
    background: transparent;
    padding: 0 1.5rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-size: 1.3rem;
    font-weight: 600;
    color: #111;
    outline: none;
  }

  .brutal-search-input::placeholder {
    color: #888;
    font-style: italic;
  }

  .search-shortcut {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-right: 1.5rem;
    font-weight: 600;
  }

  .cmd-key {
    background: #111;
    color: #fff;
    padding: 0.3rem 0.6rem;
    font-size: 0.85rem;
    box-shadow: 3px 3px 0px #ff4b4b;
  }

  .brutal-btn-primary {
    background: #00e572;
    border: 4px solid #111;
    padding: 1rem 2rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.25rem;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
    color: #111;
    margin-top: 1rem;
  }

  .brutal-btn-primary:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }

  .brutal-btn-primary:active {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-content-wrapper {
    max-width: 1600px;
    margin: 0 auto;
    padding: 3rem 2rem;
  }

  .brutal-section-header {
    margin-bottom: 2.5rem;
    position: relative;
    display: inline-block;
  }

  .brutal-section-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 2rem;
    font-weight: 800;
    margin: 0;
    padding: 0.75rem 1.5rem;
    border: 4px solid #111;
    background: #4b7bff;
    color: #fff;
    position: relative;
    z-index: 2;
  }

  .bg-title-pink {
    background: #ff9fb2;
    color: #111;
  }

  .bg-title-shadow {
    position: absolute;
    top: 8px;
    left: 8px;
    width: 100%;
    height: 100%;
    background: #111;
    z-index: 1;
  }

  .tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 2.5rem;
  }

  .show-more-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 4rem;
    padding-bottom: 2rem;
  }

  .brutal-btn-secondary {
    background: #fff;
    border: 4px solid #111;
    padding: 1rem 3rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.25rem;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition: all 0.1s;
    color: #111;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .brutal-btn-secondary:hover {
    background: #ffd900;
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }

  .brutal-btn-secondary:active {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 6rem 2rem;
    gap: 2rem;
  }

  .empty-icon-box {
    width: 80px;
    height: 80px;
    border: 4px solid #111;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 4px 4px 0px #111;
    transform: rotate(5deg);
    margin-bottom: 1.5rem;
    color: #4b7bff;
  }

  .empty-text {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.5rem;
    font-weight: 800;
    background: #fff;
    border: 3px solid #111;
    padding: 0.5rem 1.5rem;
    box-shadow: 4px 4px 0px #111;
  }

  /* Floating Actions UI */
  .brutal-floating-actions {
    position: fixed;
    right: 2rem;
    bottom: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    transform: translateY(20px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .brutal-floating-actions.is-visible {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  .brutal-action-btn {
    width: 60px;
    height: 60px;
    background: #fff;
    border: 4px solid #111;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
    color: #111;
    box-shadow: 6px 6px 0px #111;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .brutal-action-btn.brutal-btn-up:hover,
  .brutal-action-btn.brutal-btn-down:hover {
    transform: translate(-4px, -4px);
    box-shadow: 10px 10px 0px #111;
    background: #e5e5e5;
    color: #111;
  }

  .brutal-action-btn:active {
    transform: translate(2px, 2px) !important;
    box-shadow: 0px 0px 0px #111 !important;
  }

  @media (max-width: 1024px) {
    .brutal-hero-title {
      font-size: 3.5rem;
    }
    .deco-1,
    .deco-2 {
      display: none;
    }
    .brutal-btn-secondary {
      width: 100%;
      justify-content: center;
    }
  }

  @media (max-width: 768px) {
    .brutal-hero-title {
      font-size: 2.5rem;
    }
    .brutal-hero-subtitle {
      font-size: 1rem;
    }
    .tools-grid {
      grid-template-columns: 1fr;
    }
    .brutal-search-container {
      height: 60px;
    }
    .brutal-search-input {
      font-size: 1rem;
    }
    .search-shortcut {
      display: none;
    }
    .brutal-floating-actions {
      right: 1.5rem;
      bottom: 1.5rem;
      gap: 0.75rem;
    }
    .brutal-action-btn {
      width: 50px;
      height: 50px;
      font-size: 1.25rem;
      border-width: 3px;
      box-shadow: 4px 4px 0px #111;
    }
  }

  /* Subdue inherited components if needed */
  :deep(.brutal-app-header-override) {
    box-shadow: none !important;
    border-bottom: 4px solid #111 !important;
  }

  /* --- Dark Mode Overrides --- */
  [data-theme='dark'] .brutal-home-page {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }

  [data-theme='dark'] .brutal-hero {
    background: #1a1a1a;
    border-bottom-color: #eee;
    box-shadow: 0px 8px 0px #eee;
  }

  [data-theme='dark'] .hero-decorative-box {
    border-color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .deco-1 {
    background: #00994c;
  }
  [data-theme='dark'] .deco-2 {
    background: #cc0000;
  }

  [data-theme='dark'] .brutal-hero-title {
    color: #eee;
    -webkit-text-stroke: 1px #eee;
  }
  [data-theme='dark'] .brutal-hero-title span {
    text-shadow:
      6px 6px 0px #cc0000,
      10px 10px 0px #eee;
  }

  [data-theme='dark'] .brutal-hero-subtitle {
    background: #b28f00;
    color: #fff;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .brutal-search-container {
    background: #222;
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-search-container:focus-within {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .brutal-search-input {
    color: #eee;
  }
  [data-theme='dark'] .search-icon {
    color: #2a4eb2;
  }
  [data-theme='dark'] .cmd-key {
    background: #eee;
    color: #111;
    box-shadow: 3px 3px 0px #cc0000;
  }

  [data-theme='dark'] .brutal-btn-primary {
    background: #00994c;
    color: #fff;
    border-color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn-primary:hover {
    box-shadow: 9px 9px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn-primary:active {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .brutal-btn-secondary {
    background: #222;
    color: #eee;
    border-color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn-secondary:hover {
    background: #b28f00;
    box-shadow: 9px 9px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn-secondary:active {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .bg-title {
    background: #2a4eb2;
    color: #eee;
    border-color: #eee;
  }
  [data-theme='dark'] .bg-title-pink {
    background: #b25465;
    color: #eee;
  }
  [data-theme='dark'] .bg-title-shadow {
    background: #eee;
  }

  [data-theme='dark'] .brutal-empty-state {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-empty-state .empty-text {
    color: #eee;
  }
  [data-theme='dark'] .brutal-empty-state .empty-icon-box {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }

  /* Dark Mode Floating Actions */
  [data-theme='dark'] .brutal-action-btn {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn.brutal-btn-up:hover,
  [data-theme='dark'] .brutal-action-btn.brutal-btn-down:hover {
    background: #444;
    color: #fff;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:active {
    box-shadow: 0px 0px 0px #eee !important;
  }
</style>
