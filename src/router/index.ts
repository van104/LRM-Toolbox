import { createRouter, createWebHistory, type Component, type RouteRecordRaw } from 'vue-router';
import { tools, findToolByRoute } from '@/data/tools/index';

// ========== 页面级路由（首页、关于、管理、收藏等） ==========
const pageRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/pages/About.vue')
  },
  {
    path: '/admin/feedback',
    name: 'FeedbackAdmin',
    component: () => import('@/views/pages/FeedbackAdmin.vue')
  },
  {
    path: '/admin/maintenance',
    name: 'MaintenanceAdmin',
    component: () => import('@/views/pages/MaintenanceAdmin.vue')
  },
  {
    path: '/maintenance',
    name: 'ToolMaintenance',
    component: () => import('@/views/ToolMaintenance.vue')
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: () => import('@/views/pages/Privacy.vue')
  },
  {
    path: '/terms',
    name: 'Terms',
    component: () => import('@/views/pages/Terms.vue')
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('@/views/Favorites.vue')
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('@/views/History.vue')
  },
  {
    path: '/changelog',
    name: 'Changelog',
    component: () => import('@/views/pages/Changelog.vue')
  },
  {
    path: '/feedback',
    name: 'Feedback',
    component: () => import('@/views/pages/Feedback.vue')
  },
  {
    path: '/test-bench',
    name: 'TestBench',
    component: () => import('@/views/ToolTestBench.vue')
  },
  {
    path: '/ui-test',
    name: 'UITest',
    component: () => import('@/views/UITest.vue')
  }
];

// ========== 工具路由自动注册 ==========
// 使用 import.meta.glob 扫描所有工具组件，避免手动维护 router modules
const toolComponentGlob = import.meta.glob('@/components/tools/**/*.vue');

// 构建组件查找表: "dev/Base64Tool" → loader
const componentMap: Record<string, () => Promise<{ default: Component }>> = {};
for (const [rawPath, loader] of Object.entries(toolComponentGlob)) {
  const match = rawPath.match(/\/components\/tools\/(.+)\.vue$/);
  if (match) {
    componentMap[match[1]] = loader;
  }
}

/** 手动覆盖：路由 → componentMap key（处理命名不一致的工具） */
const routeOverrides: Record<string, string> = {
  '/tools/git-cheatsheet': 'dev/GitCheatSheetTool',
  '/tools/my-network': 'dev/MyNetworkInfoTool',
  '/tools/network-info': 'dev/MyNetworkInfoTool',
  '/tools/port-check': 'dev/PortTool',
  '/tools/ua-parser': 'dev/UserAgentParserTool',
  '/tools/user-agent': 'dev/UserAgentParserTool',
  '/tools/js-obfuscator': 'dev/JSObfuscatorTool',
  '/tools/variable-converter': 'text/VariableNameConverterTool',
  '/tools/sticky-note': 'text/FloatingStickyNoteTool',
  '/tools/text-linebreak': 'text/TextLinebreakConverterTool',
  '/tools/text-encryption': 'text/TextEncryptionCipherTool',
  '/tools/bg-remover': 'image/ImageBgRemoverTool',
  '/tools/qrcode': 'image/QrCodeTool',
  '/tools/batch-renamer': 'image/BatchRenamer',
  '/tools/text-counter': 'text/TextCounter',
  '/tools/diff-comparer': 'text/DiffComparer',
  '/tools/unit-converter': 'life/UnitConverter',
  '/tools/pdf-metadata': 'pdf/PdfMetadataEditorTool',
  '/tools/glassmorphism-generator': 'design/GlassmorphismTool',
  '/tools/neumorphism-generator': 'design/NeumorphismTool',
  '/tools/prototype-design': 'design/PrototypeTool',
  '/tools/interest-free': 'finance/InterestFreePeriodTool',
  '/tools/interest-rates': 'finance/InterestRateTool',
  '/tools/food-gi': 'health/FoodGITool',
  '/tools/heart-rate': 'health/HeartRateZoneTool',
  '/tools/pomodoro': 'health/PomodoroTimerTool',
  '/tools/holiday': 'life/HolidayScheduleTool',
  '/tools/lunar-converter': 'life/LunarSolarConverterTool',
  '/tools/volume-weight': 'life/VolumeWeightCalculatorTool',
  '/tools/chinese-dict': 'edu/ChineseDictionaryTool',
  '/tools/poetry': 'edu/ChinesePoetryTool',
  '/tools/fraction-calculator': 'edu/FractionTool',
  '/tools/proportion-calculator': 'edu/ProportionTool',
  '/tools/blood-type': 'fun/BloodTypeCalculatorTool',
  '/tools/tower-hanoi': 'fun/TowerOfHanoiTool',
  '/tools/decision-wheel': 'fun/LuckyDrawTool',
  '/tools/niuniu-match': 'fun/NiuNiuMatchTool',
  '/tools/maze-3d': 'fun/Maze3DTool',
  '/tools/random-number': 'fun/RandomNumberGeneratorTool',
  '/tools/data-visualizer': 'design/DataVisualizer',
  '/tools/json-formatter': 'dev/JsonFormatter',
  '/tools/password-generator': 'dev/PasswordGenerator',
  '/tools/cheat-sheet': 'dev/CheatSheetTool'
};

function resolveToolComponent(
  category: string,
  routePath: string
): () => Promise<{ default: Component }> {
  // 1. 检查手动覆盖
  const overrideKey = routeOverrides[routePath];
  if (overrideKey && componentMap[overrideKey]) {
    return componentMap[overrideKey];
  }

  // 2. 算法推测: {Category}/{Pascal}Tool.vue 和 {Category}/{Pascal}.vue
  const slug = routePath.replace('/tools/', '');
  const pascal = slug
    .split('-')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
  const patterns = [`${category}/${pascal}Tool`, `${category}/${pascal}`];

  for (const key of patterns) {
    if (componentMap[key]) return componentMap[key];
  }

  // 3. 遍历分类所有组件，尝试文件名 kebab-case 匹配
  for (const [key, loader] of Object.entries(componentMap)) {
    if (!key.startsWith(category + '/')) continue;
    const baseName = key.split('/')[1].replace(/Tool$/, '');
    const kebab = baseName
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');
    if (kebab.includes(slug) || slug.includes(kebab)) {
      return loader;
    }
  }

  console.warn(`[Router] 未找到组件: ${routePath}`);
  return () => import('@/views/NotFound.vue');
}

// 从工具 JSON 数据自动生成路由（跳过无效路由）
const toolRoutes: RouteRecordRaw[] = tools
  .filter(tool => tool.route.startsWith('/tools/'))
  .map(tool => ({
    path: tool.route,
    name: `${tool.category}-${tool.id}`,
    component: resolveToolComponent(tool.category, tool.route),
    meta: { title: tool.name }
  }));

// ========== 404 catch-all（必须放在最后） ==========
const fallbackRoute: RouteRecordRaw = {
  path: '/:pathMatch(.*)*',
  name: 'NotFound',
  component: () => import('@/views/NotFound.vue')
};

// ========== 合并所有路由 ==========
const routes: RouteRecordRaw[] = [...pageRoutes, ...toolRoutes, fallbackRoute];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

// ========== 维护模式路由守卫 ==========
import { useMaintenanceStore } from '@/stores/maintenance';

router.beforeEach(async (to, _from, next) => {
  // 跳过非工具页面和维护页本身
  if (!to.path.startsWith('/tools/') || to.name === 'ToolMaintenance') {
    return next();
  }

  const store = useMaintenanceStore();

  // 确保维护列表已从后端加载
  await store.ensureLoaded();

  // 查找当前路由对应的工具是否在维护名单中
  const matchedTool = findToolByRoute(to.path);
  if (matchedTool) {
    if (store.isUnderMaintenance(matchedTool.id)) {
      return next({ path: '/maintenance', query: { from: to.path } });
    }
  }

  next();
});

router.afterEach(to => {
  let title = 'LRM 工具箱 - 高效实用的开发者工具箱';

  if (to.meta && to.meta.title) {
    title = `${to.meta.title} - LRM 工具箱`;
  } else {
    const tool = findToolByRoute(to.path);
    if (tool) {
      title = `${tool.name} - LRM 工具箱`;
    } else {
      const pageMap: Record<string, string> = {
        '/': '首页',
        '/about': '关于我们',
        '/privacy': '隐私政策',
        '/terms': '服务条款',
        '/favorites': '我的收藏',
        '/history': '最近使用',
        '/changelog': '版本演进',
        '/feedback': '反馈建议',
        '/ui-test': '新粗野主义组件库测试台'
      };
      if (pageMap[to.path]) {
        title = `${pageMap[to.path]} - LRM 工具箱`;
      }
    }
  }

  document.title = title;
});

export default router;
