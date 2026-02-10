export interface CheatSheetItem {
  cmd: string;
  desc: string;
}

export interface CheatSheetSection {
  title: string;
  items: CheatSheetItem[];
}

export interface CheatSheetSubject {
  id: string;
  name: string;
  sections: CheatSheetSection[];
}

export const subjectList = [
  { id: 'git', name: 'Git 版本控制' },
  { id: 'linux', name: 'Linux 常用命令' },
  { id: 'js', name: 'JS / ES6+ 语法' },
  { id: 'npm', name: 'npm / Yarn 包管理' },
  { id: 'node', name: 'Node.js 运行时' },
  { id: 'markdown', name: 'Markdown 语法' },
  { id: 'docker', name: 'Docker 容器化' },
  { id: 'vim', name: 'Vim 快捷键' },
  { id: 'regex', name: 'RegEx 正则表达式' },
  { id: 'http', name: 'HTTP 状态码' },
  { id: 'sql', name: 'SQL 数据库操作' },
  { id: 'css', name: 'CSS 现代布局' },
  { id: 'python', name: 'Python 常用语法' },
  { id: 'redis', name: 'Redis 缓存数据库' },
  { id: 'vue', name: 'Vue 3 核心语法' }
];

const cache = new Map<string, CheatSheetSubject>();

const importMap: Record<string, () => Promise<CheatSheetSubject>> = {
  git: () => import('./git.json').then(m => m.default),
  linux: () => import('./linux.json').then(m => m.default),
  js: () => import('./js.json').then(m => m.default),
  npm: () => import('./npm.json').then(m => m.default),
  node: () => import('./node.json').then(m => m.default),
  markdown: () => import('./markdown.json').then(m => m.default),
  docker: () => import('./docker.json').then(m => m.default),
  vim: () => import('./vim.json').then(m => m.default),
  regex: () => import('./regex.json').then(m => m.default),
  http: () => import('./http.json').then(m => m.default),
  sql: () => import('./sql.json').then(m => m.default),
  css: () => import('./css.json').then(m => m.default),
  python: () => import('./python.json').then(m => m.default),
  redis: () => import('./redis.json').then(m => m.default),
  vue: () => import('./vue.json').then(m => m.default)
};

export async function loadSubject(id: string): Promise<CheatSheetSubject | null> {
  if (cache.has(id)) return cache.get(id)!;

  const loader = importMap[id];
  if (!loader) return null;

  try {
    const data = await loader();
    cache.set(id, data);
    return data;
  } catch (e) {
    console.error(`Failed to load cheatsheet ${id}`, e);
    return null;
  }
}
