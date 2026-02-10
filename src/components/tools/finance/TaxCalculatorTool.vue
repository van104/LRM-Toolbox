<template>
  <div class="tax-calculator-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>个税计算器</h1>
        <span class="nav-subtitle">Income Tax Calculator</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="layout-grid">
        <section class="settings-panel glass-card">
          <div class="form-group">
            <label>税前月薪 (元)</label>
            <input v-model.number="salary" type="number" placeholder="0" class="main-input" />
          </div>

          <div class="form-group">
            <label>专项附加扣除 (元)</label>
            <input v-model.number="deduction" type="number" placeholder="0" class="sub-input" />
            <span class="tip">含子女教育、赡养老人、房租房贷等总额</span>
          </div>

          <div class="form-group">
            <label>起征点</label>
            <input v-model.number="threshold" type="number" disabled class="sub-input disabled" />
          </div>

          <div class="insurance-section">
            <div class="section-header" @click="showInsurance = !showInsurance">
              <span>五险一金设置 (个人部分)</span>
              <el-icon :class="{ rotate: showInsurance }">
                <ArrowRight />
              </el-icon>
            </div>

            <div v-if="showInsurance" class="insurance-form">
              <div class="ins-row">
                <label>社保基数</label>
                <input v-model.number="socialBase" type="number" placeholder="基数" />
              </div>
              <div class="ins-row">
                <label>公积金基数</label>
                <input v-model.number="fundBase" type="number" placeholder="基数" />
              </div>

              <div class="rate-grid">
                <div class="rate-item">
                  <span>养老</span>
                  <input v-model.number="rates.pension" type="number" />%
                </div>
                <div class="rate-item">
                  <span>医疗</span>
                  <input v-model.number="rates.medical" type="number" />%
                </div>
                <div class="rate-item">
                  <span>失业</span>
                  <input v-model.number="rates.unemployment" type="number" />%
                </div>
                <div class="rate-item">
                  <span>公积金</span>
                  <input v-model.number="rates.fund" type="number" />%
                </div>
              </div>
            </div>
          </div>

          <button class="calc-btn" @click="calculate">计算</button>
        </section>

        <section v-if="result" class="result-panel glass-card">
          <div class="result-header">
            <h2>¥{{ formatMoney(result.netSalary) }}</h2>
            <span>实发工资</span>
          </div>

          <div class="chart-bar-container">
            <div class="chart-bar">
              <div class="segment net" :style="{ width: getPercent(result.netSalary) + '%' }"></div>
              <div
                class="segment insurance"
                :style="{ width: getPercent(result.totalInsurance) + '%' }"
              ></div>
              <div class="segment tax" :style="{ width: getPercent(result.tax) + '%' }"></div>
            </div>
            <div class="legend">
              <span><i class="dot net"></i>实发</span>
              <span><i class="dot insurance"></i>五险一金</span>
              <span><i class="dot tax"></i>个税</span>
            </div>
          </div>

          <div class="detail-list">
            <div class="detail-row">
              <span class="label">个人所得税</span>
              <span class="value text-danger">{{ formatMoney(result.tax) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">五险一金总项</span>
              <span class="value text-warning">{{ formatMoney(result.totalInsurance) }}</span>
            </div>
            <div class="detail-sub text-muted">
              <div class="sub-row">养老: {{ formatMoney(result.details.pension) }}</div>
              <div class="sub-row">医疗: {{ formatMoney(result.details.medical) }}</div>
              <div class="sub-row">失业: {{ formatMoney(result.details.unemployment) }}</div>
              <div class="sub-row">公积金: {{ formatMoney(result.details.fund) }}</div>
            </div>
          </div>
        </section>

        <section v-else class="result-panel glass-card empty-state">
          <div class="empty-content">
            <el-icon>
              <Money />
            </el-icon>
            <p>输入金额开始计算</p>
          </div>
        </section>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 个税计算器</footer>
  </div>
</template>

<script setup>
  import { ref, watch } from 'vue';
  import { Back, ArrowRight, Money } from '@element-plus/icons-vue';

  const salary = ref('');
  const deduction = ref(0);
  const threshold = ref(5000);

  const showInsurance = ref(false);
  const socialBase = ref('');
  const fundBase = ref('');

  const rates = ref({
    pension: 8,
    medical: 2,
    unemployment: 0.5,
    fund: 7
  });

  watch(salary, val => {
    if (val && !socialBase.value) socialBase.value = val;
    if (val && !fundBase.value) fundBase.value = val;
  });

  const result = ref(null);

  const calculate = () => {
    const s = parseFloat(salary.value) || 0;
    const sBase = parseFloat(socialBase.value) || 0;
    const fBase = parseFloat(fundBase.value) || 0;

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

  const formatMoney = val => {
    if (val === undefined) return '0.00';
    return val.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getPercent = val => {
    if (!salary.value) return 0;
    return (val / salary.value) * 100;
  };
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

  .tax-calculator-tool {
    --bg: #faf9f7;
    --card: #ffffff;
    --border: #e8e6e3;
    --text: #1a1a1a;
    --text-2: #6b6b6b;
    --accent: #2563eb;
    --accent-light: #eff6ff;
    --danger: #ef4444;
    --warning: #f59e0b;
    --success: #10b981;

    font-family: 'Noto Sans SC', sans-serif;
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
    padding: 1rem 1.5rem;
    background: var(--card);
    border-bottom: 1px solid var(--border);
  }

  .nav-back,
  .nav-spacer {
    width: 80px;
  }

  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: var(--text-2);
    cursor: pointer;
    font-size: 0.9rem;
    padding: 0.5rem 0;
  }

  .nav-center h1 {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-2);
    text-transform: uppercase;
    display: block;
    text-align: center;
  }

  .main-content {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }

  .layout-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    align-items: start;
  }

  .glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  .form-group {
    margin-bottom: 1.2rem;
  }

  .form-group label {
    display: block;
    font-size: 0.9rem;
    color: var(--text-2);
    margin-bottom: 0.5rem;
  }

  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 1rem;
    background: var(--bg);
  }

  input.main-input {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--accent);
  }

  input.disabled {
    background: #f3f4f6;
    color: #9ca3af;
  }

  .tip {
    font-size: 0.75rem;
    color: var(--text-2);
    margin-top: 0.25rem;
    display: block;
  }

  .insurance-section {
    border: 1px solid var(--border);
    border-radius: 8px;
    margin-bottom: 1.5rem;
    overflow: hidden;
  }

  .section-header {
    background: var(--bg);
    padding: 0.75rem;
    font-size: 0.9rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    font-weight: 500;
  }

  .rotate {
    transform: rotate(90deg);
    transition: transform 0.2s;
  }

  .insurance-form {
    padding: 1rem;
    border-top: 1px solid var(--border);
  }

  .ins-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .ins-row label {
    font-size: 0.85rem;
    width: 80px;
  }

  .ins-row input {
    flex: 1;
    padding: 0.5rem;
    font-size: 0.9rem;
  }

  .rate-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .rate-item {
    display: flex;
    align-items: center;
    font-size: 0.8rem;
    gap: 4px;
  }

  .rate-item input {
    width: 50px;
    padding: 4px;
    text-align: center;
  }

  .calc-btn {
    width: 100%;
    padding: 1rem;
    background: var(--text);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .calc-btn:hover {
    background: #000;
    transform: translateY(-1px);
  }

  .result-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .result-header h2 {
    font-size: 2.5rem;
    color: var(--success);
    margin: 0;
    line-height: 1.1;
  }

  .result-header span {
    font-size: 0.9rem;
    color: var(--text-2);
  }

  .chart-bar-container {
    margin-bottom: 2rem;
  }

  .chart-bar {
    height: 16px;
    background: #f3f4f6;
    border-radius: 8px;
    display: flex;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }

  .segment.net {
    background: var(--success);
  }

  .segment.insurance {
    background: var(--warning);
  }

  .segment.tax {
    background: var(--danger);
  }

  .legend {
    display: flex;
    justify-content: center;
    gap: 1rem;
    font-size: 0.8rem;
    color: var(--text-2);
  }

  .dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 4px;
  }

  .dot.net {
    background: var(--success);
  }

  .dot.insurance {
    background: var(--warning);
  }

  .dot.tax {
    background: var(--danger);
  }

  .detail-list {
    font-size: 0.95rem;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.03);
  }

  .detail-sub {
    background: var(--bg);
    padding: 0.75rem;
    border-radius: 8px;
    margin-top: 0.5rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    font-size: 0.85rem;
  }

  .text-danger {
    color: var(--danger);
  }

  .text-warning {
    color: var(--warning);
  }

  .text-muted {
    color: var(--text-2);
  }

  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
    color: #cbd5e1;
  }

  .empty-content {
    text-align: center;
  }

  .empty-content .el-icon {
    font-size: 3rem;
    margin-bottom: 0.5rem;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-2);
    font-size: 0.85rem;
    border-top: 1px solid var(--border);
    margin-top: 2rem;
  }

  @media (max-width: 768px) {
    .layout-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
