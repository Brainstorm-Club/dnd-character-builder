import { describe, it, expect, beforeAll } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { COMPACT_KEYS, encodeCharacterToUrl, decodeCharacterFromUrl } from './shareCharacter'
import { generateRandomCharacter } from './randomCharacter'
import { preloadVariantData } from '@/data'
import { GAME_VARIANTS } from '@/stores/app'

describe('link di condivisione', () => {
  beforeAll(async () => {
    setActivePinia(createPinia())
    for (const v of GAME_VARIANTS) await preloadVariantData(v)
  })

  /**
   * Impedisce il ritorno del difetto per cui `speed` e `skillProficiencies`
   * condividevano la chiave breve 'sp': la velocità sovrascriveva le
   * competenze in codifica, e in decodifica 'sp' tornava a essere `speed`.
   * Una collisione fa sparire un campo in silenzio, senza alcun errore.
   */
  it('nessuna chiave breve è usata da due campi diversi', () => {
    const shorts = Object.values(COMPACT_KEYS)
    const duplicates = shorts.filter((k, i) => shorts.indexOf(k) !== i)
    expect(duplicates, `chiavi duplicate: ${duplicates.join(', ')}`).toEqual([])
    expect(new Set(shorts).size).toBe(Object.keys(COMPACT_KEYS).length)
  })

  it("'sp' resta assegnata alle competenze, come nei link già in circolazione", () => {
    expect(COMPACT_KEYS.skillProficiencies).toBe('sp')
    expect(COMPACT_KEYS.speed).not.toBe('sp')
  })

  it('competenze e velocità sopravvivono insieme al giro di andata e ritorno', () => {
    const char = generateRandomCharacter('dnd5e')
    char.skillProficiencies = ['athletics', 'perception', 'stealth']
    char.speed = 35

    const decoded = decodeCharacterFromUrl(encodeCharacterToUrl(char))
    expect(decoded.skillProficiencies).toEqual(['athletics', 'perception', 'stealth'])
    expect(decoded.speed).toBe(35)
  })
})
