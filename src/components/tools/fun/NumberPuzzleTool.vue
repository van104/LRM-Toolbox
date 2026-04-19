<template>
  <div class="number-puzzle-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>数字华容道</h1>
        <span class="nav-subtitle">Number Puzzle</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="puzzle-container glass-card">
        <div class="stats-bar">
          <div class="stat">
            <span class="label">步数</span>
            <span class="value">{{ moves }}</span>
          </div>
          <div class="stat">
            <span class="label">时间</span>
            <span class="value">{{ formatTime(elapsedTime) }}</span>
          </div>
          <div class="stat">
            <span class="label">最佳</span>
            <span class="value">{{ bestMoves || '-' }}</span>
          </div>
        </div>

        <div v-if="gameState === 'idle'" class="start-screen">
          <div class="puzzle-icon">🧩</div>
          <h2>数字华容道</h2>
          <p>将数字按顺序排列，空格移到右下角</p>
          <div class="size-select">
            <span>棋盘大小：</span>
            <button
              v-for="s in sizes"
              :key="s"
              :class="['size-btn', { active: boardSize === s }]"
              @click="boardSize = s"
            >
              {{ s }}×{{ s }}
            </button>
          </div>
          <button class="start-btn" @click="startGame">开始游戏</button>
        </div>

        <div v-else class="game-area">
          <div class="puzzle-board" :style="{ gridTemplateColumns: `repeat(${boardSize}, 1fr)` }">
            <div
              v-for="(num, index) in board"
              :key="index"
              :class="['tile', { empty: num === 0, movable: canMove(index) }]"
              @click="moveTile(index)"
            >
              <span v-if="num !== 0" class="tile-num">{{ num }}</span>
            </div>
          </div>

          <div class="game-controls">
            <button class="control-btn" @click="shuffleBoard">重新打乱</button>
            <button class="control-btn" @click="resetGame">返回</button>
          </div>
        </div>

        <div v-if="gameState === 'won'" class="win-overlay">
          <div class="win-card">
            <div class="win-icon">🎉</div>
            <h2>恭喜通关!</h2>
            <div class="win-stats">
              <div class="win-stat">
                <span class="label">总步数</span>
                <span class="value">{{ moves }}</span>
              </div>
              <div class="win-stat">
                <span class="label">用时</span>
                <span class="value">{{ formatTime(elapsedTime) }}</span>
              </div>
            </div>
            <p v-if="isNewRecord" class="new-record">🏆 新纪录!</p>
            <button class="retry-btn" @click="startGame">再来一局</button>
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 数字华容道</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { Back } from '@element-plus/icons-vue';

  type GameState = 'idle' | 'playing' | 'won';

  const sizes = [3, 4, 5];

  const boardSize = ref(4);
  const gameState = ref<GameState>('idle');
  const board = ref<number[]>([]);
  const emptyIndex = ref(0);
  const moves = ref(0);
  const elapsedTime = ref(0);
  const bestMoves = ref(0);
  const isNewRecord = ref(false);

  let timer: number | null = null;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isSolvable = (arr: number[]): boolean => {
    let inversions = 0;
    const size = boardSize.value;
    const filtered = arr.filter(n => n !== 0);

    for (let i = 0; i < filtered.length; i++) {
      for (let j = i + 1; j < filtered.length; j++) {
        if (filtered[i] > filtered[j]) inversions++;
      }
    }

    if (size % 2 === 1) {
      return inversions % 2 === 0;
    } else {
      const emptyRow = Math.floor(arr.indexOf(0) / size);
      const fromBottom = size - emptyRow;
      return (inversions + fromBottom) % 2 === 1;
    }
  };

  const shuffleBoard = () => {
    const size = boardSize.value;
    const total = size * size;
    let arr: number[];

    do {
      arr = [];
      const nums = Array.from({ length: total - 1 }, (_, i) => i + 1);
      nums.push(0);

      for (let i = nums.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [nums[i], nums[j]] = [nums[j], nums[i]];
      }
      arr = nums;
    } while (!isSolvable(arr));

    board.value = arr;
    emptyIndex.value = arr.indexOf(0);
  };

  const startGame = () => {
    moves.value = 0;
    elapsedTime.value = 0;
    isNewRecord.value = false;

    const bestKey = `puzzleBest_${boardSize.value}`;
    bestMoves.value = parseInt(localStorage.getItem(bestKey) || '0');

    shuffleBoard();
    gameState.value = 'playing';

    if (timer) clearInterval(timer);
    timer = window.setInterval(() => {
      elapsedTime.value++;
    }, 1000);
  };

  const resetGame = () => {
    if (timer) clearInterval(timer);
    gameState.value = 'idle';
  };

  const canMove = (index: number): boolean => {
    const size = boardSize.value;
    const row = Math.floor(index / size);
    const col = index % size;
    const emptyRow = Math.floor(emptyIndex.value / size);
    const emptyCol = emptyIndex.value % size;

    return (
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow)
    );
  };

  const moveTile = (index: number) => {
    if (gameState.value !== 'playing') return;
    if (!canMove(index)) return;

    [board.value[index], board.value[emptyIndex.value]] = [
      board.value[emptyIndex.value],
      board.value[index]
    ];
    emptyIndex.value = index;
    moves.value++;

    if (checkWin()) {
      if (timer) clearInterval(timer);
      gameState.value = 'won';

      const bestKey = `puzzleBest_${boardSize.value}`;
      const currentBest = parseInt(localStorage.getItem(bestKey) || '0');
      if (moves.value < currentBest || currentBest === 0) {
        isNewRecord.value = true;
        localStorage.setItem(bestKey, String(moves.value));
        bestMoves.value = moves.value;
      }
    }
  };

  const checkWin = (): boolean => {
    const size = boardSize.value;
    const total = size * size;
    for (let i = 0; i < total - 1; i++) {
      if (board.value[i] !== i + 1) return false;
    }
    return board.value[total - 1] === 0;
  };
</script>

<style scoped>
  .number-puzzle-tool {
    --bg: #f5f7fa;
    --card: #ffffff;
    --text: #2c3e50;
    --text-secondary: #7f8c8d;
    --primary: #3498db;
    --success: #27ae60;

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

  .puzzle-container {
    background: var(--card);
    border-radius: 20px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
    padding: 1.5rem;
    width: 100%;
    max-width: 450px;
    position: relative;
  }

  .stats-bar {
    display: flex;
    justify-content: space-around;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;
    margin-bottom: 1.5rem;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .stat .label {
    font-size: 0.8rem;
    color: var(--text-secondary);
  }
  .stat .value {
    font-size: 1.3rem;
    font-weight: bold;
    color: var(--text);
  }

  .start-screen {
    text-align: center;
    padding: 2rem 0;
  }
  .puzzle-icon {
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

  .size-select {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }
  .size-btn {
    padding: 0.5rem 1rem;
    border: 2px solid #ddd;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    color: var(--text);
  }
  .size-btn.active {
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

  .game-area {
    text-align: center;
  }

  .puzzle-board {
    display: grid;
    gap: 8px;
    padding: 16px;
    background: #2c3e50;
    border-radius: 12px;
    margin-bottom: 1rem;
  }

  .tile {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(145deg, #3d566e, #2c3e50);
    border-radius: 8px;
    cursor: default;
    transition: all 0.15s;
  }

  .tile:not(.empty):not(.movable) {
    box-shadow:
      inset 2px 2px 5px rgba(0, 0, 0, 0.3),
      inset -2px -2px 5px rgba(255, 255, 255, 0.1);
  }

  .tile.movable {
    cursor: pointer;
    background: linear-gradient(145deg, #4a6785, #3d566e);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  .tile.movable:hover {
    transform: scale(1.02);
    background: linear-gradient(145deg, #5a7795, #4d6775);
  }

  .tile.empty {
    background: transparent;
    box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.4);
  }

  .tile-num {
    font-size: 1.8rem;
    font-weight: bold;
    color: white;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }

  .game-controls {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }
  .control-btn {
    padding: 0.6rem 1.5rem;
    border: 2px solid #ddd;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    color: var(--text);
    font-size: 0.95rem;
  }

  .win-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 20px;
  }

  .win-card {
    text-align: center;
    padding: 2rem;
  }
  .win-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
  .win-card h2 {
    margin: 0 0 1rem 0;
    color: var(--text);
  }

  .win-stats {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 1rem;
  }

  .win-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .win-stat .label {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }
  .win-stat .value {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--primary);
  }

  .new-record {
    color: #e6a23c;
    font-weight: bold;
    margin-bottom: 1rem;
  }

  .retry-btn {
    padding: 0.8rem 2.5rem;
    font-size: 1rem;
    background: var(--success);
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
