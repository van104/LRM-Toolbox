<template>
  <div class="brutal-status" :class="statusClass">
    <div class="marquee-wrapper">
      <div class="marquee-content">
        <span>
          <span v-for="i in 10" :key="i">{{ statusText }} // &nbsp;</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import type { FileItem } from './useImageResizer';

  interface Props {
    isProcessing?: boolean;
    fileList?: FileItem[];
  }

  const props = withDefaults(defineProps<Props>(), {
    isProcessing: false,
    fileList: () => []
  });

  const statusClass = computed(() => {
    if (props.isProcessing) return 'warn';
    if (props.fileList.some(f => f.status === 'done')) return 'success';
    return 'info';
  });

  const statusText = computed(() => {
    if (props.isProcessing) return '警告: 压榨引擎全速运行中，正在扭曲空间量纲...';
    if (props.fileList.some(f => f.status === 'done')) return '任务达成 : 已碾压生成目标尺寸图像！';
    if (props.fileList.length > 0) return '流水线排队就位 : 等候释放指令触发...';
    return '系统静思域 : 等待投喂膨胀的图像区块';
  });
</script>

<style scoped>
  .brutal-status {
    border: 4px solid #111;
    overflow: hidden;
    margin-top: 2rem;
  }

  .marquee-wrapper {
    padding: 0.6rem 0;
    white-space: nowrap;
    border-bottom: none;
  }

  .marquee-content {
    display: inline-block;
    animation: marquee 30s linear infinite;
    font-weight: 800;
    font-size: 1.1rem;
    text-transform: uppercase;
  }

  @keyframes marquee {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-50%);
    }
  }

  .brutal-status.warn {
    background: #ffeba0;
    color: #111;
    border-color: #111;
  }
  .brutal-status.success {
    background: #00e572;
    color: #111;
    border-color: #111;
  }
  .brutal-status.info {
    background: #4b7bff;
    color: #fff;
    border-color: #111;
  }
</style>
