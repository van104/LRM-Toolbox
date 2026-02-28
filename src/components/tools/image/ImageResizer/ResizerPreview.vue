<template>
  <div
    v-if="modelValue"
    class="brutal-modal-overlay"
    @click.self="$emit('update:modelValue', false)"
  >
    <div class="brutal-modal brutal-shadow">
      <div class="modal-header bg-yellow">
        <span>量纲对比窗内窥</span>
        <button class="close-btn" @click="$emit('update:modelValue', false)">X</button>
      </div>
      <div v-if="previewItem" class="modal-body">
        <div class="preview-box brutal-shadow">
          <h4 class="bg-pink">[原生] {{ formatSize(previewItem.file.size) }}</h4>
          <div class="img-container">
            <img :src="previewItem.thumbUrl || ''" />
          </div>
        </div>
        <div class="preview-box brutal-shadow">
          <h4 class="bg-cyan">[制成] {{ formatSize(previewItem.resultBlob?.size || 0) }}</h4>
          <div class="img-container">
            <img :src="previewItem.resultUrl || ''" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { FileItem } from './useImageResizer';

  interface Props {
    modelValue?: boolean;
    previewItem?: FileItem | null;
    formatSize?: (size: number) => string;
  }

  withDefaults(defineProps<Props>(), {
    modelValue: false,
    previewItem: null,
    formatSize: () => (size: number) => `${(size / 1024).toFixed(2)} KB`
  });

  defineEmits(['update:modelValue']);
</script>

<style scoped>
  .brutal-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  }

  .brutal-modal {
    width: 90%;
    max-width: 1000px;
    background: #fff;
    border: 4px solid #111;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-weight: 900;
  }

  .bg-yellow {
    background: #ffd900;
  }
  .close-btn {
    background: transparent;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    font-weight: 900;
  }

  .modal-body {
    padding: 2rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  .preview-box {
    border: 3px solid #111;
    display: flex;
    flex-direction: column;
  }

  .preview-box h4 {
    margin: 0;
    padding: 0.5rem;
    border-bottom: 3px solid #111;
    text-align: center;
    font-weight: 900;
  }

  .bg-pink {
    background: #ff9ecf;
  }
  .bg-cyan {
    background: #2dfdff;
  }

  .img-container {
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #eee;
    min-height: 300px;
    max-height: 500px;
    overflow: auto;
  }

  .img-container img {
    max-width: 100%;
    border: 2px solid #111;
  }

  .brutal-shadow {
    box-shadow: 8px 8px 0px #111;
  }

  @media (max-width: 768px) {
    .modal-body {
      grid-template-columns: 1fr;
    }
  }
</style>
