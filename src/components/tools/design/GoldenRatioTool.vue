<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">黄金<span>.比例()</span></h1>
        <span class="phi-badge">φ ≈ 1.618</span>
      </header>

      <div class="brutal-grid">
        <!-- 左侧输入面板 -->
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span>比例设置.CONFIG</span>
          </div>
          <div class="pane-content">
            <div class="config-item">
              <label class="config-label">基准数值</label>
              <input v-model.number="baseValue" type="number" class="brutal-input number-input" />
              <div class="unit-selector">
                <button
                  v-for="u in ['px', 'pt', 'rem', '%']"
                  :key="u"
                  class="unit-btn"
                  :class="{ active: unit === u }"
                  @click="unit = u"
                >
                  {{ u }}
                </button>
              </div>
            </div>

            <div class="phi-visual">
              <div class="phi-box">
                <div class="phi-a" :style="{ flex: 1.618 }">A</div>
                <div class="phi-b" :style="{ flex: 1 }">B</div>
              </div>
              <div class="phi-formula">A / B = 1.618</div>
            </div>

            <div class="config-item" style="margin-top: 2rem">
              <label class="config-label">常用基准</label>
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
        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">推导序列.SEQUENCE</span>
          </div>
          <div class="pane-content">
            <div class="results-grid">
              <div class="result-column">
                <h3 class="column-title up">向上扩展 (Larger)</h3>
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
                    <span class="copy-hint">复制</span>
                  </div>
                </div>
              </div>

              <div class="result-column">
                <h3 class="column-title down">向下细分 (Smaller)</h3>
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
                    <span class="copy-hint">复制</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="preview-section">
              <label class="config-label">比例预览 (A:B)</label>
              <div class="preview-boxes">
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
  const baseValue = ref(800);
  const unit = ref('px');
  const PHI_CONST = 1.61803398875;

  const largerValues = computed(() => {
    const vals: number[] = [];
    let current = baseValue.value;
    for (let i = 0; i < 5; i++) {
      current *= PHI_CONST;
      vals.push(current);
    }
    return vals;
  });

  const smallerValues = computed(() => {
    const vals: number[] = [];
    let current = baseValue.value;
    for (let i = 0; i < 5; i++) {
      current /= PHI_CONST;
      vals.push(current);
    }
    return vals;
  });

  const copyValue = async (val: number) => {
    const text = val.toFixed(1) + unit.value;
    await copyToClipboard(text, { success: `复制成功: ${text}` });
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

  .phi-badge {
    font-family: 'Syne', serif;
    font-size: 1.5rem;
    font-weight: 800;
    font-style: italic;
    background: #ffd900;
    border: 4px solid #111;
    padding: 0.5rem 1.25rem;
    box-shadow: 6px 6px 0px #111;
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

  .brutal-input {
    width: 100%;
    border: 3px solid #111;
    padding: 0.75rem 1rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    font-size: 1.25rem;
    background: #fff;
    outline: none;
    box-shadow: 3px 3px 0px #111;
    box-sizing: border-box;
    margin-bottom: 0.75rem;
  }
  .brutal-input:focus {
    box-shadow: 5px 5px 0px #111;
    transform: translate(-1px, -1px);
  }
  .number-input {
    color: #4b7bff;
  }

  .unit-selector {
    display: flex;
    gap: 0.5rem;
  }
  .unit-btn {
    flex: 1;
    padding: 0.5rem;
    border: 3px solid #111;
    background: #fff;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.1s;
  }
  .unit-btn.active {
    background: #ffd900;
  }
  .unit-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
  }

  .phi-visual {
    background: #ffd900;
    padding: 1.25rem;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    margin-top: 1.5rem;
  }
  .phi-box {
    display: flex;
    height: 40px;
    border: 2px solid #111;
    margin-bottom: 0.75rem;
    overflow: hidden;
  }
  .phi-a {
    background: #4b7bff;
    color: #fff;
  }
  .phi-b {
    background: #fff;
    color: #111;
  }
  .phi-a,
  .phi-b {
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 0.9rem;
    font-family: 'Syne', sans-serif;
  }
  .phi-formula {
    text-align: center;
    font-family: 'Syne', serif;
    font-style: italic;
    font-size: 1.1rem;
    font-weight: 800;
    color: #111;
  }

  .quick-bases {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }
  .preset-btn {
    padding: 0.5rem;
    border: 3px solid #111;
    background: #fff;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }
  .preset-btn:hover {
    background: #ffd900;
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }
  .preset-btn:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }

  .results-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
  }
  .column-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1rem;
    font-weight: 800;
    margin-bottom: 1rem;
    padding: 0.4rem 0.75rem;
    border: 2px solid #111;
    display: inline-block;
  }
  .column-title.up {
    background: #4b7bff;
    color: #fff;
  }
  .column-title.down {
    background: #ffd900;
    color: #111;
  }
  .result-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .result-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: #fff;
    border: 3px solid #111;
    cursor: pointer;
    transition: all 0.1s;
    box-shadow: 3px 3px 0px #111;
  }
  .result-card:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
    background: #ffd900;
  }
  .card-step {
    font-size: 0.75rem;
    color: #666;
    display: block;
  }
  .card-value {
    font-size: 1.1rem;
    font-weight: 700;
    font-family: 'IBM Plex Mono', monospace;
  }
  .card-value small {
    font-size: 0.7rem;
    margin-left: 2px;
    font-weight: 400;
    color: #888;
  }
  .copy-hint {
    font-size: 0.75rem;
    color: #aaa;
    font-weight: 600;
  }
  .result-card:hover .copy-hint {
    color: #111;
  }

  .preview-section {
    margin-top: 1.5rem;
  }
  .preview-boxes {
    display: flex;
    align-items: flex-end;
    gap: 1.5rem;
    background: #fff;
    padding: 2rem;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    margin-top: 0.75rem;
  }
  .preview-box-a,
  .preview-box-b {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 0.8rem;
    font-weight: 700;
    font-family: 'IBM Plex Mono', monospace;
    border: 3px solid #111;
  }
  .preview-box-a {
    background: #4b7bff;
  }
  .preview-box-b {
    background: #ffd900;
    color: #111;
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
    .results-grid {
      grid-template-columns: 1fr;
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
  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .unit-btn,
  [data-theme='dark'] .preset-btn,
  [data-theme='dark'] .result-card,
  [data-theme='dark'] .preview-boxes {
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
  [data-theme='dark'] .phi-badge {
    background: #b28f00;
    border-color: #eee;
    color: #fff;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .unit-btn {
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .unit-btn.active {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .preset-btn {
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .preset-btn:hover {
    background: #b28f00;
    color: #fff;
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .result-card {
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .result-card:hover {
    box-shadow: 5px 5px 0px #eee;
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .preview-boxes {
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .phi-visual {
    background: #b28f00;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
    color: #fff;
  }
  [data-theme='dark'] .phi-formula {
    color: #fff;
  }
  [data-theme='dark'] .column-title {
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
  [data-theme='dark'] .brutal-input {
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .brutal-input:focus {
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .preview-box-a {
    border-color: #eee;
  }
  [data-theme='dark'] .preview-box-b {
    border-color: #eee;
    background: #b28f00;
    color: #fff;
  }
</style>
