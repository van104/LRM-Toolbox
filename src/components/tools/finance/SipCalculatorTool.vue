<template>
  <div class="tool-container">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>定投收益估算器</h1>
        <span class="nav-subtitle">SIP Calculator</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="glass-card">
        <el-form label-position="top">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="每月定投金额 (Monthly Investment)">
                <el-input-number
                  v-model="monthlyInvestment"
                  :min="100"
                  :step="100"
                  controls-position="right"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="预期年化收益率 (Expected Return %)">
                <el-input-number
                  v-model="annualReturn"
                  :min="1"
                  :max="100"
                  :step="0.5"
                  controls-position="right"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="定投期限 (Time Period)">
            <el-input-number
              v-model="duration"
              :min="1"
              :max="50"
              controls-position="right"
              style="width: 100%"
              label="年"
            />
            <span class="unit-label">年</span>
          </el-form-item>

          <div class="result-section">
            <div class="result-row total-value">
              <span class="label">到期总金额 (Total Value)</span>
              <span class="value">¥ {{ formatMoney(result.totalValue) }}</span>
            </div>

            <div class="result-grid">
              <div class="grid-item invested">
                <span class="label">本金投入</span>
                <span class="val">¥ {{ formatMoney(result.investedAmount) }}</span>
              </div>
              <div class="grid-item profit">
                <span class="label">预期收益</span>
                <span class="val">+ ¥ {{ formatMoney(result.estimatedReturns) }}</span>
              </div>
            </div>

            <div class="progress-bar-container">
              <div class="progress-bar">
                <div
                  class="progress-fill invested"
                  :style="{ width: result.investedPercent + '%' }"
                ></div>
                <div
                  class="progress-fill profit"
                  :style="{ width: result.profitPercent + '%' }"
                ></div>
              </div>
              <div class="progress-labels">
                <span>本金 {{ result.investedPercent }}%</span>
                <span>收益 {{ result.profitPercent }}%</span>
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
  import { Back } from '@element-plus/icons-vue';

  const monthlyInvestment = ref(1000);
  const annualReturn = ref(8);
  const duration = ref(10);

  const result = computed(() => {
    const p = monthlyInvestment.value;
    const i = annualReturn.value / 100 / 12; // monthly rate
    const n = duration.value * 12; // total months

    // Formula for Future Value of Annuity (Invested at end of period)
    // FV = P * [((1 + i)^n - 1) / i]
    // With monthy compounding.

    // If invested at beginning: FV = P * [((1 + i)^n - 1) / i] * (1+i)
    // Let's use End of period for standard SIP calculation.

    const fv = p * ((Math.pow(1 + i, n) - 1) / i) * (1 + i); // Actually most SIPs are beginning of month? Or end?
    // Standard formula often cited: M = P * ({[1+i]^n - 1} / i) * (1+i)
    // Let's stick with this one.

    const investedAmount = p * n;
    const estimatedReturns = fv - investedAmount;
    const totalValue = fv;

    const total = totalValue || 1; // avoid division by zero

    return {
      investedAmount: Math.round(investedAmount),
      estimatedReturns: Math.round(estimatedReturns),
      totalValue: Math.round(totalValue),
      investedPercent: ((investedAmount / total) * 100).toFixed(1),
      profitPercent: ((estimatedReturns / total) * 100).toFixed(1)
    };
  });

  const formatMoney = (val: number) => {
    return val.toLocaleString('en-US');
  };
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

  .unit-label {
    position: absolute;
    right: 40px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    z-index: 1;
    pointer-events: none;
  }

  .result-section {
    margin-top: 2.5rem;
    background: #f1f5f9;
    border-radius: 12px;
    padding: 1.5rem;
  }

  .total-value {
    text-align: center;
    margin-bottom: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .total-value .label {
    font-size: 0.9rem;
    color: #64748b;
  }

  .total-value .value {
    font-size: 2.5rem;
    font-weight: 800;
    color: #0f172a;
  }

  .result-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .grid-item {
    background: white;
    padding: 1rem;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    border: 1px solid #e2e8f0;
  }

  .grid-item .label {
    font-size: 0.8rem;
    color: #94a3b8;
  }

  .grid-item .val {
    font-weight: 600;
    font-size: 1.1rem;
  }

  .grid-item.invested .val {
    color: #3b82f6;
  }

  .grid-item.profit .val {
    color: #10b981;
  }

  .progress-bar-container {
    margin-top: 1rem;
  }

  .progress-bar {
    height: 12px;
    background: #e2e8f0;
    border-radius: 6px;
    display: flex;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }

  .progress-fill.invested {
    background: #3b82f6;
    height: 100%;
  }

  .progress-fill.profit {
    background: #10b981;
    height: 100%;
  }

  .progress-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: #64748b;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #94a3b8;
    font-size: 0.875rem;
  }
</style>
