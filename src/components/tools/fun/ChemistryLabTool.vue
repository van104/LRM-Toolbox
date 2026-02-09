<template>
    <div class="chemistry-tool">
        <nav class="nav-bar">
            <button class="nav-back" @click="$router.back()">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>化学实验室</h1>
                <span class="nav-subtitle">Chemistry Lab Sim</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="lab-bench">
                
                <div class="shelf glass-card">
                    <h3>元素架</h3>
                    <div class="elements-grid">
                        <div
v-for="elem in availableElements" :key="elem.id" class="element-item"
                            :style="{ borderColor: elem.color }" draggable="true" @click="addToBeaker(elem)"
                            @dragstart="handleDragStart($event, elem)">
                            <div class="elem-preview" :style="{ background: elem.color }"></div>
                            <span class="elem-name">{{ elem.name }}</span>
                            <span class="elem-symbol">{{ elem.symbol }}</span>
                        </div>
                    </div>
                </div>

                
                <div class="experiment-area">
                    <div class="beaker-container" @dragover.prevent @drop="handleDrop">
                        <div class="beaker">
                            
                            <div class="beaker-contents">
                                <transition-group name="liquid-layer">
                                    <div
v-for="(item, index) in beakerItems" :key="index" class="liquid-layer" :style="{
                                        backgroundColor: item.color,
                                        height: `${100 / Math.max(beakerItems.length, 1)}%`
                                    }"></div>
                                </transition-group>

                                
                                <div
v-if="isMixed && beakerItems.length > 0" class="mixed-liquid"
                                    :style="{ backgroundColor: mixedColor, opacity: 0.9 }"></div>

                                
                                <div v-if="activeEffect === 'bubbles'" class="effect-bubbles">
                                    <div v-for="n in 10" :key="n" class="bubble"></div>
                                </div>
                                <div v-if="activeEffect === 'explosion'" class="effect-explosion">💥</div>
                                <div v-if="activeEffect === 'steam'" class="effect-steam">☁️</div>
                            </div>
                            
                            <div class="markings"></div>
                        </div>
                        <div class="beaker-base"></div>
                    </div>

                    <div class="controls">
                        <button class="action-btn" :disabled="beakerItems.length < 2" @click="mixContents">
                            <el-icon>
                                <Refresh />
                            </el-icon> 搅拌混合
                        </button>
                        <button class="action-btn danger" :disabled="beakerItems.length === 0" @click="emptyBeaker">
                            <el-icon>
                                <Delete />
                            </el-icon> 清空烧杯
                        </button>
                    </div>
                </div>

                
                <div class="journal glass-card">
                    <h3>实验记录</h3>
                    <div ref="logContainer" class="log-list">
                        <div v-if="logs.length === 0" class="empty-log">暂无实验记录</div>
                        <div v-for="(log, index) in logs" :key="index" class="log-entry" :class="log.type">
                            <span class="time">[{{ log.time }}]</span>
                            <span class="content">{{ log.message }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - 趣味化学模拟
        </footer>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { Back, Delete, Refresh, MagicStick } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'


const availableElements = [
    { id: 'water', name: '水', symbol: 'H₂O', color: '#409eff', type: 'liquid' },
    { id: 'oil', name: '油', symbol: 'Oil', color: '#e6a23c', type: 'liquid' },
    { id: 'vinegar', name: '醋', symbol: 'CH₃COOH', color: '#ffffff', type: 'liquid' },
    { id: 'soda', name: '小苏打', symbol: 'NaHCO₃', color: '#f2f6fc', type: 'powder' },
    { id: 'red_dye', name: '红色素', symbol: 'Red', color: '#f56c6c', type: 'liquid' },
    { id: 'blue_dye', name: '蓝色素', symbol: 'Blue', color: '#409eff', type: 'liquid' },
    { id: 'yellow_dye', name: '黄色素', symbol: 'Yel', color: '#ffff00', type: 'liquid' },
    { id: 'magic', name: '神秘粉末', symbol: '???', color: '#9c27b0', type: 'powder' }
]

const beakerItems = ref([])
const logs = ref([])
const activeEffect = ref(null)
const isMixed = ref(false)
const mixedColor = ref('transparent')
const logContainer = ref(null)


const handleDragStart = (e, item) => {
    e.dataTransfer.setData('itemId', item.id)
}

const handleDrop = (e) => {
    const itemId = e.dataTransfer.getData('itemId')
    const item = availableElements.find(el => el.id === itemId)
    if (item) {
        addToBeaker(item)
    }
}


const addToBeaker = (item) => {
    if (beakerItems.value.length >= 5) {
        ElMessage.warning('烧杯满了！请先清空或混合。')
        return
    }

    beakerItems.value.push({ ...item })
    isMixed.value = false 
    addLog(`加入了 ${item.name}`, 'normal')

    
    checkImmediateReactions()
}

const emptyBeaker = () => {
    beakerItems.value = []
    isMixed.value = false
    activeEffect.value = null
    mixedColor.value = 'transparent'
    addLog('清空了烧杯', 'info')
}

const mixContents = () => {
    if (beakerItems.value.length < 2) return

    isMixed.value = true

    
    
    

    const reaction = checkReactions()

    if (reaction) {
        mixedColor.value = reaction.color
        addLog(reaction.message, 'success')
        if (reaction.effect) triggerEffect(reaction.effect)
    } else {
        
        mixedColor.value = calculateAverageColor(beakerItems.value)
        addLog('混合成了不明液体...', 'normal')
    }
}

const checkImmediateReactions = () => {
    
    

    const ids = beakerItems.value.map(i => i.id)

    
    if (ids.includes('vinegar') && ids.includes('soda') && !activeEffect.value) {
        triggerEffect('bubbles')
        addLog('反应生成了大量二氧化碳气泡！', 'success')
        
        
    }
}

const checkReactions = () => {
    const ids = beakerItems.value.map(i => i.id).sort().join('+')

    
    

    const has = (id) => beakerItems.value.some(i => i.id === id)
    const count = beakerItems.value.length

    
    if (has('red_dye') && has('blue_dye') && count === 2) {
        return { color: '#8e44ad', message: '混合生成了紫色液体！', effect: null }
    }
    if (has('red_dye') && has('yellow_dye') && count === 2) {
        return { color: '#e67e22', message: '混合生成了橙色液体！', effect: null }
    }
    if (has('blue_dye') && has('yellow_dye') && count === 2) {
        return { color: '#2ecc71', message: '混合生成了绿色液体！', effect: null }
    }

    
    if (has('water') && has('oil')) {
        return { color: '#d4ac0d', message: '油和水难以混合，形成了乳浊液', effect: null }
    }

    
    if (has('water') && has('magic')) {
        return { color: '#00ffff', message: '生成了发光的魔法药水！', effect: 'steam' }
    }
    if (has('red_dye') && has('magic')) {
        return { color: '#ff0000', message: 'BOOM！不稳定的红色炸药！', effect: 'explosion' }
    }

    if (has('vinegar') && has('soda')) {
        return { color: '#ffffff', message: '剧烈的酸碱中和反应！', effect: 'bubbles' }
    }

    return null
}

const triggerEffect = (effect) => {
    activeEffect.value = effect
    setTimeout(() => {
        activeEffect.value = null
    }, 2000)
}

const calculateAverageColor = (items) => {
    
    
    
    return '#7f8c8d' 
}

const addLog = (msg, type = 'normal') => {
    const now = new Date()
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
    logs.value.unshift({ time: timeStr, message: msg, type })

    
    if (logs.value.length > 20) logs.value.pop()
}

</script>

<style scoped>
.chemistry-tool {
    --bg: #f5f7fa;
    --card: #ffffff;
    --primary: #409eff;
    --text: #2c3e50;
    --text-sec: #7f8c8d;

    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    min-height: 100vh;
    background: var(--bg);
    display: flex;
    flex-direction: column;
    user-select: none;
}


.nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    height: 60px;
    background: var(--card);
    border-bottom: 1px solid #eef2f7;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: var(--text-sec);
    cursor: pointer;
    font-size: 0.95rem;
}

.nav-back:hover {
    color: var(--primary);
}

.nav-center {
    text-align: center;
}

.nav-center h1 {
    font-size: 1.15rem;
    margin: 0;
    color: var(--text);
}

.nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-sec);
    text-transform: uppercase;
    display: block;
    margin-top: 1px;
}

.nav-spacer {
    width: 60px;
}

.main-content {
    flex: 1;
    display: flex;
    justify-content: center;
    padding: 2rem;
    overflow: hidden;
}

.lab-bench {
    display: grid;
    grid-template-columns: 240px 1fr 280px;
    grid-template-rows: minmax(0, 1fr);
    
    gap: 2rem;
    width: 100%;
    max-width: 1100px;
    height: 600px;
    
}


.glass-card {
    background: var(--card);
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    min-height: 0;
    
    overflow: hidden;
    
}

h3 {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    color: var(--text);
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #f0f2f5;
    flex-shrink: 0;
    
}


.elements-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    overflow-y: auto;
    padding-right: 5px;
}

.element-item {
    background: #fdfdfd;
    border: 2px solid #eee;
    border-radius: 8px;
    padding: 10px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
}

.element-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.elem-preview {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.1);
}

.elem-name {
    font-size: 0.9rem;
    font-weight: bold;
}

.elem-symbol {
    font-size: 0.7rem;
    color: #999;
}


.experiment-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    
    background: var(--card);
    border-radius: 16px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
    
    padding: 1rem;
    
    overflow: hidden;
    
    min-height: 0;
    
}

.beaker-container {
    position: relative;
    width: 200px;
    height: 300px;
}

.beaker {
    position: relative;
    width: 160px;
    height: 240px;
    border: 3px solid #e0e0e0;
    border-top: none;
    border-radius: 0 0 20px 20px;
    margin: 0 auto;
    background: rgba(255, 255, 255, 0.5);
    
    overflow: hidden;
    box-shadow: inset 0 -5px 15px rgba(0, 0, 0, 0.05);
    z-index: 10;
}

.beaker-contents {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column-reverse;
    
}

.liquid-layer {
    width: 100%;
    transition: height 0.5s ease;
}

.mixed-liquid {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transition: background-color 1s ease;
}

.markings {
    position: absolute;
    top: 20px;
    right: 10px;
    bottom: 20px;
    width: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    pointer-events: none;
    opacity: 0.3;
}

.markings::before,
.markings::after {
    content: '-';
    color: #000;
    font-weight: bold;
    display: block;
    text-align: right;
}

.beaker-base {
    width: 180px;
    height: 10px;
    background: #dcdfe6;
    border-radius: 5px;
    margin: 5px auto 0;
    opacity: 0.5;
}


.effect-bubbles {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: visible;
}

.bubble {
    position: absolute;
    bottom: -10px;
    width: 10px;
    height: 10px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 50%;
    animation: rise 2s infinite ease-in;
    left: 50%;
}

.bubble:nth-child(1) {
    left: 20%;
    animation-delay: 0s;
}

.bubble:nth-child(2) {
    left: 40%;
    animation-delay: 0.2s;
}

.bubble:nth-child(3) {
    left: 60%;
    animation-delay: 0.5s;
}

.bubble:nth-child(4) {
    left: 80%;
    animation-delay: 0.1s;
    animation-duration: 2.5s;
}

.bubble:nth-child(5) {
    left: 30%;
    animation-delay: 0.7s;
}

@keyframes rise {
    0% {
        transform: translateY(0) scale(1);
        opacity: 0;
    }

    20% {
        opacity: 1;
    }

    100% {
        transform: translateY(-200px) scale(1.5);
        opacity: 0;
    }
}

.effect-explosion {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 5rem;
    animation: explode 0.5s ease-out forwards;
}

@keyframes explode {
    0% {
        transform: translate(-50%, -50%) scale(0);
        opacity: 1;
    }

    100% {
        transform: translate(-50%, -50%) scale(2);
        opacity: 0;
    }
}

.effect-steam {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    font-size: 3rem;
    text-align: center;
    animation: steam 2s infinite linear;
    opacity: 0;
}

@keyframes steam {
    0% {
        transform: translateY(0);
        opacity: 0.6;
    }

    100% {
        transform: translateY(-100px);
        opacity: 0;
    }
}

.controls {
    display: flex;
    gap: 1rem;
}

.action-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.8rem 1.5rem;
    border: none;
    border-radius: 8px;
    background: var(--primary);
    color: white;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.2s;
}

.action-btn:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-2px);
}

.action-btn:disabled {
    background: #dcdfe6;
    cursor: not-allowed;
}

.action-btn.danger {
    background: #f56c6c;
}


.log-list {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    
    font-size: 0.85rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.log-entry {
    padding: 0.5rem;
    background: #f9fafc;
    border-left: 3px solid #dcdfe6;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
}

.log-entry.success {
    border-left-color: #67c23a;
    background: #f0f9eb;
}

.log-entry.info {
    border-left-color: #909399;
}

.time {
    font-size: 0.7rem;
    color: #999;
    margin-bottom: 2px;
}

.content {
    color: var(--text);
}

.empty-log {
    text-align: center;
    color: #ccc;
    margin-top: 2rem;
}

.footer {
    text-align: center;
    padding: 1rem 0;
    color: #999;
    font-size: 0.9rem;
    border-top: 1px solid #eef2f7;
    background: var(--card);
}
</style>
