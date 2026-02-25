<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">汇率<span>.换算()</span></h1>
        <div style="width: 100px"></div>
      </header>

      <main class="brutal-grid">
        <div class="left-column">
          <section class="brutal-pane">
            <h2 class="pane-title mb-4">实时换算.CONVERT</h2>
            <div class="convert-box">
              <div class="currency-row">
                <label class="form-label">源货币 / 金额</label>
                <div class="input-with-select">
                  <input
                    v-model.number="fromAmount"
                    type="number"
                    placeholder="输入金额"
                    class="brutal-input flex-2 text-2xl"
                    @input="handleFromAmountChange"
                  />
                  <select
                    v-model="fromCurrency"
                    class="brutal-input currency-select"
                    @change="handleCurrencyChange"
                  >
                    <optgroup label="常用货币">
                      <option v-for="code in popularCurrencies" :key="code" :value="code">
                        {{ code }} - {{ getCurrencyName(code) }}
                      </option>
                    </optgroup>
                    <optgroup label="更多货币">
                      <option v-for="code in otherCurrencies" :key="code" :value="code">
                        {{ code }} - {{ getCurrencyName(code) }}
                      </option>
                    </optgroup>
                  </select>
                </div>
              </div>

              <div class="swap-row">
                <button class="swap-btn brutal-btn" title="互换货币" @click="swapCurrencies">
                  ⇅
                </button>
                <div v-if="currentRate && !loading" class="rate-display">
                  <span class="font-bold"
                    >1 {{ fromCurrency }} = {{ currentRate.toFixed(4) }} {{ toCurrency }}</span
                  >
                  <span v-if="rateDate" class="rate-date">更新于 {{ rateDate }}</span>
                </div>
                <div v-else-if="loading" class="rate-display">
                  <span class="font-bold">获取汇率中...</span>
                </div>
              </div>

              <div class="currency-row">
                <label class="form-label">目标货币 / 结果</label>
                <div class="input-with-select">
                  <input
                    v-model.number="toAmount"
                    type="number"
                    placeholder="换算结果"
                    class="brutal-input flex-2 text-2xl result-input"
                    @input="handleToAmountChange"
                  />
                  <select
                    v-model="toCurrency"
                    class="brutal-input currency-select"
                    @change="handleCurrencyChange"
                  >
                    <optgroup label="常用货币">
                      <option v-for="code in popularCurrencies" :key="code" :value="code">
                        {{ code }} - {{ getCurrencyName(code) }}
                      </option>
                    </optgroup>
                    <optgroup label="更多货币">
                      <option v-for="code in otherCurrencies" :key="code" :value="code">
                        {{ code }} - {{ getCurrencyName(code) }}
                      </option>
                    </optgroup>
                  </select>
                </div>
              </div>
            </div>
            <button class="brutal-btn w-full mt-6 bg-yellow" @click="shareResult">
              📤 分享换算结果
            </button>
          </section>

          <section class="brutal-pane mt-6 bg-cyan">
            <h3 class="pane-title mb-4">快捷换算.QUICK</h3>
            <div class="pairs-grid">
              <button
                v-for="pair in quickPairs"
                :key="pair.from + pair.to"
                class="brutal-btn quick-pair-btn"
                :class="{ active: fromCurrency === pair.from && toCurrency === pair.to }"
                @click="selectPair(pair)"
              >
                {{ pair.from }} / {{ pair.to }}
              </button>
            </div>
          </section>
        </div>

        <div class="right-column">
          <section class="brutal-pane h-full flex-col">
            <div class="pane-header flex justify-between items-center mb-4 pb-2 border-b-3">
              <h3 class="font-bold text-lg m-0">
                {{ fromCurrency }}/{{ toCurrency }} 趋势 (近30天)
              </h3>
              <button class="brutal-btn sm-btn" :disabled="historyLoading" @click="fetchHistory">
                <span :class="{ 'spin-ani': historyLoading }">🔄</span>
              </button>
            </div>

            <div class="chart-container brutal-shadow border-black bg-white flex-1 p-2">
              <canvas ref="chartCanvas"></canvas>
              <div
                v-if="historyError"
                class="chart-error bg-pink text-white font-bold p-2 border-black"
              >
                ⚠️ {{ historyError }}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, watch, nextTick } from 'vue';
  import { ElMessage } from 'element-plus';
  import { Chart, registerables } from 'chart.js';
  import {
    getLatestRate,
    getHistoricalRates,
    formatHistoryForChart,
    currencyNames,
    popularCurrencies as defaultPopular
  } from '@/api/currency';

  Chart.register(...registerables);

  import { useCopy } from '@/composables/useCopy';
  const { copyToClipboard } = useCopy();

  const fromAmount = ref(100);
  const toAmount = ref(0);
  const fromCurrency = ref('CNY');
  const toCurrency = ref('USD');
  const currentRate = ref(null);
  const rateDate = ref('');
  const loading = ref(false);
  const historyLoading = ref(false);
  const historyError = ref('');
  const chartCanvas = ref(null);
  let chartInstance = null;

  const popularCurrencies = ref(defaultPopular);
  const allCurrencies = ref(Object.keys(currencyNames));

  const otherCurrencies = computed(() => {
    return allCurrencies.value.filter(c => !popularCurrencies.value.includes(c));
  });

  const quickPairs = [
    { from: 'CNY', to: 'USD' },
    { from: 'CNY', to: 'EUR' },
    { from: 'CNY', to: 'JPY' },
    { from: 'CNY', to: 'HKD' },
    { from: 'CNY', to: 'GBP' },
    { from: 'USD', to: 'EUR' },
    { from: 'USD', to: 'JPY' },
    { from: 'EUR', to: 'GBP' }
  ];

  const getCurrencyName = code => currencyNames[code] || code;

  const fetchRate = async () => {
    if (fromCurrency.value === toCurrency.value) {
      currentRate.value = 1;
      toAmount.value = fromAmount.value;
      return;
    }

    loading.value = true;
    try {
      const data = await getLatestRate(fromCurrency.value, toCurrency.value, 1);
      currentRate.value = data.rates[toCurrency.value];
      rateDate.value = data.date;
      toAmount.value = parseFloat((fromAmount.value * currentRate.value).toFixed(2));
    } catch {
      ElMessage.error('获取汇率失败，请稍后重试');
      currentRate.value = null;
    } finally {
      loading.value = false;
    }
  };

  const fetchHistory = async () => {
    if (fromCurrency.value === toCurrency.value) {
      historyError.value = '源货币和目标货币相同，无需显示趋势';
      return;
    }

    historyLoading.value = true;
    historyError.value = '';
    try {
      const data = await getHistoricalRates(fromCurrency.value, toCurrency.value, 30);
      const chartData = formatHistoryForChart(data, toCurrency.value);
      renderChart(chartData);
    } catch {
      historyError.value = '获取历史数据失败';
    } finally {
      historyLoading.value = false;
    }
  };

  const renderChart = data => {
    if (!chartCanvas.value) return;
    if (chartInstance) chartInstance.destroy();

    Chart.defaults.font.family = "'IBM Plex Mono', 'Noto Sans SC', monospace";
    Chart.defaults.font.weight = 'bold';
    Chart.defaults.color = '#111';

    const ctx = chartCanvas.value.getContext('2d');
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: `1 ${fromCurrency.value} = ? ${toCurrency.value}`,
            data: data.values,
            borderColor: '#ff4b4b',
            backgroundColor: 'rgba(255, 75, 75, 0.2)',
            borderWidth: 3,
            fill: true,
            tension: 0,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointBackgroundColor: '#111',
            pointBorderColor: '#111'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#111',
            titleFont: { size: 12 },
            bodyFont: { size: 14, weight: 'bold' },
            cornerRadius: 0,
            padding: 10,
            displayColors: false,
            callbacks: { label: context => `${context.parsed.y.toFixed(4)} ${toCurrency.value}` }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { maxTicksLimit: 6 },
            border: { color: '#111', width: 2 }
          },
          y: { grid: { color: 'rgba(0,0,0,0.1)' }, border: { color: '#111', width: 2 } }
        }
      }
    });
  };

  const handleFromAmountChange = () => {
    if (currentRate.value)
      toAmount.value = parseFloat((fromAmount.value * currentRate.value).toFixed(2));
  };

  const handleToAmountChange = () => {
    if (currentRate.value && currentRate.value !== 0) {
      fromAmount.value = parseFloat((toAmount.value / currentRate.value).toFixed(2));
    }
  };

  const handleCurrencyChange = () => {
    fetchRate();
    fetchHistory();
  };

  const swapCurrencies = () => {
    const tempCurrency = fromCurrency.value;
    const tempAmount = fromAmount.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = tempCurrency;
    fromAmount.value = toAmount.value;
    toAmount.value = tempAmount;
    fetchRate();
    fetchHistory();
  };

  const selectPair = pair => {
    fromCurrency.value = pair.from;
    toCurrency.value = pair.to;
    fetchRate();
    fetchHistory();
  };

  const shareResult = async () => {
    const text = `汇率换算：${fromAmount.value} ${fromCurrency.value} = ${toAmount.value} ${toCurrency.value} (汇率: ${currentRate.value?.toFixed(4) || 'N/A'})`;
    try {
      if (navigator.share) await navigator.share({ title: '货币汇率换算', text });
      else copyToClipboard(text, { success: '换算结果已复制到剪贴板' });
    } catch {
      ElMessage.error('分享失败');
    }
  };

  onMounted(async () => {
    await fetchRate();
    await nextTick();
    fetchHistory();
  });

  let debounceTimer = null;
  watch(fromAmount, () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(handleFromAmountChange, 300);
  });
</script>

<style scoped>
  @import '@/assets/styles/brutalism.css';

  .brutal-wrapper {
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

  .pane-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    margin: 0;
    border-bottom: 3px solid #111;
    padding-bottom: 8px;
  }

  .convert-box {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .form-label {
    display: block;
    font-size: 0.95rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: #111;
  }

  .input-with-select {
    display: flex;
    gap: 12px;
    width: 100%;
  }

  .brutal-input {
    min-width: 0;
    width: 100%;
    box-sizing: border-box;
  }

  .flex-2 {
    flex: 2;
  }
  .text-2xl {
    font-size: 1.5rem;
    font-family: 'IBM Plex Mono', monospace;
  }
  .result-input {
    background: #ffd900;
  }

  .currency-select {
    flex: 1;
    cursor: pointer;
  }

  .swap-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 0;
    border-top: 3px dashed #111;
    border-bottom: 3px dashed #111;
  }

  .swap-btn {
    width: 44px;
    height: 44px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    font-weight: 900;
  }

  .rate-display {
    display: flex;
    flex-direction: column;
  }
  .rate-date {
    font-size: 0.8rem;
    color: #555;
  }

  .pairs-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .quick-pair-btn {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    padding: 6px 12px;
    white-space: nowrap;
  }
  .quick-pair-btn.active {
    background: #111;
    color: #fff;
  }

  .flex-col {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 400px;
  }
  .flex-1 {
    flex: 1;
  }
  .border-b-3 {
    border-bottom: 3px solid #111;
  }
  .m-0 {
    margin: 0;
  }
  .p-2 {
    padding: 0.5rem;
  }
  .w-full {
    width: 100%;
  }
  .mt-6 {
    margin-top: 1.5rem;
  }
  .mb-4 {
    margin-bottom: 1rem;
  }
  .pb-2 {
    padding-bottom: 0.5rem;
  }
  .flex {
    display: flex;
  }
  .justify-between {
    justify-content: space-between;
  }
  .items-center {
    align-items: center;
  }
  .border-black {
    border: 3px solid #111;
  }
  .font-bold {
    font-weight: bold;
  }
  .text-lg {
    font-size: 1.125rem;
  }
  .h-full {
    height: 100%;
  }
  .sm-btn {
    padding: 4px 8px;
    font-size: 0.9rem;
  }

  .chart-container {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 300px;
  }
  .chart-error {
    position: absolute;
    top: 1rem;
    left: 1rem;
    right: 1rem;
    text-align: center;
  }

  .spin-ani {
    display: inline-block;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }

  .bg-yellow {
    background-color: #ffd900;
  }
  .bg-cyan {
    background-color: #00ffff;
  }
  .bg-pink {
    background-color: #ff4b4b;
  }
  .text-white {
    color: #fff;
  }

  @media (max-width: 768px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .input-with-select {
      flex-direction: column;
    }
    .chart-container {
      min-height: 250px;
    }
  }

  /* Dark mode */
  [data-theme='dark'] .brutal-wrapper {
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
  }
  [data-theme='dark'] .bg-yellow {
    background-color: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-cyan {
    background-color: #008080;
    color: #fff;
  }
  [data-theme='dark'] .bg-pink {
    background-color: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .quick-pair-btn.active {
    background: #eee;
    color: #111;
    box-shadow: 4px 4px 0px #1a1a1a;
  }
  [data-theme='dark'] .swap-row {
    border-color: #eee;
  }
  [data-theme='dark'] .result-input {
    background: #333;
    color: #ffd900;
  }
  [data-theme='dark'] .rate-date {
    color: #aaa;
  }
  [data-theme='dark'] .form-label {
    color: #eee;
  }
  [data-theme='dark'] .chart-container {
    background: #1a1a1a;
    border-color: #eee;
  }
</style>
