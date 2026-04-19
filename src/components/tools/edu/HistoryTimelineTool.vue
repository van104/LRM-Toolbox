<template>
  <div class="history-timeline-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>历史年代速记</h1>
        <span class="nav-subtitle">History Timeline</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="timeline-container glass-card">
        <div class="tabs">
          <button :class="['tab', { active: activeTab === 'learn' }]" @click="activeTab = 'learn'">
            学习模式
          </button>
          <button :class="['tab', { active: activeTab === 'quiz' }]" @click="activeTab = 'quiz'">
            测验模式
          </button>
        </div>

        <!-- 学习模式 -->
        <div v-if="activeTab === 'learn'" class="learn-mode">
          <div class="era-select">
            <button
              v-for="era in eras"
              :key="era.id"
              :class="['era-btn', { active: selectedEra === era.id }]"
              @click="selectEra(era.id)"
            >
              {{ era.name }}
            </button>
          </div>

          <div class="timeline">
            <div v-for="event in filteredEvents" :key="event.id" class="timeline-item">
              <div class="year-badge">{{ event.year }}</div>
              <div class="event-card">
                <h3>{{ event.title }}</h3>
                <p>{{ event.description }}</p>
                <span class="category">{{ event.category }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 测验模式 -->
        <div v-else class="quiz-mode">
          <div class="stats-bar">
            <div class="stat">
              <span class="label">得分</span>
              <span class="value">{{ quizScore }}</span>
            </div>
            <div class="stat">
              <span class="label">题目</span>
              <span class="value">{{ currentQuestion }}/{{ totalQuestions }}</span>
            </div>
            <div class="stat">
              <span class="label">正确率</span>
              <span class="value">{{ quizAccuracy }}%</span>
            </div>
          </div>

          <div v-if="quizState === 'idle'" class="quiz-start">
            <div class="quiz-icon">📜</div>
            <h3>历史年代测验</h3>
            <p>根据历史事件，选择正确的年份</p>
            <button class="start-btn" @click="startQuiz">开始测验</button>
          </div>

          <div v-else-if="quizState === 'playing'" class="quiz-area">
            <div class="question-card">
              <p class="question-text">以下事件发生在哪一年？</p>
              <h3 class="event-title">{{ currentQuizEvent?.title }}</h3>
            </div>

            <div class="year-options">
              <button
                v-for="(option, index) in yearOptions"
                :key="index"
                :class="[
                  'year-btn',
                  {
                    selected: selectedYear === index,
                    correct: showAnswer && option === currentQuizEvent?.year,
                    wrong: showAnswer && selectedYear === index && option !== currentQuizEvent?.year
                  }
                ]"
                :disabled="showAnswer"
                @click="selectYear(index)"
              >
                {{ option }}年
              </button>
            </div>

            <div v-if="showAnswer" class="answer-info">
              <p :class="['result', isCorrect ? 'correct' : 'wrong']">
                {{ isCorrect ? '✓ 正确!' : '✗ 错误!' }}
              </p>
              <p class="description">{{ currentQuizEvent?.description }}</p>
            </div>
          </div>

          <div v-else-if="quizState === 'result'" class="quiz-result">
            <div class="result-icon">{{ quizScore >= 80 ? '🏆' : '💪' }}</div>
            <h3>测验完成!</h3>
            <div class="final-score">
              <span class="value">{{ quizScore }}</span>
              <span class="label">分</span>
            </div>
            <p class="accuracy-text">正确率: {{ quizAccuracy }}%</p>
            <button class="retry-btn" @click="resetQuiz">再测一次</button>
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 历史年代速记</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { Back } from '@element-plus/icons-vue';

  interface HistoryEvent {
    id: number;
    year: number;
    title: string;
    description: string;
    category: string;
    era: string;
  }

  const eras = [
    { id: 'ancient', name: '古代' },
    { id: 'medieval', name: '中世纪' },
    { id: 'modern', name: '近代' },
    { id: 'contemporary', name: '现代' }
  ];

  const historyEvents: HistoryEvent[] = [
    // 古代
    {
      id: 1,
      year: -221,
      title: '秦始皇统一六国',
      description: '秦始皇嬴政统一中国，建立秦朝，是中国历史上第一个统一的封建王朝。',
      category: '中国历史',
      era: 'ancient'
    },
    {
      id: 2,
      year: -206,
      title: '汉朝建立',
      description: '刘邦建立汉朝，开创了中国历史上最悠久的王朝之一。',
      category: '中国历史',
      era: 'ancient'
    },
    {
      id: 3,
      year: 105,
      title: '蔡伦改进造纸术',
      description: '东汉蔡伦改进造纸术，是中国四大发明之一。',
      category: '科技发明',
      era: 'ancient'
    },
    {
      id: 4,
      year: 618,
      title: '唐朝建立',
      description: '李渊建立唐朝，开创了中国历史上最繁荣的时代之一。',
      category: '中国历史',
      era: 'ancient'
    },
    // 中世纪
    {
      id: 5,
      year: 1066,
      title: '诺曼征服英格兰',
      description: '威廉一世征服英格兰，改变了英国的历史进程。',
      category: '世界历史',
      era: 'medieval'
    },
    {
      id: 6,
      year: 1206,
      title: '成吉思汗建立蒙古帝国',
      description: '铁木真统一蒙古各部，建立蒙古帝国。',
      category: '世界历史',
      era: 'medieval'
    },
    {
      id: 7,
      year: 1271,
      title: '元朝建立',
      description: '忽必烈建立元朝，定都大都(今北京)。',
      category: '中国历史',
      era: 'medieval'
    },
    {
      id: 8,
      year: 1368,
      title: '明朝建立',
      description: '朱元璋建立明朝，结束了蒙古人的统治。',
      category: '中国历史',
      era: 'medieval'
    },
    {
      id: 9,
      year: 1453,
      title: '君士坦丁堡陷落',
      description: '奥斯曼帝国攻陷君士坦丁堡，东罗马帝国灭亡。',
      category: '世界历史',
      era: 'medieval'
    },
    // 近代
    {
      id: 10,
      year: 1492,
      title: '哥伦布发现美洲',
      description: '哥伦布航行到达美洲，开启了地理大发现时代。',
      category: '世界历史',
      era: 'modern'
    },
    {
      id: 11,
      year: 1644,
      title: '清朝建立',
      description: '清军入关，明朝灭亡，清朝定都北京。',
      category: '中国历史',
      era: 'modern'
    },
    {
      id: 12,
      year: 1776,
      title: '美国独立',
      description: '美国发表《独立宣言》，宣布脱离英国独立。',
      category: '世界历史',
      era: 'modern'
    },
    {
      id: 13,
      year: 1789,
      title: '法国大革命',
      description: '法国大革命爆发，攻占巴士底狱。',
      category: '世界历史',
      era: 'modern'
    },
    {
      id: 14,
      year: 1840,
      title: '鸦片战争',
      description: '英国发动鸦片战争，中国近代史开端。',
      category: '中国历史',
      era: 'modern'
    },
    {
      id: 15,
      year: 1861,
      title: '美国南北战争',
      description: '美国南北战争爆发，林肯就任总统。',
      category: '世界历史',
      era: 'modern'
    },
    // 现代
    {
      id: 16,
      year: 1911,
      title: '辛亥革命',
      description: '辛亥革命爆发，清朝灭亡，中华民国成立。',
      category: '中国历史',
      era: 'contemporary'
    },
    {
      id: 17,
      year: 1914,
      title: '第一次世界大战爆发',
      description: '萨拉热窝事件引发第一次世界大战。',
      category: '世界历史',
      era: 'contemporary'
    },
    {
      id: 18,
      year: 1919,
      title: '五四运动',
      description: '五四运动在北京爆发，新民主主义革命开始。',
      category: '中国历史',
      era: 'contemporary'
    },
    {
      id: 19,
      year: 1939,
      title: '第二次世界大战爆发',
      description: '德国入侵波兰，第二次世界大战全面爆发。',
      category: '世界历史',
      era: 'contemporary'
    },
    {
      id: 20,
      year: 1949,
      title: '中华人民共和国成立',
      description: '毛泽东在天安门宣布中华人民共和国成立。',
      category: '中国历史',
      era: 'contemporary'
    },
    {
      id: 21,
      year: 1969,
      title: '人类登月',
      description: '阿波罗11号成功登月，阿姆斯特朗成为第一个踏上月球的人。',
      category: '科技发明',
      era: 'contemporary'
    },
    {
      id: 22,
      year: 1978,
      title: '改革开放',
      description: '十一届三中全会召开，中国开始改革开放。',
      category: '中国历史',
      era: 'contemporary'
    },
    {
      id: 23,
      year: 1991,
      title: '苏联解体',
      description: '苏联正式解体，冷战结束。',
      category: '世界历史',
      era: 'contemporary'
    }
  ];

  const activeTab = ref('learn');
  const selectedEra = ref('ancient');
  const quizState = ref<'idle' | 'playing' | 'result'>('idle');
  const quizScore = ref(0);
  const currentQuestion = ref(0);
  const totalQuestions = 10;
  const correctAnswers = ref(0);
  const currentQuizEvent = ref<HistoryEvent | null>(null);
  const yearOptions = ref<number[]>([]);
  const selectedYear = ref(-1);
  const showAnswer = ref(false);
  const isCorrect = ref(false);

  const filteredEvents = computed(() => {
    return historyEvents.filter(e => e.era === selectedEra.value).sort((a, b) => a.year - b.year);
  });

  const quizAccuracy = computed(() => {
    return currentQuestion.value > 0
      ? Math.round((correctAnswers.value / currentQuestion.value) * 100)
      : 0;
  });

  const selectEra = (era: string) => {
    selectedEra.value = era;
  };

  const shuffleArray = <T,>(arr: T[]): T[] => {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  const startQuiz = () => {
    quizScore.value = 0;
    currentQuestion.value = 0;
    correctAnswers.value = 0;
    quizState.value = 'playing';
    generateQuestion();
  };

  const generateQuestion = () => {
    const shuffled = shuffleArray(historyEvents);
    currentQuizEvent.value = shuffled[0];

    const correctYear = currentQuizEvent.value.year;
    const options = [correctYear];

    while (options.length < 4) {
      const offset = (Math.floor(Math.random() * 100) - 50) * (Math.random() > 0.5 ? 10 : 1);
      const fakeYear = correctYear + offset;
      if (fakeYear !== correctYear && !options.includes(fakeYear)) {
        options.push(fakeYear);
      }
    }

    yearOptions.value = shuffleArray(options);
    selectedYear.value = -1;
    showAnswer.value = false;
  };

  const selectYear = (index: number) => {
    if (showAnswer.value) return;

    selectedYear.value = index;
    showAnswer.value = true;
    currentQuestion.value++;

    isCorrect.value = yearOptions.value[index] === currentQuizEvent.value?.year;

    if (isCorrect.value) {
      correctAnswers.value++;
      quizScore.value += 10;
    }

    setTimeout(() => {
      if (currentQuestion.value >= totalQuestions) {
        quizState.value = 'result';
      } else {
        generateQuestion();
      }
    }, 2000);
  };

  const resetQuiz = () => {
    quizState.value = 'idle';
  };
</script>

<style scoped>
  .history-timeline-tool {
    --bg: #f5f7fa;
    --card: #ffffff;
    --text: #2c3e50;
    --text-secondary: #7f8c8d;
    --primary: #8e44ad;
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

  .timeline-container {
    background: var(--card);
    border-radius: 20px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
    padding: 1.5rem;
    width: 100%;
    max-width: 600px;
  }

  .tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .tab {
    flex: 1;
    padding: 0.8rem;
    border: none;
    border-radius: 10px;
    background: #f5f5f5;
    cursor: pointer;
    font-size: 1rem;
    color: var(--text-secondary);
    transition: all 0.2s;
  }

  .tab.active {
    background: var(--primary);
    color: white;
  }

  .era-select {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }

  .era-btn {
    padding: 0.5rem 1rem;
    border: 2px solid #ddd;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    color: var(--text);
  }

  .era-btn.active {
    border-color: var(--primary);
    background: #f5e6ff;
  }

  .timeline {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .timeline-item {
    display: flex;
    gap: 1rem;
  }

  .year-badge {
    min-width: 70px;
    padding: 0.5rem;
    background: var(--primary);
    color: white;
    border-radius: 8px;
    text-align: center;
    font-weight: bold;
    font-size: 0.9rem;
  }

  .event-card {
    flex: 1;
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 10px;
    border-left: 3px solid var(--primary);
  }

  .event-card h3 {
    margin: 0 0 0.3rem 0;
    font-size: 1rem;
    color: var(--text);
  }

  .event-card p {
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .event-card .category {
    font-size: 0.8rem;
    color: var(--primary);
    background: #f5e6ff;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
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

  .quiz-start {
    text-align: center;
    padding: 2rem 0;
  }
  .quiz-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
  .quiz-start h3 {
    margin: 0 0 0.5rem 0;
    color: var(--text);
  }
  .quiz-start p {
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

  .question-card {
    padding: 1.5rem;
    background: #f9f9f9;
    border-radius: 12px;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .question-text {
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }
  .event-title {
    font-size: 1.3rem;
    color: var(--text);
    margin: 0;
  }

  .year-options {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 1rem;
  }

  .year-btn {
    padding: 1rem;
    font-size: 1.2rem;
    border: 2px solid #ddd;
    border-radius: 12px;
    background: white;
    cursor: pointer;
    color: var(--text);
    transition: all 0.2s;
  }

  .year-btn:hover:not(:disabled) {
    border-color: var(--primary);
  }
  .year-btn.selected {
    border-color: var(--primary);
    background: #f5e6ff;
  }
  .year-btn.correct {
    border-color: var(--success);
    background: #e6fff0;
  }
  .year-btn.wrong {
    border-color: var(--danger);
    background: #ffe6e6;
  }
  .year-btn:disabled {
    cursor: default;
  }

  .answer-info {
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 12px;
    text-align: center;
  }

  .answer-info .result {
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  .answer-info .result.correct {
    color: var(--success);
  }
  .answer-info .result.wrong {
    color: var(--danger);
  }
  .answer-info .description {
    color: var(--text-secondary);
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .quiz-result {
    text-align: center;
    padding: 2rem 0;
  }
  .result-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
  .quiz-result h3 {
    margin: 0 0 1rem 0;
    color: var(--text);
  }
  .final-score {
    margin-bottom: 0.5rem;
  }
  .final-score .value {
    font-size: 3rem;
    font-weight: 800;
    color: var(--primary);
  }
  .final-score .label {
    font-size: 1.2rem;
    color: var(--text-secondary);
    margin-left: 4px;
  }
  .accuracy-text {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
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
