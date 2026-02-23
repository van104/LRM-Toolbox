<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <!-- Header -->
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">XML<span>.格式化()</span></h1>
        <div class="badge">🪄 Formatter & Converter</div>
      </header>

      <!-- Main Layout -->
      <div class="brutal-layout">
        <!-- Left: Input Area -->
        <div class="brutal-pane input-pane">
          <div class="pane-header bg-yellow">
            <span>📥 输入源码 (XML/JSON)</span>
            <div class="header-actions">
              <button class="action-btn get-btn" @click="loadSample">📄 示例</button>
              <button class="action-btn clear-btn" @click="clearInput">✕ 清空</button>
            </div>
          </div>
          <textarea
            v-model="inputText"
            class="code-textarea"
            placeholder="在此粘贴 XML 或 JSON 内容..."
            spellcheck="false"
            @input="autoValidate"
          ></textarea>
          <!-- Validation Status Bar -->
          <div :class="['validation-bar', validationStatus.type]">
            <span class="status-icon">{{ statusIcon }}</span>
            <span class="status-msg">{{ validationStatus.message }}</span>
          </div>
        </div>

        <!-- Middle: Operations Bar -->
        <div class="ops-bar">
          <button class="op-btn" :disabled="!inputText" @click="formatXml">
            <span class="op-icon">✨</span><span class="op-text">格式化 XML</span>
          </button>
          <button class="op-btn" :disabled="!inputText" @click="minifyXml">
            <span class="op-icon">🗜️</span><span class="op-text">压缩 XML</span>
          </button>
          <div class="op-divider"></div>
          <button class="op-btn convert-btn" :disabled="!inputText" @click="xmlToJson">
            <span class="op-icon">➡️</span><span class="op-text">XML 转 JSON</span>
          </button>
          <button class="op-btn convert-btn" :disabled="!inputText" @click="jsonToXml">
            <span class="op-icon">⬅️</span><span class="op-text">JSON 转 XML</span>
          </button>
        </div>

        <!-- Right: Output Area -->
        <div class="brutal-pane output-pane">
          <div class="pane-header bg-green">
            <span>📤 处理结果</span>
            <div class="header-actions">
              <button class="action-btn copy-btn" :disabled="!outputText" @click="copyOutput">
                📋 复制
              </button>
              <button class="action-btn dll-btn" :disabled="!outputText" @click="downloadOutput">
                💾 下载
              </button>
            </div>
          </div>
          <textarea
            v-model="outputText"
            class="code-textarea output-area"
            placeholder="处理后的结果将在这里显示..."
            readonly
            spellcheck="false"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, computed } from 'vue';
  import { useCopy } from '@/composables/useCopy';

  const { copyToClipboard } = useCopy();

  const inputText = ref('');
  const outputText = ref('');
  const validationStatus = reactive({ type: '', message: '等待输入...' });

  const statusIcon = computed(() => {
    if (validationStatus.type === 'success') return '✅';
    if (validationStatus.type === 'error') return '❌';
    return '⏳';
  });

  const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
  <bookstore>
    <book category="fiction">
      <title lang="en">Harry Potter</title>
      <author>J.K. Rowling</author>
      <year>2005</year>
      <price>29.99</price>
    </book>
    <book category="web">
      <title lang="en">Learning XML</title>
      <author>Erik T. Ray</author>
      <year>2003</year>
      <price>39.95</price>
    </book>
  </bookstore>`;

  const loadSample = () => {
    inputText.value = sampleXml;
    autoValidate();
  };

  const clearInput = () => {
    inputText.value = '';
    outputText.value = '';
    validationStatus.type = '';
    validationStatus.message = '等待输入...';
  };

  const parseXml = xml => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const errorNode = doc.querySelector('parsererror');
    if (errorNode) throw new Error(errorNode.textContent);
    return doc;
  };

  const autoValidate = () => {
    if (!inputText.value.trim()) {
      validationStatus.type = '';
      validationStatus.message = '等待输入...';
      return;
    }

    // First try XML, if it fails try JSON to handle JSON -> XML case smartly without red screaming error if valid JSON provided
    try {
      parseXml(inputText.value);
      validationStatus.type = 'success';
      validationStatus.message = 'XML 格式合法';
    } catch {
      try {
        JSON.parse(inputText.value);
        validationStatus.type = 'success';
        validationStatus.message = 'JSON 格式合法 (准备用于转XML)';
      } catch {
        validationStatus.type = 'error';
        validationStatus.message = '解析失败 (非合法 XML 或 JSON)';
      }
    }
  };

  const handleMessage = (msg, isError = false) => {
    // We update validation status to show transient errors instead of ElMessage
    if (isError) {
      validationStatus.type = 'error';
      validationStatus.message = '处理出错: ' + msg;
    } else {
      validationStatus.type = 'success';
      validationStatus.message = msg;
    }
  };

  const formatXml = () => {
    if (!inputText.value) return;
    try {
      const doc = parseXml(inputText.value);
      const serializer = new XMLSerializer();
      let xml = serializer.serializeToString(doc);

      xml = xml.replace(/></g, '>\n<');
      const lines = xml.split('\n');
      let indent = 0;
      const formatted = lines
        .map(line => {
          line = line.trim();
          if (!line) return '';
          if (line.startsWith('</')) indent--;
          const result = '  '.repeat(Math.max(0, indent)) + line;
          if (line.match(/^<[^/?][^>]*[^/]>$/) && !line.includes('</')) indent++;
          return result;
        })
        .filter(l => l)
        .join('\n');
      outputText.value = formatted;
      handleMessage('XML 格式化成功');
    } catch (e) {
      handleMessage(e.message, true);
    }
  };

  const minifyXml = () => {
    if (!inputText.value) return;
    try {
      const doc = parseXml(inputText.value);
      const serializer = new XMLSerializer();
      let xml = serializer.serializeToString(doc);
      xml = xml.replace(/>\s+</g, '><').trim();
      outputText.value = xml;
      handleMessage('XML 压缩成功');
    } catch (e) {
      handleMessage(e.message, true);
    }
  };

  const xmlToJson = () => {
    if (!inputText.value) return;
    try {
      const doc = parseXml(inputText.value);
      const xmlToObj = node => {
        const obj = {};
        if (node.attributes) {
          for (const attr of node.attributes) {
            obj['@' + attr.name] = attr.value;
          }
        }
        for (const child of node.childNodes) {
          if (child.nodeType === 3) {
            const text = child.textContent.trim();
            if (text) obj['#text'] = text;
          } else if (child.nodeType === 1) {
            const childObj = xmlToObj(child);
            if (obj[child.nodeName]) {
              if (!Array.isArray(obj[child.nodeName])) obj[child.nodeName] = [obj[child.nodeName]];
              obj[child.nodeName].push(childObj);
            } else {
              obj[child.nodeName] = childObj;
            }
          }
        }

        const keys = Object.keys(obj);
        if (keys.length === 1 && keys[0] === '#text') return obj['#text'];
        return obj;
      };
      const result = { [doc.documentElement.nodeName]: xmlToObj(doc.documentElement) };
      outputText.value = JSON.stringify(result, null, 2);
      handleMessage('XML 转 JSON 成功');
    } catch (e) {
      handleMessage(e.message, true);
    }
  };

  const jsonToXml = () => {
    if (!inputText.value) return;
    try {
      const json = JSON.parse(inputText.value);
      const objToXml = (obj, nodeName) => {
        if (typeof obj !== 'object' || obj === null) return `<${nodeName}>${obj}</${nodeName}>`;
        if (Array.isArray(obj)) return obj.map(item => objToXml(item, nodeName)).join('\n');
        let attrs = '',
          children = '';
        for (const [key, val] of Object.entries(obj)) {
          if (key.startsWith('@')) attrs += ` ${key.slice(1)}="${val}"`;
          else if (key === '#text') children += val;
          else children += objToXml(val, key);
        }
        return `<${nodeName}${attrs}>${children}</${nodeName}>`;
      };
      const keys = Object.keys(json);
      if (keys.length !== 1) throw new Error('JSON 格式必须包含单一根节点');
      const rootKey = keys[0];
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n${objToXml(json[rootKey], rootKey)}`;

      xml = xml.replace(/></g, '>\n<');
      outputText.value = xml;
      handleMessage('JSON 转 XML 成功');
    } catch (e) {
      handleMessage(e.message, true);
    }
  };

  const copyOutput = () => {
    if (outputText.value) copyToClipboard(outputText.value, { success: '✔ 已复制提取结果' });
  };

  const downloadOutput = () => {
    if (!outputText.value) return;
    // determine ext based on output content (starts with { or <)
    const isJson = outputText.value.trim().startsWith('{');
    const ext = isJson ? 'json' : 'xml';
    const mime = isJson ? 'application/json' : 'text/xml';

    const blob = new Blob([outputText.value], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `output.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Syne:wght@700;800;900&family=Noto+Sans+SC:wght@400;700;900&display=swap');

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
    gap: 2rem;
  }

  /* Header */
  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.5rem;
    font-weight: 900;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #ec4899;
  }

  .brutal-title span {
    color: #ec4899;
    text-shadow: 4px 4px 0px #111;
    letter-spacing: 0;
  }

  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }

  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }

  .badge {
    background: #ec4899;
    color: #fff;
    padding: 0.5rem 1.2rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    border: 4px solid #111;
    box-shadow: 5px 5px 0px #111;
  }

  /* Layout */
  .brutal-layout {
    display: flex;
    gap: 1.5rem;
    align-items: stretch;
    height: calc(100vh - 200px);
    min-height: 600px;
  }

  /* Panes */
  .brutal-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
    border: 4px solid #111;
    background: #fff;
    box-shadow: 10px 10px 0px #111;
    overflow: hidden;
  }

  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 1.25rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1.1rem;
    flex-shrink: 0;
  }

  .bg-yellow {
    background: #ffd900;
    color: #111;
  }
  .bg-green {
    background: #00e572;
    color: #111;
  }

  /* Actions */
  .header-actions {
    display: flex;
    gap: 0.5rem;
  }

  .action-btn {
    border: 3px solid #111;
    background: #fff;
    padding: 0.3rem 0.8rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.85rem;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.1s;
  }

  .action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: 0px 0px 0px #111;
    transform: translate(2px, 2px);
  }
  .action-btn:not(:disabled):hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
  }
  .action-btn:not(:disabled):active {
    transform: translate(2px, 2px);
    box-shadow: 0px 0px 0px #111;
  }

  .clear-btn {
    background: #ff4b4b;
    color: #fff;
  }
  .copy-btn {
    background: #ffd900;
    color: #111;
  }
  .dll-btn {
    background: #06b6d4;
    color: #111;
  }

  /* Textareas */
  .code-textarea {
    flex: 1;
    width: 100%;
    border: none;
    padding: 1.25rem;
    font-family: 'IBM Plex Mono', 'Consolas', monospace;
    font-size: 1rem;
    color: #111;
    background: transparent;
    resize: none;
    outline: none;
    line-height: 1.6;
    white-space: pre;
    overflow-x: auto;
  }

  .code-textarea:focus {
    background: #fafafa;
  }
  .output-area {
    background: #fdfae5;
  }

  /* Validation Bar */
  .validation-bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border-top: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.95rem;
    background: #eee;
    color: #555;
    flex-shrink: 0;
  }

  .validation-bar.success {
    background: #bbf7d0;
    color: #166534;
  }
  .validation-bar.error {
    background: #fecaca;
    color: #991b1b;
  }

  /* Ops Bar */
  .ops-bar {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1rem;
    width: 160px;
    flex-shrink: 0;
  }

  .op-divider {
    height: 4px;
    background: #111;
    margin: 1rem 0;
    width: 100%;
  }

  .op-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem 0.5rem;
    border: 4px solid #111;
    background: #fff;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition: all 0.1s;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    color: #111;
  }

  .op-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: 2px 2px 0px #111;
    transform: translate(4px, 4px);
  }

  .op-btn:not(:disabled):hover {
    transform: translate(-2px, -2px);
    box-shadow: 8px 8px 0px #111;
    background: #fdfae5;
  }

  .op-btn:not(:disabled):active {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }

  .convert-btn {
    background: #e0e7ff;
  }
  .convert-btn:not(:disabled):hover {
    background: #c7d2fe;
  }

  .op-icon {
    font-size: 1.5rem;
  }
  .op-text {
    font-size: 0.9rem;
    text-transform: uppercase;
  }

  @media (max-width: 992px) {
    .brutal-layout {
      flex-direction: column;
      height: auto;
      align-items: stretch;
    }
    .code-textarea {
      min-height: 400px;
    }
    .ops-bar {
      flex-direction: row;
      flex-wrap: wrap;
      width: 100%;
      margin: 1rem 0;
    }
    .op-btn {
      flex: 1;
      flex-direction: row;
      min-width: 160px;
      padding: 0.75rem;
    }
    .op-divider {
      display: none;
    }
  }

  /* Dark Mode */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 9px 9px 0px #eee;
  }

  [data-theme='dark'] .brutal-pane {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 10px 10px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }

  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-green {
    background: #007a3d;
    color: #fff;
  }

  [data-theme='dark'] .action-btn {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .copy-btn {
    background: #b28f00;
    color: #111;
  }
  [data-theme='dark'] .dll-btn {
    background: #0891b2;
    color: #111;
  }
  [data-theme='dark'] .clear-btn {
    background: #991b1b;
  }

  [data-theme='dark'] .code-textarea {
    color: #eee;
  }
  [data-theme='dark'] .code-textarea:focus {
    background: #222;
  }
  [data-theme='dark'] .output-area {
    background: #0f172a;
  }

  [data-theme='dark'] .validation-bar {
    border-top-color: #eee;
    background: #222;
    color: #aaa;
  }
  [data-theme='dark'] .validation-bar.success {
    background: #064e3b;
    color: #6ee7b7;
  }
  [data-theme='dark'] .validation-bar.error {
    background: #7f1d1d;
    color: #fca5a5;
  }

  [data-theme='dark'] .op-btn {
    border-color: #eee;
    background: #1a1a1a;
    color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .op-btn:not(:disabled):hover {
    background: #333;
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .op-btn:disabled {
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .op-divider {
    background: #eee;
  }

  [data-theme='dark'] .convert-btn {
    background: #1e1b4b;
  }
  [data-theme='dark'] .convert-btn:not(:disabled):hover {
    background: #312e81;
  }

  [data-theme='dark'] .badge {
    border-color: #eee;
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
</style>
