<template>
  <div class="stopwatch-container brutal-pane">
    <div class="pane-header bg-blue text-white">
      <span>⏱️ 跑表正计时</span>
    </div>
    <div class="pane-body flex-col-center">
      <div class="display-area">
        <div class="time-display stopwatch-display">
          {{ formatStopwatch(stopwatchElapsed) }}
        </div>
        <div class="stopwatch-ms">.{{ formatMs(stopwatchElapsed) }}</div>
        <div class="time-status" :class="{ 'status-active': isStopwatchRunning }">
          {{ isStopwatchRunning ? '运行中...' : '已停止' }}
        </div>
      </div>

      <div class="controls-area">
        <button
          v-if="!isStopwatchRunning"
          class="brutal-action-btn play-btn bg-green"
          @click="startStopwatch"
        >
          ▶ 开始
        </button>
        <button v-else class="brutal-action-btn play-btn bg-yellow" @click="pauseStopwatch">
          ⏸ 暂停
        </button>

        <button
          class="brutal-action-btn flag-btn bg-blue text-white"
          :disabled="!isStopwatchRunning && stopwatchElapsed === 0"
          @click="lapStopwatch"
        >
          🚩 计次
        </button>

        <button
          class="brutal-action-btn reset-btn bg-pink text-white"
          :disabled="stopwatchElapsed === 0"
          @click="resetStopwatch"
        >
          🔄 重置
        </button>
      </div>

      <div v-if="laps.length > 0" class="laps-container">
        <div class="section-title">📊 计次记录</div>
        <div class="laps-list-wrapper">
          <div class="laps-list">
            <div v-for="lap in reversedLaps" :key="lap.index" class="lap-item">
              <div class="lap-index">#{{ lap.index }}</div>
              <div class="lap-time">
                {{ formatStopwatch(lap.time)
                }}<small>.{{ String(lap.time % 1000).padStart(3, '0') }}</small>
              </div>
              <div class="lap-split">+{{ formatStopwatch(lap.split) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { useStopwatch } from './useStopwatch';
  import { onUnmounted } from 'vue';

  const {
    stopwatchElapsed,
    isStopwatchRunning,
    laps,
    reversedLaps,
    startStopwatch,
    pauseStopwatch,
    resetStopwatch,
    lapStopwatch,
    cleanup
  } = useStopwatch();

  const formatTime = seconds => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatStopwatch = ms => {
    const seconds = Math.floor(ms / 1000);
    return formatTime(seconds);
  };

  const formatMs = ms => {
    return String(ms % 1000).padStart(3, '0');
  };

  onUnmounted(cleanup);

  defineExpose({
    pause: pauseStopwatch
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

  .stopwatch-display {
    display: inline-block;
  }

  .stopwatch-ms {
    display: inline-block;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 2.5rem;
    color: #555;
    font-weight: 700;
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

  .laps-container {
    width: 100%;
    border-top: 3px solid #111;
    padding-top: 2rem;
  }

  .section-title {
    font-weight: 800;
    margin-bottom: 1.5rem;
    font-size: 1.25rem;
    border: 3px solid #111;
    display: inline-block;
    padding: 0.4rem 1rem;
    background: #ffd900;
    box-shadow: 3px 3px 0px #111;
  }

  .laps-list-wrapper {
    max-height: 280px;
    overflow-y: auto;
    border: 3px solid #111;
    background: #fdfae5;
  }

  .lap-item {
    display: grid;
    grid-template-columns: 80px 1fr 120px;
    padding: 1rem 1.5rem;
    border-bottom: 3px solid #111;
    font-size: 1.1rem;
    font-weight: 700;
    align-items: center;
  }

  .lap-item:last-child {
    border-bottom: none;
  }

  .lap-index {
    color: #888;
  }

  .lap-time {
    font-family: 'IBM Plex Mono', monospace;
  }

  .lap-split {
    text-align: right;
    color: #4b7bff;
    font-family: 'IBM Plex Mono', monospace;
  }

  .bg-blue {
    background: #4b7bff;
    color: #fff;
  }
  .bg-green {
    background: #00e572;
  }
  .bg-yellow {
    background: #ffd900;
  }
  .bg-pink {
    background: #ff4b4b;
    color: #fff;
  }
  .text-white {
    color: #fff;
  }
</style>
