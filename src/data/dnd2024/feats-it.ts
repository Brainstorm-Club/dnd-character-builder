// Descrizioni italiane dei talenti di D&D 2024.
//
// Fonte: System Reference Document 5.2.1 in italiano (CC-BY-4.0), pagg. 98-100,
// la stessa edizione da cui vengono i testi inglesi in `feats.ts`. Le pagine
// sono state ritagliate una colonna per volta come per `classes-it.ts`: la
// linearizzazione della pagina intera è ciò che aveva rovinato il file inglese.
//
// Traduzione UFFICIALE del manuale, non riscritta: "tiro salvezza", "bonus di
// competenza", "azione bonus", "riposo breve/lungo", "vantaggio", "colpo
// senz'armi", "vista pura", "slot incantesimo". Le distanze sono in metri (18
// metri dove l'inglese dice 60 piedi, 9 dove dice 30), come nel testo italiano.
//
// ATTENZIONE ALL'EDIZIONE. Qui siamo nel 2024: i talenti sono divisi in
// categorie (Origini, Generale, Stile di combattimento, Dono epico) e gli
// Stili di combattimento sono diventati talenti a sé. Nel 2014 gli stili erano
// privilegi di classe e i talenti erano una regola opzionale: i due insiemi
// non vanno mescolati.
//
// I NOMI dei talenti non stanno qui ma in `src/i18n/gameTerms.ts`
// (featureNamesIt), insieme ai nomi dei privilegi: è un'unica mappa per tutta
// l'app, così il riepilogo e la scheda PDF non possono divergere.

export const dnd2024FeatDescriptionsIt: Record<string, string> = {
  // ═══ Talenti Origini ═══════════════════════════════════════════════
  'alert':
    'Il personaggio ottiene i seguenti benefici. Competenza in iniziativa. Quando tiri per l\'iniziativa, puoi aggiungere il bonus di competenza del personaggio al risultato del tiro. Scambio di iniziativa. Subito dopo aver tirato per l\'iniziativa, puoi scambiare il risultato ottenuto con quello di un alleato consenziente durante il medesimo combattimento. Se il tuo personaggio o il suo alleato è incapacitato, non è possibile eseguire lo scambio.',
  'magic-initiate':
    'Il personaggio ottiene i seguenti benefici. Due trucchetti. Il personaggio apprende due trucchetti a scelta tratti dalla lista degli incantesimi da chierico, druido o mago. La caratteristica da incantatore per gli incantesimi di questo talento può essere Intelligenza, Saggezza o Carisma (scegli la caratteristica quando ottieni questo talento). Incantesimo di 1° livello. Scegli un incantesimo di 1° livello dalla stessa lista da cui hai selezionato i trucchetti forniti da questo talento. Tale incantesimo è sempre considerato come preparato. Il personaggio può lanciarlo una volta senza consumare uno slot incantesimo e ne recupera l\'utilizzo in questo modo dopo aver completato un riposo lungo. Può anche lanciare l\'incantesimo usando uno qualsiasi degli slot incantesimo a sua disposizione. Cambio incantesimo. Quando il personaggio ottiene un nuovo livello, puoi sostituire uno degli incantesimi scelti per questo talento con un altro dello stesso livello dalla lista prescelta. Ripetibile. Questo talento è ottenibile più di una volta, ma devi scegliere una lista degli incantesimi diversa a ogni selezione.',
  'savage-attacker':
    'Il personaggio si è allenato per sferrare colpi particolarmente letali. Una volta per turno, quando colpisce un bersaglio con un\'arma, puoi tirare due volte per i danni dell\'arma e scegliere il risultato che preferisci.',
  'skilled':
    'Il personaggio ottiene competenza in una combinazione di tre abilità o strumenti a scelta. Ripetibile. Questo talento è ottenibile più di una volta.',

  // ═══ Talenti Generali ══════════════════════════════════════════════
  'ability-score-improvement':
    'Aumenta un punteggio di caratteristica a sua scelta di 2, oppure aumenta due punteggi di caratteristica di 1. Questo talento non può incrementare un punteggio di caratteristica oltre il 20. Ripetibile. Questo talento è ottenibile più di una volta.',
  'grappler':
    'Il personaggio ottiene i seguenti benefici. Incremento dei punteggi di caratteristica. Il suo punteggio di Forza o Destrezza aumenta di 1, fino a un massimo di 20. Colpisci e afferra. Quando il personaggio colpisce una creatura con un colpo senz\'armi come parte di un\'azione di Attacco nel proprio turno, può usare sia l\'opzione Danni che Presa. Questo beneficio è utilizzabile una sola volta per turno. Attacco con vantaggio. Dispone di vantaggio ai tiri per colpire contro le creature che ha afferrato. Lottatore rapido. Il personaggio non deve spendere alcun movimento extra se sposta una creatura che ha afferrato che sia della sua stessa categoria di taglia o inferiore.',

  // ═══ Talenti Stile di combattimento ════════════════════════════════
  'archery':
    'Il personaggio ottiene un bonus di +2 ai tiri per colpire che effettua con le armi a distanza.',
  'defense':
    'Finché il personaggio indossa un\'armatura leggera, media o pesante, ottiene un +1 alla Classe Armatura.',
  'great-weapon-fighting':
    'Quando tiri per i danni per un attacco effettuato con un\'arma da mischia che il personaggio impugna a due mani, se il risultato ottenuto è 1 o 2, puoi invece considerarlo come un 3. L\'arma deve possedere la proprietà a due mani o versatile affinché ottenga questo beneficio.',
  'two-weapon-fighting':
    'Quando il personaggio effettua un attacco extra come risultato dell\'uso di un\'arma leggera, puoi aggiungere il suo modificatore di caratteristica al danno di quell\'attacco a patto che non sia già stato aggiunto in altro modo.',

  // ═══ Talenti Dono epico ════════════════════════════════════════════
  'boon-of-combat-prowess':
    'Il personaggio ottiene i seguenti benefici. Incremento dei punteggi di caratteristica. Il punteggio di una sua caratteristica a scelta aumenta di 1, fino a un massimo di 30. Mira impareggiabile. Quando il tiro per colpire del personaggio non va a segno, è possibile colpire comunque il bersaglio. Una volta sfruttato questo beneficio, non può essere riutilizzato fino all\'inizio del turno successivo del personaggio.',
  'boon-of-dimensional-travel':
    'Il personaggio ottiene i seguenti benefici. Incremento dei punteggi di caratteristica. Il punteggio di una sua caratteristica a scelta aumenta di 1, fino a un massimo di 30. Passi fulminei. Subito dopo che il personaggio effettua un\'azione di Attacco o Magia, può teletrasportarsi di massimo 9 metri in uno spazio libero che è in grado di vedere.',
  'boon-of-fate':
    'Il personaggio ottiene i seguenti benefici. Incremento dei punteggi di caratteristica. Il punteggio di una sua caratteristica a scelta aumenta di 1, fino a un massimo di 30. Fato migliorato. Quando il personaggio o un\'altra creatura entro 18 metri da sé supera o fallisce una prova con d20, può tirare 2d4 e applicare il risultato ottenuto come bonus o penalità a tale prova con d20. Una volta utilizzato questo beneficio, non può più utilizzarlo finché non tira per l\'iniziativa o non completa un riposo breve o lungo.',
  'boon-of-irresistible-offense':
    'Il personaggio ottiene i seguenti benefici. Incremento dei punteggi di caratteristica. Il suo punteggio di Forza o Destrezza aumenta di 1, fino a un massimo di 30. Ignora difese. I danni contundenti, perforanti e taglienti inflitti dal personaggio ignorano sempre la resistenza. Colpo soverchiante. Quando tira per colpire con il d20 e ottiene un 20, il personaggio può infliggere una quantità di danni extra al bersaglio pari al punteggio di caratteristica incrementato da questo talento. Il danno aggiuntivo è dello stesso tipo di quello dell\'attacco.',
  'boon-of-spell-recall':
    'Il personaggio ottiene i seguenti benefici. Incremento dei punteggi di caratteristica. Il suo punteggio di Intelligenza, Saggezza o Carisma aumenta di 1, fino a un massimo di 30. Lancio libero. Quando lancia un incantesimo con uno slot di livello da 1 a 4, tira 1d4. Se il risultato corrisponde al livello dello slot, questo non verrà consumato.',
  'boon-of-the-night-spirit':
    'Il personaggio ottiene i seguenti benefici. Incremento dei punteggi di caratteristica. Il punteggio di una sua caratteristica a scelta aumenta di 1, fino a un massimo di 30. Fusione con le ombre. Finché si trova in un\'area di oscurità o luce fioca, può diventare invisibile come azione bonus. Tale condizione termina subito dopo che il personaggio effettua un\'azione, un\'azione bonus o una reazione. Forma d\'ombra. Finché si trova in un\'area di oscurità o luce fioca, ha resistenza a tutti i tipi di danno, tranne quelli psichici e radiosi.',
  'boon-of-truesight':
    'Il personaggio ottiene i seguenti benefici. Incremento dei punteggi di caratteristica. Il punteggio di una sua caratteristica a scelta aumenta di 1, fino a un massimo di 30. Vista pura. Il personaggio ottiene vista pura con un raggio di 18 metri.',
}

/**
 * Descrizione del talento nella lingua richiesta.
 *
 * Fuori dall'italiano si torna al testo inglese di `feats.ts`: è la stessa
 * regola che `getFeatureDescription` applica ai privilegi di classe, e serve
 * perché la scheda non accosti due lingue nella stessa schermata.
 */
export function getDnd2024FeatDescription(featId: string, locale: string, fallback: string): string {
  if (locale !== 'it') return fallback
  return dnd2024FeatDescriptionsIt[featId] ?? fallback
}
