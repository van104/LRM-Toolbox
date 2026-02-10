<template>
  <div class="cheat-sheet-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>学科知识速查表</h1>
        <span class="nav-subtitle">Knowledge CheatSheets</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="layout-container">
        <aside class="side-nav glass-card">
          <div
            v-for="sub in subjects"
            :key="sub.id"
            class="nav-item"
            :class="{ active: currentSubject.id === sub.id }"
            @click="selectSubject(sub)"
          >
            <el-icon>
              <collection />
            </el-icon>
            {{ sub.name }}
          </div>
        </aside>

        <section class="content-view glass-card">
          <div class="subject-header">
            <h2>{{ currentSubject.name }} 指南</h2>
            <div class="search-wrap">
              <el-input
                v-model="filterKey"
                placeholder="快速过滤关键词..."
                prefix-icon="Search"
                clearable
              />
            </div>
          </div>

          <div class="content-tip">
            <el-icon>
              <InfoFilled />
            </el-icon>
            <span>当前仅收录常用基础操作，更多进阶内容持续更新补充中...</span>
          </div>

          <div class="cheat-grid">
            <div v-for="section in filteredSections" :key="section.title" class="cheat-card">
              <h4 class="section-title">{{ section.title }}</h4>
              <div class="command-list">
                <div
                  v-for="item in section.items"
                  :key="item.cmd"
                  class="command-item"
                  @click="copy(item.cmd)"
                >
                  <div class="cmd-info">
                    <code class="code-text">{{ item.cmd }}</code>
                    <span class="cmd-desc">{{ item.desc }}</span>
                  </div>
                  <el-icon class="copy-icon">
                    <CopyDocument />
                  </el-icon>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 学科速查</footer>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { Back, CopyDocument, Collection, InfoFilled } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';
  import { subjectList, loadSubject } from '@/data/cheatsheet';

  const filterKey = ref('');
  const subjects = subjectList;
  const currentSubject = ref(subjects[0]);
  const currentDetails = ref(null);

  const filteredSections = computed(() => {
    if (!currentDetails.value) return [];

    const sections = currentDetails.value.sections;
    if (!filterKey.value) return sections;

    return sections
      .map(sec => ({
        ...sec,
        items: sec.items.filter(
          i =>
            i.cmd.toLowerCase().includes(filterKey.value.toLowerCase()) ||
            i.desc.toLowerCase().includes(filterKey.value.toLowerCase())
        )
      }))
      .filter(sec => sec.items.length > 0);
  });

  const selectSubject = async sub => {
    currentSubject.value = sub;
    // Optional: add loading state
    currentDetails.value = null;
    currentDetails.value = await loadSubject(sub.id);
  };

  const copy = text => {
    navigator.clipboard.writeText(text).then(() => {
      ElMessage.success('复制成功: ' + text);
    });
  };

  onMounted(() => {
    selectSubject(subjects[0]);
  });
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Noto+Sans+SC:wght@400;600&display=swap');

  .cheat-sheet-tool {
    --bg: #fdfdfd;
    --card: #ffffff;
    --border: #f0f0f0;
    --text: #333;
    --text-2: #888;
    --primary: #9b59b6;

    font-family: 'Noto Sans SC', sans-serif;
    min-height: 100vh;
    max-height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
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
    border: none;
    background: none;
    color: var(--text-2);
    cursor: pointer;
  }

  .nav-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .nav-center h1 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
  }

  .nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-2);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-top: 2px;
  }

  .main-content {
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 1.5rem;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .layout-container {
    display: grid;
    grid-template-columns: 260px 1fr;
    gap: 1.5rem;
    flex: 1;
    min-height: 0;
  }

  .glass-card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
  }

  .side-nav {
    padding: 1rem;
    overflow-y: auto;
    height: 100%;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0.8rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    color: var(--text);
    font-weight: 500;
    margin-bottom: 0.5rem;
    transition: all 0.2s;
  }

  .nav-item:hover {
    background: #f8f9fa;
  }

  .nav-item.active {
    background: #f4ecf7;
    color: var(--primary);
  }

  .content-view {
    padding: 2.5rem;
    overflow-y: auto;
  }

  .subject-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2.5rem;
  }

  .subject-header h2 {
    margin: 0;
    font-size: 1.5rem;
  }

  .search-wrap {
    width: 240px;
  }

  .content-tip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: #fdf6ec;
    border: 1px solid #faecd8;
    border-radius: 8px;
    color: #e6a23c;
    font-size: 0.85rem;
    margin-bottom: 2rem;
  }

  .cheat-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .section-title {
    font-size: 1.1rem;
    border-left: 4px solid var(--primary);
    padding-left: 12px;
    margin-bottom: 1.25rem;
  }

  .command-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }

  .command-item {
    background: #fcfcfc;
    border: 1px solid #f1f1f1;
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s;
  }

  .command-item:hover {
    border-color: var(--primary);
    background: #fff;
    box-shadow: 0 4px 12px rgba(155, 89, 182, 0.1);
  }

  .code-text {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.9rem;
    color: #e74c3c;
    background: #fdf2f2;
    padding: 2px 6px;
    border-radius: 4px;
    display: block;
    margin-bottom: 4px;
  }

  .cmd-desc {
    font-size: 0.8rem;
    color: var(--text-2);
  }

  .copy-icon {
    color: #ddd;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .command-item:hover .copy-icon {
    opacity: 1;
    color: var(--primary);
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-2);
    font-size: 0.85rem;
    border-top: 1px solid var(--border);
  }

  @media (max-width: 900px) {
    .layout-container {
      grid-template-columns: 1fr;
    }

    .side-nav {
      display: flex;
      overflow-x: auto;
      padding-bottom: 1rem;
    }

    .nav-item {
      flex-shrink: 0;
    }
  }
</style>
