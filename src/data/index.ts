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
let _brancaSubclasses: readonly BrancaloniaSubclass[] | null = null
let _brancaBurattinaio: CharacterClass | null = null
let _brancaBackgrounds: readonly Background[] | null = null
let _brancaRules: BrancaloniaRules | null = null

// Apocalisse
let _apoRaces: readonly Race[] | null = null
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
  if (_dnd5eClasses) return Promise.resolve()
  if (_pDnd5eClasses) return _pDnd5eClasses
  const cached = lsGet<CharacterClass[]>('dnd5e-classes')
  if (cached) { _dnd5eClasses = cached; return Promise.resolve() }
  _pDnd5eClasses = import('./dnd5e/classes').then(m => {
    _dnd5eClasses = m.classes
    lsSet('dnd5e-classes', m.classes)
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
  if (cached) { _brancaRaces = cached; return Promise.resolve() }
  _pBrancaRaces = import('./brancalonia/races').then(m => {
    _brancaRaces = m.brancaloniaRaces
    lsSet('branca-races', m.brancaloniaRaces)
  })
  return _pBrancaRaces
}

function ensureBrancaClasses(): Promise<void> {
  if (_brancaSubclasses && _brancaBurattinaio) return Promise.resolve()
  if (_pBrancaClasses) return _pBrancaClasses
  const cachedSubs = lsGet<BrancaloniaSubclass[]>('branca-subclasses')
  const cachedBurat = lsGet<CharacterClass>('branca-burattinaio')
  if (cachedSubs && cachedBurat) {
    _brancaSubclasses = cachedSubs
    _brancaBurattinaio = cachedBurat
    return Promise.resolve()
  }
  _pBrancaClasses = Promise.all([
    import('./brancalonia/classes'),
    import('./brancalonia/burattinaio'),
  ]).then(([classMod, buratMod]) => {
    _brancaSubclasses = classMod.brancaloniaSubclasses
    _brancaBurattinaio = buratMod.burattinaioBrancaloniaClass
    lsSet('branca-subclasses', classMod.brancaloniaSubclasses)
    lsSet('branca-burattinaio', buratMod.burattinaioBrancaloniaClass)
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

// ─── Apocalisse Module Loaders ──────────────────────────────────────────────

function ensureApoRaces(): Promise<void> {
  if (_apoRaces) return Promise.resolve()
  if (_pApoRaces) return _pApoRaces
  const cached = lsGet<Race[]>('apo-races')
  if (cached) { _apoRaces = cached; return Promise.resolve() }
  _pApoRaces = import('./apocalisse/races').then(m => {
    _apoRaces = m.apocalisseRaces
    lsSet('apo-races', m.apocalisseRaces)
  })
  return _pApoRaces
}

function ensureApoClasses(): Promise<void> {
  if (_apoSubclasses) return Promise.resolve()
  if (_pApoClasses) return _pApoClasses
  const cached = lsGet<ApocalisseSubclass[]>('apo-subclasses')
  if (cached) { _apoSubclasses = cached; return Promise.resolve() }
  _pApoClasses = import('./apocalisse/classes').then(m => {
    _apoSubclasses = m.apocalisseSubclasses
    lsSet('apo-subclasses', m.apocalisseSubclasses)
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
export async function ensureStepData(variant: GameVariant, step: number): Promise<void> {
  const loads: Promise<void>[] = []

  switch (step) {
    case 1: // Race
      if (variant === 'brancalonia') loads.push(ensureBrancaRaces())
      else if (variant === 'apocalisse') loads.push(ensureApoRaces())
      else loads.push(ensureDnd5eRaces())
      break
    case 2: // Class
      loads.push(ensureDnd5eClasses())
      if (variant === 'brancalonia') loads.push(ensureBrancaClasses())
      if (variant === 'apocalisse') loads.push(ensureApoClasses())
      break
    case 3: // Abilities — no data needed
      break
    case 4: // Background
      if (variant === 'brancalonia') loads.push(ensureBrancaBackgrounds())
      else if (variant === 'apocalisse') loads.push(ensureApoBackgrounds())
      else loads.push(ensureDnd5eBackgrounds())
      break
    case 5: // Equipment
      loads.push(ensureDnd5eEquipment())
      break
    case 6: // Spells
      loads.push(ensureDnd5eSpells(), ensureDnd5eRules(), ensureDnd5eClasses())
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

  await Promise.all(loads)

  // Prefetch next step (fire-and-forget)
  if (step < 8) {
    ensureStepData(variant, step + 1).catch(() => {})
  }
}

/** Load all data for a variant (used by Step 9 / Review and random char) */
async function ensureAllForVariant(variant: GameVariant): Promise<void> {
  const loads: Promise<void>[] = [
    ensureDnd5eRaces(), ensureDnd5eClasses(), ensureDnd5eBackgrounds(),
    ensureDnd5eSpells(), ensureDnd5eEquipment(), ensureDnd5eRules(),
  ]
  if (variant === 'brancalonia') {
    loads.push(ensureBrancaRaces(), ensureBrancaClasses(), ensureBrancaBackgrounds(), ensureBrancaRules())
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
 * editing a saved character). Spells are dnd5e-only, so `variant` is accepted
 * for API symmetry but not used to branch.
 */
export async function ensureSpellData(_variant: GameVariant): Promise<void> {
  await Promise.all([ensureDnd5eSpells(), ensureDnd5eRules(), ensureDnd5eClasses()])
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
    default:
      return dnd5eLoaded
  }
}

// ─── Races ──────────────────────────────────────────────────────────────────

export function getRaces(variant: GameVariant): readonly Race[] {
  switch (variant) {
    case 'brancalonia': return _brancaRaces ?? []
    case 'apocalisse': return _apoRaces ?? []
    default: return _dnd5eRaces ?? []
  }
}

// ─── Classes ────────────────────────────────────────────────────────────────

export function getClasses(variant: GameVariant): readonly CharacterClass[] {
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
  maxLevel: 10, currencyStandard: 'silver',
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

export function getSpells(_variant: GameVariant): readonly Spell[] {
  return _dnd5eSpells ?? []
}

export function getSpellSlots(className: string, level: number): Record<number, number> {
  if (!_dnd5eClasses || !_dnd5eGetSpellSlotsForLevel) return {}
  const cls = _dnd5eClasses.find(c => c.id === className)
  if (!cls?.spellcasting) return {}
  return _dnd5eGetSpellSlotsForLevel(cls.spellcasting.casterType, level)
}

export function getCantripsKnown(className: string, level: number): number {
  if (!_dnd5eClasses) return 0
  const cls = _dnd5eClasses.find(c => c.id === className)
  if (!cls?.spellcasting) return 0
  const idx = Math.min(level - 1, cls.spellcasting.cantripsKnown.length - 1)
  return cls.spellcasting.cantripsKnown[idx] ?? 0
}

export function getSpellsKnownCount(
  className: string,
  level: number,
  abilityModifiers: Record<keyof AbilityScores, number>,
): number {
  if (!_dnd5eClasses) return 0
  const cls = _dnd5eClasses.find(c => c.id === className)
  if (!cls?.spellcasting) return 0

  if (cls.spellcasting.preparedCaster) {
    const abilityMod = abilityModifiers[cls.spellcasting.ability] ?? 0
    return Math.max(1, abilityMod + level)
  }
  if (cls.spellcasting.spellsKnown) {
    const idx = Math.min(level - 1, cls.spellcasting.spellsKnown.length - 1)
    return cls.spellcasting.spellsKnown[idx] ?? 0
  }
  return 0
}

// ─── Multiclass Spell Slots (redirected from dnd5e/rules) ──────────────────

/**
 * Get multiclass spell slots. Wraps the function from dnd5e/rules
 * so step components don't need direct imports.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getMulticlassSpellSlots(
  classes: { classId: string; level: number; casterType: any }[],
): { slots: Record<number, number>; pactSlots: Record<number, number> } {
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
  _brancaSubclasses = null; _brancaBurattinaio = null
  _apoRaces = _apoBackgrounds = _apoRules = null
  _apoSubclasses = null
  _pDnd5eRaces = _pDnd5eClasses = _pDnd5eBackgrounds = _pDnd5eSpells = _pDnd5eEquipment = _pDnd5eRules = null
  _pBrancaRaces = _pBrancaClasses = _pBrancaBackgrounds = _pBrancaRules = null
  _pApoRaces = _pApoClasses = _pApoBackgrounds = _pApoRules = null
}
