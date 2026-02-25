<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">年龄<span>.精算()</span></h1>
        <button class="brutal-btn reset-btn" @click="resetToNow">重置为现在</button>
      </header>

      <div class="brutal-toolbar">
        <div class="tools-left">
          <div class="toolbar-input-group">
            <span class="toolbar-label">出生日期:</span>
            <input
              v-model="birthDateStr"
              type="datetime-local"
              class="brutal-input"
              @change="calculateAge"
            />
          </div>
        </div>
        <div class="tools-right">
          <div class="toolbar-input-group">
            <span class="toolbar-label">基准时间:</span>
            <input
              v-model="targetDateStr"
              type="datetime-local"
              class="brutal-input"
              @change="calculateAge"
            />
          </div>
        </div>
      </div>

      <div v-if="ageResult" class="brutal-grid summary-grid">
        <div class="brutal-pane summary-card bg-blue">
          <div class="summary-inner">
            <span class="summary-val">{{ ageResult.years }}</span>
            <span class="summary-lab">周岁 (Years)</span>
          </div>
        </div>
        <div class="brutal-pane summary-card bg-green">
          <div class="summary-inner">
            <span class="summary-val">{{ ageResult.months }}</span>
            <span class="summary-lab">个月 (Months)</span>
          </div>
        </div>
        <div class="brutal-pane summary-card bg-pink">
          <div class="summary-inner">
            <span class="summary-val">{{ ageResult.days }}</span>
            <span class="summary-lab">天 (Days)</span>
          </div>
        </div>
      </div>

      <div class="brutal-grid detail-grid">
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span>累计生存时间统计</span>
          </div>
          <div class="stat-grid">
            <div class="stat-box">
              <div class="stat-val">{{ formatNumber(totalStats.months) }}</div>
              <div class="stat-lab">月 (Total Months)</div>
            </div>
            <div class="stat-box">
              <div class="stat-val">{{ formatNumber(totalStats.weeks) }}</div>
              <div class="stat-lab">周 (Total Weeks)</div>
            </div>
            <div class="stat-box">
              <div class="stat-val">{{ formatNumber(totalStats.days) }}</div>
              <div class="stat-lab">日 (Total Days)</div>
            </div>
            <div class="stat-box">
              <div class="stat-val">{{ formatNumber(totalStats.hours) }}</div>
              <div class="stat-lab">时 (Total Hours)</div>
            </div>
            <div class="stat-box">
              <div class="stat-val">{{ formatNumber(totalStats.minutes) }}</div>
              <div class="stat-lab">分 (Total Minutes)</div>
            </div>
            <div class="stat-box">
              <div class="stat-val">{{ formatNumber(totalStats.seconds) }}</div>
              <div class="stat-lab">秒 (Total Seconds)</div>
            </div>
          </div>
        </div>

        <div class="side-column">
          <div v-if="astrology" class="brutal-pane">
            <div class="pane-header bg-pink-header">
              <span>传统文化与占星</span>
            </div>
            <div class="astro-grid">
              <div class="astro-item">
                <div class="astro-label">生肖</div>
                <div class="astro-value">{{ astrology.zodiac }}</div>
              </div>
              <div class="astro-item">
                <div class="astro-label">星座</div>
                <div class="astro-value">{{ astrology.constellation }}</div>
              </div>
              <div class="astro-item">
                <div class="astro-label">干支</div>
                <div class="astro-value">{{ astrology.ganzhi }}</div>
              </div>
              <div class="astro-item highlight">
                <div class="astro-label">虚岁</div>
                <div class="astro-value">{{ ageResult ? ageResult.years + 1 : '-' }} 岁</div>
              </div>
            </div>
          </div>

          <div v-if="nextBirthday" class="brutal-pane">
            <div class="pane-header bg-blue">
              <span class="text-white">生日倒计时</span>
            </div>
            <div class="countdown-body">
              <div class="days-pill">
                <span class="num">{{ nextBirthday.days }}</span>
                <span class="unit">天后</span>
              </div>
              <p class="desc">
                迎来 <b>{{ ageResult ? ageResult.years + 1 : '-' }} 岁</b> 生日
              </p>
              <div class="target-date">日期: {{ nextBirthday.date }}</div>
            </div>
          </div>

          <div class="brutal-pane">
            <div class="pane-header bg-yellow">
              <span>计算说明</span>
            </div>
            <ul class="brutal-list">
              <li><b>周岁</b>：按照国际标准计算。出生时为 0 岁，每过一个公历生日增加一岁。</li>
              <li><b>虚岁</b>：中国传统计算方法。出生时即为 1 岁，每过一个农历春节增加一岁。</li>
              <li><b>统计精度</b>：总时长计算基于公历，已自动考虑平闰年差异。</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="brutal-status info">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i">© 2026 LRM工具箱 - 精确年龄计算器 // &nbsp;</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import dayjs from 'dayjs';
  import duration from 'dayjs/plugin/duration';
  import { Solar } from 'lunar-javascript';

  dayjs.extend(duration);

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const birthDateStr = ref('1995-10-10T10:00');
  const targetDateStr = ref(dayjs().format('YYYY-MM-DDTHH:mm'));

  const birthDate = computed(() => new Date(birthDateStr.value));
  const targetDate = computed(() => new Date(targetDateStr.value));

  const ageResult = ref(null);
  const totalStats = reactive({
    months: 0,
    weeks: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const astrology = ref(null);
  const nextBirthday = ref(null);
  let ticker = null;

  const resetToNow = () => {
    targetDateStr.value = dayjs().format('YYYY-MM-DDTHH:mm');
    calculateAge();
  };

  const calculateAge = () => {
    if (!birthDate.value || !targetDate.value) return;

    const start = dayjs(birthDate.value);
    const end = dayjs(targetDate.value);

    if (end.isBefore(start)) {
      ageResult.value = null;
      return;
    }

    const diff = end.diff(start);
    const dur = dayjs.duration(diff);

    ageResult.value = {
      years: dur.years(),
      months: dur.months(),
      days: dur.days()
    };

    totalStats.months = end.diff(start, 'month');
    totalStats.weeks = end.diff(start, 'week');
    totalStats.days = end.diff(start, 'day');
    totalStats.hours = end.diff(start, 'hour');
    totalStats.minutes = end.diff(start, 'minute');
    totalStats.seconds = end.diff(start, 'second');

    const solar = Solar.fromDate(birthDate.value);
    const lunar = solar.getLunar();
    astrology.value = {
      zodiac: lunar.getYearShengXiao(),
      constellation: solar.getXingZuo() + '座',
      ganzhi: lunar.getYearInGanZhi() + '年'
    };

    const thisYearBirthday = dayjs(birthDate.value).year(end.year());
    let nextBday = thisYearBirthday;
    if (thisYearBirthday.isBefore(end)) {
      nextBday = thisYearBirthday.add(1, 'year');
    }
    nextBirthday.value = {
      days: nextBday.diff(end, 'day'),
      date: nextBday.format('YYYY-MM-DD')
    };
  };

  const formatNumber = num => {
    return num.toLocaleString();
  };

  onMounted(() => {
    calculateAge();
    ticker = setInterval(() => {
      if (dayjs(targetDate.value).diff(dayjs(), 'second') === 0) {
        targetDateStr.value = dayjs().format('YYYY-MM-DDTHH:mm');
        calculateAge();
      }
    }, 1000);
  });

  onUnmounted(() => {
    if (ticker) clearInterval(ticker);
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
    background-position: -2px -2px;
    min-height: 100vh;
    padding: 2rem;
    box-sizing: border-box;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    color: #111;
  }

  .brutal-container {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }

  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.5rem;
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

  .brutal-btn.reset-btn {
    background: #4b7bff;
    color: #fff;
  }

  .brutal-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    border: 4px solid #111;
    padding: 1.5rem;
    margin-bottom: 2.5rem;
    box-shadow: 8px 8px 0px #111;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .tools-left,
  .tools-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .toolbar-input-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .toolbar-label {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    white-space: nowrap;
  }

  .brutal-input {
    border: 3px solid #111;
    padding: 0.5rem 0.8rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 1rem;
    background: #ffd900;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    outline: none;
  }

  /* Summary Grid - 3 cards top */
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    margin-bottom: 2.5rem;
  }

  .summary-card {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 160px;
    padding: 1.5rem;
  }

  .summary-inner {
    text-align: center;
    color: #fff;
  }

  .summary-val {
    display: block;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 4rem;
    font-weight: 800;
    line-height: 1;
  }

  .summary-lab {
    display: block;
    font-size: 1rem;
    font-weight: 600;
    margin-top: 0.5rem;
    opacity: 0.9;
  }

  /* Detail Grid - main + sidebar */
  .detail-grid {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 2.5rem;
    margin-bottom: 2.5rem;
  }

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
    font-size: 1.25rem;
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
  .bg-pink {
    background: #ff4b4b;
    color: #fff;
  }
  .bg-pink-header {
    background: #ff9fb2;
  }
  .text-white {
    color: #fff;
  }

  /* Stat Grid */
  .stat-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    padding: 1.5rem;
  }

  .stat-box {
    background: #fdfae5;
    padding: 1.25rem;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
  }

  .stat-box:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .stat-val {
    font-size: 1.3rem;
    font-weight: 700;
    color: #111;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
  }

  .stat-lab {
    font-size: 0.75rem;
    color: #555;
    margin-top: 4px;
    font-weight: 600;
  }

  /* Sidebar */
  .side-column {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .astro-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    padding: 1.25rem;
  }

  .astro-item {
    background: #fdfae5;
    padding: 0.75rem;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #111;
  }

  .astro-item.highlight {
    background: #ff9fb2;
  }

  .astro-item.highlight .astro-value {
    color: #111;
    font-weight: 800;
  }

  .astro-label {
    font-size: 0.75rem;
    color: #555;
    font-weight: 700;
    text-transform: uppercase;
  }

  .astro-value {
    font-size: 1.2rem;
    font-weight: 700;
    color: #111;
    margin-top: 2px;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
  }

  /* Countdown */
  .countdown-body {
    padding: 1.5rem;
    text-align: center;
  }

  .days-pill {
    background: #ffd900;
    display: inline-flex;
    flex-direction: column;
    width: 100%;
    padding: 1.5rem 1rem;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    color: #111;
    margin-bottom: 1rem;
  }

  .days-pill .num {
    font-size: 3.5rem;
    font-weight: 900;
    line-height: 1;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
  }

  .days-pill .unit {
    font-size: 1rem;
    font-weight: 700;
  }

  .desc {
    font-size: 1rem;
    color: #111;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  .desc b {
    color: #ff4b4b;
  }

  .target-date {
    font-size: 0.85rem;
    color: #555;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
  }

  /* Tips List */
  .brutal-list {
    list-style: none;
    padding: 1.25rem;
    margin: 0;
  }

  .brutal-list li {
    font-size: 0.85rem;
    color: #333;
    position: relative;
    padding-left: 1.25rem;
    margin-bottom: 0.75rem;
    line-height: 1.6;
    font-weight: 500;
  }

  .brutal-list li::before {
    content: '▪';
    position: absolute;
    left: 0;
    color: #ff4b4b;
    font-weight: 900;
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
  @media (max-width: 1024px) {
    .brutal-title {
      font-size: 2.5rem;
    }
    .summary-grid {
      grid-template-columns: 1fr;
    }
    .detail-grid {
      grid-template-columns: 1fr;
    }
    .brutal-toolbar {
      flex-direction: column;
      align-items: flex-start;
    }
    .brutal-header {
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }
    .stat-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* --- Dark Mode Overrides --- */
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
  [data-theme='dark'] .brutal-status.info {
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
    background: #b28f00;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
    color: #fff;
  }

  [data-theme='dark'] .stat-box {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .stat-box:hover {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .stat-val {
    color: #eee;
  }
  [data-theme='dark'] .stat-lab {
    color: #aaa;
  }

  [data-theme='dark'] .astro-item {
    background: #222;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .astro-item.highlight {
    background: #b25465;
  }
  [data-theme='dark'] .astro-value {
    color: #eee;
  }
  [data-theme='dark'] .astro-label {
    color: #aaa;
  }

  [data-theme='dark'] .days-pill {
    background: #b28f00;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
    color: #fff;
  }

  [data-theme='dark'] .desc {
    color: #eee;
  }
  [data-theme='dark'] .desc b {
    color: #ff9fb2;
  }
  [data-theme='dark'] .target-date {
    color: #aaa;
  }

  [data-theme='dark'] .brutal-list li {
    color: #ccc;
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
  [data-theme='dark'] .bg-pink {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .bg-pink-header {
    background: #b25465;
    color: #fff;
  }

  [data-theme='dark'] .brutal-btn.reset-btn {
    background: #2a4eb2;
    color: #fff;
  }

  [data-theme='dark'] .countdown-body {
    color: #eee;
  }

  [data-theme='dark'] .summary-inner {
    color: #fff;
  }
</style>
