<template>
  <div v-if="activeBuildSite" class="build-menu" :style="menuStyle">
    <div class="build-menu-title">选择防御塔</div>
    <div class="build-options">
      <div
        v-for="(type, key) in TOWER_TYPES"
        :key="key"
        class="build-option"
        :class="{ disabled: money < type.cost }"
        @click="$emit('build', key)"
      >
        <span class="emoji">{{ type.emoji }}</span>
        <span class="cost">💰{{ type.cost }}</span>
        <span class="name">{{ type.name }}</span>
      </div>
    </div>
    <div class="build-menu-close" @click="$emit('close')">
      <el-icon><Close /></el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { Close } from '@element-plus/icons-vue';
  import { TOWER_TYPES } from './constants';

  interface BuildSite {
    r: number;
    c: number;
    px: number;
    py: number;
  }

  const props = defineProps<{
    activeBuildSite: BuildSite | null;
    money: number;
  }>();

  defineEmits(['build', 'close']);

  const menuStyle = computed(() => {
    if (!props.activeBuildSite) return { display: 'none' };
    const isTopSide = props.activeBuildSite.r < 4;
    return {
      left: `${props.activeBuildSite.px}px`,
      top: `${props.activeBuildSite.py}px`,
      '--menu-dir': isTopSide ? '0%' : '-100%',
      '--menu-offset': isTopSide ? '50px' : '-10px'
    } as Record<string, string>;
  });
</script>

<style scoped>
  .build-menu {
    position: absolute;
    transform: translate(-50%, calc(var(--menu-dir) + var(--menu-offset)));
    background: var(--bg-card);
    padding: 0.75rem;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    z-index: 50;
    min-width: 240px;
    animation: scaleUp 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border: 1px solid var(--border-color);
  }

  @keyframes scaleUp {
    from {
      opacity: 0;
      transform: translate(-50%, calc(var(--menu-dir) + var(--menu-offset))) scale(0.8);
    }
  }

  .build-menu-title {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
    padding-bottom: 0.25rem;
    border-bottom: 1px solid var(--border-color);
  }

  .build-options {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
  }

  .build-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    padding: 0.4rem;
    border-radius: 6px;
    background: var(--bg-secondary);
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
  }

  .build-option:hover:not(.disabled) {
    border-color: var(--accent-light, #ecf5ff);
    background: var(--bg-hover);
    transform: translateY(-2px);
  }

  .build-option.disabled {
    opacity: 0.4;
    filter: grayscale(100%);
    cursor: not-allowed;
  }

  .build-option .emoji {
    font-size: 1.2rem;
  }

  .build-option .cost {
    font-size: 0.65rem;
    font-weight: 700;
    color: #e6a23c;
  }

  .build-option .name {
    font-size: 0.6rem;
    color: var(--text-primary);
    white-space: nowrap;
  }

  .build-menu-close {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #f56c6c;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    font-size: 12px;
  }
</style>
