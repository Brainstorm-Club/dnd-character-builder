import type { CharacterData } from '@/stores/character'

/**
 * Malachai Voidwhisper — Tiefling (Abyssal) Warlock (Fiend Patron) livello 3
 *
 * Regole 2024. La specie non dà bonus alle caratteristiche: quelli vengono dal
 * background (Acolyte: cha: 2, int: 1) insieme al talento d'origine.
 * In `cantrips` stanno solo i trucchetti della classe; quelli che arrivano
 * dalla discendenza o dal talento sono elencati fra i privilegi.
 */
export const malachaiVoidwhisper: CharacterData = {
  id: 'blog-warlock-tiefling-malachai-voidwhisper',
  variant: 'dnd2024',
  name: 'Malachai Voidwhisper',
  playerName: '',
  race: 'tiefling',
  subrace: 'abyssal',
  feat: 'magic-initiate',
  className: 'warlock',
  subclass: 'fiend-patron',
  level: 3,
  background: 'acolyte',
  alignment: 'ne',
  experiencePoints: 900,
  // Acquisto a punti (27): str: 8, dex: 13, con: 14, int: 12, wis: 10, cha: 15
  abilityScores: { str: 8, dex: 13, con: 14, int: 12, wis: 10, cha: 15 },
  // Background Acolyte: cha: 2, int: 1 — totali STR 8, DEX 13, CON 14, INT 13, WIS 10, CHA 17
  racialBonuses: { cha: 2, int: 1 },
  skillProficiencies: [
    'insight',
    'religion',
    'arcana',
    'deception',
  ],
  skillExpertise: [],
  savingThrowProficiencies: ['wis', 'cha'],
  languages: [
    'Common',
    'Abyssal',
    'Infernal',
  ],
  proficienciesOther: [
    'light armor',
    'simple weapons',
  ],
  weapons: [
    { name: 'Dagger', attackBonus: 3, damage: '1d4+1' },
    { name: 'Sickle', attackBonus: 1, damage: '1d4-1' },
  ],
  armor: 'Leather',
  shield: false,
  equipment: [
    'Two Daggers',
    'Leather Armor',
    'Arcane Focus',
    'Scholars Pack',
    'Holy Symbol',
  ],
  coins: { cp: 0, sp: 0, ep: 0, gp: 15, pp: 0 },
  personalityTraits: 'I am unfailingly courteous, which unsettles people far more than the alternative would.',
  ideals: 'Terms. Everything is a bargain. The only sin is not reading it before you sign.',
  bonds: 'My patron holds a contract with my name on it and a date I have never been shown. I would very much like to see that date.',
  flaws: 'I bargain with everyone — innkeepers, allies, children — because I no longer know how to simply ask.',
  featuresTraits: [
    'Eldritch Invocations',
    'Pact Magic',
    'Magical Cunning',
    'Warlock Subclass: Fiend Patron',
    'Dark One’s Blessing',
    'Fiend Spells',
    'Darkvision',
    'Fiendish Legacy: Abyssal',
    'Otherworldly Presence',
    'Origin Feat: Magic Initiate (Cleric)',
  ],
  backstory: 'Malachai was a seminary archivist with a gift for contract law and no particular ambition, until he catalogued a codex that catalogued him back. The bargain he struck was, he maintains, a good one: he read every clause, negotiated three, and understood what he was giving up. What he did not get was the term. He has spent four years since trying to establish how long he has, using the only research skills he has ever had, and he is uncomfortably aware that his patron finds the effort entertaining.',
  age: '34',
  height: '5\'11"',
  weight: '150 lbs',
  eyes: 'Pale white, no pupil',
  hair: 'Black, receding',
  skin: 'Ash grey',
  allies: 'A seminary librarian who still answers his letters, against her better judgement',
  treasure: 'A notarised copy of his own contract, with one clause deliberately illegible',
  spellcastingClass: 'warlock',
  spellcastingAbility: 'cha',
  cantrips: [
    'Eldritch Blast',
    'Minor Illusion',
  ],
  spellsKnown: [],
  spellsPrepared: [
    'Hex',
    'Hellish Rebuke',
    'Charm Person',
    'Misty Step',
  ],
  hitDie: 8,
  // PF: 1° liv 8 + COS 2; livelli successivi 2 × (5 + 2)
  maxHp: 24,
  currentHp: 24,
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
