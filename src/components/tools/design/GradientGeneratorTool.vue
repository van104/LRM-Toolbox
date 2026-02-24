<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">渐变色<span>.生成器()</span></h1>
        <button class="brutal-btn copy-btn" @click="copyCSS">复制 CSS</button>
      </header>

      <div class="brutal-grid">
        <!-- 左侧配置面板 -->
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span>渐变配置.CONFIG</span>
          </div>
          <div class="pane-content">
            <!-- 渐变类型 -->
            <div class="config-item">
              <label class="config-label">渐变类型</label>
              <div class="type-tabs">
                <button
                  class="tab-btn"
                  :class="{ active: gradientType === 'linear' }"
                  @click="gradientType = 'linear'"
                >
                  线性渐变
                </button>
                <button
                  class="tab-btn"
                  :class="{ active: gradientType === 'radial' }"
                  @click="gradientType = 'radial'"
                >
                  径向渐变
                </button>
              </div>
            </div>

            <!-- 线性角度 -->
            <div v-if="gradientType === 'linear'" class="config-item">
              <div class="label-row">
                <label class="config-label" style="margin-bottom: 0">渐变角度</label>
                <span class="value-tag">{{ angle }}°</span>
              </div>
              <input v-model.number="angle" type="range" min="0" max="360" class="brutal-range" />
              <div class="quick-angles">
                <button
                  v-for="a in [0, 45, 90, 135, 180, 270]"
                  :key="a"
                  class="angle-btn"
                  @click="angle = a"
                >
                  {{ a }}°
                </button>
              </div>
            </div>

            <!-- 径向设置 -->
            <div v-if="gradientType === 'radial'" class="config-item">
              <label class="config-label">形状</label>
              <div class="type-tabs">
                <button
                  class="tab-btn"
                  :class="{ active: radialShape === 'circle' }"
                  @click="radialShape = 'circle'"
                >
                  圆形
                </button>
                <button
                  class="tab-btn"
                  :class="{ active: radialShape === 'ellipse' }"
                  @click="radialShape = 'ellipse'"
                >
                  椭圆
                </button>
              </div>
              <label class="config-label" style="margin-top: 1rem">位置</label>
              <div class="position-grid">
                <button
                  v-for="pos in positions"
                  :key="pos.value"
                  class="pos-btn"
                  :class="{ active: radialPosition === pos.value }"
                  @click="radialPosition = pos.value"
                >
                  {{ pos.label }}
                </button>
              </div>
            </div>

            <!-- 色彩停靠点 -->
            <div class="config-item">
              <label class="config-label">色彩停靠点</label>
              <div class="stops-list">
                <div v-for="(stop, index) in colorStops" :key="index" class="stop-item">
                  <el-color-picker v-model="stop.color" show-alpha size="small" />
                  <div class="offset-control">
                    <input
                      v-model.number="stop.offset"
                      type="number"
                      min="0"
                      max="100"
                      class="mini-input"
                    />
                    <span class="unit-label">%</span>
                  </div>
                  <button
                    class="delete-btn"
                    :disabled="colorStops.length <= 2"
                    @click="removeStop(index)"
                  >
                    &times;
                  </button>
                </div>
                <button class="add-stop-btn" @click="addStop">+ 添加停靠点</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧预览面板 -->
        <div class="right-column">
          <div class="brutal-pane">
            <div class="pane-header bg-blue">
              <span class="text-white">预览效果.PREVIEW</span>
            </div>
            <div class="pane-content">
              <div class="preview-box" :style="gradientStyle">
                <div class="preview-text">LRM Toolbox</div>
              </div>

              <div class="code-section">
                <div class="label-row">
                  <label class="config-label" style="margin-bottom: 0">CSS 代码</label>
                  <button class="brutal-action-btn compact" @click="copyCSS">复制</button>
                </div>
                <div class="code-outer">
                  <pre><code>{{ cssCode }}</code></pre>
                </div>
              </div>
            </div>
          </div>

          <div class="brutal-pane" style="margin-top: 3rem">
            <div class="pane-header bg-green">
              <span>精选配色.PRESETS</span>
            </div>
            <div class="pane-content">
              <div class="presets-grid">
                <div
                  v-for="(preset, idx) in presets"
                  :key="idx"
                  class="preset-item"
                  :style="{ background: preset.style }"
                  @click="applyPreset(preset)"
                >
                  <span class="preset-name">{{ preset.name }}</span>
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
  import { ElMessage } from 'element-plus';
  import { useRouter } from 'vue-router';
  import { useCopy } from '@/composables/useCopy';

  const router = useRouter();
  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push('/');
  }

  const { copyToClipboard } = useCopy();
  const gradientType = ref<'linear' | 'radial'>('linear');
  const angle = ref(135);
  const radialShape = ref('circle');
  const radialPosition = ref('center');

  const positions = [
    { label: '中心', value: 'center' },
    { label: '左上', value: 'at top left' },
    { label: '右上', value: 'at top right' },
    { label: '左下', value: 'at bottom left' },
    { label: '右下', value: 'at bottom right' }
  ];

  interface ColorStop {
    color: string;
    offset: number;
  }

  const colorStops = ref<ColorStop[]>([
    { color: 'rgba(67, 97, 238, 1)', offset: 0 },
    { color: 'rgba(76, 201, 240, 1)', offset: 100 }
  ]);

  const cssCode = computed(() => {
    const stops = colorStops.value
      .slice()
      .sort((a, b) => a.offset - b.offset)
      .map(s => `${s.color} ${s.offset}%`)
      .join(', ');
    if (gradientType.value === 'linear') {
      return `background: linear-gradient(${angle.value}deg, ${stops});`;
    } else {
      return `background: radial-gradient(${radialShape.value} ${radialPosition.value}, ${stops});`;
    }
  });

  const gradientStyle = computed(() => cssCode.value);

  const addStop = () => {
    if (colorStops.value.length < 8) {
      const lastOffset = colorStops.value[colorStops.value.length - 1].offset;
      colorStops.value.push({
        color: 'rgba(120, 120, 120, 1)',
        offset: Math.min(100, lastOffset + 10)
      });
    } else {
      ElMessage.warning('最多支持 8 个颜色停靠点');
    }
  };

  const removeStop = (index: number) => {
    colorStops.value.splice(index, 1);
  };

  const copyCSS = async () => {
    await copyToClipboard(cssCode.value, { success: 'CSS 代码已复制到剪贴板' });
  };

  const presets = [
    {
      name: 'Warm Flame',
      style: 'linear-gradient(45deg, #ff9a9e 0%, #fecfef 100%)',
      stops: [
        { color: '#ff9a9e', offset: 0 },
        { color: '#fecfef', offset: 100 }
      ]
    },
    {
      name: 'Night Fade',
      style: 'linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)',
      stops: [
        { color: '#a18cd1', offset: 0 },
        { color: '#fbc2eb', offset: 100 }
      ]
    },
    {
      name: 'Spring Warmth',
      style: 'linear-gradient(to top, #fad0c4 0%, #ffd1ff 100%)',
      stops: [
        { color: '#fad0c4', offset: 0 },
        { color: '#ffd1ff', offset: 100 }
      ]
    },
    {
      name: 'Juicy Peach',
      style: 'linear-gradient(to right, #ff0844 0%, #ffb199 100%)',
      stops: [
        { color: '#ff0844', offset: 0 },
        { color: '#ffb199', offset: 100 }
      ]
    },
    {
      name: 'Sunny Morning',
      style: 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)',
      stops: [
        { color: '#f6d365', offset: 0 },
        { color: '#fda085', offset: 100 }
      ]
    },
    {
      name: 'Rainy Ash',
      style: 'radial-gradient(circle at center, #fbc2eb 0%, #a6c1ee 100%)',
      stops: [
        { color: '#fbc2eb', offset: 0 },
        { color: '#a6c1ee', offset: 100 }
      ]
    },
    {
      name: 'Frozen Dreams',
      style: 'linear-gradient(to top, #fdcbf1 0%, #e6dee9 100%)',
      stops: [
        { color: '#fdcbf1', offset: 0 },
        { color: '#e6dee9', offset: 100 }
      ]
    },
    {
      name: 'Sea Side',
      style: 'linear-gradient(135deg, #12c2e9 0%, #c471ed 50%, #f64f59 100%)',
      stops: [
        { color: '#12c2e9', offset: 0 },
        { color: '#c471ed', offset: 50 },
        { color: '#f64f59', offset: 100 }
      ]
    }
  ];

  const applyPreset = (preset: { stops: ColorStop[] }) => {
    colorStops.value = JSON.parse(JSON.stringify(preset.stops));
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
  .right-column {
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

  .config-item {
    margin-bottom: 1.5rem;
  }
  .config-label {
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 0.95rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: block;
    margin-bottom: 0.75rem;
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

  .type-tabs {
    display: flex;
    gap: 0.5rem;
  }
  .tab-btn {
    flex: 1;
    padding: 0.6rem;
    border: 3px solid #111;
    background: #fff;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }
  .tab-btn.active {
    background: #ffd900;
  }
  .tab-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0px #111;
  }

  .brutal-range {
    width: 100%;
    height: 8px;
    appearance: none;
    background: #e5e5e5;
    border: 2px solid #111;
    outline: none;
    cursor: pointer;
    margin: 0.75rem 0;
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

  .quick-angles {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
  }
  .angle-btn {
    padding: 0.3rem 0.6rem;
    border: 2px solid #111;
    background: #fff;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.1s;
  }
  .angle-btn:hover {
    background: #ffd900;
  }

  .position-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.4rem;
  }
  .pos-btn {
    padding: 0.4rem;
    border: 2px solid #111;
    background: #fff;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.1s;
  }
  .pos-btn.active {
    background: #ffd900;
  }
  .pos-btn:hover {
    background: #ffd900;
  }

  .stops-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .stop-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: #fff;
    padding: 0.5rem;
    border: 2px solid #111;
  }
  .offset-control {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    flex: 1;
  }
  .mini-input {
    width: 60px;
    padding: 0.25rem 0.4rem;
    border: 2px solid #111;
    text-align: center;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    background: #fff;
  }
  .unit-label {
    font-size: 0.8rem;
    color: #666;
    font-weight: 600;
  }
  .delete-btn {
    background: #ff4b4b;
    color: #fff;
    border: 2px solid #111;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0 0.5rem;
    font-weight: 800;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.1s;
  }
  .delete-btn:not(:disabled):hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
  }
  .delete-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .add-stop-btn {
    width: 100%;
    padding: 0.6rem;
    border: 2px dashed #111;
    background: #fff;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.1s;
  }
  .add-stop-btn:hover {
    background: #ffd900;
    border-style: solid;
  }

  .preview-box {
    width: 100%;
    height: 280px;
    border: 3px solid #111;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    box-shadow: 6px 6px 0px #111;
    margin-bottom: 1.5rem;
  }
  .preview-text {
    font-family: 'Syne', sans-serif;
    font-size: 2.5rem;
    font-weight: 800;
    color: white;
    text-shadow: 3px 3px 0px rgba(0, 0, 0, 0.3);
    letter-spacing: -0.02em;
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

  .presets-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
  }
  .preset-item {
    height: 80px;
    border: 3px solid #111;
    display: flex;
    align-items: flex-end;
    padding: 0.5rem;
    cursor: pointer;
    transition: all 0.1s;
    box-shadow: 4px 4px 0px #111;
  }
  .preset-item:hover {
    transform: translate(-3px, -3px);
    box-shadow: 7px 7px 0px #111;
  }
  .preset-name {
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    font-family: 'IBM Plex Mono', monospace;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
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
  [data-theme='dark'] .tab-btn,
  [data-theme='dark'] .stop-item,
  [data-theme='dark'] .add-stop-btn,
  [data-theme='dark'] .mini-input,
  [data-theme='dark'] .angle-btn,
  [data-theme='dark'] .pos-btn {
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
  [data-theme='dark'] .tab-btn {
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .tab-btn.active {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .tab-btn:hover {
    box-shadow: 4px 4px 0px #eee;
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
  [data-theme='dark'] .preview-box {
    border-color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .preset-item {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .preset-item:hover {
    box-shadow: 7px 7px 0px #eee;
  }
  [data-theme='dark'] .angle-btn {
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .angle-btn:hover,
  [data-theme='dark'] .pos-btn:hover,
  [data-theme='dark'] .pos-btn.active,
  [data-theme='dark'] .add-stop-btn:hover {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .pos-btn {
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .delete-btn {
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
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
  [data-theme='dark'] .bg-green {
    background: #00994c;
    color: #fff;
  }
</style>
