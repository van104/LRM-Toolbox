<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <!-- Header -->
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">Robots<span>.txt</span></h1>
        <div class="badge">🕷️ Crawler Protocol Generator</div>
      </header>

      <main class="brutal-grid">
        <!-- Configuration Section -->
        <section class="config-column">
          <!-- Global Settings -->
          <div class="brutal-pane">
            <div class="pane-header bg-yellow">
              <span>🌐 全局规则 (GLOBAL)</span>
            </div>
            <div class="pane-body">
              <div class="form-group">
                <label class="form-label">对所有爬虫 (*) 的策略</label>
                <div class="radio-group brutal-shadow">
                  <label class="radio-label" :class="{ active: defaultPolicy === 'allow' }">
                    <input v-model="defaultPolicy" type="radio" value="allow" />
                    🟢 全部允许 (Allow All)
                  </label>
                  <label class="radio-label" :class="{ active: defaultPolicy === 'disallow' }">
                    <input v-model="defaultPolicy" type="radio" value="disallow" />
                    🔴 全部禁止 (Disallow All)
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Sitemap 站点地图 (可选)</label>
                <input
                  v-model="sitemap"
                  type="text"
                  placeholder="https://example.com/sitemap.xml"
                  class="brutal-input"
                />
              </div>

              <div class="form-group">
                <label class="form-label">抓取延迟 Crawl-delay (秒)</label>
                <input
                  v-model.number="crawlDelay"
                  type="number"
                  min="0"
                  max="60"
                  class="brutal-input num-input"
                />
              </div>
            </div>
          </div>

          <!-- Path Rules -->
          <div class="brutal-pane">
            <div class="pane-header bg-blue">
              <span class="text-white">🛤️ 特定路径 (PATHS)</span>
              <button class="small-action-btn" @click="addRule">➕ 添加规则</button>
            </div>
            <div class="pane-body">
              <div class="rules-list">
                <div v-for="(rule, index) in pathRules" :key="index" class="rule-row">
                  <select v-model="rule.type" class="brutal-select">
                    <option value="Disallow">⛔ Disallow</option>
                    <option value="Allow">✅ Allow</option>
                  </select>
                  <input
                    v-model="rule.path"
                    type="text"
                    placeholder="/admin/ or /private/*.html"
                    class="brutal-input flex-1"
                  />
                  <button class="delete-btn" @click="removeRule(index)">✕</button>
                </div>
                <div v-if="pathRules.length === 0" class="empty-rules">
                  当前未配置任何特定路径规则
                </div>
              </div>
            </div>
          </div>

          <!-- Specific Bots -->
          <div class="brutal-pane">
            <div class="pane-header bg-green">
              <span>🤖 特定爬虫 (USER-AGENTS)</span>
            </div>
            <div class="pane-body">
              <p class="section-desc">选择要单独针对的搜索引擎爬虫配置：</p>
              <div class="bot-grid">
                <div
                  v-for="bot in availableBots"
                  :key="bot.id"
                  class="bot-card"
                  :class="{ active: bot.enabled }"
                >
                  <div class="bot-header">
                    <label class="bot-checkbox">
                      <input v-model="bot.enabled" type="checkbox" />
                      <span class="bot-name">{{ bot.name }}</span>
                    </label>
                  </div>
                  <div class="bot-ua">{{ bot.ua }}</div>

                  <div v-if="bot.enabled" class="bot-actions mt-3">
                    <div class="bot-radio-group">
                      <label :class="{ active: bot.policy === 'allow' }">
                        <input v-model="bot.policy" type="radio" value="allow" />
                        允许
                      </label>
                      <label :class="{ active: bot.policy === 'disallow' }">
                        <input v-model="bot.policy" type="radio" value="disallow" />
                        禁止
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Preview Section -->
        <aside class="preview-column">
          <div class="brutal-pane sticky-pane">
            <div class="pane-header bg-pink">
              <span>📝 预览区 (PREVIEW)</span>
              <div class="header-actions">
                <button class="small-action-btn copy-btn" @click="copyRobots">📋 复制</button>
                <button class="small-action-btn download-btn" @click="downloadRobots">
                  💾 下载
                </button>
              </div>
            </div>
            <div class="pane-body">
              <textarea
                v-model="generatedRobots"
                class="brutal-editor code-display"
                readonly
                spellcheck="false"
              ></textarea>

              <div class="seo-tips mt-4">
                <h3 class="tip-title">💡 SEO 技术建议</h3>
                <ul class="brutal-ul">
                  <li>生成的文件必须命名为 <code>robots.txt</code> 并放在网站根目录。</li>
                  <li><code>Disallow</code> 用于管理抓取预算，不是用来隐藏机密信息的。</li>
                  <li>
                    如果要彻底阻止某页面出现在搜索结果，请使用
                    <code>&lt;meta name="robots" content="noindex"&gt;</code>。
                  </li>
                  <li>不要禁止爬虫访问 CSS 或 JS 文件，这会影响现代搜索引擎渲染页面。</li>
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

  const defaultPolicy = ref('allow');
  const sitemap = ref('');
  const crawlDelay = ref(0);

  const pathRules = ref([
    { type: 'Disallow', path: '/admin/' },
    { type: 'Disallow', path: '/temp/' }
  ]);

  const addRule = () => pathRules.value.push({ type: 'Disallow', path: '' });
  const removeRule = (i: number) => pathRules.value.splice(i, 1);

  const availableBots = ref([
    { id: 'google', name: 'Googlebot', ua: 'Googlebot', enabled: false, policy: 'allow' },
    { id: 'bing', name: 'Bingbot', ua: 'Bingbot', enabled: false, policy: 'allow' },
    { id: 'baidu', name: 'Baiduspider', ua: 'Baiduspider', enabled: false, policy: 'allow' },
    { id: 'yandex', name: 'YandexBot', ua: 'Yandex', enabled: false, policy: 'allow' },
    { id: 'duck', name: 'DuckDuckBot', ua: 'DuckDuckBot', enabled: false, policy: 'allow' },
    { id: 'sogou', name: 'Sogou Spider', ua: 'Sogouspider', enabled: false, policy: 'allow' }
  ]);

  const generatedRobots = computed(() => {
    let content = ['# Generated by LRM Toolbox'];

    // User-agent: *
    content.push('User-agent: *');
    if (defaultPolicy.value === 'disallow') {
      content.push('Disallow: /');
    } else {
      pathRules.value.forEach(rule => {
        if (rule.path) {
          content.push(`${rule.type}: ${rule.path}`);
        }
      });
    }

    if (crawlDelay.value > 0) {
      content.push(`Crawl-delay: ${crawlDelay.value}`);
    }
    content.push('');

    // Specific bots
    availableBots.value.forEach(bot => {
      if (bot.enabled) {
        content.push(`# ${bot.name}`);
        content.push(`User-agent: ${bot.ua}`);
        if (bot.policy === 'disallow') {
          content.push('Disallow: /');
        } else {
          content.push('Allow: /');
        }
        content.push('');
      }
    });

    // Sitemap
    if (sitemap.value) {
      content.push(`Sitemap: ${sitemap.value}`);
    }

    return content.join('\n').trim();
  });

  const copyRobots = () => {
    copyToClipboard(generatedRobots.value, { success: 'Robots.txt 内容已复制到剪贴板！' });
  };

  const downloadRobots = () => {
    const blob = new Blob([generatedRobots.value], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
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
    text-shadow: 4px 4px 0px #ff4b4b;
  }

  .brutal-title span {
    color: #ff4b4b;
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
    color: #ff4b4b;
    padding: 0.5rem 1.2rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    border: 4px solid #ff4b4b;
    box-shadow: 5px 5px 0px #ff4b4b;
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
  .bg-green {
    background: #10b981;
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

  /* Form Elements */
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-label {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    color: #333;
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

  .num-input {
    max-width: 150px;
  }
  .flex-1 {
    flex: 1;
    min-width: 0;
  }

  .brutal-select {
    appearance: none;
    border: 3px solid #111;
    padding: 0.8rem 1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    background: #fff;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    outline: none;
  }

  /* Radio Group */
  .radio-group {
    display: flex;
    border: 3px solid #111;
    background: #fff;
  }
  .brutal-shadow {
    box-shadow: 4px 4px 0px #111;
  }

  .radio-label {
    flex: 1;
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-weight: 700;
    transition: all 0.2s;
    border-right: 3px solid #111;
  }
  .radio-label:last-child {
    border-right: none;
  }
  .radio-label input {
    display: none;
  }
  .radio-label:hover {
    background: #f0f0f0;
  }
  .radio-label.active {
    background: #111;
    color: #ffd900;
  }

  /* Rules List */
  .rules-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .rule-row {
    display: flex;
    gap: 0.75rem;
    align-items: stretch;
  }
  .delete-btn {
    background: #ff4b4b;
    color: #fff;
    border: 3px solid #111;
    font-weight: 900;
    width: 48px;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
  }
  .delete-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }
  .delete-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px #111;
  }

  .empty-rules {
    padding: 1rem;
    border: 3px dashed #111;
    text-align: center;
    font-weight: 600;
    color: #666;
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

  /* Bots Grid */
  .section-desc {
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  .bot-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  .bot-card {
    border: 3px solid #111;
    padding: 1rem;
    background: #fff;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.2s;
  }
  .bot-card.active {
    background: #eaffed;
    border-color: #10b981;
  }

  .bot-header {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  .bot-checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-weight: 800;
  }
  .bot-checkbox input {
    accent-color: #111;
    width: 1.2rem;
    height: 1.2rem;
    cursor: pointer;
  }
  .bot-name {
    font-size: 1.1rem;
  }
  .bot-ua {
    font-size: 0.8rem;
    color: #555;
    background: #fdfae5;
    padding: 2px 6px;
    border: 1px solid #ccc;
    display: inline-block;
  }

  .bot-radio-group {
    display: flex;
    gap: 1rem;
  }
  .bot-radio-group label {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    color: #444;
  }
  .bot-radio-group label.active {
    color: #111;
  }
  .bot-radio-group input {
    accent-color: #111;
  }
  .mt-3 {
    margin-top: 0.75rem;
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
    min-height: 350px;
    border: 4px solid #111;
    padding: 1.5rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1.1rem;
    line-height: 1.5;
    background: #111;
    color: #00ff66;
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
    resize: vertical;
    outline: none;
    box-sizing: border-box;
  }
  .code-display:focus {
    border-color: #ff7be5;
  }

  .mt-4 {
    margin-top: 1.5rem;
  }
  .seo-tips {
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
    font-size: 0.9rem;
    line-height: 1.6;
    color: #333;
  }
  .brutal-ul code {
    background: #111;
    color: #ffd900;
    padding: 2px 6px;
    font-family: 'IBM Plex Mono', monospace;
  }

  .copy-btn {
    background: #ffd900;
  }
  .download-btn {
    background: #fff;
  }

  @media (max-width: 1024px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .sticky-pane {
      position: static;
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
  [data-theme='dark'] .brutal-select {
    background: #222;
    color: #eee;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .radio-group {
    background: #222;
    border-color: #eee;
  }
  [data-theme='dark'] .radio-label {
    border-right-color: #eee;
  }
  [data-theme='dark'] .radio-label:hover {
    background: #333;
  }
  [data-theme='dark'] .radio-label.active {
    background: #eee;
    color: #111;
  }

  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #075985;
  }
  [data-theme='dark'] .bg-green {
    background: #065f46;
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

  [data-theme='dark'] .bot-card {
    background: #222;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .bot-card.active {
    background: #064e3b;
    border-color: #10b981;
  }
  [data-theme='dark'] .bot-ua {
    background: #111;
    border-color: #444;
    color: #aaa;
  }
  [data-theme='dark'] .bot-radio-group label {
    color: #aaa;
  }
  [data-theme='dark'] .bot-radio-group label.active {
    color: #eee;
  }

  [data-theme='dark'] .seo-tips {
    background: #222;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .tip-title {
    color: #eee;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-ul {
    color: #ccc;
  }
  [data-theme='dark'] .empty-rules {
    border-color: #eee;
    color: #aaa;
  }
</style>
