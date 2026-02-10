<template>
  <div class="waste-classifier">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>垃圾分类助手</h1>
        <span class="nav-subtitle">Waste Classifier</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <div class="tool-container">
      <div class="search-section card">
        <el-input
          v-model="searchQuery"
          placeholder="搜索垃圾名称，如：电池、剩菜、纸箱..."
          size="large"
          class="search-input"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>

        <div v-if="searchResult.length > 0" class="search-results">
          <div
            v-for="item in searchResult"
            :key="item.name"
            class="result-item"
            @click="showDetail(item)"
          >
            <span class="item-name">{{ item.name }}</span>
            <el-tag :type="getCategoryType(item.category)" effect="dark">
              {{ item.category }}
            </el-tag>
          </div>
        </div>
        <div v-else-if="searchQuery" class="no-result">
          <el-empty description="未找到相关结果，试试换个词？" />
        </div>
      </div>

      <div class="categories-grid">
        <div
          v-for="cat in categories"
          :key="cat.name"
          class="category-card"
          :style="{ '--color': cat.color }"
        >
          <div class="category-header">
            <div class="category-icon" :style="{ backgroundColor: cat.color }">
              <el-icon v-if="cat.name === '可回收物'" size="24" color="#fff">
                <Grid />
              </el-icon>
              <el-icon v-else-if="cat.name === '厨余垃圾'" size="24" color="#fff">
                <Bowl />
              </el-icon>
              <el-icon v-else-if="cat.name === '有害垃圾'" size="24" color="#fff">
                <Warning />
              </el-icon>
              <el-icon v-else size="24" color="#fff">
                <Delete />
              </el-icon>
            </div>
            <div class="category-info">
              <div class="category-name">{{ cat.name }}</div>
              <div class="category-en">{{ cat.en }}</div>
            </div>
          </div>
          <div class="category-desc">{{ cat.desc }}</div>
          <div class="requirements">
            <div class="req-title">投放要求：</div>
            <ul>
              <li v-for="(req, i) in cat.requirements" :key="i">{{ req }}</li>
            </ul>
          </div>
          <div class="examples">
            <el-tag v-for="ex in cat.examples" :key="ex" size="small" class="example-tag">
              {{ ex }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>

    <div class="experimental-section card">
      <div class="exp-header">
        <el-icon color="#E6A23C">
          <Opportunity />
        </el-icon>
        <span>实验性功能</span>
      </div>
      <div class="exp-content">
        <el-button type="primary" plain disabled>
          <el-icon>
            <Picture />
          </el-icon>
          拍照识别 (开发中)
        </el-button>
        <el-button type="success" plain disabled>
          <el-icon>
            <Microphone />
          </el-icon>
          语音查询 (开发中)
        </el-button>
        <p class="exp-tip">提示：识别功能涉及 AI 接口调用，目前处于内部测试阶段，敬请期待。</p>
      </div>
    </div>
    <footer class="footer">© 2026 LRM工具箱 - 垃圾分类助手</footer>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import {
    Back,
    Search,
    Opportunity,
    Picture,
    Microphone,
    Delete,
    Bowl,
    Warning,
    Grid
  } from '@element-plus/icons-vue';
  import { wasteCategories, searchWaste, getCategoryTagType } from '@/data/wasteData';

  const searchQuery = ref('');
  const searchResult = ref([]);

  const categories = wasteCategories;

  const handleSearch = () => {
    if (!searchQuery.value) {
      searchResult.value = [];
      return;
    }
    searchResult.value = searchWaste(searchQuery.value);
  };

  const getCategoryType = getCategoryTagType;
</script>

<style scoped>
  .waste-classifier {
    min-height: 100vh;
    background: var(--el-bg-color-page);
    display: flex;
    flex-direction: column;
  }

  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color-lighter);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
  }

  .nav-back,
  .nav-spacer {
    width: 80px;
  }

  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: var(--el-text-color-regular);
    cursor: pointer;
    font-size: 0.9rem;
    padding: 0.5rem 0;
    transition: color 0.2s;
  }

  .nav-back:hover {
    color: var(--el-color-primary);
  }

  .nav-center {
    text-align: center;
  }

  .nav-center h1 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
    color: var(--el-text-color-primary);
  }

  .nav-subtitle {
    font-size: 0.7rem;
    color: var(--el-text-color-secondary);
    text-transform: uppercase;
    display: block;
    margin-top: 2px;
  }

  .tool-container {
    padding: 24px;
    flex: 1;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .card {
    background: var(--el-bg-color);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    margin-bottom: 24px;
  }

  .search-section {
    position: relative;
  }

  .search-input {
    margin-bottom: 16px;
  }

  .search-results {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
  }

  .result-item {
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: background 0.2s;
  }

  .result-item:hover {
    background: var(--el-fill-color-light);
  }

  .item-name {
    font-weight: 500;
  }

  .categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    margin-bottom: 24px;
  }

  .category-card {
    background: var(--el-bg-color);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    border-top: 5px solid var(--color);
    transition: transform 0.3s;
  }

  .category-card:hover {
    transform: translateY(-5px);
  }

  .category-header {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
  }

  .category-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }

  .category-name {
    font-size: 18px;
    font-weight: 600;
    color: var(--color);
  }

  .category-en {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    text-transform: uppercase;
  }

  .category-desc {
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 16px;
  }

  .req-title {
    font-weight: 600;
    margin-bottom: 8px;
    font-size: 14px;
  }

  .requirements {
    margin-bottom: 16px;
  }

  .requirements ul {
    padding-left: 18px;
    margin: 0;
    font-size: 13px;
    color: var(--el-text-color-regular);
  }

  .requirements li {
    margin-bottom: 4px;
  }

  .examples {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .example-tag {
    background-color: var(--el-fill-color-light);
    border: none;
    color: var(--el-text-color-regular);
  }

  .experimental-section {
    border-left: 4px solid #e6a23c;
  }

  .exp-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    margin-bottom: 16px;
  }

  .exp-content {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
  }

  .exp-tip {
    width: 100%;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 8px;
  }

  @media (max-width: 768px) {
    .categories-grid {
      grid-template-columns: 1fr;
    }
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: var(--el-text-color-secondary);
    font-size: 0.85rem;
    border-top: 1px solid var(--el-border-color-lighter);
    background: var(--el-bg-color);
  }
</style>
