<template>
  <div class="draw-guess-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>你画我猜</h1>
        <span class="nav-subtitle">Draw & Guess</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="game-container glass-card">
        <div v-if="gameState === 'idle'" class="start-screen">
          <div class="draw-icon">🎨</div>
          <h2>你画我猜</h2>
          <p>根据题目画画，让大家猜猜是什么！</p>
          <button class="start-btn" @click="startGame">开始游戏</button>
        </div>

        <div v-else class="game-area">
          <div class="game-header">
            <div class="topic-card">
              <span class="label">题目</span>
              <span class="topic">{{ currentTopic }}</span>
              <button class="skip-btn" @click="skipTopic">换一个</button>
            </div>
            <div class="timer" :class="{ warning: timeLeft <= 10 }">{{ timeLeft }}s</div>
          </div>

          <div class="canvas-container">
            <canvas
              ref="canvasRef"
              class="draw-canvas"
              @mousedown="startDraw"
              @mousemove="draw"
              @mouseup="stopDraw"
              @mouseleave="stopDraw"
              @touchstart.prevent="handleTouchStart"
              @touchmove.prevent="handleTouchMove"
              @touchend="stopDraw"
            ></canvas>
          </div>

          <div class="tools-bar">
            <div class="color-palette">
              <button
                v-for="color in colors"
                :key="color"
                class="color-btn"
                :style="{ background: color }"
                :class="{ active: currentColor === color }"
                @click="currentColor = color"
              ></button>
            </div>
            <div class="brush-sizes">
              <button
                v-for="size in brushSizes"
                :key="size"
                :class="['size-btn', { active: brushSize === size }]"
                @click="brushSize = size"
              >
                <span :style="{ width: size + 'px', height: size + 'px' }"></span>
              </button>
            </div>
            <button class="tool-btn" @click="clearCanvas">🗑 清除</button>
            <button class="tool-btn" @click="undoLast">↩ 撤销</button>
          </div>

          <div class="guess-area">
            <input
              v-model="guessText"
              class="guess-input"
              placeholder="猜猜画的是什么..."
              @keyup.enter="submitGuess"
            />
            <button class="guess-btn" @click="submitGuess">猜!</button>
          </div>

          <div v-if="guessHistory.length > 0" class="guess-history">
            <div
              v-for="(item, index) in guessHistory"
              :key="index"
              class="guess-item"
              :class="item.result"
            >
              {{ item.text }} {{ item.result === 'correct' ? '✓' : '✗' }}
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 你画我猜</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, nextTick } from 'vue';
  import { Back } from '@element-plus/icons-vue';

  type GameState = 'idle' | 'playing';

  const topics = [
    '太阳',
    '月亮',
    '星星',
    '云朵',
    '彩虹',
    '猫',
    '狗',
    '兔子',
    '鱼',
    '鸟',
    '苹果',
    '香蕉',
    '西瓜',
    '葡萄',
    '草莓',
    '房子',
    '汽车',
    '飞机',
    '轮船',
    '火车',
    '花朵',
    '树木',
    '山峰',
    '河流',
    '大海',
    '眼镜',
    '手机',
    '电脑',
    '书本',
    '钟表',
    '雨伞',
    '帽子',
    '鞋子',
    '衣服',
    '包包',
    '蛋糕',
    '冰淇淋',
    '披萨',
    '汉堡',
    '面条'
  ];

  const colors = [
    '#000000',
    '#e74c3c',
    '#e67e22',
    '#f1c40f',
    '#27ae60',
    '#3498db',
    '#9b59b6',
    '#ffffff'
  ];
  const brushSizes = [4, 8, 16, 24];

  const gameState = ref<GameState>('idle');
  const currentTopic = ref('');
  const timeLeft = ref(60);
  const guessText = ref('');
  const guessHistory = ref<{ text: string; result: 'correct' | 'wrong' }[]>([]);
  const currentColor = ref('#000000');
  const brushSize = ref(8);
  const canvasRef = ref<HTMLCanvasElement | null>(null);

  let isDrawing = false;
  let ctx: CanvasRenderingContext2D | null = null;
  let timer: number | null = null;
  let history: ImageData[] = [];

  const initCanvas = () => {
    nextTick(() => {
      if (!canvasRef.value) return;
      const canvas = canvasRef.value;
      const container = canvas.parentElement;
      if (!container) return;

      canvas.width = container.clientWidth;
      canvas.height = 300;

      ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    });
  };

  const startGame = () => {
    gameState.value = 'playing';
    guessHistory.value = [];
    history = [];
    timeLeft.value = 60;
    pickTopic();

    if (timer) clearInterval(timer);
    timer = window.setInterval(() => {
      timeLeft.value--;
      if (timeLeft.value <= 0) {
        guessHistory.value.push({ text: '时间到!', result: 'wrong' });
        if (timer) clearInterval(timer);
      }
    }, 1000);

    nextTick(() => {
      initCanvas();
    });
  };

  const pickTopic = () => {
    currentTopic.value = topics[Math.floor(Math.random() * topics.length)];
  };

  const skipTopic = () => {
    pickTopic();
    clearCanvas();
  };

  const getPos = (e: MouseEvent | TouchEvent) => {
    if (!canvasRef.value) return { x: 0, y: 0 };
    const rect = canvasRef.value.getBoundingClientRect();

    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDraw = (e: MouseEvent) => {
    if (!ctx) return;
    isDrawing = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);

    // Save for undo
    history.push(ctx.getImageData(0, 0, canvasRef.value!.width, canvasRef.value!.height));
    if (history.length > 20) history.shift();
  };

  const draw = (e: MouseEvent) => {
    if (!isDrawing || !ctx) return;
    const pos = getPos(e);
    ctx.strokeStyle = currentColor.value;
    ctx.lineWidth = brushSize.value;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDraw = () => {
    isDrawing = false;
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (!ctx) return;
    isDrawing = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    history.push(ctx.getImageData(0, 0, canvasRef.value!.width, canvasRef.value!.height));
    if (history.length > 20) history.shift();
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDrawing || !ctx) return;
    const pos = getPos(e);
    ctx.strokeStyle = currentColor.value;
    ctx.lineWidth = brushSize.value;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const clearCanvas = () => {
    if (!ctx || !canvasRef.value) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height);
    history = [];
  };

  const undoLast = () => {
    if (!ctx || history.length === 0) return;
    ctx.putImageData(history.pop()!, 0, 0);
  };

  const submitGuess = () => {
    if (!guessText.value.trim()) return;

    const guess = guessText.value.trim();
    const isCorrect = guess === currentTopic.value;

    guessHistory.value.unshift({
      text: guess,
      result: isCorrect ? 'correct' : 'wrong'
    });

    if (isCorrect) {
      guessHistory.value.unshift({ text: '猜对了! 🎉', result: 'correct' });
      if (timer) clearInterval(timer);
      setTimeout(() => {
        pickTopic();
        clearCanvas();
        guessHistory.value = [];
        timeLeft.value = 60;
        if (timer) clearInterval(timer);
        timer = window.setInterval(() => {
          timeLeft.value--;
          if (timeLeft.value <= 0) {
            if (timer) clearInterval(timer);
          }
        }, 1000);
      }, 2000);
    }

    guessText.value = '';
  };

  onMounted(() => {
    if (gameState.value === 'playing') {
      initCanvas();
    }
  });
</script>

<style scoped>
  .draw-guess-tool {
    --bg: #f5f7fa;
    --card: #ffffff;
    --text: #2c3e50;
    --text-secondary: #7f8c8d;
    --primary: #e74c3c;
    --success: #27ae60;
    --danger: #e74c3c;

    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
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
    border-bottom: 1px solid #eef2f7;
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
  }

  .nav-center {
    text-align: center;
  }
  .nav-center h1 {
    font-size: 1.15rem;
    margin: 0;
    color: var(--text);
  }
  .nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-secondary);
    display: block;
    margin-top: 1px;
  }

  .main-content {
    display: flex;
    justify-content: center;
    padding: 2rem 1rem;
    min-height: calc(100vh - 140px);
  }

  .game-container {
    background: var(--card);
    border-radius: 20px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
    padding: 1.5rem;
    width: 100%;
    max-width: 600px;
  }

  .start-screen {
    text-align: center;
    padding: 2rem 0;
  }
  .draw-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
  .start-screen h2 {
    margin: 0 0 0.5rem 0;
    color: var(--text);
  }
  .start-screen p {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
  }

  .start-btn {
    padding: 0.8rem 2.5rem;
    font-size: 1.1rem;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
  }

  .game-area {
    text-align: center;
  }

  .game-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .topic-card {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .topic-card .label {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .topic-card .topic {
    font-size: 1.2rem;
    font-weight: bold;
    color: var(--primary);
  }

  .skip-btn {
    padding: 0.3rem 0.8rem;
    font-size: 0.8rem;
    background: #f5f5f5;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    color: var(--text-secondary);
  }

  .timer {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--text);
    padding: 0.3rem 1rem;
    background: #f5f5f5;
    border-radius: 8px;
  }

  .timer.warning {
    color: var(--danger);
    animation: blink 0.5s infinite;
  }

  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .canvas-container {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    border: 2px solid #eee;
    margin-bottom: 1rem;
  }

  .draw-canvas {
    width: 100%;
    height: 300px;
    cursor: crosshair;
    touch-action: none;
  }

  .tools-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 0.5rem;
    background: #f9f9f9;
    border-radius: 12px;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .color-palette {
    display: flex;
    gap: 6px;
  }

  .color-btn {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid #ddd;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .color-btn.active {
    transform: scale(1.2);
    border-color: var(--text);
  }

  .brush-sizes {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .size-btn {
    width: 32px;
    height: 32px;
    border: 2px solid #ddd;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .size-btn.active {
    border-color: var(--primary);
  }
  .size-btn span {
    background: var(--text);
    border-radius: 50%;
    display: block;
  }

  .tool-btn {
    padding: 0.4rem 0.8rem;
    background: white;
    border: 1px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .guess-area {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .guess-input {
    flex: 1;
    padding: 0.8rem;
    border: 2px solid #ddd;
    border-radius: 10px;
    font-size: 1rem;
    outline: none;
  }

  .guess-input:focus {
    border-color: var(--primary);
  }

  .guess-btn {
    padding: 0 1.5rem;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: bold;
  }

  .guess-history {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .guess-item {
    padding: 0.5rem;
    border-radius: 6px;
    font-size: 0.9rem;
  }

  .guess-item.correct {
    background: #e6fff0;
    color: var(--success);
  }
  .guess-item.wrong {
    background: #f5f5f5;
    color: var(--text-secondary);
  }

  .footer {
    text-align: center;
    padding: 2rem 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
    border-top: 1px solid #eef2f7;
    background: var(--card);
  }
</style>
