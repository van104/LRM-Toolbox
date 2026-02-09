<template>
    <div class="gomoku-tool">
        <nav class="nav-bar">
            <button class="nav-back" @click="$router.back()">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>五子棋</h1>
                <span class="nav-subtitle">Gomoku Game</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="layout-grid" :class="{ 'settings-collapsed': !settingsExpanded }">
                
                <div class="board-section glass-card">
                    <div class="game-status">
                        <div class="status-indicator" :class="{ 'is-active': !gameOver }">
                            <span class="current-player">
                                <span class="stone-icon" :class="currentPlayer"></span>
                                {{ currentPlayerName }} 的回合
                            </span>
                        </div>
                        <div v-if="gameOver" class="winner-display">
                            <span v-if="winner" class="winner-text">🎉 {{ winnerName }} 获胜！</span>
                            <span v-else class="draw-text">🤝 平局！</span>
                        </div>
                    </div>

                    <div class="board-container" :style="boardContainerStyle">
                        <div class="board" :style="boardStyle">
                            
                            <svg class="grid-lines" :viewBox="`0 0 ${boardPixelSize} ${boardPixelSize}`">
                                
                                <line
v-for="i in boardSize" :key="'h' + i" :x1="cellSize / 2"
                                    :y1="cellSize / 2 + (i - 1) * cellSize" :x2="boardPixelSize - cellSize / 2"
                                    :y2="cellSize / 2 + (i - 1) * cellSize" stroke="#8B4513" stroke-width="1" />
                                
                                <line
v-for="i in boardSize" :key="'v' + i" :x1="cellSize / 2 + (i - 1) * cellSize"
                                    :y1="cellSize / 2" :x2="cellSize / 2 + (i - 1) * cellSize"
                                    :y2="boardPixelSize - cellSize / 2" stroke="#8B4513" stroke-width="1" />
                                
                                <circle
v-for="(pos, idx) in starPoints" :key="'star' + idx"
                                    :cx="cellSize / 2 + pos.x * cellSize" :cy="cellSize / 2 + pos.y * cellSize" r="4"
                                    fill="#8B4513" />
                            </svg>

                            
                            <template v-for="(row, y) in board" :key="y">
                                <div
v-for="(cell, x) in row" :key="x" class="board-cell" :style="cellStyle"
                                    @click="makeMove(x, y)" @mouseenter="hoverCell = { x, y }"
                                    @mouseleave="hoverCell = null">
                                    
                                    <div
v-if="cell" class="stone" :class="cell"
                                        :style="{ animationDelay: getStoneDelay(x, y) }">
                                        <span v-if="showMoveNumbers" class="move-number">{{ getMoveNumber(x, y)
                                            }}</span>
                                    </div>
                                    
                                    <div
v-else-if="canPlace(x, y) && hoverCell?.x === x && hoverCell?.y === y"
                                        class="stone preview" :class="currentPlayer"></div>
                                    
                                    <div v-if="isLastMove(x, y)" class="last-move-marker"></div>
                                    
                                    <div v-if="isWinningCell(x, y)" class="winning-marker"></div>
                                </div>
                            </template>
                        </div>
                    </div>

                    <div class="game-controls">
                        <button class="control-btn primary" @click="restartGame">
                            <el-icon>
                                <Refresh />
                            </el-icon> 重新开始
                        </button>
                        <button class="control-btn" :disabled="moveHistory.length === 0 || gameOver" @click="undoMove">
                            <el-icon>
                                <RefreshLeft />
                            </el-icon> 悔棋
                        </button>
                        <button class="control-btn" @click="settingsExpanded = !settingsExpanded">
                            <el-icon>
                                <Setting />
                            </el-icon> {{ settingsExpanded ? '收起设置' : '游戏设置' }}
                        </button>
                    </div>
                </div>

                
                <Transition name="slide-fade">
                    <div v-show="settingsExpanded" class="settings-section glass-card">
                        <div class="settings-header">
                            <h2>游戏设置</h2>
                            <button class="close-btn" @click="settingsExpanded = false">
                                <el-icon>
                                    <Close />
                                </el-icon>
                            </button>
                        </div>

                        <div class="settings-group">
                            <h3>游戏模式</h3>
                            <div class="mode-selector">
                                <button
v-for="mode in gameModes" :key="mode.value" class="mode-btn"
                                    :class="{ active: gameMode === mode.value }" @click="setGameMode(mode.value)">
                                    <el-icon>
                                        <component :is="mode.icon" />
                                    </el-icon>
                                    {{ mode.label }}
                                </button>
                            </div>
                        </div>

                        <div class="settings-group">
                            <h3>棋盘大小</h3>
                            <div class="size-selector">
                                <button
v-for="size in boardSizes" :key="size" class="size-btn"
                                    :class="{ active: boardSize === size }" @click="setBoardSize(size)">
                                    {{ size }} × {{ size }}
                                </button>
                            </div>
                        </div>

                        <div v-if="gameMode === 'ai'" class="settings-group">
                            <h3>AI 难度</h3>
                            <div class="difficulty-selector">
                                <button
v-for="diff in difficulties" :key="diff.value" class="diff-btn"
                                    :class="{ active: aiDifficulty === diff.value }" @click="aiDifficulty = diff.value">
                                    {{ diff.label }}
                                </button>
                            </div>
                        </div>

                        <div class="settings-group">
                            <h3>先手选择</h3>
                            <div class="first-selector">
                                <button
class="first-btn" :class="{ active: playerFirst }"
                                    @click="setPlayerFirst(true)">
                                    <span class="stone-icon black"></span> 玩家先手（黑）
                                </button>
                                <button
class="first-btn" :class="{ active: !playerFirst }"
                                    @click="setPlayerFirst(false)">
                                    <span class="stone-icon white"></span>
                                    {{ gameMode === 'ai' ? 'AI 先手（黑）' : '白棋先手' }}
                                </button>
                            </div>
                        </div>

                        <div class="settings-group">
                            <h3>显示选项</h3>
                            <label class="checkbox-label">
                                <input v-model="showMoveNumbers" type="checkbox" />
                                <span>显示落子顺序</span>
                            </label>
                        </div>

                        <div class="game-stats">
                            <h3>对局统计</h3>
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <span class="stat-value">{{ stats.wins }}</span>
                                    <span class="stat-label">胜利</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-value">{{ stats.losses }}</span>
                                    <span class="stat-label">失败</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-value">{{ stats.draws }}</span>
                                    <span class="stat-label">平局</span>
                                </div>
                            </div>
                        </div>

                        <div class="api-section">
                            <h3>
                                <el-icon>
                                    <Connection />
                                </el-icon> AI 模型接口
                                <span class="coming-soon">即将推出</span>
                            </h3>
                            <p class="api-hint">后续将支持对接外部 AI 模型 API，体验更强大的对手。</p>
                        </div>
                    </div>
                </Transition>
            </div>
        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - 五子棋
        </footer>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { Back, Refresh, RefreshLeft, User, Monitor, Connection, Setting, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'


const boardSize = ref(15)
const board = ref([])
const currentPlayer = ref('black')
const gameOver = ref(false)
const winner = ref(null)
const winningCells = ref([])
const moveHistory = ref([])
const hoverCell = ref(null)


const gameMode = ref('ai') 
const playerFirst = ref(true)
const aiDifficulty = ref('medium')
const showMoveNumbers = ref(false)
const isAIThinking = ref(false)
const settingsExpanded = ref(false)

const gameModes = [
    { value: 'pvp', label: '双人对弈', icon: 'User' },
    { value: 'ai', label: '人机对战', icon: 'Monitor' }
]

const boardSizes = [9, 13, 15, 19]

const difficulties = [
    { value: 'easy', label: '简单' },
    { value: 'medium', label: '中等' },
    { value: 'hard', label: '困难' }
]


const stats = ref({
    wins: 0,
    losses: 0,
    draws: 0
})


const cellSize = computed(() => {
    
    if (boardSize.value <= 9) return 40
    if (boardSize.value <= 13) return 32
    if (boardSize.value <= 15) return 28
    return 24
})

const boardPixelSize = computed(() => boardSize.value * cellSize.value)

const boardContainerStyle = computed(() => ({
    width: `${boardPixelSize.value}px`,
    height: `${boardPixelSize.value}px`
}))

const boardStyle = computed(() => ({
    width: `${boardPixelSize.value}px`,
    height: `${boardPixelSize.value}px`,
    gridTemplateColumns: `repeat(${boardSize.value}, ${cellSize.value}px)`,
    gridTemplateRows: `repeat(${boardSize.value}, ${cellSize.value}px)`
}))

const cellStyle = computed(() => ({
    width: `${cellSize.value}px`,
    height: `${cellSize.value}px`
}))

const starPoints = computed(() => {
    const size = boardSize.value
    const points = []

    if (size >= 13) {
        const edge = size >= 15 ? 3 : 2
        const mid = Math.floor(size / 2)

        
        points.push({ x: edge, y: edge })
        points.push({ x: size - 1 - edge, y: edge })
        points.push({ x: edge, y: size - 1 - edge })
        points.push({ x: size - 1 - edge, y: size - 1 - edge })

        
        points.push({ x: mid, y: mid })

        if (size >= 15) {
            
            points.push({ x: mid, y: edge })
            points.push({ x: mid, y: size - 1 - edge })
            points.push({ x: edge, y: mid })
            points.push({ x: size - 1 - edge, y: mid })
        }
    } else if (size === 9) {
        points.push({ x: 2, y: 2 })
        points.push({ x: 6, y: 2 })
        points.push({ x: 2, y: 6 })
        points.push({ x: 6, y: 6 })
        points.push({ x: 4, y: 4 })
    }

    return points
})

const currentPlayerName = computed(() => {
    if (gameMode.value === 'ai') {
        return currentPlayer.value === 'black'
            ? (playerFirst.value ? '玩家' : 'AI')
            : (playerFirst.value ? 'AI' : '玩家')
    }
    return currentPlayer.value === 'black' ? '黑棋' : '白棋'
})

const winnerName = computed(() => {
    if (!winner.value) return ''
    if (gameMode.value === 'ai') {
        const isPlayerBlack = playerFirst.value
        const isWinnerBlack = winner.value === 'black'
        return isPlayerBlack === isWinnerBlack ? '玩家' : 'AI'
    }
    return winner.value === 'black' ? '黑棋' : '白棋'
})


const initBoard = () => {
    board.value = Array(boardSize.value).fill(null).map(() =>
        Array(boardSize.value).fill(null)
    )
    currentPlayer.value = 'black'
    gameOver.value = false
    winner.value = null
    winningCells.value = []
    moveHistory.value = []
    isAIThinking.value = false
}

const restartGame = () => {
    initBoard()
    
    if (gameMode.value === 'ai' && !playerFirst.value) {
        nextTick(() => aiMove())
    }
}

const setGameMode = (mode) => {
    gameMode.value = mode
    restartGame()
}

const setBoardSize = (size) => {
    boardSize.value = size
    restartGame()
}

const setPlayerFirst = (first) => {
    playerFirst.value = first
    restartGame()
}


const canPlace = (x, y) => {
    if (gameOver.value) return false
    if (board.value[y][x]) return false
    if (gameMode.value === 'ai' && isAIThinking.value) return false
    if (gameMode.value === 'ai') {
        const isPlayerTurn = (currentPlayer.value === 'black') === playerFirst.value
        if (!isPlayerTurn) return false
    }
    return true
}

const makeMove = (x, y) => {
    if (!canPlace(x, y)) return
    placeStone(x, y)
}


const placeStone = (x, y) => {
    
    board.value[y][x] = currentPlayer.value
    moveHistory.value.push({ x, y, player: currentPlayer.value })

    
    if (checkWin(x, y, currentPlayer.value)) {
        gameOver.value = true
        winner.value = currentPlayer.value
        updateStats()
        return
    }

    
    if (moveHistory.value.length === boardSize.value * boardSize.value) {
        gameOver.value = true
        stats.value.draws++
        saveStats()
        return
    }

    
    currentPlayer.value = currentPlayer.value === 'black' ? 'white' : 'black'

    
    if (gameMode.value === 'ai' && !gameOver.value) {
        const isAITurn = (currentPlayer.value === 'black') !== playerFirst.value
        if (isAITurn) {
            nextTick(() => aiMove())
        }
    }
}

const undoMove = () => {
    if (moveHistory.value.length === 0 || gameOver.value) return

    
    const stepsToUndo = gameMode.value === 'ai' ? 2 : 1

    for (let i = 0; i < stepsToUndo && moveHistory.value.length > 0; i++) {
        const lastMove = moveHistory.value.pop()
        board.value[lastMove.y][lastMove.x] = null
        currentPlayer.value = lastMove.player
    }
}

const checkWin = (x, y, player) => {
    const directions = [
        [1, 0],   
        [0, 1],   
        [1, 1],   
        [1, -1]   
    ]

    for (const [dx, dy] of directions) {
        const cells = [{ x, y }]

        
        let nx = x + dx, ny = y + dy
        while (nx >= 0 && nx < boardSize.value && ny >= 0 && ny < boardSize.value && board.value[ny][nx] === player) {
            cells.push({ x: nx, y: ny })
            nx += dx
            ny += dy
        }

        
        nx = x - dx
        ny = y - dy
        while (nx >= 0 && nx < boardSize.value && ny >= 0 && ny < boardSize.value && board.value[ny][nx] === player) {
            cells.push({ x: nx, y: ny })
            nx -= dx
            ny -= dy
        }

        if (cells.length >= 5) {
            winningCells.value = cells
            return true
        }
    }

    return false
}

const isLastMove = (x, y) => {
    if (moveHistory.value.length === 0) return false
    const last = moveHistory.value[moveHistory.value.length - 1]
    return last.x === x && last.y === y
}

const isWinningCell = (x, y) => {
    return winningCells.value.some(cell => cell.x === x && cell.y === y)
}

const getMoveNumber = (x, y) => {
    const index = moveHistory.value.findIndex(m => m.x === x && m.y === y)
    return index >= 0 ? index + 1 : ''
}

const getStoneDelay = (x, y) => {
    const index = moveHistory.value.findIndex(m => m.x === x && m.y === y)
    return index >= 0 ? `${index * 0.02}s` : '0s'
}


const aiMove = async () => {
    if (gameOver.value) return

    isAIThinking.value = true

    
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400))

    const aiColor = playerFirst.value ? 'white' : 'black'
    const playerColor = playerFirst.value ? 'black' : 'white'

    const move = findBestMove(aiColor, playerColor)

    isAIThinking.value = false

    if (move) {
        placeStone(move.x, move.y)
    }
}

const findBestMove = (aiColor, playerColor) => {
    const size = boardSize.value
    const emptyCells = []

    
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (!board.value[y][x]) {
                emptyCells.push({ x, y })
            }
        }
    }

    if (emptyCells.length === 0) return null

    
    if (moveHistory.value.length === 0) {
        const center = Math.floor(size / 2)
        return { x: center, y: center }
    }

    
    let bestMove = null
    let bestScore = -Infinity

    for (const cell of emptyCells) {
        const score = evaluatePosition(cell.x, cell.y, aiColor, playerColor)
        if (score > bestScore) {
            bestScore = score
            bestMove = cell
        }
    }

    return bestMove
}

const evaluatePosition = (x, y, aiColor, playerColor) => {
    let score = 0

    
    const difficultyMultiplier = {
        easy: 0.5,
        medium: 1,
        hard: 1.5
    }[aiDifficulty.value]

    
    score += evaluateDirection(x, y, aiColor) * difficultyMultiplier

    
    score += evaluateDirection(x, y, playerColor) * 0.9 * difficultyMultiplier

    
    if (aiDifficulty.value === 'easy') {
        score += Math.random() * 50
    }

    
    const center = boardSize.value / 2
    const distToCenter = Math.abs(x - center) + Math.abs(y - center)
    score += (boardSize.value - distToCenter) * 0.5

    return score
}

const evaluateDirection = (x, y, color) => {
    const directions = [
        [1, 0], [0, 1], [1, 1], [1, -1]
    ]

    let totalScore = 0

    for (const [dx, dy] of directions) {
        let count = 1
        let openEnds = 0
        let blocked = 0

        
        let nx = x + dx, ny = y + dy
        while (nx >= 0 && nx < boardSize.value && ny >= 0 && ny < boardSize.value) {
            if (board.value[ny][nx] === color) {
                count++
                nx += dx
                ny += dy
            } else if (board.value[ny][nx] === null) {
                openEnds++
                break
            } else {
                blocked++
                break
            }
        }

        
        nx = x - dx
        ny = y - dy
        while (nx >= 0 && nx < boardSize.value && ny >= 0 && ny < boardSize.value) {
            if (board.value[ny][nx] === color) {
                count++
                nx -= dx
                ny -= dy
            } else if (board.value[ny][nx] === null) {
                openEnds++
                break
            } else {
                blocked++
                break
            }
        }

        
        if (count >= 5) {
            totalScore += 100000 
        } else if (count === 4) {
            if (openEnds === 2) totalScore += 10000 
            else if (openEnds === 1) totalScore += 1000 
        } else if (count === 3) {
            if (openEnds === 2) totalScore += 1000 
            else if (openEnds === 1) totalScore += 100 
        } else if (count === 2) {
            if (openEnds === 2) totalScore += 100 
            else if (openEnds === 1) totalScore += 10 
        }
    }

    return totalScore
}


const updateStats = () => {
    if (gameMode.value === 'ai') {
        const isPlayerWinner = (winner.value === 'black') === playerFirst.value
        if (isPlayerWinner) {
            stats.value.wins++
        } else {
            stats.value.losses++
        }
    }
    saveStats()
}

const saveStats = () => {
    localStorage.setItem('gomoku-stats', JSON.stringify(stats.value))
}

const loadStats = () => {
    const saved = localStorage.getItem('gomoku-stats')
    if (saved) {
        stats.value = JSON.parse(saved)
    }
}


onMounted(() => {
    loadStats()
    initBoard()
})

watch(boardSize, () => {
    initBoard()
})
</script>

<style scoped>
.gomoku-tool {
    --bg: #f5f7fa;
    --card: #ffffff;
    --border: #eef2f7;
    --text: #2c3e50;
    --text-secondary: #7f8c8d;
    --primary: #409eff;
    --success: #67c23a;
    --warning: #e6a23c;
    --board-bg: #DEB887;
    --board-line: #8B4513;

    font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
    min-height: 100vh;
    background: var(--bg);
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
    border-bottom: 1px solid var(--border);
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
    flex: 1;
    text-align: center;
}

.nav-center h1 {
    font-size: 1.15rem;
    margin: 0;
    color: var(--text);
    line-height: 1.2;
}

.nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    display: block;
    margin-top: 1px;
}


.main-content {
    min-height: calc(100vh - 120px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1.5rem;
}

.layout-grid {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 2rem;
    align-items: start;
    transition: all 0.3s ease;
    max-width: 1200px;
    width: 100%;
}

.layout-grid.settings-collapsed {
    grid-template-columns: 1fr;
    max-width: fit-content;
}

.glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}


.board-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
}

.game-status {
    text-align: center;
}

.status-indicator {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1.5rem;
    background: #f0f2f5;
    border-radius: 20px;
    font-size: 1rem;
}

.status-indicator.is-active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.current-player {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.stone-icon {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    display: inline-block;
}

.stone-icon.black {
    background: radial-gradient(circle at 30% 30%, #555, #000);
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.stone-icon.white {
    background: radial-gradient(circle at 30% 30%, #fff, #ddd);
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    border: 1px solid #ccc;
}

.winner-display {
    margin-top: 1rem;
    animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.winner-text {
    font-size: 1.5rem;
    font-weight: bold;
    color: #ff4d4f;
}

.draw-text {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--warning);
}

@keyframes bounce-in {
    0% {
        transform: scale(0);
        opacity: 0;
    }

    100% {
        transform: scale(1);
        opacity: 1;
    }

}


.board-container {
    position: relative;
    --board-bg: #eecaa1;
    background: var(--board-bg);
    border-radius: 4px;
    box-shadow:
        1px 1px 0 #b38f6d,
        2px 2px 0 #b38f6d,
        3px 3px 0 #b38f6d,
        4px 4px 0 #b38f6d,
        8px 8px 20px rgba(0, 0, 0, 0.3);
    padding: 15px;
    border: 2px solid #8b5a2b;
}

.board {
    position: relative;
    display: grid;
}

.grid-lines {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.board-cell {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s;
    
    z-index: 10;
}

.board-cell:hover {
    background: rgba(255, 255, 255, 0.1);
}


.stone {
    width: 85%;
    height: 85%;
    border-radius: 50%;
    position: relative;
    animation: stone-drop 0.2s ease-out;
    display: flex;
    align-items: center;
    justify-content: center;
}

@keyframes stone-drop {
    0% {
        transform: scale(0) translateY(-20px);
        opacity: 0;
    }

    100% {
        transform: scale(1) translateY(0);
        opacity: 1;
    }
}

.stone.black {
    background: radial-gradient(circle at 30% 30%, #555, #111);
    box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.4), inset -2px -2px 4px rgba(255, 255, 255, 0.1);
}

.stone.white {
    background: radial-gradient(circle at 30% 30%, #fff, #ccc);
    box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.2), inset -2px -2px 4px rgba(0, 0, 0, 0.05);
    border: 1px solid #bbb;
}

.stone.preview {
    opacity: 0.5;
    animation: none;
}

.move-number {
    font-size: 10px;
    font-weight: bold;
    color: inherit;
}

.stone.black .move-number {
    color: #fff;
}

.stone.white .move-number {
    color: #333;
}

.last-move-marker {
    position: absolute;
    width: 8px;
    height: 8px;
    background: #ff4d4f;
    border-radius: 50%;
    pointer-events: none;
    animation: pulse 1.5s infinite;
}

@keyframes pulse {

    0%,
    100% {
        transform: scale(1);
        opacity: 1;
    }

    50% {
        transform: scale(1.3);
        opacity: 0.7;
    }
}

.winning-marker {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 3px solid #ff4d4f;
    border-radius: 50%;
    pointer-events: none;
    animation: winning-glow 0.5s ease-out;
}

@keyframes winning-glow {
    0% {
        transform: scale(0.5);
        opacity: 0;
    }

    100% {
        transform: scale(1);
        opacity: 1;
    }
}


.game-controls {
    display: flex;
    gap: 1rem;
}

.control-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.7rem 1.5rem;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--card);
    color: var(--text);
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s;
}

.control-btn:hover:not(:disabled) {
    border-color: var(--primary);
    color: var(--primary);
}

.control-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.control-btn.primary {
    background: var(--primary);
    border-color: var(--primary);
    color: white;
}

.control-btn.primary:hover {
    background: #3a8ee6;
}


.settings-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border);
}

.settings-header h2 {
    font-size: 1.1rem;
    margin: 0;
    color: var(--text);
}

.close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: #f0f2f5;
    border-radius: 50%;
    cursor: pointer;
    color: var(--text-secondary);
    transition: all 0.2s;
}

.close-btn:hover {
    background: #e0e2e5;
    color: var(--text);
}


.slide-fade-enter-active {
    transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
    transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
    transform: translateX(20px);
    opacity: 0;
}

.slide-fade-leave-to {
    transform: translateX(20px);
    opacity: 0;
}


.settings-group h3 {
    font-size: 0.95rem;
    margin-bottom: 0.8rem;
    color: var(--text);
}

.mode-selector,
.size-selector,
.difficulty-selector,
.first-selector {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.mode-btn,
.size-btn,
.diff-btn,
.first-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 1rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--card);
    color: var(--text-secondary);
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
}

.mode-btn:hover,
.size-btn:hover,
.diff-btn:hover,
.first-btn:hover {
    border-color: var(--primary);
    color: var(--primary);
}

.mode-btn.active,
.size-btn.active,
.diff-btn.active,
.first-btn.active {
    background: var(--primary);
    border-color: var(--primary);
    color: white;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-size: 0.9rem;
    color: var(--text-secondary);
}

.checkbox-label input {
    width: 16px;
    height: 16px;
    accent-color: var(--primary);
}


.game-stats {
    background: #f8fafc;
    border-radius: 12px;
    padding: 1rem;
}

.game-stats h3 {
    margin-bottom: 1rem;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    text-align: center;
}

.stat-item {
    display: flex;
    flex-direction: column;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--primary);
}

.stat-label {
    font-size: 0.75rem;
    color: var(--text-secondary);
}


.api-section {
    background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
    border-radius: 12px;
    padding: 1rem;
}

.api-section h3 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
}

.coming-soon {
    font-size: 0.65rem;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: normal;
}

.api-hint {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin: 0;
}


.footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
    font-size: 0.85rem;
    border-top: 1px solid var(--border);
}


@media (max-width: 1000px) {
    .layout-grid {
        grid-template-columns: 1fr;
    }

    .settings-section {
        order: -1;
    }
}

@media (max-width: 600px) {
    .main-content {
        padding: 1rem;
    }

    .glass-card {
        padding: 1rem;
    }

    .game-controls {
        flex-direction: column;
    }

    .control-btn {
        width: 100%;
        justify-content: center;
    }
}
</style>
