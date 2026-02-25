<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">小费<span>.分账()</span></h1>
        <button class="brutal-btn reset-btn" @click="reset">🔄 重置</button>
      </header>

      <main class="main-content">
        <div class="layout-container">
          <div class="brutal-pane main-section">
            <div class="pane-header bg-yellow">
              <span>💰 账单信息</span>
            </div>
            <div class="pane-body">
              <div class="form-group">
                <label>账单总金额 (Bill Amount)</label>
                <div class="money-input">
                  <span class="currency">¥</span>
                  <input
                    v-model.number="billAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    class="brutal-input money"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div class="form-group">
                <label>小费比例 (Tip %)</label>
                <div class="tip-grid">
                  <button
                    v-for="p in tipPresets"
                    :key="p"
                    class="tip-btn"
                    :class="{ active: tipPercent === p && !isCustomTip }"
                    @click="setTip(p)"
                  >
                    {{ p }}%
                  </button>
                  <div class="custom-tip-wrap" :class="{ active: isCustomTip }">
                    <input
                      v-model.number="customTipValue"
                      type="number"
                      min="0"
                      max="100"
                      class="brutal-input custom-tip-input"
                      placeholder="自定义"
                      @focus="isCustomTip = true"
                      @input="onCustomTipInput"
                    />
                    <span class="pct-label">%</span>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label>分摊人数 (Number of People)</label>
                <div class="people-input">
                  <button class="adj-btn" @click="numPeople = Math.max(1, numPeople - 1)">−</button>
                  <input
                    v-model.number="numPeople"
                    type="number"
                    min="1"
                    max="100"
                    class="brutal-input people"
                  />
                  <button class="adj-btn" @click="numPeople = Math.min(100, numPeople + 1)">
                    +
                  </button>
                </div>
              </div>

              <div class="result-card">
                <div class="result-main">
                  <span class="res-lab">每人应付 (Total Per Person)</span>
                  <span class="res-val">¥ {{ perPersonTotal.toFixed(2) }}</span>
                </div>
                <div class="result-divider"></div>
                <div class="result-grid">
                  <div class="res-item">
                    <span class="res-lab">账单原价</span
                    ><span class="res-sub">¥ {{ billAmount.toFixed(2) }}</span>
                  </div>
                  <div class="res-item">
                    <span class="res-lab">小费总额</span
                    ><span class="res-sub">¥ {{ totalTip.toFixed(2) }}</span>
                  </div>
                  <div class="res-item">
                    <span class="res-lab">总计金额</span
                    ><span class="res-sub">¥ {{ totalAmount.toFixed(2) }}</span>
                  </div>
                  <div class="res-item">
                    <span class="res-lab">每人小费</span
                    ><span class="res-sub">¥ {{ (totalTip / numPeople).toFixed(2) }}</span>
                  </div>
                </div>
              </div>

              <div class="rounding-options">
                <label>结果取整方式:</label>
                <div class="rounding-btns">
                  <button
                    v-for="r in roundingOptions"
                    :key="r.value"
                    class="round-btn"
                    :class="{ active: roundingType === r.value }"
                    @click="roundingType = r.value"
                  >
                    {{ r.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="brutal-pane sidebar">
            <div class="pane-header bg-blue text-white">
              <span>⚡ 快捷情景</span>
            </div>
            <div class="pane-body">
              <div class="scenarios">
                <button class="scenario-item" @click="applyScenario(500, 10, 5)">
                  <div class="s-info">
                    <strong>公司小组聚餐</strong><span>¥500, 10% 小费, 5人分账</span>
                  </div>
                  <span class="arrow">→</span>
                </button>
                <button class="scenario-item" @click="applyScenario(128, 5, 2)">
                  <div class="s-info">
                    <strong>情侣约会</strong><span>¥128, 5% 小费, 2人分账</span>
                  </div>
                  <span class="arrow">→</span>
                </button>
                <button class="scenario-item" @click="applyScenario(2400, 15, 12)">
                  <div class="s-info">
                    <strong>大型派对</strong><span>¥2400, 15% 小费, 12人分账</span>
                  </div>
                  <span class="arrow">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="brutal-pane tips-section">
          <div class="pane-header bg-dark text-white pt-1 pb-1">
            <span>🌍 小费文化参考</span>
          </div>
          <div class="pane-body">
            <ul class="brutal-list">
              <li><b>中国</b>：大部分餐厅不收小费，部分高级餐厅会在账单中包含 10%-15% 服务费。</li>
              <li><b>美国</b>：服务性行业（餐厅、出租车等）习惯支付 15%-25% 的小费。</li>
              <li><b>欧洲</b>：通常账单已含服务费。若服务出色可额外支付 5%-10% 或直接抹零。</li>
              <li><b>日本/韩国</b>：完全没有给小费的习惯，甚至可能被视为不礼貌。</li>
            </ul>
          </div>
        </div>
      </main>

      <div class="brutal-status">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i">© 2026 LRM工具箱 - 小费分账计算器 // &nbsp;</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';

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
  const roundingOptions = [
    { value: 'none', label: '不取整' },
    { value: 'round', label: '四舍五入' },
    { value: 'ceil', label: '向上' },
    { value: 'floor', label: '向下' }
  ];

  const setTip = p => {
    tipPercent.value = p;
    isCustomTip.value = false;
  };
  const onCustomTipInput = () => {
    tipPercent.value = customTipValue.value || 0;
  };

  const totalTip = computed(() => (billAmount.value * tipPercent.value) / 100);
  const totalAmount = computed(() => billAmount.value + totalTip.value);
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
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

  .brutal-wrapper {
    background-color: #fdfae5;
    background-image:
      linear-gradient(#e5e5e5 2px, transparent 2px),
      linear-gradient(90deg, #e5e5e5 2px, transparent 2px);
    background-size: 40px 40px;
    min-height: 100vh;
    padding: 2rem;
    box-sizing: border-box;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    color: #111;
  }
  .brutal-container {
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3rem;
    font-weight: 800;
    margin: 0;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #00e572;
  }
  .brutal-title span {
    color: #00e572;
    text-shadow: 4px 4px 0px #111;
  }
  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition: all 0.1s;
    color: #111;
  }
  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0 0 0 #111;
  }
  .bg-yellow {
    background: #ffd900;
  }
  .bg-blue {
    background: #4b7bff;
    color: #fff;
  }
  .bg-dark {
    background: #111;
    color: #fff;
  }
  .text-white {
    color: #fff;
  }
  .brutal-pane {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
  }
  .pane-body {
    padding: 1.5rem;
  }
  .main-content {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }
  .layout-container {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 2rem;
  }
  @media (max-width: 992px) {
    .layout-container {
      grid-template-columns: 1fr;
    }
  }

  .form-group {
    margin-bottom: 2rem;
  }
  .form-group label {
    display: block;
    margin-bottom: 0.75rem;
    font-size: 1rem;
    font-weight: 800;
  }
  .money-input {
    display: flex;
    align-items: center;
    border: 4px solid #111;
    box-shadow: 4px 4px 0px #111;
    background: #fff;
  }
  .currency {
    font-size: 2rem;
    font-weight: 800;
    padding: 0 1rem;
    color: #555;
    border-right: 3px solid #111;
  }
  .brutal-input {
    border: none;
    padding: 1rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 800;
    font-size: 1.5rem;
    outline: none;
    background: transparent;
    color: #111;
    width: 100%;
  }
  .brutal-input.money {
    font-size: 2rem;
  }
  .tip-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }
  .tip-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.75rem;
    font-weight: 800;
    font-size: 1.1rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }
  .tip-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }
  .tip-btn.active {
    background: #4b7bff;
    color: #fff;
    box-shadow: 0 0 0 #111;
    transform: translate(3px, 3px);
  }
  .custom-tip-wrap {
    display: flex;
    align-items: center;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #111;
    background: #fff;
  }
  .custom-tip-wrap.active {
    border-color: #4b7bff;
    box-shadow: 3px 3px 0px #4b7bff;
  }
  .custom-tip-input {
    font-size: 1.1rem;
    padding: 0.75rem;
    border: none;
  }
  .pct-label {
    padding: 0 0.75rem;
    font-weight: 800;
    color: #555;
  }
  .people-input {
    display: flex;
    align-items: center;
    border: 4px solid #111;
    box-shadow: 4px 4px 0px #111;
    background: #fff;
  }
  .people-input .brutal-input {
    text-align: center;
    font-size: 1.5rem;
  }
  .adj-btn {
    width: 56px;
    background: #ffd900;
    border: none;
    border-right: 3px solid #111;
    font-size: 1.5rem;
    font-weight: 900;
    cursor: pointer;
    padding: 1rem;
    transition: background 0.1s;
  }
  .adj-btn:last-child {
    border-right: none;
    border-left: 3px solid #111;
  }
  .adj-btn:hover {
    background: #00e572;
  }
  .adj-btn:active {
    background: #111;
    color: #fff;
  }
  .result-card {
    margin-top: 1.5rem;
    background: #111;
    border: 4px solid #111;
    padding: 2rem;
    color: #fff;
    box-shadow: 8px 8px 0px #4b7bff;
  }
  .result-main {
    text-align: center;
    padding-bottom: 1.5rem;
  }
  .res-val {
    font-size: 3rem;
    font-weight: 900;
    color: #00e572;
    font-family: 'Syne', monospace;
    display: block;
    margin-top: 0.5rem;
    text-shadow: 3px 3px 0px rgba(0, 0, 0, 0.3);
  }
  .result-divider {
    height: 4px;
    background: #333;
    margin-bottom: 1.5rem;
  }
  .result-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    row-gap: 1.5rem;
  }
  .res-item {
    text-align: center;
  }
  .res-lab {
    display: block;
    font-size: 0.85rem;
    color: #888;
    margin-bottom: 0.25rem;
    font-weight: 700;
  }
  .res-sub {
    font-size: 1.25rem;
    font-weight: 800;
  }
  .rounding-options {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .rounding-options > label {
    font-weight: 800;
    font-size: 0.95rem;
    white-space: nowrap;
  }
  .rounding-btns {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .round-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.4rem 0.8rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.1s;
    font-size: 0.9rem;
  }
  .round-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
  }
  .round-btn.active {
    background: #ffd900;
    box-shadow: 0 0 0 #111;
    transform: translate(2px, 2px);
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
    padding: 1.25rem;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    cursor: pointer;
    transition: all 0.15s;
    background: #fff;
    text-align: left;
  }
  .scenario-item:hover {
    transform: translate(-3px, -3px);
    box-shadow: 7px 7px 0px #111;
    background: #fdfae5;
  }
  .scenario-item:active {
    transform: translate(2px, 2px);
    box-shadow: 0 0 0 #111;
  }
  .s-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .s-info strong {
    font-size: 1.05rem;
    font-weight: 800;
  }
  .s-info span {
    font-size: 0.85rem;
    color: #555;
    font-weight: 600;
  }
  .arrow {
    font-size: 1.5rem;
    font-weight: 900;
  }
  .brutal-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .brutal-list li {
    font-size: 0.95rem;
    position: relative;
    padding-left: 1.5rem;
    line-height: 1.6;
    font-weight: 600;
  }
  .brutal-list li::before {
    content: '▪';
    position: absolute;
    left: 0;
    color: #4b7bff;
    font-weight: 900;
    font-size: 1.2rem;
  }
  .brutal-status {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    padding: 1rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.2rem;
    overflow: hidden;
  }
  .marquee-wrapper {
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
  @media (max-width: 768px) {
    .brutal-title {
      font-size: 2rem;
    }
  }

  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-status,
  [data-theme='dark'] .scenario-item {
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
    box-shadow: 0 0 0 #eee;
  }
  [data-theme='dark'] .brutal-pane {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
  }
  [data-theme='dark'] .bg-dark {
    background: #333;
  }
  [data-theme='dark'] .money-input,
  [data-theme='dark'] .people-input {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
    background: #222;
  }
  [data-theme='dark'] .currency {
    color: #aaa;
    border-right-color: #eee;
  }
  [data-theme='dark'] .brutal-input {
    color: #eee;
  }
  [data-theme='dark'] .tip-btn {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .tip-btn.active {
    background: #2a4eb2;
    color: #fff;
    box-shadow: 0 0 0 #eee;
  }
  [data-theme='dark'] .custom-tip-wrap {
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
    background: #222;
  }
  [data-theme='dark'] .custom-tip-wrap.active {
    border-color: #89b4f8;
    box-shadow: 3px 3px 0px #89b4f8;
  }
  [data-theme='dark'] .adj-btn {
    background: #b28f00;
    border-color: #eee;
  }
  [data-theme='dark'] .adj-btn:hover {
    background: #00994c;
  }
  [data-theme='dark'] .adj-btn:active {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .result-card {
    background: #222;
    border-color: #eee;
    box-shadow: 8px 8px 0px #2a4eb2;
  }
  [data-theme='dark'] .res-val {
    color: #00994c;
  }
  [data-theme='dark'] .result-divider {
    background: #444;
  }
  [data-theme='dark'] .round-btn {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .round-btn.active {
    background: #b28f00;
    box-shadow: 0 0 0 #eee;
  }
  [data-theme='dark'] .scenario-item {
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .scenario-item:hover {
    box-shadow: 7px 7px 0px #eee;
    background: #222;
  }
  [data-theme='dark'] .s-info span {
    color: #aaa;
  }
  [data-theme='dark'] .brutal-list li::before {
    color: #89b4f8;
  }
  [data-theme='dark'] .brutal-status {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
</style>
