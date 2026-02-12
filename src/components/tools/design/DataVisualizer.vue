<template>
  <div class="data-visualizer">
    <nav class="nav-bar">
      <button class="nav-back" @click="goHome">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        返回
      </button>
      <div class="nav-center">
        <h1>数据可视化</h1>
        <span class="nav-subtitle">Data Visualizer</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <section v-if="!dataLoaded" class="intro-section">
        <h2>功能特性</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="icon-box primary">📊</div>
            <h4>多维图表</h4>
            <p>支持柱状图、折线图、饼图、环形图和雷达图，全方位展示数据。</p>
          </div>
          <div class="feature-card">
            <div class="icon-box success">⚡</div>
            <h4>即时预览</h4>
            <p>自由切换 X/Y 轴数据列，实时渲染图表，所见即所得。</p>
          </div>
          <div class="feature-card">
            <div class="icon-box warning">🎨</div>
            <h4>高清导出</h4>
            <p>内置智能重绘引擎，支持导出 3 倍高清 PNG 图片，适应各种文档需求。</p>
          </div>
          <div class="feature-card">
            <div class="icon-box info">📁</div>
            <h4>广泛兼容</h4>
            <p>原生支持 Excel (.xlsx, .xls) 和 CSV 格式，无需手动转换。</p>
          </div>
        </div>

        <h2 class="mt-8">使用指南</h2>
        <div class="steps-list">
          <div class="step-item">
            <span class="step-num">1</span>
            <div class="step-content">
              <h4>上传文件</h4>
              <p>将 Excel 或 CSV 文件拖拽到上传区域。</p>
            </div>
          </div>
          <div class="step-item">
            <span class="step-num">2</span>
            <div class="step-content">
              <h4>配置图表</h4>
              <p>在左侧面板选择图表类型，并指定 X 轴和 Y 轴对应的数据列。</p>
            </div>
          </div>
          <div class="step-item">
            <span class="step-num">3</span>
            <div class="step-content">
              <h4>导出分享</h4>
              <p>调整配色和标题，点击"导出图片"保存高清图表。</p>
            </div>
          </div>
        </div>
      </section>

      <section v-if="!dataLoaded" class="upload-section">
        <div
          class="upload-card-content"
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
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
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
            <span>或者</span>
          </div>

          <div class="generator-part">
            <button class="demo-btn" @click.stop="openGeneratorModal">
              <span class="mr-2">✨</span> 生成演示数据
            </button>
            <p class="demo-hint">快速体验图表功能</p>
          </div>
        </div>
      </section>

      <div v-if="dataLoaded" class="workspace">
        <div class="file-bar">
          <div class="file-info">
            <span class="file-icon">📄</span>
            <span class="file-name">{{ fileInfo.name }}</span>
            <span class="file-size">{{ fileInfo.size }}</span>
          </div>
          <button class="btn text-danger" @click="resetData">重新上传</button>
        </div>

        <div class="workspace-grid">
          <div class="sidebar">
            <div class="panel-section">
              <h3>图表类型</h3>
              <div class="chart-types">
                <button
                  v-for="type in chartTypes"
                  :key="type.value"
                  class="type-btn"
                  :class="{ active: config.chartType === type.value }"
                  @click="config.chartType = type.value"
                >
                  <span class="type-icon">{{ type.icon }}</span>
                  <span>{{ type.label }}</span>
                </button>
              </div>
            </div>

            <div class="panel-section">
              <h3>数据映射</h3>
              <div class="form-group">
                <label>X轴 / 类别 (Label)</label>
                <select v-model="config.xAxis" class="form-select">
                  <option value="" disabled>请选择列</option>
                  <option v-for="(col, idx) in columns" :key="idx" :value="idx">{{ col }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Y轴 / 数值 (Value)</label>
                <select v-model="config.yAxis" class="form-select">
                  <option value="" disabled>请选择列</option>
                  <option v-for="(col, idx) in columns" :key="idx" :value="idx">{{ col }}</option>
                </select>
              </div>
            </div>

            <div class="panel-section">
              <h3>样式配置</h3>
              <div class="form-group">
                <label>标题</label>
                <input
                  v-model="config.title"
                  type="text"
                  class="form-input"
                  placeholder="图表标题"
                />
              </div>

              <div class="form-group">
                <label>配色主题</label>
                <div class="color-themes">
                  <button
                    v-for="theme in themes"
                    :key="theme.name"
                    class="theme-dot"
                    :style="{ background: theme.color }"
                    :class="{ active: config.theme === theme.name }"
                    :title="theme.label"
                    @click="config.theme = theme.name"
                  ></button>
                </div>
              </div>

              <div class="options-row">
                <label class="checkbox-label">
                  <input v-model="config.showLegend" type="checkbox" />
                  <span class="check-box"></span>
                  显示图例
                </label>
                <label class="checkbox-label">
                  <input v-model="config.showGrid" type="checkbox" />
                  <span class="check-box"></span>
                  网格线
                </label>
              </div>
            </div>

            <button class="btn primary full-width" @click="generateChart">生成图表</button>
            <button class="btn secondary full-width mt-2" @click="exportImage">导出图片</button>
          </div>

          <div class="preview-area">
            <div class="chart-card">
              <canvas ref="chartCanvas"></canvas>
            </div>

            <div class="table-card">
              <div class="card-header">
                <h3>数据编辑器</h3>
                <div class="table-actions">
                  <button class="action-btn" title="添加行" @click="addRow">
                    <span class="icon">+</span> 行
                  </button>
                  <button class="action-btn" title="添加列" @click="addColumn">
                    <span class="icon">+</span> 列
                  </button>
                </div>
              </div>

              <div class="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th class="w-12">#</th>
                      <th v-for="(col, cIdx) in columns" :key="cIdx" class="relative group">
                        <div class="flex items-center">
                          <input
                            v-model="rawData[0][cIdx]"
                            class="th-input"
                            @change="handleDataChange"
                          />
                          <button
                            v-if="columns.length > 2"
                            class="del-col-btn group-hover:opacity-100"
                            @click="removeColumn(cIdx)"
                          >
                            ×
                          </button>
                        </div>
                      </th>
                      <th class="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, rIdx) in editableRows" :key="rIdx">
                      <td class="row-idx">{{ rIdx + 1 }}</td>
                      <td v-for="(cell, cIdx) in row" :key="cIdx">
                        <input
                          v-model="rawData[rIdx + 1][cIdx]"
                          class="td-input"
                          @change="handleDataChange"
                        />
                      </td>
                      <td class="text-center">
                        <button class="del-row-btn" title="删除行" @click="removeRow(rIdx + 1)">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <path d="M18 6L6 18M6 6l12 12"></path>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-if="rawData.length > 100" class="limit-hint">
                为保证性能，仅显示前 100 行数据供编辑
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="tool-footer">
      <p>
        本工具仅供数据可视化演示与学习。所有数据均在本地浏览器处理，不会上传至云端服务器。请勿上传敏感隐私数据。
      </p>
      <p>© 2026 LRM工具箱 - 数据可视化</p>
    </footer>

    <div v-if="showGenerator" class="modal-overlay" @click="showGenerator = false">
      <div class="modal-card" @click.stop>
        <div class="modal-header">
          <h3>
            <span class="mr-2">✨</span>
            生成测试数据
          </h3>
          <button class="close-btn" @click="showGenerator = false">&times;</button>
        </div>
        <div class="modal-body">
          <p class="text-secondary text-sm mb-4">
            选择数据类型自动生成 Excel 格式数据，用于测试图表功能。
          </p>

          <div class="form-group">
            <label>数据主题</label>
            <div class="topic-grid">
              <button
                v-for="topic in generatorTopics"
                :key="topic.value"
                class="topic-btn"
                :class="{
                  active:
                    Number(genConfig.type) === Number(topic.value) || genConfig.type === topic.value
                }"
                @click="genConfig.type = topic.value"
              >
                <span class="topic-icon">{{ topic.icon }}</span>
                <span>{{ topic.label }}</span>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>数据行数 ({{ genConfig.rows }})</label>
            <input
              v-model.number="genConfig.rows"
              type="range"
              min="5"
              max="50"
              class="range-input"
            />
          </div>

          <div class="modal-actions">
            <button class="btn primary full-width" @click="generateAndLoad">生成并加载数据</button>
            <button class="btn secondary full-width" @click="generateAndDownload">
              仅下载 Excel
            </button>
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

  const fileInput = ref(null);
  const isDragOver = ref(false);
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
    { name: 'blue', color: '#3b82f6', label: '蓝色' },
    { name: 'green', color: '#10b981', label: '绿色' },
    { name: 'purple', color: '#8b5cf6', label: '紫色' },
    { name: 'red', color: '#ef4444', label: '红色' },
    { name: 'orange', color: '#f97316', label: '橙色' }
  ];

  const themeColors = {
    blue: ['rgba(59, 130, 246, 0.7)', 'rgba(59, 130, 246, 0.5)', 'rgba(59, 130, 246, 0.3)'],
    green: ['rgba(16, 185, 129, 0.7)', 'rgba(16, 185, 129, 0.5)', 'rgba(16, 185, 129, 0.3)'],
    purple: ['rgba(139, 92, 246, 0.7)', 'rgba(139, 92, 246, 0.5)', 'rgba(139, 92, 246, 0.3)'],
    red: ['rgba(239, 68, 68, 0.7)', 'rgba(239, 68, 68, 0.5)', 'rgba(239, 68, 68, 0.3)'],
    orange: ['rgba(249, 115, 22, 0.7)', 'rgba(249, 115, 22, 0.5)', 'rgba(249, 115, 22, 0.3)']
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
    triggerFileInput();
  }

  function triggerFileInput() {
    fileInput.value.click();
  }

  function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) processFile(file);
    event.target.value = '';
  }

  function handleDrop(event) {
    isDragOver.value = false;
    const file = event.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function processFile(file) {
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    const isCsv = file.name.endsWith('.csv');

    if (!isExcel && !isCsv) {
      showToast('不支持的文件格式', 'error');
      return;
    }

    fileInfo.name = file.name;
    fileInfo.size = formatSize(file.size);

    const reader = new FileReader();

    reader.onload = e => {
      try {
        const data = e.target.result;
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
          showToast('数据太少，无法展示', 'error');
          return;
        }

        dataLoaded.value = true;

        config.xAxis = 0;
        config.yAxis = rawData.value[0].length > 1 ? 1 : 0;
        config.title = file.name.split('.')[0];

        showToast('数据加载成功', 'success');

        nextTick(() => {
          generateChart();
        });
      } catch (err) {
        console.error(err);
        showToast('文件解析失败', 'error');
      }
    };

    if (isExcel) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file);
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
      showToast('请设置 X 轴和 Y 轴数据', 'error');
      return;
    }

    const ctx = chartCanvas.value;
    if (!ctx) return;

    if (chartInstance) {
      chartInstance.destroy();
    }

    const { labels, values } = extractData();

    const colors = generateColors(labels.length, config.theme);

    chartInstance = new Chart(ctx, {
      type: config.chartType,
      data: {
        labels,
        datasets: [
          {
            label: config.title || columns.value[config.yAxis],
            data: values,
            backgroundColor: config.chartType === 'line' ? colors[0] : colors,
            borderColor: config.chartType === 'line' ? colors[0].replace('0.7', '1') : undefined,
            borderWidth: 1,
            fill: config.chartType === 'line' || config.chartType === 'radar'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: config.showLegend
          },
          title: {
            display: !!config.title,
            text: config.title
          }
        },
        scales:
          config.chartType === 'pie' ||
          config.chartType === 'doughnut' ||
          config.chartType === 'radar'
            ? {}
            : {
                x: {
                  grid: { display: config.showGrid }
                },
                y: {
                  grid: { display: config.showGrid }
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
            borderColor: config.chartType === 'line' ? colors[0].replace('0.7', '1') : undefined,
            borderWidth: 1,
            fill: config.chartType === 'line' || config.chartType === 'radar'
          }
        ]
      },
      options: {
        animation: false,
        responsive: false,
        devicePixelRatio: 1,
        plugins: {
          legend: { display: config.showLegend },
          title: { display: !!config.title, text: config.title, font: { size: 18 * scale } }
        },
        scales:
          config.chartType === 'pie' ||
          config.chartType === 'doughnut' ||
          config.chartType === 'radar'
            ? {}
            : {
                x: { grid: { display: config.showGrid } },
                y: { grid: { display: config.showGrid } }
              }
      },
      plugins: [
        {
          id: 'custom_white_bg',
          beforeDraw: chart => {
            const ctx = chart.ctx;
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.restore();
          }
        }
      ]
    };

    if (exportConfig.options.scales.x) {
      exportConfig.options.scales.x.ticks = { font: { size: 12 * scale } };
    }
    if (exportConfig.options.scales.y) {
      exportConfig.options.scales.y.ticks = { font: { size: 12 * scale } };
    }
    exportConfig.options.plugins.legend.labels = { font: { size: 12 * scale } };

    const exportChart = new Chart(offscreenCanvas, exportConfig);

    const link = document.createElement('a');
    link.download = (config.title || 'chart') + '_hd.png';
    link.href = offscreenCanvas.toDataURL('image/png');
    link.click();

    exportChart.destroy();
    showToast('高清图片已导出', 'success');
  }

  function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
      const tableDiv = document.querySelector('.table-wrapper');
      if (tableDiv) tableDiv.scrollTop = tableDiv.scrollHeight;
    });
  }

  function removeRow(idx) {
    if (rawData.value.length <= 2) {
      showToast('至少保留一行数据', 'error');
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
      showToast('至少保留两列数据', 'error');
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

  function showToast(msg, type = 'info') {
    if (type === 'error') {
      ElMessage.error(msg);
    } else if (type === 'success') {
      ElMessage.success(msg);
    } else {
      ElMessage.info(msg);
    }
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

    showToast('模拟数据已加载', 'success');
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

    showToast('文件已开始下载', 'success');
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

    const data = [['月份', '产品', '地区', '销售额', '销量', '增长率']];

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
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

  .data-visualizer {
    --bg: #f8fafc;
    --card: #ffffff;
    --border: #e2e8f0;
    --text: #1e293b;
    --text-secondary: #64748b;
    --primary: #3b82f6;
    --primary-hover: #2563eb;
    --danger: #ef4444;
    --success: #10b981;

    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', sans-serif;
    display: flex;
    flex-direction: column;
  }

  .nav-bar {
    background: var(--card);
    border-bottom: 1px solid var(--border);
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .nav-back {
    background: none;
    border: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
  }

  .nav-back:hover {
    background: #f1f5f9;
    color: var(--primary);
  }

  .nav-center h1 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
  }

  .nav-subtitle {
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .main-content {
    flex: 1;
    max-width: 1400px;
    width: 100%;
    margin: 0 auto;
    padding: 2rem;
  }

  .upload-section {
    max-width: 600px;
    margin: 2rem auto 3rem auto;
  }

  .upload-card-content {
    background: white;
    border: 2px dashed var(--border);
    border-radius: 16px;
    padding: 3rem 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .upload-card-content:hover,
  .upload-card-content.dragover {
    border-color: var(--primary);
    background: #f8fafc;
  }

  .upload-part {
    margin-bottom: 2rem;
    width: 100%;
  }

  .upload-icon {
    color: var(--text-secondary);
    margin-bottom: 1rem;
    transition: transform 0.3s;
  }

  .upload-card-content:hover .upload-icon {
    transform: scale(1.1);
    color: var(--primary);
  }

  .upload-card-content h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .divider {
    width: 100%;
    display: flex;
    align-items: center;
    margin: 1rem 0 2rem 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .divider::before,
  .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  .divider span {
    padding: 0 1rem;
  }

  .generator-part {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .demo-btn {
    background: #eff6ff;
    color: var(--primary);
    border: 1px solid transparent;
    padding: 0.8rem 2rem;
    border-radius: 30px;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.2s;
    cursor: pointer;
    display: flex;
    align-items: center;
  }

  .demo-btn:hover {
    background: var(--primary);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
  }

  .demo-hint {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-top: 0.5rem;
  }

  .workspace {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .file-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid var(--border);
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }

  .file-name {
    font-weight: 500;
  }

  .file-size {
    color: var(--text-secondary);
    font-size: 0.9rem;
    background: #f1f5f9;
    padding: 0.1rem 0.5rem;
    border-radius: 4px;
  }

  .workspace-grid {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 1.5rem;
    align-items: start;
  }

  .sidebar {
    background: var(--card);
    border-radius: 12px;
    border: 1px solid var(--border);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .panel-section h3 {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    margin: 0 0 1rem 0;
  }

  .chart-types {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .type-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    padding: 0.6rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: white;
    cursor: pointer;
    color: var(--text-secondary);
  }

  .type-btn:hover {
    background: #f8fafc;
    color: var(--primary);
  }

  .type-btn.active {
    border-color: var(--primary);
    background: #eff6ff;
    color: var(--primary);
  }

  .type-icon {
    font-size: 1.4rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    font-size: 0.85rem;
    margin-bottom: 0.4rem;
    font-weight: 500;
  }

  .form-select,
  .form-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--border);
    border-radius: 6px;
    font-size: 0.9rem;
  }

  .form-select:focus,
  .form-input:focus {
    border-color: var(--primary);
    outline: none;
  }

  .color-themes {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .theme-dot {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
  }

  .theme-dot.active {
    border-color: var(--text);
    transform: scale(1.1);
  }

  .options-row {
    display: flex;
    gap: 1rem;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .checkbox-label input {
    display: none;
  }

  .check-box {
    width: 16px;
    height: 16px;
    border: 1px solid var(--border);
    border-radius: 4px;
    display: inline-block;
    position: relative;
  }

  .checkbox-label input:checked + .check-box {
    background: var(--primary);
    border-color: var(--primary);
  }

  .btn {
    padding: 0.6rem 1rem;
    border-radius: 6px;
    border: none;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn.primary {
    background: var(--primary);
    color: white;
  }

  .btn.primary:hover {
    background: var(--primary-hover);
  }

  .btn.secondary {
    background: white;
    border: 1px solid var(--border);
    color: var(--text);
  }

  .btn.secondary:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }

  .btn.text-danger {
    background: none;
    color: var(--danger);
  }

  .btn.text-danger:hover {
    background: #fef2f2;
  }

  .btn.full-width {
    width: 100%;
  }

  .mt-2 {
    margin-top: 0.5rem;
  }

  .preview-area {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .chart-card {
    background: var(--card);
    border-radius: 12px;
    border: 1px solid var(--border);
    padding: 1.5rem;
    height: 500px;
    position: relative;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .table-card h3 {
    margin: 0;
    font-size: 1rem;
  }

  .table-actions {
    display: flex;
    gap: 0.5rem;
  }

  .action-btn {
    border: 1px solid var(--border);
    background: white;
    border-radius: 4px;
    padding: 0.2rem 0.6rem;
    font-size: 0.8rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    color: var(--text-secondary);
    transition: all 0.2s;
  }

  .action-btn:hover {
    border-color: var(--primary);
    color: var(--primary);
    background: #eff6ff;
  }

  .action-btn .icon {
    font-size: 1rem;
    line-height: 1;
  }

  .wrapper-table {
    max-height: 500px;
    overflow-y: auto;
  }

  th.w-12 {
    width: 3rem;
    text-align: center;
    color: var(--text-secondary);
    font-weight: normal;
  }

  th.w-10 {
    width: 2.5rem;
  }

  .row-idx {
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.8rem;
    background: #f8fafc;
  }

  .th-input {
    width: 100%;
    border: none;
    background: transparent;
    font-weight: 600;
    font-size: 0.9rem;
    padding: 0.2rem;
    border-radius: 4px;
    color: var(--text);
  }

  .th-input:hover,
  .th-input:focus {
    background: white;
    box-shadow: 0 0 0 1px var(--primary);
  }

  .td-input {
    width: 100%;
    border: none;
    background: transparent;
    font-size: 0.9rem;
    padding: 0.2rem;
    border-radius: 4px;
    color: var(--text);
    font-family: inherit;
  }

  .td-input:hover,
  .td-input:focus {
    background: #f1f5f9;
    box-shadow: 0 0 0 1px var(--primary);
  }

  .del-col-btn {
    position: absolute;
    right: 2px;
    top: 50%;
    transform: translateY(-50%);
    border: none;
    background: rgba(255, 255, 255, 0.8);
    color: var(--danger);
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s;
    font-size: 1rem;
    line-height: 1;
  }

  .del-row-btn {
    border: none;
    background: none;
    color: #cbd5e1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.4rem;
    border-radius: 4px;
  }

  .del-row-btn:hover {
    color: var(--danger);
    background: #fef2f2;
  }

  .limit-hint {
    text-align: center;
    padding: 1rem;
    color: var(--text-secondary);
    font-size: 0.85rem;
    border-top: 1px solid var(--border);
  }

  .toast {
    position: fixed;
    top: 2rem;
    right: 2rem;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    color: white;
    font-size: 0.9rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 100;
  }

  .toast.success {
    background: var(--success);
  }

  .toast.error {
    background: var(--danger);
  }

  .toast-enter-active,
  .toast-leave-active {
    transition: all 0.3s ease;
  }

  .toast-enter-from,
  .toast-leave-to {
    opacity: 0;
    transform: translateX(20px);
  }

  @media (max-width: 1024px) {
    .workspace-grid {
      grid-template-columns: 1fr;
    }

    .chart-card {
      height: 400px;
    }
  }

  .intro-section {
    margin-bottom: 3rem;
    border-bottom: 1px solid var(--border);
    padding-bottom: 3rem;
  }

  .intro-section h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 2rem;
    color: var(--text);
  }

  .mt-8 {
    margin-top: 3rem;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 2rem;
  }

  .feature-card {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid var(--border);
    transition: all 0.3s;
  }

  .feature-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.05);
    border-color: var(--primary);
  }

  .icon-box {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .icon-box.primary {
    background: #eff6ff;
    color: var(--primary);
  }

  .icon-box.success {
    background: #f0fdf4;
    color: var(--success);
  }

  .icon-box.warning {
    background: #fff7ed;
    color: #f97316;
  }

  .icon-box.info {
    background: #f8fafc;
    color: var(--text-secondary);
  }

  .feature-card h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1.05rem;
  }

  .feature-card p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
    line-height: 1.6;
  }

  .steps-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
  }

  .step-item {
    display: flex;
    gap: 1rem;
  }

  .step-num {
    width: 32px;
    height: 32px;
    background: var(--primary);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    flex-shrink: 0;
    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
  }

  .step-content h4 {
    margin: 0 0 0.25rem 0;
    font-size: 1rem;
  }

  .step-content p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.85rem;
    line-height: 1.5;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(2px);
  }

  .modal-card {
    background: white;
    width: 90%;
    max-width: 450px;
    border-radius: 12px;
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);
    overflow: hidden;
    animation: contentShow 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes contentShow {
    from {
      opacity: 0;
      transform: scale(0.96);
    }

    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .modal-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-header h3 {
    margin: 0;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-secondary);
    line-height: 1;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .topic-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.8rem;
    margin-top: 0.5rem;
  }

  .topic-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.8rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.9rem;
  }

  .topic-btn:hover {
    border-color: var(--primary);
    color: var(--primary);
    background: #eff6ff;
  }

  .topic-btn.active {
    border-color: var(--primary);
    background: var(--primary);
    color: white;
  }

  .topic-icon {
    font-size: 1.2rem;
  }

  .range-input {
    width: 100%;
    margin-top: 0.5rem;
  }

  .modal-actions {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .text-secondary {
    color: var(--text-secondary);
  }

  .tool-footer {
    text-align: center;
    padding: 3rem 0;
    color: var(--text-secondary, #64748b);
    font-size: 0.85rem;
  }
</style>
