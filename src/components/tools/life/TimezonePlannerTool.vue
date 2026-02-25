<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">时区<span>.会议()</span></h1>
        <button class="brutal-btn add-btn" @click="addCityDialog = true">+ 添加城市</button>
      </header>

      <main class="main-content">
        <div class="brutal-pane planner-layout">
          <div class="pane-header bg-blue text-white">
            <span>🌍 时间滑块分析仪</span>
          </div>
          <div class="pane-body">
            <div class="time-slider-section">
              <div class="current-ref-time">
                <span class="label">参考时间 ({{ refCity.name }}):</span>
                <span class="time-display">{{ formatTime(refDate) }}</span>
                <span class="date-display">{{ formatDate(refDate) }}</span>
              </div>
              <input
                v-model="timeSliderValue"
                type="range"
                min="0"
                max="1439"
                step="1"
                class="brutal-range-slider"
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
                    <button
                      v-if="index !== 0"
                      class="brutal-action-btn small-btn bg-yellow"
                      title="设为参考城市"
                      @click="setAsRef(index)"
                    >
                      ⭐ 置顶
                    </button>
                    <button
                      v-if="selectedCities.length > 1"
                      class="brutal-action-btn small-btn bg-pink"
                      @click="removeCity(index)"
                    >
                      删除
                    </button>
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
        </div>

        <div class="brutal-pane tips-section">
          <div class="pane-header bg-yellow pt-1 pb-1">
            <span>💡 使用技巧</span>
          </div>
          <div class="pane-body">
            <ul class="brutal-list">
              <li>
                <b>参考城市</b>：列表第一位是基准城市，可以点击【⭐ 置顶】将任意城市设为参考时区。
              </li>
              <li>
                <b>配色说明</b>： <span class="tag-work">绿色</span> 工作时间 (09:00-18:00) |
                <span class="tag-personal">黄色</span> 个人时间 (07:00-09:00, 18:00-22:00) |
                <span class="tag-sleep">红色</span> 休息时间
              </li>
              <li>
                <b>智能建议</b>：在多城均为
                <span class="tag-work">绿色</span> 时段开启会议效率最高。
              </li>
            </ul>
          </div>
        </div>
      </main>

      <!-- Custom Brutal Modal for adding city -->
      <div v-if="addCityDialog" class="brutal-modal-overlay" @click.self="addCityDialog = false">
        <div class="brutal-modal-content brutal-pane">
          <div class="pane-header bg-dark text-white">
            <span>+ 添加目标城市</span>
            <button class="close-btn" @click="addCityDialog = false">✖</button>
          </div>
          <div class="pane-body">
            <input
              v-model="searchQuery"
              type="text"
              class="brutal-input full"
              placeholder="搜索城市名称或时区..."
              @input="filterCities(searchQuery)"
            />
            <div class="city-options-list mt-3">
              <button
                v-for="item in cityOptions"
                :key="item.id"
                class="city-option-btn"
                @click="handleCityAdd(item.id)"
              >
                <b>{{ item.name }}</b> <span>({{ item.timezone }})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="brutal-status">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i">© 2026 LRM工具箱 - 世界时区会议规划 // &nbsp;</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
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
    if (diff === 0) return '时差 0';
    return diff > 0 ? `+${diff}h` : `${diff}h`;
  };

  const getHourStatus = (hour, tz) => {
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
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

  .brutal-wrapper {
    background-color: #fdfae5;
    background-image:
      linear-gradient(#e5e5e5 2px, transparent 2px),
      linear-gradient(90deg, #e5e5e5 2px, transparent 2px);
    background-size: 40px 40px;
    background-position: -2px -2px;
    min-height: 100vh;
    padding: 2rem;
    box-sizing: border-box;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    color: #111;
  }
  .brutal-container {
    max-width: 1050px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #4b7bff;
  }
  .brutal-title span {
    color: #4b7bff;
    text-shadow: 4px 4px 0px #111;
    letter-spacing: 0;
  }

  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
    color: #111;
  }
  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }
  .add-btn {
    background: #ffd900;
  }

  .bg-yellow {
    background: #ffd900;
    color: #111;
  }
  .bg-blue {
    background: #4b7bff;
    color: #fff;
  }
  .bg-dark {
    background: #111;
    color: #fff;
  }
  .bg-pink {
    background: #ff4b4b;
    color: #fff;
  }
  .text-white {
    color: #fff;
  }

  .brutal-pane {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 10px 10px 0px #111;
    transition: transform 0.2s;
    display: flex;
    flex-direction: column;
  }
  .brutal-pane:hover {
    transform: translate(-2px, -2px);
    box-shadow: 12px 12px 0px #111;
  }
  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
  }
  .pane-body {
    padding: 1.5rem;
  }

  .main-content {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }

  /* Slider styling */
  .time-slider-section {
    margin-bottom: 3rem;
    padding: 1rem;
    background: #fdfae5;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
  }
  .current-ref-time {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
  .current-ref-time .label {
    font-weight: 700;
    font-size: 1.1rem;
  }
  .current-ref-time .time-display {
    font-size: 2.5rem;
    font-weight: 800;
    color: #4b7bff;
    font-family: 'Syne', monospace;
  }
  .current-ref-time .date-display {
    color: #555;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .brutal-range-slider {
    -webkit-appearance: none;
    width: 100%;
    height: 16px;
    background: #111;
    border: 2px solid #111;
    outline: none;
    border-radius: 0;
    box-shadow: 2px 2px 0px #4b7bff;
  }
  .brutal-range-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 28px;
    height: 28px;
    background: #ffd900;
    border: 3px solid #111;
    cursor: pointer;
    transform: translate(0, -2px);
  }
  .brutal-range-slider::-moz-range-thumb {
    width: 28px;
    height: 28px;
    background: #ffd900;
    border: 3px solid #111;
    cursor: pointer;
    border-radius: 0;
  }

  .slider-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
    font-size: 0.9rem;
    font-weight: 700;
    font-family: 'Syne', monospace;
  }

  /* Cities layout */
  .cities-list {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  .city-row {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-bottom: 1.5rem;
    border-bottom: 3px dashed #ccc;
  }
  .city-row:last-child {
    border-bottom: none;
  }

  .city-info {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
  }
  .city-name-box {
    width: 140px;
    display: flex;
    flex-direction: column;
  }
  .city-name {
    font-weight: 800;
    font-size: 1.3rem;
    font-family: 'Syne', sans-serif;
  }
  .timezone-abbr {
    font-size: 0.85rem;
    color: #555;
    font-weight: 600;
  }

  .city-time-box {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
    min-width: 140px;
  }
  .city-local-time {
    font-size: 1.8rem;
    font-weight: 800;
    font-family: 'Syne', monospace;
    color: #111;
  }
  .city-offset {
    font-size: 0.9rem;
    font-weight: 700;
    color: #fff;
    background: #111;
    padding: 2px 6px;
  }

  .city-actions {
    margin-left: auto;
    display: flex;
    gap: 0.5rem;
  }
  .brutal-action-btn {
    border: 3px solid #111;
    padding: 0.4rem 0.8rem;
    font-weight: 800;
    font-family: 'Syne', sans-serif;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.1s;
  }
  .brutal-action-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 4px 4px 0px #111;
  }
  .brutal-action-btn:active {
    transform: translate(2px, 2px);
    box-shadow: 0px 0px 0px #111;
  }

  .time-track {
    display: grid;
    grid-template-columns: repeat(24, 1fr);
    height: 40px;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
  }
  .hour-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 700;
    color: #111;
    cursor: help;
    user-select: none;
    border-right: 1px solid rgba(0, 0, 0, 0.2);
  }
  .hour-cell:last-child {
    border-right: none;
  }
  .hour-cell:hover {
    filter: brightness(1.2) contrast(1.2);
  }

  .status-work {
    background-color: #00e572;
  }
  .status-personal {
    background-color: #ffd900;
  }
  .status-sleep {
    background-color: #ff4b4b;
    color: #fff;
  }

  /* Tips section */
  .tips-section {
    margin-top: 1rem;
  }
  .brutal-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .brutal-list li {
    font-size: 0.95rem;
    color: #111;
    position: relative;
    padding-left: 1.5rem;
    line-height: 1.6;
    font-weight: 600;
  }
  .brutal-list li::before {
    content: '▪';
    position: absolute;
    left: 0;
    color: #4b7bff;
    font-weight: 900;
    font-size: 1.2rem;
  }
  .tag-work {
    background: #00e572;
    color: #111;
    padding: 2px 6px;
    font-weight: 800;
    border: 2px solid #111;
  }
  .tag-personal {
    background: #ffd900;
    color: #111;
    padding: 2px 6px;
    font-weight: 800;
    border: 2px solid #111;
  }
  .tag-sleep {
    background: #ff4b4b;
    color: #fff;
    padding: 2px 6px;
    font-weight: 800;
    border: 2px solid #111;
  }

  /* Modal styling */
  .brutal-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }
  .brutal-modal-content {
    width: 100%;
    max-width: 450px;
  }
  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #fff;
    cursor: pointer;
    outline: none;
    transition: transform 0.1s;
  }
  .close-btn:hover {
    transform: scale(1.1);
    color: #ff4b4b;
  }
  .mt-3 {
    margin-top: 1.5rem;
  }
  .brutal-input {
    border: 4px solid #111;
    padding: 1rem 1.25rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 1.1rem;
    background: #fff;
    box-shadow: 4px 4px 0px #111;
    outline: none;
    width: 100%;
    box-sizing: border-box;
  }
  .city-options-list {
    max-height: 300px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-right: 0.5rem;
    border: 3px solid #111;
    padding: 0.5rem;
    background: #fdfae5;
  }
  .city-option-btn {
    background: #fff;
    border: 3px solid #111;
    text-align: left;
    padding: 0.75rem;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.1s;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .city-option-btn:hover {
    background: #4b7bff;
    color: #fff;
    transform: translate(-2px, -2px);
    box-shadow: 4px 4px 0px #111;
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
    margin-top: 2rem;
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

  @media (max-width: 768px) {
    .brutal-header {
      justify-content: center;
    }
    .brutal-title {
      font-size: 2rem;
    }
    .city-info {
      gap: 1rem;
    }
    .time-track {
      height: 32px;
    }
    .hour-cell {
      font-size: 0.65rem;
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
  [data-theme='dark'] .brutal-status,
  [data-theme='dark'] .brutal-modal-content {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 9px 9px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }
  [data-theme='dark'] .add-btn {
    background: #b28f00;
    color: #111;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #111;
  }
  [data-theme='dark'] .bg-dark {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .bg-pink {
    background: #cc0000;
    color: #fff;
  }

  [data-theme='dark'] .brutal-pane {
    box-shadow: 10px 10px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane:hover {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }

  [data-theme='dark'] .time-slider-section {
    background: #222;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .current-ref-time .time-display {
    color: #89b4f8;
  }
  [data-theme='dark'] .current-ref-time .date-display,
  [data-theme='dark'] .timezone-abbr {
    color: #aaa;
  }
  [data-theme='dark'] .brutal-range-slider {
    background: #eee;
    border-color: #eee;
    box-shadow: 2px 2px 0px #2a4eb2;
  }
  [data-theme='dark'] .brutal-range-slider::-webkit-slider-thumb {
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-range-slider::-moz-range-thumb {
    border-color: #eee;
  }
  [data-theme='dark'] .slider-labels {
    color: #aaa;
  }

  [data-theme='dark'] .city-row {
    border-bottom-color: #444;
  }
  [data-theme='dark'] .city-name {
    color: #eee;
  }
  [data-theme='dark'] .city-local-time {
    color: #eee;
  }
  [data-theme='dark'] .city-offset {
    background: #eee;
    color: #111;
  }

  [data-theme='dark'] .brutal-action-btn {
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:hover {
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .time-track {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .hour-cell {
    border-right-color: rgba(255, 255, 255, 0.2);
  }

  [data-theme='dark'] .status-work {
    background-color: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .status-personal {
    background-color: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .status-sleep {
    background-color: #cc0000;
  }

  [data-theme='dark'] .brutal-list li {
    color: #ccc;
  }
  [data-theme='dark'] .brutal-list li::before {
    color: #89b4f8;
  }
  [data-theme='dark'] .tag-work,
  [data-theme='dark'] .tag-personal,
  [data-theme='dark'] .tag-sleep {
    border-color: #eee;
  }

  [data-theme='dark'] .brutal-input {
    background: #222;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
    color: #eee;
  }
  [data-theme='dark'] .city-options-list {
    border-color: #eee;
    background: #222;
  }
  [data-theme='dark'] .city-option-btn {
    background: #333;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .city-option-btn:hover {
    background: #2a4eb2;
    color: #fff;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-status {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
</style>
