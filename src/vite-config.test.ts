// Questo test legge la configurazione e l'artefatto di build dal disco: i tipi
// di Node servono qui e solo qui, quindi si dichiarano nel file invece di
// aprirli a tutta l'app (stesso approccio di utils/pdfTemplates.test.ts).
/// <reference types="node" />
import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(__dirname, '..')

// Con noUncheckedIndexedAccess il gruppo di cattura è string | undefined anche
// quando la regex garantisce che ci sia: si scarta qui una volta sola invece
// di sparpagliare asserzioni di non-nullità in ogni assert.
function catturaGruppo(testo: string, regex: RegExp): string[] {
  return [...testo.matchAll(regex)].flatMap((m) => (m[1] === undefined ? [] : [m[1]]))
}

/**
 * Il precache del service worker non è una cache: è un download obbligatorio,
 * che ogni visitatore paga al primo avvio prima ancora di aver chiesto
 * qualcosa. Ci era finito dentro peso che il browser non richiede in nessun
 * percorso dell'app — le due facce corsive dei font (style.css le dichiara ma
 * nessun componente usa italic), il vite.svg dello scaffold, l'immagine social
 * che leggono solo i crawler e il marchio SVG del design system, emesso solo
 * perché tokens.css dichiara una variabile che nessuna regola consuma.
 *
 * Sono file che nessuno scarica mai spontaneamente: senza questi controlli
 * rientrano in silenzio, perché globPatterns li prende per estensione e nulla
 * segnala la differenza fra "serve offline" e "esiste nella cartella".
 */
describe('precache del service worker', () => {
  const viteConfig = fs.readFileSync(path.join(root, 'vite.config.ts'), 'utf8')

  it('vite.config.ts dichiara globIgnores con le esclusioni volute', () => {
    const block = viteConfig.match(/globIgnores:\s*\[([\s\S]*?)\]/)
    expect(block, 'globIgnores assente: globPatterns precaricherebbe tutto').not.toBeNull()

    const patterns = catturaGruppo(block?.[1] ?? '', /'([^']+)'/g)
    expect(patterns).toContain('**/*-italic-*.woff2')
    expect(patterns).toContain('vite.svg')
    expect(patterns).toContain('og-image.svg')
    expect(patterns).toContain('assets/favicon-*.svg')
  })

  // Le due facce corsive esistono ancora sul disco: l'esclusione ha senso solo
  // finché nessun componente le rende necessarie. Se un giorno serviranno,
  // questo test resta verde ma va riletto insieme a quello sotto.
  it('nessun componente usa il corsivo, quindi le facce italic non servono offline', () => {
    const sorgenti = fs
      .readdirSync(path.join(root, 'src'), { recursive: true, encoding: 'utf8' })
      .filter((f) => f.endsWith('.vue'))
      .map((f) => fs.readFileSync(path.join(root, 'src', f), 'utf8'))

    const conCorsivo = sorgenti.filter((s) => /\bitalic\b|<em[\s>]|font-style:\s*italic/.test(s))
    expect(conCorsivo).toHaveLength(0)
  })

  // Controllo sull'esito reale, non sull'intenzione: il manifesto che il
  // service worker costruito porta davvero in giro.
  describe('manifesto generato in docs/sw.js', () => {
    const swPath = path.join(root, 'docs', 'sw.js')
    const sw = fs.existsSync(swPath) ? fs.readFileSync(swPath, 'utf8') : ''
    const precache = catturaGruppo(sw, /url:"([^"]+)"/g)

    it('il build è presente (senza, gli assert sotto non direbbero nulla)', () => {
      expect(precache.length).toBeGreaterThan(0)
    })

    it('non precarica le facce corsive', () => {
      expect(precache.filter((u) => u.includes('-italic-'))).toHaveLength(0)
    })

    it('non precarica gli SVG che nessuna pagina richiede', () => {
      expect(precache).not.toContain('vite.svg')
      expect(precache).not.toContain('og-image.svg')
      expect(precache.filter((u) => /^assets\/favicon-.*\.svg$/.test(u))).toHaveLength(0)
    })

    // Guardia contro l'eccesso opposto: escludere troppo rompe l'offline.
    it('precarica ancora font tondi, icone PWA e favicon applicativo', () => {
      expect(precache.some((u) => /atkinson-hyperlegible-400-[^i]/.test(u))).toBe(true)
      expect(precache.some((u) => /courier-prime-400-[^i]/.test(u))).toBe(true)
      expect(precache).toContain('favicon.svg')
      expect(precache).toContain('pwa-192x192.svg')
      expect(precache).toContain('pwa-512x512.svg')
    })
  })
})

/**
 * HelloWorld.vue era il componente d'esempio dello scaffold di Vite: non lo
 * importava nessuno, ma restando in src/components sembrava codice del
 * progetto e prima o poi qualcuno lo avrebbe usato come modello di stile.
 */
describe('residui dello scaffold', () => {
  it('HelloWorld.vue non esiste più', () => {
    expect(fs.existsSync(path.join(root, 'src', 'components', 'HelloWorld.vue'))).toBe(false)
  })
})
