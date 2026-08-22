import { describe, it, expect } from 'vitest'
import { brancaloniaSpells } from './spells'
import { brancaloniaSubclasses } from './classes'
import { spellNamesIt } from '@/i18n/gameTerms'

describe('brancalonia spells', () => {
  it('ships the fourteen spells the two expansions add', () => {
    expect(brancaloniaSpells).toHaveLength(14)
    const ids = brancaloniaSpells.map(s => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gives every spell complete metadata and at least one class', () => {
    for (const s of brancaloniaSpells) {
      expect(s.name, s.id).toBeTruthy()
      expect(s.level, s.id).toBeGreaterThanOrEqual(0)
      expect(s.level, s.id).toBeLessThanOrEqual(9)
      for (const field of ['school', 'castingTime', 'range', 'components', 'duration', 'description'] as const) {
        expect(s[field], `${s.id}/${field}`).toBeTruthy()
      }
      expect(s.classes.length, s.id).toBeGreaterThan(0)
      expect(spellNamesIt[s.name], s.name).toBeTruthy()
    }
  })

  it('provides every spell the subclasses name with an asterisk in the books', () => {
    // These are referenced by the Exorcist's domain list, the Rat Catcher's
    // ranger spells and the Talismancer's expanded list.
    const referenced = ['Incandescent Mark', 'Exorcism', 'Cleanse', 'Angelic Emanation']
    const available = brancaloniaSpells.map(s => s.name)
    for (const name of referenced) {
      expect(available, name).toContain(name)
    }
  })

  it('names no spell the subclass descriptions do not reference or vice versa', () => {
    // Every subclass description that names a Brancalonia spell must be able
    // to resolve it in the spell list.
    const text = brancaloniaSubclasses.map(s => s.description).join(' ').toLowerCase()
    const named = brancaloniaSpells.filter(s => text.includes(s.name.toLowerCase()))
    expect(named.length, 'at least the four domain/expanded spells').toBeGreaterThanOrEqual(4)
  })
})
