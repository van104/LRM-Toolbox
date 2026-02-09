<template>
    <div class="compound-tool">
        <nav class="nav-bar">
            <button class="nav-back" @click="$router.back()">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>投资复利计算器</h1>
                <span class="nav-subtitle">Compound Interest Calculator</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="layout-container">
                
                <section class="input-panel glass-card">
                    <div class="form-title">计算参数</div>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>初始本金 (元)</label>
                            <el-input-number v-model="principal" :min="0" :step="1000" class="w-full" />
                        </div>
                        <div class="form-group">
                            <label>定期投入 (元)</label>
                            <div class="input-with-select">
                                <el-input-number v-model="addition" :min="0" :step="500" class="flex-1" />
                                <el-select v-model="frequency" style="width: 80px">
                                    <el-option label="每月" value="monthly" />
                                    <el-option label="每年" value="yearly" />
                                </el-select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>预期年化收益率 (%)</label>
                            <el-input-number v-model="annualRate" :min="0" :max="100" :step="0.5" class="w-full" />
                        </div>
                        <div class="form-group">
                            <label>投资时长 (年)</label>
                            <el-input-number v-model="years" :min="1" :max="50" class="w-full" />
                        </div>
                    </div>
                    <el-button type="primary" class="calc-btn" size="large" @click="calculate">开始复利运算</el-button>
                </section>

                
                <div v-if="history.length > 0" class="results-area">
                    <section class="summary-card glass-card">
                        <div class="summary-grid">
                            <div class="summary-item main">
                                <div class="label">最终金额 (本息合计)</div>
                                <div class="value">¥ {{ formatMoney(totalValue) }}</div>
                            </div>
                            <div class="summary-item">
                                <div class="label">累计投入本金</div>
                                <div class="value">¥ {{ formatMoney(totalPrincipal) }}</div>
                            </div>
                            <div class="summary-item">
                                <div class="label">累计产生利息</div>
                                <div class="value color-green">¥ {{ formatMoney(totalInterest) }}</div>
                            </div>
                        </div>

                        
                        <div class="growth-analysis">
                            <div class="section-title">收益占比分析</div>
                            <div class="progress-container">
                                <div class="bar principal" :style="{ width: principalRatio + '%' }"></div>
                                <div class="bar interest" :style="{ width: interestRatio + '%' }"></div>
                            </div>
                            <div class="legend">
                                <span><i class="dot principal"></i> 投入本金 ({{ principalRatio }}%)</span>
                                <span><i class="dot interest"></i> 复利利息 ({{ interestRatio }}%)</span>
                            </div>
                        </div>
                    </section>

                    <section class="history-card glass-card">
                        <div class="section-title">资产增长明细</div>
                        <el-table :data="history" border stripe height="400">
                            <el-table-column prop="year" label="年份" width="80" align="center" />
                            <el-table-column label="本年金额" min-width="120">
                                <template #default="{ row }">¥ {{ formatMoney(row.value) }}</template>
                            </el-table-column>
                            <div class="hidden-xs">
                                <el-table-column label="当年收益" width="120">
                                    <template #default="{ row }">¥ {{ formatMoney(row.yearlyInterest) }}</template>
                                </el-table-column>
                            </div>
                            <el-table-column label="累计利息" min-width="120">
                                <template #default="{ row }">¥ {{ formatMoney(row.accumulatedInterest) }}</template>
                            </el-table-column>
                        </el-table>
                    </section>
                </div>
            </div>
        </main>

        <section class="finance-info glass-card">
            <h4><el-icon>
                    <MagicStick />
                </el-icon> 复利的力量：世界第八大奇迹</h4>
            <div class="info-content">
                <p>复利是指在计算利息时，将上一个周期的利息并入本金，作为下一个周期计算利息的基数。通俗地说，就是“利滚利”。</p>
                <div class="formula">
                    复利计算公式：A = P(1 + r/n)<sup>nt</sup>
                </div>
                <p class="tip">长期持有、稳定的收益率是复利发挥威力的核心因素。即使初始金额不多，通过长时间的积累，结果也会令人惊讶。</p>
            </div>
        </section>

        <footer class="footer">
            © 2026 LRM工具箱 - 投资复利计算
        </footer>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Back, MagicStick } from '@element-plus/icons-vue'


const principal = ref(50000)
const addition = ref(2000)
const frequency = ref('monthly')
const annualRate = ref(8)
const years = ref(10)

const history = ref([])
const totalValue = ref(0)
const totalPrincipal = ref(0)
const totalInterest = ref(0)

const formatMoney = (val) => {
    return val.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const calculate = () => {
    const list = []
    let currentBalance = principal.value
    let currentTotalPrincipal = principal.value
    let currentAccumulatedInterest = 0

    
    const monthlyRate = (annualRate.value / 100) / 12
    const yearlyRate = annualRate.value / 100

    for (let y = 1; y <= years.value; y++) {
        let yearlyInterest = 0
        const startValue = currentBalance

        if (frequency.value === 'monthly') {
            for (let m = 1; m <= 12; m++) {
                currentBalance += addition.value 
                currentTotalPrincipal += addition.value
                const mInt = currentBalance * monthlyRate
                currentBalance += mInt
                yearlyInterest += mInt
            }
        } else {
            currentBalance += addition.value 
            currentTotalPrincipal += addition.value
            const yInt = currentBalance * yearlyRate
            currentBalance += yInt
            yearlyInterest = yInt
        }

        currentAccumulatedInterest += yearlyInterest
        list.push({
            year: y,
            value: currentBalance,
            yearlyInterest: yearlyInterest,
            accumulatedInterest: currentAccumulatedInterest
        })
    }

    history.value = list
    totalValue.value = currentBalance
    totalPrincipal.value = currentTotalPrincipal
    totalInterest.value = currentAccumulatedInterest
}

const principalRatio = computed(() => {
    if (!totalValue.value) return 0
    return ((totalPrincipal.value / totalValue.value) * 100).toFixed(1)
})

const interestRatio = computed(() => {
    if (!totalValue.value) return 0
    return (100 - parseFloat(principalRatio.value)).toFixed(1)
})

onMounted(() => {
    calculate()
})
</script>

<style scoped>
.compound-tool {
    --primary: #10b981;
    --primary-light: #ecfdf5;
    --green-dark: #065f46;
    --bg: #f8fafc;
    --white: #ffffff;
    --border: #e2e8f0;

    min-height: 100vh;
    background: var(--bg);
}

.nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
    background: var(--white);
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 10;
}

.nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
}

.nav-center {
    text-align: center;
}

.nav-center h1 {
    font-size: 1.25rem;
    margin: 0;
}

.nav-subtitle {
    font-size: 0.75rem;
    color: #94a3b8;
    text-transform: uppercase;
}

.main-content {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
}

.layout-container {
    display: grid;
    grid-template-columns: 360px 1fr;
    gap: 1.5rem;
}

.glass-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
}

.form-title {
    font-weight: 600;
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
}

.form-grid {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.form-group label {
    display: block;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
    color: #64748b;
}

.w-full {
    width: 100%;
}

.input-with-select {
    display: flex;
    gap: 8px;
}

.calc-btn {
    width: 100%;
    margin-top: 2rem;
}

.summary-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
    text-align: center;
}

.summary-item.main {
    grid-column: span 3;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--border);
    margin-bottom: 1rem;
}

.summary-item .label {
    font-size: 0.85rem;
    color: #64748b;
    margin-bottom: 0.5rem;
}

.summary-item .value {
    font-size: 1.25rem;
    font-weight: 700;
}

.summary-item.main .value {
    font-size: 2.5rem;
    color: var(--primary);
}

.color-green {
    color: var(--primary);
}

.section-title {
    font-weight: 600;
    margin-bottom: 1.25rem;
    padding-left: 8px;
    border-left: 4px solid var(--primary);
}

.progress-container {
    height: 12px;
    background: #f1f5f9;
    border-radius: 6px;
    overflow: hidden;
    display: flex;
    margin-bottom: 10px;
}

.bar.principal {
    background: #94a3b8;
}

.bar.interest {
    background: var(--primary);
}

.legend {
    display: flex;
    justify-content: center;
    gap: 2rem;
    font-size: 0.75rem;
}

.dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
}

.dot.principal {
    background: #94a3b8;
}

.dot.interest {
    background: var(--primary);
}

.history-card {
    margin-top: 1.5rem;
}

.finance-info {
    max-width: 1100px;
    margin: 1.5rem auto;
}

.formula {
    background: #f1f5f9;
    padding: 1rem;
    border-radius: 8px;
    font-family: serif;
    text-align: center;
    font-size: 1.1rem;
    margin: 1rem 0;
}

.footer {
    text-align: center;
    padding: 2rem;
    color: #94a3b8;
    font-size: 0.85rem;
}

@media (max-width: 900px) {
    .layout-container {
        grid-template-columns: 1fr;
    }
}
</style>
