<template>
  <div class="brutal-wrapper">
    <div class="brutal-container" style="max-width: 1400px; width: 100%">
      <!-- 头部与周切换 -->
      <ScheduleHeader
        v-model="currentViewWeek"
        :total-weeks="totalWeeks"
        :real-current-week="realCurrentWeek"
        @back="goBack"
        @add="showAddDialog"
        @action="handleMenuAction"
      />

      <main class="main-content">
        <!-- 课表主体 -->
        <ScheduleGrid
          :courses="courses"
          :week-days="weekDays"
          :time-slots="timeSlots"
          :current-week="currentViewWeek"
          :is-today="isToday"
          :get-day-date="getDayDate"
          :is-week-in-range="isWeekInRange"
          @edit="editCourse"
          @delete="confirmDelete"
        />
      </main>

      <!-- 课程编辑器 -->
      <CourseEditor
        v-model="dialogVisible"
        :is-edit="isEdit"
        :course-data="selectedCourse"
        :week-days="weekDays"
        :time-slots="timeSlots"
        @save="handleSaveCourse"
      />

      <!-- 设置弹窗 -->
      <ScheduleSettings
        v-model="settingsVisible"
        :settings="{ startDate, totalWeeks, timeSlots }"
        @save="handleSaveSettings"
      />

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
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import dayjs from 'dayjs';
  import { useSchedule } from './Schedule/useSchedule';
  import ScheduleHeader from './Schedule/ScheduleHeader.vue';
  import ScheduleGrid from './Schedule/ScheduleGrid.vue';
  import CourseEditor from './Schedule/CourseEditor.vue';
  import ScheduleSettings from './Schedule/ScheduleSettings.vue';

  const router = useRouter();
  const goBack = () => router.back();

  const {
    courses,
    weekDays,
    timeSlots,
    startDate,
    totalWeeks,
    currentViewWeek,
    realCurrentWeek,
    isToday,
    getDayDate,
    isWeekInRange,
    loadData,
    saveData
  } = useSchedule();

  const dialogVisible = ref(false);
  const settingsVisible = ref(false);
  const isEdit = ref(false);
  const selectedCourse = ref(null);
  const fileInput = ref(null);

  function showAddDialog() {
    isEdit.value = false;
    selectedCourse.value = null;
    dialogVisible.value = true;
  }

  function editCourse(course) {
    isEdit.value = true;
    selectedCourse.value = { ...course };
    dialogVisible.value = true;
  }

  function handleSaveCourse(data) {
    if (isEdit.value) {
      const idx = courses.value.findIndex(c => c.id === data.id);
      if (idx !== -1) courses.value[idx] = { ...data, updated_at: new Date().toISOString() };
    } else {
      courses.value.push({
        ...data,
        id: Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    saveData();
    dialogVisible.value = false;
  }

  function confirmDelete(id) {
    if (window.confirm('确定要删除这门课程吗？')) {
      courses.value = courses.value.filter(c => c.id !== id);
      saveData();
    }
  }

  function handleMenuAction(type) {
    if (type === 'settings') {
      settingsVisible.value = true;
    } else if (type === 'export') {
      exportData();
    } else if (type === 'import') {
      fileInput.value.click();
    } else if (type === 'clear') {
      if (window.confirm('确定要清空所有排课数据吗？')) {
        courses.value = [];
        saveData();
      }
    }
  }

  function handleSaveSettings(data) {
    startDate.value = data.start_date;
    totalWeeks.value = data.total_weeks;
    timeSlots.value = [...data.time_slots];
    saveData();
    loadData(); // Re-calculate weeks
    settingsVisible.value = false;
  }

  function exportData() {
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
  }

  function handleFileImport(e) {
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
        }
      } catch {
        alert('导入失败：文件格式错误');
      }
    };
    reader.readAsText(file);
  }

  onMounted(loadData);
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

  .main-content {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }
</style>
