<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">健康<span>.睡眠周期()</span></h1>
      </header>

      <main class="tool-content">
        <div class="brutal-pane mode-switch mx-auto mt-4">
          <button
            class="brutal-tab bg-white"
            :class="{ 'active-tab': mode === 'wake' }"
            @click="mode = 'wake'"
          >
            我计划按时起床
          </button>
          <button
            class="brutal-tab bg-white"
            :class="{ 'active-tab': mode === 'sleep' }"
            @click="mode = 'sleep'"
          >
            我现在马上睡觉
          </button>
        </div>

        <div class="brutal-pane main-calc mx-auto mt-8">
          <div v-if="mode === 'wake'" class="input-section bg-yellow">
            <h3>您计划几点起床？</h3>
            <input v-model="wakeTimeStr" type="time" class="brutal-time-input" />
          </div>

          <div v-else class="input-section bg-yellow">
            <h3>如果您现在 ({{ nowTimeFormatted }}) 入睡...</h3>
            <p class="subtitle">计算已包含平均 <strong>15分钟</strong> 的入睡准备时间</p>
          </div>

          <div class="result-list pane-body">
            <h3>推荐建议时间</h3>
            <p class="desc">
              基于 <strong>90分钟</strong> 的睡眠周期计算，在周期结束时的浅睡期醒来会倍感清醒。
            </p>

            <div class="cycles-container">
              <div
                v-for="cycle in recommendedTimes"
                :key="cycle.time"
                class="cycle-card relative-card"
                :class="cycle.type"
              >
                <div class="cycle-time">{{ cycle.time }}</div>
                <div class="cycle-info">
                  <span class="info-text">{{ cycle.cycles }} 个周期 ({{ cycle.hours }}小时)</span>
                  <span v-if="cycle.tag" class="tag">{{ cycle.tag }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="brutal-info-box mx-auto mt-8">
          <h3>😴 什么是睡眠周期？</h3>
          <p>
            人的睡眠由多个
            <strong>90 分钟</strong
            >左右的周期组成。如果我们在周期的中间（深睡期）被闹钟叫醒，会有很强的起床气和疲惫感；而在周期结束的浅睡期醒来，则会感到神清气爽。
          </p>
        </div>
      </main>

      <footer class="footer mt-8">© 2026 LRM工具箱 - 睡眠健康</footer>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue';

  const mode = ref<'wake' | 'sleep'>('wake');
  const now = ref(new Date());

  // Format MM:HH for native input
  const formatTime = (date: Date) => {
    return (
      date.getHours().toString().padStart(2, '0') +
      ':' +
      date.getMinutes().toString().padStart(2, '0')
    );
  };

  const wakeTimeStr = ref('07:00');

  const timer = setInterval(() => {
    now.value = new Date();
  }, 60000);

  onMounted(() => {
    wakeTimeStr.value = '07:00';
  });

  onUnmounted(() => {
    clearInterval(timer);
  });

  const nowTimeFormatted = computed(() => formatTime(now.value));

  interface ResultTime {
    time: string;
    cycles: number;
    hours: string;
    type: 'optimal' | 'good' | 'ok';
    tag?: string;
  }

  const recommendedTimes = computed<ResultTime[]>(() => {
    const results: ResultTime[] = [];
    const cycleMinutes = 90;
    const fallAsleepMinutes = 15;

    if (mode.value === 'wake') {
      // Calculate bedtime based on wake time
      const [hours, minutes] = wakeTimeStr.value.split(':').map(Number);
      const wake = new Date();
      wake.setHours(hours, minutes, 0, 0);

      const cycles = [6, 5, 4]; // 9h, 7.5h, 6h

      cycles.forEach(c => {
        const sleepDuration = c * cycleMinutes;
        const bedTime = new Date(wake.getTime() - (sleepDuration + fallAsleepMinutes) * 60000);

        results.push({
          time: formatTime(bedTime),
          cycles: c,
          hours: (sleepDuration / 60).toFixed(1),
          type: c === 5 || c === 6 ? 'optimal' : 'good',
          tag: c === 5 ? '★ 推荐' : undefined
        });
      });
    } else {
      // Calculate wake time based on now
      const sleepStart = new Date(now.value.getTime() + fallAsleepMinutes * 60000);
      const cycles = [4, 5, 6];

      cycles.forEach(c => {
        const sleepDuration = c * cycleMinutes;
        const wakeTime = new Date(sleepStart.getTime() + sleepDuration * 60000);

        results.push({
          time: formatTime(wakeTime),
          cycles: c,
          hours: (sleepDuration / 60).toFixed(1),
          type: c === 5 || c === 6 ? 'optimal' : 'good',
          tag: c === 5 ? '★ 推荐' : undefined
        });
      });
    }

    // Sort by time
    return results.sort((a, b) => {
      return a.time.localeCompare(b.time);
    });
  });
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

  .brutal-wrapper {
    background-color: #fdfae5;
    background-image:
      linear-gradient(#111 2px, transparent 2px), linear-gradient(90deg, #111 2px, transparent 2px);
    background-size: 40px 40px;
    background-position: center;
    background-attachment: fixed;
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
  }

  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 3rem;
    flex-wrap: wrap;
    gap: 1rem;
    background: #fff;
    border: 4px solid #111;
    padding: 1rem 1.5rem;
    box-shadow: 8px 8px 0 #111;
  }
  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 2.5rem;
    font-weight: 900;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    flex: 1;
    text-align: center;
  }
  .brutal-title span {
    color: #4b7bff;
  }

  .brutal-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.5rem 1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1rem;
    font-weight: 900;
    cursor: pointer;
    box-shadow: 4px 4px 0 #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }
  .brutal-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #111;
  }
  .brutal-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0 0 0 #111;
  }

  .mx-auto {
    margin-left: auto;
    margin-right: auto;
  }
  .brutal-pane {
    width: 100%;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    border: 4px solid #111;
    box-shadow: 12px 12px 0 #111;
    min-width: 0;
    background: #fff;
  }
  .pane-body {
    padding: 2rem;
  }

  .mode-switch {
    flex-direction: row;
    border-bottom: 4px solid #111;
  }
  .brutal-tab {
    flex: 1;
    border: none;
    border-right: 4px solid #111;
    padding: 1.5rem 1rem;
    font-size: 1.1rem;
    font-weight: 900;
    font-family: 'Noto Sans SC', sans-serif;
    cursor: pointer;
    transition: background 0.1s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .brutal-tab:last-child {
    border-right: none;
  }
  .bg-white {
    background: #fff;
  }
  .brutal-tab:hover:not(.active-tab) {
    background: #fdfae5;
  }
  .active-tab {
    background: #111;
    color: #000;
  }

  .bg-yellow {
    background: #ffd900;
    border-bottom: 4px solid #111;
    padding: 2rem;
  }
  .input-section {
    text-align: center;
  }
  .input-section h3 {
    margin: 0 0 1rem;
    font-size: 1.5rem;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
  }

  .brutal-time-input {
    width: 220px;
    padding: 0.5rem 1rem;
    font-size: 2.5rem;
    border: 4px solid #111;
    background: #fff;
    font-weight: 900;
    box-sizing: border-box;
    text-align: center;
    font-family: 'IBM Plex Mono', monospace;
    transition: all 0.1s;
    box-shadow: 6px 6px 0 #111;
  }
  .brutal-time-input:focus {
    outline: none;
    box-shadow: 8px 8px 0 #4b7bff;
    border-color: #111;
    transform: translate(-2px, -2px);
  }

  .subtitle {
    font-size: 1rem;
    color: #333;
    margin: 0;
  }
  .subtitle strong {
    color: #ff4b4b;
    font-size: 1.2rem;
  }

  .result-list {
    text-align: center;
  }
  .result-list h3 {
    margin: 0 0 0.5rem;
    font-size: 1.5rem;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
  }
  .desc {
    font-size: 0.95rem;
    margin-bottom: 2rem;
    font-weight: bold;
  }
  .desc strong {
    color: #4b7bff;
  }

  .cycles-container {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
  .cycle-card {
    border: 4px solid #111;
    padding: 1.5rem 2rem;
    background: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .relative-card {
    box-shadow: 6px 6px 0 #111;
    transition: transform 0.1s;
  }
  .relative-card:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0 #111;
  }

  .cycle-card.optimal {
    background: #d1fae5;
    border-color: #111;
  }
  .cycle-card.good {
    background: #fdfae5;
  }

  .cycle-time {
    font-size: 2.5rem;
    font-weight: 900;
    font-family: 'IBM Plex Mono', monospace;
    line-height: 1;
    text-shadow: 2px 2px 0 #111;
    color: #fff;
  }
  .cycle-card.optimal .cycle-time {
    color: #10b981;
  }
  .cycle-card.good .cycle-time {
    color: #111;
    text-shadow: none;
  }

  .cycle-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5rem;
  }
  .info-text {
    font-size: 1.1rem;
    font-weight: 900;
    font-family: 'Noto Sans SC', sans-serif;
  }
  .tag {
    background: #ff4b4b;
    color: #fff;
    font-size: 0.8rem;
    font-weight: 900;
    padding: 2px 8px;
    border: 2px solid #111;
  }

  .brutal-info-box {
    width: 100%;
    max-width: 600px;
    border: 4px dashed #111;
    padding: 2rem;
    background: #fff;
    font-weight: bold;
  }
  .brutal-info-box h3 {
    margin: 0 0 1rem;
    font-size: 1.25rem;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
  }
  .brutal-info-box p {
    margin: 0;
    font-size: 1rem;
    line-height: 1.6;
  }
  .brutal-info-box strong {
    color: #4b7bff;
  }

  .mt-4 {
    margin-top: 1rem;
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
    .cycle-card {
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    .cycle-info {
      align-items: center;
    }
  }

  /* Dark Mode */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .brutal-header {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 8px 8px 0 #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-tab {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-time-input,
  [data-theme='dark'] .relative-card {
    box-shadow: 6px 6px 0 #eee;
  }
  [data-theme='dark'] .brutal-btn:hover,
  [data-theme='dark'] .relative-card:hover {
    box-shadow: 9px 9px 0 #eee;
  }

  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0 #eee;
  }
  [data-theme='dark'] .bg-white {
    background: #1a1a1a;
  }
  [data-theme='dark'] .bg-yellow {
    background: #332700;
    border-bottom-color: #eee;
  }

  [data-theme='dark'] .brutal-tab {
    border-right-color: #eee;
  }
  [data-theme='dark'] .brutal-tab:hover:not(.active-tab) {
    background: #222;
  }
  [data-theme='dark'] .active-tab {
    background: #eee;
    color: #111;
  }

  [data-theme='dark'] .brutal-time-input {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-time-input:focus {
    border-color: #2a4eb2;
    box-shadow: 8px 8px 0 #2a4eb2;
  }
  [data-theme='dark'] .subtitle {
    color: #aaa;
  }
  [data-theme='dark'] .subtitle strong {
    color: #ff8b8b;
  }
  [data-theme='dark'] .desc strong {
    color: #6b8cff;
  }

  [data-theme='dark'] .cycle-card {
    border-color: #eee;
    background: #222;
  }
  [data-theme='dark'] .cycle-card.optimal {
    background: #003322;
  }
  [data-theme='dark'] .cycle-card.good {
    background: #332200;
  }

  [data-theme='dark'] .cycle-time {
    text-shadow: 2px 2px 0 #eee;
  }
  [data-theme='dark'] .cycle-card.optimal .cycle-time {
    color: #10b981;
  }
  [data-theme='dark'] .cycle-card.good .cycle-time {
    color: #f59e0b;
  }
  [data-theme='dark'] .tag {
    background: #ff8b8b;
    color: #111;
    border-color: #eee;
  }

  [data-theme='dark'] .brutal-info-box {
    background: #222;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-info-box strong {
    color: #6b8cff;
  }
</style>
