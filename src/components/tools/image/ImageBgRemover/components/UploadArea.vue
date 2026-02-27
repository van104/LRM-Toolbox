<template>
  <div
    class="brutal-upload-area"
    :class="{ 'is-dragover': isDragOver }"
    @click="$emit('click')"
    @dragover.prevent="$emit('dragover')"
    @dragleave.prevent="$emit('dragleave')"
    @drop.prevent="$emit('drop', $event)"
  >
    <div class="upload-placeholder">
      <span class="upload-icon">🪄</span>
      <p>点击或拖拽上传以开启深度扫描</p>
      <small>(智能识别所有特征显著的主体矩阵)</small>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineProps({
    isDragOver: {
      type: Boolean,
      default: false
    }
  });

  defineEmits(['click', 'dragover', 'dragleave', 'drop']);
</script>

<style scoped>
  .brutal-upload-area {
    border: 4px dashed #111;
    background: #fff;
    padding: 2.5rem 1rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    height: 500px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .brutal-upload-area:hover,
  .brutal-upload-area.is-dragover {
    background: #4b7bff;
    border-style: solid;
    color: white;
  }
  .brutal-upload-area:hover p,
  .brutal-upload-area.is-dragover p {
    color: white;
  }
  .brutal-upload-area:hover small,
  .brutal-upload-area.is-dragover small {
    color: #fdfae5;
  }

  .upload-icon {
    font-size: 5rem;
    display: block;
    margin-bottom: 1rem;
    text-shadow: 4px 4px 0 #111;
  }

  .upload-placeholder p {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.25rem;
    margin: 0 0 0.5rem 0;
    color: #111;
  }
  .upload-placeholder small {
    font-weight: bold;
    color: #666;
  }
</style>
