<template>
  <div class="hanoi-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>汉诺塔</h1>
        <span class="nav-subtitle">Tower of Hanoi</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="game-container">
        <div class="control-panel glass-card">
          <div class="stats-group">
            <div class="stat-item">
              <span class="label">步数 / 最少</span>
              <span class="value">{{ moves }} / {{ minMoves }}</span>
            </div>
            <div class="stat-item">
              <span class="label">时间</span>
              <span class="value">{{ formattedTime }}</span>
            </div>
          </div>

          <div class="settings-group">
            <label>层数: {{ diskCount }}</label>
            <el-slider
              v-model="diskCount"
              :min="3"
              :max="8"
              size="small"
              class="disk-slider"
              @change="initGame"
            />
          </div>

          <button class="restart-btn" title="重置" @click="initGame">
            <el-icon>
              <RefreshRight />
            </el-icon>
          </button>
        </div>

        <div class="hanoi-board glass-card">
          <div
            v-for="(tower, index) in towers"
            :key="index"
            class="tower-area"
            :class="{ selected: selectedTower === index, targetable: isTargetable(index) }"
            @click="handleTowerClick(index)"
          >
            <div class="pole"></div>
            <div class="disks-container">
              <transition-group name="disk-move">
                <div
                  v-for="disk in tower"
                  :key="disk"
                  class="disk"
                  :class="{
                    'is-selected': selectedTower === index && disk === tower[tower.length - 1]
                  }"
                  :style="getDiskStyle(disk)"
                >
                  <span v-if="diskCount <= 5">{{ disk }}</span>
                </div>
              </transition-group>
            </div>
            <div class="base-label">{{ String.fromCharCode(65 + index) }}</div>
          </div>
          <div class="floor"></div>
        </div>

        <div class="rules-hint">
          <p>
            <el-icon>
              <InfoFilled />
            </el-icon>
            规则：将所有圆盘从A柱移动到C柱，且每次只能移动一个圆盘，大圆盘不能压在小圆盘上。
          </p>
        </div>
      </div>
    </main>

    <el-dialog
      v-model="showVictory"
      title="挑战成功！"
      width="350px"
      center
      custom-class="game-dialog"
    >
      <div class="victory-content">
        <div class="victory-icon">🏆</div>
        <p>圆盘数量：{{ diskCount }} 层</p>
        <p>完成步数：{{ moves }} (最少 {{ minMoves }})</p>
        <p>耗时：{{ formattedTime }}</p>
        <div class="rating">
          <span v-if="moves === minMoves">完美解法！🌟</span>
          <span v-else>继续加油！</span>
        </div>
      </div>
      <template #footer>
        <button class="dialog-btn" @click="initGame">再玩一局</button>
      </template>
    </el-dialog>

    <footer class="footer">© 2026 LRM工具箱 - 汉诺塔</footer>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { Back, RefreshRight, InfoFilled } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';

  const diskCount = ref(4);
  const towers = ref([[], [], []]);
  const selectedTower = ref(null);
  const moves = ref(0);
  const startTime = ref(0);
  const elapsedTime = ref(0);
  const showVictory = ref(false);
  let timerInterval = null;

  const minMoves = computed(() => Math.pow(2, diskCount.value) - 1);

  const formattedTime = computed(() => {
    const t = Math.floor(elapsedTime.value / 1000);
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  });

  const getDiskStyle = size => {
    const minWidth = 40;
    const step = (140 - minWidth) / diskCount.value;
    const width = minWidth + (size - 1) * step;

    const hue = 200 + size * 25;
    return {
      width: `${width}px`,
      backgroundColor: `hsl(${hue}, 70%, 65%)`
    };
  };

  const initGame = () => {
    stopTimer();
    elapsedTime.value = 0;
    startTime.value = 0;
    moves.value = 0;
    selectedTower.value = null;
    showVictory.value = false;

    const newTowers = [[], [], []];
    for (let i = diskCount.value; i >= 1; i--) {
      newTowers[0].push(i);
    }
    towers.value = newTowers;
  };

  const handleTowerClick = index => {
    if (showVictory.value) return;

    if (moves.value === 0 && selectedTower.value === null && startTime.value === 0) {
      startTimer();
    }

    if (selectedTower.value === null) {
      if (towers.value[index].length === 0) return;
      selectedTower.value = index;
    } else if (selectedTower.value === index) {
      selectedTower.value = null;
    } else {
      attemptMove(selectedTower.value, index);
    }
  };

  const attemptMove = (from, to) => {
    const sourceTower = towers.value[from];
    const targetTower = towers.value[to];

    const diskToMove = sourceTower[sourceTower.length - 1];
    const topTargetDisk = targetTower.length > 0 ? targetTower[targetTower.length - 1] : Infinity;

    if (diskToMove < topTargetDisk) {
      sourceTower.pop();
      targetTower.push(diskToMove);
      moves.value++;
      selectedTower.value = null;
      checkWin();
    } else {
      ElMessage.warning('大的圆盘不能放在小的圆盘上面');
      selectedTower.value = null;
    }
  };

  const isTargetable = index => {
    if (selectedTower.value === null || selectedTower.value === index) return false;

    const sourceTower = towers.value[selectedTower.value];
    if (!sourceTower || sourceTower.length === 0) return false;

    const diskToMove = sourceTower[sourceTower.length - 1];
    const targetTower = towers.value[index];
    const topTargetDisk = targetTower.length > 0 ? targetTower[targetTower.length - 1] : Infinity;

    return diskToMove < topTargetDisk;
  };

  const checkWin = () => {
    if (towers.value[2].length === diskCount.value || towers.value[1].length === diskCount.value) {
      stopTimer();
      setTimeout(() => {
        showVictory.value = true;
      }, 300);
    }
  };

  const startTimer = () => {
    startTime.value = Date.now();
    timerInterval = setInterval(() => {
      elapsedTime.value = Date.now() - startTime.value;
    }, 1000);
  };

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  };

  onMounted(() => {
    initGame();
  });

  onUnmounted(() => {
    stopTimer();
  });
</script>

<style scoped>
  .hanoi-tool {
    --bg: #f5f7fa;
    --card: #ffffff;
    --primary: #409eff;
    --text: #2c3e50;
    --text-sec: #7f8c8d;

    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    min-height: 100vh;
    background: var(--bg);
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
    color: var(--text-sec);
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
    color: var(--text-sec);
    text-transform: uppercase;
    display: block;
    margin-top: 1px;
  }

  .main-content {
    display: flex;
    justify-content: center;
    padding: 1.5rem 1rem;
    flex: 1;
  }

  .game-container {
    width: 100%;
    max-width: 700px;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .control-panel {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: var(--card);
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .stats-group {
    display: flex;
    gap: 1.5rem;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
  }

  .stat-item .label {
    font-size: 0.75rem;
    color: var(--text-sec);
  }

  .stat-item .value {
    font-size: 1.1rem;
    font-weight: bold;
    color: var(--text);
  }

  .settings-group {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.9rem;
    color: var(--text);
  }

  .disk-slider {
    width: 100px;
  }

  .restart-btn {
    border: none;
    background: #f0f2f5;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text-sec);
    transition: all 0.2s;
  }

  .restart-btn:hover {
    background: #e0e6ed;
    color: var(--primary);
  }

  .hanoi-board {
    background: var(--card);
    border-radius: 16px;
    padding: 2rem 1rem 0 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    height: 320px;
    position: relative;
    padding-bottom: 20px;
    user-select: none;
  }

  .floor {
    position: absolute;
    bottom: 25px;

    left: 20px;
    right: 20px;
    height: 8px;
    background: #e0e0e0;
    border-radius: 4px;
    z-index: 0;
  }

  .tower-area {
    position: relative;
    width: 160px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    cursor: pointer;
    z-index: 1;
    transition: background 0.2s;
    border-radius: 8px 8px 0 0;
  }

  .tower-area:hover {
    background: rgba(0, 0, 0, 0.02);
  }

  .tower-area.targetable:hover {
    background: rgba(64, 158, 255, 0.1);
  }

  .pole {
    position: absolute;
    bottom: 25px;
    width: 12px;
    height: 220px;
    background: #dcdfe6;
    border-radius: 6px 6px 0 0;
    z-index: 0;
  }

  .base-label {
    margin-top: 10px;
    font-weight: bold;
    color: var(--text-sec);
    font-size: 1.1rem;
    height: 25px;
    display: flex;
    align-items: center;
  }

  .disks-container {
    position: absolute;
    bottom: 33px;

    left: 0;
    width: 100%;

    display: flex;
    flex-direction: column-reverse;
    align-items: center;

    height: 240px;
    z-index: 2;
    pointer-events: none;
  }

  .disk {
    height: 24px;
    border-radius: 12px;
    margin-bottom: 2px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.8);
    font-weight: bold;
    user-select: none;
  }

  .disk.is-selected {
    transform: translateY(-20px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    filter: brightness(1.1);
  }

  .disk-move-move,
  .disk-move-enter-active,
  .disk-move-leave-active {
    transition: all 0.3s ease;
  }

  .disk-move-enter-from,
  .disk-move-leave-to {
    opacity: 0;
    transform: translateY(-30px);
  }

  .disk-move-leave-active {
    position: absolute;

    display: none;
  }

  .rules-hint {
    text-align: center;
    color: var(--text-sec);
    font-size: 0.9rem;
    display: flex;
    justify-content: center;
  }

  .rules-hint p {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .victory-content {
    text-align: center;
  }

  .victory-icon {
    font-size: 3rem;
    margin-bottom: 0.5rem;
  }

  .rating {
    margin-top: 1rem;
    font-weight: bold;
    color: var(--primary);
  }

  .dialog-btn {
    width: 100%;
    padding: 10px;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  .footer {
    text-align: center;
    padding: 2rem 0;
    color: var(--text-sec);
    font-size: 0.9rem;
    border-top: 1px solid #eef2f7;
    background: var(--card);
  }
</style>
