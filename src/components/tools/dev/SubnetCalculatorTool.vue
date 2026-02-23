<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <!-- Header -->
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">Subnet<span>.计算()</span></h1>
        <div class="badge">🌐 IP / CIDR</div>
      </header>

      <!-- IP 输入区 -->
      <div class="input-bar">
        <div class="input-group">
          <label class="input-label">IP 地址</label>
          <input
            v-model="ipAddress"
            class="brutal-input ip-input"
            placeholder="192.168.1.0"
            @input="calculate"
          />
        </div>
        <span class="slash">/</span>
        <div class="input-group cidr-group">
          <label class="input-label">CIDR</label>
          <select v-model.number="cidr" class="brutal-select" @change="calculate">
            <option v-for="n in 32" :key="n" :value="n">/{{ n }}</option>
          </select>
        </div>
      </div>

      <!-- 快捷掩码 -->
      <div class="mask-bar">
        <span class="mask-label">常用掩码：</span>
        <button
          v-for="c in [8, 16, 24, 25, 26, 27, 28, 29, 30]"
          :key="c"
          :class="['mask-btn', { active: cidr === c }]"
          @click="
            cidr = c;
            calculate();
          "
        >
          /{{ c }}
        </button>
      </div>

      <!-- 主布局 -->
      <div class="brutal-grid">
        <!-- 左：计算结果 -->
        <div class="brutal-pane result-pane">
          <div class="pane-header bg-green">
            <span>📊 计算结果</span>
          </div>

          <div v-if="result" class="result-body">
            <!-- 核心可视化 -->
            <div class="highlight-card">
              <div class="hl-row">
                <span class="hl-label">可用 IP 范围</span>
                <span class="hl-value">{{ result.firstHost }} — {{ result.lastHost }}</span>
              </div>
              <div class="hl-bar">
                <div class="hl-bar-fill" :style="{ width: hostBarWidth + '%' }"></div>
              </div>
              <div class="hl-hosts">
                <span
                  >🖥️ 可用主机: <strong>{{ result.totalHosts.toLocaleString() }}</strong></span
                >
                <span
                  >📦 总地址: <strong>{{ totalAddresses.toLocaleString() }}</strong></span
                >
              </div>
            </div>

            <!-- 详情网格 -->
            <div class="detail-grid">
              <div
                v-for="item in resultItems"
                :key="item.label"
                class="detail-item"
                @click="copy(item.value)"
              >
                <div class="detail-label">{{ item.label }}</div>
                <div :class="['detail-value', item.cls]">{{ item.value }}</div>
              </div>
            </div>

            <!-- 二进制掩码可视化 -->
            <div class="binary-section">
              <div class="binary-label">二进制子网掩码</div>
              <div class="binary-visual">
                <span
                  v-for="(bit, i) in binaryBits"
                  :key="i"
                  :class="['bit', bit === '1' ? 'on' : 'off', { sep: (i + 1) % 8 === 0 && i < 31 }]"
                  >{{ bit }}</span
                >
              </div>
            </div>
          </div>

          <div v-else class="empty-result">
            <div class="empty-icon">🌐</div>
            <p>请输入有效的 IP 地址</p>
          </div>
        </div>

        <!-- 右：CIDR 速查表 -->
        <div class="brutal-pane cidr-pane">
          <div class="pane-header bg-yellow">
            <span>📋 CIDR 速查表</span>
          </div>
          <div class="cidr-body">
            <div class="cidr-table-header">
              <span>CIDR</span>
              <span>掩码</span>
              <span>主机数</span>
            </div>
            <div
              v-for="item in cidrTable"
              :key="item.cidr"
              :class="['cidr-row', { active: cidr === item.cidr }]"
              @click="
                cidr = item.cidr;
                calculate();
              "
            >
              <span class="cidr-val">/{{ item.cidr }}</span>
              <span class="cidr-mask">{{ item.mask }}</span>
              <span class="cidr-hosts">{{ item.hosts }}</span>
            </div>
          </div>

          <!-- Tips -->
          <div class="tips-box">
            <div class="tips-title">💡 提示</div>
            <ul>
              <li>CIDR 表示法: IP/前缀长度</li>
              <li>前缀长度越大，子网越小</li>
              <li>/24 = 256 个地址 (254 可用)</li>
              <li>点击结果行可复制内容</li>
            </ul>
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

  const ipAddress = ref('192.168.1.0');
  const cidr = ref(24);
  const result = ref(null);

  const cidrTable = [
    { cidr: 8, mask: '255.0.0.0', hosts: '16,777,214' },
    { cidr: 16, mask: '255.255.0.0', hosts: '65,534' },
    { cidr: 24, mask: '255.255.255.0', hosts: '254' },
    { cidr: 25, mask: '255.255.255.128', hosts: '126' },
    { cidr: 26, mask: '255.255.255.192', hosts: '62' },
    { cidr: 27, mask: '255.255.255.224', hosts: '30' },
    { cidr: 28, mask: '255.255.255.240', hosts: '14' },
    { cidr: 29, mask: '255.255.255.248', hosts: '6' },
    { cidr: 30, mask: '255.255.255.252', hosts: '2' },
    { cidr: 31, mask: '255.255.255.254', hosts: '0' },
    { cidr: 32, mask: '255.255.255.255', hosts: '1' }
  ];

  const totalAddresses = computed(() => Math.pow(2, 32 - cidr.value));

  const hostBarWidth = computed(() => {
    if (!result.value) return 0;
    const max = 254;
    return Math.min((result.value.totalHosts / max) * 100, 100);
  });

  const binaryBits = computed(() => {
    if (!result.value) return [];
    return result.value.binaryMask.replace(/\./g, '').split('');
  });

  const resultItems = computed(() => {
    if (!result.value) return [];
    const r = result.value;
    return [
      { label: '网络地址', value: r.networkAddress },
      { label: '广播地址', value: r.broadcastAddress },
      { label: '子网掩码', value: r.subnetMask },
      { label: '通配符掩码', value: r.wildcardMask },
      { label: 'IP 类别', value: r.ipClass, cls: 'class-tag' },
      {
        label: '是否私有地址',
        value: r.isPrivate ? '是 (Private)' : '否 (Public)',
        cls: r.isPrivate ? 'private' : 'public'
      }
    ];
  });

  const ipToInt = ip => {
    const parts = ip.split('.').map(Number);
    return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
  };

  const intToIp = int => {
    return [(int >>> 24) & 255, (int >>> 16) & 255, (int >>> 8) & 255, int & 255].join('.');
  };

  const calculate = () => {
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipPattern.test(ipAddress.value)) {
      result.value = null;
      return;
    }
    const parts = ipAddress.value.split('.').map(Number);
    if (parts.some(p => p > 255)) {
      result.value = null;
      return;
    }

    const ip = ipToInt(ipAddress.value);
    const maskInt = (0xffffffff << (32 - cidr.value)) >>> 0;
    const wildcardInt = ~maskInt >>> 0;
    const networkInt = (ip & maskInt) >>> 0;
    const broadcastInt = (networkInt | wildcardInt) >>> 0;
    const totalAddr = Math.pow(2, 32 - cidr.value);
    const totalHosts = cidr.value >= 31 ? (cidr.value === 32 ? 1 : 0) : totalAddr - 2;
    const firstHost = cidr.value >= 31 ? intToIp(networkInt) : intToIp(networkInt + 1);
    const lastHost = cidr.value >= 31 ? intToIp(broadcastInt) : intToIp(broadcastInt - 1);

    const firstOctet = parts[0];
    let ipClass = 'E';
    if (firstOctet < 128) ipClass = 'A';
    else if (firstOctet < 192) ipClass = 'B';
    else if (firstOctet < 224) ipClass = 'C';
    else if (firstOctet < 240) ipClass = 'D (组播)';

    const isPrivate =
      firstOctet === 10 ||
      (firstOctet === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (firstOctet === 192 && parts[1] === 168) ||
      firstOctet === 127;

    const binaryMask = [
      ((maskInt >>> 24) & 255).toString(2).padStart(8, '0'),
      ((maskInt >>> 16) & 255).toString(2).padStart(8, '0'),
      ((maskInt >>> 8) & 255).toString(2).padStart(8, '0'),
      (maskInt & 255).toString(2).padStart(8, '0')
    ].join('.');

    result.value = {
      networkAddress: intToIp(networkInt),
      broadcastAddress: intToIp(broadcastInt),
      subnetMask: intToIp(maskInt),
      wildcardMask: intToIp(wildcardInt),
      firstHost,
      lastHost,
      totalHosts,
      ipClass,
      isPrivate,
      binaryMask
    };
  };

  const copy = text => {
    if (text) copyToClipboard(text, { success: '✔ 已复制: ' + text });
  };

  onMounted(calculate);
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
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

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

  .badge {
    background: #06b6d4;
    color: #fff;
    padding: 0.5rem 1.2rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    border: 4px solid #111;
    box-shadow: 5px 5px 0px #111;
  }

  /* Input bar */
  .input-bar {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
    border: 4px solid #111;
    background: #fff;
    padding: 1.25rem 1.5rem;
    box-shadow: 8px 8px 0px #111;
    flex-wrap: wrap;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .input-label {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #555;
  }

  .brutal-input {
    border: 3px solid #111;
    padding: 0.7rem 1rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1.3rem;
    font-weight: 700;
    background: #fdfae5;
    color: #111;
    outline: none;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
  }

  .ip-input {
    width: 260px;
  }
  .brutal-input:focus {
    background: #fff;
    transform: translate(-1px, -1px);
    box-shadow: 5px 5px 0px #111;
  }

  .slash {
    font-size: 2rem;
    font-weight: 900;
    color: #111;
    padding: 0 0.25rem;
    align-self: flex-end;
    line-height: 1;
    padding-bottom: 0.5rem;
  }

  .brutal-select {
    border: 3px solid #111;
    padding: 0.7rem 1rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1.3rem;
    font-weight: 700;
    background: #fdfae5;
    color: #111;
    outline: none;
    box-shadow: 4px 4px 0px #111;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
    width: 100px;
  }

  /* Mask bar */
  .mask-bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .mask-label {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.85rem;
    color: #555;
  }

  .mask-btn {
    border: 3px solid #111;
    background: #fff;
    padding: 0.35rem 0.7rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.1s;
  }

  .mask-btn:hover {
    background: #f0f0f0;
  }
  .mask-btn.active {
    background: #06b6d4;
    color: #fff;
  }

  /* Grid */
  .brutal-grid {
    display: grid;
    grid-template-columns: 1fr 340px;
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
    letter-spacing: 0.5px;
  }

  .bg-green {
    background: #00e572;
    color: #111;
  }
  .bg-yellow {
    background: #ffd900;
    color: #111;
  }

  /* Result */
  .result-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .highlight-card {
    background: #111;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .hl-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .hl-label {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 0.9rem;
    color: #888;
    text-transform: uppercase;
  }

  .hl-value {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1.2rem;
    font-weight: 700;
    color: #00e572;
  }

  .hl-bar {
    height: 8px;
    background: #333;
    border: 2px solid #555;
    position: relative;
  }

  .hl-bar-fill {
    height: 100%;
    background: #06b6d4;
    transition: width 0.3s;
    min-width: 2px;
  }

  .hl-hosts {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    color: #aaa;
  }

  .hl-hosts strong {
    color: #ffd900;
  }

  /* Detail grid */
  .detail-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0;
  }

  .detail-item {
    border: 2px solid #eee;
    padding: 0.85rem 1rem;
    cursor: pointer;
    transition: background 0.1s;
  }

  .detail-item:hover {
    background: #fdfae5;
  }

  .detail-label {
    font-size: 0.78rem;
    font-weight: 700;
    color: #888;
    text-transform: uppercase;
    margin-bottom: 0.3rem;
  }

  .detail-value {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1.05rem;
    font-weight: 700;
    color: #111;
  }

  .detail-value.private {
    color: #00a854;
  }
  .detail-value.public {
    color: #ff4b4b;
  }
  .detail-value.class-tag {
    color: #7c3aed;
  }

  /* Binary visual */
  .binary-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .binary-label {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 0.85rem;
    text-transform: uppercase;
    color: #555;
  }

  .binary-visual {
    display: flex;
    flex-wrap: wrap;
    gap: 1px;
  }

  .bit {
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.75rem;
    font-weight: 700;
    border: 1px solid #ddd;
  }

  .bit.on {
    background: #06b6d4;
    color: #fff;
    border-color: #06b6d4;
  }
  .bit.off {
    background: #f5f5f0;
    color: #aaa;
  }
  .bit.sep {
    margin-right: 6px;
  }

  /* Empty */
  .empty-result {
    padding: 3rem;
    text-align: center;
    color: #888;
    font-weight: 700;
  }
  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  /* CIDR side */
  .cidr-body {
    max-height: 420px;
    overflow-y: auto;
  }

  .cidr-table-header {
    display: grid;
    grid-template-columns: 1fr 2fr 1.5fr;
    padding: 0.6rem 1rem;
    font-weight: 900;
    font-size: 0.8rem;
    text-transform: uppercase;
    background: #fdfae5;
    border-bottom: 3px solid #111;
    font-family: 'Syne', sans-serif;
    position: sticky;
    top: 0;
  }

  .cidr-row {
    display: grid;
    grid-template-columns: 1fr 2fr 1.5fr;
    padding: 0.5rem 1rem;
    border-bottom: 2px solid #eee;
    font-size: 0.85rem;
    cursor: pointer;
    transition: background 0.1s;
  }

  .cidr-row:hover {
    background: #fdfae5;
  }
  .cidr-row.active {
    background: #06b6d4;
    color: #fff;
    font-weight: 700;
  }
  .cidr-row:last-child {
    border-bottom: none;
  }

  .cidr-val {
    font-weight: 700;
  }

  /* Tips */
  .tips-box {
    padding: 1rem 1.25rem;
    border-top: 3px solid #111;
  }

  .tips-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }

  .tips-box ul {
    margin: 0;
    padding-left: 1.25rem;
    font-size: 0.8rem;
    color: #666;
    line-height: 1.8;
  }

  @media (max-width: 900px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .brutal-title {
      font-size: 2rem;
    }
    .ip-input {
      width: 180px;
    }
    .detail-grid {
      grid-template-columns: 1fr;
    }
    .bit {
      width: 18px;
      height: 18px;
      font-size: 0.65rem;
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

  [data-theme='dark'] .input-bar {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .brutal-select {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-input:focus {
    background: #2a2a2a;
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .slash {
    color: #eee;
  }

  [data-theme='dark'] .mask-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .mask-btn.active {
    background: #0e7490;
  }

  [data-theme='dark'] .brutal-pane {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .bg-green {
    background: #007a3d;
    color: #fff;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }

  [data-theme='dark'] .highlight-card {
    background: #000;
  }
  [data-theme='dark'] .detail-item {
    border-color: #333;
  }
  [data-theme='dark'] .detail-item:hover {
    background: #222;
  }
  [data-theme='dark'] .detail-value {
    color: #eee;
  }

  [data-theme='dark'] .bit.on {
    background: #0e7490;
    border-color: #0e7490;
  }
  [data-theme='dark'] .bit.off {
    background: #222;
    color: #555;
    border-color: #333;
  }

  [data-theme='dark'] .cidr-table-header {
    background: #222;
    border-bottom-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .cidr-row {
    border-bottom-color: #333;
    color: #aaa;
  }
  [data-theme='dark'] .cidr-row:hover {
    background: #222;
  }
  [data-theme='dark'] .cidr-row.active {
    background: #0e7490;
    color: #fff;
  }
  [data-theme='dark'] .tips-box {
    border-top-color: #eee;
  }
  [data-theme='dark'] .tips-box ul {
    color: #888;
  }

  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .badge {
    border-color: #eee;
    box-shadow: 5px 5px 0px #eee;
  }
</style>
