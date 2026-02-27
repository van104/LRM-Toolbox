<template>
  <header class="brutal-header">
    <div class="header-action start">
      <button class="brutal-btn back-btn" @click="$emit('back')">← 返回</button>
    </div>
    <h1 class="brutal-title">自动去背景<span>.AI()</span></h1>
    <div class="header-action end">
      <button class="brutal-btn clear-btn" :disabled="!hasResult" @click="$emit('download')">
        输出纯净实体图
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
  defineProps({
    hasResult: {
      type: Boolean,
      default: false
    }
  });

  defineEmits(['back', 'download']);
</script>

<style scoped>
  .brutal-header {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    margin-bottom: 2rem;
  }

  .header-action.start {
    display: flex;
    justify-content: flex-start;
  }
  .header-action.end {
    display: flex;
    justify-content: flex-end;
  }

  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.5rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #ff4b4b;
  }

  .brutal-title span {
    color: #ff4b4b;
    text-shadow: 4px 4px 0px #111;
    letter-spacing: 0;
  }

  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }

  .brutal-btn:hover:not(:disabled) {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }
  .brutal-btn:active:not(:disabled) {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }
  .brutal-btn:disabled {
    background: #e0e0e0;
    color: #888;
    border-color: #888;
    box-shadow: 2px 2px 0px #888;
    cursor: not-allowed;
    transform: none;
  }
  .brutal-btn.clear-btn {
    background: #ff4b4b;
    color: #fff;
  }

  @media (max-width: 768px) {
    .brutal-header {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    .brutal-title {
      font-size: 2rem;
    }
    .header-action {
      justify-content: center !important;
    }
  }
</style>
