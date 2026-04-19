<template>
  <div class="birthday-fortune-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>生日算命</h1>
        <span class="nav-subtitle">Birthday Fortune</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="fortune-container glass-card">
        <div v-if="!showResult" class="input-screen">
          <div class="crystal-ball">🔮</div>
          <h2>生日运势分析</h2>
          <p>输入你的生日，探索命运的奥秘</p>

          <div class="date-input">
            <div class="input-group">
              <label>出生年份</label>
              <input v-model="year" type="number" min="1900" max="2025" placeholder="如: 1990" />
            </div>
            <div class="input-group">
              <label>月份</label>
              <select v-model="month">
                <option v-for="m in 12" :key="m" :value="m">{{ m }}月</option>
              </select>
            </div>
            <div class="input-group">
              <label>日期</label>
              <select v-model="day">
                <option v-for="d in 31" :key="d" :value="d">{{ d }}日</option>
              </select>
            </div>
          </div>

          <button class="divine-btn" :disabled="!isValidDate" @click="calculateFortune">
            <span>✨</span> 开始测算
          </button>
        </div>

        <div v-else class="result-screen">
          <div class="result-header">
            <div class="zodiac-icon">{{ zodiacInfo.icon }}</div>
            <div class="basic-info">
              <h2>{{ zodiacInfo.name }}</h2>
              <p class="birthday-text">{{ year }}年{{ month }}月{{ day }}日</p>
            </div>
          </div>

          <div class="fortune-cards">
            <div class="fortune-card personality">
              <h3>🧠 性格特点</h3>
              <p>{{ fortuneResult.personality }}</p>
            </div>

            <div class="fortune-card love">
              <h3>💕 爱情运势</h3>
              <p>{{ fortuneResult.love }}</p>
            </div>

            <div class="fortune-card career">
              <h3>💼 事业财运</h3>
              <p>{{ fortuneResult.career }}</p>
            </div>

            <div class="fortune-card health">
              <h3>🏃 健康建议</h3>
              <p>{{ fortuneResult.health }}</p>
            </div>
          </div>

          <div class="lucky-grid">
            <div class="lucky-item">
              <span class="label">幸运数字</span>
              <span class="value">{{ fortuneResult.luckyNumber }}</span>
            </div>
            <div class="lucky-item">
              <span class="label">幸运颜色</span>
              <span class="color-value" :style="{ background: fortuneResult.luckyColor }"></span>
            </div>
            <div class="lucky-item">
              <span class="label">幸运方位</span>
              <span class="value">{{ fortuneResult.luckyDirection }}</span>
            </div>
            <div class="lucky-item">
              <span class="label">贵人星座</span>
              <span class="value">{{ fortuneResult.helperZodiac }}</span>
            </div>
          </div>

          <div class="life-number">
            <h3>生命灵数</h3>
            <div class="number-display">{{ lifeNumber }}</div>
            <p class="number-meaning">{{ fortuneResult.lifeNumberMeaning }}</p>
          </div>

          <p class="disclaimer">* 本测试仅供娱乐，请勿当真</p>

          <button class="retry-btn" @click="reset">重新测算</button>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 生日算命</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { Back } from '@element-plus/icons-vue';

  interface ZodiacInfo {
    name: string;
    icon: string;
  }

  interface FortuneResult {
    personality: string;
    love: string;
    career: string;
    health: string;
    luckyNumber: string;
    luckyColor: string;
    luckyDirection: string;
    helperZodiac: string;
    lifeNumberMeaning: string;
  }

  const year = ref(1990);
  const month = ref(1);
  const day = ref(1);
  const showResult = ref(false);
  const fortuneResult = ref<FortuneResult>({
    personality: '',
    love: '',
    career: '',
    health: '',
    luckyNumber: '',
    luckyColor: '',
    luckyDirection: '',
    helperZodiac: '',
    lifeNumberMeaning: ''
  });

  const personalities = [
    '你是一个富有创造力的人，思维敏捷，善于发现问题的新角度。你有强烈的直觉，常常能够预见未来的趋势。',
    '你性格温和，待人真诚，有很强的同理心。你喜欢帮助他人，是天生的倾听者和安慰者。',
    '你是一个天生的领导者，有很强的决断力和执行力。你追求完美，对自己要求严格。',
    '你热爱自由，不喜欢被束缚。你有很强的好奇心，喜欢探索未知的领域。',
    '你是一个稳重可靠的人，做事有条理，注重细节。你是朋友眼中的贴心人。',
    '你性格开朗，善于社交，有很多朋友。你乐观积极，总能看到事物好的一面。'
  ];

  const loves = [
    '在感情中你是一个忠诚的伴侣，重视家庭和谐。建议多表达爱意，让另一半感受到你的关心。',
    '你渴望一段浪漫的爱情，但有时过于理想化。建议保持开放心态，真爱可能在意想不到的地方。',
    '你在感情中比较理性，需要学会用心感受。建议放下防备，勇敢表达自己的情感。',
    '你是一个充满激情的恋人，但有时会过于热情。建议给彼此适当的空间，让感情更加稳固。',
    '你在感情中追求平等和尊重。建议多沟通，共同成长是维系感情的关键。',
    '你对爱情充满憧憬，容易被浪漫打动。建议保持清醒，选择真正适合自己的人。'
  ];

  const careers = [
    '你的事业运势较好，适合从事创意类工作。今年会有贵人相助，把握机会可以更上一层楼。',
    '你在职场中稳扎稳打，适合需要耐心和细心的工作。财运平稳，建议做好理财规划。',
    '你有很强的事业心，适合管理岗位。建议多学习新技能，提升自己的竞争力。',
    '你适合自由职业或创业，不喜欢朝九晚五的生活。财运有起有落，建议稳中求进。',
    '你在团队中表现出色，适合需要协作的工作。今年有加薪的机会，好好表现。',
    '你有着敏锐的商业嗅觉，适合从事销售或投资相关工作。建议控制风险，理性决策。'
  ];

  const healths = [
    '建议多注意休息，保持良好的作息习惯。适当运动可以让你精力更充沛。',
    '注意饮食均衡，少吃油腻食物。多喝水，保持身体水分充足。',
    '压力较大时建议通过冥想或瑜伽来放松身心。保持积极乐观的心态很重要。',
    '建议多参加户外活动，呼吸新鲜空气。定期体检，预防胜于治疗。',
    '注意用眼健康，减少电子设备使用时间。保持适量运动，增强体质。',
    '建议培养一项运动爱好，既能强身健体又能结交新朋友。'
  ];

  const directions = ['东方', '南方', '西方', '北方', '东南方', '东北方', '西南方', '西北方'];
  const colors = [
    '#e74c3c',
    '#e67e22',
    '#f1c40f',
    '#27ae60',
    '#3498db',
    '#9b59b6',
    '#1abc9c',
    '#34495e'
  ];
  const zodiacNames = [
    '白羊座',
    '金牛座',
    '双子座',
    '巨蟹座',
    '狮子座',
    '处女座',
    '天秤座',
    '天蝎座',
    '射手座',
    '摩羯座',
    '水瓶座',
    '双鱼座'
  ];

  const lifeNumberMeanings: Record<number, string> = {
    1: '代表领导力与独立，你是天生的开拓者，具有强烈的进取心。',
    2: '代表和谐与合作，你善于沟通协调，是天生的调解者。',
    3: '代表创造力与表达，你富有艺术天赋，善于表达自己的想法。',
    4: '代表稳定与务实，你做事踏实可靠，追求稳固的生活。',
    5: '代表自由与变化，你热爱冒险，渴望体验丰富多彩的人生。',
    6: '代表责任与关爱，你重视家庭，有很强的服务精神。',
    7: '代表智慧与分析，你思维缜密，善于研究和探索。',
    8: '代表权力与财富，你有商业头脑，追求事业上的成功。',
    9: '代表博爱与理想，你有强烈的社会责任感，追求精神层面的满足。',
    11: '代表直觉与灵感，你有着超强的第六感，是天生的先知。',
    22: '代表建设与实现，你有能力将梦想变为现实，是伟大的建设者。'
  };

  const isValidDate = computed(() => {
    return (
      year.value >= 1900 &&
      year.value <= 2025 &&
      month.value >= 1 &&
      month.value <= 12 &&
      day.value >= 1 &&
      day.value <= 31
    );
  });

  const zodiacInfo = computed((): ZodiacInfo => {
    const zodiacIcons = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
    const m = month.value;
    const d = day.value;

    let index: number;
    if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) index = 0;
    else if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) index = 1;
    else if ((m === 5 && d >= 21) || (m === 6 && d <= 21)) index = 2;
    else if ((m === 6 && d >= 22) || (m === 7 && d <= 22)) index = 3;
    else if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) index = 4;
    else if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) index = 5;
    else if ((m === 9 && d >= 23) || (m === 10 && d <= 23)) index = 6;
    else if ((m === 10 && d >= 24) || (m === 11 && d <= 22)) index = 7;
    else if ((m === 11 && d >= 23) || (m === 12 && d <= 21)) index = 8;
    else if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) index = 9;
    else if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) index = 10;
    else index = 11;

    return { name: zodiacNames[index], icon: zodiacIcons[index] };
  });

  const lifeNumber = computed(() => {
    let sum = 0;
    const dateStr = `${year.value}${month.value}${day.value}`;
    for (const char of dateStr) {
      sum += parseInt(char);
    }

    while (sum > 22 && sum !== 11 && sum !== 22) {
      let newSum = 0;
      const temp = sum.toString();
      for (const char of temp) {
        newSum += parseInt(char);
      }
      sum = newSum;
    }

    if (sum > 9 && sum !== 11 && sum !== 22) {
      const temp = sum.toString();
      sum = parseInt(temp[0]) + parseInt(temp[1]);
    }

    return sum;
  });

  const calculateFortune = () => {
    const seed = year.value + month.value * 100 + day.value;
    const rand = (n: number) => Math.floor((((seed * 9301 + 49297) % 233280) / 233280) * n);

    fortuneResult.value = {
      personality: personalities[rand(personalities.length)],
      love: loves[rand(loves.length)],
      career: careers[rand(careers.length)],
      health: healths[rand(healths.length)],
      luckyNumber: `${rand(9) + 1}, ${rand(9) + 1}`,
      luckyColor: colors[rand(colors.length)],
      luckyDirection: directions[rand(directions.length)],
      helperZodiac: zodiacNames[rand(zodiacNames.length)],
      lifeNumberMeaning: lifeNumberMeanings[lifeNumber.value] || lifeNumberMeanings[1]
    };

    showResult.value = true;
  };

  const reset = () => {
    showResult.value = false;
  };
</script>

<style scoped>
  .birthday-fortune-tool {
    --bg: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --card: #ffffff;
    --text: #2c3e50;
    --text-secondary: #7f8c8d;
    --primary: #667eea;

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
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
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

  .fortune-container {
    background: var(--card);
    border-radius: 20px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
    padding: 2rem;
    width: 100%;
    max-width: 500px;
  }

  .input-screen {
    text-align: center;
  }
  .crystal-ball {
    font-size: 5rem;
    margin-bottom: 1rem;
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .input-screen h2 {
    margin: 0 0 0.5rem 0;
    color: var(--text);
  }
  .input-screen p {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
  }

  .date-input {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 1.5rem;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .input-group label {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-bottom: 0.3rem;
  }

  .input-group input,
  .input-group select {
    width: 80px;
    padding: 0.6rem;
    border: 2px solid #ddd;
    border-radius: 10px;
    font-size: 1rem;
    text-align: center;
    outline: none;
  }

  .input-group input:focus,
  .input-group select:focus {
    border-color: var(--primary);
  }

  .divine-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.8rem 2rem;
    font-size: 1.1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .divine-btn:hover:not(:disabled) {
    transform: translateY(-2px);
  }
  .divine-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .result-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;
  }

  .zodiac-icon {
    font-size: 3rem;
  }
  .basic-info h2 {
    margin: 0;
    color: var(--text);
  }
  .birthday-text {
    color: var(--text-secondary);
    margin: 0.3rem 0 0 0;
    font-size: 0.9rem;
  }

  .fortune-cards {
    display: grid;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .fortune-card {
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 12px;
    text-align: left;
  }

  .fortune-card h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    color: var(--text);
  }
  .fortune-card p {
    margin: 0;
    font-size: 0.9rem;
    color: var(--text-secondary);
    line-height: 1.6;
  }

  .lucky-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
    margin-bottom: 1.5rem;
  }

  .lucky-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.8rem;
    background: #f9f9f9;
    border-radius: 10px;
  }

  .lucky-item .label {
    font-size: 0.8rem;
    color: var(--text-secondary);
  }
  .lucky-item .value {
    font-size: 1.1rem;
    font-weight: bold;
    color: var(--text);
  }
  .color-value {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }

  .life-number {
    text-align: center;
    padding: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    color: white;
    margin-bottom: 1rem;
  }

  .life-number h3 {
    margin: 0 0 0.5rem 0;
    font-size: 0.95rem;
  }
  .number-display {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
  }
  .number-meaning {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.9;
    line-height: 1.5;
  }

  .disclaimer {
    color: var(--text-secondary);
    font-size: 0.8rem;
    margin-bottom: 1rem;
  }

  .retry-btn {
    width: 100%;
    padding: 0.8rem;
    background: #f5f5f5;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    color: var(--text);
    font-size: 1rem;
  }

  .footer {
    text-align: center;
    padding: 2rem 0;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
  }
</style>
