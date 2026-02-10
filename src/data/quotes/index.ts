import { loadAll as loadPoems } from '../poetry';

export interface QuoteCategory {
  id: string;
  name: string;
}

export interface Quote {
  category: string;
  content: string;
  author: string;
}

export const quoteCategories: QuoteCategory[] = [
  { id: 'poetry', name: '诗词名言' },
  { id: 'movie', name: '电影对白' },
  { id: 'rainbow', name: '彩虹屁' },
  { id: 'coder', name: '程序员语录' },
  { id: 'sad', name: '伤感语录' }
];

const cache = new Map<string, Quote[]>();

const importMap: Record<string, () => Promise<Quote[]>> = {
  poetry: async () => {
    try {
      const poems = await loadPoems();
      const quotes: Quote[] = [];
      poems.forEach(p => {
        p.content.forEach(line => {
          if (line.length >= 4) {
            quotes.push({
              category: 'poetry',
              content: line,
              author: `${p.author}《${p.title}》`
            });
          }
        });
      });
      return quotes;
    } catch (e) {
      console.error('Failed to load poems', e);
      return [];
    }
  },
  movie: () => import('./movie.json').then(m => m.default),
  rainbow: () => import('./rainbow.json').then(m => m.default),
  coder: () => import('./coder.json').then(m => m.default),
  sad: () => import('./sad.json').then(m => m.default)
};

export async function loadQuotes(categoryId: string): Promise<Quote[]> {
  if (cache.has(categoryId)) return cache.get(categoryId)!;

  const loader = importMap[categoryId];
  if (!loader) return [];

  try {
    const data = await loader();
    cache.set(categoryId, data);
    return data;
  } catch (e) {
    console.error(`Failed to load quotes for ${categoryId}`, e);
    return [];
  }
}
