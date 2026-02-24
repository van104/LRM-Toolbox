<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">护眼<span>.调节建议()</span></h1>
        <div class="current-time-box brutal-pane mini-pane">
          <span class="time-label">LOCAL TIME</span>
          <span class="time-val">{{ currentTimeStr }}</span>
        </div>
      </header>

      <main class="tool-content">
        <!-- Main Status Pane -->
        <div class="brutal-pane status-pane" :class="timePhase.id">
          <div class="pane-body">
            <div class="phase-info">
              <div class="phase-icon">{{ timePhase.icon }}</div>
              <div class="phase-text">
                <h2 class="phase-name">当前时段：{{ timePhase.name }}</h2>
                <p class="phase-desc">{{ timePhase.desc }}</p>
              </div>
            </div>

            <div class="settings-grid mt-6">
              <div class="setting-item brutal-card">
                <div class="setting-header">🔅 建议亮度</div>
                <div class="setting-val">{{ timePhase.brightness }}%</div>
                <div class="setting-bar">
                  <div class="bar-fill" :style="{ width: timePhase.brightness + '%' }"></div>
                </div>
              </div>

              <div class="setting-item brutal-card">
                <div class="setting-header">🌡️ 建议色温</div>
                <div class="setting-val">{{ timePhase.temp }}K</div>
                <div class="setting-bar temp-bar" :style="getTempBarStyle()">
                  <div class="bar-dot" :style="{ left: getTempPosition() + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="brutal-grid-layout mt-8">
          <!-- Guide Pane -->
          <div class="brutal-pane flex-col">
            <div class="pane-header bg-black"><span class="text-white">🖥️ 物理环境建议</span></div>
            <div class="pane-body guide-list">
              <ul>
                <li v-for="tip in timePhase.tips" :key="tip">{{ tip }}</li>
              </ul>
            </div>
          </div>

          <!-- Rest Rhythm Pane -->
          <div class="brutal-pane flex-col">
            <div class="pane-header bg-yellow"><span>⏳ 工作休息节奏</span></div>
            <div class="pane-body flex-col justify-between">
              <div class="rule-box">
                <span class="rule-title">20-20-20 法则</span>
                <p class="rule-desc">
                  每工作 20 分钟，抬起头往 20 英尺（约 6 米）远的地方看 20 秒。
                </p>
              </div>

              <button class="brutal-action-btn primary w-full mt-4" @click="startTimer">
                🔔 开启 20min 提醒
              </button>
            </div>
          </div>
        </div>

        <!-- Knowledge Section -->
        <div class="brutal-pane know-pane mt-8">
          <div class="pane-header bg-white"><span class="text-black">💡 护眼知识库</span></div>
          <div class="pane-body">
            <div class="know-grid">
              <div
                v-for="k in knowledge"
                :key="k.title"
                class="know-card brutal-card relative-card"
              >
                <h4 class="know-title">{{ k.title }}</h4>
                <p class="know-text">{{ k.text }}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer class="footer mt-8">© 2026 LRM工具箱 - 护眼调节建议</footer>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { ElNotification } from 'element-plus';

  const now = ref(new Date());
  let timer: ReturnType<typeof setInterval> | null = null;

  const currentTimeStr = computed(() => {
    return now.value.toLocaleTimeString('zh-CN', { hour12: false });
  });

  const timePhase = computed(() => {
    const hour = now.value.getHours();
    if (hour >= 6 && hour < 10) {
      return {
        id: 'morning',
        name: '清晨时段',
        icon: '🌅',
        desc: '晨间自然光充足，适合高色温提高惊觉度。',
        brightness: 70,
        temp: 5500,
        tips: [
          '使用冷白光，帮助身体从睡眠中唤醒',
          '尽量利用窗外自然采光',
          '避免屏幕直对窗户造成反光'
        ],
        tips_extra: '此时段人体皮质醇水平较高，适合高强度用眼。'
      };
    } else if (hour >= 10 && hour < 17) {
      return {
        id: 'day',
        name: '日间时段',
        icon: '☀️',
        desc: '环境亮度最高，适当调高屏幕对比度。',
        brightness: 85,
        temp: 6500,
        tips: [
          '环境光强时增加亮度，避免用眼过度',
          '日光强，建议每小时远眺一次',
          '保持坐姿端正，眼睛距离屏幕50cm以上'
        ],
        tips_extra: '日光最强，注意避免屏幕炫光影响。'
      };
    } else if (hour >= 17 && hour < 21) {
      return {
        id: 'evening',
        name: '傍晚时段',
        icon: '🌆',
        desc: '光线逐渐变暗，建议过度到暖色调。',
        brightness: 50,
        temp: 4000,
        tips: ['开启屏幕防蓝光/护眼模式', '室内开启适度的环境补偿灯', '降低亮度，缓解全天视觉疲劳'],
        tips_extra: '开始减少蓝光摄入，有助于褪黑素分泌。'
      };
    } else {
      return {
        id: 'night',
        name: '深夜时段',
        icon: '🌙',
        desc: '极低亮度与深暖色，减少视网膜刺激。',
        brightness: 25,
        temp: 2700,
        tips: [
          '切换至完全暖色调，过滤有害蓝光',
          '绝对不要在全黑环境下仅看屏幕',
          '夜间每30分钟强制休息10分钟'
        ],
        tips_extra: '非必要不长时间用眼，保护黄斑区健康。'
      };
    }
  });

  const getTempBarStyle = () => {
    return { background: 'linear-gradient(to right, #ffcc33, #ffffff, #99ccff)' };
  };

  const getTempPosition = () => {
    const min = 2700;
    const max = 6500;
    return ((timePhase.value.temp - min) / (max - min)) * 90;
  };

  const knowledge = [
    {
      title: '为什么要调色温？',
      text: '夜间接触蓝光会抑制褪黑素分泌，破坏睡眠规律。暖色调对视网膜刺激更小。'
    },
    { title: '暗光下用眼的危害', text: '在黑暗中看屏幕会导致瞳孔散大，眼压升高，可能诱发青光眼。' },
    {
      title: '防蓝光真的有用吗？',
      text: '软件层面的过滤可减少视觉疲劳，但更重要的是减少高强度对焦时间。'
    }
  ];

  const startTimer = () => {
    ElNotification({
      title: '护眼提醒已开启',
      message: '开始 20 分钟计时，时间到了会通知您远眺。',
      type: 'success',
      duration: 3000
    });
    setTimeout(
      () => {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('护眼时间到！', { body: '请离开屏幕，看向 6 米外的物体保持 20 秒。' });
        } else {
          alert('【20-20-20法则】护眼时间到！\n请离开屏幕看向远方 20 秒。');
        }
      },
      20 * 60 * 1000
    );
  };

  onMounted(() => {
    timer = setInterval(() => {
      now.value = new Date();
    }, 1000);
    if ('Notification' in window) Notification.requestPermission();
  });
  onUnmounted(() => {
    if (timer) clearInterval(timer);
  });
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

  .brutal-wrapper {
    background-color: #fdfae5;
    background-image:
      linear-gradient(#e5e5e5 2px, transparent 2px),
      linear-gradient(90deg, #e5e5e5 2px, transparent 2px);
    background-size: 40px 40px;
    min-height: 100vh;
    padding: 2rem;
    box-sizing: border-box;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    color: #111;
  }
  .brutal-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }

  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.5rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0 #4b7bff;
    flex: 1;
    text-align: center;
  }
  .brutal-title span {
    color: #4b7bff;
    text-shadow: 4px 4px 0 #111;
  }

  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 6px 6px 0 #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }
  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0 #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0 0 0 #111;
  }

  .brutal-pane {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0 #111;
    min-width: 0;
    position: relative;
  }
  .mini-pane {
    padding: 0.5rem 1.25rem;
    box-shadow: 4px 4px 0 #111;
    text-align: center;
    background: #fff;
  }
  .time-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 800;
    color: #111;
  }
  .time-val {
    font-size: 1.25rem;
    font-weight: 900;
    font-family: 'IBM Plex Mono', monospace;
    color: #4b7bff;
  }

  .pane-header {
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.25rem;
  }
  .bg-black {
    background: #111;
    color: white;
  }
  .bg-yellow {
    background: #ffd900;
  }
  .bg-white {
    background: #fff;
  }
  .text-white {
    color: #fff;
  }
  .text-black {
    color: #111;
  }
  .pane-body {
    padding: 2rem;
  }

  .status-pane.morning {
    background: #fffae8;
  }
  .status-pane.day {
    background: #eef8ff;
  }
  .status-pane.evening {
    background: #fff1e5;
  }
  .status-pane.night {
    background: #f0f0f5;
  }

  .phase-info {
    display: flex;
    gap: 24px;
    align-items: center;
    margin-bottom: 2rem;
  }
  .phase-icon {
    font-size: 4.5rem;
    text-shadow: 4px 4px 0 #111;
    line-height: 1;
  }
  .phase-name {
    font-size: 2rem;
    font-weight: 900;
    font-family: 'Syne', sans-serif;
    margin: 0 0 0.5rem;
    text-transform: uppercase;
  }
  .phase-desc {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
  }

  .settings-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
  .brutal-card {
    border: 4px solid #111;
    padding: 1.5rem;
    background: #fff;
    box-shadow: 6px 6px 0 #111;
  }
  .setting-header {
    font-size: 1.1rem;
    font-weight: 800;
    font-family: 'Syne', sans-serif;
    margin-bottom: 1rem;
  }
  .setting-val {
    font-size: 2.5rem;
    font-weight: 900;
    font-family: 'IBM Plex Mono', monospace;
    margin-bottom: 1rem;
    color: #4b7bff;
  }

  .setting-bar {
    height: 16px;
    background: #fff;
    border: 3px solid #111;
    position: relative;
  }
  .bar-fill {
    height: 100%;
    background: #111;
    transition: width 0.5s ease;
  }
  .bar-dot {
    position: absolute;
    top: -8px;
    width: 26px;
    height: 26px;
    background: #fff;
    border: 4px solid #111;
    transition: left 0.5s ease;
  }

  .mt-4 {
    margin-top: 1rem;
  }
  .mt-6 {
    margin-top: 1.5rem;
  }
  .mt-8 {
    margin-top: 2rem;
  }

  .brutal-grid-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2.5rem;
  }
  .flex-col {
    display: flex;
    flex-direction: column;
  }
  .justify-between {
    justify-content: space-between;
    flex: 1;
  }

  .guide-list ul {
    padding-left: 1.5rem;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    font-weight: bold;
    font-size: 1rem;
    line-height: 1.5;
  }
  .rule-box {
    border: 4px dashed #111;
    padding: 1.5rem;
    background: #fdfae5;
  }
  .rule-title {
    font-weight: 900;
    font-size: 1.25rem;
    font-family: 'Syne', sans-serif;
    color: #4b7bff;
    display: block;
    margin-bottom: 0.5rem;
  }
  .rule-desc {
    font-weight: 600;
    margin: 0;
    font-size: 1rem;
  }

  .brutal-action-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 1rem 1.5rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.25rem;
    cursor: pointer;
    box-shadow: 6px 6px 0 #111;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
  }
  .brutal-action-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0 #111;
  }
  .brutal-action-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0 0 0 #111;
  }
  .brutal-action-btn.primary {
    background: #4b7bff;
    color: white;
  }
  .w-full {
    width: 100%;
  }

  .know-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
  .relative-card {
    transition: transform 0.1s;
  }
  .relative-card:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0 #111;
  }
  .know-title {
    font-weight: 900;
    font-size: 1.15rem;
    margin: 0 0 1rem;
    font-family: 'Syne', sans-serif;
  }
  .know-text {
    font-weight: 600;
    font-size: 0.95rem;
    margin: 0;
    line-height: 1.5;
  }

  .footer {
    text-align: center;
    font-weight: bold;
    font-size: 0.9rem;
    margin-bottom: 2rem;
  }

  @media (max-width: 900px) {
    .brutal-grid-layout,
    .settings-grid,
    .know-grid {
      grid-template-columns: 1fr;
    }
    .brutal-title {
      font-size: 2.5rem;
    }
  }

  /* Dark Mode */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-card,
  [data-theme='dark'] .mini-pane,
  [data-theme='dark'] .brutal-action-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn {
    box-shadow: 6px 6px 0 #eee;
  }
  [data-theme='dark'] .brutal-btn:hover,
  [data-theme='dark'] .relative-card:hover,
  [data-theme='dark'] .brutal-action-btn:hover {
    box-shadow: 9px 9px 0 #eee;
  }
  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0 #eee;
  }
  [data-theme='dark'] .mini-pane {
    box-shadow: 4px 4px 0 #eee;
  }
  [data-theme='dark'] .brutal-card {
    box-shadow: 6px 6px 0 #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0 #eee;
  }
  [data-theme='dark'] .time-label {
    color: #aaa;
  }

  [data-theme='dark'] .status-pane {
    background: #222 !important;
  }
  [data-theme='dark'] .bg-black {
    background: #333;
  }
  [data-theme='dark'] .bg-yellow,
  [data-theme='dark'] .bg-white {
    background: #b28f00;
    color: #fff;
    text-shadow: none;
    border-color: #eee;
  }
  [data-theme='dark'] .text-black,
  [data-theme='dark'] .brutal-action-btn.primary {
    background: #2a4eb2;
    border-color: #eee;
    color: #fff;
  }
  [data-theme='dark'] .brutal-action-btn.primary {
    box-shadow: 6px 6px 0 #eee;
  }

  [data-theme='dark'] .setting-val {
    color: #6b8cff;
  }
  [data-theme='dark'] .setting-bar,
  [data-theme='dark'] .bar-dot {
    border-color: #eee;
  }
  [data-theme='dark'] .bar-fill {
    background: #eee;
  }
  [data-theme='dark'] .rule-box {
    background: #333;
    border-color: #eee;
  }
  [data-theme='dark'] .rule-title {
    color: #ff8b8b;
  }
</style>
