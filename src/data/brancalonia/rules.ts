// ─────────────────────────────────────────────────────────────────────────────
// Brancalonia-specific rules and constants
// ─────────────────────────────────────────────────────────────────────────────

/** Maximum character level in Brancalonia. After level 6, characters gain feats instead of leveling up. */
export const MAX_LEVEL = 6

// ─── Currency ───────────────────────────────────────────────────────────────

/** Brancalonia uses a silver standard: the base currency is silver, not gold. */
export const CURRENCY_STANDARD = 'silver' as const

export interface CurrencyConversion {
  name: string
  abbreviation: string
  /** Value in silver pieces */
  valueInSilver: number
}

export const currencies: readonly CurrencyConversion[] = [
  { name: 'Copper Piece', abbreviation: 'cp', valueInSilver: 0.1 },
  { name: 'Silver Piece', abbreviation: 'sp', valueInSilver: 1 },
  // Brancalonia replaces electrum with iron: 5 silver to one iron hunk,
  // also called a petechin. Nobody in the Kingdom knows what platinum is.
  { name: 'Iron Piece', abbreviation: 'ip', valueInSilver: 5 },
  { name: 'Gold Piece', abbreviation: 'gp', valueInSilver: 10 },
] as const

// ─── Shoddy Equipment ──────────────────────────────────────────────────────

export type EquipmentCondition = 'fine' | 'shoddy' | 'broken'

export interface ShoddyEquipmentRule {
  condition: EquipmentCondition
  description: string
  mechanicalEffect: string
}

export const shoddyEquipmentRules: readonly ShoddyEquipmentRule[] = [
  {
    condition: 'fine',
    description: 'Equipment of ordinary make, as described in its stat block.',
    mechanicalEffect: 'No penalties.',
  },
  {
    condition: 'shoddy',
    description:
      'Worn, patched, rusted or badly made. Most gear a Knave can afford is shoddy, and it usually costs about a tenth of the listed price.',
    mechanicalEffect:
      'On a natural 1 with a shoddy weapon it comes apart, and every subsequent attack is made with disadvantage until you spend an action to put it back together. When an enemy scores a natural 20 against you, a piece of your shoddy armor flies off and its base Armor Class drops by 2 until you retrieve it. Shoddy tools break when a check with them fails by 5 or more.',
  },
] as const

// ─── Brawling System ────────────────────────────────────────────────────────

export interface WhacksLevel {
  level: number
  name: string
  description: string
  mechanicalEffect: string
}

/**
 * The Whacks system tracks non-lethal brawling damage.
 * Characters accumulate Whacks levels as they take brawling damage.
 */
export const whacksLevels: readonly WhacksLevel[] = [
  {
    level: 1,
    name: 'Bruised',
    description: 'The first blows have landed and you are starting to show it.',
    mechanicalEffect: '-1 AC (cumulative with the levels below it).',
  },
  {
    level: 2,
    name: 'Beaten',
    description: 'The scuffle is turning against you.',
    mechanicalEffect: '-1 AC (cumulative with the levels below it).',
  },
  {
    level: 3,
    name: 'Injured',
    description: 'You are visibly the worse for wear.',
    mechanicalEffect: '-1 AC (cumulative with the levels below it).',
  },
  {
    level: 4,
    name: 'Damaged',
    description: 'You are barely staying on your feet.',
    mechanicalEffect: '-1 AC (cumulative with the levels below it).',
  },
  {
    level: 5,
    name: 'Crushed',
    description: 'One more whack and the brawl is over for you.',
    mechanicalEffect: '-1 AC (cumulative with the levels below it).',
  },
  {
    level: 6,
    name: 'Unconscious',
    description: 'You have taken one whack too many and go down flat out.',
    mechanicalEffect: 'You are flat out. Conditions taken during a brawl last until the end of the affected creature\'s next turn.',
  },
] as const

// ─── Modified Rests ─────────────────────────────────────────────────────────

export interface RestRule {
  type: 'short' | 'long'
  name: string
  duration: string
  description: string
}

export const restRules: readonly RestRule[] = [
  {
    type: 'short',
    name: 'Short Rest',
    duration: '1 night (8 hours)',
    description: 'In Brancalonia, a short rest requires a full night of sleep in a reasonably safe location. Characters can spend Hit Dice to recover hit points and regain short-rest features as normal.',
  },
  {
    type: 'long',
    name: 'Long Rest (Rollicking)',
    duration: '1 week of rollicking',
    description: 'A long rest in Brancalonia requires a full week of rollicking -- carousing, feasting, gambling, and general debauchery in a settlement. During this time, characters spend coin on food, drink, and entertainment. At the end of the week, they regain all hit points, spent Hit Dice, and long-rest features. The cost of rollicking is 10 sp per character level.',
  },
] as const

// ─── Languages ──────────────────────────────────────────────────────────────

export interface BrancaloniaLanguage {
  id: string
  name: string
  description: string
  speakers: string
}

export const languages: readonly BrancaloniaLanguage[] = [
  {
    id: 'vernacular',
    name: 'Vernacular',
    description:
      'The common language in use from the Crown Mountains to the Charybdean Sea. Despite countless regional dialects, jargons and local variants, every inhabitant of the Kingdom speaks and understands it, and most can read and write it well enough to sign documents, read signs and bounties and draw up short notes.',
    speakers: 'Everyone in the Kingdom',
  },
  {
    id: 'draconian',
    name: 'Draconian',
    description:
      'The language of the empire that fell more than a thousand years ago, and the ancestor of Vernacular along with the other Occasian tongues. Reading and writing it is required to study arcane texts, documents of the past and imperial inscriptions, and it is taught exclusively in prestigious schools, colleges and corporations — for guiscards it is an implicit requirement from 1st level.',
    speakers: 'Guiscards, scholars, colleges and corporations',
  },
  {
    id: 'macaronic',
    name: 'Macaronic',
    description:
      'The language of the Kingdom\'s religion and bureaucracy: a cultivated, codified derivation of Draconian, halfway between Draconian and Vernacular. Anyone educated in the Creed or of high social rank speaks, reads and writes it; someone who knows only Vernacular must pass a DC 15 Intelligence (History) check to use it.',
    speakers: 'Clergy, bureaucrats, the high-born',
  },
  {
    id: 'bedamn',
    name: 'Bedamn',
    description:
      'Also called Black Lingo and Blackspeech, the language used in Inferno by devils, hags, fiends and the damned, and taught to heresiarchs, sorcerers and followers of dark powers. Unless they have consciously willed themselves to forget it, malebranche speak, read and write it instinctively.',
    speakers: 'Malebranche, devils, heresiarchs, exorcists',
  },
  {
    id: 'lingua-ignota',
    name: 'Lingua Ignota',
    description:
      'Also called the Language of the Birds, this is the tongue of celestials, angels and the inhabitants of Urania, used for the most complex prophecies and the most sacred texts. Only a few hermits and mystics who roam the Kingdom seem to understand it — though some say it is an inner language accessible to anyone pure enough, or drunk enough.',
    speakers: 'Celestials, angels, hermits and mystics',
  },
  {
    id: 'petroglyphic',
    name: 'Petroglyphic',
    description:
      'The oldest inscriptions on monoliths, prehistoric caves and primeval artifacts are petroglyphs: pictographic signs engraved or drawn on stone that represent concepts rather than words or letters. Petroglyphic is the last remnant of an ancestral language common to the ancestors of sylvans and morgants, the ancient Pelagians and other prehistoric peoples.',
    speakers: 'Sylvans, morgants, and students of the ancestral past',
  },
  {
    id: 'racket',
    name: 'Racket',
    description:
      'The roguish jargon spoken by ziganes, lacklands and norcitans, as well as by many companies of puppeteers, street actors, carnies, harlequins and thespians, and by rovers, nomads and wanderers in general. It uses the Vernacular alphabet.',
    speakers: 'Ziganes, lacklands, rovers, street performers, thieves',
  },
] as const

// ─── Post-Level-6 Advancement ───────────────────────────────────────────────

export interface PostLevelAdvancement {
  description: string
  options: string[]
}

export const postLevelAdvancement: PostLevelAdvancement = {
  description:
    'After 6th level Knaves stop gaining class levels. Instead they earn an Emeriticence for every 9,000 XP beyond the first 14,000 — the Kingdom has no room for archmages, only for veterans who got very good at surviving it.',
  options: [
    'Absolute Emeriticence: your proficiency bonus rises to +4',
    'Band Together: you strengthen the bonds that hold your Band',
    'Beefy: your hit point maximum increases',
    'Blessed Luck: fortune leans your way once more often',
    'Empower Extravaganza: your fey and superstitious powers grow',
    'Favored Weapon: one weapon becomes truly yours',
    'Gift of Feat: you gain a feat of your choice',
    'Improved Extravaganza: a second step along the Extravaganza',
    'Improved Recovery: you get more out of every rest',
    'Indomitable: you shrug off what would fell other people',
    'Professional Brawler: your brawling repertoire widens',
    'Sharpening: one ability score improves',
  ],
}

// ─── Consolidated Rules Reference ───────────────────────────────────────────

export interface BrancaloniaRules {
  maxLevel: number
  currencyStandard: typeof CURRENCY_STANDARD
  currencies: readonly CurrencyConversion[]
  shoddyEquipment: readonly ShoddyEquipmentRule[]
  whacksLevels: readonly WhacksLevel[]
  restRules: readonly RestRule[]
  languages: readonly BrancaloniaLanguage[]
  postLevelAdvancement: PostLevelAdvancement
}

export const brancaloniaRules: BrancaloniaRules = {
  maxLevel: MAX_LEVEL,
  currencyStandard: CURRENCY_STANDARD,
  currencies,
  shoddyEquipment: shoddyEquipmentRules,
  whacksLevels,
  restRules,
  languages,
  postLevelAdvancement,
}
