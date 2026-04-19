<template>
  <div class="whack-a-mole-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>打地鼠</h1>
        <span class="nav-subtitle">Whack-A-Mole</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="game-container glass-card">
        <div class="game-header">
          <div class="stat-box">
            <span class="label">得分</span>
            <span class="value">{{ score }}</span>
          </div>
          <div class="stat-box">
            <span class="label">时间</span>
            <span class="value">{{ timeLeft }}s</span>
          </div>
          <div class="stat-box">
            <span class="label">最高分</span>
            <span class="value">{{ highScore }}</span>
          </div>
        </div>

        <div v-if="gameState === 'idle'" class="start-screen">
          <div class="mole-icon">🐹</div>
          <h2>打地鼠</h2>
          <p>地鼠会随机出现，快速点击得分！</p>
          <div class="difficulty-select">
            <span>难度：</span>
            <button
              v-for="d in difficulties"
              :key="d.id"
              :class="['diff-btn', { active: difficulty === d.id }]"
              @click="difficulty = d.id"
            >
              {{ d.name }}
            </button>
          </div>
          <button class="start-btn" @click="startGame">开始游戏</button>
        </div>

        <div v-else-if="gameState === 'playing'" class="game-board">
          <div
            v-for="(hole, index) in holes"
            :key="index"
            class="hole"
            :class="{ active: hole.hasMole, hit: hole.isHit }"
            @click="whackMole(index)"
          >
            <div class="hole-bg">
              <div v-if="hole.hasMole" class="mole" :class="{ hit: hole.isHit }">
                <span v-if="hole.isHit">😵</span>
                <span v-else>🐹</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="gameState === 'result'" class="result-screen">
          <div class="result-icon">{{ score > highScore ? '🏆' : '🎉' }}</div>
          <h2>游戏结束!</h2>
          <div class="final-score">
            <span class="score-value">{{ score }}</span>
            <span class="score-label">分</span>
          </div>
          <p v-if="score > highScore" class="new-record">🎉 新纪录!</p>
          <div class="result-stats">
            <div class="result-stat">
              <span class="label">命中</span>
              <span class="value">{{ hits }}</span>
            </div>
            <div class="result-stat">
              <span class="label">失误</span>
              <span class="value">{{ misses }}</span>
            </div>
            <div class="result-stat">
              <span class="label">准确率</span>
              <span class="value">{{ accuracy }}%</span>
            </div>
          </div>
          <button class="retry-btn" @click="startGame">再玩一次</button>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 打地鼠</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onUnmounted } from 'vue';
  import { Back } from '@element-plus/icons-vue';

  interface Hole {
    hasMole: boolean;
    isHit: boolean;
  }

  const difficulties = [
    { id: 'easy', name: '简单' },
    { id: 'normal', name: '普通' },
    { id: 'hard', name: '困难' }
  ];

  const difficulty = ref('normal');
  const gameState = ref<'idle' | 'playing' | 'result'>('idle');
  const score = ref(0);
  const timeLeft = ref(30);
  const highScore = ref(parseInt(localStorage.getItem('whackMoleHighScore') || '0'));
  const holes = ref<Hole[]>(
    Array(9)
      .fill(null)
      .map(() => ({ hasMole: false, isHit: false }))
  );
  const hits = ref(0);
  const misses = ref(0);

  let gameTimer: number | null = null;
  let moleTimers: number[] = [];

  const accuracy = computed(() => {
    const total = hits.value + misses.value;
    return total > 0 ? Math.round((hits.value / total) * 100) : 0;
  });

  const getDifficultySettings = () => {
    switch (difficulty.value) {
      case 'easy':
        return { moleTime: 1200, interval: 1000, maxMoles: 1 };
      case 'hard':
        return { moleTime: 600, interval: 500, maxMoles: 3 };
      default:
        return { moleTime: 900, interval: 700, maxMoles: 2 };
    }
  };

  const startGame = () => {
    score.value = 0;
    timeLeft.value = 30;
    hits.value = 0;
    misses.value = 0;
    holes.value = Array(9)
      .fill(null)
      .map(() => ({ hasMole: false, isHit: false }));
    gameState.value = 'playing';

    gameTimer = window.setInterval(() => {
      timeLeft.value--;
      if (timeLeft.value <= 0) {
        endGame();
      }
    }, 1000);

    const spawnMole = () => {
      if (gameState.value !== 'playing') return;

      const currentMoles = holes.value.filter(h => h.hasMole).length;
      const settings = getDifficultySettings();

      if (currentMoles < settings.maxMoles) {
        const emptyHoles = holes.value
          .map((h, i) => ({ hole: h, index: i }))
          .filter(item => !item.hole.hasMole);

        if (emptyHoles.length > 0) {
          const randomIndex = emptyHoles[Math.floor(Math.random() * emptyHoles.length)].index;
          holes.value[randomIndex].hasMole = true;
          holes.value[randomIndex].isHit = false;

          const moleTimer = window.setTimeout(() => {
            if (holes.value[randomIndex].hasMole && !holes.value[randomIndex].isHit) {
              holes.value[randomIndex].hasMole = false;
              misses.value++;
            }
          }, settings.moleTime);
          moleTimers.push(moleTimer);
        }
      }

      if (gameState.value === 'playing') {
        setTimeout(spawnMole, settings.interval + Math.random() * 300);
      }
    };

    setTimeout(spawnMole, 500);
  };

  const whackMole = (index: number) => {
    if (gameState.value !== 'playing') return;

    const hole = holes.value[index];
    if (hole.hasMole && !hole.isHit) {
      hole.isHit = true;
      hits.value++;
      score.value += 10;

      setTimeout(() => {
        hole.hasMole = false;
        hole.isHit = false;
      }, 200);
    }
  };

  const endGame = () => {
    gameState.value = 'result';

    if (gameTimer) {
      clearInterval(gameTimer);
      gameTimer = null;
    }

    moleTimers.forEach(t => clearTimeout(t));
    moleTimers = [];

    if (score.value > highScore.value) {
      highScore.value = score.value;
      localStorage.setItem('whackMoleHighScore', String(score.value));
    }
  };

  onUnmounted(() => {
    if (gameTimer) clearInterval(gameTimer);
    moleTimers.forEach(t => clearTimeout(t));
  });
</script>

<style scoped>
  .whack-a-mole-tool {
    --bg: #f5f7fa;
    --card: #ffffff;
    --text: #2c3e50;
    --text-secondary: #7f8c8d;
    --primary: #67c23a;
    --danger: #f56c6c;
    --warning: #e6a23c;

    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    min-height: 100vh;
    background: var(--bg);
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
    color: var(--text);
  }

  .nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    display: block;
    margin-top: 1px;
  }

  .main-content {
    display: flex;
    justify-content: center;
    padding: 2rem 1rem;
    min-height: calc(100vh - 140px);
  }

  .glass-card {
    background: var(--card);
    border-radius: 20px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
    padding: 2rem;
    width: 100%;
    max-width: 500px;
  }

  .game-header {
    display: flex;
    justify-content: space-around;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #eee;
    margin-bottom: 1.5rem;
  }

  .stat-box {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-box .label {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-bottom: 4px;
  }

  .stat-box .value {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--text);
  }

  .start-screen {
    text-align: center;
    padding: 2rem 0;
  }

  .mole-icon {
    font-size: 5rem;
    margin-bottom: 1rem;
    animation: bounce 1s ease infinite;
  }

  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .start-screen h2 {
    margin: 0 0 0.5rem 0;
    color: var(--text);
  }

  .start-screen p {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
  }

  .difficulty-select {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .diff-btn {
    padding: 0.5rem 1rem;
    border: 2px solid #ddd;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--text);
  }

  .diff-btn.active {
    border-color: var(--primary);
    background: var(--primary);
    color: white;
  }

  .start-btn {
    padding: 0.8rem 2.5rem;
    font-size: 1.1rem;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition:
      transform 0.2s,
      box-shadow 0.2s;
  }

  .start-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
  }

  .game-board {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    padding: 1rem;
  }

  .hole {
    aspect-ratio: 1;
    cursor: pointer;
    border-radius: 50%;
    overflow: hidden;
    position: relative;
  }

  .hole-bg {
    width: 100%;
    height: 100%;
    background: linear-gradient(145deg, #8b4513 0%, #654321 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid #5d3a1a;
    box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  .mole {
    font-size: 2.5rem;
    animation: pop-up 0.15s ease-out;
  }

  .mole.hit {
    animation: hit 0.2s ease-out;
  }

  @keyframes pop-up {
    from {
      transform: translateY(30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes hit {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(0);
      opacity: 0;
    }
  }

  .result-screen {
    text-align: center;
    padding: 2rem 0;
  }

  .result-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .result-screen h2 {
    margin: 0 0 1rem 0;
    color: var(--text);
  }

  .final-score {
    margin-bottom: 0.5rem;
  }

  .score-value {
    font-size: 3rem;
    font-weight: 800;
    color: var(--primary);
  }

  .score-label {
    font-size: 1.2rem;
    color: var(--text-secondary);
    margin-left: 4px;
  }

  .new-record {
    color: var(--warning);
    font-weight: bold;
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }

  .result-stats {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin: 1.5rem 0;
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 12px;
  }

  .result-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .result-stat .label {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .result-stat .value {
    font-size: 1.2rem;
    font-weight: bold;
    color: var(--text);
  }

  .retry-btn {
    padding: 0.8rem 2.5rem;
    font-size: 1rem;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .retry-btn:hover {
    transform: translateY(-2px);
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
