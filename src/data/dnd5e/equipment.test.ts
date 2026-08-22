import { describe, it, expect } from 'vitest'
import { simpleWeapons, martialWeapons, armor } from './equipment'

const allWeapons = [...simpleWeapons, ...martialWeapons]

describe('equipaggiamento D&D 5e (SRD 5.1)', () => {
  it('ha tutte e 37 le armi del manuale', () => {
    expect(simpleWeapons).toHaveLength(14)
    expect(martialWeapons).toHaveLength(23)
  })

  it('include le armi da tiro marziali spesso dimenticate', () => {
    const names = allWeapons.map(w => w.name)
    expect(names).toContain('Blowgun')
    expect(names).toContain('Net')
  })

  it('riporta il prezzo di listino di ogni arma e armatura', () => {
    for (const w of allWeapons) expect(w.cost, w.name).toMatch(/^[\d,]+ (cp|sp|gp)$/)
    for (const a of armor) expect(a.cost, a.name).toMatch(/^[\d,]+ gp$/)
  })

  it('usa i prezzi del manuale per un campione noto', () => {
    const byName = new Map(allWeapons.map(w => [w.name, w]))
    expect(byName.get('Greatsword')?.cost).toBe('50 gp')
    expect(byName.get('Dart')?.cost).toBe('5 cp')
    expect(byName.get('Blowgun')?.cost).toBe('10 gp')
    const plate = armor.find(a => a.name === 'Plate')
    expect(plate?.cost).toBe('1,500 gp')
  })
})
