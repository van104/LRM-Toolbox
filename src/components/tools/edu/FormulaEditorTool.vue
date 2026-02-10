<template>
  <div class="formula-editor-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>公式编辑器</h1>
        <span class="nav-subtitle">Equation Editor</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="editor-layout">
        <div class="card edit-card">
          <div class="card-header">
            <div class="header-left">
              <el-icon>
                <EditPen />
              </el-icon>
              <span>可视化编辑</span>
            </div>
            <div class="header-right">
              <button class="clear-btn" @click="clear">清空</button>
            </div>
          </div>
          <div class="math-field-container">
            <math-field
              ref="mathFieldRef"
              class="math-field"
              :value="latex"
              @input="onInput"
            ></math-field>
          </div>
          <div class="helper-bar">
            <span class="tip"
              >提示：支持 LaTeX 语法直接输入，或使用虚拟键盘（点击输入框右侧图标）</span
            >
          </div>
        </div>

        <div class="card toolbar-card">
          <div class="card-header sm">
            <span>常用预设</span>
          </div>
          <div class="presets-grid">
            <button
              v-for="(item, i) in presets"
              :key="i"
              class="preset-btn"
              @click="insert(item.latex)"
            >
              <span v-if="item.label" class="p-latex">{{ item.label }}</span>
              <span v-else class="p-latex">$$ {{ item.latex }} $$</span>
            </button>
          </div>
        </div>

        <div class="card output-card">
          <div class="output-row">
            <div class="output-group">
              <label>LaTeX 代码</label>
              <textarea readonly class="code-area" :value="latex" @click="copy(latex)"></textarea>
              <button class="copy-label-btn" @click="copy(latex)">
                <el-icon>
                  <CopyDocument />
                </el-icon>
                复制
              </button>
            </div>
          </div>

          <div class="action-row">
            <div ref="previewRef" class="preview-box">
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div class="render-target" v-html="renderedHtml"></div>
            </div>
            <button class="export-btn" @click="exportImage">
              <el-icon>
                <Picture />
              </el-icon>
              导出图片
            </button>
          </div>
        </div>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - 公式编辑器</footer>
  </div>
</template>

<script setup>
  import { ref, onMounted, computed } from 'vue';
  import { Back, EditPen, CopyDocument, Picture } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';
  import useClipboard from 'vue-clipboard3';
  import 'mathlive';
  import html2canvas from 'html2canvas';
  import katex from 'katex';
  import 'katex/dist/katex.min.css';

  const { toClipboard } = useClipboard();

  const mathFieldRef = ref(null);
  const latex = ref('E = mc^2');
  const previewRef = ref(null);

  const presets = [
    { label: '分数', latex: '\\frac{a}{b}' },
    { label: '根号', latex: '\\sqrt{x}' },
    { label: '上标', latex: 'x^2' },
    { label: '下标', latex: 'x_i' },
    { label: '求和', latex: '\\sum_{i=0}^n' },
    { label: '积分', latex: '\\int_a^b' },
    { label: '极限', latex: '\\lim_{x \\to \\infty}' },
    { label: '矩阵', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
    { label: '希腊 α', latex: '\\alpha' },
    { label: '希腊 β', latex: '\\beta' },
    { label: '箭头', latex: '\\rightarrow' },
    { label: '化学', latex: '\\ce{H2O}' }
  ];

  const renderedHtml = computed(() => {
    try {
      return katex.renderToString(latex.value, {
        throwOnError: false,
        displayMode: true
      });
    } catch {
      return '<span style="color:red">Error</span>';
    }
  });

  const onInput = evt => {
    latex.value = evt.target.value;
  };

  const insert = val => {
    if (mathFieldRef.value) {
      mathFieldRef.value.executeCommand(['insert', val]);
      mathFieldRef.value.focus();
    }
  };

  const clear = () => {
    latex.value = '';
    if (mathFieldRef.value) {
      mathFieldRef.value.setValue('');
    }
  };

  const copy = async text => {
    try {
      await toClipboard(text);
      ElMessage.success('已复制到剪贴板');
    } catch {
      ElMessage.error('复制失败');
    }
  };

  const exportImage = async () => {
    if (!previewRef.value) return;
    const el = previewRef.value.querySelector('.render-target');
    if (!el) return;

    try {
      const canvas = await html2canvas(el, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false
      });
      const link = document.createElement('a');
      link.download = `formula_${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
      ElMessage.success('导出成功');
    } catch (e) {
      console.error(e);
      ElMessage.error('导出失败');
    }
  };

  onMounted(() => {
    if (mathFieldRef.value) {
      mathFieldRef.value.setOptions({
        virtualKeyboardMode: 'manual',
        menuItems: [
          {
            label: '剪切',
            command: 'cut'
          },
          {
            label: '复制',
            command: 'copy'
          },
          {
            label: '粘贴',
            command: 'paste'
          },
          { type: 'divider' },
          {
            label: '全选',
            command: 'select-all'
          },
          { type: 'divider' },
          {
            label: '插入',
            submenu: [
              { label: '分数', command: ['insert', '\\frac{#@}{#?}'] },
              { label: '根号', command: ['insert', '\\sqrt{#0}'] },
              { label: '幂', command: ['insert', '#@^{#?}'] },
              { label: '下标', command: ['insert', '#@_{#?}'] }
            ]
          },
          {
            label: '矩阵',
            submenu: [
              {
                label: '插入矩阵',
                command: ['insert', '\\begin{pmatrix} & \\\\ & \\end{pmatrix}']
              },
              { label: '增加行', command: 'addRowAfter' },
              { label: '增加列', command: 'addColumnAfter' },
              { label: '删除行', command: 'removeRow' },
              { label: '删除列', command: 'removeColumn' }
            ]
          },
          {
            label: '色彩',
            submenu: [
              { label: '红色', command: ['applyStyle', { color: 'red' }] },
              { label: '蓝色', command: ['applyStyle', { color: 'blue' }] },
              { label: '绿色', command: ['applyStyle', { color: 'green' }] }
            ]
          },
          {
            label: '背景',
            submenu: [
              { label: '黄色高亮', command: ['applyStyle', { backgroundColor: 'yellow' }] },
              { label: '清除背景', command: ['applyStyle', { backgroundColor: 'none' }] }
            ]
          },
          { type: 'divider' },
          {
            label: '撤销',
            command: 'undo'
          },
          {
            label: '重做',
            command: 'redo'
          }
        ]
      });
    }
  });
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

  .formula-editor-tool {
    --bg: #faf9f7;
    --card: #ffffff;
    --border: #e8e6e3;
    --text: #1a1a1a;
    --text-2: #6b6b6b;
    --accent: #2563eb;

    font-family: 'Noto Sans SC', sans-serif;
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
  }

  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background: var(--card);
    border-bottom: 1px solid var(--border);
  }

  .nav-back,
  .nav-spacer {
    width: 80px;
  }

  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: var(--text-2);
    cursor: pointer;
    font-size: 0.9rem;
    padding: 0.5rem 0;
  }

  .nav-center h1 {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-2);
    text-transform: uppercase;
    display: block;
    text-align: center;
  }

  .main-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }

  .editor-layout {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: #fdfdfd;
    border-bottom: 1px solid var(--border);
  }

  .card-header.sm {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    color: var(--text-2);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
  }

  .clear-btn {
    font-size: 0.8rem;
    color: #ef4444;
    background: none;
    border: none;
    cursor: pointer;
  }

  .math-field-container {
    padding: 1rem;
    background: white;
  }

  .math-field {
    width: 100%;
    font-size: 1.5rem;
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: #fff;
  }

  .math-field:focus-within {
    border-color: var(--accent);
    outline: none;
  }

  .helper-bar {
    padding: 0.5rem 1rem;
    background: #f9f9f9;
    font-size: 0.75rem;
    color: var(--text-2);
    border-top: 1px solid var(--border);
  }

  .presets-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.75rem;
  }

  .preset-btn {
    padding: 6px 10px;
    border: 1px solid var(--border);
    background: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    min-width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .preset-btn:hover {
    background: #f0fdfa;
    border-color: var(--accent);
    color: var(--accent);
  }

  .output-card {
    padding: 1rem;
  }

  .output-row {
    margin-bottom: 1.5rem;
  }

  .output-group {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .output-group label {
    font-size: 0.85rem;
    color: var(--text-2);
  }

  .code-area {
    width: 100%;
    min-height: 80px;
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: #fdfdfd;
    font-family: monospace;
    font-size: 0.9rem;
    resize: vertical;
  }

  .copy-label-btn {
    position: absolute;
    right: 8px;
    top: 32px;

    padding: 4px 8px;
    font-size: 0.75rem;
    border: 1px solid var(--border);
    background: white;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .action-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid var(--border);
    padding-top: 1rem;
  }

  .preview-box {
    flex: 1;
    overflow-x: auto;
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .render-target {
    padding: 2rem;

    background: white;

    font-size: 1.5rem;
  }

  .export-btn {
    background: var(--text);
    color: white;
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .export-btn:hover {
    opacity: 0.9;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-2);
    font-size: 0.85rem;
    border-top: 1px solid var(--border);
    margin-top: 2rem;
  }
</style>
