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
    const { dnd5eFeatureDescriptionsIt } = await import('./dnd5e/classes-it')
    const { classes } = await import('./dnd5e/classes')
    const ids = new Set(classes.flatMap(c => c.features.map(f => f.id)))
    for (const id of Object.keys(dnd5eFeatureDescriptionsIt)) expect(ids, id).toContain(id)
  })

  it('nomina i privilegi con i termini ufficiali dell\'SRD italiano', async () => {
    // I nomi vivono in gameTerms, un'unica mappa per tutta l'app: la lista
    // dei privilegi, il riepilogo e la scheda PDF leggono da lì.
    const { featureNamesIt } = await import('@/i18n/gameTerms')
    const expected: Record<string, string> = {
      Rage: 'Ira',
      'Second Wind': 'Recuperare energie',
      'Action Surge': 'Azione impetuosa',
      'Sneak Attack': 'Attacco furtivo',
      'Cunning Action': 'Azione scaltra',
      'Uncanny Dodge': 'Schivata prodigiosa',
      'Jack of All Trades': 'Factotum',
      // Il corpo dell'SRD dice "Colpo di fortuna"; "Pietra della buona
      // fortuna" è l'oggetto magico omonimo, non il privilegio del ladro.
      'Stroke of Luck': 'Colpo di fortuna',
      Evasion: 'Elusione',
      'Eldritch Invocations': 'Suppliche occulte',
      'Reckless Attack': 'Attacco irruento',
    }
    for (const [en, it] of Object.entries(expected)) {
      expect(featureNamesIt[en], en).toBe(it)
    }
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

describe('un solo nome italiano per privilegio', () => {
  it('i file di traduzione non ridefiniscono i nomi che stanno in gameTerms', async () => {
    // Il difetto che questo test previene: la lista dei privilegi mostrava un
    // nome e il riepilogo un altro, perché esistevano due mappe.
    const dnd = await import('./dnd5e/classes-it')
    expect('dnd5eFeatureNamesIt' in dnd, 'i nomi D&D vanno in gameTerms').toBe(false)
  })

  it('gameTerms nomina ogni privilegio di classe base', async () => {
    const { featureNamesIt } = await import('@/i18n/gameTerms')
    const { classes } = await import('./dnd5e/classes')
    for (const c of classes) {
      for (const f of c.features) {
        expect(featureNamesIt[f.name], `${c.id}/${f.name}`).toBeDefined()
      }
    }
  })

  it('usa la forma dell\'SRD, non la maiuscola di stile inglese', async () => {
    const { featureNamesIt } = await import('@/i18n/gameTerms')
    const { classes } = await import('./dnd5e/classes')
    for (const c of classes) {
      for (const f of c.features) {
        const it = featureNamesIt[f.name]
        if (!it) continue
        // l'SRD italiano scrive "Attacco furtivo", non "Attacco Furtivo"
        const words = it.replace(/\(.*\)/, '').trim().split(' ').slice(1)
        const capitalised = words.filter(w => /^[A-ZÀ-Ü]/.test(w) && w.length > 3)
        expect(capitalised, `${f.name} -> ${it}`).toEqual([])
      }
    }
  })
})
