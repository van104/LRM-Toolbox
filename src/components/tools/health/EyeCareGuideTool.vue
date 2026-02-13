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
        <h1 class="tool-title">护眼调节建议</h1>
        <span class="tool-subtitle">Eye Care Setting Guide</span>
      </div>
      <div class="header-right">
        <div class="current-time-box">
          <span class="time-label">当前时间</span>
          <span class="time-val">{{ currentTimeStr }}</span>
        </div>
      </div>
    </header>

    <main class="tool-content">
      <div class="main-layout">
        <div class="status-card glass-card" :class="timePhase.id">
          <div class="phase-info">
            <div class="phase-icon">{{ timePhase.icon }}</div>
            <div class="phase-text">
              <h2 class="phase-name">当前时段：{{ timePhase.name }}</h2>
              <p class="phase-desc">{{ timePhase.desc }}</p>
            </div>
          </div>

          <div class="settings-grid">
            <div class="setting-item">
              <div class="setting-header">
                <el-icon><Sunny /></el-icon>
                <span>建议亮度</span>
              </div>
              <div class="setting-val">{{ timePhase.brightness }}%</div>
              <div class="setting-bar">
                <div class="bar-fill" :style="{ width: timePhase.brightness + '%' }"></div>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-header">
                <el-icon><Odometer /></el-icon>
                <span>建议色温</span>
              </div>
              <div class="setting-val">{{ timePhase.temp }}K</div>
              <div class="setting-bar temp-bar" :style="getTempBarStyle()">
                <div class="bar-dot" :style="{ left: getTempPosition() + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="guide-grid mt-8">
          <div class="guide-card glass-card">
            <h3 class="guide-title">
              <el-icon><Monitor /></el-icon> 物理环境建议
            </h3>
            <ul class="guide-list">
              <li v-for="tip in timePhase.tips" :key="tip">{{ tip }}</li>
            </ul>
          </div>

          <div class="guide-card glass-card">
            <h3 class="guide-title">
              <el-icon><Clock /></el-icon> 工作休息节奏
            </h3>
            <div class="rule-box">
              <span class="rule-title">20-20-20 法则</span>
              <p class="rule-desc">每工作 20 分钟，抬起头往 20 英尺（约 6 米）远的地方看 20 秒。</p>
            </div>
            <el-button type="primary" class="w-full mt-4" @click="startTimer"
              >开启 20min 提醒</el-button
            >
          </div>
        </div>

        <!-- Knowledge Section -->
        <section class="knowledge-section mt-8">
          <h3 class="section-title">护眼小知识</h3>
          <div class="know-grid">
            <div v-for="k in knowledge" :key="k.title" class="know-card">
              <h4 class="know-title">{{ k.title }}</h4>
              <p class="know-text">{{ k.text }}</p>
            </div>
          </div>
        </section>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 护眼调节建议</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { ArrowLeft, Sunny, Odometer, Monitor, Clock } from '@element-plus/icons-vue';
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
        desc: '晨间自然光充足，适合高色温提高警觉度。',
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
          '由于光线强，建议每小时远眺一次',
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
        tips: ['开启屏幕防蓝光/护眼模式', '室内开启适度的环境补偿灯', '降低亮度，缓解全天用眼疲劳'],
        tips_extra: '开始减少蓝光摄入，有助于褪黑素分泌准备。'
      };
    } else {
      return {
        id: 'night',
        name: '深夜时段',
        icon: '🌙',
        desc: '环境幽暗，极低亮度与深暖色，减少视网膜刺激。',
        brightness: 25,
        temp: 2700,
        tips: [
          '切换至完全暖色调，过滤有害蓝光',
          '绝对不要在全黑环境下仅使用屏幕',
          '建议每30分钟强制休息10分钟'
        ],
        tips_extra: '非必要不长时间用眼，保护黄斑区健康。'
      };
    }
  });

  const getTempBarStyle = () => {
    return {
      background: 'linear-gradient(to right, #ffcc33, #ffffff, #99ccff)'
    };
  };

  const getTempPosition = () => {
    // Range 2700K (0%) to 6500K (100%)
    const min = 2700;
    const max = 6500;
    const val = timePhase.value.temp;
    return ((val - min) / (max - min)) * 90; // Apply a little margin
  };

  const knowledge = [
    {
      title: '为什么要调色温？',
      text: '夜间接触蓝光会抑制褪黑素分泌，破坏睡眠规律。暖色调（低色温）对视网膜刺激更小。'
    },
    {
      title: '暗光下用眼的危害',
      text: '在黑暗中看屏幕会导致瞳孔散大，眼压升高，长期可能诱发青光眼或黄斑病变。'
    },
    {
      title: '防蓝光真的有用吗？',
      text: '软件层面的过滤可以减少视觉疲劳，但最重要的还是减少用眼时间和增加休息。'
    }
  ];

  const startTimer = () => {
    ElNotification({
      title: '护眼提醒',
      message: '已为您开启 20-20-20 定时提醒，请保持当前页面开启。',
      type: 'success'
    });

    setTimeout(
      () => {
        if (Notification.permission === 'granted') {
          new Notification('护眼时间到！', { body: '请离开屏幕看向远方 20 秒。' });
        } else {
          alert('护眼时间到！请离开屏幕看向远方 20 秒。');
        }
      },
      20 * 60 * 1000
    );
  };

  onMounted(() => {
    timer = setInterval(() => {
      now.value = new Date();
    }, 1000);
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  });

  onUnmounted(() => {
    if (timer) clearInterval(timer);
  });
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
    background: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
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
    color: #1e293b;
    margin: 0;
  }
  .tool-subtitle {
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
  }

  .current-time-box {
    text-align: right;
  }
  .time-label {
    display: block;
    font-size: 0.65rem;
    color: #94a3b8;
    font-weight: 700;
    text-transform: uppercase;
  }
  .time-val {
    font-size: 1.1rem;
    font-weight: 800;
    color: #3b82f6;
    font-family: 'JetBrains Mono', monospace;
  }

  .tool-content {
    flex: 1;
    padding: 2rem;
    max-width: 1000px;
    margin: 0 auto;
    width: 100%;
  }

  .glass-card {
    background: #fff;
    border-radius: 24px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.02);
  }

  .status-card {
    padding: 32px;
    position: relative;
    overflow: hidden;
    transition: all 0.5s;
  }

  /* Phase styles */
  .status-card.morning {
    background: linear-gradient(135deg, #fff7ed 0%, #fff 100%);
  }
  .status-card.day {
    background: linear-gradient(135deg, #f0f9ff 0%, #fff 100%);
  }
  .status-card.evening {
    background: linear-gradient(135deg, #fffbeb 0%, #fff 100%);
  }
  .status-card.night {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  }

  .phase-info {
    display: flex;
    gap: 24px;
    align-items: center;
    margin-bottom: 40px;
  }
  .phase-icon {
    font-size: 3.5rem;
  }
  .phase-name {
    font-size: 1.4rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }
  .phase-desc {
    color: #64748b;
    font-size: 0.95rem;
    margin-top: 4px;
  }

  .settings-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }

  .setting-item {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .setting-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
  }
  .setting-val {
    font-size: 1.8rem;
    font-weight: 800;
    color: #1e293b;
  }

  .setting-bar {
    height: 8px;
    background: #e2e8f0;
    border-radius: 4px;
    position: relative;
  }
  .bar-fill {
    height: 100%;
    background: #3b82f6;
    border-radius: 4px;
    transition: width 0.5s ease;
  }
  .temp-bar {
    height: 12px;
    border-radius: 6px;
  }
  .bar-dot {
    position: absolute;
    top: -4px;
    width: 20px;
    height: 20px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    border: 2px solid #334155;
    transition: left 0.5s ease;
  }

  .guide-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
  .guide-card {
    padding: 24px;
  }
  .guide-title {
    font-size: 1rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .guide-list {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .guide-list li {
    font-size: 0.9rem;
    color: #475569;
    position: relative;
    padding-left: 20px;
  }
  .guide-list li::before {
    content: '•';
    position: absolute;
    left: 0;
    color: #3b82f6;
    font-weight: bold;
  }

  .rule-box {
    background: #f8fafc;
    padding: 16px;
    border-radius: 12px;
    border: 1px dashed #cbd5e1;
  }
  .rule-title {
    font-weight: 800;
    color: #3b82f6;
    font-size: 0.9rem;
    display: block;
    margin-bottom: 4px;
  }
  .rule-desc {
    font-size: 0.85rem;
    color: #475569;
    line-height: 1.5;
  }

  .section-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 1.5rem;
  }
  .know-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }
  .know-card {
    background: #fff;
    padding: 20px;
    border-radius: 16px;
  }
  .know-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: #3b82f6;
    margin-bottom: 8px;
  }
  .know-text {
    font-size: 0.85rem;
    color: #64748b;
    line-height: 1.6;
  }

  @media (max-width: 768px) {
    .settings-grid,
    .guide-grid,
    .know-grid {
      grid-template-columns: 1fr;
    }
  }

  .w-full {
    width: 100%;
  }
  .mt-8 {
    margin-top: 2rem;
  }
  .footer {
    text-align: center;
    padding: 2rem;
    color: #94a3b8;
    font-size: 0.85rem;
  }
</style>
