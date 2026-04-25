<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">用药<span>.提醒()</span></h1>
        <div style="width: 120px"></div>
      </header>

      <div class="brutal-grid main-layout">
        <!-- 左侧：药品列表 -->
        <div class="brutal-pane main-pane">
          <div class="pane-header bg-yellow">
            <span>💊 我的药品</span>
            <div class="pane-actions">
              <button :class="{ active: filter === 'all' }" @click="filter = 'all'">全部</button>
              <button :class="{ active: filter === 'active' }" @click="filter = 'active'">
                服用中
              </button>
            </div>
          </div>

          <!-- 添加药品 -->
          <div class="add-form">
            <div class="form-row">
              <input v-model="form.name" class="brutal-input" placeholder="药品名称" />
              <input v-model="form.dosage" class="brutal-input" placeholder="剂量（如：1片）" />
            </div>
            <div class="form-row">
              <select v-model="form.frequency" class="brutal-select">
                <option value="once">每日一次</option>
                <option value="twice">每日两次</option>
                <option value="three">每日三次</option>
                <option value="custom">自定义</option>
              </select>
              <input
                v-if="form.frequency === 'custom'"
                v-model="form.times"
                class="brutal-input"
                placeholder="时间（如：8:00,12:00）"
              />
            </div>
            <div class="form-row">
              <input v-model="form.startDate" type="date" class="brutal-input" />
              <input
                v-model="form.endDate"
                type="date"
                class="brutal-input"
                placeholder="结束日期"
              />
            </div>
            <div class="form-row">
              <input
                v-model="form.notes"
                class="brutal-input full"
                placeholder="备注（如：饭后服用）"
              />
            </div>
            <div class="form-row">
              <button class="brutal-action-btn primary" @click="addMedication">+ 添加药品</button>
            </div>
          </div>

          <!-- 今日提醒 -->
          <div class="today-reminders">
            <div class="section-title">📅 今日提醒</div>
            <div class="reminder-timeline">
              <div
                v-for="reminder in todayReminders"
                :key="reminder.id"
                class="reminder-item"
                :class="{ completed: reminder.completed, upcoming: reminder.upcoming }"
              >
                <div class="reminder-time">{{ reminder.time }}</div>
                <div class="reminder-content">
                  <div class="reminder-med">{{ reminder.name }}</div>
                  <div class="reminder-dose">{{ reminder.dosage }} {{ reminder.notes }}</div>
                </div>
                <button
                  class="check-btn"
                  :class="{ checked: reminder.completed }"
                  @click="toggleReminder(reminder)"
                >
                  {{ reminder.completed ? '✓' : '' }}
                </button>
              </div>
              <div v-if="todayReminders.length === 0" class="empty-item">今日无用药提醒</div>
            </div>
          </div>

          <!-- 药品列表 -->
          <div class="meds-list">
            <div class="section-title">📋 药品清单</div>
            <div v-for="med in filteredMeds" :key="med.id" class="med-card">
              <div class="med-icon">💊</div>
              <div class="med-info">
                <div class="med-name">{{ med.name }}</div>
                <div class="med-meta">
                  <span>{{ med.dosage }}</span>
                  <span>{{ getFrequencyText(med.frequency) }}</span>
                  <span v-if="med.endDate">至 {{ formatDate(med.endDate) }}</span>
                </div>
                <div v-if="med.notes" class="med-notes">{{ med.notes }}</div>
              </div>
              <div
                class="med-status"
                :class="{ active: isMedActive(med), expired: isMedExpired(med) }"
              >
                {{ isMedExpired(med) ? '已过期' : isMedActive(med) ? '服用中' : '未开始' }}
              </div>
              <div class="med-actions">
                <button class="edit-btn" @click="editMed(med)">✎</button>
                <button class="del-btn" @click="deleteMed(med.id)">✕</button>
              </div>
            </div>
            <div v-if="filteredMeds.length === 0" class="empty-item">暂无药品记录</div>
          </div>
        </div>

        <!-- 右侧：统计和提示 -->
        <div class="brutal-pane side-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">📊 服药统计</span>
          </div>
          <div class="stats-section">
            <div class="stat-card">
              <div class="stat-value">{{ medications.length }}</div>
              <div class="stat-label">药品数量</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ todayTaken }}</div>
              <div class="stat-label">今日已服</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ adherenceRate }}%</div>
              <div class="stat-label">本周依从率</div>
            </div>
          </div>

          <div class="pane-header bg-red" style="margin-top: 1rem">
            <span class="text-white">⚠️ 用药注意</span>
          </div>
          <div class="warnings-section">
            <div class="warning-item">🕐 请按时服药，不要漏服或重复服用</div>
            <div class="warning-item">📋 注意药品有效期</div>
            <div class="warning-item">💧 服药时请饮用足量温水</div>
            <div class="warning-item">🚫 避免与酒类同服</div>
            <div class="warning-item">📞 如有不适请及时就医</div>
          </div>

          <div class="pane-header bg-dark" style="margin-top: 1rem">
            <span class="text-white">💡 温馨提示</span>
          </div>
          <div class="tips-section">
            <div class="tip-item">建议设置手机闹钟提醒</div>
            <div class="tip-item">药品请存放在阴凉干燥处</div>
            <div class="tip-item">儿童药品请放置在儿童触及不到的地方</div>
          </div>
        </div>
      </div>

      <div class="brutal-status info">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i"
              >© 2026 LRM工具箱 - 用药提醒 // 按时服药 // 数据本地存储 // &nbsp;</span
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

  const STORAGE_KEY = 'lrm_medication_reminder';

  const form = ref({
    name: '',
    dosage: '',
    frequency: 'three',
    times: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: ''
  });

  const medications = ref([]);
  const takenRecords = ref({}); // { '2024-01-15': [reminderId1, reminderId2] }
  const filter = ref('all');

  const loadData = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      medications.value = parsed.medications || [];
      takenRecords.value = parsed.takenRecords || {};
    }
  };

  const saveData = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ medications: medications.value, takenRecords: takenRecords.value })
    );
  };

  const addMedication = () => {
    if (!form.value.name.trim()) {
      ElMessage.warning('请输入药品名称');
      return;
    }
    if (!form.value.dosage.trim()) {
      ElMessage.warning('请输入剂量');
      return;
    }

    medications.value.push({
      id: Date.now(),
      name: form.value.name.trim(),
      dosage: form.value.dosage.trim(),
      frequency: form.value.frequency,
      times: form.value.times,
      startDate: form.value.startDate,
      endDate: form.value.endDate,
      notes: form.value.notes.trim(),
      createdAt: new Date().toISOString()
    });

    saveData();
    ElMessage.success('添加成功');

    form.value = {
      name: '',
      dosage: '',
      frequency: 'three',
      times: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      notes: ''
    };
  };

  const deleteMed = id => {
    medications.value = medications.value.filter(m => m.id !== id);
    saveData();
    ElMessage.success('已删除');
  };

  const editMed = () => {
    ElMessage.info('编辑功能开发中');
  };

  const getFrequencyText = freq => {
    const map = { once: '每日一次', twice: '每日两次', three: '每日三次', custom: '自定义' };
    return map[freq] || freq;
  };

  const getMedTimes = med => {
    if (med.frequency === 'once') return ['08:00'];
    if (med.frequency === 'twice') return ['08:00', '20:00'];
    if (med.frequency === 'three') return ['08:00', '12:00', '18:00'];
    if (med.times) return med.times.split(',').map(t => t.trim());
    return ['08:00'];
  };

  const formatDate = date => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const isMedActive = med => {
    const today = new Date().toISOString().split('T')[0];
    return med.startDate <= today && (!med.endDate || med.endDate >= today);
  };

  const isMedExpired = med => {
    if (!med.endDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return med.endDate < today;
  };

  const today = new Date().toISOString().split('T')[0];
  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();
  const currentTimeNum = currentHour * 60 + currentMinute;

  const todayReminders = computed(() => {
    const reminders = [];
    medications.value
      .filter(m => isMedActive(m))
      .forEach(med => {
        getMedTimes(med).forEach((time, index) => {
          const [h, m] = time.split(':').map(Number);
          const timeNum = (h || 0) * 60 + (m || 0);
          const reminderId = `${med.id}-${index}`;
          const completed = takenRecords.value[today]?.includes(reminderId);

          reminders.push({
            id: reminderId,
            medId: med.id,
            name: med.name,
            dosage: med.dosage,
            notes: med.notes,
            time,
            completed,
            upcoming: !completed && timeNum > currentTimeNum
          });
        });
      });
    return reminders.sort((a, b) => {
      const [ah, am] = a.time.split(':').map(Number);
      const [bh, bm] = b.time.split(':').map(Number);
      return ah * 60 + am - (bh * 60 + bm);
    });
  });

  const toggleReminder = reminder => {
    if (!takenRecords.value[today]) takenRecords.value[today] = [];
    const index = takenRecords.value[today].indexOf(reminder.id);
    if (index > -1) {
      takenRecords.value[today].splice(index, 1);
      ElMessage.info('已取消');
    } else {
      takenRecords.value[today].push(reminder.id);
      ElMessage.success('已标记为已服用');
    }
    saveData();
  };

  const todayTaken = computed(() => takenRecords.value[today]?.length || 0);

  const adherenceRate = computed(() => {
    const last7Days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]);
    }

    let totalReminders = 0;
    let totalTaken = 0;

    last7Days.forEach(date => {
      medications.value
        .filter(m => isMedActive(m))
        .forEach(med => {
          totalReminders += getMedTimes(med).length;
        });
      totalTaken += takenRecords.value[date]?.length || 0;
    });

    if (totalReminders === 0) return 0;
    return Math.round((totalTaken / totalReminders) * 100);
  });

  const filteredMeds = computed(() => {
    if (filter.value === 'active') {
      return medications.value.filter(m => isMedActive(m) && !isMedExpired(m));
    }
    return medications.value;
  });

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
  .bg-red {
    background: #ff4b4b;
  }
  .bg-dark {
    background: #111;
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

  .section-title {
    font-weight: 800;
    padding: 1rem 1.5rem 0.5rem;
    font-family: 'Syne', sans-serif;
  }

  .today-reminders {
    border-bottom: 4px solid #111;
  }
  .reminder-timeline {
    padding: 0 1.5rem 1rem;
    max-height: 200px;
    overflow-y: auto;
  }

  .reminder-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }
  .reminder-item.completed {
    background: #d4f8d4;
    opacity: 0.7;
  }
  .reminder-item.upcoming {
    border-color: #4b7bff;
    background: #e8f4ff;
  }

  .reminder-time {
    font-weight: 800;
    font-size: 1.1rem;
    font-family: 'Syne', sans-serif;
    min-width: 60px;
  }
  .reminder-content {
    flex: 1;
  }
  .reminder-med {
    font-weight: 700;
  }
  .reminder-dose {
    font-size: 0.85rem;
    color: #666;
  }

  .check-btn {
    width: 36px;
    height: 36px;
    border: 3px solid #111;
    background: #fff;
    font-size: 1.2rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }
  .check-btn.checked {
    background: #00e572;
  }
  .check-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 4px 4px 0px #111;
  }

  .meds-list {
    padding: 0 1.5rem 1rem;
    flex: 1;
    overflow-y: auto;
    max-height: 250px;
  }

  .med-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    margin-bottom: 0.75rem;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
  }
  .med-card:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .med-icon {
    font-size: 1.5rem;
  }
  .med-info {
    flex: 1;
  }
  .med-name {
    font-weight: 800;
    font-size: 1.1rem;
    font-family: 'Syne', sans-serif;
  }
  .med-meta {
    display: flex;
    gap: 0.75rem;
    font-size: 0.85rem;
    color: #666;
    margin-top: 0.25rem;
  }
  .med-notes {
    font-size: 0.85rem;
    color: #888;
    margin-top: 0.25rem;
  }

  .med-status {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 800;
    border: 2px solid #111;
  }
  .med-status.active {
    background: #d4f8d4;
  }
  .med-status.expired {
    background: #ffd4d4;
  }

  .med-actions {
    display: flex;
    gap: 0.5rem;
  }
  .edit-btn,
  .del-btn {
    background: #fff;
    border: 2px solid #111;
    padding: 0.35rem 0.6rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.1s;
  }
  .edit-btn {
    background: #89b4f8;
  }
  .del-btn {
    background: #ff4b4b;
    color: #fff;
  }
  .edit-btn:hover,
  .del-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
  }

  .empty-item {
    text-align: center;
    padding: 1.5rem;
    color: #999;
    font-weight: 600;
  }

  .stats-section {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    padding: 1rem;
  }
  .stat-card {
    text-align: center;
    padding: 1rem;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #111;
  }
  .stat-value {
    font-size: 1.5rem;
    font-weight: 800;
    font-family: 'Syne', sans-serif;
  }
  .stat-label {
    font-size: 0.8rem;
    color: #666;
    margin-top: 0.25rem;
  }

  .warnings-section {
    padding: 1rem;
  }
  .warning-item {
    padding: 0.5rem 0;
    font-size: 0.9rem;
    border-bottom: 2px solid #eee;
  }
  .warning-item:last-child {
    border-bottom: none;
  }

  .tips-section {
    padding: 1rem;
  }
  .tip-item {
    padding: 0.5rem 0;
    font-size: 0.9rem;
    border-bottom: 2px solid #eee;
  }
  .tip-item:last-child {
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
  [data-theme='dark'] .reminder-item {
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .check-btn {
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .med-card {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .stat-card {
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
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
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
</style>
