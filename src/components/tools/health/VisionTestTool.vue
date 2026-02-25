<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">健康<span>.视力保护()</span></h1>
      </header>

      <main class="tool-content">
        <!-- Custom Tabs -->
        <div class="brutal-pane tabs-pane mx-auto mb-8">
          <button
            class="brutal-tab bg-white"
            :class="{ 'active-tab': activeTab === 'test' }"
            @click="activeTab = 'test'"
          >
            👀 视力自测
          </button>
          <button
            class="brutal-tab bg-white"
            :class="{ 'active-tab': activeTab === 'timer' }"
            @click="activeTab = 'timer'"
          >
            ⏱ 护眼计时器
          </button>
        </div>

        <!-- Vision Test Tab -->
        <div v-show="activeTab === 'test'" class="brutal-pane main-pane mx-auto bg-yellow">
          <div class="pane-header bg-black flex-between">
            <span class="text-white">选择测试类型</span>
          </div>

          <div class="pane-body padding-large text-center">
            <div class="test-selector mb-8">
              <button
                class="brutal-radio-btn"
                :class="{ 'radio-active': currentTest === 'color' }"
                @click="currentTest = 'color'"
              >
                色盲/色弱
              </button>
              <button
                class="brutal-radio-btn"
                :class="{ 'radio-active': currentTest === 'astigmatism' }"
                @click="currentTest = 'astigmatism'"
              >
                散光测试
              </button>
              <button
                class="brutal-radio-btn"
                :class="{ 'radio-active': currentTest === 'grid' }"
                @click="currentTest = 'grid'"
              >
                黄斑病变网格
              </button>
            </div>

            <div class="test-viewport bg-white brutal-card">
              <!-- Color Test -->
              <div v-if="currentTest === 'color'" class="test-item">
                <div class="plate-container">
                  <img :src="colorPlates[currentPlate].url" class="test-img brutal-border" />

                  <div class="plate-nav mt-6">
                    <button
                      class="brutal-icon-btn"
                      :disabled="currentPlate === 0"
                      @click="prevPlate"
                    >
                      ←
                    </button>
                    <span class="plate-indicator"
                      >卡片 {{ currentPlate + 1 }} / {{ colorPlates.length }}</span
                    >
                    <button
                      class="brutal-icon-btn"
                      :disabled="currentPlate === colorPlates.length - 1"
                      @click="nextPlate"
                    >
                      →
                    </button>
                  </div>
                </div>

                <div class="test-info mt-8">
                  <h4 class="test-title">色觉筛查</h4>
                  <p class="test-hint">
                    请识别上方图中的数字。如果您无法识别，可能存在红绿色盲/色弱。
                  </p>

                  <div class="ans-box mt-4">
                    <button class="brutal-btn small-btn" @click="showAns = !showAns">
                      {{ showAns ? '隐藏答案 ✖' : '显示答案 👀' }}
                    </button>
                    <div v-if="showAns" class="ans-text mt-4">
                      答案是：<strong>{{ colorPlates[currentPlate].ans }}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Astigmatism Test -->
              <div v-if="currentTest === 'astigmatism'" class="test-item">
                <div class="astigmatism-chart mb-8">
                  <div
                    v-for="n in 12"
                    :key="n"
                    class="ast-line"
                    :style="{ transform: `rotate(${(n - 1) * 30}deg)` }"
                  ></div>
                </div>

                <div class="test-info">
                  <h4 class="test-title">散光检测图</h4>
                  <p class="test-hint">
                    请盖住一只眼单眼观察，注视图中心虚点。<br />如果您感觉某些线条比其他线条更粗、更黑，可能存在散光。
                  </p>
                </div>
              </div>

              <!-- Grid Test -->
              <div v-if="currentTest === 'grid'" class="test-item">
                <div class="amsler-grid mb-8"></div>

                <div class="test-info">
                  <h4 class="test-title">阿姆斯勒方格表</h4>
                  <p class="test-hint">
                    用于检测黄斑病变。<br />请注视中心黑点。如果您发现网格线条出现扭曲、断裂或有黑影遮挡，请及时就医。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Timer Tab -->
        <div v-show="activeTab === 'timer'" class="brutal-pane timer-pane mx-auto bg-green">
          <div class="pane-body padding-large text-center">
            <div class="timer-visual mt-4 mb-8">
              <div
                class="brutal-timer-circle"
                :class="[
                  timerStatus === '工作' ? 'border-primary' : 'border-success',
                  timerRunning ? 'is-running' : ''
                ]"
              >
                <div class="timer-content">
                  <span class="time-text">{{ formattedTime }}</span>
                  <span
                    class="status-tag"
                    :class="timerStatus === '工作' ? 'bg-primary' : 'bg-success'"
                    >{{ timerStatus }}</span
                  >
                </div>

                <!-- Custom visualizer line -->
                <svg class="progress-ring" width="260" height="260">
                  <circle
                    cx="130"
                    cy="130"
                    r="120"
                    fill="transparent"
                    stroke-width="12"
                    class="ring-bg"
                  ></circle>
                  <circle
                    cx="130"
                    cy="130"
                    r="120"
                    fill="transparent"
                    stroke-width="12"
                    class="ring-fill"
                    :stroke-dasharray="753.98"
                    :stroke-dashoffset="753.98 * ((100 - timerPercent) / 100)"
                  ></circle>
                </svg>
              </div>
            </div>

            <div class="timer-controls">
              <button
                class="brutal-action-btn large-btn"
                :class="timerRunning ? 'bg-black text-white' : 'bg-primary text-white'"
                @click="toggleTimer"
              >
                {{ timerRunning ? '⏸ 暂停' : timerStatus === '工作' ? '▶ 开始专注' : '▶ 开始远眺' }}
              </button>
              <button class="brutal-action-btn large-btn bg-white" @click="resetTimer">
                ↻ 重置
              </button>
            </div>

            <div class="rule-box mt-8 bg-white brutal-card">
              <h4 class="rule-title">20-20-20 法则</h4>
              <p class="rule-text">
                科学护眼：每看屏幕 <strong>20分钟</strong>，请放松并由窗外远眺
                <strong>20英尺</strong> (约6米) 外的目标 <strong>20秒</strong>。
              </p>
            </div>
          </div>
        </div>

        <div class="disclaimer-brutal mt-8 mx-auto" style="max-width: 800px">
          <strong>⚠️ 医学提示</strong>
          <p>
            以上工具仅供初步的自我初步筛查参考，不能替代专业的医疗诊断。如感眼部严重不适、视力骤降，请立即切断屏幕使用，并咨询专业眼科医生。
          </p>
        </div>
      </main>

      <footer class="footer mt-8">© 2026 LRM工具箱 - 视力自测与保护</footer>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onUnmounted } from 'vue';

  // Custom simple notification substitution
  const showToast = message => {
    alert(message); // fallback simple brutal alert
  };

  const activeTab = ref('test');
  const currentTest = ref('color');
  const showAns = ref(false);

  const currentPlate = ref(0);
  const colorPlates = [
    { url: 'https://img.lrm123.site/i/2026/02/02/xdr6xs.jpg', ans: '78' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Ishihara_9.png', ans: '74' },
    { url: 'https://img.lrm123.site/i/2026/02/02/xdr5nc.png', ans: '5' },
    { url: 'https://img.lrm123.site/i/2026/02/02/xdrcoc.webp', ans: '12' }
  ];

  const nextPlate = () => {
    if (currentPlate.value < colorPlates.length - 1) {
      currentPlate.value++;
      showAns.value = false;
    }
  };

  const prevPlate = () => {
    if (currentPlate.value > 0) {
      currentPlate.value--;
      showAns.value = false;
    }
  };

  const timerRunning = ref(false);
  const timeLeft = ref(20 * 60);
  const timerStatus = ref('工作');
  let interval = null;

  const timerPercent = computed(() => {
    const total = timerStatus.value === '工作' ? 20 * 60 : 20;
    return ((total - timeLeft.value) / total) * 100;
  });

  const formattedTime = computed(() => {
    const m = Math.floor(timeLeft.value / 60);
    const s = timeLeft.value % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  });

  const toggleTimer = () => {
    if (timerRunning.value) {
      clearInterval(interval);
      timerRunning.value = false;
    } else {
      timerRunning.value = true;
      interval = setInterval(() => {
        if (timeLeft.value > 0) {
          timeLeft.value--;
          document.title = `${formattedTime.value} - 护眼提醒`;
        } else {
          handleTimerEnd();
        }
      }, 1000);
    }
  };

  const handleTimerEnd = () => {
    clearInterval(interval);
    timerRunning.value = false;
    document.title = 'LRM工具箱';

    if (timerStatus.value === '工作') {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {});
      showToast('护眼提醒：工作了20分钟，请起身远眺 20 秒吧！');
      timerStatus.value = '放松';
      timeLeft.value = 20;
      toggleTimer();
    } else {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {});
      showToast('休息完成：休息结束，可以继续工作了。');
      timerStatus.value = '工作';
      timeLeft.value = 20 * 60;
    }
  };

  const resetTimer = () => {
    clearInterval(interval);
    timerRunning.value = false;
    timerStatus.value = '工作';
    timeLeft.value = 20 * 60;
    document.title = 'LRM工具箱';
  };

  onUnmounted(() => {
    clearInterval(interval);
    document.title = 'LRM工具箱';
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
    max-width: 1000px;
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
    font-size: 1.1rem;
    font-weight: 900;
    cursor: pointer;
    box-shadow: 4px 4px 0 #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }
  .brutal-btn.small-btn {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    box-shadow: 2px 2px 0 #111;
  }
  .brutal-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #111;
  }
  .brutal-btn.small-btn:hover {
    box-shadow: 4px 4px 0 #111;
  }
  .brutal-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0 0 0 #111;
  }

  .mx-auto {
    margin-left: auto;
    margin-right: auto;
  }

  .tabs-pane {
    width: 100%;
    max-width: 600px;
    display: flex;
    flex-direction: row;
    border: 4px solid #111;
    box-shadow: 8px 8px 0 #111;
    min-width: 0;
  }
  .brutal-tab {
    flex: 1;
    border: none;
    border-right: 4px solid #111;
    padding: 1.25rem 1rem;
    font-size: 1.1rem;
    font-weight: 900;
    font-family: 'Noto Sans SC', sans-serif;
    cursor: pointer;
    transition: background 0.1s;
  }
  .brutal-tab:last-child {
    border-right: none;
  }
  .brutal-tab:hover:not(.active-tab) {
    background: #fdfae5;
  }
  .active-tab {
    background: #111;
    color: #000;
  }

  .brutal-pane {
    width: 100%;
    display: flex;
    flex-direction: column;
    border: 4px solid #111;
    box-shadow: 12px 12px 0 #111;
    min-width: 0;
  }
  .main-pane {
    max-width: 800px;
  }
  .bg-white {
    background: #fff;
  }
  .bg-yellow {
    background: #ffd900;
  }
  .bg-green {
    background: #d1fae5;
  }
  .bg-black {
    background: #111;
  }
  .bg-primary {
    background: #4b7bff;
    color: white;
  }
  .bg-success {
    background: #10b981;
    color: white;
  }
  .text-white {
    color: #fff;
  }

  .pane-header {
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    font-size: 1.25rem;
  }
  .flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .pane-body {
    padding: 2rem;
    flex: 1;
  }
  .padding-large {
    padding: 3rem;
  }
  .text-center {
    text-align: center;
  }

  .test-selector {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    border: 4px solid #111;
    box-shadow: 6px 6px 0 #111;
    background: #fff;
  }
  .brutal-radio-btn {
    flex: 1;
    border: none;
    border-right: 3px solid #111;
    padding: 1rem;
    font-family: 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1.1rem;
    background: #fff;
    cursor: pointer;
    transition: background 0.1s;
    min-width: 120px;
  }
  .brutal-radio-btn:last-child {
    border-right: none;
  }
  .brutal-radio-btn:hover:not(.radio-active) {
    background: #f5f5f5;
  }
  .radio-active {
    background: #4b7bff;
    color: white;
  }

  .brutal-card {
    border: 4px solid #111;
    padding: 2rem;
    box-shadow: inset 4px 4px 0 rgba(0, 0, 0, 0.05);
  }

  .plate-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .test-img {
    width: 300px;
    height: 300px;
    border-radius: 50%;
    object-fit: cover;
  }
  .brutal-border {
    border: 8px solid #111;
    box-shadow: 8px 8px 0 #111;
  }

  .plate-nav {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }
  .plate-indicator {
    font-weight: 900;
    font-size: 1.2rem;
    font-family: 'IBM Plex Mono', monospace;
  }

  .brutal-icon-btn {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #111;
    color: #fff;
    border: 4px solid #111;
    font-weight: 900;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow:
      4px 4px 0 #fff,
      6px 6px 0 #111;
    transition: transform 0.1s;
  }
  .brutal-icon-btn:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow:
      4px 4px 0 #fff,
      8px 8px 0 #111;
  }
  .brutal-icon-btn:active:not(:disabled) {
    transform: translate(2px, 2px);
    box-shadow:
      4px 4px 0 #fff,
      2px 2px 0 #111;
  }
  .brutal-icon-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
    box-shadow: none;
  }

  .test-info {
    max-width: 500px;
    margin: 0 auto;
  }
  .test-title {
    font-size: 1.5rem;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    margin: 0 0 1rem;
  }
  .test-hint {
    font-size: 1.1rem;
    font-weight: bold;
    line-height: 1.5;
    margin: 0;
    color: #444;
  }

  .ans-text {
    font-size: 1.5rem;
    font-weight: 900;
    border: 2px dashed #111;
    padding: 0.5rem;
    background: #fdfae5;
  }
  .ans-text strong {
    color: #ff4b4b;
    font-size: 2rem;
  }

  .astigmatism-chart {
    width: 300px;
    height: 300px;
    border: 4px solid #111;
    border-radius: 50%;
    position: relative;
    margin: 0 auto;
    background: #fff;
    box-shadow: 8px 8px 0 #111;
  }
  .astigmatism-chart::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 12px;
    height: 12px;
    background: #111;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
  }
  .ast-line {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 2px;
    height: 280px;
    background: #111;
    transform-origin: center;
    margin-top: -140px;
    z-index: 1;
  }

  .amsler-grid {
    width: 300px;
    height: 300px;
    background-image:
      linear-gradient(#111 2px, transparent 2px), linear-gradient(90deg, #111 2px, transparent 2px);
    background-size: 20px 20px;
    border: 4px solid #111;
    position: relative;
    margin: 0 auto;
    background-color: #fff;
    box-shadow: 8px 8px 0 #111;
  }
  .amsler-grid::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 10px;
    height: 10px;
    background: #111;
    border-radius: 50%;
    transform: translate(-100%, -90%);
  }

  /* Timer styles */
  .brutal-timer-circle {
    position: relative;
    width: 260px;
    height: 260px;
    border-radius: 50%;
    background: #fff;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 8px solid #111;
    box-shadow: 12px 12px 0 #111;
    transition: transform 0.2s;
  }
  .brutal-timer-circle.is-running {
    animation: bounce 1s infinite alternate;
  }

  @keyframes bounce {
    0% {
      transform: scale(1);
    }
    100% {
      transform: scale(1.02);
    }
  }

  .border-primary {
    border-color: #111;
  }
  .border-success {
    border-color: #111;
  }

  .progress-ring {
    position: absolute;
    top: -8px;
    left: -8px;
    transform: rotate(-90deg);
    border-radius: 50%;
    z-index: 0;
    pointer-events: none;
  }
  .ring-bg {
    stroke: #e5e5e5;
  }
  .ring-fill {
    stroke: #4b7bff;
    transition: stroke-dashoffset 0.5s linear;
  }
  .border-success .ring-fill {
    stroke: #10b981;
  }

  .timer-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .time-text {
    font-size: 4.5rem;
    font-weight: 900;
    font-family: 'IBM Plex Mono', monospace;
    line-height: 1;
    text-shadow: 4px 4px 0 #ccc;
    color: #111;
  }
  .status-tag {
    margin-top: 1rem;
    padding: 0.25rem 1rem;
    font-weight: 900;
    font-size: 1.1rem;
    border: 3px solid #111;
    font-family: 'Noto Sans SC', sans-serif;
  }

  .timer-controls {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }
  .brutal-action-btn {
    background: #fff;
    border: 4px solid #111;
    font-family: 'Noto Sans SC', sans-serif;
    font-weight: 900;
    cursor: pointer;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
    box-shadow: 6px 6px 0 #111;
  }
  .brutal-action-btn.large-btn {
    padding: 1rem 2rem;
    font-size: 1.25rem;
  }
  .brutal-action-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0 #111;
  }
  .brutal-action-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0 0 0 #111;
  }

  .text-white {
    color: #000;
  }

  .rule-box {
    border: 4px dashed #111;
    box-shadow: none;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }
  .rule-title {
    font-size: 1.5rem;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    margin: 0 0 1rem;
    color: #1e40af;
  }
  .rule-text {
    font-size: 1.1rem;
    font-weight: bold;
    margin: 0;
    line-height: 1.6;
  }
  .rule-text strong {
    font-size: 1.25rem;
    color: #ff4b4b;
    margin: 0 2px;
  }

  .disclaimer-brutal {
    border: 3px dashed #111;
    padding: 1.25rem;
    background: #fff;
    font-size: 0.95rem;
    font-weight: bold;
    line-height: 1.5;
  }
  .disclaimer-brutal strong {
    display: block;
    font-size: 1.1rem;
    color: #ff4b4b;
    margin-bottom: 0.5rem;
    font-family: 'Noto Sans SC', sans-serif;
    font-weight: 900;
  }
  .disclaimer-brutal p {
    margin: 0;
  }

  .mb-8 {
    margin-bottom: 2rem;
  }
  .mt-4 {
    margin-top: 1rem;
  }
  .mt-6 {
    margin-top: 1.5rem;
  }
  .mt-8 {
    margin-top: 2rem;
  }

  .footer {
    text-align: center;
    font-weight: 900;
    margin-bottom: 2rem;
  }

  @media (max-width: 900px) {
    .brutal-title {
      font-size: 2.2rem;
    }
    .test-selector {
      flex-direction: column;
    }
    .brutal-radio-btn {
      border-right: none;
      border-bottom: 3px solid #111;
    }
    .brutal-radio-btn:last-child {
      border-bottom: none;
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
  [data-theme='dark'] .brutal-tab,
  [data-theme='dark'] .test-selector,
  [data-theme='dark'] .brutal-radio-btn,
  [data-theme='dark'] .brutal-card,
  [data-theme='dark'] .brutal-action-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .test-selector,
  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .brutal-timer-circle,
  [data-theme='dark'] .brutal-border,
  [data-theme='dark'] .astigmatism-chart,
  [data-theme='dark'] .amsler-grid {
    box-shadow: 6px 6px 0 #eee;
  }
  [data-theme='dark'] .brutal-btn:hover,
  [data-theme='dark'] .brutal-action-btn:hover {
    box-shadow: 9px 9px 0 #eee;
  }

  [data-theme='dark'] .bg-white {
    background: #1a1a1a;
  }
  [data-theme='dark'] .bg-yellow {
    background: #332700;
    border-color: #eee;
  }
  [data-theme='dark'] .bg-green {
    background: #003322;
    border-color: #eee;
  }
  [data-theme='dark'] .bg-black {
    background: #222;
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .bg-primary {
    background: #2a4eb2;
    color: #fff;
  }

  [data-theme='dark'] .brutal-tab {
    border-right-color: #eee;
  }
  [data-theme='dark'] .brutal-tab:hover:not(.active-tab) {
    background: #222;
  }
  [data-theme='dark'] .active-tab {
    background: #eee;
    color: #111;
  }

  [data-theme='dark'] .brutal-radio-btn {
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-radio-btn:hover:not(.radio-active) {
    background: #222;
  }
  [data-theme='dark'] .radio-active {
    background: #eee;
    color: #111;
  }

  [data-theme='dark'] .brutal-border {
    border-color: #eee;
  }
  [data-theme='dark'] .test-hint {
    color: #aaa;
  }

  [data-theme='dark'] .ans-text {
    background: #111;
    border-color: #eee;
  }
  [data-theme='dark'] .ans-text strong {
    color: #ff8b8b;
  }

  [data-theme='dark'] .astigmatism-chart {
    background: #eee;
    box-shadow: 8px 8px 0 #eee;
    border-color: #eee;
  }
  [data-theme='dark'] .amsler-grid {
    background-color: #eee;
    box-shadow: 8px 8px 0 #eee;
    border-color: #eee;
  }

  [data-theme='dark'] .brutal-timer-circle {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 12px 12px 0 #eee;
  }
  [data-theme='dark'] .ring-bg {
    stroke: #333;
  }
  [data-theme='dark'] .time-text {
    color: #eee;
    text-shadow: 4px 4px 0 #333;
  }
  [data-theme='dark'] .border-primary .ring-fill {
    stroke: #6b8cff;
  }

  [data-theme='dark'] .rule-box {
    border-color: #eee;
    background: #111;
  }
  [data-theme='dark'] .rule-title {
    color: #6b8cff;
  }
  [data-theme='dark'] .rule-text strong {
    color: #ff8b8b;
  }

  [data-theme='dark'] .disclaimer-brutal {
    background: #332200;
    border-color: #eee;
  }
  [data-theme='dark'] .disclaimer-brutal strong {
    color: #ff8b8b;
  }
  [data-theme='dark'] .disclaimer-brutal p {
    color: #ccc;
  }

  [data-theme='dark'] .brutal-icon-btn {
    background: #fff;
    color: #111;
    border-color: #eee;
    box-shadow:
      4px 4px 0 #333,
      6px 6px 0 #eee;
  }
  [data-theme='dark'] .brutal-icon-btn:hover:not(:disabled) {
    box-shadow:
      4px 4px 0 #333,
      8px 8px 0 #eee;
  }
</style>
