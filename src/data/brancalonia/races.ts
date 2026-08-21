import type { Race } from '../dnd5e/races'

export const brancaloniaRaces: readonly Race[] = [
  // ═══ Brancalonia Setting Book ═════════════════════════════════════

  // ─── Human (Umano) ────────────────────────────────────────────────
  {
    id: 'human',
    name: 'Human',
    nameOriginal: 'Umano',
    description:
      'Nine out of ten people you meet in the Kingdom are human. The salt of the earth and the cannon fodder of every war, they are the village people and the mercenaries, those who harvest the cotton, the rice and the wheat. Along with their more common variants — sylvans, gifted and morgants — humans believe themselves the only self-aware species in the known world, all the others having magical or supernatural origins. Pantegans, mandrakes and wolfcats disagree entirely.',
    abilityBonuses: {},
    abilityScoreChoice: [{ count: 2, amount: 1 }],
    speed: 30,
    size: 'Medium',
    traits: [
      'skill-choice',
      'feat-choice',
      'brawl-versatility',
    ],
    languages: ['Vernacular'],
    subraces: [],
  },

  // ─── Gifted (Dotato) ──────────────────────────────────────────────
  {
    id: 'gifted',
    name: 'Gifted',
    nameOriginal: 'Dotato',
    description:
      'Gifted are not a species distinct from humans but humans born with, or touched during their lifetime by, a supernatural talent — and they usually bear a visible mark of it. Traditions differ on where the gift comes from: descent from a malebranche, a special planetary conjunction, being a seventh child, born with a caul or prematurely, blessed by a saint, exchanged in the cradle, born during a storm, chosen by the fairies, or simply because their mother sneezed in the wrong direction. Commoners meet them with mistrust as often as with reverence — a talent like that could mean a heretic, or a blessing.',
    abilityBonuses: {},
    abilityScoreChoice: [{ count: 2, amount: 1 }],
    speed: 30,
    size: 'Medium',
    traits: [
      'magical-influence',
      'magical-resonance',
      'brawl-magical-adaptation',
    ],
    languages: ['Vernacular'],
    subraces: [],
  },

  // ─── Malebranche (Malebranche) ────────────────────────────────────
  {
    id: 'malebranche',
    name: 'Malebranche',
    nameOriginal: 'Malebranche',
    description:
      'Former subjects of Lucifuge who rebelled and left Inferno to see the stars again — the Great Refusal. The first was the legendary Diavolmanno, the "Great Human Devil", who afterwards found work as a circus attraction; several hundred of the damned have followed his example since. They incarnate in bodies very close to human physiology but keep their bestial features, and the Great Beast looks upon these "twice-rebels" with hatred. Then again, the Great Beast looks at everyone like that, so who gives a damn.',
    abilityBonuses: { con: 1, cha: 2 },
    speed: 30,
    size: 'Medium',
    traits: [
      'darkvision',
      'brawl-hellbrawl',
      'infernal-helltraits',
    ],
    languages: ['Vernacular'],
    subraces: [],
  },

  // ─── Marionette (Marionetta) ──────────────────────────────────────
  {
    id: 'marionette',
    name: 'Marionette',
    nameOriginal: 'Marionetta',
    description:
      'Sentient puppets carved from triflewood, born at the moment of their manufacture with whatever age the carpenter gave them. In the old days people took them for feys and miraculous beings; these days they are mostly employed as entertainers, actors and musicians, which has won them widespread acceptance and done them a bad service at the same time — most commoners see them as buffoons and heckle them with "Make us laugh, puppet" for their whole lives. Their most ancient and powerful dynasty is that of the Cherries, celebrated puppeteers in their own right.',
    abilityBonuses: { dex: 1, con: 1 },
    speed: 25,
    size: 'Small',
    traits: [
      'triflewood-construct',
      'magical-but-still-made-of-wood',
      'self-mending',
      'brawl-removable-limb',
      'different-shapes',
    ],
    languages: ['Vernacular'],
    subraces: [
      // ── Brancalonia Setting Book ──
      {
        id: 'pinocchio',
        name: 'Pinocchio',
        abilityBonuses: { cha: 1 },
        traits: ['gullible'],
      },
      {
        id: 'pupo',
        name: 'Pupo',
        abilityBonuses: {},
        traits: ['integrated-armor'],
      },
      // ── Macaronicon ──
      {
        id: 'cabin-doll',
        name: 'Cabin Doll',
        abilityBonuses: {},
        traits: ['nautical', 'wind-and-water'],
      },
      {
        id: 'saintlet',
        name: 'Saintlet',
        abilityBonuses: { wis: 1 },
        traits: ['in-saints-image-and-likeness'],
      },
    ],
  },

  // ─── Morgant (Morgante) ───────────────────────────────────────────
  {
    id: 'morgant',
    name: 'Morgant',
    nameOriginal: 'Morgante',
    description:
      'Commonly considered demi-giants, though whether they truly descend from giants remains a mystery. Typically seven to nine feet tall, morgants are famous for their binging, their drinking and their brawling, and armies enlist them as champions and stormtroopers — so everyone takes them for formidable raiders and dealers of slaps. Truth be told they are meek and accommodating, closer in disposition to cattle than to bloodthirsty predators. But of course, Inferno knows no fury like a good person turned bad.',
    abilityBonuses: { str: 2, con: 2 },
    speed: 30,
    size: 'Medium',
    traits: [
      'gargantuan',
      'sturdy-as-a-rock',
      'cast-iron-stomach',
      'brawl-towering',
    ],
    languages: ['Vernacular'],
    subraces: [],
  },

  // ─── Sylvan (Silvano) ─────────────────────────────────────────────
  {
    id: 'sylvan',
    name: 'Sylvan',
    nameOriginal: 'Selvatico',
    description:
      'The last specimens of a race of hominids more feral and rustic than the common human, with much thicker body hair, more agile and muscular bodies, fiercer features and tougher mettle. The difference is almost entirely cultural: sylvan tribes build no shelters of brick or stone, work no land and raise no livestock — they are hunter-gatherers who live in pristine wilderness. Their lore is oral, and they know as many stories and songs by heart as humans have ever written in books.',
    abilityBonuses: { con: 2, wis: 1 },
    abilityScoreChoice: [{ count: 1, amount: 1 }],
    speed: 30,
    size: 'Medium',
    traits: [
      'raised-in-the-forest',
      'primal-instinct',
      'brawl-tough-guy',
    ],
    languages: ['Vernacular'],
    subraces: [],
  },

  // ═══ Macaronicon ═══════════════════════════════════════════════════

  // ─── WolfCat (Gatto Lupesco) ──────────────────────────────────────
  {
    id: 'wolfcat',
    name: 'WolfCat',
    nameOriginal: 'Gatto Lupesco',
    description:
      'Probably spawned by Extravaganza, wolfcats have roamed the Kingdom since the early centuries of the Thousand Years\' War. The size of catpards and lynxes, they are felines that have adopted human-like posture, language and skills. Undressed and on all fours they look like ordinary cats; upright and civilized they are the equal of any human. They are known as skilled swordplayers, musicians and poets, proverbial for their pranks, their boastfulness and their sense of honor — and for the high-sounding, entirely fictitious titles they award themselves.',
    abilityBonuses: { dex: 2, cha: 1 },
    speed: 30,
    size: 'Small',
    traits: [
      'feline-darkvision',
      'scratch',
      'leap',
      'deceitful',
      'waterfear',
      'brawl-cat-burglar',
    ],
    languages: ['Vernacular'],
    subraces: [],
  },

  // ─── Nonexistent (Inesistente) ────────────────────────────────────
  {
    id: 'nonexistent',
    name: 'Nonexistent',
    nameOriginal: 'Inesistente',
    description:
      'A nonexistent looks like empty clothes, armor or a cloak wandering about on its own as a knight, paladin, thief or sorcerer. They cover themselves carefully so the void beneath the cape stays hidden, speak through some form of ventriloquism, and perceive the world through senses much like human ones. Remove or destroy their garments and a nonexistent is simply not there anymore. Pure abstract consciousness enclosed in cloth, they are famed for a will and a self-determination far firmer than that of beings made of flesh.',
    abilityBonuses: { con: 2 },
    abilityScoreChoice: [{ count: 1, amount: 1 }],
    speed: 30,
    size: 'Medium',
    traits: [
      'extravaganza-being',
      'antimagic-susceptibility',
      'dressing',
      'brawl-vanishing',
    ],
    languages: ['Vernacular'],
    subraces: [],
  },

  // ─── Pantegan (Pantegano) ─────────────────────────────────────────
  {
    id: 'pantegan',
    name: 'Pantegan',
    nameOriginal: 'Pantegano',
    description:
      'The "murine people": small rat-men of magical or paradoxical origin, with prominent ears and teeth, sharp faces, very thin hands and a characteristic hairless tail. Chronicles of the Archaic Age already mention a kingdom of mice, so pantegans have prowled the shores of the Middle Sea since the dawn of history. Today they live on the edge of fiefdoms and cities, particularly good at engineering, goldsmithing and precision craftsmanship, highly skilled at counterfeiting anything, and unmatched at exploring what lies underground.',
    abilityBonuses: { dex: 2, con: 1 },
    speed: 25,
    size: 'Small',
    traits: [
      'darkvision',
      'nimble-and-snappy',
      'rat-life',
      'live-fast',
      'flee-and-survive',
      'brawl-pantemime',
    ],
    languages: ['Vernacular'],
    subraces: [],
  },

  // ═══ L'Impero Randella Ancora ═════════════════════════════════════

  // ─── Arcimboldo (Arcimboldo) ──────────────────────────────────────
  {
    id: 'arcimboldo',
    name: 'Arcimboldo',
    nameOriginal: 'Arcimboldo',
    description:
      'An emerging consciousness sprung from a heap of assorted objects and bound to that heap: an arcimboldo is a walking still life. Vegetables, scrap metal or a wardrobe\'s worth of clothes assemble into a humanoid shape and start to think, talk and want things. Far from being a simple agglomeration of junk, an arcimboldo is a person in every sense — usually a cheerful companion or an endearing scoundrel, eager to see the world, and greeted in many dives and villages with cheers and curiosity.',
    abilityBonuses: { con: 2 },
    speed: 30,
    size: 'Medium',
    traits: [
      'construct-type',
      'jumble',
      'antimagic-susceptibility',
      'brawl-scavenger',
    ],
    languages: ['Vernacular'],
    subraces: [
      {
        id: 'orcharder',
        name: 'Orcharder',
        abilityBonuses: { wis: 1 },
        traits: ['extravagant-influence-orcharder', 'resistant-structure-piercing'],
      },
      {
        id: 'ragpicker',
        name: 'Ragpicker',
        abilityBonuses: { cha: 1 },
        traits: ['extravagant-influence-ragpicker', 'resistant-structure-bludgeoning'],
      },
      {
        id: 'scrapper',
        name: 'Scrapper',
        abilityBonuses: { str: 1 },
        traits: ['extravagant-influence-scrapper', 'resistant-structure-slashing'],
      },
    ],
  },

  // ─── Jackrabid (Bieconiglio) ──────────────────────────────────────
  {
    id: 'jackrabid',
    name: 'Jackrabid',
    nameOriginal: 'Bieconiglio',
    description:
      'Among the most stealthy and aggressive beings that came down into the Kingdom with the Imperial armies. Scholars call them lagomorphs or rabbitfolk; commoners call them worse. Jackrabids are always fighting, robbing, stalking or spying, and the Altomannian companies that recruit them expect them to charge from the front without flinching. Their entirely red eyes give them keen sight and a distinctly intimidating look.',
    abilityBonuses: { dex: 2, str: 1 },
    speed: 35,
    size: 'Small',
    traits: [
      'red-eyes',
      'unflinching',
      'rabid-fury',
      'natural-born-jumper',
      'born-for-the-skewer',
      'brawl-jackrabid-kick',
    ],
    languages: ['Vernacular'],
    subraces: [],
  },

  // ─── Paraghoul (Paragulo) ─────────────────────────────────────────
  {
    id: 'paraghoul',
    name: 'Paraghoul',
    nameOriginal: 'Paragulo',
    description:
      'People who died and then, one way or another, cheated Sister Death and came back. Their heart has stopped and their blood no longer flows, but they are just regular folk with merits and flaws, and a paraghoul can easily disguise their nature and walk among the living unnoticed. Rumor makes them the hidden rulers and strategists of the ghouls, which does nothing for first impressions — but many cunning leaders find that a henchman who can deal with death without flinching is a gambit that pays off.',
    abilityBonuses: { int: 1 },
    abilityScoreChoice: [{ count: 2, amount: 1 }],
    speed: 30,
    size: 'Medium',
    traits: [
      'undead-type',
      'still-blood',
      'pull-scams-not-push-daisies',
      'making-fun-of-death',
      'brawl-hes-already-dead',
    ],
    languages: ['Vernacular'],
    subraces: [],
  },
] as const

export function getBrancaloniaRaceById(id: string): Race | undefined {
  return brancaloniaRaces.find(r => r.id === id)
}
