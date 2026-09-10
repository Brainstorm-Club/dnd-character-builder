/**
 * Competenze raddoppiate (Expertise) — regola pura, senza Vue e senza store.
 *
 * `skillExpertise` esiste nel modello del personaggio da sempre: il riepilogo
 * la legge e il PDF la somma al bonus di competenza. Nessun componente però la
 * scriveva, così ladro e bardo costruiti a mano uscivano con i bonus di abilità
 * sbagliati e senza alcun modo di correggerli dall'interfaccia. La regola vive
 * qui, in un punto solo, perché procedura guidata e generatore casuale non
 * finiscano ad avere due versioni diverse della stessa cosa.
 *
 * Il livello di ogni privilegio NON è scritto qui: viene letto dai dati di
 * classe (`cls.features`). Questa tabella dice soltanto quante competenze
 * raddoppia ciascun privilegio e, quando il manuale lo limita, fra quali
 * abilità. Così se un giorno i dati spostano l'Expertise del bardo di livello,
 * la procedura guidata segue i dati e non questa tabella.
 */
import type { GameVariant } from '@/stores/app'
import type { CharacterClass } from '@/data/dnd5e/classes'
import { SKILLS } from '@/data/dnd5e/skills'
import { proficiencyBonus } from '@/utils/calculations'

/** Un privilegio di competenza raddoppiata già maturato dal personaggio. */
export interface ExpertiseGrant {
  /** id del privilegio nei dati di classe (es. `expertise-rogue-6`) */
  featureId: string
  /** nome del privilegio, per mostrarlo accanto alla scelta */
  featureName: string
  /** livello di classe a cui il privilegio scatta */
  level: number
  /** quante competenze raddoppia */
  count: number
  /** se presente, la scelta è limitata a queste abilità */
  restrictedTo?: readonly string[]
}

interface ExpertiseRule {
  count: number
  restrictedTo?: readonly string[]
}

/**
 * Brancalonia e Apocalisse non ridefiniscono le classi base: partono da quelle
 * del 2014 e ne sostituiscono solo le sottoclassi, quindi condividono la stessa
 * tabella. Tenere le due edizioni separate serve perché nei dati del 2024 il
 * privilegio si chiama semplicemente `expertise`: un id così generico, cercato
 * anche fra le classi del 2014, prima o poi pescherebbe il privilegio sbagliato.
 */
type RulesSet = '2014' | '2024'

/**
 * Lo Studioso del mago 2024 non raddoppia una competenza qualsiasi: il
 * privilegio elenca le sei abilità da erudito fra cui scegliere.
 */
const SCHOLAR_SKILLS = [
  'arcana', 'history', 'investigation', 'medicine', 'nature', 'religion',
] as const

/** rules set → id di classe → id del privilegio → quante competenze raddoppia */
const EXPERTISE_RULES: Record<RulesSet, Record<string, Record<string, ExpertiseRule>>> = {
  // D&D 5e 2014: ladro 2 al 1° e 2 al 6°, bardo 2 al 3° e 2 al 10°.
  '2014': {
    bard: {
      'expertise-bard': { count: 2 },
      'expertise-bard-10': { count: 2 },
    },
    rogue: {
      'expertise-rogue': { count: 2 },
      'expertise-rogue-6': { count: 2 },
    },
  },
  // D&D 2024 (SRD 5.2.1): ladro 2 al 1° e 2 al 6°, bardo 2 al 2° e 2 al 9°.
  // Il ranger e il mago ne hanno anche loro, dentro privilegi che si chiamano
  // in altro modo: dimenticarli lasciava due classi su quattro senza selettore.
  '2024': {
    bard: {
      'expertise': { count: 2 },
      'expertise-d': { count: 2 },
    },
    rogue: {
      'expertise': { count: 2 },
      'expertise-2': { count: 2 },
    },
    ranger: {
      // Esploratore Provetto: una sola competenza, non due.
      'deft-explorer': { count: 1 },
      'expertise': { count: 2 },
    },
    wizard: {
      'scholar': { count: 1, restrictedTo: SCHOLAR_SKILLS },
    },
  },
}

function rulesSetOf(variant: GameVariant): RulesSet {
  return variant === 'dnd2024' ? '2024' : '2014'
}

/**
 * I privilegi di competenza raddoppiata che la classe ha già maturato a questo
 * livello, dal più basso al più alto.
 *
 * `level` è il livello NELLA CLASSE indicata, non quello del personaggio: in
 * multiclasse un ladro 1 / guerriero 4 raddoppia due competenze, non quattro.
 */
export function getExpertiseGrants(
  cls: CharacterClass,
  variant: GameVariant,
  level: number,
): ExpertiseGrant[] {
  const byFeature = EXPERTISE_RULES[rulesSetOf(variant)][cls.id]
  if (!byFeature) return []

  const grants: ExpertiseGrant[] = []
  for (const feature of cls.features) {
    const rule = byFeature[feature.id]
    if (!rule || feature.level > level) continue
    grants.push({
      featureId: feature.id,
      featureName: feature.name,
      level: feature.level,
      count: rule.count,
      // Spread condizionale: assegnare `restrictedTo: undefined` renderebbe la
      // proprietà presente-ma-vuota, e chi la controlla con `in` sbaglierebbe.
      ...(rule.restrictedTo ? { restrictedTo: rule.restrictedTo } : {}),
    })
  }
  return grants.sort((a, b) => a.level - b.level)
}

/** Quante competenze raddoppiate spettano in tutto (0 = nessun selettore). */
export function getExpertiseCount(
  cls: CharacterClass,
  variant: GameVariant,
  level: number,
): number {
  return getExpertiseGrants(cls, variant, level)
    .reduce((total, grant) => total + grant.count, 0)
}

/**
 * Fra quali abilità si può scegliere: di norma quelle in cui il personaggio è
 * già competente, perché l'Expertise raddoppia un bonus che deve esistere.
 *
 * L'elenco torna nell'ordine canonico di `SKILLS`, non in quello — casuale, e
 * dipendente dall'ordine in cui i passi hanno scritto — di `skillProficiencies`:
 * i chip nell'interfaccia non devono saltare di posto a ogni scelta. Il filtro
 * su `SKILLS` scarta anche le voci che non sono abilità (competenze in arnesi e
 * simili) finite per errore nello stesso elenco piatto.
 */
export function getExpertiseOptions(
  cls: CharacterClass,
  variant: GameVariant,
  level: number,
  skillProficiencies: readonly string[],
  giaRaddoppiate: readonly string[] = [],
): string[] {
  const grants = getExpertiseGrants(cls, variant, level)
  if (grants.length === 0) return []

  // Se anche un solo privilegio è libero, la restrizione di un altro non può
  // togliere scelte al primo. Nei dati attuali nessuna classe mescola i due
  // casi, quindi l'unione è esatta; se un giorno succedesse, il limite andrebbe
  // applicato per singolo privilegio e non più all'insieme.
  const restricted = grants.every(g => g.restrictedTo)
  const allowed = restricted
    ? new Set(grants.flatMap(g => [...(g.restrictedTo ?? [])]))
    : null

  // Quelle che un privilegio raddoppia già d'ufficio escono dall'elenco:
  // offrirle vorrebbe dire far spendere uno slot per un raddoppio che il
  // personaggio ha comunque.
  const owned = new Set(skillProficiencies)
  const doppie = new Set(giaRaddoppiate)
  return SKILLS
    .map(s => s.id)
    .filter(id => owned.has(id) && !doppie.has(id) && (!allowed || allowed.has(id)))
}

/**
 * Riallinea una scelta già fatta: toglie le competenze non più ammesse (la
 * classe è cambiata, o l'abilità di base è stata deselezionata) e taglia
 * l'eccedenza se il numero concesso è calato. Restituisce un elenco nuovo,
 * senza toccare quello ricevuto.
 */
export function reconcileExpertise(
  current: readonly string[],
  options: readonly string[],
  max: number,
): string[] {
  const allowed = new Set(options)
  const kept: string[] = []
  for (const skill of current) {
    // Il doppione non va solo tolto dall'elenco: conta come uno slot speso, e
    // lasciarlo dentro ruberebbe il posto a una scelta valida.
    if (allowed.has(skill) && !kept.includes(skill) && kept.length < max) kept.push(skill)
  }
  return kept
}

// ─── Competenze concesse d'ufficio ──────────────────────────────────────────

/**
 * Alcuni privilegi non fanno scegliere niente: la competenza la danno e basta.
 * Il Guappo di Brancalonia concede Intimidire, il Brigante Natura e
 * Sopravvivenza, il Guiscardo Indagare e Percezione. La scheda non ne teneva
 * conto: il privilegio compariva nell'elenco, ma accanto all'abilità restava il
 * numero di chi non è competente.
 *
 * La chiave è la **variante** e non il rules set perché Brancalonia e
 * Apocalisse partono dalle stesse classi base: due sottoclassi di ambientazioni
 * diverse possono avere privilegi con lo stesso id, e cercarli in un'unica
 * tabella prima o poi pescherebbe quello sbagliato.
 *
 * Restano fuori i privilegi che fanno scegliere fra più abilità (il Guerriero
 * Formidabile del Furioso, in Apocalisse): quelli hanno la loro tabella e il
 * loro selettore, più in basso.
 */
const COMPETENZE_CONCESSE: Partial<Record<GameVariant, Record<string, readonly string[]>>> = {
  brancalonia: {
    'brigandage': ['nature', 'survival'],                          // Brigante
    'competence-bonus': ['intimidation'],                          // Guappo
    'disheartening-presence': ['intimidation'],                    // Bravo
    'master-of-performance': ['animal-handling', 'performance'],   // Matador
    'treasure-seeker': ['investigation', 'perception'],            // Guiscardo
  },
  apocalisse: {
    'improved-perception': ['perception'],                         // Bastione
  },
}

/**
 * Due di quei privilegi non si fermano alla competenza: la **raddoppiano**
 * anche. Sono le stesse abilità che la riga qui sopra concede — il privilegio
 * le dà e le raddoppia in un colpo solo.
 *
 * Il raddoppio concesso non è una scelta e non deve consumare uno slot di
 * Maestria: chi lo mettesse nello stesso mucchio delle scelte farebbe pagare
 * due volte la stessa cosa, e il selettore offrirebbe di raddoppiare
 * un'abilità già raddoppiata.
 */
const RADDOPPI_CONCESSI: Partial<Record<GameVariant, Record<string, readonly string[]>>> = {
  brancalonia: {
    // Matador: «ottieni competenza in Addestrare Animali e Intrattenere se non
    // l'hai già, e il tuo bonus di competenza raddoppia in ogni prova che usi
    // una delle due».
    'master-of-performance': ['animal-handling', 'performance'],
  },
  apocalisse: {
    // Bastione: «ottieni competenza in Percezione, e il tuo bonus di competenza
    // raddoppia in ogni prova che la usi».
    'improved-perception': ['perception'],
  },
}

/** @param tabella una delle due qui sopra */
function concesse(
  tabella: Partial<Record<GameVariant, Record<string, readonly string[]>>>,
  featureIds: readonly string[],
  variant: GameVariant,
): string[] {
  const perFeature = tabella[variant]
  if (!perFeature) return []
  const out = new Set<string>()
  for (const id of featureIds) {
    for (const skill of perFeature[id] ?? []) out.add(skill)
  }
  return [...out]
}

/**
 * Le abilità che i privilegi già maturati raddoppiano d'ufficio, senza far
 * scegliere e senza spendere slot di Maestria.
 *
 * @param {readonly string[]} featureIds
 * @param {GameVariant} variant
 */
export function raddoppiConcessi(
  featureIds: readonly string[],
  variant: GameVariant,
): string[] {
  return concesse(RADDOPPI_CONCESSI, featureIds, variant)
}

/**
 * Le abilità che i privilegi già maturati concedono d'ufficio.
 *
 * Prende gli **id** dei privilegi e non le classi perché i due chiamanti
 * arrivano da direzioni opposte: lo store ha `featureEntries` (che i privilegi
 * li ha già filtrati per livello e sottoclasse), il generatore casuale ha gli
 * oggetti dei dati. Con gli id in mezzo la regola resta una sola.
 */
export function competenzeConcesse(
  featureIds: readonly string[],
  variant: GameVariant,
): string[] {
  return concesse(COMPETENZE_CONCESSE, featureIds, variant)
}

// ─── Competenze a scelta ────────────────────────────────────────────────────

/**
 * Un privilegio che non concede e non raddoppia: **fa scegliere**.
 *
 * È un'altra cosa dalle due tabelle qui sopra, e non ci si può schiacciare
 * dentro. Lì la competenza è scritta nel privilegio e l'app la applica da sé;
 * qui la decide il giocatore, va ricordata nella scheda e va potuta cambiare —
 * il che la rende parente del selettore di Maestria, non della tabella.
 */
export interface SceltaCompetenza {
  /** id del privilegio nei dati, per distinguere due selettori sulla stessa scheda */
  featureId: string
  /** fra queste, e non fra tutte e diciotto */
  candidate: readonly string[]
  /** quante se ne prendono */
  quante: number
}

const COMPETENZE_A_SCELTA: Partial<Record<GameVariant, Record<string, Omit<SceltaCompetenza, 'featureId'>>>> = {
  apocalisse: {
    // Guerriero Formidabile (Furioso, il guerriero di Apocalisse): «competenza
    // in un'abilità a tua scelta fra Atletica, Intimidire, Sopravvivenza o
    // Storia». «Acciaio Turbinante» è un altro privilegio dello stesso
    // archetipo, non l'archetipo.
    'formidable-warrior': {
      candidate: ['athletics', 'intimidation', 'survival', 'history'],
      quante: 1,
    },
  },
}

/**
 * Le scelte di competenza aperte dai privilegi già maturati, nell'ordine in cui
 * i privilegi arrivano — così i selettori non si scambiano di posto.
 */
export function competenzeDaScegliere(
  featureIds: readonly string[],
  variant: GameVariant,
): SceltaCompetenza[] {
  const tabella = COMPETENZE_A_SCELTA[variant]
  if (!tabella) return []
  const out: SceltaCompetenza[] = []
  const visti = new Set<string>()
  for (const id of featureIds) {
    const regola = tabella[id]
    if (!regola || visti.has(id)) continue
    visti.add(id)
    out.push({ featureId: id, ...regola })
  }
  return out
}

/**
 * Riallinea una scelta già fatta: butta ciò che non è più fra le candidate — il
 * privilegio è cambiato, o non c'è più — e taglia l'eccedenza. Stessa forma di
 * `reconcileExpertise`, e per lo stesso motivo: una scelta che sopravvive al
 * privilegio che la concedeva è una competenza che il personaggio non ha.
 */
export function riallineaScelte(
  scelte: Readonly<Record<string, readonly string[]>>,
  disponibili: readonly SceltaCompetenza[],
): Record<string, string[]> {
  /** @type {Record<string, string[]>} */
  const out: Record<string, string[]> = {}
  for (const s of disponibili) {
    const ammesse = new Set(s.candidate)
    const tenute: string[] = []
    for (const skill of scelte[s.featureId] ?? []) {
      if (ammesse.has(skill) && !tenute.includes(skill) && tenute.length < s.quante) tenute.push(skill)
    }
    if (tenute.length) out[s.featureId] = tenute
  }
  return out
}

// ─── Mezza competenza (Factotum) ────────────────────────────────────────────

/**
 * Il Factotum del bardo aggiunge metà del bonus di competenza, arrotondata per
 * difetto, a **ogni** prova di caratteristica che non includa già la
 * competenza. Non è una competenza in più: non si può scegliere, non si può
 * raddoppiare, e vale anche per l'iniziativa.
 *
 * Si riconosce dai privilegi che il personaggio ha davvero, non da una tabella
 * di livelli scritta qui: `featureEntries` porta gli id dei dati, e una scheda
 * salvata prima che quel campo esistesse porta ancora i nomi inglesi in
 * `featuresTraits`. Si guardano entrambi perché una scheda importata da fuori
 * può avere solo il secondo.
 */
const MEZZA_COMPETENZA = new Set(['jack-of-all-trades', 'Jack of All Trades'])

/** Quanto aggiungere alle prove senza competenza: 0 se il privilegio non c'è. */
export function mezzaCompetenza(char: {
  level: number
  featureEntries?: { id: string }[]
  featuresTraits?: string[]
}): number {
  const daEntries = (char.featureEntries ?? []).some(e => MEZZA_COMPETENZA.has(e.id))
  const daNomi = (char.featuresTraits ?? []).some(n => MEZZA_COMPETENZA.has(n))
  if (!daEntries && !daNomi) return 0
  return Math.floor(proficiencyBonus(char.level) / 2)
}
