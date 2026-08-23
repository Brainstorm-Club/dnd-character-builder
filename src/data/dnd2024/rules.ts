/**
 * Regole di progressione proprie dell'SRD 5.2.1 (regole 2024).
 *
 * Qui vive solo ciò che nel 2024 è cambiato rispetto al 2014: il resto del
 * telaio resta quello di `src/data/dnd5e/rules.ts`, su cui poggiano anche
 * Brancalonia e Apocalisse.
 */

/**
 * Slot incantesimo dei semi-incantatori 2024 (paladino e ranger).
 *
 * Nel 2014 il primo slot arriva al 2º livello; nell'SRD 5.2.1 arriva al 1º —
 * fonte: tabelle "Privilegi del paladino" (p. 70) e "Privilegi del ranger"
 * (p. 75), identiche nella colonna degli slot.
 *
 * Indice 0 = 1º livello del personaggio; ogni riga è [1º, 2º, 3º, 4º, 5º].
 */
export const HALF_CASTER_SLOTS_2024: readonly number[][] = [
  [2],               // Livello 1
  [2],               // Livello 2
  [3],               // Livello 3
  [3],               // Livello 4
  [4, 2],            // Livello 5
  [4, 2],            // Livello 6
  [4, 3],            // Livello 7
  [4, 3],            // Livello 8
  [4, 3, 2],         // Livello 9
  [4, 3, 2],         // Livello 10
  [4, 3, 3],         // Livello 11
  [4, 3, 3],         // Livello 12
  [4, 3, 3, 1],      // Livello 13
  [4, 3, 3, 1],      // Livello 14
  [4, 3, 3, 2],      // Livello 15
  [4, 3, 3, 2],      // Livello 16
  [4, 3, 3, 3, 1],   // Livello 17
  [4, 3, 3, 3, 1],   // Livello 18
  [4, 3, 3, 3, 2],   // Livello 19
  [4, 3, 3, 3, 2],   // Livello 20
]

/**
 * Slot di un semi-incantatore 2024 al livello dato, come mappa
 * livello di incantesimo → numero di slot.
 */
export function getHalfCasterSlotsForLevel2024(level: number): Record<number, number> {
  const result: Record<number, number> = {}
  const slots = HALF_CASTER_SLOTS_2024[level - 1]
  if (!slots) return result
  for (let i = 0; i < slots.length; i++) {
    const count = slots[i]!
    if (count > 0) result[i + 1] = count
  }
  return result
}
