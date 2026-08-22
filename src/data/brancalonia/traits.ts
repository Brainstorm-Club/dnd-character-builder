/**
 * What each Brancalonia racial trait actually does, transcribed from the
 * Setting Book, the Macaronicon and L'Impero Randella Ancora.
 *
 * Keyed by the trait ids used in `races.ts`. Both languages live here rather
 * than in the always-loaded Italian dictionary, so this text only reaches
 * players who actually pick Brancalonia (WSG 3.8).
 */
export const brancaloniaTraitDescriptions: Record<string, string> = {
  // ─── Human (Umano) ────────────────────────────────────────────────
  'skill-choice': 'You gain proficiency in one skill of your choice.',
  'feat-choice': 'You gain one feat of your choice.',
  'brawl-versatility': 'Brawl Feature. You gain 1 additional move slot.',

  // ─── Gifted (Dotato) ──────────────────────────────────────────────
  'magical-influence':
    'Choose a school of magic: Abjuration, Conjuration, Divination, Enchantment, Evocation, Illusion, Necromancy or Transmutation. You learn one cantrip and one 1st-level spell from that school, and can cast the spell once at its lowest level, regaining the ability after a long rest. Wisdom or Charisma is your spellcasting ability for them, your choice.',
  'magical-resonance': 'At the end of a short rest you can choose to regain one 1st-level spell slot.',
  'brawl-magical-adaptation': 'Brawl Feature. You can pick your moves from the magic moves list as well as the general one.',

  // ─── Malebranche ──────────────────────────────────────────────────
  'darkvision':
    'You see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light. You cannot discern color in darkness, only shades of gray.',
  'brawl-hellbrawl':
    'Brawl Feature. Trained in the darkest caves of the Malebolge, you have advantage on all saving throws made during a brawl.',
  'infernal-helltraits':
    'Choose two: Hellwings (wings too small to fly but enough to glide — you take no falling damage); Hellflames (a 15-foot cone or a 5-by-30-foot line, DEX save DC 8 + CON modifier + proficiency bonus for 2d6 damage, 3d6 from 6th level, once per short or long rest); Hellfeet (goat legs with hooves — your walking speed becomes 40 feet); Hellvoice (cast charm person once per long rest, Charisma is your spellcasting ability); Hellclaws (a climbing speed of 20 feet, and claws that deal 1d4 + Strength modifier slashing damage on an unarmed strike); Hellears (proficiency in Perception, and double your proficiency bonus on Perception checks that rely on hearing).',

  // ─── Marionette (Marionetta) ──────────────────────────────────────
  'triflewood-construct':
    'You are an animated construct: immune to poison damage and the poisoned condition, immune to disease except wood diseases, and you do not need to eat, drink or breathe.',
  'magical-but-still-made-of-wood': 'You have vulnerability to fire damage.',
  'self-mending':
    'As long as your triflewood core is not destroyed you repair yourself with ease, adding 2d8 to the maximum number of Hit Dice you can spend at the end of a short rest. You regain the spent Hit Dice on a long rest.',
  'brawl-removable-limb':
    'Brawl Feature. As a bonus action you can detach a limb and use it as a common prop. Unlike a normal common prop, your limb is not lost after use.',
  'different-shapes':
    'The pinocchio is the most common marionette, but there are other shapes. Choose one at character creation.',
  'gullible': 'You have disadvantage on Wisdom (Insight) checks.',
  'integrated-armor':
    'You gain no benefit from wearing armor, though you can still benefit from a shield. Your AC equals 12 + your Dexterity modifier (maximum 2) + your proficiency bonus.',
  'nautical':
    'You have proficiency with water vehicles and navigator\'s tools, and through gestures and sounds you can communicate simple concepts to any beast with an innate swimming speed.',
  'wind-and-water':
    'You know the druidcraft cantrip. At 3rd level you can cast fog cloud once with this trait, and at 5th level gust of wind, regaining each on a long rest. Charisma is your spellcasting ability for them.',
  'in-saints-image-and-likeness':
    'You know the thaumaturgy cantrip. At 3rd level you can cast bless once with this trait, and at 5th level prayer of healing, regaining each on a long rest. Wisdom is your spellcasting ability for them.',

  // ─── Morgant (Morgante) ───────────────────────────────────────────
  'gargantuan':
    'You count as one size larger when determining your carrying capacity and the weight you can push, drag or lift.',
  'sturdy-as-a-rock': 'Your hit point maximum increases by 1, and by 1 again every time you gain a level.',
  'cast-iron-stomach':
    'Your pantagruelic bulk makes you consume double the rations a human needs, but your resistance to overindulging gives you advantage on all ability checks concerning the consumption of food and drink.',
  'brawl-towering': 'Brawl Feature. You can collect epic props as a bonus action.',

  // ─── Sylvan (Selvatico) ───────────────────────────────────────────
  'raised-in-the-forest':
    'You can attempt to hide even when you are only lightly obscured by foliage, heavy rain, falling snow, mist or other natural phenomena.',
  'primal-instinct': 'You have proficiency in the Perception and Survival skills.',
  'brawl-tough-guy': 'Brawl Feature. During a brawl you ignore the side effects of the first two levels of Whacks.',

  // ─── WolfCat (Gatto Lupesco) ──────────────────────────────────────
  'feline-darkvision':
    'Feline senses grant you superior sight: you see in dim light within 120 feet as if it were bright light, and in darkness as if it were dim light, in shades of gray only.',
  'scratch':
    'Your hands end in sharp claws. They are natural weapons you can use for unarmed strikes, dealing 1d4 + your Dexterity modifier slashing damage instead of the normal bludgeoning damage.',
  'leap':
    'You can jump a number of meters equal to your movement, and you make no check when landing on difficult terrain.',
  'deceitful': 'You have proficiency in the Deception and Perception skills.',
  'waterfear': 'You have disadvantage on all Strength (Athletics) checks made to swim.',
  'brawl-cat-burglar':
    'Brawl Feature. As a bonus action you can steal a common prop wielded by another creature. Once per brawl.',

  // ─── Nonexistent (Inesistente) ────────────────────────────────────
  'extravaganza-being':
    'You are pure abstract consciousness enclosed within clothing: immune to poison damage and the poisoned condition, immune to disease, and you do not need to eat, drink or breathe.',
  'antimagic-susceptibility':
    'You are incapacitated while within the area of an antimagic field. If targeted by dispel magic you must succeed on a Constitution saving throw against the caster\'s spell save DC or fall unconscious for 1 minute.',
  'dressing':
    'You must always wear some kind of suit or armor, and you can ignore the shoddiness quality of what you wear. From 3rd level the items you wear count as magical; from 5th level you gain a +1 bonus to all saving throws.',
  'brawl-vanishing':
    'Brawl Feature. When a creature attacks you, you can use your reaction to ignore the attack. Once per brawl.',

  // ─── Pantegan (Pantegano) ─────────────────────────────────────────
  'nimble-and-snappy':
    'You can move through the space of any creature larger than you, and you can attempt to hide even when obscured only by a single creature at least one size larger than you.',
  'rat-life': 'You are immune to disease.',
  'live-fast': 'You have proficiency in the Stealth and Perception skills.',
  'flee-and-survive': 'You have disadvantage on all saving throws against being frightened.',
  'brawl-pantemime':
    'Brawl Feature. When you take a whack you can use your reaction to make a scene and pretend to be hurt, and you cannot be attacked again until the start of your next turn. Once per brawl.',

  // ─── Arcimboldo ───────────────────────────────────────────────────
  'construct-type': 'Your creature type is construct.',
  'jumble':
    'An emerging consciousness springs from your mix of assorted materials: you are immune to poison damage and the poisoned condition, immune to disease, and you require no air, food or drink.',
  'brawl-scavenger':
    'Brawl Feature. When you take a whack during a brawl you lose an item from your body, and that item can be used as a prop.',
  'extravagant-influence-orcharder': 'You know the druidcraft and acid splash innate cantrips.',
  'extravagant-influence-ragpicker': 'You know the friends and guidance innate cantrips.',
  'extravagant-influence-scrapper': 'You know the resistance and mending innate cantrips.',
  'resistant-structure-piercing': 'You have resistance to piercing damage from nonmagical attacks.',
  'resistant-structure-bludgeoning': 'You have resistance to bludgeoning damage from nonmagical attacks.',
  'resistant-structure-slashing': 'You have resistance to slashing damage from nonmagical attacks.',

  // ─── Jackrabid (Bieconiglio) ──────────────────────────────────────
  'red-eyes':
    'Your beastly eyes are entirely red, granting keen sight and an intimidating look. You have proficiency in the Intimidation and Perception skills.',
  'unflinching': 'You have advantage on saving throws against being frightened.',
  'rabid-fury': 'If you move at least 20 feet in a straight line, you can make an attack as a bonus action.',
  'natural-born-jumper':
    'Your long jump is up to 20 feet and your high jump up to 10 feet, with or without a running start. You also have advantage on Strength (Athletics) checks to long jump and on Dexterity (Acrobatics) checks to land on your feet on difficult terrain.',
  'born-for-the-skewer': 'You are proficient with the skewer.',
  'brawl-jackrabid-kick': 'Brawl Feature. If you hit a prone target during a brawl, you deal an additional whack.',

  // ─── Paraghoul (Paragulo) ─────────────────────────────────────────
  'undead-type': 'Your creature type is undead, and you require no air.',
  'still-blood':
    'Your heart stopped at your death and your blood no longer flows: you are immune to poison damage, the poisoned condition and disease.',
  'pull-scams-not-push-daisies':
    'You came back to life by cheating death one way or another. You gain proficiency in the Deception and Persuasion skills.',
  'making-fun-of-death':
    'Having cheated Sister Death once, you are ready to do it again: you add your proficiency bonus to your death saving throws.',
  'brawl-hes-already-dead':
    'Brawl Feature. As a bonus action you can pretend to be dead with a contested Charisma (Deception) check against your enemies\' Wisdom (Insight). On a success you cannot be attacked until you take an action. Once per brawl.',
}

/** The same, in Italian. */
export const brancaloniaTraitDescriptionsIt: Record<string, string> = {
  'skill-choice':
    'Competenza in un\'abilità a scelta.',
  'feat-choice':
    'Un talento a scelta.',
  'brawl-versatility':
    'Privilegio da Rissa. Il personaggio ottiene 1 slot mossa aggiuntivo.',
  'magical-influence':
    'Si sceglie una scuola di magia tra Abiurazione, Ammaliamento, Divinazione, Evocazione, Illusione, Invocazione, Necromanzia e Trasmutazione. Si apprende un trucchetto e un incantesimo di 1 livello di quella scuola, lanciabile una volta al suo livello più basso e recuperabile con un riposo lungo. La caratteristica da incantatore e\' Saggezza o Carisma, a scelta.',
  'magical-resonance':
    'Al termine di un riposo breve si può scegliere di recuperare uno slot incantesimo di 1 livello.',
  'brawl-magical-adaptation':
    'Privilegio da Rissa. Si possono scegliere le mosse anche dalla lista delle mosse magiche, oltre che da quella generica.',
  'darkvision':
    'In condizioni di luce fioca si vede fino a 18 metri come se fosse luce intensa, e nell\'oscurità come se fosse luce fioca. Nell\'oscurità non si distinguono i colori, solo tonalità di grigio.',
  'brawl-hellbrawl':
    'Privilegio da Rissa. Addestrato nelle caverne più oscure delle Malebolge, si ottiene vantaggio a tutti i tiri salvezza effettuati durante una rissa.',
  'infernal-helltraits':
    'Se ne scelgono due. Maleali: ali troppo piccole per volare ma sufficienti a planare, che annullano i danni da caduta. Malefiamme: un cono di 4,5 m o una linea di 1,5 per 9 m, tiro salvezza su Destrezza con CD 8 + modificatore di Costituzione + bonus di competenza per 2d6 danni, 3d6 dal 6 livello, una volta per riposo breve o lungo. Malegambe: zampe caprine che portano la velocità a 12 metri. Malavoce: si lancia charme su persone una volta per riposo lungo, con Carisma come caratteristica da incantatore. Malemani: velocità di scalare di 6 metri e artigli che infliggono 1d4 + modificatore di Forza danni taglienti con un attacco senz\'armi. Malerecchie: competenza in Percezione e bonus di competenza raddoppiato nelle prove di Percezione basate sull\'udito.',
  'triflewood-construct':
    'Si e\' un costrutto animato: immuni ai danni da veleno e alla condizione avvelenato, immuni alle malattie tranne quelle del legno, e non serve mangiare, bere o respirare.',
  'magical-but-still-made-of-wood':
    'Si ha vulnerabilità ai danni da fuoco.',
  'self-mending':
    'Finché il nucleo di fanfaluco non viene distrutto ci si ripara con facilità, aggiungendo 2d8 al numero massimo di Dadi Vita spendibili al termine di un riposo breve. I Dadi Vita spesi si recuperano con un riposo lungo.',
  'brawl-removable-limb':
    'Privilegio da Rissa. Con un\'azione bonus si può staccare un arto e usarlo come oggetto di scena comune. A differenza degli oggetti di scena normali, l\'arto non viene perso dopo l\'utilizzo.',
  'different-shapes':
    'Il pinocchio e\' la marionetta più comune, ma esistono altre fogge. Se ne sceglie una alla creazione del personaggio.',
  'gullible':
    'Svantaggio alle prove di Saggezza (Intuizione).',
  'integrated-armor':
    'Non si ottiene alcun beneficio dall\'indossare armature, ma si beneficia comunque di uno scudo. La CA e\' pari a 12 + modificatore di Destrezza (massimo 2) + bonus di competenza.',
  'nautical':
    'Competenza nei veicoli acquatici e negli strumenti da navigatore. Inoltre, tramite gesti e suoni, si comunicano concetti semplici a qualunque bestia dotata di velocità di nuotare innata.',
  'wind-and-water':
    'Si conosce il trucchetto artificio druidico. Al 3 livello si può lanciare nube di nebbia una volta con questo tratto, al 5 folata di vento, recuperandoli con un riposo lungo. La caratteristica da incantatore e\' Carisma.',
  'in-saints-image-and-likeness':
    'Si conosce il trucchetto taumaturgia. Al 3 livello si può lanciare benedizione una volta con questo tratto, al 5 preghiera di guarigione, recuperandoli con un riposo lungo. La caratteristica da incantatore e\' Saggezza.',
  'gargantuan':
    'Si viene considerati di una taglia più grande per determinare la capacità di carico e il peso che si può spingere, trascinare o sollevare.',
  'sturdy-as-a-rock':
    'Il massimo dei punti ferita aumenta di 1, e di nuovo di 1 a ogni livello acquisito.',
  'cast-iron-stomach':
    'Data la mole pantagruelica serve il doppio del cibo necessario a un umano, ma la resistenza naturale alle abbuffate da\' vantaggio a tutte le prove che coinvolgono il consumo di cibo e bevande.',
  'brawl-towering':
    'Privilegio da Rissa. Si possono raccogliere oggetti di scena epici con un\'azione bonus.',
  'raised-in-the-forest':
    'Ci si può nascondere anche quando si e\' oscurati solo da vegetazione, pioggia intensa, neve, nebbia o altri fenomeni naturali.',
  'primal-instinct':
    'Competenza nelle abilità Percezione e Sopravvivenza.',
  'brawl-tough-guy':
    'Privilegio da Rissa. Durante una rissa si ignorano gli effetti secondari dei primi due livelli di Batoste.',
  'feline-darkvision':
    'I sensi felini danno una vista superiore: in luce fioca si vede fino a 36 metri come se fosse luce intensa, e nell\'oscurità come se fosse luce fioca, solo in tonalità di grigio.',
  'scratch':
    'Le mani terminano in artigli affilati. Sono armi naturali utilizzabili per attacchi senz\'armi e infliggono 1d4 + modificatore di Destrezza danni taglienti al posto dei normali danni contundenti.',
  'leap':
    'Si può saltare un numero di metri pari al proprio movimento, e non serve alcuna prova per atterrare su terreno difficile.',
  'deceitful':
    'Competenza nelle abilità Inganno e Percezione.',
  'waterfear':
    'Svantaggio a tutte le prove di Forza (Atletica) effettuate per nuotare.',
  'brawl-cat-burglar':
    'Privilegio da Rissa. Con un\'azione bonus si può sottrarre un oggetto di scena comune impugnato da un\'altra creatura. Una volta per rissa.',
  'extravaganza-being':
    'Si e\' pura coscienza astratta racchiusa in un vestito: immuni ai danni da veleno e alla condizione avvelenato, immuni alle malattie, e non serve mangiare, bere o respirare.',
  'antimagic-susceptibility':
    'Si e\' incapacitati finché si resta nell\'area di un campo antimagia. Se bersagliati da dissolvi magie occorre superare un tiro salvezza su Costituzione contro la CD degli incantesimi di chi lancia, altrimenti si cade privi di sensi per 1 minuto.',
  'dressing':
    'Bisogna sempre indossare un vestito o un\'armatura, e se ne può ignorare la qualità scadente. Dal 3 livello gli oggetti indossati sono considerati magici; dal 5 si ottiene +1 a tutti i tiri salvezza.',
  'brawl-vanishing':
    'Privilegio da Rissa. Quando una creatura attacca, si può usare la reazione per ignorare l\'attacco. Una volta per rissa.',
  'nimble-and-snappy':
    'Ci si può muovere attraverso lo spazio di qualsiasi creatura di taglia più grande, e ci si può nascondere anche se oscurati da una sola creatura di almeno una taglia superiore.',
  'rat-life':
    'Si e\' immuni alle malattie.',
  'live-fast':
    'Competenza nelle abilità Furtività e Percezione.',
  'flee-and-survive':
    'Svantaggio a tutti i tiri salvezza per non essere spaventati.',
  'brawl-pantemime':
    'Privilegio da Rissa. Quando si subisce una batosta si può usare la reazione per fare una scenata e fingersi feriti: non si può essere attaccati di nuovo fino all\'inizio del proprio turno successivo. Una volta per rissa.',
  'construct-type':
    'Il tipo di creatura e\' costrutto.',
  'jumble':
    'Una coscienza emergente nasce dall\'accozzaglia di materiali che compone il corpo: immuni ai danni da veleno e alla condizione avvelenato, immuni alle malattie, e non servono aria, cibo o bevande.',
  'brawl-scavenger':
    'Privilegio da Rissa. Quando si subisce una batosta si perde un oggetto dal proprio corpo, e quell\'oggetto può essere usato come oggetto di scena.',
  'extravagant-influence-orcharder':
    'Si conoscono i trucchetti innati artificio druidico e fiotto acido.',
  'extravagant-influence-ragpicker':
    'Si conoscono i trucchetti innati amicizia e guida.',
  'extravagant-influence-scrapper':
    'Si conoscono i trucchetti innati resistenza e riparare.',
  'resistant-structure-piercing':
    'Resistenza ai danni perforanti da attacchi non magici.',
  'resistant-structure-bludgeoning':
    'Resistenza ai danni contundenti da attacchi non magici.',
  'resistant-structure-slashing':
    'Resistenza ai danni taglienti da attacchi non magici.',
  'red-eyes':
    'Gli occhi animaleschi sono completamente rossi: danno una vista acuta e un aspetto intimidatorio. Competenza nelle abilità Intimidire e Percezione.',
  'unflinching':
    'Vantaggio ai tiri salvezza per non essere spaventati.',
  'rabid-fury':
    'Se ci si muove per almeno 6 metri in linea retta, si può effettuare un attacco come azione bonus.',
  'natural-born-jumper':
    'Il salto in lungo arriva a 6 metri e quello in alto a 3 metri, con o senza rincorsa. Inoltre si ha vantaggio alle prove di Forza (Atletica) per il salto in lungo e a quelle di Destrezza (Acrobazia) per atterrare in piedi su terreno difficile.',
  'born-for-the-skewer':
    'Competenza nello spiedo.',
  'brawl-jackrabid-kick':
    'Privilegio da Rissa. Colpendo un bersaglio prono durante una rissa si infligge una batosta aggiuntiva.',
  'undead-type':
    'Il tipo di creatura e\' non morto, e non serve respirare.',
  'still-blood':
    'Il cuore si e\' fermato al momento della morte e il sangue non scorre più: si e\' immuni ai danni da veleno, alla condizione avvelenato e alle malattie.',
  'pull-scams-not-push-daisies':
    'Si e\' tornati in vita ingannando la morte in un modo o nell\'altro. Competenza nelle abilità Inganno e Persuasione.',
  'making-fun-of-death':
    'Avendo già ingannato Sorella Morte una volta, si aggiunge il bonus di competenza ai tiri salvezza contro morte.',
  'brawl-hes-already-dead':
    'Privilegio da Rissa. Con un\'azione bonus ci si può fingere morti con una prova contrapposta di Carisma (Inganno) contro la Saggezza (Intuizione) dei nemici. Riuscendo, non si può essere attaccati finché non si intraprende un\'azione. Una volta per rissa.',
}
