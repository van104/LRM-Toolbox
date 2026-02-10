import { loadAll as loadIdiomData } from '../idioms';

export async function loadEnglishWords(): Promise<string[]> {
  try {
    const data = await import('./english.json');
    return data.default as string[];
  } catch (e) {
    console.error('Failed to load english words', e);
    return [];
  }
}

export async function loadChineseIdioms(): Promise<string[]> {
  try {
    const allIdioms = await loadIdiomData();
    // Idioms are DictionaryItem objects. We need the 'name' string.
    // Also, WordGuess likely expects 4-character idioms primarily?
    // most idioms in the list were 4 chars.
    // Filter for 4 chars to be safe? The original list had 4 chars mostly.
    return allIdioms.map(item => item.name).filter(w => w.length === 4);
  } catch (e) {
    console.error('Failed to load idioms', e);
    return [];
  }
}
