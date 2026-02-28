<template>
  <div
    class="upload-area"
    :class="{ 'is-dragover': isDragOver }"
    @click="triggerUpload"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
  >
    <div class="upload-placeholder">
      <span class="upload-icon">📏</span>
      <p>点击或拖拽投入超负荷矩阵</p>
      <small>(将在本地强行压榨修改像素尺寸量纲)</small>
    </div>
    <input
      ref="fileInputRef"
      type="file"
      multiple
      accept="image/*"
      style="display: none"
      @change="handleFileSelect"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  defineProps<{
    isDragOver: boolean;
  }>();

  const emit = defineEmits(['select', 'drop', 'dragover', 'dragleave']);

  const fileInputRef = ref<HTMLInputElement | null>(null);

  function triggerUpload() {
    fileInputRef.value?.click();
  }

  function handleFileSelect(e: Event) {
    const target = e.target as HTMLInputElement;
    const files = Array.from(target.files || []);
    if (files.length > 0) emit('select', files);
  }

  function onDrop(e: DragEvent) {
    emit('drop', e);
  }

  function onDragOver(e: DragEvent) {
    emit('dragover', e);
  }

  function onDragLeave(e: DragEvent) {
    emit('dragleave', e);
  }

  defineExpose({ triggerUpload });
</script>

<style scoped>
  .brutal-upload-area {
    border: 4px dashed #111;
    background: #fff;
    padding: 2.5rem 1rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    min-height: 400px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .brutal-upload-area:hover,
  .brutal-upload-area.is-dragover {
    background: #ffd900;
    border-style: solid;
  }

  .upload-icon {
    font-size: 4rem;
    display: block;
    margin-bottom: 1rem;
  }

  .upload-placeholder p {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.25rem;
    margin: 0 0 0.5rem 0;
  }

  .upload-placeholder small {
    font-weight: bold;
    color: #666;
  }
</style>
