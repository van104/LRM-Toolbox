import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/tools/json-formatter',
    name: 'JsonFormatter',
    component: () => import('@/components/tools/dev/JsonFormatter.vue')
  },
  {
    path: '/tools/base64',
    name: 'Base64Tool',
    component: () => import('@/components/tools/dev/Base64Tool.vue')
  },
  {
    path: '/tools/timestamp',
    name: 'TimestampTool',
    component: () => import('@/components/tools/dev/TimestampTool.vue')
  },
  {
    path: '/tools/md5',
    name: 'Md5Tool',
    component: () => import('@/components/tools/dev/Md5Tool.vue')
  },

  {
    path: '/tools/image-compress',
    name: 'ImageCompressTool',
    component: () => import('@/components/tools/image/ImageCompressTool.vue')
  },
  {
    path: '/tools/text-diff',
    name: 'TextDiffTool',
    component: () => import('@/components/tools/text/TextDiffTool.vue')
  },
  {
    path: '/tools/qrcode',
    name: 'QrCodeTool',
    component: () => import('@/components/tools/image/QrCodeTool.vue')
  },
  {
    path: '/tools/regex',
    name: 'RegexTool',
    component: () => import('@/components/tools/dev/RegexTool.vue')
  },
  {
    path: '/tools/markdown',
    name: 'MarkdownTool',
    component: () => import('@/components/tools/text/MarkdownTool.vue')
  },
  {
    path: '/tools/url',
    name: 'UrlTool',
    component: () => import('@/components/tools/dev/UrlTool.vue')
  },
  {
    path: '/tools/css-formatter',
    name: 'CssFormatterTool',
    component: () => import('@/components/tools/dev/CssFormatterTool.vue')
  },
  {
    path: '/tools/unit-converter',
    name: 'UnitConverter',
    component: () => import('@/components/tools/life/UnitConverter.vue')
  },
  {
    path: '/tools/text-counter',
    name: 'TextCounter',
    component: () => import('@/components/tools/text/TextCounter.vue')
  },
  {
    path: '/tools/password-generator',
    name: 'PasswordGenerator',
    component: () => import('@/components/tools/dev/PasswordGenerator.vue')
  },
  {
    path: '/tools/diff-comparer',
    name: 'DiffComparer',
    component: () => import('@/components/tools/text/DiffComparer.vue')
  },
  {
    path: '/tools/batch-renamer',
    name: 'BatchRenamer',
    component: () => import('@/components/tools/image/BatchRenamer.vue')
  },
  {
    path: '/tools/data-visualizer',
    name: 'DataVisualizer',
    component: () => import('@/components/tools/design/DataVisualizer.vue')
  },
  {
    path: '/tools/workout-timer',
    name: 'WorkoutTimerTool',
    component: () => import('@/components/tools/health/WorkoutTimerTool.vue')
  },
  {
    path: '/tools/pomodoro',
    name: 'PomodoroTimerTool',
    component: () => import('@/components/tools/health/PomodoroTimerTool.vue')
  },
  {
    path: '/tools/water-intake',
    name: 'WaterIntakeTool',
    component: () => import('@/components/tools/health/WaterIntakeTool.vue')
  },
  {
    path: '/tools/bmi-calculator',
    name: 'BmiCalculatorTool',
    component: () => import('@/components/tools/health/BmiCalculatorTool.vue')
  },
  {
    path: '/tools/healthy-diet',
    name: 'HealthyDietTool',
    component: () => import('@/components/tools/health/HealthyDietTool.vue')
  },
  {
    path: '/tools/vision-test',
    name: 'VisionTestTool',
    component: () => import('@/components/tools/health/VisionTestTool.vue')
  },
  {
    path: '/tools/pregnancy-due',
    name: 'PregnancyDueTool',
    component: () => import('@/components/tools/health/PregnancyDueTool.vue')
  },
  {
    path: '/tools/metronome',
    name: 'MetronomeTool',
    component: () => import('@/components/tools/health/MetronomeTool.vue')
  },
  {
    path: '/tools/bmr-calculator',
    name: 'BmrCalculatorTool',
    component: () => import('@/components/tools/health/BmrCalculatorTool.vue')
  },
  {
    path: '/tools/calorie-calculator',
    name: 'CalorieCalculatorTool',
    component: () => import('@/components/tools/health/CalorieCalculatorTool.vue')
  },
  {
    path: '/tools/random-number',
    name: 'RandomNumberGeneratorTool',
    component: () => import('@/components/tools/fun/RandomNumberGeneratorTool.vue')
  },
  {
    path: '/tools/ascii-art',
    name: 'AsciiArtTool',
    component: () => import('@/components/tools/fun/AsciiArtTool.vue')
  },
  {
    path: '/tools/text-template',
    name: 'TextTemplateTool',
    component: () => import('@/components/tools/text/TextTemplateTool.vue')
  },
  {
    path: '/tools/string-escaper',
    name: 'StringEscaperTool',
    component: () => import('@/components/tools/dev/StringEscaperTool.vue')
  },
  {
    path: '/tools/sql-builder',
    name: 'SqlBuilderTool',
    component: () => import('@/components/tools/dev/SqlBuilderTool.vue')
  },
  {
    path: '/tools/api-tester',
    name: 'ApiTesterTool',
    component: () => import('@/components/tools/dev/ApiTesterTool.vue')
  },
  {
    path: '/tools/jwt-decoder',
    name: 'JwtDecoderTool',
    component: () => import('@/components/tools/dev/JwtDecoderTool.vue')
  },
  {
    path: '/tools/crontab',
    name: 'CrontabTool',
    component: () => import('@/components/tools/dev/CrontabTool.vue')
  },
  {
    path: '/tools/git-cheatsheet',
    name: 'GitCheatSheetTool',
    component: () => import('@/components/tools/dev/GitCheatSheetTool.vue')
  },
  {
    path: '/tools/ssl-checker',
    name: 'SslCheckerTool',
    component: () => import('@/components/tools/dev/SslCheckerTool.vue')
  },
  {
    path: '/tools/config-templates',
    name: 'ConfigTemplatesTool',
    component: () => import('@/components/tools/dev/ConfigTemplatesTool.vue')
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
    path: '/tools/currency-converter',
    name: 'CurrencyConverterTool',
    component: () => import('@/components/tools/finance/CurrencyConverterTool.vue')
  },
  {
    path: '/tools/mortgage-calculator',
    name: 'MortgageCalculatorTool',
    component: () => import('@/components/tools/finance/MortgageCalculatorTool.vue')
  },
  {
    path: '/tools/tax-calculator',
    name: 'TaxCalculatorTool',
    component: () => import('@/components/tools/finance/TaxCalculatorTool.vue')
  },
  {
    path: '/tools/discount-calculator',
    name: 'DiscountCalculatorTool',
    component: () => import('@/components/tools/finance/DiscountCalculatorTool.vue')
  },
  {
    path: '/tools/utility-bill',
    name: 'UtilityBillTool',
    component: () => import('@/components/tools/finance/UtilityBillTool.vue')
  },
  {
    path: '/tools/compound-interest',
    name: 'CompoundInterestTool',
    component: () => import('@/components/tools/finance/CompoundInterestTool.vue')
  },
  {
    path: '/tools/pension-estimator',
    name: 'PensionEstimatorTool',
    component: () => import('@/components/tools/finance/PensionEstimatorTool.vue')
  },
  {
    path: '/tools/interest-rates',
    name: 'InterestRateTool',
    component: () => import('@/components/tools/finance/InterestRateTool.vue')
  },
  {
    path: '/tools/profit-loss-calculator',
    name: 'ProfitLossCalculatorTool',
    component: () => import('@/components/tools/finance/ProfitLossCalculatorTool.vue')
  },
  {
    path: '/tools/volume-weight',
    name: 'VolumeWeightCalculatorTool',
    component: () => import('@/components/tools/life/VolumeWeightCalculatorTool.vue')
  },
  {
    path: '/tools/screen-ruler',
    name: 'ScreenRulerTool',
    component: () => import('@/components/tools/design/ScreenRulerTool.vue')
  },
  {
    path: '/tools/name-stroke',
    name: 'NameStrokeTool',
    component: () => import('@/components/tools/edu/NameStrokeTool.vue')
  },
  {
    path: '/tools/blood-type',
    name: 'BloodTypeCalculatorTool',
    component: () => import('@/components/tools/fun/BloodTypeCalculatorTool.vue')
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
  },
  {
    path: '/tools/emoji-picker',
    name: 'EmojiPickerTool',
    component: () => import('@/components/tools/fun/EmojiPickerTool.vue')
  },
  {
    path: '/tools/quote-generator',
    name: 'QuoteGeneratorTool',
    component: () => import('@/components/tools/fun/QuoteGeneratorTool.vue')
  },
  {
    path: '/tools/decision-wheel',
    name: 'LuckyDrawTool',
    component: () => import('@/components/tools/fun/LuckyDrawTool.vue')
  },
  {
    path: '/tools/reaction-test',
    name: 'ReactionTestTool',
    component: () => import('@/components/tools/fun/ReactionTestTool.vue')
  },
  {
    path: '/tools/game-2048',
    name: 'Game2048Tool',
    component: () => import('@/components/tools/fun/Game2048Tool.vue')
  },
  {
    path: '/tools/minesweeper',
    name: 'MinesweeperTool',
    component: () => import('@/components/tools/fun/MinesweeperTool.vue')
  },
  {
    path: '/tools/memory-card',
    name: 'MemoryCardTool',
    component: () => import('@/components/tools/fun/MemoryCardTool.vue')
  },
  {
    path: '/tools/sudoku',
    name: 'SudokuTool',
    component: () => import('@/components/tools/fun/SudokuTool.vue')
  },
  {
    path: '/tools/gomoku',
    name: 'GomokuTool',
    component: () => import('@/components/tools/fun/GomokuTool.vue')
  },
  {
    path: '/tools/tic-tac-toe',
    name: 'TicTacToeTool',
    component: () => import('@/components/tools/fun/TicTacToeTool.vue')
  },
  {
    path: '/tools/snake',
    name: 'SnakeTool',
    component: () => import('@/components/tools/fun/SnakeTool.vue')
  },
  {
    path: '/tools/tetris',
    name: 'TetrisTool',
    component: () => import('@/components/tools/fun/TetrisTool.vue')
  },
  {
    path: '/tools/simple-shooter',
    name: 'SimpleShooterTool',
    component: () => import('@/components/tools/fun/SimpleShooterTool.vue')
  },
  {
    path: '/tools/pinball',
    name: 'PinballTool',
    component: () => import('@/components/tools/fun/PinballTool.vue')
  },
  {
    path: '/tools/tower-defense',
    name: 'TowerDefenseTool',
    component: () => import('@/components/tools/fun/TowerDefenseTool.vue')
  },
  {
    path: '/tools/maze-3d',
    name: 'Maze3DTool',
    component: () => import('@/components/tools/fun/Maze3DTool.vue')
  },
  {
    path: '/tools/match-3',
    name: 'Match3Tool',
    component: () => import('@/components/tools/fun/Match3Tool.vue')
  },
  {
    path: '/tools/jigsaw-puzzle',
    name: 'JigsawPuzzleTool',
    component: () => import('@/components/tools/fun/JigsawPuzzleTool.vue')
  },
  {
    path: '/tools/pixel-art',
    name: 'PixelArtTool',
    component: () => import('@/components/tools/fun/PixelArtTool.vue')
  },
  {
    path: '/tools/flappy-bird',
    name: 'FlappyBirdTool',
    component: () => import('@/components/tools/fun/FlappyBirdTool.vue')
  },
  {
    path: '/tools/virtual-pet',
    name: 'VirtualPetTool',
    component: () => import('@/components/tools/fun/VirtualPetTool.vue')
  },
  {
    path: '/tools/tower-hanoi',
    name: 'TowerOfHanoiTool',
    component: () => import('@/components/tools/fun/TowerOfHanoiTool.vue')
  },
  {
    path: '/tools/life-simulator',
    name: 'LifeSimulatorTool',
    component: () => import('@/components/tools/fun/LifeSimulatorTool.vue')
  },
  {
    path: '/tools/ai-draw-guess',
    name: 'AiDrawGuessTool',
    component: () => import('@/components/tools/fun/AiDrawGuessTool.vue')
  },
  {
    path: '/tools/text-adventure',
    name: 'TextAdventureTool',
    component: () => import('@/components/tools/fun/TextAdventureTool.vue')
  },
  {
    path: '/tools/social-media-mockup',
    name: 'SocialMediaMockupTool',
    component: () => import('@/components/tools/fun/SocialMediaMockupTool.vue')
  },
  {
    path: '/tools/special-text',
    name: 'SpecialTextTool',
    component: () => import('@/components/tools/fun/SpecialTextTool.vue')
  },
  {
    path: '/tools/word-guess',
    name: 'WordGuessTool',
    component: () => import('@/components/tools/fun/WordGuessTool.vue')
  },
  {
    path: '/tools/world-timeline',
    name: 'WorldTimelineTool',
    component: () => import('@/components/tools/fun/WorldTimelineTool.vue')
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
    path: '/tools/port-check',
    name: 'PortTool',
    component: () => import('@/components/tools/dev/PortTool.vue')
  },
  {
    path: '/tools/random-data',
    name: 'RandomDataTool',
    component: () => import('@/components/tools/dev/RandomDataTool.vue')
  },
  {
    path: '/tools/user-agent',
    name: 'UserAgentParserTool',
    component: () => import('@/components/tools/dev/UserAgentParserTool.vue')
  },
  {
    path: '/tools/encoding',
    name: 'EncodingTool',
    component: () => import('@/components/tools/dev/EncodingTool.vue')
  },
  {
    path: '/tools/cheat-sheet',
    name: 'CheatSheetTool',
    component: () => import('@/components/tools/dev/CheatSheetTool.vue')
  },
  {
    path: '/tools/my-network',
    name: 'MyNetworkInfoTool',
    component: () => import('@/components/tools/dev/MyNetworkInfoTool.vue')
  },
  {
    path: '/tools/html-entity',
    name: 'HtmlEntityTool',
    component: () => import('@/components/tools/dev/HtmlEntityTool.vue')
  },
  {
    path: '/tools/ip-location',
    name: 'IpLocationTool',
    component: () => import('@/components/tools/dev/IpLocationTool.vue')
  },
  {
    path: '/tools/base-converter',
    name: 'BaseConverterTool',
    component: () => import('@/components/tools/dev/BaseConverterTool.vue')
  },
  {
    path: '/tools/xml-formatter',
    name: 'XmlFormatterTool',
    component: () => import('@/components/tools/dev/XmlFormatterTool.vue')
  },
  {
    path: '/tools/yaml-converter',
    name: 'YamlConverterTool',
    component: () => import('@/components/tools/dev/YamlConverterTool.vue')
  },
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
    path: '/tools/subnet-calculator',
    name: 'SubnetCalculator',
    component: () => import('@/components/tools/dev/SubnetCalculatorTool.vue')
  },
  {
    path: '/tools/ua-parser',
    name: 'UserAgentParser',
    component: () => import('@/components/tools/dev/UserAgentParserTool.vue')
  },
  {
    path: '/tools/network-info',
    name: 'MyNetworkInfo',
    component: () => import('@/components/tools/dev/MyNetworkInfoTool.vue')
  }
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
