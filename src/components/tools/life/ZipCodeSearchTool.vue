<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">邮编<span>.查()</span></h1>
        <div style="width: 100px"></div>
      </header>

      <main class="main-content">
        <div class="brutal-pane search-section">
          <div class="pane-header bg-yellow">
            <span>🔍 邮编区号查询</span>
          </div>
          <div class="pane-body">
            <div class="search-input-wrap">
              <input
                v-model="keyword"
                type="text"
                class="brutal-input"
                placeholder="输入城市名、区号或邮编..."
                @input="handleSearch"
              />
              <button v-if="keyword" class="clear-btn" @click="clearSearch">✖</button>
            </div>
            <div class="search-tip">💡 支持模糊搜索，例如输入 "北京"、"010" 或 "100000"</div>
          </div>
        </div>

        <div v-if="results.length > 0" class="brutal-pane results-section">
          <div class="pane-header bg-green text-dark">
            <span>📋 查询结果 ({{ results.length }})</span>
          </div>
          <div class="pane-body padding-0">
            <div class="table-container">
              <table class="brutal-table">
                <thead>
                  <tr>
                    <th>省份</th>
                    <th>城市</th>
                    <th>区县</th>
                    <th>邮政编码</th>
                    <th>电话区号</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in results" :key="idx">
                    <td>{{ row.province }}</td>
                    <td>{{ row.city }}</td>
                    <td>{{ row.district }}</td>
                    <td>
                      <div class="copy-cell">
                        <span class="code-text">{{ row.zip }}</span>
                        <button class="copy-btn" @click="copy(row.zip, '邮政编码')">复制</button>
                      </div>
                    </td>
                    <td>
                      <div class="copy-cell">
                        <span class="code-text">{{ row.areaCode }}</span>
                        <button class="copy-btn" @click="copy(row.areaCode, '电话区号')">
                          复制
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div v-else-if="keyword" class="no-result">未找到相关信息，换个词试试？ 🧐</div>

        <div v-else class="brutal-pane hot-cities">
          <div class="pane-header bg-blue text-white">
            <span>🔥 热门城市</span>
          </div>
          <div class="pane-body">
            <div class="city-tags">
              <button
                v-for="city in hotCities"
                :key="city"
                class="brutal-tag city-tag"
                @click="
                  keyword = city;
                  handleSearch();
                "
              >
                {{ city }}
              </button>
            </div>
          </div>
        </div>
      </main>

      <!-- Custom Toast -->
      <div v-if="toastMsg" class="brutal-toast">
        {{ toastMsg }}
      </div>

      <div class="brutal-status">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i">© 2026 LRM工具箱 - 邮编区号查询 // &nbsp;</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useCopy } from '@/composables/useCopy';

  const { copyToClipboard } = useCopy();

  interface RegionData {
    province: string;
    city: string;
    district: string;
    zip: string;
    areaCode: string;
  }

  const keyword = ref('');
  const results = ref<RegionData[]>([]);
  const hotCities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '西安'];

  const mockData: RegionData[] = [
    { province: '北京市', city: '北京市', district: '东城区', zip: '100010', areaCode: '010' },
    { province: '北京市', city: '北京市', district: '西城区', zip: '100032', areaCode: '010' },
    { province: '北京市', city: '北京市', district: '朝阳区', zip: '100020', areaCode: '010' },
    { province: '北京市', city: '北京市', district: '海淀区', zip: '100080', areaCode: '010' },
    { province: '上海市', city: '上海市', district: '黄浦区', zip: '200001', areaCode: '021' },
    { province: '上海市', city: '上海市', district: '徐汇区', zip: '200030', areaCode: '021' },
    { province: '广东省', city: '广州市', district: '越秀区', zip: '510030', areaCode: '020' },
    { province: '广东省', city: '深圳市', district: '福田区', zip: '518000', areaCode: '0755' },
    { province: '广东省', city: '深圳市', district: '南山区', zip: '518000', areaCode: '0755' },
    { province: '浙江省', city: '杭州市', district: '西湖区', zip: '310000', areaCode: '0571' },
    { province: '四川省', city: '成都市', district: '锦江区', zip: '610000', areaCode: '028' },
    { province: '湖北省', city: '武汉市', district: '江汉区', zip: '430000', areaCode: '027' },
    { province: '江苏省', city: '南京市', district: '玄武区', zip: '210000', areaCode: '025' },
    { province: '陕西省', city: '西安市', district: '雁塔区', zip: '710000', areaCode: '029' }
  ];

  const handleSearch = () => {
    if (!keyword.value) {
      results.value = [];
      return;
    }
    const k = keyword.value.trim();
    results.value = mockData.filter(
      item =>
        item.city.includes(k) ||
        item.province.includes(k) ||
        item.district.includes(k) ||
        item.zip.includes(k) ||
        item.areaCode.includes(k)
    );
  };

  const clearSearch = () => {
    keyword.value = '';
    results.value = [];
  };

  const toastMsg = ref('');
  let toastTimer: ReturnType<typeof setTimeout> | null = null;

  const copy = (text: string, type: string) => {
    copyToClipboard(text);
    toastMsg.value = `已复制 ${type}: ${text}`;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastMsg.value = '';
    }, 2500);
  };
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
    text-shadow: 4px 4px 0px #00e572;
  }
  .brutal-title span {
    color: #00e572;
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
  .padding-0 {
    padding: 0;
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
    gap: 2rem;
  }

  .search-input-wrap {
    position: relative;
    display: flex;
    max-width: 600px;
    margin: 0 auto 1rem;
  }
  .brutal-input {
    width: 100%;
    border: 4px solid #111;
    padding: 1rem 3rem 1rem 1rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 1.25rem;
    box-shadow: 4px 4px 0px #111;
    outline: none;
    transition: all 0.2s;
    color: #111;
    text-align: center;
  }
  .brutal-input:focus {
    background: #fdfae5;
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }
  .clear-btn {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: #111;
    color: white;
    border: none;
    width: 30px;
    height: 30px;
    cursor: pointer;
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.1s;
  }
  .clear-btn:hover {
    background: #ff4b4b;
  }

  .search-tip {
    text-align: center;
    font-weight: 700;
    color: #555;
    font-size: 0.9rem;
  }

  .table-container {
    width: 100%;
    overflow-x: auto;
  }
  .brutal-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }
  .brutal-table th {
    background: #111;
    color: #fff;
    padding: 1rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    border-bottom: 4px solid #111;
    border-right: 2px solid #333;
    white-space: nowrap;
  }
  .brutal-table th:last-child {
    border-right: none;
  }
  .brutal-table td {
    padding: 1rem;
    border-bottom: 2px dashed #ccc;
    border-right: 2px dashed #eee;
    font-weight: 700;
    font-size: 1rem;
  }
  .brutal-table td:last-child {
    border-right: none;
  }
  .brutal-table tr:hover {
    background: #fdfae5;
  }
  .brutal-table tr:last-child td {
    border-bottom: none;
  }

  .copy-cell {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .code-text {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1.1rem;
    color: #111;
  }
  .copy-btn {
    background: #00e572;
    color: #111;
    border: 2px solid #111;
    padding: 4px 10px;
    font-weight: 800;
    font-size: 0.8rem;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.1s;
    white-space: nowrap;
  }
  .copy-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
    background: #ffd900;
  }
  .copy-btn:active {
    transform: translate(2px, 2px);
    box-shadow: 0 0 0 #111;
  }

  .no-result {
    font-weight: 800;
    color: #111;
    text-align: center;
    padding: 3rem;
    border: 4px dashed #111;
    background: #eee;
    font-size: 1.25rem;
  }

  .city-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .city-tag {
    background: #fff;
    border: 3px solid #111;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 800;
    font-size: 1.1rem;
    padding: 0.6rem 1.2rem;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.15s;
    color: #111;
  }
  .city-tag:hover {
    background: #4b7bff;
    color: #fff;
    transform: translate(-3px, -3px);
    box-shadow: 7px 7px 0px #111;
  }
  .city-tag:active {
    transform: translate(4px, 4px);
    box-shadow: 0 0 0 #111;
  }

  .brutal-toast {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: #fff;
    border: 4px solid #111;
    border-left: 8px solid #00e572;
    box-shadow: 6px 6px 0px #111;
    font-weight: 800;
    font-size: 1rem;
    z-index: 9999;
    animation: slideIn 0.3s ease;
    color: #111;
  }
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
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
    margin-top: 1rem;
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
    .table-container {
      overflow-x: scroll;
    }
    .brutal-input {
      font-size: 1rem;
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
  [data-theme='dark'] .brutal-status,
  [data-theme='dark'] .brutal-toast,
  [data-theme='dark'] .city-tag {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .city-tag {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:hover,
  [data-theme='dark'] .city-tag:hover {
    box-shadow: 9px 9px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:active,
  [data-theme='dark'] .city-tag:active {
    box-shadow: 0 0 0 #eee;
  }
  [data-theme='dark'] .city-tag:hover {
    background: #2a4eb2;
    color: #fff;
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
  [data-theme='dark'] .clear-btn {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .clear-btn:hover {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .search-tip {
    color: #aaa;
  }
  [data-theme='dark'] .no-result {
    background: #333;
    border-color: #eee;
    color: #ccc;
  }
  [data-theme='dark'] .brutal-table th {
    background: #333;
    border-bottom-color: #eee;
    border-right-color: #555;
  }
  [data-theme='dark'] .brutal-table td {
    border-bottom-color: #444;
    border-right-color: #333;
  }
  [data-theme='dark'] .brutal-table tr:hover {
    background: #222;
  }
  [data-theme='dark'] .code-text {
    color: #eee;
  }
  [data-theme='dark'] .copy-btn {
    background: #00994c;
    color: #fff;
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .copy-btn:hover {
    background: #b28f00;
    color: #111;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .copy-btn:active {
    box-shadow: 0 0 0 #eee;
  }
  [data-theme='dark'] .brutal-toast {
    box-shadow: 6px 6px 0px #eee;
    color: #eee;
    border-left-color: #00994c;
  }
  [data-theme='dark'] .brutal-status {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
</style>
