<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">煲汤<span>.时长()</span></h1>
        <div style="width: 120px"></div>
      </header>

      <main class="main-content">
        <div class="category-tabs">
          <button
            v-for="cat in categories"
            :key="cat.key"
            class="brutal-action-btn category-btn"
            :class="{ active: activeCategory === cat.key }"
            @click="activeCategory = cat.key"
          >
            {{ cat.label }}
          </button>
        </div>

        <div class="ingredients-grid">
          <div
            v-for="item in currentIngredients"
            :key="item.name"
            class="brutal-pane ingredient-card"
          >
            <div class="card-top bg-yellow">
              <span class="card-icon">{{ item.icon }}</span>
              <h3 class="ingredient-name">{{ item.name }}</h3>
            </div>
            <div class="card-body">
              <div class="time-info">
                <span class="timer-emoji">⏱️</span>
                <span class="time-label">最佳时长:</span>
                <span class="time-val">{{ item.time }}</span>
              </div>
              <p class="tips">ℹ️ {{ item.tips }}</p>
            </div>
          </div>
        </div>

        <div class="brutal-pane info-card">
          <div class="pane-header bg-blue text-white pt-1 pb-1">
            <span>🍲 煲汤小贴士</span>
          </div>
          <div class="pane-body">
            <ul class="brutal-list">
              <li><b>冷水下锅</b>：肉类食材建议冷水下锅，有利于血水排出。</li>
              <li><b>大火烧开</b>：先用大火烧开，撇去浮沫，再转小火慢炖。</li>
              <li><b>后放盐</b>：建议在起锅前 5-10 分钟放盐，过早放盐会使肉质变柴。</li>
              <li><b>中途不加水</b>：确需加水，请加开水。</li>
            </ul>
          </div>
        </div>
      </main>

      <div class="brutal-status">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i">© 2026 LRM工具箱 - 厨房助手系列 // &nbsp;</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';

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
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

  .brutal-wrapper {
    background-color: #fdfae5;
    background-image:
      linear-gradient(#e5e5e5 2px, transparent 2px),
      linear-gradient(90deg, #e5e5e5 2px, transparent 2px);
    background-size: 40px 40px;
    background-position: -2px -2px;
    min-height: 100vh;
    padding: 2rem;
    box-sizing: border-box;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    color: #111;
  }
  .brutal-container {
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #00e572;
  }
  .brutal-title span {
    color: #00e572;
    text-shadow: 4px 4px 0px #111;
    letter-spacing: 0;
  }

  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
    color: #111;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }

  .bg-yellow {
    background: #ffd900;
    color: #111;
  }
  .bg-blue {
    background: #4b7bff;
    color: #fff;
  }

  .brutal-pane {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    transition: transform 0.2s;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
  }
  .pane-body {
    padding: 1.5rem;
  }

  .main-content {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }

  .category-tabs {
    display: flex;
    gap: 1rem;
    overflow-x: auto;
    padding-bottom: 1rem;
  }
  .brutal-action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.6rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
    white-space: nowrap;
  }
  .brutal-action-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
    background: #fdfae5;
  }
  .brutal-action-btn.active {
    background: #4b7bff;
    color: #fff;
    box-shadow:
      inset 4px 4px 0px rgba(0, 0, 0, 0.2),
      0px 0px 0px #111;
    transform: translate(4px, 4px);
  }

  .ingredients-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .ingredient-card {
    cursor: default;
  }
  .ingredient-card:hover {
    transform: translate(-4px, -4px);
    box-shadow: 12px 12px 0px #111;
  }
  .card-top {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.25rem;
    border-bottom: 4px solid #111;
  }
  .card-icon {
    font-size: 2rem;
    border: 2px solid #111;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    box-shadow: 2px 2px 0px #111;
  }
  .ingredient-name {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.4rem;
    font-weight: 800;
    margin: 0;
  }

  .card-body {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    background: #fff;
  }
  .time-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-size: 1.05rem;
  }
  .time-label {
    font-weight: 700;
    color: #555;
  }
  .time-val {
    font-weight: 800;
    color: #ff4b4b;
    font-size: 1.15rem;
  }

  .tips {
    font-size: 0.9rem;
    color: #333;
    font-weight: 600;
    line-height: 1.5;
    margin: 0;
    padding: 0.75rem;
    border: 2px dashed #111;
    background: #fdfae5;
  }

  .brutal-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .brutal-list li {
    font-size: 0.95rem;
    color: #111;
    position: relative;
    padding-left: 1.5rem;
    line-height: 1.6;
    font-weight: 600;
  }
  .brutal-list li::before {
    content: '▪';
    position: absolute;
    left: 0;
    color: #ff4b4b;
    font-weight: 900;
    font-size: 1.2rem;
  }

  .brutal-status {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    padding: 1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.2rem;
    overflow: hidden;
    text-transform: uppercase;
    margin-top: 2rem;
  }
  .marquee-wrapper {
    width: 100%;
    overflow: hidden;
  }
  .marquee-content {
    display: inline-block;
    white-space: nowrap;
    animation: marquee 20s linear infinite;
  }
  @keyframes marquee {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  @media (max-width: 768px) {
    .brutal-header {
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }
    .brutal-title {
      font-size: 2rem;
    }
    .ingredients-grid {
      grid-template-columns: 1fr;
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
  [data-theme='dark'] .brutal-status,
  [data-theme='dark'] .brutal-action-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 9px 9px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .brutal-action-btn {
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:hover {
    box-shadow: 6px 6px 0px #eee;
    background: #222;
  }
  [data-theme='dark'] .brutal-action-btn.active {
    background: #2a4eb2;
    color: #fff;
    box-shadow:
      inset 4px 4px 0px rgba(0, 0, 0, 0.5),
      0px 0px 0px #eee;
  }

  [data-theme='dark'] .brutal-pane {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .ingredient-card:hover {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .pane-header,
  [data-theme='dark'] .card-top {
    border-bottom-color: #eee;
  }

  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #111;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }

  [data-theme='dark'] .card-body {
    background: #1a1a1a;
  }
  [data-theme='dark'] .card-icon {
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
    background: #222;
  }
  [data-theme='dark'] .time-label {
    color: #aaa;
  }
  [data-theme='dark'] .time-val {
    color: #ff9fb2;
  }
  [data-theme='dark'] .tips {
    background: #222;
    border-color: #eee;
    color: #ccc;
  }
  [data-theme='dark'] .brutal-list li {
    color: #ccc;
  }
  [data-theme='dark'] .brutal-list li::before {
    color: #cc0000;
  }

  [data-theme='dark'] .brutal-status {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
</style>
