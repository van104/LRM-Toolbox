<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="goBack"
          ><el-icon> <ArrowLeft /> </el-icon><span>返回</span></el-button
        >
      </div>
      <div class="header-center">
        <h1 class="tool-title">本地网络信息</h1>
        <span class="tool-subtitle">My Network Info</span>
      </div>
      <div class="header-right">
        <el-button type="primary" :loading="loading" @click="refreshAll">
          <el-icon>
            <Refresh />
          </el-icon>
          刷新
        </el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="info-grid">
        <div class="info-card glass-card primary">
          <div class="card-header">
            <el-icon class="card-icon">
              <Connection />
            </el-icon>
            <span>公网 IP</span>
          </div>
          <div class="card-body">
            <div v-if="publicIp" class="ip-display">{{ publicIp }}</div>
            <div v-else-if="loadingPublicIp" class="ip-display loading">获取中...</div>
            <div v-else class="ip-display error">获取失败</div>
            <div v-if="ipInfo" class="ip-location">
              <el-icon>
                <Location />
              </el-icon>
              {{ ipInfo.city || '' }} {{ ipInfo.region || '' }}, {{ ipInfo.country || '' }}
            </div>
            <div v-if="ipInfo" class="ip-detail">
              <span>ISP: {{ ipInfo.org || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="info-card glass-card">
          <div class="card-header">
            <el-icon class="card-icon">
              <Monitor />
            </el-icon>
            <span>设备信息</span>
          </div>
          <div class="card-body">
            <div class="info-row">
              <span class="label">屏幕分辨率</span>
              <span class="value">{{ screenInfo.width }} × {{ screenInfo.height }}</span>
            </div>
            <div class="info-row">
              <span class="label">可用区域</span>
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

        <div class="info-card glass-card">
          <div class="card-header">
            <el-icon class="card-icon">
              <ChromeFilled />
            </el-icon>
            <span>浏览器信息</span>
          </div>
          <div class="card-body">
            <div class="info-row">
              <span class="label">浏览器</span>
              <span class="value">{{ browserInfo.name }} {{ browserInfo.version }}</span>
            </div>
            <div class="info-row">
              <span class="label">语言</span>
              <span class="value">{{ browserInfo.language }}</span>
            </div>
            <div class="info-row">
              <span class="label">平台</span>
              <span class="value">{{ browserInfo.platform }}</span>
            </div>
            <div class="info-row">
              <span class="label">Cookie 启用</span>
              <span class="value">{{ browserInfo.cookieEnabled ? '是' : '否' }}</span>
            </div>
            <div class="info-row">
              <span class="label">在线状态</span>
              <span class="value" :class="{ online: browserInfo.online }">{{
                browserInfo.online ? '在线' : '离线'
              }}</span>
            </div>
          </div>
        </div>

        <div class="info-card glass-card">
          <div class="card-header">
            <el-icon class="card-icon">
              <Promotion />
            </el-icon>
            <span>网络连接</span>
          </div>
          <div class="card-body">
            <div class="info-row">
              <span class="label">连接类型</span>
              <span class="value">{{ connectionInfo.type || '未知' }}</span>
            </div>
            <div class="info-row">
              <span class="label">有效类型</span>
              <span class="value">{{ connectionInfo.effectiveType || '未知' }}</span>
            </div>
            <div class="info-row">
              <span class="label">下行速度</span>
              <span class="value">{{
                connectionInfo.downlink ? connectionInfo.downlink + ' Mbps' : '未知'
              }}</span>
            </div>
            <div class="info-row">
              <span class="label">往返延迟</span>
              <span class="value">{{
                connectionInfo.rtt ? connectionInfo.rtt + ' ms' : '未知'
              }}</span>
            </div>
            <div class="info-row">
              <span class="label">省流模式</span>
              <span class="value">{{ connectionInfo.saveData ? '开启' : '关闭' }}</span>
            </div>
          </div>
        </div>

        <div class="info-card glass-card">
          <div class="card-header">
            <el-icon class="card-icon">
              <Clock />
            </el-icon>
            <span>时间信息</span>
          </div>
          <div class="card-body">
            <div class="info-row">
              <span class="label">本地时间</span>
              <span class="value">{{ timeInfo.localTime }}</span>
            </div>
            <div class="info-row">
              <span class="label">时区</span>
              <span class="value">{{ timeInfo.timezone }}</span>
            </div>
            <div class="info-row">
              <span class="label">UTC 偏移</span>
              <span class="value">{{ timeInfo.utcOffset }}</span>
            </div>
          </div>
        </div>

        <div v-if="batteryInfo.supported" class="info-card glass-card">
          <div class="card-header">
            <el-icon class="card-icon">
              <Opportunity />
            </el-icon>
            <span>电池状态</span>
          </div>
          <div class="card-body">
            <div class="battery-display">
              <div
                class="battery-level"
                :style="{ width: batteryInfo.level + '%' }"
                :class="{ charging: batteryInfo.charging, low: batteryInfo.level < 20 }"
              ></div>
              <span class="battery-text">{{ batteryInfo.level }}%</span>
            </div>
            <div class="info-row">
              <span class="label">充电状态</span>
              <span class="value">{{ batteryInfo.charging ? '正在充电' : '未充电' }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="ua-section glass-card">
        <h3>User Agent</h3>
        <div class="ua-content">{{ userAgent }}</div>
        <el-button text type="primary" @click="copyUA">复制</el-button>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - 本地网络信息</footer>
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import {
    ArrowLeft,
    Refresh,
    Connection,
    Monitor,
    ChromeFilled,
    Promotion,
    Clock,
    Location,
    Opportunity
  } from '@element-plus/icons-vue';

  const router = useRouter();
  const goBack = () => router.back();

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

  const timeInfo = reactive({
    localTime: '',
    timezone: '',
    utcOffset: ''
  });

  const batteryInfo = reactive({
    supported: false,
    level: 100,
    charging: false
  });

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
    timeInfo.localTime = now.toLocaleString('zh-CN');
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

  import { useCopy } from '@/composables/useCopy';

  const { copyToClipboard } = useCopy();

  const copyUA = () => {
    copyToClipboard(userAgent.value, { success: '已复制到剪贴板' });
  };

  onMounted(() => {
    getScreenInfo();
    getBrowserInfo();
    getConnectionInfo();
    getTimeInfo();
    getBatteryInfo();
    getPublicIp();
    timeInterval = setInterval(getTimeInfo, 1000);
  });

  onUnmounted(() => {
    if (timeInterval) clearInterval(timeInterval);
  });
</script>

<style scoped>
  .tool-page {
    min-height: 100vh;
    background: #f1f5f9;
    display: flex;
    flex-direction: column;
  }

  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 100;
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
    padding: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .info-card {
    padding: 1.25rem;
  }

  .info-card.primary {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
  }

  .info-card.primary .card-header,
  .info-card.primary .label {
    color: rgba(255, 255, 255, 0.8);
  }

  .info-card.primary .value {
    color: white;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 1rem;
  }

  .card-icon {
    font-size: 1.25rem;
  }

  .ip-display {
    font-size: 1.75rem;
    font-weight: 700;
    font-family: 'Consolas', monospace;
    margin-bottom: 0.5rem;
  }

  .ip-display.loading {
    opacity: 0.7;
    font-size: 1rem;
  }

  .ip-display.error {
    color: #fca5a5;
    font-size: 1rem;
  }

  .ip-location {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.9rem;
    opacity: 0.9;
    margin-bottom: 0.25rem;
  }

  .ip-detail {
    font-size: 0.8rem;
    opacity: 0.7;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid #f1f5f9;
  }

  .info-row:last-child {
    border-bottom: none;
  }

  .label {
    font-size: 0.85rem;
    color: #64748b;
  }

  .value {
    font-size: 0.85rem;
    font-weight: 600;
    color: #1e293b;
    font-family: 'Consolas', monospace;
  }

  .value.online {
    color: #16a34a;
  }

  .battery-display {
    position: relative;
    height: 32px;
    background: #e2e8f0;
    border-radius: 6px;
    margin-bottom: 0.75rem;
    overflow: hidden;
  }

  .battery-level {
    height: 100%;
    background: linear-gradient(90deg, #22c55e, #16a34a);
    transition: width 0.3s;
  }

  .battery-level.charging {
    background: linear-gradient(90deg, #3b82f6, #2563eb);
  }

  .battery-level.low {
    background: linear-gradient(90deg, #ef4444, #dc2626);
  }

  .battery-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-weight: 600;
    font-size: 0.85rem;
    color: #1e293b;
  }

  .ua-section {
    padding: 1.25rem;
  }

  .ua-section h3 {
    margin: 0 0 0.75rem;
    font-size: 0.9rem;
    color: #64748b;
  }

  .ua-content {
    font-size: 0.8rem;
    color: #475569;
    background: #f8fafc;
    padding: 1rem;
    border-radius: 8px;
    word-break: break-all;
    line-height: 1.6;
    font-family: 'Consolas', monospace;
    margin-bottom: 0.75rem;
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  @media (max-width: 992px) {
    .info-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 640px) {
    .info-grid {
      grid-template-columns: 1fr;
    }
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }
</style>
