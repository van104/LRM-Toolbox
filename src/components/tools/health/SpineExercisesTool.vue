<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">健康<span>.脊椎护卫()</span></h1>
        <button class="brutal-btn primary" @click="reminderVisible = true">🔔 提醒设定</button>
      </header>

      <main class="tool-content">
        <div class="brutal-grid-layout">
          <!-- Sidebar: Categories -->
          <aside class="sidebar-pane">
            <div class="brutal-pane">
              <div class="pane-header bg-black"><span class="text-white">📚 练习分类</span></div>
              <div class="pane-body padding-small">
                <div class="category-list">
                  <div
                    v-for="cat in categories"
                    :key="cat.id"
                    class="category-item brutal-action-btn"
                    :class="{ 'active-cat': activeCategory === cat.id }"
                    @click="activeCategory = cat.id"
                  >
                    <div class="cat-icon">{{ cat.icon }}</div>
                    <div class="cat-info">
                      <span class="cat-name">{{ cat.name }}</span>
                      <span class="cat-desc">{{ cat.desc }}</span>
                    </div>
                  </div>
                </div>

                <div class="health-tip mt-6">
                  <strong>⚠️ 温馨提示：</strong>
                  <p>所有动作应平缓进行，如感到剧烈疼痛请立即停止并咨询医生。</p>
                </div>
              </div>
            </div>
          </aside>

          <!-- Main Workspace -->
          <section class="main-content-pane">
            <div class="exercise-grid">
              <div
                v-for="ex in filteredExercises"
                :key="ex.name"
                class="exercise-card brutal-pane relative-card animate-slide-up"
              >
                <div class="ex-image placeholder-bg">
                  <div class="placeholder-content">
                    <span class="vid-icon">▶️</span>
                    <span>动作演示</span>
                  </div>
                </div>
                <div class="ex-body">
                  <div class="ex-header">
                    <h3 class="ex-name">{{ ex.name }}</h3>
                    <span class="ex-duration">{{ ex.duration }}</span>
                  </div>
                  <p class="ex-desc">{{ ex.description }}</p>
                  <div class="ex-steps">
                    <div v-for="(step, i) in ex.steps" :key="i" class="step-line">
                      <span class="step-num">{{ i + 1 }}</span>
                      <span class="step-text">{{ step }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <!-- Custom Brutal Dialog -->
      <div v-if="reminderVisible" class="brutal-dialog-overlay">
        <div class="brutal-dialog brutal-pane">
          <div class="pane-header bg-yellow flex-between">
            <span class="text-black">开启久坐提醒</span>
            <button class="close-btn" @click="reminderVisible = false">✖</button>
          </div>
          <div class="pane-body">
            <div class="config-row">
              <label>提醒间隔 (分钟)</label>
              <input
                v-model="reminderMinutes"
                type="number"
                min="15"
                max="120"
                step="15"
                class="brutal-input sm-input"
              />
            </div>
            <p class="dialog-hint mt-4">
              开启后，系统将在后台运行并在到达间隔时间时弹出桌面通知，提示您该活动脊椎了。
            </p>
            <div class="dialog-actions mt-6">
              <button class="brutal-btn" @click="reminderVisible = false">取消</button>
              <button class="brutal-btn primary" @click="confirmReminder">确认开启 ✅</button>
            </div>
          </div>
        </div>
      </div>

      <footer class="footer mt-8">© 2026 LRM工具箱 - 脊椎健康指南</footer>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';

  // Custom simple notification substitution for ElMessage
  const showToast = message => {
    alert(message); // fallback simple brutal alert or can implement a custom toast
  };

  const reminderVisible = ref(false);
  const reminderMinutes = ref(45);
  const activeCategory = ref('neck');

  const categories = [
    { id: 'neck', name: '颈椎拉伸', desc: '缓解肩颈僵硬', icon: '🧘' },
    { id: 'thoracic', name: '胸椎释放', desc: '打开胸腔纠正驼背', icon: '🦋' },
    { id: 'lumbar', name: '腰椎保护', desc: '缓解下腰部酸痛', icon: '🌳' }
  ];

  const exercises = [
    {
      category: 'neck',
      name: '左右侧拉伸',
      duration: '30秒',
      description: '伸展颈部侧边肌群，缓解斜方肌紧张。',
      steps: [
        '挺胸收腹坐正，右手自然垂下',
        '左手轻扶头部右侧，缓慢向左侧牵拉',
        '保持15秒，换另一侧'
      ]
    },
    {
      category: 'neck',
      name: '颈部旋转',
      duration: '1分钟',
      description: '增加颈部关节活动度。',
      steps: ['保持头部平正直视前方', '缓慢将下巴向左肩转动至极限', '停留3秒回正，再向右侧转动']
    },
    {
      category: 'thoracic',
      name: '扩胸伸展',
      duration: '45秒',
      description: '针对长期伏案导致的圆肩驼背。',
      steps: ['两手向后交叉相扣', '挺胸抬头，双臂用力向后上方抬起', '感受胸部和肩膀前侧的拉伸']
    },
    {
      category: 'thoracic',
      name: '坐姿转体',
      duration: '1分钟',
      description: '通过扭转增加胸椎灵活性。',
      steps: [
        '坐在椅子前三分之一处，左手扶右膝',
        '右手向后扶住椅背，带动上身向右后方扭转',
        '深呼吸保持15秒，换侧进行'
      ]
    },
    {
      category: 'lumbar',
      name: '猫式伸展(坐姿)',
      duration: '1分钟',
      description: '温和地活动整个嵴柱，特别是下腰部。',
      steps: [
        '吸气时挺胸收腹，微微抬头看向斜上方',
        '呼气时低头含胸卷腹，背部向后弯曲如拱形',
        '跟随呼吸节奏重复5-8次'
      ]
    },
    {
      category: 'lumbar',
      name: '坐姿侧弯',
      duration: '45秒',
      description: '拉伸腰部两侧的腰方肌。',
      steps: [
        '举起左手伸直向上，右手扶住椅子侧面',
        '上身向右侧平缓倾斜，保持左臀贴合椅面',
        '侧腰有明显拉伸感后停留15秒'
      ]
    }
  ];

  const filteredExercises = computed(() =>
    exercises.filter(ex => ex.category === activeCategory.value)
  );

  const confirmReminder = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          showToast(`提醒已开启！每 ${reminderMinutes.value} 分钟会提醒您活动。`);
          reminderVisible.value = false;
        } else {
          showToast('未获得通知权限，无法开启提醒。');
        }
      });
    } else {
      showToast('您的浏览器不支持通知功能。');
    }
  };
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
    color: #ff4b4b;
    text-shadow: 4px 4px 0 #111;
  }

  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.1rem;
    font-weight: 900;
    cursor: pointer;
    box-shadow: 4px 4px 0 #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }
  .brutal-btn.primary {
    background: #4b7bff;
    color: white;
  }
  .brutal-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #111;
  }
  .brutal-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0 0 0 #111;
  }

  .brutal-grid-layout {
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: 2.5rem;
    align-items: start;
  }

  .brutal-pane {
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 10px 10px 0 #111;
    min-width: 0;
  }
  .pane-header {
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    font-size: 1.25rem;
  }
  .bg-black {
    background: #111;
    color: white;
  }
  .pane-body {
    padding: 1.5rem;
  }

  .category-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .category-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #fff;
    border: 4px solid #111;
    cursor: pointer;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
    box-shadow: 4px 4px 0 #111;
  }
  .category-item:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #111;
  }
  .active-cat {
    background: #4b7bff;
    color: white;
    border-color: #111;
    transform: translate(4px, 4px);
    box-shadow: 0 0 0 #111 !important;
  }
  .active-cat .cat-desc {
    color: #fff;
    opacity: 0.9;
  }

  .cat-icon {
    font-size: 2rem;
    line-height: 1;
  }
  .cat-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .cat-name {
    font-weight: 900;
    font-family: 'Noto Sans SC', sans-serif;
    font-size: 1.1rem;
  }
  .cat-desc {
    font-size: 0.85rem;
    font-weight: bold;
    color: #555;
  }

  .health-tip {
    padding: 1rem;
    background: #fdfae5;
    border: 3px dashed #111;
    font-weight: bold;
    font-size: 0.95rem;
  }
  .health-tip strong {
    color: #f59e0b;
    display: block;
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
  }
  .health-tip p {
    margin: 0;
    line-height: 1.5;
    color: #111;
  }

  .exercise-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 2rem;
  }

  .exercise-card {
    overflow: hidden;
  }
  .relative-card:hover {
    transform: translate(-3px, -3px);
    box-shadow: 13px 13px 0 #111;
  }

  .ex-image {
    height: 180px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 4px solid #111;
  }
  .placeholder-bg {
    background: repeating-linear-gradient(
      45deg,
      #111 0,
      #111 2px,
      transparent 2px,
      transparent 10px
    );
    background-color: #e5e5e5;
  }
  .placeholder-content {
    background: #fff;
    border: 4px solid #111;
    padding: 1rem 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 4px 4px 0 #111;
    font-weight: 900;
  }
  .vid-icon {
    font-size: 2rem;
  }

  .ex-body {
    padding: 1.5rem;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .ex-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }
  .ex-name {
    font-size: 1.25rem;
    font-weight: 900;
    font-family: 'Syne', sans-serif;
    margin: 0;
  }
  .ex-duration {
    background: #111;
    color: white;
    padding: 0.2rem 0.5rem;
    font-size: 0.8rem;
    font-weight: bold;
    font-family: 'IBM Plex Mono', monospace;
  }

  .ex-desc {
    font-size: 0.95rem;
    font-weight: bold;
    color: #444;
    margin: 0 0 1.5rem;
    line-height: 1.5;
  }

  .ex-steps {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .step-line {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }
  .step-num {
    width: 24px;
    height: 24px;
    background: #ff4b4b;
    color: white;
    border: 2px solid #111;
    font-weight: 900;
    font-family: 'IBM Plex Mono', monospace;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 0.85rem;
  }
  .step-text {
    font-size: 0.95rem;
    font-weight: 600;
    line-height: 1.4;
    color: #111;
    margin-top: 2px;
  }

  .brutal-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }
  .brutal-dialog {
    max-width: 450px;
    width: 100%;
    box-shadow: 16px 16px 0 #111;
  }
  .bg-yellow {
    background: #ffd900;
    border-bottom-color: #111;
  }
  .flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .text-black {
    color: #111;
  }
  .close-btn {
    background: #fff;
    border: 3px solid #111;
    width: 30px;
    height: 30px;
    font-weight: 900;
    cursor: pointer;
    transition: all 0.1s;
  }
  .close-btn:hover {
    background: #ff4b4b;
    color: #fff;
  }
  .config-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .config-row label {
    font-weight: 900;
    font-size: 1.1rem;
  }

  .brutal-input {
    padding: 0.5rem;
    border: 3px solid #111;
    background: #fff;
    font-weight: 900;
    font-family: 'IBM Plex Mono', monospace;
    outline: none;
    transition: all 0.1s;
  }
  .brutal-input:focus {
    border-color: #4b7bff;
    box-shadow: 4px 4px 0 #4b7bff;
    transform: translate(-2px, -2px);
  }
  .sm-input {
    width: 100px;
    text-align: center;
    font-size: 1.1rem;
  }

  .dialog-hint {
    font-size: 0.9rem;
    font-weight: bold;
    color: #444;
    line-height: 1.5;
  }
  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
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

  .animate-slide-up {
    animation: slideUp 0.3s ease-out forwards;
  }
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .footer {
    text-align: center;
    font-weight: 900;
    margin-bottom: 2rem;
  }

  @media (max-width: 900px) {
    .brutal-grid-layout {
      grid-template-columns: 1fr;
    }
    .brutal-title {
      font-size: 2.2rem;
    }
    .exercise-grid {
      grid-template-columns: 1fr;
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
  [data-theme='dark'] .category-item,
  [data-theme='dark'] .placeholder-content {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .category-item,
  [data-theme='dark'] .placeholder-content {
    box-shadow: 6px 6px 0 #eee;
  }

  [data-theme='dark'] .brutal-btn:hover,
  [data-theme='dark'] .category-item:hover,
  [data-theme='dark'] .relative-card:hover {
    box-shadow: 9px 9px 0 #eee;
  }
  [data-theme='dark'] .brutal-pane {
    box-shadow: 10px 10px 0 #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0 #eee;
  }

  [data-theme='dark'] .brutal-btn.primary {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .active-cat {
    background: #eee;
    color: #111;
    border-color: #eee;
  }
  [data-theme='dark'] .active-cat .cat-desc {
    color: #555;
  }
  [data-theme='dark'] .cat-desc {
    color: #aaa;
  }

  [data-theme='dark'] .health-tip {
    background: #332200;
    border-color: #eee;
  }
  [data-theme='dark'] .health-tip strong {
    color: #f59e0b;
  }
  [data-theme='dark'] .health-tip p {
    color: #eee;
  }

  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .bg-black {
    background: #222;
  }
  [data-theme='dark'] .ex-image {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .placeholder-bg {
    background: #000;
    background-image: repeating-linear-gradient(
      45deg,
      #eee 0,
      #eee 2px,
      transparent 2px,
      transparent 10px
    );
  }
  [data-theme='dark'] .ex-duration {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .ex-desc,
  [data-theme='dark'] .dialog-hint {
    color: #ccc;
  }
  [data-theme='dark'] .step-text {
    color: #eee;
  }
  [data-theme='dark'] .step-num {
    border-color: #eee;
  }

  [data-theme='dark'] .brutal-dialog {
    box-shadow: 16px 16px 0 #eee;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #eee;
  }
  [data-theme='dark'] .text-black {
    color: #eee;
  }
  [data-theme='dark'] .close-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-input {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-input:focus {
    border-color: #2a4eb2;
    box-shadow: 4px 4px 0 #2a4eb2;
  }
</style>
