export interface DictionaryItem {
  name: string;
  pinyin: string;
  meaning: string;
  synonyms?: string[];
  antonyms?: string[];
  example: string;
}

// 拼音声调到基础字母的映射
const toneMap: Record<string, string> = {
  ā: 'a',
  á: 'a',
  ǎ: 'a',
  à: 'a',
  ē: 'e',
  é: 'e',
  ě: 'e',
  è: 'e',
  ī: 'i',
  í: 'i',
  ǐ: 'i',
  ì: 'i',
  ō: 'o',
  ó: 'o',
  ǒ: 'o',
  ò: 'o',
  ū: 'u',
  ú: 'u',
  ǔ: 'u',
  ù: 'u',
  ǖ: 'v',
  ǘ: 'v',
  ǚ: 'v',
  ǜ: 'v'
};

/** 获取拼音首字母（去声调） */
function getPinyinInitial(pinyin: string): string {
  const first = pinyin.charAt(0).toLowerCase();
  return toneMap[first] || first;
}

// 已加载的数据缓存
const cache = new Map<string, DictionaryItem[]>();

// 动态导入映射（仅包含已有数据的字母）
const importMap: Record<string, () => Promise<DictionaryItem[]>> = {
  a: () => import('./a.json').then(m => m.default),
  b: () => import('./b.json').then(m => m.default),
  c: () => import('./c.json').then(m => m.default),
  d: () => import('./d.json').then(m => m.default),
  e: () => import('./e.json').then(m => m.default),
  f: () => import('./f.json').then(m => m.default),
  g: () => import('./g.json').then(m => m.default),
  h: () => import('./h.json').then(m => m.default),
  j: () => import('./j.json').then(m => m.default),
  k: () => import('./k.json').then(m => m.default),
  l: () => import('./l.json').then(m => m.default),
  m: () => import('./m.json').then(m => m.default),
  n: () => import('./n.json').then(m => m.default),
  o: () => import('./o.json').then(m => m.default),
  p: () => import('./p.json').then(m => m.default),
  q: () => import('./q.json').then(m => m.default),
  r: () => import('./r.json').then(m => m.default),
  s: () => import('./s.json').then(m => m.default),
  t: () => import('./t.json').then(m => m.default),
  w: () => import('./w.json').then(m => m.default),
  x: () => import('./x.json').then(m => m.default),
  y: () => import('./y.json').then(m => m.default),
  z: () => import('./z.json').then(m => m.default)
};

/** 加载某个字母的所有成语 */
export async function loadByLetter(letter: string): Promise<DictionaryItem[]> {
  const key = letter.toLowerCase();
  if (cache.has(key)) return cache.get(key)!;

  const loader = importMap[key];
  if (!loader) return [];

  try {
    const data = await loader();
    cache.set(key, data);
    return data;
  } catch {
    cache.set(key, []);
    return [];
  }
}

/** 加载所有成语（完整加载） */
export async function loadAll(): Promise<DictionaryItem[]> {
  const letters = Object.keys(importMap);
  const results = await Promise.all(letters.map(l => loadByLetter(l)));
  return results.flat();
}

/** 根据成语名称精确查找 */
export async function findByName(name: string): Promise<DictionaryItem | undefined> {
  // 先在已缓存的数据中查找
  for (const items of cache.values()) {
    const found = items.find(item => item.name === name);
    if (found) return found;
  }
  // 如果缓存中没找到，加载全部数据查找
  const all = await loadAll();
  return all.find(item => item.name === name);
}

/** 模糊搜索（按成语名或拼音） */
export async function search(keyword: string): Promise<DictionaryItem[]> {
  const all = await loadAll();
  const kw = keyword.toLowerCase();
  return all.filter(item => item.name.includes(keyword) || item.pinyin.toLowerCase().includes(kw));
}

/** 获取指定尾字（或尾字同音）开头的成语，用于成语接龙 */
export async function findByFirstChar(char: string): Promise<DictionaryItem[]> {
  const all = await loadAll();
  return all.filter(item => item.name.startsWith(char));
}

/** 从所有成语中随机抽取 n 个 */
export async function getRandomIdioms(count: number): Promise<DictionaryItem[]> {
  const all = await loadAll();
  const shuffled = [...all].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/** 向后兼容：同步导出（需要先 loadAll） */
export { getPinyinInitial };
