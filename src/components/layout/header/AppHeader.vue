<template>
  <header class="app-header">
    <div class="header-content">
      <router-link to="/" class="logo" :title="t('nav.backToHome')">
        <LrmLogo :size="32" />
        <span class="logo-text font-display">{{ t('app.title') }}</span>
      </router-link>

      <NavMenu
        :active-category="activeCategory"
        :categories="categories"
        :counts="toolsCountMap"
        :is-dark="themeStore.theme === 'dark'"
        @change="handleCategoryChange"
      />

      <HeaderActions
        :show-search="showSearch"
        @search="val => $emit('search', val)"
        @toggle-mobile-menu="mobileMenuOpen = !mobileMenuOpen"
      />
    </div>

    <MobileMenu
      :visible="mobileMenuOpen"
      :active-category="activeCategory"
      :categories="categories"
      :counts="toolsCountMap"
      @change="handleMobileNavClick"
    />
  </header>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import LrmLogo from '@/components/icons/LrmLogo.vue';
  import NavMenu from './NavMenu.vue';
  import HeaderActions from './HeaderActions.vue';
  import MobileMenu from './MobileMenu.vue';
  import { useThemeStore } from '@/stores/theme';
  import { categories, loadAllTools } from '@/data/tools';

  defineProps({
    activeCategory: {
      type: String,
      default: 'all'
    },
    showSearch: {
      type: Boolean,
      default: true
    }
  });

  const emit = defineEmits(['category-change', 'search']);

  const { t } = useI18n();
  const themeStore = useThemeStore();
  const mobileMenuOpen = ref(false);
  const toolsCountMap = ref({});

  onMounted(async () => {
    const allTools = await loadAllTools();
    const counts = {};
    categories.forEach(cat => {
      if (cat.id === 'all') {
        counts[cat.id] = allTools.length;
      } else {
        counts[cat.id] = allTools.filter(t => t.category === cat.id).length;
      }
    });
    toolsCountMap.value = counts;
  });

  function handleCategoryChange(categoryId) {
    emit('category-change', categoryId);
  }

  function handleMobileNavClick(categoryId) {
    emit('category-change', categoryId);
    mobileMenuOpen.value = false;
  }
</script>

<style scoped>
  .app-header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 100;
    height: var(--header-height);
    background: #fff;
    border-bottom: 4px solid #111;
    box-shadow: 0px 8px 0px #111;
    transition: all 0.2s ease;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
  }

  [data-theme='dark'] .app-header {
    background: #1a1a1a;
    border-bottom-color: #eee;
    box-shadow: 0px 8px 0px #eee;
  }

  .header-content {
    max-width: 1600px;
    margin: 0 auto;
    height: 100%;
    padding: 0 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
    transition: transform 0.1s;
  }

  .logo:hover {
    transform: translate(-2px, -2px);
  }

  .logo:active {
    transform: translate(2px, 2px);
  }

  .logo-text {
    font-family: 'Syne', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Heiti SC', sans-serif;
    font-size: 1.5rem;
    font-weight: 900;
    letter-spacing: -0.05em;
    color: #111;
    text-shadow: 3px 3px 0px #4b7bff;
    text-transform: uppercase;
    -webkit-text-stroke: 0.5px #111;
  }

  [data-theme='dark'] .logo-text {
    color: #eee;
    text-shadow: 3px 3px 0px #2a4eb2;
    -webkit-text-stroke: 0.5px #eee;
  }
</style>
