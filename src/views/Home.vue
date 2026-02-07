<template>
  <div class="home-page" @keydown="handleKeydown">
    <ParticlesBackground class="particles-bg" :particleCount="300" :particleSpread="10" :speed="0.1"
      :particleColors="['#ffffff', '#aaaaaa']" :moveParticlesOnHover="true" :particleHoverFactor="1"
      :alphaParticles="true" :particleBaseSize="100" :sizeRandomness="1" :cameraDistance="20"
      :disableRotation="false" />

    <AppHeader :active-category="activeCategory" :show-search="false" @category-change="handleCategoryChange"
      @search="handleSearch" />


    <main class="main-content">

      <section class="page-hero">
        <h1 class="hero-title font-display">
          <DecryptedText text="LRM工具箱" animate-on="view" reveal-direction="center" class="gradient-text" />
        </h1>
        <p class="hero-subtitle">
          高效便捷的开发者工具集合，让工作更轻松
        </p>
        <div class="update-badge-wrapper">
          <span class="update-badge">工具持续更新中...</span>
        </div>
        <div class="hero-search-wrapper">
          <el-input v-model="searchKeyword" :placeholder="`搜索 ${tools.length}+ 个实用工具 (Ctrl + K)...`" size="large"
            class="hero-search-input" :prefix-icon="Search" clearable @input="handleSearch">
            <template #suffix>
              <div class="search-shortcut">
                <kbd>Ctrl</kbd> <span class="text-xs mx-0.5">+</span> <kbd>K</kbd>
              </div>
            </template>
          </el-input>
        </div>
      </section>


      <div class="all-tools-header" v-if="activeCategory === 'all' && !searchKeyword">
        <h2 class="section-title">
          <el-icon>
            <Grid />
          </el-icon>
          全部工具
        </h2>
      </div>


      <section v-if="loading" class="tools-grid">
        <SkeletonCard v-for="i in 6" :key="i" />
      </section>


      <section v-else class="tools-grid-wrapper">
        <AnimatedContent :trigger-key="activeCategory + searchKeyword" :distance="50" direction="vertical"
          :duration="0.6" :scale="0.95" :threshold="0.01">
          <div class="tools-grid animate-stagger">
            <ToolCard v-for="tool in filteredTools" :key="tool.id" :tool="tool"
              :is-favorite="userStore.isFavorite(tool.id)" @click="handleToolClick" @view-detail="openToolModal"
              @toggle-favorite="handleToggleFavorite" />
          </div>
        </AnimatedContent>
      </section>


      <div v-if="!loading && filteredTools.length === 0" class="empty-state">
        <el-icon :size="48">
          <Search />
        </el-icon>
        <p>没有找到匹配的工具</p>
      </div>
    </main>


    <AppFooter />


    <ToolModal :visible="modalVisible" :tool="selectedTool" @close="modalVisible = false" />


    <el-dialog v-model="searchDialogVisible" title="快速搜索" width="500px" :show-close="false" @opened="focusSearchInput">
      <el-input ref="searchInputRef" v-model="quickSearchKeyword" placeholder="输入工具名称搜索..." size="large" clearable
        @input="handleQuickSearch">
        <template #prefix>
          <el-icon>
            <Search />
          </el-icon>
        </template>
      </el-input>

      <div class="quick-search-results" v-if="quickSearchResults.length > 0">
        <div v-for="tool in quickSearchResults" :key="tool.id" class="quick-search-item"
          @click="selectQuickSearchTool(tool)">
          <div class="quick-search-icon">
            <el-icon :size="24">
              <component :is="tool.icon" />
            </el-icon>
          </div>
          <div class="quick-search-info">
            <div class="quick-search-name">{{ tool.name }}</div>
            <div class="quick-search-summary">{{ tool.summary }}</div>
          </div>
        </div>
      </div>

      <div v-else-if="quickSearchKeyword" class="quick-search-empty">
        没有找到匹配的工具
      </div>

      <template #footer>
        <span class="dialog-footer-hint">
          按 <kbd>Esc</kbd> 关闭
        </span>
      </template>
    </el-dialog>


    <el-backtop :right="40" :bottom="40" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'


defineOptions({
  name: 'Home'
})
import { Search, Clock, Star, Grid } from '@element-plus/icons-vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import ParticlesBackground from '@/components/common/ParticlesBackground.vue'
import ToolCard from '@/components/tools/ToolCard.vue'
import ToolModal from '@/components/tools/ToolModal.vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'
import DecryptedText from '@/components/common/DecryptedText.vue'
import AnimatedContent from '@/components/common/AnimatedContent.vue'
import { categories, tools, getToolsByCategory, searchTools } from '@/data/tools'
import { useUserStore } from '@/stores/user'
import { watch } from 'vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()


const activeCategory = ref(route.query.category || 'all')
const searchKeyword = ref('')
const modalVisible = ref(false)
const selectedTool = ref({})
const loading = ref(true)


const searchDialogVisible = ref(false)
const quickSearchKeyword = ref('')
const quickSearchResults = ref([])
const searchInputRef = ref(null)


onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 300)


  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
})


const favoriteTools = computed(() => {
  return tools.filter(tool => userStore.isFavorite(tool.id))
})


const filteredTools = computed(() => {
  if (searchKeyword.value) {
    return searchTools(searchKeyword.value)
  }
  return getToolsByCategory(activeCategory.value)
})


watch(() => route.query.category, (newCategory) => {
  activeCategory.value = newCategory || 'all'
})


function handleCategoryChange(categoryId) {
  activeCategory.value = categoryId
  searchKeyword.value = ''


  router.replace({
    query: {
      ...route.query,
      category: categoryId === 'all' ? undefined : categoryId
    }
  })
}


function handleSearch(keyword) {
  searchKeyword.value = keyword
  if (keyword) {
    activeCategory.value = 'all'
  }
}


function openToolModal(tool) {
  selectedTool.value = tool
  modalVisible.value = true
}


function handleToggleFavorite(toolId) {
  userStore.toggleFavorite(toolId)
}


function handleToolClick(tool) {
  if (tool.route) {
    userStore.addToHistory(tool)
    if (tool.isLocal === false || tool.route.startsWith('http')) {
      window.open(tool.route, '_blank')
    } else {
      router.push(tool.route)
    }
  } else {

    openToolModal(tool)
  }
}


function goToTool(item) {
  if (item.route) {
    const tool = tools.find(t => t.id === item.id)
    if (tool) {
      userStore.addToHistory(tool)
      if (tool.isLocal === false || item.route.startsWith('http')) {
        window.open(item.route, '_blank')
      } else {
        router.push(item.route)
      }
    } else {

      if (item.route.startsWith('http')) {
        window.open(item.route, '_blank')
      } else {
        router.push(item.route)
      }
    }
  }
}


function handleGlobalKeydown(e) {

  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    searchDialogVisible.value = true
  }


  if (e.key === 'Escape' && searchDialogVisible.value) {
    searchDialogVisible.value = false
  }
}


function handleKeydown(e) {

}


function focusSearchInput() {
  nextTick(() => {
    searchInputRef.value?.focus()
  })
}


function handleQuickSearch() {
  if (quickSearchKeyword.value.trim()) {
    quickSearchResults.value = searchTools(quickSearchKeyword.value)
  } else {
    quickSearchResults.value = []
  }
}


function selectQuickSearchTool(tool) {
  searchDialogVisible.value = false
  quickSearchKeyword.value = ''
  quickSearchResults.value = []

  userStore.addToHistory(tool)

  if (tool.route) {
    if (tool.isLocal === false || tool.route.startsWith('http')) {
      window.open(tool.route, '_blank')
    } else {
      router.push(tool.route)
    }
  } else {
    openToolModal(tool)
  }
}
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
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


[data-theme="dark"] .hero-search-input {
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

[data-theme="dark"] .hero-search-input :deep(.el-input__wrapper) {
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

[data-theme="dark"] .search-shortcut kbd {
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


@media (max-width: 1024px) {}

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
