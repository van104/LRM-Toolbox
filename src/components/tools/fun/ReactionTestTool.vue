<template>
    <div class="reaction-tool">
        <nav class="nav-bar">
            <button @click="$router.back()" class="nav-back">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>反应力测试</h1>
                <span class="nav-subtitle">Reaction Time</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="game-container glass-card">
                
                <div class="stats-panel" v-if="history.length > 0">
                    <div class="stat-item">
                        <span class="label">平均</span>
                        <span class="value">{{ averageScore }}<span class="unit">ms</span></span>
                    </div>
                    <div class="stat-item">
                        <span class="label">最佳</span>
                        <span class="value">{{ bestScore }}<span class="unit">ms</span></span>
                    </div>
                </div>

                
                <div class="test-area" :class="gameState" @mousedown="handleClick" @touchstart.prevent="handleClick">
                    <div class="state-icon">
                        <el-icon v-if="gameState === 'idle'">
                            <Pointer />
                        </el-icon>
                        <el-icon v-if="gameState === 'waiting'">
                            <MoreFilled />
                        </el-icon>
                        <el-icon v-if="gameState === 'ready'">
                            <Lightning />
                        </el-icon>
                        <el-icon v-if="gameState === 'result'">
                            <Timer />
                        </el-icon>
                        <el-icon v-if="gameState === 'early'">
                            <Warning />
                        </el-icon>
                    </div>

                    <div class="message-content">
                        <h2 v-if="gameState === 'idle'">点击开始测试</h2>
                        <p v-if="gameState === 'idle'">当背景变绿时，请尽快点击屏幕</p>

                        <h2 v-if="gameState === 'waiting'">等待变绿...</h2>

                        <h2 v-if="gameState === 'ready'">点击!!!</h2>

                        <div v-if="gameState === 'result'">
                            <div class="score-display">
                                <span class="score">{{ score }}</span>
                                <span class="ms">ms</span>
                            </div>
                            <p class="rank-text">超越了全球 {{ rankPercent }}% 的玩家</p>
                            <p class="comment">{{ comment }}</p>
                            <button class="retry-btn">点击任意处重试</button>
                        </div>

                        <h2 v-if="gameState === 'early'">太快了!</h2>
                        <p v-if="gameState === 'early'">请等到变为绿色再点击</p>
                    </div>
                </div>

                
                <div class="history-list" v-if="history.length > 0">
                    <h3>最近记录</h3>
                    <div class="list-container">
                        <div v-for="(rec, index) in history.slice().reverse().slice(0, 5)" :key="index"
                            class="history-item">
                            <span class="idx">#{{ history.length - index }}</span>
                            <span class="val">{{ rec }} ms</span>
                            <div class="bar" :style="{ width: Math.min(rec / 10, 100) + 'px' }"></div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - 反应力测试
        </footer>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Back, Pointer, MoreFilled, Lightning, Timer, Warning } from '@element-plus/icons-vue'


const gameState = ref('idle')
const score = ref(0)
const history = ref([])
let startTime = 0
let timeoutId = null


const averageScore = computed(() => {
    if (history.value.length === 0) return 0
    const sum = history.value.reduce((a, b) => a + b, 0)
    return Math.round(sum / history.value.length)
})

const bestScore = computed(() => {
    if (history.value.length === 0) return 0
    return Math.min(...history.value)
})

const rankPercent = computed(() => {
    
    
    
    
    
    
    const ms = score.value
    if (ms < 150) return 99
    if (ms > 1000) return 1
    
    
    
    let p = 75 - (ms - 250) * 0.2
    return Math.max(1, Math.min(99, Math.round(p)))
})

const comment = computed(() => {
    const ms = score.value
    if (ms < 180) return "神一般的反应速度！"
    if (ms < 220) return "职业选手水平！"
    if (ms < 280) return "非常优秀的反应！"
    if (ms < 350) return "普通人的正常水平。"
    if (ms < 500) return "是不是没睡醒？"
    return "网速看起来有点延迟..."
})


const handleClick = () => {
    switch (gameState.value) {
        case 'idle':
        case 'result':
        case 'early':
            startGame()
            break
        case 'waiting':
            handleEarlyClick()
            break
        case 'ready':
            handleSuccessClick()
            break
    }
}

const startGame = () => {
    gameState.value = 'waiting'

    
    const delay = 2000 + Math.random() * 3000

    timeoutId = setTimeout(() => {
        gameState.value = 'ready'
        startTime = performance.now()
    }, delay)
}

const handleEarlyClick = () => {
    clearTimeout(timeoutId)
    gameState.value = 'early'
}

const handleSuccessClick = () => {
    const endTime = performance.now()
    score.value = Math.round(endTime - startTime)
    gameState.value = 'result'
    history.value.push(score.value)
}

</script>

<style scoped>
.reaction-tool {
    --bg: #f5f7fa;
    --card: #ffffff;
    --text: #2c3e50;
    --text-light: #ffffff;
    --text-secondary: #7f8c8d;
    --primary: #409eff;
    --danger: #f56c6c;
    --success: #67c23a;
    --waiting: #ce4a4a;
    

    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    min-height: 100vh;
    background: var(--bg);
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

.nav-back,
.nav-spacer {
    width: 100px;
}

.nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 0.95rem;
    transition: color 0.2s;
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
    color: var(--text-secondary);
    text-transform: uppercase;
    display: block;
    margin-top: 1px;
}

.main-content {
    display: flex;
    justify-content: center;
    padding: 2rem 1rem;
    min-height: calc(100vh - 140px);
}

.glass-card {
    background: var(--card);
    border-radius: 20px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
    padding: 2rem;
    width: 100%;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    gap: 2rem;
}


.stats-panel {
    display: flex;
    justify-content: center;
    gap: 3rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.stat-item .label {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-bottom: 4px;
}

.stat-item .value {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--text);
}

.stat-item .unit {
    font-size: 0.8rem;
    font-weight: normal;
    color: var(--text-secondary);
    margin-left: 2px;
}


.test-area {
    width: 100%;
    height: 300px;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s;
    color: white;
    text-align: center;
    position: relative;
    overflow: hidden;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
}


.test-area.idle {
    background-color: var(--primary);
}

.test-area.idle:hover {
    filter: brightness(1.1);
}

.test-area.waiting {
    background-color: var(--waiting);
}

.test-area.ready {
    background-color: var(--success);
}

.test-area.result {
    background-color: var(--bg);
    color: var(--text);
    border: 2px solid var(--primary);
}

.test-area.early {
    background-color: var(--bg);
    color: var(--text);
    border: 2px solid var(--waiting);
}



.state-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.8;
}

.message-content h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.8rem;
}

.message-content p {
    margin: 0;
    opacity: 0.9;
    font-size: 1.1rem;
}


.test-area.result .state-icon,
.test-area.early .state-icon {
    color: var(--text-secondary);
    font-size: 3rem;
}

.score-display {
    color: var(--primary);
    margin-bottom: 0.5rem;
}

.score {
    font-size: 3.5rem;
    font-weight: 800;
    line-height: 1;
}

.ms {
    font-size: 1.5rem;
    margin-left: 5px;
    opacity: 0.6;
}

.rank-text {
    color: var(--text-secondary);
    font-size: 0.9rem !important;
    margin-bottom: 0.5rem !important;
}

.comment {
    font-weight: bold;
    margin-bottom: 1.5rem !important;
}

.retry-btn {
    pointer-events: none;
    
    background: rgba(0, 0, 0, 0.05);
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    color: var(--text-secondary);
}


.history-list h3 {
    font-size: 1rem;
    margin: 0 0 1rem 0;
    color: var(--text);
}

.list-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.history-item {
    display: flex;
    align-items: center;
    font-size: 0.9rem;
}

.history-item .idx {
    width: 40px;
    color: var(--text-secondary);
}

.history-item .val {
    width: 80px;
    font-weight: bold;
}

.history-item .bar {
    height: 6px;
    background: #e0e0e0;
    border-radius: 3px;
    background: linear-gradient(90deg, var(--primary) 0%, #8cc5ff 100%);
}

.footer {
    text-align: center;
    padding: 2rem 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
    border-top: 1px solid #eef2f7;
    background: var(--card);
}
</style>
