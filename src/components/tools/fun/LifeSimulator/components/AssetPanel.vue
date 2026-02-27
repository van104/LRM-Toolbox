<template>
  <div class="assets-preview glass-panel">
    <h3>我的资产</h3>
    <div v-if="houses.length === 0 && cars.length === 0" class="empty-assets">
      暂无资产，继续奋斗吧！
    </div>
    <div class="asset-list-mini">
      <div v-for="house in houses" :key="house.id" class="mini-asset">
        <el-icon><House /></el-icon>
        {{ house.name }}
      </div>
      <div v-for="car in cars" :key="car.id" class="mini-asset">
        <el-icon><Van /></el-icon>
        {{ car.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { House, Van } from '@element-plus/icons-vue';
  import type { House as HouseType, Vehicle } from '@/data/life_simulator/types';

  defineProps<{
    houses: HouseType[];
    cars: Vehicle[];
  }>();
</script>

<style scoped>
  .assets-preview {
    padding: 1.5rem;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  h3 {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    color: #303133;
  }
  .empty-assets {
    color: #909399;
    font-size: 0.9rem;
    text-align: center;
    padding: 1rem 0;
  }
  .asset-list-mini {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  .mini-asset {
    display: flex;
    align-items: center;
    gap: 5px;
    background: #f0f2f5;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 12px;
    color: #606266;
  }
  .glass-panel {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
  }
</style>
