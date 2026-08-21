import { describe, it, expect } from 'vitest'
import { blogCharacters } from './characters'
import { brancaloniaRaces } from '../brancalonia/races'
import { brancaloniaSubclasses } from '../brancalonia/classes'
import { burattinaioBrancaloniaClass } from '../brancalonia/burattinaio'
import { classes as dnd5eClasses } from '../dnd5e/classes'
import { brancaloniaRules } from '../brancalonia/rules'
import { equipmentData } from '../dnd5e/equipment'
import { featureNamesIt, traitNamesIt, languageNamesIt, subclassNamesIt } from '@/i18n/gameTerms'
import { totalHp, modifier, proficiencyBonus } from '@/utils/calculations'
import type { AbilityScores } from '@/stores/character'

const characters = blogCharacters.filter(c => c.variant === 'brancalonia')
const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const

function classOf(id: string) {
  return id === 'burattinaio'
    ? burattinaioBrancaloniaClass
    : dnd5eClasses.find(c => c.id === id)
}

function subclassOf(classId: string, subclassId: string) {
  return classId === 'burattinaio'
    ? burattinaioBrancaloniaClass.subclasses.find(s => s.id === subclassId)
    : brancaloniaSubclasses.find(s => s.id === subclassId)
}

describe('brancalonia blog characters', () => {
  it('ships a non-empty roster with unique slugs', () => {
    expect(characters.length).toBeGreaterThan(0)
    const slugs = characters.map(c => c.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  describe.each(characters.map(c => [c.characterData.name, c] as const))('%s', (_name, entry) => {
    const char = entry.characterData
    const race = brancaloniaRaces.find(r => r.id === char.race)
    const cls = classOf(char.className)

    it('references a race and class that exist', () => {
      expect(race, char.race).toBeDefined()
      expect(cls, char.className).toBeDefined()
    })

    it('picks a subrace when its race has shapes to choose from', () => {
      if (race!.subraces.length === 0) {
        expect(char.subrace).toBe('')
      } else {
        expect(race!.subraces.map(s => s.id), char.race).toContain(char.subrace)
      }
    })

    it('references a subclass that exists on its own class', () => {
      if (!char.subclass) return
      const sub = subclassOf(char.className, char.subclass)
      expect(sub, `${char.className}/${char.subclass}`).toBeDefined()
    })

    it('applies exactly the racial bonuses its race and subrace grant', () => {
      const fixed: Partial<AbilityScores> = { ...race!.abilityBonuses }
      const subrace = race!.subraces.find(s => s.id === char.subrace)
      for (const [k, v] of Object.entries(subrace?.abilityBonuses ?? {})) {
        fixed[k as keyof AbilityScores] = (fixed[k as keyof AbilityScores] ?? 0) + (v as number)
      }
      // Every fixed bonus must be present at exactly its printed value...
      for (const a of abilities) {
        if (fixed[a]) expect(char.racialBonuses[a], a).toBe(fixed[a])
      }
      // ...and the free choices must add up to the right number of points.
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
      // Speed may exceed the racial base (a malebranche can pick Hellfeet).
      expect(char.speed).toBeGreaterThanOrEqual(race!.speed)
    })

    it('has the hit points its class, level and Constitution imply', () => {
      const con = char.abilityScores.con + (char.racialBonuses.con ?? 0)
      const expected = totalHp(cls!.hitDie, modifier(con), char.level)
      expect(char.maxHp).toBe(expected)
      expect(char.currentHp).toBe(expected)
    })

    it('uses its class saving throws', () => {
      expect([...char.savingThrowProficiencies].sort()).toEqual([...cls!.savingThrows].sort())
    })

    it('lists every racial trait plus the class and subclass features it has unlocked', () => {
      const subrace = race!.subraces.find(s => s.id === char.subrace)
      const sub = char.subclass ? subclassOf(char.className, char.subclass) : undefined
      const required = [
        ...race!.traits,
        ...(subrace?.traits ?? []),
        ...cls!.features.filter(f => f.level <= char.level).map(f => f.name),
        ...(sub?.features.filter(f => f.level <= char.level).map(f => f.name) ?? []),
      ]
      for (const r of required) {
        expect(char.featuresTraits, r).toContain(r)
      }
      // Nothing from a level the character has not reached yet
      const tooHigh = [
        ...cls!.features.filter(f => f.level > char.level).map(f => f.name),
        ...(sub?.features.filter(f => f.level > char.level).map(f => f.name) ?? []),
      ]
      for (const t of tooHigh) {
        expect(char.featuresTraits, `${t} is above level ${char.level}`).not.toContain(t)
      }
    })

    it('speaks only languages that exist in the setting', () => {
      const known = brancaloniaRules.languages.map(l => l.name)
      for (const lang of char.languages) {
        expect(known, lang).toContain(lang)
      }
      expect(char.languages).toContain('Vernacular')
    })

    it('wields weapons that exist, at the right attack bonus and damage', () => {
      const simple = equipmentData.simpleWeapons.map(w => w.name)
      const all = [...equipmentData.simpleWeapons, ...equipmentData.martialWeapons]
      const prof = proficiencyBonus(char.level)
      const mod = (a: keyof AbilityScores) =>
        modifier(char.abilityScores[a] + (char.racialBonuses[a] ?? 0))
      for (const w of char.weapons) {
        const data = w.name === 'Unarmed Strike'
          ? { damage: '1d4', properties: [] as string[] }
          : all.find(x => x.name === w.name)
        expect(data, w.name).toBeDefined()
        const props = data!.properties
        // Properties carry their ranges, e.g. 'ammunition (80/320)'
        const ranged = props.some(p => p.startsWith('ammunition'))
        // Martial Arts: a monk uses the better of STR and DEX for unarmed
        // strikes and monk weapons — simple melee weapons plus the shortsword.
        const monkWeapon = char.className === 'monk' && !ranged && (
          w.name === 'Unarmed Strike' ||
          ((simple.includes(w.name) || w.name === 'Shortsword') &&
            !props.includes('two-handed') && !props.includes('heavy')))
        const m = monkWeapon || (ranged || (props.includes('finesse') && mod('dex') > mod('str')))
          ? (monkWeapon ? Math.max(mod('str'), mod('dex')) : mod('dex'))
          : mod('str')
        expect(w.attackBonus, w.name).toBe(prof + m)
        expect(w.damage, w.name).toBe(m === 0 ? data!.damage : `${data!.damage}${m > 0 ? '+' : ''}${m}`)
      }
    })

    it('declares spellcasting only if its class actually casts', () => {
      if (cls!.spellcasting) return
      expect(char.spellcastingClass).toBe('')
      expect(char.cantrips).toEqual([])
      expect(char.spellsKnown).toEqual([])
      expect(char.spellsPrepared).toEqual([])
    })

    it('renders every feature, trait, language and subclass in Italian', () => {
      for (const f of char.featuresTraits) {
        expect(featureNamesIt[f] ?? traitNamesIt[f], f).toBeTruthy()
      }
      for (const l of char.languages) {
        expect(languageNamesIt[l], l).toBeTruthy()
      }
      if (char.subclass) expect(subclassNamesIt[char.subclass], char.subclass).toBeTruthy()
    })
  })
})
