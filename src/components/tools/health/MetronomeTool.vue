<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">健康<span>.节拍器()</span></h1>
      </header>

      <main class="tool-content">
        <div class="brutal-pane metronome-pane mx-auto">
          <div class="pane-header bg-black"><span class="text-white">🎵 节奏工具</span></div>
          <div class="pane-body">
            <div class="visualizer mt-4">
              <div class="dots">
                <div
                  v-for="n in beatsPerBar"
                  :key="n"
                  class="dot"
                  :class="{ active: currentBeat === n }"
                ></div>
              </div>
              <div class="bpm-display mt-8">
                <span class="value">{{ bpm }}</span>
                <span class="label">BPM</span>
              </div>
            </div>

            <div class="controls mt-8">
              <input v-model="bpm" type="range" min="40" max="220" class="brutal-range" />

              <div class="btn-row mt-8">
                <button class="brutal-icon-btn adjust-btn" @click="bpm--">➖</button>
                <button class="brutal-play-btn" :class="{ playing: isPlaying }" @click="togglePlay">
                  {{ !isPlaying ? '▶' : '⏸' }}
                </button>
                <button class="brutal-icon-btn adjust-btn" @click="bpm++">➕</button>
              </div>

              <div class="settings-row mt-8">
                <div class="setting-item">
                  <label>拍号</label>
                  <select v-model="beatsPerBar" class="brutal-select">
                    <option v-for="n in [2, 3, 4, 6]" :key="n" :value="n">{{ n }}/4</option>
                  </select>
                </div>
                <div class="setting-item">
                  <label>音色</label>
                  <select v-model="soundType" class="brutal-select">
                    <option value="tick">Tick</option>
                    <option value="beep">Beep</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer class="footer mt-8">© 2026 LRM工具箱 - 节拍器</footer>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch, onUnmounted } from 'vue';

  const bpm = ref(100);
  const isPlaying = ref(false);
  const beatsPerBar = ref(4);
  const currentBeat = ref(0);
  const soundType = ref('tick');
  let timerId = null;
  let audioCtx = null;

  const playSound = (accent = false) => {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (soundType.value === 'beep') {
      osc.type = 'sine';
      osc.frequency.value = accent ? 1000 : 800;
    } else {
      osc.type = 'square';
      osc.frequency.value = accent ? 800 : 600;
    }

    gain.gain.setValueAtTime(1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.1);
  };

  const togglePlay = () => {
    if (isPlaying.value) stop();
    else start();
  };

  const start = () => {
    if (isPlaying.value) return;
    isPlaying.value = true;
    currentBeat.value = 0;
    runLoop();
  };

  const stop = () => {
    isPlaying.value = false;
    clearTimeout(timerId);
    currentBeat.value = 0;
  };

  const runLoop = () => {
    if (!isPlaying.value) return;

    currentBeat.value = (currentBeat.value % beatsPerBar.value) + 1;
    playSound(currentBeat.value === 1);

    const interval = (60 / bpm.value) * 1000;
    timerId = setTimeout(runLoop, interval);
  };

  watch(bpm, () => {
    if (isPlaying.value) {
      clearTimeout(timerId);
      runLoop();
    }
  });

  onUnmounted(() => {
    stop();
    if (audioCtx) audioCtx.close();
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
  }
  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.5rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0 #4b7bff;
    flex: 1;
    text-align: center;
  }
  .brutal-title span {
    color: #4b7bff;
    text-shadow: 4px 4px 0 #111;
  }

  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 6px 6px 0 #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }
  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0 #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0 0 0 #111;
  }

  .metronome-pane {
    max-width: 500px;
    width: 100%;
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0 #111;
  }
  .pane-header {
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.25rem;
    text-align: center;
  }
  .bg-black {
    background: #111;
    color: white;
  }
  .pane-body {
    padding: 3rem 2rem;
    text-align: center;
  }
  .mx-auto {
    margin-left: auto;
    margin-right: auto;
  }

  .visualizer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .dots {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }
  .dot {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 4px solid #111;
    background: #fff;
    transition: all 0.1s;
  }
  .dot.active {
    background: #ff4b4b;
    transform: scale(1.2);
    box-shadow: 2px 2px 0 #111;
  }

  .bpm-display {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .bpm-display .value {
    font-size: 6rem;
    font-weight: 900;
    line-height: 1;
    font-family: 'Syne', sans-serif;
    text-shadow: 4px 4px 0 #4b7bff;
    color: #111;
  }
  .bpm-display .label {
    font-size: 1.2rem;
    font-weight: 900;
    background: #111;
    color: #fff;
    padding: 0.2rem 1rem;
    margin-top: 0.5rem;
    font-family: 'IBM Plex Mono', monospace;
  }

  .brutal-range {
    -webkit-appearance: none;
    width: 100%;
    height: 20px;
    background: #fff;
    border: 4px solid #111;
    border-radius: 10px;
    outline: none;
    transition: background 0.2s;
    box-shadow: 4px 4px 0 #111;
  }
  .brutal-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #ffd900;
    cursor: pointer;
    border: 4px solid #111;
    box-shadow: 2px 2px 0 #111;
  }
  .brutal-range::-moz-range-thumb {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #ffd900;
    cursor: pointer;
    border: 4px solid #111;
    box-shadow: 2px 2px 0 #111;
  }

  .btn-row {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
  }

  .brutal-icon-btn {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #fff;
    border: 4px solid #111;
    font-size: 1.5rem;
    font-weight: 900;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 4px 4px 0 #111;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
  }
  .brutal-icon-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #111;
  }
  .brutal-icon-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0 0 0 #111;
  }

  .brutal-play-btn {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: #4b7bff;
    border: 4px solid #111;
    color: #fff;
    font-size: 3rem;
    font-weight: 900;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 8px 8px 0 #111;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
    padding-left: 0.5rem;
  }
  .brutal-play-btn.playing {
    background: #ff4b4b;
    padding-left: 0;
  }
  .brutal-play-btn:hover {
    transform: translate(-4px, -4px);
    box-shadow: 12px 12px 0 #111;
  }
  .brutal-play-btn:active {
    transform: translate(8px, 8px);
    box-shadow: 0 0 0 #111;
  }

  .settings-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    border-top: 4px dashed #111;
    padding-top: 2rem;
  }
  .setting-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    flex: 1;
  }
  .setting-item label {
    font-size: 1rem;
    font-weight: 900;
    font-family: 'Noto Sans SC', sans-serif;
  }

  .brutal-select {
    width: 100%;
    padding: 0.75rem;
    font-size: 1.1rem;
    border: 4px solid #111;
    background: #fff;
    font-weight: bold;
    box-sizing: border-box;
    font-family: 'IBM Plex Mono', monospace;
    box-shadow: 4px 4px 0 #111;
    transition: transform 0.1s;
  }
  .brutal-select:focus {
    outline: none;
    box-shadow: 6px 6px 0 #4b7bff;
    border-color: #111;
    transform: translate(-2px, -2px);
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
    .brutal-title {
      font-size: 2.2rem;
    }
    .metronome-pane {
      border-left: none;
      border-right: none;
      border-radius: 0;
      box-shadow: none;
      border-bottom: 4px solid #111;
      border-top: 4px solid #111;
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
  [data-theme='dark'] .brutal-icon-btn,
  [data-theme='dark'] .brutal-select,
  [data-theme='dark'] .dot {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-icon-btn,
  [data-theme='dark'] .brutal-play-btn,
  [data-theme='dark'] .brutal-select,
  [data-theme='dark'] .brutal-range {
    box-shadow: 6px 6px 0 #eee;
  }

  [data-theme='dark'] .brutal-btn:hover,
  [data-theme='dark'] .brutal-icon-btn:hover,
  [data-theme='dark'] .brutal-select:focus {
    box-shadow: 9px 9px 0 #eee;
  }
  [data-theme='dark'] .brutal-play-btn:hover {
    box-shadow: 12px 12px 0 #eee;
  }

  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0 #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .bg-black {
    background: #222;
  }

  [data-theme='dark'] .bpm-display .value {
    color: #eee;
    text-shadow: 4px 4px 0 #2a4eb2;
  }
  [data-theme='dark'] .bpm-display .label {
    background: #eee;
    color: #111;
  }

  [data-theme='dark'] .dot.active {
    background: #ff4b4b;
    border-color: #eee;
    box-shadow: 2px 2px 0 #eee;
  }
  [data-theme='dark'] .brutal-range {
    background: #1a1a1a;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-range::-webkit-slider-thumb {
    background: #b28f00;
    border-color: #eee;
    box-shadow: 2px 2px 0 #eee;
  }
  [data-theme='dark'] .brutal-range::-moz-range-thumb {
    background: #b28f00;
    border-color: #eee;
    box-shadow: 2px 2px 0 #eee;
  }

  [data-theme='dark'] .brutal-play-btn {
    background: #2a4eb2;
    border-color: #eee;
    color: #fff;
  }
  [data-theme='dark'] .brutal-play-btn.playing {
    background: #8b0000;
    border-color: #eee;
  }

  [data-theme='dark'] .settings-row {
    border-top-color: #eee;
  }
</style>
