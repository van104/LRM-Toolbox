<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">健康<span>.酒精代谢估算()</span></h1>
      </header>

      <div class="brutal-grid">
        <!-- Input section -->
        <div class="brutal-pane param-pane">
          <div class="pane-header bg-yellow"><span>个人生理参数</span></div>
          <div class="pane-body">
            <div class="form-row">
              <div class="form-item half">
                <label>体重 (kg)</label>
                <input
                  v-model.number="weight"
                  type="number"
                  class="brutal-input"
                  min="40"
                  max="150"
                />
              </div>
              <div class="form-item half">
                <label>性别</label>
                <select v-model="gender" class="brutal-select">
                  <option value="male">👨 男 (Male)</option>
                  <option value="female">👩 女 (Female)</option>
                </select>
              </div>
            </div>

            <div class="divider"></div>

            <h3 class="section-title">🍷 饮酒详情</h3>
            <div class="drink-list">
              <div v-for="(drink, index) in drinks" :key="index" class="drink-row">
                <div class="drink-item">
                  <label>酒类排量/度数</label>
                  <select v-model.number="drink.abv" class="brutal-select">
                    <option :value="4">啤酒 (3-5%)</option>
                    <option :value="13">红酒 (12-15%)</option>
                    <option :value="18">黄酒 (15-20%)</option>
                    <option :value="15">清酒 (15%)</option>
                    <option :value="38">白酒 (38%)</option>
                    <option :value="52">白酒 (52%)</option>
                    <option :value="40">威士忌/伏特加 (40%)</option>
                  </select>
                </div>
                <div class="drink-item">
                  <label>饮用量 (ml)</label>
                  <input
                    v-model.number="drink.amount"
                    type="number"
                    class="brutal-input"
                    min="0"
                    step="50"
                  />
                </div>
                <button
                  v-if="drinks.length > 1"
                  class="brutal-action-btn del-btn danger"
                  @click="removeDrink(index)"
                >
                  ✖
                </button>
              </div>
              <button class="brutal-action-btn add-btn" @click="addDrink">➕ 添加一种酒</button>
            </div>
          </div>
        </div>

        <!-- Result section -->
        <div class="brutal-pane result-pane">
          <div class="pane-header bg-black"><span class="text-white">估算结果</span></div>
          <div class="pane-body">
            <div class="result-box">
              <span class="label">预计代谢时长</span>
              <div class="time-display">
                <span class="value">{{ result.hours }}</span> <span class="unit">小时</span>
                <span class="value">{{ result.minutes }}</span> <span class="unit">分</span>
              </div>
            </div>

            <div class="bac-info">
              <p>
                估算体内酒精含量 (BAC):
                <strong class="bac-val">{{ result.bac.toFixed(2) }} mg/100ml</strong>
              </p>

              <div v-if="result.bac > 20 && result.bac <= 80" class="alert-box warn">
                <strong>⚠️ 超过酒驾标准 (20mg/100ml)</strong>
                <p>切勿心存侥幸，请勿驾驶车辆。</p>
              </div>
              <div v-if="result.bac > 80" class="alert-box danger">
                <strong>🚨 超过醉驾标准 (80mg/100ml)</strong>
                <p>已达醉酒标准，绝对禁止驾驶任何车辆！</p>
              </div>
            </div>

            <div class="disclaimer-brutal">
              <strong>// 免责声明</strong>
              <p>
                计算结果仅供参考！酒精代谢受个人体质（如乙醛脱氢酶活性）、进食情况、睡眠、药物等多种因素影响，实际值可能有较大偏差。
              </p>
              <p class="strong-text">严禁酒后驾车，建议饮酒后 24 小时内不要驾驶。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed } from 'vue';

  const weight = ref(70);
  const gender = ref('male');

  interface Drink {
    abv: number;
    amount: number;
  }

  const drinks = reactive<Drink[]>([{ abv: 4, amount: 330 }]);

  const addDrink = () => drinks.push({ abv: 4, amount: 330 });
  const removeDrink = (index: number) => drinks.splice(index, 1);

  const result = computed(() => {
    let totalAlcoholMass = 0;
    drinks.forEach(d => {
      totalAlcoholMass += d.amount * (d.abv / 100) * 0.8;
    });

    const r = gender.value === 'male' ? 0.68 : 0.55;
    let bac = (totalAlcoholMass / (weight.value * r)) * 100;
    if (bac < 0) bac = 0;

    const clearanceRate = 15;
    const hoursTotal = bac / clearanceRate;
    const hours = Math.floor(hoursTotal);
    const minutes = Math.round((hoursTotal - hours) * 60);

    return { hours, minutes, bac };
  });
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');
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
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }
  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.5rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0 #4b7bff;
    flex: 1;
    text-align: center;
  }
  .brutal-title span {
    color: #4b7bff;
    text-shadow: 4px 4px 0 #111;
    letter-spacing: 0;
  }
  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 6px 6px 0 #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }
  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0 #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0 0 0 #111;
  }

  .brutal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2.5rem;
  }
  .brutal-pane {
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0 #111;
  }
  .pane-header {
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.25rem;
  }
  .bg-yellow {
    background: #ffd900;
  }
  .bg-black {
    background: #111;
  }
  .text-white {
    color: #fff;
  }
  .pane-body {
    padding: 2rem;
    flex: 1;
  }

  .form-row {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .form-item {
    margin-bottom: 1.5rem;
  }
  .form-item.half {
    flex: 1;
    min-width: 150px;
  }
  .form-item label,
  .drink-item label {
    display: block;
    font-weight: bold;
    margin-bottom: 0.5rem;
    font-size: 0.95rem;
  }

  .brutal-input,
  .brutal-select {
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
    border: 3px solid #111;
    background: #fff;
    font-weight: bold;
    box-sizing: border-box;
    font-family: 'IBM Plex Mono', monospace;
  }
  .brutal-input:focus,
  .brutal-select:focus {
    outline: none;
    box-shadow: 4px 4px 0 #4b7bff;
  }

  .divider {
    border-top: 3px dashed #111;
    margin: 2rem 0;
  }

  .section-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.2rem;
    font-weight: 800;
    margin-bottom: 1rem;
  }

  .drink-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .drink-row {
    display: flex;
    gap: 1rem;
    align-items: flex-end;
    background: #fdfae5;
    padding: 1rem;
    border: 3px solid #111;
  }
  .drink-item {
    flex: 1;
  }
  .brutal-action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.6rem 1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 4px 4px 0 #111;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
  }
  .brutal-action-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #111;
  }
  .brutal-action-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0 0 0 #111;
  }
  .brutal-action-btn.del-btn {
    padding: 0.7rem;
    aspect-ratio: 1;
  }
  .brutal-action-btn.danger {
    background: #ff4b4b;
    color: white;
  }
  .brutal-action-btn.add-btn {
    width: 100%;
    background: #ffd900;
    margin-top: 0.5rem;
    padding: 1rem;
    font-size: 1.1rem;
  }

  .result-box {
    text-align: center;
    margin-bottom: 2rem;
    background: #fafafa;
    padding: 2rem;
    border: 4px solid #111;
  }
  .result-box .label {
    display: block;
    font-weight: 800;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }
  .time-display {
    display: flex;
    justify-content: center;
    align-items: baseline;
    gap: 0.5rem;
  }
  .time-display .value {
    font-size: 3.5rem;
    font-weight: 900;
    color: #4b7bff;
    text-shadow: 3px 3px 0 #111;
    line-height: 1;
  }
  .time-display .unit {
    font-size: 1.25rem;
    font-weight: bold;
  }

  .bac-info {
    margin-bottom: 2rem;
    font-size: 1.1rem;
  }
  .bac-val {
    font-size: 1.5rem;
    color: #ff4b4b;
    margin-left: 0.5rem;
  }
  .alert-box {
    border: 4px solid #111;
    padding: 1rem 1.5rem;
    margin-top: 1rem;
    background: #fff;
    box-shadow: 4px 4px 0 #111;
  }
  .alert-box.warn {
    background: #ffd900;
  }
  .alert-box.danger {
    background: #ff4b4b;
    color: white;
  }
  .alert-box strong {
    font-size: 1.1rem;
    display: block;
    margin-bottom: 0.5rem;
  }
  .alert-box p {
    margin: 0;
    font-size: 0.95rem;
  }

  .disclaimer-brutal {
    border: 3px dashed #111;
    padding: 1.5rem;
    margin-top: 2rem;
    background: #fff8e0;
    font-size: 0.9rem;
  }
  .disclaimer-brutal strong {
    display: block;
    margin-bottom: 0.5rem;
    font-family: 'Syne', sans-serif;
    font-size: 1rem;
    color: #ff4b4b;
  }
  .disclaimer-brutal p {
    margin: 0 0 0.5rem;
    line-height: 1.6;
  }
  .disclaimer-brutal .strong-text {
    font-weight: bold;
    color: #111;
    margin-bottom: 0;
  }

  @media (max-width: 900px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .brutal-title {
      font-size: 2.5rem;
    }
    .drink-row {
      flex-direction: column;
      align-items: stretch;
    }
  }

  /* Dark Mode */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .brutal-select,
  [data-theme='dark'] .result-box,
  [data-theme='dark'] .alert-box {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn {
    box-shadow: 6px 6px 0 #eee;
  }
  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 9px 9px 0 #eee;
  }
  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0 #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0 #eee;
  }
  [data-theme='dark'] .brutal-action-btn {
    box-shadow: 4px 4px 0 #eee;
  }
  [data-theme='dark'] .brutal-action-btn:hover {
    box-shadow: 6px 6px 0 #eee;
  }
  [data-theme='dark'] .bg-yellow,
  [data-theme='dark'] .brutal-action-btn.add-btn,
  [data-theme='dark'] .alert-box.warn {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .alert-box.danger,
  [data-theme='dark'] .brutal-action-btn.danger {
    background: #8b0000;
    border-color: #eee;
  }
  [data-theme='dark'] .pane-body {
    background: #1a1a1a;
  }
  [data-theme='dark'] .time-display .value {
    text-shadow: 3px 3px 0 #fff;
    color: #2a4eb2;
  }
  [data-theme='dark'] .divider {
    border-color: #eee;
  }
  [data-theme='dark'] .drink-row {
    background: #222;
    border-color: #eee;
  }
  [data-theme='dark'] .disclaimer-brutal {
    background: #3a2a00;
    border-color: #eee;
  }
  [data-theme='dark'] .disclaimer-brutal strong {
    color: #ff8b8b;
  }
  [data-theme='dark'] .bac-val {
    color: #ff8b8b;
  }
</style>
