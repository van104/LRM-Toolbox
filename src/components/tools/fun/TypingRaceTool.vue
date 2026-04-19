<template>
  <div class="typing-race-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>打字竞速</h1>
        <span class="nav-subtitle">Typing Race</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="typing-container glass-card">
        <div class="stats-bar">
          <div class="stat">
            <span class="label">WPM</span>
            <span class="value">{{ wpm }}</span>
          </div>
          <div class="stat">
            <span class="label">准确率</span>
            <span class="value">{{ accuracy }}%</span>
          </div>
          <div class="stat">
            <span class="label">时间</span>
            <span class="value">{{ timeLeft }}s</span>
          </div>
          <div class="stat">
            <span class="label">最高WPM</span>
            <span class="value">{{ highWpm }}</span>
          </div>
        </div>

        <div v-if="gameState === 'idle'" class="start-screen">
          <div class="typing-icon">⌨️</div>
          <h2>打字竞速</h2>
          <p>在限定时间内尽可能快且准确地输入文字</p>
          <div class="mode-select">
            <span>模式：</span>
            <button
              v-for="m in modes"
              :key="m.id"
              :class="['mode-btn', { active: mode === m.id }]"
              @click="mode = m.id"
            >
              {{ m.name }}
            </button>
          </div>
          <div class="duration-select">
            <span>时长：</span>
            <button
              v-for="d in durations"
              :key="d.value"
              :class="['duration-btn', { active: duration === d.value }]"
              @click="duration = d.value"
            >
              {{ d.label }}
            </button>
          </div>
          <button class="start-btn" @click="startGame">开始测试</button>
        </div>

        <div v-else-if="gameState === 'playing' || gameState === 'result'" class="game-area">
          <div class="text-display">
            <span
              v-for="(char, index) in targetText"
              :key="index"
              :class="[
                'char',
                {
                  correct: index < typedText.length && typedText[index] === char,
                  wrong: index < typedText.length && typedText[index] !== char,
                  current: index === typedText.length
                }
              ]"
            >
              {{ char }}
            </span>
          </div>

          <input
            ref="inputRef"
            v-model="typedText"
            class="typing-input"
            placeholder="在此输入..."
            :disabled="gameState === 'result'"
            @input="handleInput"
            @keydown="handleKeyDown"
          />

          <div v-if="gameState === 'result'" class="result-overlay">
            <div class="result-card">
              <div class="result-icon">{{ wpm >= 80 ? '🚀' : wpm >= 50 ? '👍' : '💪' }}</div>
              <h3>测试完成!</h3>
              <div class="result-stats">
                <div class="result-stat highlight">
                  <span class="label">WPM</span>
                  <span class="value">{{ wpm }}</span>
                </div>
                <div class="result-stat">
                  <span class="label">准确率</span>
                  <span class="value">{{ accuracy }}%</span>
                </div>
                <div class="result-stat">
                  <span class="label">正确字数</span>
                  <span class="value">{{ correctChars }}</span>
                </div>
                <div class="result-stat">
                  <span class="label">错误字数</span>
                  <span class="value">{{ wrongChars }}</span>
                </div>
              </div>
              <div class="rank">
                <span class="rank-label">速度等级</span>
                <span class="rank-value">{{ speedRank }}</span>
              </div>
              <p v-if="wpm > highWpm" class="new-record">🎉 新纪录!</p>
              <button class="retry-btn" @click="startGame">再测一次</button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 打字竞速</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, nextTick } from 'vue';
  import { Back } from '@element-plus/icons-vue';

  type GameState = 'idle' | 'playing' | 'result';

  const modes = [
    { id: 'chinese', name: '中文' },
    { id: 'english', name: '英文' },
    { id: 'code', name: '代码' }
  ];

  const durations = [
    { label: '30秒', value: 30 },
    { label: '60秒', value: 60 },
    { label: '120秒', value: 120 }
  ];

  const chineseTexts = [
    '春天来了，万物复苏。小草从地下探出头来，花儿竞相开放，到处一片生机勃勃的景象。',
    '科技改变生活，创新引领未来。在这个信息爆炸的时代，我们需要不断学习新知识。',
    '读书破万卷，下笔如有神。阅读是获取知识的重要途径，让我们养成阅读的好习惯。',
    '时间如流水，一去不复返。珍惜当下，把握机会，让每一刻都充满意义。',
    '生活不止眼前的苟且，还有诗和远方。保持一颗好奇心，探索未知的世界。'
  ];

  const englishTexts = [
    'The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet.',
    'Programming is the art of telling a computer what to do. A good programmer writes code that humans can understand.',
    'Success is not final, failure is not fatal. It is the courage to continue that counts.',
    'In the middle of difficulty lies opportunity. Every challenge is a chance to grow stronger.',
    'Technology is best when it brings people together. Innovation distinguishes between a leader and a follower.'
  ];

  const codeTexts = [
    'function quickSort(arr) { if (arr.length <= 1) return arr; const pivot = arr[0]; const left = arr.filter(x => x < pivot); const right = arr.filter(x => x > pivot); return [...quickSort(left), pivot, ...quickSort(right)]; }',
    'const debounce = (fn, delay) => { let timer = null; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); }; };',
    'async function fetchData(url) { try { const response = await fetch(url); const data = await response.json(); return data; } catch (error) { console.error(error); } }'
  ];

  const mode = ref('chinese');
  const duration = ref(60);
  const gameState = ref<GameState>('idle');
  const timeLeft = ref(60);
  const targetText = ref('');
  const typedText = ref('');
  const correctChars = ref(0);
  const wrongChars = ref(0);
  const wpm = ref(0);
  const accuracy = ref(100);
  const highWpm = ref(parseInt(localStorage.getItem('typingRaceHighWpm') || '0'));
  const inputRef = ref<HTMLInputElement | null>(null);

  let timer: number | null = null;
  let startTime = 0;
  let totalTyped = 0;
  let totalCorrect = 0;

  const speedRank = computed(() => {
    if (wpm.value >= 100) return '🚀 神级打字员';
    if (wpm.value >= 80) return '⚡ 专业打字员';
    if (wpm.value >= 60) return '👍 熟练打字员';
    if (wpm.value >= 40) return '📝 普通打字员';
    return '🐢 龟速打字员';
  });

  const generateText = () => {
    let texts: string[];
    switch (mode.value) {
      case 'english':
        texts = englishTexts;
        break;
      case 'code':
        texts = codeTexts;
        break;
      default:
        texts = chineseTexts;
    }

    let result = '';
    while (result.length < 200) {
      result += texts[Math.floor(Math.random() * texts.length)] + ' ';
    }
    targetText.value = result.slice(0, 300);
  };

  const startGame = () => {
    generateText();
    typedText.value = '';
    correctChars.value = 0;
    wrongChars.value = 0;
    wpm.value = 0;
    accuracy.value = 100;
    totalTyped = 0;
    totalCorrect = 0;
    timeLeft.value = duration.value;
    gameState.value = 'playing';

    nextTick(() => {
      inputRef.value?.focus();
    });

    if (timer) clearInterval(timer);
    timer = window.setInterval(() => {
      if (timeLeft.value > 0) {
        timeLeft.value--;
        calculateStats();
      } else {
        endGame();
      }
    }, 1000);
  };

  const handleInput = () => {
    if (startTime === 0) {
      startTime = Date.now();
    }

    let correct = 0;
    let wrong = 0;
    const typed = typedText.value;

    for (let i = 0; i < typed.length; i++) {
      if (i < targetText.value.length) {
        if (typed[i] === targetText.value[i]) {
          correct++;
        } else {
          wrong++;
        }
      }
    }

    correctChars.value = correct;
    wrongChars.value = wrong;
    totalTyped = typed.length;
    totalCorrect = correct;

    calculateStats();
  };

  const handleKeyDown = () => {
    // 防止退格键修改已输入内容（可选功能）
  };

  const calculateStats = () => {
    if (startTime === 0) return;

    const elapsedMinutes = (Date.now() - startTime) / 60000;
    if (elapsedMinutes > 0) {
      const words = mode.value === 'chinese' ? totalCorrect : totalCorrect / 5;
      wpm.value = Math.round(words / elapsedMinutes);
    }

    if (totalTyped > 0) {
      accuracy.value = Math.round((totalCorrect / totalTyped) * 100);
    }
  };

  const endGame = () => {
    if (timer) clearInterval(timer);
    gameState.value = 'result';
    calculateStats();

    if (wpm.value > highWpm.value) {
      highWpm.value = wpm.value;
      localStorage.setItem('typingRaceHighWpm', String(wpm.value));
    }
  };

  watch(gameState, newState => {
    if (newState === 'playing') {
      startTime = 0;
    }
  });
</script>

<style scoped>
  .typing-race-tool {
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

  .typing-container {
    background: var(--card);
    border-radius: 20px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
    padding: 1.5rem;
    width: 100%;
    max-width: 800px;
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
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--text);
  }

  .start-screen {
    text-align: center;
    padding: 2rem 0;
  }
  .typing-icon {
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

  .mode-select,
  .duration-select {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .mode-btn,
  .duration-btn {
    padding: 0.5rem 1rem;
    border: 2px solid #ddd;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    color: var(--text);
    transition: all 0.2s;
  }

  .mode-btn.active,
  .duration-btn.active {
    border-color: var(--primary);
    background: var(--primary);
    color: white;
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
  }

  .game-area {
    position: relative;
  }

  .text-display {
    background: #f9f9f9;
    padding: 1.5rem;
    border-radius: 12px;
    font-size: 1.2rem;
    line-height: 2;
    margin-bottom: 1rem;
    min-height: 120px;
  }

  .char {
    transition: all 0.1s;
  }

  .char.correct {
    color: var(--success);
  }
  .char.wrong {
    color: var(--danger);
    background: #ffe6e6;
    border-radius: 2px;
  }
  .char.current {
    background: var(--primary);
    color: white;
    border-radius: 2px;
  }

  .typing-input {
    width: 100%;
    padding: 1rem;
    font-size: 1.1rem;
    border: 2px solid #ddd;
    border-radius: 12px;
    outline: none;
    transition: border-color 0.2s;
    font-family: inherit;
  }

  .typing-input:focus {
    border-color: var(--primary);
  }

  .result-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
  }

  .result-card {
    text-align: center;
    padding: 2rem;
  }

  .result-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
  .result-card h3 {
    margin: 0 0 1.5rem 0;
    color: var(--text);
  }

  .result-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .result-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 10px;
  }

  .result-stat.highlight {
    background: #e6f0ff;
  }

  .result-stat .label {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }
  .result-stat .value {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--text);
  }

  .rank {
    padding: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    margin-bottom: 1rem;
  }

  .rank-label {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.8);
  }
  .rank-value {
    display: block;
    font-size: 1.3rem;
    font-weight: bold;
    color: white;
    margin-top: 0.5rem;
  }

  .new-record {
    color: #e6a23c;
    font-weight: bold;
    margin-bottom: 1rem;
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
