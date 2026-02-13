<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">Curl 命令构建器</h1>
        <span class="tool-subtitle">Visual Curl Command Builder</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="copyCommand">
          <el-icon><CopyDocument /></el-icon>
          复制命令
        </el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="tool-layout">
        <section class="config-section">
          <!-- 基础设置 -->
          <div class="panel glass-card mb-6">
            <h2 class="panel-title">基础配置</h2>
            <div class="request-bar">
              <el-select v-model="method" class="method-selector" size="large">
                <el-option v-for="m in methods" :key="m" :label="m" :value="m" />
              </el-select>
              <el-input
                v-model="url"
                placeholder="https://api.example.com/v1/resource"
                class="url-input"
                size="large"
              />
            </div>
          </div>

          <!-- 详细配置 -->
          <div class="panel glass-card">
            <el-tabs v-model="activeTab">
              <!-- Headers -->
              <el-tab-pane label="请求头 (Headers)" name="headers">
                <div class="kv-container">
                  <div v-for="(item, index) in headers" :key="index" class="kv-row">
                    <el-input v-model="item.key" placeholder="Key (e.g. Authorization)" />
                    <el-input v-model="item.value" placeholder="Value" />
                    <el-button :icon="Delete" circle @click="removeHeader(index)" />
                  </div>
                  <el-button type="primary" link :icon="Plus" @click="addHeader"
                    >添加头部</el-button
                  >
                </div>
              </el-tab-pane>

              <!-- Body -->
              <el-tab-pane label="请求体 (Body)" name="body">
                <div class="body-container">
                  <el-radio-group v-model="bodyType" class="mb-4">
                    <el-radio-button label="none">None</el-radio-button>
                    <el-radio-button label="json">JSON</el-radio-button>
                    <el-radio-button label="form">Form Data</el-radio-button>
                    <el-radio-button label="urlencoded">x-www-form-urlencoded</el-radio-button>
                    <el-radio-button label="raw">Raw</el-radio-button>
                  </el-radio-group>

                  <div v-if="bodyType === 'json' || bodyType === 'raw'" class="raw-body">
                    <el-input
                      v-model="bodyRaw"
                      type="textarea"
                      :rows="8"
                      :placeholder="
                        bodyType === 'json' ? '{ \'key\': \'value\' }' : 'Enter raw body content...'
                      "
                    />
                  </div>

                  <div
                    v-else-if="bodyType === 'form' || bodyType === 'urlencoded'"
                    class="kv-container"
                  >
                    <div v-for="(item, index) in bodyParams" :key="index" class="kv-row">
                      <el-input v-model="item.key" placeholder="Key" />
                      <el-input v-model="item.value" placeholder="Value" />
                      <el-button :icon="Delete" circle @click="removeBodyParam(index)" />
                    </div>
                    <el-button type="primary" link :icon="Plus" @click="addBodyParam"
                      >添加字段</el-button
                    >
                  </div>

                  <div v-else class="empty-placeholder">该方法通常不需要请求体</div>
                </div>
              </el-tab-pane>

              <!-- Auth -->
              <el-tab-pane label="认证 (Auth)" name="auth">
                <el-form label-position="top">
                  <el-form-item label="认证类型">
                    <el-select v-model="authType" placeholder="Select auth type">
                      <el-option label="None" value="none" />
                      <el-option label="Basic Auth" value="basic" />
                      <el-option label="Bearer Token" value="bearer" />
                    </el-select>
                  </el-form-item>

                  <div v-if="authType === 'basic'" class="auth-inputs">
                    <el-form-item label="用户名">
                      <el-input v-model="authBasic.username" />
                    </el-form-item>
                    <el-form-item label="密码">
                      <el-input v-model="authBasic.password" type="password" show-password />
                    </el-form-item>
                  </div>

                  <div v-if="authType === 'bearer'" class="auth-inputs">
                    <el-form-item label="Token">
                      <el-input v-model="authBearer" placeholder="Paste your token here..." />
                    </el-form-item>
                  </div>
                </el-form>
              </el-tab-pane>

              <!-- Options -->
              <el-tab-pane label="高级选项 (Options)" name="options">
                <div class="options-grid">
                  <el-checkbox v-model="flags.insecure">忽略 SSL 校验 (-k)</el-checkbox>
                  <el-checkbox v-model="flags.location">跟随重定向 (-L)</el-checkbox>
                  <el-checkbox v-model="flags.verbose">输出调试信息 (-v)</el-checkbox>
                  <el-checkbox v-model="flags.silent">静默模式 (-s)</el-checkbox>
                  <el-checkbox v-model="flags.include">包含响应头部 (-i)</el-checkbox>
                  <el-checkbox v-model="flags.compressed">压缩内容 (--compressed)</el-checkbox>
                </div>
                <div class="advanced-inputs mt-4">
                  <el-form label-position="top">
                    <el-form-item label="自定义 User-Agent">
                      <el-input v-model="userAgent" placeholder="curl/7.64.1" />
                    </el-form-item>
                    <el-form-item label="超时时间 (秒)">
                      <el-input-number v-model="timeout" :min="0" />
                    </el-form-item>
                  </el-form>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </section>

        <!-- 结果预览 -->
        <aside class="result-section">
          <div class="panel glass-card result-card">
            <div class="result-header">
              <h2 class="panel-title mb-0">生成的命令</h2>
              <el-button type="primary" size="small" @click="copyCommand">复制</el-button>
            </div>
            <div class="command-preview">
              <pre><code>{{ generatedCommand }}</code></pre>
            </div>

            <div class="command-tips-card mt-6">
              <h3 class="tip-title">
                <el-icon><InfoFilled /></el-icon> 提示
              </h3>
              <ul class="tip-list">
                <li>Curl 是一个强大的命令行工具，用于传输数据。</li>
                <li>
                  生成的命令可以直接在终端（Windows CMD/PowerShell, Mac/Linux Terminal）中使用。
                </li>
                <li>如果包含特殊字符，建议在单引号内使用 URL。</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - Curl 命令构建器</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { ArrowLeft, Plus, Delete, CopyDocument, InfoFilled } from '@element-plus/icons-vue';
  import { useCopy } from '@/composables/useCopy';

  const { copyToClipboard } = useCopy();

  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
  const method = ref('GET');
  const url = ref('');
  const activeTab = ref('headers');

  const headers = ref([{ key: 'Accept', value: '*/*' }]);
  const addHeader = () => headers.value.push({ key: '', value: '' });
  const removeHeader = (i: number) => headers.value.splice(i, 1);

  const bodyType = ref('none');
  const bodyRaw = ref('');
  const bodyParams = ref([{ key: '', value: '' }]);
  const addBodyParam = () => bodyParams.value.push({ key: '', value: '' });
  const removeBodyParam = (i: number) => bodyParams.value.splice(i, 1);

  const authType = ref('none');
  const authBasic = ref({ username: '', password: '' });
  const authBearer = ref('');

  const flags = ref({
    insecure: false,
    location: false,
    verbose: false,
    silent: false,
    include: false,
    compressed: false
  });
  const userAgent = ref('');
  const timeout = ref(0);

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
    if (method.value !== 'GET') {
      if (bodyType.value === 'json') {
        if (!headers.value.some(h => h.key.toLowerCase() === 'content-type')) {
          cmd.push('-H', '"Content-Type: application/json"');
        }
        if (bodyRaw.value) {
          // Escape single quotes for shell
          const escapedBody = bodyRaw.value.replace(/'/g, "'\\''");
          cmd.push('-d', `'${escapedBody}'`);
        }
      } else if (bodyType.value === 'form') {
        bodyParams.value.forEach(p => {
          if (p.key) {
            cmd.push('-F', `"${p.key}=${p.value}"`);
          }
        });
      } else if (bodyType.value === 'urlencoded') {
        bodyParams.value.forEach(p => {
          if (p.key) {
            cmd.push('--data-urlencode', `"${p.key}=${p.value}"`);
          }
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
    copyToClipboard(generatedCommand.value, { success: 'Curl 命令已复制' });
  };
</script>

<style scoped>
  .tool-page {
    min-height: 100vh;
    background: #f8fafc;
    display: flex;
    flex-direction: column;
  }

  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #fff;
    border-bottom: 1px solid #e2e8f0;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-left,
  .header-right {
    width: 140px;
  }
  .header-right {
    display: flex;
    justify-content: flex-end;
  }
  .header-center {
    text-align: center;
    flex: 1;
  }

  .tool-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }
  .tool-subtitle {
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
  }

  .tool-content {
    flex: 1;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .tool-layout {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 1.5rem;
    align-items: start;
  }

  @media (max-width: 1024px) {
    .tool-layout {
      grid-template-columns: 1fr;
    }
  }

  .glass-card {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  .panel-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 20px;
  }

  .request-bar {
    display: flex;
    gap: 12px;
    width: 100%;
  }

  .method-selector {
    width: 130px;
  }

  .url-input {
    flex: 1;
  }

  .kv-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 10px 0;
  }

  .kv-row {
    display: flex;
    gap: 10px;
  }

  .body-container {
    padding: 1rem 0;
  }

  .empty-placeholder {
    padding: 2rem;
    text-align: center;
    color: #94a3b8;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px dashed #cbd5e1;
  }

  .options-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
    padding: 1rem 0;
  }

  .result-card {
    position: sticky;
    top: 100px;
  }

  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .command-preview {
    background: #1e293b;
    border-radius: 8px;
    padding: 1.5rem;
    min-height: 120px;
  }

  .command-preview pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
  }

  .command-preview code {
    color: #38bdf8;
    font-family: 'Fira Code', 'Courier New', monospace;
    font-size: 0.9rem;
  }

  .command-tips-card {
    background: #eff6ff;
    border-radius: 8px;
    padding: 16px;
    border-left: 4px solid #3b82f6;
  }

  .tip-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    color: #1e40af;
    margin: 0 0 8px 0;
  }

  .tip-list {
    padding-left: 20px;
    margin: 0;
  }

  .tip-list li {
    font-size: 0.8rem;
    color: #60a5fa;
    margin-bottom: 4px;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }

  .mb-0 {
    margin-bottom: 0;
  }
  .mb-4 {
    margin-bottom: 1rem;
  }
  .mb-6 {
    margin-bottom: 1.5rem;
  }
  .mt-4 {
    margin-top: 1rem;
  }
  .mt-6 {
    margin-top: 1.5rem;
  }
</style>
