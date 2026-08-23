/**
 * La scheda personaggio come QR code.
 *
 * Non c'e' un server dietro a questo progetto, quindi il QR non puo' essere
 * un puntatore a qualcosa: deve portarsi dietro il personaggio per intero.
 * Da qui i due vincoli che decidono tutto il resto.
 *
 * Il primo e' la capienza. Un QR code arriva a 2.953 byte, e solo nella
 * versione piu' fitta e con la correzione d'errore piu' debole. Il link di
 * condivisione cosi' com'e' ne occupa da 4.300 a 6.400: non ci sta, e non e'
 * questione di margini. Compresso lo stesso personaggio scende a 1.550-2.150
 * e ci sta — con poco spazio davanti.
 *
 * Il secondo e' che quel poco spazio finisce. Un giocatore che scrive un
 * trascorso lungo sfonda il tetto. Invece di produrre un codice troncato, o
 * di rifiutarsi e basta, qui si lascia indietro il testo libero e si dice a
 * chi guarda che cosa e' rimasto fuori: una scheda senza il racconto si
 * rimette a posto in un minuto, un QR che non si legge no.
 *
 * Il disegno esce in SVG e non in PNG: si stampa nitido a qualunque misura,
 * pesa una frazione, e il progetto non usa immagini raster (WSG 3.5).
 */
import type { CharacterData } from '@/stores/character'
import { encodeCharacterCompressed, baseCondivisione, sappiamoComprimere } from './shareCharacter'

/** Correzione d'errore, dalla piu' robusta alla piu' capiente. */
export type Correzione = 'M' | 'L'

export interface QrScheda {
  /** Il disegno, pronto da mettere in pagina o da salvare. */
  readonly svg: string
  /** L'indirizzo racchiuso nel codice. */
  readonly url: string
  /** Byte effettivamente codificati. */
  readonly byte: number
  /** Versione QR risultante (1-40): piu' alta = piu' fitto. */
  readonly versione: number
  readonly correzione: Correzione
  /** Vero se per farcelo stare si e' lasciato fuori il testo libero. */
  readonly ridotto: boolean
}

type Fabbrica = typeof import('qrcode-generator')

/** Il modulo del QR e' pesante e serve solo qui: si carica quando serve. */
async function encoder(): Promise<Fabbrica> {
  const mod = await import('qrcode-generator')
  // Il pacchetto e' CommonJS (`export =`): secondo come lo impacchetta il
  // bundler la fabbrica sta sul modulo o sotto `default`. Si accettano
  // entrambi invece di scommettere su uno.
  const conDefault = mod as unknown as { default?: Fabbrica }
  return conDefault.default ?? (mod as unknown as Fabbrica)
}

/**
 * Disegna la matrice come un unico tracciato SVG.
 *
 * Un rettangolo per modulo farebbe migliaia di nodi; un solo `path` con un
 * comando per modulo produce un file molto piu' piccolo.
 *
 * I colori sono fissi, nero su bianco, e non seguono il tema: un QR chiaro su
 * fondo scuro e' invertito, e i lettori che lo accettano sono una minoranza.
 * Qui il codice deve funzionare, non intonarsi — la cornice attorno la mette
 * la pagina. Il margine di 4 moduli e' la zona di quiete che lo standard
 * richiede: senza, molti lettori non agganciano affatto.
 */
function disegnaSvg(scuro: (r: number, c: number) => boolean, moduli: number): string {
  const quiete = 4
  const lato = moduli + quiete * 2
  let d = ''
  for (let r = 0; r < moduli; r++) {
    for (let c = 0; c < moduli; c++) {
      if (scuro(r, c)) d += `M${c + quiete} ${r + quiete}h1v1h-1z`
    }
  }
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${lato} ${lato}"`,
    ` width="100%" height="100%" shape-rendering="crispEdges" aria-hidden="true">`,
    `<rect width="${lato}" height="${lato}" fill="#fff"/>`,
    `<path d="${d}" fill="#000"/>`,
    `</svg>`,
  ].join('')
}

/** Prova a costruire un QR per quell'indirizzo, o `null` se non ci sta. */
async function prova(url: string, correzione: Correzione) {
  const qrcode = await encoder()
  try {
    // 0 = lascia scegliere la versione minima che contiene il dato.
    const qr = qrcode(0, correzione)
    qr.addData(url, 'Byte')
    qr.make()
    return qr
  } catch {
    // La libreria solleva quando il dato eccede anche la versione 40.
    return null
  }
}

/**
 * Il QR della scheda.
 *
 * Si tenta nell'ordine: personaggio intero con correzione media, intero con
 * correzione bassa, e infine senza il testo libero. La correzione media si
 * prova per prima perche' un codice stampato o inquadrato di sbieco perdona
 * di piu'; si scende solo quando il personaggio non ci sta altrimenti.
 */
export async function creaQrScheda(char: CharacterData): Promise<QrScheda> {
  if (!sappiamoComprimere()) {
    throw new Error('QR_NO_COMPRESSION')
  }
  const base = baseCondivisione()

  const tentativi: { omettiTesti: boolean; correzione: Correzione }[] = [
    { omettiTesti: false, correzione: 'M' },
    { omettiTesti: false, correzione: 'L' },
    { omettiTesti: true, correzione: 'M' },
    { omettiTesti: true, correzione: 'L' },
  ]

  for (const t of tentativi) {
    const url = base + await encodeCharacterCompressed(char, t.omettiTesti)
    const qr = await prova(url, t.correzione)
    if (!qr) continue
    const moduli = qr.getModuleCount()
    return {
      svg: disegnaSvg((r, c) => qr.isDark(r, c), moduli),
      url,
      byte: new TextEncoder().encode(url).length,
      // La versione si ricava dal lato: lato = 17 + 4 x versione.
      versione: (moduli - 17) / 4,
      correzione: t.correzione,
      ridotto: t.omettiTesti,
    }
  }
  throw new Error('QR_TOO_LARGE')
}
