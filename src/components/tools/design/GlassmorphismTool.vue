<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">玻璃<span>.拟态()</span></h1>
        <button class="brutal-btn copy-btn" @click="copyCSS">复制 CSS</button>
      </header>

      <div class="brutal-grid">
        <!-- 左侧配置面板 -->
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span>效果配置.CONFIG</span>
          </div>
          <div class="pane-content">
            <!-- 背景颜色 -->
            <div class="config-item">
              <div class="label-row">
                <label class="config-label">背景颜色</label>
                <el-color-picker v-model="bgColor" show-alpha size="small" />
              </div>
            </div>

            <!-- 模糊度 -->
            <div class="config-item">
              <div class="label-row">
                <label class="config-label">模糊度 (Blur)</label>
                <span class="value-tag">{{ blur }}px</span>
              </div>
              <input
                v-model.number="blur"
                type="range"
                min="0"
                max="20"
                step="0.5"
                class="brutal-range"
              />
            </div>

            <!-- 透明度 -->
            <div class="config-item">
              <div class="label-row">
                <label class="config-label">透明度 (Opacity)</label>
                <span class="value-tag">{{ opacity }}%</span>
              </div>
              <input v-model.number="opacity" type="range" min="0" max="100" class="brutal-range" />
            </div>

            <!-- 饱和度 -->
            <div class="config-item">
              <div class="label-row">
                <label class="config-label">饱和度 (Saturation)</label>
                <span class="value-tag">{{ saturate }}%</span>
              </div>
              <input
                v-model.number="saturate"
                type="range"
                min="0"
                max="200"
                class="brutal-range"
              />
            </div>

            <!-- 边框透明度 -->
            <div class="config-item">
              <div class="label-row">
                <label class="config-label">边框透明度</label>
                <span class="value-tag">{{ borderOpacity }}%</span>
              </div>
              <input
                v-model.number="borderOpacity"
                type="range"
                min="0"
                max="100"
                class="brutal-range"
              />
            </div>

            <!-- 圆角 -->
            <div class="config-item">
              <div class="label-row">
                <label class="config-label">圆角 (Radius)</label>
                <span class="value-tag">{{ borderRadius }}px</span>
              </div>
              <input
                v-model.number="borderRadius"
                type="range"
                min="0"
                max="50"
                class="brutal-range"
              />
            </div>
          </div>
        </div>

        <!-- 右侧预览面板 -->
        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">预览效果.PREVIEW</span>
          </div>
          <div class="pane-content">
            <div class="preview-area" :style="{ background: previewBackground }">
              <div class="background-dots"></div>
              <div class="floating-shapes">
                <div class="shape shape-1"></div>
                <div class="shape shape-2"></div>
                <div class="shape shape-3"></div>
              </div>
              <div class="glass-preview-container">
                <div class="glass-element" :style="glassStyle">
                  <div class="glass-content">
                    <h3>Hello Glassmorphism</h3>
                    <p>这是一个实时生成的毛玻璃效果示例。调整左侧参数来改变效果。</p>
                    <div class="glass-demo-btn">示例按钮</div>
                  </div>
                </div>
              </div>
              <div class="preview-bg-controls">
                <button
                  v-for="bg in backgrounds"
                  :key="bg.name"
                  class="bg-dot"
                  :style="{ background: bg.value }"
                  :title="bg.name"
                  @click="previewBackground = bg.value"
                ></button>
              </div>
            </div>

            <div class="code-section">
              <div class="label-row">
                <label class="config-label">CSS 代码</label>
                <button class="brutal-action-btn compact" @click="copyCSS">复制</button>
              </div>
              <div class="code-outer">
                <pre><code>{{ cssCode }}</code></pre>
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

  const bgColor = ref('rgba(255, 255, 255, 0.2)');
  const blur = ref(10);
  const opacity = ref(20);
  const saturate = ref(180);
  const borderOpacity = ref(30);
  const borderRadius = ref(16);

  const backgrounds = [
    { name: '炫彩渐变', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { name: '日落色', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { name: '海洋色', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { name: '深色模式', value: '#1e293b' },
    { name: '浅色网格', value: '#f8fafc' }
  ];
  const previewBackground = ref(backgrounds[0].value);

  const glassStyle = computed(() => {
    let baseColor = bgColor.value;
    if (baseColor.startsWith('rgba')) {
      const parts = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (parts) {
        baseColor = `rgba(${parts[1]}, ${parts[2]}, ${parts[3]}, ${opacity.value / 100})`;
      }
    }
    return {
      background: baseColor,
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      backdropFilter: `blur(${blur.value}px) saturate(${saturate.value}%)`,
      webkitBackdropFilter: `blur(${blur.value}px) saturate(${saturate.value}%)`,
      borderRadius: `${borderRadius.value}px`,
      border: `1px solid rgba(255, 255, 255, ${borderOpacity.value / 100})`
    };
  });

  const cssCode = computed(() => {
    let baseColor = bgColor.value;
    if (baseColor.startsWith('rgba')) {
      const parts = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (parts) {
        baseColor = `rgba(${parts[1]}, ${parts[2]}, ${parts[3]}, ${opacity.value / 100})`;
      }
    }
    return `background: ${baseColor};
box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
backdrop-filter: blur(${blur.value}px) saturate(${saturate.value}%);
-webkit-backdrop-filter: blur(${blur.value}px) saturate(${saturate.value}%);
border-radius: ${borderRadius.value}px;
border: 1px solid rgba(255, 255, 255, ${borderOpacity.value / 100});`;
  });

  const copyCSS = async () => {
    await copyToClipboard(cssCode.value, { success: 'CSS 代码已复制到剪贴板' });
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
  .copy-btn {
    background: #00e572;
  }

  .brutal-grid {
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: 3rem;
    margin-bottom: 3rem;
    min-height: 550px;
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
    padding: 1.25rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.3rem;
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
  .text-white {
    color: #fff;
  }

  .pane-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .config-item {
    margin-bottom: 1.75rem;
  }
  .config-label {
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 0.95rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }
  .value-tag {
    background: #111;
    color: #ffd900;
    padding: 0.15rem 0.6rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    font-size: 0.9rem;
    border: 2px solid #111;
  }

  .brutal-range {
    width: 100%;
    height: 8px;
    appearance: none;
    background: #e5e5e5;
    border: 2px solid #111;
    outline: none;
    cursor: pointer;
  }
  .brutal-range::-webkit-slider-thumb {
    appearance: none;
    width: 22px;
    height: 22px;
    background: #ffd900;
    border: 3px solid #111;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
  }

  .brutal-action-btn {
    background: #ff4b4b;
    color: #fff;
    border: 3px solid #111;
    padding: 0.4rem 1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.9rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }
  .brutal-action-btn.compact {
    padding: 0.25rem 0.75rem;
    font-size: 0.8rem;
  }
  .brutal-action-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }
  .brutal-action-btn:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }

  .preview-area {
    min-height: 350px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.5s ease;
    border: 3px solid #111;
    margin-bottom: 1.5rem;
  }
  .background-dots {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 20px 20px;
  }
  .floating-shapes {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 0;
  }
  .shape {
    position: absolute;
    border-radius: 50%;
    filter: blur(40px);
    opacity: 0.6;
    animation: float 20s infinite alternate;
  }
  .shape-1 {
    width: 150px;
    height: 150px;
    background: #ff0080;
    top: 20%;
    left: 15%;
  }
  .shape-2 {
    width: 200px;
    height: 200px;
    background: #7928ca;
    bottom: 15%;
    right: 15%;
    animation-delay: -5s;
  }
  .shape-3 {
    width: 100px;
    height: 100px;
    background: #0070f3;
    top: 50%;
    left: 50%;
    animation-delay: -10s;
  }
  @keyframes float {
    0% {
      transform: translate(0, 0) scale(1);
    }
    50% {
      transform: translate(20px, 30px) scale(1.1);
    }
    100% {
      transform: translate(-10px, -20px) scale(0.9);
    }
  }

  .glass-preview-container {
    z-index: 10;
    width: 80%;
    max-width: 400px;
  }
  .glass-element {
    width: 100%;
    padding: 40px;
    transition: all 0.3s ease;
  }
  .glass-content {
    color: white;
    text-align: center;
  }
  .glass-content h3 {
    margin: 0 0 16px 0;
    font-size: 1.5rem;
    font-weight: 700;
  }
  .glass-content p {
    margin: 0 0 24px 0;
    font-size: 0.95rem;
    line-height: 1.6;
    opacity: 0.9;
  }
  .glass-demo-btn {
    display: inline-block;
    padding: 10px 24px;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.4);
    border-radius: 30px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .glass-demo-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .preview-bg-controls {
    position: absolute;
    bottom: 12px;
    right: 12px;
    display: flex;
    gap: 8px;
    background: rgba(0, 0, 0, 0.3);
    padding: 6px 10px;
    border: 2px solid #111;
  }
  .bg-dot {
    width: 22px;
    height: 22px;
    border: 2px solid #fff;
    cursor: pointer;
    padding: 0;
    transition: transform 0.2s;
  }
  .bg-dot:hover {
    transform: scale(1.2);
  }

  .code-section {
    margin-top: 1rem;
  }
  .code-outer {
    background: #111;
    border: 3px solid #111;
    padding: 1.25rem;
    margin-top: 0.75rem;
  }
  pre {
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: 'IBM Plex Mono', 'Courier New', monospace;
    font-size: 0.95rem;
    color: #ffd900;
    line-height: 1.6;
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
  [data-theme='dark'] .brutal-pane {
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
  [data-theme='dark'] .brutal-btn:active {
    box-shadow: 0px 0px 0px #eee;
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
  [data-theme='dark'] .brutal-range {
    background: #333;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-range::-webkit-slider-thumb {
    background: #ffd900;
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .value-tag {
    background: #eee;
    color: #111;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-action-btn {
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:hover {
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }
  [data-theme='dark'] .code-outer {
    background: #1a1a1a;
    border-color: #eee;
  }
  [data-theme='dark'] pre {
    color: #ffd900;
  }
  [data-theme='dark'] .preview-area {
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .copy-btn {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
</style>
