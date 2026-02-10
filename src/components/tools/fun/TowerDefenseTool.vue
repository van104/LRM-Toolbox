<template>
  <div class="td-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>塔防小游戏</h1>
        <span class="nav-subtitle"
          >Simple Tower Defense -
          {{ gameMode === 'endless' ? 'Endless' : 'Level ' + gameLevel }}</span
        >
      </div>
      <div class="nav-right">
        <div class="speed-toggle">
          <button class="speed-btn" :class="{ active: gameSpeed === 1 }" @click="gameSpeed = 1">
            1x
          </button>
          <button class="speed-btn" :class="{ active: gameSpeed === 2 }" @click="gameSpeed = 2">
            2x
          </button>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <div class="game-layout">
        <div ref="containerRef" class="game-board-container">
          <canvas
            ref="canvasRef"
            @click="handleCanvasClick"
            @mousemove="handleCanvasMove"
            @mouseleave="handleCanvasLeave"
          ></canvas>

          <div v-if="gameState !== 'playing' && gameState !== 'paused'" class="overlay">
            <div class="overlay-content">
              <h2 v-if="gameState === 'gameover'">GAME OVER</h2>
              <h2 v-else-if="gameState === 'level_complete'">关卡完成!</h2>
              <h2 v-else-if="gameState === 'victory'">恭喜通关!</h2>
              <h2 v-else>TOWER DEFENSE</h2>

              <p v-if="gameState === 'gameover'">
                最终止步: {{ gameMode === 'endless' ? '无尽模式' : '第' + gameLevel + '关' }} - 第{{
                  wave
                }}波
              </p>
              <p v-else-if="gameState === 'level_complete'">准备好进入下一关了吗？</p>
              <p v-else-if="gameState === 'victory'">你击败了最终BOSS，守护了家园！</p>
              <p v-else>抵御敌人的进攻，保护你的基地！</p>

              <div class="overlay-btns">
                <template v-if="gameState === 'start'">
                  <button class="start-btn" @click="startGame('story')">闯关模式</button>
                  <button class="start-btn" @click="gameState = 'mode_select'">自由模式</button>
                  <button class="start-btn" @click="startGame('endless')">无尽模式</button>
                </template>

                <template v-else-if="gameState === 'mode_select'">
                  <div class="level-grid">
                    <button
                      v-for="(map, idx) in LEVEL_MAPS"
                      :key="idx"
                      class="level-btn"
                      @click="startFreedomLevel(idx + 1)"
                    >
                      第 {{ idx + 1 }} 关
                    </button>
                  </div>
                  <button class="cancel-btn" @click="gameState = 'start'">返回</button>
                </template>

                <button
                  v-else-if="gameState === 'level_complete'"
                  class="start-btn"
                  @click="startNextLevel"
                >
                  进入第 {{ gameLevel + 1 }} 关
                </button>

                <button v-else class="start-btn" @click="gameState = 'start'">返回主菜单</button>
              </div>
            </div>
          </div>

          <!-- 新增：空地建造悬浮菜单 -->
          <div v-if="activeBuildSite" class="build-menu" :style="buildMenuStyle">
            <div class="build-menu-title">选择防御塔</div>
            <div class="build-options">
              <div
                v-for="(type, key) in TOWER_TYPES"
                :key="key"
                class="build-option"
                :class="{ disabled: money < type.cost }"
                @click="buildTowerAtSite(key)"
              >
                <span class="emoji">{{ type.emoji }}</span>
                <span class="cost">💰{{ type.cost }}</span>
                <span class="name">{{ type.name }}</span>
              </div>
            </div>
            <div class="build-menu-close" @click="activeBuildSite = null">
              <el-icon>
                <Close />
              </el-icon>
            </div>
          </div>
        </div>

        <div class="controls-panel">
          <div class="control-main-grid">
            <!-- 左侧：状态与技能 -->
            <div class="panel-section-left">
              <div class="panel-card stats-card">
                <div class="stats-grid">
                  <div class="stat-item">
                    <span class="label">生命</span>
                    <span class="value heart">❤️ {{ lives }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">金钱</span>
                    <span class="value money">💰 {{ money }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">波次</span>
                    <span class="value"
                      >🌊 {{ wave }}/{{
                        gameMode === 'endless' ? '∞' : LEVEL_CONFIG[gameLevel - 1]?.waves || 10
                      }}</span
                    >
                  </div>
                  <div class="stat-item">
                    <span class="label">能量</span>
                    <span class="value mana">⚡ {{ Math.floor(mana) }}</span>
                  </div>
                </div>
              </div>

              <div class="panel-card actions-card">
                <div class="skills-panel">
                  <h3>主动技能</h3>
                  <div class="skill-btns">
                    <button
                      class="skill-btn"
                      :class="{
                        active: selectedSkill === 'meteor',
                        disabled: mana < 40 || !isWaveActive
                      }"
                      title="陨石冲击 (40能量)"
                      @click="selectSkill('meteor')"
                    >
                      <span class="icon">☄️</span>
                      <span class="cost">40</span>
                    </button>
                    <button
                      class="skill-btn"
                      :class="{
                        active: selectedSkill === 'freeze',
                        disabled: mana < 60 || !isWaveActive
                      }"
                      title="全场冻结 (60能量)"
                      @click="selectSkill('freeze')"
                    >
                      <span class="icon">🧊</span>
                      <span class="cost">60</span>
                    </button>
                  </div>
                </div>

                <div class="game-actions">
                  <button
                    class="wave-btn"
                    :disabled="isWaveActive || gameState !== 'playing'"
                    @click="spawnNextWave"
                  >
                    {{ isWaveActive ? '波次进行中...' : '下一波敌人' }}
                  </button>
                  <div class="sub-actions">
                    <button class="restart-btn" @click="restartGame">
                      <el-icon>
                        <Refresh />
                      </el-icon>
                      重新开始
                    </button>
                    <button class="menu-btn" @click="gameState = 'start'">
                      <el-icon>
                        <HomeFilled />
                      </el-icon>
                      返回菜单
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 右侧：防御塔操作 -->
            <div class="panel-section-right">
              <div class="panel-card towers-card">
                <div v-if="!selectedTowerInstance && !selectedObstacle" class="towers-selection">
                  <h3>建造防御塔</h3>
                  <div class="tower-options">
                    <div
                      v-for="(type, key) in TOWER_TYPES"
                      :key="key"
                      class="tower-card"
                      :class="{ active: selectedTowerType === key, disabled: money < type.cost }"
                      @click="selectTowerType(key)"
                    >
                      <div class="tower-icon-wrapper" :class="key">
                        <span class="tower-emoji">{{ type.emoji }}</span>
                      </div>
                      <div class="tower-info">
                        <span class="name">{{ type.name }}</span>
                        <span class="cost">💰{{ type.cost }}</span>
                      </div>
                    </div>
                  </div>
                  <div v-if="selectedTowerType" class="selected-type-info">
                    <p class="type-desc">{{ TOWER_TYPES[selectedTowerType].desc }}</p>
                  </div>
                </div>

                <div v-else-if="selectedObstacle" class="upgrade-panel">
                  <h3>清理障碍物</h3>
                  <div class="selected-tower-preview">
                    <span class="preview-emoji">{{
                      selectedObstacle.type === 4 ? '🪨' : '🌳'
                    }}</span>
                    <div class="preview-info">
                      <span class="name">{{
                        selectedObstacle.type === 4 ? '坚硬的岩石' : '茂密的树木'
                      }}</span>
                      <span class="stats"
                        >位置: ({{ selectedObstacle.c }}, {{ selectedObstacle.r }})</span
                      >
                    </div>
                  </div>
                  <div class="upgrade-actions">
                    <button
                      class="upgrade-btn"
                      :disabled="money < 200"
                      @click="clearObstacleConfirm"
                    >
                      <div class="btn-content">
                        <el-icon>
                          <Delete />
                        </el-icon>
                        确认清理 (💰200)
                      </div>
                    </button>
                    <button class="cancel-btn" @click="selectedObstacle = null">
                      <el-icon>
                        <Close />
                      </el-icon>
                      取消
                    </button>
                  </div>
                </div>

                <div v-else-if="selectedTowerInstance" class="upgrade-panel">
                  <h3>防御塔升级</h3>
                  <div class="selected-tower-preview">
                    <span class="preview-emoji">{{ selectedTowerInstance.type.emoji }}</span>
                    <div class="preview-info">
                      <span class="name"
                        >{{ selectedTowerInstance.type.name }} (Lv.{{
                          selectedTowerInstance.level
                        }})</span
                      >
                      <span class="stats"
                        >攻击: {{ getTowerDamage(selectedTowerInstance) }} | 射速:
                        {{
                          (((60 / getTowerRate(selectedTowerInstance)) * 60) / 60).toFixed(1)
                        }}/s</span
                      >
                    </div>
                  </div>

                  <div class="upgrade-actions">
                    <button
                      v-if="selectedTowerInstance.level < 3"
                      class="upgrade-btn"
                      :disabled="money < getUpgradeCost(selectedTowerInstance)"
                      @click="upgradeTower"
                    >
                      <div class="btn-content">
                        <el-icon>
                          <Top />
                        </el-icon>
                        升级 (💰{{ getUpgradeCost(selectedTowerInstance) }})
                      </div>
                      <span class="upgrade-desc">
                        Lv.{{ selectedTowerInstance.level + 1 }}: 伤害+50% 攻速+10%
                      </span>
                    </button>
                    <button v-else class="upgrade-btn max-level" disabled>
                      <el-icon>
                        <Trophy />
                      </el-icon>
                      已升至顶级
                    </button>

                    <button class="sell-btn" @click="sellTower">
                      <el-icon>
                        <Delete />
                      </el-icon>
                      出售 (💰{{ Math.floor(selectedTowerInstance.totalCost * 0.6) }})
                    </button>

                    <button class="cancel-btn" @click="deselectTower">
                      <el-icon>
                        <Close />
                      </el-icon>
                      取消选择
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 塔防小游戏</footer>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted, computed } from 'vue';
  import { Back, Refresh, Top, Delete, Close, Trophy, HomeFilled } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';

  const TILE_SIZE = 40;
  const COLS = 16;
  const ROWS = 12;
  const WIDTH = COLS * TILE_SIZE;
  const HEIGHT = ROWS * TILE_SIZE;

  const TOWER_TYPES = {
    basic: {
      name: '基础塔',
      cost: 100,
      range: 120,
      baseDamage: 15,
      baseRate: 35,
      color: '#409eff',
      projectileSpeed: 8,
      emoji: '🏯',
      desc: '射程均衡，适合前期过渡。'
    },
    rapid: {
      name: '速射塔',
      cost: 250,
      range: 100,
      baseDamage: 6,
      baseRate: 10,
      color: '#e6a23c',
      projectileSpeed: 12,
      emoji: '⚡',
      desc: '极高攻速，对付成群弱小敌人。'
    },
    sniper: {
      name: '狙击塔',
      cost: 400,
      range: 280,
      baseDamage: 60,
      baseRate: 70,
      color: '#f56c6c',
      projectileSpeed: 18,
      emoji: '🎯',
      desc: '超远射程，高额单体伤害。'
    },
    slow: {
      name: '冰霜塔',
      cost: 200,
      range: 130,
      baseDamage: 5,
      baseRate: 40,
      color: '#00ffff',
      projectileSpeed: 10,
      emoji: '❄️',
      effect: 'slow',
      desc: '减速敌人，争取更多输出时间。'
    },
    missile: {
      name: '导弹塔',
      cost: 600,
      range: 200,
      baseDamage: 40,
      baseRate: 60,
      color: '#8e44ad',
      projectileSpeed: 10,
      emoji: '🚀',
      effect: 'aoe',
      desc: '范围爆炸伤害，防御核心。'
    },
    mine: {
      name: '金矿',
      cost: 300,
      range: 0,
      baseDamage: 0,
      baseRate: 0,
      color: '#ffd700',
      emoji: '💰',
      effect: 'gold',
      desc: '每波开始后每隔5秒产出金币，波次结束停止。'
    },
    buff: {
      name: '增益塔',
      cost: 450,
      range: 100,
      baseDamage: 0,
      baseRate: 0,
      color: '#2ecc71',
      emoji: '🧪',
      effect: 'buff',
      desc: '提升范围内防御塔30%伤害和射程。'
    },
    radar: {
      name: '雷达',
      cost: 350,
      range: 150,
      baseDamage: 0,
      baseRate: 0,
      color: '#3498db',
      emoji: '📡',
      effect: 'radar',
      desc: '探测并揭示范围内的隐身敌人。'
    }
  };

  const LEVEL_MAPS = [
    [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [3, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],

    [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      [0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],

    [
      [3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
      [0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0],
      [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
      [0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    // Level 4 / Endless Map
    [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [3, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2],
      [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0],
      [0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0],
      [0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]
  ];

  const LEVEL_CONFIG = [
    { waves: 5, hpScale: 1.0 },
    { waves: 10, hpScale: 1.5 },
    { waves: 15, hpScale: 2.2 },
    { waves: 20, hpScale: 3.0 }
  ];

  const canvasRef = ref(null);
  const gameState = ref('start');
  const gameMode = ref('story'); // story, freedom, endless
  const gameLevel = ref(1);
  const money = ref(300);
  const lives = ref(20);
  const wave = ref(1);
  const isWaveActive = ref(false);
  const selectedTowerType = ref(null);
  const selectedTowerInstance = ref(null);
  const mousePos = ref({ x: -100, y: -100 });
  const isMouseInCanvas = ref(false);
  const gameSpeed = ref(1);
  const mana = ref(0);
  const selectedSkill = ref(null); // 'meteor', 'freeze'
  const selectedObstacle = ref(null); // { r, c, type }
  const activeBuildSite = ref(null); // { r, c, x, y }

  let currentMap = [];
  let waypoints = [];
  let towers = [];
  let enemies = [];
  let bullets = [];
  let particles = [];
  let ctx = null;
  let animationId = null;
  let waveInterval = null;
  let isSpawning = false;
  const supplyBoxes = ref([]);

  const buildMenuStyle = computed(() => {
    if (!activeBuildSite.value) return { display: 'none' };
    // 如果在顶部 4 行，菜单向下弹出，否则向上弹出
    const isTopSide = activeBuildSite.value.r < 4;
    return {
      left: `${activeBuildSite.value.px}px`,
      top: `${activeBuildSite.value.py}px`,
      '--menu-dir': isTopSide ? '0%' : '-100%',
      '--menu-offset': isTopSide ? '50px' : '-10px'
    };
  });

  function restartGame() {
    initLevel();
  }

  function startNextLevel() {
    if (gameLevel.value < LEVEL_MAPS.length) {
      gameLevel.value++;
      initLevel();
    } else {
      gameState.value = 'victory';
    }
  }

  function initLevel() {
    currentMap = JSON.parse(JSON.stringify(LEVEL_MAPS[gameLevel.value - 1] || LEVEL_MAPS[0]));
    waypoints = generateWaypoints(currentMap);

    towers = [];
    enemies = [];
    bullets = [];
    particles = [];
    supplyBoxes.value = [];
    selectedObstacle.value = null;
    activeBuildSite.value = null;

    money.value = 350 + (gameLevel.value - 1) * 100;
    lives.value = 10;
    wave.value = 1;
    mana.value = 50;
    isWaveActive.value = false;
    selectedTowerInstance.value = null;
    selectedSkill.value = null;

    // 随机生成障碍物
    generateRandomObstacles();

    gameState.value = 'playing';
    isSpawning = false;

    if (animationId) {
      cancelAnimationFrame(animationId);
    }

    if (waveInterval) {
      clearInterval(waveInterval);
      waveInterval = null;
    }

    if (ctx) {
      draw();
      gameLoop();
    }
  }

  function startGame(mode = 'story') {
    gameMode.value = mode;
    if (mode === 'story') {
      gameLevel.value = 1;
    } else if (mode === 'endless') {
      gameLevel.value = 4; // 使用第4关地图作为无尽模式
    }
    initLevel();
  }

  function generateRandomObstacles() {
    // 显著增大随机范围：每局生成 10-30 个障碍物
    const count = 10 + Math.floor(Math.random() * 21);
    let generated = 0;
    let attempts = 0;

    while (generated < count && attempts < 100) {
      attempts++;
      const r = Math.floor(Math.random() * ROWS);
      const c = Math.floor(Math.random() * COLS);

      // 只能在空地上生成（0），不能在路径（1）、基地（2）或出生中心（3）生成
      // 同时检查周围防止直接堵死
      if (currentMap[r][c] === 0) {
        // 额外规则：不生成在 2、3 的正相邻格，留出空间
        let isNearCritical = false;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr,
              nc = c + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
              if (currentMap[nr][nc] === 2 || currentMap[nr][nc] === 3) {
                isNearCritical = true;
              }
            }
          }
        }

        if (!isNearCritical) {
          currentMap[r][c] = Math.random() > 0.5 ? 4 : 5; // 4:石头, 5:树
          generated++;
        }
      }
    }
  }

  function startFreedomLevel(level) {
    gameMode.value = 'freedom';
    gameLevel.value = level;
    initLevel();
  }

  function generateWaypoints(grid) {
    let startR = -1,
      startC = -1;

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c] === 3) {
          startR = r;
          startC = c;
          break;
        }
      }
    }

    const getCenter = (r, c) => ({
      x: c * TILE_SIZE + TILE_SIZE / 2,
      y: r * TILE_SIZE + TILE_SIZE / 2
    });
    const path = [];
    const visited = new Set();
    let currR = startR,
      currC = startC;

    while (true) {
      path.push(getCenter(currR, currC));
      visited.add(`${currR},${currC}`);

      if (grid[currR][currC] === 2) break;

      const neighbors = [
        { r: currR, c: currC + 1 },
        { r: currR + 1, c: currC },
        { r: currR, c: currC - 1 },
        { r: currR - 1, c: currC }
      ];

      let found = false;
      for (let n of neighbors) {
        if (n.r >= 0 && n.r < ROWS && n.c >= 0 && n.c < COLS) {
          const val = grid[n.r][n.c];
          if ((val === 1 || val === 2) && !visited.has(`${n.r},${n.c}`)) {
            currR = n.r;
            currC = n.c;
            found = true;
            break;
          }
        }
      }
      if (!found) break;
    }
    return path;
  }

  function spawnNextWave() {
    if (isWaveActive.value) return;

    // 波次开始时，金矿产生金币奖励
    towers.forEach(t => {
      if (t.type.effect === 'gold') {
        const amount = 80 + t.level * 40; // 单次金额提高，平衡波次触发
        money.value += amount;
        createParticles(t.x, t.y, '#ffd700', 15);
      }
    });

    isWaveActive.value = true;
    isSpawning = true;

    let count, hp, isBossWave;

    if (gameMode.value === 'endless') {
      // 无尽模式配置
      isBossWave = wave.value % 5 === 0;
      const baseCount = 10 + Math.floor(wave.value * 0.5);
      count = isBossWave ? 1 : Math.min(50, baseCount);

      // 血量指数增长
      const baseHP = 40 * Math.pow(1.15, wave.value);
      hp = Math.floor(isBossWave ? baseHP * 15 : baseHP);
    } else {
      // 剧情/自由模式配置
      const levelConf = LEVEL_CONFIG[gameLevel.value - 1] || LEVEL_CONFIG[0];
      isBossWave = gameLevel.value >= 3 && wave.value === levelConf.waves;

      const baseCount = 8 + wave.value * 2;
      count = isBossWave ? 1 : Math.floor(baseCount + (gameLevel.value - 1) * 3);

      const baseHP = 50 * levelConf.hpScale + Math.pow(wave.value, 1.5) * 25;
      hp = Math.floor(isBossWave ? baseHP * 20 : baseHP);
    }

    let spawned = 0;

    const intervalTime = isBossWave
      ? 1000
      : Math.max(100, 400 - wave.value * 15 - (gameLevel.value - 1) * 40);

    waveInterval = setInterval(() => {
      let type = 'normal';
      if (isBossWave) type = 'boss';
      else {
        const rand = Math.random();
        if (wave.value >= 3 && rand < 0.15) type = 'stealth';
        else if (wave.value >= 2 && rand < 0.1) type = 'medic';
        else if (wave.value >= 5 && rand < 0.2) type = 'tank';
        else if (wave.value >= 4 && rand < 0.25) type = 'scout';
      }
      spawnEnemy(hp, type);
      spawned++;
      if (spawned >= count) {
        clearInterval(waveInterval);
        waveInterval = null;
        isSpawning = false;
      }
    }, intervalTime);
  }

  function spawnEnemy(hp, type = 'normal') {
    const isBoss = type === 'boss';
    let speed = 1.5;
    let emoji = '👾';
    let radius = 10;

    // 基础速度且随关卡增加
    const baseSpeed = 1.5 + wave.value * 0.05;

    if (type === 'boss') {
      speed = 0.8;
      emoji = '👹';
      radius = 16;
    } else if (type === 'scout') {
      speed = baseSpeed * 1.5;
      hp = Math.floor(hp * 0.6);
      emoji = '🛸';
      radius = 8;
    } else if (type === 'tank') {
      speed = baseSpeed * 0.7;
      hp = Math.floor(hp * 1.8);
      emoji = '🛡️';
      radius = 12;
    } else if (type === 'stealth') {
      speed = baseSpeed * 1.1;
      emoji = '👻';
      radius = 9; // 隐身
    } else if (type === 'medic') {
      speed = baseSpeed * 0.9;
      emoji = '🚑';
      radius = 11; // 医疗兵
    } else {
      speed = baseSpeed;
    }

    enemies.push({
      x: waypoints[0].x,
      y: waypoints[0].y,
      waypointIndex: 0,
      hp: hp,
      maxHp: hp,
      speed: speed,
      radius: radius,
      type: type,
      emoji: emoji,
      reward: isBoss ? 500 : type === 'tank' ? 25 : 15 + Math.floor(wave.value),
      frozen: 0,
      slowed: 0, // 新增减速状态
      revealed: false // 隐身可见性
    });
  }

  function update() {
    // 能量回复
    if (mana.value < 100 && isWaveActive.value) mana.value += 0.05;

    if (isWaveActive.value && !isSpawning && enemies.length === 0) {
      // 无尽模式或者剧情模式未结束
      const isEndless = gameMode.value === 'endless';
      const maxW = isEndless ? Infinity : LEVEL_CONFIG[gameLevel.value - 1]?.waves || 10;

      if (wave.value < maxW) {
        isWaveActive.value = false;
        wave.value++;
        money.value += 50 + wave.value * 10;
        ElMessage.success('波次完成！');
      } else {
        // 只有非无尽模式才有通关概念
        isWaveActive.value = false;
        if (gameMode.value !== 'endless') {
          if (gameLevel.value < LEVEL_MAPS.length) {
            gameState.value = 'level_complete';
          } else {
            gameState.value = 'victory';
          }
        }
      }
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];

      let currentSpeed = e.speed;
      if (e.frozen > 0) {
        currentSpeed = 0; // 完全静止
        e.frozen--;
      } else if (e.slowed > 0) {
        currentSpeed = e.speed * 0.5; // 减速50%
        e.slowed--;
      }

      if (e.waypointIndex < waypoints.length - 1) {
        const target = waypoints[e.waypointIndex + 1];
        const dx = target.x - e.x;
        const dy = target.y - e.y;
        const dist = Math.hypot(dx, dy);
        if (dist < currentSpeed) {
          e.x = target.x;
          e.y = target.y;
          e.waypointIndex++;
        } else {
          e.x += (dx / dist) * currentSpeed;
          e.y += (dy / dist) * currentSpeed;
        }
      } else {
        lives.value -= e.type === 'boss' ? 999 : 1;
        enemies.splice(i, 1);
        createParticles(e.x, e.y, '#f56c6c');
        if (lives.value <= 0) {
          gameState.value = 'gameover';
        }
        continue;
      }
    }

    towers.forEach(t => {
      if (t.cooldown > 0) t.cooldown--;
      else {
        if (t.type.effect === 'gold') {
          if (isWaveActive.value) {
            if (t.cooldown > 0) t.cooldown--;
            else {
              const amount = 25 * t.level;
              money.value += amount;
              t.cooldown = 300; // 5秒
              createParticles(t.x, t.y, '#ffd700', 8);
              // 显示+金币浮动文字效果可以通过粒子系统扩展，这里暂时只用粒子和总金额增加
            }
          }
          return;
        }

        const target = findTarget(t);
        if (target) {
          bullets.push({
            x: t.x,
            y: t.y,
            target: target,
            speed: t.type.projectileSpeed,
            damage: getTowerDamage(t),
            color: t.type.color,
            effect: t.type.effect
          });
          t.cooldown = getTowerRate(t);
        }
      }
    });

    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      if (!enemies.includes(b.target)) {
        bullets.splice(i, 1);
        continue;
      }
      const tx = b.target.x,
        ty = b.target.y;
      const dist = Math.hypot(tx - b.x, ty - b.y);
      if (dist < b.speed) {
        b.target.hp -= b.damage;

        if (b.effect === 'slow') {
          // 冰霜塔造成减速而非冻结
          b.target.slowed = Math.max(b.target.slowed, 120); // 减速持续2秒
        } else if (b.effect === 'aoe') {
          // 导弹塔 AOE 效果: 对目标周围 60 像素内的敌人造成 50% 伤害
          enemies.forEach(e => {
            if (e !== b.target && Math.hypot(e.x - tx, e.y - ty) < 60) {
              e.hp -= Math.floor(b.damage * 0.5);
              createParticles(e.x, e.y, b.color, 2);
              // 检查 AOE 炸死的敌人
              if (e.hp <= 0 && enemies.includes(e)) {
                const idx = enemies.indexOf(e);
                if (idx > -1) {
                  enemies.splice(idx, 1);
                  money.value += e.reward;
                }
              }
            }
          });
          createParticles(tx, ty, '#ff6600', 8); // 爆炸特效
        }

        createParticles(tx, ty, b.color, 3);
        if (b.target.hp <= 0) {
          const idx = enemies.indexOf(b.target);
          if (idx > -1) {
            enemies.splice(idx, 1);
            money.value += b.target.reward;
            if (b.target.type === 'boss') {
              createParticles(tx, ty, '#ff0000', 50);
            }
          }
        }
        bullets.splice(i, 1);
      } else {
        const angle = Math.atan2(ty - b.y, tx - b.x);
        b.x += Math.cos(angle) * b.speed;
        b.y += Math.sin(angle) * b.speed;
      }
    }

    // 处理 Buff 塔和雷达
    enemies.forEach(e => (e.revealed = e.type !== 'stealth')); // 重置隐身可见性

    towers.forEach(t => {
      t.damageBuff = 1.0;
      t.rangeBuff = 0;

      // 雷达寻找隐身
      if (t.type.effect === 'radar') {
        enemies.forEach(e => {
          if (e.type === 'stealth' && Math.hypot(e.x - t.x, e.y - t.y) < t.type.range) {
            e.revealed = true;
          }
        });
      }
    });

    // 应用增益
    towers.forEach(t => {
      if (t.type.effect === 'buff') {
        towers.forEach(other => {
          if (other !== t && Math.hypot(other.x - t.x, other.y - t.y) < t.type.range) {
            other.damageBuff = 1.3; // 增加30%伤害
            other.rangeBuff = 20; // 增加20射程
          }
        });
      }
    });

    // 医疗兵治疗
    enemies.forEach(med => {
      if (med.type === 'medic') {
        enemies.forEach(other => {
          if (other !== med && Math.hypot(other.x - med.x, other.y - med.y) < 60) {
            if (other.hp < other.maxHp) other.hp += 0.2; // 每帧回血
          }
        });
      }
    });

    // 随机产生补给箱
    if (isWaveActive.value && Math.random() < 0.002) {
      const randR = Math.floor(Math.random() * ROWS);
      const randC = Math.floor(Math.random() * COLS);
      if (currentMap[randR][randC] === 0) {
        supplyBoxes.value.push({
          x: randC * TILE_SIZE + TILE_SIZE / 2,
          y: randR * TILE_SIZE + TILE_SIZE / 2,
          type: Math.random() > 0.5 ? 'gold' : 'mana',
          life: 600 // 10秒失效
        });
      }
    }
    supplyBoxes.value = supplyBoxes.value.filter(b => {
      b.life--;
      return b.life > 0;
    });

    updateParticles();
  }

  function findTarget(t) {
    const range = t.type.range + (t.rangeBuff || 0);
    let closest = null;
    let minDist = range;
    enemies.forEach(e => {
      if (e.type === 'stealth' && !e.revealed) return; // 看不见隐身
      const dist = Math.hypot(e.x - t.x, e.y - t.y);
      if (dist < minDist) {
        minDist = dist;
        closest = e;
      }
    });
    return closest;
  }

  function getTowerDamage(t) {
    const scale = [1, 1.5, 2.2];
    const base = Math.floor(t.type.baseDamage * scale[t.level - 1]);
    return Math.floor(base * (t.damageBuff || 1.0));
  }

  function getTowerRate(t) {
    const scale = [1, 0.85, 0.75];
    return Math.floor(t.type.baseRate * scale[t.level - 1]);
  }

  function getUpgradeCost(t) {
    return Math.floor(t.type.cost * Math.pow(2.0, t.level));
  }

  function upgradeTower() {
    if (!selectedTowerInstance.value) return;
    const t = selectedTowerInstance.value;
    if (t.level >= 3) return;

    const cost = getUpgradeCost(t);
    if (money.value >= cost) {
      money.value -= cost;
      t.level++;
      t.totalCost += cost;
      createParticles(t.x, t.y, '#ffd700', 10);
      ElMessage.success('升级成功！');
    }
  }

  function sellTower() {
    if (!selectedTowerInstance.value) return;
    const t = selectedTowerInstance.value;
    const refund = Math.floor(t.totalCost * 0.6);

    money.value += refund;
    towers = towers.filter(tower => tower.r !== t.r || tower.c !== t.c);
    createParticles(t.x, t.y, '#999', 5);
    selectedTowerInstance.value = null;
  }

  function selectTowerType(key) {
    if (selectedTowerType.value === key) {
      selectedTowerType.value = null;
    } else {
      selectedTowerType.value = key;
      selectedTowerInstance.value = null;
      selectedObstacle.value = null;
      activeBuildSite.value = null;
    }
  }

  function deselectTower() {
    selectedTowerInstance.value = null;
    selectedObstacle.value = null;
    selectedTowerType.value = null;
    activeBuildSite.value = null;
  }

  function clearObstacleConfirm() {
    if (!selectedObstacle.value) return;
    const { r, c } = selectedObstacle.value;
    if (money.value >= 200) {
      money.value -= 200;
      currentMap[r][c] = 0;
      createParticles(c * TILE_SIZE + TILE_SIZE / 2, r * TILE_SIZE + TILE_SIZE / 2, '#999', 15);
      ElMessage.success('障碍物已清理');
      selectedObstacle.value = null;
    } else {
      ElMessage.warning('金钱不足');
    }
  }

  function buildTowerAtSite(typeKey) {
    if (!activeBuildSite.value) return;
    const { r, c } = activeBuildSite.value;
    const type = TOWER_TYPES[typeKey];

    if (money.value >= type.cost) {
      money.value -= type.cost;
      towers.push({
        r,
        c,
        x: c * TILE_SIZE + TILE_SIZE / 2,
        y: r * TILE_SIZE + TILE_SIZE / 2,
        type,
        level: 1,
        totalCost: type.cost,
        cooldown: 0
      });
      createParticles(c * TILE_SIZE + TILE_SIZE / 2, r * TILE_SIZE + TILE_SIZE / 2, '#fff');
      activeBuildSite.value = null;
    } else {
      ElMessage.warning('金钱不足');
    }
  }

  function handleCanvasClick(e) {
    if (gameState.value !== 'playing') return;
    const rect = canvasRef.value.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 每次点击重置建造菜单
    activeBuildSite.value = null;

    // 检查是否点击补给箱
    for (let i = supplyBoxes.value.length - 1; i >= 0; i--) {
      const b = supplyBoxes.value[i];
      if (Math.hypot(x - b.x, y - b.y) < 20) {
        if (b.type === 'gold') {
          money.value += 150;
          ElMessage.success('获得 150 金币！');
        } else {
          mana.value = Math.min(100, mana.value + 30);
          ElMessage.success('获得 30 能量！');
        }
        createParticles(b.x, b.y, '#ffd700', 15);
        supplyBoxes.value.splice(i, 1);
        return;
      }
    }

    // 优先处理技能释放
    if (selectedSkill.value === 'meteor') {
      castMeteor(x, y);
      return;
    }

    const c = Math.floor(x / TILE_SIZE);
    const r = Math.floor(y / TILE_SIZE);

    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;

    // 如果点击了防御塔，选中它
    const clickedTower = towers.find(t => t.r === r && t.c === c);
    if (clickedTower) {
      selectedTowerInstance.value = clickedTower;
      selectedObstacle.value = null;
      selectedTowerType.value = null;
      return;
    }

    // 如果点击了障碍物，选中它
    if (currentMap[r][c] === 4 || currentMap[r][c] === 5) {
      selectedTowerInstance.value = null;
      selectedObstacle.value = { r, c, type: currentMap[r][c] };
      selectedTowerType.value = null;
      return;
    }

    // 处理建造逻辑
    if (currentMap[r][c] === 0) {
      selectedTowerInstance.value = null;
      selectedObstacle.value = null;

      if (selectedTowerType.value) {
        // 逻辑 A：如果已经预选了塔类型，则直接建造（支持连续点击放置）
        const type = TOWER_TYPES[selectedTowerType.value];
        if (money.value >= type.cost) {
          money.value -= type.cost;
          towers.push({
            r,
            c,
            x: c * TILE_SIZE + TILE_SIZE / 2,
            y: r * TILE_SIZE + TILE_SIZE / 2,
            type,
            level: 1,
            totalCost: type.cost,
            cooldown: 0
          });
          createParticles(x, y, '#fff');
          // 注意：这里不再将 selectedTowerType 设为 null，以实现连点放置
        } else {
          ElMessage.warning('金钱不足');
        }
      } else {
        // 逻辑 B：如果没有预选任何塔，则弹出悬浮建造菜单
        activeBuildSite.value = {
          r,
          c,
          px: c * TILE_SIZE + TILE_SIZE / 2 + 10,
          py: r * TILE_SIZE + 10
        };
      }
    }
  }

  function handleCanvasMove(e) {
    const rect = canvasRef.value.getBoundingClientRect();
    mousePos.value = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    isMouseInCanvas.value = true;
  }

  function handleCanvasLeave() {
    isMouseInCanvas.value = false;
  }

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const val = currentMap[r][c];
        const x = c * TILE_SIZE,
          y = r * TILE_SIZE;
        if (val === 1) {
          ctx.fillStyle = '#f0f2f5';
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        } else if (val === 2) {
          ctx.fillStyle = '#ffcccc';
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = 'red';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'alphabetic';
          ctx.font = '20px Arial';
          ctx.fillText('🏠', x + TILE_SIZE / 2, y + 28);
          // 在城堡上方显示生命值
          ctx.font = 'bold 12px Arial';
          ctx.fillStyle = '#f56c6c';
          ctx.fillText(`HP: ${lives.value}`, x + TILE_SIZE / 2, y - 5);
        } else if (val === 3) {
          ctx.fillStyle = '#ddd';
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          ctx.textAlign = 'start';
          ctx.textBaseline = 'alphabetic';
          ctx.font = '20px Arial';
          ctx.fillText('💀', x + 5, y + 28);
        } else if (val === 4) {
          ctx.fillStyle = '#f5f7fa';
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          ctx.font = '24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('🪨', x + TILE_SIZE / 2, y + 30);
        } else if (val === 5) {
          ctx.fillStyle = '#f5f7fa';
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          ctx.font = '24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('🌳', x + TILE_SIZE / 2, y + 30);
        } else {
          ctx.strokeStyle = '#f9f9f9';
          ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
        }
      }
    }

    // 渲染补给箱
    supplyBoxes.value.forEach(b => {
      ctx.fillStyle = b.type === 'gold' ? '#e6a23c' : '#409eff';
      ctx.beginPath();
      ctx.roundRect(b.x - 12, b.y - 12, 24, 24, 4);
      ctx.fill();
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'white';
      ctx.fillText(b.type === 'gold' ? '💰' : '🧪', b.x, b.y + 5);

      // 生命周期条
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(b.x - 12, b.y + 15, 24, 3);
      ctx.fillStyle = '#67c23a';
      ctx.fillRect(b.x - 12, b.y + 15, 24 * (b.life / 600), 3);
    });

    towers.forEach(t => {
      ctx.fillStyle = '#f5f7fa';
      ctx.fillRect(t.c * TILE_SIZE + 2, t.r * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);

      ctx.strokeStyle = t.type.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(t.c * TILE_SIZE + 2, t.r * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);

      if (t.level > 1) {
        ctx.font = '10px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⭐'.repeat(t.level - 1), t.x, t.y - 16);
      }

      // 增益/雷达塔绘制常驻范围提示（浅色）
      if (t.type.effect === 'buff' || t.type.effect === 'radar') {
        ctx.strokeStyle = t.type.color + '33'; // 反透明度
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.type.range, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.font = '22px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t.type.emoji, t.x, t.y);

      if (t === selectedTowerInstance.value) {
        ctx.strokeStyle = '#409eff';
        ctx.lineWidth = 3;
        ctx.strokeRect(t.c * TILE_SIZE, t.r * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        ctx.fillStyle = 'rgba(64,158,255,0.1)';
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.type.range, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(64,158,255,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    enemies.forEach(e => {
      const size = e.type === 'boss' ? 32 : 20;

      ctx.save();
      // 隐身效果
      if (e.type === 'stealth' && !e.revealed) {
        ctx.globalAlpha = 0.2;
      }

      // 医疗兵光环
      if (e.type === 'medic') {
        ctx.strokeStyle = 'rgba(103, 194, 58, 0.4)';
        ctx.setLineDash([5, 2]);
        ctx.beginPath();
        ctx.arc(e.x, e.y, 60, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.font = `${size}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(e.emoji, e.x, e.y);
      ctx.restore();

      if (e.frozen > 0) {
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(e.x, e.y, size / 2 + 2, 0, Math.PI * 2);
        ctx.stroke();
      } else if (e.slowed > 0) {
        // 减速状态显示淡蓝色光环
        ctx.strokeStyle = 'rgba(64, 158, 255, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 5]);
        ctx.beginPath();
        ctx.arc(e.x, e.y, size / 2 + 1, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      const barW = e.type === 'boss' ? 40 : 20;
      ctx.fillStyle = 'red';
      ctx.fillRect(e.x - barW / 2, e.y - size / 2 - 8, barW, 4);
      ctx.fillStyle = '#0f0';
      ctx.fillRect(e.x - barW / 2, e.y - size / 2 - 8, barW * (e.hp / e.maxHp), 4);
    });

    bullets.forEach(b => {
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    particles.forEach(p => {
      ctx.globalAlpha = p.life / 20;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 3, 3);
      ctx.globalAlpha = 1.0;
    });

    // 预览技能范围
    if (selectedSkill.value === 'meteor' && isMouseInCanvas.value) {
      ctx.fillStyle = 'rgba(255, 68, 0, 0.2)';
      ctx.beginPath();
      ctx.arc(mousePos.value.x, mousePos.value.y, 80, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ff4400';
      ctx.stroke();
      return; // 技能模式下不显示防御塔预览
    }

    if (
      !selectedTowerInstance.value &&
      selectedTowerType.value &&
      gameState.value === 'playing' &&
      isMouseInCanvas.value
    ) {
      const c = Math.floor(mousePos.value.x / TILE_SIZE);
      const r = Math.floor(mousePos.value.y / TILE_SIZE);
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS && currentMap[r] && currentMap[r][c] === 0) {
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 2;
        ctx.strokeRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        const type = TOWER_TYPES[selectedTowerType.value];
        if (type) {
          ctx.fillStyle = 'rgba(100,100,100,0.1)';
          ctx.beginPath();
          ctx.arc(
            c * TILE_SIZE + TILE_SIZE / 2,
            r * TILE_SIZE + TILE_SIZE / 2,
            type.range,
            0,
            Math.PI * 2
          );
          ctx.fill();

          ctx.save();
          ctx.globalAlpha = 0.7;
          ctx.fillStyle = '#000';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = '24px Arial';
          ctx.fillText(
            type.emoji,
            c * TILE_SIZE + TILE_SIZE / 2,
            r * TILE_SIZE + TILE_SIZE / 2 + 2
          );
          ctx.restore();
        }
      }
    }
  }

  function selectSkill(skill) {
    if (!isWaveActive.value) {
      ElMessage.warning('只有在波次开始后才能使用技能');
      return;
    }
    if (skill === 'freeze') {
      castFreeze();
      return;
    }
    if (selectedSkill.value === skill) {
      selectedSkill.value = null;
    } else {
      selectedSkill.value = skill;
    }
  }

  function castMeteor(x, y) {
    if (mana.value < 40) {
      ElMessage.warning('能量不足');
      return;
    }
    mana.value -= 40;
    selectedSkill.value = null;

    // 陨石视觉粒子
    createParticles(x, y, '#ff4400', 30);

    // 范围内敌人伤害
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      const dist = Math.hypot(e.x - x, e.y - y);
      if (dist <= 80) {
        e.hp -= 150;
        if (e.hp <= 0) {
          money.value += e.reward;
          enemies.splice(i, 1);
        }
      }
    }
    ElMessage.success('陨石冲击！');
  }

  function castFreeze() {
    if (mana.value < 60) {
      ElMessage.warning('能量不足');
      return;
    }
    mana.value -= 60;
    enemies.forEach(e => {
      e.frozen = Math.max(e.frozen, 240); // 冻结 4 秒
    });
    ElMessage.success('时间静止！(全场冻结)');
  }

  function gameLoop() {
    if (gameState.value !== 'playing') return;

    // 根据倍速运行更新
    for (let i = 0; i < gameSpeed.value; i++) {
      update();
    }

    draw();
    animationId = requestAnimationFrame(gameLoop);
  }

  function createParticles(x, y, color, count = 5) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 20,
        color
      });
    }
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life--;
      p.x += p.vx;
      p.y += p.vy;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  onMounted(() => {
    if (canvasRef.value) {
      canvasRef.value.width = WIDTH;
      canvasRef.value.height = HEIGHT;
      ctx = canvasRef.value.getContext('2d');
    }
  });

  onUnmounted(() => {
    cancelAnimationFrame(animationId);
    clearInterval(waveInterval);
  });
</script>

<style scoped>
  .td-tool {
    --bg: #f5f7fa;
    --card: #ffffff;
    --primary: #409eff;
    --text: #2c3e50;

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
    color: #7f8c8d;
    cursor: pointer;
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
    color: #7f8c8d;
    display: block;
  }

  .nav-spacer {
    width: 60px;
  }

  .main-content {
    flex: 1;
    display: flex;
    justify-content: center;
    padding: 1.5rem;
    gap: 1.5rem;
  }

  .game-layout {
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
  }

  .game-board-container {
    position: relative;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  canvas {
    background: #fcfcfc;
    border: 1px solid #eee;
    cursor: crosshair;
    display: block;
  }

  .controls-panel {
    width: 600px;
    flex-shrink: 0;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }

  .control-main-grid {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 1rem;
    align-items: flex-start;
  }

  .panel-section-left,
  .panel-section-right {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /* 模块化卡片样式 */
  .panel-card {
    background: #fff;
    border-radius: 12px;
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.05),
      0 2px 4px -1px rgba(0, 0, 0, 0.03);
    padding: 0.6rem;
    border: 1px solid rgba(0, 0, 0, 0.02);
    transition: all 0.3s ease;
  }

  .panel-card:hover {
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.05),
      0 4px 6px -2px rgba(0, 0, 0, 0.025);
  }

  .panel-card h3 {
    font-size: 0.95rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: var(--text);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  /* 状态栏增强 */
  .stats-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }

  .stat-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #f8fafc;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    border: 1px solid #f1f5f9;
  }

  .stat-item .label {
    font-size: 0.8rem;
    color: #64748b;
    font-weight: 500;
  }

  .stat-item .value {
    font-size: 1.1rem;
    font-weight: 700;
    color: #334155;
  }

  .stat-item .value.heart {
    color: #ef4444;
  }

  .stat-item .value.money {
    color: #eab308;
  }

  .stat-item .value.mana {
    color: #3b82f6;
  }

  /* 技能与操作 */
  .skills-panel {
    margin-bottom: 1.5rem;
  }

  .skill-btns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.8rem;
  }

  .skill-btn {
    height: 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }

  .skill-btn:hover:not(.disabled) {
    border-color: var(--primary);
    background: #eff6ff;
    transform: translateY(-2px);
  }

  .skill-btn.active {
    border-color: #f97316;
    background: #fff7ed;
    box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.2);
  }

  .skill-btn.disabled {
    opacity: 0.5;
    background: #f1f5f9;
    cursor: not-allowed;
  }

  .skill-btn .icon {
    font-size: 1.8rem;
    margin-bottom: 2px;
  }

  .skill-btn .cost {
    font-size: 0.7rem;
    font-weight: bold;
    color: #f97316;
    background: rgba(255, 255, 255, 0.8);
    padding: 1px 6px;
    border-radius: 10px;
  }

  .game-actions {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .wave-btn {
    width: 100%;
    padding: 0.8rem;
    border: none;
    border-radius: 10px;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    font-weight: bold;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
    transition: all 0.2s;
  }

  .wave-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 10px -1px rgba(37, 99, 235, 0.4);
  }

  .wave-btn:disabled {
    background: #cbd5e1;
    box-shadow: none;
    cursor: not-allowed;
  }

  .sub-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.8rem;
  }

  .restart-btn,
  .menu-btn {
    padding: 0.6rem;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.2s;
    background: #fff;
    border: 1px solid #e2e8f0;
    color: #64748b;
  }

  .restart-btn:hover,
  .menu-btn:hover {
    border-color: #cbd5e1;
    background: #f8fafc;
    color: #334155;
    transform: translateY(-1px);
  }

  /* 防御塔选择区优化 */
  .tower-options {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.8rem;
  }

  .tower-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 10px 4px;
    border: 2px solid transparent;
    border-radius: 10px;
    background: #f8fafc;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }

  .tower-card:hover {
    background: #f1f5f9;
    transform: translateY(-3px);
  }

  .tower-card.active {
    border-color: var(--primary);
    background: #eff6ff;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  }

  .tower-card.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    filter: grayscale(1);
    transform: none;
  }

  .tower-icon-wrapper {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    font-size: 26px;
  }

  .tower-info .name {
    font-weight: 600;
    font-size: 0.75rem;
    color: #334155;
    margin-top: 4px;
  }

  .tower-info .cost {
    font-size: 0.7rem;
    color: #d97706;
    font-weight: bold;
  }

  .selected-type-info {
    margin-top: 1rem;
    padding: 0.8rem;
    background: #eff6ff;
    border-radius: 8px;
    border-left: 4px solid var(--primary);
    color: #1e293b;
    font-size: 0.85rem;
    line-height: 1.5;
  }

  /* 升级面板优化 */
  .upgrade-panel {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }

  .selected-tower-preview {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
  }

  .preview-emoji {
    font-size: 2.5rem;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
  }

  .upgrade-actions {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .upgrade-btn,
  .sell-btn,
  .cancel-btn {
    padding: 0.9rem;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-weight: 600;
    transition: all 0.2s;
    font-size: 0.9rem;
  }

  .upgrade-btn {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    color: white;
    flex-direction: column;
    gap: 4px;
    box-shadow: 0 4px 6px -1px rgba(22, 163, 74, 0.3);
  }

  .upgrade-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 10px -1px rgba(22, 163, 74, 0.4);
  }

  .upgrade-btn:disabled {
    background: #cbd5e1;
    box-shadow: none;
    cursor: not-allowed;
  }

  .upgrade-btn.max-level {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    cursor: default;
    box-shadow: none;
  }

  .upgrade-desc {
    font-size: 0.7rem;
    opacity: 0.9;
    font-weight: normal;
  }

  .sell-btn {
    background: #fee2e2;
    color: #ef4444;
    border: 1px solid #fecaca;
  }

  .sell-btn:hover {
    background: #fecaca;
  }

  .cancel-btn {
    background: transparent;
    border: 1px solid #cbd5e1;
    color: #64748b;
  }

  .cancel-btn:hover {
    background: #f1f5f9;
    color: #334155;
  }

  .footer {
    text-align: center;
    padding: 1rem 0;
    color: #94a3b8;
    font-size: 0.8rem;
    border-top: 1px solid #e2e8f0;
    background: #fff;
    margin-top: 2rem;
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
    border-radius: 8px;
  }

  .overlay-content {
    text-align: center;
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    width: 80%;
    max-width: 400px;
  }

  .overlay-btns {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    width: 100%;
    margin-top: 2rem;
  }

  .start-btn {
    min-width: 150px;
    padding: 12px 40px;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    border: none;
    border-radius: 25px;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: bold;
    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
  }

  .start-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 10px -1px rgba(37, 99, 235, 0.4);
  }

  /* 关卡网格样式 */
  .level-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 10px;
    width: 100%;
  }

  .level-btn {
    padding: 10px;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    color: #2563eb;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: bold;
  }

  .level-btn:hover {
    background: #2563eb;
    color: white;
  }

  /* 导航栏右侧 */
  .nav-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .speed-toggle {
    display: flex;
    background: #f0f2f5;
    padding: 3px;
    border-radius: 20px;
    border: 1px solid #dcdfe6;
  }

  .speed-btn {
    padding: 2px 12px;
    border: none;
    background: transparent;
    border-radius: 15px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
    color: #64748b;
  }

  .speed-btn.active {
    background: #3b82f6;
    color: white;
    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
  }

  /* 悬浮建造菜单 */
  .build-menu {
    position: absolute;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    padding: 12px;
    z-index: 1000;
    width: 280px;
    transform: translate(-50%, var(--menu-dir)) translateY(var(--menu-offset));
    animation: popIn 0.2s ease-out;
  }

  @keyframes popIn {
    from {
      opacity: 0;
      transform: translate(-50%, var(--menu-dir)) translateY(var(--menu-offset)) scale(0.8);
    }

    to {
      opacity: 1;
      transform: translate(-50%, var(--menu-dir)) translateY(var(--menu-offset)) scale(1);
    }
  }

  .build-menu-title {
    font-size: 0.85rem;
    font-weight: bold;
    color: #333;
    margin-bottom: 10px;
    text-align: center;
  }

  .build-options {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .build-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 6px;
    border-radius: 8px;
    background: #f8fafc;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid transparent;
  }

  .build-option:hover:not(.disabled) {
    background: #eff6ff;
    border-color: #3b82f6;
    transform: translateY(-2px);
  }

  .build-option.disabled {
    opacity: 0.5;
    filter: grayscale(1);
    cursor: not-allowed;
  }

  .build-option .emoji {
    font-size: 20px;
  }

  .build-option .name {
    font-size: 0.65rem;
    color: #64748b;
  }

  .build-option .cost {
    font-size: 0.7rem;
    font-weight: bold;
    color: #d97706;
  }

  .build-menu-close {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 24px;
    height: 24px;
    background: #ef4444;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  }
</style>
