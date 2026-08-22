import { describe, it, expect } from 'vitest'
import { getClassBlurb } from './classBlurbs'
import { brancaloniaRaces } from './brancalonia/races'
import { apocalisseRaces } from './apocalisse/races'
import { classes } from './dnd5e/classes'

// getClassBlurb non copre la variante 2024: là il blurb sta sull'oggetto
// classe, e ha un test suo più sotto.
const VARIANTS = ['dnd5e', 'brancalonia', 'apocalisse'] as const

describe('descrizioni brevi per la scelta', () => {
  it('ogni classe ha un blurb in ogni variante', () => {
    for (const v of VARIANTS) {
      for (const c of classes) {
        const b = getClassBlurb(v, c.id)
        expect(b, `${v}/${c.id}`).toBeDefined()
        expect(b!.length, `${v}/${c.id}`).toBeGreaterThan(80)
        expect(b!.length, `${v}/${c.id} troppo lungo per una card`).toBeLessThan(230)
      }
    }
  })

  it('Brancalonia e Apocalisse non riusano il testo di D&D', () => {
    // Il punto del blurb è distinguere un Furioso da un Monaco dei Sette
    // Sigilli, non ripetere "il guerriero è il maestro d'armi".
    for (const v of ['brancalonia', 'apocalisse'] as const) {
      for (const c of classes) {
        expect(getClassBlurb(v, c.id), `${v}/${c.id}`).not.toBe(getClassBlurb('dnd5e', c.id))
      }
    }
  })

  it('il burattinaio, che esiste solo in Brancalonia, ha il suo', () => {
    expect(getClassBlurb('brancalonia', 'burattinaio')).toBeDefined()
  })

  it('ogni razza di Brancalonia e Apocalisse ha un blurb', () => {
    for (const r of [...brancaloniaRaces, ...apocalisseRaces]) {
      expect(r.blurb, r.name).toBeDefined()
      expect(r.blurb!.length, r.name).toBeGreaterThan(80)
      expect(r.blurb!.length, `${r.name} troppo lungo per una card`).toBeLessThan(230)
    }
  })

  it('i blurb sono distinti fra loro', () => {
    const all = [...brancaloniaRaces, ...apocalisseRaces].map(r => r.blurb)
    expect(new Set(all).size).toBe(all.length)
  })
})

describe('descrizioni brevi della variante 2024', () => {
  it('ogni classe del 2024 porta il proprio blurb', async () => {
    const { dnd2024Classes } = await import('./dnd2024/classes')
    for (const c of dnd2024Classes) {
      expect(c.blurb, c.id).toBeDefined()
      expect(c.blurb!.length, c.id).toBeGreaterThan(80)
      expect(c.blurb!.length, `${c.id} troppo lungo per una card`).toBeLessThan(260)
    }
  })
})
