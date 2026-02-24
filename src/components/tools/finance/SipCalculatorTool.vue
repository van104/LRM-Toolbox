<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">定投收益<span>.估算器()</span></h1>
        <div style="width: 100px"></div>
      </header>

      <main class="brutal-grid">
        <div class="left-column">
          <section class="brutal-pane bg-white mb-6">
            <h2 class="pane-title mb-4">定投计划.PLAN</h2>

            <div class="form-grid mb-6">
              <div class="form-group flex-1">
                <label class="form-label">每月定投金额 (¥)</label>
                <input
                  v-model.number="monthlyInvestment"
                  type="number"
                  min="100"
                  step="100"
                  class="brutal-input w-full"
                />
              </div>
              <div class="form-group flex-1">
                <label class="form-label">预期年化收益率 (%)</label>
                <input
                  v-model.number="annualReturn"
                  type="number"
                  min="1"
                  max="100"
                  step="0.5"
                  class="brutal-input w-full"
                />
              </div>
            </div>

            <div class="form-grid mb-6">
              <div class="form-group w-full">
                <label class="form-label">定投期限 (年)</label>
                <div class="relative">
                  <input
                    v-model.number="duration"
                    type="number"
                    min="1"
                    max="50"
                    class="brutal-input w-full lg-text"
                  />
                </div>
              </div>
            </div>

            <div class="brutal-pane bg-cyan p-4 mt-6 border-3 border-black brutal-shadow-sm">
              <h4 class="font-bold mb-2">💡 什么是 SIP/定投?</h4>
              <p class="text-sm font-bold opacity-80 leading-relaxed">
                定期定额投资计划 (Systematic Investment Plan)
                能够帮助你分散买入成本，以“时间换空间”。通过复利效应滚雪球，即使是每月的一小笔资金，长期坚持也会汇聚成可观的财富！
              </p>
            </div>
          </section>
        </div>

        <div class="right-column">
          <section class="brutal-pane bg-yellow h-full flex-col">
            <h2 class="pane-title mb-4">估算结果.RESULT</h2>

            <div class="text-center w-full mb-6 pt-4 border-b-3 border-black pb-6">
              <h3 class="font-bold text-lg mb-2">到期总金额 (预估)</h3>
              <div
                class="value huge font-mono font-black my-4 highlight target-hover transition-all"
              >
                <span class="text-3xl mr-2">¥</span>{{ formatMoney(result.totalValue) }}
              </div>
            </div>

            <div class="details-grid mt-auto pt-4">
              <div
                class="detail-item bg-white border-3 border-black brutal-shadow p-3 pb-2 text-center"
              >
                <span class="block text-sm font-bold mb-1">累计本金投入</span>
                <span class="block font-mono font-black text-xl"
                  >¥ {{ formatMoney(result.investedAmount) }}</span
                >
              </div>
              <div
                class="detail-item bg-black text-white border-3 border-black brutal-shadow p-3 pb-2 text-center"
              >
                <span class="block text-sm font-bold mb-1 text-cyan">💰 预期获得收益</span>
                <span class="block font-mono font-black text-xl text-cyan"
                  >+ ¥ {{ formatMoney(result.estimatedReturns) }}</span
                >
              </div>
            </div>

            <div class="mt-8 border-3 border-black p-4 bg-white brutal-shadow-sm">
              <h3 class="font-bold mb-4">投入本金与收益占比</h3>

              <div class="flex h-8 border-3 border-black w-full mb-3 bg-white">
                <div
                  class="bg-black transition-all"
                  :style="{ width: result.investedPercent + '%' }"
                ></div>
                <div
                  class="bg-pink transition-all"
                  :style="{ width: result.profitPercent + '%' }"
                ></div>
              </div>

              <div class="flex justify-between text-sm font-bold font-mono">
                <span>⬛ 本金 {{ result.investedPercent }}%</span>
                <span class="text-pink">🟥 收益 {{ result.profitPercent }}%</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';

  const monthlyInvestment = ref(1000);
  const annualReturn = ref(8);
  const duration = ref(10);

  const result = computed(() => {
    const p = Number(monthlyInvestment.value) || 0;
    const rate = Number(annualReturn.value) || 0;
    const y = Number(duration.value) || 0;

    const i = rate / 100 / 12; // monthly rate
    const n = y * 12; // total months

    // FV = P * [((1 + i)^n - 1) / i] * (1 + i)  (Beginning of period)
    const fv = i > 0 ? p * ((Math.pow(1 + i, n) - 1) / i) * (1 + i) : p * n;

    const investedAmount = p * n;
    const estimatedReturns = fv - investedAmount;
    const totalValue = fv;

    const total = totalValue || 1;

    return {
      investedAmount: Math.round(investedAmount),
      estimatedReturns: Math.round(Math.max(0, estimatedReturns)),
      totalValue: Math.round(totalValue),
      investedPercent: ((investedAmount / total) * 100).toFixed(1),
      profitPercent: ((Math.max(0, estimatedReturns) / total) * 100).toFixed(1)
    };
  });

  const formatMoney = (val: number) => {
    return val.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };
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
    margin: 0;
    border-bottom: 3px solid #111;
    padding-bottom: 8px;
  }

  .form-grid {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .form-label {
    display: block;
    font-size: 0.95rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    color: #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
  }

  .flex {
    display: flex;
  }
  .justify-between {
    justify-content: space-between;
  }
  .justify-center {
    justify-content: center;
  }
  .items-center {
    align-items: center;
  }
  .flex-col {
    flex-direction: column;
  }
  .flex-wrap {
    flex-wrap: wrap;
  }
  .flex-1 {
    flex: 1;
    min-width: 150px;
  }
  .w-full {
    width: 100%;
    min-width: 0;
  }
  .h-full {
    height: 100%;
  }
  .h-8 {
    height: 2rem;
  }

  .mb-1 {
    margin-bottom: 0.25rem;
  }
  .mb-2 {
    margin-bottom: 0.5rem;
  }
  .mb-3 {
    margin-bottom: 0.75rem;
  }
  .mb-4 {
    margin-bottom: 1rem;
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
  .mt-8 {
    margin-top: 2rem;
  }
  .mt-auto {
    margin-top: auto;
  }
  .pb-2 {
    padding-bottom: 0.5rem;
  }
  .pb-6 {
    padding-bottom: 1.5rem;
  }
  .pt-4 {
    padding-top: 1rem;
  }
  .p-3 {
    padding: 0.75rem;
  }
  .p-4 {
    padding: 1rem;
  }
  .mr-2 {
    margin-right: 0.5rem;
  }

  .relative {
    position: relative;
  }
  .text-center {
    text-align: center;
  }
  .block {
    display: block;
  }

  .lg-text {
    font-size: 1.5rem;
    padding: 12px;
    font-weight: 900;
  }

  .font-bold {
    font-weight: bold;
  }
  .font-black {
    font-weight: 900;
  }
  .font-mono {
    font-family: 'IBM Plex Mono', monospace;
  }
  .text-sm {
    font-size: 0.875rem;
  }
  .text-lg {
    font-size: 1.125rem;
  }
  .text-xl {
    font-size: 1.25rem;
  }
  .text-3xl {
    font-size: 1.875rem;
  }

  .border-b-3 {
    border-bottom: 3px solid #111;
  }
  .border-3 {
    border: 3px solid #111;
  }
  .border-black {
    border-color: #111;
  }

  .huge {
    font-size: 3.5rem;
    font-weight: 900;
    line-height: 1;
  }
  .target-hover:hover {
    transform: scale(1.05);
  }
  .highlight {
    color: #ff4b4b;
    text-shadow: 4px 4px 0px rgba(0, 0, 0, 0.1);
  }
  .text-pink {
    color: #ff4b4b;
  }
  .text-cyan {
    color: #00ffff;
  }
  .text-white {
    color: #fff;
  }
  .opacity-80 {
    opacity: 0.8;
  }
  .leading-relaxed {
    line-height: 1.625;
  }

  .bg-yellow {
    background-color: #ffd900;
  }
  .bg-cyan {
    background-color: #00ffff;
  }
  .bg-pink {
    background-color: #ff4b4b;
  }
  .bg-white {
    background-color: #fff;
  }
  .bg-black {
    background-color: #111;
  }

  .details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .brutal-shadow {
    box-shadow: 4px 4px 0px #111;
    transition: transform 0.1s;
  }
  .brutal-shadow-sm {
    box-shadow: 3px 3px 0px #111;
  }

  @media (max-width: 768px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
  }

  /* Dark mode */
  [data-theme='dark'] .brutal-wrapper {
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
  }
  [data-theme='dark'] .bg-yellow {
    background-color: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-cyan {
    background-color: #008080;
    color: #fff;
  }
  [data-theme='dark'] .bg-pink {
    background-color: #cc0000;
  }
  [data-theme='dark'] .bg-white {
    background-color: #1a1a1a;
    color: #eee;
  }
  [data-theme='dark'] .bg-black {
    background-color: #333;
  }
  [data-theme='dark'] .text-pink {
    color: #ff6b6b;
  }
  [data-theme='dark'] .text-cyan {
    color: #00ffff;
  }
  [data-theme='dark'] .highlight {
    color: #ff6b6b;
    text-shadow: 4px 4px 0px #111;
  }
  [data-theme='dark'] .border-black,
  [data-theme='dark'] .border-3,
  [data-theme='dark'] .border-b-3 {
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-shadow,
  [data-theme='dark'] .brutal-shadow-sm {
    box-shadow: 3px 3px 0px #eee;
  }
</style>
