```
<template>
  <header class="app-header glass">
    <div class="header-content">
      <router-link to="/" class="logo" :title="t('nav.backToHome')">
        <LrmLogo :size="32" />
        <span class="logo-text font-display">{{ t('app.title') }}</span>
      </router-link>

      <el-tooltip
        :content="t('nav.dragTip')"
        placement="bottom"
        :effect="themeStore.theme === 'dark' ? 'dark' : 'light'"
      >
        <nav
          ref="navMenuRef"
          class="nav-menu"
          @mousedown="handleMouseDown"
          @mouseleave="handleMouseLeave"
          @mouseup="handleMouseUp"
          @mousemove="handleMouseMove"
        >
          <button
            v-for="cat in categories"
            :key="cat.id"
            :ref="
              el => {
                if (el) navItemsRef[cat.id] = el;
              }
            "
            :class="['nav-item', { active: activeCategory === cat.id }]"
            @click="handleCategoryClick($event, cat.id)"
          >
            <el-icon :size="18">
              <component :is="iconMap[cat.icon]" />
            </el-icon>
            <span>{{ t('category.' + cat.id) }}</span>
            <span class="count-badge">{{ getCategoryCount(cat.id) }}</span>
          </button>
          <div ref="indicatorRef" class="nav-indicator"></div>
        </nav>
      </el-tooltip>

      <div class="header-actions">
        <div v-if="showSearch" class="search-box">
          <el-icon :size="18">
            <Search />
          </el-icon>
          <input
            v-model="searchKeyword"
            type="text"
            :placeholder="t('nav.search')"
            @input="$emit('search', searchKeyword)"
          />
        </div>

        <button class="icon-btn" :title="t('nav.favorites')" @click="$router.push('/favorites')">
          <el-badge
            :value="userStore.favoritesCount"
            :hidden="userStore.favoritesCount === 0"
            type="warning"
            is-dot
          >
            <el-icon :size="20">
              <Star />
            </el-icon>
          </el-badge>
        </button>

        <button class="icon-btn" :title="t('nav.history')" @click="$router.push('/history')">
          <el-badge
            :value="userStore.historyCount"
            :hidden="userStore.historyCount === 0"
            type="info"
            is-dot
          >
            <el-icon :size="20">
              <Clock />
            </el-icon>
          </el-badge>
        </button>

        <button
          class="icon-btn"
          :title="locale === 'zh-CN' ? 'Switch to English' : '切换为中文'"
          @click="toggleLanguage"
        >
          <span class="text-xs font-bold">{{ locale === 'zh-CN' ? 'En' : '中' }}</span>
        </button>

        <button ref="themeBtnRef" class="icon-btn" @click="toggleTheme">
          <el-icon :size="20">
            <Sunny v-if="themeStore.theme === 'light'" />
            <Moon v-else />
          </el-icon>
        </button>

        <button class="mobile-menu-btn" @click="mobileMenuOpen = !mobileMenuOpen">
          <el-icon :size="24">
            <Operation />
          </el-icon>
        </button>
      </div>
    </div>

    <Transition name="slide">
      <div v-if="mobileMenuOpen" class="mobile-menu">
        <button
          v-for="cat in categories"
          :key="cat.id"
          :class="['mobile-nav-item', { active: activeCategory === cat.id }]"
          @click="handleMobileNavClick(cat.id)"
        >
          <el-icon :size="24">
            <component :is="iconMap[cat.icon]" />
          </el-icon>
          <span>{{ t('category.' + cat.id) }}</span>
          <span class="count-badge mobile">{{ getCategoryCount(cat.id) }}</span>
        </button>
      </div>
    </Transition>
  </header>
</template>

<script setup>
  import { ref, onMounted, watch, nextTick } from 'vue';
  import { useI18n } from 'vue-i18n';
  import LrmLogo from '@/components/icons/LrmLogo.vue';
  import { useThemeStore } from '@/stores/theme';
  import { useUserStore } from '@/stores/user';
  import { categories, loadAllTools } from '@/data/tools';
  import {
    Search,
    Sunny,
    Moon,
    Monitor,
    Operation,
    Grid,
    Document,
    Picture,
    Star,
    Clock,
    Brush,
    Coffee,
    Wallet,
    Service,
    Notebook,
    IceTea
  } from '@element-plus/icons-vue';

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

  const props = defineProps({
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

  const { t, locale } = useI18n();
  const themeStore = useThemeStore();
  const userStore = useUserStore();
  const searchKeyword = ref('');
  const mobileMenuOpen = ref(false);

  const toggleLanguage = () => {
    locale.value = locale.value === 'zh-CN' ? 'en' : 'zh-CN';
    localStorage.setItem('locale', locale.value);
  };

  const navMenuRef = ref(null);
  const indicatorRef = ref(null);
  const navItemsRef = ref({});
  const toolsCountMap = ref({});
  let isDragging = false;
  let startX = 0;
  let scrollLeft = 0;
  let dragMoved = false;

  const updateIndicator = id => {
    const el = navItemsRef.value[id];
    if (el && indicatorRef.value) {
      indicatorRef.value.style.width = `${el.offsetWidth}px`;
      indicatorRef.value.style.left = `${el.offsetLeft}px`;
      indicatorRef.value.style.opacity = '1';

      // 滚动导航栏使当前激活分类可见
      if (navMenuRef.value) {
        const navRect = navMenuRef.value.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        // 如果元素不在可视区域内，滚动到居中位置
        if (elRect.left < navRect.left || elRect.right > navRect.right) {
          const scrollTarget =
            el.offsetLeft - navMenuRef.value.offsetWidth / 2 + el.offsetWidth / 2;
          navMenuRef.value.scrollTo({ left: scrollTarget, behavior: 'instant' });
        }
      }
    }
  };

  onMounted(async () => {
    // 加载所有工具来计算每个分类的数量
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

    setTimeout(() => {
      updateIndicator(props.activeCategory);
    }, 100);
  });

  watch(
    () => props.activeCategory,
    newId => {
      updateIndicator(newId);
    }
  );

  function handleMouseDown(e) {
    isDragging = true;
    dragMoved = false;
    navMenuRef.value.classList.add('is-dragging');
    startX = e.pageX - navMenuRef.value.offsetLeft;
    scrollLeft = navMenuRef.value.scrollLeft;
  }

  function handleMouseLeave() {
    isDragging = false;
    navMenuRef.value.classList.remove('is-dragging');
  }

  function handleMouseUp() {
    isDragging = false;
    navMenuRef.value.classList.remove('is-dragging');
  }

  function handleMouseMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - navMenuRef.value.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 5) {
      dragMoved = true;
    }
    navMenuRef.value.scrollLeft = scrollLeft - walk;
  }

  function handleCategoryClick(event, categoryId) {
    if (dragMoved) {
      event.preventDefault();
      return;
    }
    emit('category-change', categoryId);
  }

  const themeBtnRef = ref(null);

  async function toggleTheme(event) {
    const isDark = themeStore.theme === 'dark';

    // 如果浏览器不支持 View Transitions API，直接切换
    if (!document.startViewTransition) {
      themeStore.setMode(isDark ? 'light' : 'dark');
      return;
    }

    // 获取按钮位置作为动画中心
    const rect = themeBtnRef.value?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : event.clientX;
    const y = rect ? rect.top + rect.height / 2 : event.clientY;

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // 注入 CSS 变量以控制动画的原点和半径
    document.documentElement.style.setProperty('--x', `${x}px`);
    document.documentElement.style.setProperty('--y', `${y}px`);
    document.documentElement.style.setProperty('--r', `${endRadius}px`);

    // 如果是暗切亮，添加 shrink-dark 类来反转动画逻辑
    if (isDark) {
      document.documentElement.classList.add('shrink-dark');
    } else {
      document.documentElement.classList.remove('shrink-dark');
    }

    const transition = document.startViewTransition(async () => {
      themeStore.setMode(isDark ? 'light' : 'dark');
      await nextTick();
    });

    // 动画结束后清理
    transition.finished.finally(() => {
      document.documentElement.classList.remove('shrink-dark');
      document.documentElement.style.removeProperty('--x');
      document.documentElement.style.removeProperty('--y');
      document.documentElement.style.removeProperty('--r');
    });
  }

  function handleMobileNavClick(categoryId) {
    emit('category-change', categoryId);
    mobileMenuOpen.value = false;
  }

  function getCategoryCount(categoryId) {
    return toolsCountMap.value[categoryId] || 0;
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

  .nav-menu {
    display: flex;
    gap: 0.5rem;
    padding: 0.25rem;
    background: transparent;
    position: relative;
    overflow-x: auto;
    scrollbar-width: none;
    cursor: grab;
    user-select: none;
  }

  .nav-menu.is-dragging {
    cursor: grabbing;
    scroll-behavior: auto;
  }

  .nav-menu::-webkit-scrollbar {
    display: none;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1.25rem;
    color: #111;
    font-size: 0.95rem;
    font-weight: 800;
    white-space: nowrap;
    transition: transform 0.1s;
    position: relative;
    z-index: 1;
    border: 3px solid transparent;
    background: transparent;
    cursor: pointer;
  }

  .nav-item:hover {
    transform: translate(-2px, -2px);
    border-color: #111;
    box-shadow: 4px 4px 0px #111;
    background: #fff;
    color: #111;
  }

  .nav-item:active {
    transform: translate(2px, 2px);
    box-shadow: 0px 0px 0px #111;
  }

  .nav-item.active {
    color: #111;
  }

  .nav-indicator {
    position: absolute;
    bottom: 2px;
    top: 2px;
    height: auto;
    border: 3px solid #111;
    background: #ffd900;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 0;
    opacity: 0;
  }

  /* Dark mode variants */
  [data-theme='dark'] .nav-menu {
    background: transparent;
  }
  [data-theme='dark'] .nav-item {
    color: #eee;
  }
  [data-theme='dark'] .nav-item:hover {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
    background: #222;
    color: #eee;
  }
  [data-theme='dark'] .nav-item.active {
    color: #111;
  }
  [data-theme='dark'] .nav-item:active {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .nav-indicator {
    background: #b28f00;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }

  .count-badge {
    font-family: 'Syne', sans-serif;
    font-size: 0.75rem;
    font-weight: 900;
    background: #111;
    color: #fff;
    padding: 2px 6px;
    border: 2px solid #111;
    transition: all 0.2s;
  }

  .nav-item:hover .count-badge,
  .nav-item.active .count-badge {
    background: #fff;
    color: #111;
  }

  [data-theme='dark'] .count-badge {
    background: #eee;
    color: #111;
    border-color: #eee;
  }
  [data-theme='dark'] .nav-item:hover .count-badge,
  [data-theme='dark'] .nav-item.active .count-badge {
    background: #222;
    color: #eee;
  }

  .count-badge.mobile {
    margin-left: auto;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
  }

  .header-actions :deep(.el-dropdown) {
    display: flex;
    align-items: center;
  }

  .header-actions :deep(.el-badge) {
    display: flex;
    align-items: center;
    line-height: 1;
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #fff;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
  }

  .search-box:focus-within {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #4b7bff;
  }

  .search-box input {
    border: none;
    background: none;
    outline: none;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 800;
    font-size: 0.9rem;
    color: #111;
    width: 140px;
  }

  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    color: #111;
    transition: all 0.1s;
    position: relative;
    background: transparent;
    border: 3px solid transparent;
    cursor: pointer;
  }

  .icon-btn:hover {
    transform: translate(-2px, -2px);
    background: #fff;
    color: #111;
    border-color: #111;
    box-shadow: 3px 3px 0px #111;
  }

  .icon-btn:active {
    transform: translate(2px, 2px);
    box-shadow: 0px 0px 0px #111;
  }

  /* Dark Mode header actions */
  [data-theme='dark'] .search-box {
    background: #222;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .search-box:focus-within {
    box-shadow: 6px 6px 0px #2a4eb2;
  }
  [data-theme='dark'] .search-box input {
    color: #eee;
  }

  [data-theme='dark'] .icon-btn {
    color: #eee;
  }
  [data-theme='dark'] .icon-btn:hover {
    background: #222;
    color: #eee;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .icon-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }

  .mobile-menu-btn {
    display: none;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    color: var(--text-secondary);
  }

  .mobile-menu {
    position: absolute;
    top: var(--header-height);
    left: 1rem;
    right: 1rem;
    padding: 1.5rem;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    transform-origin: top center;
  }

  .mobile-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.25rem 0.5rem;
    border-radius: 12px;
    background: var(--bg-secondary);
    color: var(--text-secondary);
    gap: 0.5rem;
    font-size: 0.8125rem;
    transition: all 0.2s;
    border: 1px solid transparent;
  }

  .mobile-nav-item:hover,
  .mobile-nav-item.active {
    color: var(--accent-purple);
    background: rgba(139, 92, 246, 0.1);
    border-color: rgba(139, 92, 246, 0.2);
  }

  .slide-enter-active,
  .slide-leave-active {
    transition: all var(--transition-normal);
  }

  .slide-enter-from,
  .slide-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }

  @media (max-width: 1024px) {
    .nav-menu {
      display: none;
    }
  }

  @media (max-width: 768px) {
    .search-box {
      display: none;
    }

    .mobile-menu-btn {
      display: flex;
    }
  }
</style>
