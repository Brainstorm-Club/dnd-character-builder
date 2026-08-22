import type { CharacterData, AbilityScores, Weapon } from '@/stores/character'
import type { GameVariant } from '@/stores/app'
import type { AbilityKey, CharacterClass } from '@/data/dnd5e/classes'
import { getRaces, getClasses, getBackgrounds, getSpells, getSpellSlots, getCantripsKnown, getSpellsKnownCount, getAvailableLanguages, getMaxLevel, getApocalisseRules } from '@/data'
import { simpleWeapons, martialWeapons, armor as armorData } from '@/data/dnd5e/equipment'
import { rollAbilityScores } from './diceRoller'
import { modifier, totalHp, proficiencyBonus } from './calculations'
import { pickRandomArchetype } from '@/data/personalityArchetypes'
import { getFeatsByCategory } from '@/data/dnd2024/feats'

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

function pickN<T>(arr: readonly T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const FANTASY_NAMES = [
  'Aldric', 'Branwen', 'Cedric', 'Daeris', 'Elara', 'Faldorn', 'Gwendolyn', 'Hakon',
  'Isolde', 'Jareth', 'Kael', 'Lyra', 'Morwen', 'Nyx', 'Orion', 'Perrin',
  'Quara', 'Rowan', 'Seraphina', 'Theron', 'Ulric', 'Vexia', 'Wren', 'Xander',
  'Ysolde', 'Zephyr', 'Aelric', 'Brynn', 'Caelum', 'Dorin', 'Elowen', 'Fenris',
  'Grimm', 'Hestia', 'Iona', 'Jorah', 'Kyra', 'Lucian', 'Mira', 'Nolan',
]

const ALIGNMENTS = ['lg', 'ng', 'cg', 'ln', 'tn', 'cn', 'le', 'ne', 'ce']

const EYE_COLORS = ['Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Amber', 'Black', 'Violet', 'Gold', 'Red']
const HAIR_COLORS = ['Black', 'Brown', 'Blonde', 'Red', 'Auburn', 'White', 'Silver', 'Gray', 'Bald']
const SKIN_TONES = ['Fair', 'Light', 'Olive', 'Tan', 'Brown', 'Dark', 'Pale', 'Bronze', 'Copper', 'Green']

function getAvailableWeapons(cls: CharacterClass) {
  const available = [...([] as typeof simpleWeapons[number][])]
  const profNames = cls.weaponProficiencies.map(p => p.toLowerCase())

  if (profNames.some(p => p === 'simple')) available.push(...simpleWeapons)
  if (profNames.some(p => p === 'martial' || p === 'all')) available.push(...martialWeapons)

  // Add specific named weapons (e.g., Bard's rapier/longsword)
  for (const profName of profNames) {
    if (['simple', 'martial', 'all'].includes(profName)) continue
    const found = [...simpleWeapons, ...martialWeapons].find(
      w => w.name.toLowerCase() === profName,
    )
    if (found && !available.some(a => a.name === found.name)) {
      available.push(found)
    }
  }

  return available
}

function selectClassGear(
  cls: CharacterClass,
  strMod: number,
  dexMod: number,
  prof: number,
): { weapons: Weapon[]; armorName: string; useShield: boolean } {
  const armorProfs = cls.armorProficiencies
  const hasShieldProf = armorProfs.some(p => p.toLowerCase().includes('shield'))
  const isDexPrimary = cls.primaryAbility[0] === 'dex'
  const isCaster = cls.spellcasting !== null && cls.spellcasting.casterType !== 'third'

  // --- Armor ---
  let armorName = ''
  if (cls.id !== 'monk' && cls.id !== 'barbarian') {
    const hasHeavy = armorProfs.some(p => p.toLowerCase() === 'heavy')
    const hasMedium = armorProfs.some(p => p.toLowerCase() === 'medium')
    const hasLight = armorProfs.some(p => p.toLowerCase() === 'light')

    if (hasHeavy) {
      armorName = pick(armorData.filter(a => a.type === 'heavy')).name
    } else if (hasMedium) {
      armorName = pick(armorData.filter(a => a.type === 'medium')).name
    } else if (hasLight) {
      armorName = pick(armorData.filter(a => a.type === 'light')).name
    }
  }

  // --- Shield ---
  const useShield = hasShieldProf && !isDexPrimary && Math.random() > 0.4

  // --- Weapons ---
  const available = getAvailableWeapons(cls)
  const melee = available.filter(w => !w.properties.some(p => p.includes('ammunition')))
  const ranged = available.filter(w => w.properties.some(p => p.includes('ammunition')))
  const weapons: Weapon[] = []

  if (isDexPrimary) {
    // DEX class: finesse melee + ranged
    const finesse = melee.filter(w => w.properties.includes('finesse'))
    if (finesse.length > 0) {
      const w = pick(finesse)
      weapons.push({ name: w.name, attackBonus: prof + dexMod, damage: w.damage })
    }
    if (ranged.length > 0) {
      const w = pick(ranged)
      weapons.push({ name: w.name, attackBonus: prof + dexMod, damage: w.damage })
    }
  } else if (isCaster) {
    // Caster: simple melee weapon
    const casterMelee = melee.filter(w => simpleWeapons.some(sw => sw.name === w.name))
    if (casterMelee.length > 0) {
      const w = pick(casterMelee)
      const atkMod = w.properties.includes('finesse') ? Math.max(strMod, dexMod) : strMod
      weapons.push({ name: w.name, attackBonus: prof + atkMod, damage: w.damage })
    }
  } else {
    // STR-based martial
    const pool = useShield
      ? melee.filter(w => !w.properties.includes('two-handed'))
      : melee

    if (pool.length > 0) {
      const w = pick(pool)
      const atkMod = w.properties.includes('finesse') ? Math.max(strMod, dexMod) : strMod
      weapons.push({ name: w.name, attackBonus: prof + atkMod, damage: w.damage })
    }

    // Add a ranged option
    if (ranged.length > 0 && Math.random() > 0.3) {
      const w = pick(ranged)
      weapons.push({ name: w.name, attackBonus: prof + dexMod, damage: w.damage })
    }
  }

  return { weapons, armorName, useShield }
}

export function generateRandomCharacter(variant: GameVariant, forcedLevel?: number): CharacterData {
  const maxLevel = getMaxLevel(variant)
  // Random rolls stay in the 1-10 band for playability; the variant cap always wins.
  const level = Math.min(forcedLevel ?? randomInt(1, Math.min(maxLevel, 10)), maxLevel)

  // Pick random race
  const races = getRaces(variant)
  const race = pick(races)
  const subrace = race.subraces.length > 0 ? pick(race.subraces) : null

  // Pick random class
  const classes = getClasses(variant)
  const cls = pick(classes)
  const subclass = cls.subclasses.length > 0 && level >= cls.subclassLevel ? pick(cls.subclasses) : null

  // Roll ability scores and assign intelligently
  const { totals } = rollAbilityScores()
  const sortedScores = [...totals].sort((a, b) => b - a)
  const abilityScores = assignScoresSmartly(sortedScores, cls.primaryAbility)

  // Racial bonuses
  const racialBonuses: Partial<AbilityScores> = { ...race.abilityBonuses }
  if (subrace) {
    for (const [key, val] of Object.entries(subrace.abilityBonuses)) {
      const k = key as AbilityKey
      racialBonuses[k] = (racialBonuses[k] || 0) + (val || 0)
    }
  }

  // Handle ability score choices (e.g., Half-Elf gets +1 to two abilities of choice)
  if (race.abilityScoreChoice) {
    const allAbilities: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']
    // Each tier draws from the abilities no fixed bonus or earlier tier took.
    for (const tier of race.abilityScoreChoice) {
      const taken = Object.keys(racialBonuses) as AbilityKey[]
      const available = allAbilities.filter(a => !taken.includes(a))
      for (const a of pickN(available, tier.count)) {
        racialBonuses[a] = (racialBonuses[a] || 0) + tier.amount
      }
    }
  }

  // D&D 2024: l'umano prende un talento d'origine a scelta con Versatile.
  let originFeat = ''
  if (variant === 'dnd2024' && race.traits.includes('versatile')) {
    const origins = getFeatsByCategory('origin')
    if (origins.length) originFeat = pick(origins).id
  }

  // Pick random background.
  // In Apocalisse l'Origine è insieme razza e background — il manuale la
  // presenta proprio in formato background — quindi le due scelte devono
  // combaciare: un Risorto dal Limbo non può avere il background di un
  // Risorto dall'Inferno.
  const backgrounds = getBackgrounds(variant)
  const bg = variant === 'apocalisse'
    ? (backgrounds.find(b => b.id === race.id) ?? pick(backgrounds))
    : pick(backgrounds)

  // D&D 2024: è il background a dare i bonus di caratteristica, non la specie.
  // Elenca tre caratteristiche fra cui una sale di 2 e un'altra di 1.
  if (bg.abilityScoreOptions && bg.abilityScoreOptions.length >= 2) {
    const [major, minor] = pickN(bg.abilityScoreOptions, 2) as (keyof AbilityScores)[]
    if (major) racialBonuses[major] = (racialBonuses[major] || 0) + 2
    if (minor) racialBonuses[minor] = (racialBonuses[minor] || 0) + 1
  }

  // Skill proficiencies: from class + background (deduplicated)
  const classSkills = pickN(cls.skillChoices, cls.numSkillChoices)
  const allSkillIds = [...new Set([...classSkills, ...bg.skillProficiencies])]

  // Languages
  const allLanguages = getAvailableLanguages(variant)
  const raceLanguages = [...race.languages]
  const extraLanguages = pickN(
    allLanguages.filter(l => !raceLanguages.includes(l)),
    bg.languages,
  )
  const languages = [...raceLanguages, ...extraLanguages]

  // Apocalisse: ogni Ultimo ha una Virtù e un Peccato — nel manuale sostituiscono
  // l'allineamento, quindi non possono restare vuoti. Il Marchio invece è
  // facoltativo: non tutti sono penitenti del Trono o corrotti dell'Abisso.
  let apoVirtue = ''
  let apoSin = ''
  let apoMark = ''
  let apoSpirit = ''
  if (variant === 'apocalisse') {
    const rules = getApocalisseRules(variant)
    if (rules) {
      apoVirtue = pick(rules.virtues).id
      apoSin = pick(rules.sins).id
      if (Math.random() < 0.5) {
        const mark = pick(rules.marks)
        apoMark = mark.id
        apoSpirit = pick(mark.spirits).id
      }
    }
  }

  // Calculate HP
  const conTotal = abilityScores.con + (racialBonuses.con || 0)
  const conMod = modifier(conTotal)
  const maxHp = totalHp(cls.hitDie, conMod, level)
  const prof = proficiencyBonus(level)
  const strMod = modifier(abilityScores.str + (racialBonuses.str || 0))
  const dexMod = modifier(abilityScores.dex + (racialBonuses.dex || 0))

  // Equipment: starting equipment from class + background
  const equipment = [...cls.startingEquipment, ...bg.equipment]

  // Features from class at current level.
  // Solo il nome, senza "(Lv.N)": è la stessa forma che salva la procedura
  // guidata, ed è quella che le traduzioni sanno cercare. Con il livello
  // incollato dentro, il riepilogo e la scheda PDF restavano in inglese.
  const features = cls.features
    .filter(f => f.level <= level)
    .map(f => f.name)
  if (subclass) {
    features.push(...subclass.features.filter(f => f.level <= level).map(f => f.name))
  }

  // Spells (if caster)
  let spellcastingClass = ''
  let spellcastingAbility = ''
  let cantrips: string[] = []
  let spellsKnown: string[] = []

  if (cls.spellcasting) {
    spellcastingClass = cls.id
    spellcastingAbility = cls.spellcasting.ability

    const allSpells = getSpells(variant)
    const classSpellList = allSpells.filter(s => s.classes.includes(cls.id))

    // Select cantrips
    const maxCantrips = getCantripsKnown(cls.id, level)
    const availableCantrips = classSpellList.filter(s => s.level === 0)
    cantrips = pickN(availableCantrips, Math.min(maxCantrips, availableCantrips.length)).map(s => s.id)

    // Calculate ability modifiers for spell count
    const abilityMods = {
      str: modifier(abilityScores.str + (racialBonuses.str || 0)),
      dex: modifier(abilityScores.dex + (racialBonuses.dex || 0)),
      con: conMod,
      int: modifier(abilityScores.int + (racialBonuses.int || 0)),
      wis: modifier(abilityScores.wis + (racialBonuses.wis || 0)),
      cha: modifier(abilityScores.cha + (racialBonuses.cha || 0)),
    }

    // Select leveled spells
    const maxKnown = getSpellsKnownCount(cls.id, level, abilityMods)
    const spellSlots = getSpellSlots(cls.id, level)
    const maxSpellLevel = Math.max(0, ...Object.keys(spellSlots).map(Number))

    const availableLeveled = classSpellList.filter(s => s.level > 0 && s.level <= maxSpellLevel)
    spellsKnown = pickN(availableLeveled, Math.min(maxKnown, availableLeveled.length)).map(s => s.id)
  }

  // Select class-coherent gear (weapons, armor, shield)
  const { weapons, armorName, useShield } = selectClassGear(cls, strMod, dexMod, prof)

  const name = pick(FANTASY_NAMES)
  const archetype = pickRandomArchetype()

  return {
    id: crypto.randomUUID(),
    variant,
    name,
    playerName: '',
    race: race.id,
    subrace: subrace?.id || '',
    feat: originFeat,
    className: cls.id,
    subclass: subclass?.id || '',
    level,
    background: bg.id,
    alignment: pick(ALIGNMENTS),
    experiencePoints: 0,
    abilityScores,
    racialBonuses,
    skillProficiencies: allSkillIds,
    skillExpertise: [],
    savingThrowProficiencies: [...cls.savingThrows],
    languages,
    proficienciesOther: [...cls.armorProficiencies, ...cls.weaponProficiencies, ...cls.toolProficiencies],
    weapons,
    armor: armorName,
    shield: useShield,
    equipment,
    coins: { cp: 0, sp: 0, ep: 0, gp: randomInt(10, 50), pp: 0 },
    personalityTraits: archetype.personalityTraits,
    ideals: archetype.ideals,
    bonds: archetype.bonds,
    flaws: archetype.flaws,
    featuresTraits: features,
    backstory: '',
    age: String(randomInt(18, 150)),
    height: `${randomInt(4, 6)}'${randomInt(0, 11)}"`,
    weight: `${randomInt(90, 250)} lbs`,
    eyes: pick(EYE_COLORS),
    hair: pick(HAIR_COLORS),
    skin: pick(SKIN_TONES),
    allies: '',
    treasure: '',
    spellcastingClass,
    spellcastingAbility,
    cantrips,
    spellsKnown,
    spellsPrepared: [],
    hitDie: cls.hitDie,
    maxHp,
    currentHp: maxHp,
    tempHp: 0,
    speed: race.speed,
    brawlingMoves: [],
    misdeeds: '',
    size: race.size || 'Medium',
    whacksLevel: 0,
    mark: apoMark,
    markSpirit: apoSpirit,
    virtue: apoVirtue,
    sin: apoSin,
    humanity: 10,
    sessionNotes: '',
    classes: [],
  }
}

/**
 * Assign ability scores smartly: highest scores go to primary abilities,
 * CON gets a decent score, rest distributed randomly.
 */
function assignScoresSmartly(sortedScores: number[], primaryAbilities: AbilityKey[]): AbilityScores {
  const abilities: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']
  const scores: AbilityScores = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 }
  const remaining = [...sortedScores]
  const assigned = new Set<AbilityKey>()

  // Assign highest scores to primary abilities
  for (const primary of primaryAbilities) {
    if (remaining.length > 0 && !assigned.has(primary)) {
      scores[primary] = remaining.shift()!
      assigned.add(primary)
    }
  }

  // Give CON a decent score (next best)
  if (!assigned.has('con') && remaining.length > 0) {
    scores.con = remaining.shift()!
    assigned.add('con')
  }

  // Distribute remaining scores randomly
  const unassigned = abilities.filter(a => !assigned.has(a))
  const shuffledUnassigned = unassigned.sort(() => Math.random() - 0.5)
  for (const ability of shuffledUnassigned) {
    if (remaining.length > 0) {
      scores[ability] = remaining.shift()!
    }
  }

  return scores
}
