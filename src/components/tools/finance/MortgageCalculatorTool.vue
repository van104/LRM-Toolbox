<template>
    <div class="mortgage-tool">
        <nav class="nav-bar">
            <button @click="$router.back()" class="nav-back">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>房贷计算器 (专业版)</h1>
                <span class="nav-subtitle">Professional Mortgage Calculator</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="layout-container">
                
                <section class="input-panel glass-card">
                    <el-tabs v-model="loanType" class="loan-type-tabs">
                        <el-tab-pane label="商业贷款" name="commercial"></el-tab-pane>
                        <el-tab-pane label="公积金贷款" name="fund"></el-tab-pane>
                        <el-tab-pane label="组合贷款" name="combination"></el-tab-pane>
                    </el-tabs>

                    <div class="form-grid">
                        
                        <div class="form-group" v-if="loanType !== 'fund'">
                            <label>商贷金额 (万元)</label>
                            <el-input-number v-model="commercialAmt" :min="0" :precision="2" class="w-full"
                                placeholder="输入商贷金额" />
                        </div>
                        <div class="form-group" v-if="loanType !== 'commercial'">
                            <label>公积金金额 (万元)</label>
                            <el-input-number v-model="fundAmt" :min="0" :precision="2" class="w-full"
                                placeholder="输入公积金金额" />
                        </div>

                        
                        <div class="form-group">
                            <label>按揭年限</label>
                            <el-select v-model="years" class="w-full">
                                <el-option v-for="y in 30" :key="y" :label="`${y}年 (${y * 12}期)`" :value="y" />
                            </el-select>
                        </div>

                        
                        <div class="rate-config-section">
                            <div class="form-group" v-if="loanType !== 'fund'">
                                <div class="label-with-tip">
                                    <label>商贷利率 (%)</label>
                                    <el-popover placement="top" :width="240" trigger="hover"
                                        content="最新LPR参考：5年期以上通常为3.6%~3.95%左右，各城市BP浮动不同。">
                                        <template #reference>
                                            <el-icon class="info-icon">
                                                <QuestionFilled />
                                            </el-icon>
                                        </template>
                                    </el-popover>
                                </div>
                                <div class="lpr-input-group">
                                    <el-input-number v-model="commercialRate" :step="0.01" :precision="2"
                                        class="rate-input" />
                                    <div class="lpr-helper">
                                        <span class="label">LPR</span>
                                        <el-input-number v-model="lprBase" :step="0.05" :precision="2" size="small" />
                                        <span class="label">+</span>
                                        <el-input-number v-model="bp" :step="1" size="small" />
                                        <span class="label">BP</span>
                                        <el-button size="small" type="primary" link @click="applyLpr">应用</el-button>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group" v-if="loanType !== 'commercial'">
                                <label>公积金利率 (%)</label>
                                <el-input-number v-model="fundRate" :step="0.01" :precision="2" class="w-full" />
                                <div class="rate-presets">
                                    <span @click="fundRate = 2.85">首套 2.85%</span>
                                    <span @click="fundRate = 3.325">二套 3.325%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <el-button type="primary" class="calc-btn" @click="calculateAll" size="large">开始计算对比</el-button>
                </section>

                
                <div class="results-area" v-if="hasResult">
                    
                    <div class="comparison-cards">
                        <div class="comp-card" :class="{ active: activeMode === 'benxi' }"
                            @click="activeMode = 'benxi'">
                            <div class="card-title">等额本息</div>
                            <div class="card-desc">每月还款金额固定</div>
                            <div class="main-val">¥ {{ formatMoney(results.benxi.monthlyPayment) }}</div>
                            <div class="sub-val">总利息: {{ formatMoney(results.benxi.totalInterest / 10000) }} 万</div>
                        </div>
                        <div class="comp-card" :class="{ active: activeMode === 'benjin' }"
                            @click="activeMode = 'benjin'">
                            <div class="card-title">等额本金</div>
                            <div class="card-desc">还款逐月递减</div>
                            <div class="main-val">首月 ¥ {{ formatMoney(results.benjin.firstMonth) }}</div>
                            <div class="sub-val">总利息: {{ formatMoney(results.benjin.totalInterest / 10000) }} 万</div>
                        </div>
                    </div>

                    
                    <section class="detail-results glass-card">
                        <div class="stat-grid">
                            <div class="stat-item highlight">
                                <div class="label">还款总额</div>
                                <div class="value">¥ {{ formatMoney(currentResult.totalPayment / 10000) }}
                                    <small>万</small></div>
                            </div>
                            <div class="stat-item">
                                <div class="label">累计利息</div>
                                <div class="value color-orange">¥ {{ formatMoney(currentResult.totalInterest / 10000) }}
                                    <small>万</small>
                                </div>
                            </div>
                            <div class="stat-item">
                                <div class="label">{{ activeMode === 'benxi' ? '每月还款' : '末月还款' }}</div>
                                <div class="value">¥ {{ formatMoney(activeMode === 'benxi' ?
                                    currentResult.monthlyPayment :
                                    currentResult.lastMonth) }}</div>
                            </div>
                        </div>

                        
                        <div class="ratio-chart">
                            <div class="track">
                                <div class="fill principal" :style="{ width: ratio.principal + '%' }"></div>
                                <div class="fill interest" :style="{ width: ratio.interest + '%' }"></div>
                            </div>
                            <div class="legend">
                                <span><i class="dot principal"></i> 本金 {{ ratio.principal }}%</span>
                                <span><i class="dot interest"></i> 利息 {{ ratio.interest }}%</span>
                            </div>
                        </div>

                        
                        <div class="schedule-section">
                            <div class="section-title">还款计划明细</div>
                            <el-table :data="currentResult.schedule" height="300" border stripe>
                                <el-table-column prop="index" label="期数" width="80" align="center" />
                                <el-table-column label="月供金额 (元)" min-width="120">
                                    <template #default="{ row }">¥ {{ formatMoney(row.payment) }}</template>
                                </el-table-column>
                                <el-table-column label="本金" width="100">
                                    <template #default="{ row }">¥ {{ formatMoney(row.principal) }}</template>
                                </el-table-column>
                                <el-table-column label="利息" width="100">
                                    <template #default="{ row }">¥ {{ formatMoney(row.interest) }}</template>
                                </el-table-column>
                                <el-table-column label="剩余本金" min-width="130">
                                    <template #default="{ row }">¥ {{ formatMoney(row.balance) }}</template>
                                </el-table-column>
                            </el-table>
                        </div>
                    </section>
                </div>

                
                <div v-else class="empty-placeholder glass-card">
                    <el-icon>
                        <DataAnalysis />
                    </el-icon>
                    <p>请输入贷款金额并点击计算，我们将为您生成专业的还款方案对比</p>
                </div>
            </div>
        </main>

        <section class="mortgage-tips glass-card">
            <h4><el-icon>
                    <Opportunity />
                </el-icon> 房贷小贴士</h4>
            <div class="tips-grid">
                <div class="tip-item">
                    <h5>等额本息 vs 等额本金</h5>
                    <p>等额本息：每月还款额固定，前期利息多本金少，适合收入平稳的人群。总利息支出较多。</p>
                    <p>等额本金：每月还款本金固定，利息随剩余本金递减，前期压力大，后期减负，适合前期资金充裕的人群。总利息支出较少。</p>
                </div>
                <div class="tip-item">
                    <h5>什么是 LPR？</h5>
                    <p>贷款市场报价利率 (LPR) 是商贷利率的基准。目前房贷利率一般采用 "LPR + BP" 的形式计算，BP 是加点数（1BP = 0.01%）。</p>
                </div>
            </div>
        </section>

        <footer class="footer">
            © 2026 LRM工具箱 - 专业金融计算
        </footer>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Back, QuestionFilled, DataAnalysis, Opportunity } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'


const loanType = ref('commercial')
const commercialAmt = ref(100)
const fundAmt = ref(50)
const years = ref(30)
const commercialRate = ref(3.85)
const fundRate = ref(2.85)
const lprBase = ref(3.60)
const bp = ref(25)
const activeMode = ref('benxi')
const hasResult = ref(false)

const results = reactive({
    benxi: null,
    benjin: null
})


const applyLpr = () => {
    commercialRate.value = lprBase.value + (bp.value / 100)
    ElMessage.success(`已更新利率为: ${commercialRate.value}%`)
}

const formatMoney = (val) => {
    return val.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const calculateAll = () => {
    if ((loanType.value !== 'fund' && !commercialAmt.value) || (loanType.value !== 'commercial' && !fundAmt.value)) {
        ElMessage.warning('请输入有效的贷款金额')
        return
    }

    const cAmt = loanType.value === 'fund' ? 0 : commercialAmt.value * 10000
    const fAmt = loanType.value === 'commercial' ? 0 : fundAmt.value * 10000
    const totalPrincipal = cAmt + fAmt
    const months = years.value * 12
    const cMonthlyRate = (commercialRate.value / 100) / 12
    const fMonthlyRate = (fundRate.value / 100) / 12

    
    results.benxi = calcBenxi(cAmt, cMonthlyRate, fAmt, fMonthlyRate, months)

    
    results.benjin = calcBenjin(cAmt, cMonthlyRate, fAmt, fMonthlyRate, months)

    hasResult.value = true
}


function calcBenxi(cAmt, cRate, fAmt, fRate, months) {
    const calc = (p, r, m) => {
        if (p === 0) return { monthly: 0, totalP: 0, totalI: 0, sch: [] }
        const x = Math.pow(1 + r, m)
        const monthly = (p * r * x) / (x - 1)
        const totalP = monthly * m
        const totalI = totalP - p
        return { monthly, totalP, totalI }
    }

    const cRes = calc(cAmt, cRate, months)
    const fRes = calc(fAmt, fRate, months)

    const totalMonthly = cRes.monthly + fRes.monthly
    const totalInterest = cRes.totalI + fRes.totalI
    const totalPayment = cAmt + fAmt + totalInterest

    
    const schedule = []
    let cBalance = cAmt
    let fBalance = fAmt
    for (let i = 1; i <= months; i++) {
        const ci = cBalance * cRate
        const cp = cAmt === 0 ? 0 : cRes.monthly - ci
        cBalance -= cp

        const fi = fBalance * fRate
        const fp = fAmt === 0 ? 0 : fRes.monthly - fi
        fBalance -= fp

        schedule.push({
            index: i,
            payment: (cAmt === 0 ? 0 : cRes.monthly) + (fAmt === 0 ? 0 : fRes.monthly),
            principal: cp + fp,
            interest: ci + fi,
            balance: Math.max(0, cBalance + fBalance)
        })
    }

    return {
        monthlyPayment: totalMonthly,
        totalInterest,
        totalPayment,
        schedule
    }
}


function calcBenjin(cAmt, cRate, fAmt, fRate, months) {
    const schedule = []
    let totalInterest = 0
    let cBalance = cAmt
    let fBalance = fAmt
    const cMp = cAmt / months
    const fMp = fAmt / months

    for (let i = 1; i <= months; i++) {
        const ci = cBalance * cRate
        const fi = fBalance * fRate
        const currentPayment = cMp + ci + fMp + fi
        totalInterest += ci + fi
        cBalance -= cMp
        fBalance -= fMp

        schedule.push({
            index: i,
            payment: currentPayment,
            principal: cMp + fMp,
            interest: ci + fi,
            balance: Math.max(0, cBalance + fBalance)
        })
    }

    return {
        firstMonth: schedule[0].payment,
        lastMonth: schedule[months - 1].payment,
        totalInterest,
        totalPayment: cAmt + fAmt + totalInterest,
        schedule
    }
}

const currentResult = computed(() => {
    return activeMode.value === 'benxi' ? results.benxi : results.benjin
})

const ratio = computed(() => {
    if (!currentResult.value) return { principal: 0, interest: 0 }
    const total = currentResult.value.totalPayment
    const p = (loanType.value === 'fund' ? fundAmt.value :
        loanType.value === 'commercial' ? commercialAmt.value :
            (commercialAmt.value + fundAmt.value)) * 10000
    const pPercent = ((p / total) * 100).toFixed(1)
    return {
        principal: pPercent,
        interest: (100 - pPercent).toFixed(1)
    }
})

onMounted(() => {
    
    calculateAll()
})

</script>

<style scoped>
.mortgage-tool {
    --primary: #4f46e5;
    --primary-light: #eef2ff;
    --orange: #f59e0b;
    --text-main: #1e293b;
    --text-sub: #64748b;
    --white: #ffffff;
    --bg-light: #f8fafc;
    --border: #e2e8f0;

    min-height: 100vh;
    background: var(--bg-light);
    color: var(--text-main);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
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
    color: var(--text-sub);
    cursor: pointer;
    font-size: 0.95rem;
    padding: 0.5rem;
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
    color: var(--text-sub);
    text-transform: uppercase;
    letter-spacing: 1px;
}

.main-content {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
}

.layout-container {
    display: grid;
    grid-template-columns: 400px 1fr;
    gap: 1.5rem;
}

.glass-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.form-grid {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    margin-top: 1.5rem;
}

.form-group label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-sub);
    margin-bottom: 0.5rem;
}

.w-full {
    width: 100%;
}

.label-with-tip {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 0.5rem;
}

.info-icon {
    font-size: 14px;
    color: var(--primary);
    cursor: help;
}

.lpr-input-group {
    border: 1px solid var(--border);
    padding: 10px;
    border-radius: 8px;
    background: var(--bg-light);
}

.lpr-helper {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
    font-size: 0.75rem;
    color: var(--text-sub);
    flex-wrap: wrap;
}

.rate-presets {
    display: flex;
    gap: 12px;
    margin-top: 6px;
    font-size: 0.75rem;
    color: var(--primary);
    cursor: pointer;
}

.calc-btn {
    width: 100%;
    margin-top: 2rem;
}


.comparison-cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.comp-card {
    padding: 1.25rem;
    background: var(--white);
    border: 2px solid var(--border);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
}

.comp-card.active {
    border-color: var(--primary);
    background: var(--primary-light);
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

.card-title {
    font-weight: 700;
    font-size: 1.1rem;
}

.card-desc {
    font-size: 0.75rem;
    color: var(--text-sub);
    margin-bottom: 0.75rem;
}

.main-val {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--primary);
}

.sub-val {
    font-size: 0.8rem;
    margin-top: 0.5rem;
}

.stat-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
    text-align: center;
}

.stat-item .label {
    font-size: 0.8rem;
    color: var(--text-sub);
    margin-bottom: 4px;
}

.stat-item .value {
    font-size: 1.25rem;
    font-weight: 700;
}

.color-orange {
    color: var(--orange);
}

.ratio-chart {
    margin-bottom: 2rem;
}

.track {
    height: 10px;
    background: #f1f5f9;
    border-radius: 5px;
    overflow: hidden;
    display: flex;
}

.fill.principal {
    background: var(--primary);
}

.fill.interest {
    background: var(--orange);
}

.legend {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin-top: 10px;
    font-size: 0.75rem;
}

.dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
}

.section-title {
    font-weight: 600;
    margin-bottom: 1rem;
    padding-left: 8px;
    border-left: 4px solid var(--primary);
}

.empty-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #cbd5e1;
    min-height: 400px;
}

.empty-placeholder .el-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.mortgage-tips {
    max-width: 1100px;
    margin: 1.5rem auto;
}

.tips-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-top: 1rem;
}

.tip-item h5 {
    margin: 0 0 0.5rem;
    color: var(--primary);
}

.tip-item p {
    font-size: 0.85rem;
    line-height: 1.6;
    color: var(--text-sub);
}

.footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-sub);
    font-size: 0.85rem;
}

@media (max-width: 900px) {
    .layout-container {
        grid-template-columns: 1fr;
    }
}
</style>
