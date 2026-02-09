<template>
    <div class="vision-test-tool">
        <nav class="nav-bar">
            <button class="nav-back" @click="$router.back()">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>视力自我监测</h1>
                <span class="nav-subtitle">Vision & Eye Care</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <el-tabs v-model="activeTab" class="custom-tabs">
                
                <el-tab-pane label="视力自测" name="test">
                    <div class="test-area glass-card">
                        <div class="test-selector">
                            <el-radio-group v-model="currentTest" size="large">
                                <el-radio-button value="color">色盲测试</el-radio-button>
                                <el-radio-button value="astigmatism">散光测试</el-radio-button>
                                <el-radio-button value="grid">阿姆斯勒网格</el-radio-button>
                            </el-radio-group>
                        </div>

                        <div class="test-viewport">
                            
                            <div v-if="currentTest === 'color'" class="test-card">
                                <div class="plate-container">
                                    <img :src="colorPlates[currentPlate].url" class="test-img" />
                                    <div class="plate-nav">
                                        <el-button
:disabled="currentPlate === 0" circle icon="ArrowLeft"
                                            @click="prevPlate"></el-button>
                                        <span class="plate-indicator">{{ currentPlate + 1 }} / {{ colorPlates.length
                                        }}</span>
                                        <el-button
:disabled="currentPlate === colorPlates.length - 1"
                                            circle icon="ArrowRight"
                                            @click="nextPlate"></el-button>
                                    </div>
                                </div>
                                <div class="test-info">
                                    <h4>色盲检查 (第 {{ currentPlate + 1 }} 张)</h4>
                                    <p>请识别图中的数字。如果您无法识别，可能存在红绿色盲/色弱。</p>
                                    <div class="ans-box">
                                        <el-button type="primary" link @click="showAns = !showAns">
                                            {{ showAns ? '隐藏答案' : '查看答案' }}
                                        </el-button>
                                        <span v-if="showAns" class="ans-text">答案是：{{ colorPlates[currentPlate].ans
                                        }}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div v-if="currentTest === 'astigmatism'" class="test-card">
                                <div class="astigmatism-chart">
                                    <div
v-for="n in 12" :key="n" class="line"
                                        :style="{ transform: `rotate(${(n - 1) * 30}deg)` }"></div>
                                </div>
                                <div class="test-info">
                                    <h4>散光检测图</h4>
                                    <p>请单眼观察，注视图中心。如果您感觉某些线条比其他线条更粗、更黑，可能存在散光。</p>
                                </div>
                            </div>
                            
                            <div v-if="currentTest === 'grid'" class="test-card">
                                <div class="amsler-grid"></div>
                                <div class="test-info">
                                    <h4>阿姆斯勒方格表</h4>
                                    <p>用于检测黄斑病变。请注视中心黑点。如果您发现网格线条出现扭曲、断裂或有黑影遮挡，请及时就医。</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </el-tab-pane>

                
                <el-tab-pane label="护眼计时器" name="timer">
                    <div class="timer-area glass-card">
                        <div class="timer-visual">
                            <el-progress
type="circle" :percentage="timerPercent" :stroke-width="12" :color="timerColor"
                                :width="200">
                                <template #default>
                                    <div class="timer-display">
                                        <span class="time">{{ formattedTime }}</span>
                                        <span class="status">{{ timerStatus }}</span>
                                    </div>
                                </template>
                            </el-progress>
                        </div>

                        <div class="timer-controls">
                            <el-button type="primary" size="large" @click="toggleTimer">
                                {{ timerRunning ? '暂停' : (timerStatus === '工作' ? '开始专注' : '开始远眺') }}
                            </el-button>
                            <el-button size="large" @click="resetTimer">重置</el-button>
                        </div>

                        <div class="rule-box">
                            <h4>20-20-20 规则</h4>
                            <p>科学护眼：每看屏幕 <strong>20分钟</strong>，请放松并由窗外远眺 <strong>20英尺</strong> (约6米) 外的目标
                                <strong>20秒</strong>。
                            </p>
                        </div>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </main>

        <div class="disclaimer-wrap" style="padding: 0 1.5rem 2rem; text-align: center;">
            <div
class="disclaimer-card"
                style="display: inline-flex; gap: 0.8rem; padding: 1rem; background: #fff7ed; color: #9a3412; border-radius: 12px; font-size: 0.8rem; align-items: start; text-align: left; border: 1px solid #ffedd5;">
                <el-icon style="margin-top: 2px;">
                    <InfoFilled />
                </el-icon>
                <span>以上工具仅供初步自我筛查参考，不能替代专业的医疗诊断。如感眼部严重不适、视力骤降，请立即咨询专业眼科医生。</span>
            </div>
        </div>

        <footer class="footer">
            © 2026 LRM工具箱 - 视力自我监测
        </footer>
    </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Back, InfoFilled } from '@element-plus/icons-vue'
import { ElNotification } from 'element-plus'

const router = useRouter()

const activeTab = ref('test')
const currentTest = ref('color')
const showAns = ref(false)

const currentPlate = ref(0)
const colorPlates = [
    { url: 'https://img.lrm123.site/i/2026/02/02/xdr6xs.jpg', ans: '78' },
    { url: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Ishihara_9.png', ans: '74' },
    { url: 'https://img.lrm123.site/i/2026/02/02/xdr5nc.png', ans: '5' },
    { url: 'https://img.lrm123.site/i/2026/02/02/xdrcoc.webp', ans: '12' }
]

const nextPlate = () => {
    if (currentPlate.value < colorPlates.length - 1) {
        currentPlate.value++
        showAns.value = false
    }
}

const prevPlate = () => {
    if (currentPlate.value > 0) {
        currentPlate.value--
        showAns.value = false
    }
}


const timerRunning = ref(false)
const timeLeft = ref(20 * 60)
const timerStatus = ref('工作')
let interval = null

const timerPercent = computed(() => {
    const total = timerStatus.value === '工作' ? 20 * 60 : 20
    return ((total - timeLeft.value) / total) * 100
})

const timerColor = computed(() => {
    return timerStatus.value === '工作' ? '#2563eb' : '#10b981'
})

const formattedTime = computed(() => {
    const m = Math.floor(timeLeft.value / 60)
    const s = timeLeft.value % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
})

const toggleTimer = () => {
    if (timerRunning.value) {
        clearInterval(interval)
        timerRunning.value = false
    } else {
        timerRunning.value = true
        interval = setInterval(() => {
            if (timeLeft.value > 0) {
                timeLeft.value--
            } else {
                handleTimerEnd()
            }
        }, 1000)
    }
}

const handleTimerEnd = () => {
    clearInterval(interval)
    timerRunning.value = false

    if (timerStatus.value === '工作') {
        ElNotification({
            title: '护眼提醒',
            message: '工作了20分钟，请起身远眺 20 秒吧！',
            type: 'success',
            duration: 0
        })
        timerStatus.value = '放松'
        timeLeft.value = 20
        toggleTimer()
    } else {
        ElNotification({
            title: '休息完成',
            message: '休息结束，可以继续工作了。',
            type: 'info'
        })
        timerStatus.value = '工作'
        timeLeft.value = 20 * 60
    }
}

const resetTimer = () => {
    clearInterval(interval)
    timerRunning.value = false
    timerStatus.value = '工作'
    timeLeft.value = 20 * 60
}

onUnmounted(() => clearInterval(interval))
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

.vision-test-tool {
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
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
}

.glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.test-viewport {
    margin-top: 2.5rem;
    display: flex;
    justify-content: center;
}

.test-card {
    text-align: center;
    width: 100%;
}

.plate-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.test-img {
    max-width: 320px;
    width: 100%;
    border-radius: 50%;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.plate-nav {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.plate-indicator {
    font-size: 0.9rem;
    color: var(--text-2);
    font-weight: 600;
}

.test-info h4 {
    margin-bottom: 1rem;
    color: var(--text);
}

.test-info p {
    color: var(--text-2);
    line-height: 1.6;
    margin-bottom: 1rem;
}

.ans-text {
    font-weight: 700;
    color: #2563eb;
    margin-left: 1rem;
}


.astigmatism-chart {
    width: 280px;
    height: 280px;
    border: 1px solid var(--border);
    border-radius: 50%;
    position: relative;
    margin: 0 auto 2rem;
}

.astigmatism-chart::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 8px;
    height: 8px;
    background: #334155;
    border-radius: 50%;
    transform: translate(-50%, -50%);
}

.astigmatism-chart .line {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 1px;
    height: 260px;
    background: #64748b;
    transform-origin: center;
    margin-top: -130px;
}


.amsler-grid {
    width: 280px;
    height: 280px;
    background-image: linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px);
    background-size: 14px 14px;
    border: 1px solid #334155;
    position: relative;
    margin: 0 auto 2rem;
}

.amsler-grid::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 6px;
    height: 6px;
    background: #000;
    border-radius: 50%;
    transform: translate(-50%, -50%);
}


.timer-area {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.timer-visual {
    margin: 2rem 0;
}

.timer-display {
    display: flex;
    flex-direction: column;
}

.timer-display .time {
    font-size: 3rem;
    font-weight: 700;
    font-family: monospace;
}

.timer-display .status {
    font-size: 0.9rem;
    color: var(--text-2);
}

.timer-controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 2.5rem;
}

.rule-box {
    text-align: left;
    padding: 1.5rem;
    background: #eff6ff;
    border-radius: 12px;
    border-left: 4px solid #3b82f6;
}

.rule-box h4 {
    margin-top: 0;
    color: #1e40af;
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
