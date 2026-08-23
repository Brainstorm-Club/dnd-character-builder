import type { CharacterData, AbilityScores } from '@/stores/character'
import { modifier, proficiencyBonus, formatModifier, spellSaveDC, spellAttackBonus, feetToMeters, computeArmorClass } from './calculations'
import { apocalisseRules } from '@/data/apocalisse/rules'
import { getBrancaloniaFeatById } from '@/data/brancalonia/feats'
import { getDnd2024Feat } from '@/data/dnd2024/feats'
import { getMoveSlots, getKnownMoveCount, getBrawlClassFeature, getBrawlAce } from '@/data/brancalonia/brawl'
import { getSpells, getClasses, getSpellSlots, getMulticlassSpellSlots } from '@/data'
import {
  classNamesIt, brancaloniaClassNamesIt, apocalisseClassNamesIt,
  equipmentNamesIt, weaponNamesIt, armorNamesIt, equipmentPacksIt,
  translateGameTerm,
} from '@/i18n/gameTerms'

/**
 * Lingua con cui riempire la scheda. Brancalonia e Apocalisse hanno moduli
 * italiani e restano sempre in italiano; D&D 5e e 2024 seguono l'interfaccia.
 */
function sheetLocale(variant: string, uiLocale: string): string {
  if (variant === 'brancalonia' || variant === 'apocalisse') return 'it'
  return uiLocale === 'it' ? 'it' : 'en'
}

/** Capitalize a class ID for English display (e.g., "barbarian" → "Barbarian") */
function capitalizeId(id: string): string {
  return id.charAt(0).toUpperCase() + id.slice(1)
}

/** 'powder-dabbler' → 'Powder Dabbler' */
function titleCase(id: string): string {
  return id.split(/[-\s]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

/**
 * Nome della classe nella lingua della scheda. Il locale arriva già calcolato
 * da sheetLocale(): senza, D&D 5e e 2024 stampavano 'Druid 6' accanto a un
 * background e a un allineamento già tradotti.
 */
function pdfClassName(classId: string, variant: string, locale = 'it'): string {
  if (variant === 'brancalonia') {
    return brancaloniaClassNamesIt[classId] ?? classNamesIt[capitalizeId(classId)] ?? capitalizeId(classId)
  }
  if (variant === 'apocalisse') {
    return apocalisseClassNamesIt[classId] ?? classNamesIt[capitalizeId(classId)] ?? capitalizeId(classId)
  }
  if (locale !== 'it') return capitalizeId(classId)
  return classNamesIt[capitalizeId(classId)] ?? capitalizeId(classId)
}

/**
 * Campi della pagina incantesimi del modello D&D, raggruppati per livello.
 *
 * I nomi non seguono l'ordine di stampa — pdf-lib restituisce 'Spells 1015' e
 * 'Spells 101014' in coda alla lista, mentre sulla pagina stanno in cima al
 * blocco di 1° livello — quindi la mappa è esplicita, ricavata dalla posizione
 * dei riquadri sulla terza pagina di public/pdf/dnd-5e-sheet.pdf.
 */
const DND5E_SPELL_FIELDS: Record<number, readonly string[]> = {
  0: ['Spells 1014', 'Spells 1016', 'Spells 1017', 'Spells 1018', 'Spells 1019', 'Spells 1020', 'Spells 1021', 'Spells 1022'],
  1: ['Spells 101014', 'Spells 1015', 'Spells 1023', 'Spells 1024', 'Spells 1025', 'Spells 1026', 'Spells 1027', 'Spells 1028', 'Spells 1029', 'Spells 1030', 'Spells 1031', 'Spells 1032', 'Spells 1033'],
  2: ['Spells 1046', 'Spells 1034', 'Spells 1035', 'Spells 1036', 'Spells 1037', 'Spells 1038', 'Spells 1039', 'Spells 1040', 'Spells 1041', 'Spells 1042', 'Spells 1043', 'Spells 1044', 'Spells 1045'],
  3: ['Spells 1048', 'Spells 1047', 'Spells 1049', 'Spells 1050', 'Spells 1051', 'Spells 1052', 'Spells 1053', 'Spells 1054', 'Spells 1055', 'Spells 1056', 'Spells 1057', 'Spells 1058', 'Spells 1059'],
  4: ['Spells 1061', 'Spells 1060', 'Spells 1062', 'Spells 1063', 'Spells 1064', 'Spells 1065', 'Spells 1066', 'Spells 1067', 'Spells 1068', 'Spells 1069', 'Spells 1070', 'Spells 1071', 'Spells 1072'],
  5: ['Spells 1074', 'Spells 1073', 'Spells 1075', 'Spells 1076', 'Spells 1077', 'Spells 1078', 'Spells 1079', 'Spells 1080', 'Spells 1081'],
  6: ['Spells 1083', 'Spells 1082', 'Spells 1084', 'Spells 1085', 'Spells 1086', 'Spells 1087', 'Spells 1088', 'Spells 1089', 'Spells 1090'],
  7: ['Spells 1092', 'Spells 1091', 'Spells 1093', 'Spells 1094', 'Spells 1095', 'Spells 1096', 'Spells 1097', 'Spells 1098', 'Spells 1099'],
  8: ['Spells 10101', 'Spells 10100', 'Spells 10102', 'Spells 10103', 'Spells 10104', 'Spells 10105', 'Spells 10106'],
  9: ['Spells 10108', 'Spells 10107', 'Spells 10109', 'Spells 101010', 'Spells 101011', 'Spells 101012', 'Spells 101013'],
}

/**
 * Nome di un pezzo d'equipaggiamento nella lingua della scheda. I dati usano
 * tanto nomi propri ('Chain Mail') quanto slug ('dungeoneer-pack'), quindi si
 * provano nell'ordine le tabelle esistenti.
 */
function pdfEquipmentName(item: string, locale: string): string {
  if (locale !== 'it') return item
  const titled = titleCase(item)
  const packKey = /-pack$/.test(item)
    ? `${titleCase(item.replace(/-pack$/, ''))}'s Pack`
    : ''
  return equipmentNamesIt[item]
    ?? equipmentNamesIt[titled]
    ?? weaponNamesIt[titled]
    ?? armorNamesIt[titled]
    ?? (packKey ? equipmentPacksIt[packKey] ?? item : item)
}

/**
 * Nome di un incantesimo a partire dal suo id ('1-jump', 'blade-ward').
 * Senza questa risoluzione la scheda stampava l'id grezzo.
 */
/**
 * Un incantesimo può essere memorizzato per id ('3-fireball', 'shillelagh')
 * oppure per nome ('Fireball'): il generatore casuale usa gli id, i
 * personaggi scritti a mano usano i nomi. Cercare solo per id lasciava i
 * secondi irrisolti, e da lì uscivano in inglese e al livello sbagliato.
 */
function findSpell(ref: string, char: CharacterData) {
  const all = getSpells(char.variant)
  return all.find(sp => sp.id === ref)
    ?? all.find(sp => sp.name.toLowerCase() === ref.toLowerCase())
}

function pdfSpellName(spellId: string, char: CharacterData, locale: string): string {
  const found = findSpell(spellId, char)
  const english = found?.name ?? titleCase(spellId.replace(/^\d+-/, ''))
  return translateGameTerm(english, locale, 'spell')
}
/**
 * Livello di un incantesimo noto. L'id di norma lo porta nel prefisso
 * ('1-jump'), ma i 13 incantesimi esclusivi di Brancalonia ne sono privi
 * ('chex', 'cleanse', 'illusory-tribute'): il livello va letto dai dati, e il
 * prefisso resta solo come ripiego per un id che i dati non conoscono.
 */
function pdfSpellLevel(spellId: string, char: CharacterData): number {
  const found = findSpell(spellId, char)
  if (found) return found.level
  const prefixed = /^(\d+)-/.exec(spellId)
  return prefixed ? Number(prefixed[1]) : 0
}

/**
 * Incantesimi noti raggruppati per livello, in ordine di lista. Il livello
 * arriva dai dati, non dal prefisso dell'id.
 */
function spellsByLevel(char: CharacterData): Map<number, string[]> {
  const byLevel = new Map<number, string[]>()
  // Chi prepara gli incantesimi (chierico, druido, mago, paladino) li tiene in
  // `spellsPrepared`: leggendo solo `spellsKnown` la sua scheda usciva senza
  // un solo incantesimo.
  const noti = [...new Set([...char.spellsKnown, ...char.spellsPrepared])]
  for (const id of noti) {
    const lv = pdfSpellLevel(id, char)
    const bucket = byLevel.get(lv)
    if (bucket) bucket.push(id)
    else byLevel.set(lv, [id])
  }
  return byLevel
}

/**
 * Slot incantesimo per livello, multiclasse compreso. La scheda si esporta a
 * riposo compiuto, quindi 'SlotsRemaining' vale quanto 'SlotsTotal'.
 */
function pdfSpellSlots(char: CharacterData): Record<number, number> {
  const classes = char.classes ?? []
  if (classes.length >= 2) {
    const entries = classes.map(entry => {
      const cls = getClasses(char.variant).find(c => c.id === entry.classId)
      // Un guerriero o un ladro senza sottoclasse da incantatore non porta
      // nulla al livello da incantatore, come già fa il passo 7
      const casterType = cls?.spellcasting?.casterType === 'third' && !entry.subclass
        ? null
        : cls?.spellcasting?.casterType ?? null
      return { classId: entry.classId, level: entry.level, casterType }
    })
    const { slots, pactSlots } = getMulticlassSpellSlots(entries)
    const merged: Record<number, number> = { ...slots }
    for (const [lv, n] of Object.entries(pactSlots)) {
      merged[Number(lv)] = (merged[Number(lv)] ?? 0) + n
    }
    return merged
  }
  if (!char.spellcastingClass) return {}
  return getSpellSlots(char.spellcastingClass, char.level)
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

export function getDnd5eFieldMapping(char: CharacterData, uiLocale = 'en'): Record<string, string | boolean> {
  const prof = proficiencyBonus(char.level)
  const loc = sheetLocale(char.variant, uiLocale)
  const fields: Record<string, string | boolean> = {}

  // Basic Info
  fields['CharacterName'] = char.name
  const classes = char.classes ?? []
  if (classes.length >= 2) {
    fields['ClassLevel'] = classes
      .map(c => `${pdfClassName(c.classId, char.variant, loc)} ${c.level}`)
      .join(' / ')
  } else {
    fields['ClassLevel'] = `${pdfClassName(char.className, char.variant, loc)} ${char.level}`
  }
  fields['Background'] = translateGameTerm(char.background, loc, 'background')
  fields['PlayerName'] = char.playerName
  const raceDisplay = translateGameTerm(char.race, loc, 'race')
  const subraceDisplay = char.subrace ? translateGameTerm(char.subrace, loc, 'subrace') : ''
  fields['Race '] = subraceDisplay ? `${raceDisplay} (${subraceDisplay})` : raceDisplay
  fields['Alignment'] = translateGameTerm(char.alignment, loc, 'alignment')
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
  fields['AC'] = String(computeArmorClass(char))
  fields['Initiative'] = String(abilityMod(char, 'dex'))
  fields['Speed'] = `${feetToMeters(char.speed)}m`
  fields['HPMax'] = String(char.maxHp)
  fields['HPCurrent'] = String(char.currentHp || char.maxHp)
  fields['HPTemp'] = String(char.tempHp || '')
  // 'HDTotal' e 'HD' sono la riga «Total» e il riquadro grande della stessa
  // casella DADI VITA: devono dire la stessa cosa. Sul multiclasse il dado è
  // uno per classe, quindi anche 'HD' elenca le classi invece di moltiplicare
  // il livello totale per il dado della sola classe principale.
  const hdClasses = char.classes ?? []
  const hitDice = hdClasses.length >= 2
    ? hdClasses.map(c => `${c.level}d${c.hitDie}`).join(' + ')
    : `${char.level}d${char.hitDie}`
  fields['HDTotal'] = hitDice
  fields['HD'] = hitDice
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
    fields[WPN_NAME[i]!] = translateGameTerm(wpn.name, loc, 'weapon')
    // attackBonus is already the final number, proficiency and ability included
    fields[WPN_ATK[i]!] = formatModifier(wpn.attackBonus)
    fields[WPN_DMG[i]!] = wpn.damage
  }

  // Equipment & Other
  const armorLine = char.armor ? [translateGameTerm(char.armor, loc, 'armor')] : []
  fields['Equipment'] = [...armorLine, ...char.equipment.map(e => pdfEquipmentName(e, loc))].join(', ')
  const profLine = char.proficienciesOther.map(pr => translateGameTerm(pr, loc, 'proficiency')).join(', ')
  const langLine = char.languages.length
    ? `${loc === 'it' ? 'Lingue' : 'Languages'}: ${char.languages.map(l => translateGameTerm(l, loc, 'language')).join(', ')}`
    : ''
  fields['ProficienciesLang'] = [profLine, langLine].filter(Boolean).join('\n')
  // Features and Traits - include Apocalisse mark/virtue/sin/humanity if applicable
  const featureLines = char.featuresTraits.map(f => translateGameTerm(f, loc, 'feature'))
  if (char.variant === 'dnd2024') {
    const bg = char.background
    const feat = char.feat ? getDnd2024Feat(char.feat) : undefined
    if (feat) featureLines.push(`Talento: ${feat.name}`)
    // Il background va tradotto come nel campo dedicato: qui finiva l'id
    // grezzo, e la scheda leggeva 'Background: acolyte'.
    if (bg) featureLines.push(`Background: ${translateGameTerm(bg, loc, 'background')}`)
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
    fields['Spellcasting Class 2'] = pdfClassName(char.spellcastingClass, char.variant, loc)
    fields['SpellcastingAbility 2'] = char.spellcastingAbility.toUpperCase()
    const sMod = abilityMod(char, char.spellcastingAbility as keyof AbilityScores)
    fields['SpellSaveDC  2'] = String(spellSaveDC(prof, sMod))
    fields['SpellAtkBonus 2'] = formatModifier(spellAttackBonus(prof, sMod))

    // Incantesimi noti, un riquadro per riga e un blocco per livello: prima la
    // pagina restava del tutto vuota, con i soli dati dell'intestazione.
    // Il livello arriva dai dati; i trucchetti stanno in una lista a parte e
    // riempiono il blocco 0.
    const byLevel = spellsByLevel(char)
    const slots = pdfSpellSlots(char)
    for (let lv = 0; lv <= 9; lv++) {
      const boxes = DND5E_SPELL_FIELDS[lv]!
      const ids = lv === 0
        ? [...char.cantrips, ...(byLevel.get(0) ?? []).filter(id => !char.cantrips.includes(id))]
        : byLevel.get(lv) ?? []
      const names = ids.map(sp => pdfSpellName(sp, char, loc))
      for (let i = 0; i < Math.min(names.length, boxes.length); i++) {
        fields[boxes[i]!] = names[i]!
      }
      // Slot del livello: i riquadri sono numerati 19..27 per i livelli 1..9.
      // Un livello senza slot resta vuoto, non stampa uno 0.
      if (lv >= 1) {
        const n = slots[lv] ?? 0
        const value = n > 0 ? String(n) : ''
        fields[`SlotsTotal ${18 + lv}`] = value
        fields[`SlotsRemaining ${18 + lv}`] = value
      }
    }
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
  fields['Background'] = translateGameTerm(char.background, 'it', 'background')
  // La casella della razza si chiama 'Nome 1' nel modello: un nome sbagliato
  // rimasto nel PDF originale. È quella a destra di Background, sotto
  // l'etichetta stampata "Razza" (oggetto 307R per chi la ispeziona con pdf.js).
  const razza = translateGameTerm(char.race, 'it', 'race')
  const sottorazza = char.subrace ? translateGameTerm(char.subrace, 'it', 'subrace') : ''
  fields['Nome 1'] = sottorazza ? `${razza} (${sottorazza})` : razza
  fields['Nome Giocatore'] = char.playerName
  fields['Allineamento'] = translateGameTerm(char.alignment, 'it', 'alignment')
  fields['Taglia'] = translateGameTerm(char.size || 'Medium', 'it', 'size')
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
  fields['CA '] = String(computeArmorClass(char))
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
    fields[`Arma ${i + 1}`] = translateGameTerm(wpn.name, 'it', 'weapon')
    fields[`Bonus ${i + 1}`] = formatModifier(wpn.attackBonus)
    fields[`Danno ${i + 1}`] = wpn.damage
  }

  // Equipment
  const brancArmor = char.armor ? [translateGameTerm(char.armor, 'it', 'armor')] : []
  fields['Equipaggiamento'] = [...brancArmor, ...char.equipment.map(e => pdfEquipmentName(e, 'it'))].join(', ')
  fields['Tratti Caratteriali'] = char.personalityTraits
  fields['Ideali'] = char.ideals
  fields['Legami'] = char.bonds
  fields['Difetti'] = char.flaws
  fields['Privilegi'] = char.featuresTraits.map(f => translateGameTerm(f, 'it', 'feature')).join('\n')
  fields['Alleati'] = char.allies
  const noteContent = [char.backstory, char.sessionNotes].filter(Boolean).join('\n\n')
  fields['Note'] = noteContent
  fields['Malefatte'] = char.misdeeds || ''

  // Coins (silver standard)
  // Le quattro caselle del borsello, da sinistra: MR, MA, MF, MO. Il manuale
  // (Ambientazione, "Il denaro") le scioglie così: spicci di rame, denaro
  // d'argento, soldo di ferro -- "l'electrum non esiste, e al suo posto
  // abbiamo il soldo di ferro" -- e oro. Argento e ferro erano scambiati.
  fields['MR'] = String(char.coins.cp || '')
  fields['MA'] = String(char.coins.sp || '')
  fields['MF '] = String(char.coins.ep || '')
  fields['MO'] = String(char.coins.gp || '')

  // Spellcasting
  if (char.spellcastingAbility) {
    fields['Classe Incantatore '] = pdfClassName(char.spellcastingClass, 'brancalonia')
    fields['Caratteristica da incantatore'] = char.spellcastingAbility.toUpperCase()
    const sMod = abilityMod(char, char.spellcastingAbility as keyof AbilityScores)
    fields['CD TS incantesimi'] = String(spellSaveDC(prof, sMod))
    fields['Bonus al copire incanteismi'] = formatModifier(spellAttackBonus(prof, sMod))
    // Il livello arriva dai dati: gli incantesimi esclusivi di Brancalonia non
    // hanno il prefisso numerico nell'id e altrimenti sparirebbero dalla scheda
    const byLevel = spellsByLevel(char)
    const spellList = (lv: number) => (byLevel.get(lv) ?? [])
      .map(sp => pdfSpellName(sp, char, 'it'))
      .join(', ')
    fields['Trucchetti'] = [...char.cantrips, ...(byLevel.get(0) ?? []).filter(id => !char.cantrips.includes(id))]
      .map(sp => pdfSpellName(sp, char, 'it'))
      .join(', ')
    fields['Incantesimi livello 1 '] = spellList(1)
    fields['Incantesimi livello 2'] = spellList(2)
    fields['Incantesimi livello 3'] = spellList(3)
  }

  // Brawling
  fields['Mosse'] = char.brawlingMoves.map(m => translateGameTerm(m, 'it', 'trait')).join(', ')

  return fields
}

/**
 * Scheda di Apocalisse. Fino a ieri i personaggi di questa variante uscivano
 * sulla scheda di D&D, perché il PDF dell'ambientazione non era un modulo
 * compilabile: Marchio, Spirito, Virtù, Peccato e Umanità finivano schiacciati
 * dentro la casella dei privilegi. Ora il modello ha i suoi campi e ognuna di
 * quelle voci ha il proprio posto, come sul manuale.
 *
 * I nomi dei campi sono quelli che abbiamo dato noi al modulo, in italiano,
 * perché la scheda esiste solo in italiano.
 */
export function getApocalisseFieldMapping(char: CharacterData): Record<string, string | boolean> {
  const prof = proficiencyBonus(char.level)
  const f: Record<string, string | boolean> = {}
  const it = (id: string, kind: Parameters<typeof translateGameTerm>[2]) =>
    translateGameTerm(id, 'it', kind)

  // ── Anagrafica ──
  f['nome-personaggio'] = char.name
  f['nome-giocatore'] = char.playerName
  f['origine'] = it(char.race, 'race') + (char.subrace ? ` (${it(char.subrace, 'subrace')})` : '')
  f['classe-livello'] = `${pdfClassName(char.className, 'apocalisse')} ${char.level}`
  // In Apocalisse l'origine è anche il background: ripeterla sotto Fazione
  // non aggiunge nulla. La Fazione è un'altra cosa e l'app non la tratta.
  f['fazione'] = ''
  f['punti-esperienza'] = String(char.experiencePoints || '')

  // ── Caratteristiche ──
  const CAR: (keyof AbilityScores)[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']
  for (const a of CAR) {
    f[`car-${a}`] = String(totalAbility(char, a))
    f[`mod-${a}`] = formatModifier(abilityMod(char, a))
    f[`ts-${a}`] = formatModifier(savingThrow(char, a))
  }
  f['bonus-competenza'] = formatModifier(prof)
  f['ispirazione'] = ''

  // ── Abilità, nell'ordine in cui la scheda le stampa ──
  const ABILITA: [string, keyof AbilityScores][] = [
    ['acrobatics', 'dex'], ['animal-handling', 'wis'], ['arcana', 'int'], ['athletics', 'str'],
    ['stealth', 'dex'], ['investigation', 'int'], ['deception', 'cha'], ['intimidation', 'cha'],
    ['performance', 'cha'], ['insight', 'wis'], ['medicine', 'wis'], ['nature', 'int'],
    ['perception', 'wis'], ['persuasion', 'cha'], ['sleight-of-hand', 'dex'], ['religion', 'int'],
    ['survival', 'wis'], ['history', 'int'],
  ]
  for (const [id, ab] of ABILITA) f[`ab-${id}`] = formatModifier(skillBonus(char, id, ab))
  f['percezione-passiva'] = String(10 + skillBonus(char, 'perception', 'wis'))

  // ── Combattimento ──
  f['classe-armatura'] = String(computeArmorClass(char))
  f['iniziativa'] = formatModifier(abilityMod(char, 'dex'))
  f['velocita'] = `${feetToMeters(char.speed)}m`
  f['pf-attuali'] = String(char.currentHp || char.maxHp)
  f['pf-temporanei'] = String(char.tempHp || '')
  f['dadi-vita'] = `${char.level}d${char.hitDie}`
  f['dadi-vita-totale'] = String(char.level)

  // ── Marchio, Virtù e Peccato: il cuore dell'ambientazione ──
  const marchio = char.mark ? apocalisseRules.marks.find(m => m.id === char.mark) : undefined
  const spirito = marchio && char.markSpirit
    ? marchio.spirits.find(s => s.id === char.markSpirit)
    : undefined
  f['marchio'] = [marchio?.nameOriginal, spirito?.nameOriginal].filter(Boolean).join(' — ')
  f['virtu'] = apocalisseRules.virtues.find(v => v.id === char.virtue)?.nameOriginal ?? ''
  f['peccato'] = apocalisseRules.sins.find(s => s.id === char.sin)?.nameOriginal ?? ''
  const dado = apocalisseRules.markDiceProgression
    .find(d => char.level >= d.levelRange[0] && char.level <= d.levelRange[1])
  f['dadi-marchio'] = dado?.die ?? ''

  // ── Armi: la scheda ne stampa tre ──
  for (let i = 0; i < 3; i++) {
    const w = char.weapons[i]
    f[`arma${i + 1}-nome`] = w ? it(w.name, 'weapon') : ''
    f[`arma${i + 1}-bonus`] = w ? formatModifier(w.attackBonus) : ''
    f[`arma${i + 1}-danni`] = w ? w.damage : ''
  }

  const armatura = char.armor ? [it(char.armor, 'armor')] : []
  f['equipaggiamento'] = [...armatura, ...char.equipment.map(e => pdfEquipmentName(e, 'it'))].join(', ')

  // ── Monete: cinque caselle, rame argento electro oro platino ──
  f['moneta-mr'] = String(char.coins.cp || '')
  f['moneta-ma'] = String(char.coins.sp || '')
  f['moneta-me'] = String(char.coins.ep || '')
  f['moneta-mo'] = String(char.coins.gp || '')
  f['moneta-mp'] = String(char.coins.pp || '')

  // ── Pagina 2 ──
  f['privilegi'] = char.featuresTraits.map(x => it(x, 'feature')).join('\n')
  f['occhi'] = char.eyes
  f['carnagione'] = char.skin
  f['capelli'] = char.hair
  f['eta'] = char.age
  f['altezza'] = char.height
  f['peso'] = char.weight
  f['segni-particolari'] = [char.personalityTraits, char.ideals, char.bonds, char.flaws]
    .filter(Boolean).join('\n')
  f['storia'] = char.backstory
  const lingue = char.languages.map(l => it(l, 'language'))
  const competenze = char.proficienciesOther.map(p => it(p, 'proficiency'))
  f['competenze-linguaggi'] = [
    competenze.length ? `Competenze: ${competenze.join(', ')}` : '',
    lingue.length ? `Lingue: ${lingue.join(', ')}` : '',
    `Umanità: ${char.humanity}`,
  ].filter(Boolean).join('\n')
  f['tesoro'] = [char.treasure, char.allies && `Alleati: ${char.allies}`].filter(Boolean).join('\n')

  // ── Pagina 3: incantesimi ──
  if (char.spellcastingAbility) {
    f['classe-incantatore'] = pdfClassName(char.spellcastingClass, 'apocalisse')
    f['caratteristica-incantatore'] = char.spellcastingAbility.toUpperCase()
    const mod = abilityMod(char, char.spellcastingAbility as keyof AbilityScores)
    f['cd-incantesimi'] = String(spellSaveDC(prof, mod))
    f['bonus-attacco-incantesimi'] = formatModifier(spellAttackBonus(prof, mod))

    const perLivello = spellsByLevel(char)
    const elenco = (lv: number) => (perLivello.get(lv) ?? [])
      .map(sp => pdfSpellName(sp, char, 'it')).join('\n')
    f['trucchetti'] = [
      ...char.cantrips,
      ...(perLivello.get(0) ?? []).filter(id => !char.cantrips.includes(id)),
    ].map(sp => pdfSpellName(sp, char, 'it')).join('\n')
    for (let lv = 1; lv <= 9; lv++) f[`incantesimi${lv}`] = elenco(lv)

    const slot = pdfSpellSlots(char)
    for (let lv = 1; lv <= 9; lv++) {
      const n = slot[lv] ?? 0
      f[`slot${lv}-totali`] = n ? String(n) : ''
      // La scheda si esporta a riposo compiuto: nessuno slot è ancora speso.
      f[`slot${lv}-spesi`] = ''
    }
  }

  return f
}
