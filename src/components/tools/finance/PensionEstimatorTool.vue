<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">养老金<span>.估算()</span></h1>
        <div style="width: 100px"></div>
      </header>

      <main
        class="flex justify-center"
        style="max-width: 1200px; width: 100%; margin: 0 auto; padding-bottom: 2rem"
      >
        <div class="center-card w-full">
          <div class="brutal-grid">
            <div class="left-column">
              <section class="brutal-pane mb-6 bg-white">
                <h2 class="pane-title mb-4">个人信息.INFO</h2>
                <div class="form-grid">
                  <div class="form-group flex-1">
                    <label class="form-label">当前年龄 (岁)</label>
                    <div class="input-with-btns">
                      <button
                        class="adj-btn border-r-3"
                        @click="currentAge = Math.max(18, (currentAge || 18) - 1)"
                      >
                        -
                      </button>
                      <input
                        v-model.number="currentAge"
                        type="number"
                        min="18"
                        max="65"
                        class="brutal-input flex-1 text-center"
                      />
                      <button
                        class="adj-btn border-l-3 bg-yellow"
                        @click="currentAge = Math.min(65, (currentAge || 18) + 1)"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div class="form-group flex-1">
                    <label class="form-label">预计退休年龄 (岁)</label>
                    <select v-model.number="retirementAge" class="brutal-input w-full">
                      <option :value="50">50岁 (女工人)</option>
                      <option :value="55">55岁 (女干部)</option>
                      <option :value="60">60岁 (男职工)</option>
                      <option :value="65">65岁 (延迟退休)</option>
                    </select>
                  </div>
                  <div class="form-group flex-1">
                    <label class="form-label">当前月收入 (¥)</label>
                    <div class="input-with-btns">
                      <button
                        class="adj-btn border-r-3"
                        @click="salary = Math.max(0, (salary || 0) - 1000)"
                      >
                        -
                      </button>
                      <input
                        v-model.number="salary"
                        type="number"
                        min="0"
                        step="1000"
                        class="brutal-input flex-1 text-center"
                      />
                      <button
                        class="adj-btn border-l-3 bg-yellow"
                        @click="salary = (salary || 0) + 1000"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <h2 class="pane-title mt-8 mb-4">社保基数.BASE</h2>
                <div class="form-grid">
                  <div class="form-group flex-1">
                    <label class="form-label">个人账户余额 (¥)</label>
                    <div class="input-with-btns">
                      <button
                        class="adj-btn border-r-3"
                        @click="accountBalance = Math.max(0, (accountBalance || 0) - 5000)"
                      >
                        -
                      </button>
                      <input
                        v-model.number="accountBalance"
                        type="number"
                        min="0"
                        step="5000"
                        class="brutal-input flex-1 text-center"
                      />
                      <button
                        class="adj-btn border-l-3 bg-yellow"
                        @click="accountBalance = (accountBalance || 0) + 5000"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div class="form-group flex-1">
                    <label class="form-label">已缴费年限 (年)</label>
                    <div class="input-with-btns">
                      <button
                        class="adj-btn border-r-3"
                        @click="paidYears = Math.max(0, (paidYears || 0) - 1)"
                      >
                        -
                      </button>
                      <input
                        v-model.number="paidYears"
                        type="number"
                        min="0"
                        max="45"
                        class="brutal-input flex-1 text-center"
                      />
                      <button
                        class="adj-btn border-l-3 bg-yellow"
                        @click="paidYears = Math.min(45, (paidYears || 0) + 1)"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div class="form-group flex-1">
                    <label class="form-label">当地社会平均月薪 (¥)</label>
                    <div class="input-with-btns">
                      <button
                        class="adj-btn border-r-3"
                        @click="avgSocialSalary = Math.max(3000, (avgSocialSalary || 3000) - 500)"
                      >
                        -
                      </button>
                      <input
                        v-model.number="avgSocialSalary"
                        type="number"
                        min="3000"
                        step="500"
                        class="brutal-input flex-1 text-center"
                      />
                      <button
                        class="adj-btn border-l-3 bg-yellow"
                        @click="avgSocialSalary = (avgSocialSalary || 3000) + 500"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div class="right-column">
              <section
                v-if="result"
                class="brutal-pane bg-yellow h-full flex-col items-center justify-center p-8"
              >
                <div class="text-center w-full">
                  <h3 class="font-bold text-lg mb-2 border-b-3 border-black pb-2">
                    退休预计每月领取金额
                  </h3>
                  <div class="value huge highlight font-mono font-black my-4">
                    <span class="text-3xl mr-2">¥</span>{{ formatMoney(result.totalMonthly) }}
                  </div>
                  <div class="mt-4 badge tracking-wide border-black p-2 bg-white inline-block">
                    养老金替代率：<strong>{{ result.replaceRate }}%</strong>
                  </div>
                </div>

                <div class="details-grid w-full mt-8 border-t-4 border-black pt-6">
                  <div
                    class="detail-item bg-white border-3 border-black brutal-shadow p-3 text-center"
                  >
                    <span class="block text-sm font-bold mb-1">基础养老金</span>
                    <span class="block font-mono font-black text-xl"
                      >¥ {{ formatMoney(result.basePension) }}</span
                    >
                  </div>
                  <div
                    class="detail-item bg-white border-3 border-black brutal-shadow p-3 text-center bg-cyan"
                  >
                    <span class="block text-sm font-bold mb-1">个人账户养老金</span>
                    <span class="block font-mono font-black text-xl"
                      >¥ {{ formatMoney(result.accountPension) }}</span
                    >
                  </div>
                </div>
              </section>

              <section
                v-else
                class="brutal-pane bg-pink text-white h-full flex-col items-center justify-center p-8 text-center border-dashed border-4 border-black"
              >
                <div class="text-6xl mb-4">👴</div>
                <h2 class="font-black text-2xl mb-2">想要安度晚年？</h2>
                <p class="font-bold opacity-90">请在左侧填写您的社保与薪资信息</p>
              </section>
            </div>
          </div>

          <section class="brutal-pane bg-cyan p-4 mt-6">
            <h4 class="font-bold mb-2 text-lg">⚠️ 估算模型说明</h4>
            <div
              class="text-sm border-l-4 border-black pl-3 font-bold bg-white p-3 border-r-4 brutal-shadow-sm leading-relaxed"
            >
              <p>
                👉 <strong>基础养老金：</strong>基于计发基数、个人平均缴费指数和缴费年限综合计算。
              </p>
              <p>
                👉 <strong>个人账户养老金：</strong>个人账户总额 ÷
                计发月数（60岁为139个月，55岁为170个月）。
              </p>
              <p class="text-pink mt-2">
                * 本模型基于静态数据估算，未考虑未来通胀、工资普调因素，结果仅供财务规划参考！
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch } from 'vue';

  const currentAge = ref(30);
  const retirementAge = ref(60);
  const salary = ref(10000);
  const accountBalance = ref(50000);
  const paidYears = ref(5);
  const avgSocialSalary = ref(8000);

  const result = ref(null);

  const calculate = () => {
    if (!salary.value || !avgSocialSalary.value) return;

    const index = salary.value / avgSocialSalary.value;
    const clampedIndex = Math.min(Math.max(index, 0.6), 3.0);

    const yearsToWork = Math.max(0, retirementAge.value - currentAge.value);
    const totalPaidYears = paidYears.value + yearsToWork;

    const basePension =
      ((avgSocialSalary.value + avgSocialSalary.value * clampedIndex) / 2) * totalPaidYears * 0.01;

    const monthlyContribution = salary.value * 0.08;
    const futureAccumulation = monthlyContribution * 12 * yearsToWork;
    const finalAccountBalance = accountBalance.value + futureAccumulation;

    const monthsMap = { 50: 195, 55: 170, 60: 139, 65: 101 };
    const months = monthsMap[retirementAge.value] || 139;

    const accountPension = finalAccountBalance / months;
    const totalMonthly = basePension + accountPension;
    const replaceRate = salary.value > 0 ? ((totalMonthly / salary.value) * 100).toFixed(1) : '0';

    result.value = {
      totalMonthly,
      basePension,
      accountPension,
      replaceRate
    };
  };

  const formatMoney = val =>
    val.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  watch(
    [currentAge, retirementAge, salary, accountBalance, paidYears, avgSocialSalary],
    () => {
      calculate();
    },
    { immediate: true }
  );
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
  .center-card {
    max-width: 1000px;
    margin: 0 auto;
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
    flex-wrap: wrap;
    gap: 1rem;
  }

  .form-label {
    display: block;
    font-size: 0.95rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    color: #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
  }

  .brutal-input::-webkit-outer-spin-button,
  .brutal-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    appearance: none;
    margin: 0;
  }
  .brutal-input[type='number'] {
    -moz-appearance: textfield;
    appearance: textfield;
  }

  .flex {
    display: flex;
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
  .flex-1 {
    flex: 1;
    min-width: 140px;
  }
  .w-full {
    width: 100%;
    min-width: 0;
  }
  .h-full {
    height: 100%;
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
  .mt-4 {
    margin-top: 1rem;
  }
  .mt-6 {
    margin-top: 1.5rem;
  }
  .mt-8 {
    margin-top: 2rem;
  }
  .my-4 {
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
  .pb-2 {
    padding-bottom: 0.5rem;
  }
  .pt-6 {
    padding-top: 1.5rem;
  }
  .p-2 {
    padding: 0.5rem;
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
  .pl-3 {
    padding-left: 0.75rem;
  }
  .mr-2 {
    margin-right: 0.5rem;
  }

  .text-center {
    text-align: center;
  }
  .block {
    display: block;
  }
  .inline-block {
    display: inline-block;
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
  .text-2xl {
    font-size: 1.5rem;
  }
  .text-3xl {
    font-size: 1.875rem;
  }
  .text-6xl {
    font-size: 3.75rem;
  }
  .leading-relaxed {
    line-height: 1.625;
  }
  .tracking-wide {
    letter-spacing: 0.05em;
  }

  .border-b-3 {
    border-bottom: 3px solid #111;
  }
  .border-t-4 {
    border-top: 4px solid #111;
  }
  .border-l-4 {
    border-left: 4px solid #111;
  }
  .border-r-4 {
    border-right: 4px solid #111;
  }
  .border-3 {
    border: 3px solid #111;
  }
  .border-4 {
    border: 4px solid #111;
  }
  .border-r-3 {
    border-right: 3px solid #111;
  }
  .border-l-3 {
    border-left: 3px solid #111;
  }
  .border-black {
    border-color: #111;
  }
  .border-dashed {
    border-style: dashed;
  }

  .huge {
    font-size: 4rem;
    font-weight: 900;
    line-height: 1;
  }
  .highlight {
    color: #ff4b4b;
    text-shadow: 4px 4px 0px rgba(0, 0, 0, 0.1);
  }
  .text-pink {
    color: #ff4b4b;
  }
  .text-white {
    color: #fff;
  }
  .opacity-90 {
    opacity: 0.9;
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

  .input-with-btns {
    display: flex;
    border: 3px solid #111;
    background: #fff;
  }
  .input-with-btns .brutal-input {
    border: none;
    padding-left: 0;
    padding-right: 0;
  }
  .input-with-btns .brutal-input:focus {
    outline: none;
    box-shadow: inset 0 0 0 2px #111;
  }
  .adj-btn {
    width: 2.5rem;
    background: #ff4b4b;
    color: #fff;
    font-size: 1.5rem;
    font-weight: 900;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.1s;
  }
  .adj-btn.bg-yellow {
    background: #ffd900;
    color: #111;
  }
  .adj-btn:active {
    transform: scale(0.9);
  }

  .details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .badge {
    border: 2px solid #111;
    font-weight: 800;
    font-size: 0.95rem;
    box-shadow: 2px 2px 0px #111;
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
  [data-theme='dark'] .text-pink {
    color: #ff6b6b;
  }
  [data-theme='dark'] .highlight {
    color: #ff6b6b;
    text-shadow: 4px 4px 0px #111;
  }
  [data-theme='dark'] .border-black,
  [data-theme='dark'] .border-t-4,
  [data-theme='dark'] .border-b-3,
  [data-theme='dark'] .border-3,
  [data-theme='dark'] .border-4,
  [data-theme='dark'] .border-l-4,
  [data-theme='dark'] .border-r-4,
  [data-theme='dark'] .border-l-3,
  [data-theme='dark'] .border-r-3 {
    border-color: #eee;
  }
  [data-theme='dark'] .input-with-btns .brutal-input {
    background: #1a1a1a;
  }
  [data-theme='dark'] .adj-btn {
    background: #cc0000;
  }
  [data-theme='dark'] .adj-btn.bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .brutal-shadow,
  [data-theme='dark'] .brutal-shadow-sm,
  [data-theme='dark'] .badge {
    box-shadow: 3px 3px 0px #eee;
  }
</style>
