import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import type {
  GameState,
  LifeData,
  House,
  Vehicle,
  Career,
  EducationLevel
} from '@/data/life_simulator/types';

export function useBuildings(
  gameState: GameState,
  lifeData: LifeData,
  addLog: (t: string) => void
) {
  const buildingDialogVisible = ref(false);
  const currentBuilding = ref('');
  const bankAmount = ref(1000);

  const openBuilding = (id: string) => {
    currentBuilding.value = id;
    buildingDialogVisible.value = true;
  };

  // Bank
  const bankDeposit = () => {
    if (bankAmount.value <= 0) return;
    if (gameState.wealth >= bankAmount.value) {
      gameState.wealth -= bankAmount.value;
      gameState.savings += bankAmount.value;
      ElMessage.success(`存入 ${bankAmount.value} 元`);
    } else {
      ElMessage.error('现金不足');
    }
  };

  const bankWithdraw = () => {
    if (bankAmount.value <= 0) return;
    if (gameState.savings >= bankAmount.value) {
      gameState.savings -= bankAmount.value;
      gameState.wealth += bankAmount.value;
      ElMessage.success(`取出 ${bankAmount.value} 元`);
    } else {
      ElMessage.error('存款不足');
    }
  };

  // Housing
  const hasHouse = (id: string) => gameState.houses.some(h => h.id === id);

  const buyHouse = (house: House) => {
    if (gameState.wealth >= house.price) {
      gameState.wealth -= house.price;
      gameState.houses.push(house);
      addLog(`恭喜！你买下了 ${house.name}！`);
      ElMessage.success('购买成功');
    }
  };

  const rentHouse = (house: House) => {
    if (hasHouse(house.id)) return ElMessage.warning('你已经租了这个房子');
    gameState.houses.push(house);
    addLog(`你租下了 ${house.name}，虽然是租的，但也是个家。`);
    buildingDialogVisible.value = false;
  };

  // Vehicles
  const hasCar = (id: string) => gameState.cars.some(c => c.id === id);

  const buyCar = (car: Vehicle) => {
    if (gameState.wealth >= car.price) {
      gameState.wealth -= car.price;
      gameState.cars.push(car);
      addLog(`酷！你买了一辆 ${car.name}！`);
      ElMessage.success('购买成功');
    }
  };

  // Education
  const canStudy = (edu: EducationLevel) => {
    if (gameState.age > edu.maxAge) return false;
    if (gameState.age < edu.age) return false;
    return true;
  };

  const checkEduReq = (edu: EducationLevel) => {
    if (!canStudy(edu)) return false;
    const levels = lifeData.education.levels;
    const idx = levels.findIndex(e => e.id === edu.id);
    if (idx > 0) {
      const prevId = levels[idx - 1].id;
      // hasDegree check
      const degLevels = ['primary', 'middle', 'high', 'university', 'master', 'phd'];
      const currentIdx = degLevels.indexOf(gameState.degree);
      const targetIdx = degLevels.indexOf(prevId);
      if (currentIdx < targetIdx) return false;
    }
    return true;
  };

  const enroll = (edu: EducationLevel) => {
    if (gameState.hasStudied) return ElMessage.warning('你今年已经入学/毕业过了。');
    if (edu.cost && gameState.wealth < edu.cost) return ElMessage.error('学费不足');
    if (!checkEduReq(edu)) return ElMessage.error(`未满足前置学历要求`);

    if (edu.cost) gameState.wealth -= edu.cost;
    addLog(`你入学了 ${edu.name}。好好学习！`);
    buildingDialogVisible.value = false;
    gameState.degree = edu.id;
    gameState.hasStudied = true;
  };

  // Job
  const checkJobReq = (job: Career) => {
    if (gameState.smarts < (job.req.smarts || 0)) return false;
    if (gameState.looks < (job.req.looks || 0)) return false;
    if (gameState.health < (job.req.health || 0)) return false;
    return true;
  };

  const applyJob = (job: Career) => {
    if (gameState.job) return ElMessage.warning('你已经有工作了，请先辞职。');
    if (checkJobReq(job)) {
      gameState.job = job;
      addLog(`恭喜，你被 ${job.name} 录用了！`);
      buildingDialogVisible.value = false;
    } else {
      ElMessage.error('能力不足。');
    }
  };

  const quitJob = () => {
    if (!gameState.job) return;
    addLog(`你辞去了 ${gameState.job.name} 的工作。`);
    gameState.job = null;
    buildingDialogVisible.value = false;
  };

  // Hospital
  const visitDoctor = (type: 'normal' | 'expert') => {
    const cost = type === 'expert' ? 2000 : 200;
    if (gameState.wealth < cost) return ElMessage.error('没钱看病');
    gameState.wealth -= cost;
    const heal = type === 'expert' ? 30 : 10;
    gameState.health = Math.min(100, gameState.health + heal);
    addLog(`看病结束，健康恢复了。`);
  };

  const plasticSurgery = () => {
    if (gameState.wealth < 20000) return ElMessage.error('没钱整容');
    gameState.wealth -= 20000;
    if (Math.random() > 0.3) {
      gameState.looks = Math.min(100, gameState.looks + 20);
      addLog('整容成功！');
    } else {
      gameState.looks = Math.max(0, gameState.looks - 10);
      addLog('整容失败...');
    }
  };

  return {
    buildingDialogVisible,
    currentBuilding,
    bankAmount,
    openBuilding,
    bankDeposit,
    bankWithdraw,
    hasHouse,
    buyHouse,
    rentHouse,
    hasCar,
    buyCar,
    checkEduReq,
    enroll,
    checkJobReq,
    applyJob,
    quitJob,
    visitDoctor,
    plasticSurgery
  };
}
