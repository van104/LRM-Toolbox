<template>
  <div class="mental-math-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>数学口算练习</h1>
        <span class="nav-subtitle">Mental Math</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="math-container glass-card">
        <div class="stats-bar">
          <div class="stat">
            <span class="label">得分</span>
            <span class="value">{{ score }}</span>
          </div>
          <div class="stat">
            <span class="label">连对</span>
            <span class="value">{{ streak }}</span>
          </div>
          <div class="stat">
            <span class="label">正确率</span>
            <span class="value">{{ accuracy }}%</span>
          </div>
        </div>

        <div v-if="gameState === 'idle'" class="start-screen">
          <div class="math-icon">🔢</div>
          <h2>口算练习</h2>
          <p>提升心算能力，挑战更高分数！</p>

          <div class="difficulty-select">
            <h3>选择难度</h3>
            <div class="difficulties">
              <button
                v-for="d in difficulties"
                :key="d.id"
                :class="['diff-btn', { active: difficulty === d.id }]"
                @click="difficulty = d.id"
              >
                <span class="name">{{ d.name }}</span>
                <span class="desc">{{ d.desc }}</span>
              </button>
            </div>
          </div>

          <div class="operation-select">
            <h3>运算类型</h3>
            <div class="operations">
              <button
                v-for="op in operationTypes"
                :key="op.id"
                :class="['op-btn', { active: selectedOps.includes(op.id) }]"
                @click="toggleOp(op.id)"
              >
                {{ op.symbol }} {{ op.name }}
              </button>
            </div>
          </div>

          <button class="start-btn" :disabled="selectedOps.length === 0" @click="startGame">
            开始练习
          </button>
        </div>

        <div v-else-if="gameState === 'playing'" class="game-area">
          <div class="timer-bar">
            <div class="timer-fill" :style="{ width: `${(timeLeft / totalTime) * 100}%` }"></div>
          </div>

          <div class="question-card">
            <div class="question">
              <span class="num">{{ currentQuestion.num1 }}</span>
              <span class="op">{{ currentQuestion.opSymbol }}</span>
              <span class="num">{{ currentQuestion.num2 }}</span>
              <span class="equals">=</span>
              <span class="answer">?</span>
            </div>
          </div>

          <div class="input-area">
            <input
              ref="inputRef"
              v-model="userAnswer"
              type="number"
              class="answer-input"
              placeholder="输入答案"
              @keyup.enter="submitAnswer"
              @keydown="handleKeyDown"
            />
            <button class="submit-btn" @click="submitAnswer">确定</button>
          </div>

          <div class="feedback" :class="feedback">
            <span v-if="feedback === 'correct'">✓ 正确! +{{ pointsEarned }}分</span>
            <span v-else-if="feedback === 'wrong'">✗ 错误! 答案: {{ currentQuestion.answer }}</span>
          </div>
        </div>

        <div v-else-if="gameState === 'result'" class="result-screen">
          <div class="result-icon">{{ getGrade }}</div>
          <h2>练习完成!</h2>
          <div class="final-score">
            <span class="score-value">{{ score }}</span>
            <span class="score-label">分</span>
          </div>

          <div class="result-stats">
            <div class="result-stat">
              <span class="label">总题数</span>
              <span class="value">{{ totalQuestions }}</span>
            </div>
            <div class="result-stat">
              <span class="label">正确</span>
              <span class="value correct">{{ correctCount }}</span>
            </div>
            <div class="result-stat">
              <span class="label">错误</span>
              <span class="value wrong">{{ wrongCount }}</span>
            </div>
            <div class="result-stat">
              <span class="label">最长连对</span>
              <span class="value">{{ maxStreak }}</span>
            </div>
          </div>

          <button class="retry-btn" @click="resetGame">再来一次</button>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 数学口算练习</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, nextTick } from 'vue';
  import { Back } from '@element-plus/icons-vue';

  type GameState = 'idle' | 'playing' | 'result';

  interface Question {
    num1: number;
    num2: number;
    op: string;
    opSymbol: string;
    answer: number;
  }

  const difficulties = [
    { id: 'easy', name: '简单', desc: '10以内加减法' },
    { id: 'medium', name: '中等', desc: '100以内四则' },
    { id: 'hard', name: '困难', desc: '1000以内四则' }
  ];

  const operationTypes = [
    { id: 'add', name: '加法', symbol: '+' },
    { id: 'sub', name: '减法', symbol: '-' },
    { id: 'mul', name: '乘法', symbol: '×' },
    { id: 'div', name: '除法', symbol: '÷' }
  ];

  const gameState = ref<GameState>('idle');
  const difficulty = ref('medium');
  const selectedOps = ref<string[]>(['add', 'sub']);
  const score = ref(0);
  const streak = ref(0);
  const maxStreak = ref(0);
  const correctCount = ref(0);
  const wrongCount = ref(0);
  const totalQuestions = ref(0);
  const timeLeft = ref(60);
  const totalTime = ref(60);
  const currentQuestion = ref<Question>({ num1: 0, num2: 0, op: 'add', opSymbol: '+', answer: 0 });
  const userAnswer = ref('');
  const feedback = ref<'correct' | 'wrong' | null>(null);
  const pointsEarned = ref(0);
  const inputRef = ref<HTMLInputElement | null>(null);

  let timer: number | null = null;

  const accuracy = computed(() => {
    const total = correctCount.value + wrongCount.value;
    return total > 0 ? Math.round((correctCount.value / total) * 100) : 100;
  });

  const getGrade = computed(() => {
    if (accuracy.value >= 95 && correctCount.value >= 20) return '🏆 数学天才';
    if (accuracy.value >= 90) return '⭐ 优秀';
    if (accuracy.value >= 80) return '👍 良好';
    if (accuracy.value >= 60) return '💪 及格';
    return '📚 继续努力';
  });

  const toggleOp = (op: string) => {
    const index = selectedOps.value.indexOf(op);
    if (index > -1) {
      if (selectedOps.value.length > 1) {
        selectedOps.value.splice(index, 1);
      }
    } else {
      selectedOps.value.push(op);
    }
  };

  const getRandomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const generateQuestion = (): Question => {
    const op = selectedOps.value[Math.floor(Math.random() * selectedOps.value.length)];
    let num1: number, num2: number, answer: number;
    let opSymbol = '';

    const limits = {
      easy: { max: 10, mulMax: 5 },
      medium: { max: 100, mulMax: 12 },
      hard: { max: 1000, mulMax: 20 }
    };
    const limit = limits[difficulty.value as keyof typeof limits];

    switch (op) {
      case 'add':
        num1 = getRandomInt(1, limit.max);
        num2 = getRandomInt(1, limit.max);
        answer = num1 + num2;
        opSymbol = '+';
        break;
      case 'sub':
        num1 = getRandomInt(2, limit.max);
        num2 = getRandomInt(1, num1 - 1);
        answer = num1 - num2;
        opSymbol = '-';
        break;
      case 'mul':
        num1 = getRandomInt(1, limit.mulMax);
        num2 = getRandomInt(1, limit.mulMax);
        answer = num1 * num2;
        opSymbol = '×';
        break;
      case 'div':
        num2 = getRandomInt(1, limit.mulMax);
        answer = getRandomInt(1, limit.mulMax);
        num1 = num2 * answer;
        opSymbol = '÷';
        break;
      default:
        num1 = 1;
        num2 = 1;
        answer = 2;
        opSymbol = '+';
    }

    return { num1, num2, op, opSymbol, answer };
  };

  const startGame = () => {
    score.value = 0;
    streak.value = 0;
    maxStreak.value = 0;
    correctCount.value = 0;
    wrongCount.value = 0;
    totalQuestions.value = 0;
    timeLeft.value = 60;
    feedback.value = null;
    userAnswer.value = '';
    gameState.value = 'playing';

    nextTick(() => {
      inputRef.value?.focus();
    });

    currentQuestion.value = generateQuestion();

    if (timer) clearInterval(timer);
    timer = window.setInterval(() => {
      timeLeft.value--;
      if (timeLeft.value <= 0) {
        endGame();
      }
    }, 1000);
  };

  const submitAnswer = () => {
    if (userAnswer.value === '') return;

    const answer = parseInt(userAnswer.value);
    totalQuestions.value++;

    if (answer === currentQuestion.value.answer) {
      correctCount.value++;
      streak.value++;
      if (streak.value > maxStreak.value) {
        maxStreak.value = streak.value;
      }
      pointsEarned.value = 10 + Math.min(streak.value, 10);
      score.value += pointsEarned.value;
      feedback.value = 'correct';
    } else {
      wrongCount.value++;
      streak.value = 0;
      pointsEarned.value = 0;
      feedback.value = 'wrong';
    }

    userAnswer.value = '';

    setTimeout(() => {
      feedback.value = null;
      currentQuestion.value = generateQuestion();
      inputRef.value?.focus();
    }, 800);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === '-' && userAnswer.value === '') {
      // Allow negative sign at start
    }
  };

  const endGame = () => {
    if (timer) clearInterval(timer);
    gameState.value = 'result';
  };

  const resetGame = () => {
    gameState.value = 'idle';
  };
</script>

<style scoped>
  .mental-math-tool {
    --bg: #f5f7fa;
    --card: #ffffff;
    --text: #2c3e50;
    --text-secondary: #7f8c8d;
    --primary: #27ae60;
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

  .math-container {
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
    padding: 1rem 0;
  }
  .math-icon {
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

  .difficulty-select,
  .operation-select {
    margin-bottom: 1.5rem;
    text-align: left;
  }
  .difficulty-select h3,
  .operation-select h3 {
    font-size: 0.95rem;
    margin: 0 0 0.8rem 0;
    color: var(--text);
  }

  .difficulties {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .diff-btn {
    display: flex;
    justify-content: space-between;
    padding: 1rem;
    border: 2px solid #ddd;
    border-radius: 10px;
    background: white;
    cursor: pointer;
    color: var(--text);
  }
  .diff-btn.active {
    border-color: var(--primary);
    background: #e6fff0;
  }
  .diff-btn .desc {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .operations {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .op-btn {
    padding: 0.6rem 1rem;
    border: 2px solid #ddd;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    color: var(--text);
    font-size: 0.9rem;
  }
  .op-btn.active {
    border-color: var(--primary);
    background: #e6fff0;
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
  .start-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .game-area {
    text-align: center;
  }

  .timer-bar {
    height: 6px;
    background: #eee;
    border-radius: 3px;
    margin-bottom: 1.5rem;
    overflow: hidden;
  }

  .timer-fill {
    height: 100%;
    background: var(--primary);
    transition: width 0.1s linear;
  }

  .question-card {
    padding: 2rem;
    background: #f9f9f9;
    border-radius: 16px;
    margin-bottom: 1.5rem;
  }

  .question {
    font-size: 2.5rem;
    font-weight: bold;
    color: var(--text);
  }

  .question .op {
    margin: 0 0.5rem;
    color: var(--primary);
  }
  .question .equals {
    margin: 0 0.5rem;
  }
  .question .answer {
    color: var(--danger);
  }

  .input-area {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .answer-input {
    flex: 1;
    padding: 1rem;
    font-size: 1.5rem;
    text-align: center;
    border: 2px solid #ddd;
    border-radius: 12px;
    outline: none;
  }

  .answer-input:focus {
    border-color: var(--primary);
  }

  .submit-btn {
    padding: 0 1.5rem;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-size: 1.1rem;
    font-weight: bold;
  }

  .feedback {
    height: 2rem;
    font-size: 1.1rem;
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
    padding: 1.5rem 0;
  }
  .result-icon {
    font-size: 3rem;
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
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
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
