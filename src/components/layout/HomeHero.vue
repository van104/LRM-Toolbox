<template>
  <section class="brutal-hero">
    <!-- 几何装饰元素 -->
    <div class="hero-decorative-box deco-1"></div>
    <div class="hero-decorative-box deco-2"></div>
    <div class="hero-decorative-box deco-3"></div>
    <div class="hero-decorative-box deco-4"></div>
    <div class="hero-decorative-box deco-5"></div>
    <div class="hero-decorative-box deco-6"></div>

    <!-- 圆形装饰 -->
    <div class="hero-deco-circle circle-1"></div>
    <div class="hero-deco-circle circle-2"></div>
    <div class="hero-deco-circle circle-3"></div>

    <!-- 十字形装饰 -->
    <div class="hero-deco-cross cross-1">+</div>
    <div class="hero-deco-cross cross-2">+</div>

    <!-- 工具主题 Emoji 装饰 -->
    <div class="hero-deco-emoji emoji-1">⚡</div>
    <div class="hero-deco-emoji emoji-2">🔧</div>
    <div class="hero-deco-emoji emoji-3">🎨</div>
    <div class="hero-deco-emoji emoji-4">📐</div>
    <div class="hero-deco-emoji emoji-5">💻</div>
    <div class="hero-deco-emoji emoji-6">🚀</div>

    <!-- 点阵装饰 -->
    <div class="hero-deco-dots dots-left">
      <span v-for="d in 9" :key="d" class="dot"></span>
    </div>
    <div class="hero-deco-dots dots-right">
      <span v-for="d in 9" :key="d" class="dot"></span>
    </div>

    <!-- 锯齿线装饰 -->
    <svg class="hero-deco-zigzag zigzag-1" viewBox="0 0 120 24" fill="none">
      <polyline
        points="0,20 15,4 30,20 45,4 60,20 75,4 90,20 105,4 120,20"
        stroke="#111"
        stroke-width="3"
        fill="none"
      />
    </svg>
    <svg class="hero-deco-zigzag zigzag-2" viewBox="0 0 120 24" fill="none">
      <polyline
        points="0,20 15,4 30,20 45,4 60,20 75,4 90,20 105,4 120,20"
        stroke="#111"
        stroke-width="3"
        fill="none"
      />
    </svg>

    <h1 class="brutal-hero-title">
      <span>{{ t('app.title') }}</span>
    </h1>
    <p class="brutal-hero-subtitle">{{ t('home.subtitle') }}</p>

    <div class="hero-search-wrapper">
      <div class="brutal-search-container">
        <el-icon class="search-icon"><SearchIcon /></el-icon>
        <input
          :value="modelValue"
          type="text"
          :placeholder="t('home.searchPlaceholder', { count: totalToolsCount })"
          class="brutal-search-input"
          @input="$emit('update:modelValue', $event.target.value)"
        />
        <div class="search-shortcut">
          <span class="cmd-key">CTRL</span> + <span class="cmd-key">K</span>
        </div>
      </div>

      <div v-if="isDev" class="test-bench-entry">
        <button class="brutal-btn-primary" @click="$emit('go-test-bench')">
          进入开发测试台 (SANDBOX)
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { Search as SearchIcon } from '@element-plus/icons-vue';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  defineProps({
    modelValue: {
      type: String,
      default: ''
    },
    totalToolsCount: {
      type: Number,
      default: 0
    },
    isDev: {
      type: Boolean,
      default: false
    }
  });

  defineEmits(['update:modelValue', 'go-test-bench']);
</script>

<style scoped>
  .brutal-hero {
    position: relative;
    text-align: center;
    padding: 5rem 2rem 4rem;
    margin-bottom: 2rem;
    border-bottom: 4px solid #111;
    background: #fff;
    box-shadow: 0px 8px 0px #111;
    overflow: hidden;
  }

  .hero-decorative-box {
    position: absolute;
    border: 4px solid #111;
    background: #ffd900;
    box-shadow: 6px 6px 0px #111;
    z-index: 0;
    pointer-events: none;
  }

  .deco-1 {
    width: 60px;
    height: 60px;
    top: 20%;
    left: 10%;
    transform: rotate(-15deg);
    background: #00e572;
    animation: float-slow 6s ease-in-out infinite;
  }

  .deco-2 {
    width: 80px;
    height: 80px;
    bottom: 30%;
    right: 12%;
    transform: rotate(25deg);
    background: #ff4b4b;
    animation: float-slow 5s ease-in-out infinite reverse;
  }

  .deco-3 {
    width: 40px;
    height: 40px;
    top: 65%;
    left: 5%;
    transform: rotate(45deg);
    background: #ffd900;
    animation: float-slow 7s ease-in-out infinite;
  }

  .deco-4 {
    width: 50px;
    height: 50px;
    top: 12%;
    right: 8%;
    transform: rotate(-8deg);
    background: #4b7bff;
    animation: float-slow 8s ease-in-out infinite reverse;
  }

  .deco-5 {
    width: 35px;
    height: 35px;
    bottom: 15%;
    left: 18%;
    transform: rotate(30deg);
    background: #ff9fb2;
    box-shadow: 4px 4px 0px #111;
    animation: float-slow 5.5s ease-in-out infinite;
  }

  .deco-6 {
    width: 28px;
    height: 28px;
    top: 35%;
    right: 22%;
    transform: rotate(-20deg);
    background: #00e572;
    box-shadow: 3px 3px 0px #111;
    animation: float-slow 6.5s ease-in-out infinite reverse;
  }

  /* 圆形装饰 */
  .hero-deco-circle {
    position: absolute;
    border: 4px solid #111;
    border-radius: 50%;
    z-index: 0;
    pointer-events: none;
  }

  .circle-1 {
    width: 45px;
    height: 45px;
    top: 30%;
    left: 22%;
    background: #ffd900;
    box-shadow: 4px 4px 0px #111;
    animation: float-slow 7s ease-in-out infinite;
  }

  .circle-2 {
    width: 30px;
    height: 30px;
    top: 18%;
    right: 18%;
    background: #ff9fb2;
    box-shadow: 3px 3px 0px #111;
    animation: float-slow 5s ease-in-out infinite reverse;
  }

  .circle-3 {
    width: 55px;
    height: 55px;
    bottom: 20%;
    right: 25%;
    background: transparent;
    border-width: 5px;
    border-style: dashed;
    border-color: #4b7bff;
    box-shadow: none;
    animation: spin-slow 20s linear infinite;
  }

  /* 十字形装饰 */
  .hero-deco-cross {
    position: absolute;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    color: #111;
    z-index: 0;
    pointer-events: none;
    line-height: 1;
  }

  .cross-1 {
    font-size: 4rem;
    top: 55%;
    left: 7%;
    transform: rotate(15deg);
    color: #4b7bff;
    animation: float-slow 6s ease-in-out infinite;
    opacity: 0.6;
  }

  .cross-2 {
    font-size: 3rem;
    bottom: 45%;
    right: 6%;
    transform: rotate(-10deg);
    color: #ff4b4b;
    animation: float-slow 5s ease-in-out infinite reverse;
    opacity: 0.5;
  }

  /* 工具 Emoji 装饰 */
  .hero-deco-emoji {
    position: absolute;
    z-index: 0;
    pointer-events: none;
    filter: grayscale(0.1);
    opacity: 0.35;
  }

  .emoji-1 {
    font-size: 2.5rem;
    top: 12%;
    left: 3%;
    transform: rotate(-20deg);
    animation: float-slow 4s ease-in-out infinite;
  }

  .emoji-2 {
    font-size: 2rem;
    top: 60%;
    left: 28%;
    transform: rotate(15deg);
    animation: float-slow 5.5s ease-in-out infinite reverse;
  }

  .emoji-3 {
    font-size: 2.2rem;
    bottom: 12%;
    right: 8%;
    transform: rotate(-12deg);
    animation: float-slow 6s ease-in-out infinite;
  }

  .emoji-4 {
    font-size: 1.8rem;
    top: 8%;
    right: 28%;
    transform: rotate(20deg);
    animation: float-slow 7s ease-in-out infinite reverse;
  }

  .emoji-5 {
    font-size: 2rem;
    bottom: 35%;
    left: 15%;
    transform: rotate(-5deg);
    animation: float-slow 4.5s ease-in-out infinite;
  }

  .emoji-6 {
    font-size: 2.3rem;
    top: 40%;
    right: 3%;
    transform: rotate(8deg);
    animation: float-slow 5s ease-in-out infinite reverse;
  }

  /* 点阵装饰 */
  .hero-deco-dots {
    position: absolute;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    z-index: 0;
    pointer-events: none;
  }

  .dots-left {
    bottom: 12%;
    left: 3%;
  }

  .dots-right {
    top: 8%;
    right: 4%;
  }

  .hero-deco-dots .dot {
    width: 8px;
    height: 8px;
    background: #111;
    border-radius: 50%;
    opacity: 0.25;
  }

  /* 锯齿线装饰 */
  .hero-deco-zigzag {
    position: absolute;
    z-index: 0;
    pointer-events: none;
    opacity: 0.2;
  }

  .zigzag-1 {
    width: 120px;
    bottom: 8%;
    left: 30%;
    transform: rotate(-5deg);
  }

  .zigzag-2 {
    width: 100px;
    top: 5%;
    right: 15%;
    transform: rotate(8deg);
  }

  /* 浮动动画 */
  @keyframes float-slow {
    0%,
    100% {
      transform: translateY(0) rotate(var(--rotate, 0deg));
    }
    50% {
      transform: translateY(-12px) rotate(var(--rotate, 0deg));
    }
  }

  @keyframes spin-slow {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .brutal-hero-title {
    font-family: 'Syne', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Heiti SC', sans-serif;
    font-size: 5rem;
    font-weight: 900;
    margin: 0 0 2rem 0;
    color: #111;
    text-transform: uppercase;
    letter-spacing: -2px;
    line-height: 1.1;
    position: relative;
    display: inline-block;
    -webkit-text-stroke: 1px #111;
  }

  .brutal-hero-title span {
    text-shadow:
      6px 6px 0px #ff4b4b,
      10px 10px 0px #111;
    display: inline-block;
    transition: transform 0.2s;
  }

  .brutal-hero-title span:hover {
    transform: translateY(-5px) rotate(-2deg);
  }

  .brutal-hero-subtitle {
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-size: 1.35rem;
    font-weight: 600;
    color: #111;
    margin-bottom: 3rem;
    position: relative;
    z-index: 2;
    background: #ffd900;
    display: inline-block;
    padding: 0.5rem 1rem;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
  }

  .hero-search-wrapper {
    max-width: 800px;
    margin: 0 auto;
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .brutal-search-container {
    display: flex;
    align-items: center;
    width: 100%;
    border: 4px solid #111;
    background: #fff;
    box-shadow: 8px 8px 0px #111;
    transition: all 0.2s;
    height: 70px;
  }

  .brutal-search-container:focus-within {
    transform: translate(-4px, -4px);
    box-shadow: 12px 12px 0px #111;
  }

  .search-icon {
    font-size: 1.8rem;
    margin-left: 1.5rem;
    color: #4b7bff;
    font-weight: 800;
  }

  .brutal-search-input {
    flex: 1;
    height: 100%;
    border: none;
    background: transparent;
    padding: 0 1.5rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-size: 1.3rem;
    font-weight: 600;
    color: #111;
    outline: none;
  }

  .brutal-search-input::placeholder {
    color: #888;
    font-style: italic;
  }

  .search-shortcut {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-right: 1.5rem;
    font-weight: 600;
  }

  .cmd-key {
    background: #111;
    color: #fff;
    padding: 0.3rem 0.6rem;
    font-size: 0.85rem;
    box-shadow: 3px 3px 0px #ff4b4b;
  }

  .brutal-btn-primary {
    background: #00e572;
    border: 4px solid #111;
    padding: 1rem 2rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.25rem;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
    color: #111;
    margin-top: 1rem;
  }

  .brutal-btn-primary:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }

  .brutal-btn-primary:active {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px #111;
  }

  @media (max-width: 1024px) {
    .brutal-hero-title {
      font-size: 3.5rem;
    }
    .deco-3,
    .deco-4,
    .deco-5,
    .deco-6,
    .circle-1,
    .circle-2,
    .circle-3,
    .cross-1,
    .cross-2,
    .emoji-2,
    .emoji-4,
    .emoji-5,
    .hero-deco-dots,
    .hero-deco-zigzag {
      display: none;
    }
  }

  @media (max-width: 768px) {
    .brutal-hero-title {
      font-size: 2.5rem;
    }
    .brutal-hero-subtitle {
      font-size: 1rem;
    }
    .brutal-search-container {
      height: 60px;
    }
    .brutal-search-input {
      font-size: 1rem;
    }
    .search-shortcut {
      display: none;
    }
    .deco-1,
    .deco-2,
    .hero-deco-emoji,
    .hero-deco-cross {
      display: none;
    }
  }

  /* --- Dark Mode Overrides --- */
  [data-theme='dark'] .brutal-hero {
    background: #1a1a1a;
    border-bottom-color: #eee;
    box-shadow: 0px 8px 0px #eee;
  }

  [data-theme='dark'] .hero-decorative-box {
    border-color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .deco-1 {
    background: #00994c;
  }
  [data-theme='dark'] .deco-2 {
    background: #cc0000;
  }
  [data-theme='dark'] .deco-3 {
    background: #b28f00;
  }
  [data-theme='dark'] .deco-4 {
    background: #2a4eb2;
  }
  [data-theme='dark'] .deco-5 {
    background: #b25465;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .deco-6 {
    background: #00994c;
    box-shadow: 3px 3px 0px #eee;
  }

  [data-theme='dark'] .hero-deco-circle {
    border-color: #eee;
  }
  [data-theme='dark'] .circle-1 {
    background: #b28f00;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .circle-2 {
    background: #b25465;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .circle-3 {
    border-color: #2a4eb2;
  }

  [data-theme='dark'] .hero-deco-cross {
    color: #eee;
    opacity: 0.3;
  }
  [data-theme='dark'] .cross-1 {
    color: #2a4eb2;
  }
  [data-theme='dark'] .cross-2 {
    color: #cc0000;
  }

  [data-theme='dark'] .hero-deco-emoji {
    opacity: 0.2;
  }

  [data-theme='dark'] .hero-deco-dots .dot {
    background: #eee;
    opacity: 0.15;
  }

  [data-theme='dark'] .hero-deco-zigzag polyline {
    stroke: #eee;
  }

  [data-theme='dark'] .brutal-hero-title {
    color: #eee;
    -webkit-text-stroke: 1px #eee;
  }
  [data-theme='dark'] .brutal-hero-title span {
    text-shadow:
      6px 6px 0px #cc0000,
      10px 10px 0px #eee;
  }

  [data-theme='dark'] .brutal-hero-subtitle {
    background: #b28f00;
    color: #fff;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .brutal-search-container {
    background: #222;
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-search-container:focus-within {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .brutal-search-input {
    color: #eee;
  }
  [data-theme='dark'] .search-icon {
    color: #2a4eb2;
  }
  [data-theme='dark'] .cmd-key {
    background: #eee;
    color: #111;
    box-shadow: 3px 3px 0px #cc0000;
  }
</style>
