<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <!-- Header -->
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">Config<span>.生成器()</span></h1>
        <div class="type-badge">{{ typeBadge }}</div>
      </header>

      <!-- 模版类型选择器 -->
      <div class="type-selector">
        <button
          v-for="t in types"
          :key="t.id"
          :class="['type-btn', { active: selectedType === t.id }]"
          @click="selectType(t.id)"
        >
          <span class="type-icon">{{ t.icon }}</span>
          <span>{{ t.label }}</span>
        </button>
      </div>

      <!-- 主布局 -->
      <div class="brutal-grid">
        <!-- 左侧：变量配置面板 -->
        <div class="brutal-pane config-pane">
          <div class="pane-header bg-yellow">
            <span>// 参数配置</span>
          </div>
          <div class="form-body">
            <!-- Nginx 通用字段 -->
            <template v-if="selectedType.startsWith('nginx')">
              <div class="form-item">
                <label class="form-label">监听域名</label>
                <input v-model="vars.domain" class="brutal-input" placeholder="example.com" />
              </div>
              <div v-if="selectedType === 'nginx-proxy'" class="form-item">
                <label class="form-label">下游端口 / 地址</label>
                <input v-model="vars.proxyPass" class="brutal-input" placeholder="127.0.0.1:3000" />
              </div>
              <div v-if="selectedType === 'nginx-static'" class="form-item">
                <label class="form-label">静态文件根目录</label>
                <input v-model="vars.root" class="brutal-input" placeholder="/var/www/html" />
              </div>
            </template>

            <!-- Docker 通用字段 -->
            <template v-if="selectedType.startsWith('docker')">
              <div class="form-item">
                <label class="form-label">容器名称</label>
                <input v-model="vars.containerName" class="brutal-input" placeholder="my-app" />
              </div>
              <div class="form-item">
                <label class="form-label">端口映射</label>
                <input v-model="vars.ports" class="brutal-input" placeholder="8080:80" />
              </div>
            </template>

            <!-- Nginx HTTPS 额外字段 -->
            <template v-if="selectedType === 'nginx-https'">
              <div class="form-item">
                <label class="form-label">监听域名</label>
                <input v-model="vars.domain" class="brutal-input" placeholder="example.com" />
              </div>
              <div class="form-item">
                <label class="form-label">下游端口 / 地址</label>
                <input v-model="vars.proxyPass" class="brutal-input" placeholder="127.0.0.1:3000" />
              </div>
              <div class="form-item">
                <label class="form-label">SSL 证书路径</label>
                <input
                  v-model="vars.sslCert"
                  class="brutal-input"
                  placeholder="/etc/nginx/ssl/cert.pem"
                />
              </div>
              <div class="form-item">
                <label class="form-label">SSL 私钥路径</label>
                <input
                  v-model="vars.sslKey"
                  class="brutal-input"
                  placeholder="/etc/nginx/ssl/key.pem"
                />
              </div>
            </template>

            <div class="warn-note">⚠️ 生成的模版仅供参考，生产环境请根据实际安全需求调整参数。</div>
          </div>
        </div>

        <!-- 右侧：代码预览 -->
        <div class="brutal-pane preview-pane">
          <div class="pane-header bg-blue">
            <span class="text-white filename">📄 {{ fileName }}</span>
            <button class="brutal-action-btn copy-btn" @click="copyCode">📋 复制配置</button>
          </div>
          <div class="code-container">
            <pre class="code-block"><code>{{ generatedCode }}</code></pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { useCopy } from '@/composables/useCopy';

  const { copyToClipboard } = useCopy();

  const types = [
    { id: 'nginx-proxy', icon: '🔀', label: 'Nginx 反向代理' },
    { id: 'nginx-static', icon: '📁', label: 'Nginx 静态网站' },
    { id: 'nginx-https', icon: '🔒', label: 'Nginx HTTPS' },
    { id: 'docker-node', icon: '🐳', label: 'Docker Node/Web' },
    { id: 'docker-mysql', icon: '🗄️', label: 'Docker MySQL' }
  ];

  const selectedType = ref('nginx-proxy');
  const vars = ref({
    domain: 'api.example.com',
    proxyPass: '127.0.0.1:3000',
    root: '/usr/share/nginx/html',
    sslCert: '/etc/nginx/ssl/cert.pem',
    sslKey: '/etc/nginx/ssl/key.pem',
    containerName: 'my-web-app',
    ports: '8080:80'
  });

  const selectType = id => {
    selectedType.value = id;
  };

  const typeBadge = computed(() => {
    const t = types.find(t => t.id === selectedType.value);
    return t ? `${t.icon} ${t.label}` : '';
  });

  const fileName = computed(() => {
    if (selectedType.value.startsWith('nginx')) return 'nginx.conf';
    if (selectedType.value.startsWith('docker')) return 'docker-compose.yml';
    return 'config';
  });

  const v = computed(() => vars.value);

  const generatedCode = computed(() => {
    const d = v.value;
    switch (selectedType.value) {
      case 'nginx-proxy':
        return `server {
    listen 80;
    server_name ${d.domain};

    location / {
        proxy_pass http://${d.proxyPass};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 开启 Gzip 压缩
    gzip on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript;

    # 安全响应头
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
}`;

      case 'nginx-static':
        return `server {
    listen 80;
    server_name ${d.domain};

    root ${d.root};
    index index.html index.htm;

    # 支持 SPA 路由 (Vue/React)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \\.(js|css|png|jpg|gif|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    error_page 404 /404.html;
    location = /404.html {
        internal;
    }
}`;

      case 'nginx-https':
        return `server {
    listen 80;
    server_name ${d.domain};
    # 强制跳转 HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${d.domain};

    ssl_certificate      ${d.sslCert};
    ssl_certificate_key  ${d.sslKey};
    ssl_protocols        TLSv1.2 TLSv1.3;
    ssl_ciphers          HIGH:!aNULL:!MD5;
    ssl_session_cache    shared:SSL:10m;
    ssl_session_timeout  10m;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://${d.proxyPass};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}`;

      case 'docker-node':
        return `version: '3.8'

services:
  ${d.containerName}:
    image: node:18-alpine
    container_name: ${d.containerName}
    working_dir: /app
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "${d.ports}"
    environment:
      - NODE_ENV=production
      - TZ=Asia/Shanghai
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3`;

      case 'docker-mysql':
        return `version: '3.8'

services:
  ${d.containerName}:
    image: mysql:8.0
    container_name: ${d.containerName}
    environment:
      MYSQL_ROOT_PASSWORD: change_me_root_password
      MYSQL_DATABASE: my_database
      MYSQL_USER: app_user
      MYSQL_PASSWORD: change_me_user_password
      TZ: Asia/Shanghai
    volumes:
      - mysql_data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "${d.ports || '3306:3306'}"
    restart: unless-stopped
    command: >
      --character-set-server=utf8mb4
      --collation-server=utf8mb4_unicode_ci

volumes:
  mysql_data:
    driver: local`;

      default:
        return '';
    }
  });

  const copyCode = async () => {
    await copyToClipboard(generatedCode.value, { success: '✔ 配置已复制到剪贴板' });
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
    max-width: 1600px;
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
    text-shadow: 4px 4px 0px #4f46e5;
  }

  .brutal-title span {
    color: #4f46e5;
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

  .type-badge {
    background: #4f46e5;
    color: #fff;
    padding: 0.5rem 1.2rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    border: 4px solid #111;
    box-shadow: 5px 5px 0px #111;
  }

  /* 模版类型选择器 */
  .type-selector {
    display: flex;
    gap: 0;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    background: #fff;
    flex-wrap: wrap;
  }

  .type-btn {
    flex: 1;
    min-width: 140px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    padding: 1rem 0.5rem;
    border: none;
    border-right: 3px solid #111;
    background: #fff;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.1s;
    color: #555;
  }

  .type-btn:last-child {
    border-right: none;
  }
  .type-btn:hover {
    background: #f0f0f0;
    color: #111;
  }
  .type-btn.active {
    background: #111;
    color: #ffd900;
  }

  .type-icon {
    font-size: 1.5rem;
  }

  /* Grid */
  .brutal-grid {
    display: grid;
    grid-template-columns: 320px 1fr;
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

  .bg-yellow {
    background: #ffd900;
  }
  .bg-blue {
    background: #4b7bff;
  }
  .text-white {
    color: #fff;
  }

  .filename {
    font-family: 'IBM Plex Mono', monospace;
    letter-spacing: 0;
  }

  /* Form */
  .form-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .form-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-label {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #555;
  }

  .brutal-input {
    border: 3px solid #111;
    padding: 0.75rem 1rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-size: 1rem;
    font-weight: 600;
    background: #fdfae5;
    color: #111;
    outline: none;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
  }

  .brutal-input:focus {
    background: #fff;
    transform: translate(-1px, -1px);
    box-shadow: 5px 5px 0px #111;
  }

  .warn-note {
    background: #fff8e0;
    border: 3px solid #f59e0b;
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
    font-weight: 700;
    color: #92400e;
    box-shadow: 3px 3px 0px #f59e0b;
    line-height: 1.5;
    margin-top: 0.25rem;
  }

  /* Action Button */
  .brutal-action-btn {
    border: 3px solid #fff;
    background: rgba(255, 255, 255, 0.2);
    padding: 0.4rem 1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.95rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px rgba(0, 0, 0, 0.3);
    transition: all 0.1s;
    text-transform: uppercase;
    color: #fff;
    letter-spacing: 0.5px;
  }

  .brutal-action-btn:hover {
    background: rgba(255, 255, 255, 0.35);
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.4);
  }
  .brutal-action-btn:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px rgba(0, 0, 0, 0.3);
  }

  /* Code Preview */
  .preview-pane {
    min-height: 500px;
  }

  .code-container {
    background: #0d1117;
    padding: 2rem;
    flex: 1;
    overflow: auto;
  }

  .code-block {
    margin: 0;
    font-family: 'IBM Plex Mono', 'Courier New', monospace;
    font-size: 0.9rem;
    line-height: 1.7;
    white-space: pre;
    color: #c9d1d9;
  }

  .code-block code {
    color: inherit;
  }

  @media (max-width: 1024px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .brutal-title {
      font-size: 2rem;
    }
    .type-btn {
      min-width: 100px;
      font-size: 0.8rem;
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
  [data-theme='dark'] .type-badge {
    border-color: #eee;
    box-shadow: 5px 5px 0px #eee;
  }

  [data-theme='dark'] .type-selector {
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
    background: #1a1a1a;
  }
  [data-theme='dark'] .type-btn {
    background: #1a1a1a;
    border-right-color: #eee;
    color: #aaa;
  }
  [data-theme='dark'] .type-btn:hover {
    background: #333;
    color: #eee;
  }
  [data-theme='dark'] .type-btn.active {
    background: #eee;
    color: #111;
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
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }

  [data-theme='dark'] .brutal-input {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-input:focus {
    background: #2a2a2a;
    box-shadow: 5px 5px 0px #eee;
  }

  [data-theme='dark'] .warn-note {
    background: #1a1000;
    border-color: #b86c00;
    color: #ffcc77;
    box-shadow: 3px 3px 0px #b86c00;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
</style>
