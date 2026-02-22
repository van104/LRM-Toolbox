import type { RouteRecordRaw } from 'vue-router';

/** 图片工具路由 */
const imageRoutes: RouteRecordRaw[] = [
  {
    path: '/tools/image-compress',
    name: 'ImageCompressTool',
    component: () => import('@/components/tools/image/ImageCompressTool.vue')
  },
  {
    path: '/tools/qrcode',
    name: 'QrCodeTool',
    component: () => import('@/components/tools/image/QrCodeTool.vue')
  },
  {
    path: '/tools/batch-renamer',
    name: 'BatchRenamer',
    component: () => import('@/components/tools/image/BatchRenamer.vue')
  },
  {
    path: '/tools/barcode-generator',
    name: 'BarcodeGeneratorTool',
    component: () => import('@/components/tools/image/BarcodeGeneratorTool.vue')
  },
  {
    path: '/tools/image-converter',
    name: 'ImageConverterTool',
    component: () => import('@/components/tools/image/ImageConverterTool.vue')
  },
  {
    path: '/tools/image-resizer',
    component: () => import('@/components/tools/image/ImageResizerTool.vue')
  },
  {
    path: '/tools/image-watermark',
    component: () => import('@/components/tools/image/ImageWatermarkTool.vue')
  },
  {
    path: '/tools/gif-maker',
    component: () => import('@/components/tools/image/GifMakerTool.vue')
  },
  {
    path: '/tools/photo-book',
    component: () => import('@/components/tools/image/PhotoBookTool.vue')
  },
  {
    path: '/tools/image-palette',
    component: () => import('@/components/tools/image/ImagePaletteTool.vue')
  },
  {
    path: '/tools/image-joiner',
    component: () => import('@/components/tools/image/ImageJoinerTool.vue')
  },
  {
    path: '/tools/bg-remover',
    component: () => import('@/components/tools/image/ImageBgRemoverTool.vue')
  },
  {
    path: '/tools/exif-viewer',
    component: () => import('@/components/tools/image/ExifViewerTool.vue')
  },
  {
    path: '/tools/ico-converter',
    component: () => import('@/components/tools/image/IcoConverterTool.vue')
  },
  {
    path: '/tools/id-photo-maker',
    component: () => import('@/components/tools/image/IdPhotoMakerTool.vue')
  },
  {
    path: '/tools/video-to-gif',
    component: () => import('@/components/tools/image/VideoToGifTool.vue')
  },
  {
    path: '/tools/image-grid-splitter',
    component: () => import('@/components/tools/image/ImageGridSplitterTool.vue')
  },
  {
    path: '/tools/corner-clipper',
    component: () => import('@/components/tools/image/CornerClipperTool.vue')
  },
  {
    path: '/tools/svg-path-editor',
    component: () => import('@/components/tools/image/SvgPathEditorTool.vue')
  },
  {
    path: '/tools/metadata-cleaner',
    component: () => import('@/components/tools/image/MetadataCleanerTool.vue')
  },
  {
    path: '/tools/chromatic-aberration',
    component: () => import('@/components/tools/image/ChromaticAberrationTool.vue')
  }
];

export default imageRoutes;
