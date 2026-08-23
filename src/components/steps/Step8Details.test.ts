import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { setActivePinia, createPinia } from 'pinia'
import { useCharacterStore } from '@/stores/character'
import type { GameVariant } from '@/stores/app'
import { preloadVariantData } from '@/data'
import Step8Details from './Step8Details.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'it',
  fallbackLocale: 'it',
  messages: { it: {} },
  missingWarn: false,
  fallbackWarn: false,
})

function mountDetails(variant: GameVariant) {
  const store = useCharacterStore()
  store.resetCharacter()
  store.character.variant = variant
  return mount(Step8Details, {
    global: {
      plugins: [i18n],
      stubs: { VariantPromo: true, RouterLink: true },
    },
  })
}

const VARIANTS = ['dnd5e', 'dnd2024', 'brancalonia', 'apocalisse'] as const

describe('Step8Details', () => {
  beforeAll(async () => {
    setActivePinia(createPinia())
    await Promise.all(VARIANTS.map(v => preloadVariantData(v)))
  })

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  /**
   * Il passo rifaceva a mano .bsc-field / .bsc-input / .bsc-select: ventuno
   * controlli con la stessa riga di utility copiata. Se qualcuno ne aggiunge
   * uno nuovo copiando la vecchia ricetta, questo test lo intercetta.
   */
  it.each(VARIANTS)('veste ogni controllo con le classi del design system (%s)', variant => {
    const wrapper = mountDetails(variant)

    const inputs = wrapper.findAll('input, textarea')
    expect(inputs.length).toBeGreaterThan(0)
    for (const el of inputs) {
      expect(el.classes(), `${el.attributes('id')} non usa .bsc-input`).toContain('bsc-input')
    }

    for (const el of wrapper.findAll('select')) {
      expect(el.classes(), `${el.attributes('id')} non usa .bsc-select`).toContain('bsc-select')
    }
  })

  /**
   * .bsc-field è il contenitore etichetta+campo: l'etichetta deve restare un
   * <label for> agganciato al controllo, altrimenti la conversione della pelle
   * si sarebbe portata via il nome accessibile.
   */
  it.each(VARIANTS)('tiene ogni etichetta agganciata al suo controllo (%s)', variant => {
    const wrapper = mountDetails(variant)
    const labels = wrapper.findAll('label')
    expect(labels.length).toBeGreaterThanOrEqual(12)

    for (const label of labels) {
      const target = label.attributes('for')
      expect(target).toBeTruthy()
      expect(
        wrapper.find(`#${target}`).exists(),
        `nessun controllo con id="${target}"`,
      ).toBe(true)
      expect(label.element.parentElement?.classList.contains('bsc-field')).toBe(true)
    }
  })

  /**
   * .bsc-input porta con sé il colore del segnaposto: i segnaposto devono
   * esserci ancora, non essere stati assorbiti dalla riscrittura delle classi.
   */
  it('conserva i segnaposto e lo stato di sola lettura di Brancalonia', () => {
    const wrapper = mountDetails('brancalonia')

    const notes = wrapper.find('#session-notes')
    expect(notes.attributes('placeholder')).toBeTruthy()
    expect(wrapper.find('#branc-brawling-moves').attributes('placeholder')).toBeTruthy()
    expect(wrapper.find('#branc-misdeeds').attributes('placeholder')).toBeTruthy()

    const size = wrapper.find('#branc-size')
    expect(size.attributes('readonly')).toBeDefined()
    expect(size.attributes('aria-readonly')).toBe('true')
  })

  /**
   * .font-gothic (Courier Prime) non compariva in nessuno dei nove passi:
   * il prodotto vero era l'unica parte senza la voce del marchio.
   */
  it('dà ai titoli la voce tipografica del marchio', () => {
    const wrapper = mountDetails('apocalisse')
    expect(wrapper.get('#details-heading').classes()).toContain('font-gothic')
    for (const h3 of wrapper.findAll('h3')) {
      expect(h3.classes()).toContain('font-gothic')
    }
  })
})
