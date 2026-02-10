<template>
  <div class="font-resource-tool">
    <div class="nav-header">
      <button class="back-btn" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        <span>返回</span>
      </button>
    </div>

    <div class="tool-header">
      <h1 class="font-display">字体资源大全</h1>
      <p class="summary">精选全球优质免费商用字体与 WebFont 服务，设计师必备</p>
    </div>

    <div class="search-section">
      <div class="search-box glass-card">
        <el-icon class="search-icon" :size="24">
          <Search />
        </el-icon>
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="输入字体名称关键词，尝试在下方平台搜索..."
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
            <span class="text-icon" :style="{ color: lib.colorText }">{{
              lib.iconText || lib.name[0]
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
            :disabled="!searchKeyword || !lib.searchUrl"
            :title="getSearchTitle(lib)"
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

    <footer class="footer">© 2026 LRM工具箱 - 字体资源导航</footer>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { Search, Close, Right, Back } from '@element-plus/icons-vue';

  const searchKeyword = ref('');

  const libraries = [
    {
      name: 'Google Fonts',
      description:
        '全球最大的开源字体库，提供大量免费可商用的 WebFont，无需下载即可在网页中直接引用。',
      url: 'https://fonts.google.com/',
      searchUrl: 'https://fonts.google.com/?query={query}',
      tags: ['开源', 'WebFont', '免费商用'],
      colorBg: '#E3F2FD',
      colorText: '#1976D2',
      iconText: 'G'
    },
    {
      name: '字由 (HelloFont)',
      description:
        '设计师必备的字体管理工具，聚合全球海量字体，支持一键激活到设计软件，无需安装字体文件。',
      url: 'https://www.hellofont.cn/',
      searchUrl: 'https://www.hellofont.cn/search?content={query}',
      tags: ['客户端', '管理', '云字体'],
      colorBg: '#FFF3E0',
      colorText: '#F57C00',
      iconText: '字'
    },
    {
      name: '100font',
      description: '专门收集整理免费商用字体的导航网站，清晰标注授权范围，致力于让设计师用字无忧。',
      url: 'https://www.100font.com/',
      searchUrl: 'https://www.100font.com/?s={query}',
      tags: ['免费商用', '打包下载', '中文'],
      colorBg: '#E8F5E9',
      colorText: '#388E3C',
      iconText: '100'
    },
    {
      name: 'Adobe Fonts (Typekit)',
      description:
        'Adobe 官方字体服务，订阅 Creative Cloud 即可商用海量高品质字体，无缝集成 Adobe 全家桶。',
      url: 'https://fonts.adobe.com/',
      searchUrl: 'https://fonts.adobe.com/search?q={query}',
      tags: ['Adobe', '高品质', '商用'],
      colorBg: '#FFEBEE',
      colorText: '#D32F2F',
      iconText: 'A'
    },
    {
      name: '猫啃网 (Maoken)',
      description: '知名的免费商用字体收集站，更新及时，提供详尽的授权说明和字体预览。',
      url: 'https://www.maoken.com/',
      searchUrl: 'https://www.maoken.com/?s={query}',
      tags: ['免费', '中文', '资讯'],
      colorBg: '#F3E5F5',
      colorText: '#7B1FA2',
      iconText: '猫'
    },
    {
      name: 'Font Squirrel',
      description:
        '精选的高质量免费商用字体库，提供 Webfont Generator 工具，可将本地字体转换为 Web 格式。',
      url: 'https://www.fontsquirrel.com/',
      searchUrl: 'https://www.fontsquirrel.com/fonts/list/find_fonts?q={query}',
      tags: ['英文', '转换工具', '商用'],
      colorBg: '#ECEFF1',
      colorText: '#455A64',
      iconText: 'Sq'
    }
  ];

  function openUrl(url) {
    window.open(url, '_blank');
  }

  function getSearchTitle(lib) {
    if (!lib.searchUrl) return '该站点不支持直接搜索';
    if (!searchKeyword.value) return '请先在上方输入关键词';
    return `k在 ${lib.name} 中搜索 '${searchKeyword.value}'`;
  }

  function searchInLibrary(lib) {
    if (!lib.searchUrl) return;
    const url = lib.searchUrl.replace('{query}', encodeURIComponent(searchKeyword.value));
    window.open(url, '_blank');
  }

  function handleGlobalSearch() {}
</script>

<style scoped>
  .font-resource-tool {
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
