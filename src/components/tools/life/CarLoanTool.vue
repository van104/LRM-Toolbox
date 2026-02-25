<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">车贷<span>.计算()</span></h1>
        <button class="brutal-btn clear-btn" @click="reset">重置</button>
      </header>

      <div class="brutal-grid main-layout">
        <div class="brutal-pane form-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">贷款参数</span>
          </div>
          <div class="form-body">
            <div class="form-grid">
              <div class="form-item">
                <label class="brutal-label">车辆总价 (元)</label>
                <input
                  v-model.number="carPrice"
                  type="number"
                  class="brutal-input full"
                  :min="0"
                  :step="10000"
                  @input="calculate"
                />
              </div>
              <div class="form-item">
                <label class="brutal-label">首付比例 (%)</label>
                <input
                  v-model.number="downPaymentPct"
                  type="number"
                  class="brutal-input full"
                  :min="0"
                  :max="100"
                  @input="calculate"
                />
                <div class="sub-label">首付金额: ¥ {{ downPaymentAmount.toLocaleString() }}</div>
              </div>
              <div class="form-item">
                <label class="brutal-label">贷款期限 (月)</label>
                <select v-model.number="loanTerm" class="brutal-select full" @change="calculate">
                  <option :value="12">12个月 (1年)</option>
                  <option :value="24">24个月 (2年)</option>
                  <option :value="36">36个月 (3年)</option>
                  <option :value="48">48个月 (4年)</option>
                  <option :value="60">60个月 (5年)</option>
                </select>
              </div>
              <div class="form-item">
                <label class="brutal-label">年利率 (%)</label>
                <input
                  v-model.number="annualRate"
                  type="number"
                  class="brutal-input full"
                  :min="0"
                  :max="20"
                  :step="0.01"
                  @input="calculate"
                />
              </div>
            </div>

            <div class="repay-toggle">
              <label class="brutal-label">还款方式</label>
              <div class="toggle-btns">
                <button
                  class="brutal-action-btn"
                  :class="{ primary: repaymentType === 'matching' }"
                  @click="
                    repaymentType = 'matching';
                    calculate();
                  "
                >
                  等额本息
                </button>
                <button
                  class="brutal-action-btn"
                  :class="{ primary: repaymentType === 'fixed' }"
                  @click="
                    repaymentType = 'fixed';
                    calculate();
                  "
                >
                  等额本金
                </button>
              </div>
            </div>
          </div>

          <!-- Results -->
          <div class="result-section">
            <div class="primary-result bg-yellow">
              <span class="result-label">每月还款 (月供)</span>
              <span v-if="repaymentType === 'matching'" class="result-value">
                ¥ {{ result.monthlyPayment.toFixed(2) }}
              </span>
              <span v-else class="result-value">
                ¥ {{ result.firstMonthPayment.toFixed(2) }}
                <small>(首月)</small>
              </span>
            </div>
            <div class="detail-boxes">
              <div class="d-box">
                <span class="d-label">贷款总额</span>
                <span class="d-value">¥ {{ loanAmount.toLocaleString() }}</span>
              </div>
              <div class="d-box">
                <span class="d-label">利息总额</span>
                <span class="d-value interest">¥ {{ result.totalInterest.toFixed(2) }}</span>
              </div>
              <div class="d-box">
                <span class="d-label">累计支付</span>
                <span class="d-value">
                  ¥ {{ (loanAmount + result.totalInterest).toFixed(2) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Schedule -->
          <div class="schedule-section">
            <div class="schedule-header">
              <span class="brutal-label">还款计划表</span>
              <button class="brutal-action-btn" @click="showSchedule = !showSchedule">
                {{ showSchedule ? '收起' : '展开' }}
              </button>
            </div>
            <div v-if="showSchedule" class="table-wrapper">
              <table class="brutal-table">
                <thead>
                  <tr>
                    <th>期次</th>
                    <th>偿还本息</th>
                    <th>偿还本金</th>
                    <th>偿还利息</th>
                    <th>剩余本金</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in result.schedule" :key="item.period">
                    <td>第 {{ item.period }} 期</td>
                    <td>{{ item.payment.toFixed(2) }}</td>
                    <td>{{ item.principal.toFixed(2) }}</td>
                    <td>{{ item.interest.toFixed(2) }}</td>
                    <td>{{ Math.max(0, item.remaining).toFixed(2) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="side-column">
          <div class="brutal-pane">
            <div class="pane-header bg-green">
              <span>名词解释</span>
            </div>
            <div class="term-body">
              <div class="term-box">
                <strong>等额本息:</strong>
                <p>每月还款额固定。前期利息占比大、本金占比小。适合收入稳定的群体。</p>
              </div>
              <div class="term-box">
                <strong>等额本金:</strong>
                <p>每月偿还本金固定，利息递减。前期还款压力大，总利息支出更少。</p>
              </div>
            </div>
          </div>

          <div class="brutal-pane">
            <div class="pane-header bg-yellow">
              <span>温馨提示</span>
            </div>
            <ul class="brutal-list">
              <li><b>购车成本</b>：除裸车价外，还需考虑保险、购置税、上牌费约 10% 额外开支。</li>
              <li><b>贷款策略</b>：若有厂家贴息，往往能获得 0 利率或较低利率。</li>
              <li><b>合理负债</b>：建议月供不超过家庭月收入的 30%。</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="brutal-status info">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i">© 2026 LRM工具箱 - 汽车贷款计算器 // &nbsp;</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const carPrice = ref(150000);
  const downPaymentPct = ref(30);
  const loanTerm = ref(36);
  const annualRate = ref(4.5);
  const repaymentType = ref('matching');
  const showSchedule = ref(false);

  const downPaymentAmount = computed(() => (carPrice.value * downPaymentPct.value) / 100);
  const loanAmount = computed(() => carPrice.value - downPaymentAmount.value);

  const result = ref({
    monthlyPayment: 0,
    firstMonthPayment: 0,
    totalInterest: 0,
    schedule: []
  });

  const calculate = () => {
    const L = loanAmount.value;
    const n = loanTerm.value;
    const i = annualRate.value / 100 / 12;

    if (L <= 0) return;

    const schedule = [];
    let totalInterest = 0;

    if (repaymentType.value === 'matching') {
      const monthlyPayment = (L * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
      let remaining = L;

      for (let p = 1; p <= n; p++) {
        const interest = remaining * i;
        const principal = monthlyPayment - interest;
        remaining -= principal;
        schedule.push({ period: p, payment: monthlyPayment, principal, interest, remaining });
        totalInterest += interest;
      }

      result.value = { monthlyPayment, firstMonthPayment: 0, totalInterest, schedule };
    } else {
      const principalPerMonth = L / n;
      let remaining = L;
      let firstMonthPayment = 0;

      for (let p = 1; p <= n; p++) {
        const interest = remaining * i;
        const payment = principalPerMonth + interest;
        if (p === 1) firstMonthPayment = payment;
        remaining -= principalPerMonth;
        schedule.push({
          period: p,
          payment,
          principal: principalPerMonth,
          interest,
          remaining
        });
        totalInterest += interest;
      }

      result.value = { monthlyPayment: 0, firstMonthPayment, totalInterest, schedule };
    }
  };

  const reset = () => {
    carPrice.value = 150000;
    downPaymentPct.value = 30;
    loanTerm.value = 36;
    annualRate.value = 4.5;
    calculate();
  };

  onMounted(() => {
    calculate();
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
    max-width: 1400px;
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
    grid-template-columns: 1fr 360px;
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
    font-size: 1.15rem;
    letter-spacing: 1px;
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
    margin-bottom: 1.5rem;
  }

  .form-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .brutal-label {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1rem;
  }

  .brutal-input {
    border: 3px solid #111;
    padding: 0.6rem 0.8rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 1rem;
    background: #fff;
    box-shadow: 3px 3px 0px #111;
    outline: none;
  }

  .brutal-select {
    border: 3px solid #111;
    padding: 0.6rem 0.8rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 1rem;
    background: #ffd900;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    outline: none;
  }

  .full {
    width: 100%;
    box-sizing: border-box;
  }

  .sub-label {
    font-size: 0.8rem;
    color: #555;
    font-weight: 600;
  }

  .repay-toggle {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .toggle-btns {
    display: flex;
    gap: 1rem;
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

  /* Results */
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

  .result-value small {
    font-size: 0.7em;
    opacity: 0.7;
  }

  .detail-boxes {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    padding: 1.5rem;
  }

  .d-box {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .d-label {
    font-size: 0.8rem;
    color: #555;
    font-weight: 600;
  }

  .d-value {
    font-size: 1rem;
    font-weight: 700;
    color: #111;
  }

  .d-value.interest {
    color: #ffd900;
    -webkit-text-stroke: 0.5px #111;
  }

  /* Schedule */
  .schedule-section {
    border-top: 4px solid #111;
    padding: 1.5rem;
  }

  .schedule-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .table-wrapper {
    max-height: 400px;
    overflow-y: auto;
    border: 3px solid #111;
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
    position: sticky;
    top: 0;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    border-bottom: 3px solid #111;
  }

  .brutal-table td {
    padding: 0.75rem;
    border-bottom: 1px solid #eee;
  }

  .brutal-table tbody tr:hover {
    background: #fdfae5;
  }

  /* Sidebar */
  .side-column {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .term-body {
    padding: 1.5rem;
  }

  .term-box {
    margin-bottom: 1.5rem;
  }

  .term-box strong {
    display: block;
    font-size: 0.95rem;
    color: #4b7bff;
    margin-bottom: 4px;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
  }

  .term-box p {
    font-size: 0.85rem;
    color: #555;
    line-height: 1.6;
    margin: 0;
    font-weight: 500;
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

  /* Status Bar */
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

  .brutal-status.info {
    background: #fff;
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

  /* Responsive */
  @media (max-width: 1024px) {
    .brutal-title {
      font-size: 2rem;
    }
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
  }

  /* --- Dark Mode --- */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-status,
  [data-theme='dark'] .brutal-status.info,
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

  [data-theme='dark'] .brutal-input {
    background: #222;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
    color: #eee;
  }

  [data-theme='dark'] .brutal-select {
    background: #b28f00;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
    color: #fff;
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

  [data-theme='dark'] .result-section {
    border-top-color: #eee;
  }
  [data-theme='dark'] .primary-result {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .result-value {
    color: #ff9fb2;
  }

  [data-theme='dark'] .schedule-section {
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
  [data-theme='dark'] .brutal-table tbody tr:hover {
    background: #222;
  }

  [data-theme='dark'] .sub-label,
  [data-theme='dark'] .d-label {
    color: #aaa;
  }
  [data-theme='dark'] .d-value {
    color: #eee;
  }
  [data-theme='dark'] .d-value.interest {
    color: #ffd900;
    -webkit-text-stroke: 0;
  }

  [data-theme='dark'] .term-box strong {
    color: #89b4f8;
  }
  [data-theme='dark'] .term-box p {
    color: #aaa;
  }

  [data-theme='dark'] .brutal-list li {
    color: #ccc;
  }
</style>
