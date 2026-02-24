<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$emit('back')">← 返回</button>
        <h1 class="brutal-title">批量重命名<span>.工具()</span></h1>
        <button class="brutal-btn clear-btn" @click="clearFiles">清空列表</button>
      </header>

      <div class="brutal-grid">
        <!-- 左侧面板：设置与上传 -->
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span>规则设置.Config</span>
          </div>
          <div class="pane-content settings-content">
            <!-- 拖拽上传区 -->
            <div
              class="brutal-dropzone"
              :class="{ 'is-dragover': isDragOver }"
              @dragover.prevent="isDragOver = true"
              @dragleave.prevent="isDragOver = false"
              @drop.prevent="handleDrop"
              @click="triggerFileInput"
            >
              <input ref="fileInput" type="file" multiple hidden @change="handleFileSelect" />
              <div class="drop-icon">📂</div>
              <div class="drop-text">点击或拖拽文件到此处上传</div>
            </div>

            <div class="rules-container">
              <div class="brutal-input-group">
                <label>前缀 (Prefix):</label>
                <input
                  v-model="prefix"
                  type="text"
                  class="brutal-input"
                  placeholder="例如: image_"
                />
              </div>

              <div class="brutal-input-group grid-2-col">
                <div>
                  <label>起始序号:</label>
                  <input v-model.number="startNumber" type="number" class="brutal-input" min="0" />
                </div>
                <div>
                  <label>数字位数 (补零):</label>
                  <input
                    v-model.number="padding"
                    type="number"
                    class="brutal-input"
                    min="1"
                    max="10"
                  />
                </div>
              </div>

              <div class="brutal-input-group">
                <label>新扩展名 (留空则保持原样):</label>
                <input
                  v-model="extension"
                  type="text"
                  class="brutal-input"
                  placeholder="例如: .jpg"
                />
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="brutal-toolbar actions-toolbar">
              <button
                class="brutal-action-btn primary bg-pink"
                :disabled="files.length === 0 || isProcessing"
                @click="downloadZip"
              >
                {{ isProcessing ? '处理中...' : '打包下载 ZIP' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 右侧面板：预览列表 -->
        <div class="brutal-pane">
          <div class="pane-header bg-green">
            <span>预览列表.Preview ({{ files.length }})</span>
          </div>
          <div class="pane-content preview-content">
            <div v-if="files.length === 0" class="empty-state">
              [ 暂无文件，请先上传以查看预览 ]
            </div>
            <ul v-else class="file-list">
              <li v-for="(file, index) in files" :key="index" class="file-item">
                <div class="file-original" :title="file.name">{{ file.name }}</div>
                <div class="file-arrow">→</div>
                <div class="file-new" :title="getNewName(file, index)">
                  {{ getNewName(file, index) }}
                </div>
                <button class="remove-btn" title="移除此文件" @click="removeFile(index)">×</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import JSZip from 'jszip'; // 依赖 jszip 进行打包

  defineEmits(['back']);

  // 状态
  const files = ref([]);
  const fileInput = ref(null);
  const isDragOver = ref(false);
  const isProcessing = ref(false);

  // 规则设置
  const prefix = ref('file_');
  const startNumber = ref(1);
  const padding = ref(3);
  const extension = ref('');

  // 获取新文件名
  const getNewName = (file, index) => {
    const currentExt = file.name.substring(file.name.lastIndexOf('.'));
    let targetExt = extension.value.trim();
    if (targetExt && !targetExt.startsWith('.')) {
      targetExt = '.' + targetExt;
    }
    const finalExt = targetExt || currentExt;

    const num = String(startNumber.value + index).padStart(padding.value, '0');
    return `${prefix.value}${num}${finalExt}`;
  };

  // 文件处理
  const triggerFileInput = () => {
    fileInput.value.click();
  };

  const handleFileSelect = event => {
    const selectedFiles = Array.from(event.target.files);
    files.value.push(...selectedFiles);
    event.target.value = ''; // reset
  };

  const handleDrop = event => {
    isDragOver.value = false;
    const droppedFiles = Array.from(event.dataTransfer.files).filter(f => f.type !== ''); // 简单过滤文件夹
    files.value.push(...droppedFiles);
  };

  const removeFile = index => {
    files.value.splice(index, 1);
  };

  const clearFiles = () => {
    files.value = [];
  };

  // 下载 ZIP
  const downloadZip = async () => {
    if (files.value.length === 0) return;
    isProcessing.value = true;

    try {
      const zip = new JSZip();

      files.value.forEach((file, index) => {
        const newName = getNewName(file, index);
        zip.file(newName, file);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `renamed_files_${new Date().getTime()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('ZIP生成失败:', error);
      alert('打包文件时出错，请重试！');
    } finally {
      isProcessing.value = false;
    }
  };
</script>

<style scoped>
  /* ==========================================================================
   Neobrutalism UI 核心变量与字体
   ========================================================================== */
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@700;800&display=swap');

  .brutal-wrapper {
    min-height: 100vh;
    background: #f4f4f0;
    padding: 2rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    color: #111;
    transition:
      background 0.3s,
      color 0.3s;
  }

  .brutal-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  /* ==========================================================================
   头部 (Header)
   ========================================================================== */
  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 4px solid #111;
    padding: 1rem 2rem;
    background: #fff;
    box-shadow: 8px 8px 0px #111;
  }

  .brutal-title {
    font-size: 2.5rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -1px;
  }
  .brutal-title span {
    color: #ff0055;
  }

  /* ==========================================================================
   按钮 (Buttons)
   ========================================================================== */
  .brutal-btn,
  .brutal-action-btn {
    font-family: inherit;
    font-weight: 700;
    border: 3px solid #111;
    background: #fff;
    color: #111;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
  }

  .brutal-btn {
    padding: 0.5rem 1.5rem;
    font-size: 1.1rem;
    box-shadow: 4px 4px 0px #111;
  }
  .brutal-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }
  .brutal-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px #111;
  }
  .brutal-btn.clear-btn {
    background: #ff0055;
    color: #fff;
  }

  .brutal-action-btn {
    padding: 0.75rem 2rem;
    font-size: 1.2rem;
    box-shadow: 6px 6px 0px #111;
    width: 100%;
  }
  .brutal-action-btn:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 8px 8px 0px #111;
  }
  .brutal-action-btn:active:not(:disabled) {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }
  .brutal-action-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }

  /* ==========================================================================
   网格与面板 (Grid & Panes)
   ========================================================================== */
  .brutal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  .brutal-pane {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
    display: flex;
    flex-direction: column;
    transition: all 0.2s;
  }

  .pane-header {
    padding: 1rem 1.5rem;
    font-size: 1.2rem;
    font-weight: 800;
    border-bottom: 4px solid #111;
    text-transform: uppercase;
  }
  .bg-yellow {
    background: #ffe100;
  }
  .bg-green {
    background: #00e5ff;
  }
  .bg-pink {
    background: #ff66cc;
  }

  .pane-content {
    padding: 1.5rem;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  /* ==========================================================================
   内部控件 (Inputs & Dropzone)
   ========================================================================== */
  .brutal-dropzone {
    border: 4px dashed #111;
    background: #f9f9f9;
    padding: 2.5rem 1rem;
    text-align: center;
    cursor: pointer;
    margin-bottom: 1.5rem;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  .brutal-dropzone:hover,
  .brutal-dropzone.is-dragover {
    background: #ffe100;
    border-style: solid;
  }
  .drop-icon {
    font-size: 3rem;
  }
  .drop-text {
    font-weight: 700;
    font-size: 1.1rem;
  }

  .rules-container {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }

  .brutal-input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .brutal-input-group label {
    font-weight: 700;
    font-size: 0.95rem;
  }

  .grid-2-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .brutal-input {
    font-family: 'IBM Plex Mono', monospace;
    padding: 0.75rem;
    font-size: 1rem;
    border: 3px solid #111;
    background: #fff;
    color: #111;
    box-shadow: 4px 4px 0px #111;
    outline: none;
    transition: all 0.2s;
  }
  .brutal-input:focus {
    background: #e6f7ff;
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .actions-toolbar {
    margin-top: 2rem;
  }

  /* ==========================================================================
   列表区 (List & Preview)
   ========================================================================== */
  .preview-content {
    padding: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .empty-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'IBM Plex Mono', monospace;
    color: #666;
    padding: 3rem;
    text-align: center;
    font-weight: 600;
  }

  .file-list {
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 500px;
    overflow-y: auto;
    overflow-x: auto; /* 允许水平滚动 */
    font-family: 'IBM Plex Mono', monospace;
  }

  /* 自定义滚动条 (包含垂直和水平) */
  .file-list::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }
  .file-list::-webkit-scrollbar-track {
    background: #fff;
    border-left: 3px solid #111;
    border-top: 3px solid #111;
  }
  .file-list::-webkit-scrollbar-thumb {
    background: #111;
  }
  .file-list::-webkit-scrollbar-corner {
    background: #fff;
    border-left: 3px solid #111;
    border-top: 3px solid #111;
  }

  .file-item {
    display: grid;
    grid-template-columns: 1fr auto 1fr auto;
    min-width: 450px; /* 保证窄屏下能触发水平滚动，而不是过度挤压 */
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border-bottom: 3px solid #111;
    background: #fff;
    transition: background 0.2s;
  }
  .file-item:last-child {
    border-bottom: none;
  }
  .file-item:hover {
    background: #f0f0f0;
  }

  .file-original {
    color: #666;
    text-decoration: line-through;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.9rem;
  }

  .file-arrow {
    font-weight: 800;
    color: #111;
  }

  .file-new {
    color: #ff0055;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 1rem;
  }

  .remove-btn {
    background: none;
    border: 2px solid #111;
    border-radius: 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-weight: bold;
    background: #fff;
    transition: all 0.1s;
  }
  .remove-btn:hover {
    background: #ff0055;
    color: #fff;
  }

  /* ==========================================================================
   Dark Mode 暗黑模式适配
   ========================================================================== */
  [data-theme='dark'] .brutal-wrapper {
    background: #1a1a1a;
    color: #eee;
  }

  [data-theme='dark'] .brutal-header,
  [data-theme='dark'] .brutal-pane {
    background: #2a2a2a;
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
  }

  [data-theme='dark'] .brutal-header {
    box-shadow: 6px 6px 0px #eee;
  }

  [data-theme='dark'] .brutal-pane:hover {
    box-shadow: 12px 12px 0px #eee;
  }

  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
    color: #111; /* 保持暗黑模式下亮色头部的黑字 */
  }

  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .remove-btn {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
    background: #222;
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn:hover,
  [data-theme='dark'] .brutal-input:focus {
    box-shadow: 6px 6px 0px #eee;
    background: #333;
  }
  [data-theme='dark'] .brutal-action-btn:hover:not(:disabled) {
    box-shadow: 8px 8px 0px #eee;
  }

  [data-theme='dark'] .brutal-btn:active,
  [data-theme='dark'] .brutal-action-btn:active,
  [data-theme='dark'] .brutal-action-btn:disabled {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .brutal-btn.clear-btn {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .bg-pink {
    background: #b25482;
    color: #fff;
  } /* 调整按钮背景适应暗黑 */

  [data-theme='dark'] .brutal-dropzone {
    border-color: #eee;
    background: #2a2a2a;
  }
  [data-theme='dark'] .brutal-dropzone:hover,
  [data-theme='dark'] .brutal-dropzone.is-dragover {
    background: #554b00;
  }

  [data-theme='dark'] .file-item {
    border-bottom-color: #eee;
    background: #2a2a2a;
  }
  [data-theme='dark'] .file-item:hover {
    background: #333;
  }
  [data-theme='dark'] .file-original {
    color: #aaa;
  }
  [data-theme='dark'] .file-arrow {
    color: #eee;
  }
  [data-theme='dark'] .file-new {
    color: #ff9fb2;
  }

  [data-theme='dark'] .file-list::-webkit-scrollbar-track,
  [data-theme='dark'] .file-list::-webkit-scrollbar-corner {
    background: #2a2a2a;
    border-left-color: #eee;
    border-top-color: #eee;
  }
  [data-theme='dark'] .file-list::-webkit-scrollbar-thumb {
    background: #eee;
  }

  /* 响应式 */
  @media (max-width: 900px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .brutal-title {
      font-size: 1.8rem;
    }
    .file-item {
      grid-template-columns: 1fr auto 1fr auto;
      gap: 0.5rem;
    }
  }
</style>
