<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon><span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">乐器调音器</h1>
        <span class="tool-subtitle">Instrument Tuner</span>
      </div>
      <div class="header-right">
        <el-button
          :type="isListening ? 'danger' : 'success'"
          :icon="isListening ? Mic : VideoPlay"
          @click="toggleListening"
        >
          {{ isListening ? '停止' : '开始调音' }}
        </el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="layout-container">
        <div class="main-section glass-card">
          <div v-if="!isListening" class="start-overlay" @click="toggleListening">
            <el-icon class="mic-icon"><Mic /></el-icon>
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
                    ? '偏高'
                    : centsOff < -5
                      ? '偏低'
                      : currentNote
                        ? '准了!'
                        : '等待输入...'
                }}
              </div>
            </div>

            <div class="spectrum-mini">
              <canvas ref="canvasRef" width="400" height="60"></canvas>
            </div>
          </div>
        </div>

        <div class="sidebar glass-card">
          <div class="preset-section">
            <h3>调音预设</h3>
            <el-select v-model="selectedPreset" style="width: 100%" @change="onPresetChange">
              <el-option label="吉他标调 (EADGBE)" value="guitar" />
              <el-option label="尤克里里 (GCEA)" value="ukulele" />
              <el-option label="小提琴 (GDAE)" value="violin" />
              <el-option label="大提琴 (CGDA)" value="cello" />
              <el-option label="半音模式 (所有音符)" value="chromatic" />
            </el-select>
          </div>

          <div v-if="selectedPreset !== 'chromatic'" class="targets-list">
            <div
              v-for="target in currentTargets"
              :key="target.note"
              class="target-item"
              :class="{ active: currentNote === target.note }"
            >
              <span class="t-note">{{ target.note }}</span>
              <span class="t-freq">{{ target.freq.toFixed(1) }} Hz</span>
            </div>
          </div>
        </div>
      </div>

      <div class="tips-section glass-card">
        <div class="tips-header">
          <el-icon><InfoFilled /></el-icon>
          <h4>调音指南</h4>
        </div>
        <div class="tips-content">
          <ul class="premium-list">
            <li><b>静音环境</b>：调音时请确保周围环境安静，背景噪音会干扰检测结果。</li>
            <li><b>单一音源</b>：每次只拨动一根琴弦，避免和弦共鸣导致频率锁定失败。</li>
            <li>
              <b>仪表读数</b>：指针偏向左侧表示音低了，需要收紧琴弦；偏向右侧表示音高了，需放松。
            </li>
            <li><b>权限说明</b>：本工具所有音频处理均在本地完成，不会将您的录音上传服务器。</li>
          </ul>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 乐器调音器</footer>
  </div>
</template>

<script setup>
  import { ref, onUnmounted, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { ArrowLeft, Mic, VideoPlay, InfoFilled } from '@element-plus/icons-vue';
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
  const needleRotation = computed(() => {
    return Math.max(-60, Math.min(60, centsOff.value * 1.2));
  });

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

  let audioCtx = null;
  let analyser = null;
  let microphone = null;
  let scriptProcessor = null;
  let animationId = null;
  const canvasRef = ref(null);

  const toggleListening = async () => {
    if (isListening.value) {
      stopListening();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        startListening(stream);
      } catch (err) {
        console.error(err);
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

    // 使用缓冲区处理计算频率
    scriptProcessor = audioCtx.createScriptProcessor(2048, 1, 1);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(audioCtx.destination);

    scriptProcessor.onaudioprocess = e => {
      const buffer = e.inputBuffer.getChannelData(0);
      const pitch = autoCorrelate(buffer, audioCtx.sampleRate);

      if (pitch !== -1) {
        updatePitch(pitch);
      }
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

  // 自相关算法提取主频
  const autoCorrelate = (buffer, sampleRate) => {
    let SIZE = buffer.length;
    let rms = 0;
    for (let i = 0; i < SIZE; i++) {
      rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) return -1; // 静音阈值

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
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE - i; j++) {
        c[i] = c[i] + buffer[j] * buffer[j + i];
      }
    }

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
    // 二次插值优化精度
    const x1 = c[T0 - 1],
      x2 = c[T0],
      x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);

    return sampleRate / T0;
  };

  const updatePitch = freq => {
    currentFreq.value = freq;

    // 转换为半音阶
    const n = 12 * (Math.log(freq / 440) / Math.log(2));
    const noteNum = Math.round(n) + 69;

    currentNote.value = notes[noteNum % 12];
    currentOctave.value = Math.floor(noteNum / 12) - 1;

    // 计算偏离百分比 (Cents)
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

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#3b82f6';
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

  onUnmounted(() => {
    stopListening();
  });
</script>

<style scoped>
  .tool-page {
    min-height: 100vh;
    background: #f1f5f9;
    display: flex;
    flex-direction: column;
  }

  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
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
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .layout-container {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .main-section {
    padding: 2rem;
    min-height: 500px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  .start-overlay {
    text-align: center;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .start-overlay:hover {
    transform: scale(1.05);
  }

  .mic-icon {
    font-size: 5rem;
    color: #3b82f6;
    margin-bottom: 1.5rem;
  }

  .tuner-display {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }

  .tuner-gauge {
    width: 100%;
    max-width: 500px;
    height: 300px;
    background: #1e293b;
    border-radius: 200px 200px 20px 20px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.3);
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
    font-size: 6rem;
    font-weight: 800;
    color: white;
    line-height: 1;
  }

  .note-octave {
    position: absolute;
    top: 0;
    right: -20px;
    font-size: 1.5rem;
    color: #94a3b8;
  }

  .current-freq {
    font-size: 1rem;
    color: #94a3b8;
    margin-top: 10px;
    font-family: monospace;
  }

  .gauge-needle {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 4px;
    height: 200px;
    background: #ef4444;
    transform-origin: bottom center;
    transition: transform 0.1s cubic-bezier(0.2, 0, 0.2, 1);
    z-index: 3;
  }

  .gauge-needle::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: -8px;
    width: 20px;
    height: 20px;
    background: #ef4444;
    border-radius: 50%;
  }

  .gauge-scale {
    position: absolute;
    bottom: 20px;
    width: 100%;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    color: #475569;
    font-weight: bold;
    font-size: 1.25rem;
  }

  .tuning-indicator {
    position: absolute;
    top: 20px;
    width: 100%;
    text-align: center;
    font-weight: bold;
    font-size: 1.2rem;
    color: #64748b;
    transition: all 0.3s;
  }

  .tuning-indicator.perfect {
    color: #10b981;
    text-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
  }

  .spectrum-mini {
    width: 100%;
    max-width: 400px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
  }

  .sidebar {
    padding: 1.5rem;
  }

  .preset-section h3 {
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }

  .targets-list {
    margin-top: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .target-item {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: white;
    transition: all 0.2s;
  }

  .target-item.active {
    background: #eff6ff;
    border-color: #3b82f6;
    color: #2563eb;
    font-weight: bold;
    transform: scale(1.02);
  }

  .t-note {
    font-size: 1.1rem;
  }

  .t-freq {
    font-size: 0.8rem;
    color: #94a3b8;
  }

  .tips-section {
    padding: 1.5rem 2rem;
    background: linear-gradient(to bottom right, #ffffff, #f8fafc);
    border: 1px solid rgba(59, 130, 246, 0.1);
  }

  .tips-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    color: #3b82f6;
  }

  .tips-header h4 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .premium-list {
    padding-left: 1.25rem;
    margin: 0;
  }

  .premium-list li {
    margin-bottom: 0.75rem;
    color: #475569;
    font-size: 0.9rem;
    line-height: 1.6;
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }

  @media (max-width: 992px) {
    .layout-container {
      grid-template-columns: 1fr;
    }
  }
</style>
