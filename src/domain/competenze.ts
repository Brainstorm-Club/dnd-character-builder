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

  const owned = new Set(skillProficiencies)
  return SKILLS
    .map(s => s.id)
    .filter(id => owned.has(id) && (!allowed || allowed.has(id)))
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
