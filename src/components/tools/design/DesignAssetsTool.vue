<template>
  <div class="design-assets-tool">
    <div class="nav-header">
      <button class="back-btn" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        <span>返回</span>
      </button>
    </div>

    <div class="tool-header">
      <h1 class="font-display">素材与图库</h1>
      <p class="summary">提供高清无版权图片、设计素材模版及设计灵感社区</p>
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

    <footer class="footer">© 2026 LRM工具箱 - 设计素材与灵感导航</footer>
  </div>
</template>

<script setup>
  import { Back, Right } from '@element-plus/icons-vue';

  const tools = [
    {
      name: 'Unsplash',
      description: '全球知名的免费高清摄影图片社区，提供高质量的无版权（CC0）图片，摄影师首选。',
      url: 'https://unsplash.com/',
      tags: ['摄影', '壁纸', '高清', 'CC0'],
      colorBg: '#ECEFF1',
      colorText: '#000000'
    },
    {
      name: 'Pexels',
      description: '提供高质量的免费库存照片和视频，支持按颜色搜索，素材质量极高。',
      url: 'https://www.pexels.com/',
      tags: ['照片', '视频', '免费', '素材'],
      colorBg: '#E0F2F1',
      colorText: '#009688'
    },
    {
      name: 'Pixabay',
      description: '拥有超过 200 万张免费正版高清图片、插画、矢量图和视频素材的创意社区。',
      url: 'https://pixabay.com/',
      tags: ['插画', '矢量', '视频', '免版权'],
      colorBg: '#FFF3E0',
      colorText: '#FF9800'
    },
    {
      name: 'Freepik',
      description: '数百万个免费矢量图、PSD、照片和图标资源，设计师必备的素材宝库。',
      url: 'https://www.freepik.com/',
      tags: ['矢量', 'PSD', 'Mockup', '素材'],
      colorBg: '#E8F5E9',
      colorText: '#2196F3'
    },
    {
      name: 'Dribbble',
      description: '全球顶级设计师作品分享平台，发现最新设计趋势，获取配色与排版灵感。',
      url: 'https://dribbble.com/',
      tags: ['设计', '灵感', '社区', '趋势'],
      colorBg: '#FCE4EC',
      colorText: '#EA4C89'
    },
    {
      name: 'Behance',
      description: 'Adobe 旗下的创意作品展示平台，涵盖平面设计、插画、摄影等全领域优秀作品。',
      url: 'https://www.behance.net/',
      tags: ['Adobe', '作品集', '创意', '全领域'],
      colorBg: '#E1F5FE',
      colorText: '#1769FF'
    }
  ];

  function openUrl(url) {
    window.open(url, '_blank');
  }
</script>

<style scoped>
  .design-assets-tool {
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
