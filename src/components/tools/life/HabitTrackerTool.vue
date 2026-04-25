<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">习惯<span>.打卡()</span></h1>
        <div style="width: 120px"></div>
      </header>

      <div class="brutal-grid main-layout">
        <!-- 左侧：习惯列表 -->
        <div class="brutal-pane main-pane">
          <div class="pane-header bg-yellow">
            <span>🎯 我的习惯</span>
            <div class="pane-actions">
              <button :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">
                列表
              </button>
              <button :class="{ active: viewMode === 'calendar' }" @click="viewMode = 'calendar'">
                日历
              </button>
            </div>
          </div>

          <!-- 添加习惯 -->
          <div class="add-form">
            <div class="form-row">
              <input
                v-model="form.name"
                class="brutal-input full"
                placeholder="习惯名称（如：早起、运动、阅读）"
              />
            </div>
            <div class="form-row">
              <select v-model="form.icon" class="brutal-select">
                <option v-for="icon in habitIcons" :key="icon" :value="icon">{{ icon }}</option>
              </select>
              <select v-model="form.frequency" class="brutal-select">
                <option value="daily">每天</option>
                <option value="weekly">每周</option>
              </select>
              <button class="brutal-action-btn primary" @click="addHabit">+ 添加</button>
            </div>
          </div>

          <!-- 今日概览 -->
          <div class="today-overview">
            <div class="today-header">
              <span class="today-date">{{ todayDate }}</span>
              <span class="today-progress">今日进度：{{ todayCompleted }}/{{ habits.length }}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: todayProgress + '%' }"></div>
            </div>
          </div>

          <!-- 列表视图 -->
          <div v-if="viewMode === 'list'" class="habits-list">
            <div v-for="habit in habits" :key="habit.id" class="habit-card">
              <div class="habit-icon">{{ habit.icon }}</div>
              <div class="habit-info">
                <div class="habit-name">{{ habit.name }}</div>
                <div class="habit-streak">
                  <span class="streak-label">连续</span>
                  <span class="streak-value">{{ habit.streak }}</span>
                  <span class="streak-label">天</span>
                  <span class="streak-max">最长 {{ habit.maxStreak }} 天</span>
                </div>
              </div>
              <div class="habit-check">
                <button
                  class="check-btn"
                  :class="{ checked: isCompletedToday(habit) }"
                  @click="toggleCheck(habit)"
                >
                  {{ isCompletedToday(habit) ? '✓' : '' }}
                </button>
              </div>
              <button class="del-btn" @click="deleteHabit(habit.id)">✕</button>
            </div>
            <div v-if="habits.length === 0" class="empty-item">添加你的第一个习惯吧</div>
          </div>

          <!-- 日历视图 -->
          <div v-else class="calendar-view">
            <div class="calendar-header">
              <button @click="prevMonth">◀</button>
              <span>{{ calendarMonth }}</span>
              <button @click="nextMonth">▶</button>
            </div>
            <div class="calendar-grid">
              <div v-for="day in weekDays" :key="day" class="calendar-day header">{{ day }}</div>
              <div
                v-for="(day, index) in calendarDays"
                :key="index"
                class="calendar-day"
                :class="{
                  empty: !day.day,
                  today: day.isToday,
                  selected: day.date === selectedDate
                }"
                @click="day.day && (selectedDate = day.date)"
              >
                <span v-if="day.day" class="day-num">{{ day.day }}</span>
                <div v-if="day.day && day.completedCount > 0" class="day-dots">
                  <span v-for="i in Math.min(day.completedCount, 3)" :key="i" class="dot"></span>
                </div>
              </div>
            </div>
            <div v-if="selectedDateData" class="selected-detail">
              <div class="selected-date">{{ selectedDate }}</div>
              <div class="selected-habits">
                <span v-for="h in selectedDateData.completed" :key="h.id" class="completed-habit"
                  >{{ h.icon }} {{ h.name }}</span
                >
                <span v-if="selectedDateData.completed.length === 0">当天无打卡记录</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：统计和激励 -->
        <div class="brutal-pane side-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">🏆 成就榜</span>
          </div>
          <div class="achievements">
            <div class="achievement-item" :class="{ unlocked: totalCheckIns >= 7 }">
              <span class="achievement-icon">🌟</span>
              <span class="achievement-name">坚持一周</span>
              <span class="achievement-desc">累计打卡7天</span>
            </div>
            <div class="achievement-item" :class="{ unlocked: totalCheckIns >= 30 }">
              <span class="achievement-icon">🔥</span>
              <span class="achievement-name">月度达人</span>
              <span class="achievement-desc">累计打卡30天</span>
            </div>
            <div class="achievement-item" :class="{ unlocked: totalCheckIns >= 100 }">
              <span class="achievement-icon">💎</span>
              <span class="achievement-name">百日坚持</span>
              <span class="achievement-desc">累计打卡100天</span>
            </div>
            <div class="achievement-item" :class="{ unlocked: hasMaxStreak(7) }">
              <span class="achievement-icon">⚡</span>
              <span class="achievement-name">连续一周</span>
              <span class="achievement-desc">某习惯连续7天</span>
            </div>
            <div class="achievement-item" :class="{ unlocked: hasMaxStreak(30) }">
              <span class="achievement-icon">🏅</span>
              <span class="achievement-name">习惯养成</span>
              <span class="achievement-desc">某习惯连续30天</span>
            </div>
          </div>

          <div class="pane-header bg-dark" style="margin-top: 1rem">
            <span class="text-white">📊 统计</span>
          </div>
          <div class="stats-section">
            <div class="stat-row">
              <span class="stat-label">总打卡次数</span>
              <span class="stat-value">{{ totalCheckIns }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">习惯数量</span>
              <span class="stat-value">{{ habits.length }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">最长连续</span>
              <span class="stat-value">{{ maxStreakDays }} 天</span>
            </div>
          </div>

          <div class="pane-header bg-green" style="margin-top: 1rem">
            <span>💡 激励语</span>
          </div>
          <div class="motivation">
            <div class="quote">"{{ currentQuote }}"</div>
          </div>
        </div>
      </div>

      <div class="brutal-status info">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i"
              >© 2026 LRM工具箱 - 习惯打卡 // 坚持就是胜利 // &nbsp;</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { ElMessage } from 'element-plus';

  const STORAGE_KEY = 'lrm_habit_tracker';

  const habitIcons = ['💪', '📚', '🏃', '💧', '🧘', '📝', '🎯', '⏰', '🥗', '😴', '🎨', '🎵'];
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const quotes = [
    '习惯若不是最好的仆人，便是最差的主人。',
    '每天进步一点点，一年后你会感谢自己。',
    '成功源于习惯，习惯源于坚持。',
    '把简单的事情重复做，就是专家。',
    '坚持是一种信仰，放弃是一种遗憾。'
  ];

  const form = ref({ name: '', icon: '💪', frequency: 'daily' });
  const habits = ref([]);
  const checkIns = ref({}); // { '2024-01-15': [habitId1, habitId2] }
  const viewMode = ref('list');
  const calendarMonth = ref(new Date());
  const selectedDate = ref(new Date().toISOString().split('T')[0]);

  const loadData = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      habits.value = parsed.habits || [];
      checkIns.value = parsed.checkIns || {};
    }
  };

  const saveData = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ habits: habits.value, checkIns: checkIns.value })
    );
  };

  const addHabit = () => {
    if (!form.value.name.trim()) {
      ElMessage.warning('请输入习惯名称');
      return;
    }

    habits.value.push({
      id: Date.now(),
      name: form.value.name.trim(),
      icon: form.value.icon,
      frequency: form.value.frequency,
      streak: 0,
      maxStreak: 0,
      createdAt: new Date().toISOString()
    });

    saveData();
    ElMessage.success('添加成功');
    form.value.name = '';
  };

  const deleteHabit = id => {
    habits.value = habits.value.filter(h => h.id !== id);
    saveData();
    ElMessage.success('已删除');
  };

  const today = new Date().toISOString().split('T')[0];

  const isCompletedToday = habit => {
    return checkIns.value[today]?.includes(habit.id);
  };

  const toggleCheck = habit => {
    if (!checkIns.value[today]) checkIns.value[today] = [];

    const index = checkIns.value[today].indexOf(habit.id);
    if (index > -1) {
      checkIns.value[today].splice(index, 1);
      habit.streak = Math.max(0, habit.streak - 1);
    } else {
      checkIns.value[today].push(habit.id);

      // 计算连续天数
      let streak = 1;
      let checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - 1);

      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (checkIns.value[dateStr]?.includes(habit.id)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      habit.streak = streak;
      habit.maxStreak = Math.max(habit.maxStreak, streak);
    }

    saveData();
  };

  const todayDate = computed(() => {
    const d = new Date();
    return `${d.getMonth() + 1}月${d.getDate()}日 周${weekDays[d.getDay()]}`;
  });

  const todayCompleted = computed(() => {
    return checkIns.value[today]?.length || 0;
  });

  const todayProgress = computed(() => {
    if (habits.value.length === 0) return 0;
    return (todayCompleted.value / habits.value.length) * 100;
  });

  const totalCheckIns = computed(() => {
    return Object.values(checkIns.value).flat().length;
  });

  const maxStreakDays = computed(() => {
    return Math.max(0, ...habits.value.map(h => h.maxStreak));
  });

  const hasMaxStreak = days => habits.value.some(h => h.maxStreak >= days);

  const currentQuote = computed(() => quotes[Math.floor(Math.random() * quotes.length)]);

  const calendarDays = computed(() => {
    const year = calendarMonth.value.getFullYear();
    const month = calendarMonth.value.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // 前置空格
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push({ day: null });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const completed = checkIns.value[dateStr] || [];
      days.push({
        day: d,
        date: dateStr,
        isToday: dateStr === today,
        completedCount: completed.length
      });
    }

    return days;
  });

  const selectedDateData = computed(() => {
    if (!selectedDate.value) return null;
    const completedIds = checkIns.value[selectedDate.value] || [];
    return {
      completed: habits.value.filter(h => completedIds.includes(h.id))
    };
  });

  const prevMonth = () => {
    calendarMonth.value = new Date(
      calendarMonth.value.getFullYear(),
      calendarMonth.value.getMonth() - 1,
      1
    );
  };

  const nextMonth = () => {
    calendarMonth.value = new Date(
      calendarMonth.value.getFullYear(),
      calendarMonth.value.getMonth() + 1,
      1
    );
  };

  onMounted(loadData);
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
  }
  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #ffd900;
  }
  .brutal-title span {
    color: #ffd900;
    text-shadow: 4px 4px 0px #111;
  }

  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }
  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }

  .main-layout {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 2.5rem;
    margin-bottom: 2.5rem;
  }

  .brutal-pane {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
    transition: transform 0.2s;
    display: flex;
    flex-direction: column;
  }
  .brutal-pane:hover {
    transform: translate(-4px, -4px);
    box-shadow: 16px 16px 0px #111;
  }

  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.15rem;
  }

  .bg-yellow {
    background: #ffd900;
  }
  .bg-blue {
    background: #4b7bff;
  }
  .bg-dark {
    background: #111;
  }
  .bg-green {
    background: #00e572;
  }
  .text-white {
    color: #fff;
  }

  .pane-actions {
    display: flex;
    gap: 0.5rem;
  }
  .pane-actions button {
    background: #fff;
    border: 3px solid #111;
    padding: 0.35rem 0.75rem;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }
  .pane-actions button.active {
    background: #00e572;
    box-shadow: 0 0 0 #111;
    transform: translate(2px, 2px);
  }

  .add-form {
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
  }
  .form-row {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
    align-items: center;
  }

  .brutal-input {
    flex: 1;
    border: 3px solid #111;
    padding: 0.6rem 0.8rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    font-size: 0.95rem;
    background: #fff;
    box-shadow: 3px 3px 0px #111;
    outline: none;
  }
  .brutal-input.full {
    flex: 1;
  }

  .brutal-select {
    flex: 1;
    border: 3px solid #111;
    padding: 0.6rem 0.8rem;
    font-weight: 600;
    background: #fff;
    box-shadow: 3px 3px 0px #111;
    cursor: pointer;
  }

  .brutal-action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.6rem 1.2rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }
  .brutal-action-btn.primary {
    background: #00e572;
  }
  .brutal-action-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }

  .today-overview {
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
  }
  .today-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }
  .today-date {
    font-weight: 800;
  }
  .today-progress {
    font-size: 0.9rem;
    color: #666;
  }
  .progress-bar {
    height: 12px;
    background: #eee;
    border: 3px solid #111;
  }
  .progress-fill {
    height: 100%;
    background: #00e572;
    transition: width 0.3s;
  }

  .habits-list {
    padding: 1rem 1.5rem;
    flex: 1;
    overflow-y: auto;
    max-height: 350px;
  }

  .habit-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    margin-bottom: 0.75rem;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
  }
  .habit-card:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .habit-icon {
    font-size: 1.5rem;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    border: 3px solid #111;
  }
  .habit-info {
    flex: 1;
  }
  .habit-name {
    font-weight: 800;
    font-size: 1.1rem;
    font-family: 'Syne', sans-serif;
  }
  .habit-streak {
    font-size: 0.85rem;
    margin-top: 0.25rem;
  }
  .streak-value {
    font-weight: 800;
    font-size: 1.2rem;
    color: #ff6b6b;
    margin: 0 0.25rem;
  }
  .streak-max {
    margin-left: 0.5rem;
    color: #999;
  }

  .check-btn {
    width: 48px;
    height: 48px;
    border: 3px solid #111;
    background: #fff;
    font-size: 1.5rem;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
  }
  .check-btn.checked {
    background: #00e572;
  }
  .check-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .del-btn {
    background: #ff4b4b;
    color: #fff;
    border: 3px solid #111;
    padding: 0.5rem;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    font-weight: 800;
  }

  .empty-item {
    text-align: center;
    padding: 2rem;
    color: #999;
    font-weight: 600;
  }

  .calendar-view {
    padding: 1rem 1.5rem;
  }
  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  .calendar-header button {
    background: #fff;
    border: 3px solid #111;
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-weight: 800;
    box-shadow: 2px 2px 0px #111;
  }
  .calendar-header span {
    font-weight: 800;
    font-size: 1.1rem;
  }

  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }
  .calendar-day {
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px solid #eee;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.1s;
  }
  .calendar-day.header {
    border: none;
    font-weight: 800;
    cursor: default;
    background: transparent;
  }
  .calendar-day.empty {
    background: transparent;
    border: none;
    cursor: default;
  }
  .calendar-day.today {
    background: #ffd900;
    border-color: #111;
  }
  .calendar-day.selected {
    border-color: #4b7bff;
    border-width: 3px;
  }
  .calendar-day:hover:not(.header):not(.empty) {
    background: #f5f5f5;
  }

  .day-dots {
    display: flex;
    gap: 2px;
    margin-top: 2px;
  }
  .dot {
    width: 6px;
    height: 6px;
    background: #00e572;
    border-radius: 50%;
  }

  .selected-detail {
    margin-top: 1rem;
    padding: 1rem;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #111;
  }
  .selected-date {
    font-weight: 800;
    margin-bottom: 0.5rem;
  }
  .selected-habits {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .completed-habit {
    background: #d4f8d4;
    padding: 0.25rem 0.5rem;
    font-size: 0.85rem;
    border: 2px solid #111;
  }

  .achievements {
    padding: 1rem;
  }
  .achievement-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    border: 3px solid #eee;
    opacity: 0.5;
    transition: all 0.2s;
  }
  .achievement-item.unlocked {
    opacity: 1;
    border-color: #111;
    background: #fff4d4;
    box-shadow: 3px 3px 0px #111;
  }
  .achievement-icon {
    font-size: 1.5rem;
  }
  .achievement-name {
    font-weight: 800;
  }
  .achievement-desc {
    font-size: 0.75rem;
    color: #666;
  }

  .stats-section {
    padding: 1rem;
  }
  .stat-row {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
    border-bottom: 2px solid #eee;
  }
  .stat-label {
    color: #666;
  }
  .stat-value {
    font-weight: 800;
    font-size: 1.1rem;
  }

  .motivation {
    padding: 1rem;
  }
  .quote {
    font-style: italic;
    font-size: 0.95rem;
    line-height: 1.6;
    color: #555;
  }

  .brutal-status {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    padding: 1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.2rem;
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

  @media (max-width: 1024px) {
    .main-layout {
      grid-template-columns: 1fr;
    }
    .brutal-title {
      font-size: 2rem;
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
  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .brutal-select,
  [data-theme='dark'] .calendar-day {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .pane-actions button {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .progress-bar {
    border-color: #eee;
  }
  [data-theme='dark'] .habit-card {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .habit-icon {
    background: #222;
    border-color: #eee;
  }
  [data-theme='dark'] .check-btn {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .del-btn {
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .achievement-item.unlocked {
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .calendar-day.header {
    color: #eee;
  }
  [data-theme='dark'] .brutal-status {
    box-shadow: 8px 8px 0px #eee;
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
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
</style>
