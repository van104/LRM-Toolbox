<template>
  <div class="lucky-draw-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>抽奖大转盘</h1>
        <span class="nav-subtitle">Lucky Draw Wheel</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="layout-grid">
        <div class="wheel-section glass-card">
          <div class="wheel-container">
            <div class="wheel-pointer" :class="{ 'is-spinning': isSpinning }"></div>
            <div class="wheel-canvas-wrap" :style="wheelStyle">
              <canvas ref="wheelCanvas" width="400" height="400"></canvas>
            </div>
            <button
              class="spin-btn"
              :disabled="isSpinning || options.length < 2"
              @click="startSpin"
            >
              {{ isSpinning ? '抽奖中...' : '开始' }}
            </button>
          </div>
          <div v-if="result" class="result-display">
            <p class="result-label">恭喜你抽中：</p>
            <h2 class="result-text">{{ result.text }}</h2>
          </div>
        </div>

        <div class="settings-section glass-card">
          <div class="section-header">
            <h3>奖项设置</h3>
            <button class="add-btn" @click="addOption">
              <el-icon>
                <Plus />
              </el-icon>
              添加奖项
            </button>
          </div>

          <div class="options-list">
            <div v-for="(opt, index) in options" :key="opt.id" class="option-item">
              <div class="opt-color" :style="{ backgroundColor: opt.color }"></div>
              <input
                v-model="opt.text"
                placeholder="奖项文本"
                class="opt-input"
                @change="drawWheel"
              />
              <div class="opt-weight">
                <span>权重:</span>
                <input
                  v-model.number="opt.weight"
                  type="number"
                  min="1"
                  max="100"
                  class="weight-input"
                  @change="drawWheel"
                />
              </div>
              <button class="del-btn" :disabled="options.length <= 2" @click="removeOption(index)">
                <el-icon>
                  <Delete />
                </el-icon>
              </button>
            </div>
          </div>

          <div class="probability-preview">
            <h4>概率模拟预览</h4>
            <div class="prob-bar-container">
              <div v-for="opt in options" :key="opt.id" class="prob-bar-wrap">
                <div class="prob-label">{{ opt.text || '-' }}</div>
                <div class="prob-bar-bg">
                  <div
                    class="prob-bar-fill"
                    :style="{ width: getProb(opt) + '%', backgroundColor: opt.color }"
                  ></div>
                </div>
                <div class="prob-val">{{ getProb(opt) }}%</div>
              </div>
            </div>
          </div>

          <div v-if="history.length" class="history-section">
            <h4>抽奖记录</h4>
            <div class="history-list">
              <div v-for="(h, i) in history" :key="i" class="history-item">
                <span class="h-time">{{ h.time }}</span>
                <span class="h-text">{{ h.text }}</span>
              </div>
            </div>
            <button class="clear-btn" @click="history = []">展示清除记录</button>
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 抽奖大转盘</footer>
  </div>
</template>

<script setup>
  import { ref, onMounted, computed, nextTick } from 'vue';
  import { Back, Plus, Delete } from '@element-plus/icons-vue';
  import dayjs from 'dayjs';
  import { ElMessage } from 'element-plus';

  const wheelCanvas = ref(null);
  const isSpinning = ref(false);
  const rotation = ref(0);
  const options = ref([
    { id: 1, text: '特等奖', weight: 1, color: '#FF4D4F' },
    { id: 2, text: '一等奖', weight: 5, color: '#FFA940' },
    { id: 3, text: '二等奖', weight: 10, color: '#FFEC3D' },
    { id: 4, text: '三等奖', weight: 20, color: '#73D13D' },
    { id: 5, text: '谢谢参与', weight: 50, color: '#40A9FF' },
    { id: 6, text: '再来一次', weight: 14, color: '#9254DE' }
  ]);
  const result = ref(null);
  const history = ref([]);

  const wheelStyle = computed(() => ({
    transform: `rotate(${rotation.value}deg)`,
    transition: isSpinning.value ? 'transform 4s cubic-bezier(0.15, 0, 0.15, 1)' : 'none'
  }));

  const totalWeight = computed(() =>
    options.value.reduce((sum, opt) => sum + (opt.weight || 0), 0)
  );

  const getProb = opt => {
    if (totalWeight.value === 0) return 0;
    return ((opt.weight / totalWeight.value) * 100).toFixed(1);
  };

  const colors = [
    '#FF4D4F',
    '#FFA940',
    '#FFEC3D',
    '#73D13D',
    '#40A9FF',
    '#9254DE',
    '#F759AB',
    '#36CFC9',
    '#BAE637',
    '#FF7A45',
    '#597EF7'
  ];

  const addOption = () => {
    if (options.value.length >= 12) {
      ElMessage.warning('最多添加12个奖项');
      return;
    }
    const id = Date.now();
    const color = colors[options.value.length % colors.length];
    options.value.push({ id, text: '新奖项', weight: 10, color });
    nextTick(drawWheel);
  };

  const removeOption = index => {
    options.value.splice(index, 1);
    drawWheel();
  };

  const drawWheel = () => {
    const canvas = wheelCanvas.value;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let startAngle = -Math.PI / 2;
    options.value.forEach(opt => {
      const sliceAngle = (opt.weight / totalWeight.value) * (Math.PI * 2);

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.fillStyle = opt.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px sans-serif';
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.fillText(opt.text, radius - 30, 6);
      ctx.restore();

      startAngle += sliceAngle;
    });

    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const startSpin = () => {
    if (isSpinning.value) return;

    isSpinning.value = true;
    result.value = null;

    const random = Math.random() * totalWeight.value;
    let currentTotal = 0;
    let targetIndex = 0;
    for (let i = 0; i < options.value.length; i++) {
      currentTotal += options.value[i].weight;
      if (random <= currentTotal) {
        targetIndex = i;
        break;
      }
    }

    const weightBefore = options.value.slice(0, targetIndex).reduce((sum, o) => sum + o.weight, 0);
    const targetWeightVal = options.value[targetIndex].weight;

    const sliceWidth = (targetWeightVal / totalWeight.value) * 360;
    const sliceStart = (weightBefore / totalWeight.value) * 360;

    const padding = Math.min(2, sliceWidth / 4);
    const randomTargetAngle = sliceStart + padding + Math.random() * (sliceWidth - padding * 2);

    const extraCircles = 5 + Math.floor(Math.random() * 3);
    const currentBase = Math.ceil(rotation.value / 360) * 360;
    const finalRotation = currentBase + extraCircles * 360 + (360 - randomTargetAngle);

    rotation.value = finalRotation;

    setTimeout(() => {
      isSpinning.value = false;
      result.value = options.value[targetIndex];
      history.value.unshift({
        text: result.value.text,
        time: dayjs().format('HH:mm:ss')
      });
      if (history.value.length > 50) history.value.pop();
    }, 4000);
  };

  onMounted(() => {
    drawWheel();
  });
</script>

<style scoped>
  .lucky-draw-tool {
    --bg: #f5f7fa;
    --card: #ffffff;
    --border: #eef2f7;
    --text: #2c3e50;
    --text-secondary: #7f8c8d;
    --primary: #409eff;

    font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
    min-height: 100vh;
    background: var(--bg);
  }

  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    height: 60px;
    background: var(--card);
    border-bottom: 1px solid var(--border);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  }

  .nav-back,
  .nav-spacer {
    width: 100px;
  }

  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 0.95rem;
    transition: color 0.2s;
  }

  .nav-back:hover {
    color: var(--primary);
  }

  .nav-center {
    flex: 1;
    text-align: center;
  }

  .nav-center h1 {
    font-size: 1.15rem;
    margin: 0;
    color: var(--text);
    line-height: 1.2;
  }

  .nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    display: block;
    text-align: center;
    margin-top: 1px;
  }

  .main-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }

  .layout-grid {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 2rem;
  }

  .glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  }

  .wheel-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 500px;
    position: relative;
  }

  .wheel-container {
    position: relative;
    width: 400px;
    height: 400px;
  }

  .wheel-canvas-wrap {
    width: 400px;
    height: 400px;
  }

  .wheel-pointer {
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 50px;
    background: #ff4d4f;
    clip-path: polygon(50% 100%, 0% 0%, 100% 0%);
    z-index: 10;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }

  .wheel-pointer.is-spinning {
    animation: pointer-wiggle 4s cubic-bezier(0.15, 0, 0.15, 1);
  }

  @keyframes pointer-wiggle {
    0%,
    100% {
      transform: translateX(-50%) rotate(0deg);
    }

    10%,
    20%,
    30%,
    40%,
    50%,
    60%,
    70%,
    80%,
    90% {
      transform: translateX(-50%) rotate(5deg);
    }

    15%,
    25%,
    35%,
    45%,
    55%,
    65%,
    75%,
    85%,
    95% {
      transform: translateX(-50%) rotate(-5deg);
    }
  }

  .spin-btn {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background: #fff;
    border: 4px solid #333;
    font-weight: bold;
    color: #333;
    cursor: pointer;
    z-index: 20;
    transition: all 0.2s;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  }

  .spin-btn:hover:not(:disabled) {
    transform: translate(-50%, -50%) scale(1.1);
    background: #f0f0f0;
  }

  .spin-btn:disabled {
    cursor: not-allowed;
    opacity: 0.8;
  }

  .result-display {
    margin-top: 2rem;
    text-align: center;
    animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  @keyframes bounce-in {
    0% {
      transform: scale(0);
      opacity: 0;
    }

    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .result-label {
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }

  .result-text {
    font-size: 2rem;
    color: #ff4d4f;
    margin: 0;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .add-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 1rem;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .options-list {
    max-height: 400px;
    overflow-y: auto;
    margin-bottom: 2rem;
    padding-right: 0.5rem;
  }

  .option-item {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 0.6rem;
    padding: 0.6rem;
    background: #f8fafc;
    border-radius: 10px;
  }

  .opt-color {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .opt-input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 0.9rem;
    outline: none;
  }

  .opt-weight {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    color: var(--text-secondary);
  }

  .weight-input {
    width: 45px;
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 2px 4px;
    text-align: center;
  }

  .del-btn {
    background: none;
    border: none;
    color: #ff4d4f;
    cursor: pointer;
    padding: 4px;
    font-size: 1rem;
  }

  .probability-preview h4,
  .history-section h4 {
    font-size: 1rem;
    margin-bottom: 1rem;
  }

  .prob-bar-wrap {
    margin-bottom: 0.8rem;
  }

  .prob-label {
    font-size: 0.8rem;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .prob-bar-bg {
    height: 6px;
    background: #eee;
    border-radius: 3px;
    overflow: hidden;
  }

  .prob-bar-fill {
    height: 100%;
    transition: width 0.3s;
  }

  .prob-val {
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-align: right;
    margin-top: 2px;
  }

  .history-list {
    max-height: 150px;
    overflow-y: auto;
    background: #f8fafc;
    border-radius: 10px;
    padding: 1rem;
    font-size: 0.85rem;
  }

  .history-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.4rem;
  }

  .h-time {
    color: var(--text-secondary);
  }

  .clear-btn {
    margin-top: 1rem;
    width: 100%;
    padding: 0.5rem;
    background: none;
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 0.8rem;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
    font-size: 0.85rem;
    border-top: 1px solid var(--border);
  }

  @media (max-width: 1000px) {
    .layout-grid {
      grid-template-columns: 1fr;
    }

    .wheel-container,
    .wheel-canvas-wrap {
      width: 320px;
      height: 320px;
    }

    canvas {
      width: 320px;
      height: 320px;
    }
  }
</style>
