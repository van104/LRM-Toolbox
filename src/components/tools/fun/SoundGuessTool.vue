<template>
  <div class="sound-guess-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>猜声音</h1>
        <span class="nav-subtitle">Sound Guess</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="game-container glass-card">
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
          <div class="sound-icon">🔊</div>
          <h2>猜声音游戏</h2>
          <p>听声音，猜出是什么动物或物品！</p>
          <button class="start-btn" @click="startGame">开始游戏</button>
        </div>

        <div v-else-if="gameState === 'playing'" class="game-area">
          <div class="sound-player">
            <button class="play-btn" :disabled="isPlaying" @click="playSound">
              <span v-if="isPlaying" class="playing-icon">🎵</span>
              <span v-else class="play-icon">▶</span>
            </button>
            <p class="hint">点击播放声音</p>
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
              ✓ 正确! +{{ pointsEarned }}分
            </p>
            <p v-else class="wrong-text">✗ 错误! 答案是: {{ currentSound?.name }}</p>
          </div>
        </div>

        <div v-else-if="gameState === 'result'" class="result-screen">
          <div class="result-icon">{{ score >= 80 ? '🏆' : score >= 50 ? '👍' : '💪' }}</div>
          <h2>游戏结束!</h2>
          <div class="final-score">
            <span class="score-value">{{ score }}</span>
            <span class="score-label">分</span>
          </div>
          <div class="result-stats">
            <div class="result-stat">
              <span class="label">正确</span>
              <span class="value">{{ correctCount }}</span>
            </div>
            <div class="result-stat">
              <span class="label">错误</span>
              <span class="value">{{ totalLevels - correctCount }}</span>
            </div>
          </div>
          <button class="retry-btn" @click="startGame">再来一局</button>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 猜声音</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { Back } from '@element-plus/icons-vue';

  interface SoundItem {
    name: string;
    frequency: number[];
    pattern: number[];
    category: string;
  }

  type GameState = 'idle' | 'playing' | 'result';

  const sounds: SoundItem[] = [
    { name: '猫叫', frequency: [600, 800, 700], pattern: [200, 150, 200], category: '动物' },
    { name: '狗叫', frequency: [400, 500, 400], pattern: [150, 100, 150], category: '动物' },
    {
      name: '鸟叫',
      frequency: [1200, 1400, 1300, 1500],
      pattern: [100, 80, 100, 80],
      category: '动物'
    },
    {
      name: '电话铃声',
      frequency: [800, 600, 800, 600],
      pattern: [200, 200, 200, 200],
      category: '物品'
    },
    { name: '门铃', frequency: [500, 700], pattern: [300, 300], category: '物品' },
    { name: '警报声', frequency: [600, 800], pattern: [200, 200], category: '物品' },
    { name: '闹钟', frequency: [1000, 1200], pattern: [150, 150], category: '物品' },
    { name: '打雷', frequency: [100, 80, 60], pattern: [300, 200, 400], category: '自然' },
    {
      name: '雨声',
      frequency: [200, 250, 180, 220],
      pattern: [100, 100, 100, 100],
      category: '自然'
    },
    {
      name: '流水',
      frequency: [300, 350, 320, 380],
      pattern: [150, 120, 150, 120],
      category: '自然'
    },
    { name: '蚊子', frequency: [400, 450, 400], pattern: [100, 80, 100], category: '动物' },
    { name: '蝉鸣', frequency: [2000, 2200, 2000], pattern: [50, 50, 50], category: '动物' }
  ];

  const gameState = ref<GameState>('idle');
  const score = ref(0);
  const level = ref(0);
  const totalLevels = 10;
  const streak = ref(0);
  const correctCount = ref(0);
  const currentSound = ref<SoundItem | null>(null);
  const currentOptions = ref<string[]>([]);
  const correctIndex = ref(0);
  const selectedIndex = ref(-1);
  const showResult = ref(false);
  const isPlaying = ref(false);
  const pointsEarned = ref(0);

  let audioContext: AudioContext | null = null;

  const getAudioContext = (): AudioContext => {
    if (!audioContext) {
      audioContext = new AudioContext();
    }
    return audioContext;
  };

  const playSound = async () => {
    if (!currentSound.value || isPlaying.value) return;

    isPlaying.value = true;
    const ctx = getAudioContext();

    for (let i = 0; i < currentSound.value.frequency.length; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = currentSound.value.frequency[i];

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.01,
        ctx.currentTime + currentSound.value.pattern[i] / 1000
      );

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + currentSound.value.pattern[i] / 1000);

      await new Promise(resolve => setTimeout(resolve, currentSound.value!.pattern[i] + 50));
    }

    isPlaying.value = false;
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
    const shuffled = shuffleArray(sounds);
    currentSound.value = shuffled[0];

    const wrongOptions = shuffled.slice(1, 4).map(s => s.name);
    const allOptions = [currentSound.value.name, ...wrongOptions];
    currentOptions.value = shuffleArray(allOptions);
    correctIndex.value = currentOptions.value.indexOf(currentSound.value.name);

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
      pointsEarned.value = 10 + streak.value * 2;
      score.value += pointsEarned.value;
    } else {
      streak.value = 0;
      pointsEarned.value = 0;
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
    correctCount.value = 0;
    gameState.value = 'playing';
    generateQuestion();
  };
</script>

<style scoped>
  .sound-guess-tool {
    --bg: #f5f7fa;
    --card: #ffffff;
    --text: #2c3e50;
    --text-secondary: #7f8c8d;
    --primary: #9b59b6;
    --success: #27ae60;
    --danger: #e74c3c;

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

  .game-container {
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
    padding: 2rem 0;
  }
  .sound-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
  .start-screen h2 {
    margin: 0 0 0.5rem 0;
    color: var(--text);
  }
  .start-screen p {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
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

  .sound-player {
    padding: 2rem;
    margin-bottom: 1.5rem;
  }

  .play-btn {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: none;
    background: linear-gradient(145deg, var(--primary), #8e44ad);
    cursor: pointer;
    transition: transform 0.2s;
    box-shadow: 0 8px 20px rgba(155, 89, 182, 0.3);
  }

  .play-btn:hover:not(:disabled) {
    transform: scale(1.05);
  }
  .play-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .play-icon {
    font-size: 2rem;
    color: white;
  }
  .playing-icon {
    font-size: 2rem;
    animation: pulse 0.5s infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
  }

  .hint {
    color: var(--text-secondary);
    margin-top: 1rem;
    font-size: 0.9rem;
  }

  .options-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .option-btn {
    padding: 1rem;
    font-size: 1.1rem;
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
    background: #f0e6ff;
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
    font-size: 1.1rem;
    font-weight: bold;
  }
  .correct-text {
    color: var(--success);
  }
  .wrong-text {
    color: var(--danger);
  }

  .result-screen {
    text-align: center;
    padding: 2rem 0;
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
  }

  .result-stats {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin: 1.5rem 0;
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
