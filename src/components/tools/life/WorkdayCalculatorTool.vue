<template>
  <div class="workday-calculator-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>工作日计算器</h1>
        <span class="nav-subtitle">Workday Calculator</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="result-card glass-card">
        <div class="result-header">工作日天数</div>
        <div class="result-value">{{ workdayCount }} <span class="unit">天</span></div>
        <div class="result-details">
          <span>总天数: {{ totalDays }}</span>
          <span>周末: {{ weekendDays }}</span>
          <span>节假日: {{ holidayDays }}</span>
          <span>补班: {{ makeupDays }}</span>
        </div>
      </div>

      <div class="layout-grid">
        <section class="settings-panel glass-card">
          <h3>
            <el-icon>
              <Calendar />
            </el-icon>
            日期范围
          </h3>
          <div class="form-group">
            <label>开始日期</label>
            <el-date-picker
              v-model="startDate"
              type="date"
              placeholder="开始日期"
              class="full-width"
              :clearable="false"
            />
          </div>
          <div class="form-group">
            <label>结束日期</label>
            <el-date-picker
              v-model="endDate"
              type="date"
              placeholder="结束日期"
              class="full-width"
              :clearable="false"
            />
          </div>

          <h3>
            <el-icon>
              <Setting />
            </el-icon>
            规则设置
          </h3>
          <div class="switch-group">
            <span class="label">剔除周末 (周六日)</span>
            <el-switch v-model="excludeWeekends" />
          </div>
        </section>

        <section class="holidays-panel glass-card">
          <div class="panel-header">
            <h3>特殊日期调整</h3>
            <div class="btn-group">
              <button class="text-btn" @click="loadExample2026">加载2026示例</button>
              <button class="text-btn danger" @click="clearHolidays">清空</button>
            </div>
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
              <el-date-picker
                v-model="tempDate"
                type="date"
                placeholder="选择日期添加"
                size="small"
                style="width: 140px"
              />
              <button class="add-btn" :disabled="!tempDate" @click="addSpecialDate">
                <el-icon>
                  <Plus />
                </el-icon>
              </button>
            </div>

            <div class="list-container">
              <ul v-if="currentList.length" class="date-list">
                <li v-for="d in currentList" :key="d">
                  {{ d }}
                  <button class="del-btn" @click="removeDate(d)">
                    <el-icon>
                      <Close />
                    </el-icon>
                  </button>
                </li>
              </ul>
              <div v-else class="empty-tip">暂无数据</div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 工作日计算器</footer>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { Back, Calendar, Setting, Plus, Close } from '@element-plus/icons-vue';
  import dayjs from 'dayjs';
  import isBetween from 'dayjs/plugin/isBetween';
  import { ElMessage } from 'element-plus';

  dayjs.extend(isBetween);

  const startDate = ref(new Date());
  const endDate = ref(dayjs().add(1, 'month').toDate());
  const excludeWeekends = ref(true);

  const holidays = ref([]);
  const workdays = ref([]);

  const activeTab = ref('holiday');
  const tempDate = ref(null);

  const formatDate = date => dayjs(date).format('YYYY-MM-DD');

  const currentList = computed(() => {
    const list = activeTab.value === 'holiday' ? holidays.value : workdays.value;
    return list.slice().sort();
  });

  const addSpecialDate = () => {
    if (!tempDate.value) return;
    const dStr = formatDate(tempDate.value);

    if (holidays.value.includes(dStr)) {
      if (activeTab.value === 'work') {
        holidays.value = holidays.value.filter(d => d !== dStr);
      } else {
        ElMessage.warning('该日期已在节假日列表中');
        return;
      }
    }
    if (workdays.value.includes(dStr)) {
      if (activeTab.value === 'holiday') {
        workdays.value = workdays.value.filter(d => d !== dStr);
      } else {
        ElMessage.warning('该日期已在补班列表中');
        return;
      }
    }

    if (activeTab.value === 'holiday') holidays.value.push(dStr);
    else workdays.value.push(dStr);

    tempDate.value = null;
  };

  const removeDate = dateStr => {
    if (activeTab.value === 'holiday') {
      holidays.value = holidays.value.filter(d => d !== dateStr);
    } else {
      workdays.value = workdays.value.filter(d => d !== dateStr);
    }
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
    ElMessage.success('已加载 2026 年示例节假日配置');
  };

  const clearHolidays = () => {
    holidays.value = [];
    workdays.value = [];
  };

  const calculations = computed(() => {
    if (!startDate.value || !endDate.value) {
      return { count: 0, total: 0, weekend: 0, holi: 0, makeup: 0 };
    }
    let start = dayjs(startDate.value).startOf('day');
    let end = dayjs(endDate.value).startOf('day');

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
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

  .workday-calculator-tool {
    --bg: #faf9f7;
    --card: #ffffff;
    --border: #e8e6e3;
    --text: #1a1a1a;
    --text-secondary: #6b6b6b;
    --accent: #2563eb;
    --accent-light: #eff6ff;
    --success: #10b981;
    --danger: #ef4444;

    font-family: 'Noto Sans SC', sans-serif;
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
  }

  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background: var(--card);
    border-bottom: 1px solid var(--border);
  }

  .nav-back,
  .nav-spacer {
    width: 80px;
  }

  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 0.9rem;
    padding: 0.5rem 0;
  }

  .nav-center h1 {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    display: block;
    text-align: center;
  }

  .main-content {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }

  .glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  .result-card {
    text-align: center;
    background: var(--accent-light);
    border-color: transparent;
  }

  .result-header {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }

  .result-value {
    font-size: 3.5rem;
    font-weight: 700;
    color: var(--accent);
    line-height: 1;
    margin-bottom: 1rem;
  }

  .result-value .unit {
    font-size: 1.2rem;
    color: var(--text-secondary);
    font-weight: 400;
  }

  .result-details {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    font-size: 0.85rem;
    color: var(--text-secondary);
    flex-wrap: wrap;
  }

  .layout-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .settings-panel h3 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    margin-bottom: 1rem;
    color: var(--text);
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }

  .full-width {
    width: 100% !important;
  }

  .switch-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .panel-header h3 {
    font-size: 1rem;
    margin: 0;
  }

  .text-btn {
    background: none;
    border: none;
    color: var(--accent);
    cursor: pointer;
    font-size: 0.8rem;
    padding: 2px 6px;
  }

  .text-btn.danger {
    color: var(--danger);
  }

  .text-btn:hover {
    text-decoration: underline;
  }

  .tabs {
    display: flex;
    background: var(--bg);
    padding: 3px;
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .tabs button {
    flex: 1;
    border: none;
    background: transparent;
    padding: 0.5rem;
    font-size: 0.85rem;
    cursor: pointer;
    border-radius: 6px;
    color: var(--text-secondary);
    transition: all 0.2s;
  }

  .tabs button.active {
    background: white;
    color: var(--text);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    font-weight: 500;
  }

  .date-manager {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .add-box {
    display: flex;
    gap: 0.5rem;
  }

  .add-btn {
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 4px;
    width: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .add-btn:disabled {
    opacity: 0.5;
  }

  .list-container {
    height: 200px;
    overflow-y: auto;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--bg);
    padding: 0.5rem;
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
    padding: 0.4rem 0.6rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.03);
    font-size: 0.9rem;
    color: var(--text);
  }

  .del-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 2px;
  }

  .del-btn:hover {
    color: var(--danger);
  }

  .empty-tip {
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.85rem;
    padding-top: 2rem;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
    font-size: 0.85rem;
    border-top: 1px solid var(--border);
    margin-top: 2rem;
  }

  @media (max-width: 768px) {
    .layout-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
