<template>
  <div class="tool-container">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>心率区间计算器</h1>
        <span class="nav-subtitle">Heart Rate Zone & Training Intensity</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="dashboard-grid">
        <!-- 左侧：输入与核心指标 -->
        <div class="input-card glass-card">
          <div class="bpm-circle-wrapper">
            <div class="heart-icon-wrapper">
              <el-icon class="pulse-icon" :style="{ animationDuration: pulseSpeed + 'ms' }"
                ><magic-stick
              /></el-icon>
              <!-- 这里用自定义 SVG 或 Element Plus 图标模拟心跳 -->
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
              {{ maxHr }}
              <span class="label">MHR</span>
            </div>
          </div>

          <div class="input-controls">
            <label>您的年龄</label>
            <div class="age-display">{{ age }} <small>岁</small></div>
            <el-slider v-model="age" :min="10" :max="90" :show-tooltip="false" class="age-slider" />
            <p class="formula-tip">最大心率 ≈ 220 - 年龄</p>
          </div>
        </div>

        <!-- 右侧：区间列表 -->
        <div class="zones-list">
          <div v-for="zone in zones" :key="zone.name" class="zone-item" :class="zone.class">
            <div class="zone-left">
              <div class="zone-tag">{{ zone.range[0] }}%-{{ zone.range[1] }}%</div>
              <h3 class="zone-title">{{ zone.name }}</h3>
              <p class="zone-desc">{{ zone.desc }}</p>
            </div>

            <div class="zone-right">
              <div class="bpm-range">
                {{ Math.round((maxHr * zone.range[0]) / 100) }} -
                {{ Math.round((maxHr * zone.range[1]) / 100) }}
                <span class="unit">bpm</span>
              </div>
              <div class="benefit-badge">
                <el-icon><Trophy /></el-icon> {{ zone.benefit }}
              </div>
            </div>

            <!-- 进度条装饰 -->
            <div class="zone-progress-bg">
              <div class="zone-progress-fill" :style="{ width: zone.range[1] + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 运动科学</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { Back, Trophy, MagicStick } from '@element-plus/icons-vue';

  const age = ref(25);
  const maxHr = computed(() => 220 - (age.value || 0));

  // 模拟心跳速度：最大心率越快，跳动越快（动画时间越短）
  // Base 600ms for 220 bpm? No, animation logic:
  // Let's just map 220-age to a reasonable animation duration for visual effect
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
  .tool-container {
    min-height: 100vh;
    background: #f8fafc;
    font-family: 'Inter', system-ui, sans-serif;
    color: #334155;
  }

  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    padding: 1rem 1.5rem;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    color: #64748b;
    width: 80px;
  }

  .nav-center {
    flex: 1;
    text-align: center;
  }

  .nav-center h1 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .nav-subtitle {
    font-size: 0.8rem;
    color: #64748b;
  }

  .nav-spacer {
    width: 80px;
  }

  .main-content {
    max-width: 900px;
    margin: 2rem auto;
    padding: 0 1.5rem;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 2rem;
    align-items: start;
  }

  /* Left Panel Styles */
  .input-card {
    background: white;
    border-radius: 20px;
    padding: 2.5rem 2rem;
    text-align: center;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
    position: sticky;
    top: 100px;
  }

  .bpm-circle-wrapper {
    position: relative;
    width: 180px;
    height: 180px;
    margin: 0 auto 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle, #fee2e2 0%, transparent 70%);
  }

  .heart-shape {
    width: 100px;
    fill: #ef4444;
    animation: pulse 1s infinite;
    filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.4));
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
    font-size: 2.5rem;
    font-weight: 800;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    line-height: 1;
  }

  .bpm-value .label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    opacity: 0.9;
    margin-top: 4px;
  }

  .input-controls label {
    display: block;
    color: #64748b;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }

  .age-display {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1e293b;
    line-height: 1;
    margin-bottom: 1rem;
  }

  .age-display small {
    font-size: 1rem;
    color: #94a3b8;
    font-weight: 500;
  }

  .age-slider {
    margin-bottom: 1rem;
    --el-slider-main-bg-color: #ef4444;
  }

  .formula-tip {
    font-size: 0.8rem;
    color: #94a3b8;
    background: #f1f5f9;
    padding: 0.5rem;
    border-radius: 6px;
    display: inline-block;
  }

  /* Right Panel Styles (Zone List) */
  .zones-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .zone-item {
    background: white;
    border-radius: 16px;
    padding: 1.25rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    transition:
      transform 0.2s,
      box-shadow 0.2s;
  }

  .zone-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  }

  .zone-left {
    position: relative;
    z-index: 2;
    flex: 1;
  }

  .zone-tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
    text-transform: uppercase;
  }

  .zone-title {
    margin: 0 0 0.25rem 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: #1e293b;
  }

  .zone-desc {
    margin: 0;
    font-size: 0.85rem;
    color: #64748b;
  }

  .zone-right {
    position: relative;
    z-index: 2;
    text-align: right;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
  }

  .bpm-range {
    font-size: 1.5rem;
    font-weight: 800;
    color: #0f172a;
  }

  .bpm-range .unit {
    font-size: 0.75rem;
    color: #94a3b8;
    font-weight: 600;
  }

  .benefit-badge {
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    gap: 4px;
    color: #475569;
    background: #f8fafc;
    padding: 2px 8px;
    border-radius: 99px;
  }

  /* Theme Specific Colors */
  .zone-5 .zone-tag {
    color: #b91c1c;
    background: #fecaca;
  }
  .zone-5 .bpm-range {
    color: #dc2626;
  }
  .zone-5 {
    border-left: 6px solid #ef4444;
  }

  .zone-4 .zone-tag {
    color: #b45309;
    background: #fde68a;
  }
  .zone-4 .bpm-range {
    color: #d97706;
  }
  .zone-4 {
    border-left: 6px solid #f59e0b;
  }

  .zone-3 .zone-tag {
    color: #047857;
    background: #a7f3d0;
  }
  .zone-3 .bpm-range {
    color: #059669;
  }
  .zone-3 {
    border-left: 6px solid #10b981;
  }

  .zone-2 .zone-tag {
    color: #1d4ed8;
    background: #bfdbfe;
  }
  .zone-2 .bpm-range {
    color: #2563eb;
  }
  .zone-2 {
    border-left: 6px solid #3b82f6;
  }

  .zone-1 .zone-tag {
    color: #334155;
    background: #e2e8f0;
  }
  .zone-1 .bpm-range {
    color: #475569;
  }
  .zone-1 {
    border-left: 6px solid #94a3b8;
  }

  /* Background Progress Effect */
  .zone-progress-bg {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: #f1f5f9;
  }

  .zone-progress-fill {
    height: 100%;
    opacity: 0.5;
  }

  .zone-5 .zone-progress-fill {
    background: #ef4444;
  }
  .zone-4 .zone-progress-fill {
    background: #f59e0b;
  }
  .zone-3 .zone-progress-fill {
    background: #10b981;
  }
  .zone-2 .zone-progress-fill {
    background: #3b82f6;
  }
  .zone-1 .zone-progress-fill {
    background: #94a3b8;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #94a3b8;
    font-size: 0.875rem;
  }

  @media (max-width: 768px) {
    .dashboard-grid {
      grid-template-columns: 1fr;
    }

    .input-card {
      position: static;
      margin-bottom: 2rem;
    }
  }
</style>
