<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon><span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">小费/分账计算器</h1>
        <span class="tool-subtitle">Tip & Bill Splitter</span>
      </div>
      <div class="header-right">
        <el-button type="primary" plain @click="reset">重置</el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="layout-container">
        <div class="main-section glass-card">
          <div class="input-section">
            <div class="input-item">
              <label>账单总金额 (Bill Amount)</label>
              <div class="money-input">
                <span class="unit">¥</span>
                <el-input-number
                  v-model="billAmount"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="0.00"
                  style="width: 100%"
                />
              </div>
            </div>

            <div class="input-item">
              <label>小费比例 (Tip %)</label>
              <div class="tip-options">
                <button
                  v-for="p in tipPresets"
                  :key="p"
                  class="tip-btn"
                  :class="{ active: tipPercent === p && !isCustomTip }"
                  @click="setTip(p)"
                >
                  {{ p }}%
                </button>
                <div class="custom-tip" :class="{ active: isCustomTip }">
                  <el-input-number
                    v-model="customTipValue"
                    :min="0"
                    :max="100"
                    placeholder="自定义"
                    @focus="isCustomTip = true"
                    @input="onCustomTipInput"
                  />
                  <span class="pct">%</span>
                </div>
              </div>
            </div>

            <div class="input-item">
              <label>分摊天数/人数 (Number of People)</label>
              <el-input-number v-model="numPeople" :min="1" :max="100" style="width: 100%" />
            </div>
          </div>

          <div class="result-card">
            <div class="result-row main">
              <div class="res-item">
                <span class="res-lab">每人应付 (Total Per Person)</span>
                <span class="res-val">¥ {{ perPersonTotal.toFixed(2) }}</span>
              </div>
            </div>
            <el-divider />
            <div class="result-row grid">
              <div class="res-item">
                <span class="res-lab">账单原价</span>
                <span class="res-sub">¥ {{ billAmount.toFixed(2) }}</span>
              </div>
              <div class="res-item">
                <span class="res-lab">小费总额</span>
                <span class="res-sub">¥ {{ totalTip.toFixed(2) }}</span>
              </div>
              <div class="res-item">
                <span class="res-lab">总计金额</span>
                <span class="res-sub">¥ {{ totalAmount.toFixed(2) }}</span>
              </div>
              <div class="res-item">
                <span class="res-lab">每人小费</span>
                <span class="res-sub">¥ {{ (totalTip / numPeople).toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <div class="rounding-options">
            <label>结果取整方式</label>
            <el-radio-group v-model="roundingType" size="small">
              <el-radio-button label="none">不取整</el-radio-button>
              <el-radio-button label="round">四舍五入</el-radio-button>
              <el-radio-button label="ceil">向上取整</el-radio-button>
              <el-radio-button label="floor">向下取整</el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <div class="sidebar glass-card">
          <h3>快捷分摊情景</h3>
          <div class="scenarios">
            <div class="scenario-item" @click="applyScenario(500, 10, 5)">
              <div class="s-info">
                <strong>公司小组聚餐</strong>
                <span>¥500, 10% 小费, 5人分账</span>
              </div>
              <el-icon><ArrowRight /></el-icon>
            </div>
            <div class="scenario-item" @click="applyScenario(128, 5, 2)">
              <div class="s-info">
                <strong>情侣约会</strong>
                <span>¥128, 5% 小费, 2人分账</span>
              </div>
              <el-icon><ArrowRight /></el-icon>
            </div>
            <div class="scenario-item" @click="applyScenario(2400, 15, 12)">
              <div class="s-info">
                <strong>大型派对</strong>
                <span>¥2400, 15% 小费, 12人分账</span>
              </div>
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </div>

      <div class="tips-section glass-card">
        <div class="tips-header">
          <el-icon><InfoFilled /></el-icon>
          <h4>小费文化参考</h4>
        </div>
        <div class="tips-content">
          <ul class="premium-list">
            <li>
              <b>中国</b>：大部分餐厅不收小费，部分高级餐厅会直接在账单里包含 10%-15% 的服务费。
            </li>
            <li><b>美国</b>：服务性行业（如餐厅、出租车）习惯支付 15%-25% 的小费。</li>
            <li>
              <b>欧洲</b>：通常账单已含服务费。若服务出色，可支付 5%-10% 的额外小费或直接抹零。
            </li>
            <li><b>日本/韩国</b>：完全没有给小费的习惯，甚至可能被视为不礼貌。</li>
          </ul>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 小费分账计算器</footer>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { ArrowLeft, ArrowRight, InfoFilled } from '@element-plus/icons-vue';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const billAmount = ref(0);
  const tipPercent = ref(15);
  const isCustomTip = ref(false);
  const customTipValue = ref(0);
  const numPeople = ref(1);
  const roundingType = ref('none');

  const tipPresets = [0, 5, 10, 15, 20];

  const setTip = p => {
    tipPercent.value = p;
    isCustomTip.value = false;
  };

  const onCustomTipInput = val => {
    tipPercent.value = val;
  };

  const totalTip = computed(() => {
    return (billAmount.value * tipPercent.value) / 100;
  });

  const totalAmount = computed(() => {
    return billAmount.value + totalTip.value;
  });

  const perPersonTotal = computed(() => {
    let val = totalAmount.value / numPeople.value;
    if (roundingType.value === 'round') return Math.round(val);
    if (roundingType.value === 'ceil') return Math.ceil(val);
    if (roundingType.value === 'floor') return Math.floor(val);
    return val;
  });

  const reset = () => {
    billAmount.value = 0;
    tipPercent.value = 15;
    isCustomTip.value = false;
    numPeople.value = 1;
  };

  const applyScenario = (amount, tip, people) => {
    billAmount.value = amount;
    tipPercent.value = tip;
    numPeople.value = people;
    isCustomTip.value = false;
  };
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

  .input-section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .input-item label {
    display: block;
    margin-bottom: 1rem;
    font-size: 0.95rem;
    color: #475569;
    font-weight: 600;
  }

  .money-input {
    display: flex;
    align-items: center;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 0 1rem;
  }

  .money-input .unit {
    font-size: 1.5rem;
    color: #94a3b8;
    margin-right: 0.5rem;
  }

  .money-input :deep(.el-input__wrapper) {
    background: transparent !important;
    box-shadow: none !important;
  }

  .money-input :deep(.el-input__inner) {
    font-size: 2rem;
    font-weight: 700;
    height: 60px;
    color: #1e293b;
  }

  .tip-options {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }

  .tip-btn {
    height: 48px;
    border: 1px solid #e2e8f0;
    background: white;
    border-radius: 8px;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;
  }

  .tip-btn:hover {
    border-color: #3b82f6;
    color: #3b82f6;
  }

  .tip-btn.active {
    background: #3b82f6;
    border-color: #3b82f6;
    color: white;
  }

  .custom-tip {
    display: flex;
    align-items: center;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding-right: 0.75rem;
    overflow: hidden;
  }

  .custom-tip.active {
    border-color: #3b82f6;
  }

  .custom-tip :deep(.el-input__wrapper) {
    box-shadow: none !important;
  }

  .pct {
    color: #94a3b8;
  }

  .result-card {
    margin-top: 3rem;
    background: #1e293b;
    border-radius: 16px;
    padding: 2rem;
    color: white;
  }

  .result-row.main {
    text-align: center;
    padding-bottom: 1rem;
  }

  .result-row.grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    row-gap: 1.5rem;
    padding-top: 1rem;
  }

  .res-lab {
    display: block;
    font-size: 0.8rem;
    color: #94a3b8;
    margin-bottom: 0.25rem;
  }

  .res-val {
    font-size: 2.5rem;
    font-weight: 800;
    color: #10b981;
  }

  .res-sub {
    font-size: 1.1rem;
    font-weight: 600;
  }

  .rounding-options {
    margin-top: 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .rounding-options label {
    font-size: 0.85rem;
    color: #64748b;
  }

  .sidebar {
    padding: 1.5rem;
  }

  .sidebar h3 {
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
  }

  .scenarios {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .scenario-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .scenario-item:hover {
    background: #f8fafc;
    border-color: #3b82f6;
    transform: translateX(4px);
  }

  .s-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .s-info strong {
    font-size: 0.95rem;
    color: #1e293b;
  }

  .s-info span {
    font-size: 0.8rem;
    color: #94a3b8;
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
