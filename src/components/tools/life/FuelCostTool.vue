<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">油费<span>.计算()</span></h1>
        <button class="brutal-btn clear-btn" @click="clearInputs">清空</button>
      </header>

      <div class="brutal-grid main-layout">
        <div class="brutal-pane form-pane">
          <div class="pane-header bg-green">
            <span>⛽ 油费参数</span>
          </div>
          <div class="form-body">
            <div class="form-grid">
              <div class="form-item">
                <label class="brutal-label">行驶路程 (km)</label>
                <input
                  v-model.number="inputs.distance"
                  type="number"
                  class="brutal-input full"
                  :min="0"
                />
              </div>
              <div class="form-item">
                <label class="brutal-label">百公里油耗 (L/100km)</label>
                <input
                  v-model.number="inputs.consumption"
                  type="number"
                  class="brutal-input full"
                  :min="0"
                  step="0.1"
                />
              </div>
              <div class="form-item">
                <label class="brutal-label">油价 (元/L)</label>
                <input
                  v-model.number="inputs.price"
                  type="number"
                  class="brutal-input full"
                  :min="0"
                  step="0.01"
                />
              </div>
              <div class="form-item">
                <label class="brutal-label">分摊人数</label>
                <input
                  v-model.number="inputs.people"
                  type="number"
                  class="brutal-input full"
                  :min="1"
                  :max="100"
                />
              </div>
            </div>
          </div>

          <!-- Results -->
          <div class="result-section">
            <div class="primary-result bg-yellow">
              <span class="result-label">预计总油费</span>
              <span class="result-value">¥ {{ totalCost.toFixed(2) }}</span>
            </div>
            <div class="detail-boxes">
              <div class="d-box">
                <span class="d-label">预计耗油量</span>
                <span class="d-value">{{ totalFuel.toFixed(2) }} L</span>
              </div>
              <div class="d-box">
                <span class="d-label">每公里成本</span>
                <span class="d-value"
                  >¥
                  {{
                    inputs.distance > 0 ? (totalCost / inputs.distance).toFixed(2) : '0.00'
                  }}</span
                >
              </div>
              <div class="d-box">
                <span class="d-label">每人分摊</span>
                <span class="d-value accent">¥ {{ (totalCost / inputs.people).toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <!-- Cost Table -->
          <div v-if="inputs.distance > 0 && inputs.consumption > 0" class="table-section">
            <div class="table-title brutal-label">不同油价费用估算</div>
            <div class="table-wrapper">
              <table class="brutal-table">
                <thead>
                  <tr>
                    <th>油价 (元/L)</th>
                    <th>总费用 (元)</th>
                    <th>每公里 (元)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="p in priceVariations"
                    :key="p"
                    :class="{ current: p === inputs.price }"
                  >
                    <td>{{ p.toFixed(2) }}</td>
                    <td>{{ (((inputs.distance * inputs.consumption) / 100) * p).toFixed(2) }}</td>
                    <td>{{ ((inputs.consumption / 100) * p).toFixed(2) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="side-column">
          <div class="brutal-pane">
            <div class="pane-header bg-blue">
              <span class="text-white">参考油耗</span>
            </div>
            <div class="ref-body">
              <div class="ref-item">
                <span class="ref-type">紧凑型轿车</span><span class="ref-val">6-8 L/100km</span>
              </div>
              <div class="ref-item">
                <span class="ref-type">中型 SUV</span><span class="ref-val">9-12 L/100km</span>
              </div>
              <div class="ref-item">
                <span class="ref-type">大型越野车</span><span class="ref-val">13-18 L/100km</span>
              </div>
              <div class="ref-item">
                <span class="ref-type">插混 (馈电)</span><span class="ref-val">4-6 L/100km</span>
              </div>
            </div>
          </div>

          <div class="brutal-pane">
            <div class="pane-header bg-yellow">
              <span>历史记录</span>
              <div v-if="history.length > 0" class="pane-actions">
                <button @click="history = []">清除</button>
              </div>
            </div>
            <div class="history-body">
              <div v-if="history.length > 0" class="history-list">
                <div v-for="(h, idx) in history" :key="idx" class="h-card" @click="loadHistory(h)">
                  <div class="h-top">
                    <span>{{ h.distance }}km</span>
                    <strong>¥{{ h.cost.toFixed(1) }}</strong>
                  </div>
                  <div class="h-bottom">{{ h.consumption }}L/100km | ¥{{ h.price }}/L</div>
                </div>
              </div>
              <div v-else class="empty-history">暂无记录</div>
              <button class="brutal-action-btn primary save-btn" @click="saveToHistory">
                保存当前结果
              </button>
            </div>
          </div>

          <div class="brutal-pane">
            <div class="pane-header bg-green">
              <span>计算说明</span>
            </div>
            <ul class="brutal-list">
              <li><b>油耗表现</b>：实际油耗受路况、驾驶习惯、载重及空调使用影响较大。</li>
              <li><b>计算公式</b>：总油费 = (路程 ÷ 100) × 百公里油耗 × 燃油单价。</li>
              <li><b>分摊计算</b>：人均成本 = 总油费 ÷ 总人数。</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="brutal-status info">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i">© 2026 LRM工具箱 - 燃油费用计算器 // &nbsp;</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const inputs = reactive({ distance: 100, consumption: 8.5, price: 7.85, people: 1 });
  const history = ref([]);

  const totalFuel = computed(() => (inputs.distance / 100) * inputs.consumption);
  const totalCost = computed(() => totalFuel.value * inputs.price);
  const priceVariations = computed(() => {
    const base = Math.floor(inputs.price);
    return [base - 1, base - 0.5, base, base + 0.5, base + 1];
  });

  const clearInputs = () => {
    inputs.distance = 0;
    inputs.consumption = 0;
    inputs.price = 0;
    inputs.people = 1;
  };

  const saveToHistory = () => {
    if (inputs.distance <= 0) return;
    history.value.unshift({
      distance: inputs.distance,
      consumption: inputs.consumption,
      price: inputs.price,
      cost: totalCost.value,
      time: Date.now()
    });
    if (history.value.length > 10) history.value.pop();
    localStorage.setItem('vb_fuel_history', JSON.stringify(history.value));
  };

  const loadHistory = h => {
    inputs.distance = h.distance;
    inputs.consumption = h.consumption;
    inputs.price = h.price;
  };

  onMounted(() => {
    const saved = localStorage.getItem('vb_fuel_history');
    if (saved) history.value = JSON.parse(saved);
  });
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

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
    max-width: 1300px;
    margin: 0 auto;
  }
  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
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
    font-size: 1.25rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }
  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }
  .brutal-btn.clear-btn {
    background: #ff4b4b;
    color: #fff;
  }

  .main-layout {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 2.5rem;
    margin-bottom: 2.5rem;
  }
  .brutal-pane {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
    transition: transform 0.2s;
    display: flex;
    flex-direction: column;
  }
  .brutal-pane:hover {
    transform: translate(-4px, -4px);
    box-shadow: 16px 16px 0px #111;
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
  .pane-actions {
    display: flex;
    gap: 0.5rem;
  }
  .pane-actions button {
    background: #fff;
    color: #111;
    border: 3px solid #111;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    font-size: 0.85rem;
    padding: 0.3rem 0.6rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }
  .pane-actions button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }
  .pane-actions button:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }
  .bg-yellow {
    background: #ffd900;
  }
  .bg-blue {
    background: #4b7bff;
    color: #fff;
  }
  .bg-green {
    background: #00e572;
  }
  .text-white {
    color: #fff;
  }

  .form-body {
    padding: 1.5rem;
  }
  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  .form-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .brutal-label {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.95rem;
  }
  .brutal-input {
    border: 3px solid #111;
    padding: 0.6rem 0.8rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    font-size: 1rem;
    background: #fff;
    box-shadow: 3px 3px 0px #111;
    outline: none;
  }
  .brutal-input.full {
    width: 100%;
    box-sizing: border-box;
  }

  .result-section {
    border-top: 4px solid #111;
  }
  .primary-result {
    padding: 2rem;
    text-align: center;
    border-bottom: 4px solid #111;
  }
  .result-label {
    display: block;
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  .result-value {
    display: block;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 2.5rem;
    font-weight: 800;
    color: #ff4b4b;
  }
  .detail-boxes {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    padding: 1.25rem;
  }
  .d-box {
    display: flex;
    flex-direction: column;
    gap: 4px;
    text-align: center;
  }
  .d-label {
    font-size: 0.8rem;
    color: #555;
    font-weight: 600;
  }
  .d-value {
    font-size: 1rem;
    font-weight: 700;
  }
  .d-value.accent {
    color: #4b7bff;
  }

  .table-section {
    border-top: 4px solid #111;
    padding: 1.5rem;
  }
  .table-title {
    margin-bottom: 1rem;
  }
  .table-wrapper {
    border: 3px solid #111;
    max-height: 300px;
    overflow-y: auto;
  }
  .brutal-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
  }
  .brutal-table th {
    text-align: left;
    padding: 0.75rem;
    background: #ffd900;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    border-bottom: 3px solid #111;
    position: sticky;
    top: 0;
  }
  .brutal-table td {
    padding: 0.75rem;
    border-bottom: 1px solid #eee;
  }
  .brutal-table tr.current {
    background: #89b4f8;
    font-weight: 700;
  }
  .brutal-table tbody tr:hover:not(.current) {
    background: #fdfae5;
  }

  .side-column {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  .ref-body {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .ref-item {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
  }
  .ref-type {
    color: #555;
    font-weight: 600;
  }
  .ref-val {
    font-weight: 700;
  }

  .history-body {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .history-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .h-card {
    padding: 0.75rem;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #111;
    cursor: pointer;
    transition: all 0.1s;
  }
  .h-card:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }
  .h-top {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.25rem;
    font-size: 0.9rem;
  }
  .h-bottom {
    font-size: 0.8rem;
    color: #555;
  }
  .empty-history {
    text-align: center;
    color: #888;
    font-weight: 600;
    padding: 1rem;
  }
  .brutal-action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.6rem 1.2rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.95rem;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
  }
  .brutal-action-btn.primary {
    background: #00e572;
  }
  .brutal-action-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }
  .brutal-action-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px #111;
  }
  .save-btn {
    width: 100%;
    text-align: center;
  }
  .brutal-list {
    list-style: none;
    padding: 1.25rem;
    margin: 0;
  }
  .brutal-list li {
    font-size: 0.85rem;
    color: #333;
    position: relative;
    padding-left: 1.25rem;
    margin-bottom: 0.75rem;
    line-height: 1.6;
    font-weight: 500;
  }
  .brutal-list li::before {
    content: '▪';
    position: absolute;
    left: 0;
    color: #ff4b4b;
    font-weight: 900;
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

  @media (max-width: 1024px) {
    .main-layout {
      grid-template-columns: 1fr;
    }
    .form-grid {
      grid-template-columns: 1fr;
    }
    .detail-boxes {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    .brutal-header {
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }
    .brutal-title {
      font-size: 2rem;
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
  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane:hover {
    box-shadow: 16px 16px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
    color: #111;
  }
  [data-theme='dark'] .pane-actions button {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .brutal-input {
    background: #222;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-action-btn {
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:hover {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn.primary {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .result-section {
    border-top-color: #eee;
  }
  [data-theme='dark'] .primary-result {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .result-value {
    color: #ff9fb2;
  }
  [data-theme='dark'] .table-section {
    border-top-color: #eee;
  }
  [data-theme='dark'] .table-wrapper {
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-table th {
    background: #b28f00;
    border-bottom-color: #eee;
    color: #111;
  }
  [data-theme='dark'] .brutal-table td {
    border-bottom-color: #333;
  }
  [data-theme='dark'] .brutal-table tr.current {
    background: #405d9e;
    color: #fff;
  }
  [data-theme='dark'] .brutal-table tbody tr:hover:not(.current) {
    background: #222;
  }
  [data-theme='dark'] .d-label,
  [data-theme='dark'] .ref-type {
    color: #aaa;
  }
  [data-theme='dark'] .d-value.accent {
    color: #89b4f8;
  }
  [data-theme='dark'] .h-card {
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .h-card:hover {
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .h-bottom {
    color: #aaa;
  }
  [data-theme='dark'] .brutal-list li {
    color: #ccc;
  }
  [data-theme='dark'] .brutal-status {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .bg-green {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .brutal-btn.clear-btn {
    background: #cc0000;
    color: #fff;
  }
</style>
