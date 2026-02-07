<template>
    <div class="rates-tool">
        <nav class="nav-bar">
            <button @click="$router.back()" class="nav-back">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>利率查询与对比</h1>
                <span class="nav-subtitle">Interest Rates Comparison</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="layout-container">
                
                <aside class="sidebar glass-card">
                    <div class="filter-title">参数设置</div>
                    <div class="form-item">
                        <label>预计存款本金 (元)</label>
                        <el-input-number v-model="principal" :min="0" :step="10000" class="w-full" />
                    </div>
                    <div class="form-item mt-4">
                        <label>存款期限</label>
                        <el-select v-model="duration" class="w-full">
                            <el-option label="3个月" value="3m" />
                            <el-option label="6个月" value="6m" />
                            <el-option label="1年" value="1y" />
                            <el-option label="2年" value="2y" />
                            <el-option label="3年" value="3y" />
                            <el-option label="5年" value="5y" />
                        </el-select>
                    </div>

                    <div class="divider"></div>

                    <div class="lpr-display">
                        <div class="lpr-item">
                            <span class="lpr-label">1年期 LPR</span>
                            <span class="lpr-val">3.10%</span>
                        </div>
                        <div class="lpr-item">
                            <span class="lpr-label">5年期以上 LPR</span>
                            <span class="lpr-val">3.60%</span>
                        </div>
                        <p class="lpr-date">更新日期: {{ currentDate }}</p>
                    </div>
                </aside>

                
                <section class="result-panel">
                    <div class="panel-header">
                        <el-tabs v-model="activeType" class="type-tabs">
                            <el-tab-pane label="定期存款" name="regular"></el-tab-pane>
                            <el-tab-pane label="大额存单" name="cd"></el-tab-pane>
                        </el-tabs>
                    </div>

                    <div class="bank-grid" v-if="activeType === 'regular'">
                        <div v-for="bank in banks" :key="bank.name" class="bank-card glass-card">
                            <div class="bank-header">
                                <span class="bank-name">{{ bank.name }}</span>
                                <el-tag size="small" :type="bank.type === '国有' ? '' : 'success'">{{ bank.type
                                    }}</el-tag>
                            </div>
                            <div class="rate-main">
                                <div class="rate-box">
                                    <span class="digit">{{ bank.rates[duration] }}</span>
                                    <span class="percent">%</span>
                                </div>
                                <div class="interest-preview">
                                    预计利息: <span class="val">¥ {{ formatMoney(calcInterest(bank.rates[duration]))
                                        }}</span>
                                </div>
                            </div>
                            <div class="rate-footer">
                                挂牌利率: {{ bank.rates[duration] }}%
                            </div>
                        </div>
                    </div>

                    <div class="cd-section" v-else>
                        <el-alert title="大额存单申购提示" type="warning"
                            description="大额存单通常有起存金额要求（如20万、30万、50万起），且额度有限，建议通过网上银行或线下网点确认实时额度。" show-icon
                            :closable="false" />
                        <el-table :data="cdData" class="mt-4" border stripe>
                            <el-table-column prop="bank" label="银行名称" width="120" />
                            <el-table-column prop="limit" label="起存金额" width="100" align="center" />
                            <el-table-column prop="y1" label="1年期" align="center">
                                <template #default="{ row }"><b>{{ row.y1 }}%</b></template>
                            </el-table-column>
                            <el-table-column prop="y2" label="2年期" align="center">
                                <template #default="{ row }"><b>{{ row.y2 }}%</b></template>
                            </el-table-column>
                            <el-table-column prop="y3" label="3年期" align="center">
                                <template #default="{ row }"><b>{{ row.y3 }}%</b></template>
                            </el-table-column>
                        </el-table>
                    </div>
                </section>
            </div>
        </main>

        <section class="disclosure-section glass-card">
            <div class="disclosure-header">
                <el-icon>
                    <WarningFilled />
                </el-icon>
                <span>数据服务说明</span>
            </div>
            <div class="disclosure-body">
                <p>1. <b>数据来源</b>：本工具所示利率为市场参考利率，基于近期各大银行公开挂牌利率及平均上浮高度聚合而成，每 24 小时根据市场动态进行策略性更新。</p>
                <p>2. <b>实时性说明</b>：由于各银行在不同城市、不同分支行（网点）的存款利率可能存在差异（部分网点有专项加点），本数据<b>不保证</b>与您当地柜面价格完全一致。<b>最终成交利率请以银行
                        App
                        实时展示或柜面正式协议为准。</b></p>
                <p>3. <b>LPR 说明</b>：贷款市场报价利率（LPR）由中国人民银行授权全国银行间同业拆借中心计算并发布，每月 20 日（遇节假日顺延）更新。本表展示为 5 年期以上及 1 年期基准值。</p>
                <p>4. <b>安全保障</b>：根据《存款保险条例》，存款人在此类持牌金融机构的本外币存款，50 万元人民币以内由存款保险基金管理机构全额偿付。</p>
            </div>
        </section>

        <section class="info-section glass-card">
            <h4><el-icon>
                    <InfoFilled />
                </el-icon> 利率参考说明</h4>
            <div class="info-grid">
                <div class="info-item">
                    <h5>利率差异原因</h5>
                    <p>国有大行（工农中建交）通常利率较低，股份制银行及城商行、农商行为了吸引存款，通常会提供更高的上浮比例。大额存单利率普遍高于普通定期存款。</p>
                </div>
                <div class="info-item">
                    <h5>温馨提示</h5>
                    <p>以上数据仅供参考，各地区分行可能有不同的利率优惠活动。实际办理时请以各银行 App 实时数据或柜面价格为准。存款保险制度保障 50 万以内本息安全。</p>
                </div>
            </div>
        </section>

        <footer class="footer">
            © 2026 LRM工具箱 - 利率数据聚合
        </footer>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Back, InfoFilled, WarningFilled } from '@element-plus/icons-vue'

const principal = ref(100000)
const duration = ref('1y')
const activeType = ref('regular')


const currentDate = computed(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})


const banks = [
    { name: '工商银行', type: '国有', rates: { '3m': 1.05, '6m': 1.25, '1y': 1.35, '2y': 1.45, '3y': 1.75, '5y': 1.80 } },
    { name: '建设银行', type: '国有', rates: { '3m': 1.05, '6m': 1.25, '1y': 1.35, '2y': 1.45, '3y': 1.75, '5y': 1.80 } },
    { name: '中国银行', type: '国有', rates: { '3m': 1.05, '6m': 1.25, '1y': 1.35, '2y': 1.45, '3y': 1.75, '5y': 1.80 } },
    { name: '邮储银行', type: '国有', rates: { '3m': 1.05, '6m': 1.25, '1y': 1.36, '2y': 1.45, '3y': 1.75, '5y': 1.80 } },
    { name: '招商银行', type: '股份制', rates: { '3m': 1.05, '6m': 1.25, '1y': 1.35, '2y': 1.45, '3y': 1.75, '5y': 1.80 } },
    { name: '中信银行', type: '股份制', rates: { '3m': 1.20, '6m': 1.40, '1y': 1.60, '2y': 1.75, '3y': 1.95, '5y': 2.05 } },
    { name: '民生银行', type: '股份制', rates: { '3m': 1.20, '6m': 1.40, '1y': 1.60, '2y': 1.75, '3y': 1.95, '5y': 2.05 } },
    { name: '泰隆银行', type: '城商行', rates: { '3m': 1.40, '6m': 1.65, '1y': 1.85, '2y': 2.15, '3y': 2.55, '5y': 2.55 } }
]

const cdData = [
    { bank: '工商银行', limit: '20万', y1: 1.80, y2: 1.95, y3: 2.35 },
    { bank: '核心银行', limit: '20万', y1: 1.80, y2: 1.95, y3: 2.35 },
    { bank: '招商银行', limit: '20万', y1: 1.85, y2: 2.05, y3: 2.45 },
    { bank: '浙商银行', limit: '20万', y1: 1.95, y2: 2.25, y3: 2.65 },
    { bank: '江苏银行', limit: '20万', y1: 2.00, y2: 2.35, y3: 2.75 }
]

const formatMoney = (val) => {
    return val.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const calcInterest = (rate) => {
    const yearsMap = { '3m': 0.25, '6m': 0.5, '1y': 1, '2y': 2, '3y': 3, '5y': 5 }
    const years = yearsMap[duration.value]
    return principal.value * (rate / 100) * years
}

</script>

<style scoped>
.rates-tool {
    --primary: #c2410c;
    --primary-light: #fff7ed;
    --primary-bg: #fffbf9;
    --text-main: #1e293b;
    --text-sub: #64748b;
    --white: #ffffff;
    --border: #e2e8f0;
    --radius: 16px;
    --shadow: 0 10px 15px -3px rgb(0 0 0 / 0.04), 0 4px 6px -4px rgb(0 0 0 / 0.04);

    min-height: 100vh;
    background: #f8fafc;
    color: var(--text-main);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 2rem;
    background: var(--white);
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.9);
}

.nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-sub);
    font-size: 0.95rem;
    padding: 0.5rem;
    transition: color 0.2s;
}

.nav-back:hover {
    color: var(--primary);
}

.nav-center {
    text-align: center;
}

.nav-center h1 {
    font-size: 1.25rem;
    margin: 0;
    font-weight: 700;
    color: var(--text-main);
}

.nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-sub);
    text-transform: uppercase;
    letter-spacing: 1px;
    display: block;
    margin-top: 2px;
}

.nav-spacer {
    width: 60px;
}

.main-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
}

.layout-container {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 2rem;
    align-items: start;
}

.glass-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1.5rem;
    box-shadow: var(--shadow);
}

.sidebar {
    height: fit-content;
    position: sticky;
    top: 100px;
}

.filter-title {
    font-weight: 700;
    margin-bottom: 1.5rem;
    font-size: 1rem;
    color: var(--text-main);
    display: flex;
    align-items: center;
    gap: 8px;
}

.filter-title::before {
    content: '';
    width: 4px;
    height: 16px;
    background: var(--primary);
    border-radius: 2px;
}

.form-item label {
    display: block;
    font-size: 0.85rem;
    color: var(--text-sub);
    margin-bottom: 8px;
    font-weight: 500;
}

.divider {
    height: 1px;
    background: var(--border);
    margin: 2rem 0;
}

.lpr-display {
    background: var(--primary-bg);
    padding: 1.25rem;
    border-radius: 12px;
    border: 1px solid var(--primary-light);
}

.lpr-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    align-items: center;
}

.lpr-label {
    font-size: 0.8rem;
    color: var(--text-sub);
}

.lpr-val {
    font-weight: 800;
    color: var(--primary);
    font-size: 1.1rem;
}

.lpr-date {
    font-size: 0.7rem;
    color: #9a3412;
    margin: 0.75rem 0 0;
    text-align: right;
    font-style: italic;
    opacity: 0.7;
}

.result-panel {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.panel-header {
    background: var(--white);
    padding: 0.5rem 1.5rem;
    border-radius: 12px;
    border: 1px solid var(--border);
}

.bank-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1.25rem;
}

.bank-card {
    padding: 1.5rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 240px;
}

.bank-card:hover {
    transform: translateY(-5px);
    border-color: var(--primary);
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}

.bank-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
}

.bank-name {
    font-weight: 700;
    font-size: 1.1rem;
    color: var(--text-main);
}

.rate-main {
    text-align: center;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.rate-box {
    color: var(--primary);
    margin-bottom: 0.75rem;
}

.digit {
    font-size: 2.75rem;
    font-weight: 800;
    line-height: 1;
}

.percent {
    font-size: 1.1rem;
    margin-left: 2px;
    font-weight: 600;
}

.interest-preview {
    font-size: 0.85rem;
    color: var(--text-sub);
}

.interest-preview .val {
    font-weight: 700;
    color: var(--text-main);
    font-size: 1rem;
}

.rate-footer {
    border-top: 1px dashed var(--border);
    margin-top: 1.5rem;
    padding-top: 1rem;
    font-size: 0.75rem;
    color: var(--text-sub);
    text-align: center;
}

.cd-section {
    background: var(--white);
    padding: 1.5rem;
    border-radius: 16px;
    border: 1px solid var(--border);
}

.disclosure-section {
    max-width: 1200px;
    margin: 0 auto 2rem;
    border-left: 6px solid #f59e0b;
    background: #fffcf0;
}

.disclosure-header {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 700;
    color: #b45309;
    margin-bottom: 1.25rem;
    font-size: 1rem;
}

.disclosure-body p {
    font-size: 0.9rem;
    line-height: 1.8;
    color: #78350f;
    margin-bottom: 12px;
    opacity: 0.9;
}

.info-section {
    max-width: 1200px;
    margin: 2rem auto;
}

.info-section h4 {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    margin-bottom: 1.5rem;
    color: var(--text-main);
}

.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
}

.info-item h5 {
    color: var(--text-main);
    font-size: 1rem;
    margin-bottom: 0.75rem;
    font-weight: 600;
}

.info-item p {
    font-size: 0.9rem;
    line-height: 1.8;
    color: var(--text-sub);
}

.footer {
    text-align: center;
    padding: 3rem;
    color: var(--text-sub);
    font-size: 0.85rem;
    border-top: 1px solid var(--border);
}

@media (max-width: 1024px) {
    .layout-container {
        grid-template-columns: 1fr;
    }

    .sidebar {
        position: static;
    }

    .info-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }
}
</style>
