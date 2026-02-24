<template>
  <div class="color-picker-tool brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <div class="header-action start">
          <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        </div>
        <div class="header-text">
          <h1 class="brutal-title">颜色<span>.选择器()</span></h1>
          <p class="tool-subtitle">专业的颜色转换与配色工具，支持 HEX、RGB、HSL 互转</p>
        </div>
        <div class="header-action end">
          <button
            v-if="savedColors.length > 0"
            class="brutal-btn clear-btn"
            @click="clearSavedColors"
          >
            🗑️ 清空历史
          </button>
        </div>
      </header>

      <div class="brutal-grid">
        <!-- 左侧: 预览与推荐 -->
        <div class="cp-sidebar">
          <div class="brutal-pane preview-panel">
            <h2 class="pane-title"><span class="icon">🎨</span> 颜色预览</h2>

            <div class="main-preview brutal-shadow" :style="{ backgroundColor: currentColor.hex }">
              <div
                class="hex-trigger brutal-btn"
                :style="{
                  color: isDark ? 'white' : '#111',
                  backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.8)'
                }"
                title="点击复制"
                @click="copyColor"
              >
                {{ currentColor.hex }}
              </div>
            </div>

            <div class="comp-section mt-4">
              <h3 class="section-label">互补色方案</h3>
              <div class="comp-grid">
                <div
                  v-for="(color, idx) in complementaryColors"
                  :key="idx"
                  class="comp-item brutal-shadow"
                  :style="{ backgroundColor: color }"
                  :title="'点击应用: ' + color"
                  @click="setColorFromHex(color)"
                ></div>
              </div>
            </div>

            <div class="actions-group mt-4">
              <input
                ref="colorInput"
                type="color"
                class="hidden-color-input"
                :value="currentColor.hex"
                @input="handleNativeColorPicker"
              />

              <div class="btn-row">
                <button class="brutal-btn action-btn bg-yellow" @click="triggerColorPicker">
                  <span>调色板</span>
                </button>

                <button
                  v-if="isEyeDropperSupported"
                  class="brutal-btn action-btn bg-cyan"
                  @click="pickScreenColor"
                >
                  <span>屏幕吸管</span>
                </button>
                <button
                  class="brutal-btn action-btn icon-btn"
                  title="复制HEX代码"
                  @click="copyColor"
                >
                  📋
                </button>
              </div>

              <div class="btn-row mt-2">
                <button class="brutal-btn action-btn bg-blue text-white" @click="saveCurrentColor">
                  💾 保存
                </button>
                <button class="brutal-btn action-btn bg-pink" @click="generateRandomColor">
                  🎲 随机
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧: 控制面板 -->
        <div class="cp-main">
          <div class="brutal-pane control-panel">
            <div class="panel-header-row">
              <h2 class="pane-title">参数调整</h2>

              <div class="format-tabs">
                <button
                  v-for="format in ['hex', 'rgb', 'hsl']"
                  :key="format"
                  class="mode-tab"
                  :class="{ active: activeFormat === format }"
                  @click="activeFormat = format"
                >
                  {{ format.toUpperCase() }}
                </button>
              </div>
            </div>

            <div v-if="activeFormat === 'hex'" class="control-content">
              <div class="input-group">
                <label class="input-label">HEX</label>
                <div class="input-wrapper">
                  <div class="input-prefix">#</div>
                  <input
                    v-model="hexInputValue"
                    type="text"
                    maxlength="6"
                    class="brutal-input text-input"
                    @input="handleHexInput"
                  />
                </div>
              </div>
            </div>

            <div v-if="activeFormat === 'rgb'" class="control-content slider-group">
              <div v-for="channel in ['r', 'g', 'b']" :key="channel" class="slider-row">
                <label class="input-label uppercase">{{ channel }}</label>
                <input
                  v-model.number="currentColor.rgb[channel]"
                  type="range"
                  min="0"
                  max="255"
                  class="brutal-slider"
                  @input="updateFromRgb"
                />
                <input
                  v-model.number="currentColor.rgb[channel]"
                  type="number"
                  min="0"
                  max="255"
                  class="brutal-input number-input"
                  @input="updateFromRgb"
                />
              </div>
            </div>

            <div v-if="activeFormat === 'hsl'" class="control-content slider-group">
              <div class="slider-row">
                <label class="input-label">H</label>
                <div class="range-wrapper">
                  <div class="hue-bg brutal-shadow"></div>
                  <input
                    v-model.number="currentColor.hsl.h"
                    type="range"
                    min="0"
                    max="360"
                    class="hue-range brutal-slider"
                    @input="updateFromHsl"
                  />
                </div>
                <span class="value-display brutal-input">{{ currentColor.hsl.h }}°</span>
              </div>

              <div class="slider-row">
                <label class="input-label">S</label>
                <input
                  v-model.number="currentColor.hsl.s"
                  type="range"
                  min="0"
                  max="100"
                  class="brutal-slider"
                  @input="updateFromHsl"
                />
                <span class="value-display brutal-input">{{ currentColor.hsl.s }}%</span>
              </div>

              <div class="slider-row">
                <label class="input-label">L</label>
                <input
                  v-model.number="currentColor.hsl.l"
                  type="range"
                  min="0"
                  max="100"
                  class="brutal-slider"
                  @input="updateFromHsl"
                />
                <span class="value-display brutal-input">{{ currentColor.hsl.l }}%</span>
              </div>
            </div>
          </div>

          <div class="brutal-pane history-panel mt-4">
            <h3 class="pane-title">常用色板</h3>
            <div class="preset-grid">
              <button
                v-for="color in presetColors"
                :key="color"
                class="color-dot"
                :style="{ backgroundColor: color }"
                :title="color"
                @click="setColorFromHex(color)"
              ></button>
            </div>

            <div v-if="savedColors.length > 0" class="mt-4">
              <div class="section-header">
                <h3 class="pane-title" style="margin-bottom: 0">已保存颜色</h3>
              </div>
              <div class="saved-grid mt-2">
                <div v-for="(item, idx) in savedColors" :key="idx" class="saved-item group">
                  <div
                    class="saved-color brutal-shadow"
                    :style="{ backgroundColor: item.hex }"
                    @click="setColorFromHex(item.hex)"
                  ></div>
                  <button class="delete-btn brutal-btn" @click.stop="removeSavedColor(idx)">
                    &times;
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="empty-state mt-4 bg-yellow">
              <div class="p-4 text-center"><strong>暂无保存的颜色</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onMounted } from 'vue';
  import { ElMessage } from 'element-plus';
  import { useCopy } from '@/composables/useCopy';

  const activeFormat = ref('hex');
  const hexInputValue = ref('4361EE');

  const currentColor = reactive({
    hex: '#4361EE',
    rgb: { r: 67, g: 97, b: 238 },
    hsl: { h: 231, s: 85, l: 60 }
  });

  const savedColors = ref([]);
  const colorInput = ref(null);
  const isEyeDropperSupported = ref(false);

  const presetColors = [
    '#111111',
    '#FFFFFF',
    '#FF3366',
    '#FF9933',
    '#FFCC00',
    '#33CC66',
    '#3399FF',
    '#9966FF',
    '#FF66B2',
    '#FF0000',
    '#00FF00',
    '#0000FF',
    '#FFFF00',
    '#00FFFF',
    '#FF00FF',
    '#808080',
    '#C0C0C0',
    '#800000',
    '#808000',
    '#008000'
  ];

  function getBrightness(r, g, b) {
    return (r * 299 + g * 587 + b * 114) / 1000;
  }

  function rgbToHex(r, g, b) {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
  }

  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  }

  function hslToHex(h, s, l) {
    const rgb = hslToRgb(h, s, l);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  }

  const isDark = computed(() => {
    return getBrightness(currentColor.rgb.r, currentColor.rgb.g, currentColor.rgb.b) < 128;
  });

  const complementaryColors = computed(() => {
    const h = currentColor.hsl.h;
    const s = currentColor.hsl.s;
    const l = currentColor.hsl.l;

    const compH = (h + 180) % 360;
    const ana1H = (h + 30) % 360;
    const ana2H = (h - 30 + 360) % 360;

    return [hslToHex(compH, s, l), hslToHex(ana1H, s, l), hslToHex(ana2H, s, l)];
  });

  onMounted(() => {
    loadSavedColors();
    updateFromHex('4361EE');
    isEyeDropperSupported.value = 'EyeDropper' in window;
  });

  async function pickScreenColor() {
    if (!isEyeDropperSupported.value) return;
    try {
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      updateFromHex(result.sRGBHex);
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error(e);
        ElMessage.error('取色失败');
      }
    }
  }

  function handleHexInput() {
    let val = hexInputValue.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);
    hexInputValue.value = val.toUpperCase();
    if (val.length === 6) {
      updateFromHex(val);
    }
  }

  function updateFromHex(hex) {
    hex = hex.replace('#', '');
    if (hex.length !== 6) return;

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    currentColor.hex = `#${hex.toUpperCase()}`;
    currentColor.rgb = { r, g, b };
    currentColor.hsl = rgbToHsl(r, g, b);

    if (hexInputValue.value !== hex.toUpperCase()) {
      hexInputValue.value = hex.toUpperCase();
    }
  }

  function updateFromRgb() {
    const { r, g, b } = currentColor.rgb;
    currentColor.hex = rgbToHex(r, g, b);
    currentColor.hsl = rgbToHsl(r, g, b);
    hexInputValue.value = currentColor.hex.replace('#', '');
  }

  function updateFromHsl() {
    const { h, s, l } = currentColor.hsl;
    const rgb = hslToRgb(h, s, l);
    currentColor.rgb = rgb;
    currentColor.hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    hexInputValue.value = currentColor.hex.replace('#', '');
  }

  function setColorFromHex(hex) {
    updateFromHex(hex);
  }

  function triggerColorPicker() {
    colorInput.value.click();
  }

  function handleNativeColorPicker(event) {
    updateFromHex(event.target.value);
  }

  const { copyToClipboard } = useCopy();

  function copyColor() {
    copyToClipboard(currentColor.hex, { success: '颜色代码已复制: ' + currentColor.hex });
  }

  function generateRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);

    currentColor.rgb = { r, g, b };
    updateFromRgb();
    ElMessage.success('已生成随机颜色');
  }

  function saveCurrentColor() {
    if (savedColors.value.some(c => c.hex === currentColor.hex)) {
      ElMessage.warning('该颜色已保存');
      return;
    }

    savedColors.value.unshift({ ...currentColor });
    if (savedColors.value.length > 20) savedColors.value.pop();

    localStorage.setItem('vb_saved_colors', JSON.stringify(savedColors.value));
    ElMessage.success('颜色已保存');
  }

  function removeSavedColor(idx) {
    savedColors.value.splice(idx, 1);
    localStorage.setItem('vb_saved_colors', JSON.stringify(savedColors.value));
  }

  function clearSavedColors() {
    if (confirm('确定要清除所有保存的颜色吗？')) {
      savedColors.value = [];
      localStorage.removeItem('vb_saved_colors');
      ElMessage.success('记录已清除');
    }
  }

  function loadSavedColors() {
    const saved = localStorage.getItem('vb_saved_colors');
    if (saved) {
      try {
        savedColors.value = JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
  }
</script>

<style scoped>
  @import '@/assets/styles/brutalism.css';

  .color-picker-tool {
    min-height: 100vh;
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
    color: #111;
    font-weight: 700;
  }

  .cp-sidebar {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .pane-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    color: #111;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 3px solid #111;
    padding-bottom: 8px;
  }

  .main-preview {
    width: 100%;
    height: 200px;
    border: 4px solid #111;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.1s;
  }

  .hex-trigger {
    width: auto;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 800;
  }

  .section-label {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1rem;
    font-weight: 800;
    color: #111;
    margin-bottom: 12px;
  }

  .comp-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .comp-item {
    height: 64px;
    border: 3px solid #111;
    cursor: pointer;
    transition: all 0.1s;
  }

  .comp-item:hover {
    transform: translate(-3px, -3px);
    box-shadow: 5px 5px 0px #111;
  }

  .comp-item:active {
    transform: translate(2px, 2px);
    box-shadow: 0px 0px 0px #111;
  }

  .actions-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .btn-row {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 12px;
  }

  .btn-row.mt-2 {
    grid-template-columns: 1fr 1fr;
  }

  .action-btn {
    text-align: center;
    padding: 10px;
  }

  .icon-btn {
    width: 44px;
    padding: 0;
  }

  .cp-main {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .panel-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    border-bottom: 3px solid #111;
    padding-bottom: 8px;
  }

  .panel-header-row .pane-title {
    margin: 0;
    border: none;
    padding: 0;
  }

  .format-tabs {
    display: flex;
    border: 3px solid #111;
    background: #111;
    gap: 2px;
  }

  .mode-tab {
    padding: 4px 12px;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.9rem;
    cursor: pointer;
    background: #fff;
    border: none;
    color: #111;
    transition: all 0.1s;
  }

  .mode-tab.active {
    background: #ffd900;
  }

  .mode-tab:hover:not(.active) {
    background: #f4f4f0;
  }

  .input-group {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 1rem;
  }

  .input-label {
    width: 40px;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    color: #111;
  }

  .input-wrapper {
    position: relative;
    flex: 1;
  }

  .input-prefix {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #111;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 800;
    z-index: 1;
  }

  .text-input {
    width: 100%;
    padding-left: 32px;
    font-size: 1.2rem;
    text-transform: uppercase;
  }

  .slider-group {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .slider-row {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .uppercase {
    text-transform: uppercase;
  }

  .number-input {
    width: 70px;
    text-align: center;
  }

  .range-wrapper {
    flex: 1;
    position: relative;
    height: 16px;
    display: flex;
    align-items: center;
  }

  .hue-bg {
    position: absolute;
    inset: 0;
    border: 3px solid #111;
    background: linear-gradient(
      to right,
      #f00 0%,
      #ff0 17%,
      #0f0 33%,
      #0ff 50%,
      #00f 67%,
      #f0f 83%,
      #f00 100%
    );
  }

  .hue-range {
    position: relative;
    z-index: 10;
    width: 100%;
    background: transparent;
    opacity: 0;
  }

  .hue-range::-webkit-slider-thumb {
    width: 24px;
    height: 24px;
    border: 3px solid #111;
    border-radius: 0;
    background: #fff;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
  }

  .value-display {
    width: 70px;
    text-align: center;
    pointer-events: none;
  }

  .preset-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .color-dot {
    width: 32px;
    height: 32px;
    border: 3px solid #111;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
  }

  .color-dot:hover {
    transform: translate(-2px, -2px);
    box-shadow: 4px 4px 0px #111;
  }

  .color-dot:active {
    transform: translate(2px, 2px);
    box-shadow: 0px 0px 0px #111;
  }

  .hidden-color-input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    pointer-events: none;
  }

  .saved-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
    gap: 12px;
  }

  .saved-item {
    position: relative;
  }

  .saved-color {
    width: 40px;
    height: 40px;
    cursor: pointer;
    border: 3px solid #111;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
  }

  .saved-color:hover {
    transform: translate(-2px, -2px);
    box-shadow: 4px 4px 0px #111;
  }

  .delete-btn {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 24px;
    height: 24px;
    padding: 0;
    background: #ff4b4b;
    color: white;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    z-index: 10;
  }

  .saved-item:hover .delete-btn {
    opacity: 1;
  }

  .empty-state {
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
  }

  .mt-4 {
    margin-top: 1rem;
  }
  .mt-2 {
    margin-top: 0.5rem;
  }
  .p-4 {
    padding: 1rem;
  }
  .text-white {
    color: #fff;
  }
</style>
