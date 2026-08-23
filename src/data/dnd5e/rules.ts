/**
 * D&D 5e spell slot tables and progression rules
 */

// Full caster spell slots per level (Bard, Cleric, Druid, Sorcerer, Wizard)
// Index 0 = character level 1, each value is an array of slots [1st, 2nd, 3rd, 4th, 5th, 6th, 7th, 8th, 9th]
export const FULL_CASTER_SLOTS: readonly number[][] = [
  [2],                          // Level 1
  [3],                          // Level 2
  [4, 2],                       // Level 3
  [4, 3],                       // Level 4
  [4, 3, 2],                    // Level 5
  [4, 3, 3],                    // Level 6
  [4, 3, 3, 1],                 // Level 7
  [4, 3, 3, 2],                 // Level 8
  [4, 3, 3, 3, 1],              // Level 9
  [4, 3, 3, 3, 2],              // Level 10
  [4, 3, 3, 3, 2, 1],           // Level 11
  [4, 3, 3, 3, 2, 1],           // Level 12
  [4, 3, 3, 3, 2, 1, 1],        // Level 13
  [4, 3, 3, 3, 2, 1, 1],        // Level 14
  [4, 3, 3, 3, 2, 1, 1, 1],     // Level 15
  [4, 3, 3, 3, 2, 1, 1, 1],     // Level 16
  [4, 3, 3, 3, 2, 1, 1, 1, 1],  // Level 17
  [4, 3, 3, 3, 3, 1, 1, 1, 1],  // Level 18
  [4, 3, 3, 3, 3, 2, 1, 1, 1],  // Level 19
  [4, 3, 3, 3, 3, 2, 2, 1, 1],  // Level 20
]

// Half caster spell slots (Paladin, Ranger) - starts at level 2
export const HALF_CASTER_SLOTS: readonly number[][] = [
  [],                // Level 1
  [2],               // Level 2
  [3],               // Level 3
  [3],               // Level 4
  [4, 2],            // Level 5
  [4, 2],            // Level 6
  [4, 3],            // Level 7
  [4, 3],            // Level 8
  [4, 3, 2],         // Level 9
  [4, 3, 2],         // Level 10
  [4, 3, 3],         // Level 11
  [4, 3, 3],         // Level 12
  [4, 3, 3, 1],      // Level 13
  [4, 3, 3, 1],      // Level 14
  [4, 3, 3, 2],      // Level 15
  [4, 3, 3, 2],      // Level 16
  [4, 3, 3, 3, 1],   // Level 17
  [4, 3, 3, 3, 1],   // Level 18
  [4, 3, 3, 3, 2],   // Level 19
  [4, 3, 3, 3, 2],   // Level 20
]

// Third caster spell slots (Eldritch Knight, Arcane Trickster) - starts at level 3
export const THIRD_CASTER_SLOTS: readonly number[][] = [
  [],           // Level 1
  [],           // Level 2
  [2],          // Level 3
  [3],          // Level 4
  [3],          // Level 5
  [3],          // Level 6
  [4, 2],       // Level 7
  [4, 2],       // Level 8
  [4, 2],       // Level 9
  [4, 3],       // Level 10
  [4, 3],       // Level 11
  [4, 3],       // Level 12
  [4, 3, 2],    // Level 13
  [4, 3, 2],    // Level 14
  [4, 3, 2],    // Level 15
  [4, 3, 3],    // Level 16
  [4, 3, 3],    // Level 17
  [4, 3, 3],    // Level 18
  [4, 3, 3, 1], // Level 19
  [4, 3, 3, 1], // Level 20
]

// Warlock pact magic slots
export const PACT_MAGIC_SLOTS: readonly { slots: number; slotLevel: number }[] = [
  { slots: 1, slotLevel: 1 }, // Level 1
  { slots: 2, slotLevel: 1 }, // Level 2
  { slots: 2, slotLevel: 2 }, // Level 3
  { slots: 2, slotLevel: 2 }, // Level 4
  { slots: 2, slotLevel: 3 }, // Level 5
  { slots: 2, slotLevel: 3 }, // Level 6
  { slots: 2, slotLevel: 4 }, // Level 7
  { slots: 2, slotLevel: 4 }, // Level 8
  { slots: 2, slotLevel: 5 }, // Level 9
  { slots: 2, slotLevel: 5 }, // Level 10
  { slots: 3, slotLevel: 5 }, // Level 11
  { slots: 3, slotLevel: 5 }, // Level 12
  { slots: 3, slotLevel: 5 }, // Level 13
  { slots: 3, slotLevel: 5 }, // Level 14
  { slots: 3, slotLevel: 5 }, // Level 15
  { slots: 3, slotLevel: 5 }, // Level 16
  { slots: 4, slotLevel: 5 }, // Level 17
  { slots: 4, slotLevel: 5 }, // Level 18
  { slots: 4, slotLevel: 5 }, // Level 19
  { slots: 4, slotLevel: 5 }, // Level 20
]

export type CasterType = 'full' | 'half' | 'third' | 'pact'

/** Caster type multipliers for multiclass spell slot calculation */
const CASTER_MULTIPLIERS: Record<CasterType, number> = {
  full: 1,
  half: 0.5,
  third: 1 / 3,
  pact: 0, // Warlock pact magic is separate
}

/** Come arrotondare i livelli dei semi-incantatori nel conto multiclasse. */
export type HalfCasterRounding = 'down' | 'up'

export interface MulticlassOptions {
  /**
   * Nel 2014 metà dei livelli di paladino e ranger si arrotonda per difetto,
   * ed è il valore predefinito qui. L'SRD 5.2.1 arrotonda per eccesso: quella
   * regola è dichiarata in `src/data/dnd2024/rules.ts`, non qui.
   */
  halfCasterRounding?: HalfCasterRounding
}

/**
 * Calculate multiclass spell slots.
 * Each class contributes to the effective caster level based on its type.
 * Warlock pact magic is kept separate.
 */
export function getMulticlassSpellSlots(
  classes: { classId: string; level: number; casterType: CasterType | null }[],
  options: MulticlassOptions = {},
): { slots: Record<number, number>; pactSlots: Record<number, number> } {
  // L'arrotondamento riguarda solo i semi-incantatori: il terzo incantatore
  // resta per difetto in entrambe le edizioni (e nel 2024 non esiste affatto).
  const roundHalf = options.halfCasterRounding === 'up' ? Math.ceil : Math.floor
  let effectiveCasterLevel = 0
  const pactSlots: Record<number, number> = {}

  for (const cls of classes) {
    if (!cls.casterType) continue

    if (cls.casterType === 'pact') {
      // Warlock pact magic handled separately
      const pact = PACT_MAGIC_SLOTS[cls.level - 1]
      if (pact && pact.slots > 0) {
        pactSlots[pact.slotLevel] = (pactSlots[pact.slotLevel] || 0) + pact.slots
      }
    } else {
      const round = cls.casterType === 'half' ? roundHalf : Math.floor
      effectiveCasterLevel += round(cls.level * CASTER_MULTIPLIERS[cls.casterType])
    }
  }

  const slots: Record<number, number> = {}
  if (effectiveCasterLevel > 0) {
    const capped = Math.min(effectiveCasterLevel, 20)
    const table = FULL_CASTER_SLOTS[capped - 1]
    if (table) {
      for (let i = 0; i < table.length; i++) {
        if (table[i]! > 0) {
          slots[i + 1] = table[i]!
        }
      }
    }
  }

  return { slots, pactSlots }
}

/**
 * Get spell slots for a given class and level.
 * Returns an object mapping spell level (1-9) to number of slots.
 */
export function getSpellSlotsForLevel(casterType: CasterType, level: number): Record<number, number> {
  const result: Record<number, number> = {}

  if (casterType === 'pact') {
    const pact = PACT_MAGIC_SLOTS[level - 1]
    if (pact && pact.slots > 0) {
      result[pact.slotLevel] = pact.slots
    }
    return result
  }

  let table: readonly number[][]
  switch (casterType) {
    case 'full': table = FULL_CASTER_SLOTS; break
    case 'half': table = HALF_CASTER_SLOTS; break
    case 'third': table = THIRD_CASTER_SLOTS; break
  }

  const slots = table[level - 1]
  if (slots) {
    for (let i = 0; i < slots.length; i++) {
      const slotCount = slots[i]!
      if (slotCount > 0) {
        result[i + 1] = slotCount
      }
    }
  }

  return result
}
