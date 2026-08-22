import { describe, it, expect } from 'vitest'
import { dnd2024Species } from './races'
import { dnd2024Backgrounds } from './backgrounds'
import { races as races2014 } from '../dnd5e/races'
import { SKILLS } from '../dnd5e/skills'

const ABILITIES = ['str', 'dex', 'con', 'int', 'wis', 'cha']

describe('specie di D&D 2024', () => {
  it('ha le 9 specie dell\'SRD 5.2.1', () => {
    expect(dnd2024Species).toHaveLength(9)
    expect(dnd2024Species.map(s => s.id).sort()).toEqual([
      'dragonborn', 'dwarf', 'elf', 'gnome', 'goliath', 'halfling', 'human', 'orc', 'tiefling',
    ])
  })

  it('non dà bonus alle caratteristiche: nel 2024 li dà il background', () => {
    // È la differenza che distingue le due edizioni a colpo d'occhio.
    for (const s of dnd2024Species) {
      expect(Object.keys(s.abilityBonuses), s.name).toEqual([])
      expect(s.abilityScoreChoice, s.name).toBeUndefined()
    }
    // ...mentre nel 2014 li dava, e quei dati restano intatti.
    expect(races2014.some(r => Object.keys(r.abilityBonuses).length > 0)).toBe(true)
  })

  it('modella le discendenze come sottorazze da scegliere', () => {
    const byId = new Map(dnd2024Species.map(s => [s.id, s]))
    expect(byId.get('dragonborn')!.subraces).toHaveLength(10) // i dieci draghi cromatici e metallici
    expect(byId.get('elf')!.subraces).toHaveLength(3)         // Drow, Alto Elfo, Elfo dei Boschi
    expect(byId.get('gnome')!.subraces).toHaveLength(2)
    expect(byId.get('goliath')!.subraces).toHaveLength(6)
    expect(byId.get('tiefling')!.subraces).toHaveLength(3)
    // Le altre non hanno discendenze da scegliere
    for (const id of ['dwarf', 'halfling', 'human', 'orc']) {
      expect(byId.get(id)!.subraces, id).toHaveLength(0)
    }
  })

  it('riporta velocità e taglia del manuale', () => {
    const byId = new Map(dnd2024Species.map(s => [s.id, s]))
    expect(byId.get('goliath')!.speed).toBe(35)   // l'unica a 10,5 metri
    expect(byId.get('gnome')!.size).toBe('Small')
    expect(byId.get('halfling')!.size).toBe('Small')
    expect(byId.get('orc')!.speed).toBe(30)
  })

  it('ha un blurb su ogni specie', () => {
    for (const s of dnd2024Species) {
      expect(s.blurb, s.name).toBeDefined()
      expect(s.blurb!.length, s.name).toBeGreaterThan(80)
      expect(s.blurb!.length, `${s.name} troppo lungo`).toBeLessThan(230)
    }
  })
})

describe('background di D&D 2024', () => {
  it('ha i 4 dell\'SRD 5.2.1', () => {
    expect(dnd2024Backgrounds.map(b => b.id)).toEqual(['acolyte', 'criminal', 'sage', 'soldier'])
  })

  it('assegna tre caratteristiche e un talento d\'origine', () => {
    for (const b of dnd2024Backgrounds) {
      expect(b.abilityScoreOptions, b.name).toHaveLength(3)
      for (const a of b.abilityScoreOptions!) expect(ABILITIES, `${b.name}: ${a}`).toContain(a)
      expect(b.originFeat, b.name).toBeTruthy()
    }
  })

  it('dà due competenze di abilità, come nel manuale', () => {
    const skillIds = new Set(SKILLS.map(s => s.id))
    for (const b of dnd2024Backgrounds) {
      expect(b.skillProficiencies, b.name).toHaveLength(2)
      for (const s of b.skillProficiencies) expect(skillIds, `${b.name}: ${s}`).toContain(s)
    }
  })

  it('usa le caratteristiche giuste per ogni background', () => {
    const byId = new Map(dnd2024Backgrounds.map(b => [b.id, b]))
    expect(byId.get('acolyte')!.abilityScoreOptions).toEqual(['int', 'wis', 'cha'])
    expect(byId.get('criminal')!.abilityScoreOptions).toEqual(['dex', 'con', 'int'])
    expect(byId.get('sage')!.abilityScoreOptions).toEqual(['con', 'int', 'wis'])
    expect(byId.get('soldier')!.abilityScoreOptions).toEqual(['str', 'dex', 'con'])
  })
})
