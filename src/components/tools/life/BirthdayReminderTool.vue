<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">纪念日<span>.提醒()</span></h1>
        <button class="brutal-btn add-btn-header" @click="showAddModal = true">+ 新增</button>
      </header>

      <!-- Stats Bar -->
      <div v-if="events.length" class="brutal-toolbar">
        <div class="tools-left">
          <div class="stat-chip">
            <span class="chip-val">{{ events.length }}</span>
            <span class="chip-lab">总事件</span>
          </div>
          <div class="stat-chip highlight-chip">
            <span class="chip-val">{{ upcomingEvents.length }}</span>
            <span class="chip-lab">30天内</span>
          </div>
          <div class="stat-chip">
            <span class="chip-val">{{ nearestEvent?.name || '-' }}</span>
            <span class="chip-lab">最近事件</span>
          </div>
        </div>
      </div>

      <!-- Event List -->
      <div class="event-list">
        <div v-if="events.length === 0" class="brutal-pane empty-pane">
          <div class="empty-content">
            <span class="empty-icon">📅</span>
            <p>还没有记录任何重要日子</p>
            <button class="brutal-action-btn primary" @click="showAddModal = true">点击添加</button>
          </div>
        </div>

        <div
          v-for="event in sortedEvents"
          :key="event.id"
          class="brutal-pane event-card"
          :class="{ 'is-near': event.daysLeft <= 30, 'is-today': event.daysLeft === 0 }"
        >
          <div class="event-row">
            <div class="card-left">
              <div class="event-icon-box" :class="event.type">
                {{ getIcon(event.type) }}
              </div>
              <div class="event-info">
                <h3 class="event-name">{{ event.name }}</h3>
                <div class="event-meta">
                  {{ formatDate(event.date) }}
                  <span class="tag" :class="event.type">{{ getTypeName(event.type) }}</span>
                </div>
              </div>
            </div>
            <div class="card-right">
              <div class="countdown-area">
                <span v-if="event.daysLeft === 0" class="today-tag">今天!</span>
                <span v-else class="days-num">{{ event.daysLeft }}</span>
                <span v-if="event.daysLeft !== 0" class="days-label">天后</span>
              </div>
              <div v-if="event.type === 'birthday'" class="meta-extra">
                <span title="周岁">{{ event.age }}岁</span> /
                <span title="虚岁">{{ event.age + 1 }}虚</span>
              </div>
              <div v-else class="meta-extra">{{ event.anniversary }}周年</div>
              <button class="delete-btn" title="删除" @click="deleteEvent(event.id)">✕</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Modal -->
      <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
        <div class="brutal-pane modal-card">
          <div class="pane-header bg-yellow">
            <span>添加重要日期</span>
            <div class="pane-actions">
              <button @click="showAddModal = false">✕</button>
            </div>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="brutal-label">事件名称</label>
              <input
                v-model="newEvent.name"
                class="brutal-input full"
                placeholder="例如：妈妈生日、结婚纪念日"
              />
            </div>
            <div class="form-group">
              <label class="brutal-label">日期类型</label>
              <div class="type-selector">
                <button
                  v-for="t in types"
                  :key="t.value"
                  class="brutal-action-btn"
                  :class="{ primary: newEvent.type === t.value }"
                  @click="newEvent.type = t.value"
                >
                  {{ t.label }}
                </button>
              </div>
            </div>
            <div class="form-group">
              <label class="brutal-label">选择日期</label>
              <input v-model="newEvent.date" type="date" class="brutal-input full" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="brutal-action-btn" @click="showAddModal = false">取消</button>
            <button class="brutal-action-btn primary" :disabled="!isValid" @click="addEvent">
              确定添加
            </button>
          </div>
        </div>
      </div>

      <div class="brutal-status info">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i">© 2026 LRM工具箱 - 纪念日提醒 // &nbsp;</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import dayjs from 'dayjs';
  import { ElMessage } from 'element-plus';

  const showAddModal = ref(false);
  const events = ref([]);

  const types = [
    { label: '生日', value: 'birthday' },
    { label: '纪念日', value: 'anniversary' },
    { label: '节日', value: 'holiday' },
    { label: '其他', value: 'other' }
  ];

  const newEvent = ref({
    name: '',
    type: 'birthday',
    date: ''
  });

  const isValid = computed(() => newEvent.value.name && newEvent.value.date);

  const getIcon = type => {
    switch (type) {
      case 'birthday':
        return '🎂';
      case 'anniversary':
        return '💍';
      case 'holiday':
        return '🎉';
      default:
        return '📅';
    }
  };

  const getTypeName = type => types.find(t => t.value === type)?.label || '其他';

  const formatDate = date => dayjs(date).format('YYYY-MM-DD');

  const processEvents = list => {
    const today = dayjs().startOf('day');
    const currentYear = today.year();

    return list.map(e => {
      const dateObj = dayjs(e.date);
      const birthYear = dateObj.year();

      let nextDate = dateObj.year(currentYear);

      if (nextDate.isBefore(today)) {
        nextDate = nextDate.add(1, 'year');
      }

      const daysLeft = nextDate.diff(today, 'day');
      const yearDiff = nextDate.year() - birthYear;

      return {
        ...e,
        daysLeft,
        age: yearDiff,
        anniversary: yearDiff
      };
    });
  };

  const sortedEvents = computed(() => {
    return processEvents(events.value).sort((a, b) => a.daysLeft - b.daysLeft);
  });

  const upcomingEvents = computed(() => sortedEvents.value.filter(e => e.daysLeft <= 30));
  const nearestEvent = computed(() => sortedEvents.value[0]);

  const addEvent = () => {
    if (!isValid.value) return;

    events.value.push({
      id: Date.now(),
      name: newEvent.value.name,
      type: newEvent.value.type,
      date: newEvent.value.date
    });

    saveData();
    showAddModal.value = false;
    newEvent.value = { name: '', type: 'birthday', date: '' };
    ElMessage.success('添加成功');
  };

  const deleteEvent = id => {
    events.value = events.value.filter(e => e.id !== id);
    saveData();
    ElMessage.success('已删除');
  };

  const saveData = () => {
    localStorage.setItem('birthday-reminders', JSON.stringify(events.value));
  };

  const loadData = () => {
    const saved = localStorage.getItem('birthday-reminders');
    if (saved) {
      events.value = JSON.parse(saved);
    }
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
    background-position: -2px -2px;
    min-height: 100vh;
    padding: 2rem;
    box-sizing: border-box;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    color: #111;
  }

  .brutal-container {
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
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
    text-shadow: 4px 4px 0px #ff9fb2;
  }

  .brutal-title span {
    color: #ff4b4b;
    text-shadow: 4px 4px 0px #111;
    letter-spacing: 0;
  }

  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.1rem;
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

  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-btn.add-btn-header {
    background: #00e572;
    color: #111;
  }

  /* Toolbar / Stats */
  .brutal-toolbar {
    display: flex;
    background: #fff;
    border: 4px solid #111;
    padding: 1.25rem 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 8px 8px 0px #111;
  }

  .tools-left {
    display: flex;
    gap: 2rem;
    width: 100%;
    justify-content: space-around;
  }

  .stat-chip {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .chip-val {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.5rem;
    font-weight: 800;
  }

  .chip-lab {
    font-size: 0.8rem;
    font-weight: 600;
    color: #555;
  }

  .highlight-chip .chip-val {
    color: #ff4b4b;
  }

  /* Event List */
  .event-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 2.5rem;
  }

  .brutal-pane {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    transition: all 0.15s;
  }

  .brutal-pane:hover {
    transform: translate(-3px, -3px);
    box-shadow: 11px 11px 0px #111;
  }

  .empty-pane {
    text-align: center;
    padding: 4rem 2rem;
  }

  .empty-content {
    font-size: 1.1rem;
    font-weight: 700;
  }

  .empty-icon {
    font-size: 4rem;
    display: block;
    margin-bottom: 1rem;
  }

  .event-card {
    position: relative;
  }

  .event-card.is-near {
    border-color: #ff4b4b;
  }

  .event-card.is-today {
    background: #ffd900;
    border-color: #111;
  }

  .event-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
  }

  .card-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .event-icon-box {
    font-size: 2rem;
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #111;
    background: #fdfae5;
  }

  .event-info h3 {
    margin: 0 0 0.25rem 0;
    font-size: 1.1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
  }

  .event-meta {
    font-size: 0.85rem;
    color: #555;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
  }

  .tag {
    font-size: 0.7rem;
    padding: 2px 8px;
    border: 2px solid #111;
    font-weight: 700;
    background: #fdfae5;
  }

  .tag.birthday {
    background: #ff9fb2;
  }

  .tag.anniversary {
    background: #89b4f8;
  }

  .tag.holiday {
    background: #ffd900;
  }

  .card-right {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .countdown-area {
    text-align: right;
    min-width: 60px;
  }

  .days-num {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.8rem;
    font-weight: 800;
    color: #111;
  }

  .event-card.is-near .days-num {
    color: #ff4b4b;
  }

  .days-label {
    font-size: 0.85rem;
    color: #555;
    font-weight: 600;
  }

  .today-tag {
    color: #ff4b4b;
    font-weight: 800;
    font-size: 1.2rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
  }

  .meta-extra {
    font-size: 0.85rem;
    color: #555;
    min-width: 70px;
    text-align: right;
    font-weight: 600;
  }

  .delete-btn {
    background: #ff4b4b;
    color: #fff;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #111;
    cursor: pointer;
    font-size: 1rem;
    padding: 0.4rem 0.6rem;
    font-weight: 800;
    transition: all 0.1s;
  }

  .delete-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }

  .delete-btn:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-card {
    width: 90%;
    max-width: 450px;
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
    letter-spacing: 1px;
  }

  .pane-actions {
    display: flex;
    gap: 0.75rem;
  }

  .pane-actions button {
    background: #fff;
    color: #111;
    border: 3px solid #111;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 0.9rem;
    padding: 0.35rem 0.75rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }

  .pane-actions button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }

  .pane-actions button:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }

  .bg-yellow {
    background: #ffd900;
  }

  .modal-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .brutal-label {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1rem;
  }

  .brutal-input {
    border: 3px solid #111;
    padding: 0.6rem 0.8rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 1rem;
    background: #fff;
    box-shadow: 3px 3px 0px #111;
    outline: none;
  }

  .brutal-input.full {
    width: 100%;
    box-sizing: border-box;
  }

  .type-selector {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .brutal-action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.6rem 1.2rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.95rem;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
  }

  .brutal-action-btn.primary {
    background: #00e572;
  }

  .brutal-action-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .brutal-action-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-action-btn:disabled {
    background: #eee;
    color: #aaa;
    border-color: #aaa;
    box-shadow: 2px 2px 0px #aaa;
    cursor: not-allowed;
    transform: none;
  }

  .modal-footer {
    display: flex;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border-top: 4px solid #111;
    background: #fdfae5;
  }

  .modal-footer .brutal-action-btn {
    flex: 1;
  }

  /* Status Bar */
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

  .brutal-status.info {
    background: #fff;
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

  /* Responsive */
  @media (max-width: 700px) {
    .brutal-title {
      font-size: 2rem;
    }
    .brutal-header {
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }
    .event-row {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }
    .card-right {
      width: 100%;
      justify-content: space-between;
    }
  }

  /* --- Dark Mode --- */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-toolbar,
  [data-theme='dark'] .brutal-status,
  [data-theme='dark'] .brutal-status.info,
  [data-theme='dark'] .brutal-action-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 9px 9px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .brutal-toolbar {
    box-shadow: 8px 8px 0px #eee;
  }

  [data-theme='dark'] .brutal-pane {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane:hover {
    box-shadow: 11px 11px 0px #eee;
  }

  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
    color: #111;
  }

  [data-theme='dark'] .pane-actions button {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }

  [data-theme='dark'] .brutal-input {
    background: #222;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
    color: #eee;
  }

  [data-theme='dark'] .brutal-action-btn {
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:hover {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn.primary {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .brutal-btn.add-btn-header {
    background: #00994c;
    color: #fff;
  }

  [data-theme='dark'] .modal-footer {
    background: #222;
    border-top-color: #eee;
  }

  [data-theme='dark'] .brutal-status {
    box-shadow: 8px 8px 0px #eee;
  }

  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }

  [data-theme='dark'] .event-icon-box {
    background: #222;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }

  [data-theme='dark'] .tag {
    border-color: #eee;
    background: #222;
    color: #eee;
  }
  [data-theme='dark'] .tag.birthday {
    background: #b25465;
  }
  [data-theme='dark'] .tag.anniversary {
    background: #405d9e;
  }
  [data-theme='dark'] .tag.holiday {
    background: #b28f00;
  }

  [data-theme='dark'] .event-card.is-near {
    border-color: #ff9fb2;
  }
  [data-theme='dark'] .event-card.is-today {
    background: #b28f00;
  }

  [data-theme='dark'] .delete-btn {
    background: #cc0000;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .delete-btn:hover {
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .delete-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .chip-lab {
    color: #aaa;
  }

  [data-theme='dark'] .event-meta {
    color: #aaa;
  }

  [data-theme='dark'] .days-label,
  [data-theme='dark'] .meta-extra {
    color: #aaa;
  }
</style>
