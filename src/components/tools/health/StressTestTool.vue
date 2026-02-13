<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">情绪压力测试</h1>
        <span class="tool-subtitle">Stress Perception Test</span>
      </div>
      <div class="header-right">
        <el-button type="info" link @click="showInfo">
          <el-icon><InfoFilled /></el-icon> 关于量表
        </el-button>
      </div>
    </header>

    <main class="tool-content">
      <div v-if="!showResult" class="test-container glass-card">
        <div class="test-header">
          <div class="progress-bar">
            <div class="progress-inner" :style="{ width: progress + '%' }"></div>
          </div>
          <span class="progress-text">问题 {{ currentStep + 1 }} / {{ questions.length }}</span>
        </div>

        <div class="question-box animate-fade">
          <h2 class="question-text">{{ questions[currentStep].text }}</h2>
          <p class="question-subtext">在过去的一个月中...</p>

          <div class="options-list">
            <div
              v-for="opt in options"
              :key="opt.value"
              class="option-item"
              @click="handleAnswer(opt.value)"
            >
              {{ opt.label }}
            </div>
          </div>
        </div>

        <div class="test-footer">
          <el-button v-if="currentStep > 0" text @click="currentStep--">上一题</el-button>
        </div>
      </div>

      <div v-else class="result-container glass-card animate-scale">
        <div class="result-header">
          <el-result
            :icon="getResultIcon()"
            :title="`得分：${totalScore}`"
            :sub-title="resultText.title"
          >
            <template #extra>
              <div class="score-indicator">
                <el-progress
                  type="dashboard"
                  :percentage="(totalScore / 40) * 100"
                  :color="getScoreColor()"
                  :format="() => totalScore"
                />
              </div>
            </template>
          </el-result>
        </div>

        <div class="result-body">
          <div class="advice-card">
            <h3 class="body-title">测评分析</h3>
            <p class="analysis-text">{{ resultText.analysis }}</p>
          </div>

          <div class="advice-card mt-6">
            <h3 class="body-title">缓解建议</h3>
            <ul class="advice-list">
              <li v-for="(advice, idx) in resultText.advices" :key="idx">
                <el-icon class="bullet-icon"><Check /></el-icon> {{ advice }}
              </li>
            </ul>
          </div>
        </div>

        <div class="result-actions">
          <el-button type="primary" size="large" @click="resetTest">重新测试</el-button>
          <el-button size="large" @click="goHome">返回首页</el-button>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 压力知觉量表 (PSS-10) 自测版</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { ArrowLeft, InfoFilled, Check } from '@element-plus/icons-vue';
  import { ElMessageBox } from 'element-plus';
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

  const getResultIcon = () => {
    if (totalScore.value <= 13) return 'success';
    if (totalScore.value <= 26) return 'warning';
    return 'error';
  };

  const getScoreColor = () => {
    if (totalScore.value <= 13) return '#10b981';
    if (totalScore.value <= 26) return '#f59e0b';
    return '#ef4444';
  };

  const resetTest = () => {
    currentStep.value = 0;
    answers.value = [];
    showResult.value = false;
  };

  const goHome = () => router.push('/');

  const showInfo = () => {
    ElMessageBox.alert(
      '压力知觉量表 (PSS-10) 是全球广泛使用的评估主观压力感的量表。它测查个人对生活中某些情境压力的看法，而非客观的压力源。分数范围为 0-40 分。',
      '关于 PSS-10 量表'
    );
  };
</script>

<style scoped>
  .tool-page {
    min-height: 100vh;
    background: #f0f4f8;
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

  .header-left,
  .header-right {
    width: 140px;
  }
  .header-center {
    text-align: center;
    flex: 1;
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
    padding: 3rem 1.5rem;
    max-width: 700px;
    margin: 0 auto;
    width: 100%;
  }

  .glass-card {
    background: #fff;
    border-radius: 24px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
    padding: 40px;
  }

  .test-header {
    margin-bottom: 40px;
  }

  .progress-bar {
    height: 6px;
    background: #e2e8f0;
    border-radius: 3px;
    margin-bottom: 12px;
    overflow: hidden;
  }

  .progress-inner {
    height: 100%;
    background: #3b82f6;
    transition: width 0.4s ease;
  }

  .progress-text {
    font-size: 0.85rem;
    color: #64748b;
    font-weight: 600;
  }

  .question-text {
    font-size: 1.4rem;
    font-weight: 700;
    color: #1e293b;
    line-height: 1.4;
    margin-bottom: 8px;
  }

  .question-subtext {
    color: #3b82f6;
    font-weight: 600;
    margin-bottom: 32px;
    font-size: 0.95rem;
  }

  .options-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .option-item {
    padding: 18px 24px;
    background: #f8fafc;
    border-radius: 16px;
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 600;
    color: #475569;
  }

  .option-item:hover {
    background: #fff;
    border-color: #3b82f6;
    color: #3b82f6;
    transform: translateX(4px);
  }

  .test-footer {
    margin-top: 40px;
    display: flex;
    justify-content: flex-start;
  }

  .result-header {
    margin-bottom: 24px;
  }

  .score-indicator {
    margin-top: 20px;
  }

  .result-body {
    background: #f8fafc;
    padding: 24px;
    border-radius: 20px;
    margin-bottom: 32px;
  }

  .body-title {
    font-size: 1rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 12px;
  }

  .analysis-text {
    font-size: 0.95rem;
    color: #475569;
    line-height: 1.6;
  }

  .advice-list {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .advice-list li {
    font-size: 0.9rem;
    color: #334155;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .bullet-icon {
    color: #10b981;
    font-size: 0.8rem;
  }

  .result-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .animate-fade {
    animation: fadeIn 0.5s ease;
  }
  .animate-scale {
    animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
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
    padding: 2rem;
    color: #94a3b8;
    font-size: 0.85rem;
  }
  .mt-6 {
    margin-top: 1.5rem;
  }
</style>
