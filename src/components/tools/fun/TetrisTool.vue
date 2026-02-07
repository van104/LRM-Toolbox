<template>
    <div class="tetris-tool">
        
        <nav class="nav-bar">
            <button @click="$router.back()" class="nav-back">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>俄罗斯方块</h1>
                <span class="nav-subtitle">Tetris Classic</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="game-wrapper-outer">
                <div class="game-container">
                    
                    <div class="side-panel left-panel">
                        <div class="panel-card glass-card">
                            <h3>暂存 (HOLD)</h3>
                            <div class="mini-grid">
                                <div v-if="holdPiece" class="piece-preview">
                                    <div v-for="(row, rIndex) in getPieceGrid(holdPiece)" :key="rIndex"
                                        class="preview-row">
                                        <div v-for="(cell, cIndex) in row" :key="cIndex" class="preview-cell"
                                            :class="{ filled: cell }"
                                            :style="{ backgroundColor: cell ? holdPiece.color : 'transparent' }"></div>
                                    </div>
                                </div>
                                <div v-else class="empty-placeholder">按 C 暂存</div>
                            </div>
                        </div>

                        <div class="panel-card glass-card desc-card">
                            <h3>按键说明</h3>
                            <ul class="controls-list">
                                <li><span>← / →</span> <span>移动</span></li>
                                <li><span>↑</span> <span>旋转</span></li>
                                <li><span>↓</span> <span>加速下落</span></li>
                                <li><span>空格</span> <span>直接掉落</span></li>
                                <li><span>C</span> <span>暂存/交换</span></li>
                                <li><span>P</span> <span>暂停游戏</span></li>
                            </ul>
                        </div>
                    </div>

                    
                    <div class="board-wrapper glass-card">
                        <div class="game-board">
                            <div v-for="(row, rIndex) in displayGrid" :key="rIndex" class="board-row">
                                <div v-for="(cell, cIndex) in row" :key="cIndex" class="board-cell" :class="{
                                    'filled': cell !== 0,
                                    'ghost': isGhost(rIndex, cIndex),
                                    'flash': isFlashing(rIndex)
                                }" :style="getCellStyle(cell, rIndex, cIndex)"></div>
                            </div>

                            
                            <div v-if="gameOver" class="overlay game-over">
                                <h2>游戏结束</h2>
                                <p>最终得分: {{ score }}</p>
                                <button class="primary-btn" @click="resetGame">再玩一次</button>
                            </div>

                            
                            <div v-if="isPaused && !gameOver && isGameStarted" class="overlay paused">
                                <h2>已暂停</h2>
                                <button class="primary-btn" @click="togglePause">继续游戏</button>
                            </div>

                            
                            <div v-if="!isGameStarted && !gameOver" class="overlay start">
                                <h2>俄罗斯方块</h2>
                                <p>经典模式</p>
                                <button class="primary-btn pulse" @click="startGame">开始游戏</button>
                            </div>
                        </div>
                    </div>

                    
                    <div class="side-panel right-panel">
                        <div class="panel-card glass-card">
                            <h3>下一个 (NEXT)</h3>
                            <div class="mini-grid">
                                <div v-if="nextPiece" class="piece-preview">
                                    <div v-for="(row, rIndex) in getPieceGrid(nextPiece)" :key="rIndex"
                                        class="preview-row">
                                        <div v-for="(cell, cIndex) in row" :key="cIndex" class="preview-cell"
                                            :class="{ filled: cell }"
                                            :style="{ backgroundColor: cell ? nextPiece.color : 'transparent' }"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="panel-card glass-card stats-card">
                            <div class="stat-item">
                                <span class="label">得分</span>
                                <span class="value">{{ score }}</span>
                            </div>
                            <div class="stat-item">
                                <span class="label">等级</span>
                                <span class="value">{{ level }}</span>
                            </div>
                            <div class="stat-item">
                                <span class="label">消除行数</span>
                                <span class="value">{{ lines }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                
                <div class="mobile-controls">
                    <div class="d-pad">
                        <button @touchstart.prevent="move(-1)" @click="move(-1)" class="control-btn">←</button>
                        <button @touchstart.prevent="softDrop" @click="softDrop" class="control-btn">↓</button>
                        <button @touchstart.prevent="move(1)" @click="move(1)" class="control-btn">→</button>
                    </div>
                    <div class="action-buttons">
                        <button @touchstart.prevent="rotate" @click="rotate" class="control-btn rotate-btn">↻</button>
                        <button @touchstart.prevent="hardDrop" @click="hardDrop" class="control-btn drop-btn">⤓</button>
                    </div>
                    
                    <div class="extra-controls"
                        style="margin-top: 10px; display: flex; gap: 15px; justify-content: center;">
                        <button @click="hold" class="control-btn small-btn">C</button>
                        <button @click="togglePause" class="control-btn small-btn">{{ isPaused ? '▶' : '||' }}</button>
                    </div>
                </div>
            </div>
        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - 俄罗斯方块
        </footer>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Back } from '@element-plus/icons-vue';


const ROWS = 20;
const COLS = 10;
const SHAPES = {
    I: { shape: [[1, 1, 1, 1]], color: '#00f0f0' },
    J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#0000f0' },
    L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#f0a000' },
    O: { shape: [[1, 1], [1, 1]], color: '#f0f000' },
    S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#00f000' },
    T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#a000f0' },
    Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#f00000' }
};


const grid = ref(createGrid());
const displayGrid = computed(() => {
    
    const display = grid.value.map(row => [...row]);

    
    if (activePiece.value && !isClearing.value) { 
        const { x, y, shape, color } = activePiece.value;
        shape.forEach((row, r) => {
            row.forEach((val, c) => {
                if (val && display[y + r] && display[y + r][x + c] !== undefined) {
                    display[y + r][x + c] = color; 
                }
            });
        });
    }
    return display;
});

const score = ref(0);
const level = ref(1);
const lines = ref(0);
const gameOver = ref(false);
const isPaused = ref(false);
const isGameStarted = ref(false);
const isClearing = ref(false); 
const activePiece = ref(null);
const nextPiece = ref(null);
const holdPiece = ref(null);
const canHold = ref(true);
const flashingRows = ref([]); 

let gameLoopInterval = null;
let dropInterval = 1000;
let lastDropTime = 0;


function createGrid() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function randomPiece() {
    const keys = Object.keys(SHAPES);
    const type = keys[Math.floor(Math.random() * keys.length)];
    const { shape, color } = SHAPES[type];
    return {
        type,
        shape,
        color,
        x: Math.floor(COLS / 2) - Math.ceil(shape[0].length / 2),
        y: 0
    };
}

function getPieceGrid(piece) {
    if (!piece) return [];
    return piece.shape;
}

function getCellStyle(cell, rIndex, cIndex) {
    if (isGhost(rIndex, cIndex)) {
        return {
            backgroundColor: activePiece.value ? hexToRgba(activePiece.value.color, 0.2) : 'transparent',
            border: `1px solid ${activePiece.value ? activePiece.value.color : 'transparent'}`
        };
    }
    if (cell) {
        return {
            backgroundColor: cell,
            boxShadow: `inset 0 0 8px rgba(0,0,0,0.25), 0 0 10px ${cell}`
        };
    }
    return {};
}

function hexToRgba(hex, alpha) {
    if (!hex) return 'transparent';
    let c = hex.substring(1).split('');
    if (c.length === 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = '0x' + c.join('');
    return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ')';
}

function isGhost(r, c) {
    if (!activePiece.value || !isGameStarted.value || gameOver.value || isPaused.value || isClearing.value) return false;

    const ghostY = calculateGhostY();
    const { x, y, shape } = activePiece.value;

    const row = r - ghostY;
    const col = c - x;

    if (row >= 0 && row < shape.length && col >= 0 && col < shape[0].length) {
        if (shape[row][col]) {
            return true;
        }
    }
    return false;
}

function isFlashing(rIndex) {
    return flashingRows.value.includes(rIndex);
}



function checkCollision(piece, gridVal, offsetX = 0, offsetY = 0) {
    const { x, y, shape } = piece;
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c]) {
                const newX = x + c + offsetX;
                const newY = y + r + offsetY;

                if (newX < 0 || newX >= COLS || newY >= ROWS) return true; 
                if (newY >= 0 && gridVal[newY][newX]) return true; 
            }
        }
    }
    return false;
}

function calculateGhostY() {
    if (!activePiece.value) return 0;
    let ghostY = activePiece.value.y;
    while (!checkCollision(activePiece.value, grid.value, 0, ghostY - activePiece.value.y + 1)) {
        ghostY++;
    }
    return ghostY;
}

function lockPiece() {
    const { x, y, shape, color } = activePiece.value;
    
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c]) {
                if (y + r >= 0) {
                    grid.value[y + r][x + c] = color;
                } else {
                    gameOver.value = true;
                    return;
                }
            }
        }
    }

    activePiece.value = null; 

    const linesToClear = [];
    grid.value.forEach((row, index) => {
        if (row.every(cell => cell !== 0)) {
            linesToClear.push(index);
        }
    });

    if (linesToClear.length > 0) {
        performLineClear(linesToClear);
    } else {
        spawnPiece();
        canHold.value = true;
    }
}

function performLineClear(linesToClear) {
    isClearing.value = true;
    flashingRows.value = linesToClear;

    setTimeout(() => {
        
        const newGrid = grid.value.filter((val, index) => !linesToClear.includes(index));
        
        for (let i = 0; i < linesToClear.length; i++) {
            newGrid.unshift(Array(COLS).fill(0));
        }
        grid.value = newGrid;

        
        const count = linesToClear.length;
        const points = [0, 100, 300, 500, 800];
        score.value += points[count] * level.value;
        lines.value += count;

        if (lines.value >= level.value * 10) {
            level.value++;
            dropInterval = Math.max(100, 1000 - (level.value - 1) * 100);
        }

        
        flashingRows.value = [];
        isClearing.value = false;

        spawnPiece();
        canHold.value = true;
    }, 300); 
}

function spawnPiece() {
    activePiece.value = nextPiece.value || randomPiece();
    nextPiece.value = randomPiece();

    if (checkCollision(activePiece.value, grid.value)) {
        gameOver.value = true;
        isGameStarted.value = false;
    }
}

function move(dir) {
    if (gameOver.value || isPaused.value || !isGameStarted.value || isClearing.value) return;
    if (!checkCollision(activePiece.value, grid.value, dir, 0)) {
        activePiece.value.x += dir;
    }
}

function rotate() {
    if (gameOver.value || isPaused.value || !isGameStarted.value || isClearing.value) return;
    const p = activePiece.value;

    const newShape = p.shape[0].map((val, index) =>
        p.shape.map(row => row[index]).reverse()
    );

    const clone = { ...p, shape: newShape };

    if (!checkCollision(clone, grid.value)) {
        p.shape = newShape;
    } else if (!checkCollision(clone, grid.value, -1, 0)) {
        p.x -= 1;
        p.shape = newShape;
    } else if (!checkCollision(clone, grid.value, 1, 0)) {
        p.x += 1;
        p.shape = newShape;
    }
}

function softDrop() {
    if (gameOver.value || isPaused.value || !isGameStarted.value || isClearing.value) return;
    if (!checkCollision(activePiece.value, grid.value, 0, 1)) {
        activePiece.value.y++;
        lastDropTime = performance.now();
    } else {
        lockPiece();
    }
}

function hardDrop() {
    if (gameOver.value || isPaused.value || !isGameStarted.value || isClearing.value) return;
    while (!checkCollision(activePiece.value, grid.value, 0, 1)) {
        activePiece.value.y++;
        score.value += 2;
    }
    lockPiece();
}

function hold() {
    if (!canHold.value || gameOver.value || isPaused.value || !isGameStarted.value || isClearing.value) return;

    if (!holdPiece.value) {
        holdPiece.value = { ...activePiece.value };
        spawnPiece();
    } else {
        const temp = { ...holdPiece.value };
        holdPiece.value = { ...activePiece.value };
        activePiece.value = temp;

        activePiece.value.x = Math.floor(COLS / 2) - Math.ceil(activePiece.value.shape[0].length / 2);
        activePiece.value.y = 0;
    }

    canHold.value = false;
}


function update(time) {
    if (!isGameStarted.value || isPaused.value || gameOver.value) {
        requestAnimationFrame(update);
        return;
    }

    
    if (isClearing.value) {
        requestAnimationFrame(update);
        return;
    }

    if (time - lastDropTime > dropInterval) {
        softDrop();
        lastDropTime = time;
    }

    requestAnimationFrame(update);
}


function startGame() {
    resetGame();
    spawnPiece();
    isGameStarted.value = true;
    lastDropTime = performance.now();
    requestAnimationFrame(update);
}

function resetGame() {
    grid.value = createGrid();
    score.value = 0;
    level.value = 1;
    lines.value = 0;
    gameOver.value = false;
    isPaused.value = false;
    nextPiece.value = null;
    activePiece.value = null;
    holdPiece.value = null;
    canHold.value = true;
    dropInterval = 1000;
    isClearing.value = false;
    flashingRows.value = [];
}

function togglePause() {
    isPaused.value = !isPaused.value;
}

function handleKeydown(e) {
    if (!isGameStarted.value) return;
    
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
    }

    switch (e.code) {
        case 'ArrowLeft': move(-1); break;
        case 'ArrowRight': move(1); break;
        case 'ArrowDown': softDrop(); break;
        case 'ArrowUp': rotate(); break;
        case 'Space': hardDrop(); break;
        case 'KeyC': hold(); break;
        case 'KeyP': togglePause(); break;
    }
}

onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
    cancelAnimationFrame(gameLoopInterval);
});

</script>

<style scoped>
.tetris-tool {
    --bg: #1a1a2e;
    
    --card: #16213e;
    --text: #ffffff;
    --text-secondary: #ccc;
    --primary: #4facfe;
    --border: #0f3460;

    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    min-height: 100vh;
    background: var(--bg);
    display: flex;
    flex-direction: column;
    user-select: none;
    color: var(--text);
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
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
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
    flex: 1;
    display: flex;
    justify-content: center;
    padding: 2rem 1rem;
    overflow-y: auto;
}

.game-wrapper-outer {
    max-width: 900px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.game-container {
    display: flex;
    gap: 20px;
    align-items: flex-start;
    justify-content: center;
    width: 100%;
}

.glass-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 15px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.side-panel {
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 180px;
}

h3 {
    margin: 0 0 10px;
    text-align: center;
    font-size: 1rem;
    color: var(--text-secondary);
    letter-spacing: 1px;
    font-weight: 600;
}

.mini-grid {
    width: 100%;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    position: relative;
}

.empty-placeholder {
    font-size: 0.8rem;
    color: #666;
}

.piece-preview {
    display: flex;
    flex-direction: column;
}

.preview-row {
    display: flex;
}

.preview-cell {
    width: 20px;
    height: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 2px;
}

.preview-cell.filled {
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3);
}

.desc-card ul {
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 0.85rem;
}

.desc-card li {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    color: var(--text-secondary);
}

.desc-card li span:first-child {
    font-weight: bold;
    color: var(--text);
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
}

.stats-card .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.stats-card .stat-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
}

.stat-item .label {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-bottom: 5px;
}

.stat-item .value {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--primary);
    font-family: 'Courier New', Courier, monospace;
}

.board-wrapper {
    padding: 10px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.game-board {
    position: relative;
    width: 300px;
    height: 600px;
    background: rgba(10, 10, 20, 0.95);
    display: flex;
    flex-direction: column;
}

.board-row {
    display: flex;
    flex: 1;
}

.board-cell {
    width: 100%;
    flex: 1;
    border: 1px solid rgba(255, 255, 255, 0.03);
    box-sizing: border-box;
    transition: background-color 0.05s;
}

.board-cell.ghost {
    opacity: 0.3;
    background-color: transparent !important;
    
}

.board-cell.flash {
    background-color: #fff !important;
    box-shadow: 0 0 15px #fff;
    animation: flashAnim 0.15s ease-in-out infinite alternate;
    z-index: 5;
}

@keyframes flashAnim {
    0% {
        transform: scale(1);
        opacity: 0.8;
    }

    100% {
        transform: scale(1.05);
        opacity: 1;
    }
}

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 10;
    backdrop-filter: blur(8px);
}

.overlay h2 {
    font-size: 2.5rem;
    margin-bottom: 10px;
    text-shadow: 0 0 10px var(--primary);
    color: #fff;
}

.primary-btn {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    border: none;
    padding: 12px 35px;
    color: #000;
    font-weight: bold;
    border-radius: 25px;
    cursor: pointer;
    font-size: 1.1rem;
    transition: transform 0.2s, box-shadow 0.2s;
    margin-top: 15px;
}

.primary-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(79, 172, 254, 0.4);
}

.pulse {
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(79, 172, 254, 0.7);
    }

    70% {
        box-shadow: 0 0 0 10px rgba(79, 172, 254, 0);
    }

    100% {
        box-shadow: 0 0 0 0 rgba(79, 172, 254, 0);
    }
}

.mobile-controls {
    display: none;
    flex-direction: column;
    margin-top: 20px;
    width: 100%;
    padding: 0 20px;
    gap: 15px;
}

.control-btn {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: #fff;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    user-select: none;
    touch-action: manipulation;
}

.control-btn.small-btn {
    width: 50px;
    height: 50px;
    font-size: 1rem;
}

.control-btn:active {
    background: rgba(255, 255, 255, 0.3);
}

.d-pad,
.action-buttons {
    display: flex;
    justify-content: center;
    gap: 15px;
}

.drop-btn {
    border-color: #f0a000;
    color: #f0a000;
}

.rotate-btn {
    border-color: #4facfe;
    color: #4facfe;
}


.footer {
    text-align: center;
    padding: 2rem 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
    border-top: 1px solid var(--border);
    background: var(--card);
    width: 100%;
}

@media (max-width: 900px) {
    .game-container {
        flex-direction: column;
        align-items: center;
    }

    .side-panel {
        width: 100%;
        max-width: 300px;
        flex-direction: row;
        justify-content: space-between;
    }

    .panel-card {
        flex: 1;
    }

    .desc-card {
        display: none;
        
    }

    .game-board {
        width: 80vw;
        height: 160vw;
        max-height: 65vh;
        max-width: 32.5vh;
    }

    .mobile-controls {
        display: flex;
    }
}
</style>
