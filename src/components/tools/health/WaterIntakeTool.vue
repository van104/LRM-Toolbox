<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">健康<span>.饮水记录()</span></h1>
      </header>

      <main class="tool-content">
        <div class="brutal-grid-layout">
          <!-- Left Panel: Settings -->
          <aside class="sidebar-pane">
            <div class="brutal-pane">
              <div class="pane-header bg-black">
                <span class="text-white">⚙️ 身体参数与环境</span>
              </div>
              <div class="pane-body padding-small">
                <div class="input-group">
                  <label>体重 (kg)</label>
                  <input
                    v-model="config.weight"
                    type="number"
                    min="30"
                    max="200"
                    class="brutal-input sm-input"
                  />
                </div>

                <div class="input-group mt-6">
                  <label>活动强度</label>
                  <select v-model="config.activityLevel" class="brutal-select">
                    <option value="low">低强度 (久坐)</option>
                    <option value="med">中强度</option>
                    <option value="high">高强度</option>
                  </select>
                </div>

                <div class="input-group mt-6">
                  <label>当前季节</label>
                  <select v-model="config.season" class="brutal-select">
                    <option value="normal">春 / 秋 (气候适宜)</option>
                    <option value="hot">夏季 (炎热出汗)</option>
                    <option value="cold">冬季 (寒冷干燥)</option>
                  </select>
                </div>

                <div class="goal-info mt-8 bg-blue">
                  <span class="goal-label">建议每日饮水量</span>
                  <span class="goal-value">{{ recommendedIntake }} <small>ml</small></span>
                </div>

                <button class="brutal-action-btn mt-6 w-full" @click="resetProgress">
                  ↻ 重置今日进度
                </button>
              </div>
            </div>
          </aside>

          <!-- Main Workspace -->
          <section class="main-content-pane">
            <div class="brutal-pane">
              <div class="pane-header bg-blue text-white">
                <span class="text-white">💧 今日补水情况</span>
              </div>
              <div class="pane-body progress-container">
                <div class="progress-section">
                  <div class="brutal-bottle">
                    <div class="bottle-water" :style="{ height: progressPercent + '%' }"></div>
                    <div class="bottle-cap"></div>
                    <span v-if="progressPercent > 5" class="bottle-percent"
                      >{{ Math.round(progressPercent) }}%</span
                    >
                  </div>

                  <div class="stats-panel">
                    <div class="brutal-stat-box bg-white">
                      <span class="stat-label">已饮用</span>
                      <span class="stat-value text-blue">{{ todayTotal }} <small>ml</small></span>
                    </div>
                    <div class="brutal-stat-box bg-white mt-4 relative-card">
                      <span class="stat-label">剩余目标</span>
                      <span class="stat-value"
                        >{{ Math.max(0, recommendedIntake - todayTotal) }} <small>ml</small></span
                      >
                    </div>
                  </div>
                </div>

                <div class="action-grid mt-8">
                  <button
                    v-for="amount in quickAddOptions"
                    :key="amount"
                    class="quick-add-btn"
                    @click="addWater(amount)"
                  >
                    <span class="icon">⚗️</span>
                    <span class="amount">+{{ amount }}ml</span>
                  </button>
                  <button class="quick-add-btn custom-btn" @click="showCustomAdd = true">
                    <span class="icon">➕</span>
                    <span class="amount">自定义</span>
                  </button>
                </div>

                <div class="history-section mt-8">
                  <h4 class="history-title">📅 今日记录</h4>
                  <div v-if="history.length" class="history-list">
                    <div
                      v-for="(record, idx) in history"
                      :key="idx"
                      class="history-item relative-card"
                    >
                      <span class="time">{{ record.time }}</span>
                      <span class="amt">{{ record.amount }} ml</span>
                      <button class="del-btn" @click="removeRecord(idx)">✖</button>
                    </div>
                  </div>
                  <div v-else class="empty-history text-center p-4">[ 还没有任何饮水记录 ]</div>
                </div>
              </div>
            </div>

            <!-- Custom Add Dialog -->
            <div v-if="showCustomAdd" class="brutal-dialog-overlay">
              <div class="brutal-dialog brutal-pane">
                <div class="pane-header bg-black flex-between">
                  <span class="text-white">自定义饮水量</span>
                  <button class="close-btn" @click="showCustomAdd = false">✖</button>
                </div>
                <div class="pane-body">
                  <div class="config-row">
                    <label>补水 (ml)</label>
                    <input
                      v-model="customAmt"
                      type="number"
                      min="10"
                      max="1000"
                      step="10"
                      class="brutal-input sm-input"
                    />
                  </div>
                  <div class="dialog-actions mt-8">
                    <button class="brutal-btn" @click="showCustomAdd = false">取消</button>
                    <button class="brutal-btn primary" @click="handleCustomAdd">确认添加 🚰</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="disclaimer-brutal mt-8">
              <strong>⚠️ 健康数据提示</strong>
              <p>
                饮水建议基于通用公式计算，具体需求量可能因气候、疾病、运动强度等因素而异。如有疑问请咨询专业营养师。
              </p>
            </div>
          </section>
        </div>
      </main>

      <footer class="footer mt-8">© 2026 LRM工具箱 - 饮水记录器</footer>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onMounted, watch } from 'vue';

  // Custom simple notification substitution
  const showToast = message => {
    alert(message); // fallback simple brutal alert
  };

  const config = reactive({
    weight: 65,
    activityLevel: 'low',
    season: 'normal'
  });

  const todayTotal = ref(0);
  const history = ref([]);
  const showCustomAdd = ref(false);
  const customAmt = ref(200);

  const quickAddOptions = [100, 200, 300, 500];

  const recommendedIntake = computed(() => {
    let base = config.weight * 35;
    if (config.activityLevel === 'med') base += 500;
    if (config.activityLevel === 'high') base += 1000;

    // Season adjustment
    if (config.season === 'hot') base += 500;

    return base;
  });

  const progressPercent = computed(() => {
    return Math.min(100, (todayTotal.value / recommendedIntake.value) * 100);
  });

  const addWater = amt => {
    todayTotal.value += amt;
    history.value.unshift({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      amount: amt
    });
    saveData();
    if (progressPercent.value >= 100 && todayTotal.value - amt < recommendedIntake.value) {
      showToast('干得漂亮！您已达成今日饮水目标 ✨');
    }
  };

  const handleCustomAdd = () => {
    addWater(customAmt.value);
    showCustomAdd.value = false;
  };

  const removeRecord = idx => {
    const amt = history.value[idx].amount;
    todayTotal.value -= amt;
    history.value.splice(idx, 1);
    saveData();
  };

  const resetProgress = () => {
    todayTotal.value = 0;
    history.value = [];
    saveData();
  };

  const saveData = () => {
    const data = {
      total: todayTotal.value,
      history: history.value,
      config: config,
      date: new Date().toDateString()
    };
    localStorage.setItem('lrm-water-tracker', JSON.stringify(data));
  };

  onMounted(() => {
    const saved = localStorage.getItem('lrm-water-tracker');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === new Date().toDateString()) {
        todayTotal.value = parsed.total || 0;
        history.value = parsed.history || [];
      }
      if (parsed.config) {
        Object.assign(config, parsed.config);
      }
    }
  });

  watch([() => config.weight, () => config.activityLevel, () => config.season], saveData);
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
    margin-bottom: 3rem;
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
    font-size: 1.1rem;
    font-weight: 900;
    cursor: pointer;
    box-shadow: 6px 6px 0 #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }
  .brutal-btn.primary {
    background: #4b7bff;
    color: white;
  }
  .brutal-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 8px 8px 0 #111;
  }
  .brutal-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0 0 0 #111;
  }

  .brutal-grid-layout {
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: 3rem;
    align-items: start;
  }

  .brutal-pane {
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0 #111;
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
  .bg-blue {
    background: #4b7bff;
    color: white;
  }
  .bg-white {
    background: #fff;
  }
  .text-white {
    color: #fff;
  }
  .text-blue {
    color: #4b7bff;
    font-size: 2.5rem !important;
  }
  .pane-body {
    padding: 1.5rem;
  }
  .padding-small {
    padding: 1.5rem;
  }
  .p-4 {
    padding: 1rem;
  }
  .text-center {
    text-align: center;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .input-group label {
    font-weight: 900;
    font-size: 1.1rem;
    font-family: 'Noto Sans SC', sans-serif;
  }

  .brutal-input,
  .brutal-select {
    width: 100%;
    padding: 0.75rem;
    font-size: 1.1rem;
    border: 3px solid #111;
    background: #fff;
    font-weight: 900;
    box-sizing: border-box;
    font-family: 'IBM Plex Mono', monospace;
    transition: all 0.1s;
    box-shadow: 4px 4px 0 #111;
  }
  .brutal-input:focus,
  .brutal-select:focus {
    outline: none;
    box-shadow: 6px 6px 0 #4b7bff;
    border-color: #4b7bff;
    transform: translate(-2px, -2px);
  }

  .goal-info {
    border: 4px solid #111;
    box-shadow: 6px 6px 0 #111;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  .goal-label {
    font-size: 1rem;
    font-weight: 900;
  }
  .goal-value {
    font-size: 2.5rem;
    font-weight: 900;
    font-family: 'Syne', monospace;
    line-height: 1;
  }
  .goal-value small {
    font-size: 1.2rem;
    font-weight: 900;
  }

  .brutal-action-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 1rem;
    font-family: 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1.1rem;
    cursor: pointer;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
    box-shadow: 6px 6px 0 #111;
  }
  .w-full {
    width: 100%;
  }
  .brutal-action-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 8px 8px 0 #111;
  }
  .brutal-action-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0 0 0 #111;
  }

  .progress-section {
    display: flex;
    justify-content: space-around;
    align-items: center;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .brutal-bottle {
    width: 140px;
    height: 320px;
    border: 6px solid #111;
    border-radius: 10px 10px 30px 30px;
    position: relative;
    background: #fff;
    box-shadow: 12px 12px 0 #111;
    overflow: hidden;
  }
  .bottle-cap {
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 20px;
    background: #111;
    border-radius: 5px 5px 0 0;
    z-index: 10;
  }
  .bottle-water {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: repeating-linear-gradient(45deg, #4b7bff, #4b7bff 10px, #2a4eb2 10px, #2a4eb2 20px);
    transition: height 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    border-top: 6px solid #111;
  }
  .bottle-percent {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 2.5rem;
    font-weight: 900;
    color: #fff;
    text-shadow: 4px 4px 0 #111;
    font-family: 'Syne', sans-serif;
    z-index: 2;
  }

  .stats-panel {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex: 1;
    min-width: 200px;
  }
  .brutal-stat-box {
    border: 4px solid #111;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    box-shadow: 8px 8px 0 #111;
  }
  .relative-card {
    transition: transform 0.1s;
  }
  .relative-card:hover {
    transform: translate(-3px, -3px);
    box-shadow: 11px 11px 0 #111;
  }

  .stat-label {
    font-size: 1.1rem;
    font-weight: 900;
  }
  .stat-value {
    font-size: 2rem;
    font-weight: 900;
    line-height: 1;
    font-family: 'Syne', sans-serif;
  }
  .stat-value small {
    font-size: 1rem;
    font-family: 'Noto Sans SC', sans-serif;
  }

  .action-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 1.5rem;
  }
  .quick-add-btn {
    background: #fff;
    border: 4px solid #111;
    border-radius: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.5rem 1rem;
    cursor: pointer;
    transition: all 0.1s;
    box-shadow: 6px 6px 0 #111;
    gap: 0.5rem;
  }
  .quick-add-btn:hover {
    transform: translate(-4px, -4px);
    box-shadow: 10px 10px 0 #111;
    border-color: #4b7bff;
  }
  .quick-add-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0 0 0 #111;
  }
  .quick-add-btn .icon {
    font-size: 2.5rem;
    line-height: 1;
  }
  .quick-add-btn .amount {
    font-weight: 900;
    font-size: 1.1rem;
    font-family: 'IBM Plex Mono', monospace;
  }
  .custom-btn {
    background: #ffd900;
  }
  .custom-btn:hover {
    border-color: #111;
    background: #ffe44d;
  }

  .history-section {
    border-top: 4px dashed #111;
    padding-top: 2rem;
  }
  .history-title {
    font-size: 1.25rem;
    font-weight: 900;
    margin: 0 0 1rem;
    font-family: 'Syne', sans-serif;
  }
  .history-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 250px;
    overflow-y: auto;
  }
  .history-item {
    background: #fff;
    border: 3px solid #111;
    padding: 0.75rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 4px 4px 0 #111;
  }
  .history-item .time {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 900;
  }
  .history-item .amt {
    font-family: 'Syne', monospace;
    font-weight: 900;
    font-size: 1.25rem;
  }
  .del-btn {
    background: transparent;
    border: 2px solid transparent;
    width: 30px;
    height: 30px;
    color: #ff4b4b;
    cursor: pointer;
    font-weight: 900;
  }
  .del-btn:hover {
    background: #ff4b4b;
    color: #fff;
    border-color: #111;
  }
  .empty-history {
    border: 3px dashed #111;
    font-weight: 900;
    font-family: 'IBM Plex Mono', monospace;
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
    max-width: 400px;
    width: 100%;
    box-shadow: 16px 16px 0 #111;
  }
  .flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
  .sm-input {
    width: 120px;
    text-align: center;
  }
  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }

  .disclaimer-brutal {
    border: 3px dashed #111;
    padding: 1.25rem;
    background: #fff;
    font-size: 0.9rem;
    font-weight: bold;
    line-height: 1.5;
  }
  .disclaimer-brutal strong {
    display: block;
    font-size: 1.1rem;
    color: #ff4b4b;
    margin-bottom: 0.5rem;
    font-family: 'Noto Sans SC', sans-serif;
    font-weight: 900;
  }
  .disclaimer-brutal p {
    margin: 0;
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
    .progress-section {
      flex-direction: column;
    }
    .stats-panel {
      width: 100%;
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
  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .brutal-select,
  [data-theme='dark'] .goal-info,
  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .brutal-stat-box,
  [data-theme='dark'] .quick-add-btn,
  [data-theme='dark'] .history-item {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .brutal-select,
  [data-theme='dark'] .goal-info,
  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .brutal-stat-box,
  [data-theme='dark'] .quick-add-btn,
  [data-theme='dark'] .history-item {
    box-shadow: 6px 6px 0 #eee;
  }

  [data-theme='dark'] .brutal-btn:hover,
  [data-theme='dark'] .brutal-action-btn:hover,
  [data-theme='dark'] .quick-add-btn:hover,
  [data-theme='dark'] .relative-card:hover {
    box-shadow: 9px 9px 0 #eee;
  }
  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0 #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0 #eee;
  }

  [data-theme='dark'] .bg-white {
    background: #1a1a1a;
  }
  [data-theme='dark'] .bg-black {
    background: #222;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-btn.primary,
  [data-theme='dark'] .primary {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .text-white {
    color: #eee;
  }
  [data-theme='dark'] .text-blue {
    color: #6b8cff;
  }

  [data-theme='dark'] .pane-header,
  [data-theme='dark'] .history-section {
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-input:focus,
  [data-theme='dark'] .brutal-select:focus {
    border-color: #2a4eb2;
    box-shadow: 6px 6px 0 #2a4eb2;
  }
  [data-theme='dark'] .quick-add-btn.custom-btn {
    background: #332700;
    border-color: #eee;
  }

  [data-theme='dark'] .brutal-bottle {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 10px 10px 0 #eee;
  }
  [data-theme='dark'] .bottle-cap {
    background: #eee;
  }
  [data-theme='dark'] .bottle-water {
    background: repeating-linear-gradient(45deg, #2a4eb2, #2a4eb2 10px, #1a2a66 10px, #1a2a66 20px);
    border-top-color: #eee;
  }

  [data-theme='dark'] .history-list::-webkit-scrollbar-thumb {
    background: #eee;
  }
  [data-theme='dark'] .empty-history {
    border-color: #eee;
    color: #aaa;
  }
  [data-theme='dark'] .del-btn:hover {
    background: #ff4b4b;
    border-color: #eee;
  }
  [data-theme='dark'] .close-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-dialog {
    box-shadow: 16px 16px 0 #eee;
  }

  [data-theme='dark'] .disclaimer-brutal {
    background: #332200;
    border-color: #eee;
  }
  [data-theme='dark'] .disclaimer-brutal strong {
    color: #ff8b8b;
  }
</style>
