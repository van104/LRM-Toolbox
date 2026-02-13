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
        <h1 class="tool-title">答案之书</h1>
        <span class="tool-subtitle">The Book of Answers</span>
      </div>
      <div class="header-right">
        <el-button link @click="resetBook"> 重置 </el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="book-container" :class="{ 'is-flipped': isFlipped }" @click="flipBook">
        <!-- 封面 -->
        <div class="book-face book-cover shadow-xl">
          <div class="cover-content">
            <div class="ornament top">✧</div>
            <h2 class="book-title-main">答案之书</h2>
            <p class="book-instruction">心中默念问题，点击翻开</p>
            <div class="ornament bottom">✧</div>
          </div>
        </div>

        <!-- 开启后的页面 -->
        <div class="book-face book-inside shadow-2xl">
          <div class="inside-content">
            <transition name="fade-scale" mode="out-in">
              <div :key="currentAnswer" class="answer-text">
                {{ currentAnswer }}
              </div>
            </transition>
            <div v-if="isFlipped" class="click-to-retry">点击书本再次寻求指引</div>
          </div>
        </div>
      </div>

      <div class="tips-section mt-12 animate-fade-in">
        <p>
          <el-icon><InfoFilled /></el-icon> 提示：在提问前，请闭上眼睛，专注思考那个让你困扰的问题
          5-10 秒。
        </p>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - 答案之书</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { ArrowLeft, InfoFilled } from '@element-plus/icons-vue';

  const isFlipped = ref(false);
  const currentAnswer = ref('');

  const answers = [
    '这件事在不久的将来会有结果。',
    '不要犹豫，现在就是最好的时机。',
    '换一个角度去思考，你会发现截然不同的答案。',
    '这并不是一个好主意。',
    '坚持下去，成功就在前方。',
    '放手吧，这不属于你。',
    '你需要寻求他人的帮助。',
    '答案就在你的内心深处。',
    '保持耐心，时间会说明一切。',
    '结果出乎你的意料。',
    '去做你一直想做却不敢做的事。',
    '顺其自然，不要强求。',
    '专注眼前，不要被杂念干扰。',
    '这需要大量的精力和时间。',
    '你已经在正确的道路上了。',
    '给自己一点休息的时间。',
    '绝对是。',
    '很难说，情况还在变化。',
    '目前的阻碍只是暂时的。',
    '重新审视你的目标。',
    '你会得到你想要的，但不是以你想象的方式。',
    '大声说出你的想法。',
    '这取决于你的努力程度。',
    '别让负面情绪遮蔽了你的判断。',
    '这值得你去冒险。',
    '答案是肯定的。',
    '现在的答案是：不。'
  ];

  const flipBook = () => {
    if (isFlipped.value) {
      // 再次点击随机换一个答案并伴随微调动画
      isFlipped.value = false;
      setTimeout(() => {
        currentAnswer.value = answers[Math.floor(Math.random() * answers.length)];
        isFlipped.value = true;
      }, 300);
    } else {
      currentAnswer.value = answers[Math.floor(Math.random() * answers.length)];
      isFlipped.value = true;
    }
  };

  const resetBook = () => {
    isFlipped.value = false;
  };
</script>

<style scoped>
  .tool-page {
    min-height: 100vh;
    background: #fdfaf6; /* 淡淡的纸张感背景 */
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
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .book-container {
    width: 300px;
    height: 420px;
    perspective: 1500px;
    cursor: pointer;
    position: relative;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .book-face {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 8px 16px 16px 8px;
    backface-visibility: hidden;
    transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px;
    text-align: center;
  }

  .book-cover {
    background: linear-gradient(135deg, #2c3e50 0%, #000000 100%);
    color: #d4af37; /* 金色 */
    z-index: 2;
    border-left: 12px solid #1a252f;
  }

  .cover-content {
    border: 2px solid #d4af37;
    padding: 40px 20px;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-radius: 4px;
  }

  .ornament {
    font-size: 1.5rem;
    opacity: 0.8;
  }
  .book-title-main {
    font-size: 2.5rem;
    font-family: 'Noto Serif SC', serif;
    margin: 20px 0;
    letter-spacing: 4px;
  }
  .book-instruction {
    font-size: 0.85rem;
    color: #94a3b8;
    letter-spacing: 1px;
  }

  .book-inside {
    background: #fdfaf6;
    color: #334155;
    transform: rotateY(180deg);
    z-index: 1;
    border: 1px solid #e2e8f0;
  }

  .inside-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background-image:
      linear-gradient(90deg, rgba(230, 230, 230, 0.5) 0%, transparent 5%),
      linear-gradient(rgba(240, 240, 240, 1) 1px, transparent 1px);
    background-size:
      100% 100%,
      100% 32px;
  }

  .answer-text {
    font-size: 1.75rem;
    font-weight: 700;
    line-height: 1.5;
    font-family: 'Noto Serif SC', serif;
    padding: 0 10px;
  }

  .click-to-retry {
    position: absolute;
    bottom: 20px;
    left: 0;
    right: 0;
    font-size: 0.75rem;
    color: #94a3b8;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      opacity: 0.4;
    }
    50% {
      opacity: 0.8;
    }
    100% {
      opacity: 0.4;
    }
  }

  /* 翻转动画 */
  .is-flipped .book-cover {
    transform: rotateY(-180deg);
  }
  .is-flipped .book-inside {
    transform: rotateY(0deg);
  }

  .fade-scale-enter-active,
  .fade-scale-leave-active {
    transition: all 0.5s ease;
  }
  .fade-scale-enter-from {
    opacity: 0;
    transform: scale(0.9);
  }
  .fade-scale-leave-to {
    opacity: 0;
    transform: scale(1.1);
  }

  .tips-section {
    color: #64748b;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .animate-fade-in {
    animation: fadeIn 1s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #94a3b8;
    font-size: 0.85rem;
  }
</style>
