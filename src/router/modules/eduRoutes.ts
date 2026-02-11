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
    path: '/tools/typing-test',
    name: 'TypingTestTool',
    component: () => import('@/components/tools/edu/TypingTestTool.vue')
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
    path: '/tools/word-decomp',
    name: 'WordDecompTool',
    component: () => import('@/components/tools/edu/WordDecompTool.vue')
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
  }
];

export default eduRoutes;
