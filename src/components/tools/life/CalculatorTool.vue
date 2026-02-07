<template>
    <div class="calculator-tool">
        <nav class="nav-bar">
            <button @click="$router.back()" class="nav-back">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>科学计算器</h1>
                <span class="nav-subtitle">Scientific Calculator</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="calculator-body glass-card">
                
                <div class="display-screen">
                    <div class="history-line">{{ historyStr }}</div>
                    <div class="current-line" :class="{ 'small-text': currentVal.length > 10 }">{{ currentVal || '0' }}
                    </div>
                </div>

                
                <div class="keypad">
                    
                    <div class="key-row">
                        <button class="btn fn" @click="handleMem('MC')">MC</button>
                        <button class="btn fn" @click="handleMem('MR')">MR</button>
                        <button class="btn fn" @click="handleMem('M+')">M+</button>
                        <button class="btn fn" @click="handleMem('M-')">M-</button>
                        <button class="btn fn" @click="toggleMode" :class="{ active: isScientific }">Sci</button>
                    </div>

                    
                    <div class="scientific-keys" v-if="isScientific">
                        <button class="btn science" @click="op('sin')">sin</button>
                        <button class="btn science" @click="op('cos')">cos</button>
                        <button class="btn science" @click="op('tan')">tan</button>
                        <button class="btn science" @click="op('log')">log</button>
                        <button class="btn science" @click="op('ln')">ln</button>
                        <button class="btn science" @click="op('sqrt')">√</button>
                        <button class="btn science" @click="op('pow')">x^y</button>
                        <button class="btn science" @click="op('pi')">π</button>
                        <button class="btn science" @click="op('e')">e</button>
                        <button class="btn science" @click="op('(')">(</button>
                        <button class="btn science" @click="op(')')">)</button>
                    </div>

                    
                    <div class="main-keys">
                        <button class="btn action ac" @click="clearAll">AC</button>
                        <button class="btn action" @click="backspace"><el-icon>
                                <Back />
                            </el-icon></button>
                        <button class="btn action" @click="op('%')">%</button>
                        <button class="btn operator" @click="op('/')">÷</button>

                        <button class="btn num" @click="append('7')">7</button>
                        <button class="btn num" @click="append('8')">8</button>
                        <button class="btn num" @click="append('9')">9</button>
                        <button class="btn operator" @click="op('*')">×</button>

                        <button class="btn num" @click="append('4')">4</button>
                        <button class="btn num" @click="append('5')">5</button>
                        <button class="btn num" @click="append('6')">6</button>
                        <button class="btn operator" @click="op('-')">-</button>

                        <button class="btn num" @click="append('1')">1</button>
                        <button class="btn num" @click="append('2')">2</button>
                        <button class="btn num" @click="append('3')">3</button>
                        <button class="btn operator" @click="op('+')">+</button>

                        <button class="btn num zero" @click="append('0')">0</button>
                        <button class="btn num" @click="append('.')">.</button>
                        <button class="btn equals" @click="calculate">=</button>
                    </div>
                </div>
            </div>

            
            <div class="calc-history glass-card">
                <h3>计算历史</h3>
                <ul class="history-list">
                    <li v-for="(rec, i) in historyList" :key="i">
                        <span class="expr">{{ rec.expr }}</span>
                        <span class="eq">=</span>
                        <span class="res" @click="currentVal = rec.res">{{ rec.res }}</span>
                    </li>
                    <li v-if="historyList.length === 0" class="empty">暂无记录</li>
                </ul>
                <button v-if="historyList.length" class="clear-hist-btn" @click="historyList = []">清空记录</button>
            </div>
        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - 科学计算器
        </footer>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Back } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'


const currentVal = ref('') 
const historyStr = ref('') 
const isScientific = ref(false)
const memory = ref(0)
const historyList = ref([])


const clearAll = () => {
    currentVal.value = ''
    historyStr.value = ''
}

const backspace = () => {
    currentVal.value = currentVal.value.slice(0, -1)
}

const append = (char) => {
    if (char === '.' && currentVal.value.includes('.')) return
    if (currentVal.value === '0' && char !== '.') currentVal.value = char
    else currentVal.value += char
}

const op = (operator) => {
    
    if (operator === 'pi') { currentVal.value = Math.PI.toFixed(8); return }
    if (operator === 'e') { currentVal.value = Math.E.toFixed(8); return }

    
    if (currentVal.value) {
        historyStr.value += currentVal.value + ' ' + operator + ' '
        currentVal.value = ''
    } else if (historyStr.value && ['+', '-', '*', '/'].includes(operator)) {
        
        
        
        historyStr.value += operator + ' '
    } else {
        historyStr.value += operator + ' '
    }
}

const calculate = () => {
    let expr = historyStr.value + currentVal.value
    
    
    
    
    expr = expr.replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/log/g, 'Math.log10')
        .replace(/ln/g, 'Math.log')
        .replace(/sqrt/g, 'Math.sqrt')
        .replace(/\^/g, '**') 

    
    
    expr = expr.replace(/(\d+)%/g, '($1/100)')

    try {
        
        
        const res = new Function('return ' + expr)()

        
        let finalRes = parseFloat(res.toPrecision(12)) 
        
        finalRes = finalRes.toString()

        
        historyList.value.unshift({ expr: historyStr.value + currentVal.value, res: finalRes })
        if (historyList.value.length > 10) historyList.value.pop()

        currentVal.value = finalRes
        historyStr.value = ''
    } catch (e) {
        ElMessage.error('表达式错误')
    }
}

const toggleMode = () => isScientific.value = !isScientific.value

const handleMem = (action) => {
    const val = parseFloat(currentVal.value) || 0
    switch (action) {
        case 'MC': memory.value = 0; ElMessage.info('Memory Cleared'); break;
        case 'MR': currentVal.value = memory.value.toString(); break;
        case 'M+': memory.value += val; ElMessage.success('M+'); break;
        case 'M-': memory.value -= val; ElMessage.success('M-'); break;
    }
}


const handleKeydown = (e) => {
    const key = e.key
    if (/\d/.test(key)) append(key)
    if (['+', '-', '*', '/'].includes(key)) op(key)
    if (key === 'Enter' || key === '=') calculate()
    if (key === 'Backspace') backspace()
    if (key === 'Escape') clearAll()
    if (key === '.') append('.')
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');

.calculator-tool {
    --bg: #faf9f7;
    --card: #ffffff;
    --border: #e8e6e3;
    --text: #1a1a1a;
    --screen-bg: #f3f4f6;
    --key-bg: #ffffff;
    --key-hover: #f9fafb;
    --accent: #2563eb;
    --op-color: #f59e0b;
    
    --fn-color: #6b7280;

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
    color: var(--fn-color);
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
    color: var(--fn-color);
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
    gap: 2rem;
}

.glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 24px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.calculator-body {
    padding: 1.5rem;
    background: #1f2937;
    
    color: white;
}

.display-screen {
    background: transparent;
    text-align: right;
    margin-bottom: 1.5rem;
    min-height: 100px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    word-break: break-all;
}

.history-line {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1rem;
    color: #9ca3af;
    min-height: 1.5rem;
}

.current-line {
    font-family: 'JetBrains Mono', monospace;
    font-size: 3.5rem;
    font-weight: 300;
    line-height: 1.1;
}

.current-line.small-text {
    font-size: 2rem;
}


.keypad {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.key-row {
    display: flex;
    gap: 12px;
}

.btn {
    flex: 1;
    height: 60px;
    border-radius: 50px;
    
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    transition: filter 0.2s;
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn:active {
    filter: brightness(0.9);
}



.btn.num {
    background: #374151;
    color: white;
}

.btn.num.zero {
    flex: 2;
    
    justify-content: flex-start;
    padding-left: 28px;
}


.btn.fn {
    background: #9ca3af;
    color: black;
    font-size: 1rem;
    font-weight: 600;
}

.btn.fn.active {
    background: white;
}


.btn.operator {
    background: #f59e0b;
    color: white;
    font-size: 1.5rem;
}

.btn.equals {
    background: #f59e0b;
    color: white;
}


.btn.action {
    background: #9ca3af;
    color: black;
}


.scientific-keys {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
    margin-bottom: 4px;
}

.btn.science {
    background: #4b5563;
    color: white;
    height: 40px;
    font-size: 0.9rem;
    border-radius: 20px;
}


.main-keys {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
}



.btn.zero {
    grid-column: span 2;
    border-radius: 50px;
}


.calc-history {
    padding: 1.5rem;
    background: var(--card);
}

.history-list {
    list-style: none;
    padding: 0;
    margin: 1rem 0;
    max-height: 200px;
    overflow-y: auto;
}

.history-list li {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.9rem;
}

.res {
    color: var(--accent);
    cursor: pointer;
    font-weight: 700;
}

.clear-hist-btn {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--border);
    background: white;
    color: var(--fn-color);
    cursor: pointer;
    border-radius: 8px;
}

.footer {
    text-align: center;
    padding: 2rem;
    color: var(--text);
    font-size: 0.85rem;
    margin-top: 2rem;
    opacity: 0.6;
}
</style>
