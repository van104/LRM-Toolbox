<template>
  <div class="unit-converter">
    
    <nav class="nav-bar">
      <button class="nav-back" @click="goHome">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        返回
      </button>
      <div class="nav-center">
        <h1>单位转换器</h1>
        <span class="nav-subtitle">Unit Converter</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    
    <main class="main-content">
      
      <section class="category-section">
        <div class="category-scroll">
          <button
v-for="(data, key) in unitData" :key="key" :class="['category-chip', { active: currentCategory === key }]"
            @click="updateCategory(key)">
            <span class="chip-icon">{{ getCategoryIcon(key) }}</span>
            <span>{{ data.name }}</span>
          </button>
        </div>
      </section>

      
      <section class="converter-card">
        
        <div v-if="currentCategory === 'resolution'" class="dpi-section animate-fade-in">
          <label class="section-label">像素密度 (DPI/PPI)</label>
          <div class="dpi-row">
            <input v-model.number="dpi" type="number" class="dpi-input" @input="convert" />
            <span class="dpi-suffix">像素/英寸</span>
            <div class="dpi-presets">
              <span @click="dpi = 72; convert()">72 (屏)</span>
              <span @click="dpi = 96; convert()">96 (Win)</span>
              <span @click="dpi = 300; convert()">300 (印)</span>
            </div>
          </div>
        </div>

        
        <div class="input-section">
          <label class="section-label">输入</label>
          <div class="value-row">
            <input v-model.number="inputValue" type="number" placeholder="请输入数值" class="value-input" @input="convert" />
            <select v-model="inputUnit" class="unit-select" @change="convert">
              <option v-for="unit in currentUnits" :key="unit.id" :value="unit.id">
                {{ unit.name }}
              </option>
            </select>
          </div>
        </div>

        
        <div class="swap-row">
          <div class="divider-line"></div>
          <button class="swap-btn" @click="swapUnits">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
          <div class="divider-line"></div>
        </div>

        
        <div class="output-section">
          <label class="section-label">结果</label>
          <div class="value-row">
            <div class="output-display">{{ outputValue || '—' }}</div>
            <select v-model="outputUnit" class="unit-select" @change="convert">
              <option v-for="unit in currentUnits" :key="unit.id" :value="unit.id">
                {{ unit.name }}
              </option>
            </select>
          </div>
        </div>
      </section>

      
      <section class="shortcuts-section">
        <h3 class="section-title">常用转换</h3>
        <div class="shortcuts-list">
          <button v-for="(shortcut, key) in shortcuts" :key="key" class="shortcut-item" @click="applyShortcut(key)">
            {{ shortcut.label }}
          </button>
        </div>
      </section>

      
      <section class="history-section">
        <div class="section-header">
          <h3 class="section-title">转换历史</h3>
          <button v-if="history.length > 0" class="clear-btn" @click="clearHistory">
            清空
          </button>
        </div>
        <div class="history-list">
          <div v-if="history.length === 0" class="history-empty">
            暂无记录
          </div>
          <div v-for="(item, index) in history" :key="index" class="history-item" @click="applyHistory(item)">
            <span class="history-value">{{ item.value }} <small>{{ item.fromUnitName }}</small></span>
            <span class="history-arrow">→</span>
            <span class="history-result">{{ item.result }} <small>{{ item.toUnitName }}</small></span>
          </div>
        </div>
      </section>

      
      <section class="features-section">
        <h3 class="section-title">功能特点</h3>
        <div class="features-grid">
          <div v-for="f in features" :key="f" class="feature-item">
            <span class="feature-check">✓</span>
            {{ f }}
          </div>
        </div>
      </section>
    </main>

    
    <footer class="footer">
      © 2026 LRM工具箱 - 单位转换器
    </footer>

    
    <Transition name="toast">
      <div v-if="notification.visible" class="toast">
        {{ notification.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";

const unitData = {
  length: {
    name: "长度", units: [
      { id: "meter", name: "米 (m)", symbol: "m", conversion: 1 },
      { id: "kilometer", name: "千米 (km)", symbol: "km", conversion: 1000 },
      { id: "centimeter", name: "厘米 (cm)", symbol: "cm", conversion: 0.01 },
      { id: "decimeter", name: "分米 (dm)", symbol: "dm", conversion: 0.1 },
      { id: "millimeter", name: "毫米 (mm)", symbol: "mm", conversion: 0.001 },
      { id: "micrometer", name: "微米 (μm)", symbol: "μm", conversion: 0.000001 },
      { id: "nanometer", name: "纳米 (nm)", symbol: "nm", conversion: 0.000000001 },
      { id: "inch", name: "英寸 (in)", symbol: "in", conversion: 0.0254 },
      { id: "foot", name: "英尺 (ft)", symbol: "ft", conversion: 0.3048 },
      { id: "yard", name: "码 (yd)", symbol: "yd", conversion: 0.9144 },
      { id: "mile", name: "英里 (mi)", symbol: "mi", conversion: 1609.344 },
      { id: "nautical-mile", name: "海里 (nmi)", symbol: "nmi", conversion: 1852 },
      { id: "li", name: "里 (li)", symbol: "li", conversion: 500 },
      { id: "zhang", name: "丈 (zhang)", symbol: "zhang", conversion: 3.333 },
      { id: "chi", name: "尺 (chi)", symbol: "chi", conversion: 0.333 },
      { id: "cun", name: "寸 (cun)", symbol: "cun", conversion: 0.0333 },
    ]
  },
  weight: {
    name: "重量", units: [
      { id: "kilogram", name: "千克 (kg)", symbol: "kg", conversion: 1 },
      { id: "gram", name: "克 (g)", symbol: "g", conversion: 0.001 },
      { id: "milligram", name: "毫克 (mg)", symbol: "mg", conversion: 0.000001 },
      { id: "microgram", name: "微克 (μg)", symbol: "μg", conversion: 0.000000001 },
      { id: "metric-ton", name: "吨 (t)", symbol: "t", conversion: 1000 },
      { id: "pound", name: "磅 (lb)", symbol: "lb", conversion: 0.45359237 },
      { id: "ounce", name: "盎司 (oz)", symbol: "oz", conversion: 0.028349523 },
      { id: "stone", name: "英石 (st)", symbol: "st", conversion: 6.35029 },
      { id: "carat", name: "克拉 (ct)", symbol: "ct", conversion: 0.0002 },
      { id: "jin", name: "斤 (jin)", symbol: "jin", conversion: 0.5 },
      { id: "liang", name: "两 (liang)", symbol: "liang", conversion: 0.05 },
      { id: "qian", name: "钱 (qian)", symbol: "qian", conversion: 0.005 },
    ]
  },
  temperature: {
    name: "温度", units: [
      { id: "celsius", name: "摄氏度 (°C)", symbol: "°C" },
      { id: "fahrenheit", name: "华氏度 (°F)", symbol: "°F" },
      { id: "kelvin", name: "开尔文 (K)", symbol: "K" },
      { id: "rankine", name: "兰氏度 (°R)", symbol: "°R" },
    ]
  },
  network: {
    name: "网速", units: [ 
      { id: "mbps", name: "Mbps (宽带)", symbol: "Mbps", conversion: 1 },
      { id: "mbs", name: "MB/s (下载)", symbol: "MB/s", conversion: 8 },
      { id: "kbps", name: "Kbps", symbol: "Kbps", conversion: 0.001 },
      { id: "kbs", name: "KB/s", symbol: "KB/s", conversion: 0.008 },
      { id: "gbps", name: "Gbps", symbol: "Gbps", conversion: 1000 },
      { id: "gbs", name: "GB/s", symbol: "GB/s", conversion: 8000 },
    ]
  },
  resolution: {
    name: "分辨率", units: [ 
      { id: "px", name: "像素 (px)", symbol: "px" }, 
      { id: "inch", name: "英寸 (in)", symbol: "in", conversion: 1 },
      { id: "cm", name: "厘米 (cm)", symbol: "cm", conversion: 0.393701 },
      { id: "mm", name: "毫米 (mm)", symbol: "mm", conversion: 0.0393701 },
    ]
  },
  storage: { 
    name: "存储", units: [
      { id: "byte", name: "字节 (Byte)", symbol: "B", conversion: 1 },
      
      { id: "kib", name: "KiB (二进制)", symbol: "KiB", conversion: 1024 },
      { id: "mib", name: "MiB (二进制)", symbol: "MiB", conversion: 1048576 },
      { id: "gib", name: "GiB (二进制)", symbol: "GiB", conversion: 1073741824 },
      { id: "tib", name: "TiB (二进制)", symbol: "TiB", conversion: 1099511627776 },
      
      { id: "kb", name: "KB (十进制)", symbol: "KB", conversion: 1000 },
      { id: "mb", name: "MB (十进制)", symbol: "MB", conversion: 1000000 },
      { id: "gb", name: "GB (十进制)", symbol: "GB", conversion: 1000000000 },
      { id: "tb", name: "TB (十进制)", symbol: "TB", conversion: 1000000000000 },
      
      { id: "bit", name: "比特 (bit)", symbol: "bit", conversion: 0.125 },
    ]
  },
  area: {
    name: "面积", units: [
      { id: "square-meter", name: "平方米 (m²)", symbol: "m²", conversion: 1 },
      { id: "square-kilometer", name: "平方千米 (km²)", symbol: "km²", conversion: 1000000 },
      { id: "square-centimeter", name: "平方厘米 (cm²)", symbol: "cm²", conversion: 0.0001 },
      { id: "hectare", name: "公顷 (ha)", symbol: "ha", conversion: 10000 },
      { id: "acre", name: "英亩 (acre)", symbol: "acre", conversion: 4046.856 },
      { id: "square-foot", name: "平方英尺 (ft²)", symbol: "ft²", conversion: 0.092903 },
      { id: "mu", name: "亩 (mu)", symbol: "mu", conversion: 666.667 },
    ]
  },
  volume: {
    name: "体积", units: [
      { id: "liter", name: "升 (L)", symbol: "L", conversion: 0.001 },
      { id: "milliliter", name: "毫升 (mL)", symbol: "mL", conversion: 0.000001 },
      { id: "cubic-meter", name: "立方米 (m³)", symbol: "m³", conversion: 1 },
      { id: "cubic-centimeter", name: "立方厘米 (cm³)", symbol: "cm³", conversion: 0.000001 },
      { id: "gallon-us", name: "美制加仑", symbol: "gal(US)", conversion: 0.003785 },
    ]
  },
  time: {
    name: "时间", units: [
      { id: "second", name: "秒 (s)", symbol: "s", conversion: 1 },
      { id: "minute", name: "分钟 (min)", symbol: "min", conversion: 60 },
      { id: "hour", name: "小时 (h)", symbol: "h", conversion: 3600 },
      { id: "day", name: "天 (d)", symbol: "d", conversion: 86400 },
      { id: "year", name: "年 (365天)", symbol: "yr", conversion: 31536000 },
    ]
  },
  speed: {
    name: "速度", units: [
      { id: "meter-per-second", name: "米/秒", symbol: "m/s", conversion: 1 },
      { id: "kilometer-per-hour", name: "千米/时", symbol: "km/h", conversion: 0.277778 },
      { id: "mile-per-hour", name: "英里/时", symbol: "mph", conversion: 0.44704 },
      { id: "knot", name: "节", symbol: "kn", conversion: 0.514444 },
    ]
  },
  pressure: {
    name: "压强", units: [
      { id: "pascal", name: "帕斯卡 (Pa)", symbol: "Pa", conversion: 1 },
      { id: "kilopascal", name: "千帕 (kPa)", symbol: "kPa", conversion: 1000 },
      { id: "bar", name: "巴", symbol: "bar", conversion: 100000 },
      { id: "atmosphere", name: "标准大气压", symbol: "atm", conversion: 101325 },
      { id: "psi", name: "PSI", symbol: "psi", conversion: 6894.76 },
    ]
  },
  energy: {
    name: "能量", units: [
      { id: "joule", name: "焦耳 (J)", symbol: "J", conversion: 1 },
      { id: "calorie", name: "卡路里 (cal)", symbol: "cal", conversion: 4.184 },
      { id: "kilocalorie", name: "千卡 (kcal)", symbol: "kcal", conversion: 4184 },
      { id: "kilowatt-hour", name: "千瓦时 (kWh)", symbol: "kWh", conversion: 3600000 },
    ]
  },
  power: {
    name: "功率", units: [
      { id: "watt", name: "瓦特 (W)", symbol: "W", conversion: 1 },
      { id: "kilowatt", name: "千瓦 (kW)", symbol: "kW", conversion: 1000 },
      { id: "horsepower", name: "马力 (hp)", symbol: "hp", conversion: 745.7 },
    ]
  }
};

const shortcuts = {
  "mbps-to-mbs": { category: "network", fromUnit: "mbps", toUnit: "mbs", value: 100, label: "100兆宽带 → 下载速度" },
  "px-to-cm": { category: "resolution", fromUnit: "px", toUnit: "cm", value: 1000, label: "1000像素 → 厘米" },
  "gb-to-gib": { category: "storage", fromUnit: "gb", toUnit: "gib", value: 1000, label: "1TB硬盘 → 电脑容量" },
  "celsius-to-fahrenheit": { category: "temperature", fromUnit: "celsius", toUnit: "fahrenheit", value: 25, label: "摄氏 → 华氏" },
  "kg-to-lb": { category: "weight", fromUnit: "kilogram", toUnit: "pound", value: 1, label: "公斤 → 磅" },
  "kmh-to-mph": { category: "speed", fromUnit: "kilometer-per-hour", toUnit: "mile-per-hour", value: 100, label: "公里/时 → 英里/时" },
};

const features = [
  "网速/存储/分辨率转换 (NEW)",
  "支持15种单位类型",
  "历史记录保存",
  "一键交换单位",
  "常用快捷转换",
  "响应式设计",
];

const categoryIcons = { length: "📏", weight: "⚖️", temperature: "🌡️", area: "📐", volume: "🧊", time: "⏱️", speed: "💨", storage: "💾", network: "📶", resolution: "🖼️", pressure: "💨", energy: "⚡", power: "🔌" };

const currentCategory = ref("network"); 
const inputValue = ref(1);
const inputUnit = ref("mbps");
const outputUnit = ref("mbs");
const outputValue = ref("");
const dpi = ref(72); 
const history = ref([]);
const historyLimit = 6;
const notification = reactive({ visible: false, message: "" });

const currentUnits = computed(() => unitData[currentCategory.value]?.units || []);

function getCategoryIcon(key) { return categoryIcons[key] || "📊"; }

function updateCategory(category) {
  currentCategory.value = category;
  const units = unitData[category].units;
  inputUnit.value = units[0].id;
  outputUnit.value = units[1]?.id || units[0].id;
  convert();
}

function convertTemperatureToBase(value, unit) {
  if (unit === "celsius") return value;
  if (unit === "fahrenheit") return ((value - 32) * 5) / 9;
  if (unit === "kelvin") return value - 273.15;
  if (unit === "rankine") return (value - 491.67) * 5 / 9;
  return value;
}

function convertTemperatureFromBase(baseValue, unit) {
  if (unit === "celsius") return baseValue;
  if (unit === "fahrenheit") return (baseValue * 9) / 5 + 32;
  if (unit === "kelvin") return baseValue + 273.15;
  if (unit === "rankine") return (baseValue + 273.15) * 9 / 5;
  return baseValue;
}

function convert() {
  const value = parseFloat(inputValue.value);
  if (isNaN(value)) { outputValue.value = ""; return; }

  const categoryData = unitData[currentCategory.value];
  let result;

  if (currentCategory.value === "temperature") {
    const base = convertTemperatureToBase(value, inputUnit.value);
    result = convertTemperatureFromBase(base, outputUnit.value);
  } else if (currentCategory.value === "resolution") {
    
    let baseInch;
    const dpiVal = dpi.value || 72;

    if (inputUnit.value === "px") {
      baseInch = value / dpiVal;
    } else {
      const fromUnit = categoryData.units.find(u => u.id === inputUnit.value);
      baseInch = value * fromUnit.conversion;
    }

    if (outputUnit.value === "px") {
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

  const isDuplicate = history.value.some(item =>
    item.category === currentCategory.value && item.value === value &&
    item.fromUnit === fromUnit && item.toUnit === toUnit
  );

  if (!isDuplicate) {
    history.value.unshift({ category: currentCategory.value, value, fromUnit, fromUnitName, toUnit, toUnitName, result });
    if (history.value.length > historyLimit) history.value = history.value.slice(0, historyLimit);
    localStorage.setItem("converterHistory", JSON.stringify(history.value));
  }
}

function loadHistory() {
  const saved = localStorage.getItem("converterHistory");
  if (saved) history.value = JSON.parse(saved);
}

function clearHistory() {
  history.value = [];
  localStorage.removeItem("converterHistory");
  showToast("已清空历史记录");
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

function showToast(msg) {
  notification.message = msg;
  notification.visible = true;
  setTimeout(() => notification.visible = false, 2000);
}

function goHome() {
  if (window.history.length > 1) window.history.back();
  else alert("返回首页");
}

onMounted(() => { loadHistory(); convert(); });
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.unit-converter {
  --bg: #faf9f7;
  --card: #ffffff;
  --border: #e8e6e3;
  --text: #1a1a1a;
  --text-secondary: #6b6b6b;
  --text-muted: #9a9a9a;
  --accent: #2563eb;
  --accent-light: #eff6ff;
  --success: #059669;
  --shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.04);

  font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
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

.nav-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.5rem;
  margin: -0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.nav-back:hover {
  background: var(--accent-light);
  color: var(--accent);
}

.nav-center {
  text-align: center;
}

.nav-center h1 {
  font-family: 'Noto Serif SC', serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
  letter-spacing: 0.02em;
}

.nav-subtitle {
  font-size: 0.7rem;
  color: var(--text-muted);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.nav-spacer {
  width: 60px;
}


.main-content {
  max-width: 540px;
  margin: 0 auto;
  padding: 1.5rem;
}


.category-section {
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.category-scroll {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.5rem;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0.5rem 0.25rem;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

.category-scroll::-webkit-scrollbar {
  height: 4px;
}

.category-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.category-scroll::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 2px;
}

.category-chip {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1rem;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 100px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.category-chip:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.category-chip.active {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}

.chip-icon {
  font-size: 1rem;
}


.converter-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.section-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.75rem;
}

.dpi-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px dashed var(--border);
}

.dpi-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.dpi-input {
  width: 80px;
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  color: var(--text);
}

.dpi-input:focus {
  border-color: var(--accent);
  outline: none;
}

.dpi-suffix {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.dpi-presets {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

.dpi-presets span {
  font-size: 0.75rem;
  color: var(--accent);
  cursor: pointer;
  background: var(--accent-light);
  padding: 4px 8px;
  border-radius: 4px;
}

.dpi-presets span:hover {
  background: #dbeafe;
}

.value-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.value-input {
  flex: 1;
  min-width: 0;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text);
  outline: none;
  transition: border-color 0.2s;
}

.value-input:focus {
  border-color: var(--accent);
}

.value-input::placeholder {
  color: var(--text-muted);
  font-weight: 400;
}

.output-display {
  flex: 1;
  min-width: 0;
  background: var(--accent-light);
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--accent);
}

.unit-select {
  flex-shrink: 0;
  min-width: 120px;
  max-width: 160px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0.875rem 2.5rem 0.875rem 1rem;
  font-size: 0.9rem;
  color: var(--text);
  cursor: pointer;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b6b6b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 14px;
}

.unit-select:focus {
  border-color: var(--accent);
}


.swap-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.25rem 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: var(--border);
}

.swap-btn {
  width: 44px;
  height: 44px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 50%;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.swap-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  transform: rotate(180deg);
}


.shortcuts-section,
.history-section,
.features-section {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  box-shadow: var(--shadow);
}

.section-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header .section-title {
  margin-bottom: 0;
}

.shortcuts-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.shortcut-item {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0.75rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}

.shortcut-item:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}


.clear-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.clear-btn:hover {
  color: #dc2626;
  background: #fef2f2;
}

.history-list {
  max-height: 200px;
  overflow-y: auto;
}

.history-empty {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
}

.history-item:hover {
  background: var(--bg);
}

.history-value,
.history-result {
  font-size: 0.9rem;
}

.history-value small,
.history-result small {
  color: var(--text-muted);
  font-weight: 400;
}

.history-result {
  color: var(--success);
  font-weight: 500;
}

.history-arrow {
  color: var(--text-muted);
}


.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.feature-check {
  color: var(--success);
  font-weight: bold;
}


.footer {
  text-align: center;
  padding: 2rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}


.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: var(--text);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 100px;
  font-size: 0.85rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}

.animate-fade-in {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
