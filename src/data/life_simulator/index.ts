import { LifeData, GameState } from './types';
import initStats from './initial_stats.json';

export const initialStats: GameState = initStats as unknown as GameState;

let cachedData: LifeData | null = null;

export async function loadLifeData(): Promise<LifeData> {
  if (cachedData) return cachedData;
  try {
    const mod = await import('./data.json');
    cachedData = (mod.default || mod) as unknown as LifeData;
    return cachedData;
  } catch (e) {
    console.error('Failed to load life data', e);
    throw e;
  }
}

export * from './types';
