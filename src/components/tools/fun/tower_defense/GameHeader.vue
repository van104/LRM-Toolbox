<template>
  <nav class="nav-bar">
    <button class="nav-back" @click="$emit('back')">
      <el-icon>
        <Back />
      </el-icon>
      返回
    </button>
    <div class="nav-center">
      <h1>塔防小游戏</h1>
      <span class="nav-subtitle">
        Simple Tower Defense -
        {{ gameMode === 'endless' ? 'Endless' : 'Level ' + gameLevel }}
      </span>
    </div>
    <div class="nav-right">
      <div class="speed-toggle">
        <button
          class="speed-btn"
          :class="{ active: gameSpeed === 1 }"
          @click="$emit('set-speed', 1)"
        >
          1x
        </button>
        <button
          class="speed-btn"
          :class="{ active: gameSpeed === 2 }"
          @click="$emit('set-speed', 2)"
        >
          2x
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
  import { Back } from '@element-plus/icons-vue';

  defineProps<{
    gameMode: string;
    gameLevel: number;
    gameSpeed: number;
  }>();

  defineEmits(['back', 'set-speed']);
</script>

<style scoped>
  .nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    height: 64px;
    background: var(--bg-card);
    border-bottom: 1px solid var(--border-color);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    z-index: 10;
  }

  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    background: transparent;
    color: var(--text-secondary);
    font-weight: 500;
    transition: all 0.2s;
  }

  .nav-back:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .nav-center {
    text-align: center;
  }

  .nav-center h1 {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
  }

  .nav-subtitle {
    font-size: 0.8rem;
    color: var(--text-tertiary);
    font-family: monospace;
  }

  .speed-toggle {
    display: flex;
    background: var(--bg-secondary);
    padding: 0.25rem;
    border-radius: 8px;
    gap: 0.25rem;
  }

  .speed-btn {
    padding: 0.25rem 0.75rem;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-secondary);
    transition: all 0.2s;
  }

  .speed-btn.active {
    background: var(--bg-card);
    color: var(--accent-color, #409eff);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
</style>
