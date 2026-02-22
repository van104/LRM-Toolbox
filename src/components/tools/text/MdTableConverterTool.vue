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
        <h1 class="tool-title">Markdown 表格转换</h1>
        <span class="tool-subtitle">Markdown Table Converter</span>
      </div>
      <div class="header-right">
        <!-- Placeholder -->
      </div>
    </header>

    <main class="tool-content">
      <div class="main-container">
        <el-row :gutter="20">
          <el-col :span="12" :xs="24">
            <div class="input-panel">
              <div class="panel-header">
                <h3>Markdown 输入</h3>
                <el-button link type="primary" @click="pasteText">粘贴</el-button>
              </div>
              <el-input
                v-model="inputText"
                type="textarea"
                :rows="20"
                placeholder="| Header 1 | Header 2 |&#10;| -------- | -------- |&#10;| Cell 1   | Cell 2   |"
                resize="none"
                class="code-input"
              />
            </div>
          </el-col>

          <el-col :span="12" :xs="24">
            <div class="output-panel">
              <div class="panel-header">
                <h3>HTML 预览 & 代码</h3>
                <el-radio-group v-model="viewMode" size="small">
                  <el-radio-button label="preview">预览</el-radio-button>
                  <el-radio-button label="code">代码</el-radio-button>
                </el-radio-group>
              </div>

              <div class="result-box">
                <div v-if="!htmlOutput" class="placeholder">
                  <el-empty description="请输入有效的 Markdown 表格" />
                </div>

                <template v-else>
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <div
                    v-if="viewMode === 'preview'"
                    class="preview-content"
                    v-html="sanitizedHtml"
                  ></div>
                  <el-input
                    v-else
                    v-model="htmlOutput"
                    type="textarea"
                    :rows="18"
                    readonly
                    resize="none"
                    class="code-output"
                  />
                </template>
              </div>

              <div v-if="htmlOutput" class="actions mt-4">
                <el-button type="primary" @click="copyHtml">复制 HTML 代码</el-button>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - Markdown 表格转换</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { ArrowLeft } from '@element-plus/icons-vue';
  import { useCopy } from '@/composables/useCopy';
  import { ElMessage } from 'element-plus';
  import { marked } from 'marked';
  import DOMPurify from 'dompurify';

  const inputText = ref('');
  const htmlOutput = ref('');
  const sanitizedHtml = ref('');
  const viewMode = ref('preview');
  const { copyToClipboard } = useCopy();

  const pasteText = async () => {
    try {
      const text = await navigator.clipboard.readText();
      inputText.value = text;
    } catch {
      ElMessage.error('无法访问剪贴板');
    }
  };

  const convertToHtml = async () => {
    if (!inputText.value.trim()) {
      htmlOutput.value = '';
      sanitizedHtml.value = '';
      return;
    }

    try {
      // Ensure table syntax is enabled in marked (it is by default in GFM)
      const html = await marked.parse(inputText.value);
      htmlOutput.value = html;
      sanitizedHtml.value = DOMPurify.sanitize(html);
    } catch (e) {
      console.error(e);
      htmlOutput.value = '转换出错';
    }
  };

  watch(inputText, () => {
    convertToHtml();
  });

  const copyHtml = () => {
    copyToClipboard(htmlOutput.value);
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

  .main-container {
    background: #fff;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .input-panel,
  .output-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .panel-header h3 {
    font-size: 1rem;
    color: var(--el-text-color-primary);
    margin: 0;
  }

  .result-box {
    flex: 1;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    min-height: 400px;
    background-color: var(--el-bg-color-page);
    overflow-y: auto;
    position: relative;
  }

  .placeholder {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .preview-content {
    padding: 1rem;
    background: white;
    min-height: 100%;
  }

  /* Table styles for preview */
  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
  }

  :deep(th),
  :deep(td) {
    border: 1px solid #dcdfe6;
    padding: 0.5rem;
    text-align: left;
  }

  :deep(th) {
    background-color: #f5f7fa;
    font-weight: 600;
  }

  :deep(.code-input .el-textarea__inner),
  :deep(.code-output .el-textarea__inner) {
    font-family: monospace;
  }

  .mt-4 {
    margin-top: 1rem;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }

  @media (max-width: 768px) {
    .el-col {
      margin-bottom: 2rem;
    }
  }
</style>
