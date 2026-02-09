<template>
    <div class="bmr-advanced-tool">
        <nav class="nav-bar">
            <button class="nav-back" @click="$router.back()">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>BMR 高阶版计算</h1>
                <span class="nav-subtitle">Advanced BMR & TDEE</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="layout-grid">
                
                <aside class="side-panel glass-card">
                    <h3 class="panel-title">个人数据</h3>
                    <el-form label-position="top">
                        <el-form-item label="性别">
                            <el-radio-group v-model="form.gender">
                                <el-radio-button value="male">男</el-radio-button>
                                <el-radio-button value="female">女</el-radio-button>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="年龄 (岁)">
                            <el-input-number v-model="form.age" :min="10" :max="100" style="width: 100%" />
                        </el-form-item>
                        <el-form-item label="身高 (cm)">
                            <el-input-number v-model="form.height" :min="100" :max="250" style="width: 100%" />
                        </el-form-item>
                        <el-form-item label="体重 (kg)">
                            <el-input-number
v-model="form.weight" :min="30" :max="250" :precision="1"
                                style="width: 100%" />
                        </el-form-item>
                        <el-form-item label="体脂率 (%) [可选]">
                            <el-input-number
v-model="form.bodyFat" :min="3" :max="60" :precision="1"
                                style="width: 100%" placeholder="输入后自动切换高精度公式" />
                        </el-form-item>
                        <el-form-item label="日常活动量">
                            <el-select v-model="form.activity" style="width: 100%">
                                <el-option label="极少运动 (x1.2)" :value="1.2" />
                                <el-option label="少量运动 (x1.375)" :value="1.375" />
                                <el-option label="中等运动 (x1.55)" :value="1.55" />
                                <el-option label="积极运动 (x1.725)" :value="1.725" />
                                <el-option label="运动员级 (x1.9)" :value="1.9" />
                            </el-select>
                        </el-form-item>
                    </el-form>
                </aside>

                
                <section class="main-analysis glass-card">
                    <div class="result-summary">
                        <div class="tdee-display">
                            <span class="label">每日总能量消耗 (TDEE)</span>
                            <span class="value">{{ Math.round(results.tdee) }} <small>kcal</small></span>
                            <p class="desc">维持当前体重的建议热量摄入</p>
                        </div>

                        <div class="comparison-grid">
                            <div class="bmr-card">
                                <h4>Mifflin-St Jeor</h4>
                                <div class="bmr-val">{{ Math.round(results.bmrMS) }}<span>kcal/d</span></div>
                                <p>国际通用标准计算公式</p>
                            </div>
                            <div class="bmr-card" :class="{ 'inactive': !form.bodyFat }">
                                <h4>Katch-McArdle</h4>
                                <div class="bmr-val">{{ form.bodyFat ? Math.round(results.bmrKM) : '--'
                                    }}<span>kcal/d</span>
                                </div>
                                <p>基于瘦体重，体脂已知时更准</p>
                            </div>
                        </div>
                    </div>

                    <el-divider>目标热量建议</el-divider>

                    <div class="goal-grid">
                        <div class="goal-item fat-loss">
                            <div class="goal-header">🎯 减脂 (Fat Loss)</div>
                            <div class="range">{{ Math.round(results.tdee - 500) }} - {{ Math.round(results.tdee - 300)
                                }}
                                kcal</div>
                            <p>建议形成每日 300-500kcal 的缺口</p>
                        </div>
                        <div class="goal-item gain">
                            <div class="goal-header">⚡ 增肌 (Bulking)</div>
                            <div class="range">{{ Math.round(results.tdee + 200) }} - {{ Math.round(results.tdee + 400)
                                }}
                                kcal</div>
                            <p>阶梯式缓慢盈余，有助于控制脂肪增长</p>
                        </div>
                    </div>

                    <div class="expert-tips">
                        <h5>💡 知识小百科</h5>
                        <ul>
                            <li><strong>BMR</strong> 是维持基本生命活动（心跳、呼吸等）所需的最低能量。</li>
                            <li><strong>TEF 有效热量</strong>：高蛋白饮食会显著提高食物热效应。</li>
                            <li>Katch-McArdle 公式排除了体内脂肪组织的影响，计算结果通常更符合健身人群。</li>
                        </ul>
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
                <span>代谢率计算受激素水平、肌肉量、睡眠、补剂等多种动态因素影响，结果仅供理论推导与参考。</span>
            </div>
        </div>

        <footer class="footer">
            © 2026 LRM工具箱 - BMR 高阶计算
        </footer>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Back, InfoFilled } from '@element-plus/icons-vue'

const router = useRouter()

const form = reactive({
    gender: 'male',
    age: 25,
    height: 175,
    weight: 70,
    bodyFat: null,
    activity: 1.375
})

const results = computed(() => {
    let bmrMS = (10 * form.weight) + (6.25 * form.height) - (5 * form.age)
    bmrMS += (form.gender === 'male' ? 5 : -161)

    let bmrKM = 0
    if (form.bodyFat) {
        const lbm = form.weight * (1 - form.bodyFat / 100)
        bmrKM = 370 + (21.6 * lbm)
    }

    const baseBmr = (form.bodyFat && bmrKM > 0) ? bmrKM : bmrMS
    const tdee = baseBmr * form.activity
    return { bmrMS, bmrKM, tdee }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

.bmr-advanced-tool {
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

.tdee-display {
    text-align: center;
    padding: 2.5rem;
    background: #1e293b;
    color: #fff;
    border-radius: 20px;
    width: 100%;
    margin-bottom: 2rem;
}

.tdee-display .label {
    font-size: 0.85rem;
    opacity: 0.8;
}

.tdee-display .value {
    font-size: 3rem;
    font-weight: 800;
    display: block;
    margin: 0.5rem 0;
}

.tdee-display .value small {
    font-size: 1rem;
    opacity: 0.6;
}

.tdee-display .desc {
    font-size: 0.85rem;
    opacity: 0.7;
}

.comparison-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    width: 100%;
}

.bmr-card {
    padding: 1.5rem;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid var(--border);
}

.bmr-card.inactive {
    opacity: 0.5;
    filter: grayscale(1);
}

.bmr-card h4 {
    margin: 0 0 0.5rem;
    font-size: 0.85rem;
    color: var(--text-2);
}

.bmr-card .bmr-val {
    font-size: 1.5rem;
    font-weight: 700;
}

.bmr-card .bmr-val span {
    font-size: 0.75rem;
    color: var(--text-2);
    margin-left: 4px;
}

.bmr-card p {
    font-size: 0.7rem;
    color: var(--text-2);
    margin-top: 0.25rem;
}

.goal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin: 2rem 0;
}

.goal-item {
    padding: 1.5rem;
    border-radius: 16px;
    text-align: center;
}

.goal-item.fat-loss {
    background: #fff1f2;
    border: 1px solid #fecdd3;
    color: #e11d48;
}

.goal-item.gain {
    background: #f0fdf4;
    border: 1px solid #dcfce7;
    color: #16a34a;
}

.goal-header {
    font-weight: 700;
    margin-bottom: 1rem;
    font-size: 1rem;
}

.range {
    font-size: 1.5rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
}

.goal-item p {
    font-size: 0.75rem;
    opacity: 0.8;
    margin: 0;
}

.expert-tips {
    background: #f1f5f9;
    padding: 1.5rem;
    border-radius: 16px;
    margin-top: 2rem;
}

.expert-tips h5 {
    margin: 0 0 0.75rem;
}

.expert-tips ul {
    padding-left: 1.25rem;
    margin: 0;
    font-size: 0.875rem;
    color: #475569;
}

.expert-tips li {
    margin-bottom: 0.5rem;
}

@media (max-width: 800px) {
    .layout-grid {
        grid-template-columns: 1fr;
    }

    .comparison-grid,
    .goal-grid {
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
