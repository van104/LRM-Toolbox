<template>
  <div class="tool-container">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>睡眠周期计算器</h1>
        <span class="nav-subtitle">Sleep Cycle & Wake-up Time</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="glass-card mode-switch">
        <button :class="{ active: mode === 'wake' }" @click="mode = 'wake'">我要按时起床</button>
        <button :class="{ active: mode === 'sleep' }" @click="mode = 'sleep'">我现在要睡觉</button>
      </div>

      <div class="glass-card main-calc">
        <div v-if="mode === 'wake'" class="input-section">
          <h3>您计划几点起床？</h3>
          <el-time-picker
            v-model="wakeTime"
            format="HH:mm"
            placeholder="选择起床时间"
            class="time-picker"
          />
        </div>

        <div v-else class="input-section">
          <h3>如果您现在 ({{ nowTimeFormatted }}) 入睡...</h3>
          <p class="subtitle">平均需要 15 分钟入睡时间</p>
        </div>

        <div class="result-list">
          <h3>建议的时间</h3>
          <p class="desc">基于 90 分钟的睡眠周期计算，在周期结束时醒来会倍感清醒。</p>

          <div class="cycles-container">
            <div
              v-for="cycle in recommendedTimes"
              :key="cycle.time"
              class="cycle-card"
              :class="cycle.type"
            >
              <span class="cycle-time">{{ cycle.time }}</span>
              <span class="cycle-info">
                {{ cycle.cycles }} 个周期 ({{ cycle.hours }}h)
                <span v-if="cycle.tag" class="tag">{{ cycle.tag }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="info-card">
        <h3>😴 什么是睡眠周期？</h3>
        <p>
          人的睡眠由多个 90
          分钟左右的周期组成。如果我们在周期的中间（深睡期）被闹钟叫醒，会有很强的起床气和疲惫感；而在周期结束的浅睡期醒来，则会感到神清气爽。
        </p>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 睡眠健康</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { Back } from '@element-plus/icons-vue';
  import dayjs from 'dayjs';

  const mode = ref<'wake' | 'sleep'>('wake');
  const wakeTime = ref(new Date());
  const now = ref(new Date());

  const timer = setInterval(() => {
    now.value = new Date();
  }, 60000);

  onMounted(() => {
    wakeTime.value = dayjs().hour(7).minute(0).toDate();
  });

  onUnmounted(() => {
    clearInterval(timer);
  });

  const nowTimeFormatted = computed(() => dayjs(now.value).format('HH:mm'));

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
      const wake = dayjs(wakeTime.value);
      // Suggest 4, 5, 6 cycles back
      // Must subtract fallAsleepMinutes from the calculated cycle time to get "in bed" time
      const cycles = [6, 5, 4]; // 9h, 7.5h, 6h

      cycles.forEach(c => {
        const sleepDuration = c * cycleMinutes;
        const bedTime = wake.subtract(sleepDuration + fallAsleepMinutes, 'minute');

        results.push({
          time: bedTime.format('HH:mm'),
          cycles: c,
          hours: (sleepDuration / 60).toFixed(1),
          type: c === 5 || c === 6 ? 'optimal' : 'good',
          tag: c === 5 ? '推荐' : undefined
        });
      });
    } else {
      // Calculate wake time based on now
      const sleepStart = dayjs(now.value).add(fallAsleepMinutes, 'minute');
      const cycles = [4, 5, 6];

      cycles.forEach(c => {
        const sleepDuration = c * cycleMinutes;
        const wake = sleepStart.add(sleepDuration, 'minute');

        results.push({
          time: wake.format('HH:mm'),
          cycles: c,
          hours: (sleepDuration / 60).toFixed(1),
          type: c === 5 || c === 6 ? 'optimal' : 'good',
          tag: c === 5 ? '推荐' : undefined
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
  .tool-container {
    min-height: 100vh;
    background: #1e1b4b; /* Dark blue night theme */
    font-family: 'Inter', system-ui, sans-serif;
    color: #e0e7ff;
  }

  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    padding: 1rem 1.5rem;
    background: rgba(30, 27, 75, 0.8);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    color: #a5b4fc;
    width: 80px;
  }

  .nav-center {
    flex: 1;
    text-align: center;
  }

  .nav-center h1 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: white;
  }

  .nav-subtitle {
    font-size: 0.8rem;
    color: #818cf8;
  }

  .nav-spacer {
    width: 80px;
  }

  .main-content {
    max-width: 600px;
    margin: 2rem auto;
    padding: 0 1.5rem;
  }

  .glass-card {
    background: rgba(49, 46, 129, 0.5);
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(129, 140, 248, 0.2);
    margin-bottom: 1.5rem;
  }

  .mode-switch {
    display: flex;
    justify-content: center;
    gap: 1rem;
    padding: 1rem !important;
  }

  .mode-switch button {
    background: transparent;
    border: 1px solid #6366f1;
    color: #c7d2fe;
    padding: 0.8rem 1.5rem;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 0.95rem;
  }

  .mode-switch button.active {
    background: #6366f1;
    color: white;
    box-shadow: 0 0 15px rgba(99, 102, 241, 0.5);
  }

  .input-section {
    text-align: center;
    margin-bottom: 2rem;
  }

  .input-section h3 {
    margin-bottom: 1rem;
    font-weight: 500;
  }

  .subtitle {
    color: #a5b4fc;
    font-size: 0.9rem;
  }

  .result-list {
    text-align: center;
  }

  .result-list .desc {
    font-size: 0.85rem;
    color: #a5b4fc;
    margin-bottom: 1.5rem;
  }

  .cycles-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .cycle-card {
    background: rgba(255, 255, 255, 0.1);
    padding: 1rem;
    border-radius: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .cycle-card.optimal {
    background: linear-gradient(90deg, rgba(79, 70, 229, 0.3), rgba(67, 56, 202, 0.3));
    border-color: rgba(99, 102, 241, 0.5);
  }

  .cycle-time {
    font-size: 1.8rem;
    font-weight: 700;
    color: white;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  }

  .cycle-info {
    text-align: right;
    font-size: 0.9rem;
    color: #c7d2fe;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .tag {
    background: #fbbf24;
    color: #451a03;
    font-size: 0.7rem;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 700;
    margin-top: 4px;
  }

  .info-card {
    background: rgba(30, 27, 75, 0.95);
    padding: 1.5rem;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    font-size: 0.9rem;
    line-height: 1.6;
    color: #a5b4fc;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #6366f1;
    font-size: 0.875rem;
    opacity: 0.6;
  }

  :deep(.el-input__wrapper) {
    background-color: rgba(255, 255, 255, 0.1) !important;
    box-shadow: none !important;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  :deep(.el-input__inner) {
    color: white !important;
    font-size: 1.5rem !important;
    text-align: center;
  }
</style>
