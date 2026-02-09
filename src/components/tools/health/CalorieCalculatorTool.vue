<template>
    <div class="calorie-calculator-tool">
        <nav class="nav-bar">
            <button class="nav-back" @click="$router.back()">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>热量/TDEE 计算</h1>
                <span class="nav-subtitle">Calorie & TDEE Calculator</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            
            <section class="tdee-card glass-card">
                <div class="section-title">
                    <el-icon>
                        <Odometer />
                    </el-icon> 基础代谢与每日消耗 (TDEE)
                </div>

                <div class="tdee-form">
                    <div class="form-row">
                        <div class="input-group">
                            <label>性别</label>
                            <div class="gender-switch">
                                <span :class="{ active: gender === 'male' }" @click="gender = 'male'">男</span>
                                <span :class="{ active: gender === 'female' }" @click="gender = 'female'">女</span>
                            </div>
                        </div>
                        <div class="input-group">
                            <label>年龄</label>
                            <input v-model.number="age" type="number" placeholder="岁" />
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="input-group">
                            <label>身高 (cm)</label>
                            <input v-model.number="height" type="number" placeholder="cm" />
                        </div>
                        <div class="input-group">
                            <label>体重 (kg)</label>
                            <input v-model.number="weight" type="number" placeholder="kg" />
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="input-group full">
                            <label>活动水平</label>
                            <select v-model="activity">
                                <option value="1.2">久坐 (办公室工作，极少运动)</option>
                                <option value="1.375">轻度 (每周 1-3 天轻量运动)</option>
                                <option value="1.55">中度 (每周 3-5 天中强度运动)</option>
                                <option value="1.725">重度 (每周 6-7 天高强度运动)</option>
                                <option value="1.9">极重度 (运动员 / 体力劳动者)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div v-if="bmr" class="tdee-result">
                    <div class="result-item">
                        <span class="label">BMR (基础代谢)</span>
                        <span class="val">{{ bmr }} kcal</span>
                    </div>
                    <div class="result-item highlight">
                        <span class="label">TDEE (总消耗)</span>
                        <span class="val big">{{ tdee }} kcal</span>
                    </div>
                </div>

                <div v-if="tdee" class="goals-grid">
                    <div class="goal-card loss">
                        <span class="g-title">减脂期 (-500)</span>
                        <span class="g-val">{{ tdee - 500 }}</span>
                        <span class="g-unit">kcal/天</span>
                    </div>
                    <div class="goal-card maintain">
                        <span class="g-title">维持期 (保持)</span>
                        <span class="g-val">{{ tdee }}</span>
                        <span class="g-unit">kcal/天</span>
                    </div>
                    <div class="goal-card gain">
                        <span class="g-title">增肌期 (+300)</span>
                        <span class="g-val">{{ tdee + 300 }}</span>
                        <span class="g-unit">kcal/天</span>
                    </div>
                </div>
            </section>

            
            <section class="food-card glass-card">
                <div class="section-title">
                    <el-icon>
                        <Bowl />
                    </el-icon> 食物热量查询与记录
                </div>

                <div class="search-box">
                    <el-icon class="search-icon">
                        <Search />
                    </el-icon>
                    <input
v-model="searchQuery" type="text" placeholder="搜索食物热量 (如: 米饭, 鸡肉)..."
                        @input="handleSearch" />
                </div>

                <div v-if="searchResults.length" class="search-results">
                    <div v-for="food in searchResults" :key="food.name" class="food-item" @click="addToRef(food)">
                        <div class="f-info">
                            <span class="f-name">{{ food.name }}</span>
                            <span class="f-unit">单位: {{ food.unit }}</span>
                        </div>
                        <div class="f-action">
                            <span class="f-cal">{{ food.cal }} kcal</span>
                            <el-icon class="add-icon">
                                <Plus />
                            </el-icon>
                        </div>
                    </div>
                </div>
                <div v-else-if="searchQuery && !searchResults.length" class="no-result">
                    未找到相关食物数据
                </div>

                <div v-if="todayLog.length" class="intake-log">
                    <div class="log-header">今日记录</div>
                    <div class="log-list">
                        <div v-for="(item, i) in todayLog" :key="i" class="log-item">
                            <span>{{ item.name }}</span>
                            <span>{{ item.cal }} kcal <el-icon class="del" @click="todayLog.splice(i, 1)">
                                    <Close />
                                </el-icon></span>
                        </div>
                    </div>
                    <div class="log-total">
                        今日总摄入: <b>{{ totalIntake }}</b> kcal
                    </div>
                </div>
            </section>
        </main>

        <div class="disclaimer-wrap" style="max-width: 600px; margin: 0 auto; padding: 0 1.5rem 2rem;">
            <div
class="disclaimer-card"
                style="display: flex; gap: 0.8rem; padding: 1rem; background: #fef2f2; color: #991b1b; border-radius: 12px; font-size: 0.8rem; align-items: start;">
                <el-icon>
                    <InfoFilled />
                </el-icon>
                <span>：热量计算基于 Mifflin-St Jeor 公式，所得结果为估算值。食物数据库仅包含常见项。身体实际消耗受基因、环境等多种因素影响，仅供参考。</span>
            </div>
        </div>

        <footer class="footer">
            © 2026 LRM工具箱 - 热量计算器
        </footer>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Back, Odometer, Bowl, Search, Plus, Close, InfoFilled } from '@element-plus/icons-vue'


const gender = ref('male')
const age = ref('')
const height = ref('')
const weight = ref('')
const activity = ref('1.2')

const bmr = computed(() => {
    const w = parseFloat(weight.value)
    const h = parseFloat(height.value)
    const a = parseFloat(age.value)
    if (!w || !h || !a) return 0

    
    let res = 10 * w + 6.25 * h - 5 * a
    if (gender.value === 'male') res += 5
    else res -= 161

    return Math.round(res)
})

const tdee = computed(() => {
    if (!bmr.value) return 0
    return Math.round(bmr.value * parseFloat(activity.value))
})


const searchQuery = ref('')
const searchResults = ref([])
const todayLog = ref([])


const foodDB = [
    { name: '米饭', unit: '1碗 (150g)', cal: 174 },
    { name: '馒头', unit: '1个 (100g)', cal: 223 },
    { name: '面条(煮)', unit: '1碗 (200g)', cal: 220 },
    { name: '全麦面包', unit: '1片 (35g)', cal: 89 },
    { name: '煮鸡蛋', unit: '1个 (50g)', cal: 70 },
    { name: '煎蛋', unit: '1个 (50g)', cal: 118 },
    { name: '鸡胸肉(水煮)', unit: '100g', cal: 133 },
    { name: '酱牛肉', unit: '100g', cal: 246 },
    { name: '猪肉(瘦)', unit: '100g', cal: 143 },
    { name: '苹果', unit: '1个 (200g)', cal: 104 },
    { name: '香蕉', unit: '1根 (150g)', cal: 138 },
    { name: '牛奶', unit: '1盒 (250ml)', cal: 163 },
    { name: '酸奶', unit: '1杯 (150g)', cal: 108 },
    { name: '可乐', unit: '1听 (330ml)', cal: 142 },
    { name: '薯片', unit: '1包 (70g)', cal: 375 },
    { name: '西兰花', unit: '100g', cal: 36 },
    { name: '生菜', unit: '100g', cal: 15 },
    { name: '番茄', unit: '1个 (200g)', cal: 30 },
]

const handleSearch = () => {
    const q = searchQuery.value.trim()
    if (!q) {
        searchResults.value = []
        return
    }
    searchResults.value = foodDB.filter(f => f.name.includes(q))
}

const addToRef = (food) => {
    todayLog.value.push(food)
    searchQuery.value = ''
    searchResults.value = []
}

const totalIntake = computed(() => {
    return todayLog.value.reduce((acc, item) => acc + item.cal, 0)
})

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

.calorie-calculator-tool {
    --bg: #faf9f7;
    --card: #ffffff;
    --border: #e8e6e3;
    --text: #1a1a1a;
    --text-2: #6b6b6b;
    --green: #10b981;
    --orange: #f59e0b;
    --blue: #3b82f6;

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

.nav-center {
    text-align: center;
    flex: 1;
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
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: var(--text);
}

.section-title .el-icon {
    font-size: 1.2rem;
}


.tdee-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-row {
    display: flex;
    gap: 1rem;
}

.input-group {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.input-group.full {
    width: 100%;
}

.input-group label {
    font-size: 0.85rem;
    color: var(--text-2);
    margin-bottom: 0.4rem;
}

.input-group input,
.input-group select {
    padding: 0.6rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 1rem;
    background: var(--bg);
}

.gender-switch {
    display: flex;
    align-items: flex-end;
    
    padding-bottom: 2px;
}

.gender-switch span {
    padding: 0.6rem 1.2rem;
    border: 1px solid var(--border);
    background: white;
    cursor: pointer;
    font-size: 0.9rem;
}

.gender-switch span:first-child {
    border-radius: 8px 0 0 8px;
    border-right: none;
}

.gender-switch span:last-child {
    border-radius: 0 8px 8px 0;
    border-left: none;
}

.gender-switch span.active {
    background: var(--text);
    color: white;
    border-color: var(--text);
}


.tdee-result {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px dashed var(--border);
    display: flex;
    justify-content: space-around;
}

.result-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.result-item .label {
    font-size: 0.8rem;
    color: var(--text-2);
}

.result-item .val {
    font-weight: 600;
}

.result-item.highlight .val.big {
    font-size: 1.5rem;
    color: var(--orange);
}

.goals-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0.75rem;
    margin-top: 1rem;
}

.goal-card {
    padding: 0.75rem;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #f9f9f9;
}

.g-title {
    font-size: 0.75rem;
    color: var(--text-2);
    margin-bottom: 4px;
}

.g-val {
    font-weight: 700;
    font-size: 1.1rem;
}

.g-unit {
    font-size: 0.7rem;
    color: #999;
}

.goal-card.loss {
    background: #f0fdf4;
    color: var(--green);
}

.goal-card.maintain {
    background: #f8fafc;
    color: var(--blue);
}

.goal-card.gain {
    background: #fff7ed;
    color: var(--orange);
}


.search-box {
    position: relative;
    margin-bottom: 1rem;
}

.search-box input {
    width: 100%;
    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
    border: 1px solid var(--border);
    border-radius: 20px;
    outline: none;
    font-size: 0.95rem;
}

.search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-2);
}

.search-results {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid var(--border);
    border-radius: 8px;
    margin-bottom: 1rem;
}

.food-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    border-bottom: 1px solid var(--bg);
    cursor: pointer;
    transition: background 0.2s;
}

.food-item:hover {
    background: #f5f5f5;
}

.f-info {
    display: flex;
    flex-direction: column;
}

.f-name {
    font-weight: 600;
    font-size: 0.95rem;
}

.f-unit {
    font-size: 0.75rem;
    color: var(--text-2);
}

.f-cal {
    font-weight: 600;
    color: var(--orange);
}

.add-icon {
    color: var(--green);
    margin-left: 0.5rem;
}

.no-result {
    text-align: center;
    font-size: 0.85rem;
    color: var(--text-2);
    padding: 1rem;
}

.intake-log {
    background: #fdfdfd;
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 8px;
    padding: 1rem;
}

.log-header {
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.log-list {
    margin-bottom: 0.5rem;
}

.log-item {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    padding: 4px 0;
    border-bottom: 1px dashed var(--bg);
}

.log-item .del {
    color: #ccc;
    cursor: pointer;
    margin-left: 8px;
}

.log-item .del:hover {
    color: var(--text);
}

.log-total {
    text-align: right;
    font-size: 0.95rem;
    padding-top: 0.5rem;
}

.footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-2);
    font-size: 0.85rem;
    border-top: 1px solid var(--border);
    margin-top: 2rem;
}
</style>
