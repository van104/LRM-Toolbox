<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">个税<span>.计算器()</span></h1>
        <div style="width: 100px"></div>
      </header>

      <main class="brutal-grid">
        <div class="left-column">
          <section class="brutal-pane bg-white mb-6">
            <h2 class="pane-title mb-4">薪资设置.SALARY</h2>

            <div class="form-grid mb-6">
              <div class="form-group w-full">
                <label class="form-label">税前月薪 (¥)</label>
                <div class="relative">
                  <span
                    class="absolute left-3 top-1/2 -translate-y-1/2 font-black text-xl text-pink"
                    >¥</span
                  >
                  <input
                    v-model.number="salary"
                    type="number"
                    min="0"
                    class="brutal-input w-full lg-text pl-10"
                    placeholder="0"
                  />
                </div>
              </div>

              <div class="form-group flex-1">
                <label class="form-label">专项附加扣除 (¥)</label>
                <input
                  v-model.number="deduction"
                  type="number"
                  min="0"
                  class="brutal-input w-full"
                  placeholder="0"
                />
                <p class="text-xs font-bold mt-2 opacity-80">
                  (含子女教育、赡养老人、房租房贷等总额)
                </p>
              </div>

              <div class="form-group flex-1">
                <label class="form-label">免征起征点 (¥)</label>
                <input
                  v-model.number="threshold"
                  type="number"
                  disabled
                  class="brutal-input w-full font-mono bg-disabled"
                />
              </div>
            </div>

            <h2 class="pane-title mt-6 mb-4">五险一金.INSURANCE</h2>

            <div class="border-3 border-black brutal-shadow-sm mb-4">
              <button
                class="w-full text-left bg-cyan text-black font-black p-3 border-none cursor-pointer flex justify-between items-center"
                @click="showInsurance = !showInsurance"
              >
                <span>⚙️ 展开/收起 个人缴纳比例与基数设置</span>
                <span
                  class="font-mono text-xl transition-all"
                  :class="showInsurance ? 'rotate-90' : ''"
                  >▶</span
                >
              </button>

              <div v-show="showInsurance" class="p-4 bg-white border-t-3 border-black">
                <div class="form-grid mb-4">
                  <div class="form-group flex-1">
                    <label class="form-label">社保基数</label>
                    <input
                      v-model.number="socialBase"
                      type="number"
                      class="brutal-input w-full"
                      placeholder="未填等于月薪"
                    />
                  </div>
                  <div class="form-group flex-1">
                    <label class="form-label">公积金基数</label>
                    <input
                      v-model.number="fundBase"
                      type="number"
                      class="brutal-input w-full"
                      placeholder="未填等于月薪"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="input-with-addon">
                    <span class="addon bg-black text-white font-bold text-sm">养老 %</span>
                    <input
                      v-model.number="rates.pension"
                      type="number"
                      step="0.5"
                      class="w-full font-mono text-center flex-1 min-w-0"
                    />
                  </div>
                  <div class="input-with-addon">
                    <span class="addon bg-black text-white font-bold text-sm">医疗 %</span>
                    <input
                      v-model.number="rates.medical"
                      type="number"
                      step="0.5"
                      class="w-full font-mono text-center flex-1 min-w-0"
                    />
                  </div>
                  <div class="input-with-addon">
                    <span class="addon bg-black text-white font-bold text-sm">失业 %</span>
                    <input
                      v-model.number="rates.unemployment"
                      type="number"
                      step="0.5"
                      class="w-full font-mono text-center flex-1 min-w-0"
                    />
                  </div>
                  <div class="input-with-addon">
                    <span class="addon bg-black text-white font-bold text-sm">公积金 %</span>
                    <input
                      v-model.number="rates.fund"
                      type="number"
                      step="0.5"
                      class="w-full font-mono text-center flex-1 min-w-0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div class="right-column">
          <section v-if="result" class="brutal-pane bg-yellow h-full flex-col">
            <h2 class="pane-title mb-4">实发工资明细.RESULT</h2>

            <div class="text-center w-full mb-6 pt-4 border-b-4 border-black pb-8">
              <h3 class="font-bold text-lg mb-2">到手实发薪资</h3>
              <div
                class="value huge font-mono font-black my-4 highlight target-hover transition-all drop-shadow-white line-height-1"
              >
                <span class="text-3xl mr-2">¥</span>{{ formatMoney(result.netSalary) }}
              </div>
            </div>

            <div class="mb-6">
              <h3 class="font-black text-sm mb-3">薪资去向一览</h3>
              <div class="flex h-6 border-3 border-black w-full mb-2 bg-white">
                <div
                  class="bg-green transition-all"
                  :style="{ width: getPercent(result.netSalary) + '%' }"
                ></div>
                <div
                  class="bg-black transition-all"
                  :style="{ width: getPercent(result.totalInsurance) + '%' }"
                ></div>
                <div
                  class="bg-pink transition-all"
                  :style="{ width: getPercent(result.tax) + '%' }"
                ></div>
              </div>
              <div class="flex justify-between text-xs font-bold font-mono">
                <span class="text-green-dark"
                  >🟩 实发 {{ getPercent(result.netSalary).toFixed(1) }}%</span
                >
                <span>⬛ 五险一金 {{ getPercent(result.totalInsurance).toFixed(1) }}%</span>
                <span class="text-pink">🟥 个税 {{ getPercent(result.tax).toFixed(1) }}%</span>
              </div>
            </div>

            <div class="details-grid mt-auto pt-6 border-t-3 border-black border-dashed">
              <div
                class="detail-item bg-pink text-white border-3 border-black brutal-shadow p-3 pb-2 flex flex-col justify-center items-center"
              >
                <span class="block text-sm font-bold mb-1">缴纳个税扣除</span>
                <span class="block font-mono font-black text-xl"
                  >¥ {{ formatMoney(result.tax) }}</span
                >
              </div>

              <div
                class="detail-item bg-black text-white border-3 border-black brutal-shadow p-3 flex flex-col justify-center items-center relative"
              >
                <span class="block text-sm font-bold mb-1 text-cyan">五险一金个人扣除</span>
                <span class="block font-mono font-black text-xl text-cyan"
                  >¥ {{ formatMoney(result.totalInsurance) }}</span
                >
                <div
                  class="w-full text-xs opacity-70 mt-2 pt-2 border-t-2 border-white border-dashed text-center font-mono"
                >
                  养老 ¥{{ formatMoney(result.details.pension) }} | 医 ¥{{
                    formatMoney(result.details.medical)
                  }}<br />
                  失业 ¥{{ formatMoney(result.details.unemployment) }} | 公积金 ¥{{
                    formatMoney(result.details.fund)
                  }}
                </div>
              </div>
            </div>
          </section>

          <section
            v-else
            class="brutal-pane bg-pink text-white h-full flex-col items-center justify-center p-8 text-center border-dashed border-4 border-black"
          >
            <div class="text-6xl mb-4">💰</div>
            <h2 class="font-black text-2xl mb-2">算算到手多少钱？</h2>
            <p class="font-bold opacity-90 leading-relaxed">
              请在左侧输入您的税前薪资<br />我们将实时测算五险一金与纳税明细
            </p>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';

  const salary = ref<number | ''>('');
  const deduction = ref(0);
  const threshold = ref(5000);

  const showInsurance = ref(false);
  const socialBase = ref<number | ''>('');
  const fundBase = ref<number | ''>('');

  const rates = ref({
    pension: 8,
    medical: 2,
    unemployment: 0.5,
    fund: 7
  });

  interface TaxResult {
    netSalary: number;
    tax: number;
    totalInsurance: number;
    details: { pension: number; medical: number; unemployment: number; fund: number };
  }

  const result = ref<TaxResult | null>(null);

  watch(salary, val => {
    if (val && !socialBase.value) socialBase.value = val;
    if (val && !fundBase.value) fundBase.value = val;
  });

  const calculate = () => {
    const s = Number(salary.value) || 0;

    if (s <= 0) {
      result.value = null;
      return;
    }

    const sBase = Number(socialBase.value) || s;
    const fBase = Number(fundBase.value) || s;

    const pension = sBase * (rates.value.pension / 100);
    const medical = sBase * (rates.value.medical / 100);
    const unemployment = sBase * (rates.value.unemployment / 100);
    const fund = fBase * (rates.value.fund / 100);

    const totalInsurance = pension + medical + unemployment + fund;

    let taxableIncome = s - totalInsurance - threshold.value - deduction.value;
    if (taxableIncome < 0) taxableIncome = 0;

    let tax = 0;
    if (taxableIncome <= 3000) {
      tax = taxableIncome * 0.03;
    } else if (taxableIncome <= 12000) {
      tax = taxableIncome * 0.1 - 210;
    } else if (taxableIncome <= 25000) {
      tax = taxableIncome * 0.2 - 1410;
    } else if (taxableIncome <= 35000) {
      tax = taxableIncome * 0.25 - 2660;
    } else if (taxableIncome <= 55000) {
      tax = taxableIncome * 0.3 - 4410;
    } else if (taxableIncome <= 80000) {
      tax = taxableIncome * 0.35 - 7160;
    } else {
      tax = taxableIncome * 0.45 - 15160;
    }

    if (tax < 0) tax = 0;

    const netSalary = s - totalInsurance - tax;

    result.value = {
      netSalary,
      tax,
      totalInsurance,
      details: {
        pension,
        medical,
        unemployment,
        fund
      }
    };
  };

  watch(
    [salary, deduction, threshold, socialBase, fundBase, rates],
    () => {
      calculate();
    },
    { deep: true }
  );

  const formatMoney = (val: number) => {
    if (val === undefined || isNaN(val)) return '0.00';
    return val.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getPercent = (val: number) => {
    const s = Number(salary.value) || 0;
    if (s === 0) return 0;
    return Math.max(0, Math.min(100, (val / s) * 100));
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
  .h-6 {
    height: 1.5rem;
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
  .mt-1 {
    margin-top: 0.25rem;
  }
  .mt-2 {
    margin-top: 0.5rem;
  }
  .mt-4 {
    margin-top: 1rem;
  }
  .mt-6 {
    margin-top: 1.5rem;
  }
  .mt-auto {
    margin-top: auto;
  }
  .pb-2 {
    padding-bottom: 0.5rem;
  }
  .pb-8 {
    padding-bottom: 2rem;
  }
  .pt-2 {
    padding-top: 0.5rem;
  }
  .pt-4 {
    padding-top: 1rem;
  }
  .pt-6 {
    padding-top: 1.5rem;
  }
  .p-3 {
    padding: 0.75rem;
  }
  .p-4 {
    padding: 1rem;
  }
  .p-8 {
    padding: 2rem;
  }
  .pl-10 {
    padding-left: 2.5rem;
  }
  .mr-2 {
    margin-right: 0.5rem;
  }

  .relative {
    position: relative;
  }
  .absolute {
    position: absolute;
  }
  .left-3 {
    left: 0.75rem;
  }
  .top-1\/2 {
    top: 50%;
  }
  .-translate-y-1\/2 {
    transform: translateY(-50%);
  }

  .text-center {
    text-align: center;
  }
  .text-left {
    text-align: left;
  }
  .block {
    display: block;
  }

  .lg-text {
    font-size: 1.5rem;
    padding: 10px;
    padding-left: 2.5rem;
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
  .text-xs {
    font-size: 0.75rem;
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
  .text-2xl {
    font-size: 1.5rem;
  }
  .text-3xl {
    font-size: 1.875rem;
  }
  .text-6xl {
    font-size: 3.75rem;
  }

  .border-none {
    border: none;
  }
  .border-t-2 {
    border-top: 2px solid #111;
  }
  .border-t-3 {
    border-top: 3px solid #111;
  }
  .border-b-4 {
    border-bottom: 4px solid #111;
  }
  .border-3 {
    border: 3px solid #111;
  }
  .border-4 {
    border: 4px solid #111;
  }
  .border-black {
    border-color: #111;
  }
  .border-white {
    border-color: #fff;
  }
  .border-dashed {
    border-style: dashed;
  }

  .huge {
    font-size: 4rem;
    font-weight: 900;
  }
  .line-height-1 {
    line-height: 1;
  }
  .target-hover:hover {
    transform: scale(1.03);
  }
  .highlight {
    color: #ff4b4b;
    text-shadow: 4px 4px 0px rgba(0, 0, 0, 0.1);
  }
  .drop-shadow-white {
    text-shadow: 4px 4px 0px #fff;
  }
  .text-pink {
    color: #ff4b4b;
  }
  .text-cyan {
    color: #00ffff;
  }
  .text-green-dark {
    color: #00994c;
  }
  .text-white {
    color: #fff;
  }
  .text-black {
    color: #111;
  }
  .opacity-90 {
    opacity: 0.9;
  }
  .opacity-80 {
    opacity: 0.8;
  }
  .opacity-70 {
    opacity: 0.7;
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
  .bg-green {
    background-color: #00e572;
  }
  .bg-white {
    background-color: #fff;
  }
  .bg-black {
    background-color: #111;
  }
  .bg-disabled {
    background-color: #eee;
    color: #888;
    cursor: not-allowed;
  }

  .details-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .grid {
    display: grid;
  }
  .grid-cols-2 {
    grid-template-columns: 1fr 1fr;
  }

  .rotate-90 {
    transform: rotate(90deg);
  }
  .transition-all {
    transition: all 0.2s;
  }
  .cursor-pointer {
    cursor: pointer;
  }

  .brutal-shadow {
    box-shadow: 4px 4px 0px #111;
    transition: transform 0.1s;
  }
  .brutal-shadow-sm {
    box-shadow: 3px 3px 0px #111;
  }

  .input-with-addon {
    display: flex;
    border: 3px solid #111;
  }
  .input-with-addon .addon {
    padding: 0 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 3px solid #111;
    white-space: nowrap;
  }
  .input-with-addon input {
    border: none;
    outline: none;
    padding: 6px 2px;
    background: #fff;
    flex: 1;
    min-width: 0;
    width: 100%;
  }
  .input-with-addon input::-webkit-outer-spin-button,
  .input-with-addon input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    appearance: none;
    margin: 0;
  }
  .input-with-addon input[type='number'] {
    -moz-appearance: textfield;
    appearance: textfield;
  }
  .input-with-addon input:focus {
    background: #fffbe6;
  }

  @media (max-width: 768px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .grid-cols-2 {
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
  [data-theme='dark'] .bg-disabled {
    background-color: #333;
    color: #666;
  }
  [data-theme='dark'] .text-cyan {
    color: #00ffff;
  }
  [data-theme='dark'] .text-pink {
    color: #ff6b6b;
  }
  [data-theme='dark'] .text-green-dark {
    color: #4ade80;
  }
  [data-theme='dark'] .text-black {
    color: #eee;
  }
  [data-theme='dark'] .highlight {
    color: #ff6b6b;
    text-shadow: 4px 4px 0px #111;
  }
  [data-theme='dark'] .drop-shadow-white {
    text-shadow: 4px 4px 0px #333;
  }
  [data-theme='dark'] .border-black,
  [data-theme='dark'] .border-t-2,
  [data-theme='dark'] .border-t-3,
  [data-theme='dark'] .border-b-4,
  [data-theme='dark'] .border-3,
  [data-theme='dark'] .border-4 {
    border-color: #eee;
  }
  [data-theme='dark'] .input-with-addon {
    border-color: #eee;
  }
  [data-theme='dark'] .input-with-addon .addon {
    border-color: #eee;
    background: #333;
    color: #eee;
  }
  [data-theme='dark'] .input-with-addon input {
    background: #1a1a1a;
    color: #eee;
  }
  [data-theme='dark'] .input-with-addon input:focus {
    background: #2a2a2a;
  }
  [data-theme='dark'] .brutal-shadow,
  [data-theme='dark'] .brutal-shadow-sm {
    box-shadow: 3px 3px 0px #eee;
  }
</style>
