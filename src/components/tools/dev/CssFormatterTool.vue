<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="goBack">
          <el-icon>
            <ArrowLeft />
          </el-icon>
          <span>返回</span>
        </el-button>
      </div>
      <h1 class="tool-title">CSS 格式化</h1>
      <div class="header-right">
        <el-button text @click="clearAll">
          <el-icon>
            <Delete />
          </el-icon>
          <span>清空</span>
        </el-button>
      </div>
    </header>

    <div class="tool-content">
      <div class="editor-section">
        <textarea
          v-model="cssContent"
          class="css-editor"
          placeholder="在此粘贴 CSS 代码..."
          spellcheck="false"
        ></textarea>

        <div class="controls">
          <div class="config-group">
            <span class="label">缩进字符:</span>
            <el-select v-model="indentSize" size="small" style="width: 100px">
              <el-option label="2 空格" :value="2" />
              <el-option label="4 空格" :value="4" />
              <el-option label="Tab" :value="'tab'" />
            </el-select>
          </div>

          <div class="action-buttons">
            <el-button type="primary" @click="formatCss">
              <el-icon>
                <MagicStick />
              </el-icon>
              格式化 (Beautify)
            </el-button>
            <el-button type="warning" @click="compressCss">
              <el-icon>
                <files />
              </el-icon>
              压缩 (Minify)
            </el-button>
            <el-button @click="copyResult">
              <el-icon>
                <CopyDocument />
              </el-icon>
              复制
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <footer class="footer">© 2026 LRM工具箱 - CSS 格式化</footer>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { ArrowLeft, Delete, MagicStick, Files, CopyDocument } from '@element-plus/icons-vue';
  import jsBeautify from 'js-beautify';
  import useClipboard from 'vue-clipboard3';

  const cssBeautify = jsBeautify.css;

  const router = useRouter();
  const { toClipboard } = useClipboard();

  const cssContent = ref('');
  const indentSize = ref(2);

  function formatCss() {
    if (!cssContent.value) return;

    try {
      const options = {
        indent_size: typeof indentSize.value === 'number' ? indentSize.value : 1,
        indent_char: typeof indentSize.value === 'number' ? ' ' : '\t',
        selector_separator_newline: true,
        end_with_newline: true,
        newline_between_rules: true
      };

      cssContent.value = cssBeautify(cssContent.value, options);
      ElMessage.success('格式化完成');
    } catch (err) {
      console.error(err);
      ElMessage.error('格式化失败');
    }
  }

  function compressCss() {
    if (!cssContent.value) return;

    try {
      let compressed = cssContent.value.replace(/\/\*[\s\S]*?\*\//g, '');

      compressed = compressed
        .replace(/\s+/g, ' ')
        .replace(/\s*([{}:;,])\s*/g, '$1')
        .replace(/;\}/g, '}')
        .trim();

      cssContent.value = compressed;
      ElMessage.success('压缩完成');
    } catch {
      ElMessage.error('压缩失败');
    }
  }

  async function copyResult() {
    if (!cssContent.value) return;
    try {
      await toClipboard(cssContent.value);
      ElMessage.success('已复制');
    } catch {
      ElMessage.error('复制失败');
    }
  }

  function goBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }

  function clearAll() {
    cssContent.value = '';
  }
</script>

<style scoped>
  .tool-page {
    min-height: 100vh;
    background: #f0f4f8;
    display: flex;
    flex-direction: column;
  }

  .tool-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background: #ffffff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  .tool-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
  }

  .header-left,
  .header-right {
    width: 100px;
  }

  .tool-content {
    flex: 1;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
  }

  .editor-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    overflow: hidden;
    min-height: 500px;
  }

  .css-editor {
    flex: 1;
    width: 100%;
    padding: 1.5rem;
    border: none;
    resize: none;
    font-family: 'Consolas', monospace;
    font-size: 14px;
    line-height: 1.6;
    color: #1e293b;
    outline: none;
    background: transparent;
  }

  .controls {
    padding: 1rem 1.5rem;
    background: #f8fafc;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .config-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #64748b;
  }

  .action-buttons {
    display: flex;
    gap: 1rem;
  }

  [data-theme='dark'] .tool-page {
    background: var(--bg-primary);
  }

  [data-theme='dark'] .tool-header {
    background: var(--bg-secondary);
    border-color: var(--border-color);
  }

  [data-theme='dark'] .tool-title {
    color: var(--text-primary);
  }

  [data-theme='dark'] .editor-section {
    background: var(--bg-secondary);
    border-color: var(--border-color);
  }

  [data-theme='dark'] .controls {
    background: var(--bg-glass);
    border-color: var(--border-color);
  }

  [data-theme='dark'] .css-editor {
    color: var(--text-primary);
  }

  .footer {
    text-align: center;
    padding: 3rem 0;
    color: var(--text-secondary, #64748b);
    font-size: 0.85rem;
  }
</style>
