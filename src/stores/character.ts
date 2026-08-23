import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { GameVariant } from './app'
import { GAME_VARIANTS } from './app'
import { modifier, proficiencyBonus, hpPerLevel, totalHp, computeArmorClass } from '@/utils/calculations'
import { getMaxLevel, getClasses, getRaces } from '@/data'

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
  /** Talento razziale scelto (Brancalonia: tratto feat-choice). Assente nelle schede salvate prima della sua introduzione. */
  feat?: string
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
    feat: '',
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

/**
 * Clamp a character to its variant's maximum level.
 * Needed for characters saved before a variant's cap was lowered (Brancalonia
 * went from 10 to 6): an out-of-range level breaks the wizard's level control
 * and makes levelUp() silently refuse. Only the level fields are touched --
 * maxHp and featuresTraits are left as saved so nothing the player earned is
 * silently thrown away; they can be reconciled with the level-down control.
 */
export function clampToMaxLevel(char: CharacterData): boolean {
  const maxLv = getMaxLevel(char.variant)
  if (char.level <= maxLv) return false

  char.level = maxLv
  const entries = char.classes ?? []
  if (entries.length > 0) {
    // Trim from the last class entry backwards until the total fits the cap.
    let excess = entries.reduce((sum, e) => sum + e.level, 0) - maxLv
    for (let i = entries.length - 1; i >= 0 && excess > 0; i--) {
      const entry = entries[i]!
      const removable = Math.min(excess, entry.level - 1)
      entry.level -= removable
      excess -= removable
    }
    // With more classes than the cap allows, every entry is already at 1 and
    // nothing above is removable: drop whole entries from the end instead.
    while (excess > 0 && entries.length > 1) {
      excess -= entries.pop()!.level
    }
    char.level = Math.min(entries.reduce((sum, e) => sum + e.level, 0), maxLv)
  }
  return true
}

/**
 * Voci di classe da cui derivano privilegi e sottoclassi: le entrate del
 * multiclasse se ce n'è più di una, altrimenti la sola classe principale.
 */
function classEntriesOf(char: CharacterData): { classId: string; subclass: string; level: number }[] {
  if (char.classes.length >= 2) {
    return char.classes.map(c => ({ classId: c.classId, subclass: c.subclass, level: c.level }))
  }
  return [{ classId: char.className, subclass: char.subclass, level: char.level }]
}

/** Tratti concessi dalla specie e dalla sottorazza del personaggio. */
function racialTraitsOf(char: CharacterData): string[] {
  const race = getRaces(char.variant).find(r => r.id === char.race)
  if (!race) return []
  const subrace = race.subraces.find(s => s.id === char.subrace)
  return [...race.traits, ...(subrace?.traits ?? [])]
}

/**
 * Elenco dei privilegi spettanti al personaggio così com'è adesso: i tratti di
 * specie e sottorazza, poi per ogni classe quelli fino al livello raggiunto in
 * quella classe, seguiti da quelli della sua sottoclasse.
 *
 * Unica fonte di verità per syncClassAndLevel, levelUp e levelDown: finché i
 * tre percorsi ricostruiscono la stessa lista, salire e riscendere di livello
 * resta un'operazione reversibile. I tratti razziali sono ricalcolati e non
 * solo conservati perché la procedura guidata non li ha mai scritti: senza,
 * un elfo restava senza Scurovisione tanto nel riepilogo quanto nel PDF.
 */
function computeFeatures(char: CharacterData): string[] {
  const allClasses = getClasses(char.variant)
  const out: string[] = [...racialTraitsOf(char)]
  for (const entry of classEntriesOf(char)) {
    const cls = allClasses.find(c => c.id === entry.classId)
    if (!cls) continue
    out.push(...cls.features.filter(f => f.level <= entry.level).map(f => f.name))
    const sub = cls.subclasses.find(s => s.id === entry.subclass)
    if (sub) out.push(...sub.features.filter(f => f.level <= entry.level).map(f => f.name))
  }
  return out
}

/**
 * Toglie le sottoclassi che il personaggio non ha (più) il livello per avere,
 * sulla classe principale e su ogni voce del multiclasse.
 */
function revokeUnearnedSubclasses(char: CharacterData): void {
  const allClasses = getClasses(char.variant)
  const primary = allClasses.find(c => c.id === char.className)
  if (primary) {
    const primaryLevel = char.classes.length >= 2
      ? (char.classes.find(c => c.classId === char.className)?.level ?? char.level)
      : char.level
    const chosen = primary.subclasses.find(s => s.id === char.subclass)
    if (char.subclass && (!chosen || primaryLevel < primary.subclassLevel)) char.subclass = ''
  }
  for (const entry of char.classes) {
    const cls = allClasses.find(c => c.id === entry.classId)
    if (!cls) continue
    const chosen = cls.subclasses.find(s => s.id === entry.subclass)
    if (entry.subclass && (!chosen || entry.level < cls.subclassLevel)) entry.subclass = ''
  }
}

/** Differenza fra due liste di privilegi, ripetizioni comprese. */
function featureDiff(from: string[], to: string[]): string[] {
  const pool = [...to]
  const out: string[] = []
  for (const name of from) {
    const i = pool.indexOf(name)
    if (i >= 0) pool.splice(i, 1)
    else out.push(name)
  }
  return out
}

/**
 * Porta una singola scheda allo schema corrente. Estratta perché non è più solo
 * l'archivio a tornare dal localStorage: anche il personaggio in corso viene
 * persistito, e senza questa funzione applicata a entrambi rientrava dallo
 * storage un oggetto che nessuna migrazione toccava.
 */
function migrateOne(c: CharacterData) {
  if ((c as any).sessionNotes === undefined) (c as any).sessionNotes = ''
  if (!Array.isArray((c as any).classes)) (c as any).classes = []
  if (typeof (c as any).spellsKnownLimit !== 'number') (c as any).spellsKnownLimit = 0
  clampToMaxLevel(c)
}

/**
 * Meccanica della salita di livello, staccata dallo store perché deve poter
 * agire tanto sul personaggio in corso quanto su una scheda dell'archivio:
 * far salire di livello una scheda salvata passando da `loadCharacter`
 * sovrascriveva il personaggio che l'utente stava costruendo.
 */
function applyLevelUp(char: CharacterData, classId?: string): { hpGained: number; newFeatures: string[] } | null {
  const maxLv = getMaxLevel(char.variant)
  if (char.level >= maxLv) return null

  const conMod = modifier(char.abilityScores.con + (char.racialBonuses.con || 0))
  let hitDieForLevel: number

  if (char.classes.length >= 2 && classId) {
    // Multiclass: level up specific class
    const entry = char.classes.find(c => c.classId === classId)
    if (!entry) return null
    entry.level += 1
    char.level = char.classes.reduce((sum, c) => sum + c.level, 0)
    hitDieForLevel = entry.hitDie
  } else {
    // Single class or multiclass without specific target
    char.level += 1
    hitDieForLevel = char.hitDie

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

  // Ricostruisce l'elenco dei privilegi invece di aggiungere quelli nuovi:
  // così le voci che si ripetono a livelli diversi (Aumento dei Punteggi di
  // Caratteristica, Attacco Extra, i privilegi d'archetipo) vengono contate
  // tutte, e la lista resta identica a quella di syncClassAndLevel.
  const before = [...char.featuresTraits]
  char.featuresTraits = computeFeatures(char)
  const newFeatures = featureDiff(char.featuresTraits, before)

  return { hpGained, newFeatures }
}

export const useCharacterStore = defineStore('character', () => {
  const character = ref<CharacterData>(createEmptyCharacter())
  const savedCharacters = ref<CharacterData[]>([])

  // Migration: add new fields to existing saved characters
  // Runs as a watcher so it fires AFTER pinia-plugin-persistedstate hydrates from localStorage
  function migrateCharacters() {
    for (const c of savedCharacters.value) migrateOne(c)
  }
  migrateCharacters()
  // Not `{ once: true }`: another tab or a manual restore can replace the
  // store later, and that batch needs migrating too.
  watch(savedCharacters, migrateCharacters)

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

  const armorClass = computed(() => computeArmorClass(character.value))

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

  /**
   * Il personaggio in corso ha qualcosa che andrebbe perso a sostituirlo?
   * Unica fonte di verità per chi deve chiedere conferma prima di azzerarlo.
   */
  const hasUnsavedWork = computed(() => {
    const c = character.value
    if (!(c.race || c.className || c.name)) return false
    return !savedCharacters.value.some(s => s.id === c.id)
  })

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

    // I privilegi vanno ricostruiti come fanno setSubclass, levelUp e
    // levelDown: senza, la nuova classe non porta in dote nemmeno il proprio
    // 1° livello, e il riepilogo resta a quelli della sola classe di partenza
    revokeUnearnedSubclasses(char)
    char.featuresTraits = computeFeatures(char)
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

    // Come in addMulticlass: togliere la classe deve togliere anche i suoi
    // privilegi, altrimenti restano nel riepilogo e finiscono sulla scheda
    revokeUnearnedSubclasses(char)
    char.featuresTraits = computeFeatures(char)
  }

  /**
   * Choose (or clear) the subclass of a class the character already has.
   * Pass a classId to target a multiclass entry; omit it for the primary class.
   * Features of the previous subclass are removed and the new subclass grants
   * every feature up to the character's level in that class — the same rule
   * levelUp() applies one level at a time.
   * Returns { newFeatures, removedFeatures } or null if the class is unknown.
   */
  function setSubclass(
    subclassId: string,
    classId?: string,
  ): { newFeatures: string[]; removedFeatures: string[] } | null {
    const char = character.value
    const targetClassId = classId ?? char.className
    if (!targetClassId) return null

    const cls = getClasses(char.variant).find(c => c.id === targetClassId)
    if (!cls) return null
    // Reject unknown subclass ids ('' clears the current choice)
    if (subclassId && !cls.subclasses.some(s => s.id === subclassId)) return null

    const entry = char.classes.find(c => c.classId === targetClassId)

    if (entry) entry.subclass = subclassId
    if (targetClassId === char.className) char.subclass = subclassId

    // Ricostruzione, non aggiunta per nome: deduplicando si perdeva la seconda
    // occorrenza di un privilegio che classe e sottoclasse portano entrambe
    // allo stesso livello (Pact Boon del warlock e di Lilith in Apocalisse), e
    // la lista finiva diversa da quella di syncClassAndLevel.
    const before = [...char.featuresTraits]
    char.featuresTraits = computeFeatures(char)
    const newFeatures = featureDiff(char.featuresTraits, before)
    const removedFeatures = featureDiff(before, char.featuresTraits)

    // Auto-save if the character exists in saved list
    const idx = savedCharacters.value.findIndex(c => c.id === char.id)
    if (idx >= 0) {
      savedCharacters.value[idx] = JSON.parse(JSON.stringify(char))
    }

    return { newFeatures, removedFeatures }
  }

  /**
   * Level up the current character.
   * For multiclass characters, pass the classId to level up in.
   * Returns { hpGained, newFeatures } or null if at max level.
   */
  /**
   * Rebuild everything that depends on class and level in one shot.
   *
   * The wizard now asks for the level before the class exists, so walking
   * levelUp() up from 1 is not an option. This recomputes the hit die, the hit
   * points and the granted features from scratch, and revokes a subclass the
   * character is no longer high enough for. Safe to call repeatedly.
   */
  function syncClassAndLevel() {
    const char = character.value
    char.level = Math.min(Math.max(Math.round(char.level) || 1, 1), getMaxLevel(char.variant))
    const cls = getClasses(char.variant).find(c => c.id === char.className)
    if (!cls) return

    char.hitDie = cls.hitDie
    revokeUnearnedSubclasses(char)
    char.featuresTraits = computeFeatures(char)

    const conMod = modifier(char.abilityScores.con + (char.racialBonuses.con || 0))
    char.maxHp = totalHp(cls.hitDie, conMod, char.level)
    char.currentHp = char.maxHp
  }

  function levelUp(classId?: string): { hpGained: number; newFeatures: string[] } | null {
    const char = character.value
    const result = applyLevelUp(char, classId)
    if (!result) return null

    // Auto-save if the character exists in saved list
    const idx = savedCharacters.value.findIndex(c => c.id === char.id)
    if (idx >= 0) {
      savedCharacters.value[idx] = JSON.parse(JSON.stringify(char))
    }

    return result
  }

  /**
   * Sale di livello una scheda dell'archivio senza renderla il personaggio in
   * corso. L'elenco personaggi chiamava `loadCharacter` prima di `levelUp`, e
   * così un clic su "Sali di Livello" buttava via il personaggio in
   * costruzione senza chiedere niente.
   */
  function levelUpSaved(id: string, classId?: string): { hpGained: number; newFeatures: string[] } | null {
    const idx = savedCharacters.value.findIndex(c => c.id === id)
    if (idx < 0) return null

    const updated: CharacterData = JSON.parse(JSON.stringify(savedCharacters.value[idx]))
    const result = applyLevelUp(updated, classId)
    if (!result) return null

    savedCharacters.value[idx] = updated
    // Se per caso è proprio la scheda aperta nel wizard, va tenuta allineata:
    // altrimenti il prossimo salvataggio riscriverebbe il livello vecchio.
    if (character.value.id === id) {
      character.value = JSON.parse(JSON.stringify(updated))
    }

    return result
  }

  function levelDown(classId?: string): { hpLost: number; removedFeatures: string[] } | null {
    const char = character.value
    if (char.level <= 1) return null

    const conMod = modifier(
      char.abilityScores.con + (char.racialBonuses.con || 0),
    )
    let hitDieForLevel: number

    if (char.classes.length >= 2 && classId) {
      // Multiclass: level down specific class
      const entry = char.classes.find(c => c.classId === classId)
      if (!entry || entry.level <= 1) return null
      entry.level -= 1
      char.level = char.classes.reduce((sum, c) => sum + c.level, 0)
      hitDieForLevel = entry.hitDie
    } else {
      // Single class or multiclass without specific target
      char.level -= 1
      hitDieForLevel = char.hitDie

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

    // Scendendo si può finire sotto il livello di sblocco della sottoclasse:
    // va revocata prima di ricalcolare i privilegi, altrimenti la scheda
    // continua a stampare un archetipo che il personaggio non ha più.
    revokeUnearnedSubclasses(char)

    // Ricostruzione, non rimozione per nome: cercare il nome cancellava
    // l'unica occorrenza rimasta di un privilegio ripetuto (un guerriero di 7°
    // ha due "Ability Score Improvement") anche quando spettava ancora.
    const before = [...char.featuresTraits]
    char.featuresTraits = computeFeatures(char)
    const removedFeatures = featureDiff(before, char.featuresTraits)

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
    if (!raw.variant || !(GAME_VARIANTS as readonly string[]).includes(raw.variant as string)) {
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

    // Characters exported before a variant's level cap was lowered are clamped,
    // not rejected, so an older sheet still imports.
    if (clampToMaxLevel(data)) warnings.push('WARN_LEVEL_CLAMPED')

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
    hasUnsavedWork,
    totalAbilityScore,
    resetCharacter,
    saveCharacter,
    loadCharacter,
    deleteCharacter,
    isMulticlass,
    addMulticlass,
    removeMulticlass,
    setSubclass,
    syncClassAndLevel,
    levelUp,
    levelUpSaved,
    levelDown,
    exportJson,
    importJson,
  }
}, {
  persist: {
    // `character` è persistito perché un ricaricamento a metà procedura
    // buttava via tutto il lavoro fatto fin lì.
    pick: ['savedCharacters', 'character'],
    // `$patch` fonde il personaggio campo per campo invece di sostituire il
    // ref, quindi un `watch` su `character` non scatterebbe mai: la migrazione
    // di ciò che rientra dallo storage va agganciata qui.
    afterHydrate: ({ store }) => {
      migrateOne((store as unknown as { character: CharacterData }).character)
    },
  },
})
