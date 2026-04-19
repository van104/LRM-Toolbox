<template>
  <div class="flag-quiz-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>世界国旗识别</h1>
        <span class="nav-subtitle">Flag Quiz</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="quiz-container glass-card">
        <div class="stats-bar">
          <div class="stat">
            <span class="label">得分</span>
            <span class="value">{{ score }}</span>
          </div>
          <div class="stat">
            <span class="label">关卡</span>
            <span class="value">{{ level }}/{{ totalLevels }}</span>
          </div>
          <div class="stat">
            <span class="label">连胜</span>
            <span class="value">{{ streak }}</span>
          </div>
        </div>

        <div v-if="gameState === 'idle'" class="start-screen">
          <div class="flag-icon">🏳️</div>
          <h2>世界国旗识别</h2>
          <p>看国旗，猜国家！</p>

          <div class="mode-select">
            <h3>选择模式</h3>
            <div class="modes">
              <button
                v-for="m in modes"
                :key="m.id"
                :class="['mode-btn', { active: selectedMode === m.id }]"
                @click="selectedMode = m.id"
              >
                {{ m.name }}
              </button>
            </div>
          </div>

          <button class="start-btn" @click="startGame">开始挑战</button>
        </div>

        <div v-else-if="gameState === 'playing'" class="game-area">
          <div class="flag-display">
            <div class="flag" v-html="currentFlag.emoji"></div>
          </div>

          <div class="options-grid">
            <button
              v-for="(option, index) in currentOptions"
              :key="index"
              :class="[
                'option-btn',
                {
                  selected: selectedIndex === index,
                  correct: showResult && index === correctIndex,
                  wrong: showResult && selectedIndex === index && index !== correctIndex
                }
              ]"
              :disabled="showResult"
              @click="selectAnswer(index)"
            >
              {{ option }}
            </button>
          </div>

          <div v-if="showResult" class="result-feedback">
            <p v-if="selectedIndex === correctIndex" class="correct-text">
              ✓ 正确! {{ currentFlag.name }}
            </p>
            <p v-else class="wrong-text">✗ 错误! 正确答案: {{ currentFlag.name }}</p>
            <p class="continent">📍 {{ currentFlag.continent }}</p>
          </div>
        </div>

        <div v-else-if="gameState === 'result'" class="result-screen">
          <div class="result-icon">{{ score >= 80 ? '🏆' : score >= 50 ? '👍' : '💪' }}</div>
          <h2>挑战完成!</h2>
          <div class="final-score">
            <span class="score-value">{{ score }}</span>
            <span class="score-label">分</span>
          </div>

          <div class="result-stats">
            <div class="result-stat">
              <span class="label">正确</span>
              <span class="value correct">{{ correctCount }}</span>
            </div>
            <div class="result-stat">
              <span class="label">错误</span>
              <span class="value wrong">{{ totalLevels - correctCount }}</span>
            </div>
            <div class="result-stat">
              <span class="label">最长连胜</span>
              <span class="value">{{ maxStreak }}</span>
            </div>
          </div>

          <button class="retry-btn" @click="startGame">再来一局</button>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 世界国旗识别</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { Back } from '@element-plus/icons-vue';

  interface Flag {
    name: string;
    emoji: string;
    continent: string;
  }

  type GameState = 'idle' | 'playing' | 'result';

  const modes = [
    { id: 'world', name: '世界' },
    { id: 'asia', name: '亚洲' },
    { id: 'europe', name: '欧洲' },
    { id: 'america', name: '美洲' }
  ];

  const flags: Flag[] = [
    { name: '中国', emoji: '🇨🇳', continent: '亚洲' },
    { name: '日本', emoji: '🇯🇵', continent: '亚洲' },
    { name: '韩国', emoji: '🇰🇷', continent: '亚洲' },
    { name: '印度', emoji: '🇮🇳', continent: '亚洲' },
    { name: '泰国', emoji: '🇹🇭', continent: '亚洲' },
    { name: '越南', emoji: '🇻🇳', continent: '亚洲' },
    { name: '新加坡', emoji: '🇸🇬', continent: '亚洲' },
    { name: '马来西亚', emoji: '🇲🇾', continent: '亚洲' },
    { name: '印度尼西亚', emoji: '🇮🇩', continent: '亚洲' },
    { name: '菲律宾', emoji: '🇵🇭', continent: '亚洲' },
    { name: '英国', emoji: '🇬🇧', continent: '欧洲' },
    { name: '法国', emoji: '🇫🇷', continent: '欧洲' },
    { name: '德国', emoji: '🇩🇪', continent: '欧洲' },
    { name: '意大利', emoji: '🇮🇹', continent: '欧洲' },
    { name: '西班牙', emoji: '🇪🇸', continent: '欧洲' },
    { name: '俄罗斯', emoji: '🇷🇺', continent: '欧洲' },
    { name: '荷兰', emoji: '🇳🇱', continent: '欧洲' },
    { name: '瑞士', emoji: '🇨🇭', continent: '欧洲' },
    { name: '瑞典', emoji: '🇸🇪', continent: '欧洲' },
    { name: '美国', emoji: '🇺🇸', continent: '北美洲' },
    { name: '加拿大', emoji: '🇨🇦', continent: '北美洲' },
    { name: '墨西哥', emoji: '🇲🇽', continent: '北美洲' },
    { name: '巴西', emoji: '🇧🇷', continent: '南美洲' },
    { name: '阿根廷', emoji: '🇦🇷', continent: '南美洲' },
    { name: '澳大利亚', emoji: '🇦🇺', continent: '大洋洲' },
    { name: '新西兰', emoji: '🇳🇿', continent: '大洋洲' },
    { name: '埃及', emoji: '🇪🇬', continent: '非洲' },
    { name: '南非', emoji: '🇿🇦', continent: '非洲' }
  ];

  const gameState = ref<GameState>('idle');
  const selectedMode = ref('world');
  const score = ref(0);
  const level = ref(0);
  const totalLevels = 15;
  const streak = ref(0);
  const maxStreak = ref(0);
  const correctCount = ref(0);
  const currentFlag = ref<Flag>(flags[0]);
  const currentOptions = ref<string[]>([]);
  const correctIndex = ref(0);
  const selectedIndex = ref(-1);
  const showResult = ref(false);

  const getFilteredFlags = (): Flag[] => {
    if (selectedMode.value === 'world') return [...flags];
    const continentMap: Record<string, string> = {
      asia: '亚洲',
      europe: '欧洲',
      america: '北美洲'
    };
    return flags.filter(
      f =>
        f.continent === continentMap[selectedMode.value] ||
        (selectedMode.value === 'america' && f.continent === '南美洲')
    );
  };

  const shuffleArray = <T,>(arr: T[]): T[] => {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  const generateQuestion = () => {
    const filtered = getFilteredFlags();
    const shuffled = shuffleArray(filtered);
    currentFlag.value = shuffled[0];

    const wrongOptions = shuffled.slice(1, 4).map(f => f.name);
    const allOptions = [currentFlag.value.name, ...wrongOptions];
    currentOptions.value = shuffleArray(allOptions);
    correctIndex.value = currentOptions.value.indexOf(currentFlag.value.name);

    selectedIndex.value = -1;
    showResult.value = false;
  };

  const selectAnswer = (index: number) => {
    if (showResult.value) return;

    selectedIndex.value = index;
    showResult.value = true;

    if (index === correctIndex.value) {
      streak.value++;
      correctCount.value++;
      if (streak.value > maxStreak.value) {
        maxStreak.value = streak.value;
      }
      score.value += 10 + streak.value * 2;
    } else {
      streak.value = 0;
    }

    setTimeout(() => {
      level.value++;
      if (level.value >= totalLevels) {
        gameState.value = 'result';
      } else {
        generateQuestion();
      }
    }, 1500);
  };

  const startGame = () => {
    score.value = 0;
    level.value = 1;
    streak.value = 0;
    maxStreak.value = 0;
    correctCount.value = 0;
    gameState.value = 'playing';
    generateQuestion();
  };
</script>

<style scoped>
  .flag-quiz-tool {
    --bg: #f5f7fa;
    --card: #ffffff;
    --text: #2c3e50;
    --text-secondary: #7f8c8d;
    --primary: #3498db;
    --success: #27ae60;
    --danger: #e74c3c;

    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
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

  .quiz-container {
    background: var(--card);
    border-radius: 20px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
    padding: 1.5rem;
    width: 100%;
    max-width: 500px;
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
    padding: 1.5rem 0;
  }
  .flag-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
  .start-screen h2 {
    margin: 0 0 0.5rem 0;
    color: var(--text);
  }
  .start-screen > p {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
  }

  .mode-select {
    margin-bottom: 1.5rem;
  }
  .mode-select h3 {
    font-size: 0.95rem;
    margin: 0 0 0.8rem 0;
    color: var(--text);
  }
  .modes {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
  }

  .mode-btn {
    padding: 0.6rem 1.2rem;
    border: 2px solid #ddd;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    color: var(--text);
  }
  .mode-btn.active {
    border-color: var(--primary);
    background: #e6f2ff;
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

  .flag-display {
    padding: 2rem;
    margin-bottom: 1.5rem;
  }

  .flag {
    font-size: 8rem;
    line-height: 1;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  }

  .options-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .option-btn {
    padding: 1rem;
    font-size: 1rem;
    border: 2px solid #ddd;
    border-radius: 12px;
    background: white;
    cursor: pointer;
    color: var(--text);
    transition: all 0.2s;
  }

  .option-btn:hover:not(:disabled) {
    border-color: var(--primary);
  }
  .option-btn.selected {
    border-color: var(--primary);
    background: #e6f2ff;
  }
  .option-btn.correct {
    border-color: var(--success);
    background: #e6fff0;
  }
  .option-btn.wrong {
    border-color: var(--danger);
    background: #ffe6e6;
  }
  .option-btn:disabled {
    cursor: default;
  }

  .result-feedback {
    margin-top: 1.5rem;
  }
  .correct-text {
    color: var(--success);
    font-size: 1.1rem;
    font-weight: bold;
    margin-bottom: 0.3rem;
  }
  .wrong-text {
    color: var(--danger);
    font-size: 1.1rem;
    font-weight: bold;
    margin-bottom: 0.3rem;
  }
  .continent {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .result-screen {
    text-align: center;
    padding: 1.5rem 0;
  }
  .result-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
  .result-screen h2 {
    margin: 0 0 1rem 0;
    color: var(--text);
  }
  .final-score {
    margin-bottom: 1rem;
  }
  .score-value {
    font-size: 3rem;
    font-weight: 800;
    color: var(--primary);
  }
  .score-label {
    font-size: 1.2rem;
    color: var(--text-secondary);
    margin-left: 4px;
  }

  .result-stats {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 12px;
  }

  .result-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .result-stat .label {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }
  .result-stat .value {
    font-size: 1.2rem;
    font-weight: bold;
    color: var(--text);
  }
  .result-stat .value.correct {
    color: var(--success);
  }
  .result-stat .value.wrong {
    color: var(--danger);
  }

  .retry-btn {
    padding: 0.8rem 2.5rem;
    font-size: 1rem;
    background: var(--primary);
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
