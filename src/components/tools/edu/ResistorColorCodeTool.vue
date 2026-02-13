<template>
  <div class="tool-container">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>电阻色环读取器</h1>
        <span class="nav-subtitle">Resistor Color Code Calculator</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="glass-card">
        <div class="mode-switch">
          <button :class="{ active: bands === 4 }" @click="bands = 4">4 色环</button>
          <button :class="{ active: bands === 5 }" @click="bands = 5">5 色环</button>
        </div>

        <div class="resistor-visual">
          <div class="resistor-body">
            <!-- Band 1 -->
            <div class="band" :style="{ background: getColor(band1, digitColors) }"></div>
            <!-- Band 2 -->
            <div class="band" :style="{ background: getColor(band2, digitColors) }"></div>
            <!-- Band 3 (Only 5-band) -->
            <div
              v-if="bands === 5"
              class="band"
              :style="{ background: getColor(band3, digitColors) }"
            ></div>
            <!-- Multiplier -->
            <div
              class="band multiplier"
              :style="{ background: getColor(multiplier, multiplierColors) }"
            ></div>
            <!-- Spacer -->
            <div class="spacer"></div>
            <!-- Tolerance -->
            <div
              class="band tolerance"
              :style="{ background: getColor(tolerance, toleranceColors) }"
            ></div>
          </div>
          <div class="wire left"></div>
          <div class="wire right"></div>
        </div>

        <div class="result-display animate-fade-in">
          <div class="resistance-value">{{ result.value }} <span class="unit">Ω</span></div>
          <div class="tolerance-value">± {{ result.tolerance }}</div>

          <div class="calculation-process">
            <div class="calc-label">计算过程</div>
            <div class="calc-formula">
              <span class="calc-num">{{ result.digits }}</span>
              <span class="calc-op">×</span>
              <span class="calc-num">{{ result.multiplierVal }}</span>
              <span class="calc-op">=</span>
              <span class="calc-result">{{ result.rawOhms }} Ω</span>
            </div>
            <div class="calc-desc">(有效数字) × (倍率) = 阻值</div>
          </div>
        </div>

        <div class="controls-grid">
          <div class="control-group">
            <label>第1色环 (数字)</label>
            <div class="color-picker">
              <button
                v-for="c in digitColors"
                :key="c.name"
                class="color-btn"
                :class="{ selected: band1 === c.val }"
                :style="{ background: c.hex }"
                :title="c.name"
                @click="band1 = c.val"
              ></button>
            </div>
          </div>

          <div class="control-group">
            <label>第2色环 (数字)</label>
            <div class="color-picker">
              <button
                v-for="c in digitColors"
                :key="c.name"
                class="color-btn"
                :class="{ selected: band2 === c.val }"
                :style="{ background: c.hex }"
                :title="c.name"
                @click="band2 = c.val"
              ></button>
            </div>
          </div>

          <div v-if="bands === 5" class="control-group">
            <label>第3色环 (数字)</label>
            <div class="color-picker">
              <button
                v-for="c in digitColors"
                :key="c.name"
                class="color-btn"
                :class="{ selected: band3 === c.val }"
                :style="{ background: c.hex }"
                :title="c.name"
                @click="band3 = c.val"
              ></button>
            </div>
          </div>

          <div class="control-group">
            <label>倍率 ({{ bands === 4 ? '第3环' : '第4环' }})</label>
            <div class="color-picker">
              <button
                v-for="c in multiplierColors"
                :key="c.name"
                class="color-btn"
                :class="{ selected: multiplier === c.val }"
                :style="{ background: c.hex }"
                :title="`${c.name} (x10^${Math.log10(c.val)})`"
                @click="multiplier = c.val"
              ></button>
            </div>
          </div>

          <div class="control-group">
            <label>误差 ({{ bands === 4 ? '第4环' : '第5环' }})</label>
            <div class="color-picker">
              <button
                v-for="c in toleranceColors"
                :key="c.name"
                class="color-btn"
                :class="{ selected: tolerance === c.val }"
                :style="{ background: c.hex }"
                :title="`${c.name} (±${c.val}%)`"
                @click="tolerance = c.val"
              ></button>
            </div>
          </div>
        </div>
      </div>

      <div class="info-card">
        <h3>💡 色环记忆口诀</h3>
        <p>棕一红二橙是三，四黄五绿六为蓝，七紫八灰九对白，黑是零，金五银十表误差。</p>
      </div>

      <div class="reference-card">
        <h3>📚 色环对照表</h3>
        <div class="table-container">
          <table class="color-table">
            <thead>
              <tr>
                <th>颜色</th>
                <th>有效数字</th>
                <th>倍率</th>
                <th>误差</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in colorTable" :key="row.name">
                <td class="col-color">
                  <span class="color-dot" :style="{ background: row.hex }"></span>
                  {{ row.name }}
                </td>
                <td>{{ row.digit }}</td>
                <td>{{ row.multiplier }}</td>
                <td>{{ row.tolerance }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 电子工具系列</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { Back } from '@element-plus/icons-vue';

  const bands = ref(4);
  const band1 = ref(1); // Brown
  const band2 = ref(0); // Black
  const band3 = ref(0); // Black (only for 5-band)
  const multiplier = ref(100); // Red (x100) -> 1k
  const tolerance = ref(5); // Gold (5%)

  // Colors definition
  const digitColors = [
    { name: '黑 (0)', val: 0, hex: '#000000' },
    { name: '棕 (1)', val: 1, hex: '#8B4513' },
    { name: '红 (2)', val: 2, hex: '#FF0000' },
    { name: '橙 (3)', val: 3, hex: '#FFA500' },
    { name: '黄 (4)', val: 4, hex: '#FFFF00' },
    { name: '绿 (5)', val: 5, hex: '#008000' },
    { name: '蓝 (6)', val: 6, hex: '#0000FF' },
    { name: '紫 (7)', val: 7, hex: '#800080' },
    { name: '灰 (8)', val: 8, hex: '#808080' },
    { name: '白 (9)', val: 9, hex: '#FFFFFF' }
  ];

  const multiplierColors = [
    { name: '黑 (x1)', val: 1, hex: '#000000' },
    { name: '棕 (x10)', val: 10, hex: '#8B4513' },
    { name: '红 (x100)', val: 100, hex: '#FF0000' },
    { name: '橙 (x1k)', val: 1000, hex: '#FFA500' },
    { name: '黄 (x10k)', val: 10000, hex: '#FFFF00' },
    { name: '绿 (x100k)', val: 100000, hex: '#008000' },
    { name: '蓝 (x1M)', val: 1000000, hex: '#0000FF' },
    { name: '紫 (x10M)', val: 10000000, hex: '#800080' },
    { name: '金 (x0.1)', val: 0.1, hex: '#FFD700' },
    { name: '银 (x0.01)', val: 0.01, hex: '#C0C0C0' }
  ];

  const toleranceColors = [
    { name: '棕 (±1%)', val: 1, hex: '#8B4513' },
    { name: '红 (±2%)', val: 2, hex: '#FF0000' },
    { name: '绿 (±0.5%)', val: 0.5, hex: '#008000' },
    { name: '蓝 (±0.25%)', val: 0.25, hex: '#0000FF' },
    { name: '紫 (±0.1%)', val: 0.1, hex: '#800080' },
    { name: '金 (±5%)', val: 5, hex: '#FFD700' },
    { name: '银 (±10%)', val: 10, hex: '#C0C0C0' }
  ];

  const getColor = (val: number, list: { val: number; hex: string }[]) => {
    const match = list.find(c => Math.abs(c.val - val) < 0.0001);
    return match ? match.hex : '#ccc';
  };

  const result = computed(() => {
    let ohms = 0;
    if (bands.value === 4) {
      ohms = (band1.value * 10 + band2.value) * multiplier.value;
    } else {
      ohms = (band1.value * 100 + band2.value * 10 + band3.value) * multiplier.value;
    }

    // Format
    let display = '';
    if (ohms >= 1000000) {
      display = parseFloat((ohms / 1000000).toFixed(2)) + ' M';
    } else if (ohms >= 1000) {
      display = parseFloat((ohms / 1000).toFixed(2)) + ' k';
    } else {
      display = parseFloat(ohms.toFixed(2)) + ' ';
    }

    // Digits for calculation display
    const digits =
      bands.value === 4
        ? `${band1.value}${band2.value}`
        : `${band1.value}${band2.value}${band3.value}`;

    return {
      value: display,
      tolerance: tolerance.value + '%',
      rawOhms: parseFloat(ohms.toFixed(2)),
      digits,
      multiplierVal: multiplier.value
    };
  });

  // Reference Table Data
  const referenceColors = [
    { name: '黑', hex: '#000000' },
    { name: '棕', hex: '#8B4513' },
    { name: '红', hex: '#FF0000' },
    { name: '橙', hex: '#FFA500' },
    { name: '黄', hex: '#FFFF00' },
    { name: '绿', hex: '#008000' },
    { name: '蓝', hex: '#0000FF' },
    { name: '紫', hex: '#800080' },
    { name: '灰', hex: '#808080' },
    { name: '白', hex: '#FFFFFF' },
    { name: '金', hex: '#FFD700' },
    { name: '银', hex: '#C0C0C0' }
  ];

  const colorTable = computed(() => {
    return referenceColors.map(color => {
      // Find digit
      const digitObj = digitColors.find(c => c.hex === color.hex);
      const digit = digitObj ? digitObj.val.toString() : '-';

      // Find multiplier
      const multObj = multiplierColors.find(c => c.hex === color.hex);
      let multiplier = '-';
      if (multObj) {
        const val = multObj.val;
        if (val >= 1000000) multiplier = 'x1M';
        else if (val >= 100000) multiplier = 'x100k';
        else if (val >= 10000) multiplier = 'x10k';
        else if (val >= 1000) multiplier = 'x1k';
        else if (val >= 100) multiplier = 'x100';
        else if (val >= 10) multiplier = 'x10';
        else if (val >= 1) multiplier = 'x1';
        else multiplier = `x${val}`;
      }

      // Find tolerance
      const tolObj = toleranceColors.find(c => c.hex === color.hex);
      const tolerance = tolObj ? `±${tolObj.val}%` : '-';

      return {
        name: color.name,
        hex: color.hex,
        digit,
        multiplier,
        tolerance
      };
    });
  });
</script>

<style scoped>
  .tool-container {
    --bg: #f1f5f9;
    --card: #ffffff;
    --text: #334155;
    --accent: #3b82f6;

    min-height: 100vh;
    background: var(--bg);
    font-family: 'Inter', system-ui, sans-serif;
    color: var(--text);
  }

  .nav-bar {
    /* Standard nav styles */
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    padding: 1rem 1.5rem;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
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
    cursor: pointer;
    color: #64748b;
  }
  .nav-center {
    flex: 1;
    text-align: center;
  }
  .nav-center h1 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }
  .nav-subtitle {
    font-size: 0.8rem;
    color: #64748b;
  }

  .main-content {
    max-width: 800px;
    margin: 2rem auto;
    padding: 0 1.5rem;
  }

  .glass-card {
    background: var(--card);
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
    margin-bottom: 2rem;
  }

  .mode-switch {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .mode-switch button {
    padding: 0.6rem 2rem;
    border: 1px solid #cbd5e1;
    border-radius: 20px;
    background: white;
    color: var(--text);
    cursor: pointer;
    transition: all 0.2s;
  }

  .mode-switch button.active {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
  }

  .resistor-visual {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 120px;
    margin-bottom: 2rem;
    position: relative;
  }

  .resistor-body {
    width: 300px;
    height: 60px;
    background: #e2e8f0; /* Beige standard body color actually, but gray is neutral */
    border-radius: 30px;
    position: relative;
    z-index: 2;
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    padding: 0 40px;
    overflow: hidden;
    box-shadow:
      inset 0 -10px 20px rgba(0, 0, 0, 0.1),
      0 5px 15px rgba(0, 0, 0, 0.1);
    background: radial-gradient(circle at 50% 30%, #fdf6e3, #ded1b6);
  }

  .wire {
    position: absolute;
    height: 8px;
    background: #94a3b8;
    z-index: 1;
    top: 50%;
    transform: translateY(-50%);
    width: 50%;
  }
  .wire.left {
    left: 0;
  }
  .wire.right {
    right: 0;
  }

  .band {
    width: 15px;
    height: 100%;
    z-index: 3;
    margin-right: 20px;
  }

  .band.tolerance {
    margin-right: 0;
  }

  .spacer {
    flex: 1;
  }

  .result-display {
    text-align: center;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
  }

  .resistance-value {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--text);
  }

  .unit {
    font-size: 1.5rem;
    color: #64748b;
  }
  .tolerance-value {
    color: #64748b;
    margin-top: 0.5rem;
    font-weight: 500;
  }

  .calculation-process {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
  }

  .calc-label {
    font-size: 0.85rem;
    color: #94a3b8;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .calc-formula {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 1.1rem;
    color: #334155;
    background: #f1f5f9;
    display: inline-block;
    padding: 0.4rem 1rem;
    border-radius: 8px;
    margin-bottom: 0.5rem;
  }

  .calc-num {
    font-weight: 600;
    color: #0f172a;
  }

  .calc-op {
    margin: 0 0.5rem;
    color: #64748b;
  }

  .calc-desc {
    font-size: 0.8rem;
    color: #64748b;
  }

  .controls-grid {
    display: grid;
    gap: 1.5rem;
  }

  .control-group label {
    display: block;
    margin-bottom: 0.8rem;
    font-weight: 600;
    font-size: 0.9rem;
    color: #475569;
  }

  .color-picker {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .color-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    transition: transform 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .color-btn:hover {
    transform: scale(1.1);
    z-index: 2;
  }

  .color-btn.selected {
    border-color: #334155;
    transform: scale(1.1);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
  }

  .info-card {
    padding: 1.5rem;
    background: white;
    border-radius: 12px;
    font-size: 0.9rem;
    color: #64748b;
    line-height: 1.6;
    margin-bottom: 2rem;
  }

  .reference-card {
    padding: 1.5rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .reference-card h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #334155;
    font-size: 1.1rem;
  }

  .table-container {
    overflow-x: auto;
  }

  .color-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
    min-width: 500px;
  }

  .color-table th,
  .color-table td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
  }

  .color-table th {
    background: #f8fafc;
    font-weight: 600;
    color: #64748b;
  }

  .color-table tr:last-child td {
    border-bottom: none;
  }

  .col-color {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
  }

  .color-dot {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #94a3b8;
    font-size: 0.875rem;
  }

  .animate-fade-in {
    animation: fadeIn 0.3s ease-out;
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
