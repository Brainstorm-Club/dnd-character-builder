import type { CharacterData } from '@/stores/character'

/**
 * Ignis Emberclaw — Dragonborn (Red) Sorcerer (Draconic Sorcery) livello 3
 *
 * Regole 2024. La specie non dà bonus alle caratteristiche: quelli vengono dal
 * background (Acolyte: cha: 2, wis: 1) insieme al talento d'origine.
 * In `cantrips` stanno solo i trucchetti della classe; quelli che arrivano
 * dalla discendenza o dal talento sono elencati fra i privilegi.
 */
export const ignisEmberclaw: CharacterData = {
  id: 'blog-sorcerer-dragonborn-ignis-emberclaw',
  variant: 'dnd2024',
  name: 'Ignis Emberclaw',
  playerName: '',
  race: 'dragonborn',
  subrace: 'red',
  feat: 'magic-initiate',
  className: 'sorcerer',
  subclass: 'draconic-sorcery',
  level: 3,
  background: 'acolyte',
  alignment: 'cn',
  experiencePoints: 900,
  // Acquisto a punti (27): str: 10, dex: 13, con: 14, int: 8, wis: 12, cha: 15
  abilityScores: { str: 10, dex: 13, con: 14, int: 8, wis: 12, cha: 15 },
  // Background Acolyte: cha: 2, wis: 1 — totali STR 10, DEX 13, CON 14, INT 8, WIS 13, CHA 17
  racialBonuses: { cha: 2, wis: 1 },
  skillProficiencies: [
    'insight',
    'religion',
    'arcana',
    'persuasion',
  ],
  skillExpertise: [],
  savingThrowProficiencies: ['con', 'cha'],
  languages: [
    'Common',
    'Draconic',
  ],
  proficienciesOther: [
    'simple weapons',
  ],
  weapons: [
    { name: 'Dagger', attackBonus: 3, damage: '1d4+1' },
    { name: 'Quarterstaff', attackBonus: 2, damage: '1d6' },
  ],
  armor: '',
  shield: false,
  equipment: [
    'Two Daggers',
    'Quarterstaff',
    'Arcane Focus',
    'Explorers Pack',
    'Holy Symbol',
  ],
  coins: { cp: 0, sp: 0, ep: 0, gp: 8, pp: 0 },
  personalityTraits: 'I explain what I am about to cast while I am casting it, which my companions find either educational or insufferable.',
  ideals: 'Understanding. The magic was in me before I asked for it; the least I can do is learn what it is.',
  bonds: 'The temple raised me believing the fire was a blessing. I would like to find out who told them that, and why.',
  flaws: 'I set things alight when I am startled, and I have burned down two buildings that had done nothing to deserve it.',
  featuresTraits: [
    'Spellcasting',
    'Innate Sorcery',
    'Font of Magic',
    'Sorcerer Subclass: Draconic Sorcery',
    'Draconic Resilience',
    'Draconic Spells',
    'Draconic Ancestry',
    'Breath Weapon',
    'Damage Resistance',
    'Darkvision',
    'Origin Feat: Magic Initiate (Cleric)',
  ],
  backstory: 'Ignis was left at a temple door as a hatchling and grew up being told, with total sincerity, that the heat under his scales was divine favour. It was not; it was a bloodline, and he found that out at fourteen when a nightmare took the dormitory roof off. The priests did not throw him out, which he still thinks about. He left anyway, to find the ancestor the sorcery came from, and has so far found four contradictory genealogies and one very old red dragon who declined to comment.',
  age: '19',
  height: '6\'1"',
  weight: '230 lbs',
  eyes: 'Ember orange',
  hair: 'None',
  skin: 'Deep red scales, warm to the touch',
  allies: 'The Temple of the Kindled Hearth, which still keeps his bed made',
  treasure: 'A scorched dormitory shutter, kept as a reminder to breathe before he panics',
  spellcastingClass: 'sorcerer',
  spellcastingAbility: 'cha',
  cantrips: [
    'Fire Bolt',
    'Sorcerous Burst',
    'Prestidigitation',
    'Light',
  ],
  spellsKnown: [],
  spellsPrepared: [
    'Burning Hands',
    'Magic Missile',
    'Shield',
    'Chromatic Orb',
    'Mage Armor',
    'Scorching Ray',
  ],
  hitDie: 6,
  // PF: 1° liv 6 + COS 2; livelli successivi 2 × (4 + 2)
  maxHp: 20,
  currentHp: 20,
  tempHp: 0,
  speed: 30,
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
