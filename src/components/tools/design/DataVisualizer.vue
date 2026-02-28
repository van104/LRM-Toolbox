<template>
  <div class="data-visualizer brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header pt-6">
        <div class="header-action start">
          <button class="brutal-btn back-btn" @click="goHome">← 返回</button>
        </div>
        <div class="header-content">
          <div class="header-logo">
            <h1 class="brutal-title">数据<span>.可视化()</span></h1>
            <div class="brutal-badge-wrap">
              <span class="brutal-badge bg-black text-white">PRO</span>
              <span class="tool-subtitle">Data Visualizer</span>
            </div>
          </div>
        </div>
        <div class="header-action end">
          <div class="status-badge bg-green"><span class="pulse"></span> ONLINE</div>
        </div>
      </header>

      <main class="main-content">
        <!-- 介绍与上传区域 -->
        <VisualizerUpload
          v-if="!dataLoaded"
          @file-process="processFile"
          @open-generator="showGenerator = true"
        />

        <!-- 工作台区域 -->
        <div v-if="dataLoaded" class="workspace mt-8">
          <div class="workspace-header mb-6">
            <div class="file-card brutal-pane">
              <div class="file-icon-wrap bg-yellow">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                  <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
              </div>
              <div class="file-meta">
                <span class="file-name">{{ fileInfo.name }}</span>
                <span class="file-size">{{ fileInfo.size }}</span>
              </div>
              <button class="brutal-btn reupload-btn ml-auto" @click="resetData">重新上传</button>
            </div>
          </div>

          <div class="workspace-grid">
            <!-- 配置侧边栏 (LEFT) -->
            <aside class="sidebar-container">
              <VisualizerSidebar
                :config="config"
                :columns="columns"
                @update:config="updateConfig"
                @generate="generateChart"
                @export="exportImage"
              />
            </aside>

            <!-- 展示主区域 (RIGHT) -->
            <div class="main-display">
              <div class="chart-section brutal-pane mb-8">
                <div class="chart-content">
                  <canvas ref="chartCanvas"></canvas>
                </div>
              </div>

              <div class="table-section">
                <VisualizerTable
                  v-model:raw-data="rawData"
                  :columns="columns"
                  :config="config"
                  @change="handleDataChange"
                  @config-update="updateConfig"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer class="footer mt-12 py-8 text-center text-gray-600 border-t-4 border-black">
        <p class="font-bold mb-2">
          本工具仅供数据可视化演示与学习。所有数据均在本地浏览器处理，不会上传至云端服务器。请勿上传敏感隐私数据。
        </p>
        <p>© 2026 LRM工具箱 - 数据可视化</p>
      </footer>

      <!-- 演示数据生成器 -->
      <VisualizerGenerator v-model="showGenerator" @load-data="handleGeneratorLoad" />
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, computed, nextTick, watch } from 'vue';
  import * as XLSX from 'xlsx';
  import Chart from 'chart.js/auto';
  import { ElMessage } from 'element-plus';

  import { useFileHandler } from '@/composables/useFileHandler';
  import VisualizerUpload from './DataVisualizer/VisualizerUpload.vue';
  import VisualizerSidebar from './DataVisualizer/VisualizerSidebar.vue';
  import VisualizerTable from './DataVisualizer/VisualizerTable.vue';
  import VisualizerGenerator from './DataVisualizer/VisualizerGenerator.vue';

  const { formatSize, readFile } = useFileHandler();
  const dataLoaded = ref(false);
  const chartCanvas = ref(null);
  const rawData = ref([]);
  let chartInstance = null;

  const fileInfo = reactive({ name: '', size: '' });
  const config = reactive({
    chartType: 'bar',
    xAxis: '',
    yAxis: '',
    title: '',
    theme: 'blue',
    showLegend: true,
    showGrid: true
  });

  const showGenerator = ref(false);

  const themeColors = {
    blue: ['#4b7bff', '#83a4ff', '#b8caff', '#194bd1', '#002999'],
    green: ['#00e572', '#4bffa1', '#99ffd0', '#00994c', '#006633'],
    purple: ['#b34bff', '#cc8cff', '#e5ccff', '#8c19d1', '#590099'],
    red: ['#ff4b4b', '#ff8c8c', '#ffcccc', '#d11919', '#990000'],
    orange: ['#ffa500', '#ffc266', '#ffe0b3', '#cc8400', '#996300'],
    yellow: ['#ffd900', '#ffe666', '#fff2b3', '#cca300', '#997a00']
  };

  const columns = computed(() => {
    if (rawData.value.length === 0) return [];
    return rawData.value[0];
  });

  watch(config, () => {
    if (chartInstance && config.xAxis !== '' && config.yAxis !== '') {
      updateChartData();
    }
  });

  function goHome() {
    if (window.history.length > 1) window.history.back();
  }

  function handleGeneratorLoad({ data, fileName }) {
    fileInfo.name = fileName;
    fileInfo.size = '模拟数据';
    rawData.value = data;
    dataLoaded.value = true;
    config.xAxis = 0;
    config.yAxis = data[0].length > 4 ? 3 : 1;
    config.title = fileName.replace('.xlsx', '');
    nextTick(generateChart);
  }

  async function processFile(file) {
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    fileInfo.name = file.name;
    fileInfo.size = formatSize(file.size);

    try {
      const mode = isExcel ? 'binary' : 'text';
      const { content: data } = await readFile(file, mode);
      let jsonData = [];

      if (isExcel) {
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheet];
        jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      } else {
        const lines = data.split('\n');
        jsonData = lines.map(line => line.split(',').map(cell => cell.trim()));
      }

      rawData.value = jsonData.filter(row => row.length > 0 && row.some(cell => cell !== ''));

      if (rawData.value.length < 2) {
        ElMessage.error('数据太少，无法展示');
        return;
      }

      dataLoaded.value = true;
      config.xAxis = 0;
      config.yAxis = rawData.value[0].length > 1 ? 1 : 0;
      config.title = file.name.split('.')[0];

      ElMessage.success('数据加载成功');
      nextTick(generateChart);
    } catch (err) {
      console.error(err);
      ElMessage.error('文件解析失败');
    }
  }

  function resetData() {
    rawData.value = [];
    dataLoaded.value = false;
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
  }

  function updateConfig(newConfig) {
    Object.assign(config, newConfig);
  }

  function handleDataChange() {
    updateChartData();
  }

  function extractData() {
    const xIdx = config.xAxis;
    const yIdx = config.yAxis;
    const labels = [];
    const values = [];

    for (let i = 1; i < rawData.value.length; i++) {
      const row = rawData.value[i];
      if (row[xIdx] !== undefined && row[yIdx] !== undefined) {
        labels.push(row[xIdx]);
        const num = parseFloat(row[yIdx]);
        values.push(isNaN(num) ? 0 : num);
      }
    }
    return { labels, values };
  }

  function generateColors(count, themeName) {
    const baseColors = themeColors[themeName] || themeColors.blue;
    return Array.from({ length: count }, (_, i) => baseColors[i % baseColors.length]);
  }

  function generateChart() {
    if (!dataLoaded.value || config.xAxis === '' || config.yAxis === '') {
      ElMessage.error('请设置 X 轴和 Y 轴数据');
      return;
    }

    const ctx = chartCanvas.value;
    if (!ctx) return;
    if (chartInstance) chartInstance.destroy();

    const { labels, values } = extractData();
    const colors = generateColors(labels.length, config.theme);

    Chart.defaults.font.family = "'Syne', 'Noto Sans SC', sans-serif";
    Chart.defaults.font.weight = 'bold';
    Chart.defaults.color = '#111';

    chartInstance = new Chart(ctx, {
      type: config.chartType,
      data: {
        labels,
        datasets: [
          {
            label: config.title || columns.value[config.yAxis],
            data: values,
            backgroundColor: config.chartType === 'line' ? colors[0] : colors,
            borderColor: '#111',
            borderWidth: 2,
            hoverOffset: 4,
            fill: config.chartType === 'line' || config.chartType === 'radar',
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: config.showLegend, labels: { font: { weight: 'bold', size: 14 } } },
          title: {
            display: !!config.title,
            text: config.title,
            font: { size: 18, weight: 'bold' }
          },
          tooltip: {
            backgroundColor: '#111',
            titleFont: { size: 14 },
            bodyFont: { size: 14, weight: 'bold' },
            padding: 10,
            cornerRadius: 0,
            borderColor: '#fff',
            borderWidth: 2
          }
        },
        scales: ['pie', 'doughnut', 'radar'].includes(config.chartType)
          ? {}
          : {
              x: {
                grid: { display: config.showGrid, color: '#e2e8f0', tickColor: '#111' },
                ticks: { font: { weight: 'bold' } },
                border: { color: '#111', width: 2 }
              },
              y: {
                grid: { display: config.showGrid, color: '#e2e8f0', tickColor: '#111' },
                ticks: { font: { weight: 'bold' } },
                border: { color: '#111', width: 2 }
              }
            }
      }
    });
  }

  function updateChartData() {
    if (!chartInstance) return;
    const { labels, values } = extractData();
    const colors = generateColors(labels.length, config.theme);

    if (chartInstance.config.type !== config.chartType) {
      generateChart();
      return;
    }

    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = values;
    chartInstance.data.datasets[0].label = config.title || columns.value[config.yAxis];
    chartInstance.data.datasets[0].backgroundColor =
      config.chartType === 'line' ? colors[0] : colors;

    chartInstance.options.plugins.legend.display = config.showLegend;
    chartInstance.options.plugins.title.display = !!config.title;
    chartInstance.options.plugins.title.text = config.title;

    if (chartInstance.options.scales.x)
      chartInstance.options.scales.x.grid.display = config.showGrid;
    if (chartInstance.options.scales.y)
      chartInstance.options.scales.y.grid.display = config.showGrid;

    chartInstance.update();
  }

  async function exportImage() {
    if (!chartInstance) return;
    const scale = 3;
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = chartInstance.width * scale;
    offscreenCanvas.height = chartInstance.height * scale;

    const { labels, values } = extractData();
    const colors = generateColors(labels.length, config.theme);

    const exportConfig = {
      type: config.chartType,
      data: {
        labels,
        datasets: [
          {
            label: config.title || columns.value[config.yAxis],
            data: values,
            backgroundColor: config.chartType === 'line' ? colors[0] : colors,
            borderColor: '#111',
            borderWidth: 2 * scale,
            fill: config.chartType === 'line' || config.chartType === 'radar'
          }
        ]
      },
      options: {
        animation: false,
        responsive: false,
        devicePixelRatio: 1,
        plugins: {
          legend: {
            display: config.showLegend,
            labels: { font: { size: 14 * scale, weight: 'bold' } }
          },
          title: {
            display: !!config.title,
            text: config.title,
            font: { size: 18 * scale, weight: 'bold' }
          }
        },
        scales: ['pie', 'doughnut', 'radar'].includes(config.chartType)
          ? {}
          : {
              x: {
                grid: { display: config.showGrid, color: '#e2e8f0' },
                ticks: { font: { size: 12 * scale, weight: 'bold' } },
                border: { color: '#111', width: 2 * scale }
              },
              y: {
                grid: { display: config.showGrid, color: '#e2e8f0' },
                ticks: { font: { size: 12 * scale, weight: 'bold' } },
                border: { color: '#111', width: 2 * scale }
              }
            }
      },
      plugins: [
        {
          id: 'custom_white_bg',
          beforeDraw: chart => {
            const ctx = chart.ctx;
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = '#f9f9f5';
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.lineWidth = 4 * scale;
            ctx.strokeStyle = '#111';
            ctx.strokeRect(0, 0, chart.width, chart.height);
            ctx.restore();
          }
        }
      ]
    };

    const exportChart = new Chart(offscreenCanvas, exportConfig);
    const link = document.createElement('a');
    link.download = (config.title || 'chart') + '_hd.png';
    link.href = offscreenCanvas.toDataURL('image/png');
    link.click();
    exportChart.destroy();
    ElMessage.success('图表高清图片已导出 🖼️');
  }
</script>

<style scoped>
  @import '@/assets/styles/brutalism.css';

  .data-visualizer.brutal-wrapper {
    background-color: #fdfae5;
    background-image:
      linear-gradient(#e5e5e5 2px, transparent 2px),
      linear-gradient(90deg, #e5e5e5 2px, transparent 2px);
    background-size: 40px 40px;
    background-position: -2px -2px;
  }
  /* 覆盖全局容器限制，允许全屏化工具体验 */
  .brutal-container {
    max-width: 1800px;
    margin: 0 auto;
    width: 100%;
  }

  .brutal-title span {
    color: #ff4b4b;
    text-shadow: 4px 4px 0px #111;
    letter-spacing: 0;
  }

  .main-content {
    max-width: 1750px;
    margin: 0 auto;
    width: 100%;
    padding-bottom: 4rem;
  }

  /* Header Enhancements */
  .header-content {
    flex: 1;
    display: flex;
    justify-content: center;
  }

  .header-logo {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .brutal-badge-wrap {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: -0.5rem;
  }

  .status-badge {
    padding: 0.5rem 1rem;
    border: 3px solid #111;
    font-weight: 900;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 4px 4px 0px #111;
  }

  .pulse {
    width: 8px;
    height: 8px;
    background: #111;
    border-radius: 50%;
    animation: pulse-animation 1.5s infinite;
  }

  @keyframes pulse-animation {
    0% {
      transform: scale(0.95);
      opacity: 0.9;
    }
    70% {
      transform: scale(1.5);
      opacity: 0;
    }
    100% {
      transform: scale(0.95);
      opacity: 0;
    }
  }

  /* Workspace Layout */
  .workspace-header {
    width: 100%;
  }

  .file-card {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 1rem 1.5rem;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
  }

  .file-icon-wrap {
    width: 48px;
    height: 48px;
    border: 3px solid #111;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 3px 3px 0px #111;
  }

  .file-meta {
    display: flex;
    flex-direction: column;
  }

  .file-name {
    font-size: 1.2rem;
    font-weight: 900;
  }

  .file-size {
    font-size: 0.9rem;
    font-weight: 700;
    color: #666;
  }

  .reupload-btn {
    font-size: 0.9rem;
    padding: 0.5rem 1rem;
    background: #ff66b2;
    color: #fff;
  }

  .workspace-grid {
    display: grid;
    grid-template-columns: 360px 1fr;
    gap: 2.5rem;
    align-items: start;
    width: 100%;
  }

  .main-display {
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .sidebar-container {
    position: sticky;
    top: 2rem;
    z-index: 50;
  }

  /* Main Display Columns */
  .chart-section,
  .table-section {
    min-width: 0;
    width: 100%;
  }

  /* Chart Card Polish */
  .chart-container {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
    display: flex;
    flex-direction: column;
  }

  .chart-header {
    background: #f1f5f9;
    border-bottom: 4px solid #111;
    padding: 0.75rem 1.25rem;
    display: flex;
    align-items: center;
    gap: 1.25rem;
  }

  .dot-wrap {
    display: flex;
    gap: 0.5rem;
  }

  .dot {
    width: 12px;
    height: 12px;
    border: 2px solid #111;
    border-radius: 50%;
  }

  .dot.red {
    background: #ff4b4b;
  }
  .dot.yellow {
    background: #ffd900;
  }
  .dot.green {
    background: #00e572;
  }

  .pane-label {
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    font-size: 0.9rem;
    color: #666;
  }

  .chart-content {
    padding: 1.5rem;
    height: 650px;
    position: relative;
  }

  .bg-black {
    background-color: #111;
  }
  .bg-green {
    background-color: #00e572;
  }
</style>
