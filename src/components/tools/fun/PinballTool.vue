<template>
    <div class="pinball-tool">
        <nav class="nav-bar">
            <button @click="$router.back()" class="nav-back">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>弹球消消乐</h1>
                <span class="nav-subtitle">Pinball / Breakout Quest</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="game-layout">
                <div class="game-view glass-card">
                    <div class="canvas-container" ref="containerRef">
                        <canvas ref="canvasRef" @click="handleCanvasClick"></canvas>


                        <div v-if="gameState !== 'playing'" class="game-overlay">
                            <div class="overlay-content">
                                <h2 v-if="gameState === 'start'">弹球大冒险</h2>
                                <h2 v-else-if="gameState === 'gameover'">游戏结束</h2>
                                <h2 v-else-if="gameState === 'paused'">游戏暂停</h2>
                                <h2 v-else-if="gameState === 'level_up'">进入下一关</h2>
                                <h2 v-else-if="gameState === 'victory'">全关卡通关!</h2>

                                <p v-if="gameState === 'gameover'">最终得分: {{ score }}</p>
                                <p v-else-if="gameState === 'start'">使用鼠标移动挡板，消除所有砖块！</p>
                                <p v-else-if="gameState === 'level_up'">恭喜完成第 {{ level }} 关</p>

                                <div class="overlay-actions">
                                    <button v-if="gameState === 'start'" class="action-btn primary" @click="startGame">
                                        开始游戏
                                    </button>
                                    <template v-else-if="gameState === 'paused'">
                                        <button class="action-btn primary" @click="resumeGame">继续游戏</button>
                                        <button class="action-btn secondary" @click="resetGame">重新开始</button>
                                    </template>
                                    <button v-else-if="gameState === 'level_up'" class="action-btn primary"
                                        @click="nextLevel">
                                        进入第 {{ level + 1 }} 关
                                    </button>
                                    <button v-else class="action-btn primary" @click="resetGame">
                                        重新开始
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="side-panel">
                    <div class="stats-card glass-card">
                        <div class="stat-item">
                            <span class="label">当前关卡</span>
                            <span class="value">Level {{ level }}</span>
                        </div>
                        <div class="stat-item">
                            <span class="label">分数</span>
                            <span class="value">{{ score }}</span>
                        </div>
                        <div class="stat-item">
                            <span class="label">生命</span>
                            <div class="lives-container">
                                <span v-for="i in 3" :key="i" class="heart" :class="{ empty: i > lives }">❤️</span>
                            </div>
                        </div>
                    </div>

                    <div class="instructions glass-card">
                        <h3>游戏说明</h3>
                        <ul>
                            <li>移动鼠标控制挡板</li>
                            <li>球碰到挡板不同位置会改变反射角</li>
                            <li>消除颜色砖块获得积分</li>
                            <li><span class="brick-type multi"></span> 深色砖块需多次撞击</li>
                            <li>不要让球掉落到底部</li>
                        </ul>
                    </div>

                    <div class="game-footer glass-card">
                        <button class="restart-btn" @click="resetGame">
                            <el-icon>
                                <Refresh />
                            </el-icon> 重置游戏
                        </button>
                    </div>
                </div>
            </div>
        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - 经典弹球
        </footer>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { Back, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'


const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600
const PADDLE_WIDTH = 120
const PADDLE_HEIGHT = 16
const BALL_RADIUS = 10
const BRICK_ROWS = 10
const BRICK_COLS = 10
const BRICK_PADDING = 10
const BRICK_OFFSET_TOP = 50
const BRICK_OFFSET_LEFT = 55
const BRICK_WIDTH = 60
const BRICK_HEIGHT = 24


const LEVELS = [

    {
        bricks: Array(5).fill().map(() => Array(10).fill(1))
    },

    {
        bricks: [
            [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
            [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 2, 2, 2, 2, 2, 2, 1, 1]
        ]
    },

    {
        bricks: [
            [1, 1, 1, 2, 2, 2, 2, 1, 1, 1],
            [1, 1, 2, 3, 3, 3, 3, 2, 1, 1],
            [1, 2, 3, 0, 0, 0, 0, 3, 2, 1],
            [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [0, 1, 0, 1, 0, 1, 0, 1, 0, 1]
        ]
    }
]


const canvasRef = ref(null)
const containerRef = ref(null)
const gameState = ref('start')
const score = ref(0)
const level = ref(1)
const lives = ref(3)

let ctx = null
let animationId = null


const paddleX = ref((CANVAS_WIDTH - PADDLE_WIDTH) / 2)


const ballX = ref(CANVAS_WIDTH / 2)
const ballY = ref(CANVAS_HEIGHT - 30)
const ballDX = ref(4)
const ballDY = ref(-4)


const bricks = ref([])



function initBricks() {
    const layout = LEVELS[level.value - 1].bricks
    bricks.value = []
    for (let r = 0; r < layout.length; r++) {
        bricks.value[r] = []
        for (let c = 0; c < layout[r].length; c++) {
            const status = layout[r][c]
            bricks.value[r][c] = {
                x: 0,
                y: 0,
                status: status,
                maxStatus: status,
                color: getBrickColor(status)
            }
        }
    }
}

function getBrickColor(status) {
    if (status === 1) return '#409eff'
    if (status === 2) return '#e6a23c'
    if (status === 3) return '#f56c6c'
    return 'transparent'
}

function startGame() {
    lives.value = 3
    score.value = 0
    level.value = 1
    resetLevel()
    gameState.value = 'playing'
    gameLoop()
    // 尝试锁定鼠标以获得更好的控制体验
    nextTick(() => {
        if (canvasRef.value) canvasRef.value.requestPointerLock()
    })
}

function nextLevel() {
    level.value++
    resetLevel()
    gameState.value = 'playing'
    gameLoop()
}

function resetLevel() {
    initBricks()
    resetBall()
    paddleX.value = (CANVAS_WIDTH - PADDLE_WIDTH) / 2
}

function resetBall() {
    ballX.value = CANVAS_WIDTH / 2
    ballY.value = CANVAS_HEIGHT - 30

    ballDX.value = (Math.random() * 4 + 2) * (Math.random() > 0.5 ? 1 : -1)
    ballDY.value = -4
}

function resetGame() {
    cancelAnimationFrame(animationId)
    document.exitPointerLock()
    startGame()
}

function resumeGame() {
    gameState.value = 'playing'
    gameLoop()
    nextTick(() => {
        if (canvasRef.value) canvasRef.value.requestPointerLock()
    })
}

function handleKeyDown(e) {
    if (e.key === 'Escape') {
        if (gameState.value === 'playing') {
            gameState.value = 'paused'
            document.exitPointerLock()
            cancelAnimationFrame(animationId)
        } else if (gameState.value === 'paused') {
            resumeGame()
        }
    }
}

function handleMouseMove(e) {
    if (gameState.value !== 'playing') return

    if (document.pointerLockElement === canvasRef.value) {
        // 锁定模式：使用相对移动，消除边界死区
        paddleX.value += e.movementX
    } else {
        // 非锁定模式：使用绝对坐标
        const rect = canvasRef.value.getBoundingClientRect()
        const scaleX = CANVAS_WIDTH / rect.width
        const relativeX = (e.clientX - rect.left) * scaleX
        paddleX.value = relativeX - PADDLE_WIDTH / 2
    }

    // 限制挡板不出界
    if (paddleX.value < 0) paddleX.value = 0
    if (paddleX.value > CANVAS_WIDTH - PADDLE_WIDTH) paddleX.value = CANVAS_WIDTH - PADDLE_WIDTH
}

function handleCanvasClick() {
    if (gameState.value === 'start') {
        startGame()
    } else if (gameState.value === 'playing') {
        // 游戏中点击再次锁定鼠标
        if (canvasRef.value) canvasRef.value.requestPointerLock()
    }
}

function collisionDetection() {
    let allCleared = true
    for (let r = 0; r < bricks.value.length; r++) {
        for (let c = 0; c < bricks.value[r].length; c++) {
            const b = bricks.value[r][c]
            if (b.status > 0) {
                allCleared = false
                if (
                    ballX.value > b.x &&
                    ballX.value < b.x + BRICK_WIDTH &&
                    ballY.value > b.y &&
                    ballY.value < b.y + BRICK_HEIGHT
                ) {
                    ballDY.value = -ballDY.value
                    b.status--
                    score.value += 10
                    if (b.status === 0) {
                        score.value += 50
                    } else {
                        b.color = getBrickColor(b.status)
                    }
                }
            }
        }
    }

    if (allCleared) {
        document.exitPointerLock() // 解锁鼠标
        if (level.value < LEVELS.length) {
            gameState.value = 'level_up'
            cancelAnimationFrame(animationId)
        } else {
            gameState.value = 'victory'
            cancelAnimationFrame(animationId)
        }
    }
}

function drawBall() {
    ctx.beginPath()
    ctx.arc(ballX.value, ballY.value, BALL_RADIUS, 0, Math.PI * 2)
    ctx.fillStyle = "#409eff"
    ctx.fill()
    ctx.closePath()
}

function drawPaddle() {
    ctx.beginPath()
    ctx.roundRect(paddleX.value, CANVAS_HEIGHT - PADDLE_HEIGHT - 5, PADDLE_WIDTH, PADDLE_HEIGHT, 5)
    ctx.fillStyle = "#2c3e50"
    ctx.fill()
    ctx.closePath()
}

function drawBricks() {
    for (let r = 0; r < bricks.value.length; r++) {
        for (let c = 0; c < bricks.value[r].length; c++) {
            const b = bricks.value[r][c]
            if (b.status > 0) {
                const brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT
                const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP
                b.x = brickX
                b.y = brickY
                ctx.beginPath()
                ctx.roundRect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT, 4)
                ctx.fillStyle = b.color
                ctx.fill()

                ctx.strokeStyle = "rgba(255,255,255,0.3)"
                ctx.lineWidth = 2
                ctx.stroke()
                ctx.closePath()
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    drawBricks()
    drawBall()
    drawPaddle()
    collisionDetection()


    if (ballX.value + ballDX.value > CANVAS_WIDTH - BALL_RADIUS || ballX.value + ballDX.value < BALL_RADIUS) {
        ballDX.value = -ballDX.value
    }
    if (ballY.value + ballDY.value < BALL_RADIUS) {
        ballDY.value = -ballDY.value
    } else if (ballY.value + ballDY.value > CANVAS_HEIGHT - BALL_RADIUS - 5) {

        if (ballX.value > paddleX.value && ballX.value < paddleX.value + PADDLE_WIDTH) {

            const hitPos = (ballX.value - (paddleX.value + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2)
            ballDX.value = hitPos * 5
            ballDY.value = -ballDY.value
        } else {

            lives.value--
            if (lives.value === 0) {
                gameState.value = 'gameover'
                document.exitPointerLock() // 解锁鼠标
                cancelAnimationFrame(animationId)
            } else {
                resetBall()
            }
        }
    }

    ballX.value += ballDX.value
    ballY.value += ballDY.value
}

function gameLoop() {
    if (gameState.value === 'playing') {
        draw()
        animationId = requestAnimationFrame(gameLoop)
    }
}

onMounted(() => {
    if (canvasRef.value) {
        canvasRef.value.width = CANVAS_WIDTH
        canvasRef.value.height = CANVAS_HEIGHT
        ctx = canvasRef.value.getContext('2d')
        // 使用 window 监听鼠标，防止移出画布失控
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('keydown', handleKeyDown)
        initBricks()
        draw()
    }
})

onUnmounted(() => {
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('keydown', handleKeyDown)
    cancelAnimationFrame(animationId)
})

</script>

<style scoped>
.pinball-tool {
    --bg: #f5f7fa;
    --primary: #409eff;
    --text: #2c3e50;
    min-height: 100vh;
    background: var(--bg);
    display: flex;
    flex-direction: column;
}

.nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    height: 64px;
    background: #fff;
    border-bottom: 1px solid #eef2f7;
}

.nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    font-size: 1rem;
    cursor: pointer;
    color: #666;
}

.nav-center {
    text-align: center;
}

.nav-center h1 {
    font-size: 1.25rem;
    margin: 0;
    color: var(--text);
}

.nav-subtitle {
    font-size: 0.8rem;
    color: #999;
    text-transform: uppercase;
}

.main-content {
    flex: 1;
    display: flex;
    justify-content: center;
    padding: 2rem;
}

.game-layout {
    display: flex;
    gap: 2rem;
    max-width: 1200px;
    width: 100%;
}

.game-view {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.canvas-container {
    position: relative;
    aspect-ratio: 4/3;
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
}

canvas {
    width: 100%;
    height: 100%;
    display: block;
    background: #fafafa;
    cursor: none;
}

.game-overlay {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    backdrop-filter: blur(4px);
}

.overlay-content {
    text-align: center;
    padding: 2rem;
}

.overlay-content h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: var(--primary);
}

.action-btn {
    padding: 0.8rem 2.5rem;
    border: none;
    border-radius: 50px;
    font-size: 1.1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
}

.action-btn.primary {
    background: var(--primary);
    color: white;
    box-shadow: 0 4px 15px rgba(64, 158, 255, 0.3);
}

.action-btn.secondary {
    background: #fff;
    color: #666;
    border: 1px solid #dcdfe6;
    margin-left: 1rem;
}

.action-btn:hover {
    transform: translateY(-2px);
    opacity: 0.9;
}

.side-panel {
    width: 280px;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.stats-card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
}

.stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.stat-item .label {
    color: #999;
    font-size: 0.9rem;
}

.stat-item .value {
    font-weight: bold;
    font-size: 1.2rem;
    color: var(--text);
}

.lives-container {
    display: flex;
    gap: 4px;
}

.heart.empty {
    filter: grayscale(1);
    opacity: 0.3;
}

.instructions {
    padding: 1.5rem;
}

.instructions h3 {
    margin-top: 0;
    font-size: 1rem;
    color: var(--text);
}

.instructions ul {
    padding-left: 1.2rem;
    font-size: 0.85rem;
    color: #666;
    line-height: 1.6;
}

.brick-type {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 2px;
}

.brick-type.multi {
    background: #f56c6c;
}

.game-footer {
    padding: 1rem;
}

.restart-btn {
    width: 100%;
    padding: 0.7rem;
    border: 1px solid #dcdfe6;
    border-radius: 8px;
    background: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.restart-btn:hover {
    border-color: var(--primary);
    color: var(--primary);
}

.glass-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    padding: 1rem;
}

.footer {
    text-align: center;
    padding: 1.5rem;
    color: #999;
    font-size: 0.85rem;
}
</style>
