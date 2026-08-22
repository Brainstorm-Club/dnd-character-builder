import { describe, it, expect } from 'vitest'
import { apocalisseRaces, getApocalisseRaceById } from './races'
import { apocalisseTraitDescriptions, apocalisseTraitDescriptionsIt } from './traits'
import { apocalisseSubclasses } from './classes'
import { traitNamesIt, raceNamesIt, featureNamesIt } from '@/i18n/gameTerms'

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

describe('apocalisse archetypes', () => {
  it('gives every class exactly one archetype', () => {
    const parents = apocalisseSubclasses.map(s => s.parentClassId)
    expect(new Set(parents).size).toBe(parents.length)
    expect(parents).toHaveLength(12)
  })

  it('names and levels every feature, and translates it to Italian', () => {
    for (const sub of apocalisseSubclasses) {
      expect(sub.nameOriginal, sub.id).toBeTruthy()
      expect(sub.features.length, sub.id).toBeGreaterThan(0)
      const ids = sub.features.map(f => f.id)
      expect(new Set(ids).size, sub.id).toBe(ids.length)
      for (const f of sub.features) {
        expect(f.level, `${sub.id}/${f.id}`).toBeGreaterThanOrEqual(1)
        expect(f.level, `${sub.id}/${f.id}`).toBeLessThanOrEqual(20)
        expect(f.description, `${sub.id}/${f.id}`).toBeTruthy()
        expect(featureNamesIt[f.name], f.name).toBeTruthy()
      }
    }
  })

  it('orders each archetype by level', () => {
    for (const sub of apocalisseSubclasses) {
      const levels = sub.features.map(f => f.level)
      expect([...levels].sort((a, b) => a - b), sub.id).toEqual(levels)
    }
  })
})

describe('Origini in formato background (John\'s Guide 1.0)', () => {
  it('lascia scegliere le abilità come fa il manuale', async () => {
    const { apocalisseBackgrounds } = await import('./backgrounds')
    // Il manuale dice "due fra Arcano, Medicina, ...": nessuna Origine
    // concede competenze d'ufficio.
    for (const bg of apocalisseBackgrounds) {
      expect(bg.skillProficiencies, bg.name).toEqual([])
      expect(bg.skillChoices?.length, bg.name).toBeGreaterThan(0)
    }
  })

  it('rispecchia il numero di scelte e la lingua extra di ogni Origine', async () => {
    const { apocalisseBackgrounds } = await import('./backgrounds')
    const expected: Record<string, { slots: number; pool: number; langs: number }> = {
      'child-old-world':  { slots: 3, pool: 6, langs: 1 },  // 2 fra 6, + 1 qualsiasi, Lingua del Vecchio Mondo
      'child-apocalypse': { slots: 2, pool: 4, langs: 0 },  // 1 fra 4, + 1 qualsiasi
      'risen-hell':       { slots: 2, pool: 7, langs: 1 },  // 2 fra 7, Infernale
      'risen-heaven':     { slots: 2, pool: 6, langs: 1 },  // 2 fra 6, Celestiale
      'risen-purgatory':  { slots: 1, pool: 3, langs: 1 },  // 1 fra 3, Lingua del Vecchio Mondo
      'risen-limbo':      { slots: 2, pool: 8, langs: 0 },  // 2 fra 8
    }
    for (const bg of apocalisseBackgrounds) {
      const e = expected[bg.id]
      expect(e, bg.id).toBeDefined()
      const slots = (bg.skillChoices ?? []).reduce((n, c) => n + c.count, 0)
      expect(slots, bg.name).toBe(e!.slots)
      expect(bg.skillChoices![0]!.from.length, bg.name).toBe(e!.pool)
      expect(bg.languages, bg.name).toBe(e!.langs)
    }
  })
})
