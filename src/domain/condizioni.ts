// Riconoscere le condizioni citate dentro un testo di regole.
//
// Il builder costruisce personaggi, non li gioca: qui non c'è nessuno stato
// «il personaggio è spaventato». C'è solo il lavoro di rendere consultabile un
// nome che l'interfaccia già stampa — un privilegio che dice «il bersaglio è
// spaventato» adesso può dire anche cosa significa.
//
// Logica pura, senza Vue: il componente si limita a disegnarne il risultato.

import type { Condition } from '@/data/dnd5e/conditions'

/** Un pezzo di testo. Con `condizione` se quel pezzo è il nome di una condizione. */
export interface SegmentoTesto {
  testo: string
  condizione?: Condition
}

const LETTERA = /\p{L}/u

/** Metacaratteri di regex nel nome (nessuno oggi, ma i nomi vengono dai dati). */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Le forme sotto cui un nome può comparire in un testo.
 *
 * In italiano le condizioni sono quasi tutte aggettivi e si accordano con chi
 * le subisce: il manuale scrive «accecato», «accecata», «accecati». Cercare la
 * sola forma maschile singolare avrebbe agganciato meno della metà delle
 * citazioni. Si flette la prima parola e basta: «Privo di sensi» diventa
 * «priv(o|a|i|e) di sensi», non «privo di sens(o|a|i|e)».
 *
 * In inglese i nomi sono invariabili e si cerca la parola così com'è.
 */
export function formeDelNome(nome: string, locale: string): string {
  if (locale !== 'it') return escapeRegex(nome)
  const parti = nome.split(' ')
  const prima = parti[0] ?? ''
  const resto = parti.slice(1)
  const coda = resto.length ? ' ' + resto.map(escapeRegex).join(' ') : ''
  const p = escapeRegex(prima)
  if (/o$/i.test(prima)) return `${p.slice(0, -1)}[oaie]${coda}`
  if (/e$/i.test(prima)) return `${p.slice(0, -1)}[ei]${coda}`
  return p + coda
}

function nomeDi(c: Condition, locale: string): string {
  return locale === 'it' ? c.nameIt : c.name
}

/**
 * Spezza il testo nei segmenti che citano una condizione e in quelli che non
 * la citano. Se non ne cita nessuna torna un solo segmento: chi disegna non
 * deve trattare il caso vuoto in modo speciale.
 */
export function annotaCondizioni(
  testo: string,
  condizioni: readonly Condition[],
  locale: string,
): SegmentoTesto[] {
  if (!testo || condizioni.length === 0) return [{ testo }]

  // Le alternative più lunghe per prime: «privo di sensi» non deve perdere
  // contro un'eventuale alternativa più corta che ne pareggi l'inizio.
  const voci = condizioni
    .map(c => ({ condizione: c, forma: formeDelNome(nomeDi(c, locale), locale) }))
    .sort((a, b) => b.forma.length - a.forma.length)

  const combinata = new RegExp(voci.map(v => `(?:${v.forma})`).join('|'), 'giu')
  const singole = voci.map(v => ({ condizione: v.condizione, re: new RegExp(`^(?:${v.forma})$`, 'iu') }))

  const segmenti: SegmentoTesto[] = []
  let cursore = 0
  for (const match of testo.matchAll(combinata)) {
    const inizio = match.index
    const fine = inizio + match[0].length
    // Confine di parola calcolato a mano invece che con lookbehind: Safari lo
    // ha aggiunto tardi, e `\b` sbaglia comunque sulle lettere accentate.
    const prima = inizio > 0 ? testo[inizio - 1]! : ''
    const dopo = fine < testo.length ? testo[fine]! : ''
    if ((prima && LETTERA.test(prima)) || (dopo && LETTERA.test(dopo))) continue

    const voce = singole.find(v => v.re.test(match[0]))
    if (!voce) continue

    if (inizio > cursore) segmenti.push({ testo: testo.slice(cursore, inizio) })
    segmenti.push({ testo: match[0], condizione: voce.condizione })
    cursore = fine
  }
  if (cursore < testo.length) segmenti.push({ testo: testo.slice(cursore) })
  return segmenti.length ? segmenti : [{ testo }]
}
