<template>
  <div class="brutal-page-container">
    <header class="brutal-page-header">
      <button class="brutal-btn-secondary" @click="$router.push('/')">
        <el-icon><ArrowLeft /></el-icon> 返回首页
      </button>
    </header>

    <main class="brutal-page-content">
      <div class="changelog-hero">
        <h1 class="brutal-page-title">系统演进录.LOG()</h1>
        <div class="brutal-stats-box">
          <div class="stat-item">
            <span class="stat-val">{{ totalToolsCount || '...' }}</span>
            <span class="stat-name">工具模块</span>
          </div>
          <div class="stat-item">
            <span class="stat-val">v2.5.1</span>
            <span class="stat-name">最新版本</span>
          </div>
          <div class="stat-item">
            <span class="stat-val">Beta</span>
            <span class="stat-name">当前阶段</span>
          </div>
        </div>
      </div>

      <div class="brutal-timeline">
        <div
          v-for="(release, index) in releases"
          :key="release.version"
          class="timeline-node"
          :class="{ 'is-minor-node': release.type === 'minor' }"
        >
          <!-- Timeline Marker Line -->
          <div class="timeline-axle">
            <div
              class="axle-pip"
              :class="{ 'latest-pip': index === 0, 'minor-pip': release.type === 'minor' }"
            ></div>
            <div class="axle-line"></div>
          </div>

          <!-- Timeline Content Card -->
          <!-- 大版本卡片 -->
          <div
            v-if="release.type !== 'minor'"
            class="brutal-card-node"
            :class="getBrutalColorClass(index)"
          >
            <div class="node-head">
              <span class="node-version">{{ release.version }}</span>
              <span class="node-date">{{ release.date }}</span>
              <span v-if="index === 0" class="tag-latest">STABLE_MAJOR</span>
            </div>

            <h3 class="node-title">{{ release.title }}</h3>

            <div class="node-groups">
              <div v-for="group in release.groups" :key="group.label" class="change-group">
                <h4 class="group-label">
                  <span class="group-icon">{{ group.icon }}</span>
                  {{ group.label }}
                </h4>
                <ul class="group-items">
                  <li v-for="item in group.items" :key="item">{{ item }}</li>
                </ul>
              </div>
            </div>

            <div v-if="release.note" class="node-note">>> [LOG_NOTE]: {{ release.note }}</div>
          </div>

          <!-- 小版本/补丁卡片 -->
          <div v-else class="minor-card-node">
            <div class="minor-head">
              <span class="minor-version">{{ release.version }}</span>
              <span class="minor-date">{{ release.date }}</span>
              <span class="minor-title">{{ release.title }}</span>
            </div>
            <ul class="minor-items">
              <template v-for="group in release.groups" :key="group.label">
                <li v-for="item in group.items" :key="item" class="minor-li">
                  <span class="mini-icon">{{ group.icon }}</span> {{ item }}
                </li>
              </template>
            </ul>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { ArrowLeft } from '@element-plus/icons-vue';
  import { loadAllTools } from '@/data/tools';

  const totalToolsCount = ref(0);

  onMounted(async () => {
    const tools = await loadAllTools();
    totalToolsCount.value = tools.length;
  });

  const releases = ref([
    {
      version: 'v2.5.1',
      date: '2026-03-01',
      type: 'minor', // 小版本
      title: '全新工具：JS 混淆器上线与全局优化',
      groups: [
        {
          label: '新工具发布',
          icon: '🚀',
          items: [
            '【全新上线】专业级 JavaScript 代码混淆工具，支持文件夹批量混淆与 ZIP 导出',
            '引入 Shannon Entropy (香农熵) 分析及双窗对比预览功能'
          ]
        },
        {
          label: '框架优化',
          icon: '✨',
          items: [
            '部署 scrollbar-gutter 策略，解决全站页面因滚动条产生的布局抖动问题',
            '优化混淆器配置面板样式，支持布尔值状态高亮显示'
          ]
        }
      ]
    },
    {
      version: 'v2.5.0',
      date: '2026-02-26',
      type: 'major',
      title: '视觉重塑：图标系统全面升级',
      groups: [
        {
          label: '视觉更新',
          icon: '✨',
          items: [
            '替换全站所有工具分类图标',
            '全面升级 250+ 工具的独立 SVG 图标',
            '优化图标在 Neobrutalism 风格下的视觉表现'
          ]
        }
      ],
      note: '这次更新我们彻底重塑了全站的图标系统，让每一个工具都拥有了独特的视觉灵魂。'
    },
    {
      version: 'v2.0.0',
      date: '2026-02-23',
      type: 'major',
      title: '赛博狂潮：Neobrutalism 降临',
      groups: [
        {
          label: 'UI 视觉重建',
          icon: '🎨',
          items: [
            '全域界面启用 "新粗野主义 (Neobrutalism)" 设计语言',
            '引入极致黑边框、深重投影与高反差的色彩碰撞',
            '对所有荧光色板实施马卡龙降调，解决滚动感光频闪'
          ]
        },
        {
          label: '极客交互',
          icon: '✨',
          items: [
            '全新的悬浮返回顶部/底部模块（平滑响应）',
            '全局系统黑体备选加强映射与文字超重描边特效',
            '所有静态文章页、模态框重写为纯几何粗旷架构'
          ]
        }
      ],
      note: '史诗级视觉演进！我们抛弃了泛滥且规矩的圆角“玻璃拟态”，彻底拥抱了代表极客原始与复古精神的代码世界观。'
    },
    {
      version: 'v1.9.0',
      date: '2026-02-11',
      title: '架构重构与交互艺术',
      groups: [
        {
          label: '核心重构',
          icon: '🏗️',
          items: ['完全模块化的异步按需加载系统', 'Router 标题自动化增强', 'tools.ts 精简重构']
        },
        {
          label: '交互美学',
          icon: '✨',
          items: ['View Transitions 圆形扩散主题切换', '首页工具截断展示逻辑', '沉浸式页脚重构']
        }
      ],
      note: '本次更新标志着 LRM 从“工具平铺”迈向“专业应用架构”的关键一步。'
    },
    {
      version: 'v1.8.0',
      date: '2026-02-11',
      title: '性能优化与代码质量',
      groups: [
        {
          label: '性能',
          icon: '⚡',
          items: ['大工具数据拆分为 JSON 静态资源', '初次加载包体积优化']
        },
        {
          label: '工程化',
          icon: '🛠️',
          items: ['全站 Linter 警告清理', 'ESLint 规则精简与 Prettier 冲突修复']
        }
      ]
    },
    {
      version: 'v1.7.0',
      date: '2026-02-10',
      title: '经典工具深度焕新',
      groups: [
        {
          label: '工具增强',
          icon: '🎮',
          items: ['2048 游戏深度改版：支持撤销、多网格', 'PDF 模型工具逻辑稳定性修复']
        },
        {
          label: 'SEO',
          icon: '🔍',
          items: ['元数据重构，大幅提升 GitHub 与搜索引擎可见度']
        }
      ]
    },
    {
      version: 'v1.5.0',
      date: '2026-02-04',
      title: '视觉 2.0 时代',
      groups: [
        {
          label: 'UI/UX',
          icon: '🎨',
          items: [
            '首页引入 Decrypted Text 解密特效',
            '工具卡片 3D 视差倾斜',
            '全局玻璃拟态风格统一'
          ]
        }
      ]
    },
    {
      version: 'v1.0.0',
      date: '2026-01-20',
      title: '破晓：正式起航',
      groups: [
        {
          label: '里程碑',
          icon: '🏁',
          items: ['核心框架搭建完成', '首批 50+ 常用开发工具上线', '移动端响应式初步适配']
        }
      ]
    }
  ]);

  const brutalColors = ['bg-yellow', 'bg-blue', 'bg-pink', 'bg-green'];
  function getBrutalColorClass(index) {
    return brutalColors[index % brutalColors.length];
  }
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

  .brutal-page-container {
    min-height: 100vh;
    background-color: #fdfae5;
    background-image:
      linear-gradient(#e5e5e5 2px, transparent 2px),
      linear-gradient(90deg, #e5e5e5 2px, transparent 2px);
    background-size: 40px 40px;
    background-position: -2px -2px;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    color: #111;
    padding-bottom: 4rem;
  }

  .brutal-page-header {
    background: #fff;
    padding: 1.5rem 2rem;
    border-bottom: 4px solid #111;
    box-shadow: 0px 8px 0px #111;
    position: relative;
    z-index: 10;
  }

  .brutal-btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: #fff;
    border: 4px solid #111;
    padding: 0.5rem 1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
    text-transform: uppercase;
    color: #111;
  }

  .brutal-btn-secondary:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
    background: #4b7bff;
    color: #fff;
  }
  .brutal-btn-secondary:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-page-content {
    max-width: 900px;
    margin: 0 auto;
    padding: 4rem 2rem;
  }

  .changelog-hero {
    text-align: center;
    margin-bottom: 5rem;
  }

  .brutal-page-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.5rem;
    font-weight: 900;
    color: #111;
    margin-bottom: 2rem;
    text-transform: uppercase;
    letter-spacing: -1px;
    text-shadow: 6px 6px 0px #ffd900;
  }

  .brutal-stats-box {
    display: inline-flex;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    padding: 1rem 2rem;
    border-right: 4px solid #111;
  }
  .stat-item:last-child {
    border-right: none;
  }

  .stat-val {
    font-size: 1.5rem;
    font-weight: 900;
    font-family: 'Syne', sans-serif;
  }
  .stat-name {
    font-size: 0.85rem;
    font-weight: bold;
    text-transform: uppercase;
  }

  .brutal-timeline {
    position: relative;
    padding-left: 20px;
  }

  .timeline-node {
    display: flex;
    gap: 2rem;
    margin-bottom: 4rem;
    position: relative;
  }

  .timeline-axle {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 20px;
    flex-shrink: 0;
  }

  .axle-pip {
    width: 24px;
    height: 24px;
    border: 4px solid #111;
    background: #fff;
    border-radius: 50%;
    z-index: 2;
    transition: all 0.2s;
  }

  .axle-pip.latest-pip {
    background: #ff4b4b;
    box-shadow: 3px 3px 0px #111;
    transform: scale(1.2);
  }

  .axle-line {
    flex: 1;
    width: 4px;
    background: #111;
    margin-top: -4px;
  }

  .brutal-card-node {
    flex: 1;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    padding: 2rem;
    transition: transform 0.2s;
  }

  .brutal-card-node:hover {
    transform: translate(-4px, -4px);
    box-shadow: 12px 12px 0px #111;
  }

  .bg-yellow {
    background: #ffd900;
    color: #111;
  }
  .bg-blue {
    background: #4b7bff;
    color: #fff;
  }
  .bg-pink {
    background: #ff4b4b;
    color: #fff;
  }
  .bg-green {
    background: #00e572;
    color: #111;
  }

  .node-head {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }

  .node-version {
    font-size: 1.5rem;
    font-weight: 900;
    background: #111;
    color: #fff;
    padding: 0.25rem 1rem;
    border: 2px solid #111;
  }
  .node-date {
    font-weight: bold;
    background: #fff;
    color: #111;
    padding: 0.25rem 0.75rem;
    border: 2px solid #111;
  }
  .tag-latest {
    font-size: 0.8rem;
    font-weight: 900;
    background: #ff4b4b;
    color: #fff;
    padding: 4px 8px;
    border: 2px solid #111;
    box-shadow: 3px 3px 0px #111;
  }

  .node-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 2rem;
    font-weight: 900;
    margin-bottom: 2rem;
    border-bottom: 4px solid #111;
    padding-bottom: 1rem;
    display: inline-block;
  }

  .node-groups {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .group-label {
    font-size: 1.1rem;
    font-weight: 800;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #111;
    color: #fff;
    padding: 0.25rem 0.75rem;
    width: fit-content;
  }

  .group-items {
    list-style: none;
    padding: 0;
  }

  .group-items li {
    font-size: 1.05rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    padding-left: 1.5rem;
    position: relative;
    line-height: 1.6;
  }

  .group-items li::before {
    content: '->';
    font-weight: 900;
    position: absolute;
    left: 0;
  }

  .node-note {
    margin-top: 2rem;
    padding: 1rem;
    background: #fff;
    color: #111;
    font-weight: bold;
    border: 3px dashed #111;
  }

  /* 小版本卡片样式 */
  .minor-card-node {
    flex: 1;
    background: #fff;
    border: 3px solid #111;
    padding: 1rem 1.5rem;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.2s;
  }

  .minor-card-node:hover {
    transform: translate(-1px, -1px);
    box-shadow: 6px 6px 0px #111;
  }

  .minor-head {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 0.8rem;
    border-bottom: 2px solid #eee;
    padding-bottom: 0.5rem;
    flex-wrap: wrap;
  }

  .minor-version {
    font-size: 0.9rem;
    font-weight: 900;
    background: #eee;
    color: #111;
    padding: 2px 8px;
    border: 1px solid #111;
  }

  .minor-date {
    font-size: 0.8rem;
    font-weight: bold;
    color: #666;
  }

  .minor-title {
    font-size: 1rem;
    font-weight: 800;
    color: #111;
  }

  .minor-items {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .minor-li {
    font-size: 0.9rem;
    font-weight: 500;
    color: #333;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .mini-icon {
    font-size: 1rem;
    flex-shrink: 0;
  }

  .axle-pip.minor-pip {
    width: 16px;
    height: 16px;
    margin-top: 4px;
    border-width: 3px;
    box-shadow: none;
  }

  @media (max-width: 768px) {
    .brutal-stats-box {
      flex-direction: column;
    }
    .stat-item {
      border-right: none;
      border-bottom: 4px solid #111;
      align-items: center;
    }
    .stat-item:last-child {
      border-bottom: none;
    }
    .timeline-node {
      flex-direction: column;
      gap: 1rem;
    }
    .timeline-axle {
      display: none;
    }
    .brutal-card-node {
      margin-left: 0;
    }
  }

  /* --- Dark Mode Overrides --- */
  [data-theme='dark'] .brutal-page-container {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }

  [data-theme='dark'] .brutal-page-header {
    background: #1a1a1a;
    border-bottom-color: #eee;
    box-shadow: 0px 8px 0px #eee;
  }

  [data-theme='dark'] .brutal-page-title {
    color: #eee;
    text-shadow: 6px 6px 0px #cc0000;
  }
  [data-theme='dark'] .brutal-stats-box {
    background: #222;
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .stat-item {
    border-right-color: #eee;
    border-bottom-color: #eee;
  }

  [data-theme='dark'] .brutal-btn-secondary {
    background: #222;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn-secondary:hover {
    background: #b28f00;
    color: #fff;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn-secondary:active {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .axle-pip {
    background: #111;
    border-color: #eee;
  }
  [data-theme='dark'] .axle-pip.latest-pip {
    background: #cc0000;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .axle-line {
    background: #eee;
  }

  [data-theme='dark'] .brutal-card-node {
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-card-node:hover {
    box-shadow: 12px 12px 0px #eee;
  }

  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .bg-pink {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .bg-green {
    background: #00994c;
    color: #fff;
  }

  [data-theme='dark'] .node-version {
    background: #eee;
    color: #111;
    border-color: #eee;
  }
  [data-theme='dark'] .node-date {
    background: #222;
    color: #eee;
    border-color: #eee;
  }
  [data-theme='dark'] .tag-latest {
    background: #cc0000;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }

  [data-theme='dark'] .node-title {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .group-label {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .node-note {
    background: #222;
    color: #eee;
    border-color: #eee;
  }
</style>
