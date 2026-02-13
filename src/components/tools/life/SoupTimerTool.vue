<template>
  <div class="tool-container">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>煲汤时长计算器</h1>
        <span class="nav-subtitle">Soup Cooking Timer Guide</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="category-tabs">
        <button
          v-for="cat in categories"
          :key="cat.key"
          :class="{ active: activeCategory === cat.key }"
          @click="activeCategory = cat.key"
        >
          {{ cat.label }}
        </button>
      </div>

      <div class="ingredients-grid">
        <div v-for="item in currentIngredients" :key="item.name" class="ingredient-card">
          <div class="card-icon">{{ item.icon }}</div>
          <div class="card-content">
            <h3>{{ item.name }}</h3>
            <div class="time-info">
              <el-icon><Timer /></el-icon>
              <span
                >最佳时长: <b>{{ item.time }}</b></span
              >
            </div>
            <p class="tips">{{ item.tips }}</p>
          </div>
        </div>
      </div>

      <div class="info-card">
        <h3>🍲 煲汤小贴士</h3>
        <p>1. <strong>冷水下锅</strong>：肉类食材建议冷水下锅，有利于血水排出。</p>
        <p>2. <strong>大火烧开</strong>：先用大火烧开，撇去浮沫，再转小火慢炖。</p>
        <p>3. <strong>后放盐</strong>：建议在起锅前 5-10 分钟放盐，过早放盐会使肉质变柴。</p>
        <p>4. <strong>中途不加水</strong>：确需加水，请加开水。</p>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 厨房助手系列</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { Back, Timer } from '@element-plus/icons-vue';

  interface Ingredient {
    name: string;
    time: string;
    tips: string;
    icon: string;
  }

  const activeCategory = ref('meat');

  const categories = [
    { key: 'meat', label: '肉类 (Meat)' },
    { key: 'bone', label: '骨头 (Bone)' },
    { key: 'mushroom', label: '菌菇 (Mushroom)' },
    { key: 'veg', label: '素菜 (Veg)' }
  ];

  const data: Record<string, Ingredient[]> = {
    meat: [
      {
        name: '鸡肉 (全鸡)',
        time: '1.5 - 2 小时',
        tips: '老母鸡可适当延长至 2.5-3 小时，肉质更酥烂。',
        icon: '🐔'
      },
      {
        name: '鸡肉 (切块)',
        time: '1 - 1.5 小时',
        tips: '切块后易熟，时间过长肉质会变柴。',
        icon: '🍗'
      },
      {
        name: '鸭肉',
        time: '1.5 - 2 小时',
        tips: '老鸭汤建议炖足 2 小时以上，汤味更浓。',
        icon: '🦆'
      },
      { name: '瘦肉', time: '45 - 60 分钟', tips: '建议切大块或整块同煮，保持肉汁。', icon: '🥩' },
      { name: '鸽子', time: '1.5 - 2 小时', tips: '滋补良品，小火慢炖锁住营养。', icon: '🐦' }
    ],
    bone: [
      {
        name: '猪筒骨',
        time: '2 - 3 小时',
        tips: '骨髓丰富，建议中途加点醋促进钙质析出。',
        icon: '🍖'
      },
      {
        name: '排骨',
        time: '1 - 1.5 小时',
        tips: '排骨肉嫩，时间过长肉会脱骨影响口感。',
        icon: '🦴'
      },
      {
        name: '牛骨',
        time: '3 - 4 小时',
        tips: '牛骨质地坚硬，需要长时间熬煮才能出味。',
        icon: '🐂'
      },
      { name: '鱼头/鱼骨', time: '30 - 45 分钟', tips: '先煎后煮，大火滚汤至奶白色。', icon: '🐟' }
    ],
    mushroom: [
      { name: '干香菇', time: '60 分钟', tips: '需提前泡发，与肉类同炖增加香气。', icon: '🍄' },
      { name: '鲜菌菇', time: '15 - 20 分钟', tips: '容易煮烂，建议出锅前加入。', icon: '🍄' },
      { name: '茶树菇', time: '1 - 1.5 小时', tips: '耐煮，无论干鲜都适合久炖。', icon: '🌿' },
      { name: '银耳', time: '30 - 50 分钟', tips: '根据需要的胶质程度调整时间。', icon: '🥣' }
    ],
    veg: [
      { name: '萝卜', time: '20 - 30 分钟', tips: '切块大小影响时间，软烂即可。', icon: '🥕' },
      { name: '冬瓜', time: '15 - 20 分钟', tips: '易熟，最后放入，煮至透明即可。', icon: '🥒' },
      { name: '玉米', time: '40 - 60 分钟', tips: '耐煮，可与肉类一同下锅。', icon: '🌽' },
      { name: '山药', time: '15 - 20 分钟', tips: '久煮易化，建议出锅前加入。', icon: '🍠' },
      {
        name: '莲藕',
        time: '1 - 1.5 小时',
        tips: '粉藕需久煮，脆藕适合快炒不适合煲汤。',
        icon: '🌸'
      }
    ]
  };

  const currentIngredients = computed(() => data[activeCategory.value] || []);
</script>

<style scoped>
  .tool-container {
    min-height: 100vh;
    background: #fdfbf7;
    font-family: 'Inter', system-ui, sans-serif;
    color: #4a4a4a;
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
    color: #8b5e3c;
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
    color: #5d4037;
  }

  .nav-subtitle {
    font-size: 0.8rem;
    color: #a1887f;
  }

  .nav-spacer {
    width: 80px;
  }

  .main-content {
    max-width: 800px;
    margin: 2rem auto;
    padding: 0 1.5rem;
  }

  .category-tabs {
    display: flex;
    gap: 0.8rem;
    margin-bottom: 2rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }

  .category-tabs button {
    padding: 0.6rem 1.2rem;
    border-radius: 99px;
    border: 1px solid #d7ccc8;
    background: white;
    color: #795548;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;
    font-weight: 500;
  }

  .category-tabs button.active {
    background: #8d6e63;
    color: white;
    border-color: #8d6e63;
    box-shadow: 0 2px 8px rgba(141, 110, 99, 0.3);
  }

  .ingredients-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .ingredient-card {
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    display: flex;
    gap: 1.2rem;
    border: 1px solid #efebe9;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
    transition: transform 0.2s;
  }

  .ingredient-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px -3px rgba(0, 0, 0, 0.05);
  }

  .card-icon {
    font-size: 2.5rem;
    background: #fff8f6;
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
  }

  .card-content {
    flex: 1;
  }

  .card-content h3 {
    margin: 0 0 0.5rem 0;
    color: #3e2723;
    font-size: 1.1rem;
  }

  .time-info {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: #d84315;
    font-size: 0.95rem;
    margin-bottom: 0.6rem;
  }

  .tips {
    margin: 0;
    font-size: 0.85rem;
    color: #8d6e63;
    line-height: 1.5;
  }

  .info-card {
    margin-top: 3rem;
    padding: 2rem;
    background: white;
    border-radius: 16px;
    border: 1px dashed #d7ccc8;
    color: #5d4037;
  }

  .info-card h3 {
    margin-top: 0;
    color: #3e2723;
  }

  .info-card p {
    margin: 0.5rem 0;
    font-size: 0.95rem;
    line-height: 1.6;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #bcaaa4;
    font-size: 0.875rem;
  }
</style>
