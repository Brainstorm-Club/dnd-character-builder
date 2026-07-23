import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { GameVariant } from './app'
import { modifier, proficiencyBonus, hpPerLevel } from '@/utils/calculations'
import { getMaxLevel, getClasses } from '@/data'

export interface AbilityScores {
  str: number
  dex: number
  con: number
  int: number
  wis: number
  cha: number
}

export interface Weapon {
  name: string
  attackBonus: number
  damage: string
}

export interface ClassEntry {
  classId: string
  subclass: string
  level: number
  hitDie: number
}

export interface CharacterData {
  id: string
  variant: GameVariant
  name: string
  playerName: string
  race: string
  subrace: string
  className: string
  subclass: string
  level: number
  background: string
  alignment: string
  experiencePoints: number
  abilityScores: AbilityScores
  racialBonuses: Partial<AbilityScores>
  skillProficiencies: string[]
  skillExpertise: string[]
  savingThrowProficiencies: string[]
  languages: string[]
  proficienciesOther: string[]
  weapons: Weapon[]
  armor: string
  shield: boolean
  equipment: string[]
  coins: { cp: number; sp: number; ep: number; gp: number; pp: number }
  personalityTraits: string
  ideals: string
  bonds: string
  flaws: string
  featuresTraits: string[]
  backstory: string
  age: string
  height: string
  weight: string
  eyes: string
  hair: string
  skin: string
  allies: string
  treasure: string
  spellcastingClass: string
  spellcastingAbility: string
  cantrips: string[]
  spellsKnown: string[]
  /**
   * How many spells the character may know. 0 = use the class default.
   * Decoupled from spell slots on purpose: a level-1 wizard can know more
   * spells than they have slots to cast. Set via roll (1d4/level), manual
   * entry, or auto-selection in the spells step. Optional/undefined = default.
   */
  spellsKnownLimit?: number
  spellsPrepared: string[]
  hitDie: number
  maxHp: number
  currentHp: number
  tempHp: number
  speed: number
  // Brancalonia specific
  brawlingMoves: string[]
  misdeeds: string
  size: string
  whacksLevel: number
  // Apocalisse specific
  mark: string
  markSpirit: string
  virtue: string
  sin: string
  humanity: number
  // Session notes
  sessionNotes: string
  // Multiclass (D&D 5e only) — empty array = single class
  classes: ClassEntry[]
}

function createEmptyCharacter(): CharacterData {
  return {
    id: crypto.randomUUID(),
    variant: 'dnd5e',
    name: '',
    playerName: '',
    race: '',
    subrace: '',
    className: '',
    subclass: '',
    level: 1,
    background: '',
    alignment: '',
    experiencePoints: 0,
    abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    racialBonuses: {},
    skillProficiencies: [],
    skillExpertise: [],
    savingThrowProficiencies: [],
    languages: [],
    proficienciesOther: [],
    weapons: [],
    armor: '',
    shield: false,
    equipment: [],
    coins: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    personalityTraits: '',
    ideals: '',
    bonds: '',
    flaws: '',
    featuresTraits: [],
    backstory: '',
    age: '',
    height: '',
    weight: '',
    eyes: '',
    hair: '',
    skin: '',
    allies: '',
    treasure: '',
    spellcastingClass: '',
    spellcastingAbility: '',
    cantrips: [],
    spellsKnown: [],
    spellsKnownLimit: 0,
    spellsPrepared: [],
    hitDie: 8,
    maxHp: 0,
    currentHp: 0,
    tempHp: 0,
    speed: 30,
    brawlingMoves: [],
    misdeeds: '',
    size: '',
    whacksLevel: 0,
    mark: '',
    markSpirit: '',
    virtue: '',
    sin: '',
    humanity: 10,
    sessionNotes: '',
    classes: [],
  }
}

export const useCharacterStore = defineStore('character', () => {
  const character = ref<CharacterData>(createEmptyCharacter())
  const savedCharacters = ref<CharacterData[]>([])

  // Migration: add new fields to existing saved characters
  // Runs as a watcher so it fires AFTER pinia-plugin-persistedstate hydrates from localStorage
  function migrateCharacters() {
    for (const c of savedCharacters.value) {
      if ((c as any).sessionNotes === undefined) (c as any).sessionNotes = ''
      if (!Array.isArray((c as any).classes)) (c as any).classes = []
      if (typeof (c as any).spellsKnownLimit !== 'number') (c as any).spellsKnownLimit = 0
    }
  }
  migrateCharacters()
  watch(savedCharacters, migrateCharacters, { once: true })

  // Computed derived stats
  const abilityModifiers = computed(() => ({
    str: modifier(totalAbilityScore('str')),
    dex: modifier(totalAbilityScore('dex')),
    con: modifier(totalAbilityScore('con')),
    int: modifier(totalAbilityScore('int')),
    wis: modifier(totalAbilityScore('wis')),
    cha: modifier(totalAbilityScore('cha')),
  }))

  const profBonus = computed(() => proficiencyBonus(character.value.level))

  const armorClass = computed(() => {
    // Base AC = 10 + DEX mod (unarmored)
    return 10 + abilityModifiers.value.dex
  })

  const initiative = computed(() => abilityModifiers.value.dex)

  const passivePerception = computed(() => {
    const base = 10 + abilityModifiers.value.wis
    const proficient = character.value.skillProficiencies.includes('perception')
    return base + (proficient ? profBonus.value : 0)
  })

  function totalAbilityScore(ability: keyof AbilityScores): number {
    const base = character.value.abilityScores[ability]
    const bonus = character.value.racialBonuses[ability] || 0
    return base + bonus
  }

  function resetCharacter() {
    character.value = createEmptyCharacter()
  }

  /** Maximum localStorage budget for saved characters (5 MB) */
  const MAX_STORAGE_BYTES = 5 * 1024 * 1024

  function saveCharacter() {
    const idx = savedCharacters.value.findIndex(c => c.id === character.value.id)
    const copy = JSON.parse(JSON.stringify(character.value))

    // Estimate storage size before saving
    const tentative = idx >= 0
      ? [...savedCharacters.value.slice(0, idx), copy, ...savedCharacters.value.slice(idx + 1)]
      : [...savedCharacters.value, copy]
    const estimatedSize = new Blob([JSON.stringify(tentative)]).size
    if (estimatedSize > MAX_STORAGE_BYTES) {
      throw new Error('STORAGE_LIMIT_EXCEEDED')
    }

    if (idx >= 0) {
      savedCharacters.value[idx] = copy
    } else {
      savedCharacters.value.push(copy)
    }
  }

  function loadCharacter(id: string) {
    const found = savedCharacters.value.find(c => c.id === id)
    if (found) {
      character.value = JSON.parse(JSON.stringify(found))
    }
  }

  function deleteCharacter(id: string) {
    savedCharacters.value = savedCharacters.value.filter(c => c.id !== id)
  }

  /** Whether current character is multiclass */
  const isMulticlass = computed(() => (character.value.classes ?? []).length >= 2)

  /**
   * Add a second (or third, etc.) class to the current D&D 5e character.
   * Only works for dnd5e variant.
   */
  function addMulticlass(classId: string) {
    const char = character.value
    if (char.variant !== 'dnd5e') return

    const allClasses = getClasses(char.variant)
    const newCls = allClasses.find(c => c.id === classId)
    if (!newCls) return

    // If classes array is empty, populate with current primary class first
    if (char.classes.length === 0) {
      char.classes.push({
        classId: char.className,
        subclass: char.subclass,
        level: char.level,
        hitDie: char.hitDie,
      })
    }

    // Don't add the same class twice
    if (char.classes.some(c => c.classId === classId)) return

    // Add the new class at level 1
    char.classes.push({
      classId,
      subclass: '',
      level: 1,
      hitDie: newCls.hitDie,
    })

    // Recalculate total level
    char.level = char.classes.reduce((sum, c) => sum + c.level, 0)

    // Recalculate HP for the new level 1 in new class
    const conMod = modifier(
      char.abilityScores.con + (char.racialBonuses.con || 0),
    )
    char.maxHp += hpPerLevel(newCls.hitDie, conMod)
    char.currentHp = char.maxHp
  }

  /**
   * Remove a secondary class from multiclass.
   * Cannot remove the primary class.
   */
  function removeMulticlass(classId: string) {
    const char = character.value
    if (char.classes.length < 2) return
    // Don't remove primary class
    if (char.classes[0]?.classId === classId) return

    char.classes = char.classes.filter(c => c.classId !== classId)

    // If only one class remains, keep classes populated (it's still valid)
    // Recalculate total level
    char.level = char.classes.reduce((sum, c) => sum + c.level, 0)

    // Recalculate total HP from scratch
    const conMod = modifier(
      char.abilityScores.con + (char.racialBonuses.con || 0),
    )
    let hp = 0
    for (let i = 0; i < char.classes.length; i++) {
      const entry = char.classes[i]!
      for (let lv = 1; lv <= entry.level; lv++) {
        if (i === 0 && lv === 1) {
          // First class, first level: max hit die + CON
          hp += entry.hitDie + conMod
        } else {
          hp += hpPerLevel(entry.hitDie, conMod)
        }
      }
    }
    char.maxHp = Math.max(hp, 1)
    char.currentHp = char.maxHp
  }

  /**
   * Level up the current character.
   * For multiclass characters, pass the classId to level up in.
   * Returns { hpGained, newFeatures } or null if at max level.
   */
  function levelUp(classId?: string): { hpGained: number; newFeatures: string[] } | null {
    const char = character.value
    const maxLv = getMaxLevel(char.variant)
    if (char.level >= maxLv) return null

    const conMod = modifier(
      char.abilityScores.con + (char.racialBonuses.con || 0),
    )
    const allClasses = getClasses(char.variant)
    let hitDieForLevel: number
    let targetClassId: string
    let targetSubclass: string

    if (char.classes.length >= 2 && classId) {
      // Multiclass: level up specific class
      const entry = char.classes.find(c => c.classId === classId)
      if (!entry) return null
      entry.level += 1
      char.level = char.classes.reduce((sum, c) => sum + c.level, 0)
      hitDieForLevel = entry.hitDie
      targetClassId = entry.classId
      targetSubclass = entry.subclass
    } else {
      // Single class or multiclass without specific target
      char.level += 1
      hitDieForLevel = char.hitDie
      targetClassId = char.className
      targetSubclass = char.subclass

      // Also update classes array entry if populated
      if (char.classes.length >= 1) {
        const entry = char.classes.find(c => c.classId === char.className)
        if (entry) entry.level += 1
      }
    }

    // HP gain: hitDie/2 + 1 + CON modifier
    const hpGained = hpPerLevel(hitDieForLevel, conMod)
    char.maxHp += hpGained
    char.currentHp = char.maxHp

    // Gather new features from the class/subclass leveled up
    const newFeatures: string[] = []
    const cls = allClasses.find(c => c.id === targetClassId)
    if (cls) {
      // Use the class-specific level for features
      const classLevel = char.classes.length >= 2
        ? (char.classes.find(c => c.classId === targetClassId)?.level ?? char.level)
        : char.level
      const classFeats = cls.features.filter(f => f.level === classLevel)
      for (const feat of classFeats) {
        if (!char.featuresTraits.includes(feat.name)) {
          char.featuresTraits.push(feat.name)
          newFeatures.push(feat.name)
        }
      }
      // Subclass features
      if (targetSubclass) {
        const sub = cls.subclasses.find(s => s.id === targetSubclass)
        if (sub) {
          const subFeats = sub.features.filter(f => f.level === classLevel)
          for (const feat of subFeats) {
            if (!char.featuresTraits.includes(feat.name)) {
              char.featuresTraits.push(feat.name)
              newFeatures.push(feat.name)
            }
          }
        }
      }
    }

    // Auto-save if the character exists in saved list
    const idx = savedCharacters.value.findIndex(c => c.id === char.id)
    if (idx >= 0) {
      savedCharacters.value[idx] = JSON.parse(JSON.stringify(char))
    }

    return { hpGained, newFeatures }
  }

  function levelDown(classId?: string): { hpLost: number; removedFeatures: string[] } | null {
    const char = character.value
    if (char.level <= 1) return null

    const conMod = modifier(
      char.abilityScores.con + (char.racialBonuses.con || 0),
    )
    const allClasses = getClasses(char.variant)
    let hitDieForLevel: number
    let targetClassId: string
    let targetSubclass: string
    let removedClassLevel: number

    if (char.classes.length >= 2 && classId) {
      // Multiclass: level down specific class
      const entry = char.classes.find(c => c.classId === classId)
      if (!entry || entry.level <= 1) return null
      removedClassLevel = entry.level
      entry.level -= 1
      char.level = char.classes.reduce((sum, c) => sum + c.level, 0)
      hitDieForLevel = entry.hitDie
      targetClassId = entry.classId
      targetSubclass = entry.subclass
    } else {
      // Single class or multiclass without specific target
      removedClassLevel = char.level
      char.level -= 1
      hitDieForLevel = char.hitDie
      targetClassId = char.className
      targetSubclass = char.subclass

      // Also update classes array entry if populated
      if (char.classes.length >= 1) {
        const entry = char.classes.find(c => c.classId === char.className)
        if (entry) entry.level -= 1
      }
    }

    // Reverse the HP gained for the removed level (deterministic formula)
    const hpLost = hpPerLevel(hitDieForLevel, conMod)
    char.maxHp = Math.max(1, char.maxHp - hpLost)
    char.currentHp = Math.min(char.currentHp, char.maxHp)

    // Remove the features that were granted at the removed level
    const removedFeatures: string[] = []
    const cls = allClasses.find(c => c.id === targetClassId)
    if (cls) {
      const classFeats = cls.features.filter(f => f.level === removedClassLevel)
      for (const feat of classFeats) {
        const i = char.featuresTraits.indexOf(feat.name)
        if (i >= 0) {
          char.featuresTraits.splice(i, 1)
          removedFeatures.push(feat.name)
        }
      }
      if (targetSubclass) {
        const sub = cls.subclasses.find(s => s.id === targetSubclass)
        if (sub) {
          const subFeats = sub.features.filter(f => f.level === removedClassLevel)
          for (const feat of subFeats) {
            const i = char.featuresTraits.indexOf(feat.name)
            if (i >= 0) {
              char.featuresTraits.splice(i, 1)
              removedFeatures.push(feat.name)
            }
          }
        }
      }
    }

    // Auto-save if the character exists in saved list
    const idx = savedCharacters.value.findIndex(c => c.id === char.id)
    if (idx >= 0) {
      savedCharacters.value[idx] = JSON.parse(JSON.stringify(char))
    }

    return { hpLost, removedFeatures }
  }

  function exportJson(): string {
    return JSON.stringify(character.value, null, 2)
  }

  /**
   * Validates and imports a JSON character.
   * Returns { data, warnings } on success, throws with user-friendly messages on failure.
   */
  function importJson(json: string): { data: CharacterData; warnings: string[] } {
    let raw: Record<string, unknown>
    try {
      raw = JSON.parse(json)
    } catch {
      throw new Error('JSON_PARSE_ERROR')
    }

    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
      throw new Error('JSON_NOT_OBJECT')
    }

    const warnings: string[] = []
    const errors: string[] = []

    // Validate variant
    const validVariants = ['dnd5e', 'brancalonia', 'apocalisse']
    if (!raw.variant || !validVariants.includes(raw.variant as string)) {
      errors.push('MISSING_VARIANT')
    }

    // Validate required string fields
    const requiredStrings: (keyof CharacterData)[] = ['race', 'className']
    for (const field of requiredStrings) {
      if (!raw[field] || typeof raw[field] !== 'string' || (raw[field] as string).trim() === '') {
        errors.push(`MISSING_${field.toUpperCase()}`)
      }
    }

    // Validate level
    if (raw.level === undefined || typeof raw.level !== 'number' || raw.level < 1 || raw.level > 20) {
      errors.push('INVALID_LEVEL')
    }

    // Validate ability scores
    const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const
    if (!raw.abilityScores || typeof raw.abilityScores !== 'object') {
      errors.push('MISSING_ABILITY_SCORES')
    } else {
      const scores = raw.abilityScores as Record<string, unknown>
      for (const ab of abilities) {
        if (typeof scores[ab] !== 'number' || (scores[ab] as number) < 1 || (scores[ab] as number) > 30) {
          errors.push('INVALID_ABILITY_SCORES')
          break
        }
      }
    }

    // Validate arrays that should be arrays
    const arrayFields: (keyof CharacterData)[] = [
      'skillProficiencies', 'languages', 'equipment', 'featuresTraits',
      'cantrips', 'spellsKnown', 'spellsPrepared', 'weapons', 'classes',
    ]
    for (const field of arrayFields) {
      if (raw[field] !== undefined && !Array.isArray(raw[field])) {
        errors.push(`INVALID_${field.toUpperCase()}`)
      }
    }

    if (errors.length > 0) {
      throw new Error('VALIDATION:' + errors.join(','))
    }

    // Build a valid character, filling in defaults for missing optional fields
    // Only copy known CharacterData properties (whitelist approach)
    const empty = createEmptyCharacter()
    const allowedKeys = new Set(Object.keys(empty))
    const safeRaw: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(raw)) {
      if (allowedKeys.has(key)) safeRaw[key] = value
    }

    // Deep-validate array contents: string arrays should contain only strings
    const stringArrayFields = [
      'skillProficiencies', 'skillExpertise', 'savingThrowProficiencies',
      'languages', 'proficienciesOther', 'equipment', 'featuresTraits',
      'cantrips', 'spellsKnown', 'spellsPrepared', 'brawlingMoves',
    ] as const
    for (const field of stringArrayFields) {
      if (Array.isArray(safeRaw[field])) {
        safeRaw[field] = (safeRaw[field] as unknown[]).filter(
          (item): item is string => typeof item === 'string' && item.length < 500
        )
      }
    }

    // Validate weapons array contents
    if (Array.isArray(safeRaw.weapons)) {
      safeRaw.weapons = (safeRaw.weapons as unknown[]).filter((w): w is Weapon =>
        typeof w === 'object' && w !== null &&
        typeof (w as Record<string, unknown>).name === 'string' &&
        typeof (w as Record<string, unknown>).damage === 'string'
      )
    }

    // Validate classes array contents
    if (Array.isArray(safeRaw.classes)) {
      safeRaw.classes = (safeRaw.classes as unknown[]).filter((c): c is ClassEntry =>
        typeof c === 'object' && c !== null &&
        typeof (c as Record<string, unknown>).classId === 'string' &&
        typeof (c as Record<string, unknown>).level === 'number'
      )
    }

    // Truncate long strings to prevent abuse
    for (const [key, value] of Object.entries(safeRaw)) {
      if (typeof value === 'string' && value.length > 5000) {
        safeRaw[key] = (value as string).slice(0, 5000)
      }
    }

    const data: CharacterData = {
      ...empty,
      ...(safeRaw as Partial<CharacterData>),
      id: (typeof raw.id === 'string' && raw.id.length < 100) ? raw.id : crypto.randomUUID(),
      variant: raw.variant as GameVariant,
    }

    // Add warnings for optional missing fields
    if (!data.name) warnings.push('WARN_NO_NAME')
    if (!data.background) warnings.push('WARN_NO_BACKGROUND')
    if (data.maxHp <= 0) warnings.push('WARN_NO_HP')

    character.value = data
    return { data, warnings }
  }

  return {
    character,
    savedCharacters,
    abilityModifiers,
    profBonus,
    armorClass,
    initiative,
    passivePerception,
    totalAbilityScore,
    resetCharacter,
    saveCharacter,
    loadCharacter,
    deleteCharacter,
    isMulticlass,
    addMulticlass,
    removeMulticlass,
    levelUp,
    levelDown,
    exportJson,
    importJson,
  }
}, {
  persist: {
    pick: ['savedCharacters'],
  },
})
