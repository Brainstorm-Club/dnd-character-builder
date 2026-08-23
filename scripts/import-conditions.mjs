// Importa le condizioni dai pacchetti regole di dnd-companion.
//
//   node scripts/import-conditions.mjs            # sorgente: ../brainstorm/dnd-companion
//   COMPANION_DIR=/percorso node scripts/import-conditions.mjs
//
// Genera `src/data/dnd5e/conditions.ts` (SRD 5.1) e `src/data/dnd2024/conditions.ts`
// (SRD 5.2.1). Lo script è deterministico: a parità di sorgente riscrive file
// identici byte per byte. Per questo non stampa la data di esecuzione, ma la
// data e il commit di generazione del pacchetto sorgente.
//
// Il testo italiano viene copiato VERBATIM dai pacchetti, che a loro volta lo
// prendono dalle edizioni italiane degli SRD (CC-BY-4.0). Lo script non
// riscrive, non completa e non traduce nulla:
//
//   - le quattro condizioni assenti dall'Appendice A dell'SRD 5.1 italiano
//     (Prono, Spaventato, Stordito, Trattenuto) restano `descriptionIt: null`;
//     prendere il testo del 2024 significherebbe spacciare regole diverse;
//   - l'errore di traduzione dell'SRD 5.2.1 su «Incapacitato» (che si apre
//     dicendo «paralizzato») resta dov'è: l'unica aggiunta è la nota
//     redazionale qui sotto, che l'interfaccia tiene separata dalla fonte.

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const COMPANION = process.env.COMPANION_DIR
  ? resolve(process.env.COMPANION_DIR)
  : resolve(REPO, '../brainstorm/dnd-companion')

/**
 * Nomi originali (inglesi) delle quindici condizioni, per id.
 * Non sono una traduzione del testo italiano: sono i nomi con cui l'SRD in
 * lingua originale le stampa, e servono all'interfaccia inglese dell'app per
 * agganciare le condizioni citate nei privilegi, che sono scritti in inglese.
 */
const NOMI_EN = {
  blinded: 'Blinded',
  charmed: 'Charmed',
  deafened: 'Deafened',
  exhaustion: 'Exhaustion',
  frightened: 'Frightened',
  grappled: 'Grappled',
  incapacitated: 'Incapacitated',
  invisible: 'Invisible',
  paralyzed: 'Paralyzed',
  petrified: 'Petrified',
  poisoned: 'Poisoned',
  prone: 'Prone',
  restrained: 'Restrained',
  stunned: 'Stunned',
  unconscious: 'Unconscious',
}

/**
 * Note redazionali: NON vengono dalla fonte e non la correggono.
 * Chiave: `<edizione>:<id>`.
 */
const NOTE = {
  '2024:incapacitated':
    'L’edizione italiana dell’SRD 5.2.1 apre questa voce con «ha la condizione "paralizzato"»: '
    + 'è un errore di traduzione, nell’originale la condizione è «incapacitated». Il testo qui sopra '
    + 'resta quello pubblicato, parola per parola; questa nota è dell’app, non della fonte.',
}

const EDIZIONI = [
  {
    edizione: '2014',
    file: 'src/data/dnd5e/conditions.ts',
    esporta: 'dnd5eConditions',
    intestazione: (meta) => `// Condizioni di D&D 5e (2014) — System Reference Document ${meta.srd}, edizione
// italiana, Wizards of the Coast, CC-BY-4.0.
//
// FILE GENERATO da \`scripts/import-conditions.mjs\`. Non modificarlo a mano:
// rigeneralo. Fonte: dnd-companion, \`data/rules/${meta.edizione}.json\`
// (generato il ${meta.generatedAt}, commit ${meta.sourceCommit}).
//
// Quattro condizioni non hanno testo. L'Appendice A dell'SRD 5.1 italiano è
// mutila: si ferma a «Privo di sensi», e Prono, Spaventato, Stordito e
// Trattenuto non ci sono. Il loro \`descriptionIt\` è \`null\` — l'app mostra il
// nome e dichiara che il testo manca. Riempirle con quelle del 2024 sarebbe
// stato comodo e sbagliato: il 2024 le riscrive con regole diverse.
//
// Le usano anche Brancalonia e Apocalisse, che poggiano sulle regole 2014.`,
  },
  {
    edizione: '2024',
    file: 'src/data/dnd2024/conditions.ts',
    esporta: 'dnd2024Conditions',
    intestazione: (meta) => `// Condizioni di D&D 2024 — System Reference Document ${meta.srd}, traduzione
// italiana, Wizards of the Coast, CC-BY-4.0.
//
// FILE GENERATO da \`scripts/import-conditions.mjs\`. Non modificarlo a mano:
// rigeneralo. Fonte: dnd-companion, \`data/rules/${meta.edizione}.json\`
// (generato il ${meta.generatedAt}, commit ${meta.sourceCommit}).
//
// Tutte e quindici hanno il testo. «Incapacitato» lo ha sbagliato — la
// traduzione italiana apre parlando di «paralizzato» — ed è riportato lo
// stesso, verbatim: non si corregge una fonte, la si cita e la si annota.
// L'avvertenza sta in \`note\`, che l'interfaccia tiene visibilmente staccata
// dal testo dell'SRD.`,
  },
]

/** Stringa TypeScript in apici singoli, su una riga. */
function lit(s) {
  return `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`
}

function leggi(edizione) {
  const percorso = resolve(COMPANION, `data/rules/${edizione}.json`)
  let raw
  try {
    raw = readFileSync(percorso, 'utf8')
  } catch {
    throw new Error(
      `Pacchetto regole non trovato: ${percorso}\n`
      + 'Indica il companion con COMPANION_DIR=/percorso/di/dnd-companion.',
    )
  }
  const pacchetto = JSON.parse(raw)
  const conditions = pacchetto.conditions
  if (!Array.isArray(conditions)) throw new Error(`${percorso}: manca la chiave "conditions"`)

  const attesi = Object.keys(NOMI_EN).sort()
  const trovati = conditions.map(c => c.id).sort()
  if (trovati.length !== attesi.length || trovati.some((id, i) => id !== attesi[i])) {
    throw new Error(
      `${percorso}: le condizioni non sono le quindici attese.\n`
      + `  attese: ${attesi.join(', ')}\n  trovate: ${trovati.join(', ')}`,
    )
  }
  for (const c of conditions) {
    if (typeof c.name !== 'string' || !c.name) throw new Error(`${percorso}: ${c.id} senza nome italiano`)
    if (c.description !== null && typeof c.description !== 'string') {
      throw new Error(`${percorso}: ${c.id} ha una descrizione che non è né testo né null`)
    }
  }
  return {
    conditions,
    meta: {
      edizione,
      srd: pacchetto.srd ?? '?',
      generatedAt: pacchetto.generatedAt ?? '?',
      sourceCommit: pacchetto.sourceCommit ?? '?',
    },
  }
}

function genera({ edizione, file, esporta, intestazione }) {
  const { conditions, meta } = leggi(edizione)
  // Ordine canonico per id: indipendente dall'ordine alfabetico italiano della
  // fonte, che cambierebbe se cambiasse una traduzione.
  const ordinate = [...conditions].sort((a, b) => a.id.localeCompare(b.id, 'en'))

  const importoTipo = edizione === '2014'
    ? `export interface Condition {
  id: string
  /** Nome originale (inglese) dell'SRD. */
  name: string
  /** Nome italiano, come stampato nell'edizione italiana dell'SRD. */
  nameIt: string
  /**
   * Testo italiano dell'SRD, verbatim.
   * \`null\` significa «la fonte non lo contiene»: chi lo mostra deve dirlo,
   * non inventarlo né prenderlo dall'altra edizione.
   */
  descriptionIt: string | null
  /**
   * Nota redazionale dell'app — NON fa parte della fonte.
   * Va mostrata visibilmente separata dal testo dell'SRD.
   */
  note?: string
}`
    : `import type { Condition } from '../dnd5e/conditions'`

  const voci = ordinate.map(c => {
    const righe = [
      `    id: ${lit(c.id)},`,
      `    name: ${lit(NOMI_EN[c.id])},`,
      `    nameIt: ${lit(c.name)},`,
      `    descriptionIt: ${c.description === null ? 'null' : lit(c.description)},`,
    ]
    const nota = NOTE[`${edizione}:${c.id}`]
    if (nota) righe.push(`    note: ${lit(nota)},`)
    return `  {\n${righe.join('\n')}\n  },`
  }).join('\n')

  const contenuto = `${intestazione(meta)}

${importoTipo}

export const ${esporta}: readonly Condition[] = [
${voci}
]
`
  writeFileSync(resolve(REPO, file), contenuto, 'utf8')
  const senzaTesto = ordinate.filter(c => c.description === null).map(c => c.name)
  return { file, totale: ordinate.length, senzaTesto }
}

for (const ed of EDIZIONI) {
  const esito = genera(ed)
  console.log(
    `${esito.file}: ${esito.totale} condizioni`
    + (esito.senzaTesto.length ? ` — senza testo: ${esito.senzaTesto.join(', ')}` : ''),
  )
}
