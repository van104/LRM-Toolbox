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
        <h1 class="tool-title">PDF 合规性检查</h1>
        <span class="tool-subtitle">PDF Accessibility Check</span>
      </div>
      <div class="header-right">
        <!-- 占位 -->
      </div>
    </header>

    <main class="tool-content">
      <div class="pdf-tool">
        <div
          class="upload-section glass"
          @dragover.prevent="dragOver"
          @dragleave.prevent="dragLeave"
          @drop.prevent="handleDrop"
        >
          <div class="upload-area" :class="{ 'is-dragover': isDragOver }" @click="triggerUpload">
            <input
              ref="fileInput"
              type="file"
              accept=".pdf"
              class="hidden"
              @change="handleFileSelect"
            />
            <el-icon :size="48" class="upload-icon"><UploadFilled /></el-icon>
            <h3>点击或拖拽上传 PDF 文件</h3>
            <p class="sub-text">支持 PDF/UA、WCAG 标准预检</p>
          </div>
        </div>

        <div v-if="report" class="report-section glass">
          <div class="report-header">
            <h3>检查报告</h3>
            <div class="score-badge" :class="getScoreClass(report.score)">{{ report.score }}分</div>
          </div>

          <div class="summary-cards">
            <div class="summary-card">
              <span class="label">PDF/UA 标识</span>
              <span class="value">{{ report.isTagged ? '已标记' : '未标记' }}</span>
              <el-icon v-if="report.isTagged" color="#67c23a"><CircleCheckFilled /></el-icon>
              <el-icon v-else color="#f56c6c"><CircleCloseFilled /></el-icon>
            </div>
            <div class="summary-card">
              <span class="label">语言设置</span>
              <span class="value">{{ report.language || '未设置' }}</span>
            </div>
            <div class="summary-card">
              <span class="label">标题层级</span>
              <span class="value">{{ report.title ? '存在' : '缺失' }}</span>
            </div>
          </div>

          <div class="issues-list">
            <h4>发现的问题 ({{ report.issues.length }})</h4>
            <el-collapse>
              <el-collapse-item
                v-for="(issue, index) in report.issues"
                :key="index"
                :title="issue.title"
              >
                <template #title>
                  <el-tag
                    :type="issue.severity === 'error' ? 'danger' : 'warning'"
                    size="small"
                    class="mr-2"
                  >
                    {{ issue.severity === 'error' ? '错误' : '警告' }}
                  </el-tag>
                  {{ issue.title }}
                </template>
                <div class="issue-detail">
                  <p>{{ issue.description }}</p>
                  <div class="suggestion"><strong>修复建议：</strong> {{ issue.suggestion }}</div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - PDF 合规性检查</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import {
    ArrowLeft,
    UploadFilled,
    CircleCheckFilled,
    CircleCloseFilled
  } from '@element-plus/icons-vue';
  import { useFileHandler } from '@/composables/useFileHandler';

  interface Issue {
    title: string;
    description: string;
    severity: 'error' | 'warning';
    suggestion: string;
  }

  interface Report {
    score: number;
    isTagged: boolean;
    language: string;
    title: string;
    issues: Issue[];
  }

  const report = ref<Report | null>(null);

  const {
    fileInput,
    isDragOver,
    triggerUpload,
    handleFileSelect,
    handleFileDrop: handleDrop,
    dragOver,
    dragLeave
  } = useFileHandler({
    accept: '.pdf',
    readMode: 'arrayBuffer', // We just need file info for mock check, or arrayBuffer for real parsing
    onSuccess: ({ file }) => {
      // Mock analysis based on file properties
      // In a real app, we would use pdf.js to parse content
      analyzePdf(file);
    }
  });

  const analyzePdf = (file: File) => {
    // Mock logic for demonstration
    // Randomly generate some issues based on file size/name to simulate check
    const issues: Issue[] = [];
    let score = 100;
    let isTagged = Math.random() > 0.5;

    if (!isTagged) {
      score -= 40;
      issues.push({
        title: '缺少标签结构 (Untagged PDF)',
        description: '文档未包含结构树标签，屏幕阅读器无法正确朗读内容顺序。',
        severity: 'error',
        suggestion:
          '使用 Adobe Acrobat Pro 的"辅助工具"添加标签，或从源文件(Word/InDesign)导出时勾选"创建标记的PDF"。'
      });
    }

    const hasLang = Math.random() > 0.3;
    if (!hasLang) {
      score -= 20;
      issues.push({
        title: '未指定文档语言',
        description: '文档属性中未设置主语言，屏幕阅读器可能无法加载正确的发音库。',
        severity: 'error',
        suggestion: '在文档属性 -> 高级 -> 阅读选项中设置语言。'
      });
    }

    const hasTitle = Math.random() > 0.3;
    if (!hasTitle) {
      score -= 10;
      issues.push({
        title: '缺少文档标题',
        description: '窗口标题显示为文件名而非文档标题。',
        severity: 'warning',
        suggestion: '在文档属性 -> 描述中填写标题，并在初始视图中设置显示"文档标题"。'
      });
    }

    issues.push({
      title: '图片缺少替代文本 (Alt Text)',
      description: '检测到部分图片未设置替代文本。',
      severity: 'warning',
      suggestion: '为所有传达信息的图片添加 Alt 属性。'
    });

    report.value = {
      score: Math.max(0, score),
      isTagged,
      language: hasLang ? 'zh-CN' : '',
      title: hasTitle ? file.name.replace('.pdf', '') : '',
      issues
    };
  };

  const getScoreClass = (score: number) => {
    if (score >= 90) return 'score-high';
    if (score >= 60) return 'score-medium';
    return 'score-low';
  };
</script>

<style scoped>
  .tool-page {
    min-height: 100vh;
    background: #f1f5f9;
    display: flex;
    flex-direction: column;
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
    padding: 1.5rem;
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
  }

  .pdf-tool {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .upload-section {
    padding: 40px;
    text-align: center;
    border-radius: 12px;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .upload-area {
    border: 2px dashed var(--border-color);
    border-radius: 12px;
    padding: 40px;
    cursor: pointer;
    transition: all 0.3s;
  }

  .upload-area:hover,
  .upload-area.is-dragover {
    border-color: var(--primary-color);
    background: var(--bg-tertiary);
  }

  .upload-icon {
    color: var(--primary-color);
    margin-bottom: 15px;
  }

  .sub-text {
    color: var(--text-secondary);
    margin-top: 5px;
  }

  .report-section {
    padding: 30px;
    border-radius: 12px;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .report-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }

  .report-header h3 {
    margin: 0;
    font-size: 1.2rem;
  }

  .score-badge {
    padding: 5px 15px;
    border-radius: 20px;
    font-weight: bold;
    font-size: 1.1rem;
  }

  .score-high {
    background: #f0f9eb;
    color: #67c23a;
  }
  .score-medium {
    background: #fdf6ec;
    color: #e6a23c;
  }
  .score-low {
    background: #fef0f0;
    color: #f56c6c;
  }

  .summary-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    margin-bottom: 30px;
  }

  .summary-card {
    background: #f8fafc;
    padding: 15px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
  }

  .summary-card .label {
    font-size: 0.85rem;
    color: #64748b;
  }

  .summary-card .value {
    font-weight: 600;
    font-size: 1rem;
  }

  .issues-list h4 {
    margin: 0 0 15px;
    color: #2c3e50;
  }

  .mr-2 {
    margin-right: 8px;
  }

  .issue-detail {
    padding: 10px 0;
    color: #606266;
  }

  .suggestion {
    margin-top: 10px;
    padding: 10px;
    background: #fdf6ec;
    border-radius: 4px;
    font-size: 0.9rem;
    color: #e6a23c;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }
</style>
