import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Contrasto WCAG dei colori del tema, letti dal CSS come testo.
 *
 * Gira in vitest, non in un browser: non c'è un `getComputedStyle` da
 * interrogare, quindi i valori si ricavano risolvendo a mano le variabili
 * (`var(--x)`) dichiarate in `style.css` e nei token del design system, una
 * volta con le variabili del tema carbone e una volta con quelle del tema
 * carta. È l'unico modo per accorgersi che una coppia colore/fondo è
 * illeggibile *prima* di vederla a schermo.
 */

const SORGENTE_APP = readFileSync(resolve(process.cwd(), 'src/style.css'), 'utf8')
const CSS_DS = readFileSync(resolve(process.cwd(), 'src/design-system/tokens.css'), 'utf8')

/**
 * Le regole dentro `@media` (stampa, reduced-motion) ridipingono le stesse
 * classi con altri colori: se restassero nel testo il parser le scambierebbe
 * per le regole a schermo e misurerebbe il contrasto del foglio stampato.
 */
function senzaMedia(css: string): string {
  let out = ''
  let i = 0
  while (i < css.length) {
    const m = /@media[^{]*\{/.exec(css.slice(i))
    if (!m) return out + css.slice(i)
    out += css.slice(i, i + m.index)
    let j = i + m.index + m[0].length
    let profondita = 1
    while (j < css.length && profondita > 0) {
      if (css[j] === '{') profondita++
      else if (css[j] === '}') profondita--
      j++
    }
    i = j
  }
  return out
}

const CSS_APP = senzaMedia(SORGENTE_APP)

type Tema = 'carbone' | 'carta'

// ─── Lettura del CSS ────────────────────────────────────────────────────────

const senzaCommenti = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '')
const perRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Corpo di una regola il cui selettore è esattamente `selettore`. */
function bloccoEsatto(css: string, selettore: string): string {
  return corpo(css, new RegExp(`(?:^|\\n)\\s*${perRegex(selettore)}\\s*\\{`))
}

/**
 * Corpo di una regola in cui `selettore` compare fra i selettori del gruppo.
 * Serve per le regole scritte a mano nel tema carta, che a volte elencano più
 * selettori separati da virgola prima della graffa.
 */
function bloccoRegola(css: string, selettore: string): string {
  return corpo(css, new RegExp(`(?:^|\\n)\\s*${perRegex(selettore)}[^{}]*\\{`))
}

function corpo(css: string, re: RegExp): string {
  const m = re.exec(css)
  if (!m) return ''
  let i = m.index + m[0].length
  let profondita = 1
  const inizio = i
  while (i < css.length && profondita > 0) {
    if (css[i] === '{') profondita++
    else if (css[i] === '}') profondita--
    i++
  }
  return css.slice(inizio, i - 1)
}

function variabili(blocco: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const m of senzaCommenti(blocco).matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    const [, nome, valore] = m
    if (nome && valore) out[nome] = valore.trim()
  }
  return out
}

const TOKEN_DS = variabili(bloccoEsatto(CSS_DS, ':root'))
const TOKEN_DS_CARTA = variabili(bloccoEsatto(CSS_DS, ':root[data-theme="light"]'))
const TOKEN_APP = variabili(bloccoEsatto(CSS_APP, ':root'))
const TOKEN_APP_CARTA = variabili(bloccoEsatto(CSS_APP, ':root[data-theme="light"]'))
const TEMA_TAILWIND = variabili(bloccoEsatto(CSS_APP, '@theme'))

const AMBIENTE: Record<Tema, Record<string, string>> = {
  // `:root` di style.css vince su quello del DS (stessa specificità, viene dopo);
  // `:root[data-theme="light"]` vince su entrambi per specificità.
  carbone: { ...TOKEN_DS, ...TOKEN_APP, ...TEMA_TAILWIND },
  carta: { ...TOKEN_DS, ...TOKEN_APP, ...TOKEN_DS_CARTA, ...TOKEN_APP_CARTA, ...TEMA_TAILWIND },
}

function risolvi(valore: string, vars: Record<string, string>, giro = 0): string {
  if (giro > 12) return valore
  const m = /var\(\s*(--[\w-]+)\s*(?:,([^()]*))?\)/.exec(valore)
  if (!m) return valore.trim()
  const sostituto = (m[1] ? vars[m[1]] : undefined) ?? m[2] ?? ''
  const espanso = valore.slice(0, m.index) + sostituto + valore.slice(m.index + m[0].length)
  return risolvi(espanso, vars, giro + 1)
}

// ─── Colori ─────────────────────────────────────────────────────────────────

interface Rgba { r: number; g: number; b: number; a: number }

function colore(valore: string): Rgba {
  const v = valore.trim()
  const esa = /^#([0-9a-f]{3,8})$/i.exec(v)
  if (esa) {
    let h = esa[1] ?? ''
    if (h.length === 3 || h.length === 4) h = h.split('').map((c) => c + c).join('')
    const n = (i: number) => parseInt(h.slice(i * 2, i * 2 + 2), 16)
    return { r: n(0), g: n(1), b: n(2), a: h.length === 8 ? n(3) / 255 : 1 }
  }
  const fn = /^rgba?\(([^)]+)\)$/i.exec(v)
  if (fn) {
    const p = (fn[1] ?? '').split(/[,/]/).map((x) => parseFloat(x))
    const [r = 0, g = 0, b = 0, a] = p
    return { r, g, b, a: a !== undefined && !Number.isNaN(a) ? a : 1 }
  }
  throw new Error(`colore non riconosciuto: ${valore}`)
}

/** Composizione alfa di `sopra` su `sotto` (entrambi opachi al risultato). */
function sovrapponi(sopra: Rgba, sotto: Rgba): Rgba {
  const mix = (a: number, b: number) => Math.round(a * sopra.a + b * (1 - sopra.a))
  return { r: mix(sopra.r, sotto.r), g: mix(sopra.g, sotto.g), b: mix(sopra.b, sotto.b), a: 1 }
}

function luminanza({ r, g, b }: Rgba): number {
  const lin = (c: number) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function contrasto(a: Rgba, b: Rgba): number {
  const la = luminanza(a)
  const lb = luminanza(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

// ─── Risoluzione di una utility Tailwind ────────────────────────────────────

/** `hover:bg-stone-500` → `.hover\:bg-stone-500:hover` */
function selettoreDi(utility: string): string {
  const hover = utility.startsWith('hover:')
  const classe = utility.replace(/[:/]/g, (c) => '\\' + c)
  return '.' + classe + (hover ? ':hover' : '')
}

function dichiarazione(blocco: string, proprieta: string): string | null {
  const m = new RegExp(`(?:^|;|\\s)${proprieta}\\s*:\\s*([^;]+)`, 'i').exec(blocco)
  return m?.[1] ? m[1].trim() : null
}

/**
 * Colore effettivo di una utility nel tema dato, seguendo l'ordine con cui la
 * cascata la calcola: override del tema carta, poi regola scritta a mano valida
 * per entrambi i temi, poi il token della scala Tailwind.
 */
function tinta(utility: string, tema: Tema, selettoreEsplicito?: string): Rgba {
  const proprieta = utility.startsWith('text-') ? 'color'
    : utility.startsWith('border-') ? 'border-color'
    : 'background-color'
  const sel = selettoreEsplicito ?? selettoreDi(utility)
  const vars = AMBIENTE[tema]

  if (tema === 'carta') {
    const scritto = dichiarazione(bloccoRegola(CSS_APP, `html[data-theme="light"] ${sel}`), proprieta)
    if (scritto) return colore(risolvi(scritto, vars))
  }
  const generico = dichiarazione(bloccoRegola(CSS_APP, sel), proprieta)
  if (generico) return colore(risolvi(generico, vars))

  const [nome, opacita] = utility.replace(/^(?:hover:)?(?:text|bg|border)-/, '').split('/')
  const token = vars[`--color-${nome}`]
  if (!token) throw new Error(`nessun token --color-${nome} in @theme (utility ${utility})`)
  const c = colore(risolvi(token, vars))
  return opacita ? { ...c, a: c.a * (Number(opacita) / 100) } : c
}

/** Testo su fondo, con eventuale pastiglia semitrasparente in mezzo. */
function rapporto(testo: string, fondi: string[], tema: Tema, selettoreTesto?: string): number {
  const primo = fondi[0]
  if (!primo) throw new Error('rapporto(): serve almeno un fondo')
  let sotto = tinta(primo, tema)
  for (const f of fondi.slice(1)) sotto = sovrapponi(tinta(f, tema), sotto)
  return contrasto(tinta(testo, tema, selettoreTesto), sotto)
}

const TEMI: Tema[] = ['carbone', 'carta']
const RUNG = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

// ─── Test ───────────────────────────────────────────────────────────────────

describe('rampa dei grigi', () => {
  it.each(TEMI)('in tema %s va dal più chiaro al più scuro senza inversioni', (tema) => {
    // Si legge la scala da `@theme`, non dalle utility: in tema carta le
    // superfici sono riscritte a mano e mescolarle agli inchiostri darebbe una
    // rampa finta. Quello che deve restare ordinato è la scala dei token.
    const lum = RUNG.map((n) => ({
      n,
      l: luminanza(colore(risolvi(AMBIENTE[tema][`--color-stone-${n}`] ?? '', AMBIENTE[tema]))),
    }))
    for (let i = 1; i < lum.length; i++) {
      // Una rung più alta deve essere sempre più scura della precedente: se si
      // inverte, "testo tenue" diventa più chiaro di "testo secondario" e la
      // gerarchia visiva salta senza che nessuno se ne accorga.
      const qui = lum[i]!, prima = lum[i - 1]!
      expect(qui.l, `stone-${qui.n} non è più scuro di stone-${prima.n}`)
        .toBeLessThan(prima.l)
    }
  })

  it('in tema carta gli inchiostri 100→500 sfumano senza collassare', () => {
    const inchiostri = [100, 200, 300, 400, 500].map((n) => ({
      n,
      l: luminanza(tinta(`text-stone-${n}`, 'carta')),
    }))
    for (let i = 1; i < inchiostri.length; i++) {
      const qui = inchiostri[i]!, prima = inchiostri[i - 1]!
      expect(qui.l, `text-stone-${qui.n} non è più tenue di text-stone-${prima.n}`)
        .toBeGreaterThan(prima.l)
    }
  })
})

describe('testo grigio sulle superfici dell\'app (WCAG 1.4.3, 4.5:1)', () => {
  // Solo le combinazioni che l'app dipinge davvero: stone-500 finisce anche su
  // bg-stone-700 (StepNavigation, passi futuri), non solo sul fondo pagina.
  const COPPIE: [string, string][] = [
    ['text-stone-500', 'bg-stone-900'],
    ['text-stone-500', 'bg-stone-800'],
    ['text-stone-500', 'bg-stone-700'],
    ['text-stone-400', 'bg-stone-900'],
    ['text-stone-400', 'bg-stone-800'],
    ['text-stone-400', 'bg-stone-700'],
    ['text-stone-300', 'bg-stone-900'],
    ['text-stone-300', 'bg-stone-800'],
    ['text-stone-300', 'bg-stone-700'],
    ['text-stone-300', 'bg-stone-600'],
    ['text-stone-200', 'bg-stone-800'],
    ['text-stone-200', 'bg-stone-700'],
    ['text-stone-200', 'bg-stone-600'],
    ['text-stone-100', 'bg-stone-900'],
  ]

  for (const tema of TEMI) {
    it.each(COPPIE)(`%s su %s passa AA in tema ${tema}`, (testo, fondo) => {
      expect(rapporto(testo, [fondo], tema)).toBeGreaterThanOrEqual(4.5)
    })
  }

  it.each(TEMI)('la pastiglia selezionata resta leggibile al passaggio del mouse in tema %s', (tema) => {
    // Unico punto in cui la rung 500 fa da superficie e non da testo.
    expect(rapporto('text-stone-300', ['hover:bg-stone-500'], tema)).toBeGreaterThanOrEqual(4.5)
  })

  it('il tema carta non fissa a mano il colore di .text-stone-500', () => {
    // Un override scritto a mano vince per specificità su @theme: finché c'è,
    // ridefinire il token non cambia nulla e la correzione resta a metà.
    expect(CSS_APP).not.toMatch(/html\[data-theme="light"\]\s+\.text-stone-500\s*\{/)
  })
})

describe('accenti di variante verde e azzurro', () => {
  const TESTI: [string, string][] = [
    ['text-emerald-400', 'bg-stone-800'],
    ['text-emerald-400', 'bg-stone-900'],
    ['text-emerald-300', 'bg-stone-800'],
    ['text-sky-400', 'bg-stone-800'],
    ['text-sky-400', 'bg-stone-900'],
    ['text-sky-300', 'bg-stone-800'],
  ]

  for (const tema of TEMI) {
    it.each(TESTI)(`%s su %s passa AA in tema ${tema}`, (testo, fondo) => {
      expect(rapporto(testo, [fondo], tema)).toBeGreaterThanOrEqual(4.5)
    })
  }

  const BADGE: [string, string][] = [
    ['text-emerald-400', 'bg-emerald-900/40'],
    ['text-sky-400', 'bg-sky-900/40'],
  ]

  for (const tema of TEMI) {
    it.each(BADGE)(`la pastiglia %s su %s passa AA in tema ${tema}`, (testo, pastiglia) => {
      // La pastiglia è semitrasparente: conta il colore composto sulla scheda.
      expect(rapporto(testo, ['bg-stone-800', pastiglia], tema)).toBeGreaterThanOrEqual(4.5)
    })
  }

  it('verde e azzurro derivano dai token semantici del design system', () => {
    expect(TEMA_TAILWIND['--color-emerald-700']).toContain('--app-verde-700')
    expect(TEMA_TAILWIND['--color-sky-700']).toContain('--app-azzurro-700')
    for (const [app, ds] of [['--app-verde-700', '--bsc-successo'], ['--app-azzurro-700', '--bsc-info']] as const) {
      const definito = AMBIENTE.carbone[app]
      const atteso = TOKEN_DS[ds]
      expect(definito, `${app} non è definito`).toBeDefined()
      expect(atteso, `${ds} non è definito`).toBeDefined()
      expect(risolvi(definito!, AMBIENTE.carbone).toUpperCase()).toBe(atteso!.toUpperCase())
    }
  })
})

describe('etichette dei bottoni pieni', () => {
  const BOTTONI: { fondo: string; testo: string; selettoreCarta?: string }[] = [
    { fondo: 'bg-amber-600', testo: 'text-stone-900' },
    { fondo: 'bg-amber-500', testo: 'text-stone-900' },
    { fondo: 'bg-emerald-600', testo: 'text-stone-900' },
    { fondo: 'bg-emerald-500', testo: 'text-stone-900' },
    { fondo: 'bg-sky-600', testo: 'text-stone-900' },
    { fondo: 'bg-sky-500', testo: 'text-stone-900' },
    // Il rosso porta l'etichetta chiara: in tema carta serve una regola che
    // scavalchi il .text-stone-100 generico, altrimenti diventa nera su rosso.
    { fondo: 'bg-red-600', testo: 'text-stone-100', selettoreCarta: '.bg-red-600.text-stone-100' },
    { fondo: 'bg-red-700', testo: 'text-stone-100', selettoreCarta: '.bg-red-700.text-stone-100' },
    { fondo: 'hover:bg-red-500', testo: 'text-stone-100', selettoreCarta: '.bg-red-600.text-stone-100' },
  ]

  for (const tema of TEMI) {
    it.each(BOTTONI)(`$testo su $fondo passa AA in tema ${tema}`, ({ fondo, testo, selettoreCarta }) => {
      const sel = tema === 'carta' ? selettoreCarta : undefined
      expect(rapporto(testo, [fondo], tema, sel)).toBeGreaterThanOrEqual(4.5)
    })
  }

  it('il tema carta non ridipinge .text-purple-100', () => {
    // text-purple-100 esiste solo sopra bg-purple-700: ridipingerlo di viola
    // scuro lo rende 1,56:1, cioè illeggibile.
    expect(CSS_APP).not.toMatch(/html\[data-theme="light"\]\s+\.text-purple-100\s*\{/)
  })
})

describe('anello di fuoco (WCAG 1.4.11, 3:1)', () => {
  function anello(tema: Tema): Rgba {
    const vars = AMBIENTE[tema]
    if (tema === 'carta') {
      const scritto = dichiarazione(
        bloccoRegola(CSS_APP, 'html[data-theme="light"] :focus-visible'),
        'outline-color',
      )
      if (scritto) return colore(risolvi(scritto, vars))
    }
    const decl = dichiarazione(bloccoEsatto(CSS_APP, ':focus-visible'), 'outline')
    if (!decl) throw new Error('nessuna regola :focus-visible in style.css')
    return colore(risolvi(decl.split(/\s+/).pop()!, vars))
  }

  it('usa il token --bsc-focus del design system e non un rosso a mano', () => {
    expect(dichiarazione(bloccoEsatto(CSS_APP, ':focus-visible'), 'outline')).toContain('var(--bsc-focus)')
  })

  for (const tema of TEMI) {
    it.each(['bg-stone-900', 'bg-stone-800', 'bg-stone-700', 'bg-stone-600'])(
      `si stacca da %s in tema ${tema}`,
      (fondo) => {
        expect(contrasto(anello(tema), tinta(fondo, tema))).toBeGreaterThanOrEqual(3)
      },
    )
  }
})
