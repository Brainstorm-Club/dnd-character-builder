import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { GameVariant } from './app'
import { GAME_VARIANTS } from './app'
import { modifier, proficiencyBonus, hpPerLevel, totalHp, computeArmorClass, armorIdFromName } from '@/utils/calculations'
import { getMaxLevel, getClasses, getRaces, getBackgrounds } from '@/data'

export interface AbilityScores {
  str: number
  dex: number
  con: number
  int: number
  wis: number
  cha: number
}

export interface Weapon {
  name: string
  attackBonus: number
  damage: string
}

export interface ClassEntry {
  classId: string
  subclass: string
  level: number
  hitDie: number
}

/**
 * Versione dello schema della scheda.
 *
 * 1 = tutto ciò che è stato salvato fino a `featuresTraits` e `armor` da soli.
 * 2 = aggiunge `featureEntries` e `armorId`, i due campi agganciabili da fuori.
 *
 * Una scheda senza il campo vale 1. La migrazione è additiva: i campi vecchi
 * restano dove sono e continuano a funzionare, quindi un salvataggio o un link
 * di prima resta leggibile anche da chi non conosce lo schema 2.
 */
export const CHARACTER_SCHEMA_VERSION = 2

/** Da dove arriva un privilegio. `unknown` = non riconducibile ai dati di gioco. */
export type FeatureSource = 'race' | 'subrace' | 'class' | 'subclass' | 'background' | 'unknown'

/**
 * Una voce dell'elenco privilegi, in forma leggibile senza indovinare.
 *
 * `featuresTraits` è un sacco misto: mescola id di tratti razziali
 * ('draconic-ancestry') e nomi inglesi di privilegi ('Reckless Attack'), e
 * ripete la stessa riga quando un privilegio si ottiene due volte
 * (un barbaro di 10° ha due "Ability Score Improvement"). Chi legge un export
 * non può né stamparlo né agganciarlo: deve indovinare se una voce è un id o
 * un nome, e deduplicare a mano.
 *
 * Qui ogni voce dice id stabile, nome di visualizzazione, provenienza e
 * livello. I doppioni si distinguono per livello (le due ASI del barbaro
 * stanno a 4 e a 8); quando anche il livello coincide si contano in `count`.
 */
export interface FeatureEntry {
  /** Identificatore stabile: l'id del privilegio nei dati, o quello del tratto razziale. */
  id: string
  /** Nome di visualizzazione, esattamente la stringa che finisce in `featuresTraits`. */
  name: string
  /** Chi lo concede. */
  source: FeatureSource
  /** Id della classe / sottoclasse / specie / sottorazza / background che lo concede. */
  sourceId: string
  /** Livello a cui si ottiene. 0 per i tratti di specie e di background, che si hanno da subito. */
  level: number
  /** Quante volte la stessa voce si ottiene a quel livello. Quasi sempre 1. */
  count: number
}

export interface CharacterData {
  id: string
  variant: GameVariant
  name: string
  playerName: string
  race: string
  subrace: string
  /** Talento razziale scelto (Brancalonia: tratto feat-choice). Assente nelle schede salvate prima della sua introduzione. */
  feat?: string
  className: string
  subclass: string
  level: number
  background: string
  alignment: string
  experiencePoints: number
  abilityScores: AbilityScores
  racialBonuses: Partial<AbilityScores>
  skillProficiencies: string[]
  skillExpertise: string[]
  savingThrowProficiencies: string[]
  languages: string[]
  proficienciesOther: string[]
  weapons: Weapon[]
  /** Nome di listino inglese dell'armatura indossata ('Chain Mail'). Resta la fonte primaria. */
  armor: string
  /**
   * Slug stabile della stessa armatura ('chain-mail'), per chi legge la scheda
   * da fuori. Sempre derivato da `armor`; assente nelle schede salvate prima
   * della sua introduzione, dove va ricavato dalla migrazione.
   */
  armorId?: string
  shield: boolean
  equipment: string[]
  coins: { cp: number; sp: number; ep: number; gp: number; pp: number }
  personalityTraits: string
  ideals: string
  bonds: string
  flaws: string
  /**
   * Elenco piatto dei privilegi, così com'è sempre stato: id di tratti razziali
   * e nomi inglesi di privilegi mescolati, ripetizioni comprese. Continua a
   * essere quello che stampano il riepilogo e la scheda PDF.
   */
  featuresTraits: string[]
  /**
   * Gli stessi privilegi in forma strutturata. Invariante: espandendo ogni voce
   * `count` volte si riottiene `featuresTraits` identico, ordine compreso.
   * Assente nelle schede salvate prima della sua introduzione.
   */
  featureEntries?: FeatureEntry[]
  backstory: string
  age: string
  height: string
  weight: string
  eyes: string
  hair: string
  skin: string
  allies: string
  treasure: string
  spellcastingClass: string
  spellcastingAbility: string
  cantrips: string[]
  spellsKnown: string[]
  /**
   * How many spells the character may know. 0 = use the class default.
   * Decoupled from spell slots on purpose: a level-1 wizard can know more
   * spells than they have slots to cast. Set via roll (1d4/level), manual
   * entry, or auto-selection in the spells step. Optional/undefined = default.
   */
  spellsKnownLimit?: number
  spellsPrepared: string[]
  hitDie: number
  maxHp: number
  currentHp: number
  tempHp: number
  speed: number
  // Brancalonia specific
  brawlingMoves: string[]
  misdeeds: string
  size: string
  whacksLevel: number
  // Apocalisse specific
  mark: string
  markSpirit: string
  virtue: string
  sin: string
  humanity: number
  // Session notes
  sessionNotes: string
  // Multiclass (D&D 5e only) — empty array = single class
  classes: ClassEntry[]
  /** Versione dello schema con cui la scheda è stata scritta. Assente = 1. */
  schemaVersion?: number
}

function createEmptyCharacter(): CharacterData {
  return {
    id: crypto.randomUUID(),
    variant: 'dnd5e',
    name: '',
    playerName: '',
    race: '',
    subrace: '',
    feat: '',
    className: '',
    subclass: '',
    level: 1,
    background: '',
    alignment: '',
    experiencePoints: 0,
    abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    racialBonuses: {},
    skillProficiencies: [],
    skillExpertise: [],
    savingThrowProficiencies: [],
    languages: [],
    proficienciesOther: [],
    weapons: [],
    armor: '',
    armorId: '',
    shield: false,
    equipment: [],
    coins: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    personalityTraits: '',
    ideals: '',
    bonds: '',
    flaws: '',
    featuresTraits: [],
    featureEntries: [],
    backstory: '',
    age: '',
    height: '',
    weight: '',
    eyes: '',
    hair: '',
    skin: '',
    allies: '',
    treasure: '',
    spellcastingClass: '',
    spellcastingAbility: '',
    cantrips: [],
    spellsKnown: [],
    spellsKnownLimit: 0,
    spellsPrepared: [],
    hitDie: 8,
    maxHp: 0,
    currentHp: 0,
    tempHp: 0,
    speed: 30,
    brawlingMoves: [],
    misdeeds: '',
    size: '',
    whacksLevel: 0,
    mark: '',
    markSpirit: '',
    virtue: '',
    sin: '',
    humanity: 10,
    sessionNotes: '',
    classes: [],
    schemaVersion: CHARACTER_SCHEMA_VERSION,
  }
}

/**
 * Clamp a character to its variant's maximum level.
 * Needed for characters saved before a variant's cap was lowered (Brancalonia
 * went from 10 to 6): an out-of-range level breaks the wizard's level control
 * and makes levelUp() silently refuse. Only the level fields are touched --
 * maxHp and featuresTraits are left as saved so nothing the player earned is
 * silently thrown away; they can be reconciled with the level-down control.
 */
export function clampToMaxLevel(char: CharacterData): boolean {
  const maxLv = getMaxLevel(char.variant)
  if (char.level <= maxLv) return false

  char.level = maxLv
  const entries = char.classes ?? []
  if (entries.length > 0) {
    // Trim from the last class entry backwards until the total fits the cap.
    let excess = entries.reduce((sum, e) => sum + e.level, 0) - maxLv
    for (let i = entries.length - 1; i >= 0 && excess > 0; i--) {
      const entry = entries[i]!
      const removable = Math.min(excess, entry.level - 1)
      entry.level -= removable
      excess -= removable
    }
    // With more classes than the cap allows, every entry is already at 1 and
    // nothing above is removable: drop whole entries from the end instead.
    while (excess > 0 && entries.length > 1) {
      excess -= entries.pop()!.level
    }
    char.level = Math.min(entries.reduce((sum, e) => sum + e.level, 0), maxLv)
  }
  return true
}

/**
 * Voci di classe da cui derivano privilegi e sottoclassi: le entrate del
 * multiclasse se ce n'è più di una, altrimenti la sola classe principale.
 */
function classEntriesOf(char: CharacterData): { classId: string; subclass: string; level: number }[] {
  if (char.classes.length >= 2) {
    return char.classes.map(c => ({ classId: c.classId, subclass: c.subclass, level: c.level }))
  }
  return [{ classId: char.className, subclass: char.subclass, level: char.level }]
}

/** Tratti concessi dalla specie e dalla sottorazza del personaggio. */
function racialTraitEntries(char: CharacterData): FeatureEntry[] {
  const race = getRaces(char.variant).find(r => r.id === char.race)
  if (!race) return []
  const subrace = race.subraces.find(s => s.id === char.subrace)
  // I tratti razziali nei dati sono soltanto id: l'id è anche il nome che
  // finisce in `featuresTraits`, ed è quello che le traduzioni sanno cercare.
  return [
    ...race.traits.map(id => entry(id, id, 'race', race.id, 0)),
    ...(subrace?.traits ?? []).map(id => entry(id, id, 'subrace', subrace!.id, 0)),
  ]
}

function entry(id: string, name: string, source: FeatureSource, sourceId: string, level: number): FeatureEntry {
  return { id, name, source, sourceId, level, count: 1 }
}

/** Chiave di identità di una voce: due voci con la stessa chiave sono la stessa cosa. */
function entryKey(e: FeatureEntry): string {
  return `${e.source}|${e.sourceId}|${e.id}|${e.level}`
}

/**
 * Fonde in `count` le voci identiche consecutive. Solo consecutive: l'ordine di
 * `featuresTraits` è quello che si vede sul riepilogo e sulla scheda PDF, e
 * accorpare a distanza sposterebbe una riga.
 */
function collapseRepeats(entries: FeatureEntry[]): FeatureEntry[] {
  const out: FeatureEntry[] = []
  for (const e of entries) {
    const last = out[out.length - 1]
    if (last && entryKey(last) === entryKey(e)) last.count += 1
    else out.push({ ...e })
  }
  return out
}

/** Espande le voci nell'elenco piatto di sempre. Inverso esatto di collapseRepeats. */
export function featureNames(entries: readonly FeatureEntry[]): string[] {
  const out: string[] = []
  for (const e of entries) {
    for (let i = 0; i < Math.max(1, e.count); i++) out.push(e.name)
  }
  return out
}

/**
 * Elenco dei privilegi spettanti al personaggio così com'è adesso: i tratti di
 * specie e sottorazza, poi per ogni classe quelli fino al livello raggiunto in
 * quella classe, seguiti da quelli della sua sottoclasse.
 *
 * Unica fonte di verità per syncClassAndLevel, levelUp e levelDown: finché i
 * tre percorsi ricostruiscono la stessa lista, salire e riscendere di livello
 * resta un'operazione reversibile. I tratti razziali sono ricalcolati e non
 * solo conservati perché la procedura guidata non li ha mai scritti: senza,
 * un elfo restava senza Scurovisione tanto nel riepilogo quanto nel PDF.
 */
export function computeFeatureEntries(char: CharacterData): FeatureEntry[] {
  const allClasses = getClasses(char.variant)
  const out: FeatureEntry[] = [...racialTraitEntries(char)]
  for (const ce of classEntriesOf(char)) {
    const cls = allClasses.find(c => c.id === ce.classId)
    if (!cls) continue
    out.push(...cls.features.filter(f => f.level <= ce.level)
      .map(f => entry(f.id, f.name, 'class', cls.id, f.level)))
    const sub = cls.subclasses.find(s => s.id === ce.subclass)
    if (sub) {
      out.push(...sub.features.filter(f => f.level <= ce.level)
        .map(f => entry(f.id, f.name, 'subclass', sub.id, f.level)))
    }
  }
  return collapseRepeats(out)
}

/**
 * Riscrive insieme le due forme dell'elenco privilegi, così non possono
 * divergere: qualunque percorso ricalcoli i privilegi passa di qui.
 */
function applyComputedFeatures(char: CharacterData): void {
  const entries = computeFeatureEntries(char)
  char.featureEntries = entries
  char.featuresTraits = featureNames(entries)
  char.schemaVersion = CHARACTER_SCHEMA_VERSION
}

/**
 * Toglie le sottoclassi che il personaggio non ha (più) il livello per avere,
 * sulla classe principale e su ogni voce del multiclasse.
 */
function revokeUnearnedSubclasses(char: CharacterData): void {
  const allClasses = getClasses(char.variant)
  const primary = allClasses.find(c => c.id === char.className)
  if (primary) {
    const primaryLevel = char.classes.length >= 2
      ? (char.classes.find(c => c.classId === char.className)?.level ?? char.level)
      : char.level
    const chosen = primary.subclasses.find(s => s.id === char.subclass)
    if (char.subclass && (!chosen || primaryLevel < primary.subclassLevel)) char.subclass = ''
  }
  for (const entry of char.classes) {
    const cls = allClasses.find(c => c.id === entry.classId)
    if (!cls) continue
    const chosen = cls.subclasses.find(s => s.id === entry.subclass)
    if (entry.subclass && (!chosen || entry.level < cls.subclassLevel)) entry.subclass = ''
  }
}

/** Differenza fra due liste di privilegi, ripetizioni comprese. */
function featureDiff(from: string[], to: string[]): string[] {
  const pool = [...to]
  const out: string[] = []
  for (const name of from) {
    const i = pool.indexOf(name)
    if (i >= 0) pool.splice(i, 1)
    else out.push(name)
  }
  return out
}

/**
 * Tutte le provenienze possibili di un privilegio per questo personaggio, in
 * ordine di ricerca. Serve alla migrazione, che deve risalire dalla stringa
 * salvata a chi la concede.
 */
function candidateEntries(char: CharacterData): FeatureEntry[] {
  const out: FeatureEntry[] = [...racialTraitEntries(char)]
  const allClasses = getClasses(char.variant)
  for (const ce of classEntriesOf(char)) {
    const cls = allClasses.find(c => c.id === ce.classId)
    if (!cls) continue
    out.push(...cls.features.map(f => entry(f.id, f.name, 'class', cls.id, f.level)))
    for (const sub of cls.subclasses) {
      if (sub.id !== ce.subclass) continue
      out.push(...sub.features.map(f => entry(f.id, f.name, 'subclass', sub.id, f.level)))
    }
  }
  const bg = getBackgrounds(char.variant).find(b => b.id === char.background)
  if (bg) out.push(entry(bg.id, bg.feature.name, 'background', bg.id, 0))
  return out
}

/**
 * Ricostruisce le voci strutturate a partire dall'elenco piatto **già salvato**,
 * senza ricalcolarlo dai dati di gioco.
 *
 * È deliberato: `featuresTraits` di una scheda salvata può non coincidere con
 * quello che i dati produrrebbero oggi — una scheda ritoccata a mano, una
 * riportata sotto il tetto di livello (dove i privilegi restano quelli
 * guadagnati, per scelta di clampToMaxLevel), un personaggio del blog scritto a
 * mano. Ricalcolare farebbe divergere le due forme; qui invece la
 * corrispondenza è uno a uno e `featuresTraits` non viene toccato.
 *
 * Le ripetizioni si risolvono per livello: la prima "Ability Score Improvement"
 * prende il livello 4, la seconda il livello 8. Ciò che non si aggancia a
 * nessun dato resta come voce `unknown`, col nome intatto: meglio una voce
 * onesta che una attribuzione inventata.
 */
export function deriveFeatureEntries(char: CharacterData): FeatureEntry[] {
  const candidates = candidateEntries(char)
  // Un cursore per nome: le occorrenze successive dello stesso nome prendono
  // le corrispondenze successive, in ordine di livello crescente.
  const byName = new Map<string, FeatureEntry[]>()
  for (const c of candidates) {
    const list = byName.get(c.name) ?? []
    list.push(c)
    byName.set(c.name, list)
  }
  for (const list of byName.values()) list.sort((a, b) => a.level - b.level)
  const used = new Map<string, number>()

  const out: FeatureEntry[] = []
  for (const name of char.featuresTraits) {
    const list = byName.get(name)
    const i = used.get(name) ?? 0
    const match = list?.[i] ?? list?.[list.length - 1]
    used.set(name, i + 1)
    out.push(match ? { ...match } : entry(name, name, 'unknown', '', 0))
  }
  return collapseRepeats(out)
}

/**
 * Le due forme dell'elenco privilegi dicono ancora la stessa cosa? È
 * l'invariante che rende `featureEntries` affidabile: espandendo le voci si
 * deve riottenere `featuresTraits` tale e quale, ordine compreso.
 */
function entriesMatchNames(c: CharacterData): boolean {
  if (!Array.isArray(c.featureEntries)) return false
  const flat = featureNames(c.featureEntries)
  return flat.length === c.featuresTraits.length && flat.every((n, i) => n === c.featuresTraits[i])
}

/** I dati della variante sono già in memoria? Senza, ogni voce finirebbe `unknown`. */
function variantDataReady(char: CharacterData): boolean {
  return getClasses(char.variant).length > 0 && getRaces(char.variant).length > 0
}

/**
 * Porta una singola scheda allo schema corrente. Estratta perché non è più solo
 * l'archivio a tornare dal localStorage: anche il personaggio in corso viene
 * persistito, e senza questa funzione applicata a entrambi rientrava dallo
 * storage un oggetto che nessuna migrazione toccava.
 *
 * Aggiunge, non sostituisce: `featuresTraits` e `armor` restano esattamente
 * come sono stati salvati, e i due campi nuovi si affiancano.
 */
export function syncDerivedFields(c: CharacterData): void {
  if (!Array.isArray((c as any).featuresTraits)) (c as any).featuresTraits = []

  // Schema 1 → 2. Lo slug d'armatura si ricava sempre: la tabella delle
  // armature è importata staticamente, non dipende dal caricamento della
  // variante. `armor` non viene toccato: resta lui la fonte primaria.
  c.armorId = armorIdFromName(c.armor)

  if ((c.schemaVersion ?? 1) < CHARACTER_SCHEMA_VERSION || !entriesMatchNames(c)) {
    c.featureEntries = deriveFeatureEntries(c)
    // La migrazione si dichiara conclusa solo se i dati della variante erano
    // caricati: all'idratazione dal localStorage spesso non lo sono ancora, e
    // marcarla finita congelerebbe un elenco di sole voci `unknown`. Lasciando
    // la versione a 1 il prossimo passaggio — salvataggio, export, apertura
    // della scheda — la rifà con i dati veri.
    c.schemaVersion = variantDataReady(c) ? CHARACTER_SCHEMA_VERSION : 1
  }
}

export function migrateCharacter(c: CharacterData) {
  if ((c as any).sessionNotes === undefined) (c as any).sessionNotes = ''
  if (!Array.isArray((c as any).classes)) (c as any).classes = []
  if (typeof (c as any).spellsKnownLimit !== 'number') (c as any).spellsKnownLimit = 0
  syncDerivedFields(c)
  clampToMaxLevel(c)
}

/**
 * Meccanica della salita di livello, staccata dallo store perché deve poter
 * agire tanto sul personaggio in corso quanto su una scheda dell'archivio:
 * far salire di livello una scheda salvata passando da `loadCharacter`
 * sovrascriveva il personaggio che l'utente stava costruendo.
 */
function applyLevelUp(char: CharacterData, classId?: string): { hpGained: number; newFeatures: string[] } | null {
  const maxLv = getMaxLevel(char.variant)
  if (char.level >= maxLv) return null

  const conMod = modifier(char.abilityScores.con + (char.racialBonuses.con || 0))
  let hitDieForLevel: number

  if (char.classes.length >= 2 && classId) {
    // Multiclass: level up specific class
    const entry = char.classes.find(c => c.classId === classId)
    if (!entry) return null
    entry.level += 1
    char.level = char.classes.reduce((sum, c) => sum + c.level, 0)
    hitDieForLevel = entry.hitDie
  } else {
    // Single class or multiclass without specific target
    char.level += 1
    hitDieForLevel = char.hitDie

    // Also update classes array entry if populated
    if (char.classes.length >= 1) {
      const entry = char.classes.find(c => c.classId === char.className)
      if (entry) entry.level += 1
    }
  }

  // HP gain: hitDie/2 + 1 + CON modifier
  const hpGained = hpPerLevel(hitDieForLevel, conMod)
  char.maxHp += hpGained
  char.currentHp = char.maxHp

  // Ricostruisce l'elenco dei privilegi invece di aggiungere quelli nuovi:
  // così le voci che si ripetono a livelli diversi (Aumento dei Punteggi di
  // Caratteristica, Attacco Extra, i privilegi d'archetipo) vengono contate
  // tutte, e la lista resta identica a quella di syncClassAndLevel.
  const before = [...char.featuresTraits]
  applyComputedFeatures(char)
  const newFeatures = featureDiff(char.featuresTraits, before)

  return { hpGained, newFeatures }
}

export const useCharacterStore = defineStore('character', () => {
  const character = ref<CharacterData>(createEmptyCharacter())
  const savedCharacters = ref<CharacterData[]>([])

  // Migration: add new fields to existing saved characters
  // Runs as a watcher so it fires AFTER pinia-plugin-persistedstate hydrates from localStorage
  function migrateCharacters() {
    for (const c of savedCharacters.value) migrateCharacter(c)
  }
  migrateCharacters()
  // Not `{ once: true }`: another tab or a manual restore can replace the
  // store later, and that batch needs migrating too.
  watch(savedCharacters, migrateCharacters)

  // Computed derived stats
  const abilityModifiers = computed(() => ({
    str: modifier(totalAbilityScore('str')),
    dex: modifier(totalAbilityScore('dex')),
    con: modifier(totalAbilityScore('con')),
    int: modifier(totalAbilityScore('int')),
    wis: modifier(totalAbilityScore('wis')),
    cha: modifier(totalAbilityScore('cha')),
  }))

  const profBonus = computed(() => proficiencyBonus(character.value.level))

  const armorClass = computed(() => computeArmorClass(character.value))

  const initiative = computed(() => abilityModifiers.value.dex)

  const passivePerception = computed(() => {
    const base = 10 + abilityModifiers.value.wis
    const proficient = character.value.skillProficiencies.includes('perception')
    return base + (proficient ? profBonus.value : 0)
  })

  function totalAbilityScore(ability: keyof AbilityScores): number {
    const base = character.value.abilityScores[ability]
    const bonus = character.value.racialBonuses[ability] || 0
    return base + bonus
  }

  function resetCharacter() {
    character.value = createEmptyCharacter()
  }

  /** Maximum localStorage budget for saved characters (5 MB) */
  const MAX_STORAGE_BYTES = 5 * 1024 * 1024

  function saveCharacter() {
    // I campi derivati vanno riallineati prima di congelare la copia: quando la
    // scheda è rientrata dal localStorage senza i dati della variante caricati,
    // `featureEntries` è ancora l'elenco di ripiego. Solo i derivati: il
    // controllo sul tetto di livello resta dov'era, all'idratazione e all'import.
    syncDerivedFields(character.value)
    const idx = savedCharacters.value.findIndex(c => c.id === character.value.id)
    const copy = JSON.parse(JSON.stringify(character.value))

    // Estimate storage size before saving
    const tentative = idx >= 0
      ? [...savedCharacters.value.slice(0, idx), copy, ...savedCharacters.value.slice(idx + 1)]
      : [...savedCharacters.value, copy]
    const estimatedSize = new Blob([JSON.stringify(tentative)]).size
    if (estimatedSize > MAX_STORAGE_BYTES) {
      throw new Error('STORAGE_LIMIT_EXCEEDED')
    }

    if (idx >= 0) {
      savedCharacters.value[idx] = copy
    } else {
      savedCharacters.value.push(copy)
    }
  }

  function loadCharacter(id: string) {
    const found = savedCharacters.value.find(c => c.id === id)
    if (found) {
      character.value = JSON.parse(JSON.stringify(found))
      syncDerivedFields(character.value)
    }
  }

  function deleteCharacter(id: string) {
    savedCharacters.value = savedCharacters.value.filter(c => c.id !== id)
  }

  /**
   * Il personaggio in corso ha qualcosa che andrebbe perso a sostituirlo?
   * Unica fonte di verità per chi deve chiedere conferma prima di azzerarlo.
   */
  const hasUnsavedWork = computed(() => {
    const c = character.value
    if (!(c.race || c.className || c.name)) return false
    return !savedCharacters.value.some(s => s.id === c.id)
  })

  /** Whether current character is multiclass */
  const isMulticlass = computed(() => (character.value.classes ?? []).length >= 2)

  /**
   * Add a second (or third, etc.) class to the current D&D 5e character.
   * Only works for dnd5e variant.
   */
  function addMulticlass(classId: string) {
    const char = character.value
    if (char.variant !== 'dnd5e') return

    const allClasses = getClasses(char.variant)
    const newCls = allClasses.find(c => c.id === classId)
    if (!newCls) return

    // If classes array is empty, populate with current primary class first
    if (char.classes.length === 0) {
      char.classes.push({
        classId: char.className,
        subclass: char.subclass,
        level: char.level,
        hitDie: char.hitDie,
      })
    }

    // Don't add the same class twice
    if (char.classes.some(c => c.classId === classId)) return

    // Add the new class at level 1
    char.classes.push({
      classId,
      subclass: '',
      level: 1,
      hitDie: newCls.hitDie,
    })

    // Recalculate total level
    char.level = char.classes.reduce((sum, c) => sum + c.level, 0)

    // Recalculate HP for the new level 1 in new class
    const conMod = modifier(
      char.abilityScores.con + (char.racialBonuses.con || 0),
    )
    char.maxHp += hpPerLevel(newCls.hitDie, conMod)
    char.currentHp = char.maxHp

    // I privilegi vanno ricostruiti come fanno setSubclass, levelUp e
    // levelDown: senza, la nuova classe non porta in dote nemmeno il proprio
    // 1° livello, e il riepilogo resta a quelli della sola classe di partenza
    revokeUnearnedSubclasses(char)
    applyComputedFeatures(char)
  }

  /**
   * Remove a secondary class from multiclass.
   * Cannot remove the primary class.
   */
  function removeMulticlass(classId: string) {
    const char = character.value
    if (char.classes.length < 2) return
    // Don't remove primary class
    if (char.classes[0]?.classId === classId) return

    char.classes = char.classes.filter(c => c.classId !== classId)

    // If only one class remains, keep classes populated (it's still valid)
    // Recalculate total level
    char.level = char.classes.reduce((sum, c) => sum + c.level, 0)

    // Recalculate total HP from scratch
    const conMod = modifier(
      char.abilityScores.con + (char.racialBonuses.con || 0),
    )
    let hp = 0
    for (let i = 0; i < char.classes.length; i++) {
      const entry = char.classes[i]!
      for (let lv = 1; lv <= entry.level; lv++) {
        if (i === 0 && lv === 1) {
          // First class, first level: max hit die + CON
          hp += entry.hitDie + conMod
        } else {
          hp += hpPerLevel(entry.hitDie, conMod)
        }
      }
    }
    char.maxHp = Math.max(hp, 1)
    char.currentHp = char.maxHp

    // Come in addMulticlass: togliere la classe deve togliere anche i suoi
    // privilegi, altrimenti restano nel riepilogo e finiscono sulla scheda
    revokeUnearnedSubclasses(char)
    applyComputedFeatures(char)
  }

  /**
   * Choose (or clear) the subclass of a class the character already has.
   * Pass a classId to target a multiclass entry; omit it for the primary class.
   * Features of the previous subclass are removed and the new subclass grants
   * every feature up to the character's level in that class — the same rule
   * levelUp() applies one level at a time.
   * Returns { newFeatures, removedFeatures } or null if the class is unknown.
   */
  function setSubclass(
    subclassId: string,
    classId?: string,
  ): { newFeatures: string[]; removedFeatures: string[] } | null {
    const char = character.value
    const targetClassId = classId ?? char.className
    if (!targetClassId) return null

    const cls = getClasses(char.variant).find(c => c.id === targetClassId)
    if (!cls) return null
    // Reject unknown subclass ids ('' clears the current choice)
    if (subclassId && !cls.subclasses.some(s => s.id === subclassId)) return null

    const entry = char.classes.find(c => c.classId === targetClassId)

    if (entry) entry.subclass = subclassId
    if (targetClassId === char.className) char.subclass = subclassId

    // Ricostruzione, non aggiunta per nome: deduplicando si perdeva la seconda
    // occorrenza di un privilegio che classe e sottoclasse portano entrambe
    // allo stesso livello (Pact Boon del warlock e di Lilith in Apocalisse), e
    // la lista finiva diversa da quella di syncClassAndLevel.
    const before = [...char.featuresTraits]
    applyComputedFeatures(char)
    const newFeatures = featureDiff(char.featuresTraits, before)
    const removedFeatures = featureDiff(before, char.featuresTraits)

    // Auto-save if the character exists in saved list
    const idx = savedCharacters.value.findIndex(c => c.id === char.id)
    if (idx >= 0) {
      savedCharacters.value[idx] = JSON.parse(JSON.stringify(char))
    }

    return { newFeatures, removedFeatures }
  }

  /**
   * Level up the current character.
   * For multiclass characters, pass the classId to level up in.
   * Returns { hpGained, newFeatures } or null if at max level.
   */
  /**
   * Rebuild everything that depends on class and level in one shot.
   *
   * The wizard now asks for the level before the class exists, so walking
   * levelUp() up from 1 is not an option. This recomputes the hit die, the hit
   * points and the granted features from scratch, and revokes a subclass the
   * character is no longer high enough for. Safe to call repeatedly.
   */
  function syncClassAndLevel() {
    const char = character.value
    char.level = Math.min(Math.max(Math.round(char.level) || 1, 1), getMaxLevel(char.variant))
    const cls = getClasses(char.variant).find(c => c.id === char.className)
    if (!cls) return

    char.hitDie = cls.hitDie
    revokeUnearnedSubclasses(char)
    applyComputedFeatures(char)

    const conMod = modifier(char.abilityScores.con + (char.racialBonuses.con || 0))
    char.maxHp = totalHp(cls.hitDie, conMod, char.level)
    char.currentHp = char.maxHp
  }

  function levelUp(classId?: string): { hpGained: number; newFeatures: string[] } | null {
    const char = character.value
    const result = applyLevelUp(char, classId)
    if (!result) return null

    // Auto-save if the character exists in saved list
    const idx = savedCharacters.value.findIndex(c => c.id === char.id)
    if (idx >= 0) {
      savedCharacters.value[idx] = JSON.parse(JSON.stringify(char))
    }

    return result
  }

  /**
   * Sale di livello una scheda dell'archivio senza renderla il personaggio in
   * corso. L'elenco personaggi chiamava `loadCharacter` prima di `levelUp`, e
   * così un clic su "Sali di Livello" buttava via il personaggio in
   * costruzione senza chiedere niente.
   */
  function levelUpSaved(id: string, classId?: string): { hpGained: number; newFeatures: string[] } | null {
    const idx = savedCharacters.value.findIndex(c => c.id === id)
    if (idx < 0) return null

    const updated: CharacterData = JSON.parse(JSON.stringify(savedCharacters.value[idx]))
    const result = applyLevelUp(updated, classId)
    if (!result) return null

    savedCharacters.value[idx] = updated
    // Se per caso è proprio la scheda aperta nel wizard, va tenuta allineata:
    // altrimenti il prossimo salvataggio riscriverebbe il livello vecchio.
    if (character.value.id === id) {
      character.value = JSON.parse(JSON.stringify(updated))
    }

    return result
  }

  function levelDown(classId?: string): { hpLost: number; removedFeatures: string[] } | null {
    const char = character.value
    if (char.level <= 1) return null

    const conMod = modifier(
      char.abilityScores.con + (char.racialBonuses.con || 0),
    )
    let hitDieForLevel: number

    if (char.classes.length >= 2 && classId) {
      // Multiclass: level down specific class
      const entry = char.classes.find(c => c.classId === classId)
      if (!entry || entry.level <= 1) return null
      entry.level -= 1
      char.level = char.classes.reduce((sum, c) => sum + c.level, 0)
      hitDieForLevel = entry.hitDie
    } else {
      // Single class or multiclass without specific target
      char.level -= 1
      hitDieForLevel = char.hitDie

      // Also update classes array entry if populated
      if (char.classes.length >= 1) {
        const entry = char.classes.find(c => c.classId === char.className)
        if (entry) entry.level -= 1
      }
    }

    // Reverse the HP gained for the removed level (deterministic formula)
    const hpLost = hpPerLevel(hitDieForLevel, conMod)
    char.maxHp = Math.max(1, char.maxHp - hpLost)
    char.currentHp = Math.min(char.currentHp, char.maxHp)

    // Scendendo si può finire sotto il livello di sblocco della sottoclasse:
    // va revocata prima di ricalcolare i privilegi, altrimenti la scheda
    // continua a stampare un archetipo che il personaggio non ha più.
    revokeUnearnedSubclasses(char)

    // Ricostruzione, non rimozione per nome: cercare il nome cancellava
    // l'unica occorrenza rimasta di un privilegio ripetuto (un guerriero di 7°
    // ha due "Ability Score Improvement") anche quando spettava ancora.
    const before = [...char.featuresTraits]
    applyComputedFeatures(char)
    const removedFeatures = featureDiff(before, char.featuresTraits)

    // Auto-save if the character exists in saved list
    const idx = savedCharacters.value.findIndex(c => c.id === char.id)
    if (idx >= 0) {
      savedCharacters.value[idx] = JSON.parse(JSON.stringify(char))
    }

    return { hpLost, removedFeatures }
  }

  function exportJson(): string {
    // L'export è il formato che leggono gli altri: qui i campi agganciabili
    // devono esserci ed essere aggiornati, non nella forma di ripiego che
    // l'idratazione può aver lasciato.
    syncDerivedFields(character.value)
    return JSON.stringify(character.value, null, 2)
  }

  /**
   * Validates and imports a JSON character.
   * Returns { data, warnings } on success, throws with user-friendly messages on failure.
   */
  function importJson(json: string): { data: CharacterData; warnings: string[] } {
    let raw: Record<string, unknown>
    try {
      raw = JSON.parse(json)
    } catch {
      throw new Error('JSON_PARSE_ERROR')
    }

    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
      throw new Error('JSON_NOT_OBJECT')
    }

    const warnings: string[] = []
    const errors: string[] = []

    // Validate variant
    if (!raw.variant || !(GAME_VARIANTS as readonly string[]).includes(raw.variant as string)) {
      errors.push('MISSING_VARIANT')
    }

    // Validate required string fields
    const requiredStrings: (keyof CharacterData)[] = ['race', 'className']
    for (const field of requiredStrings) {
      if (!raw[field] || typeof raw[field] !== 'string' || (raw[field] as string).trim() === '') {
        errors.push(`MISSING_${field.toUpperCase()}`)
      }
    }

    // Validate level
    if (raw.level === undefined || typeof raw.level !== 'number' || raw.level < 1 || raw.level > 20) {
      errors.push('INVALID_LEVEL')
    }

    // Validate ability scores
    const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const
    if (!raw.abilityScores || typeof raw.abilityScores !== 'object') {
      errors.push('MISSING_ABILITY_SCORES')
    } else {
      const scores = raw.abilityScores as Record<string, unknown>
      for (const ab of abilities) {
        if (typeof scores[ab] !== 'number' || (scores[ab] as number) < 1 || (scores[ab] as number) > 30) {
          errors.push('INVALID_ABILITY_SCORES')
          break
        }
      }
    }

    // Validate arrays that should be arrays
    const arrayFields: (keyof CharacterData)[] = [
      'skillProficiencies', 'languages', 'equipment', 'featuresTraits',
      'cantrips', 'spellsKnown', 'spellsPrepared', 'weapons', 'classes',
    ]
    for (const field of arrayFields) {
      if (raw[field] !== undefined && !Array.isArray(raw[field])) {
        errors.push(`INVALID_${field.toUpperCase()}`)
      }
    }

    if (errors.length > 0) {
      throw new Error('VALIDATION:' + errors.join(','))
    }

    // Build a valid character, filling in defaults for missing optional fields
    // Only copy known CharacterData properties (whitelist approach)
    const empty = createEmptyCharacter()
    const allowedKeys = new Set(Object.keys(empty))
    const safeRaw: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(raw)) {
      if (allowedKeys.has(key)) safeRaw[key] = value
    }

    // Deep-validate array contents: string arrays should contain only strings
    const stringArrayFields = [
      'skillProficiencies', 'skillExpertise', 'savingThrowProficiencies',
      'languages', 'proficienciesOther', 'equipment', 'featuresTraits',
      'cantrips', 'spellsKnown', 'spellsPrepared', 'brawlingMoves',
    ] as const
    for (const field of stringArrayFields) {
      if (Array.isArray(safeRaw[field])) {
        safeRaw[field] = (safeRaw[field] as unknown[]).filter(
          (item): item is string => typeof item === 'string' && item.length < 500
        )
      }
    }

    // Validate weapons array contents
    if (Array.isArray(safeRaw.weapons)) {
      safeRaw.weapons = (safeRaw.weapons as unknown[]).filter((w): w is Weapon =>
        typeof w === 'object' && w !== null &&
        typeof (w as Record<string, unknown>).name === 'string' &&
        typeof (w as Record<string, unknown>).damage === 'string'
      )
    }

    // Validate classes array contents
    if (Array.isArray(safeRaw.classes)) {
      safeRaw.classes = (safeRaw.classes as unknown[]).filter((c): c is ClassEntry =>
        typeof c === 'object' && c !== null &&
        typeof (c as Record<string, unknown>).classId === 'string' &&
        typeof (c as Record<string, unknown>).level === 'number'
      )
    }

    // Validate featureEntries array contents. Un import è testo che arriva da
    // fuori: le voci malformate si scartano invece di finire nella scheda, e
    // quel che resta viene comunque riallineato dalla migrazione qui sotto.
    if (Array.isArray(safeRaw.featureEntries)) {
      safeRaw.featureEntries = (safeRaw.featureEntries as unknown[]).filter((e): e is FeatureEntry =>
        typeof e === 'object' && e !== null &&
        typeof (e as Record<string, unknown>).id === 'string' &&
        typeof (e as Record<string, unknown>).name === 'string' &&
        typeof (e as Record<string, unknown>).level === 'number'
      )
    }

    // Truncate long strings to prevent abuse
    for (const [key, value] of Object.entries(safeRaw)) {
      if (typeof value === 'string' && value.length > 5000) {
        safeRaw[key] = (value as string).slice(0, 5000)
      }
    }

    const data: CharacterData = {
      ...empty,
      ...(safeRaw as Partial<CharacterData>),
      id: (typeof raw.id === 'string' && raw.id.length < 100) ? raw.id : crypto.randomUUID(),
      variant: raw.variant as GameVariant,
    }

    // Characters exported before a variant's level cap was lowered are clamped,
    // not rejected, so an older sheet still imports.
    if (clampToMaxLevel(data)) warnings.push('WARN_LEVEL_CLAMPED')
    // Un export scritto con lo schema 1 non ha né lo slug d'armatura né le voci
    // strutturate: si ricavano da quello che c'è, senza toccare gli originali.
    syncDerivedFields(data)

    // Add warnings for optional missing fields
    if (!data.name) warnings.push('WARN_NO_NAME')
    if (!data.background) warnings.push('WARN_NO_BACKGROUND')
    if (data.maxHp <= 0) warnings.push('WARN_NO_HP')

    character.value = data
    return { data, warnings }
  }

  return {
    character,
    savedCharacters,
    abilityModifiers,
    profBonus,
    armorClass,
    initiative,
    passivePerception,
    hasUnsavedWork,
    totalAbilityScore,
    resetCharacter,
    saveCharacter,
    loadCharacter,
    deleteCharacter,
    isMulticlass,
    addMulticlass,
    removeMulticlass,
    setSubclass,
    syncClassAndLevel,
    levelUp,
    levelUpSaved,
    levelDown,
    exportJson,
    importJson,
  }
}, {
  persist: {
    // `character` è persistito perché un ricaricamento a metà procedura
    // buttava via tutto il lavoro fatto fin lì.
    pick: ['savedCharacters', 'character'],
    // `$patch` fonde il personaggio campo per campo invece di sostituire il
    // ref, quindi un `watch` su `character` non scatterebbe mai: la migrazione
    // di ciò che rientra dallo storage va agganciata qui.
    afterHydrate: ({ store }) => {
      migrateCharacter((store as unknown as { character: CharacterData }).character)
    },
  },
})
