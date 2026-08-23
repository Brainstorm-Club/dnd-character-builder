/**
 * Accorgersi che e' uscita una versione nuova, e ripartire da quella.
 *
 * Il service worker serve i file dal precache, e finche' resta in carica
 * quello vecchio il visitatore vede la versione vecchia — anche se il sito
 * pubblicato e' cambiato da settimane. La configurazione ora dice al worker
 * nuovo di non mettersi in coda (`skipWaiting`) e di prendere in carico
 * subito le pagine gia' aperte (`clientsClaim`), ma questo non basta: la
 * pagina aperta continua a girare col JavaScript vecchio, che e' gia' in
 * memoria. Anzi, e' proprio il caso pericoloso — il precache vecchio e'
 * stato appena cancellato, quindi il primo pezzo caricato pigramente da
 * quella pagina (un passo del wizard, il modulo del PDF) non esiste piu' ne'
 * in cache ne' sul sito, dove il build nuovo ha nomi diversi. Si otterrebbe
 * una pagina viva che si rompe al primo clic.
 *
 * Da qui il ricaricamento: quando il worker nuovo prende il controllo, la
 * pagina riparte intera e coerente con lui.
 *
 * Le schede non rischiano nulla. Vivono in `localStorage`, che il service
 * worker non tocca — lui lavora sulla Cache API, un deposito separato — e che
 * un ricaricamento non svuota. Anche il personaggio a meta' procedura torna
 * al suo posto, perche' lo store lo riscrive in `localStorage` a ogni
 * modifica: si riparte dal passo dov'era.
 */

/** Ogni quanto richiedere al browser di ricontrollare il worker. */
export const INTERVALLO_CONTROLLO_MS = 60 * 60 * 1000

export interface OpzioniAggiornamento {
  /** Il registro dei service worker. Assente = browser che non li ha. */
  readonly sw?: ServiceWorkerContainer
  /** Che cosa fare quando arriva la versione nuova. */
  readonly ricarica: () => void
  /** Programma il controllo periodico. Iniettabile per poterlo verificare. */
  readonly programma?: (azione: () => void, ms: number) => unknown
}

/**
 * Mette in ascolto la pagina. Torna una funzione che smette di ascoltare.
 *
 * Il primo cambio di controllore alla primissima visita non e' un
 * aggiornamento: e' il worker che entra in carica per la prima volta su una
 * pagina che non ne aveva. Ricaricare li' vorrebbe dire sbattere in faccia un
 * lampo a chi arriva per la prima volta, senza motivo. Per questo si guarda
 * se un controllore c'era gia'.
 */
export function sorvegliaAggiornamenti(opz: OpzioniAggiornamento): () => void {
  const { sw, ricarica, programma } = opz
  if (!sw) return () => {}

  const avevaUnControllore = !!sw.controller
  let giaRicaricato = false

  const alCambio = () => {
    if (!avevaUnControllore || giaRicaricato) return
    giaRicaricato = true
    ricarica()
  }
  sw.addEventListener('controllerchange', alCambio)

  // Il browser ricontrolla `sw.js` alla navigazione, e per conto suo non piu'
  // di una volta al giorno. Una PWA installata e lasciata aperta puo' quindi
  // restare indietro di giorni senza accorgersene: il controllo periodico e'
  // il solo modo perche' se ne avveda da sola. E' una richiesta condizionale a
  // un file di pochi KB, una volta all'ora.
  if (programma) {
    programma(() => {
      void sw.getRegistration?.().then(reg => reg?.update()).catch(() => {})
    }, INTERVALLO_CONTROLLO_MS)
  }

  return () => sw.removeEventListener('controllerchange', alCambio)
}
