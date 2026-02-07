
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
    
    const mode = ref(localStorage.getItem('theme-mode') || 'system')

    
    const theme = ref('light')

    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    
    function updateTheme() {
        if (mode.value === 'system') {
            theme.value = mediaQuery.matches ? 'dark' : 'light'
        } else {
            theme.value = mode.value
        }

        
        document.documentElement.setAttribute('data-theme', theme.value)
    }

    
    function setMode(newMode) {
        mode.value = newMode
        localStorage.setItem('theme-mode', newMode)
        updateTheme()
    }

    
    function toggleTheme() {
        if (mode.value === 'system') {
            setMode(theme.value === 'dark' ? 'light' : 'dark')
        } else {
            setMode(mode.value === 'dark' ? 'light' : 'dark')
        }
    }

    
    mediaQuery.addEventListener('change', () => {
        if (mode.value === 'system') {
            updateTheme()
        }
    })

    
    updateTheme()

    return {
        mode,
        theme,
        setMode,
        toggleTheme,
        updateTheme
    }
})
