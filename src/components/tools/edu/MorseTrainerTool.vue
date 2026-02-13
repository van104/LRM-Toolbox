<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">摩斯密码练习器</h1>
        <span class="tool-subtitle">Morse Code Interactive Trainer</span>
      </div>
      <div class="header-right">
        <el-button link @click="showTable = true"> 编码表 </el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="tool-layout">
        <div class="main-panel glass-card">
          <!-- 状态栏 -->
          <div class="status-bar">
            <div class="stat-item">
              <span class="stat-label">准确率</span>
              <span class="stat-value">{{ accuracy }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">连胜</span>
              <span class="stat-value">{{ streak }}</span>
            </div>
          </div>

          <!-- 练习区域 -->
          <div class="training-field">
            <div class="question-box">
              <span class="label">请发送字符:</span>
              <div class="target-char" :class="{ shake: isWrong }">{{ currentTask.char }}</div>
              <div class="target-morse">{{ currentTask.morse }}</div>
            </div>

            <div class="input-display">
              <div class="morse-sequence">
                <span v-for="(s, i) in userInput" :key="i" class="morse-bit">{{ s }}</span>
                <span v-if="userInput.length === 0" class="placeholder">等待录入...</span>
              </div>
            </div>

            <div class="interaction-buttons">
              <button
                class="tap-button"
                @mousedown="startPress"
                @mouseup="endPress"
                @touchstart.prevent="startPress"
                @touchend.prevent="endPress"
              >
                <div class="button-inner">
                  <el-icon v-if="!isPressing"><Pointer /></el-icon>
                  <div v-else class="pulse"></div>
                </div>
                <span>点按录入 (短/长)</span>
              </button>
            </div>

            <div class="hint-text">短按 = <b>·</b> (点) | 长按 (>250ms) = <b>-</b> (划)</div>
          </div>

          <div class="actions mt-8">
            <el-button type="primary" plain @click="nextLevel"> 跳过此项 </el-button>
            <el-button type="info" plain @click="clearInput"> 清空录入 </el-button>
          </div>
        </div>
      </div>
    </main>

    <!-- 编码对照表 -->
    <el-dialog v-model="showTable" title="摩斯电码标准对照表" width="500px">
      <div class="morse-table-grid">
        <div v-for="(m, c) in morseCode" :key="c" class="table-item">
          <span class="char">{{ c }}</span>
          <span class="code">{{ m }}</span>
        </div>
      </div>
    </el-dialog>

    <footer class="footer">© 2026 LRM工具箱 - 摩斯密码练习器</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue';
  import { ArrowLeft, Pointer } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';

  const showTable = ref(false);
  const userInput = ref<string[]>([]);
  const isPressing = ref(false);
  const isWrong = ref(false);
  const startTime = ref(0);
  const streak = ref(0);
  const totalAttempts = ref(0);
  const correctAttempts = ref(0);

  const morseCode: Record<string, string> = {
    A: '.-',
    B: '-...',
    C: '-.-.',
    D: '-..',
    E: '.',
    F: '..-.',
    G: '--.',
    H: '....',
    I: '..',
    J: '.---',
    K: '-.-',
    L: '.-..',
    M: '--',
    N: '-.',
    O: '---',
    P: '.--.',
    Q: '--.-',
    R: '.-.',
    S: '...',
    T: '-',
    U: '..-',
    V: '...-',
    W: '.--',
    X: '-..-',
    Y: '-.--',
    Z: '--..',
    '1': '.----',
    '2': '..---',
    '3': '...--',
    '4': '....-',
    '5': '.....',
    '6': '-....',
    '7': '--...',
    '8': '---..',
    '9': '----.',
    '0': '-----'
  };

  const currentTask = reactive({
    char: 'A',
    morse: '.-'
  });

  const accuracy = computed(() => {
    if (totalAttempts.value === 0) return 0;
    return Math.round((correctAttempts.value / totalAttempts.value) * 100);
  });

  // 音频上下文
  let audioCtx: AudioContext | null = null;
  let oscillator: OscillatorNode | null = null;

  const startPress = () => {
    startTime.value = Date.now();
    isPressing.value = true;
    startSound();
  };

  const endPress = () => {
    const duration = Date.now() - startTime.value;
    stopSound();
    isPressing.value = false;

    if (duration < 10) return; // 忽略过短的杂音

    const bit = duration < 250 ? '.' : '-';
    userInput.value.push(bit);

    checkProgress();
  };

  const checkProgress = () => {
    const currentInput = userInput.value.join('');
    const target = currentTask.morse;

    if (currentInput === target) {
      ElMessage.success({ message: '正确！', duration: 800 });
      correctAttempts.value++;
      totalAttempts.value++;
      streak.value++;
      setTimeout(nextLevel, 1000);
    } else if (!target.startsWith(currentInput)) {
      // 录入错误
      isWrong.value = true;
      totalAttempts.value++;
      streak.value = 0;
      setTimeout(() => {
        isWrong.value = false;
        clearInput();
      }, 500);
    }
  };

  const nextLevel = () => {
    const chars = Object.keys(morseCode);
    const next = chars[Math.floor(Math.random() * chars.length)];
    currentTask.char = next;
    currentTask.morse = morseCode[next];
    clearInput();
  };

  const clearInput = () => {
    userInput.value = [];
  };

  const startSound = () => {
    if (!audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);

    oscillator.connect(gain);
    gain.connect(audioCtx.destination);
    oscillator.start();
  };

  const stopSound = () => {
    if (oscillator) {
      oscillator.stop();
      oscillator.disconnect();
      oscillator = null;
    }
  };

  onMounted(() => {
    nextLevel();
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

  .header-left,
  .header-right {
    width: 140px;
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
    padding: 2rem;
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
  }

  .main-panel {
    padding: 40px 24px;
    text-align: center;
  }

  .status-bar {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin-bottom: 40px;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #94a3b8;
    font-weight: 600;
    text-transform: uppercase;
  }
  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
  }

  .question-box {
    margin-bottom: 40px;
  }
  .question-box .label {
    font-size: 0.9rem;
    color: #64748b;
  }
  .target-char {
    font-size: 5rem;
    font-weight: 900;
    color: #3b82f6;
    line-height: 1.2;
    transition: transform 0.2s;
  }
  .target-morse {
    font-size: 1.25rem;
    color: #94a3b8;
    font-family: monospace;
    letter-spacing: 4px;
  }

  .input-display {
    background: #f8fafc;
    border: 2px dashed #e2e8f0;
    border-radius: 12px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 40px;
  }

  .morse-sequence {
    font-size: 2rem;
    font-family: monospace;
    letter-spacing: 8px;
    color: #1e293b;
  }
  .placeholder {
    font-size: 0.9rem;
    color: #cbd5e1;
    letter-spacing: normal;
  }

  .tap-button {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    border: none;
    background: #fff;
    box-shadow:
      0 10px 20px rgba(0, 0, 0, 0.1),
      inset 0 2px 5px rgba(255, 255, 255, 1);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.1s;
    margin: 0 auto;
    user-select: none;
  }

  .tap-button:active {
    transform: scale(0.92);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background: #eff6ff;
  }

  .button-inner {
    font-size: 2rem;
    color: #3b82f6;
    height: 40px;
    display: flex;
    align-items: center;
  }

  .tap-button span {
    font-size: 0.7rem;
    font-weight: 700;
    color: #64748b;
  }

  .pulse {
    width: 20px;
    height: 20px;
    background: #3b82f6;
    border-radius: 50%;
    animation: pulse-ring 1s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
  }

  @keyframes pulse-ring {
    0% {
      transform: scale(0.33);
    }
    80%,
    100% {
      opacity: 0;
    }
  }

  .hint-text {
    margin-top: 20px;
    font-size: 0.8rem;
    color: #94a3b8;
  }

  .morse-table-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .table-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #f8fafc;
    padding: 8px;
    border-radius: 6px;
  }

  .table-item .char {
    font-weight: 700;
    color: #1e293b;
  }
  .table-item .code {
    font-size: 0.7rem;
    color: #64748b;
    font-family: monospace;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }

  .shake {
    animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    color: #ef4444 !important;
  }

  @keyframes shake {
    10%,
    90% {
      transform: translate3d(-1px, 0, 0);
    }
    20%,
    80% {
      transform: translate3d(2px, 0, 0);
    }
    30%,
    50%,
    70% {
      transform: translate3d(-4px, 0, 0);
    }
    40%,
    60% {
      transform: translate3d(4px, 0, 0);
    }
  }
</style>
