<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <div class="header-action start">
          <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        </div>
        <h1 class="brutal-title">矢量路径<span>.雕刻()</span></h1>
        <div class="header-action end"></div>
      </header>

      <div class="brutal-grid">
        <!-- 左侧: Editor -->
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span>路径解码器.指令台</span>
            <div class="pane-actions">
              <button @click="formatPath">格式化</button>
              <button @click="copyPath">复制</button>
            </div>
          </div>

          <div class="control-panel-content">
            <div class="brutal-form-group">
              <label class="brutal-label">路径代码 (d 属性)</label>
              <textarea
                v-model="pathData"
                class="brutal-textarea mt-1"
                rows="8"
                placeholder="M10 10 L90 90..."
              ></textarea>
            </div>

            <div class="brutal-form-group channel-group group-pink mt-4">
              <h4>预设图元矩阵</h4>
              <div class="preset-grid mt-1">
                <button
                  v-for="p in presets"
                  :key="p.name"
                  class="preset-btn brutal-shadow"
                  @click="applyPreset(p.path)"
                >
                  {{ p.name }}
                </button>
              </div>
            </div>

            <div class="brutal-form-group channel-group mt-4">
              <h4>渲染参数</h4>
              <div class="setting-row mt-1">
                <span class="brutal-label">填充漆色</span>
                <input v-model="fillColor" type="color" class="brutal-input color-picker" />
              </div>
              <div class="setting-row mt-1">
                <span class="brutal-label">描边漆色</span>
                <input v-model="strokeColor" type="color" class="brutal-input color-picker" />
              </div>
              <div class="setting-row mt-1">
                <span class="brutal-label">描边宽度 [ {{ strokeWidth }} ]</span>
                <input
                  v-model.number="strokeWidth"
                  type="range"
                  class="brutal-slider"
                  min="0"
                  max="10"
                  step="0.5"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧: Preview -->
        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">实时渲染.视窗</span>
          </div>

          <div class="preview-content">
            <div class="svg-container brutal-shadow">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path
                      d="M 10 0 L 0 0 0 10"
                      fill="none"
                      stroke="rgba(0,0,0,0.12)"
                      stroke-width="0.3"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                <path
                  :d="pathData"
                  :fill="fillColor"
                  :stroke="strokeColor"
                  :stroke-width="strokeWidth"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="help-hint mt-4">⚡ 视口为 100×100，路径坐标请参照此比例</div>
          </div>
        </div>
      </div>

      <!-- 全局状态栏 -->
      <div class="brutal-status success">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span>
              <span v-for="i in 10" :key="i"
                >矢量引擎在线 : 路径数据已同步解析映射... // &nbsp;</span
              >
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useCopy } from '@/composables/useCopy';

  const { copyToClipboard } = useCopy();
  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const pathData = ref('M10 10 H90 V90 H10 Z');
  const fillColor = ref('#409EFF');
  const strokeColor = ref('#000000');
  const strokeWidth = ref(2);

  const presets = [
    { name: '矩形', path: 'M10 10 H90 V90 H10 Z' },
    { name: '圆形', path: 'M50 10 A40 40 0 1 0 50 90 A40 40 0 1 0 50 10 Z' },
    { name: '三角形', path: 'M50 10 L90 90 L10 90 Z' },
    {
      name: '心形',
      path: 'M50 30 C50 30 20 0 20 50 C20 80 50 95 50 95 C50 95 80 80 80 50 C80 0 50 30 50 30 Z'
    },
    { name: '星形', path: 'M50 10 L61 38 H90 L67 55 L75 85 L50 70 L25 85 L33 55 L10 38 H39 Z' },
    { name: '闪电', path: 'M55 10 L35 50 H50 L45 90 L65 50 H50 Z' }
  ];

  const applyPreset = (d: string) => {
    pathData.value = d;
  };

  const formatPath = () => {
    pathData.value = pathData.value
      .replace(/([a-zA-Z])/g, ' $1 ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const copyPath = async () => {
    await copyToClipboard(pathData.value);
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
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    margin-bottom: 2rem;
  }
  .header-action.start {
    display: flex;
    justify-content: flex-start;
  }
  .header-action.end {
    display: flex;
    justify-content: flex-end;
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

  .mt-1 {
    margin-top: 0.25rem;
  }
  .mt-4 {
    margin-top: 1.5rem;
  }

  .brutal-grid {
    display: grid;
    grid-template-columns: 450px 1fr;
    gap: 3rem;
    margin-bottom: 3rem;
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
    font-size: 1.25rem;
    letter-spacing: 1px;
  }
  .bg-yellow {
    background: #ffd900;
  }
  .bg-blue {
    background: #4b7bff;
  }
  .text-white {
    color: #fff;
    text-shadow: 1px 1px 0 #111;
  }

  .pane-actions {
    display: flex;
    gap: 0.5rem;
  }
  .pane-actions button {
    background: #fff;
    color: #111;
    border: 3px solid #111;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    font-size: 0.9rem;
    padding: 0.35rem 0.75rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
  }
  .pane-actions button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }

  .control-panel-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  .preview-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    flex: 1;
    background: #f8fafc;
    background-image:
      linear-gradient(#e5e5e5 1px, transparent 1px),
      linear-gradient(90deg, #e5e5e5 1px, transparent 1px);
    background-size: 20px 20px;
  }

  .brutal-label {
    display: block;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.95rem;
    color: #111;
  }
  .brutal-textarea {
    width: 100%;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.95rem;
    padding: 0.75rem;
    border: 3px solid #111;
    border-radius: 0;
    box-shadow: 3px 3px 0px #111;
    outline: none;
    resize: vertical;
    background: #fff;
    box-sizing: border-box;
  }
  .brutal-textarea:focus {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }

  .channel-group {
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    padding: 1.25rem;
    background: #fdfdfd;
  }
  .channel-group.group-pink {
    background: #fff0f5;
  }
  .channel-group h4 {
    margin: 0 0 0.5rem 0;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
  }

  .preset-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }
  .preset-btn {
    padding: 0.6rem 0.5rem;
    border: 3px solid #111;
    background: #fff;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.85rem;
    cursor: pointer;
    transition: 0.1s;
    text-align: center;
  }
  .preset-btn:hover {
    background: #ffd900;
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }
  .preset-btn:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }

  .setting-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }
  .brutal-input.color-picker {
    width: 50px;
    height: 36px;
    padding: 0;
    border: 3px solid #111;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
  }
  .brutal-input.color-picker::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  .brutal-input.color-picker::-webkit-color-swatch {
    border: none;
  }
  .brutal-slider {
    flex: 1;
    max-width: 160px;
    -webkit-appearance: none;
    appearance: none;
    height: 10px;
    background: #111;
    border: 2px solid #111;
  }
  .brutal-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: #ffd900;
    border: 3px solid #111;
    cursor: pointer;
  }

  .svg-container {
    flex: 1;
    border: 4px solid #111;
    background: #fff;
    min-height: 300px;
    max-height: 500px;
  }
  .help-hint {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    text-align: center;
    color: #666;
    padding: 0.5rem;
    border: 2px dashed #aaa;
  }

  .brutal-shadow {
    box-shadow: 4px 4px 0px #111;
  }

  .brutal-status {
    background: #00e572;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    padding: 1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.5rem;
    overflow: hidden;
    text-transform: uppercase;
  }
  .marquee-wrapper {
    width: 100%;
    overflow: hidden;
  }
  .marquee-content {
    display: inline-block;
    white-space: nowrap;
    animation: marquee 20s linear infinite;
  }
  @keyframes marquee {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .pane-actions button,
  [data-theme='dark'] .brutal-textarea,
  [data-theme='dark'] .brutal-status {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane:hover {
    box-shadow: 16px 16px 0px #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
    color: #111;
  }
  [data-theme='dark'] .channel-group {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .channel-group.group-pink {
    background: #2a1a20;
  }
  [data-theme='dark'] .preview-content {
    background: #222;
    background-image:
      linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px);
  }
  [data-theme='dark'] .preset-btn {
    background: #333;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .preset-btn:hover {
    background: #b28f00;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .svg-container {
    border-color: #eee;
    background: #fff;
  }
  [data-theme='dark'] .brutal-shadow {
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-status {
    background: #00994c;
    color: #fff;
    box-shadow: 8px 8px 0px #eee;
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
  [data-theme='dark'] .help-hint {
    color: #aaa;
    border-color: #555;
  }
  [data-theme='dark'] .brutal-input.color-picker {
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .brutal-slider {
    background: #eee;
    border-color: #eee;
  }
</style>
