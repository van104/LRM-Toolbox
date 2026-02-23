<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <!-- Header -->
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">JWT<span>.解码器()</span></h1>
        <button class="brutal-btn clear-btn" @click="encodedJwt = ''">清空</button>
      </header>

      <!-- JWT 三段可视化 -->
      <div v-if="encodedJwt" class="jwt-visual">
        <span class="jwt-part header-part">{{ jwtParts.header || '...' }}</span>
        <span class="jwt-dot">.</span>
        <span class="jwt-part payload-part">{{ jwtParts.payload || '...' }}</span>
        <span class="jwt-dot">.</span>
        <span class="jwt-part sig-part">{{ jwtParts.signature || '...' }}</span>
      </div>

      <!-- 主布局 -->
      <div class="brutal-grid">
        <!-- 左侧输入 -->
        <div class="brutal-pane input-pane">
          <div class="pane-header bg-yellow">
            <span>JSON_WEB_TOKEN_INPUT</span>
            <span :class="['validity-tag', isValid ? 'valid' : 'invalid']">
              {{ encodedJwt ? (isValid ? '✔ 格式正确' : '✕ 格式无效') : '待输入' }}
            </span>
          </div>
          <div class="pane-body">
            <textarea
              v-model="encodedJwt"
              class="brutal-editor jwt-textarea"
              placeholder="在此粘贴您的 JWT (xxxxx.yyyyy.zzzzz)"
              spellcheck="false"
            ></textarea>
          </div>
        </div>

        <!-- 右侧解码结果 -->
        <div class="decoded-section">
          <!-- Header Block -->
          <div class="brutal-pane decode-block">
            <div class="pane-header header-color">
              <span>HEADER</span>
              <span class="sub-tag">ALGORITHM &amp; TOKEN TYPE</span>
            </div>
            <pre class="code-block header-code"><code>{{ formattedHeader }}</code></pre>
          </div>

          <!-- Payload Block -->
          <div class="brutal-pane decode-block">
            <div class="pane-header payload-color">
              <span>PAYLOAD</span>
              <span class="sub-tag">DATA</span>
            </div>
            <pre class="code-block payload-code"><code>{{ formattedPayload }}</code></pre>

            <!-- 过期信息 -->
            <div v-if="payloadDetails.exp" :class="['exp-bar', isExpired ? 'expired' : 'alive']">
              <span class="exp-icon">{{ isExpired ? '⚠️' : '✅' }}</span>
              <span>
                <strong>过期时间：</strong>{{ payloadDetails.expStr }}
                <span v-if="isExpired" class="expired-text">（已过期）</span>
                <span v-else class="alive-text">（有效）</span>
              </span>
            </div>
          </div>

          <!-- Signature Block -->
          <div class="brutal-pane decode-block">
            <div class="pane-header sig-color">
              <span>VERIFY SIGNATURE</span>
            </div>
            <div class="sig-body">
              <p class="sig-note">
                注：该工具主要用于本地解析展示载荷内容。签名验证仅作为结构校验参考，不建议用于生产环境关键凭证校验。
              </p>
              <div :class="['sig-status', isValid ? 'sig-ok' : 'sig-fail']">
                <span class="sig-icon">{{ isValid ? '✔' : '✕' }}</span>
                <span>{{ isValid ? '签名结构完整' : '无效的签名结构' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';

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
    const parts = encodedJwt.value.trim().split('.');
    return {
      header: parts[0] || null,
      payload: parts[1] || null,
      signature: parts[2] || null
    };
  });

  const isValid = computed(() => {
    const parts = encodedJwt.value.trim().split('.');
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
    return decodedHeader.value ? JSON.stringify(decodedHeader.value, null, 2) : '{\n  ...\n}';
  });

  const formattedPayload = computed(() => {
    return decodedPayload.value ? JSON.stringify(decodedPayload.value, null, 2) : '{\n  ...\n}';
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
  .brutal-btn.clear-btn {
    background: #ff4b4b;
    color: #fff;
  }

  /* JWT Visual Strip */
  .jwt-visual {
    border: 4px solid #111;
    background: #111;
    padding: 1.5rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.95rem;
    word-break: break-all;
    line-height: 1.6;
    box-shadow: 8px 8px 0px #555;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.2rem;
  }

  .jwt-part {
    border-radius: 0;
    padding: 2px 4px;
    font-weight: bold;
  }
  .header-part {
    color: #ff7be5;
  }
  .payload-part {
    color: #00e572;
  }
  .sig-part {
    color: #4b7bff;
  }
  .jwt-dot {
    color: #fff;
    font-weight: 900;
    font-size: 1.2rem;
  }

  /* Main Grid */
  .brutal-grid {
    display: grid;
    grid-template-columns: 1fr 1.3fr;
    gap: 2.5rem;
    align-items: start;
  }

  .brutal-pane {
    display: flex;
    flex-direction: column;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
    background: #fff;
  }

  .decoded-section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .decode-block {
    box-shadow: 8px 8px 0px #111;
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
  }

  .bg-yellow {
    background: #ffd900;
  }
  .header-color {
    background: #ff7be5;
  }
  .payload-color {
    background: #00e572;
  }
  .sig-color {
    background: #4b7bff;
    color: #fff;
  }

  .sub-tag {
    font-size: 0.85rem;
    font-weight: 600;
    opacity: 0.7;
    letter-spacing: 0;
  }

  .validity-tag {
    padding: 0.3rem 0.8rem;
    font-size: 0.95rem;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    border: 3px solid #111;
    box-shadow: 2px 2px 0px #111;
  }

  .valid {
    background: #00e572;
    color: #111;
  }
  .invalid {
    background: #ff4b4b;
    color: #fff;
  }

  .pane-body {
    padding: 1.5rem;
  }

  .brutal-editor {
    width: 100%;
    border: 4px solid #111;
    padding: 1.5rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1rem;
    background: #fdfae5;
    color: #111;
    box-shadow: 6px 6px 0px #111;
    outline: none;
    font-weight: 600;
    resize: none;
    line-height: 1.5;
    box-sizing: border-box;
  }

  .brutal-editor:focus {
    background: #fff;
  }
  .jwt-textarea {
    min-height: 40vh;
  }

  .code-block {
    margin: 0;
    padding: 1.5rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.95rem;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
    overflow: auto;
    max-height: 350px;
  }

  .header-code {
    background: #fff0fb;
    color: #8b0080;
  }
  .payload-code {
    background: #eaffed;
    color: #003c1a;
  }

  /* Expiry Bar */
  .exp-bar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.9rem 1.5rem;
    border-top: 4px solid #111;
    font-weight: 700;
    font-size: 1rem;
  }

  .exp-bar.alive {
    background: #eaffed;
  }
  .exp-bar.expired {
    background: #ffeded;
  }

  .exp-icon {
    font-size: 1.5rem;
  }
  .expired-text {
    color: #cc3c3c;
  }
  .alive-text {
    color: #006630;
  }

  /* Signature block */
  .sig-body {
    padding: 1.5rem;
  }

  .sig-note {
    font-size: 0.9rem;
    color: #555;
    margin: 0 0 1.5rem 0;
    line-height: 1.6;
    background: #fdfae5;
    border: 2px dashed #aaa;
    padding: 0.75rem;
  }

  .sig-status {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border: 4px solid #111;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    font-size: 1.2rem;
  }

  .sig-status.sig-ok {
    background: #eaffed;
    box-shadow: 4px 4px 0px #111;
  }
  .sig-status.sig-fail {
    background: #ffeded;
    box-shadow: 4px 4px 0px #111;
  }

  .sig-icon {
    font-size: 1.5rem;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid #111;
    font-weight: 900;
  }

  .sig-ok .sig-icon {
    background: #00e572;
  }
  .sig-fail .sig-icon {
    background: #ff4b4b;
    color: #fff;
  }

  @media (max-width: 1024px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .brutal-title {
      font-size: 2.2rem;
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
  [data-theme='dark'] .brutal-btn.clear-btn {
    background: #cc3c3c;
    color: #fff;
  }

  [data-theme='dark'] .brutal-pane {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .decode-block {
    box-shadow: 8px 8px 0px #eee;
  }

  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
    color: #111;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .header-color {
    background: #8b3d7f;
    color: #fff;
  }
  [data-theme='dark'] .payload-color {
    background: #007a3d;
    color: #fff;
  }
  [data-theme='dark'] .sig-color {
    background: #2a4eb2;
    color: #fff;
  }

  [data-theme='dark'] .brutal-editor {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-editor:focus {
    background: #2a2a2a;
  }

  [data-theme='dark'] .header-code {
    background: #1a0a18;
    color: #ff7be5;
  }
  [data-theme='dark'] .payload-code {
    background: #0a1a0f;
    color: #00e572;
  }

  [data-theme='dark'] .validity-tag {
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .valid {
    background: #007a3d;
    color: #fff;
  }
  [data-theme='dark'] .invalid {
    background: #cc3c3c;
    color: #fff;
  }

  [data-theme='dark'] .exp-bar {
    border-color: #eee;
  }
  [data-theme='dark'] .exp-bar.alive {
    background: #0a1a0f;
  }
  [data-theme='dark'] .exp-bar.expired {
    background: #1a0a0a;
  }
  [data-theme='dark'] .expired-text {
    color: #ff7777;
  }
  [data-theme='dark'] .alive-text {
    color: #00e572;
  }

  [data-theme='dark'] .sig-note {
    background: #222;
    color: #aaa;
    border-color: #555;
  }
  [data-theme='dark'] .sig-status {
    border-color: #eee;
  }
  [data-theme='dark'] .sig-status.sig-ok {
    background: #0a1a0f;
  }
  [data-theme='dark'] .sig-status.sig-fail {
    background: #1a0a0a;
  }
  [data-theme='dark'] .sig-icon {
    border-color: #eee;
  }
  [data-theme='dark'] .sig-ok .sig-icon {
    background: #007a3d;
  }
  [data-theme='dark'] .sig-fail .sig-icon {
    background: #cc3c3c;
  }

  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .jwt-visual {
    box-shadow: 8px 8px 0px #333;
  }
</style>
