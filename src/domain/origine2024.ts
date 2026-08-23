// Regole d'origine di D&D 2024 (SRD 5.2.1), in funzioni pure.
//
// Nel 2024 la specie non concede più punteggi di caratteristica: li concede il
// background, che elenca tre caratteristiche e ne fa salire una di 2 e un'altra
// di 1, e in più dà un talento d'origine.
//
// Queste funzioni non toccano lo store né il personaggio: prendono i dati e
// restituiscono un risultato. Servono perché la regola stava scritta in un solo
// posto — il generatore casuale — e la procedura guidata non la applicava
// affatto: un mago 2024 costruito a mano usciva con sei punteggi nudi e senza
// talento, mentre i test sul generatore restavano verdi.

import type { AbilityKey } from '@/data/dnd5e/classes'
import type { Background } from '@/data/dnd5e/backgrounds'

/** La caratteristica scelta come principale sale di 2. */
export const ORIGIN_MAJOR_BONUS = 2
/** L'altra caratteristica scelta sale di 1. */
export const ORIGIN_MINOR_BONUS = 1

const ABILITY_KEYS: readonly string[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']

/** Scelta del giocatore: quale caratteristica prende il +2 e quale il +1. */
export interface OriginChoice {
  major: AbilityKey | ''
  minor: AbilityKey | ''
}

/** Nessuna scelta ancora fatta: non concede nulla. */
export const NO_ORIGIN_CHOICE: OriginChoice = { major: '', minor: '' }

/** Bonus per caratteristica, nella stessa forma di `racialBonuses`. */
export type OriginBonuses = Partial<Record<AbilityKey, number>>

type MaybeBackground = Pick<Background, 'abilityScoreOptions' | 'originFeat'> | null | undefined

/**
 * Le caratteristiche fra cui il background lascia scegliere.
 * Nel 2014 il campo è assente e l'elenco resta vuoto: è così che le altre tre
 * varianti restano senza selettore, invece di offrirne uno che non dà nulla.
 */
export function originAbilityOptions(bg: MaybeBackground): AbilityKey[] {
  const raw = bg?.abilityScoreOptions ?? []
  // I dati dichiarano `string[]`: tengo solo le sigle che esistono davvero, così
  // un refuso nei dati non diventa un'opzione che poi nessun punteggio riceve.
  return raw.filter((a): a is AbilityKey => ABILITY_KEYS.includes(a))
}

/**
 * Vero solo se il background concede davvero i bonus: servono almeno due
 * caratteristiche fra cui scegliere, altrimenti il +2 e il +1 non hanno dove
 * andare a finire.
 */
export function grantsOriginBonuses(bg: MaybeBackground): boolean {
  return originAbilityOptions(bg).length >= 2
}

/** Nome del talento d'origine come lo scrivono i manuali, '' se non c'è. */
export function originFeatName(bg: MaybeBackground): string {
  return bg?.originFeat ?? ''
}

/**
 * Normalizza un nome di talento per il confronto: i background scrivono
 * "Magic Initiate (Cleric)" mentre il catalogo dei talenti ha "Magic Initiate".
 * Senza togliere la parentesi il talento del chierico non veniva mai trovato e
 * il personaggio restava senza.
 */
function normalizeFeatName(name: string): string {
  return name.replace(/\s*\(.*?\)\s*/g, ' ').trim().toLowerCase()
}

/**
 * Traduce il talento d'origine del background nell'id del catalogo, che è ciò
 * che il personaggio salva in `feat`. Restituisce '' se il talento non esiste
 * nel catalogo passato: meglio nessun talento che un id inventato, che il passo
 * di riepilogo non saprebbe risolvere.
 */
export function originFeatId(
  bg: MaybeBackground,
  feats: readonly { id: string; name: string }[],
): string {
  const wanted = normalizeFeatName(originFeatName(bg))
  if (!wanted) return ''
  const found = feats.find(f => normalizeFeatName(f.name) === wanted)
  return found?.id ?? ''
}

/**
 * I bonus che una scelta concede. Le due caratteristiche valgono una per una:
 * chi ha indicato solo il +2 lo vede già applicato invece di aspettare che il
 * secondo selettore sia pieno. Una caratteristica fuori dalle tre offerte, o
 * ripetuta nei due selettori, non concede nulla — il manuale non lo permette.
 */
export function originBonusMap(
  choice: OriginChoice,
  options: readonly AbilityKey[],
): OriginBonuses {
  const out: OriginBonuses = {}
  const { major, minor } = choice
  if (major && options.includes(major)) out[major] = ORIGIN_MAJOR_BONUS
  if (minor && minor !== major && options.includes(minor)) out[minor] = ORIGIN_MINOR_BONUS
  return out
}

/**
 * Sostituisce nei bonus del personaggio quelli concessi dall'origine, lasciando
 * intatto tutto il resto. Limitarsi a sommare faceva accumulare i bonus di ogni
 * background provato, uno addosso all'altro; azzerare l'intera mappa portava via
 * anche i bonus della specie, che nelle altre tre varianti ci sono eccome.
 */
export function replaceOriginBonuses(
  bonuses: OriginBonuses,
  previous: OriginBonuses,
  next: OriginBonuses,
): OriginBonuses {
  const out: OriginBonuses = { ...bonuses }
  for (const [key, value] of Object.entries(previous)) {
    const k = key as AbilityKey
    out[k] = (out[k] ?? 0) - (value ?? 0)
  }
  for (const [key, value] of Object.entries(next)) {
    const k = key as AbilityKey
    out[k] = (out[k] ?? 0) + (value ?? 0)
  }
  // Una voce a zero non è un bonus: lasciarla scritta faceva comparire
  // "Bonus: +0" accanto alla caratteristica. Una voce negativa non esiste
  // affatto — nessuna specie delle quattro varianti dà malus — e sarebbe solo
  // il segno che la mappa è stata riscritta altrove mentre eravamo via: meglio
  // toglierla che mostrare al giocatore un punteggio sotto il suo valore.
  for (const key of Object.keys(out)) {
    const k = key as AbilityKey
    if ((out[k] ?? 0) <= 0) delete out[k]
  }
  return out
}

/**
 * Rilegge dai bonus salvati la scelta già fatta, per riempire i selettori quando
 * si ricarica una scheda: senza questo il pannello tornava vuoto e la prima
 * modifica sottraeva bonus che credeva di non aver mai concesso.
 * Guarda solo le tre caratteristiche offerte dal background — nel 2024 la specie
 * non dà punteggi, quindi lì dentro non c'è altro.
 */
export function readOriginChoice(
  bonuses: OriginBonuses,
  options: readonly AbilityKey[],
): OriginChoice {
  const major = options.find(a => (bonuses[a] ?? 0) >= ORIGIN_MAJOR_BONUS) ?? ''
  const minor = options.find(a => a !== major && (bonuses[a] ?? 0) === ORIGIN_MINOR_BONUS) ?? ''
  return { major, minor }
}
