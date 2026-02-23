<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <!-- Header -->
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">API<span>.调试器()</span></h1>
        <div class="subtitle-badge">// Mini Postman</div>
      </header>

      <!-- Request Bar -->
      <div class="brutal-pane request-bar-pane">
        <div class="request-bar">
          <select
            v-model="method"
            class="brutal-select method-select"
            :class="`method-${method.toLowerCase()}`"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>
          <input v-model="url" type="text" class="brutal-url-input" placeholder="https://..." />
          <button class="brutal-btn send-btn" :disabled="loading" @click="sendRequest">
            <span v-if="!loading">发送请求 →</span>
            <span v-else>请求中...</span>
          </button>
        </div>
      </div>

      <!-- Main Layout -->
      <div class="debugger-grid">
        <!-- Config Panel -->
        <div class="brutal-pane config-pane">
          <div class="pane-header bg-yellow">
            <span>// 请求配置</span>
          </div>
          <!-- Config Tabs -->
          <div class="inner-tab-bar">
            <button
              v-for="t in configTabs"
              :key="t.id"
              :class="['inner-tab', { active: activeRequestTab === t.id }]"
              @click="activeRequestTab = t.id"
            >
              {{ t.label }}
            </button>
          </div>

          <!-- Headers Tab -->
          <div v-if="activeRequestTab === 'headers'" class="tab-body">
            <div class="kv-list">
              <div v-for="(item, index) in headers" :key="index" class="kv-row">
                <input v-model="item.key" class="brutal-kv-input" placeholder="Key" />
                <input v-model="item.value" class="brutal-kv-input" placeholder="Value" />
                <button
                  v-if="headers.length > 1"
                  class="brutal-del-btn"
                  @click="removeHeader(index)"
                >
                  ✕
                </button>
              </div>
            </div>
            <button class="brutal-action-btn small mt-2" @click="addHeader">+ 添加 Header</button>
          </div>

          <!-- Body Tab -->
          <div v-else-if="activeRequestTab === 'body'" class="tab-body">
            <div class="body-type-group">
              <button
                v-for="bt in ['none', 'json', 'form']"
                :key="bt"
                :class="['body-type-btn', { active: bodyType === bt }]"
                :disabled="method === 'GET'"
                @click="bodyType = bt"
              >
                {{ bt }}
              </button>
            </div>
            <textarea
              v-if="bodyType === 'json'"
              v-model="rawBody"
              class="brutal-editor body-textarea"
              placeholder='{ "name": "value" }'
            ></textarea>
            <div v-else-if="bodyType === 'form'" class="kv-list mt-2">
              <div v-for="(item, index) in forms" :key="index" class="kv-row">
                <input v-model="item.key" class="brutal-kv-input" placeholder="Key" />
                <input v-model="item.value" class="brutal-kv-input" placeholder="Value" />
                <button v-if="forms.length > 1" class="brutal-del-btn" @click="removeForm(index)">
                  ✕
                </button>
              </div>
              <button class="brutal-action-btn small mt-2" @click="addForm">+ 添加字段</button>
            </div>
            <div v-else-if="bodyType === 'none'" class="empty-body">该请求不含 Body 内容</div>
          </div>

          <!-- Params Tab -->
          <div v-else-if="activeRequestTab === 'params'" class="tab-body">
            <div class="kv-list">
              <div v-for="(item, index) in params" :key="index" class="kv-row">
                <input v-model="item.key" class="brutal-kv-input" placeholder="Key" />
                <input v-model="item.value" class="brutal-kv-input" placeholder="Value" />
                <button v-if="params.length > 1" class="brutal-del-btn" @click="removeParam(index)">
                  ✕
                </button>
              </div>
            </div>
            <button class="brutal-action-btn small mt-2" @click="addParam">+ 添加 Param</button>
          </div>
        </div>

        <!-- Response Panel -->
        <div class="brutal-pane response-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">// 响应结果</span>
            <div v-if="response" class="res-stats">
              <span :class="['status-tag', getStatusClass(response.status)]">
                {{ response.status }} {{ response.statusText }}
              </span>
              <span class="stat-chip">{{ response.time }}ms</span>
              <span class="stat-chip">{{ response.size }}</span>
            </div>
          </div>

          <div class="inner-tab-bar">
            <button
              v-for="t in responseTabs"
              :key="t.id"
              :class="['inner-tab', { active: activeResponseTab === t.id }]"
              @click="activeResponseTab = t.id"
            >
              {{ t.label }}
            </button>
          </div>

          <!-- Response Body -->
          <div v-if="activeResponseTab === 'resBody'" class="tab-body">
            <div v-if="response && !resError">
              <div class="res-actions">
                <button class="brutal-action-btn small" @click="copyResponse">
                  📋 复制响应内容
                </button>
              </div>
              <pre class="code-block"><code>{{ formattedRes }}</code></pre>
            </div>
            <div v-else-if="resError" class="res-error-box">
              <div class="error-icon">⚠️</div>
              <p>{{ resError }}</p>
              <button class="brutal-action-btn" @click="corsDialogVisible = true">
                查看跨域 (CORS) 说明
              </button>
            </div>
            <div v-else class="empty-res">等待发送请求...</div>
          </div>

          <!-- Response Headers -->
          <div v-else-if="activeResponseTab === 'resHeaders'" class="tab-body">
            <div v-if="resHeadersData.length" class="res-headers-table">
              <div class="rh-row rh-header"><span>Key</span><span>Value</span></div>
              <div v-for="(row, i) in resHeadersData" :key="i" class="rh-row">
                <span class="rh-key">{{ row.key }}</span>
                <span class="rh-val">{{ row.value }}</span>
              </div>
            </div>
            <div v-else class="empty-res">暂无响应头信息</div>
          </div>
        </div>
      </div>
    </div>

    <!-- CORS Dialog -->
    <Transition name="modal">
      <div v-if="corsDialogVisible" class="modal-overlay" @click.self="corsDialogVisible = false">
        <div class="brutal-pane modal-box">
          <div class="pane-header bg-pink">
            <span>⚠️ 关于跨域 (CORS) 说明</span>
            <button class="close-btn" @click="corsDialogVisible = false">✕</button>
          </div>
          <div class="modal-body">
            <p>
              由于这是纯前端工具，受浏览器安全策略限制，发送请求时可能会触发<strong
                >跨域错误 (CORS Error)</strong
              >：
            </p>
            <ul>
              <li>
                如果目标服务器未配置
                <code>Access-Control-Allow-Origin</code> 头部，请求将被浏览器拦截。
              </li>
              <li>非 HTTPS 站点请求 HTTPS 接口可能会被拦截。</li>
              <li>建议测试支持 CORS 的公开接口，或用于调试本地允许跨域的服务。</li>
            </ul>
            <p><strong>解决方法：</strong></p>
            <p>
              ① 服务端设置允许跨域；<br />② 调试时使用浏览器插件（如 Allow CORS）临时禁用安全限制。
            </p>
          </div>
          <div class="modal-footer">
            <button class="brutal-action-btn primary" @click="corsDialogVisible = false">
              知道了
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { ElMessage } from 'element-plus';
  import { useCopy } from '@/composables';

  const url = ref('https://jsonplaceholder.typicode.com/posts/1');
  const method = ref('GET');
  const loading = ref(false);
  const activeRequestTab = ref('headers');
  const activeResponseTab = ref('resBody');
  const corsDialogVisible = ref(false);

  const configTabs = [
    { id: 'headers', label: 'Headers' },
    { id: 'body', label: 'Body' },
    { id: 'params', label: 'Params' }
  ];

  const responseTabs = [
    { id: 'resBody', label: 'Body' },
    { id: 'resHeaders', label: 'Headers' }
  ];

  const headers = ref([{ key: 'Content-Type', value: 'application/json' }]);
  const params = ref([{ key: '', value: '' }]);
  const bodyType = ref('json');
  const rawBody = ref('');
  const forms = ref([{ key: '', value: '' }]);

  const response = ref(null);
  const resError = ref('');
  const resHeadersData = ref([]);

  const { copyToClipboard } = useCopy();

  const addHeader = () => headers.value.push({ key: '', value: '' });
  const removeHeader = i => headers.value.splice(i, 1);
  const addParam = () => params.value.push({ key: '', value: '' });
  const removeParam = i => params.value.splice(i, 1);
  const addForm = () => forms.value.push({ key: '', value: '' });
  const removeForm = i => forms.value.splice(i, 1);

  const formattedRes = computed(() => {
    if (!response.value?.data) return '';
    if (typeof response.value.data === 'string') return response.value.data;
    try {
      return JSON.stringify(response.value.data, null, 4);
    } catch {
      return String(response.value.data);
    }
  });

  const getStatusClass = code => {
    if (code >= 200 && code < 300) return 'status-ok';
    if (code >= 400) return 'status-err';
    return 'status-warn';
  };

  const copyResponse = () => {
    if (formattedRes.value) {
      copyToClipboard(formattedRes.value, { success: '响应内容已复制' });
    }
  };

  const sendRequest = async () => {
    if (!url.value) return ElMessage.warning('请输入请求地址');
    loading.value = true;
    resError.value = '';
    response.value = null;
    resHeadersData.value = [];
    const startTime = Date.now();
    try {
      const urlObj = new URL(url.value);
      params.value.forEach(p => {
        if (p.key) urlObj.searchParams.append(p.key, p.value);
      });
      const headerObj = {};
      headers.value.forEach(h => {
        if (h.key) headerObj[h.key] = h.value;
      });
      let bodyContent = null;
      if (method.value !== 'GET') {
        if (bodyType.value === 'json' && rawBody.value) {
          bodyContent = rawBody.value;
        } else if (bodyType.value === 'form') {
          const formData = new FormData();
          forms.value.forEach(f => {
            if (f.key) formData.append(f.key, f.value);
          });
          bodyContent = formData;
        }
      }
      const res = await fetch(urlObj.toString(), {
        method: method.value,
        headers: headerObj,
        body: bodyContent
      });
      const endTime = Date.now();
      const data = await res.json().catch(() => res.text());
      const headersArr = [];
      res.headers.forEach((v, k) => headersArr.push({ key: k, value: v }));
      resHeadersData.value = headersArr;
      const sz = JSON.stringify(data).length;
      response.value = {
        status: res.status,
        statusText: res.statusText,
        time: endTime - startTime,
        size: sz > 1024 ? (sz / 1024).toFixed(2) + ' KB' : sz + ' B',
        data
      };
    } catch (err) {
      console.error(err);
      resError.value = err.message || '网络连接失败或跨域被拦截';
    } finally {
      loading.value = false;
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
    max-width: 1600px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
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

  .subtitle-badge {
    background: #111;
    color: #ffd900;
    padding: 0.5rem 1rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    box-shadow: 4px 4px 0px #ffd900;
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

  .brutal-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: 6px 6px 0px #111 !important;
  }

  .send-btn {
    background: #00e572;
    white-space: nowrap;
    min-width: 140px;
  }

  /* Request Bar */
  .request-bar-pane {
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    background: #fff;
  }

  .request-bar {
    display: flex;
    align-items: stretch;
    gap: 0;
  }

  .brutal-select {
    appearance: none;
    border: none;
    border-right: 4px solid #111;
    padding: 1rem 1.2rem;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    font-size: 1.1rem;
    cursor: pointer;
    outline: none;
    background: #fff;
    min-width: 100px;
    text-align: center;
  }

  .method-get {
    color: #00994c;
    background: #eaffed;
  }
  .method-post {
    color: #b86c00;
    background: #fff8e0;
  }
  .method-put {
    color: #2a4eb2;
    background: #e0eaff;
  }
  .method-delete {
    color: #cc3c3c;
    background: #ffeded;
  }
  .method-patch {
    color: #8b5e00;
    background: #fff3cc;
  }

  .brutal-url-input {
    flex: 1;
    border: none;
    outline: none;
    padding: 1rem 1.5rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1.1rem;
    font-weight: 600;
    background: transparent;
  }

  .request-bar .send-btn {
    border: none;
    border-left: 4px solid #111;
    box-shadow: none;
    border-radius: 0;
  }

  .request-bar .send-btn:hover {
    background: #00b85a;
    transform: none;
    box-shadow: none;
  }

  .request-bar .send-btn:active {
    transform: none;
  }

  /* Layout */
  .debugger-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    align-items: start;
  }

  .brutal-pane {
    display: flex;
    flex-direction: column;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
    background: #fff;
  }

  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    letter-spacing: 1px;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .bg-yellow {
    background: #ffd900;
  }
  .bg-blue {
    background: #4b7bff;
  }
  .bg-pink {
    background: #ff7be5;
  }
  .text-white {
    color: #fff;
  }

  /* Inner Tabs */
  .inner-tab-bar {
    display: flex;
    border-bottom: 4px solid #111;
    background: #fdfae5;
  }

  .inner-tab {
    flex: 1;
    padding: 0.75rem;
    border: none;
    border-right: 3px solid #111;
    background: transparent;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.95rem;
    cursor: pointer;
    text-transform: uppercase;
    color: #555;
    transition: all 0.1s;
  }

  .inner-tab:last-child {
    border-right: none;
  }

  .inner-tab:hover {
    background: #f0f0f0;
  }

  .inner-tab.active {
    background: #111;
    color: #ffd900;
  }

  .tab-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    min-height: 320px;
  }

  /* KV inputs */
  .kv-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .kv-row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .brutal-kv-input {
    flex: 1;
    border: 3px solid #111;
    padding: 0.5rem 0.75rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    font-size: 0.95rem;
    background: #fdfae5;
    color: #111;
    outline: none;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }

  .brutal-kv-input:focus {
    background: #fff;
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0px #111;
  }

  .brutal-del-btn {
    border: 3px solid #ff4b4b;
    background: #fff;
    color: #ff4b4b;
    font-weight: 900;
    font-size: 1rem;
    width: 32px;
    height: 32px;
    cursor: pointer;
    box-shadow: 2px 2px 0px #ff4b4b;
    transition: all 0.1s;
  }

  .brutal-del-btn:hover {
    background: #ff4b4b;
    color: #fff;
  }

  .brutal-action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.5rem 1.2rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.95rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
    align-self: flex-start;
  }

  .brutal-action-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 5px 5px 0px #111;
  }
  .brutal-action-btn:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }
  .brutal-action-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none !important;
  }
  .brutal-action-btn.small {
    padding: 0.3rem 0.75rem;
    font-size: 0.85rem;
    box-shadow: 2px 2px 0px #111;
  }
  .brutal-action-btn.primary {
    background: #00e572;
  }

  .mt-2 {
    margin-top: 0.5rem;
  }

  /* Body types */
  .body-type-group {
    display: flex;
    gap: 0;
    border: 3px solid #111;
    align-self: flex-start;
    box-shadow: 3px 3px 0px #111;
  }

  .body-type-btn {
    padding: 0.4rem 1rem;
    border: none;
    border-right: 3px solid #111;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    cursor: pointer;
    background: #fff;
    font-size: 0.9rem;
    text-transform: uppercase;
    transition: all 0.1s;
  }

  .body-type-btn:last-child {
    border-right: none;
  }
  .body-type-btn:hover {
    background: #f0f0f0;
  }
  .body-type-btn.active {
    background: #111;
    color: #ffd900;
  }
  .body-type-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .brutal-editor {
    border: 4px solid #111;
    font-family: 'IBM Plex Mono', monospace;
    background: #fdfae5;
    color: #111;
    box-shadow: 6px 6px 0px #111;
    outline: none;
    font-weight: 600;
    resize: vertical;
    padding: 1rem;
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .body-textarea {
    min-height: 220px;
  }

  .empty-body {
    background: #fdfae5;
    border: 3px solid #aaa;
    padding: 2rem;
    text-align: center;
    font-weight: 600;
    color: #777;
  }

  /* Response */
  .res-stats {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .status-tag {
    padding: 0.2rem 0.6rem;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    font-size: 1rem;
    border: 3px solid #111;
  }

  .status-ok {
    background: #00e572;
    color: #111;
  }
  .status-err {
    background: #ff4b4b;
    color: #fff;
  }
  .status-warn {
    background: #f59e0b;
    color: #111;
  }

  .stat-chip {
    background: rgba(255, 255, 255, 0.3);
    padding: 0.2rem 0.5rem;
    font-size: 0.85rem;
    font-weight: 700;
    border: 2px solid rgba(255, 255, 255, 0.6);
  }

  .res-actions {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 0.75rem;
  }

  .code-block {
    background: #111;
    border: 4px solid #111;
    padding: 1.5rem;
    color: #00e572;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.9rem;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 500px;
    overflow: auto;
    margin: 0;
    box-shadow: 6px 6px 0px #555;
  }

  .empty-res {
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: #777;
    background: #fdfae5;
    border: 3px dashed #aaa;
  }

  .res-error-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
    background: #ffeded;
    border: 4px solid #ff4b4b;
    box-shadow: 6px 6px 0px #ff4b4b;
    text-align: center;
    font-weight: 700;
  }

  .error-icon {
    font-size: 3rem;
  }

  /* Response Headers Table */
  .res-headers-table {
    border: 4px solid #111;
    overflow: hidden;
  }

  .rh-row {
    display: grid;
    grid-template-columns: 220px 1fr;
    border-bottom: 2px solid #ddd;
  }

  .rh-row:last-child {
    border-bottom: none;
  }

  .rh-header {
    background: #111;
    color: #ffd900;
    font-weight: 800;
  }

  .rh-header span,
  .rh-key,
  .rh-val {
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
    overflow-wrap: break-word;
  }

  .rh-key {
    font-weight: 700;
    background: #fdfae5;
    border-right: 2px solid #ddd;
  }

  /* CORS Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
    backdrop-filter: blur(4px);
  }

  .modal-box {
    width: 90%;
    max-width: 560px;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    font-weight: 900;
    cursor: pointer;
    color: #111;
  }

  .modal-body {
    padding: 2rem;
    background: #fff;
    line-height: 1.7;
  }

  .modal-body ul {
    padding-left: 1.5rem;
  }
  .modal-body code {
    background: #111;
    color: #ffd900;
    padding: 1px 5px;
    font-weight: bold;
  }

  .modal-footer {
    padding: 1rem 2rem;
    border-top: 4px solid #111;
    background: #fdfae5;
    display: flex;
    justify-content: flex-end;
  }

  .modal-enter-active,
  .modal-leave-active {
    transition: all 0.2s ease;
  }
  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
  }

  @media (max-width: 900px) {
    .debugger-grid {
      grid-template-columns: 1fr;
    }
    .brutal-title {
      font-size: 2.2rem;
    }
    .request-bar {
      flex-wrap: wrap;
    }
    .brutal-url-input {
      min-width: 200px;
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
  [data-theme='dark'] .brutal-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }
  [data-theme='dark'] .send-btn {
    background: #007a3d;
    color: #fff;
  }
  [data-theme='dark'] .send-btn:hover {
    background: #005a2e;
  }

  [data-theme='dark'] .brutal-pane {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .request-bar-pane {
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
    background: #1a1a1a;
  }

  [data-theme='dark'] .brutal-select {
    background: #1a1a1a;
    color: #eee;
    border-right-color: #eee;
  }
  [data-theme='dark'] .method-get {
    background: #0a2a14;
  }
  [data-theme='dark'] .method-post {
    background: #2a1a00;
  }
  [data-theme='dark'] .method-put {
    background: #0a1a2a;
  }
  [data-theme='dark'] .method-delete {
    background: #2a0a0a;
  }
  [data-theme='dark'] .method-patch {
    background: #2a1a00;
  }

  [data-theme='dark'] .brutal-url-input {
    color: #eee;
  }

  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
    color: #111;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .bg-pink {
    background: #cc62b6;
    color: #fff;
  }

  [data-theme='dark'] .inner-tab-bar {
    background: #111;
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .inner-tab {
    color: #aaa;
    border-right-color: #eee;
  }
  [data-theme='dark'] .inner-tab:hover {
    background: #222;
  }
  [data-theme='dark'] .inner-tab.active {
    background: #eee;
    color: #111;
  }

  [data-theme='dark'] .brutal-kv-input {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .brutal-kv-input:focus {
    background: #2a2a2a;
    box-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .brutal-action-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:hover {
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn.primary {
    background: #007a3d;
    color: #fff;
  }

  [data-theme='dark'] .body-type-group {
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .body-type-btn {
    background: #1a1a1a;
    color: #eee;
    border-right-color: #eee;
  }
  [data-theme='dark'] .body-type-btn:hover {
    background: #333;
  }
  [data-theme='dark'] .body-type-btn.active {
    background: #eee;
    color: #111;
  }

  [data-theme='dark'] .brutal-editor {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .empty-body {
    background: #222;
    color: #aaa;
  }
  [data-theme='dark'] .empty-res {
    background: #222;
    color: #aaa;
    border-color: #555;
  }

  [data-theme='dark'] .code-block {
    background: #0d0d0d;
    border-color: #eee;
    box-shadow: 6px 6px 0px #555;
  }
  [data-theme='dark'] .rh-key {
    background: #222;
    color: #eee;
  }
  [data-theme='dark'] .rh-row {
    border-color: #333;
  }
  [data-theme='dark'] .res-headers-table {
    border-color: #eee;
  }

  [data-theme='dark'] .subtitle-badge {
    background: #eee;
    color: #111;
    box-shadow: 4px 4px 0px #aaa;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .modal-body {
    background: #1a1a1a;
    color: #eee;
  }
  [data-theme='dark'] .modal-footer {
    background: #111;
    border-color: #eee;
  }
  [data-theme='dark'] .close-btn {
    color: #eee;
  }
</style>
