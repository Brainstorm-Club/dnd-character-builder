import type { CharacterData } from '@/stores/character'

/**
 * Vaska Stonemarch — Goliath (Stones Endurance) Barbarian (Path Of The Berserker) livello 4
 *
 * Regole 2024. La specie non dà bonus alle caratteristiche: quelli vengono dal
 * background (Soldier: str: 2, con: 1) insieme al talento d'origine.
 * In `cantrips` stanno solo i trucchetti della classe; quelli che arrivano
 * dalla discendenza o dal talento sono elencati fra i privilegi.
 */
export const vaskaStonemarch: CharacterData = {
  id: 'blog-barbarian-goliath-vaska-stonemarch',
  variant: 'dnd2024',
  name: 'Vaska Stonemarch',
  playerName: '',
  race: 'goliath',
  subrace: 'stones-endurance',
  feat: 'savage-attacker',
  className: 'barbarian',
  subclass: 'path-of-the-berserker',
  level: 4,
  background: 'soldier',
  alignment: 'cn',
  experiencePoints: 2700,
  // Acquisto a punti (27): str: 15, dex: 13, con: 14, int: 8, wis: 12, cha: 10
  abilityScores: { str: 15, dex: 13, con: 14, int: 8, wis: 12, cha: 10 },
  // Background Soldier: str: 2, con: 1 — totali STR 17, DEX 13, CON 15, INT 8, WIS 12, CHA 10
  racialBonuses: { str: 2, con: 1 },
  skillProficiencies: [
    'athletics',
    'survival',
    'intimidation',
  ],
  skillExpertise: [],
  savingThrowProficiencies: ['str', 'con'],
  languages: [
    'Common',
    'Giant',
  ],
  proficienciesOther: [
    'light armor',
    'medium armor',
    'shields',
    'simple weapons',
    'martial weapons',
  ],
  weapons: [
    { name: 'Greataxe', attackBonus: 5, damage: '1d12+3' },
    { name: 'Handaxe', attackBonus: 5, damage: '1d6+3' },
  ],
  armor: '',
  shield: false,
  equipment: [
    'Greataxe',
    'Four Handaxes',
    'Explorers Pack',
    'Soldiers Insignia',
  ],
  coins: { cp: 0, sp: 0, ep: 0, gp: 10, pp: 0 },
  personalityTraits: 'I speak little and move first. Words are what people use when they are not yet sure they will fight, and I am always sure.',
  ideals: 'Endurance. The mountain does not argue with the storm; it is simply still there afterwards, and so am I.',
  bonds: 'My clan carved their names into the pass above Karrag Vale. I will not have that stone quarried for someone\'s manor house.',
  flaws: 'When the Rage takes me I stop telling friend from obstacle, and I have hurt people who only meant to hold me back.',
  featuresTraits: [
    'Rage',
    'Unarmored Defense',
    'Weapon Mastery',
    'Danger Sense',
    'Reckless Attack',
    'Primal Knowledge',
    'Barbarian Subclass: Path of the Berserker',
    'Frenzy',
    'Ability Score Improvement',
    'Giant Ancestry: Stone\'s Endurance',
    'Powerful Build',
    'Origin Feat: Savage Attacker',
  ],
  backstory: 'Vaska comes from a highland clan that measured worth in what a person could carry and how long they could carry it. When a mining consortium bought the pass her ancestors were buried in, the elders sent their strongest down to argue in the lowland courts. Vaska went instead of arguing, and discovered that the fury she had spent her life damming up was worth more on a battlefield than any petition. She takes contracts now, mostly guarding caravans, and sends every coin home. She has not yet decided what she will do when she has enough of them.',
  age: '29',
  height: '7\'2"',
  weight: '340 lbs',
  eyes: 'Slate grey',
  hair: 'Black, shorn at the sides',
  skin: 'Pale with stone-flecked patches',
  allies: 'Clan Stonemarch of Karrag Vale — distant, but they still keep a place at the fire',
  treasure: 'A palm-sized chip of the burial stone, carried in a leather pouch at her throat',
  spellcastingClass: '',
  spellcastingAbility: '',
  cantrips: [],
  spellsKnown: [],
  spellsPrepared: [],
  hitDie: 12,
  // PF: 1° liv 12 + COS 2; livelli successivi 3 × (7 + 2)
  maxHp: 41,
  currentHp: 41,
  tempHp: 0,
  speed: 35,
  brawlingMoves: [],
  misdeeds: '',
  size: 'Medium',
  whacksLevel: 0,
  mark: '',
  markSpirit: '',
  virtue: '',
  sin: '',
  humanity: 10,
  sessionNotes: '',
  classes: [],
}
