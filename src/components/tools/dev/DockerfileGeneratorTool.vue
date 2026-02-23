<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">Dockerfile<span>.gen()</span></h1>
        <div class="badge">🐳 Best Practice Generator</div>
      </header>

      <main class="brutal-grid">
        <!-- Configuration Section -->
        <section class="config-column">
          <!-- Presets -->
          <div class="brutal-pane">
            <div class="pane-header bg-yellow">
              <span>🌟 环境预设 (PRESETS)</span>
            </div>
            <div class="pane-body">
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
          </div>

          <!-- Parameters -->
          <div class="brutal-pane">
            <div class="pane-header bg-blue">
              <span class="text-white">⚙️ 参数配置 (CONFIG)</span>
            </div>
            <div class="pane-body form-body">
              <div class="form-row">
                <div class="form-group flex-1">
                  <label class="form-label">基础镜像 (Base Image)</label>
                  <input
                    v-model="config.baseImage"
                    type="text"
                    class="brutal-input"
                    placeholder="node:18-alpine"
                  />
                </div>
                <div class="form-group w-30">
                  <label class="form-label">暴露端口 (Expose)</label>
                  <input
                    v-model.number="config.port"
                    type="number"
                    class="brutal-input text-center"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">工作目录 (WORKDIR)</label>
                <input
                  v-model="config.workdir"
                  type="text"
                  class="brutal-input"
                  placeholder="/app"
                />
              </div>

              <div class="form-group">
                <label class="form-label">
                  环境变量 (ENV)
                  <button class="small-action-btn add-btn" @click="addEnv">✚ 添加</button>
                </label>
                <div class="env-list">
                  <div v-for="(env, index) in config.envs" :key="index" class="env-row">
                    <input
                      v-model="env.key"
                      type="text"
                      class="brutal-input flex-1"
                      placeholder="KEY"
                    />
                    <span class="env-eq">=</span>
                    <input
                      v-model="env.value"
                      type="text"
                      class="brutal-input flex-1"
                      placeholder="VALUE"
                    />
                    <button class="delete-btn" @click="removeEnv(index)">✕</button>
                  </div>
                  <div v-if="config.envs.length === 0" class="empty-env">暂无环境变量</div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label flex-label">
                  多阶段构建 (Multi-stage Build)
                  <label class="brutal-switch">
                    <input v-model="config.multiStage" type="checkbox" />
                    <span class="slider"></span>
                  </label>
                </label>
                <p class="field-desc">// 通过分离构建和运行环境来大幅减小最终镜像体积</p>
              </div>

              <div class="form-group">
                <label class="form-label">安装命令 (RUN Install)</label>
                <input
                  v-model="config.installCmd"
                  type="text"
                  class="brutal-input"
                  placeholder="npm install"
                />
              </div>

              <div class="form-group">
                <label class="form-label">启动命令 (CMD)</label>
                <input
                  v-model="config.startCmd"
                  type="text"
                  class="brutal-input"
                  placeholder="npm start"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- Result Preview -->
        <aside class="preview-column">
          <div class="brutal-pane sticky-pane">
            <div class="pane-header bg-pink">
              <span>📃 预览区 (DOCKERFILE)</span>
              <div class="header-actions">
                <button class="small-action-btn copy-btn" @click="copyDockerfile">📋 复制</button>
                <button class="small-action-btn download-btn" @click="downloadDockerfile">
                  💾 下载
                </button>
              </div>
            </div>
            <div class="pane-body">
              <textarea
                v-model="generatedDockerfile"
                class="brutal-editor code-display"
                readonly
                spellcheck="false"
              ></textarea>

              <div class="tips-box mt-4">
                <h3 class="tip-title">💡 最佳实践</h3>
                <ul class="brutal-ul">
                  <li>优先使用 <code>alpine</code> 或 <code>slim</code> 版本镜像以减小体积。</li>
                  <li>合理使用 <code>.dockerignore</code> 排除 <code>node_modules</code>.</li>
                  <li>将构建步骤按变动频率从低到高排列以利用缓存。</li>
                  <li>避免在容器内以 root 用户运行生产进程。</li>
                </ul>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useCopy } from '@/composables/useCopy';

  const { copyToClipboard } = useCopy();

  const selectedPreset = ref('node');
  const presets = [
    {
      id: 'node',
      name: 'Node.js',
      icon: '📦',
      desc: '支持 npm/yarn 的 Node 环境',
      base: 'node:18-alpine',
      port: 3000,
      build: 'npm install && npm run build',
      start: 'npm start'
    },
    {
      id: 'python',
      name: 'Python',
      icon: '🐍',
      desc: '支持 pip 安装的环境',
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
      desc: '适用于 JAR 部署的 Java',
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
    copyToClipboard(generatedDockerfile.value, { success: 'Dockerfile 内容已复制到剪贴板！' });
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
  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }

  .badge {
    background: #111;
    color: #0ea5e9;
    padding: 0.5rem 1.2rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    border: 4px solid #0ea5e9;
    box-shadow: 5px 5px 0px #0ea5e9;
  }

  /* Main Grid */
  .brutal-grid {
    display: grid;
    grid-template-columns: 1fr 450px;
    gap: 2.5rem;
    align-items: start;
  }

  .config-column {
    display: flex;
    flex-direction: column;
    gap: 2rem;
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
    padding: 1rem 1.2rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.2rem;
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
  .text-white {
    color: #fff;
  }

  .pane-body {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* Preset Grid */
  .preset-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
  }
  .preset-card {
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    text-transform: none;
    text-align: left;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    cursor: pointer;
    background: #fff;
    transition: all 0.2s;
  }
  .preset-card:hover:not(.active) {
    transform: translate(-3px, -3px);
    box-shadow: 7px 7px 0px #111;
    background: #fdfae5;
  }
  .preset-card.active {
    background: #111;
    color: #fff;
    transform: translate(2px, 2px);
    box-shadow: 0 0 0 #111;
  }
  .preset-card.active .preset-desc {
    color: #ccc;
  }
  .preset-icon {
    font-size: 2rem;
    line-height: 1;
  }
  .preset-name {
    font-weight: 900;
    font-size: 1.1rem;
    margin-bottom: 0.2rem;
  }
  .preset-desc {
    font-size: 0.75rem;
    color: #555;
  }

  /* Form Elements */
  .form-body {
    gap: 1.5rem;
  }
  .form-row {
    display: flex;
    gap: 1.5rem;
  }
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .w-30 {
    width: 30%;
  }

  .form-label {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    color: #333;
  }
  .flex-label {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .brutal-input {
    border: 3px solid #111;
    padding: 0.8rem 1rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1rem;
    font-weight: 600;
    outline: none;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
    background: #fdfae5;
  }
  .brutal-input:focus {
    background: #fff;
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }
  .text-center {
    text-align: center;
  }
  .flex-1 {
    flex: 1;
    min-width: 0;
  }

  .small-action-btn {
    background: #fff;
    border: 2px solid #111;
    padding: 0.3rem 0.6rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.85rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    color: #111;
    white-space: nowrap;
  }
  .small-action-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }
  .add-btn {
    background: #ffd900;
    margin-left: 0.5rem;
    padding: 0.1rem 0.6rem;
  }

  /* Env Settings */
  .env-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .env-row {
    display: flex;
    align-items: stretch;
    gap: 0.5rem;
  }
  .env-eq {
    display: flex;
    align-items: center;
    font-weight: 900;
    font-size: 1.2rem;
  }
  .delete-btn {
    background: #ff4b4b;
    color: #fff;
    border: 3px solid #111;
    font-weight: 900;
    width: 48px;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
  }
  .delete-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }
  .empty-env {
    padding: 1rem;
    border: 3px dashed #111;
    text-align: center;
    font-weight: 600;
    color: #666;
  }

  /* Switch */
  .brutal-switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 30px;
  }
  .brutal-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #fff;
    border: 3px solid #111;
    transition: 0.2s;
    box-shadow: 3px 3px 0px #111;
  }
  .slider:before {
    position: absolute;
    content: '';
    height: 18px;
    width: 18px;
    left: 4px;
    bottom: 3px;
    background-color: #111;
    transition: 0.2s;
  }
  input:checked + .slider {
    background-color: #0ea5e9;
  }
  input:checked + .slider:before {
    transform: translateX(28px);
    background-color: #fff;
  }

  .field-desc {
    font-weight: 600;
    color: #888;
    font-size: 0.85rem;
    margin-top: -0.2rem;
  }

  /* Preview Section */
  .sticky-pane {
    position: sticky;
    top: 2rem;
  }
  .header-actions {
    display: flex;
    gap: 0.5rem;
  }

  .code-display {
    width: 100%;
    min-height: 480px;
    border: 4px solid #111;
    padding: 1.5rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1rem;
    line-height: 1.5;
    background: #111;
    color: #0ea5e9;
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
    resize: vertical;
    outline: none;
    box-sizing: border-box;
  }

  .tips-box {
    background: #fdfae5;
    border: 3px solid #111;
    padding: 1.2rem;
    box-shadow: 4px 4px 0px #111;
  }
  .tip-title {
    margin: 0 0 1rem 0;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    font-size: 1.1rem;
    color: #111;
    border-bottom: 2px solid #111;
    padding-bottom: 0.5rem;
  }
  .brutal-ul {
    margin: 0;
    padding-left: 1.2rem;
    font-weight: 600;
    font-size: 0.85rem;
    line-height: 1.6;
    color: #333;
  }
  .brutal-ul code {
    background: #111;
    color: #ffd900;
    padding: 2px 5px;
  }

  .copy-btn {
    background: #ffd900;
  }
  .download-btn {
    background: #fff;
  }
  .mt-4 {
    margin-top: 1.5rem;
  }

  @media (max-width: 1024px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .sticky-pane {
      position: static;
    }
    .form-row {
      flex-direction: column;
    }
    .w-30 {
      width: 100%;
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
  [data-theme='dark'] .badge {
    border-color: #eee;
    box-shadow: 5px 5px 0px #eee;
  }

  [data-theme='dark'] .form-label {
    color: #eee;
  }
  [data-theme='dark'] .brutal-input {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #075985;
    color: #fff;
  }
  [data-theme='dark'] .bg-pink {
    background: #9d174d;
    color: #fff;
  }

  [data-theme='dark'] .delete-btn {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .small-action-btn {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }

  [data-theme='dark'] .slider {
    background: #222;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .slider:before {
    background-color: #eee;
  }

  [data-theme='dark'] .preset-card {
    background: #222;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .preset-card:hover:not(.active) {
    transform: translate(-3px, -3px);
    box-shadow: 7px 7px 0px #eee;
    background: #333;
  }
  [data-theme='dark'] .preset-card.active {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .preset-name {
    color: inherit;
  }

  [data-theme='dark'] .empty-env {
    border-color: #eee;
    color: #aaa;
  }
  [data-theme='dark'] .field-desc {
    color: #888;
  }

  [data-theme='dark'] .tips-box {
    background: #222;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .tip-title {
    color: #eee;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-ul {
    color: #aaa;
  }
</style>
