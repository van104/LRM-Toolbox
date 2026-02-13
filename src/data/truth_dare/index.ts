export interface TruthDareData {
  truth: string[];
  dare: string[];
}

export interface TruthDareCategory {
  id: string;
  name: string;
}

export const categoryList: TruthDareCategory[] = [
  { id: 'party', name: '多人聚会' },
  { id: 'couple', name: '甜蜜情侣' },
  { id: 'hardcore', name: '深水炸弹' }
];

const cache = new Map<string, TruthDareData>();

const importMap: Record<string, () => Promise<TruthDareData>> = {
  party: () => import('./party.json').then(m => m.default),
  couple: () => import('./couple.json').then(m => m.default),
  hardcore: () => import('./hardcore.json').then(m => m.default)
};

export async function loadCategoryData(id: string): Promise<TruthDareData | null> {
  if (cache.has(id)) return cache.get(id)!;

  const loader = importMap[id];
  if (!loader) return null;

  try {
    const data = await loader();
    cache.set(id, data);
    return data;
  } catch (e) {
    console.error(`Failed to load truth or dare category ${id}`, e);
    return null;
  }
}
