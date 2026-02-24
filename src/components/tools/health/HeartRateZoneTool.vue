<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">健康<span>.心率区间()</span></h1>
      </header>

      <main class="tool-content">
        <div class="brutal-grid-layout">
          <!-- Left Panel -->
          <aside class="sidebar-pane">
            <div class="brutal-pane">
              <div class="pane-header bg-black">
                <span class="text-white">❤️ 个人最大心率检测</span>
              </div>
              <div class="pane-body padding-large text-center">
                <div class="bpm-box mt-4">
                  <div class="heart-icon-wrapper">
                    <svg
                      viewBox="0 0 32 32"
                      class="heart-shape"
                      :style="{ animationDuration: pulseSpeed + 'ms' }"
                    >
                      <path
                        d="M16,28.261c0,0-14-9.926-14-16.261c0-3.452,2.323-6.294,5.5-6.881c3.551-0.656,6.866,1.48,8.5,4.643 c1.634-3.162,4.949-5.299,8.5-4.643c3.177,0.587,5.5,3.429,5.5,6.881C30,18.335,16,28.261,16,28.261z"
                      />
                    </svg>
                  </div>
                  <div class="bpm-value">
                    <span class="v-num">{{ maxHr }}</span>
                    <span class="v-label">MAX BPM</span>
                  </div>
                </div>

                <div class="input-controls mt-8">
                  <label>设定您的当前年龄</label>
                  <div class="age-display">{{ age }} <small>岁</small></div>
                  <input v-model="age" type="range" min="10" max="90" class="brutal-range" />

                  <div class="formula-tip mt-6">
                    <strong>最大心率 ≈ 220 - 年龄</strong>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <!-- Right Panel: Zones -->
          <section class="main-content-pane">
            <div class="zones-list">
              <div
                v-for="zone in zones"
                :key="zone.name"
                class="brutal-card zone-card relative-card"
                :class="zone.class"
              >
                <div class="zone-left">
                  <div class="zone-tag">{{ zone.range[0] }}%-{{ zone.range[1] }}%</div>
                  <h3 class="zone-title">{{ zone.name }}</h3>
                  <p class="zone-desc">{{ zone.desc }}</p>
                </div>

                <div class="zone-right">
                  <div class="bpm-range">
                    {{ Math.round((maxHr * zone.range[0]) / 100) }} -
                    {{ Math.round((maxHr * zone.range[1]) / 100) }}
                    <span class="unit">BPM</span>
                  </div>
                  <div class="benefit-badge">⚡ {{ zone.benefit }}</div>
                </div>

                <!-- Outline shadow block simulating progress -->
                <div class="zone-bg-fill" :style="{ width: zone.range[1] + '%' }"></div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer class="footer mt-8">© 2026 LRM工具箱 - 运动科学</footer>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';

  const age = ref(25);
  const maxHr = computed(() => 220 - (Number(age.value) || 0));

  const pulseSpeed = computed(() => {
    const bpm = maxHr.value;
    return (60 / bpm) * 1000;
  });

  const zones = [
    {
      name: '极限区间 (VO2 Max)',
      range: [90, 100],
      class: 'zone-5',
      desc: '冲刺训练，极度疲劳',
      benefit: '最大冲刺速度'
    },
    {
      name: '无氧耐力 (Anaerobic)',
      range: [80, 90],
      class: 'zone-4',
      desc: '强力运动，肌肉酸痛',
      benefit: '高速耐力 & 乳酸阈值'
    },
    {
      name: '有氧耐力 (Aerobic)',
      range: [70, 80],
      class: 'zone-3',
      desc: '稳态训练，出汗明显',
      benefit: '心肺功能 & 效率'
    },
    {
      name: '燃脂/恢复 (Fat Burn)',
      range: [60, 70],
      class: 'zone-2',
      desc: '轻松慢跑，呼吸均匀',
      benefit: '基础体能 & 脂肪燃烧'
    },
    {
      name: '热身/放松 (Warm Up)',
      range: [50, 60],
      class: 'zone-1',
      desc: '极轻运动，用于热身',
      benefit: '血液循环 & 恢复'
    }
  ];
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
    margin-bottom: 3rem;
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

  .brutal-grid-layout {
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: 3rem;
  }

  .brutal-pane {
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0 #111;
    min-width: 0;
    position: sticky;
    top: 100px;
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
  .pane-body {
    padding: 2rem;
  }
  .padding-large {
    padding: 3rem;
  }
  .text-center {
    text-align: center;
  }

  .bpm-box {
    position: relative;
    width: 100%;
    max-width: 250px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 4px dashed #111;
    padding: 3rem;
    background: #fff1f2;
  }

  .heart-icon-wrapper {
    z-index: 1;
  }
  .heart-shape {
    width: 120px;
    fill: #ff4b4b;
    animation: pulse 1s infinite;
    filter: drop-shadow(4px 4px 0 #111);
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    15% {
      transform: scale(1.15);
    }
    30% {
      transform: scale(1);
    }
    45% {
      transform: scale(1.05);
    }
    60% {
      transform: scale(1);
    }
  }

  .bpm-value {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-shadow: 2px 2px 0 #111;
    color: #fff;
    z-index: 2;
  }
  .v-num {
    font-size: 3rem;
    font-weight: 900;
    line-height: 1;
    font-family: 'Syne', sans-serif;
  }
  .v-label {
    font-size: 0.9rem;
    font-weight: 900;
    background: #111;
    color: #fff;
    padding: 0.1rem 0.5rem;
    margin-top: 0.5rem;
    text-shadow: none;
  }

  .input-controls label {
    font-size: 1.1rem;
    font-weight: 900;
    display: block;
    margin-bottom: 0.5rem;
    font-family: 'Noto Sans SC', sans-serif;
  }
  .age-display {
    font-size: 3rem;
    font-weight: 900;
    font-family: 'Syne', sans-serif;
    line-height: 1;
    margin-bottom: 1.5rem;
    color: #4b7bff;
    text-shadow: 2px 2px 0 #111;
  }
  .age-display small {
    font-size: 1rem;
    color: #111;
    font-weight: 900;
    text-shadow: none;
    font-family: 'Noto Sans SC', sans-serif;
  }

  .brutal-range {
    -webkit-appearance: none;
    width: 100%;
    height: 16px;
    background: #fff;
    border: 3px solid #111;
    border-radius: 8px;
    outline: none;
    transition: background 0.2s;
    box-shadow: 4px 4px 0 #111;
  }
  .brutal-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #4b7bff;
    cursor: pointer;
    border: 3px solid #111;
  }
  .brutal-range::-moz-range-thumb {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #4b7bff;
    cursor: pointer;
    border: 3px solid #111;
  }

  .formula-tip {
    border: 3px dashed #111;
    background: #fdfae5;
    padding: 1rem;
    font-size: 1.1rem;
  }

  .zones-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  .brutal-card {
    border: 4px solid #111;
    padding: 1.5rem 2rem;
    background: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    overflow: hidden;
    z-index: 1;
  }
  .relative-card {
    transition: transform 0.1s;
    box-shadow: 10px 10px 0 #111;
  }
  .relative-card:hover {
    transform: translate(-3px, -3px);
    box-shadow: 13px 13px 0 #111;
  }

  .zone-left {
    position: relative;
    z-index: 2;
    flex: 1;
  }
  .zone-tag {
    display: inline-block;
    padding: 4px 8px;
    border: 2px solid #111;
    font-size: 0.85rem;
    font-weight: 900;
    font-family: 'IBM Plex Mono', monospace;
    margin-bottom: 0.5rem;
    background: #fff;
  }
  .zone-title {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    font-weight: 900;
    font-family: 'Syne', sans-serif;
    text-transform: uppercase;
  }
  .zone-desc {
    margin: 0;
    font-size: 1rem;
    font-weight: bold;
    color: #444;
  }

  .zone-right {
    position: relative;
    z-index: 2;
    text-align: right;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5rem;
  }
  .bpm-range {
    font-size: 2.5rem;
    font-weight: 900;
    font-family: 'IBM Plex Mono', monospace;
    line-height: 1;
  }
  .bpm-range .unit {
    font-size: 1rem;
    font-weight: 900;
    margin-left: 0.2rem;
  }
  .benefit-badge {
    border: 2px dashed #111;
    background: #fff;
    padding: 4px 10px;
    font-weight: 900;
    font-size: 0.85rem;
  }

  .zone-bg-fill {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    z-index: 0;
    opacity: 0.2;
  }

  /* Zone Types */
  .zone-5 .zone-bg-fill {
    background: #ff4b4b;
    opacity: 0.3;
  }
  .zone-5 .zone-tag {
    background: #ff4b4b;
    color: white;
  }
  .zone-5 .bpm-range {
    color: #ff4b4b;
    text-shadow: 2px 2px 0 #111;
  }

  .zone-4 .zone-bg-fill {
    background: #f59e0b;
    opacity: 0.3;
  }
  .zone-4 .zone-tag {
    background: #f59e0b;
    color: white;
  }
  .zone-4 .bpm-range {
    color: #f59e0b;
    text-shadow: 2px 2px 0 #111;
  }

  .zone-3 .zone-bg-fill {
    background: #10b981;
    opacity: 0.3;
  }
  .zone-3 .zone-tag {
    background: #10b981;
    color: white;
  }
  .zone-3 .bpm-range {
    color: #10b981;
    text-shadow: 2px 2px 0 #111;
  }

  .zone-2 .zone-bg-fill {
    background: #4b7bff;
    opacity: 0.3;
  }
  .zone-2 .zone-tag {
    background: #4b7bff;
    color: white;
  }
  .zone-2 .bpm-range {
    color: #4b7bff;
    text-shadow: 2px 2px 0 #111;
  }

  .zone-1 .zone-bg-fill {
    background: #cbd5e1;
    opacity: 0.5;
  }
  .zone-1 .zone-tag {
    background: #fff;
    color: #111;
  }
  .zone-1 .bpm-range {
    color: #555;
    text-shadow: 1px 1px 0 #fff;
  }

  .mt-4 {
    margin-top: 1rem;
  }
  .mt-6 {
    margin-top: 1.5rem;
  }
  .mt-8 {
    margin-top: 2rem;
  }
  .footer {
    text-align: center;
    font-weight: 900;
  }

  @media (max-width: 900px) {
    .brutal-grid-layout {
      grid-template-columns: 1fr;
    }
    .brutal-title {
      font-size: 2.2rem;
    }
    .brutal-pane {
      position: static;
    }
    .zone-card {
      flex-direction: column;
      align-items: flex-start;
      gap: 1.5rem;
    }
    .zone-right {
      align-items: flex-start;
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
  [data-theme='dark'] .brutal-card,
  [data-theme='dark'] .bpm-box,
  [data-theme='dark'] .brutal-range,
  [data-theme='dark'] .formula-tip,
  [data-theme='dark'] .zone-tag,
  [data-theme='dark'] .benefit-badge {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-card,
  [data-theme='dark'] .brutal-range {
    box-shadow: 6px 6px 0 #eee;
  }
  [data-theme='dark'] .brutal-btn:hover,
  [data-theme='dark'] .relative-card:hover {
    box-shadow: 9px 9px 0 #eee;
  }
  [data-theme='dark'] .relative-card {
    box-shadow: 10px 10px 0 #eee;
  }
  [data-theme='dark'] .relative-card:hover {
    box-shadow: 13px 13px 0 #eee;
  }

  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0 #eee;
  }

  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .bg-black {
    background: #222;
  }

  [data-theme='dark'] .age-display {
    color: #6b8cff;
    text-shadow: 2px 2px 0 #eee;
  }
  [data-theme='dark'] .age-display small {
    color: #eee;
  }

  [data-theme='dark'] .formula-tip {
    background: #332200;
  }
  [data-theme='dark'] .zone-desc {
    color: #ccc;
  }

  [data-theme='dark'] .zone-5 .zone-bg-fill {
    background: #660000;
    opacity: 0.5;
  }
  [data-theme='dark'] .zone-5 .zone-tag {
    background: #ff4b4b;
    border-color: #eee;
  }
  [data-theme='dark'] .zone-5 .bpm-range {
    text-shadow: 2px 2px 0 #eee;
  }

  [data-theme='dark'] .zone-4 .zone-bg-fill {
    background: #663300;
    opacity: 0.5;
  }
  [data-theme='dark'] .zone-4 .zone-tag {
    background: #f59e0b;
    border-color: #eee;
  }
  [data-theme='dark'] .zone-4 .bpm-range {
    text-shadow: 2px 2px 0 #eee;
  }

  [data-theme='dark'] .zone-3 .zone-bg-fill {
    background: #003322;
    opacity: 0.5;
  }
  [data-theme='dark'] .zone-3 .zone-tag {
    background: #10b981;
    border-color: #eee;
  }
  [data-theme='dark'] .zone-3 .bpm-range {
    text-shadow: 2px 2px 0 #eee;
  }

  [data-theme='dark'] .zone-2 .zone-bg-fill {
    background: #002266;
    opacity: 0.5;
  }
  [data-theme='dark'] .zone-2 .zone-tag {
    background: #4b7bff;
    border-color: #eee;
  }
  [data-theme='dark'] .zone-2 .bpm-range {
    text-shadow: 2px 2px 0 #eee;
  }

  [data-theme='dark'] .zone-1 .zone-bg-fill {
    background: #333;
    opacity: 0.5;
  }
  [data-theme='dark'] .zone-1 .zone-tag {
    background: #1a1a1a;
    border-color: #eee;
  }
  [data-theme='dark'] .zone-1 .bpm-range {
    color: #aaa;
    text-shadow: 2px 2px 0 #eee;
  }
</style>
