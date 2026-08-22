// Fonte: Brancalonia — Manuale di Ambientazione 2.6, capitolo "Rissa" (pp. 52-55).
// Le Risse sono un sistema parallelo al combattimento: niente armi, niente punti
// ferita, solo Batoste. I nomi originali sono quelli dell'edizione italiana.

export type BrawlMoveKind = 'general' | 'magic'
export type BrawlActionCost = 'action' | 'bonus' | 'reaction'

export interface BrawlMove {
  id: string
  name: string
  nameOriginal: string
  kind: BrawlMoveKind
  cost: BrawlActionCost
  /** Caratteristiche fra cui scegliere per il tiro per colpire, se la mossa ne prevede uno */
  abilities?: string[]
  description: string
}

export interface BrawlClassFeature {
  /** id della classe D&D 5e; le mosse arcane sono condivise fra tre classi */
  classes: string[]
  name: string
  nameOriginal: string
  description: string
}

export interface BrawlLevelFeature {
  level: number
  feature: string
  featureOriginal: string
  moveSlots: number
}

/** Tabella "Privilegi di Rissa": livelli 1-6, il massimo di Brancalonia. */
export const brawlFeatures: readonly BrawlLevelFeature[] = [
  { level: 1, feature: '1 General Move, + 1 Class Brawl Feature', featureOriginal: '1 Mossa Generica, + 1 Mossa di Classe', moveSlots: 2 },
  { level: 2, feature: 'Heroic Ignorance (you can use an ability of your choice when you make a beating)', featureOriginal: 'Ignoranza Eroica (puoi usare una caratteristica a tua scelta quando effettui una saccagnata)', moveSlots: 2 },
  { level: 3, feature: 'General Move', featureOriginal: 'Mossa Generica', moveSlots: 3 },
  { level: 4, feature: 'Iron Jaw (you can spend a move slot and use your reaction to remove a condition affecting you)', featureOriginal: 'Mascella di Ferro (puoi spendere uno slot mossa e usare la reazione per rimuovere una condizione che ti affligge)', moveSlots: 3 },
  { level: 5, feature: 'General Move', featureOriginal: 'Mossa Generica', moveSlots: 4 },
  { level: 6, feature: 'Ace in the Hole', featureOriginal: 'Asso nella Manica', moveSlots: 4 },
]

export const brawlMoves: readonly BrawlMove[] = [
  // ── Mosse Generiche ──────────────────────────────────────────────────
  { id: 'bouncer', name: 'Bouncer', nameOriginal: 'Buttafuori', kind: 'general', cost: 'reaction', abilities: ['str', 'dex'],
    description: 'When you are hit by an attack, you can make an attack roll against your opponent. On a hit, the target is stunned.' },
  { id: 'diving-drop', name: 'Diving Drop', nameOriginal: 'Schianto', kind: 'general', cost: 'action', abilities: ['str', 'con'],
    description: 'On a hit, the move deals 1 whack and the target is stunned and knocked prone. You take 1 whack.' },
  { id: 'feint', name: 'Feint', nameOriginal: 'Finta', kind: 'general', cost: 'action',
    description: 'You make other creatures believe you are unconscious. Until you attack, you cannot be targeted by other creatures — you are still subject to Stray Dangers.' },
  { id: 'slop-is-served', name: 'Slop is Served', nameOriginal: 'Brodaglia in faccia', kind: 'general', cost: 'bonus', abilities: ['dex', 'wis'],
    description: 'On a hit, the target is blinded.' },
  { id: 'clothesline', name: 'Clothesline', nameOriginal: 'Ghigliottina', kind: 'general', cost: 'action', abilities: ['str', 'dex'],
    description: 'On a hit, the move deals 1 whack and the target is knocked prone.' },
  { id: 'head-smasher', name: 'Head-Smasher', nameOriginal: 'Fracassateste', kind: 'general', cost: 'action', abilities: ['str', 'con'],
    description: 'You attack two different targets, rolling against the higher AC. On a hit, the move deals 1 whack to both.' },
  { id: 'for-the-bounty', name: 'For the Bounty!', nameOriginal: 'Alla pugna!', kind: 'general', cost: 'action',
    description: 'Every friendly creature in the brawl gains advantage on their next move or beating.' },
  { id: 'under-the-table', name: 'Under the Table', nameOriginal: 'Sotto il tavolo', kind: 'general', cost: 'action',
    description: 'You take three-quarters cover: +5 bonus to AC and to Dexterity saving throws.' },
  { id: 'tripping', name: 'Tripping', nameOriginal: 'Sgambetto', kind: 'general', cost: 'bonus', abilities: ['dex', 'int'],
    description: 'On a hit, the target is knocked prone.' },
  { id: 'drop-them-pants', name: 'Drop Them Pants!', nameOriginal: 'Giù le braghe', kind: 'general', cost: 'bonus', abilities: ['dex', 'cha'],
    description: 'On a hit, the target is restrained.' },
  { id: 'hammer-slam', name: 'Hammer Slam', nameOriginal: 'Pugnone in testa', kind: 'general', cost: 'action', abilities: ['str', 'con'],
    description: 'On a hit, the move deals 1 whack and the target is incapacitated.' },
  { id: 'headbutt', name: 'Headbutt', nameOriginal: 'Testata di mattone', kind: 'general', cost: 'reaction', abilities: ['str', 'con'],
    description: 'When you are hit by an attack, you can make an attack roll against your opponent. On a hit, the move deals 1 whack.' },

  // ── Mosse Magiche ────────────────────────────────────────────────────
  // Riservate a chi ha Incantesimi o Magia del Patto: si prendono al posto
  // di una mossa generica.
  { id: 'protection-from-kicks-and-blows', name: 'Protection from Kicks and Blows', nameOriginal: 'Protezione dal menare', kind: 'magic', cost: 'action',
    description: 'Choose a willing creature you can see: all beatings and moves against it have disadvantage until the end of its next turn.' },
  { id: 'fetor-spray', name: 'Fetor Spray', nameOriginal: 'Spruzzo venefico', kind: 'magic', cost: 'action', abilities: ['int', 'wis', 'cha'],
    description: 'On a hit, the move deals 1 whack and the target is poisoned.' },
  { id: 'insane-scream', name: 'Insane Scream', nameOriginal: 'Urla dissennanti', kind: 'magic', cost: 'action',
    description: 'Choose a creature: it becomes frightened of you.' },
  { id: 'eyes-on-me', name: 'Eyes on Me', nameOriginal: 'La magna', kind: 'magic', cost: 'action',
    description: 'Choose a creature: it becomes charmed by you.' },
  { id: 'cool-down', name: 'Cool Down', nameOriginal: 'Sguardo Ghiacciante', kind: 'magic', cost: 'action',
    description: 'Choose a creature: it cannot move and is incapacitated, and until the end of its next turn it cannot take whacks or suffer conditions.' },
  { id: 'magic-fist-fight', name: 'Magic Fist-Fight', nameOriginal: 'Pugno incantato', kind: 'magic', cost: 'action', abilities: ['int', 'wis', 'cha'],
    description: 'You make three attacks against three different targets. The move deals 1 whack to each target hit.' },
  { id: 'dodgevoiance', name: 'Dodgevoiance', nameOriginal: 'Schiaffoveggenza', kind: 'magic', cost: 'reaction',
    description: 'When a creature attacks you, you impose disadvantage on the attack roll.' },
  { id: 'spiritual-stool', name: 'Spiritual Stool', nameOriginal: 'Sediata spirituale', kind: 'magic', cost: 'bonus',
    description: 'You transform a common prop into an epic prop.' },
]

/** Mossa di Classe: ogni personaggio ne ottiene una al 1° livello. */
export const brawlClassFeatures: readonly BrawlClassFeature[] = [
  { classes: ['barbarian'], name: 'Enraged and Furious', nameOriginal: 'Rissa Furiosa',
    description: 'This turn, all your beatings and moves deal 1 extra whack.' },
  { classes: ['bard'], name: 'Kung Fusion', nameOriginal: 'Ku Fu?',
    description: 'As a reaction to a creature attacking you, make a Charisma attack roll against it. On a hit, it must choose a new target within range. You use this before the creature rolls.' },
  { classes: ['cleric'], name: 'Sacrum', nameOriginal: 'Osso Sacro',
    description: 'As an action, make a Wisdom attack roll: on a hit it deals 1 whack and the target is knocked prone.' },
  { classes: ['druid'], name: 'Beast Slap', nameOriginal: 'Schiaffo Animale',
    description: 'As an action, make a Wisdom attack roll: on a hit it deals 1 whack and the target becomes frightened of you.' },
  { classes: ['fighter'], name: 'Counterattack', nameOriginal: 'Contrattacco',
    description: 'As a reaction to a creature attacking you, make a beating against it. On a hit, it attacks you with disadvantage.' },
  { classes: ['monk'], name: 'Flurry of Slaps', nameOriginal: 'Raffica di Schiaffoni',
    description: 'As a bonus action, you can make 2 beatings.' },
  { classes: ['paladin'], name: 'The Wine Smite', nameOriginal: 'Punizione di Vino',
    description: 'As a bonus action, make a Strength attack roll: on a hit it deals 1 whack and the target is blinded.' },
  { classes: ['ranger'], name: 'The Call of the Wild', nameOriginal: 'Il Richiamo della Foresta',
    description: 'As an action, throw a bait on a target creature: an animal hampers it, and it is restrained until it deals 1 whack to the animal.' },
  { classes: ['rogue'], name: 'Sneak aWhack', nameOriginal: 'Mossa Furtiva',
    description: 'As a bonus action, your next move or beating gains advantage and deals 1 extra whack.' },
  { classes: ['sorcerer', 'warlock', 'wizard'], name: 'Arcane Blow', nameOriginal: 'Saccagnata Arcana!',
    description: 'When you make a magic move, you can spend an additional move slot to make the move deal 1 extra whack.' },
]

/**
 * Asso nella Manica: mossa segreta del 6° livello, una sola volta per rissa.
 * CD dei tiri salvezza = 8 + bonus di competenza + un modificatore a scelta.
 */
export const brawlAces: readonly BrawlClassFeature[] = [
  { classes: ['barbarian'], name: 'Float Like a Butterfly', nameOriginal: 'Viuuulenza!',
    description: 'Until the start of your next turn, you cannot take whacks or suffer conditions.' },
  { classes: ['bard'], name: 'Heartbreaking Note', nameOriginal: 'Urlo Straziaugola',
    description: 'As an action, each brawl participant must succeed on a Constitution saving throw or take 1 whack and become incapacitated. Friendly creatures have advantage on the save.' },
  { classes: ['cleric'], name: "If You're Listening, Help!", nameOriginal: 'Donna Lama, il tuo Servo ti Chiama!',
    description: 'As an action, you summon your Saints and a random Stray Danger hits all your enemies.' },
  { classes: ['druid'], name: 'Pollen Dust', nameOriginal: 'Nube di Polline',
    description: 'As an action, each brawl participant must succeed on a Constitution saving throw or suffer 1 whack and become poisoned. Friendly creatures have advantage on the save.' },
  { classes: ['fighter'], name: 'Vorpal Punch', nameOriginal: 'Pugno Vorpale',
    description: 'You make a beating that deals 3 additional whacks.' },
  { classes: ['monk'], name: 'Kneel and Pray!', nameOriginal: 'Rosario di San Cagnate',
    description: 'You make a beating that deals 1 additional whack. On a hit, the target must succeed on a Constitution saving throw or fall to the ground as if it had reached the maximum whacks level.' },
  { classes: ['paladin'], name: 'Special Mount', nameOriginal: 'Evocare Cavalcatura',
    description: 'You summon your mount in the middle of the brawl. It makes two beatings using your attack bonus, then leaves.' },
  { classes: ['ranger'], name: "It's a Trap!", nameOriginal: 'Trappolone',
    description: 'When a creature moves in the brawl, use your reaction to activate a trap that deals 2 whacks and the restrained condition.' },
  { classes: ['rogue'], name: 'Sting Like a Bee!', nameOriginal: 'Puff… Sparito!',
    description: 'As a reaction to a creature attacking you, dodge the attack and make a beating that deals 1 additional whack against the attacker.' },
  { classes: ['sorcerer'], name: 'Supreme Misfortune', nameOriginal: 'Sfiga Suprema',
    description: 'As an action, you deliberately trigger a negative superstition. Each brawl participant must succeed on a Wisdom saving throw or drop what they hold and become frightened. Friendly creatures have advantage on the save.' },
  { classes: ['warlock'], name: 'Remorse Touch', nameOriginal: 'Tocco del Rimorso',
    description: 'Until the start of your next turn, whenever an opponent deals 1 whack to you or to a friendly creature, that opponent takes 1 whack.' },
  { classes: ['wizard'], name: 'Fire Bowl', nameOriginal: 'Palla di Cuoco',
    description: 'As an action, you throw a bowl of boiling broth: each brawl participant must succeed on a Dexterity saving throw or suffer 2 whacks. Friendly creatures have advantage on the save.' },
]

/** Slot mossa disponibili a un dato livello (1-6). */
export function getMoveSlots(level: number): number {
  const row = [...brawlFeatures].reverse().find(f => f.level <= level)
  return row?.moveSlots ?? 0
}

/** Numero di mosse conosciute a un dato livello: 1 al 1°, poi una al 3° e al 5°. */
export function getKnownMoveCount(level: number): number {
  return brawlFeatures.filter(f => f.level <= level && f.feature.includes('General Move')).length
}

export function getBrawlClassFeature(classId: string): BrawlClassFeature | undefined {
  return brawlClassFeatures.find(f => f.classes.includes(classId))
}

export function getBrawlAce(classId: string): BrawlClassFeature | undefined {
  return brawlAces.find(f => f.classes.includes(classId))
}

/** id usato per cercare la descrizione italiana di una mossa di classe o asso. */
export function brawlFeatureId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
