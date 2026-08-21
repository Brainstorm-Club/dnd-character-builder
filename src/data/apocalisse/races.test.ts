import { describe, it, expect } from 'vitest'
import { apocalisseRaces, getApocalisseRaceById } from './races'
import { apocalisseTraitDescriptions, apocalisseTraitDescriptionsIt } from './traits'
import { traitNamesIt, raceNamesIt } from '@/i18n/gameTerms'

describe('apocalisse origins', () => {
  it('ships the six Origins with unique ids', () => {
    const ids = apocalisseRaces.map(r => r.id)
    expect(ids).toHaveLength(6)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gives the Children of the Old World a flat +1 to every score', () => {
    // The only Origin in the manual with fixed increases.
    const child = getApocalisseRaceById('child-old-world')
    expect(child?.abilityBonuses).toEqual({ str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 })
    expect(child?.abilityScoreChoice).toBeUndefined()
  })

  it('lets every other Origin assign +2 to one score and +1 to two others', () => {
    for (const race of apocalisseRaces) {
      if (race.id === 'child-old-world') continue
      expect(race.abilityBonuses, race.id).toEqual({})
      expect(race.abilityScoreChoice, race.id).toEqual([
        { count: 1, amount: 2 },
        { count: 2, amount: 1 },
      ])
    }
  })

  it('speaks the Babel Tongue and is Medium at 30 feet', () => {
    for (const race of apocalisseRaces) {
      expect(race.languages, race.id).toContain('Babel Tongue')
      expect(race.size, race.id).toBe('Medium')
      expect(race.speed, race.id).toBe(30)
    }
  })

  it('names and explains every Origin trait in both languages', () => {
    for (const race of apocalisseRaces) {
      expect(raceNamesIt[race.name], race.name).toBeTruthy()
      expect(race.traits.length, race.id).toBeGreaterThan(0)
      for (const trait of race.traits) {
        expect(traitNamesIt[trait], `${trait} (name)`).toBeTruthy()
        expect(apocalisseTraitDescriptions[trait], `${trait} (English)`).toBeTruthy()
        expect(apocalisseTraitDescriptionsIt[trait], `${trait} (Italian)`).toBeTruthy()
      }
    }
  })

  it('carries no description for a trait no Origin grants', () => {
    const used = new Set(apocalisseRaces.flatMap(r => r.traits))
    for (const key of Object.keys(apocalisseTraitDescriptions)) {
      expect(used.has(key), `${key} is described but unused`).toBe(true)
    }
  })
})
