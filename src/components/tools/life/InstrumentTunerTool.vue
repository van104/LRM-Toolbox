<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">调音<span>.器()</span></h1>
        <button
          class="brutal-btn"
          :class="isListening ? 'stop-btn' : 'start-btn'"
          @click="toggleListening"
        >
          {{ isListening ? '⏹ 停止' : '🎤 开始调音' }}
        </button>
      </header>

      <div class="brutal-grid main-layout">
        <div class="brutal-pane tuner-pane">
          <div class="pane-header bg-dark">
            <span class="text-white">🎵 调音面板</span>
          </div>

          <div v-if="!isListening" class="start-overlay" @click="toggleListening">
            <span class="mic-icon">🎤</span>
            <h3>点击开始，允许浏览器访问麦克风</h3>
            <p>拨动琴弦以获取当前音高</p>
          </div>

          <div v-else class="tuner-display">
            <div class="tuner-gauge">
              <div class="gauge-center">
                <div class="current-note">{{ currentNote || '-' }}</div>
                <div class="note-octave">{{ currentOctave || '' }}</div>
                <div class="current-freq">
                  {{ currentFreq ? currentFreq.toFixed(1) + ' Hz' : '' }}
                </div>
              </div>
              <div
                class="gauge-needle"
                :style="{ transform: `rotate(${needleRotation}deg)` }"
              ></div>
              <div class="gauge-scale">
                <span class="flat">-50</span>
                <span class="sharp">+50</span>
              </div>
              <div
                class="tuning-indicator"
                :class="{ perfect: Math.abs(centsOff) < 5 && currentNote }"
              >
                {{
                  centsOff > 5
                    ? '偏高 ↑'
                    : centsOff < -5
                      ? '偏低 ↓'
                      : currentNote
                        ? '✓ 准了!'
                        : '等待输入...'
                }}
              </div>
            </div>

            <div class="spectrum-mini">
              <canvas ref="canvasRef" width="400" height="60"></canvas>
            </div>
          </div>
        </div>

        <div class="side-column">
          <div class="brutal-pane">
            <div class="pane-header bg-yellow">
              <span>调音预设</span>
            </div>
            <div class="preset-body">
              <select v-model="selectedPreset" class="brutal-select full" @change="onPresetChange">
                <option value="guitar">吉他标调 (EADGBE)</option>
                <option value="ukulele">尤克里里 (GCEA)</option>
                <option value="violin">小提琴 (GDAE)</option>
                <option value="cello">大提琴 (CGDA)</option>
                <option value="chromatic">半音模式 (所有音符)</option>
              </select>

              <div v-if="selectedPreset !== 'chromatic'" class="targets-list">
                <div
                  v-for="target in currentTargets"
                  :key="target.note + target.freq"
                  class="target-item"
                  :class="{ active: currentNote === target.note }"
                >
                  <span class="t-note">{{ target.note }}</span>
                  <span class="t-freq">{{ target.freq.toFixed(1) }} Hz</span>
                </div>
              </div>
            </div>
          </div>

          <div class="brutal-pane">
            <div class="pane-header bg-blue">
              <span class="text-white">调音指南</span>
            </div>
            <ul class="brutal-list">
              <li><b>静音环境</b>：调音时请确保周围环境安静，背景噪音会干扰检测结果。</li>
              <li><b>单一音源</b>：每次只拨动一根琴弦，避免和弦共鸣导致频率锁定失败。</li>
              <li><b>仪表读数</b>：指针偏左表示音低，需收紧琴弦；偏右表示音高，需放松。</li>
              <li><b>权限说明</b>：所有音频处理均在本地完成，不会上传服务器。</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="brutal-status info">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i">© 2026 LRM工具箱 - 乐器调音器 // &nbsp;</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onUnmounted, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const isListening = ref(false);
  const currentFreq = ref(0);
  const currentNote = ref('');
  const currentOctave = ref('');
  const centsOff = ref(0);
  const needleRotation = computed(() => Math.max(-60, Math.min(60, centsOff.value * 1.2)));

  const selectedPreset = ref('guitar');
  const presets = {
    guitar: [
      { note: 'E', freq: 82.41 },
      { note: 'A', freq: 110.0 },
      { note: 'D', freq: 146.83 },
      { note: 'G', freq: 196.0 },
      { note: 'B', freq: 246.94 },
      { note: 'E', freq: 329.63 }
    ],
    ukulele: [
      { note: 'G', freq: 392.0 },
      { note: 'C', freq: 261.63 },
      { note: 'E', freq: 329.63 },
      { note: 'A', freq: 440.0 }
    ],
    violin: [
      { note: 'G', freq: 196.0 },
      { note: 'D', freq: 293.66 },
      { note: 'A', freq: 440.0 },
      { note: 'E', freq: 659.25 }
    ],
    cello: [
      { note: 'C', freq: 65.41 },
      { note: 'G', freq: 98.0 },
      { note: 'D', freq: 146.83 },
      { note: 'A', freq: 220.0 }
    ],
    chromatic: []
  };
  const currentTargets = computed(() => presets[selectedPreset.value]);
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  let audioCtx = null,
    analyser = null,
    microphone = null,
    scriptProcessor = null,
    animationId = null;
  const canvasRef = ref(null);

  const toggleListening = async () => {
    if (isListening.value) {
      stopListening();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        startListening(stream);
      } catch {
        ElMessage.error('无法访问麦克风，请检查权限设置');
      }
    }
  };

  const startListening = stream => {
    isListening.value = true;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    microphone = audioCtx.createMediaStreamSource(stream);
    microphone.connect(analyser);
    scriptProcessor = audioCtx.createScriptProcessor(2048, 1, 1);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(audioCtx.destination);
    scriptProcessor.onaudioprocess = e => {
      const buffer = e.inputBuffer.getChannelData(0);
      const pitch = autoCorrelate(buffer, audioCtx.sampleRate);
      if (pitch !== -1) updatePitch(pitch);
    };
    drawVisual();
  };

  const stopListening = () => {
    isListening.value = false;
    if (scriptProcessor) scriptProcessor.disconnect();
    if (microphone) microphone.disconnect();
    if (audioCtx) audioCtx.close();
    if (animationId) cancelAnimationFrame(animationId);
    currentNote.value = '';
    currentFreq.value = 0;
    centsOff.value = 0;
  };

  const autoCorrelate = (buffer, sampleRate) => {
    let SIZE = buffer.length;
    let rms = 0;
    for (let i = 0; i < SIZE; i++) rms += buffer[i] * buffer[i];
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) return -1;
    let r1 = 0,
      r2 = SIZE - 1,
      threshold = 0.2;
    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buffer[i]) < threshold) {
        r1 = i;
        break;
      }
    }
    for (let i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buffer[SIZE - i]) < threshold) {
        r2 = SIZE - i;
        break;
      }
    }
    buffer = buffer.slice(r1, r2);
    SIZE = buffer.length;
    const c = new Array(SIZE).fill(0);
    for (let i = 0; i < SIZE; i++)
      for (let j = 0; j < SIZE - i; j++) c[i] = c[i] + buffer[j] * buffer[j + i];
    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxval = -1,
      maxpos = -1;
    for (let i = d; i < SIZE; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }
    let T0 = maxpos;
    const x1 = c[T0 - 1],
      x2 = c[T0],
      x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2,
      b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);
    return sampleRate / T0;
  };

  const updatePitch = freq => {
    currentFreq.value = freq;
    const n = 12 * (Math.log(freq / 440) / Math.log(2));
    const noteNum = Math.round(n) + 69;
    currentNote.value = notes[noteNum % 12];
    currentOctave.value = Math.floor(noteNum / 12) - 1;
    const expectedFreq = 440 * Math.pow(2, Math.round(n) / 12);
    centsOff.value = (1200 * Math.log(freq / expectedFreq)) / Math.log(2);
  };

  const drawVisual = () => {
    if (!isListening.value) return;
    animationId = requestAnimationFrame(drawVisual);
    const canvas = canvasRef.value;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);
    ctx.fillStyle = '#fdfae5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#4b7bff';
    ctx.beginPath();
    const sliceWidth = (canvas.width * 1.0) / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += sliceWidth;
    }
    ctx.stroke();
  };

  const onPresetChange = () => {
    if (isListening.value) {
      currentNote.value = '';
      centsOff.value = 0;
    }
  };
  onUnmounted(() => stopListening());
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
  }
  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }
  .start-btn {
    background: #00e572;
  }
  .stop-btn {
    background: #ff4b4b;
    color: #fff;
  }

  .main-layout {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 2.5rem;
    margin-bottom: 2.5rem;
  }
  .brutal-pane {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
    transition: transform 0.2s;
    display: flex;
    flex-direction: column;
  }
  .brutal-pane:hover {
    transform: translate(-4px, -4px);
    box-shadow: 16px 16px 0px #111;
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
  .bg-dark {
    background: #111;
    color: #fff;
  }
  .text-white {
    color: #fff;
  }

  .start-overlay {
    text-align: center;
    padding: 4rem 2rem;
    cursor: pointer;
  }
  .start-overlay:hover {
    background: #fdfae5;
  }
  .mic-icon {
    font-size: 5rem;
    display: block;
    margin-bottom: 1rem;
  }
  .start-overlay h3 {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.2rem;
    margin: 0 0 0.5rem;
  }
  .start-overlay p {
    color: #555;
    font-weight: 600;
    margin: 0;
  }

  .tuner-display {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    padding: 2rem;
  }
  .tuner-gauge {
    width: 100%;
    max-width: 450px;
    height: 280px;
    background: #111;
    position: relative;
    overflow: hidden;
    border: 4px solid #111;
    box-shadow: 6px 6px 0px #111;
  }
  .gauge-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    z-index: 5;
  }
  .current-note {
    font-size: 5rem;
    font-weight: 800;
    color: white;
    line-height: 1;
    font-family: 'Syne', sans-serif;
  }
  .note-octave {
    position: absolute;
    top: 0;
    right: -20px;
    font-size: 1.5rem;
    color: #888;
  }
  .current-freq {
    font-size: 1rem;
    color: #888;
    margin-top: 10px;
    font-family: 'IBM Plex Mono', monospace;
  }
  .gauge-needle {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 4px;
    height: 180px;
    background: #ff4b4b;
    transform-origin: bottom center;
    transition: transform 0.1s;
    z-index: 3;
  }
  .gauge-needle::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: -8px;
    width: 20px;
    height: 20px;
    background: #ff4b4b;
  }
  .gauge-scale {
    position: absolute;
    bottom: 20px;
    width: 100%;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    color: #555;
    font-weight: bold;
    font-size: 1.1rem;
    box-sizing: border-box;
  }
  .tuning-indicator {
    position: absolute;
    top: 20px;
    width: 100%;
    text-align: center;
    font-weight: 800;
    font-size: 1.2rem;
    color: #888;
    font-family: 'Syne', sans-serif;
  }
  .tuning-indicator.perfect {
    color: #00e572;
  }

  .spectrum-mini {
    width: 100%;
    max-width: 400px;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #111;
    overflow: hidden;
  }

  .side-column {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  .preset-body {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .brutal-select {
    border: 3px solid #111;
    padding: 0.6rem 0.8rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    font-size: 1rem;
    background: #ffd900;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    outline: none;
  }
  .brutal-select.full {
    width: 100%;
    box-sizing: border-box;
  }
  .targets-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .target-item {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #111;
    background: #fff;
    transition: all 0.1s;
    font-weight: 700;
  }
  .target-item:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }
  .target-item.active {
    background: #4b7bff;
    color: #fff;
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }
  .t-note {
    font-size: 1.1rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
  }
  .t-freq {
    font-size: 0.8rem;
    opacity: 0.7;
  }

  .brutal-list {
    list-style: none;
    padding: 1.25rem;
    margin: 0;
  }
  .brutal-list li {
    font-size: 0.85rem;
    color: #333;
    position: relative;
    padding-left: 1.25rem;
    margin-bottom: 0.75rem;
    line-height: 1.6;
    font-weight: 500;
  }
  .brutal-list li::before {
    content: '▪';
    position: absolute;
    left: 0;
    color: #ff4b4b;
    font-weight: 900;
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

  @media (max-width: 900px) {
    .main-layout {
      grid-template-columns: 1fr;
    }
    .brutal-header {
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }
    .brutal-title {
      font-size: 2rem;
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
  [data-theme='dark'] .brutal-status {
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
  [data-theme='dark'] .start-btn {
    background: #00994c;
  }
  [data-theme='dark'] .stop-btn {
    background: #cc0000;
  }
  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane:hover {
    box-shadow: 16px 16px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
    color: #111;
  }
  [data-theme='dark'] .brutal-select {
    background: #b28f00;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
    color: #fff;
  }
  [data-theme='dark'] .target-item {
    background: #222;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
    color: #eee;
  }
  [data-theme='dark'] .target-item:hover {
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .target-item.active {
    background: #2a4eb2;
    color: #fff;
    box-shadow: 0 0 0 #eee;
  }
  [data-theme='dark'] .tuner-gauge {
    background: #000;
    border-color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .spectrum-mini {
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .start-overlay p {
    color: #aaa;
  }
  [data-theme='dark'] .brutal-list li {
    color: #ccc;
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
</style>
