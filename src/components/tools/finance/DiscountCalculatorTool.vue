<template>
    <div class="discount-calculator-tool">
        <nav class="nav-bar">
            <button class="nav-back" @click="$router.back()">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>折扣计算器</h1>
                <span class="nav-subtitle">Discount Calculator</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            
            <div class="mode-tabs glass-card">
                <button :class="['tab-btn', { active: mode === 'single' }]" @click="mode = 'single'">
                    <el-icon>
                        <PriceTag />
                    </el-icon> 单品折扣
                </button>
                <button :class="['tab-btn', { active: mode === 'pool' }]" @click="mode = 'pool'">
                    <el-icon>
                        <ShoppingCart />
                    </el-icon> 满减凑单
                </button>
            </div>

            
            <section v-if="mode === 'single'" class="calculator-card glass-card">
                <div class="input-form">
                    <div class="form-group">
                        <label>原价 (¥)</label>
                        <input v-model.number="originalPrice" type="number" placeholder="0.00" class="main-input" />
                    </div>

                    <div class="form-group">
                        <label>折扣力度</label>
                        <div class="discount-input-group">
                            <input
v-model.number="discountValue" type="number" placeholder="例如 8.5"
                                class="sub-input" />
                            <div class="toggle-type">
                                <span :class="{ active: discountType === 'zhe' }" @click="discountType = 'zhe'">折</span>
                                <span
:class="{ active: discountType === 'percent' }"
                                    @click="discountType = 'percent'">% off</span>
                            </div>
                        </div>
                        <div class="quick-select">
                            <span @click="setDiscount(9)">9折</span>
                            <span @click="setDiscount(8.5)">85折</span>
                            <span @click="setDiscount(8)">8折</span>
                            <span @click="setDiscount(7)">7折</span>
                            <span @click="setDiscount(5)">半价</span>
                        </div>
                    </div>
                </div>

                <div v-if="originalPrice > 0" class="result-display">
                    <div class="final-price-box">
                        <span class="label">折后价</span>
                        <div class="price">
                            <span class="symbol">¥</span>
                            {{ formatMoney(singleResult.final) }}
                        </div>
                    </div>

                    <div class="saved-info">
                        <div class="saved-badge">
                            已省 ¥{{ formatMoney(singleResult.saved) }}
                        </div>
                        <div class="real-rate">
                            实付 {{ singleResult.realRate }}折
                        </div>
                    </div>
                </div>
            </section>

            
            <section v-else class="calculator-card glass-card">
                <div class="pool-header">
                    <div class="form-group">
                        <label>活动规则</label>
                        <div class="rule-inputs">
                            <span class="prefix">满</span>
                            <input v-model.number="poolRule.threshold" type="number" placeholder="300" />
                            <span class="middle">减</span>
                            <input v-model.number="poolRule.reduce" type="number" placeholder="50" />
                        </div>
                        
                        <div class="rule-option">
                            <label class="checkbox-label">
                                <input v-model="poolRule.isLoop" type="checkbox"> 每满{{ poolRule.threshold || 300 }}减{{
                                poolRule.reduce || 50 }}
                            </label>
                        </div>
                    </div>
                </div>

                <div class="items-list">
                    <div class="list-label">商品列表</div>
                    <div v-for="(item, idx) in poolItems" :key="idx" class="item-row">
                        <input v-model="item.name" type="text" :placeholder="`商品 ${idx + 1}`" class="item-name" />
                        <div class="item-price-wrapper">
                            <span>¥</span>
                            <input
v-model.number="item.price" type="number" placeholder="0"
                                @input="checkNewItem(idx)" />
                        </div>
                        <button v-if="poolItems.length > 1" class="del-btn" @click="delItem(idx)">
                            <el-icon>
                                <Delete />
                            </el-icon>
                        </button>
                    </div>
                    <button class="add-item-btn" @click="addItem">
                        <el-icon>
                            <Plus />
                        </el-icon> 添加商品
                    </button>
                </div>

                <div class="pool-result">
                    <div class="pool-summary">
                        <div class="p-row">
                            <span>商品总额</span>
                            <span class="val">¥{{ formatMoney(poolResult.total) }}</span>
                        </div>
                        <div class="p-row highlight">
                            <span>优惠金额</span>
                            <span class="val">- ¥{{ formatMoney(poolResult.discount) }}</span>
                        </div>
                        <div class="p-row total">
                            <span>实付金额</span>
                            <span class="val">¥{{ formatMoney(poolResult.final) }}</span>
                        </div>
                    </div>

                    <div v-if="poolResult.nextThreshold > 0" class="pool-tips">
                        <el-icon>
                            <Warning />
                        </el-icon>
                        <span>
                            再凑 <b>¥{{ formatMoney(poolResult.diff) }}</b>
                            可减 <b>¥{{ formatMoney(poolResult.nextReduce) }}</b>
                        </span>
                    </div>
                    <div v-else-if="poolResult.total > 0" class="pool-tips success">
                        <el-icon>
                            <CircleCheck />
                        </el-icon>
                        <span>已达成满减优惠！相当于 {{ poolResult.rate }} 折</span>
                    </div>
                </div>
            </section>
        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - 折扣计算器
        </footer>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Back, PriceTag, ShoppingCart, Delete, Plus, Warning, CircleCheck } from '@element-plus/icons-vue'

const mode = ref('single') 


const originalPrice = ref('')
const discountValue = ref(8) 
const discountType = ref('zhe') 

const setDiscount = (val) => {
    discountValue.value = val
    discountType.value = 'zhe'
}

const singleResult = computed(() => {
    const p = parseFloat(originalPrice.value) || 0
    const d = parseFloat(discountValue.value) || 0

    let final = 0
    if (discountType.value === 'zhe') {
        
        final = p * (d / 10)
    } else {
        
        final = p * ((100 - d) / 100)
    }

    const saved = p - final
    const realRate = p > 0 ? ((final / p) * 10).toFixed(1) : '0'

    return { final, saved, realRate }
})


const poolRule = ref({
    threshold: 300,
    reduce: 50,
    isLoop: true 
})

const poolItems = ref([
    { name: '', price: '' }
])

const checkNewItem = (idx) => {
    
}

const addItem = () => poolItems.value.push({ name: '', price: '' })
const delItem = (idx) => poolItems.value.splice(idx, 1)

const poolResult = computed(() => {
    const total = poolItems.value.reduce((acc, item) => acc + (parseFloat(item.price) || 0), 0)
    const T = parseFloat(poolRule.value.threshold) || 0
    const R = parseFloat(poolRule.value.reduce) || 0

    let discount = 0
    let nextThreshold = 0
    let diff = 0
    let nextReduce = 0

    if (T > 0 && R > 0) {
        if (poolRule.value.isLoop) {
            
            const count = Math.floor(total / T)
            discount = count * R

            
            nextThreshold = (count + 1) * T
            diff = nextThreshold - total
            nextReduce = R 
        } else {
            
            if (total >= T) {
                discount = R
                nextThreshold = 0
            } else {
                nextThreshold = T
                diff = T - total
                nextReduce = R
            }
        }
    }

    const final = total - discount
    const rate = total > 0 ? ((final / total) * 10).toFixed(1) : 0

    return {
        total,
        discount,
        final,
        nextThreshold,
        diff,
        nextReduce,
        rate
    }
})

const formatMoney = (val) => {
    if (val === undefined || isNaN(val)) return '0.00'
    return val.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

.discount-calculator-tool {
    --bg: #faf9f7;
    --card: #ffffff;
    --border: #e8e6e3;
    --text: #1a1a1a;
    --text-2: #6b6b6b;
    --accent: #f59e0b;
    
    --accent-light: #fffbeb;
    --red: #ef4444;
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
    max-width: 600px;
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
    padding: 0.5rem;
    gap: 0.5rem;
}

.tab-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem;
    border: none;
    background: transparent;
    color: var(--text-2);
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s;
}

.tab-btn.active {
    background: var(--accent-light);
    color: var(--accent);
    font-weight: 600;
}


.input-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.form-group label {
    display: block;
    font-size: 0.9rem;
    color: var(--text-2);
    margin-bottom: 0.5rem;
}

.main-input {
    width: 100%;
    padding: 1rem;
    font-size: 1.5rem;
    border: 1px solid var(--border);
    border-radius: 12px;
    font-weight: 600;
}

.discount-input-group {
    display: flex;
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
}

.sub-input {
    flex: 1;
    border: none;
    padding: 1rem;
    font-size: 1.2rem;
    outline: none;
}

.toggle-type {
    display: flex;
    background: var(--bg);
}

.toggle-type span {
    padding: 0 1rem;
    display: flex;
    align-items: center;
    cursor: pointer;
    color: var(--text-2);
    font-size: 0.9rem;
    border-left: 1px solid var(--border);
}

.toggle-type span.active {
    background: var(--accent);
    color: white;
}

.quick-select {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.75rem;
    flex-wrap: wrap;
}

.quick-select span {
    padding: 4px 12px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 20px;
    font-size: 0.85rem;
    cursor: pointer;
    color: var(--text-2);
}

.quick-select span:hover {
    border-color: var(--accent);
    color: var(--accent);
}

.result-display {
    text-align: center;
    border-top: 1px solid var(--border);
    padding-top: 2rem;
}

.final-price-box .label {
    font-size: 0.9rem;
    color: var(--text-2);
}

.final-price-box .price {
    font-size: 3rem;
    font-weight: 700;
    color: var(--red);
    line-height: 1.1;
    margin: 0.5rem 0;
}

.final-price-box .symbol {
    font-size: 1.5rem;
    font-weight: 400;
    margin-right: 4px;
}

.saved-info {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 1rem;
}

.saved-badge {
    background: #fef2f2;
    color: var(--red);
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 500;
}

.real-rate {
    background: #fffbeb;
    color: var(--accent);
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 0.9rem;
}


.pool-header {
    margin-bottom: 2rem;
}

.rule-inputs {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
}

.rule-inputs input {
    width: 80px;
    padding: 0.5rem;
    text-align: center;
    border: 1px solid var(--border);
    border-radius: 6px;
    font-weight: 600;
}

.rule-option {
    margin-top: 0.75rem;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: var(--text-2);
    cursor: pointer;
}

.items-list {
    margin-bottom: 2rem;
}

.list-label {
    font-size: 0.9rem;
    color: var(--text-2);
    margin-bottom: 0.5rem;
}

.item-row {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
}

.item-name {
    flex: 2;
    padding: 0.5rem;
    border: 1px solid var(--border);
    border-radius: 6px;
    font-size: 0.9rem;
}

.item-price-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 0 0.5rem;
    background: white;
}

.item-price-wrapper span {
    color: var(--text-2);
    margin-right: 4px;
}

.item-price-wrapper input {
    width: 100%;
    border: none;
    outline: none;
    font-size: 0.9rem;
    font-weight: 600;
}

.del-btn {
    width: 36px;
    background: white;
    border: 1px solid var(--border);
    color: var(--text-2);
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.add-item-btn {
    width: 100%;
    margin-top: 0.5rem;
    padding: 0.5rem;
    background: var(--bg);
    border: 1px dashed var(--border);
    color: var(--text-2);
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s;
}

.add-item-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
}

.pool-result {
    border-top: 1px solid var(--border);
    padding-top: 1.5rem;
}

.pool-summary {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.p-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.95rem;
    color: var(--text-2);
}

.p-row.highlight .val {
    color: var(--red);
}

.p-row.total {
    margin-top: 0.5rem;
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--text);
    padding-top: 0.5rem;
    border-top: 1px dashed var(--border);
}

.pool-tips {
    margin-top: 1.5rem;
    background: #fffbeb;
    color: var(--accent);
    padding: 0.75rem;
    border-radius: 8px;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.pool-tips.success {
    background: #ecfdf5;
    color: var(--green);
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
