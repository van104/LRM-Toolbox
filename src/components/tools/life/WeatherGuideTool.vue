<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">天气<span>.指南()</span></h1>
        <div style="width: 100px"></div>
      </header>

      <main class="main-content">
        <div class="brutal-pane tool-card">
          <div class="pane-header bg-yellow">
            <span>🌍 城市天气搜索</span>
          </div>
          <div class="pane-body">
            <div class="search-section">
              <div class="input-wrapper">
                <input
                  v-model="cityInput"
                  type="text"
                  class="brutal-input"
                  placeholder="输入城市名称 (如: 北京 / Shanghai / Tokyo)"
                  @keyup.enter="fetchWeather"
                />
                <button class="brutal-btn search-btn" :disabled="loading" @click="fetchWeather">
                  {{ loading ? '查询中...' : '🔍 查询' }}
                </button>
              </div>
              <div class="example-cities">
                <span @click="quickSearch('北京')">北京</span>
                <span @click="quickSearch('上海')">上海</span>
                <span @click="quickSearch('广州')">广州</span>
                <span @click="quickSearch('Shenzhen')">深圳</span>
              </div>
            </div>

            <div v-if="errorMsg" class="error-msg brutal-error">⚠️ {{ errorMsg }}</div>

            <div v-if="weatherData" class="weather-content animate-fade-in">
              <div class="weather-header">
                <div class="location-info">
                  <h2>📍 {{ weatherData.city }}</h2>
                  <span class="coords"
                    >{{ weatherData.lat.toFixed(2) }}°N, {{ weatherData.lon.toFixed(2) }}°E</span
                  >
                </div>
                <div class="current-weather">
                  <div class="temp-big">{{ Math.round(weatherData.current.temperature_2m) }}°</div>
                  <div class="condition">
                    <div class="weather-text">
                      {{ getWeatherDesc(weatherData.current.weather_code) }}
                    </div>
                    <div class="range">
                      HIGH: {{ Math.round(weatherData.daily.temperature_2m_max[0]) }}° LOW:
                      {{ Math.round(weatherData.daily.temperature_2m_min[0]) }}°
                    </div>
                  </div>
                </div>
              </div>

              <div class="keywords-bar">
                <span
                  v-for="tag in calculatedKeywords"
                  :key="tag.text"
                  class="brutal-tag keyword-tag"
                  :class="tag.type"
                >
                  #{{ tag.text }}
                </span>
              </div>

              <div class="guide-grid">
                <div class="brutal-pane guide-card">
                  <div class="pane-header bg-blue text-white">👕 穿衣建议</div>
                  <div class="pane-body">
                    <p>{{ suggestions.clothing }}</p>
                  </div>
                </div>

                <div class="brutal-pane guide-card">
                  <div class="pane-header bg-green text-dark">🚴 出行指南</div>
                  <div class="pane-body">
                    <p>{{ suggestions.travel }}</p>
                  </div>
                </div>

                <div class="brutal-pane guide-card">
                  <div class="pane-header bg-red text-white">🏀 运动建议</div>
                  <div class="pane-body">
                    <p>{{ suggestions.sport }}</p>
                  </div>
                </div>
              </div>

              <div class="data-source">🌐 Data Source: Open-Meteo</div>
            </div>

            <div v-else-if="!loading && !errorMsg" class="empty-state">
              <div class="huge-icon">⛅</div>
              <p>请输入城市获取天气与生活建议</p>
            </div>
          </div>
        </div>
      </main>

      <div class="brutal-status">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i">© 2026 LRM工具箱 - 天气生活指南 // &nbsp;</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';

  const cityInput = ref('');
  const loading = ref(false);
  const errorMsg = ref('');
  const weatherData = ref(null);

  const quickSearch = city => {
    cityInput.value = city;
    fetchWeather();
  };

  const fetchWeather = async () => {
    const city = cityInput.value.trim();
    if (!city) return;

    loading.value = true;
    errorMsg.value = '';
    weatherData.value = null;

    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=zh&format=json`;
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('未找到该城市，请检查拼写');
      }

      const location = geoData.results[0];
      const lat = location.latitude;
      const lon = location.longitude;
      const cityName = location.name;

      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
      const weatherRes = await fetch(weatherUrl);
      const wData = await weatherRes.json();

      weatherData.value = { city: cityName, lat, lon, current: wData.current, daily: wData.daily };
    } catch (err) {
      errorMsg.value = err.message || '网络请求失败，请稍后重试';
    } finally {
      loading.value = false;
    }
  };

  const getWmoDesc = code => {
    const codes = {
      0: '晴朗',
      1: '少部分多云',
      2: '局部多云',
      3: '阴天',
      45: '雾',
      48: '沉积雾',
      51: '毛毛雨',
      53: '中毛毛雨',
      55: '密毛毛雨',
      61: '小雨',
      63: '中雨',
      65: '大雨',
      71: '小雪',
      73: '中雪',
      75: '大雪',
      80: '阵雨',
      81: '中阵雨',
      82: '强阵雨',
      95: '雷雨',
      96: '雷阵雨伴有冰雹',
      99: '强雷阵雨带冰雹'
    };
    return codes[code] || '未知天气';
  };

  const getWeatherDesc = code => getWmoDesc(code);

  const suggestions = computed(() => {
    if (!weatherData.value) return {};
    const t = weatherData.value.current.temperature_2m;
    const code = weatherData.value.current.weather_code;
    const wind = weatherData.value.current.wind_speed_10m;

    let clothing = '';
    let travel = '';
    let sport = '';

    if (t < 0) clothing = '极寒天气，请穿戴厚羽绒服、围巾、手套，注意保暖防冻。';
    else if (t < 10) clothing = '气温较低，建议穿着棉服、毛呢大衣或保暖外套。';
    else if (t < 20) clothing = '体感舒适偏凉，建议单层外套配长袖T恤。';
    else if (t < 28) clothing = '温暖舒适，建议短袖或薄款长袖。';
    else clothing = '炎热高温，建议穿着透气轻薄衣物，注意防晒。';

    const isRain = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code);
    const isSnow = [71, 73, 75].includes(code);

    if (isRain) travel = '有降雨预计，出门务必带伞！路面湿滑请注意安全。';
    else if (isSnow) travel = '降雪将至，路面可能结冰打滑，建议乘坐公共交通。';
    else if (wind > 20) travel = '风力较强，建议避开高楼广告牌，骑车请放慢速度。';
    else travel = '天气环境良好，非常适合出行。';

    if (isRain || isSnow) sport = '室外有雨雪，不宜户外运动，建议在家里举铁或做瑜伽。';
    else if (t > 30) sport = '气温偏高，避免正午剧烈运动以免中暑，可在凉快时段轻量运动。';
    else if (t < 5) sport = '气温较低，室外运动一定要充分热身，运动完立刻添衣。';
    else sport = '温度适宜，快去户外跑两圈释放压力吧！';

    return { clothing, travel, sport };
  });

  const calculatedKeywords = computed(() => {
    if (!weatherData.value) return [];
    const list = [];
    const t = weatherData.value.current.temperature_2m;
    const code = weatherData.value.current.weather_code;

    if (t < 10) list.push({ text: '寒冷', type: 'blue' });
    else if (t > 28) list.push({ text: '炎热', type: 'red' });
    else list.push({ text: '舒适', type: 'green' });

    const desc = getWmoDesc(code);
    if (desc.includes('雨')) list.push({ text: '带伞', type: 'purple' });
    if (desc.includes('晴')) list.push({ text: '防晒', type: 'orange' });
    list.push({ text: desc, type: 'gray' });

    return list;
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
    min-height: 100vh;
    padding: 2rem;
    box-sizing: border-box;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    color: #111;
  }
  .brutal-container {
    max-width: 900px;
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
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #4b7bff;
  }
  .brutal-title span {
    color: #4b7bff;
    text-shadow: 4px 4px 0px #111;
  }
  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition: all 0.1s;
    color: #111;
    white-space: nowrap;
  }
  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0 0 0 #111;
  }
  .brutal-pane {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin-bottom: 1.5rem;
  }
  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
  }
  .pane-body {
    padding: 1.5rem;
  }
  .bg-yellow {
    background: #ffd900;
  }
  .bg-green {
    background: #00e572;
  }
  .bg-red {
    background: #ff4b4b;
  }
  .bg-blue {
    background: #4b7bff;
  }
  .bg-dark {
    background: #111;
  }
  .text-white {
    color: #fff;
  }
  .text-dark {
    color: #111;
  }

  .main-content {
    display: flex;
    flex-direction: column;
  }
  .input-wrapper {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.75rem;
    flex-wrap: wrap;
  }
  .brutal-input {
    flex: 1;
    border: 4px solid #111;
    padding: 1rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 1.1rem;
    box-shadow: 4px 4px 0px #111;
    outline: none;
    transition: all 0.2s;
    min-width: 250px;
    background: #fff;
    color: #111;
  }
  .brutal-input:focus {
    background: #fdfae5;
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .search-btn {
    font-size: 1.1rem;
    padding: 1rem 1.5rem;
  }
  .search-btn:disabled {
    background: #ddd;
    color: #888;
    cursor: not-allowed;
    box-shadow: 6px 6px 0px #111;
    transform: none;
  }

  .example-cities {
    display: flex;
    gap: 1rem;
    font-size: 0.95rem;
    font-weight: 700;
    color: #555;
  }
  .example-cities span {
    cursor: pointer;
    border-bottom: 2px dashed #111;
    transition: color 0.1s;
  }
  .example-cities span:hover {
    color: #4b7bff;
    border-color: #4b7bff;
  }

  .brutal-error {
    margin-top: 1rem;
    padding: 1rem;
    background: #ff4b4b;
    color: #fff;
    font-weight: 800;
    border: 4px solid #111;
    box-shadow: 4px 4px 0px #111;
  }

  .weather-header {
    margin-top: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    padding-bottom: 1.5rem;
    border-bottom: 4px solid #111;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .location-info h2 {
    font-size: 2.25rem;
    font-weight: 900;
    font-family: 'Syne', sans-serif;
    margin: 0 0 0.5rem;
  }
  .coords {
    font-size: 1rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    color: #555;
    background: #eee;
    padding: 4px 8px;
    border: 2px solid #111;
  }

  .current-weather {
    text-align: right;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }
  .temp-big {
    font-size: 4rem;
    font-weight: 900;
    line-height: 1;
    text-shadow: 4px 4px 0px #ffd900;
    font-family: 'Syne', sans-serif;
  }
  .condition {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    margin-top: 0.5rem;
  }
  .weather-text {
    font-size: 1.25rem;
    font-weight: 800;
    background: #111;
    color: #fff;
    padding: 2px 10px;
    border: 2px solid #111;
  }
  .range {
    font-size: 1rem;
    font-weight: 700;
    color: #111;
    margin-top: 0.5rem;
  }

  .keywords-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin: 1.5rem 0;
  }
  .brutal-tag {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 800;
    font-size: 1rem;
    padding: 0.4rem 0.8rem;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #111;
    background: #fff;
  }
  .brutal-tag.blue {
    background: #4b7bff;
    color: #fff;
  }
  .brutal-tag.red {
    background: #ff4b4b;
    color: #fff;
  }
  .brutal-tag.green {
    background: #00e572;
    color: #111;
  }
  .brutal-tag.purple {
    background: #9333ea;
    color: #fff;
  }
  .brutal-tag.orange {
    background: #ff9900;
    color: #111;
  }
  .brutal-tag.gray {
    background: #eee;
  }

  .guide-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
  }
  .guide-card {
    margin-bottom: 0;
    box-shadow: 6px 6px 0px #111;
    transition: transform 0.1s;
  }
  .guide-card:hover {
    transform: translate(-2px, -2px);
    box-shadow: 8px 8px 0px #111;
  }
  .guide-card .pane-body {
    font-weight: 600;
    font-size: 1rem;
    line-height: 1.6;
  }
  .guide-card p {
    margin: 0;
  }

  .data-source {
    text-align: right;
    font-size: 0.85rem;
    font-weight: 700;
    color: #555;
    margin-top: 1.5rem;
    font-family: monospace;
    border-top: 4px dashed #111;
    padding-top: 1rem;
  }
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 250px;
    color: #555;
    font-weight: 800;
    font-size: 1.2rem;
  }
  .huge-icon {
    font-size: 5rem;
    text-shadow: 4px 4px 0px #111;
    margin-bottom: 1rem;
  }

  .brutal-status {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    padding: 1rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.2rem;
    overflow: hidden;
  }
  .marquee-wrapper {
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
    .brutal-title {
      font-size: 2rem;
    }
    .guide-grid {
      grid-template-columns: 1fr;
    }
    .weather-header {
      flex-direction: column;
    }
    .current-weather {
      align-items: flex-start;
      text-align: left;
    }
    .condition {
      align-items: flex-start;
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
  [data-theme='dark'] .brutal-status {
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
    box-shadow: 0 0 0 #eee;
  }
  [data-theme='dark'] .brutal-btn:disabled {
    box-shadow: 6px 6px 0px #444 !important;
    border-color: #666;
    color: #666;
    background: #222;
  }
  [data-theme='dark'] .brutal-pane {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
  }
  [data-theme='dark'] .bg-green {
    background: #00994c;
  }
  [data-theme='dark'] .bg-red {
    background: #cc0000;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
  }
  [data-theme='dark'] .bg-dark {
    background: #333;
  }
  [data-theme='dark'] .brutal-input {
    background: #222;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-input:focus {
    background: #333;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .example-cities span {
    border-bottom-color: #eee;
    color: #aaa;
  }
  [data-theme='dark'] .example-cities span:hover {
    color: #89b4f8;
  }
  [data-theme='dark'] .brutal-error {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .weather-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .coords {
    background: #333;
    border-color: #eee;
    color: #ddd;
  }
  [data-theme='dark'] .temp-big {
    text-shadow: 4px 4px 0px #b28f00;
  }
  [data-theme='dark'] .weather-text {
    border-color: #eee;
  }
  [data-theme='dark'] .range {
    color: #ccc;
  }
  [data-theme='dark'] .brutal-tag {
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .brutal-tag.green {
    color: #fff;
  }
  [data-theme='dark'] .brutal-tag.orange {
    color: #fff;
    background: #cc6600;
  }
  [data-theme='dark'] .brutal-tag.gray {
    background: #444;
    color: #eee;
  }
  [data-theme='dark'] .guide-card {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .guide-card:hover {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .data-source {
    border-top-color: #eee;
    color: #aaa;
  }
  [data-theme='dark'] .empty-state {
    color: #aaa;
  }
  [data-theme='dark'] .huge-icon {
    text-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-status {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
</style>
