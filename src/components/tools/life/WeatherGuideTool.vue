<template>
  <div class="weather-guide-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>天气生活指南</h1>
        <span class="nav-subtitle">Weather Life Guide</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="tool-card glass-card">
        <div class="search-section">
          <div class="input-wrapper">
            <input
              v-model="cityInput"
              type="text"
              placeholder="输入城市名称 (如: 北京 / Shanghai)"
              @keyup.enter="fetchWeather"
            />
            <button class="search-btn" :disabled="loading" @click="fetchWeather">
              <el-icon v-if="loading" class="is-loading">
                <Loading />
              </el-icon>
              <span v-else>查询</span>
            </button>
          </div>
          <div class="example-cities">
            <span @click="quickSearch('北京')">北京</span>
            <span @click="quickSearch('上海')">上海</span>
            <span @click="quickSearch('广州')">广州</span>
            <span @click="quickSearch('Shenzhen')">深圳</span>
          </div>
        </div>

        <div v-if="errorMsg" class="error-msg">
          <el-icon>
            <Warning />
          </el-icon>
          {{ errorMsg }}
        </div>

        <div v-if="weatherData" class="weather-content animate-fade-in">
          <div class="weather-header">
            <div class="location-info">
              <h2>{{ weatherData.city }}</h2>
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
                  H: {{ Math.round(weatherData.daily.temperature_2m_max[0]) }}° L:
                  {{ Math.round(weatherData.daily.temperature_2m_min[0]) }}°
                </div>
              </div>
            </div>
          </div>

          <div class="keywords-bar">
            <span
              v-for="tag in calculatedKeywords"
              :key="tag.text"
              class="keyword-tag"
              :class="tag.type"
            >
              #{{ tag.text }}
            </span>
          </div>

          <div class="guide-grid">
            <div class="guide-card">
              <div class="card-icon clothing">
                <el-icon>
                  <User />
                </el-icon>
              </div>
              <div class="card-body">
                <h3>穿衣建议</h3>
                <p>{{ suggestions.clothing }}</p>
              </div>
            </div>

            <div class="guide-card">
              <div class="card-icon travel">
                <el-icon>
                  <Bicycle />
                </el-icon>
              </div>
              <div class="card-body">
                <h3>出行指南</h3>
                <p>{{ suggestions.travel }}</p>
              </div>
            </div>

            <div class="guide-card">
              <div class="card-icon sport">
                <el-icon>
                  <Basketball />
                </el-icon>
              </div>
              <div class="card-body">
                <h3>运动建议</h3>
                <p>{{ suggestions.sport }}</p>
              </div>
            </div>
          </div>

          <div class="data-source">数据来源: Open-Meteo</div>
        </div>

        <div v-else-if="!loading && !errorMsg" class="empty-state">
          <el-icon class="huge-icon">
            <Sunny />
          </el-icon>
          <p>请输入城市获取天气与生活建议</p>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 天气生活指南</footer>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import {
    Back,
    Loading,
    Warning,
    Sunny,
    User,
    Bicycle,
    Basketball
  } from '@element-plus/icons-vue';

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
        throw new Error('未找到该城市，请尝试输入英文名或拼音');
      }

      const location = geoData.results[0];
      const lat = location.latitude;
      const lon = location.longitude;
      const cityName = location.name;

      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
      const weatherRes = await fetch(weatherUrl);
      const wData = await weatherRes.json();

      weatherData.value = {
        city: cityName,
        lat,
        lon,
        current: wData.current,
        daily: wData.daily
      };
    } catch (err) {
      errorMsg.value = err.message || '获取数据失败，请稍后重试';
    } finally {
      loading.value = false;
    }
  };

  const getWmoDesc = code => {
    const codes = {
      0: '晴朗',
      1: '主要晴朗',
      2: '多云',
      3: '阴天',
      45: '雾',
      48: '沉积雾',
      51: '毛毛雨-轻',
      53: '毛毛雨-中',
      55: '毛毛雨-密',
      61: '小雨',
      63: '中雨',
      65: '大雨',
      71: '小雪',
      73: '中雪',
      75: '大雪',
      80: '阵雨-轻',
      81: '阵雨-中',
      82: '阵雨-强',
      95: '雷雨',
      96: '雷雨伴冰雹',
      99: '雷雨伴冰雹'
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
    else if (t < 10) clothing = '气温较低，建议穿着棉服、毛呢大衣或夹克。';
    else if (t < 20) clothing = '体感舒适偏凉，建议单层外套配长袖T恤。';
    else if (t < 28) clothing = '温暖舒适，建议穿着短袖、薄衬衫。';
    else clothing = '炎热高温，建议穿着透气轻薄衣物，注意防晒。';

    const isRain = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code);
    const isSnow = [71, 73, 75].includes(code);

    if (isRain) travel = '有雨水光顾，出行请记得携带雨具，路面湿滑注意安全。';
    else if (isSnow) travel = '有降雪，路面可能积雪结冰，出行请注意防滑，尽量乘坐公共交通。';
    else if (wind > 20) travel = '风力较大，出行请注意防风，小心高空坠物。';
    else travel = '天气不错，适合出行。';

    if (isRain || isSnow) sport = '户外有雨雪，不适宜户外运动，建议在室内进行瑜伽或力量训练。';
    else if (t > 30) sport = '气温过高，不宜剧烈运动，以免中暑，建议在清晨或傍晚进行轻量运动。';
    else if (t < 5) sport = '气温较低，户外运动请做好热身，运动后及时擦汗防感冒。';
    else sport = '天气条件适宜，非常适合户外跑步、打球等运动。';

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
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

  .weather-guide-tool {
    --bg: #faf9f7;
    --card: #ffffff;
    --border: #e8e6e3;
    --text: #1a1a1a;
    --text-2: #6b6b6b;
    --accent: #0ea5e9;

    --accent-light: #e0f2fe;

    font-family: 'Noto Sans SC', sans-serif;
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
  }

  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background: var(--card);
    border-bottom: 1px solid var(--border);
  }

  .nav-back,
  .nav-spacer {
    width: 80px;
  }

  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: var(--text-2);
    cursor: pointer;
    font-size: 0.9rem;
    padding: 0.5rem 0;
  }

  .nav-center h1 {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-2);
    text-transform: uppercase;
    display: block;
    text-align: center;
  }

  .main-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  .input-wrapper {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .input-wrapper input {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.2s;
  }

  .input-wrapper input:focus {
    border-color: var(--accent);
  }

  .search-btn {
    padding: 0 1.5rem;
    background: var(--text);
    color: white;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s;
    display: flex;
    align-items: center;
  }

  .search-btn:hover {
    opacity: 0.9;
  }

  .search-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .example-cities {
    display: flex;
    gap: 0.75rem;
    font-size: 0.8rem;
    color: var(--text-2);
  }

  .example-cities span {
    cursor: pointer;
    border-bottom: 1px dotted var(--text-2);
  }

  .example-cities span:hover {
    color: var(--accent);
    border-color: var(--accent);
  }

  .weather-header {
    margin-top: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--border);
  }

  .location-info h2 {
    font-size: 1.75rem;
    margin-bottom: 0.25rem;
    font-family: 'Noto Serif SC', serif;
  }

  .coords {
    font-size: 0.8rem;
    color: var(--text-2);
    font-family: monospace;
  }

  .current-weather {
    text-align: right;
  }

  .temp-big {
    font-size: 3.5rem;
    font-weight: 700;
    line-height: 1;
    color: var(--text);
  }

  .weather-text {
    font-size: 1.1rem;
    margin-bottom: 0.25rem;
  }

  .range {
    font-size: 0.9rem;
    color: var(--text-2);
  }

  .keywords-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin: 1.5rem 0;
  }

  .keyword-tag {
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .keyword-tag.blue {
    background: #eff6ff;
    color: #3b82f6;
  }

  .keyword-tag.red {
    background: #fef2f2;
    color: #ef4444;
  }

  .keyword-tag.green {
    background: #f0fdf4;
    color: #16a34a;
  }

  .keyword-tag.purple {
    background: #faf5ff;
    color: #9333ea;
  }

  .keyword-tag.orange {
    background: #fff7ed;
    color: #f97316;
  }

  .keyword-tag.gray {
    background: #f3f4f6;
    color: #4b5563;
  }

  .guide-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .guide-card {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.25rem;
    background: #f9f9f9;
    border-radius: 12px;
  }

  .card-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .card-icon.clothing {
    background: #e0e7ff;
    color: #4338ca;
  }

  .card-icon.travel {
    background: #dbeafe;
    color: #1e40af;
  }

  .card-icon.sport {
    background: #ffedd5;
    color: #c2410c;
  }

  .card-body h3 {
    font-size: 1rem;
    margin-bottom: 0.4rem;
    font-weight: 600;
  }

  .card-body p {
    font-size: 0.9rem;
    color: var(--text-2);
    line-height: 1.5;
  }

  .data-source {
    text-align: right;
    font-size: 0.75rem;
    color: #ccc;
    margin-top: 1rem;
  }

  .error-msg {
    margin-top: 1rem;
    padding: 1rem;
    background: #fef2f2;
    color: #b91c1c;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    color: #cbd5e1;
  }

  .huge-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-2);
    font-size: 0.85rem;
    border-top: 1px solid var(--border);
    margin-top: 2rem;
  }

  .animate-fade-in {
    animation: fadeIn 0.4s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (min-width: 640px) {
    .guide-grid {
      grid-template-columns: repeat(3, 1fr);
    }

    .guide-card {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
  }
</style>
