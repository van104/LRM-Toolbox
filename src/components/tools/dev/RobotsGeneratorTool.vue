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
        <h1 class="tool-title">Robots.txt 生成器</h1>
        <span class="tool-subtitle">Robots.txt Protocol Generator</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="copyRobots">
          <el-icon><CopyDocument /></el-icon>
          复制文件
        </el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="tool-layout">
        <section class="config-section">
          <!-- 默认规则 -->
          <div class="panel glass-card mb-6">
            <h2 class="panel-title">全局设置</h2>
            <el-form label-position="top">
              <el-form-item label="默认对所有爬虫 (*) 的策略">
                <el-radio-group v-model="defaultPolicy">
                  <el-radio label="allow">全部允许 (Allow All)</el-radio>
                  <el-radio label="disallow">全部禁止 (Disallow All)</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="Sitemap 地址 (可选)">
                <el-input v-model="sitemap" placeholder="https://example.com/sitemap.xml" />
              </el-form-item>

              <el-form-item label="抓取延迟 (Crawl-delay, 秒)">
                <el-input-number v-model="crawlDelay" :min="0" :max="60" />
              </el-form-item>
            </el-form>
          </div>

          <!-- 特定路径规则 -->
          <div class="panel glass-card mb-6">
            <h2 class="panel-title">路径访问规则</h2>
            <div class="rules-container">
              <div v-for="(rule, index) in pathRules" :key="index" class="rule-row">
                <el-select v-model="rule.type" class="rule-type">
                  <el-option label="Disallow (禁止)" value="Disallow" />
                  <el-option label="Allow (允许)" value="Allow" />
                </el-select>
                <el-input v-model="rule.path" placeholder="/admin/ or /private/*.html" />
                <el-button :icon="Delete" circle @click="removeRule(index)" />
              </div>
              <el-button type="primary" link :icon="Plus" @click="addRule">添加路径规则</el-button>
            </div>
          </div>

          <!-- 预设爬虫禁用 -->
          <div class="panel glass-card">
            <h2 class="panel-title">特定爬虫设置 (User-Agents)</h2>
            <p class="description mb-4">选择你想要特别针对的搜索引擎爬虫：</p>
            <div class="bot-grid">
              <div v-for="bot in availableBots" :key="bot.id" class="bot-item">
                <el-checkbox v-model="bot.enabled">
                  <b>{{ bot.name }}</b>
                  <span class="bot-ua">({{ bot.ua }})</span>
                </el-checkbox>
                <div v-if="bot.enabled" class="bot-rules mt-2">
                  <el-radio-group v-model="bot.policy" size="small">
                    <el-radio label="allow">允许</el-radio>
                    <el-radio label="disallow">禁止</el-radio>
                  </el-radio-group>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 结果预览 -->
        <aside class="result-section">
          <div class="panel glass-card result-card">
            <div class="result-header">
              <h2 class="panel-title mb-0">Robots.txt 内容</h2>
              <div class="actions">
                <el-button type="primary" size="small" @click="copyRobots">复制</el-button>
                <el-button type="success" size="small" @click="downloadRobots">下载</el-button>
              </div>
            </div>
            <div class="code-preview">
              <pre><code>{{ generatedRobots }}</code></pre>
            </div>

            <div class="seo-tips mt-6">
              <h3 class="tip-title">
                <el-icon><InfoFilled /></el-icon> SEO 建议
              </h3>
              <ul class="tip-list">
                <li>将生成的 <code>robots.txt</code> 文件放置在网站的根目录下。</li>
                <li><code>Disallow</code> 并不是为了隐藏内容，而是为了节省抓取配额。</li>
                <li>如果你希望某些页面不出现在搜索结果中，请使用 <code>noindex</code> 标签。</li>
                <li>避免禁止抓取 CSS 和 JS 文件，这会影响搜索引擎对页面布局的理解。</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - Robots.txt 生成器</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { ArrowLeft, Plus, Delete, CopyDocument, InfoFilled } from '@element-plus/icons-vue';
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
    let content = ['# Generated by LRM Toolbox Robots.txt Generator'];

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

    return content.join('\n');
  });

  const copyRobots = () => {
    copyToClipboard(generatedRobots.value, { success: 'Robots.txt 内容已复制' });
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

  .description {
    font-size: 0.9rem;
    color: #64748b;
  }

  .rules-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .rule-row {
    display: flex;
    gap: 10px;
  }

  .rule-type {
    width: 150px;
  }

  .bot-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }

  .bot-item {
    padding: 1rem;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
  }

  .bot-ua {
    font-size: 0.75rem;
    color: #94a3b8;
    font-weight: normal;
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
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1.5rem;
    min-height: 200px;
  }

  .code-preview pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
  }

  .code-preview code {
    color: #334155;
    font-family: 'Fira Code', 'Courier New', monospace;
    font-size: 0.9rem;
  }

  .seo-tips {
    background: #f0fdf4;
    border-radius: 8px;
    padding: 16px;
    border-left: 4px solid #22c55e;
  }

  .tip-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    color: #166534;
    margin: 0 0 8px 0;
  }

  .tip-list {
    padding-left: 20px;
    margin: 0;
  }

  .tip-list li {
    font-size: 0.8rem;
    color: #16a34a;
    margin-bottom: 4px;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
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
  .mt-2 {
    margin-top: 0.5rem;
  }
  .mt-4 {
    margin-top: 1rem;
  }
  .mt-6 {
    margin-top: 1.5rem;
  }
</style>
