<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <div class="header-action start">
          <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        </div>
        <h1 class="brutal-title">量纲矩阵调整<span>.游标()</span></h1>
        <div class="header-action end">
          <button class="brutal-btn clear-btn" :disabled="fileList.length === 0" @click="clearAll">
            排空池
          </button>
        </div>
      </header>

      <div class="brutal-grid">
        <!-- 左侧: Upload & File List -->
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span>吞吐序列.反应堆</span>
            <div class="pane-actions">
              <button @click="triggerUpload">投放目标</button>
            </div>
          </div>

          <div class="control-panel-content">
            <ResizerUpload
              v-if="fileList.length === 0"
              ref="uploadRef"
              :is-drag-over="isDragOver"
              @select="addFiles"
              @drop="handleFileDrop"
              @dragover="dragOver"
              @dragleave="dragLeave"
            />

            <ResizerFileList
              v-else
              :file-list="fileList"
              :get-target-dims="f => calculateTargetDims(f, resizeConfig)"
              :format-size="formatSize"
              @preview="previewFile"
              @download="downloadFile"
              @add-more="triggerUpload"
            />
          </div>
        </div>

        <!-- 右侧: Controls -->
        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">缩写调谐.面板</span>
          </div>

          <ResizerControls
            v-model="resizeConfig"
            :is-processing="isProcessing"
            :disabled="fileList.length === 0"
            :first-file-metadata="fileList[0]"
            @start="startBatchProcessing(resizeConfig)"
          />
        </div>
      </div>

      <!-- 全局状态栏 -->
      <ResizerStatus :is-processing="isProcessing" :file-list="fileList" />
    </div>

    <!-- 预览弹窗 -->
    <ResizerPreview v-model="showPreview" :preview-item="previewItem" :format-size="formatSize" />
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { useFileHandler } from '@/composables';
  import {
    useImageResizer,
    type ResizeConfig,
    type FileItem
  } from './ImageResizer/useImageResizer';
  import ResizerUpload from './ImageResizer/ResizerUpload.vue';
  import ResizerFileList from './ImageResizer/ResizerFileList.vue';
  import ResizerControls from './ImageResizer/ResizerControls.vue';
  import ResizerPreview from './ImageResizer/ResizerPreview.vue';
  import ResizerStatus from './ImageResizer/ResizerStatus.vue';

  const router = useRouter();
  const goBack = () => router.back();

  const { fileList, isProcessing, addFiles, clearAll, startBatchProcessing, calculateTargetDims } =
    useImageResizer();

  const resizeConfig = reactive<ResizeConfig>({
    resizeMode: 'percentage',
    percentage: 50,
    fixedWidth: 800,
    fixedHeight: 600,
    lockAspectRatio: true,
    quality: 0.9
  });

  const showPreview = ref(false);
  const previewItem = ref<FileItem | null>(null);
  const uploadRef = ref<InstanceType<typeof ResizerUpload> | null>(null);

  const { isDragOver, dragOver, dragLeave, formatSize } = useFileHandler({
    accept: 'image/*',
    readMode: 'none'
  });

  const triggerUpload = () => {
    uploadRef.value?.triggerUpload();
  };

  const handleFileDrop = (event: DragEvent) => {
    dragLeave();
    if (event.dataTransfer?.files) {
      const droppedFiles = Array.from(event.dataTransfer.files).filter(f =>
        f.type.startsWith('image/')
      );
      addFiles(droppedFiles, item => {
        if (fileList.value.length === 1) {
          resizeConfig.fixedWidth = item.width;
          resizeConfig.fixedHeight = item.height;
        }
      });
    }
  };

  const previewFile = (item: FileItem) => {
    previewItem.value = item;
    showPreview.value = true;
  };

  const downloadFile = (item: FileItem) => {
    if (!item.resultUrl) return;
    const link = document.createElement('a');
    link.href = item.resultUrl;
    const dims = calculateTargetDims(item, resizeConfig);
    const nameParts = item.file.name.split('.');
    const ext = nameParts.pop();
    link.download = `${nameParts.join('.')}-${dims.width}x${dims.height}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

  .brutal-wrapper {
    background-color: #fdfae5;
    background-image:
      linear-gradient(#e5e5e5 2px, transparent 2px),
      linear-gradient(90deg, #e5e5e5 2px, transparent 2px);
    background-size: 40px 40px;
    background-position: -2px -2px;
    min-height: 100vh;
    padding: 2rem;
    box-sizing: border-box;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    color: #111;
  }

  .brutal-container {
    max-width: 1600px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }

  .brutal-header {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    margin-bottom: 2rem;
  }
  .header-action.start {
    display: flex;
    justify-content: flex-start;
  }
  .header-action.end {
    display: flex;
    justify-content: flex-end;
  }

  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.5rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #ff4b4b;
  }
  .brutal-title span {
    color: #ff4b4b;
    text-shadow: 4px 4px 0px #111;
    letter-spacing: 0;
  }

  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }
  .brutal-btn:hover:not(:disabled) {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }
  .brutal-btn:disabled {
    background: #e0e0e0;
    color: #888;
    border-color: #888;
    cursor: not-allowed;
  }
  .brutal-btn.clear-btn {
    background: #ff4b4b;
    color: #fff;
  }

  .brutal-grid {
    display: grid;
    grid-template-columns: 1fr 450px;
    gap: 3rem;
    margin-bottom: 3rem;
  }

  .brutal-pane {
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
    transition: transform 0.2s;
  }

  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.25rem;
  }
  .bg-yellow {
    background: #ffd900;
  }
  .bg-blue {
    background: #4b7bff;
  }
  .text-white {
    color: #fff;
    text-shadow: 1px 1px 0 #111;
  }

  .pane-actions button {
    background: #fff;
    color: #111;
    border: 3px solid #111;
    font-weight: 600;
    padding: 0.35rem 0.75rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
  }

  .control-panel-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    flex: 1;
    background: #fdfdfd;
  }

  @media (max-width: 1024px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
