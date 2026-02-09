<template>
    <div class="pregnancy-due-tool">
        <nav class="nav-bar">
            <button class="nav-back" @click="$router.back()">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>预产期计算器</h1>
                <span class="nav-subtitle">Pregnancy Due Guide</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="layout-grid">
                
                <aside class="side-panel glass-card">
                    <h3 class="panel-title">日期输入</h3>
                    <el-form label-position="top">
                        <el-form-item label="末次月经第一天">
                            <el-date-picker
v-model="lastPeriod" type="date" placeholder="选择日期" style="width: 100%"
                                :disabled-date="disableFutureDates" @change="calculate" />
                        </el-form-item>
                        <el-form-item label="平均月经周期 (天)">
                            <el-input-number
v-model="cycleDays" :min="21" :max="45" style="width: 100%"
                                @change="calculate" />
                        </el-form-item>
                    </el-form>

                    <div v-if="dueDate" class="result-summary">
                        <div class="result-item">
                            <p class="label">预计预产期</p>
                            <p class="value primary">{{ formattedDueDate }}</p>
                        </div>
                        <el-divider />
                        <div class="result-item">
                            <p class="label">当前怀孕进度</p>
                            <p class="value">{{ currentWeeks }}周 {{ currentDays }}天</p>
                        </div>
                        <div class="result-item">
                            <p class="label">距离预产期还有</p>
                            <p class="value">{{ daysToDue }} 天</p>
                        </div>
                    </div>
                </aside>

                
                <section v-if="dueDate" class="main-info glass-card">
                    <div class="week-header">
                        <h2 class="section-title">第 {{ currentWeeks }} 周：胎儿与妈妈的变化</h2>
                        <div class="trimester-badge" :class="'tri-' + trimester">第 {{ trimester }} 阶段 (Trimester)</div>
                    </div>

                    <div class="info-grid">
                        <div class="info-card baby">
                            <div class="card-icon">👶</div>
                            <h4>宝宝的变化</h4>
                            <p>{{ currentWeekData.baby }}</p>
                            <div v-if="currentWeekData.size" class="size-box">
                                <span>现在大约像：<strong>{{ currentWeekData.size }}</strong></span>
                            </div>
                        </div>
                        <div class="info-card mom">
                            <div class="card-icon">👩‍🍼</div>
                            <h4>妈妈的变化</h4>
                            <p>{{ currentWeekData.mom }}</p>
                        </div>
                        <div class="info-card checkup">
                            <div class="card-icon">🏥</div>
                            <h4>产检建议</h4>
                            <p>{{ currentWeekData.checkup }}</p>
                        </div>
                    </div>

                    <div class="milestones">
                        <h4>关键阶段预览</h4>
                        <el-steps :active="trimester - 1" finish-status="success" simple>
                            <el-step title="早期 (0-13周)" />
                            <el-step title="中期 (14-27周)" />
                            <el-step title="晚期 (28-40周)" />
                        </el-steps>
                    </div>
                </section>

                <section v-else class="empty-state glass-card">
                    <el-empty description="请输入末次月经日期开始计算" />
                </section>
            </div>
        </main>

        <div class="disclaimer-wrap" style="padding: 0 1.5rem 2rem; text-align: center;">
            <div
class="disclaimer-card"
                style="display: inline-flex; gap: 0.8rem; padding: 1rem; background: #fff5f7; color: #9d174d; border-radius: 12px; font-size: 0.8rem; align-items: start; text-align: left; border: 1px solid #fce7f3;">
                <el-icon style="margin-top: 2px;">
                    <InfoFilled />
                </el-icon>
                <span>预产期计算基于通用规律，实际分娩时间因人而异。此结果仅供参考，请以主管医生的产检评估为准。</span>
            </div>
        </div>

        <footer class="footer">
            © 2026 LRM工具箱 - 预产期计算器
        </footer>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Back, InfoFilled } from '@element-plus/icons-vue'

const router = useRouter()

const lastPeriod = ref(null)
const cycleDays = ref(28)
const dueDate = ref(null)
const currentWeeks = ref(0)
const currentDays = ref(0)
const daysToDue = ref(0)

const disableFutureDates = (time) => {
    return time.getTime() > Date.now()
}

const formattedDueDate = computed(() => {
    if (!dueDate.value) return ''
    return dueDate.value.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
})

const calculate = () => {
    if (!lastPeriod.value) return
    const start = new Date(lastPeriod.value)
    const adjustment = cycleDays.value - 28
    const due = new Date(start.getTime() + (280 + adjustment) * 24 * 60 * 60 * 1000)
    dueDate.value = due

    const now = new Date()
    const diff = now.getTime() - start.getTime()
    const totalDays = Math.floor(diff / (24 * 60 * 60 * 1000))
    currentWeeks.value = Math.floor(totalDays / 7)
    currentDays.value = totalDays % 7

    const diffToDue = due.getTime() - now.getTime()
    daysToDue.value = Math.max(0, Math.ceil(diffToDue / (24 * 60 * 60 * 1000)))
}

const trimester = computed(() => {
    if (currentWeeks.value < 14) return 1
    if (currentWeeks.value < 28) return 2
    return 3
})

const currentWeekData = computed(() => {
    const w = currentWeeks.value
    if (w <= 4) return { baby: '受精卵着床，神经系统开始发育。', size: '罂粟籽', mom: '可能会有早孕反应，疲劳、乳房胀痛。', checkup: '确认怀孕，咨询孕早期注意事项。' }
    if (w <= 12) return { baby: '器官开始成形，胎心搏动。', size: '酸橙', mom: '子宫增大，压迫膀胱导致尿频。', checkup: '11-13周：早唐筛查/NT检查。' }
    if (w <= 24) return { baby: '胎动活跃，能听到外界声音。', size: '大茄子', mom: '食欲好转，肤色变化，腹部明显。', checkup: '20-24周：大排畸超声检查。' }
    return { baby: '各个器官发育完善，练习呼吸。', size: '西瓜', mom: '负重感强，容易腰酸，手脚水肿。', checkup: '28周后每两周产检一次，36周后每周一次。' }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

.pregnancy-due-tool {
    --bg: #fffafb;
    --card: #ffffff;
    --border: #fce7f3;
    --text: #1e293b;
    --text-2: #64748b;
    --primary: #db2777;

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
    color: var(--text-2);
    cursor: pointer;
    font-size: 0.9rem;
}

.nav-center h1 {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
}

.nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-2);
    text-transform: uppercase;
    display: block;
    text-align: center;
}

.main-content {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
}

.layout-grid {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 2rem;
}

.glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.panel-title {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    color: #1e293b;
    font-weight: 600;
}

.result-summary {
    margin-top: 2rem;
    background: #fff5f7;
    border-radius: 16px;
    padding: 1.5rem;
}

.result-item {
    margin-bottom: 1rem;
}

.result-item .label {
    font-size: 0.8rem;
    color: #9d174d;
    margin-bottom: 0.25rem;
}

.result-item .value {
    font-size: 1.1rem;
    font-weight: 600;
}

.result-item .value.primary {
    color: var(--primary);
    font-size: 1.5rem;
}


.week-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #fdf2f8;
}

.section-title {
    font-size: 1.25rem;
    margin: 0;
    font-weight: 600;
}

.trimester-badge {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
}

.tri-1 {
    background: #fce7f3;
    color: #db2777;
}

.tri-2 {
    background: #dcfce7;
    color: #16a34a;
}

.tri-3 {
    background: #fef9c3;
    color: #ca8a04;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
}

.info-card {
    padding: 1.5rem;
    border-radius: 16px;
    border: 1px solid transparent;
}

.info-card.baby {
    background: #f0f9ff;
    border-color: #e0f2fe;
}

.info-card.mom {
    background: #fdf2f8;
    border-color: #fce7f3;
}

.info-card.checkup {
    background: #f0fdf4;
    border-color: #dcfce7;
}

.card-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
}

.info-card h4 {
    margin: 0 0 0.5rem;
    font-size: 1rem;
}

.info-card p {
    font-size: 0.875rem;
    color: #64748b;
    line-height: 1.6;
}

.size-box {
    margin-top: 1rem;
    padding: 0.75rem;
    background: #fff;
    border-radius: 8px;
    font-size: 0.875rem;
}

.size-box strong {
    color: var(--primary);
}

.milestones h4 {
    margin-bottom: 1.5rem;
}

.empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
}

.footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-2);
    font-size: 0.85rem;
    border-top: 1px solid var(--border);
    margin-top: 2rem;
}

@media (max-width: 850px) {
    .layout-grid {
        grid-template-columns: 1fr;
    }
}
</style>
