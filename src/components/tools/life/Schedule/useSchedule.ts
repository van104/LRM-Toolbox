import { ref } from 'vue';
import dayjs from 'dayjs';

export interface Course {
  id: number;
  course_name: string;
  teacher: string;
  classroom: string;
  week_range: string;
  week_day: number;
  time_slot: number;
}

export const DEFAULT_WEEK_DAYS = ['周一', '周二', '周三', '周四', '周五'];
export const DEFAULT_TIME_SLOTS = [
  '08:00-09:50',
  '10:10-12:00',
  '14:00-15:50',
  '16:10-18:00',
  '19:00-20:50'
];

export function useSchedule() {
  const courses = ref<Course[]>([]);
  const weekDays = ref([...DEFAULT_WEEK_DAYS]);
  const timeSlots = ref([...DEFAULT_TIME_SLOTS]);
  const startDate = ref('2025-08-31');
  const totalWeeks = ref(18);
  const currentViewWeek = ref(1);
  const realCurrentWeek = ref(1);

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

  const isToday = (dayIdx: number) => {
    const today = dayjs().day();
    return today === (dayIdx === 6 ? 0 : dayIdx + 1);
  };

  const getDayDate = (dayIdx: number, viewWeek: number) => {
    const start = dayjs(startDate.value);
    let startMonday = start;
    if (start.day() !== 1)
      startMonday = start.subtract(start.day() === 0 ? 6 : start.day() - 1, 'day');
    const targetDate = startMonday.add((viewWeek - 1) * 7 + dayIdx, 'day');
    return targetDate.format('MM-DD');
  };

  const isWeekInRange = (week: number, rangeStr: string) => {
    if (!rangeStr) return true;
    const cleanStr = rangeStr.replace(/\s/g, '');
    const isSingle = cleanStr.includes('(单)');
    const isDouble = cleanStr.includes('(双)');
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

  return {
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
  };
}
