import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { setActivePinia, createPinia } from 'pinia'
import { useCharacterStore } from '@/stores/character'
import { preloadVariantData } from '@/data'
import Step2Race from './Step2Race.vue'

// Minimal i18n — with locale 'en', game terms fall back to the raw English
// names, so buttons read "Dwarf" / "Hill Dwarf" / "Mountain Dwarf".
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en: {} },
  missingWarn: false,
  fallbackWarn: false,
})

function mountStep() {
  const store = useCharacterStore()
  store.character.variant = 'dnd5e'
  const wrapper = mount(Step2Race, { global: { plugins: [i18n] } })
  return { store, wrapper }
}

describe('Step2Race — subrace selection (issue #1)', () => {
  beforeAll(async () => {
    await preloadVariantData('dnd5e')
  })
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  async function selectDwarf(wrapper: ReturnType<typeof mountStep>['wrapper']) {
    // Only race radios exist before a race is chosen (details are hidden)
    const raceBtn = wrapper.findAll('[role="radio"]').find(b => b.text().includes('Dwarf'))
    expect(raceBtn, 'Dwarf race button should exist').toBeTruthy()
    await raceBtn!.trigger('click')
  }

  function subraceButtons(wrapper: ReturnType<typeof mountStep>['wrapper']) {
    const groups = wrapper.findAll('[role="radiogroup"]')
    // The last radiogroup is the subrace picker
    const subGroup = groups[groups.length - 1]!
    return subGroup.findAll('button')
  }

  it('defaults to the first subrace and applies its bonuses', async () => {
    const { store, wrapper } = mountStep()
    await selectDwarf(wrapper)

    expect(store.character.race).toBe('dwarf')
    expect(store.character.subrace).toBe('hill-dwarf')
    // Dwarf (con +2) + Hill Dwarf (wis +1)
    expect(store.character.racialBonuses).toMatchObject({ con: 2, wis: 1 })
  })

  it('keeps a manually chosen subrace and updates bonuses (regression)', async () => {
    const { store, wrapper } = mountStep()
    await selectDwarf(wrapper)

    const mountain = subraceButtons(wrapper).find(b => b.text().includes('Mountain'))
    expect(mountain, 'Mountain Dwarf subrace button should exist').toBeTruthy()
    await mountain!.trigger('click')

    // Before the fix, selecting a subrace reverted to the first one.
    expect(store.character.subrace).toBe('mountain-dwarf')
    expect(mountain!.attributes('aria-checked')).toBe('true')
    // Dwarf (con +2) + Mountain Dwarf (str +2); the hill-dwarf wis bonus is gone
    expect(store.character.racialBonuses).toMatchObject({ con: 2, str: 2 })
    expect(store.character.racialBonuses.wis ?? 0).toBe(0)
  })
})
