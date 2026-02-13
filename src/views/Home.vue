<template>
  <div class="home-page">
    <ParticlesBackground
      class="particles-bg"
      :particle-count="300"
      :particle-spread="10"
      :speed="0.1"
      :particle-colors="['#ffffff', '#aaaaaa']"
      :move-particles-on-hover="true"
      :particle-hover-factor="1"
      :alpha-particles="true"
      :particle-base-size="100"
      :size-randomness="1"
      :camera-distance="20"
      :disable-rotation="false"
    />

    <AppHeader
      :active-category="activeCategory"
      :show-search="false"
      @category-change="handleCategoryChange"
      @search="handleSearch"
    />

    <main class="main-content">
      <section class="page-hero">
        <h1 class="hero-title font-display">
          <DecryptedText
            :text="t('app.title')"
            animate-on="view"
            reveal-direction="center"
            class="gradient-text"
          />
        </h1>
        <p class="hero-subtitle">{{ t('home.subtitle') }}</p>
        <div class="update-badge-wrapper">
          <span class="update-badge">{{ t('home.updating') }}</span>
        </div>
        <div class="hero-search-wrapper">
          <el-input
            v-model="searchKeyword"
            :placeholder="t('home.searchPlaceholder', { count: allTools.length })"
            size="large"
            class="hero-search-input"
            :prefix-icon="Search"
            clearable
            @input="handleSearch"
          >
            <template #suffix>
              <div class="search-shortcut">
                <kbd>Ctrl</kbd> <span class="text-xs mx-0.5">+</span> <kbd>K</kbd>
              </div>
            </template>
          </el-input>

          <div v-if="isDev" class="test-bench-entry">
            <el-button type="primary" round :icon="Tools" @click="router.push('/test-bench')">
              进入开发测试台 (Sandbox)
            </el-button>
          </div>
        </div>
      </section>

      <div v-if="!searchKeyword" class="all-tools-header">
        <h2 class="section-title">
          <el-icon>
            <component :is="iconMap[currentCategoryInfo?.icon] || Grid" />
          </el-icon>
          {{ t('category.' + (currentCategoryInfo?.id || 'all')) }}
        </h2>
      </div>

      <section v-if="loading" class="tools-grid">
        <SkeletonCard v-for="i in 6" :key="i" />
      </section>

      <section v-else class="tools-grid-wrapper">
        <AnimatedContent
          :trigger-key="activeCategory + searchKeyword"
          :distance="50"
          direction="vertical"
          :duration="0.6"
          :scale="0.95"
          :threshold="0.01"
        >
          <div class="tools-grid animate-stagger">
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
            <el-button class="show-more-btn" @click="handleShowAll">
              <span>{{ t('home.viewAll', { count: filteredTools.length }) }}</span>
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
          </div>
        </AnimatedContent>
      </section>

      <div v-if="!loading && filteredTools.length === 0" class="empty-state">
        <el-icon :size="48">
          <Search />
        </el-icon>
        <p>{{ t('home.noResults') }}</p>
      </div>
    </main>

    <AppFooter />

    <ToolModal :visible="modalVisible" :tool="selectedTool" @close="modalVisible = false" />

    <el-backtop :right="40" :bottom="40" />
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useI18n } from 'vue-i18n';

  defineOptions({
    name: 'Home'
  });
  import {
    Search,
    Grid,
    ArrowDown,
    Monitor,
    Document,
    Picture,
    Brush,
    Wallet,
    Service,
    Coffee,
    Notebook,
    IceTea,
    Tools
  } from '@element-plus/icons-vue';
  import AppHeader from '@/components/layout/AppHeader.vue';
  import AppFooter from '@/components/layout/AppFooter.vue';
  import ParticlesBackground from '@/components/common/ParticlesBackground.vue';
  import ToolCard from '@/components/tools/ToolCard.vue';
  import ToolModal from '@/components/tools/ToolModal.vue';
  import SkeletonCard from '@/components/common/SkeletonCard.vue';
  import DecryptedText from '@/components/common/DecryptedText.vue';
  import AnimatedContent from '@/components/common/AnimatedContent.vue';
  import { loadToolsByCategory, searchToolsAsync, loadAllTools } from '@/data/tools';
  import { useUserStore } from '@/stores/user';
  import { watch } from 'vue';

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

  // 获取已展开的分类集合
  const getExpandedCategories = () => {
    try {
      return JSON.parse(sessionStorage.getItem('lrm-expanded-categories') || '[]');
    } catch (e) {
      console.warn('Failed to parse lrm-expanded-categories:', e);
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

  import { categories } from '@/data/tools';
  const currentCategoryInfo = computed(() => {
    return categories.find(c => c.id === activeCategory.value);
  });

  onMounted(async () => {
    // 初始加载当前分类工具
    await fetchTools(activeCategory.value);
    loading.value = false;

    // 后台加载所有工具以供搜索快速响应
    loadAllTools().then(res => {
      allTools.value = res;
    });
  });

  onUnmounted(() => {});

  const filteredTools = computed(() => {
    return displayedTools.value;
  });

  const visibleTools = computed(() => {
    if (isShowAll.value) {
      return filteredTools.value;
    }
    return filteredTools.value.slice(0, DISPLAY_LIMIT);
  });

  const hasMoreTools = computed(() => {
    return filteredTools.value.length > DISPLAY_LIMIT;
  });

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
</script>

<style scoped>
  .home-page {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    position: relative;
    overflow-x: hidden;
    padding-top: var(--header-height);
  }

  .particles-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;

    opacity: 0.6;
  }

  .main-content,
  .page-hero,
  header,
  footer {
    position: relative;
    z-index: 1;
  }

  .page-hero {
    text-align: center;
    padding: 2rem 0 2rem;
  }

  .hero-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    color: var(--text-primary);
  }

  .hero-search-wrapper {
    max-width: 640px;
    margin: 2.5rem auto 1.5rem;
    padding: 0 1rem;
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .test-bench-entry {
    margin-top: 0.5rem;
  }

  .test-bench-entry :deep(.el-button) {
    background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
    border: none;
    padding: 12px 24px;
    font-weight: 600;
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
    transition: all 0.3s;
  }

  .test-bench-entry :deep(.el-button):hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
    opacity: 0.9;
  }

  .hero-search-input {
    --el-input-border-radius: 16px;
    --el-input-bg-color: rgba(255, 255, 255, 0.8);
    --el-input-hover-border-color: rgba(59, 130, 246, 0.5);
    --el-input-focus-border-color: var(--accent-purple);

    height: 56px;
    font-size: 1.125rem;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.05));
  }

  [data-theme='dark'] .hero-search-input {
    --el-input-bg-color: rgba(30, 41, 59, 0.7);
  }

  .hero-search-input:hover {
    transform: translateY(-2px);
    filter: drop-shadow(0 10px 15px rgba(0, 0, 0, 0.1));
  }

  .hero-search-input.is-focus,
  .hero-search-input:focus-within {
    transform: translateY(-2px) scale(1.01);
    filter: drop-shadow(0 20px 25px rgba(59, 130, 246, 0.15));
    --el-input-bg-color: var(--bg-card);
  }

  .hero-search-input :deep(.el-input__wrapper) {
    padding: 4px 16px 4px 20px;
    backdrop-filter: blur(12px);
    box-shadow: 0 0 0 1px rgba(226, 232, 240, 0.6) inset;
  }

  [data-theme='dark'] .hero-search-input :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px rgba(51, 65, 85, 0.6) inset;
  }

  .hero-search-input :deep(.el-input__inner) {
    height: 100%;
  }

  .hero-search-input :deep(.el-input__prefix-inner) {
    font-size: 1.35rem;
    color: var(--accent-purple);
    margin-right: 8px;
  }

  .search-shortcut {
    display: flex;
    align-items: center;
    color: var(--text-muted);
    font-size: 0.875rem;
    pointer-events: none;
  }

  .search-shortcut kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    padding: 0 6px;
    font-size: 0.75rem;
    font-family: inherit;
    font-weight: 500;
    background: rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.05);
  }

  [data-theme='dark'] .search-shortcut kbd {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .gradient-text {
    background: none;
    -webkit-background-clip: unset;
    -webkit-text-fill-color: initial;
    background-clip: unset;
    color: var(--accent-purple);
  }

  .hero-subtitle {
    font-size: 1.125rem;
    color: var(--text-secondary);
    margin-bottom: 1rem;
  }

  .update-badge {
    display: inline-block;
    font-size: 0.75rem;
    background: rgba(37, 99, 235, 0.1);
    color: var(--primary-color);
    padding: 4px 12px;
    border-radius: 12px;
    vertical-align: middle;
    border: 1px solid rgba(37, 99, 235, 0.2);
  }

  .update-badge-wrapper {
    margin-top: 0.5rem;
    text-align: center;
  }

  .shortcut-hint {
    font-size: 0.8125rem;
    color: var(--text-muted);
  }

  .shortcut-hint kbd {
    display: inline-block;
    padding: 0.125rem 0.5rem;
    font-size: 0.75rem;
    font-family: inherit;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    margin: 0 0.125rem;
    color: var(--text-secondary);
  }

  .recent-section,
  .favorite-section {
    margin-bottom: 2rem;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .section-title .el-icon {
    color: var(--accent-purple);
  }

  .recent-tools {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .recent-tool-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--bg-card, #ffffff);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 0.875rem;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .recent-tool-item:hover {
    color: var(--accent-purple);
    border-color: var(--accent-purple);
    background: var(--bg-secondary);
  }

  .all-tools-header {
    margin-bottom: 1rem;
  }

  .tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    color: var(--text-muted);
    gap: 1rem;
  }

  .quick-search-results {
    margin-top: 1rem;
    max-height: 400px;
    overflow-y: auto;
  }

  .quick-search-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .quick-search-item:hover {
    background: var(--bg-secondary);
  }

  .quick-search-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 10px;
    background: var(--bg-primary);
    color: var(--accent-purple);
    border: 1px solid var(--border-color);
  }

  .quick-search-info {
    flex: 1;
    min-width: 0;
  }

  .quick-search-name {
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
  }

  .quick-search-summary {
    font-size: 0.8125rem;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .quick-search-empty {
    text-align: center;
    padding: 2rem;
    color: var(--text-muted);
  }

  .show-more-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 3rem;
    padding-bottom: 2rem;
  }

  .show-more-btn {
    height: 48px;
    padding: 0 2.5rem;
    border-radius: 24px;
    font-size: 1rem;
    font-weight: 500;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
  }

  .show-more-btn:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(59, 130, 246, 0.15);
    border-color: var(--accent-purple);
    color: var(--accent-purple);
  }

  .show-more-btn:active {
    transform: translateY(-2px);
  }

  .dialog-footer-hint {
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  .dialog-footer-hint kbd {
    padding: 0.125rem 0.375rem;
    background: var(--bg-glass);
    border: 1px solid var(--border-color);
    border-radius: 3px;
    font-family: inherit;
  }

  @media (max-width: 1024px) {
  }

  @media (max-width: 768px) {
    .hero-title {
      font-size: 1.75rem;
    }

    .hero-subtitle {
      font-size: 1rem;
    }

    .tools-grid {
      grid-template-columns: 1fr;
    }

    .shortcut-hint {
      display: none;
    }

    .count-badge {
      font-size: 0.75rem;
      background: rgba(0, 0, 0, 0.05);
      padding: 0 6px;
      border-radius: 99px;
      margin-left: 4px;
      color: var(--text-muted);
    }

    .category-tab.active .count-badge {
      background: rgba(255, 255, 255, 0.3);
      color: white;
    }
  }
</style>
