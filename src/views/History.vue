<template>
  <div class="brutal-page-container">
    <div class="brutal-page-header">
      <div class="header-content">
        <h1 class="brutal-page-title">
          <el-icon class="icon-clock"><Clock /></el-icon>
          使用履历.LOG()
        </h1>
        <p class="brutal-page-subtitle">系统记录的历史活动时间轴</p>
      </div>
      <div class="header-actions">
        <button v-if="userStore.history.length > 0" class="brutal-btn-danger" @click="confirmClear">
          <el-icon><Delete /></el-icon> 清除履历
        </button>
        <button class="brutal-btn-secondary" @click="$router.push('/')">
          <el-icon><ArrowLeft /></el-icon> 返回主板
        </button>
      </div>
    </div>

    <main class="page-main">
      <div class="search-section">
        <div class="brutal-search-wrapper">
          <el-icon class="search-icon"><Search /></el-icon>
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="使用关键字检索履历..."
            class="brutal-search-input"
          />
        </div>
      </div>

      <div v-if="filteredHistory.length > 0" class="brutal-timeline-container">
        <DynamicScroller
          :items="flatHistory"
          :min-item-size="100"
          key-field="id"
          page-mode
          class="scroller"
        >
          <template #default="{ item, index, active }">
            <DynamicScrollerItem
              :item="item"
              :active="active"
              :size-dependencies="[item.type]"
              :data-index="index"
            >
              <div v-if="item.type === 'header'" class="timeline-group-header">
                <div class="brutal-timeline-title">{{ item.title }}</div>
              </div>
              <div v-else class="brutal-history-item" @click="goToTool(item.data)">
                <div class="time-column">
                  <div class="brutal-time-badge">{{ formatTime(item.data.usedAt) }}</div>
                </div>

                <div class="brutal-item-card" :class="getRandomColorBorderClass(item.data.id)">
                  <div class="item-icon-box" :class="getRandomColorClass(item.data.id)">
                    <el-icon :size="24"><component :is="item.data.icon" /></el-icon>
                  </div>

                  <div class="item-details">
                    <div class="item-name">{{ item.data.name }}</div>
                    <div class="item-date">{{ formatDate(item.data.usedAt) }}</div>
                  </div>

                  <div class="item-action-arrow">
                    <el-icon :size="24"><ArrowRight /></el-icon>
                  </div>
                </div>
              </div>
            </DynamicScrollerItem>
          </template>
        </DynamicScroller>
      </div>

      <div v-else class="brutal-empty-state">
        <div class="empty-icon-box bg-blue">
          <el-icon :size="48"><Clock /></el-icon>
        </div>
        <h2 class="empty-text">{{ searchKeyword ? '检索无匹配' : '暂无活动留存' }}</h2>
        <p class="empty-sub">
          {{ searchKeyword ? '尝试更换检索词汇' : '指令终端尚未记录过任何作业' }}
        </p>
        <button v-if="!searchKeyword" class="brutal-btn-primary" @click="$router.push('/')">
          &lt; 开启作业
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessageBox, ElMessage } from 'element-plus';
  import { Clock, Delete, ArrowLeft, ArrowRight, Search } from '@element-plus/icons-vue';
  import { tools } from '@/data/tools';
  import { useUserStore } from '@/stores/user';
  import dayjs from 'dayjs';

  const router = useRouter();
  const userStore = useUserStore();
  const searchKeyword = ref('');

  const filteredHistory = computed(() => {
    if (!searchKeyword.value) return userStore.history;
    const keyword = searchKeyword.value.toLowerCase();
    return userStore.history.filter(item => item.name.toLowerCase().includes(keyword));
  });

  const groupedHistory = computed(() => {
    const groups = {
      today: { title: 'T O D A Y //', items: [] },
      yesterday: { title: 'Y E S T E R D A Y //', items: [] },
      week: { title: 'L A S T   7   D A Y S //', items: [] },
      older: { title: 'A R C H I V E D //', items: [] }
    };

    const today = dayjs().startOf('day');
    const yesterday = dayjs().subtract(1, 'day').startOf('day');
    const weekAgo = dayjs().subtract(7, 'day').startOf('day');

    filteredHistory.value.forEach(item => {
      const itemDate = dayjs(item.usedAt);
      if (itemDate.isAfter(today)) {
        groups.today.items.push(item);
      } else if (itemDate.isAfter(yesterday)) {
        groups.yesterday.items.push(item);
      } else if (itemDate.isAfter(weekAgo)) {
        groups.week.items.push(item);
      } else {
        groups.older.items.push(item);
      }
    });

    return Object.values(groups).filter(group => group.items.length > 0);
  });

  const flatHistory = computed(() => {
    const groups = groupedHistory.value;
    const flat = [];
    groups.forEach(group => {
      flat.push({ type: 'header', title: group.title, id: `header-${group.title}` });
      group.items.forEach(item => {
        flat.push({ type: 'item', data: item, id: `${item.id}-${item.usedAt}` });
      });
    });
    return flat;
  });

  function formatTime(isoString) {
    return dayjs(isoString).format('HH:mm');
  }

  function formatDate(isoString) {
    return dayjs(isoString).format('YYYY.MM.DD  HH:mm');
  }

  function goToTool(item) {
    if (item.route) {
      const tool = tools.find(t => t.id === item.id);
      if (tool) {
        userStore.addToHistory(tool);
      }
      if (item.isLocal === false || item.route.startsWith('http')) {
        window.open(item.route, '_blank');
      } else {
        router.push(item.route);
      }
    }
  }

  function confirmClear() {
    ElMessageBox.confirm('这将会擦除系统内核遗留的所有时间线日志，是否继续？', '日志清除确认', {
      confirmButtonText: '擦除日志',
      cancelButtonText: '保持现状',
      type: 'warning'
    })
      .then(() => {
        userStore.clearHistory();
        ElMessage.success('系统回写：日志轨道清理完毕');
      })
      .catch(() => {});
  }

  function getRandomColorClass(str) {
    if (!str) return 'bg-blue';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ['bg-yellow', 'bg-blue', 'bg-pink', 'bg-green'];
    return colors[Math.abs(hash) % colors.length];
  }

  function getRandomColorBorderClass(str) {
    if (!str) return 'border-blue';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ['border-yellow', 'border-blue', 'border-pink', 'border-green'];
    return colors[Math.abs(hash) % colors.length];
  }
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

  .brutal-page-container {
    min-height: 100vh;
    background-color: #fdfae5;
    background-image:
      linear-gradient(#e5e5e5 2px, transparent 2px),
      linear-gradient(90deg, #e5e5e5 2px, transparent 2px);
    background-size: 40px 40px;
    background-position: -2px -2px;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    padding-bottom: 4rem;
    color: #111;
  }

  .brutal-page-header {
    background: #fff;
    padding: 2.5rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 4px solid #111;
    box-shadow: 0px 8px 0px #111;
    margin-bottom: 3rem;
  }

  .header-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .brutal-page-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 2.5rem;
    font-weight: 900;
    color: #111;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -1px;
    text-shadow: 4px 4px 0px #4b7bff;
  }

  .icon-clock {
    color: #ffd900;
    filter: drop-shadow(3px 3px 0px #111);
  }

  .brutal-page-subtitle {
    font-size: 1.15rem;
    font-weight: 600;
    margin: 0;
    padding: 0.25rem 0.75rem;
    background: #111;
    color: #fff;
    display: table;
  }

  .header-actions {
    display: flex;
    gap: 1.5rem;
  }

  .brutal-btn-secondary,
  .brutal-btn-danger,
  .brutal-btn-primary {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.15rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 5px 5px 0px #111;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
    text-transform: uppercase;
  }

  .brutal-btn-secondary:hover {
    transform: translate(-2px, -2px);
    box-shadow: 7px 7px 0px #111;
    background: #4b7bff;
    color: #fff;
  }
  .brutal-btn-secondary:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-btn-danger {
    background: #ff4b4b;
    color: #fff;
  }
  .brutal-btn-danger:hover {
    transform: translate(-2px, -2px);
    box-shadow: 7px 7px 0px #111;
    background: #e03131;
  }
  .brutal-btn-danger:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-btn-primary {
    background: #00e572;
    color: #111;
    margin-top: 1.5rem;
  }
  .brutal-btn-primary:hover {
    transform: translate(-2px, -2px);
    box-shadow: 7px 7px 0px #111;
    background: #00c964;
  }
  .brutal-btn-primary:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }

  .page-main {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .search-section {
    margin-bottom: 3rem;
  }

  .brutal-search-wrapper {
    display: flex;
    align-items: center;
    width: 100%;
    border: 4px solid #111;
    background: #fff;
    box-shadow: 8px 8px 0px #111;
    transition: all 0.2s;
    height: 70px;
    position: relative;
  }

  .brutal-search-wrapper:focus-within {
    transform: translate(-4px, -4px);
    box-shadow: 12px 12px 0px #111;
  }

  .search-icon {
    font-size: 1.8rem;
    margin-left: 1.5rem;
    color: #4b7bff;
    font-weight: 800;
  }

  .brutal-search-input {
    flex: 1;
    height: 100%;
    border: none;
    background: transparent;
    padding: 0 1.5rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-size: 1.3rem;
    font-weight: 600;
    color: #111;
    outline: none;
  }

  .brutal-search-input::placeholder {
    color: #888;
    font-style: italic;
  }

  .brutal-timeline-container {
    position: relative;
    padding-left: 20px;
  }

  .brutal-timeline-container::before {
    content: '';
    position: absolute;
    left: 120px;
    top: 0;
    bottom: 0;
    width: 6px;
    background: #111;
    z-index: 1;
  }

  .timeline-group-header {
    margin: 2rem 0 1.5rem 150px;
    position: relative;
    z-index: 2;
  }

  .brutal-timeline-title {
    display: inline-block;
    padding: 0.5rem 1.5rem;
    background: #111;
    color: #fff;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1.15rem;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #ff4b4b;
    letter-spacing: 2px;
  }

  .brutal-history-item {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
    position: relative;
    cursor: pointer;
    z-index: 2;
  }

  .time-column {
    width: 130px;
    display: flex;
    justify-content: flex-end;
    padding-right: 30px;
    position: relative;
  }

  /* Connecting pip to the timeline line */
  .time-column::after {
    content: '';
    position: absolute;
    right: 7px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    background: #fff;
    border: 4px solid #111;
    border-radius: 50%;
    z-index: 3;
  }

  .brutal-time-badge {
    padding: 0.35rem 0.75rem;
    background: #fff;
    border: 2px solid #111;
    font-weight: 800;
    font-size: 1rem;
    box-shadow: 3px 3px 0px #111;
  }

  .brutal-item-card {
    flex: 1;
    display: flex;
    align-items: center;
    background: #fff;
    border: 4px solid #111;
    padding: 1rem;
    box-shadow: 6px 6px 0px #111;
    transition:
      transform 0.15s,
      box-shadow 0.15s;
    margin-left: 20px;
  }

  .brutal-item-card:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }

  .brutal-item-card:active {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0px #111;
  }

  .border-yellow:hover {
    border-color: #ffd900;
  }
  .border-blue:hover {
    border-color: #4b7bff;
  }
  .border-pink:hover {
    border-color: #ff4b4b;
  }
  .border-green:hover {
    border-color: #00e572;
  }

  .bg-yellow {
    background: #ffd900;
    color: #111;
  }
  .bg-blue {
    background: #4b7bff;
    color: #fff;
  }
  .bg-pink {
    background: #ff4b4b;
    color: #fff;
  }
  .bg-green {
    background: #00e572;
    color: #111;
  }

  .item-icon-box {
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid #111;
    margin-right: 1.5rem;
    box-shadow: 3px 3px 0px #111;
  }

  .item-details {
    flex: 1;
  }

  .item-name {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.25rem;
    margin-bottom: 0.25rem;
    text-transform: uppercase;
  }

  .item-date {
    font-size: 0.85rem;
    color: #444;
    font-weight: 600;
  }

  .item-action-arrow {
    color: #111;
    transition: transform 0.2s;
  }

  .brutal-history-item:hover .item-action-arrow {
    transform: translateX(5px);
  }

  .brutal-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 6rem 2rem;
    text-align: center;
  }

  .empty-icon-box {
    width: 100px;
    height: 100px;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    transform: rotate(5deg);
    margin-bottom: 2rem;
  }

  .empty-text {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 2rem;
    font-weight: 800;
    color: #111;
    margin-bottom: 1rem;
    background: #fff;
    padding: 0.5rem 1.5rem;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
  }

  .empty-sub {
    font-size: 1.15rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: #444;
    background: #fdfae5;
    padding: 4px 12px;
    border: 2px dashed #111;
  }

  @media (max-width: 768px) {
    .brutal-page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1.5rem;
    }
    .brutal-page-title {
      font-size: 2rem;
    }
    .header-actions {
      width: 100%;
      flex-wrap: wrap;
    }

    .brutal-timeline-container::before {
      left: 20px;
    }
    .timeline-group-header {
      margin-left: 40px;
    }
    .time-column {
      display: none;
    }
    .brutal-item-card {
      margin-left: 40px;
    }
    .brutal-timeline-container::after {
      content: '';
      position: absolute;
      left: 12px;
      /* Simulate the pip dots for mobile next to cards */
      border-color: #111;
    }
  }

  /* --- Dark Mode Overrides --- */
  [data-theme='dark'] .brutal-page-container {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }

  [data-theme='dark'] .brutal-page-header {
    background: #1a1a1a;
    border-bottom-color: #eee;
    box-shadow: 0px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-page-title {
    color: #eee;
    text-shadow: 4px 4px 0px #4b7bff;
  }
  [data-theme='dark'] .icon-clock {
    filter: drop-shadow(3px 3px 0px #eee);
  }
  [data-theme='dark'] .brutal-page-subtitle {
    background: #eee;
    color: #111;
  }

  [data-theme='dark'] .brutal-btn-primary,
  [data-theme='dark'] .brutal-btn-secondary,
  [data-theme='dark'] .brutal-btn-danger {
    border-color: #eee;
    box-shadow: 5px 5px 0px #eee;
  }

  [data-theme='dark'] .brutal-btn-primary:hover,
  [data-theme='dark'] .brutal-btn-secondary:hover,
  [data-theme='dark'] .brutal-btn-danger:hover {
    box-shadow: 7px 7px 0px #eee;
  }

  [data-theme='dark'] .brutal-btn-primary:active,
  [data-theme='dark'] .brutal-btn-secondary:active,
  [data-theme='dark'] .brutal-btn-danger:active {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .brutal-btn-secondary {
    background: #222;
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn-danger {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .brutal-btn-primary {
    background: #00994c;
    color: #fff;
  }

  [data-theme='dark'] .brutal-search-wrapper {
    background: #222;
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-search-wrapper:focus-within {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .brutal-search-input {
    color: #eee;
  }

  [data-theme='dark'] .brutal-timeline-container::before {
    background: #eee;
  }
  [data-theme='dark'] .brutal-timeline-title {
    background: #222;
    border-color: #eee;
    box-shadow: 4px 4px 0px #cc0000;
    color: #eee;
  }

  [data-theme='dark'] .time-column::after {
    background: #111;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-time-badge {
    background: #222;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
    color: #eee;
  }

  [data-theme='dark'] .brutal-item-card {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-item-card:hover {
    box-shadow: 9px 9px 0px #eee;
  }
  [data-theme='dark'] .brutal-item-card:active {
    box-shadow: 2px 2px 0px #eee;
  }

  [data-theme='dark'] .item-icon-box {
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .item-name {
    color: #eee;
  }
  [data-theme='dark'] .item-date {
    color: #aaa;
  }
  [data-theme='dark'] .item-action-arrow {
    color: #eee;
  }

  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .bg-pink {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .bg-green {
    background: #00994c;
    color: #fff;
  }

  [data-theme='dark'] .empty-icon-box {
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .empty-text {
    background: #222;
    color: #eee;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .empty-sub {
    background: #1a1a1a;
    color: #aaa;
    border-color: #eee;
  }
</style>
