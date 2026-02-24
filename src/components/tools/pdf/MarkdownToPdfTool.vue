<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">Markdown<span>.转PDF()</span></h1>
        <button class="brutal-btn clear-btn" @click="inputContent = ''">清空舞台</button>
      </header>

      <div class="brutal-toolbar">
        <div class="tools-left">
          <div class="brutal-radio-group">
            <button
              class="brutal-action-btn"
              :class="{ active: inputMode === 'markdown' }"
              @click="inputMode = 'markdown'"
            >
              [ Markdown ]
            </button>
            <button
              class="brutal-action-btn"
              :class="{ active: inputMode === 'html' }"
              @click="inputMode = 'html'"
            >
              [ HTML ]
            </button>
          </div>
          <button class="brutal-action-btn" @click="insertSample">载入样本数据</button>
        </div>
        <div class="tools-right">
          <span
            >模式状态: <span class="badge">{{ inputMode.toUpperCase() }}</span></span
          >
        </div>
      </div>

      <div class="brutal-grid">
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span class="text-black">输入源.代码编辑区</span>
          </div>
          <div class="textarea-wrapper">
            <textarea
              v-model="inputContent"
              class="brutal-editor"
              :placeholder="inputPlaceholder"
              spellcheck="false"
            ></textarea>
          </div>
        </div>

        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">渲染器.实时预览</span>
          </div>
          <div class="textarea-wrapper preview-wrapper">
            <!-- eslint-disable vue/no-v-html -->
            <div
              ref="previewRef"
              class="brutal-editor output-editor preview-content"
              v-html="renderedHtml"
            ></div>
            <!-- eslint-enable vue/no-v-html -->
          </div>
        </div>
      </div>

      <div class="brutal-toolbar settings-bar">
        <div class="tools-left">
          <div class="settings-group-inline">
            <label>纸张型号:</label>
            <select v-model="pageSize" class="brutal-select">
              <option value="a4">A4 (210×297mm)</option>
              <option value="letter">Letter (8.5×11in)</option>
              <option value="a3">A3 (297×420mm)</option>
            </select>
          </div>
          <div class="settings-group-inline">
            <label>页面边距:</label>
            <select v-model="margins" class="brutal-select">
              <option value="normal">标准 (20mm)</option>
              <option value="narrow">窄边 (10mm)</option>
              <option value="wide">宽边 (30mm)</option>
            </select>
          </div>
        </div>
        <div class="tools-right">
          <button
            class="brutal-action-btn primary large"
            :disabled="!inputContent.trim() || processing"
            @click="generatePdf"
          >
            {{ processing ? '正在生成底层文件流...' : '输出 PDF' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { marked } from 'marked';
  import DOMPurify from 'dompurify';
  import html2canvas from 'html2canvas';
  import { jsPDF } from 'jspdf';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const inputMode = ref('markdown');
  const inputContent = ref('');
  const pageSize = ref('a4');
  const margins = ref('normal');
  const processing = ref(false);
  const previewRef = ref(null);

  const inputPlaceholder = computed(() => {
    return inputMode.value === 'markdown'
      ? '> 在此载入 Markdown 格式源码...\n\n# 新粗野主义风格指南\n\n1. 高纯度的结构和边框\n2. 抛弃微妙的圆角...'
      : '> 注入 HTML 节点数据...\n\n<h1>你好，世界</h1>\n<p>机器将毫不留情地解析它...</p>';
  });

  const renderedHtml = computed(() => {
    if (!inputContent.value.trim())
      return '<p style="color: #666; font-style: italic;">// 等待输入流...</p>';

    if (inputMode.value === 'markdown') {
      const rawHtml = marked(inputContent.value);
      return DOMPurify.sanitize(rawHtml);
    } else {
      return DOMPurify.sanitize(inputContent.value);
    }
  });

  const sampleMarkdown = `# Neobrutalism 风格说明

## 简介

这不仅是一个界面风格，更是一种**反叛的态度**。

## 规格清单

- 强制 **粗体结构线** 和 *无修饰色彩*
- 利用 \`3px solid #111\`
- 提供极致的数字清晰度

## API 示例

\`\`\`javascript
function injectBrutalism(ui) {
    ui.shadow = "4px 4px 0 #111";
    ui.radius = "0px";
    return ui.render();
}
\`\`\`

## 字体映射表

| 层级 | 字体 | 备注 |
|------|------|------|
| H1/H2 | Syne, 黑体 | 重磅标题专用 |
| Code | IBM Plex Mono | 数据展示专用 |

> “摒弃多余的修饰，直击信息的本质。”

---
*EOF*
`;

  const sampleHtml = `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; line-height: 1.6; }
        h1 { border-bottom: 4px solid #111; color: #111; }
        .highlight { background: #ffd900; padding: 0.5rem; border: 3px solid #111; font-weight: bold; }
    </style>
</head>
<body>
    <h1>原始 HTML 解析演示</h1>
    <p>这是一个极简 HTML DOM 树注入过程。</p>
    <p class="highlight">警告：此区域采用高亮展现</p>
    <ul>
        <li>指令模式执行</li>
        <li>数据总线连接</li>
    </ul>
</body>
</html>`;

  const insertSample = () => {
    inputContent.value = inputMode.value === 'markdown' ? sampleMarkdown : sampleHtml;
  };

  watch(inputMode, () => {
    inputContent.value = '';
  });

  const generatePdf = async () => {
    if (!inputContent.value.trim()) return;

    processing.value = true;
    try {
      const htmlContent = renderedHtml.value;

      const pageSizes = {
        a4: { width: 210, height: 297 },
        letter: { width: 215.9, height: 279.4 },
        a3: { width: 297, height: 420 }
      };

      const marginValues = {
        normal: 20,
        narrow: 10,
        wide: 30
      };

      const size = pageSizes[pageSize.value] || pageSizes.a4;
      const margin = marginValues[margins.value] || 20;

      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      const pxPerMm = 3.7795275591;
      tempDiv.style.width = `${(size.width - margin * 2) * pxPerMm}px`;
      tempDiv.style.backgroundColor = '#ffffff';

      const themeStyle = document.createElement('style');
      themeStyle.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');
        
        .temp-render-container {
            font-family: 'Syne', 'Noto Sans SC', sans-serif;
            line-height: 1.6;
            color: #111;
            padding: ${margin * pxPerMm}px;
            background: #ffffff;
            box-sizing: border-box;
            width: 100%;
        }
        
        .temp-render-container h1 { font-family: 'Syne', 'Noto Sans SC', sans-serif; font-size: 2.2em; border-bottom: 4px solid #111; padding-bottom: 0.2em; font-weight: 800; margin-top: 0; }
        .temp-render-container h2 { font-family: 'Syne', 'Noto Sans SC', sans-serif; font-size: 1.5em; margin-top: 1.5em; font-weight: 800; border-bottom: 2px solid #111; display: inline-block; }
        .temp-render-container h3 { font-size: 1.25em; font-weight: 700; }
        
        .temp-render-container pre {
            background: #fdfae5;
            border: 3px solid #111;
            padding: 1em;
            box-shadow: 4px 4px 0px #111;
            font-family: 'IBM Plex Mono', monospace;
            white-space: pre-wrap;
            word-wrap: break-word;
            overflow-wrap: anywhere;
        }
        
        .temp-render-container code {
            background: #ffd900;
            border: 2px solid #111;
            padding: 0.1em 0.3em;
            font-family: 'IBM Plex Mono', monospace;
            font-weight: 600;
            font-size: 0.9em;
        }
        
        .temp-render-container pre code {
            background: none;
            border: none;
            padding: 0;
        }
        
        .temp-render-container blockquote {
            border-left: 5px solid #ff4b4b;
            margin: 1.5em 0;
            padding: 1em;
            background: #f9f9f9;
            border-right: 3px solid #111;
            border-top: 3px solid #111;
            border-bottom: 3px solid #111;
            box-shadow: 4px 4px 0px #111;
            font-family: 'IBM Plex Mono', monospace;
            font-weight: bold;
            color: #111;
        }
        
        .temp-render-container table {
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
            border: 3px solid #111;
        }
        
        .temp-render-container th, .temp-render-container td {
            border: 2px solid #111;
            padding: 0.5em 1em;
            text-align: left;
        }
        
        .temp-render-container th {
            background: #4b7bff;
            color: #fff;
            font-weight: 800;
        }
        
        .temp-render-container img {
            max-width: 100%;
            border: 3px solid #111;
            box-shadow: 6px 6px 0px #111;
        }
        
        .temp-render-container hr {
            border: none;
            border-top: 4px solid #111;
            margin: 2em 0;
        }
      `;
      document.head.appendChild(themeStyle);

      const contentDiv = document.createElement('div');
      contentDiv.className = 'temp-render-container';
      contentDiv.innerHTML = htmlContent;
      tempDiv.appendChild(contentDiv);
      document.body.appendChild(tempDiv);

      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 800));

      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(tempDiv);
      document.head.removeChild(themeStyle);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [size.width, size.height]
      });

      const pdfWidth = size.width;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      let leftHeight = pdfHeight;
      let position = 0;

      while (leftHeight > 0) {
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 0.95),
          'JPEG',
          0,
          position,
          pdfWidth,
          pdfHeight
        );

        leftHeight -= size.height;
        position -= size.height;

        if (leftHeight > 0) {
          pdf.addPage();
        }
      }

      pdf.save('markdown-export.pdf');

      ElMessage.success({ message: '输出完成: PDF 文件已在本地保存', grouping: true });
    } catch (e) {
      console.error(e);
      ElMessage.error({ message: '输出失败: ' + e.message, grouping: true });
    } finally {
      processing.value = false;
    }
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
    max-width: 1500px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }

  /* 通用头部 */
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
    color: #00e572;
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

  .brutal-btn.clear-btn {
    background: #ff4b4b;
    color: #fff;
  }

  .brutal-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    border: 4px solid #111;
    padding: 1rem 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 8px 8px 0px #111;
  }

  .tools-left {
    display: flex;
    gap: 1.5rem;
    align-items: center;
  }

  .tools-right {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
  }

  .badge {
    background: #111;
    color: #fff;
    padding: 0.25rem 0.6rem;
  }

  .brutal-radio-group {
    display: flex;
    gap: 0;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
  }

  .brutal-radio-group .brutal-action-btn {
    border: none;
    border-right: 3px solid #111;
    box-shadow: none !important;
    margin: 0;
    transform: none !important;
  }
  .brutal-radio-group .brutal-action-btn:last-child {
    border-right: none;
  }
  .brutal-radio-group .brutal-action-btn.active {
    background: #111;
    color: #fff;
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
    color: #666;
    border-color: #666;
    box-shadow: 4px 4px 0px #666;
    cursor: not-allowed;
  }

  .brutal-action-btn.primary {
    background: #ffd900;
  }
  .brutal-action-btn.large {
    padding: 0.8rem 2.5rem;
    font-size: 1.25rem;
    background: #00e572;
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

  /* 编辑器和预览框 */
  .textarea-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .preview-wrapper {
    background: #fdfae5;
  }

  .brutal-editor {
    flex: 1;
    width: 100%;
    border: none;
    padding: 1.5rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1rem;
    line-height: 1.8;
    resize: none;
    outline: none;
    background: transparent;
    color: #111;
    box-sizing: border-box;
  }

  .brutal-editor::placeholder {
    color: #888;
    font-style: italic;
  }

  .output-editor {
    overflow-y: auto;
  }

  /* 模拟 Brutal Markdown 样式在界面里的预览 */
  .preview-content :deep(h1) {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 2em;
    border-bottom: 4px solid #111;
    padding-bottom: 0.2em;
    font-weight: 800;
    margin-top: 0;
  }

  .preview-content :deep(h2) {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.5em;
    margin-top: 1.5em;
    font-weight: 800;
    border-bottom: 2px solid #111;
    display: inline-block;
  }

  .preview-content :deep(h3) {
    font-size: 1.25em;
    font-weight: 700;
  }

  .preview-content :deep(pre) {
    background: #fff;
    border: 3px solid #111;
    padding: 1em;
    box-shadow: 4px 4px 0px #111;
    font-family: 'IBM Plex Mono', monospace;
    overflow-x: auto;
  }

  .preview-content :deep(code) {
    background: #ffd900;
    border: 2px solid #111;
    padding: 0.1em 0.3em;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    font-size: 0.9em;
  }

  .preview-content :deep(pre code) {
    background: none;
    border: none;
    padding: 0;
  }

  .preview-content :deep(blockquote) {
    border-left: 5px solid #ff4b4b;
    margin: 1.5em 0;
    padding: 1em;
    background: #fff;
    border-right: 3px solid #111;
    border-top: 3px solid #111;
    border-bottom: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    font-weight: bold;
  }

  .preview-content :deep(table) {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
    border: 3px solid #111;
  }

  .preview-content :deep(th),
  .preview-content :deep(td) {
    border: 2px solid #111;
    padding: 0.5em 1em;
    text-align: left;
  }

  .preview-content :deep(th) {
    background: #4b7bff;
    color: #fff;
    font-weight: 800;
  }

  .preview-content :deep(img) {
    max-width: 100%;
    border: 3px solid #111;
    box-shadow: 6px 6px 0px #111;
  }

  .preview-content :deep(hr) {
    border: none;
    border-top: 4px solid #111;
    margin: 2em 0;
  }

  /* 底部设置项 */
  .settings-bar {
    background: #fdfae5;
  }

  .settings-group-inline {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .settings-group-inline label {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
  }

  .brutal-select {
    border: 3px solid #111;
    padding: 0.5rem 1rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 1rem;
    background: #fff;
    box-shadow: 4px 4px 0px #111;
    outline: none;
    cursor: pointer;
  }

  @media (max-width: 1024px) {
    .brutal-title {
      font-size: 2.5rem;
    }
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .brutal-toolbar {
      flex-direction: column;
      gap: 1.5rem;
      align-items: flex-start;
    }
    .tools-left {
      flex-wrap: wrap;
    }
    .brutal-header {
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }
  }

  /* --- Dark Mode Overrides --- */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-toolbar,
  [data-theme='dark'] .brutal-select {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }

  [data-theme='dark'] .settings-bar,
  [data-theme='dark'] .preview-wrapper {
    background: #222;
  }

  [data-theme='dark'] .brutal-radio-group {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-radio-group .brutal-action-btn {
    border-right-color: #eee;
  }
  [data-theme='dark'] .brutal-radio-group .brutal-action-btn.active {
    background: #eee;
    color: #111;
  }

  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
    color: #111;
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

  [data-theme='dark'] .brutal-toolbar {
    box-shadow: 8px 8px 0px #eee;
  }

  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .brutal-select {
    box-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .brutal-action-btn:hover:not(:disabled) {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:active:not(:disabled) {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane:hover {
    box-shadow: 16px 16px 0px #eee;
  }

  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .brutal-action-btn.primary {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .brutal-action-btn.large {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .brutal-btn.clear-btn {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .text-black {
    color: #fff;
  }
  [data-theme='dark'] .brutal-editor {
    color: #eee;
  }

  /* Dark mode preview overrides */
  [data-theme='dark'] .preview-content :deep(h1),
  [data-theme='dark'] .preview-content :deep(h2),
  [data-theme='dark'] .preview-content :deep(hr) {
    border-color: #eee;
  }

  [data-theme='dark'] .preview-content :deep(pre),
  [data-theme='dark'] .preview-content :deep(blockquote) {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .preview-content :deep(code) {
    background: #b28f00;
    border-color: #eee;
    color: #fff;
  }
  [data-theme='dark'] .preview-content :deep(pre code) {
    background: none;
  }

  [data-theme='dark'] .preview-content :deep(table),
  [data-theme='dark'] .preview-content :deep(th),
  [data-theme='dark'] .preview-content :deep(td) {
    border-color: #eee;
  }

  [data-theme='dark'] .preview-content :deep(th) {
    background: #2a4eb2;
  }
</style>
