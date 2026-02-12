<template>
  <div class="list-to-table-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>列表转表格工具</h1>
        <span class="nav-subtitle">List to Table Converter</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="tool-card glass-card">
        <div class="input-section">
          <label>输入文本 (每行一列，或者使用分隔符)</label>
          <div class="controls">
            <select v-model="separator">
              <option value="auto">自动检测分隔符</option>
              <option value="\t">制表符 (Tab)</option>
              <option value=",">逗号 (,)</option>
              <option value=" ">空格 (Space)</option>
              <option value="|">竖线 (|)</option>
            </select>
            <label class="checkbox">
              <input v-model="firstRowHeader" type="checkbox" /> 第一行为表头
            </label>
          </div>
          <textarea
            v-model="inputText"
            placeholder="粘贴文本在这里...&#10;姓名, 年龄, 职业&#10;张三, 25, 程序员&#10;李四, 30, 设计师"
            rows="6"
          ></textarea>
        </div>

        <div class="output-section">
          <div class="tabs">
            <button :class="{ active: activeTab === 'md' }" @click="activeTab = 'md'">
              Markdown
            </button>
            <button :class="{ active: activeTab === 'html' }" @click="activeTab = 'html'">
              HTML
            </button>
          </div>

          <div class="result-box">
            <textarea ref="resultRef" readonly :value="resultText"></textarea>
            <button class="copy-btn" @click="copyResult">复制</button>
          </div>

          <!-- eslint-disable vue/no-v-html -->
          <div
            v-if="activeTab === 'html'"
            class="preview-box markdown-body"
            v-html="resultText"
          ></div>
          <!-- eslint-enable vue/no-v-html -->
          <div v-else class="preview-box">
            <pre>{{ resultText }}</pre>
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 列表转表格工具</footer>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { Back } from '@element-plus/icons-vue';
  import { useCopy } from '@/composables/useCopy';

  const inputText = ref('');
  const separator = ref('auto');
  const firstRowHeader = ref(true);
  const activeTab = ref('md');
  const { copyToClipboard } = useCopy();

  const parsedData = computed(() => {
    if (!inputText.value.trim()) return [];

    let sep = separator.value;
    const lines = inputText.value.trim().split('\n');

    if (sep === 'auto' && lines.length > 0) {
      const first = lines[0];
      if (first.includes('\t')) sep = '\t';
      else if (first.includes(',')) sep = ',';
      else if (first.includes('|')) sep = '|';
      else sep = ' ';
    }

    return lines
      .map(line => {
        return line
          .split(sep)
          .map(c => c.trim())
          .filter(c => c !== '');
      })
      .filter(row => row.length > 0);
  });

  const resultText = computed(() => {
    const data = parsedData.value;
    if (data.length === 0) return '';

    let header = [];
    let body = data;

    if (firstRowHeader.value) {
      header = data[0];
      body = data.slice(1);
    } else {
      const maxCols = Math.max(...data.map(r => r.length));
      header = Array.from({ length: maxCols }, (_, i) => `Col ${i + 1}`);
    }

    if (activeTab.value === 'md') {
      const renderRow = row => `| ${row.join(' | ')} |`;
      const divider = `| ${header.map(() => '---').join(' | ')} |`;
      return [renderRow(header), divider, ...body.map(renderRow)].join('\n');
    } else {
      let html = '<table>\n';
      html += '  <thead>\n    <tr>\n';
      header.forEach(h => (html += `      <th>${h}</th>\n`));
      html += '    </tr>\n  </thead>\n';
      html += '  <tbody>\n';
      body.forEach(row => {
        html += '    <tr>\n';
        row.forEach(c => (html += `      <td>${c}</td>\n`));
        html += '    </tr>\n';
      });
      html += '  </tbody>\n</table>';
      return html;
    }
  });

  const copyResult = async () => {
    copyToClipboard(resultText.value, { success: '已复制到剪贴板' });
  };
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

  .list-to-table-tool {
    --bg: #faf9f7;
    --card: #ffffff;
    --border: #e8e6e3;
    --text: #1a1a1a;
    --text-2: #6b6b6b;
    --accent: #0ea5e9;

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
  }

  .nav-center h1 {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.1rem;
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
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  .input-section {
    margin-bottom: 2rem;
  }

  .controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.5rem;
    align-items: center;
  }

  .controls select {
    padding: 0.4rem;
    border-radius: 6px;
    border: 1px solid var(--border);
  }

  .controls .checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    cursor: pointer;
  }

  .input-section textarea {
    width: 100%;
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 12px;
    font-family: monospace;
    resize: vertical;
    outline: none;
    font-size: 0.95rem;
  }

  .input-section textarea:focus {
    border-color: var(--accent);
  }

  .tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .tabs button {
    padding: 0.4rem 1.2rem;
    background: #f3f4f6;
    border: none;
    border-radius: 6px 6px 0 0;
    cursor: pointer;
    font-size: 0.9rem;
    color: var(--text-2);
  }

  .tabs button.active {
    background: var(--accent);
    color: white;
  }

  .result-box {
    position: relative;
  }

  .result-box textarea {
    width: 100%;
    height: 150px;
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 0 12px 12px 12px;
    font-family: monospace;
    resize: vertical;
    outline: none;
    background: #f9fafb;
  }

  .copy-btn {
    position: absolute;
    right: 1rem;
    top: 1rem;
    background: white;
    border: 1px solid var(--border);
    padding: 0.3rem 0.8rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8rem;
    transition: all 0.2s;
  }

  .copy-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
  }

  .preview-box {
    margin-top: 1.5rem;
    padding: 1rem;
    border: 1px dashed var(--border);
    border-radius: 12px;
    background: #fafafa;
    overflow-x: auto;
  }

  .preview-box :deep(table) {
    width: 100%;
    border-collapse: collapse;
  }

  .preview-box :deep(th),
  .preview-box :deep(td) {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }

  .preview-box :deep(th) {
    background-color: #f2f2f2;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-2);
    border-top: 1px solid var(--border);
    margin-top: 2rem;
    font-size: 0.85rem;
  }
</style>
