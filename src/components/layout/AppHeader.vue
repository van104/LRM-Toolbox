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
            :class="['nav-item', { active: activeCategory === cat.id }]"
            @click="handleCategoryClick($event, cat.id)"
          >
            <el-icon :size="18">
              <component :is="iconMap[cat.icon]" />
            </el-icon>
            <span>{{ cat.name }}</span>
            <span class="count-badge">{{ getCategoryCount(cat.id) }}</span>
          </button>
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

        <el-dropdown trigger="click" @command="handleThemeChange">
          <button class="icon-btn">
            <el-icon :size="20">
              <Sunny v-if="themeStore.theme === 'light'" />
              <Moon v-else />
            </el-icon>
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="light">
                <el-icon>
                  <Sunny />
                </el-icon>
                <span>浅色模式</span>
              </el-dropdown-item>
              <el-dropdown-item command="dark">
                <el-icon>
                  <Moon />
                </el-icon>
                <span>深色模式</span>
              </el-dropdown-item>
              <el-dropdown-item command="system">
                <el-icon>
                  <Monitor />
                </el-icon>
                <span>跟随系统</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

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
          <el-icon :size="20">
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
  import { ref } from 'vue';
  import LrmLogo from '@/components/icons/LrmLogo.vue';
  import { useThemeStore } from '@/stores/theme';
  import { useUserStore } from '@/stores/user';
  import { categories, getToolsByCategory } from '@/data/tools';
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

  const themeStore = useThemeStore();
  const userStore = useUserStore();
  const searchKeyword = ref('');
  const mobileMenuOpen = ref(false);

  const navMenuRef = ref(null);
  let isDragging = false;
  let startX = 0;
  let scrollLeft = 0;
  let dragMoved = false;

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

  function handleThemeChange(mode) {
    themeStore.setMode(mode);
  }

  function handleMobileNavClick(categoryId) {
    emit('category-change', categoryId);
    mobileMenuOpen.value = false;
  }

  function getCategoryCount(categoryId) {
    return getToolsByCategory(categoryId).length;
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
    border-bottom: 1px solid var(--border-color);
    background: rgba(255, 255, 255, 0.85);
    /* Fallback/Ensure background */
    backdrop-filter: blur(12px);
    /* Enhance glass effect */
  }

  [data-theme='dark'] .app-header {
    background: rgba(30, 41, 59, 0.85);
  }

  .header-content {
    max-width: 1400px;
    margin: 0 auto;
    height: 100%;
    padding: 0 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .logo-icon {
    color: var(--accent-cyan);
  }

  .logo-text {
    font-size: 1.25rem;
    font-weight: 700;
    background: var(--accent-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .nav-menu {
    display: flex;
    gap: 0.25rem;
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
    padding: 0.5rem 1rem;
    border-radius: var(--radius-md);
    color: var(--text-secondary);
    font-size: 0.875rem;
    white-space: nowrap;
    transition: all var(--transition-fast);
  }

  .nav-item:hover {
    color: var(--text-primary);
    background: var(--bg-primary);
  }

  .nav-item.active {
    color: var(--accent-purple);
    background: rgba(59, 130, 246, 0.1);

    font-weight: 500;
  }

  [data-theme='dark'] .nav-item.active {
    background: rgba(59, 130, 246, 0.15);
  }

  [data-theme='dark'] .nav-item.active {
    background: rgba(59, 130, 246, 0.15);
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
    left: 0;
    right: 0;
    padding: 1rem;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .mobile-nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-radius: var(--radius-md);
    color: var(--text-secondary);
    transition: all var(--transition-fast);
  }

  .mobile-nav-item:hover,
  .mobile-nav-item.active {
    color: var(--accent-purple);
    background: rgba(59, 130, 246, 0.1);
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
