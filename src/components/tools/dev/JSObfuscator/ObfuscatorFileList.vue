<template>
  <div class="file-list-container">
    <div v-for="item in fileList" :key="item.id" class="file-item" :class="item.status">
      <div class="file-info" :title="item.path">
        <div class="file-main">
          <span class="file-icon">{{ getFileIcon(item.status) }}</span>
          <span class="file-name">{{ item.file.name }}</span>
          <span v-if="item.path && item.path !== item.file.name" class="path-tag">{{
            getDirName(item.path)
          }}</span>
        </div>
        <div class="file-meta">
          <div class="meta-group">
            <span class="meta-label">体积:</span>
            <span class="size-tag">{{ formatSize(item.file.size) }}</span>
            <span v-if="item.obfuscatedSize" class="arrow">→</span>
            <span v-if="item.obfuscatedSize" class="size-tag obfuscated">{{
              formatSize(item.obfuscatedSize)
            }}</span>
          </div>
          <div v-if="item.originalEntropy" class="meta-group">
            <span class="meta-label">复杂度(熵):</span>
            <span class="entropy-tag">{{ item.originalEntropy }}</span>
            <span v-if="item.obfuscatedEntropy" class="arrow">→</span>
            <span v-if="item.obfuscatedEntropy" class="entropy-tag obfuscated">{{
              item.obfuscatedEntropy
            }}</span>
          </div>
        </div>
      </div>

      <div class="file-actions">
        <!-- 预览按钮 -->
        <button
          v-if="item.status !== 'processing'"
          class="action-btn preview"
          title="内容预览"
          @click="$emit('preview', item)"
        >
          预览对比
        </button>

        <!-- 进度状态 -->
        <span v-if="item.status === 'processing'" class="status-badge processing">混淆中...</span>
        <span
          v-else-if="item.status === 'error'"
          class="status-badge error"
          :title="item.errorMessage"
          >失败</span
        >

        <!-- 下载按钮 -->
        <a
          v-if="item.status === 'done'"
          :href="item.downloadUrl"
          :download="'obfuscated_' + item.file.name"
          class="action-btn download"
        >
          下载
        </a>

        <!-- 删除按钮 -->
        <button v-if="!isProcessing" class="action-btn remove" @click="$emit('remove', item.id)">
          ✕
        </button>
      </div>

      <!-- 进度条背景 -->
      <div v-if="item.status === 'processing'" class="progress-bar"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { JSFileItem } from './types';

  defineProps<{
    fileList: JSFileItem[];
    isProcessing: boolean;
  }>();

  defineEmits(['remove', 'preview']);

  function formatSize(bytes: number) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function getFileIcon(status: string) {
    switch (status) {
      case 'processing':
        return '⚡';
      case 'done':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '📄';
    }
  }

  function getDirName(path: string) {
    const parts = path.split('/');
    if (parts.length <= 1) return '';
    return parts.slice(0, -1).join('/');
  }
</script>

<style scoped>
  .file-list-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 1rem;
  }

  .file-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: #fff;
    border: 3px solid #111;
    position: relative;
    overflow: hidden;
    transition: all 0.2s;
  }

  .file-item:hover {
    transform: translate(-2px, -2px);
    box-shadow: 4px 4px 0 #111;
  }

  .file-item.done {
    border-color: #4ade80;
  }

  .file-item.error {
    border-color: #f87171;
  }

  .file-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
    min-width: 0;
  }

  .file-main {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .file-icon {
    font-size: 1.25rem;
  }

  .file-name {
    font-weight: 800;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 1rem;
  }

  .path-tag {
    font-size: 0.7rem;
    background: #111;
    color: #fff;
    padding: 2px 6px;
    font-weight: bold;
  }

  .file-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
    font-size: 0.8rem;
    font-family: 'Space Mono', monospace;
  }

  .meta-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .meta-label {
    font-weight: bold;
    color: #888;
  }

  .size-tag,
  .entropy-tag {
    background: #eee;
    padding: 2px 6px;
    border: 1px solid #111;
    font-weight: bold;
  }

  .size-tag.obfuscated,
  .entropy-tag.obfuscated {
    background: #4ade80;
    color: #fff;
  }

  .arrow {
    font-weight: bold;
    color: #666;
  }

  .file-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-left: 16px;
  }

  .status-badge {
    font-size: 0.75rem;
    font-weight: 800;
    padding: 4px 8px;
    border: 2px solid #111;
  }

  .status-badge.processing {
    background: #fbbf24;
  }

  .status-badge.error {
    background: #f87171;
    color: white;
  }

  .action-btn {
    border: 2px solid #111;
    padding: 4px 12px;
    font-size: 0.85rem;
    font-weight: 800;
    cursor: pointer;
    background: #fff;
    text-decoration: none;
    color: #111;
    transition: all 0.1s;
    white-space: nowrap;
  }

  .action-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 2px 2px 0 #111;
  }

  .action-btn.preview {
    background: #ffd900;
  }

  .action-btn.download {
    background: #4ade80;
    color: white;
  }

  .action-btn.remove {
    background: #fff;
    color: #111;
  }

  .action-btn.remove:hover {
    background: #f87171;
    color: white;
  }

  .progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 4px;
    background: #4ade80;
    width: 100%;
    animation: pulse 1.5s infinite;
    transform-origin: left;
  }

  @keyframes pulse {
    0% {
      opacity: 0.3;
      transform: scaleX(0);
    }
    50% {
      opacity: 1;
      transform: scaleX(0.5);
    }
    100% {
      opacity: 0.3;
      transform: scaleX(1);
    }
  }
</style>
