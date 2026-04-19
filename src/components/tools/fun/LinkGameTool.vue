<template>
  <div class="link-game-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>连连看</h1>
        <span class="nav-subtitle">Link Game</span>
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
            <span class="label">剩余</span>
            <span class="value">{{ remainingPairs }}</span>
          </div>
        </div>

        <div v-if="gameState === 'idle'" class="start-screen">
          <div class="game-icon">🎮</div>
          <h2>连连看</h2>
          <p>找出相同的图案，用不超过两个转折的线连接消除</p>
          <div class="difficulty-select">
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

        <div v-else-if="gameState === 'playing'" class="game-board-container">
          <div class="game-board" :style="{ gridTemplateColumns: `repeat(${cols}, 1fr)` }">
            <div
              v-for="(tile, index) in board"
              :key="index"
              class="tile"
              :class="{ selected: selectedIndex === index, empty: tile === null }"
              @click="selectTile(index)"
            >
              <span v-if="tile !== null" class="tile-icon">{{ icons[tile] }}</span>
            </div>
          </div>
          <canvas ref="lineCanvas" class="line-canvas"></canvas>
        </div>

        <div v-else-if="gameState === 'result'" class="result-screen">
          <div class="result-icon">{{ won ? '🎉' : '⏰' }}</div>
          <h2>{{ won ? '恭喜通关!' : '时间到!' }}</h2>
          <div class="final-score">
            <span class="score-value">{{ score }}</span>
            <span class="score-label">分</span>
          </div>
          <div class="result-stats">
            <div class="result-stat">
              <span class="label">消除</span>
              <span class="value">{{ totalPairs - remainingPairs }}/{{ totalPairs }}</span>
            </div>
            <div class="result-stat">
              <span class="label">用时</span>
              <span class="value">{{ totalTime - timeLeft }}s</span>
            </div>
          </div>
          <button class="retry-btn" @click="startGame">再来一局</button>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 连连看</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, nextTick } from 'vue';
  import { Back } from '@element-plus/icons-vue';

  type GameState = 'idle' | 'playing' | 'result';

  const icons = [
    '🍎',
    '🍊',
    '🍋',
    '🍇',
    '🍓',
    '🍑',
    '🥝',
    '🍒',
    '🍌',
    '🥭',
    '🍍',
    '🥥',
    '🍉',
    '🍈',
    '🫐'
  ];

  const difficulties = [
    { id: 'easy', name: '简单', rows: 4, cols: 6, time: 180 },
    { id: 'normal', name: '普通', rows: 6, cols: 8, time: 240 },
    { id: 'hard', name: '困难', rows: 8, cols: 10, time: 300 }
  ];

  const difficulty = ref('normal');
  const gameState = ref<GameState>('idle');
  const board = ref<(number | null)[]>([]);
  const rows = ref(6);
  const cols = ref(8);
  const score = ref(0);
  const timeLeft = ref(240);
  const totalTime = ref(240);
  const selectedIndex = ref<number | null>(null);
  const remainingPairs = ref(0);
  const totalPairs = ref(0);
  const won = ref(false);
  const lineCanvas = ref<HTMLCanvasElement | null>(null);

  let timer: number | null = null;

  const generateBoard = () => {
    const config = difficulties.find(d => d.id === difficulty.value)!;
    rows.value = config.rows;
    cols.value = config.cols;
    timeLeft.value = config.time;
    totalTime.value = config.time;

    const totalTiles = config.rows * config.cols;
    const pairsNeeded = totalTiles / 2;
    totalPairs.value = pairsNeeded;
    remainingPairs.value = pairsNeeded;

    const iconCount = Math.min(pairsNeeded, icons.length);
    let tiles: number[] = [];

    for (let i = 0; i < pairsNeeded; i++) {
      const iconIndex = i % iconCount;
      tiles.push(iconIndex, iconIndex);
    }

    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }

    board.value = tiles;
  };

  const startGame = () => {
    score.value = 0;
    selectedIndex.value = null;
    won.value = false;
    generateBoard();
    gameState.value = 'playing';

    if (timer) clearInterval(timer);
    timer = window.setInterval(() => {
      timeLeft.value--;
      if (timeLeft.value <= 0) {
        endGame(false);
      }
    }, 1000);
  };

  const selectTile = (index: number) => {
    if (board.value[index] === null) return;

    if (selectedIndex.value === null) {
      selectedIndex.value = index;
    } else if (selectedIndex.value === index) {
      selectedIndex.value = null;
    } else {
      if (board.value[selectedIndex.value] === board.value[index]) {
        if (canConnect(selectedIndex.value, index)) {
          drawLine(selectedIndex.value, index);

          setTimeout(() => {
            clearCanvas();
            board.value[selectedIndex.value!] = null;
            board.value[index] = null;
            selectedIndex.value = null;
            score.value += 10;
            remainingPairs.value--;

            if (remainingPairs.value === 0) {
              endGame(true);
            }
          }, 300);
          return;
        }
      }
      selectedIndex.value = index;
    }
  };

  const canConnect = (a: number, b: number): boolean => {
    const rowA = Math.floor(a / cols.value);
    const colA = a % cols.value;
    const rowB = Math.floor(b / cols.value);
    const colB = b % cols.value;

    if (rowA === rowB && colA === colB) return false;

    const isEmpty = (row: number, col: number): boolean => {
      if (row < -1 || row > rows.value || col < -1 || col > cols.value) return false;
      if (row === -1 || row === rows.value || col === -1 || col === cols.value) return true;
      const idx = row * cols.value + col;
      return board.value[idx] === null || idx === a || idx === b;
    };

    // 直线连接
    if (checkStraightLine(rowA, colA, rowB, colB, isEmpty)) return true;

    // 一个转折
    if (checkOneTurn(rowA, colA, rowB, colB, isEmpty)) return true;

    // 两个转折
    if (checkTwoTurns(rowA, colA, rowB, colB, isEmpty)) return true;

    return false;
  };

  const checkStraightLine = (
    r1: number,
    c1: number,
    r2: number,
    c2: number,
    isEmpty: (row: number, col: number) => boolean
  ): boolean => {
    if (r1 === r2) {
      const minC = Math.min(c1, c2);
      const maxC = Math.max(c1, c2);
      for (let c = minC + 1; c < maxC; c++) {
        if (!isEmpty(r1, c)) return false;
      }
      return true;
    }
    if (c1 === c2) {
      const minR = Math.min(r1, r2);
      const maxR = Math.max(r1, r2);
      for (let r = minR + 1; r < maxR; r++) {
        if (!isEmpty(r, c1)) return false;
      }
      return true;
    }
    return false;
  };

  const checkOneTurn = (
    r1: number,
    c1: number,
    r2: number,
    c2: number,
    isEmpty: (row: number, col: number) => boolean
  ): boolean => {
    if (
      isEmpty(r1, c2) &&
      checkStraightLine(r1, c1, r1, c2, isEmpty) &&
      checkStraightLine(r1, c2, r2, c2, isEmpty)
    ) {
      return true;
    }
    if (
      isEmpty(r2, c1) &&
      checkStraightLine(r1, c1, r2, c1, isEmpty) &&
      checkStraightLine(r2, c1, r2, c2, isEmpty)
    ) {
      return true;
    }
    return false;
  };

  const checkTwoTurns = (
    r1: number,
    c1: number,
    r2: number,
    c2: number,
    isEmpty: (row: number, col: number) => boolean
  ): boolean => {
    // 水平方向延伸
    for (let c = -1; c <= cols.value; c++) {
      if (c !== c1 && c !== c2) {
        if (isEmpty(r1, c) && isEmpty(r2, c)) {
          if (
            checkStraightLine(r1, c1, r1, c, isEmpty) &&
            checkStraightLine(r1, c, r2, c, isEmpty) &&
            checkStraightLine(r2, c, r2, c2, isEmpty)
          ) {
            return true;
          }
        }
      }
    }
    // 垂直方向延伸
    for (let r = -1; r <= rows.value; r++) {
      if (r !== r1 && r !== r2) {
        if (isEmpty(r, c1) && isEmpty(r, c2)) {
          if (
            checkStraightLine(r1, c1, r, c1, isEmpty) &&
            checkStraightLine(r, c1, r, c2, isEmpty) &&
            checkStraightLine(r, c2, r2, c2, isEmpty)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const drawLine = (a: number, b: number) => {
    if (!lineCanvas.value) return;
    const canvas = lineCanvas.value;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameBoard = document.querySelector('.game-board');
    if (!gameBoard) return;

    const rect = gameBoard.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const tileSize = rect.width / cols.value;
    const r1 = Math.floor(a / cols.value);
    const c1 = a % cols.value;
    const r2 = Math.floor(b / cols.value);
    const c2 = b % cols.value;

    const x1 = c1 * tileSize + tileSize / 2;
    const y1 = r1 * tileSize + tileSize / 2;
    const x2 = c2 * tileSize + tileSize / 2;
    const y2 = r2 * tileSize + tileSize / 2;

    ctx.strokeStyle = '#67c23a';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  const clearCanvas = () => {
    if (!lineCanvas.value) return;
    const ctx = lineCanvas.value.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, lineCanvas.value.width, lineCanvas.value.height);
    }
  };

  const endGame = (isWin: boolean) => {
    if (timer) clearInterval(timer);
    won.value = isWin;
    if (isWin) {
      score.value += timeLeft.value * 2;
    }
    gameState.value = 'result';
  };

  onMounted(() => {
    nextTick(() => {
      if (lineCanvas.value) {
        const gameBoard = document.querySelector('.game-board');
        if (gameBoard) {
          const rect = gameBoard.getBoundingClientRect();
          lineCanvas.value.width = rect.width;
          lineCanvas.value.height = rect.height;
        }
      }
    });
  });
</script>

<style scoped>
  .link-game-tool {
    --bg: #f5f7fa;
    --card: #ffffff;
    --text: #2c3e50;
    --text-secondary: #7f8c8d;
    --primary: #409eff;
    --success: #67c23a;

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
    padding: 1.5rem;
    width: 100%;
    max-width: 600px;
  }

  .game-header {
    display: flex;
    justify-content: space-around;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;
    margin-bottom: 1rem;
  }

  .stat-box {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .stat-box .label {
    font-size: 0.8rem;
    color: var(--text-secondary);
  }
  .stat-box .value {
    font-size: 1.3rem;
    font-weight: bold;
    color: var(--text);
  }

  .start-screen {
    text-align: center;
    padding: 2rem 0;
  }
  .game-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
  .start-screen h2 {
    margin: 0 0 0.5rem 0;
    color: var(--text);
  }
  .start-screen p {
    color: var(--text-secondary);
    margin-bottom: 1rem;
  }

  .difficulty-select {
    display: flex;
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
    color: var(--text);
    transition: all 0.2s;
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
  }

  .game-board-container {
    position: relative;
  }
  .game-board {
    display: grid;
    gap: 4px;
    padding: 8px;
    background: #f0f0f0;
    border-radius: 12px;
  }

  .tile {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    border: 2px solid transparent;
  }

  .tile:hover:not(.empty) {
    transform: scale(1.05);
  }
  .tile.selected {
    border-color: var(--primary);
    background: #e6f0ff;
  }
  .tile.empty {
    background: transparent;
    cursor: default;
  }

  .tile-icon {
    font-size: 1.5rem;
  }

  .line-canvas {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 10;
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
    margin-bottom: 1rem;
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
