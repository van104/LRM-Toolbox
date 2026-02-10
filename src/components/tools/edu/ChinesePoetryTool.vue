<template>
  <div class="chinese-poetry-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>诗词检索与赏析</h1>
        <span class="nav-subtitle">Classical Chinese Poetry</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <header class="search-section glass-card">
        <div class="search-bar">
          <el-input
            v-model="searchQuery"
            placeholder="搜索题目、作者、诗句..."
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
            <template #append>
              <el-button @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </div>
        <div class="filter-tags">
          <el-tag
            v-for="tag in filterTags"
            :key="tag"
            :class="{ 'tag-active': currentTag === tag }"
            class="clickable-tag"
            @click="setTag(tag)"
          >
            {{ tag }}
          </el-tag>
        </div>
      </header>

      <div class="content-layout">
        <section class="poetry-list">
          <div
            v-for="poem in filteredPoems"
            :key="poem.id"
            class="poem-item glass-card"
            :class="{ active: selectedPoem?.id === poem.id }"
            @click="selectPoem(poem)"
          >
            <h3 class="poem-title">{{ poem.title }}</h3>
            <div class="poem-meta">
              <span class="dynasty">[{{ poem.dynasty }}]</span>
              <span class="author">{{ poem.author }}</span>
            </div>
            <p class="poem-snippet">{{ poem.content[0] }}</p>
          </div>
        </section>

        <section v-if="selectedPoem" class="poetry-detail glass-card">
          <div class="detail-header">
            <div class="dynasty-badge">〔 {{ selectedPoem.dynasty }} 〕</div>
            <h2>{{ selectedPoem.title }}</h2>
            <div class="detail-author">{{ selectedPoem.author }}</div>
          </div>

          <div class="poem-body-container">
            <div class="poem-full-content" :class="{ 'vertical-text': isVertical }">
              <p v-for="(line, idx) in selectedPoem.content" :key="idx">{{ line }}</p>
            </div>
          </div>

          <div v-if="selectedPoem.appreciation" class="appreciation-section">
            <div class="section-divider">
              <span>赏析与名句</span>
            </div>
            <div class="appreciation-box">
              <p>{{ selectedPoem.appreciation }}</p>
            </div>
          </div>

          <div class="action-footer">
            <button class="action-btn secondary" @click="isVertical = !isVertical">
              <el-icon>
                <Refresh />
              </el-icon>
              {{ isVertical ? '水平排版' : '纵向排版' }}
            </button>
            <button class="action-btn primary" @click="generateCard">
              <el-icon>
                <Picture />
              </el-icon>
              生成名句卡片
            </button>
          </div>
        </section>
        <div v-else class="empty-detail glass-card">
          <el-empty description="请从左侧列表中选择一首诗词开始赏析" />
        </div>
      </div>
    </main>

    <el-dialog
      v-model="showCard"
      title="名句卡片生成器"
      width="900px"
      center
      class="card-dialog"
      destroy-on-close
    >
      <div class="card-generator-layout">
        <div class="selection-side">
          <div class="config-group">
            <label>选择诗句 (点击选中)</label>
            <el-scrollbar max-height="300px">
              <div class="line-selector">
                <div
                  v-for="(line, idx) in selectedPoem?.content"
                  :key="idx"
                  class="line-option"
                  :class="{ active: cardForm.selectedLines.includes(line) }"
                  @click="toggleLine(line)"
                >
                  {{ line }}
                </div>
              </div>
            </el-scrollbar>
          </div>

          <div class="config-group">
            <label>卡片装饰</label>
            <div class="decoration-toggles">
              <el-switch v-model="cardForm.showWatermark" active-text="显示页脚" />
              <el-switch v-model="cardForm.showSeal" active-text="显示印章" />
            </div>
          </div>

          <div class="config-group">
            <label>样式背景</label>
            <div class="card-styles">
              <span
                v-for="(c, idx) in bgOptions"
                :key="idx"
                :style="{ background: c }"
                class="color-dot"
                :class="{ active: cardBg === c }"
                @click="cardBg = c"
              ></span>
            </div>
          </div>
        </div>

        <div class="preview-side">
          <div class="card-preview-area">
            <div id="poetry-card" class="poem-card-preview" :style="{ background: cardBg }">
              <div class="card-inner">
                <div v-if="cardBg.includes('ffffff')" class="card-watermark-bg"></div>
                <div class="card-body">
                  <div
                    class="card-quote"
                    :class="{ 'long-text': cardForm.selectedLines.join('').length > 15 }"
                  >
                    <div v-for="(l, i) in cardForm.selectedLines" :key="i" class="quote-line-group">
                      <div
                        v-for="(segment, si) in formatLineSegments(l)"
                        :key="si"
                        class="quote-segment"
                      >
                        {{ segment }}
                      </div>
                    </div>
                    <div v-if="cardForm.selectedLines.length === 0" class="placeholder-text">
                      请选择诗句预览
                    </div>
                  </div>
                  <div class="card-info">
                    <div class="card-title">《{{ selectedPoem?.title }}》</div>
                    <div class="card-author">
                      {{ selectedPoem?.dynasty }} · {{ selectedPoem?.author }}
                    </div>
                  </div>
                </div>
                <div v-if="cardForm.showWatermark || cardForm.showSeal" class="card-footer">
                  <div v-if="cardForm.showWatermark" class="footer-left">
                    由 LRM工具箱 · 诗词赏析 生成
                  </div>
                  <div v-if="cardForm.showSeal" class="footer-seal">赏析</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer-btns">
          <el-button @click="showCard = false">取消</el-button>
          <el-button
            type="primary"
            size="large"
            :disabled="!cardForm.selectedLines.length"
            @click="downloadCard"
          >
            保存高清卡片
          </el-button>
        </div>
      </template>
    </el-dialog>

    <footer class="footer">© 2026 LRM工具箱 - 传承经典，品味诗意</footer>
  </div>
</template>

<script setup>
  import { ref, computed, reactive, onMounted } from 'vue';
  import { Back, Search, Refresh, Picture } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';
  import { loadAll } from '@/data/poetry';

  const searchQuery = ref('');
  const currentTag = ref('全部');
  const selectedPoem = ref(null);
  const isVertical = ref(false);
  const showCard = ref(false);
  const cardBg = ref('linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)');
  const poems = ref([]);

  const cardForm = reactive({
    selectedLines: [],
    showWatermark: true,
    showSeal: true
  });

  const filterTags = ['全部', '唐诗', '宋词', '元曲', '送别', '思乡', '爱国', '咏物'];

  onMounted(async () => {
    poems.value = await loadAll();
    if (poems.value.length > 0) {
      selectedPoem.value = poems.value[0];
    }
  });

  const filteredPoems = computed(() => {
    return poems.value.filter(p => {
      const matchesSearch =
        p.title.includes(searchQuery.value) ||
        p.author.includes(searchQuery.value) ||
        p.content.some(l => l.includes(searchQuery.value));
      const matchesTag = currentTag.value === '全部' || p.tags.includes(currentTag.value);
      return matchesSearch && matchesTag;
    });
  });

  const selectPoem = poem => {
    selectedPoem.value = poem;
    cardForm.selectedLines = [];
  };

  const handleSearch = () => {
    if (filteredPoems.value.length === 1) {
      selectedPoem.value = filteredPoems.value[0];
    }
  };

  const setTag = tag => {
    currentTag.value = tag;
  };

  const toggleLine = line => {
    const index = cardForm.selectedLines.indexOf(line);
    if (index > -1) {
      cardForm.selectedLines.splice(index, 1);
    } else {
      cardForm.selectedLines.push(line);
    }
  };

  const generateCard = () => {
    if (cardForm.selectedLines.length === 0 && selectedPoem.value.content.length > 0) {
      cardForm.selectedLines = [selectedPoem.value.content[0]];
    }
    showCard.value = true;
  };

  const bgOptions = [
    'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)',
    'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    'linear-gradient(to right, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%)',
    '#ffffff'
  ];

  const downloadCard = () => {
    ElMessage.success('卡片生成成功！正在启动下载...');
    setTimeout(() => {
      showCard.value = false;
    }, 1000);
  };

  const formatLineSegments = line => {
    if (!line) return [];
    const segments = line
      .replace(/([，。？！；、])/g, '$1\n')
      .split('\n')
      .filter(s => s.trim());
    return segments.length === 0 ? [line] : segments;
  };
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

  .chinese-poetry-tool {
    --bg: #fcf9f2;
    --card: #ffffff;
    --border: #e2dccf;
    --text: #3a3530;
    --text-2: #7d756d;
    --primary: #8b5e3c;
    --primary-light: #f4eee1;
    --accent: #c04851;

    font-family: 'Noto Sans SC', sans-serif;
    min-height: 100vh;
    background: var(--bg);
    background-image: radial-gradient(var(--border) 0.5px, transparent 0.5px);
    background-size: 30px 30px;
    color: var(--text);
  }

  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 2.5rem;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(12px);
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
    background: var(--primary-light);
    border: 1px solid var(--border);
    color: var(--primary);
    cursor: pointer;
    font-size: 0.85rem;
    padding: 0.6rem 1.2rem;
    border-radius: 50px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .nav-back:hover {
    background: var(--primary);
    color: white;
  }

  .nav-center h1 {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0;
    letter-spacing: 2px;
  }

  .nav-subtitle {
    font-size: 0.75rem;
    color: var(--text-2);
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  .main-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2.5rem 1.5rem;
  }

  .glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 20px;
    box-shadow: 0 10px 30px -10px rgba(139, 94, 60, 0.1);
    transition: all 0.3s;
  }

  .search-section {
    margin-bottom: 2.5rem;
    padding: 2rem;
  }

  .search-bar {
    max-width: 700px;
    margin: 0 auto 1.5rem;
  }

  :deep(.el-input__wrapper) {
    border-radius: 12px;
    box-shadow: 0 0 0 1px var(--border) inset;
  }

  :deep(.el-input-group__append) {
    border-radius: 0 12px 12px 0;
    background: var(--primary);
    color: white;
    border: none;
  }

  .filter-tags {
    display: flex;
    gap: 0.8rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .clickable-tag {
    cursor: pointer;
    background: #fff;
    border: 1px solid var(--border);
    color: var(--text-2);
    padding: 0 1rem;
    height: 32px;
    line-height: 30px;
    border-radius: 16px;
    transition: all 0.2s;
  }

  .clickable-tag.tag-active {
    background: var(--primary);
    border-color: var(--primary);
    color: white;
  }

  .content-layout {
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: 2.5rem;
  }

  .poetry-list {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    overflow-y: auto;
    max-height: 800px;
    padding-right: 0.5rem;
  }

  .poem-item {
    padding: 1.5rem;
    cursor: pointer;
    border: 1.5px solid transparent;
  }

  .poem-item:hover {
    transform: translateY(-4px);
    border-color: var(--primary);
  }

  .poem-item.active {
    border-color: var(--primary);
    background: var(--primary-light);
  }

  .poem-title {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.25rem;
    margin: 0 0 0.75rem;
    color: var(--primary);
  }

  .poem-meta {
    font-size: 0.9rem;
    color: var(--text-2);
    margin-bottom: 1rem;
    display: flex;
    gap: 0.5rem;
  }

  .poem-snippet {
    font-size: 0.95rem;
    color: var(--text-2);
    font-style: italic;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .poetry-detail {
    padding: 4rem 3rem;
    position: sticky;
    top: 100px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .dynasty-badge {
    font-size: 0.85rem;
    color: var(--accent);
    margin-bottom: 1rem;
    font-weight: 600;
  }

  .detail-header h2 {
    font-family: 'Noto Serif SC', serif;
    font-size: 2.5rem;
    margin: 0 0 1rem;
    letter-spacing: 4px;
  }

  .detail-author {
    font-size: 1.1rem;
    color: var(--text-2);
    margin-bottom: 3.5rem;
    letter-spacing: 2px;
  }

  .poem-body-container {
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  .poem-full-content {
    font-size: 1.5rem;
    line-height: 2.2;
    font-family: 'Noto Serif SC', serif;
    color: var(--text);
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .vertical-text {
    writing-mode: vertical-rl;
    text-orientation: upright;
    padding: 2rem;
    border-right: 1px solid var(--border);
    border-left: 1px solid var(--border);
  }

  .vertical-text p {
    margin: 0 0.75rem;
    letter-spacing: 0.3rem;
  }

  .appreciation-section {
    width: 100%;
    max-width: 600px;
    margin-top: 4rem;
  }

  .section-divider {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .section-divider::before,
  .section-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  .section-divider span {
    padding: 0 1.5rem;
    font-size: 0.9rem;
    color: var(--text-2);
    letter-spacing: 4px;
  }

  .appreciation-box {
    text-align: justify;
    background: var(--primary-light);
    padding: 2rem;
    border-radius: 12px;
    font-size: 1rem;
    line-height: 1.8;
    color: var(--text);
  }

  .action-footer {
    margin-top: 3.5rem;
    display: flex;
    gap: 1.5rem;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.8rem 1.8rem;
    border-radius: 50px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
  }

  .action-btn.primary {
    background: var(--accent);
    color: white;
    border: none;
  }

  .action-btn.primary:hover {
    background: #a33c44;
    box-shadow: 0 5px 15px rgba(192, 72, 81, 0.3);
  }

  .action-btn.secondary {
    background: transparent;
    border: 1px solid var(--primary);
    color: var(--primary);
  }

  .action-btn.secondary:hover {
    background: var(--primary-light);
  }

  .card-generator-layout {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 2.5rem;
  }

  .config-group {
    margin-bottom: 2rem;
  }

  .config-group label {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-2);
    margin-bottom: 1rem;
    text-transform: uppercase;
  }

  .line-selector {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .line-option {
    padding: 0.75rem 1rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .line-option:hover {
    background: var(--primary-light);
  }

  .line-option.active {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
  }

  .decoration-toggles {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .card-styles {
    display: flex;
    gap: 0.8rem;
    flex-wrap: wrap;
  }

  .color-dot {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;
  }

  .color-dot.active {
    transform: scale(1.2);
    border-color: var(--primary);
  }

  .card-preview-area {
    background: #f0f0f0;
    padding: 3rem;
    border-radius: 20px;
    display: flex;
    justify-content: center;
  }

  .poem-card-preview {
    width: 400px;
    height: 520px;
    border-radius: 16px;
    padding: 1.5rem;
    position: relative;
    box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.2);
  }

  .card-inner {
    background: white;
    height: 100%;
    border-radius: 8px;
    padding: 3rem 2.5rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    z-index: 1;
  }

  .card-watermark-bg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 150px;
    height: 150px;
    background: url('https://api.iconify.design/ri:mushu-line.svg') no-repeat center;
    background-size: contain;
    opacity: 0.03;
    z-index: -1;
  }

  .card-quote {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.8rem;
    line-height: 1.8;
    color: #1a1a1a;
    font-weight: 700;
    text-align: center;
  }

  .quote-line-group {
    margin-bottom: 1.5rem;
  }

  .card-info {
    text-align: right;
    border-right: 3px solid var(--accent);
    padding-right: 1.2rem;
    margin-top: 2rem;
  }

  .card-title {
    font-weight: 700;
    font-size: 1.1rem;
    margin-bottom: 0.4rem;
  }

  .card-author {
    font-size: 0.9rem;
    color: #666;
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: auto;
    padding-top: 1.5rem;
  }

  .footer-left {
    font-size: 0.7rem;
    color: #999;
    letter-spacing: 1px;
  }

  .footer-seal {
    width: 32px;
    height: 32px;
    border: 2px solid var(--accent);
    color: var(--accent);
    font-size: 0.7rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    border-radius: 4px;
    transform: rotate(-10deg);
  }

  .footer {
    text-align: center;
    padding: 4rem;
    color: var(--text-2);
    font-size: 0.9rem;
    letter-spacing: 4px;
  }

  @media (max-width: 1100px) {
    .content-layout {
      grid-template-columns: 1fr;
    }

    .poetry-detail {
      position: static;
      padding: 2rem 1rem;
    }
  }
</style>
