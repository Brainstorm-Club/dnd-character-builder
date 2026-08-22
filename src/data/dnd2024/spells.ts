// Scostamenti delle liste incantesimi fra il 2014 e il 2024.
//
// L'SRD 5.2.1 ha rimescolato parecchie liste di classe: 58 incantesimi che
// l'app già possiede cambiano le classi che possono lanciarli, e 2
// sono usciti dall'SRD. Invece di duplicare 317 incantesimi, la variante 2024
// riusa quelli esistenti applicando queste differenze.
//
// NOTA: 23 incantesimi presenti nell'SRD 5.2.1 non sono ancora nei dati
// dell'app; per quelli la lista 2024 resta incompleta.

import type { Spell } from '../dnd5e/spells'

/** Liste di classe 2024 per gli incantesimi che le cambiano rispetto al 2014. */
const CLASS_OVERRIDES: Record<string, string[]> = {
  'Aid': ['bard', 'cleric', 'druid', 'paladin', 'ranger'],
  'Antipathy/Sympathy': ['bard', 'druid', 'wizard'],
  'Arcane Hand': ['sorcerer', 'wizard'],
  'Augury': ['cleric', 'druid', 'wizard'],
  'Bane': ['bard', 'cleric', 'warlock'],
  'Color Spray': ['bard', 'sorcerer', 'wizard'],
  'Command': ['bard', 'cleric', 'paladin'],
  'Cone of Cold': ['druid', 'sorcerer', 'wizard'],
  'Conjure Fey': ['druid'],
  'Continual Flame': ['cleric', 'druid', 'wizard'],
  'Demiplane': ['sorcerer', 'warlock', 'wizard'],
  'Detect Magic': ['bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'warlock', 'wizard'],
  'Dispel Magic': ['bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'warlock', 'wizard'],
  'Divination': ['cleric', 'druid'],
  'Dominate Beast': ['druid', 'ranger', 'sorcerer'],
  'Enhance Ability': ['bard', 'cleric', 'druid', 'ranger', 'sorcerer', 'wizard'],
  'Enlarge/Reduce': ['bard', 'druid', 'sorcerer', 'wizard'],
  'Entangle': ['druid', 'ranger'],
  'Fire Shield': ['druid', 'sorcerer', 'wizard'],
  'Flame Blade': ['druid', 'sorcerer'],
  'Flaming Sphere': ['druid', 'sorcerer', 'wizard'],
  'Flesh to Stone': ['druid', 'sorcerer', 'wizard'],
  'Freezing Sphere': ['sorcerer', 'wizard'],
  'Gate': ['cleric', 'sorcerer', 'warlock', 'wizard'],
  'Gentle Repose': ['cleric', 'paladin', 'wizard'],
  'Grease': ['sorcerer', 'wizard'],
  'Greater Restoration': ['bard', 'cleric', 'druid', 'paladin', 'ranger'],
  'Gust of Wind': ['druid', 'ranger', 'sorcerer', 'wizard'],
  'Heroes\' Feast': ['bard', 'cleric', 'druid'],
  'Hideous Laughter': ['bard', 'warlock', 'wizard'],
  'Incendiary Cloud': ['druid', 'sorcerer', 'wizard'],
  'Magic Weapon': ['paladin', 'ranger', 'sorcerer', 'wizard'],
  'Mass Healing Word': ['bard', 'cleric'],
  'Mass Suggestion': ['bard', 'sorcerer', 'wizard'],
  'Meld into Stone': ['cleric', 'druid', 'ranger'],
  'Message': ['bard', 'druid', 'sorcerer', 'wizard'],
  'Mirror Image': ['bard', 'sorcerer', 'warlock', 'wizard'],
  'Mislead': ['bard', 'warlock', 'wizard'],
  'Phantasmal Killer': ['bard', 'wizard'],
  'Planar Binding': ['bard', 'cleric', 'druid', 'warlock', 'wizard'],
  'Prayer of Healing': ['cleric', 'paladin'],
  'Prismatic Spray': ['bard', 'sorcerer', 'wizard'],
  'Prismatic Wall': ['bard', 'wizard'],
  'Protection from Evil and Good': ['cleric', 'druid', 'paladin', 'warlock', 'wizard'],
  'Revivify': ['cleric', 'druid', 'paladin', 'ranger'],
  'Shatter': ['bard', 'sorcerer', 'wizard'],
  'Slow': ['bard', 'sorcerer', 'wizard'],
  'Spare the Dying': ['cleric', 'druid'],
  'Speak with Animals': ['bard', 'druid', 'ranger', 'warlock'],
  'Speak with Dead': ['bard', 'cleric', 'wizard'],
  'Sunbeam': ['cleric', 'druid', 'sorcerer', 'wizard'],
  'Sunburst': ['cleric', 'druid', 'sorcerer', 'wizard'],
  'Symbol': ['bard', 'cleric', 'druid', 'wizard'],
  'Telepathic Bond': ['bard', 'wizard'],
  'Teleportation Circle': ['bard', 'sorcerer', 'warlock', 'wizard'],
  'Vampiric Touch': ['sorcerer', 'warlock', 'wizard'],
  'Warding Bond': ['cleric', 'paladin'],
  'Weird': ['warlock', 'wizard'],
}

/** Incantesimi usciti dall'SRD nel passaggio al 2024. */
const REMOVED_IN_2024 = new Set<string>(['Blade Ward', 'Feeblemind'])

/** Applica gli scostamenti 2024 alla lista incantesimi di base. */
export function toDnd2024Spells(base: readonly Spell[]): Spell[] {
  return base
    .filter(s => !REMOVED_IN_2024.has(s.name))
    .map(s => {
      const classes = CLASS_OVERRIDES[s.name]
      return classes ? { ...s, classes } : s
    })
}

export const dnd2024SpellListChanges = {
  overridden: Object.keys(CLASS_OVERRIDES).length,
  removed: REMOVED_IN_2024.size,
}
