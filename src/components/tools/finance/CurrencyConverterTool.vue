<template>
    <div class="currency-converter-tool">
        
        <div class="nav-header">
            <button class="back-btn" @click="$router.back()">
                <el-icon>
                    <Back />
                </el-icon>
                <span>返回</span>
            </button>
        </div>

        
        <div class="tool-header">
            <h1 class="font-display">货币汇率换算</h1>
            <p class="summary">实时汇率查询与换算，支持30+货币，含历史趋势图表</p>
        </div>

        <div class="tool-content">
            
            <div class="converter-card glass-card">
                
                <div class="currency-row">
                    <div class="currency-input-group">
                        <label>源货币</label>
                        <div class="input-with-select">
                            <input type="number" v-model.number="fromAmount" @input="handleFromAmountChange"
                                placeholder="输入金额" class="amount-input">
                            <select v-model="fromCurrency" @change="handleCurrencyChange" class="currency-select">
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

                
                <div class="swap-row">
                    <button class="swap-btn" @click="swapCurrencies" title="互换货币">
                        <el-icon>
                            <Sort />
                        </el-icon>
                    </button>
                    <div class="rate-display" v-if="currentRate && !loading">
                        <span>1 {{ fromCurrency }} = {{ currentRate.toFixed(4) }} {{ toCurrency }}</span>
                        <span class="rate-date" v-if="rateDate">更新于 {{ rateDate }}</span>
                    </div>
                    <div class="rate-display loading" v-else-if="loading">
                        <el-icon class="is-loading">
                            <Loading />
                        </el-icon>
                        <span>获取汇率中...</span>
                    </div>
                </div>

                
                <div class="currency-row">
                    <div class="currency-input-group">
                        <label>目标货币</label>
                        <div class="input-with-select">
                            <input type="number" v-model.number="toAmount" @input="handleToAmountChange"
                                placeholder="换算结果" class="amount-input result">
                            <select v-model="toCurrency" @change="handleCurrencyChange" class="currency-select">
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
            </div>

            
            <div class="quick-pairs glass-card">
                <h3>快捷换算</h3>
                <div class="pairs-grid">
                    <button v-for="pair in quickPairs" :key="pair.from + pair.to" class="pair-btn"
                        :class="{ active: fromCurrency === pair.from && toCurrency === pair.to }"
                        @click="selectPair(pair)">
                        {{ pair.from }}/{{ pair.to }}
                    </button>
                </div>
            </div>

            
            <div class="chart-section glass-card">
                <div class="chart-header">
                    <h3>{{ fromCurrency }}/{{ toCurrency }} 汇率趋势 (近30天)</h3>
                    <button class="refresh-btn" @click="fetchHistory" :disabled="historyLoading">
                        <el-icon :class="{ 'is-loading': historyLoading }">
                            <Refresh />
                        </el-icon>
                    </button>
                </div>
                <div class="chart-container">
                    <canvas ref="chartCanvas"></canvas>
                </div>
                <div v-if="historyError" class="chart-error">
                    <el-icon>
                        <WarningFilled />
                    </el-icon>
                    <span>{{ historyError }}</span>
                </div>
            </div>

            
            <div class="scenarios glass-card">
                <h3>使用场景</h3>
                <div class="scenario-tags">
                    <span class="tag"><el-icon>
                            <ShoppingCart />
                        </el-icon> 海淘购物</span>
                    <span class="tag"><el-icon>
                            <Plane />
                        </el-icon> 出国旅行</span>
                    <span class="tag"><el-icon>
                            <Money />
                        </el-icon> 跨境结算</span>
                </div>
            </div>

            
            <div class="share-section">
                <button class="share-btn" @click="shareResult">
                    <el-icon>
                        <Share />
                    </el-icon>
                    分享换算结果
                </button>
            </div>
        </div>

        
        <footer class="footer">
            © 2026 LRM工具箱 - 汇率换算
        </footer>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { Back, Sort, Loading, Refresh, WarningFilled, ShoppingCart, Money, Share } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { Chart, registerables } from 'chart.js'
import { getLatestRate, getHistoricalRates, formatHistoryForChart, currencyNames, popularCurrencies as defaultPopular } from '@/api/currency'


Chart.register(...registerables)


const Plane = {
    template: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>`
}


const fromAmount = ref(100)
const toAmount = ref(0)
const fromCurrency = ref('CNY')
const toCurrency = ref('USD')
const currentRate = ref(null)
const rateDate = ref('')
const loading = ref(false)
const historyLoading = ref(false)
const historyError = ref('')
const chartCanvas = ref(null)
let chartInstance = null


const popularCurrencies = ref(defaultPopular)
const allCurrencies = ref(Object.keys(currencyNames))

const otherCurrencies = computed(() => {
    return allCurrencies.value.filter(c => !popularCurrencies.value.includes(c))
})


const quickPairs = [
    { from: 'CNY', to: 'USD' },
    { from: 'CNY', to: 'EUR' },
    { from: 'CNY', to: 'JPY' },
    { from: 'CNY', to: 'HKD' },
    { from: 'CNY', to: 'GBP' },
    { from: 'USD', to: 'EUR' },
    { from: 'USD', to: 'JPY' },
    { from: 'EUR', to: 'GBP' },
]


const getCurrencyName = (code) => {
    return currencyNames[code] || code
}


const fetchRate = async () => {
    if (fromCurrency.value === toCurrency.value) {
        currentRate.value = 1
        toAmount.value = fromAmount.value
        return
    }

    loading.value = true
    try {
        const data = await getLatestRate(fromCurrency.value, toCurrency.value, 1)
        currentRate.value = data.rates[toCurrency.value]
        rateDate.value = data.date
        
        toAmount.value = parseFloat((fromAmount.value * currentRate.value).toFixed(2))
    } catch (error) {
        ElMessage.error('获取汇率失败，请稍后重试')
        currentRate.value = null
    } finally {
        loading.value = false
    }
}


const fetchHistory = async () => {
    if (fromCurrency.value === toCurrency.value) {
        historyError.value = '源货币和目标货币相同，无需显示趋势'
        return
    }

    historyLoading.value = true
    historyError.value = ''
    try {
        const data = await getHistoricalRates(fromCurrency.value, toCurrency.value, 30)
        const chartData = formatHistoryForChart(data, toCurrency.value)
        renderChart(chartData)
    } catch (error) {
        historyError.value = '获取历史数据失败'
    } finally {
        historyLoading.value = false
    }
}


const renderChart = (data) => {
    if (!chartCanvas.value) return

    
    if (chartInstance) {
        chartInstance.destroy()
    }

    const ctx = chartCanvas.value.getContext('2d')
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: `1 ${fromCurrency.value} = ? ${toCurrency.value}`,
                data: data.values,
                borderColor: 'rgb(139, 92, 246)',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 2,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.parsed.y.toFixed(4)} ${toCurrency.value}`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false }
                },
                y: {
                    grid: { color: 'rgba(0,0,0,0.05)' }
                }
            }
        }
    })
}


const handleFromAmountChange = () => {
    if (currentRate.value) {
        toAmount.value = parseFloat((fromAmount.value * currentRate.value).toFixed(2))
    }
}

const handleToAmountChange = () => {
    if (currentRate.value && currentRate.value !== 0) {
        fromAmount.value = parseFloat((toAmount.value / currentRate.value).toFixed(2))
    }
}

const handleCurrencyChange = () => {
    fetchRate()
    fetchHistory()
}

const swapCurrencies = () => {
    const tempCurrency = fromCurrency.value
    const tempAmount = fromAmount.value

    fromCurrency.value = toCurrency.value
    toCurrency.value = tempCurrency

    fromAmount.value = toAmount.value
    toAmount.value = tempAmount

    fetchRate()
    fetchHistory()
}

const selectPair = (pair) => {
    fromCurrency.value = pair.from
    toCurrency.value = pair.to
    fetchRate()
    fetchHistory()
}

const shareResult = async () => {
    const text = `汇率换算：${fromAmount.value} ${fromCurrency.value} = ${toAmount.value} ${toCurrency.value} (汇率: ${currentRate.value?.toFixed(4) || 'N/A'})`
    try {
        if (navigator.share) {
            await navigator.share({ title: '货币汇率换算', text })
        } else {
            await navigator.clipboard.writeText(text)
            ElMessage.success('换算结果已复制到剪贴板')
        }
    } catch (e) {
        ElMessage.error('分享失败')
    }
}


onMounted(async () => {
    await fetchRate()
    await nextTick()
    fetchHistory()
})


let debounceTimer = null
watch(fromAmount, () => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(handleFromAmountChange, 300)
})
</script>

<style scoped>
.currency-converter-tool {
    max-width: 900px;
    margin: 0 auto;
    padding: 40px 20px;
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

.tool-header {
    text-align: center;
    margin-bottom: 40px;
}

.tool-header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 16px;
    background: var(--accent-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.summary {
    color: var(--text-secondary);
    font-size: 1.1rem;
}

.tool-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
}


.converter-card {
    padding: 32px;
    background: white;
    border-radius: 16px;
}

.currency-row {
    margin-bottom: 16px;
}

.currency-input-group label {
    display: block;
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-bottom: 8px;
}

.input-with-select {
    display: flex;
    gap: 12px;
}

.amount-input {
    flex: 1;
    padding: 14px 16px;
    font-size: 1.5rem;
    border: 2px solid var(--border-color);
    border-radius: 12px;
    transition: border-color 0.2s;
    background: var(--bg-secondary);
}

.amount-input:focus {
    outline: none;
    border-color: var(--accent-purple);
}

.amount-input.result {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(99, 102, 241, 0.05));
    font-weight: 600;
}

.currency-select {
    width: 180px;
    padding: 14px 12px;
    border: 2px solid var(--border-color);
    border-radius: 12px;
    font-size: 1rem;
    background: white;
    cursor: pointer;
}

.currency-select:focus {
    outline: none;
    border-color: var(--accent-purple);
}


.swap-row {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 0;
    border-top: 1px dashed var(--border-color);
    border-bottom: 1px dashed var(--border-color);
    margin: 16px 0;
}

.swap-btn {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 2px solid var(--accent-purple);
    background: white;
    color: var(--accent-purple);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    transition: all 0.2s;
}

.swap-btn:hover {
    background: var(--accent-purple);
    color: white;
    transform: rotate(180deg);
}

.rate-display {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 1rem;
    color: var(--text-primary);
}

.rate-display.loading {
    flex-direction: row;
    align-items: center;
    gap: 8px;
    color: var(--text-secondary);
}

.rate-date {
    font-size: 0.8rem;
    color: var(--text-muted);
}


.quick-pairs {
    padding: 24px;
    background: white;
    border-radius: 16px;
}

.quick-pairs h3 {
    margin-bottom: 16px;
    font-size: 1rem;
    color: var(--text-secondary);
}

.pairs-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.pair-btn {
    padding: 10px 16px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-secondary);
    cursor: pointer;
    font-size: 0.95rem;
    transition: all 0.2s;
}

.pair-btn:hover {
    border-color: var(--accent-purple);
    color: var(--accent-purple);
}

.pair-btn.active {
    background: var(--accent-purple);
    color: white;
    border-color: var(--accent-purple);
}


.chart-section {
    padding: 24px;
    background: white;
    border-radius: 16px;
}

.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.chart-header h3 {
    font-size: 1rem;
    color: var(--text-primary);
}

.refresh-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: var(--bg-secondary);
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
}

.refresh-btn:hover {
    background: var(--accent-purple);
    color: white;
}

.chart-container {
    height: 250px;
    position: relative;
}

.chart-error {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
    padding: 20px;
    color: var(--text-muted);
}


.scenarios {
    padding: 24px;
    background: white;
    border-radius: 16px;
}

.scenarios h3 {
    margin-bottom: 16px;
    font-size: 1rem;
    color: var(--text-secondary);
}

.scenario-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.tag {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.1));
    border-radius: 20px;
    font-size: 0.9rem;
    color: var(--accent-purple);
}


.share-section {
    text-align: center;
}

.share-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: var(--accent-gradient);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

.share-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}


.footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
    font-size: 0.85rem;
    border-top: 1px solid var(--border-color);
    margin-top: 40px;
}


@media (max-width: 768px) {
    .tool-header h1 {
        font-size: 1.8rem;
    }

    .input-with-select {
        flex-direction: column;
    }

    .currency-select {
        width: 100%;
    }

    .amount-input {
        font-size: 1.2rem;
    }

    .swap-row {
        flex-direction: column;
        text-align: center;
    }

    .pairs-grid {
        justify-content: center;
    }
}


.is-loading {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}
</style>
