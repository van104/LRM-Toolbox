<template>
  <div class="flappy-bird-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>管道小鸟</h1>
        <span class="nav-subtitle">Flappy Bird</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="game-wrapper" @click="triggerJump" @touchstart.prevent="triggerJump">
        <div ref="gameContainer" class="game-container">
          <div class="background" :class="{ moving: isPlaying }"></div>

          <div
            v-for="pipe in pipes"
            :key="pipe.id"
            class="pipe-group"
            :style="{ left: pipe.x + 'px' }"
          >
            <div class="pipe pipe-top" :style="{ height: pipe.topHeight + 'px' }">
              <div class="pipe-cap bottom-cap"></div>
            </div>
            <div class="pipe pipe-bottom" :style="{ height: pipe.bottomHeight + 'px' }">
              <div class="pipe-cap top-cap"></div>
            </div>
          </div>

          <div class="ground" :class="{ moving: isPlaying }"></div>

          <div class="bird" :style="birdStyle">
            <div class="bird-body">
              <div class="eye"></div>
              <div class="wing"></div>
              <div class="beak"></div>
            </div>
          </div>

          <div class="ui-layer">
            <div class="score-board">
              <div class="current-score">{{ score }}</div>
              <div v-if="highScore > 0" class="high-score">BEST: {{ highScore }}</div>
            </div>

            <div v-if="gameState === 'start'" class="overlay start-screen">
              <div class="title">Flappy Bird</div>
              <div class="instruction">点击屏幕跳跃</div>
              <button class="start-btn" @click.stop="startGame">开始游戏</button>
            </div>

            <div v-if="gameState === 'gameover'" class="overlay gameover-screen">
              <div class="title">Game Over</div>
              <div class="final-score">得分: {{ score }}</div>
              <div class="final-best">最佳: {{ highScore }}</div>
              <div class="action-buttons">
                <button class="start-btn" @click.stop="startGame">重试</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer class="footer">© 2026 LRM工具箱 - 管道小鸟</footer>
    </main>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, onUnmounted, reactive } from 'vue';
  import { Back } from '@element-plus/icons-vue';

  const GAME_WIDTH = 400;
  const GAME_HEIGHT = 600;
  const BIRD_SIZE = 34;
  const GRAVITY = 0.06;
  const JUMP_STRENGTH = -3;
  const PIPE_SPEED = 1.5;
  const PIPE_SPAWN_RATE = 180;
  const PIPE_GAP = 200;
  const PIPE_WIDTH = 52;

  const gameState = ref('start');
  const score = ref(0);
  const highScore = ref(parseInt(localStorage.getItem('flappy_high_score') || 0));
  const isPlaying = computed(() => gameState.value === 'playing');

  const bird = reactive({
    y: GAME_HEIGHT / 2,
    velocity: 0,
    rotation: 0
  });

  const pipes = ref([]);
  let frameCount = 0;
  let animationFrameId = null;

  const birdStyle = computed(() => ({
    top: `${bird.y}px`,
    transform: `rotate(${bird.rotation}deg)`
  }));

  const gameLoop = () => {
    if (!isPlaying.value) return;

    frameCount++;

    bird.velocity += GRAVITY;
    bird.y += bird.velocity;

    if (bird.velocity < 0) {
      bird.rotation = -20;
    } else {
      bird.rotation += 2;
      if (bird.rotation > 90) bird.rotation = 90;
    }

    if (frameCount % PIPE_SPAWN_RATE === 0) {
      spawnPipe();
    }

    for (let i = pipes.value.length - 1; i >= 0; i--) {
      const p = pipes.value[i];
      p.x -= PIPE_SPEED;

      if (!p.passed && p.x + PIPE_WIDTH < GAME_WIDTH / 2 - BIRD_SIZE / 2) {
        p.passed = true;
        score.value++;
      }

      if (p.x < -PIPE_WIDTH) {
        pipes.value.splice(i, 1);
      }
    }

    if (checkCollision()) {
      gameOver();
      return;
    }

    animationFrameId = requestAnimationFrame(gameLoop);
  };

  const spawnPipe = () => {
    const minHeight = 50;
    const maxTopHeight = GAME_HEIGHT - 110 - PIPE_GAP - minHeight;
    const topHeight = Math.floor(Math.random() * (maxTopHeight - minHeight + 1)) + minHeight;

    const bottomHeight = GAME_HEIGHT - 110 - PIPE_GAP - topHeight;

    pipes.value.push({
      id: Date.now(),
      x: GAME_WIDTH,
      topHeight,
      bottomHeight,
      passed: false
    });
  };

  const checkCollision = () => {
    if (bird.y + BIRD_SIZE >= GAME_HEIGHT - 110 || bird.y <= 0) {
      return true;
    }

    const birdLeft = GAME_WIDTH / 2 - BIRD_SIZE / 2 + 8;
    const birdRight = GAME_WIDTH / 2 + BIRD_SIZE / 2 - 8;
    const birdTop = bird.y + 8;
    const birdBottom = bird.y + BIRD_SIZE - 8;

    for (const p of pipes.value) {
      if (birdRight > p.x && birdLeft < p.x + PIPE_WIDTH) {
        if (birdTop < p.topHeight || birdBottom > p.topHeight + PIPE_GAP) {
          return true;
        }
      }
    }

    return false;
  };

  const triggerJump = () => {
    if (gameState.value === 'start' || gameState.value === 'gameover') {
      return;
    }

    if (gameState.value === 'playing') {
      bird.velocity = JUMP_STRENGTH;
    }
  };

  const startGame = () => {
    bird.y = GAME_HEIGHT / 2;
    bird.velocity = JUMP_STRENGTH * 0.8;
    bird.rotation = 0;
    pipes.value = [];
    score.value = 0;
    frameCount = 0;
    gameState.value = 'playing';

    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    gameLoop();
  };

  const gameOver = () => {
    gameState.value = 'gameover';
    if (score.value > highScore.value) {
      highScore.value = score.value;
      localStorage.setItem('flappy_high_score', highScore.value);
    }
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  };

  const handleKeydown = e => {
    if (e.code === 'Space') {
      if (gameState.value === 'playing') {
        triggerJump();
      } else if (gameState.value !== 'playing') {
        startGame();
      }
      e.preventDefault();
    }
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  });
</script>

<style scoped>
  .flappy-bird-tool {
    --bg: #f5f7fa;
    --card: #ffffff;
    --primary: #409eff;
    --text: #2c3e50;

    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    min-height: 100vh;
    background: var(--bg);
    user-select: none;
    display: flex;
    flex-direction: column;
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
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  }

  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: #7f8c8d;
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
    color: var(--text);
  }

  .nav-subtitle {
    font-size: 0.7rem;
    color: #7f8c8d;
    text-transform: uppercase;
    display: block;
    margin-top: 1px;
  }

  .nav-spacer {
    width: 60px;
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.5rem 1rem;
    gap: 1.5rem;
    overflow: hidden;
  }

  .game-wrapper {
    position: relative;

    width: 100%;
    max-width: 400px;
    height: 600px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    background: #000;
  }

  .game-container {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    background: #4ec0ca;
  }

  .background {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 200%;
    height: 100%;
    background-image:
      radial-gradient(circle at 50% 10%, rgba(255, 255, 255, 0.8) 10px, transparent 15px),
      radial-gradient(circle at 20% 40%, rgba(255, 255, 255, 0.6) 20px, transparent 30px),
      radial-gradient(circle at 80% 30%, rgba(255, 255, 255, 0.6) 15px, transparent 25px);
    background-size: 400px 600px;
    z-index: 0;
  }

  .ground {
    position: absolute;
    bottom: 0px;
    left: 0;
    width: 200%;
    height: 110px;
    background: #ded895;
    border-top: 3px solid #543847;
    z-index: 10;
    background-image: repeating-linear-gradient(
      -45deg,
      #cbb968,
      #cbb968 15px,
      #9e8f54 15px,
      #9e8f54 30px
    );
  }

  @keyframes scroll {
    0% {
      transform: translateX(0);
    }

    100% {
      transform: translateX(-400px);
    }
  }

  .ground.moving,
  .background.moving {
    animation: scroll 6s linear infinite;
  }

  .background.moving {
    animation-duration: 40s;
  }

  .bird {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 34px;
    height: 24px;
    z-index: 20;

    margin-left: -17px;
  }

  .bird-body {
    width: 100%;
    height: 100%;
    background: #f4d03f;
    border-radius: 50% 60% 50% 40%;
    position: relative;
    border: 2px solid #000;
    box-shadow: inset -2px -2px 0 rgba(0, 0, 0, 0.1);
  }

  .eye {
    position: absolute;
    top: 2px;
    right: 6px;
    width: 10px;
    height: 10px;
    background: white;
    border-radius: 50%;
    border: 2px solid #000;
  }

  .eye::after {
    content: '';
    position: absolute;
    right: 1px;
    top: 2px;
    width: 3px;
    height: 3px;
    background: #000;
    border-radius: 50%;
  }

  .wing {
    position: absolute;
    top: 12px;
    left: 4px;
    width: 14px;
    height: 8px;
    background: white;
    border-radius: 50% 50% 50% 50%;
    border: 2px solid #000;
  }

  .beak {
    position: absolute;
    top: 10px;
    right: -4px;
    width: 10px;
    height: 8px;
    background: #e74c3c;
    border-radius: 50% 50% 50% 10%;
    border: 2px solid #000;
  }

  .pipe-group {
    position: absolute;
    top: 0;
    width: 52px;
    height: 100%;
    z-index: 5;
  }

  .pipe {
    width: 100%;
    background: #73bf2e;
    border: 2px solid #543847;
    position: absolute;
    left: 0;
    box-shadow:
      inset 4px 0 0 rgba(255, 255, 255, 0.4),
      inset -4px 0 0 rgba(0, 0, 0, 0.1);
  }

  .pipe-top {
    top: 0;
    border-bottom: none;
  }

  .pipe-bottom {
    bottom: 110px;

    border-top: none;
  }

  .pipe-cap {
    width: 104%;

    height: 24px;
    background: #73bf2e;
    border: 2px solid #543847;
    position: absolute;
    left: -2%;
    box-shadow:
      inset 4px 0 0 rgba(255, 255, 255, 0.4),
      inset -4px 0 0 rgba(0, 0, 0, 0.1);
  }

  .bottom-cap {
    bottom: 0;
  }

  .top-cap {
    top: 0;
  }

  .ui-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 30;
    pointer-events: none;
  }

  .score-board {
    position: absolute;
    top: 10%;

    width: 100%;
    text-align: center;
    color: white;
    text-shadow: 2px 2px 0 #000;
    font-family: 'Impact', sans-serif;
  }

  .current-score {
    font-size: 3rem;
  }

  .high-score {
    font-size: 1rem;
    color: #f1c40f;
    margin-top: 5px;
    text-shadow: 1px 1px 0 #000;
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
    animation: fade-in 0.3s;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  .title {
    font-family: 'Impact', sans-serif;
    font-size: 3rem;
    color: #f39c12;
    text-shadow: 3px 3px 0 #000;
    margin-bottom: 2rem;
  }

  .instruction {
    color: white;
    font-weight: bold;
    font-size: 1.2rem;
    margin-bottom: 2rem;
    text-shadow: 1px 1px 0 #000;
    animation: flash 2s infinite;
  }

  @keyframes flash {
    0%,
    100% {
      opacity: 1;
    }

    50% {
      opacity: 0.5;
    }
  }

  .start-btn {
    padding: 12px 30px;
    font-size: 1.2rem;
    font-weight: bold;
    color: #543847;
    background: #e6e6e6;
    border: 2px solid #fff;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 4px 0 #999;
    transition: all 0.1s;
  }

  .start-btn:active {
    transform: translateY(4px);
    box-shadow: 0 0 0 #999;
  }

  .final-score,
  .final-best {
    color: white;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    text-shadow: 1px 1px 0 #000;
  }

  .final-best {
    color: #f1c40f;
    margin-bottom: 2rem;
  }

  .footer {
    text-align: center;
    padding: 1rem 0;
    color: var(--text-sec);
    font-size: 0.9rem;
    color: #999;
  }
</style>
