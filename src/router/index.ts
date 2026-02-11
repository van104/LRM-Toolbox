import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

// ========== 按分类导入路由模块 ==========
import devRoutes from './modules/devRoutes';
import textRoutes from './modules/textRoutes';
import imageRoutes from './modules/imageRoutes';
import designRoutes from './modules/designRoutes';
import lifeRoutes from './modules/lifeRoutes';
import healthRoutes from './modules/healthRoutes';
import financeRoutes from './modules/financeRoutes';
import eduRoutes from './modules/eduRoutes';
import funRoutes from './modules/funRoutes';
import pdfRoutes from './modules/pdfRoutes';

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
  }
];

// ========== 404 catch-all（必须放在最后） ==========
const fallbackRoute: RouteRecordRaw = {
  path: '/:pathMatch(.*)*',
  name: 'NotFound',
  component: () => import('@/views/NotFound.vue')
};

// ========== 合并所有路由 ==========
const routes: RouteRecordRaw[] = [
  ...pageRoutes,
  ...devRoutes,
  ...textRoutes,
  ...imageRoutes,
  ...designRoutes,
  ...lifeRoutes,
  ...healthRoutes,
  ...financeRoutes,
  ...eduRoutes,
  ...funRoutes,
  ...pdfRoutes,
  fallbackRoute
];

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

import { tools } from '@/data/tools';

router.afterEach(to => {
  let title = 'LRM 工具箱 - 高效实用的开发者工具箱';

  if (to.meta && to.meta.title) {
    title = `${to.meta.title} - LRM 工具箱`;
  } else {
    // 尝试在工具列表中查找匹配的路由
    const tool = tools.find(t => t.route === to.path);
    if (tool) {
      title = `${tool.name} - LRM 工具箱`;
    } else {
      // 基础页面映射
      const pageMap: Record<string, string> = {
        '/': '首页',
        '/about': '关于我们',
        '/privacy': '隐私政策',
        '/terms': '服务条款',
        '/favorites': '我的收藏',
        '/history': '最近使用',
        '/changelog': '版本演进'
      };
      if (pageMap[to.path]) {
        title = `${pageMap[to.path]} - LRM 工具箱`;
      }
    }
  }

  document.title = title;
});

export default router;
