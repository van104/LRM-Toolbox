<template>
    <div class="match3-tool">
        <nav class="nav-bar">
            <button @click="$router.back()" class="nav-back">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>简易消消乐</h1>
                <span class="nav-subtitle">Match-3 Game</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="game-container">
                
                <div class="header-panel glass-card">
                    <div class="stats">
                        <div class="stat-item">
                            <span class="label">得分</span>
                            <span class="value">{{ score }}</span>
                        </div>
                        <div class="stat-item">
                            <span class="label">连击</span>
                            <span class="value combo" :class="{ 'active': combo > 1 }">x{{ combo }}</span>
                        </div>
                    </div>
                    <button class="restart-btn" @click="confirmRestart" title="重新开始">
                        <el-icon>
                            <RefreshRight />
                        </el-icon>
                    </button>
                </div>

                
                <div class="board-wrapper glass-card">
                    <div class="board" :style="boardStyle">
                        <div v-for="tile in tiles" :key="tile.id" class="tile" :class="{
                            'selected': isSelected(tile),
                            'matched': tile.isMatched
                        }" :style="getTileStyle(tile)" @click="handleTileClick(tile)">
                            <div class="tile-content" :style="{ color: getIconColor(tile.type) }">
                                <el-icon :size="26">
                                    <component :is="getIconComponent(tile.type)" />
                                </el-icon>
                            </div>
                        </div>
                    </div>
                </div>

                
                <div class="rules-hint">
                    <p><el-icon>
                            <InfoFilled />
                        </el-icon> 交换相邻图标，凑齐3个或以上相同图标消除</p>
                </div>
            </div>
        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - 消消乐
        </footer>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, markRaw } from 'vue'
import {
    Back, RefreshRight, InfoFilled,
    Apple, Cherry, Grape, Watermelon, Burger, Sugar
} from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'


const ROWS = 8
const COLS = 8
const CELL_SIZE = 45 
const GAP = 4
const TILE_TYPES = ['apple', 'cherry', 'grape', 'watermelon', 'burger', 'sugar']
const COLORS = {
    apple: '#f56c6c',
    cherry: '#e91e63',
    grape: '#9c27b0',
    watermelon: '#67c23a',
    burger: '#e6a23c',
    sugar: '#409eff'
}
const ICONS = {
    apple: markRaw(Apple),
    cherry: markRaw(Cherry),
    grape: markRaw(Grape),
    watermelon: markRaw(Watermelon),
    burger: markRaw(Burger),
    sugar: markRaw(Sugar)
}


const tiles = ref([])
const score = ref(0)
const combo = ref(0)
const selectedTileId = ref(null)
const isProcessing = ref(false)


let idCounter = 0
const getUniqueId = () => ++idCounter


const boardStyle = computed(() => ({
    width: `${COLS * CELL_SIZE + (COLS - 1) * GAP}px`,
    height: `${ROWS * CELL_SIZE + (ROWS - 1) * GAP}px`
}))

const getTileStyle = (tile) => ({
    width: `${CELL_SIZE}px`,
    height: `${CELL_SIZE}px`,
    left: `${tile.c * (CELL_SIZE + GAP)}px`,
    top: `${tile.r * (CELL_SIZE + GAP)}px`,
    zIndex: isSelected(tile) ? 10 : 1
})

const getIconComponent = (type) => ICONS[type]
const getIconColor = (type) => COLORS[type]
const isSelected = (tile) => selectedTileId.value === tile.id


const initGame = () => {
    score.value = 0
    combo.value = 0
    selectedTileId.value = null
    isProcessing.value = true
    tiles.value = []

    
    
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            spawnTile(r, c, true) 
        }
    }

    
    setTimeout(() => {
        resolveMatches()
    }, 500)
}

const spawnTile = (r, c, isInitial = false) => {
    const type = TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)]
    tiles.value.push({
        id: getUniqueId(),
        type,
        r: isInitial ? r : -1, 
        c,
        isMatched: false
    })

    if (!isInitial) {
        
        const tile = tiles.value[tiles.value.length - 1]
        
    }
}

const handleTileClick = async (tile) => {
    if (isProcessing.value) return
    if (tile.isMatched) return

    if (selectedTileId.value === null) {
        selectedTileId.value = tile.id
    } else {
        const first = tiles.value.find(t => t.id === selectedTileId.value)
        const second = tile

        selectedTileId.value = null 

        if (first.id === second.id) return 

        
        const dist = Math.abs(first.r - second.r) + Math.abs(first.c - second.c)
        if (dist === 1) {
            await swapTiles(first, second)

            
            const hasMatch = await checkAndMarkMatches()
            if (hasMatch) {
                combo.value = 0
                await processElimination()
            } else {
                
                await swapTiles(first, second)
            }
        }
    }
}

const swapTiles = (t1, t2) => {
    return new Promise(resolve => {
        isProcessing.value = true
        
        const tempR = t1.r
        const tempC = t1.c
        t1.r = t2.r
        t1.c = t2.c
        t2.r = tempR
        t2.c = tempC

        
        setTimeout(() => {
            isProcessing.value = false
            resolve()
        }, 300)
    })
}


const getBoardMap = () => {
    const map = Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
    tiles.value.forEach(t => {
        if (t.r >= 0 && t.r < ROWS && t.c >= 0 && t.c < COLS) {
            map[t.r][t.c] = t
        }
    })
    return map
}

const checkAndMarkMatches = async () => {
    const map = getBoardMap()
    let matched = false
    const toMatch = new Set()

    
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS - 2; c++) {
            const t1 = map[r][c], t2 = map[r][c + 1], t3 = map[r][c + 2]
            if (t1 && t2 && t3 && t1.type === t2.type && t2.type === t3.type) {
                toMatch.add(t1).add(t2).add(t3)
                
                let k = c + 3
                while (k < COLS && map[r][k] && map[r][k].type === t1.type) {
                    toMatch.add(map[r][k])
                    k++
                }
            }
        }
    }

    
    for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS - 2; r++) {
            const t1 = map[r][c], t2 = map[r + 1][c], t3 = map[r + 2][c]
            if (t1 && t2 && t3 && t1.type === t2.type && t2.type === t3.type) {
                toMatch.add(t1).add(t2).add(t3)
                let k = r + 3
                while (k < ROWS && map[k][c] && map[k][c].type === t1.type) {
                    toMatch.add(map[k][c])
                    k++
                }
            }
        }
    }

    if (toMatch.size > 0) {
        toMatch.forEach(t => t.isMatched = true)
        return true
    }
    return false
}

const processElimination = async () => {
    while (true) {
        
        

        const matchedTiles = tiles.value.filter(t => t.isMatched)
        if (matchedTiles.length === 0) break

        isProcessing.value = true
        combo.value++

        
        const count = matchedTiles.length
        const base = count * 10
        const bonus = (combo.value - 1) * 20
        score.value += base + bonus

        
        await new Promise(r => setTimeout(r, 300))

        
        tiles.value = tiles.value.filter(t => !t.isMatched)

        
        await dropTiles()

        
        const hasNewMatch = await checkAndMarkMatches()
        if (!hasNewMatch) break
    }
    isProcessing.value = false
}

const dropTiles = async () => {
    
    

    
    

    for (let c = 0; c < COLS; c++) {
        
        const colTiles = tiles.value.filter(t => t.c === c).sort((a, b) => a.r - b.r)

        
        
        
        
        
        
        

        const existingCount = colTiles.length
        const missingCount = ROWS - existingCount

        
        
        
        
        

        for (let i = 0; i < existingCount; i++) {
            
            
            
            
            const targetR = missingCount + i
            colTiles[i].r = targetR
        }

        
        for (let i = 0; i < missingCount; i++) {
            
            
            const type = TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)]
            const newTile = {
                id: getUniqueId(),
                type,
                r: i - missingCount, 
                c: c,
                isMatched: false
            }
            tiles.value.push(newTile)

            
            
            
            
            
            
            
        }
    }

    
    
    
    

    
    await new Promise(r => setTimeout(r, 20))

    
    let moved = false
    tiles.value.forEach(t => {
        if (t.r < 0) {
            
            
            
            
            

            
            
            
            

            
            
            
            
            
        }
    })

    
    return new Promise(resolve => {
        

        
        
        const newTilesByCol = []
        for (let c = 0; c < COLS; c++) {
            const colTiles = tiles.value.filter(t => t.c === c && t.r >= 0) 
            const missing = ROWS - colTiles.length
            if (missing > 0) {
                for (let i = 0; i < missing; i++) {
                    const type = TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)]
                    const targetR = i
                    const startR = i - missing - 2 
                    const tile = {
                        id: getUniqueId(),
                        type,
                        r: startR,
                        c,
                        targetR: targetR, 
                        isMatched: false
                    }
                    tiles.value.push(tile)
                }
            }
        }

        
        
        setTimeout(() => {
            tiles.value.forEach(t => {
                if (t.targetR !== undefined) {
                    t.r = t.targetR
                    delete t.targetR
                }
            })
            
            setTimeout(resolve, 300)
        }, 50)
    })
}


const resolveMatches = async () => {
    
    if (await checkAndMarkMatches()) {
        await processElimination()
    } else {
        isProcessing.value = false
    }
}

const confirmRestart = () => {
    ElMessageBox.confirm('确定要重新开始吗？当前进度将丢失。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        initGame()
    }).catch(() => { })
}

onMounted(() => {
    initGame()
})

</script>

<style scoped>
.match3-tool {
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
    padding: 1.5rem 1rem;
}

.game-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
    width: 100%;
    max-width: 500px;
}

.header-panel {
    width: 100%;
    padding: 1rem 1.5rem;
    background: var(--card);
    border-radius: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.stats {
    display: flex;
    gap: 2rem;
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
    font-size: 1.25rem;
    font-weight: bold;
    color: var(--text);
    font-family: monospace;
}

.stat-item .combo {
    color: #e6a23c;
    opacity: 0.5;
    transition: all 0.2s;
}

.stat-item .combo.active {
    opacity: 1;
    transform: scale(1.1);
}

.restart-btn {
    border: none;
    background: #f0f2f5;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text-sec);
    transition: all 0.2s;
}

.restart-btn:hover {
    background: #e0e6ed;
    color: var(--primary);
}

.board-wrapper {
    padding: 10px;
    background: var(--card);
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    position: relative;
    
    overflow: hidden;
}

.board {
    position: relative;
    background: #f8f9fa;
    border-radius: 8px;
}

.tile {
    position: absolute;
    background: white;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    border: 2px solid transparent;
}

.tile:hover {
    transform: scale(1.05);
    z-index: 5;
}

.tile.selected {
    border-color: var(--primary);
    background: #ecf5ff;
    transform: scale(1.1);
    z-index: 10;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.tile.matched {
    transform: scale(0);
    opacity: 0;
}

.tile-content {
    font-size: 1.6rem;
    display: flex;
}

.rules-hint {
    color: var(--text-sec);
    font-size: 0.9rem;
    text-align: center;
}

.rules-hint p {
    display: flex;
    align-items: center;
    gap: 6px;
}

.footer {
    text-align: center;
    padding: 2rem 0;
    color: #999;
    font-size: 0.9rem;
    border-top: 1px solid #eef2f7;
    background: var(--card);
}
</style>
