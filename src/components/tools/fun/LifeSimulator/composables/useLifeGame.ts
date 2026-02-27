import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { initialStats } from '@/data/life_simulator';
import type { GameState, LifeData, AgeEvent, House } from '@/data/life_simulator/types';

export function useLifeGame(lifeData: LifeData) {
  const gameState = reactive<GameState>({ ...initialStats } as GameState);
  const gameStage = ref<'intro' | 'talent' | 'points' | 'game' | 'over'>('intro');
  const currentScene = ref<'dashboard' | 'city'>('dashboard');
  const pendingChoice = ref<AgeEvent | null>(null);
  const hasSave = ref(false);

  const addLog = (text: string) => {
    if (!gameState.log) gameState.log = [];
    gameState.log.push({ age: gameState.age, text });
  };

  const applyEffect = (ef: Partial<GameState> & { death?: boolean }) => {
    if (ef.death) {
      if (Math.random() < 0.2) {
        addLog('你遭遇了致命危险，但奇迹般地幸存了下来！');
        return;
      }
      gameState.isAlive = false;
      return;
    }

    const stats: (keyof GameState)[] = ['health', 'happiness', 'smarts', 'looks', 'fame', 'stress'];
    stats.forEach(k => {
      if (typeof ef[k] === 'number') {
        const current = (gameState[k] as number) || 0;
        (gameState[k] as number) = Math.max(0, Math.min(100, current + (ef[k] as number)));
      }
    });

    if (typeof ef.wealth === 'number') gameState.wealth += ef.wealth;
    if (typeof ef.savings === 'number') gameState.savings += ef.savings;
  };

  const checkDeath = () => {
    if (gameState.health <= 0) {
      if (Math.random() > 0.8) {
        gameState.health = 1;
        addLog('你大病一场，险些丧命，还好挺过来了。');
        return;
      }
      gameState.isAlive = false;
      addLog(`遗憾的是，因为健康耗尽，你的生命走到了尽头。享年 ${gameState.age} 岁。`);
      pendingChoice.value = null;
      gameStage.value = 'over';
    } else if (gameState.age > 100) {
      const deathProb = (gameState.age - 100) * 0.1;
      if (Math.random() < deathProb) {
        gameState.isAlive = false;
        addLog(`你在睡梦中安详离世（寿终正寝）。享年 ${gameState.age} 岁。`);
        pendingChoice.value = null;
        gameStage.value = 'over';
      }
    }
  };

  const getAgePeriod = (age: number) => {
    if (age < 13) return 'child';
    if (age < 18) return 'teen';
    if (age < 60) return 'adult';
    return 'elder';
  };

  const ageUp = () => {
    if (!gameState.isAlive) return;
    gameState.age++;

    if (gameState.age < 18) {
      const allowance = 500 + gameState.happiness * 5;
      gameState.wealth += allowance;
      if (gameState.age >= 6) addLog(`父母给了你 ￥${allowance} 零花钱。`);
    }

    if (gameState.job) {
      gameState.wealth += gameState.job.salary * 12;
      if (gameState.age >= 65) {
        const pension = gameState.job.salary * 5;
        addLog(`你已年满65岁，从 ${gameState.job.name} 光荣退休！获得退休金 ￥${pension}。`);
        gameState.wealth += pension;
        gameState.job = null;
      }
    }

    if (gameState.savings > 0) {
      const interest = Math.floor(gameState.savings * lifeData.bank.depositRates.fixed1);
      gameState.savings += interest;
      if (interest > 1000) addLog(`你的银行存款产生了 ￥${interest} 的利息。`);
    }

    if (gameState.houses.length > 0) {
      const rented = gameState.houses.filter((h: House) => h.type === 'rent');
      let totalRent = 0;
      rented.forEach((h: House) => (totalRent += h.rent * 12));
      if (totalRent > 0) {
        gameState.wealth -= totalRent;
        addLog(`支付了全年房租 ￥${totalRent}。`);
        if (gameState.wealth < 0) {
          addLog('你破产了，付不起房租，被房东扫地出门！');
          gameState.houses = gameState.houses.filter((h: House) => h.type !== 'rent');
        }
      }
    }

    const events: AgeEvent[] = [];
    if (lifeData.ageEvents && lifeData.ageEvents[gameState.age]) {
      const pool = lifeData.ageEvents[gameState.age];
      const evt = pool[Math.floor(Math.random() * pool.length)];
      if (evt) events.push(evt);
    } else {
      const period = getAgePeriod(gameState.age);
      if (lifeData.periods && lifeData.periods[period]) {
        const pool = lifeData.periods[period];
        const evt = pool[Math.floor(Math.random() * pool.length)];
        if (evt && (!evt.minAge || evt.minAge <= gameState.age)) {
          events.push(evt);
        } else {
          events.push({ text: '这一年平淡无奇，你又长大了一岁。' });
        }
      } else {
        events.push({ text: '岁月静好。' });
      }
    }

    events.forEach(ev => {
      if (ev.choices) {
        addLog(ev.text);
        pendingChoice.value = ev;
        gameState.log[gameState.log.length - 1].choices = ev.choices;
      } else {
        addLog(ev.text);
        if (ev.effect) applyEffect(ev.effect);
      }
    });

    if (gameState.houses.length > 0 || gameState.cars.length > 0) {
      const happyBonus = gameState.houses.length * 2 + gameState.cars.length;
      gameState.happiness = Math.min(100, gameState.happiness + happyBonus);
      const ownedHouses = gameState.houses.filter((h: House) => h.type === 'buy').length;
      if (ownedHouses > 0) gameState.health = Math.min(100, gameState.health + ownedHouses);
    }

    if (Math.random() > 0.7) gameState.health -= 1;

    gameState.hasWorked = false;
    gameState.hasStudied = false;

    checkDeath();
    saveGame(true);
  };

  const makeChoice = (choice: {
    log?: string;
    effect?: Partial<GameState> & { death?: boolean };
  }) => {
    if (choice.log) addLog(choice.log);
    if (choice.effect) applyEffect(choice.effect);
    pendingChoice.value = null;
    checkDeath();
  };

  const saveGame = (silent = false) => {
    localStorage.setItem(
      'lifeSimSave',
      JSON.stringify({ state: gameState, stage: gameStage.value })
    );
    hasSave.value = true;
    if (!silent) ElMessage.success('存档成功');
  };

  const loadGame = () => {
    const data = localStorage.getItem('lifeSimSave');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (parsed.state) {
          Object.assign(gameState, parsed.state);
          gameStage.value = parsed.stage || 'game';
        } else {
          Object.assign(gameState, parsed);
          gameStage.value = 'game';
        }
        addLog('欢迎回来！读取存档成功。');
      } catch (e) {
        console.error(e);
      }
    }
  };

  const restart = () => {
    gameStage.value = 'intro';
    Object.assign(gameState, initialStats);
    gameState.isAlive = false;
    currentScene.value = 'dashboard';
    gameState.houses = [];
    gameState.cars = [];
    gameState.log = [];
  };

  return {
    gameState,
    gameStage,
    currentScene,
    pendingChoice,
    hasSave,
    ageUp,
    addLog,
    applyEffect,
    makeChoice,
    saveGame,
    loadGame,
    restart
  };
}
