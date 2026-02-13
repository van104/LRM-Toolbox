<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">前端性能清单</h1>
        <span class="tool-subtitle">Front-end Performance Checklist</span>
      </div>
      <div class="header-right">
        <div class="overall-progress">
          <span class="progress-label">总进度</span>
          <el-progress
            type="circle"
            :percentage="totalProgress"
            :width="40"
            :stroke-width="4"
            color="var(--el-color-primary)"
          />
        </div>
      </div>
    </header>

    <main class="tool-content">
      <div class="checklist-layout">
        <!-- 分类侧边栏 -->
        <aside class="checklist-sidebar">
          <div class="panel glass-card sticky-sidebar">
            <h2 class="panel-title">
              <el-icon><Filter /></el-icon> 优化维度
            </h2>
            <div class="category-list">
              <button
                v-for="cat in categories"
                :key="cat.id"
                class="category-btn"
                :class="{ active: activeCategory === cat.id }"
                @click="activeCategory = cat.id"
              >
                <div class="cat-info">
                  <el-icon><component :is="cat.icon" /></el-icon>
                  <span>{{ cat.name }}</span>
                </div>
                <span class="cat-count"
                  >{{ getCategoryProgress(cat.id).completed }}/{{
                    getCategoryProgress(cat.id).total
                  }}</span
                >
              </button>
            </div>

            <div class="sidebar-footer mt-6">
              <el-button type="danger" plain class="w-full" @click="resetProgress">
                <el-icon><RefreshRight /></el-icon> 重置进度
              </el-button>
            </div>
          </div>
        </aside>

        <!-- 主内容区域 -->
        <div class="checklist-main">
          <section v-for="cat in filteredCategories" :key="cat.id" class="checklist-section">
            <div class="section-header">
              <h2 class="section-title">
                <el-icon><component :is="cat.icon" /></el-icon>
                {{ cat.name }}
              </h2>
              <p class="section-desc">{{ cat.description }}</p>
            </div>

            <div class="item-grid">
              <div
                v-for="item in cat.items"
                :key="item.id"
                class="checklist-item"
                :class="{ checked: isChecked(item.id) }"
                @click="toggleItem(item.id)"
              >
                <div class="item-checkbox">
                  <div class="checkbox-inner">
                    <el-icon v-if="isChecked(item.id)"><Check /></el-icon>
                  </div>
                </div>
                <div class="item-content">
                  <h3 class="item-title">{{ item.title }}</h3>
                  <p class="item-desc">{{ item.desc }}</p>
                  <div class="item-tags">
                    <el-tag
                      v-for="tag in item.tags"
                      :key="tag"
                      size="small"
                      effect="plain"
                      :type="getTagType(tag)"
                    >
                      {{ tag }}
                    </el-tag>
                  </div>
                </div>
                <div class="item-priority" :class="item.priority">
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
          </section>
        </div>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - 前端性能清单</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import {
    ArrowLeft,
    Filter,
    Check,
    RefreshRight,
    Files,
    Connection,
    Monitor,
    Cpu
  } from '@element-plus/icons-vue';
  import { ElMessageBox, ElMessage } from 'element-plus';

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
    icon: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    description: string;
    items: ChecklistItem[];
  }

  const categories = ref<Category[]>([
    {
      id: 'loading',
      name: '资源加载',
      icon: Files,
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
      icon: Connection,
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
          desc: '将静态资源部署在全球加速节点，减少网络往返延迟。',
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
      icon: Monitor,
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
      icon: Cpu,
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

  const getTagType = (tag: string) => {
    const types: Record<string, string> = {
      图片: 'warning',
      JS: 'primary',
      HTML: 'danger',
      CSS: 'info',
      首屏: 'success'
    };
    return types[tag] || 'info';
  };

  const resetProgress = () => {
    ElMessageBox.confirm('确定要重置所有进度吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      checkedItems.value.clear();
      saveToLocal();
      ElMessage.success('已重置');
    });
  };

  const saveToLocal = () => {
    localStorage.setItem('lrm_perf_checklist', JSON.stringify(Array.from(checkedItems.value)));
  };

  onMounted(() => {
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
  .tool-page {
    min-height: 100vh;
    background: #f1f5f9;
    display: flex;
    flex-direction: column;
  }

  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-left,
  .header-right {
    width: 160px;
  }

  .header-right {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .overall-progress {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .progress-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
  }

  .header-center {
    text-align: center;
    flex: 1;
  }

  .tool-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }

  .tool-subtitle {
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
  }

  .tool-content {
    flex: 1;
    padding: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .checklist-layout {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  @media (min-width: 1024px) {
    .checklist-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 1.5rem;
      align-items: start;
    }
  }

  .sticky-sidebar {
    position: sticky;
    top: 5rem;
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    padding: 24px;
  }

  .panel-title {
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .category-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .category-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }

  .category-btn:hover {
    background: #f1f5f9;
    color: #1e293b;
  }

  .category-btn.active {
    background: #e0f2fe;
    color: #0284c7;
    font-weight: 600;
  }

  .cat-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .cat-count {
    font-size: 0.75rem;
    font-family: monospace;
    opacity: 0.8;
  }

  .checklist-main {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }

  .section-header {
    margin-bottom: 20px;
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
  }

  .section-desc {
    font-size: 0.875rem;
    color: #64748b;
  }

  .item-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }

  @media (min-width: 768px) {
    .item-grid {
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    }
  }

  .checklist-item {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    gap: 16px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }

  .checklist-item:hover {
    border-color: #cbd5e1;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .checklist-item.checked {
    background: #f0fdf4;
    border-color: #86efac;
  }

  .item-checkbox {
    flex-shrink: 0;
    margin-top: 4px;
  }

  .checkbox-inner {
    width: 22px;
    height: 22px;
    border: 2px solid #cbd5e1;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    background: #fff;
  }

  .checked .checkbox-inner {
    background: #22c55e;
    border-color: #22c55e;
    color: white;
  }

  .item-content {
    flex: 1;
  }

  .item-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 4px 0;
  }

  .checked .item-title {
    color: #166534;
    text-decoration: line-through;
    opacity: 0.7;
  }

  .item-desc {
    font-size: 0.85rem;
    color: #64748b;
    margin-bottom: 12px;
    line-height: 1.4;
  }

  .checked .item-desc {
    opacity: 0.6;
  }

  .item-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .item-priority {
    position: absolute;
    top: 12px;
    right: -24px;
    padding: 2px 28px;
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    transform: rotate(45deg);
    background: #f1f5f9;
    color: #64748b;
  }

  .item-priority.high {
    background: #fee2e2;
    color: #ef4444;
  }
  .item-priority.medium {
    background: #fef3c7;
    color: #d97706;
  }
  .item-priority.low {
    background: #ecfdf5;
    color: #10b981;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }

  .mt-6 {
    margin-top: 1.5rem;
  }
  .w-full {
    width: 100%;
  }
</style>
