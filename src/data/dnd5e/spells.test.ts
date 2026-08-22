import { describe, it, expect } from 'vitest'
import { spells, getSpellsByClass } from './spells'

const CLASSES = ['bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'warlock', 'wizard']

/** Massimo livello di slot incantesimo raggiungibile da ciascuna classe al 20o livello */
const MAX_SPELL_LEVEL: Record<string, number> = {
  bard: 9, cleric: 9, druid: 9, sorcerer: 9, wizard: 9,
  warlock: 9, // 6o-9o tramite Arcanum Mistico
  paladin: 5, ranger: 5,
}

describe('incantesimi D&D 5e (SRD 5.1)', () => {
  it('non ha id duplicati', () => {
    const ids = spells.map(s => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('non ha nomi duplicati', () => {
    const names = spells.map(s => s.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('usa solo classi incantatrici valide', () => {
    for (const s of spells) {
      expect(s.classes.length, `${s.name} non ha classi`).toBeGreaterThan(0)
      for (const c of s.classes) expect(CLASSES, `${s.name}: ${c}`).toContain(c)
    }
  })

  it('usa solo scuole di magia valide', () => {
    const schools = ['Abjuration', 'Conjuration', 'Divination', 'Enchantment',
                     'Evocation', 'Illusion', 'Necromancy', 'Transmutation']
    for (const s of spells) expect(schools, s.name).toContain(s.school)
  })

  it('ha tutti i campi compilati', () => {
    for (const s of spells) {
      expect(s.castingTime, s.name).toBeTruthy()
      expect(s.range, s.name).toBeTruthy()
      expect(s.components, s.name).toMatch(/^[VSM](, [VSM])*$/)
      expect(s.duration, s.name).toBeTruthy()
      expect(s.description.length, s.name).toBeGreaterThan(30)
    }
  })

  it('copre ogni livello di slot accessibile a ogni classe', () => {
    for (const c of CLASSES) {
      const byLevel = new Set(getSpellsByClass(c).map(s => s.level))
      const max = MAX_SPELL_LEVEL[c] ?? 0
      for (let lv = 1; lv <= max; lv++) {
        expect(byLevel.has(lv), `${c} non ha incantesimi di livello ${lv}`).toBe(true)
      }
    }
  })

  it('assegna trucchetti solo alle classi che ne hanno', () => {
    // Paladino e ranger non ottengono trucchetti nella 5e 2014
    expect(getSpellsByClass('paladin').filter(s => s.level === 0)).toHaveLength(0)
    expect(getSpellsByClass('ranger').filter(s => s.level === 0)).toHaveLength(0)
  })

  it('include gli incantesimi cardine di ogni livello', () => {
    const byName = new Map(spells.map(s => [s.name, s]))
    const expected: [string, number, string[]][] = [
      ['Cure Wounds', 1, ['bard', 'cleric', 'druid', 'paladin', 'ranger']],
      ['Fireball', 3, ['sorcerer', 'wizard']],
      ['Counterspell', 3, ['sorcerer', 'warlock', 'wizard']],
      ['Revivify', 3, ['cleric', 'paladin']],
      ['Wish', 9, ['sorcerer', 'wizard']],
    ]
    for (const [name, level, classes] of expected) {
      const s = byName.get(name)
      expect(s, name).toBeDefined()
      expect(s!.level, name).toBe(level)
      expect(s!.classes.sort(), name).toEqual(classes.sort())
    }
  })
})
