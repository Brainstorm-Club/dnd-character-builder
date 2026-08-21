import type { ClassFeature } from '../dnd5e/classes'

export interface BrancaloniaSubclass {
  id: string
  /** ID of the parent D&D 5e class (e.g. 'barbarian', 'bard') */
  parentClassId: string
  name: string
  nameOriginal?: string
  description: string
  features: ClassFeature[]
}

export const brancaloniaSubclasses: readonly BrancaloniaSubclass[] = [
  // ═══════════════════════════════════════════════════════════════════
  //  Brancalonia Setting Book — one subclass per class
  // ═══════════════════════════════════════════════════════════════════

  // ─── Barbarian - Pagan (Pagano) ───────────────────────────────────
  {
    id: 'pagan',
    parentClassId: 'barbarian',
    name: 'Pagan',
    nameOriginal: 'Pagano',
    description:
      'Where other realms call "barbarians" the invaders and marauders from beyond the borders, the Kingdom\'s pagans have lived inside them for centuries — sometimes since before the cities around them were founded — and speak perfect Vernacular, if with a distinctly recognizable accent. Like their fellows from Overmountain they have chosen Rage, or as they call it "Violence", as the way to settle conflicts and social disputes. The best-known communities inhabit the Pagan Plain, united under the iron paw of Ardarico "ye King", and often accept sylvans and morgants in their ranks.',
    features: [
      {
        id: 'path-of-unheard-of-ferocity',
        name: 'Path of Unheard-of Ferocity',
        level: 1,
        description:
          'Having always had to defend themselves against armies and outsiders\' abuses, pagans developed a path built on wilderness expertise, animal ferocity and predatory instinct — a cross between the way of the legendary Varag bear-men and that of the nature spiritualists. For them rage never escalates into inhuman or bestial fury: it sharpens the senses and infuses the determination to strike first, and with unheard-of ferocity.',
      },
      {
        id: 'savage-courage',
        name: 'Savage Courage',
        level: 3,
        description:
          'You learn to move as fast and as determined as a beast on the hunt. While you are raging and not wearing heavy armor, other creatures have disadvantage on ranged attack rolls against you, and you can take the Dash action as a bonus action on your turn.',
      },
      {
        id: 'unstoppable-rage',
        name: 'Unstoppable Rage',
        level: 6,
        description:
          'You cannot be restrained while you rage, and if you are restrained when you enter a rage the effect ends immediately. In addition, difficult terrain and magical effects cannot reduce your base walking speed.',
      },
    ],
  },

  // ─── Bard - Harlequin (Arlecchino) ────────────────────────────────
  {
    id: 'harlequin',
    parentClassId: 'bard',
    name: 'Harlequin',
    nameOriginal: 'Arlecchino',
    description:
      'They say the first harlequin was a certain Alichino ("bentwings"), a malebranche escaped from Inferno who took to roaming the Kingdom with a company of street actors, bringing villages an unprecedented kind of show made of colorful costumes, gibes, take-downs, pranks and pirouettes. His showy attire and dark, mask-like face paved the way for every harlequin since — the costumed characters of the Comedy of Art, each with a typical caricatural name, personality and appearance. Bards who favor this kind of show over classical musical performance belong to the College of Carnival, an informal union of such artists, mimes and actors.',
    features: [
      {
        id: 'college-of-carnival',
        name: 'College of Carnival',
        level: 1,
        description:
          'Harlequinades have a host of different masks and their best actors are always inventing new ones. The most famous are Hunterine and Redmoustache, Skillet and Ovenbird, Doctor Longjohns, Redingotte and his Minions, Scroogey and the Waifs, and Calandron — but you are free to invent or modify your own mask and choose its name and special characteristics. Though staged all year round, these shows are typical of the Kingdom\'s Carnevale.',
      },
      {
        id: 'bonus-proficiencies-harlequin',
        name: 'Bonus Proficiencies',
        level: 3,
        description:
          'You gain proficiency with the disguise kit, weaver\'s tools and one type of gaming set.',
      },
      {
        id: 'slapstick',
        name: 'Slapstick',
        level: 3,
        description:
          'The slapstick is a perfectly harmless truncheon-like object that emits a loud clacking noise, distracting spectators and making them laugh. When a creature attacks you, you can use your reaction to expend one use of Bardic Inspiration and distract the opponent: it must succeed on a Wisdom saving throw against your spell save DC or be charmed until its next turn and lose its current attack.',
      },
      {
        id: 'unarmored-defense-harlequin',
        name: 'Unarmored Defense',
        level: 3,
        description:
          'While you are wearing no armor and not wielding a shield, your AC equals 10 + your Dexterity modifier + your Charisma modifier.',
      },
      {
        id: 'silence-please',
        name: 'Silence Please',
        level: 6,
        description:
          'You can cast the silence spell with this feature a number of times equal to your Charisma modifier. When you cast any spell that requires a verbal component you can replace it with a somatic component, and the targets of your Bardic Inspiration no longer need to hear you, as long as they can see you.',
      },
    ],
  },

  // ─── Cleric - Miraculist (Miracolaro) ─────────────────────────────
  {
    id: 'miracolaro',
    parentClassId: 'cleric',
    name: 'Miraculist',
    nameOriginal: 'Miracolaro',
    description:
      'The official religion of the Kingdom\'s commoners is the Creed, centered on the worship of the Ternal Father, the Saints of the Calendar and the Relics, and run by a very informal, respected and peaceful clergy under four patriarchs. Miraculists draw special powers from their faith — powers that make them Saints, or will do once they are canonized. They may be secular or religious, children, adults or elderly, of any race, gender or alignment. Some serve in the official ranks as horoscopes or parish priests; others are itinerant gurus, country healers or army chaplains who roam alone or join a Band and use their gifts as they see fit.',
    features: [
      {
        id: 'calendar-domain',
        name: 'Calendar Domain',
        level: 1,
        description:
          'The Kingdom\'s religious year is punctuated by the days of the Calendar, each dedicated to a Saint or a sacred feast — ordinary mortals who performed wonders in life and were canonized, like Saint Polenta, patroness of the hungry, or Holy Peace, who shields her faithful from battle. You gain the Calendar Domain spells, always prepared and not counting against the number of spells you can prepare: protection from evil and good and purify food and drink at 1st level, enhance ability and lesser restoration at 3rd, create food and water and dispel magic at 5th.',
      },
      {
        id: 'call-on-the-saints',
        name: 'Call on the Saints',
        level: 1,
        description:
          'When a creature hits you with an attack, or when you fail a roll, you can use your reaction to Call on the Saints and good-naturedly invoke their help: add your Wisdom modifier to the failed roll, or subtract it from the attack roll against you. You can use this feature a number of times equal to your Wisdom modifier (minimum once), regaining all uses on a long rest.',
      },
      {
        id: 'recite-the-calendar',
        name: 'Channel Divinity: Recite the Calendar',
        level: 2,
        description:
          'You can use Channel Divinity to help your companions: a number of creatures friendly to you equal to your Wisdom modifier gain advantage on a roll of their choice made before the end of their next turn.',
      },
      {
        id: 'by-the-saints',
        name: 'By the Saints!',
        level: 6,
        description:
          'You can use Call on the Saints when a friendly creature you can see within 30 feet fails a roll or is hit by an attack. In addition, you regain expended uses of Call on the Saints on a short rest as well as a long one.',
      },
    ],
  },

  // ─── Druid - Benandante (Benandante) ──────────────────────────────
  {
    id: 'benandante',
    parentClassId: 'druid',
    name: 'Benandante',
    nameOriginal: 'Benandante',
    description:
      'Long before saints, supersticians and miraculists began roaming the countryside, it was the benandante — the Good Walkers — who protected people from hags, devils, monsters and phantasms, and they still fulfill that role despite the considerable competition. These good forest sorcerers straddle the boundary between the spiritual, human and wild realms; they often adore the Ternal Father, but alongside him they worship the old pagan gods now in decline, such as the darker and more earthly Three Mothers. The most famous live near the Crown Mountains, sometimes alone, sometimes in teacher-and-pupil pairs, sometimes in whole congregations like the Outlanders of Zagara.',
    features: [
      {
        id: 'glimpse-beyond-the-veil',
        name: 'Glimpse Beyond the Veil',
        level: 2,
        description:
          'You can see normally in darkness, both magical and nonmagical, out to 120 feet, and you sense the presence of any undead creature within 60 feet of you.',
      },
      {
        id: 'circle-spells-dance-macabre',
        name: 'Circle Spells',
        level: 2,
        description:
          'Your connection with the realm of the dead grants you the sacred flame cantrip and the spells of the Circle of the Dance Macabre: heroism and protection from evil and good at 2nd level, lesser restoration and spiritual weapon at 3rd, remove curse and spirit guardians at 5th. Once you gain access to a circle spell you always have it prepared and it does not count against the number of spells you can prepare each day.',
      },
      {
        id: 'dance-macabre-guardian',
        name: 'Dance Macabre Guardian',
        level: 6,
        description:
          'Undead sense your connection to the spirit world and grow hesitant to attack you. When an undead creature attacks you it must make a Wisdom saving throw against your druid spell save DC; on a failure it must choose a different target or the attack automatically misses. On a success the creature is immune to this effect for 24 hours. The creature is aware of the effect before it makes its attack.',
      },
    ],
  },

  // ─── Fighter - Swordfighter (Spadaccino) ──────────────────────────
  {
    id: 'sword-player',
    parentClassId: 'fighter',
    name: 'Swordfighter',
    nameOriginal: 'Spadaccino',
    description:
      'The Thousand Years\' War is so deeply rooted in the peoples of the Kingdom that it is now considered the only possible way of life, and among the soldiers, condottieri, sappers and scouts it produced are scores of masters of arms, duelists and foil virtuosos collectively known as swordfighters. They are highly regarded across Occasia and the Middle Sea, and every city has its own Fencing Schools, grouped into a few main styles plus some minor or secret ones — all constantly in conflict with one another, given the fierce parochialism prevailing in the Kingdom. Rather than being cannon fodder like common soldiers, swordfighters are mercenaries who act alone and lend their services to noblemen, fops and merchants, more at home on city streets than on muddy battlefields.',
    features: [
      {
        id: 'school-of-fencing',
        name: 'School of Fencing',
        level: 3,
        description:
          'You learn specific techniques that improve your combat effectiveness. Study the Opponent: whenever you take the Dodge action in combat, your next attack has advantage if made before the end of your next turn. Mattock and Dagger: you gain a +1 bonus to AC while wielding a separate melee weapon in each hand. Duel: if you are within 5 feet of a creature and no other creature is within 5 feet of you, you add your proficiency bonus to your damage rolls against that creature.',
      },
    ],
  },

  // ─── Monk - Friar (Frate) ─────────────────────────────────────────
  {
    id: 'friar',
    parentClassId: 'monk',
    name: 'Friar',
    nameOriginal: 'Frate',
    description:
      'Friars and nuns are numerous among the population and represent another face of the Creed in daily life. Among the Kingdom\'s many monastic rules — limping, beggar, mendicant, itinerant, praying, preaching, minorite and minor-brained, hermit, barefoot and chained orders — the friars most often found in Bands are those of the Brawly Orders. Many are simple brothers and sisters who roam the countryside preaching and doing merciful work, but since "Inferno knows no fury like a good person turned bad" it is wise not to push one\'s luck with them: having turned the other cheek but once, their mandate permits them to defend themselves. The best known congregation is the Order of the Calloused Hand.',
    features: [
      {
        id: 'way-of-the-brawly-rule',
        name: 'Way of the Brawly Rule',
        level: 3,
        description:
          'Whatever order they belong to, these nuns and friars all practice the Brawly Rule, whose precepts are loudly known to brigands and robbers: "Ora et Thumpora", "Turn the other palm", "May your hand know how to be iron-strong and feather-gentle", and so on.',
      },
      {
        id: 'turn-the-other-cheek',
        name: 'Turn the Other Cheek',
        level: 3,
        description:
          'You can use your Strength modifier instead of your Dexterity modifier for your Unarmored Defense and Deflect Missiles features. In addition, when an opponent hits you with a melee attack you can spend 1 ki point to make an unarmed strike using your reaction.',
      },
      {
        id: 'iron-and-feather-hand-technique',
        name: 'The Iron & Feather Hand Technique',
        level: 6,
        description:
          'Whenever you hit a creature with an attack from your Flurry of Blows, you can impose one of the following effects. Dexterity saving throw: on a failure the creature is knocked prone. Strength saving throw: on a failure you push the target up to 10 feet away, and if it hits an obstacle it takes damage equal to your unarmed strike — if the obstacle is another creature, that creature must make a Strength saving throw or take the same damage. Constitution saving throw: on a failure the target has disadvantage on attack rolls until the start of your next turn.',
      },
    ],
  },

  // ─── Paladin - Knight-Errant (Cavalier Errante) ───────────────────
  {
    id: 'knight-errant',
    parentClassId: 'paladin',
    name: 'Knight-Errant',
    nameOriginal: 'Cavalier Errante',
    description:
      'Not everyone you meet in the streets of the Kingdom and in the Bounty Brotherhood is a pauper in dire straits. Some Knaves are of noble descent — offspring of fallen families, cadet sons launching into adventure with the weapons and banners of their lineage in plain sight and their rump on an old jade. Generally better educated than most of the populace and armed with robust ambitions and moral principles, these rambling knights are the beggars\' aristocracy and often demand to be treated as such. The almost-supernatural talent they display in battle arises more from valor and determination than from any power conferred by the Ternal Father. Oath spells: bless and command at 3rd level, find steed and pass without trace at 5th.',
    features: [
      {
        id: 'oath-of-knightly-erring',
        name: 'Oath of Knightly Erring',
        level: 3,
        description:
          'Erring: the world is large and must be explored — traveling, having adventures and living by the day are not a fallback but a choice. Brotherhood: defend people from threats and injustice, whether from monsters, marauders or tyrants. Castigating: make worthy amends for your own wrong-doings, and unleash your wrath on those of others. Audacity: never shy away from a feat or a challenge, for it is from your deeds that troubadours will draw their songs.',
      },
      {
        id: 'channel-divinity-knight-errant',
        name: 'Channel Divinity',
        level: 3,
        description:
          'Inspire Comrades: as an action, wield your weapon and inspire up to six friendly creatures within 30 feet (you may include yourself) who can see, hear and understand you — each gains temporary hit points equal to your Charisma modifier, becomes immune to being frightened and has advantage on all Wisdom saving throws for 1 minute. Protect the Needy: as a bonus action, stand up in defense of a creature you can see — for 1 minute, as long as that creature is within 5 feet of you, all attacks against it have disadvantage.',
      },
    ],
  },

  // ─── Ranger - Matador (Mattatore) ─────────────────────────────────
  {
    id: 'mattatore',
    parentClassId: 'ranger',
    name: 'Matador',
    nameOriginal: 'Mattatore',
    description:
      'Matadors are expert hunters who capture beasts and monstrosities from the depths of the wilds, haul them to the cities and sell them for combat, for circuses, or as disturbing defenders for fortresses. They are masters at fighting such monsters in arenas, knowing exactly how to hit, hurt and infuriate their prey in a spectacular manner, and they are gifted circus hucksters and entertainers even during the cruelest shows. For this they often live on the fringes of society — brutal, unfriendly and violent, equally despised by hunters, gladiators and gamekeepers. The most skilled are said to come from Penumbria, where the fauna is so lethal that wolves, bears and catsnakes count as cute little critters.',
    features: [
      {
        id: 'master-of-performance',
        name: 'Master of Performance',
        level: 3,
        description:
          'You gain proficiency in the Animal Handling and Performance skills if you do not already have it, and your proficiency bonus is doubled for any ability check that uses either of them.',
      },
      {
        id: 'eye-of-the-matador',
        name: 'Eye of the Matador',
        level: 3,
        description:
          'As a bonus action you can choose a creature you can see within 60 feet. For 1 minute you add your proficiency bonus to damage against it, your weapon attacks against it score a critical hit on a roll of 19 or 20, and you add your Wisdom modifier to your AC against its attacks. You regain the use of this feature after a short or long rest.',
      },
    ],
  },

  // ─── Rogue - Brigand (Brigante) ───────────────────────────────────
  {
    id: 'brigand',
    parentClassId: 'rogue',
    name: 'Brigand',
    nameOriginal: 'Brigante',
    description:
      'In a world of constant warfare and rivalry among the upper crust, the brigand is often seen as the people\'s true champion against debt collectors, excisemen, burgomasters and finaglers. Brigands are undeniably bandits and street thugs, but for commoners they are frequently much better than "their lordships", who traditionally live off their backs like parasites. There must be at least a hundred and one brigand companies across the Kingdom — the most down-and-out no more than a trio of desperados on donkeyback, the better-organized branched out like small armies holding entire districts. So many claim the title of king or queen of the brigands that the infamous honor is known as the Copper Crown.',
    features: [
      {
        id: 'brigandage',
        name: 'Brigandage',
        level: 3,
        description:
          'Brigands are highway and country thieves, experts on their own territory and at ease in mountains, forests and deserted countryside. You gain proficiency in the Nature and Survival skills.',
      },
      {
        id: 'the-fine-art-of-ambushing',
        name: 'The Fine Art of Ambushing',
        level: 3,
        description:
          'Inferior numbers and weapons put brigands at a disadvantage against guards and caravan wardens, so they became masters of setups and ambushes. You have advantage on initiative rolls and on any action taken during the first turn of each combat.',
      },
    ],
  },

  // ─── Sorcerer - Superstician (Scaramante) ─────────────────────────
  {
    id: 'scaramante',
    parentClassId: 'sorcerer',
    name: 'Superstician',
    nameOriginal: 'Scaramante',
    description:
      'Enchantresses and charmers, fascinating experts in hexes and sorceries, manipulators of Extravaganza and fairy tricks, thaumaturgists skilled at countering the powers of darkness and the maledictions of jinxes, heresiarchs, hags and phantasms. Some are dark sorcerers who deal with infernal powers, others are devoted to the forces of good, others still follow the will of the Three Mothers. Sometimes they gather in covenants and factions; other times they act alone, roaming the countryside offering to remove the evil eye from livestock or to engrave protective glyphs on barns and farms.',
    features: [
      {
        id: 'extravaganza-origin',
        name: 'Extravaganza',
        level: 1,
        description:
          'The power in a superstician\'s veins is that of Extravaganza, the power of fairies and torquoises, which touched their existence somehow before or after they were born — descent from an ancient fairy lover, a fey blessing, or simply contact with them as a child, long enough for some of the tricks to rub off.',
      },
      {
        id: 'preventive-magic',
        name: 'Preventive Magic',
        level: 1,
        description:
          'When your Spellcasting feature lets you learn or replace a sorcerer cantrip or a sorcerer spell of 1st level or higher, you can choose an Abjuration spell from any other class\' spell list in addition to those on the sorcerer spell list.',
      },
      {
        id: 'protected-by-fate',
        name: 'Protected by Fate',
        level: 1,
        description:
          'You can manipulate the odds of fate. Roll an additional d20 when you make an attack roll, an ability check or a saving throw, and choose which d20 is used — you can decide to use this after you roll but before the outcome is determined. You can also use it when an attack roll is made against you: roll a d20, then choose whether the attack uses the attacker\'s roll or yours. You must finish a long rest before you can use this feature again.',
      },
      {
        id: 'superstitious-ritual',
        name: 'Superstitious Ritual',
        level: 6,
        description:
          'You can conduct a 10-minute ritual to protect a target creature, including yourself, with one of the following effects: resistance to a damage type of your choice among acid, bludgeoning, cold, fire, lightning, necrotic, piercing, slashing and thunder; or the ability to reroll a 1 on an ability check or saving throw and use the new roll; or dropping to 1 hit point instead of 0 when reduced to 0 but not killed outright, which ends the protection. The ritual lasts 24 hours or until you use this feature again, and you can extend it by another 24 hours for 2 sorcery points. You regain the use of this feature after a long rest.',
      },
    ],
  },

  // ─── Warlock - Jinx (Menagramo) ───────────────────────────────────
  {
    id: 'menagramo',
    parentClassId: 'warlock',
    name: 'Jinx',
    nameOriginal: 'Menagramo',
    description:
      'Northerners who arrive in the Kingdom under the name of warlocks are known south of the Crown Mountains as jinxes: powerful and feared conjurers able to cast curses and misfortunes with a sideways glance, a false and envious word, a touch of annoyance and remorse. All their power derives from Madame Jinx, the Misfortune that deflects human destinies toward the darkest outcomes and against which even the invocations of every Saint of the Calendar are useless. For the Creed, Misfortune is only a saying — but everyone in the Kingdom knows how very real it is. Expanded spells: bane and sleep at 1st level, blindness/deafness and spike growth at 2nd, animate dead and bestow curse at 3rd.',
    features: [
      {
        id: 'evil-eye',
        name: 'Evil Eye',
        level: 1,
        description:
          'Your patron grants you the power to spread doubts in an opponent\'s mind. Choose a creature within 40 feet that can hear you: the target has disadvantage on the next saving throw it makes against a spell you cast. You regain the use of this feature after a short or long rest.',
      },
      {
        id: 'misfortune-touch',
        name: 'Misfortune Touch',
        level: 6,
        description:
          'You invoke your patron to bring great and unspeakable misfortune. For a moment a ghostly figure seems to appear behind you and lay a diaphanous hand on your shoulder, and you emanate an aura of intense misfortune in a 20-foot radius for a number of rounds equal to your Charisma modifier. Every creature but you inside the area has disadvantage on all attack rolls, ability checks and saving throws. When the effect ends, Madame Jinx calls in your debt and you drop to 0 hit points. You regain the use of this feature after a long rest.',
      },
    ],
  },

  // ─── Wizard - Guiscard (Guiscardo) ────────────────────────────────
  {
    id: 'guiscardo',
    parentClassId: 'wizard',
    name: 'Guiscard',
    nameOriginal: 'Guiscardo',
    description:
      'Guiscards are a closed and exclusive guild of conmen and magic-users with branches across Occasia, whose intent is to recover artifacts, relics and fragments of lost wisdom — enriching the college and their own rank within it along the way. After their apprenticeship they leave school and travel the Kingdom, alone or in Bands, following maps and solving puzzles, hunting treasures and entrances to the ruins of the past. They are the Kingdom\'s most celebrated wizards: cheaters, charlatans, street swindlers and seekers of arcane treasures, who learn in their guild a mixture of thieving tricks and spells — which makes them excellent Knaves, much sought after by companies and by guards alike.',
    features: [
      {
        id: 'treasure-seeker',
        name: 'Treasure Seeker',
        level: 2,
        description:
          'You gain proficiency in the Investigation and Perception skills, and proficiency with light armor and a martial one-handed weapon of your choice.',
      },
      {
        id: 'magic-items-expert',
        name: 'Magic Items Expert',
        level: 2,
        description:
          'Whenever you make an ability check related to magic items or magic devices, you are considered proficient in the skill used and add double your proficiency bonus to the check instead of your normal proficiency bonus.',
      },
      {
        id: 'magical-trinkets',
        name: 'Magical Trinkets',
        level: 2,
        description:
          'Guiscards carry around a great many magical trinkets, the fruit of their studies and explorations — genuinely magical, though often damaged or malfunctioning. You can use any magical item in your possession as a spellcasting focus for your wizard spells, and you own an uncommon magic item of your choice from the Magical Junk list.',
      },
      {
        id: 'master-of-extravaganza',
        name: 'Master of Extravaganza',
        level: 6,
        description:
          'You can attune to 4 magic items instead of 3, and you can ignore any prerequisite required to attune to a magic item.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  //  Macaronicon — New Subclasses
  // ═══════════════════════════════════════════════════════════════════

  // ─── Barbarian - Mountaineer (Montanaro) ──────────────────────────
  {
    id: 'mountaineer',
    parentClassId: 'barbarian',
    name: 'Mountaineer',
    nameOriginal: 'Montanaro',
    description:
      'Far from cities, ports and countryside, up among the mouflons and the ibex, roam the mountaineers: extraordinary guides, explorers and smugglers, agile as wild goats and silent as wolves, with their faithful flask always at their side. In wartime they are hired as scouts, spies and saboteurs; in peacetime they escort shepherds, travellers and wanted outlaws over the most inaccessible ranges. Among the noble arts of these rude folk of the peaks is the distillation of the grappanels — spirits fermented from mountain herbs that resonate with a mountaineer alone.',
    features: [
      {
        id: 'mountaineer-path',
        name: 'Mountaineer Path',
        level: 3,
        description:
          'You always carry your flasks of spirits with you. When you enter a rage you can take a sip from one of them and gain, for the duration of the rage, the benefit of the chosen Grappanel, plus resistance to psychic damage. Demoncello: you see in magical and nonmagical darkness up to 120 feet, can move along vertical surfaces and ceilings with your hands free, and gain a climbing speed equal to your walking speed. Gramp\'s Sgnap: resistance to cold damage; each creature that starts its turn within 10 feet of you takes 1d6 cold damage from your alpine breath. Storica Rossa: resistance to fire damage; when a melee attack damages you, you can use your reaction to breathe flame at the attacker, which takes 2d8 fire damage on a failed Dexterity save, half on a success. Stravecchia: resistance to necrotic damage; the first creature you hit each turn takes an extra 1d8 necrotic damage. Vincanto: the spirits of ancient mountaineers sing around you — you gain resistance to radiant damage, shed dim light in a 10-foot radius, and when you rage the spirits cast bless or shield of faith at its lowest level, lasting until the rage ends without concentration.',
      },
      {
        id: 'ancient-art-of-the-grappanel',
        name: 'Ancient Art of the Grappanel',
        level: 3,
        description:
          'You gain proficiency with brewer\'s supplies, and your flasks of grappanel are always considered to be with you and full when you enter a rage.',
      },
      {
        id: 'blend',
        name: 'Blend',
        level: 6,
        description:
          'You can sip a blend of two different spirits each time you enter a rage and benefit from both effects at once.',
      },
    ],
  },

  // ─── Bard - Guappo (Guappo) ───────────────────────────────────────
  {
    id: 'guappo',
    parentClassId: 'bard',
    name: 'Guappo',
    nameOriginal: 'Guappo',
    description:
      'In the variegated underworld of the Kingdom, the guappo is the flamboyant, boastful and pompous rascal — often charismatic and good-hearted too. To common folk he is a street musician, an entertainer, a ladies\' man and a righter of wrongs rather than a Knave. Guappi are skilled in knife duels and enemies of bullies, guards and overbearing criminals. Bards of the College of Guappary perform the complete repertoire of the Kingdom\'s folk songs, ballads and serenades, and are an incomparable source of rumors for foreign Knaves.',
    features: [
      {
        id: 'competence-bonus',
        name: 'Competence Bonus',
        level: 3,
        description:
          'You gain proficiency in the Intimidation skill and the thieves\' cant feature.',
      },
      {
        id: 'implied-folksong',
        name: 'Implied Folksong',
        level: 3,
        description:
          'You can compose a piece that undermines the confidence of its listeners. After performing for at least 1 minute, choose a number of humanoids within 120 feet who watched and heard you, up to your Charisma modifier (minimum one). Each target must succeed on a Wisdom saving throw against your spell save DC or be frightened; on a success the target has no idea you tried to frighten them. You regain the use of this feature after a short or long rest.',
      },
      {
        id: 'unambiguous-violence',
        name: 'Unambiguous Violence',
        level: 3,
        description:
          'When you make an attack you can expend one use of Bardic Inspiration. If the attack hits, roll the Bardic Inspiration die and add that much psychic damage to the damage roll. The target must then succeed on a Wisdom saving throw against your spell save DC or be frightened for a number of rounds equal to the die result, repeating the save at the end of each of its turns.',
      },
      {
        id: 'do-be-cruel',
        name: 'Do Be Cruel',
        level: 6,
        description:
          'You have advantage on attack rolls against any creature that is frightened, grappled, incapacitated or poisoned.',
      },
    ],
  },

  // ─── Cleric - Exorcist (Esorcista) ────────────────────────────────
  {
    id: 'exorcist',
    parentClassId: 'cleric',
    name: 'Exorcist',
    nameOriginal: 'Esorcista',
    description:
      'Some members of the Calendar Creed, the Paradox Faith or the Revelation are known as exorcists, expressly concerned with confronting the supernatural forces of evil that afflict the good citizens of the Kingdom. Like miraculists they draw on a divine spark, but they channel it through a body of well-coded rituals, formulas and gestures. Their mandate keeps them on the road, alone or with Bands, investigating occult manifestations — which makes mingling with scoundrels and idlers both easy and useful, since that is exactly where Hell\'s plots unfold. Domain spells: detect evil and good, incandescent mark (1st); exorcism, zone of truth (2nd); magic circle, cleanse (3rd).',
    features: [
      {
        id: 'between-the-hammer-and-the-evil',
        name: 'Between the Hammer and the Evil',
        level: 1,
        description: 'You gain proficiency with martial weapons and heavy armor.',
      },
      {
        id: 'the-revelation-gab',
        name: 'The Revelation Gab',
        level: 1,
        description:
          'As an action you can brandish your holy symbol and utter the prayer of revelation. You learn whether places, objects and creatures within 60 feet are cursed, possessed, infested or under an evil influence, and you understand the nature of that influence (creature, magic or effect). You can use this a number of times equal to your Wisdom modifier (minimum once), regaining all uses on a long rest.',
      },
      {
        id: 'true-mirror',
        name: 'True Mirror',
        level: 2,
        description:
          'When you use Turn Undead, fey and fiends are also affected. If a turned creature\'s true form is hidden by an illusion, a mutated form or a similar effect, that form is revealed.',
      },
      {
        id: 'the-flame-of-the-just',
        name: 'The Flame of the Just',
        level: 6,
        description:
          'When you use The Revelation Gab you can learn more: the history of a haunted place, a creature\'s power level, its weaknesses, or how to lift a curse. In addition, when you use Turn Undead you can choose to have creatures that fail their save be restrained instead of turned.',
      },
    ],
  },

  // ─── Fighter - Bravo (Bravo) ──────────────────────────────────────
  {
    id: 'bravo',
    parentClassId: 'fighter',
    name: 'Bravo',
    nameOriginal: 'Bravo',
    description:
      'Bravos are fighters specialized in city life — in operating among commoners, criminals and guards rather than in the wilderness or on the battlefield. A bravo protects a big fish, intimidates an insolvent debtor and keeps watch over places and people: the perfect hitter and henchman on some rich patron\'s payroll. Hired swords and bodyguards on the edge of the law, or more likely outside it, they favor a wide-brimmed hat, a dark cloak, a belt bristling with hilts and worn but well-polished boots.',
    features: [
      {
        id: 'disheartening-presence',
        name: 'Disheartening Presence',
        level: 3,
        description:
          'You gain proficiency in the Intimidation skill, and you can add your Strength modifier to every Intimidation check you make.',
      },
      {
        id: 'street-fighter',
        name: 'Street Fighter',
        level: 3,
        description:
          'You learn three low blows of your choice, fueled by four foul play dice (d8), regained on a short or long rest. You can use only one low blow per attack. Low blow save DC = 8 + your proficiency bonus + your Strength or Dexterity modifier (your choice). Counterkick: when a creature within 5 feet tries to cast a spell, use your reaction and a die to make an unarmed attack; on a hit add the die to the damage and the creature loses the spell unless it succeeds on a Constitution save. Cut-and-run: on a melee hit, spend a die — the target can\'t make opportunity attacks and its speed is halved for a number of rounds equal to the roll. Human Shield: when a creature attacks you, use your reaction and a die to deflect the attack onto a friendly creature within the attacker\'s reach, reducing the damage by the roll + your Strength or Dexterity modifier. Infamous Attack: on a weapon hit, spend a die and add it to the damage; on a failed Wisdom save the target has disadvantage on attack rolls against anyone but a friendly creature of your choice within 5 feet of you until the end of your next turn. Sand in the Eyes: on a weapon hit, spend a die and add it to the damage; on a failed Wisdom save the target has disadvantage on all attack rolls until the end of your next turn. Sudden Head Butt: on a melee hit, spend a die and add it to the damage; from the next round the target\'s initiative drops by the number rolled.',
      },
    ],
  },

  // ─── Monk - Svanzic Guard (Guardia Svanzica) ──────────────────────
  {
    id: 'svanzic-guard',
    parentClassId: 'monk',
    name: 'Svanzic Guard',
    nameOriginal: 'Guardia Svanzica',
    description:
      'Not all the monks who roam the Kingdom are punch-happy friars on dusty country roads. There are noble, exclusive and secret monastic traditions — the aristocracy of the Brawly Orders of the Creed — and the most famous is the Svanzic Guard, a battalion of monks expert in unarmed combat and the halberd. Kept at around five hundred strong and paid handsomely in Elevezia\'s silver svanzics, they serve as the Patriarch King\'s chosen guard in Vaticin City, and are sometimes sent abroad as spies, observers or messengers — which is how many end up in Bands, where their matchless training always stands out.',
    features: [
      {
        id: 'training-of-the-guard',
        name: 'Training of the Guard',
        level: 3,
        description:
          'You become a master of the halberd and gain the following benefits: proficiency in the Religion skill; proficiency with the halberd, which counts as a monk weapon for you; while wielding a halberd you have a +2 bonus to AC when you take the Dodge action; while wielding a halberd, other creatures that enter your reach provoke an opportunity attack, which you must make with the halberd; and when you hit a creature with a halberd attack you can spend 1 ki point to knock it prone unless it succeeds on a Constitution saving throw.',
      },
      {
        id: 'sacred-svanzic-dogma',
        name: 'Sacred Svanzic Dogma',
        level: 6,
        description:
          'You gain the thaumaturgy cantrip, and as an action you can spend 2 ki points to cast beacon of hope, searing smite, shield of faith or spirit guardians without providing material components.',
      },
    ],
  },

  // ─── Paladin - Gallant Knight (Cavalier Servente) ─────────────────
  {
    id: 'gallant-knight',
    parentClassId: 'paladin',
    name: 'Gallant Knight',
    nameOriginal: 'Cavalier Servente',
    description:
      'These aristocrats, courtiers and knights are devoted not to a cause or an abstract ideal but to Courtly Love, and in particular to a specific Lady or Sire whose "servant" they have become. It is almost always a genuine social contract and a court custom: knight and Paramour exchange secrets, advice and company. Each knight serves one Paramour and each Paramour has one serving knight; the bond may stay epistolary for years, but severing it for trivial reasons is a great shame. Some gallant knights serve a distant princess who does not even know they exist — and the power of Courtly Love grants them their gifts all the same. Oath spells: charm person, heroism (3rd); calm emotions, warding bond (5th).',
    features: [
      {
        id: 'oath-of-love',
        name: 'Oath of Love',
        level: 3,
        description:
          'You enter the Service of Love for your Sire or Lady. Service of Love: serve your Paramour at all times, or dedicate yourself to nothing but the deeds that would make them proud of you. Loyalty of Love: uphold the whole sum of courteous chivalry — kindness, benevolence, upright justice, friendship, the search for beauty, dedication, humanity and empathy.',
      },
      {
        id: 'channel-divinity-gallant-knight',
        name: 'Channel Divinity',
        level: 3,
        description:
          'Divine Love: as an action, call on the divine love within yourself to gain resistance to all damage. While it lasts you cannot cast spells or concentrate on them, and the effect ends early if you fall unconscious, or if your turn ends and you have neither attacked a hostile creature nor taken damage since your last turn; you can also end it as a bonus action. Hymn to Love: as an action, unleash your fervor in an ecstatic chant — each hostile creature within 30 feet must make a Wisdom saving throw, taking 3d8 radiant damage and being deafened on a failure, or half as much damage on a success.',
      },
    ],
  },

  // ─── Ranger - Rat Catcher (Acchiapparatti) ────────────────────────
  {
    id: 'rat-catcher',
    parentClassId: 'ranger',
    name: 'Rat Catcher',
    nameOriginal: 'Acchiapparatti',
    description:
      'In the largest and most convoluted cities of the Kingdom the Rat Catcher\'s trade is widespread, and it covers far more than the name suggests: pests and parasites, the beasts of sewers and catacombs, carrion, animated objects that will not stay where they belong, and even fairies and specters. The city and its dungeons, cellars, canals, catacombs and towers are this urban hunter\'s favorite hunting ground — a terrain of challenge and combat no safer than the wilderness. Try patrolling Tarantasia\'s sewers, Vortiga\'s canals or Crimini\'s alleys, and then we\'ll talk about it.',
    features: [
      {
        id: 'rat-catchers-magic',
        name: 'Rat Catcher\'s Magic',
        level: 3,
        description:
          'You learn additional spells that count as ranger spells for you but do not count against the number of ranger spells you know: incandescent mark at 3rd level and flame blade at 5th level.',
      },
      {
        id: 'torch-bearer',
        name: 'Torch Bearer',
        level: 3,
        description: 'When you deal fire damage, you can add your Wisdom modifier to it.',
      },
      {
        id: 'danger-perception',
        name: 'Danger Perception',
        level: 3,
        description:
          'You have advantage on Dexterity saving throws against any effect you can sense, such as traps and spells. You lose this benefit while blinded, deafened or incapacitated.',
      },
      {
        id: 'urban-guide',
        name: 'Urban Guide',
        level: 3,
        description:
          'You count urban areas, sewers, cellars, fortresses and city buildings of all sorts as your favored terrain.',
      },
    ],
  },

  // ─── Rogue - Gadgeteer (Congegnere) ───────────────────────────────
  {
    id: 'gadgeteer',
    parentClassId: 'rogue',
    name: 'Gadgeteer',
    nameOriginal: 'Congegnere',
    description:
      'The Kingdom is not only a land of scoundrels, condottieri, friars and noblemen: its cities and academies are not short on artists, inventors, jewelers, watchmakers and architects capable of real works of genius. Those who specialize in precision watchmaking, ramshackle devices and mechanisms of every kind are called Gadgeteers — and since thieves, criminals and villains hire them constantly to build what they need, the best of them belong to the rogue class.',
    features: [
      {
        id: 'macgadget',
        name: 'MacGadget',
        level: 3,
        description:
          'You gain proficiency with tinker\'s tools and learn to craft makeshift items out of any junk at hand. Spend 1 minute consuming objects of a total value equal to or greater than the item you want, then make an Intelligence (tinker\'s tools) check against DC 10, or the item\'s value in gold if higher. The item you create is a shoddy version of the original.',
      },
      {
        id: 'bag-of-gadgeteering',
        name: 'Bag of Gadgeteering',
        level: 3,
        description:
          'You know every Gadget below. Gadgets work only for you, weigh nothing, and can be prepared to a number equal to 1 + your Intelligence modifier (minimum 1), changed on a long rest and chosen more than once. Each is single-use and regained on a short or long rest; some can be set as a trap over 1 minute and triggered with your reaction from within 40 feet. Gadget save DC = 8 + your proficiency bonus + your Dexterity or Intelligence modifier (your choice). Dazzling Contraption: a blinding blaze in a 10-foot radius within 20 feet — Constitution save or blinded until the end of the target\'s next turn (trap). Diving Mask: activate or deactivate as a bonus action; while worn and active you do not need to breathe, for a total of 10 minutes. Exploding Contraption: an explosion of splinters in a 10-foot radius within 20 feet — Dexterity save for 3d6 + your Intelligence modifier piercing damage, half on a success (trap). Flaming Bellow: a 15-foot cone of fire. Foolishnet: hooked threads in a 10-foot radius within 20 feet — Dexterity save or restrained, escapable with a Strength check against the gadget save DC (trap). Greasing Contraption: a 10-foot square of oily glaze within 20 feet becomes difficult terrain for 1 minute — Dexterity save or fall prone on entering or ending a turn there; the oil is flammable and burns for 2 rounds, dealing 2d4 fire damage (trap). Mechanical Wings: a bonus action grants a flying speed of 50 feet for 10 minutes, but you cannot fly upward and drop 5 feet at the start of each of your turns. Stinking Contraption: a heavily obscured 10-foot-radius cloud of nauseating gas within 20 feet, lasting 1 minute — Constitution save or lose your action to spasms; creatures that do not breathe are immune (trap).',
      },
    ],
  },

  // ─── Sorcerer - Heresiarch (Eresiarca) ────────────────────────────
  {
    id: 'heresiarch',
    parentClassId: 'sorcerer',
    name: 'Heresiarch',
    nameOriginal: 'Eresiarca',
    description:
      'The Creed is a religion of extreme tolerance, dedicated more to good living and collecting alms than to inquisitions — but the one thing clergy and faithful cannot bear is the Heresiarchs: sorcerers who adore and draw power from Lucifuge, the Archdevils, the Malacodas and the whole pseudo-monarchy of Inferno. Perhaps an ancestor made a Pact, perhaps the Knave was conceived during rituals better left undescribed. The power is innate, but the path of perdition is neither necessary nor predestined: if devils themselves can leave Inferno and live as ordinary people, so can someone with a drop of diabolical blood. Infernal spells: charm person, disguise self (1st); enthrall, suggestion (2nd); fear, phantom steed (3rd).',
    features: [
      {
        id: 'heresy-stigma',
        name: 'Heresy Stigma',
        level: 1,
        description:
          'You have darkvision out to 120 feet and gain proficiency in the Deception skill.',
      },
      {
        id: 'infernal-magic',
        name: 'Infernal Magic',
        level: 1,
        description:
          'You learn additional spells at the levels shown in the Infernal Spells table. They count as sorcerer spells for you but do not count against the number of sorcerer spells you know, and you cannot replace them when you gain a level in this class.',
      },
      {
        id: 'the-ninth-gate',
        name: 'The Ninth Gate',
        level: 6,
        description:
          'When you cast a spell that deals damage, you can spend 1 sorcery point to change the damage type to psychic, infusing the spell with the echoes of the terror and agony felt by the damned.',
      },
    ],
  },

  // ─── Warlock - Talismancer (Talismante) ───────────────────────────
  {
    id: 'talismancer',
    parentClassId: 'warlock',
    name: 'Talismancer',
    nameOriginal: 'Talismante',
    description:
      'Instead of Madame Jinx or some fiendish patron, certain warlocks draw power from celestial essences scattered through the earthly world — astral talismans called Enchiridia, "that which one carries in hand", because they must be grafted into the bearer\'s palm to work. These sentient mystical gems are almost certainly of angelic or celestial origin, fallen from the Firmament or trafficked across the world from the blessed forges of Urania. The fusion between Enchiridion and talismancer is so profound that detaching it would kill them — though nothing obliges the bearer to use its light benevolently. Expanded spells: bless, shield of fate (1st); exorcism, searing smite (2nd); angelic emanation, daylight (3rd).',
    features: [
      {
        id: 'chosen-bearer',
        name: 'Chosen Bearer',
        level: 1,
        description:
          'You gain proficiency with medium armor, shields and martial weapons.',
      },
      {
        id: 'angelic-fervor',
        name: 'Angelic Fervor',
        level: 1,
        description:
          'Choose one of the following benefits. When you hit a creature with a weapon attack you can infuse the strike with the Enchiridion\'s fury, dealing extra radiant damage equal to your Charisma modifier, and you can expend warlock spell slots to add a further 1d8 damage per slot level. Or: when you are hit by an attack you can use your reaction to release a wave of invigorating energy, granting yourself and every friendly creature within 10 feet temporary hit points equal to your Charisma modifier, plus an extra 1d8 per warlock spell slot level you expend. You can use this feature a number of times equal to your Charisma modifier (minimum once), regaining all uses on a short or long rest.',
      },
      {
        id: 'angelic-intercession',
        name: 'Angelic Intercession',
        level: 6,
        description:
          'When you are reduced to 0 hit points but not killed outright, your patron\'s energies pour out of the Enchiridion. You and every friendly creature within 30 feet regain hit points equal to 2d8 + your Charisma modifier, and each enemy within 30 feet must make a Wisdom saving throw, taking 2d8 + your Charisma modifier radiant damage on a failure or half as much on a success. You regain the use of this feature after a long rest.',
      },
    ],
  },
]

export function getBrancaloniaSubclassById(id: string): BrancaloniaSubclass | undefined {
  return brancaloniaSubclasses.find(s => s.id === id)
}

export function getBrancaloniaSubclassesForClass(parentClassId: string): BrancaloniaSubclass[] {
  return brancaloniaSubclasses.filter(s => s.parentClassId === parentClassId)
}
