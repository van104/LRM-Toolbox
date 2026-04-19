<template>
  <div class="lucky-draw-stick-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>幸运抽签</h1>
        <span class="nav-subtitle">Lucky Draw Stick</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="draw-container glass-card">
        <div v-if="gameState === 'idle'" class="start-screen">
          <div class="temple-icon">🏯</div>
          <h2>幸运抽签</h2>
          <p>诚心祈愿，求得一签</p>
          <div class="incense">
            <div class="smoke"></div>
            <div class="smoke"></div>
            <div class="smoke"></div>
          </div>
          <button class="draw-btn" @click="startDraw">
            <span class="shake-animation">🙏</span>
            摇签求卦
          </button>
        </div>

        <div v-else-if="gameState === 'drawing'" class="drawing-screen">
          <div class="shake-container">
            <div class="bamboo-holder" :class="{ shaking: isShaking }">
              <div class="bamboo-tube">
                <div class="sticks">
                  <div
                    v-for="i in 8"
                    :key="i"
                    class="stick"
                    :style="{ transform: `rotate(${(i - 4.5) * 8}deg)` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <p class="drawing-text">正在摇签...</p>
        </div>

        <div v-else-if="gameState === 'result'" class="result-screen">
          <div class="result-header">
            <div class="lot-number">第 {{ currentLot.number }}签</div>
            <div class="lot-level" :class="currentLot.level">
              {{ currentLot.levelName }}
            </div>
          </div>

          <div class="lot-content">
            <div class="poem">
              <p v-for="(line, i) in currentLot.poem" :key="i">{{ line }}</p>
            </div>

            <div class="interpretation">
              <h3>签文解读</h3>
              <p>{{ currentLot.interpretation }}</p>
            </div>

            <div class="advice">
              <h3>温馨提示</h3>
              <p>{{ currentLot.advice }}</p>
            </div>
          </div>

          <div class="lucky-items">
            <div class="lucky-item">
              <span class="label">幸运数字</span>
              <span class="value">{{ currentLot.luckyNumber }}</span>
            </div>
            <div class="lucky-item">
              <span class="label">幸运颜色</span>
              <span class="color-dot" :style="{ background: currentLot.luckyColor }"></span>
            </div>
            <div class="lucky-item">
              <span class="label">幸运方位</span>
              <span class="value">{{ currentLot.luckyDirection }}</span>
            </div>
          </div>

          <button class="retry-btn" @click="resetDraw">再求一签</button>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 幸运抽签</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { Back } from '@element-plus/icons-vue';

  type GameState = 'idle' | 'drawing' | 'result';

  interface Lot {
    number: number;
    level: 'great' | 'good' | 'medium' | 'low';
    levelName: string;
    poem: string[];
    interpretation: string;
    advice: string;
    luckyNumber: string;
    luckyColor: string;
    luckyDirection: string;
  }

  const lots: Lot[] = [
    {
      number: 1,
      level: 'great',
      levelName: '上上签',
      poem: ['春来花开满园香', '喜鹊枝头报吉祥', '贵人相助前程好', '万事如意福满堂'],
      interpretation:
        '此签大吉大利，诸事顺遂。正如春天百花盛开，你的运势也将迎来蓬勃发展的好时机。',
      advice: '把握当下机遇，积极进取。贵人运旺盛，多与正能量的人交往，好运会接踵而至。',
      luckyNumber: '3, 8',
      luckyColor: '#e74c3c',
      luckyDirection: '东南方'
    },
    {
      number: 2,
      level: 'good',
      levelName: '上签',
      poem: ['明月当空照四方', '清风徐来送清凉', '心中所求终可得', '耐心等待自呈祥'],
      interpretation: '此签吉祥如意，虽需等待，但必有收获。如明月当空，光明在前。',
      advice: '保持平和心态，不要急于求成。好事多磨，静待时机成熟，自然水到渠成。',
      luckyNumber: '2, 7',
      luckyColor: '#3498db',
      luckyDirection: '东方'
    },
    {
      number: 3,
      level: 'good',
      levelName: '上签',
      poem: ['顺风扬帆行大船', '前途无量好风光', '莫愁前路无知己', '天下谁人不识君'],
      interpretation: '此签主顺利，事业运势上升。正如顺风航行，一切都将事半功倍。',
      advice: '大胆前进，不要犹豫。把握合作机会，贵人运旺，事业爱情皆有收获。',
      luckyNumber: '1, 6',
      luckyColor: '#27ae60',
      luckyDirection: '南方'
    },
    {
      number: 4,
      level: 'medium',
      levelName: '中签',
      poem: ['云开雾散见青天', '守得花开月正圆', '凡事渐进莫急躁', '细水长流福绵绵'],
      interpretation: '此签平平稳稳，不求速成，渐进为上。如云开雾散，终见光明。',
      advice: '稳扎稳打，不要冒进。保持耐心，循序渐进，终会达到目标。',
      luckyNumber: '4, 9',
      luckyColor: '#f1c40f',
      luckyDirection: '西方'
    },
    {
      number: 5,
      level: 'medium',
      levelName: '中签',
      poem: ['冬去春来又一年', '辛勤耕耘自有田', '莫问收获先播种', '瓜熟蒂落结善缘'],
      interpretation: '此签主勤劳有得，付出必有回报。如农夫耕作，需先播种后收获。',
      advice: '脚踏实地，勤恳努力。不要计较眼前得失，长远来看必有大收获。',
      luckyNumber: '5, 0',
      luckyColor: '#9b59b6',
      luckyDirection: '北方'
    },
    {
      number: 6,
      level: 'low',
      levelName: '下签',
      poem: ['风雨过后见彩虹', '困难只是暂时穷', '柳暗花明又一村', '否极泰来运自通'],
      interpretation: '此签虽为下签，但寓意转机。正如风雨过后见彩虹，困难只是暂时的。',
      advice: '调整心态，坦然面对。低谷之后必有高峰，保持乐观，好运即将来临。',
      luckyNumber: '6, 1',
      luckyColor: '#1abc9c',
      luckyDirection: '东北方'
    },
    {
      number: 7,
      level: 'great',
      levelName: '上上签',
      poem: ['龙腾虎跃展宏图', '一帆风顺好运铺', '心想事成皆如意', '福禄寿喜入家门'],
      interpretation: '此签大吉大利，万事亨通。如龙腾虎跃，前程似锦，好运连连。',
      advice: '大胆追求梦想，成功几率极高。把握机遇，勇敢前进，收获满满。',
      luckyNumber: '8, 9',
      luckyColor: '#e67e22',
      luckyDirection: '西南方'
    },
    {
      number: 8,
      level: 'good',
      levelName: '上签',
      poem: ['千里之行始足下', '积少成多汇成河', '坚持不懈终有成', '天道酬勤福自来'],
      interpretation: '此签主努力有成，积少成多。如千里之行始于足下，一步一个脚印终达目标。',
      advice: '坚持不懈，持之以恒。每天进步一点点，积累终将带来质的飞跃。',
      luckyNumber: '3, 5',
      luckyColor: '#2ecc71',
      luckyDirection: '西北方'
    }
  ];

  const gameState = ref<GameState>('idle');
  const currentLot = ref<Lot>(lots[0]);
  const isShaking = ref(false);

  const startDraw = () => {
    gameState.value = 'drawing';
    isShaking.value = true;

    setTimeout(() => {
      isShaking.value = false;
      currentLot.value = lots[Math.floor(Math.random() * lots.length)];
      gameState.value = 'result';
    }, 2000);
  };

  const resetDraw = () => {
    gameState.value = 'idle';
  };
</script>

<style scoped>
  .lucky-draw-stick-tool {
    --bg: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
    --card: #ffffff;
    --text: #2c3e50;
    --text-secondary: #7f8c8d;
    --primary: #e74c3c;
    --gold: #f1c40f;

    font-family: 'PingFang SC', 'Microsoft YaHei', serif;
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

  .draw-container {
    background: var(--card);
    border-radius: 20px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    width: 100%;
    max-width: 500px;
    min-height: 400px;
  }

  .start-screen {
    text-align: center;
    padding: 2rem 0;
  }
  .temple-icon {
    font-size: 5rem;
    margin-bottom: 1rem;
  }
  .start-screen h2 {
    margin: 0 0 0.5rem 0;
    color: var(--text);
    font-size: 1.8rem;
  }
  .start-screen p {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
  }

  .incense {
    position: relative;
    height: 60px;
    margin-bottom: 2rem;
  }

  .smoke {
    position: absolute;
    left: 50%;
    bottom: 0;
    width: 8px;
    height: 40px;
    background: linear-gradient(180deg, transparent 0%, rgba(200, 200, 200, 0.3) 100%);
    border-radius: 50%;
    animation: smoke-rise 3s infinite;
  }

  .smoke:nth-child(1) {
    left: 45%;
    animation-delay: 0s;
  }
  .smoke:nth-child(2) {
    left: 50%;
    animation-delay: 0.5s;
  }
  .smoke:nth-child(3) {
    left: 55%;
    animation-delay: 1s;
  }

  @keyframes smoke-rise {
    0% {
      transform: translateY(0) scale(1);
      opacity: 0.6;
    }
    100% {
      transform: translateY(-30px) scale(1.5);
      opacity: 0;
    }
  }

  .draw-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.5rem 3rem;
    font-size: 1.2rem;
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    color: white;
    border: none;
    border-radius: 16px;
    cursor: pointer;
    box-shadow: 0 8px 20px rgba(231, 76, 60, 0.3);
    transition: transform 0.3s;
  }

  .draw-btn:hover {
    transform: translateY(-3px);
  }
  .shake-animation {
    font-size: 2rem;
    animation: shake 0.5s infinite;
  }

  @keyframes shake {
    0%,
    100% {
      transform: rotate(-5deg);
    }
    50% {
      transform: rotate(5deg);
    }
  }

  .drawing-screen {
    text-align: center;
    padding: 3rem 0;
  }
  .shake-container {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
  }

  .bamboo-holder {
    transition: transform 0.1s;
  }
  .bamboo-holder.shaking {
    animation: shake-holder 0.15s infinite;
  }

  @keyframes shake-holder {
    0%,
    100% {
      transform: rotate(-3deg);
    }
    50% {
      transform: rotate(3deg);
    }
  }

  .bamboo-tube {
    width: 60px;
    height: 150px;
    background: linear-gradient(90deg, #8b4513 0%, #a0522d 50%, #8b4513 100%);
    border-radius: 10px;
    position: relative;
    overflow: hidden;
  }

  .sticks {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
  }
  .stick {
    width: 6px;
    height: 80px;
    background: linear-gradient(90deg, #d2691e 0%, #f4a460 50%, #d2691e 100%);
    border-radius: 3px;
    transform-origin: bottom center;
    position: absolute;
    bottom: 0;
  }

  .drawing-text {
    font-size: 1.2rem;
    color: var(--text-secondary);
  }

  .result-screen {
    text-align: center;
  }

  .result-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;
  }

  .lot-number {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--text);
    margin-bottom: 0.5rem;
  }

  .lot-level {
    padding: 0.3rem 1rem;
    border-radius: 20px;
    font-weight: bold;
    color: white;
  }

  .lot-level.great {
    background: linear-gradient(135deg, #f1c40f 0%, #e67e22 100%);
  }
  .lot-level.good {
    background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  }
  .lot-level.medium {
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  }
  .lot-level.low {
    background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
  }

  .lot-content {
    text-align: left;
    margin-bottom: 1.5rem;
  }

  .poem {
    background: linear-gradient(135deg, #fff9e6 0%, #fff5d6 100%);
    padding: 1.5rem;
    border-radius: 12px;
    margin-bottom: 1rem;
    border-left: 4px solid var(--gold);
  }

  .poem p {
    margin: 0.3rem 0;
    font-size: 1.1rem;
    color: var(--text);
    line-height: 1.8;
  }

  .interpretation,
  .advice {
    margin-bottom: 1rem;
  }

  .interpretation h3,
  .advice h3 {
    font-size: 0.95rem;
    color: var(--text);
    margin: 0 0 0.5rem 0;
  }

  .interpretation p,
  .advice p {
    font-size: 0.95rem;
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0;
  }

  .lucky-items {
    display: flex;
    justify-content: space-around;
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 12px;
    margin-bottom: 1.5rem;
  }

  .lucky-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
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

  .color-dot {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
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
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    background: var(--card);
  }
</style>
