<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goHome">← 返回</button>
        <h1 class="brutal-title">单位<span>.转换()</span></h1>
        <div style="width: 120px"></div>
      </header>

      <main class="main-content">
        <section class="category-section">
          <div class="category-scroll">
            <button
              v-for="(data, key) in unitData"
              :key="key"
              class="category-chip"
              :class="{ active: currentCategory === key }"
              @click="updateCategory(key)"
            >
              <span class="chip-icon">{{ getCategoryIcon(key) }}</span>
              <span>{{ data.name }}</span>
            </button>
          </div>
        </section>

        <section class="brutal-pane converter-card">
          <div class="pane-header bg-yellow">
            <span
              >{{ getCategoryIcon(currentCategory) }}
              {{ unitData[currentCategory]?.name }} 转换</span
            >
          </div>
          <div class="pane-body">
            <div v-if="currentCategory === 'resolution'" class="dpi-section">
              <label class="section-label">像素密度 (DPI/PPI)</label>
              <div class="dpi-row">
                <input
                  v-model.number="dpi"
                  type="number"
                  class="brutal-input dpi-input"
                  @input="convert"
                />
                <span class="dpi-suffix">像素/英寸</span>
                <div class="dpi-presets">
                  <button
                    class="preset-tag"
                    @click="
                      dpi = 72;
                      convert();
                    "
                  >
                    72 (屏)
                  </button>
                  <button
                    class="preset-tag"
                    @click="
                      dpi = 96;
                      convert();
                    "
                  >
                    96 (Win)
                  </button>
                  <button
                    class="preset-tag"
                    @click="
                      dpi = 300;
                      convert();
                    "
                  >
                    300 (印)
                  </button>
                </div>
              </div>
            </div>

            <div class="input-section">
              <label class="section-label">输入</label>
              <div class="value-row">
                <input
                  v-model.number="inputValue"
                  type="number"
                  placeholder="请输入数值"
                  class="brutal-input value-input"
                  @input="convert"
                />
                <select v-model="inputUnit" class="brutal-select" @change="convert">
                  <option v-for="unit in currentUnits" :key="unit.id" :value="unit.id">
                    {{ unit.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="swap-row">
              <div class="divider-line"></div>
              <button class="swap-btn" @click="swapUnits">⇅</button>
              <div class="divider-line"></div>
            </div>

            <div class="output-section">
              <label class="section-label">结果</label>
              <div class="value-row">
                <div class="output-display">{{ outputValue || '—' }}</div>
                <select v-model="outputUnit" class="brutal-select" @change="convert">
                  <option v-for="unit in currentUnits" :key="unit.id" :value="unit.id">
                    {{ unit.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <section class="brutal-pane shortcuts-section">
          <div class="pane-header bg-blue text-white pt-1 pb-1">
            <span>⚡ 常用转换</span>
          </div>
          <div class="pane-body">
            <div class="shortcuts-list">
              <button
                v-for="(shortcut, key) in shortcuts"
                :key="key"
                class="shortcut-item"
                @click="applyShortcut(key)"
              >
                {{ shortcut.label }}
              </button>
            </div>
          </div>
        </section>

        <section class="brutal-pane history-section">
          <div class="pane-header bg-dark text-white pt-1 pb-1">
            <span>📋 转换历史</span>
            <button v-if="history.length > 0" class="clear-btn" @click="clearHistory">清空</button>
          </div>
          <div class="pane-body">
            <div v-if="history.length === 0" class="history-empty">暂无记录</div>
            <div class="history-list">
              <button
                v-for="(item, index) in history"
                :key="index"
                class="history-item"
                @click="applyHistory(item)"
              >
                <span class="history-value"
                  >{{ item.value }} <small>{{ item.fromUnitName }}</small></span
                >
                <span class="history-arrow">→</span>
                <span class="history-result"
                  >{{ item.result }} <small>{{ item.toUnitName }}</small></span
                >
              </button>
            </div>
          </div>
        </section>

        <section class="brutal-pane features-section">
          <div class="pane-header bg-green pt-1 pb-1">
            <span>✅ 功能特点</span>
          </div>
          <div class="pane-body">
            <div class="features-grid">
              <div v-for="f in features" :key="f" class="feature-item">
                <span class="feature-check">✓</span>
                {{ f }}
              </div>
            </div>
          </div>
        </section>
      </main>

      <div class="brutal-status">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i">© 2026 LRM工具箱 - 单位转换器 // &nbsp;</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';

  const unitData = {
    length: {
      name: '长度',
      units: [
        { id: 'meter', name: '米 (m)', symbol: 'm', conversion: 1 },
        { id: 'kilometer', name: '千米 (km)', symbol: 'km', conversion: 1000 },
        { id: 'centimeter', name: '厘米 (cm)', symbol: 'cm', conversion: 0.01 },
        { id: 'decimeter', name: '分米 (dm)', symbol: 'dm', conversion: 0.1 },
        { id: 'millimeter', name: '毫米 (mm)', symbol: 'mm', conversion: 0.001 },
        { id: 'micrometer', name: '微米 (μm)', symbol: 'μm', conversion: 0.000001 },
        { id: 'nanometer', name: '纳米 (nm)', symbol: 'nm', conversion: 0.000000001 },
        { id: 'inch', name: '英寸 (in)', symbol: 'in', conversion: 0.0254 },
        { id: 'foot', name: '英尺 (ft)', symbol: 'ft', conversion: 0.3048 },
        { id: 'yard', name: '码 (yd)', symbol: 'yd', conversion: 0.9144 },
        { id: 'mile', name: '英里 (mi)', symbol: 'mi', conversion: 1609.344 },
        { id: 'nautical-mile', name: '海里 (nmi)', symbol: 'nmi', conversion: 1852 },
        { id: 'li', name: '里 (li)', symbol: 'li', conversion: 500 },
        { id: 'zhang', name: '丈 (zhang)', symbol: 'zhang', conversion: 3.333 },
        { id: 'chi', name: '尺 (chi)', symbol: 'chi', conversion: 0.333 },
        { id: 'cun', name: '寸 (cun)', symbol: 'cun', conversion: 0.0333 }
      ]
    },
    weight: {
      name: '重量',
      units: [
        { id: 'kilogram', name: '千克 (kg)', symbol: 'kg', conversion: 1 },
        { id: 'gram', name: '克 (g)', symbol: 'g', conversion: 0.001 },
        { id: 'milligram', name: '毫克 (mg)', symbol: 'mg', conversion: 0.000001 },
        { id: 'microgram', name: '微克 (μg)', symbol: 'μg', conversion: 0.000000001 },
        { id: 'metric-ton', name: '吨 (t)', symbol: 't', conversion: 1000 },
        { id: 'pound', name: '磅 (lb)', symbol: 'lb', conversion: 0.45359237 },
        { id: 'ounce', name: '盎司 (oz)', symbol: 'oz', conversion: 0.028349523 },
        { id: 'stone', name: '英石 (st)', symbol: 'st', conversion: 6.35029 },
        { id: 'carat', name: '克拉 (ct)', symbol: 'ct', conversion: 0.0002 },
        { id: 'jin', name: '斤 (jin)', symbol: 'jin', conversion: 0.5 },
        { id: 'liang', name: '两 (liang)', symbol: 'liang', conversion: 0.05 },
        { id: 'qian', name: '钱 (qian)', symbol: 'qian', conversion: 0.005 }
      ]
    },
    temperature: {
      name: '温度',
      units: [
        { id: 'celsius', name: '摄氏度 (°C)', symbol: '°C' },
        { id: 'fahrenheit', name: '华氏度 (°F)', symbol: '°F' },
        { id: 'kelvin', name: '开尔文 (K)', symbol: 'K' },
        { id: 'rankine', name: '兰氏度 (°R)', symbol: '°R' }
      ]
    },
    network: {
      name: '网速',
      units: [
        { id: 'mbps', name: 'Mbps (宽带)', symbol: 'Mbps', conversion: 1 },
        { id: 'mbs', name: 'MB/s (下载)', symbol: 'MB/s', conversion: 8 },
        { id: 'kbps', name: 'Kbps', symbol: 'Kbps', conversion: 0.001 },
        { id: 'kbs', name: 'KB/s', symbol: 'KB/s', conversion: 0.008 },
        { id: 'gbps', name: 'Gbps', symbol: 'Gbps', conversion: 1000 },
        { id: 'gbs', name: 'GB/s', symbol: 'GB/s', conversion: 8000 }
      ]
    },
    resolution: {
      name: '分辨率',
      units: [
        { id: 'px', name: '像素 (px)', symbol: 'px' },
        { id: 'inch', name: '英寸 (in)', symbol: 'in', conversion: 1 },
        { id: 'cm', name: '厘米 (cm)', symbol: 'cm', conversion: 0.393701 },
        { id: 'mm', name: '毫米 (mm)', symbol: 'mm', conversion: 0.0393701 }
      ]
    },
    storage: {
      name: '存储',
      units: [
        { id: 'byte', name: '字节 (Byte)', symbol: 'B', conversion: 1 },
        { id: 'kib', name: 'KiB (二进制)', symbol: 'KiB', conversion: 1024 },
        { id: 'mib', name: 'MiB (二进制)', symbol: 'MiB', conversion: 1048576 },
        { id: 'gib', name: 'GiB (二进制)', symbol: 'GiB', conversion: 1073741824 },
        { id: 'tib', name: 'TiB (二进制)', symbol: 'TiB', conversion: 1099511627776 },
        { id: 'kb', name: 'KB (十进制)', symbol: 'KB', conversion: 1000 },
        { id: 'mb', name: 'MB (十进制)', symbol: 'MB', conversion: 1000000 },
        { id: 'gb', name: 'GB (十进制)', symbol: 'GB', conversion: 1000000000 },
        { id: 'tb', name: 'TB (十进制)', symbol: 'TB', conversion: 1000000000000 },
        { id: 'bit', name: '比特 (bit)', symbol: 'bit', conversion: 0.125 }
      ]
    },
    area: {
      name: '面积',
      units: [
        { id: 'square-meter', name: '平方米 (m²)', symbol: 'm²', conversion: 1 },
        { id: 'square-kilometer', name: '平方千米 (km²)', symbol: 'km²', conversion: 1000000 },
        { id: 'square-centimeter', name: '平方厘米 (cm²)', symbol: 'cm²', conversion: 0.0001 },
        { id: 'hectare', name: '公顷 (ha)', symbol: 'ha', conversion: 10000 },
        { id: 'acre', name: '英亩 (acre)', symbol: 'acre', conversion: 4046.856 },
        { id: 'square-foot', name: '平方英尺 (ft²)', symbol: 'ft²', conversion: 0.092903 },
        { id: 'mu', name: '亩 (mu)', symbol: 'mu', conversion: 666.667 }
      ]
    },
    volume: {
      name: '体积',
      units: [
        { id: 'liter', name: '升 (L)', symbol: 'L', conversion: 0.001 },
        { id: 'milliliter', name: '毫升 (mL)', symbol: 'mL', conversion: 0.000001 },
        { id: 'cubic-meter', name: '立方米 (m³)', symbol: 'm³', conversion: 1 },
        { id: 'cubic-centimeter', name: '立方厘米 (cm³)', symbol: 'cm³', conversion: 0.000001 },
        { id: 'gallon-us', name: '美制加仑', symbol: 'gal(US)', conversion: 0.003785 }
      ]
    },
    time: {
      name: '时间',
      units: [
        { id: 'second', name: '秒 (s)', symbol: 's', conversion: 1 },
        { id: 'minute', name: '分钟 (min)', symbol: 'min', conversion: 60 },
        { id: 'hour', name: '小时 (h)', symbol: 'h', conversion: 3600 },
        { id: 'day', name: '天 (d)', symbol: 'd', conversion: 86400 },
        { id: 'year', name: '年 (365天)', symbol: 'yr', conversion: 31536000 }
      ]
    },
    speed: {
      name: '速度',
      units: [
        { id: 'meter-per-second', name: '米/秒', symbol: 'm/s', conversion: 1 },
        { id: 'kilometer-per-hour', name: '千米/时', symbol: 'km/h', conversion: 0.277778 },
        { id: 'mile-per-hour', name: '英里/时', symbol: 'mph', conversion: 0.44704 },
        { id: 'knot', name: '节', symbol: 'kn', conversion: 0.514444 }
      ]
    },
    pressure: {
      name: '压强',
      units: [
        { id: 'pascal', name: '帕斯卡 (Pa)', symbol: 'Pa', conversion: 1 },
        { id: 'kilopascal', name: '千帕 (kPa)', symbol: 'kPa', conversion: 1000 },
        { id: 'bar', name: '巴', symbol: 'bar', conversion: 100000 },
        { id: 'atmosphere', name: '标准大气压', symbol: 'atm', conversion: 101325 },
        { id: 'psi', name: 'PSI', symbol: 'psi', conversion: 6894.76 }
      ]
    },
    energy: {
      name: '能量',
      units: [
        { id: 'joule', name: '焦耳 (J)', symbol: 'J', conversion: 1 },
        { id: 'calorie', name: '卡路里 (cal)', symbol: 'cal', conversion: 4.184 },
        { id: 'kilocalorie', name: '千卡 (kcal)', symbol: 'kcal', conversion: 4184 },
        { id: 'kilowatt-hour', name: '千瓦时 (kWh)', symbol: 'kWh', conversion: 3600000 }
      ]
    },
    power: {
      name: '功率',
      units: [
        { id: 'watt', name: '瓦特 (W)', symbol: 'W', conversion: 1 },
        { id: 'kilowatt', name: '千瓦 (kW)', symbol: 'kW', conversion: 1000 },
        { id: 'horsepower', name: '马力 (hp)', symbol: 'hp', conversion: 745.7 }
      ]
    }
  };

  const shortcuts = {
    'mbps-to-mbs': {
      category: 'network',
      fromUnit: 'mbps',
      toUnit: 'mbs',
      value: 100,
      label: '100兆宽带 → 下载速度'
    },
    'px-to-cm': {
      category: 'resolution',
      fromUnit: 'px',
      toUnit: 'cm',
      value: 1000,
      label: '1000像素 → 厘米'
    },
    'gb-to-gib': {
      category: 'storage',
      fromUnit: 'gb',
      toUnit: 'gib',
      value: 1000,
      label: '1TB硬盘 → 电脑容量'
    },
    'celsius-to-fahrenheit': {
      category: 'temperature',
      fromUnit: 'celsius',
      toUnit: 'fahrenheit',
      value: 25,
      label: '摄氏 → 华氏'
    },
    'kg-to-lb': {
      category: 'weight',
      fromUnit: 'kilogram',
      toUnit: 'pound',
      value: 1,
      label: '公斤 → 磅'
    },
    'kmh-to-mph': {
      category: 'speed',
      fromUnit: 'kilometer-per-hour',
      toUnit: 'mile-per-hour',
      value: 100,
      label: '公里/时 → 英里/时'
    }
  };

  const features = [
    '网速/存储/分辨率转换',
    '支持15种单位类型',
    '历史记录保存',
    '一键交换单位',
    '常用快捷转换',
    '响应式设计'
  ];

  const categoryIcons = {
    length: '📏',
    weight: '⚖️',
    temperature: '🌡️',
    area: '📐',
    volume: '🧊',
    time: '⏱️',
    speed: '💨',
    storage: '💾',
    network: '📶',
    resolution: '🖼️',
    pressure: '💨',
    energy: '⚡',
    power: '🔌'
  };

  const currentCategory = ref('network');
  const inputValue = ref(1);
  const inputUnit = ref('mbps');
  const outputUnit = ref('mbs');
  const outputValue = ref('');
  const dpi = ref(72);
  const history = ref([]);
  const historyLimit = 6;

  const currentUnits = computed(() => unitData[currentCategory.value]?.units || []);

  function getCategoryIcon(key) {
    return categoryIcons[key] || '📊';
  }

  function updateCategory(category) {
    currentCategory.value = category;
    const units = unitData[category].units;
    inputUnit.value = units[0].id;
    outputUnit.value = units[1]?.id || units[0].id;
    convert();
  }

  function convertTemperatureToBase(value, unit) {
    if (unit === 'celsius') return value;
    if (unit === 'fahrenheit') return ((value - 32) * 5) / 9;
    if (unit === 'kelvin') return value - 273.15;
    if (unit === 'rankine') return ((value - 491.67) * 5) / 9;
    return value;
  }

  function convertTemperatureFromBase(baseValue, unit) {
    if (unit === 'celsius') return baseValue;
    if (unit === 'fahrenheit') return (baseValue * 9) / 5 + 32;
    if (unit === 'kelvin') return baseValue + 273.15;
    if (unit === 'rankine') return ((baseValue + 273.15) * 9) / 5;
    return baseValue;
  }

  function convert() {
    const value = parseFloat(inputValue.value);
    if (isNaN(value)) {
      outputValue.value = '';
      return;
    }

    const categoryData = unitData[currentCategory.value];
    let result;

    if (currentCategory.value === 'temperature') {
      const base = convertTemperatureToBase(value, inputUnit.value);
      result = convertTemperatureFromBase(base, outputUnit.value);
    } else if (currentCategory.value === 'resolution') {
      let baseInch;
      const dpiVal = dpi.value || 72;
      if (inputUnit.value === 'px') {
        baseInch = value / dpiVal;
      } else {
        const fromUnit = categoryData.units.find(u => u.id === inputUnit.value);
        baseInch = value * fromUnit.conversion;
      }
      if (outputUnit.value === 'px') {
        result = baseInch * dpiVal;
      } else {
        const toUnit = categoryData.units.find(u => u.id === outputUnit.value);
        result = baseInch / toUnit.conversion;
      }
    } else {
      const fromUnit = categoryData.units.find(u => u.id === inputUnit.value);
      const toUnit = categoryData.units.find(u => u.id === outputUnit.value);
      const base = value * fromUnit.conversion;
      result = base / toUnit.conversion;
    }

    if (Math.abs(result) < 0.000001 && result !== 0) {
      outputValue.value = result.toExponential(4);
    } else if (Number.isInteger(result) || (result > 1000 && Math.abs(result % 1) < 0.01)) {
      outputValue.value = result.toFixed(2).replace(/\.00$/, '');
    } else {
      outputValue.value = parseFloat(result.toPrecision(6)).toString();
    }

    if (value && inputUnit.value !== outputUnit.value) {
      saveToHistory(value, inputUnit.value, outputUnit.value, outputValue.value);
    }
  }

  function swapUnits() {
    [inputUnit.value, outputUnit.value] = [outputUnit.value, inputUnit.value];
    inputValue.value = parseFloat(outputValue.value) || inputValue.value;
    convert();
  }

  function saveToHistory(value, fromUnit, toUnit, result) {
    const categoryData = unitData[currentCategory.value];
    const fromUnitName = categoryData.units.find(u => u.id === fromUnit)?.symbol || fromUnit;
    const toUnitName = categoryData.units.find(u => u.id === toUnit)?.symbol || toUnit;
    const isDuplicate = history.value.some(
      item =>
        item.category === currentCategory.value &&
        item.value === value &&
        item.fromUnit === fromUnit &&
        item.toUnit === toUnit
    );
    if (!isDuplicate) {
      history.value.unshift({
        category: currentCategory.value,
        value,
        fromUnit,
        fromUnitName,
        toUnit,
        toUnitName,
        result
      });
      if (history.value.length > historyLimit) history.value = history.value.slice(0, historyLimit);
      localStorage.setItem('converterHistory_brutal', JSON.stringify(history.value));
    }
  }

  function loadHistory() {
    const saved = localStorage.getItem('converterHistory_brutal');
    if (saved) history.value = JSON.parse(saved);
  }
  function clearHistory() {
    history.value = [];
    localStorage.removeItem('converterHistory_brutal');
  }

  function applyHistory(item) {
    if (item.category !== currentCategory.value) updateCategory(item.category);
    setTimeout(() => {
      inputValue.value = item.value;
      inputUnit.value = item.fromUnit;
      outputUnit.value = item.toUnit;
      convert();
    }, 10);
  }

  function applyShortcut(key) {
    const s = shortcuts[key];
    if (s.category !== currentCategory.value) updateCategory(s.category);
    setTimeout(() => {
      inputValue.value = s.value;
      inputUnit.value = s.fromUnit;
      outputUnit.value = s.toUnit;
      if (s.category === 'resolution') dpi.value = 72;
      convert();
    }, 10);
  }

  function goHome() {
    if (window.history.length > 1) window.history.back();
  }

  onMounted(() => {
    loadHistory();
    convert();
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
    max-width: 640px;
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
  }
  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0 0 0 #111;
  }
  .bg-yellow {
    background: #ffd900;
  }
  .bg-blue {
    background: #4b7bff;
    color: #fff;
  }
  .bg-dark {
    background: #111;
    color: #fff;
  }
  .bg-green {
    background: #00e572;
  }
  .text-white {
    color: #fff;
  }
  .pt-1 {
    padding-top: 0.5rem;
  }
  .pb-1 {
    padding-bottom: 0.5rem;
  }
  .brutal-pane {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    display: flex;
    flex-direction: column;
    overflow: hidden;
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
  .main-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .category-section {
    overflow: hidden;
  }
  .category-scroll {
    display: flex;
    flex-wrap: nowrap;
    gap: 0.5rem;
    overflow-x: auto;
    padding: 0.5rem 0;
    scrollbar-width: thin;
  }
  .category-chip {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 1rem;
    background: #fff;
    border: 3px solid #111;
    font-size: 0.9rem;
    font-weight: 800;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.1s;
    box-shadow: 3px 3px 0px #111;
  }
  .category-chip:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
    background: #fdfae5;
  }
  .category-chip.active {
    background: #4b7bff;
    color: #fff;
    box-shadow: 0 0 0 #111;
    transform: translate(3px, 3px);
  }
  .chip-icon {
    font-size: 1rem;
  }

  .section-label {
    display: block;
    font-size: 0.85rem;
    font-weight: 800;
    color: #555;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 0.75rem;
  }
  .dpi-section {
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 3px dashed #111;
  }
  .dpi-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  .dpi-input {
    width: 80px;
    text-align: center;
  }
  .dpi-suffix {
    font-size: 0.9rem;
    font-weight: 700;
    color: #555;
  }
  .dpi-presets {
    display: flex;
    gap: 0.5rem;
    margin-left: auto;
  }
  .preset-tag {
    font-size: 0.8rem;
    font-weight: 800;
    cursor: pointer;
    background: #ffd900;
    border: 2px solid #111;
    padding: 4px 8px;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.1s;
  }
  .preset-tag:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
  }

  .value-row {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  .brutal-input {
    border: 3px solid #111;
    padding: 0.75rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 1.1rem;
    background: #fff;
    box-shadow: 3px 3px 0px #111;
    outline: none;
    transition: all 0.2s;
  }
  .brutal-input:focus {
    background: #ffd900;
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }
  .value-input {
    flex: 1;
    min-width: 0;
    font-size: 1.25rem;
  }
  .brutal-select {
    border: 3px solid #111;
    padding: 0.75rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 0.95rem;
    box-shadow: 3px 3px 0px #111;
    cursor: pointer;
    outline: none;
    background: #fff;
    min-width: 130px;
    max-width: 170px;
    flex-shrink: 0;
  }
  .brutal-select:focus {
    background: #fdfae5;
  }
  .output-display {
    flex: 1;
    min-width: 0;
    background: #fdfae5;
    border: 3px solid #111;
    padding: 0.75rem;
    font-size: 1.25rem;
    font-weight: 800;
    color: #4b7bff;
    box-shadow: 3px 3px 0px #111;
  }

  .swap-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 1.5rem 0;
  }
  .divider-line {
    flex: 1;
    height: 3px;
    background: #111;
  }
  .swap-btn {
    width: 48px;
    height: 48px;
    background: #ffd900;
    border: 3px solid #111;
    font-size: 1.5rem;
    font-weight: 900;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.15s;
  }
  .swap-btn:hover {
    transform: translate(-2px, -2px) rotate(180deg);
    box-shadow: 5px 5px 0px #111;
  }
  .swap-btn:active {
    transform: translate(3px, 3px);
    box-shadow: 0 0 0 #111;
  }

  .shortcuts-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  .shortcut-item {
    background: #fff;
    border: 3px solid #111;
    padding: 0.75rem;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    text-align: center;
    transition: all 0.15s;
    box-shadow: 3px 3px 0px #111;
  }
  .shortcut-item:hover {
    background: #ffd900;
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }

  .clear-btn {
    background: #ff4b4b;
    border: 2px solid #fff;
    color: #fff;
    padding: 4px 10px;
    font-weight: 800;
    font-size: 0.85rem;
    cursor: pointer;
  }
  .clear-btn:hover {
    background: #cc0000;
  }
  .history-empty {
    text-align: center;
    padding: 2rem;
    color: #888;
    font-weight: 700;
  }
  .history-list {
    display: flex;
    flex-direction: column;
  }
  .history-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border-bottom: 2px dashed #ccc;
    cursor: pointer;
    transition: background 0.2s;
    background: transparent;
    border-left: none;
    border-right: none;
    border-top: none;
    text-align: left;
    font-weight: 700;
  }
  .history-item:last-child {
    border-bottom: none;
  }
  .history-item:hover {
    background: #fdfae5;
  }
  .history-value small,
  .history-result small {
    color: #888;
    font-weight: 600;
  }
  .history-result {
    color: #00e572;
    font-weight: 800;
  }
  .history-arrow {
    color: #555;
    font-weight: 900;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  .feature-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    font-weight: 700;
  }
  .feature-check {
    color: #00e572;
    font-weight: 900;
    font-size: 1.1rem;
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
    .shortcuts-list {
      grid-template-columns: 1fr;
    }
    .features-grid {
      grid-template-columns: 1fr;
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
  [data-theme='dark'] .category-chip,
  [data-theme='dark'] .shortcut-item,
  [data-theme='dark'] .history-item {
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
  [data-theme='dark'] .brutal-pane {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
  }
  [data-theme='dark'] .bg-dark {
    background: #333;
  }
  [data-theme='dark'] .bg-green {
    background: #00994c;
  }
  [data-theme='dark'] .category-chip {
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .category-chip:hover {
    box-shadow: 5px 5px 0px #eee;
    background: #222;
  }
  [data-theme='dark'] .category-chip.active {
    background: #2a4eb2;
    color: #fff;
    box-shadow: 0 0 0 #eee;
  }
  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .brutal-select {
    background: #222;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-input:focus {
    background: #333;
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .output-display {
    background: #222;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
    color: #89b4f8;
  }
  [data-theme='dark'] .swap-btn {
    background: #b28f00;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .swap-btn:hover {
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .divider-line {
    background: #eee;
  }
  [data-theme='dark'] .dpi-section {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .preset-tag {
    background: #b28f00;
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .shortcut-item {
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .shortcut-item:hover {
    background: #333;
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .history-item {
    border-bottom-color: #444;
  }
  [data-theme='dark'] .history-item:hover {
    background: #222;
  }
  [data-theme='dark'] .history-result {
    color: #00994c;
  }
  [data-theme='dark'] .feature-check {
    color: #00994c;
  }
  [data-theme='dark'] .section-label {
    color: #aaa;
  }
  [data-theme='dark'] .brutal-status {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
</style>
