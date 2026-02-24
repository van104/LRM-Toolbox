<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">新拟态<span>.生成器()</span></h1>
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
                <el-color-picker v-model="color" size="small" />
              </div>
            </div>

            <!-- 距离 -->
            <div class="config-item">
              <div class="label-row">
                <label class="config-label">距离 (Distance)</label>
                <span class="value-tag">{{ distance }}px</span>
              </div>
              <input v-model.number="distance" type="range" min="5" max="50" class="brutal-range" />
            </div>

            <!-- 模糊度 -->
            <div class="config-item">
              <div class="label-row">
                <label class="config-label">模糊度 (Blur)</label>
                <span class="value-tag">{{ blur }}px</span>
              </div>
              <input v-model.number="blur" type="range" min="0" max="100" class="brutal-range" />
            </div>

            <!-- 阴影强度 -->
            <div class="config-item">
              <div class="label-row">
                <label class="config-label">阴影强度</label>
                <span class="value-tag">{{ intensity }}%</span>
              </div>
              <input
                v-model.number="intensity"
                type="range"
                min="0"
                max="30"
                class="brutal-range"
              />
            </div>

            <!-- 光照方向 -->
            <div class="config-item">
              <label class="config-label">光照方向</label>
              <div class="direction-grid">
                <button
                  v-for="d in directions"
                  :key="d.name"
                  class="dir-btn"
                  :class="{ active: direction === d.name }"
                  @click="direction = d.name"
                >
                  {{ d.label }}
                </button>
              </div>
            </div>

            <!-- 形状风格 -->
            <div class="config-item">
              <label class="config-label">形状风格</label>
              <div class="shape-grid">
                <button
                  v-for="s in shapes"
                  :key="s.id"
                  class="shape-btn"
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
        <div class="brutal-pane preview-outer">
          <div class="pane-header bg-blue">
            <span class="text-white">预览效果.PREVIEW</span>
          </div>
          <div class="pane-content preview-area" :style="{ background: color }">
            <div class="preview-container">
              <div class="neu-element" :style="neuStyle">
                <div class="neu-content" :style="{ color: textColor }">
                  <div class="neu-icon">◆</div>
                  <h3>LRM Toolbox</h3>
                </div>
              </div>
            </div>

            <div class="code-section">
              <div class="label-row">
                <label class="config-label" :style="{ color: textColor }">CSS 代码</label>
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

  const color = ref('#e0e0e0');
  const distance = ref(20);
  const blur = ref(60);
  const intensity = ref(15);
  const direction = ref('top-left');
  const shape = ref('flat');

  const directions = [
    { name: 'top-left', label: '↖ 左上' },
    { name: 'top-right', label: '↗ 右上' },
    { name: 'bottom-left', label: '↙ 左下' },
    { name: 'bottom-right', label: '↘ 右下' }
  ];

  const shapes = [
    { id: 'flat', label: '平坦' },
    { id: 'convex', label: '凸起' },
    { id: 'concave', label: '凹陷' },
    { id: 'pressed', label: '按压' }
  ];

  const adjustColor = (hex: string, amount: number) => {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  const textColor = computed(() => {
    const r = parseInt(color.value.slice(1, 3), 16);
    const g = parseInt(color.value.slice(3, 5), 16);
    const b = parseInt(color.value.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#4a5568' : '#cbd5e0';
  });

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
    let background: string = color.value;
    let shadow = `${pos.dark.x}px ${pos.dark.y}px ${b}px ${darkColor}, ${pos.light.x}px ${pos.light.y}px ${b}px ${lightColor}`;
    if (shape.value === 'convex') {
      background = `linear-gradient(145deg, ${adjustColor(color.value, 10)}, ${adjustColor(color.value, -10)})`;
    } else if (shape.value === 'concave') {
      background = `linear-gradient(145deg, ${adjustColor(color.value, -10)}, ${adjustColor(color.value, 10)})`;
    } else if (shape.value === 'pressed') {
      shadow = `inset ${pos.dark.x}px ${pos.dark.y}px ${b}px ${darkColor}, inset ${pos.light.x}px ${pos.light.y}px ${b}px ${lightColor}`;
    }
    return { background, boxShadow: shadow, borderRadius: '50px' };
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
    return `border-radius: 50px;\n${background}\n${shadow}`;
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

  .direction-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
  .dir-btn {
    padding: 0.5rem;
    border: 3px solid #111;
    background: #fff;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }
  .dir-btn.active {
    background: #4b7bff;
    color: #fff;
  }
  .dir-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0px #111;
  }

  .shape-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
  .shape-btn {
    padding: 0.5rem;
    border: 3px solid #111;
    background: #fff;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }
  .shape-btn.active {
    background: #ffd900;
  }
  .shape-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0px #111;
  }

  .preview-outer {
    overflow: hidden;
  }
  .preview-area {
    transition: background 0.3s ease;
  }
  .preview-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    min-height: 300px;
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
  .neu-icon {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }
  .neu-content h3 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 700;
    font-family: 'Syne', sans-serif;
  }

  .code-section {
    margin-top: 1.5rem;
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
  [data-theme='dark'] .dir-btn,
  [data-theme='dark'] .shape-btn {
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
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
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
  [data-theme='dark'] .dir-btn {
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .dir-btn.active {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .shape-btn {
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .shape-btn.active {
    background: #b28f00;
    color: #fff;
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
