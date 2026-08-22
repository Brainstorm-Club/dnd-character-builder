import { describe, it, expect, beforeAll } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { generateRandomCharacter } from '@/utils/randomCharacter'
import {
  preloadVariantData, getRaces, getClasses, getBackgrounds, getSpells, getMaxLevel,
} from '@/data'
import { SKILLS } from './dnd5e/skills'
import type { GameVariant } from '@/stores/app'

const VARIANTS: GameVariant[] = ['dnd5e', 'dnd2024', 'brancalonia', 'apocalisse']
const ABILITIES = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const
const skillIds = new Set(SKILLS.map(s => s.id))

/**
 * Genera una scheda per ogni sistema e la controlla contro i dati di quel
 * sistema. È il collaudo che tiene insieme tutto il resto: se una variante
 * non è collegata bene — dati mancanti, classe di un'altra edizione,
 * incantesimo che quella classe non può lanciare — qui salta fuori.
 */
describe('scheda generata per ogni sistema', () => {
  beforeAll(async () => {
    setActivePinia(createPinia())
    for (const v of VARIANTS) await preloadVariantData(v)
  })

  for (const variant of VARIANTS) {
    describe(variant, () => {
      it('genera una scheda completa', () => {
        const c = generateRandomCharacter(variant)
        expect(c.variant).toBe(variant)
        expect(c.name.length).toBeGreaterThan(0)
        expect(c.race).toBeTruthy()
        expect(c.className).toBeTruthy()
        expect(c.background).toBeTruthy()
        expect(c.level).toBeGreaterThanOrEqual(1)
        expect(c.level).toBeLessThanOrEqual(getMaxLevel(variant))
        expect(c.maxHp).toBeGreaterThan(0)
      })

      it('usa razza, classe e background di questo sistema', () => {
        const c = generateRandomCharacter(variant)
        expect(getRaces(variant).map(r => r.id), 'razza').toContain(c.race)
        expect(getClasses(variant).map(x => x.id), 'classe').toContain(c.className)
        expect(getBackgrounds(variant).map(b => b.id), 'background').toContain(c.background)
      })

      it('ha caratteristiche in un intervallo legale', () => {
        const c = generateRandomCharacter(variant)
        for (const a of ABILITIES) {
          expect(c.abilityScores[a], a).toBeGreaterThanOrEqual(3)
          expect(c.abilityScores[a], a).toBeLessThanOrEqual(20)
        }
      })

      it('assegna solo abilità esistenti, senza doppioni', () => {
        const c = generateRandomCharacter(variant)
        for (const s of c.skillProficiencies) expect(skillIds, s).toContain(s)
        expect(new Set(c.skillProficiencies).size).toBe(c.skillProficiencies.length)
      })

      it('dà i tiri salvezza della classe scelta', () => {
        const c = generateRandomCharacter(variant)
        const cls = getClasses(variant).find(x => x.id === c.className)!
        expect(c.savingThrowProficiencies.sort()).toEqual([...cls.savingThrows].sort())
      })

      it('non conosce incantesimi che la sua classe non può lanciare', () => {
        for (let i = 0; i < 12; i++) {
          const c = generateRandomCharacter(variant)
          if (c.spellsKnown.length === 0) continue
          const pool = new Map(getSpells(variant).map(s => [s.id, s]))
          for (const id of c.spellsKnown) {
            const spell = pool.get(id)
            expect(spell, `${variant}: incantesimo ${id} inesistente`).toBeDefined()
            expect(spell!.classes, `${variant} ${c.className}: ${spell!.name}`).toContain(c.className)
          }
        }
      })

      it('non supera il livello di slot accessibile alla classe', () => {
        for (let i = 0; i < 12; i++) {
          const c = generateRandomCharacter(variant)
          const cls = getClasses(variant).find(x => x.id === c.className)!
          if (!cls.spellcasting || c.spellsKnown.length === 0) continue
          const pool = new Map(getSpells(variant).map(s => [s.id, s]))
          const maxLevel = Math.max(...c.spellsKnown.map(id => pool.get(id)?.level ?? 0))
          const cap = cls.spellcasting.casterType === 'full' ? Math.ceil(c.level / 2)
            : cls.spellcasting.casterType === 'pact' ? Math.min(5, Math.ceil(c.level / 2))
            : Math.ceil(c.level / 4)
          expect(maxLevel, `${variant} ${c.className} liv.${c.level}`).toBeLessThanOrEqual(Math.max(cap, 0))
        }
      })

      it('elenca i privilegi che spettano al suo livello, e non oltre', () => {
        const c = generateRandomCharacter(variant)
        const cls = getClasses(variant).find(x => x.id === c.className)!
        const reachable = new Set(cls.features.filter(f => f.level <= c.level).map(f => f.name))
        const tooHigh = cls.features.filter(f => f.level > c.level).map(f => f.name)
        for (const f of c.featuresTraits) {
          if (tooHigh.includes(f) && !reachable.has(f)) {
            throw new Error(`${variant}: "${f}" non spetta al livello ${c.level}`)
          }
        }
      })
    })
  }

  it('D&D 2024 prende i bonus di caratteristica dal background', () => {
    // Nel 2024 il background elenca tre caratteristiche: una sale di 2 e
    // un'altra di 1. Senza questo, un personaggio 2024 nascerebbe con i tiri
    // grezzi e sarebbe più debole di uno 2014 a parità di dadi.
    for (let i = 0; i < 10; i++) {
      const c = generateRandomCharacter('dnd2024')
      const bg = getBackgrounds('dnd2024').find(b => b.id === c.background)!
      const bonuses = Object.entries(c.racialBonuses)
      expect(bonuses.length, `${c.background}`).toBe(2)
      expect(bonuses.map(([, v]) => v).sort(), `${c.background}`).toEqual([1, 2])
      for (const [ability] of bonuses) {
        expect(bg.abilityScoreOptions, `${c.background}: ${ability}`).toContain(ability)
      }
    }
  })

  it('D&D 2024 non eredita i bonus di caratteristica dalla specie', () => {
    // Nel 2024 li dà il background: se una specie ne desse, avremmo mescolato
    // le due edizioni.
    for (let i = 0; i < 10; i++) {
      const c = generateRandomCharacter('dnd2024')
      const species = getRaces('dnd2024').find(r => r.id === c.race)!
      expect(Object.keys(species.abilityBonuses), c.race).toEqual([])
      expect(species.abilityScoreChoice, c.race).toBeUndefined()
    }
    // Nel 2014 invece li dà la razza, e quei dati restano.
    const anyBonus = Array.from({ length: 10 }, () => generateRandomCharacter('dnd5e'))
      .some(c => Object.keys(c.racialBonuses).length > 0)
    expect(anyBonus).toBe(true)
  })
})
