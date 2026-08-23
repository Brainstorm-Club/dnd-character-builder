/**
 * SCI (Software Carbon Intensity) Benchmark for D&D Character Builder
 *
 * Profiles the key operations of the app and generates a JSON + Markdown report.
 * Run: npx tsx scripts/sci-benchmark.ts
 *
 * WSG 4.1: Measure and track software carbon intensity
 */
import { execSync } from 'node:child_process'
import { writeFileSync, readFileSync, statSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
// sci-profiler has bundler moduleResolution — use dynamic import workaround
const sciMod = await import('../node_modules/sci-profiler/src/sciProfiler.ts') as any
const { profileTool, configureSci, generateJsonReport, generateMarkdownReport, printSummary } = sciMod
type ProfileResult = Awaited<ReturnType<typeof profileTool>>

// ── Get git commit hash ──────────────────────────────────────────────────────
const commit = execSync('git rev-parse --short HEAD').toString().trim()

// ── Configure SCI for this machine ───────────────────────────────────────────
configureSci({
  machine: process.env.SCI_MACHINE ?? '14-inch MacBook Pro M1 Pro, 16GB, macOS 15',
})

// ── Helpers ──────────────────────────────────────────────────────────────────
function dirSizeBytes(dir: string): number {
  let total = 0
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      if (entry.isFile()) total += statSync(full).size
      else if (entry.isDirectory()) total += dirSizeBytes(full)
    }
  } catch { /* dir doesn't exist */ }
  return total
}

function fileSizeBytes(path: string): number {
  try { return statSync(path).size } catch { return 0 }
}

// ── Benchmarks ───────────────────────────────────────────────────────────────
const results: ProfileResult[] = []

// 1. Data loading — import all game data modules
const r1 = await profileTool(
  'data-load-dnd5e',
  async () => {
    // Dynamic import to measure actual load time
    const mod = await import('../src/data/dnd5e/races')
    const cls = await import('../src/data/dnd5e/classes')
    const bg = await import('../src/data/dnd5e/backgrounds')
    const sp = await import('../src/data/dnd5e/spells')
    const eq = await import('../src/data/dnd5e/equipment')
    return { races: mod.races.length, classes: cls.classes.length, bgs: bg.backgrounds.length, spells: sp.spells.length, eq: Object.keys(eq.equipmentData).length }
  },
)
results.push(r1)

const r2 = await profileTool(
  'data-load-brancalonia',
  async () => {
    const r = await import('../src/data/brancalonia/races')
    const c = await import('../src/data/brancalonia/classes')
    const b = await import('../src/data/brancalonia/backgrounds')
    const ru = await import('../src/data/brancalonia/rules')
    return { races: r.brancaloniaRaces.length, subs: c.brancaloniaSubclasses.length, bgs: b.brancaloniaBackgrounds.length, maxLvl: ru.MAX_LEVEL }
  },
)
results.push(r2)

// La variante 2024 e' la quarta: senza di lei il report misurava tre quarti
// dei dati che l'app carica davvero.
const r2b = await profileTool(
  'data-load-dnd2024',
  async () => {
    const r = await import('../src/data/dnd2024/races')
    const c = await import('../src/data/dnd2024/classes')
    const b = await import('../src/data/dnd2024/backgrounds')
    const sp = await import('../src/data/dnd2024/spells-new')
    const ft = await import('../src/data/dnd2024/feats')
    return {
      species: r.dnd2024Species.length,
      classes: c.dnd2024Classes.length,
      bgs: b.dnd2024Backgrounds.length,
      spells: sp.dnd2024OnlySpells.length,
      feats: ft.dnd2024Feats.length,
    }
  },
)
results.push(r2b)

const r3 = await profileTool(
  'data-load-apocalisse',
  async () => {
    const r = await import('../src/data/apocalisse/races')
    const c = await import('../src/data/apocalisse/classes')
    const b = await import('../src/data/apocalisse/backgrounds')
    const ru = await import('../src/data/apocalisse/rules')
    return { races: r.apocalisseRaces.length, subs: c.apocalisseSubclasses.length, bgs: b.apocalisseBackgrounds.length, maxLvl: ru.MAX_LEVEL }
  },
)
results.push(r3)

// 2. Calculations — simulate full character stat computation (1000 iterations)
const r4 = await profileTool(
  'calculations-1000x',
  async () => {
    const { modifier, proficiencyBonus, totalHp, baseAC, spellSaveDC, spellAttackBonus } = await import('../src/utils/calculations')
    for (let i = 0; i < 1000; i++) {
      const score = 8 + (i % 13) // 8-20
      const level = 1 + (i % 20)  // 1-20
      const mod = modifier(score)
      const prof = proficiencyBonus(level)
      totalHp(10, mod, level)
      baseAC(mod)
      spellSaveDC(prof, mod)
      spellAttackBonus(prof, mod)
    }
    return { iterations: 1000 }
  },
)
results.push(r4)

// 3. JSON serialization — simulate character export/import
const r5 = await profileTool(
  'json-serialize-character',
  async () => {
    const character = {
      variant: 'dnd5e',
      name: 'Thorin Oakenshield',
      race: 'dwarf', subrace: 'hill-dwarf',
      className: 'fighter', subclass: 'champion',
      level: 5,
      abilities: { strength: 16, dexterity: 12, constitution: 14, intelligence: 10, wisdom: 13, charisma: 8 },
      racialBonuses: { strength: 0, dexterity: 0, constitution: 2, intelligence: 0, wisdom: 1, charisma: 0 },
      background: 'soldier',
      skillProficiencies: ['athletics', 'intimidation', 'perception', 'survival'],
      languages: ['Common', 'Dwarvish'],
      equipment: { weapons: ['battleaxe', 'handaxe'], armor: ['chain-mail'], gear: ['shield', 'backpack'] },
      spells: { cantrips: [], prepared: [] },
      details: { age: '150', height: "4'5\"", weight: '170 lbs', eyes: 'Brown', skin: 'Tan', hair: 'Black' },
      notes: 'A seasoned warrior from the mountain kingdoms.',
    }
    // Serialize + deserialize 100 times
    let lastParsed
    for (let i = 0; i < 100; i++) {
      const json = JSON.stringify(character)
      lastParsed = JSON.parse(json)
    }
    return lastParsed
  },
  0,
  (result) => JSON.stringify(result).length,
)
results.push(r5)

// 4. Production build size analysis (read-only, no rebuild)
const docsDir = join(import.meta.dirname, '..', 'docs')
const r6 = await profileTool(
  'build-output-analysis',
  async () => {
    const assetsDir = join(docsDir, 'assets')
    const totalSize = dirSizeBytes(assetsDir)
    const htmlSize = fileSizeBytes(join(docsDir, 'index.html'))
    const swSize = fileSizeBytes(join(docsDir, 'sw.js'))

    const jsFiles = readdirSync(assetsDir).filter(f => f.endsWith('.js'))
    const cssFiles = readdirSync(assetsDir).filter(f => f.endsWith('.css'))
    const jsTotal = jsFiles.reduce((s, f) => s + fileSizeBytes(join(assetsDir, f)), 0)
    const cssTotal = cssFiles.reduce((s, f) => s + fileSizeBytes(join(assetsDir, f)), 0)

    return {
      totalAssetBytes: totalSize,
      htmlBytes: htmlSize,
      swBytes: swSize,
      jsFiles: jsFiles.length,
      jsTotalBytes: jsTotal,
      cssFiles: cssFiles.length,
      cssTotalBytes: cssTotal,
    }
  },
  dirSizeBytes(docsDir),
)
results.push(r6)

// 5. PDF template size (read-only)
const pdfDir = join(import.meta.dirname, '..', 'public', 'pdf')
const r7 = await profileTool(
  'pdf-template-read',
  async () => {
    const files = readdirSync(pdfDir).filter(f => f.endsWith('.pdf'))
    const sizes: Record<string, number> = {}
    for (const f of files) {
      const data = readFileSync(join(pdfDir, f))
      sizes[f] = data.byteLength
    }
    return sizes
  },
  0,
  (sizes) => Object.values(sizes).reduce((a, b) => a + b, 0),
)
results.push(r7)

// 6. i18n locale loading — now only active locale is loaded eagerly
const r8 = await profileTool(
  'i18n-load-single-locale',
  async () => {
    // Measures loading a single locale (the optimized path — one locale at startup)
    const it = await import('../src/i18n/locales/it.json')
    return { keys: Object.keys(it.default).length }
  },
)
results.push(r8)

// ── Generate reports ─────────────────────────────────────────────────────────
console.log('\n')
printSummary(results)

const jsonReport = generateJsonReport(results, { commit })
const mdReport = generateMarkdownReport(results, { commit })

// Write JSON report
const reportDir = join(import.meta.dirname, '..', 'wsg-report')
const publicDir = join(import.meta.dirname, '..', 'public')
const jsonStr = JSON.stringify(jsonReport, null, 2) + '\n'
writeFileSync(join(reportDir, 'sci-report.json'), jsonStr)
writeFileSync(join(publicDir, 'sci-report.json'), jsonStr)
console.log(`\n✅ JSON report written to wsg-report/sci-report.json + public/sci-report.json`)

// Write Markdown report
writeFileSync(join(reportDir, 'sci-report.md'), mdReport + '\n')
console.log(`✅ Markdown report written to wsg-report/sci-report.md`)

// ── Append to history ────────────────────────────────────────────────────────
const historyPath = join(reportDir, 'sci-history.json')
let history: Record<string, unknown> = {}
if (existsSync(historyPath)) {
  try {
    history = JSON.parse(readFileSync(historyPath, 'utf-8'))
  } catch { /* corrupted file, start fresh */ }
}
history[commit] = jsonReport
writeFileSync(historyPath, JSON.stringify(history, null, 2) + '\n')
console.log(`✅ History updated in wsg-report/sci-history.json (${Object.keys(history).length} entries)`)
