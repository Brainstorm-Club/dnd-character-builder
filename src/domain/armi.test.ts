import { describe, it, expect, beforeAll } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { setActivePinia, createPinia } from 'pinia'
import { useCharacterStore } from '@/stores/character'
import { preloadVariantData } from '@/data'
import Step6Equipment from '@/components/steps/Step6Equipment.vue'
import {
  isADistanza,
  isAccurata,
  caratteristicaAttacco,
  modificatoreAttacco,
  formattaDanno,
  calcolaAttacco,
  attaccoPerNome,
  ricalcolaArmi,
  type ArmaBase,
} from './armi'
import { simpleWeapons, martialWeapons } from '@/data/dnd5e/equipment'

const CATALOGO = [...simpleWeapons, ...martialWeapons]

const spadone: ArmaBase = { name: 'Greatsword', damage: '2d6', properties: ['heavy', 'two-handed'] }
const stocco: ArmaBase = { name: 'Rapier', damage: '1d8', properties: ['finesse'] }
const arco: ArmaBase = { name: 'Longbow', damage: '1d8', properties: ['ammunition (150/600)', 'heavy', 'two-handed'] }
const pugnale: ArmaBase = { name: 'Dagger', damage: '1d4', properties: ['finesse', 'light', 'thrown (20/60)'] }
const giavellotto: ArmaBase = { name: 'Javelin', damage: '1d6', properties: ['thrown (30/120)'] }

describe('riconoscimento delle proprietà', () => {
  it('è a distanza solo chi consuma munizioni', () => {
    expect(isADistanza(arco.properties)).toBe(true)
    expect(isADistanza(spadone.properties)).toBe(false)
    // Il lancio non è distanza: il giavellotto tira con la Forza come in mischia.
    expect(isADistanza(giavellotto.properties)).toBe(false)
    expect(isADistanza(pugnale.properties)).toBe(false)
  })

  it('legge la proprietà accurata senza farsi ingannare da maiuscole e spazi', () => {
    expect(isAccurata(stocco.properties)).toBe(true)
    expect(isAccurata([' Finesse '])).toBe(true)
    expect(isAccurata(spadone.properties)).toBe(false)
  })
})

describe('quale caratteristica tira', () => {
  it('a distanza sempre Destrezza, anche a un bruto con Forza altissima', () => {
    expect(caratteristicaAttacco(arco.properties, 5, 0)).toBe('dex')
    expect(modificatoreAttacco(arco.properties, 5, 0)).toBe(0)
  })

  it('senza proprietà utili sempre Forza, anche a un mingherlino agile', () => {
    expect(caratteristicaAttacco(spadone.properties, 0, 4)).toBe('str')
    expect(modificatoreAttacco(spadone.properties, 0, 4)).toBe(0)
  })

  /**
   * Il difetto che questo test chiude: il generatore, per le classi da
   * Destrezza, metteva la Destrezza secca su ogni arma accurata. Il manuale
   * dice che PUOI usare la Destrezza al posto della Forza, quindi il ladro con
   * la Forza migliore tira con la Forza e non ci rimette dei punti.
   */
  it("l'arma accurata prende la migliore fra Forza e Destrezza", () => {
    expect(caratteristicaAttacco(stocco.properties, 4, 1)).toBe('str')
    expect(modificatoreAttacco(stocco.properties, 4, 1)).toBe(4)
    expect(caratteristicaAttacco(stocco.properties, 1, 4)).toBe('dex')
    expect(modificatoreAttacco(stocco.properties, 1, 4)).toBe(4)
    // A parità la scelta non cambia il numero: conta solo che sia stabile.
    expect(modificatoreAttacco(stocco.properties, 3, 3)).toBe(3)
  })

  it('vale anche per il pugnale, accurata e da lancio insieme', () => {
    expect(modificatoreAttacco(pugnale.properties, 4, 2)).toBe(4)
    expect(modificatoreAttacco(pugnale.properties, 2, 4)).toBe(4)
  })
})

describe('la stringa del danno', () => {
  it('porta il modificatore, che è quel che il giocatore tira al tavolo', () => {
    expect(formattaDanno('1d8', 3)).toBe('1d8+3')
  })

  it('con modificatore negativo scrive il meno', () => {
    expect(formattaDanno('1d8', -1)).toBe('1d8-1')
  })

  it("con modificatore zero resta il dado nudo, perché un '+0' è solo rumore", () => {
    expect(formattaDanno('1d8', 0)).toBe('1d8')
  })

  it('un danno vuoto resta vuoto', () => {
    expect(formattaDanno('', 3)).toBe('')
  })
})

describe('calcolo completo', () => {
  it('somma competenza e caratteristica', () => {
    expect(calcolaAttacco(spadone, { strMod: 3, dexMod: 1, proficiencyBonus: 2 }))
      .toEqual({ name: 'Greatsword', attackBonus: 5, damage: '2d6+3' })
  })

  it("l'arco usa la Destrezza per il tiro e per il danno", () => {
    expect(calcolaAttacco(arco, { strMod: 4, dexMod: 2, proficiencyBonus: 3 }))
      .toEqual({ name: 'Longbow', attackBonus: 5, damage: '1d8+2' })
  })

  it('lo stocco in mano forzuta usa la Forza', () => {
    expect(calcolaAttacco(stocco, { strMod: 4, dexMod: 1, proficiencyBonus: 2 }))
      .toEqual({ name: 'Rapier', attackBonus: 6, damage: '1d8+4' })
  })

  it('un modificatore negativo abbassa il bonus, non lo azzera', () => {
    expect(calcolaAttacco(spadone, { strMod: -1, dexMod: 0, proficiencyBonus: 2 }))
      .toEqual({ name: 'Greatsword', attackBonus: 1, damage: '2d6-1' })
  })
})

describe('ricerca per nome nel catalogo', () => {
  it('trova le proprietà vere dell\'arma scelta', () => {
    const a = attaccoPerNome('Rapier', CATALOGO, { strMod: 4, dexMod: 1, proficiencyBonus: 2 })
    expect(a).toEqual({ name: 'Rapier', attackBonus: 6, damage: '1d8+4' })
  })

  /**
   * Un nome fuori catalogo non deve far saltare il conto: prima il passo
   * Equipaggiamento leggeva `undefined` e cadeva sulla Forza, e va bene così,
   * purché non produca un `NaN` sul PDF.
   */
  it("un nome che nel catalogo non c'è vale come arma senza proprietà", () => {
    const a = attaccoPerNome('Spadone del Nonno', CATALOGO, { strMod: 2, dexMod: 3, proficiencyBonus: 2 })
    expect(a).toEqual({ name: 'Spadone del Nonno', attackBonus: 4, damage: '' })
  })
})

describe('ricalcolo delle armi già in scheda', () => {
  /**
   * Il difetto: bonus e danno stanno memorizzati dentro l'arma, e salendo di
   * livello nessuno li rifaceva. Il ladro di 4° passato al 5° teneva il +5 del
   * bonus di competenza vecchio, e quel numero finiva stampato sulla scheda.
   */
  it('aggiorna il bonus quando sale la competenza', () => {
    const prima = ricalcolaArmi(
      [{ name: 'Rapier', attackBonus: 0, damage: '' }],
      CATALOGO,
      { strMod: 0, dexMod: 3, proficiencyBonus: 2 },
    )
    expect(prima[0]).toEqual({ name: 'Rapier', attackBonus: 5, damage: '1d8+3' })

    const dopo = ricalcolaArmi(prima, CATALOGO, { strMod: 0, dexMod: 3, proficiencyBonus: 3 })
    expect(dopo[0]).toEqual({ name: 'Rapier', attackBonus: 6, damage: '1d8+3' })
  })

  it('non raddoppia il modificatore già scritto nel danno', () => {
    const uno = ricalcolaArmi(
      [{ name: 'Greatsword', attackBonus: 5, damage: '2d6+3' }],
      CATALOGO,
      { strMod: 3, dexMod: 0, proficiencyBonus: 2 },
    )
    expect(uno[0]!.damage).toBe('2d6+3')
    const due = ricalcolaArmi(uno, CATALOGO, { strMod: 3, dexMod: 0, proficiencyBonus: 2 })
    expect(due[0]!.damage).toBe('2d6+3')
  })

  it("lascia intatta l'arma che nel catalogo non c'è, invece di svuotarne il danno", () => {
    const scritta = { name: 'Bastone Ferrato', attackBonus: 4, damage: '1d6+2' }
    const out = ricalcolaArmi([scritta], CATALOGO, { strMod: 0, dexMod: 0, proficiencyBonus: 3 })
    expect(out[0]).toEqual(scritta)
  })
})

/**
 * La prova che il passo Equipaggiamento usa davvero questa regola e non ne
 * tiene una sua. Il test sta qui, accanto alla regola, perché è la regola che
 * deve restare unica: il file di test del passo continua a occuparsi di
 * tutt'altro (le armi già in scheda che non vanno cancellate).
 */
describe('il passo Equipaggiamento usa la regola condivisa', () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    fallbackLocale: 'en',
    messages: { en: {} },
    missingWarn: false,
    fallbackWarn: false,
  })

  beforeAll(async () => {
    await preloadVariantData('dnd5e')
  })

  function preparaGuerriero(str: number, dex: number) {
    setActivePinia(createPinia())
    const store = useCharacterStore()
    store.character.variant = 'dnd5e'
    store.character.level = 5
    store.character.abilityScores.str = str
    store.character.abilityScores.dex = dex
    const wrapper = mount(Step6Equipment, { global: { plugins: [i18n] } })
    return { store, wrapper }
  }

  function scegliArma(wrapper: ReturnType<typeof preparaGuerriero>['wrapper'], name: string) {
    const btn = wrapper.find('[aria-label="equipment.martialWeapons"]')
      .findAll('button')
      .find(b => b.text().startsWith(name))
    expect(btn, `pulsante arma "${name}"`).toBeTruthy()
    return btn!.trigger('click')
  }

  /**
   * Il passo deve dare gli stessi numeri del generatore sulla stessa arma:
   * lo stocco è accurato, e con Forza 18 e Destrezza 12 si tira di Forza.
   */
  it("lo stocco in mano forzuta tira con la Forza, com'è nel generatore", async () => {
    const { store, wrapper } = preparaGuerriero(18, 12)
    await scegliArma(wrapper, 'Rapier')
    expect(store.character.weapons[0]).toEqual({ name: 'Rapier', attackBonus: 7, damage: '1d8+4' })
  })

  it('e con la Destrezza quando è la Destrezza a essere migliore', async () => {
    const { store, wrapper } = preparaGuerriero(10, 18)
    await scegliArma(wrapper, 'Rapier')
    expect(store.character.weapons[0]).toEqual({ name: 'Rapier', attackBonus: 7, damage: '1d8+4' })
  })

  it("l'arco resta sulla Destrezza anche al forzuto", async () => {
    const { store, wrapper } = preparaGuerriero(18, 12)
    await scegliArma(wrapper, 'Longbow')
    expect(store.character.weapons[0]).toEqual({ name: 'Longbow', attackBonus: 4, damage: '1d8+1' })
  })
})
