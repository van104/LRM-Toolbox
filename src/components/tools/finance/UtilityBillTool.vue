<template>
    <div class="utility-bill-tool">
        <nav class="nav-bar">
            <button @click="$router.back()" class="nav-back">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>电费/水费计算器</h1>
                <span class="nav-subtitle">Bill Estimator</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="mode-switch">
                <button :class="{ active: type === 'electric' }" @click="type = 'electric'">
                    <el-icon>
                        <Lightning />
                    </el-icon> 电费
                </button>
                <button :class="{ active: type === 'water' }" @click="type = 'water'">
                    <el-icon>
                        <ColdDrink />
                    </el-icon> 水费
                </button>
            </div>

            <div class="bill-card glass-card">
                
                <div class="input-section">
                    <label>{{ type === 'electric' ? '月度用电量 (kWh)' : '月度用水量 (m³)' }}</label>
                    <div class="main-input-wrapper">
                        <input type="number" v-model.number="usage" placeholder="0" class="hg-input" />
                        <span class="unit">{{ type === 'electric' ? '度' : '方' }}</span>
                    </div>
                </div>

                
                <div class="config-section">
                    <div class="config-header">
                        <span>计费模式</span>
                        <select v-model="calcMode">
                            <option value="flat">单一单价</option>
                            <option value="ladder">阶梯计价</option>
                        </select>
                    </div>

                    
                    <div v-if="calcMode === 'flat'" class="flat-config">
                        <div class="input-row">
                            <span class="label">单价</span>
                            <input type="number" v-model.number="flatPrice" />
                            <span class="curr">元/{{ type === 'electric' ? '度' : '方' }}</span>
                        </div>
                    </div>

                    
                    <div v-else class="ladder-config">
                        <div v-for="(level, idx) in ladders" :key="idx" class="ladder-row">
                            <div class="level-badge">档 {{ idx + 1 }}</div>
                            <div class="level-inputs">
                                <div class="range">
                                    <span v-if="idx === 0">0 ~ </span>
                                    <span v-else>{{ ladders[idx - 1].limit }} ~ </span>

                                    <input type="number" v-if="idx < ladders.length - 1" v-model.number="level.limit"
                                        class="limit-input" />
                                    <span v-else>∞</span>
                                </div>
                                <div class="price-input">
                                    <input type="number" v-model.number="level.price" placeholder="单价" />
                                    <span>元</span>
                                </div>
                            </div>
                            <div class="actions" v-if="idx === ladders.length - 1">
                                <el-icon class="add-btn" @click="addLadder" v-if="ladders.length < 5">
                                    <Plus />
                                </el-icon>
                                <el-icon class="del-btn" @click="removeLadder" v-if="ladders.length > 1">
                                    <Minus />
                                </el-icon>
                            </div>
                        </div>
                    </div>
                </div>

                
                <div class="result-display">
                    <div class="total-row">
                        <span>预计费用</span>
                        <div class="total-price">
                            <small>¥</small>{{ formatMoney(result.total) }}
                        </div>
                    </div>
                    <div class="detail-row" v-if="calcMode === 'ladder' && result.details.length > 0">
                        <div class="detail-title">费用明细：</div>
                        <div v-for="(d, i) in result.details" :key="i" class="d-item">
                            <span>第{{ i + 1 }}档 ({{ d.amount }}{{ type === 'electric' ? '度' : '方' }})</span>
                            <span>¥{{ formatMoney(d.cost) }}</span>
                        </div>
                    </div>
                </div>
            </div>

            
            <div class="tips-card">
                <el-icon>
                    <InfoFilled />
                </el-icon>
                <div class="tip-content">
                    <p>提示：阶梯电价通常按年或月累计，请根据当地政策调整档位上限。</p>
                    <p>租房常见收费：电费 1.0~1.5 元/度，水费 5~8 元/吨。</p>
                </div>
            </div>
        </main>

        <div class="disclaimer-wrap" style="max-width: 500px; margin: 0 auto; padding: 0 1.5rem 2rem;">
            <div class="disclaimer-card"
                style="display: flex; gap: 0.8rem; padding: 1rem; background: #fffbeb; color: #92400e; border-radius: 12px; font-size: 0.8rem; align-items: start;">
                <el-icon>
                    <InfoFilled />
                </el-icon>
                <span>本计算器结果仅供个人预算参考。由于阶梯计费的具体起始日期、公摊政策及各地单价差异，最终账单请以供给单位出具的缴费单为准。</span>
            </div>
        </div>

        <footer class="footer">
            © 2026 LRM工具箱 - 电费/水费计算器
        </footer>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Back, Lightning, ColdDrink, Plus, Minus, InfoFilled } from '@element-plus/icons-vue'

const type = ref('electric') 
const calcMode = ref('flat') 
const usage = ref('')
const flatPrice = ref(0.6)

const ladders = ref([
    { limit: 200, price: 0.5 },
    { limit: 400, price: 0.6 },
    { limit: null, price: 0.8 } 
])


watch(type, (v) => {
    if (v === 'electric') {
        flatPrice.value = 0.6
        ladders.value = [
            { limit: 240, price: 0.52 },
            { limit: 400, price: 0.57 },
            { limit: null, price: 0.82 }
        ]
    } else {
        flatPrice.value = 4.5
        ladders.value = [
            { limit: 15, price: 3.5 },
            { limit: 25, price: 4.8 },
            { limit: null, price: 6.5 }
        ]
    }
})

const addLadder = () => {
    
    const last = ladders.value[ladders.value.length - 1]
    const prev = ladders.value[ladders.value.length - 2] || { limit: 0, price: 0 }

    
    const newLimit = (prev.limit || 0) + 100
    ladders.value.splice(ladders.value.length - 1, 0, { limit: newLimit, price: last.price })
}

const removeLadder = () => {
    if (ladders.value.length > 1) {
        ladders.value.splice(ladders.value.length - 2, 1)
    }
}

const result = computed(() => {
    const u = parseFloat(usage.value) || 0
    if (calcMode.value === 'flat') {
        const p = parseFloat(flatPrice.value) || 0
        return { total: u * p, details: [] }
    } else {
        
        let remaining = u
        let totalCost = 0
        const details = []
        let prevLimit = 0

        for (let i = 0; i < ladders.value.length; i++) {
            if (remaining <= 0) break

            const level = ladders.value[i]
            const limit = level.limit
            const price = parseFloat(level.price) || 0

            
            
            const span = (limit === null) ? Infinity : (limit - prevLimit)

            
            const amount = Math.min(remaining, span)

            const cost = amount * price
            totalCost += cost
            details.push({ amount: amount.toFixed(1), cost, price })

            remaining -= amount
            if (limit !== null) prevLimit = limit
        }

        return { total: totalCost, details }
    }
})

const formatMoney = (val) => {
    if (val === undefined) return '0.00'
    return val.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

.utility-bill-tool {
    --bg: #faf9f7;
    --card: #ffffff;
    --border: #e8e6e3;
    --text: #1a1a1a;
    --text-2: #6b6b6b;
    --accent: #f59e0b;
    

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


.mode-switch {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin-bottom: 1rem;
}

.mode-switch button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1.5rem;
    border: 1px solid transparent;
    border-radius: 99px;
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    font-size: 1rem;
    color: var(--text-2);
    cursor: pointer;
    transition: all 0.2s;
}

.mode-switch button.active {
    background: var(--text);
    color: white;
    font-weight: 500;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.input-section {
    margin-bottom: 2rem;
    text-align: center;
}

.input-section label {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--text-2);
    font-size: 0.9rem;
}

.main-input-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.hg-input {
    width: 60%;
    font-size: 2.5rem;
    border: none;
    border-bottom: 2px solid var(--border);
    text-align: center;
    font-weight: 600;
    color: var(--text);
    outline: none;
    background: transparent;
}

.hg-input:focus {
    border-color: var(--accent);
}

.unit {
    font-size: 1.2rem;
    color: var(--text-2);
    margin-top: 1rem;
}

.config-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    font-size: 0.95rem;
    font-weight: 600;
}

.config-header select {
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid var(--border);
    font-size: 0.85rem;
    cursor: pointer;
}

.flat-config {
    padding: 1rem;
    background: #fdfdfd;
    border-radius: 8px;
    border: 1px solid var(--border);
}

.input-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.input-row input {
    width: 80px;
    padding: 4px 8px;
    border: 1px solid var(--border);
    border-radius: 4px;
    text-align: right;
}

.ladder-config {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.ladder-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #fdfdfd;
    padding: 0.5rem;
    border-radius: 6px;
    border: 1px solid var(--border);
}

.level-badge {
    background: var(--text);
    color: white;
    font-size: 0.7rem;
    padding: 2px 6px;
    border-radius: 4px;
    white-space: nowrap;
}

.level-inputs {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.9rem;
}

.range input {
    width: 50px;
    padding: 2px 4px;
    border: 1px solid var(--border);
    text-align: center;
    border-radius: 3px;
}

.price-input input {
    width: 50px;
    padding: 2px 4px;
    border: 1px solid var(--border);
    text-align: right;
    border-radius: 3px;
    margin-right: 2px;
}

.actions {
    display: flex;
    gap: 4px;
}

.actions .el-icon {
    padding: 2px;
    background: #eee;
    border-radius: 50%;
    cursor: pointer;
    font-size: 0.8rem;
}


.result-display {
    margin-top: 2rem;
    border-top: 1px dashed var(--border);
    padding-top: 1.5rem;
}

.total-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 1rem;
}

.total-price {
    font-size: 2rem;
    font-weight: 700;
    color: var(--accent);
    line-height: 1;
}

.total-price small {
    font-size: 1rem;
    font-weight: normal;
    margin-right: 2px;
}

.detail-row {
    font-size: 0.85rem;
    color: var(--text-2);
    background: #f9f9f9;
    padding: 0.75rem;
    border-radius: 8px;
}

.d-item {
    display: flex;
    justify-content: space-between;
    margin-top: 4px;
}


.tips-card {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: rgba(245, 158, 11, 0.1);
    color: #b45309;
    border-radius: 8px;
    font-size: 0.85rem;
    line-height: 1.5;
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
