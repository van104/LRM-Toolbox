<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">性能<span>清单()</span></h1>
        <div class="header-actions">
          <div class="brutal-progress-badge">
            <div class="progress-info">
              <span class="p-label">总进度 (PROGRESS)</span>
              <span class="p-val">{{ totalProgress }}%</span>
            </div>
            <div class="progress-bar-wrap">
              <div class="progress-bar-inner" :style="{ width: `${totalProgress}%` }"></div>
            </div>
          </div>
        </div>
      </header>

      <main class="brutal-grid">
        <!-- Sidebar -->
        <aside class="checklist-sidebar">
          <div class="brutal-pane sticky-pane">
            <div class="pane-header bg-yellow">
              <span>🎯 优化维度 (CATEGORY)</span>
            </div>
            <div class="pane-body padding-sm">
              <div class="category-list">
                <button
                  v-for="cat in categories"
                  :key="cat.id"
                  class="cat-btn"
                  :class="{ active: activeCategory === cat.id }"
                  @click="activeCategory = cat.id"
                >
                  <span class="cat-name">{{ cat.icon }} {{ cat.name }}</span>
                  <span class="cat-count"
                    >{{ getCategoryProgress(cat.id).completed }} /
                    {{ getCategoryProgress(cat.id).total }}</span
                  >
                </button>
              </div>

              <div class="mt-4">
                <button class="action-btn danger-btn w-full" @click="resetProgress">
                  🔄 重置所有进度
                </button>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main Content -->
        <div class="checklist-main">
          <section v-for="cat in filteredCategories" :key="cat.id" class="brutal-pane mb-6">
            <div class="pane-header" :class="getCatBg(cat.id)">
              <span class="text-white cat-sec-title">{{ cat.icon }} {{ cat.name }}</span>
              <span class="cat-sec-desc">{{ cat.description }}</span>
            </div>

            <div class="pane-body bg-pattern">
              <div class="item-grid">
                <div
                  v-for="item in cat.items"
                  :key="item.id"
                  class="brutal-check-item"
                  :class="{ checked: isChecked(item.id) }"
                  @click="toggleItem(item.id)"
                >
                  <div class="check-box">
                    <span v-if="isChecked(item.id)" class="check-mark">✖</span>
                  </div>

                  <div class="item-content">
                    <h3 class="item-title">{{ item.title }}</h3>
                    <p class="item-desc">{{ item.desc }}</p>
                    <div class="item-tags">
                      <span
                        v-for="tag in item.tags"
                        :key="tag"
                        class="brutal-tag"
                        :class="getTagColorClass(tag)"
                      >
                        {{ tag }}
                      </span>
                    </div>
                  </div>

                  <div class="priority-ribbon" :class="item.priority">
                    {{
                      item.priority === 'high'
                        ? '高优先级'
                        : item.priority === 'medium'
                          ? '中优先级'
                          : '低优先级'
                    }}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';

  interface ChecklistItem {
    id: string;
    title: string;
    desc: string;
    priority: 'high' | 'medium' | 'low';
    tags: string[];
  }

  interface Category {
    id: string;
    name: string;
    icon: string;
    description: string;
    items: ChecklistItem[];
  }

  const categories = ref<Category[]>([
    {
      id: 'loading',
      name: '资源加载',
      icon: '📦',
      description: '优化静态资源的体积与加载顺序，实现更快的首屏呈现。',
      items: [
        {
          id: 'img-compress',
          title: '图片压缩与优化',
          desc: '使用 WebP 格式，并针对不同设备展示响应式图片。',
          priority: 'high',
          tags: ['图片', '体积']
        },
        {
          id: 'svg-symbol',
          title: 'SVG 图标管理',
          desc: '使用 SVG Sprites 或 Symbol 减少 HTTP 请求。',
          priority: 'medium',
          tags: ['图标', '请求']
        },
        {
          id: 'font-optimization',
          title: '字体子集化',
          desc: '仅加载页面使用的字体字符，使用 font-display: swap。',
          priority: 'medium',
          tags: ['字体', '首屏']
        },
        {
          id: 'code-splitting',
          title: '代码分割 (Route Level)',
          desc: '按路由拆分代码，仅加载当前页面所需的 JS 资源。',
          priority: 'high',
          tags: ['JS', '首屏']
        }
      ]
    },
    {
      id: 'network',
      name: '网络传输',
      icon: '📡',
      description: '通过协议优化与缓存策略减少请求耗时与数据量。',
      items: [
        {
          id: 'http2',
          title: '启用 HTTP/2 或 HTTP/3',
          desc: '利用头部压缩、多路复用等特性加速请求。',
          priority: 'high',
          tags: ['协议', '传输']
        },
        {
          id: 'cdn',
          title: '使用 CDN 加速',
          desc: '将静态资源部署在全球加速节点，减少延迟。',
          priority: 'high',
          tags: ['传输', '延迟']
        },
        {
          id: 'caching',
          title: '精细化缓存策略',
          desc: '配置 Cache-Control 强缓存与 ETag 协商缓存。',
          priority: 'high',
          tags: ['缓存', '请求']
        },
        {
          id: 'compression',
          title: '开启 Gzip/Brotli',
          desc: '在服务端开启资源压缩，大幅减少传输字节数。',
          priority: 'high',
          tags: ['体积', '传输']
        }
      ]
    },
    {
      id: 'rendering',
      name: '渲染性能',
      icon: '🖥️',
      description: '减少主线程阻塞，优化关键渲染路径。',
      items: [
        {
          id: 'css-top',
          title: 'CSS 放在顶部',
          desc: '确保解析 HTML 时尽快加载样式，防止页面闪烁。',
          priority: 'high',
          tags: ['渲染', '首屏']
        },
        {
          id: 'js-bottom',
          title: 'JS 放在底部或使用 defer',
          desc: '防止脚本执行阻塞 HTML 解析与 DOM 构建。',
          priority: 'high',
          tags: ['渲染', '阻塞']
        },
        {
          id: 'cls',
          title: '固定资源占位高度',
          desc: '防止图片加载后撑开布局导致的布局偏移 (CLS)。',
          priority: 'medium',
          tags: ['体验', 'CLS']
        },
        {
          id: 'request-animation',
          title: '使用 requestAnimationFrame',
          desc: '在动画和高频操作中使用该 API 以匹配刷新率。',
          priority: 'medium',
          tags: ['动画', '帧率']
        }
      ]
    },
    {
      id: 'code',
      name: '代码实践',
      icon: '💻',
      description: '编写更高效的代码，减少运行时的性能开销。',
      items: [
        {
          id: 'debounce-throttle',
          title: '防抖与节流',
          desc: '限制 scroll、resize 等高频事件的触发频率。',
          priority: 'high',
          tags: ['代码', '交互']
        },
        {
          id: 'memory-leak',
          title: '内存泄露清理',
          desc: '在组件销毁时及时移除事件监听器和定时器。',
          priority: 'medium',
          tags: ['代码', '内存']
        },
        {
          id: 'virtual-list',
          title: '虚拟列表渲染',
          desc: '在大规模列表渲染时仅保持可视区域内容活跃。',
          priority: 'medium',
          tags: ['DOM', '列表']
        },
        {
          id: 'tree-shaking',
          title: 'Tree Shaking',
          desc: '确保打包工具能够剔除未使用的依赖代码。',
          priority: 'medium',
          tags: ['JS', '体积']
        }
      ]
    }
  ]);

  const activeCategory = ref('all');
  const checkedItems = ref<Set<string>>(new Set());

  const filteredCategories = computed(() => {
    if (activeCategory.value === 'all') return categories.value;
    return categories.value.filter(c => c.id === activeCategory.value);
  });

  const totalItemsCount = computed(() => {
    return categories.value.reduce((acc, cat) => acc + cat.items.length, 0);
  });

  const totalProgress = computed(() => {
    if (totalItemsCount.value === 0) return 0;
    return Math.round((checkedItems.value.size / totalItemsCount.value) * 100);
  });

  const getCategoryProgress = (catId: string) => {
    if (catId === 'all') {
      return { completed: checkedItems.value.size, total: totalItemsCount.value };
    }
    const cat = categories.value.find(c => c.id === catId);
    if (!cat) return { completed: 0, total: 0 };
    const completed = cat.items.filter(item => checkedItems.value.has(item.id)).length;
    return { completed, total: cat.items.length };
  };

  const isChecked = (id: string) => checkedItems.value.has(id);

  const toggleItem = (id: string) => {
    if (checkedItems.value.has(id)) {
      checkedItems.value.delete(id);
    } else {
      checkedItems.value.add(id);
    }
    saveToLocal();
  };

  const resetProgress = () => {
    if (confirm('🚨 警告：确定要重置所有进度吗？此操作不可逆！')) {
      checkedItems.value.clear();
      saveToLocal();
    }
  };

  const saveToLocal = () => {
    localStorage.setItem('lrm_perf_checklist', JSON.stringify(Array.from(checkedItems.value)));
  };

  const getCatBg = (id: string) => {
    const bgs: Record<string, string> = {
      loading: 'bg-blue',
      network: 'bg-green',
      rendering: 'bg-pink',
      code: 'bg-orange'
    };
    return bgs[id] || 'bg-blue';
  };

  const getTagColorClass = (tag: string) => {
    const list = ['tag-green', 'tag-blue', 'tag-pink', 'tag-yellow', 'tag-orange'];
    // 简单的按长度或字符 hash
    let num = 0;
    for (let i = 0; i < tag.length; i++) {
      num += tag.charCodeAt(i);
    }
    return list[num % list.length];
  };

  onMounted(() => {
    // 默认加入一个 'all' 类别以便显示全体进度
    if (!categories.value.find(c => c.id === 'all')) {
      categories.value.unshift({
        id: 'all',
        name: '全部清单',
        icon: '📋',
        description: '查看所有性能优化清单',
        items: []
      } as unknown as Category);
    }

    const saved = localStorage.getItem('lrm_perf_checklist');
    if (saved) {
      try {
        checkedItems.value = new Set(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved progress', e);
      }
    }
  });
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

  /* Header */
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
    text-shadow: 4px 4px 0px #f59e0b;
  }
  .brutal-title span {
    color: #f59e0b;
    text-shadow: 4px 4px 0px #111;
    letter-spacing: 0;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .brutal-progress-badge {
    background: #fff;
    border: 4px solid #111;
    padding: 0.5rem 1rem;
    box-shadow: 6px 6px 0px #111;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 200px;
  }
  .progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .p-label {
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    font-size: 0.9rem;
  }
  .p-val {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 900;
    font-size: 1.2rem;
  }
  .progress-bar-wrap {
    width: 100%;
    height: 12px;
    border: 2px solid #111;
    background: #eee;
  }
  .progress-bar-inner {
    height: 100%;
    background: #10b981;
    transition: width 0.3s ease;
    border-right: 2px solid #111;
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

  /* Main Grid */
  .brutal-grid {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 2.5rem;
    align-items: start;
  }

  .checklist-sidebar {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  .sticky-pane {
    position: sticky;
    top: 2rem;
  }

  .brutal-pane {
    border: 4px solid #111;
    background: #fff;
    box-shadow: 10px 10px 0px #111;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .pane-header {
    padding: 1rem 1.2rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1.1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .bg-yellow {
    background: #ffd900;
  }
  .bg-blue {
    background: #0ea5e9;
  }
  .bg-pink {
    background: #ff7be5;
  }
  .bg-green {
    background: #10b981;
  }
  .bg-orange {
    background: #f59e0b;
  }
  .text-white {
    color: #fff;
  }

  .cat-sec-title {
    font-size: 1.4rem;
  }
  .cat-sec-desc {
    font-size: 0.85rem;
    font-weight: 700;
    opacity: 0.9;
    margin-left: 1rem;
  }

  .pane-body {
    display: flex;
    flex-direction: column;
  }
  .padding-sm {
    padding: 1.5rem;
  }

  .bg-pattern {
    background-image: radial-gradient(#aaa 1px, transparent 0);
    background-size: 20px 20px;
    padding: 1.5rem;
  }

  /* Category List */
  .category-list {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }
  .cat-btn {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 1rem;
    background: #fff;
    border: 3px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
  }
  .cat-btn:hover:not(.active) {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
    background: #fdfae5;
  }
  .cat-btn.active {
    background: #111;
    color: #fff;
    transform: translate(3px, 3px);
    box-shadow: 0 0 0 transparent;
  }

  .action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.8rem;
    font-weight: 800;
    font-family: 'Syne', sans-serif;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
  }
  .action-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }
  .action-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px transparent;
  }
  .danger-btn {
    background: #ff4b4b;
    color: #fff;
    text-transform: uppercase;
  }
  .w-full {
    width: 100%;
    box-sizing: border-box;
  }
  .mt-4 {
    margin-top: 1.5rem;
  }
  .mb-6 {
    margin-bottom: 2.5rem;
  }

  /* Item Grid */
  .item-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 1.5rem;
  }

  .brutal-check-item {
    background: #fff;
    border: 4px solid #111;
    display: flex;
    padding: 0;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }
  .brutal-check-item:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }

  .check-box {
    width: 60px;
    border-right: 4px solid #111;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #eee;
    font-size: 2rem;
    font-weight: 900;
    color: #111;
    transition: background 0.3s;
  }

  .brutal-check-item.checked .check-box {
    background: #ffd900;
  }

  .item-content {
    flex: 1;
    padding: 1.2rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .item-title {
    font-size: 1.1rem;
    font-weight: 900;
    margin: 0;
    color: #111;
    transition: opacity 0.3s;
  }
  .item-desc {
    font-size: 0.9rem;
    font-weight: 600;
    color: #555;
    margin: 0;
    line-height: 1.5;
    transition: opacity 0.3s;
  }

  .brutal-check-item.checked .item-title,
  .brutal-check-item.checked .item-desc {
    opacity: 0.4;
    text-decoration: line-through;
  }

  .item-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  .brutal-tag {
    font-size: 0.75rem;
    font-weight: 800;
    border: 2px solid #111;
    padding: 2px 6px;
    box-shadow: 2px 2px 0px #111;
    background: #fff;
    color: #111;
  }

  .tag-green {
    background: #eaffed;
  }
  .tag-blue {
    background: #e0f2fe;
  }
  .tag-pink {
    background: #fce7f3;
  }
  .tag-yellow {
    background: #fef08a;
  }
  .tag-orange {
    background: #ffedd5;
  }

  .brutal-check-item.checked .brutal-tag {
    opacity: 0.4;
    box-shadow: 0 0 0 transparent;
    transform: translate(2px, 2px);
  }

  /* Ribbon */
  .priority-ribbon {
    position: absolute;
    top: 16px;
    right: -32px;
    padding: 4px 34px;
    font-size: 0.7rem;
    font-weight: 900;
    text-transform: uppercase;
    transform: rotate(45deg);
    border: 2px solid #111;
    box-shadow: 2px 2px 0px #111;
    background: #fff;
    z-index: 10;
  }
  .priority-ribbon.high {
    background: #ff4b4b;
    color: #fff;
  }
  .priority-ribbon.medium {
    background: #f59e0b;
    color: #111;
  }
  .priority-ribbon.low {
    background: #10b981;
    color: #fff;
    border-color: #111;
  }

  @media (max-width: 1024px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .sticky-pane {
      position: static;
    }
    .pane-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
    .cat-sec-desc {
      margin-left: 0;
    }
  }

  /* Dark Mode */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }

  [data-theme='dark'] .brutal-pane {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 10px 10px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .brutal-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }

  [data-theme='dark'] .brutal-progress-badge {
    background: #222;
    border-color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .progress-bar-wrap {
    border-color: #eee;
    background: #333;
  }
  [data-theme='dark'] .progress-bar-inner {
    border-color: #eee;
  }

  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #075985;
    color: #fff;
  }
  [data-theme='dark'] .bg-pink {
    background: #9d174d;
    color: #fff;
  }
  [data-theme='dark'] .bg-green {
    background: #064e3b;
    color: #fff;
  }
  [data-theme='dark'] .bg-orange {
    background: #7c2d12;
    color: #fff;
  }

  [data-theme='dark'] .cat-btn {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .cat-btn:hover:not(.active) {
    background: #333;
  }
  [data-theme='dark'] .cat-btn.active {
    background: #eee;
    color: #111;
  }

  [data-theme='dark'] .action-btn {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .danger-btn {
    background: #991b1b;
    color: #fff;
  }

  [data-theme='dark'] .brutal-check-item {
    background: #222;
    border-color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .check-box {
    background: #111;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-check-item.checked .check-box {
    background: #b28f00;
    color: #111;
  }

  [data-theme='dark'] .item-title {
    color: #eee;
  }
  [data-theme='dark'] .item-desc {
    color: #aaa;
  }

  [data-theme='dark'] .brutal-tag {
    background: #111;
    border-color: #eee;
    color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .tag-green {
    background: #064e3b;
  }
  [data-theme='dark'] .tag-blue {
    background: #075985;
  }
  [data-theme='dark'] .tag-pink {
    background: #831843;
  }
  [data-theme='dark'] .tag-yellow {
    background: #713f12;
  }
  [data-theme='dark'] .tag-orange {
    background: #7c2d12;
  }

  [data-theme='dark'] .priority-ribbon {
    background: #111;
    border-color: #eee;
    color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .priority-ribbon.high {
    background: #991b1b;
  }
  [data-theme='dark'] .priority-ribbon.low {
    background: #064e3b;
  }
</style>
