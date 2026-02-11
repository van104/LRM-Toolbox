<template>
  <div class="td-tool">
    <GameHeader
      :game-mode="gameMode"
      :game-level="gameLevel"
      :game-speed="gameSpeed"
      @back="$router.back()"
      @set-speed="s => (gameSpeed = s)"
    />

    <main class="main-content">
      <div class="game-layout">
        <div ref="containerRef" class="game-board-container">
          <canvas
            ref="canvasRef"
            @click="handleCanvasClick"
            @mousemove="handleCanvasMove"
            @mouseleave="handleCanvasLeave"
          ></canvas>

          <GameOverlay
            :game-state="gameState"
            :game-level="gameLevel"
            :game-mode="gameMode"
            :wave="wave"
            @start-game="startGame"
            @mode-select="gameState = 'mode_select'"
            @start-freedom="startFreedomLevel"
            @back-to-start="gameState = 'start'"
            @next-level="startNextLevel"
          />

          <BuildMenu
            v-if="activeBuildSite"
            :active-build-site="activeBuildSite"
            :money="money"
            @build="buildTowerAtSite"
            @close="activeBuildSite = null"
          />
        </div>

        <ControlPanel
          :money="money"
          :lives="lives"
          :wave="wave"
          :mana="mana"
          :selected-skill="selectedSkill"
          :is-wave-active="isWaveActive"
          :game-state="gameState"
          :selected-tower-type="selectedTowerType"
          :selected-tower-instance="selectedTowerInstance"
          :selected-obstacle="selectedObstacle"
          :game-level="gameLevel"
          :game-mode="gameMode"
          :level-config="LEVEL_CONFIG[gameLevel - 1] || LEVEL_CONFIG[0]"
          @select-skill="selectSkill"
          @spawn-wave="spawnNextWave"
          @restart="restartGame"
          @menu="gameState = 'start'"
          @select-tower-type="selectTowerType"
          @clear-obstacle="clearObstacleConfirm"
          @deselect="deselectTower"
          @upgrade-tower="upgradeTower"
          @sell-tower="sellTower"
        />
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 塔防小游戏</footer>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { ElMessage } from 'element-plus';
  import {
    TILE_SIZE,
    COLS,
    ROWS,
    WIDTH,
    HEIGHT,
    TOWER_TYPES,
    LEVEL_MAPS,
    LEVEL_CONFIG
  } from './tower_defense/constants';

  import GameHeader from './tower_defense/GameHeader.vue';
  import GameOverlay from './tower_defense/GameOverlay.vue';
  import BuildMenu from './tower_defense/BuildMenu.vue';
  import ControlPanel from './tower_defense/ControlPanel.vue';

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

      if (currentMap[r][c] === 0) {
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

    towers.forEach(t => {
      if (t.type.effect === 'gold') {
        const amount = 80 + t.level * 40;
        money.value += amount;
        createParticles(t.x, t.y, '#ffd700', 15);
      }
    });

    isWaveActive.value = true;
    isSpawning = true;

    let count, hp, isBossWave;

    if (gameMode.value === 'endless') {
      isBossWave = wave.value % 5 === 0;
      const baseCount = 10 + Math.floor(wave.value * 0.5);
      count = isBossWave ? 1 : Math.min(50, baseCount);

      const baseHP = 40 * Math.pow(1.15, wave.value);
      hp = Math.floor(isBossWave ? baseHP * 15 : baseHP);
    } else {
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
      radius = 9;
    } else if (type === 'medic') {
      speed = baseSpeed * 0.9;
      emoji = '🚑';
      radius = 11;
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
      slowed: 0,
      revealed: false
    });
  }

  function update() {
    if (mana.value < 100 && isWaveActive.value) mana.value += 0.05;

    if (isWaveActive.value && !isSpawning && enemies.length === 0) {
      const isEndless = gameMode.value === 'endless';
      const maxW = isEndless ? Infinity : LEVEL_CONFIG[gameLevel.value - 1]?.waves || 10;

      if (wave.value < maxW) {
        isWaveActive.value = false;
        wave.value++;
        money.value += 50 + wave.value * 10;
        ElMessage.success('波次完成！');
      } else {
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
        currentSpeed = 0;
        e.frozen--;
      } else if (e.slowed > 0) {
        currentSpeed = e.speed * 0.5;
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
              t.cooldown = 300;
              createParticles(t.x, t.y, '#ffd700', 8);
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
          b.target.slowed = Math.max(b.target.slowed, 120);
        } else if (b.effect === 'aoe') {
          enemies.forEach(e => {
            if (e !== b.target && Math.hypot(e.x - tx, e.y - ty) < 60) {
              e.hp -= Math.floor(b.damage * 0.5);
              createParticles(e.x, e.y, b.color, 2);
              if (e.hp <= 0 && enemies.includes(e)) {
                const idx = enemies.indexOf(e);
                if (idx > -1) {
                  enemies.splice(idx, 1);
                  money.value += e.reward;
                }
              }
            }
          });
          createParticles(tx, ty, '#ff6600', 8);
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

    enemies.forEach(e => (e.revealed = e.type !== 'stealth'));

    towers.forEach(t => {
      t.damageBuff = 1.0;
      t.rangeBuff = 0;
      if (t.type.effect === 'radar') {
        enemies.forEach(e => {
          if (e.type === 'stealth' && Math.hypot(e.x - t.x, e.y - t.y) < t.type.range) {
            e.revealed = true;
          }
        });
      }
    });

    towers.forEach(t => {
      if (t.type.effect === 'buff') {
        towers.forEach(other => {
          if (other !== t && Math.hypot(other.x - t.x, other.y - t.y) < t.type.range) {
            other.damageBuff = 1.3;
            other.rangeBuff = 20;
          }
        });
      }
    });

    enemies.forEach(med => {
      if (med.type === 'medic') {
        enemies.forEach(other => {
          if (other !== med && Math.hypot(other.x - med.x, other.y - med.y) < 60) {
            if (other.hp < other.maxHp) other.hp += 0.2;
          }
        });
      }
    });

    if (isWaveActive.value && Math.random() < 0.002) {
      const randR = Math.floor(Math.random() * ROWS);
      const randC = Math.floor(Math.random() * COLS);
      if (currentMap[randR][randC] === 0) {
        supplyBoxes.value.push({
          x: randC * TILE_SIZE + TILE_SIZE / 2,
          y: randR * TILE_SIZE + TILE_SIZE / 2,
          type: Math.random() > 0.5 ? 'gold' : 'mana',
          life: 600
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
      if (e.type === 'stealth' && !e.revealed) return;
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

    activeBuildSite.value = null;

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

    if (selectedSkill.value === 'meteor') {
      castMeteor(x, y);
      return;
    }

    const c = Math.floor(x / TILE_SIZE);
    const r = Math.floor(y / TILE_SIZE);

    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;

    const clickedTower = towers.find(t => t.r === r && t.c === c);
    if (clickedTower) {
      selectedTowerInstance.value = clickedTower;
      selectedObstacle.value = null;
      selectedTowerType.value = null;
      return;
    }

    if (currentMap[r][c] === 4 || currentMap[r][c] === 5) {
      selectedTowerInstance.value = null;
      selectedObstacle.value = { r, c, type: currentMap[r][c] };
      selectedTowerType.value = null;
      return;
    }

    if (currentMap[r][c] === 0) {
      selectedTowerInstance.value = null;
      selectedObstacle.value = null;

      if (selectedTowerType.value) {
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
        } else {
          ElMessage.warning('金钱不足');
        }
      } else {
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

    supplyBoxes.value.forEach(b => {
      ctx.fillStyle = b.type === 'gold' ? '#e6a23c' : '#409eff';
      ctx.beginPath();
      ctx.roundRect(b.x - 12, b.y - 12, 24, 24, 4);
      ctx.fill();
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'white';
      ctx.fillText(b.type === 'gold' ? '💰' : '🧪', b.x, b.y + 5);

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

      if (t.type.effect === 'buff' || t.type.effect === 'radar') {
        ctx.strokeStyle = t.type.color + '33';
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
      if (e.type === 'stealth' && !e.revealed) {
        ctx.globalAlpha = 0.2;
      }

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

    if (selectedSkill.value === 'meteor' && isMouseInCanvas.value) {
      ctx.fillStyle = 'rgba(255, 68, 0, 0.2)';
      ctx.beginPath();
      ctx.arc(mousePos.value.x, mousePos.value.y, 80, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ff4400';
      ctx.stroke();
      return;
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

    createParticles(x, y, '#ff4400', 30);

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
      e.frozen = Math.max(e.frozen, 240);
    });
    ElMessage.success('时间静止！(全场冻结)');
  }

  function gameLoop() {
    if (gameState.value !== 'playing') return;

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

  .main-content {
    flex: 1;
    display: flex;
    justify-content: center;
    padding: 1.5rem;
    overflow: hidden;
  }

  .game-layout {
    display: flex;
    gap: 1.5rem;
    max-width: 1400px;
    width: 100%;
    height: 100%;
  }

  .game-board-container {
    position: relative;
    background: #e6e8eb;
    border-radius: 12px;
    box-shadow:
      0 10px 30px rgba(0, 0, 0, 0.1),
      inset 0 0 20px rgba(0, 0, 0, 0.05);
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  canvas {
    background: white;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    cursor: crosshair;
  }

  .footer {
    text-align: center;
    padding: 1rem;
    color: var(--text-tertiary);
    font-size: 0.8rem;
    border-top: 1px solid var(--border-color);
  }

  @media (max-width: 1024px) {
    .game-layout {
      flex-direction: column;
      align-items: center;
    }
  }
</style>
