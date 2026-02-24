<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">屏幕<span>.分辨率()</span></h1>
        <div style="width: 100px"></div>
      </header>

      <div class="brutal-toolbar">
        <div class="tools-left">
          <button
            v-for="cat in categories"
            :key="cat.id"
            class="filter-btn"
            :class="{ active: currentFilter === cat.id }"
            @click="currentFilter = cat.id"
          >
            {{ cat.name }}
          </button>
        </div>
        <div class="tools-right">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input v-model="searchText" placeholder="搜索设备..." class="search-input" />
          </div>
        </div>
      </div>

      <div class="brutal-pane">
        <div class="pane-header bg-blue">
          <span class="text-white">设备列表.DEVICES</span>
          <span class="text-white" style="font-size: 0.85rem">{{ filteredDevices.length }} 项</span>
        </div>
        <div class="table-wrap">
          <div class="table-header">
            <div class="col name">设备名称</div>
            <div class="col logic">逻辑分辨率 (pt/dp)</div>
            <div class="col phys">物理分辨率 (px)</div>
            <div class="col ratio">倍率</div>
            <div class="col ppi">PPI</div>
            <div class="col size">尺寸</div>
          </div>
          <div v-for="dev in filteredDevices" :key="dev.name" class="table-row">
            <div class="col name">
              <span class="dev-name">{{ dev.name }}</span>
              <span v-if="dev.year" class="dev-year">{{ dev.year }}</span>
            </div>
            <div class="col logic">
              <span class="mono">{{ dev.lw }} × {{ dev.lh }}</span>
            </div>
            <div class="col phys">
              <span class="mono">{{ dev.pw }} × {{ dev.ph }}</span>
            </div>
            <div class="col ratio">
              <span class="ratio-tag">@{{ dev.ratio }}x</span>
            </div>
            <div class="col ppi">{{ dev.ppi }}</div>
            <div class="col size">{{ dev.size }}"</div>
          </div>
          <div v-if="filteredDevices.length === 0" class="empty-row">无匹配设备</div>
        </div>
      </div>

      <div class="brutal-tips-bar">
        <strong>💡 适配建议：</strong>设计稿通常以逻辑分辨率为基准（如 iPhone 的 375pt 或
        393pt），导出切图时再根据倍率（@2x, @3x）生成对应资源。
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push('/');
  }

  const currentFilter = ref('mobile');
  const searchText = ref('');

  const categories = [
    { id: 'mobile', name: '📱 手机' },
    { id: 'tablet', name: '📟 平板' },
    { id: 'desktop', name: '💻 电脑' },
    { id: 'watch', name: '⌚ 手表' }
  ];

  const devices = [
    {
      type: 'mobile',
      name: 'iPhone 17 Pro Max',
      year: '2025',
      lw: 432,
      lh: 936,
      pw: 1302,
      ph: 2820,
      ratio: 3,
      ppi: '~460',
      size: 6.9
    },
    {
      type: 'mobile',
      name: 'iPhone 17 Pro',
      year: '2025',
      lw: 396,
      lh: 864,
      pw: 1190,
      ph: 2600,
      ratio: 3,
      ppi: '~460',
      size: 6.3
    },
    {
      type: 'mobile',
      name: 'iPhone 16 Pro Max',
      year: '2024',
      lw: 430,
      lh: 932,
      pw: 1290,
      ph: 2796,
      ratio: 3,
      ppi: 460,
      size: 6.9
    },
    {
      type: 'mobile',
      name: 'iPhone 16 Pro',
      year: '2024',
      lw: 393,
      lh: 852,
      pw: 1179,
      ph: 2556,
      ratio: 3,
      ppi: 460,
      size: 6.3
    },
    {
      type: 'mobile',
      name: 'iPhone 16 / 16 Plus',
      year: '2024',
      lw: 393,
      lh: 852,
      pw: 1179,
      ph: 2556,
      ratio: 3,
      ppi: 460,
      size: '6.1/6.7'
    },
    {
      type: 'mobile',
      name: 'iPhone 15 Pro Max',
      year: '2023',
      lw: 430,
      lh: 932,
      pw: 1290,
      ph: 2796,
      ratio: 3,
      ppi: 460,
      size: 6.7
    },
    {
      type: 'mobile',
      name: 'iPhone 15 Pro',
      year: '2023',
      lw: 393,
      lh: 852,
      pw: 1179,
      ph: 2556,
      ratio: 3,
      ppi: 460,
      size: 6.1
    },
    {
      type: 'mobile',
      name: 'iPhone 15 / 15 Plus',
      year: '2023',
      lw: 393,
      lh: 852,
      pw: 1179,
      ph: 2556,
      ratio: 3,
      ppi: 460,
      size: '6.1/6.7'
    },
    {
      type: 'mobile',
      name: 'iPhone 14 Pro Max',
      year: '2022',
      lw: 430,
      lh: 932,
      pw: 1290,
      ph: 2796,
      ratio: 3,
      ppi: 460,
      size: 6.7
    },
    {
      type: 'mobile',
      name: 'iPhone 13 / 14',
      year: '2021',
      lw: 390,
      lh: 844,
      pw: 1170,
      ph: 2532,
      ratio: 3,
      ppi: 460,
      size: 6.1
    },
    {
      type: 'mobile',
      name: 'iPhone 13 mini',
      year: '2021',
      lw: 375,
      lh: 812,
      pw: 1125,
      ph: 2436,
      ratio: 3,
      ppi: 476,
      size: 5.4
    },
    {
      type: 'mobile',
      name: 'Samsung S26 Ultra (Est.)',
      year: '2026',
      lw: 420,
      lh: 920,
      pw: 1440,
      ph: 3220,
      ratio: 3.5,
      ppi: '~500',
      size: 6.9
    },
    {
      type: 'mobile',
      name: 'Pixel 10 Pro',
      year: '2025',
      lw: 412,
      lh: 892,
      pw: 1440,
      ph: 3120,
      ratio: 3.5,
      ppi: 512,
      size: 6.8
    },
    {
      type: 'mobile',
      name: 'Android Standard',
      year: '-',
      lw: 360,
      lh: 800,
      pw: 1080,
      ph: 2400,
      ratio: 3,
      ppi: '~400',
      size: '-'
    },
    {
      type: 'mobile',
      name: 'Android Large',
      year: '-',
      lw: 412,
      lh: 915,
      pw: 1440,
      ph: 3200,
      ratio: 3.5,
      ppi: '~500',
      size: '-'
    },
    {
      type: 'tablet',
      name: 'iPad Pro 13" (M4)',
      year: '2024',
      lw: 1032,
      lh: 1376,
      pw: 2064,
      ph: 2752,
      ratio: 2,
      ppi: 264,
      size: 13.0
    },
    {
      type: 'tablet',
      name: 'iPad Pro 11" (M4)',
      year: '2024',
      lw: 834,
      lh: 1210,
      pw: 1668,
      ph: 2420,
      ratio: 2,
      ppi: 264,
      size: 11.0
    },
    {
      type: 'tablet',
      name: 'iPad Pro 12.9"',
      year: 'M2',
      lw: 1024,
      lh: 1366,
      pw: 2048,
      ph: 2732,
      ratio: 2,
      ppi: 264,
      size: 12.9
    },
    {
      type: 'tablet',
      name: 'iPad Air 13"',
      year: '2024',
      lw: 1024,
      lh: 1366,
      pw: 2048,
      ph: 2732,
      ratio: 2,
      ppi: 264,
      size: 12.9
    },
    {
      type: 'tablet',
      name: 'iPad mini 6',
      year: '2021',
      lw: 744,
      lh: 1133,
      pw: 1488,
      ph: 2266,
      ratio: 2,
      ppi: 326,
      size: 8.3
    },
    {
      type: 'desktop',
      name: 'MacBook Pro 16" (M4)',
      year: '2025',
      lw: 1728,
      lh: 1117,
      pw: 3456,
      ph: 2234,
      ratio: 2,
      ppi: 254,
      size: 16.2
    },
    {
      type: 'desktop',
      name: 'MacBook Pro 14" (M4)',
      year: '2025',
      lw: 1512,
      lh: 982,
      pw: 3024,
      ph: 1964,
      ratio: 2,
      ppi: 254,
      size: 14.2
    },
    {
      type: 'desktop',
      name: 'MacBook Air 15" (M3)',
      year: '2024',
      lw: 1440,
      lh: 932,
      pw: 2880,
      ph: 1864,
      ratio: 2,
      ppi: 224,
      size: 15.3
    },
    {
      type: 'desktop',
      name: 'MacBook Air 13" (M3)',
      year: '2024',
      lw: 1280,
      lh: 832,
      pw: 2560,
      ph: 1664,
      ratio: 2,
      ppi: 224,
      size: 13.6
    },
    {
      type: 'desktop',
      name: 'Full HD Monitor',
      year: '-',
      lw: 1920,
      lh: 1080,
      pw: 1920,
      ph: 1080,
      ratio: 1,
      ppi: '~96',
      size: '24'
    },
    {
      type: 'desktop',
      name: '4K Monitor',
      year: '-',
      lw: 1920,
      lh: 1080,
      pw: 3840,
      ph: 2160,
      ratio: 2,
      ppi: '~160',
      size: '27'
    },
    {
      type: 'desktop',
      name: '5K Studio Display',
      year: '-',
      lw: 2560,
      lh: 1440,
      pw: 5120,
      ph: 2880,
      ratio: 2,
      ppi: 218,
      size: '27'
    },
    {
      type: 'watch',
      name: 'Apple Watch Ultra 2',
      year: '2024',
      lw: 205,
      lh: 251,
      pw: 410,
      ph: 502,
      ratio: 2,
      ppi: 338,
      size: 49
    },
    {
      type: 'watch',
      name: 'Apple Watch Series 10 46mm',
      year: '2024',
      lw: 208,
      lh: 248,
      pw: 416,
      ph: 496,
      ratio: 2,
      ppi: 326,
      size: 46
    },
    {
      type: 'watch',
      name: 'Apple Watch Series 10 42mm',
      year: '2024',
      lw: 187,
      lh: 223,
      pw: 374,
      ph: 446,
      ratio: 2,
      ppi: 326,
      size: 42
    }
  ];

  const filteredDevices = computed(() => {
    return devices.filter(d => {
      const matchType = d.type === currentFilter.value;
      const matchSearch =
        !searchText.value || d.name.toLowerCase().includes(searchText.value.toLowerCase());
      return matchType && matchSearch;
    });
  });
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
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }
  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.5rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #ff4b4b;
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

  .brutal-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    border: 4px solid #111;
    padding: 1rem 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 8px 8px 0px #111;
    gap: 1rem;
    overflow: hidden;
    flex-wrap: wrap;
  }
  .tools-left {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .filter-btn {
    padding: 0.5rem 1rem;
    border: 3px solid #111;
    background: #fff;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }
  .filter-btn.active {
    background: #ffd900;
  }
  .filter-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0px #111;
  }
  .search-box {
    display: flex;
    align-items: center;
    border: 3px solid #111;
    background: #fff;
    padding: 0.3rem 0.75rem;
    gap: 0.5rem;
    box-shadow: 3px 3px 0px #111;
  }
  .search-icon {
    font-size: 0.9rem;
  }
  .search-input {
    border: none;
    outline: none;
    background: transparent;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.9rem;
    width: 150px;
  }

  .brutal-pane {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
    margin-bottom: 2rem;
  }
  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.2rem;
    letter-spacing: 1px;
  }
  .bg-blue {
    background: #4b7bff;
    color: #fff;
  }
  .text-white {
    color: #fff;
  }

  .table-wrap {
    overflow-x: auto;
  }
  .table-header,
  .table-row {
    display: grid;
    grid-template-columns: 3fr 2fr 2fr 1fr 1fr 1fr;
    min-width: 800px;
  }
  .table-header {
    background: #ffd900;
    font-weight: 800;
    font-size: 0.85rem;
    border-bottom: 3px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
  }
  .table-row {
    border-bottom: 2px solid #e5e5e5;
    font-size: 0.9rem;
    transition: background 0.1s;
  }
  .table-row:last-child {
    border-bottom: none;
  }
  .table-row:hover {
    background: #fffbe6;
  }
  .col {
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
  }
  .dev-name {
    font-weight: 700;
  }
  .dev-year {
    font-size: 0.7rem;
    background: #111;
    color: #ffd900;
    padding: 1px 6px;
    margin-left: 0.5rem;
    font-weight: 600;
  }
  .mono {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
  }
  .ratio-tag {
    font-size: 0.8rem;
    background: #4b7bff;
    color: #fff;
    padding: 2px 8px;
    border: 2px solid #111;
    font-weight: 700;
  }
  .empty-row {
    padding: 2rem;
    text-align: center;
    color: #888;
    font-weight: 600;
  }

  .brutal-tips-bar {
    background: #ffd900;
    border: 4px solid #111;
    padding: 1rem 1.5rem;
    box-shadow: 6px 6px 0px #111;
    font-size: 0.9rem;
    line-height: 1.6;
  }

  @media (max-width: 768px) {
    .brutal-title {
      font-size: 2.5rem;
    }
    .brutal-header {
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }
    .brutal-toolbar {
      flex-direction: column;
      align-items: stretch;
    }
    .tools-left {
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
  [data-theme='dark'] .filter-btn,
  [data-theme='dark'] .search-box {
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
  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .brutal-toolbar {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .filter-btn {
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .filter-btn.active {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .search-box {
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .search-input {
    color: #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .table-header {
    background: #b28f00;
    color: #fff;
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .table-row {
    border-bottom-color: #333;
  }
  [data-theme='dark'] .table-row:hover {
    background: #222;
  }
  [data-theme='dark'] .dev-year {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .ratio-tag {
    background: #2a4eb2;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-tips-bar {
    background: #b28f00;
    border-color: #eee;
    box-shadow: 6px 6px 0px #eee;
    color: #fff;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
  }
</style>
