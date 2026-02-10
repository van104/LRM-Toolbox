<template>
  <div class="game-2048-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>2048 益智挑战</h1>
        <span class="nav-subtitle">2048 PUZZLE ADVENTURE</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="container">
        <div class="heading">
          <div class="title-section">
            <h1 class="main-title">挑战 2048</h1>
            <p class="sub-title">2048 GAME</p>
          </div>
          <div class="scores-container">
            <div class="score-card">
              <span class="label">分数</span>
              <span class="value">{{ score }}</span>
              <div v-if="scoreCheck > 0" class="score-addition">+{{ scoreCheck }}</div>
            </div>
            <div class="score-card best">
              <span class="label">最高分</span>
              <span class="value">{{ bestScore }}</span>
            </div>
          </div>
        </div>

        <div class="above-game">
          <p class="game-intro">合并数字到达 <strong>2048</strong> 方块!</p>
          <div class="game-actions">
            <button
              class="undo-button"
              :disabled="gameHistory.length === 0"
              title="撤销步数"
              @click="undo"
            >
              撤销
            </button>
            <button class="restart-button" @click="resetGame">新游戏</button>
            <button class="settings-button" title="设置" @click="showSettings = true">
              <el-icon>
                <Setting />
              </el-icon>
            </button>
          </div>
        </div>

        <div
          class="game-container"
          :class="'size-' + size"
          @touchstart="handleTouchStart"
          @touchend="handleTouchEnd"
          @touchmove.prevent
        >
          <div class="game-message" :class="gameStatusClass">
            <p>{{ gameStatusText }}</p>
            <div class="lower">
              <button
                v-if="gameWon && !keepPlaying"
                class="keep-playing-button"
                @click="continueGame"
              >
                继续挑战
              </button>
              <button class="retry-button" @click="resetGame">再试一次</button>
            </div>
          </div>

          <div class="grid-container">
            <div v-for="i in size * size" :key="i" class="grid-cell"></div>
          </div>

          <div class="tile-container">
            <div
              v-for="tile in tiles"
              :key="tile.id"
              class="tile"
              :class="getTileClasses(tile)"
              :style="getTileStyle(tile)"
            >
              <div class="tile-inner">{{ tile.value }}</div>
            </div>
          </div>
        </div>

        <p class="game-explanation">
          <strong class="important">怎么玩:</strong> 使用 <strong>方向键</strong> 或
          <strong>手指滑动</strong> 移动方块。当两个相同数字的方块撞在一起时，它们会
          <strong>合并成一个!</strong>
        </p>
      </div>

      <Transition name="fade">
        <div v-if="showSettings" class="settings-overlay" @click.self="showSettings = false">
          <div class="settings-modal">
            <div class="settings-header">
              <h2>游戏设置</h2>
              <button class="close-btn" @click="showSettings = false">
                <el-icon>
                  <Close />
                </el-icon>
              </button>
            </div>
            <div class="settings-content">
              <div class="setting-item">
                <label>网格大小</label>
                <div class="size-selector">
                  <button
                    v-for="s in [4, 5, 6]"
                    :key="s"
                    class="size-btn"
                    :class="{ active: size === s }"
                    @click="setSize(s)"
                  >
                    {{ s }} × {{ s }}
                  </button>
                </div>
              </div>
              <div class="stats-info">
                <div class="stat-row">
                  <span>历史总分</span>
                  <strong>{{ totalScore }}</strong>
                </div>
                <div class="stat-row">
                  <span>游戏场次</span>
                  <strong>{{ gamesPlayed }}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 2048</footer>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import { Back, Setting, Close } from '@element-plus/icons-vue';

  const size = ref(4);
  const tiles = ref([]);
  const score = ref(0);
  const bestScore = ref(0);
  const scoreCheck = ref(0);
  const gameOver = ref(false);
  const gameWon = ref(false);
  const keepPlaying = ref(false);
  const showSettings = ref(false);
  let tileIdCounter = 0;
  const touchStartPos = { x: 0, y: 0 };
  const totalScore = ref(0);
  const gamesPlayed = ref(0);
  const gameHistory = ref([]); // 用于存储历史记录

  const handleTouchStart = event => {
    if (event.touches.length > 1) return;
    touchStartPos.x = event.touches[0].clientX;
    touchStartPos.y = event.touches[0].clientY;
  };

  const handleTouchEnd = event => {
    if (event.changedTouches.length > 1) return;
    const touchEndPos = {
      x: event.changedTouches[0].clientX,
      y: event.changedTouches[0].clientY
    };

    const dx = touchEndPos.x - touchStartPos.x;
    const dy = touchEndPos.y - touchStartPos.y;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) > 20) {
      // 0: up, 1: right, 2: down, 3: left
      const direction = absDx > absDy ? (dx > 0 ? 1 : 3) : dy > 0 ? 2 : 0;
      move(direction);
    }
  };

  const gameStatusText = computed(() => {
    if (gameWon.value && !keepPlaying.value) return '挑战成功';
    if (gameOver.value) return '游戏结束!';
    return '';
  });

  const gameStatusClass = computed(() => {
    return {
      'game-won': gameWon.value && !keepPlaying.value,
      'game-over': gameOver.value
    };
  });

  const initGame = () => {
    tiles.value = [];
    score.value = 0;
    scoreCheck.value = 0;
    gameOver.value = false;
    gameWon.value = false;
    keepPlaying.value = false;
    tileIdCounter = 0;
    addRandomTile();
    addRandomTile();
  };

  const resetGame = () => {
    initGame();
    gamesPlayed.value++;
    saveStats();
  };

  const continueGame = () => {
    keepPlaying.value = true;
  };

  const setSize = s => {
    if (s === size.value) return;
    size.value = s;
    resetGame();
    showSettings.value = false;
  };

  const saveHistory = () => {
    // 限制历史记录步数，例如最多撤销 10 步
    if (gameHistory.value.length >= 10) {
      gameHistory.value.shift();
    }
    // 深拷贝当前状态
    gameHistory.value.push({
      tiles: JSON.parse(JSON.stringify(tiles.value.filter(t => !t.toRemove))),
      score: score.value,
      gameOver: gameOver.value,
      gameWon: gameWon.value
    });
  };

  const undo = () => {
    if (gameHistory.value.length === 0) return;
    const prevState = gameHistory.value.pop();
    tiles.value = prevState.tiles;
    score.value = prevState.score;
    gameOver.value = prevState.gameOver;
    gameWon.value = prevState.gameWon;
  };

  const move = direction => {
    if (gameOver.value || (gameWon.value && !keepPlaying.value)) return;
    const vector = getVector(direction);
    const traversals = buildTraversals(vector);
    let moved = false;
    let scoreGain = 0;

    // 清理上一轮被标记删除的方块
    tiles.value = tiles.value.filter(t => !t.toRemove);

    tiles.value.forEach(t => {
      t.mergedFrom = null;
      t.isNew = false;
    });

    traversals.x.forEach(x => {
      traversals.y.forEach(y => {
        const cell = { x, y };
        const tile = getTileAt(cell);

        if (tile) {
          const positions = findFarthestPosition(cell, vector);
          const next = getTileAt(positions.next);

          if (next && next.value === tile.value && !next.mergedFrom && !next.toRemove) {
            // 在第一次发生移动/合并前保存历史
            if (!moved) saveHistory();

            const merged = {
              id: tileIdCounter++,
              x: next.x,
              y: next.y,
              value: tile.value * 2,
              mergedFrom: [tile, next]
            };

            // 核心修复：将两个合并的方块坐标对齐到目标点，触发滑动动画
            tile.x = next.x;
            tile.y = next.y;

            // 标记为待移除，但保留到动画结束
            tile.toRemove = true;
            next.toRemove = true;

            insertTile(merged);
            scoreGain += merged.value;
            if (merged.value === 2048) gameWon.value = true;
            moved = true;
          } else {
            moveTile(tile, positions.farthest);
            if (cell.x !== positions.farthest.x || cell.y !== positions.farthest.y) {
              if (!moved) saveHistory();
              moved = true;
            }
          }
        }
      });
    });

    if (moved) {
      addRandomTile();
      if (scoreGain > 0) {
        score.value += scoreGain;
        scoreCheck.value = scoreGain;
        if (score.value > bestScore.value) {
          bestScore.value = score.value;
          saveStats();
        }
        totalScore.value += scoreGain;
        saveStats();
      }
      if (!movesAvailable()) gameOver.value = true;

      // 延迟清理合并掉的旧方块，等待平移动画完成
      setTimeout(() => {
        tiles.value = tiles.value.filter(t => !t.toRemove);
      }, 100);
    }
  };

  const getVector = direction => {
    const map = { 0: { x: 0, y: -1 }, 1: { x: 1, y: 0 }, 2: { x: 0, y: 1 }, 3: { x: -1, y: 0 } };
    return map[direction];
  };

  const buildTraversals = vector => {
    const traversals = { x: [], y: [] };
    for (let pos = 0; pos < size.value; pos++) {
      traversals.x.push(pos);
      traversals.y.push(pos);
    }
    if (vector.x === 1) traversals.x = traversals.x.reverse();
    if (vector.y === 1) traversals.y = traversals.y.reverse();
    return traversals;
  };

  const findFarthestPosition = (cell, vector) => {
    let previous;
    let current = { x: cell.x, y: cell.y };
    do {
      previous = current;
      current = { x: previous.x + vector.x, y: previous.y + vector.y };
    } while (withinBounds(current) && !getTileAt(current));
    return { farthest: previous, next: current };
  };

  const withinBounds = position => {
    return position.x >= 0 && position.x < size.value && position.y >= 0 && position.y < size.value;
  };

  const getTileAt = position => {
    // 修复：不能忽略 mergedFrom。合并后的方块依然是物理存在的，应当阻挡其他方块。
    return tiles.value.find(t => t.x === position.x && t.y === position.y && !t.toRemove);
  };

  const insertTile = tile => {
    tiles.value.push(tile);
  };

  const moveTile = (tile, position) => {
    tile.x = position.x;
    tile.y = position.y;
  };

  const addRandomTile = () => {
    if (tiles.value.length >= size.value * size.value) return;
    const availableCells = [];
    for (let x = 0; x < size.value; x++) {
      for (let y = 0; y < size.value; y++) {
        if (!getTileAt({ x, y })) availableCells.push({ x, y });
      }
    }
    if (availableCells.length > 0) {
      const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];
      insertTile({
        id: tileIdCounter++,
        x: randomCell.x,
        y: randomCell.y,
        value: Math.random() < 0.9 ? 2 : 4,
        isNew: true
      });
    }
  };

  const movesAvailable = () => {
    const activeTiles = tiles.value.filter(t => !t.toRemove);
    if (activeTiles.length < size.value * size.value) return true;
    for (let x = 0; x < size.value; x++) {
      for (let y = 0; y < size.value; y++) {
        const tile = getTileAt({ x, y });
        if (tile) {
          const dirs = [0, 1, 2, 3];
          for (const dir of dirs) {
            const vector = getVector(dir);
            const neighborPos = { x: x + vector.x, y: y + vector.y };
            const neighbor = getTileAt(neighborPos);
            if (neighbor && neighbor.value === tile.value) return true;
          }
        }
      }
    }
    return false;
  };

  const handleKeydown = event => {
    if (showSettings.value) return;
    if ([37, 38, 39, 40].includes(event.keyCode)) event.preventDefault();
    const map = {
      38: 0,
      39: 1,
      40: 2,
      37: 3,
      75: 0,
      76: 1,
      74: 2,
      72: 3,
      87: 0,
      68: 1,
      83: 2,
      65: 3
    };
    const direction = map[event.keyCode];
    if (direction !== undefined) move(direction);
  };

  const getTileClasses = tile => {
    return [
      `tile-${tile.value}`,
      { 'tile-new': tile.isNew },
      { 'tile-merged': tile.mergedFrom },
      { 'tile-super': tile.value > 8192 }
    ];
  };

  const getTileStyle = tile => {
    return {
      '--x': tile.x,
      '--y': tile.y
    };
  };

  const saveStats = () => {
    localStorage.setItem(
      '2048-stats',
      JSON.stringify({
        bestScore: bestScore.value,
        totalScore: totalScore.value,
        gamesPlayed: gamesPlayed.value
      })
    );
    localStorage.setItem(
      '2048-state',
      JSON.stringify({
        tiles: tiles.value,
        score: score.value,
        size: size.value,
        gameOver: gameOver.value,
        gameWon: gameWon.value,
        keepPlaying: keepPlaying.value
      })
    );
  };

  const loadStats = () => {
    const statsSaved = localStorage.getItem('2048-stats');
    if (statsSaved) {
      const parsed = JSON.parse(statsSaved);
      bestScore.value = parsed.bestScore || 0;
      totalScore.value = parsed.totalScore || 0;
      gamesPlayed.value = parsed.gamesPlayed || 0;
    }
    const stateSaved = localStorage.getItem('2048-state');
    if (stateSaved) {
      const parsed = JSON.parse(stateSaved);
      if (parsed.size === size.value && !parsed.gameOver) {
        tiles.value = parsed.tiles;
        score.value = parsed.score;
        if (tiles.value.length > 0) tileIdCounter = Math.max(...tiles.value.map(t => t.id)) + 1;
      } else initGame();
    } else initGame();
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
    loadStats();
  });
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
  });
  watch([score, gameOver], () => saveStats());
</script>

<style scoped>
  .game-2048-tool {
    --bg: #f5f7fa;
    --card: #ffffff;
    --text: #776e65;
    --primary: #8f7a66;
    --score-bg: #bbada0;
    --board-bg: #bbada0;
    --cell-bg: rgba(238, 228, 218, 0.35);

    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
    min-height: 100vh;
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
    font-size: 1rem;
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
    color: #2c3e50;
    font-weight: bold;
  }

  .nav-subtitle {
    font-size: 0.7rem;
    color: #7f8c8d;
    display: block;
    text-transform: uppercase;
  }

  .nav-spacer {
    width: 60px;
  }

  .main-content {
    flex: 1;
    display: flex;
    justify-content: center;
    padding: 2rem 1rem;
  }

  .container {
    width: 500px;
    max-width: 100%;
    background: white;
    padding: 2rem;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  }

  .heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2rem;
  }

  .title-section {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .main-title {
    font-size: 2.2rem;
    font-weight: 800;
    margin: 0;
    line-height: 1;
    color: #409eff;
    letter-spacing: -1px;
  }

  .sub-title {
    font-size: 0.75rem;
    font-weight: bold;
    color: #94a3b8;
    margin: 0;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .scores-container {
    display: flex;
    gap: 8px;
    text-align: center;
  }

  .score-card {
    background: #bbada0;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    color: white;
    min-width: 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .score-card .label {
    font-size: 0.7rem;
    font-weight: bold;
    color: #eee4da;
    text-transform: uppercase;
  }

  .score-card .value {
    font-size: 1.25rem;
    font-weight: 800;
  }

  .score-card.best {
    background: #8f7a66;
  }

  .score-container::after {
    content: 'SCORE';
  }

  .best-container::after {
    content: 'BEST';
  }

  /* 移除了旧的 scores-container 内部样式 */

  .score-addition {
    position: absolute;
    bottom: 100%;
    right: 0;
    color: #8f7a66;
    font-size: 1.25rem;
    font-weight: 800;
    z-index: 100;
    animation: move-up 600ms ease-out both;
  }

  @keyframes move-up {
    0% {
      top: 25px;
      opacity: 1;
    }

    100% {
      top: -50px;
      opacity: 0;
    }
  }

  .above-game {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    padding: 0 4px;
  }

  .game-intro {
    font-size: 0.95rem;
    color: #64748b;
    margin: 0;
  }

  .restart-button {
    background: linear-gradient(135deg, #409eff 0%, #3a8ee6 100%);
    border-radius: 20px;
    padding: 0 1.5rem;
    color: white;
    height: 38px;
    line-height: 38px;
    display: inline-block;
    text-align: center;
    font-weight: bold;
    border: none;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.3s;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
  }

  .restart-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(64, 158, 255, 0.3);
  }

  .settings-button {
    background: #f1f5f9;
    border-radius: 50%;
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    border: none;
    cursor: pointer;
    transition: all 0.3s;
  }

  .game-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .undo-button {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 20px;
    padding: 0 1rem;
    color: #475569;
    height: 36px;
    line-height: 36px;
    font-weight: 600;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s;
  }

  .undo-button:hover:not(:disabled) {
    background: #ffffff;
    color: #409eff;
    border-color: #409eff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .undo-button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    background: #f1f5f9;
  }

  .settings-button:hover {
    background: #e2e8f0;
    color: #409eff;
  }

  .game-container {
    margin: 1rem auto;
    position: relative;
    padding: 12px;
    cursor: default;
    touch-action: none;
    background: #bbada0;
    border-radius: 8px;
    width: 460px;
    height: 460px;
    max-width: 100%;
    box-sizing: border-box;
    user-select: none;
    -webkit-user-select: none;

    --grid-size: 4;
    --grid-gap: 12px;
    --tile-size: 94px;
  }

  /* 动态调整棋盘尺寸以适应手机或不同网格 */
  .game-container.size-4 {
    --grid-size: 4;
    width: 460px;
    height: 437px;
    --tile-size: 94px;
    --tile-font-base: 3rem;
  }

  .game-container.size-5 {
    --grid-size: 5;
    width: 460px;
    height: 437px;
    --tile-size: 73px;
    --tile-font-base: 2.2rem;
  }

  .game-container.size-6 {
    --grid-size: 6;
    width: 462px;
    height: 438px;
    --tile-size: 59px;
    --tile-font-base: 1.8rem;
  }

  .game-message {
    display: none;
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(2px);
    z-index: 100;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    border-radius: 8px;
    animation: fadeIn 0.4s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }

    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .game-message.game-won {
    display: flex;
    background: rgba(253, 224, 71, 0.4);
    /* 亮金色透明背景 */
    backdrop-filter: blur(4px);
    color: #854d0e;
    box-shadow: inset 0 0 100px rgba(254, 240, 138, 0.5);
  }

  .game-message.game-won p {
    color: #854d0e;
    text-shadow: 0 4px 12px rgba(254, 240, 138, 0.8);
    animation: bounce 0.6s infinite alternate ease-in-out;
  }

  @keyframes bounce {
    from {
      transform: translateY(0) scale(1);
    }

    to {
      transform: translateY(-15px) scale(1.05);
    }
  }

  .game-message.game-over {
    display: flex;
  }

  .game-message p {
    font-size: 3rem;
    font-weight: 800;
    margin: 0;
    margin-bottom: 2rem;
    width: 100%;
    color: #1e293b;
    text-shadow: 0 2px 10px rgba(255, 255, 255, 0.8);
  }

  .game-message .lower {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
  }

  .retry-button,
  .keep-playing-button {
    background: #409eff;
    color: white;
    padding: 0.75rem 2rem;
    border-radius: 25px;
    border: none;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  }

  .retry-button:hover,
  .keep-playing-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
  }

  .grid-container {
    display: grid;
    grid-template-columns: repeat(var(--grid-size), var(--tile-size));
    grid-template-rows: repeat(var(--grid-size), var(--tile-size));
    gap: var(--grid-gap);
  }

  .grid-cell {
    width: var(--tile-size);
    height: var(--tile-size);
    border-radius: 4px;
    background: var(--cell-bg);
  }

  .tile-container {
    position: absolute;
    z-index: 2;
    top: 12px;
    left: 12px;
    right: 12px;
    bottom: 12px;
    pointer-events: none;
  }

  .tile {
    position: absolute;
    width: var(--tile-size);
    height: var(--tile-size);
    border-radius: 3px;
    transition: transform 100ms ease-in-out;
    transform: translate(
      calc(var(--x) * (var(--tile-size) + var(--grid-gap))),
      calc(var(--y) * (var(--tile-size) + var(--grid-gap)))
    );
    z-index: 10;
  }

  .tile-inner {
    border-radius: 4px;
    background: #eee4da;
    text-align: center;
    font-weight: 800;
    z-index: 10;
    font-size: var(--tile-font-base);
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    white-space: nowrap;
    overflow: hidden;
    box-sizing: border-box;
    padding: 0 4px;
  }

  .tile-merged .tile-inner {
    /* 使用 backwards 模式：在 100ms 延迟期间应用 0% 状态(隐形)，
       动画结束后不再持有 fill 状态，恢复到默认可见状态，彻底解决合并后“消失”的问题 */
    animation: pop 200ms ease 100ms backwards;
  }

  @keyframes pop {
    0% {
      opacity: 0;
      transform: scale(0);
    }

    50% {
      opacity: 1;
      transform: scale(1.15);
    }

    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* 针对大数字进行比例缩放，基于当前网格的基准字号 */
  .tile-128 .tile-inner,
  .tile-256 .tile-inner,
  .tile-512 .tile-inner {
    font-size: calc(var(--tile-font-base) * 0.75);
  }

  .tile-1024 .tile-inner,
  .tile-2048 .tile-inner {
    font-size: calc(var(--tile-font-base) * 0.65);
    letter-spacing: -0.5px;
  }

  .tile-4096 .tile-inner,
  .tile-8192 .tile-inner {
    font-size: calc(var(--tile-font-base) * 0.55);
    letter-spacing: -1px;
  }

  /* 针对五位数及以上的超大数字 */
  .tile-super .tile-inner {
    font-size: calc(var(--tile-font-base) * 0.45);
    letter-spacing: -1.5px;
  }

  .tile-2 .tile-inner {
    background: #eee4da;
    color: #776e65;
  }

  .tile-4 .tile-inner {
    background: #ede0c8;
    color: #776e65;
  }

  .tile-8 .tile-inner {
    background: #f2b179;
    color: #f9f6f2;
  }

  .tile-16 .tile-inner {
    background: #f59563;
    color: #f9f6f2;
  }

  .tile-32 .tile-inner {
    background: #f67c5f;
    color: #f9f6f2;
  }

  .tile-64 .tile-inner {
    background: #f65e3b;
    color: #f9f6f2;
  }

  .tile-128 .tile-inner {
    background: #edcf72;
    color: #f9f6f2;
    box-shadow:
      0 0 30px 10px rgba(243, 215, 116, 0.2381),
      inset 0 0 0 1px rgba(255, 255, 255, 0.19048);
  }

  .tile-256 .tile-inner {
    background: #edcc61;
    color: #f9f6f2;
    box-shadow:
      0 0 30px 10px rgba(243, 215, 116, 0.31746),
      inset 0 0 0 1px rgba(255, 255, 255, 0.2381);
  }

  .tile-512 .tile-inner {
    background: #edc850;
    color: #f9f6f2;
    box-shadow:
      0 0 30px 10px rgba(243, 215, 116, 0.39683),
      inset 0 0 0 1px rgba(255, 255, 255, 0.28571);
  }

  .tile-1024 .tile-inner {
    background: #edc53f;
    color: #f9f6f2;
    box-shadow:
      0 0 30px 10px rgba(243, 215, 116, 0.47619),
      inset 0 0 0 1px rgba(255, 255, 255, 0.33333);
  }

  .tile-2048 .tile-inner {
    background: #edc22e;
    color: #f9f6f2;
    box-shadow:
      0 0 30px 10px rgba(243, 215, 116, 0.55556),
      inset 0 0 0 1px rgba(255, 255, 255, 0.38095);
  }

  .tile-4096 .tile-inner {
    background: #fe3d3d;
    color: #f9f6f2;
  }

  .tile-8192 .tile-inner {
    background: #ff2020;
    color: #f9f6f2;
  }

  .tile-16384 .tile-inner,
  .tile-super .tile-inner {
    background: #c0392b;
    color: #f9f6f2;
  }

  .tile-32768 .tile-inner {
    background: #2c3e50;
    color: #f9f6f2;
  }

  .tile-new .tile-inner {
    animation: appear 200ms ease;
  }

  .tile-merged .tile-inner {
    z-index: 20;
    animation: pop 200ms ease 100ms;
    animation-fill-mode: backwards;
  }

  @keyframes appear {
    0% {
      opacity: 0;
      transform: scale(0);
    }

    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes pop {
    0% {
      transform: scale(0);
    }

    50% {
      transform: scale(1.2);
    }

    100% {
      transform: scale(1);
    }
  }

  .game-explanation {
    margin-top: 30px;
    font-size: 16px;
    line-height: 1.65;
  }

  .important {
    font-weight: bold;
  }

  .settings-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .settings-modal {
    background: white;
    width: 300px;
    padding: 20px;
    border-radius: 6px;
  }

  .settings-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .setting-item {
    margin-bottom: 20px;
  }

  .size-selector {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }

  .size-btn {
    flex: 1;
    padding: 10px;
    border: 1px solid #ccc;
    background: white;
    cursor: pointer;
    border-radius: 4px;
  }

  .size-btn.active {
    background: #8f7a66;
    color: white;
    border-color: #8f7a66;
  }

  .stats-info {
    background: #f0f0f0;
    padding: 10px;
    border-radius: 4px;
  }

  .stat-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
  }

  .footer {
    padding: 2rem;
    color: #776e65;
    opacity: 0.7;
    text-align: center;
  }

  @media (max-width: 520px) {
    .container {
      width: 280px;
    }

    .game-container {
      margin-top: 20px;
      width: 280px;
      height: 280px;
      --grid-gap: 10px;
      --tile-size: 57.5px;

      padding: 10px;
    }

    .game-container.size-4 {
      --tile-font-base: 1.8rem;
    }

    .game-container.size-5 {
      --tile-font-base: 1.4rem;
    }

    .game-container.size-6 {
      --tile-font-base: 1.1rem;
    }

    .tile-inner {
      font-size: var(--tile-font-base);
    }
  }
</style>
