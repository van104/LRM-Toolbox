<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">SVG<span>.压缩()</span></h1>
        <button class="brutal-btn download-btn" :disabled="!optimizedSvg" @click="downloadSvg">
          下载
        </button>
      </header>

      <div class="brutal-grid">
        <!-- 左侧输入与选项 -->
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span>输入内容.INPUT</span>
          </div>
          <div class="pane-content">
            <textarea
              v-model="inputSvg"
              class="brutal-textarea"
              placeholder="在此粘贴 <svg>...</svg> 代码..."
              @input="handleInput"
            ></textarea>

            <div class="upload-row">
              <label class="upload-btn">
                上传 SVG
                <input type="file" accept=".svg" style="display: none" @change="handleFileUpload" />
              </label>
              <button
                class="link-btn"
                @click="
                  inputSvg = demoSvg;
                  handleInput();
                "
              >
                使用示例
              </button>
            </div>

            <div class="options-section">
              <label class="config-label">优化选项</label>
              <div class="options-grid">
                <label v-for="opt in availableOptions" :key="opt.id" class="brutal-checkbox">
                  <input v-model="options" type="checkbox" :value="opt.id" @change="optimize" />
                  <span class="check-box"></span>
                  <span>{{ opt.label }}</span>
                </label>
              </div>
            </div>

            <button class="brutal-action-btn full" :disabled="!optimizedSvg" @click="copyCode">
              复制代码
            </button>
          </div>
        </div>

        <!-- 右侧预览 -->
        <div class="right-column">
          <div v-if="optimizedSvg" class="brutal-pane stats-pane">
            <div class="pane-header bg-green">
              <span>压缩结果.STATS</span>
            </div>
            <div class="pane-content stats-row">
              <div class="stat-box">
                <span class="stat-label">原始大小</span>
                <span class="stat-value">{{ formatSize(originalSize) }}</span>
              </div>
              <div class="stat-arrow">→</div>
              <div class="stat-box">
                <span class="stat-label">压缩后</span>
                <span class="stat-value success">{{ formatSize(optimizedSize) }}</span>
              </div>
              <div class="stat-box">
                <span class="stat-label">压缩率</span>
                <span class="stat-value highlight">{{ reductionPercentage }}%</span>
              </div>
            </div>
          </div>

          <div class="brutal-pane" :style="optimizedSvg ? 'margin-top: 2rem' : ''">
            <div class="pane-header bg-blue">
              <span class="text-white">实时预览.PREVIEW</span>
              <div class="preview-controls">
                <label class="toggle-check">
                  <input v-model="showBg" type="checkbox" />
                  <span>透明格</span>
                </label>
                <div class="zoom-controls">
                  <button class="zoom-btn" @click="zoom = Math.max(0.1, zoom - 0.2)">-</button>
                  <span class="zoom-val">{{ Math.round(zoom * 100) }}%</span>
                  <button class="zoom-btn" @click="zoom += 0.2">+</button>
                </div>
              </div>
            </div>
            <div class="pane-content">
              <div class="preview-box" :class="{ checkered: showBg }">
                <!-- eslint-disable vue/no-v-html -->
                <div
                  v-if="optimizedSvg"
                  :style="{ transform: `scale(${zoom})` }"
                  class="svg-render"
                  v-html="safeOptimizedSvg"
                ></div>
                <!-- eslint-enable vue/no-v-html -->
                <div v-else class="empty-preview">
                  <span class="empty-icon">◇</span>
                  <span>等待输入 SVG 代码</span>
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
  import DOMPurify from 'dompurify';

  const router = useRouter();
  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push('/');
  }

  const { copyToClipboard } = useCopy();

  const inputSvg = ref('');
  const optimizedSvg = ref('');
  const originalSize = ref(0);
  const optimizedSize = ref(0);
  const options = ref(['removeComments', 'removeMetadata', 'minifyWhitespace', 'roundPoints']);
  const showBg = ref(true);
  const zoom = ref(1);

  const availableOptions = [
    { id: 'removeComments', label: '移除注释' },
    { id: 'removeMetadata', label: '移除元数据' },
    { id: 'removeUselessStroke', label: '移除冗余描边' },
    { id: 'minifyWhitespace', label: '精简空格' },
    { id: 'roundPoints', label: '保留 1 位小数' }
  ];

  const safeOptimizedSvg = computed(() =>
    DOMPurify.sanitize(optimizedSvg.value, { USE_PROFILES: { svg: true, svgFilters: true } })
  );
  const reductionPercentage = computed(() => {
    if (originalSize.value === 0) return 0;
    return Math.round(((originalSize.value - optimizedSize.value) / originalSize.value) * 100);
  });

  const handleInput = () => {
    if (!inputSvg.value.trim()) {
      optimizedSvg.value = '';
      return;
    }
    originalSize.value = new Blob([inputSvg.value]).size;
    optimize();
  };

  const handleFileUpload = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      inputSvg.value = ev.target?.result as string;
      handleInput();
    };
    reader.readAsText(file);
  };

  const optimize = () => {
    let code = inputSvg.value;
    code = code.replace(/<\?xml.*?\?>/gi, '');
    if (options.value.includes('removeComments')) code = code.replace(/<!--[\s\S]*?-->/g, '');
    if (options.value.includes('removeMetadata')) {
      code = code.replace(/<(metadata|desc|title)[\s\S]*?<\/\1>/gi, '');
      code = code.replace(/<!DOCTYPE.*?>/gi, '');
    }
    if (options.value.includes('roundPoints'))
      code = code.replace(/(\d+\.\d{2,})/g, match => parseFloat(match).toFixed(1));
    if (options.value.includes('removeUselessStroke'))
      code = code.replace(/stroke="none"/gi, '').replace(/stroke-width="0"/gi, '');
    if (options.value.includes('minifyWhitespace'))
      code = code.replace(/\s+/g, ' ').replace(/> </g, '><').trim();
    optimizedSvg.value = code;
    optimizedSize.value = new Blob([code]).size;
  };

  const formatSize = (bytes: number) =>
    bytes < 1024 ? bytes + ' B' : (bytes / 1024).toFixed(2) + ' KB';

  const downloadSvg = () => {
    const blob = new Blob([optimizedSvg.value], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized.svg';
    a.click();
    URL.revokeObjectURL(url);
    ElMessage.success('压缩文件已下载');
  };

  const copyCode = async () => {
    await copyToClipboard(optimizedSvg.value, { success: 'SVG 代码已复制' });
  };

  const demoSvg = `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Author: LRM Toolbox -->
  <metadata>Demo SVG File</metadata>
  <circle cx="50.123" cy="50.456" r="40" fill="#3b82f6" />
  <rect x="30" y="30" width="40" height="40" fill="white" fill-opacity="0.3" />
</svg>`;
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
  .brutal-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    box-shadow: 6px 6px 0px #111;
  }
  .download-btn {
    background: #00e572;
  }

  .brutal-grid {
    display: grid;
    grid-template-columns: 1fr 1.5fr;
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
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.2rem;
    letter-spacing: 1px;
    gap: 0.75rem;
    flex-wrap: wrap;
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

  .config-label {
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 0.95rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: block;
    margin-bottom: 0.75rem;
  }

  .brutal-textarea {
    width: 100%;
    height: 200px;
    border: 3px solid #111;
    padding: 1rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.9rem;
    resize: vertical;
    outline: none;
    background: #fdfae5;
    color: #111;
    box-sizing: border-box;
    box-shadow: 3px 3px 0px #111;
    margin-bottom: 1rem;
  }
  .brutal-textarea:focus {
    box-shadow: 5px 5px 0px #111;
    transform: translate(-1px, -1px);
  }

  .upload-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  .upload-btn {
    padding: 0.4rem 0.8rem;
    border: 3px solid #111;
    background: #fff;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }
  .upload-btn:hover {
    background: #ffd900;
  }
  .link-btn {
    background: none;
    border: none;
    color: #4b7bff;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    text-decoration: underline;
  }

  .options-section {
    margin-bottom: 1.5rem;
  }
  .options-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }
  .brutal-checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
  }
  .brutal-checkbox input {
    display: none;
  }
  .check-box {
    width: 18px;
    height: 18px;
    border: 3px solid #111;
    background: #fff;
    position: relative;
    flex-shrink: 0;
  }
  .brutal-checkbox input:checked + .check-box {
    background: #ffd900;
  }
  .brutal-checkbox input:checked + .check-box::after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 12px;
    font-weight: 800;
  }

  .brutal-action-btn {
    background: #4b7bff;
    color: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
  }
  .brutal-action-btn.full {
    width: 100%;
  }
  .brutal-action-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }
  .brutal-action-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px #111;
  }
  .brutal-action-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }

  .stats-pane .pane-content {
    padding: 1rem 1.5rem;
  }
  .stats-row {
    display: flex;
    justify-content: space-around;
    align-items: center;
    text-align: center;
  }
  .stat-box {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .stat-label {
    font-size: 0.75rem;
    color: #666;
    text-transform: uppercase;
    font-weight: 600;
  }
  .stat-value {
    font-size: 1.25rem;
    font-weight: 800;
    font-family: 'IBM Plex Mono', monospace;
  }
  .stat-value.success {
    color: #00994c;
  }
  .stat-value.highlight {
    color: #4b7bff;
    font-size: 1.5rem;
  }
  .stat-arrow {
    font-size: 1.5rem;
    font-weight: 800;
    color: #ccc;
  }

  .preview-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .toggle-check {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 600;
    color: #fff;
  }
  .toggle-check input {
    accent-color: #ffd900;
  }
  .zoom-controls {
    display: flex;
    align-items: center;
    border: 2px solid #fff;
  }
  .zoom-btn {
    width: 28px;
    height: 24px;
    border: none;
    background: #fff;
    color: #111;
    cursor: pointer;
    font-weight: 800;
    font-size: 1rem;
  }
  .zoom-val {
    min-width: 44px;
    text-align: center;
    font-size: 0.8rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    color: #fff;
  }

  .preview-box {
    width: 100%;
    height: 350px;
    background: #fff;
    border: 3px solid #111;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }
  .preview-box.checkered {
    background-image:
      linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
      linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
      linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
    background-size: 20px 20px;
    background-position:
      0 0,
      0 10px,
      10px -10px,
      -10px 0px;
  }
  .svg-render {
    max-width: 90%;
    max-height: 90%;
    display: flex;
    transition: transform 0.2s;
  }
  .empty-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    color: #ccc;
  }
  .empty-icon {
    font-size: 3rem;
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
  [data-theme='dark'] .upload-btn,
  [data-theme='dark'] .brutal-textarea {
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
  [data-theme='dark'] .brutal-textarea {
    box-shadow: 3px 3px 0px #eee;
    background: #1a1a1a;
  }
  [data-theme='dark'] .brutal-textarea:focus {
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .upload-btn {
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .upload-btn:hover {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .check-box {
    border-color: #eee;
    background: #1a1a1a;
  }
  [data-theme='dark'] .brutal-checkbox input:checked + .check-box {
    background: #b28f00;
  }
  [data-theme='dark'] .brutal-action-btn {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:hover {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .preview-box {
    border-color: #eee;
    background: #1a1a1a;
  }
  [data-theme='dark'] .zoom-btn {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .zoom-controls {
    border-color: #eee;
  }
  [data-theme='dark'] .download-btn {
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
  [data-theme='dark'] .link-btn {
    color: #60a5fa;
  }
</style>
