<template>
  <div class="brutal-tool-shell">
    <div class="brutal-container">
      <!-- Header -->
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">
          {{ title }}<span v-if="titleHighlight">.{{ titleHighlight }}</span>
        </h1>
        <div class="header-actions">
          <slot name="header-actions" />
        </div>
      </header>

      <!-- Loading State -->
      <div v-if="loading" class="brutal-loading">
        <slot name="loading">
          <div class="loading-skeleton">
            <div class="skeleton-pane" />
            <div class="skeleton-pane" />
          </div>
        </slot>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="brutal-error">
        <slot name="error">
          <div class="error-box">
            <span class="error-icon">⚠️</span>
            <p>{{ error }}</p>
            <button class="brutal-btn" @click="$emit('retry')">重试</button>
          </div>
        </slot>
      </div>

      <!-- Default Content -->
      <slot v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    title: string;
    titleHighlight?: string;
    loading?: boolean;
    error?: string | null;
  }>();

  defineEmits<{
    retry: [];
  }>();

  const goBack = () => {
    history.back();
  };
</script>

<style scoped>
  /* ==================== Font Import ==================== */
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

  /* ==================== Shell Layout ==================== */
  .brutal-tool-shell {
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
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }

  /* ==================== Header ==================== */
  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.5rem;
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
    letter-spacing: 0;
  }

  .header-actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  /* ==================== Brutal Button ==================== */
  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 6px 6px 0 #111;
    transition: all 0.1s;
    text-transform: uppercase;
    color: #111;
  }

  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0 #111;
  }

  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0 0 0 #111;
  }

  /* ==================== Pane / Card ==================== */
  .brutal-pane {
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0 #111;
  }

  .pane-header {
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.25rem;
  }

  .pane-body {
    padding: 2rem;
    flex: 1;
  }

  /* ==================== Input ==================== */
  .brutal-input {
    width: 100%;
    padding: 0.75rem 1rem;
    font-size: 1.1rem;
    border: 4px solid #111;
    background: #fff;
    font-weight: 700;
    box-sizing: border-box;
    box-shadow: 4px 4px 0 #111;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    color: #111;
    transition: all 0.1s;
  }

  .brutal-input:focus {
    outline: none;
    box-shadow: 6px 6px 0 #4b7bff;
    transform: translate(-2px, -2px);
  }

  /* ==================== Loading / Error States ==================== */
  .brutal-loading {
    padding: 4rem 0;
  }

  .loading-skeleton {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2.5rem;
  }

  .skeleton-pane {
    height: 300px;
    background: #e5e5e5;
    border: 4px solid #111;
    box-shadow: 12px 12px 0 #111;
    animation: skeleton-pulse 1.5s ease-in-out infinite;
  }

  @keyframes skeleton-pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .brutal-error {
    display: flex;
    justify-content: center;
    padding: 4rem 0;
  }

  .error-box {
    background: #fff;
    border: 4px solid #ff4b4b;
    padding: 3rem;
    text-align: center;
    box-shadow: 12px 12px 0 #ff4b4b;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .error-icon {
    font-size: 4rem;
  }

  .error-box p {
    font-size: 1.2rem;
    font-weight: 700;
    color: #ff4b4b;
  }

  /* ==================== Responsive ==================== */
  @media (max-width: 900px) {
    .brutal-tool-shell {
      padding: 1rem;
    }

    .brutal-title {
      font-size: 2rem;
    }

    .loading-skeleton {
      grid-template-columns: 1fr;
    }
  }

  /* ==================== Dark Mode ==================== */
  [data-theme='dark'] .brutal-tool-shell {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-input {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn {
    box-shadow: 6px 6px 0 #eee;
  }

  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 9px 9px 0 #eee;
  }

  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0 #eee;
  }

  [data-theme='dark'] .brutal-input {
    box-shadow: 4px 4px 0 #eee;
  }

  [data-theme='dark'] .brutal-input:focus {
    box-shadow: 6px 6px 0 #4b7bff;
  }

  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }

  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0 #eee;
  }

  [data-theme='dark'] .skeleton-pane {
    background: #222;
    border-color: #eee;
    box-shadow: 12px 12px 0 #eee;
  }

  [data-theme='dark'] .error-box {
    background: #1a1a1a;
    border-color: #ff6b6b;
    box-shadow: 12px 12px 0 #ff6b6b;
  }

  [data-theme='dark'] .error-box p {
    color: #ff6b6b;
  }
</style>
