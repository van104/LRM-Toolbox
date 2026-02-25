<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">日期<span>.差值()</span></h1>
        <div style="width: 120px"></div>
      </header>

      <!-- Mode Tabs -->
      <div class="brutal-toolbar">
        <div class="tools-left">
          <button
            class="brutal-action-btn"
            :class="{ primary: mode === 'diff' }"
            @click="mode = 'diff'"
          >
            📅 计算日期间隔
          </button>
          <button
            class="brutal-action-btn"
            :class="{ primary: mode === 'add' }"
            @click="mode = 'add'"
          >
            ⏱ 推算日期
          </button>
        </div>
      </div>

      <!-- Diff Mode -->
      <div v-if="mode === 'diff'" class="brutal-pane calc-pane">
        <div class="pane-header bg-blue">
          <span class="text-white">日期间隔计算</span>
        </div>
        <div class="calc-body">
          <div class="date-inputs">
            <div class="input-group">
              <label class="brutal-label">开始日期</label>
              <input v-model="startDateStr" type="date" class="brutal-input full" />
            </div>
            <div class="separator">至</div>
            <div class="input-group">
              <label class="brutal-label">
                结束日期
                <button class="today-link" @click="setToday('end')">今天</button>
              </label>
              <input v-model="endDateStr" type="date" class="brutal-input full" />
            </div>
          </div>

          <div v-if="diffResult" class="result-display">
            <div class="primary-result">
              <span class="result-label">相隔天数</span>
              <span class="result-value">{{ diffResult.days }}</span>
              <span class="result-unit">天</span>
            </div>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="d-label">周数</span>
                <span class="d-value">{{ diffResult.weeks }}</span>
              </div>
              <div class="detail-item">
                <span class="d-label">月数 (约)</span>
                <span class="d-value">{{ diffResult.months }}</span>
              </div>
              <div class="detail-item">
                <span class="d-label">年数 (约)</span>
                <span class="d-value">{{ diffResult.years }}</span>
              </div>
              <div class="detail-item">
                <span class="d-label">工作日 (估算)</span>
                <span class="d-value">{{ diffResult.workdays }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Mode -->
      <div v-else class="brutal-pane calc-pane">
        <div class="pane-header bg-green">
          <span>推算日期</span>
        </div>
        <div class="calc-body">
          <div class="date-inputs">
            <div class="input-group">
              <label class="brutal-label">基准日期</label>
              <input v-model="baseDateStr" type="date" class="brutal-input full" />
            </div>
            <div class="operation-group">
              <select v-model="calcOperator" class="brutal-select">
                <option value="+">往后 (+)</option>
                <option value="-">往前 (-)</option>
              </select>
              <input
                v-model.number="calcValue"
                type="number"
                min="0"
                class="brutal-input"
                placeholder="数值"
              />
              <select v-model="calcUnit" class="brutal-select">
                <option value="days">天</option>
                <option value="weeks">周</option>
                <option value="months">月</option>
                <option value="years">年</option>
              </select>
            </div>
          </div>

          <div v-if="calcResult" class="result-display">
            <div class="primary-result">
              <span class="result-label">推算结果</span>
              <span class="result-value date-val">{{ formatDate(calcResult) }}</span>
            </div>
            <div class="weekday-display">{{ getWeekday(calcResult) }}</div>
          </div>
        </div>
      </div>

      <!-- Scenarios -->
      <div class="brutal-pane">
        <div class="pane-header bg-yellow">
          <span>常用场景快捷计算</span>
        </div>
        <div class="scenario-grid">
          <div class="scenario-item" @click="setScenario('anniversary')">
            <div class="sc-icon">🎂</div>
            <div class="sc-info">
              <h4>下一个生日</h4>
              <p>距离今天还有多久？</p>
            </div>
          </div>
          <div class="scenario-item" @click="setScenario('work')">
            <div class="sc-icon">💼</div>
            <div class="sc-info">
              <h4>工龄计算</h4>
              <p>入职至今的天数</p>
            </div>
          </div>
          <div class="scenario-item" @click="setScenario('countdown')">
            <div class="sc-icon">🎆</div>
            <div class="sc-info">
              <h4>新年倒计时</h4>
              <p>距离明年元旦</p>
            </div>
          </div>
        </div>
      </div>

      <div class="brutal-status info">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i">© 2026 LRM工具箱 - 日期差计算器 // &nbsp;</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import dayjs from 'dayjs';

  const mode = ref('diff');

  const startDateStr = ref(dayjs().format('YYYY-MM-DD'));
  const endDateStr = ref(dayjs().format('YYYY-MM-DD'));

  const diffResult = computed(() => {
    if (!startDateStr.value || !endDateStr.value) return null;

    const start = dayjs(startDateStr.value).startOf('day');
    const end = dayjs(endDateStr.value).startOf('day');
    const diffDays = Math.abs(end.diff(start, 'day'));

    const weeksFull = Math.floor(diffDays / 7);
    let workdays = weeksFull * 5;
    const remainder = diffDays % 7;

    workdays += Math.min(remainder, 5);

    return {
      days: diffDays,
      weeks: (diffDays / 7).toFixed(1),
      months: (diffDays / 30.44).toFixed(1),
      years: (diffDays / 365.25).toFixed(2),
      workdays: workdays
    };
  });

  const setToday = target => {
    if (target === 'start') startDateStr.value = dayjs().format('YYYY-MM-DD');
    else endDateStr.value = dayjs().format('YYYY-MM-DD');
  };

  const baseDateStr = ref(dayjs().format('YYYY-MM-DD'));
  const calcOperator = ref('+');
  const calcValue = ref(100);
  const calcUnit = ref('days');

  const calcResult = computed(() => {
    if (!baseDateStr.value || calcValue.value === '') return null;
    const base = dayjs(baseDateStr.value);
    const val = parseInt(calcValue.value) || 0;

    if (calcOperator.value === '+') {
      return base.add(val, calcUnit.value).toDate();
    } else {
      return base.subtract(val, calcUnit.value).toDate();
    }
  });

  const formatDate = date => dayjs(date).format('YYYY年MM月DD日');
  const getWeekday = date => {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[date.getDay()];
  };

  const setScenario = type => {
    mode.value = 'diff';
    const now = dayjs();

    if (type === 'anniversary') {
      startDateStr.value = now.format('YYYY-MM-DD');
      const nextYear = now.year() + 1;
      endDateStr.value = `${nextYear}-01-01`;
    } else if (type === 'work') {
      endDateStr.value = now.format('YYYY-MM-DD');
      startDateStr.value = now.subtract(1, 'year').format('YYYY-MM-DD');
    } else if (type === 'countdown') {
      startDateStr.value = now.format('YYYY-MM-DD');
      endDateStr.value = `${now.year() + 1}-01-01`;
    }
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
    background-position: -2px -2px;
    min-height: 100vh;
    padding: 2rem;
    box-sizing: border-box;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    color: #111;
  }

  .brutal-container {
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #4b7bff;
  }

  .brutal-title span {
    color: #4b7bff;
    text-shadow: 4px 4px 0px #111;
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
    box-shadow: 6px 6px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }

  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }

  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }

  /* Toolbar */
  .brutal-toolbar {
    display: flex;
    background: #fff;
    border: 4px solid #111;
    padding: 1rem;
    box-shadow: 8px 8px 0px #111;
  }

  .tools-left {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .brutal-action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.6rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
  }

  .brutal-action-btn.primary {
    background: #00e572;
  }

  .brutal-action-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .brutal-action-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px #111;
  }

  /* Pane */
  .brutal-pane {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
    transition: transform 0.2s;
    display: flex;
    flex-direction: column;
  }

  .brutal-pane:hover {
    transform: translate(-4px, -4px);
    box-shadow: 16px 16px 0px #111;
  }

  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.15rem;
    letter-spacing: 1px;
  }

  .bg-yellow {
    background: #ffd900;
  }
  .bg-blue {
    background: #4b7bff;
    color: #fff;
  }
  .bg-green {
    background: #00e572;
  }
  .text-white {
    color: #fff;
  }

  .calc-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .date-inputs {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .brutal-label {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .today-link {
    background: none;
    border: none;
    color: #4b7bff;
    font-weight: 800;
    font-size: 0.9rem;
    cursor: pointer;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    text-decoration: underline;
  }

  .brutal-input {
    border: 3px solid #111;
    padding: 0.6rem 0.8rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 1rem;
    background: #fff;
    box-shadow: 3px 3px 0px #111;
    outline: none;
  }

  .brutal-select {
    border: 3px solid #111;
    padding: 0.6rem 0.8rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 1rem;
    background: #ffd900;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    outline: none;
  }

  .full {
    width: 100%;
    box-sizing: border-box;
  }

  .separator {
    text-align: center;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    color: #555;
    position: relative;
    padding: 0.5rem 0;
  }

  .separator::before,
  .separator::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 40%;
    height: 3px;
    background: #111;
  }

  .separator::before {
    left: 0;
  }
  .separator::after {
    right: 0;
  }

  .operation-group {
    display: flex;
    gap: 0.75rem;
  }

  .operation-group .brutal-input {
    flex: 1;
  }

  /* Results */
  .result-display {
    background: #ffd900;
    border: 3px solid #111;
    box-shadow: 6px 6px 0px #111;
    padding: 2rem;
    text-align: center;
  }

  .primary-result .result-label {
    display: block;
    color: #555;
    font-size: 1rem;
    margin-bottom: 0.5rem;
    font-weight: 700;
  }

  .primary-result .result-value {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.5rem;
    font-weight: 800;
    color: #111;
    line-height: 1;
  }

  .primary-result .date-val {
    font-size: 2.2rem;
  }

  .primary-result .result-unit {
    margin-left: 0.25rem;
    font-size: 1.2rem;
    font-weight: 700;
  }

  .detail-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 3px solid #111;
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .d-label {
    font-size: 0.8rem;
    color: #555;
    font-weight: 700;
  }

  .d-value {
    font-size: 1.2rem;
    font-weight: 800;
    font-family: 'IBM Plex Mono', monospace;
  }

  .weekday-display {
    margin-top: 0.75rem;
    font-weight: 800;
    font-size: 1.1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
  }

  /* Scenarios */
  .scenario-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }

  .scenario-item {
    padding: 1.5rem;
    cursor: pointer;
    text-align: center;
    transition: all 0.1s;
    border-right: 3px solid #111;
  }

  .scenario-item:last-child {
    border-right: none;
  }

  .scenario-item:hover {
    background: #fdfae5;
  }

  .scenario-item:active {
    background: #ffd900;
  }

  .sc-icon {
    font-size: 2.5rem;
    margin-bottom: 0.75rem;
  }

  .sc-info h4 {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1rem;
    font-weight: 800;
    margin: 0 0 0.25rem;
  }

  .sc-info p {
    font-size: 0.8rem;
    color: #555;
    margin: 0;
    font-weight: 600;
  }

  /* Status Bar */
  .brutal-status {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    padding: 1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.2rem;
    overflow: hidden;
    text-transform: uppercase;
  }

  .brutal-status.info {
    background: #fff;
  }

  .marquee-wrapper {
    width: 100%;
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

  /* Responsive */
  @media (max-width: 700px) {
    .brutal-title {
      font-size: 2rem;
    }
    .scenario-grid {
      grid-template-columns: 1fr;
    }
    .scenario-item {
      border-right: none;
      border-bottom: 3px solid #111;
    }
    .scenario-item:last-child {
      border-bottom: none;
    }
    .operation-group {
      flex-direction: column;
    }
    .brutal-header {
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }
  }

  /* --- Dark Mode --- */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-toolbar,
  [data-theme='dark'] .brutal-status,
  [data-theme='dark'] .brutal-status.info,
  [data-theme='dark'] .brutal-action-btn {
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
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .brutal-toolbar {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn {
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:hover {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn.primary {
    background: #00994c;
    color: #fff;
  }

  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane:hover {
    box-shadow: 16px 16px 0px #eee;
  }

  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
    color: #111;
  }

  [data-theme='dark'] .brutal-input {
    background: #222;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
    color: #eee;
  }

  [data-theme='dark'] .brutal-select {
    background: #b28f00;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
    color: #fff;
  }

  [data-theme='dark'] .result-display {
    background: #b28f00;
    border-color: #eee;
    box-shadow: 6px 6px 0px #eee;
    color: #fff;
  }

  [data-theme='dark'] .detail-grid {
    border-top-color: #eee;
  }

  [data-theme='dark'] .d-label,
  [data-theme='dark'] .primary-result .result-label {
    color: rgba(255, 255, 255, 0.7);
  }

  [data-theme='dark'] .primary-result .result-value {
    color: #fff;
  }

  [data-theme='dark'] .separator::before,
  [data-theme='dark'] .separator::after {
    background: #eee;
  }
  [data-theme='dark'] .separator {
    color: #aaa;
  }

  [data-theme='dark'] .scenario-item {
    border-right-color: #eee;
  }
  [data-theme='dark'] .scenario-item:hover {
    background: #222;
  }
  [data-theme='dark'] .scenario-item:active {
    background: #b28f00;
  }
  [data-theme='dark'] .sc-info p {
    color: #aaa;
  }

  [data-theme='dark'] .today-link {
    color: #89b4f8;
  }

  [data-theme='dark'] .brutal-status {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .bg-green {
    background: #00994c;
    color: #fff;
  }

  @media (max-width: 700px) {
    [data-theme='dark'] .scenario-item {
      border-right: none;
      border-bottom-color: #eee;
    }
  }
</style>
