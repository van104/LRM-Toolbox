<template>
    <div class="jigsaw-tool">
        <nav class="nav-bar">
            <button class="nav-back" @click="$router.back()">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>拼图游戏</h1>
                <span class="nav-subtitle">Jigsaw Puzzle</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="layout-grid" :class="{ 'settings-collapsed': !settingsExpanded }">
                
                <div ref="gameArea" class="game-section glass-card">
                    <div class="game-header">
                        <div class="timer" :class="{ active: isPlaying }">
                            <el-icon>
                                <Timer />
                            </el-icon>
                            {{ formattedTime }}
                        </div>
                        <div class="progress-info">
                            已拼: {{ solvedCount }} / {{ totalPieces }}
                        </div>
                    </div>

                    <div
ref="containerRef" class="puzzle-container" :style="containerStyle"
                        @mousedown="handleContainerMouseDown" @mousemove="handleContainerMouseMove"
                        @mouseup="handleContainerMouseUp" @mouseleave="handleContainerMouseUp"
                        @touchstart.prevent="handleTouchStart" @touchmove.prevent="handleTouchMove"
                        @touchend="handleTouchEnd">

                        
                        <div class="hint-image" :style="hintStyle"></div>

                        
                        <div
v-for="piece in pieces" :key="piece.id" class="puzzle-piece" :class="{
                            'is-dragging': draggedPieceId === piece.id,
                            'is-solved': piece.isSolved
                        }" :style="getPieceStyle(piece)">
                        </div>

                        
                        <div v-if="isGameComplete" class="victory-overlay">
                            <div class="victory-content">
                                <div class="trophy-icon">🏆</div>
                                <h2>恭喜通关!</h2>
                                <p>耗时: {{ formattedTime }}</p>
                                <button class="restart-btn" @click="resetGame">再玩一次</button>
                            </div>
                        </div>

                        
                        <div v-if="loading" class="loading-overlay">
                            <el-icon class="is-loading">
                                <Loading />
                            </el-icon>
                            <span>生成拼图中...</span>
                        </div>
                    </div>

                    <div class="game-controls">
                        <button class="control-btn" :class="{ active: showHint }" title="按住显示原图" @click="toggleHint">
                            <el-icon>
                                <View />
                            </el-icon> 提示
                        </button>
                        <button class="control-btn" :disabled="isGameComplete || loading" @click="scatterPieces">
                            <el-icon>
                                <RefreshRight />
                            </el-icon> 打乱
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
                            <h3>选择图片</h3>
                            <div class="image-selector">
                                <div
v-for="(img, idx) in presetImages" :key="idx" class="img-option"
                                    :class="{ active: selectedImageIndex === idx && !customImage }"
                                    @click="selectPresetImage(idx)">
                                    <img :src="img.thumb" :alt="img.title">
                                </div>
                                <div
class="img-option upload-option" :class="{ active: customImage }"
                                    @click="triggerUpload">
                                    <input
ref="fileInput" type="file" accept="image/*" hidden
                                        @change="handleImageUpload">
                                    <el-icon>
                                        <Plus />
                                    </el-icon>
                                    <span>上传</span>
                                </div>
                            </div>
                        </div>

                        <div class="settings-group">
                            <h3>难度选择 ({{ activeGridSize.cols }}x{{ activeGridSize.rows }})</h3>
                            <div class="difficulty-slider">
                                <el-slider
v-model="difficulty" :min="2" :max="10" :step="1" show-stops
                                    @change="resetGame" />
                            </div>
                            <div class="piece-count-preview">
                                共 {{ difficulty * difficulty }} 片
                            </div>

                            <div class="checkbox-group" style="margin-top: 10px;">
                                <label class="checkbox-label">
                                    <input v-model="fixedGrid" type="checkbox" @change="resetGame" />
                                    <span>强制正方形布局 (忽略图片比例)</span>
                                </label>
                            </div>
                        </div>

                        <div class="settings-group">
                            <h3>吸附灵敏度</h3>
                            <div class="difficulty-options">
                                <span
v-for="opt in snapOptions" :key="opt.value" class="text-option"
                                    :class="{ active: snapDistance === opt.value }" @click="snapDistance = opt.value">
                                    {{ opt.label }}
                                </span>
                            </div>
                        </div>
                    </div>
                </Transition>
            </div>
        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - 拼图游戏
        </footer>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Back, RefreshRight, Setting, Close, Timer, View, Loading, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'



const presetImages = [
    { title: '风景', url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800&q=80', thumb: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=100&q=60' },
    { title: '城市', url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80', thumb: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=100&q=60' },
    { title: '猫咪', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80', thumb: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=100&q=60' },
    { title: '抽象', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80', thumb: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=100&q=60' },
]


const settingsExpanded = ref(true)
const difficulty = ref(3) 
const fixedGrid = ref(false)
const selectedImageIndex = ref(0)
const customImage = ref(null)
const snapDistance = ref(20) 
const snapOptions = [
    { label: '严格', value: 10 },
    { label: '标准', value: 20 },
    { label: '宽松', value: 40 }
]


const containerRef = ref(null)
const fileInput = ref(null)
const loading = ref(false)
const isPlaying = ref(false)
const startTime = ref(0)
const currentTime = ref(0)
const timerInterval = ref(null)
const showHint = ref(false)
const pieces = ref([])
const containerSize = reactive({ width: 600, height: 600 }) 
const imageAspectRatio = ref(1)


const draggedPieceId = ref(null)
const dragOffset = ref({ x: 0, y: 0 })
const zIndexCounter = ref(10)


const activeGridSize = ref({ cols: 3, rows: 3 })
const totalPieces = computed(() => activeGridSize.value.cols * activeGridSize.value.rows)
const solvedCount = computed(() => pieces.value.filter(p => p.isSolved).length)
const isGameComplete = computed(() => solvedCount.value === totalPieces.value && totalPieces.value > 0)

const containerStyle = computed(() => ({
    width: `${containerSize.width}px`,
    height: `${containerSize.height}px`
}))

const hintStyle = computed(() => ({
    backgroundImage: `url(${customImage.value || presetImages[selectedImageIndex.value]?.url})`,
    opacity: showHint.value ? 0.3 : 0
}))

const formattedTime = computed(() => {
    const seconds = Math.floor(currentTime.value / 1000)
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
})




const initGame = async () => {
    loading.value = true
    stopTimer()
    currentTime.value = 0
    isPlaying.value = false
    pieces.value = []

    try {
        const imageUrl = customImage.value || presetImages[selectedImageIndex.value].url
        const img = await loadImage(imageUrl)

        
        const maxSize = 600
        imageAspectRatio.value = img.width / img.height
        if (imageAspectRatio.value > 1) {
            containerSize.width = maxSize
            containerSize.height = maxSize / imageAspectRatio.value
        } else {
            containerSize.height = maxSize
            containerSize.width = maxSize * imageAspectRatio.value
        }

        
        await generatePieces(img)
        scatterPieces()

        startTimer()
    } catch (error) {
        ElMessage.error('图片加载失败')
        console.error(error)
    } finally {
        loading.value = false
    }
}


const loadImage = (src) => {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = "Anonymous"
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
    })
}


const generatePieces = async (img) => {
    
    let cols, rows
    const ratio = img.width / img.height

    if (fixedGrid.value) {
        
        cols = difficulty.value
        rows = difficulty.value
    } else {
        
        if (ratio > 1) {
            rows = difficulty.value
            cols = Math.round(rows * ratio)
        } else {
            cols = difficulty.value
            rows = Math.round(cols / ratio)
        }
    }

    
    
    
    activeGridSize.value = { cols, rows }

    const pieceWidth = containerSize.width / cols
    const pieceHeight = containerSize.height / rows

    
    
    const shapes = []
    for (let y = 0; y < rows; y++) {
        shapes[y] = []
        for (let x = 0; x < cols; x++) {
            shapes[y][x] = {
                top: y === 0 ? 0 : -shapes[y - 1][x].bottom,
                right: x === cols - 1 ? 0 : (Math.random() > 0.5 ? 1 : -1),
                bottom: y === rows - 1 ? 0 : (Math.random() > 0.5 ? 1 : -1),
                left: x === 0 ? 0 : -shapes[y][x - 1].right
            }
        }
    }

    const newPieces = []

    
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            const shape = shapes[y][x]

            
            const bleed = Math.max(pieceWidth, pieceHeight) * 0.35 
            const width = pieceWidth + bleed * 2
            const height = pieceHeight + bleed * 2

            canvas.width = width
            canvas.height = height

            ctx.save()
            ctx.translate(bleed, bleed)

            
            drawPuzzlePath(ctx, pieceWidth, pieceHeight, shape)
            ctx.clip()

            
            
            const imgTargetWidth = containerSize.width
            const imgTargetHeight = containerSize.height

            
            
            
            
            
            ctx.drawImage(
                img,
                0, 0, img.width, img.height,
                -x * pieceWidth, -y * pieceHeight,
                imgTargetWidth, imgTargetHeight
            )

            
            
            ctx.strokeStyle = 'rgba(0,0,0,0.3)' 
            ctx.lineWidth = 2
            drawPuzzlePath(ctx, pieceWidth, pieceHeight, shape)
            ctx.stroke()

            ctx.strokeStyle = 'rgba(255,255,255,0.4)'
            ctx.lineWidth = 1 
            drawPuzzlePath(ctx, pieceWidth, pieceHeight, shape)
            ctx.stroke()

            ctx.restore()

            newPieces.push({
                id: `${x}-${y}`,
                x: 0,
                y: 0,
                correctX: x * pieceWidth - bleed,
                correctY: y * pieceHeight - bleed,
                width,
                height,
                imgUrl: canvas.toDataURL('image/png'),
                isSolved: false,
                zIndex: 1
            })
        }
    }

    pieces.value = newPieces
}


const drawPuzzlePath = (ctx, w, h, shape) => {
    ctx.beginPath()
    ctx.moveTo(0, 0)

    
    if (shape.top !== 0) {
        ctx.lineTo(w * 0.35, 0)
        
        
        
        
        ctx.bezierCurveTo(w * 0.35, -shape.top * h * 0.2, w * 0.65, -shape.top * h * 0.2, w * 0.65, 0)
    }
    ctx.lineTo(w, 0)

    
    if (shape.right !== 0) {
        ctx.lineTo(w, h * 0.35)
        
        ctx.bezierCurveTo(w + shape.right * w * 0.2, h * 0.35, w + shape.right * w * 0.2, h * 0.65, w, h * 0.65)
    }
    ctx.lineTo(w, h)

    
    if (shape.bottom !== 0) {
        ctx.lineTo(w * 0.65, h)
        
        ctx.bezierCurveTo(w * 0.65, h + shape.bottom * h * 0.2, w * 0.35, h + shape.bottom * h * 0.2, w * 0.35, h)
    }
    ctx.lineTo(0, h)

    
    if (shape.left !== 0) {
        ctx.lineTo(0, h * 0.65)
        
        
        ctx.bezierCurveTo(-shape.left * w * 0.2, h * 0.65, -shape.left * w * 0.2, h * 0.35, 0, h * 0.35)
    }
    ctx.closePath()
}


const scatterPieces = () => {
    pieces.value.forEach(p => {
        if (p.isSolved) return 

        
        const maxOffset = 50
        const randX = Math.random() * (containerSize.width - p.width * 0.5)
        const randY = Math.random() * (containerSize.height - p.height * 0.5)

        p.x = randX
        p.y = randY
        p.zIndex = Math.floor(Math.random() * 10)
    })
}




const getPointerPos = (e) => {
    const rect = containerRef.value.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    }
}

const handleContainerMouseDown = (e) => {
    if (isGameComplete.value) return
    const pos = getPointerPos(e)
    startDrag(pos)
}

const handleTouchStart = (e) => {
    if (isGameComplete.value) return
    const pos = getPointerPos(e)
    startDrag(pos)
}

const startDrag = (pos) => {
    
    
    const sortedPieces = [...pieces.value].sort((a, b) => b.zIndex - a.zIndex)

    for (const piece of sortedPieces) {
        if (piece.isSolved) continue

        
        if (pos.x >= piece.x + 10 && pos.x <= piece.x + piece.width - 10 &&
            pos.y >= piece.y + 10 && pos.y <= piece.y + piece.height - 10) {

            draggedPieceId.value = piece.id
            dragOffset.value = {
                x: pos.x - piece.x,
                y: pos.y - piece.y
            }
            
            piece.zIndex = ++zIndexCounter.value
            return
        }
    }
}

const handleContainerMouseMove = (e) => {
    if (!draggedPieceId.value) return
    const pos = getPointerPos(e)
    movePiece(pos)
}

const handleTouchMove = (e) => {
    if (!draggedPieceId.value) return
    const pos = getPointerPos(e)
    movePiece(pos)
}

const movePiece = (pos) => {
    const piece = pieces.value.find(p => p.id === draggedPieceId.value)
    if (!piece) return

    piece.x = pos.x - dragOffset.value.x
    piece.y = pos.y - dragOffset.value.y
}

const handleContainerMouseUp = () => {
    stopDrag()
}

const handleTouchEnd = () => {
    stopDrag()
}

const stopDrag = () => {
    if (!draggedPieceId.value) return

    const piece = pieces.value.find(p => p.id === draggedPieceId.value)
    if (piece) {
        
        const dist = Math.sqrt(Math.pow(piece.x - piece.correctX, 2) + Math.pow(piece.y - piece.correctY, 2))

        if (dist < snapDistance.value) {
            
            piece.x = piece.correctX
            piece.y = piece.correctY
            piece.isSolved = true
            piece.zIndex = 0 

            
            
            if (isGameComplete.value) {
                stopTimer()
                ElMessage.success('恭喜你完成了拼图！🎉')
            }
        }
    }

    draggedPieceId.value = null
}

const getPieceStyle = (piece) => ({
    backgroundImage: `url(${piece.imgUrl})`,
    width: `${piece.width}px`,
    height: `${piece.height}px`,
    transform: `translate(${piece.x}px, ${piece.y}px)`,
    zIndex: piece.zIndex,
    cursor: piece.isSolved ? 'default' : 'grab'
})


const toggleHint = () => {
    showHint.value = !showHint.value
}

const resetGame = () => {
    initGame()
}

const triggerUpload = () => {
    fileInput.value.click()
}

const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
        customImage.value = event.target.result
        selectedImageIndex.value = -1 
        initGame()
    }
    reader.readAsDataURL(file)
}

const selectPresetImage = (idx) => {
    selectedImageIndex.value = idx
    customImage.value = null
    initGame()
}


const startTimer = () => {
    startTime.value = Date.now()
    isPlaying.value = true
    timerInterval.value = setInterval(() => {
        currentTime.value = Date.now() - startTime.value
    }, 1000)
}

const stopTimer = () => {
    if (timerInterval.value) {
        clearInterval(timerInterval.value)
        timerInterval.value = null
    }
    isPlaying.value = false
}


onMounted(() => {
    initGame()
})

onUnmounted(() => {
    stopTimer()
})
</script>

<style scoped>
.jigsaw-tool {
    --bg: #f5f7fa;
    --card: #ffffff;
    --border: #eef2f7;
    --text: #2c3e50;
    --text-secondary: #7f8c8d;
    --primary: #409eff;

    font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
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


.game-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    position: relative;
    min-height: 600px;
}

.game-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.timer {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-feature-settings: "tnum";
}

.timer.active {
    color: var(--primary);
    font-weight: bold;
}


.puzzle-container {
    position: relative;
    background: #f0f2f5;
    border: 2px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
    
    box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.05);
    
    background-image:
        linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
    background-size: 20px 20px;
    touch-action: none;
}

.hint-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: 100% 100%;
    background-position: center;
    pointer-events: none;
    transition: opacity 0.3s;
    z-index: 0;
}

.puzzle-piece {
    position: absolute;
    top: 0;
    left: 0;
    background-repeat: no-repeat;
    
    will-change: transform;
    filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.2));
}

.puzzle-piece.is-dragging {
    filter: drop-shadow(5px 5px 10px rgba(0, 0, 0, 0.3));
    z-index: 9999;
}

.puzzle-piece.is-solved {
    filter: none;
    z-index: 0 !important;
    pointer-events: none;
}


.game-controls {
    display: flex;
    gap: 1rem;
}

.control-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1.2rem;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: white;
    color: var(--text);
    cursor: pointer;
    transition: all 0.2s;
}

.control-btn:hover {
    border-color: var(--primary);
    color: var(--primary);
}

.control-btn.active {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
}

.control-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}


.victory-overlay,
.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    border-radius: 8px;
}

.victory-content {
    text-align: center;
    animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.trophy-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
}

.victory-content h2 {
    margin: 0 0 0.5rem 0;
    color: var(--text);
}

.victory-content p {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
}

.restart-btn {
    padding: 0.8rem 2rem;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 20px;
    font-size: 1rem;
    cursor: pointer;
    transition: transform 0.2s;
}

.restart-btn:hover {
    transform: scale(1.05);
}

@keyframes popIn {
    from {
        transform: scale(0.8);
        opacity: 0;
    }

    to {
        transform: scale(1);
        opacity: 1;
    }
}


.settings-section {
    position: sticky;
    top: 100px;
}

.settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.settings-header h2 {
    margin: 0;
    font-size: 1.2rem;
}

.close-btn {
    border: none;
    background: none;
    cursor: pointer;
    font-size: 1.2rem;
}

.settings-group {
    margin-bottom: 2rem;
}

.settings-group h3 {
    font-size: 0.95rem;
    margin-bottom: 1rem;
    color: var(--text);
}

.image-selector {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
}

.img-option {
    aspect-ratio: 1;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s;
    position: relative;
    background: #f0f0f0;
}

.img-option img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.img-option.active {
    border-color: var(--primary);
    transform: scale(0.95);
}

.upload-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    font-size: 0.8rem;
    gap: 4px;
}

.upload-option:hover {
    color: var(--primary);
}

.difficulty-options {
    display: flex;
    gap: 0.5rem;
}

.text-option {
    flex: 1;
    text-align: center;
    padding: 0.5rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
}

.text-option.active {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
}

.piece-count-preview {
    text-align: right;
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-top: 0.5rem;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    color: var(--text-secondary);
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
