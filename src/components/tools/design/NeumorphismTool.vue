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
        <h1 class="tool-title">新拟态风格生成器</h1>
        <span class="tool-subtitle">Neumorphism Generator</span>
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
              <el-icon><Box /></el-icon> 效果配置
            </h2>

            <!-- 背景颜色 -->
            <div class="config-item">
              <div class="label-row">
                <label class="section-label">背景颜色</label>
                <el-color-picker v-model="color" size="small" />
              </div>
            </div>

            <!-- 距离 -->
            <div class="config-item">
              <div class="label-row">
                <label class="section-label">距离 (Distance)</label>
                <span class="value-display">{{ distance }}px</span>
              </div>
              <div class="slider-wrapper">
                <input
                  v-model.number="distance"
                  type="range"
                  min="5"
                  max="50"
                  class="range-input"
                />
              </div>
            </div>

            <!-- 模糊度 -->
            <div class="config-item">
              <div class="label-row">
                <label class="section-label">模糊度 (Blur)</label>
                <span class="value-display">{{ blur }}px</span>
              </div>
              <div class="slider-wrapper">
                <input v-model.number="blur" type="range" min="0" max="100" class="range-input" />
              </div>
            </div>

            <!-- 强度 -->
            <div class="config-item">
              <div class="label-row">
                <label class="section-label">阴影强度</label>
                <span class="value-display">{{ intensity }}%</span>
              </div>
              <div class="slider-wrapper">
                <input
                  v-model.number="intensity"
                  type="range"
                  min="0"
                  max="30"
                  class="range-input"
                />
              </div>
            </div>

            <!-- 光照方向 -->
            <div class="config-item">
              <label class="section-label">光照方向</label>
              <div class="direction-grid">
                <button
                  v-for="d in directions"
                  :key="d.name"
                  class="direction-btn"
                  :class="{ active: direction === d.name }"
                  @click="direction = d.name"
                >
                  <el-icon><component :is="d.icon" /></el-icon>
                </button>
              </div>
            </div>

            <!-- 形状 -->
            <div class="config-item">
              <label class="section-label">形状风格</label>
              <div class="shape-tabs">
                <button
                  v-for="s in shapes"
                  :key="s.id"
                  class="tab-btn"
                  :class="{ active: shape === s.id }"
                  @click="shape = s.id"
                >
                  {{ s.label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧预览面板 -->
        <div class="tool-main">
          <div class="panel preview-panel" :style="{ background: color }">
            <h2 class="panel-title" :style="{ color: textColor }">预览效果</h2>

            <div class="preview-container">
              <div class="neu-element" :style="neuStyle">
                <div class="neu-content" :style="{ color: textColor }">
                  <el-icon size="40"><Box /></el-icon>
                  <h3>LRM Toolbox</h3>
                </div>
              </div>
            </div>

            <div class="code-section mt-6">
              <div class="label-row">
                <h3 class="section-label" :style="{ color: textColor }">CSS 代码</h3>
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
    <footer class="footer">© 2026 LRM工具箱 - 新拟态风格生成器</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import {
    ArrowLeft,
    Box,
    CopyDocument,
    CaretTop,
    CaretBottom,
    CaretLeft,
    CaretRight
  } from '@element-plus/icons-vue';
  import { useCopy } from '@/composables/useCopy';

  const { copyToClipboard } = useCopy();

  // 配置参数
  const color = ref('#e0e0e0');
  const distance = ref(20);
  const blur = ref(60);
  const intensity = ref(15);
  const direction = ref('top-left');
  const shape = ref('flat');

  const directions = [
    { name: 'top-left', icon: CaretTop },
    { name: 'top-right', icon: CaretRight },
    { name: 'bottom-right', icon: CaretBottom },
    { name: 'bottom-left', icon: CaretLeft }
  ];

  const shapes = [
    { id: 'flat', label: '平坦' },
    { id: 'convex', label: '凸起' },
    { id: 'concave', label: '凹陷' },
    { id: 'pressed', label: '按压' }
  ];

  // 辅助函数：调整颜色亮度
  const adjustColor = (hex: string, amount: number) => {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);

    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  // 计算对比色
  const textColor = computed(() => {
    const r = parseInt(color.value.slice(1, 3), 16);
    const g = parseInt(color.value.slice(3, 5), 16);
    const b = parseInt(color.value.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#4a5568' : '#cbd5e0';
  });

  // 计算阴影位置
  const shadowPositions = computed(() => {
    const d = distance.value;
    switch (direction.value) {
      case 'top-left':
        return { dark: { x: d, y: d }, light: { x: -d, y: -d } };
      case 'top-right':
        return { dark: { x: -d, y: d }, light: { x: d, y: -d } };
      case 'bottom-right':
        return { dark: { x: -d, y: -d }, light: { x: d, y: d } };
      case 'bottom-left':
        return { dark: { x: d, y: -d }, light: { x: -d, y: d } };
      default:
        return { dark: { x: d, y: d }, light: { x: -d, y: -d } };
    }
  });

  const neuStyle = computed(() => {
    const darkColor = adjustColor(color.value, -intensity.value * 2);
    const lightColor = adjustColor(color.value, intensity.value * 2);
    const pos = shadowPositions.value;
    const b = blur.value;

    let background = color.value;
    let shadow = `${pos.dark.x}px ${pos.dark.y}px ${b}px ${darkColor}, ${pos.light.x}px ${pos.light.y}px ${b}px ${lightColor}`;

    if (shape.value === 'convex') {
      background = `linear-gradient(145deg, ${adjustColor(color.value, 10)}, ${adjustColor(color.value, -10)})`;
    } else if (shape.value === 'concave') {
      background = `linear-gradient(145deg, ${adjustColor(color.value, -10)}, ${adjustColor(color.value, 10)})`;
    } else if (shape.value === 'pressed') {
      shadow = `inset ${pos.dark.x}px ${pos.dark.y}px ${b}px ${darkColor}, inset ${pos.light.x}px ${pos.light.y}px ${b}px ${lightColor}`;
    }

    return {
      background,
      boxShadow: shadow,
      borderRadius: '50px'
    };
  });

  const cssCode = computed(() => {
    const darkColor = adjustColor(color.value, -intensity.value * 2);
    const lightColor = adjustColor(color.value, intensity.value * 2);
    const pos = shadowPositions.value;
    const b = blur.value;

    let background = `background: ${color.value};`;
    let shadow = `box-shadow: ${pos.dark.x}px ${pos.dark.y}px ${b}px ${darkColor},
            ${pos.light.x}px ${pos.light.y}px ${b}px ${lightColor};`;

    if (shape.value === 'convex') {
      background = `background: linear-gradient(145deg, ${adjustColor(color.value, 10)}, ${adjustColor(color.value, -10)});`;
    } else if (shape.value === 'concave') {
      background = `background: linear-gradient(145deg, ${adjustColor(color.value, -10)}, ${adjustColor(color.value, 10)});`;
    } else if (shape.value === 'pressed') {
      shadow = `box-shadow: inset ${pos.dark.x}px ${pos.dark.y}px ${b}px ${darkColor},
            inset ${pos.light.x}px ${pos.light.y}px ${b}px ${lightColor};`;
    }

    return `border-radius: 50px;
${background}
${shadow}`;
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
    margin-bottom: 12px;
  }

  .label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
  }

  .direction-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .direction-btn {
    padding: 8px;
    background: #f1f5f9;
    border: 1px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    color: #64748b;
    display: flex;
    justify-content: center;
  }

  .direction-btn.active {
    background: #3b82f6;
    color: white;
  }

  .shape-tabs {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .tab-btn {
    padding: 8px;
    border: 1px solid #e2e8f0;
    background: white;
    border-radius: 8px;
    font-size: 0.85rem;
    cursor: pointer;
    color: #64748b;
  }

  .tab-btn.active {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }

  .preview-panel {
    flex: 1;
    min-height: 500px;
    border-radius: 16px;
    padding: 40px;
    display: flex;
    flex-direction: column;
    transition: background 0.3s ease;
  }

  .preview-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
  }

  .neu-element {
    width: 250px;
    height: 250px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }

  .neu-content {
    text-align: center;
  }

  .neu-content h3 {
    margin-top: 16px;
    font-size: 1.2rem;
    font-weight: 700;
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
    font-family: 'Fira Code', monospace;
    font-size: 0.95rem;
    color: #e2e8f0;
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
