// Descrizioni italiane dei privilegi delle classi base di D&D 5e.
//
// ATTENZIONE ALL'EDIZIONE. I dati dell'app sono le regole 2014 (SRD 5.1).
// L'SRD 5.2.1 italiano descrive le regole 2024, che per molti privilegi
// sono diverse: l'Ira del 2024 dura fino alla fine del turno successivo e
// va prolungata, il barbaro ha Padronanza d'armi e Conoscenza primordiale,
// il monaco ha i Punti Concentrazione al posto del Ki, il paladino lancia
// Punizione come incantesimo. Il testo qui sotto traduce quindi le regole
// 2014 dell'app, usando l'SRD 5.2.1 italiano come autorità terminologica —
// non come testo da copiare.
//
// I NOMI stanno in gameTerms, non qui: sono un'unica mappa per tutta l'app,
// così il riepilogo e la scheda PDF non possono divergere dalla lista dei
// privilegi. Anche quelli vengono dall'SRD 5.2.1 italiano; i privilegi che
// nel 2024 non esistono più sono resi seguendo le sue convenzioni.

/** Frase ricorrente: l'Aumento dei punteggi di caratteristica. */
const ASI =
  'Il personaggio può aumentare di 2 un punteggio di caratteristica, oppure di 1 due punteggi di caratteristica. Non può portare un punteggio oltre 20. Se il Dungeon Master lo consente, può scegliere un talento al posto dell\'aumento.'

/** Frase ricorrente: l'Attacco extra base. */
const EXTRA_ATTACK =
  'Il personaggio può attaccare due volte, anziché una, ogni volta che effettua l\'azione di Attacco nel suo turno.'

const subclassFeature = (cls: string, lv: number) =>
  `Il personaggio ottiene un privilegio concesso dal suo ${cls} al ${lv}° livello.`

export const dnd5eFeatureDescriptionsIt: Record<string, string> = {
  // ═══ Barbaro ══════════════════════════════════════════════════════
  rage:
    'In battaglia il barbaro combatte con ferocia primordiale. Può entrare in ira con un\'azione bonus, ottenendo vantaggio alle prove di Forza e ai tiri salvezza su Forza, un bonus ai danni dell\'ira e resistenza ai danni contundenti, perforanti e taglienti.',
  'unarmored-defense-barb':
    'Mentre non indossa alcuna armatura, la CA del barbaro è pari a 10 + il suo modificatore di Destrezza + il suo modificatore di Costituzione. Può impugnare uno scudo e continuare a beneficiare di questo privilegio.',
  'reckless-attack':
    'Il barbaro può ignorare ogni preoccupazione per la propria difesa e attaccare con feroce disperazione. Dispone di vantaggio ai tiri per colpire in mischia che usano Forza durante quel turno, ma anche i tiri per colpire contro di lui dispongono di vantaggio fino al suo turno successivo.',
  'danger-sense':
    'Il barbaro dispone di vantaggio ai tiri salvezza su Destrezza contro gli effetti che è in grado di vedere, come trappole e incantesimi. Per beneficiarne non deve essere accecato, assordato o incapacitato.',
  'primal-path':
    'Il barbaro sceglie un cammino primordiale che plasma la natura della sua ira.',
  'asi-4': ASI,
  'extra-attack-barb': EXTRA_ATTACK,
  'fast-movement':
    'La velocità del barbaro aumenta di 3 metri mentre non indossa un\'armatura pesante.',
  'path-feature-6': subclassFeature('Cammino Primordiale', 6),
  'feral-instinct':
    'Il barbaro dispone di vantaggio ai tiri per l\'iniziativa. Se è sorpreso all\'inizio di un combattimento e non è incapacitato, può agire normalmente nel suo primo turno, a patto di entrare in ira prima di fare qualsiasi altra cosa.',
  'asi-8': ASI,
  'brutal-critical-1':
    'Il barbaro può tirare un dado dei danni dell\'arma aggiuntivo quando determina i danni extra di un colpo critico con un attacco in mischia.',
  'path-feature-10': subclassFeature('Cammino Primordiale', 10),
  'relentless-rage':
    'Se il barbaro scende a 0 punti ferita mentre è in ira e non muore sul colpo, può effettuare un tiro salvezza su Costituzione con CD 10 per scendere invece a 1 punto ferita. La CD aumenta di 5 ogni volta che usa questo privilegio prima di completare un riposo.',
  'asi-12': ASI,
  'brutal-critical-2':
    'Il barbaro tira due dadi dei danni dell\'arma aggiuntivi per un colpo critico con un attacco in mischia.',
  'path-feature-14': subclassFeature('Cammino Primordiale', 14),
  'persistent-rage':
    'L\'ira del barbaro termina anticipatamente solo se cade privo di sensi o se sceglie di porvi fine.',
  'asi-16': ASI,
  'brutal-critical-3':
    'Il barbaro tira tre dadi dei danni dell\'arma aggiuntivi per un colpo critico con un attacco in mischia.',
  'indomitable-might':
    'Se il totale di una prova di Forza del barbaro è inferiore al suo punteggio di Forza, può usare quel punteggio al posto del totale.',
  'asi-19': ASI,
  'primal-champion':
    'Il barbaro incarna il potere delle terre selvagge. I suoi punteggi di Forza e Costituzione aumentano di 4, e il loro massimo diventa 24.',

  // ═══ Bardo ════════════════════════════════════════════════════════
  'spellcasting-bard':
    'Il bardo ha imparato a districare e rimodellare il tessuto della realtà in armonia con i propri desideri e la propria musica. Il Carisma è la sua caratteristica da incantatore.',
  'bardic-inspiration':
    'Il bardo può ispirare gli altri con parole o musica emozionanti. Una creatura entro 18 metri che sia in grado di sentirlo ottiene un dado di Ispirazione Bardica (d6). La creatura può tirare quel dado e aggiungere il risultato a una prova di caratteristica, a un tiro per colpire o a un tiro salvezza.',
  'jack-of-all-trades':
    'Il bardo può aggiungere metà del suo bonus di competenza, arrotondata per difetto, a qualsiasi prova di caratteristica che non includa già il suo bonus di competenza.',
  'song-of-rest':
    'Il bardo può usare musica o oratoria per rinvigorire i compagni feriti durante un riposo breve. Se lui o una creatura amichevole che sia in grado di sentirlo recuperano punti ferita al termine del riposo breve spendendo Dadi Vita, ciascuna di quelle creature recupera 1d6 punti ferita aggiuntivi.',
  'bard-college':
    'Il bardo approfondisce le tecniche avanzate di un collegio bardico a sua scelta.',
  'expertise-bard':
    'Il bardo sceglie due delle sue competenze nelle abilità. Il suo bonus di competenza raddoppia in ogni prova di caratteristica che usi una delle due.',
  'bardic-inspiration-d8': 'Il dado di Ispirazione Bardica del bardo diventa un d8.',
  'font-of-inspiration':
    'Il bardo recupera tutti gli utilizzi spesi di Ispirazione Bardica quando completa un riposo breve o lungo.',
  countercharm:
    'Con un\'azione il bardo può iniziare un\'esecuzione che dura fino alla fine del suo turno successivo. Le creature amichevoli entro 9 metri che siano in grado di sentirlo dispongono di vantaggio ai tiri salvezza per non essere spaventate o affascinate.',
  'college-feature-6': subclassFeature('Collegio Bardico', 6),
  'song-of-rest-d8':
    'I punti ferita aggiuntivi restituiti dal Canto di Riposo del bardo diventano 1d8.',
  'bardic-inspiration-d10': 'Il dado di Ispirazione Bardica del bardo diventa un d10.',
  'expertise-bard-10':
    'Il bardo sceglie altre due delle sue competenze nelle abilità: il suo bonus di competenza raddoppia in ogni prova di caratteristica che usi una delle due.',
  'magical-secrets-10':
    'Il bardo sceglie due incantesimi di qualsiasi classe, di un livello che è in grado di lanciare. Per lui contano come incantesimi da bardo e non contano ai fini del numero di incantesimi da bardo che conosce.',
  'song-of-rest-d10':
    'I punti ferita aggiuntivi restituiti dal Canto di Riposo del bardo diventano 1d10.',
  'magical-secrets-14':
    'Il bardo sceglie altri due incantesimi di qualsiasi classe, come per Segreti Magici al 10° livello.',
  'college-feature-14': subclassFeature('Collegio Bardico', 14),
  'bardic-inspiration-d12': 'Il dado di Ispirazione Bardica del bardo diventa un d12.',
  'song-of-rest-d12':
    'I punti ferita aggiuntivi restituiti dal Canto di Riposo del bardo diventano 1d12.',
  'magical-secrets-18':
    'Il bardo sceglie altri due incantesimi di qualsiasi classe, come per Segreti Magici al 10° livello.',
  'superior-inspiration':
    'Quando tira l\'iniziativa e non gli restano utilizzi di Ispirazione Bardica, il bardo ne recupera uno.',

  // ═══ Chierico ═════════════════════════════════════════════════════
  'spellcasting-cleric':
    'In quanto tramite del potere divino, il chierico può lanciare incantesimi da chierico. La Saggezza è la sua caratteristica da incantatore.',
  'divine-domain':
    'Il chierico sceglie un dominio legato alla sua divinità. La scelta gli concede incantesimi di dominio e altri privilegi al 1° livello, e poi ancora al 2°, 6°, 8° e 17°.',
  'channel-divinity':
    'Il chierico ottiene la capacità di incanalare l\'energia divina direttamente dalla sua divinità, usandola per alimentare effetti magici. Parte con Scacciare Non Morti e con un effetto determinato dal suo dominio.',
  'turn-undead':
    'Con un\'azione il chierico mostra il proprio simbolo sacro e pronuncia una preghiera che condanna i non morti. Ogni non morto entro 9 metri che sia in grado di vederlo o sentirlo deve effettuare un tiro salvezza su Saggezza. Se lo fallisce, è scacciato per 1 minuto o finché non subisce danni.',
  'destroy-undead-half':
    'Quando un non morto con grado di sfida pari o inferiore a 1/2 fallisce il tiro salvezza contro Scacciare Non Morti, viene distrutto all\'istante.',
  'channel-divinity-2':
    'Il chierico può usare Incanalare Divinità due volte fra un riposo e l\'altro.',
  'domain-feature-6': subclassFeature('Dominio Divino', 6),
  'destroy-undead-1':
    'Distruggere Non Morti ora colpisce i non morti con grado di sfida pari o inferiore a 1.',
  'domain-feature-8': subclassFeature('Dominio Divino', 8),
  'divine-intervention':
    'Il chierico può invocare l\'intervento della propria divinità. Tira dadi percentuali: se ottiene un risultato pari o inferiore al suo livello da chierico, la divinità interviene. In caso di riuscita non può riusare il privilegio per 7 giorni, altrimenti può riprovare dopo un riposo lungo.',
  'destroy-undead-2':
    'Distruggere Non Morti ora colpisce i non morti con grado di sfida pari o inferiore a 2.',
  'destroy-undead-3':
    'Distruggere Non Morti ora colpisce i non morti con grado di sfida pari o inferiore a 3.',
  'destroy-undead-4':
    'Distruggere Non Morti ora colpisce i non morti con grado di sfida pari o inferiore a 4.',
  'domain-feature-17': subclassFeature('Dominio Divino', 17),
  'channel-divinity-3':
    'Il chierico può usare Incanalare Divinità tre volte fra un riposo e l\'altro.',
  'divine-intervention-improvement':
    'L\'invocazione di Intervento Divino del chierico riesce automaticamente, senza bisogno di alcun tiro.',

  // ═══ Druido ═══════════════════════════════════════════════════════
  druidic:
    'Il druido conosce il druidico, la lingua segreta dei druidi. Può parlarla e usarla per lasciare messaggi nascosti.',
  'spellcasting-druid':
    'Attingendo all\'essenza divina della natura stessa, il druido può lanciare incantesimi per plasmarla secondo la propria volontà. La Saggezza è la sua caratteristica da incantatore.',
  'wild-shape':
    'Con un\'azione il druido può assumere magicamente la forma di una bestia che ha già visto. Può usare questo privilegio due volte e ne recupera gli utilizzi con un riposo breve o lungo.',
  'druid-circle': 'Il druido sceglie il circolo druidico in cui riconoscersi.',
  'wild-shape-4':
    'Il druido può trasformarsi in una bestia con grado di sfida pari o inferiore a 1/2 e priva di velocità di volare.',
  'circle-feature-6': subclassFeature('Circolo Druidico', 6),
  'wild-shape-8':
    'Il druido può trasformarsi in una bestia con grado di sfida pari o inferiore a 1.',
  'circle-feature-10': subclassFeature('Circolo Druidico', 10),
  'circle-feature-14': subclassFeature('Circolo Druidico', 14),
  'timeless-body-druid':
    'Il druido invecchia più lentamente: per ogni 10 anni che passano, il suo corpo ne invecchia soltanto 1.',
  'beast-spells':
    'Il druido può lanciare molti dei suoi incantesimi da druido in qualsiasi forma assuma con Forma Selvatica, anche se non può fornire componenti materiali.',
  archdruid:
    'Il druido può usare Forma Selvatica un numero illimitato di volte, e può ignorare le componenti verbali e somatiche dei suoi incantesimi da druido, oltre alle componenti materiali che non hanno un costo e non vengono consumate.',

  // ═══ Guerriero ════════════════════════════════════════════════════
  'fighting-style-fighter':
    'Il guerriero adotta un particolare stile di combattimento come specialità e sceglie una delle opzioni di Stile di Combattimento. Non può scegliere la stessa opzione più di una volta, nemmeno se in seguito potrà sceglierne un\'altra.',
  'second-wind':
    'Il guerriero dispone di una riserva limitata di energie a cui attingere per proteggersi dal male. Nel suo turno può usare un\'azione bonus per recuperare punti ferita pari a 1d10 + il suo livello da guerriero. Dopo averlo usato deve completare un riposo breve o lungo prima di poterlo riutilizzare.',
  'action-surge':
    'Il guerriero può spingersi oltre i propri limiti per un istante. Nel suo turno può effettuare un\'azione aggiuntiva. Dopo averlo usato deve completare un riposo breve o lungo prima di poterlo riutilizzare.',
  'martial-archetype':
    'Il guerriero sceglie un archetipo marziale che cerca di emulare nei propri stili e nelle proprie tecniche di combattimento.',
  'extra-attack-fighter': EXTRA_ATTACK,
  'asi-6': ASI,
  'archetype-feature-7': subclassFeature('Archetipo Marziale', 7),
  'indomitable-1':
    'Il guerriero può ripetere un tiro salvezza fallito e deve usare il nuovo risultato. Recupera l\'utilizzo con un riposo lungo.',
  'archetype-feature-10': subclassFeature('Archetipo Marziale', 10),
  'extra-attack-2':
    'Il guerriero può attaccare tre volte ogni volta che effettua l\'azione di Attacco nel suo turno.',
  'indomitable-2':
    'Il guerriero può usare Indomabile due volte fra un riposo lungo e l\'altro.',
  'asi-14': ASI,
  'archetype-feature-15': subclassFeature('Archetipo Marziale', 15),
  'action-surge-2':
    'Il guerriero può usare Azione Impetuosa due volte prima di un riposo, ma solo una volta per turno.',
  'indomitable-3':
    'Il guerriero può usare Indomabile tre volte fra un riposo lungo e l\'altro.',
  'archetype-feature-18': subclassFeature('Archetipo Marziale', 18),
  'extra-attack-3':
    'Il guerriero può attaccare quattro volte ogni volta che effettua l\'azione di Attacco nel suo turno.',

  // ═══ Ladro ════════════════════════════════════════════════════════
  'expertise-rogue':
    'Il ladro sceglie due delle sue competenze nelle abilità, oppure una competenza in un\'abilità e la competenza negli arnesi da scasso. Il suo bonus di competenza raddoppia in ogni prova di caratteristica che usi una delle due.',
  'sneak-attack':
    'Il ladro sa come colpire di soppiatto e sfruttare la distrazione di un nemico. Una volta per turno può infliggere 1d6 danni aggiuntivi a una creatura che colpisce con un attacco, se dispone di vantaggio al tiro per colpire. L\'attacco deve usare un\'arma accurata o a distanza. Non ha bisogno del vantaggio se un altro nemico del bersaglio si trova entro 1,5 metri da esso, quel nemico non è incapacitato e il ladro non subisce svantaggio al tiro per colpire. I danni aggiuntivi aumentano di 1d6 a ogni livello da ladro dispari, fino a 10d6 al 19° livello.',
  'thieves-cant':
    'Durante l\'addestramento il ladro ha imparato il gergo ladresco, un misto segreto di dialetto, espressioni convenzionali e codici che permette di nascondere messaggi in una conversazione apparentemente normale.',
  'cunning-action':
    'La prontezza di riflessi e l\'agilità del ladro gli permettono di muoversi e agire rapidamente. Può usare un\'azione bonus in ciascuno dei suoi turni in combattimento per effettuare le azioni di Scatto, Disimpegno o Nascondersi.',
  'roguish-archetype':
    'Il ladro sceglie un archetipo che emula nell\'esercizio delle proprie capacità.',
  'uncanny-dodge':
    'Quando un attaccante che il ladro è in grado di vedere lo colpisce con un attacco, egli può usare la sua reazione per dimezzare i danni subiti.',
  'expertise-rogue-6':
    'Il ladro sceglie altre due delle sue competenze: il suo bonus di competenza raddoppia in ogni prova di caratteristica che usi una delle due.',
  'evasion-rogue':
    'Quando il ladro è soggetto a un effetto che consente un tiro salvezza su Destrezza per dimezzare i danni, non subisce alcun danno se lo supera e ne subisce metà se lo fallisce.',
  'archetype-feature-9': subclassFeature('Archetipo del Ladro', 9),
  'asi-10': ASI,
  'reliable-talent':
    'Ogni volta che il ladro effettua una prova di caratteristica a cui può aggiungere il suo bonus di competenza, può considerare 10 qualsiasi risultato del d20 pari o inferiore a 9.',
  'archetype-feature-13': subclassFeature('Archetipo del Ladro', 13),
  blindsense:
    'Se è in grado di sentire, il ladro è consapevole della posizione di qualsiasi creatura nascosta o invisibile entro 3 metri da lui.',
  'slippery-mind': 'Il ladro ottiene competenza nei tiri salvezza su Saggezza.',
  'archetype-feature-17': subclassFeature('Archetipo del Ladro', 17),
  elusive:
    'Nessun tiro per colpire dispone di vantaggio contro il ladro mentre non è incapacitato.',
  'stroke-of-luck':
    'Se un attacco del ladro manca un bersaglio entro portata, egli può trasformare il fallimento in un colpo andato a segno; oppure, se fallisce una prova di caratteristica, può considerare 20 il risultato del d20. Recupera l\'uso di questo privilegio quando completa un riposo breve o lungo.',

  // ═══ Mago ═════════════════════════════════════════════════════════
  'spellcasting-wizard':
    'In quanto studioso della magia arcana, il mago possiede un libro degli incantesimi che contiene i primi barlumi del suo vero potere. L\'Intelligenza è la sua caratteristica da incantatore.',
  'arcane-recovery':
    'Il mago ha imparato a recuperare parte della propria energia magica studiando il libro degli incantesimi. Una volta al giorno, quando completa un riposo breve, può scegliere degli slot incantesimo spesi da recuperare. La somma dei loro livelli può essere pari o inferiore alla metà del suo livello da mago, arrotondata per eccesso, e nessuno di essi può essere di 6° livello o superiore.',
  'arcane-tradition':
    'Il mago sceglie una tradizione arcana, plasmando la propria pratica della magia attraverso una delle otto scuole.',
  'tradition-feature-10': subclassFeature('Tradizione Arcana', 10),
  'tradition-feature-14': subclassFeature('Tradizione Arcana', 14),
  'spell-mastery':
    'Il mago sceglie un incantesimo di 1° livello e uno di 2° livello dal suo libro degli incantesimi. Può lanciarli al loro livello più basso senza spendere uno slot incantesimo, purché li abbia preparati.',
  'signature-spells':
    'Il mago sceglie due incantesimi da mago di 3° livello come incantesimi personali. Li ha sempre preparati, non contano ai fini del numero di incantesimi che può preparare, e può lanciarli ciascuno una volta al 3° livello senza spendere uno slot, recuperando quell\'uso con un riposo breve o lungo.',

  // ═══ Monaco ═══════════════════════════════════════════════════════
  'unarmored-defense-monk':
    'Mentre non indossa alcuna armatura e non impugna uno scudo, la CA del monaco è pari a 10 + il suo modificatore di Destrezza + il suo modificatore di Saggezza.',
  'martial-arts':
    'La pratica delle arti marziali dà al monaco padronanza degli stili di combattimento che usano i colpi senz\'armi e le armi da monaco. Ne ottiene i benefici mentre è disarmato o impugna soltanto armi da monaco e non indossa armature né impugna uno scudo.',
  ki:
    'L\'addestramento del monaco gli permette di padroneggiare l\'energia mistica del ki. Dispone di un numero di punti ki pari al suo livello da monaco e può spenderli per alimentare i privilegi che ne fanno uso: Raffica di Colpi, Difesa Paziente e Passo del Vento.',
  'unarmored-movement':
    'La velocità del monaco aumenta di 3 metri mentre non indossa armature e non impugna uno scudo. Il bonus cresce man mano che sale di livello.',
  'monastic-tradition': 'Il monaco si vota a una tradizione monastica.',
  'deflect-missiles':
    'Quando viene colpito da un attacco a distanza con un\'arma, il monaco può usare la sua reazione per deviare o afferrare il proiettile. I danni si riducono di 1d10 + il suo modificatore di Destrezza + il suo livello da monaco.',
  'slow-fall':
    'Quando cade, il monaco può usare la sua reazione per ridurre i danni da caduta di un ammontare pari a cinque volte il suo livello da monaco.',
  'extra-attack-monk': EXTRA_ATTACK,
  'stunning-strike':
    'Quando colpisce un\'altra creatura con un attacco in mischia con un\'arma, il monaco può spendere 1 punto ki per tentare un colpo stordente. Il bersaglio deve superare un tiro salvezza su Costituzione, altrimenti è stordito fino alla fine del turno successivo del monaco.',
  'ki-empowered-strikes':
    'I colpi senz\'armi del monaco contano come magici ai fini del superamento della resistenza e dell\'immunità ad attacchi e danni non magici.',
  'tradition-feature-6': subclassFeature('Tradizione Monastica', 6),
  'evasion-monk':
    'Quando il monaco è soggetto a un effetto che consente un tiro salvezza su Destrezza per dimezzare i danni, non subisce alcun danno se lo supera e ne subisce metà se lo fallisce.',
  'stillness-of-mind':
    'Con un\'azione il monaco può porre fine a un effetto attivo su di lui che lo renda affascinato o spaventato.',
  'unarmored-movement-9':
    'Nel suo turno il monaco può muoversi lungo superfici verticali e sulla superficie dei liquidi senza cadere durante il movimento.',
  'purity-of-body':
    'La padronanza del ki rende il monaco immune alle malattie e ai veleni.',
  'tradition-feature-11': subclassFeature('Tradizione Monastica', 11),
  'tongue-of-sun-and-moon':
    'Il monaco comprende tutte le lingue parlate, e qualsiasi creatura in grado di comprendere una lingua comprende ciò che dice.',
  'diamond-soul':
    'Il monaco ottiene competenza in tutti i tiri salvezza e può spendere 1 punto ki per ripetere un tiro salvezza fallito.',
  'timeless-body-monk':
    'Il monaco non soffre più le debolezze della vecchiaia e non può essere invecchiato magicamente. Non ha inoltre bisogno di cibo né di acqua.',
  'tradition-feature-17': subclassFeature('Tradizione Monastica', 17),
  'empty-body':
    'Il monaco può spendere 4 punti ki per diventare invisibile per 1 minuto e ottenere resistenza a tutti i danni tranne quelli da forza. Può inoltre spendere 8 punti ki per lanciare proiezione astrale su di sé soltanto.',
  'perfect-self':
    'Quando tira l\'iniziativa e non gli restano punti ki, il monaco ne recupera 4.',

  // ═══ Paladino ═════════════════════════════════════════════════════
  'divine-sense':
    'La presenza del male più profondo colpisce i sensi del paladino come un odore nauseabondo. Con un\'azione può aprire la propria percezione per individuare tali forze: conosce la posizione di qualsiasi celestiale, immondo o non morto entro 18 metri che non sia dietro copertura totale.',
  'lay-on-hands':
    'Il tocco benedetto del paladino può curare le ferite. Dispone di una riserva di potere curativo che si ricostituisce con un riposo lungo, con cui può ripristinare un totale di punti ferita pari al suo livello da paladino moltiplicato per 5.',
  'fighting-style-paladin':
    'Il paladino adotta un particolare stile di combattimento come propria specialità.',
  'spellcasting-paladin':
    'Il paladino ha imparato ad attingere alla magia divina tramite la meditazione e la preghiera per lanciare incantesimi. Il Carisma è la sua caratteristica da incantatore.',
  'divine-smite':
    'Quando colpisce una creatura con un attacco in mischia con un\'arma, il paladino può spendere uno slot incantesimo per infliggere al bersaglio danni radiosi in aggiunta a quelli dell\'arma. I danni aggiuntivi sono 2d8 per uno slot di 1° livello, più 1d8 per ogni livello di slot superiore al 1°, fino a un massimo di 5d8.',
  'divine-health':
    'La magia divina che scorre nel paladino lo rende immune alle malattie.',
  'sacred-oath':
    'Il paladino pronuncia il giuramento che lo vincola per sempre. Il giuramento gli concede gli incantesimi del giuramento e il privilegio Incanalare Divinità.',
  'extra-attack-paladin': EXTRA_ATTACK,
  'aura-of-protection':
    'Il paladino e le creature amichevoli entro 3 metri da lui ottengono un bonus ai tiri salvezza pari al suo modificatore di Carisma, minimo +1. La portata diventa 9 metri al 18° livello.',
  'oath-feature-7': subclassFeature('Giuramento Sacro', 7),
  'aura-of-courage':
    'Il paladino e le creature amichevoli entro 3 metri da lui non possono essere spaventati finché egli è cosciente. La portata diventa 9 metri al 18° livello.',
  'improved-divine-smite':
    'Ogni volta che il paladino colpisce una creatura con un\'arma da mischia, quella subisce 1d8 danni radiosi aggiuntivi.',
  'cleansing-touch':
    'Con un\'azione il paladino può porre fine a un incantesimo su di sé o su una creatura consenziente che tocca, un numero di volte pari al suo modificatore di Carisma, minimo una, recuperando gli utilizzi con un riposo lungo.',
  'oath-feature-15': subclassFeature('Giuramento Sacro', 15),
  'aura-improvements':
    'La portata delle aure del paladino aumenta a 9 metri.',
  'oath-feature-20':
    'Il paladino ottiene il privilegio culminante concesso dal suo Giuramento Sacro al 20° livello.',

  // ═══ Ranger ═══════════════════════════════════════════════════════
  'favored-enemy':
    'Il ranger ha una notevole esperienza nello studiare, seguire le tracce, cacciare e persino parlare con un certo tipo di nemico. Sceglie un tipo di nemico prescelto: dispone di vantaggio alle prove di Saggezza (Sopravvivenza) per seguirne le tracce e alle prove di Intelligenza per ricordare informazioni su di esso.',
  'natural-explorer':
    'Il ranger conosce particolarmente bene un tipo di ambiente naturale ed è abile nel viaggiare e sopravvivere in quelle regioni.',
  'fighting-style-ranger':
    'Il ranger adotta un particolare stile di combattimento come propria specialità.',
  'spellcasting-ranger':
    'Il ranger ha imparato a usare l\'essenza magica della natura per lanciare incantesimi, come fa un druido. La Saggezza è la sua caratteristica da incantatore.',
  'ranger-archetype': 'Il ranger sceglie un archetipo che cerca di emulare.',
  'primeval-awareness':
    'Con un\'azione il ranger può spendere uno slot incantesimo da ranger per concentrare la propria percezione sulla regione circostante. Per 1 minuto per livello dello slot speso, percepisce se certi tipi di creature siano presenti entro 1,5 chilometri, o entro 9 chilometri nel suo terreno prediletto.',
  'extra-attack-ranger': EXTRA_ATTACK,
  'favored-enemy-6':
    'Il ranger sceglie un altro nemico prescelto e un altro terreno prediletto.',
  'lands-stride':
    'Muoversi attraverso terreno difficile non magico non costa al ranger movimento aggiuntivo, ed egli dispone di vantaggio ai tiri salvezza contro le piante create o manipolate magicamente per ostacolare il movimento.',
  'natural-explorer-10': 'Il ranger sceglie un altro terreno prediletto.',
  'hide-in-plain-sight':
    'Il ranger può spendere 1 minuto per prepararsi un camuffamento. Se in seguito rimane immobile contro una superficie solida, ottiene un bonus di +10 alle prove di Furtività.',
  'archetype-feature-11': subclassFeature('Archetipo del Ranger', 11),
  'favored-enemy-14': 'Il ranger sceglie un altro nemico prescelto.',
  vanish:
    'Il ranger può effettuare l\'azione di Nascondersi come azione bonus, e non può essere seguito con mezzi non magici a meno che non scelga di lasciare tracce.',
  'feral-senses':
    'Il ranger ottiene sensi soprannaturali: è consapevole della posizione di qualsiasi creatura invisibile entro 9 metri, e non subisce svantaggio ai tiri per colpire contro una creatura che non è in grado di vedere.',
  'foe-slayer':
    'Una volta per turno il ranger può aggiungere il suo modificatore di Saggezza al tiro per colpire o al tiro per i danni di un attacco contro uno dei suoi nemici prescelti.',

  // ═══ Stregone ═════════════════════════════════════════════════════
  'spellcasting-sorcerer':
    'Un evento nel passato dello stregone, o nella vita di un genitore o di un antenato, ha lasciato su di lui un\'impronta indelebile, infondendogli la magia arcana. Il Carisma è la sua caratteristica da incantatore.',
  'sorcerous-origin':
    'Lo stregone sceglie un\'origine stregonesca, che descrive la fonte del suo potere magico innato.',
  'font-of-magic':
    'Lo stregone attinge a una profonda sorgente di magia dentro di sé, rappresentata dai punti stregoneria, che gli permettono di creare svariati effetti magici. Ne ha 2 al 2° livello e ne guadagna 1 per ogni livello da stregone successivo.',
  metamagic:
    'Lo stregone ottiene la capacità di piegare i propri incantesimi alle proprie esigenze e sceglie due opzioni di Metamagia. Ne ottiene un\'altra al 10° livello e un\'altra ancora al 17°.',
  'origin-feature-6': subclassFeature('Origine Stregonesca', 6),
  'metamagic-10': 'Lo stregone apprende una terza opzione di Metamagia a sua scelta.',
  'origin-feature-14': subclassFeature('Origine Stregonesca', 14),
  'metamagic-17': 'Lo stregone apprende una quarta opzione di Metamagia a sua scelta.',
  'origin-feature-18': subclassFeature('Origine Stregonesca', 18),
  'sorcerous-restoration':
    'Quando completa un riposo breve, lo stregone recupera 4 punti stregoneria spesi.',

  // ═══ Warlock ══════════════════════════════════════════════════════
  'otherworldly-patron':
    'Il warlock ha stretto un accordo con un\'entità ultraterrena a sua scelta. La scelta gli concede privilegi al 1° livello, e poi ancora al 6°, 10° e 14°.',
  'pact-magic':
    'Le ricerche arcane del warlock e la magia conferitagli dal suo patrono gli hanno dato dimestichezza con gli incantesimi. Conosce due trucchetti e un certo numero di incantesimi da warlock. I suoi slot incantesimo si recuperano con un riposo breve e sono tutti dello stesso livello.',
  'eldritch-invocations':
    'Studiando il sapere occulto, il warlock ha portato alla luce le suppliche occulte, frammenti di conoscenza proibita che gli conferiscono una capacità magica duratura. Ne ottiene due a sua scelta.',
  'pact-boon':
    'Il patrono ultraterreno concede al warlock un dono per il suo leale servizio. Ottiene uno dei seguenti privilegi: Patto della Catena, Patto della Lama o Patto del Tomo.',
  'patron-feature-6': subclassFeature('Patrono Ultraterreno', 6),
  'patron-feature-10': subclassFeature('Patrono Ultraterreno', 10),
  'mystic-arcanum-6':
    'Il warlock sceglie un incantesimo di 6° livello dalla lista del warlock come arcanum. Può lanciarlo una volta senza spendere uno slot incantesimo e recupera quell\'uso con un riposo lungo.',
  'mystic-arcanum-7':
    'Il warlock sceglie un incantesimo da warlock di 7° livello come arcanum, lanciabile una volta per riposo lungo senza spendere uno slot incantesimo.',
  'patron-feature-14': subclassFeature('Patrono Ultraterreno', 14),
  'mystic-arcanum-8':
    'Il warlock sceglie un incantesimo da warlock di 8° livello come arcanum, lanciabile una volta per riposo lungo senza spendere uno slot incantesimo.',
  'mystic-arcanum-9':
    'Il warlock sceglie un incantesimo da warlock di 9° livello come arcanum, lanciabile una volta per riposo lungo senza spendere uno slot incantesimo.',
  'eldritch-master':
    'Il warlock può spendere 1 minuto implorando il proprio patrono per recuperare tutti gli slot incantesimo spesi di Magia del Patto. Deve completare un riposo lungo prima di poterlo rifare.',
}
