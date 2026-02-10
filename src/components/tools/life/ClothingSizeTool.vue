<template>
  <div class="clothing-size-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>服装尺码助手</h1>
        <span class="nav-subtitle">Size Guide</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="category-tabs glass-card">
        <button
          v-for="cat in categories"
          :key="cat.id"
          :class="['tab-btn', { active: currentCategory === cat.id }]"
          @click="currentCategory = cat.id"
        >
          <span class="tab-icon">{{ cat.icon }}</span>
          <span>{{ cat.name }}</span>
        </button>
      </div>

      <div v-if="subCategories.length > 1" class="sub-category-tabs">
        <button
          v-for="sub in subCategories"
          :key="sub.id"
          :class="['sub-tab', { active: currentSubCategory === sub.id }]"
          @click="currentSubCategory = sub.id"
        >
          {{ sub.name }}
        </button>
      </div>

      <section class="converter-section glass-card">
        <div class="input-area">
          <label>我已知的尺码：</label>
          <div class="selector-group">
            <select v-model="selectedRegion" class="region-select">
              <option v-for="region in currentRegions" :key="region.code" :value="region.code">
                {{ region.name }} ({{ region.code }})
              </option>
            </select>
            <select v-model="selectedSize" class="size-select">
              <option v-for="size in availableSizes" :key="size" :value="size">
                {{ size }}
              </option>
            </select>
          </div>
        </div>

        <div class="divider">
          <el-icon>
            <ArrowDown />
          </el-icon>
        </div>

        <div class="result-area">
          <label>对应其他标准：</label>
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
      </section>

      <section class="table-section glass-card">
        <div class="section-header">
          <h3>完整对照表</h3>
        </div>
        <div class="table-wrapper">
          <table class="size-table">
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
      </section>
    </main>

    <div class="disclaimer-wrap" style="max-width: 900px; margin: 0 auto; padding: 0 1.5rem 2rem">
      <div
        class="disclaimer-card"
        style="
          display: flex;
          gap: 0.8rem;
          padding: 1rem;
          background: #f8fafc;
          color: #475569;
          border-radius: 12px;
          font-size: 0.8rem;
          align-items: start;
        "
      >
        <el-icon>
          <InfoFilled />
        </el-icon>
        <span
          >尺码对照表为通用参考标准。由于不同品牌、款式的剪裁差异，建议结合具体商品的尺寸测量表或咨询客服进行选择。</span
        >
      </div>
    </div>

    <footer class="footer">© 2026 LRM工具箱 - 服装尺码助手</footer>
  </div>
</template>

<script setup>
  import { ref, computed, watch } from 'vue';
  import { Back, ArrowDown, InfoFilled } from '@element-plus/icons-vue';

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
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

  .clothing-size-tool {
    --bg: #faf9f7;
    --card: #ffffff;
    --border: #e8e6e3;
    --text: #1a1a1a;
    --text-secondary: #6b6b6b;
    --accent: #2563eb;
    --accent-light: #eff6ff;

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

  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 0.9rem;
    padding: 0.5rem;
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
  }

  .nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .nav-spacer {
    width: 60px;
  }

  .main-content {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }

  .glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  .category-tabs {
    display: flex;
    justify-content: space-around;
    padding: 0.75rem;
    gap: 0.5rem;
  }

  .tab-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.75rem;
    background: transparent;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    color: var(--text-secondary);
    transition: all 0.2s;
  }

  .tab-btn.active {
    background: var(--accent-light);
    color: var(--accent);
    font-weight: 600;
  }

  .tab-icon {
    font-size: 1.5rem;
  }

  .sub-category-tabs {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }

  .sub-tab {
    padding: 0.5rem 1rem;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 20px;
    cursor: pointer;
    font-size: 0.9rem;
    white-space: nowrap;
  }

  .sub-tab.active {
    background: var(--text);
    color: white;
    border-color: var(--text);
  }

  .converter-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .input-area {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .selector-group {
    display: flex;
    gap: 1rem;
  }

  select {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--bg);
    font-size: 1rem;
    outline: none;
  }

  .divider {
    display: flex;
    justify-content: center;
    color: var(--accent);
  }

  .result-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.75rem;
    margin-top: 0.75rem;
  }

  .result-card {
    background: var(--bg);
    border-radius: 8px;
    padding: 0.75rem;
    text-align: center;
    border: 1px solid transparent;
  }

  .result-card.highlight {
    background: var(--accent-light);
    border-color: var(--accent);
    color: var(--accent);
  }

  .region-label {
    display: block;
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-bottom: 0.25rem;
  }

  .size-value {
    font-size: 1.1rem;
    font-weight: 600;
  }

  .table-wrapper {
    overflow-x: auto;
  }

  .size-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  .size-table th,
  .size-table td {
    padding: 0.75rem;
    text-align: center;
    border-bottom: 1px solid var(--border);
  }

  .size-table th {
    background: var(--bg);
    font-weight: 600;
    color: var(--text-secondary);
  }

  .size-table tr.active {
    background: var(--accent-light);
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
    font-size: 0.85rem;
    border-top: 1px solid var(--border);
    margin-top: 2rem;
  }

  @media (max-width: 600px) {
    .selector-group {
      flex-direction: column;
    }
  }
</style>
