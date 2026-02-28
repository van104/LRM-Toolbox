<template>
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
              <div class="day-date">{{ getDayDate(index, currentWeek) }}</div>
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
                @click="$emit('edit', course)"
              >
                <div class="course-name">{{ course.course_name }}</div>
                <div class="course-info">🧑 {{ course.teacher }}</div>
                <div class="course-info">📍 {{ course.classroom }}</div>
                <div class="course-week">{{ course.week_range }}</div>

                <button class="del-course-btn" @click.stop="$emit('delete', course.id)">✖</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
  import type { Course } from './useSchedule';

  interface Props {
    courses?: Course[];
    weekDays?: string[];
    timeSlots?: string[];
    currentWeek?: number;
    isToday: (idx: number) => boolean;
    getDayDate: (idx: number, week: number) => string;
    isWeekInRange: (week: number, range: string) => boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    courses: () => [],
    weekDays: () => [],
    timeSlots: () => [],
    currentWeek: 1
  });

  defineEmits(['edit', 'delete']);

  function getCoursesAt(dayIdx: number, slotIdx: number) {
    return props.courses.filter(c => {
      if (c.week_day !== dayIdx || c.time_slot !== slotIdx) return false;
      return props.isWeekInRange(props.currentWeek, c.week_range);
    });
  }

  function getCourseColor(name: string) {
    const hash = Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = ['#fdfae5', '#e0f2fe', '#fefce8', '#fdf2f8', '#ffeba0', '#81e6b3', '#fff'];
    return colors[hash % colors.length];
  }
</script>

<style scoped>
  .brutal-pane {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
  }

  .table-wrapper {
    overflow-x: auto;
  }

  .brutal-table {
    width: 100%;
    border-collapse: collapse;
    background: #fff;
    table-layout: fixed;
  }

  .brutal-table th,
  .brutal-table td {
    border: 4px solid #111;
    padding: 1rem;
    position: relative;
    vertical-align: top;
  }

  .brutal-table th {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
  }

  .day-name {
    font-size: 1.1rem;
  }
  .day-date {
    font-size: 0.85rem;
    opacity: 0.6;
    margin-top: 4px;
  }

  .time-col {
    width: 100px;
    text-align: center;
  }
  .time-slot-cell {
    text-align: center;
    vertical-align: middle;
  }
  .slot-idx {
    font-size: 1.8rem;
    font-weight: 900;
  }
  .slot-time {
    font-size: 0.75rem;
    font-weight: 700;
    margin-top: 4px;
  }

  .bg-dark {
    background: #111;
  }
  .text-white {
    color: #fff;
  }

  .course-cell {
    min-height: 120px;
    background: #fdfae5;
    background-image: radial-gradient(#ddd 1px, transparent 1px);
    background-size: 15px 15px;
  }

  .course-cell.is-today {
    background-color: #fefce8;
  }

  .course-card {
    position: relative;
    border: 3px solid #111;
    padding: 0.8rem;
    margin-bottom: 0.8rem;
    box-shadow: 4px 4px 0px #111;
    cursor: pointer;
    transition: all 0.1s;
  }

  .course-card:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .course-name {
    font-weight: 900;
    font-size: 1rem;
    margin-bottom: 0.5rem;
    line-height: 1.2;
  }

  .course-info {
    font-size: 0.8rem;
    font-weight: 700;
    margin-top: 2px;
  }

  .course-week {
    display: inline-block;
    background: #111;
    color: #fff;
    font-size: 0.7rem;
    padding: 2px 6px;
    margin-top: 8px;
    font-weight: 800;
  }

  .del-course-btn {
    position: absolute;
    top: -5px;
    right: -5px;
    width: 22px;
    height: 22px;
    background: #ff4b4b;
    color: #fff;
    border: 2px solid #111;
    border-radius: 50%;
    font-size: 12px;
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
  }

  .course-card:hover .del-course-btn {
    display: flex;
  }
</style>
