// Descrizioni italiane delle sottoclassi brancalone e dei loro privilegi.
// Fonti: Manuale di Ambientazione 2.6 e Macaronicon 2.2, edizioni italiane.
// I nomi dei privilegi sono quelli delle tabelle "Livello / Privilegi" dei
// manuali; le distanze sono in metri come nell'edizione italiana.

export const brancaloniaFeatureDescriptionsIt: Record<string, string> = {
  // ─── Pagano (barbaro) ─────────────────────────────────────────────
  pagan:
    'Dove altri reami chiamano "barbari" gli invasori e i predoni venuti da oltre i confini, i pagani del Regno vivono al suo interno da secoli — a volte da prima che sorgessero le città attorno a loro — e parlano un Volgare perfetto, seppur con un accento inconfondibile. Come i loro simili d\'Oltremonte hanno scelto l\'Ira, o come la chiamano loro la "Violenza", per risolvere conflitti e dispute sociali. Le comunità più note abitano la Piana dei Pagani, unite sotto la zampa di ferro di Ardarico "ye King", e accolgono spesso selvatici e morganti fra le proprie file.',
  'path-of-unheard-of-ferocity':
    'Dovendo da sempre difendersi dagli eserciti e dai soprusi dei forestieri, i pagani hanno sviluppato un cammino fatto di conoscenza delle terre selvagge, ferocia animale e istinto predatorio: una via di mezzo fra quella dei leggendari uomini-orso Varag e quella degli spiritualisti della natura. Per loro l\'ira non degenera mai in furia disumana o bestiale: acuisce i sensi e infonde la determinazione a colpire per primi, e con inaudita ferocia.',
  'savage-courage':
    'Il barbaro impara a muoversi rapido e determinato come una bestia a caccia. Finché è in ira e non indossa un\'armatura pesante, le altre creature subiscono svantaggio ai tiri per colpire a distanza portati contro di lui, ed egli può usare l\'azione di Scatto come azione bonus nel suo turno.',
  'unstoppable-rage':
    'Il barbaro non può essere trattenuto mentre è in ira, e se lo è quando entra in ira l\'effetto termina immediatamente. Inoltre il terreno difficile e gli effetti magici non possono ridurre la sua velocità base sul terreno.',

  // ─── Arlecchino (bardo) ───────────────────────────────────────────
  harlequin:
    'Si dice che il primo "arlecchino" fosse un certo Alichino, un malebranche fuggito dall\'Inferno che prese a girare il Regno con una compagnia di guitti, portando nei villaggi uno spettacolo inedito fatto di abiti colorati, sberleffi, sgambetti, piroette e burle. Dai suoi abiti vistosi e dal suo volto scuro simile a una maschera sarebbero nati tutti gli arlecchini, i personaggi in costume della Commedia dell\'Arte, ciascuno con nome, personalità e aspetto caricaturali. I bardi che preferiscono questo genere di spettacolo alle esecuzioni musicali più classiche sono riuniti nel Collegio del Carnevale, un\'unione informale di artisti, mimi e attori.',
  'college-of-carnival':
    'Le maschere delle arlecchinate sono molteplici e gli attori migliori ne inventano sempre di nuove. Le più celebri sono Cacciatorina e Bafforosso, Padellao e Fornarina, il Dottor Mutandone, Redingotte e i suoi Manutengoli, Spilorciotto e i Trovatelli, e Calandrone — ma il giocatore è libero di inventare o modificare la propria maschera e sceglierne nome e caratteristiche. Pur essendo messi in scena tutto l\'anno, questi spettacoli sono tipici del Carnevale del Regno.',
  'bonus-proficiencies-harlequin':
    'L\'arlecchino ottiene competenza nel corredo da travestimento, negli arnesi da tessitore e in un tipo di gioco a sua scelta.',
  slapstick:
    'Il batocchio è un randello perfettamente innocuo che emette un forte schiocco, distraendo gli spettatori e facendoli ridere. Quando una creatura attacca l\'arlecchino, egli può usare la sua reazione e spendere un uso di Ispirazione Bardica per distrarre l\'avversario: quello deve superare un tiro salvezza su Saggezza contro la CD degli incantesimi del bardo, altrimenti è affascinato fino al suo turno successivo e perde l\'attacco in corso.',
  'unarmored-defense-harlequin':
    'Mentre non indossa alcuna armatura e non impugna uno scudo, la CA dell\'arlecchino è pari a 10 + il suo modificatore di Destrezza + il suo modificatore di Carisma.',
  'silence-please':
    'L\'arlecchino può lanciare l\'incantesimo silenzio con questo privilegio un numero di volte pari al suo modificatore di Carisma. Inoltre, quando lancia un incantesimo che richiede una componente verbale, può sostituirla con una componente somatica, e i bersagli della sua Ispirazione Bardica non hanno più bisogno di sentirlo, purché siano in grado di vederlo.',

  // ─── Miracolaro (chierico) ────────────────────────────────────────
  miracolaro:
    'La religione ufficiale del popolo del Regno è il Credo, incentrato sul culto del Padre Ternale, dei Santi del Calendario e delle Reliquie, e retto da un clero informale, rispettato e pacifico sotto quattro patriarchi. I miracolari traggono dalla fede poteri speciali, quelli che li rendono Santi — o che lo faranno una volta canonizzati. Possono essere laici o religiosi, bambini, adulti o anziani, di qualsiasi razza, genere o allineamento. Alcuni servono nei ranghi ufficiali come oroscopi o parroci; altri sono guru itineranti, guaritori di campagna o cappellani militari che vagano da soli o si uniscono a una Banda usando i propri doni come meglio credono.',
  'calendar-domain':
    'L\'anno religioso del Regno è scandito dai giorni del Calendario, ciascuno dedicato a un Santo o a una festa sacra: comuni mortali che in vita compirono prodigi e furono canonizzati, come Santa Polenta, patrona degli affamati, o Santa Pace, che protegge i suoi fedeli dalle battaglie. Il chierico ottiene gli incantesimi del Dominio del Calendario, sempre preparati e che non contano ai fini del numero di incantesimi che può preparare: protezione dal male e dal bene e purificare cibo e bevande al 1° livello, incrementare caratteristica e ristorare inferiore al 3°, creare cibo e acqua e dissolvi magie al 5°.',
  'call-on-the-saints':
    'Quando una creatura colpisce il chierico con un attacco, o quando egli fallisce un tiro, può usare la sua reazione per Tirare Giù i Santi e invocarne bonariamente l\'aiuto: aggiunge il suo modificatore di Saggezza al tiro fallito, oppure lo sottrae al tiro per colpire portato contro di lui. Può usare questo privilegio un numero di volte pari al suo modificatore di Saggezza (minimo una) e recupera tutti gli utilizzi quando completa un riposo lungo.',
  'recite-the-calendar':
    'Il chierico può usare Incanalare Divinità per aiutare i compagni: un numero di creature a lui amichevoli pari al suo modificatore di Saggezza dispone di vantaggio a un tiro a loro scelta effettuato prima della fine del loro turno successivo.',
  'by-the-saints':
    'Il chierico può usare Tirare Giù i Santi anche quando una creatura amichevole che è in grado di vedere entro 9 metri fallisce un tiro o viene colpita da un attacco. Inoltre recupera gli utilizzi spesi di Tirare Giù i Santi anche con un riposo breve, oltre che con uno lungo.',

  // ─── Benandante (druido) ──────────────────────────────────────────
  benandante:
    'Molto prima che santi, scaramanti e miracolari prendessero a girare per le campagne, erano i benandanti a proteggere la gente da streghe, diavoli, mostri e fantasmi, e continuano a farlo nonostante la considerevole concorrenza. Questi buoni stregoni dei boschi stanno al confine fra il mondo spirituale, quello umano e quello selvatico; spesso adorano il Padre Ternale, ma accanto a lui venerano gli antichi dèi pagani ormai in declino, come le più cupe e terrigne Tre Madri. I più famosi vivono presso i Monti della Corona, a volte da soli, a volte in coppie di maestro e allievo, a volte in intere congregazioni come i Foresti di Zagara.',
  'glimpse-beyond-the-veil':
    'Il druido vede normalmente nell\'oscurità, sia magica sia non magica, fino a 36 metri, e percepisce la presenza di qualsiasi creatura non morta entro 18 metri da lui.',
  'circle-spells-dance-macabre':
    'Il legame del druido con il regno dei morti gli concede il trucchetto fiamma sacra e gli incantesimi del Circolo della Danza Macabra: eroismo e protezione dal male e dal bene al 2° livello, ristorare inferiore e arma spirituale al 3°, rimuovi maledizione e guardiani spirituali al 5°. Una volta ottenuto l\'accesso a un incantesimo del circolo, il druido lo ha sempre preparato e quello non conta ai fini del numero di incantesimi che può preparare ogni giorno.',
  'dance-macabre-guardian':
    'I non morti percepiscono il legame del druido con il mondo degli spiriti e diventano riluttanti ad attaccarlo. Quando una creatura non morta lo attacca deve effettuare un tiro salvezza su Saggezza contro la CD degli incantesimi da druido: se lo fallisce deve scegliere un altro bersaglio, oppure l\'attacco manca automaticamente. Se lo supera, la creatura è immune a questo effetto per 24 ore. La creatura è consapevole dell\'effetto prima di effettuare il proprio attacco.',

  // ─── Spadaccino (guerriero) ───────────────────────────────────────
  'sword-player':
    'La Guerra dei Mille Anni è talmente radicata nei popoli del Regno da essere ormai considerata l\'unico modo di vivere possibile, e fra i soldati, condottieri, guastatori ed esploratori che ha prodotto ci sono schiere di maestri d\'armi, duellanti e virtuosi del fioretto detti collettivamente spadaccini. Sono tenuti in gran conto in tutta l\'Occasia e nel Mare di Mezzo, e ogni città ha le sue Scuole di Scherma, raggruppate in pochi stili principali più alcuni minori o segreti, tutti in perenne conflitto fra loro vista la fiera campanilistica che domina il Regno. Anziché essere carne da cannone come i soldati comuni, gli spadaccini sono mercenari che agiscono da soli e prestano i propri servigi a nobili, damerini e mercanti, più a loro agio sulle strade cittadine che sui campi di battaglia fangosi.',
  'school-of-fencing':
    'Lo spadaccino apprende tecniche specifiche che ne migliorano l\'efficacia in combattimento. Studiare l\'Avversario: quando effettua l\'azione di Schivare in combattimento, il suo attacco successivo dispone di vantaggio se portato prima della fine del suo turno successivo. Zappa e Pugnale: ottiene un bonus di +1 alla CA mentre impugna un\'arma da mischia distinta per mano. Duello: se si trova entro 1,5 metri da una creatura e nessun\'altra creatura è entro 1,5 metri da lui, aggiunge il suo bonus di competenza ai tiri per i danni contro quella creatura.',

  // ─── Frate (monaco) ───────────────────────────────────────────────
  friar:
    'Frati e monache sono numerosi fra la popolazione e rappresentano un altro volto del Credo nella vita quotidiana. Fra le molte regole monastiche del Regno — ordini zoppi, pitocchi, mendicanti, itineranti, oranti, predicanti, minoriti e minorati, eremiti, scalzi e incatenati — i frati che più spesso si trovano nelle Bande sono quelli degli Ordini Maneschi. Molti sono semplici fratelli e sorelle che girano per le campagne predicando e facendo opere di misericordia, ma poiché "l\'Inferno non conosce furia pari a quella di un buono diventato cattivo" è saggio non tirare troppo la corda: porta l\'altra guancia una volta sola, poi il mandato consente loro di difendersi. La congregazione più nota è l\'Ordine della Mano Callosa.',
  'way-of-the-brawly-rule':
    'A qualunque ordine appartengano, questi frati e queste monache praticano tutti la Regola Manesca, i cui precetti sono ben noti a briganti e rapinatori: "Ora et Menora", "Porgi l\'altro palmo", "Che la tua mano sappia essere di ferro e di piuma", e così via.',
  'turn-the-other-cheek':
    'Il frate può usare il suo modificatore di Forza al posto di quello di Destrezza per i privilegi Difesa Senza Armatura e Deviare Proiettili. Inoltre, quando un avversario lo colpisce con un attacco in mischia, può spendere 1 punto ki per effettuare un colpo senz\'armi usando la sua reazione.',
  'iron-and-feather-hand-technique':
    'Ogni volta che il frate colpisce una creatura con un attacco della sua Raffica di Colpi, può imporre uno dei seguenti effetti. Tiro salvezza su Destrezza: se lo fallisce la creatura cade prona. Tiro salvezza su Forza: se lo fallisce il bersaglio viene spinto fino a 3 metri di distanza e, se urta un ostacolo, subisce danni pari al colpo senz\'armi del frate; se l\'ostacolo è un\'altra creatura, anche quella deve superare un tiro salvezza su Forza o subire gli stessi danni. Tiro salvezza su Costituzione: se lo fallisce il bersaglio subisce svantaggio ai tiri per colpire fino all\'inizio del turno successivo del frate.',

  // ─── Cavaliere Errante (paladino) ─────────────────────────────────
  'knight-errant':
    'Non tutti quelli che si incontrano per le strade del Regno e nella Fratellanza della Taglia sono pezzenti in disgrazia. Alcune Canaglie sono di nobile discendenza: rampolli di famiglie decadute, figli cadetti lanciati nell\'avventura con le armi e i vessilli del casato bene in vista e il fondoschiena su un vecchio ronzino. Generalmente più istruiti del resto della popolazione e armati di robuste ambizioni e princìpi morali, questi cavalieri erranti sono l\'aristocrazia dei pezzenti e spesso pretendono di essere trattati come tali. Il talento quasi soprannaturale che mostrano in battaglia nasce più dal valore e dalla determinazione che da un potere conferito dal Padre Ternale. Incantesimi del giuramento: benedizione e comando al 3° livello, trova cavalcatura e passare senza tracce al 5°.',
  'oath-of-knightly-erring':
    'Erranza: il mondo è ampio e va esplorato; viaggiare, vivere avventure e campare alla giornata non sono un ripiego ma una scelta. Fratellanza: difendere la gente da minacce e ingiustizie, che vengano da mostri, predoni o tiranni. Castigo: fare degna ammenda dei propri torti e scatenare la propria ira su quelli altrui. Ardimento: non tirarsi mai indietro davanti a un\'impresa o a una sfida, perché è dalle proprie gesta che i trovatori trarranno le loro canzoni.',
  'channel-divinity-knight-errant':
    'Ispirare i Compagni: con un\'azione il paladino impugna la propria arma e ispira fino a sei creature amichevoli entro 9 metri (può includere se stesso) che siano in grado di vederlo, sentirlo e capirlo; ciascuna ottiene punti ferita temporanei pari al modificatore di Carisma del paladino, diventa immune alla condizione di spaventato e dispone di vantaggio a tutti i tiri salvezza su Saggezza per 1 minuto. Proteggere i Bisognosi: come azione bonus il paladino si erge a difesa di una creatura che è in grado di vedere; per 1 minuto, finché quella creatura si trova entro 1,5 metri da lui, tutti gli attacchi contro di essa subiscono svantaggio.',

  // ─── Mattatore (ranger) ───────────────────────────────────────────
  mattatore:
    'I mattatori sono cacciatori esperti che catturano bestie e mostruosità dalle profondità delle terre selvagge, le trascinano in città e le vendono per i combattimenti, per i circhi o come inquietanti difensori di fortezze. Sono maestri nel combattere questi mostri nelle arene, sanno esattamente come colpirli, ferirli e farli infuriare in maniera spettacolare, e sono imbonitori e intrattenitori di talento anche durante gli spettacoli più crudeli. Per questo vivono spesso ai margini della società: brutali, scontrosi e violenti, disprezzati allo stesso modo da cacciatori, gladiatori e guardacaccia. Si dice che i più abili vengano da Penumbria, dove la fauna è così letale che lupi, orsi e gattoserpenti passano per animaletti graziosi.',
  'master-of-performance':
    'Il ranger ottiene competenza nelle abilità Addestrare Animali e Intrattenere, se già non le possiede, e il suo bonus di competenza raddoppia in ogni prova di caratteristica che usi una delle due.',
  'eye-of-the-matador':
    'Come azione bonus il ranger può scegliere una creatura che sia in grado di vedere entro 18 metri. Per 1 minuto aggiunge il suo bonus di competenza ai danni inflitti a quella creatura, i suoi attacchi con armi contro di essa mettono a segno un colpo critico con un risultato di 19 o 20, e aggiunge il suo modificatore di Saggezza alla propria CA contro gli attacchi di quella creatura. Recupera l\'uso di questo privilegio quando completa un riposo breve o lungo.',

  // ─── Brigante (ladro) ─────────────────────────────────────────────
  brigand:
    'In un mondo di guerre continue e rivalità fra i potenti, il brigante è spesso visto come il vero campione del popolo contro esattori, gabellieri, borgomastri e cialtroni. I briganti sono innegabilmente banditi e tagliagole, ma per il popolo sono spesso molto meglio dei "loro signori", che per tradizione vivono sulle loro spalle da parassiti. Nel Regno ci saranno almeno centouno compagnie di briganti: le più sgangherate non più di tre disperati a dorso d\'asino, le meglio organizzate ramificate come piccoli eserciti che tengono interi distretti. Tanti si proclamano re o regina dei briganti che quel titolo infame è ormai noto come la Corona di Rame.',
  brigandage:
    'I briganti sono ladri di strada e di campagna, esperti del proprio territorio e a proprio agio fra montagne, foreste e campagne deserte. Il ladro ottiene competenza nelle abilità Natura e Sopravvivenza.',
  'the-fine-art-of-ambushing':
    'Inferiori per numero e per armi rispetto a guardie e scorte delle carovane, i briganti sono diventati maestri di agguati e imboscate. Il ladro dispone di vantaggio ai tiri per l\'iniziativa e a qualsiasi azione intrapresa durante il primo turno di ogni combattimento.',

  // ─── Scaramante (stregone) ────────────────────────────────────────
  scaramante:
    'Incantatrici e ammaliatori, esperti affascinanti di malocchi e sortilegi, manipolatori di Fandonia e di trucchi fatati, taumaturghi abili a contrastare i poteri delle tenebre e le maledizioni di menagrami, eresiarchi, streghe e fantasmi. Alcuni sono oscuri stregoni che trattano con le potenze infernali, altri sono devoti alle forze del bene, altri ancora seguono la volontà delle Tre Madri. A volte si riuniscono in congreghe e fazioni, altre volte agiscono da soli, girando per le campagne e offrendosi di togliere il malocchio al bestiame o di incidere glifi protettivi su stalle e cascine.',
  'extravaganza-origin':
    'Il potere che scorre nelle vene di uno scaramante è quello della Fandonia, il potere delle fate e dei turchini, che ne ha toccato l\'esistenza in un qualche modo prima o dopo la nascita: la discendenza da un\'antica amante fatata, una benedizione dei folletti, o semplicemente il contatto con loro da bambino, abbastanza a lungo perché qualcuno dei loro trucchi gli restasse addosso.',
  'preventive-magic':
    'Quando il privilegio Incantesimi consente allo scaramante di apprendere o sostituire un trucchetto da stregone o un incantesimo da stregone di 1° livello o superiore, egli può scegliere un incantesimo della scuola di Abiurazione dalla lista di qualsiasi altra classe, oltre che da quella dello stregone.',
  'protected-by-fate':
    'Lo scaramante può manipolare le probabilità del fato. Tira un d20 aggiuntivo quando effettua un tiro per colpire, una prova di caratteristica o un tiro salvezza, e sceglie quale dei due d20 usare; può decidere dopo aver tirato ma prima che l\'esito sia determinato. Può usarlo anche quando un tiro per colpire viene effettuato contro di lui: tira un d20, poi sceglie se l\'attacco usa il tiro dell\'attaccante o il suo. Deve completare un riposo lungo prima di poter riutilizzare questo privilegio.',
  'superstitious-ritual':
    'Lo scaramante può condurre un rituale di 10 minuti per proteggere una creatura bersaglio, se stesso compreso, con uno dei seguenti effetti: resistenza a un tipo di danno a sua scelta fra acido, contundenti, freddo, fuoco, fulmine, necrotici, perforanti, taglienti e da tuono; oppure la capacità di ripetere un risultato di 1 a una prova di caratteristica o a un tiro salvezza e usare il nuovo risultato; oppure scendere a 1 punto ferita anziché a 0 quando viene ridotto a 0 senza essere ucciso sul colpo, il che pone fine alla protezione. Il rituale dura 24 ore o finché lo scaramante non riusa il privilegio, e può essere prolungato di altre 24 ore spendendo 2 punti stregoneria. Recupera l\'uso di questo privilegio quando completa un riposo lungo.',

  // ─── Menagramo (warlock) ──────────────────────────────────────────
  menagramo:
    'I settentrionali che arrivano nel Regno con il nome di warlock sono noti a sud dei Monti della Corona come menagrami: evocatori potenti e temuti, capaci di lanciare maledizioni e sventure con uno sguardo di traverso, una parola falsa e invidiosa, un tocco di fastidio e rimorso. Tutto il loro potere deriva da Madama Iattura, la Sfortuna che devia i destini umani verso gli esiti più oscuri e contro la quale sono inutili anche le invocazioni di ogni Santo del Calendario. Per il Credo la Sfortuna è solo un modo di dire, ma tutti nel Regno sanno quanto sia reale. Incantesimi ampliati: maledire e sonno al 1° livello, cecità/sordità e crescita di spine al 2°, animare morti e infliggi maledizione al 3°.',
  'evil-eye':
    'Il patrono concede al menagramo il potere di insinuare dubbi nella mente di un avversario. Sceglie una creatura entro 12 metri che sia in grado di sentirlo: il bersaglio subisce svantaggio al prossimo tiro salvezza che effettua contro un incantesimo lanciato dal menagramo. Recupera l\'uso di questo privilegio quando completa un riposo breve o lungo.',
  'misfortune-touch':
    'Il menagramo invoca il proprio patrono per portare una sventura grande e indicibile. Per un istante una figura spettrale sembra apparire dietro di lui e posargli una mano diafana sulla spalla, ed egli emana un\'aura di intensa sfortuna entro 6 metri per un numero di round pari al suo modificatore di Carisma. Ogni creatura all\'interno dell\'area, tranne lui, subisce svantaggio a tutti i tiri per colpire, le prove di caratteristica e i tiri salvezza. Quando l\'effetto termina, Madama Iattura riscuote il debito e il menagramo scende a 0 punti ferita. Recupera l\'uso di questo privilegio quando completa un riposo lungo.',

  // ─── Guiscardo (mago) ─────────────────────────────────────────────
  guiscardo:
    'I guiscardi sono una gilda chiusa ed esclusiva di imbroglioni e utilizzatori di magia con diramazioni in tutta l\'Occasia, il cui intento è recuperare artefatti, reliquie e frammenti di sapienza perduta, arricchendo lungo la strada il collegio e il proprio rango al suo interno. Terminato l\'apprendistato lasciano la scuola e viaggiano per il Regno, da soli o in Banda, seguendo mappe e risolvendo enigmi, a caccia di tesori e di ingressi alle rovine del passato. Sono i maghi più celebri del Regno: bari, ciarlatani, truffatori di strada e cercatori di tesori arcani, che nella loro gilda imparano un misto di trucchi da ladro e di incantesimi, il che ne fa eccellenti Canaglie, ricercatissime tanto dalle compagnie quanto dalle guardie.',
  'treasure-seeker':
    'Il mago ottiene competenza nelle abilità Indagare e Percezione, e competenza nelle armature leggere e in un\'arma da guerra a una mano a sua scelta.',
  'magic-items-expert':
    'Ogni volta che il mago effettua una prova di caratteristica relativa a oggetti magici o congegni magici, è considerato competente nell\'abilità usata e aggiunge alla prova il doppio del suo bonus di competenza anziché il bonus normale.',
  'magical-trinkets':
    'I guiscardi si portano dietro moltissime chincaglierie magiche, frutto dei loro studi e delle loro esplorazioni: autenticamente magiche, anche se spesso danneggiate o malfunzionanti. Il mago può usare qualsiasi oggetto magico in suo possesso come focus da incantatore per i suoi incantesimi da mago, e possiede un oggetto magico non comune a sua scelta dalla lista della Ferraglia Magica.',
  'master-of-extravaganza':
    'Il mago può sintonizzarsi con 4 oggetti magici anziché 3, e può ignorare qualsiasi prerequisito richiesto per sintonizzarsi con un oggetto magico.',

  // ═══ Macaronicon ═══════════════════════════════════════════════════

  // ─── Montanaro (barbaro) ──────────────────────────────────────────
  mountaineer:
    'Lontano dalle città, dai porti e dalle campagne, lassù fra mufloni e stambecchi, si aggirano i montanari: guide, esploratori e contrabbandieri straordinari, agili come capre selvatiche e silenziosi come lupi, con la fedele fiaschetta sempre al fianco. In tempo di guerra vengono assoldati come esploratori, spie e sabotatori; in tempo di pace scortano pastori, viaggiatori e ricercati attraverso i valichi più impervi. Fra le arti nobili di questa gente rude delle vette c\'è la distillazione dei grappini, distillati di erbe di montagna che risuonano solo con un montanaro.',
  'mountaineer-path':
    'Il Cammino del Montanaro è tutto in salita, dice il proverbio, ma la bottiglia lo rende pianeggiante. Fra le arti nobili che questa gente rude delle vette ha appreso c\'è la distillazione di liquori speciali, fermentati da erbe di montagna dalle proprietà uniche. Usarli fin da piccoli ha dato a ogni montanaro una particolare risonanza con quegli intrugli, che nessuno fuori dal cammino può condividere. Si chiamano grappini, come il rampino a quattro punte che un vero montanaro porta sempre al fianco.',
  'ancient-art-of-the-grappanel':
    'Il montanaro porta sempre con sé le sue fiaschette di distillato e può berne un sorso quando entra in ira. Per tutta la durata dell\'ira ottiene il beneficio del Grappino scelto più la resistenza ai danni psichici, e ottiene competenza negli arnesi da birraio. Demoncello: vede nell\'oscurità magica e non magica fino a 36 metri, può muoversi lungo superfici verticali e soffitti con le mani libere e ottiene una velocità di scalata pari alla sua velocità sul terreno. Sgnappa del Nonno: resistenza ai danni da freddo; ogni creatura che inizia il proprio turno entro 3 metri da lui subisce 1d6 danni da freddo per via del suo alito alpino. Storica Rossa: resistenza ai danni da fuoco; quando un attacco in mischia lo danneggia può usare la sua reazione per soffiare fiamme sull\'attaccante, che subisce 2d8 danni da fuoco se fallisce un tiro salvezza su Destrezza, metà se lo supera. Stravecchia: resistenza ai danni necrotici; la prima creatura che colpisce ogni turno subisce 1d8 danni necrotici aggiuntivi. Vincanto: gli spiriti degli antichi montanari cantano attorno a lui — ottiene resistenza ai danni radiosi, emana luce fioca entro 3 metri e, quando entra in ira, gli spiriti lanciano benedizione o scudo della fede al livello più basso, che dura fino al termine dell\'ira e non richiede concentrazione.',
  blend:
    'Il montanaro può sorseggiare una miscela di due distillati diversi ogni volta che entra in ira e beneficiare di entrambi gli effetti insieme.',

  // ─── Guappo (bardo) ───────────────────────────────────────────────
  guappo:
    'Nel variegato malaffare del Regno, il guappo è il farabutto sgargiante, spaccone e pomposo, spesso anche carismatico e di buon cuore. Per la gente comune è un musicista di strada, un intrattenitore, un dongiovanni e un raddrizzatore di torti, più che una Canaglia. I guappi sono esperti di duelli al coltello e nemici di prepotenti, guardie e criminali sopraffattori. I bardi del Collegio della Guapparia eseguono l\'intero repertorio di canzoni popolari, ballate e serenate del Regno, e sono una fonte di dicerie incomparabile per le Canaglie forestiere.',
  'competence-bonus':
    'Il guappo ottiene competenza nell\'abilità Intimidire e il privilegio gergo ladresco.',
  'implied-folksong':
    'Il guappo può comporre un pezzo che mina la sicurezza di chi lo ascolta. Dopo essersi esibito per almeno 1 minuto, sceglie un numero di umanoidi entro 36 metri che lo abbiano guardato e sentito, fino al suo modificatore di Carisma (minimo uno). Ogni bersaglio deve superare un tiro salvezza su Saggezza contro la CD degli incantesimi del bardo, altrimenti è spaventato; se lo supera, non ha idea che il guappo abbia tentato di spaventarlo. Recupera l\'uso di questo privilegio quando completa un riposo breve o lungo.',
  'unambiguous-violence':
    'Quando effettua un attacco, il guappo può spendere un uso di Ispirazione Bardica. Se l\'attacco colpisce, tira il dado di Ispirazione Bardica e aggiunge altrettanti danni psichici al tiro per i danni. Il bersaglio deve poi superare un tiro salvezza su Saggezza contro la CD degli incantesimi del bardo, altrimenti è spaventato per un numero di round pari al risultato del dado, ripetendo il tiro salvezza al termine di ogni suo turno.',
  'do-be-cruel':
    'Il guappo dispone di vantaggio ai tiri per colpire contro qualsiasi creatura spaventata, afferrata, incapacitata o avvelenata.',

  // ─── Esorcista (chierico) ─────────────────────────────────────────
  exorcist:
    'Alcuni membri del Credo del Calendario, della Fede Paradossa o della Rivelazione sono detti esorcisti e si occupano espressamente di affrontare le forze soprannaturali del male che affliggono i buoni cittadini del Regno. Come i miracolari attingono a una scintilla divina, ma la incanalano attraverso un corpo di rituali, formule e gesti ben codificati. Il loro mandato li tiene sulla strada, da soli o in Banda, a indagare manifestazioni occulte, il che rende facile e utile mescolarsi a canaglie e scioperati, perché è proprio lì che si tramano le trame dell\'Inferno. Incantesimi di dominio: individuazione del bene e del male e marchio incandescente (1° livello), esorcismo e zona di verità (2°), cerchio magico e mondare (3°).',
  'between-the-hammer-and-the-evil':
    'L\'esorcista ottiene competenza nelle armi da guerra e nelle armature pesanti.',
  'the-revelation-gab':
    'Con un\'azione l\'esorcista può brandire il proprio simbolo sacro e pronunciare la preghiera della rivelazione. Apprende se luoghi, oggetti e creature entro 18 metri siano maledetti, posseduti, infestati o sotto un\'influenza malvagia, e ne comprende la natura (creatura, magia o effetto). Può usarlo un numero di volte pari al suo modificatore di Saggezza (minimo una) e recupera tutti gli utilizzi quando completa un riposo lungo.',
  'true-mirror':
    'Quando l\'esorcista usa Scacciare Non Morti, ne sono colpiti anche folletti e immondi. Se la vera forma di una creatura scacciata è celata da un\'illusione, da una forma mutata o da un effetto simile, quella forma viene rivelata.',
  'the-flame-of-the-just':
    'Quando usa La Favella Magna, l\'esorcista può apprendere di più: la storia di un luogo infestato, il livello di potere di una creatura, le sue debolezze o il modo di spezzare una maledizione. Inoltre, quando usa Scacciare Non Morti, può scegliere che le creature che falliscono il tiro salvezza siano trattenute anziché scacciate.',

  // ─── Bravo (guerriero) ────────────────────────────────────────────
  bravo:
    'I bravi sono combattenti specializzati nella vita di città: nell\'operare fra popolani, criminali e guardie anziché nelle terre selvagge o sui campi di battaglia. Un bravo protegge un pezzo grosso, intimidisce un debitore insolvente e sorveglia luoghi e persone: il picchiatore e il tirapiedi perfetto sul libro paga di qualche ricco padrone. Spade in affitto e guardie del corpo ai margini della legge, o più probabilmente fuori da essa, prediligono il cappellaccio a tesa larga, il mantello scuro, la cintura irta di else e gli stivali consunti ma ben lucidati.',
  'disheartening-presence':
    'Il bravo ottiene competenza nell\'abilità Intimidire e può aggiungere il suo modificatore di Forza a ogni prova di Intimidire che effettua.',
  'street-fighter':
    'Il bravo apprende tre colpi bassi a sua scelta, alimentati da quattro dadi di gioco sporco (d8) che recupera con un riposo breve o lungo. Può usare un solo colpo basso per attacco. La CD dei colpi bassi è pari a 8 + il suo bonus di competenza + il suo modificatore di Forza o Destrezza (a sua scelta). Controcalcio: quando una creatura entro 1,5 metri prova a lanciare un incantesimo, usa la reazione e un dado per effettuare un attacco senz\'armi; se colpisce aggiunge il dado ai danni e la creatura perde l\'incantesimo a meno che non superi un tiro salvezza su Costituzione. Taglia la Corda: quando colpisce in mischia spende un dado — il bersaglio non può effettuare attacchi di opportunità e la sua velocità è dimezzata per un numero di round pari al risultato. Scudo Umano: quando una creatura lo attacca, usa la reazione e un dado per deviare l\'attacco su una creatura amichevole entro la portata dell\'attaccante, riducendo i danni del risultato + il suo modificatore di Forza o Destrezza. Attacco Infame: quando colpisce con un\'arma spende un dado e lo aggiunge ai danni; se il bersaglio fallisce un tiro salvezza su Saggezza subisce svantaggio ai tiri per colpire contro chiunque tranne una creatura amichevole a scelta del bravo entro 1,5 metri da lui, fino alla fine del turno successivo del bravo. Sabbia negli Occhi: quando colpisce con un\'arma spende un dado e lo aggiunge ai danni; se il bersaglio fallisce un tiro salvezza su Saggezza subisce svantaggio a tutti i tiri per colpire fino alla fine del turno successivo del bravo. Testata Improvvisa: quando colpisce in mischia spende un dado e lo aggiunge ai danni; dal round successivo l\'iniziativa del bersaglio cala del numero tirato.',

  // ─── Guardia Svanzica (monaco) ────────────────────────────────────
  'svanzic-guard':
    'Non tutti i monaci che girano per il Regno sono frati manaioli su strade di campagna polverose. Esistono tradizioni monastiche nobili, esclusive e segrete — l\'aristocrazia degli Ordini Maneschi del Credo — e la più famosa è la Guardia Svanzica, un battaglione di monaci esperti di combattimento senz\'armi e di alabarda. Mantenuti attorno alle cinquecento unità e pagati profumatamente in svanziche d\'argento di Elevezia, servono come guardia scelta del Patriarca Re nella Città Vaticina, e vengono talvolta inviati all\'estero come spie, osservatori o messaggeri: è così che molti finiscono nelle Bande, dove il loro addestramento senza pari si nota sempre.',
  'training-of-the-guard':
    'Il monaco diventa maestro di alabarda e ottiene i seguenti benefici: competenza nell\'abilità Religione; competenza nell\'alabarda, che per lui conta come arma da monaco; mentre impugna un\'alabarda ottiene un bonus di +2 alla CA quando effettua l\'azione di Schivare; mentre impugna un\'alabarda, le altre creature che entrano nella sua portata provocano un attacco di opportunità, che egli deve effettuare con l\'alabarda; e quando colpisce una creatura con un attacco di alabarda può spendere 1 punto ki per farla cadere prona, a meno che non superi un tiro salvezza su Costituzione.',
  'sacred-svanzic-dogma':
    'Il monaco ottiene il trucchetto taumaturgia e, con un\'azione, può spendere 2 punti ki per lanciare faro di speranza, punizione incandescente, scudo della fede o guardiani spirituali senza fornire componenti materiali.',

  // ─── Cavalier Servente (paladino) ─────────────────────────────────
  'gallant-knight':
    'Questi aristocratici, cortigiani e cavalieri non sono devoti a una causa o a un ideale astratto, ma all\'Amor Cortese, e in particolare a una specifica Dama o a un Sire di cui sono diventati "servitori". È quasi sempre un vero e proprio contratto sociale e un\'usanza di corte: cavaliere e Amato si scambiano segreti, consigli e compagnia. Ogni cavaliere serve un solo Amato e ogni Amato ha un solo cavalier servente; il legame può restare epistolare per anni, ma spezzarlo per motivi futili è una grande vergogna. Alcuni cavalier serventi servono una principessa lontana che nemmeno sa della loro esistenza, e il potere dell\'Amor Cortese concede loro i propri doni lo stesso. Incantesimi del giuramento: charme e eroismo (3° livello), calmare emozioni e legame protettivo (5°).',
  'oath-of-love':
    'Il paladino entra nel Servizio d\'Amore per il proprio Sire o la propria Dama. Servizio d\'Amore: servire l\'Amato in ogni momento, o dedicarsi soltanto alle imprese che lo renderebbero fiero. Fedeltà d\'Amore: sostenere l\'intera somma della cortesia cavalleresca — gentilezza, benevolenza, giustizia retta, amicizia, ricerca della bellezza, dedizione, umanità ed empatia.',
  'channel-divinity-gallant-knight':
    'Amore Divino: con un\'azione il paladino invoca l\'amore divino che è in lui e ottiene resistenza a tutti i danni. Finché dura non può lanciare incantesimi né mantenere la concentrazione, e l\'effetto termina prima se cade privo di sensi o se il suo turno finisce senza che abbia attaccato una creatura ostile o subito danni dall\'ultimo turno; può anche terminarlo come azione bonus. Inno all\'Amore: con un\'azione libera il proprio fervore in un canto estatico — ogni creatura ostile entro 9 metri deve effettuare un tiro salvezza su Saggezza, subendo 3d8 danni radiosi ed essendo assordata se lo fallisce, o metà di quei danni se lo supera.',

  // ─── Acchiapparatti (ranger) ──────────────────────────────────────
  'rat-catcher':
    'Nelle città più grandi e intricate del Regno il mestiere dell\'Acchiapparatti è diffusissimo, e copre molto più di quanto il nome suggerisca: infestanti e parassiti, le bestie delle fogne e delle catacombe, carogne, oggetti animati che non stanno al loro posto e persino fate e spettri. La città e i suoi sotterranei, cantine, canali, catacombe e torri sono il terreno di caccia preferito di questo cacciatore urbano: un terreno di sfida e di scontro non meno pericoloso delle terre selvagge. Provate a pattugliare le fogne di Tarantasia, i canali di Vortiga o i vicoli di Crimini, e poi ne riparliamo.',
  'rat-catchers-magic':
    'Il ranger apprende incantesimi aggiuntivi che per lui contano come incantesimi da ranger ma non contano ai fini del numero di incantesimi da ranger che conosce: marchio incandescente al 3° livello e lama di fuoco al 5°.',
  'torch-bearer':
    'Quando infligge danni da fuoco, il ranger può aggiungervi il suo modificatore di Saggezza.',
  'danger-perception':
    'Il ranger dispone di vantaggio ai tiri salvezza su Destrezza contro qualsiasi effetto che sia in grado di percepire, come trappole e incantesimi. Perde questo beneficio mentre è accecato, assordato o incapacitato.',
  'urban-guide':
    'Il ranger considera terreno prediletto le aree urbane, le fogne, le cantine, le fortezze e gli edifici cittadini di ogni sorta.',

  // ─── Congegnere (ladro) ───────────────────────────────────────────
  gadgeteer:
    'Il Regno non è solo una terra di canaglie, condottieri, frati e nobili: le sue città e le sue accademie non scarseggiano di artisti, inventori, gioiellieri, orologiai e architetti capaci di vere opere d\'ingegno. Chi si specializza in orologeria di precisione, aggeggi sgangherati e meccanismi di ogni tipo è detto Congegnere, e poiché ladri, criminali e malfattori li assoldano di continuo per costruire ciò che serve loro, i migliori appartengono alla classe del ladro.',
  macgadget:
    'Il congegnere ottiene competenza negli arnesi da inventore e impara a fabbricare oggetti di fortuna con qualsiasi ferraglia abbia sottomano. Spende 1 minuto consumando oggetti di valore complessivo pari o superiore a quello dell\'oggetto desiderato, poi effettua una prova di Intelligenza (arnesi da inventore) con CD 10, o pari al valore in monete d\'oro dell\'oggetto se superiore. L\'oggetto ottenuto è una versione scadente dell\'originale.',
  'bag-of-gadgeteering':
    'Il congegnere conosce tutti gli Aggeggi seguenti. Gli Aggeggi funzionano solo per lui, non pesano nulla e possono essere preparati in numero pari a 1 + il suo modificatore di Intelligenza (minimo 1), cambiati con un riposo lungo e scelti anche più volte. Ciascuno è monouso e si recupera con un riposo breve o lungo; alcuni possono essere piazzati come trappola in 1 minuto e attivati con la reazione entro 12 metri. La CD degli Aggeggi è pari a 8 + il suo bonus di competenza + il suo modificatore di Destrezza o Intelligenza (a sua scelta). Aggeggio Abbagliante: una vampata accecante entro 3 metri, a una gittata di 6 metri — tiro salvezza su Costituzione o accecato fino alla fine del turno successivo del bersaglio (trappola). Maschera da Palombaro: si attiva o disattiva come azione bonus; mentre è indossata e attiva non c\'è bisogno di respirare, per un totale di 10 minuti. Aggeggio Esplosivo: un\'esplosione di schegge entro 3 metri, a una gittata di 6 metri — tiro salvezza su Destrezza per 3d6 + il modificatore di Intelligenza danni perforanti, metà se superato (trappola). Soffietto Infuocato: un cono di fuoco di 4,5 metri. Retinsidia: fili uncinati entro 3 metri, a una gittata di 6 metri — tiro salvezza su Destrezza o trattenuto, con fuga possibile tramite una prova di Forza contro la CD dell\'Aggeggio (trappola). Aggeggio Ingrassante: un quadrato di 3 metri di lato di patina oleosa entro 6 metri diventa terreno difficile per 1 minuto — tiro salvezza su Destrezza o caduta prona entrandovi o terminandovi il turno; l\'olio è infiammabile e brucia per 2 round infliggendo 2d4 danni da fuoco (trappola). Ali Meccaniche: un\'azione bonus concede una velocità di volare di 15 metri per 10 minuti, ma non si può salire e si scende di 1,5 metri all\'inizio di ogni proprio turno. Aggeggio Puzzolente: una nube di gas nauseabondo pesantemente oscurata entro 3 metri, a una gittata di 6 metri, per 1 minuto — tiro salvezza su Costituzione o perdita dell\'azione per gli spasmi; le creature che non respirano ne sono immuni (trappola).',

  // ─── Eresiarca (stregone) ─────────────────────────────────────────
  heresiarch:
    'Il Credo è una religione di estrema tolleranza, dedita più al buon vivere e alla raccolta delle elemosine che alle inquisizioni, ma l\'unica cosa che clero e fedeli non tollerano sono gli Eresiarchi: stregoni che adorano e traggono potere da Lucifuga, dagli Arcidiavoli, dai Malacoda e da tutta la pseudo-monarchia dell\'Inferno. Forse un antenato strinse un Patto, forse la Canaglia fu concepita durante riti che è meglio non descrivere. Il potere è innato, ma la via della perdizione non è né necessaria né predestinata: se persino i diavoli possono lasciare l\'Inferno e vivere da persone comuni, può farlo anche chi ha una goccia di sangue diabolico. Incantesimi infernali: charme e camuffare se stesso (1° livello), soggiogare e suggestione (3°), paura e destriero fantasma (5°).',
  'heresy-stigma':
    'L\'eresiarca ha scurovisione fino a 36 metri e ottiene competenza nell\'abilità Inganno.',
  'infernal-magic':
    'L\'eresiarca apprende incantesimi aggiuntivi ai livelli indicati nella tabella degli Incantesimi Infernali. Per lui contano come incantesimi da stregone ma non contano ai fini del numero di incantesimi da stregone che conosce, e non può sostituirli quando acquisisce un livello in questa classe.',
  'the-ninth-gate':
    'Quando lancia un incantesimo che infligge danni, l\'eresiarca può spendere 1 punto stregoneria per cambiare il tipo di danno in psichico, infondendo nell\'incantesimo l\'eco del terrore e dell\'agonia provati dai dannati.',

  // ─── Talismante (warlock) ─────────────────────────────────────────
  talismancer:
    'Invece che da Madama Iattura o da un patrono immondo, certi warlock traggono potere da essenze celestiali sparse per il mondo terreno: talismani astrali detti Enchiridi, "ciò che si porta in mano", perché per funzionare devono essere innestati nel palmo di chi li porta. Queste gemme mistiche senzienti sono quasi certamente di origine angelica o celestiale, cadute dal Firmamento o trafficate per il mondo dalle fucine benedette di Urania. La fusione fra Enchiridio e talismante è così profonda che staccarlo lo ucciderebbe, anche se nulla obbliga il portatore a usarne la luce con benevolenza. Incantesimi ampliati: benedizione e scudo della fede (1° livello), esorcismo e punizione incandescente (2°), emanazione angelica e luce del giorno (3°).',
  'chosen-bearer':
    'Il talismante ottiene competenza nelle armature medie, negli scudi e nelle armi da guerra.',
  'angelic-fervor':
    'Il talismante sceglie uno dei seguenti benefici. Quando colpisce una creatura con un attacco con un\'arma può infondere nel colpo la furia dell\'Enchiridio, infliggendo danni radiosi aggiuntivi pari al suo modificatore di Carisma, e può spendere slot incantesimo da warlock per aggiungere altri 1d8 danni per livello di slot. Oppure: quando viene colpito da un attacco può usare la sua reazione per liberare un\'ondata di energia rinvigorente, concedendo a se stesso e a ogni creatura amichevole entro 3 metri punti ferita temporanei pari al suo modificatore di Carisma, più altri 1d8 per ogni livello di slot incantesimo da warlock speso. Può usare questo privilegio un numero di volte pari al suo modificatore di Carisma (minimo una) e recupera tutti gli utilizzi quando completa un riposo breve o lungo.',
  'angelic-intercession':
    'Quando il talismante viene ridotto a 0 punti ferita senza essere ucciso sul colpo, le energie del suo patrono si riversano fuori dall\'Enchiridio. Lui e ogni creatura amichevole entro 9 metri recuperano punti ferita pari a 2d8 + il suo modificatore di Carisma, e ogni nemico entro 9 metri deve effettuare un tiro salvezza su Saggezza, subendo 2d8 + il modificatore di Carisma danni radiosi se lo fallisce o metà se lo supera. Recupera l\'uso di questo privilegio quando completa un riposo breve o lungo.',

  // ═══ Burattinaio (Macaronicon) ═════════════════════════════════════
  burattinaio:
    'La scoperta delle straordinarie facoltà del legno turchino ha aperto la strada all\'arte magica dei Burattinai: artigiani e intrattenitori abili a creare marionette senzienti, burattini animati e figurine più comuni, e a farli esibire. La loro esistenza odora di legno — si spostano di villaggio in villaggio su carri stracolmi di oggetti di scena e attrezzi da falegname, vivendo in mezzo a trucioli e pezzi di ricambio — e devono continuamente rimediare il denaro per tirare avanti un\'altra luna.',
  'theatre-of-extravaganza':
    'I burattini non sono senzienti, ma il burattinaio condivide le proprie energie con alcuni di essi tramite un legame fatato interiore detto Fili. Quando termina la costruzione di un burattino animato, i Fili si intrecciano fra lui e la sua creazione: gli permettono di muovere il burattino e di attivarne le capacità uniche. Può essere collegato a un solo burattino per volta e può spostare i Fili su un altro con un\'azione bonus; il legame termina se il burattinaio è incapacitato o muore. Mentre il burattino è in vista ed entro la Distanza d\'Uso, il burattinaio può usare la sua azione per fargli effettuare le azioni di Attacco, Scatto, Disimpegno, Schivare o Aiuto o una prova di abilità, la sua azione bonus per muoverlo, e usarne la Tecnica Segreta. Contraccolpo: tutti i danni, gli effetti, gli incantesimi e le condizioni inflitti a un burattino a cui è collegato sono inflitti a lui, ed è lui a effettuarne i tiri salvezza. Il suo bonus di attacco con un burattino è pari al modificatore di Intelligenza + il bonus di competenza, e la CD per resistere agli effetti del burattino è 8 + il modificatore di Intelligenza + il bonus di competenza. La Distanza d\'Uso parte da 15 metri e cresce a 18, 24 e 30 metri man mano che il burattinaio sale di livello.',
  'puppets-created':
    'Il burattinaio possiede tre burattini a sua scelta dalla lista dei burattini comuni — Romualdo, il Dottor Mutandone, Guerlocco, Brighella, Pulcinello, l\'Arcangelo Giorel e Taratata sono i modelli classici — e ne ottiene altri al 3° e al 5° livello, fino a un totale di cinque. Ogni burattinaio costruisce i propri burattini e può legare i Fili solo a burattini che ha realizzato lui stesso. Un burattino a cui è collegato conta come un costrutto di taglia Minuscola.',
  'puppeteers-tradition':
    'Il burattinaio sceglie una tradizione — Geppetto o Mangiafuoco — intitolata ai mitici fondatori dei due approcci all\'arte dei burattini animati. La scelta gli concede privilegi al 1° e al 6° livello.',
  canons:
    'Dedicandosi all\'arte delle marionette e dei pupazzi, il burattinaio sviluppa dei canoni artistici, conoscenze di costruzione e di messa in scena che gli permettono di usare i propri burattini per compiere veri portenti. Ottiene due canoni al 2° livello e altri man mano che avanza, e ogni volta che acquisisce un livello può sostituire un canone che conosce con un altro che potrebbe apprendere.',
  'artistic-vocation':
    'Il burattinaio sceglie la vocazione che caratterizzerà il suo Teatro di Fandonia. Messinscena: raddoppia la propria Distanza d\'Uso e, con un\'azione, può estendere le proprie percezioni attraverso un burattino collegato fino all\'inizio del suo turno successivo, durante il quale è cieco e sordo a quanto lo circonda. Arte della Costruzione: tutte le sue creazioni sono più robuste — un burattino non collegato ha 20 punti ferita e CA 10 — e ripararle è più rapido.',
  masterpiece:
    'Il burattinaio crea un nuovo burattino unico e speciale, il suo capolavoro, scelto dalla lista dei capolavori.',
  mangiafuoco:
    'I Mangiafuoco nascono dalla strada e dai tanti artisti e impresari che girano per le vie del Regno. Anche se sono loro stessi a creare i propri burattini, proprio come i Geppetto, sono meno legati emotivamente alle proprie creazioni e le impiegano quasi come attori o artisti della propria compagnia, pronti a sacrificarle qualora dovesse servire.',
  'the-show-must-go-on':
    'Quando un burattino sta per subire danni, il burattinaio può usare la sua reazione per recidere i Fili che lo legano alla marionetta, che perderà i benefici del legame.',
  'pyrotechnics-art':
    'Quando usa Lo spettacolo deve continuare, il burattinaio può distruggere il burattino liberando l\'energia fandonica del legno turchino in un grande fuoco d\'artificio. Ogni creatura entro 3 metri dal burattino deve effettuare un tiro salvezza su Costituzione: se lo fallisce subisce 3d8 danni da tuono ed è accecata, se lo supera subisce solo la metà di quei danni e non è accecata.',
  geppetto:
    'A differenza dei Mangiafuoco, che assomigliano più a impresari senza scrupoli che ad affezionati creatori, i Geppetto si relazionano ai propri burattini con un legame emotivo molto forte e personale, che i burattini stessi non mancano di avvertire. Questa familiarità maggiore trasforma il rapporto fra burattinaio e pupazzi in un\'intensa amicizia o in un rapporto quasi genitoriale.',
  'fatherly-love':
    'Il burattinaio dispone di vantaggio a tutti i tiri salvezza effettuati a causa di un effetto trasmesso attraverso il suo legame con un burattino.',
  'loyal-son':
    'Quando il burattinaio viene ridotto a 0 punti ferita mentre i suoi Fili sono legati a un burattino, questi non vengono recisi: può continuare a effettuare azioni usando solo il burattino per 3 round, e per tutta la durata il Contraccolpo dei Fili non lo colpisce. L\'effetto termina se recupera punti ferita, se muore o se al termine del terzo round è ancora a 0 punti ferita; quando termina, il burattino si rompe.',
}

/** Nomi italiani dei privilegi, come nelle tabelle dei manuali. */
export const brancaloniaFeatureNamesIt: Record<string, string> = {
  'path-of-unheard-of-ferocity': 'Cammino dell\'Inaudita Ferocia',
  'savage-courage': 'Barbaro Coraggio',
  'unstoppable-rage': 'Ira Irrefrenabile',
  'college-of-carnival': 'Collegio del Carnevale',
  'bonus-proficiencies-harlequin': 'Competenze Bonus',
  slapstick: 'Batocchio',
  'unarmored-defense-harlequin': 'Difesa Senza Armatura',
  'silence-please': 'Silenzio in Sala',
  'calendar-domain': 'Dominio del Calendario',
  'call-on-the-saints': 'Tirare Giù i Santi',
  'recite-the-calendar': 'Incanalare Divinità: Recitare il Calendario',
  'by-the-saints': 'Per Tutti i Santi!',
  'glimpse-beyond-the-veil': 'Guardare Oltre il Velo',
  'circle-spells-dance-macabre': 'Incantesimi del Circolo',
  'dance-macabre-guardian': 'Guardiano della Danza Macabra',
  'school-of-fencing': 'Scuola di Scherma',
  'way-of-the-brawly-rule': 'Via della Regola Manesca',
  'turn-the-other-cheek': 'Porgi l\'Altra Guancia',
  'iron-and-feather-hand-technique': 'Tecnica della Mano di Ferro e di Piuma',
  'oath-of-knightly-erring': 'Dettami del Cavaliere Errante',
  'channel-divinity-knight-errant': 'Incanalare Divinità',
  'master-of-performance': 'Maestro dell\'Esibizione',
  'eye-of-the-matador': 'Occhio del Mattatore',
  brigandage: 'Brigantaggio',
  'the-fine-art-of-ambushing': 'Arte dell\'Imboscata',
  'extravaganza-origin': 'Origine Fandonica',
  'preventive-magic': 'Magia di Protezione',
  'protected-by-fate': 'Protetto dal Fato',
  'superstitious-ritual': 'Rituale Scaramantico',
  'evil-eye': 'Iattura',
  'misfortune-touch': 'Il Tocco della Malasorte',
  'treasure-seeker': 'Cercatore di Tesori',
  'magic-items-expert': 'Esperto di Oggetti Magici',
  'magical-trinkets': 'Chincaglieria Magica',
  'master-of-extravaganza': 'Maestria Fandonica',
  'mountaineer-path': 'Cammino del Montanaro',
  'ancient-art-of-the-grappanel': 'Antica Arte del Grappino',
  blend: 'Miscela',
  'competence-bonus': 'Competenze Bonus',
  'implied-folksong': 'Canzone Sottintesa',
  'unambiguous-violence': 'Violenza Beneinesa',
  'do-be-cruel': 'Infierire',
  'between-the-hammer-and-the-evil': 'Lo Martello che Schiaccia lo Male',
  'the-revelation-gab': 'La Favella Magna',
  'true-mirror': 'L\'Ispecchio della Verità',
  'the-flame-of-the-just': 'La Fiamma dello Giusto',
  'disheartening-presence': 'Presenza Scoraggiante',
  'street-fighter': 'Combattente da Strada',
  'training-of-the-guard': 'Addestramento della Guardia',
  'sacred-svanzic-dogma': 'Sacri Dogmi di Svanzica',
  'oath-of-love': 'Dettami del Cavalier Servente',
  'channel-divinity-gallant-knight': 'Incanalare Divinità',
  'rat-catchers-magic': 'Magia dell\'Acchiapparatti',
  'torch-bearer': 'Portatore della Torcia',
  'danger-perception': 'Percezione del Pericolo',
  'urban-guide': 'Guida Urbana',
  macgadget: 'Con-genio',
  'bag-of-gadgeteering': 'Sacca degli Aggeggi',
  'heresy-stigma': 'Marchio dell\'Eresia',
  'infernal-magic': 'Magia Infernale',
  'the-ninth-gate': 'La Nona Porta',
  'chosen-bearer': 'Portatore Prescelto',
  'angelic-fervor': 'Fervore Angelico',
  'angelic-intercession': 'Intercessione Angelica',
  'theatre-of-extravaganza': 'Teatro di Fandonia',
  'puppets-created': 'Burattini Creati',
  'puppeteers-tradition': 'Tradizione del Burattinaio',
  canons: 'Canoni',
  'artistic-vocation': 'Vocazione Artistica',
  masterpiece: 'Capolavoro',
  'the-show-must-go-on': 'Lo Spettacolo Deve Continuare',
  'pyrotechnics-art': 'Arte Pirotecnica',
  'fatherly-love': 'Amore Paterno',
  'loyal-son': 'Figlio Fedele',
}
