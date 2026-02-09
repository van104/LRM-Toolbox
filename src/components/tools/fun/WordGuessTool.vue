<template>
    <div class="word-guess-tool">
        <nav class="nav-bar">
            <button class="nav-back" @click="$router.back()">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>猜词游戏</h1>
                <span class="nav-subtitle">Wordle</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="game-container">
                
                <div class="status-bar">
                    <div class="mode-switch">
                        <span :class="{ active: mode === 'english' }" @click="switchMode('english')">英文 (5字母)</span>
                        <span :class="{ active: mode === 'chinese' }" @click="switchMode('chinese')">中文 (4字成语)</span>
                    </div>
                </div>

                <div class="game-controls">
                    <button class="control-btn" @click="handleHint">
                        <el-icon class="icon">
                            <Opportunity />
                        </el-icon> 提示
                    </button>
                    <button class="control-btn" @click="showStats = true">
                        <el-icon class="icon">
                            <TrendCharts />
                        </el-icon> 统计
                    </button>
                    <button class="control-btn" @click="showHelp = true">
                        <el-icon class="icon">
                            <QuestionFilled />
                        </el-icon> 规则
                    </button>
                </div>

                <div v-if="message" class="feedback-message">
                    {{ message }}
                </div>

                
                <div class="grid-container" :class="mode">
                    <div
v-for="(row, rowIndex) in board" :key="rowIndex" class="grid-row"
                        :class="{ 'shake': shakingRow === rowIndex }">
                        <div
v-for="(cell, colIndex) in row" :key="colIndex" class="grid-cell"
                            :class="[cell.status, { 'filled': cell.char }]"
                            :style="{ animationDelay: `${colIndex * 100}ms` }">
                            {{ cell.char }}
                        </div>
                    </div>
                </div>

                
                <div v-if="mode === 'english'" class="keyboard-container">
                    <div v-for="(row, rIdx) in keyboardRows" :key="rIdx" class="keyboard-row">
                        <button
v-for="key in row" :key="key" class="key-btn"
                            :class="[getKeyStatus(key), key === 'ENTER' || key === 'DEL' ? 'action-key' : '']"
                            @click="handleKeyClick(key)">
                            <el-icon v-if="key === 'DEL'">
                                <Delete />
                            </el-icon>
                            <span v-else>{{ key }}</span>
                        </button>
                    </div>
                </div>

                
                <div v-if="mode === 'chinese' && gameState === 'playing'" class="chinese-input-area">
                    <input
ref="chineseInputRef" v-model="chineseInputDisplay" type="text" placeholder="点击此处输入四字成语，按回车确认"
                        class="real-input" maxlength="4" @input="handleChineseInput" @keydown.enter="submitGuess">
                    <button class="submit-btn" :disabled="currentGuess.length !== 4" @click="submitGuess">确认提交</button>
                </div>

                <div v-if="gameState !== 'playing'" class="game-over-actions">
                    <button class="restart-btn" @click="initGame">
                        <el-icon>
                            <Refresh />
                        </el-icon> 再来一局
                    </button>
                </div>
            </div>
        </main>

        
        <el-dialog v-model="showHelp" title="游戏规则" width="500px" center custom-class="game-dialog">
            <div class="help-content">
                <p>在 6 次机会内猜出目标词汇。</p>
                <p>每次猜测后，方块颜色会发生变化：</p>
                <div class="example-row">
                    <div class="grid-cell correct filled">W</div>
                    <span>绿色：字母/汉字 位置正确</span>
                </div>
                <div class="example-row">
                    <div class="grid-cell present filled">O</div>
                    <span>黄色：字母/汉字 存在但位置不对</span>
                </div>
                <div class="example-row">
                    <div class="grid-cell absent filled">R</div>
                    <span>灰色：字母/汉字 不存在</span>
                </div>
                <p style="margin-top: 1rem; color: #666;">
                    * 每日挑战模式每人每天题目相同。<br>
                    * 中文模式支持直接输入汉字。
                </p>
            </div>
        </el-dialog>

        
        <el-dialog v-model="showStats" title="游戏统计" width="400px" center custom-class="game-dialog">
            <div class="stats-content">
                <div class="stat-grid">
                    <div class="stat-item">
                        <div class="stat-val">{{ stats[mode].played }}</div>
                        <div class="stat-label">场次</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-val">{{ stats[mode].winRate }}%</div>
                        <div class="stat-label">胜率</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-val">{{ stats[mode].streak }}</div>
                        <div class="stat-label">连胜</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-val">{{ stats[mode].maxStreak }}</div>
                        <div class="stat-label">最高连胜</div>
                    </div>
                </div>
            </div>
        </el-dialog>

        <footer class="footer">
            © 2026 LRM工具箱 - 猜词游戏
        </footer>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { Back, TrendCharts, QuestionFilled, Delete, Refresh, Opportunity } from '@element-plus/icons-vue'
import { chineseIdioms, englishWords } from '@/data/wordGuessData'
import { ElMessage } from 'element-plus'


const mode = ref('english') 
const board = ref([])
const gameState = ref('playing') 
const currentRow = ref(0)
const currentGuess = ref([]) 
const targetWord = ref('')
const message = ref('')
const shakingRow = ref(-1)

const showHelp = ref(false)
const showStats = ref(false)
const chineseInputRef = ref(null)
const chineseInputDisplay = ref('')

const stats = reactive({
    english: { played: 0, wins: 0, winRate: 0, streak: 0, maxStreak: 0 },
    chinese: { played: 0, wins: 0, winRate: 0, streak: 0, maxStreak: 0 }
})


const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL']
]


const keyStatus = reactive({}) 



const initGame = () => {
    
    const wordList = mode.value === 'english' ? englishWords : chineseIdioms
    
    targetWord.value = wordList[Math.floor(Math.random() * wordList.length)].toUpperCase()

    
    const rows = 6
    const cols = mode.value === 'english' ? 5 : 4
    board.value = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => ({ char: '', status: '' }))
    )

    
    currentRow.value = 0
    currentGuess.value = []
    gameState.value = 'playing'
    message.value = ''
    chineseInputDisplay.value = ''

    
    for (const key in keyStatus) delete keyStatus[key]

    
    if (mode.value === 'chinese') {
        setTimeout(() => chineseInputRef.value?.focus(), 100)
    }
}

const switchMode = (newMode) => {
    if (newMode === mode.value) return
    mode.value = newMode
    initGame()
}


const handleKeyClick = (key) => {
    if (gameState.value !== 'playing') return

    if (key === 'ENTER') {
        submitGuess()
    } else if (key === 'DEL') {
        if (currentGuess.value.length > 0) {
            currentGuess.value.pop()
            updateBoard()
        }
    } else {
        const maxLen = mode.value === 'english' ? 5 : 4
        if (currentGuess.value.length < maxLen) {
            currentGuess.value.push(key)
            updateBoard()
        }
    }
}


const handlePhysicalKeydown = (e) => {
    if (mode.value !== 'english' || gameState.value !== 'playing') return
    if (e.ctrlKey || e.altKey || e.metaKey) return

    const key = e.key.toUpperCase()
    if (key === 'ENTER') {
        handleKeyClick('ENTER')
    } else if (key === 'BACKSPACE') {
        handleKeyClick('DEL')
    } else if (/^[A-Z]$/.test(key)) {
        handleKeyClick(key)
    }
}


const handleChineseInput = (e) => {
    
    
    
    const val = e.target.value

    
    currentGuess.value = val.split('').slice(0, 4)
    updateBoard()
}


const updateBoard = () => {
    const row = board.value[currentRow.value]
    for (let i = 0; i < row.length; i++) {
        row[i].char = currentGuess.value[i] || ''
    }
}


const submitGuess = () => {
    const maxLen = mode.value === 'english' ? 5 : 4
    const guessStr = currentGuess.value.join('')

    if (currentGuess.value.length !== maxLen) {
        showMessage('字数不足')
        shake()
        return
    }

    
    
    if (mode.value === 'english') {
        if (!englishWords.includes(guessStr)) {
            
            
            
            
            
        }
    }

    
    const targetArr = targetWord.value.split('')
    const guessArr = [...currentGuess.value]
    const row = board.value[currentRow.value]

    
    
    const targetUsed = Array(maxLen).fill(false)
    const guessStatus = Array(maxLen).fill('absent')

    
    for (let i = 0; i < maxLen; i++) {
        if (guessArr[i] === targetArr[i]) {
            guessStatus[i] = 'correct'
            targetUsed[i] = true
            updateKeyStatus(guessArr[i], 'correct')
        }
    }

    
    for (let i = 0; i < maxLen; i++) {
        if (guessStatus[i] !== 'correct') {
            const char = guessArr[i]
            const indexInTarget = targetArr.findIndex((c, idx) => c === char && !targetUsed[idx])
            if (indexInTarget !== -1) {
                guessStatus[i] = 'present'
                targetUsed[indexInTarget] = true
                updateKeyStatus(char, 'present')
            } else {
                updateKeyStatus(char, 'absent')
            }
        }
    }

    
    for (let i = 0; i < maxLen; i++) {
        row[i].status = guessStatus[i]
    }

    
    if (guessStr === targetWord.value) {
        gameState.value = 'won'
        showMessage(getRandomPraise())
        updateStats(true)
    } else if (currentRow.value >= 5) {
        gameState.value = 'lost'
        showMessage(`游戏结束！答案是：${targetWord.value}`)
        updateStats(false)
    } else {
        currentRow.value++
        currentGuess.value = []
        chineseInputDisplay.value = '' 
    }
}

const updateKeyStatus = (key, status) => {
    const priorities = { 'correct': 3, 'present': 2, 'absent': 1, '': 0 }
    const current = keyStatus[key] || ''

    if (priorities[status] > priorities[current]) {
        keyStatus[key] = status
    }
}

const getKeyStatus = (key) => keyStatus[key] || ''

const showMessage = (msg) => {
    message.value = msg
    setTimeout(() => {
        message.value = ''
    }, 2000)
}

const shake = () => {
    shakingRow.value = currentRow.value
    setTimeout(() => shakingRow.value = -1, 500)
}

const getRandomPraise = () => {
    const praises = ['太棒了！', '神机妙算！', '不可思议！', '天才！']
    return praises[Math.floor(Math.random() * praises.length)]
}


const handleHint = () => {
    if (gameState.value !== 'playing') return

    
    const targetArr = targetWord.value.split('')
    const unsolvedIndices = []

    
    
    
    
    const correctMask = Array(targetArr.length).fill(false)
    for (let r = 0; r < currentRow.value; r++) {
        const row = board.value[r]
        row.forEach((cell, idx) => {
            if (cell.status === 'correct') {
                correctMask[idx] = true
            }
        })
    }

    targetArr.forEach((_, idx) => {
        if (!correctMask[idx]) {
            unsolvedIndices.push(idx)
        }
    })

    if (unsolvedIndices.length === 0) {
        showMessage('你已经知道所有答案了！')
        return
    }

    
    const hintIdx = unsolvedIndices[Math.floor(Math.random() * unsolvedIndices.length)]
    const hintChar = targetArr[hintIdx]

    showMessage(`提示：第 ${hintIdx + 1} 个字是 "${hintChar}"`)
}


const updateStats = (win) => {
    const s = stats[mode.value]
    s.played++
    if (win) {
        s.wins++
        s.streak++
        s.maxStreak = Math.max(s.streak, s.maxStreak)
    } else {
        s.streak = 0
    }
    s.winRate = Math.round((s.wins / s.played) * 100)
    saveStats()
}

const saveStats = () => {
    localStorage.setItem('word-guess-stats', JSON.stringify(stats))
}

const loadStats = () => {
    const saved = localStorage.getItem('word-guess-stats')
    if (saved) {
        const parsed = JSON.parse(saved)
        Object.keys(parsed).forEach(k => {
            if (stats[k]) Object.assign(stats[k], parsed[k])
        })
    }
}

onMounted(() => {
    loadStats()
    initGame()
    window.addEventListener('keydown', handlePhysicalKeydown)
})

onUnmounted(() => {
    window.removeEventListener('keydown', handlePhysicalKeydown)
})
</script>

<style scoped>
.word-guess-tool {
    --bg: #f5f7fa;
    --card: #ffffff;
    --border: #eef2f7;
    --text: #2c3e50;
    --correct: #6aaa64;
    --present: #c9b458;
    --absent: #787c7e;
    --key-bg: #d3d6da;

    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
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

.nav-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

.icon-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
}

.icon-btn:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: var(--text);
}

.main-content {
    display: flex;
    justify-content: center;
    padding: 2rem 1rem;
}

.game-container {
    width: 100%;
    max-width: 500px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.status-bar {
    margin-bottom: 1rem;
}

.mode-switch {
    background: #e0e0e0;
    padding: 4px;
    border-radius: 20px;
    display: flex;
}

.mode-switch span {
    padding: 6px 16px;
    border-radius: 16px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
}

.mode-switch span.active {
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    font-weight: bold;
}

.feedback-message {
    position: fixed;
    top: 80px;
    background: #333;
    color: white;
    padding: 10px 20px;
    border-radius: 4px;
    z-index: 100;
    animation: fade 0.3s;
}


.game-controls {
    display: flex;
    gap: 12px;
    margin-bottom: 10px;
}

.control-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: white;
    border: 1px solid var(--border);
    border-radius: 20px;
    font-size: 0.9rem;
    color: var(--text);
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: all 0.2s;
}

.control-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-color: #dcdfe6;
}

.control-btn .icon {
    font-size: 1.1em;
}


.grid-container {
    display: grid;
    gap: 5px;
    background: 10px;
}

.grid-row {
    display: flex;
    gap: 5px;
}

.grid-cell {
    width: 52px;
    height: 52px;
    border: 2px solid #d3d6da;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
    font-weight: bold;
    text-transform: uppercase;
    background: white;
    transition: all 0.2s;
}


.grid-cell.filled {
    border-color: #878a8c;
    animation: pop 0.1s;
}

.grid-cell.correct {
    background: var(--correct);
    color: white;
    border-color: var(--correct);
    animation: flip 0.6s ease forwards;
}

.grid-cell.present {
    background: var(--present);
    color: white;
    border-color: var(--present);
    animation: flip 0.6s ease forwards;
}

.grid-cell.absent {
    background: var(--absent);
    color: white;
    border-color: var(--absent);
    animation: flip 0.6s ease forwards;
}

.grid-container.chinese .grid-cell {
    width: 70px;
    height: 70px;
    font-size: 2rem;
}


.keyboard-container {
    margin-top: 2rem;
    width: 100%;
}

.keyboard-row {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-bottom: 8px;
}

.key-btn {
    background: var(--key-bg);
    border: none;
    border-radius: 4px;
    width: 40px;
    height: 50px;
    font-weight: bold;
    cursor: pointer;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.action-key {
    width: 60px;
    font-size: 0.8rem;
}

.key-btn.correct {
    background: var(--correct);
    color: white;
}

.key-btn.present {
    background: var(--present);
    color: white;
}

.key-btn.absent {
    background: var(--absent);
    color: white;
}


.chinese-input-area {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 10px;
}

.real-input {
    width: 100%;
    padding: 12px;
    font-size: 1rem;
    border: 2px solid var(--primary);
    border-radius: 8px;
    text-align: center;
    outline: none;
}

.submit-btn {
    padding: 12px;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
}

.submit-btn:disabled {
    background: #ccc;
}

.restart-btn {
    margin-top: 20px;
    background: var(--primary);
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 5px;
}


@keyframes pop {
    50% {
        transform: scale(1.1);
    }
}

.shake {
    animation: shake 0.5s;
}

@keyframes shake {

    0%,
    100% {
        transform: translateX(0);
    }

    10% {
        transform: translateX(-5px);
    }

    30% {
        transform: translateX(5px);
    }

    50% {
        transform: translateX(-5px);
    }

    70% {
        transform: translateX(5px);
    }

    90% {
        transform: translateX(-5px);
    }
}

@keyframes flip {
    0% {
        transform: rotateX(0);
        background: white;
        border-color: #878a8c;
        color: black;
    }

    50% {
        transform: rotateX(90deg);
        background: white;
        border-color: #878a8c;
        color: black;
    }

    51% {
        background: var(--bg-color);
        border-color: var(--bg-color);
        color: white;
    }

    100% {
        transform: rotateX(0);
    }
}


.example-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}

.stat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    text-align: center;
}

.stat-val {
    font-size: 1.5rem;
    font-weight: bold;
}

.stat-label {
    font-size: 0.8rem;
    color: #666;
}

.footer {
    text-align: center;
    padding: 2rem 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
    border-top: 1px solid var(--border);
    margin-top: 3rem;
    background: var(--card);
}
</style>
