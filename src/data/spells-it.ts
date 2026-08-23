// Testo italiano integrale degli incantesimi, caricato su richiesta.
//
// I nomi degli incantesimi sono già tradotti in `src/i18n/gameTerms.ts`; qui
// c'è quello che mancava, cioè il testo che serve quando l'incantesimo si usa
// al tavolo. Le descrizioni inglesi dei dati (`dnd5e/spells.ts`) restano le
// prime frasi del manuale: bastano a costruire un personaggio, non a giocarlo.
//
// Il testo viene dall'SRD italiano (5.1 per il 2014, 5.2.1 per il 2024),
// CC-BY-4.0 — l'attribuzione sta in DATA-SOURCES.md e nella pagina Crediti.
//
// WSG 3.3 + 3.8: sono ~600 KB di prosa, il blocco di dati più grosso
// dell'applicazione. Non entra nel bundle iniziale e non entra nemmeno nel
// chunk degli incantesimi: sta in due moduli a sé, uno per edizione, importati
// dinamicamente solo quando l'interfaccia è in italiano e solo dal passo che
// li mostra. Chi gioca in inglese non li scarica mai, e chi gioca in italiano
// ne scarica una sola edizione.
//
// A differenza degli altri moduli dati, questi NON finiscono in localStorage:
// la cache serve a evitare un download, ma qui il round-trip JSON costerebbe
// più del parsing del modulo e mangerebbe da solo mezza quota del dominio.
// Il service worker li ha già in precache, che è la cache giusta per un file
// che non cambia mai fra un build e l'altro.

import type { GameVariant } from '@/stores/app'

/** Il testo di un incantesimo, come lo stampa l'SRD italiano. */
export interface SpellTextIt {
  /** Corpo dell'incantesimo. I ritorni a capo separano i capoversi. */
  testo: string
  /**
   * Il capoverso «A livelli superiori» / «Usando uno slot di livello
   * superiore», quando l'incantesimo ce l'ha.
   */
  aLivelliSuperiori?: string
}

type MappaTesti = Record<string, SpellTextIt>

/** L'edizione dell'SRD da cui pescare il testo, per variante di gioco. */
export type SpellTextEdition = '2014' | '2024'

/**
 * Brancalonia e Apocalisse girano sulle regole 2014 e riusano quella lista
 * incantesimi: prendono lo stesso testo di `dnd5e`. Gli incantesimi propri dei
 * due manuali di Acheron non stanno nell'SRD e restano senza voce qui — la
 * loro descrizione è già in italiano nei rispettivi dati.
 */
export function spellTextEdition(variant: GameVariant): SpellTextEdition {
  return variant === 'dnd2024' ? '2024' : '2014'
}

const testi: Record<SpellTextEdition, MappaTesti | null> = { 2014: null, 2024: null }
const inCorso: Record<SpellTextEdition, Promise<void> | null> = { 2014: null, 2024: null }

/** Carica (una volta sola) il testo italiano dell'edizione che serve. */
export function ensureSpellTextsIt(variant: GameVariant): Promise<void> {
  const ed = spellTextEdition(variant)
  if (testi[ed]) return Promise.resolve()
  if (inCorso[ed]) return inCorso[ed]
  const caricamento =
    ed === '2024'
      ? import('./dnd2024/spells-it').then(m => { testi['2024'] = m.dnd2024SpellTextsIt })
      : import('./dnd5e/spells-it').then(m => { testi['2014'] = m.dnd5eSpellTextsIt })
  // Un import fallito (rete giù, chunk scaduto) non deve bloccare per sempre
  // il passo incantesimi: si azzera la promessa e il tentativo dopo riprova.
  inCorso[ed] = caricamento.catch(() => { inCorso[ed] = null })
  return inCorso[ed]
}

/** Vero quando il testo dell'edizione è in memoria. */
export function spellTextsItLoaded(variant: GameVariant): boolean {
  return testi[spellTextEdition(variant)] !== null
}

/**
 * Il testo italiano di un incantesimo, se c'è.
 *
 * Torna `undefined` — e chi chiama ricade sulla descrizione inglese — per gli
 * incantesimi fuori SRD (*Blade Ward* e *Hex* nel 2014), per quelli di
 * Brancalonia e Apocalisse, e finché `ensureSpellTextsIt` non ha finito.
 */
export function getSpellTextIt(variant: GameVariant, spellId: string): SpellTextIt | undefined {
  return testi[spellTextEdition(variant)]?.[spellId]
}
