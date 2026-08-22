// Padronanza d'armi — System Reference Document 5.2.1 (CC-BY-4.0).
//
// Sottosistema che nel 2014 non esiste. Ogni arma ha una proprietà di
// padronanza, utilizzabile solo da chi ha un privilegio che la sblocca:
// barbaro, guerriero, ladro, paladino e ranger ce l'hanno dal 1° livello.
//
// I nomi italiani vengono dall'edizione italiana dell'SRD 5.2.1.

export interface MasteryProperty {
  id: string
  name: string
  nameIt: string
  description: string
}

export const masteryProperties: readonly MasteryProperty[] = [
  { id: 'cleave', name: 'Cleave', nameIt: 'Sconquasso', description: 'If you hit a creature with a melee attack roll using this weapon, you can make a melee attack roll with the weapon against a second creature within 5 feet of the first that is also within your reach. On a hit, the second creature takes the weapon’s damage, but don’t add your ability modifier to that damage unless that modifier is negative. You can make this extra attack only once per turn.' },
  { id: 'graze', name: 'Graze', nameIt: 'Sfregio', description: 'If your attack roll with this weapon misses a creature, you can deal damage to that creature equal to the ability modifier you used to make the attack roll. This damage is the same type dealt by the weapon, and the damage can be increased only by increasing the ability modifier.' },
  { id: 'nick', name: 'Nick', nameIt: 'Colpetto', description: 'When you make the extra attack of the Light property, you can make it as part of the Attack action instead of as a Bonus Action. You can make this extra attack only once per turn.' },
  { id: 'push', name: 'Push', nameIt: 'Spinta', description: 'If you hit a creature with this weapon, you can push the creature up to 10 feet straight away from yourself if it is Large or smaller.' },
  { id: 'sap', name: 'Sap', nameIt: 'Fiacca', description: 'If you hit a creature with this weapon, that creature has Disadvantage on its next attack roll before the start of your next turn.' },
  { id: 'slow', name: 'Slow', nameIt: 'Rallenta', description: 'If you hit a creature with this weapon and deal damage to it, you can reduce its Speed by 10 feet until the start of your next turn. If the creature is hit more than once by weapons that have this property, the Speed reduction doesn’t exceed 10 feet.' },
  { id: 'topple', name: 'Topple', nameIt: 'Ribalta', description: 'If you hit a creature with this weapon, you can force the creature to make a Constitution saving throw (DC 8 plus the ability modifier used to make the attack roll and your Proficiency Bonus). On a failed , save, the creature has the Prone condition.' },
  { id: 'vex', name: 'Vex', nameIt: 'Molesta', description: 'If you hit a creature with this weapon and deal damage to the creature, you have Advantage on your next attack roll against that creature before the end of your next turn. Weapons Name Damage Properties Simple Melee Weapons Club 1d4 Bludgeoning Light Dagger 1d4 Piercing Finesse, Light, Th Greatclub 1d8 Bludgeoning Two-Handed Handaxe 1d6 Slashing Light, Thrown (Ran Javelin 1d6 Piercing Thrown (Range 30/1 Light Hammer ' },
]

/** Proprietà di padronanza di ciascuna arma, per nome dell'arma. */
export const weaponMastery: Record<string, string> = {
  'Battleaxe': 'topple',
  'Blowgun': 'vex',
  'Club': 'slow',
  'Dagger': 'nick',
  'Dart': 'vex',
  'Flail': 'sap',
  'Glaive': 'graze',
  'Greataxe': 'cleave',
  'Greatclub': 'push',
  'Greatsword': 'graze',
  'Halberd': 'cleave',
  'Hand Crossbow': 'vex',
  'Handaxe': 'vex',
  'Heavy Crossbow': 'push',
  'Javelin': 'slow',
  'Lance': 'topple',
  'Light Crossbow': 'slow',
  'Light Hammer': 'nick',
  'Longbow': 'slow',
  'Longsword': 'sap',
  'Mace': 'sap',
  'Maul': 'topple',
  'Morningstar': 'sap',
  'Pike': 'push',
  'Quarterstaff': 'topple',
  'Rapier': 'vex',
  'Scimitar': 'nick',
  'Shortbow': 'vex',
  'Shortsword': 'vex',
  'Sickle': 'nick',
  'Sling': 'slow',
  'Spear': 'sap',
  'Trident': 'topple',
  'War Pick': 'sap',
  'Warhammer': 'push',
  'Whip': 'slow',
}

export function getMasteryProperty(id: string): MasteryProperty | undefined {
  return masteryProperties.find(p => p.id === id)
}

/** Proprietà di padronanza di un'arma, se ne ha una. */
export function getWeaponMastery(weaponName: string): MasteryProperty | undefined {
  const id = weaponMastery[weaponName]
  return id ? getMasteryProperty(id) : undefined
}
