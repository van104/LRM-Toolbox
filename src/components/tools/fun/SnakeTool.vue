<template>
  <div class="snake-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>贪吃蛇</h1>
        <span class="nav-subtitle">Snake Retro</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="game-wrapper-outer">
        <div class="game-container">
          <div class="side-panel left-panel">
            <div class="panel-card glass-card mobile-hide">
              <h3>按键说明</h3>
              <ul class="controls-list">
                <li><span>方向键</span> <span>移动</span></li>
                <li><span>空格</span> <span>加速</span></li>
                <li><span>P</span> <span>暂停</span></li>
                <li><span>R</span> <span>重来</span></li>
              </ul>
            </div>

            <div class="panel-card glass-card">
              <h3>游戏设置</h3>
              <div class="setting-item">
                <label>皮肤主题</label>
                <div class="skin-selector">
                  <button
                    v-for="s in skins"
                    :key="s.id"
                    :title="s.name"
                    class="skin-btn"
                    :class="{ active: currentSkin.id === s.id }"
                    :style="{ background: s.snakeHead }"
                    @click="setSkin(s)"
                  ></button>
                </div>
              </div>
            </div>
          </div>

          <div class="board-wrapper glass-card">
            <div ref="boardRef" class="game-board" :style="boardStyle">
              <div class="grid-bg"></div>

              <div
                v-if="food"
                class="game-cell food"
                :class="{ 'pulse-anim': true }"
                :style="getFoodStyle()"
              ></div>

              <div
                v-for="(segment, index) in snake"
                :key="index"
                class="game-cell snake-body"
                :class="{ 'snake-head': index === 0 }"
                :style="getSnakeStyle(segment, index)"
              >
                <div v-if="index === 0" class="snake-eyes">
                  <div class="eye"></div>
                  <div class="eye"></div>
                </div>
              </div>

              <div v-if="gameOver" class="overlay game-over">
                <h2>游戏结束</h2>
                <p>最终得分: {{ score }}</p>
                <div class="score-breakdown">历史最高: {{ highScore }}</div>
                <button class="primary-btn" @click="startGame">再玩一次</button>
              </div>

              <div v-if="isPaused && !gameOver && isGameStarted" class="overlay paused">
                <h2>已暂停</h2>
                <button class="primary-btn" @click="togglePause">继续游戏</button>
              </div>

              <div v-if="!isGameStarted && !gameOver" class="overlay start">
                <h2>贪吃蛇</h2>
                <p>复古模式</p>
                <button class="primary-btn pulse" @click="startGame">开始游戏</button>
              </div>
            </div>
          </div>

          <div class="side-panel right-panel">
            <div class="panel-card glass-card stats-card">
              <div class="stat-item">
                <span class="label">得分</span>
                <span class="value">{{ score }}</span>
              </div>
              <div class="stat-item">
                <span class="label">最高分</span>
                <span class="value">{{ highScore }}</span>
              </div>
              <div class="stat-item">
                <span class="label">速度</span>
                <span class="value">x{{ speedLevel }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="mobile-controls">
          <div class="mobile-stats">
            <span>得分: {{ score }}</span>
          </div>
          <div class="d-pad-circle">
            <div
              class="d-btn up"
              @touchstart.prevent="changeDirection({ x: 0, y: -1 })"
              @mousedown.prevent="changeDirection({ x: 0, y: -1 })"
            >
              ↑
            </div>
            <div
              class="d-btn left"
              @touchstart.prevent="changeDirection({ x: -1, y: 0 })"
              @mousedown.prevent="changeDirection({ x: -1, y: 0 })"
            >
              ←
            </div>
            <div
              class="d-btn center"
              @touchstart.prevent="togglePause"
              @mousedown.prevent="togglePause"
            >
              P
            </div>
            <div
              class="d-btn right"
              @touchstart.prevent="changeDirection({ x: 1, y: 0 })"
              @mousedown.prevent="changeDirection({ x: 1, y: 0 })"
            >
              →
            </div>
            <div
              class="d-btn down"
              @touchstart.prevent="changeDirection({ x: 0, y: 1 })"
              @mousedown.prevent="changeDirection({ x: 0, y: 1 })"
            >
              ↓
            </div>
          </div>
          <button
            class="boost-btn"
            @touchstart.prevent="toggleBoost(true)"
            @touchend.prevent="toggleBoost(false)"
            @mousedown.prevent="toggleBoost(true)"
            @mouseup.prevent="toggleBoost(false)"
          >
            ⚡
          </button>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 贪吃蛇</footer>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted, computed } from 'vue';
  import { Back } from '@element-plus/icons-vue';

  const ROWS = 20;
  const COLS = 20;
  const INITIAL_SPEED = 130;
  const MIN_SPEED = 60;

  const skins = [
    {
      id: 'retro',
      name: '经典复古',
      snakeHead: '#2e7d32',
      snakeBody: '#4caf50',
      food: '#e53935',
      bg: '#e0e0e0',
      grid: 'rgba(0,0,0,0.05)',
      shadow: 'none'
    },
    {
      id: 'neon',
      name: '赛博霓虹',
      snakeHead: '#00f2fe',
      snakeBody: '#4facfe',
      food: '#f093fb',
      bg: '#090919',
      grid: 'rgba(79, 172, 254, 0.1)',
      shadow: '0 0 10px'
    },
    {
      id: 'gold',
      name: '黑金奢华',
      snakeHead: '#ffd700',
      snakeBody: '#daa520',
      food: '#fff',
      bg: '#000000',
      grid: 'rgba(255, 215, 0, 0.1)',
      shadow: '0 0 5px'
    }
  ];

  const currentSkin = ref(skins[0]);
  const snake = ref([{ x: 10, y: 10 }]);
  const food = ref(null);
  const direction = ref({ x: 0, y: 0 });
  const nextDirection = ref({ x: 0, y: 0 });
  const score = ref(0);
  const highScore = ref(parseInt(localStorage.getItem('snake_highscore') || '0'));
  const isGameStarted = ref(false);
  const isPaused = ref(false);
  const gameOver = ref(false);
  const isBoosting = ref(false);

  let gameLoop = null;
  let lastTime = 0;
  let speed = INITIAL_SPEED;

  const boardStyle = computed(() => ({
    width: '400px',
    height: '400px',
    backgroundColor: currentSkin.value.bg,
    '--grid-color': currentSkin.value.grid
  }));

  const speedLevel = computed(() => {
    return Math.max(1, Math.floor((INITIAL_SPEED - speed) / 10));
  });

  function getSnakeStyle(segment, index) {
    return {
      left: segment.x * 20 + 'px',
      top: segment.y * 20 + 'px',
      backgroundColor: index === 0 ? currentSkin.value.snakeHead : currentSkin.value.snakeBody,
      boxShadow:
        index === 0 ? currentSkin.value.shadow + ' ' + currentSkin.value.snakeHead : 'none',
      zIndex: index === 0 ? 10 : 5
    };
  }

  function getFoodStyle() {
    return {
      left: food.value.x * 20 + 'px',
      top: food.value.y * 20 + 'px',
      backgroundColor: currentSkin.value.food,
      boxShadow: currentSkin.value.shadow + ' ' + currentSkin.value.food
    };
  }

  function setSkin(skin) {
    currentSkin.value = skin;
  }

  function startGame() {
    resetGame();
    isGameStarted.value = true;
    direction.value = { x: 1, y: 0 };
    nextDirection.value = { x: 1, y: 0 };
    spawnFood();
    lastTime = performance.now();
    gameLoop = requestAnimationFrame(update);
  }

  function resetGame() {
    snake.value = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    direction.value = { x: 0, y: 0 };
    nextDirection.value = { x: 0, y: 0 };
    score.value = 0;
    speed = INITIAL_SPEED;
    gameOver.value = false;
    isPaused.value = false;
    isBoosting.value = false;
  }

  function spawnFood() {
    let valid = false;
    let pos = { x: 0, y: 0 };
    while (!valid) {
      pos.x = Math.floor(Math.random() * COLS);
      pos.y = Math.floor(Math.random() * ROWS);

      valid = !snake.value.some(s => s.x === pos.x && s.y === pos.y);
    }
    food.value = pos;
  }

  function changeDirection(dir) {
    if (!isGameStarted.value || gameOver.value) return;

    if (isPaused.value) return;

    if (dir.x === -direction.value.x && dir.y === -direction.value.y) return;

    const isOpposite =
      (dir.x !== 0 && dir.x === -direction.value.x) ||
      (dir.y !== 0 && dir.y === -direction.value.y);

    if (!isOpposite) {
      nextDirection.value = dir;
    }
  }

  function togglePause() {
    if (!isGameStarted.value || gameOver.value) return;
    isPaused.value = !isPaused.value;
  }

  function toggleBoost(active) {
    isBoosting.value = active;
  }

  function update(time) {
    if (!isGameStarted.value) return;
    gameLoop = requestAnimationFrame(update);

    if (isPaused.value || gameOver.value) return;

    const currentSpeed = isBoosting.value ? speed / 2 : speed;

    if (time - lastTime > currentSpeed) {
      lastTime = time;
      move();
    }
  }

  function move() {
    direction.value = nextDirection.value;

    const head = snake.value[0];
    const newHead = {
      x: head.x + direction.value.x,
      y: head.y + direction.value.y
    };

    if (newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS) {
      handleGameOver();
      return;
    }

    if (snake.value.some(s => s.x === newHead.x && s.y === newHead.y)) {
      handleGameOver();
      return;
    }

    snake.value.unshift(newHead);

    if (food.value && newHead.x === food.value.x && newHead.y === food.value.y) {
      score.value += 10;

      if (speed > MIN_SPEED) speed -= 2;
      spawnFood();
    } else {
      snake.value.pop();
    }
  }

  function handleGameOver() {
    gameOver.value = true;
    if (score.value > highScore.value) {
      highScore.value = score.value;
      localStorage.setItem('snake_highscore', highScore.value);
    }
  }

  function handleKeydown(e) {
    if (!isGameStarted.value) return;

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }

    switch (e.code) {
      case 'ArrowLeft':
        changeDirection({ x: -1, y: 0 });
        break;
      case 'ArrowRight':
        changeDirection({ x: 1, y: 0 });
        break;
      case 'ArrowUp':
        changeDirection({ x: 0, y: -1 });
        break;
      case 'ArrowDown':
        changeDirection({ x: 0, y: 1 });
        break;
      case 'Space':
        toggleBoost(true);
        break;
      case 'KeyP':
        togglePause();
        break;
      case 'KeyR':
        if (gameOver.value) startGame();
        break;
    }
  }

  function handleKeyup(e) {
    if (e.code === 'Space') {
      toggleBoost(false);
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('keyup', handleKeyup);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
    window.removeEventListener('keyup', handleKeyup);
    if (gameLoop) {
      cancelAnimationFrame(gameLoop);
    }
  });
</script>

<style scoped>
  .snake-tool {
    --bg: #f5f7fa;
    --card: #ffffff;
    --text: #2c3e50;
    --text-secondary: #7f8c8d;
    --primary: #10b981;
    --border: #eef2f7;

    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    min-height: 100vh;
    background: var(--bg);
    display: flex;
    flex-direction: column;
    user-select: none;
    color: var(--text);
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
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
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
    text-align: center;
  }

  .nav-center h1 {
    font-size: 1.15rem;
    margin: 0;
  }

  .nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-secondary);
    text-transform: uppercase;
  }

  .main-content {
    flex: 1;
    display: flex;
    justify-content: center;
    padding: 2rem 1rem;
    overflow-y: auto;
  }

  .game-wrapper-outer {
    max-width: 900px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .game-container {
    display: flex;
    gap: 20px;
    align-items: flex-start;
    justify-content: center;
    width: 100%;
  }

  .glass-card {
    background: #ffffff;
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 15px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .side-panel {
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 200px;
  }

  .panel-card h3 {
    margin: 0 0 10px;
    font-size: 1rem;
    color: var(--text-secondary);
    text-align: center;
    font-weight: 600;
  }

  .controls-list {
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 0.85rem;
  }

  .controls-list li {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    color: var(--text-secondary);
  }

  .controls-list li span:first-child {
    font-weight: bold;
    color: var(--text);
    background: rgba(0, 0, 0, 0.05);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .setting-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
  }

  .skin-selector {
    display: flex;
    gap: 10px;
  }

  .skin-btn {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .skin-btn.active {
    border-color: #fff;
    transform: scale(1.1);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }

  .board-wrapper {
    padding: 10px;
    background: #f0f2f5;
    border: 1px solid var(--border);
    border-radius: 8px;
  }

  .game-board {
    position: relative;

    overflow: hidden;
    background-size: 20px 20px;
    background-image:
      linear-gradient(to right, var(--grid-color) 1px, transparent 1px),
      linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px);
  }

  .game-cell {
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    transition:
      left 0.1s linear,
      top 0.1s linear;
  }

  .snake-body {
    border-radius: 4px;
  }

  .snake-head {
    border-radius: 6px;
    z-index: 10;
  }

  .snake-eyes {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-around;
    align-items: center;
  }

  .eye {
    width: 4px;
    height: 4px;
    background: #000;
    border-radius: 50%;
    opacity: 0.6;
  }

  .food {
    border-radius: 50%;
  }

  .pulse-anim {
    animation: foodPulse 1s infinite alternate;
  }

  @keyframes foodPulse {
    from {
      transform: scale(0.8);
    }

    to {
      transform: scale(1.1);
    }
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 20;
    backdrop-filter: blur(5px);
  }

  .overlay h2 {
    font-size: 2.5rem;
    margin-bottom: 20px;
    color: #fff;
    text-shadow: 0 0 10px var(--primary);
  }

  .primary-btn {
    background: linear-gradient(135deg, var(--primary) 0%, #22c55e 100%);
    border: none;
    padding: 12px 35px;
    color: #000;
    font-weight: bold;
    border-radius: 25px;
    cursor: pointer;
    font-size: 1.1rem;
    transition: transform 0.2s;
    margin-top: 15px;
  }

  .primary-btn:hover {
    transform: scale(1.05);
  }

  .stats-card .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 15px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    padding-bottom: 10px;
  }

  .stat-item .value {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--primary);
    font-family: monospace;
  }

  .mobile-controls {
    display: none;
    flex-direction: column;
    align-items: center;
    width: 100%;
    margin-top: 20px;
    gap: 15px;
  }

  .d-pad-circle {
    position: relative;
    width: 150px;
    height: 150px;
    background: #eef2f7;
    border-radius: 50%;
  }

  .d-btn {
    position: absolute;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ffffff;
    border-radius: 50%;
    font-size: 1.2rem;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    color: var(--text);
  }

  .d-btn:active {
    background: #f0f0f0;
  }

  .d-btn.up {
    top: 0;
    left: 50%;
    transform: translateX(-50%);
  }

  .d-btn.down {
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }

  .d-btn.left {
    left: 0;
    top: 50%;
    transform: translateY(-50%);
  }

  .d-btn.right {
    right: 0;
    top: 50%;
    transform: translateY(-50%);
  }

  .d-btn.center {
    width: 40px;
    height: 40px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #e0e0e0;
    font-size: 0.8rem;
    color: var(--text);
  }

  .boost-btn {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #eab308;
    border: none;
    font-size: 1.5rem;
    color: #000;
    box-shadow: 0 0 15px rgba(234, 179, 8, 0.4);
  }

  .boost-btn:active {
    transform: scale(0.95);
    opacity: 0.8;
  }

  .footer {
    text-align: center;
    padding: 2rem 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
    border-top: 1px solid var(--border);
    background: var(--card);
  }

  @media (max-width: 800px) {
    .game-container {
      flex-direction: column;
      align-items: center;
    }

    .side-panel {
      width: 100%;
      max-width: 400px;
      flex-direction: row;
      justify-content: space-between;
    }

    .mobile-hide {
      display: none;
    }

    .mobile-controls {
      display: flex;
    }

    .game-board {
      width: 300px !important;

      height: 300px !important;
      background-size: 15px 15px;
    }

    .board-wrapper {
      transform: scale(0.85);
      transform-origin: center top;
      margin-bottom: -50px;
    }
  }
</style>
