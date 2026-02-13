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
        <h1 class="tool-title">色彩对比度检测</h1>
        <span class="tool-subtitle">Contrast Checker</span>
      </div>
      <div class="header-right">
        <el-button type="primary" plain @click="swapColors">
          <el-icon><Refresh /></el-icon>
          交换颜色
        </el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="tool-layout">
        <!-- 左侧输入面板 -->
        <div class="tool-sidebar">
          <div class="panel glass-card">
            <h2 class="panel-title">
              <el-icon><Brush /></el-icon> 颜色配置
            </h2>

            <div class="config-item">
              <label class="section-label">背景颜色 (Background)</label>
              <div class="color-input-wrapper">
                <el-color-picker v-model="bgColor" show-alpha size="large" />
                <div class="input-with-prefix">
                  <span class="prefix">#</span>
                  <input v-model="bgColorClean" type="text" class="text-input" maxlength="8" />
                </div>
              </div>
            </div>

            <div class="config-item">
              <label class="section-label">文字颜色 (Text)</label>
              <div class="color-input-wrapper">
                <el-color-picker v-model="textColor" show-alpha size="large" />
                <div class="input-with-prefix">
                  <span class="prefix">#</span>
                  <input v-model="textColorClean" type="text" class="text-input" maxlength="8" />
                </div>
              </div>
            </div>

            <div class="ratio-result-card mt-8">
              <span class="ratio-label">对比度比率</span>
              <span class="ratio-value" :style="{ color: statusColor }"
                >{{ contrastRatio.toFixed(2) }}:1</span
              >
              <div class="status-indicator">
                <el-tag :type="statusType" effect="dark" size="large">
                  {{ statusLabel }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧预览面板 -->
        <div class="tool-main">
          <div class="panel glass-card">
            <h2 class="panel-title">效果预览</h2>
            <div class="preview-box" :style="{ backgroundColor: bgColor }">
              <div class="preview-content" :style="{ color: textColor }">
                <h1 class="preview-heading">这是大标题预览</h1>
                <p class="preview-text">
                  色彩对比度是指两种颜色之间的亮度差异。良好的对比度能够提高网页的无障碍访问性（Accessibility），让视力障碍、色盲或者是处于强光环境下的用户也能清晰读阅内容。
                </p>
                <div class="preview-ui">
                  <button class="preview-btn" :style="{ color: textColor, borderColor: textColor }">
                    操作按钮
                  </button>
                  <span class="preview-link" :style="{ borderBottomColor: textColor }"
                    >点击了解更多</span
                  >
                </div>
              </div>
            </div>

            <div class="scores-section mt-8">
              <h3 class="section-label">WCAG 2.1 达标判定</h3>
              <div class="score-grid">
                <div v-for="score in wcagScores" :key="score.level" class="score-card">
                  <div class="score-header">
                    <span class="score-level">{{ score.level }}</span>
                    <span class="score-req">{{ score.requirement }}</span>
                  </div>
                  <div class="score-body">
                    <div class="score-row">
                      <span>普通文字 (Normal)</span>
                      <el-tag
                        :type="score.normalPass ? 'success' : 'danger'"
                        size="small"
                        effect="plain"
                      >
                        {{ score.normalPass ? '通过' : '未通过' }}
                      </el-tag>
                    </div>
                    <div class="score-row">
                      <span>大号文字 (Large)</span>
                      <el-tag
                        :type="score.largePass ? 'success' : 'danger'"
                        size="small"
                        effect="plain"
                      >
                        {{ score.largePass ? '通过' : '未通过' }}
                      </el-tag>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - 色彩对比度检测</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { ArrowLeft, Refresh, Brush } from '@element-plus/icons-vue';
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
    const types = { success: '#67c23a', warning: '#e6a23c', danger: '#f56c6c' };
    return types[statusType.value as 'success' | 'warning' | 'danger'];
  });

  const statusLabel = computed(() => {
    if (contrastRatio.value >= 7) return '非常优秀 (AAA)';
    if (contrastRatio.value >= 4.5) return '良好 (AA)';
    if (contrastRatio.value >= 3) return '一般 (仅大块图形)';
    return '对比度不足';
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
      grid-template-columns: 1fr 2fr;
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
    margin-bottom: 20px;
  }

  .section-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
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
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
  }

  .text-input {
    width: 100%;
    padding: 8px 12px 8px 24px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-family: monospace;
    font-size: 1rem;
    outline: none;
    transition: all 0.2s;
  }

  .text-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }

  .ratio-result-card {
    background: #f8fafc;
    border-radius: 12px;
    padding: 24px;
    text-align: center;
    border: 1px dashed #cbd5e1;
  }

  .ratio-label {
    display: block;
    font-size: 0.9rem;
    color: #64748b;
    margin-bottom: 8px;
  }

  .ratio-value {
    display: block;
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 12px;
  }

  .preview-box {
    width: 100%;
    min-height: 280px;
    border-radius: 16px;
    padding: 40px;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    transition: all 0.3s;
  }

  .preview-heading {
    font-size: 2rem;
    font-weight: 800;
    margin: 0 0 16px 0;
  }

  .preview-text {
    font-size: 1.125rem;
    line-height: 1.7;
    margin-bottom: 24px;
    opacity: 0.95;
  }

  .preview-ui {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .preview-btn {
    background: transparent;
    padding: 10px 24px;
    border: 2px solid;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }

  .preview-link {
    font-weight: 500;
    border-bottom: 2px solid;
    cursor: pointer;
  }

  .score-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
  }

  .score-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    overflow: hidden;
  }

  .score-header {
    padding: 12px 16px;
    background: #f1f5f9;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .score-level {
    font-weight: 700;
    color: #1e293b;
  }

  .score-req {
    font-size: 0.75rem;
    color: #64748b;
  }

  .score-body {
    padding: 16px;
  }

  .score-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .score-row span {
    font-size: 0.9rem;
    color: #475569;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }

  .mt-8 {
    margin-top: 2rem;
  }

  @media (max-width: 640px) {
    .tool-title {
      font-size: 1.1rem;
    }
    .header-left,
    .header-right {
      width: 80px;
    }
    .preview-box {
      padding: 20px;
    }
    .preview-heading {
      font-size: 1.5rem;
    }
  }
</style>
