import { describe, it, expect } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { generateRandomCharacter } from './randomCharacter'
import { computeArmorClass, modifier } from './calculations'
import {
  preloadVariantData, getClasses, getRaces, getBackgrounds, getSpells, getMaxLevel,
} from '@/data'
import { GAME_VARIANTS } from '@/stores/app'
import { armor as armorTable } from '@/data/dnd5e/equipment'

/**
 * Generare personaggi trova una categoria di difetti che i test sui dati non
 * vedono: i sette bug corretti a mano sono venuti fuori così, non dalle
 * asserzioni sui file. Qui se ne generano molti, a tutti i livelli e in tutte
 * le varianti, e si controlla che ognuno stia in piedi.
 *
 * Il generatore è casuale di proposito: sono le invarianti a dover valere per
 * qualunque personaggio produca, non il singolo esito.
 */
describe.each(GAME_VARIANTS)('personaggi generati — %s', variante => {
  const quanti = 60

  it('ne genera uno a ogni livello, e reggono tutti', async () => {
    setActivePinia(createPinia())
    await preloadVariantData(variante)
    const maxLv = getMaxLevel(variante)
    const classi = getClasses(variante)
    const razze = getRaces(variante)
    const sfondi = getBackgrounds(variante)
    const incantesimiNoti = new Set(getSpells(variante).flatMap(s => [s.id, s.name]))

    for (let i = 0; i < quanti; i++) {
      const lv = 1 + (i % maxLv)
      const c = generateRandomCharacter(variante, lv)
      const chi = `${variante} ${c.className}/${c.race} lv${lv}`

      const cls = classi.find(x => x.id === c.className)
      expect(cls, `${chi}: classe inesistente`).toBeDefined()
      expect(razze.some(r => r.id === c.race), `${chi}: razza inesistente`).toBe(true)
      if (c.background) {
        expect(sfondi.some(b => b.id === c.background), `${chi}: background inesistente`).toBe(true)
      }
      if (c.subclass) {
        expect(cls!.subclasses.some(s => s.id === c.subclass), `${chi}: sottoclasse inesistente`).toBe(true)
      }

      expect(c.name.trim(), `${chi}: senza nome`).not.toBe('')
      expect(c.maxHp, `${chi}: punti ferita non positivi`).toBeGreaterThan(0)
      expect(c.featuresTraits.length, `${chi}: nessun privilegio`).toBeGreaterThan(0)

      // Il livello non deve finire dentro al nome: lì non è più traducibile.
      for (const f of c.featuresTraits) {
        expect(f, `${chi}: privilegio malformato`).not.toMatch(/\(Lv\.|undefined|\bNaN\b/)
      }

      const magie = [...c.cantrips, ...c.spellsKnown, ...c.spellsPrepared]
      for (const s of magie) {
        expect(incantesimiNoti.has(s), `${chi}: incantesimo sconosciuto (${s})`).toBe(true)
      }
      if (magie.length) {
        expect(cls!.spellcasting, `${chi}: incantesimi senza incantatore`).not.toBeNull()
      }

      for (const [k, val] of Object.entries(c.abilityScores)) {
        expect(val, `${chi}: ${k} fuori scala`).toBeGreaterThanOrEqual(3)
        expect(val, `${chi}: ${k} fuori scala`).toBeLessThanOrEqual(20)
      }

      // La CA può scendere sotto 10 con Destrezza negativa: è regolare. Quello
      // che non deve succedere è che non torni con armatura e Destrezza.
      const ca = computeArmorClass(c)
      const dexMod = modifier(c.abilityScores.dex + (c.racialBonuses.dex || 0))
      const arm = c.armor ? armorTable.find(a => a.name === c.armor) : undefined
      const atteso = arm
        ? (arm.maxDexBonus === 0 ? arm.baseAC
          : arm.maxDexBonus !== null ? arm.baseAC + Math.min(dexMod, arm.maxDexBonus)
            : arm.baseAC + dexMod)
        : 10 + dexMod
      expect(ca, `${chi}: CA ${ca} non torna con ${c.armor ?? 'nessuna armatura'} e DES ${dexMod}`)
        .toBeGreaterThanOrEqual(atteso + (c.shield ? 2 : 0))
    }
  })
})
