<template>
    <div class="decision-maker">
        <nav class="nav-bar">
            <button class="nav-back" @click="$router.back()">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>随机决策</h1>
                <span class="nav-subtitle">Decision Maker</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <div class="tool-container">
            <div class="main-layout">
                
                <div class="wheel-section card">
                    <div class="wheel-wrapper">
                        <div class="pointer" :style="{ transform: `translateX(-50%) rotate(${pointerRotation}deg)` }">
                        </div>
                        <canvas ref="canvasRef" width="500" height="500" class="wheel-canvas"></canvas>

                        <div class="center-button" :disabled="isSpinning" @click="spin">
                            <span>{{ isSpinning ? '转动中' : '开始' }}</span>
                        </div>
                    </div>

                    <div v-if="result" class="result-show animation-fade-in">
                        <el-tag type="success" size="large" effect="dark" class="result-tag">
                            🎉 结果：{{ result }}
                        </el-tag>
                    </div>
                </div>

                
                <div class="options-section card">
                    <div class="section-title">
                        <el-icon>
                            <Edit />
                        </el-icon> 决策选项
                    </div>

                    <div class="preset-buttons">
                        <el-button size="small" @click="loadPreset('food')">中午吃啥</el-button>
                        <el-button size="small" @click="loadPreset('truth')">真心话</el-button>
                        <el-button size="small" @click="loadPreset('dare')">大冒险</el-button>
                        <el-button size="small" @click="loadPreset('number')">随机数</el-button>
                    </div>

                    <div class="options-list custom-scroll">
                        <div v-for="(opt, index) in options" :key="index" class="option-item">
                            <el-input v-model="options[index]" placeholder="输入选项内容">
                                <template #append>
                                    <el-button :disabled="options.length <= 2" @click="removeOption(index)">
                                        <el-icon>
                                            <Delete />
                                        </el-icon>
                                    </el-button>
                                </template>
                            </el-input>
                        </div>
                    </div>

                    <div class="action-buttons">
                        <el-button type="primary" plain class="add-btn" @click="addOption">
                            <el-icon>
                                <Plus />
                            </el-icon> 添加选项
                        </el-button>
                        <el-button type="info" plain @click="clearOptions">清空</el-button>
                    </div>
                </div>
            </div>
        </div>
        <footer class="footer">
            © 2026 LRM工具箱 - 随机决策
        </footer>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { Back, Edit, Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const canvasRef = ref(null)
const options = ref(['披萨', '火锅', '烤肉', '麻辣烫', '汉堡', '寿司'])
const isSpinning = ref(false)
const result = ref('')
const pointerRotation = ref(0)
const rotation = ref(0)

const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7D794', '#778BEB', '#786FA6', '#F8A5C2', '#63CDDA'
]

const presets = {
    food: ['披萨', '火锅', '烤肉', '麻辣烫', '汉堡', '寿司', '盖饭', '面条'],
    truth: ['你的初恋是什么时候？', '最糗的一件事是什么？', '手机里最近的一条短信内容？', '最不喜欢的人是谁？'],
    dare: ['模仿一个著名的明星', '向第5个联系人发“我喜欢你”', '绕场跑一圈', '做10个俯卧撑'],
    number: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
}

const drawWheel = () => {
    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 10
    const angleStep = (Math.PI * 2) / options.value.length

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    options.value.forEach((opt, i) => {
        const startAngle = i * angleStep
        const endAngle = (i + 1) * angleStep

        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius, startAngle, endAngle)
        ctx.fillStyle = colors[i % colors.length]
        ctx.fill()
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()

        
        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(startAngle + angleStep / 2)
        ctx.textAlign = 'right'
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 18px Inter, sans-serif'
        ctx.fillText(opt, radius - 30, 8)
        ctx.restore()
    })

    
    ctx.beginPath()
    ctx.arc(centerX, centerY, 40, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'
    ctx.fill()
}

const spin = () => {
    if (isSpinning.value || options.value.length < 2) return

    isSpinning.value = true
    result.value = ''

    const spinRotation = 1800 + Math.random() * 3600 
    const startTime = performance.now()
    const duration = 4000 

    const animate = (currentTime) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        
        const ease = 1 - Math.pow(1 - progress, 3)
        const currentRotation = ease * spinRotation

        const canvas = canvasRef.value
        if (canvas) {
            canvas.style.transform = `rotate(${currentRotation}deg)`
        }

        if (progress < 1) {
            requestAnimationFrame(animate)
        } else {
            isSpinning.value = false
            
            const finalRotation = currentRotation % 360
            const anglePerOption = 360 / options.value.length
            
            
            
            
            
            let index = Math.floor((360 - (finalRotation % 360) + 270) % 360 / anglePerOption)
            result.value = options.value[index]
            ElMessage.success(`🎉 结果是：${result.value}`)
        }
    }

    requestAnimationFrame(animate)
}

const addOption = () => {
    options.value.push('')
    nextTick(() => {
        drawWheel()
    })
}

const removeOption = (index) => {
    options.value.splice(index, 1)
}

const clearOptions = () => {
    options.value = ['', '']
}

const loadPreset = (type) => {
    options.value = [...presets[type]]
}

watch(options, () => {
    drawWheel()
}, { deep: true })

onMounted(() => {
    drawWheel()
})
</script>

<style scoped>
.decision-maker {
    min-height: 100vh;
    background: var(--el-bg-color-page);
    display: flex;
    flex-direction: column;
}

.nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color-lighter);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
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
    color: var(--el-text-color-regular);
    cursor: pointer;
    font-size: 0.9rem;
    padding: 0.5rem 0;
    transition: color 0.2s;
}

.nav-back:hover {
    color: var(--el-color-primary);
}

.nav-center {
    text-align: center;
}

.nav-center h1 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
    color: var(--el-text-color-primary);
}

.nav-subtitle {
    font-size: 0.7rem;
    color: var(--el-text-color-secondary);
    text-transform: uppercase;
    display: block;
    margin-top: 2px;
}

.tool-container {
    padding: 24px;
    flex: 1;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
}

.main-layout {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 24px;
}

.card {
    background: var(--el-bg-color);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.wheel-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 600px;
    position: relative;
}

.wheel-wrapper {
    position: relative;
    width: 500px;
    height: 500px;
}

.wheel-canvas {
    width: 500px;
    height: 500px;
    transition: transform 0s cubic-bezier(0.2, 0, 0, 1);
}

.pointer {
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 60px;
    background: #f5222d;
    clip-path: polygon(50% 100%, 0 0, 100% 0);
    z-index: 10;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.center-button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80px;
    height: 80px;
    background: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    z-index: 20;
    font-weight: bold;
    font-size: 18px;
    color: #333;
    transition: transform 0.2s;
}

.center-button:hover {
    transform: translate(-50%, -50%) scale(1.1);
}

.center-button:active {
    transform: translate(-50%, -50%) scale(0.95);
}

.result-show {
    margin-top: 40px;
}

.result-tag {
    font-size: 24px;
    padding: 20px 40px;
    border-radius: 12px;
}

.options-section {
    display: flex;
    flex-direction: column;
}

.section-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.preset-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 20px;
}

.options-list {
    flex: 1;
    overflow-y: auto;
    padding-right: 8px;
    margin-bottom: 20px;
    max-height: 400px;
}

.option-item {
    margin-bottom: 12px;
}

.action-buttons {
    display: flex;
    gap: 12px;
}

.add-btn {
    flex: 1;
}

.animation-fade-in {
    animation: fadeIn 0.5s ease-out;
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

.custom-scroll::-webkit-scrollbar {
    width: 6px;
}

.custom-scroll::-webkit-scrollbar-thumb {
    background: var(--el-border-color);
    border-radius: 3px;
}

@media (max-width: 1024px) {
    .main-layout {
        grid-template-columns: 1fr;
    }

    .wheel-wrapper {
        width: 350px;
        height: 350px;
    }

    .wheel-canvas {
        width: 350px;
        height: 350px;
    }
}

.footer {
    text-align: center;
    padding: 2rem;
    color: var(--el-text-color-secondary);
    font-size: 0.85rem;
    border-top: 1px solid var(--el-border-color-lighter);
    background: var(--el-bg-color);
}
</style>
