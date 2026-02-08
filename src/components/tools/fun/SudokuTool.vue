<template>
    <div class="sudoku-tool">
        <nav class="nav-bar">
            <button @click="$router.back()" class="nav-back">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>数独</h1>
                <span class="nav-subtitle">Sudoku</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="game-container">

                <div class="top-bar">
                    <div class="difficulty-select">
                        <span v-for="d in difficulties" :key="d.value" :class="{ active: difficulty === d.value }"
                            @click="setDifficulty(d.value)">{{ d.label }}</span>
                    </div>
                    <div class="settings-toggle">
                        <el-switch v-model="assistMode" inactive-text="" active-text="辅助显示" />
                    </div>
                    <div class="timer">
                        <el-icon>
                            <Timer />
                        </el-icon>
                        {{ formattedTime }}
                    </div>
                </div>


                <div class="sudoku-grid">
                    <div v-for="(row, ri) in board" :key="ri" class="sudoku-row">
                        <div v-for="(cell, ci) in row" :key="ci" class="sudoku-cell" :class="{
                            'is-fixed': cell.fixed,
                            'is-selected': selectedCell?.row === ri && selectedCell?.col === ci,
                            'is-same-value': assistMode && cell.value && selectedCell && board[selectedCell.row][selectedCell.col].value === cell.value,
                            'is-same-region': isSameRegion(ri, ci),
                            'is-hint': cell.hint,
                            'is-error': cell.error,
                            'border-right': (ci + 1) % 3 === 0 && ci !== 8,
                            'border-bottom': (ri + 1) % 3 === 0 && ri !== 8
                        }" @click="selectCell(ri, ci)">
                            <span v-if="cell.value">{{ cell.value }}</span>
                            <div v-else class="notes">
                                <span v-for="n in cell.notes" :key="n">{{ n }}</span>
                            </div>
                        </div>
                    </div>
                </div>


                <div class="numpad">
                    <button v-for="n in 9" :key="n" class="num-btn"
                        :class="{ 'is-complete': assistMode && isNumberComplete(n) }" @click="inputNumber(n)">{{ n
                        }}</button>
                </div>


                <div class="action-bar">
                    <button class="action-btn" @click="clearCell">
                        <el-icon>
                            <Delete />
                        </el-icon> 清除
                    </button>
                    <button class="action-btn" @click="toggleNoteMode" :class="{ active: noteMode }">
                        <el-icon>
                            <Edit />
                        </el-icon> 笔记
                    </button>
                    <button class="action-btn" @click="useHint">
                        <el-icon>
                            <MagicStick />
                        </el-icon> 提示
                    </button>
                    <button class="action-btn" @click="checkSolution">
                        <el-icon>
                            <Check />
                        </el-icon> 检查
                    </button>
                </div>


                <div class="action-bar-bottom">
                    <button class="new-game-btn" @click="newGame">
                        <el-icon>
                            <RefreshRight />
                        </el-icon> 新游戏
                    </button>
                    <button class="history-btn" @click="showHistory = true">
                        <el-icon>
                            <Memo />
                        </el-icon> 历史记录
                    </button>
                </div>
            </div>
        </main>


        <el-dialog v-model="showVictory" title="恭喜！" width="350px" center>
            <div class="victory-content">
                <p class="victory-time">用时：{{ formattedTime }}</p>
                <p class="victory-difficulty">难度：{{ currentDifficultyLabel }}</p>
            </div>
            <template #footer>
                <div class="dialog-footer">
                    <button class="dialog-btn secondary" @click="showHistory = true; showVictory = false">查看历史</button>
                    <button class="dialog-btn" @click="newGame(); showVictory = false">再来一局</button>
                </div>
            </template>
        </el-dialog>

        <el-dialog v-model="showHistory" title="历史记录" width="400px" center>
            <div class="history-container">
                <div v-if="gameHistory.length === 0" class="no-history">暂无记录</div>
                <div v-else class="history-list">
                    <div v-for="(record, index) in gameHistory" :key="index" class="history-item">
                        <div class="record-main">
                            <span class="record-difficulty" :class="record.difficulty">{{ record.difficultyLabel
                            }}</span>
                            <span class="record-time">{{ record.time }}</span>
                        </div>
                        <div class="record-date">{{ record.date }}</div>
                    </div>
                </div>
            </div>
            <template #footer>
                <button class="dialog-btn" @click="showHistory = false">关闭</button>
            </template>
        </el-dialog>

        <footer class="footer">
            © 2026 LRM工具箱 - 数独
        </footer>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { Back, Timer, Delete, Edit, MagicStick, Check, RefreshRight, Memo } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'


const difficulties = [
    { value: 'easy', label: '简单', empty: 30 },
    { value: 'medium', label: '中等', empty: 40 },
    { value: 'hard', label: '困难', empty: 50 }
]
const difficulty = ref('easy')
const board = ref([])
const solution = ref([])
const selectedCell = ref(null)
const noteMode = ref(false)
const showVictory = ref(false)
const showHistory = ref(false)
const assistMode = ref(true)
const gameHistory = ref([])

const HISTORY_KEY = 'sudoku_game_history'

const loadHistory = () => {
    const saved = localStorage.getItem(HISTORY_KEY)
    if (saved) {
        try {
            gameHistory.value = JSON.parse(saved)
        } catch (e) {
            gameHistory.value = []
        }
    }
}

const saveRecord = (time, diff) => {
    const record = {
        time,
        difficulty: diff,
        difficultyLabel: difficulties.find(d => d.value === diff)?.label || '未知',
        date: new Date().toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    }
    gameHistory.value.unshift(record)

    if (gameHistory.value.length > 50) {
        gameHistory.value = gameHistory.value.slice(0, 50)
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(gameHistory.value))
}


const startTime = ref(0)
const elapsedTime = ref(0)
let timerInterval = null

const formattedTime = computed(() => {
    const t = elapsedTime.value
    const m = Math.floor(t / 60000)
    const s = Math.floor((t % 60000) / 1000)
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const currentDifficultyLabel = computed(() => {
    return difficulties.find(d => d.value === difficulty.value)?.label || ''
})




const generateSolution = () => {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(0))
    fillGrid(grid)
    return grid
}

const fillGrid = (grid) => {
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    for (let i = 0; i < 81; i++) {
        const row = Math.floor(i / 9)
        const col = i % 9
        if (grid[row][col] === 0) {
            shuffle(nums)
            for (const num of nums) {
                if (isValid(grid, row, col, num)) {
                    grid[row][col] = num
                    if (!grid.flat().includes(0) || fillGrid(grid)) {
                        return true
                    }
                    grid[row][col] = 0
                }
            }
            return false
        }
    }
    return true
}

const isValid = (grid, row, col, num) => {

    if (grid[row].includes(num)) return false

    if (grid.some(r => r[col] === num)) return false

    const boxRow = Math.floor(row / 3) * 3
    const boxCol = Math.floor(col / 3) * 3
    for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
            if (grid[r][c] === num) return false
        }
    }
    return true
}

const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]
    }
}


const createPuzzle = (sol, emptyCount) => {
    const puzzle = sol.map(row => row.map(val => ({ value: val, fixed: true, notes: [], error: false, hint: false })))
    const positions = []
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            positions.push([r, c])
        }
    }
    shuffle(positions)

    for (let i = 0; i < emptyCount && i < positions.length; i++) {
        const [r, c] = positions[i]
        puzzle[r][c] = { value: 0, fixed: false, notes: [], error: false, hint: false }
    }
    return puzzle
}



const newGame = () => {
    const sol = generateSolution()
    solution.value = sol
    const emptyCount = difficulties.find(d => d.value === difficulty.value)?.empty || 30
    board.value = createPuzzle(sol, emptyCount)
    selectedCell.value = null
    noteMode.value = false
    showVictory.value = false
    startTimer()
}

const setDifficulty = (val) => {
    difficulty.value = val
    newGame()
}

const selectCell = (row, col) => {
    selectedCell.value = { row, col }
}

const isSameRegion = (row, col) => {
    if (!selectedCell.value) return false
    const sr = selectedCell.value.row
    const sc = selectedCell.value.col
    return row === sr || col === sc ||
        (Math.floor(row / 3) === Math.floor(sr / 3) && Math.floor(col / 3) === Math.floor(sc / 3))
}

const inputNumber = (num) => {
    if (!selectedCell.value) return
    const { row, col } = selectedCell.value
    const cell = board.value[row][col]
    if (cell.fixed) return

    if (noteMode.value) {

        if (cell.notes.includes(num)) {
            cell.notes = cell.notes.filter(n => n !== num)
        } else {
            cell.notes.push(num)
            cell.notes.sort((a, b) => a - b)
        }
        cell.value = 0
    } else {
        cell.value = num
        cell.notes = []
        cell.error = false


        clearNotesForNumber(row, col, num)


        checkCompletion()
    }
}

const clearNotesForNumber = (row, col, num) => {

    for (let c = 0; c < 9; c++) {
        board.value[row][c].notes = board.value[row][c].notes.filter(n => n !== num)
    }

    for (let r = 0; r < 9; r++) {
        board.value[r][col].notes = board.value[r][col].notes.filter(n => n !== num)
    }

    const boxRow = Math.floor(row / 3) * 3
    const boxCol = Math.floor(col / 3) * 3
    for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
            board.value[r][c].notes = board.value[r][c].notes.filter(n => n !== num)
        }
    }
}

const clearCell = () => {
    if (!selectedCell.value) return
    const { row, col } = selectedCell.value
    const cell = board.value[row][col]
    if (cell.fixed) return
    cell.value = 0
    cell.notes = []
    cell.error = false
}

const toggleNoteMode = () => {
    noteMode.value = !noteMode.value
}

const useHint = () => {
    const emptyCells = []
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (board.value[r][c].value === 0 || board.value[r][c].value !== solution.value[r][c]) {
                emptyCells.push([r, c])
            }
        }
    }

    if (emptyCells.length === 0) return

    shuffle(emptyCells)
    const [r, c] = emptyCells[0]
    board.value[r][c].value = solution.value[r][c]
    board.value[r][c].notes = []
    board.value[r][c].error = false
    board.value[r][c].hint = true

    // 1.5秒后取消提示动画状态
    setTimeout(() => {
        if (board.value[r] && board.value[r][c]) {
            board.value[r][c].hint = false
        }
    }, 1500)

    checkCompletion()
}

const checkSolution = () => {
    let hasError = false
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const cell = board.value[r][c]
            if (cell.value !== 0 && cell.value !== solution.value[r][c]) {
                cell.error = true
                hasError = true
            } else {
                cell.error = false
            }
        }
    }

    if (hasError) {
        ElMessage.warning('存在错误，请检查红色标记的格子')
    } else {
        ElMessage.success('目前没有错误，继续加油！')
    }
}

const checkCompletion = () => {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (board.value[r][c].value !== solution.value[r][c]) {
                return
            }
        }
    }

    stopTimer()
    saveRecord(formattedTime.value, difficulty.value)
    showVictory.value = true
}

const isNumberComplete = (num) => {
    if (!board.value || board.value.length === 0) return false
    let count = 0
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (board.value[r][c].value === num) count++
        }
    }
    return count >= 9
}


const startTimer = () => {
    stopTimer()
    startTime.value = Date.now()
    elapsedTime.value = 0
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


const handleKeydown = (e) => {
    if (!selectedCell.value) return

    const key = e.key
    if (key >= '1' && key <= '9') {
        inputNumber(parseInt(key))
    } else if (key === 'Backspace' || key === 'Delete') {
        clearCell()
    } else if (key === 'ArrowUp' && selectedCell.value.row > 0) {
        selectedCell.value.row--
    } else if (key === 'ArrowDown' && selectedCell.value.row < 8) {
        selectedCell.value.row++
    } else if (key === 'ArrowLeft' && selectedCell.value.col > 0) {
        selectedCell.value.col--
    } else if (key === 'ArrowRight' && selectedCell.value.col < 8) {
        selectedCell.value.col++
    }
}

onMounted(() => {
    loadHistory()
    newGame()
    window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
    stopTimer()
    window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.sudoku-tool {
    --bg: #f5f7fa;
    --card: #ffffff;
    --text: #2c3e50;
    --text-secondary: #7f8c8d;
    --primary: #409eff;
    --border: #eef2f7;
    --cell-bg: #fff;
    --cell-selected: #bbdefb;
    --cell-same-region: #e3f2fd;
    --cell-same-value: #c5cae9;
    --cell-fixed: #eceff1;
    --cell-error: #ffcdd2;

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
    padding: 1.5rem 1rem;
}

.game-container {
    width: 100%;
    max-width: 450px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}


.top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.difficulty-select {
    display: flex;
    gap: 6px;
}

.difficulty-select span {
    padding: 6px 14px;
    border-radius: 16px;
    background: #e0e0e0;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s;
}

.difficulty-select span.active {
    background: var(--primary);
    color: white;
}

.timer {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 1.1rem;
    font-weight: bold;
    color: var(--text);
}

.settings-toggle {
    display: flex;
    align-items: center;
    margin: 0 10px;
}

:deep(.el-switch__label) {
    font-size: 12px;
    color: var(--text-secondary);
}

:deep(.el-switch__label.is-active) {
    color: var(--primary);
}


.sudoku-grid {
    background: #333;
    padding: 2px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 1px;
}

.sudoku-row {
    display: flex;
    gap: 1px;
}

.sudoku-cell {
    width: calc((100% - 8px) / 9);
    aspect-ratio: 1;
    background: var(--cell-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    font-weight: bold;
    color: var(--text);
    cursor: pointer;
    position: relative;
    transition: background 0.1s;
}

.sudoku-cell.is-fixed {
    background: var(--cell-fixed);
    color: #333;
}

.sudoku-cell.is-same-region {
    background: var(--cell-same-region);
}

.sudoku-cell.is-same-value {
    background: var(--cell-same-value);
}

.sudoku-cell.is-selected {
    background: var(--cell-selected) !important;
}

.sudoku-cell.is-error {
    background: var(--cell-error) !important;
}

.sudoku-cell.is-hint {
    animation: hint-pulse 0.5s ease-in-out 3;
}

@keyframes hint-pulse {
    0% {
        background-color: var(--cell-bg);
    }

    50% {
        background-color: #ffd54f;
    }

    100% {
        background-color: var(--cell-bg);
    }
}

.sudoku-cell.border-right {
    border-right: 2px solid #333;
}

.sudoku-cell.border-bottom {
    border-bottom: 2px solid #333;
}


.notes {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    font-size: 0.55rem;
    color: var(--text-secondary);
    width: 100%;
    height: 100%;
    padding: 2px;
}

.notes span {
    display: flex;
    align-items: center;
    justify-content: center;
}


.numpad {
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    gap: 6px;
}

.num-btn {
    aspect-ratio: 1;
    border: none;
    border-radius: 8px;
    background: var(--card);
    font-size: 1.3rem;
    font-weight: bold;
    color: var(--text);
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    transition: all 0.15s;
}

.num-btn:hover {
    background: #e3f2fd;
}

.num-btn.is-complete {
    opacity: 0.3;
}


.action-bar {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
}

.action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 10px 8px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--card);
    font-size: 0.8rem;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;
}

.action-btn:hover {
    border-color: var(--primary);
    color: var(--primary);
}

.action-btn.active {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
}

.action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.action-bar-bottom {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 10px;
}

.new-game-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    border: none;
    border-radius: 8px;
    background: var(--primary);
    color: white;
    font-size: 1rem;
    cursor: pointer;
    transition: filter 0.2s;
}

.history-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--card);
    color: var(--text);
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
}

.history-btn:hover {
    border-color: var(--primary);
    color: var(--primary);
}

.new-game-btn:hover {
    filter: brightness(1.1);
}

.dialog-footer {
    display: flex;
    gap: 10px;
}

.dialog-btn.secondary {
    background: #f0f2f5;
    color: var(--text);
}

.history-container {
    max-height: 400px;
    overflow-y: auto;
}

.no-history {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
}

.history-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.history-item {
    padding: 12px;
    background: #f8fafc;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.record-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.record-difficulty {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: bold;
}

.record-difficulty.easy {
    background: #e8f5e9;
    color: #2e7d32;
}

.record-difficulty.medium {
    background: #fff3e0;
    color: #ef6c00;
}

.record-difficulty.hard {
    background: #ffebee;
    color: #c62828;
}

.record-time {
    font-weight: bold;
    color: var(--primary);
}

.record-date {
    font-size: 0.75rem;
    color: var(--text-secondary);
}


.victory-content {
    text-align: center;
    padding: 1rem 0;
}

.victory-time {
    font-size: 2rem;
    font-weight: bold;
    color: var(--primary);
    margin: 0 0 0.5rem 0;
}

.victory-difficulty {
    color: var(--text-secondary);
    margin: 0;
}

.dialog-btn {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 8px;
    background: var(--primary);
    color: white;
    font-size: 1rem;
    cursor: pointer;
}

.footer {
    text-align: center;
    padding: 2rem 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
    border-top: 1px solid var(--border);
    background: var(--card);
}
</style>
