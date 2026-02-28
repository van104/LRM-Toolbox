<template>
  <div v-if="modelValue" class="modal-overlay" @click="$emit('update:modelValue', false)">
    <div class="modal-card brutal-pane" @click.stop>
      <div class="modal-header bg-yellow">
        <div class="header-left">
          <span class="mr-2 icon-spin">✨</span>
          <h3 class="modal-title">生成演示数据</h3>
        </div>
        <button class="close-btn" @click="$emit('update:modelValue', false)">✕</button>
      </div>

      <div class="modal-body">
        <div class="info-banner">
          <span class="banner-icon">💡</span>
          <p>选择一个数据主题，我们将为你即时生成符合格式的模拟业务数据。</p>
        </div>

        <div class="form-section">
          <div class="section-tag bg-pink">STEP 01</div>
          <label class="section-label">选择数据主题 (THEME)</label>
          <div class="topic-grid">
            <button
              v-for="topic in generatorTopics"
              :key="topic.value"
              class="topic-btn"
              :class="{ 'active bg-cyan': genConfig.type === topic.value }"
              @click="genConfig.type = topic.value"
            >
              <span class="topic-icon">{{ topic.icon }}</span>
              <span class="topic-label">{{ topic.label }}</span>
              <div v-if="genConfig.type === topic.value" class="active-dot"></div>
            </button>
          </div>
        </div>

        <div class="form-section">
          <div class="section-tag bg-green">STEP 02</div>
          <div class="label-row">
            <label class="section-label">生成数据量 (ROWS)</label>
            <span class="row-badge">{{ genConfig.rows }} ROWS</span>
          </div>
          <div class="slider-container">
            <input
              v-model.number="genConfig.rows"
              type="range"
              min="5"
              max="50"
              class="brutal-slider"
            />
            <div class="slider-marks">
              <span>5</span>
              <span>25</span>
              <span>50</span>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="brutal-btn primary-btn" @click="handleGenerateAndLoad">
            <span class="btn-icon">🚀</span>
            生成并在预览中加载
          </button>
          <button class="brutal-btn secondary-btn" @click="handleGenerateAndDownload">
            <span class="btn-icon">💾</span>
            仅导出 Excel 文件
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { reactive } from 'vue';
  import * as XLSX from 'xlsx';
  import { ElMessage } from 'element-plus';

  defineProps({
    modelValue: Boolean
  });

  const emit = defineEmits(['update:modelValue', 'load-data']);

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

  function generateData(type, rows) {
    switch (type) {
      case 'sales':
        return generateSalesData(rows);
      case 'population':
        return generatePopulationData(rows);
      case 'weather':
        return generateWeatherData(rows);
      case 'finance':
        return generateFinanceData(rows);
      default:
        return generateSalesData(rows);
    }
  }

  function handleGenerateAndLoad() {
    const data = generateData(genConfig.type, genConfig.rows);
    const topic = generatorTopics.find(t => t.value === genConfig.type);
    emit('load-data', {
      data,
      fileName: `模拟${topic.label}.xlsx`
    });
    emit('update:modelValue', false);
  }

  function handleGenerateAndDownload() {
    const data = generateData(genConfig.type, genConfig.rows);
    const topic = generatorTopics.find(t => t.value === genConfig.type);
    const fileName = `模拟${topic.label}_${new Date().toISOString().slice(0, 10)}.xlsx`;

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, fileName);

    ElMessage.success('文件已开始下载');
  }

  // --- Data Generation Logic ---
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
      data.push([
        months[i % months.length],
        products[Math.floor(Math.random() * products.length)],
        regions[Math.floor(Math.random() * regions.length)],
        Math.floor(10000 + Math.random() * 90000),
        Math.floor(10 + Math.random() * 990),
        (Math.random() * 20 - 5).toFixed(2)
      ]);
    }
    return data;
  }

  function generatePopulationData(rows) {
    const cities = ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉', '重庆', '西安'];
    const ageGroups = ['0-14岁', '15-64岁', '65岁以上'];
    const data = [['城市', '年份', '年龄组', '人口(万)', '占比', '增长率']];
    for (let i = 0; i < rows; i++) {
      data.push([
        cities[i % cities.length],
        2020 + Math.floor(i / cities.length),
        ageGroups[Math.floor(Math.random() * ageGroups.length)],
        Math.floor(50 + Math.random() * 950),
        (Math.random() * 80 + 10).toFixed(2),
        (Math.random() * 3 + 0.5).toFixed(2)
      ]);
    }
    return data;
  }

  function generateWeatherData(rows) {
    const cities = ['北京', '上海', '广州', '深圳', '杭州', '哈尔滨', '昆明', '拉萨'];
    const data = [['城市', '日期', '最高温', '最低温', '降水量', '湿度', '风速']];
    for (let i = 0; i < rows; i++) {
      const highTemp = Math.floor(15 + Math.random() * 30);
      data.push([
        cities[i % cities.length],
        `2023-07-${(i % 30) + 1}`,
        highTemp,
        highTemp - Math.floor(5 + Math.random() * 10),
        (Math.random() * 50).toFixed(1),
        Math.floor(30 + Math.random() * 70),
        (Math.random() * 20).toFixed(1)
      ]);
    }
    return data;
  }

  function generateFinanceData(rows) {
    const departments = ['销售部', '市场部', '研发部', '人力资源部', '财务部', '行政部'];
    const data = [['部门', '季度', '预算', '实际支出', '节省', '同比变化']];
    for (let i = 0; i < rows; i++) {
      const budget = Math.floor(100000 + Math.random() * 900000);
      const actual = Math.floor(budget * 0.7 + Math.random() * budget * 0.25);
      data.push([
        departments[i % departments.length],
        `Q${(i % 4) + 1}`,
        budget,
        actual,
        budget - actual,
        (Math.random() * 20 - 10).toFixed(2)
      ]);
    }
    return data;
  }
</script>

<style scoped>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 1rem;
  }

  .modal-card {
    width: 100%;
    max-width: 520px;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 16px 16px 0px #111;
    display: flex;
    flex-direction: column;
    animation: modal-in 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
  }

  @keyframes modal-in {
    from {
      transform: translateY(20px) scale(0.95);
      opacity: 0;
    }
    to {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
  }

  .modal-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 4px solid #111;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-left {
    display: flex;
    align-items: center;
  }

  .modal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.4rem;
    font-weight: 900;
    margin: 0;
  }

  .icon-spin {
    font-size: 1.6rem;
    animation: star-pulse 2s infinite ease-in-out;
  }

  @keyframes star-pulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.2) rotate(10deg);
      opacity: 0.8;
    }
  }

  .close-btn {
    background: transparent;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    font-weight: bold;
    line-height: 1;
  }

  .modal-body {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .info-banner {
    background: #111;
    color: #fff;
    padding: 1.25rem;
    display: flex;
    gap: 1rem;
    align-items: center;
    border: 3px solid #111;
  }

  .banner-icon {
    font-size: 1.5rem;
  }
  .info-banner p {
    margin: 0;
    font-weight: 600;
    font-size: 0.95rem;
    line-height: 1.4;
  }

  .form-section {
    display: flex;
    flex-direction: column;
    position: relative;
    padding-top: 1.5rem;
  }

  .section-tag {
    position: absolute;
    top: -0.5rem;
    left: 0;
    padding: 0.2rem 0.6rem;
    border: 3px solid #111;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    font-size: 0.75rem;
    z-index: 5;
  }

  .section-label {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }

  .label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .row-badge {
    background: #ffd900;
    border: 3px solid #111;
    padding: 0.2rem 0.75rem;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    font-size: 0.85rem;
    box-shadow: 2px 2px 0px #111;
  }

  .topic-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .topic-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }

  .topic-btn:hover {
    background: #f8fafc;
    transform: translate(-3px, -3px);
    box-shadow: 5px 5px 0px #111;
  }

  .topic-btn.active {
    background: #00ffff;
    box-shadow: 5px 5px 0px #111;
    transform: translate(-3px, -3px);
  }

  .topic-icon {
    font-size: 1.5rem;
  }
  .topic-label {
    font-weight: 800;
    font-size: 1.05rem;
  }

  .active-dot {
    position: absolute;
    top: 5px;
    right: 5px;
    width: 10px;
    height: 10px;
    background: #111;
    border-radius: 50%;
  }

  .slider-container {
    padding: 0.5rem 0;
  }

  .brutal-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 16px;
    background: #111;
    border: 3px solid #111;
    outline: none;
    box-shadow: 4px 4px 0px #ffd900;
  }

  .brutal-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 32px;
    height: 32px;
    background: #ff4b4b;
    border: 4px solid #111;
    cursor: pointer;
    transition: all 0.1s;
  }

  .brutal-slider::-webkit-slider-thumb:hover {
    background: #fff;
    transform: scale(1.1);
  }

  .slider-marks {
    display: flex;
    justify-content: space-between;
    margin-top: 0.75rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 0.85rem;
  }

  .modal-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
  }

  .brutal-btn {
    padding: 1.1rem;
    border: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1.1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    transition: all 0.1s;
    box-shadow: 6px 6px 0px #111;
  }

  .primary-btn {
    background: #4b7bff;
    color: #fff;
  }

  .secondary-btn {
    background: #fff;
    color: #111;
  }

  .brutal-btn:hover {
    transform: translate(-4px, -4px);
    box-shadow: 10px 10px 0px #111;
  }

  .brutal-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px #111;
  }

  .bg-pink {
    background: #ff66b2;
  }
  .bg-green {
    background: #00e572;
  }
  .bg-cyan {
    background: #00ffff;
  }
  .bg-yellow {
    background: #ffd900;
  }
</style>
