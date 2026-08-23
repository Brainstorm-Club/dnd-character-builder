import { describe, it, expect } from 'vitest'
import { blogCharacters } from './characters'
import { dnd2024Species } from '../dnd2024/races'
import { dnd2024Classes } from '../dnd2024/classes'
import { dnd2024Backgrounds } from '../dnd2024/backgrounds'
import { dnd2024Feats } from '../dnd2024/feats'
import { subclassNamesIt } from '@/i18n/gameTerms'

const characters = blogCharacters.filter(c => c.variant === 'dnd2024')
const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const

/**
 * La differenza che conta rispetto al 2014: la specie non dà bonus alle
 * caratteristiche. Li dà il background, +2 a una e +1 a un'altra fra le tre
 * che elenca, insieme a un talento d'origine. Un personaggio 2024 con i
 * bonus sulla specie è un personaggio 2014 travestito.
 */
describe('personaggi pronti di D&D 2024', () => {
  it('ce n’è uno per ognuna delle dodici classi, con slug distinti', () => {
    expect(characters.length).toBe(12)
    const slug = characters.map(c => c.slug)
    expect(new Set(slug).size).toBe(slug.length)
    const classi = characters.map(c => c.characterData.className)
    expect(new Set(classi).size).toBe(12)
  })

  describe.each(characters.map(c => [c.characterData.name, c] as const))('%s', (_n, entry) => {
    const char = entry.characterData
    const specie = dnd2024Species.find(r => r.id === char.race)
    const cls = dnd2024Classes.find(c => c.id === char.className)
    const bg = dnd2024Backgrounds.find(b => b.id === char.background)

    it('parte da specie, classe e background che esistono nel 2024', () => {
      expect(specie, char.race).toBeDefined()
      expect(cls, char.className).toBeDefined()
      expect(bg, char.background).toBeDefined()
    })

    it('sceglie una discendenza che appartiene alla sua specie', () => {
      if (!char.subrace) return
      expect(specie!.subraces.some(s => s.id === char.subrace), char.subrace).toBe(true)
    })

    it('ha una sottoclasse della propria classe, e il livello per averla', () => {
      expect(char.subclass, 'nel 2024 la sottoclasse arriva al 3° livello').toBeTruthy()
      expect(cls!.subclasses.some(s => s.id === char.subclass), char.subclass).toBe(true)
      expect(char.level).toBeGreaterThanOrEqual(cls!.subclassLevel)
    })

    it('prende i bonus di caratteristica dal background, non dalla specie', () => {
      const somma = abilities.reduce((a, k) => a + (char.racialBonuses[k] || 0), 0)
      expect(somma, '+2 e +1 dal background').toBe(3)
      const toccate = abilities.filter(k => char.racialBonuses[k])
      expect(toccate).toHaveLength(2)
      for (const k of toccate) {
        expect(bg!.abilityScoreOptions, `${k} non è fra le opzioni di ${bg!.id}`).toContain(k)
      }
      expect(Object.values(char.racialBonuses).sort()).toEqual([1, 2])
    })

    it('porta il talento d’origine del proprio background', () => {
      expect(char.feat, 'nel 2024 il background dà un talento d’origine').toBeTruthy()
      const talento = dnd2024Feats.find(f => f.id === char.feat)
      expect(talento, char.feat).toBeDefined()
      expect(talento!.category).toBe('origin')
    })

    it('resta nell’acquisto a punti: nessun valore fuori da 8–15 prima dei bonus', () => {
      for (const k of abilities) {
        expect(char.abilityScores[k], k).toBeGreaterThanOrEqual(8)
        expect(char.abilityScores[k], k).toBeLessThanOrEqual(15)
      }
      const costo = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 } as Record<number, number>
      const speso = abilities.reduce((a, k) => a + costo[char.abilityScores[k]]!, 0)
      expect(speso, 'i 27 punti dell’acquisto a punti').toBe(27)
    })

    it('ha la taglia della sua specie', () => {
      expect(char.size).toBe(specie!.size)
    })

    it('elenca i privilegi di sottoclasse che ha sbloccato, e nessuno oltre', () => {
      const sub = cls!.subclasses.find(s => s.id === char.subclass)!
      const elencato = (n: string) => char.featuresTraits.some(t => t === n || t.startsWith(`${n}:`))
      for (const f of sub.features.filter(f => f.level <= char.level)) {
        expect(elencato(f.name), f.name).toBe(true)
      }
      const raggiunti = new Set(sub.features.filter(f => f.level <= char.level).map(f => f.name))
      for (const f of sub.features.filter(f => f.level > char.level)) {
        if (raggiunti.has(f.name)) continue
        expect(elencato(f.name), `${f.name} è sopra il ${char.level}° livello`).toBe(false)
      }
    })

    it('elenca i privilegi di classe che ha sbloccato, e nessuno oltre', () => {
      const elencato = (n: string) => char.featuresTraits.some(t => t === n || t.startsWith(`${n}:`))
      const dovuti = [...new Set(cls!.features.filter(f => f.level <= char.level).map(f => f.name))]
      for (const n of dovuti) expect(elencato(n), n).toBe(true)
      for (const f of cls!.features.filter(f => f.level > char.level)) {
        if (dovuti.includes(f.name)) continue
        expect(elencato(f.name), `${f.name} è sopra il ${char.level}° livello`).toBe(false)
      }
    })

    it('ha un nome italiano per la sua sottoclasse', () => {
      expect(subclassNamesIt[char.subclass], char.subclass).toBeTruthy()
    })
  })
})
