// Background di D&D 2024 — System Reference Document 5.2.1 (CC-BY-4.0).
//
// Nel 2024 il background non è più solo colore: assegna le caratteristiche
// (una +2 e una +1, oppure tutte e tre +1) e un talento d'origine. È qui che
// è finito il bonus che nel 2014 dava la razza.
//
// L'SRD 5.2.1 ne contiene quattro; il Player's Handbook ne ha sedici.

import type { Background } from '../dnd5e/backgrounds'

export const dnd2024Backgrounds: readonly Background[] = [
  {
    id: 'acolyte',
    name: 'Acolyte',
    description:
      'You devoted yourself to service in a temple, learning sacred rites and providing sacrifices to the god or gods you worship. Serving the temple, you performed hallowed rites and offered sacrifices.',
    abilityScoreOptions: ['int', 'wis', 'cha'],
    originFeat: 'Magic Initiate (Cleric)',
    skillProficiencies: ['insight', 'religion'],
    toolProficiencies: ["Calligrapher's Supplies"],
    languages: 0,
    equipment: [
      "Calligrapher's Supplies",
      'Book (prayers)',
      'Holy Symbol',
      'Parchment (10 sheets)',
      'Robe',
      '8 GP',
    ],
    feature: {
      name: 'Magic Initiate (Cleric)',
      description:
        'You learn two cleric cantrips and one 1st-level cleric spell, which you can cast once without a spell slot per long rest. Wisdom is the spellcasting ability for them.',
    },
  },
  {
    id: 'criminal',
    name: 'Criminal',
    description:
      'You learned to earn your keep by picking pockets and cracking locks, and you kept company with folk who did the same. Whether you were a burglar, a fence or a lookout, you know the trade.',
    abilityScoreOptions: ['dex', 'con', 'int'],
    originFeat: 'Alert',
    skillProficiencies: ['sleight-of-hand', 'stealth'],
    toolProficiencies: ["Thieves' Tools"],
    languages: 0,
    equipment: ['2 Daggers', "Thieves' Tools", 'Crowbar', '2 Pouches', "Traveler's Clothes", '16 GP'],
    feature: {
      name: 'Alert',
      description:
        'You add your proficiency bonus to initiative rolls, and immediately after rolling initiative you can swap your result with that of a willing ally.',
    },
  },
  {
    id: 'sage',
    name: 'Sage',
    description:
      'You spent your formative years travelling between manors and monasteries, doing research for a wizard, a sage or a librarian, and reading every book you could lay hands on.',
    abilityScoreOptions: ['con', 'int', 'wis'],
    originFeat: 'Magic Initiate (Wizard)',
    skillProficiencies: ['arcana', 'history'],
    toolProficiencies: ["Calligrapher's Supplies"],
    languages: 0,
    equipment: [
      'Quarterstaff',
      "Calligrapher's Supplies",
      'Book (history)',
      'Parchment (8 sheets)',
      'Robe',
      '8 GP',
    ],
    feature: {
      name: 'Magic Initiate (Wizard)',
      description:
        'You learn two wizard cantrips and one 1st-level wizard spell, which you can cast once without a spell slot per long rest. Intelligence is the spellcasting ability for them.',
    },
  },
  {
    id: 'soldier',
    name: 'Soldier',
    description:
      'You began training for war as soon as you reached adulthood and carry the scars to prove it. You might have been a raider, a militia member or a soldier in a standing army.',
    abilityScoreOptions: ['str', 'dex', 'con'],
    originFeat: 'Savage Attacker',
    skillProficiencies: ['athletics', 'intimidation'],
    toolProficiencies: ['One kind of Gaming Set'],
    languages: 0,
    equipment: [
      'Spear',
      'Shortbow',
      '20 Arrows',
      'Gaming Set',
      "Healer's Kit",
      'Quiver',
      "Traveler's Clothes",
      '14 GP',
    ],
    feature: {
      name: 'Savage Attacker',
      description:
        'Once per turn when you hit with a weapon, you can roll the weapon damage dice twice and use either roll.',
    },
  },
]
