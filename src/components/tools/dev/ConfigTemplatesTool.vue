<template>
  <div class="config-templates-tool">
    <nav class="nav-bar">
      <button @click="$router.back()" class="nav-back">
        <el-icon>
          <Back />
        </el-icon> 返回
      </button>
      <div class="nav-center">
        <h1>配置模版生成器</h1>
        <span class="nav-subtitle">Docker & Nginx Config Templates</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="layout-grid">
        
        <aside class="config-sidebar glass-card">
          <h3 class="sidebar-title">快捷配置</h3>

          <el-form label-position="top">
            <el-form-item label="模版类型">
              <el-select v-model="selectedType" @change="resetVars">
                <el-option label="Nginx 反向代理" value="nginx-proxy" />
                <el-option label="Nginx 静态网站" value="nginx-static" />
                <el-option label="Docker Compose (Node/Web)" value="docker-node" />
                <el-option label="Docker Compose (MySQL)" value="docker-mysql" />
              </el-select>
            </el-form-item>

            <div v-if="selectedType.startsWith('nginx')">
              <el-form-item label="监听域名">
                <el-input v-model="vars.domain" placeholder="example.com" />
              </el-form-item>
              <el-form-item label="下游端口/地址" v-if="selectedType === 'nginx-proxy'">
                <el-input v-model="vars.proxyPass" placeholder="127.0.0.1:3000" />
              </el-form-item>
              <el-form-item label="静态文件根目录" v-if="selectedType === 'nginx-static'">
                <el-input v-model="vars.root" placeholder="/var/www/html" />
              </el-form-item>
            </div>

            <div v-if="selectedType.startsWith('docker')">
              <el-form-item label="容器名称">
                <el-input v-model="vars.containerName" placeholder="my-app" />
              </el-form-item>
              <el-form-item label="端口映射">
                <el-input v-model="vars.ports" placeholder="8080:80" />
              </el-form-item>
            </div>
          </el-form>

          <el-alert title="提示：生成的模版仅供参考，生产环境请根据实际安全需求调整参数。" type="warning" :closable="false" class="mt-6" />
        </aside>

        
        <section class="code-preview glass-card">
          <div class="preview-header">
            <el-tag effect="dark" type="info">{{ fileName }}</el-tag>
            <el-button type="primary" :icon="CopyDocument" @click="copyCode">复制配置</el-button>
          </div>
          <div class="code-container">
            <pre><code>{{ generatedCode }}</code></pre>
          </div>
        </section>
      </div>
    </main>

    <footer class="footer">
      © 2026 LRM工具箱 - 配置模版生成器
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Back, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import useClipboard from 'vue-clipboard3'

const { toClipboard } = useClipboard()

const selectedType = ref('nginx-proxy')
const vars = ref({
  domain: 'api.example.com',
  proxyPass: '127.0.0.1:3000',
  root: '/usr/share/nginx/html',
  containerName: 'my-web-app',
  ports: '8080:80'
})

const resetVars = () => {
  
}

const fileName = computed(() => {
  if (selectedType.value.startsWith('nginx')) return 'nginx.conf'
  if (selectedType.value.startsWith('docker')) return 'docker-compose.yml'
  return 'config'
})

const generatedCode = computed(() => {
  if (selectedType.value === 'nginx-proxy') {
    return `server {
    listen 80;
    server_name ${vars.value.domain};

    location / {
        proxy_pass http://${vars.value.proxyPass};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 开启 Gzip
    gzip on;
    gzip_types text/plain text/css application/json;
}`
  }

  if (selectedType.value === 'nginx-static') {
    return `server {
    listen 80;
    server_name ${vars.value.domain};

    root ${vars.value.root};
    index index.html;

    location / {
        try_files $uri $uri/ /index.html; # 支持 SPA 路由
    }

    error_page 404 /404.html;
    location = /404.html {
        internal;
    }
}`
  }

  if (selectedType.value === 'docker-node') {
    return `version: '3.8'
services:
  ${vars.value.containerName}:
    image: node:18-alpine
    container_name: ${vars.value.containerName}
    working_dir: /app
    volumes:
      - .:/app
    ports:
      - "${vars.value.ports}"
    environment:
      - NODE_ENV=production
    restart: always`
  }

  if (selectedType.value === 'docker-mysql') {
    return `version: '3.8'
services:
  ${vars.value.containerName}:
    image: mysql:8.0
    container_name: ${vars.value.containerName}
    environment:
      MYSQL_ROOT_PASSWORD: root_password_here
      MYSQL_DATABASE: my_database
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"
    restart: always

volumes:
  mysql_data:`
  }

  return ''
})

const copyCode = async () => {
  try {
    await toClipboard(generatedCode.value)
    ElMessage.success('配置已复制到剪贴板')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
.config-templates-tool {
  --primary: #4f46e5;
  --bg: #f8fafc;
  --card: #ffffff;
  --border: #e2e8f0;
  --text: #1e293b;

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
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.layout-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 2rem;
}

.glass-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
}

.sidebar-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #334155;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

.code-container {
  background: #1e293b;
  border-radius: 8px;
  padding: 1.5rem;
  overflow: auto;
}

.code-container pre {
  margin: 0;
  color: #e2e8f0;
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
}

.mt-6 {
  margin-top: 1.5rem;
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

@media (max-width: 1024px) {
  .layout-grid {
    grid-template-columns: 1fr;
  }
}
</style>
