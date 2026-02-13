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
        <h1 class="tool-title">Meta 标签生成器</h1>
        <span class="tool-subtitle">Meta Tag Generator</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="copyAll">
          <el-icon><CopyDocument /></el-icon>
          复制代码
        </el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="tool-layout">
        <aside class="tool-sidebar">
          <div class="panel glass-card">
            <h2 class="panel-title">
              <el-icon><Edit /></el-icon> 网站基础信息
            </h2>

            <div class="config-item">
              <label class="section-label">网页标题 (Title)</label>
              <el-input v-model="form.title" placeholder="例如: LRM 工具箱" />
            </div>

            <div class="config-item">
              <label class="section-label">网页描述 (Description)</label>
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="3"
                placeholder="简短描述您的网页内容..."
              />
            </div>

            <div class="config-item">
              <label class="section-label">关键词 (Keywords)</label>
              <el-input v-model="form.keywords" placeholder="关键词, 以英文逗号分隔" />
            </div>

            <div class="config-item">
              <label class="section-label">作者 (Author)</label>
              <el-input v-model="form.author" placeholder="网站作者名称" />
            </div>
          </div>

          <div class="panel glass-card mt-6">
            <h2 class="panel-title">
              <el-icon><Setting /></el-icon> 额外选项
            </h2>
            <div class="checkbox-list">
              <el-checkbox v-model="form.ogTags">生成 Open Graph 标签 (FB/IG)</el-checkbox>
              <el-checkbox v-model="form.twitterTags">生成 Twitter Card 标签</el-checkbox>
              <el-checkbox v-model="form.utf8">包含 Charset (UTF-8)</el-checkbox>
              <el-checkbox v-model="form.viewport">包含 Viewport (移动端适配)</el-checkbox>
              <div class="robots-config mt-2">
                <label class="small-label">Robots 指令</label>
                <el-select v-model="form.robots" size="small" class="full-width">
                  <el-option label="index, follow" value="index, follow" />
                  <el-option label="noindex, nofollow" value="noindex, nofollow" />
                  <el-option label="index, nofollow" value="index, nofollow" />
                  <el-option label="noindex, follow" value="noindex, follow" />
                </el-select>
              </div>
            </div>
          </div>
        </aside>

        <section class="tool-main">
          <div class="panel glass-card">
            <h2 class="panel-title">结果预览</h2>
            <div class="code-outer">
              <pre><code>{{ generatedTags }}</code></pre>
              <button class="copy-icon-btn" title="一键复制" @click="copyAll">
                <el-icon><CopyDocument /></el-icon>
              </button>
            </div>
          </div>

          <div class="panel glass-card mt-6">
            <h2 class="panel-title">浏览器预览效果</h2>
            <div class="search-preview">
              <div class="preview-title">{{ form.title || '网页标题显示在此' }}</div>
              <div class="preview-url">https://example.com/</div>
              <div class="preview-desc">{{ truncatedDesc }}</div>
            </div>

            <div v-if="form.ogTags" class="og-preview mt-6">
              <div class="og-card">
                <div class="og-image-placeholder">
                  <el-icon><Picture /></el-icon>
                  <span>og:image</span>
                </div>
                <div class="og-info">
                  <div class="og-site">EXAMPLE.COM</div>
                  <div class="og-title">{{ form.title || 'Open Graph Title' }}</div>
                  <div class="og-desc">{{ form.description || 'Open Graph Description' }}</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - Meta 标签生成器</footer>
  </div>
</template>

<script setup lang="ts">
  import { reactive, computed } from 'vue';
  import { ArrowLeft, Edit, Setting, CopyDocument, Picture } from '@element-plus/icons-vue';
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
      success: '标签已复制到剪贴板'
    });
  };
</script>

<style scoped>
  .tool-page {
    min-height: 100vh;
    background: #f1f5f9;
    display: flex;
    flex-direction: column;
  }

  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
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
    padding: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .tool-layout {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  @media (min-width: 1024px) {
    .tool-layout {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 1.5rem;
      align-items: start;
    }
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    padding: 24px;
  }

  .panel-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .config-item {
    margin-bottom: 20px;
  }

  .section-label {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 8px;
  }

  .checkbox-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .small-label {
    font-size: 0.75rem;
    color: #94a3b8;
    display: block;
    margin-bottom: 4px;
  }

  .code-outer {
    position: relative;
    background: #1e293b;
    border-radius: 12px;
    padding: 20px;
  }

  pre {
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: 'Fira Code', monospace;
    font-size: 0.95rem;
    color: #e2e8f0;
    line-height: 1.6;
  }

  .copy-icon-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    padding: 8px;
    border-radius: 6px;
    cursor: pointer;
  }

  .search-preview {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 20px;
  }

  .preview-title {
    font-size: 1.25rem;
    color: #1a0dab;
    margin-bottom: 4px;
    cursor: pointer;
  }
  .preview-title:hover {
    text-decoration: underline;
  }
  .preview-url {
    font-size: 0.875rem;
    color: #202124;
    margin-bottom: 8px;
  }
  .preview-desc {
    font-size: 0.875rem;
    color: #4d5156;
    line-height: 1.5;
  }

  .og-card {
    display: flex;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
    max-width: 500px;
  }

  .og-image-placeholder {
    width: 150px;
    background: #f1f5f9;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    font-size: 0.75rem;
    gap: 8px;
  }

  .og-image-placeholder .el-icon {
    font-size: 1.5rem;
  }

  .og-info {
    flex: 1;
    padding: 16px;
    background: white;
  }

  .og-site {
    font-size: 0.7rem;
    color: #64748b;
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .og-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 4px;
  }
  .og-desc {
    font-size: 0.8rem;
    color: #64748b;
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }

  .mt-6 {
    margin-top: 1.5rem;
  }
  .full-width {
    width: 100%;
  }
</style>
