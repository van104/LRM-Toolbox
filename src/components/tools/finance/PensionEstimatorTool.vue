<template>
  <div class="pension-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>年度养老金估算器</h1>
        <span class="nav-subtitle">Pension Estimator</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="layout-container">
        <section class="input-panel glass-card">
          <div class="section-title">个人信息情况</div>
          <div class="form-grid">
            <div class="form-item">
              <label>当前年龄 (岁)</label>
              <el-input-number v-model="currentAge" :min="18" :max="65" class="w-full" />
            </div>
            <div class="form-item">
              <label>预计退休年龄 (岁)</label>
              <el-select v-model="retirementAge" class="w-full">
                <el-option label="50岁 (女工人)" :value="50" />
                <el-option label="55岁 (女干部)" :value="55" />
                <el-option label="60岁 (男职工)" :value="60" />
                <el-option label="65岁 (延迟退休建议)" :value="65" />
              </el-select>
            </div>
            <div class="form-item">
              <label>当前月入 (元)</label>
              <el-input-number v-model="salary" :min="0" :step="1000" class="w-full" />
            </div>
          </div>

          <div class="section-title mt-8">社保基数情况</div>
          <div class="form-grid">
            <div class="form-item">
              <label>个人账户余额 (元)</label>
              <el-input-number v-model="accountBalance" :min="0" :step="5000" class="w-full" />
            </div>
            <div class="form-item">
              <label>已缴费年限 (年)</label>
              <el-input-number v-model="paidYears" :min="0" :max="45" class="w-full" />
            </div>
            <div class="form-item">
              <label>当地社会平均月薪 (元)</label>
              <el-input-number v-model="avgSocialSalary" :min="3000" :step="500" class="w-full" />
            </div>
          </div>

          <el-button type="warning" class="calc-btn" size="large" @click="calculate"
            >立即估算</el-button
          >
        </section>

        <div v-if="result" class="results-area">
          <section class="result-hero glass-card">
            <div class="hero-header">退休后预计每月领取</div>
            <div class="pension-value">
              <span class="unit">¥</span>
              {{ formatMoney(result.totalMonthly) }}
            </div>
            <div class="replacement-rate">
              养老金替代率：<b>{{ result.replaceRate }}%</b>
            </div>

            <div class="result-details">
              <div class="res-item">
                <div class="lab">基础养老金</div>
                <div class="val">¥ {{ formatMoney(result.basePension) }}</div>
              </div>
              <div class="res-item">
                <div class="lab">个人账户养老金</div>
                <div class="val">¥ {{ formatMoney(result.accountPension) }}</div>
              </div>
            </div>
          </section>

          <section class="analysis-box glass-card">
            <div class="box-title">估算说明</div>
            <div class="analysis-content">
              <p>1. <b>基础养老金</b>：基于计发基数、个人平均缴费指数和缴费年限计算。</p>
              <p>
                2.
                <b>个人账户养老金</b>：个人账户储存额除以计发月数（60岁为139个月，55岁为170个月）。
              </p>
              <p class="warning-text">
                *
                以上结果基于当前政策和静态数据估算，未考虑通货膨胀及未来工资水平和平均月薪的动态增长。仅供参考。
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 财务未来规划</footer>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { Back } from '@element-plus/icons-vue';

  const currentAge = ref(30);
  const retirementAge = ref(60);
  const salary = ref(10000);
  const accountBalance = ref(50000);
  const paidYears = ref(5);
  const avgSocialSalary = ref(8000);

  const result = ref(null);

  const calculate = () => {
    const index = salary.value / avgSocialSalary.value;
    const clampedIndex = Math.min(Math.max(index, 0.6), 3.0);

    const yearsToWork = retirementAge.value - currentAge.value;
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
    const replaceRate = ((totalMonthly / salary.value) * 100).toFixed(1);

    result.value = {
      totalMonthly,
      basePension,
      accountPension,
      replaceRate
    };
  };

  const formatMoney = val => {
    return val.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  onMounted(() => {
    calculate();
  });
</script>

<style scoped>
  .pension-tool {
    --primary: #f59e0b;
    --primary-dark: #d97706;
    --bg: #fdfaf6;
    --white: #ffffff;
    --border: #f3e8d2;

    min-height: 100vh;
    background: var(--bg);
  }

  .nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
    background: var(--white);
    border-bottom: 1px solid var(--border);
  }

  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: #8b5e3c;
    cursor: pointer;
  }

  .nav-center {
    text-align: center;
  }

  .nav-center h1 {
    font-size: 1.25rem;
    margin: 0;
  }

  .nav-subtitle {
    font-size: 0.75rem;
    color: #a1824a;
    text-transform: uppercase;
  }

  .main-content {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }

  .layout-container {
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: 1.5rem;
    align-items: start;
  }

  .glass-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 4px 10px rgba(139, 94, 60, 0.05);
  }

  .section-title {
    font-weight: 600;
    font-size: 0.95rem;
    color: #8b5e3c;
    margin-bottom: 1rem;
    border-bottom: 1px solid var(--border);
    padding-bottom: 0.5rem;
  }

  .form-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .form-item label {
    display: block;
    font-size: 0.85rem;
    color: #6b7280;
    margin-bottom: 0.4rem;
  }

  .w-full {
    width: 100%;
  }

  .mt-8 {
    margin-top: 2rem;
  }

  .calc-btn {
    width: 100%;
    margin-top: 2rem;
  }

  .result-hero {
    text-align: center;
    background: linear-gradient(135deg, #fffcf9 0%, #fff5e6 100%);
  }

  .hero-header {
    font-size: 1rem;
    color: #8b5e3c;
    margin-bottom: 0.5rem;
  }

  .pension-value {
    font-size: 3rem;
    font-weight: 800;
    color: var(--primary-dark);
    margin-bottom: 1rem;
  }

  .unit {
    font-size: 1.5rem;
    margin-right: 4px;
  }

  .replacement-rate {
    font-size: 0.9rem;
    color: #6b7280;
    background: #fff;
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    border: 1px solid var(--border);
  }

  .result-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-top: 2.5rem;
    border-top: 1px dashed var(--border);
    padding-top: 1.5rem;
  }

  .res-item .lab {
    font-size: 0.75rem;
    color: #9ca3af;
    margin-bottom: 4px;
  }

  .res-item .val {
    font-weight: 600;
    font-size: 1rem;
  }

  .analysis-box {
    margin-top: 1.5rem;
  }

  .box-title {
    font-weight: 600;
    color: #8b5e3c;
    margin-bottom: 1rem;
  }

  .analysis-content p {
    font-size: 0.85rem;
    line-height: 1.6;
    color: #6b7280;
    margin-bottom: 8px;
  }

  .warning-text {
    color: #f87171;
    font-style: italic;
    margin-top: 1rem;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #a1824a;
    font-size: 0.85rem;
  }

  @media (max-width: 850px) {
    .layout-container {
      grid-template-columns: 1fr;
    }
  }
</style>
