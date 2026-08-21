import type { Background } from '../dnd5e/backgrounds'

export const brancaloniaBackgrounds: readonly Background[] = [
  // ─── Ambulant (Ambulante) ─────────────────────────────────────────
  {
    id: 'ambulant',
    name: 'Ambulant',
    nameOriginal: 'Ambulante',
    description:
      'You are a drifter, a wanderer with no fixed address and no particular destination. You have traveled every road, slept under every bridge, and eaten at every roadside tavern in the Boot. Your life is one of constant movement, and you have learned to survive by your wits and your charm. You know how to talk your way into a warm meal and how to read the land for shelter and sustenance.',
    skillProficiencies: ['performance', 'history'],
    toolProficiencies: ["A set of artisan's tools (one of your choice)"],
    languages: 1,
    equipment: [
      'A jewel dedicated to Saint Pathrick',
      'A set of traveler\'s clothes',
      'A pouch containing 15 sp',
    ],
    feature: {
      name: 'Tales of the Road',
      description:
        'Whatever group, profession or community you belong to, like any other ambulant you know a great many legends, rumors and tales collected on the road and gathered over the years. Whenever you collect one or more rumors you get an additional one, and you always have advantage on checks related to finding or travelling the Roads to Nowhere.',
    },
  },

  // ─── Brawler (Attaccabrighe) ──────────────────────────────────────
  {
    id: 'brawler',
    name: 'Brawler',
    nameOriginal: 'Attaccabrighe',
    description:
      'You are a street fighter, born and bred in the rough quarters of a Brancalonian city. You grew up settling disputes with your fists and learned early that the best defense is a good headbutt. Whether in organized fighting pits or back-alley brawls, you have earned a reputation as someone not to be trifled with. Your body bears the scars of countless scraps.',
    skillProficiencies: ['insight', 'performance'],
    toolProficiencies: ['Two types of gaming set'],
    languages: 0,
    equipment: [
      'A brawl trophy (roll an additional Memorabilia)',
      'A map listing all the Dives in your hometown',
      'A set of common clothes',
      'A pouch containing 15 sp',
    ],
    feature: {
      name: 'Brawler',
      description:
        'You have mastered the lore of the taverns and inns where the sacred art of brawling was born. All that revelry and bare-handed fighting made you the formidable brawler of rare hubris you are today. You gain 1 additional move slot.',
    },
  },

  // ─── Finagler (Azzeccagarbugli) ───────────────────────────────────
  {
    id: 'finagler',
    name: 'Finagler',
    nameOriginal: 'Azzeccagarbugli',
    description:
      'You are a bureaucrat, a fixer, a professional navigator of red tape. You know how to grease palms, forge documents, and exploit every loophole in the complex and contradictory laws of Brancalonia. Whether working as a minor official, a notary, or a full-time confidence artist, you have mastered the art of making things happen -- for a fee.',
    skillProficiencies: ['investigation', 'persuasion'],
    toolProficiencies: ['Forgery kit'],
    languages: 1,
    equipment: [
      'A copy of your home region\'s book of laws',
      'A bottle of black ink and a pen',
      'A parchment',
      'A set of fine clothes',
      'A pouch containing 20 sp',
    ],
    feature: {
      name: 'Trouble Solver',
      description:
        'You know the laws of the Kingdom and the mechanisms behind the functioning — or malfunctioning — of its Justice inside out, which makes you the right Knave for \'fixing\' legal disputes that are not too serious. You can remove one of your Misdeeds, or one belonging to a member of your company, by paying a cost equal to the Bounty value of that Misdeed. You must do so before the authorities add the Misdeed to the character\'s Bounty.',
    },
  },

  // ─── Fugitive (Fuggitivo) ─────────────────────────────────────────
  {
    id: 'fugitive',
    name: 'Fugitive',
    nameOriginal: 'Fuggitivo',
    description:
      'You are on the run. Whether from the law, a vengeful lord, a scorned lover, or debts you cannot pay, you have learned to live in the shadows. You know how to change your appearance, cover your tracks, and disappear into a crowd. Every town is a temporary refuge, every face a potential threat. Trust is a luxury you cannot afford.',
    skillProficiencies: ['stealth', 'survival'],
    toolProficiencies: [],
    languages: 1,
    equipment: [
      'A dagger',
      'A memento from your past life',
      'A set of traveler\'s clothes',
      'A pouch containing 10 sp',
    ],
    feature: {
      name: 'Outcast',
      description:
        'Your Bounty is higher than usual because of a serious misdeed that has been attributed to you, fairly or unfairly, along with a few aggravating factors: evasion, desertion, betrayal, interrupting a public execution, resisting arrest, assaulting a guard, sedition, riot, brigandage or pillage.',
    },
  },

  // ─── Rover (Brado) ────────────────────────────────────────────────
  {
    id: 'rover',
    name: 'Rover',
    nameOriginal: 'Brado',
    description:
      'You are a traveling performer -- a juggler, acrobat, puppeteer, fire-eater, or some combination thereof. You have performed in every piazza, festival, and market square in the Boot. Your life is one of spectacle and applause, but also of hunger and uncertainty. You know how to work a crowd and how to pass the hat when the show is done.',
    skillProficiencies: ['animal-handling', 'athletics'],
    toolProficiencies: ['Herbalism kit'],
    languages: 1,
    equipment: [
      'A staff',
      'An animal bone pendant',
      'Colored pigments',
      'A set of traveler\'s clothes',
      'A pouch containing 10 sp',
    ],
    feature: {
      name: 'Wild Comfort',
      description:
        'You know how to move with respect for the creatures that inhabit the wildlands, and that awareness spares you unpleasant encounters. You and up to five other people can travel across any wild territory without running into hostile beasts. Other kinds of encounter are unaffected.',
    },
  },

  // ─── Tough (Duro) ─────────────────────────────────────────────────
  {
    id: 'tough',
    name: 'Tough',
    nameOriginal: 'Duro',
    description:
      'You are a hardened survivor, forged by a life of unrelenting difficulty. Whether you grew up in the slums, served time in a prison, or survived a brutal occupation, you have come out the other side tougher and more watchful than most. Nothing surprises you anymore. You have seen the worst that people can do, and you are always prepared for it.',
    skillProficiencies: ['athletics', 'intimidation'],
    toolProficiencies: ['One type of gaming set'],
    languages: 1,
    equipment: [
      'A pendant of Saint Marauda',
      'A poppycock card deck or another game',
      'A set of common clothes',
      'A pouch containing 15 sp',
    ],
    feature: {
      name: 'Tough Face',
      description:
        'You look so damn tough and intimidating that everyone you meet realizes straight away that you\'re no joke. When you interact with others using your Notoriety, you count it as one level higher.',
    },
  },
] as const

export function getBrancaloniaBackgroundById(id: string): Background | undefined {
  return brancaloniaBackgrounds.find(b => b.id === id)
}
