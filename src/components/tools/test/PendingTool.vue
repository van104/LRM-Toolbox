<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <!-- ▸ 顶部标题栏 -->
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">像素淘金<span>.coinCatch()</span></h1>
        <div class="brutal-status-tag bg-yellow">🪙 最高得分: {{ highScore }}</div>
      </header>

      <!-- ▸ 主内容区：双栏布局 -->
      <div class="brutal-grid">
        <!-- 左侧栏：游戏画面视口 -->
        <div class="brutal-pane game-pane">
          <div class="pane-header bg-blue">
            <span>🎮 复古街机显示屏 // SCORE: {{ score }}</span>
            <div class="combo-badge" v-if="combo > 2">
              🔥 {{ combo }} 连击 (x{{ scoreMultiplier.toFixed(1) }})
            </div>
          </div>
          <div class="pane-body game-body">
            <!-- 游戏视口区域 -->
            <div
              class="arcade-screen"
              ref="screenRef"
              @mousemove="handleMouseMove"
              @touchmove="handleTouchMove"
              @touchstart="handleTouchStart"
            >
              <!-- 狂热模式背景特效 -->
              <div class="fever-overlay" v-if="isFeverMode"></div>

              <!-- 游戏状态覆盖屏 -->
              <div class="screen-overlay" v-if="gameState === 'idle'">
                <div class="overlay-card bg-yellow">
                  <div class="overlay-icon">🪙</div>
                  <h2 class="overlay-title">像素淘金小游戏</h2>
                  <p class="overlay-desc">
                    使用鼠标/手指左右滑动，或键盘 A/D 键移动篮子接金币。小心避开红色炸弹！
                  </p>
                  <button class="brutal-btn start-btn" @click="startGame">🕹️ 开始挑战</button>
                </div>
              </div>

              <div class="screen-overlay" v-if="gameState === 'gameover'">
                <div class="overlay-card bg-pink">
                  <div class="overlay-icon">💀</div>
                  <h2 class="overlay-title">挑战结束</h2>
                  <p class="overlay-desc">
                    得分：<span class="final-score">{{ score }}</span>
                  </p>
                  <p class="overlay-subdesc" v-if="score >= highScore && score > 0">
                    🎉 创造了新的个人纪录！
                  </p>
                  <button class="brutal-btn start-btn" @click="startGame">🔄 再来一次</button>
                </div>
              </div>

              <!-- 倒计时面板 -->
              <div class="countdown-overlay" v-if="countdown > 0">
                <span class="countdown-num animate-pop">{{ countdown }}</span>
              </div>

              <!-- 游戏中浮动渲染的物品 (金币、钻石、炸弹等) -->
              <div
                v-for="item in items"
                :key="item.id"
                class="falling-item"
                :class="item.type"
                :style="{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`
                }"
              >
                <!-- 精致表情符号渲染 -->
                <span class="item-emoji">{{ getItemEmoji(item.type) }}</span>
                <span
                  class="item-glow"
                  v-if="item.type === 'fever' || item.type === 'diamond'"
                ></span>
              </div>

              <!-- 玩家接金币的兜子 -->
              <div
                class="player-basket"
                :style="{
                  left: `${playerX}%`,
                  width: `${activeSkin.width}px`
                }"
              >
                <div class="basket-emoji">{{ activeSkin.emoji }}</div>
                <!-- 磁力圈特效 -->
                <div class="magnet-circle" v-if="hasMagnet"></div>
              </div>

              <!-- 尘灰特效 (获得金币时的微光闪烁) -->
              <div
                v-for="particle in particles"
                :key="particle.id"
                class="gold-particle"
                :style="{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  background: particle.color
                }"
              ></div>
            </div>
          </div>
        </div>

        <!-- 右侧栏：控制中心 -->
        <div class="control-column">
          <!-- 面板 1：基本操作与皮肤选配 -->
          <div class="brutal-pane bg-yellow-pane">
            <div class="pane-header bg-yellow">
              <span>🛠️ 街机配置面板</span>
            </div>
            <div class="pane-body">
              <!-- 游戏状态与核心参数 -->
              <div class="stats-bar-top">
                <div class="stat-bubble bg-pink">
                  <span>生命值:</span>
                  <div class="heart-row">
                    <span v-for="i in 3" :key="i" class="heart">
                      {{ i <= lives ? '❤️' : '🖤' }}
                    </span>
                  </div>
                </div>
                <div class="stat-bubble bg-green">
                  <span>等级:</span>
                  <span class="text-bold">LV.{{ gameLevel }}</span>
                </div>
              </div>

              <!-- 皮肤订制 -->
              <div class="control-item">
                <label class="control-label">🐱 街机玩家皮肤订制:</label>
                <div class="skin-grid">
                  <div
                    v-for="(skin, index) in SKINS"
                    :key="index"
                    class="skin-card"
                    :class="{ active: currentSkinIndex === index }"
                    @click="selectSkin(index)"
                  >
                    <span class="skin-emoji-dot">{{ skin.emoji }}</span>
                    <div class="skin-info">
                      <div class="skin-name">{{ skin.name }}</div>
                      <div class="skin-desc">{{ skin.desc }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 声音控制器 -->
              <div class="control-item audio-controls">
                <div class="toggle-row">
                  <span class="control-label">🔊 合成爆笑街机音效:</span>
                  <button class="toggle-switch" :class="{ on: soundEnabled }" @click="toggleSound">
                    <span class="switch-knob"></span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 面板 2：狂热蓄力计 -->
          <div class="brutal-pane">
            <div class="pane-header bg-green">
              <span>⚡ 狂热储能槽 (FEVER MULTIPLIER)</span>
            </div>
            <div class="pane-body">
              <div class="fever-meter-container">
                <div class="fever-meter-info">
                  <span class="fever-status">
                    {{
                      isFeverMode
                        ? '🔥 极速狂热金币雨中！'
                        : feverEnergy >= 100
                          ? '⚡ 储能已满！双击屏幕释放！'
                          : '收集流星或持续连击可积攒储能'
                    }}
                  </span>
                  <span class="fever-pct">{{ feverEnergy }}%</span>
                </div>
                <div class="fever-progress-bar">
                  <div
                    class="fever-progress"
                    :style="{ width: `${feverEnergy}%` }"
                    :class="{ 'fever-active': isFeverMode, 'fever-ready': feverEnergy >= 100 }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 面板 3：战绩与禅意金钱观 -->
          <div class="brutal-pane stats-pane">
            <div class="pane-header bg-pink">
              <span>📊 街机统计与财富名言</span>
            </div>
            <div class="pane-body">
              <div class="stats-grid">
                <div class="stat-card">
                  <span class="stat-num">{{ coinsCaught }}</span>
                  <span class="stat-desc">捕获金币数</span>
                </div>
                <div class="stat-card">
                  <span class="stat-num">{{ maxCombo }}</span>
                  <span class="stat-desc">最高连击纪录</span>
                </div>
                <div class="stat-card">
                  <span class="stat-num">{{ diamondsCaught }}</span>
                  <span class="stat-desc">捕获稀有钻石</span>
                </div>
                <div class="stat-card">
                  <span class="stat-num">{{ bombsHit }}</span>
                  <span class="stat-desc">误碰炸弹次数</span>
                </div>
              </div>

              <!-- 金钱哲理 -->
              <div class="wisdom-box">
                <div class="wisdom-title">💡 黄金禅意语录:</div>
                <transition name="fade" mode="out-in">
                  <p :key="currentQuote" class="wisdom-text">“ {{ currentQuote }} ”</p>
                </transition>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ▸ 底部状态栏 -->
      <footer class="brutal-status info">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 5" :key="i"
              >🪙 像素淘金小游戏 - 使用 A/D 键或鼠标快速滑动以开启狂热淘金模式 // KEYBOARD A/D MOVE
              SUPPORTED // 财富如水，流过当下 // &nbsp;</span
            >
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  // === 游戏基础状态 ===
  const gameState = ref<'idle' | 'countdown' | 'playing' | 'gameover'>('idle');
  const countdown = ref(0);
  const score = ref(0);
  const highScore = ref(parseInt(localStorage.getItem('coin_high_score') || '0'));
  const lives = ref(3);
  const gameLevel = ref(1);
  const combo = ref(0);
  const maxCombo = ref(0);
  const feverEnergy = ref(0);
  const isFeverMode = ref(false);
  const hasMagnet = ref(false);

  // 统计数据
  const coinsCaught = ref(0);
  const diamondsCaught = ref(0);
  const bombsHit = ref(0);

  // === 街机篮子与皮肤配置 ===
  const playerX = ref(50); // 玩家篮子水平中心位置 0-100
  const currentSkinIndex = ref(0);

  const SKINS = [
    {
      name: '经典像素钱袋',
      emoji: '🧺',
      width: 72,
      desc: '经典大小，手感最稳健的淘金基础装备。'
    },
    {
      name: '招财太空金猫',
      emoji: '🐱',
      width: 84,
      desc: '体态略宽，对周边金币有 15% 的磁性捕捉判定。'
    },
    {
      name: '赛博能量漏斗',
      emoji: '🛸',
      width: 62,
      desc: '漏斗极小易漏，但捕获时有 1.3 倍得分加成。'
    },
    {
      name: '金库招财猪猪',
      emoji: '🐷',
      width: 78,
      desc: '福气满满，连击加成时 20% 概率额外充能。'
    }
  ];

  const activeSkin = computed(() => SKINS[currentSkinIndex.value]);

  const selectSkin = (index: number) => {
    if (gameState.value === 'playing') return;
    currentSkinIndex.value = index;
  };

  // 分数倍数计算
  const scoreMultiplier = computed(() => {
    let mult = 1.0;
    // 皮肤系数
    if (currentSkinIndex.value === 2) mult *= 1.3;
    // 连击加成
    if (combo.value > 5) mult += Math.min(2.0, (combo.value - 5) * 0.1);
    // 狂热模式加成
    if (isFeverMode.value) mult *= 1.5;
    return mult;
  });

  // === 物理引擎参数 ===
  const screenRef = ref<HTMLElement | null>(null);
  const items = ref<any[]>([]);
  const particles = ref<any[]>([]);
  let gameLoopId: number | null = null;
  let spawnTimer: number | null = null;

  // 移动参数
  const keysPressed = ref<Record<string, boolean>>({});

  // === 物品配方与池 ===
  // 物品类型：coin (金币), diamond (钻石), bomb (炸弹), magnet (磁铁), fever (流星)
  const getItemEmoji = (type: string) => {
    switch (type) {
      case 'coin':
        return '🪙';
      case 'diamond':
        return '💎';
      case 'bomb':
        return '💣';
      case 'magnet':
        return '🧲';
      case 'fever':
        return '🌠';
      default:
        return '🪙';
    }
  };

  // === 音效合成 (Web Audio API) ===
  const soundEnabled = ref(true);
  let audioCtx: AudioContext | null = null;

  const initAudio = () => {
    if (audioCtx) return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  };

  const toggleSound = () => {
    soundEnabled.value = !soundEnabled.value;
  };

  const playCoinSound = () => {
    if (!soundEnabled.value) return;
    initAudio();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    // 经典街机连音 B5 -> E6
    osc.frequency.setValueAtTime(987.77, now);
    osc.frequency.setValueAtTime(1318.51, now + 0.08);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.23);
  };

  const playDiamondSound = () => {
    if (!soundEnabled.value) return;
    initAudio();
    if (!audioCtx) return;
    const ctx = audioCtx;
    const now = ctx.currentTime;

    const notes = [1046.5, 1318.51, 1567.98, 2093.0]; // C6-E6-G6-C7 琶音
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      gain.gain.setValueAtTime(0, now + idx * 0.05);
      gain.gain.linearRampToValueAtTime(0.1, now + idx * 0.05 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.18);
    });
  };

  const playBombSound = () => {
    if (!soundEnabled.value) return;
    initAudio();
    if (!audioCtx) return;
    const ctx = audioCtx;
    const now = ctx.currentTime;

    // 白噪音模拟爆炸声
    const bufferSize = audioCtx.sampleRate * 0.35;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, now);
    filter.frequency.exponentialRampToValueAtTime(10, now + 0.3);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start(now);
  };

  const playFeverSound = () => {
    if (!soundEnabled.value) return;
    initAudio();
    if (!audioCtx) return;
    const ctx = audioCtx;
    const now = ctx.currentTime;

    // 凯旋式复古大和弦
    const baseFreqs = [261.63, 329.63, 392.0, 523.25]; // C4大三和弦
    baseFreqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(freq * 1.5, now + 0.4);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.46);
    });
  };

  // === 键盘控制逻辑 ===
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
      keysPressed.value['left'] = true;
    }
    if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
      keysPressed.value['right'] = true;
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
      keysPressed.value['left'] = false;
    }
    if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
      keysPressed.value['right'] = false;
    }
  };

  // === 滑动与触摸控制 ===
  const handleMouseMove = (e: MouseEvent) => {
    if (gameState.value !== 'playing') return;
    if (!screenRef.value) return;
    const rect = screenRef.value.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    playerX.value = Math.max(0, Math.min(100, (relX / rect.width) * 100));
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (gameState.value !== 'playing') return;
    if (!screenRef.value) return;
    const rect = screenRef.value.getBoundingClientRect();
    const touch = e.touches[0];
    const relX = touch.clientX - rect.left;
    playerX.value = Math.max(0, Math.min(100, (relX / rect.width) * 100));
  };

  const handleTouchStart = (e: TouchEvent) => {
    // 阻止双击缩放默认行为
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  };

  // === 核心游戏回路 ===
  const startGame = () => {
    initAudio();
    gameState.value = 'countdown';
    countdown.value = 3;
    score.value = 0;
    lives.value = 3;
    gameLevel.value = 1;
    combo.value = 0;
    maxCombo.value = 0;
    feverEnergy.value = 0;
    isFeverMode.value = false;
    hasMagnet.value = false;
    items.value = [];
    particles.value = [];
    coinsCaught.value = 0;
    diamondsCaught.value = 0;
    bombsHit.value = 0;

    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value === 0) {
        clearInterval(timer);
        gameState.value = 'playing';
        startGameLoop();
      }
    }, 1000);
  };

  const startGameLoop = () => {
    // 启动生成物品的时钟
    startItemSpawning();

    // 帧回路
    const loop = () => {
      if (gameState.value !== 'playing') return;

      // 1. 处理键盘移动 (A/D & 左右键)
      const speed = 2.4;
      if (keysPressed.value['left']) {
        playerX.value = Math.max(0, playerX.value - speed);
      }
      if (keysPressed.value['right']) {
        playerX.value = Math.max(0, playerX.value + speed);
      }

      // 2. 更新掉落物物理
      updateItemsPhysics();

      // 3. 更新微粒碎屑特效
      updateParticles();

      // 4. 下一帧循环
      gameLoopId = requestAnimationFrame(loop);
    };
    gameLoopId = requestAnimationFrame(loop);
  };

  const stopGameLoop = () => {
    if (gameLoopId) {
      cancelAnimationFrame(gameLoopId);
      gameLoopId = null;
    }
    if (spawnTimer) {
      clearInterval(spawnTimer);
      spawnTimer = null;
    }
  };

  // 物品生成机
  const startItemSpawning = () => {
    const getInterval = () => {
      if (isFeverMode.value) return 180; // 狂热金币狂雨模式
      return Math.max(350, 900 - gameLevel.value * 90); // 难度升级物品掉落越频密
    };

    const spawn = () => {
      if (gameState.value !== 'playing') return;
      spawnSingleItem();
      // 动态修改定时器频率
      if (spawnTimer) clearInterval(spawnTimer);
      spawnTimer = window.setInterval(spawn, getInterval());
    };

    spawnTimer = window.setInterval(spawn, getInterval());
  };

  const spawnSingleItem = () => {
    const x = 5 + Math.random() * 90; // 5% - 95%
    let type = 'coin';

    if (isFeverMode.value) {
      // 狂热模式只产生金币和高分钻石
      type = Math.random() < 0.85 ? 'coin' : 'diamond';
    } else {
      const rand = Math.random();
      if (rand < 0.65) {
        type = 'coin';
      } else if (rand < 0.82) {
        // 随关卡提高炸弹出现几率
        const bombChance = 0.15 + gameLevel.value * 0.03;
        type = Math.random() < bombChance ? 'bomb' : 'coin';
      } else if (rand < 0.92) {
        type = 'diamond';
      } else if (rand < 0.96) {
        type = 'magnet';
      } else {
        type = 'fever';
      }
    }

    // 基础速度加成
    const baseSpeed = 0.8 + gameLevel.value * 0.12;
    const speed = baseSpeed + Math.random() * 0.7;

    items.value.push({
      id: Date.now() + Math.random(),
      x,
      y: -5,
      speed,
      type,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8
    });
  };

  // 掉落物理学与碰撞检测
  const updateItemsPhysics = () => {
    const screenWidthPx = screenRef.value?.clientWidth || 400;
    const basketWidthHalfPct = (activeSkin.value.width / 2 / screenWidthPx) * 100;

    items.value.forEach((item, idx) => {
      // 重力磁铁物理：如果磁铁生效，吸引周围的 coin 或 diamond 向篮子靠拢
      if (hasMagnet.value && (item.type === 'coin' || item.type === 'diamond')) {
        const dx = playerX.value - item.x;
        const dy = 88 - item.y; // 88% 是篮子高度位置
        const dist = Math.sqrt(dx * dx + dy * dy);
        // 磁力影响范围
        if (dist < 35) {
          item.x += (dx / dist) * 1.5;
          item.y += (dy / dist) * 1.5;
        }
      }

      // 普通向下坠落
      item.y += item.speed;
      item.rotation += item.rotationSpeed;

      // 碰撞检测 (84% 到 91% 是篮子的受体厚度区)
      if (item.y >= 84 && item.y <= 91) {
        const distance = Math.abs(item.x - playerX.value);
        // 判定碰撞：距离在半个篮子宽度百分比内
        if (distance <= basketWidthHalfPct + 1.5) {
          // 接到了！
          handleItemCollected(item);
          items.value.splice(idx, 1);
          return;
        }
      }

      // 漏掉了！流向屏幕底部
      if (item.y > 100) {
        if (item.type === 'coin' || item.type === 'diamond') {
          // 漏掉金币重置 combo (狂热模式不重置)
          if (!isFeverMode.value) {
            combo.value = 0;
          }
        }
        items.value.splice(idx, 1);
      }
    });
  };

  // 处理成功接到物品
  const handleItemCollected = (item: any) => {
    // 增加爆炸碎屑特效
    createExplosionParticles(item.x, item.y, item.type);

    if (item.type === 'coin') {
      const added = Math.round(10 * scoreMultiplier.value);
      score.value += added;
      coinsCaught.value++;
      combo.value++;
      maxCombo.value = Math.max(maxCombo.value, combo.value);

      // 狂热条充能 (蓄力速度：招财猪额外充能 20% 几率)
      const isPiggyBonus = currentSkinIndex.value === 3 && Math.random() < 0.2;
      const energyAdd = isPiggyBonus ? 5 : 3;
      if (!isFeverMode.value) {
        feverEnergy.value = Math.min(100, feverEnergy.value + energyAdd);
      }

      playCoinSound();
    } else if (item.type === 'diamond') {
      const added = Math.round(50 * scoreMultiplier.value);
      score.value += added;
      diamondsCaught.value++;
      combo.value += 2;
      maxCombo.value = Math.max(maxCombo.value, combo.value);

      if (!isFeverMode.value) {
        feverEnergy.value = Math.min(100, feverEnergy.value + 8);
      }
      playDiamondSound();
    } else if (item.type === 'bomb') {
      // 接到炸弹：扣血，重置连击
      lives.value--;
      bombsHit.value++;
      combo.value = 0;
      feverEnergy.value = Math.max(0, feverEnergy.value - 25);
      playBombSound();

      if (lives.value <= 0) {
        gameOver();
      } else {
        ElMessage.error('💣 糟糕！你接到了炸弹，生命值 -1！');
      }
    } else if (item.type === 'magnet') {
      // 磁铁道具
      triggerMagnetPower();
      playDiamondSound();
      ElMessage.success('🧲 磁铁道具触发！自动在近距离吸引金币。');
    } else if (item.type === 'fever') {
      // 直接加满能量流星
      feverEnergy.value = 100;
      playFeverSound();
      ElMessage({
        message: '🌠 接到流星！狂热能量直接充盈！',
        type: 'success'
      });
    }

    // 4. 难度自动升级 (每200分升级一档)
    const targetLevel = Math.min(10, Math.floor(score.value / 250) + 1);
    if (targetLevel > gameLevel.value) {
      gameLevel.value = targetLevel;
      ElMessage({
        message: `🚀 挑战难度升级！当前等级: LV.${gameLevel.value}`,
        type: 'success',
        duration: 1500
      });
    }
  };

  // 粒子特效
  const createExplosionParticles = (x: number, y: number, type: string) => {
    let color = '#fcd34d'; // gold
    if (type === 'diamond') color = '#22d3ee';
    if (type === 'bomb') color = '#f87171';
    if (type === 'magnet') color = '#a78bfa';

    const count = type === 'bomb' ? 15 : 6;
    for (let i = 0; i < count; i++) {
      particles.value.push({
        id: Date.now() + Math.random(),
        x,
        y,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3 - 1, // 微微向上喷射
        color,
        life: 1.0,
        decay: 0.05 + Math.random() * 0.05
      });
    }
  };

  const updateParticles = () => {
    particles.value.forEach((p, idx) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) {
        particles.value.splice(idx, 1);
      }
    });
  };

  // 道具：磁铁
  const triggerMagnetPower = () => {
    hasMagnet.value = true;
    setTimeout(() => {
      hasMagnet.value = false;
    }, 7000); // 7秒磁力持续
  };

  // 释放狂热模式 (Fever)
  const triggerFeverMode = () => {
    if (isFeverMode.value) return;
    isFeverMode.value = true;
    feverEnergy.value = 100;
    playFeverSound();
    ElMessage({
      message: '🔥 狂热模式启动！黄金流星雨降临！得分加倍！',
      type: 'warning',
      duration: 3000
    });

    // 倒计时减扣
    const decayTimer = setInterval(() => {
      feverEnergy.value -= 5;
      if (feverEnergy.value <= 0) {
        clearInterval(decayTimer);
        isFeverMode.value = false;
        feverEnergy.value = 0;
        ElMessage.info('💤 狂热模式结束，街机正在逐渐冷却中。');
      }
    }, 300); // 约 6 秒
  };

  // 监听狂热蓄能，满了自动或提示双击触发
  watch(feverEnergy, val => {
    if (val >= 100 && !isFeverMode.value && gameState.value === 'playing') {
      triggerFeverMode();
    }
  });

  // 游戏结束
  const gameOver = () => {
    gameState.value = 'gameover';
    stopGameLoop();

    // 历史纪录
    if (score.value > highScore.value) {
      highScore.value = score.value;
      localStorage.setItem('coin_high_score', score.value.toString());
    }
  };

  // === 财富语录轮播 ===
  const WISDOM_QUOTES = [
    '金钱像水一样，流过来，流过去。握紧不如欣赏它的流动。',
    '世界上只有一种真正的英雄主义，就是在看清金币有毒后依旧喜欢它们。',
    '连击断了可以重来，但被炸弹直接吞噬的，往往是那颗贪婪的心。',
    '太空猫咪虽有大吸力，但别忘了：飞得最高最闪耀的总是流星。',
    '理财正如接金币，漏掉一两个是难免的，保住命才能接下一个。',
    '狂热模式看似繁华夺目，最终依然会归于静止的深夜网格。',
    '街机的金币接不完，但快乐只要有一个音响和一下午便已足够。'
  ];

  const currentQuote = ref(WISDOM_QUOTES[0]);
  let quoteTimer: number | null = null;

  const startQuoteCycle = () => {
    quoteTimer = window.setInterval(() => {
      const filterQuotes = WISDOM_QUOTES.filter(q => q !== currentQuote.value);
      currentQuote.value = filterQuotes[Math.floor(Math.random() * filterQuotes.length)];
    }, 9000);
  };

  const stopMic = () => {
    // 预留麦克风停止功能
  };

  // === 生命周期 ===
  onMounted(() => {
    startQuoteCycle();
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  });

  onUnmounted(() => {
    stopGameLoop();
    stopMic();
    if (quoteTimer) clearInterval(quoteTimer);
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  });
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

  /* === 基础布局 === */
  .brutal-wrapper {
    background-color: #fdfae5;
    background-image:
      linear-gradient(#e5e5e5 2px, transparent 2px),
      linear-gradient(90deg, #e5e5e5 2px, transparent 2px);
    background-size: 40px 40px;
    background-position: -2px -2px;
    min-height: 100vh;
    padding: 2rem;
    box-sizing: border-box;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    color: #111;
  }

  .brutal-container {
    max-width: 1350px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }

  /* === 标题栏 === */
  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    gap: 1rem;
  }

  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.2rem;
    font-weight: 900;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #4b7bff;
  }

  .brutal-title span {
    color: #4b7bff;
    text-shadow: 4px 4px 0px #111;
  }

  .brutal-status-tag {
    border: 3px solid #111;
    padding: 0.5rem 1rem;
    font-size: 1.1rem;
    font-weight: 800;
    box-shadow: 4px 4px 0px #111;
    border-radius: 0px;
  }

  /* === 按钮 === */
  .brutal-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.1rem;
    font-weight: 900;
    cursor: pointer;
    box-shadow: 5px 5px 0px #111;
    transition: all 0.08s ease-in-out;
    text-transform: uppercase;
    outline: none;
  }

  .brutal-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 7px 7px 0px #111;
  }

  .brutal-btn:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }

  /* === 布局网格 === */
  .brutal-grid {
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    gap: 2.5rem;
    margin-bottom: 2.5rem;
  }

  .control-column {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  /* === 面板 (Brutal Pane) === */
  .brutal-pane {
    background: #fff;
    border: 3px solid #111;
    box-shadow: 8px 8px 0px #111;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }

  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 1.2rem;
    border-bottom: 3px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.15rem;
    color: #111;
  }

  .pane-body {
    padding: 1.5rem;
    box-sizing: border-box;
  }

  /* 颜色辅助 */
  .bg-yellow {
    background: #ffd900;
  }
  .bg-blue {
    background: #89b4f8;
  }
  .bg-green {
    background: #00e572;
  }
  .bg-pink {
    background: #ff9fb2;
  }
  .bg-yellow-pane {
    background: #fffdf5;
  }

  /* === 街机显示屏视口 === */
  .game-pane {
    min-height: 580px;
  }

  .game-body {
    flex: 1;
    padding: 0;
    position: relative;
  }

  .arcade-screen {
    width: 100%;
    height: 520px;
    background: radial-gradient(circle at center, #1b2030 0%, #0d0f17 100%);
    position: relative;
    overflow: hidden;
    user-select: none;
    touch-action: none;
  }

  /* 连击徽章 */
  .combo-badge {
    background: #ff4b4b;
    color: white;
    font-size: 0.85rem;
    font-weight: 900;
    padding: 3px 8px;
    border: 2px solid #111;
    box-shadow: 2px 2px 0px #111;
    animation: bounce 0.3s infinite alternate;
  }

  /* 狂热大招背景闪烁特效 */
  .fever-overlay {
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      45deg,
      rgba(253, 186, 116, 0.1) 0px,
      rgba(253, 186, 116, 0.1) 15px,
      rgba(244, 63, 94, 0.1) 15px,
      rgba(244, 63, 94, 0.1) 30px
    );
    animation: fever-bg-shift 0.4s linear infinite;
    pointer-events: none;
    z-index: 1;
  }

  @keyframes fever-bg-shift {
    0% {
      background-position: 0 0;
    }
    100% {
      background-position: 42px 0;
    }
  }

  /* 游戏遮罩面板 (开屏 & 结算) */
  .screen-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 40;
    padding: 1.5rem;
  }

  .overlay-card {
    border: 3px solid #111;
    padding: 2rem;
    text-align: center;
    box-shadow: 8px 8px 0px #111;
    max-width: 320px;
    width: 100%;
  }

  .overlay-icon {
    font-size: 3rem;
    margin-bottom: 0.5rem;
    animation: bounce 0.6s infinite alternate;
  }

  .overlay-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.6rem;
    font-weight: 900;
    margin: 0 0 1rem;
    color: #111;
  }

  .overlay-desc {
    font-size: 0.9rem;
    font-weight: 700;
    line-height: 1.6;
    margin-bottom: 1.5rem;
    color: #334155;
  }

  .final-score {
    font-size: 2rem;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    color: #cc0000;
    text-shadow: 2px 2px 0px #fff;
  }

  .overlay-subdesc {
    font-size: 0.8rem;
    font-weight: 800;
    color: #15803d;
    margin-top: -0.5rem;
    margin-bottom: 1.5rem;
  }

  .start-btn {
    width: 100%;
    font-size: 1.2rem;
  }

  /* 倒计时 */
  .countdown-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.4);
    z-index: 38;
  }

  .countdown-num {
    font-family: 'Syne', sans-serif;
    font-size: 6.5rem;
    font-weight: 900;
    color: #ffd900;
    text-shadow: 6px 6px 0px #111;
  }

  /* 玩家控制的兜子 (Basket) */
  .player-basket {
    position: absolute;
    bottom: 50px;
    height: 48px;
    transform: translateX(-50%);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 20;
    pointer-events: none;
    transition: left 0.08s ease-out; /* 微弱滞后性获得平滑动作 */
  }

  .basket-emoji {
    font-size: 2.8rem;
    filter: drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.5));
  }

  /* 磁铁防护光晕 */
  .magnet-circle {
    position: absolute;
    width: 140px;
    height: 140px;
    border: 3px dashed rgba(167, 139, 250, 0.6);
    border-radius: 50%;
    animation: rotate 6s linear infinite;
    pointer-events: none;
    background: radial-gradient(circle, rgba(167, 139, 250, 0.1) 0%, rgba(167, 139, 250, 0) 70%);
  }

  /* 掉落中的宝物 */
  .falling-item {
    position: absolute;
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
  }

  .item-emoji {
    font-size: 1.8rem;
    filter: drop-shadow(0px 3px 4px rgba(0, 0, 0, 0.4));
  }

  .item-glow {
    position: absolute;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(253, 224, 71, 0.4) 0%, rgba(253, 224, 71, 0) 70%);
    filter: blur(2px);
    z-index: -1;
  }

  .diamond .item-glow {
    background: radial-gradient(circle, rgba(34, 211, 238, 0.45) 0%, rgba(34, 211, 238, 0) 70%);
  }

  /* 爆发粒子效果 */
  .gold-particle {
    position: absolute;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    z-index: 15;
    pointer-events: none;
  }

  /* === 右侧控制面板样式 === */
  .stats-bar-top {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .stat-bubble {
    flex: 1;
    border: 3px solid #111;
    padding: 0.6rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 800;
    box-shadow: 4px 4px 0px #111;
  }

  .heart-row {
    display: flex;
    gap: 2px;
  }

  .text-bold {
    font-family: 'Syne', sans-serif;
    font-size: 1.2rem;
  }

  .control-item {
    margin-bottom: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .control-label {
    font-size: 1rem;
    font-weight: 800;
    display: flex;
    justify-content: space-between;
  }

  /* 开关滑动条 */
  .toggle-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .toggle-switch {
    width: 60px;
    height: 30px;
    background: #e2e8f0;
    border: 3px solid #111;
    position: relative;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    transition: background 0.1s;
  }

  .toggle-switch.on {
    background: #00e572;
  }

  .switch-knob {
    position: absolute;
    width: 20px;
    height: 20px;
    background: #fff;
    border: 3px solid #111;
    left: 2px;
    top: 2px;
    transition: transform 0.1s;
  }

  .toggle-switch.on .switch-knob {
    transform: translateX(28px);
  }

  /* 皮肤选择网格 */
  .skin-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
  }

  .skin-card {
    background: #fff;
    border: 3px solid #111;
    padding: 0.6rem;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.08s;
  }

  .skin-card:hover {
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0px #111;
  }

  .skin-card.active {
    background: #fdfae5;
    border-color: #4b7bff;
    box-shadow: 4px 4px 0px #4b7bff;
  }

  .skin-emoji-dot {
    font-size: 1.8rem;
    flex-shrink: 0;
  }

  .skin-info {
    display: flex;
    flex-direction: column;
  }

  .skin-name {
    font-size: 0.85rem;
    font-weight: 800;
  }

  .skin-desc {
    font-size: 0.65rem;
    color: #64748b;
    line-height: 1.3;
    margin-top: 2px;
  }

  /* === 狂热蓄能计 === */
  .fever-meter-container {
    background: #f1f5f9;
    border: 3px solid #111;
    padding: 0.8rem;
    box-shadow: 4px 4px 0px #111;
  }

  .fever-meter-info {
    display: flex;
    justify-content: space-between;
    font-weight: 800;
    font-size: 0.85rem;
    margin-bottom: 6px;
  }

  .fever-pct {
    color: #ff4b4b;
  }

  .fever-progress-bar {
    width: 100%;
    height: 20px;
    background: #fff;
    border: 3px solid #111;
    overflow: hidden;
  }

  .fever-progress {
    height: 100%;
    background: #3b82f6;
    transition: width 0.12s ease-out;
  }

  .fever-progress.fever-ready {
    background: #eab308;
    animation: flash 0.15s infinite alternate;
  }

  .fever-progress.fever-active {
    background: linear-gradient(90deg, #ef4444 0%, #f97316 50%, #eab308 100%);
    animation: fever-stream 0.5s linear infinite;
  }

  @keyframes fever-stream {
    0% {
      background-position: 0% 50%;
    }
    100% {
      background-position: 100% 50%;
    }
  }

  @keyframes flash {
    0% {
      filter: brightness(1);
    }
    100% {
      filter: brightness(1.35);
    }
  }

  /* === 统计卡片网格 === */
  .stats-pane {
    flex: 1;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
    margin-bottom: 1.5rem;
  }

  .stat-card {
    background: #fdfae5;
    border: 3px solid #111;
    padding: 0.6rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 3px 3px 0px #111;
  }

  .stat-num {
    font-family: 'Syne', sans-serif;
    font-size: 1.4rem;
    font-weight: 900;
    color: #4b7bff;
  }

  .stat-desc {
    font-size: 0.75rem;
    color: #64748b;
    font-weight: 700;
    margin-top: 2px;
  }

  /* 禅意财富框 */
  .wisdom-box {
    border: 3px solid #111;
    background: #fff;
    padding: 1rem;
    box-shadow: 4px 4px 0px #111;
    min-height: 85px;
  }

  .wisdom-title {
    font-size: 0.85rem;
    font-weight: 900;
    color: #b25465;
    margin-bottom: 4px;
    text-transform: uppercase;
  }

  .wisdom-text {
    font-size: 0.9rem;
    font-weight: 700;
    line-height: 1.5;
    margin: 0;
    color: #334155;
    font-style: italic;
  }

  /* Animations */
  .animate-pop {
    animation: pop 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  @keyframes pop {
    0% {
      transform: scale(0.6);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes bounce {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(-5px);
    }
  }

  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  /* === 底部跑马灯状态栏 === */
  .brutal-status {
    background: #fff;
    border: 3px solid #111;
    box-shadow: 6px 6px 0px #111;
    padding: 0.8rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1.05rem;
    overflow: hidden;
    text-transform: uppercase;
  }

  .marquee-wrapper {
    width: 100%;
    overflow: hidden;
  }

  .marquee-content {
    display: inline-block;
    white-space: nowrap;
    animation: marquee 25s linear infinite;
  }

  @keyframes marquee {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  /* === 响应式调整 === */
  @media (max-width: 1024px) {
    .brutal-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
    .brutal-title {
      font-size: 2.3rem;
    }
    .brutal-header {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  /* === Dark Mode 适配 === */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-status,
  [data-theme='dark'] .stat-card,
  [data-theme='dark'] .skin-card,
  [data-theme='dark'] .wisdom-box,
  [data-theme='dark'] .toggle-switch,
  [data-theme='dark'] .stat-bubble,
  [data-theme='dark'] .fever-progress-bar,
  [data-theme='dark'] .fever-meter-container {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }

  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
    color: #111;
  }

  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .brutal-btn {
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .brutal-pane {
    box-shadow: 8px 8px 0px #eee;
  }

  [data-theme='dark'] .stat-card,
  [data-theme='dark'] .skin-card,
  [data-theme='dark'] .wisdom-box,
  [data-theme='dark'] .stat-bubble,
  [data-theme='dark'] .toggle-switch,
  [data-theme='dark'] .fever-meter-container {
    box-shadow: 3px 3px 0px #eee;
  }

  [data-theme='dark'] .skin-card.active {
    border-color: #89b4f8;
    box-shadow: 3px 3px 0px #89b4f8;
  }

  [data-theme='dark'] .switch-knob {
    background: #eee;
    border-color: #1a1a1a;
  }

  [data-theme='dark'] .toggle-switch.on {
    background: #00994c;
  }

  [data-theme='dark'] .wisdom-text {
    color: #cbd5e1;
  }

  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .bg-green {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .bg-pink {
    background: #cc0000;
    color: #fff;
  }
</style>
