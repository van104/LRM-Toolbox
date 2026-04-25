<template>
  <div class="morse-trainer">
    <!-- 背景动态网格 -->
    <div class="grid-bg"></div>

    <!-- 扫描线效果 -->
    <div class="scanlines"></div>

    <!-- 信号波动画背景 -->
    <div class="signal-waves">
      <svg viewBox="0 0 1200 200" preserveAspectRatio="none">
        <path
          v-for="i in 3"
          :key="i"
          :class="['wave-path', `wave-${i}`]"
          d="M0,100 Q300,50 600,100 T1200,100"
        />
      </svg>
    </div>

    <header class="terminal-header">
      <button class="back-btn" @click="$router.back()">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <span>返回</span>
      </button>

      <div class="title-block">
        <div class="glitch-wrapper">
          <h1 class="title glitch" :data-text="'MORSE TRAINER'">MORSE TRAINER</h1>
        </div>
        <div class="subtitle">--- 通讯协议训练终端 v2.0 ---</div>
      </div>

      <button class="table-btn" @click="showTable = true">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
        <span>编码表</span>
      </button>
    </header>

    <main class="terminal-body">
      <!-- 状态仪表盘 -->
      <div class="dashboard">
        <div class="gauge" :class="{ active: streak > 0 }">
          <div class="gauge-ring">
            <svg viewBox="0 0 100 100">
              <circle class="gauge-bg" cx="50" cy="50" r="42" />
              <circle
                class="gauge-fill"
                cx="50"
                cy="50"
                r="42"
                :style="{ strokeDashoffset: 264 - (264 * accuracy) / 100 }"
              />
            </svg>
            <div class="gauge-center">
              <span class="gauge-value">{{ accuracy }}</span>
              <span class="gauge-unit">%</span>
            </div>
          </div>
          <div class="gauge-label">准确率</div>
        </div>

        <div class="streak-counter">
          <div class="streak-inner">
            <div class="streak-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div class="streak-info">
              <span class="streak-value">{{ streak }}</span>
              <span class="streak-label">连胜</span>
            </div>
          </div>
          <div class="streak-bar" :style="{ width: `${Math.min(streak * 10, 100)}%` }"></div>
        </div>
      </div>

      <!-- 训练区域 -->
      <div class="training-zone">
        <!-- 目标字符显示 -->
        <div class="target-display" :class="{ error: isWrong, success: isSuccess }">
          <div class="target-frame">
            <div class="corner tl"></div>
            <div class="corner tr"></div>
            <div class="corner bl"></div>
            <div class="corner br"></div>

            <div class="target-content">
              <div class="transmit-label"><span class="blink">▸</span> 发送信号</div>
              <div class="target-char">{{ currentTask.char }}</div>
              <div class="target-morse">{{ currentTask.morse }}</div>
            </div>
          </div>
        </div>

        <!-- 输入显示区 -->
        <div class="input-terminal">
          <div class="terminal-header-bar">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
            <span class="terminal-title">input.stream</span>
          </div>
          <div class="terminal-content">
            <div class="morse-stream">
              <transition-group name="morse-bit" tag="span">
                <span
                  v-for="(bit, i) in userInput"
                  :key="i"
                  :class="['bit', bit === '.' ? 'dot' : 'dash']"
                >
                  {{ bit === '.' ? '·' : '—' }}
                </span>
              </transition-group>
              <span class="cursor">█</span>
              <span v-if="userInput.length === 0" class="placeholder"> 等待信号输入... </span>
            </div>
          </div>
        </div>

        <!-- 发报按钮 -->
        <div class="transmitter">
          <div class="key-base">
            <button
              class="key-button"
              :class="{ pressed: isPressing }"
              @mousedown="startPress"
              @mouseup="endPress"
              @touchstart.prevent="startPress"
              @touchend.prevent="endPress"
            >
              <div class="key-top">
                <div class="key-indicator" :class="{ active: isPressing }"></div>
                <div class="key-label">TAP</div>
              </div>
              <div class="key-ring"></div>
            </button>
            <div class="key-shadow"></div>
          </div>

          <div class="key-instructions">
            <div class="instruction">
              <span class="key-hint dot">短按</span>
              <span class="key-result">· (点)</span>
            </div>
            <div class="instruction">
              <span class="key-hint dash">长按 &gt;250ms</span>
              <span class="key-result">— (划)</span>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <button class="action-btn skip" @click="nextLevel">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polygon points="5 4 15 12 5 20 5 4" />
              <line x1="19" y1="5" x2="19" y2="19" />
            </svg>
            <span>跳过</span>
          </button>
          <button class="action-btn clear" @click="clearInput">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
              />
            </svg>
            <span>清空</span>
          </button>
        </div>
      </div>
    </main>

    <!-- 编码对照表弹窗 -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="showTable" class="modal-overlay" @click.self="showTable = false">
          <div class="modal-content">
            <div class="modal-header">
              <h3>⬡ 摩斯电码标准对照表</h3>
              <button class="close-btn" @click="showTable = false">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div class="morse-grid">
              <div
                v-for="(code, char) in morseCode"
                :key="char"
                class="morse-item"
                @click="
                  currentTask.char = char;
                  currentTask.morse = code;
                  showTable = false;
                "
              >
                <span class="char">{{ char }}</span>
                <span class="code">
                  <span v-for="(c, i) in code" :key="i" :class="c === '.' ? 'dot' : 'dash'">
                    {{ c === '.' ? '·' : '—' }}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <footer class="terminal-footer">
      <span>LRM-TOOLBOX // MORSE PROTOCOL</span>
      <span class="divider">|</span>
      <span>{{ new Date().getFullYear() }}</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
  import { ElMessage } from 'element-plus';

  const showTable = ref(false);
  const userInput = ref<string[]>([]);
  const isPressing = ref(false);
  const isWrong = ref(false);
  const isSuccess = ref(false);
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

  // 音频
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

    if (duration < 10) return;

    const bit = duration < 250 ? '.' : '-';
    userInput.value.push(bit);

    checkProgress();
  };

  const checkProgress = () => {
    const currentInput = userInput.value.join('');
    const target = currentTask.morse;

    if (currentInput === target) {
      isSuccess.value = true;
      ElMessage.success({ message: '✓ 信号正确', duration: 800 });
      correctAttempts.value++;
      totalAttempts.value++;
      streak.value++;
      setTimeout(() => {
        isSuccess.value = false;
        nextLevel();
      }, 1200);
    } else if (!target.startsWith(currentInput)) {
      isWrong.value = true;
      totalAttempts.value++;
      streak.value = 0;
      setTimeout(() => {
        isWrong.value = false;
        clearInput();
      }, 600);
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
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);

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

  onUnmounted(() => {
    if (audioCtx) {
      audioCtx.close();
      audioCtx = null;
    }
  });
</script>

<style scoped>
  /* === 基础变量 === */
  .morse-trainer {
    --bg-primary: #0a0e14;
    --bg-secondary: #0d1117;
    --bg-card: #161b22;
    --border-color: #30363d;
    --text-primary: #e6edf3;
    --text-secondary: #7d8590;
    --text-muted: #484f58;
    --accent-cyan: #00d4aa;
    --accent-blue: #58a6ff;
    --accent-purple: #bc8cff;
    --error-color: #f85149;
    --success-color: #3fb950;

    --font-display: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
    --font-body: 'IBM Plex Sans', -apple-system, sans-serif;

    min-height: 100vh;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-family: var(--font-body);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  /* === 背景效果 === */
  .grid-bg {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(0, 212, 170, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 212, 170, 0.03) 1px, transparent 1px);
    background-size: 50px 50px;
    pointer-events: none;
    animation: grid-move 20s linear infinite;
  }

  @keyframes grid-move {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(50px, 50px);
    }
  }

  .scanlines {
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0, 0, 0, 0.1) 2px,
      rgba(0, 0, 0, 0.1) 4px
    );
    pointer-events: none;
    opacity: 0.3;
  }

  .signal-waves {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 200px;
    opacity: 0.15;
    pointer-events: none;
  }

  .signal-waves svg {
    width: 100%;
    height: 100%;
  }

  .wave-path {
    fill: none;
    stroke: var(--accent-cyan);
    stroke-width: 1;
  }

  .wave-1 {
    animation: wave-flow 8s linear infinite;
  }
  .wave-2 {
    animation: wave-flow 12s linear infinite;
    opacity: 0.6;
  }
  .wave-3 {
    animation: wave-flow 16s linear infinite;
    opacity: 0.3;
  }

  @keyframes wave-flow {
    0% {
      stroke-dashoffset: 0;
    }
    100% {
      stroke-dashoffset: -600;
    }
  }

  /* === 头部 === */
  .terminal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: linear-gradient(180deg, rgba(13, 17, 23, 0.95) 0%, transparent 100%);
    border-bottom: 1px solid var(--border-color);
    position: relative;
    z-index: 10;
  }

  .back-btn,
  .table-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: transparent;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    color: var(--text-secondary);
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .back-btn:hover,
  .table-btn:hover {
    border-color: var(--accent-cyan);
    color: var(--accent-cyan);
    box-shadow: 0 0 20px rgba(0, 212, 170, 0.2);
  }

  .title-block {
    text-align: center;
  }

  .title {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: 0.3em;
    color: var(--text-primary);
    margin: 0;
    text-shadow: 0 0 10px rgba(0, 212, 170, 0.5);
  }

  .glitch-wrapper {
    position: relative;
  }

  .glitch {
    position: relative;
  }

  .glitch::before,
  .glitch::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .glitch::before {
    color: var(--accent-cyan);
    animation: glitch-1 2s infinite linear alternate-reverse;
    clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
  }

  .glitch::after {
    color: var(--accent-purple);
    animation: glitch-2 3s infinite linear alternate-reverse;
    clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%);
  }

  @keyframes glitch-1 {
    0%,
    100% {
      transform: translate(0);
    }
    20% {
      transform: translate(-2px, 2px);
    }
    40% {
      transform: translate(-2px, -2px);
    }
    60% {
      transform: translate(2px, 2px);
    }
    80% {
      transform: translate(2px, -2px);
    }
  }

  @keyframes glitch-2 {
    0%,
    100% {
      transform: translate(0);
    }
    20% {
      transform: translate(2px, -2px);
    }
    40% {
      transform: translate(2px, 2px);
    }
    60% {
      transform: translate(-2px, -2px);
    }
    80% {
      transform: translate(-2px, 2px);
    }
  }

  .subtitle {
    font-family: var(--font-display);
    font-size: 0.7rem;
    color: var(--text-muted);
    letter-spacing: 0.2em;
    margin-top: 0.25rem;
  }

  /* === 主体 === */
  .terminal-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem 1.5rem;
    position: relative;
    z-index: 5;
  }

  /* === 仪表盘 === */
  .dashboard {
    display: flex;
    gap: 2rem;
    margin-bottom: 2rem;
    animation: fade-in-up 0.6s ease-out;
  }

  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .gauge {
    position: relative;
    animation: fade-in-up 0.6s ease-out 0.1s backwards;
  }

  .gauge-ring {
    width: 100px;
    height: 100px;
    position: relative;
  }

  .gauge-ring svg {
    transform: rotate(-90deg);
    width: 100%;
    height: 100%;
  }

  .gauge-bg {
    fill: none;
    stroke: var(--border-color);
    stroke-width: 6;
  }

  .gauge-fill {
    fill: none;
    stroke: var(--accent-cyan);
    stroke-width: 6;
    stroke-linecap: round;
    stroke-dasharray: 264;
    stroke-dashoffset: 264;
    transition: stroke-dashoffset 0.5s ease;
    filter: drop-shadow(0 0 6px var(--accent-cyan));
  }

  .gauge.active .gauge-fill {
    stroke: var(--success-color);
    filter: drop-shadow(0 0 6px var(--success-color));
  }

  .gauge-center {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: baseline;
    justify-content: center;
    padding-top: 32px;
  }

  .gauge-value {
    font-family: var(--font-display);
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .gauge-unit {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-left: 2px;
  }

  .gauge-label {
    text-align: center;
    font-size: 0.7rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.15em;
    margin-top: 0.5rem;
  }

  /* 连胜计数器 */
  .streak-counter {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1rem 1.25rem;
    min-width: 140px;
    position: relative;
    overflow: hidden;
    animation: fade-in-up 0.6s ease-out 0.2s backwards;
  }

  .streak-inner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .streak-icon {
    color: var(--accent-purple);
    filter: drop-shadow(0 0 8px rgba(188, 140, 255, 0.5));
  }

  .streak-info {
    display: flex;
    flex-direction: column;
  }

  .streak-value {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1;
  }

  .streak-label {
    font-size: 0.65rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .streak-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--accent-purple), var(--accent-cyan));
    transition: width 0.3s ease;
    box-shadow: 0 0 10px var(--accent-cyan);
  }

  /* === 训练区域 === */
  .training-zone {
    width: 100%;
    max-width: 420px;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* 目标显示 */
  .target-display {
    animation: fade-in-up 0.6s ease-out 0.3s backwards;
  }

  .target-frame {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 2rem;
    position: relative;
    transition: all 0.3s ease;
  }

  .target-display.error .target-frame {
    border-color: var(--error-color);
    box-shadow: 0 0 30px rgba(248, 81, 73, 0.2);
    animation: shake 0.4s ease;
  }

  .target-display.success .target-frame {
    border-color: var(--success-color);
    box-shadow: 0 0 30px rgba(63, 185, 80, 0.3);
  }

  @keyframes shake {
    0%,
    100% {
      transform: translateX(0);
    }
    20% {
      transform: translateX(-8px);
    }
    40% {
      transform: translateX(8px);
    }
    60% {
      transform: translateX(-4px);
    }
    80% {
      transform: translateX(4px);
    }
  }

  .corner {
    position: absolute;
    width: 20px;
    height: 20px;
    border-color: var(--accent-cyan);
    border-style: solid;
    opacity: 0.5;
  }

  .corner.tl {
    top: 8px;
    left: 8px;
    border-width: 2px 0 0 2px;
  }
  .corner.tr {
    top: 8px;
    right: 8px;
    border-width: 2px 2px 0 0;
  }
  .corner.bl {
    bottom: 8px;
    left: 8px;
    border-width: 0 0 2px 2px;
  }
  .corner.br {
    bottom: 8px;
    right: 8px;
    border-width: 0 2px 2px 0;
  }

  .target-content {
    text-align: center;
  }

  .transmit-label {
    font-size: 0.75rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.15em;
    margin-bottom: 0.75rem;
  }

  .blink {
    animation: blink 1s ease infinite;
    color: var(--accent-cyan);
  }

  @keyframes blink {
    0%,
    50%,
    100% {
      opacity: 1;
    }
    25%,
    75% {
      opacity: 0;
    }
  }

  .target-char {
    font-family: var(--font-display);
    font-size: 6rem;
    font-weight: 700;
    color: var(--accent-cyan);
    line-height: 1;
    text-shadow: 0 0 40px rgba(0, 212, 170, 0.4);
    transition: all 0.3s ease;
  }

  .target-display.error .target-char {
    color: var(--error-color);
    text-shadow: 0 0 40px rgba(248, 81, 73, 0.4);
  }

  .target-display.success .target-char {
    color: var(--success-color);
    text-shadow: 0 0 40px rgba(63, 185, 80, 0.4);
  }

  .target-morse {
    font-family: var(--font-display);
    font-size: 1.25rem;
    color: var(--text-secondary);
    letter-spacing: 0.5em;
    margin-top: 0.5rem;
  }

  /* 输入终端 */
  .input-terminal {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    overflow: hidden;
    animation: fade-in-up 0.6s ease-out 0.4s backwards;
  }

  .terminal-header-bar {
    background: rgba(0, 0, 0, 0.3);
    padding: 0.5rem 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border-bottom: 1px solid var(--border-color);
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .dot.red {
    background: #ff5f56;
  }
  .dot.yellow {
    background: #ffbd2e;
  }
  .dot.green {
    background: #27ca40;
  }

  .terminal-title {
    font-family: var(--font-display);
    font-size: 0.7rem;
    color: var(--text-muted);
    margin-left: 0.5rem;
  }

  .terminal-content {
    padding: 1.25rem;
    min-height: 60px;
  }

  .morse-stream {
    font-family: var(--font-display);
    font-size: 1.75rem;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 0.25em;
  }

  .bit {
    display: inline-block;
    transition: all 0.2s ease;
  }

  .bit.dot {
    color: var(--accent-cyan);
  }
  .bit.dash {
    color: var(--accent-purple);
  }

  .cursor {
    color: var(--accent-cyan);
    animation: cursor-blink 1s step-end infinite;
  }

  @keyframes cursor-blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }

  .placeholder {
    font-size: 0.9rem;
    color: var(--text-muted);
    font-style: italic;
  }

  /* 摩斯位动画 */
  .morse-bit-enter-active {
    animation: morse-bit-in 0.3s ease;
  }

  @keyframes morse-bit-in {
    from {
      opacity: 0;
      transform: scale(0.5) translateY(-10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  /* === 发报按钮 === */
  .transmitter {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    animation: fade-in-up 0.6s ease-out 0.5s backwards;
  }

  .key-base {
    position: relative;
  }

  .key-button {
    width: 130px;
    height: 130px;
    border-radius: 50%;
    border: none;
    background: linear-gradient(145deg, #1a2028, #141820);
    cursor: pointer;
    position: relative;
    box-shadow:
      0 10px 30px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(255, 255, 255, 0.05),
      inset 0 -5px 20px rgba(0, 0, 0, 0.3);
    transition: all 0.1s ease;
  }

  .key-button.pressed {
    transform: translateY(4px);
    box-shadow:
      0 5px 15px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(255, 255, 255, 0.05),
      inset 0 5px 20px rgba(0, 0, 0, 0.4);
  }

  .key-top {
    position: absolute;
    top: 10px;
    left: 10px;
    right: 10px;
    bottom: 10px;
    border-radius: 50%;
    background: linear-gradient(145deg, #252d38, #1a2028);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.3);
  }

  .key-indicator {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--text-muted);
    transition: all 0.2s ease;
  }

  .key-indicator.active {
    background: var(--accent-cyan);
    box-shadow:
      0 0 20px var(--accent-cyan),
      0 0 40px rgba(0, 212, 170, 0.3);
  }

  .key-label {
    font-family: var(--font-display);
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-muted);
    letter-spacing: 0.2em;
    transition: color 0.2s;
  }

  .key-button.pressed .key-label {
    color: var(--accent-cyan);
  }

  .key-ring {
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    border: 2px solid var(--border-color);
    pointer-events: none;
  }

  .key-shadow {
    position: absolute;
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 20px;
    background: radial-gradient(ellipse, rgba(0, 0, 0, 0.4) 0%, transparent 70%);
    border-radius: 50%;
  }

  .key-instructions {
    display: flex;
    gap: 2rem;
  }

  .instruction {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .key-hint {
    font-size: 0.7rem;
    color: var(--text-muted);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.05);
  }

  .key-hint.dot {
    border-left: 2px solid var(--accent-cyan);
  }
  .key-hint.dash {
    border-left: 2px solid var(--accent-purple);
  }

  .key-result {
    font-family: var(--font-display);
    font-size: 1rem;
    color: var(--text-secondary);
  }

  /* === 操作按钮 === */
  .action-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    animation: fade-in-up 0.6s ease-out 0.6s backwards;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1.25rem;
    background: transparent;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: var(--text-secondary);
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-btn:hover {
    border-color: var(--text-secondary);
    color: var(--text-primary);
  }

  .action-btn.skip:hover {
    border-color: var(--accent-blue);
    color: var(--accent-blue);
    box-shadow: 0 0 15px rgba(88, 166, 255, 0.2);
  }

  .action-btn.clear:hover {
    border-color: var(--error-color);
    color: var(--error-color);
    box-shadow: 0 0 15px rgba(248, 81, 73, 0.2);
  }

  /* === 弹窗 === */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 1rem;
  }

  .modal-content {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    width: 100%;
    max-width: 480px;
    max-height: 80vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--border-color);
  }

  .modal-header h3 {
    font-family: var(--font-display);
    font-size: 1rem;
    color: var(--text-primary);
    margin: 0;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: color 0.2s;
  }

  .close-btn:hover {
    color: var(--error-color);
  }

  .morse-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    padding: 1rem;
    overflow-y: auto;
  }

  .morse-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.75rem 0.5rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .morse-item:hover {
    background: rgba(0, 212, 170, 0.1);
    border-color: var(--accent-cyan);
  }

  .morse-item .char {
    font-family: var(--font-display);
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .morse-item .code {
    font-family: var(--font-display);
    font-size: 0.8rem;
    color: var(--text-muted);
    letter-spacing: 0.1em;
    margin-top: 0.25rem;
  }

  .morse-item .code .dot {
    color: var(--accent-cyan);
  }
  .morse-item .code .dash {
    color: var(--accent-purple);
  }

  /* 弹窗动画 */
  .modal-enter-active {
    animation: modal-in 0.3s ease;
  }

  .modal-leave-active {
    animation: modal-in 0.25s ease reverse;
  }

  @keyframes modal-in {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  /* === 页脚 === */
  .terminal-footer {
    text-align: center;
    padding: 1rem;
    font-family: var(--font-display);
    font-size: 0.7rem;
    color: var(--text-muted);
    letter-spacing: 0.1em;
    border-top: 1px solid var(--border-color);
    background: linear-gradient(0deg, rgba(10, 14, 20, 0.95) 0%, transparent 100%);
  }

  .terminal-footer .divider {
    margin: 0 0.75rem;
    opacity: 0.3;
  }

  /* === 响应式 === */
  @media (max-width: 480px) {
    .terminal-header {
      padding: 0.75rem 1rem;
    }

    .title {
      font-size: 1.1rem;
      letter-spacing: 0.15em;
    }

    .subtitle {
      font-size: 0.6rem;
    }

    .dashboard {
      gap: 1rem;
    }

    .gauge-ring {
      width: 80px;
      height: 80px;
    }

    .gauge-value {
      font-size: 1.5rem;
    }

    .streak-counter {
      min-width: 120px;
      padding: 0.75rem 1rem;
    }

    .target-char {
      font-size: 4.5rem;
    }

    .key-button {
      width: 110px;
      height: 110px;
    }

    .key-instructions {
      gap: 1rem;
    }
  }
</style>
