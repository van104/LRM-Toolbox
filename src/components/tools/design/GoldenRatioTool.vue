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
        <h1 class="tool-title">黄金比例计算器</h1>
        <span class="tool-subtitle">Golden Ratio Calculator</span>
      </div>
      <div class="header-right">
        <span class="phi-text">φ ≈ 1.618</span>
      </div>
    </header>

    <main class="tool-content">
      <div class="tool-layout">
        <!-- 左侧输入面板 -->
        <div class="tool-sidebar">
          <div class="panel glass-card">
            <h2 class="panel-title">
              <el-icon><Crop /></el-icon> 比例设置
            </h2>

            <div class="config-item">
              <label class="section-label">基准数值</label>
              <div class="input-with-controls">
                <input v-model.number="baseValue" type="number" class="main-number-input" />
                <div class="unit-selector">
                  <button
                    v-for="u in ['px', 'pt', 'rem', '%']"
                    :key="u"
                    class="mini-tab"
                    :class="{ active: unit === u }"
                    @click="unit = u"
                  >
                    {{ u }}
                  </button>
                </div>
              </div>
            </div>

            <div class="phi-visual mt-8">
              <div class="phi-box">
                <div class="phi-a" :style="{ flex: 1.618 }">A</div>
                <div class="phi-b" :style="{ flex: 1 }">B</div>
              </div>
              <div class="phi-formula">A / B = 1.618</div>
            </div>

            <div class="presets-section mt-8">
              <label class="section-label">常用基准</label>
              <div class="quick-bases">
                <button
                  v-for="val in [100, 400, 800, 1024, 1280, 1920]"
                  :key="val"
                  class="preset-btn"
                  @click="baseValue = val"
                >
                  {{ val }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧结果面板 -->
        <div class="tool-main">
          <div class="panel glass-card">
            <h2 class="panel-title">推导序列</h2>

            <div class="results-grid">
              <div class="result-column larger">
                <h3 class="column-title">向上扩展 (Larger)</h3>
                <div class="result-list">
                  <div
                    v-for="(val, i) in largerValues"
                    :key="'l' + i"
                    class="result-card"
                    @click="copyValue(val)"
                  >
                    <div class="card-info">
                      <span class="card-step">φ^{{ i + 1 }}</span>
                      <span class="card-value"
                        >{{ val.toFixed(1) }}<small>{{ unit }}</small></span
                      >
                    </div>
                    <el-icon class="copy-hint"><CopyDocument /></el-icon>
                  </div>
                </div>
              </div>

              <div class="result-column smaller">
                <h3 class="column-title">向下细分 (Smaller)</h3>
                <div class="result-list">
                  <div
                    v-for="(val, i) in smallerValues"
                    :key="'s' + i"
                    class="result-card"
                    @click="copyValue(val)"
                  >
                    <div class="card-info">
                      <span class="card-step">1/φ^{{ i + 1 }}</span>
                      <span class="card-value"
                        >{{ val.toFixed(1) }}<small>{{ unit }}</small></span
                      >
                    </div>
                    <el-icon class="copy-hint"><CopyDocument /></el-icon>
                  </div>
                </div>
              </div>
            </div>

            <div class="preview-section mt-8">
              <h3 class="section-label">比例预览 (A:B)</h3>
              <div class="preview-area">
                <div class="preview-box-a" :style="{ width: '120px', height: '120px' }">
                  <span>{{ baseValue }}{{ unit }}</span>
                </div>
                <div
                  class="preview-box-b"
                  :style="{ width: 120 / PHI_CONST + 'px', height: 120 / PHI_CONST + 'px' }"
                >
                  <span>{{ (baseValue / PHI_CONST).toFixed(1) }}{{ unit }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - 黄金比例计算器</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { ArrowLeft, Crop, CopyDocument } from '@element-plus/icons-vue';
  import { useCopy } from '@/composables/useCopy';

  const { copyToClipboard } = useCopy();

  const baseValue = ref(800);
  const unit = ref('px');
  const PHI_CONST = 1.61803398875;

  const largerValues = computed(() => {
    const vals = [];
    let current = baseValue.value;
    for (let i = 0; i < 5; i++) {
      current *= PHI_CONST;
      vals.push(current);
    }
    return vals;
  });

  const smallerValues = computed(() => {
    const vals = [];
    let current = baseValue.value;
    for (let i = 0; i < 5; i++) {
      current /= PHI_CONST;
      vals.push(current);
    }
    return vals;
  });

  const copyValue = async (val: number) => {
    const text = val.toFixed(1) + unit.value;
    await copyToClipboard(text, {
      success: `复制成功: ${text}`
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
    color: #94a3b8;
    font-family: serif;
    font-style: italic;
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
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .input-with-controls {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .main-number-input {
    width: 100%;
    padding: 12px 16px;
    font-size: 1.25rem;
    font-family: monospace;
    font-weight: 600;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    outline: none;
    background: #f8fafc;
    color: #3b82f6;
    transition: all 0.2s;
  }

  .main-number-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    background: white;
  }

  .unit-selector {
    display: flex;
    background: #f1f5f9;
    padding: 4px;
    border-radius: 8px;
  }

  .mini-tab {
    flex: 1;
    padding: 6px;
    border: none;
    background: transparent;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    color: #64748b;
    cursor: pointer;
  }

  .mini-tab.active {
    background: white;
    color: #3b82f6;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .phi-visual {
    background: #f8fafc;
    padding: 20px;
    border-radius: 12px;
    border: 1px dashed #cbd5e1;
  }

  .phi-box {
    display: flex;
    height: 36px;
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 12px;
  }

  .phi-a {
    background: #3b82f6;
    color: white;
  }
  .phi-b {
    background: #e2e8f0;
    color: #64748b;
  }
  .phi-a,
  .phi-b {
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.85rem;
  }

  .phi-formula {
    text-align: center;
    font-family: 'Times New Roman', serif;
    font-style: italic;
    font-size: 1rem;
    color: #94a3b8;
  }

  .quick-bases {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .preset-btn {
    padding: 6px;
    border: 1px solid #e2e8f0;
    background: white;
    border-radius: 6px;
    font-size: 0.8rem;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;
  }

  .preset-btn:hover {
    border-color: #3b82f6;
    color: #3b82f6;
    background: #f0f7ff;
  }

  .results-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  @media (max-width: 640px) {
    .results-grid {
      grid-template-columns: 1fr;
    }
  }

  .column-title {
    font-size: 0.95rem;
    color: #64748b;
    margin-bottom: 16px;
    padding-left: 10px;
    border-left: 3px solid #3b82f6;
  }

  .result-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .result-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #f8fafc;
    border: 1px solid #f1f5f9;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .result-card:hover {
    transform: translateX(4px);
    background: #f0f7ff;
    border-color: #3b82f6;
  }

  .card-step {
    font-size: 0.75rem;
    color: #94a3b8;
    display: block;
  }

  .card-value {
    font-size: 1.125rem;
    font-weight: 700;
    color: #1e293b;
    font-family: monospace;
  }

  .card-value small {
    font-size: 0.75rem;
    margin-left: 4px;
    font-weight: normal;
    color: #94a3b8;
  }

  .copy-hint {
    color: #cbd5e1;
    font-size: 0.9rem;
  }

  .result-card:hover .copy-hint {
    color: #3b82f6;
  }

  .preview-area {
    display: flex;
    align-items: flex-end;
    gap: 24px;
    background: #f8fafc;
    padding: 30px;
    border-radius: 16px;
    border: 1px solid #f1f5f9;
  }

  .preview-box-a,
  .preview-box-b {
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .preview-box-a {
    background: #3b82f6;
  }
  .preview-box-b {
    background: #f59e0b;
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
    .results-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
