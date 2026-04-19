<template>
  <div class="number-memory-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>数字记忆</h1>
        <span class="nav-subtitle">Number Memory</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="game-container glass-card">
        <div class="game-header">
          <div class="stat-box">
            <span class="label">关卡</span>
            <span class="value">{{ level }}</span>
          </div>
          <div class="stat-box">
            <span class="label">最高纪录</span>
            <span class="value">{{ highLevel }}</span>
          </div>
        </div>

        <div v-if="gameState === 'idle'" class="start-screen">
          <div class="brain-icon">🧠</div>
          <h2>数字记忆挑战</h2>
          <p>记住显示的数字序列，然后按顺序输入</p>
          <p class="tip">数字会逐级增加，挑战你的记忆极限！</p>
          <button class="start-btn" @click="startGame">开始挑战</button>
        </div>

        <div v-else-if="gameState === 'showing'" class="number-display">
          <p class="hint">请记住以下数字</p>
          <div class="number-sequence">
            <span
              v-for="(digit, index) in currentNumber"
              :key="index"
              class="digit"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              {{ digit }}
            </span>
          </div>
          <p class="countdown">{{ showTime }}秒后消失...</p>
        </div>

        <div v-else-if="gameState === 'input'" class="input-area">
          <p class="hint">输入你记住的数字</p>
          <div class="input-display">
            <span
              v-for="(_, index) in currentNumber.length"
              :key="index"
              class="input-slot"
              :class="{ filled: userInput.length > index }"
            >
              {{ userInput[index] || '' }}
            </span>
          </div>
          <div class="numpad">
            <button v-for="n in 9" :key="n" class="num-btn" @click="inputNumber(n)">
              {{ n }}
            </button>
            <button class="num-btn clear" @click="clearInput">清除</button>
            <button class="num-btn" @click="inputNumber(0)">0</button>
            <button class="num-btn submit" @click="submitAnswer">确定</button>
          </div>
        </div>

        <div v-else-if="gameState === 'correct'" class="result-screen correct">
          <div class="result-icon">✨</div>
          <h2>正确!</h2>
          <p>太棒了，准备进入下一关</p>
          <p class="next-level">关卡 {{ level }} → {{ level + 1 }}</p>
        </div>

        <div v-else-if="gameState === 'wrong'" class="result-screen wrong">
          <div class="result-icon">😢</div>
          <h2>游戏结束</h2>
          <div class="answer-compare">
            <div class="compare-row">
              <span class="label">正确答案</span>
              <span class="answer correct">{{ currentNumber }}</span>
            </div>
            <div class="compare-row">
              <span class="label">你的输入</span>
              <span class="answer wrong">{{ userInput || '(无)' }}</span>
            </div>
          </div>
          <p class="final-level">最终关卡: {{ level }}</p>
          <p v-if="level > highLevel" class="new-record">🎉 新纪录!</p>
          <button class="retry-btn" @click="startGame">再来一次</button>
        </div>

        <div v-else-if="gameState === 'complete'" class="result-screen complete">
          <div class="result-icon">🏆</div>
          <h2>太厉害了!</h2>
          <p>你成功通过了 {{ level }} 关!</p>
          <p class="final-level">记忆大师认证!</p>
          <button class="retry-btn" @click="startGame">继续挑战</button>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 数字记忆</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { Back } from '@element-plus/icons-vue';

  type GameState = 'idle' | 'showing' | 'input' | 'correct' | 'wrong' | 'complete';

  const gameState = ref<GameState>('idle');
  const level = ref(1);
  const highLevel = ref(parseInt(localStorage.getItem('numberMemoryHighLevel') || '0'));
  const currentNumber = ref('');
  const userInput = ref('');
  const showTime = ref(3);

  let countdownTimer: number | null = null;

  const generateNumber = (length: number): string => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 10).toString();
    }
    return result;
  };

  const startGame = () => {
    level.value = 1;
    startLevel();
  };

  const startLevel = () => {
    const digitCount = level.value + 2;
    currentNumber.value = generateNumber(digitCount);
    userInput.value = '';
    gameState.value = 'showing';

    showTime.value = Math.max(2, Math.min(5, Math.ceil(digitCount / 2)));

    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = window.setInterval(() => {
      showTime.value--;
      if (showTime.value <= 0) {
        if (countdownTimer) clearInterval(countdownTimer);
        gameState.value = 'input';
      }
    }, 1000);
  };

  const inputNumber = (n: number) => {
    if (userInput.value.length < currentNumber.value.length) {
      userInput.value += n.toString();
    }
  };

  const clearInput = () => {
    userInput.value = '';
  };

  const submitAnswer = () => {
    if (userInput.value === currentNumber.value) {
      gameState.value = 'correct';

      if (level.value >= 15) {
        gameState.value = 'complete';
        updateHighScore();
        return;
      }

      setTimeout(() => {
        level.value++;
        updateHighScore();
        startLevel();
      }, 1500);
    } else {
      gameState.value = 'wrong';
      updateHighScore();
    }
  };

  const updateHighScore = () => {
    if (level.value > highLevel.value) {
      highLevel.value = level.value;
      localStorage.setItem('numberMemoryHighLevel', String(level.value));
    }
  };
</script>

<style scoped>
  .number-memory-tool {
    --bg: #f5f7fa;
    --card: #ffffff;
    --text: #2c3e50;
    --text-secondary: #7f8c8d;
    --primary: #409eff;
    --success: #67c23a;
    --danger: #f56c6c;

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

  .brain-icon {
    font-size: 5rem;
    margin-bottom: 1rem;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
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

  .start-screen .tip {
    font-size: 0.9rem;
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
    transition:
      transform 0.2s,
      box-shadow 0.2s;
  }

  .start-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  }

  .number-display {
    text-align: center;
    padding: 2rem 0;
  }

  .hint {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
  }

  .number-sequence {
    display: flex;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
  }

  .digit {
    font-size: 2.5rem;
    font-weight: bold;
    color: var(--primary);
    background: #f0f7ff;
    padding: 0.5rem 0.8rem;
    border-radius: 10px;
    animation: fadeIn 0.3s ease-out forwards;
    opacity: 0;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .countdown {
    color: var(--danger);
    font-weight: bold;
  }

  .input-area {
    text-align: center;
    padding: 1rem 0;
  }

  .input-display {
    display: flex;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
  }

  .input-slot {
    width: 40px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--text);
    border: 2px solid #ddd;
    border-radius: 8px;
    background: #fafafa;
    transition: all 0.2s;
  }

  .input-slot.filled {
    border-color: var(--primary);
    background: #f0f7ff;
  }

  .numpad {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    max-width: 280px;
    margin: 0 auto;
  }

  .num-btn {
    height: 50px;
    font-size: 1.3rem;
    font-weight: bold;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    background: #f5f5f5;
    color: var(--text);
    transition: all 0.2s;
  }

  .num-btn:hover {
    background: #e8e8e8;
  }

  .num-btn:active {
    transform: scale(0.95);
  }

  .num-btn.clear {
    background: #fff3f3;
    color: var(--danger);
  }

  .num-btn.clear:hover {
    background: #ffe6e6;
  }

  .num-btn.submit {
    background: var(--success);
    color: white;
  }

  .num-btn.submit:hover {
    background: #5cb630;
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
    margin: 0 0 0.5rem 0;
    color: var(--text);
  }

  .result-screen p {
    color: var(--text-secondary);
  }

  .next-level {
    font-weight: bold;
    color: var(--success);
    margin-top: 1rem;
  }

  .answer-compare {
    margin: 1.5rem 0;
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 12px;
  }

  .compare-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
  }

  .compare-row .label {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .compare-row .answer {
    font-family: monospace;
    font-size: 1.2rem;
    font-weight: bold;
    letter-spacing: 2px;
  }

  .compare-row .answer.correct {
    color: var(--success);
  }

  .compare-row .answer.wrong {
    color: var(--danger);
  }

  .final-level {
    font-size: 1.2rem;
    font-weight: bold;
    color: var(--text);
    margin-top: 1rem;
  }

  .new-record {
    color: #e6a23c;
    font-weight: bold;
    font-size: 1.1rem;
  }

  .retry-btn {
    margin-top: 1.5rem;
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
