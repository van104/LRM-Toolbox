<template>
  <div class="color-reaction-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>颜色反应</h1>
        <span class="nav-subtitle">Color Reaction</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="game-container glass-card">
        <div class="game-header">
          <div class="stat-box">
            <span class="label">得分</span>
            <span class="value">{{ score }}</span>
          </div>
          <div class="stat-box">
            <span class="label">关卡</span>
            <span class="value">{{ level }}/{{ maxLevel }}</span>
          </div>
          <div class="stat-box">
            <span class="label">最高分</span>
            <span class="value">{{ highScore }}</span>
          </div>
        </div>

        <div v-if="gameState === 'idle'" class="start-screen">
          <div class="color-icon">🎨</div>
          <h2>斯特鲁普颜色测试</h2>
          <p>选择文字所描述的<strong>颜色</strong>，而非文字内容</p>
          <div class="example">
            <p>例如：<span class="example-word" style="color: blue">红色</span></p>
            <p>应选择：<span class="correct-answer">蓝色</span></p>
          </div>
          <button class="start-btn" @click="startGame">开始测试</button>
        </div>

        <div v-else-if="gameState === 'playing'" class="game-area">
          <div class="timer-bar">
            <div class="timer-fill" :style="{ width: `${(timeLeft / maxTime) * 100}%` }"></div>
          </div>

          <div class="word-display">
            <span class="color-word" :style="{ color: currentColor.hex }">
              {{ currentWord.text }}
            </span>
          </div>

          <p class="instruction">选择文字描述的颜色</p>

          <div class="color-options">
            <button
              v-for="color in colorOptions"
              :key="color.name"
              class="color-btn"
              :style="{ backgroundColor: color.hex }"
              @click="selectColor(color)"
            >
              <span class="color-name">{{ color.name }}</span>
            </button>
          </div>

          <div class="feedback" :class="feedback">
            <span v-if="feedback === 'correct'">✓ 正确!</span>
            <span v-else-if="feedback === 'wrong'">✗ 错误!</span>
          </div>
        </div>

        <div v-else-if="gameState === 'result'" class="result-screen">
          <div class="result-icon">{{ score >= 80 ? '🏆' : score >= 50 ? '👍' : '💪' }}</div>
          <h2>测试完成!</h2>
          <div class="final-score">
            <span class="score-value">{{ score }}</span>
            <span class="score-label">分</span>
          </div>
          <p v-if="score > highScore" class="new-record">🎉 新纪录!</p>

          <div class="result-stats">
            <div class="result-stat">
              <span class="label">正确</span>
              <span class="value correct">{{ correctCount }}</span>
            </div>
            <div class="result-stat">
              <span class="label">错误</span>
              <span class="value wrong">{{ wrongCount }}</span>
            </div>
            <div class="result-stat">
              <span class="label">准确率</span>
              <span class="value">{{ accuracy }}%</span>
            </div>
          </div>

          <div class="rank-info">
            <p class="rank-title">你的大脑反应能力等级</p>
            <p class="rank-level">{{ rankLevel }}</p>
          </div>

          <button class="retry-btn" @click="startGame">再来一次</button>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 颜色反应</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { Back } from '@element-plus/icons-vue';

  interface ColorInfo {
    name: string;
    text: string;
    hex: string;
  }

  type GameState = 'idle' | 'playing' | 'result';

  const colors: ColorInfo[] = [
    { name: '红色', text: '红', hex: '#e74c3c' },
    { name: '蓝色', text: '蓝', hex: '#3498db' },
    { name: '绿色', text: '绿', hex: '#27ae60' },
    { name: '黄色', text: '黄', hex: '#f1c40f' },
    { name: '紫色', text: '紫', hex: '#9b59b6' },
    { name: '橙色', text: '橙', hex: '#e67e22' }
  ];

  const gameState = ref<GameState>('idle');
  const score = ref(0);
  const level = ref(0);
  const maxLevel = 20;
  const timeLeft = ref(5);
  const maxTime = 5;
  const highScore = ref(parseInt(localStorage.getItem('colorReactionHighScore') || '0'));
  const correctCount = ref(0);
  const wrongCount = ref(0);
  const feedback = ref<'correct' | 'wrong' | null>(null);

  const currentWord = ref<ColorInfo>(colors[0]);
  const currentColor = ref<ColorInfo>(colors[1]);
  const colorOptions = ref<ColorInfo[]>([]);

  let timer: number | null = null;

  const accuracy = computed(() => {
    const total = correctCount.value + wrongCount.value;
    return total > 0 ? Math.round((correctCount.value / total) * 100) : 0;
  });

  const rankLevel = computed(() => {
    if (score.value >= 90) return '🧠 超级大脑';
    if (score.value >= 70) return '⚡ 反应敏捷';
    if (score.value >= 50) return '👍 表现不错';
    if (score.value >= 30) return '🎯 继续加油';
    return '💪 需要练习';
  });

  const shuffleArray = <T,>(arr: T[]): T[] => {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  const generateQuestion = () => {
    const shuffledColors = shuffleArray(colors);
    currentWord.value = shuffledColors[0];

    const differentColors = colors.filter(c => c.name !== currentWord.value.name);
    currentColor.value = differentColors[Math.floor(Math.random() * differentColors.length)];

    colorOptions.value = shuffleArray([...colors]);
  };

  const startGame = () => {
    score.value = 0;
    level.value = 0;
    correctCount.value = 0;
    wrongCount.value = 0;
    feedback.value = null;
    gameState.value = 'playing';
    nextQuestion();
  };

  const nextQuestion = () => {
    level.value++;
    timeLeft.value = maxTime;
    feedback.value = null;

    if (level.value > maxLevel) {
      endGame();
      return;
    }

    generateQuestion();
    startTimer();
  };

  const startTimer = () => {
    if (timer) clearInterval(timer);
    timer = window.setInterval(() => {
      timeLeft.value -= 0.1;
      if (timeLeft.value <= 0) {
        handleTimeout();
      }
    }, 100);
  };

  const handleTimeout = () => {
    if (timer) clearInterval(timer);
    wrongCount.value++;
    feedback.value = 'wrong';
    setTimeout(() => {
      if (level.value < maxLevel) {
        nextQuestion();
      } else {
        endGame();
      }
    }, 500);
  };

  const selectColor = (color: ColorInfo) => {
    if (timer) clearInterval(timer);
    feedback.value = null;

    if (color.name === currentColor.value.name) {
      correctCount.value++;
      const bonus = Math.round(timeLeft.value * 2);
      score.value += 5 + bonus;
      feedback.value = 'correct';
    } else {
      wrongCount.value++;
      score.value = Math.max(0, score.value - 2);
      feedback.value = 'wrong';
    }

    setTimeout(() => {
      if (level.value < maxLevel) {
        nextQuestion();
      } else {
        endGame();
      }
    }, 500);
  };

  const endGame = () => {
    if (timer) clearInterval(timer);
    gameState.value = 'result';

    if (score.value > highScore.value) {
      highScore.value = score.value;
      localStorage.setItem('colorReactionHighScore', String(score.value));
    }
  };
</script>

<style scoped>
  .color-reaction-tool {
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
    color: var(--text-secondary);
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

  .game-header {
    display: flex;
    justify-content: space-around;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #eee;
    margin-bottom: 1.5rem;
  }

  .stat-box {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-box .label {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-bottom: 4px;
  }

  .stat-box .value {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--text);
  }

  .start-screen {
    text-align: center;
    padding: 2rem 0;
  }

  .color-icon {
    font-size: 5rem;
    margin-bottom: 1rem;
    animation: spin 3s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .start-screen h2 {
    margin: 0 0 0.5rem 0;
    color: var(--text);
  }

  .start-screen p {
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }

  .example {
    background: #f9f9f9;
    padding: 1rem;
    border-radius: 12px;
    margin: 1rem 0;
  }

  .example-word {
    font-size: 1.5rem;
    font-weight: bold;
  }

  .correct-answer {
    color: #3498db;
    font-weight: bold;
  }

  .start-btn {
    margin-top: 1rem;
    padding: 0.8rem 2.5rem;
    font-size: 1.1rem;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition:
      transform 0.2s,
      box-shadow 0.2s;
  }

  .start-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(155, 89, 182, 0.3);
  }

  .game-area {
    text-align: center;
    padding: 1rem 0;
  }

  .timer-bar {
    height: 8px;
    background: #eee;
    border-radius: 4px;
    margin-bottom: 2rem;
    overflow: hidden;
  }

  .timer-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--danger), var(--success));
    transition: width 0.1s linear;
  }

  .word-display {
    margin: 2rem 0;
  }

  .color-word {
    font-size: 4rem;
    font-weight: 800;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  }

  .instruction {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
  }

  .color-options {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 1rem;
  }

  .color-btn {
    height: 60px;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition:
      transform 0.2s,
      box-shadow 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .color-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .color-btn:active {
    transform: scale(0.95);
  }

  .color-name {
    color: white;
    font-weight: bold;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  }

  .feedback {
    height: 2rem;
    font-size: 1.2rem;
    font-weight: bold;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .feedback.correct {
    color: var(--success);
    opacity: 1;
  }

  .feedback.wrong {
    color: var(--danger);
    opacity: 1;
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
    margin-bottom: 0.5rem;
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

  .new-record {
    color: #e6a23c;
    font-weight: bold;
    font-size: 1.1rem;
    margin-bottom: 1rem;
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

  .result-stat .value.correct {
    color: var(--success);
  }

  .result-stat .value.wrong {
    color: var(--danger);
  }

  .rank-info {
    margin: 1.5rem 0;
    padding: 1rem;
    background: linear-gradient(135deg, #f0f7ff 0%, #fff0f5 100%);
    border-radius: 12px;
  }

  .rank-title {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }

  .rank-level {
    font-size: 1.3rem;
    font-weight: bold;
    color: var(--primary);
  }

  .retry-btn {
    padding: 0.8rem 2.5rem;
    font-size: 1rem;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .retry-btn:hover {
    transform: translateY(-2px);
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
