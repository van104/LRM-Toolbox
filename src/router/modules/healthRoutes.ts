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
  },
  {
    path: '/tools/food-gi',
    name: 'FoodGITool',
    component: () => import('@/components/tools/health/FoodGITool.vue')
  },
  {
    path: '/tools/food-compatibility',
    name: 'FoodCompatibilityTool',
    component: () => import('@/components/tools/health/FoodCompatibilityTool.vue')
  },
  {
    path: '/tools/alcohol-metabolism',
    name: 'AlcoholMetabolismTool',
    component: () => import('@/components/tools/health/AlcoholMetabolismTool.vue')
  },
  {
    path: '/tools/sleep-cycle',
    name: 'SleepCycleTool',
    component: () => import('@/components/tools/health/SleepCycleTool.vue')
  },
  {
    path: '/tools/heart-rate',
    name: 'HeartRateZoneTool',
    component: () => import('@/components/tools/health/HeartRateZoneTool.vue')
  },
  {
    path: '/tools/spine-exercises',
    name: 'SpineExercisesTool',
    component: () => import('@/components/tools/health/SpineExercisesTool.vue')
  },
  {
    path: '/tools/allergen-table',
    name: 'AllergenTableTool',
    component: () => import('@/components/tools/health/AllergenTableTool.vue')
  },
  {
    path: '/tools/stress-test',
    name: 'StressTestTool',
    component: () => import('@/components/tools/health/StressTestTool.vue')
  },
  {
    path: '/tools/eye-care-guide',
    name: 'EyeCareGuideTool',
    component: () => import('@/components/tools/health/EyeCareGuideTool.vue')
  }
];

export default healthRoutes;
