import { describe, it, expect } from 'vitest'
import { brancaloniaFeats, getAvailableFeats, getBrancaloniaFeatById } from './feats'
import { brancaloniaRaces } from './races'

const raceIds = new Set(brancaloniaRaces.flatMap(r => [r.id, ...(r.subraces ?? []).map(s => s.id)]))

describe('talenti brancaloni (L’Impero Randella Ancora!)', () => {
  it('ha i 16 talenti del manuale', () => {
    expect(brancaloniaFeats).toHaveLength(16)
  })

  it('non ha id o nomi duplicati', () => {
    expect(new Set(brancaloniaFeats.map(f => f.id)).size).toBe(16)
    expect(new Set(brancaloniaFeats.map(f => f.nameOriginal)).size).toBe(16)
  })

  it('ogni prerequisito punta a una razza esistente', () => {
    for (const f of brancaloniaFeats) {
      if (f.prerequisite) expect(raceIds, f.name).toContain(f.prerequisite)
    }
  })

  it('ogni talento elenca almeno due benefici', () => {
    for (const f of brancaloniaFeats) {
      expect(f.benefits.length, f.name).toBeGreaterThanOrEqual(2)
      expect(f.description.length, f.name).toBeGreaterThan(30)
    }
  })

  it('marca i quattro talenti del Risveglio della Forca', () => {
    const fork = brancaloniaFeats.filter(f => f.fork).map(f => f.id)
    expect(fork.sort()).toEqual(['fork-choke', 'fork-deception', 'fork-dexterity', 'fork-push'])
  })

  it('filtra i talenti razziali in base alla razza scelta', () => {
    const generic = getAvailableFeats([])
    expect(generic.every(f => !f.prerequisite)).toBe(true)
    expect(generic).toHaveLength(10)

    const wolfcat = getAvailableFeats(['wolfcat'])
    expect(wolfcat.map(f => f.id)).toContain('bounceback')
    expect(wolfcat.map(f => f.id)).not.toContain('rabbies')
  })

  it('usa i nomi italiani del manuale', () => {
    expect(getBrancaloniaFeatById('magicance')?.nameOriginal).toBe('Magicanza')
    expect(getBrancaloniaFeatById('one-foot-in-the-grave')?.nameOriginal).toBe('Più di Là Che di Qua')
    expect(getBrancaloniaFeatById('heavy-metal-armored')?.nameOriginal).toBe('Corazzato Kotiomkin')
  })
})

describe('scelta del talento nella scheda', () => {
  it('un umano brancalone vede solo i talenti senza prerequisito', () => {
    const human = brancaloniaRaces.find(r => r.id === 'human')
    expect(human?.traits, 'il tratto feat-choice deve esistere').toContain('feat-choice')
    expect(getAvailableFeats(['human']).map(f => f.id)).toEqual([
      'artificer', 'forced-march', 'fork-choke', 'fork-deception', 'fork-dexterity',
      'fork-push', 'heavy-metal-armored', 'magicance',
      'natural-born-assault-trooper', 'veteran-deserter',
    ])
  })
})
