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
                <div class="custom-tabs">
                    <button :class="{ active: activeTab === 'simplify' }" @click="activeTab = 'simplify'">
                        <el-icon>
                            <Refresh />
                        </el-icon> 约分与转换
                    </button>
                    <button :class="{ active: activeTab === 'calc' }" @click="activeTab = 'calc'">
                        <el-icon>
                            <Operation />
                        </el-icon> 分数运算
                    </button>
                </div>


                <div v-if="activeTab === 'simplify'" class="tab-content animate-fade-in">
                    <div class="tool-section">
                        <div class="expression-box">
                            <div class="fraction-input-large">
                                <input v-model.number="num1" type="number" placeholder="分子" />
                                <div class="fraction-line"></div>
                                <input v-model.number="den1" type="number" placeholder="分母" />
                            </div>
                            <div class="action-wrap">
                                <button @click="simplify" class="compute-btn">
                                    <span>执行计算</span>
                                    <el-icon>
                                        <CaretRight />
                                    </el-icon>
                                </button>
                            </div>
                        </div>

                        <div v-if="singleResult" class="result-area">
                            <div class="result-card main-res">
                                <div class="res-label">最简分数</div>
                                <div class="res-body">
                                    <div class="fraction-display large">
                                        <span class="num">{{ singleResult.num }}</span>
                                        <div class="line"></div>
                                        <span class="den">{{ singleResult.den }}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="result-grid">
                                <div class="result-card mini" v-if="singleResult.mixed">
                                    <div class="res-label">带分数</div>
                                    <div class="res-val">{{ singleResult.mixed }}</div>
                                </div>
                                <div class="result-card mini">
                                    <div class="res-label">小数结果</div>
                                    <div class="res-val">{{ singleResult.decimal }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div v-else class="tab-content animate-fade-in">
                    <div class="tool-section">
                        <div class="calc-expression">
                            <div class="fraction-input-small">
                                <input v-model.number="cNum1" type="number" />
                                <div class="fraction-line"></div>
                                <input v-model.number="cDen1" type="number" />
                            </div>

                            <div class="operator-select">
                                <select v-model="op">
                                    <option value="+">+</option>
                                    <option value="-">-</option>
                                    <option value="*">×</option>
                                    <option value="/">÷</option>
                                </select>
                            </div>

                            <div class="fraction-input-small">
                                <input v-model.number="cNum2" type="number" />
                                <div class="fraction-line"></div>
                                <input v-model.number="cDen2" type="number" />
                            </div>

                            <div class="action-wrap">
                                <button @click="calculate" class="compute-btn">
                                    <el-icon>
                                        <Finished />
                                    </el-icon>
                                </button>
                            </div>
                        </div>

                        <div v-if="calcResult" class="result-area">
                            <div class="result-card compound">
                                <div class="res-label">计算结果</div>
                                <div class="compound-body">
                                    <div class="fraction-display">
                                        <span class="num">{{ calcResult.num }}</span>
                                        <div class="line"></div>
                                        <span class="den">{{ calcResult.den }}</span>
                                    </div>
                                    <div class="equal-sign">≈</div>
                                    <div class="decimal-val">{{ calcResult.decimal }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="info-alert">
                <el-icon>
                    <InfoFilled />
                </el-icon>
                <div class="info-text">
                    <strong>提示：</strong>
                    <span>本工具采用最大公约数(GCD)算法，支持分数的约分、通分及四则运算。</span>
                </div>
            </div>
        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - 开启高效数学学习之旅
        </footer>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { Back, InfoFilled, Refresh, Operation, CaretRight, Finished } from '@element-plus/icons-vue'

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
    const n = Math.floor(num1.value / common)
    const d = Math.floor(den1.value / common)

    let mixed = null
    if (Math.abs(n) > Math.abs(d)) {
        const whole = Math.floor(Math.abs(n) / Math.abs(d))
        const rem = Math.abs(n) % Math.abs(d)
        const sign = n * d < 0 ? '-' : ''
        mixed = rem === 0 ? `${sign}${whole}` : `${sign}${whole} 又 ${rem}/${Math.abs(d)}`
    }

    singleResult.value = {
        num: n, den: d, mixed,
        decimal: (num1.value / den1.value).toFixed(6).replace(/\.?0+$/, '')
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

    if (resDen === 0) return

    const common = gcd(resNum, resDen)
    calcResult.value = {
        num: resNum / common,
        den: resDen / common,
        decimal: (resNum / resDen).toFixed(6).replace(/\.?0+$/, '')
    }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=JetBrains+Mono&display=swap');

.fraction-tool {
    --bg: #fdfdfb;
    --card: #ffffff;
    --border: #e8e6e1;
    --text: #2d2a26;
    --text-2: #7c746b;
    --primary: #c2410c;
    --primary-bg: #fff7ed;

    font-family: 'Outfit', 'Noto Sans SC', sans-serif;
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
    padding: 1.25rem 2rem;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
}

.nav-back,
.nav-spacer {
    width: 100px;
}

.nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--primary-bg);
    border: 1px solid var(--border);
    color: var(--primary);
    cursor: pointer;
    font-size: 0.85rem;
    padding: 0.6rem 1.2rem;
    border-radius: 50px;
    transition: all 0.3s;
}

.nav-back:hover {
    background: var(--primary);
    color: white;
}

.nav-center h1 {
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0;
}

.nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-2);
    text-transform: uppercase;
    letter-spacing: 2px;
}

.main-content {
    max-width: 900px;
    margin: 0 auto;
    padding: 3rem 1.5rem;
}

.glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 32px;
    padding: 2.5rem;
    box-shadow: 0 20px 40px -20px rgba(194, 65, 12, 0.1);
}

.custom-tabs {
    display: flex;
    gap: 1rem;
    margin-bottom: 3rem;
    padding: 0.5rem;
    background: #f8f8f6;
    border-radius: 16px;
}

.custom-tabs button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem;
    border-radius: 12px;
    border: none;
    background: transparent;
    color: var(--text-2);
    cursor: pointer;
    transition: all 0.3s;
    font-weight: 600;
    font-size: 1rem;
}

.custom-tabs button.active {
    background: white;
    color: var(--primary);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.expression-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2.5rem;
    margin-bottom: 4rem;
}

.fraction-input-large {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.8rem;
    width: 140px;
}

.fraction-input-large input {
    width: 100%;
    text-align: center;
    padding: 1rem;
    background: #fdfdfd;
    border: 2px solid var(--border);
    border-radius: 16px;
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text);
    outline: none;
    transition: all 0.3s;
}

.fraction-input-large input:focus {
    border-color: var(--primary);
    background: #fff;
    box-shadow: 0 0 0 4px var(--primary-bg);
}

.fraction-line {
    width: 100%;
    height: 4px;
    background: var(--text);
    border-radius: 2px;
}

.compute-btn {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 1.2rem 3rem;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 50px;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 10px 20px rgba(194, 65, 12, 0.2);
}

.compute-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(194, 65, 12, 0.3);
}

.result-area {
    animation: slideUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.result-card {
    background: var(--primary-bg);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 2rem;
    text-align: center;
}

.result-card.main-res {
    margin-bottom: 1.5rem;
}

.res-label {
    font-size: 0.75rem;
    font-weight: 800;
    color: var(--primary);
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 1.5rem;
}

.fraction-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1;
}

.fraction-display.large .num,
.fraction-display.large .den {
    font-size: 3rem;
}

.fraction-display .num,
.fraction-display .den {
    font-size: 2.2rem;
    font-weight: 800;
    padding: 4px 0;
}

.fraction-display .line {
    width: 60px;
    height: 4px;
    background: var(--primary);
    margin: 4px 0;
}

.result-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.result-card.mini {
    padding: 1.5rem;
}

.res-val {
    font-size: 1.6rem;
    font-weight: 700;
}

.calc-expression {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 4rem;
    flex-wrap: wrap;
}

.fraction-input-small {
    width: 100px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.fraction-input-small input {
    width: 100%;
    text-align: center;
    padding: 0.8rem;
    background: #fff;
    border: 2px solid var(--border);
    border-radius: 12px;
    font-size: 1.4rem;
    font-weight: 700;
}

.operator-select select {
    font-size: 2rem;
    padding: 0.5rem 1rem;
    border: 2px solid var(--border);
    border-radius: 12px;
    background: #fff;
    cursor: pointer;
    font-weight: 700;
    color: var(--primary);
}

.compound-body {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
}

.equal-sign {
    font-size: 2.5rem;
    color: var(--primary);
    font-weight: 400;
}

.decimal-val {
    font-size: 2.5rem;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
}

.info-alert {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-top: 3rem;
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
}

.info-alert .el-icon {
    font-size: 1.5rem;
    color: #3b82f6;
    margin-top: 2px;
}

.info-text {
    font-size: 0.9rem;
    line-height: 1.6;
    color: #64748b;
}

.info-text strong {
    color: #1e293b;
    margin-right: 0.5rem;
}

.footer {
    text-align: center;
    padding: 4rem;
    color: var(--text-2);
    font-size: 0.9rem;
    letter-spacing: 2px;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 640px) {
    .calc-expression {
        gap: 1rem;
    }

    .compound-body {
        flex-direction: column;
        gap: 1rem;
    }

    .equal-sign {
        transform: rotate(90deg);
    }
}
</style>
