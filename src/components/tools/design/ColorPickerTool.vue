<template>
  <div class="color-picker-tool">
    <div class="nav-header">
      <button class="back-btn" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        <span>返回</span>
      </button>
    </div>
    <div class="cp-header">
      <h1 class="cp-title">颜色选择器</h1>
      <p class="cp-subtitle">专业的颜色转换与配色工具，支持 HEX、RGB、HSL 格式互转</p>
    </div>

    <div class="cp-layout">
      <div class="cp-sidebar">
        <div class="panel preview-panel">
          <h2 class="panel-title"><span class="icon">🎨</span> 颜色预览</h2>

          <div class="main-preview" :style="{ backgroundColor: currentColor.hex }">
            <div
              class="hex-trigger"
              :style="{
                color: isDark ? 'white' : 'black',
                backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.4)'
              }"
              title="点击复制"
              @click="copyColor"
            >
              {{ currentColor.hex }}
            </div>

            <div class="hover-tip">
              <span class="tip-text">点击HEX可复制</span>
            </div>
          </div>

          <div class="comp-section">
            <h3 class="section-label">互补色方案</h3>
            <div class="comp-grid">
              <div
                v-for="(color, idx) in complementaryColors"
                :key="idx"
                class="comp-item"
                :style="{ backgroundColor: color }"
                :title="'点击应用: ' + color"
                @click="setColorFromHex(color)"
              ></div>
            </div>
          </div>

          <div class="actions-group">
            <input
              ref="colorInput"
              type="color"
              class="hidden-color-input"
              :value="currentColor.hex"
              @input="handleNativeColorPicker"
            />

            <div class="btn-row">
              <button class="btn-primary" style="flex: 1" @click="triggerColorPicker">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="M12 21.7C17.3 21.7 21.6 17.4 21.6 12.1 21.6 8.2 19 4.9 15.4 3.7 14.8 3.5 14.5 4.1 14.8 4.6 15.3 5.4 15.6 6.4 15.6 7.4 15.6 10.7 12.9 13.4 9.6 13.4 9.3 13.4 9 13.4 8.7 13.3 8.3 13.2 8.3 12.7 8.7 12.5 9.4 12.2 10.2 12 11 12 11.2 12 11.4 12 11.7 12.1 12.4 12.3 13 12.8 13.3 13.4 13.5 13.9 13.5 14 13.5 14 13.6 14 13.6 14 15.9 12 19.3 8.9 20.8 9.9 21.4 10.9 21.7 12 21.7ZM12 21.7C12 21.7 12 21.7 12 21.7ZM7.5 7.5C7.5 7.5 7.5 7.5 7.5 7.5 7.5 7.5 7.5 7.5 7.5 7.5ZM7.5 7.5C6.1 7.5 5 8.6 5 10 5 11.4 6.1 12.5 7.5 12.5 8.9 12.5 10 11.4 10 10 10 8.6 8.9 7.5 7.5 7.5Z"
                  ></path>
                </svg>
                <span>调色板</span>
              </button>

              <button
                v-if="isEyeDropperSupported"
                class="btn-primary"
                style="flex: 1; background: #8b5cf6"
                @click="pickScreenColor"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>屏幕吸管</span>
              </button>
              <button class="btn-secondary" title="复制HEX代码" @click="copyColor">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>

            <div class="btn-row">
              <button class="btn-secondary" @click="saveCurrentColor">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                <span>保存</span>
              </button>
              <button class="btn-secondary" @click="generateRandomColor">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path
                    d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
                  ></path>
                </svg>
                <span>随机</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="cp-main">
        <div class="panel control-panel">
          <div class="panel-header-row">
            <h2 class="panel-title">参数调整</h2>

            <div class="format-tabs">
              <button
                v-for="format in ['hex', 'rgb', 'hsl']"
                :key="format"
                class="tab-btn"
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
                  class="text-input"
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
                class="range-input"
                @input="updateFromRgb"
              />
              <input
                v-model.number="currentColor.rgb[channel]"
                type="number"
                min="0"
                max="255"
                class="number-input"
                @input="updateFromRgb"
              />
            </div>
          </div>

          <div v-if="activeFormat === 'hsl'" class="control-content slider-group">
            <div class="slider-row">
              <label class="input-label">H</label>
              <div class="range-wrapper">
                <div class="hue-bg"></div>
                <input
                  v-model.number="currentColor.hsl.h"
                  type="range"
                  min="0"
                  max="360"
                  class="range-input hue-range"
                  @input="updateFromHsl"
                />
              </div>
              <span class="value-display">{{ currentColor.hsl.h }}°</span>
            </div>

            <div class="slider-row">
              <label class="input-label">S</label>
              <input
                v-model.number="currentColor.hsl.s"
                type="range"
                min="0"
                max="100"
                class="range-input"
                @input="updateFromHsl"
              />
              <span class="value-display">{{ currentColor.hsl.s }}%</span>
            </div>

            <div class="slider-row">
              <label class="input-label">L</label>
              <input
                v-model.number="currentColor.hsl.l"
                type="range"
                min="0"
                max="100"
                class="range-input"
                @input="updateFromHsl"
              />
              <span class="value-display">{{ currentColor.hsl.l }}%</span>
            </div>
          </div>
        </div>

        <div class="panel history-panel">
          <div class="section">
            <h3 class="section-label">常用色板</h3>
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
          </div>

          <div v-if="savedColors.length > 0">
            <div class="section-header">
              <h3 class="section-label">已保存颜⾊</h3>
              <button class="link-btn-danger" @click="clearSavedColors">清除全部</button>
            </div>
            <div class="saved-grid">
              <div v-for="(item, idx) in savedColors" :key="idx" class="saved-item group">
                <div
                  class="saved-color"
                  :style="{ backgroundColor: item.hex }"
                  @click="setColorFromHex(item.hex)"
                ></div>
                <button class="delete-btn" @click.stop="removeSavedColor(idx)">&times;</button>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">暂无保存的颜色</div>
        </div>
      </div>
    </div>

    <footer class="footer">© 2026 LRM工具箱 - 颜色选择器</footer>
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onMounted } from 'vue';
  import { Back } from '@element-plus/icons-vue';

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
    '#FF5733',
    '#33FF57',
    '#3357FF',
    '#F3FF33',
    '#FF33F3',
    '#33FFF3',
    '#F333FF',
    '#FFF333',
    '#5733FF',
    '#FF3357',
    '#57FF33',
    '#000000',
    '#333333',
    '#666666',
    '#999999',
    '#CCCCCC',
    '#FFFFFF',
    '#E6E6FA',
    '#D8BFD8',
    '#BA55D3',
    '#9370DB',
    '#8A2BE2',
    '#4B0082',
    '#6A5ACD',
    '#7B68EE',
    '#00BFFF',
    '#1E90FF',
    '#4169E1',
    '#0000FF',
    '#000080',
    '#90EE90',
    '#3CB371',
    '#228B22',
    '#008000',
    '#FFD700',
    '#FFA500',
    '#FF8C00',
    '#FF4500',
    '#FF0000',
    '#DC143C',
    '#B22222',
    '#800000'
  ];

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

  import { ElMessage } from 'element-plus';
  import { useCopy } from '@/composables/useCopy';

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
</script>

<style scoped>
  .color-picker-tool {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family:
      -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #334155;
    box-sizing: border-box;
  }

  @media (min-width: 768px) {
    .color-picker-tool {
      padding: 40px;
    }
  }

  .cp-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .cp-title {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 8px;
  }

  .cp-subtitle {
    color: #64748b;
    font-size: 1rem;
  }

  .cp-layout {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  @media (min-width: 1024px) {
    .cp-layout {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 32px;
      align-items: start;
    }
  }

  .panel {
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    padding: 24px;
  }

  .panel-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .cp-sidebar {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .preview-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .main-preview {
    width: 100%;
    height: 200px;
    border-radius: 12px;
    margin-bottom: 24px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
    transition: background-color 0.3s;
  }

  .hex-trigger {
    padding: 8px 16px;
    border-radius: 9999px;
    font-weight: 700;
    font-size: 1.25rem;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.9);
    transition: transform 0.2s;
  }

  .hex-trigger:hover {
    transform: scale(1.05);
  }

  .hover-tip {
    position: absolute;
    bottom: 12px;
    right: 12px;
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
  }

  .main-preview:hover .hover-tip {
    opacity: 1;
  }

  .tip-text {
    background: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
  }

  .comp-section {
    margin-bottom: 24px;
  }

  .section-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #64748b;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .comp-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .comp-item {
    height: 64px;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s;
  }

  .comp-item:hover {
    transform: translateY(-2px);
  }

  .actions-group {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .btn-primary {
    width: 100%;
    padding: 12px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background-color 0.2s;
  }

  .btn-primary:hover {
    background: #2563eb;
  }

  .btn-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .btn-secondary {
    padding: 12px;
    background: white;
    border: 1px solid #e2e8f0;
    color: #334155;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background-color 0.2s;
  }

  .btn-secondary:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }

  .cp-main {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .panel-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .format-tabs {
    background: #f1f5f9;
    padding: 4px;
    border-radius: 8px;
    display: flex;
  }

  .tab-btn {
    padding: 6px 16px;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    border: none;
    background: transparent;
    color: #64748b;
    transition: all 0.2s;
  }

  .tab-btn.active {
    background: white;
    color: #3b82f6;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .control-content {
    padding: 8px 0;
  }

  .input-group {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .input-label {
    width: 40px;
    font-weight: 500;
    color: #64748b;
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
    color: #94a3b8;
  }

  .text-input {
    width: 100%;
    padding: 12px 16px 12px 32px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1.125rem;
    font-family: monospace;
    outline: none;
    text-transform: uppercase;
  }

  .text-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
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

  .range-input {
    flex: 1;
    height: 8px;
    background: #e2e8f0;
    border-radius: 4px;
    appearance: none;
    cursor: pointer;
  }

  .range-input::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    background: #3b82f6;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .number-input {
    width: 60px;
    padding: 4px 8px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    text-align: center;
    font-family: monospace;
  }

  .range-wrapper {
    flex: 1;
    position: relative;
    height: 12px;
  }

  .hue-bg {
    position: absolute;
    inset: 0;
    border-radius: 6px;
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
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    margin: 0;
  }

  .value-display {
    width: 60px;
    text-align: center;
    font-family: monospace;
  }

  .preset-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .color-dot {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: transform 0.2s;
  }

  .color-dot:hover {
    transform: scale(1.1);
  }

  .hidden-color-input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    pointer-events: none;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    margin-top: 2rem;
  }

  .link-btn-danger {
    color: #ef4444;
    font-size: 0.875rem;
    cursor: pointer;
    background: none;
    border: none;
  }

  .link-btn-danger:hover {
    text-decoration: underline;
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
    border-radius: 8px;
    cursor: pointer;
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .delete-btn {
    position: absolute;
    top: -6px;
    right: -6px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #ef4444;
    color: white;
    border: none;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
    cursor: pointer;
  }

  .saved-item:hover .delete-btn {
    opacity: 1;
  }

  .empty-state {
    text-align: center;
    padding: 32px;
    color: #94a3b8;
    font-size: 0.875rem;
    border: 1px dashed #e2e8f0;
    border-radius: 12px;
    background: #f8fafc;
    margin-top: 2rem;
  }

  .footer {
    text-align: center;
    padding: 2rem 0;
    margin-top: 2rem;
    color: #64748b;
    font-size: 0.85rem;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
  }

  @media (prefers-color-scheme: dark) {
    .footer {
      color: #94a3b8;
      border-color: rgba(255, 255, 255, 0.05);
    }
  }

  .nav-header {
    margin-bottom: 20px;
  }

  .back-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 1rem;
    padding: 8px 16px;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .back-btn:hover {
    background: rgba(0, 0, 0, 0.05);
    color: var(--text-primary);
  }
</style>
