import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ThemeMode = 'light' | 'dark' | 'system';
export type Theme = 'light' | 'dark';

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>((localStorage.getItem('theme-mode') as ThemeMode) || 'system');

  const theme = ref<Theme>('light');

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function updateTheme() {
    if (mode.value === 'system') {
      theme.value = mediaQuery.matches ? 'dark' : 'light';
    } else {
      theme.value = mode.value as Theme;
    }

    document.documentElement.setAttribute('data-theme', theme.value);
    if (theme.value === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  function setMode(newMode: ThemeMode) {
    mode.value = newMode;
    localStorage.setItem('theme-mode', newMode);
    updateTheme();
  }

  function toggleTheme() {
    if (mode.value === 'system') {
      setMode(theme.value === 'dark' ? 'light' : 'dark');
    } else {
      setMode(mode.value === 'dark' ? 'light' : 'dark');
    }
  }

  mediaQuery.addEventListener('change', () => {
    if (mode.value === 'system') {
      updateTheme();
    }
  });

  updateTheme();

  return {
    mode,
    theme,
    setMode,
    toggleTheme,
    updateTheme
  };
});
