<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <!-- Header -->
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">UUID<span>.生成()</span></h1>
        <div class="badge">🎲 Random Unique ID</div>
      </header>

      <div class="brutal-grid">
        <!-- Sidebar Settings -->
        <aside class="brutal-pane settings-pane">
          <div class="pane-header bg-yellow">
            <span>⚙️ 核心配置 (CONFIG)</span>
          </div>
          <div class="pane-body">
            <!-- Count -->
            <div class="config-group">
              <label class="config-label">生成数量</label>
              <div class="num-input-wrap">
                <input
                  v-model.number="count"
                  type="number"
                  min="1"
                  max="100"
                  class="brutal-input num-input"
                />
                <span class="unit">条 (Max 100)</span>
              </div>
            </div>

            <!-- Version -->
            <div class="config-group">
              <label class="config-label">协议版本</label>
              <div class="radio-stack">
                <button
                  v-for="v in ['v4', 'v1']"
                  :key="v"
                  :class="['radio-btn', { active: version === v }]"
                  @click="
                    version = v;
                    generateBatch();
                  "
                >
                  <span class="radio-mark"></span>
                  <span class="radio-text">{{
                    v === 'v4' ? 'Version 4 (随机)' : 'Version 1 (时间)'
                  }}</span>
                </button>
              </div>
            </div>

            <!-- Formatting -->
            <div class="config-group">
              <label class="config-label">格式化设置</label>
              <div class="check-list">
                <button
                  :class="['check-btn', { active: uppercase }]"
                  @click="
                    uppercase = !uppercase;
                    generateBatch();
                  "
                >
                  <span class="check-mark"></span> 转换为大写
                </button>
                <button
                  :class="['check-btn', { active: hyphens }]"
                  @click="
                    hyphens = !hyphens;
                    generateBatch();
                  "
                >
                  <span class="check-mark"></span> 包含连字符 (-)
                </button>
                <button
                  :class="['check-btn', { active: braces }]"
                  @click="
                    braces = !braces;
                    generateBatch();
                  "
                >
                  <span class="check-mark"></span> 包含大括号 { }
                </button>
              </div>
            </div>

            <!-- Output Format -->
            <div class="config-group">
              <label class="config-label">输出类型</label>
              <select v-model="outputFormat" class="brutal-select">
                <option value="text">纯文本 (Lines)</option>
                <option value="json">JSON 数组</option>
                <option value="csv">CSV 列表</option>
              </select>
            </div>

            <button class="brutal-btn gen-btn" @click="generateBatch">
              <span class="gen-icon">🔄</span> 重新生成
            </button>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="result-area">
          <div class="brutal-pane output-pane">
            <div class="pane-header bg-green">
              <span>💎 生成结果 (RESULTS)</span>
              <div class="header-actions">
                <button class="action-btn copy-btn" @click="copyAll">📋 复制全部</button>
                <button class="action-btn dll-btn" @click="downloadText">💾 下载 .txt</button>
              </div>
            </div>
            <div class="code-view">
              <pre><code>{{ formattedResults }}</code></pre>
            </div>
          </div>

          <!-- Documentation Section -->
          <div class="brutal-pane info-pane">
            <div class="pane-header bg-blue">
              <span>📖 什么是 UUID？</span>
            </div>
            <div class="pane-body">
              <p>
                <strong>UUID</strong> (Universally Unique Identifier)
                是一种软件建构的标准。其目的是让分布式系统中的所有元素都能有唯一的辨识资讯，而不需要通过中央控制端来做辨识资讯的指定。
              </p>
              <ul class="brutal-list">
                <li><strong>v4</strong>：完全随机生成，基于密码学安全的伪随机数。</li>
                <li>
                  <strong>v1</strong>：基于当前时间戳、序列号以及节点 ID（通常为 MAC 地址）生成。
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useCopy } from '@/composables/useCopy';

  const { copyToClipboard } = useCopy();

  const count = ref(5);
  const version = ref('v4');
  const uppercase = ref(false);
  const hyphens = ref(true);
  const braces = ref(false);
  const outputFormat = ref('text');
  const results = ref<string[]>([]);

  const generateUUIDv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const generateUUIDv1 = () => {
    const now = Date.now();
    const random = Math.floor(Math.random() * 1000000000)
      .toString(16)
      .padStart(12, '0');
    const timeHex = now.toString(16).padStart(12, '0');
    return `${timeHex.slice(0, 8)}-${timeHex.slice(8)}-1000-8000-${random}`;
  };

  const generateBatch = () => {
    const newResults = [];
    const safeCount = Math.min(Math.max(1, count.value), 100);
    for (let i = 0; i < safeCount; i++) {
      let id = version.value === 'v4' ? generateUUIDv4() : generateUUIDv1();
      if (!hyphens.value) id = id.replace(/-/g, '');
      if (uppercase.value) id = id.toUpperCase();
      if (braces.value) id = `{${id}}`;
      newResults.push(id);
    }
    results.value = newResults;
  };

  const formattedResults = computed(() => {
    if (outputFormat.value === 'json') return JSON.stringify(results.value, null, 2);
    return results.value.join('\n');
  });

  const copyAll = async () => {
    await copyToClipboard(formattedResults.value, { success: '✔ 已成功复制全部' });
  };

  const downloadText = () => {
    const blob = new Blob([formattedResults.value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uuids-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  onMounted(generateBatch);
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
    text-shadow: 4px 4px 0px #10b981;
  }

  .brutal-title span {
    color: #10b981;
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
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
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
    background: #10b981;
    color: #fff;
    padding: 0.5rem 1.2rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    border: 4px solid #111;
    box-shadow: 5px 5px 0px #111;
  }

  /* Grid */
  .brutal-grid {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 2rem;
    align-items: start;
  }

  .brutal-pane {
    border: 4px solid #111;
    background: #fff;
    box-shadow: 10px 10px 0px #111;
    display: flex;
    flex-direction: column;
  }

  .pane-header {
    padding: 0.75rem 1.25rem;
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
  .bg-green {
    background: #10b981;
    color: #fff;
  }
  .bg-blue {
    background: #3b82f6;
    color: #fff;
  }

  .pane-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* Config Elements */
  .config-group {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }
  .config-label {
    font-size: 0.85rem;
    font-weight: 900;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .num-input-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .num-input {
    width: 100px;
    border: 3px solid #111;
    padding: 0.5rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1.2rem;
    font-weight: 700;
    box-shadow: 3px 3px 0px #111;
  }
  .unit {
    font-size: 0.8rem;
    font-weight: 700;
    color: #888;
  }

  .radio-stack {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }
  .radio-btn,
  .check-btn {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: #fff;
    border: 3px solid #111;
    padding: 0.6rem 0.8rem;
    font-family: 'IBM Plex Mono', sans-serif;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.1s;
    text-align: left;
  }
  .radio-mark,
  .check-mark {
    width: 14px;
    height: 14px;
    border: 3px solid #111;
    background: #fff;
    flex-shrink: 0;
  }
  .radio-mark {
    border-radius: 50%;
  }

  .radio-btn:hover,
  .check-btn:hover {
    background: #fdfae5;
  }
  .radio-btn.active .radio-mark,
  .check-btn.active .check-mark {
    background: #10b981;
  }
  .radio-btn.active,
  .check-btn.active {
    background: #eee;
  }

  .brutal-select {
    border: 3px solid #111;
    padding: 0.75rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1rem;
    font-weight: 700;
    box-shadow: 4px 4px 0px #111;
    outline: none;
    background: #fff;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
  }

  .gen-btn {
    background: #ff7c2e;
    margin-top: 0.5rem;
  }

  /* Results */
  .result-area {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .header-actions {
    display: flex;
    gap: 0.5rem;
  }
  .action-btn {
    border: 3px solid #111;
    background: #fff;
    padding: 0.3rem 0.7rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 0.8rem;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.1s;
  }
  .action-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
  }
  .copy-btn {
    background: #ffd900;
  }
  .dll-btn {
    background: #06b6d4;
  }

  .code-view {
    padding: 1.5rem;
    background: #111;
    min-height: 240px;
  }
  pre {
    margin: 0;
    white-space: pre-wrap;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1.1rem;
    color: #10b981;
    line-height: 1.6;
  }

  .brutal-list {
    margin: 1rem 0 0;
    padding-left: 1.25rem;
    font-weight: 600;
    font-size: 0.95rem;
    line-height: 1.8;
    color: #444;
  }

  @media (max-width: 900px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .brutal-title {
      font-size: 2.5rem;
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
    background: #065f46;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #1e3a8a;
  }

  [data-theme='dark'] .radio-btn,
  [data-theme='dark'] .check-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .radio-mark,
  [data-theme='dark'] .check-mark {
    border-color: #eee;
    background: #222;
  }
  [data-theme='dark'] .radio-btn.active,
  [data-theme='dark'] .check-btn.active {
    background: #333;
  }
  [data-theme='dark'] .radio-btn.active .radio-mark,
  [data-theme='dark'] .check-btn.active .check-mark {
    background: #10b981;
  }

  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .brutal-select {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .action-btn {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .copy-btn {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .dll-btn {
    background: #0891b2;
    color: #fff;
  }

  [data-theme='dark'] .brutal-list {
    color: #aaa;
  }
  [data-theme='dark'] .badge {
    border-color: #eee;
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
</style>
