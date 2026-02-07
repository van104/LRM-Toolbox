<template>
    <div class="tool-page">
        <header class="tool-header">
            <div class="header-left">
                <el-button text @click="goBack"><el-icon>
                        <ArrowLeft />
                    </el-icon><span>返回</span></el-button>
            </div>
            <div class="header-center">
                <h1 class="tool-title">节拍器</h1>
                <span class="tool-subtitle">Metronome</span>
            </div>
            <div class="header-right"></div>
        </header>

        <main class="tool-content">
            <div class="metronome-card glass-card">
                <div class="visualizer">
                    <div class="dots">
                        <div v-for="n in beatsPerBar" :key="n" class="dot" :class="{ active: currentBeat === n }"></div>
                    </div>
                    <div class="bpm-display">
                        <span class="value">{{ bpm }}</span>
                        <span class="label">BPM</span>
                    </div>
                </div>

                <div class="controls">
                    <el-slider v-model="bpm" :min="40" :max="220" :show-tooltip="false" class="bpm-slider" />

                    <div class="btn-row">
                        <button class="adjust-btn" @click="bpm--"><el-icon>
                                <Minus />
                            </el-icon></button>
                        <button class="play-btn" @click="togglePlay" :class="{ playing: isPlaying }">
                            <el-icon v-if="!isPlaying">
                                <VideoPlay />
                            </el-icon>
                            <el-icon v-else>
                                <VideoPause />
                            </el-icon>
                        </button>
                        <button class="adjust-btn" @click="bpm++"><el-icon>
                                <Plus />
                            </el-icon></button>
                    </div>

                    <div class="settings-row">
                        <div class="setting">
                            <span class="label">拍号</span>
                            <el-select v-model="beatsPerBar" style="width: 80px">
                                <el-option v-for="n in [2, 3, 4, 6]" :key="n" :label="`${n}/4`" :value="n" />
                            </el-select>
                        </div>
                        <div class="setting">
                            <span class="label">音色</span>
                            <el-select v-model="soundType" style="width: 100px">
                                <el-option label="Tick" value="tick" />
                                <el-option label="Beep" value="beep" />
                            </el-select>
                        </div>
                    </div>
                </div>
            </div>
        </main>
        <footer class="footer">© 2026 LRM工具箱 - 节拍器</footer>
    </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, VideoPlay, VideoPause, Plus, Minus } from '@element-plus/icons-vue'

const router = useRouter()
const goBack = () => router.back()

const bpm = ref(100)
const isPlaying = ref(false)
const beatsPerBar = ref(4)
const currentBeat = ref(0)
const soundType = ref('tick')
let timerId = null
let audioCtx = null

const playSound = (accent = false) => {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()

    
    if (audioCtx.state === 'suspended') audioCtx.resume()

    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()

    osc.connect(gain)
    gain.connect(audioCtx.destination)

    if (soundType.value === 'beep') {
        osc.type = 'sine'
        osc.frequency.value = accent ? 1000 : 800
    } else {
        osc.type = 'square'
        osc.frequency.value = accent ? 800 : 600
        
    }

    gain.gain.setValueAtTime(1, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1)

    osc.start(audioCtx.currentTime)
    osc.stop(audioCtx.currentTime + 0.1)
}

const togglePlay = () => {
    if (isPlaying.value) {
        stop()
    } else {
        start()
    }
}

const start = () => {
    if (isPlaying.value) return
    isPlaying.value = true
    currentBeat.value = 0
    runLoop()
}

const stop = () => {
    isPlaying.value = false
    clearTimeout(timerId)
    currentBeat.value = 0
}

const runLoop = () => {
    if (!isPlaying.value) return

    currentBeat.value = (currentBeat.value % beatsPerBar.value) + 1
    playSound(currentBeat.value === 1)

    const interval = (60 / bpm.value) * 1000
    timerId = setTimeout(runLoop, interval)
}

watch(bpm, () => {
    if (isPlaying.value) {
        clearTimeout(timerId)
        runLoop() 
    }
})

onUnmounted(() => {
    stop()
    if (audioCtx) audioCtx.close()
})
</script>

<style scoped>
.tool-page {
    min-height: 100vh;
    background: #f8fafc;
    display: flex;
    flex-direction: column;
    color: #1e293b;
}

.tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.header-left,
.header-right {
    width: 100px;
    display: flex;
    align-items: center;
}

.header-center {
    flex: 1;
    text-align: center;
}

.tool-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
}

.tool-subtitle {
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
}

.tool-content {
    flex: 1;
    padding: 2rem;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.metronome-card {
    width: 100%;
    max-width: 400px;
    padding: 2rem;
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    text-align: center;
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.visualizer {
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.dots {
    display: flex;
    gap: 12px;
}

.dot {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #e2e8f0;
    transition: background 0.1s;
}

.dot.active {
    background: #3b82f6;
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
}

.bpm-display .value {
    font-size: 4rem;
    font-weight: 700;
    color: #1e293b;
    line-height: 1;
}

.bpm-display .label {
    font-size: 1rem;
    color: #64748b;
    letter-spacing: 2px;
}

.controls {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.btn-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
}

.adjust-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background: #f1f5f9;
    color: #1e293b;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.adjust-btn:hover {
    background: #e2e8f0;
}

.adjust-btn:active {
    transform: scale(0.95);
}

.play-btn {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    border: none;
    background: #3b82f6;
    color: #fff;
    font-size: 2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
}

.play-btn:hover {
    transform: scale(1.05);
}

.play-btn:active {
    transform: scale(0.95);
}

.play-btn.playing {
    background: #ef4444;
    box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);
}

.settings-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #f1f5f9;
}

.setting {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
}

.setting .label {
    font-size: 0.8rem;
    color: #64748b;
}

.glass-card {
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.footer {
    text-align: center;
    padding: 2rem;
    color: #666;
    font-size: 0.85rem;
}
</style>
