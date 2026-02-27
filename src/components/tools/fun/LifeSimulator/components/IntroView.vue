<template>
  <div class="start-screen fade-in">
    <div class="card glass-panel">
      <h2>开启新的人生</h2>
      <div class="intro-text">
        <p>你将经历一段未知的旅程。</p>
        <p>你的天赋由上天决定，但命运掌握在自己手中。</p>
      </div>

      <div v-if="hasSave" class="load-section">
        <el-button type="success" size="large" @click="$emit('load')">读取存档</el-button>
        <el-divider>或者</el-divider>
      </div>

      <div class="actions">
        <el-button type="primary" size="large" @click="$emit('start')">新的人生 (抽卡)</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineProps<{ hasSave: boolean }>();
  defineEmits(['load', 'start']);
</script>

<style scoped>
  .start-screen {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .card {
    background: #fff;
    padding: 2.5rem;
    border-radius: 16px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
    text-align: center;
    max-width: 500px;
    width: 90%;
  }
  .glass-panel {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  h2 {
    font-size: 2rem;
    margin-bottom: 1.5rem;
    color: #303133;
  }
  .intro-text {
    margin-bottom: 2rem;
    color: #606266;
    line-height: 1.8;
  }
  .load-section {
    margin-bottom: 2rem;
  }
  .actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }
  .fade-in {
    animation: fadeIn 0.5s ease-out;
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
</style>
