<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">房贷<span>.专业版()</span></h1>
        <div style="width: 100px"></div>
      </header>

      <main class="brutal-grid">
        <div class="left-column">
          <section class="brutal-pane bg-white mb-6">
            <h2 class="pane-title mb-4">贷款方案.PARAMS</h2>

            <div class="mode-tabs brutal-shadow mb-6">
              <button
                class="tab-btn"
                :class="{ active: loanType === 'commercial' }"
                @click="loanType = 'commercial'"
              >
                商业贷款
              </button>
              <button
                class="tab-btn"
                :class="{ active: loanType === 'fund' }"
                @click="loanType = 'fund'"
              >
                公积金贷款
              </button>
              <button
                class="tab-btn"
                :class="{ active: loanType === 'combination' }"
                @click="loanType = 'combination'"
              >
                组合贷款
              </button>
            </div>

            <div class="form-grid">
              <div v-if="loanType !== 'fund'" class="form-group">
                <label class="form-label">商贷金额 (万元)</label>
                <input
                  v-model.number="commercialAmt"
                  type="number"
                  min="0"
                  step="10"
                  class="brutal-input w-full"
                  placeholder="输入商贷金额"
                />
              </div>
              <div v-if="loanType !== 'commercial'" class="form-group">
                <label class="form-label">公积金金额 (万元)</label>
                <input
                  v-model.number="fundAmt"
                  type="number"
                  min="0"
                  step="10"
                  class="brutal-input w-full"
                  placeholder="输入公积金金额"
                />
              </div>

              <div class="form-group">
                <label class="form-label">按揭年限</label>
                <select v-model.number="years" class="brutal-input w-full">
                  <option v-for="y in 30" :key="y" :value="y">{{ y }}年 ({{ y * 12 }}期)</option>
                </select>
              </div>

              <div
                v-if="loanType !== 'fund'"
                class="form-group mt-4 p-4 border-3 border-black bg-cyan brutal-shadow-sm"
              >
                <label class="form-label">商贷利率 LPR基准 (%)</label>
                <input
                  v-model.number="commercialRate"
                  type="number"
                  step="0.01"
                  class="brutal-input w-full mb-2 font-mono"
                />

                <div class="flex items-center gap-2 mt-2 flex-wrap">
                  <span class="font-bold text-sm">LPR</span>
                  <input
                    v-model.number="lprBase"
                    type="number"
                    step="0.05"
                    class="brutal-input w-24 text-center font-mono py-1"
                  />
                  <span class="font-bold text-sm">+</span>
                  <input
                    v-model.number="bp"
                    type="number"
                    step="1"
                    class="brutal-input w-24 text-center font-mono py-1"
                  />
                  <span class="font-bold text-sm">BP</span>
                  <button
                    class="brutal-btn small-btn ml-auto bg-black text-white"
                    @click="applyLpr"
                  >
                    计算应用
                  </button>
                </div>
              </div>

              <div v-if="loanType !== 'commercial'" class="form-group mt-4">
                <label class="form-label">公积金利率 (%)</label>
                <input
                  v-model.number="fundRate"
                  type="number"
                  step="0.01"
                  class="brutal-input w-full mb-2 font-mono"
                />
                <div class="flex gap-2 text-sm font-bold">
                  <button class="brutal-btn px-2 py-1 bg-white" @click="fundRate = 2.85">
                    首套 2.85%
                  </button>
                  <button class="brutal-btn px-2 py-1 bg-white" @click="fundRate = 3.325">
                    二套 3.325%
                  </button>
                </div>
              </div>
            </div>

            <button
              class="calc-btn brutal-btn w-full mt-6 bg-yellow font-black text-xl py-4 border-4"
              @click="calculateAll"
            >
              🚀 开始专业对比测算
            </button>
          </section>
        </div>

        <div class="right-column">
          <section v-if="hasResult" class="brutal-pane bg-white h-full flex-col">
            <h2 class="pane-title mb-4">还款对比分析.ANALYSIS</h2>

            <div class="flex gap-4 mb-6">
              <div
                class="comp-card flex-1 border-4 border-black p-4 cursor-pointer transition-all target-hover"
                :class="
                  activeMode === 'benxi'
                    ? 'bg-yellow shadow-solid translate-x-y'
                    : 'bg-white brutal-shadow-sm'
                "
                @click="activeMode = 'benxi'"
              >
                <h3 class="font-black text-xl mb-1">等额本息</h3>
                <p class="text-xs font-bold opacity-80 mb-2">每月还款固定，本金递增，利息递减</p>
                <div class="font-mono text-2xl font-black text-pink">
                  ¥ {{ formatMoney(results.benxi.monthlyPayment) }}
                </div>
                <div class="text-sm font-bold mt-2 pt-2 border-t-3 border-black border-dashed">
                  总利息: {{ formatMoney(results.benxi.totalInterest / 10000) }} 万
                </div>
              </div>

              <div
                class="comp-card flex-1 border-4 border-black p-4 cursor-pointer transition-all target-hover"
                :class="
                  activeMode === 'benjin'
                    ? 'bg-cyan shadow-solid translate-x-y'
                    : 'bg-white brutal-shadow-sm'
                "
                @click="activeMode = 'benjin'"
              >
                <h3 class="font-black text-xl mb-1">等额本金</h3>
                <p class="text-xs font-bold opacity-80 mb-2">每月还本固定，利息随本金逐月递减</p>
                <div class="font-mono text-2xl font-black text-pink">
                  首月 ¥ {{ formatMoney(results.benjin.firstMonth) }}
                </div>
                <div class="text-sm font-bold mt-2 pt-2 border-t-3 border-black border-dashed">
                  总利息: {{ formatMoney(results.benjin.totalInterest / 10000) }} 万
                </div>
              </div>
            </div>

            <div class="stat-grid grid grid-cols-3 gap-4 mb-6 text-center">
              <div class="stat-item bg-black text-white p-3 border-3 border-black brutal-shadow-sm">
                <div class="text-xs font-bold opacity-80 mb-1">还款总额 (万)</div>
                <div class="font-mono font-black text-xl">
                  ¥ {{ formatMoney(currentResult.totalPayment / 10000) }}
                </div>
              </div>
              <div class="stat-item bg-pink text-white p-3 border-3 border-black brutal-shadow-sm">
                <div class="text-xs font-bold opacity-80 mb-1">累计利息 (万)</div>
                <div class="font-mono font-black text-xl">
                  ¥ {{ formatMoney(currentResult.totalInterest / 10000) }}
                </div>
              </div>
              <div class="stat-item bg-white p-3 border-3 border-black brutal-shadow-sm text-pink">
                <div class="text-xs font-bold opacity-80 mb-1 text-black">
                  {{ activeMode === 'benxi' ? '等比还款额' : '末月还款底线' }}
                </div>
                <div class="font-mono font-black text-xl">
                  ¥
                  {{
                    formatMoney(
                      activeMode === 'benxi'
                        ? currentResult.monthlyPayment
                        : currentResult.lastMonth
                    )
                  }}
                </div>
              </div>
            </div>

            <div class="mb-6">
              <div class="flex h-4 border-2 border-black w-full mb-2 bg-white">
                <div class="bg-black" :style="{ width: ratio.principal + '%' }"></div>
                <div class="bg-pink" :style="{ width: ratio.interest + '%' }"></div>
              </div>
              <div class="flex justify-between text-sm font-bold font-mono">
                <span>⬛ 本金 {{ ratio.principal }}%</span>
                <span class="text-pink">🟥 利息 {{ ratio.interest }}%</span>
              </div>
            </div>

            <h3 class="font-black text-lg mb-3 pb-2 border-b-3 border-black">还款计划明细</h3>
            <div
              class="table-container border-3 border-black brutal-shadow-sm flex-1 custom-scrollbar"
            >
              <table class="brutal-table w-full text-center border-collapse">
                <thead class="bg-yellow font-black border-b-3 border-black sticky top-0">
                  <tr>
                    <th class="p-2 border-r-3 border-black">期数</th>
                    <th class="p-2 border-r-3 border-black">月供金额(¥)</th>
                    <th class="p-2 border-r-3 border-black hidden-sm">本金</th>
                    <th class="p-2 border-r-3 border-black hidden-sm">利息</th>
                    <th class="p-2">剩余本金</th>
                  </tr>
                </thead>
                <tbody class="font-mono text-sm bg-white">
                  <tr
                    v-for="row in currentResult.schedule"
                    :key="row.index"
                    class="border-b-2 border-black font-bold"
                  >
                    <td class="p-2 border-r-2 border-black">{{ row.index }}</td>
                    <td class="p-2 border-r-2 border-black text-pink">
                      {{ formatMoney(row.payment) }}
                    </td>
                    <td class="p-2 border-r-2 border-black hidden-sm">
                      {{ formatMoney(row.principal) }}
                    </td>
                    <td class="p-2 border-r-2 border-black hidden-sm">
                      {{ formatMoney(row.interest) }}
                    </td>
                    <td class="p-2">{{ formatMoney(row.balance) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section
            v-else
            class="brutal-pane bg-pink text-white h-full flex-col items-center justify-center p-8 text-center border-dashed border-4 border-black"
          >
            <div class="text-6xl mb-4">🏠</div>
            <h2 class="font-black text-3xl mb-2">配置您的方案</h2>
            <p class="font-bold opacity-90 text-lg">
              输入您的贷款信息，<br />一键生成专业对比较为直观的还款计划曲线
            </p>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onMounted } from 'vue';

  const loanType = ref('commercial');
  const commercialAmt = ref(100);
  const fundAmt = ref(50);
  const years = ref(30);
  const commercialRate = ref(3.85);
  const fundRate = ref(2.85);
  const lprBase = ref(3.6);
  const bp = ref(25);
  const activeMode = ref('benxi');
  const hasResult = ref(false);

  const results = reactive({ benxi: null, benjin: null });

  const applyLpr = () => {
    commercialRate.value = lprBase.value + bp.value / 100;
  };

  const formatMoney = val =>
    val.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const calculateAll = () => {
    if (
      (loanType.value !== 'fund' && !commercialAmt.value) ||
      (loanType.value !== 'commercial' && !fundAmt.value)
    ) {
      alert('请输入有效的贷款金额');
      return;
    }

    const cAmt = loanType.value === 'fund' ? 0 : commercialAmt.value * 10000;
    const fAmt = loanType.value === 'commercial' ? 0 : fundAmt.value * 10000;
    const months = years.value * 12;
    const cMonthlyRate = commercialRate.value / 100 / 12;
    const fMonthlyRate = fundRate.value / 100 / 12;

    results.benxi = calcBenxi(cAmt, cMonthlyRate, fAmt, fMonthlyRate, months);
    results.benjin = calcBenjin(cAmt, cMonthlyRate, fAmt, fMonthlyRate, months);

    hasResult.value = true;
  };

  function calcBenxi(cAmt, cRate, fAmt, fRate, months) {
    const calc = (p, r, m) => {
      if (p === 0) return { monthly: 0, totalP: 0, totalI: 0, sch: [] };
      const x = Math.pow(1 + r, m);
      const monthly = (p * r * x) / (x - 1);
      const totalP = monthly * m;
      const totalI = totalP - p;
      return { monthly, totalP, totalI };
    };

    const cRes = calc(cAmt, cRate, months);
    const fRes = calc(fAmt, fRate, months);

    const totalMonthly = cRes.monthly + fRes.monthly;
    const totalInterest = cRes.totalI + fRes.totalI;
    const totalPayment = cAmt + fAmt + totalInterest;

    const schedule = [];
    let cBalance = cAmt;
    let fBalance = fAmt;
    for (let i = 1; i <= months; i++) {
      const ci = cBalance * cRate;
      const cp = cAmt === 0 ? 0 : cRes.monthly - ci;
      cBalance -= cp;

      const fi = fBalance * fRate;
      const fp = fAmt === 0 ? 0 : fRes.monthly - fi;
      fBalance -= fp;

      schedule.push({
        index: i,
        payment: (cAmt === 0 ? 0 : cRes.monthly) + (fAmt === 0 ? 0 : fRes.monthly),
        principal: cp + fp,
        interest: ci + fi,
        balance: Math.max(0, cBalance + fBalance)
      });
    }

    return { monthlyPayment: totalMonthly, totalInterest, totalPayment, schedule };
  }

  function calcBenjin(cAmt, cRate, fAmt, fRate, months) {
    const schedule = [];
    let totalInterest = 0;
    let cBalance = cAmt;
    let fBalance = fAmt;
    const cMp = cAmt / months;
    const fMp = fAmt / months;

    for (let i = 1; i <= months; i++) {
      const ci = cBalance * cRate;
      const fi = fBalance * fRate;
      const currentPayment = cMp + ci + fMp + fi;
      totalInterest += ci + fi;
      cBalance -= cMp;
      fBalance -= fMp;

      schedule.push({
        index: i,
        payment: currentPayment,
        principal: cMp + fMp,
        interest: ci + fi,
        balance: Math.max(0, cBalance + fBalance)
      });
    }

    return {
      firstMonth: schedule[0].payment,
      lastMonth: schedule[months - 1].payment,
      totalInterest,
      totalPayment: cAmt + fAmt + totalInterest,
      schedule
    };
  }

  const currentResult = computed(() =>
    activeMode.value === 'benxi' ? results.benxi : results.benjin
  );

  const ratio = computed(() => {
    if (!currentResult.value) return { principal: 0, interest: 0 };
    const total = currentResult.value.totalPayment;
    const p =
      (loanType.value === 'fund'
        ? fundAmt.value
        : loanType.value === 'commercial'
          ? commercialAmt.value
          : commercialAmt.value + fundAmt.value) * 10000;
    const pPercent = ((p / total) * 100).toFixed(1);
    return { principal: pPercent, interest: (100 - pPercent).toFixed(1) };
  });

  onMounted(() => calculateAll());
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

  .mode-tabs {
    display: flex;
    background: #111;
    border: 3px solid #111;
    gap: 0;
  }

  .tab-btn {
    flex: 1;
    border: none;
    border-right: 2px solid #333;
    background: transparent;
    color: #fff;
    padding: 10px;
    font-size: 1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    cursor: pointer;
    box-shadow: none;
  }
  .tab-btn:last-child {
    border-right: none;
  }
  .tab-btn.active {
    background: #ffd900;
    color: #111;
  }
  .tab-btn:hover:not(.active) {
    background: #333;
  }

  .small-btn {
    padding: 4px 12px;
    font-size: 0.85rem;
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
    min-width: 0;
  }
  .w-full {
    width: 100%;
    min-width: 0;
  }
  .w-24 {
    width: 6rem;
    min-width: 0;
    border: 2px solid #111;
  }
  .h-full {
    height: 100%;
  }
  .h-4 {
    height: 1.25rem;
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
  .mt-2 {
    margin-top: 0.5rem;
  }
  .mt-4 {
    margin-top: 1rem;
  }
  .mt-6 {
    margin-top: 1.5rem;
  }
  .pb-2 {
    padding-bottom: 0.5rem;
  }
  .pt-2 {
    padding-top: 0.5rem;
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
  .px-2 {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  .py-1 {
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
  }
  .py-4 {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
  .ml-auto {
    margin-left: auto;
  }
  .gap-2 {
    gap: 0.5rem;
  }
  .gap-4 {
    gap: 1rem;
  }

  .text-center {
    text-align: center;
  }
  .block {
    display: block;
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

  .border-t-3 {
    border-top: 3px solid #111;
  }
  .border-b-2 {
    border-bottom: 2px solid #111;
  }
  .border-b-3 {
    border-bottom: 3px solid #111;
  }
  .border-r-2 {
    border-right: 2px solid #111;
  }
  .border-r-3 {
    border-right: 3px solid #111;
  }
  .border-2 {
    border: 2px solid #111;
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
  .border-dashed {
    border-style: dashed;
  }
  .border-collapse {
    border-collapse: collapse;
  }

  .huge {
    font-size: 4rem;
    font-weight: 900;
    line-height: 1;
  }
  .text-pink {
    color: #ff4b4b;
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

  .shadow-solid {
    box-shadow: 6px 6px 0px #111;
  }
  .translate-x-y {
    transform: translate(-3px, -3px);
  }
  .target-hover:hover {
    transform: translate(-3px, -3px);
    box-shadow: 6px 6px 0px #111;
  }

  .grid {
    display: grid;
  }
  .grid-cols-3 {
    grid-template-columns: repeat(3, 1fr);
  }

  .table-container {
    max-height: 400px;
    overflow-y: auto;
  }

  .sticky {
    position: sticky;
  }
  .top-0 {
    top: 0;
    z-index: 5;
  }

  .brutal-shadow-sm {
    box-shadow: 3px 3px 0px #111;
    transition: transform 0.1s;
  }

  /* Scrollbar */
  .custom-scrollbar::-webkit-scrollbar {
    width: 12px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #fff;
    border-left: 3px solid #111;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #111;
  }

  @media (max-width: 768px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .grid-cols-3 {
      grid-template-columns: 1fr;
    }
    .flex.gap-4 {
      flex-direction: column;
    }
    .hidden-sm {
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
  [data-theme='dark'] .text-black {
    color: #eee;
  }
  [data-theme='dark'] .text-pink {
    color: #ff6b6b;
  }
  [data-theme='dark'] .border-black,
  [data-theme='dark'] .border-2,
  [data-theme='dark'] .border-3,
  [data-theme='dark'] .border-4,
  [data-theme='dark'] .border-t-3,
  [data-theme='dark'] .border-b-2,
  [data-theme='dark'] .border-b-3,
  [data-theme='dark'] .border-r-2,
  [data-theme='dark'] .border-r-3 {
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-shadow-sm,
  [data-theme='dark'] .shadow-solid,
  [data-theme='dark'] .target-hover:hover {
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .custom-scrollbar::-webkit-scrollbar-track {
    border-color: #eee;
  }
  [data-theme='dark'] .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #eee;
  }
</style>
