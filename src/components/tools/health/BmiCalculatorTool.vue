<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">健康<span>.BMI与体脂()</span></h1>
      </header>

      <div class="brutal-grid">
        <!-- Input Pane -->
        <div class="brutal-pane input-pane">
          <div class="pane-header bg-black"><span class="text-white">📝 输入数据</span></div>
          <div class="pane-body">
            <div class="form-group">
              <label>身高 (cm)</label>
              <div class="input-wrapper">
                <input
                  v-model.number="height"
                  type="number"
                  class="brutal-input"
                  placeholder="例如：175"
                />
                <span class="unit">cm</span>
              </div>
            </div>

            <div class="form-group">
              <label>体重 (kg)</label>
              <div class="input-wrapper">
                <input
                  v-model.number="weight"
                  type="number"
                  class="brutal-input"
                  placeholder="例如：65"
                />
                <span class="unit">kg</span>
              </div>
            </div>

            <div class="divider"></div>

            <h3 class="section-title">📊 BMI 标准参考 (中国)</h3>
            <table class="ref-table">
              <thead>
                <tr>
                  <th>等级</th>
                  <th>BMI 范围</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="dot thin"></span> 偏瘦</td>
                  <td>&lt; 18.5</td>
                </tr>
                <tr>
                  <td><span class="dot normal"></span> 正常</td>
                  <td>18.5 ~ 23.9</td>
                </tr>
                <tr>
                  <td><span class="dot heavy"></span> 超重</td>
                  <td>24.0 ~ 27.9</td>
                </tr>
                <tr>
                  <td><span class="dot fat"></span> 肥胖</td>
                  <td>&ge; 28.0</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Result Pane -->
        <div class="brutal-pane result-pane">
          <div class="pane-header bg-yellow"><span>🎯 诊断结果</span></div>
          <div v-if="!bmiResult" class="pane-body flex-center">
            <div class="empty-state">
              <span class="empty-icon">⚖️</span>
              <p>请输入您的身高和体重</p>
            </div>
          </div>

          <div v-else class="pane-body">
            <div
              class="bmi-showcase"
              :style="{ backgroundColor: bmiResult.color + '22', borderColor: bmiResult.color }"
            >
              <div class="bmi-value" :style="{ color: bmiResult.color }">{{ bmiResult.bmi }}</div>
              <div class="bmi-label" :style="{ backgroundColor: bmiResult.color }">
                {{ bmiResult.label }}
              </div>
            </div>

            <div class="bmi-scale">
              <div class="scale-bar">
                <div class="scale-segment thin"></div>
                <div class="scale-segment normal"></div>
                <div class="scale-segment heavy"></div>
                <div class="scale-segment fat"></div>
                <div class="pointer" :style="{ left: pointerPosition + '%' }">
                  <div class="pointer-triangle" :style="{ borderTopColor: bmiResult.color }"></div>
                </div>
              </div>
              <div class="scale-labels"><span>18.5</span><span>24.0</span><span>28.0</span></div>
              <div class="range-labels">
                <span>偏瘦</span><span>正常</span><span>超重</span><span>肥胖</span>
              </div>
            </div>

            <div class="suggestion-box">
              <h4>// 健康建议</h4>
              <p>
                您的健康体重范围应为：<br /><strong class="highlight-range">{{
                  healthyRange
                }}</strong>
              </p>
              <p v-if="weightDiff" class="to-health">
                {{ weightDiff.msg }}
                <strong :style="{ color: bmiResult.color }">{{ weightDiff.val }} kg</strong>
              </p>
            </div>

            <div class="disclaimer-brutal mt-auto">
              <strong>⚠️ 注意</strong>
              <p>BMI 结果仅供成年人参考，不适用于未成年人、孕妇、运动员等特殊人群。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';

  const height = ref('');
  const weight = ref('');

  const bmiResult = computed(() => {
    const h = parseFloat(height.value);
    const w = parseFloat(weight.value);
    if (!h || !w || h <= 0 || w <= 0) return null;

    const hM = h / 100;
    const bmi = w / (hM * hM);
    const bmiFixed = bmi.toFixed(1);

    let label = '';
    let color = '';
    if (bmi < 18.5) {
      label = '偏瘦';
      color = '#4b7bff';
    } else if (bmi < 24) {
      label = '正常';
      color = '#10b981';
    } else if (bmi < 28) {
      label = '超重';
      color = '#f59e0b';
    } else {
      label = '肥胖';
      color = '#ff4b4b';
    }

    return { bmi: bmiFixed, label, color, raw: bmi };
  });

  const pointerPosition = computed(() => {
    if (!bmiResult.value) return 0;
    const b = bmiResult.value.raw;
    let p = 0;
    if (b < 18.5) p = ((b - 10) / 8.5) * 25;
    else if (b < 24) p = 25 + ((b - 18.5) / 5.5) * 25;
    else if (b < 28) p = 50 + ((b - 24) / 4) * 25;
    else p = 75 + ((b - 28) / 7) * 25;
    return Math.max(0, Math.min(100, p));
  });

  const healthyRange = computed(() => {
    const h = parseFloat(height.value);
    if (!h) return '';
    const hM = h / 100;
    const min = (18.5 * hM * hM).toFixed(1);
    const max = (23.9 * hM * hM).toFixed(1);
    return `${min}kg ~ ${max}kg`;
  });

  const weightDiff = computed(() => {
    if (!bmiResult.value || !healthyRange.value) return null;
    const w = parseFloat(weight.value);
    const hM = parseFloat(height.value) / 100;
    if (bmiResult.value.raw < 18.5) {
      const target = 18.5 * hM * hM;
      return { msg: '建议增重', val: (target - w).toFixed(1) };
    } else if (bmiResult.value.raw > 24) {
      const target = 24 * hM * hM;
      return { msg: '建议减重', val: (w - target).toFixed(1) };
    }
    return null;
  });
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
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }

  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.5rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0 #4b7bff;
    flex: 1;
    text-align: center;
  }
  .brutal-title span {
    color: #4b7bff;
    text-shadow: 4px 4px 0 #111;
    letter-spacing: 0;
  }

  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 6px 6px 0 #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }
  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0 #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0 0 0 #111;
  }

  .brutal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2.5rem;
  }

  .brutal-pane {
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0 #111;
  }
  .pane-header {
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.25rem;
  }
  .bg-black {
    background: #111;
    color: white;
  }
  .bg-yellow {
    background: #ffd900;
  }
  .pane-body {
    padding: 2rem;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .flex-center {
    align-items: center;
    justify-content: center;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }
  .form-group label {
    display: block;
    font-weight: 800;
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
  }
  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }
  .brutal-input {
    width: 100%;
    padding: 1rem 3rem 1rem 1.25rem;
    font-size: 1.25rem;
    border: 4px solid #111;
    background: #fff;
    font-weight: 800;
    box-sizing: border-box;
    box-shadow: 4px 4px 0 #111;
    font-family: 'IBM Plex Mono', monospace;
    transition: all 0.1s;
  }
  .brutal-input:focus {
    outline: none;
    box-shadow: 6px 6px 0 #4b7bff;
    transform: translate(-2px, -2px);
  }
  .input-wrapper .unit {
    position: absolute;
    right: 1.25rem;
    font-weight: 800;
    font-size: 1.1rem;
    color: #111;
  }

  .divider {
    border-top: 4px dashed #111;
    margin: 2rem 0;
  }
  .section-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.3rem;
    font-weight: 800;
    margin-bottom: 1.5rem;
  }

  .ref-table {
    width: 100%;
    border-collapse: collapse;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: bold;
    border: 3px solid #111;
  }
  .ref-table th,
  .ref-table td {
    border: 2px solid #111;
    padding: 0.75rem 1rem;
    text-align: left;
  }
  .ref-table th {
    background: #ffd900;
    text-transform: uppercase;
  }
  .ref-table td {
    background: #fff;
  }

  .dot {
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 2px solid #111;
    border-radius: 50%;
    margin-right: 8px;
    vertical-align: middle;
  }
  .dot.thin {
    background: #4b7bff;
  }
  .dot.normal {
    background: #10b981;
  }
  .dot.heavy {
    background: #f59e0b;
  }
  .dot.fat {
    background: #ff4b4b;
  }

  .empty-state {
    text-align: center;
  }
  .empty-icon {
    font-size: 4rem;
    display: block;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  .empty-state p {
    font-size: 1.2rem;
    font-weight: bold;
    color: #666;
  }

  .bmi-showcase {
    border: 4px solid #111;
    border-radius: 12px;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 3rem;
    position: relative;
  }
  .bmi-value {
    font-size: 5rem;
    font-weight: 900;
    line-height: 1;
    text-shadow: 4px 4px 0 #111;
    font-family: 'Syne', sans-serif;
  }
  .bmi-label {
    padding: 0.5rem 1.5rem;
    color: white;
    font-weight: 800;
    font-size: 1.25rem;
    border: 3px solid #111;
    box-shadow: 4px 4px 0 #111;
    position: absolute;
    bottom: -1.25rem;
    transform: rotate(-5deg);
    text-transform: uppercase;
  }

  .bmi-scale {
    position: relative;
    margin: 2rem 0;
  }
  .scale-bar {
    display: flex;
    height: 24px;
    border: 4px solid #111;
    background: #fff;
    width: 100%;
    position: relative;
    overflow: hidden;
  }
  .scale-segment {
    flex: 1;
    height: 100%;
    border-right: 2px dashed #111;
  }
  .scale-segment:last-child {
    border-right: none;
  }
  .scale-segment.thin {
    background: #4b7bff;
  }
  .scale-segment.normal {
    background: #10b981;
  }
  .scale-segment.heavy {
    background: #f59e0b;
  }
  .scale-segment.fat {
    background: #ff4b4b;
  }

  .pointer {
    position: absolute;
    top: -14px;
    width: 0;
    height: 0;
    transform: translateX(-50%);
    transition: left 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    z-index: 10;
  }
  .pointer-triangle {
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 14px solid #111;
  }

  .scale-labels {
    position: relative;
    margin-top: 8px;
    font-weight: bold;
    font-size: 0.9rem;
    height: 20px;
  }
  .scale-labels span {
    position: absolute;
    transform: translateX(-50%);
  }
  .scale-labels span:nth-child(1) {
    left: 25%;
  }
  .scale-labels span:nth-child(2) {
    left: 50%;
  }
  .scale-labels span:nth-child(3) {
    left: 75%;
  }

  .range-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 0.5rem;
    font-weight: 800;
    text-transform: uppercase;
  }
  .range-labels span {
    flex: 1;
    text-align: center;
    font-size: 0.85rem;
  }

  .suggestion-box {
    background: #fdfae5;
    border: 4px solid #111;
    padding: 1.5rem;
    box-shadow: 6px 6px 0 #111;
    margin-top: 2rem;
  }
  .suggestion-box h4 {
    margin: 0 0 1rem;
    font-size: 1.2rem;
    font-family: 'Syne', sans-serif;
  }
  .suggestion-box p {
    margin: 0 0 0.5rem;
    font-size: 1rem;
    font-weight: 600;
  }
  .highlight-range {
    font-size: 1.5rem;
    font-family: 'Syne', sans-serif;
    display: block;
    margin-top: 0.5rem;
  }
  .to-health {
    margin-top: 1rem !important;
  }

  .disclaimer-brutal {
    border-top: 4px dashed #111;
    padding-top: 1rem;
    margin-top: auto;
    font-size: 0.85rem;
  }
  .disclaimer-brutal strong {
    display: block;
    margin-bottom: 0.5rem;
    color: #ff4b4b;
    font-weight: 800;
    font-size: 1rem;
  }

  @media (max-width: 900px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .brutal-title {
      font-size: 2.5rem;
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
  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .ref-table td,
  [data-theme='dark'] .scale-bar,
  [data-theme='dark'] .suggestion-box {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn {
    box-shadow: 6px 6px 0 #eee;
  }
  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 9px 9px 0 #eee;
  }
  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0 #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0 #eee;
  }
  [data-theme='dark'] .brutal-input {
    box-shadow: 4px 4px 0 #eee;
  }
  [data-theme='dark'] .input-wrapper .unit {
    color: #eee;
  }
  [data-theme='dark'] .divider,
  [data-theme='dark'] .disclaimer-brutal {
    border-color: #eee;
  }
  [data-theme='dark'] .bg-black {
    background: #222;
  }
  [data-theme='dark'] .bg-yellow,
  [data-theme='dark'] .ref-table th {
    background: #b28f00;
    color: #fff;
    border-color: #eee;
  }
  [data-theme='dark'] .pane-body {
    background: #1a1a1a;
  }
  [data-theme='dark'] .ref-table {
    border-color: #eee;
  }
  [data-theme='dark'] .ref-table th,
  [data-theme='dark'] .ref-table td {
    border-color: #eee;
  }
  [data-theme='dark'] .dot {
    border-color: #eee;
  }
  [data-theme='dark'] .bmi-showcase {
    border-color: #eee;
  }
  [data-theme='dark'] .bmi-label {
    border-color: #eee;
    box-shadow: 4px 4px 0 #eee;
    color: #111;
  }
  [data-theme='dark'] .scale-bar {
    border-color: #eee;
  }
  [data-theme='dark'] .pointer-triangle {
    border-top-color: #eee !important;
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .suggestion-box {
    box-shadow: 6px 6px 0 #eee;
  }
  [data-theme='dark'] .empty-state p {
    color: #aaa;
  }
</style>
