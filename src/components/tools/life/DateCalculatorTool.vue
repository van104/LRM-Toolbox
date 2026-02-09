<template>
    <div class="date-calculator-tool">
        <nav class="nav-bar">
            <button class="nav-back" @click="$router.back()">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>日期差计算器</h1>
                <span class="nav-subtitle">Date Difference</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            
            <div class="mode-tabs glass-card">
                <button :class="['mode-btn', { active: mode === 'diff' }]" @click="mode = 'diff'">
                    <el-icon>
                        <Calendar />
                    </el-icon> 计算日期间隔
                </button>
                <button :class="['mode-btn', { active: mode === 'add' }]" @click="mode = 'add'">
                    <el-icon>
                        <Timer />
                    </el-icon> 推算日期
                </button>
            </div>

            
            <section v-if="mode === 'diff'" class="calculator-card glass-card">
                <div class="date-inputs">
                    <div class="input-group">
                        <label>开始日期</label>
                        <el-date-picker
v-model="startDate" type="date" placeholder="选择开始日期" :clearable="false"
                            class="full-width" />
                    </div>
                    <div class="separator">至</div>
                    <div class="input-group">
                        <label>结束日期</label>
                        <el-date-picker
v-model="endDate" type="date" placeholder="选择结束日期" :clearable="false"
                            class="full-width" />
                        <button class="today-btn" @click="setToday('end')">今天</button>
                    </div>
                </div>

                <div v-if="diffResult" class="result-display">
                    <div class="primary-result">
                        <span class="label">相隔天数</span>
                        <span class="value">{{ diffResult.days }}</span>
                        <span class="unit">天</span>
                    </div>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="d-label">周数</span>
                            <span class="d-value">{{ diffResult.weeks }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="d-label">月数 (各约)</span>
                            <span class="d-value">{{ diffResult.months }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="d-label">年数 (各约)</span>
                            <span class="d-value">{{ diffResult.years }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="d-label">工作日 (估算)</span>
                            <span class="d-value">{{ diffResult.workdays }}</span>
                        </div>
                    </div>
                </div>
            </section>

            
            <section v-else class="calculator-card glass-card">
                <div class="date-inputs">
                    <div class="input-group">
                        <label>基准日期</label>
                        <el-date-picker
v-model="baseDate" type="date" placeholder="选择基准日期" :clearable="false"
                            class="full-width" />
                    </div>
                    <div class="operation-group">
                        <div class="op-input">
                            <select v-model="calcOperator">
                                <option value="+">往后 (+)</option>
                                <option value="-">往前 (-)</option>
                            </select>
                            <input v-model.number="calcValue" type="number" min="0" placeholder="数值" />
                            <select v-model="calcUnit">
                                <option value="days">天</option>
                                <option value="weeks">周</option>
                                <option value="months">月</option>
                                <option value="years">年</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div v-if="calcResult" class="result-display">
                    <div class="primary-result">
                        <span class="label">推算结果</span>
                        <span class="value date-val">{{ formatDate(calcResult) }}</span>
                    </div>
                    <div class="weekday-display">
                        {{ getWeekday(calcResult) }}
                    </div>
                </div>
            </section>

            
            <section class="scenarios-section glass-card">
                <h3>常用场景快捷计算</h3>
                <div class="scenario-grid">
                    <div class="scenario-item" @click="setScenario('anniversary')">
                        <div class="icon">🎂</div>
                        <div class="info">
                            <h4>下一个生日</h4>
                            <p>距离今天还有多久？</p>
                        </div>
                    </div>
                    <div class="scenario-item" @click="setScenario('work')">
                        <div class="icon">💼</div>
                        <div class="info">
                            <h4>工龄计算</h4>
                            <p>入职至今的天数</p>
                        </div>
                    </div>
                    <div class="scenario-item" @click="setScenario('countdown')">
                        <div class="icon">🎆</div>
                        <div class="info">
                            <h4>新年倒计时</h4>
                            <p>距离明年元旦</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - 日期差计算器
        </footer>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Back, Calendar, Timer } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const mode = ref('diff') 


const startDate = ref(new Date())
const endDate = ref(new Date())

const diffResult = computed(() => {
    if (!startDate.value || !endDate.value) return null

    const start = dayjs(startDate.value).startOf('day')
    const end = dayjs(endDate.value).startOf('day')
    const diffDays = Math.abs(end.diff(start, 'day'))

    
    
    const weeksFull = Math.floor(diffDays / 7)
    let workdays = weeksFull * 5
    const remainder = diffDays % 7
    
    
    
    workdays += Math.min(remainder, 5)

    return {
        days: diffDays,
        weeks: (diffDays / 7).toFixed(1),
        months: (diffDays / 30.44).toFixed(1),
        years: (diffDays / 365.25).toFixed(2),
        workdays: workdays 
    }
})

const setToday = (target) => {
    if (target === 'start') startDate.value = new Date()
    else endDate.value = new Date()
}


const baseDate = ref(new Date())
const calcOperator = ref('+')
const calcValue = ref(100)
const calcUnit = ref('days')

const calcResult = computed(() => {
    if (!baseDate.value || calcValue.value === '') return null
    const base = dayjs(baseDate.value)
    const val = parseInt(calcValue.value) || 0

    if (calcOperator.value === '+') {
        return base.add(val, calcUnit.value).toDate()
    } else {
        return base.subtract(val, calcUnit.value).toDate()
    }
})

const formatDate = (date) => dayjs(date).format('YYYY年MM月DD日')
const getWeekday = (date) => {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return days[date.getDay()]
}


const setScenario = (type) => {
    mode.value = 'diff'
    const now = new Date()

    if (type === 'anniversary') {
        
        
        
        
        startDate.value = now
        
        
        
        const nextYear = now.getFullYear() + 1
        endDate.value = new Date(`${nextYear}-01-01`)
    } else if (type === 'work') {
        
        endDate.value = now
        
        const lastYear = new Date()
        lastYear.setFullYear(now.getFullYear() - 1)
        startDate.value = lastYear
    } else if (type === 'countdown') {
        startDate.value = now
        const nextNewYear = new Date(now.getFullYear() + 1, 0, 1) 
        endDate.value = nextNewYear
    }
}

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

.date-calculator-tool {
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
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 0.9rem;
    padding: 0.5rem 0;
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
    display: block;
    text-align: center;
}

.main-content {
    max-width: 700px;
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


.mode-tabs {
    display: flex;
    gap: 1rem;
    padding: 0.5rem;
}

.mode-btn {
    flex: 1;
    border: none;
    background: transparent;
    padding: 0.75rem;
    border-radius: 10px;
    font-size: 1rem;
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s;
}

.mode-btn.active {
    background: var(--accent-light);
    color: var(--accent);
    font-weight: 600;
}


.date-inputs {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.input-group label {
    display: block;
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
}

.separator {
    text-align: center;
    color: var(--text-secondary);
    position: relative;
    font-size: 0.9rem;
}

.separator::before,
.separator::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 45%;
    height: 1px;
    background: var(--border);
}

.separator::before {
    left: 0;
}

.separator::after {
    right: 0;
}

.full-width {
    width: 100% !important;
}

.today-btn {
    position: absolute;
    right: 0;
    top: 0;
    font-size: 0.8rem;
    color: var(--accent);
    background: none;
    border: none;
    cursor: pointer;
}

.input-group {
    position: relative;
}


.op-input {
    display: flex;
    gap: 0.5rem;
}

.op-input select,
.op-input input {
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--bg);
    outline: none;
}

.op-input input {
    flex: 1;
}


.result-display {
    background: var(--accent-light);
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
}

.primary-result .label {
    display: block;
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
}

.primary-result .value {
    font-size: 3rem;
    font-weight: 700;
    color: var(--accent);
    line-height: 1;
}

.primary-result .date-val {
    font-size: 2rem;
}

.primary-result .unit {
    margin-left: 0.25rem;
    font-size: 1rem;
    color: var(--text-secondary);
}

.detail-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.d-label {
    font-size: 0.8rem;
    color: var(--text-secondary);
}

.d-value {
    font-size: 1.1rem;
    font-weight: 600;
}

.weekday-display {
    margin-top: 0.5rem;
    color: var(--text-secondary);
}


.scenario-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
}

.scenario-item {
    background: var(--bg);
    border-radius: 12px;
    padding: 1rem;
    cursor: pointer;
    text-align: center;
    transition: all 0.2s;
    border: 1px solid transparent;
}

.scenario-item:hover {
    background: white;
    border-color: var(--border);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.scenario-item .icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
}

.scenario-item h4 {
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
}

.scenario-item p {
    font-size: 0.75rem;
    color: var(--text-secondary);
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
    .scenario-grid {
        grid-template-columns: 1fr;
    }
}
</style>
