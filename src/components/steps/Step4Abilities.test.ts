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
