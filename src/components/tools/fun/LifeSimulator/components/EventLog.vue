<template>
  <div class="right-col glass-panel log-container">
    <div class="log-header">
      <h3>人生日志</h3>
      <el-tag v-if="degreeName">学历: {{ degreeName }}</el-tag>
    </div>
    <div ref="scrollContainerRef" class="log-scroll">
      <div v-for="(log, i) in currentLogs" :key="i" class="log-item fade-in-up">
        <div class="log-age">{{ log.age }}岁</div>
        <div class="log-content">
          <div class="log-text">{{ log.text }}</div>
          <div
            v-if="log.choices && log === logs[logs.length - 1] && pendingChoice"
            class="log-choices"
          >
            <button
              v-for="(choice, cIdx) in log.choices"
              :key="cIdx"
              class="choice-btn"
              @click="$emit('choice', choice)"
            >
              {{ choice.text }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, nextTick } from 'vue';

  const props = defineProps<{
    logs: any[];
    degreeName?: string;
    pendingChoice: boolean;
  }>();

  defineEmits(['choice']);

  const scrollContainerRef = ref<HTMLElement | null>(null);

  const currentLogs = computed(() => {
    return props.logs.slice().reverse();
  });

  watch(
    () => props.logs.length,
    () => {
      nextTick(() => {
        setTimeout(() => {
          if (scrollContainerRef.value) {
            scrollContainerRef.value.scrollTop = 0;
          }
        }, 50);
      });
    }
  );
</script>

<style scoped>
  .log-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    overflow: hidden;
  }
  .log-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #f0f2f5;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .log-header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #303133;
  }
  .log-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 1rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .log-item {
    display: flex;
    gap: 1rem;
    border-left: 2px solid #409eff;
    padding-left: 1rem;
    margin-bottom: 0.5rem;
  }
  .log-age {
    font-weight: 900;
    color: #409eff;
    font-size: 14px;
    min-width: 35px;
  }
  .log-text {
    line-height: 1.6;
    color: #303133;
  }
  .log-choices {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 15px;
  }
  .choice-btn {
    padding: 8px 16px;
    background: #409eff;
    color: #fff;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
  }
  .choice-btn:hover {
    background: #66b1ff;
    transform: scale(1.05);
  }
  .fade-in-up {
    animation: fadeInUp 0.4s ease-out backwards;
  }
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(15px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
