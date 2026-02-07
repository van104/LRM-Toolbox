<template>
    <div class="td-tool">
        <nav class="nav-bar">
            <button @click="$router.back()" class="nav-back">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>塔防小游戏</h1>
                <span class="nav-subtitle">Simple Tower Defense - Level {{ gameLevel }}</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="game-layout">
                <div class="game-board-container" ref="containerRef">
                    <canvas ref="canvasRef" @click="handleCanvasClick" @mousemove="handleCanvasMove"
                        @mouseleave="handleCanvasLeave"></canvas>

                    
                    <div v-if="gameState !== 'playing' && gameState !== 'paused'" class="overlay">
                        <div class="overlay-content">
                            <h2 v-if="gameState === 'gameover'">GAME OVER</h2>
                            <h2 v-else-if="gameState === 'level_complete'">关卡完成!</h2>
                            <h2 v-else-if="gameState === 'victory'">恭喜通关!</h2>
                            <h2 v-else>TOWER DEFENSE</h2>

                            <p v-if="gameState === 'gameover'">最终止步: 第{{ gameLevel }}关 - 第{{ wave }}波</p>
                            <p v-else-if="gameState === 'level_complete'">准备好进入下一关了吗？</p>
                            <p v-else-if="gameState === 'victory'">你击败了最终BOSS，守护了家园！</p>
                            <p v-else>抵御敌人的进攻，保护你的基地！</p>

                            <div class="overlay-btns">
                                <button v-if="gameState === 'level_complete'" class="start-btn" @click="startNextLevel">
                                    进入第 {{ gameLevel + 1 }} 关
                                </button>
                                <button v-else-if="gameState === 'start'" class="start-btn" @click="startGame">
                                    开始游戏
                                </button>
                                <button v-else class="start-btn" @click="restartGame">
                                    重新开始
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="controls-panel glass-card">
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="label">生命</span>
                            <span class="value heart">❤️ {{ lives }}</span>
                        </div>
                        <div class="stat-item">
                            <span class="label">金钱</span>
                            <span class="value money">💰 {{ money }}</span>
                        </div>
                        <div class="stat-item">
                            <span class="label">波次</span>
                            <span class="value">🌊 {{ wave }}/{{ maxWaves }}</span>
                        </div>
                    </div>

                    
                    <div v-if="!selectedTowerInstance" class="towers-selection">
                        <h3>建造防御塔</h3>
                        <div class="tower-options">
                            <div v-for="(type, key) in TOWER_TYPES" :key="key" class="tower-card"
                                :class="{ active: selectedTowerType === key, disabled: money < type.cost }"
                                @click="selectTowerType(key)">
                                <div class="tower-icon-wrapper" :class="key">
                                    <span class="tower-emoji">{{ type.emoji }}</span>
                                </div>
                                <div class="tower-info">
                                    <span class="name">{{ type.name }}</span>
                                    <span class="cost">💰{{ type.cost }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    
                    <div v-else class="upgrade-panel">
                        <h3>防御塔升级</h3>
                        <div class="selected-tower-preview">
                            <span class="preview-emoji">{{ selectedTowerInstance.type.emoji }}</span>
                            <div class="preview-info">
                                <span class="name">{{ selectedTowerInstance.type.name }} (Lv.{{
                                    selectedTowerInstance.level }})</span>
                                <span class="stats">攻击: {{ getTowerDamage(selectedTowerInstance) }} | 射速: {{
                                    ((60 / getTowerRate(selectedTowerInstance)) * 60 / 60).toFixed(1) }}/s</span>
                            </div>
                        </div>

                        <div class="upgrade-actions">
                            <button v-if="selectedTowerInstance.level < 3" class="upgrade-btn"
                                :disabled="money < getUpgradeCost(selectedTowerInstance)" @click="upgradeTower">
                                <div class="btn-content">
                                    <el-icon>
                                        <Top />
                                    </el-icon> 升级 (💰{{ getUpgradeCost(selectedTowerInstance) }})
                                </div>
                                <span class="upgrade-desc">
                                    Lv.{{ selectedTowerInstance.level + 1 }}: 伤害+50% 攻速+10%
                                </span>
                            </button>
                            <button v-else class="upgrade-btn max-level" disabled>
                                <el-icon>
                                    <Trophy />
                                </el-icon> 已升至顶级
                            </button>

                            <button class="sell-btn" @click="sellTower">
                                <el-icon>
                                    <Delete />
                                </el-icon> 出售 (💰{{ Math.floor(selectedTowerInstance.totalCost * 0.6) }})
                            </button>

                            <button class="cancel-btn" @click="deselectTower">
                                <el-icon>
                                    <Close />
                                </el-icon> 取消选择
                            </button>
                        </div>
                    </div>

                    <div class="game-actions">
                        <button class="wave-btn" @click="spawnNextWave"
                            :disabled="isWaveActive || gameState !== 'playing'">
                            {{ isWaveActive ? '波次进行中...' : '下一波敌人' }}
                        </button>
                        <button class="restart-btn" @click="restartGame">
                            <el-icon>
                                <Refresh />
                            </el-icon> 重新开始
                        </button>
                    </div>
                </div>
            </div>
        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - 塔防小游戏
        </footer>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { Back, InfoFilled, Refresh, Top, Delete, Close, Trophy } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'


const TILE_SIZE = 40
const COLS = 16
const ROWS = 12
const WIDTH = COLS * TILE_SIZE
const HEIGHT = ROWS * TILE_SIZE

const TOWER_TYPES = {
    basic: { name: '基础塔', cost: 100, range: 120, baseDamage: 15, baseRate: 35, color: '#409eff', projectileSpeed: 8, emoji: '🏯' },
    rapid: { name: '速射塔', cost: 250, range: 100, baseDamage: 6, baseRate: 10, color: '#e6a23c', projectileSpeed: 12, emoji: '⚡' },
    sniper: { name: '狙击塔', cost: 400, range: 280, baseDamage: 60, baseRate: 70, color: '#f56c6c', projectileSpeed: 18, emoji: '🎯' },
    slow: { name: '冰霜塔', cost: 200, range: 130, baseDamage: 5, baseRate: 40, color: '#00ffff', projectileSpeed: 10, emoji: '❄️', effect: 'slow' },
}



const LEVEL_MAPS = [
    
    [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    
    [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
        [0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    
    [
        [3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0],
        [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
        [0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]
]

const LEVEL_CONFIG = [
    { waves: 5, hpScale: 1.0 },
    { waves: 10, hpScale: 1.5 },
    { waves: 15, hpScale: 2.2 } 
]


const canvasRef = ref(null)
const gameState = ref('start') 
const gameLevel = ref(1) 
const money = ref(300)
const lives = ref(20)
const wave = ref(1)
const isWaveActive = ref(false)
const selectedTowerType = ref('basic')
const selectedTowerInstance = ref(null) 
const mousePos = ref({ x: -100, y: -100 }) 
const isMouseInCanvas = ref(false)

let currentMap = []
let waypoints = []
let towers = []
let enemies = []
let bullets = []
let particles = []
let ctx = null
let animationId = null
let waveInterval = null
let frameCount = 0
let isSpawning = false


const maxWaves = computed(() => LEVEL_CONFIG[gameLevel.value - 1].waves)



function restartGame() {
    gameLevel.value = 1
    initLevel()
}

function startNextLevel() {
    if (gameLevel.value < 3) {
        gameLevel.value++
        initLevel()
    }
}

function initLevel() {
    currentMap = LEVEL_CONFIG[gameLevel.value - 1] ? LEVEL_MAPS[gameLevel.value - 1] : LEVEL_MAPS[0]
    waypoints = generateWaypoints(currentMap)

    towers = []
    enemies = []
    bullets = []
    particles = []

    
    
    money.value = 350 + (gameLevel.value - 1) * 100 
    lives.value = 10 
    wave.value = 1
    isWaveActive.value = false
    selectedTowerInstance.value = null

    gameState.value = 'playing'
    isSpawning = false

    
    if (animationId) {
        cancelAnimationFrame(animationId)
    }

    if (ctx) {
        draw()
        gameLoop() 
    }
}

function startGame() {
    restartGame()
}


function generateWaypoints(grid) {
    let startR = -1, startC = -1
    
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (grid[r][c] === 3) { startR = r; startC = c; break; }
        }
    }

    const getCenter = (r, c) => ({ x: c * TILE_SIZE + TILE_SIZE / 2, y: r * TILE_SIZE + TILE_SIZE / 2 })
    const path = []
    const visited = new Set()
    let currR = startR, currC = startC

    
    
    while (true) {
        path.push(getCenter(currR, currC))
        visited.add(`${currR},${currC}`)

        if (grid[currR][currC] === 2) break 

        const neighbors = [
            { r: currR, c: currC + 1 }, 
            { r: currR + 1, c: currC }, 
            { r: currR, c: currC - 1 }, 
            { r: currR - 1, c: currC }  
        ]

        let found = false
        for (let n of neighbors) {
            if (n.r >= 0 && n.r < ROWS && n.c >= 0 && n.c < COLS) {
                const val = grid[n.r][n.c]
                if ((val === 1 || val === 2) && !visited.has(`${n.r},${n.c}`)) {
                    currR = n.r; currC = n.c;
                    found = true
                    break
                }
            }
        }
        if (!found) break
    }
    return path
}


function spawnNextWave() {
    if (isWaveActive.value) return
    isWaveActive.value = true
    isSpawning = true

    const levelConf = LEVEL_CONFIG[gameLevel.value - 1]

    
    const isBossWave = (gameLevel.value === 3 && wave.value === levelConf.waves)

    const baseCount = 8 + wave.value * 2 
    const count = isBossWave ? 1 : Math.floor(baseCount + (gameLevel.value - 1) * 3) 

    const baseHP = 50 * levelConf.hpScale + Math.pow(wave.value, 1.5) * 25 
    const hp = Math.floor(isBossWave ? baseHP * 20 : baseHP) 

    let spawned = 0
    
    
    
    const intervalTime = isBossWave ? 1000 : Math.max(300, 600 - wave.value * 20 - (gameLevel.value - 1) * 50)

    const interval = setInterval(() => {
        spawnEnemy(hp, isBossWave ? 'boss' : 'normal')
        spawned++
        if (spawned >= count) {
            clearInterval(interval)
            isSpawning = false
        }
    }, intervalTime)
}

function spawnEnemy(hp, type = 'normal') {
    const isBoss = type === 'boss'
    enemies.push({
        x: waypoints[0].x,
        y: waypoints[0].y,
        waypointIndex: 0,
        hp: hp,
        maxHp: hp,
        speed: isBoss ? 0.8 : (1.5 + (wave.value * 0.1) + (gameLevel.value - 1) * 0.5),
        radius: isBoss ? 16 : 10,
        type: type, 
        emoji: isBoss ? '👹' : '👾',
        reward: isBoss ? 500 : 15 + Math.floor(wave.value),
        frozen: 0
    })
}


function update() {
    
    if (isWaveActive.value && !isSpawning && enemies.length === 0) {
        if (wave.value < maxWaves.value) {
            isWaveActive.value = false
            wave.value++
            money.value += 50 + wave.value * 10
            ElMessage.success('波次完成！')
        } else {
            
            isWaveActive.value = false
            if (gameLevel.value < 3) {
                gameState.value = 'level_complete'
            } else {
                gameState.value = 'victory'
            }
        }
    }

    
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i]

        
        let currentSpeed = e.speed
        if (e.frozen > 0) {
            currentSpeed *= 0.5 
            e.frozen--
        }

        
        if (e.waypointIndex < waypoints.length - 1) {
            const target = waypoints[e.waypointIndex + 1]
            const dx = target.x - e.x
            const dy = target.y - e.y
            const dist = Math.hypot(dx, dy)
            if (dist < currentSpeed) {
                e.x = target.x; e.y = target.y; e.waypointIndex++
            } else {
                e.x += (dx / dist) * currentSpeed; e.y += (dy / dist) * currentSpeed;
            }
        } else {
            
            lives.value -= (e.type === 'boss' ? 999 : 1) 
            enemies.splice(i, 1)
            createParticles(e.x, e.y, '#f56c6c')
            if (lives.value <= 0) {
                gameState.value = 'gameover'
            }
            continue
        }
    }

    
    towers.forEach(t => {
        if (t.cooldown > 0) t.cooldown--
        else {
            const target = findTarget(t)
            if (target) {
                bullets.push({
                    x: t.x, y: t.y,
                    target: target,
                    speed: t.type.projectileSpeed,
                    damage: getTowerDamage(t),
                    color: t.type.color,
                    effect: t.type.effect 
                })
                t.cooldown = getTowerRate(t)
            }
        }
    })

    
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i]
        if (!enemies.includes(b.target)) {
            bullets.splice(i, 1); continue
        }
        const tx = b.target.x, ty = b.target.y
        const dist = Math.hypot(tx - b.x, ty - b.y)
        if (dist < b.speed) {
            
            b.target.hp -= b.damage

            
            if (b.effect === 'slow') {
                
                b.target.frozen = Math.max(b.target.frozen, 120)
            }

            createParticles(tx, ty, b.color, 3)
            if (b.target.hp <= 0) {
                const idx = enemies.indexOf(b.target)
                if (idx > -1) {
                    enemies.splice(idx, 1)
                    money.value += b.target.reward
                    if (b.target.type === 'boss') {
                        createParticles(tx, ty, '#ff0000', 50) 
                    }
                }
            }
            bullets.splice(i, 1)
        } else {
            const angle = Math.atan2(ty - b.y, tx - b.x)
            b.x += Math.cos(angle) * b.speed; b.y += Math.sin(angle) * b.speed;
        }
    }

    updateParticles()
}


function getTowerDamage(t) {
    const scale = [1, 1.5, 2.2] 
    return Math.floor(t.type.baseDamage * scale[t.level - 1])
}

function getTowerRate(t) {
    const scale = [1, 0.85, 0.75] 
    return Math.floor(t.type.baseRate * scale[t.level - 1])
}

function getUpgradeCost(t) {
    
    return Math.floor(t.type.cost * Math.pow(2.0, t.level))
}

function upgradeTower() {
    if (!selectedTowerInstance.value) return
    const t = selectedTowerInstance.value
    if (t.level >= 3) return

    const cost = getUpgradeCost(t)
    if (money.value >= cost) {
        money.value -= cost
        t.level++
        t.totalCost += cost 
        createParticles(t.x, t.y, '#ffd700', 10)
        ElMessage.success('升级成功！')
    }
}

function sellTower() {
    if (!selectedTowerInstance.value) return
    const t = selectedTowerInstance.value
    const refund = Math.floor(t.totalCost * 0.6)

    money.value += refund
    towers = towers.filter(tower => tower !== t)
    createParticles(t.x, t.y, '#999', 5)
    selectedTowerInstance.value = null
}

function selectTowerType(key) {
    selectedTowerType.value = key
    selectedTowerInstance.value = null 
}

function deselectTower() {
    selectedTowerInstance.value = null
}

function findTarget(t) {
    let closest = null, minD = Infinity
    for (const e of enemies) {
        const dist = Math.hypot(e.x - t.x, e.y - t.y)
        if (dist <= t.type.range) {
            if (dist < minD) { minD = dist; closest = e; }
        }
    }
    return closest
}



function handleCanvasClick(e) {
    if (gameState.value !== 'playing') return
    const rect = canvasRef.value.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const c = Math.floor(x / TILE_SIZE)
    const r = Math.floor(y / TILE_SIZE)

    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        
        const clickedTower = towers.find(t => t.r === r && t.c === c)
        if (clickedTower) {
            selectedTowerInstance.value = clickedTower
            return
        }

        
        selectedTowerInstance.value = null
        if (currentMap[r][c] === 0) {
            const typeKey = selectedTowerType.value
            const type = TOWER_TYPES[typeKey]
            if (money.value >= type.cost) {
                money.value -= type.cost
                towers.push({
                    r, c, x: c * TILE_SIZE + TILE_SIZE / 2, y: r * TILE_SIZE + TILE_SIZE / 2,
                    type, level: 1, totalCost: type.cost, cooldown: 0
                })
                createParticles(x, y, '#fff')
            } else {
                ElMessage.warning('金钱不足')
            }
        }
    }
}

function handleCanvasMove(e) {
    const rect = canvasRef.value.getBoundingClientRect()
    mousePos.value = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    isMouseInCanvas.value = true
}

function handleCanvasLeave() {
    isMouseInCanvas.value = false
}

function draw() {
    if (!ctx) return
    ctx.clearRect(0, 0, WIDTH, HEIGHT)

    
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const val = currentMap[r][c]
            const x = c * TILE_SIZE, y = r * TILE_SIZE
            if (val === 1) {
                ctx.fillStyle = '#f0f2f5'; ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE)
            } else if (val === 2) {
                ctx.fillStyle = '#ffcccc'; ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE)
                ctx.fillStyle = 'red'; ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic'; ctx.font = '20px Arial'
                ctx.fillText('🏠', x + 5, y + 28)
            } else if (val === 3) {
                ctx.fillStyle = '#ddd'; ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE)
                ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic'; ctx.font = '20px Arial'
                ctx.fillText('💀', x + 5, y + 28)
            } else {
                ctx.strokeStyle = '#f9f9f9'; ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE)
            }
        }
    }

    
    towers.forEach(t => {
        
        ctx.fillStyle = '#f5f7fa'
        ctx.fillRect(t.c * TILE_SIZE + 2, t.r * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4)

        
        ctx.strokeStyle = t.type.color
        ctx.lineWidth = 2
        ctx.strokeRect(t.c * TILE_SIZE + 2, t.r * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4)

        
        if (t.level > 1) {
            ctx.font = '10px "Segoe UI Emoji", "Apple Color Emoji", sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('⭐'.repeat(t.level - 1), t.x, t.y - 16)
        }

        
        ctx.font = '22px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(t.type.emoji, t.x, t.y)

        
        if (t === selectedTowerInstance.value) {
            ctx.strokeStyle = '#409eff'
            ctx.lineWidth = 3
            ctx.strokeRect(t.c * TILE_SIZE, t.r * TILE_SIZE, TILE_SIZE, TILE_SIZE)
            
            ctx.fillStyle = 'rgba(64,158,255,0.1)'
            ctx.beginPath()
            ctx.arc(t.x, t.y, t.type.range, 0, Math.PI * 2)
            ctx.fill()
            ctx.strokeStyle = 'rgba(64,158,255,0.3)'
            ctx.lineWidth = 1
            ctx.stroke()
        }
    })

    
    enemies.forEach(e => {
        
        const size = e.type === 'boss' ? 32 : 20
        ctx.font = `${size}px Arial`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(e.emoji, e.x, e.y)

        
        if (e.frozen > 0) {
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.arc(e.x, e.y, size / 2 + 2, 0, Math.PI * 2)
            ctx.stroke()
        }

        
        const barW = e.type === 'boss' ? 40 : 20
        ctx.fillStyle = 'red'; ctx.fillRect(e.x - barW / 2, e.y - size / 2 - 8, barW, 4)
        ctx.fillStyle = '#0f0'; ctx.fillRect(e.x - barW / 2, e.y - size / 2 - 8, barW * (e.hp / e.maxHp), 4)
    })

    
    bullets.forEach(b => {
        ctx.fillStyle = b.color; ctx.beginPath()
        ctx.arc(b.x, b.y, 4, 0, Math.PI * 2); ctx.fill()
    })

    
    particles.forEach(p => {
        ctx.globalAlpha = p.life / 20; ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, 3, 3); ctx.globalAlpha = 1.0
    })

    
    if (!selectedTowerInstance.value && gameState.value === 'playing' && isMouseInCanvas.value) {
        const c = Math.floor(mousePos.value.x / TILE_SIZE)
        const r = Math.floor(mousePos.value.y / TILE_SIZE)
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS && currentMap[r] && currentMap[r][c] === 0) {
            ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 2
            ctx.strokeRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE)

            const type = TOWER_TYPES[selectedTowerType.value]

            
            ctx.fillStyle = 'rgba(100,100,100,0.1)'; ctx.beginPath()
            ctx.arc(c * TILE_SIZE + TILE_SIZE / 2, r * TILE_SIZE + TILE_SIZE / 2, type.range, 0, Math.PI * 2); ctx.fill()

            
            ctx.save()
            ctx.globalAlpha = 0.7
            ctx.fillStyle = '#000' 
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '24px Arial'
            ctx.fillText(type.emoji, c * TILE_SIZE + TILE_SIZE / 2, r * TILE_SIZE + TILE_SIZE / 2 + 2)
            ctx.restore()
        }
    }
}

function gameLoop() {
    if (gameState.value !== 'playing') return
    update()
    draw()
    animationId = requestAnimationFrame(gameLoop)
}

function createParticles(x, y, color, count = 5) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x, y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, life: 20, color
        })
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]; p.life--; p.x += p.vx; p.y += p.vy
        if (p.life <= 0) particles.splice(i, 1)
    }
}

onMounted(() => {
    if (canvasRef.value) {
        canvasRef.value.width = WIDTH
        canvasRef.value.height = HEIGHT
        ctx = canvasRef.value.getContext('2d')
        
    }
})

onUnmounted(() => {
    cancelAnimationFrame(animationId)
    clearInterval(waveInterval)
})

</script>

<style scoped>
.td-tool {
    --bg: #f5f7fa;
    --card: #ffffff;
    --primary: #409eff;
    --text: #2c3e50;

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
    color: #7f8c8d;
    cursor: pointer;
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
}

.nav-subtitle {
    font-size: 0.7rem;
    color: #7f8c8d;
    display: block;
}

.nav-spacer {
    width: 60px;
}

.main-content {
    flex: 1;
    display: flex;
    justify-content: center;
    padding: 1.5rem;
    gap: 1.5rem;
}

.game-layout {
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
}

.game-board-container {
    position: relative;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 10px;
}

canvas {
    background: #fcfcfc;
    border: 1px solid #eee;
    cursor: crosshair;
}

.controls-panel {
    width: 300px;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.glass-card {
    background: var(--card);
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    padding: 1.5rem;
}

.stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #f8f9fa;
    padding: 0.5rem;
    border-radius: 8px;
}

.stat-item .label {
    font-size: 0.7rem;
    color: #999;
}

.stat-item .value {
    font-size: 1rem;
    font-weight: bold;
}

.tower-options {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
}

.tower-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.8rem;
    border: 2px solid transparent;
    border-radius: 8px;
    background: #f9f9f9;
    cursor: pointer;
    transition: all 0.2s;
}

.tower-card:hover {
    background: #f0f2f5;
}

.tower-card.active {
    border-color: var(--primary);
    background: #ecf5ff;
}

.tower-card.disabled {
    opacity: 0.6;
    cursor: not-allowed;
    filter: grayscale(1);
}

.tower-icon-wrapper {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border: 1px solid #eee;
    font-size: 24px;
}

.tower-icon-wrapper.basic {
    box-shadow: 0 0 5px rgba(64, 158, 255, 0.2);
}

.tower-icon-wrapper.rapid {
    box-shadow: 0 0 5px rgba(230, 162, 60, 0.2);
}

.tower-icon-wrapper.sniper {
    box-shadow: 0 0 5px rgba(245, 108, 108, 0.2);
}

.tower-info {
    display: flex;
    flex-direction: column;
}

.tower-info .name {
    font-weight: bold;
    font-size: 0.95rem;
}

.tower-info .cost {
    font-size: 0.85rem;
    color: #e6a23c;
}


.upgrade-panel {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.selected-tower-preview {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
}

.preview-emoji {
    font-size: 2rem;
}

.preview-info {
    display: flex;
    flex-direction: column;
}

.preview-info .name {
    font-weight: bold;
}

.preview-info .stats {
    font-size: 0.8rem;
    color: #666;
}

.upgrade-actions {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
}

.upgrade-btn,
.sell-btn,
.cancel-btn {
    padding: 0.8rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    font-weight: bold;
    transition: all 0.2s;
}

.upgrade-btn {
    background: #67c23a;
    color: white;
    flex-direction: column;
    gap: 2px;
}

.upgrade-btn:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-2px);
}

.upgrade-btn:disabled {
    background: #dcdfe6;
    cursor: not-allowed;
    transform: none;
}

.upgrade-btn.max-level {
    background: #e6a23c;
    cursor: default;
}

.upgrade-desc {
    font-size: 0.7rem;
    opacity: 0.9;
    font-weight: normal;
}

.btn-content {
    display: flex;
    align-items: center;
    gap: 5px;
}

.sell-btn {
    background: #f56c6c;
    color: white;
}

.sell-btn:hover {
    opacity: 0.9;
}

.cancel-btn {
    background: #f0f2f5;
    color: #606266;
}

.cancel-btn:hover {
    background: #e6e8eb;
}

.game-actions {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
}

.wave-btn {
    padding: 1rem;
    border: none;
    border-radius: 8px;
    background: #409eff;
    color: white;
    font-weight: bold;
    cursor: pointer;
}

.wave-btn:hover:not(:disabled) {
    opacity: 0.9;
}

.wave-btn:disabled {
    background: #dcdfe6;
    cursor: not-allowed;
}

.restart-btn {
    padding: 0.8rem;
    border: 1px solid #dcdfe6;
    background: white;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
}

.restart-btn:hover {
    color: var(--primary);
    border-color: var(--primary);
}

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
    border-radius: 8px;
}

.overlay-content {
    text-align: center;
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    width: 80%;
}

.overlay-btns {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1.5rem;
    align-items: center;
}

.start-btn {
    padding: 12px 40px;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 25px;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s;
}

.start-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.footer {
    text-align: center;
    padding: 1rem 0;
    color: #999;
    font-size: 0.9rem;
    border-top: 1px solid #eef2f7;
    background: var(--card);
}
</style>
