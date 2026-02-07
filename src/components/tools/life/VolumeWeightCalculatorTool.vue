<template>
    <div class="volume-weight-tool">
        <nav class="nav-bar">
            <button @click="$router.back()" class="nav-back">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>快递体积重量计算器</h1>
                <span class="nav-subtitle">Volume Weight Calculator</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="calculator-card glass-card">
                
                <div class="input-section">
                    <div class="section-title">包裹尺寸 (cm)</div>
                    <div class="dimension-inputs">
                        <div class="input-group">
                            <label>长</label>
                            <input type="number" v-model.number="length" placeholder="0" />
                        </div>
                        <div class="x-sign">×</div>
                        <div class="input-group">
                            <label>宽</label>
                            <input type="number" v-model.number="width" placeholder="0" />
                        </div>
                        <div class="x-sign">×</div>
                        <div class="input-group">
                            <label>高</label>
                            <input type="number" v-model.number="height" placeholder="0" />
                        </div>
                    </div>

                    <div class="weight-row">
                        <div class="input-group">
                            <label>实际重量 (kg)</label>
                            <input type="number" v-model.number="actualWeight" placeholder="0" />
                        </div>
                        <div class="input-group">
                            <label>抛比系数</label>
                            <select v-model.number="divisor">
                                <option value="6000">6000 (大多数快递)</option>
                                <option value="5000">5000 (DHL/FedEx/UPS)</option>
                                <option value="8000">8000 (部分零担物流)</option>
                            </select>
                        </div>
                    </div>
                </div>

                
                <div class="result-section">
                    <div class="result-card volumetric">
                        <div class="card-label">体积重量</div>
                        <div class="card-value">{{ formatWeight(volumeWeight) }} <small>kg</small></div>
                        <div class="card-desc">计算公式: 长×宽×高 / {{ divisor }}</div>
                    </div>

                    <div class="result-card chargeable" :class="{ highlight: chargeableWeight > 0 }">
                        <div class="card-label">计费重量</div>
                        <div class="card-value">{{ formatWeight(chargeableWeight) }} <small>kg</small></div>
                        <div class="card-tag" v-if="chargeableWeight > 0">
                            {{ isVolumetric ? '按体积重计费 (抛货)' : '按实重计费' }}
                        </div>
                    </div>
                </div>

                
                <div class="comparison-info" v-if="chargeableWeight > 0">
                    <div class="info-row">
                        <span>体积:</span>
                        <span>{{ (length * width * height / 1000000).toFixed(4) }} m³</span>
                    </div>
                    <div class="info-row" v-if="isVolumetric">
                        <span>额外付费重量:</span>
                        <span class="danger">+{{ formatWeight(volumeWeight - actualWeight) }} kg</span>
                    </div>
                </div>
            </div>

            <div class="tips-card">
                <el-icon>
                    <InfoFilled />
                </el-icon>
                <div class="tip-content">
                    <p>说明：当体积重量大于实际重量时，物品被称为“抛货”或“泡货”，快递公司将按体积重量收费。</p>
                    <p>国内快递通常除以 6000，国际四大快递（DHL/UPS/FedEx/TNT）通常除以 5000。</p>
                </div>
            </div>
        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - 快递体积重量计算器
        </footer>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Back, InfoFilled } from '@element-plus/icons-vue'

const length = ref('')
const width = ref('')
const height = ref('')
const actualWeight = ref('')
const divisor = ref(6000)

const volumeWeight = computed(() => {
    const l = parseFloat(length.value) || 0
    const w = parseFloat(width.value) || 0
    const h = parseFloat(height.value) || 0
    if (l <= 0 || w <= 0 || h <= 0) return 0
    return (l * w * h) / divisor.value
})

const chargeableWeight = computed(() => {
    const actual = parseFloat(actualWeight.value) || 0
    const vol = volumeWeight.value
    if (actual <= 0 && vol <= 0) return 0
    return Math.max(actual, vol)
})

const isVolumetric = computed(() => {
    return volumeWeight.value > (parseFloat(actualWeight.value) || 0)
})

const formatWeight = (val) => {
    return val.toFixed(2)
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

.volume-weight-tool {
    --bg: #faf9f7;
    --card: #ffffff;
    --border: #e8e6e3;
    --text: #1a1a1a;
    --text-2: #6b6b6b;
    --accent: #2563eb;
    --success: #10b981;
    --warning: #f59e0b;

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
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.input-section {
    margin-bottom: 2rem;
}

.section-title {
    font-size: 0.9rem;
    color: var(--text-2);
    margin-bottom: 0.75rem;
    font-weight: 600;
}

.dimension-inputs {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
}

.input-group {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.input-group label {
    font-size: 0.8rem;
    color: var(--text-2);
    margin-bottom: 0.4rem;
}

.input-group input,
.input-group select {
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 1.1rem;
    text-align: center;
    background: #fdfdfd;
    outline: none;
    width: 100%;
    
    min-width: 0;
    
}

.input-group input:focus,
.input-group select:focus {
    border-color: var(--accent);
}

.x-sign {
    padding-bottom: 0.8rem;
    color: var(--text-2);
    font-size: 1.2rem;
}

.weight-row {
    display: flex;
    gap: 1.5rem;
}


.result-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.result-card {
    background: #f9f9f9;
    padding: 1rem;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    border: 1px solid transparent;
}

.result-card.volumetric {
    border-color: var(--border);
}

.result-card.chargeable.highlight {
    background: #eff6ff;
    border-color: var(--accent);
    color: var(--accent);
}

.card-label {
    font-size: 0.85rem;
    color: var(--text-2);
    margin-bottom: 0.5rem;
}

.card-value {
    font-size: 1.5rem;
    font-weight: 700;
}

.card-value small {
    font-size: 0.9rem;
    font-weight: normal;
}

.card-desc {
    font-size: 0.7rem;
    color: var(--text-2);
    margin-top: 0.5rem;
}

.card-tag {
    margin-top: 0.5rem;
    font-size: 0.7rem;
    background: white;
    padding: 2px 8px;
    border-radius: 10px;
    border: 1px solid currentColor;
}

.comparison-info {
    border-top: 1px dashed var(--border);
    padding-top: 1rem;
    font-size: 0.9rem;
}

.info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    color: var(--text-2);
}

.danger {
    color: #ef4444;
    font-weight: 600;
}

.tips-card {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: rgba(37, 99, 235, 0.05);
    
    color: var(--accent);
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

@media (max-width: 480px) {
    .result-section {
        grid-template-columns: 1fr;
    }
}
</style>
