import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCharacterStore } from './character'
import type { CharacterData } from './character'
import { preloadVariantData } from '@/data'

function makeMinimalCharacter(overrides: Partial<CharacterData> = {}): Partial<CharacterData> {
  return {
    variant: 'dnd5e',
    race: 'human',
    className: 'fighter',
    level: 1,
    abilityScores: { str: 16, dex: 14, con: 13, int: 10, wis: 12, cha: 8 },
    ...overrides,
  }
}

describe('useCharacterStore', () => {
  // Preload data for tests that use getClasses/getMaxLevel
  beforeAll(async () => {
    await preloadVariantData('dnd5e')
  })

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('initialization', () => {
    it('starts with an empty character', () => {
      const store = useCharacterStore()
      expect(store.character.variant).toBe('dnd5e')
      expect(store.character.name).toBe('')
      expect(store.character.level).toBe(1)
      expect(store.character.abilityScores.str).toBe(10)
    })

    it('starts with empty saved characters', () => {
      const store = useCharacterStore()
      expect(store.savedCharacters).toEqual([])
    })

    it('starts with spellsKnownLimit 0 (use class default, decoupled from slots)', () => {
      const store = useCharacterStore()
      expect(store.character.spellsKnownLimit).toBe(0)
    })
  })

  describe('resetCharacter', () => {
    it('resets to default values with new id', () => {
      const store = useCharacterStore()
      const oldId = store.character.id
      store.character.name = 'Test'
      store.character.level = 5
      store.resetCharacter()
      expect(store.character.name).toBe('')
      expect(store.character.level).toBe(1)
      expect(store.character.id).not.toBe(oldId)
    })
  })

  describe('computed properties', () => {
    it('calculates ability modifiers correctly', () => {
      const store = useCharacterStore()
      store.character.abilityScores = { str: 16, dex: 14, con: 13, int: 10, wis: 12, cha: 8 }
      expect(store.abilityModifiers.str).toBe(3)
      expect(store.abilityModifiers.dex).toBe(2)
      expect(store.abilityModifiers.con).toBe(1)
      expect(store.abilityModifiers.int).toBe(0)
      expect(store.abilityModifiers.wis).toBe(1)
      expect(store.abilityModifiers.cha).toBe(-1)
    })

    it('includes racial bonuses in ability modifiers', () => {
      const store = useCharacterStore()
      store.character.abilityScores.str = 14 // mod +2
      store.character.racialBonuses = { str: 2 } // total 16, mod +3
      expect(store.abilityModifiers.str).toBe(3)
    })

    it('calculates proficiency bonus by level', () => {
      const store = useCharacterStore()
      store.character.level = 1
      expect(store.profBonus).toBe(2)
      store.character.level = 5
      expect(store.profBonus).toBe(3)
      store.character.level = 9
      expect(store.profBonus).toBe(4)
      store.character.level = 17
      expect(store.profBonus).toBe(6)
    })

    it('calculates armor class (10 + DEX mod)', () => {
      const store = useCharacterStore()
      store.character.abilityScores.dex = 16 // mod +3
      expect(store.armorClass).toBe(13)
    })

    it('calculates initiative from DEX mod', () => {
      const store = useCharacterStore()
      store.character.abilityScores.dex = 14
      expect(store.initiative).toBe(2)
    })

    it('calculates passive perception', () => {
      const store = useCharacterStore()
      store.character.abilityScores.wis = 14 // mod +2
      store.character.level = 1 // prof +2
      expect(store.passivePerception).toBe(12) // 10 + 2

      store.character.skillProficiencies = ['perception']
      expect(store.passivePerception).toBe(14) // 10 + 2 + 2
    })
  })

  describe('save/load/delete', () => {
    it('saves and loads a character', () => {
      const store = useCharacterStore()
      store.character.name = 'Gandalf'
      store.character.race = 'human'
      store.character.className = 'wizard'
      store.saveCharacter()

      expect(store.savedCharacters).toHaveLength(1)
      expect(store.savedCharacters[0]!.name).toBe('Gandalf')

      // Load into a fresh character
      store.resetCharacter()
      expect(store.character.name).toBe('')
      store.loadCharacter(store.savedCharacters[0]!.id)
      expect(store.character.name).toBe('Gandalf')
    })

    it('updates existing character on save', () => {
      const store = useCharacterStore()
      store.character.name = 'Gandalf'
      store.saveCharacter()
      expect(store.savedCharacters).toHaveLength(1)

      store.character.name = 'Gandalf the White'
      store.saveCharacter()
      expect(store.savedCharacters).toHaveLength(1)
      expect(store.savedCharacters[0]!.name).toBe('Gandalf the White')
    })

    it('deletes a character', () => {
      const store = useCharacterStore()
      store.character.name = 'ToDelete'
      store.saveCharacter()
      const id = store.savedCharacters[0]!.id
      expect(store.savedCharacters).toHaveLength(1)

      store.deleteCharacter(id)
      expect(store.savedCharacters).toHaveLength(0)
    })

    it('does nothing when loading non-existent id', () => {
      const store = useCharacterStore()
      store.character.name = 'Original'
      store.loadCharacter('non-existent-id')
      expect(store.character.name).toBe('Original')
    })
  })

  describe('exportJson / importJson', () => {
    it('exports valid JSON', () => {
      const store = useCharacterStore()
      store.character.name = 'Test'
      const json = store.exportJson()
      const parsed = JSON.parse(json)
      expect(parsed.name).toBe('Test')
      expect(parsed.variant).toBe('dnd5e')
    })

    it('imports valid character JSON', () => {
      const store = useCharacterStore()
      const json = JSON.stringify(makeMinimalCharacter({ name: 'Imported' }))
      const { data, warnings } = store.importJson(json)
      expect(data.name).toBe('Imported')
      expect(data.variant).toBe('dnd5e')
      expect(data.race).toBe('human')
      expect(warnings).toContain('WARN_NO_HP')
    })

    it('rejects invalid JSON string', () => {
      const store = useCharacterStore()
      expect(() => store.importJson('not json')).toThrow('JSON_PARSE_ERROR')
    })

    it('rejects non-object JSON', () => {
      const store = useCharacterStore()
      expect(() => store.importJson('"hello"')).toThrow('JSON_NOT_OBJECT')
      expect(() => store.importJson('[1,2]')).toThrow('JSON_NOT_OBJECT')
    })

    it('rejects missing variant', () => {
      const store = useCharacterStore()
      const json = JSON.stringify({ race: 'human', className: 'fighter', level: 1, abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 } })
      expect(() => store.importJson(json)).toThrow('VALIDATION:MISSING_VARIANT')
    })

    it('rejects missing race', () => {
      const store = useCharacterStore()
      const json = JSON.stringify({ variant: 'dnd5e', className: 'fighter', level: 1, abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 } })
      expect(() => store.importJson(json)).toThrow('MISSING_RACE')
    })

    it('rejects missing className', () => {
      const store = useCharacterStore()
      const json = JSON.stringify({ variant: 'dnd5e', race: 'human', level: 1, abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 } })
      expect(() => store.importJson(json)).toThrow('MISSING_CLASSNAME')
    })

    it('rejects invalid level', () => {
      const store = useCharacterStore()
      const json = JSON.stringify(makeMinimalCharacter({ level: 0 }))
      expect(() => store.importJson(json)).toThrow('INVALID_LEVEL')
    })

    it('rejects invalid ability scores', () => {
      const store = useCharacterStore()
      const json = JSON.stringify({
        ...makeMinimalCharacter(),
        abilityScores: { str: 0, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
      })
      expect(() => store.importJson(json)).toThrow('INVALID_ABILITY_SCORES')
    })

    it('warns about missing name and background', () => {
      const store = useCharacterStore()
      const json = JSON.stringify(makeMinimalCharacter())
      const { warnings } = store.importJson(json)
      expect(warnings).toContain('WARN_NO_NAME')
      expect(warnings).toContain('WARN_NO_BACKGROUND')
    })

    it('truncates long strings', () => {
      const store = useCharacterStore()
      const longStr = 'x'.repeat(6000)
      const json = JSON.stringify(makeMinimalCharacter({ name: longStr }))
      const { data } = store.importJson(json)
      expect(data.name.length).toBe(5000)
    })

    it('filters invalid array items', () => {
      const store = useCharacterStore()
      const json = JSON.stringify({
        ...makeMinimalCharacter(),
        skillProficiencies: ['athletics', 42, null, 'perception'],
      })
      const { data } = store.importJson(json)
      expect(data.skillProficiencies).toEqual(['athletics', 'perception'])
    })

    it('strips unknown properties (whitelist)', () => {
      const store = useCharacterStore()
      const json = JSON.stringify({
        ...makeMinimalCharacter(),
        maliciousField: '<script>alert(1)</script>',
      })
      const { data } = store.importJson(json)
      expect((data as any).maliciousField).toBeUndefined()
    })

    it('accepts all three variants', () => {
      const store = useCharacterStore()
      for (const variant of ['dnd5e', 'brancalonia', 'apocalisse'] as const) {
        const json = JSON.stringify(makeMinimalCharacter({ variant }))
        const { data } = store.importJson(json)
        expect(data.variant).toBe(variant)
      }
    })
  })

  describe('multiclass', () => {
    it('isMulticlass is false for single class', () => {
      const store = useCharacterStore()
      expect(store.isMulticlass).toBe(false)
    })

    it('only works for dnd5e variant', () => {
      const store = useCharacterStore()
      store.character.variant = 'brancalonia'
      store.character.className = 'fighter'
      store.addMulticlass('wizard')
      expect(store.character.classes).toHaveLength(0)
    })

    it('does not add the same class twice', () => {
      const store = useCharacterStore()
      store.character.variant = 'dnd5e'
      store.character.className = 'fighter'
      store.character.hitDie = 10
      store.character.level = 3
      store.addMulticlass('fighter') // same class
      // classes should have just the primary class entry
      expect(store.character.classes).toHaveLength(1)
    })
  })
})
