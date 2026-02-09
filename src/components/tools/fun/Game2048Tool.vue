<template>
    <div class="game-2048-tool">
        <nav class="nav-bar">
            <button class="nav-back" @click="$router.back()">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>2048</h1>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="container">
                <div class="heading">
                    <h1 class="title">2048</h1>
                    <div class="scores-container">
                        <div class="score-container">
                            {{ score }}
                            <div v-if="scoreCheck > 0" :key="scoreCheck" class="score-addition">+{{ scoreCheck }}</div>
                        </div>
                        <div class="best-container">{{ bestScore }}</div>
                    </div>
                </div>

                <div class="above-game">
                    <p class="game-intro">合并数字到达 <strong>2048</strong> 方块!</p>
                    <div class="actions">
                        <button class="restart-button" @click="resetGame">新游戏</button>
                        <button class="settings-button" @click="showSettings = true">
                            <el-icon>
                                <Setting />
                            </el-icon>
                        </button>
                    </div>
                </div>

                <div class="game-container" :class="'size-' + size">
                    <div class="game-message" :class="gameStatusClass">
                        <p>{{ gameStatusText }}</p>
                        <div class="lower">
                            <button
v-if="gameWon && !keepPlaying" class="keep-playing-button"
                                @click="continueGame">继续挑战</button>
                            <button class="retry-button" @click="resetGame">再试一次</button>
                        </div>
                    </div>

                    <div class="grid-container">
                        <div v-for="r in size" :key="'r' + r" class="grid-row">
                            <div v-for="c in size" :key="'c' + c" class="grid-cell"></div>
                        </div>
                    </div>

                    <div class="tile-container">
                        <div
v-for="tile in tiles" :key="tile.id" class="tile" :class="getTileClasses(tile)"
                            :style="getTileStyle(tile)">
                            <div class="tile-inner">{{ tile.value }}</div>
                        </div>
                    </div>
                </div>

                <p class="game-explanation">
                    <strong class="important">怎么玩:</strong> 使用 <strong>方向键</strong> 或 <strong>手指滑动</strong>
                    移动方块。当两个相同数字的方块撞在一起时，它们会 <strong>合并成一个!</strong>
                </p>
            </div>


            <Transition name="fade">
                <div v-if="showSettings" class="settings-overlay" @click.self="showSettings = false">
                    <div class="settings-modal">
                        <div class="settings-header">
                            <h2>游戏设置</h2>
                            <button class="close-btn" @click="showSettings = false">
                                <el-icon>
                                    <Close />
                                </el-icon>
                            </button>
                        </div>
                        <div class="settings-content">
                            <div class="setting-item">
                                <label>网格大小</label>
                                <div class="size-selector">
                                    <button
v-for="s in [4, 5, 6]" :key="s" class="size-btn"
                                        :class="{ active: size === s }" @click="setSize(s)">
                                        {{ s }} × {{ s }}
                                    </button>
                                </div>
                            </div>
                            <div class="stats-info">
                                <div class="stat-row">
                                    <span>历史总分</span>
                                    <strong>{{ totalScore }}</strong>
                                </div>
                                <div class="stat-row">
                                    <span>游戏场次</span>
                                    <strong>{{ gamesPlayed }}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - 2048
        </footer>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Back, Setting, Close } from '@element-plus/icons-vue'


const size = ref(4)
const tiles = ref([])
const score = ref(0)
const bestScore = ref(0)
const scoreCheck = ref(0)
const gameOver = ref(false)
const gameWon = ref(false)
const keepPlaying = ref(false)
const showSettings = ref(false)
let tileIdCounter = 0
const touchStartPos = { x: 0, y: 0 }
const totalScore = ref(0)
const gamesPlayed = ref(0)


const gameStatusText = computed(() => {
    if (gameWon.value && !keepPlaying.value) return '你赢了!'
    if (gameOver.value) return '游戏结束!'
    return ''
})

const gameStatusClass = computed(() => {
    return {
        'game-won': gameWon.value && !keepPlaying.value,
        'game-over': gameOver.value
    }
})


const initGame = () => {
    tiles.value = []
    score.value = 0
    scoreCheck.value = 0
    gameOver.value = false
    gameWon.value = false
    keepPlaying.value = false
    tileIdCounter = 0
    addRandomTile()
    addRandomTile()
}

const resetGame = () => {
    initGame()
    gamesPlayed.value++
    saveStats()
}

const continueGame = () => {
    keepPlaying.value = true
}

const setSize = (s) => {
    if (s === size.value) return
    size.value = s
    resetGame()
    showSettings.value = false
}

const move = (direction) => {
    if (gameOver.value || (gameWon.value && !keepPlaying.value)) return
    const vector = getVector(direction)
    const traversals = buildTraversals(vector)
    let moved = false
    let scoreGain = 0

    tiles.value.forEach(t => t.mergedFrom = null)

    traversals.x.forEach(x => {
        traversals.y.forEach(y => {
            const cell = { x, y }
            const tile = getTileAt(cell)

            if (tile) {
                const positions = findFarthestPosition(cell, vector)
                const next = getTileAt(positions.next)

                if (next && next.value === tile.value && !next.mergedFrom) {
                    const merged = {
                        id: tileIdCounter++,
                        x: next.x,
                        y: next.y,
                        value: tile.value * 2,
                        mergedFrom: [tile, next]
                    }

                    insertTile(merged)
                    removeTile(tile)
                    removeTile(next)

                    tile.x = next.x
                    tile.y = next.y

                    scoreGain += merged.value
                    if (merged.value === 2048) gameWon.value = true
                    moved = true
                } else {
                    moveTile(tile, positions.farthest)
                    if (cell.x !== positions.farthest.x || cell.y !== positions.farthest.y) {
                        moved = true
                    }
                }
            }
        })
    })

    if (moved) {
        addRandomTile()
        if (scoreGain > 0) {
            score.value += scoreGain
            scoreCheck.value = scoreGain
            if (score.value > bestScore.value) {
                bestScore.value = score.value
                saveStats()
            }
            totalScore.value += scoreGain
            saveStats()
        }
        if (!movesAvailable()) gameOver.value = true
    }
}

const getVector = (direction) => {
    const map = { 0: { x: 0, y: -1 }, 1: { x: 1, y: 0 }, 2: { x: 0, y: 1 }, 3: { x: -1, y: 0 } }
    return map[direction]
}

const buildTraversals = (vector) => {
    const traversals = { x: [], y: [] }
    for (let pos = 0; pos < size.value; pos++) {
        traversals.x.push(pos)
        traversals.y.push(pos)
    }
    if (vector.x === 1) traversals.x = traversals.x.reverse()
    if (vector.y === 1) traversals.y = traversals.y.reverse()
    return traversals
}

const findFarthestPosition = (cell, vector) => {
    let previous
    let current = { x: cell.x, y: cell.y }
    do {
        previous = current
        current = { x: previous.x + vector.x, y: previous.y + vector.y }
    } while (withinBounds(current) && !getTileAt(current))
    return { farthest: previous, next: current }
}

const withinBounds = (position) => {
    return position.x >= 0 && position.x < size.value && position.y >= 0 && position.y < size.value
}

const getTileAt = (position) => {
    return tiles.value.find(t => t.x === position.x && t.y === position.y && !t.mergedFrom)
}

const insertTile = (tile) => { tiles.value.push(tile) }
const removeTile = (tile) => {
    const index = tiles.value.indexOf(tile)
    if (index !== -1) tiles.value.splice(index, 1)
}
const moveTile = (tile, position) => { tile.x = position.x; tile.y = position.y }

const addRandomTile = () => {
    if (tiles.value.length >= size.value * size.value) return
    const availableCells = []
    for (let x = 0; x < size.value; x++) {
        for (let y = 0; y < size.value; y++) {
            if (!getTileAt({ x, y })) availableCells.push({ x, y })
        }
    }
    if (availableCells.length > 0) {
        const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)]
        insertTile({ id: tileIdCounter++, x: randomCell.x, y: randomCell.y, value: Math.random() < 0.9 ? 2 : 4, isNew: true })
    }
}

const movesAvailable = () => {
    if (tiles.value.length < size.value * size.value) return true
    for (let x = 0; x < size.value; x++) {
        for (let y = 0; y < size.value; y++) {
            const tile = getTileAt({ x, y })
            if (tile) {
                const dirs = [0, 1, 2, 3]
                for (const dir of dirs) {
                    const vector = getVector(dir)
                    const neighborPos = { x: x + vector.x, y: y + vector.y }
                    const neighbor = getTileAt(neighborPos)
                    if (neighbor && neighbor.value === tile.value) return true
                }
            }
        }
    }
    return false
}

const handleKeydown = (event) => {
    if (showSettings.value) return
    if ([37, 38, 39, 40].includes(event.keyCode)) event.preventDefault()
    const map = { 38: 0, 39: 1, 40: 2, 37: 3, 75: 0, 76: 1, 74: 2, 72: 3, 87: 0, 68: 1, 83: 2, 65: 3 }
    const direction = map[event.keyCode]
    if (direction !== undefined) move(direction)
}





const getTileClasses = (tile) => {
    return [`tile-${tile.value}`, { 'tile-new': tile.isNew }, { 'tile-merged': tile.mergedFrom }]
}

const getTileStyle = (tile) => {
    return {
        '--x': tile.x,
        '--y': tile.y
    }
}


const saveStats = () => {
    localStorage.setItem('2048-stats', JSON.stringify({ bestScore: bestScore.value, totalScore: totalScore.value, gamesPlayed: gamesPlayed.value }))
    localStorage.setItem('2048-state', JSON.stringify({ tiles: tiles.value, score: score.value, size: size.value, gameOver: gameOver.value, gameWon: gameWon.value, keepPlaying: keepPlaying.value }))
}

const loadStats = () => {
    const statsSaved = localStorage.getItem('2048-stats')
    if (statsSaved) {
        const parsed = JSON.parse(statsSaved)
        bestScore.value = parsed.bestScore || 0
        totalScore.value = parsed.totalScore || 0
        gamesPlayed.value = parsed.gamesPlayed || 0
    }
    const stateSaved = localStorage.getItem('2048-state')
    if (stateSaved) {
        const parsed = JSON.parse(stateSaved)
        if (parsed.size === size.value && !parsed.gameOver) {
            tiles.value = parsed.tiles
            score.value = parsed.score
            if (tiles.value.length > 0) tileIdCounter = Math.max(...tiles.value.map(t => t.id)) + 1
        } else initGame()
    } else initGame()
}

onMounted(() => { window.addEventListener('keydown', handleKeydown); loadStats() })
onUnmounted(() => { window.removeEventListener('keydown', handleKeydown) })
watch([score, gameOver], () => saveStats())
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css?family=Clear+Sans:400,500,700");

.game-2048-tool {
    --bg: #faf8ef;
    --text: #776e65;
    --score-bg: #bbada0;
    --board-bg: #bbada0;
    --cell-bg: #cdc1b4;

    background: var(--bg);
    color: var(--text);
    font-family: "Clear Sans", "Helvetica Neue", Arial, sans-serif;
    min-height: 100vh;
}

.nav-bar {
    display: none;

}


.game-2048-tool .nav-bar {
    display: flex;

    background: var(--bg);
    border-bottom: none;
    box-shadow: none;
}

.game-2048-tool .nav-bar h1 {
    color: var(--text);
    font-weight: bold;
    font-size: 1.2rem;
}

.main-content {
    display: flex;
    justify-content: center;
    padding: 0 1rem 2rem 1rem;
}

.container {
    width: 500px;
    max-width: 100%;
}

.heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}

.title {
    font-size: 80px;
    font-weight: bold;
    margin: 0;
    line-height: 1;
}

.scores-container {
    display: flex;
    gap: 8px;
    text-align: center;
}

.score-container,
.best-container {
    position: relative;
    background: var(--score-bg);
    padding: 10px 20px;
    font-size: 25px;
    height: 35px;
    line-height: 35px;
    font-weight: bold;
    border-radius: 3px;
    color: white;
    min-width: 50px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.score-container::after {
    content: "SCORE";
}

.best-container::after {
    content: "BEST";
}

.score-container::after,
.best-container::after {
    position: absolute;
    width: 100%;
    top: 6px;
    left: 0;
    text-transform: uppercase;
    font-size: 13px;
    line-height: 13px;
    color: #eee4da;
    font-weight: bold;
}

.score-addition {
    position: absolute;
    right: 30px;
    color: rgba(119, 110, 101, 0.9);
    font-size: 25px;
    line-height: 25px;
    font-weight: bold;
    z-index: 100;
    animation: move-up 600ms ease-in both;
}

@keyframes move-up {
    0% {
        top: 25px;
        opacity: 1;
    }

    100% {
        top: -50px;
        opacity: 0;
    }
}

.above-game {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
}

.game-intro {
    font-size: 18px;
    line-height: 1.5;
    margin: 0;
}

.restart-button,
.settings-button {
    background: #8f7a66;
    border-radius: 3px;
    padding: 0 20px;
    text-decoration: none;
    color: #f9f6f2;
    height: 40px;
    line-height: 42px;
    display: inline-block;
    text-align: center;
    font-weight: bold;
    border: none;
    cursor: pointer;
    font-size: 18px;
}

.settings-button {
    padding: 0 10px;
    margin-left: 10px;
    background: #9c8774;
}


.game-container {
    margin-top: 40px;
    position: relative;
    padding: 15px;
    cursor: default;
    touch-action: none;
    background: #bbada0;
    border-radius: 6px;
    width: 500px;
    height: 500px;

    box-sizing: border-box;

    --grid-size: 4;
    --grid-gap: 15px;
    --tile-size: 106.25px;

}


.game-container.size-5 {
    --grid-size: 5;
    --tile-size: 82px;

}

.game-container.size-6 {
    --grid-size: 6;
    --tile-size: 65.83px;

}

.game-message {
    display: none;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(238, 228, 218, 0.73);
    z-index: 100;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    border-radius: 6px;
}

.game-message.game-won {
    display: flex;
    background: rgba(237, 194, 46, 0.5);
    color: #f9f6f2;
}

.game-message.game-over {
    display: flex;
}

.game-message p {
    font-size: 60px;
    font-weight: bold;
    height: 60px;
    line-height: 60px;
    margin-bottom: 30px;
}

.game-message .lower {
    display: block;
    margin-top: 25px;
}

.grid-container {
    position: absolute;
    z-index: 1;
    display: grid;

    grid-template-columns: repeat(var(--grid-size), var(--tile-size));
    grid-template-rows: repeat(var(--grid-size), var(--tile-size));
    gap: var(--grid-gap);
}

.grid-cell {
    width: var(--tile-size);
    height: var(--tile-size);
    border-radius: 3px;
    background: rgba(238, 228, 218, 0.35);
}

.tile-container {
    position: absolute;
    z-index: 2;

    top: 15px;
    left: 15px;

}

.tile {
    position: absolute;
    width: var(--tile-size);
    height: var(--tile-size);
    border-radius: 3px;
    transition: transform 100ms ease-in-out;


    transform: translate(calc(var(--x) * (var(--tile-size) + var(--grid-gap))),
            calc(var(--y) * (var(--tile-size) + var(--grid-gap))));
    z-index: 10;
}

.tile-inner {
    border-radius: 3px;
    background: #eee4da;
    text-align: center;
    font-weight: bold;
    z-index: 10;
    font-size: 55px;

    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: normal;

}


.tile-128 .tile-inner,
.tile-256 .tile-inner,
.tile-512 .tile-inner {
    font-size: 45px;
}

.tile-1024 .tile-inner,
.tile-2048 .tile-inner {
    font-size: 35px;
}

.tile-4096 .tile-inner,
.tile-8192 .tile-inner {
    font-size: 30px;
}


.game-container.size-5 .tile-inner {
    font-size: 42px;
}

.game-container.size-6 .tile-inner {
    font-size: 32px;
}


.tile-2 .tile-inner {
    background: #eee4da;
    color: #776e65;
}

.tile-4 .tile-inner {
    background: #ede0c8;
    color: #776e65;
}

.tile-8 .tile-inner {
    background: #f2b179;
    color: #f9f6f2;
}

.tile-16 .tile-inner {
    background: #f59563;
    color: #f9f6f2;
}

.tile-32 .tile-inner {
    background: #f67c5f;
    color: #f9f6f2;
}

.tile-64 .tile-inner {
    background: #f65e3b;
    color: #f9f6f2;
}

.tile-128 .tile-inner {
    background: #edcf72;
    color: #f9f6f2;
    box-shadow: 0 0 30px 10px rgba(243, 215, 116, 0.2381), inset 0 0 0 1px rgba(255, 255, 255, 0.19048);
}

.tile-256 .tile-inner {
    background: #edcc61;
    color: #f9f6f2;
    box-shadow: 0 0 30px 10px rgba(243, 215, 116, 0.31746), inset 0 0 0 1px rgba(255, 255, 255, 0.2381);
}

.tile-512 .tile-inner {
    background: #edc850;
    color: #f9f6f2;
    box-shadow: 0 0 30px 10px rgba(243, 215, 116, 0.39683), inset 0 0 0 1px rgba(255, 255, 255, 0.28571);
}

.tile-1024 .tile-inner {
    background: #edc53f;
    color: #f9f6f2;
    box-shadow: 0 0 30px 10px rgba(243, 215, 116, 0.47619), inset 0 0 0 1px rgba(255, 255, 255, 0.33333);
}

.tile-2048 .tile-inner {
    background: #edc22e;
    color: #f9f6f2;
    box-shadow: 0 0 30px 10px rgba(243, 215, 116, 0.55556), inset 0 0 0 1px rgba(255, 255, 255, 0.38095);
}

.tile-4096 .tile-inner {
    background: #fe3d3d;
    color: #f9f6f2;
}

.tile-8192 .tile-inner {
    background: #ff2020;
    color: #f9f6f2;
}

.tile-new .tile-inner {
    animation: appear 200ms ease;
}

.tile-merged .tile-inner {
    z-index: 20;
    animation: pop 200ms ease 100ms;
    animation-fill-mode: backwards;
}

@keyframes appear {
    0% {
        opacity: 0;
        transform: scale(0);
    }

    100% {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes pop {
    0% {
        transform: scale(0);
    }

    50% {
        transform: scale(1.2);
    }

    100% {
        transform: scale(1);
    }
}

.game-explanation {
    margin-top: 30px;
    font-size: 16px;
    line-height: 1.65;
}

.important {
    font-weight: bold;
}


.settings-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.settings-modal {
    background: white;
    width: 300px;
    padding: 20px;
    border-radius: 6px;
}

.settings-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
}

.setting-item {
    margin-bottom: 20px;
}

.size-selector {
    display: flex;
    gap: 10px;
    margin-top: 10px;
}

.size-btn {
    flex: 1;
    padding: 10px;
    border: 1px solid #ccc;
    background: white;
    cursor: pointer;
    border-radius: 4px;
}

.size-btn.active {
    background: #8f7a66;
    color: white;
    border-color: #8f7a66;
}

.stats-info {
    background: #f0f0f0;
    padding: 10px;
    border-radius: 4px;
}

.stat-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
}

.footer {
    padding: 2rem;
    color: #776e65;
    opacity: 0.7;
    text-align: center;
}

@media (max-width: 520px) {
    .container {
        width: 280px;
    }

    .game-container {
        margin-top: 20px;
        width: 280px;
        height: 280px;
        --grid-gap: 10px;
        --tile-size: 57.5px;

        padding: 10px;
    }

    .game-container.size-5 {
        --grid-gap: 8px;



        --tile-size: 45.6px;
    }

    .game-container.size-6 {
        --grid-gap: 6px;

        --tile-size: 38.33px;
    }

    .grid-container {
        --grid-gap: 10px;
        --tile-size: 57.5px;

    }

    .tile-container {
        top: 10px;
        left: 10px;
    }

    .title {
        font-size: 40px;
    }


    .score-container,
    .best-container {
        min-width: 40px;
        padding: 5px 10px;
        font-size: 16px;
        height: auto;
        line-height: normal;
    }

    .score-container::after,
    .best-container::after {
        position: static;
        font-size: 10px;
        line-height: 10px;
        margin-bottom: 2px;
    }

    .tile-inner {
        font-size: 30px;
    }
}
</style>
