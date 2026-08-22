import { describe, it, expect } from 'vitest'
import { blogCharacters } from './characters'
import { races as dnd5eRaces } from '../dnd5e/races'
import { classes as dnd5eClasses } from '../dnd5e/classes'
import { subclassNamesIt } from '@/i18n/gameTerms'
import { totalHp, modifier } from '@/utils/calculations'
import type { AbilityScores } from '@/stores/character'

const characters = blogCharacters.filter(c => c.variant === 'dnd5e')
const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const

describe('dnd5e blog characters', () => {
  it('ships a non-empty roster with unique slugs', () => {
    expect(characters.length).toBeGreaterThan(0)
    const slugs = characters.map(c => c.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  describe.each(characters.map(c => [c.characterData.name, c] as const))('%s', (_name, entry) => {
    const char = entry.characterData
    const race = dnd5eRaces.find(r => r.id === char.race)
    const cls = dnd5eClasses.find(c => c.id === char.className)

    it('references a race and class that exist', () => {
      expect(race, char.race).toBeDefined()
      expect(cls, char.className).toBeDefined()
    })

    it('picks a subrace that belongs to its race, or none at all', () => {
      if (!char.subrace) return
      expect(race!.subraces.map(s => s.id), char.race).toContain(char.subrace)
    })

    /**
     * Impedisce il ritorno del difetto per cui 12 personaggi su 23 portavano un
     * id di sottoclasse del 2024 ('college-of-lore', 'the-fiend') che nei dati
     * del 2014 non esiste: revokeUnearnedSubclasses non lo trovava e azzerava
     * la sottoclasse, così i suoi privilegi sparivano dal riepilogo e dal PDF.
     */
    it('references a subclass that exists on its own class', () => {
      if (!char.subclass) return
      const sub = cls!.subclasses.find(s => s.id === char.subclass)
      expect(sub, `${char.className}/${char.subclass}`).toBeDefined()
    })

    it('has reached the level its subclass requires', () => {
      if (!char.subclass) return
      expect(char.level, `${char.className}/${char.subclass}`).toBeGreaterThanOrEqual(cls!.subclassLevel)
    })

    it('applies exactly the racial bonuses its race and subrace grant', () => {
      const fixed: Partial<AbilityScores> = { ...race!.abilityBonuses }
      const subrace = race!.subraces.find(s => s.id === char.subrace)
      for (const [k, v] of Object.entries(subrace?.abilityBonuses ?? {})) {
        fixed[k as keyof AbilityScores] = (fixed[k as keyof AbilityScores] ?? 0) + (v as number)
      }
      for (const a of abilities) {
        if (fixed[a]) expect(char.racialBonuses[a], a).toBe(fixed[a])
      }
      const expected = (race!.abilityScoreChoice ?? [])
        .reduce((sum, tier) => sum + tier.count * tier.amount, 0)
      const extra = abilities
        .filter(a => !fixed[a])
        .reduce((sum, a) => sum + (char.racialBonuses[a] ?? 0), 0)
      expect(extra).toBe(expected)
    })

    it('carries the size and hit die of its race and class', () => {
      expect(char.size).toBe(race!.size)
      expect(char.hitDie).toBe(cls!.hitDie)
      // La velocità può superare quella di base (un monaco è più rapido).
      expect(char.speed).toBeGreaterThanOrEqual(race!.speed)
    })

    it('has at least the hit points its class, level and Constitution imply', () => {
      const con = char.abilityScores.con + (char.racialBonuses.con ?? 0)
      const expected = totalHp(cls!.hitDie, modifier(con), char.level)
      // Un nano delle colline ne ha di più: Robustezza Nanica ne aggiunge 1 per livello.
      expect(char.maxHp).toBeGreaterThanOrEqual(expected)
      expect(char.currentHp).toBe(char.maxHp)
    })

    it('uses its class saving throws', () => {
      expect([...char.savingThrowProficiencies].sort()).toEqual([...cls!.savingThrows].sort())
    })

    it('lists the subclass features it has unlocked, and none above', () => {
      if (!char.subclass) return
      const sub = cls!.subclasses.find(s => s.id === char.subclass)!
      // La scheda può precisare l'opzione scelta ("Hunter's Prey: Colossus
      // Slayer"), quindi il nome del privilegio vale come prefisso.
      const listed = (name: string) =>
        char.featuresTraits.some(t => t === name || t.startsWith(`${name}:`))

      for (const f of sub.features.filter(f => f.level <= char.level)) {
        expect(listed(f.name), f.name).toBe(true)
      }
      const reachable = new Set(sub.features.filter(f => f.level <= char.level).map(f => f.name))
      for (const f of sub.features.filter(f => f.level > char.level)) {
        if (reachable.has(f.name)) continue
        expect(listed(f.name), `${f.name} is above level ${char.level}`).toBe(false)
      }
    })

    it('has an Italian name for its subclass', () => {
      if (!char.subclass) return
      expect(subclassNamesIt[char.subclass], char.subclass).toBeTruthy()
    })
  })
})
