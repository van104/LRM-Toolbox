<template>
  <div class="game-over-screen fade-in">
    <div class="legacy-container brutal-pane bg-white">
      <div class="legacy-header bg-black text-white">
        <div class="epoch-label">LEGACY SUMMARY</div>
        <h2 class="title">精彩的一生结束了</h2>
      </div>

      <div class="summary-body p-8">
        <div class="main-stats-grid">
          <div class="stat-card bg-yellow">
            <div class="stat-icon">⌛</div>
            <div class="stat-info">
              <span class="stat-label">享年</span>
              <span class="stat-value">{{ age }} <small>岁</small></span>
            </div>
          </div>
          <div class="stat-card bg-cyan">
            <div class="stat-icon">💰</div>
            <div class="stat-info">
              <span class="stat-label">总资产</span>
              <span class="stat-value">￥{{ formatMoney(totalWealth) }}</span>
            </div>
          </div>
          <div class="stat-card bg-blue text-white">
            <div class="stat-icon">👔</div>
            <div class="stat-info">
              <span class="stat-label">最终成就</span>
              <span class="stat-value">{{ jobName }}</span>
            </div>
          </div>
        </div>

        <div class="assets-summary mt-8">
          <h3 class="sub-title">财富与家业</h3>
          <div class="assets-list">
            <div class="asset-pill bg-gray-100">
              <span class="pill-icon">🏠</span>
              <span class="pill-text">房产: {{ houses.length }} 处</span>
            </div>
            <div class="asset-pill bg-gray-100">
              <span class="pill-icon">🚗</span>
              <span class="pill-text">座驾: {{ cars.length }} 辆</span>
            </div>
          </div>
        </div>

        <div class="final-attributes mt-8">
          <h3 class="sub-title">临终状态</h3>
          <div class="attr-bars">
            <div v-for="(val, key) in attributes" :key="key" class="attr-row">
              <span class="attr-label">{{ getAttrLabel(key) }}</span>
              <div class="attr-progress-wrap">
                <div
                  class="attr-progress-bar"
                  :class="'bg-' + getAttrColor(key)"
                  :style="{ width: val + '%' }"
                ></div>
              </div>
              <span class="attr-num">{{ val }}</span>
            </div>
          </div>
        </div>

        <div class="actions mt-10">
          <button
            class="brutal-btn restart-btn w-full py-4 text-xl bg-pink text-white"
            @click="$emit('restart')"
          >
            重新起航 (再次轮回)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  import type { GameState, House, Vehicle } from '@/data/life_simulator/types';

  const props = defineProps<{
    age: number;
    wealth: number;
    savings: number;
    jobName: string;
    houses: House[];
    cars: Vehicle[];
    gameState: GameState;
  }>();

  defineEmits(['restart']);

  const totalWealth = computed(() => props.wealth + props.savings);

  const attributes = computed(() => ({
    health: props.gameState.health,
    smarts: props.gameState.smarts,
    looks: props.gameState.looks,
    happiness: props.gameState.happiness
  }));

  const formatMoney = (n: number) => {
    if (n >= 100000000) return (n / 100000000).toFixed(2) + ' 亿';
    if (n >= 10000) return (n / 10000).toFixed(1) + ' 万';
    return n.toLocaleString();
  };

  const getAttrLabel = (k: string) => {
    const map: Record<string, string> = {
      health: '健康',
      smarts: '智力',
      looks: '颜值',
      happiness: '快乐'
    };
    return map[k] || k;
  };

  const getAttrColor = (k: string) => {
    const map: Record<string, string> = {
      health: 'pink',
      smarts: 'blue',
      looks: 'cyan',
      happiness: 'yellow'
    };
    return map[k] || 'gray';
  };
</script>

<style scoped>
  .game-over-screen {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background: radial-gradient(#111 1px, transparent 1px);
    background-size: 20px 20px;
  }

  .legacy-container {
    max-width: 600px;
    width: 100%;
    animation: slideUp 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .legacy-header {
    padding: 2rem;
    text-align: center;
    border-bottom: 4px solid #111;
  }

  .epoch-label {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    letter-spacing: 0.2em;
    font-size: 0.75rem;
    opacity: 0.7;
    margin-bottom: 0.5rem;
  }

  .title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 2.2rem;
    margin: 0;
    text-transform: uppercase;
  }

  .main-stats-grid {
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    grid-template-rows: auto auto;
    gap: 1rem;
  }

  .stat-card:first-child {
    grid-row: span 2;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .stat-card {
    border: 3px solid #111;
    padding: 1.25rem;
    box-shadow: 4px 4px 0px #111;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .stat-icon {
    font-size: 1.8rem;
  }
  .stat-info {
    display: flex;
    flex-direction: column;
  }
  .stat-label {
    font-size: 0.8rem;
    font-weight: bold;
    opacity: 0.8;
  }
  .stat-value {
    font-size: 1.3rem;
    font-weight: 900;
    line-height: 1.2;
  }
  .stat-value small {
    font-size: 0.9rem;
  }

  .sub-title {
    font-size: 1.1rem;
    font-weight: 900;
    border-left: 6px solid #111;
    padding-left: 0.75rem;
    margin-bottom: 1rem;
  }

  .assets-list {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  .asset-pill {
    padding: 0.5rem 1rem;
    border: 2px solid #111;
    border-radius: 50px;
    font-weight: bold;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .attr-bars {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .attr-row {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .attr-label {
    width: 4rem;
    font-weight: bold;
    font-size: 0.9rem;
  }
  .attr-progress-wrap {
    flex: 1;
    height: 12px;
    background: #eee;
    border: 2px solid #111;
    overflow: hidden;
  }
  .attr-progress-bar {
    height: 100%;
    border-right: 2px solid #1111;
    transition: width 1s ease-out;
  }
  .attr-num {
    width: 2.5rem;
    text-align: right;
    font-weight: 900;
    font-family: monospace;
  }

  .brutal-btn {
    border: 4px solid #111;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition: all 0.1s;
    font-weight: 900;
  }
  .brutal-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 8px 8px 0px #111;
  }
  .brutal-btn:active {
    transform: translate(2px, 2px);
    box-shadow: 0px 0px 0px #111;
  }

  .bg-yellow {
    background: #ffd900;
  }
  .bg-cyan {
    background: #00e572;
  }
  .bg-blue {
    background: #4b7bff;
  }
  .bg-pink {
    background: #ff4b4b;
  }
  .bg-gray-100 {
    background: #f3f4f6;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 480px) {
    .main-stats-grid {
      grid-template-columns: 1fr;
    }
    .stat-card:first-child {
      grid-row: auto;
    }
  }
</style>
