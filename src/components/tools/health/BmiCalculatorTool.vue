<template>
    <div class="bmi-calculator-tool">
        <nav class="nav-bar">
            <button class="nav-back" @click="$router.back()">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>BMI 体脂计算器</h1>
                <span class="nav-subtitle">Body Mass Index</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="calculator-card glass-card">
                <div class="input-section">
                    <div class="form-group">
                        <label>身高 (cm)</label>
                        <div class="input-wrapper">
                            <input v-model.number="height" type="number" placeholder="例如：175" @input="calculate" />
                            <span class="unit">cm</span>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>体重 (kg)</label>
                        <div class="input-wrapper">
                            <input v-model.number="weight" type="number" placeholder="例如：65" @input="calculate" />
                            <span class="unit">kg</span>
                        </div>
                    </div>
                </div>

                
                <div v-if="bmiResult" class="result-display">
                    <div class="bmi-value" :class="bmiResult.colorClass">
                        {{ bmiResult.bmi }}
                    </div>
                    <div class="bmi-label" :style="{ color: bmiResult.color }">
                        {{ bmiResult.label }}
                    </div>

                    
                    <div class="bmi-scale">
                        <div class="scale-bar">
                            <div class="scale-segment thin"></div>
                            <div class="scale-segment normal"></div>
                            <div class="scale-segment heavy"></div>
                            <div class="scale-segment fat"></div>

                            
                            <div class="pointer" :style="{ left: pointerPosition + '%' }">
                                <div class="pointer-triangle" :style="{ borderTopColor: bmiResult.color }"></div>
                            </div>
                        </div>
                        <div class="scale-labels">
                            <span>18.5</span>
                            <span>24.0</span>
                            <span>28.0</span>
                        </div>
                        <div class="range-labels">
                            <span class="r-text">偏瘦</span>
                            <span class="r-text">正常</span>
                            <span class="r-text">超重</span>
                            <span class="r-text">肥胖</span>
                        </div>
                    </div>

                    <div class="suggestion-box">
                        <p>您的健康体重范围应为：<br><b>{{ healthyRange }}</b></p>
                        <p v-if="weightDiff" class="to-health">
                            {{ weightDiff.msg }} <b :class="weightDiff.type">{{ weightDiff.val }} kg</b>
                        </p>
                    </div>
                </div>

                <div v-else class="empty-state">
                    <el-icon>
                        <User />
                    </el-icon>
                    <p>请输入身高体重查看结果</p>
                </div>
            </div>

            
            <div class="reference-card glass-card">
                <h3>BMI 标准参考 (中国)</h3>
                <table class="ref-table">
                    <thead>
                        <tr>
                            <th>等级</th>
                            <th>BMI 范围</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><span class="dot thin"></span> 偏瘦</td>
                            <td>&lt; 18.5</td>
                        </tr>
                        <tr>
                            <td><span class="dot normal"></span> 正常</td>
                            <td>18.5 ~ 23.9</td>
                        </tr>
                        <tr>
                            <td><span class="dot heavy"></span> 超重</td>
                            <td>24.0 ~ 27.9</td>
                        </tr>
                        <tr>
                            <td><span class="dot fat"></span> 肥胖</td>
                            <td>&ge; 28.0</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>

        <div class="disclaimer-wrap" style="padding: 0 1.5rem 2rem; text-align: center;">
            <div
class="disclaimer-card"
                style="display: inline-flex; gap: 0.8rem; padding: 1rem; background: #eff6ff; color: #1e40af; border-radius: 12px; font-size: 0.8rem; align-items: start; text-align: left; border: 1px solid #dbeafe;">
                <el-icon style="margin-top: 2px;">
                    <InfoFilled />
                </el-icon>
                <span>BMI 结果仅供成年人参考，不适用于未成年人、孕妇、运动员等特殊人群。健康建议请咨询专业医师。</span>
            </div>
        </div>


        <footer class="footer">
            © 2026 LRM工具箱 - BMI计算器
        </footer>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Back, User } from '@element-plus/icons-vue'

const height = ref('')
const weight = ref('')

const bmiResult = computed(() => {
    const h = parseFloat(height.value)
    const w = parseFloat(weight.value)
    if (!h || !w || h <= 0 || w <= 0) return null

    const hM = h / 100
    const bmi = w / (hM * hM)
    const bmiFixed = bmi.toFixed(1)

    let label = ''
    let color = ''
    let colorClass = ''

    if (bmi < 18.5) {
        label = '偏瘦'
        color = '#3b82f6' 
        colorClass = 'text-thin'
    } else if (bmi < 24) {
        label = '正常'
        color = '#10b981' 
        colorClass = 'text-normal'
    } else if (bmi < 28) {
        label = '超重'
        color = '#f59e0b' 
        colorClass = 'text-heavy'
    } else {
        label = '肥胖'
        color = '#ef4444' 
        colorClass = 'text-fat'
    }

    return { bmi: bmiFixed, label, color, colorClass, raw: bmi }
})

const pointerPosition = computed(() => {
    if (!bmiResult.value) return 0
    const b = bmiResult.value.raw
    
    
    
    
    
    
    
    
    

    let p = 0
    if (b < 18.5) {
        
        p = ((b - 10) / 8.5) * 25
    } else if (b < 24) {
        
        p = 25 + ((b - 18.5) / 5.5) * 25
    } else if (b < 28) {
        
        p = 50 + ((b - 24) / 4) * 25
    } else {
        
        p = 75 + ((b - 28) / 7) * 25
    }

    if (p < 0) p = 0
    if (p > 100) p = 100
    return p
})

const healthyRange = computed(() => {
    const h = parseFloat(height.value)
    if (!h) return ''
    const hM = h / 100
    const min = (18.5 * hM * hM).toFixed(1)
    const max = (23.9 * hM * hM).toFixed(1)
    return `${min}kg ~ ${max}kg`
})

const weightDiff = computed(() => {
    if (!bmiResult.value || !healthyRange.value) return null
    const w = parseFloat(weight.value)
    const hM = parseFloat(height.value) / 100

    if (bmiResult.value.raw < 18.5) {
        const target = 18.5 * hM * hM
        return { msg: '建议增重', val: (target - w).toFixed(1), type: 'text-normal' }
    } else if (bmiResult.value.raw > 24) {
        const target = 24 * hM * hM
        return { msg: '建议减重', val: (w - target).toFixed(1), type: 'text-normal' } 
    }
    return null
})

const calculate = () => {
    
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

.bmi-calculator-tool {
    --bg: #faf9f7;
    --card: #ffffff;
    --border: #e8e6e3;
    --text: #1a1a1a;
    --text-2: #6b6b6b;

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
    max-width: 500px;
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

.input-section {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
}

.form-group {
    flex: 1;
}

.form-group label {
    display: block;
    font-size: 0.9rem;
    color: var(--text-2);
    margin-bottom: 0.5rem;
}

.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.input-wrapper input {
    width: 100%;
    padding: 0.75rem;
    padding-right: 2.5rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 1.1rem;
    background: var(--bg);
    text-align: center;
}

.input-wrapper .unit {
    position: absolute;
    right: 0.75rem;
    color: var(--text-2);
    font-size: 0.9rem;
}


.result-display {
    text-align: center;
}

.bmi-value {
    font-size: 4rem;
    font-weight: 700;
    line-height: 1;
    font-family: 'Noto Serif SC', serif;
}

.bmi-label {
    font-size: 1.5rem;
    font-weight: 600;
    margin-top: 0.5rem;
}


.text-thin {
    color: #3b82f6;
}

.text-normal {
    color: #10b981;
}

.text-heavy {
    color: #f59e0b;
}

.text-fat {
    color: #ef4444;
}


.bmi-scale {
    position: relative;
    margin: 2rem 0;
    padding-top: 1rem;
}

.scale-bar {
    height: 12px;
    width: 100%;
    border-radius: 6px;
    background: #eee;
    display: flex;
    overflow: hidden;
    position: relative;
}

.scale-segment {
    flex: 1;
    height: 100%;
}

.scale-segment.thin {
    background: #3b82f6;
    opacity: 0.5;
}

.scale-segment.normal {
    background: #10b981;
    opacity: 0.6;
}

.scale-segment.heavy {
    background: #f59e0b;
    opacity: 0.6;
}

.scale-segment.fat {
    background: #ef4444;
    opacity: 0.6;
}

.pointer {
    position: absolute;
    top: -8px;
    width: 0;
    height: 0;
    transform: translateX(-50%);
    transition: left 0.3s ease-out;
}

.pointer-triangle {
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 10px solid #333;
}

.scale-labels {
    display: flex;
    justify-content: space-between;
    padding: 0 25%;
    font-size: 0.75rem;
    color: var(--text-2);
    margin-top: 4px;
    position: relative;
}

.scale-labels span {
    transform: translateX(-50%);
    position: absolute;
}

.scale-labels span:nth-child(1) {
    left: 25%;
}

.scale-labels span:nth-child(2) {
    left: 50%;
}

.scale-labels span:nth-child(3) {
    left: 75%;
}

.range-labels {
    display: flex;
    margin-top: 1.5rem;
    font-size: 0.8rem;
    color: var(--text-2);
    justify-content: space-between;
}

.r-text {
    flex: 1;
    text-align: center;
}

.suggestion-box {
    background: var(--bg);
    padding: 1rem;
    border-radius: 12px;
    font-size: 0.95rem;
    color: var(--text);
    margin-top: 1rem;
}

.to-health {
    margin-top: 0.5rem;
}


.empty-state {
    text-align: center;
    padding: 2rem;
    color: var(--text-2);
}

.empty-state .el-icon {
    font-size: 3rem;
    margin-bottom: 0.5rem;
    opacity: 0.5;
}


.reference-card h3 {
    font-size: 1rem;
    margin-bottom: 1rem;
    text-align: center;
}

.ref-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
}

.ref-table td,
.ref-table th {
    padding: 0.75rem;
    border-bottom: 1px solid var(--bg);
    text-align: center;
}

.ref-table th {
    color: var(--text-2);
    font-weight: 500;
}

.dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;
}

.dot.thin {
    background: #3b82f6;
}

.dot.normal {
    background: #10b981;
}

.dot.heavy {
    background: #f59e0b;
}

.dot.fat {
    background: #ef4444;
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
