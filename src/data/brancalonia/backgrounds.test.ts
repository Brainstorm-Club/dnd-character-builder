import { describe, it, expect } from 'vitest'
import { brancaloniaBackgrounds } from './backgrounds'
import { SKILLS } from '../dnd5e/skills'

const skillIds = new Set(SKILLS.map(s => s.id))

describe('background di Brancalonia', () => {
  it('ha i 6 del Manuale di Ambientazione più i 14 delle espansioni', () => {
    expect(brancaloniaBackgrounds).toHaveLength(20)
  })

  it('non ha id o nomi italiani duplicati', () => {
    expect(new Set(brancaloniaBackgrounds.map(b => b.id)).size).toBe(20)
    expect(new Set(brancaloniaBackgrounds.map(b => b.nameOriginal)).size).toBe(20)
  })

  it('usa solo abilità esistenti', () => {
    for (const b of brancaloniaBackgrounds) {
      for (const s of b.skillProficiencies) expect(skillIds, `${b.name}: ${s}`).toContain(s)
    }
  })

  it('dà due competenze di abilità a tutti tranne il lavativo', () => {
    for (const b of brancaloniaBackgrounds) {
      const expected = b.id === 'slacker' ? 0 : 2
      expect(b.skillProficiencies.length, b.name).toBe(expected)
    }
  })

  it('ogni background ha privilegio, descrizione ed equipaggiamento', () => {
    for (const b of brancaloniaBackgrounds) {
      expect(b.feature.name.length, b.name).toBeGreaterThan(3)
      expect(b.feature.description.length, b.name).toBeGreaterThan(40)
      expect(b.description.length, b.name).toBeGreaterThan(60)
      expect(b.equipment.length, b.name).toBeGreaterThan(0)
    }
  })

  it('i due background della Forca concedono un talento della Forca', () => {
    for (const id of ['fork-adept', 'fork-renegade']) {
      const b = brancaloniaBackgrounds.find(x => x.id === id)
      expect(b?.feature.name, id).toBe('Fork Feat')
      expect(b?.feature.description, id).toMatch(/Fork feats list/)
    }
  })
})
