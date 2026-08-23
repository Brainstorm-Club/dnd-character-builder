import type { GameVariant } from '@/stores/app'

/**
 * Descrittore di una variante di gioco: tutto ciò che l'interfaccia deve sapere
 * per mostrarla (emoji, colori, link all'editore) in un posto solo.
 *
 * Prima questi dati erano riscritti a mano in cinque viste con dizionari
 * `Record<string, ...>`: 'dnd2024' era stato dimenticato in quattro su cinque,
 * e chi sceglieva le regole 2024 vedeva riquadri senza bordo e link senza href.
 * L'unico dizionario che non l'aveva dimenticato era l'unico tipizzato
 * `Record<GameVariant, ...>`: è il tipo a difendere, non l'attenzione.
 */
export interface DescrittoreVariante {
  readonly id: GameVariant
  /** Emoji identificativa (sempre decorativa: va marcata aria-hidden) */
  readonly emoji: string
  /** Distintivo compatto: sfondo + testo */
  readonly badge: string
  /** Solo colore del testo, per i titoli di sezione */
  readonly text: string
  /** Bordo delle schede */
  readonly border: string
  /** Bordo delle schede cliccabili, stato a riposo + hover */
  readonly borderHover: string
  /** Bordo tenue del riquadro promozionale */
  readonly promoBorder: string
  /** Link testuali dentro il riquadro promozionale */
  readonly link: string
  /** Pulsante primario della scheda in home */
  readonly button: string
  /** Pagina dell'editore. Stringa vuota = nessun link da mostrare. */
  readonly publisherUrl: string
  /** Nome dell'editore/negozio, usato come testo del link */
  readonly publisherLabel: string
  /** Scheda Amazon. Stringa vuota = nessun link da mostrare. */
  readonly amazonUrl: string
}

const DRIVETHRU_WOTC = 'https://www.drivethrurpg.com/en/publisher/44/wizards-of-the-coast?affiliate_id=2960765'

/**
 * `Record<GameVariant, ...>` e non `Record<string, ...>`: aggiungere una quinta
 * variante a GAME_VARIANTS senza descriverla qui non compila più.
 */
export const VARIANT_INFO: Record<GameVariant, DescrittoreVariante> = {
  dnd5e: {
    id: 'dnd5e',
    emoji: '🐉',
    badge: 'bg-amber-900/40 text-amber-400',
    text: 'text-amber-400',
    border: 'border-amber-600/40',
    borderHover: 'border-amber-600/40 hover:border-amber-500/60',
    promoBorder: 'border-amber-700/20',
    link: 'text-amber-400 hover:text-amber-300',
    button: 'bg-amber-600 hover:bg-amber-500 text-stone-900',
    publisherUrl: DRIVETHRU_WOTC,
    publisherLabel: 'DriveThruRPG',
    amazonUrl: 'https://amzn.to/4uwKY7w',
  },
  dnd2024: {
    id: 'dnd2024',
    emoji: '⚔️',
    badge: 'bg-sky-900/40 text-sky-400',
    text: 'text-sky-400',
    border: 'border-sky-600/40',
    borderHover: 'border-sky-600/40 hover:border-sky-500/60',
    promoBorder: 'border-sky-700/20',
    link: 'text-sky-400 hover:text-sky-300',
    button: 'bg-sky-600 hover:bg-sky-500 text-stone-900',
    // Stesso editore delle regole 2014: la pagina WotC vende anche i manuali 2024.
    publisherUrl: DRIVETHRU_WOTC,
    publisherLabel: 'DriveThruRPG',
    // Nessun link affiliato Amazon per i manuali 2024: meglio nessun link che
    // un <a> senza href, che non è raggiungibile né da tastiera né da lettore
    // di schermo. Il componente promo salta i link con URL vuoto.
    amazonUrl: '',
  },
  brancalonia: {
    id: 'brancalonia',
    emoji: '🥘',
    badge: 'bg-emerald-900/40 text-emerald-400',
    text: 'text-emerald-400',
    border: 'border-emerald-600/40',
    borderHover: 'border-emerald-600/40 hover:border-emerald-500/60',
    promoBorder: 'border-emerald-700/20',
    link: 'text-emerald-400 hover:text-emerald-300',
    button: 'bg-emerald-600 hover:bg-emerald-500 text-stone-900',
    publisherUrl: 'https://www.drivethrurpg.com/en/browse?affiliate_id=2960765&keyword=brancalonia',
    publisherLabel: 'DriveThruRPG',
    amazonUrl: 'https://amzn.to/4b8f8F3',
  },
  apocalisse: {
    id: 'apocalisse',
    emoji: '🔥',
    badge: 'bg-red-900/40 text-red-400',
    text: 'text-red-400',
    border: 'border-red-600/40',
    borderHover: 'border-red-600/40 hover:border-red-500/60',
    promoBorder: 'border-red-700/20',
    link: 'text-red-400 hover:text-red-300',
    button: 'bg-red-600 hover:bg-red-500 text-stone-100',
    publisherUrl: 'https://www.drivethrurpg.com/en/publisher/9086/acheron-games/category/44511/apocalisse?affiliate_id=2960765',
    publisherLabel: 'DriveThruRPG',
    amazonUrl: 'https://amzn.to/4cwNjc1',
  },
}

/**
 * Descrittore di una variante. Accetta `undefined` perché i personaggi salvati
 * prima dell'introduzione delle varianti non hanno il campo: ricadono su dnd5e,
 * come fa il resto dell'app quando legge `char.variant`.
 */
export function variantInfo(variant: GameVariant | undefined): DescrittoreVariante {
  return VARIANT_INFO[variant ?? 'dnd5e'] ?? VARIANT_INFO.dnd5e
}

/**
 * Ordine delle schede in home: prima le due ambientazioni italiane, poi le due
 * edizioni di D&D su cui sono costruite.
 */
export const HOME_VARIANT_ORDER: readonly GameVariant[] = ['brancalonia', 'apocalisse', 'dnd5e', 'dnd2024']
