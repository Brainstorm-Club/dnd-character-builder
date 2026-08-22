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

describe('privilegi delle classi base D&D in italiano', () => {
  it('copre ogni privilegio di classe base', async () => {
    const { dnd5eFeatureDescriptionsIt } = await import('./dnd5e/classes-it')
    const { classes } = await import('./dnd5e/classes')
    for (const c of classes) {
      for (const f of c.features) {
        expect(dnd5eFeatureDescriptionsIt[f.id], `manca ${c.id}/${f.id}`).toBeDefined()
      }
    }
  })

  it('non traduce id che non esistono fra i privilegi di classe base', async () => {
    const { dnd5eFeatureDescriptionsIt, dnd5eFeatureNamesIt } = await import('./dnd5e/classes-it')
    const { classes } = await import('./dnd5e/classes')
    const ids = new Set(classes.flatMap(c => c.features.map(f => f.id)))
    for (const id of Object.keys(dnd5eFeatureDescriptionsIt)) expect(ids, id).toContain(id)
    for (const id of Object.keys(dnd5eFeatureNamesIt)) expect(ids, id).toContain(id)
  })

  it('usa i nomi ufficiali dell\'SRD italiano', async () => {
    const { dnd5eFeatureNamesIt: n } = await import('./dnd5e/classes-it')
    expect(n['rage']).toBe('Ira')
    expect(n['second-wind']).toBe('Recuperare energie')
    expect(n['action-surge']).toBe('Azione impetuosa')
    expect(n['sneak-attack']).toBe('Attacco furtivo')
    expect(n['cunning-action']).toBe('Azione scaltra')
    expect(n['uncanny-dodge']).toBe('Schivata prodigiosa')
    expect(n['jack-of-all-trades']).toBe('Factotum')
    expect(n['stroke-of-luck']).toBe('Pietra della buona fortuna')
  })

  it('descrive le regole 2014, non quelle 2024', async () => {
    const { dnd5eFeatureDescriptionsIt: d } = await import('./dnd5e/classes-it')
    // Il monaco 2014 ha i punti ki, non i Punti Concentrazione del 2024
    expect(d['ki']).toMatch(/punti ki/)
    // Il barbaro 2014 ha Critico brutale, non Colpo brutale
    expect(d['brutal-critical-1']).toMatch(/colpo critico/)
    // Il paladino 2014 spende slot per Punizione divina, che nel 2024 è un incantesimo
    expect(d['divine-smite']).toMatch(/slot incantesimo/)
    // L'ira 2014 non ha la clausola 2024 del prolungamento turno per turno
    expect(d['rage']).not.toMatch(/prolungar/)
  })

  it('non lascia testo inglese nelle descrizioni', async () => {
    const { dnd5eFeatureDescriptionsIt: d } = await import('./dnd5e/classes-it')
    for (const [id, text] of Object.entries(d)) {
      expect(text.length, id).toBeGreaterThan(40)
      expect(text, id).not.toMatch(/\b(you can|your|the target|saving throw|hit points)\b/i)
    }
  })
})
