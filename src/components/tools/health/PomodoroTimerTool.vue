<template>
  <div class="brutal-wrapper" :class="modeClass">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">健康<span>.番茄钟()</span></h1>
        <button class="brutal-btn" @click="resetTimer">↻ 重置</button>
      </header>

      <main class="tool-content">
        <div class="brutal-grid-layout">
          <!-- Main Timer Pane -->
          <div class="brutal-pane timer-pane mx-auto bg-white">
            <div class="mode-tabs">
              <button
                class="tab-btn"
                :class="{ 'active-work': mode === 'work' }"
                @click="switchMode('work')"
              >
                专注 (25m)
              </button>
              <button
                class="tab-btn"
                :class="{ 'active-short': mode === 'short' }"
                @click="switchMode('short')"
              >
                短休 (5m)
              </button>
              <button
                class="tab-btn"
                :class="{ 'active-long': mode === 'long' }"
                @click="switchMode('long')"
              >
                长休 (15m)
              </button>
            </div>

            <div class="timer-display mt-8">
              <span class="time">{{ formatTime(timeLeft) }}</span>
              <div class="status-badge" :class="currentState">
                {{ getStatusText() }}
              </div>
            </div>

            <div class="controls mt-8">
              <button
                class="brutal-action-btn primary large-btn play-pause"
                :class="{ paused: !isRunning }"
                @click="toggleTimer"
              >
                {{ isRunning ? '⏸ 暂停' : '▶ 开始' }}
              </button>
              <button class="brutal-action-btn skip-btn" @click="skipStep">⏭ 跳过</button>
            </div>
          </div>

          <!-- Side panels -->
          <div class="side-panels">
            <!-- Stats -->
            <div class="brutal-pane bg-yellow">
              <div class="pane-header bg-black">
                <span class="text-white">📊 今日专注统计</span>
              </div>
              <div class="pane-body stats-grid">
                <div class="stat-item bg-white">
                  <div class="s-val">{{ stats.completed }}</div>
                  <div class="s-label">完成番茄</div>
                </div>
                <div class="stat-item bg-white">
                  <div class="s-val">{{ (stats.workMinutes / 60).toFixed(1) }}</div>
                  <div class="s-label">专注小时</div>
                </div>
              </div>
            </div>

            <!-- Settings -->
            <div class="brutal-pane mt-8">
              <div class="pane-header"><span class="text-black">⚙️ 自动设置</span></div>
              <div class="pane-body settings-list">
                <label class="brutal-checkbox-label">
                  <input v-model="settings.autoBreak" type="checkbox" class="brutal-checkbox" />
                  <span class="cb-text">自动开始休息</span>
                </label>
                <label class="brutal-checkbox-label">
                  <input v-model="settings.autoWork" type="checkbox" class="brutal-checkbox" />
                  <span class="cb-text">自动开始专注</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer class="footer mt-8">© 2026 LRM工具箱 - 番茄钟</footer>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onUnmounted } from 'vue';
  import { ElNotification } from 'element-plus';

  const mode = ref('work');
  const timeLeft = ref(25 * 60);
  const isRunning = ref(false);
  const currentState = computed(() => (isRunning.value ? 'running' : 'paused'));
  const modeClass = computed(() => {
    if (mode.value === 'work') return 'theme-work';
    if (mode.value === 'short') return 'theme-short';
    return 'theme-long';
  });

  let timerId = null;

  const settings = reactive({
    workTime: 25,
    shortBreak: 5,
    longBreak: 15,
    autoBreak: false,
    autoWork: false
  });

  const stats = reactive({
    completed: 0,
    workMinutes: 0
  });

  const formatTime = seconds => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getStatusText = () => {
    if (mode.value === 'work') return isRunning.value ? '🔥 专注中...' : '🎯 准备专注';
    return isRunning.value ? '☕ 休息中...' : '💤 准备休息';
  };

  const switchMode = newMode => {
    mode.value = newMode;
    isRunning.value = false;
    clearInterval(timerId);
    if (newMode === 'work') timeLeft.value = settings.workTime * 60;
    else if (newMode === 'short') timeLeft.value = settings.shortBreak * 60;
    else timeLeft.value = settings.longBreak * 60;
  };

  const toggleTimer = () => {
    if (isRunning.value) {
      clearInterval(timerId);
      isRunning.value = false;
    } else {
      isRunning.value = true;
      timerId = setInterval(() => {
        if (timeLeft.value > 0) {
          timeLeft.value--;
          document.title = `${formatTime(timeLeft.value)} - 番茄钟`;
        } else {
          completeTimer();
        }
      }, 1000);
    }
  };

  const resetTimer = () => {
    switchMode(mode.value);
    document.title = '番茄钟';
  };

  const skipStep = () => {
    clearInterval(timerId);
    isRunning.value = false;
    completeTimer(true);
  };

  const completeTimer = (skipped = false) => {
    clearInterval(timerId);
    isRunning.value = false;
    document.title = '番茄钟';

    const audio = new Audio('/notification.mp3');
    audio.play().catch(() => {});

    if (mode.value === 'work') {
      if (!skipped) {
        stats.completed++;
        stats.workMinutes += settings.workTime;
        ElNotification({ title: '专注完成', message: '休息一下吧！', type: 'success' });
      }
      if (settings.autoBreak && !skipped) {
        switchMode('short');
        toggleTimer();
      } else {
        switchMode('short');
      }
    } else {
      if (!skipped) {
        ElNotification({ title: '休息结束', message: '准备开始新的专注！', type: 'info' });
      }
      if (settings.autoWork && !skipped) {
        switchMode('work');
        toggleTimer();
      } else {
        switchMode('work');
      }
    }
  };

  onUnmounted(() => {
    clearInterval(timerId);
    document.title = 'LRM 工具箱';
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
    transition: background-color 0.5s;
  }

  /* Dynamic Backgrounds based on mode */
  .theme-work {
    background-color: #ffe4e6;
  }
  .theme-short {
    background-color: #d1fae5;
  }
  .theme-long {
    background-color: #e0e7ff;
  }

  .brutal-container {
    max-width: 1000px;
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
    color: #ff4b4b;
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

  .brutal-grid-layout {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 3rem;
    align-items: start;
  }

  .brutal-pane {
    display: flex;
    flex-direction: column;
    border: 4px solid #111;
    box-shadow: 12px 12px 0 #111;
    min-width: 0;
  }
  .bg-white {
    background: #fff;
  }
  .bg-yellow {
    background: #ffd900;
  }
  .pane-header {
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    font-size: 1.25rem;
  }
  .bg-black {
    background: #111;
    color: white;
  }
  .pane-body {
    padding: 1.5rem;
  }

  .timer-pane {
    padding: 3rem;
    text-align: center;
  }

  .mode-tabs {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .tab-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.5rem 1.25rem;
    font-family: 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1.1rem;
    cursor: pointer;
    box-shadow: 4px 4px 0 #111;
    transition: all 0.1s;
  }
  .tab-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #111;
  }

  .active-work {
    background: #ff4b4b;
    color: white;
    transform: translate(4px, 4px);
    box-shadow: 0 0 0 #111;
  }
  .active-short {
    background: #10b981;
    color: white;
    transform: translate(4px, 4px);
    box-shadow: 0 0 0 #111;
  }
  .active-long {
    background: #3b82f6;
    color: white;
    transform: translate(4px, 4px);
    box-shadow: 0 0 0 #111;
  }

  .timer-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .time {
    font-size: 7rem;
    font-weight: 900;
    line-height: 1;
    font-family: 'Syne', 'IBM Plex Mono', sans-serif;
    color: #111;
    text-shadow:
      4px 4px 0 #fff,
      8px 8px 0 #bbb;
  }

  .status-badge {
    font-size: 1.1rem;
    font-weight: 900;
    padding: 0.5rem 1.5rem;
    border: 3px solid #111;
    background: #fff;
    box-shadow: 4px 4px 0 #111;
    margin-top: 2rem;
    font-family: 'Noto Sans SC', sans-serif;
  }
  .status-badge.running {
    background: #111;
    color: #fff;
    box-shadow: 4px 4px 0 #bbb;
  }

  .controls {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
  }

  .brutal-action-btn {
    background: #fff;
    border: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    cursor: pointer;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
    box-shadow: 6px 6px 0 #111;
  }
  .brutal-action-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0 #111;
  }
  .brutal-action-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0 0 0 #111;
  }

  .play-pause {
    padding: 1rem 3rem;
    font-size: 1.5rem;
    background: #111;
    color: #fff;
  }
  .play-pause.paused {
    background: #ff4b4b;
    color: #fff;
  }
  .skip-btn {
    padding: 1rem 1.5rem;
    font-size: 1.25rem;
    background: #fff;
    color: #111;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  .stat-item {
    border: 3px solid #111;
    padding: 1rem;
    text-align: center;
    box-shadow: 4px 4px 0 #111;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .s-val {
    font-size: 2rem;
    font-weight: 900;
    line-height: 1;
    font-family: 'Syne', sans-serif;
    color: #ff4b4b;
    text-shadow: 2px 2px 0 #111;
  }
  .s-label {
    font-size: 0.9rem;
    font-weight: 900;
    font-family: 'Noto Sans SC', sans-serif;
  }

  .settings-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .brutal-checkbox-label {
    display: flex;
    align-items: center;
    gap: 1rem;
    cursor: pointer;
    font-size: 1.1rem;
    font-weight: 900;
    font-family: 'Noto Sans SC', sans-serif;
  }

  .brutal-checkbox {
    appearance: none;
    -webkit-appearance: none;
    width: 30px;
    height: 30px;
    border: 3px solid #111;
    background: #fff;
    cursor: pointer;
    position: relative;
    box-shadow: 2px 2px 0 #111;
    transition: background 0.1s;
  }
  .brutal-checkbox:checked {
    background: #4b7bff;
  }
  .brutal-checkbox:checked::after {
    content: '✔';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    color: #fff;
    font-size: 1.2rem;
    font-weight: 900;
    line-height: 1;
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
  }

  @media (max-width: 900px) {
    .brutal-grid-layout {
      grid-template-columns: 1fr;
    }
    .brutal-title {
      font-size: 1.5rem;
    }
    .time {
      font-size: 4rem;
    }
    .timer-pane {
      padding: 1.5rem;
    }
    .controls {
      flex-direction: column;
    }
    .controls .brutal-action-btn {
      width: 100%;
    }
  }

  /* Dark Mode */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .theme-work {
    background-color: #331118;
  }
  [data-theme='dark'] .theme-short {
    background-color: #003322;
  }
  [data-theme='dark'] .theme-long {
    background-color: #002266;
  }

  [data-theme='dark'] .brutal-header {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 8px 8px 0 #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .tab-btn,
  [data-theme='dark'] .stat-item,
  [data-theme='dark'] .status-badge {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-checkbox {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 2px 2px 0 #eee;
  }
  [data-theme='dark'] .bg-white {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .bg-yellow {
    background: #332700;
    border-color: #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .bg-black {
    background: #222;
  }
  [data-theme='dark'] .text-black,
  [data-theme='dark'] .cb-text {
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .tab-btn,
  [data-theme='dark'] .status-badge,
  [data-theme='dark'] .stat-item {
    box-shadow: 6px 6px 0 #eee;
  }
  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0 #eee;
  }
  [data-theme='dark'] .brutal-btn:hover,
  [data-theme='dark'] .tab-btn:hover {
    box-shadow: 9px 9px 0 #eee;
  }

  [data-theme='dark'] .active-work {
    background: #ff4b4b;
    color: white;
    border-color: #eee;
  }
  [data-theme='dark'] .active-short {
    background: #10b981;
    color: white;
    border-color: #eee;
  }
  [data-theme='dark'] .active-long {
    background: #2a4eb2;
    color: white;
    border-color: #eee;
  }

  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0 #eee;
  }

  [data-theme='dark'] .time {
    color: #eee;
    text-shadow:
      4px 4px 0 #111,
      8px 8px 0 #444;
  }
  [data-theme='dark'] .s-val {
    color: #ff8b8b;
    text-shadow: 2px 2px 0 #eee;
  }
  [data-theme='dark'] .brutal-checkbox:checked {
    background: #2a4eb2;
  }

  [data-theme='dark'] .brutal-action-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 6px 6px 0 #eee;
  }
  [data-theme='dark'] .brutal-action-btn:hover {
    box-shadow: 9px 9px 0 #eee;
  }
  [data-theme='dark'] .play-pause.paused {
    background: #ff8b8b;
    color: #111;
  }
  [data-theme='dark'] .play-pause:not(.paused) {
    background: #eee;
    color: #111;
  }
</style>
