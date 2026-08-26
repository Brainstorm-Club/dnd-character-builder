import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { setActivePinia, createPinia } from 'pinia'
import { useCharacterStore } from '@/stores/character'
import { preloadVariantData } from '@/data'
import { computeArmorClass } from '@/utils/calculations'
import ManualSheetValues from './ManualSheetValues.vue'

// Messaggi vuoti: ogni chiave manca e viene resa com'è, così le asserzioni
// sul testo leggono le chiavi ('manual.hpManualNotice') e non una traduzione.
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en: {} },
  missingWarn: false,
  fallbackWarn: false,
})

/** Guerriero di 5° con COS 13, PF calcolati dal generatore. */
function mountWithFighter(plugin = i18n) {
  const store = useCharacterStore()
  store.resetCharacter()
  store.character.variant = 'dnd5e'
  store.character.className = 'fighter'
  store.character.abilityScores = { str: 16, dex: 14, con: 13, int: 10, wis: 12, cha: 8 }
  store.character.level = 5
  store.syncClassAndLevel()
  const wrapper = mount(ManualSheetValues, { global: { plugins: [plugin] } })
  return { store, wrapper }
}

const field = (wrapper: ReturnType<typeof mountWithFighter>['wrapper'], id: string) =>
  wrapper.get(`#manual-${id}`)

describe('valori dalla scheda — punti ferita', () => {
  beforeAll(async () => {
    await preloadVariantData('dnd5e')
  })
  beforeEach(() => setActivePinia(createPinia()))

  it('scriverli li porta in scheda e li dichiara a mano', async () => {
    const { store, wrapper } = mountWithFighter()
    const calcolati = store.character.maxHp
    expect(store.character.hpManual).toBe(false)

    await field(wrapper, 'max-hp').setValue('47')

    expect(store.character.maxHp).toBe(47)
    expect(store.character.maxHp).not.toBe(calcolati)
    expect(store.character.hpManual).toBe(true)
  })

  it('sopravvivono a un ritorno sul livello', async () => {
    // Era il difetto che rendeva impossibile trascrivere una scheda: bastava
    // ritoccare il livello e il totale scritto a mano spariva.
    const { store, wrapper } = mountWithFighter()
    await field(wrapper, 'max-hp').setValue('47')

    store.character.level = 6
    store.syncClassAndLevel()

    expect(store.character.maxHp).toBe(47)
  })

  it('una scheda appena trascritta parte a PF pieni', async () => {
    const { store, wrapper } = mountWithFighter()
    store.character.currentHp = 0
    await field(wrapper, 'max-hp').setValue('47')
    expect(store.character.currentHp).toBe(47)
  })

  it('i PF attuali restano quelli scritti se stanno sotto il massimo', async () => {
    const { store, wrapper } = mountWithFighter()
    await field(wrapper, 'max-hp').setValue('47')
    await field(wrapper, 'current-hp').setValue('12')
    expect(store.character.currentHp).toBe(12)
    expect(store.character.maxHp).toBe(47)
  })

  it('i PF temporanei non dichiarano nulla: sono una condizione, non un dato di scheda', async () => {
    const { store, wrapper } = mountWithFighter()
    await field(wrapper, 'temp-hp').setValue('5')
    expect(store.character.tempHp).toBe(5)
    expect(store.character.hpManual).toBe(false)
  })

  it('il pulsante di ricalcolo li riporta al dado vita', async () => {
    const { store, wrapper } = mountWithFighter()
    const calcolati = store.character.maxHp
    await field(wrapper, 'max-hp').setValue('47')

    expect(wrapper.text()).toContain('manual.hpManualNotice')
    const recompute = wrapper.findAll('button').find(b => b.text().includes('manual.recomputeHp'))
    expect(recompute).toBeDefined()
    await recompute!.trigger('click')

    expect(store.character.hpManual).toBe(false)
    expect(store.character.maxHp).toBe(calcolati)
    expect(wrapper.text()).not.toContain('manual.hpManualNotice')
  })

  it('un campo svuotato lascia in scheda l\'ultimo valore buono', async () => {
    const { store, wrapper } = mountWithFighter()
    await field(wrapper, 'max-hp').setValue('47')
    await field(wrapper, 'max-hp').setValue('')
    expect(store.character.maxHp).toBe(47)
  })

  it('taglia i valori fuori scala', async () => {
    const { store, wrapper } = mountWithFighter()
    await field(wrapper, 'max-hp').setValue('0')
    expect(store.character.maxHp).toBe(1)
    await field(wrapper, 'max-hp').setValue('99999')
    expect(store.character.maxHp).toBe(999)
  })
})

describe('valori dalla scheda — CA, velocità, esperienza', () => {
  beforeAll(async () => {
    await preloadVariantData('dnd5e')
  })
  beforeEach(() => setActivePinia(createPinia()))

  it('la CA scritta a mano vince su quella dell\'equipaggiamento', async () => {
    const { store, wrapper } = mountWithFighter()
    store.character.armor = 'Chain Mail' // CA 16
    expect(computeArmorClass(store.character)).toBe(16)

    await field(wrapper, 'ac').setValue('19')

    expect(store.character.armorClassOverride).toBe(19)
    expect(computeArmorClass(store.character)).toBe(19)
    expect(store.armorClass).toBe(19)
  })

  it('riportandola a 0 torna quella calcolata', async () => {
    const { store, wrapper } = mountWithFighter()
    store.character.armor = 'Chain Mail'
    await field(wrapper, 'ac').setValue('19')
    await field(wrapper, 'ac').setValue('0')
    expect(computeArmorClass(store.character)).toBe(16)
  })

  it('mostra la CA che si avrebbe senza il valore a mano', async () => {
    // Qui serve il segnaposto davvero interpolato: con i messaggi vuoti la
    // chiave verrebbe resa grezza e il numero non comparirebbe mai, così il
    // controllo passerebbe (o fallirebbe) senza dire nulla sul componente.
    const conTesto = createI18n({
      legacy: false, locale: 'en', fallbackLocale: 'en',
      messages: { en: { manual: { acHint: 'calcolata: {ac}' } } },
      missingWarn: false, fallbackWarn: false,
    })
    const { store, wrapper } = mountWithFighter(conTesto)
    store.character.armor = 'Chain Mail' // calcolata: 16
    await field(wrapper, 'ac').setValue('19')

    // Il suggerimento resta ancorato al calcolo, non al numero appena scritto
    expect(wrapper.text()).toContain('calcolata: 16')
    expect(wrapper.text()).not.toContain('calcolata: 19')
  })

  it('velocità ed esperienza si scrivono e si tagliano', async () => {
    const { store, wrapper } = mountWithFighter()
    await field(wrapper, 'speed').setValue('25')
    expect(store.character.speed).toBe(25)
    await field(wrapper, 'speed').setValue('900')
    expect(store.character.speed).toBe(200)

    await field(wrapper, 'xp').setValue('6500')
    expect(store.character.experiencePoints).toBe(6500)
    await field(wrapper, 'xp').setValue('-1')
    expect(store.character.experiencePoints).toBe(0)
  })
})

describe('valori dalla scheda — competenze', () => {
  beforeAll(async () => {
    await preloadVariantData('dnd5e')
  })
  beforeEach(() => setActivePinia(createPinia()))

  /** Pastiglia di competenza con quell'etichetta, fra tiri salvezza e abilità. */
  function chip(wrapper: ReturnType<typeof mountWithFighter>['wrapper'], label: string) {
    return wrapper.findAll('button').find(b => b.text() === label)
  }

  it('aggiunge e toglie un tiro salvezza', async () => {
    const { store, wrapper } = mountWithFighter()
    store.character.savingThrowProficiencies = []
    await wrapper.vm.$nextTick()

    await chip(wrapper, 'abilities.wis')!.trigger('click')
    expect(store.character.savingThrowProficiencies).toContain('wis')

    await chip(wrapper, 'abilities.wis')!.trigger('click')
    expect(store.character.savingThrowProficiencies).not.toContain('wis')
  })

  it('aggiunge un\'abilità che classe e background non concedono', async () => {
    const { store, wrapper } = mountWithFighter()
    store.character.skillProficiencies = ['athletics']
    await wrapper.vm.$nextTick()

    // Con locale 'en' i termini di gioco restano i nomi inglesi
    await chip(wrapper, 'Stealth')!.trigger('click')

    expect(store.character.skillProficiencies).toEqual(['athletics', 'stealth'])
  })

  it('toglie un\'abilità già concessa', async () => {
    const { store, wrapper } = mountWithFighter()
    store.character.skillProficiencies = ['athletics', 'perception']
    await wrapper.vm.$nextTick()

    await chip(wrapper, 'Perception')!.trigger('click')

    expect(store.character.skillProficiencies).toEqual(['athletics'])
  })

  it('offre tutte e diciotto le abilità', () => {
    const { wrapper } = mountWithFighter()
    const group = wrapper.get('[aria-label="review.skills"]')
    expect(group.findAll('button')).toHaveLength(18)
  })
})
