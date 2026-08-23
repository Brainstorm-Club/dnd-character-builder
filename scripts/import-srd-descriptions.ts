/**
 * Importa i testi italiani delle voci che l'app mostra ma non traduce —
 * privilegi di sottoclasse, tratti razziali, privilegi di background — dai
 * pacchetti SRD di dnd-companion, e riscrive `src/data/srd-it-descriptions.ts`.
 *
 * Uso:
 *   npm run data:srd-it [percorso/della/cartella/rules]
 *
 * ── Perché esiste ──────────────────────────────────────────────────────────
 *
 * I nomi italiani di quelle voci ci sono già (`src/i18n/gameTerms.ts`); il
 * testo no, e finora l'interfaccia italiana o non mostrava niente (tratti
 * razziali) o mostrava l'inglese senza dirlo (privilegi di background,
 * sottoclassi del 2014). Questo script chiude il primo caso quando la fonte
 * ha il testo, e **misura** il secondo quando non ce l'ha.
 *
 * Regola che lo script fa rispettare: dove l'SRD italiano non ha il testo,
 * nessuno lo inventa e nessuno lo traduce qui. La voce resta senza
 * descrizione e l'app lo dichiara. Un buco dichiarato è preferibile a un
 * testo plausibile e non verificabile.
 *
 * ── Cosa NON fa ────────────────────────────────────────────────────────────
 *
 * Non tocca i privilegi delle **classi base**: quelli sono già tradotti a mano
 * in `src/data/dnd5e/classes-it.ts` e `src/data/dnd2024/classes-it.ts`, e lo
 * script si rifiuta di sovrascrivere un testo scritto a mano. Se un giorno il
 * pacchetto portasse un testo per un id già coperto, lo segnala e non scrive.
 *
 * Lo script è deterministico: stesso JSON in ingresso, stesso file in uscita,
 * byte per byte. Se il dato non passa i controlli non scrive nulla e fallisce.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { dnd5eFeatureDescriptionsIt } from '../src/data/dnd5e/classes-it'
import { dnd2024FeatureDescriptionsIt } from '../src/data/dnd2024/classes-it'
import { classes as classes2014 } from '../src/data/dnd5e/classes'
import { dnd2024Classes } from '../src/data/dnd2024/classes'
import { races as races2014 } from '../src/data/dnd5e/races'
import { dnd2024Species } from '../src/data/dnd2024/races'
import { backgrounds as backgrounds2014 } from '../src/data/dnd5e/backgrounds'
import { dnd2024Backgrounds } from '../src/data/dnd2024/backgrounds'
import { traitNamesIt } from '../src/i18n/gameTerms'
import { slugPrivilegioBackground } from '../src/data/srdText'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DEFAULT_DIR = resolve(ROOT, '../brainstorm/dnd-companion/data/rules')
const OUT = resolve(ROOT, 'src/data/srd-it-descriptions.ts')

type Edizione = '2014' | '2024'
const EDIZIONI: readonly Edizione[] = ['2014', '2024']
/** Ogni edizione dichiara la sua versione dell'SRD: se non torna, il file è l'altro. */
const SRD_ATTESO: Readonly<Record<Edizione, string>> = { '2014': '5.1', '2024': '5.2.1' }

/** Le tre categorie che questo script copre. Le classi base non sono fra queste. */
type Categoria = 'subclass' | 'trait' | 'background'
const CATEGORIE: readonly Categoria[] = ['subclass', 'trait', 'background']
const ETICHETTA: Readonly<Record<Categoria, string>> = {
  subclass: 'privilegi di sottoclasse',
  trait: 'tratti razziali',
  background: 'privilegi di background',
}

interface Voce {
  id: string
  name: string
  description: string | null
}

interface PackFeature { id?: unknown, name?: unknown, description?: unknown }
interface PackSubclass { features?: PackFeature[] }
interface PackClass { subclasses?: Record<string, PackSubclass> }
interface PackSubrace { traits?: PackFeature[] }
interface PackRace { traits?: PackFeature[], subraces?: Record<string, PackSubrace> }
interface PackBackground { features?: PackFeature[] }
interface Pack {
  edizione?: unknown
  srd?: unknown
  sourceCommit?: unknown
  classes?: Record<string, PackClass>
  races?: Record<string, PackRace>
  backgrounds?: Record<string, PackBackground>
}

function fail(msg: string): never {
  console.error(`✗ ${msg}`)
  process.exit(1)
}

/** Un record del pacchetto, normalizzato. Fallisce se non ha id e nome. */
function voce(f: PackFeature, dove: string): Voce {
  const id = typeof f.id === 'string' ? f.id : ''
  const name = typeof f.name === 'string' ? f.name : ''
  if (!id) fail(`${dove}: una voce non ha id`)
  if (!name) fail(`${dove}: la voce ${id} non ha nome`)
  const d = f.description
  if (d !== null && d !== undefined && typeof d !== 'string') {
    fail(`${dove}/${id}: description non è né testo né null`)
  }
  const description = typeof d === 'string' && d.trim() ? d.trim() : null
  return { id, name, description }
}

/** Le voci del pacchetto, per categoria, nell'ordine in cui stanno nel file. */
function vociDelPacchetto(pack: Pack, ed: Edizione): Record<Categoria, Voce[]> {
  const out: Record<Categoria, Voce[]> = { subclass: [], trait: [], background: [] }
  for (const [cid, cls] of Object.entries(pack.classes ?? {})) {
    for (const [sid, sub] of Object.entries(cls.subclasses ?? {})) {
      for (const f of sub.features ?? []) out.subclass.push(voce(f, `${ed}/${cid}/${sid}`))
    }
  }
  for (const [rid, race] of Object.entries(pack.races ?? {})) {
    for (const t of race.traits ?? []) out.trait.push(voce(t, `${ed}/razza/${rid}`))
    for (const [sid, sub] of Object.entries(race.subraces ?? {})) {
      for (const t of sub.traits ?? []) out.trait.push(voce(t, `${ed}/razza/${rid}/${sid}`))
    }
  }
  for (const [bid, bg] of Object.entries(pack.backgrounds ?? {})) {
    for (const f of bg.features ?? []) out.background.push(voce(f, `${ed}/background/${bid}`))
  }
  return out
}

// ── Quello che l'app ha già ────────────────────────────────────────────────

/**
 * Gli id che l'app mostra davvero, per edizione e categoria: il pacchetto è
 * generato dal builder, quindi devono coincidere. Se non coincidono, uno dei
 * due è invecchiato e importare alla cieca attaccherebbe testi a voci che non
 * esistono più.
 */
function idDelBuilder(ed: Edizione): Record<Categoria, Set<string>> {
  const out: Record<Categoria, Set<string>> = {
    subclass: new Set(), trait: new Set(), background: new Set(),
  }
  const classi = ed === '2014' ? classes2014 : dnd2024Classes
  for (const cls of classi) {
    for (const sub of cls.subclasses) for (const f of sub.features) if (f.id) out.subclass.add(f.id)
  }
  const razze = ed === '2014' ? races2014 : dnd2024Species
  for (const r of razze) {
    for (const t of r.traits) out.trait.add(t)
    for (const s of r.subraces) for (const t of s.traits) out.trait.add(t)
  }
  const bgs = ed === '2014' ? backgrounds2014 : dnd2024Backgrounds
  for (const b of bgs) if (b.feature) out.background.add(slugPrivilegioBackground(b.feature.name))
  return out
}

/** La mappa dei testi italiani già scritti a mano, per edizione. */
function testiEsistenti(ed: Edizione): Readonly<Record<string, string>> {
  return ed === '2014' ? dnd5eFeatureDescriptionsIt : dnd2024FeatureDescriptionsIt
}

// ── Lettura e verifica ─────────────────────────────────────────────────────

const dir = resolve(process.cwd(), process.argv[2] ?? DEFAULT_DIR)

interface Riga {
  edizione: Edizione
  categoria: Categoria
  totale: number
  conTestoPrima: number
  importati: number
  senzaTesto: string[]
}

const righe: Riga[] = []
const importati: Record<Edizione, Record<string, string>> = { '2014': {}, '2024': {} }
const provenienza: Record<Edizione, string> = { '2014': '', '2024': '' }

for (const ed of EDIZIONI) {
  const percorso = resolve(dir, `${ed}.json`)
  let pack: Pack
  try {
    pack = JSON.parse(readFileSync(percorso, 'utf8')) as Pack
  } catch (e) {
    fail(`non riesco a leggere ${percorso}: ${(e as Error).message}`)
  }
  if (String(pack.edizione) !== ed) fail(`${percorso}: edizione «${pack.edizione}», atteso «${ed}»`)
  if (pack.srd !== SRD_ATTESO[ed]) fail(`${percorso}: srd «${pack.srd}», atteso «${SRD_ATTESO[ed]}»`)
  provenienza[ed] = typeof pack.sourceCommit === 'string' ? pack.sourceCommit : 'sconosciuto'

  const voci = vociDelPacchetto(pack, ed)
  const nostri = idDelBuilder(ed)
  const esistenti = testiEsistenti(ed)

  for (const cat of CATEGORIE) {
    const elenco = voci[cat]
    // Gli id del pacchetto devono essere id che l'app mostra.
    const sconosciuti = [...new Set(elenco.map(v => v.id))].filter(id => !nostri[cat].has(id))
    if (sconosciuti.length) {
      fail(`${ed}/${cat}: il pacchetto ha ${sconosciuti.length} id che l'app non usa `
        + `(${sconosciuti.slice(0, 5).join(', ')}...). Rigenera il pacchetto dal builder.`)
    }
    // ...e viceversa: una voce che l'app mostra e il pacchetto ignora non
    // potrà mai ricevere un testo, e va vista adesso, non fra sei mesi.
    const nelPacchetto = new Set(elenco.map(v => v.id))
    const scoperti = [...nostri[cat]].filter(id => !nelPacchetto.has(id))
    if (scoperti.length) {
      fail(`${ed}/${cat}: l'app mostra ${scoperti.length} voci che il pacchetto non elenca `
        + `(${scoperti.slice(0, 5).join(', ')}...). Rigenera il pacchetto dal builder.`)
    }

    const visti = new Map<string, Voce>()
    for (const v of elenco) {
      const prima = visti.get(v.id)
      // Lo stesso id può comparire su più razze (scurovisione, resistenza
      // fatata): il testo dev'essere lo stesso, o non si saprebbe quale usare.
      if (prima && prima.description !== v.description) {
        fail(`${ed}/${cat}/${v.id}: il pacchetto dà due testi diversi per lo stesso id`)
      }
      visti.set(v.id, v)
    }

    const totale = visti.size
    let conTestoPrima = 0
    let nuovi = 0
    const senzaTesto: string[] = []
    for (const [id, v] of [...visti].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
      const giaTradotto = Boolean(esistenti[id])
      if (giaTradotto) conTestoPrima++
      if (v.description) {
        if (giaTradotto) {
          // Il testo scritto a mano nel builder vince: è quello che il resto
          // dell'app usa, e riscriverlo di soppiatto è il modo per far
          // divergere due copie dello stesso paragrafo.
          if (esistenti[id] !== v.description) {
            console.warn(`  ! ${ed}/${cat}/${id}: il pacchetto ha un testo diverso da quello a mano — tengo quello a mano`)
          }
          continue
        }
        importati[ed][id] = v.description
        nuovi++
      } else if (!giaTradotto) {
        senzaTesto.push(id)
      }
    }
    righe.push({ edizione: ed, categoria: cat, totale, conTestoPrima, importati: nuovi, senzaTesto })
  }

  // I nomi italiani devono esserci comunque: senza il nome, dichiarare che la
  // descrizione manca lascerebbe in pagina solo uno slug.
  const senzaNome = voci.trait.filter(v => !traitNamesIt[v.id]).map(v => v.id)
  if (senzaNome.length) {
    fail(`${ed}: ${senzaNome.length} tratti senza nome italiano in traitNamesIt (${senzaNome.slice(0, 5).join(', ')})`)
  }
}

// ── Rapporto ───────────────────────────────────────────────────────────────

console.log('\nCopertura dei testi italiani — prima → dopo\n')
console.log('  edizione  categoria                  totale   prima    dopo   scoperti')
console.log('  ' + '─'.repeat(72))
for (const r of righe) {
  const dopo = r.conTestoPrima + r.importati
  console.log(
    `  ${r.edizione.padEnd(9)} ${ETICHETTA[r.categoria].padEnd(25)} `
    + `${String(r.totale).padStart(6)}  ${String(r.conTestoPrima).padStart(6)}  `
    + `${String(dopo).padStart(6)}  ${String(r.totale - dopo).padStart(9)}`,
  )
}
const totImportati = righe.reduce((n, r) => n + r.importati, 0)
const totScoperti = righe.reduce((n, r) => n + r.senzaTesto.length, 0)
console.log(`\n  importati: ${totImportati}   senza testo italiano nell'SRD: ${totScoperti}`)
if (totScoperti) {
  console.log('\n  Restano senza testo (l\'app ne mostra il nome e dichiara il buco):')
  for (const r of righe.filter(x => x.senzaTesto.length)) {
    console.log(`   · ${r.edizione} ${ETICHETTA[r.categoria]} (${r.senzaTesto.length}): ${r.senzaTesto.join(', ')}`)
  }
}

// ── Scrittura ──────────────────────────────────────────────────────────────

/** Un testo come letterale TypeScript fra apici singoli. */
function letterale(s: string): string {
  return `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

function blocco(ed: Edizione): string {
  const voci = Object.entries(importati[ed]).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  const scoperti = righe.filter(r => r.edizione === ed).reduce((n, r) => n + r.senzaTesto.length, 0)
  if (!voci.length) {
    return `  // Nessun testo importato: l'SRD ${SRD_ATTESO[ed]} italiano non descrive\n`
      + `  // nessuna delle ${scoperti} voci scoperte di questa edizione.\n`
      + `  '${ed}': {},`
  }
  const corpo = voci
    .map(([id, testo]) => `    ${/^[a-z][a-z0-9]*$/i.test(id) ? id : letterale(id)}:\n      ${letterale(testo)},`)
    .join('\n')
  return `  '${ed}': {\n${corpo}\n  },`
}

const intestazione = `// Testi italiani di privilegi di sottoclasse, tratti razziali e privilegi di
// background, importati dai pacchetti SRD di dnd-companion.
//
// GENERATO DA scripts/import-srd-descriptions.ts — non modificare a mano.
// Fonte: System Reference Document 5.1 e 5.2.1 in italiano (Wizards of the
// Coast, CC-BY-4.0), via il pacchetto dati di dnd-companion
// (2014: ${provenienza['2014']}, 2024: ${provenienza['2024']}).
//
// I privilegi delle **classi base** non stanno qui: sono tradotti a mano in
// \`dnd5e/classes-it.ts\` e \`dnd2024/classes-it.ts\`, e quei testi vincono.
//
// Dove l'SRD italiano non ha il testo, qui non c'è la voce: nessuno la
// inventa e nessuno la traduce. \`srdText.ts\` fa dichiarare all'app che la
// descrizione non è nell'SRD, invece di lasciare il vuoto o di spacciare
// l'inglese per italiano.
`

const contenuto = `${intestazione}
/** Testo italiano per id di voce, per edizione delle regole. */
export const SRD_IT_DESCRIPTIONS: Readonly<Record<'2014' | '2024', Readonly<Record<string, string>>>> = {
${blocco('2014')}
${blocco('2024')}
}
`

writeFileSync(OUT, contenuto, 'utf8')
console.log(`\n✓ scritto ${OUT.replace(ROOT + '/', '')} (${totImportati} voci)\n`)
