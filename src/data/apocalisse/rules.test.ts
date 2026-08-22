import { describe, it, expect } from 'vitest'
import { apocalisseRules } from './rules'

/**
 * Ancora i dati di Apocalisse al manuale (John's Guide to the Armageddon 1.0).
 * I nomi italiani sono quelli dell'edizione ITA, non traduzioni libere.
 */
describe('regole Apocalisse', () => {
  it('ha 7 Virtù e 7 Peccati', () => {
    expect(apocalisseRules.virtues).toHaveLength(7)
    expect(apocalisseRules.sins).toHaveLength(7)
  })

  it('assegna a ogni Virtù la resistenza al danno del manuale', () => {
    const expected: Record<string, string> = {
      fortitude: 'force', prudence: 'psychic', temperance: 'thunder',
      justice: 'lightning', faith: 'fire', hope: 'cold', charity: 'acid',
    }
    for (const v of apocalisseRules.virtues) {
      expect(v.damageResistance, v.name).toBe(expected[v.id])
    }
  })

  it('descrive il beneficio meccanico di ogni Virtù e Peccato', () => {
    for (const v of apocalisseRules.virtues) {
      expect(v.benefit.length, v.name).toBeGreaterThan(40)
    }
    for (const s of apocalisseRules.sins) {
      expect(s.benefit.length, s.name).toBeGreaterThan(40)
    }
  })

  it('usa i nomi italiani degli spiriti dei Marchi come nel manuale', () => {
    const expected: Record<string, string> = {
      // Marchio del Signore
      militancy: 'Spirito della Militanza', expertise: 'Spirito della Perizia',
      triumph: 'Spirito del Trionfo', righteousness: 'Spirito della Rettitudine',
      firmness: 'Spirito della Saldezza', lore: 'Spirito della Sapienza',
      bravery: 'Spirito dell’Ardimento',
      // Marchio della Bestia
      savagery: 'Spirito della Ferocia', deception: 'Spirito dell’Insidia',
      turmoil: 'Spirito del Turbamento', stubbornness: 'Spirito della Pervicacia',
      frenzy: 'Spirito della Frenesia', falsehood: 'Spirito della Falsità',
      desolation: 'Spirito della Desolazione',
    }
    const spirits = apocalisseRules.marks.flatMap(m => m.spirits)
    expect(spirits).toHaveLength(14)
    for (const s of spirits) {
      expect(s.nameOriginal, s.name).toBe(expected[s.id])
      expect(s.description, s.name).toMatch(/Mark Die/)
    }
  })

  it('ha due Marchi con sette spiriti ciascuno', () => {
    expect(apocalisseRules.marks).toHaveLength(2)
    for (const m of apocalisseRules.marks) expect(m.spirits, m.name).toHaveLength(7)
  })
})
