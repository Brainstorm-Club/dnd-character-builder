// WSG 3.8: Per-step lazy-load game data with localStorage caching
import type { GameVariant } from '@/stores/app'
import type { AbilityScores } from '@/stores/character'
import type { Race } from './dnd5e/races'
import type { CharacterClass, Subclass } from './dnd5e/classes'
import type { Background } from './dnd5e/backgrounds'
import type { Spell } from './dnd5e/spells'
import type { EquipmentSet } from './dnd5e/equipment'
import type { BrancaloniaSubclass } from './brancalonia/classes'
import type { BrancaloniaRules, WhacksLevel } from './brancalonia/rules'
import type { ApocalisseSubclass } from './apocalisse/classes'
import type { ApocalisseRules } from './apocalisse/rules'

// ─── Build Hash for Cache Invalidation ──────────────────────────────────────
declare const __BUILD_HASH__: string
const BUILD_HASH = typeof __BUILD_HASH__ !== 'undefined' ? __BUILD_HASH__ : 'dev'
const CACHE_PREFIX = `gamedata:v${BUILD_HASH}:`

// ─── localStorage Helpers ───────────────────────────────────────────────────

/** Remove stale cache entries from previous builds */
export function sweepStaleCache(): void {
  try {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('gamedata:') && !key.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key)
      }
    }
    for (const key of keysToRemove) {
      localStorage.removeItem(key)
    }
  } catch { /* localStorage not available */ }
}

function lsGet<T>(module: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + module)
    if (raw) return JSON.parse(raw) as T
  } catch { /* parse error or unavailable */ }
  return null
}

function lsSet(module: string, data: unknown): void {
  try {
    localStorage.setItem(CACHE_PREFIX + module, JSON.stringify(data))
  } catch { /* quota exceeded or unavailable */ }
}

// ─── Per-Module Memory Cache ────────────────────────────────────────────────

// D&D 5e
let _dnd5eRaces: readonly Race[] | null = null
let _dnd5eClasses: readonly CharacterClass[] | null = null
let _dnd5eBackgrounds: readonly Background[] | null = null
let _dnd5eSpells: readonly Spell[] | null = null
let _dnd5eEquipment: EquipmentSet | null = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _dnd5eGetSpellSlotsForLevel: ((casterType: any, level: number) => Record<number, number>) | null = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _dnd5eGetMulticlassSpellSlots: ((classes: any[]) => { slots: Record<number, number>; pactSlots: Record<number, number> }) | null = null

// Brancalonia
let _brancaRaces: readonly Race[] | null = null
let _brancaTraitDescriptions: { en: Record<string, string>; it: Record<string, string> } | null = null
let _brancaFeatureIt: { desc: Record<string, string>; names: Record<string, string> } | null = null
let _brancaSubclasses: readonly BrancaloniaSubclass[] | null = null
let _brancaBurattinaio: CharacterClass | null = null
let _brancaBackgrounds: readonly Background[] | null = null
let _brancaRules: BrancaloniaRules | null = null
let _brancaSpells: readonly Spell[] | null = null

// Apocalisse
let _apoRaces: readonly Race[] | null = null
let _apoTraitDescriptions: { en: Record<string, string>; it: Record<string, string> } | null = null
let _apoFeatureIt: { desc: Record<string, string>; names: Record<string, string> } | null = null
let _dnd5eFeatureIt: { desc: Record<string, string>; names: Record<string, string> } | null = null

// ─── D&D 2024 (SRD 5.2.1) ───────────────────────────────────────────────
let _dnd24Species: readonly Race[] | null = null
let _dnd24Classes: readonly CharacterClass[] | null = null
let _dnd24Backgrounds: readonly Background[] | null = null
let _dnd24Spells: readonly Spell[] | null = null
// Descrizioni italiane dei privilegi 2024: viaggiano nel chunk della variante,
// come per le altre, così chi non apre il 2024 non le scarica (WSG 3.8).
let _dnd24FeatureIt: Record<string, string> | null = null
let _toDnd24Spells: ((base: readonly Spell[]) => Spell[]) | null = null
// Semi-incantatori 2024: paladino e ranger hanno una tabella di slot propria
// (primo slot al 1º livello, non al 2º), che non sta nel modulo 2014.
let _dnd24HalfCasterSlots: ((level: number) => Record<number, number>) | null = null
// Nel multiclasse 2024 i livelli dei semi-incantatori si arrotondano per
// eccesso, non per difetto: il conto e' un altro e vive nel modulo 2024.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _dnd24MulticlassSpellSlots: ((classes: any[]) => { slots: Record<number, number>; pactSlots: Record<number, number> }) | null = null
let _pDnd24: Promise<void> | null = null

function ensureDnd2024(): Promise<void> {
  // `_toDnd24Spells` fa parte della condizione: senza di lui getSpells('dnd2024')
  // ricade sulla lista 2014, ed è esattamente quello che succedeva alla seconda
  // visita, quando i dati arrivavano dalla cache.
  if (_dnd24Species && _dnd24Classes && _dnd24Backgrounds && _dnd24FeatureIt && _toDnd24Spells && _dnd24HalfCasterSlots && _dnd24MulticlassSpellSlots) return Promise.resolve()
  if (_pDnd24) return _pDnd24
  const cs = lsGet<Race[]>('dnd24-species')
  const cc = lsGet<CharacterClass[]>('dnd24-classes')
  const cb = lsGet<Background[]>('dnd24-backgrounds')
  const ci = lsGet<Record<string, string>>('dnd24-feature-it')
  if (cs && cc && cb && ci) {
    // La funzione di trasformazione non è serializzabile, quindi in cache non
    // c'è: il modulo va importato comunque. È minuscolo — la funzione più i 23
    // incantesimi esclusivi del 2024 — e per questo non viene messo in cache.
    _pDnd24 = Promise.all([
      import('./dnd2024/spells'),
      import('./dnd2024/rules'),
    ]).then(([sp, ru]) => {
      _dnd24Species = cs; _dnd24Classes = cc; _dnd24Backgrounds = cb; _dnd24FeatureIt = ci
      _toDnd24Spells = sp.toDnd2024Spells
      _dnd24HalfCasterSlots = ru.getHalfCasterSlotsForLevel2024
      _dnd24MulticlassSpellSlots = ru.getMulticlassSpellSlots2024
    })
    return _pDnd24
  }
  _pDnd24 = Promise.all([
    import('./dnd2024/races'),
    import('./dnd2024/classes'),
    import('./dnd2024/backgrounds'),
    import('./dnd2024/spells'),
    import('./dnd2024/classes-it'),
    import('./dnd2024/rules'),
  ]).then(([r, c, b, sp, itMod, ru]) => {
    _dnd24Species = r.dnd2024Species
    _dnd24Classes = c.dnd2024Classes
    _dnd24Backgrounds = b.dnd2024Backgrounds
    _dnd24FeatureIt = itMod.dnd2024FeatureDescriptionsIt
    lsSet('dnd24-species', r.dnd2024Species)
    lsSet('dnd24-classes', c.dnd2024Classes)
    lsSet('dnd24-backgrounds', b.dnd2024Backgrounds)
    lsSet('dnd24-feature-it', itMod.dnd2024FeatureDescriptionsIt)
    _toDnd24Spells = sp.toDnd2024Spells
    _dnd24HalfCasterSlots = ru.getHalfCasterSlotsForLevel2024
    _dnd24MulticlassSpellSlots = ru.getMulticlassSpellSlots2024
  })
  return _pDnd24
}
let _apoSubclasses: readonly ApocalisseSubclass[] | null = null
let _apoBackgrounds: readonly Background[] | null = null
let _apoRules: ApocalisseRules | null = null

// ─── Per-Module Promise Deduplication ───────────────────────────────────────

let _pDnd5eRaces: Promise<void> | null = null
let _pDnd5eClasses: Promise<void> | null = null
let _pDnd5eBackgrounds: Promise<void> | null = null
let _pDnd5eSpells: Promise<void> | null = null
let _pDnd5eEquipment: Promise<void> | null = null
let _pDnd5eRules: Promise<void> | null = null

let _pBrancaRaces: Promise<void> | null = null
let _pBrancaClasses: Promise<void> | null = null
let _pBrancaBackgrounds: Promise<void> | null = null
let _pBrancaRules: Promise<void> | null = null
let _pBrancaSpells: Promise<void> | null = null

let _pApoRaces: Promise<void> | null = null
let _pApoClasses: Promise<void> | null = null
let _pApoBackgrounds: Promise<void> | null = null
let _pApoRules: Promise<void> | null = null

// ─── D&D 5e Module Loaders ──────────────────────────────────────────────────

function ensureDnd5eRaces(): Promise<void> {
  if (_dnd5eRaces) return Promise.resolve()
  if (_pDnd5eRaces) return _pDnd5eRaces
  // Try localStorage first
  const cached = lsGet<Race[]>('dnd5e-races')
  if (cached) { _dnd5eRaces = cached; return Promise.resolve() }
  _pDnd5eRaces = import('./dnd5e/races').then(m => {
    _dnd5eRaces = m.races
    lsSet('dnd5e-races', m.races)
  })
  return _pDnd5eRaces
}

function ensureDnd5eClasses(): Promise<void> {
  if (_dnd5eClasses && _dnd5eFeatureIt) return Promise.resolve()
  if (_pDnd5eClasses) return _pDnd5eClasses
  const cached = lsGet<CharacterClass[]>('dnd5e-classes')
  const cachedIt = lsGet<{ desc: Record<string, string>; names: Record<string, string> }>('dnd5e-feature-it')
  if (cached && cachedIt) {
    _dnd5eClasses = cached
    _dnd5eFeatureIt = cachedIt
    return Promise.resolve()
  }
  _pDnd5eClasses = Promise.all([
    import('./dnd5e/classes'),
    import('./dnd5e/classes-it'),
  ]).then(([m, itMod]) => {
    _dnd5eClasses = m.classes
    // I nomi dei privilegi D&D vivono in gameTerms: qui solo le descrizioni.
    _dnd5eFeatureIt = { desc: itMod.dnd5eFeatureDescriptionsIt, names: {} }
    lsSet('dnd5e-classes', m.classes)
    lsSet('dnd5e-feature-it', _dnd5eFeatureIt)
  })
  return _pDnd5eClasses
}

function ensureDnd5eBackgrounds(): Promise<void> {
  if (_dnd5eBackgrounds) return Promise.resolve()
  if (_pDnd5eBackgrounds) return _pDnd5eBackgrounds
  const cached = lsGet<Background[]>('dnd5e-backgrounds')
  if (cached) { _dnd5eBackgrounds = cached; return Promise.resolve() }
  _pDnd5eBackgrounds = import('./dnd5e/backgrounds').then(m => {
    _dnd5eBackgrounds = m.backgrounds
    lsSet('dnd5e-backgrounds', m.backgrounds)
  })
  return _pDnd5eBackgrounds
}

function ensureDnd5eSpells(): Promise<void> {
  if (_dnd5eSpells) return Promise.resolve()
  if (_pDnd5eSpells) return _pDnd5eSpells
  const cached = lsGet<Spell[]>('dnd5e-spells')
  if (cached) { _dnd5eSpells = cached; return Promise.resolve() }
  _pDnd5eSpells = import('./dnd5e/spells').then(m => {
    _dnd5eSpells = m.spells
    lsSet('dnd5e-spells', m.spells)
  })
  return _pDnd5eSpells
}

function ensureDnd5eEquipment(): Promise<void> {
  if (_dnd5eEquipment) return Promise.resolve()
  if (_pDnd5eEquipment) return _pDnd5eEquipment
  const cached = lsGet<EquipmentSet>('dnd5e-equipment')
  if (cached) { _dnd5eEquipment = cached; return Promise.resolve() }
  _pDnd5eEquipment = import('./dnd5e/equipment').then(m => {
    _dnd5eEquipment = m.equipmentData
    lsSet('dnd5e-equipment', m.equipmentData)
  })
  return _pDnd5eEquipment
}

/** Rules module: functions are NOT cached in localStorage (not serializable) */
function ensureDnd5eRules(): Promise<void> {
  if (_dnd5eGetSpellSlotsForLevel) return Promise.resolve()
  if (_pDnd5eRules) return _pDnd5eRules
  _pDnd5eRules = import('./dnd5e/rules').then(m => {
    _dnd5eGetSpellSlotsForLevel = m.getSpellSlotsForLevel
    _dnd5eGetMulticlassSpellSlots = m.getMulticlassSpellSlots
  })
  return _pDnd5eRules
}

// ─── Brancalonia Module Loaders ─────────────────────────────────────────────

function ensureBrancaRaces(): Promise<void> {
  if (_brancaRaces) return Promise.resolve()
  if (_pBrancaRaces) return _pBrancaRaces
  const cached = lsGet<Race[]>('branca-races')
  const cachedTraits = lsGet<{ en: Record<string, string>; it: Record<string, string> }>('branca-trait-descriptions')
  if (cached && cachedTraits) {
    _brancaRaces = cached
    _brancaTraitDescriptions = cachedTraits
    return Promise.resolve()
  }
  _pBrancaRaces = Promise.all([
    import('./brancalonia/races'),
    import('./brancalonia/traits'),
  ]).then(([raceMod, traitMod]) => {
    _brancaRaces = raceMod.brancaloniaRaces
    _brancaTraitDescriptions = {
      en: traitMod.brancaloniaTraitDescriptions,
      it: traitMod.brancaloniaTraitDescriptionsIt,
    }
    lsSet('branca-races', raceMod.brancaloniaRaces)
    lsSet('branca-trait-descriptions', _brancaTraitDescriptions)
  })
  return _pBrancaRaces
}

function ensureBrancaClasses(): Promise<void> {
  if (_brancaSubclasses && _brancaBurattinaio && _brancaFeatureIt) return Promise.resolve()
  if (_pBrancaClasses) return _pBrancaClasses
  const cachedSubs = lsGet<BrancaloniaSubclass[]>('branca-subclasses')
  const cachedBurat = lsGet<CharacterClass>('branca-burattinaio')
  const cachedIt = lsGet<{ desc: Record<string, string>; names: Record<string, string> }>('branca-feature-it')
  if (cachedSubs && cachedBurat && cachedIt) {
    _brancaSubclasses = cachedSubs
    _brancaBurattinaio = cachedBurat
    _brancaFeatureIt = cachedIt
    return Promise.resolve()
  }
  _pBrancaClasses = Promise.all([
    import('./brancalonia/classes'),
    import('./brancalonia/burattinaio'),
    import('./brancalonia/classes-it'),
  ]).then(([classMod, buratMod, itMod]) => {
    _brancaSubclasses = classMod.brancaloniaSubclasses
    _brancaBurattinaio = buratMod.burattinaioBrancaloniaClass
    _brancaFeatureIt = {
      desc: itMod.brancaloniaFeatureDescriptionsIt,
      names: itMod.brancaloniaFeatureNamesIt,
    }
    lsSet('branca-subclasses', classMod.brancaloniaSubclasses)
    lsSet('branca-burattinaio', buratMod.burattinaioBrancaloniaClass)
    lsSet('branca-feature-it', _brancaFeatureIt)
  })
  return _pBrancaClasses
}

function ensureBrancaBackgrounds(): Promise<void> {
  if (_brancaBackgrounds) return Promise.resolve()
  if (_pBrancaBackgrounds) return _pBrancaBackgrounds
  const cached = lsGet<Background[]>('branca-backgrounds')
  if (cached) { _brancaBackgrounds = cached; return Promise.resolve() }
  _pBrancaBackgrounds = import('./brancalonia/backgrounds').then(m => {
    _brancaBackgrounds = m.brancaloniaBackgrounds
    lsSet('branca-backgrounds', m.brancaloniaBackgrounds)
  })
  return _pBrancaBackgrounds
}

function ensureBrancaRules(): Promise<void> {
  if (_brancaRules) return Promise.resolve()
  if (_pBrancaRules) return _pBrancaRules
  const cached = lsGet<BrancaloniaRules>('branca-rules')
  if (cached) {
    _brancaRules = cached
    return Promise.resolve()
  }
  _pBrancaRules = import('./brancalonia/rules').then(m => {
    _brancaRules = m.brancaloniaRules
    lsSet('branca-rules', m.brancaloniaRules)
  })
  return _pBrancaRules
}

function ensureBrancaSpells(): Promise<void> {
  if (_brancaSpells) return Promise.resolve()
  if (_pBrancaSpells) return _pBrancaSpells
  const cached = lsGet<Spell[]>('branca-spells')
  if (cached) { _brancaSpells = cached; return Promise.resolve() }
  _pBrancaSpells = import('./brancalonia/spells').then(m => {
    _brancaSpells = m.brancaloniaSpells
    lsSet('branca-spells', m.brancaloniaSpells)
  })
  return _pBrancaSpells
}

// ─── Apocalisse Module Loaders ──────────────────────────────────────────────

function ensureApoRaces(): Promise<void> {
  if (_apoRaces) return Promise.resolve()
  if (_pApoRaces) return _pApoRaces
  const cached = lsGet<Race[]>('apo-races')
  const cachedTraits = lsGet<{ en: Record<string, string>; it: Record<string, string> }>('apo-trait-descriptions')
  if (cached && cachedTraits) {
    _apoRaces = cached
    _apoTraitDescriptions = cachedTraits
    return Promise.resolve()
  }
  _pApoRaces = Promise.all([
    import('./apocalisse/races'),
    import('./apocalisse/traits'),
  ]).then(([raceMod, traitMod]) => {
    _apoRaces = raceMod.apocalisseRaces
    _apoTraitDescriptions = {
      en: traitMod.apocalisseTraitDescriptions,
      it: traitMod.apocalisseTraitDescriptionsIt,
    }
    lsSet('apo-races', raceMod.apocalisseRaces)
    lsSet('apo-trait-descriptions', _apoTraitDescriptions)
  })
  return _pApoRaces
}

function ensureApoClasses(): Promise<void> {
  if (_apoSubclasses && _apoFeatureIt) return Promise.resolve()
  if (_pApoClasses) return _pApoClasses
  const cached = lsGet<ApocalisseSubclass[]>('apo-subclasses')
  const cachedIt = lsGet<{ desc: Record<string, string>; names: Record<string, string> }>('apo-feature-it')
  if (cached && cachedIt) {
    _apoSubclasses = cached
    _apoFeatureIt = cachedIt
    return Promise.resolve()
  }
  _pApoClasses = Promise.all([
    import('./apocalisse/classes'),
    import('./apocalisse/classes-it'),
  ]).then(([m, itMod]) => {
    _apoSubclasses = m.apocalisseSubclasses
    _apoFeatureIt = {
      desc: itMod.apocalisseFeatureDescriptionsIt,
      names: itMod.apocalisseFeatureNamesIt,
    }
    lsSet('apo-subclasses', m.apocalisseSubclasses)
    lsSet('apo-feature-it', _apoFeatureIt)
  })
  return _pApoClasses
}

function ensureApoBackgrounds(): Promise<void> {
  if (_apoBackgrounds) return Promise.resolve()
  if (_pApoBackgrounds) return _pApoBackgrounds
  const cached = lsGet<Background[]>('apo-backgrounds')
  if (cached) { _apoBackgrounds = cached; return Promise.resolve() }
  _pApoBackgrounds = import('./apocalisse/backgrounds').then(m => {
    _apoBackgrounds = m.apocalisseBackgrounds
    lsSet('apo-backgrounds', m.apocalisseBackgrounds)
  })
  return _pApoBackgrounds
}

function ensureApoRules(): Promise<void> {
  if (_apoRules) return Promise.resolve()
  if (_pApoRules) return _pApoRules
  const cached = lsGet<ApocalisseRules>('apo-rules')
  if (cached) {
    _apoRules = cached
    return Promise.resolve()
  }
  _pApoRules = import('./apocalisse/rules').then(m => {
    _apoRules = m.apocalisseRules
    lsSet('apo-rules', m.apocalisseRules)
  })
  return _pApoRules
}

// ─── Step-Based Data Loading ────────────────────────────────────────────────

/**
 * Ensure all data modules needed for a given wizard step are loaded.
 * Also prefetches next step's data (fire-and-forget).
 * WSG 3.8: Load only the data each step actually needs.
 */
function loadsForStep(variant: GameVariant, step: number): Promise<void>[] {
  const loads: Promise<void>[] = []

  switch (step) {
    case 1: // Abilities and starting level — no data needed
      break
    case 2: // Race
      if (variant === 'dnd2024') loads.push(ensureDnd2024())
      else if (variant === 'brancalonia') loads.push(ensureBrancaRaces())
      else if (variant === 'apocalisse') loads.push(ensureApoRaces())
      else loads.push(ensureDnd5eRaces())
      break
    case 3: // Class
      if (variant === 'dnd2024') { loads.push(ensureDnd2024()); break }
      loads.push(ensureDnd5eClasses())
      if (variant === 'brancalonia') loads.push(ensureBrancaClasses())
      if (variant === 'apocalisse') loads.push(ensureApoClasses())
      break
    case 4: // Background
      if (variant === 'dnd2024') loads.push(ensureDnd2024())
      else if (variant === 'brancalonia') loads.push(ensureBrancaBackgrounds())
      else if (variant === 'apocalisse') loads.push(ensureApoBackgrounds())
      else loads.push(ensureDnd5eBackgrounds())
      break
    case 5: // Equipment
      loads.push(ensureDnd5eEquipment())
      break
    case 6: // Spells
      loads.push(ensureDnd5eSpells(), ensureDnd5eRules(), ensureDnd5eClasses())
      if (variant === 'brancalonia') loads.push(ensureBrancaSpells())
      // Il 2024 ha classi e liste di incantesimi proprie: senza questo
      // caricamento il passo trovava getClasses('dnd2024') vuoto e ricadeva
      // sulle liste del 2014.
      if (variant === 'dnd2024') loads.push(ensureDnd2024())
      break
    case 7: // Details
      // Races needed for size derivation
      if (variant === 'brancalonia') loads.push(ensureBrancaRaces(), ensureBrancaRules())
      else if (variant === 'apocalisse') loads.push(ensureApoRaces(), ensureApoRules())
      else loads.push(ensureDnd5eRaces())
      break
    case 8: // Review — ensure everything
      loads.push(ensureAllForVariant(variant))
      break
  }

  return loads
}

export async function ensureStepData(variant: GameVariant, step: number): Promise<void> {
  await Promise.all(loadsForStep(variant, step))

  // Prefetch exactly one step ahead. Calling ensureStepData again would recurse
  // all the way to case 8, which loads everything and defeats the lazy loading.
  if (step < 8) {
    void loadsForStep(variant, step + 1).map(pending => pending.catch(() => {}))
  }
}

/** Load all data for a variant (used by Step 9 / Review and random char) */
async function ensureAllForVariant(variant: GameVariant): Promise<void> {
  const loads: Promise<void>[] = [
    ensureDnd5eRaces(), ensureDnd5eClasses(), ensureDnd5eBackgrounds(),
    ensureDnd5eSpells(), ensureDnd5eEquipment(), ensureDnd5eRules(),
  ]
  if (variant === 'dnd2024') loads.push(ensureDnd2024())
  if (variant === 'brancalonia') {
    loads.push(ensureBrancaRaces(), ensureBrancaClasses(), ensureBrancaBackgrounds(), ensureBrancaRules(), ensureBrancaSpells())
  }
  if (variant === 'apocalisse') {
    loads.push(ensureApoRaces(), ensureApoClasses(), ensureApoBackgrounds(), ensureApoRules())
  }
  await Promise.all(loads)
}

// ─── Public API: Preload (backward compat) ──────────────────────────────────

/**
 * Preload all data needed for a given variant.
 * Convenience wrapper — delegates to ensureStepData(variant, 8).
 */
export async function preloadVariantData(variant: GameVariant): Promise<void> {
  await ensureAllForVariant(variant)
}

/**
 * Ensure the data needed by the Spells step is loaded (spells, rules, classes).
 * Call this from the step so the list appears even if the step is reached
 * without going through the sequential per-step loader (direct nav, reload,
 * editing a saved character).
 *
 * La variante conta davvero: Brancalonia aggiunge incantesimi suoi e il 2024
 * porta classi e liste di classe proprie. Finché il 2024 non veniva caricato
 * qui, il passo mostrava un bardo del 2024 con le regole del 2014.
 */
export async function ensureSpellData(variant: GameVariant): Promise<void> {
  const loads = [ensureDnd5eSpells(), ensureDnd5eRules(), ensureDnd5eClasses()]
  if (variant === 'brancalonia') loads.push(ensureBrancaSpells())
  if (variant === 'dnd2024') loads.push(ensureDnd2024())
  await Promise.all(loads)
}

/** Check if variant data is already cached (all modules) */
export function isVariantLoaded(variant: GameVariant): boolean {
  const dnd5eLoaded = !!_dnd5eRaces && !!_dnd5eClasses && !!_dnd5eBackgrounds
    && !!_dnd5eSpells && !!_dnd5eEquipment && !!_dnd5eGetSpellSlotsForLevel
  switch (variant) {
    case 'brancalonia':
      return dnd5eLoaded && !!_brancaRaces && !!_brancaSubclasses && !!_brancaBackgrounds && !!_brancaRules
    case 'apocalisse':
      return dnd5eLoaded && !!_apoRaces && !!_apoSubclasses && !!_apoBackgrounds && !!_apoRules
    // Il 2024 ha specie, classi e background propri: senza questo ramo cadeva
    // nel default e si dichiarava caricato appena c'erano i dati 2014, mentre
    // le sue liste erano ancora vuote. `_toDnd24Spells` compare qui per lo
    // stesso motivo per cui compare in ensureDnd2024: senza di lui la lista
    // incantesimi ricade su quella del 2014.
    case 'dnd2024':
      return dnd5eLoaded && !!_dnd24Species && !!_dnd24Classes && !!_dnd24Backgrounds
        && !!_dnd24FeatureIt && !!_toDnd24Spells
    default:
      return dnd5eLoaded
  }
}

// ─── Races ──────────────────────────────────────────────────────────────────

export function getRaces(variant: GameVariant): readonly Race[] {
  if (variant === 'dnd2024') return _dnd24Species ?? []
  switch (variant) {
    case 'brancalonia': return _brancaRaces ?? []
    case 'apocalisse': return _apoRaces ?? []
    default: return _dnd5eRaces ?? []
  }
}

/**
 * What a racial trait does, in the requested locale, from the variant's own
 * data. This text ships in the lazily loaded variant chunk rather than in the
 * always-loaded Italian dictionary (WSG 3.8), so it costs nothing to players
 * who never open that variant. Returns '' for variants without descriptions.
 */
/**
 * Descrizione italiana di una sottoclasse o di un suo privilegio.
 * Brancalonia e Apocalisse hanno manuali italiani, quindi l'interfaccia
 * italiana mostra il testo del manuale; il 2024 ha la traduzione dell'SRD
 * 5.2.1, che è un'edizione a sé e non condivide nulla con i testi del 2014.
 */
export function getFeatureDescription(
  variant: GameVariant,
  featureId: string,
  locale: string,
  fallback: string,
): string {
  if (locale !== 'it') return fallback
  // Il 2024 non ricade sui testi del 2014: le regole sono diverse e id uguali
  // (rage, extra-attack...) descriverebbero privilegi che non coincidono.
  if (variant === 'dnd2024') return _dnd24FeatureIt?.[featureId] ?? fallback
  const variantMap = variant === 'brancalonia' ? _brancaFeatureIt
    : variant === 'apocalisse' ? _apoFeatureIt
    : null
  // Brancalonia e Apocalisse costruiscono sulle classi base di D&D: i loro
  // privilegi vanno tradotti anche lì, altrimenti nella stessa schermata si
  // vedrebbero due lingue accostate.
  return variantMap?.desc[featureId] ?? _dnd5eFeatureIt?.desc[featureId] ?? fallback
}

/** Nome italiano di un privilegio, come stampato nel manuale. */
export function getFeatureName(
  variant: GameVariant,
  featureId: string,
  locale: string,
  fallback: string,
): string {
  if (locale !== 'it') return fallback
  const variantMap = variant === 'brancalonia' ? _brancaFeatureIt
    : variant === 'apocalisse' ? _apoFeatureIt
    : null
  return variantMap?.names[featureId] ?? _dnd5eFeatureIt?.names[featureId] ?? fallback
}

export function getTraitDescription(
  variant: GameVariant,
  traitId: string,
  locale: string,
): string {
  const maps = variant === 'brancalonia' ? _brancaTraitDescriptions
    : variant === 'apocalisse' ? _apoTraitDescriptions
    : null
  if (!maps) return ''
  const dict = locale === 'it' ? maps.it : maps.en
  return dict[traitId] ?? maps.en[traitId] ?? ''
}

// ─── Classes ────────────────────────────────────────────────────────────────

export function getClasses(variant: GameVariant): readonly CharacterClass[] {
  if (variant === 'dnd2024') return _dnd24Classes ?? []
  if (!_dnd5eClasses) return []

  switch (variant) {
    case 'brancalonia': {
      if (!_brancaSubclasses) return []
      const brancaClasses = _dnd5eClasses.map(cls => {
        const brancaSubs = _brancaSubclasses!.filter(s => s.parentClassId === cls.id)
        if (brancaSubs.length === 0) return cls
        const convertedSubs: Subclass[] = brancaSubs.map(bs => ({
          id: bs.id,
          name: bs.nameOriginal ? `${bs.name} (${bs.nameOriginal})` : bs.name,
          description: bs.description,
          features: bs.features,
        }))
        return { ...cls, subclasses: convertedSubs }
      })
      if (_brancaBurattinaio) brancaClasses.push(_brancaBurattinaio)
      return brancaClasses
    }
    case 'apocalisse': {
      if (!_apoSubclasses) return []
      return _dnd5eClasses.map(cls => {
        const apoSubs = _apoSubclasses!.filter(s => s.parentClassId === cls.id)
        if (apoSubs.length === 0) return cls
        const convertedSubs: Subclass[] = apoSubs.map(as => ({
          id: as.id,
          name: as.nameOriginal ? `${as.name} (${as.nameOriginal})` : as.name,
          description: as.description,
          features: as.features,
        }))
        return { ...cls, subclasses: convertedSubs }
      })
    }
    default:
      return _dnd5eClasses
  }
}

// ─── Subclasses (Brancalonia-specific) ──────────────────────────────────────

export function getBrancaloniaSubclasses(variant: GameVariant): readonly BrancaloniaSubclass[] {
  if (variant === 'brancalonia') return _brancaSubclasses ?? []
  return []
}

// ─── Backgrounds ────────────────────────────────────────────────────────────

export function getBackgrounds(variant: GameVariant): readonly Background[] {
  if (variant === 'dnd2024') return _dnd24Backgrounds ?? []
  switch (variant) {
    case 'brancalonia': return _brancaBackgrounds ?? []
    case 'apocalisse': return _apoBackgrounds ?? []
    default: return _dnd5eBackgrounds ?? []
  }
}

// ─── Rules ──────────────────────────────────────────────────────────────────

export interface VariantRules {
  maxLevel: number
  currencyStandard: 'gold' | 'silver'
  shortRestDuration: string
  longRestDuration: string
}

const dnd5eRulesData: VariantRules = {
  maxLevel: 20, currencyStandard: 'gold',
  shortRestDuration: '1 hour', longRestDuration: '8 hours',
}
const brancaloniaRulesData: VariantRules = {
  // Setting Book: characters cap at level 6; further advancement grants feats/ASI instead.
  maxLevel: 6, currencyStandard: 'silver',
  shortRestDuration: '1 night (8 hours)', longRestDuration: '1 week of rollicking',
}
const apocalisseRulesData: VariantRules = {
  maxLevel: 20, currencyStandard: 'gold',
  shortRestDuration: '1 hour', longRestDuration: '8 hours',
}

export function getRules(variant: GameVariant): VariantRules {
  switch (variant) {
    case 'brancalonia': return brancaloniaRulesData
    case 'apocalisse': return apocalisseRulesData
    default: return dnd5eRulesData
  }
}

export function getBrancaloniaRules(variant: GameVariant): BrancaloniaRules | null {
  if (variant === 'brancalonia') return _brancaRules ?? null
  return null
}

export function getApocalisseRules(variant: GameVariant): ApocalisseRules | null {
  if (variant === 'apocalisse') return _apoRules ?? null
  return null
}

export function getApocalisseSubclasses(variant: GameVariant): readonly ApocalisseSubclass[] {
  if (variant === 'apocalisse') return _apoSubclasses ?? []
  return []
}

// ─── Max Level ──────────────────────────────────────────────────────────────

export function getMaxLevel(variant: GameVariant): number {
  return getRules(variant).maxLevel
}

// ─── Equipment ──────────────────────────────────────────────────────────────

export function getEquipment(_variant: GameVariant): EquipmentSet {
  return _dnd5eEquipment ?? { simpleWeapons: [], martialWeapons: [], armor: [], packs: [] }
}

// ─── Spells ─────────────────────────────────────────────────────────────────

export function getSpells(variant: GameVariant): readonly Spell[] {
  const base = _dnd5eSpells ?? []
  // Brancalonia adds its own spells on top of the D&D list; several subclasses
  // name them in their domain and expanded lists.
  if (variant === 'brancalonia') return [...base, ...(_brancaSpells ?? [])]
  // Il 2024 riusa gli stessi incantesimi con le liste di classe aggiornate.
  if (variant === 'dnd2024') {
    if (!_toDnd24Spells || base.length === 0) return base
    if (!_dnd24Spells) _dnd24Spells = _toDnd24Spells(base)
    return _dnd24Spells
  }
  return base
}

/**
 * La classe di riferimento per le regole di lancio, nella variante scelta.
 *
 * Le funzioni qui sotto cercavano sempre e solo dentro `_dnd5eClasses`: un
 * bardo del 2024 (che nel suo manuale prepara gli incantesimi) veniva letto
 * dalla scheda del bardo 2014 (che li conosce), e il flag scritto nei dati del
 * 2024 non aveva alcun effetto.
 *
 * Non passa da `getClasses` di proposito: quella funzione, per Brancalonia e
 * Apocalisse, pretende che siano già caricate anche le sottoclassi e altrimenti
 * torna una lista vuota — cioè zero slot per tutti nel passo incantesimi, dove
 * le sottoclassi non servono. Qui basta il telaio della classe.
 */
function findSpellcastingClass(variant: GameVariant, className: string): CharacterClass | undefined {
  if (variant === 'dnd2024') return _dnd24Classes?.find(c => c.id === className)
  const hit = _dnd5eClasses?.find(c => c.id === className)
  if (hit) return hit
  // Il burattinaio è una classe in più di Brancalonia, fuori dall'elenco 2014.
  if (variant === 'brancalonia' && _brancaBurattinaio?.id === className) return _brancaBurattinaio
  return undefined
}

/** Come una classe accede agli incantesimi: non lancia, li conosce, li prepara. */
export type SpellcastingMode = 'none' | 'known' | 'prepared'

export interface SpellcastingProfile {
  mode: SpellcastingMode
  /** Trucchetti concessi al livello dato. */
  cantrips: number
  /**
   * Quanti incantesimi di livello 1+ la scheda può portare.
   * `null` significa «la regola esiste ma il numero non è nei dati»: chi lo
   * mostra deve dirlo, non ripiegare sul conto di un'altra edizione.
   */
  spellsCount: number | null
}

const NO_MODS: Record<keyof AbilityScores, number> = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 }

/**
 * Profilo di lancio di una classe a un dato livello, secondo le regole della
 * variante. È l'unico punto che decide known/prepared: le funzioni storiche
 * qui sotto ne sono involucri, così procedura guidata e generatore casuale non
 * possono più divergere.
 */
export function getSpellcastingProfile(
  className: string,
  level: number,
  abilityModifiers: Record<keyof AbilityScores, number>,
  variant: GameVariant = 'dnd5e',
): SpellcastingProfile {
  const sc = findSpellcastingClass(variant, className)?.spellcasting
  if (!sc) return { mode: 'none', cantrips: 0, spellsCount: 0 }

  const idx = Math.min(level - 1, sc.cantripsKnown.length - 1)
  const cantrips = sc.cantripsKnown[idx] ?? 0

  if (sc.preparedCaster) {
    return { mode: 'prepared', cantrips, spellsCount: preparedSpellsCount(variant, sc, level, abilityModifiers) }
  }
  if (sc.spellsKnown) {
    const kIdx = Math.min(level - 1, sc.spellsKnown.length - 1)
    return { mode: 'known', cantrips, spellsCount: sc.spellsKnown[kIdx] ?? 0 }
  }
  // Ha una tabella di slot ma nessun conteggio: non sa dire quanti ne porta.
  return { mode: 'none', cantrips, spellsCount: 0 }
}

function preparedSpellsCount(
  variant: GameVariant,
  sc: NonNullable<CharacterClass['spellcasting']>,
  level: number,
  abilityModifiers: Record<keyof AbilityScores, number>,
): number | null {
  // Nel 2024 il numero di incantesimi preparati viene da una colonna della
  // tabella di classe ("Prepared Spells"), non dalla formula 2014
  // «modificatore + livello». Quella colonna non è ancora nei dati (in
  // src/data/dnd2024/classes.ts c'è solo cantripsKnown), quindi qui si
  // dichiara «non lo so»: stampare il numero del 2014 sarebbe una regola
  // sbagliata spacciata per buona.
  if (variant === 'dnd2024') return null
  const abilityMod = abilityModifiers[sc.ability] ?? 0
  return Math.max(1, abilityMod + level)
}

export function getSpellSlots(
  className: string,
  level: number,
  variant: GameVariant = 'dnd5e',
): Record<number, number> {
  if (!_dnd5eGetSpellSlotsForLevel) return {}
  const cls = findSpellcastingClass(variant, className)
  if (!cls?.spellcasting) return {}
  const casterType = cls.spellcasting.casterType
  // Nel 2024 paladino e ranger ottengono il primo slot al 1º livello: la
  // tabella del 2014 li lascerebbe senza magia al 1º e sfaserebbe tutto il
  // resto della progressione. Le altre varianti restano sul telaio 2014.
  if (variant === 'dnd2024' && casterType === 'half' && _dnd24HalfCasterSlots) {
    return _dnd24HalfCasterSlots(level)
  }
  return _dnd5eGetSpellSlotsForLevel(casterType, level)
}

export function getCantripsKnown(className: string, level: number, variant: GameVariant = 'dnd5e'): number {
  return getSpellcastingProfile(className, level, NO_MODS, variant).cantrips
}

/**
 * Conteggio secco, per i chiamanti che vogliono un numero e basta.
 * Un dato mancante diventa 0: chi deve distinguere «zero» da «non lo so» usa
 * `getSpellcastingProfile`.
 */
export function getSpellsKnownCount(
  className: string,
  level: number,
  abilityModifiers: Record<keyof AbilityScores, number>,
  variant: GameVariant = 'dnd5e',
): number {
  return getSpellcastingProfile(className, level, abilityModifiers, variant).spellsCount ?? 0
}

// ─── Multiclass Spell Slots (redirected from dnd5e/rules) ──────────────────

/**
 * Get multiclass spell slots. Wraps the function from dnd5e/rules
 * so step components don't need direct imports.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getMulticlassSpellSlots(
  classes: { classId: string; level: number; casterType: any }[],
  variant: GameVariant = 'dnd5e',
): { slots: Record<number, number>; pactSlots: Record<number, number> } {
  // Il 2024 conta i semi-incantatori per eccesso: senza la variante un
  // paladino 1/mago 1 restava un incantatore di 1º livello invece che di 2º.
  if (variant === 'dnd2024' && _dnd24MulticlassSpellSlots) return _dnd24MulticlassSpellSlots(classes)
  if (!_dnd5eGetMulticlassSpellSlots) return { slots: {}, pactSlots: {} }
  return _dnd5eGetMulticlassSpellSlots(classes)
}

// ─── Whacks Levels (redirected from brancalonia/rules) ──────────────────────

/** Get the Brancalonia whacks (brawling damage) levels. */
export function getWhacksLevels(): readonly WhacksLevel[] {
  return _brancaRules?.whacksLevels ?? []
}

// ─── Languages ──────────────────────────────────────────────────────────────

const DND5E_LANGUAGES = [
  'Common', 'Dwarvish', 'Elvish', 'Giant', 'Gnomish',
  'Goblin', 'Halfling', 'Orc', 'Abyssal', 'Celestial',
  'Draconic', 'Deep Speech', 'Infernal', 'Primordial',
  'Sylvan', 'Undercommon',
]

export function getAvailableLanguages(variant: GameVariant): string[] {
  switch (variant) {
    case 'brancalonia':
      return _brancaRules?.languages.map(l => l.name) ?? DND5E_LANGUAGES
    case 'apocalisse':
      return _apoRules?.languages.map(l => l.name) ?? DND5E_LANGUAGES
    default:
      return DND5E_LANGUAGES
  }
}

// ─── Test Helpers ───────────────────────────────────────────────────────────

/** @internal Reset all caches — for testing only */
export function _resetCaches(): void {
  _dnd5eRaces = _dnd5eClasses = _dnd5eBackgrounds = _dnd5eSpells = null
  _dnd5eEquipment = null
  _dnd5eGetSpellSlotsForLevel = _dnd5eGetMulticlassSpellSlots = null
  _brancaRaces = _brancaBackgrounds = _brancaRules = null
  _brancaSpells = null
  _brancaTraitDescriptions = null
  _brancaSubclasses = null; _brancaBurattinaio = null
  _apoRaces = _apoBackgrounds = _apoRules = null
  _apoTraitDescriptions = null
  _apoSubclasses = null
  // Anche il 2024: restava fuori dalla pulizia, e un test che azzerava le cache
  // continuava a vedere le specie e le classi caricate dal test precedente.
  _dnd24Species = _dnd24Classes = _dnd24Backgrounds = _dnd24Spells = null
  _dnd24FeatureIt = null
  _toDnd24Spells = null
  _dnd24HalfCasterSlots = null
  _dnd24MulticlassSpellSlots = null
  _pDnd24 = null
  _pDnd5eRaces = _pDnd5eClasses = _pDnd5eBackgrounds = _pDnd5eSpells = _pDnd5eEquipment = _pDnd5eRules = null
  _pBrancaRaces = _pBrancaClasses = _pBrancaBackgrounds = _pBrancaRules = _pBrancaSpells = null
  _pApoRaces = _pApoClasses = _pApoBackgrounds = _pApoRules = null
}
