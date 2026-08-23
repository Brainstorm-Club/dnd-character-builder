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
      // Il manuale italiano conta calamaio e pennino come due voci separate
      // ("un calamaio di inchiostro nero, un pennino"); qui erano fuse in
      // 'A bottle of black ink and a pen'. Separate anche nell'innamorato,
      // per contare l'equipaggiamento come lo conta il manuale.
      'A bottle of black ink',
      'An ink pen',
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
        'Your Bounty is higher than usual because of a serious misdeed that has been attributed to you, fairly or unfairly, along with a few aggravating factors: evasion, desertion, betrayal, interrupting a public execution, resisting arrest, assaulting a guard, sedition, riot, brigandage or pillage. Your Bounty increases by 100 gp.',
    },
  },

  // ─── Rover (Brado) ────────────────────────────────────────────────
  {
    id: 'rover',
    name: 'Rover',
    nameOriginal: 'Brado',
    description:
      'You spend most of your life in the free, natural manner traditional of the feral communities: with the wolfcats, the hermits and the heretics, the woodcutters, coalmen and shepherds of the wild places. Rovers are hunter-gatherers who read the land the way townsfolk read a signpost, and they move through territory that swallows anyone else.',
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

  // ═══ Macaronicon 2.2 ═══════════════════════════════════════════════

  // ─── Crosser (Passatore) ──────────────────────────────────────────
  {
    id: 'crosser',
    name: 'Crosser',
    nameOriginal: 'Passatore',
    description:
      'You are an expert in land smuggling, especially through mountain passes, impassable rivers, swamps, woods, and every sort of natural obstacle. You move alone or in very small groups, along paths and tracks that guards and soldiers cannot find. The most feared and priciest crossers know the secrets of the Mistide, and how to get goods and people in and out of Penumbria.',
    skillProficiencies: ['stealth', 'survival'],
    toolProficiencies: ['Vehicles (land and water)'],
    languages: 1,
    equipment: ["A set of traveler's clothes", 'A pouch containing 15 sp'],
    feature: {
      name: 'Boundless',
      description:
        'You are an expert in crossing borders by land, avoiding checkpoints, environmental dangers, and problems of every sort, all while going unnoticed. This also extends to any Fumarea crossing by land, for which you need not roll any survival check.',
    },
  },

  // ─── Dispatch Rider (Staffetta) ───────────────────────────────────
  {
    id: 'dispatch-rider',
    name: 'Dispatch Rider',
    nameOriginal: 'Staffetta',
    description:
      'Whistling wind, raging storms, a pair of shoddy shoes: if the captain gives the order, someone has to go out into the night to deliver orders and messages of primary importance. That someone is you.',
    skillProficiencies: ['athletics', 'survival'],
    toolProficiencies: ['One type of game set', 'Vehicles (land)'],
    languages: 0,
    // Mancavano tre voci su cinque e la borsa era senza importo: il Macaronicon
    // dà «una mostrina con i gradi, una borsa con una tasca segreta per i
    // dispacci, una serie di dadi o un mazzo di minchiate, un abito comune,
    // una borsa con 10 ma». Prima: solo mostrina e "a secret communication".
    equipment: [
      'A rank insignia',
      'A pouch containing a secret pocket for dispatches',
      'A dice set or a poppycock card deck',
      'A set of common clothes',
      'A pouch containing 10 sp',
    ],
    feature: {
      name: 'Through Good and Bad Weather',
      description:
        'Dispatch riders have learned to be unstoppable, delivering their messages at any cost. When you travel, you ignore effects that slow your march.',
    },
  },

  // ─── Enamored (Innamorato) ────────────────────────────────────────
  {
    id: 'enamored',
    name: 'Enamored',
    nameOriginal: 'Innamorato',
    description:
      'A privileged, well-educated youth, expert in the liberal arts and sophisticated hobbies, raised to become a flirt, a diplomat, a gigolo, a courtier. Prying skirmishes, complicated love customs, jealous pranks, and dramatic heartaches fill your nights and days — and behind them lies a life dedicated to building and managing personal relationships.',
    skillProficiencies: ['history', 'persuasion'],
    toolProficiencies: ['One type of musical instrument', "Calligrapher's supplies"],
    languages: 1,
    equipment: [
      'A musical instrument (one of your choice)',
      'A collection of love letters',
      'A book of poetry',
      // Come per l'azzeccagarbugli: il manuale (e anche l'edizione inglese,
      // «ink (one ounce bottle), an ink pen») conta due voci, non una.
      'A bottle of black ink',
      'An ink pen',
      'A pouch containing 15 sp',
    ],
    feature: {
      name: 'Courtesy',
      description:
        'Accustomed to softness, kindness, and refinement of all kinds, you use poetry, urbane manners, grace, and flirtation to obtain small favors and privileges, especially among notables and bigwigs or among kind-hearted people.',
    },
  },

  // ─── Impresario (Impresario) ──────────────────────────────────────
  {
    id: 'impresario',
    name: 'Impresario',
    nameOriginal: 'Impresario',
    description:
      'You scout talent, book venues, and keep a travelling company on the road. Where others see a bare square you see a stage, and where others see a crowd you see an audience that has not paid yet.',
    skillProficiencies: ['insight', 'persuasion'],
    toolProficiencies: ['Two types of gaming set'],
    languages: 2,
    // Mancava l'abito e la borsa era di 15 ma: il Macaronicon dà «un libro con
    // segnati i nomi di aspiranti teatranti, un abito di buona fattura, una
    // borsa con 20 ma». L'abito resta distinto da 'A set of fine clothes'
    // (l'"abito pregiato" dell'azzeccagarbugli) perché il manuale italiano usa
    // due diciture diverse e la scheda deve mostrarle diverse.
    equipment: [
      'A book containing the names of aspiring stage performers',
      'A well-made outfit',
      'A pouch containing 20 sp',
    ],
    feature: {
      name: 'The Art of Making Do',
      description:
        'You are used to facing unexpected events of all kinds and you are always able to patch things up somehow, improvising components to put together a valid representation of what you need.',
    },
  },

  // ─── Lucignolo (Lucignolo) ────────────────────────────────────────
  {
    id: 'lucignolo',
    name: 'Lucignolo',
    nameOriginal: 'Lucignolo',
    description:
      'You have one foot in the Kingdom and one in the Extravaganza, that fairy world of pleasures and dangers where those who enter rarely come back the same. You know its doors, its prices, and how to leave before the bill comes due.',
    skillProficiencies: ['deception', 'persuasion'],
    toolProficiencies: ['Two types of game set'],
    languages: 1,
    // Mancava il Cimelio aggiuntivo. Il Macaronicon dà «un abito comune, una
    // borsa con 15 ma, un Cimelio aggiuntivo»: il trofeo da rissa e la mappa
    // delle locande sono dell'attaccabrighe, non del lucignolo.
    equipment: ['A set of common clothes', 'A pouch containing 15 sp', 'One additional Memorabilia'],
    feature: {
      name: 'My Dinner with Fairies',
      description:
        "Accustomed to entering and exiting the Extravaganza's world, you know how to find its passages and how to deal with the fey who guard them.",
    },
  },

  // ─── Prelate (Prelato) ────────────────────────────────────────────
  {
    id: 'prelate',
    name: 'Prelate',
    nameOriginal: 'Prelato',
    description:
      'You hold a position in the hierarchy of the Creed. Whether you earned it, bought it, or inherited it, the robe opens doors that no blade could.',
    skillProficiencies: ['persuasion', 'religion'],
    toolProficiencies: [],
    languages: 2,
    // Mancavano le vesti e la borsa era di 15 ma: il Macaronicon dà «un simbolo
    // sacro d'oro, un libro di preghiere, vesti da sacerdote, una borsa con
    // 25 ma». La voce non è 'Vestments' perché quella chiave è già dei
    // paramenti sacri dell'accolito 5e e in italiano suona diversa.
    equipment: [
      'A golden holy symbol',
      'A book of prayers',
      'Priest\'s vestments',
      'A pouch containing 25 sp',
    ],
    feature: {
      name: 'Deference and Influence',
      description:
        'Thanks to your prominent position, you are held in deference by the faithful and by the lesser clergy, who will grant you hospitality, information, and small favors.',
    },
  },

  // ─── Relic Hunter (Cacciatore di Reliquie) ────────────────────────
  {
    id: 'relic-hunter',
    name: 'Relic Hunter',
    nameOriginal: 'Cacciatore di Reliquie',
    description:
      'The Kingdom is full of saints, and therefore of their bones, teeth, shrouds, and splinters. You track them down, authenticate them — or make them authentic — and place them with whoever pays best.',
    skillProficiencies: ['investigation', 'history'],
    toolProficiencies: ["Thieves' tools", "Calligrapher's supplies"],
    languages: 1,
    // Mancavano piede di porco e abito, la custodia era senza le mappe e la
    // borsa era di 15 ma invece di 10: il Macaronicon dà «una custodia per
    // pergamene piena di appunti di studio e mappe, un piede di porco, un
    // abito da viaggiatore, una borsa con 10 ma».
    equipment: [
      'A parchment case filled with study notes and maps',
      'A crowbar',
      'A set of traveler\'s clothes',
      'A pouch containing 10 sp',
    ],
    feature: {
      name: 'Relic Academic',
      description:
        "Thanks to your license, you can access the Creed's archives, consult its registries of relics, and question the clergy who keep them.",
    },
  },

  // ═══ L'Impero Randella Ancora! 1.0 ═════════════════════════════════

  // ─── Fork Adept (Adepto della Forca) ──────────────────────────────
  {
    id: 'fork-adept',
    name: 'Fork Adept',
    nameOriginal: 'Adepto della Forca',
    description:
      'You were trained in the Scaffold Sanctuary of Aquisgrama, in the mystical arts the Order of the Fork draws from its death sentences. You wear its cape and answer to its hierarchy.',
    skillProficiencies: ['acrobatics', 'deception'],
    // L'Impero Randella Ancora dà agli adepti della Forca «Randello lucente e
    // randello lucente doppio»: erano sparite perché il tipo Background non
    // prevedeva affatto le competenze nelle armi.
    weaponProficiencies: ['Bright cudgel', 'Double bright cudgel'],
    toolProficiencies: [],
    languages: 0,
    // La borsa era di 15 ma: L'Impero Randella Ancora dà «una cappa
    // dell'Ordine, un simbolo imperiale e una borsa con 20 ma».
    equipment: ['A cape of the Order', 'An Imperial symbol', 'A pouch containing 20 sp'],
    feature: {
      name: 'Fork Feat',
      description:
        'You gain an additional feat of your choice when you select this background. It must be chosen from the Fork feats list.',
    },
  },

  // ─── Fork Renegade (Rinnegato della Forca) ────────────────────────
  {
    id: 'fork-renegade',
    name: 'Fork Renegade',
    nameOriginal: 'Rinnegato della Forca',
    description:
      'You turned your back on the Order of the Fork and have spent your life fighting it, or eluding its retribution. You kept its powers; the Order has not forgotten.',
    skillProficiencies: ['acrobatics', 'deception'],
    // Stesse armi dell'adepto: il rinnegato viene dallo stesso addestramento.
    weaponProficiencies: ['Bright cudgel', 'Double bright cudgel'],
    toolProficiencies: [],
    languages: 0,
    equipment: ['An outfit useful to conceal yourself', 'Forged documents', 'A pouch containing 15 sp'],
    feature: {
      name: 'Fork Feat',
      description:
        'You gain an additional feat of your choice from the Fork feats list, and you keep it even after turning your back on the Order. You must still spend one whole hour meditating when you awaken to control this power.',
    },
  },

  // ─── Blazoned (Blasonato) ─────────────────────────────────────────
  {
    id: 'blazoned',
    name: 'Blazoned',
    nameOriginal: 'Blasonato',
    description:
      'You carry a certificate of nobility of questionable provenance and a coat of arms nobody has ever verified. The trick is not the paper: it is the voice you use when you present it.',
    skillProficiencies: ['deception', 'intimidation'],
    toolProficiencies: [],
    languages: 2,
    // Mancavano due voci e la borsa era di 15 ma: L'Impero Randella Ancora dà
    // «un attestato di nobiltà discutibile, una bolla nobiliare arrugginita,
    // un salvacondotto scaduto, delle vesti nobiliari rattoppate e una borsa
    // con 25 ma». 'A rusty blade' era una lama arrugginita, ma la bolla
    // nobiliare è un sigillo: l'edizione inglese scrive «a rusty noble seal».
    equipment: [
      'A questionable certificate of nobility',
      'A rusty noble seal',
      'An expired pass permit',
      'A patched noble outfit',
      'A pouch containing 25 sp',
    ],
    feature: {
      name: 'High and Mighty Voice',
      description:
        'You are a seasoned swindler who can obtain any certificate, letter of introduction, or writ of passage — and make it sound genuine when you read it aloud.',
    },
  },

  // ─── Herbalist (Erborista) ────────────────────────────────────────
  {
    id: 'herbalist',
    name: 'Herbalist',
    nameOriginal: 'Erborista',
    description:
      'You treat what the Kingdom breaks: fevers, wounds, poisonings, and the occasional curse. Half your art is in the herbs, and half in knowing which patient can pay.',
    skillProficiencies: ['medicine', 'nature'],
    toolProficiencies: ["Alchemist's supplies", "Healer's kit"],
    languages: 0,
    equipment: ['Worn gloves', "A healer's kit", 'A pouch containing 10 sp'],
    feature: {
      name: 'Practicalist or Herbailiff',
      description:
        'You choose one of two callings when you take this background: the practicalist, who treats people, or the herbailiff, who deals in the herbs themselves.',
    },
  },

  // ─── Powder Dabbler (Polverista) ──────────────────────────────────
  {
    id: 'powder-dabbler',
    name: 'Powder Dabbler',
    nameOriginal: 'Polverista',
    description:
      'Gunpowder is new to the Kingdom of the Bounty and nobody quite trusts it — least of all the people who make it. You are one of them.',
    skillProficiencies: ['insight', 'history'],
    // Il polveriere è l'unico background del Regno competente nelle armi da
    // fuoco, ed è la cosa che lo definisce.
    weaponProficiencies: ['Firearms'],
    toolProficiencies: ['Gunpowder jug'],
    languages: 0,
    // La borsa non c'è. Sia l'edizione italiana sia quella inglese de L'Impero
    // Randella Ancora si fermano a «Equipaggiamento: 3 melagranate scadenti»,
    // senza denaro: il polveriere spende tutto in ordigni. La borsa con 15 ma
    // che avevamo era inventata.
    equipment: ['3 flawed pomegrenades'],
    feature: {
      name: "Grandma's Powders",
      description:
        'Exploiting your bizarre notions, you can show off your unusual knowledge to win the favor of your neighbors and of anyone curious about the new art of black powder.',
    },
  },

  // ─── Slacker (Lavativo) ───────────────────────────────────────────
  {
    id: 'slacker',
    name: 'Slacker',
    nameOriginal: 'Lavativo',
    description:
      'How did you come to this? You did not, actually — what you have done is follow someone else and live off the results of their success. The slacker is the quintessential soul of Brancalonia: a never-do-well with no ambitions, whose one gift is an utter, unrestrained laziness refined into a form of art.',
    skillProficiencies: [],
    toolProficiencies: [],
    languages: 0,
    equipment: [
      'An inherited heirloom',
      'A stolen jacket',
      'A mismatched certification',
      'A pouch with 30 sp that fell into your hands in a sheer stroke of luck',
    ],
    feature: {
      name: 'The Art of Opportunism',
      description:
        'You can turn a failed ability check or saving throw into an automatic success, at the expense of an allied creature within reach.',
    },
  },

  // ─── Inspirited (Suscitato) ───────────────────────────────────────
  {
    id: 'inspirited',
    name: 'Inspirited',
    nameOriginal: 'Suscitato',
    description:
      'Your very essence is shrouded in mystery and confusion. Rather than a past, you have a question, and you chose early to focus on the conundrum of your own nature — which is how you came to the Unknown Language, the secret code that hints at the mysteries of creation itself.',
    skillProficiencies: ['arcana', 'insight'],
    toolProficiencies: [],
    languages: 1,
    // 'A strange trinket' era un ninnolo qualsiasi, ma L'Impero Randella
    // Ancora dà «una strana ricevuta che attesta una compravendita
    // misconosciuta» («a strange receipt detailing an unknown purchase»):
    // è un documento, ed è l'indizio sulla natura del suscitato.
    equipment: [
      'A leftover from your native place',
      'A strange receipt detailing an unknown purchase',
      'A pouch containing 15 sp',
    ],
    feature: {
      name: 'No Past, Violent Future',
      description:
        'A man without a past is a man without bonds. You begin with 2 fewer Misdeeds, but each Misdeed you commit produces a bounty with two additional coins.',
    },
  },
]
