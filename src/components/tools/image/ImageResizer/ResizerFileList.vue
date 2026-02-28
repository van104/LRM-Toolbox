<template>
  <div class="file-list-area flex-1">
    <div class="list-wrapper">
      <div v-for="(file, index) in fileList" :key="index" class="file-item brutal-shadow">
        <div
          class="file-thumb"
          :style="{ backgroundImage: file.thumbUrl ? `url(${file.thumbUrl})` : '' }"
        ></div>
        <div class="file-info-text">
          <span class="file-name" :title="file.file.name">{{ file.file.name }}</span>
          <div class="size-info mt-1">
            <span class="badge old">{{ file.width }}x{{ file.height }}</span>
            <span class="arrow">>></span>
            <span v-if="getTargetDims" class="badge new"
              >{{ getTargetDims(file).width }}x{{ getTargetDims(file).height }}</span
            >
          </div>
        </div>

        <div class="file-actions">
          <div v-if="file.status === 'done'" class="result-info">
            <span v-if="formatSize" class="size-diff">{{
              formatSize(file.resultBlob?.size || 0)
            }}</span>
            <button class="btn-icon" title="预览" @click="$emit('preview', file)">👁️</button>
            <button class="btn-icon primary" title="下载" @click="$emit('download', file)">
              ↓
            </button>
          </div>
          <span v-else-if="file.status === 'error'" class="status-error">[ 崩溃 ]</span>
          <span v-else-if="file.status === 'processing'" class="status-pending">[ 处理中... ]</span>
          <span v-else class="status-pending">[ 待命 ]</span>
        </div>
      </div>
    </div>

    <div class="add-more mt-4 brutal-shadow" @click="$emit('add-more')">+ 继续倒注图形矩阵...</div>
  </div>
</template>

<script setup lang="ts">
  import type { FileItem } from './useImageResizer';

  interface Props {
    fileList?: FileItem[];
    getTargetDims?: (file: FileItem) => { width: number; height: number };
    formatSize?: (size: number) => string;
  }

  withDefaults(defineProps<Props>(), {
    fileList: () => [],
    getTargetDims: () => () => ({ width: 0, height: 0 }),
    formatSize: () => (size: number) => `${(size / 1024).toFixed(2)} KB`
  });

  defineEmits(['preview', 'download', 'add-more']);
</script>

<style scoped>
  .file-list-area {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  .list-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-height: 500px;
    overflow-y: auto;
    padding: 0.5rem;
  }

  .file-item {
    display: grid;
    grid-template-columns: 60px 1fr auto;
    gap: 1rem;
    padding: 0.75rem;
    background: #fff;
    border: 3px solid #111;
    align-items: center;
  }

  .file-thumb {
    width: 60px;
    height: 60px;
    background-color: #eee;
    background-size: cover;
    background-position: center;
    border: 2px solid #111;
  }

  .file-info-text {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .file-name {
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: 'Syne', sans-serif;
  }

  .size-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    font-weight: bold;
  }

  .badge {
    border: 2px solid #111;
    padding: 2px 4px;
  }
  .badge.old {
    background: #eee;
  }
  .badge.new {
    background: #2dfdff;
  }
  .arrow {
    font-family: monospace;
    font-weight: bold;
  }

  .file-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .result-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .size-diff {
    font-weight: bold;
    margin-right: 0.5rem;
  }

  .btn-icon {
    width: 36px;
    height: 36px;
    border: 3px solid #111;
    background: #fff;
    cursor: pointer;
    font-size: 1.1rem;
    box-shadow: 2px 2px 0px #111;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .btn-icon:hover {
    background: #eee;
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
  }

  .btn-icon.primary {
    background: #ffd900;
    font-weight: bold;
  }
  .status-error {
    color: #ff4b4b;
    font-weight: bold;
  }
  .status-pending {
    color: #666;
    font-weight: bold;
  }

  .add-more {
    border: 3px solid #111;
    background: #fff;
    padding: 1rem;
    text-align: center;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
  }

  .add-more:hover {
    background: #2dfdff;
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .brutal-shadow {
    box-shadow: 4px 4px 0px #111;
  }
  .mt-4 {
    margin-top: 1.5rem;
  }
  .flex-1 {
    flex: 1;
  }
</style>
