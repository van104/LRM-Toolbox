<template>
  <div class="sentence-stats-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>句子长度统计器</h1>
        <span class="nav-subtitle">Sentence Length Statistics</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="tool-card glass-card">
        <div class="input-section">
          <label>粘贴文章段落 (自动识别句号、问号、感叹号)</label>
          <textarea
            v-model="inputText"
            placeholder="在这里输入或粘贴您的文章内容..."
            rows="8"
          ></textarea>
        </div>

        <div v-if="stats" class="stats-display animate-fade-in">
          <div class="summary-cards">
            <div class="summary-card">
              <span class="num">{{ stats.totalChars }}</span>
              <span class="label">总字数</span>
            </div>
            <div class="summary-card">
              <span class="num">{{ stats.sentenceCount }}</span>
              <span class="label">句子总数</span>
            </div>
            <div class="summary-card accent">
              <span class="num">{{ stats.avgLength }}</span>
              <span class="label">平均句长</span>
            </div>
          </div>

          <div class="details-section">
            <h3>句子长度分布</h3>
            <div class="sentences-list">
              <div v-for="(sentence, index) in stats.sentences" :key="index" class="sentence-item">
                <div class="sentence-header">
                  <span class="index">句子 {{ index + 1 }}</span>
                  <span :class="['len-tag', getLengthClass(sentence.length)]"
                    >{{ sentence.length }} 字</span
                  >
                </div>
                <p class="sentence-text">{{ sentence.text }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 句子长度统计器</footer>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { Back } from '@element-plus/icons-vue';

  const inputText = ref('');

  const stats = computed(() => {
    if (!inputText.value.trim()) return null;

    const reg = /[^。！？!?]+[。！？!?]?/g;
    const matches = inputText.value.match(reg) || [];

    const sentences = matches
      .map(s => {
        const text = s.trim();
        return {
          text,
          length: text.length
        };
      })
      .filter(s => s.length > 0);

    if (sentences.length === 0) return null;

    const totalChars = sentences.reduce((acc, curr) => acc + curr.length, 0);

    return {
      sentences,
      totalChars,
      sentenceCount: sentences.length,
      avgLength: (totalChars / sentences.length).toFixed(1)
    };
  });

  const getLengthClass = len => {
    if (len < 10) return 'short';
    if (len > 30) return 'long';
    return 'medium';
  };
</script>

<style scoped>
  .sentence-stats-tool {
    --bg: #f5f3ff;

    --card: #ffffff;
    --border: #ddd6fe;
    --text: #1f2937;
    --text-2: #6b7280;
    --accent: #8b5cf6;

    font-family: 'Noto Sans SC', sans-serif;
    min-height: 100vh;
    background: var(--bg);
  }

  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background: var(--card);
    border-bottom: 1px solid var(--border);
  }

  .nav-back,
  .nav-spacer {
    width: 80px;
  }

  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: var(--text-2);
    cursor: pointer;
  }

  .nav-center {
    text-align: center;
    flex: 1;
  }

  .nav-center h1 {
    font-size: 1.1rem;
    font-weight: 600;
  }

  .nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-2);
    text-transform: uppercase;
    display: block;
    text-align: center;
  }

  .main-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  }

  .input-section label {
    display: block;
    margin-bottom: 0.8rem;
    font-size: 0.9rem;
    color: var(--text-2);
  }

  .input-section textarea {
    width: 100%;
    padding: 1.2rem;
    border: 2px solid var(--border);
    border-radius: 16px;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.2s;
    resize: vertical;
    line-height: 1.6;
  }

  .input-section textarea:focus {
    border-color: var(--accent);
  }

  .summary-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin: 2rem 0;
  }

  .summary-card {
    background: #f9fafb;
    padding: 1.5rem;
    border-radius: 16px;
    text-align: center;
    border: 1px solid #f3f4f6;
  }

  .summary-card.accent {
    background: #ede9fe;
    border-color: #ddd6fe;
  }

  .summary-card .num {
    display: block;
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--accent);
  }

  .summary-card .label {
    font-size: 0.8rem;
    color: var(--text-2);
  }

  .details-section h3 {
    font-size: 1rem;
    margin-bottom: 1rem;
    font-weight: 600;
  }

  .sentences-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .sentence-item {
    padding: 1.2rem;
    background: #fff;
    border: 1px solid #f3f4f6;
    border-radius: 12px;
    transition: transform 0.2s;
  }

  .sentence-item:hover {
    transform: translateX(5px);
    border-color: var(--accent);
  }

  .sentence-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.8rem;
  }

  .index {
    font-size: 0.75rem;
    color: var(--text-2);
    font-weight: 500;
  }

  .len-tag {
    font-size: 0.75rem;
    padding: 2px 10px;
    border-radius: 20px;
    font-weight: 600;
  }

  .len-tag.short {
    background: #dcfce7;
    color: #166534;
  }

  .len-tag.medium {
    background: #fef9c3;
    color: #854d0e;
  }

  .len-tag.long {
    background: #fee2e2;
    color: #991b1b;
  }

  .sentence-text {
    font-size: 0.95rem;
    color: var(--text);
    line-height: 1.5;
    margin: 0;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-2);
    font-size: 0.85rem;
  }

  .animate-fade-in {
    animation: fadeIn 0.4s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
