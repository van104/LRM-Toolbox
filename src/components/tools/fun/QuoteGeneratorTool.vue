<template>
  <div class="quote-generator-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>语录生成器</h1>
        <span class="nav-subtitle">Quote Generator</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="quote-container glass-card" :style="{ backgroundColor: currentBg }">
        <div class="category-tabs">
          <button
            v-for="cat in quoteCategories"
            :key="cat.id"
            :class="{ active: activeCategory === cat.id }"
            @click="switchCategory(cat.id)"
          >
            {{ cat.name }}
          </button>
        </div>

        <div v-if="currentQuote" class="quote-display">
          <div class="quote-mark open">“</div>
          <p class="quote-text" :style="{ fontSize: fontSize + 'px' }">
            {{ currentQuote.content }}
          </p>
          <div class="quote-mark close">”</div>
          <p v-if="currentQuote.author" class="quote-author">— {{ currentQuote.author }}</p>
        </div>

        <div class="actions">
          <div class="style-tools">
            <button title="减小字号" @click="fontSize = Math.max(16, fontSize - 2)">A-</button>
            <button title="增大字号" @click="fontSize = Math.min(48, fontSize + 2)">A+</button>
            <button title="换个背景" @click="changeBg">🎨</button>
          </div>
          <button class="next-btn" @click="generateQuote">換一句</button>
          <button class="copy-btn" @click="copyQuote">复制文字</button>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 语录生成器</footer>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { Back } from '@element-plus/icons-vue';
  import { quoteCategories, loadQuotes } from '@/data/quotes';
  import { useCopy } from '@/composables/useCopy';

  const activeCategory = ref('poetry');
  const currentQuote = ref(null);
  const fontSize = ref(24);
  const currentBg = ref('#ffffff');
  const currentCategoryQuotes = ref([]);
  const { copyToClipboard } = useCopy();

  const backgrounds = ['#ffffff', '#fdf2f8', '#eff6ff', '#f0fdf4', '#fffbeb', '#f5f3ff'];

  const switchCategory = async id => {
    activeCategory.value = id;
    currentCategoryQuotes.value = await loadQuotes(id);
    generateQuote();
  };

  const generateQuote = async () => {
    if (currentCategoryQuotes.value.length === 0) {
      currentCategoryQuotes.value = await loadQuotes(activeCategory.value);
    }

    const list = currentCategoryQuotes.value;
    if (list.length === 0) return;

    let random;
    do {
      random = Math.floor(Math.random() * list.length);
    } while (list.length > 1 && list[random].content === currentQuote.value?.content);

    currentQuote.value = list[random];
  };

  const changeBg = () => {
    const idx = Math.floor(Math.random() * backgrounds.length);
    currentBg.value = backgrounds[idx];
  };

  const copyQuote = () => {
    if (!currentQuote.value) return;
    const text = `“${currentQuote.value.content}” ${currentQuote.value.author ? '— ' + currentQuote.value.author : ''}`;
    copyToClipboard(text, { success: '已复制到剪贴板' });
  };

  onMounted(async () => {
    await switchCategory('poetry');
  });
</script>

<style scoped>
  .quote-generator-tool {
    --bg: #f9fafb;
    --card: #ffffff;
    --text: #1f2937;
    --primary: #8b5cf6;
    min-height: 100vh;
    background: var(--bg);
  }

  .nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    height: 60px;
    background: #fff;
    border-bottom: 1px solid #eee;
  }

  .nav-back,
  .nav-spacer {
    width: 100px;
  }

  .nav-back {
    border: none;
    background: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    color: #666;
    font-size: 0.95rem;
  }

  .nav-center {
    flex: 1;
    text-align: center;
  }

  .nav-center h1 {
    font-size: 1.15rem;
    margin: 0;
    color: #1e293b;
    line-height: 1.2;
  }

  .nav-subtitle {
    font-size: 0.7rem;
    color: #94a3b8;
    text-transform: uppercase;
    display: block;
    text-align: center;
    margin-top: 1px;
  }

  .main-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 4rem 1.5rem;
  }

  .quote-container {
    padding: 3rem;
    border-radius: 24px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    min-height: 400px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: background-color 0.5s;
    position: relative;
    border: 1px solid #f3f4f6;
  }

  .category-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .category-tabs button {
    padding: 0.5rem 1.2rem;
    border-radius: 20px;
    border: 1px solid #e5e7eb;
    background: #fff;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
  }

  .category-tabs button.active {
    background: var(--primary);
    color: #fff;
    border-color: var(--primary);
  }

  .quote-display {
    text-align: center;
    padding: 2rem 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .quote-mark {
    font-size: 4rem;
    color: rgba(139, 92, 246, 0.1);
    line-height: 1;
    font-family: serif;
  }

  .quote-mark.open {
    text-align: left;
  }

  .quote-mark.close {
    text-align: right;
  }

  .quote-text {
    line-height: 1.6;
    margin: 1rem 0;
    color: var(--text);
    font-family: 'Noto Serif SC', serif;
  }

  .quote-author {
    color: #6b7280;
    font-style: italic;
    margin-top: 1.5rem;
  }

  .actions {
    margin-top: 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .style-tools {
    display: flex;
    gap: 0.5rem;
  }

  .style-tools button {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid #eee;
    background: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .next-btn {
    flex: 1;
    padding: 0.8rem;
    background: var(--text);
    color: #fff;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-weight: bold;
    transition: transform 0.2s;
  }

  .next-btn:active {
    transform: scale(0.95);
  }

  .copy-btn {
    padding: 0.8rem 1.5rem;
    background: #fff;
    border: 1px solid #eee;
    border-radius: 12px;
    cursor: pointer;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #999;
    font-size: 0.8rem;
  }
</style>
