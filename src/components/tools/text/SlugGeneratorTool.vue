<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon><span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">URL Slug 生成器</h1>
        <span class="tool-subtitle">URL Slug Generator</span>
      </div>
      <div class="header-right">
        <el-button type="primary" :icon="DocumentCopy" @click="copyResult">复制 Slug</el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="layout-container">
        <div class="input-section glass-card">
          <div class="section-title">
            <el-icon><EditPen /></el-icon>
            <span>原始标题/文本</span>
          </div>
          <el-input
            v-model="inputText"
            type="textarea"
            :rows="4"
            placeholder="在此输入需要转换的标题，支持中英文混排..."
            @input="generateSlug"
          />

          <div class="config-bar">
            <div class="config-item">
              <span class="label">连接符</span>
              <el-radio-group v-model="config.separator" @change="generateSlug">
                <el-radio-button label="-">连字符 (-)</el-radio-button>
                <el-radio-button label="_">下划线 (_)</el-radio-button>
                <el-radio-button label=".">点 (.)</el-radio-button>
              </el-radio-group>
            </div>
            <div class="config-item">
              <span class="label">字母大小写</span>
              <el-radio-group v-model="config.case" @change="generateSlug">
                <el-radio-button label="lower">全小写</el-radio-button>
                <el-radio-button label="upper">全大写</el-radio-button>
                <el-radio-button label="original">保持原样</el-radio-button>
              </el-radio-group>
            </div>
            <div class="config-item">
              <el-checkbox v-model="config.chineseToPinyin" @change="generateSlug"
                >中文转拼音</el-checkbox
              >
            </div>
          </div>
        </div>

        <div class="result-section glass-card">
          <div class="section-title">
            <el-icon><Link /></el-icon>
            <span>生成结果</span>
          </div>
          <div class="slug-preview" :class="{ 'has-content': slugResult }">
            <div v-if="slugResult" class="slug-text">{{ slugResult }}</div>
            <div v-else class="empty-hint">等待输入标题...</div>
          </div>

          <div v-if="slugResult" class="full-url-preview">
            <span class="url-label">示例 URL:</span>
            <code class="url-text">https://example.com/blog/{{ slugResult }}</code>
          </div>
        </div>
      </div>

      <div class="tips-section glass-card">
        <div class="tips-header">
          <el-icon><InfoFilled /></el-icon>
          <h4>关于 URL Slug</h4>
        </div>
        <div class="tips-content">
          <ul class="premium-list">
            <li><b>什么是 Slug</b>：Slug 是 URL 中可读性较强的一部分，通常用于标识具体内容。</li>
            <li><b>SEO 友好</b>：包含关键词的 Slug 有助于搜索引擎优化，提高内容排名。</li>
            <li>
              <b>语义化</b>：相比随机 ID，语义化的 Slug (`/how-to-make-coffee`)
              更容易让用户理解页面内容。
            </li>
            <li>
              <b>中文处理</b>：本工具支持将中文字符智能转换为拼音，解决直接在 URL
              中使用中文导致的编码乱码问题。
            </li>
          </ul>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - URL Slug 生成器</footer>
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { ArrowLeft, DocumentCopy, Link, EditPen, InfoFilled } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';
  import { pinyin } from 'pinyin-pro';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const inputText = ref('');
  const slugResult = ref('');

  const config = reactive({
    separator: '-',
    case: 'lower',
    chineseToPinyin: true
  });

  const generateSlug = () => {
    if (!inputText.value.trim()) {
      slugResult.value = '';
      return;
    }

    let text = inputText.value.trim();

    if (config.chineseToPinyin) {
      // 使用 pinyin-pro 处理中文字符
      text = pinyin(text, {
        toneType: 'none',
        type: 'string',
        nonZh: 'consecutive'
      });
    }

    // 移除非字母数字和空格外的字符
    text = text.replace(/[^\w\s-]/gi, '');

    // 将空格和多个连接符替换为单个连接符
    const sep = config.separator;
    text = text.replace(/[\s\-_.]+/g, sep);

    // 处理大小写
    if (config.case === 'lower') {
      text = text.toLowerCase();
    } else if (config.case === 'upper') {
      text = text.toUpperCase();
    }

    // 去掉首尾的连接符
    const escapedSep = sep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const reStart = new RegExp('^' + escapedSep + '+');
    const reEnd = new RegExp(escapedSep + '+$');
    text = text.replace(reStart, '').replace(reEnd, '');

    slugResult.value = text;
  };

  const copyResult = () => {
    if (!slugResult.value) return;
    navigator.clipboard.writeText(slugResult.value).then(() => {
      ElMessage.success('Slug 已复制');
    });
  };

  onMounted(() => {
    inputText.value = '2026年我的第一个前端项目';
    generateSlug();
  });
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
    max-width: 900px;
    margin: 0 auto;
    width: 100%;
  }

  .layout-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    padding: 1.5rem;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: #475569;
    margin-bottom: 1rem;
  }

  .config-bar {
    margin-top: 1.5rem;
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    align-items: center;
  }

  .config-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .config-item .label {
    font-size: 0.85rem;
    color: #64748b;
    font-weight: 500;
  }

  .slug-preview {
    background: #f8fafc;
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
    border: 2px dashed #e2e8f0;
    transition: all 0.3s;
  }

  .slug-preview.has-content {
    background: #eff6ff;
    border-style: solid;
    border-color: #bfdbfe;
  }

  .slug-text {
    font-size: 1.5rem;
    font-weight: 700;
    color: #2563eb;
    word-break: break-all;
    font-family: monospace;
  }

  .empty-hint {
    color: #94a3b8;
    font-style: italic;
  }

  .full-url-preview {
    margin-top: 1.5rem;
    padding: 1rem;
    background: #334155;
    border-radius: 8px;
    color: #e2e8f0;
    font-size: 0.9rem;
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .url-label {
    color: #94a3b8;
  }

  .url-text {
    color: #38bdf8;
    font-family: monospace;
  }

  .tips-section {
    padding: 1.5rem 2rem;
  }

  .tips-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    color: #3b82f6;
  }

  .tips-header h4 {
    margin: 0;
    font-size: 1.1rem;
  }

  .premium-list {
    padding-left: 1.25rem;
    margin: 0;
  }

  .premium-list li {
    margin-bottom: 0.75rem;
    color: #475569;
    font-size: 0.9rem;
    line-height: 1.6;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }
</style>
