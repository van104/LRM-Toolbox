<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <!-- Header -->
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">IP<span>.属地()</span></h1>
        <div class="badge">📍 Geolocation Lookup</div>
      </header>

      <main class="brutal-grid">
        <!-- Search & Control -->
        <section class="brutal-pane search-pane">
          <div class="pane-header bg-yellow">
            <span>🔎 IP 检索器 (FINDER)</span>
          </div>
          <div class="pane-body">
            <div class="search-input-group">
              <input
                v-model="ipInput"
                type="text"
                placeholder="输入 IP 地址 (留空查询本机)"
                class="brutal-input large"
                :class="{ error: !isValidIp && ipInput }"
                @keyup.enter="fetchInfo"
              />
              <button class="brutal-btn search-submit" :disabled="loading" @click="fetchInfo">
                <span v-if="loading" class="rotate">⌛</span>
                <span v-else>查询 IP →</span>
              </button>
            </div>

            <div class="quick-links">
              <button class="small-brutal-btn" @click="queryMyIp">🏠 本机 IP</button>
              <button class="small-brutal-btn" @click="setIp('8.8.8.8')">🌐 Google</button>
              <button class="small-brutal-btn" @click="setIp('1.1.1.1')">☁️ Cloudflare</button>
            </div>

            <div v-if="errorMsg" class="error-banner">
              <span>⚠ {{ errorMsg }}</span>
            </div>
          </div>
        </section>

        <!-- Results Display -->
        <section class="brutal-pane result-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">📊 解析结果 (RESULT)</span>
          </div>
          <div class="pane-body">
            <div v-if="result" class="result-content">
              <div class="ip-hero">
                <div class="ip-type-tag">{{ result.type }}</div>
                <h2 class="ip-display">{{ result.ip }}</h2>
              </div>

              <div class="info-matrix">
                <div class="info-item">
                  <label>归属地 / Location</label>
                  <div class="value">
                    <span class="flag-emoji">{{ result.flag.emoji }}</span>
                    {{ result.country_translation || result.country }} · {{ result.region }} ·
                    {{ result.city }}
                  </div>
                  <div class="sub-val">{{ result.country_code }} // {{ result.country }}</div>
                </div>

                <div class="info-item">
                  <label>运营商 / ISP</label>
                  <div class="value">{{ result.connection.isp || '未知网络载体' }}</div>
                  <div class="sub-val">{{ result.connection.org || 'NONE' }}</div>
                </div>

                <div class="info-item">
                  <label>地理坐标 / Coordinates</label>
                  <div class="value mono">{{ result.latitude }}, {{ result.longitude }}</div>
                  <a
                    :href="`https://www.google.com/maps/search/?api=1&query=${result.latitude},${result.longitude}`"
                    target="_blank"
                    class="map-link"
                  >
                    查看地图投影 ↗
                  </a>
                </div>

                <div class="info-item">
                  <label>时区 / Timezone</label>
                  <div class="value">{{ result.timezone.id || 'N/A' }}</div>
                  <div class="sub-val">
                    UTC {{ result.timezone.utc }} · {{ result.timezone.current_time }}
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="!loading" class="empty-view">
              <div class="ghost-icon">📍</div>
              <p>输入任意 IPv4 地址或点击“查询本机”<br />获取详细的地理位置映射数据。</p>
            </div>

            <div v-else class="loading-view">
              <div class="loader-vibe">数据注入中...</div>
            </div>
          </div>
        </section>

        <!-- Technical Tips -->
        <section class="brutal-pane info-pane">
          <div class="pane-header bg-pink">
            <span>🛡 技术说明 (TECH)</span>
          </div>
          <div class="pane-body">
            <p class="brutal-text">
              1. 本工具依赖 Ipwhois 和 IP.SB 公共接口。<br />
              2. 地理定位基于运营商 BGP 数据，并非实时 GPS 精确位置。<br />
              3. 目前仅支持 IPv4 协议的归属地分析。<br />
              4. 纯前端请求，不记录或存储任何查询日志。
            </p>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';

  interface IpResult {
    ip: string;
    type: string;
    flag: { emoji: string };
    country: string;
    country_translation?: string;
    region: string;
    city: string;
    country_code: string;
    connection: {
      isp: string;
      org: string;
    };
    latitude: number;
    longitude: number;
    timezone: { id: string; utc: string; current_time: string };
  }

  const ipInput = ref('');
  const loading = ref(false);
  const errorMsg = ref('');
  const result = ref<IpResult | null>(null);

  const isValidIp = computed(() => {
    if (!ipInput.value) return true;
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    return ipv4Regex.test(ipInput.value);
  });

  const setIp = (val: string) => {
    ipInput.value = val;
    fetchInfo();
  };

  const queryMyIp = () => {
    ipInput.value = '';
    fetchInfo();
  };

  const fetchInfo = async () => {
    if (ipInput.value && !isValidIp.value) {
      errorMsg.value = 'IP 地址格式不正确';
      return;
    }

    loading.value = true;
    errorMsg.value = '';
    result.value = null;

    const input = ipInput.value.trim();

    const tryFetch = async (url: string) => {
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

    const getFlagEmoji = (cc: string) => {
      if (!cc) return '🌐';
      return cc
        .toUpperCase()
        .replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
    };

    try {
      try {
        // Primary API: IP.SB
        const url = `https://api.ip.sb/geoip/${input}`;
        const data = await tryFetch(url);
        result.value = {
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
      } catch {
        // Fallback: IPWho.is
        const url = 'https://ipwho.is/' + input;
        const data = await tryFetch(url);
        if (!data.success) throw new Error(data.message);
        result.value = { ...data, flag: { emoji: getFlagEmoji(data.country_code) } };
      }
    } catch (e: unknown) {
      errorMsg.value = (e instanceof Error ? e.message : '') || '查询失败，可能是接口限制';
    } finally {
      loading.value = false;
    }
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
    max-width: 1200px;
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
    text-shadow: 4px 4px 0px #0ea5e9;
  }

  .brutal-title span {
    color: #0ea5e9;
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
    background: #0ea5e9;
    color: #fff;
    padding: 0.5rem 1.2rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    border: 4px solid #111;
    box-shadow: 5px 5px 0px #111;
  }

  /* Grid Layout */
  .brutal-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2.5rem;
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
    padding: 0.8rem 1.2rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1.1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .bg-yellow {
    background: #ffd900;
  }
  .bg-blue {
    background: #0ea5e9;
  }
  .bg-pink {
    background: #ff7be5;
  }

  .pane-body {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* Search & Input */
  .search-input-group {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  .brutal-input {
    flex: 1;
    min-width: 280px;
    border: 4px solid #111;
    padding: 1.2rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1.5rem;
    font-weight: 700;
    background: #fff;
    box-shadow: 6px 6px 0px #111;
    outline: none;
  }

  .brutal-input.error {
    border-color: #ff4b4b;
    background: #fff5f5;
  }

  .search-submit {
    background: #111 !important;
    color: #fff !important;
    font-size: 1.2rem !important;
  }

  .quick-links {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-top: 1rem;
  }

  .small-brutal-btn {
    background: #fff;
    border: 2px solid #111;
    padding: 0.4rem 1rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 0.85rem;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
  }
  .small-brutal-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  /* Result Content */
  .ip-hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2.5rem;
    background: #f8fafc;
    border: 3px solid #111;
    margin-bottom: 2rem;
    position: relative;
  }

  .ip-type-tag {
    position: absolute;
    top: 1rem;
    right: 1.5rem;
    background: #111;
    color: #fff;
    font-weight: 900;
    padding: 2px 8px;
    font-size: 0.7rem;
  }

  .ip-display {
    font-size: 4rem;
    font-weight: 900;
    margin: 0;
    letter-spacing: -2px;
    word-break: break-all;
    text-align: center;
  }

  .info-matrix {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 2rem;
  }

  .info-item {
    padding: 1.5rem;
    background: #fff;
    border: 3px solid #111;
    box-shadow: 6px 6px 0px #111;
  }

  .info-item label {
    display: block;
    font-size: 0.75rem;
    font-weight: 900;
    color: #888;
    text-transform: uppercase;
    margin-bottom: 0.75rem;
    border-bottom: 2px solid #eee;
    padding-bottom: 0.25rem;
  }

  .info-item .value {
    font-size: 1.25rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    line-height: 1.3;
  }

  .flag-emoji {
    font-size: 1.5rem;
    margin-right: 0.5rem;
    vertical-align: middle;
  }

  .sub-val {
    font-size: 0.8rem;
    font-weight: 600;
    color: #666;
  }

  .map-link {
    display: inline-block;
    margin-top: 1rem;
    color: #0ea5e9;
    font-weight: 800;
    text-decoration: underline;
    text-decoration-thickness: 3px;
    text-underline-offset: 4px;
  }

  /* Views */
  .empty-view,
  .loading-view {
    padding: 5rem 0;
    text-align: center;
    color: #aaa;
  }

  .ghost-icon {
    font-size: 5rem;
    margin-bottom: 1.5rem;
    opacity: 0.3;
  }

  .error-banner {
    background: #ff4b4b;
    color: #fff;
    padding: 1rem 1.5rem;
    border: 3px solid #111;
    font-weight: 800;
    box-shadow: 4px 4px 0px #111;
    margin-top: 2rem;
  }

  .rotate {
    animation: spin 1s linear infinite;
    display: inline-block;
  }
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .brutal-text {
    font-size: 0.95rem;
    line-height: 1.8;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    .ip-display {
      font-size: 2.5rem;
    }
    .search-input-group {
      flex-direction: column;
    }
    .brutal-input {
      min-width: auto;
    }
  }

  /* Dark Mode */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }

  [data-theme='dark'] .brutal-pane {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 10px 10px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .brutal-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .search-submit {
    background: #eee !important;
    color: #111 !important;
  }
  [data-theme='dark'] .brutal-input {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .small-brutal-btn {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
    color: #eee;
  }
  [data-theme='dark'] .info-item {
    background: #222;
    border-color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .ip-hero {
    background: #1a1a1a;
    border-color: #eee;
  }
  [data-theme='dark'] .ip-type-tag {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .badge {
    border-color: #eee;
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .bg-blue {
    background: #075985;
    color: #fff;
  }
</style>
