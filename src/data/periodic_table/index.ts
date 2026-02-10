export interface Element {
  number: number;
  symbol: string;
  name: string;
  weight: string;
  row: number;
  col: number;
  category: string;
  config: string;
  history?: string;
}

const cache: Element[] = [];

export async function loadPeriodicElements(): Promise<Element[]> {
  if (cache.length > 0) return cache;
  try {
    const data = await import('./elements.json');
    const elements = (data.default || data) as Element[];
    cache.push(...elements);
    return elements;
  } catch (e) {
    console.error('Failed to load elements', e);
    return [];
  }
}
