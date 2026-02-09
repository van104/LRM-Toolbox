<template>
    <div class="maze-tool">
        
        <nav class="nav-bar">
            <button class="nav-back" @click="$router.back()">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>3D 迷宫探索</h1>
                <span class="nav-subtitle">Maze Explorer 3D</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="game-wrapper">
                <div ref="container" class="canvas-container"></div>

                
                <div v-if="!isPlaying" class="ui-overlay">
                    <div class="start-screen glass-panel">
                        <h2>3D 迷宫挑战</h2>
                        <div class="settings">
                            <label>难度: {{ difficulty }}</label>
                            <input
v-model.number="difficulty" type="range" min="10" max="30" step="2"
                                @input="updateDifficultyLabel" />
                        </div>
                        <button class="primary-btn pulse" @click="startGame">开始探索</button>
                        <p class="tip">WASD 或 方向键移动 • 寻找绿色光柱</p>
                    </div>
                </div>

                <div v-if="isPlaying" class="hud-overlay">
                    <div class="timer">{{ formattedTime }}</div>
                    <div class="level-info">Level {{ level }}</div>
                    <button class="reset-btn" @click="resetGame">重置</button>
                </div>

                <div v-if="victory" class="victory-overlay">
                    <div class="glass-panel">
                        <h2>挑战成功!</h2>
                        <p>用时: {{ formattedTime }}</p>
                        <button class="primary-btn" @click="nextLevel">下一关</button>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { Back } from '@element-plus/icons-vue';
import * as THREE from 'three';


const container = ref(null);
const isPlaying = ref(false);
const victory = ref(false);
const difficulty = ref(10); 
const level = ref(1);
const startTime = ref(0);
const currentTime = ref(0);
const timerInterval = ref(null);


let scene, camera, renderer;
let player, walls = [], goal;
let animationId;
const cellSize = 2;
let mazeData = [];
let playerPos = { x: 0, z: 0 };
let moveSpeed = 0.15;
let velocity = new THREE.Vector3();
let keys = { w: false, a: false, s: false, d: false };


const formattedTime = computed(() => {
    const elapsed = Math.floor((currentTime.value - startTime.value) / 1000);
    const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const s = (elapsed % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
});

function updateDifficultyLabel(e) {
    
    
    
}


function generateMaze(width, height) {
    
    if (width % 2 === 0) width++;
    if (height % 2 === 0) height++;

    const maze = Array(height).fill().map(() => Array(width).fill(1)); 

    const stack = [];
    const startX = 1;
    const startY = 1;
    maze[startY][startX] = 0;
    stack.push({ x: startX, y: startY });

    const dirs = [
        { x: 0, y: -2 }, { x: 0, y: 2 }, { x: -2, y: 0 }, { x: 2, y: 0 }
    ];

    while (stack.length > 0) {
        const current = stack[stack.length - 1];
        const neighbors = [];

        for (const d of dirs) {
            const nx = current.x + d.x;
            const ny = current.y + d.y;
            if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && maze[ny][nx] === 1) {
                neighbors.push({ x: nx, y: ny, dx: d.x / 2, dy: d.y / 2 });
            }
        }

        if (neighbors.length > 0) {
            const chosen = neighbors[Math.floor(Math.random() * neighbors.length)];
            maze[current.y + chosen.dy][current.x + chosen.dx] = 0; 
            maze[chosen.y][chosen.x] = 0; 
            stack.push({ x: chosen.x, y: chosen.y });
        } else {
            stack.pop();
        }
    }

    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            if (maze[y][x] === 1) {
                let openNeighbors = 0;
                if (maze[y - 1] && maze[y - 1][x] === 0) openNeighbors++;
                if (maze[y + 1] && maze[y + 1][x] === 0) openNeighbors++;
                if (maze[y][x - 1] === 0) openNeighbors++;
                if (maze[y][x + 1] === 0) openNeighbors++;

                if (openNeighbors >= 2 && Math.random() < 0.05) {
                    maze[y][x] = 0;
                }
            }
        }
    }

    return maze;
}


function initThree() {
    if (!container.value) return;

    const width = container.value.clientWidth || window.innerWidth;
    const height = container.value.clientHeight || window.innerHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f2f5); 
    scene.fog = new THREE.Fog(0xf0f2f5, 10, 60);

    camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0, 20, 20);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    
    while (container.value.firstChild) {
        container.value.removeChild(container.value.firstChild);
    }
    container.value.appendChild(renderer.domElement);

    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(50, 50, 50);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 100;
    dirLight.shadow.camera.left = -50;
    dirLight.shadow.camera.bottom = -50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.top = 50;
    scene.add(dirLight);

    
    const floorGeo = new THREE.PlaneGeometry(200, 200);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    
    const playerGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const playerMat = new THREE.MeshStandardMaterial({ color: 0x409eff });
    player = new THREE.Mesh(playerGeo, playerMat);
    player.castShadow = true;
    player.position.set(0, 0.4, 0);
    scene.add(player);

    window.addEventListener('resize', onWindowResize);

    
    animate();
}

function buildMaze(size) {
    
    walls.forEach(w => scene.remove(w));
    walls = [];
    if (goal) scene.remove(goal);

    mazeData = generateMaze(size, size);

    const h = mazeData.length;
    const w = mazeData[0].length;

    
    const wallGeo = new THREE.BoxGeometry(cellSize, 2, cellSize);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50 });

    const offset = (size * cellSize) / 2;

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (mazeData[y][x] === 1) {
                const wall = new THREE.Mesh(wallGeo, wallMat);
                wall.position.set(x * cellSize - offset, 1, y * cellSize - offset);
                wall.castShadow = true;
                wall.receiveShadow = true;
                scene.add(wall);
                walls.push(wall);
            }
        }
    }

    
    player.position.set(1 * cellSize - offset, 0.5, 1 * cellSize - offset);

    
    
    let maxDist = 0;
    let goalPos = { x: 1, y: 1 };

    
    const queue = [{ x: 1, y: 1, dist: 0 }];
    const visited = new Set(['1,1']);

    while (queue.length > 0) {
        const curr = queue.shift();
        if (curr.dist > maxDist) {
            maxDist = curr.dist;
            goalPos = { x: curr.x, y: curr.y };
        }

        const moves = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];
        for (let m of moves) {
            const nx = curr.x + m.x;
            const ny = curr.y + m.y;
            if (nx >= 0 && nx < w && ny >= 0 && ny < h && mazeData[ny][nx] === 0 && !visited.has(`${nx},${ny}`)) {
                visited.add(`${nx},${ny}`);
                queue.push({ x: nx, y: ny, dist: curr.dist + 1 });
            }
        }
    }

    const goalGeo = new THREE.CylinderGeometry(0.5, 0.5, 5, 16);
    const goalMat = new THREE.MeshStandardMaterial({
        color: 0x67c23a,
        transparent: true,
        opacity: 0.8,
        emissive: 0x67c23a,
        emissiveIntensity: 0.5
    });
    goal = new THREE.Mesh(goalGeo, goalMat);
    goal.position.set(goalPos.x * cellSize - offset, 2.5, goalPos.y * cellSize - offset);
    scene.add(goal);
}

function startGame() {
    if (!scene) initThree();

    isPlaying.value = true;
    victory.value = false;

    keys = { w: false, a: false, s: false, d: false }; 

    buildMaze(difficulty.value + (level.value * 2));

    startTime.value = Date.now();
    if (timerInterval.value) clearInterval(timerInterval.value);
    timerInterval.value = setInterval(() => {
        currentTime.value = Date.now();
    }, 100);
}

function nextLevel() {
    level.value++;
    victory.value = false;
    startGame();
}

function resetGame() {
    isPlaying.value = false;
    victory.value = false;
    cancelAnimationFrame(animationId);
    if (timerInterval.value) clearInterval(timerInterval.value);
}


function animate() {
    animationId = requestAnimationFrame(animate);

    if (!scene || !camera || !renderer) return;

    if (isPlaying.value) {
        
        velocity.set(0, 0, 0);
        if (keys.w) velocity.z -= moveSpeed;
        if (keys.s) velocity.z += moveSpeed;
        if (keys.a) velocity.x -= moveSpeed;
        if (keys.d) velocity.x += moveSpeed;

        if (velocity.lengthSq() > 0) {
            const nextX = player.position.clone().add(new THREE.Vector3(velocity.x, 0, 0));
            if (!checkCollision(nextX)) {
                player.position.add(new THREE.Vector3(velocity.x, 0, 0));
            }

            const nextZ = player.position.clone().add(new THREE.Vector3(0, 0, velocity.z));
            if (!checkCollision(nextZ)) {
                player.position.add(new THREE.Vector3(0, 0, velocity.z));
            }
        }

        
        
        camera.position.x = player.position.x;
        camera.position.z = player.position.z + 6;
        camera.position.y = 22;
        camera.lookAt(player.position);

        
        if (goal) {
            const dx = player.position.x - goal.position.x;
            const dz = player.position.z - goal.position.z;
            if (Math.sqrt(dx * dx + dz * dz) < 1.5) {
                handleWin();
            }
        }
    } else {
        
        if (camera) {
            
            const time = Date.now() * 0.0005;
            camera.position.x = Math.sin(time) * 30;
            camera.position.z = Math.cos(time) * 30;
            camera.position.y = 20;
            camera.lookAt(0, 0, 0);
        }
    }

    
    if (goal) {
        goal.rotation.y += 0.02;
        goal.material.opacity = 0.6 + Math.sin(Date.now() * 0.005) * 0.2;
    }

    renderer.render(scene, camera);
}

function checkCollision(pos) {
    
    const playerBox = new THREE.Box3().setFromCenterAndSize(pos, new THREE.Vector3(0.6, 0.8, 0.6));

    for (let wall of walls) {
        const wallBox = new THREE.Box3().setFromObject(wall);
        if (playerBox.intersectsBox(wallBox)) return true;
    }
    return false;
}

function handleWin() {
    isPlaying.value = false;
    victory.value = true;
    
    
    clearInterval(timerInterval.value);
}

function onWindowResize() {
    if (camera && renderer && container.value) {
        camera.aspect = container.value.clientWidth / container.value.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.value.clientWidth, container.value.clientHeight);
    }
}


function handleKeydown(e) {
    switch (e.code) {
        case 'KeyW': keys.w = true; break;
        case 'KeyA': keys.a = true; break;
        case 'KeyS': keys.s = true; break;
        case 'KeyD': keys.d = true; break;
        case 'ArrowUp': keys.w = true; break;
        case 'ArrowLeft': keys.a = true; break;
        case 'ArrowDown': keys.s = true; break;
        case 'ArrowRight': keys.d = true; break;
    }
}
function handleKeyup(e) {
    switch (e.code) {
        case 'KeyW': keys.w = false; break;
        case 'KeyA': keys.a = false; break;
        case 'KeyS': keys.s = false; break;
        case 'KeyD': keys.d = false; break;
        case 'ArrowUp': keys.w = false; break;
        case 'ArrowLeft': keys.a = false; break;
        case 'ArrowDown': keys.s = false; break;
        case 'ArrowRight': keys.d = false; break;
    }
}

onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('keyup', handleKeyup);
    
    
    
    setTimeout(initThree, 100);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
    window.removeEventListener('keyup', handleKeyup);
    window.removeEventListener('resize', onWindowResize);
    cancelAnimationFrame(animationId);
    if (renderer) {
        renderer.dispose();
        
    }
    if (timerInterval.value) clearInterval(timerInterval.value);
});
</script>

<style scoped>
.maze-tool {
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    min-height: 100vh;
    background: #f5f7fa;
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

.nav-center {
    text-align: center;
}

.nav-center h1 {
    font-size: 1.1rem;
    margin: 0;
    color: #303133;
}

.nav-subtitle {
    font-size: 0.7rem;
    color: #909399;
}

.main-content {
    flex: 1;
    position: relative;
    overflow: hidden;
}

.game-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
}

.canvas-container {
    width: 100%;
    height: 100%;
    outline: none;
}

.ui-overlay,
.victory-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.3);
    z-index: 10;
}

.glass-panel {
    background: rgba(255, 255, 255, 0.95);
    padding: 2rem 3rem;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    text-align: center;
    min-width: 300px;
}

.settings {
    margin: 20px 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.primary-btn {
    background: linear-gradient(135deg, #409eff, #36cfc9);
    border: none;
    color: white;
    padding: 12px 30px;
    border-radius: 25px;
    font-size: 1.1rem;
    cursor: pointer;
    transition: transform 0.2s;
    box-shadow: 0 4px 15px rgba(64, 158, 255, 0.3);
}

.primary-btn:hover {
    transform: translateY(-2px);
}

.hud-overlay {
    position: absolute;
    top: 20px;
    left: 20px;
    right: 20px;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
}

.timer,
.level-info {
    font-size: 1.5rem;
    font-weight: bold;
    color: #303133;
    background: rgba(255, 255, 255, 0.8);
    padding: 5px 15px;
    border-radius: 20px;
}

.reset-btn {
    pointer-events: auto;
    background: #f56c6c;
    border: none;
    color: white;
    padding: 5px 15px;
    border-radius: 4px;
    cursor: pointer;
}

.tip {
    margin-top: 15px;
    font-size: 0.8rem;
    color: #909399;
}

.pulse {
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.4);
    }

    70% {
        box-shadow: 0 0 0 10px rgba(64, 158, 255, 0);
    }

    100% {
        box-shadow: 0 0 0 0 rgba(64, 158, 255, 0);
    }
}
</style>
