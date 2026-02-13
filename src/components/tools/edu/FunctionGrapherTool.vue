<template>
  <div class="grapher-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>函数图像绘制器</h1>
        <span class="nav-subtitle">Function Grapher</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="tool-layout">
        <!-- 控制面板 -->
        <div class="glass-card control-panel">
          <section class="input-section">
            <div class="section-header">
              <label
                ><el-icon><EditPen /></el-icon> 函数表达式 f(x)=</label
              >
            </div>
            <div class="expression-group">
              <input
                v-model="expression"
                type="text"
                placeholder="例如: x^2, sin(x)"
                @keyup.enter="drawGraph"
              />
              <button class="draw-btn" @click="drawGraph">
                <el-icon><Refresh /></el-icon> 绘制
              </button>
            </div>
            <p class="help-text">支持 +, -, *, /, ^, sin, cos, tan, log, sqrt, abs, PI, E 等</p>
          </section>

          <div class="divider"></div>

          <section class="range-section">
            <div class="section-header">
              <label
                ><el-icon><Grid /></el-icon> 坐标范围</label
              >
            </div>
            <div class="range-grid">
              <div class="range-item">
                <span>X 最小值</span>
                <input v-model.number="xMin" type="number" @change="drawGraph" />
              </div>
              <div class="range-item">
                <span>X 最大值</span>
                <input v-model.number="xMax" type="number" @change="drawGraph" />
              </div>
              <div class="range-item">
                <span>Y 最小值</span>
                <input v-model.number="yMin" type="number" @change="drawGraph" />
              </div>
              <div class="range-item">
                <span>Y 最大值</span>
                <input v-model.number="yMax" type="number" @change="drawGraph" />
              </div>
              <div class="range-item full">
                <div class="slider-header">
                  <span>解析度 (采样点数)</span>
                  <span class="text-accent font-bold">{{ pointsInfo }}</span>
                </div>
                <div class="slider-container">
                  <el-slider
                    v-model="pointsInfo"
                    :min="50"
                    :max="1000"
                    :step="10"
                    :show-tooltip="false"
                    @change="drawGraph"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- 图表显示 -->
        <div class="glass-card chart-panel">
          <div class="chart-container">
            <canvas ref="chartCanvas"></canvas>
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 函数图像绘制器</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, shallowRef } from 'vue';
  import { Chart, registerables } from 'chart.js';
  import { Back, Refresh, EditPen, Grid } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';

  Chart.register(...registerables);

  const chartCanvas = ref<HTMLCanvasElement | null>(null);
  const chartInstance = shallowRef<Chart | null>(null);

  const expression = ref('x^2');
  const xMin = ref(-10);
  const xMax = ref(10);
  const yMin = ref(-10);
  const yMax = ref(10);
  const pointsInfo = ref(200);

  const drawGraph = () => {
    if (!chartCanvas.value) return;

    const dataPoints: { x: number; y: number }[] = [];
    const step = (xMax.value - xMin.value) / pointsInfo.value;

    try {
      let jsExpr = expression.value.replace(/\^/g, '**');
      // 替换常用数学函数
      const mathFuncs = [
        'sin',
        'cos',
        'tan',
        'log',
        'sqrt',
        'abs',
        'exp',
        'PI',
        'E',
        'pow',
        'ceil',
        'floor',
        'round',
        'asin',
        'acos',
        'atan'
      ];
      mathFuncs.forEach(func => {
        // 使用正则确保只替换独立的函数名
        const regex = new RegExp(`\\b${func}\\b`, 'g');
        jsExpr = jsExpr.replace(regex, `Math.${func}`);
      });

      const f = new Function('x', `return ${jsExpr};`);

      for (let i = 0; i <= pointsInfo.value; i++) {
        const x = xMin.value + i * step;
        try {
          const y = f(x);
          if (Number.isFinite(y)) {
            // 处理浮点数精度问题，避免 0.000000004 这种情况
            dataPoints.push({ x: parseFloat(x.toFixed(3)), y });
          }
        } catch {
          // 忽略单个点计算错误
        }
      }
    } catch {
      ElMessage.error('函数表达式有误，请检查语法');
      return;
    }

    if (chartInstance.value) {
      chartInstance.value.destroy();
    }

    const ctx = chartCanvas.value.getContext('2d');
    if (ctx) {
      chartInstance.value = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            {
              label: `f(x) = ${expression.value}`,
              data: dataPoints,
              borderColor: '#8b5cf6',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              borderWidth: 2.5,
              pointRadius: 0,
              pointHoverRadius: 6,
              pointHoverBackgroundColor: '#8b5cf6',
              pointHoverBorderColor: '#fff',
              pointHoverBorderWidth: 2,
              tension: 0.4, // 稍微增加平滑度
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 600, easing: 'easeOutQuart' },
          scales: {
            x: {
              type: 'linear',
              position: 'bottom',
              min: xMin.value,
              max: xMax.value,
              grid: {
                color: context => (context.tick.value === 0 ? '#64748b' : '#f1f5f9'),
                lineWidth: context => (context.tick.value === 0 ? 2 : 1)
              },
              ticks: { color: '#64748b' }
            },
            y: {
              type: 'linear',
              min: yMin.value,
              max: yMax.value,
              grid: {
                color: context => (context.tick.value === 0 ? '#64748b' : '#f1f5f9'),
                lineWidth: context => (context.tick.value === 0 ? 2 : 1)
              },
              ticks: { color: '#64748b' }
            }
          },
          interaction: { intersect: false, mode: 'nearest', axis: 'x' },
          plugins: {
            legend: { display: true, labels: { color: '#475569' } },
            tooltip: {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              titleColor: '#1e293b',
              bodyColor: '#334155',
              borderColor: '#e2e8f0',
              borderWidth: 1,
              padding: 10,
              displayColors: true,
              boxPadding: 4,
              callbacks: {
                label: context => {
                  const y = context.parsed.y;
                  return ` f(${context.parsed.x}) = ${y !== null ? y.toFixed(3) : 'N/A'}`;
                }
              }
            }
          }
        }
      });
    }
  };

  onMounted(() => {
    drawGraph();
  });
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@600;700&family=Outfit:wght@400;500;600&display=swap');

  /* --- 核心修复：全局 Box Sizing 重置 --- */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  .grapher-tool {
    --bg: #f8fafc;
    --card: #ffffff;
    --border: #e2e8f0;
    --text: #1e293b;
    --text-2: #64748b;
    --accent: #8b5cf6;
    --accent-hover: #7c3aed;
    --accent-bg: #f5f3ff;
    --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);

    font-family:
      'Outfit',
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      Roboto,
      sans-serif;
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    display: flex;
    flex-direction: column;
  }

  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.8rem 2rem;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
  }

  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: transparent;
    border: 1px solid transparent;
    color: var(--text-2);
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: 99px;
    transition: all 0.2s ease;
  }
  .nav-back:hover {
    background: var(--card);
    color: var(--accent);
    box-shadow: var(--shadow);
  }

  .nav-center {
    text-align: center;
  }
  .nav-center h1 {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    color: var(--text);
  }
  .nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-2);
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-top: 2px;
  }
  .nav-spacer {
    width: 80px;
  }

  .main-content {
    flex: 1;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .tool-layout {
    display: grid;
    grid-template-columns: 340px 1fr;
    gap: 1.5rem;
    align-items: start;
  }

  /* 卡片通用样式 */
  .glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    box-shadow: var(--shadow-lg);
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
  }

  .control-panel {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .chart-panel {
    padding: 1rem;
    min-height: 550px;
    height: calc(100vh - 200px); /* 让图表尽可能高 */
    max-height: 700px;
    position: relative;
    display: flex;
    flex-direction: column;
  }

  /* 标题样式 */
  .section-header label {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--text);
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 0.75rem;
  }
  .section-header .el-icon {
    color: var(--accent);
  }

  /* --- 修复点 2：表达式输入组改为横向布局 --- */
  .expression-group {
    display: flex;
    gap: 0.5rem;
    align-items: stretch; /* 让按钮和输入框等高 */
  }
  .expression-group input {
    flex: 1;
    min-width: 0;
    padding: 0.75rem 1rem;
    border: 1px solid var(--border);
    border-radius: 10px;
    font-size: 1rem;
    font-family: 'JetBrains Mono', monospace; /* 代码风格字体 */
    background: #f8fafc;
    outline: none;
    transition: all 0.2s;
  }
  .expression-group input:focus {
    background: #fff;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-bg);
  }

  .draw-btn {
    background: var(--accent);
    color: white;
    border: none;
    padding: 0 1.25rem;
    border-radius: 10px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
    white-space: nowrap; /* 防止按钮文字换行 */
  }
  .draw-btn:hover {
    background: var(--accent-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(139, 92, 246, 0.4);
  }
  .draw-btn:active {
    transform: translateY(0);
  }

  .help-text {
    font-size: 0.75rem;
    color: var(--text-2);
    margin-top: 0.75rem;
    line-height: 1.5;
    opacity: 0.8;
  }

  .divider {
    height: 1px;
    background: var(--border);
    opacity: 0.6;
  }

  /* --- 修复点 3 & 4：网格布局优化 --- */
  .range-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem; /* 增加间距 */
  }

  .range-item {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .range-item span {
    font-size: 0.75rem;
    color: var(--text-2);
    font-weight: 500;
    margin-left: 2px;
  }

  .range-item input {
    width: 100%; /* 确保填满网格 */
    padding: 0.6rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 0.9rem;
    color: var(--text);
    background: #f8fafc;
    outline: none;
    transition: all 0.2s;
  }
  .range-item input:focus {
    background: #fff;
    border-color: var(--accent);
    box-shadow: 0 0 0 2px var(--accent-bg);
  }

  /* 全宽项 */
  .range-item.full {
    grid-column: span 2;
    margin-top: 0.5rem;
    background: var(--bg);
    padding: 1rem;
    border-radius: 12px;
    border: 1px solid transparent; /* 占位防止跳动 */
  }

  .slider-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .text-accent {
    color: var(--accent);
  }
  .font-bold {
    font-weight: 600;
  }

  .slider-container {
    padding: 0 6px; /* 微调 Slider 两侧 padding */
  }

  /* Chart Container */
  .chart-container {
    flex: 1;
    width: 100%;
    height: 100%;
    position: relative;
  }

  .footer {
    text-align: center;
    padding: 1.5rem;
    color: var(--text-2);
    font-size: 0.8rem;
    border-top: 1px solid var(--border);
    background: #fff;
    margin-top: auto;
  }

  /* --- 响应式适配 --- */
  @media (max-width: 900px) {
    .tool-layout {
      grid-template-columns: 1fr; /* 移动端改为单列 */
    }
    .chart-panel {
      min-height: 400px;
      height: auto;
    }
  }
</style>
