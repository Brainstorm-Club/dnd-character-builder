import { describe, it, expect, beforeAll } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { generateRandomCharacter } from '@/utils/randomCharacter'
import { preloadVariantData } from '@/data'
import { getDnd5eFieldMapping, getBrancaloniaFieldMapping } from '@/utils/pdfFieldMapping'
import { encodeCharacterToUrl, decodeCharacterFromUrl } from '@/utils/shareCharacter'
import type { GameVariant } from '@/stores/app'

const VARIANTS: GameVariant[] = ['dnd5e', 'dnd2024', 'brancalonia', 'apocalisse']

/** La scheda deve arrivare intera fino al PDF e al link di condivisione. */
describe('esportazione della scheda per ogni sistema', () => {
  beforeAll(async () => {
    setActivePinia(createPinia())
    for (const v of VARIANTS) await preloadVariantData(v)
  })

  for (const variant of VARIANTS) {
    it(`${variant}: riempie i campi del PDF`, () => {
      const c = generateRandomCharacter(variant)
      const fields = variant === 'brancalonia'
        ? getBrancaloniaFieldMapping(c)
        : getDnd5eFieldMapping(c)

      const text = Object.entries(fields).filter(([, v]) => typeof v === 'string' && v)
      expect(text.length, `${variant}: PDF quasi vuoto`).toBeGreaterThan(15)

      // I campi cardine non possono mancare
      const asString = JSON.stringify(fields)
      expect(asString, 'nome').toContain(c.name)
      expect(asString, 'livello').toContain(String(c.level))
      expect(Object.values(fields).some(v => String(v) === String(c.maxHp)), 'punti ferita').toBe(true)

      // Nessun campo deve contenere "undefined" o "[object Object]"
      for (const [k, v] of text) {
        expect(String(v), `${variant}/${k}`).not.toMatch(/undefined|\[object Object\]|NaN/)
      }
    })

    it(`${variant}: sopravvive al giro di condivisione`, () => {
      const c = generateRandomCharacter(variant)
      const decoded = decodeCharacterFromUrl(encodeCharacterToUrl(c))
      expect(decoded, `${variant}: link illeggibile`).not.toBeNull()
      expect(decoded!.variant).toBe(variant)
      expect(decoded!.name).toBe(c.name)
      expect(decoded!.race).toBe(c.race)
      expect(decoded!.className).toBe(c.className)
      expect(decoded!.level).toBe(c.level)
      expect(decoded!.abilityScores).toEqual(c.abilityScores)
      // Il codificatore omette gli array vuoti per accorciare il link, e il
      // decodificatore restituisce un Partial che l'app fonde con i valori
      // di default: qui va confrontato tenendone conto.
      expect(decoded!.spellsKnown ?? []).toEqual(c.spellsKnown)
    })
  }
})
