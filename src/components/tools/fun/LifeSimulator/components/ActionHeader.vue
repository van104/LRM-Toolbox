<template>
  <div class="hud-panel glass-panel">
    <div class="hud-item user-info">
      <div class="avatar">{{ age }}岁</div>
      <div class="info-text">
        <div class="name">角色</div>
        <div class="job">{{ jobName }}</div>
      </div>
    </div>
    <div class="hud-item assets">
      <div class="asset-row" title="现金">
        <el-icon><Wallet /></el-icon>
        ￥{{ wealth.toLocaleString() }}
      </div>
      <div class="asset-row" title="存款">
        <el-icon><Money /></el-icon>
        ￥{{ savings.toLocaleString() }}
      </div>
      <div class="asset-row" title="房产">{{ houseCount }} 套</div>
      <div class="asset-row" title="车辆">{{ carCount }} 辆</div>
    </div>
    <div class="hud-item date-info">
      <el-button
        v-if="isAlive"
        type="primary"
        class="next-year-btn"
        :disabled="pendingChoice"
        @click="$emit('age-up')"
      >
        下一年
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Wallet, Money } from '@element-plus/icons-vue';

  defineProps<{
    age: number;
    jobName: string;
    wealth: number;
    savings: number;
    houseCount: number;
    carCount: number;
    isAlive: boolean;
    pendingChoice: boolean;
  }>();

  defineEmits(['age-up']);
</script>

<style scoped>
  .hud-panel {
    height: 80px;
    margin: 0 0 20px 0;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
  .glass-panel {
    backdrop-filter: blur(10px);
  }
  .hud-item {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  .avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #409eff;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 18px;
  }
  .info-text .name {
    font-weight: bold;
    color: #303133;
  }
  .info-text .job {
    font-size: 12px;
    color: #909399;
  }
  .assets {
    gap: 20px;
    color: #606266;
    font-size: 14px;
  }
  .asset-row {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .next-year-btn {
    font-weight: bold;
    padding: 12px 24px;
  }
</style>
