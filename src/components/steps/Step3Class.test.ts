import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { setActivePinia, createPinia } from 'pinia'
import { useCharacterStore } from '@/stores/character'
import type { GameVariant } from '@/stores/app'
import { getClasses, preloadVariantData } from '@/data'
import type { CharacterClass, Subclass } from '@/data/dnd5e/classes'
import { SKILLS } from '@/data/dnd5e/skills'
import Step3Class from './Step3Class.vue'

// Minimal i18n — with locale 'en', game terms fall back to the raw English
// names and missing keys render as the key itself ("class.subclassAtLevel").
// So class buttons read `cls.name` and subclass buttons read `sub.name`.
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en: {} },
  missingWarn: false,
  fallbackWarn: false,
})

// The variant data files change often (subclasses get added, renamed, reworked),
// so every expectation below is derived from the data rather than hard-coded.

/** First class of the variant offering at least `count` subclasses */
function classWithSubclasses(variant: GameVariant, count = 1): CharacterClass {
  const cls = getClasses(variant).find(c => c.subclasses.length >= count)
  if (!cls) throw new Error(`no ${variant} class with ${count}+ subclasses`)
  return cls
}

/**
 * A subclass that grants features both at its unlock level and at some later
 * level — the shape needed to tell "up to my level" apart from "all of them".
 */
function progressionFixture(variant: GameVariant) {
  for (const cls of getClasses(variant)) {
    for (const sub of cls.subclasses) {
      const earned = sub.features.filter(f => f.level <= cls.subclassLevel)
      const later = sub.features.filter(f => f.level > cls.subclassLevel)
      if (earned.length && later.length) {
        return { cls, sub, threshold: cls.subclassLevel, highest: Math.max(...later.map(f => f.level)) }
      }
    }
  }
  throw new Error(`no ${variant} subclass with features above its unlock level`)
}

function featureNamesAtOrBelow(sub: Subclass, level: number): string[] {
  return sub.features.filter(f => f.level <= level).map(f => f.name)
}

function featureNamesAbove(sub: Subclass, level: number): string[] {
  return sub.features.filter(f => f.level > level).map(f => f.name)
}

function mountStep(variant: GameVariant = 'dnd5e', level = 1) {
  const store = useCharacterStore()
  store.character.variant = variant
  store.character.level = level
  const wrapper = mount(Step3Class, { global: { plugins: [i18n] } })
  return { store, wrapper }
}

type Wrapper = ReturnType<typeof mountStep>['wrapper']

async function selectClass(wrapper: Wrapper, cls: CharacterClass) {
  const group = wrapper.find('[aria-label="class.title"]')
  const btn = group.findAll('[role="radio"]').find(b => b.text().includes(cls.name))
  expect(btn, `class button "${cls.name}" should exist`).toBeTruthy()
  await btn!.trigger('click')
}

/**
 * Skill-picker buttons in the class details panel, in the same order as
 * `cls.skillChoices` (missing i18n keys render as "class.skillChoices").
 */
function skillButtons(wrapper: Wrapper) {
  const group = wrapper.find('[aria-label="class.skillChoices"]')
  return group.exists() ? group.findAll('button') : []
}

/** Buttons of the subclass picker in the class details panel (empty if hidden) */
function subclassButtons(wrapper: Wrapper) {
  const groups = wrapper.findAll('[aria-label="class.subclass"]')
  return groups.length ? groups[0]!.findAll('button') : []
}

async function clickSubclass(wrapper: Wrapper, sub: Subclass) {
  const btn = subclassButtons(wrapper).find(b => b.text() === sub.name)
  expect(btn, `subclass button "${sub.name}" should exist`).toBeTruthy()
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
    const cls = classWithSubclasses('dnd5e')
    expect(cls.subclassLevel).toBeGreaterThan(1)

    const { store, wrapper } = mountStep('dnd5e', 1)
    await selectClass(wrapper, cls)

    expect(subclassButtons(wrapper)).toHaveLength(0)
    expect(wrapper.text()).toContain('class.subclassAtLevel')
    expect(store.character.subclass).toBe('')
  })

  it('shows every subclass once the character reaches the subclass level', async () => {
    const cls = classWithSubclasses('brancalonia', 2)
    const { wrapper } = mountStep('brancalonia', cls.subclassLevel)
    await selectClass(wrapper, cls)

    expect(subclassButtons(wrapper).map(b => b.text()))
      .toEqual(cls.subclasses.map(s => s.name))
    expect(wrapper.text()).not.toContain('class.subclassAtLevel')
  })

  it('does not preselect a subclass', async () => {
    const cls = classWithSubclasses('brancalonia', 2)
    const { store, wrapper } = mountStep('brancalonia', cls.subclassLevel)
    await selectClass(wrapper, cls)

    expect(store.character.subclass).toBe('')
    expect(subclassButtons(wrapper).every(b => b.attributes('aria-checked') === 'false')).toBe(true)
  })

  it('stores the chosen subclass and grants only the features it has earned', async () => {
    const { cls, sub, threshold } = progressionFixture('brancalonia')

    const { store, wrapper } = mountStep('brancalonia', threshold)
    await selectClass(wrapper, cls)
    await clickSubclass(wrapper, sub)

    expect(store.character.subclass).toBe(sub.id)
    expect(store.character.featuresTraits).toEqual(
      expect.arrayContaining(featureNamesAtOrBelow(sub, threshold)),
    )
    for (const later of featureNamesAbove(sub, threshold)) {
      expect(store.character.featuresTraits).not.toContain(later)
    }

    const checked = subclassButtons(wrapper).filter(b => b.attributes('aria-checked') === 'true')
    expect(checked).toHaveLength(1)
    expect(checked[0]!.text()).toBe(sub.name)
  })

  it('grants the whole progression at a higher level', async () => {
    const { cls, sub, highest } = progressionFixture('brancalonia')

    const { store, wrapper } = mountStep('brancalonia', highest)
    await selectClass(wrapper, cls)
    await clickSubclass(wrapper, sub)

    expect(store.character.featuresTraits).toEqual(
      expect.arrayContaining(sub.features.map(f => f.name)),
    )
  })

  it('swaps features when the subclass choice changes', async () => {
    const cls = classWithSubclasses('brancalonia', 2)
    const [first, second] = cls.subclasses as [Subclass, Subclass]
    const level = cls.subclassLevel

    const { store, wrapper } = mountStep('brancalonia', level)
    await selectClass(wrapper, cls)
    await clickSubclass(wrapper, first)
    await clickSubclass(wrapper, second)

    expect(store.character.subclass).toBe(second.id)
    expect(store.character.featuresTraits).toEqual(
      expect.arrayContaining(featureNamesAtOrBelow(second, level)),
    )
    // Features unique to the abandoned subclass are gone
    const secondNames = new Set(second.features.map(f => f.name))
    for (const dropped of featureNamesAtOrBelow(first, level).filter(n => !secondNames.has(n))) {
      expect(store.character.featuresTraits).not.toContain(dropped)
    }
  })

  it('clears the subclass and its features when another class is chosen', async () => {
    const cls = classWithSubclasses('brancalonia', 1)
    const sub = cls.subclasses[0]!
    const other = getClasses('brancalonia').find(c => c.id !== cls.id)!

    const { store, wrapper } = mountStep('brancalonia', cls.subclassLevel)
    await selectClass(wrapper, cls)
    await clickSubclass(wrapper, sub)
    await selectClass(wrapper, other)

    expect(store.character.className).toBe(other.id)
    expect(store.character.subclass).toBe('')
    for (const name of featureNamesAtOrBelow(sub, cls.subclassLevel)) {
      expect(store.character.featuresTraits).not.toContain(name)
    }
  })

  it('restores the chosen subclass when the step is re-mounted', async () => {
    const cls = classWithSubclasses('brancalonia', 1)
    const sub = cls.subclasses[0]!

    const { store, wrapper } = mountStep('brancalonia', cls.subclassLevel)
    await selectClass(wrapper, cls)
    await clickSubclass(wrapper, sub)
    wrapper.unmount()

    const again = mount(Step3Class, { global: { plugins: [i18n] } })
    const checked = subclassButtons(again).filter(b => b.attributes('aria-checked') === 'true')
    expect(checked).toHaveLength(1)
    expect(checked[0]!.text()).toBe(sub.name)
    expect(store.character.subclass).toBe(sub.id)
  })

  it('offers a subclass for a multiclass entry that reached its own level', async () => {
    // Multiclass is D&D 5e only
    const primary = classWithSubclasses('dnd5e', 1)
    const secondary = getClasses('dnd5e')
      .find(c => c.id !== primary.id && c.subclasses.length >= 1)!
    const secondarySub = secondary.subclasses[0]!

    const { store, wrapper } = mountStep('dnd5e', primary.subclassLevel)
    await selectClass(wrapper, primary)

    store.addMulticlass(secondary.id)
    await wrapper.vm.$nextTick()
    // The secondary class is only level 1 — its subclass is not available yet
    expect(wrapper.text()).not.toContain(secondarySub.name)

    for (let lv = 1; lv < secondary.subclassLevel; lv++) store.levelUp(secondary.id)
    await wrapper.vm.$nextTick()

    const btn = wrapper.findAll('[role="radio"]').find(b => b.text() === secondarySub.name)
    expect(btn, `subclass button "${secondarySub.name}" should exist`).toBeTruthy()
    await btn!.trigger('click')

    const entry = store.character.classes.find(c => c.classId === secondary.id)
    expect(entry?.subclass).toBe(secondarySub.id)
    // The primary class keeps its own (still unset) subclass
    expect(store.character.subclass).toBe('')
    expect(store.character.featuresTraits).toEqual(
      expect.arrayContaining(featureNamesAtOrBelow(secondarySub, secondary.subclassLevel)),
    )
  })
})

describe('Step3Class — competenze e riallineamento', () => {
  beforeAll(async () => {
    await preloadVariantData('dnd5e')
    await preloadVariantData('brancalonia')
  })
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  /** Prima classe della variante che offre almeno `count` competenze a scelta */
  function classWithSkillChoices(variant: GameVariant, count = 1): CharacterClass {
    const cls = getClasses(variant).find(c => c.skillChoices.length >= count && c.numSkillChoices >= 1)
    if (!cls) throw new Error(`no ${variant} class offering ${count}+ skill choices`)
    return cls
  }

  /** Una competenza qualsiasi che la classe indicata NON può concedere */
  function skillOutside(cls: CharacterClass): string {
    const skill = SKILLS.map(s => s.id).find(id => !cls.skillChoices.includes(id))
    if (!skill) throw new Error(`class ${cls.id} can grant every skill`)
    return skill
  }

  it('non cancella le competenze degli altri passi quando se ne sceglie una di classe', async () => {
    const cls = classWithSkillChoices('brancalonia')
    const fromBackground = skillOutside(cls)

    const { store, wrapper } = mountStep('brancalonia', 1)
    store.character.skillProficiencies = [fromBackground]
    await selectClass(wrapper, cls)
    await skillButtons(wrapper)[0]!.trigger('click')

    expect(store.character.skillProficiencies).toContain(fromBackground)
    expect(store.character.skillProficiencies).toContain(cls.skillChoices[0])
  })

  it('togliendo una competenza di classe non porta via quelle degli altri passi', async () => {
    const cls = classWithSkillChoices('brancalonia')
    const fromBackground = skillOutside(cls)

    const { store, wrapper } = mountStep('brancalonia', 1)
    store.character.skillProficiencies = [fromBackground]
    await selectClass(wrapper, cls)
    await skillButtons(wrapper)[0]!.trigger('click')
    await skillButtons(wrapper)[0]!.trigger('click')

    expect(store.character.skillProficiencies).toEqual([fromBackground])
  })

  it('toglie le competenze scelte per la classe precedente quando la classe cambia', async () => {
    const first = classWithSkillChoices('brancalonia')
    const chosen = first.skillChoices[0]!
    const other = getClasses('brancalonia')
      .find(c => c.id !== first.id && !c.skillChoices.includes(chosen))
    expect(other, 'serve una seconda classe che non offra la stessa competenza').toBeTruthy()

    const { store, wrapper } = mountStep('brancalonia', 1)
    await selectClass(wrapper, first)
    await skillButtons(wrapper)[0]!.trigger('click')
    expect(store.character.skillProficiencies).toContain(chosen)

    await selectClass(wrapper, other!)
    expect(store.character.skillProficiencies).not.toContain(chosen)
  })

  // `<KeepAlive>` in BuilderView non rimonta il passo: il riallineamento va
  // provato sul percorso che sostituisce il personaggio sotto un componente
  // già vivo, cioè il caricamento di una scheda salvata.
  it('si riallinea alla scheda caricata senza essere rimontato', async () => {
    const cls = classWithSubclasses('brancalonia', 1)
    const sub = cls.subclasses[0]!
    const chosen = cls.skillChoices[0]!

    const { store, wrapper } = mountStep('brancalonia', cls.subclassLevel)
    await selectClass(wrapper, cls)
    await clickSubclass(wrapper, sub)
    await skillButtons(wrapper)[0]!.trigger('click')
    store.saveCharacter()
    const savedId = store.character.id

    // L'utente ricomincia da capo e poi ripesca la scheda salvata
    store.resetCharacter()
    await wrapper.vm.$nextTick()
    store.loadCharacter(savedId)
    await wrapper.vm.$nextTick()

    const checked = subclassButtons(wrapper).filter(b => b.attributes('aria-checked') === 'true')
    expect(checked.map(b => b.text())).toEqual([sub.name])
    expect(skillButtons(wrapper)[0]!.attributes('aria-pressed')).toBe('true')

    // E la selezione ripristinata è davvero quella del personaggio: toglierla
    // lo lascia senza, invece di lasciarla appiccicata all'elenco.
    await skillButtons(wrapper)[0]!.trigger('click')
    expect(store.character.skillProficiencies).not.toContain(chosen)
  })
})

describe('Step3Class — competenze raddoppiate (Expertise)', () => {
  beforeAll(async () => {
    await preloadVariantData('dnd5e')
    await preloadVariantData('dnd2024')
  })
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  /** Il gruppo dei chip delle competenze raddoppiate (vuoto se il passo non lo mostra) */
  function expertiseGroup(wrapper: Wrapper) {
    return wrapper.find('[aria-labelledby="class-expertise-heading"]')
  }

  function expertiseButtons(wrapper: Wrapper) {
    const group = expertiseGroup(wrapper)
    return group.exists() ? group.findAll('button') : []
  }

  async function clickExpertise(wrapper: Wrapper, skillId: string) {
    const btn = expertiseButtons(wrapper).find(b => b.text() === skillDisplay(skillId))
    expect(btn, `chip expertise "${skillId}" should exist`).toBeTruthy()
    await btn!.trigger('click')
  }

  /** Con locale 'en' e dizionario vuoto i chip mostrano il nome inglese dell'abilità */
  function skillDisplay(skillId: string): string {
    return SKILLS.find(s => s.id === skillId)?.name ?? skillId
  }

  /** Sceglie le prime `n` competenze di classe, che diventano le opzioni raddoppiabili */
  async function pickClassSkills(wrapper: Wrapper, n: number) {
    const buttons = skillButtons(wrapper)
    for (let i = 0; i < n; i++) await buttons[i]!.trigger('click')
  }

  it('non mostra il selettore alle classi che non raddoppiano nulla', async () => {
    const fighter = getClasses('dnd5e').find(c => c.id === 'fighter')!
    const { wrapper } = mountStep('dnd5e', 20)
    await selectClass(wrapper, fighter)
    await pickClassSkills(wrapper, fighter.numSkillChoices)

    expect(expertiseGroup(wrapper).exists()).toBe(false)
  })

  it('non lo mostra al bardo prima del livello del privilegio', async () => {
    const bard = getClasses('dnd5e').find(c => c.id === 'bard')!
    const { wrapper } = mountStep('dnd5e', 2)
    await selectClass(wrapper, bard)
    await pickClassSkills(wrapper, bard.numSkillChoices)

    expect(expertiseGroup(wrapper).exists()).toBe(false)
  })

  it('lo mostra al bardo dal 3° livello, con le sole competenze che possiede', async () => {
    const bard = getClasses('dnd5e').find(c => c.id === 'bard')!
    const { store, wrapper } = mountStep('dnd5e', 3)
    await selectClass(wrapper, bard)
    await pickClassSkills(wrapper, 2)

    const scelte = store.character.skillProficiencies
    expect(scelte).toHaveLength(2)
    expect(expertiseButtons(wrapper).map(b => b.text()).sort())
      .toEqual(scelte.map(skillDisplay).sort())
  })

  it('scrive la scelta in skillExpertise — il difetto: nessun componente lo faceva', async () => {
    const rogue = getClasses('dnd5e').find(c => c.id === 'rogue')!
    const { store, wrapper } = mountStep('dnd5e', 1)
    await selectClass(wrapper, rogue)
    await pickClassSkills(wrapper, rogue.numSkillChoices)

    const primo = store.character.skillProficiencies[0]!
    await clickExpertise(wrapper, primo)

    expect(store.character.skillExpertise).toEqual([primo])
  })

  it('non supera il numero concesso, e al 6° livello il ladro ne raddoppia 4', async () => {
    const rogue = getClasses('dnd5e').find(c => c.id === 'rogue')!

    const primoLivello = mountStep('dnd5e', 1)
    await selectClass(primoLivello.wrapper, rogue)
    await pickClassSkills(primoLivello.wrapper, rogue.numSkillChoices)
    const scelte = [...primoLivello.store.character.skillProficiencies]
    expect(scelte.length).toBeGreaterThan(2)

    for (const skill of scelte) await clickExpertise(primoLivello.wrapper, skill)
    expect(primoLivello.store.character.skillExpertise).toHaveLength(2)

    // Il chip in eccesso resta tabulabile: si segnala con aria-disabled, non
    // con l'attributo nativo, come gli altri chip di questo passo.
    const escluso = expertiseButtons(primoLivello.wrapper)
      .find(b => b.attributes('aria-pressed') === 'false')!
    expect(escluso.attributes('aria-disabled')).toBe('true')
    expect(escluso.attributes('disabled')).toBeUndefined()

    setActivePinia(createPinia())
    const sesto = mountStep('dnd5e', 6)
    await selectClass(sesto.wrapper, rogue)
    await pickClassSkills(sesto.wrapper, rogue.numSkillChoices)
    for (const skill of [...sesto.store.character.skillProficiencies]) {
      await clickExpertise(sesto.wrapper, skill)
    }
    expect(sesto.store.character.skillExpertise).toHaveLength(4)
  })

  it('nel 2024 il bardo raddoppia già dal 2° livello', async () => {
    const bard = getClasses('dnd2024').find(c => c.id === 'bard')!
    const { store, wrapper } = mountStep('dnd2024', 2)
    await selectClass(wrapper, bard)
    await pickClassSkills(wrapper, 2)

    const primo = store.character.skillProficiencies[0]!
    await clickExpertise(wrapper, primo)
    expect(store.character.skillExpertise).toEqual([primo])
  })

  it('toglie la competenza raddoppiata se si rinuncia a quella di base', async () => {
    const rogue = getClasses('dnd5e').find(c => c.id === 'rogue')!
    const { store, wrapper } = mountStep('dnd5e', 1)
    await selectClass(wrapper, rogue)
    await pickClassSkills(wrapper, rogue.numSkillChoices)

    const primo = store.character.skillProficiencies[0]!
    await clickExpertise(wrapper, primo)
    expect(store.character.skillExpertise).toContain(primo)

    // Deseleziona la competenza di base: raddoppiare un bonus che non c'è più
    // gonfiava la scheda di un bonus inventato.
    await skillButtons(wrapper)[0]!.trigger('click')
    expect(store.character.skillProficiencies).not.toContain(primo)
    expect(store.character.skillExpertise).not.toContain(primo)
  })

  it('cambiando classe non lascia la competenza raddoppiata alla classe nuova', async () => {
    const rogue = getClasses('dnd5e').find(c => c.id === 'rogue')!
    const fighter = getClasses('dnd5e').find(c => c.id === 'fighter')!

    const { store, wrapper } = mountStep('dnd5e', 1)
    await selectClass(wrapper, rogue)
    await pickClassSkills(wrapper, rogue.numSkillChoices)
    await clickExpertise(wrapper, store.character.skillProficiencies[0]!)
    expect(store.character.skillExpertise).toHaveLength(1)

    await selectClass(wrapper, fighter)
    expect(store.character.skillExpertise).toEqual([])
  })

  it('ripristina la scelta quando il passo viene rimontato', async () => {
    const rogue = getClasses('dnd5e').find(c => c.id === 'rogue')!
    const { store, wrapper } = mountStep('dnd5e', 1)
    await selectClass(wrapper, rogue)
    await pickClassSkills(wrapper, rogue.numSkillChoices)
    const scelto = store.character.skillProficiencies[0]!
    await clickExpertise(wrapper, scelto)
    wrapper.unmount()

    const again = mount(Step3Class, { global: { plugins: [i18n] } })
    const premuti = expertiseButtons(again)
      .filter(b => b.attributes('aria-pressed') === 'true')
      .map(b => b.text())
    expect(premuti).toEqual([skillDisplay(scelto)])
  })
})
