<template>
  <div class="port-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>端口号常识查询</h1>
        <span class="nav-subtitle">Port Number Lookup</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="tool-card glass-card">
        <div class="search-section">
          <div class="search-box">
            <el-icon class="search-icon">
              <Search />
            </el-icon>
            <input
              v-model="portSearch"
              type="number"
              placeholder="输入端口号 (如: 80, 22, 3306...)"
              class="search-input"
            />
          </div>
        </div>

        <div class="port-result-area">
          <div v-if="portSearch" class="result-display animate-pop-in">
            <div v-if="currentPortInfo" class="port-card success">
              <span class="port-num">{{ currentPortInfo.port }}</span>
              <h2 class="port-svc">{{ currentPortInfo.service }}</h2>
              <p class="port-desc">{{ currentPortInfo.desc }}</p>
              <span class="port-proto">{{ currentPortInfo.proto }}</span>
            </div>
            <div v-else class="port-card empty">
              <el-icon class="icon">
                <QuestionFilled />
              </el-icon>
              <p>暂无该端口 ({{ portSearch }}) 的常用默认服务记录</p>
              <small>注：此端口可能由自定义应用使用，或者用于临时通信。</small>
            </div>
          </div>

          <div v-else class="initial-msg">
            <p>👆 请输入数字查询，或点击下方常见端口</p>
          </div>
        </div>

        <div class="common-ports">
          <h3>常见端口参考</h3>
          <div class="tags-cloud">
            <div v-for="cat in categorizedPorts" :key="cat.name" class="port-category">
              <span class="cat-label">{{ cat.name }}</span>
              <div class="cat-tags">
                <span
                  v-for="p in cat.ports"
                  :key="p.port"
                  class="port-chip"
                  :class="{ active: portSearch == p.port }"
                  @click="portSearch = p.port"
                >
                  <b>{{ p.port }}</b> {{ p.service }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 端口号常识查询器</footer>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { Back, Search, QuestionFilled } from '@element-plus/icons-vue';

  const portSearch = ref('');

  const commonPorts = [
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
    const cats = {};
    commonPorts.forEach(p => {
      if (!cats[p.cat]) cats[p.cat] = [];
      cats[p.cat].push(p);
    });
    return Object.keys(cats).map(k => ({ name: k, ports: cats[k] }));
  });

  const currentPortInfo = computed(() => {
    if (!portSearch.value) return null;
    return commonPorts.find(p => p.port == portSearch.value);
  });
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

  .port-tool {
    --bg: #faf9f7;
    --card: #ffffff;
    --border: #e8e6e3;
    --text: #1a1a1a;
    --text-2: #6b6b6b;
    --accent: #f59e0b;

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
  }

  .nav-center h1 {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.1rem;
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

  .search-section {
    margin-bottom: 2rem;
  }

  .search-box {
    position: relative;
    max-width: 500px;
    margin: 0 auto;
  }

  .search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-2);
    font-size: 1.2rem;
  }

  .search-input {
    width: 100%;
    padding: 1rem 1rem 1rem 3.5rem;
    border: 1px solid var(--border);
    border-radius: 12px;
    font-size: 1.5rem;
    outline: none;
    transition: border-color 0.2s;
    font-family: monospace;
  }

  .search-input:focus {
    border-color: var(--accent);
  }

  .port-result-area {
    min-height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .initial-msg {
    text-align: center;
    color: var(--text-2);
  }

  .port-card {
    background: #fffbeb;
    border: 1px solid #fcd34d;
    border-radius: 16px;
    padding: 2rem;
    text-align: center;
    max-width: 500px;
    margin: 0 auto;
  }

  .port-card.empty {
    background: #f9fafb;
    border-color: var(--border);
    color: var(--text-2);
  }

  .port-num {
    font-size: 4rem;
    font-weight: 800;
    color: #b45309;
    display: block;
    line-height: 1;
    margin-bottom: 0.5rem;
    font-family: monospace;
  }

  .port-svc {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--text);
  }

  .port-desc {
    font-size: 1rem;
    color: var(--text-2);
    margin-bottom: 1.5rem;
    line-height: 1.5;
  }

  .port-proto {
    display: inline-block;
    background: white;
    padding: 4px 12px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.9rem;
    color: #b45309;
    border: 1px solid #fcd34d;
  }

  .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: var(--border);
  }

  .animate-pop-in {
    animation: popIn 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
  }

  @keyframes popIn {
    from {
      transform: scale(0.9);
      opacity: 0;
    }

    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  .common-ports {
    margin-top: 3rem;
  }

  .common-ports h3 {
    margin-bottom: 1.5rem;
    font-size: 1rem;
    border-left: 3px solid var(--accent);
    padding-left: 0.8rem;
  }

  .port-category {
    margin-bottom: 1.5rem;
  }

  .cat-label {
    display: block;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-2);
    margin-bottom: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .cat-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
  }

  .port-chip {
    background: white;
    border: 1px solid var(--border);
    padding: 0.4rem 0.8rem;
    border-radius: 8px;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--text-2);
  }

  .port-chip b {
    color: var(--text);
    font-family: monospace;
  }

  .port-chip:hover,
  .port-chip.active {
    border-color: var(--accent);
    color: var(--accent);
    background: #fffbeb;
  }

  .port-chip.active b {
    color: var(--accent);
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-2);
    border-top: 1px solid var(--border);
    margin-top: 2rem;
    font-size: 0.85rem;
  }
</style>
