import type { GameVariant } from '@/stores/app'

/**
 * Due o tre righe mostrate sulla card di scelta della classe.
 *
 * Brancalonia e Apocalisse rinominano le classi base di D&D con il nome della
 * loro sottoclasse d'ambientazione — il barbaro diventa "Pagano", il guerriero
 * diventa "Furioso" — quindi il testo va per variante: chi sceglie fra un
 * Monaco dei Sette Sigilli e un Furioso non sta scegliendo fra un monaco e un
 * guerriero generici.
 *
 * Le chiavi sono gli id delle classi base di D&D.
 */
const dnd5e: Record<string, string> = {
  barbarian:
    'Entra in ira e incassa: resistenza ai colpi, d12 di vita e nessuna armatura da indossare. Il muro della prima fila, che colpisce più forte man mano che si arrabbia.',
  bard:
    'Combatte con la parola e la musica: ispira i compagni con un dado da aggiungere ai loro tiri, e lancia incantesimi da qualsiasi lista. Il jolly del gruppo.',
  cleric:
    'Canalizza il potere della sua divinità per curare, scacciare i non morti e menare le mani in armatura. Prepara ogni giorno gli incantesimi che gli servono.',
  druid:
    "Trasforma se stesso in bestia e piega la natura al proprio volere. L'unico che può passare la giornata come un orso e la sera lanciare un incantesimo.",
  fighter:
    'Il maestro d\'armi puro: più attacchi di chiunque altro, un\'azione in più quando serve, e la possibilità di ripetere i tiri salvezza falliti. Semplice ed efficace.',
  monk:
    'Combatte a mani nude incanalando il ki: raffiche di colpi, difesa senza armatura e la capacità di stordire un nemico con un tocco. Rapido e schivo.',
  paladin:
    'Guerriero votato a un giuramento: cura con le mani, protegge i compagni con la sua aura e scarica gli slot incantesimo in punizioni radiose devastanti.',
  ranger:
    'Cacciatore e battistrada: conosce un nemico e un territorio meglio di chiunque, combatte a distanza o con due armi, e lancia qualche incantesimo naturale.',
  rogue:
    "Colpisce dove fa male: attacco furtivo una volta per turno, il doppio della competenza nelle sue abilità, e un'azione bonus ogni turno per muoversi e sparire.",
  sorcerer:
    'La magia gli scorre nel sangue, non la studia. Pochi incantesimi, ma piegabili a piacere con la metamagia spendendo punti stregoneria.',
  warlock:
    'Ha stretto un patto con un\'entità ultraterrena. Pochi slot che si recuperano a ogni riposo breve, e le suppliche occulte che ne plasmano lo stile.',
  wizard:
    'Studia la magia sul libro degli incantesimi ed è quello che ne conosce di più. Fragile, ma nessuno ha la sua versatilità ai livelli alti.',
}

const brancalonia: Record<string, string> = {
  barbarian:
    "Il pagano vive dentro i confini del Regno da secoli e parla un Volgare perfetto, ma ha scelto l'Ira — o come la chiama lui, la Violenza — per risolvere le dispute.",
  bard:
    "L'arlecchino è la maschera della Commedia dell'Arte: sberleffi, piroette e batocchio. Distrae l'avversario ridendo e si difende senza armatura, con la faccia tosta.",
  cleric:
    'Il miracolaro tira giù i Santi del Calendario quando serve una mano: aggiunge la Saggezza a un tiro fallito, suo o di un compagno. Santo per acclamazione, non per nomina.',
  druid:
    'Il benandante protegge la gente da streghe, diavoli e fantasmi. Vede nel buio, sente i non morti e danza la Danza Macabra al confine fra i vivi e i morti.',
  fighter:
    'Lo spadaccino è il duellante di scuola: studia l\'avversario, combatte di zappa e pugnale e nel duello uno contro uno aggiunge la competenza ai danni.',
  monk:
    'Il frate degli Ordini Maneschi porge l\'altra guancia una volta sola, poi il mandato gli consente di difendersi. Combatte a mani nude usando la Forza al posto della Destrezza.',
  paladin:
    "Il cavaliere errante è l'aristocrazia dei pezzenti: nobile decaduto a cavallo di un ronzino, ispira i compagni e si erge a difesa di chi non può difendersi.",
  ranger:
    "Il mattatore cattura bestie e mostruosità e le combatte nelle arene. Sceglie una preda e per un minuto la colpisce più spesso, più forte e schivandola meglio.",
  rogue:
    'Il brigante è il ladro di strada e di campagna, per il popolo più campione che bandito. Maestro di agguati: vantaggio all\'iniziativa e a tutto il primo turno.',
  sorcerer:
    'Lo scaramante manipola la Fandonia delle fate e toglie il malocchio al bestiame. Tira un d20 in più e sceglie quale usare: il fato lo protegge di suo.',
  warlock:
    'Il menagramo trae potere da Madama Iattura. Con uno sguardo di traverso rovina il tiro salvezza di un nemico, e al 6° livello scatena una sfortuna che pagherà caro.',
  wizard:
    'Il guiscardo è mago e truffatore insieme: cerca tesori e reliquie, usa qualsiasi cianfrusaglia magica come focus e si sintonizza con un oggetto in più degli altri.',
  burattinaio:
    'Costruisce burattini di legno turchino e li anima con i Fili. Combatte per interposta marionetta, ma ogni ferita del burattino la incassa lui.',
}

const apocalisse: Record<string, string> = {
  barbarian:
    'Il barbaro del Martirio si tormenta le carni per trasformare il dolore in furia: si ferisce prima di attaccare e per quel turno colpisce molto più forte.',
  bard:
    'Il bardo della Rivelazione piange lacrime di sangue e ci legge dentro il futuro prossimo. Predice la sconfitta di un nemico, e a volte annulla il destino di un compagno.',
  cleric:
    'Il chierico della Rovina suona le campane della fine di ogni cosa: danni da tuono ad area, e la capacità di disintegrare materia e creature.',
  druid:
    'Il druido della Piaga incarna la Carestia, il terzo Cavaliere. Il suo corpo decade e contagia: chi lo tocca si ammala, e la sua Forma Selvatica è già malata.',
  fighter:
    "Il furioso assalta con armi enormi come lo spadone fiammeggiante. Attacca ad area chi lo circonda, rinuncia alla difesa per colpire più forte e non teme la morte.",
  monk:
    'Il monaco dei Sette Sigilli si innesta nel petto sfere mistiche, una per sigillo aperto: fulmine, fiamma, veleno, gelo, resurrezione, eclissi e silenzio.',
  rogue:
    "Lo spettro dell'Assenzio è imbevuto di un veleno innaturale: evoca una coltre di vapori in cui si nasconde, avvelena chi colpisce di furtivo e infine svanisce nella nebbia.",
  paladin:
    'Il paladino della Fine del Mondo mostra ai nemici la loro fine e li spaventa. La sua aura di sconcerto rallenta chi è terrorizzato e lo fa colpire più facilmente.',
  ranger:
    'Il baluardo è il cecchino di frontiera: colubrina e armatura pesante, prende la mira restando immobile e al 15° livello decide di infliggere un critico.',
  sorcerer:
    "Lo stregone di Discendenza Ultraterrena ha un angelo o un demone fra gli antenati: la scelta decide se i suoi danni saranno radiosi o necrotici, e gli fa spuntare le ali.",
  warlock:
    'La warlock del Patto di Lilith serve la Madre dei Demoni, che incarna libertà e ribellione. Vola, usa il Carisma per colpire con le armi e non può essere soggiogata.',
  wizard:
    'Il mago della Scuola di Salomone vincola e comanda gli spiriti ultraterreni: evoca immondi e celestiali, e si scherma dietro uno schermo cabalistico.',
}

const BY_VARIANT: Record<GameVariant, Record<string, string>> = {
  dnd5e,
  brancalonia,
  apocalisse,
}

/** Blurb della classe per la variante in corso, con ricaduta su quello di D&D. */
export function getClassBlurb(variant: GameVariant, classId: string): string | undefined {
  return BY_VARIANT[variant]?.[classId] ?? dnd5e[classId]
}
