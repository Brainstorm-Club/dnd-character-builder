import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { setActivePinia, createPinia } from 'pinia'
import { useCharacterStore } from '@/stores/character'
import type { GameVariant } from '@/stores/app'
import { preloadVariantData } from '@/data'
import Step3Class from './Step3Class.vue'

// Minimal i18n — with locale 'en', game terms fall back to the raw English
// names and missing keys render as the key itself ("class.subclassAtLevel").
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en: {} },
  missingWarn: false,
  fallbackWarn: false,
})

function mountStep(variant: GameVariant = 'dnd5e', level = 1) {
  const store = useCharacterStore()
  store.character.variant = variant
  store.character.level = level
  const wrapper = mount(Step3Class, { global: { plugins: [i18n] } })
  return { store, wrapper }
}

type Wrapper = ReturnType<typeof mountStep>['wrapper']

async function selectClass(wrapper: Wrapper, name: string) {
  const group = wrapper.find('[aria-label="class.title"]')
  const btn = group.findAll('[role="radio"]').find(b => b.text().includes(name))
  expect(btn, `class button "${name}" should exist`).toBeTruthy()
  await btn!.trigger('click')
}

/** Buttons of the subclass picker in the class details panel (empty if hidden) */
function subclassButtons(wrapper: Wrapper) {
  const groups = wrapper.findAll('[aria-label="class.subclass"]')
  return groups.length ? groups[0]!.findAll('button') : []
}

async function clickSubclass(wrapper: Wrapper, name: string) {
  const btn = subclassButtons(wrapper).find(b => b.text().includes(name))
  expect(btn, `subclass button "${name}" should exist`).toBeTruthy()
  await btn!.trigger('click')
}

describe('Step3Class — subclass selection', () => {
  beforeAll(async () => {
    await preloadVariantData('dnd5e')
    await preloadVariantData('brancalonia')
  })
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('hides the picker below the class subclass level', async () => {
    const { store, wrapper } = mountStep('dnd5e', 1)
    await selectClass(wrapper, 'Barbarian')

    // Barbarian picks a Primal Path at level 3
    expect(subclassButtons(wrapper)).toHaveLength(0)
    expect(wrapper.text()).toContain('class.subclassAtLevel')
    expect(store.character.subclass).toBe('')
  })

  it('shows the picker once the character reaches the subclass level', async () => {
    const { wrapper } = mountStep('dnd5e', 3)
    await selectClass(wrapper, 'Barbarian')

    const labels = subclassButtons(wrapper).map(b => b.text())
    expect(labels).toContain('Path of the Berserker')
    expect(wrapper.text()).not.toContain('class.subclassAtLevel')
  })

  it('does not preselect a subclass', async () => {
    const { store, wrapper } = mountStep('brancalonia', 3)
    await selectClass(wrapper, 'Barbarian')

    expect(subclassButtons(wrapper)).toHaveLength(2)
    expect(store.character.subclass).toBe('')
    expect(subclassButtons(wrapper).every(b => b.attributes('aria-checked') === 'false')).toBe(true)
  })

  it('stores the chosen subclass and grants its features up to the character level', async () => {
    const { store, wrapper } = mountStep('brancalonia', 3)
    await selectClass(wrapper, 'Barbarian')
    await clickSubclass(wrapper, 'Rabble-Rouser')

    expect(store.character.subclass).toBe('ciurmatore')
    // Level 3 features are granted...
    expect(store.character.featuresTraits).toContain('Incite Riot')
    expect(store.character.featuresTraits).toContain('Voice of the People')
    // ...but nothing from a level the character has not reached yet
    expect(store.character.featuresTraits).not.toContain('Revolutionary Fervor')

    const checked = subclassButtons(wrapper).filter(b => b.attributes('aria-checked') === 'true')
    expect(checked).toHaveLength(1)
    expect(checked[0]!.text()).toContain('Rabble-Rouser')
  })

  it('grants every earned level of subclass features at higher levels', async () => {
    const { store, wrapper } = mountStep('brancalonia', 6)
    await selectClass(wrapper, 'Barbarian')
    await clickSubclass(wrapper, 'Pagan')

    expect(store.character.subclass).toBe('pagan')
    // Levels 3, 3 and 6 — the whole progression up to the character's level
    expect(store.character.featuresTraits).toEqual(
      expect.arrayContaining(['Pagan Fury', 'Rite of the Horned One', 'Spirit of the Land']),
    )
  })

  it('swaps features when the subclass choice changes', async () => {
    const { store, wrapper } = mountStep('brancalonia', 3)
    await selectClass(wrapper, 'Barbarian')
    await clickSubclass(wrapper, 'Pagan')
    await clickSubclass(wrapper, 'Rabble-Rouser')

    expect(store.character.subclass).toBe('ciurmatore')
    expect(store.character.featuresTraits).toContain('Incite Riot')
    expect(store.character.featuresTraits).not.toContain('Pagan Fury')
    expect(store.character.featuresTraits).not.toContain('Rite of the Horned One')
  })

  it('clears the subclass and its features when another class is chosen', async () => {
    const { store, wrapper } = mountStep('brancalonia', 3)
    await selectClass(wrapper, 'Barbarian')
    await clickSubclass(wrapper, 'Pagan')
    await selectClass(wrapper, 'Bard')

    expect(store.character.className).toBe('bard')
    expect(store.character.subclass).toBe('')
    expect(store.character.featuresTraits).not.toContain('Pagan Fury')
  })

  it('restores the chosen subclass when the step is re-mounted', async () => {
    const { store, wrapper } = mountStep('brancalonia', 3)
    await selectClass(wrapper, 'Barbarian')
    await clickSubclass(wrapper, 'Pagan')
    wrapper.unmount()

    const again = mount(Step3Class, { global: { plugins: [i18n] } })
    const checked = subclassButtons(again).filter(b => b.attributes('aria-checked') === 'true')
    expect(checked).toHaveLength(1)
    expect(checked[0]!.text()).toContain('Pagan')
    expect(store.character.subclass).toBe('pagan')
  })

  it('offers a subclass for a multiclass entry that reached its own level', async () => {
    const { store, wrapper } = mountStep('dnd5e', 3)
    await selectClass(wrapper, 'Barbarian')

    store.addMulticlass('fighter')
    await wrapper.vm.$nextTick()
    // Fighter is only level 1 — the Martial Archetype is not available yet
    expect(wrapper.text()).not.toContain('Champion')

    store.levelUp('fighter')
    store.levelUp('fighter')
    await wrapper.vm.$nextTick()

    const champion = wrapper.findAll('[role="radio"]').find(b => b.text().trim() === 'Champion')
    expect(champion, 'Champion subclass button should exist').toBeTruthy()
    await champion!.trigger('click')

    const fighterEntry = store.character.classes.find(c => c.classId === 'fighter')
    expect(fighterEntry?.subclass).toBe('champion')
    // The primary class keeps its own (still unset) subclass
    expect(store.character.subclass).toBe('')
    expect(store.character.featuresTraits).toContain('Improved Critical')
  })
})
