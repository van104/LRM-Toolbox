<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon><span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">世界时区会议规划</h1>
        <span class="tool-subtitle">Timezone Planner</span>
      </div>
      <div class="header-right">
        <el-button type="primary" plain @click="addCityDialog = true">
          <el-icon><Plus /></el-icon>添加城市
        </el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="planner-layout glass-card">
        <div class="time-slider-section">
          <div class="current-ref-time">
            <span class="label">参考时间 ({{ refCity.name }}):</span>
            <span class="time-display">{{ formatTime(refDate) }}</span>
            <span class="date-display">{{ formatDate(refDate) }}</span>
          </div>
          <el-slider
            v-model="timeSliderValue"
            :min="0"
            :max="1439"
            :step="1"
            :show-tooltip="false"
            @input="onSliderChange"
          />
          <div class="slider-labels">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>24:00</span>
          </div>
        </div>

        <div class="cities-list">
          <div v-for="(city, index) in selectedCities" :key="city.id" class="city-row">
            <div class="city-info">
              <div class="city-name-box">
                <span class="city-name">{{ city.name }}</span>
                <span class="timezone-abbr">{{ getTZAbbr(city.timezone) }}</span>
              </div>
              <div class="city-time-box">
                <span class="city-local-time">{{ getLocalTime(refDate, city.timezone) }}</span>
                <span class="city-offset">{{ getOffsetLabel(city.timezone) }}</span>
              </div>
              <div class="city-actions">
                <el-button
                  v-if="index !== 0"
                  icon="Star"
                  circle
                  size="small"
                  title="设为参考城市"
                  @click="setAsRef(index)"
                />
                <el-button
                  v-if="selectedCities.length > 1"
                  type="danger"
                  icon="Delete"
                  circle
                  size="small"
                  plain
                  @click="removeCity(index)"
                />
              </div>
            </div>

            <div class="time-track">
              <div
                v-for="hour in 24"
                :key="hour"
                class="hour-cell"
                :class="getHourStatus(hour - 1, city.timezone)"
                :title="getHourTooltip(hour - 1, city.timezone)"
              >
                {{ hour - 1 }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="tips-section glass-card">
        <div class="tips-header">
          <el-icon><InfoFilled /></el-icon>
          <h4>使用技巧</h4>
        </div>
        <div class="tips-content">
          <ul class="premium-list">
            <li><b>参考城市</b>：列表第一位是基准城市，您可以点击星星按钮将任意城市置顶。</li>
            <li>
              <b>配色说明</b>：<span class="status-work">绿色</span>代表工作时间
              (09:00-18:00)，<span class="status-personal">黄色</span>代表个人时间 (07:00-09:00,
              18:00-22:00)，<span class="status-sleep">红色</span>代表休息时间。
            </li>
            <li>
              <b>智能建议</b>：在多城均为<span class="status-work">绿色</span
              >时段开启会议通常能获得最高的响应效率。
            </li>
          </ul>
        </div>
      </div>
    </main>

    <el-dialog v-model="addCityDialog" title="添加城市" width="400px" append-to-body>
      <el-select
        v-model="searchQuery"
        filterable
        remote
        reserve-keyword
        placeholder="搜索城市或时区"
        :remote-method="filterCities"
        style="width: 100%"
        @change="handleCityAdd"
      >
        <el-option
          v-for="item in cityOptions"
          :key="item.id"
          :label="item.name + ' (' + item.timezone + ')'"
          :value="item.id"
        />
      </el-select>
    </el-dialog>

    <footer class="footer">© 2026 LRM工具箱 - 世界时区会议规划</footer>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { ArrowLeft, Plus, InfoFilled } from '@element-plus/icons-vue';
  import dayjs from 'dayjs';
  import utc from 'dayjs/plugin/utc';
  import timezone from 'dayjs/plugin/timezone';

  dayjs.extend(utc);
  dayjs.extend(timezone);

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  // 预设城市数据
  const presetCities = [
    { id: 'beijing', name: '北京', timezone: 'Asia/Shanghai' },
    { id: 'london', name: '伦敦', timezone: 'Europe/London' },
    { id: 'newyork', name: '纽约', timezone: 'America/New_York' },
    { id: 'tokyo', name: '东京', timezone: 'Asia/Tokyo' },
    { id: 'sydney', name: '悉尼', timezone: 'Australia/Sydney' },
    { id: 'berlin', name: '柏林', timezone: 'Europe/Berlin' },
    { id: 'paris', name: '巴黎', timezone: 'Europe/Paris' },
    { id: 'singapore', name: '新加坡', timezone: 'Asia/Singapore' },
    { id: 'dubai', name: '迪拜', timezone: 'Asia/Dubai' },
    { id: 'losangeles', name: '洛杉矶', timezone: 'America/Los_Angeles' },
    { id: 'moscow', name: '莫斯科', timezone: 'Europe/Moscow' },
    { id: 'bangkok', name: '曼谷', timezone: 'Asia/Bangkok' }
  ];

  const selectedCities = ref([
    { id: 'beijing', name: '北京', timezone: 'Asia/Shanghai' },
    { id: 'london', name: '伦敦', timezone: 'Europe/London' },
    { id: 'newyork', name: '纽约', timezone: 'America/New_York' }
  ]);

  const refCity = computed(() => selectedCities.value[0]);
  const refDate = ref(dayjs());
  const timeSliderValue = ref(0);

  const addCityDialog = ref(false);
  const searchQuery = ref('');
  const cityOptions = ref([]);

  const filterCities = query => {
    if (query) {
      cityOptions.value = presetCities.filter(
        c => c.name.includes(query) || c.timezone.toLowerCase().includes(query.toLowerCase())
      );
    } else {
      cityOptions.value = presetCities;
    }
  };

  const handleCityAdd = id => {
    const city = presetCities.find(c => c.id === id);
    if (city && !selectedCities.value.find(c => c.id === id)) {
      selectedCities.value.push(city);
    }
    addCityDialog.value = false;
    searchQuery.value = '';
  };

  const removeCity = index => {
    selectedCities.value.splice(index, 1);
  };

  const setAsRef = index => {
    const city = selectedCities.value.splice(index, 1)[0];
    selectedCities.value.unshift(city);
    // 重置滑块到当前时间
    const now = dayjs().tz(city.timezone);
    timeSliderValue.value = now.hour() * 60 + now.minute();
    updateRefDate();
  };

  const updateRefDate = () => {
    const h = Math.floor(timeSliderValue.value / 60);
    const m = timeSliderValue.value % 60;
    refDate.value = dayjs().tz(refCity.value.timezone).hour(h).minute(m).second(0);
  };

  const onSliderChange = () => {
    updateRefDate();
  };

  const getTZAbbr = tz => {
    try {
      const d = new Date();
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        timeZoneName: 'short'
      }).formatToParts(d);
      return parts.find(p => p.type === 'timeZoneName')?.value || 'UTC';
    } catch {
      return 'UTC';
    }
  };

  const getLocalTime = (date, tz) => {
    return dayjs(date).tz(tz).format('HH:mm');
  };

  const formatDate = date => {
    return dayjs(date).format('YYYY-MM-DD');
  };

  const formatTime = date => {
    return dayjs(date).format('HH:mm');
  };

  const getOffsetLabel = tz => {
    const refOffset = dayjs(refDate.value).tz(refCity.value.timezone).utcOffset();
    const cityOffset = dayjs(refDate.value).tz(tz).utcOffset();
    const diff = (cityOffset - refOffset) / 60;
    if (diff === 0) return '相同时差';
    return (diff > 0 ? '+' : '') + diff + 'h';
  };

  const getHourStatus = (hour, tz) => {
    // 这这里的 hour 是参考城市的 hour，我们需要根据 tz 换算成所在城市的所在小时
    const cityTime = dayjs(refDate.value).tz(tz).hour(hour);
    const h = cityTime.hour();

    if (h >= 9 && h < 18) return 'status-work';
    if ((h >= 7 && h < 9) || (h >= 18 && h < 22)) return 'status-personal';
    return 'status-sleep';
  };

  const getHourTooltip = (hour, tz) => {
    const cityTime = dayjs(refDate.value).tz(tz).hour(hour);
    return cityTime.format('HH:mm') + ' (' + tz + ')';
  };

  onMounted(() => {
    const now = dayjs().tz(refCity.value.timezone);
    timeSliderValue.value = now.hour() * 60 + now.minute();
    updateRefDate();
    cityOptions.value = presetCities;
  });
</script>

<style scoped>
  .tool-page {
    min-height: 100vh;
    background: #f1f5f9;
    display: flex;
    flex-direction: column;
  }

  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-center {
    text-align: center;
    flex: 1;
  }

  .tool-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }

  .tool-subtitle {
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
  }

  .tool-content {
    flex: 1;
    padding: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .planner-layout {
    padding: 2rem;
    margin-bottom: 1.5rem;
  }

  .time-slider-section {
    margin-bottom: 3rem;
    padding: 0 1rem;
  }

  .current-ref-time {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .current-ref-time .label {
    color: #64748b;
    font-size: 0.9rem;
  }

  .current-ref-time .time-display {
    font-size: 2rem;
    font-weight: 700;
    color: #3b82f6;
    font-family: monospace;
  }

  .current-ref-time .date-display {
    color: #94a3b8;
    font-size: 1rem;
  }

  .slider-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 0.5rem;
    font-size: 0.75rem;
    color: #94a3b8;
    font-family: monospace;
  }

  .cities-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .city-row {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .city-info {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .city-name-box {
    width: 150px;
    display: flex;
    flex-direction: column;
  }

  .city-name {
    font-weight: 600;
    color: #1e293b;
  }

  .timezone-abbr {
    font-size: 0.75rem;
    color: #94a3b8;
  }

  .city-time-box {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }

  .city-local-time {
    font-size: 1.25rem;
    font-weight: 600;
    font-family: monospace;
    color: #334155;
    width: 60px;
  }

  .city-offset {
    font-size: 0.8rem;
    color: #64748b;
    background: #f1f5f9;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .city-actions {
    margin-left: auto;
    display: flex;
    gap: 0.5rem;
  }

  .time-track {
    display: grid;
    grid-template-columns: repeat(24, 1fr);
    height: 32px;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
  }

  .hour-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    color: white;
    cursor: help;
    transition: opacity 0.2s;
    user-select: none;
  }

  .hour-cell:hover {
    opacity: 0.8;
  }

  .status-work {
    background-color: #10b981;
  }

  .status-personal {
    background-color: #f59e0b;
  }

  .status-sleep {
    background-color: #ef4444;
  }

  .tips-section {
    padding: 1.5rem 2rem;
    background: linear-gradient(to bottom right, #ffffff, #f8fafc);
    border: 1px solid rgba(59, 130, 246, 0.1);
  }

  .tips-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    color: #3b82f6;
  }

  .tips-header h4 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .premium-list {
    padding-left: 1.25rem;
    margin: 0;
  }

  .premium-list li {
    margin-bottom: 0.75rem;
    color: #475569;
    font-size: 0.9rem;
    line-height: 1.6;
  }

  .premium-list li span {
    padding: 1px 4px;
    border-radius: 3px;
    color: white;
    margin: 0 2px;
    font-size: 0.8rem;
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }

  @media (max-width: 768px) {
    .city-info {
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .city-name-box {
      width: 100px;
    }
    .time-track {
      height: 24px;
    }
    .hour-cell {
      font-size: 0.6rem;
    }
  }
</style>
