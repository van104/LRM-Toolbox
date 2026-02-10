<template>
  <div class="ssl-checker">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>SSL 证书解析工具</h1>
        <span class="nav-subtitle">SSL/TLS Certificate Parser</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="grid-container">
        <section class="input-panel glass-card">
          <div class="panel-header">
            <h3>粘贴证书内容 (PEM 格式)</h3>
            <div class="panel-actions">
              <el-button type="primary" link @click="certText = ''">清空</el-button>
              <el-button type="primary" link @click="loadSample">加载示例</el-button>
            </div>
          </div>
          <el-input
            v-model="certText"
            type="textarea"
            :rows="15"
            placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
            class="cert-input"
          />
          <el-alert
            title="提示：此工具仅进行浏览器端本地解析，不会上传原始证书数据到任何服务器。"
            type="info"
            :closable="false"
            show-icon
            class="mt-4"
          />
        </section>

        <section class="result-panel">
          <div v-if="parsedData" class="parsed-content">
            <div class="glass-card status-card mb-4" :class="{ 'is-expired': isExpired }">
              <div class="status-summary">
                <el-icon class="status-icon" :class="isExpired ? 'text-danger' : 'text-success'">
                  <CircleCheck v-if="!isExpired" />
                  <Warning v-else />
                </el-icon>
                <div class="status-text">
                  <span class="main-domain">{{ commonName }}</span>
                  <span class="expiry-label">
                    {{ isExpired ? '已于 ' + expiryDate + ' 过期' : '有效期至 ' + expiryDate }}
                  </span>
                </div>
              </div>
            </div>

            <div class="glass-card detail-card mb-4">
              <h3 class="detail-title">证书详细参数</h3>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="主域名 (Common Name)">
                  <el-tag size="small">{{ commonName }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="颁发机构 (Issuer)">
                  {{ issuerName }}
                </el-descriptions-item>
                <el-descriptions-item label="生效时间 (Not Before)">
                  {{ startDate }}
                </el-descriptions-item>
                <el-descriptions-item label="过期时间 (Not After)">
                  <span :class="{ 'text-danger': isExpired }">{{ expiryDate }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="序列号 (Serial Number)">
                  <code>{{ serialNumber }}</code>
                </el-descriptions-item>
                <el-descriptions-item label="备用名称 (SANs)">
                  <div class="sans-tags">
                    <el-tag v-for="tag in sans" :key="tag" size="small" type="info">{{
                      tag
                    }}</el-tag>
                    <span v-if="!sans.length" class="text-secondary text-xs"
                      >通过 PEM 解析可能受限</span
                    >
                  </div>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>

          <div v-else class="empty-state glass-card">
            <el-empty description="请在左侧输入需要解析的证书数据" />
          </div>
        </section>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - SSL 证书解析工具</footer>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { Back, CircleCheck, Warning } from '@element-plus/icons-vue';

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
        issuer: issuer,
        notBefore: startD,
        notAfter: endD,
        serial: sn,
        sans: sans.length > 0 ? sans : [cn]
      };
    } catch {
      return null;
    }
  };

  const parsedData = computed(() => {
    if (!certText.value.trim()) return null;
    return parseCertificate(certText.value);
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
  .ssl-checker {
    --primary: #06b6d4;

    --bg: #f8fafc;
    --card: #ffffff;
    --border: #e2e8f0;
    --text: #1e293b;
    --success: #10b981;
    --danger: #ef4444;

    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', system-ui, sans-serif;
  }

  .nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
    background: var(--card);
    border-bottom: 1px solid var(--border);
  }

  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
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
    letter-spacing: 1px;
  }

  .main-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .grid-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    align-items: start;
  }

  .glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .panel-header h3 {
    font-size: 1rem;
    color: #475569;
    margin: 0;
  }

  .cert-input :deep(.el-textarea__inner) {
    font-family: 'Fira Code', monospace;
    font-size: 0.85rem;
    background: #fdfdfd;
  }

  .status-card {
    border-left: 6px solid var(--success);
  }

  .status-card.is-expired {
    border-left-color: var(--danger);
    background: #fef2f2;
  }

  .status-summary {
    display: flex;
    align-items: center;
    gap: 1.25rem;
  }

  .status-icon {
    font-size: 2.5rem;
  }

  .status-text {
    display: flex;
    flex-direction: column;
  }

  .main-domain {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
  }

  .expiry-label {
    font-size: 0.9rem;
    color: #64748b;
  }

  .detail-title {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 1.25rem;
    color: #334155;
  }

  .sans-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .text-danger {
    color: var(--danger);
    font-weight: 600;
  }

  .text-success {
    color: var(--success);
    font-weight: 600;
  }

  .text-secondary {
    color: #94a3b8;
  }

  .text-xs {
    font-size: 0.75rem;
  }

  .mb-4 {
    margin-bottom: 1rem;
  }

  .mt-4 {
    margin-top: 1rem;
  }

  .footer {
    text-align: center;
    padding: 3rem 2rem;
    color: #94a3b8;
    font-size: 0.85rem;
    border-top: 1px solid var(--border);
    margin-top: 4rem;
    background: #fff;
  }

  @media (max-width: 900px) {
    .grid-container {
      grid-template-columns: 1fr;
    }
  }
</style>
