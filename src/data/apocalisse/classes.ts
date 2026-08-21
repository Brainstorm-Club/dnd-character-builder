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
          'You have learned to endure hits, assaults and afflictions of any kind without suffering their effects. While you are not at your maximum hit points, you can reroll a failed saving throw and must use the new roll.',
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
          'Your pain threshold grows so high that while raging you cannot become incapacitated, stunned or paralyzed.',
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
          'You learn the guidance and true strike spells if you do not know them. In addition, you can use your action to weep tears of blood and read your immediate future through them: ask your Guide what a course of action you mean to take in the next 24 hours would bring, and they answer with Success, Possibility, Disaster, Uncertainty, Inconsequence or Confusion.',
      },
      {
        id: 'inflicted-destiny',
        name: 'Inflicted Destiny',
        level: 3,
        description:
          'As an action you can foresee a creature\'s death or defeat by weeping blood onto your book and reading the pattern. Spend one use of Bardic Inspiration and choose a creature within 60 feet — you sense its presence even unseen. Roll a number of Bardic Inspiration dice equal to your proficiency bonus and add your Charisma modifier. The target makes a Wisdom saving throw against your spell save DC, taking that much psychic damage and being frightened of you until the end of your next turn on a failure.',
      },
      {
        id: 'warning-revelation',
        name: 'Warning',
        level: 6,
        description:
          'Divinatory signs tell you what is about to happen, and you decipher them fast enough to warn those around you. As a bonus action, spend a use of Bardic Inspiration to choose a creature you can see within 60 feet: until the start of your next turn it cannot be surprised and has advantage on attack rolls and saving throws. If that creature is then hit by an attack, a spell or any other effect, you can spend your reaction and another use of Bardic Inspiration to cancel all damage and every other effect that source deals to it. You are then blinded until the end of your next turn, and cannot use this again until you finish a short or long rest.',
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
      'The sound of bells tolling across the Plain of Armageddon recalls the voice of the Lord and the roaring depths of the Abyss alike. Clerics of the End Times know how to call upon the sounds of the inevitable decay of all things: their bells bring destruction and, at times, renewal. They believe everything must be destroyed in order to be rebuilt, and that ruin, erosion and decline are signs of the ever-closer Last Battle. Domain spells: create or destroy water and thunderwave (1st), magic weapon and shatter (3rd), create food and water and revivify (5th), fabricate and stone shape (7th).',
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
          'As an action you wield your holy symbol and call loudly upon the power of Shaddai the Destroyer. A thundering roar audible within 200 feet spreads from the symbol, and every creature in a 30-foot cone must make a Constitution saving throw against your spell save DC or take 12d12 + your cleric level thunder damage and be stunned until the start of your next turn.',
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
          'As an action you unmake matter itself. A creature reduced to 0 hit points by this power is disintegrated, and it and everything it wears and carries except magic items become a pile of fine gray dust — only a true resurrection can restore it. It automatically disintegrates a Large or smaller nonmagical object or creation of magical force, or a 10-foot cube of a larger one. You regain the use of this feature after a long rest.',
      },
    ],
  },

  // ─── Druid - Circle of Plagues ────────────────────────────────────
  {
    id: 'circle-of-plagues',
    parentClassId: 'druid',
    name: 'Circle of Plagues',
    nameOriginal: 'Circolo delle Piaghe',
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
          'You can partially dissolve into wormwood mist. As a bonus action, you become incorporeal until the start of your next turn. While incorporeal, you have resistance to all damage except force, and you can move through creatures and objects as if they were difficult terrain.',
      },
      {
        id: 'evanescence',
        name: 'Evanescence',
        level: 17,
        description:
          'You master the art of dissolving into wormwood vapor. You can cast gaseous form on yourself at will without expending a spell slot. Additionally, while in your Wormwood Shroud, you are invisible.',
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
          'You learn the basics of Solomonic magic. You gain proficiency in Religion and can read Enochian. Summoning and binding spells you cast have their duration doubled.',
      },
      {
        id: 'solomons-warding',
        name: 'Solomon\'s Warding',
        level: 2,
        description:
          'You can inscribe a warding circle as an action. Fiends and celestials cannot willingly enter or leave the circle unless they succeed on a Charisma saving throw against your spell save DC. The circle lasts for 1 hour.',
      },
      {
        id: 'summon-otherworldly-spirit',
        name: 'Summon Otherworldly Spirit',
        level: 6,
        description:
          'You learn to summon and bind a lesser otherworldly spirit. You can cast summon lesser demons or summon celestial (3rd level version) once per long rest without expending a spell slot or material components.',
      },
      {
        id: 'master-school-solomon',
        name: 'Master of the School of Solomon',
        level: 10,
        description:
          'Your mastery over summoned creatures grows. Creatures you summon gain extra hit points equal to your wizard level and their attacks count as magical. You have advantage on Charisma checks when interacting with summoned creatures.',
      },
      {
        id: 'summon-greater-spirit',
        name: 'Summon Greater Otherworldly Spirit',
        level: 14,
        description:
          'You can bind even the mightiest spirits. You can cast planar binding once per long rest without expending a spell slot. Additionally, when you use your Summon Otherworldly Spirit feature, you can summon a more powerful version of the spirit.',
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
          'At initiation the first four spheres are grafted into your chest, and each costs ki to use. Seal of Conquest: your unarmed strikes can poison a target that fails a save against your ki DC, and 1 ki point adds 1d12 poison damage that ignores resistance. Seal of War: when a creature within 10 feet hits you in melee, spend 2 ki as a reaction to release a gout of flame — Dexterity save or 1d12 fire damage, plus 1d12 per extra ki point up to 6. Seal of Famine: on the Attack action, spend 1 ki to wither a target. Seal of Death: a chilling strike that restrains on a failed save and ignores resistance to cold damage.',
      },
      {
        id: 'seal-of-resurrection',
        name: 'Seal of Resurrection',
        level: 6,
        description:
          'You unlock the Fifth Seal. As an action, you can spend 3 ki points to touch a creature and heal it for a number of HP equal to your monk level + Wisdom modifier. You can also end one disease or one condition (blinded, deafened, paralyzed, or poisoned).',
      },
      {
        id: 'seal-of-eternal-eclipse',
        name: 'Seal of the Eternal Eclipse',
        level: 11,
        description:
          'You unlock the Sixth Seal. As an action, you can spend 4 ki points to create a 20-foot-radius sphere of magical darkness centered on yourself that lasts for 1 minute. You can see normally in this darkness. Enemies in the area have disadvantage on attack rolls and saving throws.',
      },
      {
        id: 'seal-of-silence',
        name: 'Seal of Silence',
        level: 17,
        description:
          'You unlock the Seventh Seal. As an action, you can spend 6 ki points to create a zone of absolute silence in a 30-foot radius for 1 minute. No sound can be made or heard within the area. Creatures that start their turn in the area must make a Constitution save or be stunned until the start of their next turn.',
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
          'As an action, you present your holy symbol and speak of the inevitability of death. Each creature of your choice within 30 feet must make a Wisdom saving throw or be frightened for 1 minute.',
      },
      {
        id: 'channel-divinity-ultima-forsan',
        name: 'Channel Divinity: Ultima Forsan',
        level: 3,
        description:
          'As a bonus action, you channel the urgency of the End Times into your strikes. For 1 minute, you add your Charisma modifier to attack rolls against a creature you can see.',
      },
      {
        id: 'divine-ruin',
        name: 'Divine Ruin',
        level: 3,
        description:
          'When you deal radiant damage with your Divine Smite, the target must also make a Constitution saving throw or have its speed reduced to 0 until the end of its next turn.',
      },
      {
        id: 'aura-of-dismay',
        name: 'Aura of Dismay',
        level: 7,
        description:
          'You emanate an aura of dread in a 10-foot radius. Enemies in the area have disadvantage on saving throws against being frightened. At 18th level, the range increases to 30 feet.',
      },
      {
        id: 'exploit-dismay',
        name: 'Exploit Dismay',
        level: 15,
        description:
          'You can exploit the terror you inspire. When you hit a frightened creature with a melee weapon attack, you deal extra radiant damage equal to your Charisma modifier.',
      },
      {
        id: 'herald-of-the-end',
        name: 'Herald of the End of the World',
        level: 20,
        description:
          'You can assume the form of a Herald of the End Times. For 1 minute, you gain: flying speed of 60 ft., resistance to all damage, and once per turn when you hit with a weapon attack, you can deal an extra 2d10 radiant damage. Once used, you can\'t use this again until you finish a long rest.',
      },
    ],
  },

  // ─── Ranger - Bastion ─────────────────────────────────────────────
  {
    id: 'bastion',
    parentClassId: 'ranger',
    name: 'Bastion',
    nameOriginal: 'Bastione',
    description:
      'Bastions are rangers who serve as frontier guards and sharpshooters, defending the last bastions of civilization against the horrors of the Plain of Armageddon. They specialize in ranged combat with heavy firearms like the culverin.',
    features: [
      {
        id: 'frontier-training',
        name: 'Frontier Training',
        level: 3,
        description:
          'You gain proficiency with firearms (including the culverin). You can use your Dexterity modifier for attack and damage rolls with firearms. You also gain the culverin weapon: ranged martial weapon, 2d8 piercing, range 80/320, ammunition, loading, two-handed.',
      },
      {
        id: 'egregious-training',
        name: 'Egregious Training',
        level: 7,
        description:
          'Your training allows you to reload faster and shoot with deadly precision. You ignore the loading property of firearms. Additionally, your ranged weapon attacks score a critical hit on a roll of 19 or 20.',
      },
      {
        id: 'tireless-shooter',
        name: 'Tireless Shooter',
        level: 11,
        description:
          'When you use the Attack action with a ranged weapon, you can make one additional attack as a bonus action. Additionally, you can add your Wisdom modifier to damage rolls with ranged weapons.',
      },
      {
        id: 'bullseye',
        name: 'Bullseye',
        level: 15,
        description:
          'Your ranged attacks are devastatingly precise. When you score a critical hit with a ranged weapon, you deal an additional 2d8 damage. Additionally, your ranged weapon attacks ignore half cover and three-quarters cover.',
      },
    ],
  },

  // ─── Sorcerer - Otherworldly Heritage ─────────────────────────────
  {
    id: 'otherworldly-heritage',
    parentClassId: 'sorcerer',
    name: 'Otherworldly Heritage',
    nameOriginal: 'Stirpe Ultraterrena',
    description:
      'Your innate magic comes from an otherworldly ancestor - an angel or a demon. This heritage manifests in supernatural abilities that grow stronger as you embrace your dual nature.',
    features: [
      {
        id: 'otherworldly-ancestor',
        name: 'Otherworldly Ancestor',
        level: 1,
        description:
          'Choose your ancestral lineage: Angel or Demon. This choice determines the nature of your otherworldly powers. Angels grant healing and protective abilities; Demons grant destructive and deceptive powers.',
      },
      {
        id: 'otherworldly-sign',
        name: 'Otherworldly Sign',
        level: 1,
        description:
          'Your heritage manifests physically. You gain a visible mark of your ancestry (wings of light, horns, glowing eyes, etc.). You learn one additional cantrip based on your lineage (sacred flame for Angel, fire bolt for Demon).',
      },
      {
        id: 'ancestors-protection',
        name: 'Ancestor\'s Protection',
        level: 1,
        description:
          'Your otherworldly blood protects you. You gain resistance to radiant damage (Angel) or fire damage (Demon). Additionally, you can speak, read, and write Celestial or Infernal, based on your lineage.',
      },
      {
        id: 'new-metamagic-option',
        name: 'New Metamagic Option',
        level: 3,
        description:
          'Your heritage opens a Metamagic option no other sorcerer can learn, letting you bend a spell toward the celestial or infernal nature of your ancestor.',
      },
      {
        id: 'otherworldly-consonance',
        name: 'Otherworldly Consonance',
        level: 6,
        description:
          'Your connection to the otherworldly deepens. When you cast a spell that deals radiant (Angel) or fire (Demon) damage, you can add your Charisma modifier to one damage roll. Additionally, you can spend 2 sorcery points to give yourself wings for 10 minutes.',
      },
      {
        id: 'call-of-blood',
        name: 'Call of Blood',
        level: 14,
        description:
          'Your otherworldly blood sings with power. When you are reduced to half your HP or below, you can use your reaction to unleash a burst of otherworldly energy. Each creature within 10 feet takes radiant (Angel) or fire (Demon) damage equal to your sorcerer level.',
      },
      {
        id: 'otherworldly-affliction',
        name: 'Otherworldly Affliction',
        level: 18,
        description:
          'You fully embrace your otherworldly nature. You permanently gain a flying speed of 30 ft. You gain immunity to radiant (Angel) or fire (Demon) damage. Once per long rest, you can cast divine word (Angel) or fire storm (Demon) without expending a spell slot.',
      },
    ],
  },

  // ─── Warlock - Warlock of Lilith ──────────────────────────────────
  {
    id: 'warlock-of-lilith',
    parentClassId: 'warlock',
    name: 'Warlock of Lilith',
    nameOriginal: 'Warlock di Lilith',
    description:
      'You have made a pact with Lilith, the Mother of Demons, who embodies freedom, rebellion, and savage independence. Her warlocks are fierce individualists who reject all authority.',
    features: [
      {
        id: 'shielding-veils',
        name: 'Shielding Veils',
        level: 1,
        description:
          'Lilith wraps you in protective veils of shadow. When you are not wearing armor, your AC equals 10 + your Dexterity modifier + your Charisma modifier. You can use a shield and still benefit from this feature.',
      },
      {
        id: 'fierce-savagery',
        name: 'Fierce Savagery of Lilith',
        level: 1,
        description:
          'You channel Lilith\'s ferocity. When you deal damage with a warlock cantrip, you can add your Charisma modifier to the damage. Additionally, when a creature hits you with a melee attack, you can use your reaction to deal psychic damage equal to your Charisma modifier to the attacker.',
      },
      {
        id: 'rebellion-against-fate',
        name: 'Rebellion Against Fate',
        level: 3,
        description:
          'You can defy the natural order. When you or a creature within 30 feet fails a saving throw, you can use your reaction to force a reroll. The new result must be used. You can use this feature once per short or long rest.',
      },
      {
        id: 'indomitable-freedom',
        name: 'Indomitable Freedom of Lilith',
        level: 6,
        description:
          'Lilith\'s spirit of rebellion shields your mind. You are immune to being charmed and have advantage on saving throws against being frightened. If you are restrained, you can use a bonus action to attempt to break free.',
      },
      {
        id: 'ultimate-freedom',
        name: 'Ultimate Freedom of Lilith',
        level: 14,
        description:
          'You embody Lilith\'s absolute freedom. As an action, you can transform for 1 minute: you gain a flying speed of 60 ft., resistance to all damage except radiant, and your warlock spells deal extra psychic damage equal to your Charisma modifier. Once used, you can\'t use this again until you finish a long rest.',
      },
    ],
  },
]
