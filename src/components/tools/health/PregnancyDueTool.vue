<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">健康<span>.预产期伴侣()</span></h1>
      </header>

      <main class="tool-content">
        <div class="brutal-grid-layout">
          <!-- Left Panel -->
          <aside class="sidebar-pane">
            <div class="brutal-pane">
              <div class="pane-header bg-black"><span class="text-white">📅 日期与周期</span></div>
              <div class="pane-body padding-small">
                <div class="input-group">
                  <label>末次月经第一天</label>
                  <input
                    v-model="lastPeriod"
                    type="date"
                    class="brutal-input"
                    :max="todayDate"
                    @change="calculate"
                  />
                </div>

                <div class="input-group mt-6">
                  <label>平均月经周期 (天)</label>
                  <input
                    v-model="cycleDays"
                    type="number"
                    min="21"
                    max="45"
                    class="brutal-input"
                    @change="calculate"
                  />
                  <p class="hint">正常范围: 21-45天, 默认 28 天</p>
                </div>

                <div v-if="dueDate" class="result-summary mt-8">
                  <div class="result-item bg-white">
                    <p class="label text-pink">预计预产期</p>
                    <p class="value primary-val">{{ formattedDueDate }}</p>
                  </div>
                  <div class="divider-dashed"></div>
                  <div class="result-item bg-white">
                    <p class="label">当前进度</p>
                    <p class="value">
                      {{ currentWeeks }} <small>周</small> {{ currentDays }} <small>天</small>
                    </p>
                  </div>
                  <div class="result-item bg-white">
                    <p class="label">距离预产期</p>
                    <p class="value">{{ daysToDue }} <small>天</small></p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <!-- Main Workspace -->
          <section class="main-content-pane">
            <div v-if="dueDate" class="brutal-pane">
              <div class="pane-header bg-pink">
                <div class="flex-between">
                  <span>👶 第 {{ currentWeeks }} 周的变化</span>
                  <div class="trimester-badge" :class="'tri-' + trimester">
                    第 {{ trimester }} 阶段
                  </div>
                </div>
              </div>
              <div class="pane-body">
                <div class="info-grid">
                  <div class="info-card baby-card relative-card">
                    <div class="card-icon">🍼</div>
                    <h4>宝宝的变化</h4>
                    <p>{{ currentWeekData.baby }}</p>
                    <div v-if="currentWeekData.size" class="size-box">
                      <span
                        >现在大约像：<strong>{{ currentWeekData.size }}</strong></span
                      >
                    </div>
                  </div>
                  <div class="info-card mom-card relative-card">
                    <div class="card-icon">👩‍🍼</div>
                    <h4>妈妈的变化</h4>
                    <p>{{ currentWeekData.mom }}</p>
                  </div>
                  <div class="info-card checkup-card relative-card">
                    <div class="card-icon">🏥</div>
                    <h4>产检建议</h4>
                    <p>{{ currentWeekData.checkup }}</p>
                  </div>
                </div>

                <div class="milestones mt-8">
                  <h3>关键阶段预览</h3>
                  <div class="brutal-steps">
                    <div class="step-item" :class="{ 'step-active': trimester >= 1 }">
                      <div class="step-num">1</div>
                      <div class="step-text">早期 (0-13周)</div>
                    </div>
                    <div class="step-line" :class="{ 'line-active': trimester >= 2 }"></div>
                    <div class="step-item" :class="{ 'step-active': trimester >= 2 }">
                      <div class="step-num">2</div>
                      <div class="step-text">中期 (14-27周)</div>
                    </div>
                    <div class="step-line" :class="{ 'line-active': trimester >= 3 }"></div>
                    <div class="step-item" :class="{ 'step-active': trimester >= 3 }">
                      <div class="step-num">3</div>
                      <div class="step-text">晚期 (28-40周)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="empty-state brutal-pane border-dashed">
              <div class="pane-body text-center">
                <span class="empty-icon">📅</span>
                <h3>等待计算...</h3>
                <p>请在左侧输入末次月经日期</p>
              </div>
            </div>

            <div class="disclaimer-brutal mt-8">
              <strong>⚠️ 医学提示</strong>
              <p>
                预产期计算基于通用规律（280天），实际分娩时间因人而异。只有不到5%的孕妇会在预产期当天分娩。此结果仅供参考，请以主管医生的超声波产检评估为准。
              </p>
            </div>
          </section>
        </div>
      </main>

      <footer class="footer mt-8">© 2026 LRM工具箱 - 预产期日历</footer>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';

  const lastPeriod = ref('');
  const cycleDays = ref(28);
  const dueDate = ref(null);
  const currentWeeks = ref(0);
  const currentDays = ref(0);
  const daysToDue = ref(0);

  const todayDate = new Date().toISOString().split('T')[0];

  const formattedDueDate = computed(() => {
    if (!dueDate.value) return '';
    return dueDate.value.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });

  const calculate = () => {
    if (!lastPeriod.value) return;
    const start = new Date(lastPeriod.value);
    const adjustment = Number(cycleDays.value) - 28;
    const due = new Date(start.getTime() + (280 + adjustment) * 24 * 60 * 60 * 1000);
    dueDate.value = due;

    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const totalDays = Math.floor(diff / (24 * 60 * 60 * 1000));
    currentWeeks.value = Math.max(0, Math.floor(totalDays / 7));
    currentDays.value = Math.max(0, totalDays % 7);

    const diffToDue = due.getTime() - now.getTime();
    daysToDue.value = Math.max(0, Math.ceil(diffToDue / (24 * 60 * 60 * 1000)));
  };

  const trimester = computed(() => {
    if (currentWeeks.value < 14) return 1;
    if (currentWeeks.value < 28) return 2;
    return 3;
  });

  const currentWeekData = computed(() => {
    const w = currentWeeks.value;
    if (w <= 4)
      return {
        baby: '受精卵着床，神经系统开始发育。',
        size: '罂粟籽',
        mom: '可能会有早孕反应，疲劳、乳房胀痛。',
        checkup: '确认怀孕，咨询孕早期注意事项。'
      };
    if (w <= 12)
      return {
        baby: '器官开始成形，胎心搏动。',
        size: '酸橙',
        mom: '子宫增大，压迫膀胱导致尿频。',
        checkup: '11-13周：早唐筛查/NT检查。'
      };
    if (w <= 24)
      return {
        baby: '胎动活跃，能听到外界声音。',
        size: '大茄子',
        mom: '食欲好转，肤色变化，腹部明显。',
        checkup: '20-24周：大排畸超声检查。'
      };
    return {
      baby: '各个器官发育完善，练习呼吸。',
      size: '西瓜',
      mom: '负重感强，容易腰酸，手脚水肿。',
      checkup: '28周后每两周产检一次，36周后每周一次。'
    };
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
    color: #ff4b4b;
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
    align-items: start;
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
  .bg-pink {
    background: #ff4b4b;
    color: white;
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
  .text-center {
    text-align: center;
  }
  .flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
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

  .brutal-input {
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
  .brutal-input:focus {
    outline: none;
    box-shadow: 4px 4px 0 #ff4b4b;
    border-color: #ff4b4b;
    transform: translate(-2px, -2px);
  }

  .result-summary {
    background: #ffe4e6;
    padding: 1.5rem;
    border: 4px solid #111;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    box-shadow: 6px 6px 0 #111;
  }
  .bg-white {
    background: #fff;
  }
  .result-item {
    padding: 1rem;
    border: 3px solid #111;
    box-shadow: 3px 3px 0 #111;
  }
  .result-item .label {
    font-weight: 900;
    font-family: 'Noto Sans SC', sans-serif;
    margin: 0 0 0.25rem;
  }
  .result-item .value {
    font-size: 1.8rem;
    font-weight: 900;
    font-family: 'Syne', sans-serif;
    margin: 0;
    line-height: 1;
  }
  .result-item .value small {
    font-size: 1rem;
    font-weight: bold;
    font-family: 'Noto Sans SC', sans-serif;
  }
  .text-pink {
    color: #ff4b4b;
  }
  .primary-val {
    color: #ff4b4b;
    font-size: 1.8rem !important;
  }
  .divider-dashed {
    border-top: 3px dashed #111;
    margin: 0.5rem 0;
    width: 100%;
  }

  .trimester-badge {
    background: #111;
    color: #fff;
    font-size: 0.9rem;
    font-family: 'Noto Sans SC', sans-serif;
    padding: 0.2rem 0.5rem;
    border: 2px solid #111;
  }
  .tri-1 {
    background: #ffbcbc;
    color: #111;
  }
  .tri-2 {
    background: #bcfabb;
    color: #111;
  }
  .tri-3 {
    background: #fcebbb;
    color: #111;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }
  .info-card {
    padding: 1.5rem;
    border: 4px solid #111;
    background: #fff;
    display: flex;
    flex-direction: column;
  }
  .relative-card {
    box-shadow: 6px 6px 0 #111;
    transition: transform 0.1s;
  }
  .relative-card:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0 #111;
  }

  .baby-card {
    background: #e0faff;
  }
  .mom-card {
    background: #ffe0f5;
  }
  .checkup-card {
    background: #e4ffe0;
  }

  .card-icon {
    font-size: 3rem;
    margin-bottom: 0.5rem;
    line-height: 1;
  }
  .info-card h4 {
    font-size: 1.1rem;
    font-family: 'Noto Sans SC', sans-serif;
    font-weight: 900;
    margin: 0 0 0.5rem;
  }
  .info-card p {
    font-size: 0.95rem;
    font-weight: bold;
    margin: 0;
    line-height: 1.5;
    color: #333;
  }

  .size-box {
    margin-top: 1rem;
    padding: 0.75rem;
    border: 3px dashed #111;
    font-weight: bold;
    background: #fff;
  }
  .size-box strong {
    color: #ff4b4b;
    font-size: 1.1rem;
    font-weight: 900;
  }

  .milestones h3 {
    font-size: 1.25rem;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    margin: 0 0 1.5rem;
  }
  .brutal-steps {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }
  .step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    z-index: 1;
  }
  .step-num {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 4px solid #111;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    font-weight: 900;
    font-family: 'IBM Plex Mono', monospace;
    transition: all 0.2s;
  }
  .step-text {
    font-weight: 900;
    font-size: 0.9rem;
    text-align: center;
  }
  .step-active .step-num {
    background: #ff4b4b;
    color: white;
    box-shadow: 4px 4px 0 #111;
    transform: scale(1.1);
  }

  .step-line {
    flex: 1;
    height: 4px;
    background: #111;
    margin: 0 10px;
    position: relative;
    top: -15px;
    z-index: 0;
  }
  .line-active {
    background: #ff4b4b;
  }

  .empty-icon {
    font-size: 4rem;
    line-height: 1;
    margin-bottom: 1rem;
    display: inline-block;
  }
  .empty-state h3 {
    font-size: 1.5rem;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    margin: 0 0 0.5rem;
  }
  .empty-state p {
    font-weight: bold;
    color: #555;
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
    color: #111;
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

  .footer {
    text-align: center;
    font-weight: 900;
    margin-bottom: 2rem;
  }

  @media (max-width: 900px) {
    .brutal-grid-layout {
      grid-template-columns: 1fr;
    }
    .brutal-title {
      font-size: 2.2rem;
    }
    .info-grid {
      grid-template-columns: 1fr;
    }
    .brutal-steps {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
    .step-item {
      flex-direction: row;
    }
    .step-line {
      display: none;
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
  [data-theme='dark'] .brutal-input {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-input {
    box-shadow: 6px 6px 0 #eee;
  }
  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 9px 9px 0 #eee;
  }

  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0 #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .bg-black {
    background: #222;
  }
  [data-theme='dark'] .bg-pink {
    background: #8b0000;
    color: white;
  }
  [data-theme='dark'] .result-summary {
    background: #222;
    border-color: #eee;
    box-shadow: 6px 6px 0 #eee;
  }
  [data-theme='dark'] .bg-white {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 3px 3px 0 #eee;
  }
  [data-theme='dark'] .divider-dashed {
    border-top-color: #eee;
  }

  [data-theme='dark'] .text-pink,
  [data-theme='dark'] .primary-val {
    color: #ff8b8b;
  }
  [data-theme='dark'] .brutal-input:focus {
    box-shadow: 4px 4px 0 #4b7bff;
    border-color: #4b7bff;
  }
  [data-theme='dark'] .hint {
    color: #aaa;
  }

  [data-theme='dark'] .trimester-badge {
    background: #eee;
    color: #111;
    border-color: #eee;
  }
  [data-theme='dark'] .tri-1 {
    background: #331118;
    color: #eee;
  }
  [data-theme='dark'] .tri-2 {
    background: #113318;
    color: #eee;
  }
  [data-theme='dark'] .tri-3 {
    background: #332700;
    color: #eee;
  }

  [data-theme='dark'] .info-card {
    border-color: #eee;
  }
  [data-theme='dark'] .relative-card {
    box-shadow: 6px 6px 0 #eee;
  }
  [data-theme='dark'] .relative-card:hover {
    box-shadow: 9px 9px 0 #eee;
  }

  [data-theme='dark'] .baby-card {
    background: #002233;
  }
  [data-theme='dark'] .mom-card {
    background: #330022;
  }
  [data-theme='dark'] .checkup-card {
    background: #003311;
  }
  [data-theme='dark'] .info-card p {
    color: #ccc;
  }

  [data-theme='dark'] .size-box {
    background: #1a1a1a;
    border-color: #eee;
  }
  [data-theme='dark'] .size-box strong {
    color: #ff8b8b;
  }

  [data-theme='dark'] .step-num {
    background: #1a1a1a;
    border-color: #eee;
  }
  [data-theme='dark'] .step-active .step-num {
    background: #8b0000;
    box-shadow: 4px 4px 0 #eee;
  }
  [data-theme='dark'] .step-line {
    background: #eee;
  }
  [data-theme='dark'] .line-active {
    background: #8b0000;
  }

  [data-theme='dark'] .disclaimer-brutal {
    background: #332200;
    border-color: #eee;
  }
  [data-theme='dark'] .disclaimer-brutal strong {
    color: #ff8b8b;
  }
  [data-theme='dark'] .disclaimer-brutal p,
  [data-theme='dark'] .empty-state p {
    color: #ccc;
  }
</style>
