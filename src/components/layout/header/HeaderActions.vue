<template>
  <div class="header-actions">
    <!-- Search Box -->
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

    <!-- Favorites -->
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

    <!-- History -->
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

    <!-- Language Toggle -->
    <button
      class="icon-btn"
      :title="locale === 'zh-CN' ? 'Switch to English' : '切换为中文'"
      @click="toggleLanguage"
    >
      <span class="text-xs font-bold">{{ locale === 'zh-CN' ? 'En' : '中' }}</span>
    </button>

    <!-- Theme Toggle -->
    <button ref="themeBtnRef" class="icon-btn" @click="handleThemeToggle">
      <el-icon :size="20">
        <Sunny v-if="themeStore.theme === 'light'" />
        <Moon v-else />
      </el-icon>
    </button>

    <!-- Mobile Menu Button -->
    <button class="mobile-menu-btn" @click="$emit('toggle-mobile-menu')">
      <el-icon :size="24">
        <Operation />
      </el-icon>
    </button>
  </div>
</template>

<script setup>
  import { ref, nextTick } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useThemeStore } from '@/stores/theme';
  import { useUserStore } from '@/stores/user';
  import { Search, Sunny, Moon, Star, Clock, Operation } from '@element-plus/icons-vue';

  defineProps({
    showSearch: {
      type: Boolean,
      default: true
    }
  });

  defineEmits(['search', 'toggle-mobile-menu']);

  const { t, locale } = useI18n();
  const themeStore = useThemeStore();
  const userStore = useUserStore();
  const searchKeyword = ref('');
  const themeBtnRef = ref(null);

  const toggleLanguage = () => {
    locale.value = locale.value === 'zh-CN' ? 'en' : 'zh-CN';
    localStorage.setItem('locale', locale.value);
  };

  const handleThemeToggle = async event => {
    const isDark = themeStore.theme === 'dark';

    if (!document.startViewTransition) {
      themeStore.setMode(isDark ? 'light' : 'dark');
      return;
    }

    const rect = themeBtnRef.value?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : event.clientX;
    const y = rect ? rect.top + rect.height / 2 : event.clientY;

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    document.documentElement.style.setProperty('--x', `${x}px`);
    document.documentElement.style.setProperty('--y', `${y}px`);
    document.documentElement.style.setProperty('--r', `${endRadius}px`);

    if (isDark) {
      document.documentElement.classList.add('shrink-dark');
    } else {
      document.documentElement.classList.remove('shrink-dark');
    }

    const transition = document.startViewTransition(async () => {
      themeStore.setMode(isDark ? 'light' : 'dark');
      await nextTick();
    });

    transition.finished.finally(() => {
      document.documentElement.classList.remove('shrink-dark');
      document.documentElement.style.removeProperty('--x');
      document.documentElement.style.removeProperty('--y');
      document.documentElement.style.removeProperty('--r');
    });
  };
</script>

<style scoped>
  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
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
    color: #111;
    border: 3px solid transparent;
    background: transparent;
    cursor: pointer;
  }

  [data-theme='dark'] .mobile-menu-btn {
    color: #eee;
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
