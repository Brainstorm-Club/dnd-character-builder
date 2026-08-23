// Il testo italiano di una voce di regole, e cosa fare quando non c'è.
//
// L'app traduce da sempre i **nomi** di tutto (`src/i18n/gameTerms.ts`) e i
// **testi** dei privilegi delle classi base (`classes-it.ts`). Restavano fuori
// tre categorie, e ognuna sbagliava a modo suo:
//
//  · i **tratti razziali** non hanno testo in nessuna lingua, e la pagina
//    Razza mostrava il solo nome, senza dire che il resto non esiste;
//  · i **privilegi di background** hanno solo il testo inglese, e la pagina
//    Background lo stampava così com'è, in mezzo a un'interfaccia italiana,
//    senza dichiararlo;
//  · i **privilegi di sottoclasse del 2014** sono nella stessa condizione, e
//    il passo Classe faceva lo stesso.
//
// Da qui i tre stati. `soloInglese` non è un ripiego silenzioso: è un'etichetta
// che l'interfaccia deve mostrare, perché chi legge sappia che quel paragrafo
// è la fonte inglese e non una traduzione. E dove l'SRD italiano non ha il
// testo nessuno lo inventa: la voce resta col suo nome e con il buco
// dichiarato. Un buco dichiarato è preferibile a un testo plausibile e non
// verificabile.

import { getFeatureDescription, getTraitDescription } from './index'
import { SRD_IT_DESCRIPTIONS } from './srd-it-descriptions'
import type { GameVariant } from '@/stores/app'

export type TestoSrd =
  /** C'è il testo nella lingua chiesta. */
  | { stato: 'presente', testo: string }
  /** Si chiedeva l'italiano; l'SRD ha solo l'inglese, ed è questo. */
  | { stato: 'soloInglese', testo: string }
  /** La fonte non descrive questa voce in nessuna lingua. */
  | { stato: 'assente' }

const ASSENTE: TestoSrd = { stato: 'assente' }

/**
 * L'edizione delle regole a cui appartiene una variante. Brancalonia e
 * Apocalisse costruiscono sul 2014 e ne condividono i testi, come già fa
 * `getFeatureDescription`.
 */
function edizione(variant: GameVariant): '2014' | '2024' {
  return variant === 'dnd2024' ? '2024' : '2014'
}

/**
 * L'id con cui l'SRD indicizza il privilegio di un background. Nei dati del
 * builder quel privilegio ha solo un nome; nei pacchetti SRD ha un id, ed è
 * lo slug del nome inglese. Ogni gruppo di caratteri non alfanumerici diventa
 * un trattino, apostrofi compresi: "Ship's Passage" → `ship-s-passage`, non
 * `ships-passage`. È la stessa regola che genera gli id nel pacchetto, e lo
 * script di importazione verifica voce per voce che le due forme coincidano —
 * quindi questa funzione non è un'ipotesi ma un invariante controllato.
 */
export function slugPrivilegioBackground(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Il testo italiano per un id, scritto a mano o importato dall'SRD. */
function italiano(variant: GameVariant, id: string): string {
  if (!id) return ''
  // I testi scritti a mano vincono: sono quelli che il resto dell'app usa, e
  // l'importatore si rifiuta di duplicarli.
  const aMano = getFeatureDescription(variant, id, 'it', '')
  if (aMano) return aMano
  return SRD_IT_DESCRIPTIONS[edizione(variant)][id] ?? ''
}

function esito(locale: string, testoIt: string, testoEn: string): TestoSrd {
  if (locale !== 'it') return testoEn ? { stato: 'presente', testo: testoEn } : ASSENTE
  if (testoIt) return { stato: 'presente', testo: testoIt }
  return testoEn ? { stato: 'soloInglese', testo: testoEn } : ASSENTE
}

/**
 * Il testo di un privilegio di classe o di sottoclasse. `testoEn` è la
 * descrizione inglese che sta nei dati, quando c'è.
 */
export function testoPrivilegio(
  variant: GameVariant,
  featureId: string,
  locale: string,
  testoEn: string,
): TestoSrd {
  return esito(locale, italiano(variant, featureId), testoEn.trim())
}

/**
 * Il testo di un tratto razziale. Nei dati il tratto è un solo id, senza
 * descrizione: l'inglese, quando esiste, sta nelle mappe di Brancalonia e
 * Apocalisse, che i loro manuali descrivono in entrambe le lingue.
 */
export function testoTratto(
  variant: GameVariant,
  traitId: string,
  locale: string,
): TestoSrd {
  if (!traitId) return ASSENTE
  const testoEn = getTraitDescription(variant, traitId, 'en').trim()
  if (locale !== 'it') return esito(locale, '', testoEn)

  const aMano = italiano(variant, traitId)
  if (aMano) return { stato: 'presente', testo: aMano }
  // `getTraitDescription` ripiega da sé sull'inglese quando l'italiano manca:
  // per distinguere una traduzione da un ripiego si confrontano le due rese.
  // Le mappe it ed en di Brancalonia e Apocalisse sono in lingue diverse,
  // quindi l'uguaglianza significa ripiego, non coincidenza.
  const reso = getTraitDescription(variant, traitId, 'it').trim()
  if (reso && reso !== testoEn) return { stato: 'presente', testo: reso }
  return esito(locale, '', testoEn)
}

/**
 * Il testo del privilegio concesso da un background. Il builder lo tiene per
 * nome e con la sola descrizione inglese; l'italiano, se e quando l'SRD lo
 * darà, arriva per id.
 *
 * `testoItGiaRisolto` è l'italiano che il chiamante ha già trovato per altra
 * via. Serve al 2024, dove il privilegio del background **è** il talento
 * d'origine e il suo testo sta nel catalogo dei talenti
 * (`dnd2024/feats-it.ts`), che questo modulo non importa per non trascinarlo
 * in ogni passo del wizard.
 */
export function testoPrivilegioBackground(
  variant: GameVariant,
  featureName: string,
  locale: string,
  testoEn: string,
  testoItGiaRisolto = '',
): TestoSrd {
  const id = slugPrivilegioBackground(featureName)
  return esito(locale, italiano(variant, id) || testoItGiaRisolto.trim(), testoEn.trim())
}
