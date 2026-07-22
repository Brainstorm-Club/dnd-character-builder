import { computed, watchEffect, ref, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import type { ThemeMode } from '@/stores/app'

/**
 * Composable for managing the application theme (dark/light/auto).
 * Applies `data-theme` attribute on <html> and listens for system preference changes.
 */
export function useTheme() {
  const appStore = useAppStore()

  // Track system preference reactively
  const systemPrefersDark = ref(true)
  const mql = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null

  if (mql) {
    systemPrefersDark.value = mql.matches
    const handler = (e: MediaQueryListEvent) => {
      systemPrefersDark.value = e.matches
    }
    mql.addEventListener('change', handler)
    onUnmounted(() => mql.removeEventListener('change', handler))
  }

  /** The resolved theme (always 'dark' or 'light', never 'auto') */
  const effectiveTheme = computed<'dark' | 'light'>(() => {
    if (appStore.theme === 'auto') {
      return systemPrefersDark.value ? 'dark' : 'light'
    }
    return appStore.theme
  })

  const isDark = computed(() => effectiveTheme.value === 'dark')

  // Apply data-theme on <html> whenever it changes
  watchEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', effectiveTheme.value)
      // Unificazione cross-app: persiste il tema EFFETTIVO nella chiave condivisa del
      // design system e notifica, così sito/harp-forge/tracker restano allineati.
      try { localStorage.setItem('bsc-theme', effectiveTheme.value) } catch { /* no storage */ }
      document.dispatchEvent(new CustomEvent('bsc:themechange', { detail: { theme: effectiveTheme.value } }))
    }
  })

  /** Cycle through: dark → light → auto → dark */
  function toggleTheme() {
    const order: ThemeMode[] = ['dark', 'light', 'auto']
    const idx = order.indexOf(appStore.theme)
    const next = order[(idx + 1) % order.length]!
    appStore.setTheme(next)
  }

  /** Set a specific theme mode */
  function setTheme(mode: ThemeMode) {
    appStore.setTheme(mode)
  }

  return {
    theme: computed(() => appStore.theme),
    effectiveTheme,
    isDark,
    toggleTheme,
    setTheme,
  }
}
