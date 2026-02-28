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

        <!-- 倒计时视图 -->
        <TimerCountdown
          v-show="currentMode === 'countdown'"
          ref="countdownRef"
          :quick-presets="settings.quickPresets"
          @complete="handleCountdownComplete"
          @open-add-preset="addPresetVisible = true"
          @start-preset="p => countdownRef.start(p.time, p.label)"
        />

        <!-- 跑表视图 -->
        <TimerStopwatch v-show="currentMode === 'stopwatch'" ref="stopwatchRef" />
      </main>

      <!-- 设置弹窗 -->
      <TimerSettings
        v-model="settingsVisible"
        v-model:settings="settings"
        :sound-options="soundOptions"
      />

      <!-- 新增预设弹窗 -->
      <TimerAddPreset v-model="addPresetVisible" @add="handleAddPreset" />

      <!-- 页脚装饰 -->
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
  import { ref, reactive, onMounted, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import TimerCountdown from './TimerTool/TimerCountdown.vue';
  import TimerStopwatch from './TimerTool/TimerStopwatch.vue';
  import TimerSettings from './TimerTool/TimerSettings.vue';
  import TimerAddPreset from './TimerTool/TimerAddPreset.vue';

  const router = useRouter();
  const goBack = () => router.back();

  const currentMode = ref('countdown');
  const settingsVisible = ref(false);
  const addPresetVisible = ref(false);
  const audioPlayer = ref(null);
  const countdownRef = ref(null);
  const stopwatchRef = ref(null);

  const settings = reactive({
    currentSound: 'default',
    loopSound: false,
    enableNotification: false,
    enableVibration: true,
    quickPresets: [
      { time: 60, label: '1分钟' },
      { time: 300, label: '5分钟' },
      { time: 600, label: '10分钟' },
      { time: 1800, label: '30分钟' },
      { time: 3600, label: '1小时' }
    ]
  });

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

  function switchMode(mode) {
    if (mode === 'countdown' && stopwatchRef.value) stopwatchRef.value.pause();
    if (mode === 'stopwatch' && countdownRef.value) countdownRef.value.pause();
    currentMode.value = mode;
  }

  function handleCountdownComplete(label) {
    playAlert();
    if (settings.enableNotification && Notification.permission === 'granted') {
      new Notification('计时结束', `${label || '倒计时'} 已完成`);
    }
  }

  function handleAddPreset(preset) {
    settings.quickPresets.push(preset);
    saveSettings();
  }

  function playAlert() {
    if (audioPlayer.value) {
      audioPlayer.value.src = sounds[settings.currentSound].src;
      audioPlayer.value.loop = settings.loopSound;
      audioPlayer.value.play().catch(e => console.error(e));
    }
    if (settings.enableVibration && navigator.vibrate) {
      navigator.vibrate([500, 300, 500]);
    }
  }

  function saveSettings() {
    localStorage.setItem('timer_tool_settings_brutal', JSON.stringify(settings));
  }

  function loadSettings() {
    const s = localStorage.getItem('timer_tool_settings_brutal');
    if (s) {
      try {
        const data = JSON.parse(s);
        Object.assign(settings, data);
      } catch (e) {
        console.warn('Failed to parse settings:', e);
      }
    }
  }

  onMounted(loadSettings);
  watch(settings, saveSettings, { deep: true });
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

  .brutal-pane {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    transition: transform 0.2s;
    display: flex;
    flex-direction: column;
  }

  .main-content {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }

  .mode-switcher {
    display: flex;
    padding: 8px;
    gap: 8px;
  }

  .switch-btn {
    flex: 1;
    padding: 1rem;
    border: 3px solid #111;
    background: #fff;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.1s;
  }

  .switch-btn.active {
    background: #111;
    color: #fff;
    box-shadow: 4px 4px 0px #4b7bff;
    transform: translate(-2px, -2px);
  }

  .brutal-status {
    border-top: 4px solid #111;
    padding-top: 2rem;
    overflow: hidden;
  }

  .marquee-wrapper {
    background: #ffd900;
    border: 3px solid #111;
    padding: 0.5rem 0;
  }

  .marquee-content {
    display: inline-block;
    white-space: nowrap;
    animation: marquee 30s linear infinite;
    font-weight: 900;
    font-family: 'IBM Plex Mono', monospace;
  }

  @keyframes marquee {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-50%);
    }
  }
</style>
