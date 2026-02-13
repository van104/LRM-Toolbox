<template>
  <div class="tool-container">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>信用卡分期计算器</h1>
        <span class="nav-subtitle">Installment Loan Calculator</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="glass-card">
        <el-form label-position="top">
          <el-form-item label="分期总金额 (Total Amount)">
            <el-input-number
              v-model="amount"
              :min="100"
              :step="1000"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="分期期数 (Periods)">
                <el-select v-model="periods" placeholder="Select">
                  <el-option :value="3" label="3期" />
                  <el-option :value="6" label="6期" />
                  <el-option :value="9" label="9期" />
                  <el-option :value="12" label="12期" />
                  <el-option :value="18" label="18期" />
                  <el-option :value="24" label="24期" />
                  <el-option :value="36" label="36期" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="每期费率/手续费 (%)">
                <el-input-number
                  v-model="ratePerPeriod"
                  :min="0"
                  :max="5"
                  :step="0.01"
                  controls-position="right"
                  style="width: 100%"
                />
                <span class="input-suffix">%</span>
              </el-form-item>
            </el-col>
          </el-row>

          <div class="result-section">
            <div class="main-info">
              <div class="info-row">
                <span class="label">每期还款 (Monthly Pay)</span>
                <span class="value huge">¥ {{ result.monthlyPay }}</span>
              </div>
              <div class="sub-info">
                (本金 ¥{{ result.monthlyPrincipal }} + 手续费 ¥{{ result.monthlyFee }})
              </div>
            </div>

            <el-divider />

            <div class="irr-card">
              <div class="irr-header">
                <el-icon><TrendCharts /></el-icon>
                <span>实际年化利率 (IRR)</span>
              </div>
              <div class="irr-value">{{ result.irr }}%</div>
              <p class="irr-desc">
                相比名义年费率 ({{
                  (ratePerPeriod * 12).toFixed(2)
                }}%)，实际年化通常更高，因为本金在不断减少但手续费不变。
              </p>
            </div>

            <div class="details-grid">
              <div class="detail">
                <span class="label">总还款额</span>
                <span class="val">¥ {{ result.totalRepayment }}</span>
              </div>
              <div class="detail">
                <span class="label">总手续费</span>
                <span class="val highlight">¥ {{ result.totalFee }}</span>
              </div>
            </div>
          </div>
        </el-form>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 金融理财系列</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { Back, TrendCharts } from '@element-plus/icons-vue';

  const amount = ref(10000);
  const periods = ref(12);
  const ratePerPeriod = ref(0.6); // 0.6% per month is common

  const result = computed(() => {
    const principal = amount.value;
    const n = periods.value;
    const r = ratePerPeriod.value / 100;

    const monthlyPrincipal = principal / n;
    const monthlyFee = principal * r;
    const monthlyPay = monthlyPrincipal + monthlyFee;

    const totalRepayment = monthlyPay * n;
    const totalFee = monthlyFee * n;

    // Calculate IRR (Internal Rate of Return)
    // Cash flow:
    // Month 0: +Principal
    // Month 1..n: -MonthlyPay
    // Approximation for installment loan (flat rate):
    // APR ≈ (n * rate * 24) / (n + 1) ? No this is for total interest?
    // Let's use Newton-Raphson to solve for monthly rate i such that:
    // P = M * (1 - (1+i)^-n) / i  where M is monthly pay.
    // P * i = M * (1 - (1+i)^-n)

    // Using binary search for i (monthly rate)
    let low = 0;
    let high = 1; // 100% per month, unlikely
    let i = 0;

    for (let k = 0; k < 20; k++) {
      const mid = (low + high) / 2;
      const fv = (monthlyPay * (1 - Math.pow(1 + mid, -n))) / mid;
      if (fv > principal) {
        low = mid; // rate too low, PV of payments > Principal ?? Wait.
        // If assumed rate is low, PV of M is high. So if PV > P, we need higher rate to discount more.
        // Yes, low = mid.
      } else {
        high = mid;
      }
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
  .tool-container {
    min-height: 100vh;
    background: #f8fafc;
    font-family: 'Inter', system-ui, sans-serif;
    color: #334155;
  }

  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    padding: 1rem 1.5rem;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    color: #64748b;
    width: 80px;
  }

  .nav-center {
    flex: 1;
    text-align: center;
  }

  .nav-center h1 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .nav-subtitle {
    font-size: 0.8rem;
    color: #64748b;
  }

  .nav-spacer {
    width: 80px;
  }

  .main-content {
    max-width: 600px;
    margin: 2rem auto;
    padding: 0 1.5rem;
  }

  .glass-card {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
  }

  .input-suffix {
    margin-left: 10px;
    color: #64748b;
  }

  .result-section {
    margin-top: 2rem;
    background: #f8fafc;
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid #e2e8f0;
  }

  .main-info {
    text-align: center;
  }

  .info-row {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .info-row .label {
    color: #64748b;
    font-size: 0.9rem;
  }

  .info-row .value.huge {
    font-size: 2.5rem;
    font-weight: 800;
    color: #0f172a;
  }

  .sub-info {
    color: #94a3b8;
    font-size: 0.85rem;
  }

  .irr-card {
    background: #fffbeb;
    border: 1px solid #fcd34d;
    border-radius: 8px;
    padding: 1rem;
    margin: 1.5rem 0;
    text-align: center;
  }

  .irr-header {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    color: #b45309;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .irr-value {
    font-size: 2rem;
    font-weight: 700;
    color: #d97706;
  }

  .irr-desc {
    font-size: 0.8rem;
    color: #92400e;
    margin: 0.5rem 0 0;
    line-height: 1.4;
  }

  .details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .detail {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    align-items: center;
  }

  .detail .label {
    font-size: 0.85rem;
    color: #64748b;
  }

  .detail .val {
    font-weight: 600;
    font-size: 1.1rem;
    color: #334155;
  }

  .detail .val.highlight {
    color: #ef4444;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #94a3b8;
    font-size: 0.875rem;
  }
</style>
