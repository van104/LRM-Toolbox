<template>
  <div class="category-manager">
    <!-- Recommended Tools Section -->
    <div
      v-if="activeCategory === 'all' && !searchKeyword && recommendedTools.length > 0"
      class="brutal-content-wrapper"
      style="padding-bottom: 0"
    >
      <div class="brutal-section-header">
        <h2 class="brutal-section-title bg-title-pink">
          <el-icon><RecommendIcon /></el-icon>
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
            :is-favorite="isFavorite(tool.id)"
            @click="$emit('tool-click', tool)"
            @view-detail="$emit('view-detail', tool)"
            @toggle-favorite="$emit('toggle-favorite', tool.id)"
          />
        </div>
      </section>
    </div>

    <!-- Main Listing Section -->
    <div class="brutal-content-wrapper">
      <div v-if="!searchKeyword" class="brutal-section-header">
        <h2 class="brutal-section-title bg-title">
          <el-icon>
            <component
              :is="
                currentCategoryInfo?.svgIcon
                  ? iconMap[currentCategoryInfo.svgIcon]
                  : iconMap[currentCategoryInfo?.icon] || Grid
              "
            />
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
            :is-favorite="isFavorite(tool.id)"
            @click="$emit('tool-click', tool)"
            @view-detail="$emit('view-detail', tool)"
            @toggle-favorite="$emit('toggle-favorite', tool.id)"
          />
        </div>

        <div v-if="hasMoreTools && !isShowAll" class="show-more-wrapper">
          <button class="brutal-btn-secondary" @click="handleShowAll">
            {{ t('home.viewAll', { count: displayedTools.length }) }}
            <el-icon class="icon-right"><ArrowDown /></el-icon>
          </button>
        </div>
      </section>

      <div v-if="!loading && displayedTools.length === 0" class="brutal-empty-state">
        <div class="empty-icon-box">
          <el-icon :size="48"><Search /></el-icon>
        </div>
        <p class="empty-text">{{ t('home.noResults') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, watch, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import {
    Grid,
    Search,
    ArrowDown,
    Monitor,
    Document,
    Picture,
    Brush,
    Wallet,
    Service,
    Coffee,
    Notebook,
    IceTea
  } from '@element-plus/icons-vue';
  import * as CategoryIcons from '@/components/icons/categories';
  import { RecommendIcon } from '@/components/icons/system';
  import ToolCard from '@/components/tools/ToolCard.vue';
  import SkeletonCard from '@/components/common/SkeletonCard.vue';
  import { loadToolsByCategory, searchToolsAsync, loadAllTools, categories } from '@/data/tools';

  const props = defineProps({
    activeCategory: {
      type: String,
      default: 'all'
    },
    searchKeyword: {
      type: String,
      default: ''
    },
    isFavorite: {
      type: Function,
      required: true
    }
  });

  defineEmits(['tool-click', 'view-detail', 'toggle-favorite']);

  const { t } = useI18n();
  const loading = ref(true);
  const displayedTools = ref([]);
  const recommendedTools = ref([]);
  const allToolsCount = ref(0);

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
    IceTea,
    ...CategoryIcons
  };

  const getExpandedCategories = () => {
    try {
      return JSON.parse(sessionStorage.getItem('lrm-expanded-categories') || '[]');
    } catch {
      return [];
    }
  };
  const expandedCategories = ref(getExpandedCategories());

  const isShowAll = computed({
    get: () => expandedCategories.value.includes(props.activeCategory) || !!props.searchKeyword,
    set: val => {
      if (val && !expandedCategories.value.includes(props.activeCategory)) {
        expandedCategories.value.push(props.activeCategory);
        sessionStorage.setItem('lrm-expanded-categories', JSON.stringify(expandedCategories.value));
      }
    }
  });

  const currentCategoryInfo = computed(() => {
    return categories.find(c => c.id === props.activeCategory);
  });

  const visibleTools = computed(() => {
    if (isShowAll.value) return displayedTools.value;
    return displayedTools.value.slice(0, DISPLAY_LIMIT);
  });

  const hasMoreTools = computed(() => displayedTools.value.length > DISPLAY_LIMIT);

  async function fetchTools(category, keyword = '') {
    loading.value = true;
    if (keyword) {
      displayedTools.value = await searchToolsAsync(keyword);
    } else {
      displayedTools.value = await loadToolsByCategory(category);
    }
    loading.value = false;
  }

  function handleShowAll() {
    isShowAll.value = true;
  }

  // Initialize recommendation
  async function initRecommendations() {
    const allTools = await loadAllTools();
    allToolsCount.value = allTools.length;

    const perCategory = 2;
    let recommendedList = [];
    categories.forEach(cat => {
      const catTools = allTools.filter(t => t.category === cat.id);
      const shuffled = [...catTools].sort(() => 0.5 - Math.random());
      recommendedList.push(...shuffled.slice(0, perCategory));
    });
    recommendedTools.value = recommendedList.sort(() => 0.5 - Math.random()).slice(0, 6);
  }

  onMounted(async () => {
    await fetchTools(props.activeCategory, props.searchKeyword);
    if (props.activeCategory === 'all' && !props.searchKeyword) {
      await initRecommendations();
    }
  });

  watch(
    () => props.activeCategory,
    async newCat => {
      if (!props.searchKeyword) {
        await fetchTools(newCat);
      }
    }
  );

  watch(
    () => props.searchKeyword,
    async newKeyword => {
      await fetchTools(props.activeCategory, newKeyword);
    }
  );

  defineExpose({
    allToolsCount
  });
</script>

<style scoped>
  .brutal-content-wrapper {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem 5rem;
  }

  .brutal-section-header {
    position: relative;
    margin-bottom: 3.5rem;
    display: inline-block;
  }

  .brutal-section-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.75rem;
    font-weight: 800;
    padding: 0.8rem 2rem;
    border: 4px solid #111;
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .bg-title {
    background: #ffd900;
    color: #111;
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
    grid-template-columns: repeat(3, 1fr);
    gap: 2.5rem;
  }

  .show-more-wrapper {
    margin-top: 4rem;
    display: flex;
    justify-content: center;
  }

  .brutal-btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    background: #fff;
    border: 4px solid #111;
    padding: 1.25rem 2.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition: all 0.15s cubic-bezier(0.3, 0, 0, 1);
  }

  .brutal-btn-secondary:hover {
    transform: translate(-3px, -3px);
    box-shadow: 10px 10px 0px #111;
    background: #4b7bff;
    color: #fff;
  }

  .brutal-btn-secondary:active {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0px #111;
  }

  .brutal-empty-state {
    text-align: center;
    padding: 6rem 2rem;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
    margin-top: 2rem;
  }

  .empty-icon-box {
    margin-bottom: 2rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100px;
    height: 100px;
    border: 4px solid #111;
    background: #ffd900;
    box-shadow: 6px 6px 0px #111;
  }

  .empty-text {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.5rem;
    font-weight: 800;
    color: #111;
  }

  [data-theme='dark'] .brutal-empty-state {
    background: #1e293b;
    border-color: #eee;
    box-shadow: 12px 12px 0px #eee;
    color: #eee;
  }

  [data-theme='dark'] .empty-icon-box {
    border-color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }

  [data-theme='dark'] .bg-title-shadow {
    background: #eee;
  }

  [data-theme='dark'] .brutal-section-title {
    border-color: #eee;
  }

  [data-theme='dark'] .brutal-btn-secondary {
    background: #1e293b;
    color: #eee;
    border-color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }

  @media (max-width: 1200px) {
    .tools-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 2rem;
    }
  }

  @media (max-width: 768px) {
    .tools-grid {
      grid-template-columns: 1fr;
    }
    .brutal-content-wrapper {
      padding: 0 1.5rem 4rem;
    }
    .brutal-section-title {
      font-size: 1.25rem;
      padding: 0.6rem 1.2rem;
    }
  }
</style>
