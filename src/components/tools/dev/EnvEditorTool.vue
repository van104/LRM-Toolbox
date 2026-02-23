<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">模版<span>变量()</span></h1>
        <div class="header-actions">
          <button class="brutal-title-btn" @click="exportExample">💾 导出模版</button>
          <div class="badge">⚙️ ENV Editor</div>
        </div>
      </header>

      <main class="brutal-grid">
        <!-- Sidebar -->
        <aside class="tool-sidebar">
          <div class="brutal-pane">
            <div class="pane-header bg-yellow">
              <span>📥 快速解析 (IMPORT)</span>
            </div>
            <div class="pane-body padding-sm">
              <p class="sidebar-desc">// 粘贴您的 .env 内容或手动提取</p>
              <textarea
                v-model="rawContent"
                class="brutal-textarea mb-4"
                rows="8"
                placeholder="DB_HOST=127.0.0.1
DB_PORT=3306"
                spellcheck="false"
              ></textarea>
              <button class="action-btn w-full text-center" @click="parseRaw">▶ 解析并加载</button>
            </div>
          </div>

          <div class="brutal-pane mt-6">
            <div class="pane-header bg-pink">
              <span class="text-white">🔒 安全增强 (SECURITY)</span>
            </div>
            <div class="pane-body padding-sm">
              <div class="brutal-switch-row">
                <span class="brutal-label mb-0">一键脱敏导出</span>
                <label class="brutal-switch">
                  <input v-model="maskValues" type="checkbox" />
                  <span class="slider"></span>
                </label>
              </div>
              <p class="sidebar-desc mt-3">// 启用后导出的文件会将值替换为 your_value_here。</p>
            </div>
          </div>
        </aside>

        <!-- Main Editor -->
        <div class="tool-main">
          <div class="brutal-pane">
            <div class="pane-header bg-blue">
              <span class="text-white">🧪 可视化工作区 (WORKSPACE)</span>
              <button class="small-action-btn" @click="addRow">+ 新增变量</button>
            </div>

            <div class="pane-body env-table-wrap">
              <div v-if="envVars.length === 0" class="empty-state">
                📜 环境变量为空，请在左侧解析或点击上方新增。
              </div>
              <div v-else class="brutal-table">
                <div class="table-head">
                  <div class="th-key">Key (变量名)</div>
                  <div class="th-val">Value (值)</div>
                  <div class="th-desc">备注</div>
                  <div class="th-ctrl">操作</div>
                </div>

                <div v-for="(row, index) in envVars" :key="index" class="table-row">
                  <div class="td-key">
                    <input v-model="row.key" class="brutal-input" placeholder="API_KEY" />
                  </div>
                  <div class="td-val">
                    <div class="input-with-icon">
                      <input
                        v-model="row.value"
                        class="brutal-input flex-1"
                        placeholder="your_secret_here"
                        :type="row.masked ? 'password' : 'text'"
                        spellcheck="false"
                      />
                      <button class="icon-btn" @click="row.masked = !row.masked">
                        <span v-if="!row.masked">👁️</span>
                        <span v-else>🙈</span>
                      </button>
                    </div>
                  </div>
                  <div class="td-desc">
                    <input v-model="row.comment" class="brutal-input" placeholder="端口/用途" />
                  </div>
                  <div class="td-ctrl">
                    <button class="danger-icon-btn" @click="removeRow(index)">✖</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  interface EnvVar {
    key: string;
    value: string;
    comment: string;
    masked: boolean;
  }

  const envVars = ref<EnvVar[]>([
    { key: 'APP_NAME', value: 'MyAwesomeApp', comment: '应用项目名称', masked: false },
    { key: 'DB_PASSWORD', value: 'secret123', comment: '核心数据库密码', masked: true }
  ]);

  const rawContent = ref('');
  const maskValues = ref(true);
  const addRow = () => {
    envVars.value.push({ key: '', value: '', comment: '', masked: false });
  };

  const removeRow = (index: number) => {
    envVars.value.splice(index, 1);
  };

  const parseRaw = () => {
    if (!rawContent.value.trim()) {
      alert('⚠️ 请先粘贴内容再解析！');
      return;
    }

    const lines = rawContent.value.split('\n');
    const newVars: EnvVar[] = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      const parts = trimmed.split('=');
      const key = parts[0]?.trim() || '';
      let value = parts.slice(1).join('=')?.trim() || '';
      let comment = '';

      if (value.includes('#')) {
        const valParts = value.split('#');
        value = valParts[0].trim();
        comment = valParts.slice(1).join('#').trim();
      }

      if (key) {
        newVars.push({
          key,
          value,
          comment,
          masked:
            key.toLowerCase().includes('key') ||
            key.toLowerCase().includes('pass') ||
            key.toLowerCase().includes('secret')
        });
      }
    });

    if (newVars.length > 0) {
      envVars.value = newVars;
      rawContent.value = '';
    } else {
      alert('⚠️ 解析失败，请检查是否包含有效的 Key=Value 格式');
    }
  };

  const exportExample = () => {
    if (envVars.value.length === 0) {
      alert('⚠️ 没有可导出的数据');
      return;
    }

    let content = '# Generated by LRM Toolbox Environment Editor\n\n';
    envVars.value.forEach(v => {
      if (v.comment) content += `# ${v.comment}\n`;
      const exportValue = maskValues.value ? 'your_value_here' : v.value;
      content += `${v.key}=${exportValue}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = maskValues.value ? '.env.example' : '.env';
    a.click();
    URL.revokeObjectURL(url);
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
    text-shadow: 4px 4px 0px #3b82f6;
  }
  .brutal-title span {
    color: #3b82f6;
    text-shadow: 4px 4px 0px #111;
    letter-spacing: 0;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .badge {
    background: #111;
    color: #ffd900;
    padding: 0.5rem 1.2rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    border: 4px solid #ffd900;
    box-shadow: 5px 5px 0px #ffd900;
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

  .brutal-title-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.5rem 1rem;
    font-family: 'Syne', sans-serif;
    font-size: 1rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }
  .brutal-title-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }
  .brutal-title-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px transparent;
  }

  /* Main Grid */
  .brutal-grid {
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: 2.5rem;
    align-items: start;
  }

  .tool-sidebar {
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
    font-weight: 900;
    font-size: 1.1rem;
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
    display: flex;
    flex-direction: column;
  }
  .padding-sm {
    padding: 1.5rem;
  }

  /* Utilities */
  .sidebar-desc {
    font-size: 0.9rem;
    font-weight: 700;
    color: #555;
    margin: 0 0 1rem 0;
    font-family: 'IBM Plex Mono', monospace;
  }
  .mb-4 {
    margin-bottom: 1rem;
  }
  .mt-3 {
    margin-top: 1rem;
  }
  .mt-6 {
    margin-top: 1.5rem;
  }
  .w-full {
    width: 100%;
    box-sizing: border-box;
  }
  .text-center {
    text-align: center;
  }
  .flex-1 {
    flex: 1;
    min-width: 0;
  }

  .brutal-textarea {
    width: 100%;
    min-height: 200px;
    border: 3px solid #111;
    padding: 1rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.95rem;
    background: #111;
    color: #fff;
    resize: vertical;
    outline: none;
    box-shadow: inset 0 0 10px #000;
    box-sizing: border-box;
  }
  .brutal-textarea:focus {
    border-color: #ffd900;
  }

  .brutal-input {
    width: 100%;
    border: 3px solid #111;
    padding: 0.75rem 1rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1rem;
    font-weight: 700;
    background: #fff;
    color: #111;
    outline: none;
    box-sizing: border-box;
    transition: all 0.2s;
  }
  .brutal-input:focus {
    background: #fdfae5;
    border-color: #0ea5e9;
    transform: translate(-2px, -2px);
    box-shadow: 4px 4px 0px #111;
  }

  .action-btn {
    background: #111;
    color: #fff;
    border: 3px solid #111;
    padding: 0.8rem;
    font-weight: 800;
    font-family: 'Syne', sans-serif;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
  }
  .action-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
    background: #333;
  }
  .action-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px transparent;
  }

  .small-action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.4rem 1rem;
    font-weight: 800;
    font-family: 'Syne', sans-serif;
    font-size: 0.9rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
  }
  .small-action-btn:hover {
    background: #fdfae5;
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0px #111;
  }

  /* Switch */
  .brutal-switch-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
  }
  .brutal-label {
    font-weight: 900;
    font-size: 1rem;
    font-family: 'Syne', sans-serif;
  }
  .mb-0 {
    margin-bottom: 0;
  }

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
    background-color: #10b981;
  }
  input:checked + .slider:before {
    transform: translateX(28px);
    background-color: #fff;
  }

  /* Work Table */
  .env-table-wrap {
    padding: 0;
    min-height: 400px;
  }

  .empty-state {
    padding: 4rem 2rem;
    text-align: center;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 900;
    color: #111;
    font-size: 1.1rem;
    background: #fdfae5;
    background-image: radial-gradient(#aaa 1px, transparent 0);
    background-size: 20px 20px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .brutal-table {
    display: flex;
    flex-direction: column;
  }

  .table-head {
    display: flex;
    background: #eee;
    border-bottom: 4px solid #111;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 900;
    font-size: 0.9rem;
    color: #111;
  }
  .table-head > div {
    padding: 1rem;
    border-right: 4px solid #111;
  }
  .table-head > div:last-child {
    border-right: none;
  }

  .th-key {
    width: 30%;
  }
  .th-val {
    flex: 1;
  }
  .th-desc {
    width: 20%;
  }
  .th-ctrl {
    width: 80px;
    text-align: center;
  }

  .table-row {
    display: flex;
    border-bottom: 3px solid #111;
    background: #fff;
    align-items: center;
  }
  .table-row:last-child {
    border-bottom: none;
  }
  .table-row > div {
    padding: 0.8rem 1rem;
    border-right: 3px dashed #ccc;
    display: flex;
    align-items: center;
  }
  .table-row > div:last-child {
    border-right: none;
    justify-content: center;
  }

  .td-key {
    width: 30%;
  }
  .td-val {
    flex: 1;
  }
  .td-desc {
    width: 20%;
  }
  .td-ctrl {
    width: 80px;
  }

  .input-with-icon {
    display: flex;
    width: 100%;
    gap: 0.5rem;
    align-items: stretch;
  }

  .icon-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 2px 2px 0px #111;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
  }
  .icon-btn:hover {
    background: #eee;
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
  }

  .danger-icon-btn {
    background: #ff4b4b;
    color: #fff;
    border: 3px solid #111;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-weight: 900;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.2s;
  }
  .danger-icon-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 4px 4px 0px #111;
  }
  .danger-icon-btn:active {
    transform: translate(2px, 2px);
    box-shadow: 0px 0px 0px transparent;
  }

  @media (max-width: 1024px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .table-head {
      display: none;
    }
    .table-row {
      flex-direction: column;
      align-items: stretch;
      border-bottom: 5px solid #111;
    }
    .table-row > div {
      width: 100%;
      border-right: none;
      border-bottom: 2px dashed #ccc;
    }
    .table-row > div:last-child {
      border-bottom: none;
    }
    .th-ctrl,
    .td-ctrl {
      width: auto;
      justify-content: flex-start;
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
  [data-theme='dark'] .brutal-title-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .small-action-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .badge {
    border-color: #eee;
    box-shadow: 5px 5px 0px #eee;
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

  [data-theme='dark'] .brutal-textarea {
    border-color: #eee;
  }
  [data-theme='dark'] .action-btn {
    background: #eee;
    color: #111;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .sidebar-desc {
    color: #aaa;
  }

  [data-theme='dark'] .slider {
    background: #222;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .slider:before {
    background-color: #eee;
  }

  [data-theme='dark'] .empty-state {
    background-color: #1a1a1a;
    background-image: radial-gradient(#555 1px, transparent 0);
    color: #eee;
  }
  [data-theme='dark'] .table-head {
    background: #222;
    border-bottom-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .table-head > div {
    border-right-color: #eee;
  }
  [data-theme='dark'] .table-row {
    background: #1a1a1a;
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .table-row > div {
    border-right-color: #555;
  }
  [data-theme='dark'] .brutal-input {
    background: #222;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-input:focus {
    background: #333;
  }
  [data-theme='dark'] .icon-btn {
    background: #222;
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
    color: #eee;
  }
  [data-theme='dark'] .danger-icon-btn {
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
</style>
