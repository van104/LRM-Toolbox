<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon><span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">汽车贷款计算器</h1>
        <span class="tool-subtitle">Car Loan Calculator</span>
      </div>
      <div class="header-right">
        <el-button type="primary" plain @click="reset">重置</el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="layout-container">
        <div class="main-section glass-card">
          <div class="form-grid">
            <div class="form-item pc">
              <label>车辆总价 (元)</label>
              <el-input-number
                v-model="carPrice"
                :min="0"
                :step="10000"
                style="width: 100%"
                @change="calculate"
              />
            </div>

            <div class="form-item dp">
              <label>首付比例 (%)</label>
              <el-input-number
                v-model="downPaymentPct"
                :min="0"
                :max="100"
                style="width: 100%"
                @change="calculate"
              />
              <div class="sub-label">首付金额: ¥ {{ downPaymentAmount.toLocaleString() }}</div>
            </div>

            <div class="form-item term">
              <label>贷款期限 (月)</label>
              <el-select v-model="loanTerm" style="width: 100%" @change="calculate">
                <el-option label="12个月 (1年)" :value="12" />
                <el-option label="24个月 (2年)" :value="24" />
                <el-option label="36个月 (3年)" :value="36" />
                <el-option label="48个月 (4年)" :value="48" />
                <el-option label="60个月 (5年)" :value="60" />
              </el-select>
            </div>

            <div class="form-item rate">
              <label>年利率 (%)</label>
              <el-input-number
                v-model="annualRate"
                :min="0"
                :max="20"
                :precision="2"
                :step="0.01"
                style="width: 100%"
                @change="calculate"
              />
            </div>

            <div class="form-item type">
              <label>还款方式</label>
              <el-radio-group v-model="repaymentType" @change="calculate">
                <el-radio-button label="matching">等额本息</el-radio-button>
                <el-radio-button label="fixed">等额本金</el-radio-button>
              </el-radio-group>
            </div>
          </div>

          <div class="summary-results">
            <div class="primary-box">
              <div class="monthly-payment">
                <span class="lab">每月还款 (月供)</span>
                <span v-if="repaymentType === 'matching'" class="val">
                  ¥ {{ result.monthlyPayment.toFixed(2) }}
                </span>
                <span v-else class="val">
                  ¥ {{ result.firstMonthPayment.toFixed(2) }}
                  <small style="font-size: 0.6em; opacity: 0.7">(首月)</small>
                </span>
              </div>
            </div>

            <div class="detail-boxes">
              <div class="d-box">
                <span class="l">贷款总额</span>
                <span class="v">¥ {{ loanAmount.toLocaleString() }}</span>
              </div>
              <div class="d-box">
                <span class="l">利息总额</span>
                <span class="v interest">¥ {{ result.totalInterest.toFixed(2) }}</span>
              </div>
              <div class="d-box">
                <span class="l">累计支付金额</span>
                <span class="v">¥ {{ (loanAmount + result.totalInterest).toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <div class="schedule-section">
            <div class="section-header">
              <h3>还款计划表</h3>
              <el-button link type="primary" @click="showSchedule = !showSchedule">
                {{ showSchedule ? '收起' : '展开详情' }}
              </el-button>
            </div>

            <el-collapse-transition>
              <div v-show="showSchedule" class="table-wrapper">
                <table class="schedule-table">
                  <thead>
                    <tr>
                      <th>期次</th>
                      <th>偿还本息 (元)</th>
                      <th>偿还本金 (元)</th>
                      <th>偿还利息 (元)</th>
                      <th>剩余本金 (元)</th>
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
            </el-collapse-transition>
          </div>
        </div>

        <div class="sidebar glass-card">
          <div class="ref-section">
            <h3>名词解释</h3>
            <div class="term-box">
              <strong>等额本息:</strong>
              <p>每月还款额固定。前期还款中利息占比较大，本金占比较小。适合收入稳定的群体。</p>
            </div>
            <div class="term-box">
              <strong>等额本金:</strong>
              <p>
                每月偿还本金固定，利息随本金减少而递减。前期还款压力大，后期递减。总利息支出比等额本息少。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="tips-section glass-card">
        <div class="tips-header">
          <el-icon><InfoFilled /></el-icon>
          <h4>温馨提示</h4>
        </div>
        <div class="tips-content">
          <ul class="premium-list">
            <li>
              <b>购车成本</b>：除了裸车价，通常还需考虑保险、购置税、上牌费等约 10% 的额外开支。
            </li>
            <li>
              <b>贷款策略</b>：年利率通常由 4S 店或银行提供。若有厂家贴息，往往能获得 0
              利率或较低利率。
            </li>
            <li>
              <b>合理负债</b>：建议车辆月供不要超过家庭月收入的 30%，以确保生活质量不受较大影响。
            </li>
          </ul>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 汽车贷款计算器</footer>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { ArrowLeft, InfoFilled } from '@element-plus/icons-vue';

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
    const i = annualRate.value / 100 / 12; // 月利率

    if (L <= 0) return;

    const schedule = [];
    let totalInterest = 0;

    if (repaymentType.value === 'matching') {
      // 等额本息
      // P = L * [i * (1 + i)^n] / [(1 + i)^n - 1]
      const monthlyPayment = (L * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
      let remaining = L;

      for (let p = 1; p <= n; p++) {
        const interest = remaining * i;
        const principal = monthlyPayment - interest;
        remaining -= principal;
        schedule.push({
          period: p,
          payment: monthlyPayment,
          principal,
          interest,
          remaining
        });
        totalInterest += interest;
      }

      result.value = {
        monthlyPayment,
        firstMonthPayment: 0,
        totalInterest,
        schedule
      };
    } else {
      // 等额本金
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

      result.value = {
        monthlyPayment: 0,
        firstMonthPayment,
        totalInterest,
        schedule
      };
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
  .tool-page {
    min-height: 100vh;
    background: #f1f5f9;
    display: flex;
    flex-direction: column;
  }

  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .header-center {
    text-align: center;
    flex: 1;
  }

  .tool-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }

  .tool-subtitle {
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
  }

  .tool-content {
    flex: 1;
    padding: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .layout-container {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .main-section {
    padding: 2.5rem;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .form-item label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: #475569;
    font-weight: 600;
  }

  .sub-label {
    font-size: 0.75rem;
    color: #94a3b8;
    margin-top: 4px;
  }

  .summary-results {
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    margin-bottom: 2rem;
  }

  .primary-box {
    padding: 2rem;
    text-align: center;
    border-bottom: 1px solid #e2e8f0;
    background: white;
  }

  .monthly-payment {
    display: flex;
    flex-direction: column;
  }

  .monthly-payment .lab {
    font-size: 0.9rem;
    color: #64748b;
    margin-bottom: 0.5rem;
  }

  .monthly-payment .val {
    font-size: 2.5rem;
    font-weight: 800;
    color: #ef4444;
  }

  .detail-boxes {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    padding: 1.5rem;
    gap: 1rem;
  }

  .d-box {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .d-box .l {
    font-size: 0.75rem;
    color: #94a3b8;
  }

  .d-box .v {
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
  }

  .d-box .v.interest {
    color: #f59e0b;
  }

  .schedule-section {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .section-header h3 {
    font-size: 1rem;
    margin: 0;
  }

  .table-wrapper {
    margin-top: 1rem;
    max-height: 400px;
    overflow-y: auto;
  }

  .schedule-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
  }

  .schedule-table th {
    text-align: left;
    padding: 0.75rem;
    background: #f1f5f9;
    position: sticky;
    top: 0;
    color: #64748b;
  }

  .schedule-table td {
    padding: 0.75rem;
    border-bottom: 1px solid #f1f5f9;
  }

  .sidebar {
    padding: 1.5rem;
  }

  .ref-section h3 {
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
  }

  .term-box {
    margin-bottom: 1.5rem;
  }

  .term-box strong {
    display: block;
    font-size: 0.9rem;
    color: #3b82f6;
    margin-bottom: 4px;
  }

  .term-box p {
    font-size: 0.85rem;
    color: #64748b;
    line-height: 1.5;
    margin: 0;
  }

  .tips-section {
    padding: 1.5rem 2rem;
    background: linear-gradient(to bottom right, #ffffff, #f8fafc);
    border: 1px solid rgba(59, 130, 246, 0.1);
  }

  .tips-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    color: #3b82f6;
  }

  .tips-header h4 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .premium-list {
    padding-left: 1.25rem;
    margin: 0;
  }

  .premium-list li {
    margin-bottom: 0.75rem;
    color: #475569;
    font-size: 0.9rem;
    line-height: 1.6;
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }

  @media (max-width: 992px) {
    .layout-container {
      grid-template-columns: 1fr;
    }
  }
</style>
