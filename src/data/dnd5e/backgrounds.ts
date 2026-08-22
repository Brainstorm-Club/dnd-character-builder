export interface BackgroundFeature {
  name: string
  description: string
}

export interface Background {
  id: string
  name: string
  nameOriginal?: string
  description: string
  /** Competenze concesse d'ufficio */
  skillProficiencies: string[]
  /**
   * Competenze a scelta. Le Origini di Apocalisse concedono per esempio
   * "due fra Arcano, Medicina, Natura...": `from` vuoto significa una
   * qualsiasi abilità.
   */
  skillChoices?: { count: number; from: string[] }[]
  toolProficiencies: string[]
  languages: number
  equipment: string[]
  feature: BackgroundFeature
  suggestedCharacteristics?: {
    personalityTraits: string[]
    ideals: string[]
    bonds: string[]
    flaws: string[]
  }
}


const baseBackgrounds: readonly Background[] = [
  {
    id: 'acolyte',
    name: 'Acolyte',
    description: 'You have spent your life in the service of a temple to a specific god or pantheon of gods.',
    skillProficiencies: ['insight', 'religion'],
    toolProficiencies: [],
    languages: 2,
    equipment: ['Holy symbol', 'Prayer book or prayer wheel', 'Vestments', '5 sticks of incense', '15 gp'],
    feature: {
      name: 'Shelter of the Faithful',
      description: 'As an acolyte, you command the respect of those who share your faith, and you can perform the religious ceremonies of your deity.',
    },
  },
  {
    id: 'charlatan',
    name: 'Charlatan',
    description: 'You have always had a way with people. You can read their moods, their desires, and quickly find your way to their hearts.',
    skillProficiencies: ['deception', 'sleight-of-hand'],
    toolProficiencies: ['Disguise kit', 'Forgery kit'],
    languages: 0,
    equipment: ['Fine clothes', 'Disguise kit', 'Tools of the con (ten stoppered bottles filled with colored liquid, a weighted die set, a deck of marked cards, or a signet ring of an imaginary duke)', '15 gp'],
    feature: {
      name: 'False Identity',
      description: 'You have created a second identity that includes documentation, established acquaintances, and disguises that allow you to assume that persona.',
    },
  },
  {
    id: 'criminal',
    name: 'Criminal',
    description: 'You are an experienced criminal with a history of breaking the law.',
    skillProficiencies: ['deception', 'stealth'],
    toolProficiencies: ['Gaming set', 'Thieves\' tools'],
    languages: 0,
    equipment: ['Crowbar', 'Dark common clothes with hood', '15 gp'],
    feature: {
      name: 'Criminal Contact',
      description: 'You have a reliable and trustworthy contact who acts as your liaison to a network of other criminals.',
    },
  },
  {
    id: 'entertainer',
    name: 'Entertainer',
    description: 'You thrive in front of an audience. You know how to entrance them, entertain them, and even inspire them.',
    skillProficiencies: ['acrobatics', 'performance'],
    toolProficiencies: ['Disguise kit', 'Musical instrument'],
    languages: 0,
    equipment: ['Musical instrument', 'Favor of an admirer', 'Costume', '15 gp'],
    feature: {
      name: 'By Popular Demand',
      description: 'You can always find a place to perform, receiving free lodging and food in exchange for performing each night.',
    },
  },
  {
    id: 'folk-hero',
    name: 'Folk Hero',
    description: 'You come from a humble social rank, but you are destined for so much more.',
    skillProficiencies: ['animal-handling', 'survival'],
    toolProficiencies: ['Artisan\'s tools', 'Vehicles (land)'],
    languages: 0,
    equipment: ['Artisan\'s tools', 'Shovel', 'Iron pot', 'Common clothes', '10 gp'],
    feature: {
      name: 'Rustic Hospitality',
      description: 'Since you come from the ranks of the common folk, you fit in among them with ease. You can find a place to hide, rest, or recuperate among commoners.',
    },
  },
  {
    id: 'hermit',
    name: 'Hermit',
    description: 'You lived in seclusion, either in a sheltered community or entirely alone, for a formative part of your life.',
    skillProficiencies: ['medicine', 'religion'],
    toolProficiencies: ['Herbalism kit'],
    languages: 1,
    equipment: ['Scroll case full of notes', 'Winter blanket', 'Herbalism kit', 'Common clothes', '5 gp'],
    feature: {
      name: 'Discovery',
      description: 'The quiet seclusion of your extended hermitage gave you access to a unique and powerful discovery.',
    },
  },
  {
    id: 'noble',
    name: 'Noble',
    description: 'You understand wealth, power, and privilege.',
    skillProficiencies: ['history', 'persuasion'],
    toolProficiencies: ['Gaming set'],
    languages: 1,
    equipment: ['Fine clothes', 'Signet ring', 'Scroll of pedigree', '25 gp'],
    feature: {
      name: 'Position of Privilege',
      description: 'Thanks to your noble birth, people are inclined to think the best of you. You are welcome in high society.',
    },
  },
  {
    id: 'outlander',
    name: 'Outlander',
    description: 'You grew up in the wilds, far from civilization and the comforts of town and technology.',
    skillProficiencies: ['athletics', 'survival'],
    toolProficiencies: ['Musical instrument'],
    languages: 1,
    equipment: ['Staff', 'Hunting trap', 'Trophy from animal you killed', 'Traveler\'s clothes', '10 gp'],
    feature: {
      name: 'Wanderer',
      description: 'You have an excellent memory for maps and geography, and you can always recall the general layout of terrain.',
    },
  },
  {
    id: 'sage',
    name: 'Sage',
    description: 'You spent years learning the lore of the multiverse.',
    skillProficiencies: ['arcana', 'history'],
    toolProficiencies: [],
    languages: 2,
    equipment: ['Bottle of black ink', 'Quill', 'Small knife', 'Letter from a dead colleague', 'Common clothes', '10 gp'],
    feature: {
      name: 'Researcher',
      description: 'When you attempt to learn or recall a piece of lore, if you do not know that information, you often know where and from whom you can obtain it.',
    },
  },
  {
    id: 'soldier',
    name: 'Soldier',
    description: 'War has been your life for as long as you care to remember.',
    skillProficiencies: ['athletics', 'intimidation'],
    toolProficiencies: ['Gaming set', 'Vehicles (land)'],
    languages: 0,
    equipment: ['Insignia of rank', 'Trophy taken from a fallen enemy', 'Bone dice set or playing card set', 'Common clothes', '10 gp'],
    feature: {
      name: 'Military Rank',
      description: 'You have a military rank from your career as a soldier. Soldiers loyal to your former military organization still recognize your authority.',
    },
  },
  // ─── Guild Artisan ────────────────────────────────────────────────
  {
    id: 'guild-artisan',
    name: 'Guild Artisan',
    description:
      "You are a member of an artisan's guild, skilled in a particular field and closely associated with other artisans. You are a well-established part of the mercantile world, freed by talent and wealth from the constraints of a feudal social order. You learned your skills as an apprentice to a master artisan, under the sponsorship of your guild.",
    skillProficiencies: ['insight', 'persuasion'],
    toolProficiencies: ["One type of artisan's tools"],
    languages: 1,
    equipment: [
      "A set of artisan's tools (one of your choice)",
      'A letter of introduction from your guild',
      "A set of traveler's clothes",
      'A belt pouch containing 15 gp',
    ],
    feature: {
      name: 'Guild Membership',
      description:
        'As an established and respected member of a guild, you can rely on certain benefits that membership provides. Your fellow guild members will provide you with lodging and food if necessary, and pay for your funeral if needed. In some cities and towns, a guildhall offers a central place to meet other members of your profession. Guilds often wield tremendous political power, and if you are accused of a crime your guild will support you if a good case can be made for your innocence.',
    },
  },

  // ─── Sailor ───────────────────────────────────────────────────────
  {
    id: 'sailor',
    name: 'Sailor',
    description:
      'You sailed on a seagoing vessel for years. In that time, you faced down mighty storms, monsters of the deep, and those who wanted to sink your craft to the bottomless depths. Your first love is the distant line of the horizon, but the time has come to try your hand at something new.',
    skillProficiencies: ['athletics', 'perception'],
    toolProficiencies: ["Navigator's tools", 'Vehicles (water)'],
    languages: 0,
    equipment: [
      'A belaying pin (club)',
      '50 feet of silk rope',
      "A lucky charm such as a rabbit's foot or a small stone with a hole in the center",
      'A set of common clothes',
      'A belt pouch containing 10 gp',
    ],
    feature: {
      name: "Ship's Passage",
      description:
        'When you need to, you can secure free passage on a sailing ship for yourself and your adventuring companions. You might sail on the ship you served on, or another ship you have good relations with. Because you are calling in a favor, you cannot be certain of a schedule or route, and in return you and your companions are expected to assist the crew during the voyage.',
    },
  },

  // ─── Urchin ───────────────────────────────────────────────────────
  {
    id: 'urchin',
    name: 'Urchin',
    description:
      'You grew up on the streets alone, orphaned and poor. You had no one to watch over you or to provide for you, so you learned to provide for yourself. You fought fiercely over food and kept a constant watch out for other desperate souls who might steal from you. You slept on rooftops and in alleyways, and survived despite all odds.',
    skillProficiencies: ['sleight-of-hand', 'stealth'],
    toolProficiencies: ['Disguise kit', "Thieves' tools"],
    languages: 0,
    equipment: [
      'A small knife',
      'A map of the city you grew up in',
      'A pet mouse',
      'A token to remember your parents by',
      'A set of common clothes',
      'A belt pouch containing 10 gp',
    ],
    feature: {
      name: 'City Secrets',
      description:
        'You know the secret patterns and flow of cities and can find passages through the urban sprawl that others would miss. When you are not in combat, you and the companions you lead can travel between any two locations in the city twice as fast as your speed would normally allow.',
    },
  },
] as const

/** All backgrounds, transcribed from the Player's Handbook. */
export const backgrounds: readonly Background[] = baseBackgrounds

export function getBackgroundById(id: string): Background | undefined {
  return backgrounds.find(b => b.id === id)
}
