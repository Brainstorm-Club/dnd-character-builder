import type { CharacterData, AbilityScores } from '@/stores/character'
import { modifier, proficiencyBonus, formatModifier, spellSaveDC, spellAttackBonus, feetToMeters } from './calculations'
import { apocalisseRules } from '@/data/apocalisse/rules'
import { getBrancaloniaFeatById } from '@/data/brancalonia/feats'
import { getDnd2024Feat } from '@/data/dnd2024/feats'
import { getMoveSlots, getKnownMoveCount, getBrawlClassFeature, getBrawlAce } from '@/data/brancalonia/brawl'
import { classNamesIt, brancaloniaClassNamesIt, apocalisseClassNamesIt, raceNamesIt, subraceNamesIt, backgroundNamesIt } from '@/i18n/gameTerms'

/** Capitalize a class ID for English display (e.g., "barbarian" → "Barbarian") */
function capitalizeId(id: string): string {
  return id.charAt(0).toUpperCase() + id.slice(1)
}

/** Get display class name for PDF based on variant */
function pdfClassName(classId: string, variant: string): string {
  if (variant === 'brancalonia') {
    return brancaloniaClassNamesIt[classId] ?? classNamesIt[capitalizeId(classId)] ?? capitalizeId(classId)
  }
  if (variant === 'apocalisse') {
    return apocalisseClassNamesIt[classId] ?? classNamesIt[capitalizeId(classId)] ?? capitalizeId(classId)
  }
  return capitalizeId(classId)
}

/** Get display race name for PDF based on variant */
function pdfRaceName(raceId: string, variant: string): string {
  if (variant === 'brancalonia' || variant === 'apocalisse') {
    // Try direct lookup, then capitalized
    const capitalized = raceId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-')
    return raceNamesIt[capitalized] ?? raceNamesIt[capitalized.replace(/-/g, ' ')] ?? capitalizeId(raceId)
  }
  // For D&D 5e, capitalize the ID
  return raceId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-')
}

/** Get display subrace name for PDF */
function pdfSubraceName(subraceId: string, variant: string): string {
  if (!subraceId) return ''
  if (variant === 'brancalonia' || variant === 'apocalisse') {
    const capitalized = subraceId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    return subraceNamesIt[capitalized] ?? capitalized
  }
  return subraceId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

/** Get display background name for PDF based on variant */
function pdfBackgroundName(bgId: string, variant: string): string {
  if (variant === 'brancalonia' || variant === 'apocalisse') {
    const capitalized = bgId.split(/[-\s]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    return backgroundNamesIt[capitalized] ?? backgroundNamesIt[bgId] ?? capitalized
  }
  return bgId.split(/[-\s]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}
function totalAbility(char: CharacterData, ability: keyof AbilityScores): number {
  return char.abilityScores[ability] + (char.racialBonuses[ability] || 0)
}

function abilityMod(char: CharacterData, ability: keyof AbilityScores): number {
  return modifier(totalAbility(char, ability))
}

function skillBonus(char: CharacterData, skillId: string, ability: keyof AbilityScores): number {
  const mod = abilityMod(char, ability)
  const prof = char.skillProficiencies.includes(skillId) ? proficiencyBonus(char.level) : 0
  const expert = char.skillExpertise.includes(skillId) ? proficiencyBonus(char.level) : 0
  return mod + prof + expert
}

function savingThrow(char: CharacterData, ability: keyof AbilityScores): number {
  const mod = abilityMod(char, ability)
  const prof = char.savingThrowProficiencies.includes(ability) ? proficiencyBonus(char.level) : 0
  return mod + prof
}

export function getDnd5eFieldMapping(char: CharacterData): Record<string, string | boolean> {
  const prof = proficiencyBonus(char.level)
  const fields: Record<string, string | boolean> = {}

  // Basic Info
  fields['CharacterName'] = char.name
  const classes = char.classes ?? []
  if (classes.length >= 2) {
    fields['ClassLevel'] = classes
      .map(c => `${pdfClassName(c.classId, char.variant)} ${c.level}`)
      .join(' / ')
  } else {
    fields['ClassLevel'] = `${pdfClassName(char.className, char.variant)} ${char.level}`
  }
  fields['Background'] = pdfBackgroundName(char.background, char.variant)
  fields['PlayerName'] = char.playerName
  const raceDisplay = pdfRaceName(char.race, char.variant)
  const subraceDisplay = pdfSubraceName(char.subrace, char.variant)
  fields['Race '] = subraceDisplay ? `${raceDisplay} (${subraceDisplay})` : raceDisplay
  fields['Alignment'] = char.alignment
  fields['XP'] = String(char.experiencePoints)

  // Ability Scores
  const abilities: (keyof AbilityScores)[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']
  const abilityFieldMap: Record<string, string> = {
    str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA',
  }
  const modFieldMap: Record<string, string> = {
    str: 'STRmod', dex: 'DEXmod', con: 'CONmod', int: 'INTmod', wis: 'WISmod', cha: 'CHAmod',
  }
  const profFieldMap: Record<string, string> = {
    str: 'STRprof', dex: 'DEXprof', con: 'CONprof', int: 'INTprof', wis: 'WISprof', cha: 'CHAprof',
  }
  const stFieldMap: Record<string, string> = {
    str: 'ST Strength', dex: 'ST Dexterity', con: 'ST Constitution',
    int: 'ST Intelligence', wis: 'ST Wisdom', cha: 'ST Charisma',
  }

  for (const a of abilities) {
    const abilityField = abilityFieldMap[a]!
    const modField = modFieldMap[a]!
    const stField = stFieldMap[a]!
    const profField = profFieldMap[a]!
    fields[abilityField] = String(totalAbility(char, a))
    fields[modField] = String(abilityMod(char, a))
    fields[stField] = String(savingThrow(char, a))
    if (char.savingThrowProficiencies.includes(a)) {
      fields[profField] = true
    }
  }

  // Combat Stats
  fields['AC'] = String(10 + abilityMod(char, 'dex'))
  fields['Initiative'] = String(abilityMod(char, 'dex'))
  fields['Speed'] = `${feetToMeters(char.speed)}m`
  fields['HPMax'] = String(char.maxHp)
  fields['HPCurrent'] = String(char.currentHp || char.maxHp)
  fields['HPTemp'] = String(char.tempHp || '')
  const hdClasses = char.classes ?? []
  if (hdClasses.length >= 2) {
    fields['HDTotal'] = hdClasses.map(c => `${c.level}d${c.hitDie}`).join(' + ')
  } else {
    fields['HDTotal'] = `${char.level}d${char.hitDie}`
  }
  fields['HD'] = `${char.level}d${char.hitDie}`
  fields['ProfBonus'] = String(prof)
  fields['Passive'] = String(10 + skillBonus(char, 'perception', 'wis'))

  // Skills
  const skillFieldMap: Record<string, { field: string; profField: string; ability: keyof AbilityScores }> = {
    acrobatics: { field: 'ACRO', profField: 'ACROP', ability: 'dex' },
    'animal-handling': { field: 'ANIM', profField: 'ANIMP', ability: 'wis' },
    arcana: { field: 'ARC', profField: 'ARCP', ability: 'int' },
    athletics: { field: 'ATH', profField: 'ATHP', ability: 'str' },
    deception: { field: 'DEC', profField: 'DECP', ability: 'cha' },
    history: { field: 'HIST', profField: 'HISTP', ability: 'int' },
    insight: { field: 'INS', profField: 'INSP', ability: 'wis' },
    intimidation: { field: 'INTI', profField: 'INTIP', ability: 'cha' },
    investigation: { field: 'INV', profField: 'INVP', ability: 'int' },
    medicine: { field: 'MED', profField: 'MEDP', ability: 'wis' },
    nature: { field: 'NAT', profField: 'NATP', ability: 'int' },
    perception: { field: 'PERC', profField: 'PERCP', ability: 'wis' },
    performance: { field: 'PERF', profField: 'PERFP', ability: 'cha' },
    persuasion: { field: 'PERS', profField: 'PERSP', ability: 'cha' },
    religion: { field: 'REL', profField: 'RELP', ability: 'int' },
    'sleight-of-hand': { field: 'SLE', profField: 'SLEP', ability: 'dex' },
    stealth: { field: 'STLTH', profField: 'STLTHP', ability: 'dex' },
    survival: { field: 'SURV', profField: 'SURVP', ability: 'wis' },
  }

  for (const [skillId, mapping] of Object.entries(skillFieldMap)) {
    fields[mapping.field] = String(skillBonus(char, skillId, mapping.ability))
    if (char.skillProficiencies.includes(skillId)) {
      fields[mapping.profField] = true
    }
  }

  // Weapons (up to 5). The template's own field names carry inconsistent
  // trailing spaces, so they are spelled out rather than derived.
  const WPN_NAME = ['Wpn Name', 'Wpn Name 2', 'Wpn Name 3', 'Wpn Name 4', 'Wpn Name 5']
  const WPN_ATK = ['Wpn1 AtkBonus', 'Wpn2 AtkBonus ', 'Wpn3 AtkBonus  ', 'Wpn4 AtkBonus', 'Wpn5 AtkBonus']
  const WPN_DMG = ['Wpn1 Damage', 'Wpn2 Damage ', 'Wpn3 Damage ', 'Wpn4 Damage', 'Wpn5 Damage']
  for (let i = 0; i < Math.min(char.weapons.length, 5); i++) {
    const wpn = char.weapons[i]!
    fields[WPN_NAME[i]!] = wpn.name
    // attackBonus is already the final number, proficiency and ability included
    fields[WPN_ATK[i]!] = formatModifier(wpn.attackBonus)
    fields[WPN_DMG[i]!] = wpn.damage
  }

  // Equipment & Other
  fields['Equipment'] = char.equipment.join(', ')
  fields['ProficienciesLang'] = [...char.proficienciesOther, ...char.languages.map(l => `Language: ${l}`)].join('\n')
  // Features and Traits - include Apocalisse mark/virtue/sin/humanity if applicable
  const featureLines = [...char.featuresTraits]
  if (char.variant === 'dnd2024') {
    const bg = char.background
    const feat = char.feat ? getDnd2024Feat(char.feat) : undefined
    if (feat) featureLines.push(`Talento: ${feat.name}`)
    if (bg) featureLines.push(`Background: ${bg}`)
  }
  if (char.variant === 'brancalonia') {
    if (char.feat) {
      const featObj = getBrancaloniaFeatById(char.feat)
      if (featObj) featureLines.push(`Talento: ${featObj.nameOriginal}`)
    }
    if (char.className) {
      featureLines.push(`Rissa - Slot mossa: ${getMoveSlots(char.level)}, Mosse: ${getKnownMoveCount(char.level)}`)
      const brawlFeat = getBrawlClassFeature(char.className)
      if (brawlFeat) featureLines.push(`Mossa di Classe: ${brawlFeat.nameOriginal}`)
      const ace = char.level >= 6 ? getBrawlAce(char.className) : undefined
      if (ace) featureLines.push(`Asso nella Manica: ${ace.nameOriginal}`)
    }
  }
  if (char.variant === 'apocalisse') {
    if (char.mark) {
      const markObj = apocalisseRules.marks.find(m => m.id === char.mark)
      if (markObj) {
        featureLines.push(`Marchio: ${markObj.nameOriginal}`)
        if (char.markSpirit) {
          const spirit = markObj.spirits.find(s => s.id === char.markSpirit)
          if (spirit) featureLines.push(`Spirito: ${spirit.nameOriginal}`)
        }
      }
    }
    if (char.virtue) {
      const virtueObj = apocalisseRules.virtues.find(v => v.id === char.virtue)
      if (virtueObj) featureLines.push(`Virtù: ${virtueObj.nameOriginal}`)
    }
    if (char.sin) {
      const sinObj = apocalisseRules.sins.find(s => s.id === char.sin)
      if (sinObj) featureLines.push(`Peccato: ${sinObj.nameOriginal}`)
    }
    featureLines.push(`Umanità: ${char.humanity}`)
  }
  fields['Features and Traits'] = featureLines.join('\n')
  fields['PersonalityTraits '] = char.personalityTraits
  fields['Ideals'] = char.ideals
  fields['Bonds'] = char.bonds
  fields['Flaws'] = char.flaws

  // Coins
  fields['CP'] = String(char.coins.cp || '')
  fields['SP'] = String(char.coins.sp || '')
  fields['EP'] = String(char.coins.ep || '')
  fields['GP'] = String(char.coins.gp || '')
  fields['PP'] = String(char.coins.pp || '')

  // Page 2
  fields['Age'] = char.age
  fields['Height'] = char.height
  fields['Weight'] = char.weight
  fields['Eyes'] = char.eyes
  fields['Hair'] = char.hair
  fields['Skin'] = char.skin
  fields['Backstory'] = char.backstory
  // Character Appearance: compose a physical description from detail fields
  const appearanceParts = [
    char.age ? `Age: ${char.age}` : '',
    char.height ? `Height: ${char.height}` : '',
    char.weight ? `Weight: ${char.weight}` : '',
    char.eyes ? `Eyes: ${char.eyes}` : '',
    char.hair ? `Hair: ${char.hair}` : '',
    char.skin ? `Skin: ${char.skin}` : '',
  ].filter(Boolean)
  fields['Feats+Traits'] = appearanceParts.join('\n')
  const alliesContent = [char.allies, char.sessionNotes].filter(Boolean).join('\n\n')
  fields['Allies'] = alliesContent
  fields['Treasure'] = char.treasure

  // Page 3 - Spellcasting
  if (char.spellcastingAbility) {
    fields['Spellcasting Class 2'] = pdfClassName(char.spellcastingClass, char.variant)
    fields['SpellcastingAbility 2'] = char.spellcastingAbility.toUpperCase()
    const sMod = abilityMod(char, char.spellcastingAbility as keyof AbilityScores)
    fields['SpellSaveDC  2'] = String(spellSaveDC(prof, sMod))
    fields['SpellAtkBonus 2'] = formatModifier(spellAttackBonus(prof, sMod))
  }

  return fields
}

export function getBrancaloniaFieldMapping(char: CharacterData): Record<string, string | boolean> {
  const prof = proficiencyBonus(char.level)
  const fields: Record<string, string | boolean> = {}

  // Basic Info
  fields['Nome'] = char.name
  fields['Classe'] = pdfClassName(char.className, 'brancalonia')
  fields['Liv'] = String(char.level)
  fields['Background'] = pdfBackgroundName(char.background, 'brancalonia')
  fields['Nome Giocatore'] = char.playerName
  fields['Allineamento'] = char.alignment
  fields['Taglia'] = char.size || 'Media'
  fields['Bonus Competenza'] = String(prof)
  fields['Ispirazione'] = ''

  // Ability Scores
  fields['Forza'] = String(totalAbility(char, 'str'))
  fields['Mod For'] = String(abilityMod(char, 'str'))
  fields['Des'] = String(totalAbility(char, 'dex'))
  fields['Mod Des'] = String(abilityMod(char, 'dex'))
  fields['Cos'] = String(totalAbility(char, 'con'))
  fields['MOD Cos'] = String(abilityMod(char, 'con'))
  fields['Int'] = String(totalAbility(char, 'int'))
  fields['Mod Int'] = String(abilityMod(char, 'int'))
  fields['Sag'] = String(totalAbility(char, 'wis'))
  fields['Mod Sag'] = String(abilityMod(char, 'wis'))
  fields['Car'] = String(totalAbility(char, 'cha'))
  fields['Mod Car'] = String(abilityMod(char, 'cha'))

  // Saving Throws
  fields['TSforza'] = String(savingThrow(char, 'str'))
  fields['TSdestreza'] = String(savingThrow(char, 'dex'))
  fields['TScostituzione'] = String(savingThrow(char, 'con'))
  fields['TSinteligenza'] = String(savingThrow(char, 'int'))
  fields['TSsaggezza'] = String(savingThrow(char, 'wis'))
  fields['TScarisma'] = String(savingThrow(char, 'cha'))

  // Combat
  fields['CA '] = String(10 + abilityMod(char, 'dex'))
  fields['Iniziativa'] = String(abilityMod(char, 'dex'))
  fields['Max PF'] = String(char.maxHp)
  fields['PF attuali '] = String(char.currentHp || char.maxHp)
  fields['PF Temporanei '] = String(char.tempHp || '')
  fields['Dadi Vita'] = `${char.level}d${char.hitDie}`
  fields['Percezione Passiva'] = String(10 + skillBonus(char, 'perception', 'wis'))

  // Skills
  const brancSkillMap: Record<string, { field: string; ability: keyof AbilityScores }> = {
    acrobatics: { field: 'Acrobazia', ability: 'dex' },
    'animal-handling': { field: 'Addestrare Animali', ability: 'wis' },
    arcana: { field: 'Arcano', ability: 'int' },
    athletics: { field: 'Atletica', ability: 'str' },
    stealth: { field: 'Furtività', ability: 'dex' },
    investigation: { field: 'Indagare', ability: 'int' },
    deception: { field: 'Inganno', ability: 'cha' },
    intimidation: { field: 'Intimidire', ability: 'cha' },
    performance: { field: 'Intrattenere', ability: 'cha' },
    insight: { field: 'Intuizione', ability: 'wis' },
    medicine: { field: 'Medicina', ability: 'wis' },
    nature: { field: 'Natura', ability: 'int' },
    perception: { field: 'Percezione', ability: 'wis' },
    persuasion: { field: 'Persuasione', ability: 'cha' },
    'sleight-of-hand': { field: 'Rapidità di Mano', ability: 'dex' },
    religion: { field: 'Religione', ability: 'int' },
    survival: { field: 'Sopravvivenza', ability: 'wis' },
    history: { field: 'Storia', ability: 'int' },
  }

  for (const [skillId, mapping] of Object.entries(brancSkillMap)) {
    fields[mapping.field] = String(skillBonus(char, skillId, mapping.ability))
  }

  // Weapons (up to 3)
  for (let i = 0; i < Math.min(char.weapons.length, 3); i++) {
    const wpn = char.weapons[i]!
    fields[`Arma ${i + 1}`] = wpn.name
    fields[`Bonus ${i + 1}`] = formatModifier(wpn.attackBonus)
    fields[`Danno ${i + 1}`] = wpn.damage
  }

  // Equipment
  fields['Equipaggiamento'] = char.equipment.join(', ')
  fields['Tratti Caratteriali'] = char.personalityTraits
  fields['Ideali'] = char.ideals
  fields['Legami'] = char.bonds
  fields['Difetti'] = char.flaws
  fields['Privilegi'] = char.featuresTraits.join('\n')
  fields['Alleati'] = char.allies
  const noteContent = [char.backstory, char.sessionNotes].filter(Boolean).join('\n\n')
  fields['Note'] = noteContent
  fields['Malefatte'] = char.misdeeds || ''

  // Coins (silver standard)
  fields['MR'] = String(char.coins.cp || '')
  fields['MF '] = String(char.coins.sp || '')
  fields['MA'] = String(char.coins.ep || '')
  fields['MO'] = String(char.coins.gp || '')

  // Spellcasting
  if (char.spellcastingAbility) {
    fields['Classe Incantatore '] = pdfClassName(char.spellcastingClass, 'brancalonia')
    fields['Caratteristica da incantatore'] = char.spellcastingAbility.toUpperCase()
    const sMod = abilityMod(char, char.spellcastingAbility as keyof AbilityScores)
    fields['CD TS incantesimi'] = String(spellSaveDC(prof, sMod))
    fields['Bonus al copire incanteismi'] = formatModifier(spellAttackBonus(prof, sMod))
    fields['Trucchetti'] = char.cantrips.join(', ')
    fields['Incantesimi livello 1 '] = char.spellsKnown.filter(s => s.startsWith('1-')).join(', ')
    fields['Incantesimi livello 2'] = char.spellsKnown.filter(s => s.startsWith('2-')).join(', ')
    fields['Incantesimi livello 3'] = char.spellsKnown.filter(s => s.startsWith('3-')).join(', ')
  }

  // Brawling
  fields['Mosse'] = char.brawlingMoves.join(', ')

  return fields
}
