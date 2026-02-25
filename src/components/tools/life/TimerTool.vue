<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">高级<span>.计时器()</span></h1>
        <button class="brutal-btn settings-btn" @click="settingsVisible = true">⚙️ 设置</button>
      </header>

      <main class="main-content">
        <div class="mode-switcher brutal-pane">
          <button
            class="switch-btn"
            :class="{ active: currentMode === 'countdown' }"
            @click="switchMode('countdown')"
          >
            倒计时
          </button>
          <button
            class="switch-btn"
            :class="{ active: currentMode === 'stopwatch' }"
            @click="switchMode('stopwatch')"
          >
            正计时
          </button>
        </div>

        <div v-show="currentMode === 'countdown'" class="timer-container brutal-pane">
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
                  'near-end': countdownRemaining <= 10000 && countdownRemaining > 0
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
                  @click="startPreset(preset)"
                >
                  <span class="preset-time">{{ formatDuration(preset.time) }}</span>
                  <span class="preset-label">{{ preset.label }}</span>
                </button>
                <button class="preset-btn add-btn" @click="addPresetVisible = true">
                  + 添加预设
                </button>
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
                <button
                  class="brutal-action-btn bg-blue text-white full mt-3"
                  @click="startCustomTimer"
                >
                  ▶ 开始自定义计时
                </button>
              </div>

              <div class="custom-box">
                <div class="box-title">📅 目标时间倒计时</div>
                <input v-model="targetDateTime" type="datetime-local" class="brutal-input full" />
                <button
                  class="brutal-action-btn bg-dark text-white full mt-3"
                  @click="startTargetTimer"
                >
                  ▶ 开始目标倒计时
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-show="currentMode === 'stopwatch'" class="stopwatch-container brutal-pane">
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
      </main>

      <!-- Settings Modal -->
      <div
        v-if="settingsVisible"
        class="brutal-modal-overlay"
        @click.self="settingsVisible = false"
      >
        <div class="brutal-modal-content brutal-pane">
          <div class="pane-header bg-dark text-white">
            <span>⚙️ 高级配置</span>
            <button class="close-btn" @click="settingsVisible = false">✖</button>
          </div>
          <div class="pane-body settings-body">
            <div class="settings-section">
              <h3 class="settings-title">提示音</h3>
              <div class="sound-grid">
                <button
                  v-for="sound in soundOptions"
                  :key="sound.key"
                  class="sound-btn"
                  :class="{ active: currentSound === sound.key }"
                  @click="setSound(sound.key)"
                >
                  {{ sound.name }}
                </button>
              </div>
              <label class="brutal-checkbox mt-3">
                <input v-model="loopSound" type="checkbox" />
                <span>循环播放提示音</span>
              </label>
            </div>

            <div class="settings-section">
              <h3 class="settings-title">通知提示</h3>
              <label class="brutal-checkbox">
                <input
                  v-model="enableNotification"
                  type="checkbox"
                  @change="requestNotificationPermission"
                />
                <span>浏览器系统通知</span>
              </label>
              <label class="brutal-checkbox mt-2">
                <input v-model="enableVibration" type="checkbox" />
                <span>震动反馈 (支持的设备)</span>
              </label>
            </div>

            <div class="settings-section">
              <h3 class="settings-title">预设管理</h3>
              <div class="preset-edit-list">
                <div
                  v-for="(preset, index) in quickPresets"
                  :key="preset.label"
                  class="preset-edit-item"
                >
                  <span class="time">{{ formatDuration(preset.time) }}</span>
                  <span class="label">{{ preset.label }}</span>
                  <button class="del-btn" @click="removePreset(index)">✖</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Preset Modal -->
      <div
        v-if="addPresetVisible"
        class="brutal-modal-overlay"
        @click.self="addPresetVisible = false"
      >
        <div class="brutal-modal-content brutal-pane" style="max-width: 400px">
          <div class="pane-header bg-yellow text-black">
            <span>+ 新增预设</span>
            <button class="close-btn" style="color: black" @click="addPresetVisible = false">
              ✖
            </button>
          </div>
          <div class="pane-body">
            <div class="custom-input-group mt-2">
              <div class="input-item">
                <input
                  v-model.number="newPresetHours"
                  type="number"
                  min="0"
                  max="99"
                  class="num-input"
                />
                <span class="unit">时</span>
              </div>
              <div class="input-item">
                <input
                  v-model.number="newPresetMinutes"
                  type="number"
                  min="0"
                  max="59"
                  class="num-input"
                />
                <span class="unit">分</span>
              </div>
              <div class="input-item">
                <input
                  v-model.number="newPresetSeconds"
                  type="number"
                  min="0"
                  max="59"
                  class="num-input"
                />
                <span class="unit">秒</span>
              </div>
            </div>
            <input
              v-model="newPresetLabel"
              class="brutal-input full mt-3"
              placeholder="预设名称（留空推断时长）"
            />
            <div class="flex-row mt-4" style="gap: 1rem">
              <button class="brutal-action-btn full" @click="addPresetVisible = false">取消</button>
              <button class="brutal-action-btn bg-dark text-white full" @click="confirmAddPreset">
                确认新增
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="brutal-status">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i">© 2026 LRM工具箱 - 高级计时系统 // &nbsp;</span>
          </div>
        </div>
      </div>

      <audio ref="audioPlayer" loop></audio>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const goBack = () => router.back();

  const currentMode = ref('countdown');
  const settingsVisible = ref(false);

  const countdownTotal = ref(0);
  const countdownRemaining = ref(0);
  const isCountdownRunning = ref(false);
  const currentLabel = ref('');
  const countdownEndTime = ref(0);

  const customHours = ref(0);
  const customMinutes = ref(0);
  const customSeconds = ref(0);
  const customLabelInput = ref('');
  const targetDateTime = ref(null);

  const stopwatchStartTime = ref(0);
  const stopwatchElapsed = ref(0);
  const isStopwatchRunning = ref(false);
  const laps = ref([]);

  const quickPresets = ref([
    { time: 60, label: '1分钟' },
    { time: 300, label: '5分钟' },
    { time: 600, label: '10分钟' },
    { time: 1800, label: '30分钟' },
    { time: 3600, label: '1小时' }
  ]);
  const currentSound = ref('default');
  const loopSound = ref(false);
  const enableNotification = ref(false);
  const enableVibration = ref(true);

  const addPresetVisible = ref(false);
  const newPresetHours = ref(0);
  const newPresetMinutes = ref(0);
  const newPresetSeconds = ref(0);
  const newPresetLabel = ref('');

  const audioPlayer = ref(null);

  const sounds = {
    default: { name: '默认木琴', src: 'https://clockcn.com/sound/xylophone.mp3' },
    digital: { name: '电子蜂鸣', src: 'https://clockcn.com/sound/xylophone.mp3' },
    soft: {
      name: '按键铃',
      src: 'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3'
    },
    alarm: {
      name: '警报器',
      src: 'https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3'
    }
  };
  const soundOptions = Object.keys(sounds).map(k => ({ key: k, ...sounds[k] }));

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

  const formatDuration = seconds => {
    if (seconds >= 3600) return (seconds / 3600).toFixed(1).replace('.0', '') + '小时';
    if (seconds >= 60) return (seconds / 60).toFixed(0) + '分钟';
    return seconds + '秒';
  };

  let timerInterval = null;

  const isTimeEnd = computed(() => countdownTotal.value > 0 && countdownRemaining.value === 0);
  const canResetCountdown = computed(
    () =>
      countdownTotal.value > 0 &&
      (countdownRemaining.value < countdownTotal.value || !isCountdownRunning.value)
  );

  const startTimer = (seconds, label) => {
    if (seconds <= 0) return;
    countdownTotal.value = seconds;
    countdownRemaining.value = seconds;
    currentLabel.value = label;
    countdownEndTime.value = Date.now() + seconds * 1000;
    resumeCountdown();
  };

  const resumeCountdown = () => {
    if (timerInterval) clearInterval(timerInterval);
    countdownEndTime.value = Date.now() + countdownRemaining.value * 1000;
    isCountdownRunning.value = true;

    if (audioPlayer.value) {
      audioPlayer.value.pause();
      audioPlayer.value.currentTime = 0;
    }

    timerInterval = setInterval(() => {
      const now = Date.now();
      const diff = Math.ceil((countdownEndTime.value - now) / 1000);

      if (diff <= 0) {
        countdownRemaining.value = 0;
        completeCountdown();
      } else {
        countdownRemaining.value = diff;
      }
    }, 200);
  };

  const pauseCountdown = () => {
    isCountdownRunning.value = false;
    if (timerInterval) clearInterval(timerInterval);
  };

  const toggleCountdown = () => {
    if (isCountdownRunning.value) {
      pauseCountdown();
    } else {
      if (countdownRemaining.value <= 0 && countdownTotal.value > 0) {
        startTimer(countdownTotal.value, currentLabel.value);
      } else if (countdownTotal.value > 0) {
        resumeCountdown();
      }
    }
  };

  const resetCountdown = () => {
    pauseCountdown();
    countdownRemaining.value = countdownTotal.value;
    if (audioPlayer.value) {
      audioPlayer.value.pause();
      audioPlayer.value.currentTime = 0;
    }
  };

  const completeCountdown = () => {
    pauseCountdown();
    playAlert();
    notify('计时结束', `${currentLabel.value || '倒计时'} 已完成`);
  };

  const startPreset = preset => {
    startTimer(preset.time, preset.label);
  };

  const startCustomTimer = () => {
    const total = customHours.value * 3600 + customMinutes.value * 60 + customSeconds.value;
    if (total > 0) {
      startTimer(total, customLabelInput.value);
      window.scrollTo(0, 0);
    }
  };

  const startTargetTimer = () => {
    if (!targetDateTime.value) return;
    const now = Date.now();
    const target = new Date(targetDateTime.value).getTime();
    const diff = Math.ceil((target - now) / 1000);

    if (diff <= 0) {
      alert('目标时间必须在未来');
      return;
    }
    startTimer(diff, '目标时间倒计时');
    window.scrollTo(0, 0);
  };

  let stopwatchIntervalId = null;

  const startStopwatch = () => {
    if (!isStopwatchRunning.value) {
      stopwatchStartTime.value = Date.now() - stopwatchElapsed.value;
      isStopwatchRunning.value = true;
      stopwatchIntervalId = setInterval(() => {
        stopwatchElapsed.value = Date.now() - stopwatchStartTime.value;
      }, 10);
    }
  };

  const pauseStopwatch = () => {
    isStopwatchRunning.value = false;
    if (stopwatchIntervalId) clearInterval(stopwatchIntervalId);
  };

  const resetStopwatch = () => {
    pauseStopwatch();
    stopwatchElapsed.value = 0;
    laps.value = [];
  };

  const lapStopwatch = () => {
    const current = stopwatchElapsed.value;
    const lastLapTime = laps.value.length > 0 ? laps.value[laps.value.length - 1].time : 0;
    laps.value.push({
      index: laps.value.length + 1,
      time: current,
      split: current - lastLapTime
    });
  };

  const reversedLaps = computed(() => [...laps.value].reverse());

  const switchMode = mode => {
    if (mode === 'countdown' && isStopwatchRunning.value) pauseStopwatch();
    if (mode === 'stopwatch' && isCountdownRunning.value) pauseCountdown();
    currentMode.value = mode;
  };

  const setSound = key => {
    currentSound.value = key;
    if (audioPlayer.value) {
      audioPlayer.value.src = sounds[key].src;
      audioPlayer.value.play().catch(() => {});
    }
  };

  const playAlert = () => {
    if (audioPlayer.value) {
      audioPlayer.value.src = sounds[currentSound.value].src;
      audioPlayer.value.loop = loopSound.value;
      audioPlayer.value.play().catch(_e => console.error(_e));
    }
    if (enableVibration.value && navigator.vibrate) {
      navigator.vibrate([500, 300, 500]);
    }
  };

  const notify = (title, body) => {
    if (enableNotification.value && Notification && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  };

  const requestNotificationPermission = val => {
    if (val && Notification && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  };

  const confirmAddPreset = () => {
    const total =
      newPresetHours.value * 3600 + newPresetMinutes.value * 60 + newPresetSeconds.value;
    if (total > 0) {
      quickPresets.value.push({
        time: total,
        label: newPresetLabel.value || formatDuration(total)
      });
      addPresetVisible.value = false;
      saveSettings();
    }
  };

  const removePreset = index => {
    quickPresets.value.splice(index, 1);
    saveSettings();
  };

  const loadSettings = () => {
    const s = localStorage.getItem('timer_tool_settings_brutal');
    if (s) {
      try {
        const data = JSON.parse(s);
        currentSound.value = data.currentSound || 'default';
        loopSound.value = data.loopSound || false;
        enableNotification.value = data.enableNotification || false;
        enableVibration.value = data.enableVibration ?? true;
        if (data.quickPresets) quickPresets.value = data.quickPresets;
      } catch (e) {
        console.warn('Failed to parse timer settings:', e);
      }
    }
  };

  const saveSettings = () => {
    localStorage.setItem(
      'timer_tool_settings_brutal',
      JSON.stringify({
        currentSound: currentSound.value,
        loopSound: loopSound.value,
        enableNotification: enableNotification.value,
        enableVibration: enableVibration.value,
        quickPresets: quickPresets.value
      })
    );
  };

  onMounted(() => {
    loadSettings();
  });

  watch(
    [currentSound, loopSound, enableNotification, enableVibration, quickPresets],
    saveSettings,
    { deep: true }
  );
  onUnmounted(() => {
    if (timerInterval) clearInterval(timerInterval);
    if (stopwatchIntervalId) clearInterval(stopwatchIntervalId);
  });
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

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
    flex-wrap: wrap;
    gap: 1rem;
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
    font-size: 1.1rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
    color: #111;
  }
  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }

  .bg-yellow {
    background: #ffd900;
    color: #111;
  }
  .bg-blue {
    background: #4b7bff;
    color: #fff;
  }
  .bg-dark {
    background: #111;
    color: #fff;
  }
  .bg-pink {
    background: #ff4b4b;
    color: #fff;
  }
  .bg-green {
    background: #00e572;
    color: #111;
  }
  .text-white {
    color: #fff;
  }
  .text-black {
    color: #111;
  }
  .flex-row {
    display: flex;
    align-items: center;
  }

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

  .main-content {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }

  /* Mode switcher */
  .mode-switcher {
    flex-direction: row;
    box-shadow: 6px 6px 0px #111;
    border-radius: 0;
    padding: 0;
  }
  .mode-switcher .switch-btn {
    flex: 1;
    padding: 1rem;
    font-size: 1.25rem;
    font-weight: 800;
    font-family: 'Syne', sans-serif;
    cursor: pointer;
    background: transparent;
    border: none;
    outline: none;
    transition: all 0.2s;
    color: #555;
    border-right: 4px solid #111;
  }
  .mode-switcher .switch-btn:last-child {
    border-right: none;
  }
  .mode-switcher .switch-btn.active {
    color: #111;
    background: #ffd900;
    box-shadow: inset 4px 4px 0px rgba(0, 0, 0, 0.1);
  }

  /* Display Area */
  .display-area {
    text-align: center;
    margin-bottom: 2rem;
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .time-display {
    font-size: 5rem;
    font-weight: 800;
    font-family: 'Syne', monospace;
    color: #111;
    line-height: 1;
    letter-spacing: -2px;
    padding: 1rem 0;
    text-shadow: 4px 4px 0px rgba(0, 0, 0, 0.1);
  }
  .time-display.near-end {
    color: #ff4b4b;
    animation: blink 1s infinite alternate;
  }
  @keyframes blink {
    from {
      opacity: 1;
    }
    to {
      opacity: 0.5;
    }
  }
  .stopwatch-display {
    display: inline-block;
    margin-right: 2px;
  }
  .stopwatch-ms {
    font-size: 2rem;
    font-weight: 800;
    color: #555;
    font-family: 'Syne', monospace;
  }

  .time-status {
    margin-top: 1rem;
    font-size: 1.1rem;
    font-weight: 800;
    color: #777;
    font-family: 'Syne', sans-serif;
    text-transform: uppercase;
    border: 3px solid #777;
    display: inline-block;
    padding: 5px 15px;
  }
  .time-status.status-active {
    color: #00e572;
    border-color: #00e572;
    box-shadow: 3px 3px 0px #00e572;
    background: #fff;
  }

  /* Controls */
  .controls-area {
    display: flex;
    gap: 1.5rem;
    justify-content: center;
    margin-bottom: 2rem;
  }
  .brutal-action-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 1rem 2rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }
  .brutal-action-btn:hover:not(:disabled) {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
    filter: brightness(1.1);
  }
  .brutal-action-btn:active:not(:disabled) {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }
  .brutal-action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: 4px 4px 0px #111;
    transform: translate(2px, 2px);
  }
  .brutal-action-btn.full {
    width: 100%;
    box-sizing: border-box;
  }

  /* Presets */
  .quick-presets {
    width: 100%;
    padding: 1.5rem 0;
    border-top: 4px dashed #111;
    margin-bottom: 1.5rem;
  }
  .section-title {
    font-size: 1.2rem;
    font-weight: 800;
    margin-bottom: 1.5rem;
    display: block;
  }
  .preset-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
  }
  .preset-btn {
    background: #fff;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.15s;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
  }
  .preset-btn:hover {
    background: #fdfae5;
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }
  .preset-btn:active {
    transform: translate(2px, 2px);
    box-shadow: 0px 0px 0px #111;
  }
  .preset-time {
    font-size: 1.25rem;
    font-weight: 800;
    color: #4b7bff;
  }
  .preset-label {
    font-size: 0.85rem;
    font-weight: 700;
    color: #555;
  }
  .add-btn {
    background: #111;
    color: #fff;
    font-size: 1.1rem;
    font-weight: 700;
  }
  .add-btn:hover {
    background: #333;
  }

  /* Custom input */
  .custom-timer-boxes {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
  }
  .custom-box {
    border: 3px solid #111;
    padding: 1.5rem;
    background: #fdfae5;
    box-shadow: 4px 4px 0px #111;
  }
  .box-title {
    font-size: 1.15rem;
    font-weight: 800;
    margin-bottom: 1rem;
  }
  .custom-input-group {
    display: flex;
    gap: 1rem;
    justify-content: space-between;
  }
  .input-item {
    display: flex;
    align-items: center;
    border: 3px solid #111;
    background: #fff;
    padding: 0.25rem;
    box-shadow: 2px 2px 0px #111;
    flex: 1;
    justify-content: space-between;
  }
  .num-input {
    width: 100%;
    border: none;
    background: transparent;
    font-size: 1.5rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 800;
    outline: none;
    text-align: center;
    color: #111;
  }
  .unit {
    font-size: 0.9rem;
    font-weight: 700;
    color: #555;
    padding: 0 0.5rem;
    border-left: 2px dashed #ccc;
  }

  .brutal-input {
    border: 3px solid #111;
    padding: 0.75rem 1rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 700;
    font-size: 1.1rem;
    background: #fff;
    box-shadow: 3px 3px 0px #111;
    outline: none;
    transition: all 0.2s;
  }
  .brutal-input:focus {
    background: #ffd900;
  }
  .brutal-input.full {
    width: 100%;
    box-sizing: border-box;
  }
  .mt-2 {
    margin-top: 1rem;
  }
  .mt-3 {
    margin-top: 1.5rem;
  }
  .mt-4 {
    margin-top: 2rem;
  }

  /* Laps */
  .laps-container {
    width: 100%;
    padding-top: 2rem;
    border-top: 4px dashed #111;
  }
  .laps-list-wrapper {
    background: #fff;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    max-height: 250px;
    overflow-y: auto;
  }
  .lap-item {
    display: flex;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 2px solid #ccc;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1.1rem;
    font-weight: 700;
  }
  .lap-item:last-child {
    border-bottom: none;
  }
  .lap-item:nth-child(even) {
    background: #fdfae5;
  }
  .lap-index {
    color: #555;
    width: 40px;
  }
  .lap-time {
    font-size: 1.25rem;
    color: #111;
  }
  .lap-split {
    color: #888;
    font-size: 1rem;
  }

  /* Modals */
  .brutal-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }
  .brutal-modal-content {
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
  }
  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #fff;
    cursor: pointer;
    outline: none;
    transition: transform 0.1s;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
  }
  .close-btn:hover {
    transform: scale(1.1);
    color: #ff4b4b;
    text-shadow: 2px 2px 0 #fff;
  }

  .settings-body {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  .settings-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .settings-title {
    font-size: 1.2rem;
    font-weight: 800;
    border-bottom: 3px solid #111;
    padding-bottom: 0.5rem;
    margin: 0;
  }

  .sound-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  .sound-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.75rem;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.1s;
    box-shadow: 3px 3px 0px #111;
  }
  .sound-btn:hover {
    background: #fdfae5;
  }
  .sound-btn.active {
    background: #4b7bff;
    color: white;
    box-shadow: 0px 0px 0px #111;
    transform: translate(3px, 3px);
  }

  .brutal-checkbox {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    font-weight: 700;
    font-size: 1.1rem;
  }
  .brutal-checkbox input {
    appearance: none;
    width: 24px;
    height: 24px;
    border: 3px solid #111;
    background: #fff;
    box-shadow: 2px 2px 0px #111;
    cursor: pointer;
    position: relative;
  }
  .brutal-checkbox input:checked {
    background: #00e572;
  }
  .brutal-checkbox input:checked::after {
    content: '✔';
    position: absolute;
    color: #111;
    font-weight: 900;
    left: 2px;
    top: -2px;
    font-size: 1.2rem;
  }

  .preset-edit-list {
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    background: #fff;
  }
  .preset-edit-item {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    border-bottom: 2px dashed #ccc;
    font-weight: 700;
    gap: 1rem;
  }
  .preset-edit-item:last-child {
    border-bottom: none;
  }
  .preset-edit-item .time {
    color: #4b7bff;
    font-family: monospace;
    font-size: 1.2rem;
    width: 100px;
  }
  .preset-edit-item .label {
    flex: 1;
  }
  .preset-edit-item .del-btn {
    background: #ff4b4b;
    border: 2px solid #111;
    color: white;
    width: 32px;
    height: 32px;
    font-weight: 900;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
  }
  .preset-edit-item .del-btn:hover {
    background: #cc0000;
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
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
    margin-top: 1rem;
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
      font-size: 2.2rem;
    }
    .time-display {
      font-size: 3.5rem;
    }
    .controls-area {
      flex-wrap: wrap;
    }
    .controls-area .brutal-action-btn {
      flex: 1;
      min-width: 140px;
      padding: 1rem;
      font-size: 1rem;
    }
    .quick-presets {
      padding: 1rem 0;
    }
    .pane-body {
      padding: 1rem;
    }
    .input-item {
      padding: 0;
    }
    .num-input {
      font-size: 1.2rem;
      height: 40px;
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
  [data-theme='dark'] .brutal-status,
  [data-theme='dark'] .mode-switcher,
  [data-theme='dark'] .brutal-modal-content {
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
  [data-theme='dark'] .brutal-action-btn {
    border-color: #eee;
    box-shadow: 6px 6px 0px #eee;
    color: #eee;
    background: #222;
  }

  [data-theme='dark'] .brutal-action-btn.bg-pink {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .brutal-action-btn.bg-green {
    background: #00994c;
    color: #eee;
  }
  [data-theme='dark'] .brutal-action-btn.bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .brutal-action-btn.bg-yellow {
    background: #b28f00;
    color: #eee;
  }
  [data-theme='dark'] .brutal-action-btn.bg-dark {
    background: #333;
    color: #fff;
  }

  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #eee;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .bg-dark {
    background: #333;
    color: #fff;
  }
  [data-theme='dark'] .brutal-pane {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }

  [data-theme='dark'] .mode-switcher {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .switch-btn {
    color: #aaa;
    border-right-color: #eee;
  }
  [data-theme='dark'] .switch-btn.active {
    background: #2a4eb2;
    color: #fff;
    box-shadow: inset 4px 4px 0px rgba(0, 0, 0, 0.5);
  }

  [data-theme='dark'] .time-display {
    color: #eee;
    text-shadow: 4px 4px 0px #333;
  }
  [data-theme='dark'] .stopwatch-ms {
    color: #aaa;
  }
  [data-theme='dark'] .time-status {
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .status-active {
    background: #00994c;
    color: #eee;
    box-shadow: 3px 3px 0px #00994c;
    border-color: #00994c;
  }

  [data-theme='dark'] .quick-presets {
    border-top-color: #eee;
  }
  [data-theme='dark'] .preset-btn {
    background: #222;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
    color: #eee;
  }
  [data-theme='dark'] .preset-btn:hover {
    background: #333;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .preset-time {
    color: #89b4f8;
  }
  [data-theme='dark'] .preset-label {
    color: #aaa;
  }
  [data-theme='dark'] .preset-btn.add-btn {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .preset-btn.add-btn:hover {
    background: #ccc;
  }

  [data-theme='dark'] .custom-box {
    background: #222;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .input-item {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .num-input {
    color: #eee;
  }
  [data-theme='dark'] .unit {
    color: #aaa;
    border-left-color: #444;
  }
  [data-theme='dark'] .brutal-input {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-input:focus {
    background: #333;
  }

  [data-theme='dark'] .laps-container {
    border-top-color: #eee;
  }
  [data-theme='dark'] .laps-list-wrapper {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .lap-item {
    border-bottom-color: #444;
  }
  [data-theme='dark'] .lap-item:nth-child(even) {
    background: #222;
  }
  [data-theme='dark'] .lap-time {
    color: #eee;
  }
  [data-theme='dark'] .lap-index,
  [data-theme='dark'] .lap-split {
    color: #aaa;
  }

  [data-theme='dark'] .settings-title {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .sound-btn {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .sound-btn.active {
    background: #2a4eb2;
    color: #fff;
    box-shadow: 0px 0px 0px #eee;
  }
  [data-theme='dark'] .brutal-checkbox input {
    background: #222;
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .brutal-checkbox input:checked {
    background: #00994c;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-checkbox input:checked::after {
    color: #fff;
  }
  [data-theme='dark'] .preset-edit-list {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .preset-edit-item {
    border-bottom-color: #444;
  }
  [data-theme='dark'] .preset-edit-item .time {
    color: #89b4f8;
  }
  [data-theme='dark'] .preset-edit-item .del-btn {
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
</style>
