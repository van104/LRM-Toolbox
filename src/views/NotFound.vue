<template>
  <div class="brutal-404">
    <div class="grid-bg"></div>

    <div class="content">
      <!-- 大字 404 -->
      <div class="error-block">
        <div class="four left-four">4</div>
        <div class="zero-wrap">
          <div class="zero">0</div>
          <div class="zero-eye left-eye"></div>
          <div class="zero-eye right-eye"></div>
        </div>
        <div class="four right-four">4</div>
      </div>

      <!-- 错误信息 -->
      <div class="info-card">
        <div class="info-header">
          <span class="err-badge">ERROR_404</span>
          <span class="err-status">PAGE_NOT_FOUND</span>
        </div>
        <h1 class="error-title">{{ t('notFound.title') }}</h1>
        <p class="error-desc">{{ t('notFound.desc') }}</p>
      </div>

      <!-- 按钮组 -->
      <div class="btn-group">
        <button class="brutal-btn primary-btn" @click="$router.push('/')">
          🏠 {{ t('notFound.backHome') }}
        </button>
        <button class="brutal-btn secondary-btn" @click="$router.back()">← 返回上页</button>
      </div>

      <!-- 装饰提示 -->
      <div class="footer-tip">
        // 404.html &nbsp;·&nbsp; Status: Not Found &nbsp;·&nbsp; © 2026 LRM工具箱
      </div>
    </div>
  </div>
</template>

<script setup>
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@600;800;900&family=Noto+Sans+SC:wght@400;700;900&display=swap');

  .brutal-404 {
    min-height: 100vh;
    background-color: #fdfae5;
    background-image:
      linear-gradient(#e0e0e0 2px, transparent 2px),
      linear-gradient(90deg, #e0e0e0 2px, transparent 2px);
    background-size: 40px 40px;
    background-position: -2px -2px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    box-sizing: border-box;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    position: relative;
    overflow: hidden;
  }

  .grid-bg {
    display: none;
  }

  /* 404 大字 */
  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2.5rem;
    z-index: 1;
  }

  .error-block {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    user-select: none;
  }

  .four {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 14rem;
    font-weight: 900;
    line-height: 1;
    color: #111;
    text-shadow: 8px 8px 0px #ff4b4b;
    transition: transform 0.15s;
  }

  .left-four {
    transform: rotate(-5deg);
  }
  .right-four {
    transform: rotate(5deg);
  }
  .four:hover {
    transform: rotate(0deg) scale(1.05);
  }

  /* 0 眼睛 */
  .zero-wrap {
    position: relative;
    display: inline-block;
  }

  .zero {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 14rem;
    font-weight: 900;
    line-height: 1;
    color: #fff;
    -webkit-text-stroke: 8px #111;
    text-shadow: 8px 8px 0px #ffd900;
  }

  .zero-eye {
    position: absolute;
    top: 38%;
    width: 22px;
    height: 22px;
    background: #111;
    border-radius: 50%;
    animation: blink 3s infinite;
  }

  .left-eye {
    left: 38%;
  }
  .right-eye {
    right: 28%;
  }

  @keyframes blink {
    0%,
    90%,
    100% {
      transform: scaleY(1);
    }
    95% {
      transform: scaleY(0.1);
    }
  }

  /* Info Card */
  .info-card {
    border: 4px solid #111;
    background: #fff;
    box-shadow: 10px 10px 0px #111;
    max-width: 560px;
    width: 100%;
  }

  .info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 1.5rem;
    background: #ff4b4b;
    border-bottom: 4px solid #111;
  }

  .err-badge {
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    font-size: 1rem;
    color: #fff;
    letter-spacing: 1px;
  }

  .err-status {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.85rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
  }

  .error-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.6rem;
    font-weight: 800;
    margin: 0;
    padding: 1.5rem 1.5rem 0.5rem;
    color: #111;
  }

  .error-desc {
    font-size: 1rem;
    color: #555;
    padding: 0 1.5rem 1.5rem;
    margin: 0;
    line-height: 1.6;
    font-weight: 600;
  }

  /* Buttons */
  .btn-group {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .brutal-btn {
    border: 4px solid #111;
    padding: 1rem 2rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.2rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 7px 7px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 10px 10px 0px #111;
  }

  .brutal-btn:active {
    transform: translate(7px, 7px);
    box-shadow: 0px 0px 0px #111;
  }

  .primary-btn {
    background: #ffd900;
    color: #111;
  }
  .secondary-btn {
    background: #fff;
    color: #111;
  }

  /* Footer Tip */
  .footer-tip {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.85rem;
    font-weight: 600;
    color: #888;
    letter-spacing: 0.5px;
  }

  @media (max-width: 640px) {
    .four {
      font-size: 7rem;
    }
    .zero {
      font-size: 7rem;
    }
    .zero-eye {
      width: 12px;
      height: 12px;
      top: 36%;
    }
    .btn-group {
      flex-direction: column;
    }
    .brutal-btn {
      width: 100%;
      text-align: center;
    }
  }

  /* Dark Mode */
  [data-theme='dark'] .brutal-404 {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }

  [data-theme='dark'] .four {
    color: #eee;
    text-shadow: 8px 8px 0px #ff4b4b;
  }

  [data-theme='dark'] .zero {
    color: #111;
    -webkit-text-stroke: 8px #eee;
    text-shadow: 8px 8px 0px #b28f00;
  }

  [data-theme='dark'] .zero-eye {
    background: #eee;
  }

  [data-theme='dark'] .info-card {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 10px 10px 0px #eee;
  }

  [data-theme='dark'] .info-header {
    background: #cc3c3c;
    border-bottom-color: #eee;
  }

  [data-theme='dark'] .error-title {
    color: #eee;
  }
  [data-theme='dark'] .error-desc {
    color: #aaa;
  }

  [data-theme='dark'] .brutal-btn {
    border-color: #eee;
    box-shadow: 7px 7px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 10px 10px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }
  [data-theme='dark'] .primary-btn {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .secondary-btn {
    background: #1a1a1a;
    color: #eee;
  }
  [data-theme='dark'] .footer-tip {
    color: #555;
  }
</style>
