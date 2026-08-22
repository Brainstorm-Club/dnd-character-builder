// Descrizioni italiane delle mosse da rissa.
// Fonte: Brancalonia — Manuale di Ambientazione 2.6, capitolo "Rissa".
// I nomi stanno già in brawl.ts come `nameOriginal`: qui solo il testo.

export const brawlDescriptionsIt: Record<string, string> = {
  // ─── Mosse generiche e magiche ────────────────────────────────────
  'bouncer':
    'Come reazione, quando il personaggio viene colpito da un attacco, può effettuare un tiro per colpire (Forza o Destrezza) contro l\'avversario: se colpisce, il bersaglio è stordito.',
  'diving-drop':
    'Come azione, un tiro per colpire (Forza o Costituzione): se colpisce, infligge 1 batosta e il bersaglio è stordito e prono. Il personaggio subisce 1 batosta.',
  'feint':
    'Come azione, il personaggio può fingersi svenuto. Finché non attacca non può essere bersagliato da nessuno nella rissa, ma resta soggetto ai Pericoli Vaganti.',
  'slop-is-served':
    'Come azione bonus, un tiro per colpire (Destrezza o Saggezza): se colpisce, il bersaglio è accecato.',
  'clothesline':
    'Come azione, un tiro per colpire (Forza o Destrezza): se colpisce, infligge 1 batosta e il bersaglio cade prono.',
  'head-smasher':
    'Come azione, un tiro per colpire (Forza o Costituzione) contro due bersagli diversi, tirando contro la CA più alta: se colpisce, infligge 1 batosta a entrambi.',
  'for-the-bounty':
    'Come azione, tutte le creature amiche nella rissa dispongono di vantaggio alla loro prossima mossa o saccagnata.',
  'under-the-table':
    'Come azione, il personaggio si mette in copertura ottenendo +5 alla CA e ai tiri salvezza su Destrezza.',
  'tripping':
    'Come azione bonus, un tiro per colpire (Destrezza o Intelligenza): se colpisce, il bersaglio cade prono.',
  'drop-them-pants':
    'Come azione bonus, un tiro per colpire (Destrezza o Carisma): se colpisce, il bersaglio è trattenuto.',
  'hammer-slam':
    'Come azione, un tiro per colpire (Forza o Costituzione): se colpisce, infligge 1 batosta e il bersaglio è incapacitato.',
  'headbutt':
    'Come reazione, quando il personaggio viene colpito da un attacco, può effettuare un tiro per colpire (Forza o Costituzione) contro l\'avversario: se colpisce, infligge 1 batosta.',
  'protection-from-kicks-and-blows':
    'Come azione, il personaggio sceglie un bersaglio: fino alla fine del suo prossimo turno, tutti gli attacchi contro di esso subiscono svantaggio.',
  'fetor-spray':
    'Come azione, un tiro per colpire (Intelligenza, Saggezza o Carisma): se colpisce, infligge 1 batosta e il bersaglio è avvelenato.',
  'insane-scream':
    'Come azione, il personaggio sceglie una creatura, che diventa spaventata da lui.',
  'eyes-on-me':
    'Come azione, il personaggio sceglie una creatura, che diventa affascinata da lui.',
  'cool-down':
    'Come azione, il personaggio sceglie una creatura: il bersaglio non può muoversi, diviene incapacitato e fino alla fine del suo prossimo turno non subisce batoste né condizioni.',
  'magic-fist-fight':
    'Come azione, tre tiri per colpire (Intelligenza, Saggezza o Carisma) contro tre bersagli diversi: infligge 1 batosta a ogni bersaglio colpito.',
  'dodgevoiance':
    'Quando il personaggio è attaccato da una creatura, può usare la sua reazione per infliggere svantaggio al tiro per colpire dell\'attaccante.',
  'spiritual-stool':
    'Come azione bonus, il personaggio può trasformare un oggetto di scena comune in un oggetto di scena epico.',

  // ─── Mosse di classe ──────────────────────────────────────────────
  'enraged-and-furious':
    'Per questo turno, le mosse e le saccagnate del barbaro infliggono 1 batosta aggiuntiva.',
  'kung-fusion':
    'Quando il bardo è attaccato da una creatura, può usare la sua reazione per effettuare un tiro per colpire (Carisma) contro di essa: se colpisce, la creatura deve scegliere un nuovo bersaglio a portata per il suo attacco. Si usa prima del tiro della creatura.',
  sacrum:
    'Come azione, il chierico effettua un tiro per colpire (Saggezza) che infligge 1 batosta e fa cadere prono il bersaglio.',
  'beast-slap':
    'Come azione, il druido effettua un tiro per colpire (Saggezza) che infligge 1 batosta e rende il bersaglio spaventato da lui.',
  counterattack:
    'Quando il guerriero è attaccato da una creatura, può usare la sua reazione per effettuare una saccagnata contro l\'attaccante: se colpisce, quello porta il proprio attacco subendo svantaggio.',
  'flurry-of-slaps': 'Come azione bonus, il monaco può effettuare due saccagnate.',
  'the-wine-smite':
    'Come azione bonus, il paladino effettua un tiro per colpire (Forza) che infligge 1 batosta e acceca il bersaglio.',
  'the-call-of-the-wild':
    'Come azione, il ranger lancia un\'esca su un bersaglio, che viene intralciato da un animale: resta trattenuto finché non infligge 1 batosta all\'animale.',
  'sneak-awhack':
    'Come azione bonus, la prossima mossa o saccagnata del ladro infligge 1 batosta aggiuntiva e viene portata con vantaggio.',
  'arcane-blow':
    'Quando usa una mossa magica, il personaggio può spendere uno slot mossa aggiuntivo per infliggere 1 batosta in più.',

  // ─── Assi nella manica (6° livello) ───────────────────────────────
  'float-like-a-butterfly':
    'Fino all\'inizio del suo prossimo turno, il barbaro non può subire batoste né condizioni.',
  'heartbreaking-note':
    'Come azione, il bardo emette un urlo straziante: ogni partecipante alla rissa deve superare un tiro salvezza su Costituzione, altrimenti subisce 1 batosta e diventa incapacitato. Le creature amiche effettuano il tiro con vantaggio.',
  'if-you-re-listening-help':
    'Come azione, il chierico prega i santi e un Pericolo Vagante casuale colpisce tutti i suoi nemici.',
  'pollen-dust':
    'Come azione, il druido disperde una nube di polline irritante: ogni partecipante alla rissa deve superare un tiro salvezza su Costituzione, altrimenti subisce 1 batosta e diventa avvelenato. Le creature amiche effettuano il tiro con vantaggio.',
  'vorpal-punch': 'Il guerriero può effettuare una saccagnata che infligge 3 batoste aggiuntive.',
  'kneel-and-pray':
    'Il monaco può effettuare una saccagnata che infligge 1 batosta aggiuntiva; se colpisce, il bersaglio deve superare un tiro salvezza su Costituzione o cadere a terra come se avesse subito il suo massimo di batoste.',
  'special-mount':
    'Il paladino richiama la sua cavalcatura, che effettua due saccagnate usando il bonus al colpire del paladino, per poi andarsene.',
  'it-s-a-trap':
    'Quando una creatura si muove nella rissa, il ranger può usare la sua reazione per attivare una trappola che le infligge 2 batoste e la condizione trattenuto.',
  'sting-like-a-bee':
    'Quando il ladro è attaccato da una creatura, può usare la sua reazione per evitare l\'attacco ed effettuare una saccagnata che infligge 1 batosta aggiuntiva contro l\'attaccante.',
  'supreme-misfortune':
    'Come azione, lo stregone attiva volutamente una superstizione negativa di portata colossale: ogni partecipante alla rissa deve superare un tiro salvezza su Saggezza, altrimenti lascia cadere ciò che tiene in mano e diventa spaventato. Le creature amiche effettuano il tiro con vantaggio.',
  'remorse-touch':
    'Fino all\'inizio del prossimo turno del warlock, ogni volta che un avversario infligge 1 batosta a lui o a una creatura amica, quell\'avversario subisce 1 batosta.',
  'fire-bowl':
    'Come azione, il mago scaglia una palla di brodo bollente: ogni partecipante alla rissa deve superare un tiro salvezza su Destrezza, altrimenti subisce 2 batoste. Le creature amiche effettuano il tiro con vantaggio.',
}
