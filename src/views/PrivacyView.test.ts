import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { h } from 'vue'
import PrivacyView from './PrivacyView.vue'

const i18n = createI18n({
  legacy: false, locale: 'en', fallbackLocale: 'en',
  messages: { en: {} }, missingWarn: false, fallbackWarn: false,
})

const RouterLinkStub = { props: ['to'], render() { return h('a') } }

describe('informativa privacy', () => {
  it('usa la card del design system al posto del riquadro rifatto a mano', () => {
    const wrapper = mount(PrivacyView, {
      global: { plugins: [i18n], stubs: { RouterLink: RouterLinkStub } },
    })
    const card = wrapper.find('.bsc-card')
    expect(card.exists()).toBe(true)
    // Fondo e imbottitura arrivano dal DS: non devono più stare in utility.
    expect(card.classes()).not.toContain('bg-stone-800')
    expect(card.classes()).not.toContain('p-6')
    // Bordo e raggio restano quelli dell'app, per non sfasare l'aspetto.
    expect(card.classes()).toContain('border-stone-700')
    expect(card.classes()).toContain('rounded-lg')
  })

  it('conserva la sezione etichettata dal titolo', () => {
    const wrapper = mount(PrivacyView, {
      global: { plugins: [i18n], stubs: { RouterLink: RouterLinkStub } },
    })
    expect(wrapper.find('section').attributes('aria-labelledby')).toBe('privacy-heading')
    expect(wrapper.find('#privacy-heading').exists()).toBe(true)
  })
})
