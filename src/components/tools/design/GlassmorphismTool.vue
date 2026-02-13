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
        <h1 class="tool-title">玻璃拟态生成器</h1>
        <span class="tool-subtitle">Glassmorphism Generator</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="copyCSS">
          <el-icon><CopyDocument /></el-icon>
          复制 CSS
        </el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="tool-layout">
        <!-- 左侧配置面板 -->
        <div class="tool-sidebar">
          <div class="panel glass-card">
            <h2 class="panel-title">
              <el-icon><IceCream /></el-icon> 效果配置
            </h2>

            <!-- 背景颜色 -->
            <div class="config-item">
              <div class="label-row">
                <label class="section-label">背景颜色</label>
                <el-color-picker v-model="bgColor" show-alpha size="small" />
              </div>
            </div>

            <!-- 模糊度 -->
            <div class="config-item">
              <div class="label-row">
                <label class="section-label">模糊度 (Blur)</label>
                <span class="value-display">{{ blur }}px</span>
              </div>
              <div class="slider-wrapper">
                <input
                  v-model.number="blur"
                  type="range"
                  min="0"
                  max="20"
                  step="0.5"
                  class="range-input"
                />
              </div>
            </div>

            <!-- 透明度 -->
            <div class="config-item">
              <div class="label-row">
                <label class="section-label">透明度 (Opacity)</label>
                <span class="value-display">{{ opacity }}%</span>
              </div>
              <div class="slider-wrapper">
                <input
                  v-model.number="opacity"
                  type="range"
                  min="0"
                  max="100"
                  class="range-input"
                />
              </div>
            </div>

            <!-- 饱和度 -->
            <div class="config-item">
              <div class="label-row">
                <label class="section-label">饱和度 (Saturation)</label>
                <span class="value-display">{{ saturate }}%</span>
              </div>
              <div class="slider-wrapper">
                <input
                  v-model.number="saturate"
                  type="range"
                  min="0"
                  max="200"
                  class="range-input"
                />
              </div>
            </div>

            <!-- 边框 -->
            <div class="config-item">
              <div class="label-row">
                <label class="section-label">边框透明度</label>
                <span class="value-display">{{ borderOpacity }}%</span>
              </div>
              <div class="slider-wrapper">
                <input
                  v-model.number="borderOpacity"
                  type="range"
                  min="0"
                  max="100"
                  class="range-input"
                />
              </div>
            </div>

            <!-- 圆角 -->
            <div class="config-item">
              <div class="label-row">
                <label class="section-label">圆角 (Radius)</label>
                <span class="value-display">{{ borderRadius }}px</span>
              </div>
              <div class="slider-wrapper">
                <input
                  v-model.number="borderRadius"
                  type="range"
                  min="0"
                  max="50"
                  class="range-input"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧预览面板 -->
        <div class="tool-main">
          <div class="panel glass-card preview-panel">
            <h2 class="panel-title">预览效果</h2>

            <!-- 预览区域，带有复杂背景以展示效果 -->
            <div class="preview-area" :style="{ background: previewBackground }">
              <div class="background-dots"></div>
              <div class="floating-shapes">
                <div class="shape shape-1"></div>
                <div class="shape shape-2"></div>
                <div class="shape shape-3"></div>
              </div>

              <!-- 玻璃卡片 -->
              <div class="glass-preview-container">
                <div class="glass-element" :style="glassStyle">
                  <div class="glass-content">
                    <h3>Hello Glassmorphism</h3>
                    <p>
                      这是一个实时生成的毛玻璃效果示例。你可以通过调整左侧参数来改变模糊度、透明度以及边框细节。
                    </p>
                    <div class="glass-demo-btn">示例按钮</div>
                  </div>
                </div>
              </div>

              <!-- 预览背景切换 -->
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

            <div class="code-section mt-6">
              <div class="label-row">
                <h3 class="section-label">CSS 代码</h3>
                <el-button type="primary" link size="small" @click="copyCSS">
                  <el-icon><CopyDocument /></el-icon> 复制
                </el-button>
              </div>
              <div class="code-outer">
                <pre><code>{{ cssCode }}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - 玻璃拟态生成器</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { ArrowLeft, IceCream, CopyDocument } from '@element-plus/icons-vue';
  import { useCopy } from '@/composables/useCopy';

  const { copyToClipboard } = useCopy();

  // 配置参数
  const bgColor = ref('rgba(255, 255, 255, 0.2)');
  const blur = ref(10);
  const opacity = ref(20);
  const saturate = ref(180);
  const borderOpacity = ref(30);
  const borderRadius = ref(16);

  // 预览背景
  const backgrounds = [
    { name: '炫彩渐变', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { name: '日落色', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { name: '海洋色', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { name: '深色模式', value: '#1e293b' },
    { name: '浅色网格', value: '#f8fafc' }
  ];
  const previewBackground = ref(backgrounds[0].value);

  // 计算玻璃样式
  const glassStyle = computed(() => {
    // 解析 bgColor
    let baseColor = bgColor.value;
    if (baseColor.startsWith('rgba')) {
      const parts = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (parts) {
        const r = parts[1];
        const g = parts[2];
        const b = parts[3];
        baseColor = `rgba(${r}, ${g}, ${b}, ${opacity.value / 100})`;
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

  // 计算 CSS 代码
  const cssCode = computed(() => {
    // 解析颜色
    let baseColor = bgColor.value;
    if (baseColor.startsWith('rgba')) {
      const parts = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (parts) {
        const r = parts[1];
        const g = parts[2];
        const b = parts[3];
        baseColor = `rgba(${r}, ${g}, ${b}, ${opacity.value / 100})`;
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
    await copyToClipboard(cssCode.value, {
      success: 'CSS 代码已复制到剪贴板'
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
      grid-template-columns: 320px 1fr;
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
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .config-item {
    margin-bottom: 24px;
  }

  .section-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .value-display {
    font-family: monospace;
    font-weight: 600;
    color: #3b82f6;
  }

  .slider-wrapper {
    margin: 12px 0;
  }

  .range-input {
    width: 100%;
    height: 6px;
    background: #e2e8f0;
    border-radius: 3px;
    appearance: none;
    outline: none;
  }

  .range-input::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    background: #3b82f6;
    border: 3px solid white;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .preview-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .preview-area {
    flex: 1;
    min-height: 400px;
    border-radius: 12px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.5s ease;
  }

  .background-dots {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
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
    bottom: 16px;
    right: 16px;
    display: flex;
    gap: 8px;
    background: rgba(0, 0, 0, 0.2);
    padding: 6px;
    border-radius: 20px;
  }

  .bg-dot {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid white;
    cursor: pointer;
    padding: 0;
    transition: transform 0.2s;
  }

  .bg-dot:hover {
    transform: scale(1.2);
  }

  .code-outer {
    background: #1e293b;
    border-radius: 12px;
    padding: 20px;
    margin-top: 12px;
  }

  pre {
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: 'Fira Code', 'Courier New', monospace;
    font-size: 0.95rem;
    color: #e2e8f0;
    line-height: 1.5;
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
</style>
