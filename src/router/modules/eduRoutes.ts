import type { RouteRecordRaw } from 'vue-router';

/** 教育工具路由 */
const eduRoutes: RouteRecordRaw[] = [
  {
    path: '/tools/name-stroke',
    name: 'NameStrokeTool',
    component: () => import('@/components/tools/edu/NameStrokeTool.vue')
  },
  {
    path: '/tools/pinyin',
    name: 'PinyinTool',
    component: () => import('@/components/tools/edu/PinyinTool.vue')
  },
  {
    path: '/tools/chinese-dict',
    name: 'ChineseDictionaryTool',
    component: () => import('@/components/tools/edu/ChineseDictionaryTool.vue')
  },
  {
    path: '/tools/poetry',
    name: 'ChinesePoetryTool',
    component: () => import('@/components/tools/edu/ChinesePoetryTool.vue')
  },

  {
    path: '/tools/formula-editor',
    name: 'FormulaEditorTool',
    component: () => import('@/components/tools/edu/FormulaEditorTool.vue')
  },
  {
    path: '/tools/periodic-table',
    name: 'PeriodicTableTool',
    component: () => import('@/components/tools/edu/PeriodicTableTool.vue')
  },

  {
    path: '/tools/fraction-calculator',
    name: 'FractionTool',
    component: () => import('@/components/tools/edu/FractionTool.vue')
  },
  {
    path: '/tools/proportion-calculator',
    name: 'ProportionTool',
    component: () => import('@/components/tools/edu/ProportionTool.vue')
  },
  {
    path: '/tools/process-scheduling',
    name: 'ProcessSchedulingTool',
    component: () => import('@/components/tools/edu/ProcessSchedulingTool.vue')
  },
  {
    path: '/tools/copybook-generator',
    name: 'CopybookGeneratorTool',
    component: () => import('@/components/tools/edu/CopybookGeneratorTool.vue')
  },
  {
    path: '/tools/gcd-lcm',
    name: 'GcdLcmTool',
    component: () => import('@/components/tools/edu/GcdLcmTool.vue')
  },
  {
    path: '/tools/root-calculator',
    name: 'RootCalculatorTool',
    component: () => import('@/components/tools/edu/RootCalculatorTool.vue')
  },
  {
    path: '/tools/arithmetic-series',
    name: 'ArithmeticSeriesTool',
    component: () => import('@/components/tools/edu/ArithmeticSeriesTool.vue')
  },
  {
    path: '/tools/unit-dimension',
    name: 'UnitDimensionTool',
    component: () => import('@/components/tools/edu/UnitDimensionTool.vue')
  },
  {
    path: '/tools/resistor-color-code',
    name: 'ResistorColorCodeTool',
    component: () => import('@/components/tools/edu/ResistorColorCodeTool.vue')
  },
  {
    path: '/tools/voltage-power',
    name: 'VoltagePowerTool',
    component: () => import('@/components/tools/edu/VoltagePowerTool.vue')
  },
  {
    path: '/tools/concentration',
    name: 'ConcentrationTool',
    component: () => import('@/components/tools/edu/ConcentrationTool.vue')
  },
  {
    path: '/tools/citation-generator',
    name: 'CitationGeneratorTool',
    component: () => import('@/components/tools/edu/CitationGeneratorTool.vue')
  },
  {
    path: '/tools/function-grapher',
    name: 'FunctionGrapherTool',
    component: () => import('@/components/tools/edu/FunctionGrapherTool.vue')
  },
  {
    path: '/tools/base-calculator',
    name: 'BaseCalculatorTool',
    component: () => import('@/components/tools/edu/BaseCalculatorTool.vue')
  },
  {
    path: '/tools/roman-numeral',
    name: 'RomanNumeralTool',
    component: () => import('@/components/tools/edu/RomanNumeralTool.vue')
  },
  {
    path: '/tools/cornell-note-gen',
    name: 'CornellNoteGenTool',
    component: () => import('@/components/tools/edu/CornellNoteGenTool.vue')
  },
  {
    path: '/tools/truth-table-gen',
    name: 'TruthTableGenTool',
    component: () => import('@/components/tools/edu/TruthTableGenTool.vue')
  },
  {
    path: '/tools/morse-trainer',
    name: 'MorseTrainerTool',
    component: () => import('@/components/tools/edu/MorseTrainerTool.vue')
  },
  {
    path: '/tools/ebbinghaus-planner',
    name: 'EbbinghausPlannerTool',
    component: () => import('@/components/tools/edu/EbbinghausPlannerTool.vue')
  }
];

export default eduRoutes;
