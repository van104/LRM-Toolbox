<template>
    <div class="lunar-converter-tool">
        <nav class="nav-bar">
            <button @click="$router.back()" class="nav-back">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>农历阳历转换</h1>
                <span class="nav-subtitle">Lunar Calendar</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            
            <div class="mode-switch glass-card">
                <button :class="['mode-btn', { active: mode === 'solarToLunar' }]" @click="mode = 'solarToLunar'">
                    <span class="icon">☀️</span> 公历 转 农历
                </button>
                <button :class="['mode-btn', { active: mode === 'lunarToSolar' }]" @click="mode = 'lunarToSolar'">
                    <span class="icon">🌙</span> 农历 转 公历
                </button>
            </div>

            
            <section class="input-section glass-card">
                
                <div v-if="mode === 'solarToLunar'" class="input-group">
                    <label>选择公历日期</label>
                    <el-date-picker v-model="solarInput" type="date" placeholder="选择日期" format="YYYY年MM月DD日"
                        :clearable="false" class="full-width" @change="handleSolarChange" />
                </div>

                
                <div v-else class="input-group lunar-inputs">
                    <div class="select-wrapper">
                        <select v-model="lunarYear" @change="handleLunarChange">
                            <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}年</option>
                        </select>
                    </div>
                    <div class="select-wrapper">
                        <select v-model="lunarMonth" @change="handleLunarChange">
                            <option v-for="m in 12" :key="m" :value="m">{{ m }}月</option>
                        </select>
                    </div>
                    <div class="select-wrapper">
                        <select v-model="lunarDay" @change="handleLunarChange">
                            <option v-for="d in 30" :key="d" :value="d">{{ getLunarDayName(d) }}</option>
                        </select>
                    </div>
                    
                    
                    <div class="checkbox-wrapper">
                        <label>
                            <input type="checkbox" v-model="isLeapMonth" @change="handleLunarChange"> 闰月
                        </label>
                    </div>
                </div>
            </section>

            
            <section class="result-section glass-card" v-if="lunarObj">
                
                <div class="main-result">
                    <div class="result-col">
                        <span class="label">公历 (Solar)</span>
                        <span class="value date-text">{{ solarDateStr }}</span>
                        <span class="sub">{{ solarWkStr }}</span>
                    </div>
                    <div class="arrow"><el-icon>
                            <Right />
                        </el-icon></div>
                    <div class="result-col">
                        <span class="label">农历 (Lunar)</span>
                        <span class="value date-text">{{ lunarDateStr }}</span>
                        <span class="sub">{{ lunarObj.getYearInGanZhi() }}年 ({{ lunarObj.getYearShengXiao() }})</span>
                    </div>
                </div>

                <div class="divider"></div>

                
                <div class="details-grid">
                    <div class="detail-item">
                        <span class="d-label">干支</span>
                        <div class="ganzhi-box">
                            <span>{{ lunarObj.getYearInGanZhi() }}年</span>
                            <span>{{ lunarObj.getMonthInGanZhi() }}月</span>
                            <span>{{ lunarObj.getDayInGanZhi() }}日</span>
                        </div>
                    </div>
                    <div class="detail-item">
                        <span class="d-label">节气</span>
                        <span class="d-value highlight">{{ lunarObj.getJieQi() || '无节气' }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="d-label">星座</span>
                        
                        <span class="d-value">{{ solarObj.getXingZuo() }}座</span>
                    </div>
                    <div class="detail-item">
                        <span class="d-label">节日</span>
                        <div class="festivals">
                            <span v-for="f in festivals" :key="f" class="tag festival">{{ f }}</span>
                            <span v-if="festivals.length === 0">-</span>
                        </div>
                    </div>
                </div>

                
                <div class="yi-ji-box">
                    <div class="yj-row">
                        <div class="yj-icon yi">宜</div>
                        <div class="yj-content">{{ formatList(lunarObj.getDayYi()) }}</div>
                    </div>
                    <div class="yj-row">
                        <div class="yj-icon ji">忌</div>
                        <div class="yj-content">{{ formatList(lunarObj.getDayJi()) }}</div>
                    </div>
                </div>

                
                <div class="pengzu-box">
                    <span class="pz-label">彭祖百忌：</span>
                    <span>{{ lunarObj.getPengZuGan() }} {{ lunarObj.getPengZuZhi() }}</span>
                </div>
            </section>
        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - 农历阳历转换
        </footer>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Back, Right } from '@element-plus/icons-vue'
import { Solar, Lunar } from 'lunar-javascript'
import dayjs from 'dayjs'

const mode = ref('solarToLunar') 


const solarInput = ref(new Date())


const currentYear = new Date().getFullYear()
const lunarYear = ref(currentYear)
const lunarMonth = ref(new Date().getMonth() + 1)
const lunarDay = ref(new Date().getDate())
const isLeapMonth = ref(false)


const yearOptions = Array.from({ length: 200 }, (_, i) => 1900 + i)


const solarObj = ref(null)
const lunarObj = ref(null)

const getLunarDayName = (d) => {
    try {
        
        
        
        return Lunar.fromYmd(2000, 1, d).getDayInChinese()
    } catch {
        return d + '日'
    }
}

const updateObjects = () => {
    if (mode.value === 'solarToLunar') {
        if (!solarInput.value) return
        const s = Solar.fromDate(solarInput.value)
        solarObj.value = s
        lunarObj.value = s.getLunar()

        
        lunarYear.value = lunarObj.value.getYear()
        lunarMonth.value = lunarObj.value.getMonth()
        lunarDay.value = lunarObj.value.getDay()
    } else {
        try {
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            

            
            
            

            
            
            
            
            
            
            
            

            let l = Lunar.fromYmd(lunarYear.value, lunarMonth.value, lunarDay.value)
            
            
            if (isLeapMonth.value) {
                
                const leapMonth = l.getLeapMonth()
                if (leapMonth === lunarMonth.value) {
                    
                    
                    
                }
            }

            lunarObj.value = l
            solarObj.value = l.getSolar()

            
            
            
            solarInput.value = new Date(solarObj.value.getYear(), solarObj.value.getMonth() - 1, solarObj.value.getDay())

        } catch (e) {
            console.error('Conversion Failed', e)
        }
    }
}

watch([solarInput, mode], () => {
    if (mode.value === 'solarToLunar') updateObjects()
})

const handleSolarChange = () => updateObjects()

const handleLunarChange = () => {
    if (mode.value === 'lunarToSolar') updateObjects()
}


const solarDateStr = computed(() => {
    if (!solarObj.value) return ''
    return `${solarObj.value.getYear()}年${solarObj.value.getMonth()}月${solarObj.value.getDay()}日`
})

const solarWkStr = computed(() => {
    if (!solarObj.value) return ''
    const wk = solarObj.value.getWeek() 
    const arr = ['日', '一', '二', '三', '四', '五', '六']
    return `星期${arr[wk]}`
})

const lunarDateStr = computed(() => {
    if (!lunarObj.value) return ''
    return `${lunarObj.value.getMonthInChinese()}月${lunarObj.value.getDayInChinese()}`
})

const festivals = computed(() => {
    if (!lunarObj.value || !solarObj.value) return []
    const li = []
    
    const lf = lunarObj.value.getFestivals()
    if (lf) lf.forEach(f => li.push(f))
    
    const sf = solarObj.value.getFestivals()
    if (sf) sf.forEach(f => li.push(f))

    
    return li
})

const formatList = (arr) => {
    if (!arr || arr.length === 0) return '-'
    
    return arr.slice(0, 8).join(' ') + (arr.length > 8 ? '...' : '')
}

onMounted(() => {
    updateObjects()
})

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

.lunar-converter-tool {
    --bg: #faf9f7;
    --card: #ffffff;
    --border: #e8e6e3;
    --text: #1a1a1a;
    --text-2: #6b6b6b;
    --red: #d9363e;
    
    --gold: #b38b4d;
    --green: #10b981;

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
    padding: 0.5rem 0;
}

.nav-center h1 {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.25rem;
    font-weight: 600;
}

.nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-2);
    text-transform: uppercase;
    display: block;
    text-align: center;
}

.main-content {
    max-width: 800px;
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


.mode-switch {
    display: flex;
    gap: 1rem;
    padding: 0.75rem;
}

.mode-btn {
    flex: 1;
    border: none;
    background: transparent;
    padding: 0.75rem;
    font-size: 1rem;
    color: var(--text-2);
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s;
}

.mode-btn.active {
    background: #fff8f8;
    color: var(--red);
    font-weight: 600;
    box-shadow: inset 0 0 0 1px var(--red);
}


.input-section {
    display: flex;
    justify-content: center;
}

.input-group {
    width: 100%;
    max-width: 400px;
}

.full-width {
    width: 100% !important;
}

.lunar-inputs {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
}

.select-wrapper select {
    padding: 0.6rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: white;
    font-size: 1rem;
}

.checkbox-wrapper {
    display: flex;
    align-items: center;
    font-size: 0.9rem;
    color: var(--text-2);
}


.main-result {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.result-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.label {
    font-size: 0.8rem;
    color: var(--text-2);
    margin-bottom: 0.5rem;
}

.value.date-text {
    font-size: 1.5rem;
    font-weight: 700;
    font-family: 'Noto Serif SC', serif;
    color: var(--text);
}

.sub {
    font-size: 0.9rem;
    color: var(--text-2);
    margin-top: 0.25rem;
}

.arrow {
    color: var(--border);
    font-size: 1.2rem;
}

.divider {
    height: 1px;
    background: var(--border);
    margin: 1.5rem 0;
}

.details-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.detail-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.25rem;
}

.d-label {
    font-size: 0.8rem;
    color: var(--text-2);
}

.d-value {
    font-weight: 600;
}

.d-value.highlight {
    color: var(--gold);
}

.ganzhi-box {
    display: flex;
    flex-direction: column;
    font-size: 0.85rem;
    line-height: 1.4;
}

.festivals {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 4px;
}

.tag.festival {
    font-size: 0.75rem;
    color: var(--red);
    background: #fff0f0;
    padding: 2px 4px;
    border-radius: 4px;
}


.yi-ji-box {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    background: #fdfdfd;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.03);
}

.yj-row {
    display: flex;
    gap: 1rem;
}

.yj-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    color: white;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.yj-icon.yi {
    background: var(--green);
}

.yj-icon.ji {
    background: var(--red);
}

.yj-content {
    font-size: 0.9rem;
    color: var(--text);
    line-height: 1.5;
}

.pengzu-box {
    margin-top: 1rem;
    font-size: 0.85rem;
    color: var(--text-2);
    text-align: center;
}

.pz-label {
    font-weight: 600;
}

.footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-2);
    font-size: 0.85rem;
    border-top: 1px solid var(--border);
    margin-top: 2rem;
}

@media (max-width: 600px) {
    .main-result {
        flex-direction: column;
        gap: 1.5rem;
    }

    .arrow {
        transform: rotate(90deg);
    }

    .details-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>
