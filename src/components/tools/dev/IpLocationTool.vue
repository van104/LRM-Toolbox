<template>
  <div class="ip-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>IP 属地查询</h1>
        <span class="nav-subtitle">IP Geolocation Lookup</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="tool-card glass-card">
        <div class="search-section">
          <div class="input-wrapper">
            <input
              v-model="ipInput"
              type="text"
              placeholder="输入 IP 地址 (留空查询本机)"
              :class="{ error: !isValidIp && ipInput }"
              @keyup.enter="fetchInfo"
            />
            <button class="search-btn" :disabled="loading" @click="fetchInfo">
              <el-icon v-if="loading" class="is-loading">
                <Loading />
              </el-icon>
              <span v-else>查询</span>
            </button>
          </div>
          <div class="quick-actions">
            <span @click="queryMyIp">查询本机 IP</span>
            <span
              @click="
                ipInput = '8.8.8.8';
                fetchInfo();
              "
              >Google DNS</span
            >
            <span
              @click="
                ipInput = '1.1.1.1';
                fetchInfo();
              "
              >Cloudflare</span
            >
          </div>
        </div>

        <div v-if="errorMsg" class="error-msg animate-fade-in">
          <el-icon>
            <Warning />
          </el-icon>
          {{ errorMsg }}
        </div>

        <div v-if="result" class="result-box animate-fade-in">
          <div class="header-info">
            <div class="ip-address">{{ result.ip }}</div>
            <div class="ip-type">{{ result.type }}</div>
          </div>

          <div class="info-grid">
            <div class="info-card">
              <div class="label">归属地</div>
              <div class="value">
                <span class="flag">{{ result.flag.emoji }}</span>
                {{ result.country_translation }} {{ result.region }} {{ result.city }}
              </div>
              <div class="sub-value">{{ result.country }} ({{ result.country_code }})</div>
            </div>

            <div class="info-card">
              <div class="label">运营商 (ISP)</div>
              <div class="value">{{ result.connection.isp || '未知' }}</div>
              <div class="sub-value">{{ result.connection.org }}</div>
            </div>

            <div class="info-card">
              <div class="label">地理坐标</div>
              <div class="value code-font">{{ result.latitude }}, {{ result.longitude }}</div>
              <div class="action-link">
                <a
                  :href="`https://www.google.com/maps/search/?api=1&query=${result.latitude},${result.longitude}`"
                  target="_blank"
                >
                  在地图中查看
                  <el-icon>
                    <Right />
                  </el-icon>
                </a>
              </div>
            </div>

            <div class="info-card">
              <div class="label">时区</div>
              <div class="value">{{ result.timezone.id }}</div>
              <div class="sub-value">
                UTC {{ result.timezone.utc }} ({{ result.timezone.current_time }})
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="!loading && !errorMsg" class="empty-state">
          <el-icon class="huge-icon">
            <LocationInformation />
          </el-icon>
          <p>查询 IP 地址的地理位置、ISP 等信息</p>
        </div>
      </div>

      <div class="tips-card">
        <el-icon>
          <InfoFilled />
        </el-icon>
        <div class="tip-content">
          <p>
            数据说明：查询服务基于 Ipwhois 和 IP.SB 公共 API。查询结果仅供参考，不支持 IPv6
            详细街道级定位。
          </p>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - IP 属地简易查询</footer>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import {
    Back,
    Loading,
    Warning,
    LocationInformation,
    Right,
    InfoFilled
  } from '@element-plus/icons-vue';

  const ipInput = ref('');
  const loading = ref(false);
  const errorMsg = ref('');
  const result = ref(null);

  const isValidIp = computed(() => {
    if (!ipInput.value) return true;

    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    return ipv4Regex.test(ipInput.value);
  });

  const queryMyIp = () => {
    ipInput.value = '';
    fetchInfo();
  };

  const fetchInfo = async () => {
    loading.value = true;
    errorMsg.value = '';
    result.value = null;

    const input = ipInput.value.trim();

    const tryFetch = async url => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 8000);
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        clearTimeout(id);
        return data;
      } catch (e) {
        clearTimeout(id);
        throw e;
      }
    };

    const getFlagEmoji = cc => {
      if (!cc) return '🌐';
      return cc
        .toUpperCase()
        .replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
    };

    try {
      if (input && !isValidIp.value) {
        throw new Error('IP 地址格式不正确');
      }

      let successData = null;

      try {
        const url = `https://api.ip.sb/geoip/${input}`;
        const data = await tryFetch(url);

        successData = {
          ip: data.ip,
          type: 'IPv4',
          flag: { emoji: getFlagEmoji(data.country_code) },
          country: data.country,
          country_translation: data.country,
          region: data.region,
          city: data.city,
          country_code: data.country_code,
          connection: {
            isp: data.isp,
            org: data.organization || data.asn_organization
          },
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: { id: data.timezone, utc: '?', current_time: '' }
        };
      } catch (e1) {
        console.warn('ip.sb failed, switching to fallback', e1);

        try {
          let url = 'https://ipwho.is/' + input;
          const data = await tryFetch(url);
          if (!data.success) throw new Error(data.message);
          successData = data;
        } catch {
          throw new Error('查询服务繁忙，请稍后刷新重试');
        }
      }

      result.value = successData;
    } catch (e) {
      errorMsg.value = e.message || '查询失败';
    } finally {
      loading.value = false;
    }
  };
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

  .ip-tool {
    --bg: #faf9f7;
    --card: #ffffff;
    --border: #e8e6e3;
    --text: #1a1a1a;
    --text-2: #6b6b6b;
    --accent: #059669;

    font-family: 'Noto Sans SC', sans-serif;
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
  }

  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background: var(--card);
    border-bottom: 1px solid var(--border);
  }

  .nav-back,
  .nav-spacer {
    width: 80px;
  }

  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: var(--text-2);
    cursor: pointer;
    font-size: 0.9rem;
    padding: 0.5rem 0;
  }

  .nav-center h1 {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-2);
    text-transform: uppercase;
    display: block;
    text-align: center;
  }

  .main-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  .input-wrapper {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .input-wrapper input {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 1rem;
    outline: none;
    font-family: monospace;
    transition: border-color 0.2s;
  }

  .input-wrapper input:focus {
    border-color: var(--accent);
  }

  .input-wrapper input.error {
    border-color: #ef4444;
    background: #fef2f2;
  }

  .search-btn {
    padding: 0 1.5rem;
    background: var(--text);
    color: white;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s;
    display: flex;
    align-items: center;
    min-width: 80px;
    justify-content: center;
  }

  .search-btn:hover {
    opacity: 0.9;
  }

  .search-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .quick-actions {
    display: flex;
    gap: 1rem;
    font-size: 0.8rem;
    color: var(--text-2);
    margin-top: 0.5rem;
  }

  .quick-actions span {
    cursor: pointer;
    border-bottom: 1px dotted var(--text-2);
  }

  .quick-actions span:hover {
    color: var(--accent);
    border-color: var(--accent);
  }

  .result-box {
    margin-top: 2rem;
  }

  .header-info {
    text-align: center;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px dashed var(--border);
  }

  .ip-address {
    font-size: 2.5rem;
    font-weight: 700;
    font-family: monospace;
    color: var(--text);
    margin-bottom: 0.5rem;
  }

  .ip-type {
    display: inline-block;
    padding: 2px 8px;
    background: #f3f4f6;
    border-radius: 4px;
    font-size: 0.75rem;
    color: var(--text-2);
    font-weight: 600;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .info-card {
    background: #f9f9f9;
    padding: 1.25rem;
    border-radius: 12px;
  }

  .info-card .label {
    font-size: 0.8rem;
    color: var(--text-2);
    margin-bottom: 0.5rem;
  }

  .info-card .value {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .info-card .sub-value {
    font-size: 0.85rem;
    color: var(--text-2);
  }

  .flag {
    font-size: 1.2rem;
    margin-right: 0.25rem;
    vertical-align: middle;
  }

  .code-font {
    font-family: monospace;
  }

  .action-link a {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    color: var(--accent);
    text-decoration: none;
    font-size: 0.85rem;
    margin-top: 0.5rem;
  }

  .action-link a:hover {
    opacity: 0.8;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    color: #cbd5e1;
  }

  .huge-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .error-msg {
    margin-top: 1rem;
    padding: 1rem;
    background: #fef2f2;
    color: #b91c1c;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .tips-card {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: rgba(5, 150, 105, 0.05);

    color: var(--accent);
    border-radius: 8px;
    font-size: 0.85rem;
    line-height: 1.5;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-2);
    font-size: 0.85rem;
    border-top: 1px solid var(--border);
    margin-top: 2rem;
  }

  .animate-fade-in {
    animation: fadeIn 0.4s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 600px) {
    .ip-address {
      font-size: 1.8rem;
    }
  }
</style>
