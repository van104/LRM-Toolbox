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
      <HomeHero
        v-model="searchKeyword"
        :total-tools-count="totalToolsCount"
        :is-dev="isDev"
        @go-test-bench="router.push('/test-bench')"
      />

      <CategoryManager
        ref="categoryManagerRef"
        :active-category="activeCategory"
        :search-keyword="searchKeyword"
        :is-favorite="userStore.isFavorite"
        @tool-click="handleToolClick"
        @view-detail="openToolModal"
        @toggle-favorite="handleToggleFavorite"
      />
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
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  defineOptions({ name: 'Home' });

  import { ArrowDown, ArrowUp } from '@element-plus/icons-vue';
  import AppHeader from '@/components/layout/header/AppHeader.vue';
  import AppFooter from '@/components/layout/footer/AppFooter.vue';
  import HomeHero from '@/components/layout/HomeHero.vue';
  import CategoryManager from '@/components/tools/CategoryManager.vue';
  import ToolModal from '@/components/layout/modal/ToolModal.vue';
  import { useUserStore } from '@/stores/user';
  import { loadAllTools } from '@/data/tools';

  const router = useRouter();
  const route = useRoute();
  const userStore = useUserStore();

  const isDev = import.meta.env.DEV;
  const activeCategory = ref(route.query.category || 'all');
  const searchKeyword = ref('');
  const modalVisible = ref(false);
  const selectedTool = ref({});
  const categoryManagerRef = ref(null);
  const allToolsCount = ref(255);
  const totalToolsCount = computed(() => {
    // Attempt to get the latest count from the manager if available
    const mCount = categoryManagerRef.value?.allToolsCount;
    return (typeof mCount === 'number' ? mCount : mCount?.value) || allToolsCount.value;
  });

  watch(
    () => route.query.category,
    newCategory => {
      activeCategory.value = newCategory || 'all';
      searchKeyword.value = '';
    }
  );

  function handleCategoryChange(categoryId) {
    activeCategory.value = categoryId;
    searchKeyword.value = '';
    router.replace({
      query: {
        ...route.query,
        category: categoryId === 'all' ? undefined : categoryId
      }
    });
  }

  function handleSearch(keyword) {
    searchKeyword.value = keyword;
    if (keyword) {
      activeCategory.value = 'all';
    }
  }

  watch(searchKeyword, handleSearch);

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

  // Float Nav Logic
  const showFloatNav = ref(false);

  const handleScroll = () => {
    showFloatNav.value = window.scrollY > 200;
  };

  onMounted(async () => {
    window.addEventListener('scroll', handleScroll);
    const allTools = await loadAllTools();
    allToolsCount.value = allTools.length;
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
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
    .brutal-btn-secondary {
      width: 100%;
      justify-content: center;
    }
  }

  @media (max-width: 768px) {
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

  [data-theme='dark'] .cmd-key {
    background: #eee;
    color: #111;
    box-shadow: 3px 3px 0px #cc0000;
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
