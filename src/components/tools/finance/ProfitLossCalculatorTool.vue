<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">盈亏<span>.分摊()</span></h1>
        <div style="width: 100px"></div>
      </header>

      <main class="brutal-grid">
        <div class="left-column">
          <section class="brutal-pane bg-white mb-6">
            <h2 class="pane-title mb-4">当前持有状态.CURRENT</h2>
            <div class="form-grid mb-6">
              <div class="form-group flex-1">
                <label class="form-label">持有数量</label>
                <input
                  v-model.number="currentQty"
                  type="number"
                  min="0"
                  class="brutal-input w-full"
                />
              </div>
              <div class="form-group flex-1">
                <label class="form-label">持仓成本 (单价)</label>
                <input
                  v-model.number="currentPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  class="brutal-input w-full"
                />
              </div>
            </div>

            <h2 class="pane-title mt-6 mb-4">新增操作内容.ACTION</h2>
            <div class="mb-4">
              <label class="form-label">操作类型</label>
              <div class="mode-tabs brutal-shadow">
                <button
                  class="tab-btn"
                  :class="{ active: actionType === 'buy' }"
                  @click="actionType = 'buy'"
                >
                  ➕ 补仓 / 买入
                </button>
                <button
                  class="tab-btn"
                  :class="{ active: actionType === 'sell' }"
                  @click="actionType = 'sell'"
                >
                  ➖ 减仓 / 卖出
                </button>
              </div>
            </div>
            <div class="form-grid mb-6">
              <div class="form-group flex-1">
                <label class="form-label">{{
                  actionType === 'buy' ? '买入数量' : '卖出数量'
                }}</label>
                <input
                  v-model.number="actionQty"
                  type="number"
                  min="0"
                  class="brutal-input w-full"
                />
              </div>
              <div class="form-group flex-1">
                <label class="form-label">{{
                  actionType === 'buy' ? '成交价格' : '卖出价格'
                }}</label>
                <input
                  v-model.number="actionPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  class="brutal-input w-full"
                />
              </div>
            </div>

            <h2 class="pane-title mt-6 mb-4">费率配置.FEES</h2>
            <div class="form-group w-1/2">
              <label class="form-label">综合税费率 (%)</label>
              <input
                v-model.number="feeRate"
                type="number"
                min="0"
                max="1"
                step="0.01"
                class="brutal-input w-full"
              />
              <p class="text-xs font-bold mt-2 opacity-80">(如：股票印花税+佣金约 0.1%)</p>
            </div>
          </section>

          <section class="brutal-pane bg-cyan hidden-xs">
            <h4 class="font-bold mb-2">🎯 目标点位测算</h4>
            <div class="form-grid items-end">
              <div class="form-group flex-1">
                <label class="form-label">预期盈利目标 (%)</label>
                <input
                  v-model.number="targetProfit"
                  type="number"
                  min="-100"
                  step="5"
                  class="brutal-input w-full"
                />
              </div>
              <div class="form-group flex-1">
                <label class="form-label opacity-70">目标价位预估</label>
                <div
                  class="w-full bg-white border-3 border-black p-2 font-mono font-black text-xl text-center brutal-shadow-sm"
                >
                  ¥ {{ formatValue(targetPrice) }}
                </div>
              </div>
            </div>
          </section>
        </div>

        <div class="right-column">
          <section v-if="result" class="brutal-pane bg-yellow h-full flex-col">
            <h2 class="pane-title mb-4">测算结果.RESULT</h2>
            <div class="text-center w-full mb-6">
              <h3 class="font-bold text-lg mb-2">调整后平均成本</h3>
              <div
                class="value huge font-mono font-black my-4"
                :class="
                  result.avgCost > currentPrice && actionType === 'buy'
                    ? 'text-pink drop-shadow-red'
                    : 'drop-shadow-black'
                "
              >
                <span class="text-3xl mr-2">¥</span>{{ formatValue(result.avgCost) }}
              </div>
              <div class="badge border-black p-2 bg-white inline-block mt-2">
                当前价格变动幅度:
                <strong :class="result.changePercent > 0 ? 'text-pink' : 'text-green'">
                  {{ result.changePercent > 0 ? '+' : '' }}{{ result.changePercent.toFixed(2) }}%
                </strong>
              </div>
            </div>

            <div class="details-grid mt-auto pt-6 border-t-4 border-black">
              <div
                class="detail-item bg-white border-3 border-black brutal-shadow p-3 pb-2 text-center"
              >
                <span class="block text-sm font-bold mb-1">总持仓数量</span>
                <span class="block font-mono font-black text-xl">{{ result.totalQty }}</span>
              </div>
              <div
                class="detail-item bg-white border-3 border-black brutal-shadow p-3 pb-2 text-center"
              >
                <span class="block text-sm font-bold mb-1">累计投入金额</span>
                <span class="block font-mono font-black text-xl"
                  >¥ {{ formatValue(result.totalAmt) }}</span
                >
              </div>
              <div
                class="detail-item bg-white border-3 border-black brutal-shadow p-3 pb-2 text-center"
              >
                <span class="block text-sm font-bold mb-1 opacity-70">交易手续费</span>
                <span class="block font-mono font-black text-xl"
                  >¥ {{ formatValue(result.fee) }}</span
                >
              </div>
              <div
                class="detail-item bg-pink text-white border-3 border-black brutal-shadow p-3 pb-2 text-center"
              >
                <span class="block text-sm font-bold mb-1">保本价 (含费)</span>
                <span class="block font-mono font-black text-xl"
                  >¥ {{ formatValue(result.breakeven) }}</span
                >
              </div>
            </div>
          </section>

          <section
            v-else
            class="brutal-pane bg-pink text-white h-full flex-col items-center justify-center p-8 text-center border-dashed border-4 border-black"
          >
            <div class="text-6xl mb-4">📈</div>
            <h2 class="font-black text-2xl mb-2">想要平摊成本？</h2>
            <p class="font-bold opacity-90">
              录入当前的仓位和预想操作<br />系统将自动实时测算成本变化
            </p>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, watch } from 'vue';

  const currentQty = ref(1000);
  const currentPrice = ref(10.5);
  const actionType = ref('buy');
  const actionQty = ref(500);
  const actionPrice = ref(9.8);
  const feeRate = ref(0.1);
  const targetProfit = ref(20);

  const result = ref(null);

  const formatValue = val =>
    val.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 4 });

  const calculate = () => {
    if (currentQty.value === 0 && actionQty.value === 0) {
      result.value = null;
      return;
    }

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

    result.value = { totalQty, totalAmt, avgCost, fee, changePercent, breakeven };
  };

  const targetPrice = computed(() => {
    if (!result.value || result.value.avgCost === 0) {
      const cost =
        currentQty.value > 0 ? (currentQty.value * currentPrice.value) / currentQty.value : 0;
      return cost * (1 + targetProfit.value / 100);
    }
    return result.value.avgCost * (1 + targetProfit.value / 100);
  });

  watch(
    [currentQty, currentPrice, actionType, actionQty, actionPrice, feeRate],
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

  .mode-tabs {
    display: flex;
    background: #111;
    border: 3px solid #111;
    gap: 4px;
    padding: 4px;
  }

  .tab-btn {
    flex: 1;
    border: none;
    background: transparent;
    color: #fff;
    padding: 12px;
    font-size: 1.1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    cursor: pointer;
    box-shadow: none;
  }
  .tab-btn.active {
    background: #ffd900;
    color: #111;
  }
  .tab-btn:hover:not(.active) {
    background: #333;
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
  .items-end {
    align-items: flex-end;
  }
  .flex-col {
    flex-direction: column;
  }
  .flex-1 {
    flex: 1;
    min-width: 150px;
  }
  .w-full {
    width: 100%;
    min-width: 0;
  }
  .w-1\/2 {
    width: 50%;
    min-width: 150px;
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
  .mt-6 {
    margin-top: 1.5rem;
  }
  .mt-auto {
    margin-top: auto;
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
  .p-8 {
    padding: 2rem;
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

  .border-t-4 {
    border-top: 4px solid #111;
  }
  .border-b-3 {
    border-bottom: 3px solid #111;
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

  .huge {
    font-size: 4rem;
    font-weight: 900;
    line-height: 1;
  }
  .drop-shadow-black {
    text-shadow: 4px 4px 0px rgba(0, 0, 0, 0.1);
  }
  .drop-shadow-red {
    text-shadow: 4px 4px 0px #111;
  }
  .text-pink {
    color: #ff4b4b;
  }
  .text-green {
    color: #00e572;
  }
  .text-white {
    color: #fff;
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
    .hidden-xs {
      display: none;
    }
    .w-1\/2 {
      width: 100%;
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
  [data-theme='dark'] .mode-tabs {
    border-color: #eee;
  }
  [data-theme='dark'] .text-pink {
    color: #ff6b6b;
  }
  [data-theme='dark'] .text-green {
    color: #10b981;
  }
  [data-theme='dark'] .drop-shadow-red {
    text-shadow: 4px 4px 0px #111;
  }
  [data-theme='dark'] .border-black,
  [data-theme='dark'] .border-t-4,
  [data-theme='dark'] .border-b-3,
  [data-theme='dark'] .border-3,
  [data-theme='dark'] .border-4 {
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-shadow,
  [data-theme='dark'] .brutal-shadow-sm,
  [data-theme='dark'] .badge {
    box-shadow: 3px 3px 0px #eee;
  }
</style>
