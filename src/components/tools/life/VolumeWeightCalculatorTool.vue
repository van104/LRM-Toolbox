<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">体积<span>.称重()</span></h1>
        <div style="width: 120px"></div>
      </header>

      <main class="main-content">
        <div class="brutal-pane calculator-card">
          <div class="pane-header bg-yellow">
            <span>📦 包裹尺寸 (cm)</span>
          </div>
          <div class="pane-body">
            <div class="dimension-inputs">
              <div class="dim-group">
                <label>长</label>
                <input
                  v-model.number="length"
                  type="number"
                  placeholder="0"
                  class="brutal-input dim-input"
                />
              </div>
              <div class="x-sign">×</div>
              <div class="dim-group">
                <label>宽</label>
                <input
                  v-model.number="width"
                  type="number"
                  placeholder="0"
                  class="brutal-input dim-input"
                />
              </div>
              <div class="x-sign">×</div>
              <div class="dim-group">
                <label>高</label>
                <input
                  v-model.number="height"
                  type="number"
                  placeholder="0"
                  class="brutal-input dim-input"
                />
              </div>
            </div>

            <div class="weight-row">
              <div class="dim-group">
                <label>实际重量 (kg)</label>
                <input
                  v-model.number="actualWeight"
                  type="number"
                  placeholder="0"
                  class="brutal-input"
                />
              </div>
              <div class="dim-group">
                <label>抛比系数</label>
                <select v-model.number="divisor" class="brutal-select">
                  <option value="6000">6000 (大多数快递)</option>
                  <option value="5000">5000 (DHL/FedEx/UPS)</option>
                  <option value="8000">8000 (部分零担物流)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="result-section">
          <div class="brutal-pane result-card">
            <div class="pane-header bg-blue text-white">
              <span>⚖️ 体积重量</span>
            </div>
            <div class="pane-body result-body">
              <div class="result-value">{{ formatWeight(volumeWeight) }} <small>kg</small></div>
              <div class="result-desc">计算公式: 长×宽×高 / {{ divisor }}</div>
            </div>
          </div>

          <div class="brutal-pane result-card" :class="{ 'highlight-card': chargeableWeight > 0 }">
            <div
              class="pane-header"
              :class="chargeableWeight > 0 ? 'bg-green' : 'bg-dark text-white'"
            >
              <span>💰 计费重量</span>
            </div>
            <div class="pane-body result-body">
              <div class="result-value big">
                {{ formatWeight(chargeableWeight) }} <small>kg</small>
              </div>
              <div
                v-if="chargeableWeight > 0"
                class="result-tag"
                :class="isVolumetric ? 'tag-warn' : 'tag-ok'"
              >
                {{ isVolumetric ? '按体积重计费 (抛货)' : '按实重计费' }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="chargeableWeight > 0" class="brutal-pane comparison-info">
          <div class="pane-header bg-dark text-white pt-1 pb-1">
            <span>📊 详情</span>
          </div>
          <div class="pane-body">
            <div class="info-row">
              <span>体积:</span>
              <span>{{ ((length * width * height) / 1000000).toFixed(4) }} m³</span>
            </div>
            <div v-if="isVolumetric" class="info-row danger-row">
              <span>额外付费重量:</span>
              <span class="danger">+{{ formatWeight(volumeWeight - actualWeight) }} kg</span>
            </div>
          </div>
        </div>

        <div class="brutal-pane tips-card">
          <div class="pane-header bg-blue text-white pt-1 pb-1">
            <span>💡 说明</span>
          </div>
          <div class="pane-body">
            <p>当体积重量大于实际重量时，物品被称为"抛货"或"泡货"，快递公司将按体积重量收费。</p>
            <p>国内快递通常除以 6000，国际四大快递（DHL/UPS/FedEx/TNT）通常除以 5000。</p>
          </div>
        </div>
      </main>

      <div class="brutal-status">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i">© 2026 LRM工具箱 - 快递体积重量计算器 // &nbsp;</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';

  const length = ref('');
  const width = ref('');
  const height = ref('');
  const actualWeight = ref('');
  const divisor = ref(6000);

  const volumeWeight = computed(() => {
    const l = parseFloat(length.value) || 0;
    const w = parseFloat(width.value) || 0;
    const h = parseFloat(height.value) || 0;
    if (l <= 0 || w <= 0 || h <= 0) return 0;
    return (l * w * h) / divisor.value;
  });

  const chargeableWeight = computed(() => {
    const actual = parseFloat(actualWeight.value) || 0;
    const vol = volumeWeight.value;
    if (actual <= 0 && vol <= 0) return 0;
    return Math.max(actual, vol);
  });

  const isVolumetric = computed(() => volumeWeight.value > (parseFloat(actualWeight.value) || 0));
  const formatWeight = val => val.toFixed(2);
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

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
    max-width: 700px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3rem;
    font-weight: 800;
    margin: 0;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #ffd900;
  }
  .brutal-title span {
    color: #ffd900;
    text-shadow: 4px 4px 0px #111;
  }
  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition: all 0.1s;
    color: #111;
  }
  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0 0 0 #111;
  }
  .bg-yellow {
    background: #ffd900;
  }
  .bg-blue {
    background: #4b7bff;
    color: #fff;
  }
  .bg-dark {
    background: #111;
    color: #fff;
  }
  .bg-green {
    background: #00e572;
  }
  .text-white {
    color: #fff;
  }
  .pt-1 {
    padding-top: 0.5rem;
  }
  .pb-1 {
    padding-bottom: 0.5rem;
  }
  .brutal-pane {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
  }
  .pane-body {
    padding: 1.5rem;
  }
  .main-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .dimension-inputs {
    display: flex;
    align-items: flex-end;
    gap: 0.75rem;
    margin-bottom: 2rem;
  }
  .dim-group {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .dim-group label {
    font-size: 0.9rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    display: block;
  }
  .x-sign {
    padding-bottom: 0.75rem;
    font-size: 1.5rem;
    font-weight: 900;
    color: #555;
  }
  .weight-row {
    display: flex;
    gap: 1.5rem;
  }

  .brutal-input {
    border: 3px solid #111;
    padding: 0.75rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 1.2rem;
    background: #fff;
    box-shadow: 3px 3px 0px #111;
    outline: none;
    transition: all 0.2s;
    width: 100%;
    box-sizing: border-box;
    text-align: center;
  }
  .brutal-input:focus {
    background: #ffd900;
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }
  .brutal-select {
    border: 3px solid #111;
    padding: 0.75rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 1rem;
    box-shadow: 3px 3px 0px #111;
    cursor: pointer;
    outline: none;
    background: #fff;
    width: 100%;
    box-sizing: border-box;
  }
  .brutal-select:focus {
    background: #fdfae5;
  }

  .result-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
  .result-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    min-height: 120px;
  }
  .result-value {
    font-size: 2rem;
    font-weight: 900;
    font-family: 'Syne', monospace;
    color: #111;
  }
  .result-value.big {
    font-size: 2.5rem;
  }
  .result-value small {
    font-size: 1rem;
    font-weight: 600;
  }
  .result-desc {
    font-size: 0.8rem;
    color: #555;
    margin-top: 0.5rem;
    font-weight: 700;
  }
  .result-tag {
    margin-top: 0.75rem;
    font-size: 0.85rem;
    font-weight: 800;
    padding: 4px 12px;
    border: 2px solid #111;
  }
  .tag-warn {
    background: #ffd900;
    color: #111;
  }
  .tag-ok {
    background: #00e572;
    color: #111;
  }
  .highlight-card {
    box-shadow: 8px 8px 0px #00e572;
  }

  .comparison-info .info-row {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
    border-bottom: 2px dashed #ccc;
    font-weight: 700;
    font-size: 1rem;
  }
  .comparison-info .info-row:last-child {
    border-bottom: none;
  }
  .danger {
    color: #ff4b4b;
    font-weight: 900;
    font-size: 1.1rem;
  }

  .tips-card .pane-body {
    font-size: 0.95rem;
    font-weight: 600;
    line-height: 1.7;
  }
  .tips-card .pane-body p {
    margin: 0 0 0.5rem;
  }
  .tips-card .pane-body p:last-child {
    margin-bottom: 0;
  }

  .brutal-status {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    padding: 1rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.2rem;
    overflow: hidden;
  }
  .marquee-wrapper {
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
  @media (max-width: 768px) {
    .brutal-title {
      font-size: 2rem;
    }
    .dimension-inputs {
      flex-wrap: wrap;
    }
    .result-section {
      grid-template-columns: 1fr;
    }
    .weight-row {
      flex-direction: column;
    }
  }

  /* Dark Mode */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-status {
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
    box-shadow: 0 0 0 #eee;
  }
  [data-theme='dark'] .brutal-pane {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
  }
  [data-theme='dark'] .bg-dark {
    background: #333;
  }
  [data-theme='dark'] .bg-green {
    background: #00994c;
  }
  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .brutal-select {
    background: #222;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-input:focus {
    background: #333;
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .result-value {
    color: #eee;
  }
  [data-theme='dark'] .result-desc {
    color: #aaa;
  }
  [data-theme='dark'] .result-tag {
    border-color: #eee;
  }
  [data-theme='dark'] .tag-warn {
    background: #b28f00;
  }
  [data-theme='dark'] .tag-ok {
    background: #00994c;
  }
  [data-theme='dark'] .highlight-card {
    box-shadow: 8px 8px 0px #00994c;
  }
  [data-theme='dark'] .comparison-info .info-row {
    border-bottom-color: #444;
  }
  [data-theme='dark'] .danger {
    color: #cc0000;
  }
  [data-theme='dark'] .x-sign {
    color: #aaa;
  }
  [data-theme='dark'] .brutal-status {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
</style>
