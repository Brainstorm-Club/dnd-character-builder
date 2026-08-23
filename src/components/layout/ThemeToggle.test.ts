import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { setActivePinia, createPinia } from 'pinia'
import ThemeToggle from './ThemeToggle.vue'
import { useAppStore } from '@/stores/app'

const i18n = createI18n({
  legacy: false, locale: 'en', fallbackLocale: 'en',
  messages: {
    en: { theme: { toggle: 'Change theme', dark: 'Dark', light: 'Light', auto: 'System' } },
  },
  missingWarn: false, fallbackWarn: false,
})

// jsdom non implementa matchMedia e useTheme lo interroga al montaggio.
function stubMatchMedia(prefersDark: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: prefersDark, media: query, onchange: null,
    addEventListener: () => {}, removeEventListener: () => {},
    addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
  }))
}

function mountToggle() {
  return mount(ThemeToggle, { global: { plugins: [i18n] } })
}

describe('commutatore di tema', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    stubMatchMedia(true)
  })

  it('usa la pelle unificata del design system', () => {
    const wrapper = mountToggle()
    expect(wrapper.find('button').classes()).toContain('bsc-theme-toggle')
  })

  it('mostra luna sul carbone e sole sulla carta, con le classi del DS', async () => {
    const store = useAppStore()
    store.setTheme('dark')
    const wrapper = mountToggle()
    expect(wrapper.find('.bsc-tt-moon').exists()).toBe(true)
    expect(wrapper.find('.bsc-tt-sun').exists()).toBe(false)

    store.setTheme('light')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.bsc-tt-sun').exists()).toBe(true)
    expect(wrapper.find('.bsc-tt-moon').exists()).toBe(false)
  })

  it('in automatico mostra un\'icona propria e non .bsc-tt-auto', async () => {
    // .bsc-tt-auto del DS è display:none finché <html> non ha
    // data-theme-pref="auto": usarla qui lascerebbe il pulsante vuoto.
    const store = useAppStore()
    store.setTheme('auto')
    const wrapper = mountToggle()
    expect(wrapper.find('.bsc-tt-auto').exists()).toBe(false)
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('conserva etichetta accessibile e suggerimento che seguono lo stato', async () => {
    const store = useAppStore()
    store.setTheme('dark')
    const wrapper = mountToggle()
    const button = wrapper.find('button')
    expect(button.attributes('aria-label')).toBe('Change theme')
    expect(button.attributes('title')).toBe('Dark')

    store.setTheme('auto')
    await wrapper.vm.$nextTick()
    expect(button.attributes('title')).toBe('System')
  })
})
