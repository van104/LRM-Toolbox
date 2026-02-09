<template>
    <div class="proportion-tool">
        <nav class="nav-bar">
            <button class="nav-back" @click="$router.back()">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>比例求解计算器</h1>
                <span class="nav-subtitle">Proportion Solver</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="tool-card glass-card">
                <div class="intro">
                    根据比例公式 <strong>A : B = C : D</strong>，输入已知的三项，自动求出第四项。
                </div>

                <div class="proportion-formula">
                    <div class="item">
                        <label>A</label>
                        <input v-model="a" type="text" placeholder="未知?" />
                    </div>
                    <div class="symbol">:</div>
                    <div class="item">
                        <label>B</label>
                        <input v-model="b" type="text" placeholder="未知?" />
                    </div>
                    <div class="symbol">=</div>
                    <div class="item">
                        <label>C</label>
                        <input v-model="c" type="text" placeholder="未知?" />
                    </div>
                    <div class="symbol">:</div>
                    <div class="item">
                        <label>D</label>
                        <input v-model="d" type="text" placeholder="未知?" />
                    </div>
                </div>

                <div class="actions">
                    <button class="solve-btn" @click="solve">求解未知项</button>
                    <button class="reset-btn" @click="reset">重置</button>
                </div>

                <div v-if="result" class="result-area animate-fade-in">
                    <div class="result-text">
                        解得未知项：<span class="highlight">{{ result.variable }} = {{ result.value }}</span>
                    </div>
                    <div class="steps">
                        <h4>计算过程：</h4>
                        <p>{{ result.step }}</p>
                    </div>
                </div>

                <div v-if="error" class="error-msg">
                    {{ error }}
                </div>
            </div>

            <div class="disclaimer-card">
                <el-icon>
                    <InfoFilled />
                </el-icon>
                <span>计算基于比例性质（两内项积等于两外项积）。计算结果可能有误差，仅供参考。</span>
            </div>
        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - 比例求解计算器
        </footer>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { Back, InfoFilled } from '@element-plus/icons-vue'

const a = ref('3')
const b = ref('4')
const c = ref('x')
const d = ref('8')

const result = ref(null)
const error = ref('')

const solve = () => {
    error.value = ''
    result.value = null

    const vals = [a.value, b.value, c.value, d.value].map(v => v.trim().toLowerCase())
    const unknownIdx = vals.findIndex(v => isNaN(v) || v === '' || v === 'x' || v === '?')

    const nums = vals.map(v => parseFloat(v))
    const unknownCount = vals.filter(v => isNaN(parseFloat(v))).length

    if (unknownCount !== 1) {
        error.value = '请确保且仅有一个未知项（填入 x 或留空）'
        return
    }

    let val = 0
    let step = ''
    let variable = 'x'

    
    if (isNaN(nums[0])) { 
        val = (nums[1] * nums[2]) / nums[3]
        step = `A = (B * C) / D = (${nums[1]} * ${nums[2]}) / ${nums[3]}`
        variable = 'A'
    } else if (isNaN(nums[1])) { 
        val = (nums[0] * nums[3]) / nums[2]
        step = `B = (A * D) / C = (${nums[0]} * ${nums[3]}) / ${nums[2]}`
        variable = 'B'
    } else if (isNaN(nums[2])) { 
        val = (nums[0] * nums[3]) / nums[1]
        step = `C = (A * D) / B = (${nums[0]} * ${nums[3]}) / ${nums[1]}`
        variable = 'C'
    } else if (isNaN(nums[3])) { 
        val = (nums[1] * nums[2]) / nums[0]
        step = `D = (B * C) / A = (${nums[1]} * ${nums[2]}) / ${nums[0]}`
        variable = 'D'
    }

    if (!isFinite(val)) {
        error.value = '计算出错，请检查输入（分母不能为0）'
        return
    }

    result.value = {
        variable,
        value: Number.isInteger(val) ? val : val.toFixed(4).replace(/\.?0+$/, ''),
        step
    }
}

const reset = () => {
    a.value = ''; b.value = ''; c.value = ''; d.value = ''
    result.value = null; error.value = ''
}
</script>

<style scoped>
.proportion-tool {
    --bg: #f8fafc;
    --card: #ffffff;
    --border: #e2e8f0;
    --text: #0f172a;
    --text-2: #64748b;
    --accent: #3b82f6;
    

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
    padding: 2.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.intro {
    text-align: center;
    margin-bottom: 3rem;
    color: var(--text-2);
    font-size: 1rem;
}

.intro strong {
    color: var(--accent);
}

.proportion-formula {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 3rem;
}

.item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.item label {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-2);
}

.item input {
    width: 80px;
    height: 80px;
    text-align: center;
    font-size: 1.4rem;
    border: 2px solid var(--border);
    border-radius: 16px;
    outline: none;
    transition: all 0.2s;
}

.item input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 15px rgba(59, 130, 246, 0.1);
}

.symbol {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-2);
    padding-top: 1.5rem;
}

.actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2rem;
}

.solve-btn {
    padding: 0.8rem 2.5rem;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
}

.reset-btn {
    padding: 0.8rem 1.5rem;
    background: #f1f5f9;
    color: var(--text-2);
    border: none;
    border-radius: 12px;
    cursor: pointer;
}

.result-area {
    background: #eff6ff;
    padding: 2rem;
    border-radius: 16px;
    border: 1px solid #dbeafe;
}

.result-text {
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    text-align: center;
}

.highlight {
    color: var(--accent);
    font-size: 1.8rem;
}

.steps h4 {
    font-size: 0.9rem;
    color: var(--text-2);
    margin-bottom: 0.5rem;
}

.steps p {
    font-family: monospace;
    background: white;
    padding: 1rem;
    border-radius: 8px;
    font-size: 1rem;
    color: var(--text);
}

.error-msg {
    text-align: center;
    color: #ef4444;
    margin-top: 1rem;
    font-size: 0.9rem;
}

.disclaimer-card {
    display: flex;
    gap: 0.8rem;
    padding: 1rem;
    background: #eff6ff;
    color: #1e40af;
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
    animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
