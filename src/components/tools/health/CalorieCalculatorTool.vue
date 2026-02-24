<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">健康<span>.热量与代谢()</span></h1>
      </header>

      <div class="brutal-grid-layout">
        <!-- Input & TDEE -->
        <section class="main-content-pane">
          <div class="brutal-pane">
            <div class="pane-header bg-black">
              <span class="text-white">⚙️ 身体数据换算 (TDEE)</span>
            </div>
            <div class="pane-body">
              <div class="form-row">
                <div class="input-group">
                  <label>性别</label>
                  <div class="brutal-radio-group">
                    <label class="radio-btn" :class="{ active: gender === 'male' }">
                      <input v-model="gender" type="radio" value="male" class="hidden-radio" />男
                    </label>
                    <label class="radio-btn" :class="{ active: gender === 'female' }">
                      <input v-model="gender" type="radio" value="female" class="hidden-radio" />女
                    </label>
                  </div>
                </div>
                <div class="input-group">
                  <label>年龄</label>
                  <input v-model.number="age" type="number" class="brutal-input" placeholder="岁" />
                </div>
              </div>

              <div class="form-row mt-4">
                <div class="input-group">
                  <label>身高 (cm)</label>
                  <input
                    v-model.number="height"
                    type="number"
                    class="brutal-input"
                    placeholder="cm"
                  />
                </div>
                <div class="input-group">
                  <label>体重 (kg)</label>
                  <input
                    v-model.number="weight"
                    type="number"
                    class="brutal-input"
                    placeholder="kg"
                  />
                </div>
              </div>

              <div class="form-row mt-4">
                <div class="input-group full">
                  <label>活动水平</label>
                  <select v-model="activity" class="brutal-select">
                    <option value="1.2">久坐 (办公室工作，极少运动)</option>
                    <option value="1.375">轻度 (每周 1-3 天轻量运动)</option>
                    <option value="1.55">中度 (每周 3-5 天中强度运动)</option>
                    <option value="1.725">重度 (每周 6-7 天高强度运动)</option>
                    <option value="1.9">极重度 (运动员 / 体力劳动者)</option>
                  </select>
                </div>
              </div>

              <div v-if="bmr" class="tdee-display mt-6">
                <div class="t-left">
                  <span class="t-label">BMR 基础代谢</span>
                  <span class="t-val">{{ bmr }} <small>kcal</small></span>
                </div>
                <div class="t-right bg-yellow">
                  <span class="t-label text-black">TDEE 总消耗</span>
                  <span class="t-val text-black">{{ tdee }} <small>kcal</small></span>
                </div>
              </div>

              <div v-if="tdee" class="goals-grid mt-6">
                <div class="brutal-card goal-loss">
                  <span class="g-title">📉 减脂期</span>
                  <span class="g-val">{{ tdee - 500 }} kcal</span>
                </div>
                <div class="brutal-card goal-maintain">
                  <span class="g-title">⚖️ 维持期</span>
                  <span class="g-val">{{ tdee }} kcal</span>
                </div>
                <div class="brutal-card goal-gain">
                  <span class="g-title">📈 增肌期</span>
                  <span class="g-val">{{ tdee + 300 }} kcal</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Meal Plan -->
          <div class="brutal-pane mt-8">
            <div class="pane-header bg-yellow"><span>🍽️ 三餐热量分配建议</span></div>
            <div class="pane-body">
              <div class="ratio-chips">
                <span class="chip-label">分配比例:</span>
                <button
                  class="brutal-action-btn chip"
                  :class="{ active: mealRatio === '3:4:3' }"
                  @click="mealRatio = '3:4:3'"
                >
                  3:4:3
                </button>
                <button
                  class="brutal-action-btn chip"
                  :class="{ active: mealRatio === '4:4:2' }"
                  @click="mealRatio = '4:4:2'"
                >
                  4:4:2
                </button>
                <button
                  class="brutal-action-btn chip"
                  :class="{ active: mealRatio === '3:3:3:1' }"
                  @click="mealRatio = '3:3:3:1'"
                >
                  3:3:3:1
                </button>
              </div>

              <div class="meal-grid mt-6">
                <div v-for="(meal, idx) in currentMealPlan" :key="idx" class="meal-card">
                  <div class="m-header">{{ meal.icon }} {{ meal.name }}</div>
                  <div class="m-cal">{{ meal.cal }} <span>kcal</span></div>
                  <div class="m-ratio">{{ meal.ratio }}%</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Sidebar: Food DB -->
        <aside class="sidebar-pane">
          <div class="brutal-pane">
            <div class="pane-header bg-black"><span class="text-white">🍔 食物热量查询</span></div>
            <div class="pane-body padding-small">
              <div class="search-box">
                <input
                  v-model="searchQuery"
                  type="text"
                  class="brutal-input"
                  placeholder="🔍 搜索食物 (如: 米饭)..."
                  @input="handleSearch"
                />
              </div>

              <div v-if="searchResults.length" class="search-results mt-4">
                <div
                  v-for="food in searchResults"
                  :key="food.name"
                  class="food-item"
                  @click="addToRef(food)"
                >
                  <div class="f-info">
                    <span class="f-name">{{ food.name }}</span>
                    <span class="f-unit">{{ food.unit }}</span>
                  </div>
                  <div class="f-action">
                    <span class="f-cal">{{ food.cal }} kcal</span>
                    <button class="brutal-action-btn sm-btn">➕</button>
                  </div>
                </div>
              </div>
              <div v-else-if="searchQuery" class="empty-result mt-4">[ 未找到数据 ]</div>

              <div class="divider">今日记录</div>

              <div class="log-area">
                <div v-if="!todayLog.length" class="empty-result">暂无记录</div>
                <div v-else class="log-list">
                  <div v-for="(item, i) in todayLog" :key="i" class="log-item">
                    <span class="l-name">{{ item.name }}</span>
                    <span class="l-cal"
                      >{{ item.cal }} kcal
                      <button
                        class="brutal-action-btn del-btn danger"
                        @click="todayLog.splice(i, 1)"
                      >
                        ✖
                      </button></span
                    >
                  </div>
                  <div class="log-total mt-4">
                    TOTAL: <strong>{{ totalIntake }}</strong> kcal
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div class="disclaimer-brutal text-center">
        <strong>⚠️ 提示：</strong>计算基于 Mifflin-St Jeor
        公式。身体实际消耗受基因、环境等多种因素影响，结果仅供参考。
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';

  const gender = ref('male');
  const age = ref('');
  const height = ref('');
  const weight = ref('');
  const activity = ref('1.2');

  const bmr = computed(() => {
    const w = parseFloat(weight.value);
    const h = parseFloat(height.value);
    const a = parseFloat(age.value);
    if (!w || !h || !a) return 0;

    let res = 10 * w + 6.25 * h - 5 * a;
    if (gender.value === 'male') res += 5;
    else res -= 161;

    return Math.round(res);
  });

  const tdee = computed(() => {
    if (!bmr.value) return 0;
    return Math.round(bmr.value * parseFloat(activity.value));
  });

  const mealRatio = ref('3:4:3');
  const currentMealPlan = computed(() => {
    const total = tdee.value || 2000;
    let plan = [];
    if (mealRatio.value === '3:4:3') {
      plan = [
        { name: '早餐', icon: '🍳', ratio: 30, cal: Math.round(total * 0.3) },
        { name: '午餐', icon: '🍱', ratio: 40, cal: Math.round(total * 0.4) },
        { name: '晚餐', icon: '🥗', ratio: 30, cal: Math.round(total * 0.3) }
      ];
    } else if (mealRatio.value === '4:4:2') {
      plan = [
        { name: '早餐', icon: '🍳', ratio: 40, cal: Math.round(total * 0.4) },
        { name: '午餐', icon: '🍱', ratio: 40, cal: Math.round(total * 0.4) },
        { name: '晚餐', icon: '🥗', ratio: 20, cal: Math.round(total * 0.2) }
      ];
    } else if (mealRatio.value === '3:3:3:1') {
      plan = [
        { name: '早餐', icon: '🍳', ratio: 30, cal: Math.round(total * 0.3) },
        { name: '午餐', icon: '🍱', ratio: 30, cal: Math.round(total * 0.3) },
        { name: '晚餐', icon: '🥗', ratio: 30, cal: Math.round(total * 0.3) },
        { name: '加餐', icon: '🍎', ratio: 10, cal: Math.round(total * 0.1) }
      ];
    }
    return plan;
  });

  const searchQuery = ref('');
  const searchResults = ref([]);
  const todayLog = ref([]);

  const foodDB = [
    { name: '米饭', unit: '1碗 (150g)', cal: 174 },
    { name: '馒头', unit: '1个 (100g)', cal: 223 },
    { name: '面条(煮)', unit: '1碗 (200g)', cal: 220 },
    { name: '全麦面包', unit: '1片 (35g)', cal: 89 },
    { name: '煮鸡蛋', unit: '1个 (50g)', cal: 70 },
    { name: '煎蛋', unit: '1个 (50g)', cal: 118 },
    { name: '鸡胸肉', unit: '100g', cal: 133 },
    { name: '牛奶', unit: '1盒 (250ml)', cal: 163 },
    { name: '苹果', unit: '1个 (200g)', cal: 104 },
    { name: '生菜', unit: '100g', cal: 15 }
  ];

  const handleSearch = () => {
    const q = searchQuery.value.trim();
    if (!q) {
      searchResults.value = [];
      return;
    }
    searchResults.value = foodDB.filter(f => f.name.includes(q));
  };

  const addToRef = food => {
    todayLog.value.push(food);
  };

  const totalIntake = computed(() => todayLog.value.reduce((acc, item) => acc + item.cal, 0));
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

  .brutal-action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.6rem 1rem;
    font-family: 'Syne', sans-serif;
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

  .brutal-grid-layout {
    display: grid;
    grid-template-columns: 1fr 400px;
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
  .text-white {
    color: #fff;
  }
  .text-black {
    color: #111;
  }
  .pane-body {
    padding: 2rem;
    flex: 1;
    box-sizing: border-box;
  }
  .padding-small {
    padding: 1.5rem;
  }

  .form-row {
    display: flex;
    gap: 1rem;
  }
  .input-group {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .input-group label {
    font-weight: 800;
    font-size: 1rem;
  }
  .mt-4 {
    margin-top: 1rem;
  }
  .mt-6 {
    margin-top: 1.5rem;
  }
  .mt-8 {
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
    transform: translate(-2px, -2px);
  }

  .brutal-radio-group {
    display: flex;
    border: 3px solid #111;
    box-shadow: 4px 4px 0 #111;
  }
  .radio-btn {
    flex: 1;
    text-align: center;
    padding: 0.75rem;
    background: #fff;
    font-weight: 800;
    cursor: pointer;
    border-right: 3px solid #111;
    transition: background 0.1s;
  }
  .radio-btn:last-child {
    border-right: none;
  }
  .hidden-radio {
    display: none;
  }
  .radio-btn.active {
    background: #111;
    color: white;
  }

  .tdee-display {
    display: flex;
    border: 4px solid #111;
    box-shadow: 6px 6px 0 #111;
  }
  .t-left,
  .t-right {
    flex: 1;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #fdfae5;
  }
  .t-left {
    border-right: 4px solid #111;
  }
  .t-label {
    font-weight: 800;
    font-size: 0.9rem;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
  }
  .t-val {
    font-size: 2.5rem;
    font-weight: 900;
    font-family: 'Syne', sans-serif;
    line-height: 1;
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
    color: #4b7bff;
  }
  .t-right .t-val {
    color: #111;
  }

  .goals-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }
  .brutal-card {
    border: 3px solid #111;
    padding: 1rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    box-shadow: 4px 4px 0 #111;
    transition: transform 0.1s;
  }
  .brutal-card:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #111;
  }
  .goal-loss {
    background: #e0f2fe;
  }
  .goal-maintain {
    background: #fff;
  }
  .goal-gain {
    background: #ffedd5;
    border-color: #111;
  }
  .g-title {
    font-weight: 800;
    font-family: 'Syne', sans-serif;
  }
  .g-val {
    font-size: 1.25rem;
    font-weight: 900;
  }

  .ratio-chips {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
  }
  .chip-label {
    font-weight: 800;
    margin-right: 0.5rem;
  }
  .chip.active {
    background: #111;
    color: white;
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #4b7bff;
  }

  .meal-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 1rem;
  }
  .meal-card {
    border: 3px solid #111;
    padding: 1rem;
    text-align: center;
    background: #fff;
    box-shadow: 3px 3px 0 #111;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .m-header {
    font-weight: 800;
    font-size: 0.9rem;
    border-bottom: 2px dashed #111;
    padding-bottom: 0.5rem;
  }
  .m-cal {
    font-size: 1.5rem;
    font-weight: 900;
    font-family: 'Syne', sans-serif;
    color: #ff4b4b;
  }
  .m-cal span {
    font-size: 0.8rem;
    color: #111;
    font-weight: 800;
  }
  .m-ratio {
    font-size: 0.8rem;
    font-weight: bold;
  }

  .search-results {
    max-height: 250px;
    overflow-y: auto;
    border: 3px solid #111;
    border-top: none;
    background: #fff;
  }
  .food-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border-top: 3px solid #111;
    cursor: pointer;
    transition: background 0.1s;
    background: #fdfae5;
  }
  .food-item:hover {
    background: #ffd900;
  }
  .f-info {
    display: flex;
    flex-direction: column;
  }
  .f-name {
    font-weight: 800;
  }
  .f-unit {
    font-size: 0.75rem;
    font-weight: bold;
    color: #555;
  }
  .f-action {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .f-cal {
    font-weight: 900;
  }
  .sm-btn {
    padding: 0.2rem 0.5rem;
    font-size: 0.8rem;
  }

  .empty-result {
    text-align: center;
    padding: 2rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: bold;
    border: 3px dashed #111;
    margin-top: 1rem;
  }
  .divider {
    text-align: center;
    border-top: 3px dashed #111;
    margin: 2rem 0;
    padding-top: 1rem;
    font-weight: 900;
    font-family: 'Syne', sans-serif;
    font-size: 1.1rem;
  }

  .log-area {
    font-family: 'IBM Plex Mono', monospace;
  }
  .log-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: #fff;
    border: 3px solid #111;
    margin-bottom: 0.5rem;
    box-shadow: 2px 2px 0 #111;
    font-weight: bold;
  }
  .del-btn {
    padding: 0.2rem 0.4rem;
    font-size: 0.7rem;
    margin-left: 0.5rem;
  }
  .brutal-action-btn.danger {
    background: #ff4b4b;
    color: white;
  }
  .log-total {
    text-align: right;
    font-size: 1.1rem;
    border-top: 3px solid #111;
    padding-top: 1rem;
  }
  .log-total strong {
    font-size: 1.5rem;
    color: #ff4b4b;
  }

  .disclaimer-brutal {
    border-top: 4px dashed #111;
    padding-top: 1.5rem;
    font-size: 0.9rem;
    font-weight: bold;
    margin-top: 2rem;
  }
  .text-center {
    text-align: center;
  }

  @media (max-width: 900px) {
    .brutal-grid-layout,
    .form-row,
    .goals-grid {
      grid-template-columns: 1fr;
      flex-direction: column;
    }
    .brutal-title {
      font-size: 2.5rem;
    }
    .tdee-display {
      flex-direction: column;
    }
    .t-left {
      border-right: none;
      border-bottom: 4px solid #111;
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
  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .radio-btn,
  [data-theme='dark'] .t-left,
  [data-theme='dark'] .brutal-card,
  [data-theme='dark'] .meal-card,
  [data-theme='dark'] .food-item,
  [data-theme='dark'] .log-item {
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
  [data-theme='dark'] .brutal-action-btn {
    box-shadow: 4px 4px 0 #eee;
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
  [data-theme='dark'] .brutal-radio-group {
    border-color: #eee;
    box-shadow: 4px 4px 0 #eee;
  }
  [data-theme='dark'] .radio-btn {
    border-color: #eee;
  }
  [data-theme='dark'] .radio-btn.active {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .bg-black {
    background: #222;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
    border-color: #eee;
  }
  [data-theme='dark'] .tdee-display {
    border-color: #eee;
    box-shadow: 6px 6px 0 #eee;
  }
  [data-theme='dark'] .t-val {
    color: #6b8cff;
  }
  [data-theme='dark'] .brutal-card:hover {
    box-shadow: 6px 6px 0 #eee;
  }

  [data-theme='dark'] .goal-loss {
    background: #1a2f3a;
  }
  [data-theme='dark'] .goal-maintain {
    background: #222;
  }
  [data-theme='dark'] .goal-gain {
    background: #3a2a1a;
  }

  [data-theme='dark'] .chip.active {
    background: #eee;
    color: #111;
    box-shadow: 6px 6px 0 #6b8cff;
  }
  [data-theme='dark'] .meal-card {
    box-shadow: 3px 3px 0 #eee;
  }
  [data-theme='dark'] .m-header {
    border-color: #eee;
  }
  [data-theme='dark'] .m-cal {
    color: #ff8b8b;
  }
  [data-theme='dark'] .m-cal span {
    color: #eee;
  }

  [data-theme='dark'] .search-results {
    border-color: #eee;
  }
  [data-theme='dark'] .food-item:hover {
    background: #222;
  }
  [data-theme='dark'] .food-item {
    border-color: #eee;
  }
  [data-theme='dark'] .empty-result {
    border-color: #eee;
  }
  [data-theme='dark'] .divider,
  [data-theme='dark'] .disclaimer-brutal {
    border-color: #eee;
  }
  [data-theme='dark'] .log-item {
    box-shadow: 2px 2px 0 #eee;
  }
  [data-theme='dark'] .brutal-action-btn.danger {
    background: #8b0000;
    border-color: #eee;
  }
  [data-theme='dark'] .log-total {
    border-color: #eee;
  }
  [data-theme='dark'] .log-total strong {
    color: #ff8b8b;
  }
</style>
