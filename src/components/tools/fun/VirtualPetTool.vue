<template>
    <div class="pet-tool">
        <nav class="nav-bar">
            <button @click="$router.back()" class="nav-back">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>虚拟宠物</h1>
                <span class="nav-subtitle">Pixel Pet</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="console-wrapper">
                <div class="gameboy-frame">
                    <div class="screen-container">
                        <div class="screen" :class="{ 'night-mode': isSleeping }">
                            <div class="stats-overlay" v-if="petStage !== 'egg'">
                                <div class="stat-row">
                                    <el-icon>
                                        <Burger />
                                    </el-icon>
                                    <div class="progress-bar">
                                        <div class="fill hunger" :style="{ width: stats.hunger + '%' }"></div>
                                    </div>
                                </div>
                                <div class="stat-row">
                                    <el-icon>
                                        <ColdDrink />
                                    </el-icon>
                                    <div class="progress-bar">
                                        <div class="fill happiness" :style="{ width: stats.happiness + '%' }"></div>
                                    </div>
                                </div>
                                <div class="stat-row">
                                    <el-icon>
                                        <Lightning />
                                    </el-icon>
                                    <div class="progress-bar">
                                        <div class="fill energy" :style="{ width: stats.energy + '%' }"></div>
                                    </div>
                                </div>
                            </div>

                            
                            <div class="poops" v-if="poops.length > 0">
                                <div v-for="(p, i) in poops" :key="i" class="poop" :style="p.style">💩</div>
                            </div>

                            
                            <div class="pet-wrapper">
                                <div class="pet-sprite" :class="[petStage, currentAnim]" @click="petClicked">
                                    
                                    <div v-if="petStage === 'egg'" class="sprite-egg">
                                        <div class="egg-spots"></div>
                                    </div>

                                    
                                    <div v-else-if="petStage === 'baby'" class="sprite-baby">
                                        <div class="baby-body">
                                            <div class="eyes">
                                                <div class="eye left"></div>
                                                <div class="eye right"></div>
                                            </div>
                                            <div class="cheeks"></div>
                                            <div class="mouth"></div>
                                        </div>
                                    </div>

                                    
                                    <div v-else-if="petStage === 'adult'" class="sprite-adult">
                                        <div class="adult-body">
                                            <div class="ears">
                                                <div class="ear left"></div>
                                                <div class="ear right"></div>
                                            </div>
                                            <div class="eyes">
                                                <div class="eye left"></div>
                                                <div class="eye right"></div>
                                            </div>
                                            <div class="mouth-area">
                                                <div class="mouth"></div>
                                                <div class="tongue"></div>
                                            </div>
                                        </div>
                                    </div>

                                    
                                    <div class="emote-bubble" v-if="currentEmote">
                                        {{ currentEmote }}
                                    </div>
                                </div>
                            </div>

                            <div class="ground"></div>
                        </div>
                    </div>

                    <div class="controls-area">
                        <div class="brand">NINTENDO-PET</div>
                        <div class="btn-group">
                            <button class="action-btn red" @click="feed" :disabled="isBusy" title="喂食">
                                <el-icon>
                                    <Burger />
                                </el-icon>
                            </button>
                            <button class="action-btn blue" @click="play" :disabled="isBusy" title="玩耍">
                                <el-icon>
                                    <Baseball />
                                </el-icon>
                            </button>
                            <button class="action-btn green" @click="clean" :disabled="isBusy" title="清理">
                                <el-icon>
                                    <Delete />
                                </el-icon>
                            </button>
                            <button class="action-btn yellow" @click="toggleSleep" title="睡觉">
                                <el-icon v-if="!isSleeping">
                                    <Moon />
                                </el-icon>
                                <el-icon v-else>
                                    <Sunny />
                                </el-icon>
                            </button>
                        </div>

                        <div class="info-lcd">
                            <span>STAGE: {{ petStage.toUpperCase() }}</span>
                            <span>AGE: {{ age }} DAYS</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
import { Back, Burger, ColdDrink, Lightning, Moon, Sunny, Baseball, Delete } from '@element-plus/icons-vue';


const stats = reactive({
    hunger: 80,    
    happiness: 80, 
    energy: 100,    
    health: 100
});

const petStage = ref('egg'); 
const age = ref(0);
const poops = ref([]); 
const currentAnim = ref('idle'); 
const currentEmote = ref('');
const isSleeping = ref(false);
let loopTimer = null;
let eventTimer = null;

const isBusy = computed(() => isSleeping.value || petStage.value === 'egg' || currentAnim.value !== 'idle');


function petClicked() {
    if (petStage.value === 'egg') {
        evolveToBaby();
        return;
    }
    if (isSleeping.value) return;

    showEmote('❤️');
    animate('bounce');
    stats.happiness = Math.min(100, stats.happiness + 5);
}

function feed() {
    if (isBusy.value) return;
    animate('eat');
    showEmote('😋');
    setTimeout(() => {
        stats.hunger = Math.min(100, stats.hunger + 20);
        stats.energy = Math.min(100, stats.energy + 5);
        checkEvolution();
        animate('idle');
    }, 2000);
}

function play() {
    if (isBusy.value) return;
    if (stats.energy < 20) {
        showEmote('😫');
        return;
    }
    animate('jump');
    showEmote('🎵');
    setTimeout(() => {
        stats.happiness = Math.min(100, stats.happiness + 20);
        stats.hunger = Math.max(0, stats.hunger - 10);
        stats.energy = Math.max(0, stats.energy - 15);
        checkEvolution();
        animate('idle');
    }, 2000);
}

function clean() {
    if (poops.value.length === 0) return;
    showEmote('✨');
    poops.value = [];
    stats.happiness = Math.min(100, stats.happiness + 10);
}

function toggleSleep() {
    if (petStage.value === 'egg') return;

    isSleeping.value = !isSleeping.value;
    if (isSleeping.value) {
        animate('sleep');
        showEmote('💤');
    } else {
        animate('idle');
        showEmote('☀️');
    }
}

function evolveToBaby() {
    currentAnim.value = 'shake';
    setTimeout(() => {
        petStage.value = 'baby';
        animate('idle');
        showEmote('🐣');
        stats.hunger = 50;
        stats.happiness = 50;
    }, 2000);
}

function evolveToAdult() {
    showEmote('⭐');
    petStage.value = 'adult';
}

function checkEvolution() {
    if (petStage.value === 'baby' && age.value >= 2 && stats.happiness > 90 && stats.hunger > 90) {
        evolveToAdult();
    }
}


function showEmote(emoji) {
    currentEmote.value = emoji;
    setTimeout(() => { currentEmote.value = ''; }, 2000);
}

function animate(animName) {
    currentAnim.value = animName;
}

function gameLoop() {
    if (petStage.value === 'egg') return;

    
    if (!isSleeping.value) {
        stats.hunger = Math.max(0, stats.hunger - 0.5);
        stats.happiness = Math.max(0, stats.happiness - 0.5);
        stats.energy = Math.max(0, stats.energy - 0.2);
    } else {
        stats.energy = Math.min(100, stats.energy + 0.5);
        stats.hunger = Math.max(0, stats.hunger - 0.1);
    }

    
    if (!isSleeping.value && stats.hunger > 50 && Math.random() < 0.005) {
        if (poops.value.length < 3) {
            poops.value.push({
                style: {
                    left: Math.random() * 80 + 10 + '%',
                    bottom: '20px'
                }
            });
            showEmote('💩');
            stats.happiness -= 10;
        }
    }
}

function ageLoop() {
    if (petStage.value !== 'egg') {
        age.value++;
        checkEvolution();
    }
}

onMounted(() => {
    loopTimer = setInterval(gameLoop, 1000); 
    
    eventTimer = setInterval(ageLoop, 60000); 
});

onUnmounted(() => {
    clearInterval(loopTimer);
    clearInterval(eventTimer);
});

</script>

<style scoped>
.pet-tool {
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    min-height: 100vh;
    background: #f0f2f5;
    display: flex;
    flex-direction: column;
}

.nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    height: 60px;
    background: #fff;
    border-bottom: 1px solid #eef2f7;
}

.nav-back,
.nav-spacer {
    width: 100px;
}

.nav-back {
    border: none;
    background: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    color: #606266;
}

.nav-center h1 {
    font-size: 1.1rem;
    margin: 0;
}

.nav-subtitle {
    font-size: 0.7rem;
    color: #909399;
}

.main-content {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
}

.console-wrapper {
    perspective: 1000px;
}

.gameboy-frame {
    width: 350px;
    height: 550px;
    background: #e0e0e0;
    border-radius: 30px 30px 50px 50px;
    box-shadow:
        inset 5px 5px 15px rgba(255, 255, 255, 0.5),
        inset -5px -5px 15px rgba(0, 0, 0, 0.1),
        0 20px 50px rgba(0, 0, 0, 0.2);
    padding: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 8px solid #d0d0d0;
}

.screen-container {
    width: 100%;
    height: 300px;
    background: #9ea7b0;
    border-radius: 15px 15px 30px 15px;
    padding: 25px;
    box-shadow: inset 3px 3px 8px rgba(0, 0, 0, 0.2);
    margin-bottom: 20px;
}

.screen {
    width: 100%;
    height: 100%;
    background: #a8d5ba;
    
    border: 2px solid #8b9c90;
    position: relative;
    overflow: hidden;
    image-rendering: pixelated;
    box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.1);
}

.screen.night-mode {
    background: #4a5c66;
}

.stats-overlay {
    position: absolute;
    top: 5px;
    left: 5px;
    right: 5px;
    display: flex;
    justify-content: space-between;
    gap: 5px;
}

.stat-row {
    display: flex;
    align-items: center;
    gap: 2px;
    background: rgba(255, 255, 255, 0.5);
    padding: 2px 4px;
    border-radius: 4px;
    font-size: 10px;
}

.progress-bar {
    width: 30px;
    height: 4px;
    background: #ccc;
    border-radius: 2px;
    overflow: hidden;
}

.fill {
    height: 100%;
    transition: width 0.5s;
}

.fill.hunger {
    background: #ff9800;
}

.fill.happiness {
    background: #2196f3;
}

.fill.energy {
    background: #4caf50;
}

.ground {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 20px;
    background: rgba(0, 0, 0, 0.1);
}


.pet-wrapper {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.pet-sprite {
    position: relative;
    width: 80px;
    height: 80px;
    transition: transform 0.2s;
}

.sprite-egg {
    width: 60px;
    height: 70px;
    background: #fff;
    border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
    border: 3px solid #333;
    position: relative;
    left: 10px;
}

.egg-spots {
    position: absolute;
    width: 10px;
    height: 10px;
    background: #ffcc80;
    border-radius: 50%;
    top: 20px;
    left: 15px;
    box-shadow: 20px 10px 0 #ffcc80, 5px 30px 0 #ffcc80;
}


.sprite-baby .baby-body {
    width: 60px;
    height: 50px;
    background: #ffcdd2;
    border-radius: 30px;
    border: 3px solid #333;
    position: relative;
    top: 15px;
    left: 10px;
}

.eyes {
    position: absolute;
    top: 15px;
    width: 100%;
    display: flex;
    justify-content: space-around;
    padding: 0 10px;
}

.eye {
    width: 6px;
    height: 6px;
    background: #333;
    border-radius: 50%;
}

.mouth {
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    width: 8px;
    height: 4px;
    background: #333;
    border-radius: 0 0 4px 4px;
}


.sprite-adult .adult-body {
    width: 70px;
    height: 70px;
    background: #a5d6a7;
    border-radius: 20px;
    border: 3px solid #333;
    position: relative;
    left: 5px;
}

.sprite-adult .ears .ear {
    width: 15px;
    height: 25px;
    background: #a5d6a7;
    border: 3px solid #333;
    position: absolute;
    top: -15px;
}

.sprite-adult .ear.left {
    left: 5px;
    border-bottom: none;
}

.sprite-adult .ear.right {
    right: 5px;
    border-bottom: none;
}

.sprite-adult .mouth-area {
    position: absolute;
    bottom: 15px;
    width: 100%;
    display: flex;
    justify-content: center;
}

.sprite-adult .mouth {
    width: 20px;
    height: 10px;
    background: #333;
    border-radius: 0 0 10px 10px;
}


.bounce {
    animation: bounce 0.5s infinite alternate;
}

.jump {
    animation: jump 0.5s ease-in-out;
}

.shake {
    animation: shake 0.5s infinite;
}

.sleep {
    opacity: 0.8;
    transform: scaleY(0.9);
}

.eat {
    animation: eat 0.5s infinite;
}

@keyframes bounce {
    from {
        transform: translateY(0);
    }

    to {
        transform: translateY(-5px);
    }
}

@keyframes jump {
    0% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-30px);
    }

    100% {
        transform: translateY(0);
    }
}

@keyframes shake {
    0% {
        transform: rotate(-5deg);
    }

    50% {
        transform: rotate(5deg);
    }

    100% {
        transform: rotate(-5deg);
    }
}

@keyframes eat {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.1);
    }

    100% {
        transform: scale(1);
    }
}

.emote-bubble {
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 24px;
    animation: floatUp 1s forwards;
}

@keyframes floatUp {
    from {
        top: -30px;
        opacity: 1;
    }

    to {
        top: -60px;
        opacity: 0;
    }
}

.poops {
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.poop {
    position: absolute;
    font-size: 20px;
}


.controls-area {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
}

.brand {
    font-weight: bold;
    color: #aaa;
    font-size: 12px;
    letter-spacing: 2px;
    margin-top: -10px;
    margin-bottom: 10px;
}

.btn-group {
    display: flex;
    gap: 15px;
    justify-content: center;
}

.action-btn {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: none;
    box-shadow: 0 4px 0 rgba(0, 0, 0, 0.2);
    cursor: pointer;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: transform 0.1s;
}

.action-btn:active {
    transform: translateY(4px);
    box-shadow: none;
}

.action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.action-btn.red {
    background: #ff7043;
}

.action-btn.blue {
    background: #42a5f5;
}

.action-btn.green {
    background: #66bb6a;
}

.action-btn.yellow {
    background: #ffca28;
}

.info-lcd {
    background: #9ea7b0;
    width: 100%;
    padding: 8px 15px;
    border-radius: 8px;
    font-family: monospace;
    font-size: 12px;
    display: flex;
    justify-content: space-between;
    box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.1);
    color: #333;
}
</style>
