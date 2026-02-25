<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">工作日<span>.计算()</span></h1>
        <div style="width: 100px"></div>
      </header>

      <main class="main-content">
        <div class="brutal-pane result-card">
          <div class="pane-header bg-yellow">
            <span>📅 工作日天数计算</span>
          </div>
          <div class="pane-body result-body">
            <div class="result-value">{{ workdayCount }} <span class="unit">天</span></div>
            <div class="result-details">
              <span class="brutal-tag">总天数: {{ totalDays }}</span>
              <span class="brutal-tag red">周末: {{ weekendDays }}</span>
              <span class="brutal-tag green">节假日: {{ holidayDays }}</span>
              <span class="brutal-tag blue">补班: {{ makeupDays }}</span>
            </div>
          </div>
        </div>

        <div class="layout-grid">
          <section class="brutal-pane settings-panel">
            <div class="pane-header bg-dark text-white">⚙️ 基本设置</div>
            <div class="pane-body">
              <div class="form-group">
                <label>开始日期</label>
                <input v-model="startDateStr" type="date" class="brutal-input full-width" />
              </div>
              <div class="form-group">
                <label>结束日期</label>
                <input v-model="endDateStr" type="date" class="brutal-input full-width" />
              </div>

              <div class="switch-group" @click="excludeWeekends = !excludeWeekends">
                <span class="label">剔除周末 (周六日)</span>
                <div class="brutal-checkbox" :class="{ checked: excludeWeekends }">
                  {{ excludeWeekends ? '✔' : '' }}
                </div>
              </div>
            </div>
          </section>

          <section class="brutal-pane holidays-panel">
            <div class="pane-header bg-blue text-white">
              <span>🌟 特殊日期调整</span>
            </div>
            <div class="pane-body padding-0">
              <div class="panel-actions">
                <button class="action-btn" @click="loadExample2026">⬇️ 加载 2026</button>
                <button class="action-btn danger" @click="clearHolidays">✖ 清空</button>
              </div>

              <div class="tabs">
                <button :class="{ active: activeTab === 'holiday' }" @click="activeTab = 'holiday'">
                  节假日 (休息)
                </button>
                <button :class="{ active: activeTab === 'work' }" @click="activeTab = 'work'">
                  补班日 (工作)
                </button>
              </div>

              <div class="date-manager">
                <div class="add-box">
                  <input v-model="tempDateStr" type="date" class="brutal-input small-input" />
                  <button
                    class="brutal-btn add-btn"
                    :disabled="!tempDateStr"
                    @click="addSpecialDate"
                  >
                    +
                  </button>
                </div>

                <div class="list-container">
                  <ul v-if="currentList.length" class="date-list">
                    <li v-for="d in currentList" :key="d">
                      <span class="date-text">{{ d }}</span>
                      <button class="del-btn" @click="removeDate(d)">✖</button>
                    </li>
                  </ul>
                  <div v-else class="empty-tip">暂无数据 🧐</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <!-- Custom Toast notification (replacing ElMessage) -->
      <div v-if="toastMsg" class="brutal-toast" :class="toastType">
        {{ toastMsg }}
      </div>

      <div class="brutal-status">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i">© 2026 LRM工具箱 - 工作日计算器 // &nbsp;</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import dayjs from 'dayjs';

  const startDateStr = ref(dayjs().format('YYYY-MM-DD'));
  const endDateStr = ref(dayjs().add(1, 'month').format('YYYY-MM-DD'));
  const excludeWeekends = ref(true);

  const holidays = ref([]);
  const workdays = ref([]);
  const activeTab = ref('holiday');
  const tempDateStr = ref('');

  const toastMsg = ref('');
  const toastType = ref('success');
  let toastTimer = null;

  const showToast = (msg, type = 'success') => {
    toastMsg.value = msg;
    toastType.value = type;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastMsg.value = '';
    }, 3000);
  };

  const currentList = computed(() => {
    const list = activeTab.value === 'holiday' ? holidays.value : workdays.value;
    return list.slice().sort();
  });

  const addSpecialDate = () => {
    const dStr = tempDateStr.value;
    if (!dStr) return;

    if (holidays.value.includes(dStr)) {
      if (activeTab.value === 'work') holidays.value = holidays.value.filter(d => d !== dStr);
      else {
        showToast('该日期已在节假日列表中', 'warning');
        return;
      }
    }
    if (workdays.value.includes(dStr)) {
      if (activeTab.value === 'holiday') workdays.value = workdays.value.filter(d => d !== dStr);
      else {
        showToast('该日期已在补班列表中', 'warning');
        return;
      }
    }

    if (activeTab.value === 'holiday') holidays.value.push(dStr);
    else workdays.value.push(dStr);

    tempDateStr.value = '';
  };

  const removeDate = dateStr => {
    if (activeTab.value === 'holiday') holidays.value = holidays.value.filter(d => d !== dateStr);
    else workdays.value = workdays.value.filter(d => d !== dateStr);
  };

  const loadExample2026 = () => {
    holidays.value = [
      '2026-01-01',
      '2026-02-17',
      '2026-02-18',
      '2026-02-19',
      '2026-02-20',
      '2026-02-21',
      '2026-02-22',
      '2026-02-23',
      '2026-04-05',
      '2026-05-01',
      '2026-05-02',
      '2026-05-03',
      '2026-06-19',
      '2026-09-25',
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
      '2026-10-04',
      '2026-10-05',
      '2026-10-06',
      '2026-10-07'
    ];
    workdays.value = [
      '2026-02-15',
      '2026-02-28',
      '2026-04-26',
      '2026-05-09',
      '2026-09-27',
      '2026-10-10'
    ];
    showToast('已加载 2026 年示例节假日配置');
  };

  const clearHolidays = () => {
    holidays.value = [];
    workdays.value = [];
  };

  const calculations = computed(() => {
    if (!startDateStr.value || !endDateStr.value)
      return { count: 0, total: 0, weekend: 0, holi: 0, makeup: 0 };
    let start = dayjs(startDateStr.value).startOf('day');
    let end = dayjs(endDateStr.value).startOf('day');

    if (start.isAfter(end)) [start, end] = [end, start];

    let count = 0;
    let total = 0;
    let weekend = 0;
    let holi = 0;
    let makeup = 0;
    let curr = start;

    while (curr.isBefore(end) || curr.isSame(end, 'day')) {
      total++;
      const dateStr = curr.format('YYYY-MM-DD');
      const dayOfWeek = curr.day();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = holidays.value.includes(dateStr);
      const isMakeup = workdays.value.includes(dateStr);
      let isWork = true;

      if (isHoliday) {
        isWork = false;
        holi++;
      } else if (isMakeup) {
        isWork = true;
        makeup++;
      } else if (excludeWeekends.value && isWeekend) {
        isWork = false;
        weekend++;
      }

      if (isWork) count++;
      curr = curr.add(1, 'day');
    }
    return { count, total, weekend, holi, makeup };
  });

  const workdayCount = computed(() => calculations.value.count);
  const totalDays = computed(() => calculations.value.total);
  const weekendDays = computed(() => calculations.value.weekend);
  const holidayDays = computed(() => calculations.value.holi);
  const makeupDays = computed(() => calculations.value.makeup);
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

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
    position: relative;
  }
  .brutal-container {
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3rem;
    font-weight: 800;
    margin: 0;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #4b7bff;
  }
  .brutal-title span {
    color: #4b7bff;
    text-shadow: 4px 4px 0px #111;
  }
  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition: all 0.1s;
    color: #111;
    white-space: nowrap;
  }
  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0 0 0 #111;
  }
  .brutal-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: 6px 6px 0px #111 !important;
    transform: none !important;
    color: #888;
  }
  .brutal-pane {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
  }
  .pane-body {
    padding: 1.5rem;
  }
  .padding-0 {
    padding: 0;
  }
  .bg-yellow {
    background: #ffd900;
  }
  .bg-green {
    background: #00e572;
  }
  .bg-red {
    background: #ff4b4b;
  }
  .bg-blue {
    background: #4b7bff;
  }
  .bg-dark {
    background: #111;
  }
  .text-white {
    color: #fff;
  }
  .text-dark {
    color: #111;
  }

  .layout-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-top: 1.5rem;
    align-items: stretch;
  }

  .result-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2.5rem 1.5rem;
  }
  .result-value {
    font-size: 5rem;
    font-weight: 900;
    font-family: 'Syne', monospace;
    color: #111;
    line-height: 1;
    text-shadow: 4px 4px 0px #00e572;
    margin-bottom: 2rem;
  }
  .result-value .unit {
    font-size: 1.5rem;
    color: #111;
    font-weight: 800;
    text-shadow: none;
    vertical-align: top;
  }
  .result-details {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .brutal-tag {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 800;
    font-size: 1rem;
    padding: 0.4rem 0.8rem;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #111;
    background: #fff;
    color: #111;
  }
  .brutal-tag.red {
    background: #ff4b4b;
    color: #fff;
  }
  .brutal-tag.green {
    background: #00e572;
  }
  .brutal-tag.blue {
    background: #4b7bff;
    color: #fff;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }
  .form-group label {
    display: block;
    font-weight: 800;
    margin-bottom: 0.5rem;
    font-size: 0.95rem;
  }
  .brutal-input {
    border: 3px solid #111;
    padding: 0.75rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 1.1rem;
    background: #fff;
    box-shadow: 3px 3px 0px #111;
    outline: none;
    transition: all 0.2s;
    color: #111;
  }
  .brutal-input:focus {
    background: #fdfae5;
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }
  .full-width {
    width: 100%;
    box-sizing: border-box;
    display: block;
  }

  .switch-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #111;
    background: #fff;
    cursor: pointer;
    user-select: none;
    transition: all 0.15s;
  }
  .switch-group:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
    background: #fdfae5;
  }
  .switch-group .label {
    font-weight: 800;
    font-size: 0.95rem;
  }
  .brutal-checkbox {
    width: 30px;
    height: 30px;
    border: 3px solid #111;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 1.25rem;
    background: #fff;
    color: transparent;
    transition: all 0.2s;
  }
  .brutal-checkbox.checked {
    background: #111;
    color: #fff;
  }

  .panel-actions {
    display: flex;
    border-bottom: 3px solid #111;
  }
  .action-btn {
    flex: 1;
    border: none;
    background: #fff;
    padding: 0.75rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    cursor: pointer;
    font-size: 0.95rem;
    transition: background 0.1s;
    border-right: 3px solid #111;
    color: #111;
  }
  .action-btn:last-child {
    border-right: none;
  }
  .action-btn:hover {
    background: #ffd900;
  }
  .action-btn.danger:hover {
    background: #ff4b4b;
    color: white;
  }

  .tabs {
    display: flex;
    border-bottom: 3px solid #111;
    background: #eee;
  }
  .tabs button {
    flex: 1;
    border: none;
    background: transparent;
    padding: 0.75rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    cursor: pointer;
    color: #555;
    transition: all 0.1s;
    border-right: 3px solid #111;
  }
  .tabs button:last-child {
    border-right: none;
  }
  .tabs button.active {
    background: #fff;
    color: #111;
    box-shadow: inset 0 4px 0 #111;
  }

  .date-manager {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  .add-box {
    display: flex;
    gap: 0.75rem;
  }
  .small-input {
    flex: 1;
    min-width: 0;
  }
  .add-btn {
    padding: 0;
    width: 45px;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
  }

  .list-container {
    height: 200px;
    overflow-y: auto;
    border: 3px solid #111;
    background: #fff;
    box-shadow: inset 2px 2px 0px rgba(0, 0, 0, 0.1);
  }
  .date-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .date-list li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border-bottom: 2px dashed #ccc;
    font-weight: 700;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1.1rem;
  }
  .date-list li:last-child {
    border-bottom: none;
  }
  .del-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.25rem;
    font-weight: 900;
    color: #888;
    transition: color 0.1s;
  }
  .del-btn:hover {
    color: #ff4b4b;
  }
  .empty-tip {
    text-align: center;
    padding: 3rem;
    color: #888;
    font-weight: 700;
    font-size: 1.1rem;
  }

  .brutal-toast {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 6px 6px 0px #111;
    font-weight: 800;
    font-size: 1rem;
    z-index: 9999;
    animation: slideIn 0.3s ease;
  }
  .brutal-toast.success {
    border-left: 8px solid #00e572;
  }
  .brutal-toast.warning {
    border-left: 8px solid #ffd900;
  }
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .brutal-status {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    padding: 1rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.2rem;
    overflow: hidden;
    margin-top: 2rem;
  }
  .marquee-wrapper {
    overflow: hidden;
  }
  .marquee-content {
    display: inline-block;
    white-space: nowrap;
    animation: marquee 20s linear infinite;
  }
  @keyframes marquee {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  @media (max-width: 768px) {
    .brutal-title {
      font-size: 2rem;
    }
    .layout-grid {
      grid-template-columns: 1fr;
    }
  }

  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-status,
  [data-theme='dark'] .brutal-toast {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn {
    box-shadow: 6px 6px 0px #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 9px 9px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:active {
    box-shadow: 0 0 0 #eee;
  }
  [data-theme='dark'] .brutal-btn:disabled {
    box-shadow: 6px 6px 0px #444 !important;
    border-color: #666;
    color: #666;
    background: #222;
  }
  [data-theme='dark'] .brutal-pane {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
  }
  [data-theme='dark'] .bg-green {
    background: #00994c;
  }
  [data-theme='dark'] .bg-red {
    background: #cc0000;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
  }
  [data-theme='dark'] .bg-dark {
    background: #333;
  }
  [data-theme='dark'] .result-value {
    color: #eee;
    text-shadow: 4px 4px 0px #00994c;
  }
  [data-theme='dark'] .result-value .unit {
    color: #eee;
  }
  [data-theme='dark'] .brutal-tag {
    background: #222;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-tag.red {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .brutal-tag.green {
    background: #00994c;
  }
  [data-theme='dark'] .brutal-tag.blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .brutal-input {
    background: #222;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-input:focus {
    background: #333;
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .switch-group {
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
    background: #222;
  }
  [data-theme='dark'] .switch-group:hover {
    box-shadow: 5px 5px 0px #eee;
    background: #333;
  }
  [data-theme='dark'] .brutal-checkbox {
    border-color: #eee;
    background: #222;
  }
  [data-theme='dark'] .brutal-checkbox.checked {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .panel-actions,
  [data-theme='dark'] .tabs {
    border-bottom-color: #eee;
    background: #222;
  }
  [data-theme='dark'] .action-btn {
    background: #222;
    border-right-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .action-btn:hover {
    background: #b28f00;
    color: #111;
  }
  [data-theme='dark'] .action-btn.danger:hover {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .tabs button {
    border-right-color: #eee;
    color: #aaa;
  }
  [data-theme='dark'] .tabs button.active {
    background: #1a1a1a;
    color: #eee;
    box-shadow: inset 0 4px 0 #eee;
  }
  [data-theme='dark'] .list-container {
    border-color: #eee;
    background: #222;
    box-shadow: inset 2px 2px 0px rgba(0, 0, 0, 0.5);
  }
  [data-theme='dark'] .date-list li {
    border-bottom-color: #444;
  }
  [data-theme='dark'] .empty-tip {
    color: #aaa;
  }
  [data-theme='dark'] .brutal-toast {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-status {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] ::-webkit-calendar-picker-indicator {
    filter: invert(1);
  }
</style>
