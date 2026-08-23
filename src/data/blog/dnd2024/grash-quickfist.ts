import type { CharacterData } from '@/stores/character'

/**
 * Grash Quickfist — Orc Monk (Warrior Of The Open Hand) livello 3
 *
 * Regole 2024. La specie non dà bonus alle caratteristiche: quelli vengono dal
 * background (Criminal: dex: 2, con: 1) insieme al talento d'origine.
 * In `cantrips` stanno solo i trucchetti della classe; quelli che arrivano
 * dalla discendenza o dal talento sono elencati fra i privilegi.
 */
export const grashQuickfist: CharacterData = {
  id: 'blog-monk-orc-grash-quickfist',
  variant: 'dnd2024',
  name: 'Grash Quickfist',
  playerName: '',
  race: 'orc',
  subrace: '',
  feat: 'alert',
  className: 'monk',
  subclass: 'warrior-of-the-open-hand',
  level: 3,
  background: 'criminal',
  alignment: 'cg',
  experiencePoints: 900,
  // Acquisto a punti (27): str: 12, dex: 15, con: 13, int: 8, wis: 14, cha: 10
  abilityScores: { str: 12, dex: 15, con: 13, int: 8, wis: 14, cha: 10 },
  // Background Criminal: dex: 2, con: 1 — totali STR 12, DEX 17, CON 14, INT 8, WIS 14, CHA 10
  racialBonuses: { dex: 2, con: 1 },
  skillProficiencies: [
    'sleight-of-hand',
    'stealth',
    'acrobatics',
    'insight',
  ],
  skillExpertise: [],
  savingThrowProficiencies: ['str', 'dex'],
  languages: [
    'Common',
    'Orc',
  ],
  proficienciesOther: [
    'simple weapons',
    'martial weapons with Light property',
    'thieves tools',
  ],
  weapons: [
    { name: 'Unarmed Strike', attackBonus: 5, damage: '1d6+3' },
    { name: 'Shortsword', attackBonus: 5, damage: '1d6+3' },
  ],
  armor: '',
  shield: false,
  equipment: [
    'Shortsword',
    'Ten Darts',
    'Thieves Tools',
    'Explorers Pack',
  ],
  coins: { cp: 0, sp: 0, ep: 0, gp: 11, pp: 0 },
  personalityTraits: 'I notice the exits before I notice the people, and I have never once regretted the order.',
  ideals: 'Restraint. Anyone can hit someone. Choosing not to, when you easily could, is the only part that takes practice.',
  bonds: 'The monastery took in a seventeen-year-old thief who had just been caught for the third time. I am still not sure why, and I have not stopped trying to deserve it.',
  flaws: 'I still case every room I walk into, and one day someone is going to notice me doing it.',
  featuresTraits: [
    'Martial Arts',
    'Unarmored Defense',
    'Monk’s Focus',
    'Unarmored Movement',
    'Uncanny Metabolism',
    'Deflect Attacks',
    'Monk Subclass: Warrior of the Open Hand',
    'Open Hand Technique',
    'Adrenaline Rush',
    'Darkvision',
    'Relentless Endurance',
    'Origin Feat: Alert',
  ],
  backstory: 'Grash learned to pick pockets in a port city that had no shortage of them and no patience either. The third arrest should have ended with a hand off; instead a travelling monk paid the fine and offered a road out of town. The monastery\'s discipline turned out to be the same discipline as the trade — patience, timing, knowing exactly where everyone is standing — pointed somewhere else. He left after eleven years because the abbot told him the training was for the world, not for the courtyard. He is still working out what that means.',
  age: '28',
  height: '6\'3"',
  weight: '210 lbs',
  eyes: 'Yellow',
  hair: 'Shaved',
  skin: 'Grey-green',
  allies: 'The monastery of the Level Road — no gate, no walls, and an open kitchen',
  treasure: 'A set of lockpicks he has not used in eleven years and will not throw away',
  spellcastingClass: '',
  spellcastingAbility: '',
  cantrips: [],
  spellsKnown: [],
  spellsPrepared: [],
  hitDie: 8,
  // PF: 1° liv 8 + COS 2; livelli successivi 2 × (5 + 2)
  maxHp: 24,
  currentHp: 24,
  tempHp: 0,
  speed: 40,
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
