<template>
    <div class="tool-page">
        <header class="tool-header">
            <div class="header-left">
                <el-button text @click="goBack">
                    <el-icon>
                        <ArrowLeft />
                    </el-icon>
                    <span>返回</span>
                </el-button>
            </div>
            <div class="header-center">
                <h1 class="tool-title">高级计时系统</h1>
                <span class="tool-subtitle">Advanced Timer & Stopwatch</span>
            </div>
            <div class="header-right">
                <el-button type="info" @click="settingsVisible = true">
                    <el-icon>
                        <Setting />
                    </el-icon>
                </el-button>
            </div>
        </header>

        <main class="tool-content">
            
            <div class="mode-switcher">
                <div class="switcher-bg">
                    <div
class="switcher-active"
                        :style="{ transform: currentMode === 'countdown' ? 'translateX(0)' : 'translateX(100%)' }">
                    </div>
                    <button
class="switcher-btn" :class="{ active: currentMode === 'countdown' }"
                        @click="switchMode('countdown')">倒计时</button>
                    <button
class="switcher-btn" :class="{ active: currentMode === 'stopwatch' }"
                        @click="switchMode('stopwatch')">正计时</button>
                </div>
            </div>

            
            <div v-show="currentMode === 'countdown'" class="timer-container glass-card">
                <div class="display-area">
                    <div class="time-display" :class="{ 'time-end': isTimeEnd }">{{ formatTime(countdownRemaining) }}
                    </div>
                    <div class="time-label">{{ currentLabel || '倒计时' }}</div>
                    <div class="time-status" :class="{ 'status-active': isCountdownRunning }">
                        {{ isTimeEnd ? '计时结束' : (isCountdownRunning ? '计时中' : '已暂停') }}
                    </div>
                </div>

                <div class="controls-area">
                    <el-button
type="primary" size="large" circle class="control-btn play-btn"
                        :class="{ 'is-running': isCountdownRunning }" @click="toggleCountdown">
                        <el-icon size="24">
                            <component :is="isCountdownRunning ? 'VideoPause' : 'VideoPlay'" />
                        </el-icon>
                    </el-button>
                    <el-button
type="danger" size="large" circle class="control-btn" :disabled="!canResetCountdown"
                        @click="resetCountdown">
                        <el-icon size="24">
                            <Refresh />
                        </el-icon>
                    </el-button>
                </div>

                
                <div class="quick-presets">
                    <div class="section-title"><el-icon>
                            <Clock />
                        </el-icon> 快速开始</div>
                    <div class="preset-grid">
                        <button
v-for="(preset, index) in quickPresets" :key="index" class="preset-btn"
                            @click="startPreset(preset)">
                            <span class="preset-time">{{ formatDuration(preset.time) }}</span>
                            <span class="preset-label">{{ preset.label }}</span>
                        </button>
                        <button class="preset-btn add-btn" @click="showAddPreset">
                            <el-icon>
                                <Plus />
                            </el-icon>
                        </button>
                    </div>
                </div>

                
                <el-collapse v-model="activeCollapse" class="custom-collapse">
                    <el-collapse-item name="custom">
                        <template #title>
                            <div class="collapse-title"><el-icon>
                                    <Operation />
                                </el-icon> 自定义时间</div>
                        </template>
                        <div class="custom-input-group">
                            <div class="input-item">
                                <el-input-number
v-model="customHours" :min="0" :max="99" controls-position="right"
                                    placeholder="00" />
                                <span class="unit">时</span>
                            </div>
                            <div class="input-item">
                                <el-input-number
v-model="customMinutes" :min="0" :max="59" controls-position="right"
                                    placeholder="00" />
                                <span class="unit">分</span>
                            </div>
                            <div class="input-item">
                                <el-input-number
v-model="customSeconds" :min="0" :max="59" controls-position="right"
                                    placeholder="00" />
                                <span class="unit">秒</span>
                            </div>
                        </div>
                        <el-input v-model="customLabelInput" placeholder="标签（可选，如：午休）" class="mt-2" />
                        <el-button type="primary" class="w-full mt-3" @click="startCustomTimer">开始计时</el-button>
                    </el-collapse-item>

                    <el-collapse-item name="target">
                        <template #title>
                            <div class="collapse-title"><el-icon>
                                    <Calendar />
                                </el-icon> 目标时间倒计时</div>
                        </template>
                        <el-date-picker
v-model="targetDateTime" type="datetime" placeholder="选择目标时间"
                            style="width: 100%" :disabled-date="disabledDate" />
                        <el-button type="primary" class="w-full mt-3" @click="startTargetTimer">开始倒计时</el-button>
                    </el-collapse-item>
                </el-collapse>
            </div>

            
            <div v-show="currentMode === 'stopwatch'" class="timer-container glass-card">
                <div class="display-area">
                    <div class="time-display stopwatch-display">{{ formatStopwatch(stopwatchElapsed) }}</div>
                    <div class="stopwatch-ms">{{ formatMs(stopwatchElapsed) }}</div>
                    <div class="time-status" :class="{ 'status-active': isStopwatchRunning }">
                        {{ isStopwatchRunning ? '运行中' : '已停止' }}
                    </div>
                </div>

                <div class="controls-area">
                    <el-button
v-if="!isStopwatchRunning" type="success" size="large" circle
                        class="control-btn play-btn" @click="startStopwatch">
                        <el-icon size="24">
                            <VideoPlay />
                        </el-icon>
                    </el-button>
                    <el-button
v-else type="warning" size="large" circle class="control-btn play-btn"
                        @click="pauseStopwatch">
                        <el-icon size="24">
                            <VideoPause />
                        </el-icon>
                    </el-button>

                    <el-button
type="primary" size="large" circle class="control-btn" :disabled="!isStopwatchRunning && stopwatchElapsed === 0"
                        @click="lapStopwatch">
                        <el-icon size="24">
                            <Flag />
                        </el-icon>
                    </el-button>

                    <el-button
type="danger" size="large" circle class="control-btn" :disabled="stopwatchElapsed === 0"
                        @click="resetStopwatch">
                        <el-icon size="24">
                            <Refresh />
                        </el-icon>
                    </el-button>
                </div>

                
                <div v-if="laps.length > 0" class="laps-container">
                    <div class="section-title"><el-icon>
                            <DataAnalysis />
                        </el-icon> 计次记录</div>
                    <div class="laps-list-wrapper">
                        <div class="laps-list">
                            <div v-for="(lap, index) in reversedLaps" :key="lap.index" class="lap-item">
                                <div class="lap-index">#{{ lap.index }}</div>
                                <div class="lap-time">{{ formatStopwatch(lap.time) }}<small>.{{ String(lap.time %
                                    1000).padStart(3,
                                        '0') }}</small></div>
                                <div class="lap-split text-gray-400">+{{ formatStopwatch(lap.split) }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        
        <el-drawer v-model="settingsVisible" title="高级设置" size="90%" :direction="'btt'" class="settings-drawer">
            <div class="settings-content">
                <div class="settings-section">
                    <h3 class="settings-section-title">提示音设置</h3>
                    <div class="sound-grid">
                        <div
v-for="sound in soundOptions" :key="sound.key" class="sound-item"
                            :class="{ active: currentSound === sound.key }" @click="setSound(sound.key)">
                            <div class="sound-icon"><el-icon>
                                    <component :is="sound.icon" />
                                </el-icon></div>
                            <div class="sound-name">{{ sound.name }}</div>
                        </div>
                    </div>
                    <div class="mt-4 flex items-center justify-between">
                        <span>循环播放提示音</span>
                        <el-switch v-model="loopSound" />
                    </div>
                </div>

                <div class="settings-section">
                    <h3 class="settings-section-title">预设管理</h3>
                    <div class="editable-presets">
                        <div v-for="(preset, index) in quickPresets" :key="index" class="editable-preset-item">
                            <span class="time">{{ formatDuration(preset.time) }}</span>
                            <span class="label">{{ preset.label }}</span>
                            <el-button type="danger" link @click="removePreset(index)"><el-icon>
                                    <Delete />
                                </el-icon></el-button>
                        </div>
                    </div>
                </div>

                <div class="settings-section">
                    <h3 class="settings-section-title">通知</h3>
                    <div class="flex items-center justify-between">
                        <span>浏览器通知</span>
                        <el-switch v-model="enableNotification" @change="requestNotificationPermission" />
                    </div>
                    <div class="flex items-center justify-between mt-3">
                        <span>震动反馈</span>
                        <el-switch v-model="enableVibration" />
                    </div>
                </div>
            </div>
        </el-drawer>

        
        <el-dialog v-model="addPresetVisible" title="添加快速预设" width="90%">
            <div class="custom-input-group">
                <div class="input-item">
                    <el-input-number
v-model="newPresetHours" :min="0" :max="99" controls-position="right"
                        placeholder="00" />
                    <span class="unit">时</span>
                </div>
                <div class="input-item">
                    <el-input-number
v-model="newPresetMinutes" :min="0" :max="59" controls-position="right"
                        placeholder="00" />
                    <span class="unit">分</span>
                </div>
                <div class="input-item">
                    <el-input-number
v-model="newPresetSeconds" :min="0" :max="59" controls-position="right"
                        placeholder="00" />
                    <span class="unit">秒</span>
                </div>
            </div>
            <el-input v-model="newPresetLabel" placeholder="标签" class="mt-3" />
            <template #footer>
                <el-button @click="addPresetVisible = false">取消</el-button>
                <el-button type="primary" @click="confirmAddPreset">添加</el-button>
            </template>
        </el-dialog>

        <audio ref="audioPlayer" loop></audio>

        
        <footer class="footer">
            © 2026 LRM工具箱 - 高级计时系统
        </footer>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import {
    ArrowLeft, Setting, VideoPlay, VideoPause, Refresh,
    Clock, Plus, Operation, Calendar, Flag, DataAnalysis,
    Bell, Mute, Service, Delete
} from '@element-plus/icons-vue'

const router = useRouter()
const goBack = () => router.back()


const currentMode = ref('countdown') 
const settingsVisible = ref(false)
const activeCollapse = ref(['custom'])


const countdownTotal = ref(0)
const countdownRemaining = ref(0)
const isCountdownRunning = ref(false)
const currentLabel = ref('')
const countdownEndTime = ref(0)
const customHours = ref(0)
const customMinutes = ref(0)
const customSeconds = ref(0)
const customLabelInput = ref('')
const targetDateTime = ref(null)


const stopwatchStartTime = ref(0)
const stopwatchElapsed = ref(0)
const isStopwatchRunning = ref(false)
const laps = ref([])


const quickPresets = ref([
    { time: 60, label: '1分钟' },
    { time: 300, label: '5分钟' },
    { time: 600, label: '10分钟' },
    { time: 1800, label: '30分钟' },
    { time: 3600, label: '1小时' }
])
const currentSound = ref('default')
const loopSound = ref(false)
const enableNotification = ref(false)
const enableVibration = ref(true)

const addPresetVisible = ref(false)
const newPresetHours = ref(0)
const newPresetMinutes = ref(0)
const newPresetSeconds = ref(0)
const newPresetLabel = ref('')

const audioPlayer = ref(null)


const sounds = {
    default: { name: '默认', icon: 'Bell', src: 'https://clockcn.com/sound/xylophone.mp3' },
    digital: { name: '电子', icon: 'Service', src: 'https://clockcn.com/sound/xylophone.mp3' }, 
    soft: { name: '柔和', icon: 'VideoPlay', src: 'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3' },
    alarm: { name: '警报', icon: 'VideoPause', src: 'https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3' }
}
const soundOptions = Object.keys(sounds).map(k => ({ key: k, ...sounds[k] }))




const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const formatStopwatch = (ms) => {
    const seconds = Math.floor(ms / 1000)
    return formatTime(seconds)
}

const formatMs = (ms) => {
    return String(ms % 1000).padStart(3, '0')
}

const formatDuration = (seconds) => {
    if (seconds >= 3600) return (seconds / 3600).toFixed(1).replace('.0', '') + '小时' 
    if (seconds >= 60) return (seconds / 60).toFixed(0) + '分钟'
    return seconds + '秒'
}


let timerInterval = null

const isTimeEnd = computed(() => countdownTotal.value > 0 && countdownRemaining.value === 0)
const canResetCountdown = computed(() => countdownTotal.value > 0 && (countdownRemaining.value < countdownTotal.value || !isCountdownRunning.value))

const startTimer = (seconds, label) => {
    if (seconds <= 0) return
    countdownTotal.value = seconds
    countdownRemaining.value = seconds
    currentLabel.value = label
    countdownEndTime.value = Date.now() + seconds * 1000
    resumeCountdown()
}

const resumeCountdown = () => {
    if (timerInterval) clearInterval(timerInterval)
    countdownEndTime.value = Date.now() + countdownRemaining.value * 1000
    isCountdownRunning.value = true

    if (audioPlayer.value) {
        audioPlayer.value.pause()
        audioPlayer.value.currentTime = 0
    }

    timerInterval = setInterval(() => {
        const now = Date.now()
        const diff = Math.ceil((countdownEndTime.value - now) / 1000)

        if (diff <= 0) {
            countdownRemaining.value = 0
            completeCountdown()
        } else {
            countdownRemaining.value = diff
        }
    }, 200) 
}

const pauseCountdown = () => {
    isCountdownRunning.value = false
    if (timerInterval) clearInterval(timerInterval)
}

const toggleCountdown = () => {
    if (isCountdownRunning.value) {
        pauseCountdown()
    } else {
        
        if (countdownRemaining.value <= 0 && countdownTotal.value > 0) {
            
            startTimer(countdownTotal.value, currentLabel.value)
        } else if (countdownTotal.value > 0) {
            resumeCountdown()
        }
    }
}

const resetCountdown = () => {
    pauseCountdown()
    countdownRemaining.value = countdownTotal.value
    if (audioPlayer.value) {
        audioPlayer.value.pause()
        audioPlayer.value.currentTime = 0
    }
}

const completeCountdown = () => {
    pauseCountdown()
    playAlert()
    notify('计时结束', `${currentLabel.value || '倒计时'} 已完成`)
}

const startPreset = (preset) => {
    startTimer(preset.time, preset.label)
}

const startCustomTimer = () => {
    const total = customHours.value * 3600 + customMinutes.value * 60 + customSeconds.value
    if (total > 0) {
        startTimer(total, customLabelInput.value)
    }
}

const disabledDate = (time) => {
    return time.getTime() < Date.now() - 8.64e7
}

const startTargetTimer = () => {
    if (!targetDateTime.value) return
    const now = Date.now()
    const target = new Date(targetDateTime.value).getTime()
    const diff = Math.ceil((target - now) / 1000)

    if (diff <= 0) {
        ElMessage.error('目标时间必须在未来')
        return
    }
    startTimer(diff, '目标时间倒计时')
}


let stopwatchIntervalId = null

const startStopwatch = () => {
    if (!isStopwatchRunning.value) {
        stopwatchStartTime.value = Date.now() - stopwatchElapsed.value
        isStopwatchRunning.value = true
        stopwatchIntervalId = setInterval(() => {
            stopwatchElapsed.value = Date.now() - stopwatchStartTime.value
        }, 10)
    }
}

const pauseStopwatch = () => {
    isStopwatchRunning.value = false
    if (stopwatchIntervalId) clearInterval(stopwatchIntervalId)
}

const resetStopwatch = () => {
    pauseStopwatch()
    stopwatchElapsed.value = 0
    laps.value = []
}

const lapStopwatch = () => {
    const current = stopwatchElapsed.value
    const lastLapTime = laps.value.length > 0 ? laps.value[laps.value.length - 1].time : 0
    laps.value.push({
        index: laps.value.length + 1,
        time: current,
        split: current - lastLapTime
    })
}

const reversedLaps = computed(() => [...laps.value].reverse())

const switchMode = (mode) => {
    
    
    
    if (mode === 'countdown' && isStopwatchRunning.value) pauseStopwatch()
    if (mode === 'stopwatch' && isCountdownRunning.value) pauseCountdown()
    currentMode.value = mode
}


const setSound = (key) => {
    currentSound.value = key
    if (audioPlayer.value) {
        audioPlayer.value.src = sounds[key].src
        audioPlayer.value.play().catch(() => { })
    }
}

const playAlert = () => {
    if (audioPlayer.value) {
        audioPlayer.value.src = sounds[currentSound.value].src
        audioPlayer.value.loop = loopSound.value
        audioPlayer.value.play().catch(e => console.error(e))
    }
    if (enableVibration.value && navigator.vibrate) {
        navigator.vibrate([500, 300, 500])
    }
}

const notify = (title, body) => {
    
    ElNotification({
        title,
        message: body,
        type: 'success',
        duration: 0
    })

    
    if (enableNotification.value && Notification.permission === 'granted') {
        new Notification(title, { body })
    }
}

const requestNotificationPermission = (val) => {
    if (val && Notification && Notification.permission !== 'granted') {
        Notification.requestPermission()
    }
}


const showAddPreset = () => {
    addPresetVisible.value = true
}

const confirmAddPreset = () => {
    const total = newPresetHours.value * 3600 + newPresetMinutes.value * 60 + newPresetSeconds.value
    if (total > 0) {
        quickPresets.value.push({
            time: total,
            label: newPresetLabel.value || formatDuration(total)
        })
        addPresetVisible.value = false
        saveSettings()
    }
}

const removePreset = (index) => {
    quickPresets.value.splice(index, 1)
    saveSettings()
}


const loadSettings = () => {
    const s = localStorage.getItem('timer_tool_settings')
    if (s) {
        try {
            const data = JSON.parse(s)
            currentSound.value = data.currentSound || 'default'
            loopSound.value = data.loopSound || false
            enableNotification.value = data.enableNotification || false
            enableVibration.value = data.enableVibration ?? true
            if (data.quickPresets) quickPresets.value = data.quickPresets
        } catch (e) { }
    }
}

const saveSettings = () => {
    localStorage.setItem('timer_tool_settings', JSON.stringify({
        currentSound: currentSound.value,
        loopSound: loopSound.value,
        enableNotification: enableNotification.value,
        enableVibration: enableVibration.value,
        quickPresets: quickPresets.value
    }))
}

onMounted(() => {
    loadSettings()
})

watch([currentSound, loopSound, enableNotification, enableVibration, quickPresets], saveSettings, { deep: true })
onUnmounted(() => {
    if (timerInterval) clearInterval(timerInterval)
    if (stopwatchIntervalId) clearInterval(stopwatchIntervalId)
})
</script>

<style scoped>
.tool-page {
    min-height: 100vh;
    background: #f1f5f9;
    display: flex;
    flex-direction: column;
}

.tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #ffffff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 10;
}

.header-center {
    text-align: center;
}

.tool-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
}

.tool-subtitle {
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.tool-content {
    flex: 1;
    max-width: 600px;
    width: 100%;
    margin: 0 auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}


.mode-switcher {
    display: flex;
    justify-content: center;
    margin-bottom: 0.5rem;
}

.switcher-bg {
    background: #e2e8f0;
    border-radius: 999px;
    padding: 4px;
    display: flex;
    position: relative;
    width: 200px;
}

.switcher-active {
    position: absolute;
    top: 4px;
    left: 4px;
    width: 50%;
    height: calc(100% - 8px);
    background: #ffffff;
    border-radius: 999px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
    
    width: 96px;
    
}

.switcher-btn {
    flex: 1;
    position: relative;
    z-index: 1;
    border: none;
    background: transparent;
    padding: 6px 0;
    border-radius: 999px;
    font-size: 0.9rem;
    font-weight: 500;
    color: #64748b;
    cursor: pointer;
    transition: color 0.3s;
}

.switcher-btn.active {
    color: #0f172a;
    font-weight: 600;
}


.glass-card {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 24px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: all 0.3s ease;
}


.display-area {
    text-align: center;
    margin-bottom: 2rem;
    width: 100%;
}

.time-display {
    font-size: 4rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: #1e293b;
    line-height: 1;
    letter-spacing: -2px;
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.5rem;
}

.time-end {
    color: #ef4444;
    -webkit-text-fill-color: #ef4444;
    animation: pulse 1s infinite;
}

.stopwatch-display {
    font-size: 3.5rem;
    
}

.stopwatch-ms {
    font-family: monospace;
    font-size: 1.5rem;
    color: #10b981;
    font-weight: 600;
    margin-top: -0.5rem;
}

.time-label {
    font-size: 1.1rem;
    color: #3b82f6;
    font-weight: 500;
    margin-bottom: 0.5rem;
    height: 1.5rem;
}

.time-status {
    font-size: 0.85rem;
    color: #94a3b8;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.status-active {
    color: #10b981;
}


.controls-area {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.control-btn {
    width: 64px;
    height: 64px;
    font-size: 1.5rem;
    transition: all 0.2s;
}

.control-btn:hover {
    transform: scale(1.05);
}

.play-btn {
    width: 80px;
    height: 80px;
}

.play-btn.is-running {
    background-color: #f59e0b;
    
    border-color: #f59e0b;
}

@keyframes pulse {
    0% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }

    100% {
        opacity: 1;
    }
}


.quick-presets {
    width: 100%;
    margin-bottom: 1.5rem;
}

.section-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.preset-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 0.8rem;
}

.preset-btn {
    background: rgba(59, 130, 246, 0.08);
    border: 1px solid transparent;
    border-radius: 12px;
    padding: 0.8rem 0.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s;
    color: #3b82f6;
}

.preset-btn:hover {
    background: rgba(59, 130, 246, 0.15);
    transform: translateY(-2px);
}

.preset-time {
    font-weight: 700;
    font-size: 1.1rem;
}

.preset-label {
    font-size: 0.7rem;
    margin-top: 0.2rem;
    opacity: 0.8;
}

.add-btn {
    border: 1px dashed #cbd5e1;
    background: transparent;
    color: #94a3b8;
    justify-content: center;
}

.add-btn:hover {
    border-color: #3b82f6;
    color: #3b82f6;
}


.custom-collapse {
    width: 100%;
    border: none;
    background: transparent;
}

.custom-collapse :deep(.el-collapse-item__header) {
    background: transparent;
    border: none;
    font-weight: 500;
    color: #64748b;
    height: 40px;
}

.custom-collapse :deep(.el-collapse-item__wrap) {
    background: transparent;
    border: none;
}

.custom-collapse :deep(.el-collapse-item__content) {
    padding-bottom: 0;
}

.collapse-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.custom-input-group {
    display: flex;
    gap: 0.5rem;
    justify-content: space-between;
}

.input-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.unit {
    font-size: 0.75rem;
    color: #94a3b8;
    margin-top: 0.2rem;
}


.laps-container {
    width: 100%;
    margin-top: 1rem;
    border-top: 1px solid #e2e8f0;
    padding-top: 1rem;
}

.laps-list-wrapper {
    max-height: 200px;
    overflow-y: auto;
    border-radius: 8px;
    background: #f8fafc;
    padding: 0.5rem;
}

.lap-item {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem;
    border-bottom: 1px solid #e2e8f0;
    font-family: monospace;
    font-size: 0.9rem;
}

.lap-item:last-child {
    border-bottom: none;
}

.lap-index {
    color: #3b82f6;
    font-weight: 600;
    width: 40px;
}

.lap-time {
    color: #1e293b;
    font-weight: 700;
    flex: 1;
    text-align: center;
}

.lap-split {
    color: #64748b;
    width: 80px;
    text-align: right;
}


.settings-content {
    padding: 0 1rem 2rem;
}

.settings-section {
    margin-bottom: 2rem;
}

.settings-section-title {
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 1rem;
}

.sound-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
}

.sound-item {
    background: #f1f5f9;
    border-radius: 12px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s;
}

.sound-item.active {
    background: #eff6ff;
    border-color: #3b82f6;
    color: #3b82f6;
}

.sound-icon {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
}

.editable-presets {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.editable-preset-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    padding: 0.8rem;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
}

.editable-preset-item .time {
    font-weight: 600;
}

.editable-preset-item .label {
    color: #64748b;
    font-size: 0.85rem;
}

@media (max-width: 640px) {
    .time-display {
        font-size: 3rem;
    }

    .stopwatch-display {
        font-size: 2.5rem;
    }
}

.footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
}
</style>
