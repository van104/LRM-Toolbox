<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <!-- Header -->
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">SSL<span>.证书解析()</span></h1>
        <div class="ssl-badge">🔒 TLS/X.509</div>
      </header>

      <!-- Main Grid -->
      <div class="brutal-grid">
        <!-- 左侧：输入 -->
        <div class="brutal-pane input-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">PEM_CERT_INPUT</span>
            <div class="header-actions">
              <button class="brutal-action-btn tiny" @click="certText = ''">清空</button>
              <button class="brutal-action-btn tiny accent" @click="loadSample">加载示例</button>
            </div>
          </div>
          <div class="pane-body">
            <textarea
              v-model="certText"
              class="brutal-editor cert-textarea"
              placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
              spellcheck="false"
            ></textarea>
            <button class="parse-btn" :disabled="!certText.trim()" @click="doParse">
              🔍 开始解析
            </button>
            <div class="privacy-note">🔒 仅在本地浏览器内解析，证书数据不会上传至任何服务器。</div>
          </div>
        </div>

        <!-- 右侧：结果 -->
        <div class="result-area">
          <!-- 有结果 -->
          <template v-if="parsedData">
            <!-- 状态卡片 -->
            <div
              class="brutal-pane status-pane"
              :class="isExpired ? 'status-expired' : 'status-valid'"
            >
              <div class="pane-header" :class="isExpired ? 'bg-red' : 'bg-green'">
                <span>{{ isExpired ? '⚠️ 证书已过期' : '✅ 证书有效' }}</span>
              </div>
              <div class="status-body">
                <div class="domain-name">{{ commonName }}</div>
                <div class="expiry-info" :class="{ expired: isExpired }">
                  {{ isExpired ? '已于 ' + expiryDate + ' 过期' : '有效期至 ' + expiryDate }}
                </div>

                <!-- 有效期进度条 -->
                <div class="validity-bar-wrap">
                  <div class="validity-bar">
                    <div
                      class="validity-fill"
                      :style="{ width: validityPercent + '%' }"
                      :class="
                        isExpired ? 'fill-red' : validityPercent < 20 ? 'fill-orange' : 'fill-green'
                      "
                    ></div>
                  </div>
                  <span class="validity-label">
                    {{ isExpired ? '已过期' : '剩余 ' + daysRemaining + ' 天' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 详情表格 -->
            <div class="brutal-pane detail-pane">
              <div class="pane-header bg-yellow">
                <span>// 证书详细参数</span>
              </div>
              <div class="detail-table">
                <div class="dt-row">
                  <span class="dt-key">主域名 (CN)</span>
                  <span class="dt-val mono-chip">{{ commonName }}</span>
                </div>
                <div class="dt-row">
                  <span class="dt-key">颁发机构 (Issuer)</span>
                  <span class="dt-val">{{ issuerName }}</span>
                </div>
                <div class="dt-row">
                  <span class="dt-key">生效时间 (Not Before)</span>
                  <span class="dt-val">{{ startDate }}</span>
                </div>
                <div class="dt-row">
                  <span class="dt-key">过期时间 (Not After)</span>
                  <span class="dt-val" :class="{ 'text-red': isExpired }">{{ expiryDate }}</span>
                </div>
                <div class="dt-row">
                  <span class="dt-key">序列号 (Serial)</span>
                  <span class="dt-val serial-code">{{ serialNumber }}</span>
                </div>
                <div class="dt-row">
                  <span class="dt-key">备用域名 (SANs)</span>
                  <span class="dt-val">
                    <div class="sans-wrap">
                      <span v-for="tag in sans" :key="tag" class="san-tag">{{ tag }}</span>
                      <span v-if="!sans.length" class="text-muted">通过 PEM 解析可能受限</span>
                    </div>
                  </span>
                </div>
              </div>
            </div>
          </template>

          <!-- 空状态 -->
          <div v-else class="brutal-pane empty-pane">
            <div class="pane-header bg-yellow">
              <span>// 解析结果</span>
            </div>
            <div class="empty-state">
              <div class="empty-icon">🔐</div>
              <p>请在左侧粘贴 PEM 格式证书内容</p>
              <p class="empty-hint">
                格式：-----BEGIN CERTIFICATE----- ... -----END CERTIFICATE-----
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, watch } from 'vue';

  const certText = ref('');

  const parseCertificate = pem => {
    const match = pem.match(/-----BEGIN CERTIFICATE-----([\s\S]*?)-----END CERTIFICATE-----/);
    if (!match) return null;
    try {
      const b64 = match[1].replace(/\s/g, '');
      const binary = window.atob(b64);

      const getLen = (data, start) => {
        let b = data.charCodeAt(start);
        if (!(b & 0x80)) return { len: b, offset: 1 };
        let count = b & 0x7f;
        let res = 0;
        for (let i = 0; i < count; i++) {
          res = (res << 8) | data.charCodeAt(start + 1 + i);
        }
        return { len: res, offset: 1 + count };
      };

      const findAllCNs = data => {
        const results = [];
        const cnOID = '\x06\x03\x55\x04\x03';
        let pos = 0;
        while ((pos = data.indexOf(cnOID, pos)) !== -1) {
          let strPos = pos + 5;
          const tag = data.charCodeAt(strPos);
          if ([0x0c, 0x13, 0x16, 0x14].includes(tag)) {
            const info = getLen(data, strPos + 1);
            const str = data.substring(
              strPos + 1 + info.offset,
              strPos + 1 + info.offset + info.len
            );
            results.push(str.replace(/[^\x20-\x7e\u4e00-\u9fa5]/g, ''));
          }
          pos += 5;
        }
        return results;
      };

      const cns = findAllCNs(binary);
      const cn = cns.length > 0 ? cns[cns.length - 1] : '未知域名';
      const issuer = cns.length > 1 ? cns[0] : '由证书链包含';

      const dateMatches = binary.match(/(\d{12,14}Z)/g);
      let startD = '-',
        endD = '-';
      if (dateMatches && dateMatches.length >= 2) {
        const formatDate = s => {
          const isGeneralized = s.length >= 15;
          let y, m, d, hh, mm, ss;
          if (isGeneralized) {
            y = s.substring(0, 4);
            m = s.substring(4, 6);
            d = s.substring(6, 8);
            hh = s.substring(8, 10);
            mm = s.substring(10, 12);
            ss = s.substring(12, 14);
          } else {
            const yy = parseInt(s.substring(0, 2));
            y = (yy < 50 ? '20' : '19') + s.substring(0, 2);
            m = s.substring(2, 4);
            d = s.substring(4, 6);
            hh = s.substring(6, 8);
            mm = s.substring(8, 10);
            ss = s.substring(10, 12);
          }
          return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
        };
        startD = formatDate(dateMatches[0]);
        endD = formatDate(dateMatches[1]);
      }

      const toHex = str =>
        Array.from(str)
          .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
          .join('');
      let sn = 'N/A';
      let p = 0;
      if (binary.charCodeAt(p) === 0x30) {
        const outerInfo = getLen(binary, p + 1);
        p = p + 1 + outerInfo.offset;
        if (binary.charCodeAt(p) === 0x30) {
          const tbsInfo = getLen(binary, p + 1);
          let currentPos = p + 1 + tbsInfo.offset;
          if (binary.charCodeAt(currentPos) === 0xa0) {
            const verInfo = getLen(binary, currentPos + 1);
            currentPos += 1 + verInfo.offset + verInfo.len;
          }
          if (binary.charCodeAt(currentPos) === 0x02) {
            const snInfo = getLen(binary, currentPos + 1);
            sn =
              toHex(
                binary.substring(
                  currentPos + 1 + snInfo.offset,
                  currentPos + 1 + snInfo.offset + snInfo.len
                )
              )
                .toUpperCase()
                .match(/.{2}/g)
                ?.join(':') || 'N/A';
          }
        }
      }

      const sans = [];
      const sanOID = '\x06\x03\x55\x1d\x11';
      let sanPos = binary.indexOf(sanOID);
      if (sanPos !== -1) {
        let searchZone = binary.substring(sanPos, sanPos + 500);
        const matches = searchZone.match(/\x82([\s\S])/g);
        if (matches) {
          matches.forEach(m => {
            const l = m.charCodeAt(1);
            const start = searchZone.indexOf(m) + 2;
            const d = searchZone.substring(start, start + l).replace(/[^\x20-\x7e]/g, '');
            if (d && !sans.includes(d)) sans.push(d);
          });
        }
      }

      return {
        commonName: cn,
        issuer,
        notBefore: startD,
        notAfter: endD,
        serial: sn,
        sans: sans.length > 0 ? sans : [cn]
      };
    } catch {
      return null;
    }
  };

  const parsedData = ref(null);

  const doParse = () => {
    if (!certText.value.trim()) return;
    parsedData.value = parseCertificate(certText.value);
  };

  // 清空时同步重置解析结果
  watch(certText, val => {
    if (!val.trim()) parsedData.value = null;
  });

  const commonName = computed(() => parsedData.value?.commonName || '未知域名');
  const issuerName = computed(() => parsedData.value?.issuer || '未知颁发者');
  const startDate = computed(() => parsedData.value?.notBefore || '-');
  const expiryDate = computed(() => parsedData.value?.notAfter || '-');
  const serialNumber = computed(() => parsedData.value?.serial || '-');
  const sans = computed(() => parsedData.value?.sans || []);

  const isExpired = computed(() => {
    if (!expiryDate.value || expiryDate.value === '-') return false;
    return new Date(expiryDate.value) < new Date();
  });

  const daysRemaining = computed(() => {
    if (!expiryDate.value || expiryDate.value === '-') return 0;
    const diff = new Date(expiryDate.value).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  });

  const validityPercent = computed(() => {
    if (!startDate.value || !expiryDate.value || startDate.value === '-') return 0;
    const total = new Date(expiryDate.value).getTime() - new Date(startDate.value).getTime();
    const elapsed = Date.now() - new Date(startDate.value).getTime();
    if (total <= 0) return 100;
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  });

  const loadSample = () => {
    certText.value = `-----BEGIN CERTIFICATE-----
MIIDRjCCAi6gAwIBAgIJAO3xQl3hilchMA0GCSqGSIb3DQEBCwUAMB4xHDAaBgNV
BAMME0xSTSBHb29nbGUgU2FtcGxlIENBMB4XDTI1MDEwMTEwMDAwMFoXDTI2MDMz
MTIzNTk1OVowGjEYMBYGA1UEAwwPZXhhbXBsZS5jb20wggEiMA0GCSqGSIb3DQEB
AQUAA4IBDwAwggEKAoIBAQC7+S6v... (省略部分数据)
-----END CERTIFICATE-----`;
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
    max-width: 1500px;
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
    text-shadow: 4px 4px 0px #06b6d4;
  }

  .brutal-title span {
    color: #06b6d4;
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

  .ssl-badge {
    background: #06b6d4;
    color: #fff;
    padding: 0.5rem 1.2rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    border: 4px solid #111;
    box-shadow: 5px 5px 0px #111;
  }

  /* Grid */
  .brutal-grid {
    display: grid;
    grid-template-columns: 1fr 1.1fr;
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

  .bg-blue {
    background: #4b7bff;
  }
  .bg-green {
    background: #00e572;
  }
  .bg-red {
    background: #ff4b4b;
    color: #fff;
  }
  .bg-yellow {
    background: #ffd900;
  }
  .text-white {
    color: #fff;
  }

  .header-actions {
    display: flex;
    gap: 0.5rem;
  }

  .pane-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .cert-textarea {
    width: 100%;
    min-height: 42vh;
    resize: vertical;
    padding: 1.2rem;
    font-size: 0.95rem;
    line-height: 1.6;
    box-sizing: border-box;
  }

  .brutal-editor {
    border: 4px solid #111;
    font-family: 'IBM Plex Mono', monospace;
    background: #fdfae5;
    color: #111;
    box-shadow: 6px 6px 0px #111;
    outline: none;
    font-weight: 600;
  }

  .brutal-editor:focus {
    background: #fff;
  }

  .privacy-note {
    background: #e0f7ff;
    border: 3px solid #06b6d4;
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
    font-weight: 700;
    color: #0369a1;
    box-shadow: 3px 3px 0px #06b6d4;
  }

  .brutal-action-btn {
    border: 2px solid #111;
    background: #fff;
    padding: 0.3rem 0.8rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.85rem;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
    color: #111;
  }

  .brutal-action-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
  }
  .brutal-action-btn:active {
    transform: translate(2px, 2px);
    box-shadow: 0px 0px 0px #111;
  }
  .brutal-action-btn.accent {
    background: #06b6d4;
    color: #fff;
    border-color: #111;
  }

  /* 解析按钮 */
  .parse-btn {
    width: 100%;
    border: 4px solid #111;
    background: #ffd900;
    padding: 1.1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.3rem;
    font-weight: 900;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #111;
  }

  .parse-btn:hover:not(:disabled) {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
    background: #ffe840;
  }

  .parse-btn:active:not(:disabled) {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }

  .parse-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    box-shadow: 3px 3px 0px #aaa;
    border-color: #aaa;
  }

  /* Status Card */
  .result-area {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .status-valid .pane-header {
    background: #00e572;
    color: #111;
  }
  .status-expired .pane-header {
    background: #ff4b4b;
    color: #fff;
  }

  .status-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .domain-name {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.8rem;
    font-weight: 900;
    letter-spacing: 0.5px;
    word-break: break-all;
  }

  .expiry-info {
    font-weight: 700;
    font-size: 1rem;
    color: #555;
  }
  .expiry-info.expired {
    color: #ff4b4b;
  }

  .validity-bar-wrap {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .validity-bar {
    flex: 1;
    height: 16px;
    background: #e0e0e0;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #111;
    overflow: hidden;
  }

  .validity-fill {
    height: 100%;
    transition: width 0.5s ease;
  }

  .fill-green {
    background: #00e572;
  }
  .fill-orange {
    background: #f59e0b;
  }
  .fill-red {
    background: #ff4b4b;
  }

  .validity-label {
    font-weight: 800;
    font-size: 0.9rem;
    white-space: nowrap;
  }

  /* Detail Table */
  .detail-table {
    display: flex;
    flex-direction: column;
  }

  .dt-row {
    display: grid;
    grid-template-columns: 210px 1fr;
    border-bottom: 2px solid #e0e0e0;
    min-height: 48px;
  }

  .dt-row:last-child {
    border-bottom: none;
  }

  .dt-key {
    background: #fdfae5;
    padding: 0.75rem 1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.85rem;
    border-right: 3px solid #111;
    display: flex;
    align-items: center;
    color: #555;
  }

  .dt-val {
    padding: 0.75rem 1rem;
    font-weight: 600;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    word-break: break-all;
  }

  .text-red {
    color: #ff4b4b;
    font-weight: 800;
  }

  .mono-chip {
    background: #111;
    color: #00e572;
    padding: 0.3rem 0.75rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 0.95rem;
    word-break: break-all;
  }

  .serial-code {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.8rem;
    color: #555;
    word-break: break-all;
  }

  .sans-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .san-tag {
    background: #e0f7ff;
    border: 2px solid #06b6d4;
    padding: 0.2rem 0.6rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 0.85rem;
    color: #0369a1;
  }

  .text-muted {
    color: #aaa;
    font-weight: 600;
  }

  /* Empty State */

  .empty-state {
    padding: 3rem 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    text-align: center;
    font-weight: 700;
  }

  .empty-icon {
    font-size: 3rem;
  }
  .empty-hint {
    font-size: 0.85rem;
    color: #888;
    font-family: 'IBM Plex Mono', monospace;
  }

  @media (max-width: 900px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .brutal-title {
      font-size: 2rem;
    }
    .dt-row {
      grid-template-columns: 1fr;
    }
    .dt-key {
      border-right: none;
      border-bottom: 2px solid #111;
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
  [data-theme='dark'] .ssl-badge {
    border-color: #eee;
    box-shadow: 5px 5px 0px #eee;
  }

  [data-theme='dark'] .brutal-pane {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
    color: #111;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a6bcc;
    color: #fff;
  }
  [data-theme='dark'] .bg-green {
    background: #007a3d;
    color: #fff;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
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

  [data-theme='dark'] .privacy-note {
    background: #0a1a2a;
    border-color: #06b6d4;
    color: #38bdf8;
    box-shadow: 3px 3px 0px #06b6d4;
  }

  [data-theme='dark'] .brutal-action-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:hover {
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn.accent {
    background: #0e7490;
    color: #fff;
  }

  [data-theme='dark'] .validity-bar {
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
    background: #333;
  }

  [data-theme='dark'] .dt-key {
    background: #222;
    border-right-color: #eee;
    color: #aaa;
  }
  [data-theme='dark'] .dt-row {
    border-bottom-color: #333;
  }
  [data-theme='dark'] .dt-val {
    color: #eee;
  }

  [data-theme='dark'] .san-tag {
    background: #0a1a2a;
    border-color: #06b6d4;
    color: #38bdf8;
  }
  [data-theme='dark'] .empty-state {
    color: #aaa;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
</style>
