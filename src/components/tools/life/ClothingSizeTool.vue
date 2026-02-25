<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">尺码<span>.查询()</span></h1>
        <div style="width: 120px"></div>
      </header>

      <!-- Category Tabs -->
      <div class="brutal-toolbar">
        <div class="tools-left">
          <button
            v-for="cat in categories"
            :key="cat.id"
            class="brutal-action-btn"
            :class="{ primary: currentCategory === cat.id }"
            @click="currentCategory = cat.id"
          >
            <span class="tab-emoji">{{ cat.icon }}</span>
            {{ cat.name }}
          </button>
        </div>
      </div>

      <!-- Sub Category -->
      <div v-if="subCategories.length > 1" class="sub-tabs">
        <button
          v-for="sub in subCategories"
          :key="sub.id"
          class="sub-tab-btn"
          :class="{ active: currentSubCategory === sub.id }"
          @click="currentSubCategory = sub.id"
        >
          {{ sub.name }}
        </button>
      </div>

      <div class="brutal-grid converter-layout">
        <!-- Converter -->
        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">尺码转换</span>
          </div>
          <div class="converter-body">
            <div class="input-area">
              <label class="brutal-label">我已知的尺码：</label>
              <div class="selector-group">
                <select v-model="selectedRegion" class="brutal-select">
                  <option v-for="region in currentRegions" :key="region.code" :value="region.code">
                    {{ region.name }} ({{ region.code }})
                  </option>
                </select>
                <select v-model="selectedSize" class="brutal-select">
                  <option v-for="size in availableSizes" :key="size" :value="size">
                    {{ size }}
                  </option>
                </select>
              </div>
            </div>

            <div class="divider-arrow">▼ 对应其他标准</div>

            <div class="result-grid">
              <div
                v-for="(val, code) in convertedSizes"
                :key="code"
                class="result-card"
                :class="{ highlight: code === 'CN' }"
              >
                <span class="region-label">{{ getRegionName(code) }}</span>
                <span class="size-value">{{ val || '-' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Full Table -->
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span>完整对照表</span>
          </div>
          <div class="table-wrapper">
            <table class="brutal-table">
              <thead>
                <tr>
                  <th v-for="region in currentRegions" :key="region.code">
                    {{ region.name }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, idx) in currentTableData"
                  :key="idx"
                  :class="{ active: isRowActive(row) }"
                >
                  <td v-for="region in currentRegions" :key="region.code">
                    {{ row[region.code] || '-' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Disclaimer -->
      <div class="brutal-pane disclaimer-pane">
        <div class="disclaimer-content">
          <span class="disc-icon">⚠</span>
          <span>
            尺码对照表为通用参考标准。由于不同品牌、款式的剪裁差异，建议结合具体商品的尺寸表或咨询客服进行选择。
          </span>
        </div>
      </div>

      <div class="brutal-status info">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i">© 2026 LRM工具箱 - 服装尺码助手 // &nbsp;</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, watch } from 'vue';

  const categories = [
    { id: 'women', name: '女装', icon: '👗' },
    { id: 'men', name: '男装', icon: '👔' },
    { id: 'shoes', name: '鞋码', icon: '👟' },
    { id: 'kids', name: '童装', icon: '👶' }
  ];

  const subCategoryMap = {
    women: [
      { id: 'clothes', name: '服装 (上装/裙装)' },
      { id: 'pants', name: '裤装' },
      { id: 'bra', name: '内衣' }
    ],
    men: [
      { id: 'clothes', name: '上装 (衬衫/外套)' },
      { id: 'pants', name: '裤装' },
      { id: 'suit', name: '西装' }
    ],
    shoes: [
      { id: 'women_shoes', name: '女鞋' },
      { id: 'men_shoes', name: '男鞋' }
    ],
    kids: [
      { id: 'kids_clothes', name: '童装' },
      { id: 'kids_shoes', name: '童鞋' }
    ]
  };

  const regions = {
    INTL: '国际',
    CN: '中国',
    US: '美国',
    UK: '英国',
    EU: '欧洲',
    JP: '日本',
    IT: '意大利',
    FR: '法国',
    KR: '韩国'
  };

  const sizeTables = {
    clothes: [
      { INTL: 'XXS', CN: '150/76A', US: '0', UK: '4', EU: '32', IT: '36', JP: '3' },
      { INTL: 'XS', CN: '155/80A', US: '2', UK: '6', EU: '34', IT: '38', JP: '5' },
      { INTL: 'S', CN: '160/84A', US: '4', UK: '8', EU: '36', IT: '40', JP: '7' },
      { INTL: 'M', CN: '165/88A', US: '6', UK: '10', EU: '38', IT: '42', JP: '9' },
      { INTL: 'L', CN: '170/92A', US: '8', UK: '12', EU: '40', IT: '44', JP: '11' },
      { INTL: 'XL', CN: '175/96A', US: '10', UK: '14', EU: '42', IT: '46', JP: '13' },
      { INTL: 'XXL', CN: '180/100A', US: '12', UK: '16', EU: '44', IT: '48', JP: '15' }
    ],
    men_clothes: [
      { INTL: 'XS', CN: '160/76A', US: '34', UK: '34', EU: '44' },
      { INTL: 'S', CN: '165/80A', US: '36', UK: '36', EU: '46' },
      { INTL: 'M', CN: '170/84A', US: '38', UK: '38', EU: '48' },
      { INTL: 'L', CN: '175/88A', US: '40', UK: '40', EU: '50' },
      { INTL: 'XL', CN: '180/92A', US: '42', UK: '42', EU: '52' },
      { INTL: 'XXL', CN: '185/96A', US: '44', UK: '44', EU: '54' },
      { INTL: '3XL', CN: '190/100A', US: '46', UK: '46', EU: '56' }
    ],
    women_shoes: [
      { CN: '35', US: '5', UK: '3', EU: '36', JP: '22.5' },
      { CN: '36', US: '6', UK: '4', EU: '37', JP: '23' },
      { CN: '37', US: '6.5', UK: '4.5', EU: '38', JP: '23.5' },
      { CN: '38', US: '7.5', UK: '5.5', EU: '39', JP: '24' },
      { CN: '39', US: '8.5', UK: '6.5', EU: '40', JP: '24.5' },
      { CN: '40', US: '9', UK: '7', EU: '41', JP: '25' }
    ],
    men_shoes: [
      { CN: '39', US: '6.5', UK: '6', EU: '39', JP: '24.5' },
      { CN: '40', US: '7', UK: '6.5', EU: '40', JP: '25' },
      { CN: '41', US: '8', UK: '7.5', EU: '41', JP: '26' },
      { CN: '42', US: '8.5', UK: '8', EU: '42', JP: '26.5' },
      { CN: '43', US: '9.5', UK: '9', EU: '43', JP: '27.5' },
      { CN: '44', US: '10', UK: '9.5', EU: '44', JP: '28' },
      { CN: '45', US: '11', UK: '10.5', EU: '45', JP: '29' }
    ],
    kids_clothes: [
      { CN: '52', US: 'Newborn', UK: 'Newborn', EU: '50', Age: '0-1M' },
      { CN: '59', US: '3M', UK: '0-3M', EU: '56', Age: '1-3M' },
      { CN: '66', US: '6M', UK: '3-6M', EU: '62', Age: '3-6M' },
      { CN: '73', US: '12M', UK: '6-12M', EU: '68', Age: '6-12M' },
      { CN: '80', US: '18M', UK: '12-18M', EU: '80', Age: '12-18M' },
      { CN: '90', US: '2T', UK: '18-24M', EU: '92', Age: '2Y' },
      { CN: '100', US: '3T', UK: '2-3Y', EU: '98', Age: '3Y' },
      { CN: '110', US: '4T', UK: '3-4Y', EU: '104', Age: '4Y' },
      { CN: '120', US: '6', UK: '5-6Y', EU: '116', Age: '6Y' }
    ]
  };

  sizeTables.pants = sizeTables.clothes;
  sizeTables.bra = sizeTables.clothes;
  sizeTables.suit = sizeTables.men_clothes;
  sizeTables.kids_shoes = sizeTables.women_shoes;

  const currentCategory = ref('women');
  const currentSubCategory = ref('clothes');

  watch(currentCategory, newVal => {
    if (newVal === 'women') currentSubCategory.value = 'clothes';
    if (newVal === 'men') currentSubCategory.value = 'clothes';
    if (newVal === 'shoes') currentSubCategory.value = 'women_shoes';
    if (newVal === 'kids') currentSubCategory.value = 'kids_clothes';
  });

  const tableKey = computed(() => {
    if (currentCategory.value === 'men' && currentSubCategory.value === 'clothes')
      return 'men_clothes';
    if (currentCategory.value === 'men' && currentSubCategory.value === 'suit')
      return 'men_clothes';
    return currentSubCategory.value;
  });

  const subCategories = computed(() => subCategoryMap[currentCategory.value] || []);

  const currentTableData = computed(() => sizeTables[tableKey.value] || []);

  const currentRegions = computed(() => {
    const data = currentTableData.value;
    if (!data.length) return [];

    return Object.keys(data[0]).map(code => ({
      code,
      name: regions[code] || (code === 'Age' ? '参考年龄' : code)
    }));
  });

  const selectedRegion = ref('');
  const selectedSize = ref('');

  watch(currentTableData, newVal => {
    if (newVal.length > 0) {
      selectedRegion.value = currentRegions.value[0].code;
      selectedSize.value = newVal[0][selectedRegion.value];
    }
  });

  const availableSizes = computed(() => {
    if (!selectedRegion.value) return [];
    return currentTableData.value.map(row => row[selectedRegion.value]).filter(Boolean);
  });

  watch(selectedRegion, newVal => {
    if (newVal && availableSizes.value.length > 0) {
      selectedSize.value = availableSizes.value[0];
    }
  });

  const convertedSizes = computed(() => {
    if (!selectedSize.value) return {};
    const row = currentTableData.value.find(r => r[selectedRegion.value] === selectedSize.value);
    return row || {};
  });

  const isRowActive = row => {
    return row[selectedRegion.value] === selectedSize.value;
  };

  const getRegionName = code => regions[code] || code;
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

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
    max-width: 1100px;
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
    text-shadow: 4px 4px 0px #ff9fb2;
  }

  .brutal-title span {
    color: #ff4b4b;
    text-shadow: 4px 4px 0px #111;
    letter-spacing: 0;
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

  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }

  /* Toolbar */
  .brutal-toolbar {
    display: flex;
    background: #fff;
    border: 4px solid #111;
    padding: 1.25rem;
    margin-bottom: 1.5rem;
    box-shadow: 8px 8px 0px #111;
  }

  .tools-left {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .brutal-action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.6rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .brutal-action-btn.primary {
    background: #00e572;
  }

  .brutal-action-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .brutal-action-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px #111;
  }

  .tab-emoji {
    font-size: 1.3rem;
  }

  /* Sub Tabs */
  .sub-tabs {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }

  .sub-tab-btn {
    padding: 0.5rem 1rem;
    background: #fff;
    border: 3px solid #111;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }

  .sub-tab-btn.active {
    background: #111;
    color: #fff;
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }

  .sub-tab-btn:hover:not(.active) {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }

  /* Layout */
  .converter-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2.5rem;
    margin-bottom: 2rem;
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
    letter-spacing: 1px;
  }

  .bg-yellow {
    background: #ffd900;
  }
  .bg-blue {
    background: #4b7bff;
    color: #fff;
  }
  .text-white {
    color: #fff;
  }

  .converter-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .input-area {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .brutal-label {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1rem;
  }

  .selector-group {
    display: flex;
    gap: 1rem;
  }

  .brutal-select {
    flex: 1;
    border: 3px solid #111;
    padding: 0.6rem 0.8rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 1rem;
    background: #ffd900;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    outline: none;
  }

  .divider-arrow {
    text-align: center;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    color: #4b7bff;
  }

  .result-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.75rem;
  }

  .result-card {
    background: #fdfae5;
    padding: 0.75rem;
    text-align: center;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }

  .result-card:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }

  .result-card.highlight {
    background: #4b7bff;
    color: #fff;
  }

  .region-label {
    display: block;
    font-size: 0.75rem;
    color: #555;
    margin-bottom: 0.25rem;
    font-weight: 700;
  }

  .result-card.highlight .region-label {
    color: rgba(255, 255, 255, 0.8);
  }

  .size-value {
    font-size: 1.1rem;
    font-weight: 800;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
  }

  /* Table */
  .table-wrapper {
    overflow-x: auto;
    flex: 1;
  }

  .brutal-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  .brutal-table th,
  .brutal-table td {
    padding: 0.75rem;
    text-align: center;
    border-bottom: 2px solid #eee;
    border-right: 1px solid #eee;
  }

  .brutal-table th {
    background: #ffd900;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    position: sticky;
    top: 0;
  }

  .brutal-table tr.active {
    background: #89b4f8;
    color: #111;
    font-weight: 700;
  }

  .brutal-table tbody tr:hover:not(.active) {
    background: #fdfae5;
  }

  /* Disclaimer */
  .disclaimer-pane {
    padding: 1.25rem 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 6px 6px 0px #111;
  }

  .disclaimer-content {
    display: flex;
    gap: 0.8rem;
    align-items: flex-start;
    font-size: 0.85rem;
    font-weight: 600;
    color: #555;
  }

  .disc-icon {
    font-size: 1.2rem;
    flex-shrink: 0;
  }

  /* Status Bar */
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

  .brutal-status.info {
    background: #fff;
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

  /* Responsive */
  @media (max-width: 900px) {
    .brutal-title {
      font-size: 2rem;
    }
    .converter-layout {
      grid-template-columns: 1fr;
    }
    .selector-group {
      flex-direction: column;
    }
    .brutal-header {
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }
  }

  /* --- Dark Mode --- */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-toolbar,
  [data-theme='dark'] .brutal-status,
  [data-theme='dark'] .brutal-status.info,
  [data-theme='dark'] .brutal-action-btn {
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

  [data-theme='dark'] .brutal-toolbar {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn {
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:hover {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn.primary {
    background: #00994c;
    color: #fff;
  }

  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane:hover {
    box-shadow: 16px 16px 0px #eee;
  }

  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
    color: #111;
  }

  [data-theme='dark'] .brutal-select {
    background: #b28f00;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
    color: #fff;
  }

  [data-theme='dark'] .sub-tab-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .sub-tab-btn.active {
    background: #eee;
    color: #111;
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .result-card {
    background: #222;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .result-card:hover {
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .result-card.highlight {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .region-label {
    color: #aaa;
  }

  [data-theme='dark'] .brutal-table th {
    background: #b28f00;
    color: #111;
  }
  [data-theme='dark'] .brutal-table td {
    border-bottom-color: #333;
    border-right-color: #333;
  }
  [data-theme='dark'] .brutal-table tr.active {
    background: #405d9e;
    color: #fff;
  }
  [data-theme='dark'] .brutal-table tbody tr:hover:not(.active) {
    background: #222;
  }

  [data-theme='dark'] .disclaimer-pane {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .disclaimer-content {
    color: #aaa;
  }

  [data-theme='dark'] .brutal-status {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }

  [data-theme='dark'] .divider-arrow {
    color: #89b4f8;
  }
</style>
