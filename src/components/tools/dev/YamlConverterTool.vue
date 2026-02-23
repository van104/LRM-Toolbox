<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <!-- Header -->
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">YAML<span>.转换()</span></h1>
        <div class="badge">🔄 YAML ⇄ JSON ⇄ Prop</div>
      </header>

      <!-- Main Layout -->
      <div class="brutal-layout">
        <!-- Input Pane -->
        <div class="brutal-pane editor-pane">
          <div class="pane-header bg-yellow">
            <div class="format-switcher">
              <button
                v-for="f in formats"
                :key="'in-' + f"
                :class="['format-tab', { active: inputFormat === f }]"
                @click="inputFormat = f"
              >
                {{ f.toUpperCase() }}
              </button>
            </div>
            <div class="header-actions">
              <button class="action-btn" @click="loadSample">📄 示例</button>
              <button class="action-btn clear-btn" @click="clearInput">✕</button>
            </div>
          </div>
          <textarea
            v-model="inputText"
            class="code-textarea"
            :placeholder="`输入 ${inputFormat.toUpperCase()} 内容...`"
            spellcheck="false"
          ></textarea>
        </div>

        <!-- Middle Controls -->
        <div class="brutal-controls">
          <button class="brutal-btn control-btn main-btn" :disabled="!inputText" @click="convert">
            <span class="btn-icon">⚡</span>
            <span class="btn-text">转换</span>
          </button>
          <button class="brutal-btn control-btn swap-btn" @click="swap">
            <span class="btn-icon">⇄</span>
            <span class="btn-text">调换</span>
          </button>
        </div>

        <!-- Output Pane -->
        <div class="brutal-pane editor-pane">
          <div class="pane-header bg-green">
            <div class="format-switcher">
              <button
                v-for="f in formats"
                :key="'out-' + f"
                :class="['format-tab', { active: outputFormat === f }]"
                @click="outputFormat = f"
              >
                {{ f.toUpperCase() }}
              </button>
            </div>
            <div class="header-actions">
              <button class="action-btn copy-btn" :disabled="!outputText" @click="copyOutput">
                📋 复制
              </button>
              <button class="action-btn dll-btn" :disabled="!outputText" @click="downloadOutput">
                💾
              </button>
            </div>
          </div>
          <textarea
            v-model="outputText"
            class="code-textarea output-area"
            placeholder="转换结果..."
            readonly
            spellcheck="false"
          ></textarea>
        </div>
      </div>

      <!-- Error Message Area -->
      <div v-if="error" class="brutal-error-box">
        <span class="err-icon">⚠️</span>
        <div class="err-content">
          <div class="err-title">转换出错啦！</div>
          <code class="err-msg">{{ error }}</code>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { useCopy } from '@/composables/useCopy';

  const { copyToClipboard } = useCopy();

  const inputText = ref('');
  const outputText = ref('');
  const inputFormat = ref('yaml');
  const outputFormat = ref('json');
  const error = ref('');

  const formats = ['yaml', 'json', 'properties'];

  const samples = {
    yaml: `server:
  port: 8080
  host: localhost
database:
  driver: mysql
  url: jdbc:mysql://localhost:3306/mydb
  username: root
  password: secret
features:
  - name: auth
    enabled: true
  - name: cache
    enabled: false`,
    json: `{
  "server": {
    "port": 8080,
    "host": "localhost"
  },
  "database": {
    "driver": "mysql",
    "url": "jdbc:mysql://localhost:3306/mydb",
    "username": "root",
    "password": "secret"
  },
  "features": [
    { "name": "auth", "enabled": true },
    { "name": "cache", "enabled": false }
  ]
}`,
    properties: `server.port=8080
server.host=localhost
database.driver=mysql
database.url=jdbc:mysql://localhost:3306/mydb
database.username=root
database.password=secret`
  };

  const loadSample = () => {
    inputText.value = samples[inputFormat.value];
    error.value = '';
  };

  const clearInput = () => {
    inputText.value = '';
    outputText.value = '';
    error.value = '';
  };

  const parseYaml = yaml => {
    const lines = yaml.split('\n');
    const result = {};
    const stack = [{ indent: -1, obj: result }];
    let currentArray = null;

    for (let line of lines) {
      if (!line.trim() || line.trim().startsWith('#')) continue;

      const indent = line.search(/\S/);
      const content = line.trim();

      if (content.startsWith('- ')) {
        const value = content.slice(2).trim();
        while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
        if (currentArray && currentArray.indent === indent) {
          if (value.includes(':')) {
            const obj = {};
            const [k, v] = value.split(':').map(s => s.trim());
            obj[k] = parseValue(v);
            currentArray.arr.push(obj);
          } else {
            currentArray.arr.push(parseValue(value));
          }
        }
        continue;
      }

      const colonIdx = content.indexOf(':');
      if (colonIdx === -1) continue;

      const key = content.slice(0, colonIdx).trim();
      const value = content.slice(colonIdx + 1).trim();

      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
      const parent = stack[stack.length - 1].obj;

      if (value === '') {
        const nextLineIdx = lines.indexOf(line) + 1;
        const nextLine = lines[nextLineIdx];
        if (nextLine && nextLine.trim().startsWith('-')) {
          parent[key] = [];
          currentArray = { indent: nextLine.search(/\S/), arr: parent[key] };
        } else {
          parent[key] = {};
          stack.push({ indent, obj: parent[key] });
        }
      } else {
        parent[key] = parseValue(value);
      }
    }
    return result;
  };

  const parseValue = str => {
    if (str === 'true') return true;
    if (str === 'false') return false;
    if (str === 'null') return null;
    if (/^-?\d+$/.test(str)) return parseInt(str);
    if (/^-?\d*\.\d+$/.test(str)) return parseFloat(str);
    return str.replace(/^["']|["']$/g, '');
  };

  const toYaml = (obj, indent = 0) => {
    const pad = '  '.repeat(indent);
    let result = '';
    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        result += `${pad}${key}:\n`;
        for (const item of value) {
          if (typeof item === 'object') {
            const entries = Object.entries(item);
            result += `${pad}  - ${entries[0][0]}: ${entries[0][1]}\n`;
            for (let i = 1; i < entries.length; i++) {
              result += `${pad}    ${entries[i][0]}: ${entries[i][1]}\n`;
            }
          } else {
            result += `${pad}  - ${item}\n`;
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        result += `${pad}${key}:\n${toYaml(value, indent + 1)}`;
      } else {
        result += `${pad}${key}: ${value}\n`;
      }
    }
    return result;
  };

  const parseProperties = props => {
    const result = {};
    for (const line of props.split('\n')) {
      if (!line.trim() || line.trim().startsWith('#')) continue;
      const eqIdx = line.indexOf('=');
      if (eqIdx === -1) continue;
      const key = line.slice(0, eqIdx).trim();
      const value = line.slice(eqIdx + 1).trim();
      const parts = key.split('.');
      let obj = result;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!obj[parts[i]]) obj[parts[i]] = {};
        obj = obj[parts[i]];
      }
      obj[parts[parts.length - 1]] = parseValue(value);
    }
    return result;
  };

  const toProperties = (obj, prefix = '') => {
    let result = '';
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result += toProperties(value, fullKey);
      } else {
        result += `${fullKey}=${value}\n`;
      }
    }
    return result;
  };

  const convert = () => {
    error.value = '';
    try {
      let data;
      if (inputFormat.value === 'yaml') {
        data = parseYaml(inputText.value);
      } else if (inputFormat.value === 'json') {
        data = JSON.parse(inputText.value);
      } else {
        data = parseProperties(inputText.value);
      }

      if (outputFormat.value === 'yaml') {
        outputText.value = toYaml(data);
      } else if (outputFormat.value === 'json') {
        outputText.value = JSON.stringify(data, null, 2);
      } else {
        outputText.value = toProperties(data);
      }
    } catch (e) {
      error.value = e.message;
    }
  };

  const swap = () => {
    [inputFormat.value, outputFormat.value] = [outputFormat.value, inputFormat.value];
    if (outputText.value) {
      inputText.value = outputText.value;
      outputText.value = '';
    }
  };

  const copyOutput = () => {
    if (outputText.value) copyToClipboard(outputText.value, { success: '✔ 已复制内容' });
  };

  const downloadOutput = () => {
    const extEnum = { yaml: 'yml', json: 'json', properties: 'properties' };
    const blob = new Blob([outputText.value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `output.${extEnum[outputFormat.value]}`;
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
    text-shadow: 4px 4px 0px #7c3aed;
  }

  .brutal-title span {
    color: #7c3aed;
    text-shadow: 4px 4px 0px #111;
    letter-spacing: 0;
  }

  .badge {
    background: #7c3aed;
    color: #fff;
    padding: 0.5rem 1.2rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    border: 4px solid #111;
    box-shadow: 5px 5px 0px #111;
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

  .brutal-btn:hover:not(:disabled) {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }
  .brutal-btn:active:not(:disabled) {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }
  .brutal-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: translate(4px, 4px);
    box-shadow: 2px 2px 0px #111;
  }

  /* Layout */
  .brutal-layout {
    display: flex;
    gap: 1rem;
    align-items: stretch;
    min-height: 550px;
  }

  .brutal-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
    border: 4px solid #111;
    background: #fff;
    box-shadow: 8px 8px 0px #111;
    overflow: hidden;
  }

  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.6rem 1rem;
    border-bottom: 4px solid #111;
    flex-shrink: 0;
  }

  .bg-yellow {
    background: #ffd900;
  }
  .bg-green {
    background: #00e572;
  }

  /* Format Switcher */
  .format-switcher {
    display: flex;
    gap: 4px;
    background: #111;
    padding: 3px;
    border-radius: 2px;
  }

  .format-tab {
    border: none;
    background: transparent;
    color: #fff;
    padding: 0.3rem 0.6rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.1s;
  }

  .format-tab.active {
    background: #fff;
    color: #111;
  }

  .header-actions {
    display: flex;
    gap: 0.5rem;
  }

  .action-btn {
    border: 3px solid #111;
    background: #fff;
    padding: 0.2rem 0.6rem;
    font-family: 'IBM Plex Mono', sans-serif;
    font-weight: 800;
    font-size: 0.85rem;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.1s;
  }

  .action-btn:hover:not(:disabled) {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
  }
  .action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .clear-btn {
    background: #ff4b4b;
    color: #fff;
  }
  .copy-btn {
    background: #ffd900;
  }
  .dll-btn {
    background: #06b6d4;
  }

  .code-textarea {
    flex: 1;
    width: 100%;
    padding: 1.25rem;
    font-family: 'IBM Plex Mono', 'Consolas', monospace;
    font-size: 1rem;
    line-height: 1.6;
    border: none;
    outline: none;
    resize: none;
    background: transparent;
    color: #111;
  }

  .code-textarea:focus {
    background: #fafafa;
  }
  .output-area {
    background: #fdfae5;
  }

  /* Controls */
  .brutal-controls {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1.5rem;
    width: 140px;
    flex-shrink: 0;
  }

  .control-btn {
    flex-direction: column;
    padding: 1.25rem 0.5rem;
    height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .main-btn {
    background: #ffd900;
    border-width: 4px;
  }
  .swap-btn {
    background: #06b6d4;
    border-width: 4px;
  }

  .btn-icon {
    font-size: 1.8rem;
  }
  .btn-text {
    font-size: 0.9rem;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    text-transform: uppercase;
  }

  /* Error Box */
  .brutal-error-box {
    margin-top: 1rem;
    border: 4px solid #111;
    background: #ff4b4b;
    color: #fff;
    padding: 1rem 1.5rem;
    display: flex;
    gap: 1rem;
    box-shadow: 8px 8px 0px #111;
    animation: shake 0.5s;
  }

  .err-icon {
    font-size: 2rem;
  }
  .err-title {
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    font-size: 1.1rem;
    margin-bottom: 0.25rem;
  }
  .err-msg {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.9rem;
    background: rgba(0, 0, 0, 0.2);
    padding: 0.25rem 0.5rem;
    border-radius: 2px;
    word-break: break-all;
  }

  @keyframes shake {
    0%,
    100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-5px);
    }
    75% {
      transform: translateX(5px);
    }
  }

  @media (max-width: 1024px) {
    .brutal-layout {
      flex-direction: column;
      height: auto;
      align-items: stretch;
    }
    .brutal-controls {
      flex-direction: row;
      width: 100%;
      margin: 1rem 0;
    }
    .control-btn {
      flex: 1;
      flex-direction: row;
      padding: 1rem;
    }
    .code-textarea {
      min-height: 350px;
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
  [data-theme='dark'] .brutal-btn:hover:not(:disabled) {
    box-shadow: 9px 9px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:disabled {
    box-shadow: 2px 2px 0px #eee;
  }

  [data-theme='dark'] .brutal-pane {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
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

  [data-theme='dark'] .format-switcher {
    background: #eee;
  }
  [data-theme='dark'] .format-tab {
    color: #111;
  }
  [data-theme='dark'] .format-tab.active {
    background: #111;
    color: #fff;
  }

  [data-theme='dark'] .action-btn {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .clear-btn {
    background: #991b1b;
  }
  [data-theme='dark'] .copy-btn {
    background: #b28f00;
    color: #111;
  }
  [data-theme='dark'] .dll-btn {
    background: #0891b2;
    color: #111;
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

  [data-theme='dark'] .main-btn {
    background: #b28f00;
    color: #eee;
  }
  [data-theme='dark'] .swap-btn {
    background: #0891b2;
    color: #eee;
  }

  [data-theme='dark'] .brutal-error-box {
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
    background: #991b1b;
  }

  [data-theme='dark'] .badge {
    border-color: #eee;
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
</style>
