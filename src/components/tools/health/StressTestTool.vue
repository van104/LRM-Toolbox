<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">健康<span>.情绪压力测试()</span></h1>
        <button class="brutal-btn" @click="showInfo">📖 量表说明</button>
      </header>

      <main class="tool-content">
        <div
          v-if="!showResult"
          class="brutal-pane test-pane mx-auto bg-white relative-pane animate-fade"
        >
          <div class="test-header">
            <div class="test-progress-bar">
              <div class="progress-fill" :style="{ width: progress + '%' }"></div>
            </div>
            <div class="progress-stats">
              <span class="step-text">问题 {{ currentStep + 1 }} / {{ questions.length }}</span>
            </div>
          </div>

          <div class="pane-body padding-large text-center">
            <p class="question-subtext mt-4">在过去的一个月中...</p>
            <h2 class="question-text">{{ questions[currentStep].text }}</h2>

            <div class="options-grid mt-8">
              <button
                v-for="opt in options"
                :key="opt.value"
                class="brutal-action-btn option-btn"
                @click="handleAnswer(opt.value)"
              >
                {{ opt.label }}
              </button>
            </div>

            <div class="nav-actions mt-8">
              <button v-if="currentStep > 0" class="brutal-outline-btn" @click="currentStep--">
                ↑ 上一题
              </button>
            </div>
          </div>
        </div>

        <div v-else class="brutal-pane result-pane mx-auto bg-yellow animate-scale">
          <div class="pane-header bg-black flex-between">
            <span class="text-white">测算结果：{{ resultText.title }}</span>
            <button class="brutal-icon-btn small-btn" @click="resetTest">↻</button>
          </div>

          <div class="pane-body">
            <div class="score-banner" :class="getScoreClass()">
              <div class="score-label">总得分</div>
              <div class="score-val">{{ totalScore }} <small>/ 40</small></div>
            </div>

            <div class="brutal-card mt-6 bg-white">
              <h3 class="card-title">📝 测评分析</h3>
              <p class="card-text">{{ resultText.analysis }}</p>
            </div>

            <div class="brutal-card mt-6 bg-white">
              <h3 class="card-title">💡 缓解建议</h3>
              <ul class="brutal-list">
                <li v-for="(advice, idx) in resultText.advices" :key="idx">
                  <span class="check-icon">✔</span> {{ advice }}
                </li>
              </ul>
            </div>

            <div class="result-actions mt-8">
              <button class="brutal-action-btn primary large-btn" @click="goHome">
                返回工具箱首页
              </button>
              <button class="brutal-action-btn large-btn" @click="resetTest">重新测试</button>
            </div>
          </div>
        </div>
      </main>

      <footer class="footer mt-8">© 2026 LRM工具箱 - 压力知觉量表 (PSS-10)</footer>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const currentStep = ref(0);
  const answers = ref<number[]>([]);
  const showResult = ref(false);

  const options = [
    { label: '从来没有', value: 0 },
    { label: '极少有', value: 1 },
    { label: '有时有', value: 2 },
    { label: '经常有', value: 3 },
    { label: '很多次', value: 4 }
  ];

  const questions = [
    { text: '你是否因为某些意想不到的情况发生而感到心烦意乱？', reverse: false },
    { text: '由于无法控制生活中重要的事情，你是否感到无法应对？', reverse: false },
    { text: '你是否感到紧张和压力重重？', reverse: false },
    { text: '你是否能成功地处理生活中的烦恼？', reverse: true },
    { text: '你是否感到自己在有效地处理生活中的重大变化？', reverse: true },
    { text: '你是否感到对自己处理个人问题的能力充满信心？', reverse: true },
    { text: '你是否感到事情正按你的意愿发展？', reverse: true },
    { text: '你是否发现自己无法处理所有必须要做的事情？', reverse: false },
    { text: '你是否能够控制生活中的烦恼？', reverse: true },
    { text: '你是否感到自己掌控了一切？', reverse: true }
  ];

  const progress = computed(() => ((currentStep.value + 1) / questions.length) * 100);

  const handleAnswer = (val: number) => {
    answers.value[currentStep.value] = val;
    if (currentStep.value < questions.length - 1) {
      currentStep.value++;
    } else {
      calculateResult();
    }
  };

  const totalScore = ref(0);
  const calculateResult = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      const val = answers.value[idx];
      if (q.reverse) {
        score += 4 - val;
      } else {
        score += val;
      }
    });
    totalScore.value = score;
    showResult.value = true;
  };

  const resultText = computed(() => {
    const s = totalScore.value;
    if (s <= 13) {
      return {
        title: '低压力水平',
        analysis:
          '目前的压力感知处于正常较低范围内，您的心态整体非常放松，能够从容应对生活中的起伏。',
        advices: [
          '继续保持目前积极的生活态度',
          '可以适当挑战新的兴趣爱好',
          '定期以此水平为基准进行自测'
        ]
      };
    } else if (s <= 26) {
      return {
        title: '中等压力水平',
        analysis: '您正在承受一定的心理压力，生活中可能存在一些让您感到焦虑或不确定的因素。',
        advices: [
          '尝试正念冥想或深呼吸练习',
          '保证充足的睡眠，让大脑得到休息',
          '与亲友分享烦恼，寻求情感支持'
        ]
      };
    } else {
      return {
        title: '高压力水平',
        analysis: '目前的压力感知已经处于预警状态，这可能会影响您的身心健康和日常生活。',
        advices: [
          '建议咨询心理健康专家进行专业辅导',
          '彻底腾出一段时间进行强制休息',
          '重新审视目前的时间管理和任务强度'
        ]
      };
    }
  });

  const getScoreClass = () => {
    if (totalScore.value <= 13) return 'score-green';
    if (totalScore.value <= 26) return 'score-orange';
    return 'score-red';
  };

  const resetTest = () => {
    currentStep.value = 0;
    answers.value = [];
    showResult.value = false;
  };

  const goHome = () => router.push('/');

  const showInfo = () => {
    alert(
      '压力知觉量表 (PSS-10) 是全球广泛使用的评估主观压力感的量表。\n\n它测查个人对生活中某些情境压力的看法，而非客观的压力源。\n\n分数范围为 0-40 分。'
    );
  };
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

  .brutal-wrapper {
    background-color: #fdfae5;
    background-image:
      linear-gradient(#e5e5e5 2px, transparent 2px),
      linear-gradient(90deg, #e5e5e5 2px, transparent 2px);
    background-size: 40px 40px;
    min-height: 100vh;
    padding: 2rem;
    box-sizing: border-box;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    color: #111;
  }
  .brutal-container {
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }

  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 3rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0 #4b7bff;
    flex: 1;
    text-align: center;
  }
  .brutal-title span {
    color: #4b7bff;
    text-shadow: 4px 4px 0 #111;
  }

  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', sans-serif;
    font-size: 1.1rem;
    font-weight: 900;
    cursor: pointer;
    box-shadow: 6px 6px 0 #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }
  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0 #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0 0 0 #111;
  }

  .mx-auto {
    margin-left: auto;
    margin-right: auto;
  }

  .brutal-pane {
    width: 100%;
    display: flex;
    flex-direction: column;
    border: 4px solid #111;
    box-shadow: 12px 12px 0 #111;
    min-width: 0;
  }
  .test-pane {
    max-width: 700px;
  }
  .bg-white {
    background: #fff;
  }
  .bg-yellow {
    background: #ffd900;
  }
  .relative-pane {
    transition: transform 0.1s;
    display: flex;
    flex-direction: column;
  }

  .test-header {
    border-bottom: 4px solid #111;
    background: #fff;
  }
  .test-progress-bar {
    height: 16px;
    background: #fff;
    border-bottom: 4px solid #111;
    width: 100%;
    position: relative;
  }
  .progress-fill {
    height: 100%;
    background: #4b7bff;
    transition: width 0.3s ease;
    border-right: 4px solid #111;
    box-sizing: border-box;
  }
  .progress-stats {
    padding: 0.75rem;
    text-align: center;
    font-weight: 900;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1.1rem;
  }

  .pane-body {
    padding: 2rem;
    flex: 1;
  }
  .padding-large {
    padding: 3rem;
  }
  .text-center {
    text-align: center;
  }

  .question-subtext {
    font-size: 1rem;
    font-weight: 900;
    color: #555;
    margin: 0 0 1rem;
    border: 2px dashed #111;
    display: inline-block;
    padding: 0.5rem 1rem;
  }
  .question-text {
    font-size: 2rem;
    font-family: 'Noto Sans SC', sans-serif;
    font-weight: 900;
    line-height: 1.4;
    margin: 0;
  }

  .options-grid {
    display: grid;
    gap: 1rem;
  }

  .brutal-action-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 1.25rem 2rem;
    font-family: 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1.25rem;
    cursor: pointer;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
    box-shadow: 4px 4px 0 #111;
  }
  .option-btn:hover {
    background: #fdfae5;
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #111;
    border-color: #4b7bff;
  }
  .option-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0 0 0 #111;
  }

  .brutal-action-btn.primary {
    background: #4b7bff;
    color: white;
  }
  .brutal-action-btn.large-btn {
    width: 100%;
    display: block;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
  }
  .brutal-action-btn.primary:hover {
    transform: translate(-3px, -3px);
    box-shadow: 7px 7px 0 #111;
  }

  .brutal-outline-btn {
    background: transparent;
    border: none;
    font-weight: 900;
    font-family: 'Noto Sans SC', sans-serif;
    font-size: 1.1rem;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 4px;
    border-bottom: 2px solid transparent;
  }
  .brutal-outline-btn:hover {
    color: #ff4b4b;
  }

  .nav-actions {
    display: flex;
    justify-content: flex-start;
  }

  .result-pane {
    max-width: 800px;
  }
  .pane-header {
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    font-size: 1.5rem;
  }
  .bg-black {
    background: #111;
    color: white;
  }
  .flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .brutal-icon-btn.small-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #fff;
    border: 3px solid #111;
    font-weight: 900;
    font-size: 1.2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 2px 2px 0 #111;
  }
  .brutal-icon-btn.small-btn:hover {
    background: #ff4b4b;
    color: white;
  }

  .score-banner {
    border: 4px dashed #111;
    padding: 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff;
  }
  .score-label {
    font-size: 2rem;
    font-weight: 900;
    font-family: 'Noto Sans SC', sans-serif;
  }
  .score-val {
    font-size: 5rem;
    font-weight: 900;
    font-family: 'Syne', sans-serif;
    line-height: 1;
    text-shadow: 4px 4px 0 #111;
  }
  .score-val small {
    font-size: 2rem;
  }

  .score-green .score-val {
    color: #10b981;
  }
  .score-orange .score-val {
    color: #f59e0b;
  }
  .score-red .score-val {
    color: #ff4b4b;
  }

  .brutal-card {
    border: 4px solid #111;
    padding: 1.5rem;
    box-shadow: 6px 6px 0 #111;
  }
  .card-title {
    margin: 0 0 1rem;
    font-size: 1.5rem;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
  }
  .card-text {
    margin: 0;
    font-size: 1.1rem;
    font-weight: bold;
    line-height: 1.6;
  }

  .brutal-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .brutal-list li {
    font-size: 1.1rem;
    font-weight: bold;
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .check-icon {
    font-size: 1.2rem;
    margin-top: -2px;
    color: #10b981;
    font-weight: 900;
  }

  .result-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .mt-4 {
    margin-top: 1rem;
  }
  .mt-6 {
    margin-top: 1.5rem;
  }
  .mt-8 {
    margin-top: 2rem;
  }

  .animate-fade {
    animation: fadeIn 0.4s ease-out forwards;
  }
  .animate-scale {
    animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .footer {
    text-align: center;
    font-weight: 900;
    margin-bottom: 2rem;
  }

  @media (max-width: 900px) {
    .brutal-title {
      font-size: 2rem;
    }
    .padding-large {
      padding: 1.5rem;
    }
    .score-banner {
      flex-direction: column;
      text-align: center;
      gap: 1rem;
      padding: 1.5rem;
    }
    .result-actions {
      grid-template-columns: 1fr;
    }
  }

  /* Dark Mode */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .brutal-card,
  [data-theme='dark'] .score-banner {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .brutal-card {
    box-shadow: 6px 6px 0 #eee;
  }
  [data-theme='dark'] .brutal-btn:hover,
  [data-theme='dark'] .option-btn:hover,
  [data-theme='dark'] .brutal-action-btn.primary:hover {
    box-shadow: 9px 9px 0 #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0 #eee;
  }

  [data-theme='dark'] .bg-white {
    background: #1a1a1a;
  }
  [data-theme='dark'] .bg-yellow {
    background: #332700;
    border-color: #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .test-header {
    border-bottom-color: #eee;
    background: #222;
  }
  [data-theme='dark'] .test-progress-bar {
    background: #111;
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .progress-fill {
    background: #2a4eb2;
    border-right-color: #eee;
  }

  [data-theme='dark'] .question-subtext {
    border-color: #eee;
    color: #aaa;
  }
  [data-theme='dark'] .option-btn:hover {
    background: #002233;
    border-color: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .brutal-action-btn.primary {
    background: #2a4eb2;
  }

  [data-theme='dark'] .brutal-outline-btn {
    color: #aaa;
  }
  [data-theme='dark'] .brutal-outline-btn:hover {
    color: #ff8b8b;
  }

  [data-theme='dark'] .score-val {
    text-shadow: 4px 4px 0 #111;
  }
</style>
