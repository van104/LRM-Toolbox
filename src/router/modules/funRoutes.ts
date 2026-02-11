import type { RouteRecordRaw } from 'vue-router';

/** 趣味 & 游戏工具路由 */
const funRoutes: RouteRecordRaw[] = [
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
    path: '/tools/blood-type',
    name: 'BloodTypeCalculatorTool',
    component: () => import('@/components/tools/fun/BloodTypeCalculatorTool.vue')
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
  }
];

export default funRoutes;
