<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="goBack"
          ><el-icon>
            <ArrowLeft /> </el-icon
          ><span>返回</span></el-button
        >
      </div>
      <div class="header-center">
        <h1 class="tool-title">打字速度测试</h1>
        <span class="tool-subtitle">Typing Speed Test</span>
      </div>
      <div class="header-right">
        <el-button @click="resetTest"
          ><el-icon>
            <Refresh />
          </el-icon>
          重置</el-button
        >
      </div>
    </header>

    <main class="tool-content">
      <div class="stats-bar glass-card">
        <div class="stat">
          <div class="value">{{ wpm }}</div>
          <div class="label">WPM</div>
        </div>
        <div class="stat">
          <div class="value">{{ accuracy }}%</div>
          <div class="label">准确率</div>
        </div>
        <div class="stat">
          <div class="value">{{ timeLeft }}s</div>
          <div class="label">倒计时</div>
        </div>
      </div>

      <div class="typing-area glass-card" @click="focusInput">
        <div class="words-container" :style="{ transform: `translateY(-${currentRow * 36}px)` }">
          <div
            v-for="(word, wIdx) in words"
            :key="wIdx"
            class="word"
            :class="{
              active: currentWordIdx === wIdx,
              error: wordStates[wIdx] === 'error',
              success: wordStates[wIdx] === 'success'
            }"
          >
            <span
              v-for="(char, cIdx) in word"
              :key="cIdx"
              class="char"
              :class="getCharClass(wIdx, cIdx)"
              >{{ char }}</span
            >
          </div>
        </div>
        <input
          ref="inputRef"
          v-model="userInput"
          type="text"
          class="hidden-input"
          :disabled="isFinished"
          @input="handleInput"
          @keydown="handleKeydown"
        />
        <div v-if="!isActive && !isFinished" class="start-hint">点击此处或按任意键开始测试</div>
        <div v-if="isFinished" class="result-overlay">
          <h3>测试完成！</h3>
          <div class="final-stats">WPM: {{ wpm }} | 准确率: {{ accuracy }}%</div>
          <el-button type="primary" size="large" @click="resetTest">再练一次</el-button>
        </div>
      </div>

      <div class="settings-panel glass-card">
        <el-radio-group v-model="mode" @change="resetTest">
          <el-radio-button label="english">英文单词</el-radio-button>
          <el-radio-button label="code">代码片段</el-radio-button>
        </el-radio-group>
        <el-radio-group v-model="duration" @change="resetTest">
          <el-radio-button :label="30">30秒</el-radio-button>
          <el-radio-button :label="60">60秒</el-radio-button>
        </el-radio-group>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - 打字速度测试</footer>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
  import { useRouter } from 'vue-router';
  import { ArrowLeft, Refresh } from '@element-plus/icons-vue';

  const router = useRouter();
  const goBack = () => router.back();
  const inputRef = ref(null);

  const mode = ref('english');
  const duration = ref(60);
  const timeLeft = ref(60);
  const isActive = ref(false);
  const isFinished = ref(false);
  const userInput = ref('');
  const currentWordIdx = ref(0);
  const currentRow = ref(0);

  const words = ref([]);
  const wordStates = ref([]);

  const wpm = ref(0);
  const correctChars = ref(0);
  const totalChars = ref(0);
  let timerId = null;

  const englishWords =
    'the be to of and a in that have I it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us'.split(
      ' '
    );
  const codeSnippets =
    'const let var function return import export default class extends constructor super this if else for while switch case break continue try catch throw new delete typeof instanceof void await async Promise'.split(
      ' '
    );

  const generateWords = () => {
    const list = mode.value === 'english' ? englishWords : codeSnippets;
    const result = [];
    for (let i = 0; i < 500; i++) result.push(list[Math.floor(Math.random() * list.length)]);
    words.value = result;
    wordStates.value = new Array(result.length).fill('pending');
  };

  const accuracy = computed(() => {
    if (totalChars.value === 0) return 100;
    return Math.round((correctChars.value / totalChars.value) * 100);
  });

  const focusInput = () => {
    if (!isFinished.value) {
      inputRef.value?.focus();
    }
  };

  const startTest = () => {
    if (isActive.value || isFinished.value) return;
    isActive.value = true;
    timeLeft.value = duration.value;
    timerId = setInterval(() => {
      timeLeft.value--;
      updateWpm();
      if (timeLeft.value <= 0) finishTest();
    }, 1000);
  };

  const finishTest = () => {
    clearInterval(timerId);
    isActive.value = false;
    isFinished.value = true;
    updateWpm();
  };

  const resetTest = () => {
    clearInterval(timerId);
    isActive.value = false;
    isFinished.value = false;
    timeLeft.value = duration.value;
    userInput.value = '';
    currentWordIdx.value = 0;
    currentRow.value = 0;
    correctChars.value = 0;
    totalChars.value = 0;
    wpm.value = 0;
    generateWords();
    nextTick(() => inputRef.value?.focus());
  };

  const updateWpm = () => {
    const timeElapsed = duration.value - timeLeft.value;
    if (timeElapsed === 0) return;

    wpm.value = Math.round(correctChars.value / 5 / (timeElapsed / 60));
  };

  const handleInput = () => {
    if (!isActive.value && !isFinished.value) startTest();
  };

  const handleKeydown = e => {
    if (!isActive.value && !isFinished.value) startTest();

    if (e.key === ' ') {
      e.preventDefault();
      const input = userInput.value;
      const target = words.value[currentWordIdx.value];

      totalChars.value += target.length + 1;
      if (input === target) {
        wordStates.value[currentWordIdx.value] = 'success';
        correctChars.value += target.length + 1;
      } else {
        wordStates.value[currentWordIdx.value] = 'error';
      }

      userInput.value = '';
      currentWordIdx.value++;

      if (currentWordIdx.value > 0 && currentWordIdx.value % 10 === 0) {
        currentRow.value++;
      }

      nextTick(() => {
        const activeEl = document.querySelector('.word.active');
        if (activeEl && activeEl.offsetTop > (currentRow.value + 1) * 36) {
          currentRow.value++;
        }
      });
    }
  };

  const getCharClass = (wIdx, cIdx) => {
    if (wIdx !== currentWordIdx.value) return '';
    const input = userInput.value;
    if (cIdx >= input.length) return '';
    return input[cIdx] === words.value[wIdx][cIdx] ? 'correct' : 'wrong';
  };

  onMounted(() => {
    generateWords();
  });
  onUnmounted(() => {
    clearInterval(timerId);
  });
</script>

<style scoped>
  .tool-page {
    min-height: 100vh;
    background: #f8fafc;
    color: #1e293b;
    display: flex;
    flex-direction: column;
  }

  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .tool-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }

  .tool-subtitle {
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
  }

  .tool-content {
    flex: 1;
    padding: 2rem;
    max-width: 1000px;
    margin: 0 auto;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .stats-bar {
    display: flex;
    gap: 2rem;
    justify-content: center;
    padding: 1.5rem;
  }

  .stat {
    text-align: center;
  }

  .stat .value {
    font-size: 2.5rem;
    font-weight: 700;
    color: #3b82f6;
    line-height: 1;
  }

  .stat .label {
    font-size: 0.85rem;
    color: #64748b;
    margin-top: 0.25rem;
  }

  .typing-area {
    position: relative;
    height: 200px;
    padding: 1rem;
    border-radius: 12px;
    font-family: 'Roboto Mono', monospace;
    font-size: 1.5rem;
    line-height: 36px;
    overflow: hidden;
    cursor: text;
    background: #fff;
    border: 1px solid #e2e8f0;
  }

  .words-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    transition: transform 0.2s;
  }

  .word {
    color: #94a3b8;
    padding: 0 4px;
    border-radius: 4px;
  }

  .word.active {
    background: rgba(59, 130, 246, 0.1);
    color: #1e293b;
  }

  .word.error {
    color: #ef4444;
    text-decoration: line-through;
  }

  .word.success {
    color: #22c55e;
  }

  .char.correct {
    color: #334155;
  }

  .char.wrong {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }

  .hidden-input {
    position: absolute;
    opacity: 0;
    z-index: -1;
  }

  .start-hint {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(2px);
    font-size: 1.2rem;
    color: #334155;
    z-index: 10;
    cursor: pointer;
  }

  .result-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.95);
    z-index: 20;
    color: #1e293b;
  }

  .result-overlay h3 {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #3b82f6;
  }

  .final-stats {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    color: #475569;
  }

  .settings-panel {
    display: flex;
    justify-content: center;
    gap: 2rem;
    padding: 1.5rem;
  }

  .glass-card {
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }
</style>
