<template>
    <div class="ai-draw-guess">
        <nav class="nav-bar">
            <button @click="$router.back()" class="nav-back">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>AI 你画我猜 <span class="ai-badge">AI</span></h1>
                <span class="nav-subtitle">AI Drawing Recognition</span>
            </div>
            <div class="nav-actions">
                <button class="settings-btn" @click="showSettings = !showSettings" :class="{ active: showSettings }">
                    <el-icon>
                        <Setting />
                    </el-icon> 设置
                </button>
            </div>
        </nav>

        <main class="main-content">
            
            <transition name="slide-fade">
                <div v-show="showSettings" class="settings-card glass-card">
                    <h3>API 配置</h3>
                    <div class="settings-grid">
                        <div class="form-item full-width">
                            <label>API 服务商预设</label>
                            <div class="provider-select">
                                <button v-for="p in providers" :key="p.id" class="provider-badge"
                                    :class="{ active: currentProviderId === p.id }" @click="selectProvider(p)">
                                    {{ p.name }}
                                </button>
                            </div>
                        </div>
                        <div class="form-item">
                            <label>API Key</label>
                            <input type="password" v-model="config.apiKey"
                                :placeholder="'输入 ' + (currentProvider?.name || '') + ' 的 API Key'">
                        </div>
                        <div class="form-item">
                            <label>API URL</label>
                            <input type="text" v-model="config.apiUrl" placeholder="接口请求地址">
                        </div>
                        <div class="form-item">
                            <label>模型名称</label>
                            <input type="text" v-model="config.modelId" placeholder="例如: Qwen/Qwen2-VL-72B-Instruct">
                        </div>
                    </div>
                    <div class="settings-footer">
                        <p class="hint">注意：API Key 将仅存储在您的浏览器本地缓存中。</p>
                        <button class="save-btn" @click="saveConfig">保存配置</button>
                    </div>
                </div>
            </transition>

            <div class="game-layout">
                <div class="canvas-section">
                    <div class="canvas-card glass-card">
                        <div class="canvas-wrapper">
                            <canvas ref="canvasRef" @mousedown="startDrawing" @mousemove="draw" @mouseup="stopDrawing"
                                @mouseleave="stopDrawing" @touchstart="handleTouchStart" @touchmove="handleTouchMove"
                                @touchend="stopDrawing"></canvas>
                        </div>

                        <div class="toolbar">
                            <div class="color-picker">
                                <button v-for="color in colors" :key="color" class="color-dot"
                                    :style="{ backgroundColor: color }" :class="{ active: currentColor === color }"
                                    @click="currentColor = color"></button>
                                <div class="custom-color-picker">
                                    <el-color-picker v-model="currentColor" size="small" />
                                </div>
                            </div>

                            <div class="brush-settings">
                                <div class="setting-item">
                                    <el-icon title="画笔大小">
                                        <EditPen />
                                    </el-icon>
                                    <input type="range" v-model.number="brushSize" min="1" max="50">
                                    <span class="size-text">{{ brushSize }}</span>
                                </div>
                                <div class="divider"></div>
                                <div class="setting-item">
                                    <el-icon title="画布背景">
                                        <PictureFilled />
                                    </el-icon>
                                    <div class="bg-options">
                                        <button v-for="bg in bgOptions" :key="bg.color" class="bg-dot"
                                            :style="{ backgroundColor: bg.color }"
                                            :class="{ active: currentBgColor === bg.color }"
                                            @click="changeBgColor(bg.color)" :title="bg.name"></button>
                                        <div class="custom-bg-picker">
                                            <el-color-picker v-model="currentBgColor" size="small"
                                                @change="changeBgColor" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="actions">
                                <button class="action-btn clear" @click="clearCanvas">
                                    <el-icon>
                                        <Delete />
                                    </el-icon> 清空
                                </button>
                                <button class="action-btn guess" @click="guessDraw" :disabled="loading">
                                    <el-icon v-if="!loading">
                                        <Cpu />
                                    </el-icon>
                                    <span v-if="loading" class="mini-spinner"></span>
                                    {{ loading ? '思考中...' : '让AI猜一猜' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="result-sidebar">
                    <div class="result-card glass-card">
                        <div class="card-header">
                            <el-icon>
                                <ChatDotRound />
                            </el-icon>
                            <h3>AI 的猜测</h3>
                        </div>
                        <div class="result-body">
                            <div v-if="loading" class="loading-state">
                                <div class="ai-avatar">🤖</div>
                                <div class="thinking-dots">
                                    <span>.</span><span>.</span><span>.</span>
                                </div>
                                <p>让我想想，你画的是什么...</p>
                            </div>
                            <div v-else-if="guessResult" class="result-state pulse-info">
                                <div class="ai-avatar">💡</div>
                                <p class="label">我猜你画的是：</p>
                                <h2 class="guessText">{{ guessResult }}</h2>
                            </div>
                            <div v-else class="empty-state">
                                <el-icon class="big-icon">
                                    <Picture />
                                </el-icon>
                                <p>准备好了吗？在画布上画个东西，然后点击下方的“猜一猜”按钮。</p>
                            </div>
                        </div>
                    </div>

                    <div class="instructions-card glass-card">
                        <h3>玩法提示</h3>
                        <ul class="step-list">
                            <li><span>1</span> 构思一个简单的物体</li>
                            <li><span>2</span> 使用不同颜色绘制轮廓</li>
                            <li><span>3</span> 点击识别，见证 AI 的创造力</li>
                        </ul>
                    </div>

                    <div class="info-card glass-card">
                        <div class="card-header">
                            <el-icon>
                                <InfoFilled />
                            </el-icon>
                            <h3>关于此工具</h3>
                        </div>
                        <div class="info-content">
                            <p><strong>隐私安全：</strong> 您的 API Key 仅保存在浏览器本地（LocalStorage），请求直接发往 SiliconFlow，不经过任何第三方服务器。
                            </p>
                            <p><strong>模型推荐：</strong>
                                建议使用支持多模态（Vision）的模型。注意：受限于模型规模和后端负载，<strong>不同模型的回答速度会有明显差异。</strong></p>
                            <p><strong>费用提示：</strong> 接口调用按 Token 计费，具体标准请查看 SiliconFlow 官网。</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - AI 视觉交互实验室
        </footer>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch, onUnmounted, computed } from 'vue'
import { Back, Setting, EditPen, Delete, Cpu, ChatDotRound, Picture, InfoFilled, Plus, PictureFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const canvasRef = ref(null)
const ctx = ref(null)
const loading = ref(false)
const guessResult = ref('')
const showSettings = ref(false)

const currentColor = ref('#000000')
const currentBgColor = ref('#FFFFFF')
const brushSize = ref(5)
const colors = ['#000000', '#FF3B30', '#4CD964', '#007AFF', '#FFCC00', '#5856D6', '#FF9500', '#FF2D55']

const bgOptions = [
    { name: '白色', color: '#FFFFFF' },
    { name: '护眼', color: '#F0F9EB' },
    { name: '深灰', color: '#333333' },
    { name: '黑夜', color: '#000000' }
]

const canvasSize = reactive({
    width: 600,
    height: 450
})

const isDrawing = ref(false)

const config = reactive({
    apiKey: localStorage.getItem('ai_guess_api_key') || '',
    apiUrl: localStorage.getItem('ai_guess_api_url') || 'https://api.siliconflow.cn/v1/chat/completions',
    modelId: localStorage.getItem('ai_guess_model_id') || 'Qwen/Qwen2-VL-72B-Instruct'
})

const providers = [
    {
        id: 'siliconflow',
        name: 'SiliconFlow (推荐)',
        url: 'https://api.siliconflow.cn/v1/chat/completions',
        defaultModel: 'Qwen/Qwen2-VL-72B-Instruct'
    },
    {
        id: 'alicloud',
        name: '阿里通义 (DashScope)',
        url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
        defaultModel: 'qwen-vl-max'
    },
    {
        id: 'openrouter',
        name: 'OpenRouter',
        url: 'https://openrouter.ai/api/v1/chat/completions',
        defaultModel: 'google/gemini-flash-1.5-8b'
    },
    {
        id: 'zhipu',
        name: '智谱 AI',
        url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        defaultModel: 'glm-4v-flash'
    },
    {
        id: 'openai',
        name: 'OpenAI (Direct)',
        url: 'https://api.openai.com/v1/chat/completions',
        defaultModel: 'gpt-4o-mini'
    },
    {
        id: 'custom',
        name: '自定义',
        url: '',
        defaultModel: ''
    }
]

const currentProviderId = ref('siliconflow')
const currentProvider = computed(() => providers.find(p => p.id === currentProviderId.value))

const selectProvider = (p) => {
    currentProviderId.value = p.id
    if (p.id !== 'custom') {
        config.apiUrl = p.url
        config.modelId = p.defaultModel
    }
}

const saveConfig = () => {
    localStorage.setItem('ai_guess_api_key', config.apiKey)
    localStorage.setItem('ai_guess_api_url', config.apiUrl)
    localStorage.setItem('ai_guess_model_id', config.modelId)
    showSettings.value = false
    ElMessage.success('配置已保存')
}

onMounted(() => {
    initCanvas()
    window.addEventListener('resize', initCanvas)
})

onUnmounted(() => {
    window.removeEventListener('resize', initCanvas)
})

const initCanvas = () => {
    const canvas = canvasRef.value
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    ctx.value = canvas.getContext('2d')
    ctx.value.scale(dpr, dpr)

    
    canvasSize.width = rect.width
    canvasSize.height = rect.height

    clearCanvas()
}

const clearCanvas = () => {
    if (!ctx.value) return
    
    ctx.value.clearRect(0, 0, canvasSize.width, canvasSize.height)
    ctx.value.fillStyle = currentBgColor.value
    ctx.value.fillRect(0, 0, canvasSize.width, canvasSize.height)
    guessResult.value = ''
}

const changeBgColor = (color) => {
    currentBgColor.value = color
    clearCanvas()
}

const getPoint = (e) => {
    const canvas = canvasRef.value
    const rect = canvas.getBoundingClientRect()

    
    
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top

    return { x, y }
}

const startDrawing = (e) => {
    isDrawing.value = true
    const { x, y } = getPoint(e)
    ctx.value.beginPath()
    ctx.value.moveTo(x, y)
}

const draw = (e) => {
    if (!isDrawing.value) return
    const { x, y } = getPoint(e)
    ctx.value.lineWidth = brushSize.value
    ctx.value.lineCap = 'round'
    ctx.value.lineJoin = 'round'
    ctx.value.strokeStyle = currentColor.value
    ctx.value.lineTo(x, y)
    ctx.value.stroke()
}

const stopDrawing = () => {
    isDrawing.value = false
}

const handleTouchStart = (e) => {
    e.preventDefault()
    startDrawing(e)
}

const handleTouchMove = (e) => {
    e.preventDefault()
    draw(e)
}

const guessDraw = async () => {
    if (!config.apiKey) {
        showSettings.value = true
        ElMessage.warning('请先配置 API Key')
        return
    }

    loading.value = true
    guessResult.value = ''

    try {
        
        
        const offscreen = document.createElement('canvas')
        const maxDim = 512
        let w = canvasRef.value.width
        let h = canvasRef.value.height

        
        if (w > h) {
            if (w > maxDim) {
                h = h * (maxDim / w)
                w = maxDim
            }
        } else {
            if (h > maxDim) {
                w = w * (maxDim / h)
                h = maxDim
            }
        }

        offscreen.width = w
        offscreen.height = h
        const offCtx = offscreen.getContext('2d')
        
        offCtx.drawImage(canvasRef.value, 0, 0, w, h)
        
        const dataURL = offscreen.toDataURL('image/jpeg', 0.8)

        const response = await fetch(config.apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: config.modelId,
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: '请猜测这张手绘画出的是什么物体？只回复物体名称关键词，不要多余解释。不要深度思考，快速回答。' },
                            { type: 'image_url', image_url: { url: dataURL } }
                        ]
                    }
                ],
                max_tokens: 50,
                temperature: 0.1
            })
        })

        if (!response.ok) {
            const err = await response.json()
            throw new Error(err.error?.message || '请求失败')
        }

        const data = await response.json()
        guessResult.value = data.choices[0].message.content.trim().replace(/[。！!.]/g, '')
    } catch (err) {
        console.error(err)
        ElMessage.error('识别失败: ' + err.message)
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.ai-draw-guess {
    --primary: #6366f1;
    --primary-light: #818cf8;
    --bg: #f8fafc;
    --card-bg: rgba(255, 255, 255, 0.8);
    --border: #e2e8f0;
    --text-main: #1e293b;
    --text-muted: #64748b;

    min-height: 100vh;
    background: radial-gradient(circle at top right, #eef2ff, #f8fafc);
    color: var(--text-main);
    font-family: 'Inter', -apple-system, sans-serif;
}

.nav-bar {
    position: sticky;
    top: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
}

.nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 0.95rem;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s;
}

.nav-back:hover {
    background: #f1f5f9;
    color: var(--primary);
}

.nav-center h1 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, var(--primary), #a855f7);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

.nav-subtitle {
    font-size: 0.75rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.settings-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: white;
    cursor: pointer;
    transition: all 0.2s;
}

.settings-btn.active {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
}

.main-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.glass-card {
    background: var(--card-bg);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 20px;
    box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05);
}

.settings-card {
    margin-bottom: 2rem;
    padding: 1.5rem;
}

.settings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.2rem;
    margin-top: 1rem;
}

.form-item.full-width {
    grid-column: 1 / -1;
}

.provider-select {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    margin-top: 0.4rem;
}

.provider-badge {
    padding: 0.4rem 0.8rem;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: white;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
}

.provider-badge:hover {
    border-color: var(--primary);
    color: var(--primary);
}

.provider-badge.active {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
}

.form-item label {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-muted);
    margin-bottom: 0.5rem;
}

.form-item input {
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.5);
    outline: none;
    transition: all 0.2s;
}

.form-item input:focus {
    border-color: var(--primary);
    background: white;
}

.settings-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
}

.hint {
    font-size: 0.8rem;
    color: var(--text-muted);
}

.save-btn {
    padding: 0.6rem 1.5rem;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
}

.game-layout {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 2rem;
}

@media (max-width: 1024px) {
    .game-layout {
        grid-template-columns: 1fr;
    }
}

.canvas-wrapper {
    background: white;
    border-radius: 12px;
    margin-bottom: 1.5rem;
    cursor: crosshair;
    overflow: hidden;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
}

canvas {
    width: 100%;
    height: 450px;
    display: block;
}

.toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    padding: 0.5rem;
}

.color-picker {
    display: flex;
    gap: 0.5rem;
}

.color-dot {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 3px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
}

.color-dot.active {
    border-color: white;
    box-shadow: 0 0 0 2px var(--primary);
    transform: scale(1.1);
}

.custom-color-picker :deep(.el-color-picker__trigger) {
    width: 28px;
    height: 28px;
    padding: 2px;
    border: 1px dashed var(--border);
    border-radius: 50%;
}

.brush-settings {
    display: flex;
    align-items: center;
    gap: 1.2rem;
    background: #f1f5f9;
    padding: 0.5rem 1.2rem;
    border-radius: 30px;
}

.setting-item {
    display: flex;
    align-items: center;
    gap: 0.8rem;
}

.divider {
    width: 1px;
    height: 20px;
    background: var(--border);
}

.bg-options {
    display: flex;
    gap: 0.4rem;
    align-items: center;
}

.bg-dot {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border: 1px solid var(--border);
    cursor: pointer;
    transition: all 0.2s;
}

.bg-dot.active {
    box-shadow: 0 0 0 2px var(--primary);
    border-color: white;
}

.custom-bg-picker :deep(.el-color-picker__trigger) {
    width: 20px;
    height: 20px;
    padding: 1px;
    border-radius: 4px;
}

.ai-badge {
    font-size: 0.65rem;
    background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 700;
    letter-spacing: 0.5px;
    line-height: 1;
    margin-left: 8px;
    vertical-align: middle;
}

.size-text {
    min-width: 20px;
    font-weight: 600;
    font-size: 0.9rem;
}

.actions {
    display: flex;
    gap: 0.8rem;
}

.action-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 12px;
    border: none;
    font-weight: 600;
    cursor: pointer;
}

.action-btn.clear {
    background: #f1f5f9;
    color: var(--text-muted);
}

.action-btn.guess {
    background: linear-gradient(135deg, var(--primary), #a855f7);
    color: white;
    min-width: 140px;
}

.action-btn:hover {
    transform: translateY(-2px);
    opacity: 0.9;
}

.result-card {
    padding: 1.5rem;
    margin-bottom: 2rem;
    min-height: 280px;
    display: flex;
    flex-direction: column;
}

.card-header {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 1.5rem;
}

.card-header h3 {
    font-size: 1.1rem;
    margin: 0;
}

.result-body {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

.loading-state,
.result-state,
.empty-state {
    text-align: center;
}

.ai-avatar {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.thinking-dots span {
    animation: bounce 1.4s infinite ease-in-out both;
    font-size: 2rem;
    display: inline-block;
}

.thinking-dots span:nth-child(1) {
    animation-delay: -0.32s;
}

.thinking-dots span:nth-child(2) {
    animation-delay: -0.16s;
}

@keyframes bounce {

    0%,
    80%,
    100% {
        transform: scale(0);
    }

    40% {
        transform: scale(1.0);
    }
}

.guessText {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--primary);
    margin: 0.5rem 0;
}

.big-icon {
    font-size: 3rem;
    color: var(--border);
    margin-bottom: 1rem;
}

.instructions-card {
    padding: 1.5rem;
}

.step-list {
    list-style: none;
    padding: 0;
    margin: 1rem 0 0;
}

.step-list li {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    font-size: 0.9rem;
}

.step-list span {
    width: 24px;
    height: 24px;
    background: var(--primary);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
}

.info-card {
    padding: 1.5rem;
    margin-top: 1.5rem;
}

.info-content {
    font-size: 0.85rem;
    color: var(--text-muted);
    line-height: 1.6;
}

.info-content p {
    margin-bottom: 0.8rem;
}

.info-content strong {
    color: var(--text-main);
    display: block;
    margin-bottom: 0.2rem;
}

.footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-muted);
    font-size: 0.85rem;
}


.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translateY(-20px);
    opacity: 0;
}

.mini-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.pulse-info {
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.02);
    }

    100% {
        transform: scale(1);
    }
}
</style>
