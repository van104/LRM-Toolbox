<template>
  <div class="start-screen fade-in">
    <div class="card glass-panel">
      <h2>调整初始属性</h2>
      <p class="subtitle">
        剩余可用点数: <span class="points-val">{{ availablePoints }}</span>
      </p>

      <div class="stats-allocation">
        <div v-for="stat in stats" :key="stat.key" class="alloc-row">
          <span class="label">
            <el-icon><component :is="stat.icon" /></el-icon>
            {{ stat.label }}
          </span>
          <el-slider
            v-model="internalStats[stat.key]"
            :min="0"
            :max="100"
            show-input
            class="alloc-slider"
            @input="(val: number) => emit('change', stat.key, val)"
          />
        </div>
      </div>

      <div v-if="selectedTalent" class="talent-summary">
        当前天赋: <strong>{{ selectedTalent.name }}</strong> ({{ selectedTalent.desc }})
      </div>

      <div class="actions">
        <el-button @click="$emit('back')">上一步</el-button>
        <el-button type="primary" :disabled="availablePoints < 0" @click="$emit('start')"
          >开始人生</el-button
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, watch } from 'vue';
  import type { Component } from 'vue';
  import { FirstAidKit, Reading, Camera, Sunny } from '@element-plus/icons-vue';
  import type { Talent, GameState, Stats } from '@/data/life_simulator/types';

  const props = defineProps<{
    availablePoints: number;
    tempStats: Partial<GameState> | null;
    selectedTalent: Talent | null;
  }>();

  const emit = defineEmits(['change', 'back', 'start']);

  const internalStats = reactive<Stats>({
    health: props.tempStats?.health || 0,
    smarts: props.tempStats?.smarts || 0,
    looks: props.tempStats?.looks || 0,
    happiness: props.tempStats?.happiness || 0
  });

  watch(
    () => props.tempStats,
    newStats => {
      if (newStats) {
        internalStats.health = newStats.health || 0;
        internalStats.smarts = newStats.smarts || 0;
        internalStats.looks = newStats.looks || 0;
        internalStats.happiness = newStats.happiness || 0;
      }
    },
    { deep: true }
  );

  const stats: { key: keyof Stats; label: string; icon: Component }[] = [
    { key: 'health', label: '健康', icon: FirstAidKit },
    { key: 'smarts', label: '智力', icon: Reading },
    { key: 'looks', label: '颜值', icon: Camera },
    { key: 'happiness', label: '幸福', icon: Sunny }
  ];
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
    max-width: 600px;
    width: 90%;
  }
  .glass-panel {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  h2 {
    margin-bottom: 1rem;
  }
  .subtitle {
    margin-bottom: 2rem;
    color: #606266;
  }
  .points-val {
    font-weight: bold;
    color: #409eff;
    font-size: 1.25rem;
  }
  .stats-allocation {
    margin-bottom: 2rem;
  }
  .alloc-row {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }
  .label {
    width: 80px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: bold;
    color: #303133;
  }
  .alloc-slider {
    flex: 1;
  }
  .talent-summary {
    background: #fdf6ec;
    border: 1px solid #faecd8;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 2rem;
    color: #e6a23c;
    font-size: 0.9rem;
  }
  .actions {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
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
