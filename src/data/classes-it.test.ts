import { describe, it, expect } from 'vitest'
import { apocalisseFeatureDescriptionsIt, apocalisseFeatureNamesIt } from './apocalisse/classes-it'
import { brancaloniaFeatureDescriptionsIt, brancaloniaFeatureNamesIt } from './brancalonia/classes-it'
import { apocalisseSubclasses } from './apocalisse/classes'
import { brancaloniaSubclasses } from './brancalonia/classes'
import { burattinaioBrancaloniaClass } from './brancalonia/burattinaio'

function idsOf(subs: readonly { id: string; features: readonly { id: string }[] }[]): string[] {
  return subs.flatMap(s => [s.id, ...s.features.map(f => f.id)])
}

const apoIds = idsOf(apocalisseSubclasses)
const brancaIds = [
  ...idsOf(brancaloniaSubclasses),
  burattinaioBrancaloniaClass.id,
  ...burattinaioBrancaloniaClass.features.map(f => f.id),
  ...(burattinaioBrancaloniaClass.subclasses ?? []).flatMap(s => [s.id, ...s.features.map(f => f.id)]),
]

describe('descrizioni italiane di sottoclassi e privilegi', () => {
  it('copre ogni sottoclasse e privilegio di Apocalisse', () => {
    for (const id of apoIds) {
      expect(apocalisseFeatureDescriptionsIt[id], `manca la descrizione di ${id}`).toBeDefined()
    }
  })

  it('copre ogni sottoclasse e privilegio di Brancalonia', () => {
    for (const id of brancaIds) {
      expect(brancaloniaFeatureDescriptionsIt[id], `manca la descrizione di ${id}`).toBeDefined()
    }
  })

  it('non traduce id che non esistono nei dati', () => {
    for (const id of Object.keys(apocalisseFeatureDescriptionsIt)) expect(apoIds, id).toContain(id)
    for (const id of Object.keys(brancaloniaFeatureDescriptionsIt)) expect(brancaIds, id).toContain(id)
  })

  it('dà a ogni privilegio un nome italiano dal manuale', () => {
    // Le sottoclassi hanno già nameOriginal; i nomi qui sono quelli dei privilegi.
    for (const id of Object.keys(apocalisseFeatureNamesIt)) expect(apoIds, id).toContain(id)
    for (const id of Object.keys(brancaloniaFeatureNamesIt)) expect(brancaIds, id).toContain(id)
    expect(apocalisseFeatureNamesIt['martyrize-self']).toBe('Martoriarsi')
    expect(brancaloniaFeatureNamesIt['turn-the-other-cheek']).toBe("Porgi l'Altra Guancia")
  })

  it('scrive descrizioni di sostanza, non segnaposto', () => {
    for (const m of [apocalisseFeatureDescriptionsIt, brancaloniaFeatureDescriptionsIt]) {
      for (const [id, text] of Object.entries(m)) {
        expect(text.length, id).toBeGreaterThan(60)
        // niente residui inglesi dai testi di partenza
        expect(text, id).not.toMatch(/\b(you can|your|the target|saving throw)\b/i)
      }
    }
  })
})
