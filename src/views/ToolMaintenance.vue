<template>
  <div class="maintenance-page">
    <div class="maintenance-container">
      <!-- 图标区 -->
      <div class="icon-box">
        <div class="icon-shadow"></div>
        <div class="icon-content">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
            />
          </svg>
        </div>
      </div>

      <!-- 标题 -->
      <div class="title-box">
        <div class="title-shadow"></div>
        <h1 class="title-content">🔧 工具维护中</h1>
      </div>

      <!-- 工具名 -->
      <div v-if="toolName" class="tool-name-tag">
        <span class="tool-name-dot">●</span>
        {{ toolName }}
      </div>

      <!-- 公告卡片 -->
      <div class="notice-card">
        <div class="notice-shadow"></div>
        <div class="notice-content">
          <div class="notice-header">
            <span class="notice-badge">📢 维护公告</span>
            <span v-if="updatedAt" class="notice-time"> 更新于 {{ formatTime(updatedAt) }} </span>
          </div>
          <div class="notice-body">
            <p v-if="notice">{{ notice }}</p>
            <p v-else class="notice-default">
              该工具正在进行维护升级，请稍后再来访问。给您带来不便，敬请谅解！
            </p>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="actions">
        <button class="brutal-btn btn-primary" @click="goHome">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          返回首页
        </button>
        <button class="brutal-btn btn-secondary" @click="goBack">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          返回上一页
        </button>
      </div>

      <!-- 装饰元素 -->
      <div class="deco-circle deco-1"></div>
      <div class="deco-circle deco-2"></div>
      <div class="deco-square deco-3"></div>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useMaintenanceStore } from '@/stores/maintenance';
  import { tools } from '@/data/tools';

  const route = useRoute();
  const router = useRouter();
  const { getMaintenanceInfo } = useMaintenanceStore();

  // 从 query 中获取原始工具路由
  const originalRoute = computed(() => route.query.from || '');

  // 找到原始工具的信息
  const toolInfo = computed(() => {
    if (!originalRoute.value) return null;
    return tools.find(t => t.route === originalRoute.value) || null;
  });

  const toolName = computed(() => toolInfo.value?.name || '');

  // 获取维护信息
  const maintenanceInfo = computed(() => {
    if (!toolInfo.value) return null;
    return getMaintenanceInfo(toolInfo.value.id);
  });

  const notice = computed(() => maintenanceInfo.value?.notice || '');
  const updatedAt = computed(() => maintenanceInfo.value?.updatedAt || '');

  function formatTime(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function goHome() {
    router.push('/');
  }

  function goBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

  .maintenance-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fdfae5;
    background-image:
      linear-gradient(#e5e5e5 2px, transparent 2px),
      linear-gradient(90deg, #e5e5e5 2px, transparent 2px);
    background-size: 40px 40px;
    background-position: -2px -2px;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    padding: 2rem;
    position: relative;
    overflow: hidden;
  }

  .maintenance-container {
    max-width: 580px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    position: relative;
    z-index: 2;
  }

  /* 图标 */
  .icon-box {
    position: relative;
    display: inline-flex;
  }

  .icon-shadow {
    position: absolute;
    inset: 0;
    background: #111;
    transform: translate(6px, 6px);
    border-radius: 20px;
  }

  .icon-content {
    position: relative;
    z-index: 1;
    width: 100px;
    height: 100px;
    background: #ffd900;
    border: 4px solid #111;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #111;
    animation: wrenchSpin 3s ease-in-out infinite;
  }

  @keyframes wrenchSpin {
    0%,
    100% {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(15deg);
    }
    75% {
      transform: rotate(-15deg);
    }
  }

  /* 标题 */
  .title-box {
    position: relative;
    display: inline-block;
  }

  .title-shadow {
    position: absolute;
    inset: 0;
    background: #111;
    transform: translate(6px, 6px);
  }

  .title-content {
    position: relative;
    z-index: 1;
    margin: 0;
    padding: 0.75rem 2rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 2rem;
    font-weight: 800;
    background: #ff6b6b;
    border: 4px solid #111;
    color: #fff;
    white-space: nowrap;
  }

  /* 工具名标签 */
  .tool-name-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1.25rem;
    background: #fff;
    border: 3px solid #111;
    font-weight: 700;
    font-size: 1rem;
    color: #111;
    box-shadow: 4px 4px 0 #111;
  }

  .tool-name-dot {
    color: #ff6b6b;
    font-size: 0.75rem;
  }

  /* 公告卡片 */
  .notice-card {
    position: relative;
    width: 100%;
  }

  .notice-shadow {
    position: absolute;
    inset: 0;
    background: #111;
    transform: translate(6px, 6px);
    border-radius: 4px;
  }

  .notice-content {
    position: relative;
    z-index: 1;
    background: #fff;
    border: 4px solid #111;
    padding: 1.5rem;
  }

  .notice-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .notice-badge {
    background: #4b7bff;
    color: #fff;
    padding: 0.25rem 0.75rem;
    font-weight: 700;
    font-size: 0.875rem;
    border: 2px solid #111;
  }

  .notice-time {
    font-size: 0.8rem;
    color: #888;
    font-family: 'IBM Plex Mono', monospace;
  }

  .notice-body {
    line-height: 1.8;
    font-size: 1rem;
    color: #333;
  }

  .notice-body p {
    margin: 0;
    white-space: pre-wrap;
  }

  .notice-default {
    color: #666;
  }

  /* 按钮 */
  .actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .brutal-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.85rem 1.75rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    border: 4px solid #111;
    cursor: pointer;
    box-shadow: 5px 5px 0 #111;
    transition: all 0.15s;
    text-decoration: none;
  }

  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 8px 8px 0 #111;
  }

  .brutal-btn:active {
    transform: translate(3px, 3px);
    box-shadow: 0 0 0 #111;
  }

  .btn-primary {
    background: #00e572;
    color: #111;
  }

  .btn-secondary {
    background: #fff;
    color: #111;
  }

  .btn-secondary:hover {
    background: #ffd900;
  }

  /* 装饰元素 */
  .deco-circle {
    position: absolute;
    border-radius: 50%;
    border: 4px solid #111;
    z-index: 0;
    pointer-events: none;
  }

  .deco-1 {
    width: 120px;
    height: 120px;
    background: #c3b1ff;
    top: -40px;
    right: -40px;
    opacity: 0.5;
    animation: float 6s ease-in-out infinite;
  }

  .deco-2 {
    width: 80px;
    height: 80px;
    background: #ff9fb2;
    bottom: -20px;
    left: -30px;
    opacity: 0.4;
    animation: float 4s ease-in-out infinite reverse;
  }

  .deco-square {
    position: absolute;
    border: 4px solid #111;
    z-index: 0;
    pointer-events: none;
  }

  .deco-3 {
    width: 60px;
    height: 60px;
    background: #ffd900;
    top: 20%;
    left: -60px;
    opacity: 0.3;
    transform: rotate(15deg);
    animation: float 5s ease-in-out infinite;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0) rotate(0deg);
    }
    50% {
      transform: translateY(-15px) rotate(5deg);
    }
  }

  /* --- Dark Mode --- */
  [data-theme='dark'] .maintenance-page {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }

  [data-theme='dark'] .title-content {
    background: #cc3333;
  }

  [data-theme='dark'] .tool-name-tag {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 4px 4px 0 #eee;
  }

  [data-theme='dark'] .icon-shadow,
  [data-theme='dark'] .title-shadow,
  [data-theme='dark'] .notice-shadow {
    background: #eee;
  }

  [data-theme='dark'] .icon-content {
    border-color: #eee;
    background: #ffd900;
    color: #111;
  }

  [data-theme='dark'] .title-content {
    border-color: #eee;
  }

  [data-theme='dark'] .notice-content {
    background: #1a1a1a;
    border-color: #eee;
  }

  [data-theme='dark'] .notice-body {
    color: #ccc;
  }

  [data-theme='dark'] .notice-badge {
    border-color: #eee;
  }

  [data-theme='dark'] .brutal-btn {
    border-color: #eee;
    box-shadow: 5px 5px 0 #eee;
  }

  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 8px 8px 0 #eee;
  }

  [data-theme='dark'] .brutal-btn:active {
    box-shadow: 0 0 0 #eee;
  }

  [data-theme='dark'] .btn-primary {
    background: #00e572;
    color: #111;
  }

  [data-theme='dark'] .btn-secondary {
    background: #222;
    color: #eee;
  }

  [data-theme='dark'] .btn-secondary:hover {
    background: #ffd900;
    color: #111;
  }

  [data-theme='dark'] .deco-circle,
  [data-theme='dark'] .deco-square {
    border-color: #555;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .maintenance-page {
      padding: 1rem;
    }

    .title-content {
      font-size: 1.5rem;
      padding: 0.5rem 1.25rem;
    }

    .actions {
      flex-direction: column;
      width: 100%;
    }

    .brutal-btn {
      width: 100%;
      justify-content: center;
    }

    .deco-1,
    .deco-2,
    .deco-3 {
      display: none;
    }
  }
</style>
