<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <!-- Header -->
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">Curl<span>.构建()</span></h1>
        <div class="badge">📡 API Request Builder</div>
      </header>

      <div class="brutal-layout">
        <!-- Main Configuration Area -->
        <main class="config-area">
          <!-- Method & URL Bar -->
          <div class="brutal-pane url-pane">
            <div class="pane-header bg-yellow">
              <span>📍 请求目标 (TARGET)</span>
            </div>
            <div class="url-bar">
              <select v-model="method" class="brutal-select method-select">
                <option v-for="m in methods" :key="m" :value="m">{{ m }}</option>
              </select>
              <input
                v-model="url"
                class="brutal-input url-input"
                placeholder="https://api.example.com/v1/resource"
              />
            </div>
          </div>

          <!-- Configuration Tabs -->
          <div class="brutal-pane tabs-pane">
            <div class="pane-header bg-green no-padding">
              <div class="tab-list">
                <button
                  v-for="tab in tabItems"
                  :key="tab.id"
                  :class="['tab-btn', { active: activeTab === tab.id }]"
                  @click="activeTab = tab.id"
                >
                  {{ tab.label }}
                </button>
              </div>
            </div>

            <div class="pane-body">
              <!-- Headers Tab -->
              <div v-if="activeTab === 'headers'" class="kv-container">
                <div v-for="(item, index) in headers" :key="index" class="kv-row">
                  <input
                    v-model="item.key"
                    class="brutal-input sm-input"
                    placeholder="Key (e.g. Content-Type)"
                  />
                  <input v-model="item.value" class="brutal-input sm-input" placeholder="Value" />
                  <button class="brutal-btn icon-btn del-btn" @click="removeHeader(index)">
                    ✕
                  </button>
                </div>
                <button class="brutal-btn add-btn" @click="addHeader">+ 添加头部字段</button>
              </div>

              <!-- Body Tab -->
              <div v-if="activeTab === 'body'" class="body-settings">
                <div class="type-selector">
                  <button
                    v-for="t in bodyTypes"
                    :key="t.id"
                    :class="['type-tab', { active: bodyType === t.id }]"
                    @click="bodyType = t.id"
                  >
                    {{ t.label }}
                  </button>
                </div>

                <div v-if="bodyType === 'json' || bodyType === 'raw'" class="editor-wrap">
                  <textarea
                    v-model="bodyRaw"
                    class="brutal-textarea"
                    :placeholder="bodyPlaceholder"
                  ></textarea>
                </div>

                <div
                  v-else-if="bodyType === 'form' || bodyType === 'urlencoded'"
                  class="kv-container"
                >
                  <div v-for="(item, index) in bodyParams" :key="index" class="kv-row">
                    <input v-model="item.key" class="brutal-input sm-input" placeholder="Field" />
                    <input v-model="item.value" class="brutal-input sm-input" placeholder="Value" />
                    <button class="brutal-btn icon-btn del-btn" @click="removeBodyParam(index)">
                      ✕
                    </button>
                  </div>
                  <button class="brutal-btn add-btn" @click="addBodyParam">+ 添加表单字段</button>
                </div>

                <div v-else class="empty-state">
                  <span class="icon">🚫</span>
                  <p>无请求体配置</p>
                </div>
              </div>

              <!-- Auth Tab -->
              <div v-if="activeTab === 'auth'" class="auth-settings">
                <div class="config-group">
                  <label class="config-label">认证方式 (Authentication)</label>
                  <select v-model="authType" class="brutal-select">
                    <option value="none">None (无)</option>
                    <option value="basic">Basic Auth (用户名/密码)</option>
                    <option value="bearer">Bearer Token (令牌)</option>
                  </select>
                </div>

                <div v-if="authType === 'basic'" class="auth-grid">
                  <div class="config-group">
                    <label class="config-label">用户名</label>
                    <input
                      v-model="authBasic.username"
                      class="brutal-input"
                      placeholder="Username"
                    />
                  </div>
                  <div class="config-group">
                    <label class="config-label">密码</label>
                    <input
                      v-model="authBasic.password"
                      type="password"
                      class="brutal-input"
                      placeholder="Password"
                    />
                  </div>
                </div>

                <div v-if="authType === 'bearer'" class="config-group">
                  <label class="config-label">Bearer Token</label>
                  <input
                    v-model="authBearer"
                    class="brutal-input"
                    placeholder="Paste your token here..."
                  />
                </div>
              </div>

              <!-- Options Tab -->
              <div v-if="activeTab === 'options'" class="advanced-settings">
                <div class="options-grid">
                  <button
                    v-for="(val, key) in flags"
                    :key="key"
                    :class="['check-btn', { active: flags[key] }]"
                    @click="flags[key] = !flags[key]"
                  >
                    <span class="check-mark"></span> {{ flagLabels[key] }}
                  </button>
                </div>
                <div class="pane-divider"></div>
                <div class="auth-grid">
                  <div class="config-group">
                    <label class="config-label">User-Agent</label>
                    <input v-model="userAgent" class="brutal-input" placeholder="curl/7.88.1" />
                  </div>
                  <div class="config-group">
                    <label class="config-label">超时时间 (秒)</label>
                    <input v-model.number="timeout" type="number" class="brutal-input" min="0" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <!-- Sidebar: Command Output -->
        <aside class="result-sidebar">
          <div class="brutal-pane result-pane">
            <div class="pane-header bg-blue">
              <span>💎 生成指令 (COMMAND)</span>
              <button class="action-btn copy-btn" @click="copyCommand">📋 复制</button>
            </div>
            <div class="command-view">
              <pre><code>{{ generatedCommand }}</code></pre>
            </div>
          </div>

          <div class="brutal-pane info-pane">
            <div class="pane-header bg-pink">
              <span>💡 使用提示</span>
            </div>
            <div class="pane-body">
              <ul class="brutal-list">
                <li>生成的命令可直接在终端中粘贴执行。</li>
                <li>如果包含特殊符号，URL 建议使用双引号包裹。</li>
                <li>-k 选项用于忽略无效或自签名的 SSL 证书。</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useCopy } from '@/composables/useCopy';

  const { copyToClipboard } = useCopy();

  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
  const method = ref('GET');
  const url = ref('');
  const activeTab = ref('headers');

  const tabItems = [
    { id: 'headers', label: '请求头' },
    { id: 'body', label: '主体' },
    { id: 'auth', label: '认证' },
    { id: 'options', label: '高级' }
  ];

  const headers = ref([{ key: 'Accept', value: '*/*' }]);
  const addHeader = () => headers.value.push({ key: '', value: '' });
  const removeHeader = (i: number) => headers.value.splice(i, 1);

  const bodyType = ref('none');
  const bodyTypes = [
    { id: 'none', label: 'None' },
    { id: 'json', label: 'JSON' },
    { id: 'form', label: 'Form' },
    { id: 'urlencoded', label: 'Encoded' },
    { id: 'raw', label: 'Raw' }
  ];

  const bodyRaw = ref('');
  const bodyParams = ref([{ key: '', value: '' }]);
  const addBodyParam = () => bodyParams.value.push({ key: '', value: '' });
  const removeBodyParam = (i: number) => bodyParams.value.splice(i, 1);

  const authType = ref('none');
  const authBasic = ref({ username: '', password: '' });
  const authBearer = ref('');

  const flags = ref<Record<string, boolean>>({
    insecure: false,
    location: false,
    verbose: false,
    silent: false,
    include: false,
    compressed: false
  });

  const flagLabels: Record<string, string> = {
    insecure: '忽略 SSL (-k)',
    location: '跟随重定向 (-L)',
    verbose: '详细信息 (-v)',
    silent: '静默模式 (-s)',
    include: '显示响应头 (-i)',
    compressed: '支持压缩'
  };

  const userAgent = ref('');
  const timeout = ref(0);

  const bodyPlaceholder = computed(() => {
    if (bodyType.value === 'json') return '{ \n  "id": 123, \n  "name": "test" \n}';
    return 'Enter raw body content...';
  });

  const generatedCommand = computed(() => {
    let cmd = ['curl'];

    // Method
    if (method.value !== 'GET') {
      cmd.push('-X', method.value);
    }

    // Flags
    if (flags.value.insecure) cmd.push('-k');
    if (flags.value.location) cmd.push('-L');
    if (flags.value.verbose) cmd.push('-v');
    if (flags.value.silent) cmd.push('-s');
    if (flags.value.include) cmd.push('-i');
    if (flags.value.compressed) cmd.push('--compressed');

    // Timeout
    if (timeout.value > 0) {
      cmd.push('--connect-timeout', timeout.value.toString());
    }

    // User-Agent
    if (userAgent.value) {
      cmd.push('-A', `"${userAgent.value}"`);
    }

    // Auth
    if (authType.value === 'basic' && authBasic.value.username) {
      cmd.push('-u', `"${authBasic.value.username}:${authBasic.value.password}"`);
    } else if (authType.value === 'bearer' && authBearer.value) {
      cmd.push('-H', `"Authorization: Bearer ${authBearer.value}"`);
    }

    // Headers
    headers.value.forEach(h => {
      if (h.key) {
        cmd.push('-H', `"${h.key}: ${h.value}"`);
      }
    });

    // Body
    if (method.value !== 'GET' && method.value !== 'HEAD') {
      if (bodyType.value === 'json') {
        if (!headers.value.some(h => h.key.toLowerCase() === 'content-type')) {
          cmd.push('-H', '"Content-Type: application/json"');
        }
        if (bodyRaw.value) {
          const escapedBody = bodyRaw.value.replace(/'/g, "'\\''");
          cmd.push('-d', `'${escapedBody}'`);
        }
      } else if (bodyType.value === 'form') {
        bodyParams.value.forEach(p => {
          if (p.key) cmd.push('-F', `"${p.key}=${p.value}"`);
        });
      } else if (bodyType.value === 'urlencoded') {
        bodyParams.value.forEach(p => {
          if (p.key) cmd.push('--data-urlencode', `"${p.key}=${p.value}"`);
        });
      } else if (bodyType.value === 'raw' && bodyRaw.value) {
        const escapedBody = bodyRaw.value.replace(/'/g, "'\\''");
        cmd.push('-d', `'${escapedBody}'`);
      }
    }

    // URL
    const finalUrl = url.value || 'https://api.example.com';
    cmd.push(`"${finalUrl}"`);

    return cmd.join(' ');
  });

  const copyCommand = () => {
    copyToClipboard(generatedCommand.value, { success: '✔ Curl 命令已复制' });
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

  /* Grid Layout */
  .brutal-layout {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 2rem;
    align-items: start;
  }

  .brutal-pane {
    border: 4px solid #111;
    background: #fff;
    box-shadow: 10px 10px 0px #111;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .pane-header {
    padding: 0.8rem 1.25rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1.1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .pane-header.no-padding {
    padding: 0;
  }

  .bg-yellow {
    background: #ffd900;
  }
  .bg-green {
    background: #00e572;
  }
  .bg-blue {
    background: #3b82f6;
    color: #fff;
  }
  .bg-pink {
    background: #ff7be5;
  }

  .pane-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* Forms */
  .url-bar {
    display: flex;
    gap: 0;
    padding: 1rem;
    background: #111;
  }
  .method-select {
    width: 140px;
    border-right: none;
  }
  .url-input {
    flex: 1;
    border-radius: 0;
  }

  .brutal-input,
  .brutal-select,
  .brutal-textarea {
    width: 100%;
    border: 4px solid #111;
    padding: 0.75rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1rem;
    font-weight: 700;
    background: #fff;
    box-shadow: 4px 4px 0px #111;
    outline: none;
    box-sizing: border-box;
  }
  .brutal-textarea {
    min-height: 200px;
    resize: vertical;
  }
  .brutal-input:focus,
  .brutal-textarea:focus {
    background: #fdfae5;
  }

  /* Tabs */
  .tab-list {
    display: flex;
    width: 100%;
    background: #111;
  }
  .tab-btn {
    flex: 1;
    border: none;
    background: transparent;
    color: #fff;
    padding: 1rem;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.1s;
    border-right: 4px solid #111;
  }
  .tab-btn:last-child {
    border-right: none;
  }
  .tab-btn:hover {
    background: #333;
  }
  .tab-btn.active {
    background: #fff;
    color: #111;
  }

  /* KV Rows */
  .kv-container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .kv-row {
    display: flex;
    gap: 0.5rem;
  }
  .sm-input {
    flex: 1;
  }
  .icon-btn {
    padding: 0.5rem;
    width: 44px;
    flex-shrink: 0;
    box-shadow: 3px 3px 0px #111;
  }
  .del-btn:hover {
    background: #ff4b4b;
    color: #fff;
  }
  .add-btn {
    background: #eee;
    border-style: dashed;
    box-shadow: 2px 2px 0px #111;
    padding: 0.5rem;
    font-size: 0.9rem;
  }

  /* Type Selector (Body) */
  .type-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  .type-tab {
    padding: 0.5rem 1rem;
    border: 3px solid #111;
    background: #fff;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    cursor: pointer;
  }
  .type-tab.active {
    background: #111;
    color: #fff;
  }

  /* Auth Settings */
  .auth-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  .config-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .config-label {
    font-size: 0.85rem;
    font-weight: 900;
    color: #666;
    text-transform: uppercase;
  }

  /* Options Grid */
  .options-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }
  .check-btn {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: #fff;
    border: 3px solid #111;
    padding: 0.6rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 0.85rem;
    cursor: pointer;
    text-align: left;
  }
  .check-mark {
    width: 14px;
    height: 14px;
    border: 3px solid #111;
    background: #fff;
  }
  .check-btn.active .check-mark {
    background: #3b82f6;
  }
  .check-btn.active {
    background: #f0f7ff;
  }
  .pane-divider {
    height: 4px;
    background: #111;
  }

  /* Result Area */
  .result-sidebar {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  .action-btn {
    border: 3px solid #111;
    background: #ffd900;
    padding: 0.3rem 0.8rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 0.85rem;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
  }

  .command-view {
    padding: 1.5rem;
    background: #111;
    min-height: 120px;
  }
  pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1rem;
    color: #38bdf8;
    line-height: 1.6;
  }

  .brutal-list {
    margin: 0;
    padding-left: 1.25rem;
    font-weight: 700;
    font-size: 0.9rem;
    line-height: 1.6;
  }

  @media (max-width: 1100px) {
    .brutal-layout {
      grid-template-columns: 1fr;
    }
    .auth-grid {
      grid-template-columns: 1fr;
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
    background: #065f46;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #1e3a8a;
  }
  [data-theme='dark'] .bg-pink {
    background: #9b2d87;
  }

  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .brutal-select,
  [data-theme='dark'] .brutal-textarea {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .tab-list {
    background: #eee;
  }
  [data-theme='dark'] .tab-btn {
    color: #111;
    border-right-color: #eee;
  }
  [data-theme='dark'] .tab-btn.active {
    background: #222;
    color: #eee;
  }
  [data-theme='dark'] .tab-btn:hover {
    background: #ddd;
  }

  [data-theme='dark'] .type-tab {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .type-tab.active {
    background: #eee;
    color: #222;
  }

  [data-theme='dark'] .check-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .check-mark {
    border-color: #eee;
    background: #222;
  }
  [data-theme='dark'] .check-btn.active {
    background: #333;
  }
  [data-theme='dark'] .pane-divider {
    background: #eee;
  }

  [data-theme='dark'] .action-btn {
    background: #b28f00;
    border-color: #eee;
    color: #fff;
    box-shadow: 2px 2px 0px #eee;
  }
</style>
