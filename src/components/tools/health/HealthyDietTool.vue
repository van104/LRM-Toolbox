<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">健康<span>.饮食建议()</span></h1>
      </header>

      <main class="tool-content">
        <div class="brutal-grid-layout">
          <!-- Sidebar: Target Setup -->
          <aside class="sidebar-pane">
            <div class="brutal-pane">
              <div class="pane-header bg-black">
                <span class="text-white">⚙️ 进食目标设定</span>
              </div>
              <div class="pane-body padding-small">
                <div class="input-group">
                  <label>🎯 您的目标</label>
                  <select v-model="form.goal" class="brutal-select">
                    <option value="lose">📉 减脂 (Fat Loss)</option>
                    <option value="maintain">⚖️ 维持 (Maintain)</option>
                    <option value="gain">📈 增肌 (Muscle Gain)</option>
                  </select>
                </div>

                <div class="input-group mt-6">
                  <label>🔥 每日卡路里 (kcal)</label>
                  <input
                    v-model.number="form.calories"
                    type="number"
                    step="50"
                    min="1200"
                    max="5000"
                    class="brutal-input"
                  />
                  <p class="hint">建议参考 TDEE 计算结果</p>
                </div>

                <div class="input-group mt-6">
                  <label>🏃 活动水平 (TEA)</label>
                  <select v-model="form.activity" class="brutal-select">
                    <option value="light">轻度 (1-2次/周)</option>
                    <option value="moderate">中度 (3-5次/周)</option>
                    <option value="heavy">强度 (6-7次/周)</option>
                  </select>
                </div>

                <button class="brutal-action-btn primary large-btn mt-8" @click="generatePlan">
                  刷新解析 ↻
                </button>
              </div>
            </div>

            <div class="disclaimer-brutal mt-8">
              <strong>⚠️ 提示</strong>
              <p>
                营养建议基于通用模型计算，不考虑个人疾病或特殊身体状况。严格的饮食计划应在注册营养师指导下进行。
              </p>
            </div>
          </aside>

          <!-- Main Workspace -->
          <section class="main-content-pane">
            <div class="brutal-pane">
              <div class="pane-header bg-yellow"><span>🍱 宏量营养素 (Macros)</span></div>
              <div class="pane-body">
                <div class="macro-summary">
                  <div
                    v-for="macro in macros"
                    :key="macro.name"
                    class="macro-card brutal-card relative-card"
                    :class="macro.id"
                  >
                    <div class="macro-icon">{{ macro.icon }}</div>
                    <div class="macro-info">
                      <span class="label">{{ macro.name }}</span>
                      <span class="value">{{ macro.grams }} <small>g</small></span>
                      <div class="m-bar">
                        <div
                          class="m-fill"
                          :style="{ width: macro.percent + '%', backgroundColor: macro.color }"
                        ></div>
                      </div>
                      <span class="percent">{{ macro.percent }}% 热量占比</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="brutal-pane mt-8">
              <div class="pane-header bg-black">
                <span class="text-white">🕒 三餐热量分配建议</span>
              </div>
              <div class="pane-body">
                <div class="meal-timeline">
                  <div v-for="meal in mealDistribution" :key="meal.label" class="meal-node">
                    <div class="meal-inner">
                      <span class="label">{{ meal.label }}</span>
                      <span class="kcal">{{ Math.round(form.calories * meal.ratio) }} kcal</span>
                    </div>
                    <div class="brutal-bar-container">
                      <div
                        class="brutal-bar-fill pattern-bg"
                        :style="{ width: meal.ratio * 200 + '%' }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="brutal-pane mt-8 border-dashed">
              <div class="pane-body">
                <h3 class="tip-title">💡 优质食物来源建议</h3>
                <div class="tips-grid">
                  <div class="tip-card">
                    <h4>🍚 复合碳水</h4>
                    <p>糙米、燕麦、地瓜、全麦面包、玉米、藜麦等</p>
                  </div>
                  <div class="tip-card">
                    <h4>🥩 优质蛋白</h4>
                    <p>鸡胸肉、瘦牛肉、鸡蛋、鱼虾、希腊酸奶、大豆</p>
                  </div>
                  <div class="tip-card">
                    <h4>🥑 健康脂肪</h4>
                    <p>牛油果、初榨橄榄油、原味坚果、深海鱼油</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer class="footer mt-8">© 2026 LRM工具箱 - 健康饮食建议</footer>
    </div>
  </div>
</template>

<script setup>
  import { reactive, computed } from 'vue';

  const form = reactive({
    goal: 'maintain',
    calories: 2000,
    activity: 'moderate'
  });

  const macros = computed(() => {
    let ratios = { p: 0.25, c: 0.5, f: 0.25 };
    if (form.goal === 'lose') {
      ratios = { p: 0.35, c: 0.35, f: 0.3 };
    } else if (form.goal === 'gain') {
      ratios = { p: 0.3, c: 0.5, f: 0.2 };
    }

    return [
      {
        id: 'protein',
        name: '蛋白质',
        grams: Math.round((form.calories * ratios.p) / 4),
        percent: ratios.p * 100,
        color: '#f43f5e',
        icon: '🥩'
      },
      {
        id: 'carbs',
        name: '碳水',
        grams: Math.round((form.calories * ratios.c) / 4),
        percent: ratios.c * 100,
        color: '#f59e0b',
        icon: '🍚'
      },
      {
        id: 'fat',
        name: '脂肪',
        grams: Math.round((form.calories * ratios.f) / 9),
        percent: ratios.f * 100,
        color: '#10b981',
        icon: '🥑'
      }
    ];
  });

  const mealDistribution = [
    { label: '🍳 早餐 (Breakfast)', ratio: 0.3 },
    { label: '🍱 午餐 (Lunch)', ratio: 0.4 },
    { label: '🥗 晚餐 (Dinner)', ratio: 0.2 },
    { label: '🍎 加餐 (Snack)', ratio: 0.1 }
  ];

  const generatePlan = () => {
    // Logic just reactively updates through computed properties
  };
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
    grid-template-columns: 350px 1fr;
    gap: 2.5rem;
  }

  .brutal-pane {
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0 #111;
    min-width: 0;
  }
  .border-dashed {
    border-style: dashed;
    box-shadow: none;
    background: #fdfae5;
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
  .text-white {
    color: #fff;
  }
  .pane-body {
    padding: 2rem;
  }
  .padding-small {
    padding: 1.5rem;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .input-group label {
    font-weight: 900;
    font-size: 1.1rem;
    font-family: 'Noto Sans SC', sans-serif;
  }
  .hint {
    font-size: 0.8rem;
    font-weight: bold;
    margin: 0.25rem 0 0;
    color: #555;
  }

  .brutal-input,
  .brutal-select {
    width: 100%;
    padding: 0.75rem;
    font-size: 1.1rem;
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
    transform: translate(-2px, -2px);
  }

  .brutal-action-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 1rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1.1rem;
    cursor: pointer;
    box-shadow: 6px 6px 0 #111;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
  }
  .brutal-action-btn.primary {
    background: #4b7bff;
    color: white;
  }
  .brutal-action-btn.large-btn {
    width: 100%;
    font-size: 1.25rem;
  }
  .brutal-action-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0 #111;
  }
  .brutal-action-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0 0 0 #111;
  }

  .disclaimer-brutal {
    border: 3px dashed #111;
    padding: 1.25rem;
    background: #fff;
    font-size: 0.9rem;
    font-weight: bold;
    line-height: 1.5;
  }
  .disclaimer-brutal strong {
    display: block;
    font-size: 1.1rem;
    color: #ff4b4b;
    margin-bottom: 0.5rem;
    font-family: 'Noto Sans SC', sans-serif;
    font-weight: 900;
  }
  .disclaimer-brutal p {
    margin: 0;
  }

  .mt-6 {
    margin-top: 1.5rem;
  }
  .mt-8 {
    margin-top: 2rem;
  }

  .macro-summary {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
  .brutal-card {
    border: 4px solid #111;
    padding: 1.5rem;
    background: #fff;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    position: relative;
  }
  .relative-card {
    transition: transform 0.1s;
    box-shadow: 6px 6px 0 #111;
  }
  .relative-card:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0 #111;
  }

  .macro-icon {
    font-size: 3rem;
    line-height: 1;
  }
  .macro-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .macro-info .label {
    font-size: 1rem;
    font-weight: 900;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
  }
  .macro-info .value {
    font-size: 2rem;
    font-weight: 900;
    line-height: 1;
    font-family: 'Syne', sans-serif;
  }
  .macro-info .value small {
    font-size: 1rem;
    font-weight: bold;
  }
  .macro-info .percent {
    font-size: 0.8rem;
    font-weight: bold;
    margin-top: 0.5rem;
  }

  .m-bar {
    height: 8px;
    width: 100%;
    border: 2px solid #111;
    border-radius: 4px;
    background: #fff;
    position: relative;
    margin-top: 0.5rem;
  }
  .m-fill {
    height: 100%;
    background: #111;
    transition: width 0.5s ease;
  }

  .protein {
    background: #ffe4e6;
  }
  .carbs {
    background: #fef3c7;
  }
  .fat {
    background: #d1fae5;
  }

  .meal-timeline {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  .meal-node {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .meal-inner {
    display: flex;
    justify-content: space-between;
    font-weight: 900;
    font-size: 1.1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
  }
  .kcal {
    color: #4b7bff;
  }

  .brutal-bar-container {
    height: 16px;
    border: 3px solid #111;
    background: #fff;
    width: 100%;
    position: relative;
  }
  .brutal-bar-fill {
    height: 100%;
    background: #4b7bff;
    transition: width 0.5s ease;
    border-right: 3px solid #111;
    box-sizing: border-box;
  }
  .pattern-bg {
    background-image: repeating-linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.2) 0,
      rgba(255, 255, 255, 0.2) 10px,
      transparent 10px,
      transparent 20px
    );
  }

  .tip-title {
    font-size: 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    margin: 0 0 1.5rem;
  }
  .tips-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
  .tip-card {
    background: #fff;
    border: 3px solid #111;
    padding: 1.25rem;
    box-shadow: 4px 4px 0 #111;
  }
  .tip-card h4 {
    margin: 0 0 0.5rem;
    font-size: 1.1rem;
    font-weight: 900;
    font-family: 'Noto Sans SC', sans-serif;
  }
  .tip-card p {
    margin: 0;
    font-weight: bold;
    font-size: 0.9rem;
    line-height: 1.5;
    color: #444;
  }

  .footer {
    text-align: center;
    font-weight: 900;
  }

  @media (max-width: 900px) {
    .brutal-grid-layout,
    .macro-summary,
    .tips-grid {
      grid-template-columns: 1fr;
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
  [data-theme='dark'] .border-dashed {
    background: #1a1a1a;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .brutal-select,
  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .brutal-card,
  [data-theme='dark'] .tip-card {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .brutal-select,
  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .relative-card,
  [data-theme='dark'] .tip-card {
    box-shadow: 6px 6px 0 #eee;
  }

  [data-theme='dark'] .brutal-btn:hover,
  [data-theme='dark'] .brutal-action-btn:hover,
  [data-theme='dark'] .relative-card:hover {
    box-shadow: 9px 9px 0 #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0 #eee;
  }
  [data-theme='dark'] .brutal-input:focus,
  [data-theme='dark'] .brutal-select:focus {
    box-shadow: 4px 4px 0 #2a4eb2;
    border-color: #2a4eb2;
  }

  [data-theme='dark'] .pane-header,
  [data-theme='dark'] .m-bar {
    border-color: #eee;
  }
  [data-theme='dark'] .bg-black {
    background: #222;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
    text-shadow: none;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-action-btn.primary {
    background: #2a4eb2;
    border-color: #eee;
    color: #fff;
  }

  [data-theme='dark'] .disclaimer-brutal {
    background: #332200;
    border-color: #eee;
  }
  [data-theme='dark'] .disclaimer-brutal strong {
    color: #ff8b8b;
  }
  [data-theme='dark'] .hint,
  [data-theme='dark'] .tip-card p {
    color: #aaa;
  }

  [data-theme='dark'] .protein {
    background: #331118;
  }
  [data-theme='dark'] .carbs {
    background: #332700;
  }
  [data-theme='dark'] .fat {
    background: #003322;
  }

  [data-theme='dark'] .kcal {
    color: #6b8cff;
  }
  [data-theme='dark'] .brutal-bar-container,
  [data-theme='dark'] .brutal-bar-fill {
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-bar-fill {
    background: #2a4eb2;
  }
</style>
