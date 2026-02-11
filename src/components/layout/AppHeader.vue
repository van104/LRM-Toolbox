```
<template>
  <header class="app-header glass">
    <div class="header-content">
      <router-link to="/" class="logo" title="返回首页">
        <LrmLogo :size="32" />
        <span class="logo-text font-display">LRM工具箱</span>
      </router-link>

      <el-tooltip
        content="按住鼠标左键可左右拖动"
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
            <span>{{ cat.name }}</span>
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
            placeholder="搜索工具..."
            @input="$emit('search', searchKeyword)"
          />
        </div>

        <button class="icon-btn" title="我的收藏" @click="$router.push('/favorites')">
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

        <button class="icon-btn" title="历史记录" @click="$router.push('/history')">
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
          <span>{{ cat.name }}</span>
          <span class="count-badge mobile">{{ getCategoryCount(cat.id) }}</span>
        </button>
      </div>
    </Transition>
  </header>
</template>

<script setup>
  import { ref, onMounted, watch } from 'vue';
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

  const themeStore = useThemeStore();
  const userStore = useUserStore();
  const searchKeyword = ref('');
  const mobileMenuOpen = ref(false);

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

    const endRadius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    const transition = document.startViewTransition(() => {
      themeStore.setMode(isDark ? 'light' : 'dark');
      // 给 html 加上标记类，方便 CSS 控制层级
      if (isDark) {
        document.documentElement.classList.add('theme-transition-recede');
      }
    });

    transition.finished.finally(() => {
      document.documentElement.classList.remove('theme-transition-recede');
    });

    transition.ready.then(() => {
      const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`];

      document.documentElement.animate(
        {
          clipPath: isDark ? [...clipPath].reverse() : clipPath
        },
        {
          duration: 600,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: isDark ? '::view-transition-old(root)' : '::view-transition-new(root)'
        }
      );
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
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(20px) saturate(180%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.03);
    transition: all 0.3s ease;
  }

  [data-theme='dark'] .app-header {
    background: rgba(15, 23, 42, 0.7);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
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
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .logo:hover {
    transform: scale(1.05);
    filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.3));
  }

  .logo-text {
    font-size: 1.35rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    background: var(--accent-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .nav-menu {
    display: flex;
    gap: 0.5rem;
    padding: 0.25rem;
    background: rgba(0, 0, 0, 0.03);
    border-radius: 12px;
    position: relative;
    overflow-x: auto;
    scrollbar-width: none;
    cursor: grab;
    user-select: none;
  }

  [data-theme='dark'] .nav-menu {
    background: rgba(255, 255, 255, 0.05);
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
    border-radius: 10px;
    color: var(--text-secondary);
    font-size: 0.9375rem;
    font-weight: 500;
    white-space: nowrap;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    z-index: 1;
    border: none;
    background: transparent;
  }

  .nav-item:hover {
    color: var(--text-primary);
  }

  .nav-item.active {
    color: var(--accent-purple);
  }

  .nav-indicator {
    position: absolute;
    bottom: 4px;
    top: 4px;
    height: auto;
    border-radius: 8px;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    z-index: 0;
    opacity: 0;
  }

  [data-theme='dark'] .nav-indicator {
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .count-badge {
    font-size: 0.75rem;
    background: rgba(0, 0, 0, 0.05);
    padding: 0 6px;
    border-radius: 99px;
    color: var(--text-muted);
    transition: all 0.2s;
  }

  .nav-item:hover .count-badge,
  .nav-item.active .count-badge {
    background: rgba(255, 255, 255, 0.5);
    color: currentColor;
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
    border-radius: var(--radius-md);
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    transition: all var(--transition-fast);
  }

  .search-box:focus-within {
    border-color: var(--accent-purple);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }

  .search-box input {
    border: none;
    background: none;
    outline: none;
    font-size: 0.875rem;
    color: var(--text-primary);
    width: 140px;
  }

  .search-box input::placeholder {
    color: var(--text-muted);
  }

  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    color: var(--text-secondary);
    transition: all var(--transition-fast);
    position: relative;
    background: transparent;
    border: 1px solid transparent;
  }

  .icon-btn:hover {
    color: var(--accent-purple);
    background: var(--bg-primary);
    border-color: var(--border-color);
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

  .count-badge {
    font-size: 0.75rem;
    background: rgba(0, 0, 0, 0.05);
    padding: 0 6px;
    border-radius: 99px;
    color: var(--text-muted);
    transition: all 0.2s;
  }

  .nav-item:hover .count-badge,
  .nav-item.active .count-badge {
    background: rgba(255, 255, 255, 0.5);
    color: currentColor;
  }

  .count-badge.mobile {
    margin-left: auto;
  }
</style>
