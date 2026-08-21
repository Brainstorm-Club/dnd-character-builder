import { describe, it, expect } from 'vitest'
import { brancaloniaRaces, getBrancaloniaRaceById } from './races'
import { traitNamesIt, raceNamesIt, subraceNamesIt } from '@/i18n/gameTerms'

/** Races added by the Macaronicon expansion */
const MACARONICON_RACES = ['wolfcat', 'nonexistent', 'pantegan']
/** Races added by the L'Impero Randella Ancora expansion */
const IMPERO_RACES = ['arcimboldo', 'jackrabid', 'paraghoul']

describe('brancalonia races', () => {
  it('has unique ids', () => {
    const ids = brancaloniaRaces.map(r => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('includes the six Setting Book races plus both expansions', () => {
    const ids = brancaloniaRaces.map(r => r.id)
    for (const id of ['human', 'gifted', 'malebranche', 'marionette', 'morgant', 'sylvan']) {
      expect(ids).toContain(id)
    }
    for (const id of [...MACARONICON_RACES, ...IMPERO_RACES]) {
      expect(ids).toContain(id)
    }
  })

  it('gives every race a description, an Italian name and at least one trait', () => {
    for (const race of brancaloniaRaces) {
      expect(race.description, race.id).toBeTruthy()
      expect(race.nameOriginal, race.id).toBeTruthy()
      expect(race.traits.length, race.id).toBeGreaterThan(0)
      expect(race.languages.length, race.id).toBeGreaterThan(0)
    }
  })

  it('translates every race name and racial trait to Italian', () => {
    for (const race of brancaloniaRaces) {
      expect(raceNamesIt[race.name], race.name).toBeTruthy()
      for (const trait of race.traits) {
        expect(traitNamesIt[trait], `${race.id}/${trait}`).toBeTruthy()
      }
      for (const sub of race.subraces) {
        expect(subraceNamesIt[sub.name], sub.name).toBeTruthy()
        for (const trait of sub.traits) {
          expect(traitNamesIt[trait], `${sub.id}/${trait}`).toBeTruthy()
        }
      }
    }
  })

  it('keeps subrace ids unique within each race', () => {
    for (const race of brancaloniaRaces) {
      const ids = race.subraces.map(s => s.id)
      expect(new Set(ids).size, race.id).toBe(ids.length)
    }
  })

  describe('Macaronicon', () => {
    it('gives the Marionette its four shapes', () => {
      const marionette = getBrancaloniaRaceById('marionette')
      expect(marionette?.subraces.map(s => s.id)).toEqual([
        'pinocchio', 'pupo', 'cabin-doll', 'saintlet',
      ])
    })

    it('models the WolfCat as a Small, dexterous feline', () => {
      const wolfcat = getBrancaloniaRaceById('wolfcat')
      expect(wolfcat?.abilityBonuses).toEqual({ dex: 2, cha: 1 })
      expect(wolfcat?.size).toBe('Small')
      expect(wolfcat?.speed).toBe(30)
    })

    it('lets the Nonexistent choose one extra ability point', () => {
      const nonexistent = getBrancaloniaRaceById('nonexistent')
      expect(nonexistent?.abilityBonuses).toEqual({ con: 2 })
      expect(nonexistent?.abilityScoreChoice).toEqual({ count: 1, amount: 1 })
    })

    it('gives the Pantegan the reduced speed of a Small rat-man', () => {
      const pantegan = getBrancaloniaRaceById('pantegan')
      expect(pantegan?.size).toBe('Small')
      expect(pantegan?.speed).toBe(25)
    })
  })

  describe("L'Impero Randella Ancora", () => {
    it('gives the Arcimboldo its three natures', () => {
      const arcimboldo = getBrancaloniaRaceById('arcimboldo')
      expect(arcimboldo?.subraces.map(s => s.id)).toEqual([
        'orcharder', 'ragpicker', 'scrapper',
      ])
      // Each nature grants a different +1 and a different damage resistance
      const bonuses = arcimboldo?.subraces.map(s => Object.keys(s.abilityBonuses)[0])
      expect(new Set(bonuses).size).toBe(3)
    })

    it('makes the Jackrabid the fastest race in the setting', () => {
      const jackrabid = getBrancaloniaRaceById('jackrabid')
      expect(jackrabid?.speed).toBe(35)
      const fastest = Math.max(...brancaloniaRaces.map(r => r.speed))
      expect(jackrabid?.speed).toBe(fastest)
    })

    it('lets the Paraghoul spread two extra ability points', () => {
      const paraghoul = getBrancaloniaRaceById('paraghoul')
      expect(paraghoul?.abilityBonuses).toEqual({ int: 1 })
      expect(paraghoul?.abilityScoreChoice).toEqual({ count: 2, amount: 1 })
    })
  })

  describe('getBrancaloniaRaceById', () => {
    it('finds a race by id and returns undefined for an unknown one', () => {
      expect(getBrancaloniaRaceById('wolfcat')?.name).toBe('WolfCat')
      expect(getBrancaloniaRaceById('tiefling')).toBeUndefined()
    })
  })
})
