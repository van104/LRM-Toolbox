import type { RouteRecordRaw } from 'vue-router';

/** 文本工具路由 */
const textRoutes: RouteRecordRaw[] = [
  {
    path: '/tools/text-diff',
    name: 'TextDiffTool',
    component: () => import('@/components/tools/text/TextDiffTool.vue')
  },
  {
    path: '/tools/markdown',
    name: 'MarkdownTool',
    component: () => import('@/components/tools/text/MarkdownTool.vue')
  },
  {
    path: '/tools/text-counter',
    name: 'TextCounter',
    component: () => import('@/components/tools/text/TextCounter.vue')
  },
  {
    path: '/tools/diff-comparer',
    name: 'DiffComparer',
    component: () => import('@/components/tools/text/DiffComparer.vue')
  },
  {
    path: '/tools/text-template',
    name: 'TextTemplateTool',
    component: () => import('@/components/tools/text/TextTemplateTool.vue')
  },
  {
    path: '/tools/text-cleaner',
    component: () => import('@/components/tools/text/TextCleaner.vue')
  },
  {
    path: '/tools/text-splitter',
    component: () => import('@/components/tools/text/TextSplitter.vue')
  },
  {
    path: '/tools/keyword-extractor',
    component: () => import('@/components/tools/text/KeywordExtractorTool.vue')
  },
  {
    path: '/tools/rhyme',
    component: () => import('@/components/tools/text/RhymeTool.vue')
  },
  {
    path: '/tools/text-encryption',
    component: () => import('@/components/tools/text/TextSecurity.vue')
  },
  {
    path: '/tools/batch-replacer',
    component: () => import('@/components/tools/text/BatchReplacer.vue')
  },
  {
    path: '/tools/list-to-table',
    component: () => import('@/components/tools/text/ListToTableTool.vue')
  },
  {
    path: '/tools/sentence-stats',
    component: () => import('@/components/tools/text/SentenceStatsTool.vue')
  },
  {
    path: '/tools/tone-converter',
    component: () => import('@/components/tools/text/ToneConverterTool.vue')
  },
  {
    path: '/tools/text-converter',
    component: () => import('@/components/tools/text/TextConverter.vue')
  },
  {
    path: '/tools/text-extractor',
    component: () => import('@/components/tools/text/TextExtractor.vue')
  },
  {
    path: '/tools/sticky-note',
    component: () => import('@/components/tools/text/FloatingStickyNoteTool.vue')
  },
  {
    path: '/tools/text-linebreak',
    component: () => import('@/components/tools/text/TextLineBreakTool.vue')
  },
  {
    path: '/tools/lorem-ipsum',
    component: () => import('@/components/tools/text/LoremIpsumTool.vue')
  },
  {
    path: '/tools/slug-generator',
    component: () => import('@/components/tools/text/SlugGeneratorTool.vue')
  },
  {
    path: '/tools/variable-converter',
    component: () => import('@/components/tools/text/VariableNameConverterTool.vue')
  },
  {
    path: '/tools/braille-translator',
    component: () => import('@/components/tools/text/BrailleTranslatorTool.vue')
  },
  {
    path: '/tools/ascii-table',
    component: () => import('@/components/tools/text/AsciiTableTool.vue')
  },
  {
    path: '/tools/sensitive-word-check',
    name: 'SensitiveWordCheckTool',
    component: () => import('@/components/tools/text/SensitiveWordCheckTool.vue')
  },
  {
    path: '/tools/text-polisher',
    name: 'TextPolisherTool',
    component: () => import('@/components/tools/text/TextPolisherTool.vue')
  },
  {
    path: '/tools/copywriting-guide',
    name: 'CopywritingGuideTool',
    component: () => import('@/components/tools/text/CopywritingGuideTool.vue')
  },
  {
    path: '/tools/md-table-converter',
    name: 'MdTableConverterTool',
    component: () => import('@/components/tools/text/MdTableConverterTool.vue')
  }
];

export default textRoutes;
