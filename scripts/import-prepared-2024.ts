/**
 * Importa la colonna «Incantesimi preparati» delle tabelle di classe 2024
 * dal pacchetto dati di dnd-companion e la riscrive in
 * `src/data/dnd2024/prepared.ts`.
 *
 * Il numero nel 2024 non è più «modificatore + livello» come nel 2014: è una
 * colonna stampata nella tabella di ogni classe incantatrice. La colonna è già
 * stata estratta dal PDF dell'SRD 5.2.1 italiano (CC-BY-4.0) con
 * `pdftotext -layout`, che sulle colonne di tabella è affidabile, e verificata
 * nel companion; qui la si trascrive senza reinterpretarla.
 *
 * Uso:
 *   npm run data:prepared-2024 [percorso/di/2024.json]
 *
 * Lo script è deterministico: stesso JSON in ingresso, stesso file in uscita,
 * byte per byte. Se il dato non passa i controlli non scrive nulla e fallisce.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DEFAULT_SOURCE = resolve(ROOT, '../brainstorm/dnd-companion/data/rules/2024.json')
const OUT = resolve(ROOT, 'src/data/dnd2024/prepared.ts')

/** Le otto classi incantatrici del 2024, nell'ordine in cui stanno nei dati. */
const EXPECTED_CLASSES = [
  'bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'warlock', 'wizard',
] as const

interface RulesFile {
  edizione?: string | number
  srd?: string
  preparedSpells?: Record<string, { mode?: string; table?: number[] | null }>
}

function fail(msg: string): never {
  console.error(`✗ ${msg}`)
  process.exit(1)
}

const sourcePath = resolve(process.cwd(), process.argv[2] ?? DEFAULT_SOURCE)

let raw: RulesFile
try {
  raw = JSON.parse(readFileSync(sourcePath, 'utf8')) as RulesFile
} catch (e) {
  fail(`non riesco a leggere ${sourcePath}: ${(e as Error).message}`)
}

if (String(raw.edizione) !== '2024') fail(`il file non è dell'edizione 2024 (edizione: ${raw.edizione})`)
if (raw.srd !== '5.2.1') fail(`il file non viene dall'SRD 5.2.1 (srd: ${raw.srd})`)

const prepared = raw.preparedSpells
if (!prepared) fail('il file non ha la chiave preparedSpells')

const tables = new Map<string, readonly number[]>()

for (const id of EXPECTED_CLASSES) {
  const entry = prepared[id]
  if (!entry) fail(`manca la classe ${id} in preparedSpells`)
  if (entry.mode !== 'prepared') fail(`${id}: mode è «${entry.mode}», atteso «prepared»`)
  const table = entry.table
  if (!Array.isArray(table)) fail(`${id}: la tabella manca (nel 2024 ogni incantatore ha la colonna)`)
  if (table.length !== 20) fail(`${id}: la tabella ha ${table.length} livelli invece di 20`)
  table.forEach((n, i) => {
    if (!Number.isInteger(n) || n < 1) fail(`${id}: al ${i + 1}° livello il valore «${n}» non è un intero positivo`)
    if (i > 0 && n < table[i - 1]!) fail(`${id}: la colonna cala fra il ${i}° e il ${i + 1}° livello (${table[i - 1]} → ${n})`)
  })
  tables.set(id, table)
}

// Le chiavi in più sono un cambio di dati a monte, non un dettaglio: meglio
// accorgersene qui che scoprirlo in produzione con una classe senza numero.
const extra = Object.keys(prepared).filter(k => !(EXPECTED_CLASSES as readonly string[]).includes(k))
if (extra.length) fail(`preparedSpells ha classi non previste: ${extra.join(', ')}`)

// Controllo gratuito che il generatore a monte ha già verificato: il mago non
// segue la progressione delle altre classi a incantatore pieno nella coda
// della tabella. Se qui coincidono, l'estrazione ha sbagliato colonna.
const wizard = tables.get('wizard')!
const bard = tables.get('bard')!
if (wizard.slice(12).every((n, i) => n === bard.slice(12)[i])) {
  fail('mago e bardo coincidono dal 13° livello in su: la colonna letta è quella sbagliata')
}

const width = Math.max(...EXPECTED_CLASSES.map(id => id.length))
const rows = EXPECTED_CLASSES.map(id => {
  const cells = tables.get(id)!.map(n => String(n).padStart(2, ' ')).join(', ')
  return `  ${(id + ':').padEnd(width + 1)} [${cells}],`
}).join('\n')

const file = `// Colonna «Incantesimi preparati» delle tabelle di classe di D&D 2024.
//
// GENERATO DA scripts/import-prepared-2024.ts — non modificare a mano.
// Fonte: System Reference Document 5.2.1 italiano (Wizards of the Coast,
// CC-BY-4.0), tabelle di classe, via il pacchetto dati di dnd-companion.
//
// Nel 2014 il numero di incantesimi preparati era una formula («modificatore
// di caratteristica + livello»); nel 2024 è un numero stampato, uno per
// livello, e le classi non lo condividono: paladino e ranger (mezzi
// incantatori) crescono più piano, il warlock ha una progressione sua, e il
// mago si stacca dagli altri incantatori pieni nella seconda metà della
// tabella. Per questo la tabella sta nei dati e non in una formula.

/** Progressione dal 1° al 20° livello, indicizzata per id di classe. */
export const DND2024_PREPARED_SPELLS: Readonly<Record<string, readonly number[]>> = {
${rows}
}

/**
 * Quanti incantesimi prepara la classe indicata al livello dato, secondo la
 * tabella del 2024. \`null\` se la classe non ha quella colonna (non è un
 * incantatore del 2024, o è una classe di un'altra ambientazione).
 */
export function getPreparedSpells2024(classId: string, level: number): number | null {
  const table = DND2024_PREPARED_SPELLS[classId]
  if (!table) return null
  const idx = Math.min(Math.max(level, 1), table.length) - 1
  return table[idx] ?? null
}
`

writeFileSync(OUT, file, 'utf8')
console.log(`✓ ${EXPECTED_CLASSES.length} classi scritte in ${OUT}`)
console.log(`  fonte: ${sourcePath} (SRD ${raw.srd}, edizione ${raw.edizione})`)
