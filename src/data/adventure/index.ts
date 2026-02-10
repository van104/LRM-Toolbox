export interface GameState {
  hp: number;
  maxHp: number;
  gold: number;
  strength: number;
  inventory: string[];
  mp?: number;
}

export interface Choice {
  text: string;
  next: string;
  effect?: {
    addItems?: string[];
    karma?: number;
    gold?: number;
    hp?: number;
    strength?: number;
  };
  req?: {
    minStrength?: number;
    minDex?: number;
  };
  history?: string;
  cost?: { gold?: number };
}

export interface StoryNode {
  text: string;
  choices: Choice[];
  isEnding?: boolean;
}

export interface Story {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  summary: string;
  initialState: GameState;
  startNode: string;
  nodes: Record<string, StoryNode>;
}

const cache = new Map<string, Story>();

const importMap: Record<string, () => Promise<Story>> = {
  wuxia_origin: () => import('./wuxia_origin.json').then(m => m.default),
  fantasy_cave: () => import('./fantasy_cave.json').then(m => m.default)
};

export async function loadById(id: string): Promise<Story | null> {
  if (cache.has(id)) return cache.get(id)!;
  const loader = importMap[id];
  if (!loader) return null;
  try {
    const data = await loader();
    cache.set(id, data);
    return data;
  } catch {
    return null;
  }
}

export async function loadAll(): Promise<Story[]> {
  const ids = Object.keys(importMap);
  const results = await Promise.all(ids.map(id => loadById(id)));
  return results.filter((s): s is Story => s !== null);
}
