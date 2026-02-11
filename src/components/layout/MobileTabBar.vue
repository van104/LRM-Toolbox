<template>
  <div class="mobile-layout-container">
    <!-- Bottom Tab Bar -->
    <nav class="mobile-tab-bar">
      <router-link to="/" class="tab-item" :class="{ active: isHome && !showCategoryDrawer }">
        <el-icon><HomeFilled /></el-icon>
        <span class="tab-label">首页</span>
      </router-link>

      <div
        class="tab-item"
        :class="{ active: showCategoryDrawer }"
        @click="showCategoryDrawer = true"
      >
        <el-icon><Menu /></el-icon>
        <span class="tab-label">分类</span>
      </div>

      <router-link to="/about" class="tab-item" active-class="active">
        <el-icon><User /></el-icon>
        <span class="tab-label">关于</span>
      </router-link>
    </nav>

    <!-- Category Drawer -->
    <el-drawer
      v-model="showCategoryDrawer"
      direction="btt"
      size="60%"
      :with-header="false"
      class="mobile-category-drawer"
    >
      <div class="drawer-content">
        <h3 class="drawer-title">全部分类</h3>
        <div class="category-grid">
          <div
            class="category-card"
            :class="{ active: currentCategory === 'all' }"
            @click="selectCategory('all')"
          >
            <el-icon class="cat-icon"><Grid /></el-icon>
            <span class="cat-name">全部工具</span>
          </div>

          <div
            v-for="cat in categories"
            :key="cat.id"
            class="category-card"
            :class="{ active: currentCategory === cat.id }"
            @click="selectCategory(cat.id)"
          >
            <el-icon class="cat-icon">
              <component :is="cat.icon" />
            </el-icon>
            <span class="cat-name">{{ cat.name }}</span>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { HomeFilled, Menu, User, Grid } from '@element-plus/icons-vue';
  import { categories } from '@/data/tools';

  const route = useRoute();
  const router = useRouter();
  const showCategoryDrawer = ref(false);

  const isHome = computed(() => route.path === '/');
  const currentCategory = computed(() => route.query.category || 'all');

  const selectCategory = (id: string) => {
    router.push({ path: '/', query: { category: id === 'all' ? undefined : id } });
    showCategoryDrawer.value = false;
  };
</script>

<style scoped>
  .mobile-layout-container {
    display: none; /* Hide via CSS, will show in media query */
  }

  .mobile-tab-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: calc(56px + env(safe-area-inset-bottom));
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-top: 1px solid var(--border-color);
    z-index: 1000;
    display: flex;
    justify-content: space-around;
    padding-bottom: env(safe-area-inset-bottom);
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
  }

  .dark .mobile-tab-bar {
    background: rgba(30, 30, 30, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--text-tertiary);
    text-decoration: none;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
  }

  .tab-item .el-icon {
    font-size: 22px;
    margin-bottom: 2px;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .tab-label {
    font-size: 10px;
    font-weight: 500;
  }

  .tab-item.active {
    color: var(--primary-color);
  }

  .tab-item.active .el-icon {
    transform: translateY(-2px);
  }

  /* Drawer Styles */
  .drawer-content {
    padding: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .drawer-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
    color: var(--text-primary);
    text-align: center;
  }

  .category-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    overflow-y: auto;
    padding-bottom: 20px;
  }

  .category-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: var(--bg-secondary);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid transparent;
  }

  .category-card:active {
    transform: scale(0.96);
  }

  .category-card.active {
    background: var(--primary-color-light);
    color: var(--primary-color);
    border-color: var(--primary-color);
  }

  .cat-icon {
    font-size: 24px;
    margin-bottom: 8px;
  }

  .cat-name {
    font-size: 12px;
    font-weight: 500;
  }

  @media (max-width: 768px) {
    .mobile-layout-container {
      display: block;
    }
  }
</style>
