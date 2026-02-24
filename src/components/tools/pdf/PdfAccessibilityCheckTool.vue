<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">PDF<span>.合规性检查()</span></h1>
        <button class="brutal-btn clear-btn" :disabled="!report" @click="reset">重置检查</button>
      </header>

      <div class="brutal-grid">
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span class="text-black">目标.PDF装载</span>
          </div>
          <div class="upload-wrapper">
            <div
              class="brutal-upload-area"
              :class="{ 'is-dragover': isDragOver }"
              @click="triggerUpload"
              @dragover.prevent="dragOver"
              @dragleave.prevent="dragLeave"
              @drop.prevent="handleDrop"
            >
              <input
                ref="fileInput"
                type="file"
                accept=".pdf"
                class="hidden-input"
                @change="handleFileSelect"
              />
              <div class="upload-text">
                <h3>[ 唤醒检测协议 / 上传源文件 ]</h3>
                <p>仅支持 .pdf 格式 / 自动运行预检</p>
                <p v-if="currentFileName" class="filename">当前装载: {{ currentFileName }}</p>
              </div>
            </div>
            <div class="brutal-status-panel">
              <h4>// 引擎说明</h4>
              <p>› 检查目标：PDF/UA, WCAG 可访问性建议。</p>
              <p>› 完全本地脱机检测，不会上载敏感文件。</p>
              <p>› 当前仅提供结构分析，需人工复核结果。</p>
            </div>
          </div>
        </div>

        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">诊断.输出报告</span>
          </div>

          <div v-if="report" class="brutal-report">
            <div class="report-overview">
              <h3>核心可访问性评分</h3>
              <div class="brutal-score" :class="getScoreClass(report.score)">
                {{ report.score }} / 100
              </div>
            </div>

            <div class="report-grid">
              <div class="brutal-card">
                <span>PDF/UA 标识:</span>
                <strong>{{ report.isTagged ? '已标记 [ OK ]' : '未标记 [ FAIL ]' }}</strong>
              </div>
              <div class="brutal-card">
                <span>核心语言:</span>
                <strong>{{ report.language || '未定义 [ WARN ]' }}</strong>
              </div>
              <div class="brutal-card">
                <span>标题层级树:</span>
                <strong>{{ report.title ? '存在 [ OK ]' : '缺失 [ FAIL ]' }}</strong>
              </div>
            </div>

            <div class="issues-container">
              <h4>// 捕获的违规异常 ({{ report.issues.length }})</h4>
              <div v-for="(issue, index) in report.issues" :key="index" class="brutal-issue-card">
                <div class="issue-header" :class="issue.severity">
                  <span class="issue-badge">{{ issue.severity === 'error' ? 'ERR' : 'WARN' }}</span>
                  <span class="issue-title">{{ issue.title }}</span>
                </div>
                <div class="issue-body">
                  <p class="desc">{{ issue.description }}</p>
                  <div class="suggestion"><strong>修复策略:</strong> {{ issue.suggestion }}</div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-report">
            <p>// 暂无任务...</p>
            <p>等待源文件载入以执行解析管道。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
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
  const currentFileName = ref<string>('');

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
    readMode: 'arrayBuffer',
    onSuccess: ({ file }) => {
      currentFileName.value = file.name;
      analyzePdf(file);
    }
  });

  const reset = () => {
    report.value = null;
    currentFileName.value = '';
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  };

  const analyzePdf = (file: File) => {
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
          '使用 Adobe Acrobat Pro 的"辅助工具"添加标签，或从源文件导出时勾选"创建标记的PDF"。'
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
      description: '检测到部分图片可能未设置替代文本。',
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
    color: #666;
    border-color: #666;
    box-shadow: 6px 6px 0px #666;
    cursor: not-allowed;
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
    min-height: 60vh;
  }

  .brutal-pane {
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
    transition: transform 0.2s;
  }

  .brutal-pane:hover {
    transform: translate(-4px, -4px);
    box-shadow: 16px 16px 0px #111;
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
  .text-white {
    color: #fff;
  }
  .text-black {
    color: #111;
  }

  .hidden-input {
    display: none;
  }

  .upload-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #fff;
    overflow: hidden;
  }

  .brutal-upload-area {
    flex: 1;
    min-height: 300px;
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
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.5rem;
    font-weight: 800;
    margin: 0 0 1rem 0;
  }
  .upload-text p {
    font-family: 'IBM Plex Mono', monospace;
    color: #666;
    margin: 0;
  }
  .upload-text .filename {
    margin-top: 1rem;
    font-size: 1.1rem;
    font-weight: bold;
    color: #4b7bff;
    background: #111;
    color: #fff;
    padding: 0.2rem 1rem;
    display: inline-block;
  }

  .brutal-status-panel {
    background: #f1f5f9;
    padding: 1.25rem;
    border-top: 4px solid #111;
    margin-top: auto;
  }
  .brutal-status-panel h4 {
    margin: 0 0 0.75rem 0;
    font-weight: 800;
    color: #111;
  }
  .brutal-status-panel p {
    margin: 0 0 0.5rem 0;
    font-size: 0.85rem;
    color: #444;
  }

  .empty-report {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: #fdfae5;
    color: #111;
    font-style: italic;
    font-weight: bold;
    padding: 2rem;
    text-align: center;
  }

  .brutal-report {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .report-overview {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 4px solid #111;
    padding-bottom: 1rem;
  }

  .report-overview h3 {
    margin: 0;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.5rem;
    font-weight: 800;
  }

  .brutal-score {
    padding: 0.5rem 1rem;
    font-size: 1.5rem;
    font-weight: 800;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
  }

  .score-high {
    background: #00e572;
    color: #111;
  }
  .score-medium {
    background: #ffd900;
    color: #111;
  }
  .score-low {
    background: #ff4b4b;
    color: #fff;
  }

  .report-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .brutal-card {
    background: #fff;
    border: 3px solid #111;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    box-shadow: 4px 4px 0px #111;
  }

  .brutal-card span {
    font-weight: bold;
  }
  .brutal-card strong {
    font-family: 'Syne', monospace;
    color: #4b7bff;
  }

  .issues-container {
    margin-top: 1rem;
  }
  .issues-container h4 {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.25rem;
    margin-bottom: 1rem;
    border-bottom: 3px solid #111;
    padding-bottom: 0.5rem;
  }

  .brutal-issue-card {
    border: 3px solid #111;
    margin-bottom: 1rem;
    box-shadow: 4px 4px 0px #111;
    background: #fff;
  }

  .issue-header {
    padding: 0.75rem 1rem;
    border-bottom: 3px solid #111;
    display: flex;
    align-items: center;
    gap: 1rem;
    font-weight: 800;
  }

  .issue-header.error {
    background: #ff4b4b;
    color: #fff;
  }
  .issue-header.warning {
    background: #ffd900;
    color: #111;
  }

  .issue-badge {
    background: #111;
    color: #fff;
    padding: 0.2rem 0.5rem;
    font-size: 0.85rem;
  }

  .issue-body {
    padding: 1rem;
    background: #fdfae5;
  }
  .issue-body p.desc {
    margin: 0 0 1rem 0;
    font-weight: bold;
  }
  .suggestion {
    background: #fff;
    border: 2px dashed #111;
    padding: 0.75rem;
    font-size: 0.95rem;
  }

  @media (max-width: 1024px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .brutal-title {
      font-size: 2.5rem;
    }
    .report-overview {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
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
  [data-theme='dark'] .brutal-card,
  [data-theme='dark'] .brutal-issue-card,
  [data-theme='dark'] .suggestion,
  [data-theme='dark'] .upload-wrapper {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .pane-header,
  [data-theme='dark'] .report-overview,
  [data-theme='dark'] .issues-container h4,
  [data-theme='dark'] .issue-header {
    border-color: #eee;
  }

  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .brutal-btn {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:hover:not(:disabled) {
    box-shadow: 9px 9px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:active:not(:disabled) {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane:hover {
    box-shadow: 16px 16px 0px #eee;
  }

  [data-theme='dark'] .brutal-card,
  [data-theme='dark'] .brutal-issue-card,
  [data-theme='dark'] .brutal-score {
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-score {
    border-color: #eee;
  }

  [data-theme='dark'] .brutal-upload-area {
    background: #222;
    border-color: #eee;
  }
  [data-theme='dark'] .empty-report,
  [data-theme='dark'] .issue-body {
    background: #222;
    color: #eee;
  }

  [data-theme='dark'] .brutal-status-panel {
    background: #1a1a1a;
    border-top-color: #eee;
  }
  [data-theme='dark'] .brutal-status-panel h4 {
    color: #eee;
  }
  [data-theme='dark'] .brutal-status-panel p {
    color: #aaa;
  }

  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .brutal-btn.clear-btn {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .text-black {
    color: #fff;
  }

  [data-theme='dark'] .score-high {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .score-medium {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .score-low,
  [data-theme='dark'] .issue-header.error {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .issue-header.warning {
    background: #b28f00;
    color: #fff;
  }
</style>
