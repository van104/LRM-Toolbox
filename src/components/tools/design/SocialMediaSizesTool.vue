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
        <h1 class="tool-title">社交媒体尺寸指南</h1>
        <span class="tool-subtitle">Social Media Sizes</span>
      </div>
      <div class="header-right">
        <el-button type="primary" plain size="small"> 精选尺寸 </el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="tool-layout">
        <!-- 平台选择侧边栏 -->
        <div class="tool-sidebar">
          <div class="panel glass-card">
            <h2 class="panel-title">
              <el-icon><Monitor /></el-icon> 平台选择
            </h2>
            <div class="platform-list">
              <button
                v-for="platform in platforms"
                :key="platform.id"
                class="platform-btn"
                :class="{ active: activePlatformId === platform.id }"
                @click="activePlatformId = platform.id"
              >
                <i :class="['platform-icon', platform.iconClass]"></i>
                <span>{{ platform.name }}</span>
              </button>
            </div>
          </div>

          <div class="panel glass-card mt-6">
            <h2 class="panel-title">
              <el-icon><InfoFilled /></el-icon> 设计贴士
            </h2>
            <ul class="tips-list">
              <li>
                <strong>2x 导出</strong>：高清屏建议导出 2 倍尺寸，例如 200x200 画布使用 400x400。
              </li>
              <li><strong>安全区域</strong>：头像和封面应确保核心内容在中心 2/3 区域。</li>
              <li><strong>格式选择</strong>：复杂图像用 JPG，Logo 或含透明背景用 PNG。</li>
            </ul>
          </div>
        </div>

        <!-- 尺寸内容主面板 -->
        <div class="tool-main">
          <div class="panel glass-card">
            <div class="platform-header">
              <div class="header-info">
                <h2 class="current-platform-name">{{ currentPlatform?.name }}</h2>
                <p class="current-platform-desc">{{ currentPlatform?.description }}</p>
              </div>
              <el-tag size="small" type="info" effect="plain">更新于 2026</el-tag>
            </div>

            <div class="size-grid">
              <div v-for="(item, index) in currentPlatform?.items" :key="index" class="size-card">
                <div class="size-visual-container">
                  <div class="size-visual-box" :style="{ aspectRatio: getAspectRatio(item.size) }">
                    <span class="ratio-text">{{ getRatioText(item.size) }}</span>
                  </div>
                </div>
                <div class="size-info">
                  <h3 class="size-label">{{ item.label }}</h3>
                  <div class="size-value-row">
                    <span class="size-pixels">{{ item.size }}</span>
                    <button class="mini-copy-btn" @click="copySize(item.size)">
                      <el-icon><CopyDocument /></el-icon>
                    </button>
                  </div>
                  <p class="size-hint">{{ item.hint }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - 社交媒体尺寸指南</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { ArrowLeft, Monitor, InfoFilled, CopyDocument } from '@element-plus/icons-vue';
  import { useCopy } from '@/composables/useCopy';

  const { copyToClipboard } = useCopy();

  const activePlatformId = ref('wechat');

  const platforms = [
    {
      id: 'wechat',
      name: '微信 (WeChat)',
      iconClass: 'fa-brands fa-weixin',
      description: '订阅号、服务号、视频号及朋友圈常用尺寸',
      items: [
        { label: '公众号头像', size: '200 x 200 px', hint: '1:1 正方形' },
        { label: '文章封面 (大图)', size: '900 x 383 px', hint: '2.35:1 比例' },
        { label: '文章封面 (小图)', size: '200 x 200 px', hint: '1:1 正方形' },
        { label: '视频号封面', size: '1080 x 1260 px', hint: '6:7 比例' },
        { label: '朋友圈背景', size: '1080 x 1080 px', hint: '顶部会被状态栏遮挡' }
      ]
    },
    {
      id: 'red',
      name: '小红书 (RED)',
      iconClass: 'fa-solid fa-note-sticky',
      description: '笔记封面是吸引点击的第一要素',
      items: [
        { label: '笔记封面 (竖版)', size: '1242 x 1656 px', hint: '3:4 比例 (最推荐)' },
        { label: '笔记封面 (正方形)', size: '1242 x 1242 px', hint: '1:1 比例' },
        { label: '笔记封面 (横版)', size: '1656 x 1242 px', hint: '4:3 比例' },
        { label: '个人主页背景', size: '1080 x 1440 px', hint: '会被头像遮挡一部分' }
      ]
    },
    {
      id: 'douyin',
      name: '抖音 (Douyin)',
      iconClass: 'fa-brands fa-tiktok',
      description: '短视频全屏预览与主页装修',
      items: [
        { label: '视频封面', size: '1080 x 1920 px', hint: '9:16 全屏比例' },
        { label: '直播封面', size: '1080 x 1080 px', hint: '1:1 正方形' },
        { label: '主页背景', size: '1125 x 633 px', hint: '顶部 Banner' }
      ]
    },
    {
      id: 'bilibili',
      name: 'Bilibili',
      iconClass: 'fa-solid fa-play',
      description: '长视频投稿、专栏及直播室封面',
      items: [
        { label: '视频封面', size: '1146 x 717 px', hint: '16:10 左右展示比例' },
        { label: '个人空间背景', size: '1280 x 240 px', hint: '超宽屏 Banner' },
        { label: '直播封面', size: '800 x 600 px', hint: '4:3 比例' }
      ]
    },
    {
      id: 'insta',
      name: 'Instagram',
      iconClass: 'fa-brands fa-instagram',
      description: '深受时尚年轻群体喜爱的视觉平台',
      items: [
        { label: '帖子 (正方形)', size: '1080 x 1080 px', hint: '1:1 标准比例' },
        { label: '帖子 (纵向)', size: '1080 x 1350 px', hint: '4:5 比例' },
        { label: 'Story / Reels', size: '1080 x 1920 px', hint: '9:16 全屏' }
      ]
    }
  ];

  const currentPlatform = computed(() => platforms.find(p => p.id === activePlatformId.value));

  const getAspectRatio = (size: string) => {
    const parts = size.match(/(\d+) x (\d+)/);
    if (parts) {
      const w = parseInt(parts[1]);
      const h = parseInt(parts[2]);
      const ratio = w / h;
      return Math.min(Math.max(ratio, 0.4), 2.5); // 限制展示比例范围
    }
    return 1;
  };

  const getRatioText = (size: string) => {
    const parts = size.match(/(\d+) x (\d+)/);
    if (parts) {
      const w = parseInt(parts[1]);
      const h = parseInt(parts[2]);
      const commonRatios = [
        [1, 1],
        [4, 3],
        [3, 4],
        [16, 9],
        [9, 16],
        [2.35, 1],
        [4, 5]
      ];
      for (const [rw, rh] of commonRatios) {
        if (Math.abs(w / h - rw / rh) < 0.1) return `${rw}:${rh}`;
      }
    }
    return '自定义';
  };

  const copySize = async (sizeText: string) => {
    const cleanSize = sizeText.replace(' px', '');
    await copyToClipboard(cleanSize, {
      success: `已复制尺寸: ${cleanSize}`
    });
  };
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
    width: 140px;
  }

  .header-right {
    display: flex;
    justify-content: flex-end;
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

  .tool-layout {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  @media (min-width: 1024px) {
    .tool-layout {
      display: grid;
      grid-template-columns: 240px 1fr;
      gap: 1.5rem;
      align-items: start;
    }
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    padding: 24px;
  }

  .panel-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .platform-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .platform-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 10px;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }

  .platform-btn:hover {
    background: #f8fafc;
    color: #1e293b;
  }

  .platform-btn.active {
    background: #f0f7ff;
    border-color: #3b82f6;
    color: #3b82f6;
    font-weight: 600;
  }

  .platform-icon {
    font-size: 1.1rem;
    width: 20px;
    text-align: center;
  }

  .tips-list {
    padding-left: 18px;
    margin: 0;
    color: #64748b;
    font-size: 0.875rem;
  }

  .tips-list li {
    margin-bottom: 12px;
    line-height: 1.5;
  }

  .platform-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 20px;
  }

  .current-platform-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 6px 0;
  }
  .current-platform-desc {
    color: #64748b;
    margin: 0;
    font-size: 0.95rem;
  }

  .size-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
  }

  .size-card {
    background: #f8fafc;
    border: 1px solid #f1f5f9;
    border-radius: 14px;
    overflow: hidden;
    transition: all 0.2s;
  }

  .size-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
    border-color: #e2e8f0;
  }

  .size-visual-container {
    height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    padding: 16px;
    border-bottom: 1px solid #f1f5f9;
  }

  .size-visual-box {
    max-width: 100%;
    max-height: 100%;
    border: 2px dashed #cbd5e1;
    border-radius: 6px;
    background: #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ratio-text {
    font-size: 0.75rem;
    color: #94a3b8;
    font-weight: 700;
  }

  .size-info {
    padding: 16px;
  }

  .size-label {
    font-size: 0.95rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 10px 0;
  }

  .size-value-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f0f7ff;
    padding: 6px 10px;
    border-radius: 8px;
    margin-bottom: 10px;
  }

  .size-pixels {
    font-family: monospace;
    font-weight: 700;
    color: #3b82f6;
    font-size: 0.9rem;
  }

  .mini-copy-btn {
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 2px;
    display: flex;
  }

  .mini-copy-btn:hover {
    color: #3b82f6;
  }

  .size-hint {
    margin: 0;
    font-size: 0.75rem;
    color: #64748b;
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

  @media (max-width: 768px) {
    .tool-title {
      font-size: 1.1rem;
    }
    .header-left,
    .header-right {
      width: 80px;
    }
    .platform-header {
      flex-direction: column;
      gap: 12px;
    }
  }
</style>
