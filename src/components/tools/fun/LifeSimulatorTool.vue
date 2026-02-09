<template>
    <div class="life-tool">
        <nav class="nav-bar">
            <button class="nav-back" @click="$router.back()">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>模拟人生 Plus</h1>
                <span class="nav-subtitle">Text Life Simulator</span>
            </div>
            <div class="nav-actions">
                <el-button
v-if="gameState.isAlive && gameStage === 'game'" size="small"
                    @click="saveGame">保存存档</el-button>
                <el-button
v-if="gameState.isAlive || gameStage !== 'intro'" size="small" type="danger"
                    @click="restart">重开</el-button>
            </div>
        </nav>

        <main class="main-content">

            <div v-if="gameStage === 'intro'" class="start-screen fade-in">
                <div class="card glass-panel">
                    <h2>开启新的人生</h2>
                    <div class="intro-text">
                        <p>你将经历一段未知的旅程。</p>
                        <p>你的天赋由上天决定，但命运掌握在自己手中。</p>
                    </div>

                    <div v-if="hasSave" class="load-section">
                        <el-button type="success" size="large" @click="loadGame">读取存档</el-button>
                        <el-divider>或者</el-divider>
                    </div>

                    <div class="actions">
                        <el-button type="primary" size="large" @click="startTalentSelection">新的人生 (抽卡)</el-button>
                    </div>
                </div>
            </div>


            <div v-else-if="gameStage === 'talent'" class="start-screen fade-in">
                <div class="card glass-panel wide-panel">
                    <h2>请选择你的天赋命格 (3选1)</h2>
                    <div class="talent-cards">
                        <div
v-for="talent in talentOptions" :key="talent.id" class="talent-card"
                            :class="['rarity-' + talent.rarity, { selected: selectedTalent?.id === talent.id }]"
                            @click="selectTalent(talent)">
                            <div class="talent-header">
                                <h3>{{ talent.name }}</h3>
                                <span class="rarity-badge">{{ talent.rarity }}</span>
                            </div>
                            <p class="talent-desc">{{ talent.desc }}</p>
                        </div>
                    </div>
                    <div class="actions">
                        <el-button @click="gameStage = 'intro'">返回</el-button>
                        <el-button
type="primary" :disabled="!selectedTalent"
                            @click="confirmTalentAndNext">下一步</el-button>
                    </div>
                </div>
            </div>


            <div v-else-if="gameStage === 'points'" class="start-screen fade-in">
                <div class="card glass-panel">
                    <h2>调整初始属性</h2>
                    <p class="subtitle">剩余可用点数: <span class="points-val">{{ availablePoints }}</span></p>

                    <div class="stats-allocation">
                        <div class="alloc-row">
                            <span class="label"><el-icon>
                                    <FirstAidKit />
                                </el-icon> 健康</span>
                            <el-slider
v-model="tempStats.health" :min="0" :max="100" show-input
                                class="alloc-slider" @input="val => handlePointChange('health', val)" />
                        </div>
                        <div class="alloc-row">
                            <span class="label"><el-icon>
                                    <Reading />
                                </el-icon> 智力</span>
                            <el-slider
v-model="tempStats.smarts" :min="0" :max="100" show-input
                                class="alloc-slider" @input="val => handlePointChange('smarts', val)" />
                        </div>
                        <div class="alloc-row">
                            <span class="label"><el-icon>
                                    <Camera />
                                </el-icon> 颜值</span>
                            <el-slider
v-model="tempStats.looks" :min="0" :max="100" show-input
                                class="alloc-slider" @input="val => handlePointChange('looks', val)" />
                        </div>
                        <div class="alloc-row">
                            <span class="label"><el-icon>
                                    <Sunny />
                                </el-icon> 家境</span>
                            <el-slider
v-model="tempStats.happiness" :min="0" :max="100" show-input
                                class="alloc-slider" @input="val => handlePointChange('happiness', val)" />
                        </div>
                    </div>

                    <div v-if="selectedTalent" class="talent-summary">
                        当前天赋: <strong>{{ selectedTalent.name }}</strong> ({{ selectedTalent.desc }})
                    </div>

                    <div class="actions">
                        <el-button @click="gameStage = 'talent'">上一步</el-button>
                        <el-button type="primary" :disabled="availablePoints < 0" @click="startGame">开始人生</el-button>
                    </div>
                </div>
            </div>


            <div v-else-if="gameStage === 'game'" class="game-world fade-in">

                <div class="hud-panel glass-panel">
                    <div class="hud-item user-info">
                        <div class="avatar">{{ gameState.age }}岁</div>
                        <div class="info-text">
                            <div class="name">玩家</div>
                            <div class="job">{{ gameState.job ? gameState.job.name : '无业' }}</div>
                        </div>
                    </div>
                    <div class="hud-item assets">
                        <div class="asset-row" title="现金"><el-icon>
                                <Wallet />
                            </el-icon> ￥{{ gameState.wealth.toLocaleString() }}</div>
                        <div class="asset-row" title="存款"><el-icon>
                                <BankIcon />
                            </el-icon> ￥{{ gameState.savings.toLocaleString() }}</div>
                        <div class="asset-row" title="房产">{{ gameState.houses.length }} 套</div>
                        <div class="asset-row" title="车辆">{{ gameState.cars.length }} 辆</div>
                    </div>
                    <div class="hud-item date-info">
                        <el-button
type="primary" class="next-year-btn" :disabled="pendingChoice !== null"
                            @click="ageUp">
                            下一年
                        </el-button>
                    </div>
                </div>


                <div class="viewport">

                    <div v-if="currentScene === 'city'" class="city-scene" :style="{ backgroundImage: cityMapUrl }">

                        <div class="city-overlay">
                            <div class="city-btn bank-btn" @click="openBuilding('bank')">
                                <el-icon>
                                    <Money />
                                </el-icon> 银行
                            </div>
                            <div class="city-btn real-estate-btn" @click="openBuilding('housing')">
                                <el-icon>
                                    <House />
                                </el-icon> 房产中心
                            </div>
                            <div class="city-btn dealership-btn" @click="openBuilding('vehicles')">
                                <el-icon>
                                    <Van />
                                </el-icon> 4S店
                            </div>
                            <div class="city-btn school-btn" @click="openBuilding('school')">
                                <el-icon>
                                    <School />
                                </el-icon> 学校
                            </div>
                            <div class="city-btn hospital-btn" @click="openBuilding('hospital')">
                                <el-icon>
                                    <FirstAidKit />
                                </el-icon> 医院
                            </div>
                            <div class="city-btn company-btn" @click="openBuilding('company')">
                                <el-icon>
                                    <OfficeBuilding />
                                </el-icon> 商务中心
                            </div>
                            <div class="city-btn back-btn" @click="currentScene = 'dashboard'">
                                <el-icon>
                                    <Back />
                                </el-icon> 返回面板
                            </div>
                        </div>
                    </div>


                    <div v-else class="dashboard-scene">
                        <div class="left-col">
                            <div class="stats-box glass-panel">
                                <div class="stat-row">
                                    <span class="stat-label"><el-icon>
                                            <FirstAidKit />
                                        </el-icon> 健康</span>
                                    <el-progress :percentage="gameState.health" status="success" />
                                </div>
                                <div class="stat-row">
                                    <span class="stat-label"><el-icon>
                                            <Sunny />
                                        </el-icon> 快乐</span>
                                    <el-progress :percentage="gameState.happiness" color="#e6a23c" />
                                </div>
                                <div class="stat-row">
                                    <span class="stat-label"><el-icon>
                                            <Reading />
                                        </el-icon> 智力</span>
                                    <el-progress :percentage="gameState.smarts" />
                                </div>
                                <div class="stat-row">
                                    <span class="stat-label"><el-icon>
                                            <Camera />
                                        </el-icon> 颜值</span>
                                    <el-progress :percentage="gameState.looks" color="#f56c6c" />
                                </div>
                            </div>

                            <div class="assets-preview glass-panel">
                                <h3>我的资产</h3>
                                <div
v-if="gameState.houses.length === 0 && gameState.cars.length === 0"
                                    class="empty-assets">
                                    暂无资产，继续奋斗吧！
                                </div>
                                <div class="asset-list-mini">
                                    <div v-for="house in gameState.houses" :key="house.id" class="mini-asset">
                                        <el-icon>
                                            <House />
                                        </el-icon> {{ house.name }}
                                    </div>
                                    <div v-for="car in gameState.cars" :key="car.id" class="mini-asset">
                                        <el-icon>
                                            <Van />
                                        </el-icon> {{ car.name }}
                                    </div>
                                </div>
                            </div>

                            <div class="actions-grid">
                                <el-button type="success" size="large" @click="currentScene = 'city'">
                                    <el-icon>
                                        <Position />
                                    </el-icon> 外出 (城市地图)
                                </el-button>
                                <el-button v-if="gameState.job" @click="workHard">努力工作</el-button>
                                <el-button
v-if="!gameState.job && gameState.age >= 18"
                                    @click="openBuilding('company')">找工作</el-button>
                            </div>
                        </div>

                        <div class="right-col glass-panel log-container">
                            <div class="log-header">
                                <h3>人生日志</h3>
                                <el-tag v-if="gameState.degree !== 'none'">学历: {{ getDegreeName(gameState.degree)
                                }}</el-tag>
                            </div>
                            <div ref="scrollContainerRef" class="log-scroll">
                                <div v-for="(log, i) in currentLogs" :key="i" class="log-item fade-in-up">
                                    <div class="log-age">{{ log.age }}岁</div>
                                    <div class="log-content">
                                        <div class="log-text">{{ log.text }}</div>
                                        <div
v-if="log.choices && log === gameState.log[gameState.log.length - 1] && pendingChoice"
                                            class="log-choices">
                                            <button
v-for="(choice, _cIdx) in log.choices" :key="_cIdx" class="choice-btn"
                                                @click="makeChoice(choice)">
                                                {{ choice.text }}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <el-dialog v-model="buildingDialogVisible" :title="currentBuildingTitle" width="80%" class="building-modal">
                <div v-if="currentBuilding === 'bank'">
                    <div class="bank-ui">
                        <div class="balance-card">
                            <div>现金: ￥{{ gameState.wealth.toLocaleString() }}</div>
                            <div>存款: ￥{{ gameState.savings.toLocaleString() }}</div>
                        </div>
                        <div class="bank-actions">
                            <h4>存取款</h4>
                            <el-input-number v-model="bankAmount" :step="1000" />
                            <div class="btn-group">
                                <el-button type="primary" @click="bankDeposit">存入
                                    (年利{{ (lifeData.bank.depositRates.fixed1 * 100).toFixed(1) }}%)</el-button>
                                <el-button type="warning" @click="bankWithdraw">取出</el-button>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="currentBuilding === 'housing'">
                    <div class="shop-grid">
                        <div v-for="house in lifeData.housing" :key="house.id" class="shop-item card">
                            <img :src="house.image" class="shop-img" />
                            <h4>{{ house.name }}</h4>
                            <p class="desc">{{ house.desc }}</p>
                            <div class="price">
                                <span v-if="house.rent > 0">租金: ￥{{ house.rent }}/月</span>
                                <span v-else>售价: ￥{{ (house.price / 10000).toFixed(0) }}万</span>
                            </div>
                            <el-button
v-if="house.type === 'buy'" type="primary"
                                :disabled="gameState.wealth < house.price || hasHouse(house.id)"
                                @click="buyHouse(house)">
                                {{ hasHouse(house.id) ? '已拥有' : '购买' }}
                            </el-button>
                            <el-button v-else type="success" @click="rentHouse(house)">租住</el-button>
                        </div>
                    </div>
                </div>

                <div v-if="currentBuilding === 'vehicles'">
                    <div class="shop-grid">
                        <div v-for="car in lifeData.vehicles" :key="car.id" class="shop-item card">
                            <img :src="car.image" class="shop-img" />
                            <h4>{{ car.name }}</h4>
                            <p class="desc">{{ car.desc }}</p>
                            <div class="price">￥{{ (car.price / 10000).toFixed(1) }}万</div>
                            <el-button
type="primary" :disabled="gameState.wealth < car.price || hasCar(car.id)"
                                @click="buyCar(car)">
                                {{ hasCar(car.id) ? '已拥有' : '购买' }}
                            </el-button>
                        </div>
                    </div>
                </div>

                <div v-if="currentBuilding === 'school'">
                    <div class="school-list">
                        <div
v-for="edu in lifeData.education.levels" :key="edu.id" class="edu-item card"
                            :class="{ 'active': canStudy(edu), 'completed': hasDegree(edu.id) }">
                            <h4>{{ edu.name }}</h4>
                            <p v-if="edu.cost">学费: ￥{{ edu.cost }}/年</p>
                            <p v-else>义务教育 (免费)</p>
                            <div class="reqs-list">
                                <span v-if="edu.req" :class="{ 'text-danger': gameState.smarts < edu.req.smarts }">智力 >
                                    {{ edu.req.smarts }}</span>
                            </div>
                            <el-button
v-if="!hasDegree(edu.id)" :type="checkEduReq(edu) ? 'primary' : 'info'"
                                :disabled="!checkEduReq(edu) || (edu.cost > gameState.wealth && edu.cost > 0) || gameState.hasStudied"
                                @click="enroll(edu)">
                                {{ gameState.hasStudied ? '明年再来' : (checkEduReq(edu) ? '入学' : '未满足条件') }}
                            </el-button>
                            <el-tag v-else type="success">已毕业</el-tag>
                        </div>
                    </div>
                </div>

                <div v-if="currentBuilding === 'hospital'">
                    <div class="action-list">
                        <div class="action-item">
                            <span>普通门诊 (￥200)</span>
                            <el-button @click="visitDoctor('normal')">挂号</el-button>
                        </div>
                        <div class="action-item">
                            <span>专家会诊 (￥2000)</span>
                            <el-button @click="visitDoctor('expert')">挂号</el-button>
                        </div>
                        <div class="action-item">
                            <span>医疗美容 (￥20000)</span>
                            <el-button @click="plasticSurgery">整容</el-button>
                        </div>
                    </div>
                </div>

                <div v-if="currentBuilding === 'company'">
                    <div v-if="gameState.job">
                        <h3>当前职位: {{ gameState.job.name }}</h3>
                        <p>月薪: ￥{{ gameState.job.salary }}</p>
                        <el-button type="danger" @click="quitJob">辞职</el-button>
                    </div>
                    <div v-else>
                        <h3>人才市场</h3>
                        <div class="job-list">
                            <div
v-for="job in availableJobs" :key="job.id" class="job-item"
                                :class="{ disabled: !checkJobReq(job) }">
                                <div>
                                    <strong>{{ job.name }}</strong>
                                    <div class="salary">￥{{ job.salary }}/月</div>
                                </div>
                                <div class="reqs">
                                    <span
v-if="job.req.smarts"
                                        :class="{ 'text-danger': gameState.smarts < job.req.smarts }">智力{{
                                            job.req.smarts }}+
                                    </span>
                                    <span
v-if="job.req.looks"
                                        :class="{ 'text-danger': gameState.looks < job.req.looks }">颜值{{ job.req.looks
                                        }}+
                                    </span>
                                    <span
v-if="job.req.health"
                                        :class="{ 'text-danger': gameState.health < job.req.health }">健康{{
                                            job.req.health }}+
                                    </span>
                                </div>
                                <el-button
size="small" :type="checkJobReq(job) ? 'primary' : 'info'"
                                    :disabled="!checkJobReq(job)" @click="applyJob(job)">
                                    {{ checkJobReq(job) ? '应聘' : '能力不足' }}
                                </el-button>
                            </div>
                        </div>
                    </div>
                </div>
            </el-dialog>
        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - 模拟人生 Plus
        </footer>
    </div>
</template>

<script setup>
import { ref, reactive, nextTick, computed, onMounted } from 'vue';
// ... (rest of script is unchanged, just showing context for replacement if needed, 
// but actually I can just target the closing </main> tag to insert footer and then update styles)
// However, the tool replaces based on line numbers or context.
// I will target the end of main and insert footer.
// And update styles for nav-center and footer.

import {
    Back, Wallet, FirstAidKit, Sunny, Reading, Camera,
    House, Van, School, OfficeBuilding, Money, Position
} from '@element-plus/icons-vue';

const BankIcon = Money;

import { lifeData, initialStats } from '@/data/lifeSimulatorData';



const cityMapUrl = 'url("https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2144&auto=format&fit=crop")';


import { ElMessage } from 'element-plus';

const gameState = reactive({ ...initialStats });
const tempStats = ref(null);
const pendingChoice = ref(null);
const scrollContainerRef = ref(null); // Added this
const hasSave = ref(false);


const gameStage = ref('intro');
const currentScene = ref('dashboard');
const buildingDialogVisible = ref(false);
const currentBuilding = ref('');
const bankAmount = ref(1000);


const talentOptions = ref([]);
const selectedTalent = ref(null);
const availablePoints = ref(10);
const baseStats = ref({});

const currentBuildingTitle = computed(() => {
    const map = {
        'bank': '中央银行',
        'housing': '置业中心',
        'vehicles': '豪车汇',
        'school': '教育学院',
        'hospital': '仁爱医院',
        'company': 'CBD商务中心'
    };
    return map[currentBuilding.value] || '建筑';
});

const currentLogs = computed(() => {
    if (!gameState.log) return [];
    return gameState.log.slice().reverse();
});

const availableJobs = computed(() => {
    return lifeData.careers.filter(() => {

        return true;
    });
});

onMounted(() => {
    if (localStorage.getItem('lifeSimSave')) {
        hasSave.value = true;
    }
});



function startTalentSelection() {


    tempStats.value = {
        age: 0,
        health: rand(0, 20),
        happiness: rand(40, 60),
        smarts: rand(0, 20),
        looks: rand(0, 20),
        wealth: 0,
        fame: 0,
        lifespan: rand(70, 100),
        houses: [],
        cars: [],
        savings: 0,
        inventory: []
    };
    baseStats.value = { ...tempStats.value };
    availablePoints.value = 10;


    const pool = lifeData.talents || [];

    talentOptions.value = pool.sort(() => 0.5 - Math.random()).slice(0, 3);
    selectedTalent.value = null;

    gameStage.value = 'talent';
}

function selectTalent(talent) {
    selectedTalent.value = talent;
}

function handlePointChange(stat, val) {
    // 1. Calculate base values (random base + talent effect)
    const getBase = (key) => baseStats.value[key] + (selectedTalent.value?.effect?.[key] || 0);

    // 2. Calculate points used by OTHER stats
    const stats = ['health', 'smarts', 'looks', 'happiness'];
    const usedByOthers = stats.reduce((sum, key) => {
        if (key !== stat) {
            return sum + (tempStats.value[key] - getBase(key));
        }
        return sum;
    }, 0);

    // 3. Calculate max allowed value for THIS stat
    // Max = Base + (TotalPoints - UsedByOthers)
    const base = getBase(stat);
    const maxAllowed = base + (10 - usedByOthers);

    // 4. Clamp the new value
    // We allow reducing below base (min 0) to gain points, but cap max to available points
    let verifiedVal = val;
    if (verifiedVal > maxAllowed) {
        verifiedVal = Math.max(0, maxAllowed); // Ensure we don't go below 0 purely by calculation
    }

    // 5. Update state
    // If we clamped it, force update via nextTick
    if (verifiedVal !== val) {
        nextTick(() => {
            tempStats.value[stat] = verifiedVal;
        });
    }

    // 6. Recalculate Available Points
    const currentUsed = (verifiedVal - base) + usedByOthers;
    availablePoints.value = 10 - currentUsed;
}

function confirmTalentAndNext() {
    // Apply talent effect to tempStats for the base calculation
    if (selectedTalent.value && selectedTalent.value.effect) {
        const ef = selectedTalent.value.effect;
        for (const k in ef) {
            if (Object.prototype.hasOwnProperty.call(tempStats.value, k)) {
                tempStats.value[k] += ef[k];
            }
        }
    }
    gameStage.value = 'points';
}

function startGame() {
    Object.assign(gameState, JSON.parse(JSON.stringify(tempStats.value)));
    gameState.isAlive = true;
    gameState.log = [];

    // Apply specific talent gifts (items)
    if (selectedTalent.value && selectedTalent.value.gift === 'scooter') {
        const scooter = lifeData.vehicles.find(v => v.id === 'scooter');
        if (scooter) gameState.cars.push(scooter);
    }

    // Initial Text
    addLog(`你出生了。`);
    // Talent log
    if (selectedTalent.value) {
        addLog(`你拥有命格：【${selectedTalent.value.name}】 - ${selectedTalent.value.desc}`);
    }
    saveGame(true);
    gameStage.value = 'game';
}

function restart() {
    gameStage.value = 'intro';
    Object.assign(gameState, initialStats);
    gameState.isAlive = false;
    tempStats.value = null;
    currentScene.value = 'dashboard';
    gameState.houses = [];
    gameState.cars = [];
    gameState.log = [];
}

function saveGame(silent = false) {
    localStorage.setItem('lifeSimSave', JSON.stringify({ state: gameState, stage: gameStage.value }));
    hasSave.value = true;
    if (!silent) {
        ElMessage.success('存档成功');
    }
}

function loadGame() {
    const data = localStorage.getItem('lifeSimSave');
    if (data) {
        try {
            const parsed = JSON.parse(data);

            if (parsed.state) {
                Object.assign(gameState, parsed.state);
                gameStage.value = parsed.stage || 'game';
            } else {
                Object.assign(gameState, parsed);
                gameStage.value = 'game';
            }
            addLog('欢迎回来！读取存档成功。');
        } catch (e) {
            console.error(e);
        }
    }
}

// --- Age Up Logic ---
function ageUp() {
    if (!gameState.isAlive) return;
    gameState.age++;

    // 0. Life Stage Checks
    // Allowance for kids
    if (gameState.age < 18) {
        const allowance = 500 + (gameState.happiness * 5); // Richer parents if happy?
        gameState.wealth += allowance;
        if (gameState.age >= 6) addLog(`父母给了你 ￥${allowance} 零花钱。`);
    }

    // Retirement
    if (gameState.job && gameState.age >= 65) {
        const pension = gameState.job.salary * 5;
        addLog(`你已年满65岁，从 ${gameState.job.name} 光荣退休！获得退休金 ￥${pension}。`);
        gameState.wealth += pension;
        gameState.job = null;
    }

    let events = [];

    // 1. Bank Interest
    if (gameState.savings > 0) {
        const interest = Math.floor(gameState.savings * lifeData.bank.depositRates.fixed1);
        gameState.savings += interest;
        // Don't log every year to reduce noise, or log if significant
        if (interest > 1000) addLog(`你的银行存款产生了 ￥${interest} 的利息。`);
    }

    // 2. Job Salary
    if (gameState.job) {
        gameState.wealth += gameState.job.salary * 12;
    }

    // 3. Pay Rent
    if (gameState.houses.length > 0) {
        const rented = gameState.houses.filter(h => h.type === 'rent');
        let totalRent = 0;
        rented.forEach(h => totalRent += (h.rent * 12));
        if (totalRent > 0) {
            gameState.wealth -= totalRent;
            addLog(`支付了全年房租 ￥${totalRent}。`);
            if (gameState.wealth < 0) {
                addLog('你破产了，付不起房租，被房东扫地出门！');
                gameState.houses = gameState.houses.filter(h => h.type !== 'rent');
            }
        }
    }

    // 4. Events Logic
    // Check death
    if (lifeData.ageEvents && lifeData.ageEvents[gameState.age]) {
        const pool = lifeData.ageEvents[gameState.age];
        const evt = pool[Math.floor(Math.random() * pool.length)];
        if (evt) events.push(evt);
    } else {
        // Period events fallback logic...
        const period = getAgePeriod(gameState.age);
        if (lifeData.periods && lifeData.periods[period]) {
            const pool = lifeData.periods[period];
            // Simple fallback
            const evt = pool[Math.floor(Math.random() * pool.length)];
            if (evt && (!evt.minAge || evt.minAge <= gameState.age)) {
                events.push(evt);
            } else {
                events.push({ text: '这一年平淡无奇，你又长大了一岁。' });
            }
        } else {
            events.push({ text: '岁月静好。' });
        }
    }

    // Apply events
    events.forEach(ev => {
        if (ev.choices) {
            addLog(ev.text);
            pendingChoice.value = ev;
            // Hack: append choices to last log
            gameState.log[gameState.log.length - 1].choices = ev.choices;
        } else {
            addLog(ev.text);
            if (ev.effect) applyEffect(ev.effect);
        }
    });

    // Natural changes
    // Asset Passive Bonuses
    if (gameState.houses.length > 0 || gameState.cars.length > 0) {
        const happyBonus = (gameState.houses.length * 2) + gameState.cars.length;
        gameState.happiness = Math.min(100, gameState.happiness + happyBonus);
        // Owned houses give health (rest)
        const ownedHouses = gameState.houses.filter(h => h.type === 'buy').length;
        if (ownedHouses > 0) gameState.health = Math.min(100, gameState.health + ownedHouses);
    }

    // Reduced health decay
    if (Math.random() > 0.7) gameState.health -= 1;

    gameState.hasWorked = false; // Reset work status
    gameState.hasStudied = false; // Reset study status
    checkDeath();
    saveGame(true); // Auto save silently
}

function getAgePeriod(age) {
    if (age < 13) return 'child';
    if (age < 18) return 'teen';
    if (age < 60) return 'adult';
    return 'elder';
}

function checkDeath() {
    if (gameState.health <= 0) {
        // Grace chance handled in applyEffect for events, but for natural decay:
        if (Math.random() > 0.8) {
            gameState.health = 1;
            addLog('你大病一场，险些丧命，还好挺过来了。');
            return;
        }
        gameState.isAlive = false;
        addLog(`遗憾的是，因为健康耗尽，你的生命走到了尽头。享年 ${gameState.age} 岁。`);
        pendingChoice.value = null;
    } else if (gameState.age > (gameState.lifespan || 100)) {
        gameState.isAlive = false;
        addLog(`你在睡梦中安详离世（寿终正寝）。享年 ${gameState.age} 岁。`);
        pendingChoice.value = null;
    }
}

function addLog(text) {
    if (!gameState.log) gameState.log = [];
    gameState.log.push({ age: gameState.age, text });

    // Auto scroll to top (because logs are reversed)
    nextTick(() => {
        setTimeout(() => {
            if (scrollContainerRef.value) {
                scrollContainerRef.value.scrollTop = 0;
            }
        }, 50);
    });
}

function applyEffect(ef) {
    if (ef.death) {
        // Double check if we should really die (grace chance)
        // 20% chance to survive sudden death event
        if (Math.random() < 0.2) {
            addLog('你遭遇了致命危险，但奇迹般地幸存了下来！');
            return;
        }
        gameState.isAlive = false;
        return;
    }
    for (const k in ef) {
        if (k === 'death') continue;
        if (Object.prototype.hasOwnProperty.call(gameState, k)) {
            if (k === 'wealth' || k === 'savings') {
                gameState[k] += ef[k];
            } else {
                gameState[k] = Math.max(0, Math.min(100, gameState[k] + ef[k]));
            }
        }
    }
}

function makeChoice(choice) {
    if (choice.log) addLog(choice.log);
    if (choice.effect) applyEffect(choice.effect);
    pendingChoice.value = null;
    checkDeath();
}

function workHard() {
    if (gameState.hasWorked) {
        return ElMessage.warning('你今年已经很努力了，注意劳逸结合（每年只能工作一次）。');
    }
    addLog('你努力工作了一整年，获得了额外的绩效奖金。');
    gameState.wealth += 2000; // Base interaction bonus
    gameState.health -= 1;
    gameState.stress = (gameState.stress || 0) + 2;
    gameState.hasWorked = true;
}

function openBuilding(id) {
    currentBuilding.value = id;
    buildingDialogVisible.value = true;
}

function bankDeposit() {
    if (bankAmount.value <= 0) return;
    if (gameState.wealth >= bankAmount.value) {
        gameState.wealth -= bankAmount.value;
        gameState.savings += bankAmount.value;
        ElMessage.success(`存入 ${bankAmount.value} 元`);
    } else {
        ElMessage.error('现金不足');
    }
}

function bankWithdraw() {
    if (bankAmount.value <= 0) return;
    if (gameState.savings >= bankAmount.value) {
        gameState.savings -= bankAmount.value;
        gameState.wealth += bankAmount.value;
        ElMessage.success(`取出 ${bankAmount.value} 元`);
    } else {
        ElMessage.error('存款不足');
    }
}

function hasHouse(id) {
    return gameState.houses && gameState.houses.some(h => h.id === id);
}

function buyHouse(house) {
    if (gameState.wealth >= house.price) {
        gameState.wealth -= house.price;
        gameState.houses.push(house);
        addLog(`恭喜！你买下了 ${house.name}！`);
        ElMessage.success('购买成功');
    }
}

function rentHouse(house) {
    if (hasHouse(house.id)) return ElMessage.warning('你已经租了这个房子');

    // Allow renting even with 0 cost upfront, rent is paid yearly
    // Wait, we need to track it.
    gameState.houses.push(house);
    addLog(`你租下了 ${house.name}，虽然是租的，但也是个家。`);
    buildingDialogVisible.value = false;
}

function hasCar(id) {
    return gameState.cars && gameState.cars.some(c => c.id === id);
}

function buyCar(car) {
    if (gameState.wealth >= car.price) {
        gameState.wealth -= car.price;
        gameState.cars.push(car);
        addLog(`酷！你买了一辆 ${car.name}！`);
        ElMessage.success('购买成功');
    }
}

function canStudy(edu) {
    // Check age logic etc.
    if (gameState.age > edu.maxAge) return false;
    if (gameState.age < edu.age) return false;
    return true;
}

function checkEduReq(edu) {
    if (!canStudy(edu)) return false;
    const levels = lifeData.education.levels;
    const idx = levels.findIndex(e => e.id === edu.id);
    if (idx > 0) {
        const prevId = levels[idx - 1].id;
        if (gameState.degree !== prevId && !hasDegree(prevId)) return false;
    }
    return true;
}

function hasDegree(levelId) {
    const levels = ['primary', 'middle', 'high', 'university', 'master', 'phd'];
    const currentIdx = levels.indexOf(gameState.degree);
    const targetIdx = levels.indexOf(levelId);
    return currentIdx >= targetIdx;
}

function enroll(edu) {
    if (gameState.hasStudied) return ElMessage.warning('你今年已经入学/毕业过了，贪多嚼不烂。');
    if (edu.cost > 0 && gameState.wealth < edu.cost) {
        ElMessage.error('学费不足');
        return;
    }

    // Check previous degree
    if (!checkEduReq(edu)) {
        return ElMessage.error(`未满足前置学历要求`);
    }

    if (edu.cost) gameState.wealth -= edu.cost;
    addLog(`你入学了 ${edu.name}。好好学习！`);
    buildingDialogVisible.value = false;

    gameState.degree = edu.id;
    gameState.hasStudied = true;
}

function getDegreeName(id) {
    if (!id || id === 'none') return '文盲';
    const edu = lifeData.education.levels.find(e => e.id === id);
    return edu ? edu.name : id;
}

function visitDoctor(type) {
    const cost = type === 'expert' ? 2000 : 200;
    if (gameState.wealth < cost) return ElMessage.error('没钱看病');
    gameState.wealth -= cost;
    const heal = type === 'expert' ? 30 : 10;
    gameState.health = Math.min(100, gameState.health + heal);
    addLog(`看病结束，健康恢复了。`);
}

function plasticSurgery() {
    if (gameState.wealth < 20000) return ElMessage.error('没钱整容');
    gameState.wealth -= 20000;
    const outcome = rand(1, 10);
    if (outcome > 3) {
        gameState.looks = Math.min(100, gameState.looks + 20);
        addLog('整容成功！你变成了大帅哥/大美女！');
    } else {
        gameState.looks = Math.max(0, gameState.looks - 10);
        addLog('整容失败...看起来有点怪。');
    }
}

function checkJobReq(job) {
    if (gameState.smarts < (job.req.smarts || 0)) return false;
    if (gameState.looks < (job.req.looks || 0)) return false;
    if (gameState.health < (job.req.health || 0)) return false;
    return true;
}

function applyJob(job) {
    if (gameState.job) return ElMessage.warning('你已经有工作了，请先辞职。');

    if (checkJobReq(job)) {
        gameState.job = job;
        addLog(`恭喜，你被 ${job.name} 录用了！`);
        buildingDialogVisible.value = false;
    } else {
        ElMessage.error('你的能力还不足以胜任这份工作。请查看要求。');
    }
}

function quitJob() {
    addLog(`你辞去了 ${gameState.job.name} 的工作。世界这么大，你想去看看。`);
    gameState.job = null;
    buildingDialogVisible.value = false;
}

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
</script>

<style scoped>
.life-tool {
    --bg: #f5f7fa;
    --card: #ffffff;
    --primary: #409eff;
    --text: #2c3e50;
    --text-sec: #7f8c8d;

    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    height: 100vh;
    /* Changed from min-height to fixed height for app-like feel */
    background: var(--bg);
    display: flex;
    flex-direction: column;
    color: var(--text);
    overflow: hidden;
}

.nav-bar {
    position: relative;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    height: 60px;
    background: var(--card);
    border-bottom: 1px solid #eef2f7;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
    flex-shrink: 0;
    /* Prevent shrinking */
}

.nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.95rem;
    color: var(--text-sec);
}

.nav-back:hover {
    color: var(--primary);
}

.nav-actions {
    display: flex;
    gap: 10px;
}

.nav-center {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
}

.nav-center h1 {
    font-size: 1.15rem;
    margin: 0;
    color: var(--text);
    font-weight: bold;
}

.nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-sec);
    text-transform: uppercase;
    display: block;
    margin-top: 1px;
}

.footer {
    text-align: center;
    padding: 10px 0;
    /* Reduced padding */
    color: #999;
    font-size: 0.8rem;
    border-top: 1px solid #eef2f7;
    background: var(--card);
    margin-top: auto;
    flex-shrink: 0;
}

.main-content {
    flex: 1;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 20px;
}


.game-world {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: 100%;
}

.hud-panel {
    height: 80px;
    margin: 10px 20px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.hud-item {
    display: flex;
    align-items: center;
    gap: 15px;
}

.avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: #409EFF;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 18px;
}

.user-info .name {
    font-weight: bold;
    color: #303133;
}

.user-info .job {
    font-size: 12px;
    color: #909399;
}

.assets {
    gap: 20px;
    color: #606266;
    font-size: 14px;
}

.asset-row {
    display: flex;
    align-items: center;
    gap: 5px;
}

.viewport {
    flex: 1;
    position: relative;
    overflow: hidden;
    border-radius: 12px;
    /* Optional rounded */
}


.city-scene {
    width: 100%;
    height: 100%;
    background-color: #e3f2fd;
    /* Fallback color */
    background-size: cover;
    background-position: center;
    border-radius: 12px;
    position: relative;
    box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.1);
    transition: all 0.5s ease;
}

.city-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;

}


.city-btn {
    position: absolute;
    background: rgba(255, 255, 255, 0.9);
    padding: 8px 15px;
    border-radius: 20px;
    cursor: pointer;
    pointer-events: auto;
    font-weight: bold;
    color: #303133;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s;
    display: flex;
    align-items: center;
    gap: 5px;
}

.city-btn:hover {
    transform: scale(1.1);
    background: #fff;
    color: #409EFF;
}


.bank-btn {
    top: 20%;
    left: 30%;
}

.real-estate-btn {
    top: 40%;
    left: 15%;
}

.dealership-btn {
    top: 60%;
    left: 25%;
}

.school-btn {
    top: 25%;
    right: 20%;
}

.hospital-btn {
    top: 50%;
    right: 15%;
}

.company-btn {
    top: 15%;
    left: 50%;
    transform: translateX(-50%);
}

.back-btn {
    top: 85%;
    right: 5%;
    background: rgba(50, 50, 50, 0.9);
    color: #fff;
}

.back-btn:hover {
    background: #000;
    color: #fff;
}

/* Dashboard Scene */
.dashboard-scene {
    height: 100%;
    display: flex;
    gap: 20px;
}

.text-danger {
    color: #f56c6c;
    font-weight: bold;
}

.job-item.disabled {
    opacity: 0.6;
    background: #f4f4f5;
    border-color: #e9e9eb;
    color: #909399;
}

.left-col {
    width: 320px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.right-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.glass-panel {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.stat-row {
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.stat-label {
    width: 60px;
    font-weight: bold;
    color: #606266;
}

.log-container {
    padding: 0;
}

.log-header {
    padding: 15px 20px;
    border-bottom: 1px solid #ebeef5;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.log-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
}

.log-item {
    margin-bottom: 20px;
    display: flex;
    gap: 15px;
}

.log-age {
    background: #e1f3d8;
    color: #67c23a;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 12px;
    height: fit-content;
}

.log-text {
    line-height: 1.6;
    color: #303133;
    font-size: 15px;
}

.choice-btn {
    display: block;
    width: 100%;
    text-align: left;
    margin-top: 10px;
    padding: 10px;
    background: #f0f9eb;
    border: 1px solid #e1f3d8;
    border-radius: 4px;
    cursor: pointer;
    color: #67c23a;
}

.choice-btn:hover {
    background: #67c23a;
    color: white;
}


.shop-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
}

.shop-item {
    padding: 15px;
    text-align: center;
    border: 1px solid #eee;
    border-radius: 8px;
}

.shop-img {
    width: 100%;
    height: 120px;
    object-fit: cover;
    border-radius: 6px;
    margin-bottom: 10px;
}

.shop-item h4 {
    margin: 5px 0;
}

.shop-item .price {
    color: #f56c6c;
    font-weight: bold;
    margin: 10px 0;
}

.shop-item .desc {
    color: #909399;
    font-size: 12px;
    height: 35px;
    overflow: hidden;
}

.bank-ui {
    text-align: center;
}

.balance-card {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 30px;
}

.bank-actions {
    max-width: 400px;
    margin: 0 auto;
}

.btn-group {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    gap: 20px;
}

.start-screen {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.start-screen .card {
    max-width: 500px;
    text-align: center;
}

.intro-text {
    color: #606266;
    margin-bottom: 30px;
}

.stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 30px;
    text-align: left;
}

.fade-in {
    animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}


.wide-panel {
    max-width: 900px !important;
}


.talent-cards {
    display: flex;
    gap: 20px;
    justify-content: center;
    margin: 30px 0;
    flex-wrap: wrap;
}

.talent-card {
    width: 200px;
    padding: 20px;
    border-radius: 12px;
    border: 2px solid #e0e0e0;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
    background: #fff;
}

.talent-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.talent-card.selected {
    border-color: #409EFF;
    background: #ecf5ff;
    transform: scale(1.05);
}

.talent-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.talent-header h3 {
    margin: 0;
    font-size: 18px;
}

.rarity-badge {
    font-size: 12px;
    font-weight: bold;
    padding: 2px 6px;
    border-radius: 4px;
    color: white;
}

.rarity-SSR {
    border-color: #e6a23c;
}

.rarity-SSR .rarity-badge {
    background: #e6a23c;
}

.rarity-SR {
    border-color: #a300d6;
}

.rarity-SR .rarity-badge {
    background: #a300d6;
}

.rarity-R {
    border-color: #409EFF;
}

.rarity-R .rarity-badge {
    background: #409EFF;
}

.rarity-N {
    border-color: #909399;
}

.rarity-N .rarity-badge {
    background: #909399;
}


.stats-allocation {
    max-width: 400px;
    margin: 20px auto;
}

.alloc-row {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    gap: 15px;
}

.alloc-row .label {
    width: 80px;
    text-align: left;
}

.alloc-slider {
    flex: 1;
}

.points-val {
    font-size: 24px;
    color: #409EFF;
    font-weight: bold;
    margin-left: 10px;
}

.talent-summary {
    margin-top: 20px;
    font-size: 14px;
    color: #606266;
}


@media (max-width: 768px) {
    .dashboard-scene {
        flex-direction: column;
    }

    .left-col {
        width: 100%;
    }

    .hud-panel {
        height: auto;
        flex-wrap: wrap;
        padding: 10px;
    }

    .city-btn {
        font-size: 12px;
        padding: 5px 10px;
    }
}


.school-list,
.action-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 15px;
}

.edu-item,
.action-item {
    padding: 15px;
    border: 1px solid #eee;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
}

.edu-item.active {
    border-color: #409eff;
    background: #f0f9eb;
}

.edu-item.completed {
    border-color: #67c23a;
    background: #f0f9eb;
    opacity: 0.8;
}

.action-item {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.job-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.job-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background: #fdf6ec;
    border: 1px solid #faecd8;
    border-radius: 8px;
}

.job-item .salary {
    color: #f56c6c;
    font-weight: bold;
    margin-left: 10px;
}

.job-item .reqs {
    font-size: 12px;
    color: #909399;
    margin-right: auto;
    margin-left: 20px;
}
</style>
