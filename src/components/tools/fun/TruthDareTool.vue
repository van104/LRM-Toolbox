<template>
  <div class="truth-dare-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>真心话大冒险</h1>
        <span class="nav-subtitle">Truth or Dare</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="glass-card tool-layout">
        <section class="category-tabs">
          <button
            v-for="cat in categories"
            :key="cat.id"
            :class="{ active: currentCategory === cat.id }"
            @click="currentCategory = cat.id"
          >
            <el-icon><component :is="cat.icon" /></el-icon>
            {{ cat.name }}
          </button>
        </section>

        <div class="card-display" :class="{ shake: isRolling }">
          <div class="main-card" :class="currentType">
            <div class="card-inner">
              <div v-if="!currentQuestion" class="card-placeholder">
                <el-icon class="mystery-icon"><QuestionFilled /></el-icon>
                <p>准备好了吗？点击下方按钮开始</p>
              </div>
              <div v-else class="card-content">
                <span class="type-badge">{{ currentType === 'truth' ? '真心话' : '大冒险' }}</span>
                <p class="question-text">{{ currentQuestion }}</p>
              </div>
            </div>
          </div>
        </div>

        <section class="action-btns">
          <button class="btn truth-btn" :disabled="isRolling" @click="generate('truth')">
            <el-icon><ChatDotSquare /></el-icon> 真心话
          </button>
          <button class="btn dare-btn" :disabled="isRolling" @click="generate('dare')">
            <el-icon><Lightning /></el-icon> 大冒险
          </button>
        </section>

        <section v-if="history.length" class="history-section">
          <div class="section-header">
            <label
              ><el-icon><Clock /></el-icon> 最近记录</label
            >
            <button @click="history = []">清空</button>
          </div>
          <div class="history-list">
            <div v-for="(item, i) in history.slice(0, 5)" :key="i" class="history-item">
              <span :class="['h-badge', item.type]">{{ item.type === 'truth' ? '真' : '险' }}</span>
              <p>{{ item.text }}</p>
            </div>
          </div>
        </section>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 真心话大冒险</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import {
    Back,
    CoffeeCup,
    GoldMedal,
    Sugar,
    QuestionFilled,
    ChatDotSquare,
    Lightning,
    Clock
  } from '@element-plus/icons-vue';

  import { loadCategoryData, type TruthDareData } from '@/data/truth_dare';

  const isRolling = ref(false);
  const currentCategory = ref('party');
  const currentType = ref<'truth' | 'dare' | ''>('');
  const currentQuestion = ref('');
  const history = ref<{ type: string; text: string }[]>([]);

  const categories = [
    { id: 'party', name: '多人聚会', icon: CoffeeCup },
    { id: 'couple', name: '甜蜜情侣', icon: Sugar },
    { id: 'hardcore', name: '深水炸弹', icon: GoldMedal }
  ];

  const generate = async (type: 'truth' | 'dare') => {
    isRolling.value = true;
    currentType.value = type;

    try {
      const data: TruthDareData | null = await loadCategoryData(currentCategory.value);

      // Simulating rolling animation
      setTimeout(() => {
        if (data) {
          const options = data[type];
          const random = options[Math.floor(Math.random() * options.length)];
          currentQuestion.value = random;
          history.value.unshift({ type, text: random });
        }
        isRolling.value = false;
      }, 600);
    } catch {
      isRolling.value = false;
    }
  };
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@600;700&family=Outfit:wght@400;500;600&display=swap');

  .truth-dare-tool {
    --bg: #f8fafc;
    --card: #ffffff;
    --border: #e2e8f0;
    --text: #1e293b;
    --text-2: #64748b;
    --truth: #4f46e5;
    --truth-bg: #eef2ff;
    --dare: #e11d48;
    --dare-bg: #fff1f2;

    font-family: 'Outfit', sans-serif;
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
  }

  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
  }

  .nav-back,
  .nav-spacer {
    width: 100px;
  }
  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-2);
    cursor: pointer;
    font-size: 0.85rem;
    padding: 0.5rem 1rem;
    border-radius: 50px;
  }
  .nav-back:hover {
    border-color: var(--truth);
    color: var(--truth);
    background: var(--truth-bg);
  }

  .nav-center {
    flex: 1;
    text-align: center;
  }
  .nav-center h1 {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0;
  }
  .nav-subtitle {
    font-size: 0.75rem;
    color: var(--text-2);
    text-transform: uppercase;
    text-align: center;
    display: block;
    letter-spacing: 1.5px;
  }

  .main-content {
    max-width: 700px;
    margin: 0 auto;
    padding: 3rem 1.5rem;
  }
  .glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 32px;
    padding: 2.5rem;
    box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.08);
  }

  .category-tabs {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    margin-bottom: 2.5rem;
  }
  .category-tabs button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0.75rem 1.25rem;
    border: 1px solid var(--border);
    border-radius: 16px;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--text-2);
    font-weight: 600;
    font-size: 0.9rem;
  }
  .category-tabs button.active {
    border-color: var(--truth);
    color: var(--truth);
    background: var(--truth-bg);
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
  }

  .card-display {
    perspective: 1000px;
    margin-bottom: 3rem;
  }
  .main-card {
    width: 100%;
    min-height: 280px;
    border-radius: 24px;
    padding: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    background: #fafafa;
    border: 2px dashed var(--border);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    position: relative;
  }
  .main-card.truth {
    background: var(--truth-bg);
    border: 2px solid var(--truth);
    border-style: solid;
  }
  .main-card.dare {
    background: var(--dare-bg);
    border: 2px solid var(--dare);
    border-style: solid;
    box-shadow: 0 10px 30px rgba(225, 29, 72, 0.1);
  }

  .card-inner {
    width: 100%;
  }
  .mystery-icon {
    font-size: 4rem;
    color: var(--text-2);
    opacity: 0.2;
    margin-bottom: 1rem;
  }
  .card-placeholder p {
    color: var(--text-2);
    font-size: 1.1rem;
  }

  .type-badge {
    position: absolute;
    top: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.7rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 2px;
    padding: 4px 12px;
    border-radius: 20px;
  }
  .truth .type-badge {
    background: var(--truth);
    color: white;
  }
  .dare .type-badge {
    background: var(--dare);
    color: white;
  }

  .question-text {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text);
    line-height: 1.4;
    animation: fadeIn 0.4s;
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .action-btns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
  .btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 1.25rem;
    border: none;
    border-radius: 20px;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    color: white;
  }
  .truth-btn {
    background: var(--truth);
  }
  .dare-btn {
    background: var(--dare);
  }
  .btn:hover:not(:disabled) {
    transform: translateY(-4px);
    filter: brightness(1.1);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
  .btn:active {
    transform: translateY(0);
  }
  .btn:disabled {
    opacity: 0.6;
    cursor: wait;
  }

  .shake {
    animation: shake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }
  @keyframes shake {
    10%,
    90% {
      transform: translate3d(-1px, 0, 0);
    }
    20%,
    80% {
      transform: translate3d(2px, 0, 0);
    }
    30%,
    50%,
    70% {
      transform: translate3d(-4px, 0, 0);
    }
    40%,
    60% {
      transform: translate3d(4px, 0, 0);
    }
  }

  .history-section {
    margin-top: 3rem;
    border-top: 1px dashed var(--border);
    padding-top: 2rem;
  }
  .history-section .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  .history-section .section-header button {
    background: none;
    border: none;
    font-size: 0.8rem;
    color: var(--text-2);
    cursor: pointer;
  }
  .history-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0.75rem;
    border-radius: 12px;
    background: #f8fafc;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }
  .h-badge {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.65rem;
    color: white;
    font-weight: 900;
  }
  .h-badge.truth {
    background: var(--truth);
  }
  .h-badge.dare {
    background: var(--dare);
  }

  .footer {
    text-align: center;
    padding: 3rem;
    color: var(--text-2);
    font-size: 0.85rem;
  }
</style>
