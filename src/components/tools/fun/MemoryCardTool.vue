<template>
    <div class="memory-game-tool">
        <nav class="nav-bar">
            <button class="nav-back" @click="$router.back()">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>记忆翻牌</h1>
                <span class="nav-subtitle">Memory Game</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="game-container">
                
                <div class="control-bar glass-card">
                    <div class="stats">
                        <div class="stat-item">
                            <span class="label">步数</span>
                            <span class="value">{{ moves }}</span>
                        </div>
                        <div class="stat-item">
                            <span class="label">时间</span>
                            <span class="value">{{ formattedTime }}</span>
                        </div>
                    </div>

                    <div class="difficulty-switch">
                        <button :class="{ active: gridSize === 4 }" @click="setDifficulty(4)">简单 (4x4)</button>
                        <button :class="{ active: gridSize === 6 }" @click="setDifficulty(6)">困难 (6x6)</button>
                    </div>

                    <button class="restart-btn icon-btn" title="重置" @click="initGame">
                        <el-icon>
                            <RefreshRight />
                        </el-icon>
                    </button>
                </div>

                
                <div
class="card-grid" :style="{
                    'grid-template-columns': `repeat(${gridSize}, 1fr)`,
                    'max-width': gridSize === 6 ? '500px' : '360px'
                }">
                    <div
v-for="card in cards" :key="card.id" class="card-container"
                        :class="{ 'flipped': card.isFlipped || card.isMatched }" @click="handleCardClick(card)">
                        <div class="card-inner">
                            <div class="card-front">
                                <el-icon>
                                    <QuestionFilled />
                                </el-icon>
                            </div>
                            <div class="card-back" :class="{ 'matched': card.isMatched }">
                                <component :is="card.icon" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        
        <el-dialog v-model="showVictory" title="通关成功！" width="350px" center custom-class="game-dialog">
            <div class="victory-content">
                <div class="victory-icon">🎉</div>
                <p>总用时：{{ formattedTime }}</p>
                <p>总步数：{{ moves }}</p>
            </div>
            <template #footer>
                <button class="dialog-btn" @click="initGame">再玩一次</button>
            </template>
        </el-dialog>

        <footer class="footer">
            © 2026 LRM工具箱 - 记忆翻牌
        </footer>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, markRaw } from 'vue'
import {
    Back, RefreshRight, QuestionFilled,
    
    Star, Moon, Sunny, Lightning, Cloudy,
    
    Apple, Cherry, Grape, Watermelon, Burger, Fries, Mug, Sugar,
    
    Bicycle, Ship, Van, Notebook, Headset,
    Camera, Bell, Lock, User, MagicStick,
    Trophy, Medal, Soccer, Basketball, Baseball,
    Umbrella, Scissor, Key, Present, Watch,
    Microphone, VideoCamera, Mouse, Printer
} from '@element-plus/icons-vue'


const iconPool = [
    Star, Moon, Sunny, Lightning, Cloudy,
    Apple, Cherry, Grape, Watermelon, Burger, Fries, Mug, Sugar,
    Bicycle, Ship, Van, Notebook, Headset,
    Camera, Bell, Lock, User, MagicStick,
    Trophy, Medal, Soccer, Basketball, Baseball,
    Umbrella, Scissor, Key, Present, Watch,
    Microphone, VideoCamera, Mouse, Printer
]


const gridSize = ref(4)
const cards = ref([])
const moves = ref(0)
const startTime = ref(0)
const elapsedTime = ref(0)
const showVictory = ref(false)
const isLocking = ref(false) 

let timerInterval = null
let flippedCards = [] 

const formattedTime = computed(() => {
    const t = elapsedTime.value
    const m = Math.floor(t / 60000)
    const s = Math.floor((t % 60000) / 1000)
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})


const initGame = () => {
    stopTimer()
    elapsedTime.value = 0
    moves.value = 0
    flippedCards = []
    isLocking.value = false
    showVictory.value = false

    
    const pairCount = (gridSize.value * gridSize.value) / 2
    
    const selectedIcons = [...iconPool].sort(() => 0.5 - Math.random()).slice(0, pairCount)

    
    const newCards = []
    selectedIcons.forEach((icon, index) => {
        const rawIcon = markRaw(icon)
        
        newCards.push({ id: index * 2, icon: rawIcon, isFlipped: false, isMatched: false, val: index })
        newCards.push({ id: index * 2 + 1, icon: rawIcon, isFlipped: false, isMatched: false, val: index })
    })

    
    cards.value = newCards.sort(() => 0.5 - Math.random())

    startTimer()
}

const setDifficulty = (size) => {
    if (gridSize.value === size) return
    gridSize.value = size
    initGame()
}

const handleCardClick = (card) => {
    
    if (showVictory.value || isLocking.value || card.isFlipped || card.isMatched) return

    
    card.isFlipped = true
    flippedCards.push(card)

    if (flippedCards.length === 2) {
        moves.value++
        checkMatch()
    }
}

const checkMatch = () => {
    isLocking.value = true
    const [card1, card2] = flippedCards

    if (card1.val === card2.val) {
        
        setTimeout(() => {
            card1.isMatched = true
            card2.isMatched = true
            flippedCards = []
            isLocking.value = false
            checkWin()
        }, 500)
    } else {
        
        setTimeout(() => {
            card1.isFlipped = false
            card2.isFlipped = false
            flippedCards = []
            isLocking.value = false
        }, 1000)
    }
}

const checkWin = () => {
    if (cards.value.every(c => c.isMatched)) {
        stopTimer()
        setTimeout(() => {
            showVictory.value = true
        }, 500)
    }
}

const startTimer = () => {
    startTime.value = Date.now()
    timerInterval = setInterval(() => {
        elapsedTime.value = Date.now() - startTime.value
    }, 1000)
}

const stopTimer = () => {
    if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
    }
}

onMounted(() => {
    initGame()
})

onUnmounted(() => {
    stopTimer()
})
</script>

<style scoped>
.memory-game-tool {
    --bg: #f5f7fa;
    --card: #ffffff;
    --primary: #409eff;
    --text: #2c3e50;
    --text-sec: #7f8c8d;
    --card-back-bg: #409eff;
    --card-front-bg: #eceff1;

    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    min-height: 100vh;
    background: var(--bg);
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
    color: var(--text-sec);
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
    color: var(--text-sec);
    text-transform: uppercase;
    display: block;
    margin-top: 1px;
}

.main-content {
    display: flex;
    justify-content: center;
    padding: 1.5rem 1rem;
    flex: 1;
}

.game-container {
    width: 100%;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
}


.control-bar {
    width: 100%;
    padding: 1rem;
    border-radius: 12px;
    background: var(--card);
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.stats {
    display: flex;
    gap: 1.5rem;
}

.stat-item {
    display: flex;
    flex-direction: column;
}

.stat-item .label {
    font-size: 0.75rem;
    color: var(--text-sec);
}

.stat-item .value {
    font-size: 1.1rem;
    font-weight: bold;
    color: var(--text);
    font-family: monospace;
}

.difficulty-switch {
    display: flex;
    background: #f0f2f5;
    padding: 4px;
    border-radius: 8px;
}

.difficulty-switch button {
    border: none;
    background: none;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 0.85rem;
    cursor: pointer;
    color: var(--text-sec);
    transition: all 0.2s;
}

.difficulty-switch button.active {
    background: var(--card);
    color: var(--primary);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    font-weight: bold;
}

.restart-btn {
    border: none;
    background: none;
    font-size: 1.2rem;
    color: var(--text-sec);
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    transition: all 0.2s;
    display: flex;
}

.restart-btn:hover {
    background: #f0f2f5;
    color: var(--primary);
}


.card-grid {
    display: grid;
    gap: 10px;
    width: 100%;
    perspective: 1000px;
    user-select: none;
    
}

.card-container {
    aspect-ratio: 1;
    cursor: pointer;
    background: transparent;
}

.card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    transition: transform 0.6s;
    transform-style: preserve-3d;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
}

.card-container.flipped .card-inner {
    transform: rotateY(180deg);
}

.card-front,
.card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
}

.card-front {
    background: var(--card-front-bg);
    color: #b0bec5;
}

.card-back {
    background: var(--card-back-bg);
    color: white;
    transform: rotateY(180deg);
}

.card-back.matched {
    background: #67c23a;
    
    animation: pulse 0.5s;
}

@keyframes pulse {
    0% {
        transform: rotateY(180deg) scale(1);
    }

    50% {
        transform: rotateY(180deg) scale(1.1);
    }

    100% {
        transform: rotateY(180deg) scale(1);
    }
}

.victory-content {
    text-align: center;
    font-size: 1.1rem;
}

.victory-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.dialog-btn {
    width: 100%;
    padding: 10px;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}

.footer {
    text-align: center;
    padding: 2rem 0;
    color: var(--text-sec);
    font-size: 0.9rem;
    border-top: 1px solid #eef2f7;
    background: var(--card);
}
</style>
