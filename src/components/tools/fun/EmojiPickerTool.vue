<template>
  <div class="emoji-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>Emoji 表情检索</h1>
        <span class="nav-subtitle">Emoji Picker</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="tool-card glass-card">
        <div class="category-tabs">
          <button
            v-for="cat in categories"
            :key="cat.id"
            :class="{ active: currentCat === cat.id }"
            @click="setCat(cat.id)"
          >
            {{ cat.name }}
          </button>
        </div>

        <div class="emoji-container">
          <div v-if="isRendering" class="loading-overlay">
            <el-icon class="is-loading"><Loading /></el-icon>
            正在加载表情...
          </div>
          <template v-for="cat in categories" :key="cat.id">
            <div
              v-if="loadedCats.has(cat.id)"
              v-show="currentCat === cat.id && !isRendering"
              class="emoji-grid"
            >
              <button
                v-for="emoji in emojiData[cat.id]"
                :key="emoji"
                class="emoji-item"
                title="点击复制"
                @click="copy(emoji)"
              >
                {{ emoji }}
              </button>
            </div>
          </template>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - Emoji 表情检索</footer>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { Back, Loading } from '@element-plus/icons-vue';
  import { useCopy } from '@/composables/useCopy';

  import emojiRawData from '@/data/emoji/data.json';

  const { emojiData, categories } = emojiRawData;

  // 记录哪些分类已经被加载过（懒加载）
  const loadedCats = ref(new Set(['mood']));
  const currentCat = ref('mood');

  const isRendering = ref(false);

  const setCat = id => {
    if (currentCat.value === id) return;

    // 第一步：立即切换 Tab 状态，给予视觉反馈
    currentCat.value = id;

    // 第二步：如果已经加载过，直接返回（v-show 切换已足够快）
    if (loadedCats.value.has(id)) return;

    // 第三步：如果是第一次加载，开启 loading 并异步渲染，防止主线程阻塞导致点击没反应
    isRendering.value = true;
    requestAnimationFrame(() => {
      setTimeout(() => {
        loadedCats.value.add(id);
        isRendering.value = false;
      }, 10);
    });
  };
  const { copyToClipboard } = useCopy();

  const copy = async txt => {
    copyToClipboard(txt, { success: `已复制: ${txt}` });
  };
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

  .emoji-tool {
    --bg: #faf9f7;
    --card: #ffffff;
    --border: #e8e6e3;
    --text: #1a1a1a;
    --text-2: #6b6b6b;
    --accent: #f59e0b;

    font-family: 'Noto Sans SC', sans-serif;
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
    font-size: 0.9rem;
  }

  .nav-center h1 {
    font-family: 'Noto Serif SC', serif;
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
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  .category-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .category-tabs button {
    padding: 0.5rem 1rem;
    background: #f3f4f6;
    border: 1px solid transparent;
    border-radius: 100px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
    color: var(--text-2);
  }

  .category-tabs button.active {
    background: var(--accent);
    color: white;
    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
  }

  .emoji-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
    gap: 0.5rem;
    min-height: 400px;
    /* 核心性能优化：仅渲染可见区域 */
    content-visibility: auto;
    contain-intrinsic-size: 400px;
  }

  .loading-overlay {
    height: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    color: var(--text-2);
    font-size: 0.9rem;
  }

  .emoji-item {
    font-size: 1.8rem;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0.2rem;
    border-radius: 6px;
    transition:
      transform 0.1s,
      background 0.1s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .emoji-item:hover {
    transform: scale(1.2);
    background: #fffbeb;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-2);
    border-top: 1px solid var(--border);
    margin-top: 2rem;
    font-size: 0.85rem;
  }

  .toast {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background: #1f2937;
    color: white;
    padding: 0.6rem 1.2rem;
    border-radius: 20px;
    font-size: 0.9rem;
    z-index: 200;
  }

  .toast-enter-active,
  .toast-leave-active {
    transition: opacity 0.3s;
  }

  .toast-enter-from,
  .toast-leave-to {
    opacity: 0;
  }

  .animate-fade-in {
    animation: fadeIn 0.4s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }
</style>
