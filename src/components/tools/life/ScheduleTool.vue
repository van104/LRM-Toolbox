<template>
  <div class="brutal-wrapper">
    <div class="brutal-container" style="max-width: 1400px; width: 100%">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">日程<span>.排课()</span></h1>

        <div class="header-actions">
          <button class="brutal-btn" @click="showAddDialog">+ 添加</button>
          <button class="brutal-btn menu-btn" @click="menuOpen = !menuOpen">⚙️ 菜单 ▼</button>

          <div v-if="menuOpen" class="brutal-dropdown">
            <button class="dropdown-item" @click="openSettings">学期设置</button>
            <button class="dropdown-item" @click="exportData">导出 JSON</button>
            <button class="dropdown-item" @click="importData">导入 JSON</button>
            <button class="dropdown-item danger" @click="clearData">清空数据</button>
          </div>
        </div>
      </header>

      <main class="main-content">
        <section class="brutal-pane control-panel">
          <div class="week-selector">
            <div class="current-week-info">
              <span class="label">第</span>
              <span class="week-num">{{ currentViewWeek }}</span>
              <span class="label">周</span>
              <span v-if="currentViewWeek === realCurrentWeek" class="brutal-badge bg-green"
                >本周</span
              >
            </div>
            <div class="week-nav">
              <button class="nav-btn" :disabled="currentViewWeek <= 1" @click="changeWeek(1)">
                首页
              </button>
              <button
                class="nav-btn"
                :disabled="currentViewWeek <= 1"
                @click="changeWeek(currentViewWeek - 1)"
              >
                ◀
              </button>
              <button
                class="nav-btn bg-yellow text-black"
                @click="currentViewWeek = realCurrentWeek"
              >
                回到本周
              </button>
              <button
                class="nav-btn"
                :disabled="currentViewWeek >= totalWeeks"
                @click="changeWeek(currentViewWeek + 1)"
              >
                ▶
              </button>
              <button
                class="nav-btn"
                :disabled="currentViewWeek >= totalWeeks"
                @click="changeWeek(totalWeeks)"
              >
                末页
              </button>

              <select v-model.number="currentViewWeek" class="brutal-select week-select">
                <option v-for="w in totalWeeks" :key="w" :value="w">第 {{ w }} 周</option>
              </select>
            </div>
          </div>
        </section>

        <section class="schedule-container brutal-pane">
          <div class="table-wrapper">
            <table class="brutal-table">
              <thead>
                <tr>
                  <th class="time-col bg-dark text-white">时间段</th>
                  <th
                    v-for="(day, index) in weekDays"
                    :key="index"
                    :class="{ 'is-today': isToday(index) }"
                  >
                    <div class="day-name">{{ day }}</div>
                    <div class="day-date">{{ getDayDate(index) }}</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(slot, slotIdx) in timeSlots" :key="slotIdx">
                  <td class="time-slot-cell bg-dark text-white">
                    <div class="slot-idx">{{ slotIdx + 1 }}</div>
                    <div class="slot-time">{{ slot }}</div>
                  </td>
                  <td
                    v-for="(day, dayIdx) in weekDays"
                    :key="dayIdx"
                    class="course-cell"
                    :class="{ 'is-today': isToday(dayIdx) }"
                  >
                    <div
                      v-for="course in getCoursesAt(dayIdx, slotIdx)"
                      :key="course.id"
                      class="course-card"
                      :style="{ backgroundColor: getCourseColor(course.course_name) }"
                      @click="editCourse(course)"
                    >
                      <div class="course-name">{{ course.course_name }}</div>
                      <div class="course-info">🧑 {{ course.teacher }}</div>
                      <div class="course-info">📍 {{ course.classroom }}</div>
                      <div class="course-week">{{ course.week_range }}</div>

                      <button class="del-course-btn" @click.stop="confirmDelete(course.id)">
                        ✖
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <!-- Course Edit/Add Modal -->
      <div v-if="dialogVisible" class="brutal-modal-overlay" @click.self="dialogVisible = false">
        <div class="brutal-modal-content brutal-pane" style="max-width: 500px">
          <div class="pane-header bg-yellow text-black">
            <span>{{ isEdit ? '编辑课程' : '添加课程' }}</span>
            <button class="close-btn text-black" @click="dialogVisible = false">✖</button>
          </div>
          <div class="pane-body">
            <div v-if="!isEdit" class="paste-parser mb-3">
              <textarea
                v-model="pasteData"
                class="brutal-input full"
                rows="3"
                placeholder="粘贴课程信息识别，格式如：\n计算机网络\n(3-4节)3-12周/6号楼301/张老师"
              ></textarea>
              <button class="brutal-action-btn bg-dark text-white full mt-2" @click="parsePaste">
                自动识别并填充
              </button>
            </div>

            <div class="brutal-form">
              <div class="form-group">
                <label>课程名称 *</label>
                <input
                  v-model="courseForm.course_name"
                  class="brutal-input full"
                  placeholder="请输入课程名称"
                />
              </div>
              <div class="form-group">
                <label>教师姓名 *</label>
                <input
                  v-model="courseForm.teacher"
                  class="brutal-input full"
                  placeholder="请输入教师姓名"
                />
              </div>
              <div class="form-group">
                <label>上课教室 *</label>
                <input
                  v-model="courseForm.classroom"
                  class="brutal-input full"
                  placeholder="请输入教室"
                />
              </div>
              <div class="form-group">
                <label>周次范围 *</label>
                <input
                  v-model="courseForm.week_range"
                  class="brutal-input full"
                  placeholder="如：1-18周, 1,3,5周, 1-15周(单)"
                />
              </div>

              <div class="form-row">
                <div class="form-group half">
                  <label>星期 *</label>
                  <select v-model.number="courseForm.week_day" class="brutal-select full">
                    <option v-for="(day, idx) in weekDays" :key="idx" :value="idx">
                      {{ day }}
                    </option>
                  </select>
                </div>
                <div class="form-group half">
                  <label>节次 *</label>
                  <select v-model.number="courseForm.time_slot" class="brutal-select full">
                    <option v-for="(slot, idx) in timeSlots" :key="idx" :value="idx">
                      第 {{ idx + 1 }} 节 ({{ slot }})
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div class="flex-row mt-4" style="gap: 1rem">
              <button class="brutal-action-btn full" @click="dialogVisible = false">取消</button>
              <button class="brutal-action-btn bg-blue text-white full" @click="saveCourse">
                保存课程
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Settings Modal -->
      <div
        v-if="settingsVisible"
        class="brutal-modal-overlay"
        @click.self="settingsVisible = false"
      >
        <div class="brutal-modal-content brutal-pane" style="max-width: 500px">
          <div class="pane-header bg-dark text-white">
            <span>⚙️ 学期设置</span>
            <button class="close-btn" @click="settingsVisible = false">✖</button>
          </div>
          <div class="pane-body">
            <div class="brutal-form">
              <div class="form-group">
                <label>开学日期 (第一周周一)</label>
                <input v-model="settingsForm.start_date" type="date" class="brutal-input full" />
              </div>
              <div class="form-group">
                <label>总周数</label>
                <input
                  v-model.number="settingsForm.total_weeks"
                  type="number"
                  min="1"
                  max="52"
                  class="brutal-input full"
                />
              </div>

              <hr class="brutal-divider mt-2 mb-2" />

              <label>时间段设置 (节次规则)</label>
              <div class="slots-list mt-2">
                <div
                  v-for="(slot, index) in settingsForm.time_slots"
                  :key="index"
                  class="slot-item"
                >
                  <input
                    v-model="settingsForm.time_slots[index]"
                    class="brutal-input full mr-1"
                    placeholder="HH:mm-HH:mm"
                  />
                  <button
                    class="del-slot-btn"
                    :disabled="settingsForm.time_slots.length <= 1"
                    @click="removeSlot(index)"
                  >
                    ✖
                  </button>
                </div>
                <button
                  class="brutal-action-btn mt-2 full"
                  style="border-style: dashed"
                  @click="addSlot"
                >
                  + 追加时间段
                </button>
              </div>
            </div>

            <div class="flex-row mt-4" style="gap: 1rem">
              <button class="brutal-action-btn full" @click="settingsVisible = false">取消</button>
              <button class="brutal-action-btn bg-green text-black full" @click="saveSettings">
                保存配置
              </button>
            </div>
          </div>
        </div>
      </div>

      <input
        ref="fileInput"
        type="file"
        style="display: none"
        accept=".json"
        @change="handleFileImport"
      />
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import dayjs from 'dayjs';

  const router = useRouter();
  const goBack = () => router.back();

  const menuOpen = ref(false);

  // Close dropdown on outside click roughly
  document.addEventListener('click', e => {
    if (!e.target.closest('.header-actions')) {
      menuOpen.value = false;
    }
  });

  const DEFAULT_WEEK_DAYS = ['周一', '周二', '周三', '周四', '周五'];
  const DEFAULT_TIME_SLOTS = [
    '08:00-09:50',
    '10:10-12:00',
    '14:00-15:50',
    '16:10-18:00',
    '19:00-20:50'
  ];

  const courses = ref([]);
  const weekDays = ref([...DEFAULT_WEEK_DAYS]);
  const timeSlots = ref([...DEFAULT_TIME_SLOTS]);
  const startDate = ref('2025-08-31');
  const totalWeeks = ref(18);
  const currentViewWeek = ref(1);
  const realCurrentWeek = ref(1);

  const dialogVisible = ref(false);
  const isEdit = ref(false);
  const pasteData = ref('');
  const courseForm = reactive({
    id: null,
    course_name: '',
    teacher: '',
    classroom: '',
    week_range: '',
    week_day: 0,
    time_slot: 0
  });

  const settingsVisible = ref(false);
  const settingsForm = reactive({
    start_date: '',
    total_weeks: 18,
    time_slots: []
  });

  const fileInput = ref(null);

  const calculateCurrentWeek = () => {
    const start = dayjs(startDate.value);
    const now = dayjs();
    if (now.isBefore(start)) return 1;
    let startMonday = start;
    if (start.day() !== 1)
      startMonday = start.subtract(start.day() === 0 ? 6 : start.day() - 1, 'day');
    const diffDays = now.diff(startMonday, 'day');
    const week = Math.floor(diffDays / 7) + 1;
    return week > totalWeeks.value ? totalWeeks.value : week;
  };

  const isToday = dayIdx => {
    const today = dayjs().day();
    return today === (dayIdx === 6 ? 0 : dayIdx + 1);
  };

  const getDayDate = dayIdx => {
    const start = dayjs(startDate.value);
    let startMonday = start;
    if (start.day() !== 1)
      startMonday = start.subtract(start.day() === 0 ? 6 : start.day() - 1, 'day');
    const targetDate = startMonday.add((currentViewWeek.value - 1) * 7 + dayIdx, 'day');
    return targetDate.format('MM-DD');
  };

  const loadData = () => {
    try {
      const savedCourses = localStorage.getItem('schedule_courses_brutal');
      const savedSettings = localStorage.getItem('schedule_settings_brutal');

      if (savedCourses) courses.value = JSON.parse(savedCourses);
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        startDate.value = settings.start_date;
        totalWeeks.value = settings.total_weeks;
        timeSlots.value = settings.time_slots || [...DEFAULT_TIME_SLOTS];
        weekDays.value = settings.week_days || [...DEFAULT_WEEK_DAYS];
      }

      realCurrentWeek.value = calculateCurrentWeek();
      currentViewWeek.value = realCurrentWeek.value;
    } catch {
      /* ignore parse errors */
    }
  };

  const saveData = () => {
    localStorage.setItem('schedule_courses_brutal', JSON.stringify(courses.value));
    localStorage.setItem(
      'schedule_settings_brutal',
      JSON.stringify({
        start_date: startDate.value,
        total_weeks: totalWeeks.value,
        time_slots: timeSlots.value,
        week_days: weekDays.value
      })
    );
  };

  const getCoursesAt = (dayIdx, slotIdx) => {
    return courses.value.filter(c => {
      if (c.week_day !== dayIdx || c.time_slot !== slotIdx) return false;
      return isWeekInRange(currentViewWeek.value, c.week_range);
    });
  };

  const isWeekInRange = (week, rangeStr) => {
    if (!rangeStr) return true;
    const cleanStr = rangeStr.replace(/\s/g, '');
    let isSingle = cleanStr.includes('(单)');
    let isDouble = cleanStr.includes('(双)');
    const rangePart = cleanStr.replace('(单)', '').replace('(双)', '').replace('周', '');

    const ranges = rangePart.split(',');
    for (const r of ranges) {
      if (r.includes('-')) {
        const [start, end] = r.split('-').map(Number);
        if (week >= start && week <= end) {
          if (isSingle && week % 2 === 0) continue;
          if (isDouble && week % 2 !== 0) continue;
          return true;
        }
      } else {
        if (parseInt(r) === week) {
          if (isSingle && week % 2 === 0) continue;
          if (isDouble && week % 2 !== 0) continue;
          return true;
        }
      }
    }
    return false;
  };

  const getCourseColor = name => {
    // Brutal saturated colors generator mapping
    const hash = Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = ['#fdfae5', '#e0f2fe', '#fefce8', '#fdf2f8', '#ffeba0', '#81e6b3', '#fff'];
    return colors[hash % colors.length];
  };

  const showAddDialog = () => {
    isEdit.value = false;
    pasteData.value = '';
    Object.assign(courseForm, {
      id: null,
      course_name: '',
      teacher: '',
      classroom: '',
      week_range: '',
      week_day: 0,
      time_slot: 0
    });
    dialogVisible.value = true;
  };

  const editCourse = course => {
    isEdit.value = true;
    Object.assign(courseForm, course);
    dialogVisible.value = true;
  };

  const saveCourse = () => {
    if (!courseForm.course_name || !courseForm.teacher || !courseForm.classroom) {
      alert('请填写必填字段');
      return;
    }
    if (isEdit.value) {
      const idx = courses.value.findIndex(c => c.id === courseForm.id);
      if (idx !== -1) courses.value[idx] = { ...courseForm, updated_at: new Date().toISOString() };
    } else {
      courses.value.push({
        ...courseForm,
        id: Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    saveData();
    dialogVisible.value = false;
  };

  const confirmDelete = id => {
    if (confirm('确定要删除这门课程吗？')) {
      courses.value = courses.value.filter(c => c.id !== id);
      saveData();
    }
  };

  const parsePaste = () => {
    if (!pasteData.value) return;
    try {
      const content = pasteData.value.trim();
      const allText = content.replace(/\n/g, ' ').trim();

      const timeMatch = allText.match(/\((\d+-\d+节)\)/);
      if (timeMatch) {
        const slotText = timeMatch[1];
        const idx = DEFAULT_TIME_SLOTS.findIndex(s => s.includes(slotText));
        if (idx !== -1) courseForm.time_slot = idx;
      }
      const weekMatch = allText.match(/(\d+-\d+周\(单\)|\d+-\d+周\(双\)|\d+-\d+周)/);
      if (weekMatch) courseForm.week_range = weekMatch[1];

      const parts = allText.split('/');
      if (parts.length >= 2) {
        courseForm.classroom = parts[1].trim();
        if (parts.length >= 3) courseForm.teacher = parts[2].trim();
      }
      let courseName = allText;
      if (timeMatch) courseName = courseName.replace(timeMatch[0], '');
      if (weekMatch) courseName = courseName.replace(weekMatch[0], '');
      const slashIdx = courseName.indexOf('/');
      if (slashIdx !== -1) courseName = courseName.substring(0, slashIdx);
      courseForm.course_name = courseName.trim();
    } catch {
      alert('解析失败，格式可能不正确');
    }
  };

  const openSettings = () => {
    menuOpen.value = false;
    Object.assign(settingsForm, {
      start_date: startDate.value,
      total_weeks: totalWeeks.value,
      time_slots: [...timeSlots.value]
    });
    settingsVisible.value = true;
  };

  const exportData = () => {
    menuOpen.value = false;
    const data = {
      version: '1.0',
      export_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      settings: {
        week_days: weekDays.value,
        time_slots: timeSlots.value,
        start_date: startDate.value,
        total_weeks: totalWeeks.value
      },
      courses: courses.value
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `course_table_${dayjs().format('YYYYMMDD_HHmmss')}.json`;
    a.click();
  };

  const importData = () => {
    menuOpen.value = false;
    fileInput.value.click();
  };

  const clearData = () => {
    menuOpen.value = false;
    if (confirm('确定要清空所有排课数据吗？此操作无法撤销。')) {
      courses.value = [];
      saveData();
    }
  };

  const addSlot = () => settingsForm.time_slots.push('00:00-00:00');
  const removeSlot = idx => settingsForm.time_slots.splice(idx, 1);

  const saveSettings = () => {
    startDate.value = settingsForm.start_date;
    totalWeeks.value = settingsForm.total_weeks;
    timeSlots.value = [...settingsForm.time_slots];
    saveData();
    realCurrentWeek.value = calculateCurrentWeek();
    settingsVisible.value = false;
  };

  const handleFileImport = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.courses && data.settings) {
          courses.value = data.courses;
          startDate.value = data.settings.start_date || startDate.value;
          totalWeeks.value = data.settings.total_weeks || totalWeeks.value;
          timeSlots.value = data.settings.time_slots || timeSlots.value;
          saveData();
          loadData();
          alert('导入成功!');
        } else {
          throw new Error('Invalid');
        }
      } catch {
        alert('导入失败：文件格式错误');
      }
    };
    reader.readAsText(file);
  };

  const changeWeek = w => {
    currentViewWeek.value = w;
  };

  onMounted(() => {
    loadData();
  });
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

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
    display: flex;
    justify-content: center;
  }
  .brutal-container {
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
    position: relative;
  }
  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #00e572;
  }
  .brutal-title span {
    color: #00e572;
    text-shadow: 4px 4px 0px #111;
    letter-spacing: 0;
  }

  .header-actions {
    display: flex;
    gap: 1rem;
    position: relative;
  }
  .brutal-dropdown {
    position: absolute;
    top: 110%;
    right: 0;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 6px 6px 0px #111;
    z-index: 100;
    display: flex;
    flex-direction: column;
    width: 160px;
  }
  .dropdown-item {
    background: transparent;
    border: none;
    font-size: 1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 700;
    padding: 0.75rem 1rem;
    cursor: pointer;
    text-align: left;
    border-bottom: 2px solid #111;
    display: block;
    width: 100%;
    transition: all 0.1s;
  }
  .dropdown-item:last-child {
    border-bottom: none;
  }
  .dropdown-item:hover {
    background: #4b7bff;
    color: #fff;
    transform: translate(-2px, -2px);
    box-shadow: 2px 2px 0px #111;
  }
  .dropdown-item.danger {
    color: #ff4b4b;
  }
  .dropdown-item.danger:hover {
    background: #ff4b4b;
    color: #fff;
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
    color: #111;
    white-space: nowrap;
  }
  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }

  .bg-yellow {
    background: #ffd900 !important;
    color: #111;
  }
  .bg-blue {
    background: #4b7bff !important;
    color: #fff;
  }
  .bg-green {
    background: #00e572 !important;
    color: #111;
  }
  .bg-dark {
    background: #111 !important;
    color: #fff;
  }
  .text-white {
    color: #fff;
  }
  .text-black {
    color: #111;
  }
  .flex-row {
    display: flex;
    align-items: center;
  }
  .full {
    width: 100%;
    box-sizing: border-box;
  }
  .mt-2 {
    margin-top: 1rem;
  }
  .mt-3 {
    margin-top: 1.5rem;
  }
  .mt-4 {
    margin-top: 2rem;
  }
  .mb-2 {
    margin-bottom: 1rem;
  }
  .mb-3 {
    margin-bottom: 1.5rem;
  }
  .mr-1 {
    margin-right: 0.5rem;
  }

  .brutal-pane {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    display: flex;
    flex-direction: column;
  }
  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.25rem;
  }
  .pane-body {
    padding: 1.5rem;
  }

  /* Table styles */
  .schedule-container {
    overflow-x: auto;
    padding: 0;
  }
  .brutal-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 900px;
    text-align: center;
  }
  .brutal-table th,
  .brutal-table td {
    border: 3px solid #111;
    padding: 0.75rem;
    vertical-align: top;
  }
  .time-col {
    width: 80px;
  }

  .day-name {
    font-size: 1.25rem;
    font-weight: 800;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
  }
  .day-date {
    font-size: 0.85rem;
    opacity: 0.8;
  }
  .is-today {
    background: #e0f2fe;
  }
  .is-today .day-name {
    color: #4b7bff;
    text-shadow: 1px 1px 0 #111;
  }

  .time-slot-cell {
    vertical-align: middle;
  }
  .slot-idx {
    font-size: 1.5rem;
    font-weight: 900;
  }
  .slot-time {
    font-size: 0.75rem;
    font-family: 'IBM Plex Mono', monospace;
    opacity: 0.9;
  }

  .course-cell {
    height: 130px;
    position: relative;
    padding: 8px;
  }
  .course-card {
    border: 3px solid #111;
    border-radius: 4px;
    box-shadow: 3px 3px 0px #111;
    padding: 8px;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 4px;
    position: relative;
    cursor: pointer;
    transition: all 0.15s;
    background: #fff;
    overflow: hidden;
  }
  .course-card:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }
  .course-name {
    font-size: 1.05rem;
    font-weight: 800;
    color: #111;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .course-info {
    font-size: 0.85rem;
    font-weight: 700;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .course-week {
    font-size: 0.75rem;
    color: #555;
    font-weight: 600;
    padding-top: 4px;
    margin-top: auto;
    border-top: 2px dashed rgba(0, 0, 0, 0.1);
  }

  .del-course-btn {
    position: absolute;
    bottom: 4px;
    right: 4px;
    width: 24px;
    height: 24px;
    background: #ff4b4b;
    border: 2px solid #111;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 900;
    opacity: 0;
    transition: opacity 0.2s;
    box-shadow: 1px 1px 0 #111;
  }
  .course-card:hover .del-course-btn {
    opacity: 1;
  }

  /* Control Panel */
  .control-panel {
    padding: 1rem 1.5rem;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    background: #fff;
  }
  .week-selector {
    display: flex;
    align-items: center;
    gap: 2rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  .current-week-info {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    font-size: 1.25rem;
    font-weight: 800;
    font-family: 'Syne', sans-serif;
  }
  .week-num {
    font-size: 2.5rem;
    color: #4b7bff;
    text-shadow: 2px 2px 0px #111;
  }
  .brutal-badge {
    font-size: 0.9rem;
    padding: 4px 8px;
    border: 2px solid #111;
    box-shadow: 2px 2px 0px #111;
    margin-left: left;
  }

  .week-nav {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  .nav-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.5rem 1rem;
    font-weight: 800;
    font-family: 'Syne', sans-serif;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .nav-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: 0 0 0 transparent;
    transform: translate(3px, 3px);
  }
  .nav-btn:not(:disabled):hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }
  .nav-btn:not(:disabled):active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }
  .brutal-select {
    border: 3px solid #111;
    padding: 0.5rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 800;
    box-shadow: 3px 3px 0px #111;
    cursor: pointer;
    outline: none;
    background: #fff;
  }
  .brutal-select:focus {
    background: #fdfae5;
  }

  /* Modal forms */
  .brutal-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }
  .brutal-modal-content {
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
  }
  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #fff;
    cursor: pointer;
    transition: transform 0.1s;
  }
  .close-btn:hover {
    transform: scale(1.1);
    text-shadow: 2px 2px 0 #111;
  }

  .brutal-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .form-group label {
    font-size: 0.95rem;
    font-weight: 800;
    color: #111;
  }
  .form-row {
    display: flex;
    gap: 1rem;
  }
  .half {
    flex: 1;
    min-width: 0;
  }
  .brutal-input {
    border: 3px solid #111;
    padding: 0.75rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 700;
    font-size: 1.05rem;
    background: #fff;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.2s;
    outline: none;
  }
  .brutal-input:focus {
    background: #ffd900;
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }

  .brutal-action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
  }
  .brutal-action-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
    background: #e5e5e5;
  }
  .brutal-action-btn:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }
  .brutal-divider {
    border: 0;
    border-bottom: 3px dashed #111;
    width: 100%;
    opacity: 0.5;
  }

  .slot-item {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  .del-slot-btn {
    background: #ff4b4b;
    border: 2px solid #111;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    font-weight: 900;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    flex-shrink: 0;
  }
  .del-slot-btn:hover:not(:disabled) {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
  }

  /* Dark mode */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-modal-content,
  [data-theme='dark'] .brutal-dropdown {
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
    box-shadow: 8px 8px 0px #eee;
  }

  [data-theme='dark'] .brutal-dropdown {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .dropdown-item {
    color: #eee;
    border-color: #eee;
  }
  [data-theme='dark'] .dropdown-item:hover {
    background: #2a4eb2;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .dropdown-item.danger {
    color: #cc0000;
  }
  [data-theme='dark'] .dropdown-item.danger:hover {
    background: #cc0000;
    color: #fff;
  }

  [data-theme='dark'] .brutal-table th,
  [data-theme='dark'] .brutal-table td {
    border-color: #eee;
  }
  [data-theme='dark'] .time-col,
  [data-theme='dark'] .time-slot-cell {
    background: #222 !important;
    color: #eee !important;
    border-color: #eee;
  }

  [data-theme='dark'] .is-today {
    background: #1f3a60 !important;
  }
  [data-theme='dark'] .is-today .day-name {
    color: #89b4f8;
    text-shadow: 1px 1px 0 #222;
  }

  [data-theme='dark'] .course-card {
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .course-card:hover {
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .course-name,
  [data-theme='dark'] .course-info {
    color: #111;
  } /* Courses remain light for pastel contrast, or flip colors below */

  [data-theme='dark'] .nav-btn {
    background: #222;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
    color: #eee;
  }
  [data-theme='dark'] .nav-btn:hover:not(:disabled) {
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .nav-btn.bg-yellow {
    background: #b28f00;
    color: #eee;
  }
  [data-theme='dark'] .week-num {
    color: #89b4f8;
    text-shadow: 2px 2px 0px #eee;
  }

  [data-theme='dark'] .brutal-action-btn:hover {
    background: #333;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2 !important;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00 !important;
  }
  [data-theme='dark'] .bg-green {
    background: #00994c !important;
  }
  [data-theme='dark'] .bg-dark {
    background: #333 !important;
  }
  [data-theme='dark'] .text-black {
    color: #eee !important;
  }

  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .brutal-select {
    background: #222;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-input:focus,
  [data-theme='dark'] .brutal-select:focus {
    background: #333;
    box-shadow: 5px 5px 0px #eee;
    transform: translate(-2px, -2px);
  }
  [data-theme='dark'] .form-group label {
    color: #ccc;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
</style>
