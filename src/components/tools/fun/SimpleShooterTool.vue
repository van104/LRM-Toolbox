<template>
  <div class="shooter-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>2D 射击游戏</h1>
        <span class="nav-subtitle">Simple Shooter</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="game-wrapper">
        <div ref="containerRef" class="canvas-container">
          <canvas ref="canvasRef"></canvas>

          <div class="ui-layer">
            <div class="hud">
              <div class="score">SCORE: {{ score }}</div>
              <div class="health-bar">
                <div class="health-fill" :style="{ width: playerHealth + '%' }"></div>
              </div>
            </div>

            <div v-if="gameState === 'start'" class="overlay start-screen">
              <div class="title">SHOOTER</div>
              <div class="instruction">
                <p><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> 移动</p>
                <p>
                  <el-icon class="mouse-icon">
                    <Aim />
                  </el-icon>
                  鼠标瞄准射击
                </p>
              </div>
              <button class="start-btn" @click="startGame">开始游戏</button>
            </div>

            <div v-if="gameState === 'gameover'" class="overlay gameover-screen">
              <div class="title">GAME OVER</div>
              <div class="final-score">得分: {{ score }}</div>
              <button class="start-btn" @click="startGame">重新开始</button>
            </div>
          </div>
        </div>
      </div>

      <div class="rules-hint">
        <p>
          <el-icon>
            <InfoFilled />
          </el-icon>
          保持移动，不要被敌人碰到！
        </p>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 射击游戏</footer>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { Back, Aim, InfoFilled } from '@element-plus/icons-vue';

  const canvasRef = ref(null);
  const containerRef = ref(null);

  const gameState = ref('start');
  const score = ref(0);
  const playerHealth = ref(100);

  const PLAYER_SPEED = 4;
  const BULLET_SPEED = 10;
  const ENEMY_BASE_SPEED = 2;
  const PLAYER_RADIUS = 15;
  const BULLET_RADIUS = 4;
  const ENEMY_RADIUS = 15;
  const FIRE_RATE = 150;

  let player = { x: 0, y: 0, angle: 0 };
  let bullets = [];
  let enemies = [];
  let particles = [];
  let keys = { w: false, a: false, s: false, d: false };
  let mouse = { x: 0, y: 0 };
  let lastFireTime = 0;
  let animationId = null;
  let spawnIntervalId = null;
  let width = 0;
  let height = 0;
  let ctx = null;

  const initCanvas = () => {
    if (!containerRef.value || !canvasRef.value) return;
    width = containerRef.value.clientWidth;
    height = containerRef.value.clientHeight;
    canvasRef.value.width = width;
    canvasRef.value.height = height;
    ctx = canvasRef.value.getContext('2d');

    player.x = width / 2;
    player.y = height / 2;
  };

  const startGame = () => {
    initCanvas();
    gameState.value = 'playing';
    score.value = 0;
    playerHealth.value = 100;
    bullets = [];
    enemies = [];
    particles = [];
    player.x = width / 2;
    player.y = height / 2;

    if (animationId) cancelAnimationFrame(animationId);
    if (spawnIntervalId) clearInterval(spawnIntervalId);

    spawnIntervalId = setInterval(spawnEnemy, 1000);
    gameLoop();
  };

  const gameOver = () => {
    gameState.value = 'gameover';
    if (animationId) cancelAnimationFrame(animationId);
    if (spawnIntervalId) clearInterval(spawnIntervalId);
  };

  const gameLoop = () => {
    if (gameState.value !== 'playing') return;

    update();
    draw();
    animationId = requestAnimationFrame(gameLoop);
  };

  const update = () => {
    if (keys.w && player.y > PLAYER_RADIUS) player.y -= PLAYER_SPEED;
    if (keys.s && player.y < height - PLAYER_RADIUS) player.y += PLAYER_SPEED;
    if (keys.a && player.x > PLAYER_RADIUS) player.x -= PLAYER_SPEED;
    if (keys.d && player.x < width - PLAYER_RADIUS) player.x += PLAYER_SPEED;

    const dx = mouse.x - player.x;
    const dy = mouse.y - player.y;
    player.angle = Math.atan2(dy, dx);

    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += Math.cos(b.angle) * BULLET_SPEED;
      b.y += Math.sin(b.angle) * BULLET_SPEED;

      if (b.x < 0 || b.x > width || b.y < 0 || b.y > height) {
        bullets.splice(i, 1);
      }
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      const angle = Math.atan2(player.y - e.y, player.x - e.x);
      e.x += Math.cos(angle) * e.speed;
      e.y += Math.sin(angle) * e.speed;

      const distToPlayer = Math.hypot(player.x - e.x, player.y - e.y);
      if (distToPlayer < PLAYER_RADIUS + ENEMY_RADIUS) {
        damagePlayer(20);
        createExplosion(e.x, e.y, '#f56c6c');
        enemies.splice(i, 1);
        continue;
      }

      for (let j = bullets.length - 1; j >= 0; j--) {
        const b = bullets[j];
        const distToBullet = Math.hypot(b.x - e.x, b.y - e.y);

        if (distToBullet < BULLET_RADIUS + ENEMY_RADIUS) {
          createExplosion(e.x, e.y, '#f56c6c');
          enemies.splice(i, 1);
          bullets.splice(j, 1);
          score.value += 10;
          break;
        }
      }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.alpha -= 0.05;
      p.x += p.vx;
      p.y += p.vy;

      if (p.alpha <= 0) {
        particles.splice(i, 1);
      }
    }
  };

  const draw = () => {
    if (!ctx) return;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#1a1a1a';
    ctx.clearRect(0, 0, width, height);

    drawGrid();

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    ctx.fillStyle = '#409eff';
    ctx.beginPath();

    ctx.moveTo(PLAYER_RADIUS, 0);
    ctx.lineTo(-PLAYER_RADIUS, -PLAYER_RADIUS * 0.8);
    ctx.lineTo(-PLAYER_RADIUS * 0.5, 0);
    ctx.lineTo(-PLAYER_RADIUS, PLAYER_RADIUS * 0.8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#e6a23c';
    bullets.forEach(b => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, BULLET_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#f56c6c';
    enemies.forEach(e => {
      ctx.beginPath();
      ctx.arc(e.x, e.y, ENEMY_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    });

    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  };

  const drawGrid = () => {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    const gridSize = 50;

    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const spawnEnemy = () => {
    const edge = Math.floor(Math.random() * 4);
    let x, y;

    switch (edge) {
      case 0:
        x = Math.random() * width;
        y = -ENEMY_RADIUS;
        break;
      case 1:
        x = width + ENEMY_RADIUS;
        y = Math.random() * height;
        break;
      case 2:
        x = Math.random() * width;
        y = height + ENEMY_RADIUS;
        break;
      case 3:
        x = -ENEMY_RADIUS;
        y = Math.random() * height;
        break;
    }

    const speed = ENEMY_BASE_SPEED + Math.random() * 1.5 + score.value / 200;
    enemies.push({ x, y, speed });
  };

  const shoot = () => {
    if (gameState.value !== 'playing') return;

    const now = Date.now();
    if (now - lastFireTime > FIRE_RATE) {
      bullets.push({
        x: player.x + Math.cos(player.angle) * PLAYER_RADIUS,
        y: player.y + Math.sin(player.angle) * PLAYER_RADIUS,
        angle: player.angle
      });
      lastFireTime = now;
    }
  };

  const damagePlayer = amount => {
    playerHealth.value -= amount;
    if (playerHealth.value <= 0) {
      playerHealth.value = 0;
      createExplosion(player.x, player.y, '#409eff', 20);
      gameOver();
    }
  };

  const createExplosion = (x, y, color, count = 8) => {
    for (let i = 0; i < count; i++) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        radius: Math.random() * 3,
        color: color,
        alpha: 1
      });
    }
  };

  const handleKeydown = e => {
    if (e.key === 'w' || e.key === 'W') keys.w = true;
    if (e.key === 's' || e.key === 'S') keys.s = true;
    if (e.key === 'a' || e.key === 'A') keys.a = true;
    if (e.key === 'd' || e.key === 'D') keys.d = true;
  };

  const handleKeyup = e => {
    if (e.key === 'w' || e.key === 'W') keys.w = false;
    if (e.key === 's' || e.key === 'S') keys.s = false;
    if (e.key === 'a' || e.key === 'A') keys.a = false;
    if (e.key === 'd' || e.key === 'D') keys.d = false;
  };

  const handleMouseMove = e => {
    if (!canvasRef.value) return;
    const rect = canvasRef.value.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  };

  const handleMouseDown = () => {
    if (gameState.value === 'playing') {
      shoot();
    }
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('keyup', handleKeyup);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
    window.removeEventListener('keyup', handleKeyup);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mousedown', handleMouseDown);
    if (animationId) cancelAnimationFrame(animationId);
    if (spawnIntervalId) clearInterval(spawnIntervalId);
  });
</script>

<style scoped>
  .shooter-tool {
    --bg: #f5f7fa;
    --card: #ffffff;
    --text: #2c3e50;
    --text-sec: #7f8c8d;

    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    min-height: 100vh;
    background: var(--bg);
    display: flex;
    flex-direction: column;
    user-select: none;
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
    color: var(--text-sec);
    cursor: pointer;
    font-size: 0.95rem;
  }

  .nav-back:hover {
    color: #409eff;
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
    color: var(--text-sec);
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
    padding: 1.5rem;
    gap: 1rem;
  }

  .game-wrapper {
    width: 100%;
    max-width: 800px;
    aspect-ratio: 4/3;
    background: #000;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    position: relative;
    border: 4px solid #333;
  }

  .canvas-container {
    width: 100%;
    height: 100%;
    position: relative;
    cursor: crosshair;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }

  .ui-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .hud {
    position: absolute;
    top: 20px;
    left: 20px;
    right: 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .score {
    color: #fff;
    font-family: 'Courier New', monospace;
    font-weight: bold;
    font-size: 1.5rem;
    text-shadow: 2px 2px 0 #000;
  }

  .health-bar {
    width: 200px;
    height: 10px;
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid #fff;
    border-radius: 6px;
    overflow: hidden;
  }

  .health-fill {
    height: 100%;
    background: #67c23a;
    transition: width 0.2s;
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
    color: #fff;
  }

  .title {
    font-size: 4rem;
    font-weight: 900;
    letter-spacing: 4px;
    margin-bottom: 2rem;
    background: linear-gradient(45deg, #409eff, #e6a23c);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  }

  .instruction {
    margin-bottom: 3rem;
    text-align: center;
  }

  .instruction p {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin: 10px 0;
    font-size: 1.1rem;
  }

  kbd {
    background: #333;
    padding: 2px 6px;
    border-radius: 4px;
    border-bottom: 2px solid #000;
    font-family: monospace;
  }

  .start-btn {
    padding: 12px 40px;
    font-size: 1.2rem;
    font-weight: bold;
    background: #fff;
    border: none;
    border-radius: 30px;
    cursor: pointer;
    transition: all 0.2s;
    color: #000;
  }

  .start-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
  }

  .rules-hint {
    color: var(--text-sec);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .footer {
    text-align: center;
    padding: 1rem 0;
    color: #999;
    font-size: 0.9rem;
    border-top: 1px solid #eef2f7;
    background: var(--card);
  }
</style>
