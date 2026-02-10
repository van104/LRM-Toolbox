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
      <h1 class="tool-title">字符串转义工具</h1>
      <div class="header-right"></div>
    </header>

    <div class="tool-content">
      <div class="layout-container">
        <section class="panel input-panel">
          <div class="panel-header">
            <span class="panel-title">输入</span>
            <div class="actions">
              <el-button size="small" text @click="inputText = ''">清空</el-button>
            </div>
          </div>
          <div class="editor-wrapper">
            <textarea
              v-model="inputText"
              class="code-editor"
              placeholder="输入需要处理的文本..."
              spellcheck="false"
            ></textarea>
          </div>
        </section>

        <section class="control-panel">
          <div class="control-group">
            <div class="label">语言模式</div>
            <el-select v-model="mode" class="full-width">
              <el-option label="Java / C# / C++" value="java" />
              <el-option label="JavaScript / JSON" value="js" />
              <el-option label="HTML Entities" value="html" />
              <el-option label="XML" value="xml" />
              <el-option label="SQL (Single Quote)" value="sql" />
              <el-option label="URL Encode" value="url" />
              <el-option label="CSV" value="csv" />
            </el-select>
          </div>

          <div class="control-actions">
            <el-button type="primary" class="action-btn" @click="doEscape">
              转义
              <el-icon>
                <Right />
              </el-icon>
            </el-button>
            <el-button class="action-btn" @click="doUnescape">
              <el-icon>
                <Back />
              </el-icon>
              反转义
            </el-button>
          </div>

          <div class="info-box">
            <p v-if="mode === 'java'">处理双引号、反斜杠、换行符等。</p>
            <p v-if="mode === 'js'">标准 JSON 字符串转义。</p>
            <p v-if="mode === 'html'">将 &lt; &gt; &amp; " ' 转换为实体。</p>
            <p v-if="mode === 'xml'">XML 仅支持 &lt; &gt; &amp; " '。</p>
            <p v-if="mode === 'sql'">将单引号转义为双单引号。</p>
          </div>
        </section>

        <section class="panel output-panel">
          <div class="panel-header">
            <span class="panel-title">结果</span>
            <div class="actions">
              <el-button size="small" :disabled="!outputText" @click="copyResult">复制</el-button>
            </div>
          </div>
          <div class="editor-wrapper">
            <textarea
              v-model="outputText"
              class="code-editor result-editor"
              readonly
              placeholder="处理结果..."
            ></textarea>
          </div>
        </section>
      </div>

      <div class="help-section">
        <h3>
          <el-icon>
            <QuestionFilled />
          </el-icon>
          使用指南
        </h3>
        <div class="help-grid">
          <div class="help-card">
            <h4>1. 代码转义 (Java/JS)</h4>
            <p>将特殊字符转换为字符串字面量安全格式。</p>
            <div class="example">
              <code>"Hello"</code> → <code>\"Hello\"</code><br />
              <code>Line1\nLine2</code> → <code>Line1\\nLine2</code>
            </div>
          </div>
          <div class="help-card">
            <h4>2. 网页转义 (HTML/XML)</h4>
            <p>将预留字符转换为实体 (Entities)，防止 XSS 或解析错误。</p>
            <div class="example"><code>&lt;div&gt;</code> → <code>&amp;lt;div&amp;gt;</code></div>
          </div>
          <div class="help-card">
            <h4>3. 数据库转义 (SQL)</h4>
            <p>处理单引号，防止 SQL 注入或语法错误。</p>
            <div class="example"><code>O'Neil</code> → <code>O''Neil</code></div>
          </div>
          <div class="help-card">
            <h4>4. URL 编码</h4>
            <p>将非 ASCII 字符转换为百分号编码。</p>
            <div class="example"><code>测试</code> → <code>%E6%B5%8B%E8%AF%95</code></div>
          </div>
        </div>
      </div>
    </div>
    <footer class="footer">© 2026 LRM工具箱 - 字符串转义工具</footer>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { ArrowLeft, Right, Back, QuestionFilled } from '@element-plus/icons-vue';

  const router = useRouter();
  const inputText = ref('');
  const outputText = ref('');
  const mode = ref('java');

  function doEscape() {
    if (!inputText.value) return;
    try {
      outputText.value = escapeLogic(inputText.value, mode.value);
    } catch (e) {
      ElMessage.error('转义失败: ' + e.message);
    }
  }

  function doUnescape() {
    if (!inputText.value) return;

    try {
      outputText.value = unescapeLogic(inputText.value, mode.value);
    } catch (e) {
      ElMessage.error('反转义失败: ' + e.message);
    }
  }

  function escapeLogic(str, type) {
    switch (type) {
      case 'java':
      case 'js':
        return JSON.stringify(str).slice(1, -1);

      case 'html':
        return str
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      case 'xml':
        return str
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');
      case 'sql':
        return str.replace(/'/g, "''");
      case 'url':
        return encodeURIComponent(str);
      case 'csv':
        if (/[",\n]/.test(str)) {
          return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
      default:
        return str;
    }
  }

  function unescapeLogic(str, type) {
    switch (type) {
      case 'java':
      case 'js':
        // JSON.parse(`"${str}"`) might fail if str contains newlines literally without escape?
        // If user inputs: \n (two chars), JSON.parse handles it.
        // If user inputs actual newline, JSON.parse fails on unescaped newline within string.
        // But Textarea content has actual newlines.
        // We assume input is the "Escaped String" content.
        // E.g. input: Hello\nWorld
        return JSON.parse('"' + str.replace(/"/g, '\\"') + '"');
      // This is tricky. simpler to stick to JSON.parse?
      // Or custom unescape.
      case 'html': {
        const doc = new DOMParser().parseFromString(str, 'text/html');
        return doc.documentElement.textContent;
      }
      case 'xml': {
        const docXml = new DOMParser().parseFromString('<root>' + str + '</root>', 'text/xml');
        return docXml.documentElement.textContent;
      }
      case 'sql':
        return str.replace(/''/g, "'");
      case 'url':
        return decodeURIComponent(str);
      case 'csv':
        if (str.startsWith('"') && str.endsWith('"')) {
          return str.slice(1, -1).replace(/""/g, '"');
        }
        return str;
      default:
        return str;
    }
  }

  function copyResult() {
    if (!outputText.value) return;
    navigator.clipboard.writeText(outputText.value).then(() => ElMessage.success('已复制'));
  }

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push('/');
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
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #ffffff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  .tool-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
  }

  .tool-content {
    flex: 1;
    max-width: 1400px;
    width: 100%;
    margin: 0 auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
  }

  .layout-container {
    display: flex;
    gap: 1rem;
    height: calc(100vh - 180px);
    min-height: 500px;
  }

  .panel {
    flex: 1;
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .control-panel {
    width: 250px;
    background: #ffffff;

    background: #f8fafc;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    justify-content: center;
  }

  .panel-header {
    background: #f8fafc;
    padding: 0.8rem 1rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .panel-title {
    font-weight: 600;
    color: #1e293b;
    font-size: 0.95rem;
  }

  .editor-wrapper {
    flex: 1;
    position: relative;
    background: #fff;
  }

  .code-editor {
    width: 100%;
    height: 100%;
    border: none;
    padding: 1rem;
    resize: none;
    outline: none;
    font-family: 'Consolas', monospace;
    font-size: 0.9rem;
    line-height: 1.5;
    color: #334155;
    background: transparent;
  }

  .result-editor {
    background: #fdfdfd;
  }

  .control-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #64748b;
  }

  .full-width {
    width: 100%;
  }

  .control-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .action-btn {
    width: 100%;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
  }

  .info-box {
    background: #e2e8f0;
    padding: 1rem;
    border-radius: 8px;
    font-size: 0.8rem;
    color: #475569;
    line-height: 1.5;
  }

  @media (prefers-color-scheme: dark) {
    .tool-page {
      background: #111827;
    }

    .tool-header,
    .footer {
      background: #1f2937;
      border-color: #374151;
      color: #f3f4f6;
    }

    .tool-title {
      color: #f3f4f6;
    }

    .panel,
    .control-panel {
      background: #1f2937;
      border-color: #374151;
    }

    .panel-header {
      background: #374151;
      border-color: #4b5563;
    }

    .panel-title {
      color: #f3f4f6;
    }

    .code-editor {
      color: #e2e8f0;
      background: #1f2937;
    }

    .result-editor {
      background: #111827;
    }

    .info-box {
      background: #374151;
      color: #cbd5e1;
    }

    .label {
      color: #cbd5e1;
    }
  }

  .help-section {
    margin-top: 2rem;
    background: #fff;
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid rgba(0, 0, 0, 0.08);
  }

  .help-section h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #334155;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .help-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .help-card h4 {
    font-weight: 600;
    color: #475569;
    margin-bottom: 0.5rem;
    font-size: 0.95rem;
  }

  .help-card p {
    font-size: 0.85rem;
    color: #64748b;
    line-height: 1.5;
    margin-bottom: 0.5rem;
  }

  .help-card .example {
    background: #f8fafc;
    padding: 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    color: #334155;
    border: 1px solid #e2e8f0;
    font-family: monospace;
    overflow-wrap: break-word;
  }

  .help-card code {
    background: #f1f5f9;
    padding: 2px 4px;
    border-radius: 3px;
    color: #0d9488;
  }

  @media (prefers-color-scheme: dark) {
    .help-section {
      background: #1f2937;
      border-color: #374151;
    }

    .help-section h3 {
      color: #f3f4f6;
    }

    .help-card h4 {
      color: #e2e8f0;
    }

    .help-card p {
      color: #94a3b8;
    }

    .help-card .example {
      background: #374151;
      border-color: #4b5563;
      color: #cbd5e1;
    }

    .help-card code {
      background: #4b5563;
      color: #5eead4;
    }
  }

  @media (max-width: 800px) {
    .layout-container {
      flex-direction: column;
      height: auto;
    }

    .panel,
    .control-panel {
      width: 100%;
    }

    .panel {
      min-height: 200px;
    }
  }

  .footer {
    text-align: center;
    padding: 1rem 0;
    color: var(--text-secondary, #64748b);
    font-size: 0.85rem;
  }
</style>
