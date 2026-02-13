<template>
  <div class="noise-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>白噪音生成器</h1>
        <span class="nav-subtitle">White Noise Generator</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="glass-card tool-layout">
        <header class="tool-header">
          <div class="timer-display">
            <el-icon><Timer /></el-icon>
            <span>{{ timerFormatted || '无定时' }}</span>
          </div>
          <div class="global-controls">
            <button class="control-btn" @click="toggleAll">
              <el-icon><VideoPause v-if="hasPlaying" /><VideoPlay v-else /></el-icon>
              {{ hasPlaying ? '全部暂停' : '一键播放' }}
            </button>
            <button class="control-btn" @click="showTimerDialog = true">
              <el-icon><AlarmClock /></el-icon> 定时
            </button>
          </div>
        </header>

        <div class="sound-grid">
          <div
            v-for="sound in sounds"
            :key="sound.id"
            class="sound-card"
            :class="{ active: sound.volume > 0 }"
          >
            <div class="sound-info">
              <div class="icon-box" :style="{ background: sound.color + '20', color: sound.color }">
                <el-icon><component :is="sound.icon" /></el-icon>
              </div>
              <div class="meta">
                <span class="name">{{ sound.name }}</span>
                <span class="vol-label">{{ sound.volume }}%</span>
              </div>
            </div>
            <div class="vol-slider">
              <el-slider
                v-model="sound.volume"
                vertical
                height="120px"
                :min="0"
                :max="100"
                @input="updateVolume(sound)"
              />
            </div>
          </div>
        </div>

        <div v-if="timeRemaining > 0" class="timer-progress">
          <el-progress :percentage="timerPercentage" :show-text="false" color="var(--accent)" />
        </div>
      </div>
    </main>

    <!-- Timer Dialog -->
    <el-dialog v-model="showTimerDialog" title="设置定时关闭" width="300px" center>
      <div class="timer-options">
        <button v-for="t in [15, 30, 45, 60, 90]" :key="t" @click="startTimer(t)">
          {{ t }} 分钟
        </button>
        <button class="cancel-btn" @click="startTimer(0)">取消定时</button>
      </div>
    </el-dialog>

    <footer class="footer">© 2026 LRM工具箱 - 白噪音生成器</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onUnmounted, markRaw, type Component } from 'vue';
  import {
    Back,
    Timer,
    VideoPlay,
    VideoPause,
    AlarmClock,
    Cloudy,
    Sunset,
    Coffee,
    Pouring,
    WindPower,
    Sunny
  } from '@element-plus/icons-vue';

  interface Sound {
    id: string;
    name: string;
    icon: Component;
    color: string;
    url: string;
    volume: number;
    audio: HTMLAudioElement | null;
  }

  const showTimerDialog = ref(false);
  const timeRemaining = ref(0); // seconds
  const totalDuration = ref(0);
  let timerId: ReturnType<typeof setInterval> | null = null;

  const sounds = reactive<Sound[]>([
    {
      id: 'rain',
      name: '夏日雨声',
      icon: markRaw(Pouring),
      color: '#3b82f6',
      url: 'https://actions.google.com/sounds/v1/water/rain_heavy_loud.ogg',
      volume: 0,
      audio: null
    },
    {
      id: 'forest',
      name: '深山林间',
      icon: markRaw(Sunny),
      color: '#10b981',
      url: 'https://actions.google.com/sounds/v1/ambiences/forest_ambience.ogg',
      volume: 0,
      audio: null
    },
    {
      id: 'waves',
      name: '治愈海浪',
      icon: markRaw(Sunset),
      color: '#06b6d4',
      url: 'https://actions.google.com/sounds/v1/water/ocean_waves.ogg',
      volume: 0,
      audio: null
    },
    {
      id: 'fire',
      name: '壁炉篝火',
      icon: markRaw(Cloudy),
      color: '#f59e0b',
      url: 'https://actions.google.com/sounds/v1/ambiences/fire_crackle.ogg',
      volume: 0,
      audio: null
    },
    {
      id: 'cafe',
      name: '午后咖啡',
      icon: markRaw(Coffee),
      color: '#8b5cf6',
      url: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
      volume: 0,
      audio: null
    },
    {
      id: 'wind',
      name: '旷野之风',
      icon: markRaw(WindPower),
      color: '#64748b',
      url: 'https://actions.google.com/sounds/v1/ambiences/wind_heavy.ogg',
      volume: 0,
      audio: null
    }
  ]);

  const hasPlaying = computed(() => sounds.some(s => s.volume > 0));

  const timerFormatted = computed(() => {
    if (timeRemaining.value <= 0) return '';
    const m = Math.floor(timeRemaining.value / 60);
    const s = timeRemaining.value % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  });

  const timerPercentage = computed(() => {
    if (totalDuration.value === 0) return 0;
    return (timeRemaining.value / totalDuration.value) * 100;
  });

  const updateVolume = (sound: Sound) => {
    if (!sound.audio && sound.volume > 0) {
      sound.audio = new Audio(sound.url);
      sound.audio.loop = true;
      sound.audio.play().catch(() => console.warn('Audio play blocked'));
    }
    if (sound.audio) {
      sound.audio.volume = sound.volume / 100;
      if (sound.volume === 0) {
        sound.audio.pause();
        sound.audio.currentTime = 0;
      } else if (sound.audio.paused) {
        sound.audio.play();
      }
    }
  };

  const toggleAll = () => {
    const target = hasPlaying.value ? 0 : 30;
    sounds.forEach(s => {
      s.volume = target;
      updateVolume(s);
    });
  };

  const startTimer = (mins: number) => {
    showTimerDialog.value = false;
    if (timerId) clearInterval(timerId);
    if (mins === 0) {
      timeRemaining.value = 0;
      return;
    }
    timeRemaining.value = mins * 60;
    totalDuration.value = mins * 60;
    timerId = setInterval(() => {
      timeRemaining.value--;
      if (timeRemaining.value <= 0) {
        if (timerId) clearInterval(timerId);
        sounds.forEach(s => {
          s.volume = 0;
          updateVolume(s);
        });
      }
    }, 1000);
  };

  const toggleAllOff = () => {
    sounds.forEach(s => {
      if (s.audio) {
        s.audio.pause();
        s.audio = null;
      }
    });
  };

  onUnmounted(() => {
    toggleAllOff();
    if (timerId) clearInterval(timerId);
  });
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@600;700&family=Outfit:wght@400;500;600&display=swap');

  .noise-tool {
    --bg: #f0f4f8;
    --card: #ffffff;
    --border: #dbeafe;
    --text: #1e293b;
    --text-2: #64748b;
    --accent: #3b82f6;
    --accent-bg: #eff6ff;

    font-family: 'Outfit', sans-serif;
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
  }

  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border);
  }

  .nav-back,
  .nav-spacer {
    width: 100px;
  }
  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-2);
    cursor: pointer;
    font-size: 0.85rem;
    padding: 0.5rem 1rem;
    border-radius: 50px;
  }
  .nav-back:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-bg);
  }

  .nav-center {
    flex: 1;
    text-align: center;
  }
  .nav-center h1 {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0;
  }
  .nav-subtitle {
    font-size: 0.75rem;
    color: var(--text-2);
    text-transform: uppercase;
    text-align: center;
    display: block;
    letter-spacing: 1.5px;
  }

  .main-content {
    max-width: 900px;
    margin: 0 auto;
    padding: 2.5rem 1.5rem;
  }
  .glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 32px;
    padding: 2.5rem;
    box-shadow: 0 10px 40px -10px rgba(59, 130, 246, 0.1);
  }

  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2.5rem;
    padding: 1.25rem 1.5rem;
    background: #f8fafc;
    border-radius: 20px;
  }
  .timer-display {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    color: var(--accent);
    font-family: monospace;
    font-size: 1.25rem;
  }
  .global-controls {
    display: flex;
    gap: 0.75rem;
  }
  .control-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0.6rem 1.25rem;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text);
  }
  .control-btn:hover {
    background: var(--accent-bg);
    border-color: var(--accent);
    color: var(--accent);
  }

  .sound-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  .sound-card {
    background: #f8fafc;
    border: 1px solid transparent;
    border-radius: 24px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  .sound-card.active {
    background: white;
    border-color: var(--border);
    box-shadow: 0 8px 20px -5px rgba(0, 0, 0, 0.05);
    transform: translateY(-4px);
  }

  .sound-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    text-align: center;
  }
  .icon-box {
    width: 56px;
    height: 56px;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
  }
  .name {
    display: block;
    font-weight: 700;
    font-size: 0.95rem;
    color: var(--text);
  }
  .vol-label {
    display: block;
    font-size: 0.75rem;
    color: var(--text-2);
    margin-top: 2px;
  }

  .vol-slider {
    :deep(.el-slider__runway) {
      background-color: #e2e8f0;
    }
  }

  .timer-progress {
    margin-top: 2rem;
    border-radius: 4px;
    overflow: hidden;
  }

  .timer-options {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .timer-options button {
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;
  }
  .timer-options button:hover {
    background: var(--accent-bg);
    border-color: var(--accent);
    color: var(--accent);
  }
  .cancel-btn {
    color: #f43f5e !important;
  }

  .footer {
    text-align: center;
    padding: 3rem;
    color: var(--text-2);
    font-size: 0.85rem;
  }

  @media (max-width: 640px) {
    .tool-header {
      flex-direction: column;
      gap: 1rem;
    }
  }
</style>
