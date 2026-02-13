import type { RouteRecordRaw } from 'vue-router';

/** 设计工具路由 */
const designRoutes: RouteRecordRaw[] = [
  {
    path: '/tools/data-visualizer',
    name: 'DataVisualizer',
    component: () => import('@/components/tools/design/DataVisualizer.vue')
  },
  {
    path: '/tools/color-picker',
    name: 'ColorPickerTool',
    component: () => import('@/components/tools/design/ColorPickerTool.vue')
  },
  {
    path: '/tools/icon-library',
    name: 'IconLibraryTool',
    component: () => import('@/components/tools/design/IconLibraryTool.vue')
  },
  {
    path: '/tools/font-resource',
    name: 'FontResourceTool',
    component: () => import('@/components/tools/design/FontResourceTool.vue')
  },
  {
    path: '/tools/prototype-design',
    name: 'PrototypeTool',
    component: () => import('@/components/tools/design/PrototypeTool.vue')
  },
  {
    path: '/tools/design-assets',
    name: 'DesignAssetsTool',
    component: () => import('@/components/tools/design/DesignAssetsTool.vue')
  },
  {
    path: '/tools/screen-ruler',
    name: 'ScreenRulerTool',
    component: () => import('@/components/tools/design/ScreenRulerTool.vue')
  },
  {
    path: '/tools/mind-map',
    name: 'MindMapTool',
    component: () => import('@/components/tools/design/MindMapTool.vue')
  },
  {
    path: '/tools/screen-size',
    name: 'ScreenSizeTool',
    component: () => import('@/components/tools/design/ScreenSizeTool.vue')
  },
  {
    path: '/tools/favicon-generator',
    name: 'FaviconGeneratorTool',
    component: () => import('@/components/tools/design/FaviconGeneratorTool.vue')
  },
  {
    path: '/tools/gradient-generator',
    name: 'GradientGeneratorTool',
    component: () => import('@/components/tools/design/GradientGeneratorTool.vue')
  },
  {
    path: '/tools/contrast-checker',
    name: 'ContrastCheckerTool',
    component: () => import('@/components/tools/design/ContrastCheckerTool.vue')
  },
  {
    path: '/tools/golden-ratio',
    name: 'GoldenRatioTool',
    component: () => import('@/components/tools/design/GoldenRatioTool.vue')
  },
  {
    path: '/tools/social-media-sizes',
    name: 'SocialMediaSizesTool',
    component: () => import('@/components/tools/design/SocialMediaSizesTool.vue')
  },
  {
    path: '/tools/svg-optimizer',
    name: 'SvgOptimizerTool',
    component: () => import('@/components/tools/design/SvgOptimizerTool.vue')
  }
];

export default designRoutes;
