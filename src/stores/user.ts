import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface Tool {
  id: string;
  name: string;
  icon?: string;
  route: string;
  description?: string;
  category?: string;
  tags?: string[];
  isLocal?: boolean;
  isAi?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface HistoryItem {
  id: string;
  name: string;
  icon?: string;
  route: string;
  usedAt: string;
}

export const useUserStore = defineStore('user', () => {
  const favorites = ref<string[]>(JSON.parse(localStorage.getItem('tool-favorites') || '[]'));

  const history = ref<HistoryItem[]>(JSON.parse(localStorage.getItem('tool-history') || '[]'));

  const MAX_HISTORY = 20;

  function isFavorite(toolId: string): boolean {
    return favorites.value.includes(toolId);
  }

  function toggleFavorite(toolId: string) {
    const index = favorites.value.indexOf(toolId);
    if (index === -1) {
      favorites.value.push(toolId);
    } else {
      favorites.value.splice(index, 1);
    }
    saveFavorites();
  }

  function addFavorite(toolId: string) {
    if (!favorites.value.includes(toolId)) {
      favorites.value.push(toolId);
      saveFavorites();
    }
  }

  function removeFavorite(toolId: string) {
    const index = favorites.value.indexOf(toolId);
    if (index !== -1) {
      favorites.value.splice(index, 1);
      saveFavorites();
    }
  }

  function clearFavorites() {
    favorites.value = [];
    saveFavorites();
  }

  function saveFavorites() {
    localStorage.setItem('tool-favorites', JSON.stringify(favorites.value));
  }

  function reorderFavorites(newOrder: string[]) {
    favorites.value = newOrder;
    saveFavorites();
  }

  function addToHistory(tool: Tool) {
    const existingIndex = history.value.findIndex(h => h.id === tool.id);
    if (existingIndex !== -1) {
      history.value.splice(existingIndex, 1);
    }

    history.value.unshift({
      id: tool.id,
      name: tool.name,
      icon: tool.icon,
      route: tool.route,
      usedAt: new Date().toISOString()
    });

    if (history.value.length > MAX_HISTORY) {
      history.value = history.value.slice(0, MAX_HISTORY);
    }

    saveHistory();
  }

  function clearHistory() {
    history.value = [];
    saveHistory();
  }

  function saveHistory() {
    localStorage.setItem('tool-history', JSON.stringify(history.value));
  }

  const recentTools = computed(() => history.value.slice(0, 5));

  const favoritesCount = computed(() => favorites.value.length);

  const historyCount = computed(() => history.value.length);

  return {
    favorites,
    history,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    addToHistory,
    clearHistory,
    recentTools,
    reorderFavorites,
    clearFavorites,
    favoritesCount,
    historyCount
  };
});
