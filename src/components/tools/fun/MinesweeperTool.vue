<template>
    <div class="minesweeper-tool">
        <nav class="nav-bar">
            <button class="nav-back" @click="$router.back()">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>扫雷</h1>
                <span class="nav-subtitle">Minesweeper</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="layout-grid" :class="{ 'settings-collapsed': !settingsExpanded }">
                
                <div class="board-section glass-card">
                    <div class="game-header">
                        <div class="info-panel">
                            <div class="info-item">
                                <span class="info-icon">💣</span>
                                <span class="info-value">{{ remainingMines }}</span>
                            </div>
                            <button class="reset-btn" :class="gameStatusClass" @click="resetGame">
                                {{ gameStatusEmoji }}
                            </button>
                            <div class="info-item">
                                <span class="info-icon">⏱️</span>
                                <span class="info-value">{{ formattedTime }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="board-container" :style="boardContainerStyle">
                        <div class="board" :style="boardStyle">
                            <div v-for="(row, y) in board" :key="y" class="board-row">
                                <div
v-for="(cell, x) in row" :key="x" class="cell" :class="getCellClass(cell)"
                                    @click="revealCell(x, y)" @contextmenu.prevent="toggleFlag(x, y)"
                                    @mousedown="handleMouseDown($event, x, y)" @mouseup="handleMouseUp">
                                    <span v-if="cell.revealed && cell.mine" class="mine">💣</span>
                                    <span
v-else-if="cell.revealed && cell.adjacentMines > 0" class="number"
                                        :class="'n' + cell.adjacentMines">
                                        {{ cell.adjacentMines }}
                                    </span>
                                    <span v-else-if="cell.flagged" class="flag">🚩</span>
                                    <span v-else-if="cell.questioned" class="question">❓</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="game-controls">
                        <button class="control-btn primary" @click="resetGame">
                            <el-icon>
                                <Refresh />
                            </el-icon> 重新开始
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
                            <h3>难度选择</h3>
                            <div class="difficulty-selector">
                                <button
v-for="diff in difficulties" :key="diff.value" class="diff-btn"
                                    :class="{ active: difficulty === diff.value }" @click="setDifficulty(diff.value)">
                                    <span class="diff-name">{{ diff.label }}</span>
                                    <span class="diff-info">{{ diff.cols }}×{{ diff.rows }} · {{ diff.mines }}雷</span>
                                </button>
                            </div>
                        </div>

                        <div v-if="difficulty === 'custom'" class="settings-group">
                            <h3>自定义设置</h3>
                            <div class="custom-inputs">
                                <div class="input-group">
                                    <label>列数</label>
                                    <input v-model.number="customCols" type="number" min="5" max="30" />
                                </div>
                                <div class="input-group">
                                    <label>行数</label>
                                    <input v-model.number="customRows" type="number" min="5" max="24" />
                                </div>
                                <div class="input-group">
                                    <label>地雷数</label>
                                    <input v-model.number="customMines" type="number" min="1" :max="maxCustomMines" />
                                </div>
                                <button class="apply-btn" @click="applyCustomSettings">应用设置</button>
                            </div>
                        </div>

                        <div class="settings-group">
                            <h3>操作说明</h3>
                            <div class="instructions">
                                <p>🖱️ <strong>左键</strong>：揭开格子</p>
                                <p>🖱️ <strong>右键</strong>：插旗/问号/取消</p>
                                <p>🖱️ <strong>双键</strong>：快速揭开周围</p>
                            </div>
                        </div>

                        <div class="game-stats">
                            <h3>游戏统计</h3>
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
                                    <span class="stat-value">{{ stats.bestTime || '--' }}</span>
                                    <span class="stat-label">最佳时间</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Transition>
            </div>
        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - 扫雷游戏
        </footer>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Back, Refresh, Setting, Close } from '@element-plus/icons-vue'


const difficulties = [
    { value: 'easy', label: '初级', cols: 9, rows: 9, mines: 10 },
    { value: 'medium', label: '中级', cols: 16, rows: 16, mines: 40 },
    { value: 'hard', label: '高级', cols: 30, rows: 16, mines: 99 },
    { value: 'custom', label: '自定义', cols: 9, rows: 9, mines: 10 }
]


const difficulty = ref('easy')
const board = ref([])
const gameState = ref('ready') 
const timer = ref(0)
const timerInterval = ref(null)
const settingsExpanded = ref(false)
const firstClick = ref(true)


const customCols = ref(9)
const customRows = ref(9)
const customMines = ref(10)


const leftDown = ref(false)
const rightDown = ref(false)


const stats = ref({
    wins: 0,
    losses: 0,
    bestTime: null
})


const currentConfig = computed(() => {
    const diff = difficulties.find(d => d.value === difficulty.value)
    if (difficulty.value === 'custom') {
        return {
            cols: customCols.value,
            rows: customRows.value,
            mines: customMines.value
        }
    }
    return diff
})

const maxCustomMines = computed(() => {
    return Math.floor(customCols.value * customRows.value * 0.85)
})

const remainingMines = computed(() => {
    let flagged = 0
    board.value.forEach(row => {
        row.forEach(cell => {
            if (cell.flagged) flagged++
        })
    })
    return currentConfig.value.mines - flagged
})

const formattedTime = computed(() => {
    const minutes = Math.floor(timer.value / 60)
    const seconds = timer.value % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const gameStatusEmoji = computed(() => {
    if (gameState.value === 'won') return '😎'
    if (gameState.value === 'lost') return '😵'
    return '🙂'
})

const gameStatusClass = computed(() => {
    return gameState.value
})

const cellSize = computed(() => {
    const cols = currentConfig.value.cols
    if (cols <= 9) return 32
    if (cols <= 16) return 28
    return 24
})

const boardContainerStyle = computed(() => ({
    maxWidth: '100%',
    overflowX: 'auto'
}))

const boardStyle = computed(() => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${currentConfig.value.cols}, ${cellSize.value}px)`,
    gap: '1px'
}))


const initBoard = () => {
    const { cols, rows } = currentConfig.value
    board.value = Array(rows).fill(null).map(() =>
        Array(cols).fill(null).map(() => ({
            mine: false,
            revealed: false,
            flagged: false,
            questioned: false,
            adjacentMines: 0
        }))
    )
    gameState.value = 'ready'
    firstClick.value = true
    stopTimer()
    timer.value = 0
}

const placeMines = (safeX, safeY) => {
    const { cols, rows, mines } = currentConfig.value
    let placed = 0

    
    const safeZone = new Set()
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            const nx = safeX + dx
            const ny = safeY + dy
            if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                safeZone.add(`${nx},${ny}`)
            }
        }
    }

    while (placed < mines) {
        const x = Math.floor(Math.random() * cols)
        const y = Math.floor(Math.random() * rows)

        if (!board.value[y][x].mine && !safeZone.has(`${x},${y}`)) {
            board.value[y][x].mine = true
            placed++
        }
    }

    
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (!board.value[y][x].mine) {
                board.value[y][x].adjacentMines = countAdjacentMines(x, y)
            }
        }
    }
}

const countAdjacentMines = (x, y) => {
    const { cols, rows } = currentConfig.value
    let count = 0

    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue
            const nx = x + dx
            const ny = y + dy
            if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && board.value[ny][nx].mine) {
                count++
            }
        }
    }

    return count
}

const resetGame = () => {
    initBoard()
}

const setDifficulty = (diff) => {
    difficulty.value = diff
    initBoard()
}

const applyCustomSettings = () => {
    
    customCols.value = Math.max(5, Math.min(30, customCols.value))
    customRows.value = Math.max(5, Math.min(24, customRows.value))
    customMines.value = Math.max(1, Math.min(maxCustomMines.value, customMines.value))
    initBoard()
}


const revealCell = (x, y) => {
    if (gameState.value === 'won' || gameState.value === 'lost') return

    const cell = board.value[y][x]
    if (cell.revealed || cell.flagged) return

    
    if (firstClick.value) {
        placeMines(x, y)
        firstClick.value = false
        gameState.value = 'playing'
        startTimer()
    }

    
    if (cell.mine) {
        cell.revealed = true
        gameOver(false)
        return
    }

    
    revealCellRecursive(x, y)

    
    checkWin()
}

const revealCellRecursive = (x, y) => {
    const { cols, rows } = currentConfig.value
    if (x < 0 || x >= cols || y < 0 || y >= rows) return

    const cell = board.value[y][x]
    if (cell.revealed || cell.flagged || cell.mine) return

    cell.revealed = true

    
    if (cell.adjacentMines === 0) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx !== 0 || dy !== 0) {
                    revealCellRecursive(x + dx, y + dy)
                }
            }
        }
    }
}

const toggleFlag = (x, y) => {
    if (gameState.value === 'won' || gameState.value === 'lost') return

    const cell = board.value[y][x]
    if (cell.revealed) return

    
    if (!cell.flagged && !cell.questioned) {
        cell.flagged = true
    } else if (cell.flagged) {
        cell.flagged = false
        cell.questioned = true
    } else {
        cell.questioned = false
    }
}

const handleMouseDown = (event, x, y) => {
    if (event.button === 0) leftDown.value = true
    if (event.button === 2) rightDown.value = true

    
    if (leftDown.value && rightDown.value) {
        chordReveal(x, y)
    }
}

const handleMouseUp = () => {
    leftDown.value = false
    rightDown.value = false
}

const chordReveal = (x, y) => {
    if (gameState.value !== 'playing') return

    const cell = board.value[y][x]
    if (!cell.revealed || cell.adjacentMines === 0) return

    const { cols, rows } = currentConfig.value

    
    let flagCount = 0
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx
            const ny = y + dy
            if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                if (board.value[ny][nx].flagged) flagCount++
            }
        }
    }

    
    if (flagCount === cell.adjacentMines) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const nx = x + dx
                const ny = y + dy
                if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                    const neighbor = board.value[ny][nx]
                    if (!neighbor.revealed && !neighbor.flagged) {
                        if (neighbor.mine) {
                            neighbor.revealed = true
                            gameOver(false)
                            return
                        }
                        revealCellRecursive(nx, ny)
                    }
                }
            }
        }
        checkWin()
    }
}

const checkWin = () => {
    const { cols, rows, mines } = currentConfig.value
    let revealedCount = 0

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (board.value[y][x].revealed) revealedCount++
        }
    }

    if (revealedCount === cols * rows - mines) {
        gameOver(true)
    }
}

const gameOver = (won) => {
    stopTimer()
    gameState.value = won ? 'won' : 'lost'

    if (won) {
        stats.value.wins++
        if (stats.value.bestTime === null || timer.value < stats.value.bestTime) {
            stats.value.bestTime = timer.value
        }
    } else {
        stats.value.losses++
        
        board.value.forEach(row => {
            row.forEach(cell => {
                if (cell.mine) cell.revealed = true
            })
        })
    }

    saveStats()
}


const startTimer = () => {
    if (timerInterval.value) return
    timerInterval.value = setInterval(() => {
        timer.value++
    }, 1000)
}

const stopTimer = () => {
    if (timerInterval.value) {
        clearInterval(timerInterval.value)
        timerInterval.value = null
    }
}


const getCellClass = (cell) => {
    return {
        revealed: cell.revealed,
        mine: cell.revealed && cell.mine,
        flagged: cell.flagged,
        questioned: cell.questioned
    }
}


const saveStats = () => {
    localStorage.setItem('minesweeper-stats', JSON.stringify(stats.value))
}

const loadStats = () => {
    const saved = localStorage.getItem('minesweeper-stats')
    if (saved) {
        stats.value = JSON.parse(saved)
    }
}


onMounted(() => {
    loadStats()
    initBoard()
})

onUnmounted(() => {
    stopTimer()
})

watch(difficulty, () => {
    initBoard()
})
</script>

<style scoped>
.minesweeper-tool {
    --bg: #f5f7fa;
    --card: #ffffff;
    --border: #eef2f7;
    --text: #2c3e50;
    --text-secondary: #7f8c8d;
    --primary: #409eff;
    --success: #67c23a;
    --warning: #e6a23c;
    --danger: #f56c6c;

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


.game-header {
    width: 100%;
}

.info-panel {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    background: linear-gradient(145deg, #667eea, #764ba2);
    padding: 0.8rem 2rem;
    border-radius: 12px;
    color: white;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.info-icon {
    font-size: 1.2rem;
}

.info-value {
    font-size: 1.2rem;
    font-weight: bold;
    min-width: 50px;
    font-family: 'Courier New', monospace;
}

.reset-btn {
    width: 50px;
    height: 50px;
    border: none;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.2);
    cursor: pointer;
    font-size: 1.8rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.reset-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
}

.reset-btn:active {
    transform: scale(0.95);
}


.board-container {
    display: flex;
    justify-content: center;
}

.board {
    background: #bdbdbd;
    padding: 4px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.board-row {
    display: contents;
}

.cell {
    width: 28px;
    height: 28px;
    background: linear-gradient(145deg, #c8c8c8, #a8a8a8);
    border: 2px outset #d0d0d0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    user-select: none;
    transition: all 0.1s;
}

.cell:hover:not(.revealed) {
    filter: brightness(1.1);
}

.cell:active:not(.revealed) {
    border-style: inset;
}

.cell.revealed {
    background: #e0e0e0;
    border: 1px solid #bdbdbd;
    cursor: default;
}

.cell.revealed.mine {
    background: #ff6b6b !important;
}

.mine {
    font-size: 16px;
}

.flag {
    font-size: 14px;
}

.question {
    font-size: 14px;
}

.number {
    font-size: 14px;
    font-weight: bold;
}

.number.n1 {
    color: #0000ff;
}

.number.n2 {
    color: #008000;
}

.number.n3 {
    color: #ff0000;
}

.number.n4 {
    color: #000080;
}

.number.n5 {
    color: #800000;
}

.number.n6 {
    color: #008080;
}

.number.n7 {
    color: #000000;
}

.number.n8 {
    color: #808080;
}


.game-controls {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
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

.control-btn:hover {
    border-color: var(--primary);
    color: var(--primary);
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

.difficulty-selector {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.diff-btn {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 1rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--card);
    color: var(--text);
    cursor: pointer;
    transition: all 0.2s;
}

.diff-btn:hover {
    border-color: var(--primary);
}

.diff-btn.active {
    background: var(--primary);
    border-color: var(--primary);
    color: white;
}

.diff-name {
    font-weight: 500;
}

.diff-info {
    font-size: 0.8rem;
    opacity: 0.7;
}


.custom-inputs {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
}

.input-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.input-group label {
    width: 60px;
    font-size: 0.9rem;
    color: var(--text-secondary);
}

.input-group input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid var(--border);
    border-radius: 6px;
    font-size: 0.9rem;
}

.input-group input:focus {
    outline: none;
    border-color: var(--primary);
}

.apply-btn {
    width: 100%;
    padding: 0.7rem;
    background: var(--primary);
    border: none;
    border-radius: 8px;
    color: white;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.2s;
}

.apply-btn:hover {
    background: #3a8ee6;
}


.instructions {
    background: #f8fafc;
    border-radius: 8px;
    padding: 1rem;
}

.instructions p {
    margin: 0.3rem 0;
    font-size: 0.85rem;
    color: var(--text-secondary);
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


.footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
    font-size: 0.85rem;
    border-top: 1px solid var(--border);
}


@media (max-width: 900px) {
    .layout-grid {
        grid-template-columns: 1fr;
    }

    .settings-section {
        order: -1;
    }
}

@media (max-width: 500px) {
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

    .info-panel {
        gap: 1rem;
        padding: 0.6rem 1rem;
    }
}
</style>
