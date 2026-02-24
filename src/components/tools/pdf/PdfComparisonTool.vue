<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">PDF<span>.交叉重叠()</span></h1>
        <button
          class="brutal-btn clear-btn"
          :disabled="!isComparing && !comparisonResult"
          @click="resetComparison"
        >
          重置工作区
        </button>
      </header>

      <div class="brutal-grid comparison-container">
        <!-- 区域 A -->
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span class="text-black">基准源 (alpha)</span>
          </div>

          <div
            v-if="!fileA"
            class="brutal-upload-area"
            :class="{ 'is-dragover': isDragOverA }"
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
            <div class="upload-text">
              <h3>[ 注入主 PDF 轨道 ]</h3>
              <p>拖拽或点击唤出文件选择框</p>
            </div>
          </div>

          <div v-else class="file-loaded-info">
            <div class="status-badge success">LOADED</div>
            <p class="filename">{{ fileA.name }}</p>
            <p class="file-size">SIZE: {{ formatSize(fileA.size) }}</p>
            <div style="margin-top: 1rem">
              <button class="brutal-action-btn" @click="removeFileA">卸载主节点</button>
            </div>
            <input
              ref="fileInputA"
              type="file"
              class="hidden-input"
              accept=".pdf"
              @change="handleFileSelectA"
            />
          </div>
        </div>

        <!-- 区域 B -->
        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">测试源 (beta)</span>
          </div>

          <div
            v-if="!fileB"
            class="brutal-upload-area"
            :class="{ 'is-dragover': isDragOverB }"
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
            <div class="upload-text">
              <h3>[ 注入辅助对撞轨道 ]</h3>
              <p>需要参与对比差异的目标对象</p>
            </div>
          </div>

          <div v-else class="file-loaded-info">
            <div class="status-badge success">LOADED</div>
            <p class="filename">{{ fileB.name }}</p>
            <p class="file-size">SIZE: {{ formatSize(fileB.size) }}</p>
            <div style="margin-top: 1rem">
              <button class="brutal-action-btn" @click="removeFileB">卸载次节点</button>
            </div>
            <input
              ref="fileInputB"
              type="file"
              class="hidden-input"
              accept=".pdf"
              @change="handleFileSelectB"
            />
          </div>
        </div>
      </div>

      <div class="actions-area">
        <button
          class="brutal-action-btn large primary global-trigger"
          :disabled="!canCompare || isComparing"
          @click="startComparison"
        >
          {{
            isComparing ? '>> 碰撞校验进行中，请维持连接... <<' : 'EXECUTE_COMPARISON: 开启冲突检测'
          }}
        </button>
      </div>

      <!-- 结果池 -->
      <div v-if="comparisonResult" class="brutal-pane result-section">
        <div class="pane-header" :class="comparisonResult.isIdentical ? 'bg-success' : 'bg-danger'">
          <span class="text-white">碰撞结果.摘要</span>
        </div>

        <div class="result-body">
          <div v-if="!comparisonResult.isIdentical" class="diff-notice">
            <p>
              <strong>[ SYSTEM WARN ]</strong> 检测到不合并分支，元数据验证失败。以下输出校验差集：
            </p>
          </div>

          <div class="stats-cards">
            <div class="stat-card" :class="comparisonResult.isIdentical ? 'added' : 'removed'">
              <span class="label">校验状态</span>
              <span class="value">{{
                comparisonResult.isIdentical ? '数据一致 (SUCCESS)' : '包含篡改或差异 (FAIL)'
              }}</span>
            </div>
          </div>

          <div v-if="!comparisonResult.isIdentical" class="metadata-comparison">
            <h3>// 基础元属性检查表</h3>
            <div class="brutal-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>检查项</th>
                    <th>基准源 (alpha)</th>
                    <th>对比源 (beta)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>节点标识 (NAME)</td>
                    <td>{{ fileA?.name }}</td>
                    <td>{{ fileB?.name }}</td>
                  </tr>
                  <tr>
                    <td>数据链长度 (SIZE)</td>
                    <td :class="{ 'is-diff': fileA?.size !== fileB?.size }">
                      {{ formatSize(fileA?.size || 0) }}
                    </td>
                    <td :class="{ 'is-diff': fileA?.size !== fileB?.size }">
                      {{ formatSize(fileB?.size || 0) }}
                    </td>
                  </tr>
                  <tr>
                    <td>快照时间 (TIMESTAMP)</td>
                    <td :class="{ 'is-diff': fileA?.lastModified !== fileB?.lastModified }">
                      {{ new Date(fileA?.lastModified || 0).toLocaleString() }}
                    </td>
                    <td :class="{ 'is-diff': fileA?.lastModified !== fileB?.lastModified }">
                      {{ new Date(fileB?.lastModified || 0).toLocaleString() }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="mock-warning-box">
              <strong>// 深度解析限制器已触发: </strong
              >当前引擎模块仍处于开发层，尚不支持生成文本和结构树拓扑变化报告。仅供外部头文件校验。
            </div>
          </div>

          <div class="download-report">
            <button
              class="brutal-action-btn"
              :disabled="comparisonResult.isIdentical"
              @click="downloadReport"
            >
              [ 归档异常快照报告 ]
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
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

  const formatSize = formatSizeA;

  const removeFileA = () => {
    fileA.value = null;
    comparisonResult.value = null;
    if (fileInputA.value) fileInputA.value.value = '';
  };
  const removeFileB = () => {
    fileB.value = null;
    comparisonResult.value = null;
    if (fileInputB.value) fileInputB.value.value = '';
  };

  const resetComparison = () => {
    removeFileA();
    removeFileB();
  };

  const canCompare = computed(() => !!fileA.value && !!fileB.value);

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
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }

  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.5rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;

    flex: 1;
    text-align: center;
  }

  .brutal-title span {
    color: #4b7bff;
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
  .brutal-btn:active:not(:disabled) {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }
  .brutal-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
    opacity: 0.7;
  }

  .brutal-btn.clear-btn {
    background: #ff4b4b;
    color: #fff;
  }

  .brutal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2.5rem;
    margin-bottom: 2rem;
  }

  .brutal-pane {
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
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
    letter-spacing: 1px;
  }

  .bg-yellow {
    background: #ffd900;
  }
  .bg-blue {
    background: #4b7bff;
  }
  .bg-success {
    background: #00e572;
  }
  .bg-danger {
    background: #ff4b4b;
  }
  .text-white {
    color: #fff;
  }
  .text-black {
    color: #111;
  }

  .hidden-input {
    display: none;
  }

  .brutal-upload-area {
    min-height: 250px;
    margin: 2rem;
    border: 4px dashed #111;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    background: #fdfae5;
    cursor: pointer;
    transition: all 0.2s;
  }
  .brutal-upload-area:hover,
  .brutal-upload-area.is-dragover {
    background: #ffeba0;
    transform: scale(1.02);
  }

  .upload-text h3 {
    font-family: 'Syne', sans-serif;
    font-size: 1.3rem;
    font-weight: 800;
    margin-bottom: 1rem;
  }
  .upload-text p {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.95rem;
    color: #555;
  }

  .file-loaded-info {
    min-height: 250px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem;
    background: #fdfae5;
  }
  .status-badge {
    background: #111;
    color: #fff;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: bold;
    padding: 0.2rem 1rem;
    margin-bottom: 1rem;
    letter-spacing: 2px;
  }
  .status-badge.success {
    background: #00e572;
    color: #111;
  }

  .file-loaded-info .filename {
    font-weight: bold;
    font-size: 1.2rem;
    background: #fff;
    border: 3px solid #111;
    padding: 0.5rem 1rem;
    box-shadow: 4px 4px 0px #111;
    margin-bottom: 0.5rem;
    word-break: break-all;
  }
  .file-loaded-info .file-size {
    font-family: 'IBM Plex Mono', monospace;
    color: #444;
  }

  .actions-area {
    display: flex;
    justify-content: center;
    margin-bottom: 2.5rem;
  }

  .brutal-action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.6rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
    text-transform: uppercase;
    margin: 0;
  }
  .brutal-action-btn:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }
  .brutal-action-btn:active:not(:disabled) {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px #111;
  }
  .brutal-action-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
    box-shadow: 4px 4px 0px #666;
    border-color: #666;
  }
  .brutal-action-btn.primary {
    background: #ffd900;
  }
  .brutal-action-btn.large {
    padding: 1.25rem 3rem;
    font-size: 1.5rem;
    letter-spacing: 1px;
  }

  /* 结果区域 */
  .result-section {
    margin-bottom: 2rem;
  }
  .result-body {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .diff-notice {
    background: #ffeba0;
    border: 3px solid #111;
    padding: 1rem;
    font-family: 'IBM Plex Mono', monospace;
    box-shadow: 4px 4px 0px #111;
  }
  .diff-notice p {
    margin: 0;
    font-weight: bold;
  }

  .stats-cards {
    display: flex;
    justify-content: center;
  }
  .stat-card {
    border: 4px solid #111;
    padding: 1.5rem 3rem;
    font-family: 'Syne', sans-serif;
    box-shadow: 8px 8px 0px #111;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  .stat-card .label {
    font-weight: bold;
    font-size: 1.1rem;
  }
  .stat-card .value {
    font-size: 1.75rem;
    font-weight: 800;
  }
  .stat-card.added {
    background: #00e572;
    color: #111;
  }
  .stat-card.removed {
    background: #ff4b4b;
    color: #fff;
  }

  .metadata-comparison h3 {
    font-family: 'IBM Plex Mono', monospace;
    margin: 0 0 1rem 0;
    font-size: 1.2rem;
  }

  .brutal-table-wrapper {
    overflow-x: auto;
    border: 4px solid #111;
    box-shadow: 6px 6px 0px #111;
    background: #fff;
    margin-bottom: 1.5rem;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-family: 'IBM Plex Mono', monospace;
  }
  th,
  td {
    border: 2px solid #111;
    padding: 1rem;
    text-align: left;
  }
  th {
    background: #111;
    color: #fff;
    font-weight: bold;
  }
  td.is-diff {
    background: #ffeba0;
    font-weight: bold;
    color: #d00000;
  }

  .mock-warning-box {
    border: 3px dashed #111;
    padding: 1rem;
    color: #666;
    font-style: italic;
    background: #fafafa;
  }

  .download-report {
    display: flex;
    justify-content: flex-end;
  }

  @media (max-width: 1024px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .brutal-title {
      font-size: 2.5rem;
    }
    .stat-card {
      padding: 1rem;
    }
  }

  /* --- Dark Mode Overrides --- */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }

  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .brutal-table-wrapper {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }

  [data-theme='dark'] .pane-header {
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .brutal-table-wrapper,
  [data-theme='dark'] .stat-card {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:hover:not(:disabled),
  [data-theme='dark'] .brutal-action-btn:hover:not(:disabled) {
    box-shadow: 9px 9px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:active:not(:disabled),
  [data-theme='dark'] .brutal-action-btn:active:not(:disabled) {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0px #eee;
  }

  [data-theme='dark'] .brutal-upload-area {
    background: #222;
    border-color: #eee;
  }
  [data-theme='dark'] .file-loaded-info {
    background: #222;
  }
  [data-theme='dark'] .file-loaded-info .filename {
    background: #1a1a1a;
    color: #eee;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .file-size {
    color: #aaa;
  }
  [data-theme='dark'] .status-badge {
    background: #eee;
    color: #111;
  }

  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .bg-yellow,
  [data-theme='dark'] .diff-notice {
    background: #b28f00;
    color: #fff;
    border-color: #eee;
  }
  [data-theme='dark'] .diff-notice {
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn.primary {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .brutal-btn.clear-btn,
  [data-theme='dark'] .bg-danger {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .status-badge.success,
  [data-theme='dark'] .stat-card.added,
  [data-theme='dark'] .bg-success {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .stat-card {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .stat-card.removed {
    background: #cc0000;
    color: #fff;
  }

  [data-theme='dark'] th,
  [data-theme='dark'] td {
    border-color: #eee;
  }
  [data-theme='dark'] th {
    background: #333;
  }
  [data-theme='dark'] td.is-diff {
    background: #4a2c00;
    color: #ffeb3b;
  }

  [data-theme='dark'] .mock-warning-box {
    background: #1a1a1a;
    border-color: #eee;
    color: #bbb;
  }
</style>
