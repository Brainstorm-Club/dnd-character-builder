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

  /**
   * The schools, pinned against the Macaronicon's own summary table.
   *
   * Dreadful Tale was filed under Transmutation here while both the table and
   * the spell's own heading say Enchantment — and the companion inherited the
   * mistake into its Brancalonia pack. A school is one word in a data file and
   * nobody re-reads it; this test is the thing that re-reads it.
   */
  it('files the Macaronicon spells under the schools the book prints', () => {
    const printed: Record<string, string> = {
      'quality-stamp': 'Transmutation',
      'incandescent-mark': 'Transmutation',
      'dreadful-tale': 'Enchantment',
      exorcism: 'Abjuration',
      insurance: 'Evocation',
      'poormans-feast': 'Conjuration',
      'angelic-emanation': 'Abjuration',
      cleanse: 'Evocation',
    }
    for (const [id, school] of Object.entries(printed)) {
      const spell = brancaloniaSpells.find(s => s.id === id)
      expect(spell, id).toBeDefined()
      expect(spell!.school, id).toBe(school)
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
