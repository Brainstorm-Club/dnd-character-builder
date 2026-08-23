import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { setActivePinia, createPinia } from 'pinia'
import Step1Variant from './Step1Variant.vue'

const i18n = createI18n({
  legacy: false, locale: 'en', fallbackLocale: 'en',
  messages: { en: {} }, missingWarn: false, fallbackWarn: false,
})

function mountStep() {
  return mount(Step1Variant, {
    global: { plugins: [i18n], stubs: { VariantPromo: true } },
  })
}

describe('passo della variante', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('scrive il titolo del passo con la faccia da macchina da scrivere', () => {
    const wrapper = mountStep()
    const heading = wrapper.find('#variant-heading')
    expect(heading.classes()).toContain('font-gothic')
    // La scala tipografica non cambia: resta text-2xl come negli altri passi.
    expect(heading.classes()).toContain('text-2xl')
  })

  it('lascia le quattro schede a due stati com\'erano, non le converte in .bsc-opt', () => {
    // .bsc-opt del DS presuppone l'attributo disabled nativo, che toglie il
    // controllo dalla tabulazione; qui il contratto è aria-checked.
    const wrapper = mountStep()
    const cards = wrapper.findAll('[role="radio"]')
    expect(cards).toHaveLength(4)
    for (const card of cards) {
      expect(card.classes()).not.toContain('bsc-opt')
      expect(card.attributes('aria-checked')).toBeDefined()
    }
    expect(wrapper.find('[role="radiogroup"]').exists()).toBe(true)
  })
})
