<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">赛博木鱼</h1>
        <span class="tool-subtitle">Cyber Muyu</span>
      </div>
      <div class="header-right">
        <el-button link @click="resetCount"> 重置功德 </el-button>
      </div>
    </header>

    <main class="tool-content" @click="handleHit">
      <div class="display-area">
        <div class="merit-counter">
          <span class="label">功德</span>
          <span class="count">{{ meritCount }}</span>
        </div>
      </div>

      <div class="muyu-container">
        <div class="muyu-wrapper" :class="{ 'is-hitting': isHitting }">
          <img
            src="https://img.icons8.com/ios-filled/250/000000/buddhist-temple.png"
            alt="Muyu"
            class="muyu-img"
          />
        </div>

        <!-- 浮现文字 -->
        <transition-group name="float-up">
          <div
            v-for="popup in popups"
            :key="popup.id"
            class="floating-text"
            :style="{ left: popup.x + 'px', top: popup.y + 'px' }"
          >
            {{ customText }} +1
          </div>
        </transition-group>
      </div>

      <div class="control-panel glass-card" @click.stop>
        <div class="config-item">
          <label class="section-label">悬浮文字</label>
          <el-input v-model="customText" placeholder="功德" maxlength="10" size="small" />
        </div>

        <div class="config-item">
          <div class="label-row">
            <span class="section-label">自动敲击</span>
            <el-switch v-model="autoMode" size="small" />
          </div>
          <el-slider
            v-if="autoMode"
            v-model="autoInterval"
            :min="500"
            :max="3000"
            :step="100"
            format-tooltip="ms"
          />
        </div>

        <div class="config-item">
          <div class="label-row">
            <span class="section-label">音效</span>
            <el-switch v-model="soundEnabled" size="small" />
          </div>
        </div>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - 赛博木鱼 - 凡墙皆门</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch } from 'vue';
  import { ArrowLeft } from '@element-plus/icons-vue';

  const meritCount = ref(0);
  const isHitting = ref(false);
  const customText = ref('功德');
  const autoMode = ref(false);
  const autoInterval = ref(1000);
  const soundEnabled = ref(true);
  const popups = ref<{ id: number; x: number; y: number }[]>([]);

  let nextPopupId = 0;
  let autoTimer: number | null = null;

  // 音频系统
  let audioCtx: AudioContext | null = null;
  const initAudio = () => {
    if (!audioCtx) {
      audioCtx = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )();
    }
  };

  const playMuyuSound = () => {
    if (!soundEnabled.value) return;
    initAudio();
    if (audioCtx) {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.2);
    }
  };

  const handleHit = (e?: MouseEvent) => {
    meritCount.value++;
    isHitting.value = true;
    playMuyuSound();

    // 添加浮现文字
    const x = e ? e.clientX : window.innerWidth / 2;
    const y = e ? e.clientY - 40 : window.innerHeight / 2 - 100;

    const id = nextPopupId++;
    popups.value.push({ id, x, y });

    setTimeout(() => {
      isHitting.value = false;
    }, 100);

    // 1.5秒后移除动画文字
    setTimeout(() => {
      popups.value = popups.value.filter(p => p.id !== id);
    }, 1500);
  };

  const resetCount = () => {
    meritCount.value = 0;
    localStorage.setItem('lrm_cyber_muyu_count', '0');
  };

  const startAuto = () => {
    stopAuto();
    if (autoMode.value) {
      autoTimer = window.setInterval(() => {
        handleHit();
      }, autoInterval.value);
    }
  };

  const stopAuto = () => {
    if (autoTimer) {
      window.clearInterval(autoTimer);
      autoTimer = null;
    }
  };

  watch([autoMode, autoInterval], () => {
    startAuto();
  });

  onMounted(() => {
    const saved = localStorage.getItem('lrm_cyber_muyu_count');
    if (saved) meritCount.value = parseInt(saved, 10) || 0;
  });

  onUnmounted(() => {
    stopAuto();
    localStorage.setItem('lrm_cyber_muyu_count', meritCount.value.toString());
  });

  watch(meritCount, val => {
    localStorage.setItem('lrm_cyber_muyu_count', val.toString());
  });
</script>

<style scoped>
  .tool-page {
    min-height: 100vh;
    background: #000; /* 赛博木鱼通常建议深色背景 */
    color: #fff;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: rgba(20, 20, 20, 0.8);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 100;
  }

  .header-left,
  .header-right {
    width: 140px;
  }
  .header-center {
    text-align: center;
    flex: 1;
  }
  .tool-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #fff;
    margin: 0;
  }
  .tool-subtitle {
    font-size: 0.75rem;
    color: #94a3b8;
    text-transform: uppercase;
  }

  .tool-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    user-select: none;
    position: relative;
  }

  .merit-counter {
    text-align: center;
    margin-bottom: 60px;
  }

  .merit-counter .label {
    display: block;
    font-size: 1rem;
    color: #94a3b8;
    margin-bottom: 10px;
    letter-spacing: 2px;
  }

  .merit-counter .count {
    font-size: 3.5rem;
    font-weight: 800;
    font-family: 'JetBrains Mono', monospace;
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
  }

  .muyu-wrapper {
    cursor: pointer;
    transition: transform 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .muyu-img {
    width: 220px;
    filter: invert(1); /* 反转图标颜色为白色 */
    opacity: 0.9;
  }

  .is-hitting {
    transform: scale(0.92);
  }

  .floating-text {
    position: fixed;
    pointer-events: none;
    color: #fff;
    font-size: 1.2rem;
    font-weight: 600;
    z-index: 50;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  }

  .float-up-enter-active {
    transition: all 1.5s ease-out;
  }
  .float-up-enter-from {
    opacity: 1;
    transform: translateY(0);
  }
  .float-up-enter-to {
    opacity: 0;
    transform: translateY(-120px);
  }

  .control-panel {
    position: absolute;
    bottom: 40px;
    right: 40px;
    width: 200px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.05) !important;
    border-color: rgba(255, 255, 255, 0.1) !important;
    color: #fff;
  }

  .config-item {
    margin-bottom: 16px;
  }
  .config-item:last-child {
    margin-bottom: 0;
  }

  .section-label {
    font-size: 0.75rem;
    color: #94a3b8;
    font-weight: 600;
    margin-bottom: 8px;
    display: block;
  }

  .label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #475569;
    font-size: 0.85rem;
  }
</style>
