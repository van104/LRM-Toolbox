<template>
  <div class="niuniu-match-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>小牛谜局</h1>
        <span class="nav-subtitle">NiuNiu Match</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div v-if="!grid.length" class="loading-placeholder"></div>
      <template v-else>
        <!-- Menu Screen -->
        <div v-if="isInMenu" class="menu-screen glass-card">
          <div class="menu-header">
            <div class="coin-display"><span class="coin-icon">🪙</span> {{ coins }}</div>
            <button class="settings-btn" @click="openSettingsModal">
              <el-icon :size="24"><Setting /></el-icon>
            </button>
          </div>
          <div class="game-title">
            <div class="cow-icon">🐮</div>
            <h2>小牛谜局</h2>
            <p class="subtitle">将小牛放置到正确位置</p>
          </div>
          <div class="level-select">
            <div class="level-header">
              <div class="level-label">关卡选择</div>
              <div class="level-info">共 {{ levelsRef.length }} 关</div>
            </div>
            <div class="level-grid-scroll">
              <div class="level-grid">
                <button
                  v-for="(_, index) in levelsRef"
                  :key="`level-${index}`"
                  :class="[
                    'level-btn',
                    { active: selectedLevelIndex === index, completed: completedLevels.has(index) }
                  ]"
                  @click="selectedLevelIndex = index"
                >
                  <span v-if="completedLevels.has(index)" class="check-mark">✓</span>
                  {{ index + 1 }}
                </button>
              </div>
            </div>
          </div>
          <div class="rules-hint">
            <p>• 每行每列只允许存在一头牛</p>
            <p>• 每种颜色区域只能有一头牛</p>
            <p>• 小牛之间不能相邻</p>
          </div>
          <button class="start-btn" @click="startGame">开始游戏</button>
        </div>

        <!-- Game Screen -->
        <div v-else class="game-screen glass-card">
          <div class="game-top-bar">
            <div class="top-left">
              <button class="icon-btn" @click="openSettingsModal">
                <el-icon :size="22"><Setting /></el-icon>
              </button>
              <div class="coin-display small"><span class="coin-icon">🪙</span> {{ coins }}</div>
            </div>
            <div class="level-title">
              第 <span>{{ currentLevelIndex + 1 }}</span> 关
            </div>
            <div class="top-right">
              <button class="menu-btn" @click="isInMenu = true">
                <el-icon :size="20"><HomeFilled /></el-icon>
              </button>
            </div>
          </div>

          <div class="game-stats">
            <div class="stat-item">
              <span class="stat-icon">❤️</span>
              <span class="stat-value">{{ health }}</span>
            </div>
            <div class="stat-item timer">
              <span class="stat-icon">⏱️</span>
              <span class="stat-value">{{ formatTime(elapsedTime) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">🎯</span>
              <span class="stat-value">{{ moves }}</span>
            </div>
          </div>

          <div class="rules-bar">
            <div class="rule-item">
              <span class="rule-icon">📍</span>
              <span>每行每列一头牛</span>
            </div>
            <div class="rule-item">
              <span class="rule-icon">🎨</span>
              <span>每色区域一头牛</span>
            </div>
            <div class="rule-item">
              <span class="rule-icon">🚫</span>
              <span>小牛不能相邻</span>
            </div>
          </div>

          <div class="cow-counter">
            <span class="cow-icon">🐮</span>
            <span class="counter-text">
              剩余:
              <span :class="['count', { error: remainingCount < 0 }]">{{ remainingCount }}</span>
              / {{ size }}
            </span>
          </div>

          <div class="puzzle-board-container">
            <div class="puzzle-board" :style="{ gridTemplateColumns: `repeat(${size}, 1fr)` }">
              <div
                v-for="(cell, index) in flattenedGrid"
                :key="index"
                :data-r="Math.floor(index / size)"
                :data-c="index % size"
                :class="['puzzle-cell', cell.colorClass, { mistake: cell.isMistake }]"
                @pointerdown="onPointerDown"
                @pointermove="onPointerMove"
              >
                <span v-if="cell.value === 1" class="cow-emoji">🐮</span>
                <span v-else-if="cell.value === 2" class="x-mark">✕</span>
              </div>
            </div>
          </div>

          <div class="tool-bar">
            <button class="tool-btn restart" @click="loadLevel(currentLevelIndex)">
              <el-icon :size="18"><RefreshRight /></el-icon>
              <span>重置</span>
            </button>
            <button
              :class="['tool-btn undo-btn', { disabled: history.length === 0 }]"
              @click="undo"
            >
              <el-icon :size="18"><Back /></el-icon>
              <span>撤销</span>
            </button>
            <button
              :class="['tool-btn', 'cow-tool', { disabled: cowToolCount <= 0 }]"
              @click="handleCowTool"
            >
              <span class="tool-icon">🐮</span>
              <span class="tool-count">{{ cowToolCount > 0 ? cowToolCount : '+' }}</span>
            </button>
            <button
              :class="['tool-btn', 'hint-tool', { disabled: hintCount <= 0 }]"
              @click="handleHint"
            >
              <span class="tool-icon">💡</span>
              <span class="tool-count">{{ hintCount > 0 ? hintCount : '+' }}</span>
            </button>
          </div>
        </div>

        <!-- Win Modal -->
        <div v-if="isWon" class="modal-overlay">
          <div class="modal-content win-modal">
            <div class="modal-icon">🎉</div>
            <h2>太棒了！</h2>
            <div class="stars-display">
              <span v-for="i in 3" :key="i" :class="['star', { active: i <= calculateStars }]"
                >⭐</span
              >
            </div>
            <div class="win-stats">
              <div class="win-stat">
                <span class="stat-label">用时</span>
                <span class="stat-val">{{ formatTime(elapsedTime) }}</span>
              </div>
              <div class="win-stat">
                <span class="stat-label">步数</span>
                <span class="stat-val">{{ moves }}</span>
              </div>
              <div class="win-stat">
                <span class="stat-label">剩余血量</span>
                <span class="stat-val">{{ health }}</span>
              </div>
            </div>
            <p class="reward-text">+{{ 10 + health * 5 }} 金币</p>
            <button class="modal-btn primary" @click="handleNextLevel">
              {{ currentLevelIndex === levelsRef.length - 1 ? '重新挑战' : '下一关' }}
            </button>
          </div>
        </div>

        <!-- Game Over Modal -->
        <div v-if="isGameOver" class="modal-overlay">
          <div class="modal-content fail-modal">
            <div class="modal-icon">💔</div>
            <h2>挑战失败</h2>
            <div class="fail-stats">
              <div class="fail-stat">
                <span class="stat-label">用时</span>
                <span class="stat-val">{{ formatTime(elapsedTime) }}</span>
              </div>
              <div class="fail-stat">
                <span class="stat-label">步数</span>
                <span class="stat-val">{{ moves }}</span>
              </div>
            </div>
            <p class="fail-text">血量耗尽，请重新尝试</p>
            <button class="modal-btn danger" @click="loadLevel(currentLevelIndex)">重新开始</button>
          </div>
        </div>

        <!-- Active Modal -->
        <div v-if="activeModal" class="modal-overlay">
          <div class="modal-content">
            <!-- Hint Modal -->
            <template v-if="activeModal.type === 'hint'">
              <div class="modal-header">
                <span class="modal-icon-sm">💡</span>
                <h3>提示</h3>
              </div>
              <div class="hint-grid" :style="{ gridTemplateColumns: `repeat(${size}, 1fr)` }">
                <div
                  v-for="(cell, index) in hintGridCells"
                  :key="index"
                  :class="[
                    'hint-cell',
                    cell.colorClass,
                    { highlight: cell.isHighlight, target: cell.isTarget }
                  ]"
                >
                  <span v-if="cell.showX" class="hint-x">✕</span>
                  <span v-else-if="cell.showCow" class="hint-cow">🐮</span>
                </div>
              </div>
              <button class="modal-btn primary" @click="activeModal = null">
                <el-icon><Check /></el-icon>
                知道了
              </button>
            </template>

            <!-- Purchase Modal -->
            <template v-else-if="activeModal.type === 'purchase'">
              <div class="modal-header">
                <span class="modal-icon-sm">{{ activeModal.tool === 'cow' ? '🐮' : '💡' }}</span>
                <h3>{{ activeModal.tool === 'cow' ? '小牛显示器' : '提示器' }}</h3>
              </div>
              <p class="modal-desc">100金币一次，或看广告使用</p>
              <p class="modal-coins">当前金币：{{ coins }}</p>
              <div class="modal-actions">
                <button class="modal-btn warning" @click="purchaseWithCoins">金币购买</button>
                <button class="modal-btn primary" @click="startAd(activeModal.tool)">看广告</button>
              </div>
            </template>

            <!-- Insufficient Modal -->
            <template v-else-if="activeModal.type === 'insufficient'">
              <div class="modal-header">
                <span class="modal-icon-sm">⚠️</span>
                <h3>金币不足</h3>
              </div>
              <p class="modal-desc">需要100金币，当前仅有 {{ coins }}</p>
              <div class="modal-actions">
                <button class="modal-btn primary" @click="startAd(activeModal.tool)">看广告</button>
                <button class="modal-btn secondary" @click="activeModal = null">知道了</button>
              </div>
            </template>

            <!-- Ad Modal -->
            <template v-else-if="activeModal.type === 'ad'">
              <div class="modal-header">
                <span class="modal-icon-sm animate-pulse">📺</span>
                <h3>广告播放中</h3>
              </div>
              <p class="modal-desc">模拟广告中，完成后直接获得一次</p>
              <div class="ad-progress">
                <div class="ad-progress-bar"></div>
              </div>
            </template>

            <!-- Settings Modal -->
            <template v-else-if="activeModal.type === 'settings'">
              <div class="modal-header">
                <span class="modal-icon-sm">⚙️</span>
                <h3>设置</h3>
              </div>
              <div class="settings-list">
                <div class="setting-item">
                  <span>游戏音效</span>
                  <button :class="['toggle', { on: sfxOn }]" @click="sfxOn = !sfxOn">
                    <span class="toggle-dot"></span>
                  </button>
                </div>
                <div class="setting-item">
                  <span>游戏音乐</span>
                  <button :class="['toggle', { on: musicOn }]" @click="musicOn = !musicOn">
                    <span class="toggle-dot"></span>
                  </button>
                </div>
              </div>
              <button class="modal-btn primary" @click="activeModal = null">确定</button>
            </template>
          </div>
        </div>
      </template>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 小牛谜局</footer>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import { Back, Setting, RefreshRight, Check, HomeFilled } from '@element-plus/icons-vue';
  import musicStart from '@/assets/audio/niuniu/Pixel_Bloom.mp3';
  import musicLoop from '@/assets/audio/niuniu/Pixel_Bloom_Loop.mp3';
  import musicLullaby from '@/assets/audio/niuniu/Pixel_Bloom_Lullaby.mp3';

  const regionColors = [
    'color-1',
    'color-2',
    'color-3',
    'color-4',
    'color-5',
    'color-6',
    'color-7',
    'color-8'
  ];

  const LEVELS = [
    {
      size: 4,
      map: [
        [0, 0, 0, 1],
        [0, 2, 1, 1],
        [2, 2, 3, 1],
        [2, 3, 3, 3]
      ],
      solution: [
        { r: 0, c: 1 },
        { r: 1, c: 3 },
        { r: 2, c: 0 },
        { r: 3, c: 2 }
      ]
    },
    {
      size: 5,
      map: [
        [0, 0, 0, 0, 1],
        [0, 0, 0, 1, 1],
        [2, 2, 2, 2, 3],
        [2, 2, 2, 2, 3],
        [4, 4, 4, 4, 4]
      ],
      solution: [
        { r: 0, c: 0 },
        { r: 1, c: 3 },
        { r: 2, c: 1 },
        { r: 3, c: 4 },
        { r: 4, c: 2 }
      ]
    },
    {
      size: 6,
      map: [
        [1, 1, 0, 0, 0, 0],
        [1, 1, 1, 0, 0, 0],
        [1, 3, 3, 2, 2, 2],
        [3, 3, 3, 5, 2, 4],
        [3, 3, 5, 5, 4, 4],
        [3, 5, 5, 5, 4, 4]
      ],
      solution: [
        { r: 0, c: 2 },
        { r: 1, c: 0 },
        { r: 2, c: 4 },
        { r: 3, c: 1 },
        { r: 4, c: 5 },
        { r: 5, c: 3 }
      ]
    },
    {
      size: 7,
      map: [
        [0, 0, 0, 1, 1, 1, 1],
        [3, 4, 4, 1, 1, 1, 2],
        [3, 4, 4, 4, 4, 2, 2],
        [3, 4, 4, 4, 4, 2, 2],
        [3, 4, 4, 4, 4, 5, 5],
        [3, 6, 6, 6, 6, 5, 5],
        [6, 6, 6, 6, 6, 5, 5]
      ],
      solution: [
        { r: 0, c: 1 },
        { r: 1, c: 4 },
        { r: 2, c: 6 },
        { r: 3, c: 0 },
        { r: 4, c: 3 },
        { r: 5, c: 5 },
        { r: 6, c: 2 }
      ]
    },
    {
      size: 8,
      map: [
        [0, 0, 1, 1, 1, 2, 2, 2],
        [0, 0, 1, 1, 1, 2, 2, 2],
        [3, 3, 4, 4, 4, 2, 2, 2],
        [3, 3, 4, 4, 4, 5, 5, 5],
        [3, 3, 4, 4, 4, 5, 5, 5],
        [6, 6, 6, 7, 7, 5, 5, 5],
        [6, 6, 6, 7, 7, 7, 7, 7],
        [6, 6, 6, 6, 7, 7, 7, 7]
      ],
      solution: [
        { r: 0, c: 0 },
        { r: 1, c: 3 },
        { r: 2, c: 6 },
        { r: 3, c: 1 },
        { r: 4, c: 4 },
        { r: 5, c: 7 },
        { r: 6, c: 2 },
        { r: 7, c: 5 }
      ]
    }
  ];

  // 关卡生成算法
  const generateLevel = (size, seed = null) => {
    // 使用种子随机数（如果提供）
    let random = Math.random;
    if (seed !== null) {
      const seedRandom = s => {
        const x = Math.sin(s) * 10000;
        return x - Math.floor(x);
      };
      random = () => {
        seed++;
        return seedRandom(seed);
      };
    }

    // 1. 生成牛的位置：每行每列各一头，且不相邻
    const generateCowPositions = () => {
      const positions = [];
      const usedCols = new Set();

      // 使用回溯法找到满足约束的位置
      const backtrack = row => {
        if (row === size) return true;

        const cols = Array.from({ length: size }, (_, i) => i);
        // 随机打乱列顺序
        for (let i = cols.length - 1; i > 0; i--) {
          const j = Math.floor(random() * (i + 1));
          [cols[i], cols[j]] = [cols[j], cols[i]];
        }

        for (const col of cols) {
          if (usedCols.has(col)) continue;

          // 检查是否与已有的牛相邻
          let isAdjacent = false;
          for (const pos of positions) {
            if (Math.abs(pos.r - row) <= 1 && Math.abs(pos.c - col) <= 1) {
              isAdjacent = true;
              break;
            }
          }
          if (isAdjacent) continue;

          positions.push({ r: row, c: col });
          usedCols.add(col);

          if (backtrack(row + 1)) return true;

          positions.pop();
          usedCols.delete(col);
        }
        return false;
      };

      backtrack(0);
      return positions;
    };

    // 2. 生成区域划分（使用BFS从每个牛位置扩展）
    const generateRegions = cowPositions => {
      const map = Array(size)
        .fill(null)
        .map(() => Array(size).fill(-1));
      const regionSizes = Array(size).fill(0);

      // 初始化每个牛的位置为对应区域
      cowPositions.forEach((pos, idx) => {
        map[pos.r][pos.c] = idx;
        regionSizes[idx]++;
      });

      // 可扩展的方向
      const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
      ];

      // BFS扩展区域
      let changed = true;
      while (changed) {
        changed = false;
        for (let regionIdx = 0; regionIdx < size; regionIdx++) {
          // 随机打乱方向
          const dirs = [...directions];
          for (let i = dirs.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
          }

          // 从当前区域的所有格子尝试扩展
          const currentCells = [];
          for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
              if (map[r][c] === regionIdx) {
                currentCells.push({ r, c });
              }
            }
          }

          // 随机打乱单元格顺序
          for (let i = currentCells.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [currentCells[i], currentCells[j]] = [currentCells[j], currentCells[i]];
          }

          for (const cell of currentCells) {
            for (const [dr, dc] of dirs) {
              const nr = cell.r + dr;
              const nc = cell.c + dc;
              if (nr >= 0 && nr < size && nc >= 0 && nc < size && map[nr][nc] === -1) {
                map[nr][nc] = regionIdx;
                regionSizes[regionIdx]++;
                changed = true;
              }
            }
          }
        }
      }

      return map;
    };

    const solution = generateCowPositions();
    const map = generateRegions(solution);

    return {
      size,
      map,
      solution
    };
  };

  // 动态关卡列表
  const levelsRef = ref([...LEVELS]);

  // 生成更多关卡
  const generateMoreLevels = (count = 10) => {
    const startIndex = levelsRef.value.length;

    for (let i = 0; i < count; i++) {
      // 根据关卡进度选择棋盘大小
      const levelNum = startIndex + i;
      let size;
      if (levelNum < 3) size = 4;
      else if (levelNum < 6) size = 5;
      else if (levelNum < 10) size = 6;
      else if (levelNum < 15) size = 7;
      else size = 8;

      const level = generateLevel(size, Date.now() + i);
      levelsRef.value.push(level);
    }
  };

  // 初始化生成一些额外关卡
  generateMoreLevels(20);

  const currentLevelIndex = ref(0);
  const grid = ref([]);
  const mistakes = ref(new Set());
  const isWon = ref(false);
  const isGameOver = ref(false);
  const cowCount = ref(0);
  const health = ref(3);
  const hintCount = ref(3);
  const cowToolCount = ref(3);
  const coins = ref(100);
  const activeModal = ref(null);
  const isInMenu = ref(true);
  const selectedLevelIndex = ref(0);
  const musicOn = ref(true);
  const sfxOn = ref(true);

  // 新增：计时器、步数、撤销
  const elapsedTime = ref(0);
  const moves = ref(0);
  const history = ref([]);
  const completedLevels = ref(new Set(JSON.parse(localStorage.getItem('niuniuCompleted') || '[]')));
  const bestTimes = ref(JSON.parse(localStorage.getItem('niuniuBestTimes') || '{}'));

  const isDragging = ref(false);
  const dragAction = ref(null);
  const lastClick = ref({ time: 0, r: null, c: null, cellValue: 0 });
  const levelRef = ref(0);
  const musicTracksRef = ref([]);
  const musicIndexRef = ref(0);
  const fadeTimerRef = ref(null);
  const gameTimer = ref(null);
  const musicSources = [musicStart, musicLoop, musicLullaby];

  // 格式化时间
  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 计算星级评价
  const calculateStars = computed(() => {
    if (!isWon.value) return 0;
    const levelSize = size.value;
    // 根据用时、步数、剩余血量计算
    const timeScore = Math.max(0, 300 - elapsedTime.value); // 5分钟内完成
    const movesScore = Math.max(0, levelSize * 15 - moves.value);
    const healthScore = health.value * 50;
    const totalScore = timeScore + movesScore + healthScore;
    if (totalScore >= 200) return 3;
    if (totalScore >= 100) return 2;
    return 1;
  });

  // Computed
  const currentLevel = computed(() => levelsRef.value[currentLevelIndex.value]);
  const size = computed(() => currentLevel.value.size);
  const remainingCount = computed(() => size.value - cowCount.value);

  const flattenedGrid = computed(() => {
    const result = [];
    for (let r = 0; r < grid.value.length; r++) {
      for (let c = 0; c < grid.value[r].length; c++) {
        result.push({
          value: grid.value[r][c],
          colorClass: regionColors[currentLevel.value.map[r][c]],
          isMistake: mistakes.value.has(`${r},${c}`)
        });
      }
    }
    return result;
  });

  const hintGridCells = computed(() => {
    if (!activeModal.value || activeModal.value.type !== 'hint') return [];
    const result = [];
    const hintR = activeModal.value.r;
    const hintC = activeModal.value.c;
    for (let r = 0; r < grid.value.length; r++) {
      for (let c = 0; c < grid.value[r].length; c++) {
        const cell = grid.value[r][c];
        const isHighlight = r === hintR || c === hintC;
        const isTarget = r === hintR && c === hintC;
        result.push({
          colorClass: regionColors[currentLevel.value.map[r][c]],
          isHighlight,
          isTarget,
          showX: !isHighlight && cell !== 1 && cell !== 2,
          showCow: isTarget && cell !== 1
        });
      }
    }
    return result;
  });

  watch(currentLevelIndex, value => {
    levelRef.value = value;
  });

  const clearFadeTimer = () => {
    if (fadeTimerRef.value) {
      clearInterval(fadeTimerRef.value);
      fadeTimerRef.value = null;
    }
  };

  const fadeAudioTo = (audio, target, duration = 800) => {
    if (!audio) return;
    clearFadeTimer();
    const start = audio.volume ?? 0;
    const diff = target - start;
    const steps = Math.max(1, Math.floor(duration / 50));
    let step = 0;
    fadeTimerRef.value = setInterval(() => {
      step += 1;
      const next = start + diff * (step / steps);
      audio.volume = Math.min(1, Math.max(0, next));
      if (step >= steps) {
        clearFadeTimer();
        if (target === 0) {
          audio.pause();
        }
      }
    }, 50);
  };

  const playCurrentTrack = () => {
    const tracks = musicTracksRef.value;
    const current = tracks[musicIndexRef.value];
    if (!current) return;
    tracks.forEach((track, index) => {
      if (index !== musicIndexRef.value) {
        track.pause();
        track.currentTime = 0;
        track.volume = 0;
      }
    });
    current.currentTime = current.currentTime || 0;
    current.volume = 0;
    const playPromise = current.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(() => {});
    }
    fadeAudioTo(current, 1, 900);
  };

  onMounted(() => {
    musicTracksRef.value = musicSources.map(src => {
      const audio = new Audio(src);
      audio.preload = 'auto';
      audio.volume = 0;
      return audio;
    });
    musicTracksRef.value.forEach(audio => {
      audio.onended = () => {
        musicIndexRef.value = (musicIndexRef.value + 1) % musicTracksRef.value.length;
        if (musicOn.value) playCurrentTrack();
      };
    });
    if (musicOn.value) playCurrentTrack();
  });

  onUnmounted(() => {
    clearFadeTimer();
    musicTracksRef.value.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
      audio.onended = null;
    });
  });

  watch(musicOn, value => {
    const tracks = musicTracksRef.value;
    if (!tracks.length) return;
    const current = tracks[musicIndexRef.value];
    if (value) {
      const playPromise = current?.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(() => {});
      }
      fadeAudioTo(current, 1, 900);
    } else {
      fadeAudioTo(current, 0, 600);
    }
  });

  const validateGridState = (gridToCheck, level) => {
    const newMistakes = new Set();
    let cowsPlaced = 0;
    const levelSize = level.size;
    const rowCounts = Array(levelSize).fill(0);
    const colCounts = Array(levelSize).fill(0);
    const regionCounts = Array(levelSize).fill(0);
    const cowPositions = [];

    for (let r = 0; r < levelSize; r += 1) {
      for (let c = 0; c < levelSize; c += 1) {
        if (gridToCheck[r][c] === 1) {
          cowsPlaced += 1;
          rowCounts[r] += 1;
          colCounts[c] += 1;
          regionCounts[level.map[r][c]] += 1;
          cowPositions.push({ r, c });
        }
      }
    }

    for (let r = 0; r < levelSize; r += 1) {
      for (let c = 0; c < levelSize; c += 1) {
        if (gridToCheck[r][c] === 1) {
          if (rowCounts[r] > 1) newMistakes.add(`${r},${c}`);
          if (colCounts[c] > 1) newMistakes.add(`${r},${c}`);
          if (regionCounts[level.map[r][c]] > 1) newMistakes.add(`${r},${c}`);
        }
      }
    }

    for (let i = 0; i < cowPositions.length; i += 1) {
      for (let j = i + 1; j < cowPositions.length; j += 1) {
        const cow1 = cowPositions[i];
        const cow2 = cowPositions[j];
        if (Math.abs(cow1.r - cow2.r) <= 1 && Math.abs(cow1.c - cow2.c) <= 1) {
          newMistakes.add(`${cow1.r},${cow1.c}`);
          newMistakes.add(`${cow2.r},${cow2.c}`);
        }
      }
    }

    for (let r = 0; r < levelSize; r += 1) {
      for (let c = 0; c < levelSize; c += 1) {
        if (gridToCheck[r][c] === 1) {
          const isCorrect = level.solution.some(pos => pos.r === r && pos.c === c);
          if (!isCorrect) newMistakes.add(`${r},${c}`);
        }
      }
    }

    return {
      newMistakes,
      cowsPlaced,
      isWonStatus: cowsPlaced === levelSize && newMistakes.size === 0
    };
  };

  const updateGridState = updater => {
    const next = updater(grid.value);
    if (next === grid.value) return;
    grid.value = next;
    const { newMistakes, cowsPlaced, isWonStatus } = validateGridState(
      next,
      levelsRef.value[levelRef.value]
    );
    mistakes.value = newMistakes;
    cowCount.value = cowsPlaced;
    isWon.value = isWonStatus;
  };

  const loadLevel = index => {
    const level = levelsRef.value[index];
    const levelSize = level.size;
    const initialGrid = Array(levelSize)
      .fill(null)
      .map(() => Array(levelSize).fill(0));
    const firstCow = level.solution[0];
    initialGrid[firstCow.r][firstCow.c] = 1;

    grid.value = initialGrid;
    currentLevelIndex.value = index;
    isGameOver.value = false;
    health.value = 3;
    hintCount.value = 3;
    cowToolCount.value = 3;
    activeModal.value = null;
    selectedLevelIndex.value = index;
    isDragging.value = false;
    lastClick.value = { time: 0, r: null, c: null, cellValue: 0 };

    // 重置计时器和步数
    elapsedTime.value = 0;
    moves.value = 0;
    history.value = [];

    // 启动计时器
    if (gameTimer.value) clearInterval(gameTimer.value);
    gameTimer.value = setInterval(() => {
      elapsedTime.value++;
    }, 1000);

    const { newMistakes, cowsPlaced, isWonStatus } = validateGridState(initialGrid, level);
    mistakes.value = newMistakes;
    cowCount.value = cowsPlaced;
    isWon.value = isWonStatus;
  };

  onMounted(() => {
    loadLevel(0);
  });

  const handleUp = () => {
    isDragging.value = false;
  };

  onMounted(() => {
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
  });

  onUnmounted(() => {
    window.removeEventListener('pointerup', handleUp);
    window.removeEventListener('pointercancel', handleUp);
    if (gameTimer.value) {
      clearInterval(gameTimer.value);
      gameTimer.value = null;
    }
  });

  // 监听游戏结束
  watch(isGameOver, over => {
    if (over && gameTimer.value) {
      clearInterval(gameTimer.value);
      gameTimer.value = null;
    }
  });

  const getCellCoords = e => {
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (!target) return null;
    const r = target.getAttribute('data-r');
    const c = target.getAttribute('data-c');
    if (r !== null && c !== null) return { r: parseInt(r, 10), c: parseInt(c, 10) };
    return null;
  };

  const handleDoubleClick = (r, c) => {
    const level = levelsRef.value[levelRef.value];
    let wasError = false;

    updateGridState(prev => {
      const isCurrentlyCow = prev[r][c] === 1;
      if (!isCurrentlyCow) {
        const isCorrect = level.solution.some(pos => pos.r === r && pos.c === c);
        if (!isCorrect) {
          wasError = true;
          const nextHealth = health.value - 1;
          health.value = nextHealth;
          if (nextHealth <= 0) isGameOver.value = true;
        }
      }
      const next = prev.map(row => [...row]);
      next[r][c] = isCurrentlyCow ? 0 : 1;
      return next;
    });

    if (wasError) {
      setTimeout(() => {
        updateGridState(prev => {
          if (prev[r] && prev[r][c] === 1) {
            const isCorrect = levelsRef.value[levelRef.value].solution.some(
              pos => pos.r === r && pos.c === c
            );
            if (!isCorrect) {
              const next = prev.map(row => [...row]);
              next[r][c] = 0;
              return next;
            }
          }
          return prev;
        });
      }, 600);
    }
  };

  const onPointerDown = e => {
    if (isWon.value || isGameOver.value) return;
    const coords = getCellCoords(e);
    if (!coords) return;
    const { r, c } = coords;

    const currentCellValue = grid.value[r] ? grid.value[r][c] : 0;

    // 如果格子有牛，不处理
    if (currentCellValue === 1) return;

    const now = Date.now();
    const lc = lastClick.value;

    // 双击检测：同一格子在300ms内点击两次，生成牛牛
    if (lc.r === r && lc.c === c && now - lc.time < 300) {
      lastClick.value = { time: 0, r: null, c: null, cellValue: 0 };
      isDragging.value = false;
      handleDoubleClick(r, c);
      return;
    }

    // 记录本次点击，保存当前格子状态
    lastClick.value = { time: now, r, c, cellValue: currentCellValue };

    // 开始拖拽，根据点击时的格子状态决定操作
    isDragging.value = true;
    dragAction.value = currentCellValue === 0 ? 2 : 0; // 空格子标记X，有X则消除
    applyDragAction(r, c, currentCellValue);
  };

  const onPointerMove = e => {
    if (!isDragging.value || isWon.value || isGameOver.value) return;
    const coords = getCellCoords(e);
    if (!coords) return;
    const { r, c } = coords;
    const currentCellValue = grid.value[r] ? grid.value[r][c] : 0;
    applyDragAction(r, c, currentCellValue);
  };

  const applyDragAction = (r, c, cellValue) => {
    // 如果格子有牛，不处理
    if (cellValue === 1) return;

    // 根据dragAction决定操作
    // dragAction为2表示标记X，为0表示清除
    updateGridState(prev => {
      if (prev[r][c] === 1) return prev; // 有牛不处理
      if (prev[r][c] === dragAction.value) return prev; // 状态相同不处理

      // 记录历史用于撤销
      history.value.push({
        grid: prev.map(row => [...row]),
        r,
        c,
        oldValue: prev[r][c],
        newValue: dragAction.value
      });
      // 限制历史记录数量
      if (history.value.length > 50) history.value.shift();

      moves.value++; // 增加步数

      const next = prev.map(row => [...row]);
      next[r][c] = dragAction.value;
      return next;
    });
  };

  // 撤销操作
  const undo = () => {
    if (history.value.length === 0 || isWon.value || isGameOver.value) return;
    const lastAction = history.value.pop();
    if (lastAction) {
      grid.value = lastAction.grid;
      moves.value = Math.max(0, moves.value - 1);
      const { newMistakes, cowsPlaced } = validateGridState(
        grid.value,
        levelsRef.value[levelRef.value]
      );
      mistakes.value = newMistakes;
      cowCount.value = cowsPlaced;
    }
  };

  const openPurchaseModal = type => {
    activeModal.value = { type: 'purchase', tool: type };
  };

  const openInsufficientModal = type => {
    activeModal.value = { type: 'insufficient', tool: type };
  };

  const openHintModal = (r, c) => {
    activeModal.value = { type: 'hint', r, c };
  };

  const startAd = tool => {
    activeModal.value = { type: 'ad', tool };
  };

  const openSettingsModal = () => {
    activeModal.value = { type: 'settings' };
  };

  const getNextSolutionCell = () => {
    const level = levelsRef.value[currentLevelIndex.value];
    for (const pos of level.solution) {
      if (grid.value[pos.r] && grid.value[pos.r][pos.c] !== 1) {
        return pos;
      }
    }
    return null;
  };

  const handleCowTool = () => {
    if (isWon.value || isGameOver.value) return;
    if (cowToolCount.value <= 0) {
      openPurchaseModal('cow');
      return;
    }
    const nextPos = getNextSolutionCell();
    if (!nextPos) return;
    cowToolCount.value = Math.max(0, cowToolCount.value - 1);
    updateGridState(prev => {
      const next = prev.map(row => [...row]);
      next[nextPos.r][nextPos.c] = 1;
      return next;
    });
  };

  const handleHint = () => {
    if (isWon.value || isGameOver.value) return;
    if (hintCount.value <= 0) {
      openPurchaseModal('hint');
      return;
    }
    const level = levelsRef.value[currentLevelIndex.value];
    let rToPlace = -1;
    let cToPlace = -1;

    for (const pos of level.solution) {
      if (grid.value[pos.r] && grid.value[pos.r][pos.c] !== 1) {
        rToPlace = pos.r;
        cToPlace = pos.c;
        break;
      }
    }

    if (rToPlace !== -1) {
      hintCount.value = Math.max(0, hintCount.value - 1);
      openHintModal(rToPlace, cToPlace);
    }
  };

  watch(activeModal, (value, _, onCleanup) => {
    if (!value || value.type !== 'ad') return;
    const timer = setTimeout(() => {
      if (value.tool === 'cow') {
        cowToolCount.value += 1;
      }
      if (value.tool === 'hint') {
        hintCount.value += 1;
      }
      activeModal.value = null;
    }, 1200);
    onCleanup(() => clearTimeout(timer));
  });

  // 监听胜利状态
  watch(isWon, won => {
    if (won) {
      // 停止计时器
      if (gameTimer.value) {
        clearInterval(gameTimer.value);
        gameTimer.value = null;
      }
      // 保存完成进度
      completedLevels.value.add(currentLevelIndex.value);
      localStorage.setItem('niuniuCompleted', JSON.stringify([...completedLevels.value]));
      // 保存最佳时间
      const levelKey = currentLevelIndex.value;
      if (!bestTimes.value[levelKey] || elapsedTime.value < bestTimes.value[levelKey]) {
        bestTimes.value[levelKey] = elapsedTime.value;
        localStorage.setItem('niuniuBestTimes', JSON.stringify(bestTimes.value));
      }
      // 奖励金币
      coins.value += 10 + health.value * 5;
    }
  });

  const handleNextLevel = () => {
    // 如果接近关卡末尾，自动生成更多关卡
    if (currentLevelIndex.value >= levelsRef.value.length - 3) {
      generateMoreLevels(10);
    }
    const nextIndex = currentLevelIndex.value + 1;
    loadLevel(nextIndex);
  };

  const startGame = () => {
    loadLevel(selectedLevelIndex.value);
    isInMenu.value = false;
  };

  const purchaseWithCoins = () => {
    if (coins.value < 100) {
      openInsufficientModal(activeModal.value?.tool);
      return;
    }
    coins.value -= 100;
    if (activeModal.value?.tool === 'cow') cowToolCount.value += 1;
    if (activeModal.value?.tool === 'hint') hintCount.value += 1;
    activeModal.value = null;
  };
</script>

<style scoped>
  .niuniu-match-tool {
    --bg: #f5f7fa;
    --card: #ffffff;
    --text: #2c3e50;
    --text-secondary: #7f8c8d;
    --primary: #409eff;
    --success: #67c23a;
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

  /* Menu Screen */
  .menu-screen {
    text-align: center;
  }

  .menu-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .coin-display {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #fffbe6;
    border-radius: 20px;
    padding: 0.5rem 1rem;
    font-weight: bold;
    color: var(--warning);
  }

  .coin-display.small {
    padding: 0.3rem 0.8rem;
    font-size: 0.9rem;
  }

  .coin-icon {
    font-size: 1.2rem;
  }

  .settings-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
  }

  .settings-btn:hover {
    background: #f5f5f5;
  }

  .game-title {
    margin-bottom: 2rem;
  }

  .cow-icon {
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

  .game-title h2 {
    margin: 0;
    font-size: 2rem;
    color: var(--text);
  }

  .subtitle {
    color: var(--text-secondary);
    margin-top: 0.5rem;
  }

  .level-select {
    background: #f9f9f9;
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .level-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .level-label {
    font-size: 0.9rem;
    color: var(--text-secondary);
  }

  .level-info {
    font-size: 0.85rem;
    color: var(--primary);
    font-weight: bold;
  }

  .level-grid-scroll {
    max-height: 200px;
    overflow-y: auto;
    padding-right: 0.5rem;
  }

  .level-grid-scroll::-webkit-scrollbar {
    width: 6px;
  }

  .level-grid-scroll::-webkit-scrollbar-track {
    background: #e0e0e0;
    border-radius: 3px;
  }

  .level-grid-scroll::-webkit-scrollbar-thumb {
    background: #bbb;
    border-radius: 3px;
  }

  .level-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 0.5rem;
  }

  .level-btn {
    position: relative;
    padding: 0.6rem 0.4rem;
    border: 2px solid #ddd;
    border-radius: 10px;
    background: white;
    cursor: pointer;
    font-weight: bold;
    color: var(--text);
    font-size: 0.9rem;
    transition: all 0.2s;
  }

  .level-btn:hover {
    border-color: var(--primary);
  }

  .level-btn.active {
    border-color: var(--primary);
    background: var(--primary);
    color: white;
  }

  .level-btn.completed {
    background: #e6f7e6;
    border-color: var(--success);
    color: var(--success);
  }

  .check-mark {
    position: absolute;
    top: -6px;
    right: -6px;
    background: var(--success);
    color: white;
    font-size: 0.6rem;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .rules-hint {
    text-align: left;
    background: #f0f7ff;
    border-radius: 12px;
    padding: 1rem 1.5rem;
    margin-bottom: 2rem;
  }

  .rules-hint p {
    margin: 0.3rem 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .start-btn {
    padding: 1rem 3rem;
    font-size: 1.2rem;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .start-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  }

  /* Game Screen */
  .game-screen {
    text-align: center;
  }

  .game-top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .top-left,
  .top-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 100px;
  }

  .top-right {
    justify-content: flex-end;
  }

  .icon-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
  }

  .icon-btn:hover {
    background: #f5f5f5;
  }

  .menu-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
  }

  .menu-btn:hover {
    background: #f5f5f5;
    color: var(--primary);
  }

  .level-title {
    font-size: 1.2rem;
    font-weight: bold;
    color: var(--text);
  }

  .health-bar {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .heart {
    font-size: 1.5rem;
    transition: all 0.3s;
  }

  .heart.empty {
    opacity: 0.4;
    transform: scale(0.8);
  }

  .game-stats {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin-bottom: 1rem;
    padding: 0.8rem 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: white;
  }

  .stat-item.timer {
    font-weight: bold;
  }

  .stat-icon {
    font-size: 1rem;
  }

  .stat-value {
    font-size: 1rem;
    font-weight: 600;
  }

  .rules-bar {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
    padding: 0.8rem;
    background: #f9f9f9;
    border-radius: 12px;
  }

  .rule-item {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .rule-icon {
    font-size: 1rem;
  }

  .cow-counter {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: #f0f7ff;
    padding: 0.5rem 1.5rem;
    border-radius: 20px;
    margin-bottom: 1.5rem;
  }

  .counter-text {
    font-weight: bold;
    color: var(--text);
  }

  .count {
    color: var(--primary);
    font-size: 1.2rem;
  }

  .count.error {
    color: var(--danger);
  }

  .puzzle-board-container {
    margin-bottom: 1.5rem;
  }

  .puzzle-board {
    display: grid;
    gap: 6px;
    padding: 12px;
    background: #2c3e50;
    border-radius: 16px;
  }

  .puzzle-cell {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.15s;
    font-size: 1.8rem;
  }

  .puzzle-cell:hover {
    filter: brightness(0.95);
  }

  .puzzle-cell:active {
    transform: scale(0.95);
  }

  .puzzle-cell.mistake {
    animation: shake 0.3s ease-in-out infinite;
    box-shadow: 0 0 0 3px var(--danger);
  }

  @keyframes shake {
    0%,
    100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-2px);
    }
    75% {
      transform: translateX(2px);
    }
  }

  .cow-emoji {
    animation: popIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  @keyframes popIn {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    70% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .x-mark {
    color: rgba(255, 255, 255, 0.7);
    font-size: 1.5rem;
    font-weight: bold;
  }

  /* Color classes */
  .color-1 {
    background: #a8e6cf;
  }
  .color-2 {
    background: #dcedc1;
  }
  .color-3 {
    background: #ffd3b6;
  }
  .color-4 {
    background: #80bdf6;
  }
  .color-5 {
    background: #ffaaa5;
  }
  .color-6 {
    background: #ff8b94;
  }
  .color-7 {
    background: #e0bbe4;
  }
  .color-8 {
    background: #fec8d8;
  }

  /* Tool Bar */
  .tool-bar {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }

  .tool-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0.8rem 1.2rem;
    border: 2px solid #ddd;
    border-radius: 16px;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    min-width: 70px;
  }

  .tool-btn:hover {
    border-color: var(--primary);
  }

  .tool-btn.disabled {
    background: #f5f5f5;
    color: var(--text-secondary);
    cursor: not-allowed;
  }

  .tool-btn.restart,
  .tool-btn.undo-btn {
    gap: 0.3rem;
    color: var(--text-secondary);
  }

  .tool-btn.restart span,
  .tool-btn.undo-btn span {
    font-size: 0.75rem;
  }

  .cow-tool,
  .hint-tool {
    gap: 0.2rem;
  }

  .tool-icon {
    font-size: 1.8rem;
  }

  .tool-count {
    font-size: 0.9rem;
    font-weight: bold;
    color: var(--primary);
  }

  .tool-btn.disabled .tool-count {
    color: var(--text-secondary);
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    padding: 2rem;
    border-radius: 24px;
    max-width: 360px;
    width: 90%;
    text-align: center;
    animation: popIn 0.3s ease;
  }

  .stars-display {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .star {
    font-size: 2rem;
    opacity: 0.3;
    filter: grayscale(100%);
    transition: all 0.3s;
  }

  .star.active {
    opacity: 1;
    filter: grayscale(0%);
    animation: starPop 0.4s ease;
  }

  @keyframes starPop {
    0% {
      transform: scale(0);
    }
    50% {
      transform: scale(1.3);
    }
    100% {
      transform: scale(1);
    }
  }

  .win-stats,
  .fail-stats {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin-bottom: 1rem;
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 12px;
  }

  .win-stat,
  .fail-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-label {
    font-size: 0.8rem;
    color: var(--text-secondary);
  }

  .stat-val {
    font-size: 1.1rem;
    font-weight: bold;
    color: var(--text);
  }

  .reward-text {
    color: var(--warning);
    font-weight: bold;
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }

  .fail-text {
    color: var(--text-secondary);
    margin-bottom: 1rem;
  }

  .modal-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .modal-icon-sm {
    font-size: 2.5rem;
    display: block;
    margin-bottom: 0.5rem;
  }

  .modal-header {
    margin-bottom: 1rem;
  }

  .modal-header h3 {
    margin: 0;
    color: var(--text);
  }

  .modal-content h2 {
    margin: 0 0 0.5rem 0;
    color: var(--text);
  }

  .modal-content p {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
  }

  .modal-desc {
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }

  .modal-coins {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
  }

  .modal-btn {
    flex: 1;
    padding: 0.8rem;
    border: none;
    border-radius: 12px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
  }

  .modal-btn.primary {
    background: var(--primary);
    color: white;
  }

  .modal-btn.primary:hover {
    background: #337ecc;
  }

  .modal-btn.secondary {
    background: #f0f0f0;
    color: var(--text);
  }

  .modal-btn.secondary:hover {
    background: #e0e0e0;
  }

  .modal-btn.warning {
    background: var(--warning);
    color: white;
  }

  .modal-btn.warning:hover {
    background: #cc9a2a;
  }

  .modal-btn.danger {
    background: var(--danger);
    color: white;
  }

  .modal-btn.danger:hover {
    background: #c45656;
  }

  .win-modal .modal-icon {
    animation: bounce 1s ease infinite;
  }

  /* Hint Grid */
  .hint-grid {
    display: grid;
    gap: 4px;
    margin-bottom: 1.5rem;
    padding: 8px;
    background: #2c3e50;
    border-radius: 12px;
  }

  .hint-cell {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    font-size: 0.9rem;
  }

  .hint-cell.highlight {
    background: rgba(255, 255, 255, 0.3) !important;
  }

  .hint-cell.target {
    box-shadow: 0 0 0 2px var(--danger);
    background: rgba(255, 200, 200, 0.5) !important;
  }

  .hint-x {
    color: rgba(255, 100, 100, 0.8);
    font-weight: bold;
  }

  .hint-cow {
    font-size: 1.2rem;
  }

  /* Ad Progress */
  .ad-progress {
    height: 6px;
    background: #eee;
    border-radius: 3px;
    overflow: hidden;
  }

  .ad-progress-bar {
    height: 100%;
    width: 70%;
    background: var(--primary);
    animation: progress 1.2s linear forwards;
  }

  @keyframes progress {
    from {
      width: 0;
    }
    to {
      width: 100%;
    }
  }

  /* Settings */
  .settings-list {
    margin-bottom: 1.5rem;
  }

  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 12px;
    margin-bottom: 0.5rem;
  }

  .toggle {
    width: 48px;
    height: 28px;
    border-radius: 14px;
    border: none;
    background: #ccc;
    cursor: pointer;
    position: relative;
  }

  .toggle.on {
    background: var(--primary);
  }

  .toggle-dot {
    position: absolute;
    top: 4px;
    left: 4px;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: transform 0.2s;
  }

  .toggle.on .toggle-dot {
    transform: translateX(20px);
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
