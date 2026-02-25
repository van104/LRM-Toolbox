<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">纪念日<span>.倒计()</span></h1>
        <button class="brutal-btn add-btn-header" @click="showAddDialog = true">+ 新增</button>
      </header>

      <div v-if="events.length === 0" class="brutal-pane empty-pane">
        <div class="empty-content">
          <span class="empty-icon">📅</span>
          <p>暂无纪念日，点击右上角添加</p>
        </div>
      </div>

      <div class="events-grid">
        <div
          v-for="event in events"
          :key="event.id"
          class="brutal-pane event-card"
          :class="getColorClass(event.color)"
        >
          <div class="pane-header event-header-bar">
            <span class="event-title-text">{{ event.title }}</span>
            <div class="pane-actions">
              <button @click="deleteEvent(event.id)">✕ 删除</button>
            </div>
          </div>
          <div class="event-body">
            <div class="event-days">
              <span class="number">{{ getDays(event.date) }}</span>
              <span class="label-text">{{ getLabel(event.date) }}</span>
            </div>
            <div class="event-date">{{ formatDate(event.date) }}</div>
          </div>
        </div>
      </div>

      <!-- Add Dialog -->
      <div v-if="showAddDialog" class="modal-overlay" @click.self="showAddDialog = false">
        <div class="brutal-pane modal-card">
          <div class="pane-header bg-yellow">
            <span>添加纪念日</span>
            <div class="pane-actions">
              <button @click="showAddDialog = false">✕</button>
            </div>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="brutal-label">标题</label>
              <input
                v-model="form.title"
                class="brutal-input full"
                placeholder="例如：恋爱纪念日、发薪日"
              />
            </div>
            <div class="form-group">
              <label class="brutal-label">日期</label>
              <input v-model="form.date" type="date" class="brutal-input full" />
            </div>
            <div class="form-group">
              <label class="brutal-label">背景风格</label>
              <div class="color-presets">
                <button
                  v-for="(c, idx) in colorOptions"
                  :key="idx"
                  class="color-btn"
                  :class="[c.cls, { active: form.color === c.cls }]"
                  @click="form.color = c.cls"
                >
                  {{ c.name }}
                </button>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="brutal-action-btn" @click="showAddDialog = false">取消</button>
            <button class="brutal-action-btn primary" @click="addEvent">保存</button>
          </div>
        </div>
      </div>

      <div class="brutal-status info">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i">© 2026 LRM工具箱 - 纪念日倒计 // &nbsp;</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import dayjs from 'dayjs';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  interface EventItem {
    id: string;
    title: string;
    date: string;
    color: string;
  }

  const showAddDialog = ref(false);
  const events = ref<EventItem[]>([]);

  const colorOptions = [
    { cls: 'card-pink', name: '粉红' },
    { cls: 'card-blue', name: '蓝色' },
    { cls: 'card-green', name: '绿色' },
    { cls: 'card-yellow', name: '黄色' },
    { cls: 'card-purple', name: '紫色' },
    { cls: 'card-orange', name: '橙色' }
  ];

  const form = ref({
    title: '',
    date: '',
    color: 'card-pink'
  });

  const getColorClass = (color: string) => color || 'card-pink';

  const initEvents = () => {
    const saved = localStorage.getItem('lrm-anniversaries');
    if (saved) {
      try {
        events.value = JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const addEvent = () => {
    if (!form.value.title || !form.value.date) {
      ElMessage.warning('请填写完整信息');
      return;
    }

    events.value.push({
      id: Date.now().toString(),
      ...form.value
    });

    showAddDialog.value = false;
    form.value = { title: '', date: '', color: 'card-pink' };
    ElMessage.success('添加成功');
  };

  const deleteEvent = (id: string) => {
    ElMessageBox.confirm('确定删除该纪念日吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      events.value = events.value.filter(e => e.id !== id);
      ElMessage.success('已删除');
    });
  };

  const getDays = (dateStr: string) => {
    const target = dayjs(dateStr);
    const today = dayjs().startOf('day');
    return Math.abs(target.diff(today, 'day'));
  };

  const getLabel = (dateStr: string) => {
    const target = dayjs(dateStr);
    const today = dayjs().startOf('day');
    if (target.isAfter(today)) return '天后';
    if (target.isBefore(today)) return '天已过';
    return '今天';
  };

  const formatDate = (dateStr: string) => {
    return dayjs(dateStr).format('YYYY年MM月DD日');
  };

  watch(
    events,
    newVal => {
      localStorage.setItem('lrm-anniversaries', JSON.stringify(newVal));
    },
    { deep: true }
  );

  onMounted(() => {
    initEvents();
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
    background-position: -2px -2px;
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
  }

  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.5rem;
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

  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-btn.add-btn-header {
    background: #00e572;
    color: #111;
  }

  /* Empty Pane */
  .empty-pane {
    text-align: center;
    padding: 4rem 2rem;
    margin-bottom: 2rem;
  }

  .empty-content {
    font-size: 1.2rem;
    font-weight: 700;
  }

  .empty-icon {
    font-size: 4rem;
    display: block;
    margin-bottom: 1rem;
  }

  /* Events Grid */
  .events-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 2rem;
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
    font-size: 1.1rem;
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

  /* Event Card Colors */
  .event-card.card-pink .event-header-bar {
    background: #ff9fb2;
  }
  .event-card.card-blue .event-header-bar {
    background: #89b4f8;
  }
  .event-card.card-green .event-header-bar {
    background: #81e6b3;
  }
  .event-card.card-yellow .event-header-bar {
    background: #ffd900;
  }
  .event-card.card-purple .event-header-bar {
    background: #c4a7ff;
  }
  .event-card.card-orange .event-header-bar {
    background: #ffba6b;
  }

  .event-body {
    padding: 2rem 1.5rem;
    text-align: center;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .event-days .number {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 4rem;
    font-weight: 800;
    line-height: 1;
    display: block;
  }

  .event-days .label-text {
    font-size: 1.1rem;
    font-weight: 700;
    display: block;
    margin-top: 0.25rem;
  }

  .event-date {
    font-size: 0.9rem;
    margin-top: 1rem;
    color: #555;
    font-weight: 600;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
  }

  .event-title-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 180px;
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

  .color-presets {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .color-btn {
    padding: 0.4rem 0.8rem;
    border: 3px solid #111;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }

  .color-btn.card-pink {
    background: #ff9fb2;
  }
  .color-btn.card-blue {
    background: #89b4f8;
  }
  .color-btn.card-green {
    background: #81e6b3;
  }
  .color-btn.card-yellow {
    background: #ffd900;
  }
  .color-btn.card-purple {
    background: #c4a7ff;
  }
  .color-btn.card-orange {
    background: #ffba6b;
  }

  .color-btn.active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }

  .color-btn:hover:not(.active) {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }

  .modal-footer {
    display: flex;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border-top: 4px solid #111;
    background: #fdfae5;
  }

  .brutal-action-btn {
    flex: 1;
    background: #fff;
    border: 3px solid #111;
    padding: 0.7rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1rem;
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

  .bg-yellow {
    background: #ffd900;
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
  @media (max-width: 768px) {
    .brutal-title {
      font-size: 2rem;
    }
    .events-grid {
      grid-template-columns: 1fr;
    }
    .brutal-header {
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }
  }

  /* --- Dark Mode Overrides --- */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
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

  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane:hover {
    box-shadow: 16px 16px 0px #eee;
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
  [data-theme='dark'] .pane-actions button:hover {
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .pane-actions button:active {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .brutal-input {
    background: #222;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
    color: #eee;
  }

  [data-theme='dark'] .color-btn {
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .color-btn.active {
    box-shadow: 0px 0px 0px #eee;
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

  [data-theme='dark'] .event-date {
    color: #aaa;
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

  [data-theme='dark'] .event-card.card-pink .event-header-bar {
    background: #b25465;
  }
  [data-theme='dark'] .event-card.card-blue .event-header-bar {
    background: #405d9e;
  }
  [data-theme='dark'] .event-card.card-green .event-header-bar {
    background: #3c9165;
  }
  [data-theme='dark'] .event-card.card-yellow .event-header-bar {
    background: #b28f00;
  }
  [data-theme='dark'] .event-card.card-purple .event-header-bar {
    background: #6b5b95;
  }
  [data-theme='dark'] .event-card.card-orange .event-header-bar {
    background: #a07040;
  }
</style>
