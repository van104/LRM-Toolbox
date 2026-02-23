<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <!-- Header -->
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">UA<span>.分析()</span></h1>
        <div class="badge">🕵️ User Agent</div>
      </header>

      <!-- 顶栏：输入区与快捷按钮 -->
      <div class="input-pane brutal-pane">
        <div class="pane-header bg-yellow">
          <span>📝 粘贴 User Agent 字符串</span>
          <div class="header-actions">
            <button class="action-btn get-btn" @click="useCurrentUA">⬇ 获取本机 UA</button>
            <button class="action-btn clear-btn" @click="clearUA">✕ 清空</button>
          </div>
        </div>
        <textarea
          v-model="uaString"
          class="ua-textarea"
          placeholder="在此粘贴 User Agent..."
          rows="3"
          spellcheck="false"
          @input="parseUA"
        ></textarea>
      </div>

      <!-- 本体布局区：解析区(大面积) + 示例区(窄侧栏) -->
      <div class="brutal-grid">
        <!-- 左侧：解析结果 -->
        <div class="result-area">
          <div v-if="result" class="result-content">
            <!-- 核心四格信息框 -->
            <div class="core-grid">
              <!-- 浏览器 -->
              <div class="core-card browser">
                <div class="cc-icon">🌐</div>
                <div class="cc-info">
                  <span class="cc-label">浏览器 Browser</span>
                  <strong class="cc-name">{{ result.browser.name || '未知' }}</strong>
                  <span class="cc-sub">版本: {{ result.browser.version || '—' }}</span>
                </div>
              </div>
              <!-- 操作系统 -->
              <div class="core-card os">
                <div class="cc-icon">💻</div>
                <div class="cc-info">
                  <span class="cc-label">系统 OS</span>
                  <strong class="cc-name">{{ result.os.name || '未知' }}</strong>
                  <span class="cc-sub">版本: {{ result.os.version || '—' }}</span>
                </div>
              </div>
              <!-- 设备类型 -->
              <div class="core-card device">
                <div class="cc-icon">📱</div>
                <div class="cc-info">
                  <span class="cc-label">设备 Device</span>
                  <strong class="cc-name">{{ result.device.type || '桌面设备' }}</strong>
                  <span class="cc-sub"
                    >{{ result.device.vendor || '—' }} {{ result.device.model || '' }}</span
                  >
                </div>
              </div>
              <!-- 渲染引擎 -->
              <div class="core-card engine">
                <div class="cc-icon">⚙️</div>
                <div class="cc-info">
                  <span class="cc-label">引擎 Engine</span>
                  <strong class="cc-name">{{ result.engine.name || '未知' }}</strong>
                  <span class="cc-sub">版本: {{ result.engine.version || '—' }}</span>
                </div>
              </div>
            </div>

            <!-- 数据明细列表 -->
            <div class="detail-pane brutal-pane">
              <div class="pane-header bg-green">
                <span>📋 详细数据映射 (Flat Results)</span>
                <button class="copy-results-btn" @click="copyResults">📋 复制</button>
              </div>
              <div class="detail-table-wrap">
                <div v-for="(value, key) in flatResult" :key="key" class="detail-row">
                  <div class="dt-key">{{ key }}</div>
                  <div class="dt-value">{{ value || '—' }}</div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <div class="empty-icon">🕵️</div>
            <p>等待输入 User Agent 字符串...</p>
          </div>
        </div>

        <!-- 右侧：示例侧边栏 -->
        <div class="examples-area brutal-pane">
          <div class="pane-header bg-orange">
            <span>✨ 常见 UA 示例</span>
          </div>
          <div class="example-list">
            <button
              v-for="(ua, idx) in uaExamples"
              :key="idx"
              class="example-card"
              @click="
                uaString = ua.value;
                parseUA();
              "
            >
              <span class="ex-name">{{ ua.name }}</span>
              <span class="ex-preview">{{ ua.value.substring(0, 48) }}...</span>
            </button>
          </div>
          <div class="tips-box">
            <h4 class="tips-title">💡 什么是 User Agent?</h4>
            <p>
              User Agent 简称
              UA，是客户端向服务器发送请求时所携带的用于表明系统及浏览器特征的一串特殊身份标识符。
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useCopy } from '@/composables/useCopy';

  const { copyToClipboard } = useCopy();
  const uaString = ref('');
  const result = ref(null);

  const copyResults = () => {
    if (!flatResult.value) return;
    const text = Object.entries(flatResult.value)
      .map(([key, value]) => `${key}: ${value || '-'}`)
      .join('\n');
    copyToClipboard(text, { success: '✔ 解析结果已复制' });
  };

  const uaExamples = [
    {
      name: 'Chrome Windows',
      value:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    {
      name: 'Safari macOS',
      value:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15'
    },
    {
      name: 'iPhone Safari',
      value:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'
    },
    {
      name: 'Android Chrome',
      value:
        'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36'
    },
    {
      name: 'Firefox Linux',
      value: 'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0'
    },
    {
      name: 'WeChat Bot',
      value:
        'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 Mobile Safari/537.36 MicroMessenger/8.0.22.2100'
    }
  ];

  const flatResult = computed(() => {
    if (!result.value) return {};
    return {
      浏览器名称: result.value.browser.name,
      浏览器版本: result.value.browser.version,
      操作系统: result.value.os.name,
      系统版本: result.value.os.version,
      设备类型: result.value.device.type || '桌面设备',
      设备厂商: result.value.device.vendor,
      设备型号: result.value.device.model,
      渲染引擎: result.value.engine.name,
      引擎版本: result.value.engine.version,
      'CPU 架构': result.value.cpu.architecture
    };
  });

  const parseUA = () => {
    if (!uaString.value.trim()) {
      result.value = null;
      return;
    }

    const ua = uaString.value;
    const browser = { name: '', version: '' };
    const os = { name: '', version: '' };
    const device = { type: '', vendor: '', model: '' };
    const engine = { name: '', version: '' };
    const cpu = { architecture: '' };

    if (/MicroMessenger\/(\d+[.\d]*)/.test(ua)) {
      browser.name = 'WeChat';
      browser.version = RegExp.$1;
    } else if (/Edg\/(\d+[.\d]*)/.test(ua)) {
      browser.name = 'Edge';
      browser.version = RegExp.$1;
    } else if (/OPR\/(\d+[.\d]*)/.test(ua)) {
      browser.name = 'Opera';
      browser.version = RegExp.$1;
    } else if (/Chrome\/(\d+[.\d]*)/.test(ua)) {
      browser.name = 'Chrome';
      browser.version = RegExp.$1;
    } else if (/Firefox\/(\d+[.\d]*)/.test(ua)) {
      browser.name = 'Firefox';
      browser.version = RegExp.$1;
    } else if (/Version\/(\d+[.\d]*).*Safari/.test(ua)) {
      browser.name = 'Safari';
      browser.version = RegExp.$1;
    } else if (/MSIE\s(\d+[.\d]*)/.test(ua)) {
      browser.name = 'IE';
      browser.version = RegExp.$1;
    } else if (/Trident.*rv:(\d+[.\d]*)/.test(ua)) {
      browser.name = 'IE';
      browser.version = RegExp.$1;
    }

    if (/Windows NT 10/.test(ua)) {
      os.name = 'Windows';
      os.version = '10/11';
    } else if (/Windows NT 6\.3/.test(ua)) {
      os.name = 'Windows';
      os.version = '8.1';
    } else if (/Windows NT 6\.2/.test(ua)) {
      os.name = 'Windows';
      os.version = '8';
    } else if (/Windows NT 6\.1/.test(ua)) {
      os.name = 'Windows';
      os.version = '7';
    } else if (/Mac OS X ([\d_]+)/.test(ua)) {
      os.name = 'macOS';
      os.version = RegExp.$1.replace(/_/g, '.');
    } else if (/Android ([\d.]+)/.test(ua)) {
      os.name = 'Android';
      os.version = RegExp.$1;
    } else if (/iPhone OS ([\d_]+)/.test(ua)) {
      os.name = 'iOS';
      os.version = RegExp.$1.replace(/_/g, '.');
    } else if (/iPad.*OS ([\d_]+)/.test(ua)) {
      os.name = 'iPadOS';
      os.version = RegExp.$1.replace(/_/g, '.');
    } else if (/Linux/.test(ua)) {
      os.name = 'Linux';
      os.version = '';
    }

    if (/Mobile|Android.*Mobile|iPhone/.test(ua)) device.type = '手机';
    else if (/iPad|Android(?!.*Mobile)|Tablet/.test(ua)) device.type = '平板';
    else if (/Smart-TV|SmartTV|GoogleTV|HbbTV/.test(ua)) device.type = '智能电视';
    else device.type = '桌面设备';

    if (/iPhone/.test(ua)) {
      device.vendor = 'Apple';
      device.model = 'iPhone';
    } else if (/iPad/.test(ua)) {
      device.vendor = 'Apple';
      device.model = 'iPad';
    } else if (/SM-([A-Z0-9]+)/.test(ua)) {
      device.vendor = 'Samsung';
      device.model = RegExp.$1;
    } else if (/Pixel\s?([\w]+)?/.test(ua)) {
      device.vendor = 'Google';
      device.model = 'Pixel ' + (RegExp.$1 || '');
    } else if (/Macintosh/.test(ua)) {
      device.vendor = 'Apple';
      device.model = 'Mac';
    }

    if (/AppleWebKit\/(\d+[.\d]*)/.test(ua)) {
      engine.name = 'WebKit';
      engine.version = RegExp.$1;
    } else if (/Gecko\/(\d+)/.test(ua)) {
      engine.name = 'Gecko';
      engine.version = RegExp.$1;
    } else if (/Trident\/(\d+[.\d]*)/.test(ua)) {
      engine.name = 'Trident';
      engine.version = RegExp.$1;
    }

    if (/x86_64|x64|Win64|WOW64/.test(ua)) cpu.architecture = 'x64';
    else if (/arm64|aarch64/.test(ua)) cpu.architecture = 'ARM64';
    else if (/arm/.test(ua)) cpu.architecture = 'ARM';
    else if (/i686|i386/.test(ua)) cpu.architecture = 'x86';

    result.value = { browser, os, device, engine, cpu };
  };

  const useCurrentUA = () => {
    uaString.value = navigator.userAgent;
    parseUA();
  };

  const clearUA = () => {
    uaString.value = '';
    result.value = null;
  };

  onMounted(useCurrentUA);
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
    text-shadow: 4px 4px 0px #f59e0b;
  }

  .brutal-title span {
    color: #f59e0b;
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

  .badge {
    background: #f59e0b;
    color: #fff;
    padding: 0.5rem 1.2rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    border: 4px solid #111;
    box-shadow: 5px 5px 0px #111;
  }

  /* General Pane */
  .brutal-pane {
    display: flex;
    flex-direction: column;
    border: 4px solid #111;
    background: #fff;
    box-shadow: 10px 10px 0px #111;
  }

  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 1.25rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    letter-spacing: 0.5px;
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

  /* Input Pane */
  .header-actions {
    display: flex;
    gap: 0.5rem;
  }

  .action-btn {
    border: 2px solid #111;
    background: #fff;
    padding: 0.3rem 0.8rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.85rem;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.1s;
  }

  .action-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
  }
  .action-btn:active {
    transform: translate(2px, 2px);
    box-shadow: 0px 0px 0px #111;
  }
  .get-btn {
    background: #111;
    color: #ffd900;
  }
  .clear-btn {
    background: #ff4b4b;
    color: #fff;
  }

  .ua-textarea {
    flex: 1;
    border: none;
    padding: 1.25rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1.1rem;
    color: #111;
    background: transparent;
    resize: vertical;
    outline: none;
    min-height: 80px;
    line-height: 1.6;
    word-break: break-all;
  }

  .ua-textarea:focus {
    background: #fdfae5;
  }
  .ua-textarea::-webkit-scrollbar {
    width: 10px;
  }
  .ua-textarea::-webkit-scrollbar-track {
    background: #fdfae5;
    border-left: 2px solid #111;
  }
  .ua-textarea::-webkit-scrollbar-thumb {
    background: #111;
  }

  /* Grid Layout */
  .brutal-grid {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 2rem;
    align-items: start;
  }

  /* Core 4 Cards */
  .core-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .core-card {
    border: 4px solid #111;
    background: #fff;
    padding: 1.25rem;
    display: flex;
    gap: 1rem;
    box-shadow: 6px 6px 0px #111;
    align-items: center;
  }

  .core-card.browser {
    background: #dbeafe;
  }
  .core-card.os {
    background: #dcfce7;
  }
  .core-card.device {
    background: #fef3c7;
  }
  .core-card.engine {
    background: #f3e8ff;
  }

  .cc-icon {
    font-size: 2.5rem;
    flex-shrink: 0;
    line-height: 1;
  }

  .cc-info {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .cc-label {
    font-size: 0.8rem;
    font-weight: 800;
    color: #555;
    text-transform: uppercase;
    margin-bottom: 2px;
  }
  .cc-name {
    font-size: 1.4rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    color: #111;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  .cc-sub {
    font-size: 0.85rem;
    font-weight: 600;
    color: #666;
    font-family: 'IBM Plex Mono', monospace;
    margin-top: 2px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  /* Detail Table */
  .copy-results-btn {
    border: 2px solid #111;
    background: #fff;
    padding: 0.2rem 0.6rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.8rem;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.1s;
  }

  .copy-results-btn:hover {
    background: #e0f2fe;
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
  }

  .detail-table-wrap {
    display: flex;
    flex-direction: column;
  }

  .detail-row {
    display: flex;
    border-bottom: 2px solid #eee;
    padding: 0.75rem 1.25rem;
  }

  .detail-row:last-child {
    border-bottom: none;
  }
  .detail-row:hover {
    background: #fdfae5;
  }

  .dt-key {
    flex: 0 0 120px;
    font-weight: 800;
    color: #555;
    font-size: 0.9rem;
    margin-top: 2px;
  }
  .dt-value {
    flex: 1;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1.05rem;
    font-weight: 700;
    color: #111;
    word-break: break-all;
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: 4rem;
    border: 4px dashed #aaa;
    font-weight: 700;
    color: #888;
  }
  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  /* Examples Area */
  .example-list {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    gap: 0.8rem;
  }

  .example-card {
    display: flex;
    flex-direction: column;
    padding: 0.85rem 1rem;
    background: #fff;
    border: 3px solid #111;
    text-align: left;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
  }

  .example-card:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
    background: #e0f2fe;
  }

  .ex-name {
    font-weight: 900;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1rem;
    color: #111;
    margin-bottom: 0.2rem;
  }
  .ex-preview {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.75rem;
    color: #666;
    font-weight: 600;
  }

  .tips-box {
    padding: 1.25rem;
    border-top: 4px solid #111;
    background: #fdfae5;
  }
  .tips-title {
    margin: 0 0 0.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1rem;
    font-weight: 900;
    color: #111;
  }
  .tips-box p {
    margin: 0;
    font-size: 0.85rem;
    color: #555;
    font-weight: 600;
    line-height: 1.6;
  }

  @media (max-width: 900px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .core-grid {
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
    background: #007a3d;
    color: #fff;
  }
  [data-theme='dark'] .bg-orange {
    background: #c2410c;
    color: #fff;
  }

  [data-theme='dark'] .ua-textarea {
    color: #eee;
  }
  [data-theme='dark'] .ua-textarea:focus {
    background: #222;
  }

  [data-theme='dark'] .core-card {
    border-color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .core-card.browser {
    background: #0f172a;
  }
  [data-theme='dark'] .core-card.os {
    background: #064e3b;
  }
  [data-theme='dark'] .core-card.device {
    background: #451a03;
  }
  [data-theme='dark'] .core-card.engine {
    background: #3b0764;
  }

  [data-theme='dark'] .cc-name {
    color: #eee;
  }
  [data-theme='dark'] .cc-label,
  [data-theme='dark'] .cc-sub {
    color: #aaa;
  }

  [data-theme='dark'] .action-btn {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .get-btn {
    background: #b28f00;
    color: #111;
  }
  [data-theme='dark'] .clear-btn {
    background: #991b1b;
  }

  [data-theme='dark'] .copy-results-btn {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .copy-results-btn:hover {
    background: #333;
  }

  [data-theme='dark'] .detail-row {
    border-bottom-color: #333;
  }
  [data-theme='dark'] .detail-row:hover {
    background: #222;
  }
  [data-theme='dark'] .dt-key {
    color: #aaa;
  }
  [data-theme='dark'] .dt-value {
    color: #eee;
  }

  [data-theme='dark'] .example-card {
    border-color: #eee;
    background: #222;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .example-card:hover {
    background: #333;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .ex-name {
    color: #eee;
  }
  [data-theme='dark'] .ex-preview {
    color: #888;
  }

  [data-theme='dark'] .tips-box {
    border-top-color: #eee;
    background: #1a1a1a;
  }
  [data-theme='dark'] .tips-title {
    color: #eee;
  }
  [data-theme='dark'] .tips-box p {
    color: #aaa;
  }

  [data-theme='dark'] .empty-state {
    border-color: #555;
  }

  [data-theme='dark'] .badge {
    border-color: #eee;
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
</style>
