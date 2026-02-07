<template>
    <div class="fraction-tool">
        <nav class="nav-bar">
            <button @click="$router.back()" class="nav-back">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>分数约分通分器</h1>
                <span class="nav-subtitle">Fraction Simplifier & Calculator</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="tool-card glass-card">
                <div class="tabs">
                    <button :class="{ active: activeTab === 'simplify' }" @click="activeTab = 'simplify'">约分/转换</button>
                    <button :class="{ active: activeTab === 'calc' }" @click="activeTab = 'calc'">分数计算</button>
                </div>

                
                <div v-if="activeTab === 'simplify'" class="tab-content animate-fade-in">
                    <div class="input-row">
                        <div class="fraction-input">
                            <input v-model.number="num1" type="number" placeholder="分子" />
                            <div class="line"></div>
                            <input v-model.number="den1" type="number" placeholder="分母" />
                        </div>
                        <button @click="simplify" class="primary-btn">执行约分</button>
                    </div>

                    <div v-if="singleResult" class="result-box">
                        <div class="result-item">
                            <span class="label">最简分数：</span>
                            <div class="fraction-view">
                                <span>{{ singleResult.num }}</span>
                                <div class="line"></div>
                                <span>{{ singleResult.den }}</span>
                            </div>
                        </div>
                        <div class="result-item" v-if="singleResult.mixed">
                            <span class="label">带分数：</span>
                            <span class="value">{{ singleResult.mixed }}</span>
                        </div>
                        <div class="result-item">
                            <span class="label">小数结果：</span>
                            <span class="value">{{ singleResult.decimal }}</span>
                        </div>
                    </div>
                </div>

                
                <div v-else class="tab-content animate-fade-in">
                    <div class="calc-row">
                        <div class="fraction-input">
                            <input v-model.number="cNum1" type="number" />
                            <div class="line"></div>
                            <input v-model.number="cDen1" type="number" />
                        </div>
                        <select v-model="op" class="op-select">
                            <option value="+">+</option>
                            <option value="-">-</option>
                            <option value="*">×</option>
                            <option value="/">÷</option>
                        </select>
                        <div class="fraction-input">
                            <input v-model.number="cNum2" type="number" />
                            <div class="line"></div>
                            <input v-model.number="cDen2" type="number" />
                        </div>
                        <button @click="calculate" class="primary-btn">计算</button>
                    </div>

                    <div v-if="calcResult" class="result-box">
                        <div class="result-item big">
                            <span class="label">计算结果：</span>
                            <div class="fraction-view">
                                <span>{{ calcResult.num }}</span>
                                <div class="line"></div>
                                <span>{{ calcResult.den }}</span>
                            </div>
                            <span class="equal">=</span>
                            <span class="value">{{ calcResult.decimal }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="disclaimer-card">
                <el-icon>
                    <InfoFilled />
                </el-icon>
                <span>计算基于浮点转换与最大公约数算法，暂不支持超大数值。计算结果可能有误差，仅供参考。</span>
            </div>
        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - 分数约分通分器
        </footer>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { Back, InfoFilled } from '@element-plus/icons-vue'

const activeTab = ref('simplify')


const num1 = ref(12)
const den1 = ref(16)
const singleResult = ref(null)


const cNum1 = ref(1); const cDen1 = ref(2)
const cNum2 = ref(1); const cDen2 = ref(3)
const op = ref('+')
const calcResult = ref(null)

const gcd = (a, b) => {
    a = Math.abs(a); b = Math.abs(b)
    while (b) { a %= b;[a, b] = [b, a] }
    return a
}

const simplify = () => {
    if (!den1.value) return
    const common = gcd(num1.value, den1.value)
    const n = num1.value / common
    const d = den1.value / common

    let mixed = null
    if (n > d) {
        const whole = Math.floor(n / d)
        const rem = n % d
        mixed = rem === 0 ? `${whole}` : `${whole} 又 ${rem}/${d}`
    }

    singleResult.value = {
        num: n, den: d, mixed,
        decimal: (num1.value / den1.value).toFixed(4).replace(/\.?0+$/, '')
    }
}

const calculate = () => {
    if (!cDen1.value || !cDen2.value) return
    let resNum, resDen

    if (op.value === '+' || op.value === '-') {
        
        resDen = cDen1.value * cDen2.value
        const n1 = cNum1.value * cDen2.value
        const n2 = cNum2.value * cDen1.value
        resNum = op.value === '+' ? n1 + n2 : n1 - n2
    } else if (op.value === '*') {
        resNum = cNum1.value * cNum2.value
        resDen = cDen1.value * cDen2.value
    } else {
        resNum = cNum1.value * cDen2.value
        resDen = cDen1.value * cNum2.value
    }

    const common = gcd(resNum, resDen)
    calcResult.value = {
        num: resNum / common,
        den: resDen / common,
        decimal: (resNum / resDen).toFixed(4).replace(/\.?0+$/, '')
    }
}
</script>

<style scoped>
.fraction-tool {
    --bg: #fff7ed;
    --card: #ffffff;
    --border: #ffedd5;
    --text: #431407;
    --text-2: #9a3412;
    --accent: #f97316;
    

    font-family: 'Noto Sans SC', sans-serif;
    min-height: 100vh;
    background: var(--bg);
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
    border: none;
    background: none;
    color: var(--text-2);
    cursor: pointer;
}

.nav-center {
    text-align: center;
    flex: 1;
}

.nav-center h1 {
    font-size: 1.1rem;
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
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    background: #fffaf5;
    padding: 0.4rem;
    border-radius: 12px;
}

.tabs button {
    flex: 1;
    padding: 0.7rem;
    border-radius: 8px;
    border: none;
    background: none;
    color: var(--text-2);
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;
}

.tabs button.active {
    background: var(--accent);
    color: white;
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.2);
}

.input-row,
.calc-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    margin-bottom: 2.5rem;
    flex-wrap: wrap;
}

.fraction-input {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    width: 80px;
}

.fraction-input input {
    width: 100%;
    text-align: center;
    padding: 0.6rem;
    border: 2px solid var(--border);
    border-radius: 8px;
    font-size: 1.1rem;
    outline: none;
}

.fraction-input input:focus {
    border-color: var(--accent);
}

.fraction-input .line {
    width: 100%;
    height: 2px;
    background: var(--text);
}

.op-select {
    padding: 0.6rem 1rem;
    border: 2px solid var(--border);
    border-radius: 8px;
    font-size: 1.2rem;
    cursor: pointer;
    outline: none;
    background: white;
}

.primary-btn {
    padding: 0.8rem 2rem;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
}

.result-box {
    background: #fffcf9;
    padding: 2rem;
    border-radius: 16px;
    border: 1px dashed var(--accent);
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
}

.result-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 1.1rem;
}

.result-item.big {
    font-size: 1.4rem;
    justify-content: center;
}

.label {
    color: var(--text-2);
    font-size: 0.9rem;
}

.value {
    font-weight: 700;
    color: var(--text);
}

.fraction-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 40px;
    line-height: 1;
}

.fraction-view span {
    display: block;
    padding: 2px;
}

.fraction-view .line {
    width: 100%;
    height: 2px;
    background: var(--text);
    margin: 2px 0;
}

.equal {
    font-size: 1.5rem;
    margin: 0 0.5rem;
    color: var(--text-2);
}

.disclaimer-card {
    display: flex;
    gap: 0.8rem;
    padding: 1rem;
    background: #fff7ed;
    color: #9a3412;
    border-radius: 12px;
    font-size: 0.8rem;
}

.footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-2);
    font-size: 0.85rem;
}

.animate-fade-in {
    animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.98);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}
</style>
