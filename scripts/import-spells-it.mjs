#!/usr/bin/env node
// Genera `src/data/dnd5e/spells-it.ts` e `src/data/dnd2024/spells-it.ts`
// dal compendio italiano di dnd-companion.
//
//   node scripts/import-spells-it.mjs
//   node scripts/import-spells-it.mjs --companion /altro/percorso/dnd-companion
//   DND_COMPANION_DIR=/altro/percorso node scripts/import-spells-it.mjs
//
// Il compendio sta fuori da questo repository: sono gli incantesimi dell'SRD
// italiano (5.1 e 5.2.1, CC-BY-4.0) estratti dai PDF ufficiali. Qui dentro
// arriva solo il testo, agganciato agli id inglesi del builder tramite il
// `ponte.json` del compendio.
//
// Lo script è deterministico: a parità di compendio riscrive byte per byte lo
// stesso file, quindi rilanciarlo senza aggiornamenti non produce diff.
// `--check` non scrive nulla e esce con codice 1 se il file su disco è diverso
// da quello che genererebbe: serve in CI e prima di un commit.

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// ─── Argomenti ──────────────────────────────────────────────────────────────

const argv = process.argv.slice(2)
const check = argv.includes('--check')
const flagIdx = argv.indexOf('--companion')
const companion = resolve(
  flagIdx >= 0 && argv[flagIdx + 1]
    ? argv[flagIdx + 1]
    : process.env.DND_COMPANION_DIR ?? join(REPO, '..', 'brainstorm', 'dnd-companion'),
)

/**
 * Le due edizioni. `nomeExport` e `file` sono l'unica cosa che cambia fra loro:
 * la struttura del compendio è identica.
 */
const EDIZIONI = [
  {
    edizione: '2014',
    file: 'src/data/dnd5e/spells-it.ts',
    nomeExport: 'dnd5eSpellTextsIt',
    fonte: 'System Reference Document 5.1',
    fonteBreve: 'SRD 5.1',
  },
  {
    edizione: '2024',
    file: 'src/data/dnd2024/spells-it.ts',
    nomeExport: 'dnd2024SpellTextsIt',
    fonte: 'System Reference Document 5.2.1',
    fonteBreve: 'SRD 5.2.1',
  },
]

// ─── Lettura del compendio ──────────────────────────────────────────────────

function leggiJson(percorso) {
  if (!existsSync(percorso)) {
    console.error(`Manca ${percorso}.`)
    console.error('Indica il compendio con --companion <percorso> o DND_COMPANION_DIR.')
    process.exit(2)
  }
  return JSON.parse(readFileSync(percorso, 'utf8'))
}

/** I dieci file di livello di un'edizione, indicizzati per id italiano. */
function leggiRecord(edizione) {
  const perId = new Map()
  for (let livello = 0; livello <= 9; livello++) {
    for (const r of leggiJson(join(companion, 'data', 'spells', edizione, `l${livello}.json`))) {
      perId.set(r.id, r)
    }
  }
  return perId
}

/**
 * Normalizza il testo del compendio.
 *
 * Solo pulizia meccanica, nessuna riscrittura: CRLF in LF, spazi in coda alle
 * righe via, righe vuote in testa e in coda via. I ritorni a capo interni
 * restano dove sono — nei 48 record che vengono da tabelle o elenchi puntati
 * sono l'unica struttura rimasta, e ricucirli a mano vorrebbe dire inventare
 * dove finisce una riga di tabella e dove comincia la prosa.
 */
function normalizza(testo) {
  return testo
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map(riga => riga.replace(/[ \t]+$/, ''))
    .join('\n')
    .trim()
}

// ─── Generazione ────────────────────────────────────────────────────────────

/** Letterale TS di una stringa, con gli a capo espliciti. JSON.stringify basta. */
const lit = s => JSON.stringify(s)

function intestazione(ed, quanti, residui) {
  const righe = [
    `// Testo integrale italiano degli incantesimi — ${ed.fonte} (${ed.edizione}).`,
    '//',
    `// GENERATO. Non modificare a mano: \`node scripts/import-spells-it.mjs\``,
    '// lo riscrive dal compendio italiano di dnd-companion.',
    '//',
    `// Fonte: ${ed.fonte} italiano, Wizards of the Coast, CC-BY-4.0.`,
    '// L\'attribuzione completa sta in DATA-SOURCES.md e nella pagina Crediti',
    '// dell\'app, come la licenza richiede.',
    '//',
    `// ${quanti} incantesimi su ${quanti + residui.length} della lista ${ed.edizione} del builder.`,
  ]
  if (residui.length > 0) {
    const nomi = residui.map(r => r.nome)
    const elenco = nomi.length === 1 ? nomi[0] : `${nomi.slice(0, -1).join(', ')} e ${nomi.at(-1)}`
    righe.push(
      `// Senza testo: ${elenco}, che ${nomi.length === 1 ? 'sta' : 'stanno'} nel Player's Handbook`,
      '// e non nell\'SRD. Lì l\'interfaccia ricade sulla descrizione inglese: non si',
      '// inventa nulla e non si copia da fonti che non si possono ridistribuire.',
    )
  }
  return righe.join('\n')
}

function genera(ed) {
  const base = join(companion, 'data', 'spells', ed.edizione)
  const ponte = leggiJson(join(base, 'ponte.json'))
  const residui = leggiJson(join(base, 'ponte-residui.json'))
  const record = leggiRecord(ed.edizione)

  const idBuilder = Object.keys(ponte).sort()
  const voci = []
  for (const id of idBuilder) {
    const r = record.get(ponte[id])
    if (!r) {
      console.error(`Il ponte ${ed.edizione} manda ${id} a "${ponte[id]}", che nel compendio non c'è.`)
      process.exit(2)
    }
    const testo = normalizza(r.testo ?? '')
    if (testo === '') {
      console.error(`${ed.edizione}: ${id} (${r.id}) ha testo vuoto.`)
      process.exit(2)
    }
    const oltre = normalizza(r.aLivelliSuperiori ?? '')
    voci.push(
      oltre === ''
        ? `  ${lit(id)}: { testo: ${lit(testo)} },`
        : `  ${lit(id)}: { testo: ${lit(testo)}, aLivelliSuperiori: ${lit(oltre)} },`,
    )
  }

  const corpo = [
    intestazione(ed, voci.length, residui),
    '',
    'import type { SpellTextIt } from \'../spells-it\'',
    '',
    `export const ${ed.nomeExport}: Record<string, SpellTextIt> = {`,
    ...voci,
    '}',
    '',
  ].join('\n')

  return { corpo, quanti: voci.length, residui }
}

// ─── Esecuzione ─────────────────────────────────────────────────────────────

let diverso = false
for (const ed of EDIZIONI) {
  const { corpo, quanti, residui } = genera(ed)
  const percorso = join(REPO, ed.file)
  const attuale = existsSync(percorso) ? readFileSync(percorso, 'utf8') : null

  if (check) {
    if (attuale !== corpo) {
      diverso = true
      console.error(`${ed.file} è diverso da quello che il compendio genererebbe.`)
    } else {
      console.log(`${ed.file}: aggiornato (${quanti} incantesimi).`)
    }
    continue
  }

  if (attuale === corpo) {
    console.log(`${ed.file}: già aggiornato (${quanti} incantesimi).`)
  } else {
    writeFileSync(percorso, corpo, 'utf8')
    console.log(`${ed.file}: scritti ${quanti} incantesimi.`)
  }
  if (residui.length > 0) {
    console.log(`  senza testo: ${residui.map(r => `${r.nome} (${r.id})`).join(', ')}`)
  }
}

if (diverso) process.exit(1)
