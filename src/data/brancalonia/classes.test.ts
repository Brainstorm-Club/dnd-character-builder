import { describe, it, expect } from 'vitest'
import {
  brancaloniaSubclasses,
  getBrancaloniaSubclassById,
  getBrancaloniaSubclassesForClass,
} from './classes'
import { subclassNamesIt, featureNamesIt } from '@/i18n/gameTerms'

/** The one subclass per class published in the Brancalonia Setting Book */
const SETTING_BOOK_SUBCLASSES: Record<string, string> = {
  barbarian: 'pagan',
  bard: 'harlequin',
  cleric: 'miracolaro',
  druid: 'benandante',
  fighter: 'sword-player',
  monk: 'friar',
  paladin: 'knight-errant',
  ranger: 'mattatore',
  rogue: 'brigand',
  sorcerer: 'scaramante',
  warlock: 'menagramo',
  wizard: 'guiscardo',
}

/** Subclasses added by the Macaronicon expansion, keyed by parent class */
const MACARONICON_SUBCLASSES: Record<string, string> = {
  barbarian: 'mountaineer',
  bard: 'guappo',
  cleric: 'exorcist',
  fighter: 'bravo',
  monk: 'svanzic-guard',
  paladin: 'gallant-knight',
  ranger: 'rat-catcher',
  rogue: 'gadgeteer',
  sorcerer: 'heresiarch',
  warlock: 'talismancer',
}

describe('brancalonia subclasses', () => {
  it('has unique ids', () => {
    const ids = brancaloniaSubclasses.map(s => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gives every subclass a description, an Italian name and at least one feature', () => {
    for (const sub of brancaloniaSubclasses) {
      expect(sub.description, sub.id).toBeTruthy()
      expect(sub.nameOriginal, sub.id).toBeTruthy()
      expect(sub.features.length, sub.id).toBeGreaterThan(0)
    }
  })

  it('keeps every subclass feature within the level 10 cap of the setting', () => {
    for (const sub of brancaloniaSubclasses) {
      for (const feature of sub.features) {
        expect(feature.level, `${sub.id}/${feature.id}`).toBeGreaterThanOrEqual(1)
        expect(feature.level, `${sub.id}/${feature.id}`).toBeLessThanOrEqual(10)
        expect(feature.description, `${sub.id}/${feature.id}`).toBeTruthy()
      }
    }
  })

  it('keeps feature ids unique within a subclass', () => {
    for (const sub of brancaloniaSubclasses) {
      const ids = sub.features.map(f => f.id)
      expect(new Set(ids).size, sub.id).toBe(ids.length)
    }
  })

  it('translates every subclass name and feature name to Italian', () => {
    for (const sub of brancaloniaSubclasses) {
      // The Italian dictionary must agree with the name printed in the manual,
      // otherwise the blog metadata and the wizard disagree with each other.
      expect(subclassNamesIt[sub.id], sub.id).toBe(sub.nameOriginal)
      for (const feature of sub.features) {
        expect(featureNamesIt[feature.name], `${sub.id}/${feature.name}`).toBeTruthy()
      }
    }
  })

  describe('Macaronicon', () => {
    it('adds one new subclass to each of the ten affected classes', () => {
      for (const [parentClassId, subclassId] of Object.entries(MACARONICON_SUBCLASSES)) {
        const sub = getBrancaloniaSubclassById(subclassId)
        expect(sub, subclassId).toBeDefined()
        expect(sub?.parentClassId, subclassId).toBe(parentClassId)
      }
    })

    it('brings the affected classes to two Brancalonia subclasses each', () => {
      for (const parentClassId of Object.keys(MACARONICON_SUBCLASSES)) {
        expect(
          getBrancaloniaSubclassesForClass(parentClassId).length,
          parentClassId,
        ).toBe(2)
      }
    })

    it('leaves druid and wizard with their single Setting Book subclass', () => {
      // The Macaronicon adds no druid or wizard archetype.
      expect(getBrancaloniaSubclassesForClass('druid').length).toBe(1)
      expect(getBrancaloniaSubclassesForClass('wizard').length).toBe(1)
    })
  })

  describe('Setting Book', () => {
    it('gives each of the twelve classes exactly one archetype', () => {
      for (const [parentClassId, subclassId] of Object.entries(SETTING_BOOK_SUBCLASSES)) {
        const sub = getBrancaloniaSubclassById(subclassId)
        expect(sub, subclassId).toBeDefined()
        expect(sub?.parentClassId, subclassId).toBe(parentClassId)
      }
    })

    it('carries no archetype beyond the two published books', () => {
      const published = new Set([
        ...Object.values(SETTING_BOOK_SUBCLASSES),
        ...Object.values(MACARONICON_SUBCLASSES),
      ])
      expect(brancaloniaSubclasses.length).toBe(published.size)
      for (const sub of brancaloniaSubclasses) {
        expect(published.has(sub.id), `${sub.id} is in no published book`).toBe(true)
      }
    })
  })

  describe('lookup helpers', () => {
    it('returns undefined for an unknown subclass id', () => {
      expect(getBrancaloniaSubclassById('berserker')).toBeUndefined()
    })

    it('returns an empty list for a class with no Brancalonia subclasses', () => {
      expect(getBrancaloniaSubclassesForClass('burattinaio')).toEqual([])
    })
  })
})
