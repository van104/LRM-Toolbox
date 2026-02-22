import type { RouteRecordRaw } from 'vue-router';

/** PDF 工具路由 */
const pdfRoutes: RouteRecordRaw[] = [
  {
    path: '/tools/pdf-to-image',
    name: 'PdfToImage',
    component: () => import('@/components/tools/pdf/PdfToImageTool.vue')
  },
  {
    path: '/tools/image-to-pdf',
    name: 'ImageToPdf',
    component: () => import('@/components/tools/pdf/ImageToPdfTool.vue')
  },
  {
    path: '/tools/pdf-watermark',
    name: 'PdfWatermark',
    component: () => import('@/components/tools/pdf/PdfWatermarkTool.vue')
  },
  {
    path: '/tools/markdown-to-pdf',
    name: 'MarkdownToPdf',
    component: () => import('@/components/tools/pdf/MarkdownToPdfTool.vue')
  },
  {
    path: '/tools/pdf-compression',
    name: 'PdfCompression',
    component: () => import('@/components/tools/pdf/PdfCompressionTool.vue')
  },
  {
    path: '/tools/pdf-split-merge',
    name: 'PdfSplitMerge',
    component: () => import('@/components/tools/pdf/PdfSplitMergeTool.vue')
  },
  {
    path: '/tools/pdf-rotation',
    name: 'PdfRotation',
    component: () => import('@/components/tools/pdf/PdfRotationTool.vue')
  },
  {
    path: '/tools/pdf-protection',
    name: 'PdfProtection',
    component: () => import('@/components/tools/pdf/PdfProtectionTool.vue')
  },
  {
    path: '/tools/pdf-signature',
    name: 'PdfSignature',
    component: () => import('@/components/tools/pdf/PdfSignatureTool.vue')
  },
  {
    path: '/tools/pdf-page-number',
    name: 'PdfPageNumber',
    component: () => import('@/components/tools/pdf/PdfPageNumberTool.vue')
  },
  {
    path: '/tools/pdf-text-extractor',
    name: 'PdfTextExtractor',
    component: () => import('@/components/tools/pdf/PdfTextExtractorTool.vue')
  },
  {
    path: '/tools/pdf-crop',
    name: 'PdfCrop',
    component: () => import('@/components/tools/pdf/PdfCropTool.vue')
  },
  {
    path: '/tools/pdf-metadata',
    name: 'PdfMetadataEditor',
    component: () => import('@/components/tools/pdf/PdfMetadataEditorTool.vue')
  },
  {
    path: '/tools/pdf-page-organizer',
    name: 'PdfPageOrganizer',
    component: () => import('@/components/tools/pdf/PdfPageOrganizerTool.vue')
  },
  {
    path: '/tools/pdf-grayscale',
    name: 'PdfGrayscale',
    component: () => import('@/components/tools/pdf/PdfGrayscaleTool.vue')
  },
  {
    path: '/tools/pdf-overlay',
    name: 'PdfOverlay',
    component: () => import('@/components/tools/pdf/PdfOverlayTool.vue')
  },
  {
    path: '/tools/pdf-repair',
    name: 'PdfRepair',
    component: () => import('@/components/tools/pdf/PdfRepairTool.vue')
  },
  {
    path: '/tools/pdf-scale',
    name: 'PdfScale',
    component: () => import('@/components/tools/pdf/PdfScaleTool.vue')
  },
  {
    path: '/tools/pdf-attachment-extractor',
    name: 'PdfAttachmentExtractor',
    component: () => import('@/components/tools/pdf/PdfAttachmentExtractorTool.vue')
  },
  {
    path: '/tools/pdf-accessibility-check',
    name: 'PdfAccessibilityCheck',
    component: () => import('@/components/tools/pdf/PdfAccessibilityCheckTool.vue')
  },
  {
    path: '/tools/pdf-to-epub',
    name: 'PdfToEpub',
    component: () => import('@/components/tools/pdf/PdfToEpubTool.vue')
  },
  {
    path: '/tools/pdf-comparison',
    name: 'PdfComparison',
    component: () => import('@/components/tools/pdf/PdfComparisonTool.vue')
  },
  {
    path: '/tools/web-to-pdf',
    name: 'WebToPdf',
    component: () => import('@/components/tools/pdf/WebToPdfTool.vue')
  }
];

export default pdfRoutes;
