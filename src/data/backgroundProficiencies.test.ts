import { describe, it, expect, beforeAll } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { generateRandomCharacter } from '@/utils/randomCharacter'
import { preloadVariantData, getBackgrounds } from '@/data'
import { GAME_VARIANTS } from '@/stores/app'

/**
 * Trenta background su quarantatré dichiarano competenze negli strumenti, e
 * tre di Brancalonia anche nelle armi — ma non arrivavano mai al personaggio:
 * il passo Background le mostrava e basta, e il generatore componeva
 * `proficienciesOther` dalla sola classe. Il ciarlatano usciva senza il
 * trucco per il travestimento, il polveriere senza le armi da fuoco.
 */
beforeAll(async () => {
  setActivePinia(createPinia())
  for (const v of GAME_VARIANTS) await preloadVariantData(v)
})

describe.each(GAME_VARIANTS)('competenze del background — %s', variante => {
  it('i background che le dichiarano le passano al personaggio', () => {
    const conCompetenze = getBackgrounds(variante).filter(b =>
      b.toolProficiencies.length > 0 || (b.weaponProficiencies?.length ?? 0) > 0)
    expect(conCompetenze.length, 'questa variante ne ha almeno uno').toBeGreaterThan(0)

    // Si generano abbastanza personaggi da incontrare ogni background.
    const visti = new Map<string, string[]>()
    for (let i = 0; i < 200; i++) {
      const c = generateRandomCharacter(variante, 1 + (i % 6))
      if (c.background && !visti.has(c.background)) visti.set(c.background, c.proficienciesOther)
    }

    let controllati = 0
    for (const bg of conCompetenze) {
      const comp = visti.get(bg.id)
      if (!comp) continue
      controllati++
      for (const p of [...bg.toolProficiencies, ...(bg.weaponProficiencies ?? [])]) {
        expect(comp, `${bg.name}: manca «${p}»`).toContain(p)
      }
    }
    expect(controllati, 'almeno un background è stato incontrato').toBeGreaterThan(0)
  })
})

describe('competenze nelle armi dei background di Brancalonia', () => {
  it('le tre che il manuale concede sono nei dati', () => {
    const bg = getBackgrounds('brancalonia')
    const atteso: Record<string, string[]> = {
      'fork-adept': ['Bright cudgel', 'Double bright cudgel'],
      'fork-renegade': ['Bright cudgel', 'Double bright cudgel'],
      'powder-dabbler': ['Firearms'],
    }
    for (const [id, armi] of Object.entries(atteso)) {
      const b = bg.find(x => x.id === id)
      expect(b, `background ${id}`).toBeDefined()
      expect(b!.weaponProficiencies, `${id}: armi dal manuale`).toEqual(armi)
    }
    // E nessun altro ne ha: nel 2014 e nel 2024 i background non danno armi.
    const conArmi = bg.filter(b => (b.weaponProficiencies?.length ?? 0) > 0).map(b => b.id)
    expect(conArmi.sort()).toEqual(Object.keys(atteso).sort())
  })
})
