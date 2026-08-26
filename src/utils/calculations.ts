import type { CharacterData } from '@/stores/character'
import { armor as armorTable, type ArmorData } from '@/data/dnd5e/equipment'

/** Calculate ability modifier from score */
export function modifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

/** Calculate proficiency bonus from character level */
export function proficiencyBonus(level: number): number {
  return Math.floor((level - 1) / 4) + 2
}

/** Calculate HP at level 1 */
export function hpAtLevel1(hitDie: number, conMod: number): number {
  return hitDie + conMod
}

/** Calculate HP gain per level (using average) */
export function hpPerLevel(hitDie: number, conMod: number): number {
  return Math.floor(hitDie / 2) + 1 + conMod
}

/** Calculate total HP at a given level */
export function totalHp(hitDie: number, conMod: number, level: number): number {
  if (level <= 0) return 0
  const first = hpAtLevel1(hitDie, conMod)
  const rest = (level - 1) * hpPerLevel(hitDie, conMod)
  return Math.max(first + rest, 1)
}

/** Calculate base AC (unarmored) */
export function baseAC(dexMod: number): number {
  return 10 + dexMod
}

/**
 * Slug stabile di un'armatura, ricavato dal suo nome di listino:
 * 'Chain Mail' → 'chain-mail', 'Half Plate' → 'half-plate'.
 *
 * Serve a chi legge un export: `armor` porta il nome inglese di
 * visualizzazione, e due grafie diverse dello stesso oggetto ('Chain Mail' e
 * 'Chain mail') fanno fallire in silenzio il calcolo della CA — un guerriero
 * in cotta di maglia risultava senza armatura, con CA 11 invece di 16.
 */
export function armorSlug(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

/**
 * Slug dell'armatura indossata, o '' se il nome non corrisponde a nessuna
 * armatura del listino (campo libero, nome tradotto, scheda a mano).
 */
export function armorIdFromName(name: string): string {
  if (!name) return ''
  const slug = armorSlug(name)
  return armorTable.some(a => armorSlug(a.name) === slug) ? slug : ''
}

/** L'armatura del listino che porta questo slug. */
export function findArmorById(armorId: string): ArmorData | undefined {
  if (!armorId) return undefined
  return armorTable.find(a => armorSlug(a.name) === armorId)
}

/**
 * Il minimo di cui ha bisogno il calcolo della CA. La classe serve per la
 * Difesa senza Armatura di monaco e barbaro ed è facoltativa: chi non la passa
 * ottiene il calcolo di prima. `armorId` è altrettanto facoltativo: le schede
 * salvate prima della sua introduzione non ce l'hanno.
 */
export type ArmorClassInput =
  Pick<CharacterData, 'armor' | 'shield' | 'abilityScores' | 'racialBonuses'>
  & Partial<Pick<CharacterData, 'className' | 'classes' | 'armorId' | 'armorClassOverride'>>

/**
 * Classe Armatura completa: armatura indossata, limite di Destrezza della sua
 * categoria e scudo. Unica fonte di verità per il riepilogo, la scheda PDF e
 * la vista del blog, che prima calcolavano ciascuna la propria (le prime due
 * ignorando del tutto armatura e scudo).
 */
export function computeArmorClass(char: ArmorClassInput): number {
  // Chi ricopia una scheda di carta ha davanti una CA già scritta, spesso
  // figlia di oggetti magici che qui non esistono: se l'ha dichiarata, vale
  // quella e il listino delle armature non ha voce in capitolo. 0 o assente =
  // nessuna dichiarazione, si calcola come sempre.
  const override = char.armorClassOverride ?? 0
  if (override > 0) return override

  const dexMod = modifier(char.abilityScores.dex + (char.racialBonuses.dex || 0))
  // Il nome resta la fonte primaria, così il risultato è identico a quello di
  // prima per ogni scheda già esistente; lo slug interviene solo dove il nome
  // non risolve — una scheda che arriva da fuori con il solo `armorId`.
  const armorData = (char.armor ? armorTable.find(a => a.name === char.armor) : undefined)
    ?? findArmorById(char.armorId ?? '')
  let ac: number
  if (!armorData) {
    // Senza armatura: 10 + mod DES, più la Difesa senza Armatura se la classe
    // la concede. Il monaco somma la Saggezza solo se non impugna uno scudo,
    // il barbaro somma la Costituzione anche con lo scudo al braccio.
    const classIds = [
      char.className ?? '',
      ...(char.classes ?? []).map(c => c.classId),
    ]
    const unarmored: number[] = []
    if (classIds.includes('monk') && !char.shield) {
      unarmored.push(modifier(char.abilityScores.wis + (char.racialBonuses.wis || 0)))
    }
    if (classIds.includes('barbarian')) {
      unarmored.push(modifier(char.abilityScores.con + (char.racialBonuses.con || 0)))
    }
    // Con entrambe le classi si applica la più conveniente delle due.
    ac = 10 + dexMod + (unarmored.length ? Math.max(...unarmored) : 0)
  } else if (armorData.maxDexBonus === 0) {
    // Armatura pesante: CA fissa, la Destrezza non conta
    ac = armorData.baseAC
  } else if (armorData.maxDexBonus !== null) {
    // Armatura media: CA base + mod DES fino al massimo consentito
    ac = armorData.baseAC + Math.min(dexMod, armorData.maxDexBonus)
  } else {
    // Armatura leggera: CA base + mod DES per intero
    ac = armorData.baseAC + dexMod
  }
  if (char.shield) ac += 2
  return ac
}

/** Calculate spell save DC */
export function spellSaveDC(profBonus: number, abilityMod: number): number {
  return 8 + profBonus + abilityMod
}

/** Calculate spell attack bonus */
export function spellAttackBonus(profBonus: number, abilityMod: number): number {
  return profBonus + abilityMod
}

/** Format modifier as string (+N or -N) */
export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`
}

/** Convert feet to meters (D&D metric: 5ft = 1.5m) */
export function feetToMeters(feet: number): string {
  const meters = feet * 0.3
  // Clean up floating-point: 9.000000001 → 9, 7.5 → 7.5
  return Number.isInteger(meters) ? String(meters) : meters.toFixed(1).replace(/\.0$/, '')
}
