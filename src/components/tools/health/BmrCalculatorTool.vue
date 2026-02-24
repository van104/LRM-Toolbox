<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">健康<span>.BMR高阶计算()</span></h1>
      </header>

      <div class="brutal-grid-layout">
        <!-- Input Sidebar -->
        <aside class="sidebar-pane">
          <div class="brutal-pane">
            <div class="pane-header bg-black"><span class="text-white">⚙️ 个人数据</span></div>
            <div class="pane-body padding-small">
              <div class="form-group">
                <label>性别</label>
                <div class="brutal-radio-group">
                  <label class="radio-btn" :class="{ active: form.gender === 'male' }">
                    <input v-model="form.gender" type="radio" value="male" class="hidden-radio" />
                    男 (Male)
                  </label>
                  <label class="radio-btn" :class="{ active: form.gender === 'female' }">
                    <input v-model="form.gender" type="radio" value="female" class="hidden-radio" />
                    女 (Female)
                  </label>
                </div>
              </div>

              <div class="form-group row-group">
                <div class="half">
                  <label>年龄 (岁)</label>
                  <input
                    v-model.number="form.age"
                    type="number"
                    class="brutal-input"
                    min="10"
                    max="100"
                  />
                </div>
                <div class="half">
                  <label>身高 (cm)</label>
                  <input
                    v-model.number="form.height"
                    type="number"
                    class="brutal-input"
                    min="100"
                    max="250"
                  />
                </div>
              </div>

              <div class="form-group row-group">
                <div class="half">
                  <label>体重 (kg)</label>
                  <input
                    v-model.number="form.weight"
                    type="number"
                    class="brutal-input"
                    min="30"
                    max="250"
                  />
                </div>
                <div class="half">
                  <label>体脂率 % (选填)</label>
                  <input
                    v-model.number="form.bodyFat"
                    type="number"
                    class="brutal-input"
                    min="3"
                    max="60"
                    placeholder="启用高精度"
                  />
                </div>
              </div>

              <div class="form-group mt-4">
                <label>日常活动量</label>
                <select v-model="form.activity" class="brutal-select">
                  <option :value="1.2">卧床/极少运动 (x1.2)</option>
                  <option :value="1.375">轻度运动 1-3次/周 (x1.375)</option>
                  <option :value="1.55">中度运动 3-5次/周 (x1.55)</option>
                  <option :value="1.725">积极运动 6-7次/周 (x1.725)</option>
                  <option :value="1.9">专业运动员级别 (x1.9)</option>
                </select>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main Analysis -->
        <main class="main-content-pane">
          <div class="brutal-pane result-pane">
            <div class="pane-header bg-yellow"><span>🔥 能量消耗分析</span></div>
            <div class="pane-body">
              <div class="tdee-display">
                <span class="label">每日总能量消耗 (TDEE)</span>
                <div class="value-block">
                  <span class="value">{{ Math.round(results.tdee) }}</span>
                  <span class="unit">kcal</span>
                </div>
                <p class="desc">// 维持当前体重的建议热量摄入</p>
              </div>

              <div class="comparison-grid mt-6">
                <div class="bmr-card">
                  <h4>Mifflin-St Jeor [通用]</h4>
                  <div class="bmr-val">
                    {{ Math.round(results.bmrMS) }}<span class="unit-sm">kcal/d</span>
                  </div>
                  <p>国际通用标准计算公式</p>
                </div>
                <div class="bmr-card" :class="{ inactive: !form.bodyFat }">
                  <h4>Katch-McArdle [精准]</h4>
                  <div class="bmr-val">
                    {{ form.bodyFat ? Math.round(results.bmrKM) : '--'
                    }}<span class="unit-sm">kcal/d</span>
                  </div>
                  <p>基于瘦体重，需填写体脂率</p>
                </div>
              </div>

              <div class="divider">TARGET热量建议</div>

              <div class="goal-grid">
                <div class="brutal-card goal-loss">
                  <div class="goal-header">🎯 减脂 (Fat Loss)</div>
                  <div class="range">
                    {{ Math.round(results.tdee - 500) }} - {{ Math.round(results.tdee - 300) }} kcal
                  </div>
                  <p>建议形成每日 300-500kcal 缺口</p>
                </div>
                <div class="brutal-card goal-gain">
                  <div class="goal-header">⚡ 增肌 (Bulking)</div>
                  <div class="range">
                    {{ Math.round(results.tdee + 200) }} - {{ Math.round(results.tdee + 400) }} kcal
                  </div>
                  <p>阶梯式缓慢盈余，控制脂肪增长</p>
                </div>
              </div>

              <div class="expert-tips brutal-infobox">
                <h5>💡 知识小百科</h5>
                <ul>
                  <li><strong>BMR</strong>：维持基本生命活动（心跳、呼吸等）所需最低能量。</li>
                  <li><strong>TDEE</strong>：BMR × 活动系数 = 每日总耗能。</li>
                  <li>
                    <strong>Katch-McArdle</strong>
                    公式排除了脂肪组织的干扰，对健身/低体脂人群更准确。
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>

      <div class="disclaimer-brutal text-center">
        <strong>⚠️ 注意：</strong>
        代谢率受激素水平、肌肉量、睡眠、补剂等多种动态因素影响，本结果仅供理论推导与参考。
      </div>
    </div>
  </div>
</template>

<script setup>
  import { reactive, computed } from 'vue';

  const form = reactive({
    gender: 'male',
    age: 25,
    height: 175,
    weight: 70,
    bodyFat: null,
    activity: 1.375
  });

  const results = computed(() => {
    let bmrMS = 10 * form.weight + 6.25 * form.height - 5 * form.age;
    bmrMS += form.gender === 'male' ? 5 : -161;

    let bmrKM = 0;
    if (form.bodyFat) {
      const lbm = form.weight * (1 - form.bodyFat / 100);
      bmrKM = 370 + 21.6 * lbm;
    }

    const baseBmr = form.bodyFat && bmrKM > 0 ? bmrKM : bmrMS;
    const tdee = baseBmr * form.activity;
    return { bmrMS, bmrKM, tdee };
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
    max-width: 1300px;
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
    font-family: 'Syne', sans-serif;
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

  .brutal-grid-layout {
    display: grid;
    grid-template-columns: 360px 1fr;
    gap: 2.5rem;
    margin-bottom: 2rem;
  }

  .brutal-pane {
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0 #111;
    min-width: 0;
  }
  .pane-header {
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.25rem;
  }
  .bg-black {
    background: #111;
    color: white;
  }
  .bg-yellow {
    background: #ffd900;
  }
  .pane-body {
    padding: 2rem;
    flex: 1;
    box-sizing: border-box;
  }
  .padding-small {
    padding: 1.5rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }
  .form-group label {
    display: block;
    font-weight: 800;
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }
  .row-group {
    display: flex;
    gap: 1rem;
  }
  .half {
    flex: 1;
  }
  .mt-4 {
    margin-top: 1.5rem;
  }
  .mt-6 {
    margin-top: 2rem;
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
    transition: all 0.1s;
  }
  .brutal-input:focus,
  .brutal-select:focus {
    outline: none;
    box-shadow: 4px 4px 0 #4b7bff;
    border-color: #4b7bff;
  }

  .brutal-radio-group {
    display: flex;
    gap: 0.5rem;
  }
  .radio-btn {
    flex: 1;
    text-align: center;
    padding: 0.75rem;
    border: 3px solid #111;
    background: #fff;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.1s;
    box-shadow: 3px 3px 0 #111;
  }
  .hidden-radio {
    display: none;
  }
  .radio-btn.active {
    background: #4b7bff;
    color: white;
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0 #111;
  }

  .tdee-display {
    background: #111;
    color: #fff;
    text-align: center;
    padding: 2rem;
    border: 4px solid #111;
    box-shadow: 8px 8px 0 #4b7bff;
  }
  .tdee-display .label {
    font-size: 1rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .value-block {
    margin: 1rem 0 0.5rem;
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 0.5rem;
  }
  .value-block .value {
    font-size: 4rem;
    font-weight: 900;
    line-height: 1;
    font-family: 'Syne', sans-serif;
    color: #ffd900;
  }
  .value-block .unit {
    font-size: 1.25rem;
    font-weight: 800;
  }
  .tdee-display .desc {
    color: #aaa;
    margin: 0;
    font-size: 0.9rem;
  }

  .comparison-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
  .bmr-card {
    padding: 1.5rem;
    border: 3px solid #111;
    background: #fdfae5;
    box-shadow: 4px 4px 0 #111;
    transition: 0.2s;
  }
  .bmr-card.inactive {
    opacity: 0.5;
    background: #eee;
    box-shadow: none;
    border-style: dashed;
  }
  .bmr-card h4 {
    margin: 0 0 1rem;
    font-size: 1rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
  }
  .bmr-card .bmr-val {
    font-size: 2rem;
    font-weight: 900;
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
    color: #4b7bff;
  }
  .unit-sm {
    font-size: 0.9rem;
    color: #111;
    font-weight: 800;
  }
  .bmr-card p {
    margin: 0.5rem 0 0;
    font-size: 0.85rem;
    font-weight: bold;
    color: #555;
  }

  .divider {
    text-align: center;
    border-top: 3px dashed #111;
    margin: 3rem 0;
    padding-top: 1rem;
    font-weight: 900;
    font-family: 'Syne', sans-serif;
    font-size: 1.2rem;
  }

  .goal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
  .brutal-card {
    border: 4px solid #111;
    padding: 1.5rem;
    box-shadow: 6px 6px 0 #111;
    text-align: center;
  }
  .goal-loss {
    background: #ffe4e4;
  }
  .goal-gain {
    background: #e4ffe4;
  }
  .goal-header {
    font-weight: 900;
    font-size: 1.2rem;
    margin-bottom: 1rem;
    font-family: 'Syne', sans-serif;
  }
  .brutal-card .range {
    font-size: 1.8rem;
    font-weight: 900;
    margin-bottom: 0.5rem;
    font-family: 'IBM Plex Mono', monospace;
  }
  .brutal-card p {
    margin: 0;
    font-weight: 600;
    font-size: 0.95rem;
  }

  .brutal-infobox {
    margin-top: 3rem;
    background: #fff;
    border: 3px solid #111;
    padding: 1.5rem;
    position: relative;
  }
  .brutal-infobox h5 {
    margin: 0 0 1rem;
    font-family: 'Syne', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
  }
  .brutal-infobox ul {
    margin: 0;
    padding-left: 1.5rem;
    font-weight: 600;
    line-height: 1.6;
  }
  .brutal-infobox li {
    margin-bottom: 0.5rem;
  }
  .brutal-infobox li:last-child {
    margin-bottom: 0;
  }

  .disclaimer-brutal {
    border-top: 4px dashed #111;
    padding-top: 1.5rem;
    font-size: 0.9rem;
    font-weight: bold;
  }
  .text-center {
    text-align: center;
  }

  @media (max-width: 900px) {
    .brutal-grid-layout,
    .comparison-grid,
    .goal-grid,
    .row-group {
      grid-template-columns: 1fr;
      flex-direction: column;
    }
    .brutal-title {
      font-size: 2.5rem;
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
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .brutal-select,
  [data-theme='dark'] .radio-btn,
  [data-theme='dark'] .brutal-infobox {
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
  [data-theme='dark'] .brutal-input:focus,
  [data-theme='dark'] .brutal-select:focus {
    box-shadow: 4px 4px 0 #2a4eb2;
    border-color: #2a4eb2;
  }
  [data-theme='dark'] .bg-black {
    background: #222;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
    border-color: #eee;
  }
  [data-theme='dark'] .pane-body {
    background: #1a1a1a;
  }
  [data-theme='dark'] .radio-btn {
    box-shadow: 3px 3px 0 #eee;
  }
  [data-theme='dark'] .radio-btn.active {
    background: #2a4eb2;
    box-shadow: 5px 5px 0 #eee;
    border-color: #eee;
  }

  [data-theme='dark'] .tdee-display {
    background: #222;
    border-color: #eee;
    box-shadow: 8px 8px 0 #2a4eb2;
  }
  [data-theme='dark'] .bmr-card {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 4px 4px 0 #eee;
  }
  [data-theme='dark'] .bmr-card.inactive {
    background: #333;
    opacity: 0.6;
  }
  [data-theme='dark'] .bmr-val {
    color: #6b8cff;
  }
  [data-theme='dark'] .unit-sm {
    color: #eee;
  }

  [data-theme='dark'] .brutal-card {
    border-color: #eee;
    box-shadow: 6px 6px 0 #eee;
  }
  [data-theme='dark'] .goal-loss {
    background: #3a1a1a;
  }
  [data-theme='dark'] .goal-gain {
    background: #1a3a1a;
  }

  [data-theme='dark'] .divider,
  [data-theme='dark'] .disclaimer-brutal {
    border-color: #eee;
  }
</style>
