<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">放假<span>.安排()</span></h1>
        <div style="width: 120px"></div>
      </header>

      <!-- Next Holiday -->
      <div class="brutal-pane summary-card">
        <div class="pane-header bg-pink">
          <span class="text-white">🎉 下一个假期</span>
        </div>
        <div class="summary-body">
          <div class="holiday-countdown">
            <span class="holiday-name">{{ nextHoliday.name }}</span>
            <div class="days-display">
              <span class="days-num">{{ nextHoliday.daysLeft }}</span>
              <span class="days-unit">天后</span>
            </div>
          </div>
          <div class="holiday-range">{{ nextHoliday.range }} ({{ nextHoliday.length }}天)</div>
        </div>
      </div>

      <!-- Year Controls -->
      <div class="brutal-toolbar">
        <div class="tools-left">
          <button
            v-for="year in availableYears"
            :key="year"
            class="brutal-action-btn"
            :class="{ primary: currentYear === year }"
            @click="currentYear = year"
          >
            {{ year }}年
          </button>
        </div>
        <div class="tools-right">
          <div class="legend-row">
            <span class="legend-item"><span class="leg-box rest"></span> 补班</span>
            <span class="legend-item"><span class="leg-box holiday"></span> 放假</span>
          </div>
        </div>
      </div>

      <!-- Holiday Cards -->
      <div class="holidays-grid">
        <div
          v-for="holiday in filteredHolidays"
          :key="holiday.name"
          class="brutal-pane holiday-card"
        >
          <div class="pane-header bg-yellow">
            <span>{{ holiday.name }}</span>
            <span class="length-tag">{{ holiday.length }}天</span>
          </div>
          <div class="holiday-body">
            <div class="holiday-range-text">{{ holiday.range }}</div>

            <div v-if="holiday.adjustments && holiday.adjustments.length > 0" class="adj-section">
              <div class="adj-title">补班安排：</div>
              <div v-for="adj in holiday.adjustments" :key="adj" class="adj-tag">
                {{ adj }} (上班)
              </div>
            </div>
            <div v-else class="no-adj">✓ 无需调休</div>

            <div class="holiday-tip">{{ holiday.tip }}</div>
          </div>
        </div>
      </div>

      <!-- Disclaimer -->
      <div class="brutal-pane disclaimer-pane">
        <div class="disclaimer-content">
          <span class="disc-icon">ℹ</span>
          <span>数据根据国务院办公厅发布的放假安排通知整理。具体请以官方公告为准。</span>
        </div>
      </div>

      <div class="brutal-status info">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i">© 2026 LRM工具箱 - 调休放假安排 // &nbsp;</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch, onMounted } from 'vue';
  import { availableYears, loadHolidays, getNextHoliday } from '@/data/holidays';

  const now = new Date();
  const defaultYear = now.getFullYear().toString();
  const currentYear = ref(
    availableYears.includes(defaultYear) ? defaultYear : availableYears[availableYears.length - 1]
  );

  const filteredHolidays = ref([]);
  const nextHoliday = ref({ name: '加载中...', daysLeft: '-', range: '-', length: 0 });

  const updateHolidays = async () => {
    filteredHolidays.value = await loadHolidays(currentYear.value);
  };
  const updateNextHoliday = async () => {
    nextHoliday.value = await getNextHoliday();
  };

  watch(currentYear, updateHolidays);
  onMounted(() => {
    updateHolidays();
    updateNextHoliday();
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
    max-width: 1100px;
    margin: 0 auto;
  }
  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #ff9fb2;
  }
  .brutal-title span {
    color: #ff4b4b;
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

  /* Summary Card */
  .summary-card {
    margin-bottom: 2rem;
  }
  .summary-body {
    padding: 2rem;
  }
  .holiday-countdown {
    display: flex;
    align-items: baseline;
    gap: 1.5rem;
    margin-bottom: 0.75rem;
  }
  .holiday-name {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 2rem;
    font-weight: 800;
  }
  .days-display {
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
  }
  .days-num {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.5rem;
    font-weight: 800;
    color: #ff4b4b;
  }
  .days-unit {
    font-size: 1.2rem;
    font-weight: 700;
  }
  .holiday-range {
    font-size: 1rem;
    color: #555;
    font-weight: 600;
  }

  /* Toolbar */
  .brutal-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    border: 4px solid #111;
    padding: 1rem 1.25rem;
    margin-bottom: 2rem;
    box-shadow: 8px 8px 0px #111;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .tools-left {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  .tools-right {
    display: flex;
    align-items: center;
  }
  .brutal-action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.5rem 1.25rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
  }
  .brutal-action-btn.primary {
    background: #ffd900;
  }
  .brutal-action-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }
  .brutal-action-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px #111;
  }

  .legend-row {
    display: flex;
    gap: 1.5rem;
    font-size: 0.9rem;
    font-weight: 700;
  }
  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .leg-box {
    width: 18px;
    height: 18px;
    border: 2px solid #111;
  }
  .leg-box.rest {
    background: #ff4b4b;
  }
  .leg-box.holiday {
    background: #111;
  }

  /* Holiday Grid */
  .holidays-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .brutal-pane {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 10px 10px 0px #111;
    transition: all 0.15s;
    display: flex;
    flex-direction: column;
  }
  .brutal-pane:hover {
    transform: translate(-3px, -3px);
    box-shadow: 13px 13px 0px #111;
  }

  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
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
  .text-white {
    color: #fff;
  }

  .length-tag {
    background: #111;
    color: #ffd900;
    padding: 0.2rem 0.6rem;
    font-size: 0.85rem;
    border: 2px solid #111;
  }
  .holiday-body {
    padding: 1.25rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .holiday-range-text {
    font-size: 1rem;
    font-weight: 700;
  }
  .adj-section {
    background: #fdfae5;
    padding: 0.75rem;
    border: 2px solid #111;
  }
  .adj-title {
    font-size: 0.8rem;
    color: #555;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
  .adj-tag {
    color: #ff4b4b;
    font-weight: 700;
    font-size: 0.9rem;
  }
  .no-adj {
    color: #00e572;
    font-weight: 700;
    font-size: 0.9rem;
  }
  .holiday-tip {
    font-size: 0.85rem;
    color: #555;
    font-style: italic;
    font-weight: 500;
  }

  /* Disclaimer */
  .disclaimer-pane {
    padding: 1.25rem 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 6px 6px 0px #111;
  }
  .disclaimer-content {
    display: flex;
    gap: 0.8rem;
    align-items: center;
    font-size: 0.85rem;
    font-weight: 600;
    color: #555;
  }
  .disc-icon {
    font-size: 1.2rem;
  }

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

  @media (max-width: 768px) {
    .brutal-title {
      font-size: 2rem;
    }
    .holidays-grid {
      grid-template-columns: 1fr;
    }
    .brutal-header {
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }
    .holiday-countdown {
      flex-direction: column;
      gap: 0.5rem;
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
  [data-theme='dark'] .brutal-toolbar,
  [data-theme='dark'] .brutal-status,
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
  [data-theme='dark'] .brutal-pane {
    box-shadow: 10px 10px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane:hover {
    box-shadow: 13px 13px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
    color: #111;
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
    background: #b28f00;
    color: #111;
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
  [data-theme='dark'] .days-num {
    color: #ff9fb2;
  }
  [data-theme='dark'] .holiday-range,
  [data-theme='dark'] .holiday-tip,
  [data-theme='dark'] .disclaimer-content {
    color: #aaa;
  }
  [data-theme='dark'] .length-tag {
    background: #eee;
    color: #111;
    border-color: #eee;
  }
  [data-theme='dark'] .adj-section {
    background: #222;
    border-color: #eee;
  }
  [data-theme='dark'] .adj-tag {
    color: #ff9fb2;
  }
  [data-theme='dark'] .no-adj {
    color: #00994c;
  }
  [data-theme='dark'] .leg-box {
    border-color: #eee;
  }
  [data-theme='dark'] .leg-box.rest {
    background: #cc0000;
  }
  [data-theme='dark'] .leg-box.holiday {
    background: #eee;
  }
</style>
