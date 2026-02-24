<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">分期<span>.计算()</span></h1>
        <div style="width: 100px"></div>
      </header>

      <main class="brutal-grid">
        <div class="left-column">
          <section class="brutal-pane mb-6">
            <h2 class="pane-title mb-4">输入参数.PARAMS</h2>
            <div class="form-grid">
              <div class="form-group">
                <label>分期总金额 (¥)</label>
                <input
                  v-model.number="amount"
                  type="number"
                  min="100"
                  step="1000"
                  class="brutal-input w-full"
                />
              </div>

              <div class="flex-row gap-4">
                <div class="form-group flex-1">
                  <label>分期期数</label>
                  <select v-model.number="periods" class="brutal-input w-full">
                    <option :value="3">3期</option>
                    <option :value="6">6期</option>
                    <option :value="9">9期</option>
                    <option :value="12">12期</option>
                    <option :value="18">18期</option>
                    <option :value="24">24期</option>
                    <option :value="36">36期</option>
                  </select>
                </div>
                <div class="form-group flex-1">
                  <label>每期手续费率 (%)</label>
                  <input
                    v-model.number="ratePerPeriod"
                    type="number"
                    min="0"
                    max="5"
                    step="0.01"
                    class="brutal-input w-full"
                  />
                </div>
              </div>
            </div>
          </section>

          <section class="brutal-pane bg-cyan hidden-xs">
            <div class="info-card">
              <h4 class="font-bold mb-2">💡 分期陷阱提示</h4>
              <p class="text-sm">
                很多银行宣传的“免息分期”实际上会收取“手续费”。<br />
                虽然表面上看每个月只扣零点几，但因为您的本金在每个月都在减少，而手续费却是按照总本金收取的，因此<strong>实际年化利率(IRR)</strong>往往远高于表面费率！
              </p>
            </div>
          </section>
        </div>

        <div class="right-column">
          <section class="brutal-pane bg-yellow h-full flex-col">
            <h2 class="pane-title mb-4">计算结果.RESULT</h2>
            <div class="main-result text-center mb-6 pt-4 pb-6 border-b-4 border-black">
              <span class="label font-bold block mb-2">每期定额还款</span>
              <div class="value huge highlight">¥ {{ result.monthlyPay }}</div>
              <div class="sub-info mt-2 text-sm font-bold">
                (本金 ¥{{ result.monthlyPrincipal }} + 手费 ¥{{ result.monthlyFee }})
              </div>
            </div>

            <div class="irr-box bg-white border-3 border-black brutal-shadow p-4 mb-6 text-center">
              <div class="font-bold text-pink mb-1">📈 实际年化利率 (IRR)</div>
              <div class="irr-value text-3xl font-black font-mono text-pink">{{ result.irr }}%</div>
              <p class="text-xs font-bold mt-2">
                表面年化仅为 {{ (ratePerPeriod * 12).toFixed(2) }}%，其实暗藏玄机！
              </p>
            </div>

            <div class="details-grid mt-auto">
              <div class="detail-item bg-white border-3 border-black brutal-shadow p-3 text-center">
                <span class="block text-sm font-bold mb-1">总还款额</span>
                <span class="block font-mono font-black text-xl"
                  >¥ {{ result.totalRepayment }}</span
                >
              </div>
              <div
                class="detail-item bg-white border-3 border-black brutal-shadow p-3 text-center bg-pink text-white"
              >
                <span class="block text-sm font-bold mb-1">总计手续费</span>
                <span class="block font-mono font-black text-xl">¥ {{ result.totalFee }}</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';

  const amount = ref(10000);
  const periods = ref(12);
  const ratePerPeriod = ref(0.6);

  const result = computed(() => {
    const principal = amount.value;
    const n = periods.value;
    const r = ratePerPeriod.value / 100;

    const monthlyPrincipal = principal / n;
    const monthlyFee = principal * r;
    const monthlyPay = monthlyPrincipal + monthlyFee;

    const totalRepayment = monthlyPay * n;
    const totalFee = monthlyFee * n;

    let low = 0;
    let high = 1;
    let i = 0;

    for (let k = 0; k < 20; k++) {
      const mid = (low + high) / 2;
      const fv = (monthlyPay * (1 - Math.pow(1 + mid, -n))) / mid;
      if (fv > principal) low = mid;
      else high = mid;
      i = mid;
    }

    const annualIRR = (Math.pow(1 + i, 12) - 1) * 100;

    return {
      monthlyPrincipal: monthlyPrincipal.toFixed(2),
      monthlyFee: monthlyFee.toFixed(2),
      monthlyPay: monthlyPay.toFixed(2),
      totalRepayment: totalRepayment.toFixed(2),
      totalFee: totalFee.toFixed(2),
      irr: annualIRR.toFixed(2)
    };
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
    margin: 0;
    border-bottom: 3px solid #111;
    padding-bottom: 8px;
  }

  .form-grid {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  .form-group label {
    display: block;
    font-size: 0.9rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    color: #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
  }

  .flex-row {
    display: flex;
    flex-wrap: wrap;
  }
  .gap-4 {
    gap: 1rem;
  }
  .flex-1 {
    flex: 1;
    min-width: 0;
  }
  .w-full {
    width: 100%;
    min-width: 0;
  }
  .mb-1 {
    margin-bottom: 0.25rem;
  }
  .mb-2 {
    margin-bottom: 0.5rem;
  }
  .mb-4 {
    margin-bottom: 1rem;
  }
  .mb-6 {
    margin-bottom: 1.5rem;
  }
  .mt-2 {
    margin-top: 0.5rem;
  }
  .mt-auto {
    margin-top: auto;
  }
  .pt-4 {
    padding-top: 1rem;
  }
  .pb-6 {
    padding-bottom: 1.5rem;
  }
  .p-3 {
    padding: 0.75rem;
  }
  .p-4 {
    padding: 1rem;
  }
  .block {
    display: block;
  }
  .text-center {
    text-align: center;
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
  .text-xs {
    font-size: 0.75rem;
  }
  .text-sm {
    font-size: 0.875rem;
  }
  .text-xl {
    font-size: 1.25rem;
  }
  .text-3xl {
    font-size: 1.875rem;
  }

  .border-b-4 {
    border-bottom: 4px solid #111;
  }
  .border-3 {
    border: 3px solid #111;
  }
  .border-black {
    border-color: #111;
  }

  .huge {
    font-size: 3rem;
    font-weight: 900;
  }
  .highlight {
    color: #ff4b4b;
    font-family: 'IBM Plex Mono', monospace;
    text-shadow: 4px 4px 0px rgba(0, 0, 0, 0.1);
  }
  .text-pink {
    color: #ff4b4b;
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
  .bg-pink {
    background-color: #ff4b4b;
  }
  .bg-white {
    background-color: #fff;
  }

  .flex-col {
    display: flex;
    flex-direction: column;
  }
  .h-full {
    height: 100%;
  }

  .details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
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
  [data-theme='dark'] .bg-yellow {
    background-color: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-cyan {
    background-color: #008080;
    color: #fff;
  }
  [data-theme='dark'] .bg-white {
    background-color: #1a1a1a;
    color: #eee;
  }
  [data-theme='dark'] .text-pink {
    color: #ff6b6b;
  }
  [data-theme='dark'] .highlight {
    color: #ff6b6b;
    text-shadow: 4px 4px 0px #111;
  }
  [data-theme='dark'] .border-black {
    border-color: #eee;
  }
  [data-theme='dark'] .border-b-4 {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .bg-pink {
    background-color: #cc0000;
  }
</style>
