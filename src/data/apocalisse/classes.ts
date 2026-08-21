import type { ClassFeature } from '../dnd5e/classes'

export interface ApocalisseSubclass {
  id: string
  /** ID of the parent D&D 5e class (e.g. 'barbarian', 'bard') */
  parentClassId: string
  name: string
  nameOriginal?: string
  description: string
  features: ClassFeature[]
}

export const apocalisseSubclasses: readonly ApocalisseSubclass[] = [
  // ─── Barbarian - Path of Martyrdom ────────────────────────────────
  {
    id: 'path-of-the-horseman',
    parentClassId: 'barbarian',
    name: 'Path of Martyrdom',
    nameOriginal: 'Cammino del Martirio',
    description:
      'Those who follow this path are, to all intents and purposes, martyrs: devoted to battle and slaughter, penitents flailing their own flesh to gather more rage and determination and quash their opponents. Some wear iron masks lined with nails, others slide hooks into their powerful bodies. They do not love pain for its own sake, nor harm themselves out of folly — their torment is a conscious choice, aimed at meting out even more fury upon those who stand in their way.',
    features: [
      {
        id: 'martyrize-self',
        name: 'Martyrize Self',
        level: 3,
        description:
          'Once per turn while raging, before your first attack, you can wound yourself and take 1d4 damage of your choice among bludgeoning, piercing or slashing. That damage cannot be reduced. Until the end of the turn, every melee weapon attack you land deals that much extra damage — rising to 1d6 at 6th level, 1d8 at 10th and 1d10 at 15th. You also cannot become frightened while raging, and any existing fright is suspended for the duration of the rage. If you do not already own one, you gain a mask of the martyr as soon as possible.',
      },
      {
        id: 'salt-in-a-wound',
        name: 'Salt in a Wound',
        level: 3,
        description:
          'You learn to identify your enemies\' weaknesses and the best way to inflict pain. When you score a critical hit, you add your proficiency bonus to the damage you deal.',
      },
      {
        id: 'endurance-martyrdom',
        name: 'Endurance',
        level: 6,
        description:
          'You have learned to endure hits, assaults and afflictions of any kind without suffering their effects. While you are not at your maximum hit points, you can reroll a failed saving throw and must use the new roll. You can do this a number of times equal to half your proficiency bonus, rounded down, regaining all uses on a long rest.',
      },
      {
        id: 'an-eye-for-an-eye',
        name: 'An Eye for An Eye',
        level: 10,
        description:
          'You can exploit the pain of a fresh wound to strike back at once. While raging, when you take damage you can use your reaction to make a melee weapon attack against a creature within reach.',
      },
      {
        id: 'relentless-martyrdom',
        name: 'Relentless',
        level: 14,
        description:
          'Your pain threshold grows so high that while raging you cannot become incapacitated, stunned or paralyzed. In addition, any critical hit scored against you counts as a normal hit.',
      },
    ],
  },

  // ─── Bard - College of Revelation ─────────────────────────────────
  {
    id: 'college-of-laments',
    parentClassId: 'bard',
    name: 'College of Revelation',
    nameOriginal: 'Collegio della Rivelazione',
    description:
      'The seer storytellers of the College of Revelation are evangelizers, visionaries and prophets whose task is to catch glimpses of the future — for themselves, for those around them, or against their enemies. They take their inspiration from the seer who penned the Book of Revelation centuries ago, though the gift itself cannot be taught: the college merely finds those who already have it. Most of its members shun Babilonia and roam the deserts and swamps of Armageddon in search of adepts, or of the solitude needed to hear fate murmur.',
    features: [
      {
        id: 'spellcasting-focus-revelation',
        name: 'Spellcasting Focus',
        level: 3,
        description:
          'You find, craft or take a psaltery, a tome or a notebook of blank pages, and attune to it as if it were a magic item. Once attuned, you can use it as a spellcasting focus for your bard spells. Any class feature of yours that would need music or your voice — Bardic Inspiration, Song of Rest — uses your voice and this book, which serves you as both prayer book and songbook.',
      },
      {
        id: 'omens-of-future',
        name: 'Omens of Future',
        level: 3,
        description:
          'You learn the guidance and true strike spells if you do not know them. In addition, you can use your action to weep tears of blood and read your immediate future through them: ask your Guide what a course of action you mean to take in the next 24 hours would bring, and they answer through your tears with Success, Possibility, Disaster, Unexpected, Indifferent or Confusion. Afterwards you are blinded until the end of your next turn, and you cannot use this again until you complete a short or long rest.',
      },
      {
        id: 'inflicted-destiny',
        name: 'Inflicted Destiny',
        level: 3,
        description:
          'As an action you can foresee a creature\'s death or defeat by weeping blood onto your book and reading the pattern. Spend one use of Bardic Inspiration and choose a creature within 60 feet — you sense its presence even unseen. Roll a number of Bardic Inspiration dice equal to your proficiency bonus and add your Charisma modifier. The target makes a Wisdom saving throw against your spell save DC, taking that much psychic damage and being frightened of you until the end of your next turn on a failure, or half damage and no fright on a success. Afterwards you must make a Constitution saving throw with a DC equal to 8 + your proficiency bonus, taking one level of exhaustion on a failure.',
      },
      {
        id: 'warning-revelation',
        name: 'Warning',
        level: 6,
        description:
          'Divinatory signs tell you what is about to happen, and you decipher them fast enough to warn those around you. As a bonus action, spend a use of Bardic Inspiration to choose a creature you can see within 60 feet: until the start of your next turn it cannot be surprised and has advantage on attack rolls and saving throws.',
      },
      {
        id: 'elude-destiny',
        name: 'Elude Destiny',
        level: 14,
        description:
          'When a creature other than you is hit by an attack, a spell or any mundane or magical effect from any source, you can spend your reaction and one use of Bardic Inspiration to cancel all damage and every other effect that source deals to it. This has no effect on any additional target hit by the same source. Afterwards you are blinded until the end of your next turn, and you cannot use it again until you complete a short or long rest.',
      },
    ],
  },

  // ─── Cleric - Domain of Ruin ──────────────────────────────────────
  {
    id: 'domain-of-heresy',
    parentClassId: 'cleric',
    name: 'Domain of Ruin',
    nameOriginal: 'Dominio della Rovina',
    description:
      'The sound of bells tolling across the Plain of Armageddon recalls the voice of the Lord and the roaring depths of the Abyss alike. Clerics of the End Times know how to call upon the sounds of the inevitable decay of all things: their bells bring destruction and, at times, renewal. They believe everything must be destroyed in order to be rebuilt, and that ruin, erosion and decline are signs of the ever-closer Last Battle. Domain spells: create or destroy water and thunderwave (1st), magic weapon and shatter (3rd), create food and water and revivify (5th), fabricate and stone shape (7th), passwall and wall of force (9th).',
    features: [
      {
        id: 'bells-of-destruction',
        name: 'Bells of Destruction',
        level: 1,
        description:
          'You gain proficiency with the battle bell and with heavy armor, and you gain a battle bell to add to your equipment.',
      },
      {
        id: 'ruining-and-mending',
        name: 'Ruining and Mending',
        level: 1,
        description:
          'You learn the mending cantrip if you do not know it. In addition, when you hit a target with a melee weapon that deals bludgeoning damage, you can call upon the power of ruin to deal extra thunder damage equal to your Wisdom modifier — doubled against an item or a structure. You can do this a number of times equal to your proficiency bonus, regaining all uses on a short or long rest.',
      },
      {
        id: 'channel-divinity-devastation',
        name: 'Channel Divinity: Devastation',
        level: 2,
        description:
          'As an action you wield your holy symbol and call loudly upon the power of Shaddai the Destroyer. A thundering roar audible within 200 feet spreads from the symbol, and every creature in a 30-foot cone must make a Constitution saving throw against your spell save DC. On a failure it takes 3d8 + your cleric level thunder damage, is knocked prone and is deafened until the start of your next turn; on a success it takes half damage and suffers neither condition. Constructs have disadvantage on this save and take 6d8 + your cleric level instead.',
      },
      {
        id: 'channel-divinity-restoration',
        name: 'Channel Divinity: Restoration',
        level: 6,
        description:
          'As an action you touch a creature and restore 3d8 + your cleric level hit points to it. You can also remove one level of exhaustion from the target, or end a disease or one condition afflicting it among blinded, deafened, paralyzed and stunned. You cannot use this on an undead creature.',
      },
      {
        id: 'unchecked-ruin',
        name: 'Unchecked Ruin',
        level: 8,
        description:
          'Once per turn, when you hit a creature with a weapon attack, you can deal an extra 1d8 thunder damage, rising to 2d8 at 14th level. In addition, the features you use and the spells you cast ignore resistance to thunder damage.',
      },
      {
        id: 'disintegrate-matter',
        name: 'Disintegrate Matter',
        level: 17,
        description:
          'As an action you call upon the Destroyer\'s power against a target you can see within 60 feet — a creature, an object, or a creation of magical force such as a wall of force. A creature must make a Wisdom saving throw against your spell save DC, taking 12d12 + your cleric level thunder damage and being stunned until the start of your next turn on a failure. If the damage reduces it to 0 hit points it is disintegrated: it and everything it wears and carries except magic items become a pile of fine gray dust, and only a true resurrection or a wish spell can restore it. The feature automatically disintegrates a Large or smaller nonmagical object or creation of magical force, or a 10-foot cube of a larger one; magic items are unaffected. You regain the use of this feature after a long rest.',
      },
    ],
  },

  // ─── Druid - Circle of Plagues ────────────────────────────────────
  {
    id: 'circle-of-plagues',
    parentClassId: 'druid',
    name: 'Circle of Plagues',
    nameOriginal: 'Circolo della Piaga',
    description:
      'Druids of the Circle of Plagues embrace the corruption of Famine, the third Horseman. Their bodies decay and transform, granting them power over disease and pestilence to lead the world to rebirth.',
    features: [
      {
        id: 'circle-spells-plagues',
        name: 'Circle Spells',
        level: 2,
        description:
          'Your bond with the Plague grants access to spells: 2nd - acid splash, detect poison and disease; 3rd - blindness/deafness, spike growth; 5th - bestow curse, stinking cloud; 7th - blight, giant insect; 9th - contagion, insect plague.',
      },
      {
        id: 'plagued-wild-shape',
        name: 'Plagued Wild Shape',
        level: 2,
        description:
          'When you use Wild Shape, the beast gains the Plagued Beast trait: disadvantage on Constitution saves and Wisdom checks, but extra damage on attacks equal to the beast\'s proficiency bonus.',
      },
      {
        id: 'excruciating-contagion',
        name: 'Excruciating Contagion',
        level: 2,
        description:
          'You are immune to disease and deal extra damage equal to your proficiency bonus. You can spread disease in a 10 ft. aura (CON save vs. spell DC, infected and blinded 1 min). Uses equal to proficiency bonus per short or long rest.',
      },
      {
        id: 'plagued-palms',
        name: 'Plagued Palms',
        level: 6,
        description:
          'You can make a melee weapon attack to infect a target with a deadlier Plague. On hit, the target is stunned for 1d6 rounds (CON save ends). Uses shared with Excruciating Contagion.',
      },
      {
        id: 'subjugated-plague',
        name: 'Subjugated Plague',
        level: 10,
        description:
          'Your features and spells bypass any immunity to disease.',
      },
      {
        id: 'deadly-miasma',
        name: 'Deadly Miasma',
        level: 14,
        description:
          'You can exhale an unnatural miasma against a creature within 30 ft. (WIS save). On failure, it is infected and paralyzed, unable to regain HP (CON save ends). Uses shared with previous plague features.',
      },
    ],
  },

  // ─── Fighter - Furioso ────────────────────────────────────────────
  {
    id: 'furioso',
    parentClassId: 'fighter',
    name: 'Furioso',
    nameOriginal: 'Furioso',
    description:
      'The Furioso archetype specializes in assault maneuvers and the use of large and heavy weapons like the flamberge. They choose speed, surprise, and mobility over defense, focusing all power into devastating strikes.',
    features: [
      {
        id: 'whirling-steel',
        name: 'Whirling Steel',
        level: 3,
        description:
          'While not wearing heavy armor or medium armor and wielding a two-handed melee weapon, you can make an area attack: each creature within reach must make a DEX save (DC 8 + prof + STR mod). On failure, they take weapon damage and Large or smaller creatures are knocked prone. Uses equal to proficiency bonus per short or long rest.',
      },
      {
        id: 'formidable-warrior',
        name: 'Formidable Warrior',
        level: 3,
        description:
          'You gain proficiency in one skill of your choice: Athletics, Intimidation, Survival, or History. You also gain a flamberge (martial melee weapon, 2d8 slashing, two-handed, heavy, special).',
      },
      {
        id: 'furious-assault',
        name: 'Furious Assault',
        level: 7,
        description:
          'As a bonus action, you can gain advantage on STR-based melee attack rolls until end of turn, but attack rolls against you also have advantage until your next turn. On hit, add double your STR modifier to the first damage roll. You also gain temporary HP equal to 1d10 + CON modifier. Uses equal to proficiency bonus per long rest.',
      },
      {
        id: 'improved-whirling-steel',
        name: 'Improved Whirling Steel',
        level: 10,
        description:
          'The reach of your Whirling Steel area attack increases by 5 feet, and any creature that fails its save is also stunned until the start of your next turn.',
      },
      {
        id: 'recklessness',
        name: 'Recklessness',
        level: 15,
        description:
          'You have advantage on saving throws to avoid or end the frightened condition. If you already have this advantage, you are immune to frightened. When using Furious Assault, temporary HP increase to 2d10 + CON modifier.',
      },
      {
        id: 'ready-to-die',
        name: 'Ready to Die',
        level: 18,
        description:
          'When you are reduced to 0 HP but not killed outright, you can use your reaction to drop to 1 HP instead and immediately make a melee attack with advantage against a creature within your reach. Once used, you can\'t use this again until you finish a short or long rest.',
      },
    ],
  },

  // ─── Rogue - Wormwood Specter ─────────────────────────────────────
  {
    id: 'wormwood-specter',
    parentClassId: 'rogue',
    name: 'Wormwood Specter',
    nameOriginal: 'Spettro dell\'Assenzio',
    description:
      'Wormwood Specters are darkened and silent individuals who have soaked up an unnatural poison known as wormwood. They cast heavy censers and take advantage of thick clouds of noxious fumes to conceal their presence.',
    features: [
      {
        id: 'wormwood-addiction',
        name: 'Wormwood Addiction',
        level: 3,
        description:
          'Your wormwood-induced transformation begins. You gain resistance to poison damage and are immune to the poisoned condition.',
      },
      {
        id: 'wormwood-shroud',
        name: 'Wormwood Shroud',
        level: 3,
        description:
          'As a bonus action, you summon a shroud of wormwood fumes (15 ft. sphere, 1 min). The area is lightly obscured and you can hide inside it. On a Sneak Attack hit, you deal extra poison damage equal to your proficiency bonus and the target is poisoned. Uses equal to proficiency bonus per long rest.',
      },
      {
        id: 'improved-wormwood-shroud',
        name: 'Improved Wormwood Shroud',
        level: 9,
        description:
          'Your shroud\'s radius increases to 30 ft. and cannot be dispersed by wind. Poison damage from your shroud ignores resistance and treats immunity as resistance. You add your proficiency bonus to initiative rolls.',
      },
      {
        id: 'misty-form',
        name: 'Misty Form',
        level: 13,
        description:
          'As a bonus action you sublimate into wormwood vapour for 1 hour, or until you revert with another bonus action. While sublimated you cannot take actions, speak or manipulate objects; you are weightless, you have a flying speed of 20 feet and can hover, you can enter a hostile creature\'s space and pass anywhere air can without squeezing, you have advantage on Strength, Dexterity and Constitution saving throws, and you are immune to all nonmagical damage. You regain the use of this feature after a short or long rest.',
      },
      {
        id: 'evanescence',
        name: 'Evanescence',
        level: 17,
        description:
          'While you are inside your wormwood shroud, when a creature you can see would hit you, you can use your reaction to roll a d20 and choose whether that roll is used instead of the attacker\'s. You can do this a number of times equal to your Dexterity modifier, minimum one, regaining all uses on a long rest.',
      },
    ],
  },

  // ─── Wizard - School of Solomon ───────────────────────────────────
  {
    id: 'school-of-solomon',
    parentClassId: 'wizard',
    name: 'School of Solomon',
    nameOriginal: 'Scuola di Salomone',
    description:
      'Wizards of the School of Solomon study the ancient art of binding and commanding otherworldly spirits. King Solomon was said to have commanded demons to build his temple, and his heirs continue this tradition in the End Times.',
    features: [
      {
        id: 'initiate-school-solomon',
        name: 'Initiate of the School of Solomon',
        level: 2,
        description:
          'The spell save DC of your conjuration and charm spells increases by 1, and you can speak, read and write Primal Tongue. If the Temple of Solomon has not already issued you one, you gain a Ring of Solomon as soon as possible.',
      },
      {
        id: 'solomons-warding',
        name: 'Solomon\'s Warding',
        level: 2,
        description:
          'You are enshrouded in a mystical aura of warding: you gain +1 to all saving throws against spells and other magical effects. In addition, when you or a creature you can see within 30 feet takes damage, you can use your reaction to summon a cabalist screen, rolling 2d8 + your Intelligence modifier and reducing the damage by that amount. You can do this a number of times equal to your proficiency bonus, regaining all uses on a long rest.',
      },
      {
        id: 'summon-otherworldly-spirit',
        name: 'Summon Otherworldly Spirit',
        level: 6,
        description:
          'With an action you speak a kabbalistic incantation and summon a malakh, a demon of temptation, or any other fiend or celestial of challenge rating 2 or lower, in an unoccupied space you can see within 60 feet. It is friendly to you and your companions and remains as long as you concentrate, up to 1 hour, or until it drops to 0 hit points. Without commands it only defends itself. You regain the use of this feature after a short or long rest.',
      },
      {
        id: 'master-school-solomon',
        name: 'Master of the School of Solomon',
        level: 10,
        description:
          'You have advantage on Constitution saving throws to maintain concentration on conjuration spells and on your summoning features. In addition, as a bonus action you can magically teleport up to 60 feet to an unoccupied space you can see; every creature within 10 feet of you that can see you must then make a Wisdom saving throw against your spell save DC or be charmed by you for 1 minute, or until it takes damage. You can teleport a number of times equal to your proficiency bonus, regaining all uses on a long rest.',
      },
      {
        id: 'summon-greater-spirit',
        name: 'Summon Greater Otherworldly Spirit',
        level: 14,
        description:
          'Your incantation now calls a spirit of Solomon, a cherub, a wormwood demon, or any other fiend or celestial of challenge rating 5 or lower, in an unoccupied space you can see within 120 feet, for up to 1 hour of concentration. You regain the use of this feature after a short or long rest.',
      },
    ],
  },

  // ─── Monk - Way of the Seven Seals ────────────────────────────────
  {
    id: 'way-of-the-seven-seals',
    parentClassId: 'monk',
    name: 'Way of the Seven Seals',
    nameOriginal: 'Via dei Sette Sigilli',
    description:
      'Monks who follow the Way of the Seven Seals channel the apocalyptic power released when each of the seven seals was broken. Each seal grants a different devastating ability.',
    features: [
      {
        id: 'the-first-four-seals',
        name: 'The First Four Seals',
        level: 3,
        description:
          'Four spheres are grafted into your chest, and each costs ki. Seal of Conquest: as an action, spend 3 ki to loose a lightning bolt in a 50-foot line 5 feet wide — a Dexterity save against your ki DC or 2d10 lightning damage and stunned, +1d10 per extra ki point up to 6. Seal of War: when a creature within 10 feet hits you in melee, spend 2 ki as a reaction to release a gout of flame — a Dexterity save or 1d12 fire damage and blinded until the start of its next turn, +1d12 per extra ki point up to 6. Seal of Famine: your unarmed strikes can poison a target that fails a Constitution save until the start of your next turn, and 1 ki adds 1d12 poison damage that ignores resistance to poison. Seal of Death: as an action, spend 3 ki for a wave of cold in a 15-foot radius — a Constitution save or 3d8 cold damage and restrained, +1d8 per extra ki point.',
      },
      {
        id: 'seal-of-resurrection',
        name: 'Seal of Resurrection',
        level: 6,
        description:
          'You graft the fifth sphere into your chest. Spend 4 ki points and touch a creature that has died within the last minute: it returns to life with 1 hit point.',
      },
      {
        id: 'seal-of-eternal-eclipse',
        name: 'Seal of the Eternal Eclipse',
        level: 11,
        description:
          'You graft the sixth sphere into your chest. As an action, spend 5 ki points to release an unnatural darkness from your body. You see through it out to 60 feet, darkvision cannot pierce it, and it dispels light created by spells of 3rd level or lower that overlap the area.',
      },
      {
        id: 'seal-of-silence',
        name: 'Seal of Silence',
        level: 17,
        description:
          'You graft the last sphere into your chest. When you see a creature within 30 feet casting a spell, you can spend 6 ki points and use your reaction: unless it succeeds on a Wisdom saving throw against your ki DC, the spell fails and has no effect, and the creature is deafened and cannot cast a spell with a verbal component until the end of its next turn.',
      },
    ],
  },

  // ─── Paladin - Oath of the End of the World ───────────────────────
  {
    id: 'oath-of-the-end',
    parentClassId: 'paladin',
    name: 'Oath of the End of the World',
    nameOriginal: 'Giuramento della Fine del Mondo',
    description:
      'Paladins who swear the Oath of the End of the World dedicate themselves to witnessing and shaping the final days. Whether they seek to save or condemn, they wield the power of endings.',
    features: [
      {
        id: 'channel-divinity-memento-mori',
        name: 'Channel Divinity: Memento Mori',
        level: 3,
        description:
          'As an action you show a creature of your choice within 30 feet its own end. Unless it is immune to being frightened it must make a Wisdom saving throw against your spell save DC — aberrations, monstrosities and elementals have disadvantage — and on a failure it is frightened of you for 1 minute, repeating the save at the end of each of its turns.',
      },
      {
        id: 'channel-divinity-ultima-forsan',
        name: 'Channel Divinity: Ultima Forsan',
        level: 3,
        description:
          'As an action you remind up to four creatures within 20 feet that this could be their last hour: for 1 minute you and they have advantage on saving throws against spells and other magical effects.',
      },
      {
        id: 'divine-ruin',
        name: 'Divine Ruin',
        level: 3,
        description:
          'Every time you would use Divine Smite to deal radiant damage, you deal force damage instead. All other effects of the feature are unchanged.',
      },
      {
        id: 'aura-of-dismay',
        name: 'Aura of Dismay',
        level: 7,
        description:
          'Fear clings to you within 10 feet, rising to 30 feet at 18th level. While a creature frightened by you is inside the aura, its speed is halved and your attack rolls against it have advantage.',
      },
      {
        id: 'exploit-dismay',
        name: 'Exploit Dismay',
        level: 15,
        description:
          'When an enemy creature enters your aura of dismay or starts its turn there during a battle, you can use your reaction to deal 2d8 + your Charisma modifier force damage to it.',
      },
      {
        id: 'herald-of-the-end',
        name: 'Herald of the End of the World',
        level: 20,
        description:
          'As an action you exalt body and spirit and become the earthly symbol of destruction for 1 minute: your melee weapon attacks score a critical hit on a roll of 19 or 20, you can make one melee weapon attack as a bonus action, and every melee hit deals an extra 2d6 force damage and forces a Strength saving throw or knocks the target prone.',
      },
    ],
  },

  // ─── Ranger - Bastion ─────────────────────────────────────────────
  {
    id: 'bastion',
    parentClassId: 'ranger',
    name: 'Bastion',
    nameOriginal: 'Baluardo',
    description:
      'Bastions are rangers who serve as frontier guards and sharpshooters, defending the last bastions of civilization against the horrors of the Plain of Armageddon. They specialize in ranged combat with heavy firearms like the culverin.',
    features: [
      {
        id: 'improved-perception',
        name: 'Improved Perception',
        level: 3,
        description:
          'You gain proficiency in the Perception skill, and your proficiency bonus is doubled for any ability check you make with it.',
      },
      {
        id: 'sentinel-on-the-border',
        name: 'Sentinel on the Border',
        level: 3,
        description:
          'You gain a culverin and 20 pellets. If you do not move on your turn while holding a ranged weapon, you can take aim at a creature and gain advantage on your next ranged attack against it that turn. You can do this a number of times equal to your proficiency bonus, regaining all uses on a short or long rest.',
      },
      {
        id: 'frontier-training',
        name: 'Frontier Training',
        level: 3,
        description:
          'You gain proficiency with firearms and with heavy armor, and heavy armor no longer hinders you: you ignore the Strength column of the Armor table.',
      },
      {
        id: 'egregious-training',
        name: 'Egregious Training',
        level: 7,
        description:
          'You ignore the loading property of ranged weapons. In addition, as a bonus action you can mark a creature: the next time you hit it this turn it takes extra damage equal to your proficiency bonus.',
      },
      {
        id: 'tireless-shooter',
        name: 'Tireless Shooter',
        level: 11,
        description:
          'Endless patrols have made you tough: you gain proficiency with Constitution saving throws, and you have advantage on rolls to resist or end the blinded condition on yourself.',
      },
      {
        id: 'bullseye',
        name: 'Bullseye',
        level: 15,
        description:
          'You learn to hit the weakest spot of any target: when you make a weapon attack on your turn, you can decide it scores a critical hit. You regain the use of this feature after a long rest.',
      },
    ],
  },

  // ─── Sorcerer - Otherworldly Heritage ─────────────────────────────
  {
    id: 'otherworldly-heritage',
    parentClassId: 'sorcerer',
    name: 'Otherworldly Heritage',
    nameOriginal: 'Discendenza Ultraterrena',
    description:
      'Your innate magic comes from an otherworldly ancestor - an angel or a demon. This heritage manifests in supernatural abilities that grow stronger as you embrace your dual nature.',
    features: [
      {
        id: 'otherworldly-ancestor',
        name: 'Otherworldly Ancestor',
        level: 1,
        description:
          'You choose the ancestor whose blood runs in you: an Angel, whose damage type is radiant, or a Demon, whose damage type is necrotic. That choice sets the damage type used by every later feature of this origin.',
      },
      {
        id: 'otherworldly-sign',
        name: 'Otherworldly Sign',
        level: 1,
        description:
          'Your lineage shows. An Angel grants you a bright golden halo, the light cantrip and a Blade of Splendor, with proficiency in it. A Demon grants you two small horns and a gloomy purple glow, the minor illusion cantrip and a Blade of Gloom, with proficiency in it.',
      },
      {
        id: 'ancestors-protection',
        name: 'Ancestor\'s Protection',
        level: 1,
        description:
          'While you are wearing no armor your AC equals 10 + your Charisma modifier + your Dexterity modifier. In addition, you have advantage on death saving throws.',
      },
      {
        id: 'otherworldly-spell',
        name: 'Otherworldly Spell',
        level: 3,
        description:
          'You gain a Metamagic option no other sorcerer has: for 1 additional sorcery point you can change the acid, cold, lightning, fire, psychic or thunder damage of a spell into your ancestor\'s damage type.',
      },
      {
        id: 'otherworldly-consonance',
        name: 'Otherworldly Consonance',
        level: 6,
        description:
          'Once per turn you can add your Charisma modifier to one damage roll of your ancestor\'s damage type. In addition, you can spend 1 sorcery point to gain resistance to that damage type for 1 hour.',
      },
      {
        id: 'call-of-blood',
        name: 'Call of Blood',
        level: 14,
        description:
          'As a bonus action you sprout wings and gain a flying speed equal to your walking speed. In addition, as an action you can emit a blinding aura in a 30-foot radius: every creature in it must make a Wisdom saving throw against your spell save DC or be blinded. You regain the use of this feature after a long rest.',
      },
      {
        id: 'otherworldly-affliction',
        name: 'Otherworldly Affliction',
        level: 18,
        description:
          'When you deal your ancestor\'s damage type to a creature, you can spend 5 sorcery points to give that target vulnerability to that damage type until the start of your next turn.',
      },
    ],
  },

  // ─── Warlock - Warlock of Lilith ──────────────────────────────────
  {
    id: 'warlock-of-lilith',
    parentClassId: 'warlock',
    name: 'Warlock of Lilith',
    nameOriginal: 'Patto di Lilith',
    description:
      'You have made a pact with Lilith, the Mother of Demons, who embodies freedom, rebellion, and savage independence. Her warlocks are fierce individualists who reject all authority.',
    features: [
      {
        id: 'expanded-spell-list-lilith',
        name: 'Expanded Spell List',
        level: 1,
        description:
          'Lilith adds spells to your warlock list: expeditious retreat and hunter\'s mark (1st), calm emotions and levitate (2nd), fly and nondetection (3rd), freedom of movement and private sanctum (4th), dispel evil and good and hallow (5th).',
      },
      {
        id: 'shielding-veils',
        name: 'Shielding Veils',
        level: 1,
        description:
          'Lilith\'s veils cover you: you cannot be charmed, possessed or frightened by aberrations, celestials, fiends, fey or elementals.',
      },
      {
        id: 'fierce-savagery',
        name: 'Fierce Savagery of Lilith',
        level: 1,
        description:
          'You gain proficiency with short bows and long bows. After each rest you can touch one weapon and, until your next rest, use Charisma instead of Strength or Dexterity for its attack and damage rolls. This also applies to your pact weapon.',
      },
      {
        id: 'pact-boon-lilith',
        name: 'Pact Boon',
        level: 3,
        description:
          'You must take the Pact of the Blade. Your pact weapon is always a ranged weapon, it serves as a spellcasting focus for your warlock spells, and it generates its own magical ammunition.',
      },
      {
        id: 'indomitable-freedom',
        name: 'Indomitable Freedom of Lilith',
        level: 6,
        description:
          'As a bonus action you take flight for 1 minute: you gain a flying speed of 30 feet and can hover, once per turn you deal an extra 1d6 force damage with a weapon attack, and you cannot be restrained. You can do this a number of times equal to your proficiency bonus, regaining all uses on a long rest.',
      },
      {
        id: 'rebellion-against-fate',
        name: 'Rebellion Against Fate',
        level: 10,
        description:
          'When you make an attack roll with a weapon and miss, you can use a bonus action to make another attack roll with that weapon against the same target.',
      },
      {
        id: 'ultimate-freedom',
        name: 'Ultimate Freedom of Lilith',
        level: 14,
        description:
          'The extra damage from Indomitable Freedom of Lilith increases to 1d12. While it lasts you cannot be paralyzed, and you do not provoke opportunity attacks when you fly out of a creature\'s reach.',
      },
    ],
  },
]
