<template>
  <div class="tool-container">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>食物升糖指数 (GI) 速查</h1>
        <span class="nav-subtitle">Glycemic Index Lookup</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="search-section">
        <div class="search-bar">
          <el-icon class="search-icon"><Search /></el-icon>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索食物 (如: 米饭, 西瓜, 牛奶)..."
            class="search-input"
          />
        </div>

        <div class="filter-chips">
          <button :class="{ active: filter === 'all' }" @click="filter = 'all'">全部</button>
          <button :class="{ active: filter === 'low' }" class="chip-low" @click="filter = 'low'">
            低 GI (&lt;55)
          </button>
          <button :class="{ active: filter === 'med' }" class="chip-med" @click="filter = 'med'">
            中 GI (56-69)
          </button>
          <button :class="{ active: filter === 'high' }" class="chip-high" @click="filter = 'high'">
            高 GI (&gt;70)
          </button>
        </div>
      </div>

      <div class="food-list-container glass-card">
        <div v-if="filteredFoods.length === 0" class="empty-state">未找到匹配的食物</div>

        <div class="food-grid">
          <div
            v-for="food in filteredFoods"
            :key="food.name"
            class="food-card"
            :class="getGiClass(food.gi)"
          >
            <div class="food-info">
              <span class="food-name">{{ food.name }}</span>
              <span class="food-cat">{{ food.category }}</span>
            </div>
            <div class="gi-badge">
              <span class="gi-val">{{ food.gi }}</span>
              <span class="gi-label">{{ getGiLabel(food.gi) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="info-card">
        <h3>💡 关于升糖指数 (GI)</h3>
        <p>
          GI 值反映了食物进入人体后升高血糖的速度。
          <br />
          <span class="text-low">● 低 GI (&le;55)</span>：消化慢，血糖平稳，适合减脂控糖。
          <br />
          <span class="text-med">● 中 GI (56-69)</span>：介于两者之间。
          <br />
          <span class="text-high">● 高 GI (&ge;70)</span>：消化快，血糖迅速升高，运动后可快速补能。
        </p>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 健康饮食系列</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { Back, Search } from '@element-plus/icons-vue';

  interface FoodItem {
    name: string;
    gi: number;
    category: string;
  }

  const searchQuery = ref('');
  const filter = ref<'all' | 'low' | 'med' | 'high'>('all');

  // Common food GI database
  const foods: FoodItem[] = [
    // Staples
    { name: '白米饭', gi: 83, category: '主食' },
    { name: '糙米饭', gi: 68, category: '主食' },
    { name: '糯米饭', gi: 87, category: '主食' },
    { name: '白馒头', gi: 88, category: '主食' },
    { name: '全麦面包', gi: 69, category: '主食' },
    { name: '白面包', gi: 75, category: '主食' },
    { name: '面条 (小麦)', gi: 55, category: '主食' },
    { name: '意大利面', gi: 49, category: '主食' },
    { name: '红薯 (煮)', gi: 54, category: '主食' },
    { name: '土豆 (烤)', gi: 85, category: '主食' },
    { name: '土豆 (煮)', gi: 66, category: '主食' },
    { name: '燕麦片', gi: 55, category: '主食' },
    { name: '玉米', gi: 55, category: '主食' },
    { name: '小米粥', gi: 62, category: '主食' },

    // Fruits
    { name: '西瓜', gi: 72, category: '水果' },
    { name: '菠萝', gi: 66, category: '水果' },
    { name: '葡萄', gi: 43, category: '水果' },
    { name: '香蕉 (熟)', gi: 52, category: '水果' },
    { name: '苹果', gi: 36, category: '水果' },
    { name: '梨', gi: 32, category: '水果' },
    { name: '桃子', gi: 28, category: '水果' },
    { name: '橙子', gi: 43, category: '水果' },
    { name: '柚子', gi: 25, category: '水果' },
    { name: '猕猴桃', gi: 52, category: '水果' },
    { name: '樱桃', gi: 22, category: '水果' },
    { name: '草莓', gi: 40, category: '水果' },
    { name: '芒果', gi: 51, category: '水果' },

    // Vegetables
    { name: '胡萝卜 (煮)', gi: 39, category: '蔬菜' },
    { name: '南瓜', gi: 75, category: '蔬菜' },
    { name: '青豆', gi: 48, category: '蔬菜' },
    { name: '西兰花', gi: 15, category: '蔬菜' },
    { name: '菠菜', gi: 15, category: '蔬菜' },
    { name: '黄瓜', gi: 15, category: '蔬菜' },
    { name: '番茄', gi: 15, category: '蔬菜' },
    { name: '洋葱', gi: 15, category: '蔬菜' },

    // Dairy & Others
    { name: '牛奶 (全脂)', gi: 27, category: '奶类' },
    { name: '酸奶', gi: 36, category: '奶类' },
    { name: '豆浆', gi: 30, category: '豆制品' },
    { name: '豆腐', gi: 15, category: '豆制品' },
    { name: '花生', gi: 14, category: '坚果' },
    { name: '腰果', gi: 22, category: '坚果' },
    { name: '蜂蜜', gi: 61, category: '糖类' },
    { name: '白糖', gi: 65, category: '糖类' },
    { name: '巧克力', gi: 49, category: '零食' },
    { name: '可乐', gi: 65, category: '饮料' }
  ];

  const filteredFoods = computed(() => {
    let list = foods;

    // Apply Search
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      list = list.filter(f => f.name.toLowerCase().includes(q));
    }

    // Apply Filter
    if (filter.value === 'low') {
      list = list.filter(f => f.gi <= 55);
    } else if (filter.value === 'med') {
      list = list.filter(f => f.gi > 55 && f.gi < 70);
    } else if (filter.value === 'high') {
      list = list.filter(f => f.gi >= 70);
    }

    // Sort by GI desc by default if no search, else by relevance (kept simple here)
    return list.sort((a, b) => a.gi - b.gi); // Sort Low to High usually better for diet
  });

  const getGiClass = (gi: number) => {
    if (gi <= 55) return 'is-low';
    if (gi < 70) return 'is-med';
    return 'is-high';
  };

  const getGiLabel = (gi: number) => {
    if (gi <= 55) return '低';
    if (gi < 70) return '中';
    return '高';
  };
</script>

<style scoped>
  .tool-container {
    min-height: 100vh;
    background: #f8fafc;
    font-family: 'Inter', system-ui, sans-serif;
    color: #334155;
  }

  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    padding: 1rem 1.5rem;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    color: #64748b;
    width: 80px;
  }

  .nav-center {
    flex: 1;
    text-align: center;
  }

  .nav-center h1 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .nav-subtitle {
    font-size: 0.8rem;
    color: #64748b;
  }

  .nav-spacer {
    width: 80px;
  }

  .main-content {
    max-width: 800px;
    margin: 2rem auto;
    padding: 0 1.5rem;
  }

  .search-section {
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .search-bar {
    position: relative;
    width: 100%;
    max-width: 500px;
  }

  .search-input {
    width: 100%;
    padding: 1rem 1rem 1rem 3rem;
    border: 1px solid #e2e8f0;
    border-radius: 99px;
    font-size: 1rem;
    outline: none;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
    transition: all 0.2s;
  }

  .search-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
  }

  .search-icon {
    position: absolute;
    left: 1.2rem;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    font-size: 1.2rem;
  }

  .filter-chips {
    display: flex;
    gap: 0.8rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .filter-chips button {
    padding: 0.5rem 1.2rem;
    border-radius: 99px;
    border: 1px solid #cbd5e1;
    background: white;
    color: #64748b;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
  }

  .filter-chips button:hover {
    background: #f1f5f9;
  }

  .filter-chips button.active {
    background: #334155;
    color: white;
    border-color: #334155;
  }

  .filter-chips button.chip-low.active {
    background: #10b981;
    border-color: #10b981;
  }

  .filter-chips button.chip-med.active {
    background: #f59e0b;
    border-color: #f59e0b;
  }

  .filter-chips button.chip-high.active {
    background: #ef4444;
    border-color: #ef4444;
  }

  .glass-card {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    min-height: 400px;
  }

  .empty-state {
    text-align: center;
    color: #94a3b8;
    padding: 4rem 0;
    font-size: 1.1rem;
  }

  .food-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }

  .food-card {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 0.8rem;
    transition: transform 0.2s;
  }

  .food-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  }

  .food-info {
    display: flex;
    flex-direction: column;
  }

  .food-name {
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 0.2rem;
  }

  .food-cat {
    font-size: 0.8rem;
    color: #94a3b8;
  }

  .gi-badge {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 0.5rem;
    border-top: 1px dashed #e2e8f0;
  }

  .gi-val {
    font-size: 1.4rem;
    font-weight: 700;
    color: #334155;
  }

  .gi-label {
    font-size: 0.8rem;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 600;
  }

  /* Color Coding */
  .food-card.is-low .gi-val {
    color: #10b981;
  }
  .food-card.is-low .gi-label {
    background: #d1fae5;
    color: #047857;
  }

  .food-card.is-med .gi-val {
    color: #f59e0b;
  }
  .food-card.is-med .gi-label {
    background: #fef3c7;
    color: #b45309;
  }

  .food-card.is-high .gi-val {
    color: #ef4444;
  }
  .food-card.is-high .gi-label {
    background: #fee2e2;
    color: #b91c1c;
  }

  .info-card {
    margin-top: 2rem;
    padding: 1.5rem;
    background: #f1f5f9;
    border-radius: 12px;
    color: #475569;
    line-height: 1.6;
    font-size: 0.9rem;
  }

  .info-card h3 {
    margin-top: 0;
    margin-bottom: 0.8rem;
    color: #334155;
  }

  .text-low {
    color: #10b981;
    font-weight: 600;
  }
  .text-med {
    color: #f59e0b;
    font-weight: 600;
  }
  .text-high {
    color: #ef4444;
    font-weight: 600;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #94a3b8;
    font-size: 0.875rem;
  }
</style>
