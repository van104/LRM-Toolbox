<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">URL<span>.编解码()</span></h1>
        <button class="brutal-btn clear-btn" @click="clearAll">清空全部</button>
      </header>

      <div class="brutal-toolbar">
        <div class="tools-left">
          <button class="brutal-action-btn primary" @click="doEncode">编码 (Encode)</button>
          <button class="brutal-action-btn" @click="doDecode">解码 (Decode)</button>
          <button class="brutal-action-btn" @click="copyInput">复制结果</button>
        </div>
      </div>

      <div class="brutal-grid">
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span>URL.输入</span>
            <div class="pane-actions">
              <button @click="doEncode">编码</button>
              <button @click="doDecode">解码</button>
            </div>
          </div>
          <div class="textarea-wrapper">
            <textarea
              v-model="inputUrl"
              class="brutal-editor"
              placeholder="请输入需要处理的 URL..."
              spellcheck="false"
            ></textarea>
          </div>
        </div>

        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">参数.解析(Query)</span>
            <div class="pane-actions">
              <button @click="addParam">添加参数</button>
            </div>
          </div>
          <div class="params-table-container">
            <template v-if="parsedParams.length > 0">
              <div v-for="(param, index) in parsedParams" :key="index" class="param-row">
                <input
                  v-model="param.key"
                  class="brutal-input"
                  placeholder="Key"
                  @input="updateUrlFromParams"
                />
                <span class="param-separator">=</span>
                <input
                  v-model="param.value"
                  class="brutal-input"
                  placeholder="Value"
                  @input="updateUrlFromParams"
                />
                <button class="brutal-action-btn remove-btn" @click="removeParam(index)">删</button>
              </div>
            </template>
            <div v-else class="empty-params">暂无参数解析结果</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { useCopy } from '@/composables/useCopy';

  const router = useRouter();
  const { copyToClipboard } = useCopy();

  const inputUrl = ref('');
  const parsedParams = ref([]);

  watch(inputUrl, newVal => {
    if (isUpdatingFromParams) return;
    parseParams(newVal);
  });

  let isUpdatingFromParams = false;

  function parseParams(url) {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `http://example.com/${url}`);
      const params = [];
      urlObj.searchParams.forEach((value, key) => {
        params.push({ key, value });
      });
      parsedParams.value = params;
    } catch {
      if (url.includes('?')) {
        const queryString = url.split('?')[1];
        const params = new URLSearchParams(queryString);
        const list = [];
        params.forEach((value, key) => {
          list.push({ key, value });
        });
        parsedParams.value = list;
      } else {
        parsedParams.value = [];
      }
    }
  }

  function updateUrlFromParams() {
    isUpdatingFromParams = true;
    try {
      let baseUrl = inputUrl.value.split('?')[0];

      const searchParams = new URLSearchParams();
      parsedParams.value.forEach(p => {
        if (p.key) searchParams.append(p.key, p.value);
      });
      const queryString = searchParams.toString();

      if (queryString) {
        inputUrl.value = `${baseUrl}?${queryString}`;
      } else {
        inputUrl.value = baseUrl;
      }
    } finally {
      setTimeout(() => {
        isUpdatingFromParams = false;
      }, 0);
    }
  }

  function doEncode() {
    try {
      inputUrl.value = encodeURIComponent(inputUrl.value);
      ElMessage.success({ message: 'URL 编码成功' });
    } catch {
      ElMessage.error({ message: '编码失败' });
    }
  }

  function doDecode() {
    try {
      inputUrl.value = decodeURIComponent(inputUrl.value);
      ElMessage.success({ message: 'URL 解码成功' });
    } catch {
      ElMessage.error({ message: '解码失败' });
    }
  }

  function copyInput() {
    if (!inputUrl.value) {
      ElMessage.warning({ message: '结果为空' });
      return;
    }
    copyToClipboard(inputUrl.value, { success: '已复制' });
  }

  function removeParam(index) {
    parsedParams.value.splice(index, 1);
    updateUrlFromParams();
  }

  function addParam() {
    parsedParams.value.push({ key: '', value: '' });
  }

  function goBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }

  function clearAll() {
    inputUrl.value = '';
    parsedParams.value = [];
    ElMessage.info({ message: '工作区已清理' });
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

  .brutal-action-btn.remove-btn {
    padding: 0.4rem 1rem;
    background: #ff4b4b;
    color: #fff;
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

  .params-table-container {
    flex: 1;
    padding: 1.5rem;
    background: #f8fafc;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .param-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .param-separator {
    font-weight: 800;
    font-size: 1.2rem;
  }

  .brutal-input {
    flex: 1;
    border: 3px solid #111;
    padding: 0.6rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-size: 1rem;
    background: #fff;
    color: #111;
    box-shadow: 3px 3px 0px #111;
    outline: none;
    transition: all 0.1s;
  }

  .brutal-input:focus {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }

  .empty-params {
    text-align: center;
    color: #888;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 600;
    margin-top: 2rem;
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
  [data-theme='dark'] .brutal-input {
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
  [data-theme='dark'] .params-table-container {
    background: #222;
  }
  [data-theme='dark'] .brutal-input {
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .brutal-input:focus {
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn.primary {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .brutal-btn.clear-btn,
  [data-theme='dark'] .brutal-action-btn.remove-btn {
    background: #cc0000;
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
