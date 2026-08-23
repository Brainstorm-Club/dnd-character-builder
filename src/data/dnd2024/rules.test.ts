import { describe, it, expect, beforeAll } from 'vitest'
import { HALF_CASTER_SLOTS_2024, getHalfCasterSlotsForLevel2024 } from './rules'
import { HALF_CASTER_SLOTS } from '../dnd5e/rules'
import { getSpellSlots, preloadVariantData } from '../index'
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
