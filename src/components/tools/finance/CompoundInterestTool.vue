<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">投资<span>.复利()</span></h1>
        <div style="width: 100px"></div>
      </header>

      <main class="brutal-grid">
        <div class="left-column">
          <section class="brutal-pane">
            <h2 class="pane-title mb-4">计算参数.PARAMS</h2>
            <div class="form-grid">
              <div class="form-group">
                <label>初始本金 (元)</label>
                <input
                  v-model.number="principal"
                  type="number"
                  min="0"
                  step="1000"
                  class="brutal-input w-full"
                />
              </div>
              <div class="form-group">
                <label>定期投入 (元)</label>
                <div class="input-with-select">
                  <input
                    v-model.number="addition"
                    type="number"
                    min="0"
                    step="500"
                    class="brutal-input flex-1"
                  />
                  <select v-model="frequency" class="brutal-input select-part">
                    <option value="monthly">每月</option>
                    <option value="yearly">每年</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label>预期年化收益率 (%)</label>
                <input
                  v-model.number="annualRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  class="brutal-input w-full"
                />
              </div>
              <div class="form-group">
                <label>投资时长 (年)</label>
                <input
                  v-model.number="years"
                  type="number"
                  min="1"
                  max="50"
                  class="brutal-input w-full"
                />
              </div>
            </div>
            <button class="brutal-btn calc-btn bg-yellow mt-6" @click="calculate">
              开始复利运算 →
            </button>
          </section>

          <section class="brutal-pane mt-6 bg-cyan">
            <h4 class="info-title">✨ 复利的力量：世界第八大奇迹</h4>
            <div class="info-content">
              <p>
                复利是指在计算利息时，将上一个周期的利息并入本金，作为下一个周期计算利息的基数。通俗地说，就是“利滚利”。
              </p>
              <div class="formula brutal-shadow">A = P(1 + r/n)<sup>nt</sup></div>
              <p class="mt-4">
                <strong>核心因素：</strong
                >长期持有、稳定的收益率是复利发挥威力的关键。即使初始本金不多，通过长时间的积累也能产生惊人结果。
              </p>
            </div>
          </section>
        </div>

        <div class="right-column">
          <div v-if="history.length > 0" class="results-area">
            <section class="brutal-pane bg-yellow mb-6">
              <div class="summary-grid">
                <div class="summary-item main">
                  <div class="label">最终金额 (本息合计)</div>
                  <div class="value highlight">¥ {{ formatMoney(totalValue) }}</div>
                </div>
                <div class="summary-sub-row">
                  <div class="summary-item">
                    <div class="label">累计投入本金</div>
                    <div class="value font-mono">¥ {{ formatMoney(totalPrincipal) }}</div>
                  </div>
                  <div class="summary-item">
                    <div class="label">累计产生利息</div>
                    <div class="value font-mono">¥ {{ formatMoney(totalInterest) }}</div>
                  </div>
                </div>
              </div>

              <div class="growth-analysis mt-6">
                <div class="label font-bold mb-2">收益占比分析</div>
                <div class="progress-container brutal-shadow border-black">
                  <div class="bar principal" :style="{ width: principalRatio + '%' }"></div>
                  <div class="bar interest" :style="{ width: interestRatio + '%' }"></div>
                </div>
                <div class="legend mt-2 flex justify-between">
                  <span
                    ><i class="dot principal-dot border-black"></i> 本金 {{ principalRatio }}%</span
                  >
                  <span
                    ><i class="dot interest-dot border-black"></i> 利息 {{ interestRatio }}%</span
                  >
                </div>
              </div>
            </section>

            <section class="brutal-pane p-0 overflow-hidden">
              <div class="pane-header bg-black text-white p-4">
                <h3 class="m-0 font-bold tracking-widest">资产增长明细.DETAILS</h3>
              </div>
              <div class="table-container">
                <table class="brutal-table w-full text-center">
                  <thead>
                    <tr class="bg-gray-100">
                      <th class="p-3 border-b-4 border-r-2 border-black">年份</th>
                      <th class="p-3 border-b-4 border-r-2 border-black">本年金额</th>
                      <th class="p-3 border-b-4 border-r-2 border-black hidden-xs">当年收益</th>
                      <th class="p-3 border-b-4 border-black">累计利息</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(row, idx) in history"
                      :key="idx"
                      :class="{ 'bg-yellow': idx % 2 !== 0 }"
                    >
                      <td class="p-3 border-b-2 border-r-2 border-black font-bold">
                        {{ row.year }}
                      </td>
                      <td class="p-3 border-b-2 border-r-2 border-black font-mono">
                        ¥ {{ formatMoney(row.value) }}
                      </td>
                      <td class="p-3 border-b-2 border-r-2 border-black font-mono hidden-xs">
                        ¥ {{ formatMoney(row.yearlyInterest) }}
                      </td>
                      <td class="p-3 border-b-2 border-black font-mono">
                        ¥ {{ formatMoney(row.accumulatedInterest) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';

  const principal = ref(50000);
  const addition = ref(2000);
  const frequency = ref('monthly');
  const annualRate = ref(8);
  const years = ref(10);

  const history = ref([]);
  const totalValue = ref(0);
  const totalPrincipal = ref(0);
  const totalInterest = ref(0);

  const formatMoney = val => {
    return val.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const calculate = () => {
    const list = [];
    let currentBalance = principal.value;
    let currentTotalPrincipal = principal.value;
    let currentAccumulatedInterest = 0;

    const monthlyRate = annualRate.value / 100 / 12;
    const yearlyRate = annualRate.value / 100;

    for (let y = 1; y <= years.value; y++) {
      let yearlyInterest = 0;

      if (frequency.value === 'monthly') {
        for (let m = 1; m <= 12; m++) {
          currentBalance += addition.value;
          currentTotalPrincipal += addition.value;
          const mInt = currentBalance * monthlyRate;
          currentBalance += mInt;
          yearlyInterest += mInt;
        }
      } else {
        currentBalance += addition.value;
        currentTotalPrincipal += addition.value;
        const yInt = currentBalance * yearlyRate;
        currentBalance += yInt;
        yearlyInterest = yInt;
      }

      currentAccumulatedInterest += yearlyInterest;
      list.push({
        year: y,
        value: currentBalance,
        yearlyInterest: yearlyInterest,
        accumulatedInterest: currentAccumulatedInterest
      });
    }

    history.value = list;
    totalValue.value = currentBalance;
    totalPrincipal.value = currentTotalPrincipal;
    totalInterest.value = currentAccumulatedInterest;
  };

  const principalRatio = computed(() => {
    if (!totalValue.value) return 0;
    return ((totalPrincipal.value / totalValue.value) * 100).toFixed(1);
  });

  const interestRatio = computed(() => {
    if (!totalValue.value) return 0;
    return (100 - parseFloat(principalRatio.value)).toFixed(1);
  });

  onMounted(() => {
    calculate();
  });
</script>

<style scoped>
  @import '@/assets/styles/brutalism.css';

  .brutal-wrapper {
    background-color: #fdfae5;
    background-image:
      linear-gradient(#e5e5e5 2px, transparent 2px),
      linear-gradient(90deg, #e5e5e5 2px, transparent 2px);
    background-size: 40px 40px;
    background-position: -2px -2px;
  }

  .brutal-title span {
    color: #ff4b4b;
    text-shadow: 4px 4px 0px #111;
    letter-spacing: 0;
  }

  .pane-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    margin: 0 0 1rem 0;
    border-bottom: 3px solid #111;
    padding-bottom: 8px;
  }

  .form-grid {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .form-group label {
    display: block;
    font-size: 0.95rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: #111;
  }

  .w-full {
    width: 100%;
    min-width: 0;
  }
  .flex-1 {
    flex: 1;
    min-width: 0;
  }

  .input-with-select {
    display: flex;
    gap: 8px;
  }

  .select-part {
    width: 100px;
    cursor: pointer;
  }

  .calc-btn {
    width: 100%;
    font-size: 1.1rem;
    padding: 12px;
    margin-top: 1.5rem;
  }

  .info-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
    margin: 0 0 1rem 0;
  }

  .info-content {
    font-size: 0.9rem;
    line-height: 1.6;
  }

  .formula {
    background: #fff;
    border: 3px solid #111;
    padding: 1rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    text-align: center;
    font-size: 1.2rem;
    margin: 1rem 0;
  }

  .summary-grid {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }

  .summary-item.main {
    padding-bottom: 1.5rem;
    border-bottom: 3px solid #111;
  }

  .summary-sub-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .label {
    font-size: 0.9rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .value {
    font-size: 1.25rem;
    font-weight: 700;
  }

  .value.highlight {
    font-size: 2.5rem;
    color: #ff4b4b;
    font-family: 'IBM Plex Mono', monospace;
    text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.1);
  }

  .font-mono {
    font-family: 'IBM Plex Mono', monospace;
  }
  .font-bold {
    font-weight: bold;
  }
  .tracking-widest {
    letter-spacing: 0.1em;
  }
  .m-0 {
    margin: 0;
  }
  .mb-2 {
    margin-bottom: 0.5rem;
  }
  .mt-2 {
    margin-top: 0.5rem;
  }
  .mb-6 {
    margin-bottom: 1.5rem;
  }
  .mt-4 {
    margin-top: 1rem;
  }
  .mt-6 {
    margin-top: 1.5rem;
  }
  .p-0 {
    padding: 0;
  }
  .p-3 {
    padding: 0.75rem;
  }
  .p-4 {
    padding: 1rem;
  }
  .flex {
    display: flex;
  }
  .justify-between {
    justify-content: space-between;
  }
  .border-black {
    border-color: #111;
  }

  .progress-container {
    height: 16px;
    background: #fff;
    border: 3px solid #111;
    display: flex;
    width: 100%;
  }

  .bar.principal {
    background: #111;
  }
  .bar.interest {
    background: #ff4b4b;
  }

  .legend {
    font-size: 0.85rem;
    font-weight: 700;
  }
  .dot {
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 2px solid #111;
    margin-right: 4px;
    vertical-align: middle;
  }
  .principal-dot {
    background: #111;
  }
  .interest-dot {
    background: #ff4b4b;
  }

  .table-container {
    max-height: 440px;
    overflow-y: auto;
  }

  .brutal-table th {
    position: sticky;
    top: 0;
    background: #fff;
    z-index: 10;
  }

  .bg-black {
    background-color: #111;
  }
  .text-white {
    color: #fff;
  }
  .bg-yellow {
    background-color: #ffd900;
  }
  .bg-cyan {
    background-color: #00ffff;
  }
  .bg-gray-100 {
    background-color: #f3f4f6;
  }

  @media (max-width: 768px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .hidden-xs {
      display: none;
    }
  }

  /* Dark mode */
  [data-theme='dark'] .brutal-wrapper {
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
  }
  [data-theme='dark'] .brutal-table th {
    background: #1a1a1a;
    color: #eee;
  }
  [data-theme='dark'] .bg-gray-100 {
    background-color: #2a2a2a;
  }
  [data-theme='dark'] .bg-yellow {
    background-color: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-cyan {
    background-color: #008080;
    color: #fff;
  }
  [data-theme='dark'] .bar.interest,
  [data-theme='dark'] .interest-dot {
    background: #ff4b4b;
  }
  [data-theme='dark'] .bar.principal,
  [data-theme='dark'] .principal-dot {
    background: #eee;
  }
  [data-theme='dark'] .value.highlight {
    color: #ff6b6b;
  }
  [data-theme='dark'] th,
  [data-theme='dark'] td {
    border-color: #eee;
  }
  [data-theme='dark'] .border-black {
    border-color: #eee;
  }
</style>
