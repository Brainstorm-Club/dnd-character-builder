import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import Step5Background from './Step5Background.vue'
import { useCharacterStore } from '@/stores/character'
import { getBackgrounds, preloadVariantData } from '@/data'

const i18n = createI18n({
  legacy: false, locale: 'en', fallbackLocale: 'en',
  messages: { en: {} }, missingWarn: false, fallbackWarn: false,
})

describe('passo Background', () => {
  beforeAll(async () => {
    await preloadVariantData('apocalisse')
  })
  beforeEach(() => setActivePinia(createPinia()))

  function mountFor(variant: 'apocalisse') {
    const store = useCharacterStore()
    store.character.variant = variant
    return { store, wrapper: mount(Step5Background, { global: { plugins: [i18n] } }) }
  }

  it('mostra un selettore per ogni abilità a scelta dell\'Origine', async () => {
    const { wrapper } = mountFor('apocalisse')
    await wrapper.vm.$nextTick()
    const cards = wrapper.findAll('[role="radiogroup"] button')
    expect(cards.length).toBe(getBackgrounds('apocalisse').length)

    // Figlio del Vecchio Mondo: due fra sei abilità, più una qualsiasi
    await cards[0]!.trigger('click')
    const bg = getBackgrounds('apocalisse')[0]!
    const slots = (bg.skillChoices ?? []).reduce((n, c) => n + c.count, 0)
    expect(slots).toBeGreaterThan(0)
    expect(wrapper.findAll('select')).toHaveLength(slots)
  })

  it('registra le abilità scelte e non le ripropone altrove', async () => {
    const { store, wrapper } = mountFor('apocalisse')
    await wrapper.vm.$nextTick()
    await wrapper.findAll('[role="radiogroup"] button')[0]!.trigger('click')

    const bg = getBackgrounds('apocalisse')[0]!
    const first = bg.skillChoices![0]!.from[0]!
    await wrapper.findAll('select')[0]!.setValue(first)
    expect(store.character.skillProficiencies).toContain(first)

    const others = wrapper.findAll('select').slice(1)
    for (const s of others) {
      expect(s.findAll('option').map(o => o.element.value)).not.toContain(first)
    }
  })

  it('non concede alcuna abilità finché il giocatore non sceglie', async () => {
    const { store, wrapper } = mountFor('apocalisse')
    await wrapper.vm.$nextTick()
    await wrapper.findAll('[role="radiogroup"] button')[0]!.trigger('click')
    expect(store.character.skillProficiencies).toEqual([])
  })
})
