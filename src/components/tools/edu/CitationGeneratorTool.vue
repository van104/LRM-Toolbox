<template>
  <div class="citation-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>引用生成器</h1>
        <span class="nav-subtitle">Citation Generator</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="glass-card tool-layout">
        <!-- 格式选择 -->
        <section class="options-bar format-selector">
          <div class="option-group">
            <span class="opt-label">引用格式</span>
            <div class="custom-radio-group">
              <label
                v-for="format in formats"
                :key="format"
                :class="{ active: currentFormat === format }"
              >
                <input v-model="currentFormat" type="radio" :value="format" /> {{ format }}
              </label>
            </div>
          </div>

          <div class="option-group">
            <span class="opt-label">来源类型</span>
            <div class="custom-radio-group">
              <label
                v-for="type in sourceTypes"
                :key="type.value"
                :class="{ active: currentSourceType === type.value }"
              >
                <input v-model="currentSourceType" type="radio" :value="type.value" />
                <el-icon class="mr-1"><component :is="type.icon" /></el-icon>
                {{ type.label }}
              </label>
            </div>
          </div>
        </section>

        <!-- 表单输入 -->
        <div class="input-grid">
          <section class="form-section">
            <div class="section-header">
              <label
                ><el-icon><User /></el-icon>作者信息</label
              >
            </div>
            <div class="form-row">
              <div class="form-item">
                <span class="label">姓 (Last Name)</span>
                <input v-model="formData.authorLast" type="text" placeholder="例如: Smith" />
              </div>
              <div class="form-item">
                <span class="label">名 (First Name)</span>
                <input v-model="formData.authorFirst" type="text" placeholder="例如: John" />
              </div>
            </div>
          </section>

          <section class="form-section">
            <div class="section-header">
              <label
                ><el-icon><Document /></el-icon>来源详情</label
              >
            </div>
            <div class="form-item full">
              <span class="label">标题 (Title)</span>
              <input v-model="formData.title" type="text" placeholder="书籍、文章或网页的标题" />
            </div>

            <!-- 根据类型显示不同字段 -->
            <div v-if="currentSourceType === 'book'" class="form-row">
              <div class="form-item">
                <span class="label">出版社</span>
                <input v-model="formData.publisher" type="text" />
              </div>
              <div class="form-item">
                <span class="label">出版年份</span>
                <input v-model="formData.year" type="number" />
              </div>
            </div>

            <div v-if="currentSourceType === 'website'" class="form-row flex-wrap">
              <div class="form-item">
                <span class="label">网站名称</span>
                <input v-model="formData.websiteName" type="text" />
              </div>
              <div class="form-item">
                <span class="label">发布日期</span>
                <input v-model="formData.pubDate" type="date" />
              </div>
              <div class="form-item full">
                <span class="label">URL 链接</span>
                <input v-model="formData.url" type="url" placeholder="https://..." />
              </div>
            </div>

            <div v-if="currentSourceType === 'journal'" class="form-row flex-wrap">
              <div class="form-item">
                <span class="label">期刊名称</span>
                <input v-model="formData.journalName" type="text" />
              </div>
              <div class="form-item">
                <span class="label">卷号</span>
                <input v-model="formData.volume" type="text" />
              </div>
              <div class="form-item">
                <span class="label">页码</span>
                <input v-model="formData.pages" type="text" placeholder="e.g. 10-15" />
              </div>
              <div class="form-item">
                <span class="label">出版年份</span>
                <input v-model="formData.year" type="number" />
              </div>
            </div>
          </section>
        </div>

        <!-- 生成结果 -->
        <section class="result-section">
          <div class="section-header">
            <label
              ><el-icon><Finished /></el-icon>生成结果</label
            >
            <button v-if="citationResult" class="copy-btn" @click="copyResult">
              <el-icon><CopyDocument /></el-icon> 复制引用
            </button>
          </div>
          <div class="result-box">
            <div v-if="citationResult" class="citation-display">
              <!-- eslint-disable-next-line vue/no-v-html -->
              <span v-html="sanitizedResult"></span>
            </div>
            <div v-else class="empty-hint">填写上方信息以生成标准化引用...</div>
          </div>
        </section>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 引用生成器</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, reactive } from 'vue';
  import {
    Back,
    Collection as Book,
    Monitor,
    Paperclip,
    CopyDocument,
    User,
    Document,
    Finished
  } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';
  import { useClipboard } from '@vueuse/core';
  import DOMPurify from 'dompurify';

  // Types
  type Format = 'APA' | 'MLA';
  type SourceType = 'book' | 'website' | 'journal';

  const { copy } = useClipboard();

  // State
  const formats: Format[] = ['APA', 'MLA'];
  const currentFormat = ref<Format>('APA');
  const currentSourceType = ref<SourceType>('book');

  const formData = reactive({
    authorFirst: '',
    authorLast: '',
    title: '',
    publisher: '',
    year: new Date().getFullYear(),
    websiteName: '',
    url: '',
    pubDate: '',
    journalName: '',
    volume: '',
    pages: ''
  });

  const sourceTypes = [
    { label: '书籍', value: 'book' as SourceType, icon: Book },
    { label: '网页', value: 'website' as SourceType, icon: Monitor },
    { label: '期刊', value: 'journal' as SourceType, icon: Paperclip }
  ];

  // Formatting Logic
  const citationResult = computed(() => {
    const {
      authorFirst,
      authorLast,
      title,
      publisher,
      year,
      websiteName,
      url,
      pubDate,
      journalName,
      volume,
      pages
    } = formData;
    if (!title) return '';

    const authorPart =
      authorLast && authorFirst
        ? `${authorLast}, ${currentFormat.value === 'APA' ? authorFirst[0] + '.' : authorFirst}.`
        : authorLast || authorFirst || '';

    if (currentFormat.value === 'APA') {
      if (currentSourceType.value === 'book') {
        return `${authorPart} (${year}). <i>${title}</i>. ${publisher}.`;
      } else if (currentSourceType.value === 'website') {
        const dateStr = pubDate ? ` (${pubDate})` : ' (n.d.)';
        return `${authorPart}${dateStr}. <i>${title}</i>. ${websiteName}. ${url}`;
      } else if (currentSourceType.value === 'journal') {
        return `${authorPart} (${year}). ${title}. <i>${journalName}</i>, <i>${volume}</i>, ${pages}.`;
      }
    } else {
      if (currentSourceType.value === 'book') {
        return `${authorPart} <i>${title}</i>. ${publisher}, ${year}.`;
      } else if (currentSourceType.value === 'website') {
        const yearStr = pubDate ? pubDate.split('-')[0] : '';
        return `${authorPart} "${title}." <i>${websiteName}</i>, ${yearStr}, ${url}.`;
      } else if (currentSourceType.value === 'journal') {
        return `${authorPart} "${title}." <i>${journalName}</i>, vol. ${volume}, ${year}, pp. ${pages}.`;
      }
    }
    return '';
  });

  const sanitizedResult = computed(() => DOMPurify.sanitize(citationResult.value));

  const copyResult = async () => {
    try {
      const textBlob = new Blob([citationResult.value.replace(/<[^>]*>?/gm, '')], {
        type: 'text/plain'
      });
      const htmlBlob = new Blob([citationResult.value], { type: 'text/html' });
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': textBlob,
          'text/html': htmlBlob
        })
      ]);
      ElMessage.success('引用已复制到剪贴板');
    } catch {
      copy(citationResult.value.replace(/<[^>]*>?/gm, ''));
      ElMessage.success('引用文本已复制');
    }
  };
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@600;700&family=Outfit:wght@400;500;600&display=swap');

  .citation-tool {
    --bg: #f8fafc;
    --card: #ffffff;
    --border: #e2e8f0;
    --text: #1e293b;
    --text-2: #64748b;
    --accent: #3b82f6;
    --accent-bg: #eff6ff;

    font-family: 'Outfit', sans-serif;
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
  }

  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border);
  }

  .nav-back,
  .nav-spacer {
    width: 100px;
  }
  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--bg);
    border: 1px solid var(--border);
    color: var(--text-2);
    cursor: pointer;
    font-size: 0.85rem;
    padding: 0.5rem 1rem;
    border-radius: 50px;
    transition: all 0.2s;
  }
  .nav-back:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-bg);
  }

  .nav-center {
    text-align: center;
  }
  .nav-center h1 {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0;
  }
  .nav-subtitle {
    font-size: 0.75rem;
    color: var(--text-2);
    text-transform: uppercase;
    text-align: center;
    display: block;
    letter-spacing: 1px;
  }

  .main-content {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }
  .glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 2.5rem;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  }
  .tool-layout {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }

  .options-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 2.5rem;
    padding: 1.5rem;
    background: #f8fafc;
    border: 1px solid var(--border);
    border-radius: 16px;
  }
  .option-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .opt-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-2);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .custom-radio-group {
    display: flex;
    gap: 0.5rem;
    background: #fff;
    padding: 4px;
    border-radius: 10px;
    border: 1px solid var(--border);
  }
  .custom-radio-group label {
    padding: 6px 14px;
    font-size: 0.85rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;
    color: var(--text-2);
    font-weight: 500;
    display: flex;
    align-items: center;
  }
  .custom-radio-group input {
    display: none;
  }
  .custom-radio-group label.active {
    background: var(--accent);
    color: #fff;
  }

  .section-header {
    margin-bottom: 1.25rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .section-header label {
    font-weight: 700;
    font-size: 1.1rem;
    color: var(--text);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .input-grid {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  .form-section {
    border-bottom: 1px dashed var(--border);
    padding-bottom: 2rem;
  }
  .form-section:last-child {
    border-bottom: none;
  }

  .form-row {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1rem;
  }
  .form-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .form-item.full {
    width: 100%;
  }
  .form-item span.label {
    font-size: 0.85rem;
    color: var(--text-2);
    font-weight: 500;
  }
  .form-item input {
    padding: 0.75rem 1rem;
    border: 1px solid var(--border);
    border-radius: 12px;
    outline: none;
    transition: all 0.2s;
    font-size: 0.95rem;
  }
  .form-item input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-bg);
  }

  .result-box {
    padding: 2rem;
    border: 2px dashed var(--border);
    border-radius: 16px;
    background: #fcfcfc;
    min-height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .citation-display {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.25rem;
    line-height: 1.8;
    color: var(--text);
    text-align: center;
  }
  .empty-hint {
    color: var(--text-2);
    font-style: italic;
    font-size: 0.95rem;
  }

  .copy-btn {
    background: var(--accent);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.85rem;
    font-weight: 600;
    transition: all 0.2s;
  }
  .copy-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  .footer {
    text-align: center;
    padding: 3rem;
    color: var(--text-2);
    font-size: 0.85rem;
  }

  @media (max-width: 640px) {
    .form-row {
      flex-direction: column;
    }
    .options-bar {
      flex-direction: column;
      gap: 1.5rem;
    }
  }
</style>
