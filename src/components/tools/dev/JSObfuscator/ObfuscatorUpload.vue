<template>
  <div class="upload-container">
    <div
      class="brutal-upload-area"
      :class="{ 'is-dragover': isDragOver }"
      @click="triggerUpload"
      @dragover.prevent="dragOver"
      @dragleave.prevent="dragLeave"
      @drop.prevent="onDrop"
    >
      <div class="upload-placeholder">
        <span class="upload-icon">📦</span>
        <p>点击或拖拽投入代码文件</p>
        <small>(本地 JS 维度折叠)</small>
      </div>
      <input
        ref="fileInput"
        type="file"
        multiple
        accept=".js"
        style="display: none"
        @change="onFileSelect"
      />
    </div>

    <!-- 文件夹上传专门入口 -->
    <div class="dir-upload-btn" @click="triggerDirUpload">
      <span>📂 批量上传文件夹</span>
      <input
        ref="dirInput"
        type="file"
        webkitdirectory
        directory
        style="display: none"
        @change="onFileSelect"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useFileHandler } from '@/composables/useFileHandler';

  const emit = defineEmits(['select']);

  const dirInput = ref<HTMLInputElement | null>(null);

  // 复用核心文件处理逻辑
  const {
    fileInput,
    isDragOver,
    triggerUpload,
    onFileSelect,
    onDrop: handleDrop,
    dragOver,
    dragLeave
  } = useFileHandler({
    accept: '.js',
    multiple: true,
    readMode: 'none',
    onSuccess: result => {
      emit('select', [result.file]);
    }
  });

  const triggerDirUpload = () => {
    dirInput.value?.click();
  };

  const onDrop = (e: DragEvent) => {
    handleDrop(e);
  };
</script>

<style scoped>
  .upload-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .brutal-upload-area {
    border: 4px dashed #111;
    background: #fff;
    padding: 2.5rem 1rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    min-height: 250px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-shadow: 4px 4px 0 #111;
  }

  .dir-upload-btn {
    background: #19d4ff;
    border: 4px solid #111;
    padding: 1rem;
    text-align: center;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 4px 4px 0 #111;
    transition: all 0.1s;
  }

  .dir-upload-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #111;
  }

  .brutal-upload-area:hover,
  .brutal-upload-area.is-dragover {
    background: #ffd900;
    border-style: solid;
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #111;
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
