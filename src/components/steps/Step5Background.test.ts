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
    await preloadVariantData('dnd5e')
  })
  beforeEach(() => setActivePinia(createPinia()))

  function mountFor(variant: 'apocalisse' | 'dnd5e') {
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

describe('passo Background — competenze e riallineamento', () => {
  beforeAll(async () => {
    await preloadVariantData('dnd5e')
  })
  beforeEach(() => setActivePinia(createPinia()))

  function mountFor(variant: 'dnd5e') {
    const store = useCharacterStore()
    store.character.variant = variant
    return { store, wrapper: mount(Step5Background, { global: { plugins: [i18n] } }) }
  }

  function cards(wrapper: ReturnType<typeof mountFor>['wrapper']) {
    return wrapper.find('[role="radiogroup"]').findAll('button')
  }

  const sorted = (xs: readonly string[]) => [...xs].sort()

  it('non accumula le competenze di ogni background provato', async () => {
    const bgs = getBackgrounds('dnd5e')
    const { store, wrapper } = mountFor('dnd5e')
    // Una competenza arrivata dalla classe: non è del background e deve restare
    store.character.skillProficiencies = ['acrobatics']
    await wrapper.vm.$nextTick()

    await cards(wrapper)[0]!.trigger('click')
    await cards(wrapper)[1]!.trigger('click')
    await cards(wrapper)[2]!.trigger('click')

    expect(sorted(store.character.skillProficiencies))
      .toEqual(sorted(['acrobatics', ...bgs[2]!.skillProficiencies]))
  })

  // `<KeepAlive>` in BuilderView non rimonta il passo: il difetto si vede
  // caricando una scheda salvata sotto un componente già vivo.
  it('si riallinea alla scheda caricata senza essere rimontato', async () => {
    const bgs = getBackgrounds('dnd5e')
    const { store, wrapper } = mountFor('dnd5e')
    await wrapper.vm.$nextTick()

    await cards(wrapper)[3]!.trigger('click')
    store.saveCharacter()
    const savedId = store.character.id

    // Un secondo personaggio con un background diverso, poi si torna al primo
    store.resetCharacter()
    await wrapper.vm.$nextTick()
    await cards(wrapper)[0]!.trigger('click')
    store.loadCharacter(savedId)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain(bgs[3]!.feature.name)
    expect(wrapper.text()).not.toContain(bgs[0]!.feature.name)

    // E il background ripristinato è davvero "suo": cambiandolo se ne va
    await cards(wrapper)[4]!.trigger('click')
    expect(sorted(store.character.skillProficiencies))
      .toEqual(sorted(bgs[4]!.skillProficiencies))
  })
})

// Nel 2024 la specie non dà punteggi: li dà il background, +2 a una e +1 a
// un'altra fra le tre che elenca, più un talento d'origine. Il generatore
// casuale lo applicava; la procedura guidata no, e il mago costruito a mano
// usciva con sei punteggi nudi.
describe('passo Background — bonus e talento d\'origine del 2024', () => {
  beforeAll(async () => {
    await preloadVariantData('dnd2024')
    await preloadVariantData('dnd5e')
  })
  beforeEach(() => setActivePinia(createPinia()))

  function mountFor(variant: 'dnd2024' | 'dnd5e') {
    const store = useCharacterStore()
    store.character.variant = variant
    return { store, wrapper: mount(Step5Background, { global: { plugins: [i18n] } }) }
  }

  function cards(wrapper: ReturnType<typeof mountFor>['wrapper']) {
    return wrapper.find('[role="radiogroup"]').findAll('button')
  }

  function abilitySelects(wrapper: ReturnType<typeof mountFor>['wrapper']) {
    return [
      wrapper.find('[aria-label="background.chooseMajorAbility"]'),
      wrapper.find('[aria-label="background.chooseMinorAbility"]'),
    ]
  }

  it('offre i due selettori solo per il 2024', async () => {
    const { wrapper } = mountFor('dnd2024')
    await wrapper.vm.$nextTick()
    await cards(wrapper)[0]!.trigger('click')

    const [major, minor] = abilitySelects(wrapper)
    expect(major!.exists()).toBe(true)
    expect(minor!.exists()).toBe(true)

    // Le tre caratteristiche del background, più la voce vuota
    const bg = getBackgrounds('dnd2024')[0]!
    const values = major!.findAll('option').map(o => o.element.value).filter(Boolean)
    expect(values).toEqual([...bg.abilityScoreOptions!])
  })

  it('nel 2014 il background non dà bonus e i selettori non compaiono', async () => {
    const { wrapper } = mountFor('dnd5e')
    await wrapper.vm.$nextTick()
    await cards(wrapper)[0]!.trigger('click')

    const [major, minor] = abilitySelects(wrapper)
    expect(major!.exists()).toBe(false)
    expect(minor!.exists()).toBe(false)
  })

  it('applica +2 e +1 alle caratteristiche scelte', async () => {
    const { store, wrapper } = mountFor('dnd2024')
    await wrapper.vm.$nextTick()
    const bg = getBackgrounds('dnd2024').find(b => b.id === 'sage')!
    const idx = getBackgrounds('dnd2024').indexOf(bg)
    await cards(wrapper)[idx]!.trigger('click')

    const [major, minor] = abilitySelects(wrapper)
    await major!.setValue('int')
    await minor!.setValue('con')

    expect(store.character.racialBonuses.int).toBe(2)
    expect(store.character.racialBonuses.con).toBe(1)
    expect(store.totalAbilityScore('int')).toBe(store.character.abilityScores.int + 2)
  })

  it('non ripropone nel +1 la caratteristica che ha già preso il +2', async () => {
    const { wrapper } = mountFor('dnd2024')
    await wrapper.vm.$nextTick()
    await cards(wrapper)[0]!.trigger('click')

    const [major, minor] = abilitySelects(wrapper)
    await major!.setValue(getBackgrounds('dnd2024')[0]!.abilityScoreOptions![0]!)
    const rimasti = minor!.findAll('option').map(o => o.element.value).filter(Boolean)
    expect(rimasti).not.toContain(getBackgrounds('dnd2024')[0]!.abilityScoreOptions![0]!)
  })

  it('cambiando background non accumula i bonus del precedente', async () => {
    const { store, wrapper } = mountFor('dnd2024')
    await wrapper.vm.$nextTick()
    const bgs = getBackgrounds('dnd2024')
    const sageIdx = bgs.findIndex(b => b.id === 'sage')
    await cards(wrapper)[sageIdx]!.trigger('click')
    const [major, minor] = abilitySelects(wrapper)
    await major!.setValue('int')
    await minor!.setValue('con')

    const criminalIdx = bgs.findIndex(b => b.id === 'criminal')
    await cards(wrapper)[criminalIdx]!.trigger('click')

    expect(store.character.racialBonuses).toEqual({})
  })

  it('concede il talento d\'origine del background', async () => {
    const { store, wrapper } = mountFor('dnd2024')
    await wrapper.vm.$nextTick()
    const bgs = getBackgrounds('dnd2024')
    await cards(wrapper)[bgs.findIndex(b => b.id === 'sage')]!.trigger('click')
    expect(store.character.feat).toBe('magic-initiate')

    await cards(wrapper)[bgs.findIndex(b => b.id === 'criminal')]!.trigger('click')
    expect(store.character.feat).toBe('alert')
  })

  it('non calpesta il talento scelto al passo Specie', async () => {
    const { store, wrapper } = mountFor('dnd2024')
    // L'umano 2024 sceglie un talento d'origine con Versatile: quella casella
    // è già sua, il background non deve riscriverla.
    store.character.feat = 'savage-attacker'
    await wrapper.vm.$nextTick()
    await cards(wrapper)[getBackgrounds('dnd2024').findIndex(b => b.id === 'sage')]!.trigger('click')
    expect(store.character.feat).toBe('savage-attacker')
  })

  it('ritrova la scelta quando si ricarica la scheda', async () => {
    const { store, wrapper } = mountFor('dnd2024')
    await wrapper.vm.$nextTick()
    const bgs = getBackgrounds('dnd2024')
    await cards(wrapper)[bgs.findIndex(b => b.id === 'sage')]!.trigger('click')
    const [major, minor] = abilitySelects(wrapper)
    await major!.setValue('int')
    await minor!.setValue('con')
    store.saveCharacter()
    const savedId = store.character.id

    store.resetCharacter()
    store.character.variant = 'dnd2024'
    await wrapper.vm.$nextTick()
    store.loadCharacter(savedId)
    await wrapper.vm.$nextTick()

    const [major2, minor2] = abilitySelects(wrapper)
    expect((major2!.element as HTMLSelectElement).value).toBe('int')
    expect((minor2!.element as HTMLSelectElement).value).toBe('con')

    // E cambiando background quei bonus se ne vanno, senza restare appiccicati
    await cards(wrapper)[bgs.findIndex(b => b.id === 'criminal')]!.trigger('click')
    expect(store.character.racialBonuses).toEqual({})
  })

  it('rimette i bonus se il passo Specie riscrive la mappa', async () => {
    const { store, wrapper } = mountFor('dnd2024')
    await wrapper.vm.$nextTick()
    const bgs = getBackgrounds('dnd2024')
    await cards(wrapper)[bgs.findIndex(b => b.id === 'sage')]!.trigger('click')
    const [major, minor] = abilitySelects(wrapper)
    await major!.setValue('int')
    await minor!.setValue('con')

    // È quello che fa Step2Race.applyRace tornando indietro a cambiare razza
    store.character.racialBonuses = {}
    await wrapper.vm.$nextTick()

    expect(store.character.racialBonuses).toEqual({ int: 2, con: 1 })

    // E restano togliibili una volta sola: cambiando background spariscono
    await cards(wrapper)[bgs.findIndex(b => b.id === 'criminal')]!.trigger('click')
    expect(store.character.racialBonuses).toEqual({})
  })
})
