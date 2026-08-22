import { describe, it, expect } from 'vitest'
import {
  brawlFeatures, brawlMoves, brawlClassFeatures, brawlAces,
  getMoveSlots, getKnownMoveCount, getBrawlClassFeature, getBrawlAce,
} from './brawl'
import { burattinaioBrancaloniaClass } from './burattinaio'

describe('sistema delle Risse (Manuale di Ambientazione 2.6)', () => {
  it('copre i livelli 1-6, il massimo di Brancalonia', () => {
    expect(brawlFeatures.map(f => f.level)).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('assegna gli slot mossa della tabella', () => {
    expect([1, 2, 3, 4, 5, 6].map(getMoveSlots)).toEqual([2, 2, 3, 3, 4, 4])
    expect(getMoveSlots(0)).toBe(0)
  })

  it('concede una mossa generica al 1°, 3° e 5° livello', () => {
    expect([1, 2, 3, 4, 5, 6].map(getKnownMoveCount)).toEqual([1, 1, 2, 2, 3, 3])
  })

  it('ha 12 mosse generiche e 8 mosse magiche', () => {
    expect(brawlMoves.filter(m => m.kind === 'general')).toHaveLength(12)
    expect(brawlMoves.filter(m => m.kind === 'magic')).toHaveLength(8)
    expect(new Set(brawlMoves.map(m => m.id)).size).toBe(brawlMoves.length)
    expect(new Set(brawlMoves.map(m => m.nameOriginal)).size).toBe(brawlMoves.length)
  })

  it('dà a ogni classe una mossa di classe e un asso nella manica', () => {
    // Le tre classi arcane condividono la mossa di classe, ma hanno assi distinti
    const withFeature = brawlClassFeatures.flatMap(f => f.classes)
    const withAce = brawlAces.flatMap(f => f.classes)
    for (const id of ['barbarian', 'bard', 'cleric', 'druid', 'fighter', 'monk',
                      'paladin', 'ranger', 'rogue', 'sorcerer', 'warlock', 'wizard']) {
      expect(withFeature, id).toContain(id)
      expect(withAce, id).toContain(id)
    }
    expect(brawlAces).toHaveLength(12)
  })

  it('il burattinaio usa il sistema base: non ha una mossa di classe propria', () => {
    // Il Manuale di Ambientazione precede il Macaronicon, che introduce la classe:
    // se un giorno il manuale ne assegnasse una, questo test lo segnala.
    expect(burattinaioBrancaloniaClass.id).toBe('burattinaio')
    expect(getBrawlClassFeature('burattinaio')).toBeUndefined()
    expect(getBrawlAce('burattinaio')).toBeUndefined()
  })

  it('descrive ogni mossa e ne indica il costo in azione', () => {
    for (const m of [...brawlMoves]) {
      expect(['action', 'bonus', 'reaction'], m.name).toContain(m.cost)
      expect(m.description.length, m.name).toBeGreaterThan(30)
    }
    for (const f of [...brawlClassFeatures, ...brawlAces]) {
      expect(f.description.length, f.name).toBeGreaterThan(30)
      expect(f.nameOriginal.length, f.name).toBeGreaterThan(2)
    }
  })

  it('usa i nomi italiani del manuale', () => {
    const byId = new Map(brawlMoves.map(m => [m.id, m.nameOriginal]))
    expect(byId.get('bouncer')).toBe('Buttafuori')
    expect(byId.get('head-smasher')).toBe('Fracassateste')
    expect(byId.get('dodgevoiance')).toBe('Schiaffoveggenza')
    expect(getBrawlAce('barbarian')?.nameOriginal).toBe('Viuuulenza!')
    expect(getBrawlClassFeature('rogue')?.nameOriginal).toBe('Mossa Furtiva')
  })
})
