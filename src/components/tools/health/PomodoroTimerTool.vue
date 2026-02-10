<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="goBack"
          ><el-icon>
            <ArrowLeft /> </el-icon
          ><span>返回</span></el-button
        >
      </div>
      <div class="header-center">
        <h1 class="tool-title">番茄钟</h1>
        <span class="tool-subtitle">Pomodoro Timer</span>
      </div>
      <div class="header-right">
        <el-button @click="resetTimer"
          ><el-icon>
            <Refresh />
          </el-icon>
          重置</el-button
        >
      </div>
    </header>

    <main class="tool-content">
      <div class="timer-card glass-card" :class="currentState">
        <div class="mode-tabs">
          <div class="tab" :class="{ active: mode === 'work' }" @click="switchMode('work')">
            专注 (25m)
          </div>
          <div class="tab" :class="{ active: mode === 'short' }" @click="switchMode('short')">
            短休息 (5m)
          </div>
          <div class="tab" :class="{ active: mode === 'long' }" @click="switchMode('long')">
            长休息 (15m)
          </div>
        </div>

        <div class="timer-display">
          <span class="time">{{ formatTime(timeLeft) }}</span>
          <span class="status">{{ getStatusText() }}</span>
        </div>

        <div class="controls">
          <button class="main-btn" @click="toggleTimer">
            {{ isRunning ? '暂停' : '开始' }}
          </button>
          <button class="skip-btn" @click="skipStep">
            <el-icon>
              <Right />
            </el-icon>
          </button>
        </div>
      </div>

      <div class="stats-card glass-card">
        <h3>今日专注统计</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="value">{{ stats.completed }}</div>
            <div class="label">完成番茄</div>
          </div>
          <div class="stat-item">
            <div class="value">{{ (stats.workMinutes / 60).toFixed(1) }}</div>
            <div class="label">专注小时</div>
          </div>
        </div>
      </div>

      <div class="settings-panel glass-card">
        <h3>设置</h3>
        <div class="form-item">
          <span class="label">自动开始休息</span>
          <el-switch v-model="settings.autoBreak" />
        </div>
        <div class="form-item">
          <span class="label">自动开始专注</span>
          <el-switch v-model="settings.autoWork" />
        </div>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - 番茄钟</footer>
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElNotification } from 'element-plus';
  import { ArrowLeft, Refresh, Right } from '@element-plus/icons-vue';

  const router = useRouter();
  const goBack = () => router.back();

  const mode = ref('work');
  const timeLeft = ref(25 * 60);
  const isRunning = ref(false);
  const currentState = computed(() => (isRunning.value ? 'running' : 'paused'));
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
    if (mode.value === 'work') return isRunning.value ? '专注中...' : '准备专注';
    return isRunning.value ? '休息中...' : '准备休息';
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
  .tool-page {
    min-height: 100vh;
    background: #fff1f2;
    display: flex;
    flex-direction: column;
    transition: background 0.5s;
  }

  .tool-page:has(.tab.active:not(:first-child)) {
    background: #f0fdf4;
  }

  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: rgba(255, 255, 255, 0.8);
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(10px);
  }

  .header-center {
    text-align: center;
    flex: 1;
  }

  .tool-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }

  .tool-subtitle {
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
  }

  .tool-content {
    flex: 1;
    padding: 1.5rem;
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .timer-card {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    background: rgba(255, 255, 255, 0.6);
    transition: all 0.3s;
  }

  .mode-tabs {
    display: flex;
    background: rgba(0, 0, 0, 0.05);
    padding: 4px;
    border-radius: 99px;
  }

  .tab {
    padding: 8px 16px;
    border-radius: 99px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    color: #64748b;
    transition: all 0.3s;
  }

  .tab.active {
    background: #fff;
    color: #fda4af;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .tool-page:has(.tab.active:nth-child(2)) .tab.active {
    color: #86efac;
  }

  .timer-display {
    text-align: center;
  }

  .time {
    font-size: 6rem;
    font-weight: 700;
    color: #1e293b;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    display: block;
  }

  .status {
    font-size: 1rem;
    color: #64748b;
    letter-spacing: 2px;
    margin-top: 0.5rem;
    display: block;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .main-btn {
    width: 140px;
    height: 56px;
    border-radius: 28px;
    border: none;
    background: #e11d48;
    color: white;
    font-size: 1.25rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 0 #9f1239;
    position: relative;
    top: 0;
  }

  .main-btn:active {
    top: 4px;
    box-shadow: none;
  }

  .skip-btn {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: none;
    background: #fff;
    color: #1e293b;
    font-size: 1.25rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .skip-btn:hover {
    background: #f1f5f9;
  }

  .stats-card {
    padding: 1.5rem;
  }

  .stats-card h3 {
    margin: 0 0 1rem;
    font-size: 1rem;
    opacity: 0.8;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .stat-item {
    background: rgba(255, 255, 255, 0.5);
    padding: 1rem;
    border-radius: 12px;
    text-align: center;
  }

  .stat-item .value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #e11d48;
  }

  .stat-item .label {
    font-size: 0.8rem;
    color: #64748b;
  }

  .settings-panel {
    padding: 1.5rem;
  }

  .settings-panel h3 {
    margin: 0 0 1rem;
    font-size: 1rem;
    opacity: 0.8;
  }

  .form-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .form-item:last-child {
    border-bottom: none;
  }

  .form-item .label {
    font-size: 0.9rem;
    color: #334155;
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 24px;
    box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.05);
    backdrop-filter: blur(10px);
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }
</style>
