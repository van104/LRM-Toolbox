<template>
  <div class="life-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>模拟人生 Plus</h1>
        <span class="nav-subtitle">Text Life Simulator</span>
      </div>
      <div class="nav-actions">
        <el-button
          v-if="gameState.isAlive && gameStage === 'game'"
          size="small"
          @click="saveGame()"
        >
          保存存档
        </el-button>
        <el-button v-if="gameStage !== 'intro'" size="small" type="danger" @click="restart">
          重开
        </el-button>
      </div>
    </nav>

    <main class="main-content">
      <!-- Intro Stage -->
      <IntroView
        v-if="gameStage === 'intro'"
        :has-save="hasSave"
        :loading="loading"
        @start="onStartNewLife"
        @load="loadGame"
      />

      <!-- Talent Stage -->
      <TalentView
        v-else-if="gameStage === 'talent'"
        :options="talentOptions"
        :selected-id="selectedTalent?.id"
        @select="selectTalent"
        @back="gameStage = 'intro'"
        @confirm="onTalentConfirm"
      />

      <!-- Points Stage -->
      <PointsView
        v-else-if="gameStage === 'points'"
        :available-points="availablePoints"
        :temp-stats="tempStats"
        :selected-talent="selectedTalent"
        @change="handlePointChange"
        @back="gameStage = 'talent'"
        @start="onGameStart"
      />

      <!-- Game Stage -->
      <div v-else-if="gameStage === 'game'" class="game-world fade-in">
        <ActionHeader
          :age="gameState.age"
          :job-name="gameState.job?.name || '无业'"
          :wealth="gameState.wealth"
          :savings="gameState.savings"
          :house-count="gameState.houses.length"
          :car-count="gameState.cars.length"
          :is-alive="gameState.isAlive"
          :pending-choice="!!pendingChoice"
          @age-up="onAgeUp"
        />

        <div class="viewport">
          <!-- City Map -->
          <div
            v-if="currentScene === 'city'"
            class="city-scene"
            :style="{ backgroundImage: `url(${cityMapUrl})` }"
          >
            <div class="city-overlay">
              <div class="city-btn bank-btn" @click="openBuilding('bank')">
                <el-icon><Money /></el-icon>银行
              </div>
              <div class="city-btn real-estate-btn" @click="openBuilding('housing')">
                <el-icon><House /></el-icon>房产
              </div>
              <div class="city-btn dealership-btn" @click="openBuilding('vehicles')">
                <el-icon><Van /></el-icon>4S店
              </div>
              <div class="city-btn school-btn" @click="openBuilding('school')">
                <el-icon><School /></el-icon>学校
              </div>
              <div class="city-btn hospital-btn" @click="openBuilding('hospital')">
                <el-icon><FirstAidKit /></el-icon>医院
              </div>
              <div class="city-btn company-btn" @click="openBuilding('company')">
                <el-icon><OfficeBuilding /></el-icon>职场
              </div>
              <div class="city-btn back-btn" @click="currentScene = 'dashboard'">
                <el-icon><Back /></el-icon>返回主屏
              </div>
            </div>
          </div>

          <!-- Dashboard -->
          <div v-else class="dashboard-scene">
            <div class="left-col">
              <AttributePanel :value-map="gameState" />
              <AssetPanel :houses="gameState.houses" :cars="gameState.cars" />

              <div class="actions-grid">
                <el-button type="success" size="large" @click="currentScene = 'city'">
                  <el-icon><Position /></el-icon>
                  外出移动
                </el-button>
                <el-button v-if="gameState.job" @click="workHard">努力工作</el-button>
              </div>
            </div>

            <EventLog
              :logs="gameState.log"
              :degree-name="getDegreeName(gameState.degree)"
              :pending-choice="!!pendingChoice"
              @choice="makeChoice"
            />
          </div>
        </div>
      </div>

      <!-- Death Stage -->
      <GameOverView
        v-else-if="gameStage === 'over'"
        :age="gameState.age"
        :wealth="gameState.wealth"
        :savings="gameState.savings"
        :job-name="gameState.job?.name || '无业'"
        :houses="gameState.houses"
        :cars="gameState.cars"
        :game-state="gameState"
        @restart="restart"
      />
    </main>

    <BuildingModal
      v-model:visible="buildingDialogVisible"
      :type="currentBuilding"
      :wealth="gameState.wealth"
      :savings="gameState.savings"
      :interest-rate="lifeData.bank.depositRates.fixed1"
      :housing-data="lifeData.housing"
      :vehicle-data="lifeData.vehicles"
      :education-data="lifeData.education"
      :available-jobs="lifeData.careers"
      :current-job="gameState.job"
      :has-house="hasHouse"
      :has-car="hasCar"
      :has-degree="hasDegree"
      @bank-deposit="bankDeposit"
      @bank-withdraw="bankWithdraw"
      @buy-house="buyHouse"
      @rent-house="rentHouse"
      @buy-car="buyCar"
      @enroll="enroll"
      @visit-doctor="visitDoctor"
      @plastic-surgery="plasticSurgery"
      @apply-job="applyJob"
      @quit-job="quitJob"
    />

    <footer class="footer">© 2026 LRM工具箱 - 模拟人生 Plus</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue';
  import {
    Back,
    Money,
    House,
    Van,
    School,
    FirstAidKit,
    OfficeBuilding,
    Position
  } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';

  // Data
  import { loadLifeData } from '@/data/life_simulator';

  // Sub-components
  import IntroView from './LifeSimulator/components/IntroView.vue';
  import TalentView from './LifeSimulator/components/TalentView.vue';
  import PointsView from './LifeSimulator/components/PointsView.vue';
  import ActionHeader from './LifeSimulator/components/ActionHeader.vue';
  import AttributePanel from './LifeSimulator/components/AttributePanel.vue';
  import AssetPanel from './LifeSimulator/components/AssetPanel.vue';
  import EventLog from './LifeSimulator/components/EventLog.vue';
  import BuildingModal from './LifeSimulator/components/BuildingModal.vue';
  import GameOverView from './LifeSimulator/components/GameOverView.vue';

  // Composables
  import { useLifeGame } from './LifeSimulator/composables/useLifeGame';
  import { useTalentSelection } from './LifeSimulator/composables/useTalentSelection';
  import { useBuildings } from './LifeSimulator/composables/useBuildings';

  // Types
  import type { LifeData } from '@/data/life_simulator/types';

  const loading = ref(true);
  const lifeData = reactive<LifeData>({
    careers: [],
    talents: [],
    education: { levels: [] },
    housing: [],
    vehicles: [],
    bank: {
      depositRates: { current: 0, fixed1: 0, fixed3: 0 },
      loanRate: 0
    },
    ageEvents: {},
    deathEvents: {},
    periods: {}
  });

  const cityMapUrl =
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2144&auto=format&fit=crop';

  const {
    gameState,
    gameStage,
    currentScene,
    pendingChoice,
    hasSave,
    ageUp,
    addLog,
    makeChoice,
    saveGame,
    loadGame,
    restart
  } = useLifeGame(lifeData);

  const {
    talentOptions,
    selectedTalent,
    availablePoints,
    tempStats,
    startSelection,
    selectTalent,
    handlePointChange,
    confirmTalent
  } = useTalentSelection(gameState, lifeData);

  const {
    buildingDialogVisible,
    currentBuilding,
    openBuilding,
    bankDeposit,
    bankWithdraw,
    hasHouse,
    buyHouse,
    rentHouse,
    hasCar,
    buyCar,
    enroll,
    applyJob,
    quitJob,
    visitDoctor,
    plasticSurgery
  } = useBuildings(gameState, lifeData, addLog);

  onMounted(async () => {
    try {
      const data = await loadLifeData();
      Object.assign(lifeData, data);
      if (localStorage.getItem('lifeSimSave')) {
        hasSave.value = true;
      }
    } finally {
      loading.value = false;
    }
  });

  // Main Logic Overrides/Glue
  const onStartNewLife = () => {
    if (!lifeData.talents || lifeData.talents.length === 0) {
      ElMessage.error('天赋命格数据加载失败，请刷新后再试');
      return;
    }
    startSelection();
    gameStage.value = 'talent';
  };

  const onTalentConfirm = () => {
    confirmTalent();
    gameStage.value = 'points';
  };

  const onGameStart = () => {
    Object.assign(gameState, JSON.parse(JSON.stringify(tempStats.value)));
    gameState.isAlive = true;
    gameState.log = [];

    if (selectedTalent.value?.gift === 'scooter') {
      const scooter = lifeData.vehicles.find(v => v.id === 'scooter');
      if (scooter) gameState.cars.push(scooter);
    }

    addLog(`你出生了。`);
    if (selectedTalent.value) {
      addLog(`你拥有命格：【${selectedTalent.value.name}】 - ${selectedTalent.value.desc}`);
    }
    saveGame(true);
    gameStage.value = 'game';
  };

  const onAgeUp = () => {
    ageUp();
  };

  const workHard = () => {
    if (gameState.hasWorked) {
      return ElMessage.warning('你今年已经很努力了。');
    }
    addLog('你努力工作了一整年，获得了额外的绩效奖金。');
    gameState.wealth += 2000;
    gameState.health -= 1;
    gameState.hasWorked = true;
  };

  const getDegreeName = (id: string) => {
    if (!id || id === 'none') return '文盲';
    const edu = lifeData.education.levels.find(e => e.id === id);
    return edu ? edu.name : id;
  };

  const hasDegree = (levelId: string) => {
    const levels = ['primary', 'middle', 'high', 'university', 'master', 'phd'];
    const currentIdx = levels.indexOf(gameState.degree);
    const targetIdx = levels.indexOf(levelId);
    return currentIdx >= targetIdx;
  };
</script>

<style scoped>
  .life-tool {
    --bg: #f5f7fa;
    --card: #ffffff;
    --primary: #409eff;
    --text: #2c3e50;
    --text-sec: #7f8c8d;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    height: 100vh;
    background: var(--bg);
    display: flex;
    flex-direction: column;
    color: var(--text);
    overflow: hidden;
  }
  .nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    height: 60px;
    background: var(--card);
    border-bottom: 1px solid #eef2f7;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
    flex-shrink: 0;
  }
  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.95rem;
    color: var(--text-sec);
  }
  .nav-center h1 {
    font-size: 1.15rem;
    margin: 0;
    font-weight: bold;
  }
  .nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-sec);
    text-transform: uppercase;
  }
  .main-content {
    flex: 1;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 20px;
  }
  .game-world {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .viewport {
    flex: 1;
    position: relative;
    overflow: hidden;
    border-radius: 12px;
  }
  .city-scene {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    border-radius: 12px;
    position: relative;
  }
  .city-overlay {
    position: absolute;
    inset: 0;
  }
  .city-btn {
    position: absolute;
    background: rgba(255, 255, 255, 0.9);
    padding: 8px 15px;
    border-radius: 20px;
    cursor: pointer;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 5px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  }
  .bank-btn {
    top: 20%;
    left: 30%;
  }
  .real-estate-btn {
    top: 40%;
    left: 15%;
  }
  .dealership-btn {
    top: 60%;
    left: 25%;
  }
  .school-btn {
    top: 25%;
    right: 20%;
  }
  .hospital-btn {
    top: 50%;
    right: 15%;
  }
  .company-btn {
    top: 15%;
    left: 50%;
    transform: translateX(-50%);
  }
  .back-btn {
    bottom: 20px;
    right: 20px;
    background: #333;
    color: #fff;
  }

  .dashboard-scene {
    height: 100%;
    display: flex;
    gap: 20px;
  }
  .left-col {
    width: 320px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .actions-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .footer {
    text-align: center;
    padding: 10px;
    color: #999;
    font-size: 0.8rem;
    border-top: 1px solid #eef2f7;
    background: #fff;
  }
  .fade-in {
    animation: fadeIn 0.5s ease-out;
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
