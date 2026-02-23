<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <!-- Header -->
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">Port<span>.速查()</span></h1>
        <div class="badge">🔌 Network Port Guide</div>
      </header>

      <main class="brutal-grid">
        <!-- Search Panel -->
        <section class="brutal-pane search-pane">
          <div class="pane-header bg-yellow">
            <span>🔍 端口检索 (PORT_ID)</span>
          </div>
          <div class="pane-body">
            <div class="search-wrap">
              <input
                v-model="portSearch"
                type="number"
                placeholder="输入端口号 (如: 80, 22, 3306...)"
                class="brutal-input port-input"
              />
            </div>

            <div class="result-display">
              <div v-if="portSearch">
                <div v-if="currentPortInfo" class="port-focus-card">
                  <div class="port-hero">
                    <span class="hero-num">{{ currentPortInfo.port }}</span>
                    <div class="hero-proto">{{ currentPortInfo.proto }}</div>
                  </div>
                  <div class="port-meta">
                    <h2 class="svc-name">{{ currentPortInfo.service }}</h2>
                    <p class="svc-desc">{{ currentPortInfo.desc }}</p>
                  </div>
                </div>
                <div v-else class="port-not-found">
                  <div class="not-found-icon">❓</div>
                  <p>未发现该端口 ({{ portSearch }}) 的预设常用记录</p>
                  <small>// 可能为自定义应用端口</small>
                </div>
              </div>
              <div v-else class="idle-state">
                <p>在上方输入端口号进行常识检索<br />或从下方名录中直接挑选</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Catalog Panel -->
        <div class="catalog-column">
          <section class="brutal-pane catalog-pane">
            <div class="pane-header bg-orange">
              <span class="text-white">📚 端口名录 (CATALOG)</span>
            </div>
            <div class="pane-body catalog-scroll">
              <div v-for="cat in categorizedPorts" :key="cat.name" class="cat-section">
                <div class="cat-title">{{ cat.name }}</div>
                <div class="port-tags-grid">
                  <button
                    v-for="p in cat.ports"
                    :key="p.port"
                    class="port-tag-btn"
                    :class="{ active: portSearch == p.port }"
                    @click="portSearch = p.port"
                  >
                    <span class="p-num">{{ p.port }}</span>
                    <span class="p-svc">{{ p.service }}</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- Tips Panel -->
          <section class="brutal-pane info-pane">
            <div class="pane-header bg-blue">
              <span class="text-white">💡 运维贴士 (TIPS)</span>
            </div>
            <div class="pane-body">
              <ul class="brutal-ul">
                <li><strong>周知端口</strong>: 0 - 1023 (由 IANA 分配)</li>
                <li><strong>注册端口</strong>: 1024 - 49151 (用于特定服务)</li>
                <li><strong>动态端口</strong>: 49152 - 65535 (临时连接使用)</li>
              </ul>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';

  interface PortInfo {
    port: number;
    service: string;
    desc: string;
    proto: string;
    cat: string;
  }

  const portSearch = ref<number | string>('');

  const commonPorts: PortInfo[] = [
    { port: 80, service: 'HTTP', desc: '超文本传输协议 (网页浏览)', proto: 'TCP', cat: 'Web' },
    {
      port: 443,
      service: 'HTTPS',
      desc: '安全的 HTTP (加密网页浏览, SSL/TLS)',
      proto: 'TCP',
      cat: 'Web'
    },
    {
      port: 8080,
      service: 'HTTP Alt',
      desc: 'HTTP 备用端口，常用于 Tomcat/代理',
      proto: 'TCP',
      cat: 'Web'
    },
    {
      port: 8000,
      service: 'HTTP Dev',
      desc: '常用 Web 开发/调试端口 (Django/Python)',
      proto: 'TCP',
      cat: 'Web'
    },
    { port: 20, service: 'FTP Data', desc: '文件传输协议 (数据传输)', proto: 'TCP', cat: '传输' },
    { port: 21, service: 'FTP Ctrl', desc: '文件传输协议 (命令控制)', proto: 'TCP', cat: '传输' },
    {
      port: 22,
      service: 'SSH/SFTP',
      desc: '安全外壳协议 (远程登录/文件传输)',
      proto: 'TCP',
      cat: '传输'
    },
    {
      port: 23,
      service: 'Telnet',
      desc: '远程终端协议 (明文传输，不推荐)',
      proto: 'TCP',
      cat: '传输'
    },
    { port: 69, service: 'TFTP', desc: '简单文件传输协议', proto: 'UDP', cat: '传输' },
    { port: 25, service: 'SMTP', desc: '简单邮件传输协议 (发送邮件)', proto: 'TCP', cat: '邮件' },
    { port: 110, service: 'POP3', desc: '邮局协议 v3 (接收邮件)', proto: 'TCP', cat: '邮件' },
    {
      port: 143,
      service: 'IMAP',
      desc: '互联网邮件访问协议 (接收邮件)',
      proto: 'TCP',
      cat: '邮件'
    },
    { port: 465, service: 'SMTPS', desc: '安全的 SMTP over SSL', proto: 'TCP', cat: '邮件' },
    {
      port: 3306,
      service: 'MySQL',
      desc: 'MySQL / MariaDB 数据库默认端口',
      proto: 'TCP',
      cat: '数据库'
    },
    { port: 5432, service: 'PostgreSQL', desc: 'PostgreSQL 数据库', proto: 'TCP', cat: '数据库' },
    { port: 27017, service: 'MongoDB', desc: 'MongoDB NoSQL 数据库', proto: 'TCP', cat: '数据库' },
    { port: 6379, service: 'Redis', desc: 'Redis 内存数据库/缓存', proto: 'TCP', cat: '数据库' },
    {
      port: 1433,
      service: 'SQL Server',
      desc: 'Microsoft SQL Server',
      proto: 'TCP',
      cat: '数据库'
    },
    { port: 1521, service: 'Oracle', desc: 'Oracle 数据库', proto: 'TCP', cat: '数据库' },
    { port: 53, service: 'DNS', desc: '域名系统 (域名解析)', proto: 'UDP/TCP', cat: '基础' },
    { port: 67, service: 'DHCP', desc: '动态主机配置协议 (服务端)', proto: 'UDP', cat: '基础' },
    { port: 123, service: 'NTP', desc: '网络时间协议 (对时)', proto: 'UDP', cat: '基础' },
    { port: 3389, service: 'RDP', desc: '远程桌面协议 (Windows 远程)', proto: 'TCP', cat: '基础' }
  ];

  const categorizedPorts = computed(() => {
    const cats: Record<string, PortInfo[]> = {};
    commonPorts.forEach(p => {
      if (!cats[p.cat]) cats[p.cat] = [];
      cats[p.cat].push(p);
    });
    return Object.keys(cats).map(k => ({ name: k, ports: cats[k] }));
  });

  const currentPortInfo = computed(() => {
    if (!portSearch.value) return null;
    return commonPorts.find(p => p.port == Number(portSearch.value));
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

  /* Grid Layout */
  .brutal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2.5rem;
  }

  .catalog-column {
    display: flex;
    flex-direction: column;
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
  .bg-orange {
    background: #f59e0b;
  }
  .bg-blue {
    background: #3b82f6;
  }
  .text-white {
    color: #fff;
  }

  .pane-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* Search Section */
  .brutal-input {
    width: 100%;
    border: 4px solid #111;
    padding: 1.25rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 2.5rem;
    font-weight: 900;
    background: #fff;
    box-shadow: 6px 6px 0px #111;
    outline: none;
    text-align: center;
    box-sizing: border-box;
  }

  .port-focus-card {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 2rem;
    background: #fffbeb;
    border: 3px solid #111;
    margin-top: 1rem;
  }

  .port-hero {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 1rem;
  }

  .hero-num {
    font-size: 5rem;
    font-weight: 900;
    line-height: 1;
    letter-spacing: -3px;
  }
  .hero-proto {
    background: #111;
    color: #fff;
    padding: 4px 10px;
    font-weight: 900;
    font-size: 1rem;
  }

  .svc-name {
    font-family: 'Syne', sans-serif;
    font-size: 2rem;
    font-weight: 900;
    margin: 0;
    text-transform: uppercase;
    text-align: center;
  }

  .svc-desc {
    font-weight: 600;
    color: #555;
    text-align: center;
    line-height: 1.6;
    margin: 0;
  }

  .port-not-found,
  .idle-state {
    padding: 4rem 2rem;
    text-align: center;
    color: #aaa;
    border: 3px dashed #111;
  }

  .not-found-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  /* Catalog */
  .catalog-scroll {
    max-height: 400px;
    overflow-y: auto;
  }

  .cat-section {
    margin-bottom: 2rem;
  }
  .cat-title {
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    font-size: 0.85rem;
    color: #888;
    text-transform: uppercase;
    margin-bottom: 0.75rem;
    border-bottom: 2px solid #eee;
    padding-bottom: 0.2rem;
  }

  .port-tags-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .port-tag-btn {
    background: #fff;
    border: 2px solid #111;
    padding: 0.5rem 0.8rem;
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }

  .port-tag-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }
  .port-tag-btn.active {
    background: #111;
    color: #ffd900;
    box-shadow: 0 0 0 #111;
    transform: translate(1px, 1px);
  }

  .p-num {
    font-weight: 900;
    font-size: 1rem;
  }
  .p-svc {
    font-size: 0.75rem;
    font-weight: 700;
    opacity: 0.8;
  }

  /* Misc */
  .brutal-ul {
    margin: 0;
    padding-left: 1.25rem;
    font-weight: 600;
    font-size: 0.95rem;
    line-height: 2;
  }

  @media (max-width: 900px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .hero-num {
      font-size: 3.5rem;
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
  [data-theme='dark'] .brutal-input {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .port-focus-card {
    background: #1a1a1a;
    border-color: #eee;
  }
  [data-theme='dark'] .hero-num {
    color: #eee;
  }
  [data-theme='dark'] .hero-proto {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .svc-desc {
    color: #aaa;
  }
  [data-theme='dark'] .port-tag-btn {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .port-tag-btn.active {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .badge {
    border-color: #eee;
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-orange {
    background: #c27a00;
  }
  [data-theme='dark'] .bg-blue {
    background: #1d4ed8;
  }
</style>
