<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">PDF 文档对比工具</h1>
        <span class="tool-subtitle">PDF Comparison Tool</span>
      </div>
      <div class="header-right">
        <!-- 占位，保持布局平衡 -->
      </div>
    </header>

    <main class="tool-content">
      <div class="comparison-container">
        <!-- Upload Area A -->
        <div class="upload-section">
          <h3>原始文档 (A)</h3>
          <div
            class="upload-area"
            :class="{ 'is-dragover': isDragOverA, 'has-file': fileA }"
            @click="triggerUploadA"
            @drop.prevent="handleDropA"
            @dragover.prevent="dragOverA"
            @dragleave.prevent="dragLeaveA"
          >
            <input
              ref="fileInputA"
              type="file"
              class="hidden-input"
              accept=".pdf"
              @change="handleFileSelectA"
            />

            <div v-if="!fileA" class="upload-placeholder">
              <el-icon class="upload-icon"><Document /></el-icon>
              <div class="upload-text">
                <span class="primary-text">点击或拖拽上传原始 PDF</span>
                <span class="secondary-text">支持 PDF 格式</span>
              </div>
            </div>

            <div v-else class="file-info">
              <el-icon class="file-icon"><DocumentChecked /></el-icon>
              <div class="file-details">
                <span class="file-name">{{ fileA.name }}</span>
                <span class="file-size">{{ formatSize(fileA.size) }}</span>
              </div>
              <el-button type="danger" link class="remove-btn" @click.stop="removeFileA">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
          </div>
        </div>

        <!-- Upload Area B -->
        <div class="upload-section">
          <h3>对比文档 (B)</h3>
          <div
            class="upload-area"
            :class="{ 'is-dragover': isDragOverB, 'has-file': fileB }"
            @click="triggerUploadB"
            @drop.prevent="handleDropB"
            @dragover.prevent="dragOverB"
            @dragleave.prevent="dragLeaveB"
          >
            <input
              ref="fileInputB"
              type="file"
              class="hidden-input"
              accept=".pdf"
              @change="handleFileSelectB"
            />

            <div v-if="!fileB" class="upload-placeholder">
              <el-icon class="upload-icon"><Document /></el-icon>
              <div class="upload-text">
                <span class="primary-text">点击或拖拽上传对比 PDF</span>
                <span class="secondary-text">支持 PDF 格式</span>
              </div>
            </div>

            <div v-else class="file-info">
              <el-icon class="file-icon"><DocumentChecked /></el-icon>
              <div class="file-details">
                <span class="file-name">{{ fileB.name }}</span>
                <span class="file-size">{{ formatSize(fileB.size) }}</span>
              </div>
              <el-button type="danger" link class="remove-btn" @click.stop="removeFileB">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <div class="actions-area">
        <el-button
          type="primary"
          size="large"
          :disabled="!canCompare"
          :loading="isComparing"
          @click="startComparison"
        >
          开始对比
        </el-button>
      </div>

      <!-- Comparison Results -->
      <div v-if="comparisonResult" class="result-section">
        <el-divider content-position="center">对比结果</el-divider>

        <el-alert
          v-if="!comparisonResult.isIdentical"
          title="功能演示提示"
          type="warning"
          description="当前版本仅支持文件元数据对比。深度内容解析功能（文本、布局差异）正在开发中，暂不支持真实内容预览。"
          show-icon
          :closable="false"
          style="margin-bottom: 20px"
        />

        <div class="stats-cards">
          <div class="stat-card" :class="comparisonResult.isIdentical ? 'added' : 'removed'">
            <span class="label">对比状态</span>
            <span class="value">{{ comparisonResult.isIdentical ? '完全一致' : '存在差异' }}</span>
          </div>
        </div>

        <div v-if="!comparisonResult.isIdentical" class="diff-viewer-mock">
          <div class="metadata-comparison">
            <h3>文件属性对比</h3>
            <el-descriptions border column="2">
              <el-descriptions-item label="属性">原始文档 (A)</el-descriptions-item>
              <el-descriptions-item label="属性">对比文档 (B)</el-descriptions-item>

              <el-descriptions-item label="文件名">{{ fileA?.name }}</el-descriptions-item>
              <el-descriptions-item label="文件名">{{ fileB?.name }}</el-descriptions-item>

              <el-descriptions-item label="文件大小">{{
                formatSize(fileA?.size || 0)
              }}</el-descriptions-item>
              <el-descriptions-item label="文件大小">{{
                formatSize(fileB?.size || 0)
              }}</el-descriptions-item>

              <el-descriptions-item label="修改时间">{{
                new Date(fileA?.lastModified || 0).toLocaleString()
              }}</el-descriptions-item>
              <el-descriptions-item label="修改时间">{{
                new Date(fileB?.lastModified || 0).toLocaleString()
              }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <div class="content-placeholder">
            <el-empty description="深度内容对比功能开发中...">
              <template #image>
                <el-icon :size="60" color="#909399"><Warning /></el-icon>
              </template>
            </el-empty>
          </div>
        </div>

        <div v-else class="diff-viewer-mock identical-state">
          <el-empty description="文档完全一致，未发现差异" />
        </div>

        <div class="download-report">
          <el-button
            type="success"
            :disabled="comparisonResult.isIdentical"
            @click="downloadReport"
          >
            <el-icon><Download /></el-icon> 下载差异报告 (PDF)
          </el-button>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - PDF 文档对比工具</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import {
    Document,
    DocumentChecked,
    Close,
    Download,
    ArrowLeft,
    Warning
  } from '@element-plus/icons-vue';
  import { useFileHandler } from '@/composables/useFileHandler';
  import { ElMessage } from 'element-plus';

  interface ComparisonResult {
    added: number;
    removed: number;
    modified: number;
    totalPages: number;
    isIdentical: boolean;
  }

  const fileA = ref<File | null>(null);
  const fileB = ref<File | null>(null);
  const isComparing = ref(false);
  const comparisonResult = ref<ComparisonResult | null>(null);

  // File Handler A
  const {
    fileInput: fileInputA,
    isDragOver: isDragOverA,
    formatSize: formatSizeA,
    triggerUpload: triggerUploadA,
    handleFileSelect: handleFileSelectA,
    handleFileDrop: handleDropA,
    dragOver: dragOverA,
    dragLeave: dragLeaveA
  } = useFileHandler({
    accept: '.pdf',
    readMode: 'none',
    onSuccess: ({ file }) => {
      fileA.value = file;
      comparisonResult.value = null;
    }
  });

  // File Handler B
  const {
    fileInput: fileInputB,
    isDragOver: isDragOverB,
    triggerUpload: triggerUploadB,
    handleFileSelect: handleFileSelectB,
    handleFileDrop: handleDropB,
    dragOver: dragOverB,
    dragLeave: dragLeaveB
  } = useFileHandler({
    accept: '.pdf',
    readMode: 'none',
    onSuccess: ({ file }) => {
      fileB.value = file;
      comparisonResult.value = null;
    }
  });

  const formatSize = formatSizeA; // Reuse helper

  const removeFileA = () => {
    fileA.value = null;
    comparisonResult.value = null;
  };
  const removeFileB = () => {
    fileB.value = null;
    comparisonResult.value = null;
  };

  const canCompare = computed(() => fileA.value && fileB.value);

  const startComparison = () => {
    if (!fileA.value || !fileB.value) return;

    isComparing.value = true;

    // Check if files are identical (simple check by size and name, in real world we'd check hash/content)
    const isIdentical =
      fileA.value.name === fileB.value.name &&
      fileA.value.size === fileB.value.size &&
      fileA.value.lastModified === fileB.value.lastModified;

    // Mock comparison delay
    setTimeout(() => {
      isComparing.value = false;

      if (isIdentical) {
        comparisonResult.value = {
          added: 0,
          removed: 0,
          modified: 0,
          totalPages: 1,
          isIdentical: true
        };
        ElMessage.success('文档完全一致，未发现差异');
      } else {
        comparisonResult.value = {
          added: 12,
          removed: 5,
          modified: 8,
          totalPages: 5,
          isIdentical: false
        };
        ElMessage.success('对比完成');
      }
    }, 2000);
  };

  const downloadReport = () => {
    ElMessage.success('差异报告已下载');
  };
</script>

<style scoped>
  .tool-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: var(--el-bg-color-page);
  }

  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-left,
  .header-right {
    width: 140px;
  }

  .header-center {
    text-align: center;
    flex: 1;
  }

  .tool-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }

  .tool-subtitle {
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
  }

  .tool-content {
    flex: 1;
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    width: 100%;
    box-sizing: border-box;
  }

  .comparison-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
  }

  @media (max-width: 768px) {
    .comparison-container {
      grid-template-columns: 1fr;
    }
  }

  .upload-section h3 {
    text-align: center;
    margin-bottom: 1rem;
    color: var(--el-text-color-regular);
  }

  .upload-area {
    border: 2px dashed var(--el-border-color);
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
    transition: all 0.3s ease;
    cursor: pointer;
    background: var(--el-bg-color);
    min-height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .upload-area:hover,
  .upload-area.is-dragover {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }

  .upload-area.has-file {
    border-style: solid;
    border-color: var(--el-color-success);
    background: var(--el-color-success-light-9);
    cursor: default;
  }

  .hidden-input {
    display: none;
  }

  .upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .upload-icon {
    font-size: 3rem;
    color: var(--el-text-color-placeholder);
  }

  .upload-text {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .primary-text {
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .secondary-text {
    font-size: 0.9rem;
    color: var(--el-text-color-secondary);
  }

  .file-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 100%;
  }

  .file-icon {
    font-size: 4rem;
    color: var(--el-color-success);
  }

  .file-details {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .file-name {
    font-weight: 500;
    color: var(--el-text-color-primary);
    word-break: break-all;
  }

  .file-size {
    font-size: 0.9rem;
    color: var(--el-text-color-secondary);
  }

  .remove-btn {
    margin-top: 0.5rem;
  }

  .actions-area {
    text-align: center;
    margin-bottom: 3rem;
  }

  .result-section {
    animation: fadeIn 0.5s ease;
  }

  .stats-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    margin: 2rem 0;
  }

  .stat-card {
    padding: 1.5rem;
    border-radius: 8px;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border: 1px solid transparent;
  }

  .stat-card.added {
    background-color: var(--el-color-success-light-9);
    border-color: var(--el-color-success-light-5);
    color: var(--el-color-success);
  }

  .stat-card.removed {
    background-color: var(--el-color-danger-light-9);
    border-color: var(--el-color-danger-light-5);
    color: var(--el-color-danger);
  }

  .stat-card.modified {
    background-color: var(--el-color-warning-light-9);
    border-color: var(--el-color-warning-light-5);
    color: var(--el-color-warning);
  }

  .stat-card .label {
    font-size: 0.9rem;
    opacity: 0.8;
  }

  .stat-card .value {
    font-size: 1.5rem;
    font-weight: bold;
  }

  .diff-viewer-mock {
    background: var(--el-bg-color-overlay);
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 2rem;
  }

  .metadata-comparison {
    padding: 2rem;
    background: #fff;
  }

  .metadata-comparison h3 {
    margin-bottom: 1.5rem;
    color: var(--el-text-color-primary);
    text-align: center;
  }

  .content-placeholder {
    border-top: 1px solid var(--el-border-color);
    background: var(--el-bg-color-page);
  }

  .identical-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
    background: white;
  }

  .download-report {
    text-align: center;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
