<template>
  <div class="modal-header">
    <div class="modal-icon">
      <el-icon :size="36">
        <component :is="tool.svgIcon ? ToolIcons[tool.svgIcon] : tool.icon" />
      </el-icon>
    </div>
    <div class="modal-title-group">
      <h2 class="modal-title">{{ tool.name }}</h2>
      <div class="modal-tags">
        <span v-for="tag in tool.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
  import * as ToolIcons from '@/components/icons/tools';

  defineProps({
    tool: {
      type: Object,
      required: true
    }
  });
</script>

<style scoped>
  .modal-header {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 1.75rem 2rem;
    background: #ffd900;
    border-bottom: 4px solid #111;
  }

  .modal-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 68px;
    height: 68px;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 5px 5px 0px #111;
    flex-shrink: 0;
    color: #111;
  }

  .modal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.6rem;
    font-weight: 800;
    margin: 0 0 0.5rem;
    color: #111;
    letter-spacing: -0.5px;
  }

  .modal-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .tag {
    padding: 0.2rem 0.65rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.75rem;
    font-weight: 700;
    background: #111;
    color: #fff;
    border: 2px solid #111;
    letter-spacing: 0.5px;
  }

  /* 暗色模式 */
  [data-theme='dark'] .modal-header {
    background: #b28f00;
    border-bottom-color: #eee;
  }

  [data-theme='dark'] .modal-icon {
    background: #222;
    border-color: #eee;
    box-shadow: 5px 5px 0px #eee;
    color: #eee;
  }

  [data-theme='dark'] .modal-title {
    color: #111;
  }

  [data-theme='dark'] .tag {
    background: #eee;
    color: #111;
    border-color: #eee;
  }

  @media (max-width: 640px) {
    .modal-header {
      padding: 1.25rem 1.5rem;
    }

    .modal-icon {
      width: 52px;
      height: 52px;
    }

    .modal-title {
      font-size: 1.25rem;
    }
  }
</style>
