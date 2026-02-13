<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">Dockerfile 模版生成</h1>
        <span class="tool-subtitle">Dockerfile Best Practice Generator</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="copyDockerfile">
          <el-icon><CopyDocument /></el-icon>
          复制文件
        </el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="tool-layout">
        <section class="config-section">
          <!-- 语言选择 -->
          <div class="panel glass-card mb-6">
            <h2 class="panel-title">环境预设</h2>
            <div class="preset-grid">
              <div
                v-for="preset in presets"
                :key="preset.id"
                class="preset-card"
                :class="{ active: selectedPreset === preset.id }"
                @click="selectPreset(preset.id)"
              >
                <div class="preset-icon">{{ preset.icon }}</div>
                <div class="preset-info">
                  <div class="preset-name">{{ preset.name }}</div>
                  <div class="preset-desc">{{ preset.desc }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 参数设置 -->
          <div class="panel glass-card">
            <h2 class="panel-title">参数配置</h2>
            <el-form label-position="top">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="基础镜像 (Base Image)">
                    <el-input v-model="config.baseImage" placeholder="node:18-alpine" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="暴露端口 (Expose Port)">
                    <el-input-number v-model="config.port" :min="1" :max="65535" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="工作目录 (WORKDIR)">
                <el-input v-model="config.workdir" placeholder="/app" />
              </el-form-item>

              <el-form-item label="环境变量 (ENV)">
                <div class="env-list">
                  <div v-for="(env, index) in config.envs" :key="index" class="env-row">
                    <el-input v-model="env.key" placeholder="NODE_ENV" />
                    <el-input v-model="env.value" placeholder="production" />
                    <el-button :icon="Delete" circle @click="removeEnv(index)" />
                  </div>
                  <el-button type="primary" link :icon="Plus" @click="addEnv"
                    >添加环境变量</el-button
                  >
                </div>
              </el-form-item>

              <el-form-item label="多阶段构建 (Multi-stage Build)">
                <el-switch v-model="config.multiStage" />
                <span class="ml-2 text-gray-400 text-xs">通过分离构建和运行环境来减小镜像体积</span>
              </el-form-item>

              <el-form-item label="安装命令 (Install Command)">
                <el-input v-model="config.installCmd" placeholder="npm install" />
              </el-form-item>

              <el-form-item label="启动命令 (CMD)">
                <el-input v-model="config.startCmd" placeholder="npm start" />
              </el-form-item>
            </el-form>
          </div>
        </section>

        <!-- 结果预览 -->
        <aside class="result-section">
          <div class="panel glass-card result-card">
            <div class="result-header">
              <h2 class="panel-title mb-0">Dockerfile</h2>
              <div class="actions">
                <el-button type="primary" size="small" @click="copyDockerfile">复制</el-button>
                <el-button type="success" size="small" @click="downloadDockerfile">下载</el-button>
              </div>
            </div>
            <div class="code-preview">
              <pre><code>{{ generatedDockerfile }}</code></pre>
            </div>

            <div class="docker-tips mt-6">
              <h3 class="tip-title">
                <el-icon><InfoFilled /></el-icon> 最佳实践
              </h3>
              <ul class="tip-list">
                <li>优先使用 <code>alpine</code> 或 <code>slim</code> 版本镜像以减小体积。</li>
                <li>
                  合理使用 <code>.dockerignore</code> 排除 <code>node_modules</code> 等无关目录。
                </li>
                <li>将构建步骤按变动频率从低到高排列，以充分利用缓存。</li>
                <li>避免在容器内以 root 用户运行生产环境进程。</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - Dockerfile 模版生成</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { ArrowLeft, Plus, Delete, CopyDocument, InfoFilled } from '@element-plus/icons-vue';
  import { useCopy } from '@/composables/useCopy';

  const { copyToClipboard } = useCopy();

  const selectedPreset = ref('node');
  const presets = [
    {
      id: 'node',
      name: 'Node.js',
      icon: '📦',
      desc: '支持 npm/yarn 构建的 Node 环境',
      base: 'node:18-alpine',
      port: 3000,
      build: 'npm install && npm run build',
      start: 'npm start'
    },
    {
      id: 'python',
      name: 'Python',
      icon: '🐍',
      desc: '支持 pip 安装的 Python 环境',
      base: 'python:3.9-slim',
      port: 8000,
      build: 'pip install -r requirements.txt',
      start: 'python app.py'
    },
    {
      id: 'go',
      name: 'Go',
      icon: '🐹',
      desc: '静态编译后的 Go 环境',
      base: 'golang:1.20-alpine',
      port: 8080,
      build: 'go build -o main .',
      start: './main'
    },
    {
      id: 'nginx',
      name: 'Nginx (SPA)',
      icon: '🌐',
      desc: '用于托管前端单页应用',
      base: 'nginx:stable-alpine',
      port: 80,
      build: 'npm run build',
      start: 'nginx -g "daemon off;"'
    },
    {
      id: 'java',
      name: 'Java/Spring',
      icon: '☕',
      desc: '适用于 JAR 包部署的 Java 环境',
      base: 'eclipse-temurin:17-jdk-alpine',
      port: 8080,
      build: './mvnw package',
      start: 'java -jar app.jar'
    }
  ];

  const config = ref({
    baseImage: 'node:18-alpine',
    port: 3000,
    workdir: '/app',
    multiStage: false,
    installCmd: 'npm install',
    startCmd: 'npm start',
    envs: [{ key: 'NODE_ENV', value: 'production' }]
  });

  const selectPreset = (id: string) => {
    selectedPreset.value = id;
    const p = presets.find(x => x.id === id);
    if (p) {
      config.value.baseImage = p.base;
      config.value.port = p.port;
      config.value.installCmd = p.build;
      config.value.startCmd = p.start;
    }
  };

  const addEnv = () => config.value.envs.push({ key: '', value: '' });
  const removeEnv = (i: number) => config.value.envs.splice(i, 1);

  const generatedDockerfile = computed(() => {
    const { baseImage, port, workdir, multiStage, installCmd, startCmd, envs } = config.value;
    let lines = [`# Generated by LRM Toolbox Dockerfile Generator`];

    if (multiStage && selectedPreset.value !== 'nginx') {
      lines.push(`# Build Stage`);
      lines.push(`FROM ${baseImage} as builder`);
      lines.push(`WORKDIR ${workdir}`);
      lines.push(`COPY . .`);
      lines.push(`RUN ${installCmd}`);
      lines.push(``);
      lines.push(`# Production Stage`);
      lines.push(`FROM ${baseImage.split(':')[0]}:alpine`);
    } else if (selectedPreset.value === 'nginx') {
      lines.push(`# Build Stage`);
      lines.push(`FROM node:18-alpine as build-stage`);
      lines.push(`WORKDIR ${workdir}`);
      lines.push(`COPY package*.json ./`);
      lines.push(`RUN npm install`);
      lines.push(`COPY . .`);
      lines.push(`RUN ${installCmd}`);
      lines.push(``);
      lines.push(`# Target Stage`);
      lines.push(`FROM ${baseImage}`);
      lines.push(`COPY --from=build-stage ${workdir}/dist /usr/share/nginx/html`);
    } else {
      lines.push(`FROM ${baseImage}`);
    }

    lines.push(`WORKDIR ${workdir}`);

    envs.forEach(e => {
      if (e.key) lines.push(`ENV ${e.key}=${e.value}`);
    });

    if (!multiStage && selectedPreset.value !== 'nginx') {
      lines.push(`COPY . .`);
      lines.push(`RUN ${installCmd}`);
    }

    lines.push(`EXPOSE ${port}`);

    if (startCmd.includes(' ')) {
      const parts = startCmd
        .split(' ')
        .map(s => `"${s}"`)
        .join(', ');
      lines.push(`CMD [${parts}]`);
    } else {
      lines.push(`CMD ["${startCmd}"]`);
    }

    return lines.join('\n');
  });

  const copyDockerfile = () => {
    copyToClipboard(generatedDockerfile.value, { success: 'Dockerfile 内容已复制' });
  };

  const downloadDockerfile = () => {
    const blob = new Blob([generatedDockerfile.value], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Dockerfile';
    a.click();
    window.URL.revokeObjectURL(url);
  };
</script>

<style scoped>
  .tool-page {
    min-height: 100vh;
    background: #f8fafc;
    display: flex;
    flex-direction: column;
  }

  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #fff;
    border-bottom: 1px solid #e2e8f0;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-left,
  .header-right {
    width: 140px;
  }
  .header-right {
    display: flex;
    justify-content: flex-end;
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
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .tool-layout {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 1.5rem;
    align-items: start;
  }

  @media (max-width: 1024px) {
    .tool-layout {
      grid-template-columns: 1fr;
    }
  }

  .glass-card {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  .panel-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 20px;
  }

  .preset-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
  }

  .preset-card {
    padding: 12px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: all 0.2s;
  }

  .preset-card:hover {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  .preset-card.active {
    background: #eff6ff;
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
  }

  .preset-icon {
    font-size: 1.5rem;
  }

  .preset-name {
    font-weight: 600;
    font-size: 0.9rem;
    color: #1e293b;
  }

  .preset-desc {
    font-size: 0.7rem;
    color: #64748b;
  }

  .env-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .env-row {
    display: flex;
    gap: 10px;
  }

  .result-card {
    position: sticky;
    top: 100px;
  }

  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .code-preview {
    background: #1e293b;
    border-radius: 8px;
    padding: 1.5rem;
    min-height: 300px;
    max-height: 600px;
    overflow: auto;
  }

  .code-preview pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
  }

  .code-preview code {
    color: #e2e8f0;
    font-family: 'Fira Code', 'Courier New', monospace;
    font-size: 0.85rem;
  }

  .docker-tips {
    background: #fff7ed;
    border-radius: 8px;
    padding: 16px;
    border-left: 4px solid #f97316;
  }

  .tip-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    color: #9a3412;
    margin: 0 0 8px 0;
  }

  .tip-list {
    padding-left: 20px;
    margin: 0;
  }

  .tip-list li {
    font-size: 0.8rem;
    color: #c2410c;
    margin-bottom: 4px;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }

  .ml-2 {
    margin-left: 0.5rem;
  }
  .mb-0 {
    margin-bottom: 0;
  }
  .mb-4 {
    margin-bottom: 1rem;
  }
  .mb-6 {
    margin-bottom: 1.5rem;
  }
  .mt-4 {
    margin-top: 1rem;
  }
  .mt-6 {
    margin-top: 1.5rem;
  }
</style>
