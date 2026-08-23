import type { CharacterData, AbilityScores } from '@/stores/character'
import { modifier, proficiencyBonus } from '@/utils/calculations'

/**
 * I valori derivati di una scheda, calcolati dal solo personaggio.
 *
 * Servono perché la scheda va mostrata in due posti: il riepilogo della
 * procedura guidata, dove il personaggio sta nello store, e la pagina di un
 * personaggio pronto, dove è un oggetto qualunque letto dai dati. Finché il
 * calcolo passava dai getter dello store, il secondo non poteva riusarlo — ed
 * è il motivo per cui le due pagine avevano finito per mostrare cose diverse.
 */
export type Caratteristica = keyof AbilityScores

export const CARATTERISTICHE: readonly Caratteristica[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']

/** Punteggio pieno: base più i bonus, comunque siano arrivati. */
export function punteggioTotale(char: CharacterData, a: Caratteristica): number {
  return char.abilityScores[a] + (char.racialBonuses[a] || 0)
}

/** Modificatore del punteggio pieno. */
export function modificatore(char: CharacterData, a: Caratteristica): number {
  return modifier(punteggioTotale(char, a))
}

/** Tutti e sei i modificatori in un colpo. */
export function modificatori(char: CharacterData): Record<Caratteristica, number> {
  return Object.fromEntries(
    CARATTERISTICHE.map(a => [a, modificatore(char, a)]),
  ) as Record<Caratteristica, number>
}

/**
 * Bonus di un tiro salvezza: modificatore più competenza se la classe la dà.
 */
export function tiroSalvezza(char: CharacterData, a: Caratteristica): number {
  const comp = char.savingThrowProficiencies.includes(a) ? proficiencyBonus(char.level) : 0
  return modificatore(char, a) + comp
}

/**
 * Bonus di un'abilità: modificatore, più competenza se c'è, più un'altra volta
 * la competenza se l'abilità è raddoppiata.
 */
export function bonusAbilita(
  char: CharacterData,
  skillId: string,
  caratteristica: Caratteristica,
): number {
  const pb = proficiencyBonus(char.level)
  const comp = char.skillProficiencies.includes(skillId) ? pb : 0
  const raddoppio = char.skillExpertise.includes(skillId) ? pb : 0
  return modificatore(char, caratteristica) + comp + raddoppio
}
