// Talenti di D&D 2024 — System Reference Document 5.2.1 (CC-BY-4.0).
//
// Nel 2024 i talenti sono un sottosistema vero, diviso in categorie. I
// talenti d'origine arrivano dal background (e l'umano ne prende uno in più
// con Versatile); quelli generali sostituiscono l'Aumento dei punteggi di
// caratteristica dal 4° livello in su; i Doni epici arrivano al 19°.
//
// L'SRD ne contiene diciassette (pagg. 87-88); il Player's Handbook molti di più.
//
// ESTRAZIONE. Questi testi vengono dalle pagine 87 e 88 dell'SRD inglese,
// ritagliate UNA COLONNA PER VOLTA (`pdftotext -x 0 -W 294` e `-x 300 -W 294`,
// pagina 594×783). La prima estrazione linearizzava la pagina intera e
// incollava insieme testi che sul manuale sono in colonne diverse: "Savage
// Attacker" si tirava dentro tutto "Skilled" e il titolo "General Feats",
// "Archery" nasceva con una "s" orfana e moriva su un "it", "Magic Initiate"
// si fermava a "the ability to ca", "Two-Weapon Fighting" finiva con
// l'intestazione "Epic Boon Feats" e "Boon of Truesight" proseguiva nel
// capitolo Equipment. Otto descrizioni su sedici erano rovinate, e "Skilled"
// era sparito del tutto perché finito dentro la descrizione di un altro
// talento. Le descrizioni italiane stanno in `feats-it.ts`, i nomi italiani
// in `src/i18n/gameTerms.ts` (featureNamesIt).
//
// L'ordine è quello del manuale: per categoria, e alfabetico dentro ciascuna.

export type FeatCategory = 'origin' | 'general' | 'fighting-style' | 'epic-boon'

export interface Dnd2024Feat {
  id: string
  name: string
  category: FeatCategory
  /** Requisito da soddisfare per prenderlo, se ne ha uno */
  prerequisite?: string
  description: string
}

export const dnd2024Feats: readonly Dnd2024Feat[] = [
  { id: 'alert', name: 'Alert', category: 'origin', prerequisite: undefined, description: 'You gain the following benefits. Initiative Proficiency. When you roll Initiative, you can add your Proficiency Bonus to the roll. Initiative Swap. Immediately after you roll Initiative, you can swap your Initiative with the Initiative of one willing ally in the same combat. You can’t make this swap if you or the ally has the Incapacitated condition.' },
  { id: 'magic-initiate', name: 'Magic Initiate', category: 'origin', prerequisite: undefined, description: 'You gain the following benefits. Two Cantrips. You learn two cantrips of your choice from the Cleric, Druid, or Wizard spell list. Intelligence, Wisdom, or Charisma is your spellcasting ability for this feat’s spells (choose when you select this feat). Level 1 Spell. Choose a level 1 spell from the same list you selected for this feat’s cantrips. You always have that spell prepared. You can cast it once without a spell slot, and you regain the ability to cast it in that way when you finish a Long Rest. You can also cast the spell using any spell slots you have. Spell Change. Whenever you gain a new level, you can replace one of the spells you chose for this feat with a different spell of the same level from the chosen spell list. Repeatable. You can take this feat more than once, but you must choose a different spell list each time.' },
  { id: 'savage-attacker', name: 'Savage Attacker', category: 'origin', prerequisite: undefined, description: 'You’ve trained to deal particularly damaging strikes. Once per turn when you hit a target with a weapon, you can roll the weapon’s damage dice twice and use either roll against the target.' },
  // "Skilled" mancava dal catalogo: l'estrazione sbagliata l'aveva inghiottito
  // dentro la descrizione di "Savage Attacker", che sul manuale gli sta sopra
  // nella stessa colonna. Senza di lui l'umano con Versatile aveva una scelta
  // in meno di quante ne concede il manuale.
  { id: 'skilled', name: 'Skilled', category: 'origin', prerequisite: undefined, description: 'You gain proficiency in any combination of three skills or tools of your choice. Repeatable. You can take this feat more than once.' },
  { id: 'ability-score-improvement', name: 'Ability Score Improvement', category: 'general', prerequisite: 'Level 4+', description: 'Increase one ability score of your choice by 2, or increase two ability scores of your choice by 1. This feat can’t increase an ability score above 20. Repeatable. You can take this feat more than once.' },
  { id: 'grappler', name: 'Grappler', category: 'general', prerequisite: 'Level 4+, Strength or Dexterity 13+', description: 'You gain the following benefits. Ability Score Increase. Increase your Strength or Dexterity score by 1, to a maximum of 20. Punch and Grab. When you hit a creature with an Unarmed Strike as part of the Attack action on your turn, you can use both the Damage and the Grapple option. You can use this benefit only once per turn. Attack Advantage. You have Advantage on attack rolls against a creature Grappled by you. Fast Wrestler. You don’t have to spend extra movement to move a creature Grappled by you if the creature is your size or smaller.' },
  { id: 'archery', name: 'Archery', category: 'fighting-style', prerequisite: 'Fighting Style Feature', description: 'You gain a +2 bonus to attack rolls you make with Ranged weapons.' },
  { id: 'defense', name: 'Defense', category: 'fighting-style', prerequisite: 'Fighting Style Feature', description: 'While you’re wearing Light, Medium, or Heavy armor, you gain a +1 bonus to Armor Class.' },
  { id: 'great-weapon-fighting', name: 'Great Weapon Fighting', category: 'fighting-style', prerequisite: 'Fighting Style Feature', description: 'When you roll damage for an attack you make with a Melee weapon that you are holding with two hands, you can treat any 1 or 2 on a damage die as a 3. The weapon must have the Two-Handed or Versatile property to gain this benefit.' },
  { id: 'two-weapon-fighting', name: 'Two-Weapon Fighting', category: 'fighting-style', prerequisite: 'Fighting Style Feature', description: 'When you make an extra attack as a result of using a weapon that has the Light property, you can add your ability modifier to the damage of that attack if you aren’t already adding it to the damage.' },
  { id: 'boon-of-combat-prowess', name: 'Boon of Combat Prowess', category: 'epic-boon', prerequisite: 'Level 19+', description: 'You gain the following benefits. Ability Score Increase. Increase one ability score of your choice by 1, to a maximum of 30. Peerless Aim. When you miss with an attack roll, you can hit instead. Once you use this benefit, you can’t use it again until the start of your next turn.' },
  { id: 'boon-of-dimensional-travel', name: 'Boon of Dimensional Travel', category: 'epic-boon', prerequisite: 'Level 19+', description: 'You gain the following benefits. Ability Score Increase. Increase one ability score of your choice by 1, to a maximum of 30. Blink Steps. Immediately after you take the Attack action or the Magic action, you can teleport up to 30 feet to an unoccupied space you can see.' },
  { id: 'boon-of-fate', name: 'Boon of Fate', category: 'epic-boon', prerequisite: 'Level 19+', description: 'You gain the following benefits. Ability Score Increase. Increase one ability score of your choice by 1, to a maximum of 30. Improve Fate. When you or another creature within 60 feet of you succeeds on or fails a D20 Test, you can roll 2d4 and apply the total rolled as a bonus or penalty to the d20 roll. Once you use this benefit, you can’t use it again until you roll Initiative or finish a Short or Long Rest.' },
  { id: 'boon-of-irresistible-offense', name: 'Boon of Irresistible Offense', category: 'epic-boon', prerequisite: 'Level 19+', description: 'You gain the following benefits. Ability Score Increase. Increase your Strength or Dexterity score by 1, to a maximum of 30. Overcome Defenses. The Bludgeoning, Piercing, and Slashing damage you deal always ignores Resistance. Overwhelming Strike. When you roll a 20 on the d20 for an attack roll, you can deal extra damage to the target equal to the ability score increased by this feat. The extra damage’s type is the same as the attack’s type.' },
  { id: 'boon-of-spell-recall', name: 'Boon of Spell Recall', category: 'epic-boon', prerequisite: 'Level 19+, Spellcasting Feature', description: 'You gain the following benefits. Ability Score Increase. Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 30. Free Casting. Whenever you cast a spell with a level 1–4 spell slot, roll 1d4. If the number you roll is the same as the slot’s level, the slot isn’t expended.' },
  { id: 'boon-of-the-night-spirit', name: 'Boon of the Night Spirit', category: 'epic-boon', prerequisite: 'Level 19+', description: 'You gain the following benefits. Ability Score Increase. Increase one ability score of your choice by 1, to a maximum of 30. Merge with Shadows. While within Dim Light or Darkness, you can give yourself the Invisible condition as a Bonus Action. The condition ends on you immediately after you take an action, a Bonus Action, or a Reaction. Shadowy Form. While within Dim Light or Darkness, you have Resistance to all damage except Psychic and Radiant.' },
  { id: 'boon-of-truesight', name: 'Boon of Truesight', category: 'epic-boon', prerequisite: 'Level 19+', description: 'You gain the following benefits. Ability Score Increase. Increase one ability score of your choice by 1, to a maximum of 30. Truesight. You have Truesight with a range of 60 feet.' },
]

/** Talenti di una categoria, nell'ordine in cui li stampa il manuale. */
export function getFeatsByCategory(category: FeatCategory): Dnd2024Feat[] {
  return dnd2024Feats.filter(f => f.category === category)
}

export function getDnd2024Feat(id: string): Dnd2024Feat | undefined {
  return dnd2024Feats.find(f => f.id === id)
}
