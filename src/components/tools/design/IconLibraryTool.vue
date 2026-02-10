<template>
  <div class="icon-library-tool">
    <div class="nav-header">
      <button class="back-btn" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        <span>返回</span>
      </button>
    </div>

    <div class="tool-header">
      <h1 class="font-display">图标库大全</h1>
      <p class="summary">精选全球优质矢量图标库，一站式搜索与下载</p>
    </div>

    <div class="search-section">
      <div class="search-box glass-card">
        <el-icon class="search-icon" :size="24">
          <Search />
        </el-icon>
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="输入关键词（如 'user', 'setting'），在下方库中快速尝试搜索..."
          class="search-input"
          @keyup.enter="handleGlobalSearch"
        />
        <button v-if="searchKeyword" class="clear-btn" @click="searchKeyword = ''">
          <el-icon>
            <Close />
          </el-icon>
        </button>
      </div>
    </div>

    <div class="libraries-grid">
      <div v-for="lib in libraries" :key="lib.name" class="lib-card glass-card">
        <div class="lib-header">
          <div class="lib-icon-wrapper" :style="{ background: lib.colorBg }">
            <component
              :is="lib.iconComponent"
              v-if="lib.iconComponent"
              :style="{ color: lib.colorText }"
            />
            <span v-else class="text-icon" :style="{ color: lib.colorText }">{{
              lib.name[0]
            }}</span>
          </div>
          <h3 class="lib-name">{{ lib.name }}</h3>
        </div>

        <p class="lib-desc">{{ lib.description }}</p>

        <div class="lib-stats">
          <span v-for="tag in lib.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>

        <div class="lib-actions">
          <button class="btn-visit" @click="openUrl(lib.url)">
            <span>访问官网</span>
            <el-icon>
              <Right />
            </el-icon>
          </button>

          <button
            class="btn-search"
            :disabled="!searchKeyword"
            :title="
              searchKeyword ? `在 ${lib.name} 中搜索 '${searchKeyword}'` : '请先在上方输入关键词'
            "
            @click="searchInLibrary(lib)"
          >
            <span>搜索</span>
            <el-icon>
              <Search />
            </el-icon>
          </button>
        </div>
      </div>
    </div>

    <footer class="footer">© 2026 LRM工具箱 - 图标库导航</footer>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { Search, Close, Right, StarFilled, Back } from '@element-plus/icons-vue';

  const searchKeyword = ref('');

  const libraries = [
    {
      name: 'Iconfont',
      description:
        '阿里巴巴矢量图标库，国内功能最强大、图标内容最丰富的矢量图标平台。支持 SVG、Font、PNG 等格式下载。',
      url: 'https://www.iconfont.cn/',
      searchUrl: 'https://www.iconfont.cn/search/index?searchType=icon&q={query}',
      tags: ['中文', 'SVG', 'WebFont'],
      colorBg: '#FFF0F5',
      colorText: '#FF0055',

      iconComponent: StarFilled
    },
    {
      name: 'Font Awesome',
      description:
        '全球最流行的图标库，提供海量图标，基于 CSS 和 Less。拥有庞大的社区支持和丰富的应用场景。',
      url: 'https://fontawesome.com/',
      searchUrl: 'https://fontawesome.com/search?q={query}&o=r',
      tags: ['流行', 'CSS', 'Toolkit'],
      colorBg: '#E0F7FA',
      colorText: '#00ACC1',
      iconComponent: StarFilled
    },
    {
      name: 'Feather Icons',
      description:
        '简洁、精美的开源图标集。强调简洁、一致性和可读性，非常适合现代简洁风格的 UI 设计。',
      url: 'https://feathericons.com/',

      searchUrl: 'https://feathericons.com/?query={query}',
      tags: ['开源', '简洁', '轻量'],
      colorBg: '#F3E5F5',
      colorText: '#AB47BC',
      iconComponent: StarFilled
    },
    {
      name: 'Remix Icon',
      description: '一套专门为设计师和开发者打造的开源中立风格的系统符号，精心绘制，风格统一。',
      url: 'https://remixicon.com/',
      searchUrl: 'https://remixicon.com/?q={query}',
      tags: ['开源', '中立', '系统'],
      colorBg: '#E8F5E9',
      colorText: '#43A047',
      iconComponent: StarFilled
    },
    {
      name: 'Material Symbols',
      description:
        'Google 推出的最新图标系统，支持可变字体（Variable Font），可调整粗细、填充、字重等属性。',
      url: 'https://fonts.google.com/icons',
      searchUrl: 'https://fonts.google.com/icons?selected=Material+Symbols+Outlined&query={query}',
      tags: ['Google', '可变', '系统'],
      colorBg: '#E3F2FD',
      colorText: '#1E88E5',
      iconComponent: StarFilled
    },
    {
      name: 'Phosphor Icons',
      description: '灵活的图标库，提供多种风格（细、常规、粗、填充等），完美适配各种设计需求。',
      url: 'https://phosphoricons.com/',
      searchUrl: 'https://phosphoricons.com/?q={query}',
      tags: ['多风格', '灵活', 'React/Vue'],
      colorBg: '#FFF8E1',
      colorText: '#FFB300',
      iconComponent: StarFilled
    }
  ];

  function openUrl(url) {
    window.open(url, '_blank');
  }

  function searchInLibrary(lib) {
    if (!lib.searchUrl) {
      openUrl(lib.url);
      return;
    }
    const url = lib.searchUrl.replace('{query}', encodeURIComponent(searchKeyword.value));
    window.open(url, '_blank');
  }

  function handleGlobalSearch() {}
</script>

<style scoped>
  .icon-library-tool {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
    min-height: 80vh;
    display: flex;
    flex-direction: column;
  }

  .nav-header {
    margin-bottom: 20px;
  }

  .back-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 1rem;
    padding: 8px 16px;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .back-btn:hover {
    background: rgba(0, 0, 0, 0.05);
    color: var(--text-primary);
  }

  .tool-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .tool-header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    background: var(--accent-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 16px;
  }

  .summary {
    color: var(--text-secondary);
    font-size: 1.1rem;
  }

  .search-section {
    max-width: 700px;
    margin: 0 auto 60px;
    width: 100%;
  }

  .search-box {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    background: white;
    border: 1px solid var(--border-color);
    border-radius: 100px;

    transition: all 0.3s;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  .search-box:focus-within {
    border-color: var(--accent-purple);
    box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.15);
    transform: translateY(-2px);
  }

  .search-input {
    flex: 1;
    border: none;
    background: transparent;
    padding: 12px;
    font-size: 1.1rem;
    outline: none;
    color: var(--text-primary);
  }

  .search-icon {
    color: var(--text-muted);
  }

  .clear-btn {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
    padding: 4px;
  }

  .clear-btn:hover {
    color: var(--text-primary);
  }

  .libraries-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
    margin-bottom: 40px;
  }

  .lib-card {
    background: white;
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .lib-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.1);
    border-color: var(--accent-purple);
  }

  .lib-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
  }

  .lib-icon-wrapper {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: bold;
  }

  .lib-name {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .lib-desc {
    color: var(--text-secondary);
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: 20px;
    flex: 1;
  }

  .lib-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 24px;
  }

  .tag {
    background: var(--bg-secondary);
    color: var(--text-secondary);
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .lib-actions {
    display: flex;
    gap: 12px;
  }

  .lib-actions button {
    flex: 1;
    padding: 10px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.2s;
  }

  .btn-visit {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid transparent;
  }

  .btn-visit:hover {
    background: #e2e8f0;
  }

  .btn-search {
    background: var(--accent-purple);
    color: white;
  }

  .btn-search:hover {
    background: var(--accent-purple-dark, #4f46e5);
  }

  .btn-search:disabled {
    background: var(--bg-secondary);
    color: var(--text-muted);
    cursor: not-allowed;
  }

  .footer {
    text-align: center;
    padding: 2rem 0;
    margin-top: auto;
    color: #64748b;
    font-size: 0.85rem;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
  }

  @media (prefers-color-scheme: dark) {
    .footer {
      color: #94a3b8;
      border-color: rgba(255, 255, 255, 0.05);
    }
  }
</style>
