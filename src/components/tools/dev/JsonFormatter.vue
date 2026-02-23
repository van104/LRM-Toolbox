<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">JSON<span>.格式化()</span></h1>
        <button class="brutal-btn clear-btn" @click="clearAll">清空全部</button>
      </header>

      <div class="brutal-toolbar">
        <div class="tools-left">
          <button class="brutal-action-btn primary" @click="formatJson">格式化</button>
          <button class="brutal-action-btn" @click="compressJson">压缩</button>
          <button class="brutal-action-btn" @click="validateJson">校验</button>
        </div>
        <div class="tools-right">
          <span>缩进:</span>
          <select v-model="indentSize" class="brutal-select">
            <option :value="2">2 空格</option>
            <option :value="4">4 空格</option>
            <option value="tab">TAB</option>
          </select>
        </div>
      </div>

      <div class="brutal-grid">
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span>原始输入.JSON</span>
            <div class="pane-actions">
              <button @click="pasteFromClipboard">粘贴</button>
              <button @click="loadSample">示例</button>
            </div>
          </div>
          <div class="textarea-wrapper">
            <textarea
              v-model="inputJson"
              class="brutal-editor"
              placeholder="在这里粘贴混乱的 JSON 负荷..."
              spellcheck="false"
              @input="autoValidate"
            ></textarea>
          </div>
        </div>

        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">美化输出.JSON</span>
            <div class="pane-actions">
              <button :disabled="!outputJson" @click="copyToClipboard">复制</button>
              <button :disabled="!outputJson" @click="downloadJson">保存</button>
            </div>
          </div>
          <div class="textarea-wrapper">
            <textarea
              v-model="outputJson"
              class="brutal-editor output-editor"
              readonly
              placeholder="等待指令灌入..."
            ></textarea>
          </div>
        </div>
      </div>

      <div class="brutal-status" :class="statusType">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i">{{ statusMessage }} // &nbsp;</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { useCopy } from '@/composables/useCopy';

  const router = useRouter();
  const inputJson = ref('');
  const outputJson = ref('');
  const indentSize = ref(2);
  const statusMessage = ref('系统待命中');
  const statusType = ref('info');
  const { copyToClipboard: copy } = useCopy();

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push('/');
  }
  function clearAll() {
    inputJson.value = '';
    outputJson.value = '';
    showStatus('工作区已清理', 'info');
  }

  function formatJson() {
    if (!inputJson.value.trim()) return showStatus('错误: 负载为空', 'error');
    try {
      const parsed = JSON.parse(inputJson.value);
      const indent = indentSize.value === 'tab' ? '\t' : indentSize.value;
      outputJson.value = JSON.stringify(parsed, null, indent);
      showStatus('格式已优化 : 所有系统正常运行', 'success');
    } catch (e) {
      showStatus(`解析错误: ${e.message}`, 'error');
      outputJson.value = '';
    }
  }

  function compressJson() {
    if (!inputJson.value.trim()) return showStatus('错误: 负载为空', 'error');
    try {
      const parsed = JSON.parse(inputJson.value);
      outputJson.value = JSON.stringify(parsed);
      showStatus('负载已极简化压缩', 'success');
    } catch (e) {
      showStatus(`解析错误: ${e.message}`, 'error');
      outputJson.value = '';
    }
  }

  function validateJson() {
    if (!inputJson.value.trim()) return showStatus('错误: 负载为空', 'error');
    try {
      JSON.parse(inputJson.value);
      showStatus('校验: 通过 : 许可加载', 'success');
    } catch (e) {
      showStatus(`校验: 拒绝加载 (${e.message})`, 'error');
    }
  }

  function autoValidate() {
    if (!inputJson.value.trim()) return showStatus('系统待命中', 'info');
    try {
      JSON.parse(inputJson.value);
      showStatus('语法正确 : 有效的 JSON', 'success');
    } catch (e) {
      showStatus(`语法错误: ${e.message}`, 'error');
    }
  }

  async function pasteFromClipboard() {
    try {
      inputJson.value = await navigator.clipboard.readText();
      autoValidate();
      ElMessage.success({ message: '数据已导入' });
    } catch {
      ElMessage.error({ message: '剪贴板访问被拒绝' });
    }
  }

  function copyToClipboard() {
    copy(outputJson.value, { success: '已安全复制到剪贴板' });
  }

  function loadSample() {
    inputJson.value = JSON.stringify(
      {
        应用: 'LRM-工具箱',
        模块: 'JSON 锻造厂',
        设计风格: '新粗野主义浅色模式',
        核心特性: [
          { 名称: '生机勃勃的纯白', 视觉冲击力: '高度' },
          { 名称: '锋利的阴影', 视觉冲击力: '极大' },
          { 名称: '等宽字体渲染', 美学: '硬核原生态' }
        ],
        设置项: {
          大胆果断: 100,
          无足轻重: null
        }
      },
      null,
      2
    );
    autoValidate();
  }

  function downloadJson() {
    const blob = new Blob([outputJson.value], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'forge_output.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function showStatus(message, type) {
    statusMessage.value = message;
    statusType.value = type;
  }
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
    max-width: 1600px;
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
    text-shadow: 4px 4px 0px #ff4b4b;
  }

  .brutal-title span {
    color: #ff4b4b;
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

  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }

  .brutal-btn:active {
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
    padding: 1.5rem;
    margin-bottom: 2.5rem;
    box-shadow: 8px 8px 0px #111;
  }

  .tools-left {
    display: flex;
    gap: 1.5rem;
  }

  .brutal-action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.6rem 2rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
  }

  .brutal-action-btn.primary {
    background: #00e572;
  }

  .brutal-action-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .brutal-action-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px #111;
  }

  .tools-right {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-weight: 800;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.1rem;
  }

  .brutal-select {
    border: 3px solid #111;
    padding: 0.4rem 0.8rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 1rem;
    background: #ffd900;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    outline: none;
  }

  .brutal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    margin-bottom: 3rem;
    min-height: 550px;
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
    color: #fff;
  }
  .text-white {
    color: #fff;
  }

  .pane-actions {
    display: flex;
    gap: 0.75rem;
  }

  .pane-actions button {
    background: #fff;
    color: #111;
    border: 3px solid #111;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 0.9rem;
    padding: 0.35rem 0.75rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }

  .pane-actions button:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }

  .pane-actions button:active:not(:disabled) {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }

  .pane-actions button:disabled {
    background: #eee;
    color: #aaa;
    border-color: #aaa;
    box-shadow: 2px 2px 0px #aaa;
    cursor: not-allowed;
    transform: none;
  }

  .textarea-wrapper {
    flex: 1;
    display: flex;
    padding: 0;
    position: relative;
  }

  .brutal-editor {
    flex: 1;
    width: 100%;
    border: none;
    padding: 1.5rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-size: 1.05rem;
    line-height: 1.6;
    resize: none;
    outline: none;
    background: transparent;
    color: #111;
  }

  .brutal-editor::placeholder {
    color: #888;
    font-style: italic;
  }

  .output-editor {
    background: #f8fafc;
  }

  .brutal-status {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    padding: 1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.5rem;
    overflow: hidden;
    position: relative;
    text-transform: uppercase;
  }

  .brutal-status.info {
    background: #fff;
  }
  .brutal-status.success {
    background: #00e572;
  }
  .brutal-status.error {
    background: #ff4b4b;
    color: white;
  }

  .marquee-wrapper {
    width: 100%;
    overflow: hidden;
  }

  .marquee-content {
    display: inline-block;
    white-space: nowrap;
    animation: marquee 20s linear infinite;
  }

  @keyframes marquee {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  @media (max-width: 1024px) {
    .brutal-title {
      font-size: 2.5rem;
    }
    .brutal-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
      min-height: auto;
    }
    .brutal-pane {
      min-height: 400px;
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
  [data-theme='dark'] .pane-actions button,
  [data-theme='dark'] .brutal-status,
  [data-theme='dark'] .brutal-status.info {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 9px 9px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .brutal-toolbar {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn {
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:hover {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane:hover {
    box-shadow: 16px 16px 0px #eee;
  }

  [data-theme='dark'] .pane-actions button {
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .pane-actions button:hover:not(:disabled) {
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .pane-actions button:active:not(:disabled) {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
    color: #111;
  }

  [data-theme='dark'] .brutal-editor {
    color: #eee;
  }
  [data-theme='dark'] .output-editor {
    background: #222;
  }
  [data-theme='dark'] .brutal-status {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-select {
    background: #b28f00;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
    color: #fff;
  }

  [data-theme='dark'] .brutal-action-btn.primary {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .brutal-btn.clear-btn {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .brutal-status.error {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .brutal-status.success {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
</style>
