import { describe, it, expect } from 'vitest'
import { classes } from './classes'
import { featureNamesIt } from '@/i18n/gameTerms'

describe('dnd5e class features', () => {
  it('carries features all the way to 20th level', () => {
    for (const cls of classes) {
      const levels = cls.features.map(f => f.level)
      expect(Math.max(...levels), `${cls.id} tops out too early`).toBe(20)
      expect(Math.min(...levels), cls.id).toBe(1)
    }
  })

  it('grants Ability Score Improvement at every level the PHB tables give it', () => {
    // Fighter gains extra improvements at 6th and 14th, rogue at 10th.
    const EXPECTED: Record<string, number[]> = {
      fighter: [4, 6, 8, 12, 14, 16, 19],
      rogue: [4, 8, 10, 12, 16, 19],
    }
    for (const cls of classes) {
      const asi = cls.features.filter(f => f.name === 'Ability Score Improvement').map(f => f.level).sort((a, b) => a - b)
      expect(asi, cls.id).toEqual(EXPECTED[cls.id] ?? [4, 8, 12, 16, 19])
    }
  })

  it('keeps feature ids unique and levels ascending within a class', () => {
    for (const cls of classes) {
      const ids = cls.features.map(f => f.id)
      expect(new Set(ids).size, cls.id).toBe(ids.length)
      const levels = cls.features.map(f => f.level)
      expect([...levels].sort((a, b) => a - b), cls.id).toEqual(levels)
    }
  })

  it('describes and translates every feature', () => {
    for (const cls of classes) {
      for (const f of cls.features) {
        expect(f.description, `${cls.id}/${f.id}`).toBeTruthy()
        expect(featureNamesIt[f.name], f.name).toBeTruthy()
      }
      for (const sub of cls.subclasses) {
        for (const f of sub.features) {
          expect(f.description, `${sub.id}/${f.id}`).toBeTruthy()
          expect(featureNamesIt[f.name], f.name).toBeTruthy()
        }
      }
    }
  })
})
