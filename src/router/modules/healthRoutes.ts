import type { RouteRecordRaw } from 'vue-router';

/** 健康工具路由 */
const healthRoutes: RouteRecordRaw[] = [
  {
    path: '/tools/workout-timer',
    name: 'WorkoutTimerTool',
    component: () => import('@/components/tools/health/WorkoutTimerTool.vue')
  },
  {
    path: '/tools/pomodoro',
    name: 'PomodoroTimerTool',
    component: () => import('@/components/tools/health/PomodoroTimerTool.vue')
  },
  {
    path: '/tools/water-intake',
    name: 'WaterIntakeTool',
    component: () => import('@/components/tools/health/WaterIntakeTool.vue')
  },
  {
    path: '/tools/bmi-calculator',
    name: 'BmiCalculatorTool',
    component: () => import('@/components/tools/health/BmiCalculatorTool.vue')
  },
  {
    path: '/tools/healthy-diet',
    name: 'HealthyDietTool',
    component: () => import('@/components/tools/health/HealthyDietTool.vue')
  },
  {
    path: '/tools/vision-test',
    name: 'VisionTestTool',
    component: () => import('@/components/tools/health/VisionTestTool.vue')
  },
  {
    path: '/tools/pregnancy-due',
    name: 'PregnancyDueTool',
    component: () => import('@/components/tools/health/PregnancyDueTool.vue')
  },
  {
    path: '/tools/metronome',
    name: 'MetronomeTool',
    component: () => import('@/components/tools/health/MetronomeTool.vue')
  },
  {
    path: '/tools/bmr-calculator',
    name: 'BmrCalculatorTool',
    component: () => import('@/components/tools/health/BmrCalculatorTool.vue')
  },
  {
    path: '/tools/calorie-calculator',
    name: 'CalorieCalculatorTool',
    component: () => import('@/components/tools/health/CalorieCalculatorTool.vue')
  }
];

export default healthRoutes;
