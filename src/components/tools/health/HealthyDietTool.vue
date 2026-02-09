<template>
    <div class="healthy-diet-tool">
        <nav class="nav-bar">
            <button class="nav-back" @click="$router.back()">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>健康饮食建议</h1>
                <span class="nav-subtitle">Dietary & Macros</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="layout-grid">
                
                <aside class="side-panel glass-card">
                    <h3 class="panel-title">目标设置</h3>
                    <el-form label-position="top">
                        <el-form-item label="您的目标">
                            <el-select v-model="form.goal" style="width: 100%">
                                <el-option label="减脂 (Fat Loss)" value="lose" />
                                <el-option label="维持 (Maintain)" value="maintain" />
                                <el-option label="增肌 (Muscle Gain)" value="gain" />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="每日卡路里目标 (kcal)">
                            <el-input-number
v-model="form.calories" :step="50" :min="1200" :max="5000"
                                style="width: 100%" />
                            <p class="hint">建议参考 TDEE 计算结果</p>
                        </el-form-item>
                        <el-form-item label="活动水平 (TEA)">
                            <el-select v-model="form.activity" style="width: 100%">
                                <el-option label="轻度 (1-2次/周)" value="light" />
                                <el-option label="中度 (3-5次/周)" value="moderate" />
                                <el-option label="强度 (6-7次/周)" value="heavy" />
                            </el-select>
                        </el-form-item>
                    </el-form>
                    <el-button type="primary" class="gen-btn" @click="generatePlan">刷新解析</el-button>
                </aside>

                
                <section class="main-workspace glass-card">
                    <div class="macro-summary">
                        <div
v-for="macro in macros" :key="macro.name" class="macro-card"
                            :style="{ borderColor: macro.color + '44' }">
                            <div class="macro-icon" :style="{ backgroundColor: macro.color }">{{ macro.icon }}</div>
                            <div class="macro-info">
                                <span class="label">{{ macro.name }}</span>
                                <span class="value">{{ macro.grams }} <small>g</small></span>
                                <span class="percent">{{ macro.percent }}%</span>
                            </div>
                        </div>
                    </div>

                    <div class="distribution-section">
                        <h4>三餐热量分配建议</h4>
                        <div class="meal-timeline">
                            <div v-for="meal in mealDistribution" :key="meal.label" class="meal-node">
                                <div class="meal-inner">
                                    <span class="label">{{ meal.label }}</span>
                                    <span class="kcal">{{ Math.round(form.calories * meal.ratio) }} kcal</span>
                                </div>
                                <div
class="meal-bar"
                                    :style="{ width: meal.ratio * 200 + '%', backgroundColor: '#3b82f6' }"></div>
                            </div>
                        </div>
                    </div>

                    <div class="diet-tips">
                        <el-collapse v-model="activeNames">
                            <el-collapse-item title="优质碳水化合物建议" name="1">
                                <div class="source-grid">
                                    <span>糙米、燕麦、地瓜、全麦面包、玉米、藜麦等复合碳水。</span>
                                </div>
                            </el-collapse-item>
                            <el-collapse-item title="优质蛋白质建议" name="2">
                                <div class="source-grid">
                                    <span>鸡胸肉、瘦牛肉、鸡蛋、鱼虾、希腊酸奶、大豆制品。</span>
                                </div>
                            </el-collapse-item>
                            <el-collapse-item title="健康脂肪建议" name="3">
                                <div class="source-grid">
                                    <span>牛油果、初榨橄榄油、原味坚果、深海鱼油。</span>
                                </div>
                            </el-collapse-item>
                        </el-collapse>
                    </div>
                </section>
            </div>
        </main>

        <div class="disclaimer-wrap" style="padding: 0 1.5rem 2rem; text-align: center;">
            <div
class="disclaimer-card"
                style="display: inline-flex; gap: 0.8rem; padding: 1rem; background: #eff6ff; color: #1e40af; border-radius: 12px; font-size: 0.8rem; align-items: start; text-align: left; border: 1px solid #dbeafe;">
                <el-icon style="margin-top: 2px;">
                    <InfoFilled />
                </el-icon>
                <span>营养建议基于通用模型计算，不考虑个人疾病或特殊身体状况。严格的饮食计划应在注册营养师指导下进行。</span>
            </div>
        </div>

        <footer class="footer">
            © 2026 LRM工具箱 - 健康饮食建议
        </footer>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Back, InfoFilled } from '@element-plus/icons-vue'

const router = useRouter()

const form = reactive({
    goal: 'maintain',
    calories: 2000,
    activity: 'moderate'
})

const activeNames = ref(['1'])

const macros = computed(() => {
    let ratios = { p: 0.25, c: 0.5, f: 0.25 }
    if (form.goal === 'lose') {
        ratios = { p: 0.35, c: 0.35, f: 0.3 }
    } else if (form.goal === 'gain') {
        ratios = { p: 0.3, c: 0.5, f: 0.2 }
    }

    return [
        { name: '蛋白质', grams: Math.round((form.calories * ratios.p) / 4), percent: ratios.p * 100, color: '#f43f5e', icon: '🥩' },
        { name: '碳水', grams: Math.round((form.calories * ratios.c) / 4), percent: ratios.c * 100, color: '#f59e0b', icon: '🍚' },
        { name: '脂肪', grams: Math.round((form.calories * ratios.f) / 9), percent: ratios.f * 100, color: '#10b981', icon: '🥑' }
    ]
})

const mealDistribution = [
    { label: '早餐 (Breakfast)', ratio: 0.3 },
    { label: '午餐 (Lunch)', ratio: 0.4 },
    { label: '晚餐 (Dinner)', ratio: 0.2 },
    { label: '加餐 (Snack)', ratio: 0.1 }
]

const generatePlan = () => {
    
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

.healthy-diet-tool {
    --bg: #f8fafc;
    --card: #ffffff;
    --border: #e2e8f0;
    --text: #1e293b;
    --text-2: #64748b;

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
}

.nav-center h1 {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
}

.nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-2);
    text-transform: uppercase;
    display: block;
    text-align: center;
}

.main-content {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
}

.layout-grid {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 2rem;
}

.glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.panel-title {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    font-weight: 600;
}

.hint {
    font-size: 0.75rem;
    color: var(--text-2);
    margin-top: 0.25rem;
}

.gen-btn {
    width: 100%;
    border-radius: 10px;
    margin-top: 1rem;
}

.macro-summary {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 3rem;
}

.macro-card {
    padding: 1.5rem;
    border: 1px solid;
    border-radius: 16px;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.macro-icon {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
}

.macro-info {
    display: flex;
    flex-direction: column;
}

.macro-info .label {
    font-size: 0.8rem;
    color: var(--text-2);
}

.macro-info .value {
    font-size: 1.25rem;
    font-weight: 700;
}

.macro-info .percent {
    font-size: 0.75rem;
    font-weight: 600;
    opacity: 0.7;
}

.distribution-section {
    margin-bottom: 2.5rem;
    background: #f1f5f9;
    padding: 2rem;
    border-radius: 16px;
}

.meal-timeline {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.meal-node {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.meal-inner {
    display: flex;
    justify-content: space-between;
    font-size: 0.875rem;
}

.meal-inner .kcal {
    font-weight: 700;
    color: #3b82f6;
}

.meal-bar {
    height: 6px;
    border-radius: 3px;
    opacity: 0.6;
}

.source-grid {
    padding: 0.5rem;
    color: var(--text);
    font-size: 0.875rem;
    line-height: 1.6;
}

@media (max-width: 768px) {
    .layout-grid {
        grid-template-columns: 1fr;
    }

    .macro-summary {
        grid-template-columns: 1fr;
    }
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
