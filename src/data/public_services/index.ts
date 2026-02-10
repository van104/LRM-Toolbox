export interface ServiceItem {
  title: string;
  desc: string;
  icon: string;
  color: string;
  url: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  items: ServiceItem[];
}

const importMap: Record<string, () => Promise<ServiceCategory>> = {
  government: () => import('./government.json').then(m => m.default),
  traffic: () => import('./traffic.json').then(m => m.default),
  logistics: () => import('./logistics.json').then(m => m.default),
  finance: () => import('./finance.json').then(m => m.default),
  medical: () => import('./medical.json').then(m => m.default),
  education: () => import('./education.json').then(m => m.default),
  utility: () => import('./utility.json').then(m => m.default),
  complaint: () => import('./complaint.json').then(m => m.default),
  culture: () => import('./culture.json').then(m => m.default),
  business: () => import('./business.json').then(m => m.default),
  recruitment: () => import('./recruitment.json').then(m => m.default)
};

const cache = new Map<string, ServiceCategory>();

export async function loadCategory(id: string): Promise<ServiceCategory | null> {
  if (cache.has(id)) return cache.get(id)!;
  const loader = importMap[id];
  if (!loader) return null;
  try {
    const data = await loader();
    cache.set(id, data);
    return data;
  } catch (e) {
    console.error(`Failed to load service category ${id}`, e);
    return null;
  }
}

export async function loadAll(): Promise<ServiceCategory[]> {
  const ids = Object.keys(importMap);
  const results = await Promise.all(ids.map(id => loadCategory(id)));
  return results.filter((item): item is ServiceCategory => item !== null);
}

export async function searchServices(keyword: string): Promise<ServiceCategory[]> {
  const all = await loadAll();
  const lowerKeyword = keyword.toLowerCase();

  if (!lowerKeyword) return all;

  return all
    .map(category => ({
      ...category,
      items: category.items.filter(
        item =>
          item.title.toLowerCase().includes(lowerKeyword) ||
          item.desc.toLowerCase().includes(lowerKeyword)
      )
    }))
    .filter(category => category.items.length > 0);
}
