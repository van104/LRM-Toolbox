<template>
  <div class="timer-container brutal-pane">
    <div class="pane-header bg-yellow">
      <span>⏳ {{ currentLabel || '倒计时' }}</span>
    </div>
    <div class="pane-body flex-col-center">
      <div class="display-area">
        <div
          class="time-display"
          :class="{
            'time-end': isTimeEnd,
            running: isCountdownRunning,
            'near-end': countdownRemaining <= 10 && countdownRemaining > 0
          }"
        >
          {{ formatTime(countdownRemaining) }}
        </div>
        <div class="time-status" :class="{ 'status-active': isCountdownRunning }">
          {{ isTimeEnd ? '计时结束' : isCountdownRunning ? '计时中...' : '准备就绪' }}
        </div>
      </div>

      <div class="controls-area">
        <button
          class="brutal-action-btn play-btn"
          :class="{
            'bg-pink text-white': isCountdownRunning,
            'bg-green text-black': !isCountdownRunning
          }"
          @click="toggleCountdown"
        >
          {{ isCountdownRunning ? '⏸ 暂停' : '▶ 开始' }}
        </button>
        <button
          class="brutal-action-btn reset-btn"
          :disabled="!canResetCountdown"
          @click="resetCountdown"
        >
          🔄 重置
        </button>
      </div>

      <div class="quick-presets">
        <span class="section-title">⚡ 快速开始</span>
        <div class="preset-grid">
          <button
            v-for="preset in quickPresets"
            :key="preset.label"
            class="preset-btn"
            @click="$emit('start-preset', preset)"
          >
            <span class="preset-time">{{ formatDuration(preset.time) }}</span>
            <span class="preset-label">{{ preset.label }}</span>
          </button>
          <button class="preset-btn add-btn" @click="$emit('open-add-preset')">+ 添加预设</button>
        </div>
      </div>

      <div class="custom-timer-boxes">
        <div class="custom-box">
          <div class="box-title">✍️ 自定义时间</div>
          <div class="custom-input-group">
            <div class="input-item">
              <input
                v-model.number="customHours"
                type="number"
                min="0"
                max="99"
                class="num-input"
              />
              <span class="unit">时</span>
            </div>
            <div class="input-item">
              <input
                v-model.number="customMinutes"
                type="number"
                min="0"
                max="59"
                class="num-input"
              />
              <span class="unit">分</span>
            </div>
            <div class="input-item">
              <input
                v-model.number="customSeconds"
                type="number"
                min="0"
                max="59"
                class="num-input"
              />
              <span class="unit">秒</span>
            </div>
          </div>
          <input
            v-model="customLabelInput"
            class="brutal-input full mt-2"
            placeholder="标签（如：午休）"
          />
          <button class="brutal-action-btn bg-blue text-white full mt-3" @click="handleStartCustom">
            ▶ 开始自定义计时
          </button>
        </div>

        <div class="custom-box">
          <div class="box-title">📅 目标时间倒计时</div>
          <input v-model="targetDateTime" type="datetime-local" class="brutal-input full" />
          <button class="brutal-action-btn bg-dark text-white full mt-3" @click="handleStartTarget">
            ▶ 开始目标倒计时
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onUnmounted } from 'vue';
  import { useTimer } from './useTimer';

  defineProps({
    quickPresets: {
      type: Array,
      required: true
    }
  });

  const emit = defineEmits(['complete', 'open-add-preset', 'start-preset']);

  const {
    countdownRemaining,
    isCountdownRunning,
    currentLabel,
    isTimeEnd,
    canResetCountdown,
    startTimer,
    resumeCountdown,
    pauseCountdown,
    resetCountdown,
    cleanup
  } = useTimer();

  const customHours = ref(0);
  const customMinutes = ref(0);
  const customSeconds = ref(0);
  const customLabelInput = ref('');
  const targetDateTime = ref(null);

  const formatTime = seconds => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatDuration = seconds => {
    if (seconds >= 3600) return (seconds / 3600).toFixed(1).replace('.0', '') + '小时';
    if (seconds >= 60) return (seconds / 60).toFixed(0) + '分钟';
    return seconds + '秒';
  };

  function toggleCountdown() {
    if (isCountdownRunning.value) {
      pauseCountdown();
    } else {
      resumeCountdown(() => emit('complete', currentLabel.value));
    }
  }

  function handleStartCustom() {
    const total = customHours.value * 3600 + customMinutes.value * 60 + customSeconds.value;
    if (total > 0) {
      startTimer(total, customLabelInput.value, () => emit('complete', customLabelInput.value));
      window.scrollTo(0, 0);
    }
  }

  function handleStartTarget() {
    if (!targetDateTime.value) return;
    const now = Date.now();
    const target = new Date(targetDateTime.value).getTime();
    const diff = Math.ceil((target - now) / 1000);

    if (diff <= 0) {
      alert('目标时间必须在未来');
      return;
    }
    startTimer(diff, '目标时间倒计时', () => emit('complete', '目标倒计时'));
    window.scrollTo(0, 0);
  }

  onUnmounted(cleanup);

  defineExpose({
    start: (seconds, label) => startTimer(seconds, label, () => emit('complete', label)),
    pause: pauseCountdown
  });
</script>

<style scoped>
  .brutal-pane {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    transition: transform 0.2s;
    display: flex;
    flex-direction: column;
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
  .pane-body {
    padding: 1.5rem;
  }
  .flex-col-center {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .display-area {
    position: relative;
    padding: 1.5rem 0;
    margin-bottom: 2rem;
    text-align: center;
  }

  .time-display {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 5rem;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 1rem;
  }

  .time-end {
    color: #ff4b4b;
    animation: shake 0.4s infinite;
  }

  @keyframes shake {
    0%,
    100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-5px) rotate(-1deg);
    }
    75% {
      transform: translateX(5px) rotate(1deg);
    }
  }

  .near-end {
    color: #ff4b4b;
  }

  .time-status {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    color: #888;
    text-transform: uppercase;
  }

  .status-active {
    color: #ff4b4b;
    animation: blink 1.5s infinite;
  }

  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
  }

  .controls-area {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 2.5rem;
    width: 100%;
    justify-content: center;
  }

  .brutal-action-btn {
    border: 3px solid #111;
    padding: 1.25rem;
    min-width: 140px;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
    background: #fff;
    color: #111;
  }

  .brutal-action-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 7px 7px 0px #111;
  }

  .brutal-action-btn:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-action-btn:disabled {
    background: #eee !important;
    color: #999;
    cursor: not-allowed;
    box-shadow: 2px 2px 0px #111;
    transform: none;
  }

  .quick-presets {
    width: 100%;
    border-top: 3px solid #111;
    padding-top: 2rem;
    margin-bottom: 2rem;
  }

  .section-title {
    font-weight: 800;
    margin-bottom: 1.5rem;
    font-size: 1.25rem;
    border: 3px solid #111;
    display: inline-block;
    padding: 0.4rem 1rem;
    background: #4b7bff;
    color: #fff;
    box-shadow: 3px 3px 0px #111;
  }

  .preset-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 1rem;
  }

  .preset-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    border: 3px solid #111;
    background: #fff;
    cursor: pointer;
    transition: all 0.1s;
  }

  .preset-btn:hover {
    background: #ffd900;
    transform: scale(1.05);
    box-shadow: 4px 4px 0px #111;
  }

  .preset-time {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 1.2rem;
  }

  .preset-label {
    font-size: 0.85rem;
    font-weight: 700;
    margin-top: 4px;
    color: #666;
  }

  .add-btn {
    justify-content: center;
    font-weight: 800;
    background: #fdfae5;
  }

  .custom-timer-boxes {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .custom-box {
    border: 3px solid #111;
    padding: 1.5rem;
    background: #fff;
  }

  .box-title {
    font-weight: 800;
    margin-bottom: 1rem;
    border-bottom: 3px solid #111;
    padding-bottom: 0.5rem;
  }

  .custom-input-group {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .input-item {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .num-input {
    width: 50px;
    height: 40px;
    border: 3px solid #111;
    text-align: center;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 1.2rem;
  }

  .unit {
    font-weight: 800;
  }

  .brutal-input {
    border: 3px solid #111;
    padding: 0.75rem;
    font-weight: 700;
  }

  .full {
    width: 100%;
    box-sizing: border-box;
  }

  .bg-yellow {
    background: #ffd900;
  }
  .bg-pink {
    background: #ff4b4b;
    color: #fff;
  }
  .bg-green {
    background: #00e572;
  }
  .bg-blue {
    background: #4b7bff;
    color: #fff;
  }
  .bg-dark {
    background: #111;
    color: #fff;
  }

  @media (max-width: 600px) {
    .custom-timer-boxes {
      grid-template-columns: 1fr;
    }
  }
</style>
