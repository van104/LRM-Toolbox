<template>
  <div class="holiday-schedule">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>调休放假安排</h1>
        <span class="nav-subtitle">Holiday Schedule</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <div class="tool-container">
      <div class="info-card card">
        <div class="next-holiday">
          <div class="label">下一个假期：</div>
          <div class="countdown">
            <span class="holiday-name">{{ nextHoliday.name }}</span>
            <span class="days-left">{{ nextHoliday.daysLeft }}</span>
            <span class="unit">天后</span>
          </div>
          <div class="date-range">{{ nextHoliday.range }} ({{ nextHoliday.length }}天)</div>
        </div>
      </div>

      <div class="calendar-controls card">
        <el-radio-group v-model="currentYear" size="large">
          <el-radio-button v-for="year in availableYears" :key="year" :label="year"
            >{{ year }}年</el-radio-button
          >
        </el-radio-group>
        <div class="legend">
          <div class="legend-item"><span class="box rest"></span> 补班</div>
          <div class="legend-item"><span class="box work"></span> 放假</div>
        </div>
      </div>

      <div class="holidays-grid">
        <div v-for="holiday in filteredHolidays" :key="holiday.name" class="holiday-card card">
          <div class="card-header">
            <h3 class="name">{{ holiday.name }}</h3>
            <el-tag effect="plain" type="info">{{ holiday.length }}天</el-tag>
          </div>
          <div class="range">{{ holiday.range }}</div>

          <div v-if="holiday.adjustments && holiday.adjustments.length > 0" class="adjustments">
            <div class="adj-title">补班安排：</div>
            <div v-for="adj in holiday.adjustments" :key="adj" class="adj-item">
              {{ adj }} (上班)
            </div>
          </div>
          <div v-else class="no-adj">无需调休</div>

          <div class="tip">{{ holiday.tip }}</div>
        </div>
      </div>

      <div class="official-tip card">
        <el-icon>
          <InfoFilled />
        </el-icon>
        <span>数据根据国务院办公厅发布的放假安排通知整理。具体请以官方公告为准。</span>
      </div>
    </div>
    <footer class="footer">© 2026 LRM工具箱 - 调休放假安排</footer>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { Back, InfoFilled } from '@element-plus/icons-vue';
  import { availableYears, getHolidaysByYear, getNextHoliday } from '@/data/holidayData';

  const now = new Date();
  const defaultYear = now.getFullYear().toString();
  const currentYear = ref(
    availableYears.includes(defaultYear) ? defaultYear : availableYears[availableYears.length - 1]
  );

  const filteredHolidays = computed(() => {
    return getHolidaysByYear(currentYear.value);
  });

  const nextHoliday = computed(() => {
    return getNextHoliday();
  });
</script>

<style scoped>
  .holiday-schedule {
    min-height: 100vh;
    background: var(--el-bg-color-page);
    display: flex;
    flex-direction: column;
  }

  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color-lighter);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
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
    color: var(--el-text-color-regular);
    cursor: pointer;
    font-size: 0.9rem;
    padding: 0.5rem 0;
    transition: color 0.2s;
  }

  .nav-back:hover {
    color: var(--el-color-primary);
  }

  .nav-center {
    text-align: center;
  }

  .nav-center h1 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
    color: var(--el-text-color-primary);
  }

  .nav-subtitle {
    font-size: 0.7rem;
    color: var(--el-text-color-secondary);
    text-transform: uppercase;
    display: block;
    margin-top: 2px;
  }

  .tool-container {
    padding: 24px;
    flex: 1;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .card {
    background: var(--el-bg-color);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    margin-bottom: 24px;
  }

  .info-card {
    background: linear-gradient(135deg, #ff6b6b, #ff8e53);
    color: #fff;
  }

  .next-holiday {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .countdown {
    display: flex;
    align-items: baseline;
    gap: 12px;
  }

  .holiday-name {
    font-size: 32px;
    font-weight: bold;
  }

  .days-left {
    font-size: 48px;
    font-weight: 800;
  }

  .unit {
    font-size: 18px;
    opacity: 0.9;
  }

  .calendar-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .legend {
    display: flex;
    gap: 20px;
    font-size: 14px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .box {
    width: 16px;
    height: 16px;
    border-radius: 4px;
  }

  .box.rest {
    background: #f5222d;
  }

  .box.work {
    background: #333;
  }

  .holidays-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
  }

  .holiday-card {
    margin-bottom: 0;
    transition: transform 0.3s;
    border-left: 4px solid #f5222d;
  }

  .holiday-card:hover {
    transform: translateY(-5px);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .name {
    margin: 0;
    font-size: 18px;
  }

  .range {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 16px;
  }

  .adjustments {
    background: var(--el-fill-color-light);
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 16px;
    font-size: 13px;
  }

  .adj-title {
    color: var(--el-text-color-secondary);
    margin-bottom: 6px;
  }

  .adj-item {
    color: #f5222d;
    font-weight: 600;
  }

  .no-adj {
    color: var(--el-text-color-secondary);
    font-size: 13px;
    margin-bottom: 16px;
  }

  .tip {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    font-style: italic;
  }

  .official-tip {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  @media (max-width: 640px) {
    .calendar-controls {
      flex-direction: column;
      gap: 16px;
    }
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: var(--el-text-color-secondary);
    font-size: 0.85rem;
    border-top: 1px solid var(--el-border-color-lighter);
    background: var(--el-bg-color);
  }
</style>
