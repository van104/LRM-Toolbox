<template>
  <div class="data-visualizer brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <div class="header-action start">
          <button class="brutal-btn back-btn" @click="goHome">← 返回</button>
        </div>
        <div class="header-text">
          <h1 class="brutal-title">数据<span>.可视化()</span></h1>
          <span class="tool-subtitle">Data Visualizer</span>
        </div>
        <div class="header-action end"></div>
      </header>

      <main class="main-content">
        <section v-if="!dataLoaded" class="intro-section">
          <h2 class="pane-title mb-4">功能特性</h2>
          <div class="features-grid">
            <div class="feature-card brutal-shadow">
              <div class="icon-box bg-blue text-white">📊</div>
              <h4>多维图表</h4>
              <p>支持柱状图、折线图、饼图、环形图和雷达图，全方位展示数据。</p>
            </div>
            <div class="feature-card brutal-shadow">
              <div class="icon-box bg-yellow">⚡</div>
              <h4>即时预览</h4>
              <p>自由切换 X/Y 轴数据列，实时渲染图表，所见即所得。</p>
            </div>
            <div class="feature-card brutal-shadow">
              <div class="icon-box bg-pink">🎨</div>
              <h4>高清导出</h4>
              <p>内置智能重绘引擎，支持导出 3 倍高清 PNG 图片，适应需求。</p>
            </div>
            <div class="feature-card brutal-shadow">
              <div class="icon-box bg-cyan">📁</div>
              <h4>广泛兼容</h4>
              <p>原生支持 Excel (.xlsx, .xls) 和 CSV 格式，无需手动转换。</p>
            </div>
          </div>

          <h2 class="pane-title mt-8 mb-4">使用指南</h2>
          <div class="steps-list">
            <div class="step-item brutal-shadow">
              <span class="step-num bg-blue text-white">1</span>
              <div class="step-content">
                <h4>上传文件</h4>
                <p>将 Excel 或 CSV 文件拖拽到上传区域。</p>
              </div>
            </div>
            <div class="step-item brutal-shadow">
              <span class="step-num bg-yellow">2</span>
              <div class="step-content">
                <h4>配置图表</h4>
                <p>在左侧选择图表类型，并指定 X 轴和 Y 轴对应的数据列。</p>
              </div>
            </div>
            <div class="step-item brutal-shadow">
              <span class="step-num bg-pink">3</span>
              <div class="step-content">
                <h4>导出分享</h4>
                <p>调整配色和标题，点击"导出图片"保存高清图表。</p>
              </div>
            </div>
          </div>
        </section>

        <section v-if="!dataLoaded" class="upload-section mt-8">
          <div
            class="upload-card-content brutal-shadow"
            :class="{ dragover: isDragOver }"
            @click="openUpload"
            @dragover.prevent="isDragOver = true"
            @dragleave.prevent="isDragOver = false"
            @drop.prevent="handleDrop"
          >
            <input
              ref="fileInput"
              type="file"
              accept=".xlsx,.xls,.csv"
              hidden
              @change="handleFileSelect"
            />

            <div class="upload-part">
              <div class="upload-icon">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
              </div>
              <h3>点击或拖拽上传文件</h3>
              <p class="upload-hint">支持 .xlsx, .xls, .csv 格式</p>
            </div>

            <div class="divider">
              <span class="brutal-label bg-yellow">或者</span>
            </div>

            <div class="generator-part">
              <button class="brutal-btn demo-btn bg-cyan" @click.stop="openGeneratorModal">
                <span class="mr-2">✨</span> 生成演示数据
              </button>
              <p class="demo-hint mt-2">快速体验图表功能</p>
            </div>
          </div>
        </section>

        <div v-if="dataLoaded" class="workspace mt-8">
          <div class="file-bar brutal-pane p-4 flex justify-between items-center bg-white mb-4">
            <div class="file-info text-lg font-bold">
              <span class="file-icon mr-2">📄</span>
              <span class="file-name mr-4">{{ fileInfo.name }}</span>
              <span class="file-size brutal-badge bg-yellow">{{ fileInfo.size }}</span>
            </div>
            <button class="brutal-btn action-btn bg-pink text-white" @click="resetData">
              🗑️ 重新上传
            </button>
          </div>

          <div class="workspace-grid">
            <div class="sidebar brutal-pane bg-white p-4">
              <div class="panel-section">
                <h3 class="section-label">图表类型</h3>
                <div class="chart-types">
                  <button
                    v-for="type in chartTypes"
                    :key="type.value"
                    class="type-btn brutal-btn"
                    :class="{ 'bg-yellow': config.chartType === type.value }"
                    @click="config.chartType = type.value"
                  >
                    <span class="type-icon">{{ type.icon }}</span>
                    <span class="type-label">{{ type.label }}</span>
                  </button>
                </div>
              </div>

              <div class="panel-section mt-6">
                <h3 class="section-label">数据映射</h3>
                <div class="form-group">
                  <label class="font-bold">X轴 / 类别 (Label)</label>
                  <select v-model="config.xAxis" class="brutal-input form-select mt-2 w-full">
                    <option value="" disabled>请选择列</option>
                    <option v-for="(col, idx) in columns" :key="idx" :value="idx">{{ col }}</option>
                  </select>
                </div>
                <div class="form-group mt-4">
                  <label class="font-bold">Y轴 / 数值 (Value)</label>
                  <select v-model="config.yAxis" class="brutal-input form-select mt-2 w-full">
                    <option value="" disabled>请选择列</option>
                    <option v-for="(col, idx) in columns" :key="idx" :value="idx">{{ col }}</option>
                  </select>
                </div>
              </div>

              <div class="panel-section mt-6">
                <h3 class="section-label">样式配置</h3>
                <div class="form-group">
                  <label class="font-bold">图表标题</label>
                  <input
                    v-model="config.title"
                    type="text"
                    class="brutal-input form-input mt-2 w-full"
                    placeholder="输入图表标题"
                  />
                </div>

                <div class="form-group mt-4">
                  <label class="font-bold">配色主题</label>
                  <div class="color-themes mt-2 flex gap-2 flex-wrap">
                    <button
                      v-for="theme in themes"
                      :key="theme.name"
                      class="theme-dot brutal-btn"
                      :style="{ background: theme.color }"
                      :class="{ active: config.theme === theme.name }"
                      :title="theme.label"
                      @click="config.theme = theme.name"
                    ></button>
                  </div>
                </div>

                <div class="options-row mt-4">
                  <label class="brutal-checkbox">
                    <input v-model="config.showLegend" type="checkbox" />
                    <span class="check-box"></span>
                    <strong>显示图例</strong>
                  </label>
                  <label class="brutal-checkbox ml-4">
                    <input v-model="config.showGrid" type="checkbox" />
                    <span class="check-box"></span>
                    <strong>显示网格</strong>
                  </label>
                </div>
              </div>

              <div class="mt-8 flex flex-col gap-4">
                <button
                  class="brutal-btn action-btn bg-cyan w-full text-lg py-3"
                  @click="generateChart"
                >
                  🚀 生成图表
                </button>
                <button
                  class="brutal-btn action-btn bg-blue text-white w-full text-lg py-3"
                  @click="exportImage"
                >
                  💾 导出高清图片
                </button>
              </div>
            </div>

            <div class="preview-area flex flex-col gap-6">
              <div class="chart-card brutal-pane bg-white p-4 h-[500px] relative">
                <canvas ref="chartCanvas"></canvas>
              </div>

              <div class="table-card brutal-pane bg-white p-4">
                <div class="card-header flex justify-between items-center mb-4">
                  <h3 class="section-label m-0 border-0">📝 数据编辑器</h3>
                  <div class="table-actions flex gap-2">
                    <button
                      class="brutal-btn bg-yellow text-sm py-1 px-3"
                      title="添加行"
                      @click="addRow"
                    >
                      + 增加行
                    </button>
                    <button
                      class="brutal-btn bg-blue text-white text-sm py-1 px-3"
                      title="添加列"
                      @click="addColumn"
                    >
                      + 增加列
                    </button>
                  </div>
                </div>

                <div class="table-wrapper brutal-table-container">
                  <table class="brutal-table w-full text-left">
                    <thead>
                      <tr>
                        <th class="w-12 bg-yellow">#</th>
                        <th
                          v-for="(col, cIdx) in columns"
                          :key="cIdx"
                          class="relative group bg-yellow"
                        >
                          <div class="flex items-center justify-between">
                            <input
                              v-model="rawData[0][cIdx]"
                              class="th-input brutal-input flex-1"
                              @change="handleDataChange"
                            />
                            <button
                              v-if="columns.length > 2"
                              class="del-col-btn brutal-btn ml-2 bg-pink text-white"
                              title="删除此列"
                              @click="removeColumn(cIdx)"
                            >
                              ✕
                            </button>
                          </div>
                        </th>
                        <th class="w-16 bg-yellow text-center">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, rIdx) in editableRows" :key="rIdx">
                        <td
                          class="row-idx font-bold text-center bg-gray-100 border-b-2 border-r-2 border-black"
                        >
                          {{ rIdx + 1 }}
                        </td>
                        <td
                          v-for="(cell, cIdx) in row"
                          :key="cIdx"
                          class="p-1 border-b-2 border-r-2 border-black"
                        >
                          <input
                            v-model="rawData[rIdx + 1][cIdx]"
                            class="td-input brutal-input w-full"
                            style="border-width: 2px"
                            @change="handleDataChange"
                          />
                        </td>
                        <td class="text-center border-b-2 border-black p-1">
                          <button
                            class="del-row-btn brutal-btn bg-pink text-white py-1 px-2"
                            title="删除当前行"
                            @click="removeRow(rIdx + 1)"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div
                  v-if="rawData.length > 100"
                  class="limit-hint mt-4 p-2 bg-yellow border-2 border-black font-bold text-center"
                >
                  ⚠️ 为保证性能，仅显示前 100 行数据供编辑
                </div>
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

      <div
        v-if="showGenerator"
        class="modal-overlay fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click="showGenerator = false"
      >
        <div class="modal-card brutal-pane bg-white p-6 max-w-lg w-full" @click.stop>
          <div
            class="modal-header flex justify-between items-center mb-6 pb-2 border-b-4 border-black"
          >
            <h3 class="text-xl font-black m-0">
              <span class="mr-2">✨</span>
              生成测试数据
            </h3>
            <button class="close-btn brutal-btn p-1 text-xl" @click="showGenerator = false">
              ✕
            </button>
          </div>
          <div class="modal-body">
            <p class="font-bold mb-6 p-3 bg-yellow border-4 border-black">
              选择数据主题，自动生成 Excel 格式测试数据。
            </p>

            <div class="form-group mb-6">
              <label class="section-label">数据主题</label>
              <div class="topic-grid grid grid-cols-2 gap-4 mt-2">
                <button
                  v-for="topic in generatorTopics"
                  :key="topic.value"
                  class="topic-btn brutal-btn py-3 text-lg font-bold"
                  :class="{
                    'bg-cyan':
                      Number(genConfig.type) === Number(topic.value) ||
                      genConfig.type === topic.value,
                    'bg-gray-100': !(
                      Number(genConfig.type) === Number(topic.value) ||
                      genConfig.type === topic.value
                    )
                  }"
                  @click="genConfig.type = topic.value"
                >
                  <span class="topic-icon mr-2">{{ topic.icon }}</span>
                  <span>{{ topic.label }}</span>
                </button>
              </div>
            </div>

            <div class="form-group mb-8">
              <label class="section-label"
                >数据行数:
                <span class="bg-black text-white px-2 rounded">{{ genConfig.rows }}</span></label
              >
              <input
                v-model.number="genConfig.rows"
                type="range"
                min="5"
                max="50"
                class="brutal-slider w-full mt-4"
              />
            </div>

            <div class="modal-actions flex flex-col gap-4">
              <button class="brutal-btn bg-blue text-white text-lg py-3" @click="generateAndLoad">
                🚀 生成并在预览中加载
              </button>
              <button class="brutal-btn bg-gray-200 text-lg py-3" @click="generateAndDownload">
                💾 仅下载 Excel 文件
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, computed, nextTick, watch } from 'vue';
  import * as XLSX from 'xlsx';
  import Chart from 'chart.js/auto';
  import { ElMessage } from 'element-plus';

  import { useFileHandler } from '@/composables/useFileHandler';

  const { isDragOver, fileInput, onFileSelect, onDrop, triggerUpload, formatSize, readFile } =
    useFileHandler({ accept: '.xlsx,.xls,.csv' });
  const dataLoaded = ref(false);
  const chartCanvas = ref(null);
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
  const genConfig = reactive({
    type: 'sales',
    rows: 12
  });

  const generatorTopics = [
    { value: 'sales', label: '销售数据', icon: '💰' },
    { value: 'population', label: '人口统计', icon: '👥' },
    { value: 'weather', label: '天气数据', icon: '🌤️' },
    { value: 'finance', label: '财务报表', icon: '💹' }
  ];

  const chartTypes = [
    { value: 'bar', label: '柱状图', icon: '📊' },
    { value: 'line', label: '折线图', icon: '📈' },
    { value: 'pie', label: '饼图', icon: '🍕' },
    { value: 'doughnut', label: '环形图', icon: '🍩' },
    { value: 'radar', label: '雷达图', icon: '🕸️' }
  ];

  const themes = [
    { name: 'blue', color: '#4b7bff', label: '蓝色' },
    { name: 'green', color: '#00e572', label: '绿色' },
    { name: 'purple', color: '#b34bff', label: '紫色' },
    { name: 'red', color: '#ff4b4b', label: '红色' },
    { name: 'orange', color: '#ffa500', label: '橙色' },
    { name: 'yellow', color: '#ffd900', label: '黄色' }
  ];

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

  const rawData = ref([]);

  const editableRows = computed(() => {
    if (rawData.value.length <= 1) return [];
    return rawData.value.slice(1, 101);
  });

  watch(config, () => {
    if (chartInstance && config.xAxis !== '' && config.yAxis !== '') {
      updateChartData();
    }
  });

  function goHome() {
    if (window.history.length > 1) window.history.back();
  }

  function openUpload() {
    triggerUpload();
  }

  async function handleFileSelect(event) {
    const results = await onFileSelect(event);
    if (results.length > 0) processFile(results[0].file);
  }

  async function handleDrop(event) {
    const results = await onDrop(event);
    if (results.length > 0) processFile(results[0].file);
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

      nextTick(() => {
        generateChart();
      });
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

  function generateChart() {
    if (!dataLoaded.value || config.xAxis === '' || config.yAxis === '') {
      ElMessage.error('请设置 X 轴和 Y 轴数据');
      return;
    }

    const ctx = chartCanvas.value;
    if (!ctx) return;

    if (chartInstance) {
      chartInstance.destroy();
    }

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
          legend: {
            display: config.showLegend,
            labels: { font: { weight: 'bold', size: 14 } }
          },
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
        scales:
          config.chartType === 'pie' ||
          config.chartType === 'doughnut' ||
          config.chartType === 'radar'
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
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(baseColors[i % baseColors.length]);
    }
    return result;
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
        scales:
          config.chartType === 'pie' ||
          config.chartType === 'doughnut' ||
          config.chartType === 'radar'
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
            // Draw outer border for the image
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

  function handleDataChange() {
    updateChartData();
  }

  function addRow() {
    const colCount = rawData.value[0].length;
    const newRow = new Array(colCount).fill(0);
    rawData.value.push(newRow);
    handleDataChange();
    nextTick(() => {
      const tableDiv = document.querySelector('.wrapper-table');
      if (tableDiv) tableDiv.scrollTop = tableDiv.scrollHeight;
    });
  }

  function removeRow(idx) {
    if (rawData.value.length <= 2) {
      ElMessage.error('至少保留一行数据');
      return;
    }
    rawData.value.splice(idx, 1);
    handleDataChange();
  }

  function addColumn() {
    const newHeader = `列 ${rawData.value[0].length + 1}`;
    rawData.value[0].push(newHeader);
    for (let i = 1; i < rawData.value.length; i++) {
      rawData.value[i].push(0);
    }
    handleDataChange();
  }

  function removeColumn(cIdx) {
    if (rawData.value[0].length <= 2) {
      ElMessage.error('至少保留两列数据');
      return;
    }

    if (cIdx === config.xAxis || cIdx === config.yAxis) {
      if (cIdx === config.xAxis) config.xAxis = '';
      if (cIdx === config.yAxis) config.yAxis = '';
    }

    rawData.value.forEach(row => {
      row.splice(cIdx, 1);
    });

    if (typeof config.xAxis === 'number' && config.xAxis > cIdx) config.xAxis--;
    if (typeof config.yAxis === 'number' && config.yAxis > cIdx) config.yAxis--;

    handleDataChange();
  }

  function openGeneratorModal() {
    showGenerator.value = true;
  }

  function generateData(type, rows) {
    let data = [];
    switch (type) {
      case 'sales':
        data = generateSalesData(rows);
        break;
      case 'population':
        data = generatePopulationData(rows);
        break;
      case 'weather':
        data = generateWeatherData(rows);
        break;
      case 'finance':
        data = generateFinanceData(rows);
        break;
      default:
        data = generateSalesData(rows);
    }
    return data;
  }

  function generateAndLoad() {
    const data = generateData(genConfig.type, genConfig.rows);

    fileInfo.name = `模拟${generatorTopics.find(t => t.value === genConfig.type).label}.xlsx`;
    fileInfo.size = '模拟数据';

    rawData.value = data;
    dataLoaded.value = true;
    showGenerator.value = false;

    config.xAxis = 0;
    config.yAxis = data[0].length > 4 ? 3 : 1;
    config.title = fileInfo.name.replace('.xlsx', '');

    ElMessage.success('模拟数据已加载');
    nextTick(generateChart);
  }

  function generateAndDownload() {
    const data = generateData(genConfig.type, genConfig.rows);
    const topic = generatorTopics.find(t => t.value === genConfig.type);
    const fileName = `模拟${topic.label}_${new Date().toISOString().slice(0, 10)}.xlsx`;

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, fileName);

    ElMessage.success('文件已开始下载');
  }

  function generateSalesData(rows) {
    const months = [
      '一月',
      '二月',
      '三月',
      '四月',
      '五月',
      '六月',
      '七月',
      '八月',
      '九月',
      '十月',
      '十一月',
      '十二月'
    ];
    const products = ['手机', '电脑', '平板', '耳机', '手表'];
    const regions = ['华东', '华北', '华南', '西部', '东北'];

    const data = [['月份', '产品', '地区', '销售额(元)', '销量(件)', '增长率(%)']];

    for (let i = 0; i < rows; i++) {
      const month = months[i % months.length];
      const product = products[Math.floor(Math.random() * products.length)];
      const region = regions[Math.floor(Math.random() * regions.length)];
      const sales = Math.floor(10000 + Math.random() * 90000);
      const quantity = Math.floor(10 + Math.random() * 990);
      const growth = (Math.random() * 20 - 5).toFixed(2);

      data.push([month, product, region, sales, quantity, growth]);
    }
    return data;
  }

  function generatePopulationData(rows) {
    const cities = ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉', '重庆', '西安'];
    const ageGroups = ['0-14岁', '15-64岁', '65岁以上'];

    const data = [['城市', '年份', '年龄组', '人口(万)', '占比', '增长率']];

    for (let i = 0; i < rows; i++) {
      const city = cities[i % cities.length];
      const year = 2020 + Math.floor(i / cities.length);
      const ageGroup = ageGroups[Math.floor(Math.random() * ageGroups.length)];
      const population = Math.floor(50 + Math.random() * 950);
      const ratio = (Math.random() * 80 + 10).toFixed(2);
      const growth = (Math.random() * 3 + 0.5).toFixed(2);

      data.push([city, year, ageGroup, population, ratio, growth]);
    }
    return data;
  }

  function generateWeatherData(rows) {
    const cities = ['北京', '上海', '广州', '深圳', '杭州', '哈尔滨', '昆明', '拉萨'];

    const data = [['城市', '日期', '最高温', '最低温', '降水量', '湿度', '风速']];

    for (let i = 0; i < rows; i++) {
      const city = cities[i % cities.length];
      const date = `2023-07-${(i % 30) + 1}`;
      const highTemp = Math.floor(15 + Math.random() * 30);
      const lowTemp = highTemp - Math.floor(5 + Math.random() * 10);
      const precipitation = (Math.random() * 50).toFixed(1);
      const humidity = Math.floor(30 + Math.random() * 70);
      const windSpeed = (Math.random() * 20).toFixed(1);

      data.push([city, date, highTemp, lowTemp, precipitation, humidity, windSpeed]);
    }
    return data;
  }

  function generateFinanceData(rows) {
    const departments = ['销售部', '市场部', '研发部', '人力资源部', '财务部', '行政部'];

    const data = [['部门', '季度', '预算', '实际支出', '节省', '同比变化']];

    for (let i = 0; i < rows; i++) {
      const department = departments[i % departments.length];
      const quarter = `Q${(i % 4) + 1}`;
      const budget = Math.floor(100000 + Math.random() * 900000);
      const actual = Math.floor(budget * 0.7 + Math.random() * budget * 0.25);
      const saving = budget - actual;
      const change = (Math.random() * 20 - 10).toFixed(2);

      data.push([department, quarter, budget, actual, saving, change]);
    }
    return data;
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
    font-size: 1.5rem;
    font-weight: 900;
    color: #111;
    border-bottom: 4px solid #111;
    padding-bottom: 12px;
  }

  .section-label {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
    color: #111;
    margin-bottom: 12px;
    border-bottom: 2px solid #111;
    padding-bottom: 6px;
  }

  .main-content {
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 2rem;
  }

  .feature-card {
    background: #fff;
    padding: 24px;
    border: 3px solid #111;
  }

  .feature-card h4 {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    margin: 12px 0 8px 0;
    color: #111;
  }

  .feature-card p {
    font-size: 0.95rem;
    color: #333;
    line-height: 1.6;
    margin: 0;
  }

  .icon-box {
    width: 56px;
    height: 56px;
    border: 3px solid #111;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
    box-shadow: 2px 2px 0px #111;
  }

  .steps-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 2rem;
  }

  .step-item {
    display: flex;
    gap: 16px;
    background: #fff;
    padding: 20px;
    border: 3px solid #111;
  }

  .step-num {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    border: 3px solid #111;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    font-size: 1.25rem;
    box-shadow: 2px 2px 0px #111;
  }

  .step-content h4 {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.15rem;
    font-weight: 800;
    margin: 0 0 8px 0;
  }

  .step-content p {
    margin: 0;
    font-size: 0.9rem;
    color: #333;
    line-height: 1.5;
  }

  .upload-section {
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
  }

  .upload-card-content {
    background: #f4f4f0;
    border: 4px dashed #111;
    padding: 4rem 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .upload-card-content:hover,
  .upload-card-content.dragover {
    background: #fffbe6;
    border-style: solid;
    border-color: #111;
  }

  .upload-part {
    margin-bottom: 2.5rem;
    width: 100%;
  }

  .upload-icon {
    color: #111;
    margin-bottom: 1.5rem;
  }

  .upload-card-content h3 {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.5rem;
    font-weight: 900;
    margin: 0 0 0.5rem 0;
    color: #111;
  }

  .upload-hint {
    font-size: 1rem;
    color: #555;
    font-family: 'IBM Plex Mono', sans-serif;
  }

  .divider {
    width: 100%;
    margin: 1rem 0 2rem 0;
    border-top: 3px solid #111;
    position: relative;
    display: flex;
    justify-content: center;
  }

  .brutal-label {
    position: absolute;
    top: -14px;
    padding: 2px 16px;
    border: 3px solid #111;
    font-weight: 800;
    font-size: 0.9rem;
    color: #111;
  }

  .workspace-grid {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 2rem;
  }

  .chart-types {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .type-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 700;
  }

  .type-icon {
    font-size: 1.8rem;
  }

  .color-themes {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .theme-dot {
    width: 36px;
    height: 36px;
    border-radius: 0;
    padding: 0;
    border: 3px solid #111;
  }

  .theme-dot.active {
    box-shadow: 4px 4px 0px #111;
    transform: translate(-2px, -2px);
  }

  .brutal-table-container {
    border: 4px solid #111;
    background: #fff;
    max-height: 500px;
    overflow-y: auto;
  }

  .brutal-table th {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    padding: 12px;
    border-bottom: 4px solid #111;
    border-right: 2px solid #111;
    color: #111;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .brutal-table th:last-child {
    border-right: none;
  }

  .td-input {
    border: none;
    border-radius: 0;
    padding: 8px;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-size: 1rem;
    background: transparent;
    transition: background 0.1s;
  }

  .td-input:focus {
    background: #fffbe6;
    outline: 2px solid #111;
    outline-offset: -2px;
  }

  .brutal-checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
  }

  .brutal-checkbox input {
    display: none;
  }

  .check-box {
    width: 24px;
    height: 24px;
    border: 3px solid #111;
    display: inline-block;
    background: #fff;
    transition: all 0.1s;
    position: relative;
    box-shadow: 2px 2px 0px #111;
  }

  .brutal-checkbox input:checked + .check-box {
    background: #00e572;
  }

  .brutal-checkbox input:checked + .check-box::after {
    content: '';
    position: absolute;
    left: 6px;
    top: 2px;
    width: 6px;
    height: 12px;
    border: solid #111;
    border-width: 0 3px 3px 0;
    transform: rotate(45deg);
  }

  @media (max-width: 1024px) {
    .workspace-grid {
      grid-template-columns: 1fr;
    }
  }

  .bg-blue {
    background-color: #4b7bff;
  }
  .bg-yellow {
    background-color: #ffd900;
  }
  .bg-pink {
    background-color: #ff66b2;
  }
  .bg-cyan {
    background-color: #00ffff;
  }
  .bg-white {
    background-color: #ffffff;
  }
  .text-white {
    color: #ffffff;
  }
</style>
