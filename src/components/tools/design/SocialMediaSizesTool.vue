<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">社媒<span>.尺寸()</span></h1>
        <div style="width: 100px"></div>
      </header>

      <div class="brutal-grid">
        <!-- 左侧平台选择 -->
        <div class="left-column">
          <div class="brutal-pane">
            <div class="pane-header bg-yellow">
              <span>平台选择.PLATFORM</span>
            </div>
            <div class="pane-content">
              <div class="platform-list">
                <button
                  v-for="platform in platforms"
                  :key="platform.id"
                  class="platform-btn"
                  :class="{ active: activePlatformId === platform.id }"
                  @click="activePlatformId = platform.id"
                >
                  {{ platform.name }}
                </button>
              </div>
            </div>
          </div>

          <div class="brutal-pane" style="margin-top: 2rem">
            <div class="pane-header bg-green">
              <span>设计贴士.TIPS</span>
            </div>
            <div class="pane-content">
              <ul class="tips-list">
                <li><strong>2x 导出</strong>：高清屏建议导出 2 倍尺寸。</li>
                <li><strong>安全区域</strong>：核心内容应在中心 2/3 区域。</li>
                <li><strong>格式选择</strong>：复杂图像用 JPG，Logo 用 PNG。</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 右侧尺寸内容 -->
        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">{{ currentPlatform?.name }}</span>
            <span class="update-tag">2026</span>
          </div>
          <div class="pane-content">
            <p class="platform-desc">{{ currentPlatform?.description }}</p>
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
                    <button class="copy-btn-sm" @click="copySize(item.size)">复制</button>
                  </div>
                  <p class="size-hint">{{ item.hint }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useCopy } from '@/composables/useCopy';

  const router = useRouter();
  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push('/');
  }

  const { copyToClipboard } = useCopy();
  const activePlatformId = ref('wechat');

  const platforms = [
    {
      id: 'wechat',
      name: '微信 (WeChat)',
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
      const ratio = parseInt(parts[1]) / parseInt(parts[2]);
      return Math.min(Math.max(ratio, 0.4), 2.5);
    }
    return 1;
  };

  const getRatioText = (size: string) => {
    const parts = size.match(/(\d+) x (\d+)/);
    if (parts) {
      const w = parseInt(parts[1]),
        h = parseInt(parts[2]);
      const ratios = [
        [1, 1],
        [4, 3],
        [3, 4],
        [16, 9],
        [9, 16],
        [2.35, 1],
        [4, 5]
      ];
      for (const [rw, rh] of ratios) {
        if (Math.abs(w / h - rw / rh) < 0.1) return `${rw}:${rh}`;
      }
    }
    return '自定义';
  };

  const copySize = async (sizeText: string) => {
    const cleanSize = sizeText.replace(' px', '');
    await copyToClipboard(cleanSize, { success: `已复制尺寸: ${cleanSize}` });
  };
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

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
    max-width: 1600px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }
  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.5rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #ff4b4b;
  }
  .brutal-title span {
    color: #ff4b4b;
    text-shadow: 4px 4px 0px #111;
    letter-spacing: 0;
  }
  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.25rem;
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

  .brutal-grid {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 3rem;
    margin-bottom: 3rem;
    min-height: 550px;
  }
  .left-column {
    display: flex;
    flex-direction: column;
  }

  .brutal-pane {
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
    transition: transform 0.2s;
  }
  .brutal-pane:hover {
    transform: translate(-4px, -4px);
    box-shadow: 16px 16px 0px #111;
  }
  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.2rem;
    letter-spacing: 1px;
    gap: 0.75rem;
  }
  .bg-yellow {
    background: #ffd900;
  }
  .bg-blue {
    background: #4b7bff;
    color: #fff;
  }
  .bg-green {
    background: #00e572;
  }
  .text-white {
    color: #fff;
  }
  .pane-content {
    padding: 1.5rem;
    flex: 1;
  }

  .update-tag {
    font-size: 0.75rem;
    background: #fff;
    color: #111;
    padding: 0.15rem 0.5rem;
    border: 2px solid #111;
    font-weight: 700;
  }

  .platform-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .platform-btn {
    display: block;
    width: 100%;
    text-align: left;
    padding: 0.75rem 1rem;
    border: 3px solid #111;
    background: #fff;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }
  .platform-btn.active {
    background: #ffd900;
  }
  .platform-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }

  .tips-list {
    padding-left: 1.25rem;
    margin: 0;
    font-size: 0.85rem;
    line-height: 1.7;
    color: #333;
  }
  .tips-list li {
    margin-bottom: 0.75rem;
    list-style: disc;
  }

  .platform-desc {
    margin: 0 0 1.5rem 0;
    font-size: 0.9rem;
    color: #666;
  }

  .size-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1.5rem;
  }
  .size-card {
    background: #fff;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    overflow: hidden;
    transition: all 0.1s;
  }
  .size-card:hover {
    transform: translate(-3px, -3px);
    box-shadow: 7px 7px 0px #111;
  }
  .size-visual-container {
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fdfae5;
    padding: 1rem;
    border-bottom: 3px solid #111;
  }
  .size-visual-box {
    max-width: 100%;
    max-height: 100%;
    border: 2px dashed #111;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .ratio-text {
    font-size: 0.75rem;
    color: #888;
    font-weight: 700;
  }
  .size-info {
    padding: 1rem;
  }
  .size-label {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 0.95rem;
    font-weight: 800;
    margin: 0 0 0.5rem 0;
  }
  .size-value-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #ffd900;
    padding: 0.35rem 0.5rem;
    border: 2px solid #111;
    margin-bottom: 0.5rem;
  }
  .size-pixels {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 0.85rem;
  }
  .copy-btn-sm {
    background: #111;
    color: #ffd900;
    border: none;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 0.7rem;
    padding: 0.15rem 0.4rem;
    cursor: pointer;
    transition: opacity 0.1s;
  }
  .copy-btn-sm:hover {
    opacity: 0.8;
  }
  .size-hint {
    margin: 0;
    font-size: 0.75rem;
    color: #888;
  }

  @media (max-width: 1024px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .brutal-title {
      font-size: 2.5rem;
    }
    .brutal-header {
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }
  }

  /* --- Dark Mode --- */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .platform-btn,
  [data-theme='dark'] .size-card {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 9px 9px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane:hover {
    box-shadow: 16px 16px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
    color: #111;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .platform-btn {
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .platform-btn.active {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .platform-btn:hover {
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .size-card {
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .size-card:hover {
    box-shadow: 7px 7px 0px #eee;
  }
  [data-theme='dark'] .size-visual-container {
    background: #222;
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .size-visual-box {
    border-color: #eee;
    background: #1a1a1a;
  }
  [data-theme='dark'] .size-value-row {
    background: #b28f00;
    border-color: #eee;
    color: #fff;
  }
  [data-theme='dark'] .copy-btn-sm {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .update-tag {
    background: #eee;
    color: #111;
    border-color: #eee;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .bg-green {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .tips-list {
    color: #ccc;
  }
</style>
