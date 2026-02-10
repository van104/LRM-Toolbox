<template>
  <div class="tictactoe-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>井字棋</h1>
        <span class="nav-subtitle">Tic-Tac-Toe</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="layout-grid" :class="{ 'settings-collapsed': !settingsExpanded }">
        <div class="board-section glass-card">
          <div class="game-status">
            <div class="status-indicator" :class="{ 'is-active': !gameOver }">
              <span class="current-player">
                <span class="player-icon" :class="currentPlayer">{{
                  currentPlayer === 'X' ? '✕' : '○'
                }}</span>
                {{ currentPlayerName }} 的回合
              </span>
            </div>
            <div v-if="gameOver" class="winner-display">
              <span v-if="winner" class="winner-text">🎉 {{ winnerName }} 获胜！</span>
              <span v-else class="draw-text">🤝 平局！</span>
            </div>
          </div>

          <div class="board-container">
            <div class="board">
              <div
                v-for="(cell, index) in board"
                :key="index"
                class="board-cell"
                :class="{ 'winning-cell': isWinningCell(index) }"
                @click="makeMove(index)"
              >
                <Transition name="pop">
                  <span v-if="cell" class="cell-content" :class="cell">
                    {{ cell === 'X' ? '✕' : '○' }}
                  </span>
                </Transition>

                <span
                  v-if="!cell && canPlace(index) && hoverCell === index"
                  class="cell-preview"
                  :class="currentPlayer"
                >
                  {{ currentPlayer === 'X' ? '✕' : '○' }}
                </span>
              </div>
            </div>
          </div>

          <div class="game-controls">
            <button class="control-btn primary" @click="restartGame">
              <el-icon>
                <Refresh />
              </el-icon>
              重新开始
            </button>
            <button
              class="control-btn"
              :disabled="moveHistory.length === 0 || gameOver"
              @click="undoMove"
            >
              <el-icon>
                <RefreshLeft />
              </el-icon>
              悔棋
            </button>
            <button class="control-btn" @click="settingsExpanded = !settingsExpanded">
              <el-icon>
                <Setting />
              </el-icon>
              {{ settingsExpanded ? '收起设置' : '游戏设置' }}
            </button>
          </div>
        </div>

        <Transition name="slide-fade">
          <div v-show="settingsExpanded" class="settings-section glass-card">
            <div class="settings-header">
              <h2>游戏设置</h2>
              <button class="close-btn" @click="settingsExpanded = false">
                <el-icon>
                  <Close />
                </el-icon>
              </button>
            </div>

            <div class="settings-group">
              <h3>游戏模式</h3>
              <div class="mode-selector">
                <button
                  v-for="mode in gameModes"
                  :key="mode.value"
                  class="mode-btn"
                  :class="{ active: gameMode === mode.value }"
                  @click="setGameMode(mode.value)"
                >
                  <el-icon>
                    <component :is="mode.icon" />
                  </el-icon>
                  {{ mode.label }}
                </button>
              </div>
            </div>

            <div v-if="gameMode === 'ai'" class="settings-group">
              <h3>AI 难度</h3>
              <div class="difficulty-selector">
                <button
                  v-for="diff in difficulties"
                  :key="diff.value"
                  class="diff-btn"
                  :class="{ active: aiDifficulty === diff.value }"
                  @click="aiDifficulty = diff.value"
                >
                  {{ diff.label }}
                </button>
              </div>
            </div>

            <div class="settings-group">
              <h3>先手选择</h3>
              <div class="first-selector">
                <button
                  class="first-btn"
                  :class="{ active: playerFirst }"
                  @click="setPlayerFirst(true)"
                >
                  <span class="player-icon X">✕</span> 玩家先手 (X)
                </button>
                <button
                  class="first-btn"
                  :class="{ active: !playerFirst }"
                  @click="setPlayerFirst(false)"
                >
                  <span class="player-icon O">○</span>
                  {{ gameMode === 'ai' ? 'AI 先手 (X)' : '对手先手 (X)' }}
                </button>
              </div>
            </div>

            <div class="game-stats">
              <h3>对局统计</h3>
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-value">{{ stats.wins }}</span>
                  <span class="stat-label">胜利</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ stats.losses }}</span>
                  <span class="stat-label">失败</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ stats.draws }}</span>
                  <span class="stat-label">平局</span>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 井字棋</footer>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, nextTick } from 'vue';
  import {
    Back,
    Refresh,
    RefreshLeft,
    User,
    Monitor,
    Setting,
    Close
  } from '@element-plus/icons-vue';

  const board = ref(Array(9).fill(null));
  const currentPlayer = ref('X');
  const gameOver = ref(false);
  const winner = ref(null);
  const winningCells = ref([]);
  const moveHistory = ref([]);
  const hoverCell = ref(null);

  const gameMode = ref('ai');
  const playerFirst = ref(true);
  const aiDifficulty = ref('hard');
  const settingsExpanded = ref(false);
  const isAIThinking = ref(false);

  const gameModes = [
    { value: 'pvp', label: '双人对弈', icon: User },
    { value: 'ai', label: '人机对战', icon: Monitor }
  ];

  const difficulties = [
    { value: 'easy', label: '简单' },
    { value: 'medium', label: '中等' },
    { value: 'hard', label: '困难' }
  ];

  const stats = ref({
    wins: 0,
    losses: 0,
    draws: 0
  });

  const currentPlayerName = computed(() => {
    if (gameMode.value === 'ai') {
      return currentPlayer.value === 'X'
        ? playerFirst.value
          ? '玩家'
          : 'AI'
        : playerFirst.value
          ? 'AI'
          : '玩家';
    }
    return currentPlayer.value === 'X' ? '玩家 X' : '玩家 O';
  });

  const winnerName = computed(() => {
    if (!winner.value) return '';
    if (gameMode.value === 'ai') {
      const isPlayerX = playerFirst.value;
      const isWinnerX = winner.value === 'X';
      return isPlayerX === isWinnerX ? '玩家' : 'AI';
    }
    return winner.value === 'X' ? '玩家 X' : '玩家 O';
  });

  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  const initBoard = () => {
    board.value = Array(9).fill(null);
    currentPlayer.value = 'X';
    gameOver.value = false;
    winner.value = null;
    winningCells.value = [];
    moveHistory.value = [];
    isAIThinking.value = false;
  };

  const restartGame = () => {
    initBoard();

    if (gameMode.value === 'ai' && !playerFirst.value) {
      nextTick(() => aiMove());
    }
  };

  const setGameMode = mode => {
    gameMode.value = mode;
    restartGame();
  };

  const setPlayerFirst = first => {
    playerFirst.value = first;
    restartGame();
  };

  const canPlace = index => {
    if (gameOver.value) return false;
    if (board.value[index]) return false;
    if (gameMode.value === 'ai' && isAIThinking.value) return false;
    if (gameMode.value === 'ai') {
      const isPlayerTurn = (currentPlayer.value === 'X') === playerFirst.value;
      if (!isPlayerTurn) return false;
    }
    return true;
  };

  const makeMove = index => {
    if (!canPlace(index)) return;
    placeMove(index);
  };

  const placeMove = index => {
    board.value[index] = currentPlayer.value;
    moveHistory.value.push({ index, player: currentPlayer.value });

    if (checkWin(currentPlayer.value)) {
      gameOver.value = true;
      winner.value = currentPlayer.value;
      updateStats();
      return;
    }

    if (moveHistory.value.length === 9) {
      gameOver.value = true;
      stats.value.draws++;
      saveStats();
      return;
    }

    currentPlayer.value = currentPlayer.value === 'X' ? 'O' : 'X';

    if (gameMode.value === 'ai' && !gameOver.value) {
      const isAITurn = (currentPlayer.value === 'X') !== playerFirst.value;
      if (isAITurn) {
        nextTick(() => aiMove());
      }
    }
  };

  const undoMove = () => {
    if (moveHistory.value.length === 0 || gameOver.value) return;

    const stepsToUndo = gameMode.value === 'ai' ? 2 : 1;

    for (let i = 0; i < stepsToUndo && moveHistory.value.length > 0; i++) {
      const lastMove = moveHistory.value.pop();
      board.value[lastMove.index] = null;
      currentPlayer.value = lastMove.player;
    }
  };

  const checkWin = player => {
    for (const pattern of winPatterns) {
      if (pattern.every(index => board.value[index] === player)) {
        winningCells.value = pattern;
        return true;
      }
    }
    return false;
  };

  const isWinningCell = index => {
    return winningCells.value.includes(index);
  };

  const aiMove = async () => {
    if (gameOver.value) return;

    isAIThinking.value = true;

    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 300));

    const aiSymbol = playerFirst.value ? 'O' : 'X';
    const playerSymbol = playerFirst.value ? 'X' : 'O';

    let move;
    if (aiDifficulty.value === 'hard') {
      move = findBestMove(aiSymbol, playerSymbol);
    } else if (aiDifficulty.value === 'medium') {
      move = Math.random() < 0.7 ? findBestMove(aiSymbol, playerSymbol) : findRandomMove();
    } else {
      move = Math.random() < 0.4 ? findBestMove(aiSymbol, playerSymbol) : findRandomMove();
    }

    isAIThinking.value = false;

    if (move !== null) {
      placeMove(move);
    }
  };

  const findRandomMove = () => {
    const emptyCells = board.value
      .map((cell, index) => (cell === null ? index : null))
      .filter(index => index !== null);
    if (emptyCells.length === 0) return null;
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  };

  const findBestMove = (aiSymbol, playerSymbol) => {
    let bestScore = -Infinity;
    let bestMove = null;

    for (let i = 0; i < 9; i++) {
      if (board.value[i] === null) {
        board.value[i] = aiSymbol;
        const score = minimax(board.value, 0, false, aiSymbol, playerSymbol);
        board.value[i] = null;

        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }

    return bestMove;
  };

  const minimax = (boardState, depth, isMaximizing, aiSymbol, playerSymbol) => {
    if (checkWinFor(boardState, aiSymbol)) return 10 - depth;
    if (checkWinFor(boardState, playerSymbol)) return depth - 10;
    if (boardState.every(cell => cell !== null)) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (boardState[i] === null) {
          boardState[i] = aiSymbol;
          const score = minimax(boardState, depth + 1, false, aiSymbol, playerSymbol);
          boardState[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (boardState[i] === null) {
          boardState[i] = playerSymbol;
          const score = minimax(boardState, depth + 1, true, aiSymbol, playerSymbol);
          boardState[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const checkWinFor = (boardState, player) => {
    return winPatterns.some(pattern => pattern.every(index => boardState[index] === player));
  };

  const updateStats = () => {
    if (gameMode.value === 'ai') {
      const isPlayerWinner = (winner.value === 'X') === playerFirst.value;
      if (isPlayerWinner) {
        stats.value.wins++;
      } else {
        stats.value.losses++;
      }
    }
    saveStats();
  };

  const saveStats = () => {
    localStorage.setItem('tictactoe-stats', JSON.stringify(stats.value));
  };

  const loadStats = () => {
    const saved = localStorage.getItem('tictactoe-stats');
    if (saved) {
      stats.value = JSON.parse(saved);
    }
  };

  onMounted(() => {
    loadStats();
    initBoard();
  });
</script>

<style scoped>
  .tictactoe-tool {
    --bg: #f5f7fa;
    --card: #ffffff;
    --border: #eef2f7;
    --text: #2c3e50;
    --text-secondary: #7f8c8d;
    --primary: #409eff;
    --success: #67c23a;
    --warning: #e6a23c;
    --x-color: #e74c3c;
    --o-color: #3498db;

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
    margin-top: 1px;
  }

  .main-content {
    min-height: calc(100vh - 120px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1.5rem;
  }

  .layout-grid {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 2rem;
    align-items: start;
    transition: all 0.3s ease;
    max-width: 1000px;
    width: 100%;
  }

  .layout-grid.settings-collapsed {
    grid-template-columns: 1fr;
    max-width: fit-content;
  }

  .glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  }

  .board-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .game-status {
    text-align: center;
  }

  .status-indicator {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1.5rem;
    background: #f0f2f5;
    border-radius: 20px;
    font-size: 1rem;
  }

  .status-indicator.is-active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .current-player {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .player-icon {
    font-size: 1.2rem;
    font-weight: bold;
  }

  .player-icon.X {
    color: var(--x-color);
  }

  .player-icon.O {
    color: var(--o-color);
  }

  .status-indicator.is-active .player-icon {
    color: white;
  }

  .winner-display {
    margin-top: 1rem;
    animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .winner-text {
    font-size: 1.5rem;
    font-weight: bold;
    color: #ff4d4f;
  }

  .draw-text {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--warning);
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

  .board-container {
    display: flex;
    justify-content: center;
  }

  .board {
    display: grid;
    grid-template-columns: repeat(3, 100px);
    grid-template-rows: repeat(3, 100px);
    gap: 8px;
    background: linear-gradient(145deg, #667eea, #764ba2);
    padding: 12px;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  }

  .board-cell {
    background: white;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }

  .board-cell:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .board-cell.winning-cell {
    background: linear-gradient(135deg, #ffd700, #ffec8b);
    animation: winning-pulse 0.5s ease-in-out infinite alternate;
  }

  @keyframes winning-pulse {
    0% {
      box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
    }

    100% {
      box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
    }
  }

  .cell-content {
    font-size: 3rem;
    font-weight: bold;
    line-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cell-content.X {
    color: var(--x-color);
    text-shadow: 2px 2px 4px rgba(231, 76, 60, 0.3);
  }

  .cell-content.O {
    color: var(--o-color);
    text-shadow: 2px 2px 4px rgba(52, 152, 219, 0.3);
    font-size: 6rem;
    transform: translateY(-8px);
  }

  .cell-preview {
    font-size: 3rem;
    font-weight: bold;
    opacity: 0.3;
    line-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cell-preview.X {
    color: var(--x-color);
  }

  .cell-preview.O {
    color: var(--o-color);
    font-size: 6rem;
    transform: translateY(-8px);
  }

  .pop-enter-active {
    animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  @keyframes pop-in {
    0% {
      transform: scale(0) rotate(-180deg);
      opacity: 0;
    }

    100% {
      transform: scale(1) rotate(0);
      opacity: 1;
    }
  }

  .game-controls {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .control-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.7rem 1.5rem;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--card);
    color: var(--text);
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .control-btn:hover:not(:disabled) {
    border-color: var(--primary);
    color: var(--primary);
  }

  .control-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .control-btn.primary {
    background: var(--primary);
    border-color: var(--primary);
    color: white;
  }

  .control-btn.primary:hover {
    background: #3a8ee6;
  }

  .settings-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border);
  }

  .settings-header h2 {
    font-size: 1.1rem;
    margin: 0;
    color: var(--text);
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: #f0f2f5;
    border-radius: 50%;
    cursor: pointer;
    color: var(--text-secondary);
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: #e0e2e5;
    color: var(--text);
  }

  .slide-fade-enter-active {
    transition: all 0.3s ease-out;
  }

  .slide-fade-leave-active {
    transition: all 0.2s ease-in;
  }

  .slide-fade-enter-from {
    transform: translateX(20px);
    opacity: 0;
  }

  .slide-fade-leave-to {
    transform: translateX(20px);
    opacity: 0;
  }

  .settings-group h3 {
    font-size: 0.95rem;
    margin-bottom: 0.8rem;
    color: var(--text);
  }

  .mode-selector,
  .difficulty-selector,
  .first-selector {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .mode-btn,
  .diff-btn,
  .first-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 1rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--card);
    color: var(--text-secondary);
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .mode-btn:hover,
  .diff-btn:hover,
  .first-btn:hover {
    border-color: var(--primary);
    color: var(--primary);
  }

  .mode-btn.active,
  .diff-btn.active,
  .first-btn.active {
    background: var(--primary);
    border-color: var(--primary);
    color: white;
  }

  .first-btn.active .player-icon {
    color: white;
  }

  .game-stats {
    background: #f8fafc;
    border-radius: 12px;
    padding: 1rem;
  }

  .game-stats h3 {
    margin-bottom: 1rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    text-align: center;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--primary);
  }

  .stat-label {
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
    font-size: 0.85rem;
    border-top: 1px solid var(--border);
  }

  @media (max-width: 900px) {
    .layout-grid {
      grid-template-columns: 1fr;
    }

    .settings-section {
      order: -1;
    }
  }

  @media (max-width: 500px) {
    .main-content {
      padding: 1rem;
    }

    .glass-card {
      padding: 1rem;
    }

    .board {
      grid-template-columns: repeat(3, 80px);
      grid-template-rows: repeat(3, 80px);
      gap: 6px;
      padding: 10px;
    }

    .cell-content,
    .cell-preview {
      font-size: 2.5rem;
    }

    .game-controls {
      flex-direction: column;
    }

    .control-btn {
      width: 100%;
      justify-content: center;
    }
  }
</style>
