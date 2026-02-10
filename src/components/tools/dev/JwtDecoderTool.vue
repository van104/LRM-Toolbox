<template>
  <div class="jwt-decoder-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>JWT 解码工具</h1>
        <span class="nav-subtitle">JWT Decoder & Debugger</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="grid-layout">
        <section class="input-section glass-card">
          <div class="section-header">
            <h3>JSON Web Token</h3>
            <el-button type="primary" link @click="encodedJwt = ''">清空</el-button>
          </div>
          <el-input
            v-model="encodedJwt"
            type="textarea"
            :rows="12"
            placeholder="在此粘贴您的 JWT (xxxxx.yyyyy.zzzzz)"
            class="jwt-textarea"
          />
          <div v-if="encodedJwt" class="status-indicator">
            <el-tag :type="isValid ? 'success' : 'danger'" size="small">
              {{ isValid ? '格式正确' : '格式无效' }}
            </el-tag>
          </div>
        </section>

        <section class="result-section">
          <div class="decode-block glass-card mb-4">
            <div class="block-header">
              <span class="label">HEADER:</span>
              <span class="sub-label">ALGORITHM & TOKEN TYPE</span>
            </div>
            <pre class="json-content"><code>{{ formattedHeader }}</code></pre>
          </div>

          <div class="decode-block glass-card mb-4">
            <div class="block-header">
              <span class="label">PAYLOAD:</span>
              <span class="sub-label">DATA</span>
            </div>
            <pre class="json-content"><code>{{ formattedPayload }}</code></pre>
            <div v-if="payloadDetails.exp" class="payload-info">
              <el-alert
                :title="'过期时间: ' + payloadDetails.expStr"
                :type="isExpired ? 'error' : 'success'"
                :closable="false"
                show-icon
                class="mt-2"
              />
            </div>
          </div>

          <div class="decode-block glass-card signature-block">
            <div class="block-header">
              <span class="label">VERIFY SIGNATURE</span>
            </div>
            <div class="signature-info">
              <p class="text-xs text-secondary">
                注：该工具主要用于本地解析展示载荷内容。签名验证仅作为占位参考，不建议用于生产环境关键凭证校验。
              </p>
              <div class="sig-status">
                <el-icon :class="isValid ? 'text-success' : 'text-danger'">
                  <CircleCheckFilled v-if="isValid" />
                  <CircleCloseFilled v-else />
                </el-icon>
                <span>{{ isValid ? '签名结构完整' : '无效的签名结构' }}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - JWT 解码工具</footer>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { Back, CircleCheckFilled, CircleCloseFilled } from '@element-plus/icons-vue';

  const encodedJwt = ref('');

  const decodeBase64Url = str => {
    try {
      str = str.replace(/-/g, '+').replace(/_/g, '/');

      const pad = str.length % 4;
      if (pad) {
        if (pad === 1) throw new Error('Invalid Length');
        str += new Array(5 - pad).join('=');
      }
      return JSON.parse(decodeURIComponent(escape(window.atob(str))));
    } catch {
      return null;
    }
  };

  const jwtParts = computed(() => {
    if (!encodedJwt.value) return { header: null, payload: null, signature: null };
    const parts = encodedJwt.value.split('.');
    return {
      header: parts[0] || null,
      payload: parts[1] || null,
      signature: parts[2] || null
    };
  });

  const isValid = computed(() => {
    const parts = encodedJwt.value.split('.');
    return parts.length === 3 && parts[0] && parts[1] && parts[2];
  });

  const decodedHeader = computed(() => {
    if (!jwtParts.value.header) return null;
    return decodeBase64Url(jwtParts.value.header);
  });

  const decodedPayload = computed(() => {
    if (!jwtParts.value.payload) return null;
    return decodeBase64Url(jwtParts.value.payload);
  });

  const formattedHeader = computed(() => {
    return decodedHeader.value ? JSON.stringify(decodedHeader.value, null, 2) : '{ ... }';
  });

  const formattedPayload = computed(() => {
    return decodedPayload.value ? JSON.stringify(decodedPayload.value, null, 2) : '{ ... }';
  });

  const payloadDetails = computed(() => {
    const p = decodedPayload.value;
    if (!p) return {};
    return {
      exp: p.exp,
      expStr: p.exp ? new Date(p.exp * 1000).toLocaleString() : '未设置'
    };
  });

  const isExpired = computed(() => {
    if (!payloadDetails.value.exp) return false;
    return payloadDetails.value.exp < Date.now() / 1000;
  });
</script>

<style scoped>
  .jwt-decoder-tool {
    --primary: #6366f1;
    --secondary: #94a3b8;
    --bg: #f8fafc;
    --card: #ffffff;
    --border: #e2e8f0;
    --text: #1e293b;
    --success: #10b981;
    --danger: #ef4444;

    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    font-family:
      'Inter',
      -apple-system,
      sans-serif;
  }

  .nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
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
    padding: 0.5rem;
    border-radius: 6px;
    transition: background 0.2s;
  }

  .nav-back:hover {
    background: #f1f5f9;
  }

  .nav-center {
    text-align: center;
  }

  .nav-center h1 {
    font-size: 1.25rem;
    margin: 0;
    font-weight: 700;
    color: #0f172a;
  }

  .nav-subtitle {
    font-size: 0.75rem;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 1.5px;
  }

  .main-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
  }

  .grid-layout {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 2rem;
  }

  .glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
  }

  .mb-4 {
    margin-bottom: 1.5rem;
  }

  .mt-2 {
    margin-top: 1rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .section-header h3 {
    font-size: 1rem;
    margin: 0;
    color: var(--secondary);
    font-weight: 600;
  }

  .jwt-textarea {
    font-family: 'Fira Code', 'Courier New', monospace;
    font-size: 0.9rem;
  }

  .jwt-textarea :deep(.el-textarea__inner) {
    border-radius: 8px;
    background: #fdfdfd;
  }

  .status-indicator {
    margin-top: 1rem;
  }

  .decode-block {
    border-left: 4px solid var(--primary);
  }

  .block-header {
    margin-bottom: 1rem;
  }

  .label {
    font-weight: 700;
    font-size: 0.85rem;
    color: var(--primary);
    margin-right: 8px;
  }

  .sub-label {
    font-size: 0.75rem;
    color: var(--secondary);
  }

  .json-content {
    background: #1e293b;
    color: #e2e8f0;
    padding: 1.25rem;
    border-radius: 8px;
    font-size: 0.85rem;
    font-family: 'Fira Code', monospace;
    margin: 0;
    overflow: auto;
    max-height: 400px;
  }

  .signature-block {
    border-left-color: #cbd5e1;
  }

  .sig-status {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 1rem;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .text-success {
    color: var(--success);
  }

  .text-danger {
    color: var(--danger);
  }

  .text-secondary {
    color: var(--secondary);
  }

  .text-xs {
    font-size: 0.75rem;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #94a3b8;
    font-size: 0.85rem;
  }

  @media (max-width: 1024px) {
    .grid-layout {
      grid-template-columns: 1fr;
    }
  }
</style>
