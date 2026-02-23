<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <!-- Header -->
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">Cheat<span>.速查()</span></h1>
        <div class="badge">📚 {{ subjects.length }} 学科</div>
      </header>

      <!-- 学科导航 -->
      <div class="subject-bar">
        <button
          v-for="sub in subjects"
          :key="sub.id"
          :class="['subject-btn', { active: currentSubject.id === sub.id }]"
          @click="selectSubject(sub)"
        >
          {{ sub.name }}
        </button>
      </div>

      <!-- 搜索 + 当前学科标题 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <h2 class="current-title">{{ currentSubject.name }}</h2>
          <span v-if="currentDetails" class="section-count"
            >{{ filteredSections.length }} 个分类</span
          >
        </div>
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input v-model="filterKey" class="search-input" placeholder="快速过滤关键词..." />
          <button v-if="filterKey" class="clear-btn" @click="filterKey = ''">✕</button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <div class="loading-text">⏳ 正在加载 {{ currentSubject.name }}...</div>
      </div>

      <!-- 内容区 -->
      <div v-else-if="filteredSections.length" class="cheat-sections">
        <div v-for="section in filteredSections" :key="section.title" class="section-block">
          <div class="section-header" :style="{ borderLeftColor: getSectionColor(section.title) }">
            <h3 class="section-name">{{ section.title }}</h3>
            <span class="item-count">{{ section.items.length }} 条</span>
          </div>
          <div class="commands-grid">
            <div
              v-for="item in section.items"
              :key="item.cmd"
              class="command-card"
              @click="copy(item.cmd)"
            >
              <code class="cmd-code">{{ item.cmd }}</code>
              <span class="cmd-desc">{{ item.desc }}</span>
              <span class="copy-hint">点击复制</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 空结果 -->
      <div v-else class="empty-state">
        <div class="empty-icon">🔍</div>
        <p>
          没有找到匹配 "<strong>{{ filterKey }}</strong
          >" 的内容
        </p>
      </div>

      <!-- 提示 -->
      <div class="info-bar">
        💡 当前仅收录常用基础操作，更多进阶内容持续更新中 | 点击命令即可复制
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { subjectList, loadSubject } from '@/data/cheatsheet';
  import { useCopy } from '@/composables/useCopy';

  const { copyToClipboard } = useCopy();
  const subjects = subjectList;
  const currentSubject = ref(subjects[0]);
  const currentDetails = ref(null);
  const filterKey = ref('');
  const loading = ref(false);

  const sectionColors = [
    '#ff4b4b',
    '#ff7c2e',
    '#ffd900',
    '#00e572',
    '#4b7bff',
    '#7c3aed',
    '#ff7be5',
    '#06b6d4',
    '#f59e0b',
    '#ec4899'
  ];

  const getSectionColor = title => {
    let hash = 0;
    for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
    return sectionColors[Math.abs(hash) % sectionColors.length];
  };

  const filteredSections = computed(() => {
    if (!currentDetails.value) return [];
    const sections = currentDetails.value.sections;
    if (!filterKey.value) return sections;
    const q = filterKey.value.toLowerCase();
    return sections
      .map(sec => ({
        ...sec,
        items: sec.items.filter(
          i => i.cmd.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q)
        )
      }))
      .filter(sec => sec.items.length > 0);
  });

  const selectSubject = async sub => {
    currentSubject.value = sub;
    loading.value = true;
    currentDetails.value = null;
    filterKey.value = '';
    currentDetails.value = await loadSubject(sub.id);
    loading.value = false;
  };

  const copy = text => {
    copyToClipboard(text, { success: '✔ 已复制: ' + text });
  };

  onMounted(() => selectSubject(subjects[0]));
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
    text-shadow: 4px 4px 0px #9b59b6;
  }

  .brutal-title span {
    color: #9b59b6;
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
    background: #9b59b6;
    color: #fff;
    padding: 0.5rem 1.2rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    border: 4px solid #111;
    box-shadow: 5px 5px 0px #111;
  }

  /* Subject bar */
  .subject-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    background: #fff;
  }

  .subject-btn {
    padding: 0.7rem 1rem;
    border: none;
    border-right: 3px solid #ddd;
    border-bottom: 3px solid #ddd;
    background: #fff;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.1s;
    color: #555;
    white-space: nowrap;
  }

  .subject-btn:hover {
    background: #f0f0f0;
    color: #111;
  }
  .subject-btn.active {
    background: #111;
    color: #ffd900;
  }

  /* Toolbar */
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .toolbar-left {
    display: flex;
    align-items: baseline;
    gap: 1rem;
  }

  .current-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.8rem;
    font-weight: 900;
    margin: 0;
  }

  .section-count {
    font-size: 0.9rem;
    font-weight: 700;
    color: #888;
  }

  .search-box {
    display: flex;
    align-items: center;
    border: 4px solid #111;
    background: #fff;
    box-shadow: 5px 5px 0px #111;
    min-width: 280px;
  }

  .search-icon {
    padding: 0 0.75rem;
    font-size: 1.1rem;
  }

  .search-input {
    flex: 1;
    border: none;
    outline: none;
    padding: 0.75rem 0;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    font-size: 1rem;
    background: transparent;
  }

  .clear-btn {
    border: none;
    border-left: 3px solid #111;
    background: #fff;
    padding: 0 0.75rem;
    font-weight: 900;
    font-size: 1rem;
    cursor: pointer;
    color: #ff4b4b;
    height: 100%;
  }

  .clear-btn:hover {
    background: #fff0f0;
  }

  /* Loading */
  .loading-state {
    display: flex;
    justify-content: center;
    padding: 4rem;
  }

  .loading-text {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.2rem;
    color: #888;
  }

  /* Sections */
  .cheat-sections {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }

  .section-block {
    border: 4px solid #111;
    background: #fff;
    box-shadow: 10px 10px 0px #111;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.85rem 1.5rem;
    border-bottom: 4px solid #111;
    border-left: 8px solid #ff4b4b;
    background: #fff;
  }

  .section-name {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.15rem;
    font-weight: 900;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .item-count {
    background: #111;
    color: #ffd900;
    padding: 0.15rem 0.6rem;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    font-size: 0.8rem;
    flex-shrink: 0;
  }

  .commands-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 0;
  }

  .command-card {
    padding: 1rem 1.25rem;
    border-right: 2px solid #eee;
    border-bottom: 2px solid #eee;
    cursor: pointer;
    transition: background 0.1s;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    position: relative;
    overflow: hidden;
  }

  .command-card:hover {
    background: #fdfae5;
  }
  .command-card:hover .copy-hint {
    opacity: 1;
  }

  .cmd-code {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.95rem;
    font-weight: 700;
    color: #c0392b;
    background: #111;
    color: #00e572;
    padding: 0.35rem 0.75rem;
    display: inline-block;
    word-break: break-all;
  }

  .cmd-desc {
    font-size: 0.9rem;
    color: #555;
    font-weight: 600;
  }

  .copy-hint {
    position: absolute;
    bottom: 0.5rem;
    right: 0.75rem;
    font-size: 0.75rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    color: #9b59b6;
    opacity: 0;
    transition: opacity 0.15s;
  }

  /* Empty */
  .empty-state {
    text-align: center;
    padding: 4rem;
    border: 4px dashed #aaa;
    font-weight: 700;
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  /* Info bar */
  .info-bar {
    background: #ffd900;
    border: 4px solid #111;
    padding: 0.8rem 1.5rem;
    font-weight: 700;
    font-size: 0.9rem;
    box-shadow: 5px 5px 0px #111;
    text-align: center;
  }

  @media (max-width: 800px) {
    .brutal-title {
      font-size: 2rem;
    }
    .commands-grid {
      grid-template-columns: 1fr;
    }
    .subject-bar {
      overflow-x: auto;
      flex-wrap: nowrap;
    }
    .subject-btn {
      flex-shrink: 0;
    }
    .search-box {
      min-width: 200px;
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
  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 9px 9px 0px #eee;
  }

  [data-theme='dark'] .subject-bar {
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
    background: #1a1a1a;
  }
  [data-theme='dark'] .subject-btn {
    background: #1a1a1a;
    border-right-color: #333;
    border-bottom-color: #333;
    color: #aaa;
  }
  [data-theme='dark'] .subject-btn:hover {
    background: #333;
    color: #eee;
  }
  [data-theme='dark'] .subject-btn.active {
    background: #eee;
    color: #111;
  }

  [data-theme='dark'] .search-box {
    border-color: #eee;
    box-shadow: 5px 5px 0px #eee;
    background: #1a1a1a;
  }
  [data-theme='dark'] .search-input {
    color: #eee;
  }
  [data-theme='dark'] .clear-btn {
    background: #1a1a1a;
    border-left-color: #eee;
  }

  [data-theme='dark'] .section-block {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 10px 10px 0px #eee;
  }
  [data-theme='dark'] .section-header {
    border-bottom-color: #eee;
    background: #1a1a1a;
  }
  [data-theme='dark'] .command-card {
    border-right-color: #333;
    border-bottom-color: #333;
  }
  [data-theme='dark'] .command-card:hover {
    background: #222;
  }
  [data-theme='dark'] .cmd-desc {
    color: #aaa;
  }

  [data-theme='dark'] .info-bar {
    background: #b28f00;
    border-color: #eee;
    box-shadow: 5px 5px 0px #eee;
    color: #fff;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .badge {
    border-color: #eee;
    box-shadow: 5px 5px 0px #eee;
  }
</style>
