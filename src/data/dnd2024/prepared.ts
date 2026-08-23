// Colonna «Incantesimi preparati» delle tabelle di classe di D&D 2024.
//
// GENERATO DA scripts/import-prepared-2024.ts — non modificare a mano.
// Fonte: System Reference Document 5.2.1 italiano (Wizards of the Coast,
// CC-BY-4.0), tabelle di classe, via il pacchetto dati di dnd-companion.
//
// Nel 2014 il numero di incantesimi preparati era una formula («modificatore
// di caratteristica + livello»); nel 2024 è un numero stampato, uno per
// livello, e le classi non lo condividono: paladino e ranger (mezzi
// incantatori) crescono più piano, il warlock ha una progressione sua, e il
// mago si stacca dagli altri incantatori pieni nella seconda metà della
// tabella. Per questo la tabella sta nei dati e non in una formula.

/** Progressione dal 1° al 20° livello, indicizzata per id di classe. */
export const DND2024_PREPARED_SPELLS: Readonly<Record<string, readonly number[]>> = {
  bard:     [ 4,  5,  6,  7,  9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22],
  cleric:   [ 4,  5,  6,  7,  9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22],
  druid:    [ 4,  5,  6,  7,  9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22],
  paladin:  [ 2,  3,  4,  5,  6,  6,  7,  7,  9,  9, 10, 10, 11, 11, 12, 12, 14, 14, 15, 15],
  ranger:   [ 2,  3,  4,  5,  6,  6,  7,  7,  9,  9, 10, 10, 11, 11, 12, 12, 14, 14, 15, 15],
  sorcerer: [ 2,  4,  6,  7,  9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22],
  warlock:  [ 2,  3,  4,  5,  6,  7,  8,  9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15],
  wizard:   [ 4,  5,  6,  7,  9, 10, 11, 12, 14, 15, 16, 16, 17, 18, 19, 21, 22, 23, 24, 25],
}

/**
 * Quanti incantesimi prepara la classe indicata al livello dato, secondo la
 * tabella del 2024. `null` se la classe non ha quella colonna (non è un
 * incantatore del 2024, o è una classe di un'altra ambientazione).
 */
export function getPreparedSpells2024(classId: string, level: number): number | null {
  const table = DND2024_PREPARED_SPELLS[classId]
  if (!table) return null
  const idx = Math.min(Math.max(level, 1), table.length) - 1
  return table[idx] ?? null
}
