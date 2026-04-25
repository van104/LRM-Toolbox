<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">借物<span>.追踪()</span></h1>
        <div style="width: 120px"></div>
      </header>

      <div class="brutal-grid main-layout">
        <!-- 左侧：借还记录 -->
        <div class="brutal-pane main-pane">
          <div class="pane-header bg-yellow">
            <span>📋 借还记录</span>
            <div class="pane-actions">
              <button :class="{ active: filter === 'all' }" @click="filter = 'all'">全部</button>
              <button :class="{ active: filter === 'lent' }" @click="filter = 'lent'">借出</button>
              <button :class="{ active: filter === 'borrowed' }" @click="filter = 'borrowed'">
                借入
              </button>
              <button :class="{ active: filter === 'overdue' }" @click="filter = 'overdue'">
                逾期
              </button>
            </div>
          </div>

          <!-- 添加记录 -->
          <div class="add-form">
            <div class="form-row">
              <select v-model="form.type" class="brutal-select">
                <option value="lent">借出</option>
                <option value="borrowed">借入</option>
              </select>
              <input v-model="form.item" class="brutal-input" placeholder="物品名称" />
            </div>
            <div class="form-row">
              <input v-model="form.person" class="brutal-input" placeholder="对方姓名" />
              <input v-model="form.contact" class="brutal-input" placeholder="联系方式（可选）" />
            </div>
            <div class="form-row">
              <input v-model="form.lendDate" type="date" class="brutal-input" title="借出日期" />
              <input v-model="form.dueDate" type="date" class="brutal-input" title="预计归还日期" />
            </div>
            <div class="form-row">
              <input
                v-model="form.notes"
                class="brutal-input full"
                placeholder="备注（如：物品状态、附件等）"
              />
            </div>
            <div class="form-row">
              <button class="brutal-action-btn primary" @click="addRecord">+ 添加记录</button>
            </div>
          </div>

          <!-- 统计概览 -->
          <div class="summary-cards">
            <div class="summary-card lent">
              <div class="label">借出</div>
              <div class="amount">{{ lentCount }}</div>
            </div>
            <div class="summary-card borrowed">
              <div class="label">借入</div>
              <div class="amount">{{ borrowedCount }}</div>
            </div>
            <div class="summary-card overdue">
              <div class="label">逾期</div>
              <div class="amount">{{ overdueCount }}</div>
            </div>
          </div>

          <!-- 记录列表 -->
          <div class="records-list">
            <div
              v-for="record in filteredRecords"
              :key="record.id"
              class="record-card"
              :class="{ overdue: isOverdue(record), returned: record.returned }"
            >
              <div class="record-type" :class="record.type">
                {{ record.type === 'lent' ? '借出' : '借入' }}
              </div>
              <div class="record-info">
                <div class="record-item">{{ record.item }}</div>
                <div class="record-person">
                  <span class="person-label">{{ record.type === 'lent' ? '借给' : '向' }}</span>
                  <span class="person-name">{{ record.person }}</span>
                </div>
                <div class="record-dates">
                  <span>{{ formatDate(record.lendDate) }}</span>
                  <span v-if="record.dueDate"> → {{ formatDate(record.dueDate) }}</span>
                </div>
                <div v-if="record.notes" class="record-notes">{{ record.notes }}</div>
              </div>
              <div class="record-status">
                <div v-if="record.returned" class="status-returned">已归还</div>
                <div v-else-if="isOverdue(record)" class="status-overdue">
                  逾期 {{ getOverdueDays(record) }} 天
                </div>
                <div v-else class="status-active">剩余 {{ getDaysRemaining(record) }} 天</div>
              </div>
              <div class="record-actions">
                <button v-if="!record.returned" class="return-btn" @click="markReturned(record)">
                  归还
                </button>
                <button class="del-btn" @click="deleteRecord(record.id)">✕</button>
              </div>
            </div>
            <div v-if="filteredRecords.length === 0" class="empty-item">暂无借还记录</div>
          </div>
        </div>

        <!-- 右侧：提醒和统计 -->
        <div class="brutal-pane side-pane">
          <div class="pane-header bg-red">
            <span class="text-white">⏰ 逾期提醒</span>
          </div>
          <div class="alert-section">
            <div v-for="record in overdueRecords" :key="record.id" class="alert-item">
              <span class="alert-icon">{{ record.type === 'lent' ? '📤' : '📥' }}</span>
              <span class="alert-content">
                <span class="alert-item-name">{{ record.item }}</span>
                <span class="alert-person">{{ record.person }}</span>
              </span>
              <span class="alert-days">{{ getOverdueDays(record) }}天</span>
            </div>
            <div v-if="overdueRecords.length === 0" class="empty-alert">暂无逾期物品</div>
          </div>

          <div class="pane-header bg-blue" style="margin-top: 1rem">
            <span class="text-white">📊 借还统计</span>
          </div>
          <div class="stats-section">
            <div class="stat-row">
              <span class="stat-label">总记录数</span>
              <span class="stat-value">{{ records.length }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">已归还</span>
              <span class="stat-value">{{ returnedCount }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">待归还</span>
              <span class="stat-value">{{ pendingCount }}</span>
            </div>
          </div>

          <div class="pane-header bg-dark" style="margin-top: 1rem">
            <span class="text-white">💡 小贴士</span>
          </div>
          <div class="tips-section">
            <div class="tip-item">📸 借出贵重物品建议拍照留存</div>
            <div class="tip-item">📝 借出时记录物品当前状态</div>
            <div class="tip-item">📅 设置合理的归还期限</div>
            <div class="tip-item">🔔 定期检查待归还物品</div>
          </div>

          <div class="pane-header bg-green" style="margin-top: 1rem">
            <span>📜 借还原则</span>
          </div>
          <div class="principles-section">
            <div class="principle-item">有借有还，再借不难</div>
            <div class="principle-item">爱惜他人财物</div>
            <div class="principle-item">按时归还是美德</div>
          </div>
        </div>
      </div>

      <div class="brutal-status info">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i"
              >© 2026 LRM工具箱 - 借物追踪 // 有借有还 // 数据本地存储 // &nbsp;</span
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

  const STORAGE_KEY = 'lrm_borrow_tracker';

  const form = ref({
    type: 'lent',
    item: '',
    person: '',
    contact: '',
    lendDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: ''
  });

  const records = ref([]);
  const filter = ref('all');

  const loadRecords = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) records.value = JSON.parse(data);
  };

  const saveRecords = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(records.value));

  const addRecord = () => {
    if (!form.value.item.trim()) {
      ElMessage.warning('请输入物品名称');
      return;
    }
    if (!form.value.person.trim()) {
      ElMessage.warning('请输入对方姓名');
      return;
    }

    records.value.unshift({
      id: Date.now(),
      type: form.value.type,
      item: form.value.item.trim(),
      person: form.value.person.trim(),
      contact: form.value.contact.trim(),
      lendDate: form.value.lendDate,
      dueDate: form.value.dueDate,
      notes: form.value.notes.trim(),
      returned: false,
      returnedDate: null,
      createdAt: new Date().toISOString()
    });

    saveRecords();
    ElMessage.success('添加成功');

    form.value = {
      type: 'lent',
      item: '',
      person: '',
      contact: '',
      lendDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      notes: ''
    };
  };

  const deleteRecord = id => {
    records.value = records.value.filter(r => r.id !== id);
    saveRecords();
    ElMessage.success('已删除');
  };

  const markReturned = record => {
    record.returned = true;
    record.returnedDate = new Date().toISOString().split('T')[0];
    saveRecords();
    ElMessage.success('已标记为归还');
  };

  const formatDate = date => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const isOverdue = record => {
    if (record.returned || !record.dueDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return record.dueDate < today;
  };

  const getOverdueDays = record => {
    if (!record.dueDate) return 0;
    const today = new Date();
    const due = new Date(record.dueDate);
    return Math.floor((today - due) / (1000 * 60 * 60 * 24));
  };

  const getDaysRemaining = record => {
    if (!record.dueDate) return '-';
    const today = new Date();
    const due = new Date(record.dueDate);
    return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  };

  const lentCount = computed(
    () => records.value.filter(r => r.type === 'lent' && !r.returned).length
  );
  const borrowedCount = computed(
    () => records.value.filter(r => r.type === 'borrowed' && !r.returned).length
  );
  const overdueCount = computed(() => records.value.filter(r => isOverdue(r)).length);
  const returnedCount = computed(() => records.value.filter(r => r.returned).length);
  const pendingCount = computed(() => records.value.filter(r => !r.returned).length);

  const overdueRecords = computed(() =>
    records.value
      .filter(r => isOverdue(r))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 6)
  );

  const filteredRecords = computed(() => {
    if (filter.value === 'lent') return records.value.filter(r => r.type === 'lent');
    if (filter.value === 'borrowed') return records.value.filter(r => r.type === 'borrowed');
    if (filter.value === 'overdue') return records.value.filter(r => isOverdue(r));
    return records.value;
  });

  onMounted(loadRecords);
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
  .bg-red {
    background: #ff4b4b;
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

  .summary-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
  }
  .summary-card {
    text-align: center;
    padding: 1rem;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
  }
  .summary-card.lent {
    background: #d4f8ff;
  }
  .summary-card.borrowed {
    background: #f0d4ff;
  }
  .summary-card.overdue {
    background: #ffd4d4;
  }
  .summary-card .label {
    font-size: 0.85rem;
    font-weight: 600;
  }
  .summary-card .amount {
    font-size: 1.5rem;
    font-weight: 800;
    font-family: 'Syne', sans-serif;
  }

  .records-list {
    padding: 1rem 1.5rem;
    flex: 1;
    overflow-y: auto;
    max-height: 300px;
  }

  .record-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    margin-bottom: 0.75rem;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
  }
  .record-card:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }
  .record-card.overdue {
    background: #fff4d4;
    border-color: #ff9800;
  }
  .record-card.returned {
    background: #f5f5f5;
    opacity: 0.7;
  }

  .record-type {
    padding: 0.5rem;
    font-weight: 800;
    font-size: 0.85rem;
    border: 2px solid #111;
    min-width: 50px;
    text-align: center;
  }
  .record-type.lent {
    background: #d4f8ff;
  }
  .record-type.borrowed {
    background: #f0d4ff;
  }

  .record-info {
    flex: 1;
  }
  .record-item {
    font-weight: 800;
    font-size: 1.1rem;
    font-family: 'Syne', sans-serif;
  }
  .record-person {
    font-size: 0.9rem;
    margin-top: 0.25rem;
  }
  .person-label {
    color: #666;
  }
  .person-name {
    font-weight: 700;
  }
  .record-dates {
    font-size: 0.85rem;
    color: #888;
    margin-top: 0.25rem;
  }
  .record-notes {
    font-size: 0.85rem;
    color: #999;
    margin-top: 0.25rem;
  }

  .record-status {
    text-align: right;
  }
  .status-returned {
    color: #4caf50;
    font-weight: 700;
    font-size: 0.9rem;
  }
  .status-overdue {
    color: #ff5722;
    font-weight: 700;
    font-size: 0.9rem;
  }
  .status-active {
    color: #666;
    font-size: 0.85rem;
  }

  .record-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .return-btn {
    background: #00e572;
    border: 2px solid #111;
    padding: 0.35rem 0.75rem;
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.1s;
  }
  .return-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
  }
  .del-btn {
    background: #ff4b4b;
    color: #fff;
    border: 2px solid #111;
    padding: 0.35rem 0.5rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
  }

  .empty-item {
    text-align: center;
    padding: 2rem;
    color: #999;
    font-weight: 600;
  }

  .alert-section {
    padding: 1rem;
  }
  .alert-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    background: #fff4d4;
    border: 3px solid #ff9800;
    box-shadow: 3px 3px 0px #ff9800;
  }
  .alert-icon {
    font-size: 1.2rem;
  }
  .alert-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .alert-item-name {
    font-weight: 700;
  }
  .alert-person {
    font-size: 0.85rem;
    color: #666;
  }
  .alert-days {
    font-weight: 800;
    color: #ff5722;
  }

  .empty-alert {
    text-align: center;
    color: #999;
    padding: 1rem;
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

  .tips-section,
  .principles-section {
    padding: 1rem;
  }
  .tip-item,
  .principle-item {
    padding: 0.5rem 0;
    font-size: 0.9rem;
    border-bottom: 2px solid #eee;
  }
  .tip-item:last-child,
  .principle-item:last-child {
    border-bottom: none;
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
  [data-theme='dark'] .brutal-select {
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
  [data-theme='dark'] .summary-card {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
    background: #222;
  }
  [data-theme='dark'] .record-card {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .record-type {
    border-color: #eee;
  }
  [data-theme='dark'] .alert-item {
    border-color: #ff9800;
    box-shadow: 3px 3px 0px #ff9800;
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
  [data-theme='dark'] .bg-red {
    background: #cc0000;
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
