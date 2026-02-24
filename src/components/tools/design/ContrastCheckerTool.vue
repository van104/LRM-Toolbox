<template>
  <div class="tool-page brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <div class="header-action start">
          <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        </div>
        <div class="header-text">
          <h1 class="brutal-title">色彩<span>.对比()</span></h1>
          <span class="tool-subtitle">Contrast Checker</span>
        </div>
        <div class="header-action end">
          <button class="brutal-btn action-btn bg-cyan" @click="swapColors">🔄 交换颜色</button>
        </div>
      </header>

      <main class="brutal-grid">
        <!-- 左侧输入面板 -->
        <div class="tool-sidebar">
          <div class="brutal-pane glass-card">
            <h2 class="pane-title"><span class="icon">🖌️</span> 颜色配置</h2>

            <div class="config-item">
              <label class="section-label">背景颜色 (Background)</label>
              <div class="color-input-wrapper">
                <el-color-picker v-model="bgColor" show-alpha class="brutal-el-picker" />
                <div class="input-with-prefix">
                  <span class="prefix">#</span>
                  <input
                    v-model="bgColorClean"
                    type="text"
                    class="text-input brutal-input"
                    maxlength="8"
                  />
                </div>
              </div>
            </div>

            <div class="config-item mt-4">
              <label class="section-label">文字颜色 (Text)</label>
              <div class="color-input-wrapper">
                <el-color-picker v-model="textColor" show-alpha class="brutal-el-picker" />
                <div class="input-with-prefix">
                  <span class="prefix">#</span>
                  <input
                    v-model="textColorClean"
                    type="text"
                    class="text-input brutal-input"
                    maxlength="8"
                  />
                </div>
              </div>
            </div>

            <div class="ratio-result-card mt-8 brutal-shadow relative">
              <span class="ratio-label">对比度比率</span>
              <span class="ratio-value" :style="{ color: statusColor }"
                >{{ contrastRatio.toFixed(2) }}:1</span
              >
              <div class="status-indicator mt-2">
                <span class="brutal-badge" :style="{ background: statusColor, color: '#fff' }">
                  {{ statusLabel }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧预览面板 -->
        <div class="tool-main">
          <div class="brutal-pane glass-card">
            <h2 class="pane-title"><span class="icon">👁️</span> 效果预览</h2>
            <div class="preview-box brutal-shadow" :style="{ backgroundColor: bgColor }">
              <div class="preview-content" :style="{ color: textColor }">
                <h1 class="preview-heading">大标题预览 Title</h1>
                <p class="preview-text">
                  色彩对比度是指两种颜色之间的亮度差异。良好的对比度能够提高网页的无障碍访问性（Accessibility），让视力障碍、色盲或者是处于强光环境下的用户也能清晰读阅内容。
                </p>
                <div class="preview-ui">
                  <button
                    class="preview-btn"
                    :style="{
                      color: textColor,
                      borderColor: textColor,
                      backgroundColor: 'transparent'
                    }"
                  >
                    操作按钮
                  </button>
                  <span class="preview-link" :style="{ borderBottomColor: textColor }"
                    >点击了解更多 ↗</span
                  >
                </div>
              </div>
            </div>

            <div class="scores-section mt-8">
              <h3
                class="section-label"
                style="font-size: 1.1rem; border-bottom: 3px solid #111; padding-bottom: 8px"
              >
                WCAG 2.1 达标判定
              </h3>
              <div class="score-grid mt-4">
                <div
                  v-for="score in wcagScores"
                  :key="score.level"
                  class="score-card brutal-shadow"
                >
                  <div
                    class="score-header"
                    :class="score.level === 'AAA 级别' ? 'bg-yellow' : 'bg-cyan'"
                  >
                    <span class="score-level">{{ score.level }}</span>
                    <span class="score-req">{{ score.requirement }}</span>
                  </div>
                  <div class="score-body bg-white">
                    <div class="score-row">
                      <span>普通文字 (Normal)</span>
                      <span
                        class="pass-badge"
                        :class="score.normalPass ? 'state-pass' : 'state-fail'"
                      >
                        {{ score.normalPass ? '通过 ✅' : '未通过 ❌' }}
                      </span>
                    </div>
                    <div class="score-row mt-2">
                      <span>大号文字 (Large)</span>
                      <span
                        class="pass-badge"
                        :class="score.largePass ? 'state-pass' : 'state-fail'"
                      >
                        {{ score.largePass ? '通过 ✅' : '未通过 ❌' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  // @ts-expect-error: tinycolor2 lacks type definitions
  import tinycolor from 'tinycolor2';

  const bgColor = ref('#FFFFFF');
  const textColor = ref('#334155');

  const bgColorClean = computed({
    get: () => bgColor.value.replace('#', ''),
    set: val => {
      bgColor.value = '#' + val;
    }
  });

  const textColorClean = computed({
    get: () => textColor.value.replace('#', ''),
    set: val => {
      textColor.value = '#' + val;
    }
  });

  const contrastRatio = computed(() => {
    return tinycolor.readability(bgColor.value, textColor.value);
  });

  const statusType = computed<'success' | 'warning' | 'info' | 'primary' | 'danger'>(() => {
    if (contrastRatio.value >= 7) return 'success';
    if (contrastRatio.value >= 4.5) return 'warning';
    return 'danger';
  });

  const statusColor = computed(() => {
    const types = { success: '#00e572', warning: '#f97316', danger: '#ff4b4b' };
    return types[statusType.value as 'success' | 'warning' | 'danger'];
  });

  const statusLabel = computed(() => {
    if (contrastRatio.value >= 7) return '非常优秀 (AAA)';
    if (contrastRatio.value >= 4.5) return '良好 (AA)';
    if (contrastRatio.value >= 3) return '一般 (仅大块图形)';
    return '对比度不足 (Fail)';
  });

  const wcagScores = computed(() => [
    {
      level: 'AA 级别',
      requirement: '文字 4.5:1 / 图形 3:1',
      normalPass: contrastRatio.value >= 4.5,
      largePass: contrastRatio.value >= 3
    },
    {
      level: 'AAA 级别',
      requirement: '文字 7:1 / 图形 4.5:1',
      normalPass: contrastRatio.value >= 7,
      largePass: contrastRatio.value >= 4.5
    }
  ]);

  const swapColors = () => {
    const temp = bgColor.value;
    bgColor.value = textColor.value;
    textColor.value = temp;
  };
</script>

<style scoped>
  @import '@/assets/styles/brutalism.css';

  .tool-page.brutal-wrapper {
    background-color: #fdfae5;
    background-image:
      linear-gradient(#e5e5e5 2px, transparent 2px),
      linear-gradient(90deg, #e5e5e5 2px, transparent 2px);
    background-size: 40px 40px;
    background-position: -2px -2px;
  }
  .brutal-title span {
    color: #ff4b4b;
    text-shadow: 4px 4px 0px #111;
    letter-spacing: 0;
  }

  .header-text {
    flex: 1;
    text-align: center;
  }

  .tool-subtitle {
    font-family: 'Syne', sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    color: #111;
  }

  .pane-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    color: #111;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 3px solid #111;
    padding-bottom: 8px;
  }

  .config-item {
    margin-bottom: 20px;
  }

  .section-label {
    display: block;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1rem;
    font-weight: 800;
    color: #111;
    margin-bottom: 12px;
  }

  .color-input-wrapper {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .input-with-prefix {
    position: relative;
    flex: 1;
  }

  .prefix {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #111;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 800;
    z-index: 1;
  }

  .text-input {
    width: 100%;
    padding-left: 32px;
    font-size: 1.2rem;
    text-transform: uppercase;
  }

  :deep(.brutal-el-picker .el-color-picker__trigger) {
    border: 3px solid #111 !important;
    border-radius: 0 !important;
    box-shadow: 3px 3px 0px #111 !important;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
    width: 48px;
    height: 48px;
  }

  :deep(.brutal-el-picker .el-color-picker__trigger:hover) {
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0px #111 !important;
  }

  .ratio-result-card {
    background: #fffbe6;
    border: 3px solid #111;
    padding: 30px 24px;
    text-align: center;
  }

  .ratio-label {
    display: block;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    color: #111;
    margin-bottom: 8px;
  }

  .ratio-value {
    display: block;
    font-family: 'IBM Plex Mono', 'Syne', sans-serif;
    font-size: 3.5rem;
    font-weight: 900;
    margin-bottom: 12px;
    text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.1);
  }

  .brutal-badge {
    padding: 6px 16px;
    border: 3px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.95rem;
    box-shadow: 3px 3px 0px #111;
    display: inline-block;
  }

  .preview-box {
    width: 100%;
    min-height: 280px;
    border: 4px solid #111;
    padding: 40px;
    display: flex;
    align-items: center;
    transition: all 0.3s;
    overflow: hidden;
  }

  .preview-heading {
    font-size: 2.5rem;
    font-weight: 900;
    margin: 0 0 16px 0;
    letter-spacing: -1px;
    transition: color 0.3s;
  }

  .preview-text {
    font-size: 1.15rem;
    line-height: 1.8;
    margin-bottom: 32px;
    font-weight: 500;
    transition: color 0.3s;
  }

  .preview-ui {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .preview-btn {
    padding: 12px 28px;
    border: 3px solid;
    font-weight: 800;
    font-size: 1.05rem;
    cursor: pointer;
    box-shadow: 4px 4px 0px currentColor;
    transition:
      transform 0.15s,
      box-shadow 0.15s;
  }

  .preview-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px currentColor;
  }

  .preview-btn:active {
    transform: translate(2px, 2px);
    box-shadow: 0px 0px 0px currentColor;
  }

  .preview-link {
    font-weight: 800;
    font-size: 1.05rem;
    border-bottom: 3px solid;
    cursor: pointer;
    padding-bottom: 4px;
    transition: opacity 0.2s;
  }

  .preview-link:hover {
    opacity: 0.7;
  }

  .score-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 24px;
  }

  .score-card {
    border: 3px solid #111;
    display: flex;
    flex-direction: column;
  }

  .score-header {
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    border-bottom: 3px solid #111;
  }

  .score-level {
    font-family: 'Syne', sans-serif;
    font-size: 1.25rem;
    font-weight: 900;
    color: #111;
  }

  .score-req {
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-size: 0.85rem;
    font-weight: 700;
    color: #111;
  }

  .score-body {
    padding: 20px 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .score-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .score-row span:first-child {
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-size: 0.95rem;
    font-weight: 700;
    color: #111;
  }

  .pass-badge {
    padding: 6px 12px;
    border: 3px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.85rem;
    box-shadow: 2px 2px 0px #111;
  }

  .state-pass {
    background: #00e572;
    color: #111;
  }

  .state-fail {
    background: #ff4b4b;
    color: #fff;
  }

  .mt-4 {
    margin-top: 1rem;
  }
  .mt-8 {
    margin-top: 2rem;
  }
  .mt-2 {
    margin-top: 0.5rem;
  }
  .bg-cyan {
    background: #00ffff;
  }
  .bg-yellow {
    background: #ffd900;
  }
  .bg-white {
    background: #fff;
  }
</style>
