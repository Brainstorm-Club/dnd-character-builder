/**
 * Sottoclassi che lanciano incantesimi su un telaio da incantatore di un terzo.
 *
 * Sono l'unico motivo per cui Guerriero e Ladro portano un blocco
 * `spellcasting` con `casterType: 'third'`: un Campione o un Furfante non
 * lancia nulla. Vive qui e non dentro un componente perché la procedura
 * guidata e il generatore casuale devono decidere allo stesso modo.
 */
export const THIRD_CASTER_SUBCLASSES: readonly string[] = ['eldritch-knight', 'arcane-trickster']

/**
 * Vero se la classe lancia davvero incantesimi con la sottoclasse indicata.
 * @param casterType tipo di progressione, o undefined se la classe non lancia
 * @param subclassId sottoclasse scelta ('' se non ancora scelta)
 */
export function castsSpells(casterType: string | undefined | null, subclassId: string): boolean {
  if (!casterType) return false
  if (casterType !== 'third') return true
  return THIRD_CASTER_SUBCLASSES.includes(subclassId)
}
