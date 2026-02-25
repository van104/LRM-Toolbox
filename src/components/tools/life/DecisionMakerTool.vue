<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">随机<span>.决策()</span></h1>
        <div style="width: 120px"></div>
      </header>

      <div class="brutal-grid main-layout">
        <div class="brutal-pane wheel-pane">
          <div class="pane-header bg-yellow">
            <span>🎡 转盘区域</span>
          </div>
          <div class="wheel-body">
            <div class="wheel-wrapper">
              <div
                class="pointer"
                :style="{ transform: `translateX(-50%) rotate(${pointerRotation}deg)` }"
              ></div>
              <canvas ref="canvasRef" width="500" height="500" class="wheel-canvas"></canvas>
              <div class="center-button" @click="spin">
                <span>{{ isSpinning ? '转动中' : '开始' }}</span>
              </div>
            </div>

            <div v-if="result" class="result-show">
              <div class="result-box">🎉 结果：{{ result }}</div>
            </div>
          </div>
        </div>

        <div class="brutal-pane options-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">⚙ 决策选项</span>
          </div>
          <div class="options-body">
            <div class="preset-buttons">
              <button class="brutal-action-btn" @click="loadPreset('food')">中午吃啥</button>
              <button class="brutal-action-btn" @click="loadPreset('truth')">真心话</button>
              <button class="brutal-action-btn" @click="loadPreset('dare')">大冒险</button>
              <button class="brutal-action-btn" @click="loadPreset('number')">随机数</button>
            </div>

            <div class="options-list">
              <div v-for="(opt, index) in options" :key="index" class="option-row">
                <input
                  v-model="options[index]"
                  class="brutal-input full"
                  placeholder="输入选项内容"
                />
                <button
                  class="del-btn"
                  :disabled="options.length <= 2"
                  @click="removeOption(index)"
                >
                  ✕
                </button>
              </div>
            </div>

            <div class="action-row">
              <button class="brutal-action-btn primary" @click="addOption">+ 添加选项</button>
              <button class="brutal-action-btn danger" @click="clearOptions">清空</button>
            </div>
          </div>
        </div>
      </div>

      <div class="brutal-status info">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i">© 2026 LRM工具箱 - 随机决策 // &nbsp;</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, watch, nextTick } from 'vue';
  import { ElMessage } from 'element-plus';

  const canvasRef = ref(null);
  const options = ref(['披萨', '火锅', '烤肉', '麻辣烫', '汉堡', '寿司']);
  const isSpinning = ref(false);
  const result = ref('');
  const pointerRotation = ref(0);

  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFA07A',
    '#98D8C8',
    '#F7D794',
    '#778BEB',
    '#786FA6',
    '#F8A5C2',
    '#63CDDA'
  ];

  const presets = {
    food: ['披萨', '火锅', '烤肉', '麻辣烫', '汉堡', '寿司', '盖饭', '面条'],
    truth: [
      '你的初恋是什么时候？',
      '最糗的一件事是什么？',
      '手机里最近的一条短信内容？',
      '最不喜欢的人是谁？'
    ],
    dare: ['模仿一个著名的明星', '向第5个联系人发"我喜欢你"', '绕场跑一圈', '做10个俯卧撑'],
    number: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
  };

  const drawWheel = () => {
    const canvas = canvasRef.value;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    const angleStep = (Math.PI * 2) / options.value.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    options.value.forEach((opt, i) => {
      const startAngle = i * angleStep;
      const endAngle = (i + 1) * angleStep;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + angleStep / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#111';
      ctx.font = 'bold 18px "Syne", "Noto Sans SC", sans-serif';
      ctx.fillText(opt, radius - 30, 8);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(centerX, centerY, 45, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 4;
    ctx.stroke();
  };

  const spin = () => {
    if (isSpinning.value || options.value.length < 2) return;

    isSpinning.value = true;
    result.value = '';

    const spinRotation = 1800 + Math.random() * 3600;
    const startTime = performance.now();
    const duration = 4000;

    const animate = currentTime => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentRotation = ease * spinRotation;

      const canvas = canvasRef.value;
      if (canvas) {
        canvas.style.transform = `rotate(${currentRotation}deg)`;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        isSpinning.value = false;
        const finalRotation = currentRotation % 360;
        const anglePerOption = 360 / options.value.length;
        let index = Math.floor(((360 - (finalRotation % 360) + 270) % 360) / anglePerOption);
        result.value = options.value[index];
        ElMessage.success(`🎉 结果是：${result.value}`);
      }
    };

    requestAnimationFrame(animate);
  };

  const addOption = () => {
    options.value.push('');
    nextTick(() => drawWheel());
  };

  const removeOption = index => {
    options.value.splice(index, 1);
  };

  const clearOptions = () => {
    options.value = ['', ''];
  };

  const loadPreset = type => {
    options.value = [...presets[type]];
  };

  watch(options, () => drawWheel(), { deep: true });
  onMounted(() => drawWheel());
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

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
    max-width: 1200px;
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
    text-shadow: 4px 4px 0px #ffd900;
  }
  .brutal-title span {
    color: #ffd900;
    text-shadow: 4px 4px 0px #111;
    letter-spacing: 0;
  }

  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.25rem;
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

  .main-layout {
    display: grid;
    grid-template-columns: 1fr 380px;
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
    font-size: 1.15rem;
  }

  .bg-yellow {
    background: #ffd900;
  }
  .bg-blue {
    background: #4b7bff;
    color: #fff;
  }
  .text-white {
    color: #fff;
  }

  /* Wheel */
  .wheel-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    min-height: 550px;
  }

  .wheel-wrapper {
    position: relative;
    width: 400px;
    height: 400px;
  }

  .wheel-canvas {
    width: 400px;
    height: 400px;
    transition: transform 0s cubic-bezier(0.2, 0, 0, 1);
  }

  .pointer {
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 60px;
    background: #ff4b4b;
    clip-path: polygon(50% 100%, 0 0, 100% 0);
    z-index: 10;
  }

  .center-button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 85px;
    height: 85px;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 4px 4px 0px #111;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 20;
    font-weight: 800;
    font-size: 1.1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    transition: all 0.1s;
  }
  .center-button:hover {
    transform: translate(-50%, -50%) translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }
  .center-button:active {
    transform: translate(-50%, -50%) translate(4px, 4px);
    box-shadow: 0px 0px 0px #111;
  }

  .result-show {
    margin-top: 2rem;
  }

  .result-box {
    background: #00e572;
    border: 4px solid #111;
    box-shadow: 6px 6px 0px #111;
    padding: 1rem 2rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.5rem;
  }

  /* Options */
  .options-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .preset-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .brutal-action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.5rem 1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.9rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }
  .brutal-action-btn.primary {
    background: #00e572;
  }
  .brutal-action-btn.danger {
    background: #ff4b4b;
    color: #fff;
  }
  .brutal-action-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }
  .brutal-action-btn:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }

  .options-list {
    flex: 1;
    overflow-y: auto;
    max-height: 400px;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .option-row {
    display: flex;
    gap: 0.5rem;
  }

  .brutal-input {
    border: 3px solid #111;
    padding: 0.5rem 0.8rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 0.95rem;
    background: #fff;
    box-shadow: 3px 3px 0px #111;
    outline: none;
  }
  .brutal-input.full {
    flex: 1;
  }

  .del-btn {
    background: #ff4b4b;
    color: #fff;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #111;
    cursor: pointer;
    font-weight: 800;
    padding: 0 0.6rem;
    transition: all 0.1s;
  }
  .del-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }
  .del-btn:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }
  .del-btn:disabled {
    background: #eee;
    color: #aaa;
    border-color: #aaa;
    box-shadow: 2px 2px 0px #aaa;
    cursor: not-allowed;
  }

  .action-row {
    display: flex;
    gap: 0.75rem;
  }
  .action-row .brutal-action-btn {
    flex: 1;
    text-align: center;
  }

  /* Status */
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

  @media (max-width: 1024px) {
    .main-layout {
      grid-template-columns: 1fr;
    }
    .wheel-wrapper {
      width: 300px;
      height: 300px;
    }
    .wheel-canvas {
      width: 300px;
      height: 300px;
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
  [data-theme='dark'] .brutal-status,
  [data-theme='dark'] .brutal-action-btn {
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
  [data-theme='dark'] .brutal-input {
    background: #222;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-action-btn {
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:hover {
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn.primary {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .brutal-action-btn.danger {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .del-btn {
    background: #cc0000;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .del-btn:hover {
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .del-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }
  [data-theme='dark'] .center-button {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
    color: #eee;
  }
  [data-theme='dark'] .result-box {
    background: #00994c;
    border-color: #eee;
    box-shadow: 6px 6px 0px #eee;
    color: #fff;
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
  [data-theme='dark'] .pointer {
    background: #cc0000;
  }
</style>
