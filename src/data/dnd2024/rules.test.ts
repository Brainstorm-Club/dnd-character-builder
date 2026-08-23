import { describe, it, expect, beforeAll } from 'vitest'
import { HALF_CASTER_SLOTS_2024, getHalfCasterSlotsForLevel2024 } from './rules'
import { HALF_CASTER_SLOTS } from '../dnd5e/rules'
import { getSpellSlots, getMulticlassSpellSlots, preloadVariantData } from '../index'
import type { GameVariant } from '@/stores/app'

const LEVELS = Array.from({ length: 20 }, (_, i) => i + 1)
const HALF_CASTERS = ['paladin', 'ranger'] as const

describe('semi-incantatori: 2024 contro 2014', () => {
  beforeAll(async () => {
    await Promise.all((['dnd5e', 'dnd2024', 'brancalonia', 'apocalisse'] as GameVariant[])
      .map(v => preloadVariantData(v)))
  })

  it('le due tabelle non coincidono: nel 2024 il primo slot arriva al 1º livello', () => {
    // Il senso di questo file. Se un giorno tornassero identiche, vuol dire che
    // il 2024 è stato ricollegato alla tabella del 2014 e il difetto è tornato.
    expect(HALF_CASTER_SLOTS_2024).not.toEqual(HALF_CASTER_SLOTS)
    expect(HALF_CASTER_SLOTS_2024[0]).toEqual([2])
    expect(HALF_CASTER_SLOTS[0]).toEqual([])
  })

  it('al 1º livello il paladino e il ranger 2024 hanno due slot, nel 2014 nessuno', () => {
    for (const cls of HALF_CASTERS) {
      expect(getSpellSlots(cls, 1, 'dnd2024'), cls).toEqual({ 1: 2 })
      expect(getSpellSlots(cls, 1, 'dnd5e'), cls).toEqual({})
    }
  })

  it('dal 1º al 20º livello le due varianti differiscono solo al 1º', () => {
    // Le tabelle dell'SRD 5.2.1 (pp. 70 e 75) ripetono riga per riga quella del
    // 2014 a partire dal 2º livello: l'unica riga nuova è la prima.
    for (const cls of HALF_CASTERS) {
      for (const level of LEVELS) {
        const now = getSpellSlots(cls, level, 'dnd2024')
        const then = getSpellSlots(cls, level, 'dnd5e')
        if (level === 1) {
          expect(now, `${cls} liv. ${level}`).not.toEqual(then)
        } else {
          expect(now, `${cls} liv. ${level}`).toEqual(then)
        }
      }
    }
    // E complessivamente le due progressioni restano diverse.
    const progression = (v: GameVariant) => LEVELS.map(l => getSpellSlots('paladin', l, v))
    expect(progression('dnd2024')).not.toEqual(progression('dnd5e'))
  })

  it('la progressione 2024 segue la tabella dell\'SRD 5.2.1 a ogni livello', () => {
    for (const cls of HALF_CASTERS) {
      for (const level of LEVELS) {
        expect(getSpellSlots(cls, level, 'dnd2024'), `${cls} liv. ${level}`)
          .toEqual(getHalfCasterSlotsForLevel2024(level))
      }
    }
    // Qualche riga trascritta a mano dal PDF, per non fidarsi solo di se stessi.
    expect(getHalfCasterSlotsForLevel2024(5)).toEqual({ 1: 4, 2: 2 })
    expect(getHalfCasterSlotsForLevel2024(9)).toEqual({ 1: 4, 2: 3, 3: 2 })
    expect(getHalfCasterSlotsForLevel2024(17)).toEqual({ 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 })
    expect(getHalfCasterSlotsForLevel2024(20)).toEqual({ 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 })
  })

  it('la tabella nuova non tocca le altre varianti né gli altri incantatori', () => {
    // Brancalonia e Apocalisse poggiano sul 2014: lì il paladino di 1º livello
    // deve restare senza slot.
    for (const v of ['brancalonia', 'apocalisse'] as GameVariant[]) {
      expect(getSpellSlots('paladin', 1, v), v).toEqual({})
      expect(getSpellSlots('paladin', 5, v), v).toEqual(getSpellSlots('paladin', 5, 'dnd5e'))
    }
    // Incantatori pieni e patto: nessuna differenza fra le due edizioni.
    for (const level of LEVELS) {
      expect(getSpellSlots('wizard', level, 'dnd2024'), `mago liv. ${level}`)
        .toEqual(getSpellSlots('wizard', level, 'dnd5e'))
      expect(getSpellSlots('warlock', level, 'dnd2024'), `warlock liv. ${level}`)
        .toEqual(getSpellSlots('warlock', level, 'dnd5e'))
    }
  })

  it('livelli fuori tabella non inventano slot', () => {
    expect(getHalfCasterSlotsForLevel2024(0)).toEqual({})
    expect(getHalfCasterSlotsForLevel2024(21)).toEqual({})
  })
})

/**
 * Tabella «Incantatore multiclasse» dell'SRD 5.2.1 (p. 28), trascritta a mano.
 * Serve da metro indipendente: se il codice e la tabella si allontanano, uno
 * dei due ha torto e il test lo dice.
 */
const MULTICLASS_TABLE_2024: readonly number[][] = [
  [2], [3], [4, 2], [4, 3], [4, 3, 2],
  [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 2], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 1, 1, 1, 1], [4, 3, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 3, 2, 2, 1, 1],
]

/** Riga della tabella → mappa livello di incantesimo → slot. */
function tableRow(casterLevel: number): Record<number, number> {
  const row = MULTICLASS_TABLE_2024[Math.min(casterLevel, 20) - 1] ?? []
  const out: Record<number, number> = {}
  row.forEach((n, i) => { if (n > 0) out[i + 1] = n })
  return out
}

type Entry = { classId: string; level: number; casterType: string | null }
const half = (id: string, level: number): Entry => ({ classId: id, level, casterType: 'half' })
const full = (id: string, level: number): Entry => ({ classId: id, level, casterType: 'full' })

describe('multiclasse: 2024 contro 2014', () => {
  beforeAll(async () => {
    await Promise.all((['dnd5e', 'dnd2024', 'brancalonia', 'apocalisse'] as GameVariant[])
      .map(v => preloadVariantData(v)))
  })

  it('nel 2024 i livelli da semi-incantatore si arrotondano per eccesso', () => {
    // SRD 5.2.1 p. 28: «Metà dei suoi livelli (arrotondati per eccesso) nelle
    // classi del paladino e del ranger». Nel 2014 è per difetto, ed è lì che
    // un paladino 1/mago 1 perdeva un livello da incantatore.
    const party = [half('paladin', 1), full('wizard', 1)]
    expect(getMulticlassSpellSlots(party, 'dnd2024').slots).toEqual(tableRow(2))
    expect(getMulticlassSpellSlots(party, 'dnd5e').slots).toEqual(tableRow(1))
  })

  it('le due edizioni divergono su ogni livello dispari da semi-incantatore', () => {
    for (let pal = 1; pal <= 19; pal++) {
      const party = [half('paladin', pal), full('wizard', 1)]
      const now = getMulticlassSpellSlots(party, 'dnd2024').slots
      const then = getMulticlassSpellSlots(party, 'dnd5e').slots
      expect(now, `paladino ${pal}/mago 1`).toEqual(tableRow(Math.ceil(pal / 2) + 1))
      expect(then, `paladino ${pal}/mago 1`).toEqual(tableRow(Math.floor(pal / 2) + 1))
      if (pal % 2 === 1) {
        expect(now, `paladino ${pal}/mago 1`).not.toEqual(then)
      } else {
        expect(now, `paladino ${pal}/mago 1`).toEqual(then)
      }
    }
  })

  it('due semi-incantatori si arrotondano ciascuno per conto suo', () => {
    // Paladino 3/ranger 3: nel 2024 sono 2+2 = incantatore di 4º livello,
    // nel 2014 1+1 = 2º. Due arrotondamenti, non uno sul totale.
    const party = [half('paladin', 3), half('ranger', 3)]
    expect(getMulticlassSpellSlots(party, 'dnd2024').slots).toEqual(tableRow(4))
    expect(getMulticlassSpellSlots(party, 'dnd5e').slots).toEqual(tableRow(2))
  })

  it('la magia del patto resta un serbatoio a parte, uguale nelle due edizioni', () => {
    // La tabella dei privilegi del warlock 2024 (p. 76) ripete quella del 2014.
    for (let lv = 1; lv <= 20; lv++) {
      const party = [{ classId: 'warlock', level: lv, casterType: 'pact' }, full('wizard', 3)]
      const now = getMulticlassSpellSlots(party, 'dnd2024')
      const then = getMulticlassSpellSlots(party, 'dnd5e')
      expect(now.pactSlots, `warlock ${lv}`).toEqual(then.pactSlots)
      expect(now.slots, `warlock ${lv}`).toEqual(then.slots)
      expect(Object.keys(now.pactSlots).length, `warlock ${lv}`).toBe(1)
    }
  })

  it('il terzo incantatore resta per difetto: il 2024 non lo tocca', () => {
    // Nel 2024 non esiste (guerriero e ladro non lanciano), ma un personaggio
    // 2014 non deve cambiare conto per colpa di questa modifica.
    const party = [{ classId: 'fighter', level: 7, casterType: 'third' }, full('wizard', 1)]
    expect(getMulticlassSpellSlots(party, 'dnd5e').slots).toEqual(tableRow(3))
    expect(getMulticlassSpellSlots(party, 'dnd2024').slots).toEqual(tableRow(3))
  })

  it('le altre varianti e la chiamata senza variante restano al 2014', () => {
    const party = [half('paladin', 5), full('cleric', 5)]
    const legacy = getMulticlassSpellSlots(party, 'dnd5e').slots
    expect(getMulticlassSpellSlots(party).slots).toEqual(legacy)
    for (const v of ['brancalonia', 'apocalisse'] as GameVariant[]) {
      expect(getMulticlassSpellSlots(party, v).slots, v).toEqual(legacy)
    }
    // E il 2024 su quello stesso gruppo dà un livello da incantatore in più.
    expect(getMulticlassSpellSlots(party, 'dnd2024').slots).toEqual(tableRow(8))
    expect(legacy).toEqual(tableRow(7))
  })

  it('senza semi-incantatori le due edizioni contano allo stesso modo', () => {
    for (let lv = 1; lv <= 20; lv++) {
      const party = [full('wizard', lv), full('cleric', 1)]
      expect(getMulticlassSpellSlots(party, 'dnd2024').slots, `mago ${lv}`)
        .toEqual(getMulticlassSpellSlots(party, 'dnd5e').slots)
    }
  })
})
