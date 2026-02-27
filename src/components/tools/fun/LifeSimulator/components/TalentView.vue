<template>
  <div class="start-screen fade-in">
    <div class="card glass-panel wide-panel">
      <h2>请选择你的天赋命格 (3选1)</h2>
      <div class="talent-cards">
        <div
          v-for="talent in options"
          :key="talent.id"
          class="talent-card"
          :class="['rarity-' + talent.rarity, { selected: selectedId === talent.id }]"
          @click="$emit('select', talent)"
        >
          <div class="talent-header">
            <h3>{{ talent.name }}</h3>
            <span class="rarity-badge">{{ talent.rarity }}</span>
          </div>
          <p class="talent-desc">{{ talent.desc }}</p>
        </div>
      </div>
      <div class="actions">
        <el-button @click="$emit('back')">返回</el-button>
        <el-button type="primary" :disabled="!selectedId" @click="$emit('confirm')"
          >下一步</el-button
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { Talent } from '@/data/life_simulator/types';
  defineProps<{
    options: Talent[];
    selectedId?: string;
  }>();
  defineEmits(['select', 'back', 'confirm']);
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
    padding: 2rem;
    border-radius: 16px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
    text-align: center;
    width: 90%;
  }
  .wide-panel {
    max-width: 900px;
  }
  .glass-panel {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  h2 {
    margin-bottom: 2rem;
  }
  .talent-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2.5rem;
  }
  .talent-card {
    padding: 1.5rem;
    border: 2px solid #eee;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
    text-align: left;
    position: relative;
    background: #fff;
  }
  .talent-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
  .talent-card.selected {
    border-color: #409eff;
    background: #f0f7ff;
    box-shadow: 0 0 0 2px #409eff;
  }
  .talent-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  .talent-header h3 {
    margin: 0;
    font-size: 1.25rem;
  }
  .rarity-badge {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: bold;
    color: #fff;
  }
  .rarity-SSR {
    background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
    border-color: #ff9a9e;
  }
  .rarity-SSR .rarity-badge {
    background: #f56c6c;
  }
  .rarity-SR {
    background: #f0f7ff;
    border-color: #409eff;
  }
  .rarity-SR .rarity-badge {
    background: #409eff;
  }
  .rarity-R {
    background: #f0f9eb;
    border-color: #67c23a;
  }
  .rarity-R .rarity-badge {
    background: #67c23a;
  }
  .rarity-N {
    background: #f4f4f5;
    border-color: #909399;
  }
  .rarity-N .rarity-badge {
    background: #909399;
  }
  .talent-desc {
    font-size: 0.9rem;
    color: #606266;
    line-height: 1.6;
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
