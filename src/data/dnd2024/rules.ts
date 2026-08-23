/**
 * Regole di progressione proprie dell'SRD 5.2.1 (regole 2024).
 *
 * Qui vive solo ciò che nel 2024 è cambiato rispetto al 2014: il resto del
 * telaio resta quello di `src/data/dnd5e/rules.ts`, su cui poggiano anche
 * Brancalonia e Apocalisse.
 */
import { getMulticlassSpellSlots, type CasterType } from '../dnd5e/rules'

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

/**
 * Slot incantesimo di un personaggio multiclasse secondo l'SRD 5.2.1
 * (p. 28, «Incantesimi» → «Slot incantesimo»).
 *
 * Rispetto al 2014 cambia una parola sola, e pesa: metà dei livelli di
 * paladino e ranger si arrotonda **per eccesso**, non per difetto. Un
 * paladino 1/mago 1 nel 2014 conta come incantatore di 1º livello, nel 2024
 * come incantatore di 2º.
 *
 * Il resto del conto non cambia: la tabella «Incantatore multiclasse» ripete
 * riga per riga quella dell'incantatore pieno, la magia del patto del warlock
 * resta un serbatoio a parte, e il terzo incantatore nel 2024 non esiste
 * (guerriero e ladro non hanno il privilegio Incantesimi nei dati 2024).
 */
export function getMulticlassSpellSlots2024(
  classes: { classId: string; level: number; casterType: CasterType | null }[],
): { slots: Record<number, number>; pactSlots: Record<number, number> } {
  return getMulticlassSpellSlots(classes, { halfCasterRounding: 'up' })
}
