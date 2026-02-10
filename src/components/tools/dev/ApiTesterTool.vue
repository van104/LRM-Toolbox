<template>
  <div class="api-tester-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>API 接口调试器</h1>
        <span class="nav-subtitle">Mini Postman</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <section class="request-bar">
        <div class="url-container">
          <el-select v-model="method" class="method-selector">
            <el-option label="GET" value="GET" class="method-get" />
            <el-option label="POST" value="POST" class="method-post" />
            <el-option label="PUT" value="PUT" class="method-put" />
            <el-option label="DELETE" value="DELETE" class="method-delete" />
            <el-option label="PATCH" value="PATCH" class="method-patch" />
          </el-select>
          <div class="url-divider"></div>
          <el-input v-model="url" placeholder="https://..." class="url-main-input" />
        </div>
        <el-button type="primary" :loading="loading" class="send-btn" @click="sendRequest">
          <span>发送请求</span>
        </el-button>
      </section>

      <div class="debugger-layout">
        <section class="config-panel glass-card">
          <el-tabs v-model="activeRequestTab">
            <el-tab-pane label="请求头 (Headers)" name="headers">
              <div class="kv-list">
                <div v-for="(item, index) in headers" :key="index" class="kv-row">
                  <el-input v-model="item.key" placeholder="Key" />
                  <el-input v-model="item.value" placeholder="Value" />
                  <el-button
                    v-if="headers.length > 1"
                    :icon="Delete"
                    circle
                    @click="removeHeader(index)"
                  />
                </div>
                <el-button type="primary" link :icon="Plus" @click="addHeader">添加参数</el-button>
              </div>
            </el-tab-pane>
            <el-tab-pane label="请求体 (Body)" name="body" :disabled="method === 'GET'">
              <div class="body-config">
                <el-radio-group v-model="bodyType" size="small" class="mb-4">
                  <el-radio-button label="none">none</el-radio-button>
                  <el-radio-button label="json">JSON</el-radio-button>
                  <el-radio-button label="form">Form Data</el-radio-button>
                </el-radio-group>

                <el-input
                  v-if="bodyType === 'json'"
                  v-model="rawBody"
                  type="textarea"
                  :rows="10"
                  placeholder='请输入 JSON 格式内容, 例如: { "name": "lrm" }'
                />

                <div v-if="bodyType === 'form'" class="kv-list">
                  <div v-for="(item, index) in forms" :key="index" class="kv-row">
                    <el-input v-model="item.key" placeholder="Key" />
                    <el-input v-model="item.value" placeholder="Value" />
                    <el-button
                      v-if="forms.length > 1"
                      :icon="Delete"
                      circle
                      @click="removeForm(index)"
                    />
                  </div>
                  <el-button type="primary" link :icon="Plus" @click="addForm">添加字段</el-button>
                </div>

                <div v-if="bodyType === 'none'" class="empty-body">该请求不含 Body 内容</div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="查询参数 (Params)" name="params">
              <div class="kv-list">
                <div v-for="(item, index) in params" :key="index" class="kv-row">
                  <el-input v-model="item.key" placeholder="Key" />
                  <el-input v-model="item.value" placeholder="Value" />
                  <el-button
                    v-if="params.length > 1"
                    :icon="Delete"
                    circle
                    @click="removeParam(index)"
                  />
                </div>
                <el-button type="primary" link :icon="Plus" @click="addParam">添加参数</el-button>
              </div>
            </el-tab-pane>
          </el-tabs>
        </section>

        <section class="response-panel glass-card">
          <div v-if="response" class="response-header">
            <div class="status-wrap">
              状态码:
              <span :class="getStatusClass(response.status)"
                >{{ response.status }} {{ response.statusText }}</span
              >
            </div>
            <div class="time-wrap">
              耗时: <b>{{ response.time }} ms</b>
            </div>
            <div class="size-wrap">
              大小: <b>{{ response.size }}</b>
            </div>
          </div>

          <el-tabs v-model="activeResponseTab">
            <el-tab-pane label="响应体 (Body)" name="resBody">
              <div class="res-body-container">
                <pre
                  v-if="response && !resError"
                  class="json-preview"
                ><code>{{ formattedRes }}</code></pre>
                <div v-else-if="resError" class="res-error">
                  <el-icon>
                    <Warning />
                  </el-icon>
                  <p>请求失败: {{ resError }}</p>
                  <el-button type="danger" link @click="openCorsTip">查看跨域(CORS)说明</el-button>
                </div>
                <div v-else class="empty-res">等待发送请求...</div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="响应头 (Headers)" name="resHeaders">
              <el-table
                v-if="resHeadersData.length"
                :data="resHeadersData"
                size="small"
                border
                stripe
              >
                <el-table-column prop="key" label="Key" width="180" />
                <el-table-column prop="value" label="Value" />
              </el-table>
              <div v-else class="empty-res">暂无响应头信息</div>
            </el-tab-pane>
          </el-tabs>
        </section>
      </div>
    </main>

    <el-dialog v-model="corsDialogVisible" title="关于跨域(CORS)请求的说明" width="500px">
      <div class="cors-tip-content">
        <p>
          由于这是一个纯前端工具，受浏览器安全策略限制，发送请求时可能会触发<b
            >跨域错误 (CORS Error)</b
          >：
        </p>
        <ul>
          <li>
            如果目标服务器未配置 <code>Access-Control-Allow-Origin</code> 头部，请求将被浏览器拦截。
          </li>
          <li>非 HTTPS 站点请求 HTTPS 接口可能会被拦截。</li>
          <li>建议测试支持 CORS 的公开接口，或用于调试本地允许跨域的服务。</li>
        </ul>
        <p class="mt-4"><b>解决方法：</b></p>
        <p>
          1. 服务端设置允许跨域；<br />2. 调试时使用浏览器插件（如 Allow CORS）临时禁用安全限制。
        </p>
      </div>
    </el-dialog>

    <footer class="footer">© 2026 LRM工具箱 - API 接口调试器</footer>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { Back, Plus, Delete, Warning } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';

  const url = ref('https://jsonplaceholder.typicode.com/posts/1');
  const method = ref('GET');
  const loading = ref(false);
  const activeRequestTab = ref('headers');
  const activeResponseTab = ref('resBody');

  const headers = ref([{ key: 'Content-Type', value: 'application/json' }]);
  const params = ref([{ key: '', value: '' }]);
  const bodyType = ref('json');
  const rawBody = ref('');
  const forms = ref([{ key: '', value: '' }]);

  const response = ref(null);
  const resError = ref('');
  const resHeadersData = ref([]);
  const corsDialogVisible = ref(false);

  const addHeader = () => headers.value.push({ key: '', value: '' });
  const removeHeader = i => headers.value.splice(i, 1);
  const addParam = () => params.value.push({ key: '', value: '' });
  const removeParam = i => params.value.splice(i, 1);
  const addForm = () => forms.value.push({ key: '', value: '' });
  const removeForm = i => forms.value.splice(i, 1);

  const openCorsTip = () => (corsDialogVisible.value = true);

  const formattedRes = computed(() => {
    if (!response.value || !response.value.data) return '';
    if (typeof response.value.data === 'string') return response.value.data;
    try {
      return JSON.stringify(response.value.data, null, 4);
    } catch {
      return response.value.data;
    }
  });

  const getStatusClass = code => {
    if (code >= 200 && code < 300) return 'text-success';
    if (code >= 400) return 'text-danger';
    return 'text-warning';
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
      res.headers.forEach((v, k) => {
        headersArr.push({ key: k, value: v });
      });
      resHeadersData.value = headersArr;

      response.value = {
        status: res.status,
        statusText: res.statusText,
        time: endTime - startTime,
        size:
          JSON.stringify(data).length > 1024
            ? (JSON.stringify(data).length / 1024).toFixed(2) + ' KB'
            : JSON.stringify(data).length + ' B',
        data: data
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
  .api-tester-tool {
    --bg: #f8fafc;
    --card: #ffffff;
    --border: #e2e8f0;
    --primary: #6366f1;
    --success: #10b981;
    --danger: #ef4444;
    --warning: #f59e0b;

    min-height: 100vh;
    background: var(--bg);
    font-family:
      'Inter',
      system-ui,
      -apple-system,
      sans-serif;
  }

  .nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 2rem;
    background: var(--card);
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .nav-center {
    text-align: center;
  }

  .nav-center h1 {
    font-size: 1.25rem;
    margin: 0;
    font-weight: 700;
  }

  .nav-subtitle {
    font-size: 0.75rem;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .main-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1.5rem;
  }

  .glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
  }

  .request-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 2rem;
    align-items: center;
  }

  .url-container {
    flex: 1;
    display: flex;
    align-items: center;
    background: #fff;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    height: 40px;
    padding: 0 4px;
    transition: border-color 0.2s;
  }

  .url-container:focus-within {
    border-color: var(--primary);
  }

  .method-selector {
    width: 100px;
  }

  .method-selector :deep(.el-input__wrapper) {
    box-shadow: none !important;
    background: transparent !important;
  }

  .method-selector :deep(.el-input__inner) {
    font-weight: 600;
  }

  .url-divider {
    width: 1px;
    height: 20px;
    background: #e4e7ed;
    margin: 0 4px;
  }

  .url-main-input {
    flex: 1;
  }

  .url-main-input :deep(.el-input__wrapper) {
    box-shadow: none !important;
    background: transparent !important;
  }

  .send-btn {
    height: 40px !important;
    padding: 0 24px !important;
    border-radius: 4px !important;
    font-weight: 600;
    font-size: 1rem;
  }

  .method-get :deep(.el-input__inner) {
    color: #67c23a;
  }

  .method-post :deep(.el-input__inner),
  .method-post {
    color: #b88230;
  }

  .method-put :deep(.el-input__inner) {
    color: #409eff;
  }

  .method-delete :deep(.el-input__inner) {
    color: #f56c6c;
  }

  .method-patch :deep(.el-input__inner) {
    color: #e6a23c;
  }

  .method-get {
    color: var(--success);
    font-weight: bold;
  }

  .method-post {
    color: var(--warning);
    font-weight: bold;
  }

  .method-put {
    color: var(--primary);
    font-weight: bold;
  }

  .method-delete {
    color: var(--danger);
    font-weight: bold;
  }

  .debugger-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .config-panel {
    min-height: 400px;
  }

  .kv-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 10px;
  }

  .kv-row {
    display: flex;
    gap: 10px;
  }

  .body-config {
    padding: 10px 0;
  }

  .mb-4 {
    margin-bottom: 1rem;
  }

  .empty-body {
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    background: #f1f5f9;
    border-radius: 8px;
    font-size: 0.9rem;
  }

  .response-header {
    display: flex;
    gap: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 15px;
    font-size: 0.9rem;
  }

  .text-success {
    color: var(--success);
    font-weight: 700;
  }

  .text-danger {
    color: var(--danger);
    font-weight: 700;
  }

  .text-warning {
    color: var(--warning);
    font-weight: 700;
  }

  .res-body-container {
    background: #1e293b;
    border-radius: 8px;
    padding: 1rem;
    min-height: 300px;
    max-height: 600px;
    overflow: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .json-preview {
    margin: 0;
    color: #e2e8f0;
    font-family: 'Fira Code', 'Courier New', monospace;
    font-size: 0.85rem;
    white-space: pre-wrap;
    word-break: break-all;
    text-align: left;
  }

  .empty-res {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    font-size: 0.9rem;
    text-align: center;
    width: 100%;
  }

  .res-error {
    text-align: center;
    padding: 2rem;
    color: #fca5a5;
  }

  .res-error .el-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .cors-tip-content {
    line-height: 1.6;
  }

  .cors-tip-content ul {
    padding-left: 20px;
    margin: 10px 0;
    color: #64748b;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #94a3b8;
    font-size: 0.85rem;
  }

  @media (max-width: 900px) {
    .debugger-layout {
      grid-template-columns: 1fr;
    }
  }
</style>
