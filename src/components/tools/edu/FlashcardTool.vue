<template>
  <div class="flashcard-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>单词记忆卡片</h1>
        <span class="nav-subtitle">Flashcard</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="flashcard-container glass-card">
        <div class="stats-bar">
          <div class="stat">
            <span class="label">已学习</span>
            <span class="value">{{ learnedCount }}</span>
          </div>
          <div class="stat">
            <span class="label">正确率</span>
            <span class="value">{{ accuracy }}%</span>
          </div>
          <div class="stat">
            <span class="label">剩余</span>
            <span class="value">{{ currentDeck.length - currentIndex }}</span>
          </div>
        </div>

        <div v-if="gameState === 'idle'" class="start-screen">
          <div class="card-icon">📚</div>
          <h2>单词记忆卡片</h2>
          <p>通过闪卡方式高效记忆单词</p>

          <div class="category-select">
            <h3>选择词库</h3>
            <div class="categories">
              <button
                v-for="cat in categories"
                :key="cat.id"
                :class="['cat-btn', { active: selectedCategory === cat.id }]"
                @click="selectedCategory = cat.id"
              >
                {{ cat.name }}
                <span class="count">{{ cat.count }}词</span>
              </button>
            </div>
          </div>

          <button class="start-btn" @click="startLearning">开始学习</button>
        </div>

        <div v-else-if="gameState === 'learning'" class="learning-area">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: `${(currentIndex / currentDeck.length) * 100}%` }"
            ></div>
          </div>

          <div class="flashcard" :class="{ flipped: isFlipped }" @click="flipCard">
            <div class="card-front">
              <p class="word">{{ currentCard.word }}</p>
              <p v-if="currentCard.phonetic" class="phonetic">{{ currentCard.phonetic }}</p>
              <button class="speak-btn" @click.stop="speakWord">🔊</button>
            </div>
            <div class="card-back">
              <p class="meaning">{{ currentCard.meaning }}</p>
              <p v-if="currentCard.example" class="example">{{ currentCard.example }}</p>
            </div>
          </div>

          <p class="hint">点击卡片翻转查看释义</p>

          <div class="action-buttons">
            <button class="action-btn wrong" @click="markCard(false)">✗ 不认识</button>
            <button class="action-btn correct" @click="markCard(true)">✓ 认识</button>
          </div>
        </div>

        <div v-else-if="gameState === 'result'" class="result-screen">
          <div class="result-icon">{{ accuracy >= 80 ? '🎉' : '💪' }}</div>
          <h2>学习完成!</h2>
          <div class="result-stats">
            <div class="result-stat">
              <span class="label">总计</span>
              <span class="value">{{ currentDeck.length }}词</span>
            </div>
            <div class="result-stat">
              <span class="label">认识</span>
              <span class="value correct">{{ correctCount }}</span>
            </div>
            <div class="result-stat">
              <span class="label">不认识</span>
              <span class="value wrong">{{ wrongCount }}</span>
            </div>
          </div>

          <div v-if="wrongCards.length > 0" class="review-section">
            <h3>需要复习的单词</h3>
            <div class="wrong-list">
              <div v-for="card in wrongCards" :key="card.word" class="wrong-item">
                <span class="word">{{ card.word }}</span>
                <span class="meaning">{{ card.meaning }}</span>
              </div>
            </div>
          </div>

          <div class="result-actions">
            <button v-if="wrongCards.length > 0" class="retry-btn" @click="reviewWrongCards">
              复习错词
            </button>
            <button class="retry-btn" @click="resetLearning">重新开始</button>
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 单词记忆卡片</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { Back } from '@element-plus/icons-vue';

  interface WordCard {
    word: string;
    phonetic?: string;
    meaning: string;
    example?: string;
  }

  interface Category {
    id: string;
    name: string;
    count: number;
    words: WordCard[];
  }

  const categories: Category[] = [
    {
      id: 'basic',
      name: '基础词汇',
      count: 20,
      words: [
        {
          word: 'apple',
          phonetic: '/ˈæpl/',
          meaning: 'n. 苹果',
          example: 'I eat an apple every day.'
        },
        {
          word: 'book',
          phonetic: '/bʊk/',
          meaning: 'n. 书籍 v. 预订',
          example: 'This is a good book.'
        },
        { word: 'cat', phonetic: '/kæt/', meaning: 'n. 猫', example: 'The cat is sleeping.' },
        { word: 'dog', phonetic: '/dɔːɡ/', meaning: 'n. 狗', example: 'I have a dog.' },
        { word: 'eat', phonetic: '/iːt/', meaning: 'v. 吃', example: 'I eat breakfast at 7am.' },
        {
          word: 'flower',
          phonetic: '/ˈflaʊər/',
          meaning: 'n. 花',
          example: 'The flower is beautiful.'
        },
        { word: 'good', phonetic: '/ɡʊd/', meaning: 'adj. 好的', example: 'Good morning!' },
        { word: 'happy', phonetic: '/ˈhæpi/', meaning: 'adj. 快乐的', example: 'I am very happy.' },
        { word: 'idea', phonetic: '/aɪˈdiːə/', meaning: 'n. 主意，想法', example: 'Good idea!' },
        { word: 'jump', phonetic: '/dʒʌmp/', meaning: 'v. 跳跃', example: 'Can you jump high?' },
        {
          word: 'kind',
          phonetic: '/kaɪnd/',
          meaning: 'adj. 友好的 n. 种类',
          example: 'She is very kind.'
        },
        { word: 'love', phonetic: '/lʌv/', meaning: 'n./v. 爱', example: 'I love my family.' },
        {
          word: 'money',
          phonetic: '/ˈmʌni/',
          meaning: 'n. 钱',
          example: 'Money is not everything.'
        },
        { word: 'name', phonetic: '/neɪm/', meaning: 'n. 名字', example: 'What is your name?' },
        {
          word: 'open',
          phonetic: '/ˈoʊpən/',
          meaning: 'v. 打开 adj. 开放的',
          example: 'Please open the door.'
        },
        {
          word: 'people',
          phonetic: '/ˈpiːpl/',
          meaning: 'n. 人们',
          example: 'Many people like music.'
        },
        {
          word: 'question',
          phonetic: '/ˈkwestʃən/',
          meaning: 'n. 问题',
          example: 'Good question!'
        },
        { word: 'run', phonetic: '/rʌn/', meaning: 'v. 跑', example: 'I run every morning.' },
        {
          word: 'school',
          phonetic: '/skuːl/',
          meaning: 'n. 学校',
          example: 'I go to school by bus.'
        },
        { word: 'time', phonetic: '/taɪm/', meaning: 'n. 时间', example: 'What time is it?' }
      ]
    },
    {
      id: 'toefl',
      name: '托福核心',
      count: 20,
      words: [
        {
          word: 'abandon',
          phonetic: '/əˈbændən/',
          meaning: 'v. 放弃，抛弃',
          example: 'Never abandon your dreams.'
        },
        {
          word: 'benefit',
          phonetic: '/ˈbenɪfɪt/',
          meaning: 'n. 利益 v. 有益于',
          example: 'Exercise benefits health.'
        },
        {
          word: 'challenge',
          phonetic: '/ˈtʃælɪndʒ/',
          meaning: 'n./v. 挑战',
          example: 'I accept the challenge.'
        },
        {
          word: 'demonstrate',
          phonetic: '/ˈdemənstreɪt/',
          meaning: 'v. 证明，演示',
          example: 'Let me demonstrate.'
        },
        {
          word: 'establish',
          phonetic: '/ɪˈstæblɪʃ/',
          meaning: 'v. 建立',
          example: 'They established a company.'
        },
        {
          word: 'fundamental',
          phonetic: '/ˌfʌndəˈmentl/',
          meaning: 'adj. 基础的',
          example: 'This is fundamental.'
        },
        {
          word: 'generate',
          phonetic: '/ˈdʒenəreɪt/',
          meaning: 'v. 产生，生成',
          example: 'Solar panels generate electricity.'
        },
        {
          word: 'hypothesis',
          phonetic: '/haɪˈpɒθəsɪs/',
          meaning: 'n. 假设',
          example: 'This is just a hypothesis.'
        },
        {
          word: 'implement',
          phonetic: '/ˈɪmplɪment/',
          meaning: 'v. 实施',
          example: 'We will implement the plan.'
        },
        {
          word: 'justify',
          phonetic: '/ˈdʒʌstɪfaɪ/',
          meaning: 'v. 证明...合理',
          example: 'How do you justify this?'
        },
        {
          word: 'maintain',
          phonetic: '/meɪnˈteɪn/',
          meaning: 'v. 维持，维护',
          example: 'Maintain good habits.'
        },
        {
          word: 'necessary',
          phonetic: '/ˈnesəseri/',
          meaning: 'adj. 必要的',
          example: 'Is it necessary?'
        },
        {
          word: 'obvious',
          phonetic: '/ˈɒbviəs/',
          meaning: 'adj. 明显的',
          example: 'The answer is obvious.'
        },
        {
          word: 'potential',
          phonetic: '/pəˈtenʃl/',
          meaning: 'adj. 潜在的 n. 潜力',
          example: 'He has great potential.'
        },
        {
          word: 'require',
          phonetic: '/rɪˈkwaɪər/',
          meaning: 'v. 需要',
          example: 'This requires patience.'
        },
        {
          word: 'significant',
          phonetic: '/sɪɡˈnɪfɪkənt/',
          meaning: 'adj. 重要的',
          example: 'A significant change.'
        },
        {
          word: 'theory',
          phonetic: '/ˈθɪəri/',
          meaning: 'n. 理论',
          example: 'In theory, it works.'
        },
        {
          word: 'unique',
          phonetic: '/juˈniːk/',
          meaning: 'adj. 独特的',
          example: 'Everyone is unique.'
        },
        {
          word: 'various',
          phonetic: '/ˈveəriəs/',
          meaning: 'adj. 各种各样的',
          example: 'Various options available.'
        },
        {
          word: 'widespread',
          phonetic: '/ˈwaɪdspred/',
          meaning: 'adj. 广泛的',
          example: 'Widespread support.'
        }
      ]
    },
    {
      id: 'programming',
      name: '编程术语',
      count: 20,
      words: [
        {
          word: 'algorithm',
          phonetic: '/ˈælɡərɪðəm/',
          meaning: 'n. 算法',
          example: 'Sorting algorithm.'
        },
        { word: 'bug', phonetic: '/bʌɡ/', meaning: 'n. 程序错误', example: 'I found a bug.' },
        {
          word: 'compile',
          phonetic: '/kəmˈpaɪl/',
          meaning: 'v. 编译',
          example: 'Compile the code.'
        },
        { word: 'debug', phonetic: '/diːˈbʌɡ/', meaning: 'v. 调试', example: 'Debug the program.' },
        {
          word: 'function',
          phonetic: '/ˈfʌŋkʃn/',
          meaning: 'n. 函数',
          example: 'Define a function.'
        },
        {
          word: 'variable',
          phonetic: '/ˈveəriəbl/',
          meaning: 'n. 变量',
          example: 'Declare a variable.'
        },
        { word: 'loop', phonetic: '/luːp/', meaning: 'n. 循环', example: 'For loop.' },
        { word: 'array', phonetic: '/əˈreɪ/', meaning: 'n. 数组', example: 'An array of numbers.' },
        {
          word: 'object',
          phonetic: '/ˈɒbdʒekt/',
          meaning: 'n. 对象',
          example: 'Create an object.'
        },
        { word: 'class', phonetic: '/klɑːs/', meaning: 'n. 类', example: 'Define a class.' },
        {
          word: 'interface',
          phonetic: '/ˈɪntəfeɪs/',
          meaning: 'n. 接口',
          example: 'User interface.'
        },
        {
          word: 'framework',
          phonetic: '/ˈfreɪmwɜːk/',
          meaning: 'n. 框架',
          example: 'Vue framework.'
        },
        {
          word: 'library',
          phonetic: '/ˈlaɪbrəri/',
          meaning: 'n. 库',
          example: 'Standard library.'
        },
        {
          word: 'database',
          phonetic: '/ˈdeɪtəbeɪs/',
          meaning: 'n. 数据库',
          example: 'MySQL database.'
        },
        {
          word: 'API',
          phonetic: '/ˌeɪ piː aɪ/',
          meaning: 'n. 应用程序接口',
          example: 'RESTful API.'
        },
        {
          word: 'deployment',
          phonetic: '/dɪˈplɔɪmənt/',
          meaning: 'n. 部署',
          example: 'Server deployment.'
        },
        {
          word: 'repository',
          phonetic: '/rɪˈpɒzətɔːri/',
          meaning: 'n. 仓库',
          example: 'Git repository.'
        },
        {
          word: 'callback',
          phonetic: '/ˈkɔːlbæk/',
          meaning: 'n. 回调函数',
          example: 'Callback function.'
        },
        {
          word: 'recursive',
          phonetic: '/rɪˈkɜːsɪv/',
          meaning: 'adj. 递归的',
          example: 'Recursive algorithm.'
        },
        {
          word: 'synchronous',
          phonetic: '/ˈsɪŋkrənəs/',
          meaning: 'adj. 同步的',
          example: 'Synchronous request.'
        }
      ]
    }
  ];

  type GameState = 'idle' | 'learning' | 'result';

  const gameState = ref<GameState>('idle');
  const selectedCategory = ref('basic');
  const currentDeck = ref<WordCard[]>([]);
  const currentIndex = ref(0);
  const isFlipped = ref(false);
  const correctCount = ref(0);
  const wrongCount = ref(0);
  const wrongCards = ref<WordCard[]>([]);

  const currentCard = computed(
    () => currentDeck.value[currentIndex.value] || { word: '', meaning: '' }
  );
  const learnedCount = computed(() => correctCount.value + wrongCount.value);
  const accuracy = computed(() => {
    const total = learnedCount.value;
    return total > 0 ? Math.round((correctCount.value / total) * 100) : 0;
  });

  const shuffleArray = <T,>(arr: T[]): T[] => {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  const startLearning = () => {
    const cat = categories.find(c => c.id === selectedCategory.value);
    if (cat) {
      currentDeck.value = shuffleArray([...cat.words]);
    }
    currentIndex.value = 0;
    correctCount.value = 0;
    wrongCount.value = 0;
    wrongCards.value = [];
    isFlipped.value = false;
    gameState.value = 'learning';
  };

  const flipCard = () => {
    isFlipped.value = !isFlipped.value;
  };

  const speakWord = () => {
    if ('speechSynthesis' in window && currentCard.value.word) {
      const utterance = new SpeechSynthesisUtterance(currentCard.value.word);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  const markCard = (known: boolean) => {
    if (known) {
      correctCount.value++;
    } else {
      wrongCount.value++;
      wrongCards.value.push(currentCard.value);
    }

    isFlipped.value = false;

    if (currentIndex.value < currentDeck.value.length - 1) {
      currentIndex.value++;
    } else {
      gameState.value = 'result';
    }
  };

  const reviewWrongCards = () => {
    currentDeck.value = [...wrongCards.value];
    currentIndex.value = 0;
    correctCount.value = 0;
    wrongCount.value = 0;
    wrongCards.value = [];
    isFlipped.value = false;
    gameState.value = 'learning';
  };

  const resetLearning = () => {
    gameState.value = 'idle';
  };
</script>

<style scoped>
  .flashcard-tool {
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

  .flashcard-container {
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
  .card-icon {
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

  .category-select {
    margin-bottom: 1.5rem;
  }
  .category-select h3 {
    font-size: 1rem;
    margin: 0 0 1rem 0;
    color: var(--text);
  }
  .categories {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .cat-btn {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border: 2px solid #ddd;
    border-radius: 12px;
    background: white;
    cursor: pointer;
    color: var(--text);
    transition: all 0.2s;
  }

  .cat-btn.active {
    border-color: var(--primary);
    background: #e6f2ff;
  }
  .cat-btn .count {
    font-size: 0.85rem;
    color: var(--text-secondary);
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

  .learning-area {
    text-align: center;
  }

  .progress-bar {
    height: 6px;
    background: #eee;
    border-radius: 3px;
    margin-bottom: 1.5rem;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: var(--primary);
    transition: width 0.3s;
  }

  .flashcard {
    width: 100%;
    height: 250px;
    perspective: 1000px;
    cursor: pointer;
    margin-bottom: 1rem;
  }

  .flashcard > div {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    padding: 1.5rem;
    transition: transform 0.6s;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }

  .card-front {
    background: linear-gradient(135deg, var(--primary), #2980b9);
    color: white;
  }

  .card-back {
    background: white;
    border: 2px solid var(--primary);
    transform: rotateY(180deg);
  }

  .flashcard.flipped .card-front {
    transform: rotateY(-180deg);
  }
  .flashcard.flipped .card-back {
    transform: rotateY(0);
  }

  .word {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  .phonetic {
    font-size: 1rem;
    opacity: 0.8;
    margin-bottom: 0.5rem;
  }
  .speak-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    cursor: pointer;
    font-size: 1.2rem;
  }

  .meaning {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--text);
    text-align: center;
    margin-bottom: 0.5rem;
  }
  .example {
    font-size: 0.95rem;
    color: var(--text-secondary);
    font-style: italic;
    text-align: center;
  }

  .hint {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .action-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .action-btn {
    flex: 1;
    max-width: 150px;
    padding: 1rem;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: bold;
    transition: transform 0.2s;
  }

  .action-btn.wrong {
    background: #ffe6e6;
    color: var(--danger);
  }
  .action-btn.correct {
    background: #e6fff0;
    color: var(--success);
  }
  .action-btn:hover {
    transform: translateY(-2px);
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

  .result-stats {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
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

  .review-section {
    text-align: left;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #fff5f5;
    border-radius: 12px;
  }

  .review-section h3 {
    font-size: 0.95rem;
    margin: 0 0 0.8rem 0;
    color: var(--danger);
  }
  .wrong-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .wrong-item {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem;
    background: white;
    border-radius: 8px;
  }

  .wrong-item .word {
    font-size: 1rem;
    font-weight: bold;
    color: var(--text);
  }
  .wrong-item .meaning {
    font-size: 0.9rem;
    color: var(--text-secondary);
  }

  .result-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }
  .retry-btn {
    padding: 0.8rem 2rem;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-size: 1rem;
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
