<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <!-- Header -->
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">Network<span>.本机()</span></h1>
        <div class="badge">🌐 本网探针</div>
        <button class="brutal-btn refresh-btn" :class="{ rotating: loading }" @click="refreshAll">
          ↻ 刷新状态
        </button>
      </header>

      <!-- 主要网格 -->
      <div class="info-grid">
        <!-- 核心：大卡公网 IP -->
        <div class="info-card brutal-pane bg-blue highlight-card">
          <div class="pane-header">
            <span>🌐 公网 IP (Public IP)</span>
          </div>
          <div class="card-body">
            <div v-if="publicIp" class="ip-large">{{ publicIp }}</div>
            <div v-else-if="loadingPublicIp" class="ip-large loading">获取中...</div>
            <div v-else class="ip-large error">获取失败</div>

            <div v-if="ipInfo" class="ip-location">
              📍 {{ ipInfo.city || '' }} {{ ipInfo.region || '' }}, {{ ipInfo.country || '' }}
            </div>
            <div v-if="ipInfo" class="ip-isp">🏢 ISP: {{ ipInfo.org || '未知' }}</div>
          </div>
        </div>

        <!-- 设备信息 -->
        <div class="info-card brutal-pane">
          <div class="pane-header bg-yellow">
            <span>💻 设备信息 (Display)</span>
          </div>
          <div class="card-body">
            <div class="info-row">
              <span class="label">屏幕分辨率</span>
              <span class="value">{{ screenInfo.width }} × {{ screenInfo.height }}</span>
            </div>
            <div class="info-row">
              <span class="label">可用显示区域</span>
              <span class="value">{{ screenInfo.availWidth }} × {{ screenInfo.availHeight }}</span>
            </div>
            <div class="info-row">
              <span class="label">设备像素比</span>
              <span class="value">{{ screenInfo.pixelRatio }}x</span>
            </div>
            <div class="info-row">
              <span class="label">色彩深度</span>
              <span class="value">{{ screenInfo.colorDepth }} bit</span>
            </div>
          </div>
        </div>

        <!-- 连接信息 -->
        <div class="info-card brutal-pane">
          <div class="pane-header bg-green">
            <span>📡 网络连接 (Connection)</span>
          </div>
          <div class="card-body">
            <div class="info-row">
              <span class="label">连接类型</span>
              <span class="value">{{ connectionInfo.type || '—' }}</span>
            </div>
            <div class="info-row">
              <span class="label">有效网络级别</span>
              <span class="value tag">{{ connectionInfo.effectiveType || '—' }}</span>
            </div>
            <div class="info-row">
              <span class="label">下行速率评估</span>
              <span class="value">{{
                connectionInfo.downlink ? connectionInfo.downlink + ' Mbps' : '—'
              }}</span>
            </div>
            <div class="info-row">
              <span class="label">往返延迟(RTT)</span>
              <span class="value">{{ connectionInfo.rtt ? connectionInfo.rtt + ' ms' : '—' }}</span>
            </div>
          </div>
        </div>

        <!-- 浏览器状态 -->
        <div class="info-card brutal-pane">
          <div class="pane-header bg-orange">
            <span>🧭 浏览器 (Browser)</span>
          </div>
          <div class="card-body">
            <div class="info-row">
              <span class="label">当前浏览器</span>
              <span class="value strong">{{ browserInfo.name }} {{ browserInfo.version }}</span>
            </div>
            <div class="info-row">
              <span class="label">前端语言</span>
              <span class="value">{{ browserInfo.language }}</span>
            </div>
            <div class="info-row">
              <span class="label">客户端平台</span>
              <span class="value">{{ browserInfo.platform }}</span>
            </div>
            <div class="info-row">
              <span class="label">联网状态</span>
              <span :class="['value tag', browserInfo.online ? 'ok' : 'err']">
                {{ browserInfo.online ? 'Online 在线' : 'Offline 离线' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 电池与时间 -->
        <div class="info-card brutal-pane">
          <div class="pane-header bg-pink">
            <span>🔋 环境信息 (Env & Time)</span>
          </div>
          <div class="card-body">
            <div v-if="batteryInfo.supported" class="battery-section">
              <div class="info-row pb-0">
                <span class="label">电池余量</span>
                <span class="value"
                  >{{ batteryInfo.level }}% ({{ batteryInfo.charging ? '充电中' : '放电中' }})</span
                >
              </div>
              <div class="battery-box">
                <div
                  class="battery-fill"
                  :class="{ charging: batteryInfo.charging, low: batteryInfo.level < 20 }"
                  :style="{ width: batteryInfo.level + '%' }"
                ></div>
              </div>
            </div>
            <div class="info-row">
              <span class="label">本地时间</span>
              <span class="value time-val">{{ timeInfo.localTime }}</span>
            </div>
            <div class="info-row">
              <span class="label">所在时区</span>
              <span class="value">{{ timeInfo.timezone }} ({{ timeInfo.utcOffset }})</span>
            </div>
          </div>
        </div>
      </div>

      <!-- UA 字符串 -->
      <div class="ua-pane brutal-pane">
        <div class="pane-header">
          <span>🏷️ 完整 User Agent</span>
          <button class="action-btn" @click="copyUA">📋 复制</button>
        </div>
        <div class="ua-content">{{ userAgent }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted, onUnmounted } from 'vue';
  import { useCopy } from '@/composables/useCopy';

  const { copyToClipboard } = useCopy();

  const loading = ref(false);
  const loadingPublicIp = ref(true);
  const publicIp = ref('');
  const ipInfo = ref(null);
  const userAgent = ref('');

  const screenInfo = reactive({
    width: 0,
    height: 0,
    availWidth: 0,
    availHeight: 0,
    pixelRatio: 1,
    colorDepth: 24
  });
  const browserInfo = reactive({
    name: '',
    version: '',
    language: '',
    platform: '',
    cookieEnabled: false,
    online: true
  });
  const connectionInfo = reactive({
    type: '',
    effectiveType: '',
    downlink: 0,
    rtt: 0,
    saveData: false
  });
  const timeInfo = reactive({ localTime: '', timezone: '', utcOffset: '' });
  const batteryInfo = reactive({ supported: false, level: 100, charging: false });

  let timeInterval = null;

  const getScreenInfo = () => {
    screenInfo.width = window.screen.width;
    screenInfo.height = window.screen.height;
    screenInfo.availWidth = window.screen.availWidth;
    screenInfo.availHeight = window.screen.availHeight;
    screenInfo.pixelRatio = window.devicePixelRatio || 1;
    screenInfo.colorDepth = window.screen.colorDepth;
  };

  const getBrowserInfo = () => {
    userAgent.value = navigator.userAgent;
    browserInfo.language = navigator.language;
    browserInfo.platform = navigator.platform;
    browserInfo.cookieEnabled = navigator.cookieEnabled;
    browserInfo.online = navigator.onLine;

    const ua = navigator.userAgent;
    if (/Edg\/(\d+)/.test(ua)) {
      browserInfo.name = 'Edge';
      browserInfo.version = RegExp.$1;
    } else if (/Chrome\/(\d+)/.test(ua)) {
      browserInfo.name = 'Chrome';
      browserInfo.version = RegExp.$1;
    } else if (/Firefox\/(\d+)/.test(ua)) {
      browserInfo.name = 'Firefox';
      browserInfo.version = RegExp.$1;
    } else if (/Safari\/(\d+)/.test(ua) && !/Chrome/.test(ua)) {
      browserInfo.name = 'Safari';
      browserInfo.version = RegExp.$1;
    } else {
      browserInfo.name = 'Unknown';
      browserInfo.version = '';
    }
  };

  const getConnectionInfo = () => {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
      connectionInfo.type = conn.type || '';
      connectionInfo.effectiveType = conn.effectiveType || '';
      connectionInfo.downlink = conn.downlink || 0;
      connectionInfo.rtt = conn.rtt || 0;
      connectionInfo.saveData = conn.saveData || false;
    }
  };

  const getTimeInfo = () => {
    const now = new Date();
    timeInfo.localTime = now.toLocaleString('zh-CN', { hour12: false });
    timeInfo.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = -now.getTimezoneOffset();
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    timeInfo.utcOffset = `UTC${offset >= 0 ? '+' : '-'}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const getBatteryInfo = async () => {
    if ('getBattery' in navigator) {
      try {
        const battery = await navigator.getBattery();
        batteryInfo.supported = true;
        batteryInfo.level = Math.round(battery.level * 100);
        batteryInfo.charging = battery.charging;
        battery.addEventListener('levelchange', () => {
          batteryInfo.level = Math.round(battery.level * 100);
        });
        battery.addEventListener('chargingchange', () => {
          batteryInfo.charging = battery.charging;
        });
      } catch {
        batteryInfo.supported = false;
      }
    }
  };

  const getPublicIp = async () => {
    loadingPublicIp.value = true;
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      publicIp.value = data.ip;
      ipInfo.value = {
        city: data.city,
        region: data.region,
        country: data.country_name,
        org: data.org
      };
    } catch {
      try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        publicIp.value = data.ip;
      } catch {
        publicIp.value = '';
      }
    }
    loadingPublicIp.value = false;
  };

  const refreshAll = async () => {
    loading.value = true;
    getScreenInfo();
    getBrowserInfo();
    getConnectionInfo();
    getTimeInfo();
    await getPublicIp();
    loading.value = false;
  };

  const copyUA = () => {
    if (userAgent.value) copyToClipboard(userAgent.value, { success: '✔ UA 已经复制' });
  };

  onMounted(() => {
    refreshAll();
    getBatteryInfo();
    timeInterval = setInterval(getTimeInfo, 1000);
  });

  onUnmounted(() => {
    if (timeInterval) clearInterval(timeInterval);
  });
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
    text-shadow: 4px 4px 0px #3b82f6;
  }

  .brutal-title span {
    color: #3b82f6;
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

  .refresh-btn {
    background: #ffd900;
  }
  .refresh-btn.rotating {
    pointer-events: none;
    opacity: 0.8;
  }

  .badge {
    background: #3b82f6;
    color: #fff;
    padding: 0.5rem 1.2rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    border: 4px solid #111;
    box-shadow: 5px 5px 0px #111;
  }

  /* Grid Layout */
  .info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-areas:
      'h h .'
      '. . .';
    gap: 1.5rem;
  }

  .highlight-card {
    grid-area: h;
  }

  .brutal-pane {
    display: flex;
    flex-direction: column;
    border: 4px solid #111;
    background: #fff;
    box-shadow: 8px 8px 0px #111;
  }

  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1rem;
  }

  .bg-blue {
    background: #3b82f6;
    color: #fff;
  }
  .bg-yellow {
    background: #ffd900;
    color: #111;
  }
  .bg-green {
    background: #00e572;
    color: #111;
  }
  .bg-orange {
    background: #ff7c2e;
    color: #fff;
  }
  .bg-pink {
    background: #ff7be5;
    color: #111;
  }

  .card-body {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    flex: 1;
  }

  /* IP Large Display */
  .highlight-card .card-body {
    padding: 1.5rem;
    justify-content: center;
    background: #111;
  }
  .highlight-card .pane-header {
    border-bottom-color: #111;
  }
  .ip-large {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 2.5rem;
    font-weight: 900;
    color: #00e572;
    line-height: 1.2;
    text-shadow: 2px 2px 0px rgba(0, 229, 114, 0.3);
  }
  .ip-location {
    color: #fdfae5;
    font-size: 1.1rem;
    font-weight: 700;
    margin-top: 0.5rem;
  }
  .ip-isp {
    color: #aaa;
    font-size: 0.9rem;
    font-family: 'IBM Plex Mono', monospace;
    margin-top: 0.2rem;
  }

  /* Rows */
  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 0.5rem 0;
    border-bottom: 2px dashed #eee;
  }
  .info-row:last-child {
    border-bottom: none;
  }
  .info-row.pb-0 {
    border-bottom: none;
    padding-bottom: 0;
  }

  .label {
    font-size: 0.85rem;
    font-weight: 800;
    color: #888;
    text-transform: uppercase;
  }
  .value {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1rem;
    font-weight: 700;
    color: #111;
    text-align: right;
    word-break: break-all;
  }
  .value.strong {
    color: #3b82f6;
  }

  .value.tag {
    padding: 0.1rem 0.5rem;
    border: 2px solid #111;
    background: #eee;
    font-size: 0.8rem;
    box-shadow: 2px 2px 0px #111;
  }
  .value.tag.ok {
    background: #00e572;
    color: #111;
  }
  .value.tag.err {
    background: #ff4b4b;
    color: #fff;
  }

  .time-val {
    color: #9b59b6;
  }

  /* Battery */
  .battery-section {
    margin-bottom: 0.5rem;
  }
  .battery-box {
    margin-top: 0.5rem;
    height: 16px;
    border: 3px solid #111;
    position: relative;
    background: #eee;
    border-radius: 2px;
  }
  .battery-box::after {
    content: '';
    position: absolute;
    right: -6px;
    top: 2px;
    width: 4px;
    height: 6px;
    background: #111;
  }
  .battery-fill {
    height: 100%;
    background: #00e572;
    transition: width 0.3s;
  }
  .battery-fill.charging {
    background: #3b82f6;
  }
  .battery-fill.low {
    background: #ff4b4b;
  }

  /* UA Section */
  .ua-pane {
    margin-top: 1rem;
  }

  .action-btn {
    border: 2px solid #111;
    background: #ffd900;
    padding: 0.2rem 0.6rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 0.8rem;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.1s;
  }
  .action-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
  }

  .ua-content {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1rem;
    font-weight: 600;
    color: #111;
    padding: 1.25rem;
    background: #fdfae5;
    word-break: break-all;
    line-height: 1.5;
  }

  @media (max-width: 900px) {
    .info-grid {
      grid-template-columns: 1fr 1fr;
      grid-template-areas: 'h h';
    }
    .brutal-title {
      font-size: 2.2rem;
    }
    .ip-large {
      font-size: 2rem;
    }
  }

  @media (max-width: 600px) {
    .info-grid {
      grid-template-columns: 1fr;
      grid-template-areas: 'h';
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
  [data-theme='dark'] .refresh-btn {
    background: #b28f00;
    color: #fff;
  }

  [data-theme='dark'] .brutal-pane {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }

  [data-theme='dark'] .bg-blue {
    background: #1e3a8a;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-green {
    background: #007a3d;
    color: #fff;
  }
  [data-theme='dark'] .bg-orange {
    background: #c2410c;
  }
  [data-theme='dark'] .bg-pink {
    background: #9b2d87;
    color: #fff;
  }

  [data-theme='dark'] .highlight-card .card-body {
    background: #0f172a;
  }
  [data-theme='dark'] .highlight-card .pane-header {
    border-bottom-color: #eee;
  }

  [data-theme='dark'] .info-row {
    border-bottom-color: #333;
  }
  [data-theme='dark'] .label {
    color: #888;
  }
  [data-theme='dark'] .value {
    color: #eee;
  }
  [data-theme='dark'] .value.tag {
    border-color: #eee;
    background: #222;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .value.tag.ok {
    background: #007a3d;
    color: #fff;
  }

  [data-theme='dark'] .battery-box {
    border-color: #eee;
    background: #222;
  }
  [data-theme='dark'] .battery-box::after {
    background: #eee;
  }

  [data-theme='dark'] .ua-content {
    background: #222;
    color: #eee;
    border-top: 4px solid #eee;
  }
  [data-theme='dark'] .action-btn {
    background: #b28f00;
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
    color: #fff;
  }

  [data-theme='dark'] .badge {
    border-color: #eee;
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
</style>
