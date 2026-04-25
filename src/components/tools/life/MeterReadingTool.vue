<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">水电煤<span>.抄表()</span></h1>
        <div style="width: 120px"></div>
      </header>

      <div class="brutal-grid main-layout">
        <!-- 左侧：抄表记录 -->
        <div class="brutal-pane main-pane">
          <div class="pane-header bg-yellow">
            <span>📊 抄表记录</span>
            <div class="pane-actions">
              <select v-model="currentMeter" class="meter-select">
                <option value="water">💧 水表</option>
                <option value="electric">⚡ 电表</option>
                <option value="gas">🔥 燃气表</option>
              </select>
            </div>
          </div>

          <!-- 添加读数 -->
          <div class="add-form">
            <div class="form-row">
              <input
                v-model.number="form.reading"
                type="number"
                class="brutal-input"
                placeholder="当前读数"
                step="0.01"
              />
              <input v-model="form.date" type="date" class="brutal-input" />
              <button class="brutal-action-btn primary" @click="addReading">+ 记录</button>
            </div>
            <div class="form-row">
              <input
                v-model.number="form.price"
                type="number"
                class="brutal-input"
                placeholder="单价（元）"
                step="0.01"
              />
              <span class="unit-label">{{ currentMeterConfig.unit }} 单价</span>
            </div>
          </div>

          <!-- 当前统计 -->
          <div class="current-stats">
            <div class="stat-card">
              <div class="stat-icon">{{ currentMeterConfig.icon }}</div>
              <div class="stat-content">
                <div class="stat-label">当前读数</div>
                <div class="stat-value">{{ currentReading }} {{ currentMeterConfig.unit }}</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">📈</div>
              <div class="stat-content">
                <div class="stat-label">本月用量</div>
                <div class="stat-value">{{ monthUsage }} {{ currentMeterConfig.unit }}</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">💰</div>
              <div class="stat-content">
                <div class="stat-label">本月费用</div>
                <div class="stat-value">¥{{ monthCost.toFixed(2) }}</div>
              </div>
            </div>
          </div>

          <!-- 读数列表 -->
          <div class="readings-list">
            <div class="list-header">
              <span>日期</span>
              <span>读数</span>
              <span>用量</span>
              <span>费用</span>
            </div>
            <div v-for="(record, index) in currentRecords" :key="record.id" class="reading-row">
              <span class="reading-date">{{ formatDate(record.date) }}</span>
              <span class="reading-value">{{ record.reading }}</span>
              <span class="reading-usage">{{ getUsage(index) }}</span>
              <span class="reading-cost">¥{{ getCost(index) }}</span>
              <button class="del-btn" @click="deleteReading(record.id)">✕</button>
            </div>
            <div v-if="currentRecords.length === 0" class="empty-item">暂无抄表记录</div>
          </div>
        </div>

        <!-- 右侧：历史和统计 -->
        <div class="brutal-pane side-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">📈 用量趋势</span>
          </div>
          <div class="chart-section">
            <canvas ref="chartRef" width="320" height="200"></canvas>
          </div>

          <div class="pane-header bg-dark" style="margin-top: 1rem">
            <span class="text-white">📅 月度汇总</span>
          </div>
          <div class="monthly-summary">
            <div v-for="item in monthlyData" :key="item.month" class="monthly-row">
              <span class="month-label">{{ item.month }}</span>
              <span class="month-usage">{{ item.usage }} {{ currentMeterConfig.unit }}</span>
              <span class="month-cost">¥{{ item.cost.toFixed(2) }}</span>
            </div>
            <div v-if="monthlyData.length === 0" class="empty-item">暂无数据</div>
          </div>

          <div class="pane-header bg-green" style="margin-top: 1rem">
            <span>💡 省钱技巧</span>
          </div>
          <div class="tips-section">
            <div v-if="currentMeter === 'electric'" class="tip-item">🔌 电器不用时拔掉插头</div>
            <div v-if="currentMeter === 'electric'" class="tip-item">💡 使用LED节能灯泡</div>
            <div v-if="currentMeter === 'water'" class="tip-item">🚿 缩短淋浴时间</div>
            <div v-if="currentMeter === 'water'" class="tip-item">💧 修复漏水龙头</div>
            <div v-if="currentMeter === 'gas'" class="tip-item">🍳 盖上锅盖烹饪</div>
            <div v-if="currentMeter === 'gas'" class="tip-item">🔥 选择节能灶具</div>
          </div>
        </div>
      </div>

      <div class="brutal-status info">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i"
              >© 2026 LRM工具箱 - 水电煤抄表 // 数据本地存储 // &nbsp;</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, watch, nextTick } from 'vue';
  import { ElMessage } from 'element-plus';

  const STORAGE_KEY = 'lrm_meter_readings';

  const meterConfigs = {
    water: { icon: '💧', unit: '吨', defaultPrice: 3.5 },
    electric: { icon: '⚡', unit: '度', defaultPrice: 0.56 },
    gas: { icon: '🔥', unit: '立方', defaultPrice: 2.7 }
  };

  const currentMeter = ref('water');
  const form = ref({
    reading: null,
    date: new Date().toISOString().split('T')[0],
    price: meterConfigs.water.defaultPrice
  });
  const readings = ref({ water: [], electric: [], gas: [] });
  const chartRef = ref(null);

  const currentMeterConfig = computed(() => meterConfigs[currentMeter.value]);

  const loadReadings = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) readings.value = JSON.parse(data);
  };

  const saveReadings = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(readings.value));

  const addReading = () => {
    if (form.value.reading === null || form.value.reading < 0) {
      ElMessage.warning('请输入有效读数');
      return;
    }

    readings.value[currentMeter.value].push({
      id: Date.now(),
      reading: Number(form.value.reading),
      date: form.value.date,
      price: form.value.price || currentMeterConfig.value.defaultPrice
    });

    saveReadings();
    ElMessage.success('记录成功');
    form.value.reading = null;
  };

  const deleteReading = id => {
    readings.value[currentMeter.value] = readings.value[currentMeter.value].filter(
      r => r.id !== id
    );
    saveReadings();
    ElMessage.success('已删除');
  };

  const formatDate = date => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const currentRecords = computed(() => {
    return [...readings.value[currentMeter.value]].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  });

  const currentReading = computed(() => {
    if (currentRecords.value.length === 0) return '-';
    return currentRecords.value[0].reading;
  });

  const getUsage = index => {
    if (index >= currentRecords.value.length - 1) return '-';
    return (currentRecords.value[index].reading - currentRecords.value[index + 1].reading).toFixed(
      2
    );
  };

  const getCost = index => {
    const usage = getUsage(index);
    if (usage === '-') return '-';
    return (
      Number(usage) * (currentRecords.value[index].price || currentMeterConfig.value.defaultPrice)
    ).toFixed(2);
  };

  const monthUsage = computed(() => {
    const now = new Date();
    const thisMonth = now.toISOString().substring(0, 7);
    const monthRecords = currentRecords.value.filter(r => r.date.startsWith(thisMonth));
    if (monthRecords.length < 2) return '-';
    const sorted = [...monthRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
    return (sorted[0].reading - sorted[sorted.length - 1].reading).toFixed(0);
  });

  const monthCost = computed(() => {
    if (monthUsage.value === '-') return 0;
    const price = currentRecords.value[0]?.price || currentMeterConfig.value.defaultPrice;
    return Number(monthUsage.value) * price;
  });

  const monthlyData = computed(() => {
    const months = {};
    currentRecords.value.forEach(record => {
      const month = record.date.substring(0, 7);
      if (!months[month])
        months[month] = { records: [], minReading: Infinity, maxReading: -Infinity };
      months[month].records.push(record);
      months[month].minReading = Math.min(months[month].minReading, record.reading);
      months[month].maxReading = Math.max(months[month].maxReading, record.reading);
    });

    return Object.entries(months)
      .map(([month, data]) => ({
        month,
        usage: (data.maxReading - data.minReading).toFixed(0),
        cost:
          (data.maxReading - data.minReading) *
          (data.records[0]?.price || currentMeterConfig.value.defaultPrice)
      }))
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 6);
  });

  const drawChart = () => {
    const canvas = chartRef.value;
    if (!canvas || currentRecords.value.length < 2) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const data = [...currentRecords.value]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-10);
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = canvas.width - padding.left - padding.right;
    const chartHeight = canvas.height - padding.top - padding.bottom;

    const minVal = Math.min(...data.map(d => d.reading));
    const maxVal = Math.max(...data.map(d => d.reading));
    const range = maxVal - minVal || 1;

    ctx.strokeStyle = '#eee';
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(canvas.width - padding.right, y);
      ctx.stroke();
    }

    ctx.strokeStyle = '#4b7bff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    data.forEach((record, index) => {
      const x = padding.left + (chartWidth / (data.length - 1)) * index;
      const y = padding.top + chartHeight - ((record.reading - minVal) / range) * chartHeight;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.fillStyle = '#4b7bff';
    data.forEach((record, index) => {
      const x = padding.left + (chartWidth / (data.length - 1)) * index;
      const y = padding.top + chartHeight - ((record.reading - minVal) / range) * chartHeight;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#666';
    ctx.font = '11px "Noto Sans SC"';
    ctx.textAlign = 'center';
    data.forEach((record, index) => {
      const x = padding.left + (chartWidth / (data.length - 1)) * index;
      const d = new Date(record.date);
      ctx.fillText(`${d.getMonth() + 1}/${d.getDate()}`, x, canvas.height - 10);
    });
  };

  watch(
    [currentMeter, currentRecords],
    () => {
      form.value.price = meterConfigs[currentMeter.value].defaultPrice;
      nextTick(drawChart);
    },
    { deep: true }
  );

  onMounted(() => {
    loadReadings();
    nextTick(drawChart);
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
  }
  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
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

  .main-layout {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 2.5rem;
    margin-bottom: 2.5rem;
  }

  .brutal-pane {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
    transition: transform 0.2s;
    display: flex;
    flex-direction: column;
  }
  .brutal-pane:hover {
    transform: translate(-4px, -4px);
    box-shadow: 16px 16px 0px #111;
  }

  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.15rem;
  }

  .bg-yellow {
    background: #ffd900;
  }
  .bg-blue {
    background: #4b7bff;
  }
  .bg-dark {
    background: #111;
  }
  .bg-green {
    background: #00e572;
  }
  .text-white {
    color: #fff;
  }

  .meter-select {
    background: #fff;
    border: 3px solid #111;
    padding: 0.5rem 1rem;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
  }

  .add-form {
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
  }
  .form-row {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
    align-items: center;
  }

  .brutal-input {
    flex: 1;
    border: 3px solid #111;
    padding: 0.6rem 0.8rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    font-size: 0.95rem;
    background: #fff;
    box-shadow: 3px 3px 0px #111;
    outline: none;
  }

  .unit-label {
    font-size: 0.85rem;
    color: #666;
    font-weight: 600;
  }

  .brutal-action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.6rem 1.2rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }
  .brutal-action-btn.primary {
    background: #00e572;
  }
  .brutal-action-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }

  .current-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
  }
  .stat-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
  }
  .stat-icon {
    font-size: 1.5rem;
  }
  .stat-label {
    font-size: 0.85rem;
    color: #666;
  }
  .stat-value {
    font-size: 1.25rem;
    font-weight: 800;
    font-family: 'Syne', sans-serif;
  }

  .readings-list {
    padding: 1rem 1.5rem;
    flex: 1;
    overflow-y: auto;
    max-height: 300px;
  }
  .list-header {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 40px;
    gap: 0.5rem;
    padding: 0.5rem 0;
    border-bottom: 3px solid #111;
    font-weight: 800;
    font-size: 0.85rem;
  }
  .reading-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 40px;
    gap: 0.5rem;
    padding: 0.75rem 0;
    border-bottom: 2px solid #eee;
    align-items: center;
  }
  .reading-date,
  .reading-value,
  .reading-usage,
  .reading-cost {
    font-size: 0.9rem;
  }
  .reading-cost {
    color: #ff6b6b;
    font-weight: 700;
  }
  .del-btn {
    background: #ff4b4b;
    color: #fff;
    border: 2px solid #111;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    font-weight: 700;
    box-shadow: 2px 2px 0px #111;
  }

  .empty-item {
    text-align: center;
    padding: 2rem;
    color: #999;
    font-weight: 600;
  }

  .chart-section {
    padding: 1rem;
    text-align: center;
  }
  .monthly-summary {
    padding: 1rem;
  }
  .monthly-row {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
    border-bottom: 2px solid #eee;
  }
  .month-label {
    font-weight: 700;
  }
  .month-usage {
    color: #4b7bff;
  }
  .month-cost {
    color: #ff6b6b;
    font-weight: 700;
  }

  .tips-section {
    padding: 1rem;
  }
  .tip-item {
    padding: 0.5rem 0;
    font-size: 0.9rem;
    border-bottom: 2px solid #eee;
  }
  .tip-item:last-child {
    border-bottom: none;
  }

  .brutal-status {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    padding: 1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.2rem;
    overflow: hidden;
    text-transform: uppercase;
  }
  .marquee-wrapper {
    width: 100%;
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

  @media (max-width: 1024px) {
    .main-layout {
      grid-template-columns: 1fr;
    }
    .brutal-title {
      font-size: 2rem;
    }
  }

  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-status,
  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .meter-select {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .stat-card {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .reading-row {
    border-bottom-color: #333;
  }
  [data-theme='dark'] .list-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .monthly-row {
    border-bottom-color: #333;
  }
  [data-theme='dark'] .tip-item {
    border-bottom-color: #333;
  }
  [data-theme='dark'] .brutal-status {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .bg-green {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
</style>
