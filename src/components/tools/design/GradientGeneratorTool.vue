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
        <h1 class="tool-title">渐变色生成器</h1>
        <span class="tool-subtitle">Gradient Generator</span>
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
              <el-icon><MagicStick /></el-icon> 渐变配置
            </h2>

            <div class="config-item">
              <label class="section-label">渐变类型</label>
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

            <div v-if="gradientType === 'linear'" class="config-item">
              <div class="label-row">
                <label class="section-label">渐变角度</label>
                <span class="value-display">{{ angle }}°</span>
              </div>
              <div class="slider-wrapper">
                <input v-model.number="angle" type="range" min="0" max="360" class="range-input" />
              </div>
              <div class="quick-angles">
                <button v-for="a in [0, 90, 180, 270]" :key="a" class="mini-btn" @click="angle = a">
                  {{ a }}°
                </button>
              </div>
            </div>

            <div v-if="gradientType === 'radial'" class="config-item">
              <label class="section-label">形状与位置</label>
              <div class="select-group">
                <el-select v-model="radialShape" size="default">
                  <el-option label="圆形 (Circle)" value="circle" />
                  <el-option label="椭圆 (Ellipse)" value="ellipse" />
                </el-select>
                <el-select v-model="radialPosition" size="default" class="mt-2">
                  <el-option label="中心 (Center)" value="center" />
                  <el-option label="左上" value="at top left" />
                  <el-option label="右上" value="at top right" />
                  <el-option label="左下" value="at bottom left" />
                  <el-option label="右下" value="at bottom right" />
                </el-select>
              </div>
            </div>

            <div class="config-item">
              <label class="section-label">色彩停靠点</label>
              <div class="stops-list">
                <div v-for="(stop, index) in colorStops" :key="index" class="stop-item">
                  <el-color-picker v-model="stop.color" show-alpha size="small" />
                  <div class="offset-control">
                    <input
                      v-model.number="stop.offset"
                      type="number"
                      min="0"
                      max="100"
                      class="mini-number-input"
                    />
                    <span class="unit">%</span>
                  </div>
                  <button
                    class="delete-stop-btn"
                    :disabled="colorStops.length <= 2"
                    @click="removeStop(index)"
                  >
                    &times;
                  </button>
                </div>
                <button class="btn-add-stop" @click="addStop">
                  <el-icon><Plus /></el-icon> 添加停靠点
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧预览面板 -->
        <div class="tool-main">
          <div class="panel glass-card">
            <h2 class="panel-title">效果预览</h2>
            <div class="preview-box" :style="gradientStyle">
              <div class="preview-text">LRM Toolbox</div>
            </div>

            <div class="code-section mt-6">
              <h3 class="section-label">CSS 代码</h3>
              <div class="code-outer">
                <pre><code>{{ cssCode }}</code></pre>
                <button class="copy-icon-btn" title="点击复制" @click="copyCSS">
                  <el-icon><CopyDocument /></el-icon>
                </button>
              </div>
            </div>
          </div>

          <div class="panel glass-card mt-6">
            <h2 class="panel-title">精选配色方案</h2>
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
    </main>
    <footer class="footer">© 2026 LRM工具箱 - 渐变色生成器</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { ElMessage } from 'element-plus';
  import { ArrowLeft, Plus, MagicStick, CopyDocument } from '@element-plus/icons-vue';
  import { useCopy } from '@/composables/useCopy';

  const { copyToClipboard } = useCopy();

  const gradientType = ref<'linear' | 'radial'>('linear');
  const angle = ref(135);
  const radialShape = ref('circle');
  const radialPosition = ref('center');

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

  const gradientStyle = computed(() => {
    return cssCode.value;
  });

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
    await copyToClipboard(cssCode.value, {
      success: 'CSS 代码已复制到剪贴板'
    });
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
      grid-template-columns: 1fr 1.6fr;
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
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .type-tabs {
    display: flex;
    background: #f1f5f9;
    padding: 4px;
    border-radius: 8px;
  }

  .tab-btn {
    flex: 1;
    padding: 8px;
    border: none;
    background: transparent;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 500;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;
  }

  .tab-btn.active {
    background: white;
    color: #3b82f6;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .label-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
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

  .quick-angles {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }

  .mini-btn {
    padding: 4px 10px;
    font-size: 0.75rem;
    border: 1px solid #e2e8f0;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    color: #64748b;
  }

  .mini-btn:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }

  .select-group {
    display: flex;
    flex-direction: column;
  }

  .stops-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .stop-item {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #f8fafc;
    padding: 8px;
    border-radius: 8px;
    border: 1px solid #f1f5f9;
  }

  .offset-control {
    display: flex;
    align-items: center;
    gap: 4px;
    flex: 1;
  }

  .mini-number-input {
    width: 50px;
    padding: 4px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    text-align: center;
    font-family: monospace;
  }

  .unit {
    font-size: 0.8rem;
    color: #94a3b8;
  }

  .delete-stop-btn {
    background: none;
    border: none;
    color: #fca5a5;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0 4px;
  }

  .delete-stop-btn:not(:disabled):hover {
    color: #ef4444;
  }

  .btn-add-stop {
    width: 100%;
    padding: 8px;
    border: 1px dashed #cbd5e1;
    background: #f8fafc;
    border-radius: 8px;
    color: #64748b;
    font-size: 0.85rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.2s;
  }

  .btn-add-stop:hover {
    background: #f1f5f9;
    border-color: #94a3b8;
  }

  .preview-box {
    width: 100%;
    height: 280px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
    position: relative;
    overflow: hidden;
  }

  .preview-text {
    font-size: 2.5rem;
    font-weight: 800;
    color: white;
    text-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    letter-spacing: -0.02em;
  }

  .code-outer {
    position: relative;
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

  .copy-icon-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    padding: 8px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .copy-icon-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .presets-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;
  }

  .preset-item {
    height: 80px;
    border-radius: 12px;
    display: flex;
    align-items: flex-end;
    padding: 10px;
    cursor: pointer;
    transition:
      transform 0.2s,
      box-shadow 0.2s;
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .preset-item:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }

  .preset-name {
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
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
  .mt-2 {
    margin-top: 0.5rem;
  }

  @media (max-width: 640px) {
    .tool-title {
      font-size: 1.1rem;
    }
    .preview-text {
      font-size: 1.8rem;
    }
    .header-left,
    .header-right {
      width: 80px;
    }
  }
</style>
