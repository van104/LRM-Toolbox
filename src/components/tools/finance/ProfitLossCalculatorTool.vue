<template>
  <div class="pl-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>盈亏分摊计算器</h1>
        <span class="nav-subtitle">Profit & Loss Calculator</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="layout-container">
        <section class="calc-panel">
          <div class="glass-card">
            <div class="section-title">当前持有状态</div>
            <div class="form-row">
              <div class="form-item">
                <label>持有数量</label>
                <el-input-number v-model="currentQty" :min="0" class="w-full" />
              </div>
              <div class="form-item">
                <label>持仓成本 (单价)</label>
                <el-input-number v-model="currentPrice" :min="0" :precision="4" class="w-full" />
              </div>
            </div>

            <div class="section-title mt-8">新增操作内容</div>
            <div class="form-row">
              <div class="form-item">
                <label>操作类型</label>
                <el-radio-group v-model="actionType" class="w-full">
                  <el-radio-button label="buy">补仓 / 买入</el-radio-button>
                  <el-radio-button label="sell">减仓 / 卖出</el-radio-button>
                </el-radio-group>
              </div>
            </div>
            <div class="form-row">
              <div class="form-item">
                <label>{{ actionType === 'buy' ? '买入数量' : '卖出数量' }}</label>
                <el-input-number v-model="actionQty" :min="0" class="w-full" />
              </div>
              <div class="form-item">
                <label>{{ actionType === 'buy' ? '成交价格' : '卖出价格' }}</label>
                <el-input-number v-model="actionPrice" :min="0" :precision="4" class="w-full" />
              </div>
            </div>

            <div class="section-title mt-8">费率配置</div>
            <div class="form-row">
              <div class="form-item">
                <label>综合税费率 (%)</label>
                <el-input-number
                  v-model="feeRate"
                  :min="0"
                  :max="1"
                  :step="0.01"
                  :precision="3"
                  class="w-full"
                />
                <span class="tip">如：股票印花税+佣金约 0.1%</span>
              </div>
            </div>

            <el-button type="primary" class="calc-btn" size="large" @click="calculate"
              >开始测算</el-button
            >
          </div>

          <div class="glass-card mt-6">
            <div class="section-title">目标点位测算</div>
            <div class="form-row">
              <div class="form-item">
                <label>预期盈利目标 (%)</label>
                <el-input-number v-model="targetProfit" :min="-100" :step="5" class="w-full" />
              </div>
              <div class="form-item">
                <label>目标价位预估</label>
                <div class="target-val">¥ {{ formatValue(targetPrice) }}</div>
              </div>
            </div>
          </div>
        </section>

        <section class="result-panel">
          <div v-if="result" class="glass-card result-hero">
            <div class="hero-label">调整后平均成本</div>
            <div
              class="cost-value"
              :class="{ 'text-red': result.avgCost > currentPrice && actionType === 'buy' }"
            >
              ¥ {{ formatValue(result.avgCost) }}
            </div>
            <div class="hero-stats">
              <div class="h-stat">
                <div class="l">总持仓数量</div>
                <div class="v">{{ result.totalQty }}</div>
              </div>
              <div class="h-stat">
                <div class="l">累计投入金额</div>
                <div class="v">¥ {{ formatValue(result.totalAmt) }}</div>
              </div>
            </div>
          </div>

          <div v-if="result" class="glass-card mt-6">
            <div class="section-title">操作明细分析</div>
            <div class="detail-list">
              <div class="d-item">
                <span>交易手续费</span>
                <span class="val">¥ {{ formatValue(result.fee) }}</span>
              </div>
              <div class="d-item">
                <span>当前价格变动幅度</span>
                <span class="val" :class="getPriceChangeClass">
                  {{ result.changePercent > 0 ? '+' : '' }}{{ result.changePercent.toFixed(2) }}%
                </span>
              </div>
              <div class="d-item">
                <span>盈亏平衡点 (保本价)</span>
                <span class="val">¥ {{ formatValue(result.breakeven) }}</span>
              </div>
            </div>
          </div>

          <div v-else class="empty-state glass-card">
            <el-icon>
              <DataLine />
            </el-icon>
            <p>录入当前的仓位和预想操作，点击测算即可实时查看分摊后的成本变化。</p>
          </div>
        </section>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 资产盈亏测算</footer>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { Back, DataLine } from '@element-plus/icons-vue';

  const currentQty = ref(1000);
  const currentPrice = ref(10.5);
  const actionType = ref('buy');
  const actionQty = ref(500);
  const actionPrice = ref(9.8);
  const feeRate = ref(0.1);
  const targetProfit = ref(20);

  const result = ref(null);

  const formatValue = val => {
    return val.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  };

  const calculate = () => {
    const feeScale = feeRate.value / 100;
    const currentAmt = currentQty.value * currentPrice.value;
    const actionTotal = actionQty.value * actionPrice.value;
    const fee = actionTotal * feeScale;

    let totalQty = 0;
    let totalAmt = 0;

    if (actionType.value === 'buy') {
      totalQty = currentQty.value + actionQty.value;
      totalAmt = currentAmt + actionTotal + fee;
    } else {
      totalQty = Math.max(0, currentQty.value - actionQty.value);

      totalAmt = currentAmt - actionTotal + fee;
    }

    const avgCost = totalQty > 0 ? totalAmt / totalQty : 0;
    const changePercent =
      currentPrice.value !== 0 ? ((avgCost - currentPrice.value) / currentPrice.value) * 100 : 0;

    const breakeven = totalQty > 0 ? totalAmt / (totalQty * (1 - feeScale)) : 0;

    result.value = {
      totalQty,
      totalAmt,
      avgCost,
      fee,
      changePercent,
      breakeven
    };
  };

  const targetPrice = computed(() => {
    if (!result.value || result.value.avgCost === 0) {
      const cost = (currentQty.value * currentPrice.value) / currentQty.value || 0;
      return cost * (1 + targetProfit.value / 100);
    }
    return result.value.avgCost * (1 + targetProfit.value / 100);
  });

  const getPriceChangeClass = computed(() => {
    if (!result.value) return '';
    return result.value.changePercent > 0 ? 'text-red' : 'text-green';
  });
</script>

<style scoped>
  .pl-tool {
    --primary: #2563eb;
    --text-main: #1f2937;
    --text-sub: #6b7280;
    --red: #ef4444;
    --green: #10b981;
    --bg: #f3f4f6;

    min-height: 100vh;
    background: var(--bg);
  }

  .nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
    background: #fff;
    border-bottom: 1px solid #e5e7eb;
  }

  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-sub);
  }

  .nav-center h1 {
    font-size: 1.25rem;
    margin: 0;
  }

  .nav-subtitle {
    font-size: 0.75rem;
    color: #9ca3af;
    text-transform: uppercase;
  }

  .main-content {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }

  .layout-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    align-items: start;
  }

  .glass-card {
    background: #fff;
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid #e5e7eb;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  .section-title {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--text-main);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .section-title::before {
    content: '';
    width: 3px;
    height: 14px;
    background: var(--primary);
    border-radius: 2px;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .form-item label {
    display: block;
    font-size: 0.8rem;
    color: var(--text-sub);
    margin-bottom: 0.4rem;
  }

  .w-full {
    width: 100%;
  }

  .mt-8 {
    margin-top: 1.5rem;
  }

  .mt-6 {
    margin-top: 1rem;
  }

  .tip {
    font-size: 0.7rem;
    color: #9ca3af;
    margin-top: 4px;
    display: block;
  }

  .calc-btn {
    width: 100%;
    margin-top: 1rem;
  }

  .target-val {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--primary);
    background: #eff6ff;
    padding: 6px 12px;
    border-radius: 6px;
  }

  .result-hero {
    text-align: center;
    padding: 2rem;
    background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);
  }

  .hero-label {
    font-size: 0.9rem;
    color: var(--text-sub);
    margin-bottom: 0.5rem;
  }

  .cost-value {
    font-size: 2.5rem;
    font-weight: 800;
    color: #111827;
  }

  .hero-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-top: 2rem;
    border-top: 1px dashed #e5e7eb;
    padding-top: 1.5rem;
  }

  .h-stat .l {
    font-size: 0.75rem;
    color: #9ca3af;
    margin-bottom: 4px;
  }

  .h-stat .v {
    font-weight: 600;
    font-size: 1rem;
  }

  .detail-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .d-item {
    display: flex;
    justify-content: space-between;
    font-size: 0.875rem;
  }

  .text-red {
    color: var(--red) !important;
  }

  .text-green {
    color: var(--green) !important;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    text-align: center;
    color: #9ca3af;
  }

  .empty-state .el-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.3;
  }

  .empty-state p {
    font-size: 0.85rem;
    line-height: 1.6;
    max-width: 240px;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #9ca3af;
    font-size: 0.85rem;
  }

  @media (max-width: 800px) {
    .layout-container {
      grid-template-columns: 1fr;
    }
  }
</style>
