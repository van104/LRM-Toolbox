<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <!-- Header -->
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">Meta<span>.生成()</span></h1>
        <div class="badge">🏷️ SEO & Social Meta Tags</div>
      </header>

      <div class="brutal-grid">
        <!-- Sidebar: Configuration -->
        <aside class="brutal-pane settings-pane">
          <div class="pane-header bg-yellow">
            <span>📝 网站基础信息 (SEO)</span>
          </div>
          <div class="pane-body">
            <div class="config-group">
              <label class="config-label">网页标题 (Title)</label>
              <input v-model="form.title" class="brutal-input" placeholder="例如: LRM 工具箱" />
            </div>

            <div class="config-group">
              <label class="config-label">网页描述 (Description)</label>
              <textarea
                v-model="form.description"
                class="brutal-textarea"
                rows="3"
                placeholder="简短描述您的网页内容..."
              ></textarea>
            </div>

            <div class="config-group">
              <label class="config-label">关键词 (Keywords)</label>
              <input
                v-model="form.keywords"
                class="brutal-input"
                placeholder="关键词, 以英文逗号分隔"
              />
            </div>

            <div class="config-group">
              <label class="config-label">作者 (Author)</label>
              <input v-model="form.author" class="brutal-input" placeholder="网站作者名称" />
            </div>

            <div class="pane-divider"></div>

            <div class="config-group">
              <label class="config-label">额外选项 (OPTIONS)</label>
              <div class="check-list">
                <button
                  :class="['check-btn', { active: form.ogTags }]"
                  @click="form.ogTags = !form.ogTags"
                >
                  <span class="check-mark"></span> Open Graph (FB/IG)
                </button>
                <button
                  :class="['check-btn', { active: form.twitterTags }]"
                  @click="form.twitterTags = !form.twitterTags"
                >
                  <span class="check-mark"></span> Twitter Card
                </button>
                <button
                  :class="['check-btn', { active: form.utf8 }]"
                  @click="form.utf8 = !form.utf8"
                >
                  <span class="check-mark"></span> UTF-8 Charset
                </button>
                <button
                  :class="['check-btn', { active: form.viewport }]"
                  @click="form.viewport = !form.viewport"
                >
                  <span class="check-mark"></span> Viewport 适配
                </button>
              </div>
            </div>

            <div class="config-group">
              <label class="config-label">Robots 指令</label>
              <select v-model="form.robots" class="brutal-select">
                <option value="index, follow">index, follow (默认)</option>
                <option value="noindex, nofollow">noindex, nofollow</option>
                <option value="index, nofollow">index, nofollow</option>
                <option value="noindex, follow">noindex, follow</option>
              </select>
            </div>
          </div>
        </aside>

        <!-- Main Content: Result & Preview -->
        <main class="result-area">
          <!-- Code Output -->
          <div class="brutal-pane output-pane">
            <div class="pane-header bg-green">
              <span>💎 生成源码 (TAGS)</span>
              <button class="action-btn copy-btn" @click="copyAll">📋 复制代码</button>
            </div>
            <div class="code-view">
              <pre><code>{{ generatedTags }}</code></pre>
            </div>
          </div>

          <!-- Live Preview -->
          <div class="brutal-pane preview-pane">
            <div class="pane-header bg-blue">
              <span>👀 效果预览 (PREVIEW)</span>
            </div>
            <div class="pane-body">
              <h3 class="preview-sub-title">谷歌搜索预览</h3>
              <div class="google-preview brutal-box">
                <div class="preview-title">{{ form.title || '网页标题显示在此' }}</div>
                <div class="preview-url">https://lrm-toolbox.com/ › tools</div>
                <div class="preview-desc">{{ truncatedDesc }}</div>
              </div>

              <template v-if="form.ogTags">
                <h3 class="preview-sub-title mt-6">社交媒体预览 (Open Graph)</h3>
                <div class="og-preview brutal-box">
                  <div class="og-image-box">
                    <span class="img-icon">🖼️</span>
                    <span class="img-label">og:image</span>
                  </div>
                  <div class="og-info">
                    <div class="og-site">LRM-TOOLBOX.COM</div>
                    <div class="og-title">{{ form.title || 'Open Graph Title' }}</div>
                    <div class="og-desc">
                      {{ form.description || 'Open Graph Description displayed here...' }}
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, computed } from 'vue';
  import { useCopy } from '@/composables/useCopy';

  const { copyToClipboard } = useCopy();

  const form = reactive({
    title: '',
    description: '',
    keywords: '',
    author: '',
    viewport: true,
    utf8: true,
    robots: 'index, follow',
    ogTags: true,
    twitterTags: true
  });

  const generatedTags = computed(() => {
    let tags = [];
    if (form.utf8) tags.push('<meta charset="UTF-8">');
    if (form.viewport)
      tags.push('<meta name="viewport" content="width=device-width, initial-scale=1.0">');

    if (form.title) tags.push(`<title>${form.title}</title>`);
    if (form.description) tags.push(`<meta name="description" content="${form.description}">`);
    if (form.keywords) tags.push(`<meta name="keywords" content="${form.keywords}">`);
    if (form.author) tags.push(`<meta name="author" content="${form.author}">`);
    if (form.robots) tags.push(`<meta name="robots" content="${form.robots}">`);

    if (form.ogTags) {
      tags.push('');
      tags.push('<!-- Open Graph / Facebook -->');
      tags.push('<meta property="og:type" content="website">');
      tags.push(`<meta property="og:title" content="${form.title}">`);
      tags.push(`<meta property="og:description" content="${form.description}">`);
      tags.push('<meta property="og:url" content="https://example.com/">');
      tags.push('<meta property="og:image" content="https://example.com/image.jpg">');
    }

    if (form.twitterTags) {
      tags.push('');
      tags.push('<!-- Twitter -->');
      tags.push('<meta property="twitter:card" content="summary_large_image">');
      tags.push(`<meta property="twitter:title" content="${form.title}">`);
      tags.push(`<meta property="twitter:description" content="${form.description}">`);
      tags.push('<meta property="twitter:url" content="https://example.com/">');
      tags.push('<meta property="twitter:image" content="https://example.com/image.jpg">');
    }

    return tags.join('\n');
  });

  const truncatedDesc = computed(() => {
    if (!form.description)
      return '网页描述显示在这里，搜索引擎通常会截取前 150-160 个字符作为摘要展示在搜索结果中。';
    return form.description.length > 155
      ? form.description.slice(0, 155) + '...'
      : form.description;
  });

  const copyAll = async () => {
    await copyToClipboard(generatedTags.value, {
      success: '✔ 标签已复制到剪贴板'
    });
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
    text-shadow: 4px 4px 0px #3b82f6;
  }

  .brutal-title span {
    color: #3b82f6;
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
    background: #3b82f6;
    color: #fff;
    padding: 0.5rem 1.2rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    border: 4px solid #111;
    box-shadow: 5px 5px 0px #111;
  }

  /* Grid Interface */
  .brutal-grid {
    display: grid;
    grid-template-columns: 340px 1fr;
    gap: 2rem;
    align-items: start;
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
    padding: 0.8rem 1.25rem;
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
    gap: 1.25rem;
  }

  /* Forms */
  .config-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .config-label {
    font-size: 0.8rem;
    font-weight: 900;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .brutal-input,
  .brutal-textarea,
  .brutal-select {
    width: 100%;
    border: 3px solid #111;
    padding: 0.75rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.95rem;
    font-weight: 700;
    background: #fff;
    box-shadow: 4px 4px 0px #111;
    outline: none;
    box-sizing: border-box;
  }
  .brutal-textarea {
    resize: vertical;
    min-height: 80px;
  }
  .brutal-input:focus,
  .brutal-textarea:focus {
    background: #fdfae5;
  }

  .pane-divider {
    height: 4px;
    background: #111;
    margin: 0.5rem 0;
  }

  /* Multi-Check List */
  .check-list {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }
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
  .check-mark {
    width: 14px;
    height: 14px;
    border: 3px solid #111;
    background: #fff;
    flex-shrink: 0;
  }
  .check-btn:hover {
    background: #eee;
  }
  .check-btn.active .check-mark {
    background: #3b82f6;
  }
  .check-btn.active {
    background: #f8fafc;
  }

  /* Result Pane */
  .action-btn {
    border: 3px solid #111;
    background: #ffd900;
    padding: 0.3rem 0.8rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 0.85rem;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.1s;
  }
  .action-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
  }

  .code-view {
    padding: 1.5rem;
    background: #111;
    min-height: 180px;
  }
  pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.95rem;
    color: #10b981;
    line-height: 1.6;
  }

  /* Preview Section */
  .preview-sub-title {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    color: #444;
    margin: 0.5rem 0 0;
  }
  .brutal-box {
    border: 3px solid #111;
    padding: 1.25rem;
    background: #fff;
    box-shadow: 5px 5px 0px #111;
  }

  .google-preview {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .preview-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1a0dab;
  }
  .preview-url {
    font-size: 0.85rem;
    color: #202124;
  }
  .preview-desc {
    font-size: 0.9rem;
    color: #4d5156;
    line-height: 1.4;
    word-break: break-all;
  }

  .og-preview {
    display: flex;
    gap: 0;
    border: 4px solid #111;
    overflow: hidden;
    box-shadow: 6px 6px 0px #111;
    max-width: 500px;
  }
  .og-image-box {
    width: 140px;
    background: #eee;
    border-right: 4px solid #111;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    color: #999;
  }
  .img-icon {
    font-size: 2rem;
  }
  .img-label {
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
  }
  .og-info {
    flex: 1;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .og-site {
    font-size: 0.7rem;
    font-weight: 800;
    color: #999;
    text-transform: uppercase;
  }
  .og-title {
    font-size: 1rem;
    font-weight: 900;
    color: #111;
  }
  .og-desc {
    font-size: 0.8rem;
    color: #666;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  @media (max-width: 900px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .brutal-title {
      font-size: 2.2rem;
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

  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .brutal-textarea,
  [data-theme='dark'] .brutal-select {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .check-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .check-mark {
    border-color: #eee;
    background: #222;
  }
  [data-theme='dark'] .check-btn.active {
    background: #333;
  }
  [data-theme='dark'] .pane-divider {
    background: #eee;
  }

  [data-theme='dark'] .action-btn {
    background: #b28f00;
    border-color: #eee;
    color: #fff;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .brutal-box {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .og-preview {
    border-color: #eee;
  }
  [data-theme='dark'] .og-image-box {
    background: #222;
    border-right-color: #eee;
  }
  [data-theme='dark'] .preview-title {
    color: #8ab4f8;
  }
  [data-theme='dark'] .preview-url,
  [data-theme='dark'] .preview-desc,
  [data-theme='dark'] .og-title,
  [data-theme='dark'] .og-desc {
    color: #eee;
  }
</style>
