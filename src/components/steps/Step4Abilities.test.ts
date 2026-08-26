import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { setActivePinia, createPinia } from 'pinia'
import { useCharacterStore } from '@/stores/character'
import type { AbilityScores } from '@/stores/character'
import { preloadVariantData } from '@/data'
import Step4Abilities from './Step4Abilities.vue'

// Con locale 'en' e messaggi vuoti ogni chiave manca e viene resa com'è:
// i pulsanti del metodo leggono "abilities.standardArray", "abilities.pointBuy",
// "abilities.roll".
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
  const wrapper = mount(Step4Abilities, { global: { plugins: [i18n] } })
  return { store, wrapper }
}

/** Pulsanti del selettore di metodo, nell'ordine standard / point buy / tiro */
function methodButtons(wrapper: ReturnType<typeof mountStep>['wrapper']) {
  return wrapper.find('[aria-label="abilities.method"]').findAll('button')
}

describe('passo Caratteristiche — il point buy non azzera la scheda', () => {
  beforeAll(async () => {
    await preloadVariantData('dnd5e')
  })
  beforeEach(() => setActivePinia(createPinia()))

  const rolled: AbilityScores = { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 }

  it('lascia intatti i punteggi già in scheda quando si passa al point buy', async () => {
    const { store, wrapper } = mountStep()
    store.character.abilityScores = { ...rolled }
    // Il componente è già montato: l'utente ha compilato la scheda altrove e
    // ora tocca il selettore di metodo. Il montaggio ha già letto i punteggi,
    // quindi rimontiamo per simulare l'ingresso nel passo con la scheda piena.
    wrapper.unmount()
    const again = mount(Step4Abilities, { global: { plugins: [i18n] } })

    await methodButtons(again)[1]!.trigger('click')

    expect(store.character.abilityScores).toEqual(rolled)
  })

  it('riallinea i contatori alla scheda caricata senza essere rimontato', async () => {
    const { store, wrapper } = mountStep()
    store.character.abilityScores = { ...rolled }
    store.saveCharacter()
    const savedId = store.character.id

    // `<KeepAlive>` in BuilderView tiene vivo il passo: il personaggio cambia
    // sotto di lui quando si ricomincia da capo e si ripesca una scheda.
    store.resetCharacter()
    await wrapper.vm.$nextTick()
    store.loadCharacter(savedId)
    await wrapper.vm.$nextTick()

    await methodButtons(wrapper)[1]!.trigger('click')

    expect(store.character.abilityScores).toEqual(rolled)
  })

  it('riporta nella forbice 8-15 i punteggi nati da un tiro di dadi', async () => {
    const { store, wrapper } = mountStep()
    // 17 e 7 stanno fuori dai costi tabellati del point buy: senza il taglio
    // il pannello mostrerebbe un costo indefinito.
    store.character.abilityScores = { str: 17, dex: 16, con: 13, int: 12, wis: 10, cha: 7 }
    store.saveCharacter()
    const savedId = store.character.id
    store.resetCharacter()
    await wrapper.vm.$nextTick()
    store.loadCharacter(savedId)
    await wrapper.vm.$nextTick()

    await methodButtons(wrapper)[1]!.trigger('click')

    expect(store.character.abilityScores).toEqual({
      str: 15, dex: 15, con: 13, int: 12, wis: 10, cha: 8,
    })
  })
})

// Nel 2024 la specie non dà punteggi: il bonus arriva dal background. Chiamarlo
// "Bonus Razziale" diceva al giocatore una cosa falsa sulla sua stessa scheda.
describe('passo Caratteristiche — da dove viene il bonus', () => {
  beforeAll(async () => {
    await preloadVariantData('dnd5e')
    await preloadVariantData('dnd2024')
  })
  beforeEach(() => setActivePinia(createPinia()))

  it('nel 2024 il bonus è attribuito al background', async () => {
    const { store, wrapper } = mountStep()
    store.character.variant = 'dnd2024'
    store.character.racialBonuses = { int: 2, con: 1 }
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('abilities.backgroundBonus')
    expect(wrapper.text()).not.toContain('abilities.racialBonus')
  })

  it('nel 2014 resta il bonus di specie', async () => {
    const { store, wrapper } = mountStep()
    store.character.variant = 'dnd5e'
    store.character.racialBonuses = { str: 2 }
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('abilities.racialBonus')
    expect(wrapper.text()).not.toContain('abilities.backgroundBonus')
  })
})


/**
 * Il metodo "a mano" esiste per ricopiare una scheda che c'è già: i punteggi
 * si scrivono, non si generano. Prima l'unico modo di ottenere un 17 era
 * tirarlo, e chi trascriveva una scheda restava fermo.
 */
describe('passo Caratteristiche — punteggi scritti a mano', () => {
  beforeAll(async () => {
    await preloadVariantData('dnd5e')
  })
  beforeEach(() => setActivePinia(createPinia()))

  /** I sei campi numerici del metodo a mano, nell'ordine FOR DES COS INT SAG CAR. */
  function manualInputs(wrapper: ReturnType<typeof mountStep>['wrapper']) {
    return wrapper.findAll('input[id^="manual-"]')
  }

  it('offre un quarto metodo accanto ad array, acquisto e tiro', () => {
    const { wrapper } = mountStep()
    const buttons = methodButtons(wrapper)
    expect(buttons).toHaveLength(4)
    expect(buttons[3]!.text()).toContain('abilities.manualEntry')
  })

  it('scriverli li porta in scheda uno per uno', async () => {
    const { store, wrapper } = mountStep()
    await methodButtons(wrapper)[3]!.trigger('click')

    const inputs = manualInputs(wrapper)
    expect(inputs).toHaveLength(6)

    const scheda = [17, 15, 14, 12, 10, 8]
    for (let i = 0; i < inputs.length; i++) {
      await inputs[i]!.setValue(String(scheda[i]))
    }

    expect(store.character.abilityScores).toEqual({
      str: 17, dex: 15, con: 14, int: 12, wis: 10, cha: 8,
    })
  })

  it('non richiede nessun tiro di dadi', async () => {
    const { wrapper } = mountStep()
    await methodButtons(wrapper)[3]!.trigger('click')
    expect(wrapper.text()).not.toContain('abilities.rollDice')
  })

  it('sceglierlo non azzera i punteggi già in scheda', async () => {
    const { store, wrapper } = mountStep()
    store.character.abilityScores = { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 }
    await methodButtons(wrapper)[3]!.trigger('click')
    expect(store.character.abilityScores).toEqual({
      str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8,
    })
  })

  it('taglia a 1-30 quello che il campo numerico lascia passare', async () => {
    const { store, wrapper } = mountStep()
    await methodButtons(wrapper)[3]!.trigger('click')
    const inputs = manualInputs(wrapper)

    await inputs[0]!.setValue('200')
    expect(store.character.abilityScores.str).toBe(30)

    await inputs[1]!.setValue('-4')
    expect(store.character.abilityScores.dex).toBe(1)
  })

  it('un campo svuotato lascia in scheda l\'ultimo valore buono', async () => {
    // Cancellando la cifra per riscriverla il campo passa '' un istante: uno
    // zero scritto in scheda a metà digitazione sarebbe un punteggio illegale.
    const { store, wrapper } = mountStep()
    store.character.abilityScores.str = 16
    await methodButtons(wrapper)[3]!.trigger('click')

    await manualInputs(wrapper)[0]!.setValue('')

    expect(store.character.abilityScores.str).toBe(16)
  })
})
