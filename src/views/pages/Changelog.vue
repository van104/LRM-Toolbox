<template>
  <div class="changelog-page">
    <!-- Header Section -->
    <header class="changelog-header animate-fade-in">
      <div class="container">
        <h1 class="gradient-title">演进之路</h1>
        <p class="subtitle">记录 LRM 工具箱从第一个版本到现在的成长历程</p>
        <div class="stats-bar">
          <div class="stat-item">
            <span class="stat-value">168+</span>
            <span class="stat-label">集成工具</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">v1.9.0</span>
            <span class="stat-label">当前版本</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">Alpha</span>
            <span class="stat-label">阶段</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Roadmap / Timeline Section -->
    <main class="timeline-container container">
      <div class="timeline-main">
        <div
          v-for="(release, index) in releases"
          :key="release.version"
          v-observe-visibility="onVisibilityChange"
          :class="['timeline-node', { 'is-latest': index === 0 }]"
        >
          <div class="node-marker">
            <div class="node-circle"></div>
            <div class="node-line"></div>
          </div>

          <div class="node-content glass-card animate-slide-up">
            <div class="node-header">
              <div class="version-badge" :style="{ background: release.color }">
                {{ release.version }}
              </div>
              <time class="node-date">{{ release.date }}</time>
              <div v-if="index === 0" class="latest-label">CURRENT</div>
            </div>

            <h3 class="node-title">{{ release.title }}</h3>

            <div class="change-groups">
              <div v-for="group in release.groups" :key="group.label" class="change-group">
                <h4 class="group-label" :style="{ color: group.color }">
                  <span class="group-icon">{{ group.icon }}</span>
                  {{ group.label }}
                </h4>
                <ul class="change-items">
                  <li v-for="item in group.items" :key="item">{{ item }}</li>
                </ul>
              </div>
            </div>

            <div v-if="release.note" class="node-footer">
              <p class="footer-note">💡 {{ release.note }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Future Outlook -->
    <section class="future-outlook container animate-fade-in">
      <div class="outlook-card glass-card">
        <div class="outlook-icon">🚀</div>
        <h3>未来展望</h3>
        <p>
          我们致力于打造最专业、最纯粹的开发者工具箱。更多 AI
          驱动型工具、离线支持以及桌面端计划正在筹备中。
        </p>
        <div class="cta-links">
          <a href="https://github.com/van104/LRM-Toolbox" target="_blank" class="cta-btn github">
            <i class="fa-brands fa-github"></i> 参与建设
          </a>
          <router-link to="/" class="cta-btn primary">立即探索工具</router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
  import { ref } from 'vue';

  const releases = ref([
    {
      version: 'v1.9.0',
      date: '2026-02-11',
      title: '架构重构与交互艺术',
      color: 'var(--accent-purple)',
      groups: [
        {
          label: '核心重构',
          icon: '🏗️',
          color: '#3b82f6',
          items: ['完全模块化的异步按需加载系统', 'Router 标题自动化增强', 'tools.ts 精简重构']
        },
        {
          label: '交互美学',
          icon: '✨',
          color: '#dc2626',
          items: ['View Transitions 圆形扩散主题切换', '首页工具截断展示逻辑', '沉浸式页脚重构']
        }
      ],
      note: '本次更新标志着 LRM 从“工具平铺”迈向“专业应用架构”的关键一步。'
    },
    {
      version: 'v1.8.0',
      date: '2026-02-11',
      title: '性能优化与代码质量',
      color: '#8b5cf6',
      groups: [
        {
          label: '性能',
          icon: '⚡',
          color: '#f59e0b',
          items: ['大工具数据拆分为 JSON 静态资源', '初次加载包体积优化']
        },
        {
          label: '工程化',
          icon: '🛠️',
          color: '#10b981',
          items: ['全站 Linter 警告清理', 'ESLint 规则精简与 Prettier 冲突修复']
        }
      ]
    },
    {
      version: 'v1.7.0',
      date: '2026-02-10',
      title: '经典工具深度焕新',
      color: '#6366f1',
      groups: [
        {
          label: '工具增强',
          icon: '🎮',
          color: '#ec4899',
          items: ['2048 游戏深度改版：支持撤销、多网格', 'PDF 模型工具逻辑稳定性修复']
        },
        {
          label: 'SEO',
          icon: '🔍',
          color: '#06b6d4',
          items: ['元数据重构，大幅提升 GitHub 与搜索引擎可见度']
        }
      ]
    },
    {
      version: 'v1.5.0',
      date: '2026-02-04',
      title: '视觉 2.0 时代',
      color: '#3b82f6',
      groups: [
        {
          label: 'UI/UX',
          icon: '🎨',
          color: '#f43f5e',
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
      color: '#10b981',
      groups: [
        {
          label: '里程碑',
          icon: '🏁',
          color: '#10b981',
          items: ['核心框架搭建完成', '首批 50+ 常用开发工具上线', '移动端响应式初步适配']
        }
      ]
    }
  ]);

  // 简单的能效处理，如果需要可以用此指令配合动画
  const onVisibilityChange = () => {
    // 可以根据可见性控制动画播放
  };
</script>

<style scoped>
  .changelog-page {
    min-height: 100vh;
    background: var(--bg-primary);
    padding-top: var(--header-height);
    padding-bottom: 5rem;
    color: var(--text-primary);
  }

  .container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  /* Header Section */
  .changelog-header {
    padding: 5rem 0 3rem;
    text-align: center;
  }

  .gradient-title {
    font-size: 3.5rem;
    font-weight: 800;
    background: var(--accent-gradient);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 1rem;
  }

  .subtitle {
    font-size: 1.125rem;
    color: var(--text-muted);
    margin-bottom: 2.5rem;
  }

  .stats-bar {
    display: inline-flex;
    align-items: center;
    gap: 2rem;
    background: var(--bg-card);
    padding: 0.75rem 2rem;
    border-radius: 99px;
    border: 1px solid var(--border-color);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  }

  .stat-item {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-weight: 800;
    font-size: 1.25rem;
    color: var(--text-primary);
  }

  .stat-label {
    font-size: 0.75rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .stat-divider {
    width: 1px;
    height: 24px;
    background: var(--border-color);
  }

  /* Timeline Layout */
  .timeline-container {
    margin-top: 3rem;
    position: relative;
  }

  .timeline-main {
    position: relative;
  }

  .timeline-node {
    display: flex;
    gap: 3rem;
    margin-bottom: 4rem;
  }

  .node-marker {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
  }

  .node-circle {
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
    background: var(--bg-card);
    border: 4px solid var(--border-color);
    z-index: 2;
    transition: all 0.3s ease;
  }

  .timeline-node.is-latest .node-circle {
    background: var(--accent-purple);
    border-color: rgba(139, 92, 246, 0.2);
    box-shadow: 0 0 0 8px rgba(139, 92, 246, 0.1);
  }

  .node-line {
    flex: 1;
    width: 2px;
    background: linear-gradient(to bottom, var(--border-color) 0%, transparent 100%);
    margin-top: 0.5rem;
  }

  .node-content {
    flex: 1;
    padding: 2rem;
    border-radius: 20px;
    transition: transform 0.3s ease;
  }

  .node-content:hover {
    transform: translateX(10px);
  }

  .node-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .version-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 6px;
    font-weight: 800;
    font-size: 0.875rem;
    color: white;
  }

  .node-date {
    font-family: monospace;
    color: var(--text-muted);
    font-size: 0.9375rem;
  }

  .latest-label {
    margin-left: auto;
    font-size: 0.625rem;
    font-weight: 900;
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
    padding: 2px 8px;
    border-radius: 4px;
  }

  .node-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 2rem;
    color: var(--text-primary);
  }

  /* Change Groups */
  .change-groups {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
  }

  .group-label {
    font-size: 0.875rem;
    font-weight: 800;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-transform: uppercase;
  }

  .change-items {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .change-items li {
    font-size: 0.9375rem;
    color: var(--text-secondary);
    line-height: 1.6;
    position: relative;
    padding-left: 1.25rem;
  }

  .change-items li::before {
    content: '→';
    position: absolute;
    left: 0;
    color: var(--text-muted);
    font-weight: bold;
  }

  .node-footer {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px dashed var(--border-color);
  }

  .footer-note {
    font-size: 0.875rem;
    color: var(--text-muted);
    font-style: italic;
  }

  /* Outlook Section */
  .future-outlook {
    margin-top: 5rem;
    margin-bottom: 5rem;
  }

  .outlook-card {
    text-align: center;
    padding: 4rem 2rem;
    border-radius: 24px;
  }

  .outlook-icon {
    font-size: 3rem;
    margin-bottom: 1.5rem;
  }

  .outlook-card h3 {
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: 1rem;
  }

  .outlook-card p {
    color: var(--text-muted);
    margin-bottom: 2.5rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .cta-links {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
  }

  .cta-btn {
    padding: 0.75rem 2rem;
    border-radius: 12px;
    font-weight: 600;
    transition: all 0.3s;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .cta-btn.primary {
    background: var(--accent-purple);
    color: white;
  }

  .cta-btn.github {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
  }

  .cta-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    .gradient-title {
      font-size: 2.5rem;
    }
    .timeline-node {
      gap: 1.5rem;
    }
    .change-groups {
      grid-template-columns: 1fr;
    }
    .stats-bar {
      gap: 1rem;
      padding: 0.5rem 1rem;
    }
    .cta-links {
      flex-direction: column;
    }
  }
</style>
