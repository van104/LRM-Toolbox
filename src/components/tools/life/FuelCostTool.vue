<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon><span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">燃油费用计算器</h1>
        <span class="tool-subtitle">Fuel Cost Calculator</span>
      </div>
      <div class="header-right">
        <el-button type="primary" plain @click="clearInputs">清空各项</el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="layout-container">
        <div class="main-section glass-card">
          <div class="form-container">
            <div class="form-row">
              <div class="form-item">
                <label>拟行驶总路程 (km)</label>
                <el-input-number
                  v-model="inputs.distance"
                  :min="0.1"
                  :precision="1"
                  style="width: 100%"
                />
              </div>
              <div class="form-item">
                <label>平均百公里油耗 (L/100km)</label>
                <el-input-number
                  v-model="inputs.consumption"
                  :min="0.1"
                  :precision="1"
                  style="width: 100%"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-item">
                <label>当前燃油单价 (元/L)</label>
                <el-input-number
                  v-model="inputs.price"
                  :min="0.1"
                  :precision="2"
                  style="width: 100%"
                />
              </div>
              <div class="form-item">
                <label>乘车人数 (分摊人数)</label>
                <el-input-number v-model="inputs.people" :min="1" :max="100" style="width: 100%" />
              </div>
            </div>
          </div>

          <div class="result-highlight">
            <div class="main-result">
              <span class="currency">¥</span>
              <span class="amount">{{ totalCost.toFixed(2) }}</span>
              <span class="label">预计总油费支出</span>
            </div>
            <div class="secondary-results">
              <div class="res-item">
                <span class="val">{{ totalFuel.toFixed(2) }} L</span>
                <span class="lab">预计耗油量</span>
              </div>
              <div class="res-item">
                <span class="val">¥ {{ (totalCost / inputs.distance).toFixed(2) }}</span>
                <span class="lab">平均每公里成本</span>
              </div>
              <div class="res-item">
                <span class="val">¥ {{ (totalCost / inputs.people).toFixed(2) }}</span>
                <span class="lab">每人分摊成本</span>
              </div>
            </div>
          </div>

          <div v-if="inputs.distance > 0 && inputs.consumption > 0" class="chart-section">
            <h4>成本分析：不同价位油费估算</h4>
            <div class="cost-table">
              <div class="table-header">
                <span>油价 (元/L)</span>
                <span>总费用 (元)</span>
                <span>每公里 (元)</span>
              </div>
              <div
                v-for="p in priceVariations"
                :key="p"
                class="table-row"
                :class="{ current: p === inputs.price }"
              >
                <span>{{ p.toFixed(2) }}</span>
                <span>{{ (((inputs.distance * inputs.consumption) / 100) * p).toFixed(2) }}</span>
                <span>{{ ((inputs.consumption / 100) * p).toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="sidebar glass-card">
          <div class="reference-section">
            <h3>参考数据</h3>
            <div class="ref-list">
              <div class="ref-item">
                <span class="type">紧凑型轿车</span>
                <span class="value">6-8 L/100km</span>
              </div>
              <div class="ref-item">
                <span class="type">中型 SUV</span>
                <span class="value">9-12 L/100km</span>
              </div>
              <div class="ref-item">
                <span class="type">大型越野车</span>
                <span class="value">13-18 L/100km</span>
              </div>
              <div class="ref-item">
                <span class="type">插混车型 (馈电)</span>
                <span class="value">4-6 L/100km</span>
              </div>
            </div>
          </div>

          <el-divider />

          <div class="history-list">
            <h3>最近计算记录</h3>
            <div v-if="history.length > 0" class="history-items">
              <div v-for="(h, idx) in history" :key="idx" class="h-card" @click="loadHistory(h)">
                <div class="h-top">
                  <span>{{ h.distance }}km</span>
                  <strong>¥{{ h.cost.toFixed(1) }}</strong>
                </div>
                <div class="h-bottom">{{ h.consumption }}L/100km | ¥{{ h.price }}/L</div>
              </div>
            </div>
            <div v-else class="empty-history">暂无记录</div>
            <el-button v-if="history.length > 0" size="small" text @click="history = []"
              >清除记录</el-button
            >
          </div>

          <el-button type="primary" style="width: 100%; margin-top: 1rem" @click="saveToHistory"
            >保存当前结果</el-button
          >
        </div>
      </div>

      <div class="tips-section glass-card">
        <div class="tips-header">
          <el-icon><InfoFilled /></el-icon>
          <h4>计算说明</h4>
        </div>
        <div class="tips-content">
          <p>燃油费用受多种因素影响，计算结果仅供参考：</p>
          <ul class="premium-list">
            <li>
              <b>油耗表现</b>：实际油耗受路况（拥堵/高速）、驾驶习惯、载重及空调使用影响较大。
            </li>
            <li><b>计算公式</b>：总油费 = (路程 ÷ 100) × 百公里油耗 × 燃油单价。</li>
            <li><b>分摊计算</b>：人均成本 = 总油费 ÷ 总人数。</li>
          </ul>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 燃油费用计算器</footer>
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { ArrowLeft, InfoFilled } from '@element-plus/icons-vue';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const inputs = reactive({
    distance: 100,
    consumption: 8.5,
    price: 7.85,
    people: 1
  });

  const history = ref([]);

  const totalFuel = computed(() => {
    return (inputs.distance / 100) * inputs.consumption;
  });

  const totalCost = computed(() => {
    return totalFuel.value * inputs.price;
  });

  const priceVariations = computed(() => {
    const base = Math.floor(inputs.price);
    return [base - 1, base - 0.5, base, base + 0.5, base + 1];
  });

  const clearInputs = () => {
    inputs.distance = 0;
    inputs.consumption = 0;
    inputs.price = 0;
    inputs.people = 1;
  };

  const saveToHistory = () => {
    if (inputs.distance <= 0) return;
    history.value.unshift({
      distance: inputs.distance,
      consumption: inputs.consumption,
      price: inputs.price,
      cost: totalCost.value,
      time: new Date().getTime()
    });
    if (history.value.length > 10) history.value.pop();
    localStorage.setItem('vb_fuel_history', JSON.stringify(history.value));
  };

  const loadHistory = h => {
    inputs.distance = h.distance;
    inputs.consumption = h.consumption;
    inputs.price = h.price;
  };

  onMounted(() => {
    const saved = localStorage.getItem('vb_fuel_history');
    if (saved) {
      history.value = JSON.parse(saved);
    }
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
    padding: 2rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .form-item label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: #64748b;
    font-weight: 500;
  }

  .result-highlight {
    background: #f8fafc;
    border-radius: 16px;
    padding: 2rem;
    margin: 2rem 0;
    border: 1px solid #e2e8f0;
    text-align: center;
  }

  .main-result {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 2rem;
  }

  .main-result .currency {
    font-size: 1.5rem;
    color: #3b82f6;
    margin-bottom: -0.5rem;
  }

  .main-result .amount {
    font-size: 4rem;
    font-weight: 800;
    color: #1e293b;
    line-height: 1;
  }

  .main-result .label {
    font-size: 0.9rem;
    color: #64748b;
    margin-top: 0.5rem;
  }

  .secondary-results {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .res-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .res-item .val {
    font-weight: 700;
    color: #334155;
    font-size: 1.1rem;
  }

  .res-item .lab {
    font-size: 0.75rem;
    color: #94a3b8;
  }

  .chart-section h4 {
    margin-bottom: 1rem;
    color: #475569;
  }

  .cost-table {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
  }

  .table-header {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    background: #f1f5f9;
    padding: 0.75rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: #64748b;
  }

  .table-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    padding: 0.75rem;
    font-size: 0.9rem;
    border-top: 1px solid #f1f5f9;
  }

  .table-row.current {
    background: #eff6ff;
    color: #2563eb;
    font-weight: 600;
  }

  .sidebar {
    padding: 1.5rem;
  }

  .reference-section h3,
  .history-list h3 {
    margin: 0 0 1rem;
    font-size: 1.1rem;
  }

  .ref-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .ref-item {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
  }

  .ref-item .type {
    color: #64748b;
  }

  .ref-item .value {
    font-weight: 600;
    color: #334155;
  }

  .history-items {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .h-card {
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .h-card:hover {
    border-color: #3b82f6;
    background: #f8fafc;
  }

  .h-top {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.25rem;
  }

  .h-top span {
    font-size: 0.8rem;
    color: #94a3b8;
  }

  .h-bottom {
    font-size: 0.75rem;
    color: #64748b;
  }

  .empty-history {
    padding: 1rem;
    text-align: center;
    color: #94a3b8;
    font-size: 0.9rem;
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
