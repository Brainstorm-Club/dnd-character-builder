import type { AbilityScores } from '@/stores/character'

export type AbilityKey = keyof AbilityScores
export type CasterType = 'full' | 'half' | 'third' | 'pact'

export interface ClassFeature {
  id: string
  name: string
  level: number
  description: string
}

export interface Subclass {
  id: string
  name: string
  description: string
  features: ClassFeature[]
}

export interface SpellcastingInfo {
  ability: AbilityKey
  /** Number of cantrips known at each character level (index 0 = level 1). Length 20. */
  cantripsKnown: number[]
  /** Number of spells known per level (for known-casters like Bard/Sorcerer/Ranger/Warlock); null for prepared-casters */
  spellsKnown: number[] | null
  /** Whether this class prepares spells from the full class list (Cleric/Druid/Paladin/Wizard) */
  preparedCaster: boolean
  casterType: CasterType
}

export interface CharacterClass {
  id: string
  name: string
  description: string
  hitDie: number
  primaryAbility: AbilityKey[]
  savingThrows: [AbilityKey, AbilityKey]
  armorProficiencies: string[]
  weaponProficiencies: string[]
  toolProficiencies: string[]
  skillChoices: string[]
  numSkillChoices: number
  startingEquipment: string[]
  subclassLevel: number
  subclassName: string
  features: ClassFeature[]
  subclasses: Subclass[]
  spellcasting: SpellcastingInfo | null
}

// ─────────────────────────────────────────────────────────────────────────────
// Cantrips-known progression tables (index 0 = level 1, through index 19 = level 20)
// ─────────────────────────────────────────────────────────────────────────────

const bardCantrips =     [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]
const clericCantrips =   [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]
const druidCantrips =    [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]
const sorcererCantrips = [4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6]
const warlockCantrips =  [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]
const wizardCantrips =   [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]

// Fighter (Eldritch Knight) and Rogue (Arcane Trickster) cantrips (gained at level 3)
const thirdCasterCantrips = [0, 0, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]

// ─────────────────────────────────────────────────────────────────────────────
// Spells-known progression tables
// ─────────────────────────────────────────────────────────────────────────────

const bardSpellsKnown =     [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22]
const sorcererSpellsKnown = [2, 3, 4, 5, 6, 7, 8,  9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15]
const rangerSpellsKnown =   [0, 2, 3, 3, 4, 4, 5,  5,  6,  6,  7,  7,  8,  8,  9,  9, 10, 10, 11, 11]
const warlockSpellsKnown =  [2, 3, 4, 5, 6, 7, 8,  9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15]
const eldritchKnightSpellsKnown = [0, 0, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13]
const arcaneTricksterSpellsKnown = [0, 0, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13]

// No cantrips for Paladin/Ranger (half-casters without cantrips)
const noCantrips = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

// ─────────────────────────────────────────────────────────────────────────────
// Class Definitions
// ─────────────────────────────────────────────────────────────────────────────

export const classes: readonly CharacterClass[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Barbarian
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'barbarian',
    name: 'Barbarian',
    description: 'A fierce warrior who can enter a battle rage.',
    hitDie: 12,
    primaryAbility: ['str'],
    savingThrows: ['str', 'con'],
    armorProficiencies: ['light', 'medium', 'shields'],
    weaponProficiencies: ['simple', 'martial'],
    toolProficiencies: [],
    skillChoices: ['animal-handling', 'athletics', 'intimidation', 'nature', 'perception', 'survival'],
    numSkillChoices: 2,
    startingEquipment: [
      'greataxe',
      'two handaxes',
      'explorer-pack',
      'four javelins',
    ],
    subclassLevel: 3,
    subclassName: 'Primal Path',
    spellcasting: null,
    features: [
      { id: 'rage', name: 'Rage', level: 1, description: 'In battle, you fight with primal ferocity. You can enter a rage as a bonus action, gaining advantage on STR checks and saving throws, bonus rage damage, and resistance to bludgeoning, piercing, and slashing damage.' },
      { id: 'unarmored-defense-barb', name: 'Unarmored Defense', level: 1, description: 'While not wearing armor, your AC equals 10 + DEX modifier + CON modifier. You can use a shield and still gain this benefit.' },
      { id: 'reckless-attack', name: 'Reckless Attack', level: 2, description: 'You can throw aside all concern for defense to attack with fierce desperation. You gain advantage on melee weapon attack rolls using STR during this turn, but attack rolls against you have advantage until your next turn.' },
      { id: 'danger-sense', name: 'Danger Sense', level: 2, description: 'You have advantage on DEX saving throws against effects that you can see, such as traps and spells. You cannot be blinded, deafened, or incapacitated to gain this benefit.' },
      { id: 'primal-path', name: 'Primal Path', level: 3, description: 'You choose a path that shapes the nature of your rage.' },
      { id: 'asi-4', name: 'Ability Score Improvement', level: 4, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'extra-attack-barb', name: 'Extra Attack', level: 5, description: 'You can attack twice, instead of once, whenever you take the Attack action on your turn.' },
      { id: 'fast-movement', name: 'Fast Movement', level: 5, description: 'Your speed increases by 10 feet while you are not wearing heavy armor.' },
      { id: 'path-feature-6', name: 'Primal Path feature', level: 6, description: 'You gain a feature granted by your Primal Path at 6th level.' },
      { id: 'feral-instinct', name: 'Feral Instinct', level: 7, description: 'You have advantage on initiative rolls. If you are surprised at the start of combat and are not incapacitated, you can act normally on your first turn, provided you enter your rage before doing anything else.' },
      { id: 'asi-8', name: 'Ability Score Improvement', level: 8, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'brutal-critical-1', name: 'Brutal Critical (1 die)', level: 9, description: 'You can roll one additional weapon damage die when determining the extra damage for a critical hit with a melee attack.' },
      { id: 'path-feature-10', name: 'Primal Path feature', level: 10, description: 'You gain a feature granted by your Primal Path at 10th level.' },
      { id: 'relentless-rage', name: 'Relentless Rage', level: 11, description: 'If you drop to 0 hit points while raging and do not die outright, you can make a DC 10 Constitution saving throw to drop to 1 hit point instead. The DC increases by 5 each time you use this before finishing a rest.' },
      { id: 'asi-12', name: 'Ability Score Improvement', level: 12, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'brutal-critical-2', name: 'Brutal Critical (2 dice)', level: 13, description: 'You roll two additional weapon damage dice for a critical hit with a melee attack.' },
      { id: 'path-feature-14', name: 'Primal Path feature', level: 14, description: 'You gain a feature granted by your Primal Path at 14th level.' },
      { id: 'persistent-rage', name: 'Persistent Rage', level: 15, description: 'Your rage ends early only if you fall unconscious or if you choose to end it.' },
      { id: 'asi-16', name: 'Ability Score Improvement', level: 16, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'brutal-critical-3', name: 'Brutal Critical (3 dice)', level: 17, description: 'You roll three additional weapon damage dice for a critical hit with a melee attack.' },
      { id: 'indomitable-might', name: 'Indomitable Might', level: 18, description: 'If your total for a Strength check is less than your Strength score, you can use that score in place of the total.' },
      { id: 'asi-19', name: 'Ability Score Improvement', level: 19, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'primal-champion', name: 'Primal Champion', level: 20, description: 'You embody the power of the wilds. Your Strength and Constitution scores increase by 4, and their maximum becomes 24.' },
    ],
    subclasses: [
      {
        id: 'berserker',
        name: 'Path of the Berserker',
        description: 'A path that channels rage into a violent battle frenzy.',
        features: [
          { id: 'frenzy', name: 'Frenzy', level: 3, description: 'You can go into a frenzy when you rage. If you do so, for the duration of your rage you can make a single melee weapon attack as a bonus action on each of your turns after this one. When your rage ends, you suffer one level of exhaustion.' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Bard
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'bard',
    name: 'Bard',
    description: 'An inspiring magician whose power echoes the music of creation.',
    hitDie: 8,
    primaryAbility: ['cha'],
    savingThrows: ['dex', 'cha'],
    armorProficiencies: ['light'],
    weaponProficiencies: ['simple', 'hand crossbow', 'longsword', 'rapier', 'shortsword'],
    toolProficiencies: ['three musical instruments of your choice'],
    skillChoices: [
      'acrobatics', 'animal-handling', 'arcana', 'athletics', 'deception',
      'history', 'insight', 'intimidation', 'investigation', 'medicine',
      'nature', 'perception', 'performance', 'persuasion', 'religion',
      'sleight-of-hand', 'stealth', 'survival',
    ],
    numSkillChoices: 3,
    startingEquipment: [
      'rapier',
      'diplomat-pack',
      'lute',
      'leather armor',
      'dagger',
    ],
    subclassLevel: 3,
    subclassName: 'Bard College',
    spellcasting: {
      ability: 'cha',
      cantripsKnown: bardCantrips,
      spellsKnown: bardSpellsKnown,
      preparedCaster: false,
      casterType: 'full',
    },
    features: [
      { id: 'spellcasting-bard', name: 'Spellcasting', level: 1, description: 'You have learned to untangle and reshape the fabric of reality in harmony with your wishes and music. Charisma is your spellcasting ability.' },
      { id: 'bardic-inspiration', name: 'Bardic Inspiration', level: 1, description: 'You can inspire others through stirring words or music. A creature within 60 feet that can hear you gains one Bardic Inspiration die (d6). The creature can roll the die and add the number rolled to one ability check, attack roll, or saving throw it makes.' },
      { id: 'jack-of-all-trades', name: 'Jack of All Trades', level: 2, description: 'You can add half your proficiency bonus, rounded down, to any ability check you make that doesn\'t already include your proficiency bonus.' },
      { id: 'song-of-rest', name: 'Song of Rest', level: 2, description: 'You can use soothing music or oration to help revitalize your wounded allies during a short rest. If you or any friendly creatures who can hear your performance regain hit points at the end of the short rest by spending Hit Dice, each of those creatures regains an extra 1d6 hit points.' },
      { id: 'bard-college', name: 'Bard College', level: 3, description: 'You delve into the advanced techniques of a bard college of your choice.' },
      { id: 'expertise-bard', name: 'Expertise', level: 3, description: 'Choose two of your skill proficiencies. Your proficiency bonus is doubled for any ability check you make that uses either of the chosen proficiencies.' },
      { id: 'asi-4', name: 'Ability Score Improvement', level: 4, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'bardic-inspiration-d8', name: 'Bardic Inspiration (d8)', level: 5, description: 'Your Bardic Inspiration die becomes a d8.' },
      { id: 'font-of-inspiration', name: 'Font of Inspiration', level: 5, description: 'You regain all expended uses of Bardic Inspiration when you finish a short or long rest.' },
      { id: 'countercharm', name: 'Countercharm', level: 6, description: 'As an action, you can start a performance that lasts until the end of your next turn. Friendly creatures within 30 feet that can hear you have advantage on saving throws against being frightened or charmed.' },
      { id: 'college-feature-6', name: 'Bard College feature', level: 6, description: 'You gain a feature granted by your Bard College at 6th level.' },
      { id: 'asi-8', name: 'Ability Score Improvement', level: 8, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'song-of-rest-d8', name: 'Song of Rest (d8)', level: 9, description: 'The extra hit points your Song of Rest restores become 1d8.' },
      { id: 'bardic-inspiration-d10', name: 'Bardic Inspiration (d10)', level: 10, description: 'Your Bardic Inspiration die becomes a d10.' },
      { id: 'expertise-bard-10', name: 'Expertise', level: 10, description: 'Choose two more of your skill proficiencies; your proficiency bonus is doubled for any ability check you make with either of them.' },
      { id: 'magical-secrets-10', name: 'Magical Secrets', level: 10, description: 'Choose two spells from any class, of a level you can cast. They count as bard spells for you and do not count against the number of bard spells you know.' },
      { id: 'asi-12', name: 'Ability Score Improvement', level: 12, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'song-of-rest-d10', name: 'Song of Rest (d10)', level: 13, description: 'The extra hit points your Song of Rest restores become 1d10.' },
      { id: 'magical-secrets-14', name: 'Magical Secrets', level: 14, description: 'Choose two more spells from any class, as with Magical Secrets at 10th level.' },
      { id: 'college-feature-14', name: 'Bard College feature', level: 14, description: 'You gain a feature granted by your Bard College at 14th level.' },
      { id: 'bardic-inspiration-d12', name: 'Bardic Inspiration (d12)', level: 15, description: 'Your Bardic Inspiration die becomes a d12.' },
      { id: 'asi-16', name: 'Ability Score Improvement', level: 16, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'song-of-rest-d12', name: 'Song of Rest (d12)', level: 17, description: 'The extra hit points your Song of Rest restores become 1d12.' },
      { id: 'magical-secrets-18', name: 'Magical Secrets', level: 18, description: 'Choose two more spells from any class, as with Magical Secrets at 10th level.' },
      { id: 'asi-19', name: 'Ability Score Improvement', level: 19, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'superior-inspiration', name: 'Superior Inspiration', level: 20, description: 'When you roll initiative and have no uses of Bardic Inspiration left, you regain one use.' },
    ],
    subclasses: [
      {
        id: 'lore',
        name: 'College of Lore',
        description: 'Bards who pursue knowledge and collect bits of information from diverse sources.',
        features: [
          { id: 'bonus-proficiencies-lore', name: 'Bonus Proficiencies', level: 3, description: 'You gain proficiency with three skills of your choice.' },
          { id: 'cutting-words', name: 'Cutting Words', level: 3, description: 'You learn how to use your wit to distract, confuse, and otherwise sap the confidence and competence of others. When a creature you can see within 60 feet makes an attack roll, ability check, or damage roll, you can use your reaction to expend one Bardic Inspiration die, rolling it and subtracting the result from the creature\'s roll.' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Cleric
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'cleric',
    name: 'Cleric',
    description: 'A priestly champion who wields divine magic in service of a higher power.',
    hitDie: 8,
    primaryAbility: ['wis'],
    savingThrows: ['wis', 'cha'],
    armorProficiencies: ['light', 'medium', 'shields'],
    weaponProficiencies: ['simple'],
    toolProficiencies: [],
    skillChoices: ['history', 'insight', 'medicine', 'persuasion', 'religion'],
    numSkillChoices: 2,
    startingEquipment: [
      'mace',
      'scale mail',
      'light crossbow and 20 bolts',
      'priest-pack',
      'shield',
      'holy symbol',
    ],
    subclassLevel: 1,
    subclassName: 'Divine Domain',
    spellcasting: {
      ability: 'wis',
      cantripsKnown: clericCantrips,
      spellsKnown: null,
      preparedCaster: true,
      casterType: 'full',
    },
    features: [
      { id: 'spellcasting-cleric', name: 'Spellcasting', level: 1, description: 'As a conduit for divine power, you can cast cleric spells. Wisdom is your spellcasting ability.' },
      { id: 'divine-domain', name: 'Divine Domain', level: 1, description: 'Choose one domain related to your deity. Your choice grants you domain spells and other features at 1st level and again at 2nd, 6th, 8th, and 17th level.' },
      { id: 'channel-divinity', name: 'Channel Divinity', level: 2, description: 'You gain the ability to channel divine energy directly from your deity, using that energy to fuel magical effects. You start with Turn Undead and an effect determined by your domain.' },
      { id: 'turn-undead', name: 'Channel Divinity: Turn Undead', level: 2, description: 'As an action, you present your holy symbol and speak a prayer censuring the undead. Each undead that can see or hear you within 30 feet must make a Wisdom saving throw. If the creature fails, it is turned for 1 minute or until it takes any damage.' },
      { id: 'asi-4', name: 'Ability Score Improvement', level: 4, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'destroy-undead-half', name: 'Destroy Undead (CR 1/2)', level: 5, description: 'When an undead of challenge rating 1/2 or lower fails its saving throw against your Turn Undead, it is instantly destroyed.' },
      { id: 'channel-divinity-2', name: 'Channel Divinity (2/rest)', level: 6, description: 'You can use Channel Divinity twice between rests.' },
      { id: 'domain-feature-6', name: 'Divine Domain feature', level: 6, description: 'You gain a feature granted by your Divine Domain at 6th level.' },
      { id: 'asi-8', name: 'Ability Score Improvement', level: 8, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'destroy-undead-1', name: 'Destroy Undead (CR 1)', level: 8, description: 'Your Destroy Undead now affects undead of challenge rating 1 or lower.' },
      { id: 'domain-feature-8', name: 'Divine Domain feature', level: 8, description: 'You gain a feature granted by your Divine Domain at 8th level.' },
      { id: 'divine-intervention', name: 'Divine Intervention', level: 10, description: 'You can call on your deity to intervene. Roll percentile dice: if you roll a number equal to or lower than your cleric level, your deity intervenes. On a success you cannot use the feature again for 7 days, otherwise you can try again after a long rest.' },
      { id: 'destroy-undead-2', name: 'Destroy Undead (CR 2)', level: 11, description: 'Your Destroy Undead now affects undead of challenge rating 2 or lower.' },
      { id: 'asi-12', name: 'Ability Score Improvement', level: 12, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'destroy-undead-3', name: 'Destroy Undead (CR 3)', level: 14, description: 'Your Destroy Undead now affects undead of challenge rating 3 or lower.' },
      { id: 'asi-16', name: 'Ability Score Improvement', level: 16, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'destroy-undead-4', name: 'Destroy Undead (CR 4)', level: 17, description: 'Your Destroy Undead now affects undead of challenge rating 4 or lower.' },
      { id: 'domain-feature-17', name: 'Divine Domain feature', level: 17, description: 'You gain a feature granted by your Divine Domain at 17th level.' },
      { id: 'channel-divinity-3', name: 'Channel Divinity (3/rest)', level: 18, description: 'You can use Channel Divinity three times between rests.' },
      { id: 'asi-19', name: 'Ability Score Improvement', level: 19, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'divine-intervention-improvement', name: 'Divine Intervention improvement', level: 20, description: 'Your call for Divine Intervention succeeds automatically, with no roll required.' },
    ],
    subclasses: [
      {
        id: 'life',
        name: 'Life Domain',
        description: 'The Life domain focuses on the vibrant positive energy that sustains all life.',
        features: [
          { id: 'bonus-proficiency-life', name: 'Bonus Proficiency', level: 1, description: 'When you choose this domain at 1st level, you gain proficiency with heavy armor.' },
          { id: 'disciple-of-life', name: 'Disciple of Life', level: 1, description: 'Your healing spells are more effective. Whenever you use a spell of 1st level or higher to restore hit points to a creature, the creature regains additional hit points equal to 2 + the spell\'s level.' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Druid
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'druid',
    name: 'Druid',
    description: 'A priest of the Old Faith, wielding the powers of nature and adopting animal forms.',
    hitDie: 8,
    primaryAbility: ['wis'],
    savingThrows: ['int', 'wis'],
    armorProficiencies: ['light', 'medium', 'shields'],
    weaponProficiencies: ['club', 'dagger', 'dart', 'javelin', 'mace', 'quarterstaff', 'scimitar', 'sickle', 'sling', 'spear'],
    toolProficiencies: ['herbalism kit'],
    skillChoices: ['arcana', 'animal-handling', 'insight', 'medicine', 'nature', 'perception', 'religion', 'survival'],
    numSkillChoices: 2,
    startingEquipment: [
      'wooden shield',
      'scimitar',
      'leather armor',
      'explorer-pack',
      'druidic focus',
    ],
    subclassLevel: 2,
    subclassName: 'Druid Circle',
    spellcasting: {
      ability: 'wis',
      cantripsKnown: druidCantrips,
      spellsKnown: null,
      preparedCaster: true,
      casterType: 'full',
    },
    features: [
      { id: 'druidic', name: 'Druidic', level: 1, description: 'You know Druidic, the secret language of druids. You can speak the language and use it to leave hidden messages.' },
      { id: 'spellcasting-druid', name: 'Spellcasting', level: 1, description: 'Drawing on the divine essence of nature itself, you can cast spells to shape that essence to your will. Wisdom is your spellcasting ability.' },
      { id: 'wild-shape', name: 'Wild Shape', level: 2, description: 'You can use your action to magically assume the shape of a beast that you have seen before. You can use this feature twice, regaining expended uses after a short or long rest.' },
      { id: 'druid-circle', name: 'Druid Circle', level: 2, description: 'You choose to identify with a circle of druids.' },
      { id: 'wild-shape-4', name: 'Wild Shape improvement', level: 4, description: 'You can transform into a beast of challenge rating 1/2 or lower that has no flying speed.' },
      { id: 'asi-4', name: 'Ability Score Improvement', level: 4, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'circle-feature-6', name: 'Druid Circle feature', level: 6, description: 'You gain a feature granted by your Druid Circle at 6th level.' },
      { id: 'wild-shape-8', name: 'Wild Shape improvement', level: 8, description: 'You can transform into a beast of challenge rating 1 or lower.' },
      { id: 'asi-8', name: 'Ability Score Improvement', level: 8, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'circle-feature-10', name: 'Druid Circle feature', level: 10, description: 'You gain a feature granted by your Druid Circle at 10th level.' },
      { id: 'asi-12', name: 'Ability Score Improvement', level: 12, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'circle-feature-14', name: 'Druid Circle feature', level: 14, description: 'You gain a feature granted by your Druid Circle at 14th level.' },
      { id: 'asi-16', name: 'Ability Score Improvement', level: 16, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'timeless-body-druid', name: 'Timeless Body', level: 18, description: 'You age more slowly: for every 10 years that pass, your body ages only 1 year.' },
      { id: 'beast-spells', name: 'Beast Spells', level: 18, description: 'You can cast many of your druid spells in any shape you assume with Wild Shape, though you cannot provide material components.' },
      { id: 'asi-19', name: 'Ability Score Improvement', level: 19, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'archdruid', name: 'Archdruid', level: 20, description: 'You can use Wild Shape an unlimited number of times, and you can ignore the verbal and somatic components of your druid spells, as well as any material components that lack a cost and are not consumed.' },
    ],
    subclasses: [
      {
        id: 'land',
        name: 'Circle of the Land',
        description: 'Druids who are members of the Circle of the Land are mystics and sages who safeguard ancient knowledge and rites.',
        features: [
          { id: 'bonus-cantrip-land', name: 'Bonus Cantrip', level: 2, description: 'You learn one additional druid cantrip of your choice.' },
          { id: 'natural-recovery', name: 'Natural Recovery', level: 2, description: 'During a short rest, you choose expended spell slots to recover. The spell slots can have a combined level that is equal to or less than half your druid level (rounded up), and none of the slots can be 6th level or higher.' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Fighter
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'fighter',
    name: 'Fighter',
    description: 'A master of martial combat, skilled with a variety of weapons and armor.',
    hitDie: 10,
    primaryAbility: ['str', 'dex'],
    savingThrows: ['str', 'con'],
    armorProficiencies: ['light', 'medium', 'heavy', 'shields'],
    weaponProficiencies: ['simple', 'martial'],
    toolProficiencies: [],
    skillChoices: ['acrobatics', 'animal-handling', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival'],
    numSkillChoices: 2,
    startingEquipment: [
      'chain mail',
      'martial weapon and shield',
      'light crossbow and 20 bolts',
      'dungeoneer-pack',
    ],
    subclassLevel: 3,
    subclassName: 'Martial Archetype',
    // Spellcasting info for Eldritch Knight subclass; base Fighter has none.
    // We include the EK table here so the UI can reference it when that subclass is chosen.
    spellcasting: {
      ability: 'int',
      cantripsKnown: thirdCasterCantrips,
      spellsKnown: eldritchKnightSpellsKnown,
      preparedCaster: false,
      casterType: 'third',
    },
    features: [
      { id: 'fighting-style-fighter', name: 'Fighting Style', level: 1, description: 'You adopt a particular style of fighting as your specialty. Choose one fighting style option. You cannot take a Fighting Style option more than once, even if you later get to choose again.' },
      { id: 'second-wind', name: 'Second Wind', level: 1, description: 'You have a limited well of stamina that you can draw on to protect yourself from harm. On your turn, you can use a bonus action to regain hit points equal to 1d10 + your fighter level. Once you use this feature, you must finish a short or long rest before you can use it again.' },
      { id: 'action-surge', name: 'Action Surge', level: 2, description: 'You can push yourself beyond your normal limits for a moment. On your turn, you can take one additional action. Once you use this feature, you must finish a short or long rest before you can use it again.' },
      { id: 'martial-archetype', name: 'Martial Archetype', level: 3, description: 'You choose an archetype that you strive to emulate in your combat styles and techniques.' },
      { id: 'asi-4', name: 'Ability Score Improvement', level: 4, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'extra-attack-fighter', name: 'Extra Attack', level: 5, description: 'You can attack twice, instead of once, whenever you take the Attack action on your turn.' },
      { id: 'asi-6', name: 'Ability Score Improvement', level: 6, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'archetype-feature-7', name: 'Martial Archetype feature', level: 7, description: 'You gain a feature granted by your Martial Archetype at 7th level.' },
      { id: 'asi-8', name: 'Ability Score Improvement', level: 8, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'indomitable-1', name: 'Indomitable (one use)', level: 9, description: 'You can reroll a saving throw that you fail, and must use the new roll. You regain the use after a long rest.' },
      { id: 'archetype-feature-10', name: 'Martial Archetype feature', level: 10, description: 'You gain a feature granted by your Martial Archetype at 10th level.' },
      { id: 'extra-attack-2', name: 'Extra Attack (2)', level: 11, description: 'You can attack three times whenever you take the Attack action on your turn.' },
      { id: 'asi-12', name: 'Ability Score Improvement', level: 12, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'indomitable-2', name: 'Indomitable (two uses)', level: 13, description: 'You can use Indomitable twice between long rests.' },
      { id: 'asi-14', name: 'Ability Score Improvement', level: 14, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'archetype-feature-15', name: 'Martial Archetype feature', level: 15, description: 'You gain a feature granted by your Martial Archetype at 15th level.' },
      { id: 'asi-16', name: 'Ability Score Improvement', level: 16, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'action-surge-2', name: 'Action Surge (two uses)', level: 17, description: 'You can use Action Surge twice before a rest, but only once on the same turn.' },
      { id: 'indomitable-3', name: 'Indomitable (three uses)', level: 17, description: 'You can use Indomitable three times between long rests.' },
      { id: 'archetype-feature-18', name: 'Martial Archetype feature', level: 18, description: 'You gain a feature granted by your Martial Archetype at 18th level.' },
      { id: 'asi-19', name: 'Ability Score Improvement', level: 19, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'extra-attack-3', name: 'Extra Attack (3)', level: 20, description: 'You can attack four times whenever you take the Attack action on your turn.' },
    ],
    subclasses: [
      {
        id: 'champion',
        name: 'Champion',
        description: 'The archetypal Champion focuses on the development of raw physical power honed to deadly perfection.',
        features: [
          { id: 'improved-critical', name: 'Improved Critical', level: 3, description: 'Your weapon attacks score a critical hit on a roll of 19 or 20.' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Monk
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'monk',
    name: 'Monk',
    description: 'A master of martial arts, harnessing the power of the body in pursuit of physical and spiritual perfection.',
    hitDie: 8,
    primaryAbility: ['dex', 'wis'],
    savingThrows: ['str', 'dex'],
    armorProficiencies: [],
    weaponProficiencies: ['simple', 'shortsword'],
    toolProficiencies: ['one artisan\'s tools or one musical instrument'],
    skillChoices: ['acrobatics', 'athletics', 'history', 'insight', 'religion', 'stealth'],
    numSkillChoices: 2,
    startingEquipment: [
      'shortsword',
      'dungeoneer-pack',
      '10 darts',
    ],
    subclassLevel: 3,
    subclassName: 'Monastic Tradition',
    spellcasting: null,
    features: [
      { id: 'unarmored-defense-monk', name: 'Unarmored Defense', level: 1, description: 'While you are wearing no armor and not wielding a shield, your AC equals 10 + your Dexterity modifier + your Wisdom modifier.' },
      { id: 'martial-arts', name: 'Martial Arts', level: 1, description: 'Your practice of martial arts gives you mastery of combat styles that use unarmed strikes and monk weapons. You gain benefits while unarmed or wielding only monk weapons and not wearing armor or a shield.' },
      { id: 'ki', name: 'Ki', level: 2, description: 'Your training allows you to harness the mystic energy of ki. You have a number of ki points equal to your monk level. You can spend these points to fuel ki features: Flurry of Blows, Patient Defense, and Step of the Wind.' },
      { id: 'unarmored-movement', name: 'Unarmored Movement', level: 2, description: 'Your speed increases by 10 feet while you are not wearing armor or wielding a shield. This bonus increases as you gain monk levels.' },
      { id: 'monastic-tradition', name: 'Monastic Tradition', level: 3, description: 'You commit yourself to a monastic tradition.' },
      { id: 'deflect-missiles', name: 'Deflect Missiles', level: 3, description: 'You can use your reaction to deflect or catch the missile when you are hit by a ranged weapon attack. The damage is reduced by 1d10 + your Dexterity modifier + your monk level.' },
      { id: 'asi-4', name: 'Ability Score Improvement', level: 4, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'slow-fall', name: 'Slow Fall', level: 4, description: 'You can use your reaction when you fall to reduce the falling damage by five times your monk level.' },
      { id: 'extra-attack-monk', name: 'Extra Attack', level: 5, description: 'You can attack twice, instead of once, whenever you take the Attack action on your turn.' },
      { id: 'stunning-strike', name: 'Stunning Strike', level: 5, description: 'When you hit another creature with a melee weapon attack, you can spend 1 ki point to attempt a stunning strike. The target must succeed on a Constitution saving throw or be stunned until the end of your next turn.' },
      { id: 'ki-empowered-strikes', name: 'Ki-Empowered Strikes', level: 6, description: 'Your unarmed strikes count as magical for the purpose of overcoming resistance and immunity to nonmagical attacks and damage.' },
      { id: 'tradition-feature-6', name: 'Monastic Tradition feature', level: 6, description: 'You gain a feature granted by your Monastic Tradition at 6th level.' },
      { id: 'evasion-monk', name: 'Evasion', level: 7, description: 'When you are subjected to an effect that allows a Dexterity save for half damage, you take no damage on a success and half damage on a failure.' },
      { id: 'stillness-of-mind', name: 'Stillness of Mind', level: 7, description: 'You can use your action to end one effect on yourself that is causing you to be charmed or frightened.' },
      { id: 'asi-8', name: 'Ability Score Improvement', level: 8, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'unarmored-movement-9', name: 'Unarmored Movement improvement', level: 9, description: 'You can move along vertical surfaces and across liquids on your turn without falling during the move.' },
      { id: 'purity-of-body', name: 'Purity of Body', level: 10, description: 'Your mastery of ki makes you immune to disease and poison.' },
      { id: 'tradition-feature-11', name: 'Monastic Tradition feature', level: 11, description: 'You gain a feature granted by your Monastic Tradition at 11th level.' },
      { id: 'asi-12', name: 'Ability Score Improvement', level: 12, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'tongue-of-sun-and-moon', name: 'Tongue of the Sun and Moon', level: 13, description: 'You understand all spoken languages, and any creature that can understand a language can understand what you say.' },
      { id: 'diamond-soul', name: 'Diamond Soul', level: 14, description: 'You gain proficiency in all saving throws, and you can spend 1 ki point to reroll a failed save.' },
      { id: 'timeless-body-monk', name: 'Timeless Body', level: 15, description: 'You no longer suffer the frailty of old age, and you cannot be aged magically. You also need no food or water.' },
      { id: 'asi-16', name: 'Ability Score Improvement', level: 16, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'tradition-feature-17', name: 'Monastic Tradition feature', level: 17, description: 'You gain a feature granted by your Monastic Tradition at 17th level.' },
      { id: 'empty-body', name: 'Empty Body', level: 18, description: 'You can spend 4 ki points to become invisible for 1 minute and gain resistance to all damage but force damage. You can also spend 8 ki points to cast astral projection on yourself alone.' },
      { id: 'asi-19', name: 'Ability Score Improvement', level: 19, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'perfect-self', name: 'Perfect Self', level: 20, description: 'When you roll initiative and have no ki points remaining, you regain 4 ki points.' },
    ],
    subclasses: [
      {
        id: 'open-hand',
        name: 'Way of the Open Hand',
        description: 'Monks who follow the Way of the Open Hand are the ultimate masters of martial arts combat.',
        features: [
          { id: 'open-hand-technique', name: 'Open Hand Technique', level: 3, description: 'Whenever you hit a creature with one of the attacks granted by your Flurry of Blows, you can impose one of several effects: the target must succeed on a DEX save or be knocked prone, make a STR save or be pushed up to 15 feet, or it cannot take reactions until the end of your next turn.' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Paladin
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'paladin',
    name: 'Paladin',
    description: 'A holy warrior bound to a sacred oath.',
    hitDie: 10,
    primaryAbility: ['str', 'cha'],
    savingThrows: ['wis', 'cha'],
    armorProficiencies: ['light', 'medium', 'heavy', 'shields'],
    weaponProficiencies: ['simple', 'martial'],
    toolProficiencies: [],
    skillChoices: ['athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion'],
    numSkillChoices: 2,
    startingEquipment: [
      'martial weapon and shield',
      'five javelins',
      'priest-pack',
      'chain mail',
      'holy symbol',
    ],
    subclassLevel: 3,
    subclassName: 'Sacred Oath',
    spellcasting: {
      ability: 'cha',
      cantripsKnown: noCantrips,
      spellsKnown: null,
      preparedCaster: true,
      casterType: 'half',
    },
    features: [
      { id: 'divine-sense', name: 'Divine Sense', level: 1, description: 'The presence of strong evil registers on your senses like a noxious odor. As an action, you can open your awareness to detect such forces. You know the location of any celestial, fiend, or undead within 60 feet that is not behind total cover.' },
      { id: 'lay-on-hands', name: 'Lay on Hands', level: 1, description: 'Your blessed touch can heal wounds. You have a pool of healing power that replenishes when you take a long rest. With that pool, you can restore a total number of hit points equal to your paladin level x 5.' },
      { id: 'fighting-style-paladin', name: 'Fighting Style', level: 2, description: 'You adopt a particular style of fighting as your specialty.' },
      { id: 'spellcasting-paladin', name: 'Spellcasting', level: 2, description: 'You have learned to draw on divine magic through meditation and prayer to cast spells. Charisma is your spellcasting ability.' },
      { id: 'divine-smite', name: 'Divine Smite', level: 2, description: 'When you hit a creature with a melee weapon attack, you can expend one spell slot to deal radiant damage to the target, in addition to the weapon\'s damage. The extra damage is 2d8 for a 1st-level spell slot, plus 1d8 for each spell level higher than 1st, to a maximum of 5d8.' },
      { id: 'divine-health', name: 'Divine Health', level: 3, description: 'The divine magic flowing through you makes you immune to disease.' },
      { id: 'sacred-oath', name: 'Sacred Oath', level: 3, description: 'You swear the oath that binds you as a paladin forever. Your oath grants you oath spells and the Channel Divinity feature.' },
      { id: 'asi-4', name: 'Ability Score Improvement', level: 4, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'extra-attack-paladin', name: 'Extra Attack', level: 5, description: 'You can attack twice, instead of once, whenever you take the Attack action on your turn.' },
      { id: 'aura-of-protection', name: 'Aura of Protection', level: 6, description: 'You and friendly creatures within 10 feet of you gain a bonus to saving throws equal to your Charisma modifier, minimum +1. The range becomes 30 feet at 18th level.' },
      { id: 'oath-feature-7', name: 'Sacred Oath feature', level: 7, description: 'You gain a feature granted by your Sacred Oath at 7th level.' },
      { id: 'asi-8', name: 'Ability Score Improvement', level: 8, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'aura-of-courage', name: 'Aura of Courage', level: 10, description: 'You and friendly creatures within 10 feet of you cannot be frightened while you are conscious. The range becomes 30 feet at 18th level.' },
      { id: 'improved-divine-smite', name: 'Improved Divine Smite', level: 11, description: 'Whenever you hit a creature with a melee weapon, it takes an extra 1d8 radiant damage.' },
      { id: 'asi-12', name: 'Ability Score Improvement', level: 12, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'cleansing-touch', name: 'Cleansing Touch', level: 14, description: 'You can use your action to end one spell on yourself or on one willing creature you touch, a number of times equal to your Charisma modifier, minimum once, regained on a long rest.' },
      { id: 'oath-feature-15', name: 'Sacred Oath feature', level: 15, description: 'You gain a feature granted by your Sacred Oath at 15th level.' },
      { id: 'asi-16', name: 'Ability Score Improvement', level: 16, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'aura-improvements', name: 'Aura improvements', level: 18, description: 'The range of your auras increases to 30 feet.' },
      { id: 'asi-19', name: 'Ability Score Improvement', level: 19, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'oath-feature-20', name: 'Sacred Oath feature', level: 20, description: 'You gain the capstone feature granted by your Sacred Oath at 20th level.' },
    ],
    subclasses: [
      {
        id: 'devotion',
        name: 'Oath of Devotion',
        description: 'Paladins who swear the Oath of Devotion hold themselves to the highest standards of conduct.',
        features: [
          { id: 'sacred-weapon', name: 'Channel Divinity: Sacred Weapon', level: 3, description: 'As an action, you can imbue one weapon you are holding with positive energy. For 1 minute, you add your Charisma modifier to attack rolls made with that weapon (minimum bonus of +1). The weapon also emits bright light in a 20-foot radius.' },
          { id: 'turn-the-unholy', name: 'Channel Divinity: Turn the Unholy', level: 3, description: 'As an action, each fiend or undead that can see or hear you within 30 feet must make a Wisdom saving throw. If the creature fails, it is turned for 1 minute or until it takes damage.' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Ranger
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'ranger',
    name: 'Ranger',
    description: 'A warrior who combats threats on the edges of civilization.',
    hitDie: 10,
    primaryAbility: ['dex', 'wis'],
    savingThrows: ['str', 'dex'],
    armorProficiencies: ['light', 'medium', 'shields'],
    weaponProficiencies: ['simple', 'martial'],
    toolProficiencies: [],
    skillChoices: ['animal-handling', 'athletics', 'insight', 'investigation', 'nature', 'perception', 'stealth', 'survival'],
    numSkillChoices: 3,
    startingEquipment: [
      'scale mail',
      'two shortswords',
      'dungeoneer-pack',
      'longbow and quiver of 20 arrows',
    ],
    subclassLevel: 3,
    subclassName: 'Ranger Archetype',
    spellcasting: {
      ability: 'wis',
      cantripsKnown: noCantrips,
      spellsKnown: rangerSpellsKnown,
      preparedCaster: false,
      casterType: 'half',
    },
    features: [
      { id: 'favored-enemy', name: 'Favored Enemy', level: 1, description: 'You have significant experience studying, tracking, hunting, and even talking to a certain type of enemy. Choose a type of favored enemy. You have advantage on Wisdom (Survival) checks to track and on Intelligence checks to recall information about them.' },
      { id: 'natural-explorer', name: 'Natural Explorer', level: 1, description: 'You are particularly familiar with one type of natural environment and are adept at traveling and surviving in such regions.' },
      { id: 'fighting-style-ranger', name: 'Fighting Style', level: 2, description: 'You adopt a particular style of fighting as your specialty.' },
      { id: 'spellcasting-ranger', name: 'Spellcasting', level: 2, description: 'You have learned to use the magical essence of nature to cast spells, much as a druid does. Wisdom is your spellcasting ability.' },
      { id: 'ranger-archetype', name: 'Ranger Archetype', level: 3, description: 'You choose an archetype that you strive to emulate.' },
      { id: 'primeval-awareness', name: 'Primeval Awareness', level: 3, description: 'You can use your action and expend one ranger spell slot to focus your awareness on the region around you. For 1 minute per level of the spell slot you expend, you can sense whether certain creature types are present within 1 mile (or 6 miles in your favored terrain).' },
      { id: 'asi-4', name: 'Ability Score Improvement', level: 4, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'extra-attack-ranger', name: 'Extra Attack', level: 5, description: 'You can attack twice, instead of once, whenever you take the Attack action on your turn.' },
      { id: 'favored-enemy-6', name: 'Favored Enemy and Natural Explorer improvements', level: 6, description: 'You choose an additional favored enemy and an additional favored terrain.' },
      { id: 'archetype-feature-7', name: 'Ranger Archetype feature', level: 7, description: 'You gain a feature granted by your Ranger Archetype at 7th level.' },
      { id: 'asi-8', name: 'Ability Score Improvement', level: 8, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'lands-stride', name: 'Land\'s Stride', level: 8, description: 'Moving through nonmagical difficult terrain costs you no extra movement, and you have advantage on saving throws against plants that are magically created or manipulated to impede movement.' },
      { id: 'natural-explorer-10', name: 'Natural Explorer improvement', level: 10, description: 'You choose an additional favored terrain.' },
      { id: 'hide-in-plain-sight', name: 'Hide in Plain Sight', level: 10, description: 'You can spend 1 minute creating camouflage. If you remain motionless against a solid surface afterwards, you gain a +10 bonus to Stealth checks.' },
      { id: 'archetype-feature-11', name: 'Ranger Archetype feature', level: 11, description: 'You gain a feature granted by your Ranger Archetype at 11th level.' },
      { id: 'asi-12', name: 'Ability Score Improvement', level: 12, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'favored-enemy-14', name: 'Favored Enemy improvement', level: 14, description: 'You choose an additional favored enemy.' },
      { id: 'vanish', name: 'Vanish', level: 14, description: 'You can Hide as a bonus action, and you cannot be tracked by nonmagical means unless you choose to leave a trail.' },
      { id: 'archetype-feature-15', name: 'Ranger Archetype feature', level: 15, description: 'You gain a feature granted by your Ranger Archetype at 15th level.' },
      { id: 'asi-16', name: 'Ability Score Improvement', level: 16, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'feral-senses', name: 'Feral Senses', level: 18, description: 'You gain preternatural senses: you are aware of the location of any invisible creature within 30 feet, and you do not have disadvantage on attacks against a creature you cannot see.' },
      { id: 'asi-19', name: 'Ability Score Improvement', level: 19, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'foe-slayer', name: 'Foe Slayer', level: 20, description: 'Once on each of your turns you can add your Wisdom modifier to the attack roll or the damage roll of an attack against one of your favored enemies.' },
    ],
    subclasses: [
      {
        id: 'hunter',
        name: 'Hunter',
        description: 'Emulating the Hunter archetype means accepting your place as a bulwark between civilization and the terrors of the wilderness.',
        features: [
          { id: 'hunters-prey', name: 'Hunter\'s Prey', level: 3, description: 'You gain one of the following features of your choice: Colossus Slayer (extra 1d8 damage once per turn to injured targets), Giant Killer (reaction attack when Large or larger creature misses you), or Horde Breaker (additional attack against a second creature near your first target).' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Rogue
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'rogue',
    name: 'Rogue',
    description: 'A scoundrel who uses stealth and trickery to overcome obstacles and enemies.',
    hitDie: 8,
    primaryAbility: ['dex'],
    savingThrows: ['dex', 'int'],
    armorProficiencies: ['light'],
    weaponProficiencies: ['simple', 'hand crossbow', 'longsword', 'rapier', 'shortsword'],
    toolProficiencies: ['thieves\' tools'],
    skillChoices: ['acrobatics', 'athletics', 'deception', 'insight', 'intimidation', 'investigation', 'perception', 'performance', 'persuasion', 'sleight-of-hand', 'stealth'],
    numSkillChoices: 4,
    startingEquipment: [
      'rapier',
      'shortbow and quiver of 20 arrows',
      'burglar-pack',
      'leather armor',
      'two daggers',
      'thieves\' tools',
    ],
    subclassLevel: 3,
    subclassName: 'Roguish Archetype',
    // Spellcasting info for Arcane Trickster subclass
    spellcasting: {
      ability: 'int',
      cantripsKnown: thirdCasterCantrips,
      spellsKnown: arcaneTricksterSpellsKnown,
      preparedCaster: false,
      casterType: 'third',
    },
    features: [
      { id: 'expertise-rogue', name: 'Expertise', level: 1, description: 'Choose two of your skill proficiencies, or one of your skill proficiencies and your proficiency with thieves\' tools. Your proficiency bonus is doubled for any ability check you make that uses either of the chosen proficiencies.' },
      { id: 'sneak-attack', name: 'Sneak Attack', level: 1, description: 'You know how to strike subtly and exploit a foe\'s distraction. Once per turn, you can deal an extra 1d6 damage to one creature you hit with an attack if you have advantage on the attack roll. The attack must use a finesse or a ranged weapon.' },
      { id: 'thieves-cant', name: 'Thieves\' Cant', level: 1, description: 'During your rogue training you learned thieves\' cant, a secret mix of dialect, jargon, and code that allows you to hide messages in seemingly normal conversation.' },
      { id: 'cunning-action', name: 'Cunning Action', level: 2, description: 'Your quick thinking and agility allow you to move and act quickly. You can take a bonus action on each of your turns in combat to take the Dash, Disengage, or Hide action.' },
      { id: 'roguish-archetype', name: 'Roguish Archetype', level: 3, description: 'You choose an archetype that you emulate in the exercise of your rogue abilities.' },
      { id: 'asi-4', name: 'Ability Score Improvement', level: 4, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'uncanny-dodge', name: 'Uncanny Dodge', level: 5, description: 'When an attacker you can see hits you with an attack, you can use your reaction to halve the damage.' },
      { id: 'expertise-rogue-6', name: 'Expertise', level: 6, description: 'Choose two more of your proficiencies; your proficiency bonus is doubled for any ability check you make with either of them.' },
      { id: 'evasion-rogue', name: 'Evasion', level: 7, description: 'When you are subjected to an effect that allows a Dexterity save for half damage, you take no damage on a success and half damage on a failure.' },
      { id: 'asi-8', name: 'Ability Score Improvement', level: 8, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'archetype-feature-9', name: 'Roguish Archetype feature', level: 9, description: 'You gain a feature granted by your Roguish Archetype at 9th level.' },
      { id: 'asi-10', name: 'Ability Score Improvement', level: 10, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'reliable-talent', name: 'Reliable Talent', level: 11, description: 'Whenever you make an ability check that lets you add your proficiency bonus, you can treat a d20 roll of 9 or lower as a 10.' },
      { id: 'asi-12', name: 'Ability Score Improvement', level: 12, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'archetype-feature-13', name: 'Roguish Archetype feature', level: 13, description: 'You gain a feature granted by your Roguish Archetype at 13th level.' },
      { id: 'blindsense', name: 'Blindsense', level: 14, description: 'If you can hear, you are aware of the location of any hidden or invisible creature within 10 feet of you.' },
      { id: 'slippery-mind', name: 'Slippery Mind', level: 15, description: 'You gain proficiency in Wisdom saving throws.' },
      { id: 'asi-16', name: 'Ability Score Improvement', level: 16, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'archetype-feature-17', name: 'Roguish Archetype feature', level: 17, description: 'You gain a feature granted by your Roguish Archetype at 17th level.' },
      { id: 'elusive', name: 'Elusive', level: 18, description: 'No attack roll has advantage against you while you are not incapacitated.' },
      { id: 'asi-19', name: 'Ability Score Improvement', level: 19, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'stroke-of-luck', name: 'Stroke of Luck', level: 20, description: 'If your attack misses a target within range, you can turn the miss into a hit; or if you fail an ability check, you can treat the d20 roll as a 20. You regain the use of this feature after a short or long rest.' },
    ],
    subclasses: [
      {
        id: 'thief',
        name: 'Thief',
        description: 'You hone your skills in the larcenous arts.',
        features: [
          { id: 'fast-hands', name: 'Fast Hands', level: 3, description: 'You can use the bonus action granted by your Cunning Action to make a Dexterity (Sleight of Hand) check, use your thieves\' tools to disarm a trap or open a lock, or take the Use an Object action.' },
          { id: 'second-story-work', name: 'Second-Story Work', level: 3, description: 'You gain the ability to climb faster than normal; climbing no longer costs you extra movement. In addition, when you make a running jump, the distance you cover increases by a number of feet equal to your Dexterity modifier.' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Sorcerer
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'sorcerer',
    name: 'Sorcerer',
    description: 'A spellcaster who draws on inherent magic from a gift or bloodline.',
    hitDie: 6,
    primaryAbility: ['cha'],
    savingThrows: ['con', 'cha'],
    armorProficiencies: [],
    weaponProficiencies: ['dagger', 'dart', 'sling', 'quarterstaff', 'light crossbow'],
    toolProficiencies: [],
    skillChoices: ['arcana', 'deception', 'insight', 'intimidation', 'persuasion', 'religion'],
    numSkillChoices: 2,
    startingEquipment: [
      'light crossbow and 20 bolts',
      'component pouch',
      'dungeoneer-pack',
      'two daggers',
    ],
    subclassLevel: 1,
    subclassName: 'Sorcerous Origin',
    spellcasting: {
      ability: 'cha',
      cantripsKnown: sorcererCantrips,
      spellsKnown: sorcererSpellsKnown,
      preparedCaster: false,
      casterType: 'full',
    },
    features: [
      { id: 'spellcasting-sorcerer', name: 'Spellcasting', level: 1, description: 'An event in your past, or in the life of a parent or ancestor, left an indelible mark on you, infusing you with arcane magic. Charisma is your spellcasting ability.' },
      { id: 'sorcerous-origin', name: 'Sorcerous Origin', level: 1, description: 'Choose a sorcerous origin, which describes the source of your innate magical power.' },
      { id: 'font-of-magic', name: 'Font of Magic', level: 2, description: 'You tap into a deep wellspring of magic within yourself. This wellspring is represented by sorcery points, which allow you to create a variety of magical effects. You have 2 sorcery points at level 2, and gain 1 more per sorcerer level.' },
      { id: 'metamagic', name: 'Metamagic', level: 3, description: 'You gain the ability to twist your spells to suit your needs. You gain two Metamagic options of your choice. You gain another one at 10th and 17th level.' },
      { id: 'asi-4', name: 'Ability Score Improvement', level: 4, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'origin-feature-6', name: 'Sorcerous Origin feature', level: 6, description: 'You gain a feature granted by your Sorcerous Origin at 6th level.' },
      { id: 'asi-8', name: 'Ability Score Improvement', level: 8, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'metamagic-10', name: 'Metamagic', level: 10, description: 'You learn a third Metamagic option of your choice.' },
      { id: 'asi-12', name: 'Ability Score Improvement', level: 12, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'origin-feature-14', name: 'Sorcerous Origin feature', level: 14, description: 'You gain a feature granted by your Sorcerous Origin at 14th level.' },
      { id: 'asi-16', name: 'Ability Score Improvement', level: 16, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'metamagic-17', name: 'Metamagic', level: 17, description: 'You learn a fourth Metamagic option of your choice.' },
      { id: 'origin-feature-18', name: 'Sorcerous Origin feature', level: 18, description: 'You gain a feature granted by your Sorcerous Origin at 18th level.' },
      { id: 'asi-19', name: 'Ability Score Improvement', level: 19, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'sorcerous-restoration', name: 'Sorcerous Restoration', level: 20, description: 'When you finish a short rest, you regain 4 expended sorcery points.' },
    ],
    subclasses: [
      {
        id: 'draconic',
        name: 'Draconic Bloodline',
        description: 'Your innate magic comes from draconic magic that was mingled with your blood or that of your ancestors.',
        features: [
          { id: 'dragon-ancestor', name: 'Dragon Ancestor', level: 1, description: 'You choose one type of dragon as your ancestor. The damage type associated with your draconic ancestry is used by features you gain later. You can speak, read, and write Draconic, and your proficiency bonus is doubled for Charisma checks when interacting with dragons.' },
          { id: 'draconic-resilience', name: 'Draconic Resilience', level: 1, description: 'As magic flows through your body, it causes physical traits of your dragon ancestors to emerge. Your hit point maximum increases by 1 for each sorcerer level. Additionally, when you aren\'t wearing armor, your AC equals 13 + your Dexterity modifier.' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Warlock
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'warlock',
    name: 'Warlock',
    description: 'A wielder of magic that is derived from a bargain with an extraplanar entity.',
    hitDie: 8,
    primaryAbility: ['cha'],
    savingThrows: ['wis', 'cha'],
    armorProficiencies: ['light'],
    weaponProficiencies: ['simple'],
    toolProficiencies: [],
    skillChoices: ['arcana', 'deception', 'history', 'intimidation', 'investigation', 'nature', 'religion'],
    numSkillChoices: 2,
    startingEquipment: [
      'light crossbow and 20 bolts',
      'component pouch',
      'scholar-pack',
      'leather armor',
      'simple weapon',
      'two daggers',
    ],
    subclassLevel: 1,
    subclassName: 'Otherworldly Patron',
    spellcasting: {
      ability: 'cha',
      cantripsKnown: warlockCantrips,
      spellsKnown: warlockSpellsKnown,
      preparedCaster: false,
      casterType: 'pact',
    },
    features: [
      { id: 'otherworldly-patron', name: 'Otherworldly Patron', level: 1, description: 'You have struck a bargain with an otherworldly being of your choice. Your choice grants you features at 1st level and again at 6th, 10th, and 14th level.' },
      { id: 'pact-magic', name: 'Pact Magic', level: 1, description: 'Your arcane research and the magic bestowed on you by your patron have given you facility with spells. You know two cantrips and a number of warlock spells. Your spell slots recover on a short rest, and all slots are the same level.' },
      { id: 'eldritch-invocations', name: 'Eldritch Invocations', level: 2, description: 'In your study of occult lore, you have unearthed eldritch invocations, fragments of forbidden knowledge that imbue you with an abiding magical ability. You gain two invocations of your choice.' },
      { id: 'pact-boon', name: 'Pact Boon', level: 3, description: 'Your otherworldly patron bestows a gift upon you for your loyal service. You gain one of the following features: Pact of the Chain, Pact of the Blade, or Pact of the Tome.' },
      { id: 'asi-4', name: 'Ability Score Improvement', level: 4, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'patron-feature-6', name: 'Otherworldly Patron feature', level: 6, description: 'You gain a feature granted by your Otherworldly Patron at 6th level.' },
      { id: 'asi-8', name: 'Ability Score Improvement', level: 8, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'patron-feature-10', name: 'Otherworldly Patron feature', level: 10, description: 'You gain a feature granted by your Otherworldly Patron at 10th level.' },
      { id: 'mystic-arcanum-6', name: 'Mystic Arcanum (6th level)', level: 11, description: 'Choose one 6th-level spell from the warlock spell list as an arcanum. You can cast it once without expending a spell slot, regaining the ability on a long rest.' },
      { id: 'asi-12', name: 'Ability Score Improvement', level: 12, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'mystic-arcanum-7', name: 'Mystic Arcanum (7th level)', level: 13, description: 'Choose one 7th-level warlock spell as an arcanum, castable once per long rest without a spell slot.' },
      { id: 'patron-feature-14', name: 'Otherworldly Patron feature', level: 14, description: 'You gain a feature granted by your Otherworldly Patron at 14th level.' },
      { id: 'mystic-arcanum-8', name: 'Mystic Arcanum (8th level)', level: 15, description: 'Choose one 8th-level warlock spell as an arcanum, castable once per long rest without a spell slot.' },
      { id: 'asi-16', name: 'Ability Score Improvement', level: 16, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'mystic-arcanum-9', name: 'Mystic Arcanum (9th level)', level: 17, description: 'Choose one 9th-level warlock spell as an arcanum, castable once per long rest without a spell slot.' },
      { id: 'asi-19', name: 'Ability Score Improvement', level: 19, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'eldritch-master', name: 'Eldritch Master', level: 20, description: 'You can spend 1 minute entreating your patron to regain all your expended Pact Magic spell slots. You must finish a long rest before doing so again.' },
    ],
    subclasses: [
      {
        id: 'fiend',
        name: 'The Fiend',
        description: 'You have made a pact with a fiend from the lower planes of existence.',
        features: [
          { id: 'dark-ones-blessing', name: 'Dark One\'s Blessing', level: 1, description: 'When you reduce a hostile creature to 0 hit points, you gain temporary hit points equal to your Charisma modifier + your warlock level (minimum of 1).' },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Wizard
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'wizard',
    name: 'Wizard',
    description: 'A scholarly magic-user capable of manipulating the structures of reality.',
    hitDie: 6,
    primaryAbility: ['int'],
    savingThrows: ['int', 'wis'],
    armorProficiencies: [],
    weaponProficiencies: ['dagger', 'dart', 'sling', 'quarterstaff', 'light crossbow'],
    toolProficiencies: [],
    skillChoices: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'religion'],
    numSkillChoices: 2,
    startingEquipment: [
      'quarterstaff',
      'component pouch',
      'scholar-pack',
      'spellbook',
    ],
    subclassLevel: 2,
    subclassName: 'Arcane Tradition',
    spellcasting: {
      ability: 'int',
      cantripsKnown: wizardCantrips,
      spellsKnown: null,
      preparedCaster: true,
      casterType: 'full',
    },
    features: [
      { id: 'spellcasting-wizard', name: 'Spellcasting', level: 1, description: 'As a student of arcane magic, you have a spellbook containing spells that show the first glimmerings of your true power. Intelligence is your spellcasting ability.' },
      { id: 'arcane-recovery', name: 'Arcane Recovery', level: 1, description: 'You have learned to regain some of your magical energy by studying your spellbook. Once per day when you finish a short rest, you can choose expended spell slots to recover. The spell slots can have a combined level that is equal to or less than half your wizard level (rounded up), and none of the slots can be 6th level or higher.' },
      { id: 'arcane-tradition', name: 'Arcane Tradition', level: 2, description: 'You choose an arcane tradition, shaping your practice of magic through one of the eight schools of magic.' },
      { id: 'asi-4', name: 'Ability Score Improvement', level: 4, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'tradition-feature-6', name: 'Arcane Tradition feature', level: 6, description: 'You gain a feature granted by your Arcane Tradition at 6th level.' },
      { id: 'asi-8', name: 'Ability Score Improvement', level: 8, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'tradition-feature-10', name: 'Arcane Tradition feature', level: 10, description: 'You gain a feature granted by your Arcane Tradition at 10th level.' },
      { id: 'asi-12', name: 'Ability Score Improvement', level: 12, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'tradition-feature-14', name: 'Arcane Tradition feature', level: 14, description: 'You gain a feature granted by your Arcane Tradition at 14th level.' },
      { id: 'asi-16', name: 'Ability Score Improvement', level: 16, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'spell-mastery', name: 'Spell Mastery', level: 18, description: 'Choose a 1st-level and a 2nd-level wizard spell in your spellbook. You can cast them at their lowest level without expending a spell slot, as long as you have them prepared.' },
      { id: 'asi-19', name: 'Ability Score Improvement', level: 19, description: 'You can increase one ability score by 2, or two ability scores by 1 each. You cannot raise a score above 20. You can take a feat instead if your DM allows it.' },
      { id: 'signature-spells', name: 'Signature Spells', level: 20, description: 'Choose two 3rd-level wizard spells as signature spells. You always have them prepared, they do not count against your prepared total, and you can cast each once at 3rd level without a spell slot, regaining that use on a short or long rest.' },
    ],
    subclasses: [
      {
        id: 'evocation',
        name: 'School of Evocation',
        description: 'You focus your study on magic that creates powerful elemental effects.',
        features: [
          { id: 'evocation-savant', name: 'Evocation Savant', level: 2, description: 'The gold and time you must spend to copy an evocation spell into your spellbook is halved.' },
          { id: 'sculpt-spells', name: 'Sculpt Spells', level: 2, description: 'You can create pockets of relative safety within the effects of your evocation spells. When you cast an evocation spell that affects other creatures you can see, you can choose a number of them equal to 1 + the spell\'s level. The chosen creatures automatically succeed on their saving throws against the spell, and they take no damage if they would normally take half damage on a successful save.' },
        ],
      },
    ],
  },
]

export function getClassById(id: string): CharacterClass | undefined {
  return classes.find(c => c.id === id)
}

export function getSubclassById(classId: string, subclassId: string): Subclass | undefined {
  const cls = getClassById(classId)
  return cls?.subclasses.find(s => s.id === subclassId)
}

export function getFeaturesForLevel(classId: string, level: number): ClassFeature[] {
  const cls = getClassById(classId)
  if (!cls) return []
  return cls.features.filter(f => f.level <= level)
}
