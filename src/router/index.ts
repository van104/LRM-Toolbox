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

export default router;
