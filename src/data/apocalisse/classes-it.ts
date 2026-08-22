// Descrizioni italiane degli archetipi e dei loro privilegi.
// Fonte: Apocalisse — John's Guide to the Armageddon 1.0, edizione italiana.
// I nomi dei privilegi e la terminologia di gioco sono quelli stampati nel
// manuale italiano; le distanze sono in metri come nell'edizione italiana.

export const apocalisseFeatureDescriptionsIt: Record<string, string> = {
  // ─── Cammino del Martirio (barbaro) ───────────────────────────────
  'path-of-the-horseman':
    'Chi segue questo cammino è di fatto un martire votato al combattimento e alla strage, un penitente che mortifica la propria carne per acquisire maggior furia e determinazione e abbattere i nemici. Alcuni indossano maschere di ferro trafitte da aghi, altri si uncinano fasce di pelle ai corpi possenti. Non amano il dolore di per sé né sono pazzi autolesionisti: il loro tormento è una scelta cosciente, fatta per riversare ancora più furia su chi si pone loro davanti.',
  'martyrize-self':
    'Una volta per turno mentre è in ira, prima del primo attacco, il barbaro può infliggersi delle ferite e subire 1d4 danni a sua scelta tra contundenti, perforanti o taglienti. Questi danni non possono essere ridotti. Fino alla fine del turno, ogni colpo andato a segno con un\'arma da mischia infligge altrettanti danni aggiuntivi: 1d6 al 6° livello, 1d8 al 10° e 1d10 al 15°. Inoltre non può essere spaventato mentre è in ira, e un\'eventuale paura è sospesa per tutta la durata dell\'ira. Se ancora non la possiede, ottiene una maschera del martire appena possibile.',
  'salt-in-a-wound':
    'Il barbaro impara a conoscere i punti deboli dei nemici e i modi migliori per elargire sofferenza. Quando mette a segno un colpo critico, può aggiungere il suo bonus di competenza ai danni inflitti.',
  'endurance-martyrdom':
    'Il barbaro ha imparato ad accusare colpi, assalti e afflizioni di ogni genere incassandoli senza subirne gli effetti. Quando non è al massimo dei suoi punti ferita, se fallisce un tiro salvezza può ripetere il tiro del dado e deve usare il nuovo risultato. Può farlo un numero di volte pari alla metà del suo bonus di competenza, arrotondata per difetto, e recupera tutti gli utilizzi quando completa un riposo lungo.',
  'an-eye-for-an-eye':
    'Il barbaro sfrutta il dolore di una ferita appena subita per sferrare un contrattacco immediato. Mentre è in ira, quando subisce danni può usare la sua reazione per effettuare un attacco con un\'arma da mischia contro una creatura entro portata.',
  'relentless-martyrdom':
    'La soglia del dolore del barbaro è ormai così alta che, mentre è in ira, non può essere incapacitato, stordito o paralizzato, e qualsiasi colpo critico contro di lui conta come un colpo normale.',

  // ─── Collegio della Rivelazione (bardo) ───────────────────────────
  'college-of-laments':
    'I tetri cantori veggenti del Collegio della Rivelazione sono evangelizzatori, visionari e profeti, il cui compito è cogliere sprazzi del futuro: per sé, per chi sta loro attorno o contro i propri nemici. Si ispirano al veggente che secoli fa vergò il Libro della Rivelazione, ma il Dono non si insegna: il collegio si limita a trovare chi già lo possiede. Molti dei suoi membri evitano Babilonia e vagano per i deserti e le paludi dell\'Armageddon in cerca di adepti, o della solitudine necessaria a sentire il fato mormorare.',
  'spellcasting-focus-revelation':
    'Il bardo trova, realizza o si procura un salterio, un tomo o un quaderno di pagine bianche e si sintonizza con esso come se fosse un oggetto magico. Una volta sintonizzato può usarlo come focus da incantatore per i suoi incantesimi da bardo. Ogni privilegio di classe che richiederebbe la musica o la voce — come Ispirazione Bardica o Canto di Riposo — usa esclusivamente la sua voce e questo libro, che gli funge da breviario di preghiere e libro dei canti.',
  'omens-of-future':
    'Il bardo apprende i trucchetti guida e colpo accurato, se già non li possiede. Inoltre può usare la sua azione e iniziare a piangere lacrime di sangue, leggendovi il proprio futuro immediato: chiede alla Guida cosa gli riserverà un corso d\'azione che intende intraprendere nelle prossime 24 ore, e riceve una risposta tra Riuscita, Possibilità, Disastro, Imprevisto, Indifferenza e Confusione. Dopo aver usato questo privilegio è accecato fino al termine del suo turno successivo e non può riutilizzarlo finché non completa un riposo breve o lungo.',
  'inflicted-destiny':
    'Con un\'azione il bardo predice la morte o la sconfitta di una creatura piangendo sangue sul proprio libro e interpretandone le macchie. Spende un uso di Ispirazione Bardica e sceglie una creatura entro 18 metri, percependone magicamente la presenza anche se non è in grado di vederla. Tira un numero di dadi di Ispirazione Bardica pari al suo bonus di competenza e aggiunge il modificatore di Carisma. Il bersaglio effettua un tiro salvezza su Saggezza contro la CD degli incantesimi del bardo: se lo fallisce subisce quei danni psichici ed è spaventato dal bardo fino alla fine del turno successivo, se lo supera subisce solo metà danni e non è spaventato. Dopo l\'uso il bardo deve superare un tiro salvezza su Costituzione con CD pari a 8 + il suo bonus di competenza, altrimenti subisce un livello di indebolimento.',
  'warning-revelation':
    'Segnali divinatori avvertono il bardo di quanto sta per accadere, ed egli li interpreta abbastanza in fretta da trasmetterli a chi lo circonda. Come azione bonus può spendere un uso di Ispirazione Bardica e scegliere una creatura entro 18 metri che sia in grado di vedere: fino all\'inizio del suo prossimo turno quella creatura non può essere sorpresa e dispone di vantaggio ai tiri per colpire e ai tiri salvezza.',
  'elude-destiny':
    'Quando una creatura diversa dal bardo viene colpita da un attacco, da un incantesimo o da qualsiasi altro effetto magico o mondano, il bardo può spendere la sua reazione e un uso di Ispirazione Bardica per annullare tutti i danni e ogni altro effetto che quella fonte le infligge. Il privilegio non ha effetto sugli altri eventuali bersagli della stessa fonte. Dopo l\'uso il bardo è accecato fino alla fine del suo turno successivo e non può riutilizzarlo finché non completa un riposo breve o lungo.',

  // ─── Dominio della Rovina (chierico) ──────────────────────────────
  'domain-of-heresy':
    'Il suono delle campane che rimbomba sulla Piana dell\'Armageddon richiama insieme la voce del Signore e il fragore degli abissi. I chierici della Fine dei Tempi sanno invocare i suoni dell\'inevitabile decadere di ogni cosa: le loro campane portano distruzione e, a volte, rinnovamento. Credono che tutto debba essere distrutto per poter essere ricostruito, e che rovina, erosione e declino siano segni dell\'Ultima Battaglia sempre più vicina. Incantesimi di dominio: creare o distruggere acqua e onda tonante (1°), arma magica e frantumare (3°), creare cibo e acqua e rivificare (5°), fabbricare e modellare la pietra (7°), passaparete e muro di forza (9°).',
  'bells-of-destruction':
    'Il chierico ottiene competenza nella campana da battaglia e nelle armature pesanti, e riceve una campana da battaglia da aggiungere al proprio equipaggiamento.',
  'ruining-and-mending':
    'Il chierico apprende il trucchetto riparare, se già non lo possiede. Inoltre, quando colpisce un bersaglio con un\'arma da mischia che infligge danni contundenti, può invocare il potere della rovina per infliggere danni da tuono aggiuntivi pari al suo modificatore di Saggezza, raddoppiati contro un oggetto o una struttura. Può farlo un numero di volte pari al suo bonus di competenza e recupera tutti gli utilizzi quando completa un riposo breve o lungo.',
  'channel-divinity-devastation':
    'Con un\'azione il chierico impugna il proprio simbolo sacro e invoca a gran voce il potere di Shaddai il Distruttore. Dal simbolo si propaga un boato udibile entro 60 metri e ogni creatura in un cono di 9 metri deve effettuare un tiro salvezza su Costituzione contro la CD degli incantesimi del chierico. Se lo fallisce subisce 3d8 + il livello da chierico danni da tuono, cade prona ed è assordata fino all\'inizio del turno successivo del chierico; se lo supera subisce solo metà danni e nessuna delle due condizioni. I costrutti subiscono svantaggio a questo tiro salvezza e i danni diventano 6d8 + il livello da chierico.',
  'channel-divinity-restoration':
    'Con un\'azione il chierico tocca una creatura e le fa recuperare 3d8 + il suo livello da chierico punti ferita. Può inoltre rimuovere dal bersaglio un livello di indebolimento, oppure porre termine a una malattia o a una condizione che lo affligge tra accecato, assordato, paralizzato e stordito. Non può usare questo privilegio su una creatura non morta.',
  'unchecked-ruin':
    'Una volta per turno, quando colpisce una creatura con un attacco con un\'arma, il chierico può infliggere 1d8 danni da tuono aggiuntivi, che diventano 2d8 al 14° livello. Inoltre i privilegi che usa e gli incantesimi che lancia ignorano la resistenza ai danni da tuono.',
  'disintegrate-matter':
    'Con un\'azione il chierico invoca il potere del Distruttore contro un bersaglio entro 18 metri che sia in grado di vedere: una creatura, un oggetto o una creazione di forza magica come un muro di forza. Una creatura deve effettuare un tiro salvezza su Saggezza contro la CD degli incantesimi del chierico: se lo fallisce subisce 12d12 + il livello da chierico danni da tuono ed è stordita fino all\'inizio del turno successivo del chierico. Se i danni la riducono a 0 punti ferita viene disintegrata: lei e tutto ciò che indossa e trasporta, tranne gli oggetti magici, diventano un mucchio di polvere grigia, e solo resurrezione pura o desiderio possono riportarla in vita. Il privilegio disintegra automaticamente un oggetto non magico o una creazione di forza magica di taglia Grande o inferiore, o un cubo di 3 metri di lato di uno più grande; gli oggetti magici non ne sono influenzati. Il chierico recupera l\'uso di questo privilegio quando completa un riposo lungo.',

  // ─── Circolo della Piaga (druido) ─────────────────────────────────
  'circle-of-plagues':
    'I druidi del Circolo della Piaga abbracciano la corruzione della Carestia, il terzo Cavaliere. I loro corpi decadono e si trasformano, concedendo loro potere su malattie e pestilenze per condurre il mondo alla rinascita.',
  'circle-spells-plagues':
    'Il legame con la Piaga concede al druido degli incantesimi: 2° livello — spruzzo acido e individuazione di veleni e malattie; 3° — cecità/sordità e crescita di spine; 5° — infliggi maledizione e nube maleodorante; 7° — avvizzimento e insetto gigante; 9° — contagio e flagello d\'insetti.',
  'plagued-wild-shape':
    'Quando il druido usa Forma Selvatica, la bestia ottiene il tratto Bestia Piagata: subisce svantaggio ai tiri salvezza su Costituzione e alle prove di Saggezza, ma i suoi attacchi infliggono danni aggiuntivi pari al bonus di competenza della bestia.',
  'excruciating-contagion':
    'Il druido è immune alle malattie e infligge danni aggiuntivi pari al suo bonus di competenza. Può diffondere il contagio in un\'aura di 3 metri: chi vi si trova effettua un tiro salvezza su Costituzione contro la CD degli incantesimi del druido, altrimenti è infettato e accecato per 1 minuto. Può farlo un numero di volte pari al suo bonus di competenza e recupera gli utilizzi con un riposo breve o lungo.',
  'plagued-palms':
    'Il druido può effettuare un attacco con un\'arma da mischia per infettare il bersaglio con una Piaga più letale. Se colpisce, il bersaglio è stordito per 1d6 round e può porre termine all\'effetto con un tiro salvezza su Costituzione. Gli utilizzi sono condivisi con Contagio Straziante.',
  'subjugated-plague':
    'Il druido ha imparato a convivere con la straziante malattia che lo affligge ed è riuscito a dominarne gli effetti più perniciosi: i suoi privilegi e i suoi incantesimi superano le eventuali immunità alle malattie.',
  'deadly-miasma':
    'Con un\'azione il druido emana dal proprio corpo un miasma di natura ultraterrena contro una creatura entro 9 metri che sia in grado di vedere. Il bersaglio effettua un tiro salvezza su Saggezza: se lo fallisce viene infettato ed è paralizzato e incapace di recuperare punti ferita, e può porre termine all\'effetto con un tiro salvezza su Costituzione. Gli utilizzi sono condivisi con Contagio Straziante e Palmi Piagati.',

  // ─── Furioso (guerriero) ──────────────────────────────────────────
  furioso:
    'L\'archetipo del Furioso è specializzato nelle manovre d\'assalto e nell\'uso di armi grandi e pesanti come lo spadone fiammeggiante. Preferisce velocità, sorpresa e mobilità alla difesa, concentrando tutta la potenza in colpi devastanti.',
  'whirling-steel':
    'Mentre non indossa armature pesanti o medie e impugna un\'arma da mischia a due mani, il furioso può effettuare un attacco ad area: ogni creatura entro portata deve effettuare un tiro salvezza su Destrezza con CD pari a 8 + il suo bonus di competenza + il suo modificatore di Forza. Se lo fallisce subisce i danni dell\'arma e, se di taglia Grande o inferiore, cade prona. Può farlo un numero di volte pari al suo bonus di competenza e recupera gli utilizzi con un riposo breve o lungo.',
  'formidable-warrior':
    'Il furioso ottiene competenza in un\'abilità a sua scelta tra Atletica, Intimidire, Sopravvivenza e Storia. Ottiene inoltre uno spadone fiammeggiante (arma da mischia da guerra, 2d8 danni taglienti, a due mani, pesante, speciale).',
  'furious-assault':
    'Come azione bonus il furioso può ottenere vantaggio ai tiri per colpire in mischia basati sulla Forza fino alla fine del turno, ma anche i tiri per colpire contro di lui dispongono di vantaggio fino al suo turno successivo. Se colpisce, aggiunge il doppio del suo modificatore di Forza al primo tiro per i danni. Ottiene inoltre punti ferita temporanei pari a 1d10 + il modificatore di Costituzione. Può farlo un numero di volte pari al suo bonus di competenza e recupera gli utilizzi con un riposo lungo.',
  'improved-whirling-steel':
    'La portata dell\'attacco ad area di Turbine di Acciaio aumenta di 1,5 metri, e ogni creatura che fallisce il tiro salvezza è anche stordita fino all\'inizio del turno successivo del furioso.',
  recklessness:
    'Il furioso dispone di vantaggio ai tiri salvezza per evitare o terminare la condizione di spaventato. Se già dispone di quel vantaggio, diventa immune alla condizione. Quando usa Assalto Furioso, i punti ferita temporanei salgono a 2d10 + il modificatore di Costituzione.',
  'ready-to-die':
    'Quando il furioso viene ridotto a 0 punti ferita senza essere ucciso sul colpo, può usare la sua reazione per scendere invece a 1 punto ferita ed effettuare immediatamente un attacco in mischia con vantaggio contro una creatura entro portata. Dopo averlo usato non può riutilizzarlo finché non completa un riposo breve o lungo.',

  // ─── Spettro dell'Assenzio (ladro) ────────────────────────────────
  'wormwood-specter':
    'Gli spettri dell\'assenzio sono individui oscuri e silenziosi, imbevuti di un veleno innaturale detto assenzio. Lanciano pesanti turiboli e sfruttano dense nubi di vapori nocivi per nascondere la propria presenza.',
  'wormwood-addiction':
    'La trasformazione indotta dall\'assenzio ha inizio: il ladro ottiene resistenza ai danni da veleno ed è immune alla condizione di avvelenato.',
  'wormwood-shroud':
    'Come azione bonus il ladro evoca una coltre di vapori di assenzio in una sfera del raggio di 4,5 metri per 1 minuto. L\'area è leggermente oscurata e il ladro può nascondersi al suo interno. Quando mette a segno un Attacco Furtivo, infligge danni da veleno aggiuntivi pari al suo bonus di competenza e il bersaglio è avvelenato. Può farlo un numero di volte pari al suo bonus di competenza e recupera gli utilizzi con un riposo lungo.',
  'improved-wormwood-shroud':
    'Il raggio della coltre aumenta a 9 metri e non può più essere dispersa da alcun vento. I danni da veleno della coltre ignorano la resistenza ai danni da veleno, mentre l\'immunità è considerata resistenza ai fini di oltrepassarla. Inoltre il ladro aggiunge il suo bonus di competenza ai tiri per l\'iniziativa.',
  'misty-form':
    'Come azione bonus il ladro sublima in una forma ottenebrata e caliginosa per 1 ora, o finché non torna alla sua forma naturale con un\'altra azione bonus. Mentre è in forma caliginosa non può effettuare azioni, né parlare o manipolare oggetti; non ha peso, ha una velocità di volare di 6 metri e può fluttuare, può entrare nello spazio di una creatura ostile e passare ovunque possa passare l\'aria senza stringersi, dispone di vantaggio ai tiri salvezza su Forza, Destrezza e Costituzione ed è immune a tutti i danni non magici. Recupera l\'uso di questo privilegio quando completa un riposo breve o lungo.',
  evanescence:
    'Fintanto che si trova all\'interno della sua coltre di assenzio, ogni volta che una creatura che il ladro è in grado di vedere lo colpirebbe, egli può usare la sua reazione, tirare un d20 e scegliere se usare quel tiro al posto di quello dell\'attaccante. Può farlo un numero di volte pari al suo modificatore di Destrezza, minimo una, e recupera tutti gli utilizzi quando completa un riposo lungo.',

  // ─── Scuola di Salomone (mago) ────────────────────────────────────
  'school-of-solomon':
    'I maghi della Scuola di Salomone studiano l\'antica arte di vincolare e comandare gli spiriti ultraterreni. Si narra che Re Salomone comandasse i demoni per costruire il suo tempio, e i suoi eredi proseguono quella tradizione nella Fine dei Tempi.',
  'initiate-school-solomon':
    'La CD dei tiri salvezza degli incantesimi di ammaliamento ed evocazione del mago aumenta di 1, ed egli può parlare, leggere e scrivere la Lingua Primordiale. Se il Tempio di Salomone non gliene ha già consegnato uno, il mago ottiene un anello di Salomone appena possibile.',
  'solomons-warding':
    'Il mago è avvolto da un\'aura mistica di protezione: ottiene +1 a tutti i tiri salvezza contro incantesimi e altri effetti magici. Inoltre, quando lui o una creatura che è in grado di vedere entro 9 metri subisce danni, può usare la sua reazione per evocare uno schermo cabalistico, tirare 2d8 + il suo modificatore di Intelligenza e ridurre i danni di quell\'ammontare. Può farlo un numero di volte pari al suo bonus di competenza e recupera gli utilizzi con un riposo lungo.',
  'summon-otherworldly-spirit':
    'Con un\'azione il mago pronuncia un\'incantazione cabalistica ed evoca un malakh, un demone della tentazione o qualsiasi altro immondo o celestiale con grado di sfida pari o inferiore a 2, in uno spazio libero che sia in grado di vedere entro 18 metri. La creatura è amichevole verso di lui e i suoi compagni e rimane finché il mago mantiene la concentrazione, fino a 1 ora, o finché non scende a 0 punti ferita. Senza ordini si limita a difendersi. Il mago recupera l\'uso di questo privilegio quando completa un riposo breve o lungo.',
  'master-school-solomon':
    'Il mago dispone di vantaggio ai tiri salvezza su Costituzione per mantenere la concentrazione sugli incantesimi di evocazione e sui suoi privilegi di evocazione. Inoltre, come azione bonus, può teletrasportarsi magicamente fino a 18 metri in uno spazio libero che sia in grado di vedere; ogni creatura entro 3 metri da lui che sia in grado di vederlo deve poi effettuare un tiro salvezza su Saggezza contro la CD dei suoi incantesimi, altrimenti è affascinata da lui per 1 minuto o finché non subisce danni. Può teletrasportarsi un numero di volte pari al suo bonus di competenza e recupera gli utilizzi con un riposo lungo.',
  'summon-greater-spirit':
    'L\'incantazione del mago richiama ora uno spirito di Salomone, un cherubino, un demone dell\'assenzio o qualsiasi altro immondo o celestiale con grado di sfida pari o inferiore a 5, in uno spazio libero che sia in grado di vedere entro 36 metri, per un massimo di 1 ora di concentrazione. Recupera l\'uso di questo privilegio quando completa un riposo breve o lungo.',

  // ─── Via dei Sette Sigilli (monaco) ───────────────────────────────
  'way-of-the-seven-seals':
    'I monaci che seguono la Via dei Sette Sigilli incanalano il potere apocalittico liberato dall\'apertura di ciascuno dei sette sigilli. Ogni sigillo concede una diversa capacità devastante.',
  'the-first-four-seals':
    'Quattro sfere mistiche vengono innestate nel petto del monaco, e ciascuna costa punti ki. Sigillo della Conquista: con un\'azione, spendendo 3 punti ki, sprigiona un fulmine in una linea di 15 metri e larga 1,5 metri — tiro salvezza su Destrezza contro la CD del ki, altrimenti 2d10 danni da fulmine e stordito, +1d10 per ogni punto ki aggiuntivo fino a 6. Sigillo della Guerra: quando una creatura entro 3 metri lo colpisce in mischia, può spendere 2 punti ki come reazione per liberare una fiammata — tiro salvezza su Destrezza, altrimenti 1d12 danni da fuoco e accecata fino all\'inizio del suo turno successivo, +1d12 per ogni punto ki aggiuntivo fino a 6. Sigillo della Carestia: i colpi senz\'armi del monaco avvelenano il bersaglio che fallisce un tiro salvezza su Costituzione fino all\'inizio del turno successivo del monaco, e 1 punto ki aggiunge 1d12 danni da veleno che ignorano la resistenza ai danni da veleno. Sigillo della Morte: con un\'azione, spendendo 3 punti ki, genera un\'ondata di freddo entro 4,5 metri — tiro salvezza su Costituzione, altrimenti 3d8 danni da freddo e trattenuta, +1d8 per ogni punto ki aggiuntivo.',
  'seal-of-resurrection':
    'Il monaco innesta nel petto la quinta sfera mistica. Spendendo 4 punti ki può toccare una creatura morta nell\'ultimo minuto: quella creatura torna in vita con 1 punto ferita.',
  'seal-of-eternal-eclipse':
    'Il monaco innesta nel petto la sesta sfera mistica. Con un\'azione può spendere 5 punti ki per sprigionare dal suo corpo un\'oscurità innaturale. Il monaco vede attraverso di essa fino a 18 metri, la scurovisione non può penetrarla, e l\'oscurità dissipa la luce creata da incantesimi di 3° livello o inferiore che si sovrappongano all\'area.',
  'seal-of-silence':
    'Il monaco innesta nel petto l\'ultima sfera mistica. Quando vede una creatura entro 9 metri lanciare un incantesimo, può spendere 6 punti ki e usare la sua reazione: a meno che la creatura non superi un tiro salvezza su Saggezza contro la CD del ki del monaco, l\'incantesimo fallisce e non ha effetto, e la creatura è assordata e non può lanciare incantesimi con componente verbale fino alla fine del suo turno successivo.',

  // ─── Giuramento della Fine del Mondo (paladino) ───────────────────
  'oath-of-the-end':
    'I paladini che pronunciano il Giuramento della Fine del Mondo si votano a testimoniare e plasmare gli ultimi giorni. Che cerchino di salvare o di condannare, impugnano il potere della fine di ogni cosa.',
  'channel-divinity-memento-mori':
    'Con un\'azione il paladino mostra a una creatura a sua scelta entro 9 metri la propria fine. A meno che non sia immune alla condizione di spaventato, la creatura deve effettuare un tiro salvezza su Saggezza contro la CD degli incantesimi del paladino — aberrazioni, mostruosità ed elementali subiscono svantaggio — e se lo fallisce è spaventata dal paladino per 1 minuto, ripetendo il tiro salvezza al termine di ogni suo turno.',
  'channel-divinity-ultima-forsan':
    'Con un\'azione il paladino ricorda a un massimo di quattro creature entro 6 metri che potrebbe essere la loro ultima ora: per 1 minuto lui e loro dispongono di vantaggio ai tiri salvezza contro incantesimi e altri effetti magici.',
  'divine-ruin':
    'Ogni volta che il paladino userebbe Punizione Divina per infliggere danni radiosi, infligge invece danni da forza. Tutti gli altri effetti del privilegio rimangono immutati.',
  'aura-of-dismay':
    'La paura si aggrappa al paladino entro 3 metri, che diventano 9 metri al 18° livello. Finché una creatura da lui spaventata si trova nell\'aura, la sua velocità è dimezzata e i tiri per colpire del paladino contro di essa dispongono di vantaggio.',
  'exploit-dismay':
    'Quando una creatura nemica entra nell\'aura di sconcerto del paladino o vi inizia il proprio turno durante uno scontro, il paladino può usare la sua reazione per infliggerle 2d8 + il suo modificatore di Carisma danni da forza.',
  'herald-of-the-end':
    'Con un\'azione il paladino esalta corpo e spirito e diventa per 1 minuto il simbolo terreno della distruzione: i suoi attacchi con armi da mischia mettono a segno un colpo critico con un risultato di 19 o 20, può effettuare un attacco con un\'arma da mischia come azione bonus, e ogni colpo in mischia infligge 2d6 danni da forza aggiuntivi e obbliga il bersaglio a un tiro salvezza su Forza per non cadere prono.',

  // ─── Baluardo (ranger) ────────────────────────────────────────────
  bastion:
    'I baluardi sono ranger che fanno da guardie di frontiera e tiratori scelti, difendendo gli ultimi baluardi della civiltà dagli orrori della Piana dell\'Armageddon. Sono specializzati nel combattimento a distanza con armi da fuoco pesanti come la colubrina.',
  'improved-perception':
    'Il ranger ottiene competenza nell\'abilità Percezione, e il suo bonus di competenza raddoppia in ogni prova di caratteristica effettuata usando quest\'abilità.',
  'sentinel-on-the-border':
    'Il ranger ottiene una colubrina e 20 proiettili. Se rinuncia a muoversi durante il proprio turno mentre impugna un\'arma a distanza, può prendere la mira su una creatura e disporre di vantaggio al successivo attacco a distanza contro di essa in quel turno. Può farlo un numero di volte pari al suo bonus di competenza e recupera gli utilizzi con un riposo breve o lungo.',
  'frontier-training':
    'Il ranger ottiene competenza nelle armi da fuoco e nelle armature pesanti, e le armature pesanti non gli sono più d\'intralcio: può ignorare la colonna "Forza" della tabella delle armature.',
  'egregious-training':
    'Il ranger ignora la proprietà ricarica delle armi a distanza. Inoltre, come azione bonus, può scegliere una creatura: la volta successiva che la colpisce in quel turno, il bersaglio subisce danni extra dall\'arma pari al bonus di competenza del ranger.',
  'tireless-shooter':
    'Le ronde continue hanno reso il ranger robusto fuori dal comune: ottiene competenza nei tiri salvezza su Costituzione e dispone di vantaggio per evitare o terminare la condizione di accecato su se stesso.',
  bullseye:
    'Il ranger impara a infliggere colpi micidiali nei punti deboli di qualsiasi bersaglio: quando effettua un attacco con un\'arma nel suo turno, può decidere di infliggere un colpo critico. Recupera l\'uso di questo privilegio quando completa un riposo lungo.',

  // ─── Discendenza Ultraterrena (stregone) ──────────────────────────
  'otherworldly-heritage':
    'La magia innata dello stregone proviene da un antenato ultraterreno: un angelo o un demone. Questa discendenza si manifesta in capacità soprannaturali che si rafforzano man mano che egli abbraccia la propria doppia natura.',
  'otherworldly-ancestor':
    'Lo stregone sceglie l\'antenato il cui sangue gli scorre nelle vene: un Angelo, il cui tipo di danno è radioso, o un Demone, il cui tipo di danno è necrotico. Quella scelta determina il tipo di danno usato da tutti i privilegi successivi di questa origine.',
  'otherworldly-sign':
    'La discendenza dello stregone si vede. Un Angelo gli concede un\'aureola dorata e luminosa, il trucchetto luce e una Lama dello Splendore, con la relativa competenza. Un Demone gli concede due piccole corna e un cupo bagliore purpureo, il trucchetto illusione minore e una Lama della Tenebra, con la relativa competenza.',
  'ancestors-protection':
    'Mentre non indossa alcuna armatura, la CA dello stregone è pari a 10 + il suo modificatore di Carisma + il suo modificatore di Destrezza. Inoltre dispone di vantaggio ai tiri salvezza contro morte.',
  'otherworldly-spell':
    'Lo stregone ottiene un\'opzione di Metamagia che nessun altro stregone possiede: spendendo 1 punto stregoneria aggiuntivo può trasformare i danni da acido, freddo, fulmine, fuoco, psichici o da tuono di un incantesimo nel tipo di danno del suo antenato.',
  'otherworldly-consonance':
    'Una volta per turno lo stregone può aggiungere il suo modificatore di Carisma a un tiro per i danni del tipo di danno del suo antenato. Inoltre può spendere 1 punto stregoneria per ottenere resistenza a quel tipo di danno per 1 ora.',
  'call-of-blood':
    'Come azione bonus lo stregone dispiega le ali e ottiene una velocità di volare pari alla sua velocità sul terreno. Inoltre, con un\'azione, può emanare un\'aura accecante entro 9 metri: ogni creatura al suo interno deve effettuare un tiro salvezza su Saggezza contro la CD dei suoi incantesimi, altrimenti è accecata. Recupera l\'uso di questo privilegio quando completa un riposo lungo.',
  'otherworldly-affliction':
    'Quando infligge a una creatura il tipo di danno del suo antenato, lo stregone può spendere 5 punti stregoneria per rendere quel bersaglio vulnerabile a quel tipo di danno fino all\'inizio del suo turno successivo.',

  // ─── Patto di Lilith (warlock) ────────────────────────────────────
  'warlock-of-lilith':
    'La warlock ha stretto un patto con Lilith, la Madre dei Demoni, che incarna libertà, ribellione e selvaggia indipendenza. Le sue warlock sono individualiste feroci che rifiutano ogni autorità.',
  'expanded-spell-list-lilith':
    'Lilith aggiunge degli incantesimi alla lista della warlock: ritirata rapida e marchio del cacciatore (1° livello), calmare emozioni e levitazione (2°), volare e non individuabilità (3°), libertà di movimento e sacrario privato (4°), scacciare il male e il bene e consacrare (5°).',
  'shielding-veils':
    'I veli di Lilith avvolgono la warlock: non può essere affascinata, posseduta o spaventata da aberrazioni, celestiali, immondi, folletti o elementali.',
  'fierce-savagery':
    'La warlock ottiene competenza negli archi corti e negli archi lunghi. Dopo ogni riposo può toccare un\'arma e, fino al riposo successivo, usare il Carisma al posto della Forza o della Destrezza per i suoi tiri per colpire e per i danni. Questo vale anche per la sua arma del patto.',
  'pact-boon-lilith':
    'La warlock deve scegliere il Patto della Lama. La sua arma del patto è sempre un\'arma a distanza, le fa da focus da incantatore per gli incantesimi da warlock e genera da sé le proprie munizioni magiche.',
  'indomitable-freedom':
    'Come azione bonus la warlock si leva in volo per 1 minuto: ottiene una velocità di volare di 9 metri e può fluttuare, una volta per turno infligge 1d6 danni da forza aggiuntivi con un attacco con un\'arma, e non può essere trattenuta. Può farlo un numero di volte pari al suo bonus di competenza e recupera gli utilizzi con un riposo lungo.',
  'rebellion-against-fate':
    'Quando effettua un tiro per colpire con un\'arma e manca il bersaglio, la warlock può usare un\'azione bonus per effettuare un altro tiro per colpire con quell\'arma contro lo stesso bersaglio.',
  'ultimate-freedom':
    'I danni aggiuntivi di Libertà Indomabile di Lilith salgono a 1d12. Finché il privilegio dura la warlock non può essere paralizzata e non provoca attacchi di opportunità quando vola fuori dalla portata di una creatura.',
}

/** Nomi italiani dei privilegi, come stampati nel manuale. */
export const apocalisseFeatureNamesIt: Record<string, string> = {
  'martyrize-self': 'Martoriarsi',
  'salt-in-a-wound': 'Infierire',
  'endurance-martyrdom': 'Sopportazione',
  'an-eye-for-an-eye': 'Occhio per Occhio',
  'relentless-martyrdom': 'Implacabile',
  'spellcasting-focus-revelation': 'Focus da Incantatore',
  'omens-of-future': 'Presagi del Futuro',
  'inflicted-destiny': 'Destino Inflitto',
  'warning-revelation': 'Avvertimento',
  'elude-destiny': 'Eludere il Destino',
  'bells-of-destruction': 'Campane della Distruzione',
  'ruining-and-mending': 'Rovinare e Riparare',
  'channel-divinity-devastation': 'Incanalare Divinità: Devastazione',
  'channel-divinity-restoration': 'Incanalare Divinità: Risanamento',
  'unchecked-ruin': 'Rovina Incontrastabile',
  'disintegrate-matter': 'Disgregazione',
  'circle-spells-plagues': 'Incantesimi del Circolo',
  'plagued-wild-shape': 'Forma Selvatica Piagata',
  'excruciating-contagion': 'Contagio Straziante',
  'plagued-palms': 'Palmi Piagati',
  'subjugated-plague': 'Dominare la Piaga',
  'deadly-miasma': 'Miasma Esiziale',
  'whirling-steel': 'Turbine di Acciaio',
  'formidable-warrior': 'Combattente Formidabile',
  'furious-assault': 'Assalto Furioso',
  'improved-whirling-steel': 'Turbine di Acciaio Migliorato',
  recklessness: 'Avventatezza',
  'ready-to-die': 'Pronto alla Morte',
  'wormwood-addiction': 'Imbevuto di Assenzio',
  'wormwood-shroud': 'Coltre di Assenzio',
  'improved-wormwood-shroud': 'Coltre di Assenzio Migliorata',
  'misty-form': 'Forma Caliginosa',
  evanescence: 'Evanescenza',
  'initiate-school-solomon': 'Iniziato della Scuola di Salomone',
  'solomons-warding': 'Protezione di Salomone',
  'summon-otherworldly-spirit': 'Evoca Spirito Ultraterreno',
  'master-school-solomon': 'Maestro della Scuola di Salomone',
  'summon-greater-spirit': 'Ultraterreno Maggiore',
  'the-first-four-seals': 'I Primi Quattro Sigilli',
  'seal-of-resurrection': 'Sigillo della Resurrezione',
  'seal-of-eternal-eclipse': 'Sigillo dell\'Eclissi Eterna',
  'seal-of-silence': 'Sigillo del Silenzio',
  'channel-divinity-memento-mori': 'Incanalare Divinità: Memento Mori',
  'channel-divinity-ultima-forsan': 'Incanalare Divinità: Ultima Forsan',
  'divine-ruin': 'Rovina Divina',
  'aura-of-dismay': 'Aura di Sconcerto',
  'exploit-dismay': 'Approfittare dello Sconcerto',
  'herald-of-the-end': 'Araldo della Fine del Mondo',
  'improved-perception': 'Percezione Migliorata',
  'sentinel-on-the-border': 'Sentinella dei Confini',
  'frontier-training': 'Addestramento di Frontiera',
  'egregious-training': 'Addestramento d\'Eccellenza',
  'tireless-shooter': 'Cecchino Instancabile',
  bullseye: 'Centro Perfetto',
  'otherworldly-ancestor': 'Antenato Ultraterreno',
  'otherworldly-sign': 'Segno Ultraterreno',
  'ancestors-protection': 'Protezione dell\'Antenato',
  'otherworldly-spell': 'Incantesimo Ultraterreno',
  'otherworldly-consonance': 'Consonanza Ultraterrena',
  'call-of-blood': 'Richiamo del Sangue',
  'otherworldly-affliction': 'Afflizione Ultraterrena',
  'expanded-spell-list-lilith': 'Elenco Incantesimi Ampliato',
  'shielding-veils': 'Veli Protettivi',
  'fierce-savagery': 'Selvaggia Ferocia di Lilith',
  'pact-boon-lilith': 'Dono del Patto',
  'indomitable-freedom': 'Libertà Indomabile di Lilith',
  'rebellion-against-fate': 'Ribellione Contro il Destino',
  'ultimate-freedom': 'Liberazione Assoluta di Lilith',
}
