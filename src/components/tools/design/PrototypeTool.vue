<template>
  <div class="prototype-design-tool">
    <div class="nav-header">
      <button class="back-btn" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        <span>返回</span>
      </button>
    </div>

    <div class="tool-header">
      <h1 class="font-display">原型与UI设计</h1>
      <p class="summary">专业的界面设计、交互原型制作及团队协作工具</p>
    </div>

    <div class="libraries-grid">
      <div v-for="tool in tools" :key="tool.name" class="lib-card glass-card">
        <div class="lib-header">
          <div class="lib-icon-wrapper" :style="{ background: tool.colorBg }">
            <span class="text-icon" :style="{ color: tool.colorText }">{{ tool.name[0] }}</span>
          </div>
          <h3 class="lib-name">{{ tool.name }}</h3>
        </div>

        <p class="lib-desc">{{ tool.description }}</p>

        <div class="lib-stats">
          <span v-for="tag in tool.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>

        <div class="lib-actions">
          <button class="btn-visit" @click="openUrl(tool.url)">
            <span>访问官网</span>
            <el-icon>
              <Right />
            </el-icon>
          </button>
        </div>
      </div>
    </div>

    <footer class="footer">© 2026 LRM工具箱 - 原型与UI设计资源</footer>
  </div>
</template>

<script setup>
  import { Back, Right } from '@element-plus/icons-vue';

  const tools = [
    {
      name: 'Figma',
      description: '业界领先的协作式界面设计工具，支持实时多人协作，功能强大且生态丰富。',
      url: 'https://www.figma.com/',
      tags: ['协作', 'UI/UX', 'Web', '原型'],
      colorBg: '#FCE4EC',
      colorText: '#F24E1E'
    },
    {
      name: 'Sketch',
      description: '主要面向 Mac 用户的专业数字设计工具包，拥有庞大的插件生态系统。',
      url: 'https://www.sketch.com/',
      tags: ['Mac', 'UI设计', '经典'],
      colorBg: '#FFF3E0',
      colorText: '#FDB300'
    },
    {
      name: 'Adobe XD',
      description: 'Adobe 推出的一站式 UX/UI 设计与原型制作平台，与其他 Adobe 软件无缝集成。',
      url: 'https://helpx.adobe.com/xd/get-started.html',
      tags: ['Adobe', '交互', '原型'],
      colorBg: '#F3E5F5',
      colorText: '#FF26BE'
    },
    {
      name: 'Pixso',
      description: '新一代国产协作设计工具，打通产品、设计、研发工作流，性能卓越。',
      url: 'https://pixso.cn/',
      tags: ['协作', '国产', '实时'],
      colorBg: '#E0F2F1',
      colorText: '#009688'
    },
    {
      name: '即时设计 (JSDesign)',
      description: '专业级 UI 设计工具，支持导入 Figma 文件，拥有丰富的本土化资源库。',
      url: 'https://js.design/',
      tags: ['云端', '免费', '资源丰富'],
      colorBg: '#E3F2FD',
      colorText: '#2196F3'
    }
  ];

  function openUrl(url) {
    window.open(url, '_blank');
  }
</script>

<style scoped>
  .prototype-design-tool {
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
