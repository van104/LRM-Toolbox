<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">健康<span>.食物升糖(GI)()</span></h1>
      </header>

      <main class="tool-content">
        <div class="search-section pt-4">
          <input
            v-model="searchQuery"
            type="text"
            class="brutal-input search-input"
            placeholder="🔍 搜索食物 (如: 米饭, 西瓜, 牛奶)..."
          />
          <div class="filter-chips">
            <button
              class="brutal-action-btn chip"
              :class="{ active: filter === 'all' }"
              @click="filter = 'all'"
            >
              全部
            </button>
            <button
              class="brutal-action-btn chip chip-low"
              :class="{ active: filter === 'low' }"
              @click="filter = 'low'"
            >
              📉 低 GI (&lt;55)
            </button>
            <button
              class="brutal-action-btn chip chip-med"
              :class="{ active: filter === 'med' }"
              @click="filter = 'med'"
            >
              ➖ 中 GI (56-69)
            </button>
            <button
              class="brutal-action-btn chip chip-high"
              :class="{ active: filter === 'high' }"
              @click="filter = 'high'"
            >
              📈 高 GI (&gt;70)
            </button>
          </div>
        </div>

        <div class="brutal-pane mt-8">
          <div class="pane-header bg-black"><span class="text-white">🍔 食物速查表</span></div>
          <div class="pane-body">
            <div v-if="filteredFoods.length === 0" class="empty-state">
              <h3>[ 未找到匹配数据 ]</h3>
            </div>
            <div v-else class="food-grid">
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
        </div>

        <div class="brutal-info-box mt-8">
          <h3>💡 关于升糖指数 (GI)</h3>
          <p>GI 值反映了食物进入人体后升高血糖的速度。</p>
          <ul class="gi-rules">
            <li>
              <strong class="text-low">● 低 GI (&le;55)</strong>：消化慢，血糖平稳，适合减脂控糖。
            </li>
            <li><strong class="text-med">● 中 GI (56-69)</strong>：介于两者之间，适量为主。</li>
            <li>
              <strong class="text-high">● 高 GI (&ge;70)</strong
              >：消化快，血糖迅速升高，运动后可快速补能。
            </li>
          </ul>
        </div>
      </main>

      <footer class="footer mt-8">© 2026 LRM工具箱 - 健康饮食系列</footer>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';

  interface FoodItem {
    name: string;
    gi: number;
    category: string;
  }

  const searchQuery = ref('');
  const filter = ref<'all' | 'low' | 'med' | 'high'>('all');

  const foods: FoodItem[] = [
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
    { name: '胡萝卜 (煮)', gi: 39, category: '蔬菜' },
    { name: '南瓜', gi: 75, category: '蔬菜' },
    { name: '青豆', gi: 48, category: '蔬菜' },
    { name: '西兰花', gi: 15, category: '蔬菜' },
    { name: '菠菜', gi: 15, category: '蔬菜' },
    { name: '黄瓜', gi: 15, category: '蔬菜' },
    { name: '番茄', gi: 15, category: '蔬菜' },
    { name: '洋葱', gi: 15, category: '蔬菜' },
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
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      list = list.filter(f => f.name.toLowerCase().includes(q));
    }
    if (filter.value === 'low') list = list.filter(f => f.gi <= 55);
    else if (filter.value === 'med') list = list.filter(f => f.gi > 55 && f.gi < 70);
    else if (filter.value === 'high') list = list.filter(f => f.gi >= 70);
    return list.sort((a, b) => a.gi - b.gi);
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
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

  .brutal-wrapper {
    background-color: #fdfae5;
    background-image:
      linear-gradient(#e5e5e5 2px, transparent 2px),
      linear-gradient(90deg, #e5e5e5 2px, transparent 2px);
    background-size: 40px 40px;
    min-height: 100vh;
    padding: 2rem;
    box-sizing: border-box;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    color: #111;
  }
  .brutal-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }

  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.5rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0 #4b7bff;
    flex: 1;
    text-align: center;
  }
  .brutal-title span {
    color: #4b7bff;
    text-shadow: 4px 4px 0 #111;
  }

  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 6px 6px 0 #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }
  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0 #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0 0 0 #111;
  }

  .search-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  .brutal-input {
    width: 100%;
    max-width: 600px;
    padding: 1rem 1.5rem;
    font-size: 1.25rem;
    border: 4px solid #111;
    background: #fff;
    font-weight: bold;
    box-sizing: border-box;
    box-shadow: 6px 6px 0 #111;
    font-family: 'IBM Plex Mono', monospace;
    transition: all 0.1s;
  }
  .brutal-input:focus {
    outline: none;
    box-shadow: 6px 6px 0 #4b7bff;
    border-color: #111;
    transform: translate(-2px, -2px);
  }

  .filter-chips {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  .brutal-action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 4px 4px 0 #111;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
  }
  .brutal-action-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #111;
  }
  .brutal-action-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0 0 0 #111;
  }

  .chip.active {
    background: #111;
    color: white;
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #111;
  }
  .chip-low.active {
    background: #10b981;
  }
  .chip-med.active {
    background: #f59e0b;
  }
  .chip-high.active {
    background: #ff4b4b;
  }

  .brutal-pane {
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0 #111;
    min-height: 400px;
  }
  .pane-header {
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.25rem;
  }
  .bg-black {
    background: #111;
    color: white;
  }
  .pane-body {
    padding: 2rem;
    flex: 1;
  }

  .empty-state {
    text-align: center;
    font-size: 1.5rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 900;
    padding: 4rem;
    opacity: 0.6;
  }
  .food-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .food-card {
    border: 4px solid #111;
    border-radius: 0;
    padding: 1.25rem;
    background: #fff;
    box-shadow: 6px 6px 0 #111;
    transition: transform 0.1s;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .food-card:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0 #111;
  }

  .food-info {
    display: flex;
    flex-direction: column;
  }
  .food-name {
    font-weight: 900;
    font-size: 1.2rem;
  }
  .food-cat {
    font-size: 0.85rem;
    font-weight: bold;
    color: #555;
  }

  .gi-badge {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    border-top: 3px dashed #111;
    padding-top: 0.75rem;
  }
  .gi-val {
    font-size: 2rem;
    font-weight: 900;
    font-family: 'Syne', sans-serif;
    line-height: 1;
  }
  .gi-label {
    font-size: 0.85rem;
    font-weight: 900;
    background: #111;
    color: white;
    padding: 0.2rem 0.5rem;
  }

  .is-low {
    background: #e0faef;
  }
  .is-low .gi-val {
    color: #10b981;
    text-shadow: 2px 2px 0 #111;
  }

  .is-med {
    background: #fef7d9;
  }
  .is-med .gi-val {
    color: #f59e0b;
    text-shadow: 2px 2px 0 #111;
  }

  .is-high {
    background: #ffe4e4;
  }
  .is-high .gi-val {
    color: #ff4b4b;
    text-shadow: 2px 2px 0 #111;
  }

  .brutal-info-box {
    border: 4px dashed #111;
    padding: 2rem;
    background: #fff;
    font-weight: bold;
  }
  .brutal-info-box h3 {
    margin: 0 0 1rem;
    font-size: 1.5rem;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
  }
  .brutal-info-box p {
    margin: 0 0 1rem;
    font-size: 1.1rem;
  }
  .gi-rules {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .text-low {
    color: #10b981;
    font-weight: 900;
  }
  .text-med {
    color: #f59e0b;
    font-weight: 900;
  }
  .text-high {
    color: #ff4b4b;
    font-weight: 900;
  }

  .mt-4 {
    margin-top: 1rem;
  }
  .mt-8 {
    margin-top: 2rem;
  }
  .pt-4 {
    padding-top: 1rem;
  }
  .footer {
    text-align: center;
    font-weight: 900;
  }

  @media (max-width: 900px) {
    .brutal-title {
      font-size: 2.2rem;
    }
    .food-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }
  }

  /* Dark Mode */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .brutal-info-box {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .food-card {
    box-shadow: 6px 6px 0 #eee;
  }

  [data-theme='dark'] .brutal-btn:hover,
  [data-theme='dark'] .brutal-action-btn:hover,
  [data-theme='dark'] .food-card:hover {
    box-shadow: 9px 9px 0 #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0 #eee;
  }
  [data-theme='dark'] .brutal-input:focus {
    box-shadow: 6px 6px 0 #2a4eb2;
    border-color: #2a4eb2;
  }

  [data-theme='dark'] .chip.active {
    background: #eee;
    color: #111;
    border-color: #eee;
    box-shadow: 6px 6px 0 #eee;
  }
  [data-theme='dark'] .chip-low.active {
    background: #10b981;
    color: #fff;
    border-color: #eee;
  }
  [data-theme='dark'] .chip-med.active {
    background: #f59e0b;
    color: #fff;
    border-color: #eee;
  }
  [data-theme='dark'] .chip-high.active {
    background: #ff4b4b;
    color: #fff;
    border-color: #eee;
  }

  [data-theme='dark'] .bg-black {
    background: #222;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .pane-body {
    background: #1a1a1a;
  }

  [data-theme='dark'] .food-card {
    border-color: #eee;
  }
  [data-theme='dark'] .food-cat {
    color: #aaa;
  }
  [data-theme='dark'] .gi-badge {
    border-top-color: #eee;
  }
  [data-theme='dark'] .gi-label {
    background: #eee;
    color: #111;
    border-color: #eee;
  }

  [data-theme='dark'] .is-low {
    background: #003322;
  }
  [data-theme='dark'] .is-low .gi-val {
    color: #10b981;
    text-shadow: 2px 2px 0 #eee;
  }
  [data-theme='dark'] .is-med {
    background: #332200;
  }
  [data-theme='dark'] .is-med .gi-val {
    color: #f59e0b;
    text-shadow: 2px 2px 0 #eee;
  }
  [data-theme='dark'] .is-high {
    background: #330000;
  }
  [data-theme='dark'] .is-high .gi-val {
    color: #ff4b4b;
    text-shadow: 2px 2px 0 #eee;
  }

  [data-theme='dark'] .brutal-info-box {
    background: #222;
    border-color: #eee;
  }
</style>
