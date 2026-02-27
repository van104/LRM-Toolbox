<template>
  <div class="stats-box glass-panel">
    <div v-for="stat in stats" :key="stat.key" class="stat-row">
      <span class="stat-label">
        <el-icon><component :is="stat.icon" /></el-icon>
        {{ stat.label }}
      </span>
      <el-progress :percentage="valueMap[stat.key]" :status="stat.status" :color="stat.color" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { FirstAidKit, Sunny, Reading, Camera } from '@element-plus/icons-vue';

  interface ValueMap {
    health: number;
    happiness: number;
    smarts: number;
    looks: number;
  }

  defineProps<{
    valueMap: ValueMap;
  }>();

  interface StatItem {
    key: keyof ValueMap;
    label: string;
    icon: object;
    status?: 'success' | 'exception' | 'warning';
    color?: string;
  }

  const stats: StatItem[] = [
    { key: 'health', label: '健康', icon: FirstAidKit, status: 'success' },
    { key: 'happiness', label: '快乐', icon: Sunny, color: '#e6a23c' },
    { key: 'smarts', label: '智力', icon: Reading },
    { key: 'looks', label: '颜值', icon: Camera, color: '#f56c6c' }
  ];
</script>

<style scoped>
  .stats-box {
    padding: 1.5rem;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  .glass-panel {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
  }
  .stat-row {
    margin-bottom: 1.25rem;
  }
  .stat-row:last-child {
    margin-bottom: 0;
  }
  .stat-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    font-weight: bold;
    color: #606266;
    margin-bottom: 0.5rem;
  }
</style>
