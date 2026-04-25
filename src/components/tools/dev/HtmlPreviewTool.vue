<template>
  <ToolShell title="Dev" title-highlight="HTML 在线预览()">
    <div class="tool-container">
      <!-- 工具栏 -->
      <div class="toolbar">
        <el-button type="primary" @click="previewInNewTab">
          <el-icon><View /></el-icon>
          在新页面预览
        </el-button>

        <el-upload
          :show-file-list="false"
          :before-upload="beforeUpload"
          :on-error="() => {}"
          accept=".html,.htm"
        >
          <el-button>
            <el-icon><Upload /></el-icon>
            上传 HTML
          </el-button>
        </el-upload>

        <el-button @click="copyCode">
          <el-icon><CopyDocument /></el-icon>
          复制
        </el-button>

        <el-button @click="clearCode">
          <el-icon><Delete /></el-icon>
          清空
        </el-button>

        <el-button @click="downloadHtml">
          <el-icon><Download /></el-icon>
          下载
        </el-button>

        <el-tag v-if="fileName" type="warning" size="small" effect="plain" class="file-tag">
          {{ fileName }}
        </el-tag>

        <span class="char-count">{{ code.length }} 字符</span>
      </div>

      <!-- 编辑区（支持拖放） -->
      <div
        class="editor-wrapper"
        :class="{ 'drag-over': isDragOver }"
        @dragover.prevent="onDragOver"
        @dragleave.prevent="onDragLeave"
        @drop.prevent="onDrop"
      >
        <div class="editor-header">
          <span>HTML 代码</span>
          <span v-if="isDragOver" class="drop-hint">释放鼠标以上传文件</span>
        </div>
        <textarea
          v-model="code"
          class="code-editor"
          placeholder="在此输入 HTML 代码...（支持拖拽 .html 文件到编辑区）"
          spellcheck="false"
          wrap="off"
        ></textarea>
      </div>
    </div>
  </ToolShell>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { View, Upload, CopyDocument, Delete, Download } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';
  import type { UploadRawFile } from 'element-plus';
  import ToolShell from '@/components/common/ToolShell.vue';

  const code = ref(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>我的页面</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
    .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,.1); text-align: center; }
    h1 { color: #333; }
    p { color: #666; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Hello, World!</h1>
    <p>开始编辑，或上传 .html 文件</p>
  </div>
</body>
</html>`);

  const fileName = ref('');
  const isDragOver = ref(false);

  function beforeUpload(rawFile: UploadRawFile) {
    readFile(rawFile);
    return false; // 阻止自动上传
  }

  function onDragOver() {
    isDragOver.value = true;
  }

  function onDragLeave() {
    isDragOver.value = false;
  }

  function onDrop(e: DragEvent) {
    isDragOver.value = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) readFile(file);
  }

  function readFile(file: File) {
    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      ElMessage.warning('请选择 .html 或 .htm 文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      code.value = reader.result as string;
      fileName.value = file.name;
      ElMessage.success(`已加载: ${file.name}`);
    };
    reader.onerror = () => {
      ElMessage.error('文件读取失败，请重试');
    };
    reader.readAsText(file, 'UTF-8');
  }

  function previewInNewTab() {
    const blob = new Blob([code.value], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }

  function copyCode() {
    navigator.clipboard.writeText(code.value);
    ElMessage.success('已复制到剪贴板');
  }

  function clearCode() {
    code.value = '';
    fileName.value = '';
  }

  function downloadHtml() {
    const blob = new Blob([code.value], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.value || 'preview.html';
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<style scoped>
  .tool-container {
    max-width: 1000px;
    margin: 0 auto;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .toolbar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .file-tag {
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .char-count {
    margin-left: auto;
    font-size: 0.8rem;
    color: #909399;
  }

  .editor-wrapper {
    border: 2px solid #dcdfe6;
    border-radius: 4px;
    overflow: hidden;
    transition: border-color 0.15s;
  }

  .editor-wrapper.drag-over {
    border-color: #e6a23c;
    outline: 3px dashed #e6a23c;
    outline-offset: -3px;
  }

  .editor-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.75rem;
    background: #f5f7fa;
    border-bottom: 1px solid #dcdfe6;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .drop-hint {
    color: #e6a23c;
    font-weight: 700;
  }

  .code-editor {
    width: 100%;
    min-height: 500px;
    padding: 0.75rem;
    border: none;
    background: #1e1e1e;
    color: #d4d4d4;
    font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
    font-size: 0.85rem;
    line-height: 1.6;
    resize: vertical;
    tab-size: 2;
    box-sizing: border-box;
  }

  .code-editor:focus {
    outline: none;
  }

  .code-editor::placeholder {
    color: #666;
  }

  /* 暗色模式 */
  [data-theme='dark'] .code-editor {
    background: #0d0d0d;
    color: #c0c0c0;
  }

  [data-theme='dark'] .editor-header {
    background: #1d1d1d;
    border-color: #333;
    color: #e0e0e0;
  }

  [data-theme='dark'] .editor-wrapper {
    border-color: #333;
  }
</style>
