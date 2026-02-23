import type { RouteRecordRaw } from 'vue-router';

/** 生活工具路由 */
const lifeRoutes: RouteRecordRaw[] = [
  {
    path: '/tools/unit-converter',
    name: 'UnitConverter',
    component: () => import('@/components/tools/life/UnitConverter.vue')
  },
  {
    path: '/tools/date-calculator',
    name: 'DateCalculatorTool',
    component: () => import('@/components/tools/life/DateCalculatorTool.vue')
  },
  {
    path: '/tools/calculator',
    name: 'CalculatorTool',
    component: () => import('@/components/tools/life/CalculatorTool.vue')
  },
  {
    path: '/tools/decision-maker',
    name: 'DecisionMakerTool',
    component: () => import('@/components/tools/life/DecisionMakerTool.vue')
  },
  {
    path: '/tools/schedule',
    name: 'ScheduleTool',
    component: () => import('@/components/tools/life/ScheduleTool.vue')
  },
  {
    path: '/tools/holiday',
    name: 'HolidayScheduleTool',
    component: () => import('@/components/tools/life/HolidayScheduleTool.vue')
  },
  {
    path: '/tools/lunar-converter',
    name: 'LunarSolarConverterTool',
    component: () => import('@/components/tools/life/LunarSolarConverterTool.vue')
  },
  {
    path: '/tools/travel-checklist',
    name: 'TravelChecklistTool',
    component: () => import('@/components/tools/life/TravelChecklistTool.vue')
  },
  {
    path: '/tools/first-aid-manual',
    name: 'FirstAidManualTool',
    component: () => import('@/components/tools/life/FirstAidManualTool.vue')
  },
  {
    path: '/tools/anniversary-countdown',
    name: 'AnniversaryCountdownTool',
    component: () => import('@/components/tools/life/AnniversaryCountdownTool.vue')
  },
  {
    path: '/tools/zip-code-search',
    name: 'ZipCodeSearchTool',
    component: () => import('@/components/tools/life/ZipCodeSearchTool.vue')
  },
  {
    path: '/tools/clothing-size',
    name: 'ClothingSizeTool',
    component: () => import('@/components/tools/life/ClothingSizeTool.vue')
  },
  {
    path: '/tools/plug-standard',
    name: 'PlugStandardTool',
    component: () => import('@/components/tools/life/PlugStandardTool.vue')
  },
  {
    path: '/tools/waste-classifier',
    name: 'WasteClassifierTool',
    component: () => import('@/components/tools/life/WasteClassifierTool.vue')
  },
  {
    path: '/tools/public-services',
    name: 'PublicServicesTool',
    component: () => import('@/components/tools/life/PublicServicesTool.vue')
  },
  {
    path: '/tools/weather-guide',
    name: 'WeatherGuideTool',
    component: () => import('@/components/tools/life/WeatherGuideTool.vue')
  },
  {
    path: '/tools/volume-weight',
    name: 'VolumeWeightCalculatorTool',
    component: () => import('@/components/tools/life/VolumeWeightCalculatorTool.vue')
  },
  {
    path: '/tools/birthday-reminder',
    name: 'BirthdayReminderTool',
    component: () => import('@/components/tools/life/BirthdayReminderTool.vue')
  },
  {
    path: '/tools/workday-calculator',
    name: 'WorkdayCalculatorTool',
    component: () => import('@/components/tools/life/WorkdayCalculatorTool.vue')
  },
  {
    path: '/tools/timer',
    name: 'TimerTool',
    component: () => import('@/components/tools/life/TimerTool.vue')
  },
  {
    path: '/tools/soup-timer',
    name: 'SoupTimerTool',
    component: () => import('@/components/tools/life/SoupTimerTool.vue')
  },
  {
    path: '/tools/timezone-planner',
    name: 'TimezonePlannerTool',
    component: () => import('@/components/tools/life/TimezonePlannerTool.vue')
  },
  {
    path: '/tools/age-calculator',
    name: 'AgeCalculatorTool',
    component: () => import('@/components/tools/life/AgeCalculatorTool.vue')
  },
  {
    path: '/tools/fuel-cost',
    name: 'FuelCostTool',
    component: () => import('@/components/tools/life/FuelCostTool.vue')
  },
  {
    path: '/tools/tip-splitter',
    name: 'TipSplitterTool',
    component: () => import('@/components/tools/life/TipSplitterTool.vue')
  },
  {
    path: '/tools/car-loan',
    name: 'CarLoanTool',
    component: () => import('@/components/tools/life/CarLoanTool.vue')
  },
  {
    path: '/tools/instrument-tuner',
    name: 'InstrumentTunerTool',
    component: () => import('@/components/tools/life/InstrumentTunerTool.vue')
  },
  {
    path: '/tools/family-relation',
    name: 'FamilyRelationTool',
    component: () => import('@/components/tools/life/FamilyRelationTool.vue')
  }
];

export default lifeRoutes;
