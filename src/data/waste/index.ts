export interface WasteItem {
  name: string;
  category: string;
  tips?: string;
}

export const wasteCategories = [
  {
    id: 'recyclable',
    name: '可回收物',
    en: 'Recyclables',
    color: '#004daa',
    iconType: 'Grid',
    desc: '适宜回收利用和资源化利用的生活废弃物。',
    requirements: ['轻投轻放', '清洁干燥', '避免污染', '废纸尽量平整', '立体包装请压扁'],
    examples: ['纸板箱', '玻璃瓶', '金属易拉罐', '旧衣服', '塑料瓶']
  },
  {
    id: 'kitchen',
    name: '厨余垃圾',
    en: 'Kitchen Waste',
    color: '#623d31',
    iconType: 'Bowl',
    desc: '易腐的有机垃圾，包括剩菜剩饭、瓜皮果核等。',
    requirements: ['滤干水分', '沥干油渍', '袋装垃圾请拆袋', '剔除大骨头及贝壳'],
    examples: ['剩菜剩饭', '菜叶菜梗', '果壳瓜皮', '茶叶渣', '残枝落叶']
  },
  {
    id: 'hazardous',
    name: '有害垃圾',
    en: 'Hazardous Waste',
    color: '#e7312d',
    iconType: 'Warning',
    desc: '对人体健康或者自然环境造成直接或者潜在危害的零星废弃物。',
    requirements: ['连带包装投放', '密封投放', '破损请包裹', '防止内容物外溢'],
    examples: ['废电池', '废灯管', '废药品', '油漆桶', '杀虫剂']
  },
  {
    id: 'residual',
    name: '其他垃圾',
    en: 'Residual Waste',
    color: '#2c2b2a',
    iconType: 'Delete',
    desc: '除前三类垃圾之外的其他生活废弃物。',
    requirements: ['尽量沥干水分', '杜绝混入可回收物', '杜绝混入有害垃圾'],
    examples: ['餐巾纸', '污染纸张', '大骨头', '贝壳', '玻璃陶瓷碎片']
  }
];

const cache = new Map<string, WasteItem[]>();

const importMap: Record<string, () => Promise<WasteItem[]>> = {
  可回收物: () => import('./recyclable.json').then(m => m.default),
  厨余垃圾: () => import('./kitchen.json').then(m => m.default),
  有害垃圾: () => import('./hazardous.json').then(m => m.default),
  其他垃圾: () => import('./residual.json').then(m => m.default)
};

export async function loadByCategory(category: string): Promise<WasteItem[]> {
  if (cache.has(category)) return cache.get(category)!;

  const loader = importMap[category];
  if (!loader) return [];

  try {
    const data = await loader();
    cache.set(category, data);
    return data;
  } catch {
    return [];
  }
}

export async function loadAll(): Promise<WasteItem[]> {
  const categories = Object.keys(importMap);
  const results = await Promise.all(categories.map(c => loadByCategory(c)));
  return results.flat();
}

export async function searchWaste(keyword: string): Promise<WasteItem[]> {
  if (!keyword) return [];
  const all = await loadAll();
  const lowerKeyword = keyword.toLowerCase();
  return all.filter(item => item.name.toLowerCase().includes(lowerKeyword));
}

export function getCategoryTagType(category: string): string {
  const map: Record<string, string> = {
    可回收物: 'primary',
    厨余垃圾: 'success',
    有害垃圾: 'danger',
    其他垃圾: 'info'
  };
  return map[category] || 'info';
}
