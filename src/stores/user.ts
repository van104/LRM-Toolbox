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

export const useUserStore = defineStore(
  'user',
  () => {
    const favorites = ref<string[]>([]);
    const history = ref<HistoryItem[]>([]);

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
    }

    function addFavorite(toolId: string) {
      if (!favorites.value.includes(toolId)) {
        favorites.value.push(toolId);
      }
    }

    function removeFavorite(toolId: string) {
      const index = favorites.value.indexOf(toolId);
      if (index !== -1) {
        favorites.value.splice(index, 1);
      }
    }

    function clearFavorites() {
      favorites.value = [];
    }

    function reorderFavorites(newOrder: string[]) {
      favorites.value = newOrder;
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
    }

    function clearHistory() {
      history.value = [];
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
  },
  { persist: true }
);
