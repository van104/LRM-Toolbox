export interface Poem {
  id: number;
  title: string;
  author: string;
  dynasty: string;
  tags: string[];
  content: string[];
  appreciation: string;
}

// 已加载的数据缓存
const cache = new Map<string, Poem[]>();

// 动态导入映射
const importMap: Record<string, () => Promise<Poem[]>> = {
  xianqin: () => import('./xianqin.json').then(m => m.default),
  weijin: () => import('./weijin.json').then(m => m.default),
  nanbeichao: () => import('./nanbeichao.json').then(m => m.default),
  tang: () => import('./tang.json').then(m => m.default),
  wudai: () => import('./wudai.json').then(m => m.default),
  song: () => import('./song.json').then(m => m.default),
  yuan: () => import('./yuan.json').then(m => m.default),
  ming: () => import('./ming.json').then(m => m.default),
  qing: () => import('./qing.json').then(m => m.default)
};

export const DYNASTIES = [
  { key: 'xianqin', label: '先秦' },
  { key: 'weijin', label: '魏晋' },
  { key: 'nanbeichao', label: '南北朝' },
  { key: 'tang', label: '唐' },
  { key: 'wudai', label: '五代' },
  { key: 'song', label: '宋' },
  { key: 'yuan', label: '元' },
  { key: 'ming', label: '明' },
  { key: 'qing', label: '清' }
] as const;

/** 加载某个朝代的所有诗词 */
export async function loadByDynasty(dynastyKey: string): Promise<Poem[]> {
  const key = dynastyKey.toLowerCase();

  // 处理显示名称到key的映射（如果传入的是中文朝代名）
  let actualKey = key;
  if (!importMap[key]) {
    const found = DYNASTIES.find(d => d.label === dynastyKey);
    if (found) actualKey = found.key;
  }

  if (cache.has(actualKey)) return cache.get(actualKey)!;

  const loader = importMap[actualKey];
  if (!loader) return [];

  try {
    const data = await loader();
    cache.set(actualKey, data);
    return data;
  } catch {
    cache.set(actualKey, []);
    return [];
  }
}

/** 加载所有诗词（完整加载） */
export async function loadAll(): Promise<Poem[]> {
  const keys = Object.keys(importMap);
  const results = await Promise.all(keys.map(k => loadByDynasty(k)));
  return results.flat();
}

/** 模糊搜索（按标题、作者或内容） */
export async function search(keyword: string): Promise<Poem[]> {
  const all = await loadAll();
  return all.filter(
    item =>
      item.title.includes(keyword) ||
      item.author.includes(keyword) ||
      item.content.some(line => line.includes(keyword))
  );
}

/** 从所有诗词中随机抽取 n 个 */
export async function getRandomPoems(count: number): Promise<Poem[]> {
  const all = await loadAll();
  const shuffled = [...all].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/** 根据ID查找 */
export async function findById(id: number): Promise<Poem | undefined> {
  const all = await loadAll();
  return all.find(p => p.id === id);
}

export function getAllDynasties() {
  return DYNASTIES;
}
